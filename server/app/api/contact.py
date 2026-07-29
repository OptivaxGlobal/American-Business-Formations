from flask import Blueprint, request, current_app

from ..extensions import db, limiter
from ..models import ContactSubmission, Lead
from ..services.email import send_email
from ..utils import ok, error, sanitize_text
from ..validations.common import collect
from ..validations.contact import validate_email, validate_full_name, validate_phone

bp = Blueprint("contact", __name__, url_prefix="/api")


@bp.post("/contact")
@limiter.limit("10 per hour")
def submit_contact():
    data = request.get_json(silent=True) or {}

    values, errors = collect({
        "first_name": validate_full_name(data.get("first_name"), required=True),
        "last_name": validate_full_name(data.get("last_name"), required=True),
        "email": validate_email(data.get("email"), required=True),
        "phone": validate_phone(data.get("phone"), required=False),
        "message": _validate_message(data.get("message")),
    })
    if errors:
        return error("Please correct the highlighted fields.", 422, field_errors=errors)

    submission = ContactSubmission(
        first_name=values["first_name"],
        last_name=values["last_name"],
        email=values["email"],
        phone=values["phone"],
        service=sanitize_text(data.get("service"), 120),
        message=values["message"],
    )
    db.session.add(submission)
    db.session.commit()

    send_email("contact_confirmation", values["email"], {"support_email": current_app.config["SUPPORT_EMAIL"]})
    send_email("admin_lead_notification", current_app.config["SUPPORT_EMAIL"], {
        "source": "contact_form", "name": f"{submission.first_name} {submission.last_name}".strip(),
        "email": values["email"], "admin_url": f"{current_app.config['FRONTEND_ORIGIN']}/admin/leads",
    })
    return ok({"submitted": True}, 201)


def _validate_message(value):
    text = sanitize_text(value, 4000)
    if not text:
        return None, "Enter a message with at least 10 characters."
    if len(text) < 10:
        return None, "Enter a message with at least 10 characters."
    return text, None


@bp.post("/leads")
@limiter.limit("30 per hour")
def create_lead():
    data = request.get_json(silent=True) or {}
    email = sanitize_text(data.get("email"), 255)
    if email:
        normalized_email, email_err = validate_email(email, required=False)
        if email_err:
            return error("Please correct the highlighted fields.", 422, field_errors={"email": email_err})
        email = normalized_email

    source = sanitize_text(data.get("source"), 60) or "unknown"
    lead = Lead(
        source=source,
        business_name=sanitize_text(data.get("businessName") or data.get("business_name"), 200),
        name=sanitize_text(data.get("name"), 200),
        email=email,
        funnel_step=sanitize_text(data.get("funnel_step"), 60),
    )
    db.session.add(lead)
    db.session.commit()
    return ok(lead.to_dict(), 201)
