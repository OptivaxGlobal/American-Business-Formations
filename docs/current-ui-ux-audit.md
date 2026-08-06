# Current UI/UX & Technical Audit

**Date:** 2026-07-30
**Scope:** Full repository at `american-business-formations/` `package.json`, lock files, Vite config, routing, API helpers, env vars, auth, forms/validation, checkout, dashboard, styling, reusable components.
**Method:** Static code review + live testing with a real headless Chromium browser (Playwright) against the Vite dev server every route opened directly, console/network errors captured, mobile/tablet/desktop viewports checked for overflow, interactive elements (accordion, mega-menu, mobile nav, chat widget) clicked and verified, and a full 15-step onboarding + mock checkout flow walked end-to-end.

**Bottom line up front:** the application is fundamentally healthy. It builds cleanly, every route resolves and renders without a JavaScript error, there is no horizontal overflow at any tested viewport, no keyboard-inaccessible clickable `<div>`s exist anywhere, and no unverified marketing claims (fake testimonials/ratings/guarantees) were found the codebase is unusually disciplined about caveats. **No P0 (build/run/route/submit-blocking) issues were found in this pass.** The real findings cluster in two places: a handful of decorative/stubbed controls on low-traffic pages (Resources, dashboard icon-buttons), and CSS hygiene debt (duplicate/conflicting rules, an uncontrolled hardcoded-color palette, an inconsistent spacing scale) accumulated from what looks like an earlier homepage/hero redesign that left old rules in place.

---

## P0 Critical (blocks running, building, routing, or submitting)

**None found.**

Specifically verified clear:
- `npm run build` completes with no errors (confirmed again as part of this audit).
- All 47 routes tested (marketing, auth, dashboard, admin, dynamic service/blog slugs, and an intentionally-invalid path) return HTTP 200 and render the correct page title with zero uncaught JS exceptions (`pageerror`) and zero real console errors.
- All forms that call a real backend endpoint (Login, Signup, Contact, Forgot/Reset Password, Verify Email, the Onboarding wizard's mock checkout) submit and validate correctly, confirmed by both the existing 162-test vitest suite and a fresh live-browser walkthrough of the full 15-step formation wizard (business name → contact → address → ownership → registered agent → organizer → effective date → EIN → add-ons → package → account → review → mock payment → confirmation), which completed successfully with the new business appearing correctly in the dashboard afterward.
- No broken internal links: every `<Link>`/`<NavLink>`/`navigate()` destination site-wide resolves to a real registered route (verified exhaustively against `src/App.jsx`, including dynamic service and blog-post slugs).

If a genuine P0 is found in a later phase (e.g. a real backend deployment surfaces a new integration bug), add it here with the same fields as the P1/P2 entries below.

---

## P1 High Priority

### P1-1. Resources page: fake/dead search box
- **Route/component:** `/resources` `src/pages/Resources.jsx:23`
- **Exact problem:** The "Search the resource library" input has no `value`/`onChange` and the adjacent `<button>Search</button>` has no `onClick` and is not inside a `<form>`. Typing in the box and clicking the button do nothing.
- **User impact:** A visitor trying to search articles gets no feedback and no results looks broken, not just "not yet built."
- **Business impact:** Erodes trust in the polish of the product on a page whose whole purpose is to demonstrate helpfulness/expertise.
- **Technical cause:** Placeholder markup shipped without a real search implementation or even a "coming soon" affordance.
- **Proposed fix:** Either wire a real client-side filter over the `posts` array (simple, no backend needed filter by title/category/excerpt as the user types) or remove the input/button entirely until search is implemented, replacing it with a static category filter (which already exists as the sidebar list, see P1-2).
- **Testing method:** Type a query, verify the visible post list narrows; clear the query, verify it resets; automated test: render `Resources`, type into the search input, assert filtered DOM.

### P1-2. Resources page: dead sidebar "Browse topics" links
- **Route/component:** `/resources` `src/pages/Resources.jsx:25`
- **Exact problem:** `{['LLC Basics','Compliance','Taxes','Finance','Branding','Growth'].map(x=><a href={`#${x}`}>{x}</a>)}` renders anchor links like `href="#LLC Basics"` with no matching `id` anywhere on the page. "Growth" additionally has zero matching posts in the `posts` array (no post uses `category:'Growth'`), so even a correct implementation would show an empty result for it.
- **User impact:** Clicking any topic in the sidebar does nothing (or jumps to the top of the page unexpectedly).
- **Business impact:** Same as P1-1 looks broken on a credibility-building content page.
- **Technical cause:** Anchors were added as a visual placeholder without corresponding section IDs or a real filter/route.
- **Proposed fix:** Convert to real category filters (client-side state, same underlying data change as P1-1's fix would enable) or link to `/resources?category=X` with the list filtered by query param. Add a "Growth" post or remove "Growth" from the topic list until one exists.
- **Testing method:** Click each topic link, verify the article list actually filters to that category (or the link is removed if no content exists yet).

### P1-3. Resources page: dead lead-magnet download button
- **Route/component:** `/resources` `src/pages/Resources.jsx:25`
- **Exact problem:** The "Founder launch checklist" card's `<button className="btn btn-primary btn-block">Get the checklist</button>` has no `onClick` and no `href`/download attribute. It is styled identically to every other primary CTA on the site.
- **User impact:** A visitor who wants the checklist gets nothing when they click no download, no email-capture form, no error message.
- **Business impact:** This is a lead-generation control (the surrounding code comment literally calls it "a sample downloadable lead magnet area") presented as fully live, so it's actively losing capturable leads that the UI implies it's collecting.
- **Technical cause:** Placeholder for a future gated-content/email-capture flow that was never wired up.
- **Proposed fix:** Either connect it to the existing `recordLead()`/`/api/leads` pattern already used elsewhere (e.g. gate behind an email field, then serve a real static PDF/checklist), or remove the button and copy until the asset and flow exist.
- **Testing method:** Click the button, verify either a real download starts or a real capture form appears no silent no-op.

### P1-4. Dashboard: three stubbed icon-buttons with no handler
- **Route/component:**
  - `src/components/dashboard/DashboardShell.jsx:48` header notification bell (`aria-label="Notifications"`)
  - `src/pages/dashboard/DashboardHome.jsx:31` per-row "Download document" button
  - `src/pages/dashboard/Billing.jsx:14` per-subscription "Manage" button
- **Exact problem:** All three have an `aria-label` (so screen readers announce a purpose) but no `onClick`, `href`, or `disabled` state. Clicking does nothing.
- **User impact:** A logged-in customer clicking the bell, a document's download icon, or "Manage" on their billing gets no response and no explanation reads as broken, not "coming soon."
- **Business impact:** Customers managing real business filings/documents/billing expect these core account-management actions to work; silent failure here undermines confidence at the exact moment a paying customer needs the dashboard to feel trustworthy.
- **Technical cause:** UI shipped ahead of the underlying feature (notifications page/route exists at `/dashboard/notifications` but isn't linked from the bell; document download and subscription management aren't implemented client-side and the matching backend endpoints `/api/documents/*/download`, subscription cancel/update aren't called from these pages, consistent with the known dashboard/backend disconnection documented in project memory).
- **Proposed fix:** At minimum, wire the bell to navigate to `/dashboard/notifications` (trivial, one line). For document download and "Manage," either wire to the real backend endpoints (larger scope decision, see Implementation Plan) or add a `disabled` state with a tooltip/toast ("Coming soon") so the control honestly communicates its current state instead of silently no-op'ing.
- **Testing method:** Click each control; assert either real navigation/action occurs or a visible "not yet available" affordance appears never nothing.

### P1-5. Duplicate/conflicting CSS rules for the same selector (dead-but-present styles from an apparent earlier redesign)
- **Route/component:** `src/styles.css` (site-wide affects Home hero, Pricing cards, Auth forms)
- **Exact problem:** A brace-aware audit of the stylesheet found 28 selectors defined twice in the same cascade context (not legitimate `@media` responsive overrides), of which 9 have genuinely conflicting property values on the *same* selector meaning the first declaration is silently dead, overridden by the second:
  - `.hero-copy h1` two conflicting rules (different font-size, line-height, letter-spacing, color, margin). `Home.jsx` applies both `hero-copy` and `hero-copy-left` to the same element, so the cascade currently resolves deterministically to the later rule, but the earlier rule is confusing dead weight.
  - `.hero-copy>p`, `.price-card` (padding 28px vs. 0/overflow:hidden), `.price-card h3`, `.review-grid article>p` (min-height 100px vs. 130px), `.auth-form label` (margin-bottom 22px vs. 18px), `.category-row-body`, `.state-row input` same pattern.
- **User impact:** None currently visible (the cascade resolves to a working state today), **but** this is a live trap: a future developer editing the *first* occurrence of any of these selectors (the natural place to look) will see zero effect from their change, costing debugging time and risking an inconsistent fix.
- **Business impact:** Slower, riskier future maintenance; larger CSS bundle than necessary.
- **Technical cause:** Appears to be leftover rules from an earlier hero/pricing/auth redesign that were never removed when the new rules were added later in the file.
- **Proposed fix:** Remove the dead (first, overridden) declaration for each of the 9 conflicting selectors, keeping only the one that currently renders. Do this as a mechanical, visually-verified cleanup (screenshot before/after each affected page) rather than as part of a broader redesign, to avoid accidentally changing the rendered design.
- **Testing method:** Before/after screenshot diff of Home, Pricing, and Login/Signup pages at desktop+mobile after removing each dead rule; confirm pixel-identical render.

### P1-6. Uncontrolled/ad-hoc hardcoded-color palette outside CSS variables
- **Route/component:** `src/styles.css` (site-wide)
- **Exact problem:** 129 distinct hardcoded hex/rgba color values exist outside the `:root` variable block (276 total occurrences). Some duplicate an existing variable's exact value and should just use `var()` (`#fff` appears 114 times and duplicates `--white`; several `rgba(255,255,255,*)` variants duplicate `--white`'s RGB channel with no `--white-rgb` token to reference; `rgba(197,48,48,.18)` duplicates `--danger`; `rgba(11,23,48,.5)` duplicates `--navy-2`). A larger set (~100+ values) are genuine one-off colors for badges/alerts/gradients with no semantic token at all e.g. success/warning/danger badge background+text pairs are hand-coded 3+ separate times instead of using shared `--success-bg`/`--success-text` (etc.) tokens.
- **User impact:** None directly visible today.
- **Business impact:** Any future rebrand or dark-mode/theming effort has to hunt down ~130 scattered color values instead of changing a handful of tokens; increases the chance of an inconsistent accent color creeping in over time.
- **Technical cause:** No enforced convention requiring new colors to route through `:root` variables.
- **Proposed fix:** (a) Replace exact-duplicate raw values with the existing `var()` safe, zero visual risk. (b) Introduce semantic tokens for the repeated status-badge pattern (`--success-bg`, `--success-text`, `--warning-bg`, `--warning-text`, `--danger-bg`, `--danger-text`) and migrate the 3+ duplicated badge implementations to use them. (c) Leave genuinely one-off decorative colors (gradient stops, the onboarding sidebar's illustrative palette) as-is not every color needs a token.
- **Testing method:** Visual regression screenshot diff after each substitution; grep to confirm zero remaining exact-duplicate raw values.

### P1-7. Inconsistent section-level spacing scale
- **Route/component:** `src/styles.css` (site-wide hero/section/band/footer/admin wrapper padding)
- **Exact problem:** `:root` already defines spacing tokens (`--space-1` through `--space-30`, plus `--section-pad-y`/`--section-pad-y-lg`/`--section-pad-y-sm`), and `.section`/`.section-lg`/`.section-sm` correctly consume them but most hero/band/page-wrapper components (`.home-hero`, `.article-hero`, `.page-hero`, `.page-hero-shared`, `.auth-side`, `.auth-form-wrap`, `.onboarding-shell>main`, `.closing-cta`, `.cta-band`, `.site-footer`, `.admin-page`, `.dash-content`, `.home-hero-split`) bypass the tokens and hardcode their own one-off padding values. Across the stylesheet, ~24 distinct "section-level" pixel values (28–90px) are in use with no discernible step pattern.
- **User impact:** Subtle but real this is the direct root cause of the "gaps between sections feel inconsistent" issue reported and partially fixed in a prior session (the `.steps-grid`/`.values-grid` card-stretching bug). The remaining hardcoded values mean vertical rhythm still varies slightly page-to-page in ways a careful visual QA pass would notice.
- **Business impact:** Perceived polish/consistency, especially on a marketing site where design consistency signals trustworthiness.
- **Technical cause:** Same as P1-5/P1-6 components were styled independently over time rather than drawing from the existing token system.
- **Proposed fix:** Migrate the listed wrapper components' padding to the nearest existing `--space-*`/`--section-pad-y*` token (or add 1-2 new tokens only if a genuinely new value is needed), one component at a time with visual verification. This should be scoped as its own follow-up pass (see Implementation Plan) rather than done reactively it's exactly the class of change that risks an unintended visual shift if rushed.
- **Testing method:** Full-page screenshot diff at mobile/tablet/desktop for every affected page before/after each component's migration.

### P1-8. Plain `<a>` tags used for internal navigation instead of `<Link>`
- **Route/component:** `src/pages/Reviews.jsx:26`, `src/pages/Home.jsx:164`
- **Exact problem:** Both use `<a href="/about">how we work</a>` instead of React Router's `<Link to="/about">`.
- **User impact:** Clicking these links forces a full browser page reload instead of instant client-side navigation a jarring, slower transition inconsistent with the rest of the site.
- **Business impact:** Minor perceived performance/polish regression on an otherwise fast SPA.
- **Technical cause:** Likely copy-pasted from static HTML rather than authored with `Link`.
- **Proposed fix:** Replace both with `<Link to="/about">`.
- **Testing method:** Click the link, confirm no full-page reload occurs (network tab shows no full document request, only client-side route change).

### P1-9. Undocumented environment variables
- **Route/component:** `american-business-formations/.env.example`, `server/.env.example`
- **Exact problem:** `VITE_TX_FILING_FEE` (used in `src/config/texas.js:29`) is not listed in the frontend `.env.example`. `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` (used in `server/seed.py`) are not listed in the backend `.env.example`.
- **User impact:** None directly (both have safe fallbacks or are dev-only tooling).
- **Business impact:** A future deployer following `.env.example` alone won't know these overrides/requirements exist `SEED_ADMIN_PASSWORD` in particular is required for the seed script to create an admin account at all, and its absence is silent (the script just skips admin creation with no error).
- **Technical cause:** `.env.example` wasn't updated when these variables were introduced.
- **Proposed fix:** Add both to their respective `.env.example` files with a one-line comment explaining each.
- **Testing method:** Diff `grep` output of all `os.getenv`/`import.meta.env.VITE_*` usages against both `.env.example` files; confirm zero gaps.

### P1-10. `JWT_COOKIE_SECURE` reads `FLASK_ENV` through a different path than the rest of the config
- **Route/component:** `server/config.py:13`
- **Exact problem:** `JWT_COOKIE_SECURE = os.getenv("FLASK_ENV") == "production"` reads the raw env var directly, while `get_config()` (used everywhere else to select the config class) defaults a missing `FLASK_ENV` to `"development"`. The two reads can't currently disagree in a way that breaks anything (both are `False`/dev-like when unset), but they're two independent sources of truth for the same underlying setting.
- **User impact:** None today.
- **Business impact:** If a future production deploy sets `FLASK_ENV` inconsistently (e.g. via one mechanism that `get_config()` sees but the raw `os.getenv` call doesn't, or vice versa e.g. a platform that injects config differently), `JWT_COOKIE_SECURE` could end up `False` in production, meaning the auth cookie is sent over plain HTTP a real security regression risk, even if not currently triggered.
- **Technical cause:** Two independent reads of the same env var instead of one canonical source.
- **Proposed fix:** Compute `IS_PRODUCTION` once (e.g. in `get_config()` or as a module-level constant) and reference it in both places.
- **Testing method:** Unit test asserting `JWT_COOKIE_SECURE` is `True` whenever `ProductionConfig` is selected, regardless of how `FLASK_ENV` was supplied.

---

## P2 Improvements

### P2-1. Sample/placeholder blog content live on public routes
- **Route/component:** `/resources/:slug` `src/pages/BlogPost.jsx`, `src/pages/Resources.jsx` `posts` array
- **Exact problem:** All 6 blog posts are self-labeled sample content ("This sample article demonstrates the long-form content layout included in the project").
- **User impact:** A visitor reading an article for real guidance gets filler text instead.
- **Business impact:** Low urgency (honestly labeled, not a false claim) but should be replaced with real content before public launch/marketing push.
- **Proposed fix:** Replace with real, reviewed articles before go-live; not a code change.
- **Testing method:** Content review sign-off, not a technical test.

### P2-2. `/start` redirect adds an unnecessary hop
- **Route/component:** `src/App.jsx` (`<Route path="start" element={<Navigate to="/formation-details" replace/>}/>`)
- **Exact problem:** Only a few CTAs use `/start`; the rest link directly to `/formation-details`.
- **User impact:** Negligible (one extra client-side redirect, imperceptible).
- **Business impact:** Code-consistency nit.
- **Proposed fix:** Point the few remaining `/start` references directly to `/formation-details` and consider removing the redirect route, or standardize everything on `/start` pick one convention.
- **Testing method:** Grep for `/start` references, confirm consistency after the change.

### P2-3. Inline `style={{...}}` duplicating what could be a shared utility class
- **Route/component:** 6 admin pages use an identical `style={{overflowX:'auto'}}` on a table wrapper (`AdminSupport.jsx`, `AdminOrders.jsx`, `AdminLeads.jsx`, `AdminCustomers.jsx`, `AdminAuditLog.jsx`, `AdminApplications.jsx`); a handful of other one-off inline styles duplicate patterns across `About.jsx`/`Help.jsx`/`HowItWorks.jsx` (`textAlign:'center'`), `Reviews.jsx`/`Home.jsx`/`ServicePage.jsx` (`margin:0`), `HowItWorks.jsx`/`Help.jsx` (identical `gridTemplateColumns` override).
- **User impact:** None.
- **Business impact:** Minor maintainability debt 18 of ~71 JSX files use some inline styling (~39 occurrences total).
- **Proposed fix:** Add a `.table-scroll{overflow-x:auto}` utility class for the 6-file duplicate; leave the rest as low-priority cleanup.
- **Testing method:** Visual diff after substitution.

### P2-4. Inactive service routes are reachable by direct URL
- **Route/component:** 14 services with `isActive:false` in `src/data/services.js` (e.g. `/domain`, `/trademark`, `/business-coaching`)
- **Exact problem:** Correctly hidden from all navigation, but the dynamic route generator in `App.jsx` registers a route for every key regardless of `isActive`, so a guessed/shared URL still renders the full (unfinished/unlaunched) service page.
- **User impact:** Low no evidence anyone would guess these URLs, but a search engine or a stray external link could surface one.
- **Business impact:** Minor could expose not-yet-ready service pages before they're intentionally launched.
- **Proposed fix:** Either only register routes for `isActive` services (breaking the "launch by flipping a flag" convenience noted in the code comment) or add a lightweight `isActive` guard in `ServicePage.jsx` that renders `NotFound` for inactive slugs until intentionally launched. The latter preserves the existing content-authoring convenience.
- **Testing method:** Navigate directly to `/domain` (or another inactive slug) before/after the fix; confirm it 404s until `isActive` is flipped.

### P2-5. `ERR_INSUFFICIENT_RESOURCES` console noise during rapid automated navigation (dev server only verified NOT a real bug)
- **Route/component:** N/A Vite dev server behavior only
- **Exact problem:** Running many sequential full-page navigations in a single automated browser session against `vite dev` (which serves unbundled ES modules) can trip Chrome's per-origin connection limit, surfacing `net::ERR_INSUFFICIENT_RESOURCES` in the console for a handful of module requests.
- **User impact:** None confirmed by re-testing the same routes in isolated fresh browser sessions, which produced zero errors. This does not occur in normal human browsing (one navigation at a time) and cannot occur in production (the build is bundled, not served as individual modules).
- **Business impact:** None.
- **Proposed fix:** No fix needed. Documented here only so this artifact isn't mistaken for a real defect in a future audit re-run.
- **Testing method:** Already re-verified in isolation; no further action needed.

---

## Files reviewed for this audit

`package.json`, `package-lock.json`, `vite.config.js`, `vitest.config.js`, `src/App.jsx`, `src/main.jsx`, `src/lib/api.js`, `.env.example` (both), `server/config.py`, `server/run.py`, `server/seed.py`, `src/styles.css` (full 421-line file), `src/context/{AppContext,BusinessContext,OrdersContext}.jsx`, every file under `src/pages/**` and `src/components/**` (including `admin/` and `dashboard/` subfolders), `src/data/{services,testimonials,adminDemoData,seo}.js`, `server/app/templates/emails/*.html`, plus live browser testing of all 47 routes across 3 viewports.
