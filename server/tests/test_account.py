from datetime import datetime, timedelta, timezone

from app.extensions import db
from app.models import User, EmailVerificationToken


def _signup(client, payload):
    return client.post("/api/auth/signup", json=payload)


def test_profile_update_persists_name_phone_and_preferences(client, signup_payload):
    _signup(client, signup_payload)
    res = client.patch("/api/account/profile", json={
        "name": "Jordan A. Lee", "phone": "5125550100",
        "email_reminders_enabled": False, "sms_reminders_enabled": True, "marketing_consent": True,
    })
    assert res.status_code == 200
    assert res.json["data"]["name"] == "Jordan A. Lee"
    assert res.json["data"]["email_reminders_enabled"] is False
    assert res.json["data"]["sms_reminders_enabled"] is True
    assert res.json["data"]["marketing_consent"] is True

    # Survives a fresh /me read, not just the response of the update itself.
    me = client.get("/api/auth/me")
    assert me.json["data"]["name"] == "Jordan A. Lee"


def test_profile_update_ignores_a_role_field_in_the_payload(client, signup_payload):
    _signup(client, signup_payload)
    res = client.patch("/api/account/profile", json={"name": "Jordan Lee", "role": "admin", "is_active": False})
    assert res.status_code == 200
    assert res.json["data"]["role"] == "customer"

    me = client.get("/api/auth/me")
    assert me.json["data"]["role"] == "customer"


def test_email_change_does_not_update_email_or_verified_flag_until_confirmed(client, signup_payload, app):
    signup_res = _signup(client, signup_payload)
    original_email = signup_res.json["data"]["email"]

    res = client.patch("/api/account/email", json={"email": "new-address@example.com"})
    assert res.status_code == 200
    assert res.json["data"]["pending_email"] == "new-address@example.com"

    me = client.get("/api/auth/me")
    assert me.json["data"]["email"] == original_email
    assert me.json["data"]["pending_email"] == "new-address@example.com"

    with app.app_context():
        user = User.query.filter_by(email=original_email).first()
        assert user.pending_email == "new-address@example.com"
        assert user.email == original_email


def test_email_change_swaps_over_only_after_verification(client, signup_payload, app):
    _signup(client, signup_payload)
    client.patch("/api/account/email", json={"email": "new-address@example.com"})

    with app.app_context():
        user = User.query.filter_by(pending_email="new-address@example.com").first()
        token = EmailVerificationToken(user_id=user.id, expires_at=datetime.now(timezone.utc) + timedelta(hours=1))
        db.session.add(token)
        db.session.commit()
        token_value = token.token

    res = client.post("/api/auth/verify-email", json={"token": token_value})
    assert res.status_code == 200

    me = client.get("/api/auth/me")
    assert me.json["data"]["email"] == "new-address@example.com"
    assert me.json["data"]["pending_email"] is None
    assert me.json["data"]["email_verified"] is True


def test_email_change_rejects_an_email_already_in_use(client, signup_payload):
    _signup(client, signup_payload)
    client.post("/api/auth/logout")
    other = client.post("/api/auth/signup", json={"name": "Alex Rivera", "email": "alex@example.com", "password": "Correct-Horse7"})
    assert other.status_code == 201

    res = client.patch("/api/account/email", json={"email": signup_payload["email"]})
    assert res.status_code == 409


def test_password_change_requires_correct_current_password(client, signup_payload):
    _signup(client, signup_payload)
    res = client.post("/api/account/password", json={"current_password": "totally-wrong", "new_password": "New-Str0ng!Pass"})
    assert res.status_code == 401


def test_password_change_succeeds_and_new_password_works_on_next_login(client, signup_payload):
    _signup(client, signup_payload)
    res = client.post("/api/account/password", json={
        "current_password": signup_payload["password"], "new_password": "New-Str0ng!Pass9",
    })
    assert res.status_code == 200

    client.post("/api/auth/logout")
    login_res = client.post("/api/auth/login", json={"email": signup_payload["email"], "password": "New-Str0ng!Pass9"})
    assert login_res.status_code == 200
