# American Business Formations API

A layered Flask application: app factory, blueprints per domain, SQLAlchemy models, JWT cookie auth, rate limiting, and adapters for email (SMTP) and payments (Stripe) that stay inert until configured.

## Structure

```
server/
  run.py              # entrypoint
  config.py            # env-based config classes
  seed.py               # create tables + seed an admin account and starter pricing (dev/SQLite)
  app/
    __init__.py         # app factory, blueprint registration, security headers
    extensions.py         # db, migrate, jwt, mail, cors, limiter singletons
    utils.py               # response helpers + shared validation
    models/                  # one file per domain (user, business, commerce, support, content, audit)
    services/                 # texas facts, email sending, Stripe adapter
    api/                        # public + authenticated REST endpoints
    admin/                        # admin-only endpoints (role-gated)
    templates/emails/               # transactional email templates
  tests/                             # pytest suite
```

## Setup

```bash
cd server
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill in real values
```

## Database

Defaults to a local SQLite file (`server/data/dev.db`) when `DATABASE_URL` is unset use this for local development only. Set `DATABASE_URL` to a PostgreSQL connection string for anything beyond local dev.

Quick local start (creates tables + seed data, no migration history):

```bash
SEED_ADMIN_PASSWORD=change-me python seed.py
```

Production-style migrations (once you've set `DATABASE_URL`):

```bash
flask --app run db init      # once, creates migrations/
flask --app run db migrate -m "initial schema"
flask --app run db upgrade
```

## Run

```bash
python run.py
```

API listens at `http://127.0.0.1:5000/api`.

## Tests

```bash
pytest
```

## Notes

- Auth uses JWT stored in HTTP-only cookies (`flask-jwt-extended`), not `localStorage` never move tokens into browser storage or the URL.
- Payments (`app/services/payments.py`) and email (`app/services/email.py`) are fully wired but stay inert orders are recorded as `pending` and emails are logged as `skipped_no_smtp` until you set `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` and `SMTP_*` in `.env`.
- No sensitive tax identifiers (SSN/ITIN) are accepted by any endpoint in this codebase that intake is intentionally left as a documented gap requiring a separate, more tightly controlled process before launch.
