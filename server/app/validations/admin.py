"""Validators for admin-only numeric/text fields: plan pricing (stored as
integer cents), Texas config numbers, and content-management text lengths.
Mirrors src/validations/adminValidation.js.
"""
import re

from .messages import MESSAGES, text_too_long, text_too_short


def validate_integer(value, minimum=None, maximum=None, required=True):
    if value is None or value == "":
        return (None, MESSAGES["number_required"]) if required else (None, None)
    try:
        amount = int(value)
    except (TypeError, ValueError):
        return None, MESSAGES["integer_invalid"]
    if isinstance(value, float) and not value.is_integer():
        return None, MESSAGES["integer_invalid"]
    if minimum is not None and amount < minimum:
        return None, f"Enter a value of {minimum} or more."
    if maximum is not None and amount > maximum:
        return None, f"Enter a value of {maximum} or less."
    return amount, None


def validate_price_cents(value, minimum=0, maximum=10_000_000, required=True):
    """Accepts a price in cents (int) OR a dollar string like "$199.00" and
    always returns a normalized integer cents value never a float, so
    payment math downstream never touches floating point."""
    if value is None or value == "":
        return (None, MESSAGES["number_required"]) if required else (None, None)
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        cents = int(round(float(value)))
    else:
        raw = str(value).strip().replace("$", "").replace(",", "")
        if not re.match(r"^\d+(\.\d{1,2})?$", raw):
            return None, MESSAGES["money_invalid"]
        cents = int(round(float(raw) * 100))
    if cents < minimum:
        return None, MESSAGES["money_negative"]
    if cents > maximum:
        return None, f"Enter an amount of ${maximum / 100:.2f} or less."
    return cents, None


def validate_admin_text(value, required=True, minimum=0, maximum=2000):
    text = str(value or "").strip()
    if not text:
        return (None, MESSAGES["text_required"]) if required else ("", None)
    if len(text) < minimum:
        return None, text_too_short(minimum)
    if len(text) > maximum:
        return None, text_too_long(maximum)
    return text, None
