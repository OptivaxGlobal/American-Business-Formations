from app.extensions import db
from app.models import Package, Order, Payment, AuditLog, User, Business


def _signup(client, payload):
    return client.post("/api/auth/signup", json=payload)


def _promote_to_admin(client, email, password):
    user = User.query.filter_by(email=email).first()
    user.role = "admin"
    db.session.commit()
    client.post("/api/auth/logout")
    client.post("/api/auth/login", json={"email": email, "password": password})


def _seed_package():
    db.session.add(Package(name="Accelerated", price_cents=20000, active=True))
    db.session.commit()


def _checkout(client, email, extra=None):
    """A package is always priced against a real business's formation
    state (see checkout.py) creates one here so these admin/dashboard
    tests, which only care about what happens to an order after it
    exists, don't have to re-drive the full applications flow."""
    owner = User.query.filter_by(email=email).first()
    business = Business(owner_id=owner.id, name="Test Ventures LLC", state="TX")
    db.session.add(business)
    db.session.commit()
    payload = {"package_id": "Accelerated", "business_id": business.id}
    if extra:
        payload.update(extra)
    return client.post("/api/checkout/session", json=payload)


def test_every_new_admin_route_rejects_a_customer(client, signup_payload):
    _signup(client, signup_payload)
    assert client.get("/api/admin/payment-status").status_code == 403
    assert client.patch("/api/admin/plans/add-ons/not-real", json={}).status_code == 403
    assert client.post("/api/admin/orders/not-real/record-offline-payment", json={}).status_code == 403
    assert client.get("/api/admin/support/threads").status_code == 403
    assert client.patch("/api/admin/content/testimonials/not-real", json={}).status_code == 403
    assert client.delete("/api/admin/content/testimonials/not-real").status_code == 403


def test_every_new_admin_route_rejects_an_anonymous_request(client):
    assert client.get("/api/admin/payment-status").status_code == 401
    assert client.get("/api/admin/support/threads").status_code == 401


def test_record_offline_payment_requires_reference_and_note(client, signup_payload, app):
    with app.app_context():
        _seed_package()
    _signup(client, signup_payload)
    checkout = _checkout(client, signup_payload["email"])
    order_id = checkout.json["data"]["order"]["id"]
    client.post("/api/auth/logout")

    admin_payload = {"name": "Ops", "email": "ops@example.com", "password": "Correct-Horse7"}
    client.post("/api/auth/signup", json=admin_payload)
    _promote_to_admin(client, admin_payload["email"], admin_payload["password"])

    res = client.post(f"/api/admin/orders/{order_id}/record-offline-payment", json={})
    assert res.status_code == 422
    assert "reference" in res.json["field_errors"]
    assert "note" in res.json["field_errors"]


def test_record_offline_payment_marks_order_paid_and_logs_audit(client, signup_payload, app):
    with app.app_context():
        _seed_package()
    _signup(client, signup_payload)
    checkout = _checkout(client, signup_payload["email"])
    order_id = checkout.json["data"]["order"]["id"]
    assert checkout.json["data"]["order"]["status"] == "awaiting_payment"
    client.post("/api/auth/logout")

    admin_payload = {"name": "Ops", "email": "ops@example.com", "password": "Correct-Horse7"}
    client.post("/api/auth/signup", json=admin_payload)
    _promote_to_admin(client, admin_payload["email"], admin_payload["password"])

    res = client.post(f"/api/admin/orders/{order_id}/record-offline-payment", json={
        "reference": "Zelle-12345", "note": "Customer paid via Zelle on request.",
    })
    assert res.status_code == 200
    assert res.json["data"]["status"] == "paid"

    payment = Payment.query.filter_by(order_id=order_id).order_by(Payment.created_at.desc()).first()
    assert payment.provider == "offline"
    assert "Zelle-12345" in payment.note

    audit = AuditLog.query.filter_by(action="Recorded offline payment").first()
    assert audit is not None
    assert order_id in (audit.details or "") or "Zelle-12345" in (audit.details or "")


def test_record_offline_payment_rejects_a_refunded_or_cancelled_order(client, signup_payload, app):
    with app.app_context():
        _seed_package()
    _signup(client, signup_payload)
    checkout = _checkout(client, signup_payload["email"])
    order_id = checkout.json["data"]["order"]["id"]
    client.post("/api/auth/logout")

    admin_payload = {"name": "Ops", "email": "ops@example.com", "password": "Correct-Horse7"}
    client.post("/api/auth/signup", json=admin_payload)
    _promote_to_admin(client, admin_payload["email"], admin_payload["password"])

    with app.app_context():
        order = Order.query.get(order_id)
        order.status = "refunded"
        db.session.commit()

    res = client.post(f"/api/admin/orders/{order_id}/record-offline-payment", json={
        "reference": "Zelle-99999", "note": "Should never be allowed.",
    })
    assert res.status_code == 409
    with app.app_context():
        assert Order.query.get(order_id).status == "refunded"


def test_customer_has_no_route_to_mark_their_own_order_paid(client, signup_payload, app):
    with app.app_context():
        _seed_package()
    _signup(client, signup_payload)
    checkout = _checkout(client, signup_payload["email"])
    order_id = checkout.json["data"]["order"]["id"]

    # The only customer-facing order route is the read-only GET below —
    # there is no PATCH/POST on /api/orders/* at all for a customer to hit.
    res = client.post(f"/api/orders/{order_id}/record-offline-payment", json={"reference": "x", "note": "x"})
    assert res.status_code == 404

    still = client.get(f"/api/orders/{order_id}")
    assert still.json["data"]["status"] == "awaiting_payment"


def test_editing_package_price_does_not_alter_an_existing_orders_total(client, signup_payload, app):
    with app.app_context():
        _seed_package()
    _signup(client, signup_payload)
    checkout = _checkout(client, signup_payload["email"])
    order_id = checkout.json["data"]["order"]["id"]
    original_total = checkout.json["data"]["order"]["total_cents"]
    client.post("/api/auth/logout")

    admin_payload = {"name": "Ops", "email": "ops@example.com", "password": "Correct-Horse7"}
    client.post("/api/auth/signup", json=admin_payload)
    _promote_to_admin(client, admin_payload["email"], admin_payload["password"])

    package = Package.query.filter_by(name="Accelerated").first()
    update = client.patch(f"/api/admin/plans/packages/{package.id}", json={"price_cents": 99999})
    assert update.status_code == 200

    order_after = Order.query.get(order_id)
    assert order_after.total_cents == original_total
    assert order_after.service_fee_cents == 20000  # unchanged from time of purchase


def test_add_on_update_requires_admin_and_persists(client, signup_payload, app):
    from app.models import AddOn
    with app.app_context():
        db.session.add(AddOn(slug="registered-agent", name="Registered agent (1 year)", price_cents=8000, recurring=True, active=True))
        db.session.commit()

    admin_payload = signup_payload
    _signup(client, admin_payload)
    add_on = AddOn.query.filter_by(slug="registered-agent").first()

    denied = client.patch(f"/api/admin/plans/add-ons/{add_on.id}", json={"price_cents": 9000})
    assert denied.status_code == 403

    _promote_to_admin(client, admin_payload["email"], admin_payload["password"])
    res = client.patch(f"/api/admin/plans/add-ons/{add_on.id}", json={"price_cents": 9000})
    assert res.status_code == 200
    assert res.json["data"]["price_cents"] == 9000
