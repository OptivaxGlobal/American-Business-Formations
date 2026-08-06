from flask import Blueprint, request, current_app
from flask_jwt_extended import get_jwt_identity

from ..extensions import db
from ..models import (
    Business, FormationApplication, Order, Payment, User, Lead, SupportThread, SupportMessage,
    Package, AddOn, AuditLog, StatusHistory, Testimonial, FAQ, SiteSetting,
    APPLICATION_STATUSES, LEAD_STATUSES, ORDER_STATUSES_PAYABLE_FROM,
)
from ..services.email import send_email
from ..utils import ok, error, sanitize_text
from ..validations.admin import validate_admin_text, validate_price_cents
from ..validations.common import collect, validate_choice
from ..validations.contact import validate_full_name
from ..api.notifications import notify_user
from .decorators import admin_required

bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def _log(action, details=""):
    actor_id = get_jwt_identity()
    actor = User.query.get(actor_id)
    db.session.add(AuditLog(actor_id=actor_id, actor_label=actor.email if actor else None, action=action, details=details))
    db.session.commit()


@bp.get("/overview")
@admin_required
def overview():
    return ok({
        "leads": Lead.query.count(),
        "applications": Business.query.count(),
        "applications_needing_review": Business.query.filter(Business.status.in_(["submitted", "under_review"])).count(),
        "orders_paid": Order.query.filter_by(status="paid").count(),
        "revenue_cents": db.session.query(db.func.coalesce(db.func.sum(Order.total_cents), 0)).filter(Order.status == "paid").scalar(),
        "open_support_threads": SupportThread.query.filter_by(status="open").count(),
    })


@bp.get("/leads")
@admin_required
def list_leads():
    leads = Lead.query.order_by(Lead.created_at.desc()).limit(200).all()
    return ok([l.to_dict() for l in leads])


@bp.patch("/leads/<lead_id>")
@admin_required
def update_lead(lead_id):
    lead = Lead.query.get(lead_id)
    if not lead:
        return error("Not found", 404)
    data = request.get_json(silent=True) or {}
    if "status" in data:
        _, status_err = validate_choice(data["status"], LEAD_STATUSES, f"Status must be one of: {', '.join(LEAD_STATUSES)}")
        if status_err:
            return error("Please correct the highlighted fields.", 422, field_errors={"status": status_err})
        lead.status = data["status"]
    if "notes" in data:
        lead.notes = sanitize_text(data["notes"], 2000)
    db.session.commit()
    _log("Updated lead", lead_id)
    return ok(lead.to_dict())


@bp.get("/applications")
@admin_required
def list_applications():
    businesses = Business.query.order_by(Business.created_at.desc()).limit(200).all()
    return ok([b.to_dict() for b in businesses])


@bp.patch("/applications/<business_id>/status")
@admin_required
def update_application_status(business_id):
    business = Business.query.get(business_id)
    if not business:
        return error("Not found", 404)
    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if status not in APPLICATION_STATUSES:
        return error(f"Status must be one of: {', '.join(APPLICATION_STATUSES)}", 422)
    business.status = status
    db.session.commit()
    _log("Updated application status", f"{business_id} -> {status}")
    return ok(business.to_dict())


@bp.get("/customers")
@admin_required
def list_customers():
    users = User.query.filter_by(role="customer").order_by(User.created_at.desc()).limit(200).all()
    return ok([u.to_dict() for u in users])


@bp.get("/orders")
@admin_required
def list_orders():
    orders = Order.query.order_by(Order.created_at.desc()).limit(200).all()
    return ok([o.to_dict() for o in orders])


@bp.get("/plans")
@admin_required
def list_plans():
    return ok({
        "packages": [p.to_dict() for p in Package.query.order_by(Package.sort_order).all()],
        "add_ons": [a.to_dict() for a in AddOn.query.all()],
    })


@bp.patch("/plans/packages/<package_id>")
@admin_required
def update_package(package_id):
    package = Package.query.get(package_id)
    if not package:
        return error("Not found", 404)
    data = request.get_json(silent=True) or {}

    name_value, name_err = (validate_admin_text(data["name"], required=True, minimum=2, maximum=80)
                             if "name" in data else (None, None))
    price_value, price_err = (validate_price_cents(data["price_cents"], minimum=0, maximum=10_000_000)
                               if "price_cents" in data else (None, None))
    field_errors = {k: v for k, v in {"name": name_err, "price_cents": price_err}.items() if v}
    if field_errors:
        return error("Please correct the highlighted fields.", 422, field_errors=field_errors)

    if name_value is not None:
        package.name = name_value
    if price_value is not None:
        package.price_cents = price_value
    for field in ("billing_note", "description"):
        if field in data:
            setattr(package, field, sanitize_text(data[field], 400))
    if "features" in data and isinstance(data["features"], list):
        package.features = data["features"]
    if "is_popular" in data:
        package.is_popular = bool(data["is_popular"])
    db.session.commit()
    _log("Updated package pricing", package_id)
    return ok(package.to_dict())


@bp.get("/content/site-settings")
@admin_required
def get_site_settings():
    settings = SiteSetting.query.all()
    return ok({s.key: s.value for s in settings})


@bp.put("/content/site-settings/<key>")
@admin_required
def set_site_setting(key):
    data = request.get_json(silent=True) or {}
    setting = SiteSetting.query.filter_by(key=key).first()
    if not setting:
        setting = SiteSetting(key=key, value=data.get("value"))
        db.session.add(setting)
    else:
        setting.value = data.get("value")
    db.session.commit()
    _log("Updated site setting", key)
    return ok({key: setting.value})


@bp.get("/content/testimonials")
@admin_required
def list_testimonials():
    return ok([{
        "id": t.id, "customer_name": t.customer_name, "customer_role": t.customer_role,
        "quote": t.quote, "verified": t.verified, "published": t.published,
    } for t in Testimonial.query.all()])


@bp.post("/content/testimonials")
@admin_required
def create_testimonial():
    data = request.get_json(silent=True) or {}
    values, errors = collect({
        "customer_name": validate_full_name(data.get("customer_name"), required=True),
        "quote": validate_admin_text(data.get("quote"), required=True, minimum=10, maximum=2000),
    })
    if errors:
        return error("Please correct the highlighted fields.", 422, field_errors=errors)

    testimonial = Testimonial(
        customer_name=values["customer_name"],
        customer_role=sanitize_text(data.get("customer_role"), 160),
        quote=values["quote"],
        verified=bool(data.get("verified")),
        published=bool(data.get("verified")) and bool(data.get("published")),  # never publish unverified
    )
    db.session.add(testimonial)
    db.session.commit()
    _log("Created testimonial", testimonial.id)
    return ok({"id": testimonial.id}, 201)


@bp.patch("/content/testimonials/<testimonial_id>")
@admin_required
def update_testimonial(testimonial_id):
    testimonial = Testimonial.query.get(testimonial_id)
    if not testimonial:
        return error("Not found", 404)
    data = request.get_json(silent=True) or {}

    name_value, name_err = (validate_full_name(data["customer_name"], required=True)
                             if "customer_name" in data else (None, None))
    quote_value, quote_err = (validate_admin_text(data["quote"], required=True, minimum=10, maximum=2000)
                               if "quote" in data else (None, None))
    field_errors = {k: v for k, v in {"customer_name": name_err, "quote": quote_err}.items() if v}
    if field_errors:
        return error("Please correct the highlighted fields.", 422, field_errors=field_errors)

    if name_value is not None:
        testimonial.customer_name = name_value
    if quote_value is not None:
        testimonial.quote = quote_value
    if "customer_role" in data:
        testimonial.customer_role = sanitize_text(data["customer_role"], 160)
    if "verified" in data:
        testimonial.verified = bool(data["verified"])
    if "published" in data:
        # Never publish an unverified testimonial, regardless of what the
        # request asks for verified is decided by this same payload above,
        # so re-check the resulting value rather than the pre-update one.
        testimonial.published = bool(data["published"]) and testimonial.verified
    db.session.commit()
    _log("Updated testimonial", testimonial_id)
    return ok({
        "id": testimonial.id, "customer_name": testimonial.customer_name, "customer_role": testimonial.customer_role,
        "quote": testimonial.quote, "verified": testimonial.verified, "published": testimonial.published,
    })


@bp.delete("/content/testimonials/<testimonial_id>")
@admin_required
def delete_testimonial(testimonial_id):
    testimonial = Testimonial.query.get(testimonial_id)
    if not testimonial:
        return error("Not found", 404)
    db.session.delete(testimonial)
    db.session.commit()
    _log("Deleted testimonial", testimonial_id)
    return ok({"deleted": True})


@bp.get("/content/faqs")
@admin_required
def list_faqs():
    return ok([{"id": f.id, "question": f.question, "answer": f.answer, "category": f.category} for f in FAQ.query.all()])


@bp.get("/audit-log")
@admin_required
def audit_log():
    logs = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(200).all()
    return ok([l.to_dict() for l in logs])


@bp.patch("/plans/add-ons/<add_on_id>")
@admin_required
def update_add_on(add_on_id):
    add_on = AddOn.query.get(add_on_id)
    if not add_on:
        return error("Not found", 404)
    data = request.get_json(silent=True) or {}

    name_value, name_err = (validate_admin_text(data["name"], required=True, minimum=2, maximum=160)
                             if "name" in data else (None, None))
    price_value, price_err = (validate_price_cents(data["price_cents"], minimum=0, maximum=10_000_000)
                               if "price_cents" in data else (None, None))
    field_errors = {k: v for k, v in {"name": name_err, "price_cents": price_err}.items() if v}
    if field_errors:
        return error("Please correct the highlighted fields.", 422, field_errors=field_errors)

    if name_value is not None:
        add_on.name = name_value
    if price_value is not None:
        add_on.price_cents = price_value
    if "recurring" in data:
        add_on.recurring = bool(data["recurring"])
    if "active" in data:
        add_on.active = bool(data["active"])
    db.session.commit()
    _log("Updated add-on pricing", add_on_id)
    return ok(add_on.to_dict())


@bp.get("/payment-status")
@admin_required
def payment_status():
    return ok({"payments_enabled": bool(current_app.config.get("PAYMENTS_ENABLED"))})


@bp.post("/orders/<order_id>/record-offline-payment")
@admin_required
def record_offline_payment(order_id):
    """The only path (besides a verified Stripe webhook) that can ever mark
    an order paid. Requires admin, a reference and note, and always leaves
    both a Payment row and an AuditLog entry naming who recorded it."""
    order = Order.query.get(order_id)
    if not order:
        return error("Not found", 404)
    if order.status == "paid":
        return error("This order is already marked paid.", 409)
    if order.status not in ORDER_STATUSES_PAYABLE_FROM:
        return error(f"An order with status \"{order.status}\" cannot be marked paid.", 409)

    data = request.get_json(silent=True) or {}
    reference, ref_err = validate_admin_text(data.get("reference"), required=True, minimum=2, maximum=120)
    note, note_err = validate_admin_text(data.get("note"), required=True, minimum=2, maximum=1000)
    field_errors = {k: v for k, v in {"reference": ref_err, "note": note_err}.items() if v}
    if field_errors:
        return error("Please correct the highlighted fields.", 422, field_errors=field_errors)

    previous_status = order.status
    order.status = "paid"
    admin_id = get_jwt_identity()
    admin_user = User.query.get(admin_id)
    db.session.add(Payment(
        order_id=order.id, provider="offline", status="succeeded",
        amount_cents=order.total_cents, note=f"Reference: {reference}. {note}",
    ))
    db.session.add(StatusHistory(entity_type="order", entity_id=order.id, from_status=previous_status, to_status="paid", changed_by=admin_id))
    db.session.add(AuditLog(actor_id=admin_id, actor_label=admin_user.email if admin_user else None, action="Recorded offline payment", details=f"{order.order_number} ref={reference}"))
    notify_user(order.user_id, "Payment recorded", f"Your payment for order {order.order_number} has been recorded.", link="/dashboard/billing")
    db.session.commit()
    return ok(order.to_dict())


@bp.get("/support/threads")
@admin_required
def admin_list_support_threads():
    threads = SupportThread.query.order_by(SupportThread.updated_at.desc()).limit(200).all()
    result = []
    for t in threads:
        owner = User.query.get(t.user_id)
        result.append({
            "id": t.id, "subject": t.subject, "status": t.status, "priority": t.priority,
            "customer_name": owner.name if owner else None, "customer_email": owner.email if owner else None,
            "created_at": t.created_at.isoformat(),
        })
    return ok(result)


@bp.get("/support/threads/<thread_id>")
@admin_required
def admin_get_support_thread(thread_id):
    thread = SupportThread.query.get(thread_id)
    if not thread:
        return error("Not found", 404)
    owner = User.query.get(thread.user_id)
    messages = thread.messages.order_by(SupportMessage.created_at).all()
    return ok({
        "id": thread.id, "subject": thread.subject, "status": thread.status, "priority": thread.priority,
        "customer_name": owner.name if owner else None, "customer_email": owner.email if owner else None,
        "messages": [{"id": m.id, "body": m.body, "is_staff": m.is_staff, "created_at": m.created_at.isoformat()} for m in messages],
    })


@bp.post("/support/threads/<thread_id>/messages")
@admin_required
def admin_reply_to_thread(thread_id):
    thread = SupportThread.query.get(thread_id)
    if not thread:
        return error("Not found", 404)
    data = request.get_json(silent=True) or {}
    body, body_err = validate_admin_text(data.get("message"), required=True, minimum=1, maximum=4000)
    if body_err:
        return error("Please correct the highlighted fields.", 422, field_errors={"message": body_err})

    db.session.add(SupportMessage(thread_id=thread.id, author_id=get_jwt_identity(), body=body, is_staff=True))
    thread.status = "pending"
    notify_user(thread.user_id, "New reply to your support request", thread.subject, link="/dashboard/support")
    db.session.commit()

    owner = User.query.get(thread.user_id)
    if owner:
        send_email("support_message", owner.email, {
            "subject": thread.subject,
            "dashboard_url": f"{current_app.config['FRONTEND_ORIGIN']}/dashboard/support",
            "support_email": current_app.config["SUPPORT_EMAIL"],
        })
    return ok({"sent": True}, 201)


@bp.patch("/support/threads/<thread_id>")
@admin_required
def admin_update_thread_status(thread_id):
    thread = SupportThread.query.get(thread_id)
    if not thread:
        return error("Not found", 404)
    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if status not in ("open", "pending", "closed"):
        return error("Status must be one of: open, pending, closed", 422)
    thread.status = status
    db.session.commit()
    _log("Updated support thread status", f"{thread_id} -> {status}")
    return ok({"id": thread.id, "status": thread.status})
