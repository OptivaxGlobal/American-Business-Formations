# Part 1 Handoff: Foundation, Auth, API, Legal-Page, and Packaging Hardening

Scope: secure and stabilize the project foundation, authentication system, API client, legal-page deployment, environment configuration, and production/demo separation. Onboarding wizard internals, payment UI, and dashboard/admin data integration were explicitly **not** touched see "Known limitations for Part 2" below.

## What actually changed

### Authentication is now fully server-verified

- **`src/context/AppContext.jsx`** no longer reads or writes `localStorage` for the logged-in user. On mount it calls `api.me()` (`GET /api/auth/me`, cookie-based) and exposes:
  - `user` `null` until the server confirms a session.
  - `authStatus` `'loading' | 'authenticated' | 'anonymous'`. `'loading'` covers exactly the window between mount and the `/me` response.
  - `authServiceError` `true` only when `/me` failed for a reason *other than* a normal 401 (network error, 5xx, bad response shape). Use this to show "the service is temporarily unavailable" instead of silently treating an outage as "logged out."
  - `login(user)` called by `Login.jsx`/`Signup.jsx` with the real backend response body. Never call this with a fabricated object.
  - `logout()` now **async**. Calls `POST /api/auth/logout` (which the backend already `unset_jwt_cookies`s) and clears local state in a `finally` block regardless of the API outcome.
- **`src/components/ProtectedRoute.jsx`** renders `<RouteFallback/>` while `authStatus === 'loading'`, and only redirects to `/login` once it's `'anonymous'`. The `role` check now operates on the server-verified `user.role`.
- **`Login.jsx` / `Signup.jsx`**: the "demo admin" checkboxes and their `is_admin` form fields are gone entirely. Both pages call `api.login`/`api.signup` directly there is no local fallback for authentication, so a failed request always surfaces a real error.
- **`ForgotPassword.jsx` / `ResetPassword.jsx` / `VerifyEmail.jsx`**: also stopped using the local-fallback helper (`withLocalFallback`) a backend-unreachable error now shows a real error instead of a fake "sent"/"updated"/"verified" success. These are auth-adjacent flows and the "never show fake success" rule applies to them the same as login/signup.
- **`Signup.jsx`**'s terms checkbox now links to the real `/terms`, `/privacy`, and `/disclaimer` routes (previously plain text, no links at all).

### `src/lib/api.js` interface Part 2 should build on

```js
import { api, ApiError, withLocalFallback } from '../lib/api'

api.me()                          // GET  /api/auth/me   used by AppContext on mount
api.login(payload)                // POST /api/auth/login
api.signup(payload)                // POST /api/auth/signup
api.logout()                      // POST /api/auth/logout
api.uploadDocument(path, formData) // POST, multipart new helper for Part 2's document uploads
```

- Every request now sends `credentials: 'include'` so the JWT cookie round-trips even once frontend/backend are on different origins.
- Every non-GET request automatically attaches `X-CSRF-TOKEN` read from the `csrf_access_token` cookie (Flask-JWT-Extended's double-submit cookie, confirmed from `JWT_COOKIE_CSRF_PROTECT = True` in `server/config.py`). **Part 2's authenticated dashboard/admin mutations don't need to do anything special for CSRF** it's handled at the `request()`/`requestMultipart()` layer.
- `ApiError` still distinguishes `isNetworkError`, `.status`, and `.fieldErrors` unchanged shape.
- `withLocalFallback(action, fallback)` **only runs `fallback` when `VITE_DEMO_MODE === 'true'`** (unset/false by default, including production builds unless someone explicitly sets it). Authentication never uses this helper at all anymore. It still backs the onboarding checkout (`useOnboardingWizard.js`) and the contact form (`Contact.jsx`) those are Part 2/3 territory; see below.

### Backend (`server/`)

- **`server/config.py`**: added `validate_production_config(config)`, called from `create_app()` whenever `FLASK_ENV=production`. It raises `RuntimeError` (refuses to boot) if `SECRET_KEY`/`JWT_SECRET_KEY` are unset or still equal the dev default (`DEV_SECRET_KEY` constant), or if `FRONTEND_ORIGIN` isn't a `https://` URL. Tested in `server/tests/test_config.py`.
- **`server/app/__init__.py`**: added a `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'` header (safe because this Flask app only ever returns JSON confirmed no `render_template`/HTML responses to a browser; `send_from_directory` calls are forced `as_attachment=True` downloads, and the only `render_template` usage is for outbound *email* HTML, unrelated to HTTP responses). Also added `Cache-Control: private, no-store` on `/api/auth/me` and `/api/admin/*` responses.
- **No other backend behavior changed** signup/login/logout/lockout/rate-limiting/admin-role-checking were already correct; see the "Audit findings" in the approved plan for what was verified as already-solid.

### Legal pages (Step 5)

No content or routing bugs were found `src/data/legal.js`, `LegalPage.jsx`, and `SEO.jsx` were already correct (7 distinct entries, correct canonical/title/meta per route). Added `src/pages/LegalPage.test.jsx`, which asserts each of the 7 routes renders its own title/H1/canonical/intro and never another route's content this is the regression guard for the "duplicated Legal Disclaimer" symptom.

**That symptom's real cause is deployment, not source** `dist.zip` was found tracked in git and repeatedly modified (a committed build artifact). See the README's new "Deploying" section: always `npm ci && npm run build` fresh, deploy the whole `dist/` atomically, purge the Cloudflare cache, and verify a couple of legal routes in an incognito window before considering a deploy done.

### Packaging

- `.gitignore` now also excludes `dist.zip` and `*.zip`.
- `dist.zip` should be removed from git tracking with `git rm --cached dist.zip` **not yet run**, pending your confirmation (it changes what's tracked in version control going forward; the file itself stays on disk either way).
- README gained a "Clean packaging" section (`npm ci`, supported Node 18+/Python 3.11+, excluded paths) and the "Deploying" section above.

### Demo-text sweep

Removed/reworded the specific production-visible strings: both demo-admin checkboxes and their labels, "Use any valid email and password in the demo.", "This demo stores your session locally when Flask is not running.", the dashboard's "This demo stores document names..." note (reworded to an honest, non-"demo"-framed disclosure), and the Pricing page's "sample content" phrase (reworded since plan prices are now real configured values, not placeholder data). Left untouched: admin-dashboard-only labels like "(demo)"/"sample" in `AdminOverview.jsx`/`AdminApplications.jsx`/`AdminContent.jsx` (internal-only, informative to the operator, and part of the explicitly out-of-scope admin dashboard integration), and the onboarding payment step's "This is a demo checkout. No real payment provider is connected..." (accurate and required by "keep live payments disabled" Part 2's job is to replace the mechanism, not the honesty of the disclosure).

## Tests

**Frontend (can run in this environment):**
- New: `src/pages/LegalPage.test.jsx`, `src/context/AppContext.test.jsx`, `src/lib/api.test.js`.
- Rewritten: `src/components/ProtectedRoute.test.jsx` (the old version asserted against the removed localStorage mechanism).
- Updated: `src/pages/Contact.test.jsx`, `src/pages/Onboarding.test.jsx` the one test in each that reaches a real submission now explicitly stubs `VITE_DEMO_MODE=true` for that describe block, documenting that they're still exercising the Part 2/3 fallback rather than a real backend.
- Run with `npm ci && npm test` see the actual output reported alongside this document, not claimed from memory.

**Backend (cannot run in this environment no Python interpreter present):**
- Added to `server/tests/test_auth.py`: `test_signup_ignores_client_supplied_role`, `test_me_returns_current_user_after_login`, `test_logout_invalidates_the_session`, `test_me_requires_authentication_after_expired_or_missing_session`.
- New `server/tests/test_admin.py`: anonymous/customer/admin access to `/api/admin/overview` (401/403/200).
- New `server/tests/test_config.py`: `validate_production_config` accepts a real config and rejects a missing/default `SECRET_KEY`/`JWT_SECRET_KEY` or a non-`https://`/missing `FRONTEND_ORIGIN`.
- **Exact command to run these**: `cd server && pip install -r requirements.txt && pytest`. I wrote these against the existing `conftest.py` fixtures and existing passing tests as a pattern, but did not and could not execute them please run and report back if anything fails.

## Known limitations / follow-ups for Part 2

1. **Onboarding checkout and the contact form still use `withLocalFallback`.** With `VITE_DEMO_MODE` off (the real default), a backend-unreachable error now surfaces correctly instead of a fake success but the *real* fix is Part 2 replacing that fallback with actual order/account creation against the backend. Until then, local development needs `VITE_DEMO_MODE=true` to see the "fake success" screens these flows currently rely on for demoing.
2. **`AccountStep.jsx`** (inside onboarding) collects an email/password for account creation, but the actual submission goes through the generic `api.submitOnboarding()` call, not `api.signup()`. Whether that endpoint really creates a backend `User` record needs to be confirmed/implemented as part of Part 2's real onboarding integration.
3. **Payment UI** (`PaymentStep.jsx`, `dashboard/Billing.jsx`) is explicitly untouched per your instructions still an honest "no real payment provider connected" disclosure, Stripe wiring is Part 2's job.
4. **Dashboard/admin data** (`BusinessContext.jsx`, `OrdersContext.jsx`, admin screens) still use `localStorage` for business/order/cart *data* this was confirmed out of scope (not an auth/role trust issue) and is Part 3/4 territory.
5. **`RATELIMIT_STORAGE_URI=memory://`** is fine for a single dev process but doesn't share state across multiple gunicorn workers in production set `RATELIMIT_STORAGE_URI=redis://...` before a multi-worker production deploy (already documented in `server/.env.example`; not changed here since Redis isn't available to test in this environment).
6. **A role change requires re-login to take effect** the JWT bakes `role` in as a claim at token-creation time (`create_access_token(..., additional_claims={"role": user.role})`), so promoting a user to admin mid-session doesn't retroactively upgrade their existing cookie. This is standard JWT behavior, not a bug, but worth knowing if Part 2/3 builds an "promote to admin" admin-panel action it should tell the affected user to log back in.
7. **`dist.zip` removal from git tracking** added to `.gitignore` but `git rm --cached dist.zip` has not been run pending your confirmation.
