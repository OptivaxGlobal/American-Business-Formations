import re

from flask import jsonify

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PO_BOX_RE = re.compile(r"^\s*(?:p\.?\s*o\.?\s*box|post\s*office\s*box)", re.IGNORECASE)


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
