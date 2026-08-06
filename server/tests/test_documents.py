import io


def _signup(client, payload):
    return client.post("/api/auth/signup", json=payload)


def _second_user_payload():
    return {"name": "Alex Rivera", "email": "alex@example.com", "password": "Correct-Horse7"}


def _create_business(client):
    res = client.post("/api/applications", json={"business_name": "Riverside Consulting LLC"})
    return res.json["data"]["business"]["id"]


PDF_BYTES = b"%PDF-1.4\n%some minimal pdf-looking bytes\n"


def test_upload_requires_ownership_of_the_business(client, signup_payload):
    _signup(client, signup_payload)
    business_id = _create_business(client)
    client.post("/api/auth/logout")

    client.post("/api/auth/signup", json=_second_user_payload())
    res = client.post(
        f"/api/documents/{business_id}/upload",
        data={"file": (io.BytesIO(PDF_BYTES), "test.pdf")},
        content_type="multipart/form-data",
    )
    assert res.status_code == 404


def test_upload_accepts_a_valid_pdf(client, signup_payload):
    _signup(client, signup_payload)
    business_id = _create_business(client)

    res = client.post(
        f"/api/documents/{business_id}/upload",
        data={"file": (io.BytesIO(PDF_BYTES), "formation.pdf")},
        content_type="multipart/form-data",
    )
    assert res.status_code == 201
    assert res.json["data"]["file_name"] == "formation.pdf"


def test_upload_rejects_a_file_whose_contents_dont_match_its_extension(client, signup_payload):
    _signup(client, signup_payload)
    business_id = _create_business(client)

    html_bytes_renamed_as_pdf = b"<html><body><script>alert(1)</script></body></html>"
    res = client.post(
        f"/api/documents/{business_id}/upload",
        data={"file": (io.BytesIO(html_bytes_renamed_as_pdf), "malicious.pdf")},
        content_type="multipart/form-data",
    )
    assert res.status_code == 422


def test_upload_rejects_disallowed_extension_regardless_of_content(client, signup_payload):
    _signup(client, signup_payload)
    business_id = _create_business(client)

    res = client.post(
        f"/api/documents/{business_id}/upload",
        data={"file": (io.BytesIO(b"#!/bin/sh\necho hi\n"), "script.sh")},
        content_type="multipart/form-data",
    )
    assert res.status_code == 422


def test_upload_rejects_svg_even_if_extension_were_allowed(client, signup_payload):
    _signup(client, signup_payload)
    business_id = _create_business(client)

    res = client.post(
        f"/api/documents/{business_id}/upload",
        data={"file": (io.BytesIO(b"<svg onload='alert(1)'></svg>"), "image.svg")},
        content_type="multipart/form-data",
    )
    assert res.status_code == 422


def test_download_sets_private_no_store_cache_header(client, signup_payload):
    _signup(client, signup_payload)
    business_id = _create_business(client)
    upload = client.post(
        f"/api/documents/{business_id}/upload",
        data={"file": (io.BytesIO(PDF_BYTES), "formation.pdf")},
        content_type="multipart/form-data",
    )
    document_id = upload.json["data"]["id"]

    res = client.get(f"/api/documents/{business_id}/{document_id}/download")
    assert res.status_code == 200
    assert res.headers.get("Cache-Control") == "private, no-store"


def test_customer_cannot_download_another_customers_document(client, signup_payload):
    _signup(client, signup_payload)
    business_id = _create_business(client)
    upload = client.post(
        f"/api/documents/{business_id}/upload",
        data={"file": (io.BytesIO(PDF_BYTES), "formation.pdf")},
        content_type="multipart/form-data",
    )
    document_id = upload.json["data"]["id"]
    client.post("/api/auth/logout")

    client.post("/api/auth/signup", json=_second_user_payload())
    res = client.get(f"/api/documents/{business_id}/{document_id}/download")
    assert res.status_code == 404


def test_document_list_never_exposes_the_raw_storage_path(client, signup_payload):
    _signup(client, signup_payload)
    business_id = _create_business(client)
    client.post(
        f"/api/documents/{business_id}/upload",
        data={"file": (io.BytesIO(PDF_BYTES), "formation.pdf")},
        content_type="multipart/form-data",
    )
    res = client.get(f"/api/documents/{business_id}")
    assert res.status_code == 200
    assert "storage_path" not in res.json["data"][0]
