# Environment Variable Reference

Every variable listed here was cross-checked against actual `os.getenv()` / `import.meta.env.VITE_*` reads in the source on 2026-08-06 (Part 4) nothing invented, nothing left undocumented. Copy `.env.example` → `.env` (frontend) and `server/.env.example` → `server/.env` (backend); never commit the real `.env` files (`.gitignore` already excludes both).

## Frontend (`.env`, read by Vite at build time)

| Variable | Required? | Default if unset | Purpose |
|---|---|---|---|
| `VITE_API_URL` | Yes (production) | `http://127.0.0.1:5000/api` | Base URL the frontend calls for every `/api/*` request (`src/lib/api.js`). Must point at your deployed backend's public origin + `/api`. |
| `VITE_TX_FILING_FEE` | No | `300` | Display-only fallback for the Texas filing fee shown on marketing pages (`src/config/texas.js`) before checkout. **Never** determines what a customer is charged keep it numerically in sync with the backend's `TEXAS_FILING_FEE` so the marketing page and checkout never show two different numbers, but a mismatch is a cosmetic bug, not a billing bug. |

Vite only exposes variables prefixed `VITE_` to client code never put a secret in a `VITE_*` variable, it ships in the public JS bundle.

## Backend (`server/.env`, read by Flask at process start)

### Core / required in production

| Variable | Required? | Default if unset | Purpose |
|---|---|---|---|
| `FLASK_ENV` | Yes | `development` | Set to `production` to enable `validate_production_config()` (refuses to boot with a default secret or non-`https://` frontend origin), secure cookies, and HSTS. |
| `SECRET_KEY` | **Yes in production** | dev placeholder (rejected by the production guard) | Flask session/signing secret. Generate with `python -c "import secrets; print(secrets.token_hex(32))"`. |
| `JWT_SECRET_KEY` | **Yes in production** | falls back to `SECRET_KEY` | Signs the JWT auth cookie. Use a *different* random value from `SECRET_KEY` in production. |
| `FRONTEND_ORIGIN` | **Yes in production** | `http://localhost:5173` | Single allowed CORS origin (also used to build email links). Must be `https://` in production or boot fails by design. |
| `DATABASE_URL` | No (dev), **Yes (production)** | local SQLite file under `server/data/` | Full SQLAlchemy URL. Use PostgreSQL in production, e.g. `postgresql://user:pass@host:5432/dbname` (`psycopg2-binary` is already in `requirements.txt`). |
| `JWT_COOKIE_DOMAIN` | Only if frontend/backend are on different subdomains | unset (cookie scoped to the exact responding host) | Set to the shared parent domain with a leading dot, e.g. `.americanbusinessformations.com`, so the CSRF double-submit cookie (`csrf_access_token`) is readable by frontend JS even when the backend responds from a different subdomain. Leave unset when both share the exact same origin. |

### Uploads

| Variable | Required? | Default | Purpose |
|---|---|---|---|
| `UPLOAD_DIR` | No | `server/data/uploads` | Filesystem path for customer document uploads. Point this at a persistent volume in production see "Persistent storage" in `deployment-checklist.md`. |

### Email (transactional emails are logged, not sent, when these are blank never a fake "sent" state)

| Variable | Required? | Purpose |
|---|---|---|
| `INFO_EMAIL` | No (has a default) | General company address, also the default for `SUPPORT_EMAIL`/`FROM_EMAIL`. |
| `SUPPORT_EMAIL` | No | Address shown to customers and used as the reply target. |
| `FROM_EMAIL` | No | `From:` header on outbound mail. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USERNAME` / `SMTP_PASSWORD` / `SMTP_USE_TLS` | No, but **all four of host/username/password must be set together** to actually send mail (`EMAIL_ENABLED = bool(SMTP_HOST and SMTP_USERNAME and SMTP_PASSWORD)`) | Real SMTP credentials. Until set, every `send_email()` call is logged to the `EmailLog` table as `status="skipped_no_smtp"` and returns normally the app never claims an email was sent when it wasn't. |

### Payments (Stripe) stays disabled until both are set; see `docs/stripe-activation.md`

| Variable | Required? | Purpose |
|---|---|---|
| `STRIPE_SECRET_KEY` | No (leave blank to keep payments disabled) | Server-side Stripe API key. |
| `STRIPE_PUBLISHABLE_KEY` | No | Reserved for a future embedded-checkout flow; unused today (checkout redirects to a Stripe-hosted page). |
| `STRIPE_WEBHOOK_SECRET` | No (leave blank to keep payments disabled) | Verifies `POST /api/webhooks/stripe` requests actually came from Stripe. `PAYMENTS_ENABLED = bool(STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET)` both must be set together. |

### Texas filing configuration

| Variable | Required? | Default | Purpose |
|---|---|---|---|
| `TEXAS_FILING_FEE` | No | `300` (dollars) | Real state filing fee used to compute every order's `state_fee_cents` server-side (`server/app/services/texas.py`). **This is the actual number customers are charged** confirm it against the Texas Secretary of State before going live, and keep `VITE_TX_FILING_FEE` (frontend) in sync for display consistency. |
| `TEXAS_FILING_FEE_VERIFIED` | No | `false` | Whether the value above has been confirmed against the state. While `false`, the UI shows an honest "estimate pending confirmation" note (marketing pages, onboarding review step, admin settings) flip to `true` once confirmed, not before. |

### Rate limiting

| Variable | Required? | Default | Purpose |
|---|---|---|---|
| `RATELIMIT_STORAGE_URI` | **Recommended in production** | `memory://` | Backing store for Flask-Limiter. `memory://` does **not** share state across multiple gunicorn workers/processes a multi-worker production deploy needs `redis://<host>:6379/0` (or similar) so rate limits are enforced consistently across all workers, not reset per-worker. |

### One-time seeding only (not read by the running app)

| Variable | Required? | Purpose |
|---|---|---|
| `SEED_ADMIN_EMAIL` | No | Email for the admin account `python seed.py` creates. Defaults to `admin@americanbusinessformations.com`. |
| `SEED_ADMIN_PASSWORD` | No | If unset, `seed.py` **skips** admin creation entirely rather than defaulting to a guessable password set a strong password before running `seed.py` if you need an initial admin account. |

## Quick-start checklist for a new environment

1. Copy both `.env.example` files and fill in the required-in-production rows above.
2. Generate unique `SECRET_KEY`/`JWT_SECRET_KEY` never reuse the value from another environment.
3. Point `DATABASE_URL` at a real PostgreSQL instance for anything beyond local dev.
4. Leave `STRIPE_*` blank until the business owner provides real payment credentials (see `docs/stripe-activation.md`).
5. Confirm `TEXAS_FILING_FEE`/`TEXAS_FILING_FEE_VERIFIED` against the Texas Secretary of State before setting `TEXAS_FILING_FEE_VERIFIED=true`.
6. Set `RATELIMIT_STORAGE_URI` to a real Redis URL before running more than one backend worker process.
