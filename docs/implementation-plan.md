# Implementation Plan

_Derived from `docs/current-ui-ux-audit.md` and `docs/route-and-feature-inventory.md`. This plan sequences fixes by risk and dependency, not just severity some P1s are grouped together because they touch the same files, and the CSS cleanup work is deliberately isolated from any future visual redesign so it can be verified independently._

## Guiding constraints for every phase below

- No framework migration. No route/API/backend field/auth/checkout/dashboard removal.
- No changes to prices, state fees, contact details, or legal content.
- No fabricated testimonials, ratings, customer counts, awards, or unsupported claims the current audit found the codebase already clean here; keep it that way.
- Every fix ships with the "testing method" from the audit doc actually run before being marked done, not just implemented.

---

## Phase 0 P0 fixes (this session)

**Status: nothing found to fix.** The audit found zero build/run/route/submit-blocking issues. No action taken in this phase beyond re-confirming the build (`npm run build`) and full route sweep pass, which they do.

---

## Phase 1 Quick, isolated, zero-visual-risk fixes (next)

These are small, mechanical, and independently verifiable good first PR.

1. **P1-4 (partial):** Wire the dashboard header bell (`DashboardShell.jsx:48`) to `navigate('/dashboard/notifications')`. One line, no design change.
2. **P1-8:** Replace the two plain `<a href="/about">` internal links (`Reviews.jsx:26`, `Home.jsx:164`) with `<Link to="/about">`.
3. **P1-9:** Add `VITE_TX_FILING_FEE` to the frontend `.env.example` and `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` to the backend `.env.example`, each with a one-line explanatory comment.
4. **P1-10:** Introduce a single `IS_PRODUCTION` computed value in `server/config.py` and use it for both `get_config()`'s selection logic and `JWT_COOKIE_SECURE`, removing the second independent `os.getenv("FLASK_ENV")` read.
5. **P2-2:** Point the handful of `/start`-linking CTAs directly at `/formation-details` (or standardize the other direction) pick one convention and grep-verify consistency.

**Testing:** existing 162-test vitest suite + backend pytest (where runnable) must still pass; manual click-through of the bell → notifications page; `.env.example` diff review.

---

## Phase 2 Resources page repair (P1-1, P1-2, P1-3)

Grouped together because they're all in `src/pages/Resources.jsx` and share the same underlying data (`posts` array, category list).

1. Implement a real client-side filter over `posts` driven by the existing search input's value (no backend change needed).
2. Convert the "Browse topics" sidebar anchors into the same filter mechanism (click a topic → filter `posts` by category), removing the dead `href="#..."` fragments. Either add a "Growth" post or drop "Growth" from the topic list until one exists.
3. Decide the fate of "Get the checklist": either wire it to the existing `recordLead()`/lead-capture pattern behind a real (even if simple) email-gate, or remove the button/copy until a real asset exists. **This is a product decision, not just a code fix flag for business-owner confirmation** (see "Business-owner confirmation needed" below).

**Testing:** type a query and confirm the list narrows; click each topic and confirm real filtering; automated test added to the existing vitest suite for the search/filter behavior; manual click-through of whatever the checklist button ends up doing.

---

## Phase 3 Dashboard stub controls (P1-4 remainder)

1. Decide scope for "Download document" (`DashboardHome.jsx:31`) and "Manage" (`Billing.jsx:14`): wire to the real backend endpoints that already exist (`/api/documents/*/download`, subscription management) **this re-opens the same dashboard/backend-wiring scope decision documented in project memory from the validation-overhaul session, and should be decided the same way**: either commit to wiring dashboard pages to the real backend (bigger, cross-cutting change affecting several dashboard pages at once, not just these two buttons) or add an honest `disabled` + "Coming soon" state so nothing pretends to work.
2. **Business-owner confirmation needed:** which direction to take on (1) before writing code this materially changes scope (a few hours vs. a multi-page backend-wiring project).

**Testing:** click each control, confirm either real behavior or an honest disabled/"coming soon" affordance never silent no-op.

---

## Phase 4 CSS hygiene cleanup (P1-5, P1-6 partial)

Deliberately isolated from Phase 5 (spacing) and from any future visual redesign, because this phase is a **pure cleanup with zero intended visual change** success is measured by pixel-identical before/after screenshots.

1. Remove the 9 dead/overridden CSS declarations identified in P1-5 (`.hero-copy h1`, `.hero-copy>p`, `.price-card`, `.price-card h3`, `.review-grid article>p`, `.auth-form label`, `.category-row-body`, `.state-row input`), keeping only the rule that currently renders.
2. Replace exact-duplicate raw color values with the existing `var()` equivalents (`#fff` → `var(--white)`, `rgba(197,48,48,.18)` → derived from `var(--danger)`, `rgba(11,23,48,.5)` → derived from `var(--navy-2)`). Skip anything without a safe mechanical substitution.
3. Full-page screenshot diff (mobile/tablet/desktop) of Home, Pricing, Login, Signup before and after must be pixel-identical. If anything shifts, that means the "dead" rule wasn't actually dead and needs manual reconciliation instead of deletion.

**Testing:** automated screenshot diff (Playwright, same technique used in this audit) + full vitest/pytest suite re-run (no functional code touched, but cheap to re-confirm).

---

## Phase 5 Spacing-scale consolidation (P1-7) its own phase, done carefully

This is the one phase in this plan with real (if small) visual-shift risk, so it's scoped on its own with explicit before/after visual sign-off expected, not bundled with Phase 4's zero-risk cleanup.

1. Migrate hardcoded padding on `.home-hero`, `.article-hero`, `.page-hero`, `.page-hero-shared`, `.auth-side`, `.auth-form-wrap`, `.onboarding-shell>main`, `.closing-cta`, `.cta-band`, `.site-footer`, `.admin-page`, `.dash-content`, `.home-hero-split` to the nearest existing `--space-*`/`--section-pad-y*` token, one component at a time.
2. Screenshot every affected page (mobile/tablet/desktop) before and after each component's migration this phase should visibly tighten inconsistent gaps (continuing the direction of the `.steps-grid`/`.values-grid` fix already shipped in a prior session) without being a full redesign.
3. Introduce the semantic status-badge tokens noted in P1-6 (`--success-bg`/`--success-text`/etc.) only if it can be done without visual change; otherwise defer to a future design-system pass.

**Testing:** screenshot diff per component change; manual scroll-through of each affected page to confirm the vertical rhythm reads as more consistent, not just technically token-based.

---

## Phase 6 Content readiness (P2-1)

Not a code task: replace the 6 sample/placeholder blog posts with real, reviewed content before any public marketing push toward `/resources`. Track as a content/business task, not an engineering one.

---

## Explicitly out of scope for this plan (do not start without separate sign-off)

- **Full visual redesign.** The user's instructions were explicit: audit and P0 fixes only in this pass, no redesign yet. Phases 4-5 above are hygiene/consistency fixes within the *existing* design, not a redesign.
- **Wiring the dashboard/admin pages to the real backend wholesale.** This is a legitimate, larger future project (real persisted support tickets, document uploads, admin CRUD against the live database instead of localStorage) but is a deliberate scope decision from a prior session, not a defect do not start it as a side effect of fixing the two stub buttons in Phase 3.
- **Deploying a real backend / fixing the "no backend reachable in production" gap.** Also a prior-session finding (see project memory) an infrastructure/hosting decision for the business owner, not something fixable by further code changes alone.

## Business-owner confirmation needed (compiled from the audit)

1. Resources page "Get the checklist" build a real gated-download flow, or remove the CTA until one exists?
2. Dashboard "Download document" / "Manage" buttons wire to the real backend now, or mark honestly as "coming soon"?
3. Sample blog content timeline for real article content before public launch?
4. Whether/when to deploy the Flask backend for real and reconnect the dashboard/admin pages to it (bigger, cross-cutting decision affecting Phases 3 and beyond).
