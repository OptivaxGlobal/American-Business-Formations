"""Creates database tables (for local SQLite dev use `flask db upgrade`
against a real migration history in production) and seeds baseline data:
one admin account and the starter pricing packages/add-ons.

Usage:
    python seed.py
"""
import os
import sys

from app import create_app
from app.extensions import db
from app.models import User, Package, AddOn, FAQ

app = create_app()

with app.app_context():
    db.create_all()

    admin_email = os.getenv("SEED_ADMIN_EMAIL", "admin@americanbusinessformations.com")
    admin_password = os.getenv("SEED_ADMIN_PASSWORD")
    if not admin_password:
        print("Set SEED_ADMIN_PASSWORD before seeding an admin account. Skipping admin creation.")
    elif User.query.filter_by(email=admin_email).first():
        print(f"Admin account already exists: {admin_email}")
    else:
        admin = User(name="ABF Admin", email=admin_email, role="admin", email_verified=True)
        admin.set_password(admin_password)
        db.session.add(admin)
        print(f"Created admin account: {admin_email}")

    # Kept in sync by hand with src/components/PricingCards.jsx (packages)
    # and src/data/pricing.js (add-ons) the frontend catalog is what
    # customers actually see, so these rows must match it exactly. Since
    # this block only runs once (skipped when the table already has rows),
    # an already-seeded database (any real deployment, or a pre-existing
    # local dev.db) needs a targeted update instead of a re-seed deleting
    # and re-seeding a live database would also wipe users/orders/
    # businesses. For a price-only correction like Aug 2026's Virtual
    # Office/Mail Forwarding update, either run a one-off idempotent
    # correction script (see fix_addon_pricing_2026-08.py) or use the
    # existing Admin > Plans page (PATCH /api/admin/plans/add-ons/<id>),
    # which is exactly what it's for and never alters an already-placed
    # order's price.
    if not Package.query.first():
        db.session.add_all([
            Package(name="Foundation", price_cents=15000, billing_note="one-time service fee + state filing fee",
                    description="A straightforward formation starting point.",
                    features=["Guided LLC formation questionnaire", "Certificate of Formation preparation and filing", "Formation status tracking in your dashboard", "Digital document center"],
                    sort_order=1),
            Package(name="Accelerated", price_cents=20000, billing_note="one-time service fee + state filing fee",
                    description="Formation plus the registered agent and compliance support most new LLCs need.", is_popular=True,
                    features=["Everything in Foundation", "One year of registered agent service included", "Compliance deadline reminders", "Operating agreement draft"],
                    sort_order=2),
            Package(name="Complete", price_cents=25000, billing_note="one-time service fee + state filing fee",
                    description="Our most complete package, covering formation, compliance, and your federal tax ID.",
                    features=["Everything in Accelerated", "Domestic EIN filing included", "DBA / assumed name filing", "Formation documents vault", "Priority support"],
                    sort_order=3),
        ])
        print("Seeded starter packages.")

    if not AddOn.query.first():
        db.session.add_all([
            AddOn(slug="registered-agent", name="Registered agent (1 year)", price_cents=8000, recurring=True),
            AddOn(slug="business-formation-filing", name="Business formation filing service", price_cents=9500),
            AddOn(slug="compliance-filing", name="Compliance filing service", price_cents=9500),
            AddOn(slug="ein-domestic", name="EIN application (U.S. applicants)", price_cents=3500),
            AddOn(slug="ein-foreign", name="EIN application (foreign applicants)", price_cents=13000),
            AddOn(slug="operating-agreement", name="Operating agreement", price_cents=6000),
            AddOn(slug="texas-dba", name="Assumed name (DBA) filing", price_cents=8500),
            AddOn(slug="compliance", name="Compliance reminders", price_cents=9000, recurring=True),
            AddOn(slug="s-corp-election", name="S-Corp election (IRS Form 2553)", price_cents=13000),
            AddOn(slug="apostille", name="Apostille service", price_cents=45000),
            AddOn(slug="certificate-good-standing", name="Certificate of Good Standing / certified copy filing service", price_cents=7000),
            AddOn(slug="mail-forwarding", name="Mail forwarding (business address, no lease agreement)", price_cents=3500, recurring=True),
            AddOn(slug="virtual-office", name="Virtual office (business address + lease agreement)", price_cents=4900, recurring=True),
            AddOn(slug="expedited", name="Expedited processing", price_cents=2500),
        ])
        print("Seeded starter add-ons.")

    if not FAQ.query.first():
        db.session.add_all([
            FAQ(question="What does the Texas Secretary of State charge to file a Certificate of Formation?",
                answer="The current filing fee is shown during onboarding and checkout, always separate from our service fee.",
                category="formation", sort_order=1),
            FAQ(question="Is my business name guaranteed to be available?",
                answer="No we perform a preliminary review, but only the Texas Secretary of State determines final availability.",
                category="formation", sort_order=2),
        ])
        print("Seeded starter FAQs.")

    db.session.commit()
    print("Seed complete.")

sys.exit(0)
