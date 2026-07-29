from flask import Blueprint
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..models import Order
from ..utils import ok, error

bp = Blueprint("orders", __name__, url_prefix="/api/orders")


@bp.get("")
@jwt_required()
def list_orders():
    user_id = get_jwt_identity()
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    return ok([o.to_dict() for o in orders])


@bp.get("/<order_id>")
@jwt_required()
def get_order(order_id):
    user_id = get_jwt_identity()
    order = Order.query.filter_by(id=order_id, user_id=user_id).first()
    if not order:
        return error("Not found", 404)
    data = order.to_dict()
    data["items"] = [i.to_dict() for i in order.items]
    return ok(data)
