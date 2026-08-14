import re
from datetime import datetime, timezone

from flask import jsonify

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PO_BOX_RE = re.compile(r"^\s*(?:p\.?\s*o\.?\s*box|post\s*office\s*box)", re.IGNORECASE)


def utcnow():
    """Current UTC time as a naive datetime (no tzinfo).

    Every `db.DateTime` column in this app (models/*.py) is a plain,
    dialect-default column on SQLite (dev) that always returns a naive
    datetime on read, and on PostgreSQL (production) `DateTime()` without
    `timezone=True` maps to TIMESTAMP WITHOUT TIME ZONE, which does the
    same. A value written as tz-aware (`datetime.now(timezone.utc)`) then
    compared against a value read back naive raises
    `TypeError: can't compare offset-naive and offset-aware datetimes` —
    a real bug this exact mismatch caused in login-lockout and
    email-verification/password-reset token-expiry checks, caught by the
    backend test suite's first-ever real run. Every timestamp in this app
    is UTC by convention; storing and comparing consistently as naive UTC
    (rather than fighting each database driver's own tz-preservation
    behavior) is correct on every backend this app runs on."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def ok(data=None, status=200, **extra):
    payload = {"ok": True}
    if data is not None:
        payload["data"] = data
    payload.update(extra)
    return jsonify(payload), status


def error(message, status=400, field_errors=None):
    payload = {"ok": False, "message": message}
    if field_errors:
        payload["field_errors"] = field_errors
    return jsonify(payload), status


def is_valid_email(value):
    return bool(value) and bool(EMAIL_RE.match(str(value).strip()))


def is_po_box(value):
    return bool(PO_BOX_RE.match(str(value or "")))


def is_strong_password(value):
    return bool(value) and len(str(value)) >= 8


def require_fields(data, fields):
    missing = [f for f in fields if not data.get(f)]
    return missing


def sanitize_text(value, max_length=None):
    text = str(value or "").strip()
    if max_length:
        text = text[:max_length]
    return text
