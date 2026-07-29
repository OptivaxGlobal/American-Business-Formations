def test_signup_creates_account(client, signup_payload):
    res = client.post("/api/auth/signup", json=signup_payload)
    assert res.status_code == 201
    assert res.json["ok"] is True
    assert res.json["data"]["email"] == signup_payload["email"]


def test_signup_rejects_weak_password(client, signup_payload):
    signup_payload["password"] = "short"
    res = client.post("/api/auth/signup", json=signup_payload)
    assert res.status_code == 422


def test_signup_rejects_duplicate_email(client, signup_payload):
    client.post("/api/auth/signup", json=signup_payload)
    res = client.post("/api/auth/signup", json=signup_payload)
    assert res.status_code == 409


def test_login_succeeds_with_correct_password(client, signup_payload):
    client.post("/api/auth/signup", json=signup_payload)
    res = client.post("/api/auth/login", json={
        "email": signup_payload["email"], "password": signup_payload["password"],
    })
    assert res.status_code == 200
    assert res.json["data"]["email"] == signup_payload["email"]


def test_login_rejects_wrong_password(client, signup_payload):
    client.post("/api/auth/signup", json=signup_payload)
    res = client.post("/api/auth/login", json={
        "email": signup_payload["email"], "password": "totally-wrong-password",
    })
    assert res.status_code == 401


def test_login_locks_account_after_repeated_failures(client, signup_payload):
    client.post("/api/auth/signup", json=signup_payload)
    for _ in range(5):
        client.post("/api/auth/login", json={"email": signup_payload["email"], "password": "wrong"})
    res = client.post("/api/auth/login", json={
        "email": signup_payload["email"], "password": signup_payload["password"],
    })
    assert res.status_code == 423


def test_me_requires_authentication(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_signup_rejects_password_missing_complexity(client, signup_payload):
    signup_payload["password"] = "alllowercase1"
    res = client.post("/api/auth/signup", json=signup_payload)
    assert res.status_code == 422
    assert "password" in res.json["field_errors"]


def test_signup_rejects_numbers_only_name(client, signup_payload):
    signup_payload["name"] = "123456"
    res = client.post("/api/auth/signup", json=signup_payload)
    assert res.status_code == 422
    assert "name" in res.json["field_errors"]


def test_login_error_message_does_not_reveal_which_field_was_wrong(client, signup_payload):
    client.post("/api/auth/signup", json=signup_payload)
    res = client.post("/api/auth/login", json={
        "email": signup_payload["email"], "password": "totally-wrong-password",
    })
    assert res.status_code == 401
    assert res.json["message"] == "The email or password is incorrect."
