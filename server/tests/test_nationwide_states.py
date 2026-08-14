"""Covers the 2026-08-13 nationwide expansion: LLC Formation and
Registered Agent now span all 50 states + DC + PR (52 jurisdictions),
while Virtual Office deliberately stayed at its original 21-state
footprint these must be genuinely separate lists, never one shared
supported-state list (Part 8/9 of the spec)."""
from app.extensions import db
from app.models import User, Business, Package, AddOn
from app.services.states import (
    STATES, VIRTUAL_OFFICE_STATES, is_supported_state, is_virtual_office_available,
    get_jurisdiction_type, is_supported_entity_type,
)

ALL_52 = {
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
    'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
    'VA', 'WA', 'WV', 'WI', 'WY', 'DC', 'PR',
}


def test_llc_formation_and_registered_agent_cover_all_52_jurisdictions():
    assert set(STATES.keys()) == ALL_52
    assert len(STATES) == 52
    for code in ALL_52:
        assert is_supported_state(code), f"{code} should be a supported LLC-formation jurisdiction"


def test_virtual_office_is_still_only_21_states_not_all_52():
    assert len(VIRTUAL_OFFICE_STATES) == 21
    assert VIRTUAL_OFFICE_STATES.issubset(ALL_52)
    # Spot-check a handful of newly-added states that must NOT have
    # Virtual Office even though they now support LLC Formation.
    for code in ("AL", "AK", "CT", "OH", "PA", "TN", "MA", "DC", "PR"):
        assert is_supported_state(code)
        assert not is_virtual_office_available(code), f"{code} should not have Virtual Office"
    # And a handful that should still have it (unchanged from before).
    for code in ("TX", "CA", "FL", "DE", "NY"):
        assert is_virtual_office_available(code)


def test_dc_and_puerto_rico_are_not_labeled_as_states():
    assert get_jurisdiction_type("DC") == "district"
    assert get_jurisdiction_type("PR") == "territory"
    assert get_jurisdiction_type("TX") == "state"
    assert get_jurisdiction_type("AL") == "state"


def test_every_new_jurisdiction_has_a_real_filing_fee_and_document_name():
    new_states = ALL_52 - {'AZ', 'CA', 'CO', 'DE', 'FL', 'GA', 'ID', 'IL', 'IA', 'MT', 'NV', 'NH', 'NJ', 'NM', 'NY', 'OR', 'TX', 'UT', 'VA', 'WA', 'WY'}
    assert len(new_states) == 31
    for code in new_states:
        cfg = STATES[code]
        assert cfg["llc_formation_fee_cents"] > 0
        assert cfg["formation_document_name"]
        assert cfg["filing_authority"]
        assert "LLC" in cfg["entity_types"]


def test_south_dakota_series_llc_is_confirmed_available_new_states_default_unconfirmed():
    assert is_supported_entity_type("SD", "Series LLC")
    # Newly added states default to standard LLC + PLLC only unless
    # specifically confirmed (see docs/nationwide-expansion-audit.md) —
    # Series LLC was not guessed into states without confirmation.
    assert not is_supported_entity_type("AL", "Series LLC")
    assert not is_supported_entity_type("OH", "Series LLC")


# --- Checkout-time enforcement (never trust the client) --------------------

def _seed_catalog():
    package = Package(name="Accelerated", price_cents=20000, active=True)
    vo = AddOn(slug="virtual-office", name="Virtual office", price_cents=4900, recurring=True, active=True)
    db.session.add_all([package, vo])
    db.session.commit()


def _signed_in(client, signup_payload):
    client.post("/api/auth/signup", json=signup_payload)
    return User.query.filter_by(email=signup_payload["email"]).first()


def test_checkout_rejects_virtual_office_outside_its_21_states(client, signup_payload):
    _seed_catalog()
    owner = _signed_in(client, signup_payload)
    business = Business(owner_id=owner.id, name="Yellowhammer Ventures LLC", state="AL")
    db.session.add(business)
    db.session.commit()

    res = client.post("/api/checkout/session", json={
        "business_id": business.id, "package_id": "Accelerated", "add_on_ids": ["virtual-office"],
    })
    assert res.status_code == 422
    assert "add_on_ids" in res.json["field_errors"]


def test_checkout_allows_virtual_office_inside_its_21_states(client, signup_payload):
    _seed_catalog()
    owner = _signed_in(client, signup_payload)
    business = Business(owner_id=owner.id, name="Lone Star Ventures LLC", state="TX")
    db.session.add(business)
    db.session.commit()

    res = client.post("/api/checkout/session", json={
        "business_id": business.id, "package_id": "Accelerated", "add_on_ids": ["virtual-office"],
    })
    assert res.status_code in (200, 201, 202)


def test_new_jurisdiction_llc_can_be_created_and_priced(client, signup_payload):
    """End-to-end: a business formed in a brand-new jurisdiction (Puerto
    Rico) saves, prices, and checks out using its own real filing fee —
    never Texas's, never a shared universal fee."""
    _seed_catalog()
    _signed_in(client, signup_payload)
    create = client.post("/api/applications", json={"business_name": "Isla Consulting LLC", "state": "PR"})
    assert create.status_code == 201
    assert create.json["data"]["business"]["state"] == "PR"
    business_id = create.json["data"]["business"]["id"]

    checkout = client.post("/api/checkout/session", json={"business_id": business_id, "package_id": "Accelerated"})
    assert checkout.status_code in (200, 201, 202)
    order = checkout.json["data"]["order"]
    assert order["state_fee_cents"] == STATES["PR"]["llc_formation_fee_cents"]
    assert order["state_fee_cents"] != STATES["TX"]["llc_formation_fee_cents"]
