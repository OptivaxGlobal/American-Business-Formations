"""Covers the new backend surface added for the state-aware LLC formation
enhancement: server-side entity-type-per-state enforcement, registered-agent
e-signature evidence, generated-document review acknowledgement, the
document upload/list/delete/status-review endpoints, and the generalized
(all-21-states) compliance checklist seed."""
import io

from app.extensions import db
from app.models import User, Business, RegisteredAgent, Document


def _signup(client, payload):
    return client.post("/api/auth/signup", json=payload)


def _promote_to_admin(client, email, password):
    user = User.query.filter_by(email=email).first()
    user.role = "admin"
    db.session.commit()
    client.post("/api/auth/logout")
    client.post("/api/auth/login", json={"email": email, "password": password})


# --- Entity type is state-aware server-side, never just in the UI ---------

def test_series_llc_is_rejected_in_a_state_that_does_not_support_it(client, signup_payload):
    _signup(client, signup_payload)
    res = client.post("/api/applications", json={
        "business_name": "Golden State Ventures LLC", "state": "CA", "entity_type": "Series LLC",
    })
    assert res.status_code == 422
    assert "entity_type" in res.json["field_errors"]


def test_series_llc_is_accepted_in_a_state_that_supports_it(client, signup_payload):
    _signup(client, signup_payload)
    res = client.post("/api/applications", json={
        "business_name": "Lone Star Holdings LLC", "state": "TX", "entity_type": "Series LLC",
    })
    assert res.status_code == 201
    assert res.json["data"]["business"]["entity_type"] == "Series LLC"


def test_changing_state_to_one_that_no_longer_supports_the_entity_type_is_rejected(client, signup_payload):
    _signup(client, signup_payload)
    create = client.post("/api/applications", json={"business_name": "Lone Star Holdings LLC", "state": "TX", "entity_type": "Series LLC"})
    business_id = create.json["data"]["business"]["id"]
    # Same autosave call also switches the state to California, which
    # doesn't support Series LLC must be rejected against the *new*
    # state, not whatever was previously saved.
    res = client.post("/api/applications", json={"business_id": business_id, "state": "CA", "entity_type": "Series LLC"})
    assert res.status_code == 422
    assert "entity_type" in res.json["field_errors"]


def test_pllc_is_rejected_in_california(client, signup_payload):
    _signup(client, signup_payload)
    res = client.post("/api/applications", json={
        "business_name": "Bay Area Law Group LLC", "state": "CA", "entity_type": "PLLC",
    })
    assert res.status_code == 422
    assert "entity_type" in res.json["field_errors"]


# --- Registered agent e-signature evidence (Part 15) -----------------------

def test_registered_agent_signer_name_is_persisted(client, signup_payload):
    _signup(client, signup_payload)
    create = client.post("/api/applications", json={"business_name": "Bright Path Studio LLC"})
    business_id = create.json["data"]["business"]["id"]

    res = client.post("/api/applications", json={
        "business_id": business_id,
        "registered_agent_type": "abf",
        "registered_agent_consent": True,
        "registered_agent_signer_name": "Jordan Lee",
    })
    assert res.status_code == 201

    agent = RegisteredAgent.query.filter_by(business_id=business_id).first()
    assert agent.signer_name == "Jordan Lee"
    assert agent.consent_given is True
    assert agent.consent_given_at is not None


# --- Generated-document review acknowledgement (Part 16) -------------------

def test_formation_review_approval_records_a_confirmation_timestamp_and_version(client, signup_payload):
    _signup(client, signup_payload)
    create = client.post("/api/applications", json={"business_name": "Bright Path Studio LLC"})
    business_id = create.json["data"]["business"]["id"]
    assert create.json["data"]["application"]["formation_data_confirmed_at"] is None
    assert create.json["data"]["application"]["formation_data_version"] == 0

    approve = client.post("/api/applications", json={
        "business_id": business_id, "formation_review_approved": True, "formation_review_version": 1,
    })
    assert approve.status_code == 201
    assert approve.json["data"]["application"]["formation_data_confirmed_at"] is not None
    assert approve.json["data"]["application"]["formation_data_version"] == 1

    # An unrelated autosave (no formation_review_approved key at all) must
    # never silently clear a previously recorded approval.
    unrelated = client.post("/api/applications", json={"business_id": business_id, "industry": "Technology"})
    assert unrelated.json["data"]["application"]["formation_data_confirmed_at"] is not None
    assert unrelated.json["data"]["application"]["formation_data_version"] == 1


# --- Documents: upload / list / delete / staff status review ---------------

def _create_business(client, name="Bright Path Studio LLC", state="TX"):
    res = client.post("/api/applications", json={"business_name": name, "state": state})
    return res.json["data"]["business"]["id"]


def test_document_upload_list_and_delete(client, signup_payload):
    _signup(client, signup_payload)
    business_id = _create_business(client)

    upload = client.post(
        f"/api/documents/{business_id}/upload",
        data={"file": (io.BytesIO(b"%PDF-1.4 fake pdf contents"), "license.pdf"), "document_type": "professional_license", "requirement_type": "conditional"},
        content_type="multipart/form-data",
    )
    assert upload.status_code == 201
    assert upload.json["data"]["status"] == "uploaded"
    assert upload.json["data"]["requirement_type"] == "conditional"
    doc_id = upload.json["data"]["id"]

    listing = client.get(f"/api/documents/{business_id}")
    assert listing.status_code == 200
    assert len(listing.json["data"]) == 1
    # Customer-facing shape never leaks reviewer_notes/uploaded_by_admin internals.
    assert "reviewer_notes" not in listing.json["data"][0]

    delete = client.delete(f"/api/documents/{business_id}/{doc_id}")
    assert delete.status_code == 200
    assert client.get(f"/api/documents/{business_id}").json["data"] == []


def test_document_upload_rejects_a_disguised_executable(client, signup_payload):
    _signup(client, signup_payload)
    business_id = _create_business(client)
    res = client.post(
        f"/api/documents/{business_id}/upload",
        data={"file": (io.BytesIO(b"<html><script>evil()</script></html>"), "resume.pdf")},
        content_type="multipart/form-data",
    )
    # Claims to be a .pdf; the actual bytes don't match the PDF signature.
    assert res.status_code == 422


def test_customer_cannot_access_another_customers_documents(client, signup_payload):
    _signup(client, signup_payload)
    business_id = _create_business(client)
    client.post(f"/api/documents/{business_id}/upload", data={"file": (io.BytesIO(b"%PDF-1.4 x"), "a.pdf")}, content_type="multipart/form-data")
    client.post("/api/auth/logout")

    _signup(client, {"name": "Alex Rivera", "email": "alex@example.com", "password": "Correct-Horse7"})
    assert client.get(f"/api/documents/{business_id}").status_code == 404
    assert client.post(f"/api/documents/{business_id}/upload", data={"file": (io.BytesIO(b"%PDF-1.4 x"), "b.pdf")}, content_type="multipart/form-data").status_code == 404


def test_only_staff_can_update_document_status(client, signup_payload):
    _signup(client, signup_payload)
    business_id = _create_business(client)
    upload = client.post(f"/api/documents/{business_id}/upload", data={"file": (io.BytesIO(b"%PDF-1.4 x"), "a.pdf")}, content_type="multipart/form-data")
    doc_id = upload.json["data"]["id"]

    # The document's own owner is not staff and gets a real 403, not a silent no-op.
    forbidden = client.patch(f"/api/documents/{business_id}/{doc_id}/status", json={"status": "approved"})
    assert forbidden.status_code == 403

    _promote_to_admin(client, signup_payload["email"], signup_payload["password"])
    approve = client.patch(f"/api/documents/{business_id}/{doc_id}/status", json={"status": "approved", "reviewer_notes": "Looks good"})
    assert approve.status_code == 200
    assert approve.json["data"]["status"] == "approved"
    assert approve.json["data"]["reviewer_notes"] == "Looks good"
    assert approve.json["data"]["reviewed_at"] is not None

    doc = Document.query.get(doc_id)
    assert doc.status == "approved"
    assert doc.reviewed_by is not None


# --- Compliance checklist is state-aware, not Texas-only -------------------

def test_compliance_seed_uses_the_businesss_own_state(client, signup_payload):
    _signup(client, signup_payload)
    business_id = _create_business(client, name="Empire Consulting LLC", state="NY")

    seed = client.post(f"/api/compliance/{business_id}/seed")
    assert seed.status_code == 201
    task_keys = {t["task_key"] for t in seed.json["data"]}
    assert "ny-publication" in task_keys
    assert "tx-public-information-report" not in task_keys

    # Re-seeding never duplicates existing tasks.
    reseed = client.post(f"/api/compliance/{business_id}/seed")
    assert len(reseed.json["data"]) == len(seed.json["data"])


def test_compliance_seed_texas_still_returns_the_original_texas_checklist(client, signup_payload):
    _signup(client, signup_payload)
    business_id = _create_business(client, name="Bright Path Studio LLC", state="TX")
    seed = client.post(f"/api/compliance/{business_id}/seed")
    task_keys = {t["task_key"] for t in seed.json["data"]}
    assert "tx-public-information-report" in task_keys
    assert "tx-franchise-tax" in task_keys
