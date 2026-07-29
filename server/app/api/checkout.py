import uuid

from flask import Blueprint, request, current_app
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db, limiter
from ..models import Order, OrderItem, Payment, Business, User, AuditLog
from ..services.payments import create_checkout_session, verify_webhook_signature, PaymentsNotConfigured
from ..services.email import send_email
from ..utils import ok, error, sanitize_text

bp = Blueprint("checkout", __name__, url_prefix="/api")


def _order_number():
    return f"ABF-{uuid.uuid4().hex[:8].upper()}"


@bp.post("/checkout/session")
@jwt_required()
@limiter.limit("20 per hour")
def create_session():
    data = request.get_json(silent=True) or {}
    user_id = get_jwt_identity()
    business_id = data.get("business_id")
    items = data.get("items") or []  # [{type, name, price_cents}]
    idempotency_key = data.get("idempotency_key") or uuid.uuid4().hex

    if Order.query.filter_by(idempotency_key=idempotency_key).first():
        return error("This order has already been submitted.", 409)
    if not items or not isinstance(items, list):
        return error("At least one line item is required.", 422)

    ALLOWED_ITEM_TYPES = ("plan", "state_fee", "add_on")
    parsed_items = []
    for i, item in enumerate(items):
        if not isinstance(item, dict):
            return error("Please correct the highlighted fields.", 422, field_errors={f"items[{i}]": "Invalid line item."})
        item_type = item.get("type")
        if item_type not in ALLOWED_ITEM_TYPES:
            return error("Please correct the highlighted fields.", 422, field_errors={f"items[{i}].type": "Invalid item type."})
        try:
            price_cents = int(item.get("price_cents", 0))
        except (TypeError, ValueError):
            return error("Please correct the highlighted fields.", 422, field_errors={f"items[{i}].price_cents": "Enter a valid amount."})
        if price_cents < 0:
            return error("Please correct the highlighted fields.", 422, field_errors={f"items[{i}].price_cents": "Amount cannot be negative."})
        parsed_items.append((item_type, sanitize_text(item.get("name"), 200), price_cents))

    business = Business.query.filter_by(id=business_id, owner_id=user_id).first() if business_id else None

    order = Order(
        order_number=_order_number(),
        user_id=user_id,
        business_id=business.id if business else None,
        status="pending",
        idempotency_key=idempotency_key,
    )
    db.session.add(order)
    db.session.flush()

    totals = {"plan": 0, "state_fee": 0, "add_on": 0}
    for item_type, name, price_cents in parsed_items:
        db.session.add(OrderItem(order_id=order.id, item_type=item_type, name=name, price_cents=price_cents))
        key = "state_fee" if item_type == "state_fee" else ("add_on" if item_type == "add_on" else "plan")
        totals[key] += price_cents

    order.service_fee_cents = totals["plan"]
    order.state_fee_cents = totals["state_fee"]
    order.add_on_fee_cents = totals["add_on"]
    order.total_cents = totals["plan"] + totals["state_fee"] + totals["add_on"]
    db.session.commit()

    user = User.query.get(user_id)
    try:
        session = create_checkout_session(
            order,
            success_url=f"{current_app.config['FRONTEND_ORIGIN']}/formation-details?checkout=success&order={order.order_number}",
            cancel_url=f"{current_app.config['FRONTEND_ORIGIN']}/formation-details?checkout=cancelled",
            customer_email=user.email,
        )
        order.stripe_checkout_session_id = session.id
        db.session.commit()
        return ok({"order": order.to_dict(), "checkout_url": session.url})
    except PaymentsNotConfigured:
        # Order is recorded as pending; no payment provider is connected yet.
        # The order will not be marked paid until a real webhook confirms it.
        return ok({"order": order.to_dict(), "checkout_url": None,
                   "message": "Payments are not yet configured on this server (missing Stripe keys)."}, 202)


@bp.post("/webhooks/stripe")
def stripe_webhook():
    payload = request.get_data()
    sig_header = request.headers.get("Stripe-Signature", "")

    try:
        event = verify_webhook_signature(payload, sig_header)
    except PaymentsNotConfigured:
        return error("Stripe is not configured on this server.", 501)
    except Exception:  # noqa: BLE001 - invalid signature or payload
        return error("Invalid webhook signature.", 400)

    event_id = event["id"]
    if Payment.query.filter_by(raw_event_id=event_id).first():
        return ok({"received": True})  # already processed idempotent

    event_type = event["type"]
    session_obj = event["data"]["object"]

    if event_type == "checkout.session.completed":
        order = Order.query.filter_by(stripe_checkout_session_id=session_obj["id"]).first()
        if order:
            order.status = "paid"
            db.session.add(Payment(
                order_id=order.id, provider="stripe", provider_payment_id=session_obj.get("payment_intent"),
                status="succeeded", amount_cents=order.total_cents, raw_event_id=event_id,
            ))
            db.session.add(AuditLog(action="Payment succeeded (webhook)", details=order.order_number))
            db.session.commit()
            user = User.query.get(order.user_id)
            send_email("payment_received", user.email, {
                "order_number": order.order_number,
                "service_fee": order.service_fee_cents / 100, "state_fee": order.state_fee_cents / 100,
                "add_on_fee": order.add_on_fee_cents / 100, "total": order.total_cents / 100,
                "support_email": current_app.config["SUPPORT_EMAIL"],
            })
    elif event_type == "payment_intent.payment_failed":
        payment_intent_id = session_obj.get("id")
        order = Order.query.join(Payment).filter(Payment.provider_payment_id == payment_intent_id).first()
        if order:
            order.status = "failed"
            db.session.add(AuditLog(action="Payment failed (webhook)", details=order.order_number))
            db.session.commit()

    return ok({"received": True})
