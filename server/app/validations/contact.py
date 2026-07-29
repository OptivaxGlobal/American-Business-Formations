"""Validators for person-identifying contact fields: full name, email,
phone, and preferred-contact-method. Mirrors src/validations/contactValidation.js.
"""
import re

from email_validator import EmailNotValidError, validate_email as _validate_email_lib

from .common import digits_only, trim_collapse
from .messages import MESSAGES

NAME_ALLOWED_EXTRA = set(" '’.-")


def validate_full_name(value, required=True):
    name = trim_collapse(value)
    if not name:
        return (None, MESSAGES["name_required"]) if required else ("", None)
    if len(name) < 2:
        return None, MESSAGES["name_too_short"]
    if len(name) > 100:
        return None, MESSAGES["name_too_long"]
    if not any(ch.isalpha() for ch in name):
        return None, MESSAGES["name_invalid"]
    if not all(ch.isalpha() or ch in NAME_ALLOWED_EXTRA for ch in name):
        return None, MESSAGES["name_invalid"]
    return name, None


def validate_email(value, required=True):
    raw = str(value or "").strip()
    if not raw:
        return (None, MESSAGES["email_required"]) if required else ("", None)
    if " " in raw or len(raw) > 254 or ".." in raw or raw.count("@") != 1:
        return None, MESSAGES["email_invalid"]
    try:
        result = _validate_email_lib(raw, check_deliverability=False)
    except EmailNotValidError:
        return None, MESSAGES["email_invalid"]
    return result.normalized, None


def normalize_phone_digits(value):
    digits = digits_only(value)
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    return digits


def format_phone(value):
    digits = normalize_phone_digits(value)
    if len(digits) != 10:
        return str(value or "")
    return f"({digits[0:3]}) {digits[3:6]}-{digits[6:]}"


def validate_phone(value, required=True):
    raw = str(value or "")
    if not raw.strip():
        return (None, MESSAGES["phone_required"]) if required else ("", None)
    if re.search(r"[a-zA-Z]", raw):
        return None, MESSAGES["phone_invalid"]
    digits = normalize_phone_digits(raw)
    if len(digits) != 10:
        return None, MESSAGES["phone_invalid"]
    return f"+1{digits}", None


def validate_contact_method(value, allowed):
    if not value or value not in allowed:
        return None, MESSAGES["contact_method_required"]
    return value, None
