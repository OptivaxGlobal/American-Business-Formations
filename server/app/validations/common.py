"""Generic, field-agnostic helpers shared by every module in
server/app/validations/*. Field-specific rules live in contact.py,
address.py, business.py, etc.
"""
import re
from datetime import date, datetime

DANGEROUS_RE = re.compile(r"<\s*script|</\s*script|javascript:|on\w+\s*=", re.IGNORECASE)


def trim_collapse(value):
    return re.sub(r"\s+", " ", str(value or "").strip())


def is_blank(value):
    return trim_collapse(value) == ""


def digits_only(value):
    return re.sub(r"\D", "", str(value or ""))


def contains_dangerous_markup(value):
    return bool(DANGEROUS_RE.search(str(value or "")))


def parse_iso_date(value):
    if not value:
        return None
    if isinstance(value, date):
        return value
    try:
        return datetime.strptime(str(value), "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


def validate_choice(value, allowed, message="Please make a valid selection."):
    """Generic enum/membership guard used for any client-supplied status,
    role, or type field (application status, lead status, agent type,
    etc.) so a direct API/Postman call can't write an arbitrary string into
    a column that's only a plain VARCHAR at the DB level."""
    if value not in allowed:
        return None, message
    return value, None


def collect(fields):
    """fields: dict of field_name -> (normalized_value, error_message).

    Returns (values, errors): `values` contains only successfully-validated
    fields, `errors` contains only failing ones (field_name -> message),
    ready to hand to utils.error(..., field_errors=errors).
    """
    values, errors = {}, {}
    for key, result in fields.items():
        value, err = result
        if err:
            errors[key] = err
        else:
            values[key] = value
    return values, errors
