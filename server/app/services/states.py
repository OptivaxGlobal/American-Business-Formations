"""Single source of truth for LLC-formation state data on the backend —
this is the copy checkout.py actually trusts to price an order; the
frontend's src/data/states.js is a display-only mirror kept in sync by
hand. A client can send any `state` code it wants; the fee that actually
gets charged always comes from STATES below, looked up by that code,
never from anything the browser supplies directly.

`llc_formation_fee_cents` is the standard, required government filing fee
for a domestic LLC's formation document only optional costs (expedited
processing, certified copies, name reservations) and ongoing costs (annual
reports, franchise tax, publication) are intentionally excluded and, where
relevant, called out in `note`. Verified against each state's own filing
authority (never a third-party aggregator) as of `verified_date`. Filing
fees are government-set and can change without notice.
"""

STATES = {
    "AZ": {"name": "Arizona", "llc_formation_fee_cents": 5000, "filing_authority": "Arizona Corporation Commission", "source_url": "https://azcc.gov/", "verified_date": "2026-08-06", "note": None},
    "CA": {"name": "California", "llc_formation_fee_cents": 7000, "filing_authority": "California Secretary of State", "source_url": "https://bizfileonline.sos.ca.gov/", "verified_date": "2026-08-06", "note": "California also requires an $800 annual minimum franchise tax and a biennial Statement of Information."},
    "CO": {"name": "Colorado", "llc_formation_fee_cents": 5000, "filing_authority": "Colorado Secretary of State", "source_url": "https://www.coloradosos.gov/", "verified_date": "2026-08-06", "note": "Colorado requires a $25 annual Periodic Report."},
    "DE": {"name": "Delaware", "llc_formation_fee_cents": 11000, "filing_authority": "Delaware Division of Corporations", "source_url": "https://corp.delaware.gov/", "verified_date": "2026-08-06", "note": "Delaware requires an annual $300 LLC franchise tax."},
    "FL": {"name": "Florida", "llc_formation_fee_cents": 12500, "filing_authority": "Florida Division of Corporations (Sunbiz)", "source_url": "https://dos.fl.gov/sunbiz/", "verified_date": "2026-08-06", "note": "Includes Florida's required $25 registered agent designation fee."},
    "GA": {"name": "Georgia", "llc_formation_fee_cents": 11000, "filing_authority": "Georgia Secretary of State", "source_url": "https://sos.ga.gov/", "verified_date": "2026-08-06", "note": "Includes Georgia's standard $10 filing service charge."},
    "ID": {"name": "Idaho", "llc_formation_fee_cents": 10000, "filing_authority": "Idaho Secretary of State", "source_url": "https://sos.idaho.gov/", "verified_date": "2026-08-06", "note": "Online filing fee; mail/in-person filing costs more."},
    "IL": {"name": "Illinois", "llc_formation_fee_cents": 15000, "filing_authority": "Illinois Secretary of State", "source_url": "https://www.ilsos.gov/", "verified_date": "2026-08-06", "note": None},
    "IA": {"name": "Iowa", "llc_formation_fee_cents": 5000, "filing_authority": "Iowa Secretary of State", "source_url": "https://sos.iowa.gov/", "verified_date": "2026-08-06", "note": None},
    "MT": {"name": "Montana", "llc_formation_fee_cents": 3500, "filing_authority": "Montana Secretary of State", "source_url": "https://sosmt.gov/", "verified_date": "2026-08-06", "note": "Montana requires a $20 annual report."},
    "NV": {"name": "Nevada", "llc_formation_fee_cents": 7500, "filing_authority": "Nevada Secretary of State", "source_url": "https://www.nvsos.gov/", "verified_date": "2026-08-06", "note": "Nevada also requires an initial list of managers/members and a state business license, filed separately."},
    "NH": {"name": "New Hampshire", "llc_formation_fee_cents": 10000, "filing_authority": "New Hampshire Secretary of State", "source_url": "https://www.sos.nh.gov/", "verified_date": "2026-08-06", "note": None},
    "NJ": {"name": "New Jersey", "llc_formation_fee_cents": 10000, "filing_authority": "New Jersey Division of Revenue and Enterprise Services", "source_url": "https://www.nj.gov/treasury/revenue/", "verified_date": "2026-08-06", "note": None},
    "NM": {"name": "New Mexico", "llc_formation_fee_cents": 5000, "filing_authority": "New Mexico Secretary of State", "source_url": "https://www.sos.nm.gov/", "verified_date": "2026-08-06", "note": None},
    "NY": {"name": "New York", "llc_formation_fee_cents": 20000, "filing_authority": "New York Department of State, Division of Corporations", "source_url": "https://dos.ny.gov/", "verified_date": "2026-08-06", "note": "New York requires a statutory publication requirement within 120 days of formation; cost varies by county."},
    "OR": {"name": "Oregon", "llc_formation_fee_cents": 10000, "filing_authority": "Oregon Secretary of State", "source_url": "https://sos.oregon.gov/", "verified_date": "2026-08-06", "note": "Oregon requires a $100 annual report."},
    "TX": {"name": "Texas", "llc_formation_fee_cents": 30000, "filing_authority": "Texas Secretary of State", "source_url": "https://www.sos.state.tx.us/", "verified_date": "2026-08-06", "note": None},
    "UT": {"name": "Utah", "llc_formation_fee_cents": 5900, "filing_authority": "Utah Division of Corporations and Commercial Code", "source_url": "https://corporations.utah.gov/", "verified_date": "2026-08-06", "note": None},
    "VA": {"name": "Virginia", "llc_formation_fee_cents": 10000, "filing_authority": "Virginia State Corporation Commission", "source_url": "https://www.scc.virginia.gov/", "verified_date": "2026-08-06", "note": "Virginia requires a $50 annual registration fee."},
    "WA": {"name": "Washington", "llc_formation_fee_cents": 18000, "filing_authority": "Washington Secretary of State", "source_url": "https://www.sos.wa.gov/", "verified_date": "2026-08-06", "note": None},
    "WY": {"name": "Wyoming", "llc_formation_fee_cents": 10000, "filing_authority": "Wyoming Secretary of State", "source_url": "https://sos.wyo.gov/", "verified_date": "2026-08-06", "note": None},
}

DEFAULT_STATE = "TX"


def get_state_config(code):
    """Returns the config dict for a supported state code, or None. Always
    the authority checkout.py/applications.py use to price and validate a
    formation state never trust a fee value from the request body."""
    if not code:
        return None
    return STATES.get(code.upper())


def is_supported_state(code):
    return bool(get_state_config(code))


def list_supported_states():
    return sorted(
        ({"code": code, **cfg} for code, cfg in STATES.items()),
        key=lambda s: s["name"],
    )
