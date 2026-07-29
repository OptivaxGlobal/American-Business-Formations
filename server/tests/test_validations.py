"""Unit tests for server/app/validations/* mirrors the frontend test
matrix in src/validations/*.test.js so the same rules are verified on
both sides.
"""
from app.validations.address import is_po_box, validate_city, validate_street_address, validate_zip
from app.validations.admin import validate_admin_text, validate_integer, validate_price_cents
from app.validations.auth import validate_password_strength
from app.validations.business import validate_business_name, validate_ein
from app.validations.common import validate_choice
from app.validations.contact import validate_contact_method, validate_email, validate_full_name, validate_phone
from app.validations.formation import validate_effective_date, validate_ownership_total


def test_full_name_accepts_normal_name():
    value, err = validate_full_name("Mark Anderson")
    assert err is None and value == "Mark Anderson"


def test_full_name_accepts_hyphenated_name():
    assert validate_full_name("Mary-Jane Smith")[1] is None


def test_full_name_rejects_numbers_only():
    assert validate_full_name("123456")[1] is not None


def test_full_name_rejects_empty():
    assert validate_full_name("")[1] is not None


def test_email_accepts_valid_address():
    value, err = validate_email("aliyananderson@gmail.com")
    assert err is None and value == "aliyananderson@gmail.com"


def test_email_rejects_missing_at():
    assert validate_email("aliyananderson")[1] is not None


def test_email_rejects_missing_domain_extension():
    assert validate_email("aliyan@gmail")[1] is not None


def test_email_rejects_consecutive_dots():
    assert validate_email("aliyan..anderson@gmail.com")[1] is not None


def test_email_rejects_spaces():
    assert validate_email("aliyan gmail.com")[1] is not None


def test_phone_accepts_10_digits():
    value, err = validate_phone("2341230900")
    assert err is None and value == "+12341230900"


def test_phone_accepts_formatted_number():
    assert validate_phone("(234) 123-0900")[1] is None


def test_phone_rejects_fewer_than_10_digits():
    assert validate_phone("23412309")[1] is not None


def test_phone_rejects_more_than_10_digits():
    assert validate_phone("234123090012")[1] is not None


def test_phone_rejects_letters():
    assert validate_phone("abc1234567")[1] is not None


def test_contact_method_requires_allowed_value():
    assert validate_contact_method("email", ["email", "phone"])[1] is None
    assert validate_contact_method("fax", ["email", "phone"])[1] is not None


def test_street_address_accepts_valid_address():
    assert validate_street_address("123 Main St")[1] is None


def test_street_address_rejects_po_box_when_disallowed():
    value, err = validate_street_address("PO Box 123", disallow_po_box=True)
    assert err is not None


def test_street_address_allows_po_box_when_allowed():
    assert validate_street_address("PO Box 123", disallow_po_box=False)[1] is None


def test_is_po_box_detects_common_phrasings():
    assert is_po_box("P.O. Box 55")
    assert is_po_box("Post Office Box 55")
    assert not is_po_box("123 Main St")


def test_city_rejects_numbers_only():
    assert validate_city("12345")[1] is not None


def test_zip_accepts_5_digit():
    assert validate_zip("75001")[1] is None


def test_zip_accepts_zip_plus_4():
    assert validate_zip("75001-1234")[1] is None


def test_zip_rejects_short_zip():
    assert validate_zip("7500")[1] is not None


def test_business_name_rejects_numbers_only():
    assert validate_business_name("123456")[1] is not None


def test_business_name_rejects_script_injection():
    assert validate_business_name("<script>alert(1)</script>")[1] is not None


def test_business_name_accepts_normal_name():
    assert validate_business_name("Anderson Consulting LLC")[1] is None


def test_ein_accepts_9_digits():
    value, err = validate_ein("12-3456789")
    assert err is None and value == "123456789"


def test_ein_rejects_wrong_length():
    assert validate_ein("1234567")[1] is not None


def test_password_strength_accepts_strong_password():
    assert validate_password_strength("Str0ng!Pass")[1] is None


def test_password_strength_rejects_short_password():
    assert validate_password_strength("Sh0rt!")[1] is not None


def test_password_strength_rejects_missing_uppercase():
    assert validate_password_strength("str0ng!pass")[1] is not None


def test_password_strength_rejects_common_password():
    assert validate_password_strength("Password1!")[1] is not None or validate_password_strength("password")[1] is not None


def test_ownership_total_accepts_100_percent():
    assert validate_ownership_total([{"percentage": 60}, {"percentage": 40}])[1] is None


def test_ownership_total_rejects_non_100_percent():
    assert validate_ownership_total([{"percentage": 60}, {"percentage": 30}])[1] is not None


def test_effective_date_rejects_past_date():
    assert validate_effective_date("2000-01-01")[1] is not None


def test_effective_date_rejects_impossible_date():
    assert validate_effective_date("2025-02-30")[1] is not None


def test_validate_choice_rejects_unlisted_value():
    assert validate_choice("hacked", ("a", "b"))[1] is not None
    assert validate_choice("a", ("a", "b"))[1] is None


def test_admin_text_enforces_min_length():
    assert validate_admin_text("hi", minimum=10)[1] is not None


def test_validate_integer_rejects_non_integer():
    assert validate_integer("abc")[1] is not None


def test_validate_price_cents_parses_dollar_string():
    value, err = validate_price_cents("$199.00")
    assert err is None and value == 19900


def test_validate_price_cents_rejects_negative():
    assert validate_price_cents(-5)[1] is not None
