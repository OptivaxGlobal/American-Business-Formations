
from flask import Blueprint
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db
from ..models import Notification
from ..utils import ok, error, utcnow

bp = Blueprint("notifications", __name__, url_prefix="/api/notifications")


def notify_user(user_id, title, body=None, link=None):
    """Creates a real Notification row. Call this alongside send_email(...)
    at the same points that already trigger a transactional email, so the
    in-app notification and the email always reflect the same real events."""
    db.session.add(Notification(user_id=user_id, title=title, body=body, link=link))


@bp.get("")
@jwt_required()
def list_notifications():
    user_id = get_jwt_identity()
    notifications = Notification.query.filter_by(user_id=user_id).order_by(
        Notification.read_at.is_(None).desc(), Notification.created_at.desc()
    ).limit(100).all()
    return ok([{
        "id": n.id, "title": n.title, "body": n.body, "link": n.link,
        "read": n.read_at is not None, "created_at": n.created_at.isoformat(),
    } for n in notifications])


@bp.post("/<notification_id>/read")
@jwt_required()
def mark_read(notification_id):
    user_id = get_jwt_identity()
    notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    if not notification:
        return error("Not found", 404)
    if not notification.read_at:
        notification.read_at = utcnow()
        db.session.commit()
    return ok({"read": True})
