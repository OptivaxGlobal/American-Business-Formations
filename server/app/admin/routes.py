from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity

from ..extensions import db
from ..models import (
    Business, FormationApplication, Order, User, Lead, SupportThread,
    Package, AddOn, AuditLog, Testimonial, FAQ, SiteSetting,
    APPLICATION_STATUSES, LEAD_STATUSES,
)
from ..utils import ok, error, sanitize_text
from ..validations.admin import validate_admin_text, validate_price_cents
from ..validations.common import collect, validate_choice
from ..validations.contact import validate_full_name
from .decorators import admin_required

bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def _log(action, details=""):
    db.session.add(AuditLog(actor_id=get_jwt_identity(), action=action, details=details))
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


@bp.get("/content/faqs")
@admin_required
def list_faqs():
    return ok([{"id": f.id, "question": f.question, "answer": f.answer, "category": f.category} for f in FAQ.query.all()])


@bp.get("/audit-log")
@admin_required
def audit_log():
    logs = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(200).all()
    return ok([l.to_dict() for l in logs])
