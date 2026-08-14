from flask import current_app, render_template
from flask_mail import Message

from ..extensions import db, mail
from ..models import EmailLog

TEMPLATES = {
    "welcome": "Welcome to American Business Formations",
    "verify_email": "Verify your email address",
    "password_reset": "Reset your password",
    # Deliberately state-agnostic LLC formation is available across 21
    # states (see server/app/services/states.py), and these fire for every
    # customer regardless of which one they formed in. A previous version
    # of these hardcoded "Texas LLC" into every subject line, which would
    # have sent a Wyoming or Delaware customer an email about "Your Texas
    # LLC" caught during the multi-state expansion, not by a report.
    "application_saved": "Your LLC application was saved",
    "application_submitted": "We received your LLC application",
    "payment_received": "Payment received order confirmation",
    "payment_failed": "We couldn't process your payment",
    "info_requested": "We need a bit more information",
    "status_changed": "Your LLC application status changed",
    "filing_submitted": "Your formation document was submitted to the state",
    "formation_approved": "Your LLC has been approved",
    "document_uploaded": "A new document is ready in your dashboard",
    "support_message": "New reply to your support ticket",
    "compliance_reminder": "Upcoming compliance deadline",
    "service_renewal": "An upcoming service renewal",
    "contact_confirmation": "We received your message",
    "admin_lead_notification": "New lead captured",
    "admin_order_notification": "New order received",
}


def send_email(template, to_email, context=None):
    context = context or {}
    subject = TEMPLATES.get(template, "American Business Formations")
    app = current_app

    if not app.config.get("EMAIL_ENABLED"):
        log = EmailLog(to_email=to_email, template=template, subject=subject, status="skipped_no_smtp")
        db.session.add(log)
        db.session.commit()
        app.logger.info("Email skipped (SMTP not configured): %s -> %s", template, to_email)
        return log

    try:
        html_body = render_template(f"emails/{template}.html", subject=subject, **context)
    except Exception:  # noqa: BLE001 - fall back to a minimal body if a template is missing
        html_body = render_template("emails/base.html", subject=subject, body=context.get("summary", ""), **context)

    try:
        msg = Message(subject=subject, sender=app.config["FROM_EMAIL"], recipients=[to_email], html=html_body)
        mail.send(msg)
        log = EmailLog(to_email=to_email, template=template, subject=subject, status="sent")
    except Exception as exc:  # noqa: BLE001
        app.logger.exception("Failed to send email")
        log = EmailLog(to_email=to_email, template=template, subject=subject, status="failed", error=str(exc))

    db.session.add(log)
    db.session.commit()
    return log
