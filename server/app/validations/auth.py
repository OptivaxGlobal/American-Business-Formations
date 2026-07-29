"""Password validators for signup / reset / change-password / admin account
forms. Mirrors src/validations/authValidation.js.
"""
import re

from .messages import MESSAGES

UPPER_RE = re.compile(r"[A-Z]")
LOWER_RE = re.compile(r"[a-z]")
NUMBER_RE = re.compile(r"\d")
SPECIAL_RE = re.compile(r"[^A-Za-z0-9]")

# A short list of extremely common/leaked passwords worth rejecting outright
# even if they technically meet the character-class rules below.
COMMONLY_COMPROMISED = {
    "password", "password1", "password123", "12345678", "123456789",
    "qwertyui", "letmein1", "iloveyou", "admin123", "welcome1",
}


def validate_password_strength(value, required=True):
    password = str(value or "")
    if not password:
        return (None, MESSAGES["password_required"]) if required else ("", None)
    if len(password) < 8:
        return None, MESSAGES["password_too_short"]
    if len(password) > 128:
        return None, MESSAGES["password_too_long"]
    if password.lower() in COMMONLY_COMPROMISED:
        return None, MESSAGES["password_weak"]
    if not (UPPER_RE.search(password) and LOWER_RE.search(password)
            and NUMBER_RE.search(password) and SPECIAL_RE.search(password)):
        return None, MESSAGES["password_weak"]
    return password, None


def validate_password_confirmation(password, confirm_password):
    if not confirm_password:
        return None, MESSAGES["password_required"]
    if password != confirm_password:
        return None, MESSAGES["password_mismatch"]
    return confirm_password, None
