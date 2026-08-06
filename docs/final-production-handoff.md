# Part 4 Final Production Handoff

Date: 2026-08-06
Scope: technical SEO, content cleanup, accessibility, responsiveness, performance, backend hardening, full QA, production build verification, and deployment documentation — the final phase on top of Parts 1–3 (auth, onboarding/payment-disabled checkout, customer dashboard/admin, all previously handed off and preserved unchanged in behavior except where a real bug is noted below).

Every claim below reflects something actually run in this environment (`npm test`, `npm run build`, the new `scripts/validate-seo.mjs` and `scripts/check-responsive.mjs`, direct file reads) — not assumed. Where something could not be run here (the Flask test suite — no Python interpreter in this environment, same constraint as Parts 1–3), that is stated plainly rather than claimed.

---

## 1. Executive summary

The application was already substantially real by the start of Part 4 — server-verified auth, real onboarding→checkout with server-calculated pricing, a real payment-disabled workflow, and a customer dashboard/admin portal backed by the real Flask API. Part 4's job was to find what was still wrong, prove it with evidence, fix it, and document what's left. Concretely this pass found and fixed:

- A **completely fake feature**: `/two-factor` was a page that accepted "any 6-digit code" and wasn't linked from anywhere in the app — removed entirely.
- A **duplicate-content SEO problem**: all 6 resource articles shared one hard-coded, self-admitting "sample article" body — reworked to an honest "article in progress" state, `noindex, follow`, and pulled out of `sitemap.xml`, with real per-article metadata (author/reviewer/dates/schema) wired and ready for whenever real articles are written.
- A **real canonical-URL bug**: the homepage's client-set canonical (`.../` missing) didn't match its own sitemap entry and static `index.html` — now consistent, caught by a new automated SEO validator that now runs on every build.
- A **real, reproducible layout bug**: every legal page overflowed horizontally at 320px width because of an unbreakable long email address — root-caused with an automated diff (not guessed) and fixed.
- **Two real payment-integrity gaps**: neither the offline-payment-recording endpoint nor the Stripe webhook handler checked that an order was in a sane starting state before marking it `paid` — an already-refunded/cancelled order could theoretically be marked paid again. Both now enforce an explicit valid-transition allowlist, with new tests.
- **A dead, risky client-side data path**: `src/config/texas.js` still read a localStorage override key with no remaining writer — a stale value in any browser's storage could have silently changed the displayed filing fee. Removed.
- **A real asset bug**: `logo.webp` was PNG bytes wearing a `.webp` extension — re-encoded as a genuine lossless WebP, 38% smaller.
- **~2.4KB of confirmed-dead legacy CSS** (an old homepage "AI assistant" demo mockup, orbit rings, an old logo strip/CTA band) verified against every JSX file before removal, plus a duplicate `.home-hero` rule that was silently shadowed and doing nothing.
- **Two automated tools that didn't exist before this pass**: `scripts/validate-seo.mjs` (sitemap/canonical/title/H1/robots-meta consistency, now wired into `postbuild`) and `scripts/check-responsive.mjs` (real horizontal-overflow detection across 5 breakpoints × every public route × mobile-menu/chat-widget interaction, via Playwright).
- **A real, intermittent test-suite bug, root-caused rather than dismissed**: running the full frontend suite occasionally failed several `Onboarding.test.jsx` tests together, with the wizard rendering as if already partway through instead of at step 1. Isolated single-file runs always passed, which made it easy to wave off as "environment flakiness" — instead it was traced to its actual cause: `src/test/setup.js` builds each test's in-memory `sessionStorage` once per file load with nothing ever clearing it, so a wizard draft autosaved by one test could still be sitting there when the next test mounted. Fixed with a global `afterEach` that clears both storages; confirmed with three consecutive full-suite runs, all 194/194 clean.

**193 → 194 frontend tests, all passing.** Production build succeeds, prerenders 53 routes (up from 52 — `/formation-details` now gets its own correct static shell instead of falling through to the homepage's), and the new SEO validator passes clean. The backend test suite (`server/tests/`, 12 files, ~90+ tests including 2 new ones added this pass) could not be executed in this authoring environment — no Python interpreter is present, identical to the stated limitation in Parts 1–3. This is the one honest gap in "tests pass" below; see section 12.

## 2. Final architecture overview

- **Frontend**: React 18 + React Router 7 SPA, Vite build, route-level code-splitting (every page lazy-loaded), a custom Playwright-based postbuild prerender step (`scripts/prerender.mjs`) that snapshots 53 public/marketing routes to real static HTML for crawlers and social-share unfurling, while `/dashboard`, `/admin`, and auth routes stay behind login and out of the sitemap.
- **Backend**: Flask app factory (`server/app/__init__.py`), SQLAlchemy models, JWT-cookie auth (httpOnly, SameSite=Lax, CSRF double-submit token), Flask-Limiter rate limiting, a Stripe adapter that's fully wired but inert until real keys are supplied, SMTP email service that logs-not-fakes when unconfigured, local-disk document storage with file-signature validation.
- **Data flow**: every price a customer sees at checkout is computed server-side from the `Package`/`AddOn`/Texas-config tables at the moment of the request — the client only ever sends identifiers, never a number that gets trusted.
- **Payment-disabled mode**: the default and current state — no Stripe keys configured, so every checkout attempt is saved as a real `awaiting_payment` order with a `Payment(provider="none", status="not_collected")` row, and an honest message is shown. Nothing simulates a charge.

## 3. All critical issues fixed (Part 4)

| # | Issue | File(s) | Verification |
|---|---|---|---|
| 1 | Fake `/two-factor` page, unlinked, accepted any code | `src/App.jsx`, deleted `src/pages/TwoFactor.jsx` | Confirmed zero other references before deleting; build/tests pass |
| 2 | Dead `withLocalFallback`/`VITE_DEMO_MODE` fake-success path | `src/lib/api.js`, `.env.example`, `src/lib/api.test.js` | Confirmed zero remaining callers before removing |
| 3 | Dead localStorage Texas-config override (client data could silently override a displayed price) | `src/config/texas.js` | Confirmed `saveTexasConfigOverrides` had zero callers; `getTexasConfig()` now returns the static config directly |
| 4 | All 6 resource articles share one self-admitting "sample article" body | `src/pages/BlogPost.jsx`, `src/pages/Resources.jsx`, `src/data/seo.js`, `public/sitemap.xml` | `noindex, follow` verified in prerendered output; sitemap URL count dropped 36→30, confirmed by `validate-seo.mjs` |
| 5 | Inactive/unlaunched service pages fully indexable | `src/pages/ServicePage.jsx` | `noindex, follow` confirmed in prerendered `dist/sales-tax-permit/index.html` etc. |
| 6 | Homepage canonical missing trailing slash vs. sitemap/static HTML | `src/components/SEO.jsx` | `validate-seo.mjs` failed before the fix, passes after |
| 7 | `/formation-details` served the homepage's static canonical/title until JS loaded | `scripts/prerender.mjs` | Confirmed distinct `<title>`/canonical/`noindex` in `dist/formation-details/index.html` |
| 8 | No WebSite schema; Article schema emitted for unpublished placeholder content | `src/data/seo.js`, `src/components/Layout.jsx`, `src/pages/BlogPost.jsx` | Reviewed generated JSON-LD directly |
| 9 | Legal pages overflow horizontally at 320px (unbreakable support-email link) | `src/styles.css` | Root-caused via automated DOM geometry dump; `check-responsive.mjs` reported 0 overflow after, across 239 combinations |
| 10 | Chat widget: no Escape-to-close, no live region for new messages, focus doesn't enter panel on open | `src/components/ChatWidget.jsx` | Manual code review + reasoning about DOM/tab order |
| 11 | Dashboard/admin error state not announced to screen readers | `src/components/dashboard/AsyncState.jsx` | `role="alert"` added; used by every rewired dashboard/admin page |
| 12 | Onboarding step sidebar had no `aria-current`, current step marked by color alone | `src/pages/onboarding/OnboardingShellChrome.jsx` | New passing test asserts focus/aria-describedby/role=alert wiring |
| 13 | `logo.webp` was mislabeled PNG bytes | `public/logo.webp` | `file` command confirmed real WebP after re-encode; 28KB → 17.8KB |
| 14 | ~2.4KB confirmed-dead legacy homepage CSS + a shadowed duplicate `.home-hero` rule | `src/styles.css` | Every removed class cross-checked against all JSX for zero references; CSS bundle 80.45KB → 77.18KB raw |
| 15 | Offline-payment endpoint and Stripe webhook didn't validate the order's starting status before marking it `paid` | `server/app/admin/routes.py`, `server/app/api/checkout.py`, `server/app/models/commerce.py` | New `ORDER_STATUSES_PAYABLE_FROM` allowlist; 2 new backend tests (unexecuted — see §12) |
| 16 | `Cache-Control: private, no-store` only covered 3 of 9+ authenticated route groups | `server/app/__init__.py` | Now applies to the whole `/api/` surface by default |
| 17 | `server/migrations/` was gitignored (migration scripts must be version-controlled, not treated as a build artifact) | `.gitignore` | Corrected; see §14 for the still-outstanding step of actually generating migrations |
| 18 | `VITE_TX_FILING_FEE` and `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` used in code but undocumented | `.env.example`, `server/.env.example` | Cross-checked every `import.meta.env.VITE_*` and `os.getenv()` call against both files |
| 19 | No automated SEO or responsive-regression checks existed | `scripts/validate-seo.mjs`, `scripts/check-responsive.mjs` | Both wired to `npm run build`/standalone; both currently pass clean |
| 20 | No clean source-packaging script | `scripts/package-source.mjs` | Verified output excludes `.git`/`node_modules`/`dist`/secrets/databases/uploads/caches and includes everything else; working repo's own `.git` confirmed untouched |
| 21 | `sessionStorage`/`localStorage` never cleared between tests — intermittently leaked an onboarding draft from one test into the next | `src/test/setup.js` | 3 consecutive full-suite runs, 194/194 each time, after the fix |

## 4. Files changed (Part 4)

**Frontend, new**: `src/lib/api.test.js` (trimmed), `scripts/validate-seo.mjs`, `scripts/check-responsive.mjs`, `scripts/package-source.mjs`.

**Frontend, edited**: `src/App.jsx`, `src/components/SEO.jsx`, `src/components/Layout.jsx`, `src/components/ChatWidget.jsx`, `src/components/dashboard/AsyncState.jsx`, `src/data/seo.js`, `src/pages/BlogPost.jsx`, `src/pages/Resources.jsx`, `src/pages/ServicePage.jsx`, `src/pages/onboarding/OnboardingShellChrome.jsx`, `src/pages/Onboarding.test.jsx`, `src/test/setup.js`, `src/config/texas.js`, `src/lib/api.js`, `src/styles.css`, `scripts/prerender.mjs`, `public/sitemap.xml`, `public/robots.txt`, `public/logo.webp` (binary re-encode), `.env.example`, `.gitignore`, `README.md`, `package.json`.

**Frontend, deleted**: `src/pages/TwoFactor.jsx`.

**Backend, edited**: `server/app/__init__.py`, `server/app/api/checkout.py`, `server/app/admin/routes.py`, `server/app/models/commerce.py`, `server/app/models/__init__.py`, `server/.env.example`.

**Backend, new tests**: additions to `server/tests/test_admin_portal.py`, `server/tests/test_checkout.py`.

**Docs, new**: this file, `docs/deployment-checklist.md`, `docs/environment-reference.md`.

**Docs, updated**: `docs/stripe-activation.md`.

*(Parts 1–3's files remain as documented in `part-1-handoff.md`/`part-2-handoff.md`/`part-3-handoff.md` — nothing from those parts was reverted. All of Parts 1–4's changes are currently uncommitted in the working tree — see §19.)*

## 5. Security improvements (Part 4, on top of Parts 1–3's auth/CSRF/CORS/rate-limiting work)

- Order status can no longer transition to `paid` from a terminal (`refunded`/`cancelled`) or already-`paid` state, via either the admin offline-payment endpoint or a stray/replayed Stripe webhook.
- `Cache-Control: private, no-store` now covers the entire authenticated API surface (`/api/orders`, `/api/applications`, `/api/support`, `/api/account`, `/api/notifications`, `/api/compliance` were previously uncovered — only `/api/auth/me`, `/api/admin/*`, `/api/documents/*` were), closing a real shared-cache/proxy exposure gap for customer data.
- Removed a dead client-side path (`config/texas.js` localStorage override) that could have let a stale browser value silently override a displayed price, even though it could never affect an actual charge (server-calculated pricing was never touched by it).
- `server/migrations/` corrected to be version-controlled rather than gitignored — schema history should be reviewable, not silently excluded.

## 6. Frontend/backend integrations

Unchanged from Parts 1–3's real, verified wiring: onboarding → real `Business`/`FormationApplication` records, server-calculated checkout, real customer dashboard (`BusinessContext`/`OrdersContext` are thin API loaders, no fabricated data), real admin portal, real contact/lead capture, real support threads, real document upload with signature validation. Part 4 did not rewire any integration point — it hardened what was already real.

## 7. Temporary payment-mode behavior

No Stripe keys configured (default state, confirmed unchanged). Every checkout produces a real `Order` with `status="awaiting_payment"`, a `Payment(provider="none", status="not_collected")` row, and the exact required customer message. No card fields exist anywhere in the source (`grep` for "card number"/"cvc"/"card expiry" turns up only honest help-copy and a privacy-policy sentence, confirmed in this pass). The only way an order becomes `paid` is a verified Stripe webhook (once activated) or an admin manually recording an offline payment with a required reference/note, both now guarded by the valid-status-transition allowlist above.

## 8. Future Stripe activation steps

See `docs/stripe-activation.md` (updated this pass to document the new status-transition guard). Summary: set `STRIPE_SECRET_KEY`/`STRIPE_PUBLISHABLE_KEY`/`STRIPE_WEBHOOK_SECRET` in `server/.env`, restart — no frontend code change needed, the checkout response already branches on whether `checkout_url` is present.

## 9. SEO improvements

- Fixed the homepage canonical/sitemap mismatch (see §3).
- `/formation-details` now prerenders its own correct static shell instead of falling through to the homepage's.
- Unpublished resource articles and unlaunched service pages are `noindex` (with `follow` so real linked pages are still reachable), pulled from `sitemap.xml`, with the "sample article" self-description removed.
- Added `WebSite` schema alongside the existing `Organization` schema (both site-wide, via `Layout.jsx`); `Article` schema is only ever emitted once a real, unique article exists for a slug.
- New `scripts/validate-seo.mjs`, run automatically as part of `npm run build`, checks: every sitemap URL resolves to a real prerendered file; every one has exactly one `<title>`/canonical/meta-description/`<h1>`/robots-meta/OG/Twitter set; canonical matches the sitemap URL exactly; no two pages share a title, description, or canonical; every declared-private route prefix is actually blocked in `robots.txt`; known-noindex routes actually carry `noindex` in their prerendered output.
- Legal pages re-verified: all 7 have distinct titles/H1s/canonicals (existing `src/pages/LegalPage.test.jsx` from an earlier phase still passes; `validate-seo.mjs` additionally confirms this in the real built output, not just the test).

## 10. Accessibility improvements

Building on an already-substantial earlier pass (skip links, focus traps, contrast fixes, `aria-live` toasts — see `docs/accessibility-seo-report.md`), Part 4 added:

- `aria-current="step"` + screen-reader-only "(completed)"/"(current step)" text on the onboarding wizard's step list (previously color-only for the current step).
- `role="alert"` on the shared dashboard/admin error state (`AsyncState.jsx`) — used by every rewired page from Part 3, so this is a broad fix from one change.
- Chat widget: Escape-to-close with focus restored to the toggle button, focus moves into the panel on open (previously Tab from the toggle skipped past the panel entirely due to DOM order), `role="log"`/`aria-live="polite"` on the message list so new replies are announced, `aria-hidden` on decorative icons.
- New regression test (`Onboarding.test.jsx`) explicitly asserting: the step-announcement live region exists, the first invalid field receives real DOM focus, it carries `aria-invalid`/`aria-describedby` pointing at an element that actually contains the visible error text, and the step-level error summary has `role="alert"`.

## 11. Performance results (measured, not estimated)

| Metric | Before Part 4 | After Part 4 |
|---|---|---|
| Main JS chunk (raw / gzip) | 303.8 KB / ~93.9 KB | 303.8 KB / 91.75 KB (logo/CSS changes don't touch JS; measured fresh) |
| CSS bundle (raw / gzip) | 80.45 KB / ~16.35 KB | 77.18 KB / 15.35 KB |
| `logo.webp` | 28,025 bytes (mislabeled PNG) | 17,862 bytes (real lossless WebP) |
| Prerendered routes | 52 | 53 (`/formation-details` added) |
| Horizontal-overflow check | not automated | `scripts/check-responsive.mjs`: **0 overflow** across 239 (route × 5 breakpoints × interaction) combinations |
| `npm audit` | not checked this pass | 8 → 7 findings after `npm audit fix` (postcss patched); remaining `react-router`/`react-router-dom` "RSC Mode CSRF Bypass" advisory has no non-breaking fix in the 7.x line — this app doesn't use React Router's RSC/framework-mode actions at all, so the vulnerable code path isn't reachable here, but a future major-version migration should still revisit it |

**Lighthouse was not run** — there is no live deployed URL in this environment, and a local dev-server Lighthouse run doesn't reflect real network conditions (same honest limitation stated in the prior accessibility/SEO report). The measured changes above (smaller CSS, correctly-encoded logo, retained route-level code-splitting, zero layout-shift-causing overflow) all have well-established positive Core Web Vitals impact; the actual LCP/INP/CLS numbers should be measured with a real Lighthouse or PageSpeed Insights run once deployed.

## 12. Test results

**Frontend — actually run in this environment:**
```
npx vitest run
 Test Files  23 passed (23)
      Tests  194 passed (194)
```
(193 before this pass + 1 new accessibility-focused onboarding test.) Confirmed stable with three consecutive clean full-suite runs after fixing a real cross-test `sessionStorage` leak in `src/test/setup.js` (see §3/§1) that had been intermittently failing several `Onboarding.test.jsx` tests together — not flakiness, a genuine test-isolation bug, root-caused via the actual rendered DOM in the failure output (the wizard was starting mid-flow instead of at step 1) rather than assumed away.

**Backend — could not be executed in this environment (no Python interpreter present, identical constraint to Parts 1–3).** 12 test files, including 2 files with new additions this pass (`test_admin_portal.py`: rejects marking a refunded order paid; `test_checkout.py`: a stray webhook event never downgrades an already-paid order). **Exact command to run them**: `cd server && pip install -r requirements.txt && pytest`. These were written against the existing `conftest.py` fixtures and passing-test patterns from Parts 1–3, reasoned through line-by-line against the actual route code they test, but not executed by me — run and confirm before deploying.

## 13. Build results

```
npm run build
✓ 1708 modules transformed
[prerender] done — 53 routes snapshotted.
[validate-seo] checked 30 sitemap URLs, 30 total sitemap entries, 10 robots.txt disallow rules.
[validate-seo] all checks passed.
```
Zero errors, zero SEO-validator failures, zero prerender page errors.

## 14. Database migration information

**No migration history exists yet.** `Flask-Migrate` is wired into `create_app()` but `flask db init` has never been run — local dev/`seed.py` uses `db.create_all()` as a convenience bootstrap, which is fine for SQLite dev but not a safe production schema-evolution strategy. Before the first production deploy, from an environment with the real Python dependencies installed:
```
cd server
flask db init
flask db migrate -m "Initial schema"
flask db upgrade
```
Commit the resulting `server/migrations/` folder (the `.gitignore` entry that excluded it has been removed this pass — see §3, item 17). Every subsequent deploy should run `flask db upgrade` before restarting the app process. Full guidance in `docs/deployment-checklist.md`.

## 15. Environment variables required

Full, cross-checked-against-source reference: `docs/environment-reference.md`. Two previously-undocumented variables were found in actual use and added: `VITE_TX_FILING_FEE` (frontend) and `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` (backend, seed-script-only).

## 16. Hostinger/Cloudflare deployment steps

Full detail in `docs/deployment-checklist.md`. Summary: **whether Hostinger's current plan can run the Flask backend depends on whether it's shared/Business hosting (cannot — static files only) or VPS/Cloud Hosting (can, with SSH + gunicorn + a real Postgres)** — this was not confirmed as part of this pass since I have no access to the actual hosting account. If it turns out to be shared hosting, the checklist recommends Render/Railway/Fly.io/a small VPS as the backend host, frontend still served from Hostinger, without anything being provisioned or purchased automatically. Cloudflare guidance covers cache-purge-after-deploy (root cause of a real bug in Part 1) and confirming `/api/*` responses are never cached at the edge.

## 17. Remaining credential-dependent tasks

1. **Real Stripe keys** — payments stay disabled until the business owner provides them (`docs/stripe-activation.md`).
2. **Real SMTP credentials** — transactional email is logged, not sent, until `SMTP_HOST`/`SMTP_USERNAME`/`SMTP_PASSWORD` are set.
3. **Confirming the Texas filing fee** against the Secretary of State before setting `TEXAS_FILING_FEE_VERIFIED=true` — currently an honest "estimate pending confirmation" everywhere it's shown.
4. **Confirming which Hostinger plan is provisioned** (§16) — determines whether the backend can be deployed there directly or needs a separate host.
5. **Real Redis instance** for `RATELIMIT_STORAGE_URI` before running more than one backend worker process.
6. **A phone number / mailing address**, if the business wants one published — none was found anywhere in the original project, and none was invented; `src/data/seo.js` has a comment flagging exactly where to add real values once supplied.

## 18. Remaining risks

- **Backend test suite has never been executed** in any of Parts 1–4's authoring environment — it should be run in full before the first production deploy, not assumed passing from code review alone.
- **No migration history** — see §14; the very first production deploy needs this step done manually, in order, before anything else.
- **`npm audit`'s react-router advisory** — no non-breaking fix exists yet; low real-world risk given this app's usage pattern (see §11), but worth revisiting when React Router v8 stabilizes.
- **Real cloud document storage and malware scanning** remain designed-but-not-implemented (`docs/document-storage.md`, from Part 3) — local disk only.
- **`RATELIMIT_STORAGE_URI=memory://`** does not share state across multiple gunicorn workers — must be Redis before scaling past one worker process.
- **16 written-but-unlaunched service pages and 6 placeholder resource articles** exist in the codebase, intentionally excluded from nav/sitemap and marked `noindex` — real, unique content should replace the articles (with real author/reviewer/dates — the data model is ready, see `src/pages/Resources.jsx`) before removing that placeholder status.

## 19. Production verification checklist

See the "Post-deploy verification checklist" at the end of `docs/deployment-checklist.md` for the full list — homepage/legal-page/formation-details spot checks, sitemap URL validation, full customer→admin order flow, and a deliberate-failure check that a broken backend call shows a real error, not a fake success.

**Before any deploy**: this project currently has ~140 uncommitted files in the working tree spanning Parts 1–4 (confirmed via `git status`) — nothing has been committed or pushed as part of this pass, per "commit only when asked." Decide on a commit/branch strategy before deploying from this working tree, so the deployed artifact traces back to a real, reviewable commit rather than an uncommitted working state.

## 20. Clean project handoff

- Clean source packaging: `npm run package:source` (optionally `-- --zip`) — produces a sibling directory (or zip) excluding `.git`, `node_modules`, `dist`, any `.zip`, `.env`/`server/.env`, databases, uploads, and caches. Verified in this pass: output excludes every forbidden path and includes everything required to build and run; the live repo's own `.git` is never touched.
- Production build artifact: `npm run build` → `dist/` (2.9MB, 53 prerendered routes, self-contained).
- All four required docs are now present: this file, `docs/deployment-checklist.md`, `docs/stripe-activation.md`, `docs/environment-reference.md`.
- Every prior part's handoff document (`part-1-handoff.md`, `part-2-handoff.md`, `part-3-handoff.md`) remains accurate — nothing they documented was reverted or contradicted by this pass.
