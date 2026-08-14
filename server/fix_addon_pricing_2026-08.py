"""One-off, idempotent price correction for the 2026-08 Virtual Office /
Mail Forwarding price update. `seed.py` only inserts AddOn rows when the
table is empty, so an environment that was already seeded (any real
deployment, or a local dev.db from before this change) needs its existing
rows updated in place rather than re-inserted deleting and re-seeding a
real database would also wipe users/orders/businesses, which this script
never touches.

Safe to run multiple times and safe to run even if the rows are already
correct (each update is a no-op check before writing, and nothing else in
the database is read or modified). Never touches OrderItem.price_cents on
existing orders those are a snapshot of what a customer was actually
charged at checkout time and must never change retroactively.

Usage:
    python fix_addon_pricing_2026-08.py
"""
import sys

from app import create_app
from app.extensions import db
from app.models import AddOn, AuditLog

NEW_PRICES_CENTS = {
    "mail-forwarding": 3500,   # was 2000 ($20/month) -> $35/month
    "virtual-office": 4900,    # was 2900 ($29/month) -> $49/month
}

app = create_app()

with app.app_context():
    changed = []
    for slug, new_price in NEW_PRICES_CENTS.items():
        add_on = AddOn.query.filter_by(slug=slug).first()
        if not add_on:
            print(f"No '{slug}' AddOn row found nothing to update (a fresh seed via seed.py will already use the new price).")
            continue
        if add_on.price_cents == new_price:
            print(f"'{slug}' is already ${new_price / 100:.0f}/month no change needed.")
            continue
        old_price = add_on.price_cents
        add_on.price_cents = new_price
        changed.append((slug, old_price, new_price))

    if changed:
        db.session.add(AuditLog(
            actor_label="fix_addon_pricing_2026-08.py",
            action="Corrected recurring add-on pricing",
            details="; ".join(f"{slug}: ${old/100:.0f} -> ${new/100:.0f}/month" for slug, old, new in changed),
        ))
        db.session.commit()
        for slug, old, new in changed:
            print(f"Updated '{slug}': ${old / 100:.0f}/month -> ${new / 100:.0f}/month")
    else:
        db.session.commit()  # nothing changed, but keep the session clean
        print("Nothing to update.")

sys.exit(0)
