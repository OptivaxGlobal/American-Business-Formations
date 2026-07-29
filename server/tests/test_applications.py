def _signed_in_client(client, signup_payload):
    client.post("/api/auth/signup", json=signup_payload)
    return client


def test_create_application_requires_auth(client):
    res = client.post("/api/applications", json={"business_name": "Test LLC"})
    assert res.status_code == 401


def test_create_application_saves_draft(client, signup_payload):
    _signed_in_client(client, signup_payload)
    res = client.post("/api/applications", json={"business_name": "Northwind Consulting LLC", "industry": "Professional Services"})
    assert res.status_code == 201
    assert res.json["data"]["business"]["name"] == "Northwind Consulting LLC"
    assert res.json["data"]["business"]["status"] == "draft"


def test_registered_office_rejects_po_box(client, signup_payload):
    _signed_in_client(client, signup_payload)
    create = client.post("/api/applications", json={"business_name": "Bright Path Studio"})
    business_id = create.json["data"]["business"]["id"]

    res = client.post("/api/applications", json={
        "business_id": business_id,
        "registered_agent_type": "other",
        "registered_agent_name": "Jamie Rivera",
        "registered_office_line1": "PO Box 123",
        "registered_office_city": "Austin",
        "registered_office_zip": "78701",
        "registered_agent_consent": True,
    })
    assert res.status_code == 422


def test_submit_requires_registered_agent_consent(client, signup_payload):
    _signed_in_client(client, signup_payload)
    create = client.post("/api/applications", json={"business_name": "Harborline Goods Co"})
    business_id = create.json["data"]["business"]["id"]

    res = client.post(f"/api/applications/{business_id}/submit")
    assert res.status_code == 422


def test_rejects_numbers_only_business_name(client, signup_payload):
    _signed_in_client(client, signup_payload)
    res = client.post("/api/applications", json={"business_name": "123456"})
    assert res.status_code == 422
    assert "business_name" in res.json["field_errors"]


def test_rejects_invalid_entity_type(client, signup_payload):
    _signed_in_client(client, signup_payload)
    res = client.post("/api/applications", json={"business_name": "Test LLC", "entity_type": "Corporation"})
    assert res.status_code == 422
    assert "entity_type" in res.json["field_errors"]


def test_rejects_ownership_not_totaling_100_percent(client, signup_payload):
    _signed_in_client(client, signup_payload)
    res = client.post("/api/applications", json={
        "business_name": "Test LLC",
        "owners": [{"name": "Alex Rivera", "percentage": 60}, {"name": "Sam Rivera", "percentage": 30}],
    })
    assert res.status_code == 422
    assert "owners" in res.json["field_errors"]


def test_rejects_invalid_effective_date(client, signup_payload):
    _signed_in_client(client, signup_payload)
    res = client.post("/api/applications", json={
        "business_name": "Test LLC",
        "effective_date_option": "delayed",
        "effective_date": "2000-01-01",
    })
    assert res.status_code == 422
    assert "effective_date" in res.json["field_errors"]
