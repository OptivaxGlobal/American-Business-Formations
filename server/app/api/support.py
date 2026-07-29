from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db, limiter
from ..models import SupportThread, SupportMessage
from ..utils import ok, error
from ..validations.admin import validate_admin_text

bp = Blueprint("support", __name__, url_prefix="/api/support")


@bp.get("/threads")
@jwt_required()
def list_threads():
    user_id = get_jwt_identity()
    threads = SupportThread.query.filter_by(user_id=user_id).order_by(SupportThread.updated_at.desc()).all()
    return ok([{"id": t.id, "subject": t.subject, "status": t.status, "priority": t.priority} for t in threads])


@bp.post("/threads")
@jwt_required()
@limiter.limit("20 per hour")
def create_thread():
    data = request.get_json(silent=True) or {}
    subject, subject_err = validate_admin_text(data.get("subject"), required=True, minimum=3, maximum=200)
    body, body_err = validate_admin_text(data.get("message"), required=True, minimum=10, maximum=4000)
    if subject_err or body_err:
        errors = {k: v for k, v in {"subject": subject_err, "message": body_err}.items() if v}
        return error("Please correct the highlighted fields.", 422, field_errors=errors)

    thread = SupportThread(user_id=get_jwt_identity(), business_id=data.get("business_id"), subject=subject)
    db.session.add(thread)
    db.session.flush()
    db.session.add(SupportMessage(thread_id=thread.id, author_id=get_jwt_identity(), body=body, is_staff=False))
    db.session.commit()
    return ok({"id": thread.id}, 201)


@bp.post("/threads/<thread_id>/messages")
@jwt_required()
@limiter.limit("60 per hour")
def reply(thread_id):
    user_id = get_jwt_identity()
    thread = SupportThread.query.filter_by(id=thread_id, user_id=user_id).first()
    if not thread:
        return error("Not found", 404)
    data = request.get_json(silent=True) or {}
    body, body_err = validate_admin_text(data.get("message"), required=True, minimum=1, maximum=4000)
    if body_err:
        return error("Please correct the highlighted fields.", 422, field_errors={"message": body_err})
    db.session.add(SupportMessage(thread_id=thread.id, author_id=user_id, body=body, is_staff=False))
    db.session.commit()
    return ok({"sent": True}, 201)
