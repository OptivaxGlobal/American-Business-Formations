"""Checkout/billing validators. Card data is never handled here production
billing must use Stripe's hosted fields/Checkout so raw card numbers never
reach this app's servers. This module only covers catalog-membership
checks (never trust a plan/add-on id or price the client sends recompute
from the DB) and billing name/address, which reuse the contact/address
validators.
"""


def validate_plan_membership(package_name, packages):
    names = {p.name for p in packages}
    if package_name not in names:
        return None, "Select a valid plan."
    return package_name, None


def validate_addon_membership(add_on_slugs, add_ons):
    valid_slugs = {a.slug for a in add_ons}
    bad = [slug for slug in (add_on_slugs or []) if slug not in valid_slugs]
    if bad:
        return None, "One or more selected add-ons are not available."
    return add_on_slugs, None
