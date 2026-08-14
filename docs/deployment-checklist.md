# Deployment Checklist

This covers the frontend static build, the Flask backend, database, environment variables, reverse-proxy/CORS wiring, Cloudflare, and rollback. **No deployment was performed by this pass** this is guidance for whoever runs the actual deploy, per your instruction not to deploy without explicit authorization.

## 0. Before you deploy anything

- [ ] Run `npm run build` fresh (never reuse an old `dist/`). It exits non-zero if the postbuild SEO validation fails do not deploy on a failed build.
- [ ] Run `node scripts/check-responsive.mjs` against the fresh `dist/` (needs the build present) should report zero overflow.
- [ ] Run `npm test` (`vitest run`) all 194 tests must pass.
- [ ] Backend: `cd server && pip install -r requirements.txt && pytest` **could not be run in this authoring environment (no Python interpreter available)**; run it yourself and confirm a clean pass before deploying. See "Known test-execution gap" in `final-production-handoff.md`.
- [ ] Confirm `server/.env` (production) has no dev-default `SECRET_KEY`/`JWT_SECRET_KEY` `validate_production_config()` refuses to boot otherwise, so a misconfigured secret fails loud at startup rather than silently running insecurely.
- [ ] Confirm `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` are still blank unless the client has explicitly provided real payment credentials and asked to go live (see `stripe-activation.md`).

## 1. Frontend build & upload

- Build: `npm ci && npm run build` (falls back to `npm install` if `npm ci` hits a locked-file error from an antivirus/indexer safe to retry).
- Output: `dist/` a self-contained set of static files (HTML, JS, CSS, images) plus 53 prerendered route snapshots.
- **Upload the entire `dist/` directory as one atomic unit.** Never upload individual changed files into an existing deployed folder a partial upload can serve a new JS bundle against old prerendered HTML (or vice versa), which is exactly the "duplicated Legal Disclaimer"-class bug this project has hit once already (see `part-1-handoff.md`).
- Recommended atomic-deploy pattern on any host that supports it: upload to a new timestamped/versioned directory, then flip a symlink (or the host's "active release" pointer) to it. If your host only supports FTP/file-manager upload with no atomic-swap primitive, upload to a temporary sibling folder first, verify it, then rename it over the live folder in one operation rather than overwriting file-by-file.
- SPA fallback: every unknown path must serve `dist/index.html` (or the matching prerendered `dist/<route>/index.html` where one exists) see `public/_redirects` (already present, Netlify/Cloudflare Pages-style rewrite rule) and `vercel.json`. If deploying to a plain Apache/Nginx host, add an equivalent rewrite (`try_files $uri $uri/ /index.html;` for Nginx).

## 2. Flask backend deployment

### Can Hostinger run this reliably?

**This depends on which Hostinger plan is provisioned, which was not confirmed as part of this pass** I do not have access to check the account. Two distinct cases:

- **Shared/Business web hosting** (the common low-cost Hostinger plan): generally does **not** give you a persistent Python process, SSH-run `gunicorn`, or a real PostgreSQL server you can point `DATABASE_URL` at. If this is the plan in use, **do not attempt to run the Flask backend on it** it can serve the static frontend `dist/` only. Host the backend separately (see below) and point `VITE_API_URL` at that backend's origin.
- **Hostinger VPS / Cloud Hosting**: gives real SSH access and can run gunicorn + PostgreSQL (self-managed or a separate managed Postgres) like any standard VPS. If this is the plan, follow the steps below directly on it.

**If shared hosting is what's provisioned, recommended backend hosts** (any of these run Flask + PostgreSQL reliably via a `requirements.txt`/`Procfile`-style deploy, with a managed Postgres add-on): Render, Railway, Fly.io, or a small DigitalOcean/Linode VPS. This is a recommendation only nothing has been provisioned or purchased as part of this pass.

### Steps (VPS / any host with SSH + Python)

1. `git clone`/upload the backend source (exclude `.env`, `data/uploads`, `data/*.db` see `scripts/package-source.mjs` for a clean copy).
2. `cd server && python -m venv .venv && source .venv/bin/activate` (or the Windows equivalent).
3. `pip install -r requirements.txt`.
4. Set every required variable from `environment-reference.md` in `server/.env` or the host's secret manager.
5. Run database migrations see "Database setup & migrations" below.
6. Start with a real process manager, not the Flask dev server:
   ```
   gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()" --access-logfile - --error-logfile -
   ```
   (`gunicorn` is already pinned in `requirements.txt`.) `-w 4` is a starting point size worker count to the host's CPU cores.
7. Put a process supervisor in front of gunicorn (systemd unit, Supervisor, or your host's built-in app-runner) so it restarts on crash and on reboot. A minimal systemd unit:
   ```ini
   [Unit]
   Description=American Business Formations API
   After=network.target

   [Service]
   WorkingDirectory=/opt/abf/server
   EnvironmentFile=/opt/abf/server/.env
   ExecStart=/opt/abf/server/.venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 "app:create_app()"
   Restart=always
   User=abf

   [Install]
   WantedBy=multi-user.target
   ```
8. Put a reverse proxy (Nginx, or Hostinger/Cloudflare's edge) in front of gunicorn to terminate HTTPS and forward `/api/*` to `127.0.0.1:5000`.

### Database setup & migrations

- **No migration history exists yet in this repository** (`server/migrations/` has never been initialized `Flask-Migrate` is wired into `create_app()` but `flask db init` was never run). Do this once, from an environment with Python and the real dependencies installed:
  ```
  cd server
  flask db init
  flask db migrate -m "Initial schema"
  flask db upgrade
  ```
  Commit the resulting `server/migrations/` folder to version control (`.gitignore` was corrected in this pass to stop excluding it migration scripts are code, not a build artifact).
- For every deploy after that: `flask db upgrade` before starting/restarting gunicorn, so the running schema always matches the code being deployed.
- Local dev / `seed.py` currently uses `db.create_all()` as a convenience bootstrap for SQLite **do not rely on `create_all()` in production**; use the migration flow above against PostgreSQL so schema changes are tracked, reviewable, and reversible.

### Environment variables

See `environment-reference.md` for the full, verified list. At minimum for production: `FLASK_ENV=production`, `SECRET_KEY`, `JWT_SECRET_KEY`, `FRONTEND_ORIGIN` (real `https://` domain), `DATABASE_URL` (real Postgres), `RATELIMIT_STORAGE_URI` (real Redis if running more than one worker).

### API routing / reverse proxy

- Frontend calls `VITE_API_URL` (baked in at build time) set it to the backend's real public origin + `/api` (e.g. `https://api.americanbusinessformations.com/api`) before running `npm run build` for production.
- If instead proxying `/api` under the same domain as the frontend (e.g. `https://americanbusinessformations.com/api/*` → backend), set `VITE_API_URL=/api` (relative) and configure the edge/reverse proxy to forward that path to the Flask process, leaving every other path to the static frontend.

### CORS / frontend origin

- `FRONTEND_ORIGIN` (backend env var) must exactly match the real deployed frontend origin (scheme + host, e.g. `https://americanbusinessformations.com`) `server/app/__init__.py` scopes CORS to exactly this one origin with `supports_credentials=True`. A mismatch (wrong scheme, trailing slash, or subdomain) breaks every authenticated request with a CORS error, not a clear application error.

### Persistent storage

- `UPLOAD_DIR` must point at a persistent volume that survives redeploys and restarts most PaaS containers reset local disk on every deploy. On a VPS this is just a real directory outside the deploy path (e.g. `/var/abf/uploads`); on a container platform, mount a persistent volume there. Losing this directory loses every customer-uploaded document.
- `docs/document-storage.md` (from Part 3) documents the design for moving to real object storage (S3/R2) when ready not implemented yet, local disk only.

### Health check

- `GET /api/health` returns `{ok: true, data: {service: "american-business-formations-api"}}` point your host's / load balancer's health check here. It does not touch the database, so it verifies the process is up, not that the DB is reachable; add a DB-touching check separately if your platform supports a deeper probe.

### HTTPS

- Terminate TLS at the edge (Cloudflare, or your reverse proxy with a Let's Encrypt cert) `server/app/__init__.py` sets `Strict-Transport-Security` automatically once `FLASK_ENV=production`, and `JWT_COOKIE_SECURE` is tied to the same flag (the auth cookie will not be sent over plain HTTP in production).

## 3. Cloudflare configuration (if used)

- DNS: proxy the frontend's record (orange-clouded) for CDN/caching benefits; the backend API subdomain can also be proxied, but confirm Cloudflare isn't caching authenticated API responses every `/api/*` response now sends `Cache-Control: private, no-store` (Part 4 hardening), which a correctly-configured Cloudflare respects by not caching it. Do not add a Cloudflare Page Rule that forces caching on `/api/*`.
- **Cache purge after every frontend deploy**: Cloudflare (or any CDN) may still be serving the previous build's HTML/JS/CSS from edge cache. Purge everything (or at minimum `/*` for the HTML pages) immediately after uploading a new `dist/` this is exactly the failure mode Part 1 traced the "duplicated Legal Disclaimer" symptom to (a stale cached page, not a source bug).
- If using Cloudflare Pages/Workers instead of a traditional host, its native atomic-deploy model already avoids the partial-upload risk described in section 1.

## 4. Rollback

- **Frontend**: keep the previous `dist/` build (or its zipped snapshot from `npm run package:source -- --zip`-style tooling, or your host's release history) available. Rolling back is re-pointing the atomic-release symlink (or re-uploading the previous versioned folder) to the prior build, then purging the CDN cache again.
- **Backend**: keep the previous release's code + know which migration revision it expects. Rollback is: stop gunicorn, `flask db downgrade <previous-revision>` **only if** the new migration is safely reversible (review every migration's `downgrade()` before relying on this some schema changes, like a dropped column, lose data on downgrade), redeploy the previous code, restart gunicorn.
- **Payments**: rolling back to a pre-Stripe-activation state is just unsetting `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` and restarting orders already marked `paid` are unaffected; see `stripe-activation.md`.
- Always test a rollback path in staging before you need it for real.

## 5. Preventing a mixed/stale deploy

- Never deploy frontend and backend independently without checking API-contract compatibility first this project has had a real history (Part 2) of the frontend calling a route the backend never implemented (`/api/onboarding`). Before deploying either side alone, confirm `src/lib/api.js`'s endpoints still match the backend's registered blueprints.
- Follow the atomic-upload guidance in section 1 for the frontend, and the migrate-then-restart order for the backend (apply `flask db upgrade` before starting the new gunicorn process, never after).
- After every deploy: load the homepage, one legal page, and `/formation-details` in an incognito window and confirm each shows its own correct title (not the homepage's) the fast, manual version of what `scripts/validate-seo.mjs` already checks automatically pre-deploy.

## 6. Post-deploy verification checklist

- [ ] Homepage loads, no console errors.
- [ ] A legal page (`/privacy`, `/terms`, etc.) shows its own unique title/H1/content, not the homepage's or another legal page's.
- [ ] `/formation-details` shows the onboarding wizard, not the homepage and `view-source:` on it shows `noindex` in the raw HTML (confirms the correct static shell deployed, not the SPA fallback).
- [ ] `curl -I https://yourdomain/sitemap.xml` and spot-check a handful of listed URLs resolve with 200 and correct canonical tags.
- [ ] Log in as a real test customer, complete onboarding, confirm the order appears in both the customer dashboard and the admin portal.
- [ ] Confirm the admin "payments enabled/disabled" banner (`/admin/settings`) reflects the real configured state.
- [ ] Confirm a deliberately-wrong API call (e.g. stop the backend briefly, or hit a route that 500s) shows a real error message in the UI, never a fake success.
