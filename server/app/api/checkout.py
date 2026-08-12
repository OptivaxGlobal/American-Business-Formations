import uuid

from flask import Blueprint, request, current_app
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db, limiter
from ..models import Order, OrderItem, Payment, Business, User, AuditLog, Package, AddOn, StatusHistory, ORDER_STATUSES_PAYABLE_FROM
from ..services.payments import create_checkout_session, verify_webhook_signature, PaymentsNotConfigured
from ..services.states import get_state_config
from ..services.email import send_email
from ..utils import ok, error
from .notifications import notify_user

bp = Blueprint("checkout", __name__, url_prefix="/api")


def _order_number():
    return f"ABF-{uuid.uuid4().hex[:8].upper()}"


AWAITING_PAYMENT_MESSAGE = (
    "Your formation order has been received. Online payment is temporarily "
    "unavailable. Our team will contact you with the secure payment and "
    "next-step details."
)


def _order_response(order, checkout_url=None, message=None, status_code=200):
    payload = {"order": order.to_dict(), "checkout_url": checkout_url}
    if message:
        payload["message"] = message
    return ok(payload, status_code)


@bp.post("/checkout/session")
@jwt_required()
@limiter.limit("20 per hour")
def create_session():
    """Creates (or, for a repeated idempotency_key, returns) an order priced
    entirely from server-side data. The request only ever supplies
    identifiers (business_id, package_id, add_on_ids) never a price. This
    is the one place order totals are decided; nothing here trusts a number
    the browser sent."""
    data = request.get_json(silent=True) or {}
    user_id = get_jwt_identity()
    business_id = data.get("business_id")
    package_id = data.get("package_id")
    add_on_ids = data.get("add_on_ids") or []
    idempotency_key = data.get("idempotency_key") or uuid.uuid4().hex

    # A retry (dropped connection, double-click, page refresh) with the same
    # key must be a safe no-op that returns the same order, not an error the
    # customer has to interpret or a second order being created.
    existing = Order.query.filter_by(idempotency_key=idempotency_key).first()
    if existing:
        return _order_response(existing, checkout_url=None, message=AWAITING_PAYMENT_MESSAGE if existing.status == "awaiting_payment" else None)

    if not isinstance(add_on_ids, list):
        return error("Please correct the highlighted fields.", 422, field_errors={"add_on_ids": "Invalid selection."})

    business = None
    if business_id:
        business = Business.query.filter_by(id=business_id, owner_id=user_id).first()
        if not business:
            return error("Not found", 404)

    package = None
    if package_id:
        package = Package.query.filter_by(name=package_id, active=True).first()
        if not package:
            return error("Please correct the highlighted fields.", 422, field_errors={"package_id": "This package is not available."})

    add_ons = []
    if add_on_ids:
        add_ons = AddOn.query.filter(AddOn.slug.in_(add_on_ids), AddOn.active.is_(True)).all()
        found_slugs = {a.slug for a in add_ons}
        missing = [slug for slug in add_on_ids if slug not in found_slugs]
        if missing:
            return error("Please correct the highlighted fields.", 422,
                         field_errors={"add_on_ids": f"Not available: {', '.join(missing)}"})

    # A package always bundles a real LLC formation, which always has a
    # formation state — the fee for that state, and only that state, is
    # what gets charged. Nothing about the fee is ever read from the
    # request body; `business.state` (set when the business was created/
    # saved, validated against the same supported-state list there) is the
    # only input, and the actual cents value always comes from
    # services/states.py looked up by that code.
    state_config = None
    if package:
        if not business:
            return error("Please correct the highlighted fields.", 422, field_errors={"business_id": "A business with a formation state is required to price this package."})
        state_config = get_state_config(business.state)
        if not state_config:
            return error("Please correct the highlighted fields.", 422, field_errors={"state": f"LLC formation is not currently available in {business.state!r}."})
    state_fee_cents = state_config["llc_formation_fee_cents"] if state_config else 0

    order = Order(
        order_number=_order_number(),
        user_id=user_id,
        business_id=business.id if business else None,
        status="pending",
        idempotency_key=idempotency_key,
    )
    db.session.add(order)
    db.session.flush()

    if package:
        db.session.add(OrderItem(order_id=order.id, item_type="plan", name=package.name, price_cents=package.price_cents))
    if state_fee_cents:
        db.session.add(OrderItem(order_id=order.id, item_type="state_fee", name=f"{state_config['name']} state filing fee", price_cents=state_fee_cents))
    for add_on in add_ons:
        db.session.add(OrderItem(order_id=order.id, item_type="add_on", name=add_on.name, price_cents=add_on.price_cents))

    order.service_fee_cents = package.price_cents if package else 0
    order.state_fee_cents = state_fee_cents
    order.add_on_fee_cents = sum(a.price_cents for a in add_ons)
    order.total_cents = order.service_fee_cents + order.state_fee_cents + order.add_on_fee_cents
    db.session.commit()

    user = User.query.get(user_id)
    try:
        session = create_checkout_session(
            order,
            success_url=f"{current_app.config['FRONTEND_ORIGIN']}/formation-details?checkout=success&order={order.id}",
            cancel_url=f"{current_app.config['FRONTEND_ORIGIN']}/formation-details?checkout=cancelled",
            customer_email=user.email,
        )
        order.stripe_checkout_session_id = session.id
        db.session.commit()
        return _order_response(order, checkout_url=session.url)
    except PaymentsNotConfigured:
        # No payment provider is connected yet. The order is saved as
        # awaiting_payment with an explicit not_collected payment record —
        # never "pending" (ambiguous) and never "paid". Support follows up
        # to arrange payment separately; nothing here simulates a charge.
        order.status = "awaiting_payment"
        db.session.add(Payment(order_id=order.id, provider="none", status="not_collected", amount_cents=order.total_cents))
        db.session.add(StatusHistory(entity_type="order", entity_id=order.id, from_status="pending", to_status="awaiting_payment", changed_by=user_id))
        db.session.add(AuditLog(actor_id=user_id, action="Order awaiting payment (payments not configured)", details=order.order_number))
        db.session.commit()

        send_email("admin_order_notification", current_app.config["SUPPORT_EMAIL"], {
            "order_number": order.order_number, "total": order.total_cents / 100,
            "customer_email": user.email, "support_email": current_app.config["SUPPORT_EMAIL"],
        })
        send_email("order_awaiting_payment", user.email, {
            "order_number": order.order_number, "total": order.total_cents / 100,
            "support_email": current_app.config["SUPPORT_EMAIL"],
        })
        notify_user(user_id, "Order received payment pending", f"Order {order.order_number} is awaiting payment. Our team will be in touch.", link="/dashboard/billing")
        db.session.commit()
        return _order_response(order, checkout_url=None, message=AWAITING_PAYMENT_MESSAGE, status_code=202)


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
        # Guards against a stray/duplicate webhook flipping an order that's
        # already paid, or one that's since been refunded/cancelled, back to
        # "paid" the raw_event_id check above already stops the exact same
        # event from being processed twice, but this stops a *different*
        # event (e.g. a resent/duplicated session) from doing the same thing
        # via a different event id.
        if order and order.status in ORDER_STATUSES_PAYABLE_FROM:
            order.status = "paid"
            db.session.add(Payment(
                order_id=order.id, provider="stripe", provider_payment_id=session_obj.get("payment_intent"),
                status="succeeded", amount_cents=order.total_cents, raw_event_id=event_id,
            ))
            db.session.add(AuditLog(action="Payment succeeded (webhook)", details=order.order_number))
            db.session.commit()
            user = User.query.get(order.user_id)
            order_business = Business.query.get(order.business_id) if order.business_id else None
            order_state = get_state_config(order_business.state) if order_business else None
            send_email("payment_received", user.email, {
                "order_number": order.order_number, "state_name": order_state["name"] if order_state else None,
                "service_fee": order.service_fee_cents / 100, "state_fee": order.state_fee_cents / 100,
                "add_on_fee": order.add_on_fee_cents / 100, "total": order.total_cents / 100,
                "support_email": current_app.config["SUPPORT_EMAIL"],
            })
    elif event_type == "payment_intent.payment_failed":
        payment_intent_id = session_obj.get("id")
        order = Order.query.join(Payment).filter(Payment.provider_payment_id == payment_intent_id).first()
        # A failed-payment event for an order that's already paid means a
        # separate, earlier attempt succeeded never let a stray/reordered
        # webhook downgrade an already-paid order back to "failed".
        if order and order.status != "paid":
            order.status = "failed"
            db.session.add(AuditLog(action="Payment failed (webhook)", details=order.order_number))
            db.session.commit()

    return ok({"received": True})
