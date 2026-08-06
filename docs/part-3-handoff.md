# Part 3 Handoff: Customer Dashboard & Admin Portal Connected to the Real Backend

Scope: connect the customer dashboard and the entire admin portal to the real Flask backend; implement real contact-lead capture, resource-checklist leads, a real support-thread system, real document upload with signature validation, real account/profile settings (including an email-change confirmation flow), and real notifications. `BusinessContext.jsx`/`OrdersContext.jsx` the two contexts every dashboard page reads from no longer hold any client-fabricated data; both are thin loaders over real API calls.

## What was actually broken before this pass

The backend was, once again, further along than the frontend suggested. `orders.py`, `support.py`, `compliance.py`, and `documents.py` already had real, ownership-scoped routes that nothing in the UI ever called. The dashboard's `BusinessContext`/`OrdersContext` were 100% `localStorage`, and `OrdersContext.checkout()` unconditionally fabricated a `status: 'paid'` order on every "purchase" exactly the "fake paid order" the project has explicitly forbidden since Part 2. `Support.jsx`/`AdminSupport.jsx` read/wrote `localStorage['abf-tickets']` directly, bypassing the real support API entirely. Every admin screen (`AdminOverview`, `AdminApplications`, `AdminCustomers`, `AdminSupport`) blended real-looking local data with `adminDemoData.js` fake rows in the same tables, with no visual distinction between real and fake. `Settings.jsx`'s three notification-preference checkboxes were **uncontrolled DOM inputs with no state at all** toggling them did nothing, ever, and "Save" only mutated in-memory `AppContext.user`, lost on refresh.

## Files changed

**Backend, new**: `server/app/api/account.py`, `server/app/api/notifications.py`.

**Backend, modified**: `server/app/models/user.py` (`pending_email`, `email_reminders_enabled`, `sms_reminders_enabled`), `server/app/models/commerce.py` (`Payment.note`, `Order.to_dict()` includes `business_id`), `server/app/api/applications.py` (`GET /api/applications` list-mine, notification on submit), `server/app/api/checkout.py` (notification on `awaiting_payment`), `server/app/api/orders.py` (list endpoint now embeds `items`), `server/app/api/support.py` (`GET /api/support/threads/<id>` detail), `server/app/api/documents.py` (file-signature check, deny-list, notification on staff upload), `server/app/api/catalog.py` (public `GET /api/testimonials`, `GET /api/announcement`), `server/app/api/auth.py` (`verify_email` now serves email-change confirmation too), `server/app/admin/routes.py` (add-on update, payment-status read, offline-payment recording, support thread admin routes, testimonial update/delete, `_log()` now populates `actor_label`), `server/app/__init__.py` (`Cache-Control: private, no-store` extended to `/api/documents/`).

**Backend, new docs**: `docs/document-storage.md`.

**Backend, new tests**: `server/tests/test_dashboard.py`, `test_account.py`, `test_support.py`, `test_documents.py`, `test_admin_portal.py`; additions to `test_contact.py`.

**Frontend, new**: `src/components/dashboard/AsyncState.jsx` (shared loading/error/retry wrapper used by every rewired page).

**Frontend, rewritten**: `src/lib/api.js` (~35 new functions), `src/context/BusinessContext.jsx`, `src/context/OrdersContext.jsx`, `src/pages/dashboard/{Businesses,BusinessDetail,Orders,Billing,Support,Notifications,Settings,DashboardHome}.jsx`, `src/pages/dashboard/Guide.jsx` (patched, not rewritten stopped referencing removed fields), `src/pages/admin/{AdminOverview,AdminLeads,AdminApplications,AdminCustomers,AdminOrders,AdminPlans,AdminSupport,AdminContent,AdminAuditLog,AdminSettings}.jsx`, `src/components/Header.jsx`, `src/pages/Home.jsx`, `src/pages/Reviews.jsx` (public testimonial/announcement wiring), `src/pages/Contact.jsx`, `src/components/BusinessNameStartForm.jsx`, `src/pages/Resources.jsx`.

**Frontend, deleted** (confirmed zero remaining importers before deletion): `src/data/adminDemoData.js`, `src/lib/auditLog.js`, `src/data/announcement.js`, `src/data/testimonials.js`, `src/lib/leads.js`.

**Frontend, new/rewritten tests**: `src/pages/Contact.test.jsx` (rewritten), `src/pages/dashboard/Settings.test.jsx`, `src/pages/dashboard/Support.test.jsx`, `src/pages/dashboard/BusinessDetail.test.jsx`, `src/context/BusinessContext.test.jsx`, `src/pages/admin/AdminApplications.test.jsx`.

## 1. Customer dashboard: connected to the real backend

- `BusinessContext.jsx` and `OrdersContext.jsx` are now thin loaders: they fetch `api.listBusinesses()` / `api.listOrders()` on mount and whenever auth state changes, and expose `{data, loading, error, refetch}`. Neither context fabricates data, and both reset to empty the instant `user` becomes falsy (logout/session-expiry safety verified in `src/context/BusinessContext.test.jsx`).
- `Businesses.jsx`, `BusinessDetail.jsx`, `Orders.jsx`, `Billing.jsx`, `DashboardHome.jsx` all use the shared `AsyncState` component for loading/error+retry states instead of ad-hoc JSX, and never claim success without a real 2xx response.
- `BusinessDetail.jsx`: document upload now does a real multipart `POST /api/documents/:businessId/upload` after a client-side `validateFile` pre-check (type/extension/size); compliance checklist reads/writes real tasks via `api.listComplianceTasks`/`seedComplianceTasks`/`updateComplianceTask` with optimistic-toggle-and-rollback on failure. The "Formation" tab now shows a real status-derived timeline (`STATUS_STEPS`/`STATUS_LABELS` mapped from the actual `APPLICATION_STATUSES`), replacing a fake `business.timeline` array.
- `DashboardHome.jsx`: the fake `initialTasks` checklist is gone, replaced with a real progress view derived from the business's actual application status.
- `Billing.jsx` filters the order list by `items.some(i => i.type === 'plan')`, which required `GET /api/orders` (the list endpoint, not just single-order GET) to embed `items` per order added in `orders.py`.

## 2. Account settings

- `PATCH /api/account/profile` (new) accepts only `name`, `phone`, `email_reminders_enabled`, `sms_reminders_enabled`, `marketing_consent` the handler never reads `role`, `is_active`, `id`, or anything else off the payload (no `**data` anywhere in the route), so a payload with `role: "admin"` is silently ignored by construction, not by a denylist check. Covered by `test_account.py`.
- Email changes are a separate flow: `PATCH /api/account/email` stores the new address on `user.pending_email` (never touches `user.email`/`email_verified` directly) and sends the verification link to the **new** address. `auth.py`'s existing `verify_email()` token flow now also handles this case if `pending_email` is set, confirming the token swaps `user.email = user.pending_email` instead of just flipping a flag on the original address. `Settings.jsx` shows an explicit "check your new inbox your email won't change until you click it" state rather than silently updating.
- `POST /api/account/password` requires the current password (checked server-side) before accepting a new one.
- **Real bug found and fixed**: `Settings.jsx`'s form fields were initialized from `user?.name || ''` etc. at first render, but `user` loads asynchronously (`AppContext` resolves `/api/auth/me` after mount) so the fields stayed permanently empty in any render path that doesn't happen to catch `user` already populated. Fixed with a `useEffect` keyed on `user?.id` that syncs the fields in once the real account data arrives, without clobbering in-progress edits on subsequent re-renders. The three reminder/marketing checkboxes are now real controlled inputs bound to state, included in the same save payload previously they were uncontrolled and did nothing at all.

## 3. Support system

- `GET /api/support/threads/<id>` (new) returns a thread's full message list, ownership-scoped previously the only support route returned thread metadata with no way to actually read the conversation.
- Admin-side: `GET/PATCH /api/admin/support/threads*` (new) gives staff visibility into every thread and a reply endpoint that sets `is_staff=True` and flips the thread to `pending` (awaiting the customer). Every route requires `admin_required` a customer gets 403/401, never 200.
- `Support.jsx`/`AdminSupport.jsx` no longer touch `localStorage['abf-tickets']` at all; both are 100% backend-driven, tested against loading/empty/error states and a real create-then-refresh flow.

## 4. Document upload security

- Beyond the existing extension allow-list, `documents.py` now checks the actual file's magic bytes against what the claimed extension implies (PDF, PNG, JPEG, DOCX/ZIP, legacy DOC/OLE2) and rejects a mismatch with 422 a `.html` file renamed to `.pdf` is rejected even though the extension alone would have passed. A hard deny-list (`svg`, `html`, `htm`, `exe`, `js`, `mjs`, `sh`, `bat`, `php`) applies regardless of the allow-list.
- Downloads are forced attachments (`as_attachment=True`) with `Cache-Control: private, no-store` (the existing security-headers hook was extended to cover `/api/documents/`), so a served PDF/image can never render inline or get cached by a shared machine/proxy.
- `Document.to_dict()` never exposes the raw `storage_path` only `id`, `document_type`, `file_name`, `size_bytes`, `version`, `created_at`.
- Real cloud storage (S3/R2) and malware scanning are **designed and documented, not implemented** see `docs/document-storage.md`. Local disk remains the storage adapter for this pass.

## 5. Contact form, lead capture, resource checklist

- `Contact.jsx` calls `api.submitContact()` directly (no more `withLocalFallback`), and only shows success after a real 2xx. A honeypot field (visually off-screen, `tabIndex={-1}`) silently no-ops the submission before any API call if a bot fills it no CAPTCHA was added since none is configured.
- `BusinessNameStartForm.jsx` sends a fire-and-forget `api.submitLead(...)` that never blocks or delays the existing `navigate()` call.
- **Resources checklist** (per your confirmed answer real lead capture, no fake delivery): the form now calls the real `POST /api/leads`, and the success copy was changed from implying immediate delivery to *"we've saved your interest and will follow up when it's ready"* no attachment is actually sent, so the copy no longer claims one was.

## 6. Admin portal: connected to the real backend

- Every admin screen (`AdminOverview`, `AdminLeads`, `AdminApplications`, `AdminCustomers`, `AdminOrders`, `AdminPlans`, `AdminSupport`, `AdminContent`, `AdminAuditLog`) now reads/writes exclusively through `admin_required`-gated backend routes. `adminDemoData.js` is deleted; nothing blends real and fake rows anymore.
- `AdminOrders.jsx` adds an offline-payment-recording flow: a confirm step plus required `reference` and `note` fields, calling `POST /api/admin/orders/:id/record-offline-payment` the **only** path (besides a verified Stripe webhook, currently inactive) that can ever set an order to `paid`. It requires the admin role, creates a `Payment(provider="offline", note=...)` row and an `AuditLog` entry naming the admin, the order, and the reference. `test_admin_portal.py` proves a customer has no route capable of marking their own order paid. A "payments enabled/disabled" banner reads `GET /api/admin/payment-status` so the screen never guesses.
- `AdminPlans.jsx` edits the real `Package`/`AddOn` catalog. Editing a price cannot retroactively change an already-placed order `Order`/`OrderItem` store a price snapshot at checkout time (Part 2's design); `test_admin_portal.py` verifies this holds. A note in the UI clarifies this screen doesn't affect the separately-maintained public marketing pricing pages (a deliberate, plan-approved scope boundary see "Remaining issues" below).
- `AdminSettings.jsx` was deliberately kept **read-only** for the Texas filing-fee config: the generic site-settings write endpoint has no payload validation, and that config feeds directly into real checkout totals wiring an unvalidated admin-editable override into that path was judged an unnecessary correctness risk. The screen shows the real server values with a note that they're env-var-controlled (`TEXAS_FILING_FEE`/`TEXAS_FILING_FEE_VERIFIED`), plus the real payments-enabled/disabled readout.
- `_log()` (the shared admin audit helper) previously never populated `AuditLog.actor_label` fixed to look up the acting admin's email.

## 7. Admin content and testimonials

- Testimonials are real CRUD (`GET/POST/PATCH/DELETE /api/admin/content/testimonials`) with server-enforced `verified`/`published` flags the update route re-derives `published = published_flag AND verified_flag`, so an unverified testimonial can never be published even via an edit that only touches `published`.
- New public read routes (`GET /api/testimonials`, `GET /api/announcement`) were needed because moving admin content management onto the real backend would otherwise leave the admin screen writing to a database nothing public reads. `Header.jsx`, `Home.jsx`, and `Reviews.jsx` were rewired from synchronous localStorage reads to `useEffect`-based fetches, including a field-name rename (`name`/`role` → `customer_name`/`customer_role`) to match the real `Testimonial` model.

## 8. Test/build results

**Frontend (actually run in this environment):**
- `npx vitest run` → **193/193 passed** (23 files) after fixing failures the full run surfaced (see below).
- `npm run build` → succeeded, 52 routes prerendered, zero console errors.

**Two real bugs were caught by the test run and fixed, not just test-authoring mistakes:**
1. **`Settings.jsx` never populated its fields.** Local `useState(user?.name || '')` initializers only ever read `user` once, at first render, before `AppContext`'s async `/auth/me` resolves so the profile form stayed empty. Fixed with a `useEffect` keyed on `user?.id`.
2. **A real race in `BusinessContext.jsx`/`OrdersContext.jsx`**: both contexts flipped `loading` to `false` on the very first effect tick whenever `user` was still `null` which is true for one tick on every page load, before `AppContext`'s async auth check resolves. The instant that check *does* resolve, `ProtectedRoute` renders the dashboard page in the same commit, which could see `loading: false, businesses: []` (or `orders: []`) for that one frame before the real fetch triggered by the just-updated `user` had a chance to run. A page like `BusinessDetail.jsx` that redirects on `!business` would incorrectly bounce a real, valid user away. Fixed by having both contexts also watch `authStatus` and defer their "no user, stop loading" bail-out until the real auth check has actually finished. This is a genuine production bug that would have intermittently kicked a legitimate customer off a business-detail deep link or a refreshed page not merely a test-timing artifact, since it depends on the same async ordering that exists in the real browser.

**Backend (cannot execute no Python interpreter available in this environment, same constraint as Parts 1–2):**
New: `test_dashboard.py`, `test_account.py`, `test_support.py`, `test_documents.py`, `test_admin_portal.py`; additions to `test_contact.py`. Written against the existing `conftest.py` fixtures and passing-test patterns, but not executed.
**Exact command to run them**: `cd server && pip install -r requirements.txt && pytest`

## Remaining issues for Part 4

1. **`Guide.jsx`'s keyword-matched "AI assistant"** widget was left untouched not named anywhere in Part 3's step list, and it's clearly labeled as a help widget rather than a data-integrity concern. Worth a look if Part 4 touches customer-facing "AI" claims.
2. **Real cloud storage (S3/R2)** for documents is designed and documented (`docs/document-storage.md`) but not implemented local disk only, per the environment's own constraints.
3. **Malware scanning** for uploads is documented as a recommendation, not implemented no scanning service is available in this environment to integrate against.
4. **Marketing pricing pages** (`PricingCards.jsx`, `Pricing.jsx`, etc.) still show their own hardcoded catalog rather than the live backend `Package`/`AddOn` rows that `AdminPlans.jsx` now edits. This was an explicit, plan-approved scope boundary carried over from Part 2, but it means an admin who edits a price in `AdminPlans.jsx` won't see that reflected on the public pricing page only in what checkout actually charges. A future pass could make the public pages fetch `/api/packages`/`/api/add-ons` live.
5. **Texas filing-fee config is read-only in the admin UI** (env-var-controlled) a deliberate call made mid-implementation because the generic site-settings write path has no payload validation and this value feeds real checkout totals. If real-time admin control over this value is wanted, it needs a dedicated, validated endpoint rather than the generic settings store.
6. **`RATELIMIT_STORAGE_URI=memory://`** still applies (unchanged since Part 1) needs Redis for a multi-worker production deploy; now more relevant given the new rate-limited support/document/lead routes.
7. Upload progress is a simple pending/success/error state, not a real percentage (would need `XMLHttpRequest` instead of `fetch`) minor UX polish, not a data-integrity requirement.

Per your instruction, Part 4 has not been started.
