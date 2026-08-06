# Accessibility, SEO & Performance Hardening Report

Date: 2026-07-31
Scope: WCAG 2.2 AA accessibility pass, SEO/routing audit, Core Web Vitals optimization, and 7-breakpoint responsive verification, on top of the three prior phases (full audit, public-site redesign, user-journey/onboarding improvements). Nothing from those phases was undone.

Every finding below was verified by reading the actual source before being called a problem, and every fix was verified by an actual `npm run build` / `npx vitest run` / Playwright script run not assumed. Where something could not be verified in this environment (a live Lighthouse run, the Flask backend), that is stated explicitly rather than claimed.

---

## 1. Accessibility

### Confirmed already correct (not touched)
- Landmarks: `Layout.jsx` renders real `<header>`/`<nav>`/`<main>`/`<footer>`; dashboard/admin/onboarding shells each have their own `<main>` (never nested inside another `<main>`).
- One `<h1>` per page, correct heading order (verified across Home, ServicePage, dashboard, onboarding steps).
- Global `:focus-visible` outline already in place; no `outline:none` removed without replacement.
- `Modal.jsx` already had a correct focus trap, Escape-close, and focus restoration.
- `Accordion.jsx`/`Tabs.jsx` already used real `<button>` triggers with `aria-expanded`/`aria-controls`/`role="tablist"`.
- All `<img>` tags already had alt text; decorative images already used `alt=""`.
- `prefers-reduced-motion` already respected in `styles.css` and `useReveal.js`.

### Fixed this phase
1. **Skip-to-content link** added to `Layout.jsx` (public pages), `DashboardShell.jsx`, `AdminShell.jsx`, and `OnboardingShellChrome.jsx`. Each links to a `tabIndex={-1}` `<main>` so keyboard/screen-reader users can jump past the header/sidebar. Verified via Playwright: first `Tab` on any page focuses the skip link, and activating it moves focus to `#main-content`.
2. **Focus trap + restoration** were missing from the header's mobile nav drawer and the `Drawer.jsx` UI component (only `Modal.jsx` had this). Extracted a shared `src/hooks/useFocusTrap.js` (Escape-close, Tab-cycling, focus restoration to the previously-focused element, optional body-scroll lock) from `Modal.jsx`'s existing correct implementation, and wired it into `Header.jsx`'s mobile nav, `Drawer.jsx`, and `Modal.jsx` itself (so there's one implementation, not three). The mobile toggle button only renders/is clickable under the 900px breakpoint, so trapping focus while `open===true` cannot affect desktop keyboard users.
3. **`OwnershipStep.jsx`** the per-owner name/percentage inputs had only a `placeholder`, no `<label>`. Added visually-hidden (`.sr-only`) `<label htmlFor>` pairs, matching the pattern used by every other field in the wizard.
4. **`.modal-close` touch target** rendered under 44×44px despite housing a 20px icon. Fixed with explicit `min-width/min-height:44px` in `styles.css`.
5. **Color contrast** computed actual WCAG contrast ratios (not estimated) for every text/background color pair in `styles.css`. Two tokens genuinely failed 4.5:1 at the sizes they're used at:
   - `--success` (`#0f9d63`, used for the ownership-total "100%" text and status/admin badges at ~11–14px bold) measured 3.11–3.49:1 against its real backgrounds. Darkened to `#0a6e45` (5.62–7.03:1, comfortably passing).
   - `--warning` (`#b3760f`, used in status badges) measured 3.37:1. Darkened to `#8f5e0c` (4.93–5.56:1).
   - Also fixed `.resource-search button` (search-button text was navy-on-crimson, 2.05:1 a real failure) to white-on-crimson (7.48:1).
   - `--blue-2` and the dead `.btn-gold`/`.cta-band .btn-primary` rules were checked and found to be either non-text (icon-only, which only needs 3:1 and already passes) or unused CSS with no live page reference left as-is; documented for a future cleanup pass rather than silently deleted.
6. **Loading/status announcements** the global toast (`AppContext.jsx`) had no `role`/`aria-live`; added `role="status" aria-live="polite"` (`role="alert" aria-live="assertive"` for error toasts). Six submit buttons across Login, Signup, ForgotPassword, ResetPassword, Contact, and the onboarding payment step changed their loading-state text without any announcement mechanism; added `aria-busy` on the button and `aria-live="polite"` on the text span. `ForgotPassword.jsx`'s post-submit "Reset link sent" confirmation view got `role="status"`.
7. **Discovered while fixing loading states**: `Loader2` spinner icons (`className="spin"`) used throughout the app had no matching CSS `.spin` was never defined, so none of these loading spinners actually spun. Added the missing `@keyframes spin` + `.spin` rule (automatically neutralized under `prefers-reduced-motion`, which the codebase already handles globally).
8. Added `aria-label="Primary"`/`aria-label="Account"` to the dashboard's two `<nav>` landmarks so screen readers can distinguish them (native HTML solution, no extra ARIA complexity).

No ARIA was added anywhere a native HTML element or attribute already solved the problem (labels, real `<button>`s, `<nav aria-label>`, native `disabled`).

---

## 2. SEO & Routing

### Confirmed already correct (not touched)
- `SEO.jsx` was already comprehensive: title, description, canonical, full Open Graph, Twitter card, `robots` meta used consistently on all 22 public pages.
- JSON-LD schema (Organization, Service, FAQPage, BreadcrumbList, Article) was already implemented via `src/data/seo.js` and wired into Home/ServicePage/FAQPage/BlogPost.
- A real `NotFound.jsx` component (not a redirect) sits behind the wildcard route and correctly sets `noindex`.
- `robots.txt` and `sitemap.xml` already existed and were already correct and consistent with each other.
- Internal navigation already used `<Link>` exclusively (no stray `<a href>` for internal routes, aside from the dead topic-filter anchors fixed below).

### Fixed this phase
1. **No prerendering existed** this is a pure client-rendered SPA, so a non-JS crawler or social-share scraper only ever saw the static shell (generic title, empty `#root`). Per the approved plan, built a **custom Playwright-based postbuild prerender step** (`scripts/prerender.mjs`, wired as `npm run postbuild`, which npm runs automatically after `npm run build`) rather than react-snap (unmaintained, separate puppeteer chain) or a framework migration:
   - Starts a minimal static file server over `dist/`.
   - Visits all 42 public/marketing routes (home, all 19 service pages, pricing, how-it-works, about, reviews, resources, all 6 blog posts, contact, help, faq, all 7 legal pages) with Playwright.
   - Waits for `SEO.jsx`'s real per-page `og:title` tag to appear (confirming the page's own metadata effect has run, not the static default) and for the reveal-animation fallback timer to clear, then captures `page.content()` and writes it to `dist/<route>/index.html`.
   - **Intentionally does not prerender** `/dashboard`, `/formation-details`, `/admin`, or any auth route those are behind login and already `Disallow`'d in `robots.txt`, so there is nothing for a crawler to index there.
   - Verified: ran the full `npm run build && npm run postbuild` all 42 routes wrote successfully with zero page errors. Spot-checked `dist/pricing/index.html`: real title (`Plans & Pricing | American Business Formations`), real `og:title`, real rendered `<h1>`, 4 JSON-LD blocks on the LLC-formation page. Separately verified React still hydrates correctly onto the prerendered markup and client-side navigation still works (clicked from a prerendered page to another route via Playwright, confirmed URL and content updated without a full reload, zero console errors).
   - Playwright is added as a `devDependency` only it never ships to the client bundle.
2. **Canonical URL trailing-slash normalization** `SEO.jsx`'s canonical builder now strips a trailing slash (except for the root), so a page passing `/foo/` or `/foo` always produces the same canonical URL.
3. **`Resources.jsx` was a stub** (flagged P1 in the very first audit, still open): topic filters were dead `#`-anchors, the search input did nothing, and "Get the checklist" had no handler. Rebuilt with real client-side filtering (topic buttons + search, combined, with an empty-state "clear filters" action) and a real lead-capture form for the checklist button reusing the existing `recordLead()` helper (`src/lib/leads.js`) already used by the homepage business-name form and the contact form, so it shows up in the real Admin → Leads screen instead of silently doing nothing. The confirmation copy is deliberately honest ("your request has been recorded") rather than claiming an email was sent, since none is.
4. **`index.html`'s static `<head>`** hardened with a full default Open Graph/Twitter block and canonical link matching the homepage, as defense-in-depth for the instant before the JS-driven `SEO.jsx` effect (or the prerendered file, once deployed) takes over.
5. **`favicon.png` was declared with the wrong MIME type** (`type="image/svg+xml"` on a `.png` file) fixed to `type="image/png"`.
6. **Internal link crawl** Playwright script crawled every `<a href>` reachable from the 10 main entry pages (24 unique internal hrefs discovered), navigated to each, and confirmed none resolved to a 404. Zero broken links found.

### Not fixed / left as-is (with reason)
- `logo.webp` is actually PNG-encoded bytes served under a `.webp` filename (confirmed via the file's own IHDR header, 1500×486px). This is a real mislabeling bug, but fixing it correctly (re-encoding to true WebP) requires an image-conversion tool not available in this environment (no ImageMagick/cwebp/sharp installed, and installing `sharp` just for a one-time 28KB logo conversion was judged not worth the added native-dependency weight). **Flagged for a follow-up session with image tooling available**, or for the file to be re-exported as a true WebP by whoever has the source asset.

---

## 3. Performance

### Confirmed already fine (not touched)
- The homepage hero has no image/video at all (`PlatformPreview.jsx` is a pure DOM/CSS mock UI) there was no LCP-image problem to fix, and nothing above the fold was lazy-loaded.
- All existing image assets were already tiny (SVG/PNG, ~97KB total site-wide) no legacy unoptimized photography anywhere.
- Reveal-animation CLS safety already correct (`opacity`/`transform` only, no reflow).

### Fixed this phase
1. **Route-level code splitting** every page in `src/App.jsx` (45 route entries) was statically imported into one bundle. Converted every one to `React.lazy(() => import(...))`, wrapped `<Routes>` in a single `<Suspense fallback={<RouteFallback/>}>` (a small centered spinner sized to `main{min-height:60vh}` so swapping in the real page never shifts layout). Also lazy-loaded `ChatWidget` (only needed after a user clicks it) via its own `Suspense` boundary in `Layout.jsx`.
   - **Before:** one JS chunk, 499.41 KB / 142.05 KB gzip (measured at the start of this phase, before any of today's other edits).
   - **After:** main entry chunk 263.23 KB / 84.24 KB gzip, plus ~45 small per-route chunks (2–46 KB each) loaded on demand. A homepage visitor no longer downloads the admin portal, the dashboard, or the 15-step onboarding wizard's code.
2. **Fonts** Google Fonts were loaded via `@import` inside `styles.css`, which is render-blocking and adds a discovery round-trip (the browser must fetch and parse the CSS before it even learns about the font request). Moved to `<link rel="preconnect">` (fonts.googleapis.com + fonts.gstatic.com) plus a direct `<link rel="stylesheet">` in `index.html`'s `<head>` (URL already carries `display=swap`).
3. **Image dimensioning** none of the ~13 `<img>` tags had explicit `width`/`height`, a latent CLS risk. Added real intrinsic dimensions (read from each SVG's own `viewBox` / the logo PNG's IHDR header) to every occurrence: the logo (4 locations), the 5 illustration SVGs used across About/auth pages/Pricing/ServicePage (dimensions vary per file: 720×560, 760×520, 640×500, 620×500). Added `loading="lazy"` to the below-the-fold illustration instances (About.jsx's second image, Pricing.jsx's compliance illustration); left every above-the-fold illustration (auth-page hero panels, ServicePage's hero visual) eager, per the explicit instruction not to lazy-load primary above-the-fold content.
4. Re-ran `npm run build` after every change; final numbers above are from the actual last build, not estimated.

### Explicitly not measured
LCP/INP/CLS thresholds (2.5s / 200ms / 0.1) were **not measured with a live Lighthouse run** there is no deployed URL in this environment to point Lighthouse at, and running a Chrome DevTools Lighthouse audit against a local dev server produces numbers that don't reflect real network conditions. The changes above (bundle-size reduction, image dimensioning, font-loading fix, no heavy above-fold media) are all changes with well-established, direct positive impact on these metrics, but the actual numeric scores should be measured once this is deployed.

---

## Files changed (accessibility/SEO/performance)
- New: `src/hooks/useFocusTrap.js`, `src/components/RouteFallback.jsx`, `scripts/prerender.mjs`
- Edited: `src/components/Layout.jsx`, `src/components/Header.jsx`, `src/components/ui/Modal.jsx`, `src/components/ui/Drawer.jsx`, `src/pages/onboarding/steps/OwnershipStep.jsx`, `src/pages/onboarding/OnboardingShellChrome.jsx`, `src/components/dashboard/DashboardShell.jsx`, `src/components/admin/AdminShell.jsx`, `src/context/AppContext.jsx`, `src/pages/Login.jsx`, `src/pages/Signup.jsx`, `src/pages/ForgotPassword.jsx`, `src/pages/ResetPassword.jsx`, `src/pages/Contact.jsx`, `src/pages/Resources.jsx`, `src/pages/ServicePage.jsx`, `src/pages/About.jsx`, `src/pages/VerifyEmail.jsx`, `src/pages/TwoFactor.jsx`, `src/pages/Pricing.jsx`, `src/pages/Login.jsx`, `src/components/Logo.jsx`, `src/components/SEO.jsx`, `src/App.jsx`, `src/styles.css`, `index.html`, `package.json`
- Dependency added: `playwright` (devDependency only) used by `scripts/prerender.mjs` and by every Playwright verification script run during this phase; not shipped to the client bundle.
