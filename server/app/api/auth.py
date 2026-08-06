from datetime import timedelta

from flask import Blueprint, request, current_app
from flask_jwt_extended import (
    create_access_token, get_jwt_identity, jwt_required,
    set_access_cookies, unset_jwt_cookies,
)

from ..extensions import db, limiter
from ..models import User, EmailVerificationToken, PasswordResetToken, AuditLog
from ..services.email import send_email
from ..utils import ok, error, sanitize_text, utcnow
from ..validations.auth import validate_password_strength
from ..validations.common import collect
from ..validations.contact import validate_email, validate_full_name

bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def _log(actor_label, action, details=""):
    db.session.add(AuditLog(actor_label=actor_label, action=action, details=details))
    db.session.commit()


@bp.post("/signup")
@limiter.limit("10 per hour")
def signup():
    data = request.get_json(silent=True) or {}

    values, errors = collect({
        "name": validate_full_name(data.get("name"), required=True),
        "email": validate_email(data.get("email"), required=True),
        "password": validate_password_strength(data.get("password"), required=True),
    })
    if errors:
        return error("Please correct the highlighted fields.", 422, field_errors=errors)

    name, email, password = values["name"], values["email"].lower(), values["password"]
    marketing_consent = bool(data.get("marketing_consent"))

    if User.query.filter_by(email=email).first():
        return error("An account with this email already exists.", 409, field_errors={"email": "An account with this email already exists."})

    user = User(name=name, email=email, role="customer", marketing_consent=marketing_consent)
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    token = EmailVerificationToken(user_id=user.id, expires_at=utcnow() + timedelta(hours=24))
    db.session.add(token)
    db.session.commit()

    send_email("welcome", user.email, {"name": user.name, "support_email": current_app.config["SUPPORT_EMAIL"]})
    send_email("verify_email", user.email, {
        "verify_url": f"{current_app.config['FRONTEND_ORIGIN']}/verify-email?token={token.token}",
        "support_email": current_app.config["SUPPORT_EMAIL"],
    })
    _log(user.email, "Account created")

    access_token = create_access_token(identity=user.id, additional_claims={"role": user.role})
    resp_data, status = ok(user.to_dict(), 201)
    set_access_cookies(resp_data, access_token)
    return resp_data, status


@bp.post("/login")
@limiter.limit("10 per 15 minutes")
def login():
    data = request.get_json(silent=True) or {}
    email_value, email_err = validate_email(data.get("email"), required=True)
    password = str(data.get("password", ""))

    if email_err or not password:
        return error(
            "A valid email and password are required.", 422,
            field_errors={k: v for k, v in {"email": email_err, "password": None if password else "Enter your password."}.items() if v}
        )
    email = email_value.lower()

    user = User.query.filter_by(email=email).first()
    generic_error = error("The email or password is incorrect.", 401)

    if not user or not user.is_active:
        return generic_error

    if user.locked_until and user.locked_until > utcnow():
        return error("Too many failed attempts. Try again later.", 423)

    if not user.check_password(password):
        user.failed_login_count += 1
        if user.failed_login_count >= 5:
            user.locked_until = utcnow() + timedelta(minutes=15)
            user.failed_login_count = 0
        db.session.commit()
        return generic_error

    user.failed_login_count = 0
    user.locked_until = None
    user.last_login_at = utcnow()
    db.session.commit()
    _log(user.email, "Logged in")

    access_token = create_access_token(identity=user.id, additional_claims={"role": user.role})
    resp_data, status = ok(user.to_dict())
    set_access_cookies(resp_data, access_token)
    return resp_data, status


@bp.post("/logout")
def logout():
    resp_data, status = ok({"loggedOut": True})
    unset_jwt_cookies(resp_data)
    return resp_data, status


@bp.get("/me")
@jwt_required()
def me():
    user = User.query.get(get_jwt_identity())
    if not user:
        return error("Not found", 404)
    return ok(user.to_dict())


@bp.post("/verify-email")
@limiter.limit("10 per hour")
def verify_email():
    data = request.get_json(silent=True) or {}
    token_value = sanitize_text(data.get("token"), 64)
    if not token_value:
        return error("This verification link is invalid or has expired.", 400)

    token = EmailVerificationToken.query.filter_by(token=token_value, used_at=None).first()
    if not token or token.expires_at < utcnow():
        return error("This verification link is invalid or has expired.", 400)

    user = User.query.get(token.user_id)
    # The same token flow backs both signup verification and a profile
    # email change (PATCH /api/account/email) if a change is pending,
    # confirming this link is what actually swaps the address over, never
    # before this point.
    if user.pending_email:
        user.email = user.pending_email
        user.pending_email = None
    user.email_verified = True
    token.used_at = utcnow()
    db.session.commit()
    _log(user.email, "Verified email")
    return ok({"verified": True})


@bp.post("/forgot-password")
@limiter.limit("5 per hour")
def forgot_password():
    data = request.get_json(silent=True) or {}
    email_value, email_err = validate_email(data.get("email"), required=True)
    if email_err:
        return error("Please correct the highlighted fields.", 422, field_errors={"email": email_err})

    email = email_value.lower()
    user = User.query.filter_by(email=email).first()

    # Always respond the same way whether or not the account exists.
    if user:
        token = PasswordResetToken(user_id=user.id, expires_at=utcnow() + timedelta(hours=1))
        db.session.add(token)
        db.session.commit()
        send_email("password_reset", user.email, {
            "reset_url": f"{current_app.config['FRONTEND_ORIGIN']}/reset-password?token={token.token}",
            "support_email": current_app.config["SUPPORT_EMAIL"],
        })
        _log(user.email, "Requested password reset")

    return ok({"message": "If an account exists for this email, a reset link has been sent."})


@bp.post("/reset-password")
@limiter.limit("10 per hour")
def reset_password():
    data = request.get_json(silent=True) or {}
    token_value = sanitize_text(data.get("token"), 64)

    values, errors = collect({
        "password": validate_password_strength(data.get("password"), required=True),
    })
    if not token_value:
        errors["token"] = "This reset link is invalid or has expired."
    if errors:
        return error("Please correct the highlighted fields.", 422, field_errors=errors)

    token = PasswordResetToken.query.filter_by(token=token_value, used_at=None).first()
    if not token or token.expires_at < utcnow():
        return error("This reset link is invalid or has expired.", 400)

    user = User.query.get(token.user_id)
    user.set_password(values["password"])
    token.used_at = utcnow()
    db.session.commit()
    _log(user.email, "Reset password")
    return ok({"reset": True})
