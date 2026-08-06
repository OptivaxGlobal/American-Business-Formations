def _signup(client, payload):
    return client.post("/api/auth/signup", json=payload)


def _second_user_payload():
    return {"name": "Alex Rivera", "email": "alex@example.com", "password": "Correct-Horse7"}


def test_create_thread_and_read_it_back(client, signup_payload):
    _signup(client, signup_payload)
    create = client.post("/api/support/threads", json={"subject": "Question about EIN timing", "message": "How long does an EIN filing usually take to confirm?"})
    assert create.status_code == 201
    thread_id = create.json["data"]["id"]

    res = client.get(f"/api/support/threads/{thread_id}")
    assert res.status_code == 200
    assert res.json["data"]["subject"] == "Question about EIN timing"
    assert len(res.json["data"]["messages"]) == 1
    assert res.json["data"]["messages"][0]["is_staff"] is False


def test_reply_appends_a_message(client, signup_payload):
    _signup(client, signup_payload)
    create = client.post("/api/support/threads", json={"subject": "Question", "message": "Initial message here please."})
    thread_id = create.json["data"]["id"]

    reply = client.post(f"/api/support/threads/{thread_id}/messages", json={"message": "Following up on this."})
    assert reply.status_code == 201

    res = client.get(f"/api/support/threads/{thread_id}")
    assert len(res.json["data"]["messages"]) == 2


def test_another_users_thread_is_not_visible(client, signup_payload):
    _signup(client, signup_payload)
    create = client.post("/api/support/threads", json={"subject": "Private question", "message": "This should not be visible to anyone else."})
    thread_id = create.json["data"]["id"]
    client.post("/api/auth/logout")

    client.post("/api/auth/signup", json=_second_user_payload())
    res = client.get(f"/api/support/threads/{thread_id}")
    assert res.status_code == 404


def test_cannot_reply_to_another_users_thread(client, signup_payload):
    _signup(client, signup_payload)
    create = client.post("/api/support/threads", json={"subject": "Private question", "message": "This should not be replyable by anyone else."})
    thread_id = create.json["data"]["id"]
    client.post("/api/auth/logout")

    client.post("/api/auth/signup", json=_second_user_payload())
    res = client.post(f"/api/support/threads/{thread_id}/messages", json={"message": "Trying to reply anyway."})
    assert res.status_code == 404


def test_create_thread_requires_a_real_subject_and_message(client, signup_payload):
    _signup(client, signup_payload)
    res = client.post("/api/support/threads", json={"subject": "", "message": ""})
    assert res.status_code == 422


def test_customer_cannot_access_admin_support_routes(client, signup_payload):
    _signup(client, signup_payload)
    create = client.post("/api/support/threads", json={"subject": "Question", "message": "Need help with something please."})
    thread_id = create.json["data"]["id"]

    assert client.get("/api/admin/support/threads").status_code == 403
    assert client.get(f"/api/admin/support/threads/{thread_id}").status_code == 403
    assert client.post(f"/api/admin/support/threads/{thread_id}/messages", json={"message": "Trying anyway."}).status_code == 403


def test_admin_can_reply_and_it_flips_thread_to_pending(client, signup_payload):
    from app.extensions import db
    from app.models import User

    _signup(client, signup_payload)
    create = client.post("/api/support/threads", json={"subject": "Question", "message": "Need help with something please."})
    thread_id = create.json["data"]["id"]
    client.post("/api/auth/logout")

    admin_payload = {"name": "Ops", "email": "ops@example.com", "password": "Correct-Horse7"}
    client.post("/api/auth/signup", json=admin_payload)
    user = User.query.filter_by(email=admin_payload["email"]).first()
    user.role = "admin"
    db.session.commit()
    client.post("/api/auth/logout")
    client.post("/api/auth/login", json={"email": admin_payload["email"], "password": admin_payload["password"]})

    reply = client.post(f"/api/admin/support/threads/{thread_id}/messages", json={"message": "Happy to help with that."})
    assert reply.status_code == 201

    thread_detail = client.get(f"/api/admin/support/threads/{thread_id}")
    assert thread_detail.status_code == 200
    assert thread_detail.json["data"]["status"] == "pending"
    assert len(thread_detail.json["data"]["messages"]) == 2
    assert thread_detail.json["data"]["messages"][1]["is_staff"] is True
