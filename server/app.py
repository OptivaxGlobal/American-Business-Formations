from __future__ import annotations

import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": os.getenv("FRONTEND_ORIGIN", "*")}})


def append_json(filename: str, payload: dict) -> dict:
    path = DATA_DIR / filename
    records = []
    if path.exists():
        try:
            records = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            records = []
    record = {
        "id": str(uuid.uuid4()),
        "created_at": datetime.now(timezone.utc).isoformat(),
        **payload,
    }
    records.append(record)
    path.write_text(json.dumps(records, indent=2), encoding="utf-8")
    return record


@app.get("/api/health")
def health():
    return jsonify({"ok": True, "service": "american-business-formations-api"})


@app.post("/api/auth/signup")
def signup():
    data = request.get_json(silent=True) or {}
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    if not name or "@" not in email or len(password) < 6:
        return jsonify({"message": "Name, valid email, and 6+ character password are required."}), 400
    user = {"id": str(uuid.uuid4()), "name": name, "email": email}
    append_json("users.json", {"name": name, "email": email})
    return jsonify({"ok": True, "user": user}), 201


@app.post("/api/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    if "@" not in email or not password:
        return jsonify({"message": "Valid email and password are required."}), 400
    return jsonify({
        "ok": True,
        "user": {"id": "demo-user", "name": email.split("@")[0].replace(".", " ").title(), "email": email},
        "token": "demo-token-replace-with-jwt",
    })


@app.post("/api/leads")
def create_lead():
    data = request.get_json(silent=True) or {}
    if not data.get("email") or not data.get("message"):
        return jsonify({"message": "Email and message are required."}), 400
    record = append_json("leads.json", data)
    return jsonify({"ok": True, "lead": record}), 201


@app.post("/api/onboarding")
def create_onboarding():
    data = request.get_json(silent=True) or {}
    required = ["businessName", "industry", "state"]
    missing = [key for key in required if not data.get(key)]
    if missing:
        return jsonify({"message": f"Missing required fields: {', '.join(missing)}"}), 400
    record = append_json("onboarding.json", data)
    return jsonify({"ok": True, "application": record}), 201


@app.get("/api/dashboard")
def dashboard():
    return jsonify({
        "ok": True,
        "business": {
            "name": "North Ridge Consulting",
            "entity_type": "LLC",
            "state": "Wyoming",
            "status": "Information review",
            "progress": 62,
        },
        "tasks": [
            {"id": 1, "title": "Review formation details", "due": "Today", "done": False},
            {"id": 2, "title": "Confirm registered agent", "due": "Tomorrow", "done": False},
        ],
    })


@app.errorhandler(404)
def not_found(_error):
    return jsonify({"message": "API endpoint not found."}), 404


@app.post("/api/boarding")
def boarding_preferences():
    data = request.get_json(silent=True) or {}
    if not isinstance(data, dict):
        return jsonify({"message": "Invalid onboarding payload"}), 400
    record = append_json("boarding.json", data)
    return jsonify({"ok": True, "boarding": record}), 201


@app.post("/api/ai/generate")
def ai_generate():
    data = request.get_json(silent=True) or {}
    tool = str(data.get("tool", "advisor")).strip()
    prompt = str(data.get("prompt", "")).strip()
    if not prompt:
        return jsonify({"message": "A prompt is required"}), 400

    templates = {
        "advisor": f"## Recommended direction\nBased on “{prompt}”, focus on one compliance action, one operating action, and one customer-growth action this week.\n\n## Next steps\n- Confirm the responsible owner and deadline for each item.\n- Gather the required document before starting the task.\n- Complete the highest-risk compliance item first.\n- Review progress at the end of the week.\n\nThis is general educational guidance, not legal or tax advice.",
        "plan": f"## One-page business plan\nBusiness concept: {prompt}\n\n## Customer\nDefine one primary customer group, their urgent problem, and the moment they search for help.\n\n## Offer\nCreate one core service, a clear outcome, and a simple starting price.\n\n## Go-to-market\n- Launch a focused landing page.\n- Build a referral and direct outreach list.\n- Publish proof-building content weekly.\n\n## First 90 days\nValidate demand, win the first customers, document delivery, and improve margins.",
        "names": "## Name directions\n- Northstar Works\n- Brightline Ventures\n- Elevate Foundry\n- Clearpath Collective\n- Summit & Co.\n\n## Positioning line\nA modern, dependable brand built around clarity, progress, and professional service.",
        "copy": f"## Hero headline\nA smarter way to move your business forward.\n\n## Supporting copy\n{prompt}. Get a clear process, responsive support, and a solution built around your goals.\n\n## Primary CTA\nStart your consultation\n\n## Trust section\nClear communication. Practical expertise. Reliable delivery.",
        "social": f"## Social post\nWe’re helping businesses move forward with a clearer, more professional approach. {prompt}.\n\nGet practical support built around your goals—without the usual complexity.\n\nCTA: Send us a message to get started.",
        "permits": f"## Sample research checklist\nFor {prompt}, verify requirements with the city, county, state, and relevant federal agencies.\n\n- General business registration\n- Local operating or occupational license\n- Sales tax registration when applicable\n- Industry-specific permits\n- Zoning or home-occupation approval\n- Employer registrations if hiring\n\nConfirm requirements with official authorities before operating.",
        "brand": f"## Brand voice\nFor {prompt}, use a clear, confident, helpful voice.\n\n## Message pillars\n- Professional clarity\n- Practical progress\n- Reliable support\n\n## Avoid\nHype, vague superlatives, fear-based claims, and unnecessary jargon.",
        "campaign": f"## Four-week campaign\nGoal: {prompt}\n\n## Week 1 — Position\nClarify the offer, audience, message, and primary conversion action.\n\n## Week 2 — Build trust\nPublish educational content, proof, and common-question answers.\n\n## Week 3 — Activate\nRun direct outreach, partnerships, and a focused promotional offer.\n\n## Week 4 — Optimize\nReview leads, conversion rate, content performance, and next tests.",
    }
    result = templates.get(tool, templates["advisor"])
    append_json("ai_generations.json", {"tool": tool, "prompt": prompt})
    return jsonify({"ok": True, "result": result})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.getenv("PORT", "5000")), debug=True)
