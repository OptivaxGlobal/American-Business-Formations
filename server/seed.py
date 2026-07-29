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

    if not Package.query.first():
        db.session.add_all([
            Package(name="Foundation", price_cents=0, billing_note="service fee + TX state filing fee",
                    description="A straightforward formation starting point.",
                    features=["Texas LLC formation intake", "Standard processing queue", "Digital document center", "Formation checklist"],
                    sort_order=1),
            Package(name="Accelerated", price_cents=19900, billing_note="per year + TX state filing fee",
                    description="Formation plus core Texas compliance support.", is_popular=True,
                    features=["Everything in Foundation", "Priority processing queue", "Operating agreement request", "Texas compliance reminders"],
                    sort_order=2),
            Package(name="Complete", price_cents=24900, billing_note="per year + TX state filing fee",
                    description="A broader toolkit for launching and growing.",
                    features=["Everything in Accelerated", "Domain planning tools", "Website project intake", "Logo brief builder"],
                    sort_order=3),
        ])
        print("Seeded starter packages.")

    if not AddOn.query.first():
        db.session.add_all([
            AddOn(slug="registered-agent", name="Registered agent (1 year)", price_cents=12500, recurring=True),
            AddOn(slug="ein-assist", name="EIN application assistance", price_cents=7500),
            AddOn(slug="operating-agreement", name="Operating agreement", price_cents=6000),
            AddOn(slug="expedited", name="Expedited processing", price_cents=2500),
            AddOn(slug="compliance", name="Texas compliance reminders", price_cents=9000, recurring=True),
            AddOn(slug="texas-dba", name="Texas assumed name (DBA) filing", price_cents=8500),
            AddOn(slug="licenses", name="Licenses & permits research", price_cents=8500),
            AddOn(slug="virtual-address", name="Virtual business address", price_cents=15000, recurring=True),
            AddOn(slug="trademark", name="Trademark intake assistance", price_cents=19900),
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
