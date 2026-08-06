from app.extensions import db
from app.models import Package, AddOn, Order, Payment, Business


def _seed_catalog():
    package = Package(name="Accelerated", price_cents=20000, active=True)
    inactive_package = Package(name="Retired", price_cents=99900, active=False)
    add_on = AddOn(slug="registered-agent", name="Registered agent (1 year)", price_cents=8000, recurring=True, active=True)
    inactive_add_on = AddOn(slug="old-addon", name="Old add-on", price_cents=1, active=False)
    db.session.add_all([package, inactive_package, add_on, inactive_add_on])
    db.session.commit()
    return package, add_on


def _signed_in_client(client, signup_payload):
    client.post("/api/auth/signup", json=signup_payload)
    return client


def test_checkout_requires_authentication(client):
    res = client.post("/api/checkout/session", json={"package_id": "Accelerated"})
    assert res.status_code == 401


def test_checkout_rejects_unknown_package(client, signup_payload):
    _seed_catalog()
    _signed_in_client(client, signup_payload)
    res = client.post("/api/checkout/session", json={"package_id": "NotARealPackage"})
    assert res.status_code == 422
    assert "package_id" in res.json["field_errors"]


def test_checkout_rejects_inactive_package(client, signup_payload):
    _seed_catalog()
    _signed_in_client(client, signup_payload)
    res = client.post("/api/checkout/session", json={"package_id": "Retired"})
    assert res.status_code == 422
    assert "package_id" in res.json["field_errors"]


def test_checkout_rejects_unknown_add_on(client, signup_payload):
    _seed_catalog()
    _signed_in_client(client, signup_payload)
    res = client.post("/api/checkout/session", json={"package_id": "Accelerated", "add_on_ids": ["not-a-real-add-on"]})
    assert res.status_code == 422
    assert "add_on_ids" in res.json["field_errors"]


def test_checkout_rejects_inactive_add_on(client, signup_payload):
    _seed_catalog()
    _signed_in_client(client, signup_payload)
    res = client.post("/api/checkout/session", json={"package_id": "Accelerated", "add_on_ids": ["old-addon"]})
    assert res.status_code == 422
    assert "add_on_ids" in res.json["field_errors"]


def test_checkout_ignores_client_supplied_price_and_uses_catalog_price(client, signup_payload, app):
    # The request body below deliberately includes price-shaped fields a
    # tampering client might try to send the endpoint must never read them.
    _seed_catalog()
    _signed_in_client(client, signup_payload)
    res = client.post("/api/checkout/session", json={
        "package_id": "Accelerated",
        "price_cents": 1,
        "total_cents": 1,
        "items": [{"type": "plan", "name": "Accelerated", "price_cents": 1}],
    })
    assert res.status_code == 202
    order = res.json["data"]["order"]
    # $200.00 package price from the catalog, not the $0.01 the request tried
    # to supply. A package always carries the real Texas state filing fee
    # alongside it (proven separately and more fully by
    # test_checkout_computes_totals_from_catalog_and_state_fee below) — this
    # assertion previously expected total_cents to equal the service fee
    # alone, which was simply wrong (the state fee was never optional here),
    # and had never been caught because this suite had never actually been
    # run before Part 4/5.
    expected_state_fee = app.config["TEXAS_FILING_FEE"] * 100
    assert order["service_fee_cents"] == 20000
    assert order["total_cents"] == 20000 + expected_state_fee


def test_checkout_computes_totals_from_catalog_and_state_fee(client, signup_payload, app):
    _seed_catalog()
    _signed_in_client(client, signup_payload)
    res = client.post("/api/checkout/session", json={"package_id": "Accelerated", "add_on_ids": ["registered-agent"]})
    assert res.status_code == 202
    order = res.json["data"]["order"]
    expected_state_fee = app.config["TEXAS_FILING_FEE"] * 100
    assert order["service_fee_cents"] == 20000
    assert order["add_on_fee_cents"] == 8000
    assert order["state_fee_cents"] == expected_state_fee
    assert order["total_cents"] == 20000 + 8000 + expected_state_fee


def test_checkout_rejects_unauthorized_business_id(client, signup_payload):
    _seed_catalog()
    _signed_in_client(client, signup_payload)
    res = client.post("/api/checkout/session", json={"package_id": "Accelerated", "business_id": "not-owned-or-real"})
    assert res.status_code == 404


def test_checkout_never_creates_a_paid_order_when_payments_are_not_configured(client, signup_payload):
    _seed_catalog()
    _signed_in_client(client, signup_payload)
    res = client.post("/api/checkout/session", json={"package_id": "Accelerated"})
    assert res.status_code == 202
    order = res.json["data"]["order"]
    assert order["status"] == "awaiting_payment"
    assert res.json["data"]["checkout_url"] is None
    db_order = Order.query.filter_by(order_number=order["order_number"]).first()
    assert db_order.status == "awaiting_payment"
    payment = Payment.query.filter_by(order_id=db_order.id).first()
    assert payment is not None
    assert payment.status == "not_collected"


def test_checkout_idempotency_key_replay_returns_same_order_not_a_duplicate(client, signup_payload):
    _seed_catalog()
    _signed_in_client(client, signup_payload)
    key = "retry-key-123"
    first = client.post("/api/checkout/session", json={"package_id": "Accelerated", "idempotency_key": key})
    second = client.post("/api/checkout/session", json={"package_id": "Accelerated", "idempotency_key": key})
    assert first.status_code == 202
    assert second.status_code == 200
    assert first.json["data"]["order"]["order_number"] == second.json["data"]["order"]["order_number"]
    assert Order.query.filter_by(idempotency_key=key).count() == 1


def test_stripe_webhook_never_downgrades_an_already_paid_order(client, signup_payload, monkeypatch):
    """A stray/duplicate/reordered 'checkout.session.completed' or
    'payment_intent.payment_failed' webhook event must never flip an
    order that's already paid (or in a terminal refunded/cancelled state)
    back to paid/failed only orders in ORDER_STATUSES_PAYABLE_FROM can
    ever transition. Bypasses real Stripe signature verification (no
    Stripe keys are configured in the test environment) to isolate the
    status-transition guard in checkout.py itself."""
    _seed_catalog()
    _signed_in_client(client, signup_payload)
    checkout = client.post("/api/checkout/session", json={"package_id": "Accelerated"})
    order_id = checkout.json["data"]["order"]["id"]
    order = Order.query.get(order_id)
    order.status = "paid"
    order.stripe_checkout_session_id = "cs_test_123"
    db.session.commit()

    import app.api.checkout as checkout_module
    monkeypatch.setattr(checkout_module, "verify_webhook_signature", lambda payload, sig: {
        "id": "evt_test_1",
        "type": "checkout.session.completed",
        "data": {"object": {"id": "cs_test_123"}},
    })

    res = client.post("/api/webhooks/stripe", json={}, headers={"Stripe-Signature": "t=1,v1=fake"})
    assert res.status_code == 200
    assert Order.query.get(order_id).status == "paid"  # unchanged, not re-processed as a new payment
    assert Payment.query.filter_by(order_id=order_id, provider="stripe").count() == 0
