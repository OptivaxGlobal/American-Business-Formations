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


def test_lead_capture_accepts_source_and_email_only(client):
    # This is exactly the shape Resources.jsx's checklist form and
    # BusinessNameStartForm.jsx's fire-and-forget lead call send no
    # business name, no phone, just a source and an email.
    res = client.post("/api/leads", json={"source": "resource_checklist", "email": "founder@example.com"})
    assert res.status_code == 201
    assert res.json["data"]["source"] == "resource_checklist"
    assert res.json["data"]["email"] == "founder@example.com"


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
