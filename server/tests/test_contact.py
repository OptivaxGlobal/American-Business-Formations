def test_contact_requires_valid_email(client):
    res = client.post("/api/contact", json={"email": "not-an-email", "message": "Hello"})
    assert res.status_code == 422


def test_contact_requires_message(client):
    res = client.post("/api/contact", json={"email": "person@example.com", "message": ""})
    assert res.status_code == 422


def test_contact_accepts_valid_submission(client):
    res = client.post("/api/contact", json={
        "email": "person@example.com", "first_name": "Jamie", "last_name": "Rivera",
        "message": "I have a question about registered agents.",
    })
    assert res.status_code == 201
    assert res.json["ok"] is True


def test_lead_capture_records_source(client):
    res = client.post("/api/leads", json={"source": "business_name_form", "businessName": "Bright Path Studio"})
    assert res.status_code == 201
    assert res.json["data"]["source"] == "business_name_form"


def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json["ok"] is True


def test_contact_rejects_numbers_only_name(client):
    res = client.post("/api/contact", json={
        "email": "person@example.com", "first_name": "123456", "last_name": "Rivera",
        "message": "I have a question about registered agents.",
    })
    assert res.status_code == 422
    assert "first_name" in res.json["field_errors"]


def test_contact_rejects_phone_with_too_many_digits(client):
    res = client.post("/api/contact", json={
        "email": "person@example.com", "first_name": "Jamie", "last_name": "Rivera",
        "phone": "234123090012", "message": "I have a question about registered agents.",
    })
    assert res.status_code == 422
    assert "phone" in res.json["field_errors"]


def test_contact_rejects_message_under_minimum_length(client):
    res = client.post("/api/contact", json={
        "email": "person@example.com", "first_name": "Jamie", "last_name": "Rivera",
        "message": "too short",
    })
    assert res.status_code == 422
