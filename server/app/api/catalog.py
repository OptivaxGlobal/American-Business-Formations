from flask import Blueprint

from ..models import Package, AddOn, Testimonial, SiteSetting
from ..services.texas import get_texas_config
from ..services.states import list_supported_states
from ..utils import ok

bp = Blueprint("catalog", __name__, url_prefix="/api")


@bp.get("/packages")
def list_packages():
    packages = Package.query.filter_by(active=True).order_by(Package.sort_order).all()
    return ok([p.to_dict() for p in packages])


@bp.get("/add-ons")
def list_add_ons():
    add_ons = AddOn.query.filter_by(active=True).all()
    return ok([a.to_dict() for a in add_ons])


@bp.get("/texas-config")
def texas_config():
    return ok(get_texas_config())


@bp.get("/states")
def states_config():
    """Every state LLC Formation, Virtual Office, and Mail Forwarding
    currently support, with the real formation filing fee for each —
    checkout.py uses the same underlying data (services/states.py) to
    price an order; this route just exposes it for the frontend's state
    selector and pricing displays so the fee shown before checkout always
    matches what checkout actually charges."""
    return ok({
        "states": [
            {
                "code": s["code"], "name": s["name"],
                "llcFormationFeeCents": s["llc_formation_fee_cents"],
                "filingAuthority": s["filing_authority"],
                "note": s["note"],
            }
            for s in list_supported_states()
        ]
    })


@bp.get("/testimonials")
def list_public_testimonials():
    """Public read of admin-managed testimonials. Never returns anything
    that isn't both verified AND published the same rule the admin
    create/update routes already enforce when writing these rows, checked
    again here so this endpoint can't be the one place that rule is missed."""
    testimonials = Testimonial.query.filter_by(verified=True, published=True).all()
    return ok([{"id": t.id, "customer_name": t.customer_name, "customer_role": t.customer_role, "quote": t.quote} for t in testimonials])


@bp.get("/announcement")
def announcement():
    setting = SiteSetting.query.filter_by(key="announcement").first()
    if not setting or not isinstance(setting.value, dict):
        return ok({"enabled": False, "message": ""})
    return ok({"enabled": bool(setting.value.get("enabled")), "message": setting.value.get("message") or ""})
