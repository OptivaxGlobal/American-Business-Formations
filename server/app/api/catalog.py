from flask import Blueprint

from ..models import Package, AddOn
from ..services.texas import get_texas_config
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
