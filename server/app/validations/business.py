"""Business-identity validators: legal/DBA business name and EIN. Mirrors
src/validations/businessValidation.js (name rules) and src/lib/businessName.js.
"""
import re

from .common import contains_dangerous_markup, trim_collapse
from .messages import MESSAGES

BUSINESS_NAME_ALLOWED_EXTRA = set(" '’&.,-")


def validate_business_name(value, required=True, max_length=200):
    name = trim_collapse(value)
    if not name:
        return (None, MESSAGES["business_name_required"]) if required else ("", None)
    if len(name) < 2:
        return None, MESSAGES["business_name_too_short"]
    if len(name) > max_length:
        return None, MESSAGES["business_name_too_long"]
    if contains_dangerous_markup(name):
        return None, MESSAGES["business_name_invalid"]
    if not any(ch.isalpha() for ch in name):
        return None, MESSAGES["business_name_invalid"]
    if not all(ch.isalnum() or ch in BUSINESS_NAME_ALLOWED_EXTRA for ch in name):
        return None, MESSAGES["business_name_invalid"]
    return name, None


def normalize_ein(value):
    return re.sub(r"\D", "", str(value or ""))


def format_ein(value):
    digits = normalize_ein(value)
    if len(digits) != 9:
        return str(value or "")
    return f"{digits[0:2]}-{digits[2:]}"


def mask_ein(value):
    digits = normalize_ein(value)
    if len(digits) != 9:
        return ""
    return f"XX-XXX{digits[-4:]}"


def validate_ein(value, required=True):
    raw = str(value or "")
    if not raw.strip():
        return (None, MESSAGES["ein_required"]) if required else ("", None)
    if re.search(r"[a-zA-Z]", raw):
        return None, MESSAGES["ein_invalid"]
    digits = normalize_ein(raw)
    if len(digits) != 9:
        return None, MESSAGES["ein_invalid"]
    return digits, None
