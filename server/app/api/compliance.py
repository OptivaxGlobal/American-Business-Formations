from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, get_jwt, jwt_required

from ..extensions import db
from ..models import Business, ComplianceTask
from ..services.states import get_state_config, DEFAULT_STATE
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
    """Populates the post-formation compliance checklist for a business
    from its own formation state (server/app/services/states.py) every
    one of the 21 supported states, not just Texas. Skips any task_key
    already present so re-seeding (e.g. after a state correction) never
    creates duplicate rows for tasks the customer already has."""
    claims = get_jwt()
    business = _business_for(get_jwt_identity(), claims.get("role"), business_id)
    if not business:
        return error("Not found", 404)
    state_config = get_state_config(business.state) or get_state_config(DEFAULT_STATE)
    existing_keys = {t.task_key for t in business.compliance_tasks}
    for task in state_config.get("post_formation_tasks", []):
        if task["key"] in existing_keys:
            continue
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
