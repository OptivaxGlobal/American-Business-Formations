"""Texas-specific facts used by the API. Mirrors src/config/texas.js on the
frontend. filing_fee is an owner-configurable placeholder see
TEXAS_FILING_FEE / TEXAS_FILING_FEE_VERIFIED in config.py and confirm
against the Texas Secretary of State before relying on it in production."""

from flask import current_app


def get_texas_config():
    return {
        "name": "Texas",
        "abbreviation": "TX",
        "entity_term": "LLC",
        "filing_document_name": "Certificate of Formation",
        "filing_fee_cents": current_app.config["TEXAS_FILING_FEE"] * 100,
        "filing_fee_verified": current_app.config["TEXAS_FILING_FEE_VERIFIED"],
        "compliance_tasks": [
            {"key": "public-information-report", "name": "Texas Public Information Report", "frequency": "Annual (due May 15)"},
            {"key": "franchise-tax", "name": "Texas Franchise Tax", "frequency": "Annual (due May 15)"},
            {"key": "registered-agent-renewal", "name": "Registered Agent Service Renewal", "frequency": "Annual"},
            {"key": "sales-tax-filing", "name": "Texas Sales and Use Tax Filing", "frequency": "Varies by permit"},
        ],
    }
