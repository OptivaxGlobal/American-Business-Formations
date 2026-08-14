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

`entity_types` / `formation_document_name` mirror the fuller, richer
config in src/config/stateRequirements.js (the frontend's presentation
layer descriptions, official sources, document requirements, etc. all
live there). The subset here exists so the backend can independently
re-validate entity_type against what a state actually supports rather than
trusting whatever the client sends (see applications.py) the same
"never trust the browser for anything that affects a real record" pattern
already used for the filing fee itself.

`post_formation_tasks` backs the generalized compliance-checklist seed
(server/app/api/compliance.py) previously Texas-only via services/texas.py,
now available for every supported state.
"""

# Every one of the 21 supported states allows a standard "LLC". Only
# "Series LLC" and "PLLC" availability vary see
# src/config/stateRequirements.js for the researched reasoning and official
# sources behind each state's list below (kept in sync by hand).
_LLC = "LLC"
_SERIES = "Series LLC"
_PLLC = "PLLC"

STATES = {
    "AZ": {"name": "Arizona", "llc_formation_fee_cents": 5000, "filing_authority": "Arizona Corporation Commission", "source_url": "https://azcc.gov/", "verified_date": "2026-08-06", "note": None,
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "az-publication", "name": "Newspaper Publication of Formation", "frequency": "Within 60 days of formation (unless registered agent is in Maricopa/Pima County)"}]},
    "CA": {"name": "California", "llc_formation_fee_cents": 7000, "filing_authority": "California Secretary of State", "source_url": "https://bizfileonline.sos.ca.gov/", "verified_date": "2026-08-06", "note": "California also requires an $800 annual minimum franchise tax and a biennial Statement of Information.",
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC],
           "post_formation_tasks": [
               {"key": "ca-statement-of-information", "name": "Statement of Information (Form LLC-12)", "frequency": "Within 90 days of formation, then every 2 years"},
               {"key": "ca-franchise-tax", "name": "$800 Annual Minimum Franchise Tax", "frequency": "Annual"},
           ]},
    "CO": {"name": "Colorado", "llc_formation_fee_cents": 5000, "filing_authority": "Colorado Secretary of State", "source_url": "https://www.coloradosos.gov/", "verified_date": "2026-08-06", "note": "Colorado requires a $25 annual Periodic Report.",
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "co-periodic-report", "name": "Periodic Report", "frequency": "Annual (3-month window from formation month)"}]},
    "DE": {"name": "Delaware", "llc_formation_fee_cents": 11000, "filing_authority": "Delaware Division of Corporations", "source_url": "https://corp.delaware.gov/", "verified_date": "2026-08-06", "note": "Delaware requires an annual $300 LLC franchise tax.",
           "formation_document_name": "Certificate of Formation", "entity_types": [_LLC, _SERIES, _PLLC],
           "post_formation_tasks": [{"key": "de-annual-tax", "name": "Annual LLC Franchise Tax ($300 flat)", "frequency": "Annual, due June 1"}]},
    "FL": {"name": "Florida", "llc_formation_fee_cents": 12500, "filing_authority": "Florida Division of Corporations (Sunbiz)", "source_url": "https://dos.fl.gov/sunbiz/", "verified_date": "2026-08-06", "note": "Includes Florida's required $25 registered agent designation fee.",
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _SERIES, _PLLC],
           "post_formation_tasks": [{"key": "fl-annual-report", "name": "Annual Report", "frequency": "Jan 1 - May 1 each year"}]},
    "GA": {"name": "Georgia", "llc_formation_fee_cents": 11000, "filing_authority": "Georgia Secretary of State", "source_url": "https://sos.ga.gov/", "verified_date": "2026-08-06", "note": "Includes Georgia's standard $10 filing service charge.",
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "ga-annual-registration", "name": "Annual Registration", "frequency": "Apr 1 - Apr 1 each year"}]},
    "ID": {"name": "Idaho", "llc_formation_fee_cents": 10000, "filing_authority": "Idaho Secretary of State", "source_url": "https://sos.idaho.gov/", "verified_date": "2026-08-06", "note": "Online filing fee; mail/in-person filing costs more.",
           "formation_document_name": "Certificate of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "id-annual-report", "name": "Annual Report", "frequency": "By anniversary month each year"}]},
    "IL": {"name": "Illinois", "llc_formation_fee_cents": 15000, "filing_authority": "Illinois Secretary of State", "source_url": "https://www.ilsos.gov/", "verified_date": "2026-08-06", "note": None,
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _SERIES, _PLLC],
           "post_formation_tasks": [{"key": "il-annual-report", "name": "Annual Report", "frequency": "Before anniversary month each year"}]},
    "IA": {"name": "Iowa", "llc_formation_fee_cents": 5000, "filing_authority": "Iowa Secretary of State", "source_url": "https://sos.iowa.gov/", "verified_date": "2026-08-06", "note": None,
           "formation_document_name": "Certificate of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "ia-biennial-report", "name": "Biennial Report", "frequency": "Jan 1 - Apr 1 of odd-numbered years"}]},
    "MT": {"name": "Montana", "llc_formation_fee_cents": 3500, "filing_authority": "Montana Secretary of State", "source_url": "https://sosmt.gov/", "verified_date": "2026-08-06", "note": "Montana requires a $20 annual report.",
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _SERIES, _PLLC],
           "post_formation_tasks": [{"key": "mt-annual-report", "name": "Annual Report", "frequency": "By April 15 each year"}]},
    "NV": {"name": "Nevada", "llc_formation_fee_cents": 7500, "filing_authority": "Nevada Secretary of State", "source_url": "https://www.nvsos.gov/", "verified_date": "2026-08-06", "note": "Nevada also requires an initial list of managers/members and a state business license, filed separately.",
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _SERIES, _PLLC],
           "post_formation_tasks": [{"key": "nv-initial-list", "name": "Initial List of Managers/Members + Business License", "frequency": "Due with formation, then annually"}]},
    "NH": {"name": "New Hampshire", "llc_formation_fee_cents": 10000, "filing_authority": "New Hampshire Secretary of State", "source_url": "https://www.sos.nh.gov/", "verified_date": "2026-08-06", "note": None,
           "formation_document_name": "Certificate of Formation", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "nh-annual-report", "name": "Annual Report", "frequency": "By April 1 each year"}]},
    "NJ": {"name": "New Jersey", "llc_formation_fee_cents": 10000, "filing_authority": "New Jersey Division of Revenue and Enterprise Services", "source_url": "https://www.nj.gov/treasury/revenue/", "verified_date": "2026-08-06", "note": None,
           "formation_document_name": "Certificate of Formation", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "nj-annual-report", "name": "Annual Report", "frequency": "By anniversary month each year"}]},
    "NM": {"name": "New Mexico", "llc_formation_fee_cents": 5000, "filing_authority": "New Mexico Secretary of State", "source_url": "https://www.sos.nm.gov/", "verified_date": "2026-08-06", "note": None,
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "nm-no-annual-report", "name": "No Annual/Biennial Report Required", "frequency": "N/A"}]},
    "NY": {"name": "New York", "llc_formation_fee_cents": 20000, "filing_authority": "New York Department of State, Division of Corporations", "source_url": "https://dos.ny.gov/", "verified_date": "2026-08-06", "note": "New York requires a statutory publication requirement within 120 days of formation; cost varies by county.",
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "ny-publication", "name": "Newspaper Publication Requirement (LLC Law § 206)", "frequency": "Within 120 days of formation"}]},
    "OR": {"name": "Oregon", "llc_formation_fee_cents": 10000, "filing_authority": "Oregon Secretary of State", "source_url": "https://sos.oregon.gov/", "verified_date": "2026-08-06", "note": "Oregon requires a $100 annual report.",
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "or-annual-report", "name": "Annual Report", "frequency": "By anniversary date each year"}]},
    "TX": {"name": "Texas", "llc_formation_fee_cents": 30000, "filing_authority": "Texas Secretary of State", "source_url": "https://www.sos.state.tx.us/", "verified_date": "2026-08-06", "note": None,
           "formation_document_name": "Certificate of Formation", "entity_types": [_LLC, _SERIES, _PLLC],
           "post_formation_tasks": [
               {"key": "tx-public-information-report", "name": "Texas Public Information Report", "frequency": "Annual, filed with franchise tax report (due May 15)"},
               {"key": "tx-franchise-tax", "name": "Texas Franchise Tax", "frequency": "Annual (due May 15)"},
           ]},
    "UT": {"name": "Utah", "llc_formation_fee_cents": 5900, "filing_authority": "Utah Division of Corporations and Commercial Code", "source_url": "https://corporations.utah.gov/", "verified_date": "2026-08-06", "note": None,
           "formation_document_name": "Certificate of Organization", "entity_types": [_LLC, _SERIES, _PLLC],
           "post_formation_tasks": [{"key": "ut-annual-renewal", "name": "Annual Renewal", "frequency": "By anniversary date each year"}]},
    "VA": {"name": "Virginia", "llc_formation_fee_cents": 10000, "filing_authority": "Virginia State Corporation Commission", "source_url": "https://www.scc.virginia.gov/", "verified_date": "2026-08-06", "note": "Virginia requires a $50 annual registration fee.",
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "va-annual-registration-fee", "name": "Annual Registration Fee", "frequency": "By anniversary month each year"}]},
    "WA": {"name": "Washington", "llc_formation_fee_cents": 18000, "filing_authority": "Washington Secretary of State", "source_url": "https://www.sos.wa.gov/", "verified_date": "2026-08-06", "note": None,
           "formation_document_name": "Certificate of Formation", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "wa-annual-report", "name": "Annual Report", "frequency": "By end of anniversary month each year"}]},
    "WY": {"name": "Wyoming", "llc_formation_fee_cents": 10000, "filing_authority": "Wyoming Secretary of State", "source_url": "https://sos.wyo.gov/", "verified_date": "2026-08-06", "note": None,
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _SERIES, _PLLC],
           "post_formation_tasks": [{"key": "wy-annual-report", "name": "Annual Report (License Tax)", "frequency": "By first day of anniversary month each year"}]},

    # --- 2026-08-13 nationwide expansion: the remaining 29 states + DC + PR ---
    # Same sourcing standard as the original 21 above (each state's own
    # filing authority, never a third-party aggregator) see
    # docs/nationwide-expansion-audit.md for the source list and the small
    # number of items flagged Needs Review rather than guessed.
    "AL": {"name": "Alabama", "llc_formation_fee_cents": 20000, "filing_authority": "Alabama Secretary of State", "source_url": "https://www.sos.alabama.gov/business-entities/llcs", "verified_date": "2026-08-13", "note": "Alabama also requires a one-time Name Reservation ($25) before filing, and an initial Business Privilege Tax Return.",
           "formation_document_name": "Certificate of Formation", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "al-business-privilege-tax", "name": "Business Privilege Tax / Annual Report", "frequency": "Annual"}]},
    "AK": {"name": "Alaska", "llc_formation_fee_cents": 25000, "filing_authority": "Alaska Division of Corporations, Business and Professional Licensing", "source_url": "https://www.commerce.alaska.gov/web/cbpl/", "verified_date": "2026-08-13", "note": None,
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "ak-biennial-report", "name": "Biennial Report", "frequency": "Every 2 years"}]},
    "AR": {"name": "Arkansas", "llc_formation_fee_cents": 4500, "filing_authority": "Arkansas Secretary of State", "source_url": "https://www.sos.arkansas.gov/", "verified_date": "2026-08-13", "note": "Online filing fee; paper filing is $50.",
           "formation_document_name": "Certificate of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "ar-franchise-tax-report", "name": "Annual Franchise Tax Report", "frequency": "Annual, due May 1"}]},
    "CT": {"name": "Connecticut", "llc_formation_fee_cents": 12000, "filing_authority": "Connecticut Secretary of the State", "source_url": "https://portal.ct.gov/sots", "verified_date": "2026-08-13", "note": None,
           "formation_document_name": "Certificate of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "ct-annual-report", "name": "Annual Report", "frequency": "Annual, by anniversary month"}]},
    "HI": {"name": "Hawaii", "llc_formation_fee_cents": 5000, "filing_authority": "Hawaii Department of Commerce and Consumer Affairs, Business Registration Division", "source_url": "https://cca.hawaii.gov/breg/", "verified_date": "2026-08-13", "note": "Includes Hawaii's $1 State Archives fee.",
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "hi-annual-report", "name": "Annual Report", "frequency": "Annual, by end of anniversary quarter"}]},
    "IN": {"name": "Indiana", "llc_formation_fee_cents": 9500, "filing_authority": "Indiana Secretary of State", "source_url": "https://inbiz.in.gov/", "verified_date": "2026-08-13", "note": "Online filing fee; paper filing is $100.",
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "in-business-entity-report", "name": "Business Entity Report", "frequency": "Every 2 years"}]},
    "KS": {"name": "Kansas", "llc_formation_fee_cents": 8500, "filing_authority": "Kansas Secretary of State", "source_url": "https://sos.ks.gov/", "verified_date": "2026-08-13", "note": "Online filing fee; paper filing is $90.",
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "ks-annual-report", "name": "Annual Report", "frequency": "Annual Needs Review: confirm current requirement/fee with the Kansas Secretary of State"}]},
    "KY": {"name": "Kentucky", "llc_formation_fee_cents": 4000, "filing_authority": "Kentucky Secretary of State", "source_url": "https://sos.ky.gov/", "verified_date": "2026-08-13", "note": None,
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "ky-annual-report", "name": "Annual Report", "frequency": "Annual, Jan 1 - Jun 30"}]},
    "LA": {"name": "Louisiana", "llc_formation_fee_cents": 10000, "filing_authority": "Louisiana Secretary of State", "source_url": "https://www.sos.la.gov/", "verified_date": "2026-08-13", "note": "An Initial Report must be filed together with the Articles of Organization at no extra charge.",
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "la-annual-report", "name": "Annual Report", "frequency": "Annual, by anniversary date"}]},
    "ME": {"name": "Maine", "llc_formation_fee_cents": 17500, "filing_authority": "Maine Secretary of State, Bureau of Corporations", "source_url": "https://www.maine.gov/sos/", "verified_date": "2026-08-13", "note": "Maine does not currently offer online filing for this document mail or in-person only.",
           "formation_document_name": "Certificate of Formation", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "me-annual-report", "name": "Annual Report", "frequency": "Annual, due June 1"}]},
    "MD": {"name": "Maryland", "llc_formation_fee_cents": 10000, "filing_authority": "Maryland Department of Assessments and Taxation", "source_url": "https://dat.maryland.gov/", "verified_date": "2026-08-13", "note": "Online filing fee; paper filing is $170.",
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "md-annual-report", "name": "Annual Report / Personal Property Return", "frequency": "Annual, due April 15"}]},
    "MA": {"name": "Massachusetts", "llc_formation_fee_cents": 50000, "filing_authority": "Massachusetts Secretary of the Commonwealth", "source_url": "https://www.sec.state.ma.us/", "verified_date": "2026-08-13", "note": "Mail filing fee; online filing carries a $20 state-added surcharge ($520 total). Massachusetts also requires a $500 Annual Report fee.",
           "formation_document_name": "Certificate of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "ma-annual-report", "name": "Annual Report ($500)", "frequency": "Annual, by anniversary date"}]},
    "MI": {"name": "Michigan", "llc_formation_fee_cents": 5000, "filing_authority": "Michigan Department of Licensing and Regulatory Affairs (LARA), Corporations Division", "source_url": "https://www.michigan.gov/lara", "verified_date": "2026-08-13", "note": None,
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "mi-annual-statement", "name": "Annual Statement", "frequency": "Annual, due February 15"}]},
    "MN": {"name": "Minnesota", "llc_formation_fee_cents": 15500, "filing_authority": "Minnesota Secretary of State", "source_url": "https://www.sos.state.mn.us/", "verified_date": "2026-08-13", "note": "Online/in-person filing fee (treated as expedited); mail filing is $135.",
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "mn-annual-renewal", "name": "Annual Renewal (no fee)", "frequency": "Annual"}]},
    "MS": {"name": "Mississippi", "llc_formation_fee_cents": 5000, "filing_authority": "Mississippi Secretary of State", "source_url": "https://www.sos.ms.gov/", "verified_date": "2026-08-13", "note": None,
           "formation_document_name": "Certificate of Formation", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "ms-annual-report", "name": "Annual Report (no fee)", "frequency": "Annual, by April 15"}]},
    "MO": {"name": "Missouri", "llc_formation_fee_cents": 5000, "filing_authority": "Missouri Secretary of State", "source_url": "https://www.sos.mo.gov/", "verified_date": "2026-08-13", "note": "Online filing fee; paper filing is $105.",
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "mo-no-annual-report", "name": "No Annual Report Required", "frequency": "N/A"}]},
    "NE": {"name": "Nebraska", "llc_formation_fee_cents": 10000, "filing_authority": "Nebraska Secretary of State", "source_url": "https://sos.nebraska.gov/", "verified_date": "2026-08-13", "note": "Online filing fee; paper filing is $110. Nebraska also has a statutory publication requirement, similar to New York's.",
           "formation_document_name": "Certificate of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [
               {"key": "ne-publication", "name": "Newspaper Publication Requirement", "frequency": "Within statutory period after formation Needs Review: confirm current deadline/process"},
               {"key": "ne-biennial-report", "name": "Biennial Report", "frequency": "Every 2 years"},
           ]},
    "NC": {"name": "North Carolina", "llc_formation_fee_cents": 12500, "filing_authority": "North Carolina Secretary of State", "source_url": "https://www.sosnc.gov/", "verified_date": "2026-08-13", "note": None,
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "nc-annual-report", "name": "Annual Report", "frequency": "Annual, due April 15"}]},
    "ND": {"name": "North Dakota", "llc_formation_fee_cents": 13500, "filing_authority": "North Dakota Secretary of State", "source_url": "https://sos.nd.gov/", "verified_date": "2026-08-13", "note": None,
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "nd-annual-report", "name": "Annual Report", "frequency": "Annual, due November 15"}]},
    "OH": {"name": "Ohio", "llc_formation_fee_cents": 9900, "filing_authority": "Ohio Secretary of State", "source_url": "https://www.ohiosos.gov/", "verified_date": "2026-08-13", "note": None,
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "oh-no-annual-report", "name": "No Annual Report or Franchise Tax Required", "frequency": "N/A"}]},
    "OK": {"name": "Oklahoma", "llc_formation_fee_cents": 10000, "filing_authority": "Oklahoma Secretary of State", "source_url": "https://www.sos.ok.gov/", "verified_date": "2026-08-13", "note": None,
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "ok-annual-certificate", "name": "Annual Certificate", "frequency": "Annual, by anniversary date"}]},
    "PA": {"name": "Pennsylvania", "llc_formation_fee_cents": 12500, "filing_authority": "Pennsylvania Department of State, Bureau of Corporations and Charitable Organizations", "source_url": "https://www.pa.gov/agencies/dos.html", "verified_date": "2026-08-13", "note": None,
           "formation_document_name": "Certificate of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "pa-annual-report", "name": "Annual Report", "frequency": "Annual, due September 30 (starting 2025 replaced Pennsylvania's former decennial report)"}]},
    "RI": {"name": "Rhode Island", "llc_formation_fee_cents": 15000, "filing_authority": "Rhode Island Department of State, Business Services Division", "source_url": "https://sos.ri.gov/", "verified_date": "2026-08-13", "note": None,
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "ri-annual-report", "name": "Annual Report", "frequency": "Annual, Sep 1 - Nov 1"}]},
    "SC": {"name": "South Carolina", "llc_formation_fee_cents": 11000, "filing_authority": "South Carolina Secretary of State", "source_url": "https://sos.sc.gov/", "verified_date": "2026-08-13", "note": "Online filing fee; paper filing is $110.",
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "sc-no-annual-report", "name": "No Annual Report Required (LLCs taxed as partnerships)", "frequency": "N/A"}]},
    "SD": {"name": "South Dakota", "llc_formation_fee_cents": 15000, "filing_authority": "South Dakota Secretary of State", "source_url": "https://sdsos.gov/", "verified_date": "2026-08-13", "note": "Online filing fee; paper filing is $165.",
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _SERIES, _PLLC],
           "post_formation_tasks": [{"key": "sd-annual-report", "name": "Annual Report", "frequency": "Annual, by first day of anniversary month"}]},
    "TN": {"name": "Tennessee", "llc_formation_fee_cents": 30000, "filing_authority": "Tennessee Secretary of State", "source_url": "https://sos.tn.gov/", "verified_date": "2026-08-13", "note": "$50 per member, $300 minimum, $3,000 maximum $300 shown here covers LLCs with up to 6 members; larger membership increases this fee.",
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "tn-annual-report", "name": "Annual Report", "frequency": "Annual, by 1st day of 4th month after fiscal year end"}]},
    "VT": {"name": "Vermont", "llc_formation_fee_cents": 15500, "filing_authority": "Vermont Secretary of State", "source_url": "https://sos.vermont.gov/", "verified_date": "2026-08-13", "note": None,
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "vt-annual-report", "name": "Annual Report", "frequency": "Annual, within 3 months of fiscal year end"}]},
    "WV": {"name": "West Virginia", "llc_formation_fee_cents": 10000, "filing_authority": "West Virginia Secretary of State", "source_url": "https://sos.wv.gov/", "verified_date": "2026-08-13", "note": "$101 if filed online. Needs Review: a small number of sources cite a different figure ($130) confirm against the current official fee schedule before relying on this for a live order.",
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "wv-annual-report", "name": "Annual Report", "frequency": "Annual, Jan 1 - Jul 1"}]},
    "WI": {"name": "Wisconsin", "llc_formation_fee_cents": 13000, "filing_authority": "Wisconsin Department of Financial Institutions", "source_url": "https://dfi.wi.gov/", "verified_date": "2026-08-13", "note": "Online filing fee; paper filing is $170.",
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "wi-annual-report", "name": "Annual Report", "frequency": "Annual, by end of registration anniversary quarter"}]},
    "DC": {"name": "District of Columbia", "llc_formation_fee_cents": 9900, "filing_authority": "DC Department of Licensing and Consumer Protection (DLCP), Corporations Division", "source_url": "https://dlcp.dc.gov/", "verified_date": "2026-08-13", "note": None,
           "formation_document_name": "Articles of Organization", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "dc-biennial-report", "name": "Biennial Report", "frequency": "Every 2 years, due April 1"}]},
    "PR": {"name": "Puerto Rico", "llc_formation_fee_cents": 25000, "filing_authority": "Puerto Rico Department of State", "source_url": "https://estado.pr.gov/", "verified_date": "2026-08-13", "note": "Puerto Rico does not require a separate annual report, but does require a $150 annual fee.",
           "formation_document_name": "Certificate of Formation (Certificado de Organización)", "entity_types": [_LLC, _PLLC],
           "post_formation_tasks": [{"key": "pr-annual-fee", "name": "Annual Fee", "frequency": "Annual, due April 15"}]},
}

DEFAULT_STATE = "TX"

# States whose own formation document asks for the LLC's county (mirrors
# src/config/stateRequirements.js's COUNTY_STATE_REQUIRED). No customer is
# ever asked to type or pick a county (Part 1) for a state in this set,
# applications.py derives it automatically from the verified principal
# address via services/geocoding.py instead.
COUNTY_REQUIRED_STATES = {"NY"}

# --- Per-service availability (2026-08-13 nationwide expansion) -----------
# LLC Formation and Registered Agent are now available everywhere in
# STATES (all 50 states + DC + PR = 52 jurisdictions). Virtual Office was
# deliberately NOT expanded it remains the original 21-state footprint.
# These are genuinely separate lists (Part 8): never derive one from the
# other, and never let a Virtual Office selector silently inherit the
# full 52-jurisdiction formation list.
VIRTUAL_OFFICE_STATES = frozenset({
    "AZ", "CA", "CO", "DE", "FL", "GA", "ID", "IL", "IA", "MT", "NV", "NH",
    "NJ", "NM", "NY", "OR", "TX", "UT", "VA", "WA", "WY",
})


def is_virtual_office_available(code):
    return bool(code) and code.upper() in VIRTUAL_OFFICE_STATES


# DC and Puerto Rico are not "states" the architecture supports a
# jurisdiction type per Part 14 so a formation confirmation, generated
# document, or customer-facing label never calls either one a "state"
# where accuracy matters. Every other supported code defaults to "state".
JURISDICTION_TYPES = {"DC": "district", "PR": "territory"}


def get_jurisdiction_type(code):
    return JURISDICTION_TYPES.get((code or "").upper(), "state")


def get_state_config(code):
    """Returns the config dict for a supported state code, or None. Always
    the authority checkout.py/applications.py use to price and validate a
    formation state never trust a fee value from the request body."""
    if not code:
        return None
    return STATES.get(code.upper())


def is_supported_state(code):
    return bool(get_state_config(code))


def is_supported_entity_type(code, entity_type):
    """Server-side mirror of src/config/stateRequirements.js's
    entityTypeAvailability never trusts the client's own idea of which
    entity types are valid for a given state (Part 3: entity availability
    must be enforced, not just hidden in the UI)."""
    config = get_state_config(code)
    if not config:
        return False
    return entity_type in config.get("entity_types", [_LLC])


def list_supported_states():
    return sorted(
        ({"code": code, **cfg} for code, cfg in STATES.items()),
        key=lambda s: s["name"],
    )
