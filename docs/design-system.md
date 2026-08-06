# Design System (current state)

_This documents the design system **as it exists today** in `src/styles.css` it is a reference baseline for the cleanup work in `docs/implementation-plan.md`, not a proposal for a new visual design. No colors, fonts, or brand elements described here should change without a separate, explicit redesign request._

## Brand foundation

Per the in-code comment: colors are "drawn from the American Business Formations crest (navy shield, deep crimson stripes)."

### Color tokens (`:root`, `src/styles.css:3-18`)

| Token | Value | Used for |
|---|---|---|
| `--navy` | `#132446` | Primary brand color headings, primary buttons, dark surfaces |
| `--navy-2` | `#0b1730` | Darker navy hover states, deepest surfaces, overlay tint source |
| `--navy-3` | `#1c3866` | Lighter navy accent |
| `--blue` | `#2657d9` | Interactive accent links, active nav states, eyebrow text |
| `--blue-2` | `#5b82e8` | Lighter blue accent |
| `--accent` / `--gold` | `#9c2b34` | Crimson/gold accent (both names point to the same value historical naming, not two different colors) |
| `--accent-2` / `--gold-2` | `#c1444d` | Lighter crimson/gold accent |
| `--cream` | `#f8f5ee` | Warm neutral background (hero sections) |
| `--soft` | `#eef2fb` | Cool neutral background (`.soft-section`, badges) |
| `--line` | `#e5e3db` | Border color |
| `--text` | `#16213f` | Body text color |
| `--muted` | `#616d7e` | Secondary/muted text |
| `--white` | `#fff` | ⚠️ Under-used 114 raw `#fff` literals exist elsewhere in the file that should reference this token instead (see audit P1-6) |
| `--success` | `#0f9d63` | Success states |
| `--warning` | `#b3760f` | Warning states |
| `--danger` | `#c53030` | Error/destructive states |

**Known gap (audit P1-6):** there are no semantic *pair* tokens for status badges/alerts (e.g. `--success-bg`/`--success-text`). The pattern of a tinted background + darker text for success/warning/danger badges repeats 3+ times across the stylesheet with independently hand-picked colors each time (e.g. `#e5f6ec`/`#0c6b45`, `#fbf0dd`/`#7a5a12`, `#fbecec`/`#8f2323`). A future pass should formalize these as tokens rather than leaving them ad hoc.

### Shadow tokens

| Token | Value |
|---|---|
| `--shadow` | `0 22px 60px rgba(15,23,42,.13)` |
| `--shadow-sm` | `0 10px 30px rgba(15,23,42,.07)` |
| `--shadow-md` | `0 12px 32px rgba(15,23,42,.08)` |
| `--shadow-lg` | `0 20px 50px rgba(15,23,42,.11)` |

### Radius tokens

| Token | Value |
|---|---|
| `--radius` | `24px` (default card radius) |
| `--radius-sm` | `14px` |
| `--radius-lg` | `28px` |
| `--radius-pill` | `999px` (buttons, badges) |

### Typography

| Token | Value | Used for |
|---|---|---|
| `--font-heading` | `'Manrope', sans-serif` | All headings (`h1`–`h3` in most components explicitly set this) |
| `--font-body` | `'Inter', sans-serif` | Body text (set once on `body`) |

Base sizing: `html{font-size:16px}`, bumped to `17px` at `≥768px`. Headings generally use `clamp()` for fluid responsive sizing (e.g. hero `h1` at `clamp(3rem,5.5vw,5.35rem)`).

### Motion

| Token | Value |
|---|---|
| `--transition-fast` | `180ms ease` |
| `--transition-normal` | `280ms ease` |
| Scroll-reveal (`.reveal`, `src/components/Reveal.jsx` + `src/hooks/useReveal.js`) | `opacity`/`transform` over `.7s cubic-bezier(.16,1,.3,1)`, staggered via `--reveal-delay` (`delay * 90ms`), IntersectionObserver-driven with a 1200ms unconditional fallback and full respect for `prefers-reduced-motion` |

---

## Spacing

### Declared scale (`--space-*`, `src/styles.css:12-13`)

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96 · 120` px (`--space-1` through `--space-30`, skipping some numbers the token *name* is not a 1:1 index).

### Section-level responsive padding (`--section-pad-y*`)

| Token | Mobile (default) | ≥768px | ≥1025px |
|---|---|---|---|
| `--section-pad-y` | 52px | 72px | 84px |
| `--section-pad-y-lg` | 64px | 88px | 100px |
| `--section-pad-y-sm` | 36px | 48px | 56px |

`.section`, `.section-lg`, `.section-sm` utility classes correctly consume these and should be preferred for any new section-level wrapper.

### ⚠️ Known gap (audit P1-7)

Most **hero/band/page-wrapper** components (`.home-hero`, `.article-hero`, `.page-hero`, `.page-hero-shared`, `.auth-side`, `.auth-form-wrap`, `.onboarding-shell>main`, `.closing-cta`, `.cta-band`, `.site-footer`, `.admin-page`, `.dash-content`, `.home-hero-split`) do **not** use the tokens above and instead hardcode their own one-off padding values. Across the stylesheet, ~24 distinct "section-level" px values are in use (28–90px) with no discernible step pattern. **Do not add new one-off values when touching these components use the nearest existing `--space-*`/`--section-pad-y*` token, or flag for the Phase 5 consolidation in the implementation plan.**

### Grid gaps (card grids)

Most content-card grids use a `24px` gap (`.steps-grid`, `.service-grid`, `.process-grid`, `.review-grid`, `.pricing-grid`); `.values-grid` uses `22px`; `.post-grid` uses `22px`. Close enough to be treated as one informal "card grid gap" convention (~22-24px) even though not tokenized.

**Grid alignment convention (established this session):** any card grid whose cards contain variable-length text content (a short blurb in one card, a much longer paragraph in a sibling card within the same row) **must** set `align-items:start` on the grid container. Without it, CSS Grid's default `stretch` behavior forces every card in a row to match the tallest card's height, producing large dead-space gaps in the shorter cards (this was the root cause of a reported "inconsistent section spacing" bug, fixed on `.steps-grid` and `.values-grid`). Grids that intentionally want equal-height cards regardless of content length (e.g. `.pricing-grid`, which explicitly sets `align-items:stretch` for a uniform pricing-table look) are the deliberate exception keep that distinction explicit with a code comment when adding new grids, so a future contributor doesn't "fix" an intentional stretch.

---

## Layout primitives

| Class | Purpose |
|---|---|
| `.container` | Centered content column, `max-width: 1240px` (`--container`), with responsive side padding (`--container-pad`: 16px → 20px → 28px → 40px) |
| `.narrow` | `.container` variant capped at `780px` for text-heavy centered content |
| `.section` / `.section-lg` / `.section-sm` | Vertical section padding, see Spacing above |
| `.soft-section` | Applies `--soft` background tint |
| `.centered` | `text-align:center` + auto horizontal margins |
| `.light` | White text variant for dark-background sections |

## Buttons (`.btn` + modifiers)

Pill-shaped (`--radius-pill`), `50px` min-height, `0 26px` padding, `600` font-weight. Modifiers: `.btn-primary` (navy fill), `.btn-outline` (navy border/text, fills navy on hover), `.btn-ghost` (transparent), `.btn-gold` (crimson/gold fill), `.btn-block` (full width). Hover state universally lifts `-1px` via `transform`.

## Known duplicate/legacy systems (do not extend see audit P1-5)

The stylesheet currently contains **two parallel implementations** of the homepage hero, apparently from an earlier redesign that was never fully cleaned up:
- An older system: `.hero-copy` / `.hero-grid` / `.home-hero`
- A newer system: `.hero-copy-left` / `.home-hero-split`

`Home.jsx` currently applies **both** class names to the same elements (e.g. `className="hero-copy hero-copy-left"`), so the cascade resolves deterministically to whichever rule appears later in the file but the earlier rule is dead weight that will silently swallow any edit made to it. The same pattern (a rule redefined later in the file with different values, only the later one live) also affects `.price-card`, `.price-card h3`, `.review-grid article>p`, and `.auth-form label`. **Until the Phase 4 cleanup in the implementation plan runs, always check for a second, later definition of a selector before editing it** grep the whole file for the selector name first.

## Component inventory (reusable)

`src/components/` (all confirmed actively used, zero dead components found in the original audit): `Header`, `Footer`, `Logo`, `Layout`, `ChatWidget`, `Breadcrumbs`, `BusinessNameStartForm`, `FAQ`, `PageHero`, `PlatformPreview`, `PricingCards`, `ProtectedRoute`, `Reveal`, `SEO`, `ServiceGrid`, plus `admin/AdminShell` and `dashboard/DashboardShell` (route-level layout shells, one importer each by design).

## UI component library (`src/components/ui/`)

Added to formalize the design system into real, reusable React components each wraps CSS that already existed in `styles.css` (much of it a previously-written-but-never-used "design-system primitives" block at `styles.css:249-281`), so introducing them changed **zero** existing visual output. Import from the barrel: `import { Button, Card, ... } from '../components/ui'`.

| Component | Props | Backing CSS |
|---|---|---|
| `Button` | `to`, `href`, `variant` (primary/outline/ghost/gold/danger), `size` (sm/lg), `block`, `icon` | `.btn` + modifiers |
| `Badge` | `variant` (success/warning/danger/neutral) | `.status-badge` |
| `Alert` | `variant` (info/success/warning/danger), `icon` (override) | `.alert-banner` |
| `Card` | `as`, `hover`, `compact` | New `.card`/`.card-hover`/`.card-compact` (additive, matches `.dash-card`'s visual language + a subtle shadow) |
| `Modal` | `open`, `onClose`, `title` | `.modal-overlay`/`.modal-panel` (previously unused). Real behavior: focus trap, Escape-to-close, click-outside-to-close, focus restoration, rendered via `createPortal` |
| `Drawer` | `open`, `onClose`, `title` | `.drawer-overlay`/`.drawer-panel` (previously unused). Escape/outside-click, portal |
| `Accordion` | `items` (`[title, content]` tuples or `{id,title,content}`), `allowMultiple` | Generalizes `.faq-item`/`.faq-list`/`.faq-answer` (the same CSS `FAQ.jsx` uses) |
| `Tabs` | `tabs` (`{id,label,icon?,content}`) | Generalizes `PlatformPreview.jsx`'s `.platform-preview-tabs` pattern `PlatformPreview` itself is untouched |
| `Table` | passthrough to `<table>` | `.admin-table` + new `.table-scroll` (replaces 6x duplicated inline `style={{overflowX:'auto'}}` in admin pages now migrated) |
| `Tooltip` | `label`, `position` (top/bottom) | New `.tooltip-wrap`/`.tooltip-bubble` genuinely didn't exist before; CSS-only hover/focus-within |
| `EmptyState` | `icon`, `children`, `action` | `.dash-empty` (kept as a `<p>` to preserve its exact existing visual weight) |
| `Skeleton` / `SkeletonText` / `SkeletonCard` | `variant`, `width` | `.skeleton`/`.skeleton-text`/`.skeleton-card` (previously unused) |
| `SectionHeading` | `eyebrow`, `title`, `description`, `centered` | `.section-heading` **page-section scale only**; do not use inside a compact `Card` (the `h2` is sized via `clamp(2.05rem,…,3rem)` and will look oversized hand-write a smaller heading instead, as `ServicePage.jsx`'s pricing card does) |
| `Section` / `Container` | `size` (default/lg/sm), `soft`, `narrow` | `.section`/`.section-lg`/`.section-sm`/`.soft-section`/`.container`/`.narrow` |
| `Input` / `Select` / `Textarea` | `label`, `error`, `hint` | Existing form field styling + `src/lib/formErrors.js`'s `fieldAria()` |
| `Checkbox` | `label`, `error` | `.check-control` |
| `RadioCard` / `RadioCardGroup` | `selected`, `onSelect`, `title`, `description` | `.radio-cards` |

**Adoption so far:** all 6 admin table pages migrated to `Table`. Existing validated forms (Login/Signup/Contact/Onboarding/etc.) were **not** migrated onto the new form primitives they already have correct, tested validation; the primitives exist for new forms only. `CategoryAccordion` (`Home.jsx`, no longer used after the homepage restructure) and `FAQ.jsx` itself were left as-is rather than force-migrated onto `Accordion` not a correctness issue, just not worth the churn on already-working code.

## Shared pricing source (`src/data/pricing.js`)

New module consolidating the add-on prices and government-fee facts that need to appear in more than one place (onboarding checkout **and** a service page), so the two can never drift apart. `Onboarding.jsx` now imports `addOnCatalog` from here instead of defining its own copy. `getServicePricing(slug)` returns what a service page should display; returns `addOn: null` for services bundled into a formation package (`llc-formation`, `formation-kit`) rather than sold standalone those pages link to `/pricing` instead of stating a flat number. Plan-tier pricing (Foundation/Accelerated/Complete) intentionally still lives in `PricingCards.jsx` it wasn't moved, since no service page needed to display it directly.

## Fixed this session: FAQ search box on light backgrounds

`.faq-search` (`FAQ.jsx`'s `searchable` prop) was styled only for the dark variant (`rgba(255,255,255,*)` overlay + white text) but was already being used without `dark` on the standalone `/faq` page rendering as a nearly invisible washed-out box with no visible border. Fixed by making the light style the default and moving the white-on-navy variant under `.faq-dark .faq-search`. If you add a new `searchable` FAQ usage, no special handling is needed now it works on either background automatically.

## Validation UI conventions (established in a prior session keep consistent)

- Error text: `.field-error` class, placed directly below the field.
- Invalid field state: `aria-invalid="true"` + `aria-describedby` pointing at the error message's `id`, plus a CSS rule giving the field a `var(--danger)` border (`input[aria-invalid="true"]`, etc.).
- Form-level error summary: `.form-error-summary` class (red-bordered banner), shown when a multi-field step/form has more than one error.
- Centralized copy/logic lives in `src/validations/*.js` (frontend) and `server/app/validations/*.py` (backend) see project memory for details. Reuse these rather than inventing new inline regex/validation per field.
