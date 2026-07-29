"""Validators for street/city/ZIP fields. Mirrors src/validations/addressValidation.js."""
import re

from .common import contains_dangerous_markup, trim_collapse
from .messages import MESSAGES

PO_BOX_RE = re.compile(r"^\s*(?:p\.?\s*o\.?\s*box|post\s*office\s*box)", re.IGNORECASE)
CITY_ALLOWED_EXTRA = set(" '.-")
ZIP_RE = re.compile(r"^\d{5}(-\d{4})?$")


def is_po_box(value):
    return bool(PO_BOX_RE.match(str(value or "")))


def validate_street_address(value, required=True, disallow_po_box=False):
    street = trim_collapse(value)
    if not street:
        return (None, MESSAGES["address_required"]) if required else ("", None)
    if contains_dangerous_markup(street):
        return None, MESSAGES["address_invalid"]
    if len(street) < 3:
        return None, MESSAGES["address_too_short"]
    if len(street) > 150:
        return None, MESSAGES["address_too_long"]
    if disallow_po_box and is_po_box(street):
        return None, MESSAGES["po_box_not_allowed"]
    return street, None


def validate_city(value, required=True):
    city = trim_collapse(value)
    if not city:
        return (None, MESSAGES["city_required"]) if required else ("", None)
    if len(city) < 2:
        return None, MESSAGES["city_too_short"]
    if len(city) > 100:
        return None, MESSAGES["city_too_long"]
    if not any(ch.isalpha() for ch in city) or not all(ch.isalpha() or ch in CITY_ALLOWED_EXTRA for ch in city):
        return None, MESSAGES["city_invalid"]
    return city, None


def validate_zip(value, required=True):
    zip_code = str(value or "").strip()
    if not zip_code:
        return (None, MESSAGES["zip_required"]) if required else ("", None)
    if not ZIP_RE.match(zip_code):
        return None, MESSAGES["zip_invalid"]
    return zip_code, None
