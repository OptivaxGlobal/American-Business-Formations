# American Business Formations

A Texas-focused business-formation platform: a public marketing site, a guided Texas LLC onboarding funnel, customer and admin dashboards, and a layered Flask API. Original design system and content built for comparable functionality to platforms like Tailor Brands without copying their code, copy, or visual identity.

## What's here

- **Public site** homepage, 13 launched Texas-focused service pages (16 more written but held back pending launch `isActive: false` in `src/data/services.js`, reachable by direct URL only, marked `noindex`), pricing, how it works, about, resources/blog, legal pages, FAQ, help center
- **Onboarding funnel** a 15-step guided Texas LLC formation wizard (business name → Certificate of Formation details → registered agent consent → organizer → effective date → EIN → package → account → review → payment → confirmation)
- **Auth** signup, login, email verification, password reset
- **Customer dashboard** formation status, documents, compliance checklist, orders/billing, support, settings
- **Admin dashboard** overview, leads, applications, customers, orders, plans/pricing, content (announcement bar + testimonials), audit log, Texas settings
- **API** (`server/`) Flask app factory, SQLAlchemy models, JWT cookie auth, rate limiting, Stripe adapter, SMTP email service, file uploads

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+ and pip
- (Optional, production) PostgreSQL and a Stripe account

## Quick start

```bash
# Frontend
npm install
cp .env.example .env
npm run dev              # http://localhost:5173

# Backend (separate terminal)
cd server
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
SEED_ADMIN_PASSWORD=change-me python seed.py   # creates tables + an admin account (dev/SQLite)
python run.py             # http://127.0.0.1:5000/api
```

Visit `http://localhost:5173`. The frontend works standalone (it falls back to local browser storage when the API isn't reachable), and upgrades to real persistence, auth, and payments once the Flask API is running.

## Frontend

```bash
npm run dev       # dev server
npm run build     # production build -> dist/
npm run preview   # preview the production build
npm run test       # vitest unit/component tests
```

Frontend environment variables (`.env`, see `.env.example`):

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL for the Flask API (defaults to `/api`, proxied to `http://127.0.0.1:5000` in dev) |
| `VITE_TX_FILING_FEE` | Optional override for the Texas filing fee shown before the backend is connected |

## Backend

See [`server/README.md`](server/README.md) for the full architecture (app factory, blueprints, models, services).

```bash
cd server
pip install -r requirements.txt
python run.py           # dev server
pytest                   # test suite
```

### Database

Defaults to local SQLite (`server/data/dev.db`) dev only. For anything beyond local development, set `DATABASE_URL` to a PostgreSQL connection string in `server/.env`.

```bash
# Quick local start (SQLite, no migration history)
SEED_ADMIN_PASSWORD=change-me python seed.py

# Production-style migrations (once DATABASE_URL is set)
flask --app run db init
flask --app run db migrate -m "initial schema"
flask --app run db upgrade
```

### Creating an admin account

```bash
SEED_ADMIN_EMAIL=admin@yourcompany.com SEED_ADMIN_PASSWORD=a-strong-password python seed.py
```

The frontend has no local admin-assignment path at all `role` is only ever read from the backend's `/api/auth/me`, `/api/auth/login`, and `/api/auth/signup` responses, and public signup always creates a `customer` (see `server/app/api/auth.py`). Use the seed script above (or promote a user directly in the database) to create an admin account.

### Payments (Stripe)

Checkout is fully wired but stays inert until configured orders are recorded as `pending` and a clear "not configured" message is returned instead of faking a successful payment.

1. Create a Stripe account and get test-mode keys.
2. Set `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET` in `server/.env`.
3. Point a Stripe webhook (test mode) at `POST /api/webhooks/stripe`, subscribed to `checkout.session.completed` and `payment_intent.payment_failed`.
4. Orders are only marked `paid` after the webhook verifies Stripe's signature never from a success-page query parameter alone.

### Email (SMTP)

Transactional emails are logged as `skipped_no_smtp` until SMTP is configured nothing silently fails or fakes success.

Set in `server/.env`: `INFO_EMAIL`, `SUPPORT_EMAIL`, `FROM_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_USE_TLS`.

### File storage

Documents upload to `server/data/uploads/<business_id>/` locally by default (`UPLOAD_DIR` in `.env`). For production, point `UPLOAD_DIR` at a mounted volume or swap `app/api/documents.py` for a cloud storage adapter (S3, GCS) the upload/download endpoints are the only place that needs to change.

## Environment variables reference

**Frontend (`.env`)** see `.env.example`.

**Backend (`server/.env`)** see `server/.env.example`: `SECRET_KEY`, `JWT_SECRET_KEY`, `FRONTEND_ORIGIN`, `DATABASE_URL`, `INFO_EMAIL`/`SUPPORT_EMAIL`/`FROM_EMAIL`, `SMTP_*`, `STRIPE_*`, `TEXAS_FILING_FEE`/`TEXAS_FILING_FEE_VERIFIED`, `UPLOAD_DIR`, `RATELIMIT_STORAGE_URI`.

## Deployment checklist

- [ ] Set real `SECRET_KEY` / `JWT_SECRET_KEY` (long, random, never committed)
- [ ] `DATABASE_URL` pointed at a managed PostgreSQL instance
- [ ] Run `flask db upgrade` against production before first deploy
- [ ] `FRONTEND_ORIGIN` set to your real domain (CORS is restricted to this one origin)
- [ ] Stripe live-mode keys + webhook configured and tested
- [ ] SMTP credentials configured and a test email sent
- [ ] Confirm the Texas Secretary of State filing fee and mark `TEXAS_FILING_FEE_VERIFIED=true` once confirmed (also settable from `/admin/settings`)
- [ ] `UPLOAD_DIR` pointed at persistent/cloud storage, not ephemeral disk
- [ ] `JWT_COOKIE_SECURE=true` in production (already automatic when `FLASK_ENV=production`)
- [x] No local admin-assignment path exists in the frontend `role` always comes from the backend (see `docs/part-1-handoff.md`)
- [ ] Replace placeholder testimonials (none ship by default verify before adding any)
- [ ] Have Privacy Policy, Terms, Refund Policy, and Disclaimer reviewed by a licensed attorney
- [ ] Confirm `robots.txt` / `sitemap.xml` domain matches your production domain

## Clean packaging

For a source-only delivery (e.g. handing this repo to another developer or environment), the working tree should never include generated or secret files. `.gitignore` already excludes `node_modules/`, `dist/`, `dist.zip`/`*.zip`, `.env`, `server/.env`, `__pycache__/`, `server/.venv/`, `server/data/*.db`, `server/data/uploads/`, and `server/migrations/`.

```bash
# Frontend a clean install always uses the lockfile, never node_modules directly
npm ci
npm run build     # -> dist/ (regenerated, never committed)

# Backend
cd server
python -m venv .venv && source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

Supported versions: **Node.js 18+** (see `Prerequisites` above) and **Python 3.11+**. If you ever find a `dist.zip` or a `dist/` folder checked into git, delete it from tracking (`git rm -r --cached dist.zip dist/`) it's a build artifact, not source, and a stale copy of it can end up deployed instead of your latest build (see "Deploying" below).

## Deploying

The legal pages are the easiest place to spot a stale/mixed deploy: each of `/privacy`, `/terms`, `/refund-policy`, `/disclaimer`, `/cookie-policy`, `/accessibility`, and `/do-not-sell` must render its own distinct title, H1, and content (`src/pages/LegalPage.test.jsx` asserts this at the source level) if a live check ever shows the same content on more than one of these routes, the deployed `dist/` is stale or partially overwritten, not a source bug.

1. Build fresh every time: `npm ci && npm run build` (the `postbuild` step reruns the Playwright prerender automatically).
2. Upload the entire new `dist/` as one atomic swap don't copy individual files over an existing upload on Hostinger, which can leave old and new files mixed mid-deploy.
3. Purge the Cloudflare cache for the zone (or at minimum the changed paths) immediately after the swap.
4. Verify in an incognito/private window (bypasses any local browser cache) that a couple of legal routes show distinct, correct content before considering the deploy done.

## Project structure

```
american-business-formations/
  src/
    components/       shared UI (Header, Footer, forms, dashboard/admin shells)
    pages/             route-level views (public, auth, dashboard/, admin/)
    context/            AppContext (auth/session), BusinessContext, OrdersContext
    data/                 services, SEO, legal copy, testimonials, announcement config
    config/               texas.js single source of Texas formation facts
    lib/                    api client, business-name validation, leads, audit log
    styles.css               design tokens + component styles
  server/
    app/                   Flask app factory, models/, api/, admin/, services/, templates/emails/
    tests/                   pytest suite
    seed.py                   creates tables + seed data
  public/                 logo, favicon, robots.txt, sitemap.xml, illustrations
```

## What's real vs. what's scaffolded

Everything in this repo is real, working code but a few integrations need credentials only the business owner can supply before they're "live":

- **Payments**: full Stripe adapter, inert without keys (see above)
- **Email**: full SMTP-based sender + templates, inert without SMTP credentials
- **EIN/name-availability**: intentionally not automated no third-party API was available, so these are guided intake + preliminary review flows with honest "confirm with the IRS/Texas Secretary of State" language, not fake automation
- **Business name availability**: preliminary formatting/duplicate checks only; final determination always belongs to the Texas Secretary of State
- **Sensitive identifiers** (SSN/ITIN): intentionally never collected through the website flagged as a separate, more tightly controlled process to build later
