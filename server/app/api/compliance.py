from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, get_jwt, jwt_required

from ..extensions import db
from ..models import Business, ComplianceTask
from ..services.texas import get_texas_config
from ..utils import ok, error

bp = Blueprint("compliance", __name__, url_prefix="/api/compliance")


def _business_for(user_id, role, business_id):
    query = Business.query.filter_by(id=business_id)
    if role not in ("admin", "staff"):
        query = query.filter_by(owner_id=user_id)
    return query.first()


@bp.get("/<business_id>")
@jwt_required()
def list_tasks(business_id):
    claims = get_jwt()
    business = _business_for(get_jwt_identity(), claims.get("role"), business_id)
    if not business:
        return error("Not found", 404)
    tasks = business.compliance_tasks.order_by(ComplianceTask.due_date).all()
    return ok([t.to_dict() for t in tasks])


@bp.post("/<business_id>/seed")
@jwt_required()
def seed_tasks(business_id):
    """Populates the standard Texas compliance checklist for a business."""
    claims = get_jwt()
    business = _business_for(get_jwt_identity(), claims.get("role"), business_id)
    if not business:
        return error("Not found", 404)
    for task in get_texas_config()["compliance_tasks"]:
        db.session.add(ComplianceTask(business_id=business.id, task_key=task["key"], name=task["name"]))
    db.session.commit()
    return ok([t.to_dict() for t in business.compliance_tasks], 201)


@bp.patch("/<business_id>/<task_id>")
@jwt_required()
def update_task(business_id, task_id):
    claims = get_jwt()
    business = _business_for(get_jwt_identity(), claims.get("role"), business_id)
    if not business:
        return error("Not found", 404)
    task = ComplianceTask.query.filter_by(id=task_id, business_id=business.id).first()
    if not task:
        return error("Not found", 404)
    data = request.get_json(silent=True) or {}
    if "done" in data:
        task.done = bool(data["done"])
    db.session.commit()
    return ok(task.to_dict())
