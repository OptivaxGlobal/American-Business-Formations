"""Central, user-facing validation copy for the backend.

Mirrors src/validations/validationMessages.js field-for-field so the same
condition produces the same wording whether it's caught client-side or
server-side. Never surface raw exceptions, schema errors, or regex details
to the client return one of these strings instead.
"""

MESSAGES = {
    "name_required": "Enter your full name.",
    "name_too_short": "Name must contain at least 2 characters.",
    "name_too_long": "Name must be 100 characters or fewer.",
    "name_invalid": "Enter a valid name using letters, spaces, hyphens, apostrophes, or periods.",

    "email_required": "Enter your email address.",
    "email_invalid": "Enter a valid email address.",

    "phone_required": "Enter your phone number.",
    "phone_invalid": "Enter a valid 10-digit U.S. phone number.",

    "contact_method_required": "Select a preferred contact method.",

    "business_name_required": "Please enter your business name.",
    "business_name_too_short": "Business name must contain at least 2 characters.",
    "business_name_too_long": "Business name must be 200 characters or fewer.",
    "business_name_invalid": "Please enter a valid business name.",

    "address_required": "Enter a street address.",
    "address_too_short": "Enter a complete street address.",
    "address_too_long": "Address must be 150 characters or fewer.",
    "address_invalid": "Enter a valid street address.",
    "po_box_not_allowed": "Enter a physical street address. A PO Box cannot be used here.",
    "city_required": "Enter a city.",
    "city_too_short": "City must contain at least 2 characters.",
    "city_too_long": "City must be 100 characters or fewer.",
    "city_invalid": "Enter a valid city name.",
    "zip_required": "Enter a ZIP code.",
    "zip_invalid": "Enter a valid 5-digit ZIP code.",

    "date_required": "Select a date.",
    "date_invalid": "Enter a valid date.",
    "date_not_past": "This date cannot be in the past.",
    "date_not_future": "This date cannot be in the future.",

    "ein_required": "Enter the EIN.",
    "ein_invalid": "Enter a valid 9-digit EIN.",

    "password_required": "Enter a password.",
    "password_too_short": "Password must be at least 8 characters.",
    "password_too_long": "Password must be 128 characters or fewer.",
    "password_weak": "Use at least 8 characters, including uppercase, lowercase, a number, and a special character.",
    "password_mismatch": "Passwords do not match.",
    "login_failed": "The email or password is incorrect.",

    "number_required": "Enter a value.",
    "integer_invalid": "Enter a whole number.",
    "percentage_invalid": "Enter a valid ownership percentage.",
    "percentage_range": "Ownership percentage must be between 0 and 100.",
    "ownership_total_invalid": "Total ownership must equal 100%.",
    "money_invalid": "Enter a valid amount with up to two decimal places.",
    "money_negative": "Amount cannot be negative.",

    "selection_required": "Please make a selection.",
    "consent_required": "You must agree before continuing.",

    "text_required": "This field is required.",

    "url_invalid": "Enter a valid website address (starting with http:// or https://).",

    "file_required": "Choose a file to upload.",

    "generic_error": "Please correct the highlighted fields.",
}


def date_too_far_out(days):
    return f"Select a date within {days} days."


def text_too_short(min_length):
    return f"Enter at least {min_length} characters."


def text_too_long(max_length):
    return f"Enter {max_length} characters or fewer."


def file_type_invalid(types):
    return f"Upload a {types} file."


def file_too_large(mb):
    return f"The file must be smaller than {mb} MB."
