"""Covers the "no County field" change: Business Basics no longer collects
a county from the customer anywhere; the one state whose own formation
document requires it (New York) gets it derived automatically from the
verified principal address instead. Also covers that repeated autosaves
with the same address don't create duplicate/orphaned Address rows."""
from app.models import Business, Address
from app.services import geocoding


def _signup(client, payload):
    return client.post("/api/auth/signup", json=payload)


def test_county_is_never_accepted_from_the_client(client, signup_payload):
    """Even if a crafted request includes principal_county, the server
    never persists it directly only the derived value (or nothing) ever
    lands in Address.county."""
    _signup(client, signup_payload)
    res = client.post("/api/applications", json={
        "business_name": "Bright Path Studio LLC", "state": "TX",
        "principal_line1": "123 Main St", "principal_city": "Austin", "principal_zip": "78701",
        "principal_county": "Not A Real County",
    })
    assert res.status_code == 201
    business_id = res.json["data"]["business"]["id"]
    business = Business.query.get(business_id)
    assert business.principal_address.county != "Not A Real County"


def test_new_york_derives_county_from_the_verified_address(client, signup_payload, monkeypatch):
    monkeypatch.setattr(geocoding, "derive_county", lambda *a, **k: "New York County")
    # applications.py imports derive_county by name, so the patch target
    # that actually takes effect is the imported reference there.
    import app.api.applications as applications_module
    monkeypatch.setattr(applications_module, "derive_county", lambda *a, **k: "New York County")

    _signup(client, signup_payload)
    res = client.post("/api/applications", json={
        "business_name": "Empire Consulting LLC", "state": "NY",
        "principal_line1": "1 Wall St", "principal_city": "New York", "principal_zip": "10005",
    })
    assert res.status_code == 201
    business_id = res.json["data"]["business"]["id"]
    business = Business.query.get(business_id)
    assert business.principal_address.county == "New York County"


def test_non_required_states_never_derive_a_county(client, signup_payload, monkeypatch):
    import app.api.applications as applications_module
    calls = []
    monkeypatch.setattr(applications_module, "derive_county", lambda *a, **k: calls.append(1) or "Should Not Be Called")

    _signup(client, signup_payload)
    res = client.post("/api/applications", json={
        "business_name": "Bright Path Studio LLC", "state": "TX",
        "principal_line1": "123 Main St", "principal_city": "Austin", "principal_zip": "78701",
    })
    assert res.status_code == 201
    business_id = res.json["data"]["business"]["id"]
    business = Business.query.get(business_id)
    assert business.principal_address.county is None
    assert calls == []


def test_repeated_autosave_with_the_same_address_does_not_create_duplicate_rows(client, signup_payload):
    _signup(client, signup_payload)
    payload = {"business_name": "Bright Path Studio LLC", "state": "TX", "principal_line1": "123 Main St", "principal_city": "Austin", "principal_zip": "78701"}
    create = client.post("/api/applications", json=payload)
    business_id = create.json["data"]["business"]["id"]

    for _ in range(3):
        client.post("/api/applications", json={**payload, "business_id": business_id})

    assert Address.query.count() == 1


def test_changing_the_address_updates_the_same_record_and_clears_a_stale_county(client, signup_payload, monkeypatch):
    import app.api.applications as applications_module
    monkeypatch.setattr(applications_module, "derive_county", lambda *a, **k: "New York County")

    _signup(client, signup_payload)
    create = client.post("/api/applications", json={
        "business_name": "Empire Consulting LLC", "state": "NY",
        "principal_line1": "1 Wall St", "principal_city": "New York", "principal_zip": "10005",
    })
    business_id = create.json["data"]["business"]["id"]
    assert Business.query.get(business_id).principal_address.county == "New York County"

    monkeypatch.setattr(applications_module, "derive_county", lambda *a, **k: "Kings County")
    client.post("/api/applications", json={
        "business_id": business_id, "principal_line1": "1 MetroTech Center", "principal_city": "Brooklyn", "principal_zip": "11201",
    })

    business = Business.query.get(business_id)
    assert Address.query.count() == 1  # still the same row, updated in place
    assert business.principal_address.line1 == "1 MetroTech Center"
    assert business.principal_address.county == "Kings County"
