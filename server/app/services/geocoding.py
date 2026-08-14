"""County derivation from a verified street address, via the U.S. Census
Bureau's free public Geocoder API no API key required, no new
dependency (stdlib `urllib` only).

Used for the one supported state whose own formation document actually
asks for a county (New York see COUNTY_REQUIRED_STATES in
services/states.py and src/config/stateRequirements.js). No customer is
ever asked to type or pick a county themselves (Part 1: "Do NOT restore a
universal County dropdown"); this fills that single, narrow need
automatically from the address they already gave us for their filing.

Best-effort only: any failure (network, timeout, no match, malformed
response) returns None rather than raising, so a slow/unreachable
government API can never block an autosave or a submission the address
is simply saved without a county, which is no worse than the field not
existing at all.
"""
import json
import urllib.parse
import urllib.request

GEOCODER_URL = "https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress"
TIMEOUT_SECONDS = 4


def derive_county(line1, city, state, zip_code):
    """Returns a county name like "Travis County" (or "New York County"),
    or None if it couldn't be determined. `state` is the 2-letter USPS
    code. Never raises."""
    if not (line1 and city and state):
        return None
    address = f"{line1}, {city}, {state} {zip_code or ''}".strip()
    params = {
        "address": address,
        "benchmark": "Public_AR_Current",
        "vintage": "Current_Current",
        "layers": "Counties",
        "format": "json",
    }
    url = f"{GEOCODER_URL}?{urllib.parse.urlencode(params)}"
    try:
        with urllib.request.urlopen(url, timeout=TIMEOUT_SECONDS) as response:
            if response.status != 200:
                return None
            payload = json.loads(response.read().decode("utf-8"))
    except Exception:
        # Network error, timeout, DNS failure, non-JSON body, etc. a
        # government geocoding API being briefly unreachable must never
        # break saving or submitting a formation application.
        return None

    matches = payload.get("result", {}).get("addressMatches") or []
    if not matches:
        return None
    counties = matches[0].get("geographies", {}).get("Counties") or []
    if not counties:
        return None
    name = counties[0].get("NAME")
    return name.strip() if isinstance(name, str) and name.strip() else None
