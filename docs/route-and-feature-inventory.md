# Route & Feature Inventory

_Generated as part of the full-project audit, 2026-07. Source of truth: `src/App.jsx`. Verified by direct navigation of every route in a real browser (Playwright/Chromium), including a simulated logged-in customer session and a simulated admin session via `localStorage['abf-user']`._

## 1. Marketing / public routes (wrapped in `Layout` header + footer + chat widget)

| Route | Page component | Status | Notes |
|---|---|---|---|
| `/` | `Home.jsx` | ✅ 200, no console errors | |
| `/services` | `Services.jsx` | ✅ 200 | |
| `/:slug` (9 active slugs below) | `ServicePage.jsx` | ✅ 200 each | Dynamic route registered once per key in `src/data/services.js`, filtered to `isActive: true` for nav/footer links |
| &nbsp;&nbsp;`/llc-formation` | | ✅ | |
| &nbsp;&nbsp;`/registered-agent` | | ✅ | |
| &nbsp;&nbsp;`/ein` | | ✅ | |
| &nbsp;&nbsp;`/operating-agreement` | | ✅ | |
| &nbsp;&nbsp;`/texas-dba` | | ✅ | |
| &nbsp;&nbsp;`/texas-compliance` | | ✅ | |
| &nbsp;&nbsp;`/formation-kit` | | ✅ | |
| `/pricing` | `Pricing.jsx` | ✅ 200 | |
| `/how-it-works` | `HowItWorks.jsx` | ✅ 200 | |
| `/about` | `About.jsx` | ✅ 200 | |
| `/reviews` | `Reviews.jsx` | ✅ 200 | Intentional honest empty state no reviews published yet |
| `/resources` | `Resources.jsx` | ✅ 200 | See P1 findings fake search box, dead topic anchors, dead lead-magnet button |
| `/resources/:slug` | `BlogPost.jsx` | ✅ 200 | 6 sample posts in `Resources.jsx`'s `posts` array; content is placeholder/sample, self-labeled as such |
| `/contact` | `Contact.jsx` | ✅ 200 | Validated form, wired to `/api/contact` |
| `/help` | `Help.jsx` | ✅ 200 | |
| `/faq` | `FAQPage.jsx` | ✅ 200 | Accordion tested works |
| `/privacy`, `/terms`, `/disclaimer`, `/cookie-policy`, `/refund-policy`, `/accessibility`, `/do-not-sell` | `LegalPage.jsx` | ✅ 200 each | Shared component, content keyed by path |
| `/500` | `ServerError.jsx` | ✅ 200 | Static error page (not triggered by an actual 500 direct nav only) |
| `/404` | `NotFound.jsx` | ✅ 200 | |
| any unmatched path | `NotFound.jsx` (via `*`) | ✅ 200, correct fallback | Verified with `/this-route-does-not-exist` |

## 2. Auth / standalone routes (NOT wrapped in `Layout` no header/footer, by design)

| Route | Page component | Status | Notes |
|---|---|---|---|
| `/login` | `Login.jsx` | ✅ 200 | Calls real `/api/auth/login`; falls back to local demo session only on network/5xx/404 (see audit doc this was patched in a prior session after a production bug) |
| `/signup` | `Signup.jsx` | ✅ 200 | Calls real `/api/auth/signup` |
| `/verify-email` | `VerifyEmail.jsx` | ✅ 200 | Reads `?token=` from URL, calls `/api/auth/verify-email` |
| `/forgot-password` | `ForgotPassword.jsx` | ✅ 200 | Calls `/api/auth/forgot-password` |
| `/reset-password` | `ResetPassword.jsx` | ✅ 200 | Reads `?token=` from URL, calls `/api/auth/reset-password` |
| `/two-factor` | `TwoFactor.jsx` | ✅ 200 | Frontend-only demo **no backend 2FA endpoint exists at all** (flagged in a prior session; still an open item, see Implementation Plan) |
| `/start` | redirects → `/formation-details` | ✅ 200 | Functions correctly. Noted as a minor inconsistency: every other "Get Started" CTA site-wide links directly to `/formation-details`; `/start` is the only indirection (extra redirect hop) |
| `/formation-details` | `Onboarding.jsx` | ✅ 200 | 15-step formation wizard + mock checkout. Fully validated (frontend + backend) in a prior session; end-to-end browser walkthrough re-confirmed in this audit (see below) |

## 3. Dashboard routes (nested under `ProtectedRoute`, requires any authenticated user)

| Route | Page component | Status | Notes |
|---|---|---|---|
| `/dashboard` (index) | `DashboardHome.jsx` | ✅ 200 | Has a dead "Download document" icon-button (P1, see audit doc) |
| `/dashboard/businesses` | `Businesses.jsx` | ✅ 200 | |
| `/dashboard/businesses/:id` | `BusinessDetail.jsx` | ✅ 200 (valid id), redirects to `/dashboard/businesses` (invalid/unknown id) | Correct guard behavior already in code |
| `/dashboard/orders` | `Orders.jsx` | ✅ 200 | |
| `/dashboard/billing` | `Billing.jsx` | ✅ 200 | Has a dead "Manage" button per subscription row (P1) |
| `/dashboard/support` | `Support.jsx` | ✅ 200 | Validated ticket form (local-only, see audit doc) |
| `/dashboard/notifications` | `Notifications.jsx` | ✅ 200 | |
| `/dashboard/settings` | `Settings.jsx` | ✅ 200 | Validated profile form |
| `/dashboard/guide` | `Guide.jsx` | ✅ 200 | |

`DashboardShell.jsx` (the layout wrapper for all of the above) has a dead "Notifications" bell icon-button (P1 a real `/dashboard/notifications` page/route exists but the bell doesn't link to it).

## 4. Admin routes (nested under `ProtectedRoute role="admin"`, requires an authenticated user with `role: "admin"`)

| Route | Page component | Status | Notes |
|---|---|---|---|
| `/admin` (index) | `AdminOverview.jsx` | ✅ 200 | |
| `/admin/leads` | `AdminLeads.jsx` | ✅ 200 | |
| `/admin/applications` | `AdminApplications.jsx` | ✅ 200 | |
| `/admin/customers` | `AdminCustomers.jsx` | ✅ 200 | |
| `/admin/orders` | `AdminOrders.jsx` | ✅ 200 | |
| `/admin/plans` | `AdminPlans.jsx` | ✅ 200 | |
| `/admin/support` | `AdminSupport.jsx` | ✅ 200 | |
| `/admin/content` | `AdminContent.jsx` | ✅ 200 | |
| `/admin/audit-log` | `AdminAuditLog.jsx` | ✅ 200 | |
| `/admin/settings` | `AdminSettings.jsx` | ✅ 200 | |

`AdminShell.jsx` performs its own `user.role !== 'admin'` guard (redirects non-admins to `/dashboard`) in addition to `ProtectedRoute`'s check verified correct, no bypass found.

## 5. Architecture note carried over from prior sessions (still accurate)

Only **Signup, Login, Contact/Leads, ForgotPassword, ResetPassword, VerifyEmail, and the strengthened backend endpoints for Applications/Checkout/Support/Admin** are reachable from a real Flask backend when one is deployed and `VITE_API_URL` is configured. **Dashboard Support tickets, BusinessDetail document upload, and all Admin CRUD pages remain localStorage-only demos** by deliberate scope decision (documented in project memory) their backend counterparts exist and are validated, but are not wired to these pages. This is unchanged by this audit and is called out again in the Implementation Plan as a scoping decision for a future phase, not a defect to silently "fix."

## 6. Inactive/hidden service routes

`src/data/services.js` defines 14 additional services with `isActive: false` (e.g. `/domain`, `/business-coaching`, `/trademark`, `/logo-design`, etc.). Because `App.jsx` registers a dynamic route for **every** key in the `services` object regardless of `isActive`, these routes are technically live and reachable by direct URL, even though correctly hidden from all navigation (header mega-menu, footer, homepage). This is intentional per the code comment ("preserved so any of these can be launched later") not a defect, but noted here for completeness since a URL-guesser could reach a fully-built but unannounced service page.
