from app.extensions import db
from app.models import User


def _promote_to_admin(email):
    user = User.query.filter_by(email=email).first()
    user.role = "admin"
    db.session.commit()


def test_anonymous_cannot_access_admin_overview(client):
    res = client.get("/api/admin/overview")
    assert res.status_code == 401


def test_customer_cannot_access_admin_overview(client, signup_payload):
    client.post("/api/auth/signup", json=signup_payload)
    res = client.get("/api/admin/overview")
    assert res.status_code == 403


def test_admin_can_access_admin_overview(client, signup_payload):
    client.post("/api/auth/signup", json=signup_payload)
    _promote_to_admin(signup_payload["email"])

    # The cookie issued at signup still carries the "customer" role claim
    # baked in at token-creation time a role change only takes effect
    # once a fresh token is issued, so log back in after the promotion.
    client.post("/api/auth/logout")
    login_res = client.post("/api/auth/login", json={
        "email": signup_payload["email"], "password": signup_payload["password"],
    })
    assert login_res.status_code == 200
    assert login_res.json["data"]["role"] == "admin"

    res = client.get("/api/admin/overview")
    assert res.status_code == 200
