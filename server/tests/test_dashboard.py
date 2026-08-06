from app.extensions import db
from app.models import Package


def _signup(client, payload):
    return client.post("/api/auth/signup", json=payload)


def _second_user_payload():
    return {"name": "Alex Rivera", "email": "alex@example.com", "password": "Correct-Horse7"}


def test_list_businesses_returns_only_my_own(client, signup_payload):
    _signup(client, signup_payload)
    client.post("/api/applications", json={"business_name": "Riverside Consulting LLC"})

    res = client.get("/api/applications")
    assert res.status_code == 200
    assert len(res.json["data"]) == 1
    assert res.json["data"][0]["business"]["name"] == "Riverside Consulting LLC"


def test_list_businesses_never_includes_another_users_business(client, signup_payload):
    _signup(client, signup_payload)
    client.post("/api/applications", json={"business_name": "Riverside Consulting LLC"})
    client.post("/api/auth/logout")

    other_client = client
    other_client.post("/api/auth/signup", json=_second_user_payload())
    res = other_client.get("/api/applications")
    assert res.status_code == 200
    assert res.json["data"] == []


def test_get_application_404s_for_a_business_id_i_dont_own(client, signup_payload):
    _signup(client, signup_payload)
    create = client.post("/api/applications", json={"business_name": "Riverside Consulting LLC"})
    business_id = create.json["data"]["business"]["id"]
    client.post("/api/auth/logout")

    client.post("/api/auth/signup", json=_second_user_payload())
    res = client.get(f"/api/applications/{business_id}")
    assert res.status_code == 404


def test_list_orders_only_returns_the_callers_orders(client, signup_payload, app):
    with app.app_context():
        db.session.add(Package(name="Accelerated", price_cents=20000, active=True))
        db.session.commit()

    _signup(client, signup_payload)
    client.post("/api/checkout/session", json={"package_id": "Accelerated"})
    client.post("/api/auth/logout")

    client.post("/api/auth/signup", json=_second_user_payload())
    res = client.get("/api/orders")
    assert res.status_code == 200
    assert res.json["data"] == []


def test_order_created_via_checkout_shows_awaiting_payment_never_paid(client, signup_payload, app):
    with app.app_context():
        db.session.add(Package(name="Accelerated", price_cents=20000, active=True))
        db.session.commit()

    _signup(client, signup_payload)
    checkout_res = client.post("/api/checkout/session", json={"package_id": "Accelerated"})
    order_id = checkout_res.json["data"]["order"]["id"]

    res = client.get(f"/api/orders/{order_id}")
    assert res.status_code == 200
    assert res.json["data"]["status"] == "awaiting_payment"
    assert res.json["data"]["status"] != "paid"
