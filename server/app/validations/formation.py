"""Formation-wizard-specific validators: ownership percentages and the
Texas effective-date rule. Mirrors src/validations/formationValidation.js.
State-specific limits should stay here (or in server/config.py) rather than
hard-coded per-endpoint.
"""
from datetime import date, timedelta

from .common import parse_iso_date
from .messages import MESSAGES, date_too_far_out


def validate_ownership_percentage(value):
    try:
        amount = float(value)
    except (TypeError, ValueError):
        return None, MESSAGES["percentage_invalid"]
    if amount != amount or amount in (float("inf"), float("-inf")):  # NaN/Infinity guard
        return None, MESSAGES["percentage_invalid"]
    if amount < 0 or amount > 100:
        return None, MESSAGES["percentage_range"]
    return amount, None


def validate_ownership_total(owners):
    total = 0.0
    for owner in owners:
        try:
            total += float(owner.get("percentage") or 0)
        except (TypeError, ValueError):
            return None, MESSAGES["percentage_invalid"]
    total = round(total, 2)
    if total != 100:
        return None, MESSAGES["ownership_total_invalid"]
    return total, None


def validate_effective_date(value, max_days_out=90, allow_past=False, required=True):
    if not value:
        return (None, MESSAGES["date_required"]) if required else (None, None)
    parsed = parse_iso_date(value)
    if parsed is None:
        return None, MESSAGES["date_invalid"]
    today = date.today()
    if not allow_past and parsed < today:
        return None, MESSAGES["date_not_past"]
    if parsed > today + timedelta(days=max_days_out):
        return None, date_too_far_out(max_days_out)
    return parsed, None
