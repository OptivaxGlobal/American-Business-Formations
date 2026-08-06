from datetime import timedelta

from flask import Blueprint, request, current_app
from flask_jwt_extended import get_jwt_identity, jwt_required

from ..extensions import db, limiter
from ..models import User, EmailVerificationToken, AuditLog
from ..services.email import send_email
from ..utils import ok, error, utcnow
from ..validations.auth import validate_password_strength
from ..validations.contact import validate_full_name, validate_email, validate_phone

bp = Blueprint("account", __name__, url_prefix="/api/account")


@bp.patch("/profile")
@jwt_required()
@limiter.limit("30 per hour")
def update_profile():
    """Updates only the customer-editable fields below. role, is_active,
    id, and every other privileged column are never read off the request
    body at all not even to ignore them so there is no field a crafted
    payload could add to escalate privileges through this endpoint."""
    user = User.query.get(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    errors = {}
    updates = {}

    if "name" in data:
        name_value, name_err = validate_full_name(data.get("name"), required=True)
        if name_err:
            errors["name"] = name_err
        else:
            updates["name"] = name_value

    if "phone" in data:
        raw_phone = data.get("phone")
        if raw_phone:
            phone_value, phone_err = validate_phone(raw_phone, required=False)
            if phone_err:
                errors["phone"] = phone_err
            else:
                updates["phone"] = phone_value
        else:
            updates["phone"] = None

    if errors:
        return error("Please correct the highlighted fields.", 422, field_errors=errors)

    for field in ("name", "phone"):
        if field in updates:
            setattr(user, field, updates[field])
    if "marketing_consent" in data:
        user.marketing_consent = bool(data["marketing_consent"])
    if "email_reminders_enabled" in data:
        user.email_reminders_enabled = bool(data["email_reminders_enabled"])
    if "sms_reminders_enabled" in data:
        user.sms_reminders_enabled = bool(data["sms_reminders_enabled"])

    db.session.commit()
    return ok(user.to_dict())


@bp.patch("/email")
@jwt_required()
@limiter.limit("5 per hour")
def update_email():
    """Never updates `email`/`email_verified` directly stores the request
    on `pending_email` and sends the confirmation link to the NEW address.
    The swap only happens once that link is followed (see auth.py's
    verify_email, which checks pending_email)."""
    user = User.query.get(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    email_value, email_err = validate_email(data.get("email"), required=True)
    if email_err:
        return error("Please correct the highlighted fields.", 422, field_errors={"email": email_err})
    email_value = email_value.lower()

    if email_value == user.email:
        return error("This is already your current email address.", 422, field_errors={"email": "This is already your current email address."})
    if User.query.filter(User.email == email_value, User.id != user.id).first():
        return error("An account with this email already exists.", 409, field_errors={"email": "An account with this email already exists."})

    user.pending_email = email_value
    db.session.commit()

    token = EmailVerificationToken(user_id=user.id, expires_at=utcnow() + timedelta(hours=24))
    db.session.add(token)
    db.session.commit()

    send_email("verify_email", email_value, {
        "verify_url": f"{current_app.config['FRONTEND_ORIGIN']}/verify-email?token={token.token}",
        "support_email": current_app.config["SUPPORT_EMAIL"],
    })
    return ok({"pending_email": email_value})


@bp.post("/password")
@jwt_required()
@limiter.limit("10 per hour")
def change_password():
    user = User.query.get(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    current_password = str(data.get("current_password", ""))
    if not user.check_password(current_password):
        return error("Your current password is incorrect.", 401, field_errors={"current_password": "Your current password is incorrect."})

    new_password, pwd_err = validate_password_strength(data.get("new_password"), required=True)
    if pwd_err:
        return error("Please correct the highlighted fields.", 422, field_errors={"new_password": pwd_err})

    user.set_password(new_password)
    db.session.add(AuditLog(actor_id=user.id, action="Changed password"))
    db.session.commit()
    return ok({"changed": True})
