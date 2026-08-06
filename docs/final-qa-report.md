# Final QA Report

Date: 2026-07-31
This report covers responsive verification and end-to-end functional QA for the accessibility/SEO/performance hardening phase, plus a consolidated summary across all four project phases to date (audit → public-site redesign → user-journey/onboarding → this hardening pass). Nothing below is reported as passed unless an actual command or Playwright script was run and its output is quoted or summarized accurately.

---

## Responsive testing (320 / 375 / 768 / 1024 / 1280 / 1440 / 1920)

Ran a Playwright sweep across all 7 required breakpoints against home, a service page (`/llc-formation`), `/pricing`, the onboarding wizard (`/formation-details`), and `/faq`, checking `document.documentElement.scrollWidth` vs `clientWidth` for overflow at every combination (35 checks total):

```
[320px] home / service-page / pricing / onboarding / faq -> ok (all 5)
[375px] home / service-page / pricing / onboarding / faq -> ok (all 5)
[768px] home / service-page / pricing / onboarding / faq -> ok (all 5)
[1024px] home / service-page / pricing / onboarding / faq -> ok (all 5)
[1280px] home / service-page / pricing / onboarding / faq -> ok (all 5)
[1440px] home / service-page / pricing / onboarding / faq -> ok (all 5)
[1920px] home / service-page / pricing / onboarding / faq -> ok (all 5)
```
**Zero horizontal overflow at any of the 35 page/breakpoint combinations.**

Additional targeted checks:
- **Mobile drawer** (320/375/768px): opens on toggle-button click, closes on Escape all 6 checks (3 widths × open + close) passed.
- **Dashboard** at 320/768/1440px (authenticated session): no overflow at any width.
- **Chat widget** at 375px: bounding box `{x:301, y:738, width:58, height:58}` bottom-right corner, does not overlap the mobile nav toggle or any other fixed control.
- **FAQ accordion page** at 320px: no overflow (the narrowest, most overflow-prone layout in the app).

This confirms the existing fluid/`clamp()`-based CSS (from the earlier redesign phase) genuinely holds at the exact 7 breakpoints requested, not just the handful of `max-width` media-query steps already in the stylesheet.

---

## Final functional walkthrough

All of the following were run as real Playwright scripts against a live dev server (not asserted from reading code):

| Check | Result |
|---|---|
| Direct navigation to 9 varied routes (incl. an unknown route) | PASS no console errors |
| Refresh mid-route (`/pricing`) still renders real content | PASS |
| Back button returns to previous route | PASS |
| Forward button returns to the route navigated away from | PASS |
| Unknown route renders a real 404 page (not blank/silent) | PASS |
| First `Tab` on any page focuses the skip link | PASS |
| Activating the skip link moves focus to `#main-content` | PASS |
| Contact form renders with its required fields present | PASS |
| Login page loads; submitting an empty form does not throw | PASS |
| Authenticated `/dashboard` route loads | PASS |
| No console/page errors on the dashboard | PASS |
| All 19 unique footer links resolve to real pages (no 404s) | PASS |
| Internal link crawl (24 unique hrefs from 10 seed pages) | PASS 0 broken links |
| Full 15-step onboarding wizard walkthrough → confirmation | PASS (re-run from the prior phase, still passing after this phase's refactors) |
| Session recovery: refresh mid-wizard restores step + form data | PASS |
| Session recovery never persists `password`/`confirmPassword` | PASS |
| Draft clears on successful checkout | PASS |
| Review step shows "Billed today" / "Then renews" / refund-policy link | PASS |
| Prerendered page hydrates correctly; client-side nav still works post-hydration | PASS 0 console errors |
| 42/42 public routes prerender successfully via `npm run postbuild` | PASS |

**Not tested in this environment, and not claimed as tested:**
- Real payment processing (there is no live payment processor connected this is documented, intentional demo behavior from earlier phases, not a gap introduced here).
- The Flask backend (`server/`) this project has no Python runtime available in this development environment; all API calls exercise the existing `withLocalFallback` demo path instead. This is a standing, previously-documented constraint, not new to this phase.
- A live Lighthouse/PageSpeed run no deployed URL exists to point it at.
- `npm ci` (true from-lockfile clean install) hit a Windows-specific `EPERM` file-lock on native `.node`/`.exe` binaries (rollup/esbuild) twice in a row in this sandbox, most likely antivirus real-time scanning interfering with the delete-then-reinstall sequence. This is an environment artifact, not a project defect: `npm install` (incremental) was run successfully multiple times in this same session, and the resulting `node_modules` builds and tests cleanly every time. A real CI environment or a machine without this interference should run `npm ci` without issue.
- `npm run build` itself also intermittently hit the same class of transient Windows `EPERM` lock on `dist/assets` during this QA pass (several consecutive failures, then a clean success with no code changes in between). Confirmed this was purely environmental the final build in this session succeeded cleanly (exit code 0, all 42 routes prerendered) with the exact same source code that had failed moments earlier.

---

## Build & test results

- `npm run build` **succeeds**. Main entry chunk 263.23 KB (84.24 KB gzip) plus ~45 lazy-loaded per-route chunks; CSS 77.65 KB (15.92 KB gzip).
- `npm run postbuild` (the new prerender step, runs automatically after `build`) **succeeds**, 42/42 routes snapshotted, 0 page errors.
- `npx vitest run` **170/170 tests passing**, 15 test files (162 pre-existing from earlier phases + 8 new international-phone-validator tests added last phase; no test file was added or needed to change for this phase's work, since it's UI/SEO/perf, not business logic).
- Lint **no lint script or ESLint config exists in this project** (confirmed by checking `package.json` and searching for `.eslintrc*`/`eslint.config.*`). Not fabricated for this pass; flagged as a real gap in "remaining backend issues" below (it's a tooling gap, not backend, but noted since there's nowhere better for it).
- `npm audit` 7 advisories (3 moderate, 3 high, 1 critical per npm's severity rollup, though the "critical" figure is npm's aggregate label for the dependency chain, not a single critical CVE):
  - **esbuild/vite/vitest** (moderate): dev-server-only advisory (a malicious website could send requests to a *running local dev server* and read the response). Does not affect the production build or deployed site. Fixing requires a breaking `vitest@4.x` upgrade not applied in this pass to avoid destabilizing the test suite outside the scope of this request; recommended as separate, deliberate follow-up work.
  - **react-router 7.12.0–8.2.0** (high): an RSC (React Server Components) Mode CSRF bypass advisory. This app is a plain client-rendered SPA using `BrowserRouter` it does not use RSC mode or server actions at all, so the advisory's actual attack surface does not apply to this codebase's usage. `npm audit fix` (non-breaking) was attempted and made no change, since no non-breaking version resolves it; `npm audit fix --force` would pull in a breaking major version and was not applied without a dedicated migration/testing pass. Documented here rather than silently forced through.

---

## Consolidated final report (all phases)

**1. Confirmed problems found (this phase):** no skip link; missing focus trap/restoration on the header mobile drawer and `Drawer.jsx`; unlabeled ownership-step inputs; sub-44px modal close button; two color tokens failing 4.5:1 contrast at their actual usage sizes, plus one live navy-on-crimson button failing contrast entirely; no loading/status announcements on 6 forms and the global toast; `.spin` CSS never defined (loading spinners never animated); no prerendering (crawlers/social scrapers saw an empty shell); `Resources.jsx` still a non-functional stub; no route-level code splitting (one 499KB bundle); no image dimensioning; fonts render-blocking via `@import`; `logo.webp` is mislabeled (actually PNG bytes); `favicon.png` declared with the wrong MIME type.

**2. Improvements implemented:** see the two "Fixed this phase" sections in `docs/accessibility-seo-report.md` (accessibility: 8 items; SEO: 6 items; performance: 4 items) all verified via build/test/Playwright, not assumed.

**3. Public pages redesigned:** none in this phase (that was phases 1–2); `Resources.jsx` was functionally repaired (search/filter/lead-capture wired up), not visually redesigned.

**4. Forms improved:** Login, Signup, ForgotPassword, ResetPassword, Contact, onboarding Payment/Review steps (loading/status announcements); OwnershipStep (labels); Resources.jsx (new working search/filter/checklist-request form).

**5. Validation rules:** none added or changed this phase (validation was completed in the prior user-journey phase); `Resources.jsx`'s new checklist form reuses the existing `validateEmail` from `src/validations/contactValidation.js`.

**6. Accessibility checks:** skip link, focus trap/restoration (Modal/Drawer/mobile nav), labeled form controls, 44px touch targets, WCAG-contrast-verified color tokens, `aria-live`/`aria-busy` loading announcements, landmark labeling (`aria-label` on dashboard nav regions) all listed with before/after detail in `docs/accessibility-seo-report.md`.

**7. SEO improvements:** custom Playwright prerender step (42 routes), canonical trailing-slash normalization, hardened static `index.html` head, fixed `Resources.jsx` stub, fixed favicon MIME type, verified zero broken internal links.

**8. Performance improvements:** route-level code splitting (499KB → 263KB main chunk), lazy-loaded chat widget, font preconnect, image dimensioning + lazy-loading below the fold.

**9. Routes tested:** 42 public/marketing routes (full prerender + spot-checked content), 9 direct-navigation routes, dashboard (authenticated), 404/unknown route, 24 crawled internal links, 19 footer links, the full 15-step onboarding flow.

**10. Build results:** `npm run build` succeeds; `npm run postbuild` (prerender) succeeds, 42/42 routes, 0 errors.

**11. Test results:** 170/170 unit/integration tests passing (vitest); the responsive sweep, link crawl, hydration check, and functional walkthrough (all Playwright, this session) all passed with the results tabulated above.

**12. Files modified:** see the "Files changed" list in `docs/accessibility-seo-report.md` (27 files).

**13. Files created:** `src/hooks/useFocusTrap.js`, `src/components/RouteFallback.jsx`, `scripts/prerender.mjs`, `docs/accessibility-seo-report.md`, `docs/final-qa-report.md`.

**14. Dependencies added:** `playwright` (devDependency) powers `scripts/prerender.mjs` and every verification script run in this phase; never included in the shipped client bundle.

**15. Existing features preserved:** verified via the full pre-existing 170-test suite passing unmodified, plus re-running the prior phase's onboarding-regression Playwright suite (session recovery, checkout renewal-framing, duplicate-submission guard) with identical results to before this phase's changes. No backend API, route, field name, or business-logic change was made.

**16. Remaining backend issues:** the Flask backend (`server/`) could not be exercised in this environment (no Python runtime available, a standing constraint across all four phases) all frontend behavior against it continues to rely on the existing `withLocalFallback` local-demo path, unchanged by this phase.

**17. Remaining legal-review requirements:** none newly introduced by this phase. `Resources.jsx`'s new "Get the checklist" flow stores an email locally (via the existing `recordLead` lead-tracking helper, same mechanism already used by the homepage and contact forms) and does not send any email or make any delivery promise beyond "your request has been recorded" this phrasing was chosen deliberately to avoid overstating capability; legal should confirm this is acceptable alongside the rest of the site's existing lead-capture disclosures.

**18. Missing authorized content or assets:** `logo.webp` is mislabeled the file is PNG-encoded bytes served under a `.webp` extension (confirmed by reading the file's own PNG header). No image-conversion tool (ImageMagick/cwebp/sharp) was available in this environment to safely re-encode it to true WebP. This should be re-exported as a real WebP (or renamed to `.png` and all ~5 references updated) by whoever holds the source asset, ideally in a session with image tooling available.
