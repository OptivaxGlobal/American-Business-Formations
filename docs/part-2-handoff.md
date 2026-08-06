# Part 2 Handoff: Real Onboarding Backend, Server-Side Pricing, Payment-Disabled Mode

Scope: connect the 15-step formation onboarding wizard to the real Flask backend, make the backend the source of truth for applications/orders/prices, and implement the temporary payment-disabled workflow. Dashboard/admin data display (`BusinessContext`/`OrdersContext`-driven pages) and actually enabling Stripe were explicitly **not** touched see "Known limitations for Part 3" below.

## What was actually broken before this pass

`useOnboardingWizard.js` called `api.submitOnboarding()`, which posted to `/api/onboarding` **a route that has never existed** in the Flask backend (confirmed by listing every registered blueprint). Before Part 1, the 404 was silently swallowed by `withLocalFallback`'s always-succeed fallback. Since Part 1 made demo mode default off, every real onboarding submission was ending in a visible error. Separately, `/api/checkout/session` accepted `items: [{type, name, price_cents}]` straight from the request body a client could set its own price. Both are fixed here.

## Files changed

**Backend**: `server/app/models/commerce.py`, `server/app/api/checkout.py` (rewritten), `server/app/api/applications.py` (submit status guard, organizer address + upsert fix), `server/app/services/email.py` (no code change `order_awaiting_payment` template key already existed), `server/seed.py` (corrected catalog), new templates `order_awaiting_payment.html`/`admin_order_notification.html`, new `docs/stripe-activation.md`.

**Frontend**: `src/lib/api.js`, `src/pages/onboarding/useOnboardingWizard.js` (full rewrite), `src/pages/onboarding/OnboardingShellChrome.jsx`, `src/pages/onboarding/steps/{BusinessAddressStep,RegisteredAgentStep,OrganizerStep,PaymentStep,ReviewStep,ConfirmationStep}.jsx`, `src/validations/paymentValidation.js`, `src/styles.css` (removed dead `.mock-payment-form` rule).

**Tests**: `server/tests/test_checkout.py` (new), `server/tests/test_applications.py` (additions), `src/pages/Onboarding.test.jsx` (rewritten), `src/validations/paymentValidation.test.js` (trimmed to match).

## 1. Onboarding integration completed

- `src/lib/api.js` gained real endpoints: `saveApplication`, `getApplication`, `submitApplication` (→ `POST/GET /api/applications*`), `createCheckoutSession`, `getOrder` (→ `/api/checkout/session`, `/api/orders/:id`), and `getPackages`/`getAddOns`/`getTexasConfig` (catalog routes, not yet consumed see limitations). `submitOnboarding`/`submitBoarding` (dead routes) are gone.
- `useOnboardingWizard.js`'s `buildApplicationPayload(form, businessId)` maps every camelCase form field to the exact snake_case shape `applications.py` expects (`business_name`, `principal_line1/city/zip`, `registered_office_line1/city/zip`, `organizer_line1/city/zip`, `owners: [{name, percentage}]`, etc.).
- The server-issued `business.id` from the first successful save is tracked in wizard state (`businessId`) and threaded through every subsequent autosave and the final submit a retry or refresh never creates a second `Business` row (also covered by a new backend test).
- Autosave: sessionStorage-only (no backend calls) until the visitor is authenticated matching the plan's explicit allowance for non-sensitive draft values in the browser. Once `user` is present, a debounced effect also calls `saveApplication` and exposes `saveStatus: 'idle' | 'saving' | 'saved' | 'failed'`, surfaced in the wizard sidebar ("Saving…" / "Saved" / "Save failed will retry") instead of a blanket "answers save automatically" claim.
- Registered-agent consent and ownership-percentage validation already existed correctly on the backend; nothing needed fixing there beyond the address-field mismatch below.
- **Address fields were single free-text blobs on the frontend** but the backend validates `line1`/`city`/`zip` separately. Confirmed with you: split `BusinessAddressStep.jsx`, `RegisteredAgentStep.jsx`, and `OrganizerStep.jsx` into real Street/City/ZIP inputs. This also wired up `validateCity`/`validateZip` (already written in `src/validations/addressValidation.js`, previously unused).
- **Bonus fix while in that code**: `applications.py`'s organizer-address data was silently dropped (never persisted) and the Organizer row itself was re-inserted on every autosave (no upsert, unlike the registered-agent block right above it) both fixed to match the registered-agent pattern.
- Idempotency: one `idempotency_key` (`crypto.randomUUID()`) is generated per wizard session and reused on retry, so a dropped connection or double-click can never create two orders.

## 2. Server-side pricing implementation

`POST /api/checkout/session` no longer accepts any price from the client. New contract:
```json
{ "business_id": "...", "package_id": "Accelerated", "add_on_ids": ["registered-agent"], "idempotency_key": "..." }
```
The backend loads the `Package` by name and each `AddOn` by slug (rejecting unknown or `active=False` rows with a 422 naming the bad ones), pulls the Texas filing fee from `get_texas_config()`, and computes `service_fee_cents`/`state_fee_cents`/`add_on_fee_cents`/`total_cents` entirely from those rows. `server/tests/test_checkout.py` proves this directly: a request that also sends `price_cents: 1` / `total_cents: 1` gets back the real catalog price, not the tampered one. A repeated `idempotency_key` returns the same order (200) rather than erroring or creating a duplicate.

**Catalog reconciliation**: `server/seed.py`'s `Package`/`AddOn` rows were stale (old prices, missing slugs like `business-formation-filing`/`s-corp-election`/`apostille`/etc. from earlier pricing work). Corrected to match `src/components/PricingCards.jsx` and `src/data/pricing.js` exactly. **This only affects a fresh seed** `seed.py` only inserts when the table is empty, so if you already ran it against a local `server/data/dev.db`, delete that file and re-run `SEED_ADMIN_PASSWORD=... python seed.py` to pick up the corrected prices.

## 3. Temporary payment-disabled mode

`PAYMENTS_ENABLED` was already a derived, configuration-driven flag (`bool(STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET)` in `config.py`) no new env var was needed. When `create_checkout_session(...)` raises `PaymentsNotConfigured` (the case today, no Stripe keys set):
- Order status → `awaiting_payment` (added to `ORDER_STATUSES`), a `Payment(provider="none", status="not_collected")` row is created (added to `PAYMENT_STATUSES`), and a `StatusHistory` entry logs the transition.
- Admin email (`admin_order_notification`) and customer email (`order_awaiting_payment`) are sent via the existing `send_email()` which already logs `EmailLog(status="skipped_no_smtp")` and continues without error when SMTP isn't configured, never claiming an email was sent when it wasn't.
- Response is `202` with `checkout_url: null` and the exact required message: *"Your formation order has been received. Online payment is temporarily unavailable. Our team will contact you with the secure payment and next-step details."*
- The order is immediately visible to admins via the existing `GET /api/admin/orders` (no change needed it already lists every order regardless of status).
- The frontend's final step (`PaymentStep.jsx`, relabeled "Submit order" in the sidebar) has **zero input fields** no card number, CVC, expiry, or billing address anywhere. The submit button reads "Submit Order Payment Arranged Separately." `ConfirmationStep.jsx` now fetches the real order from `GET /api/orders/:id` and shows its actual status (mapped `awaiting_payment` → "Awaiting payment", never "Paid") and server-calculated totals.
- **Confirmation survives a refresh**: submission navigates to `/formation-details?order=<id>`; the wizard reads that query param on mount (independent of any in-memory state) and re-fetches the order every time, including on a hard refresh.

## 4. Removed mock-payment behavior

- All card-field state, handlers, and validators are gone: `payment`/`paymentErrors`/`handlePaymentChange`/`markPaymentTouched`/`computePaymentErrors` from `useOnboardingWizard.js`; `validateCardName`/`validateCardNumber`(+Luhn helper)/`validateCardExpiry`/`validateCardCvc` from `src/validations/paymentValidation.js`; the `.mock-payment-form` CSS rule.
- `useOrders().checkout()` (the local fabricate-a-paid-order function) and `useBusiness().addBusiness()` are no longer called from the onboarding submission path at all.
- Verified via grep: no `card number`/`cvc`/`expiry`/`cardName` reference remains anywhere in `src/` except the new tests asserting their absence.

## 5. Future Stripe activation

See `docs/stripe-activation.md` for required env vars, the webhook URL/events, test-mode and live-mode steps, and rollback. Key point: **no frontend changes are needed** to turn payments on `checkout.py` already branches on `checkout_url` being present vs. `null`, and that branch is driven purely by whether `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` are set.

## 6. Test/build results

**Frontend (actually run in this environment):**
- `npx vitest run` → **177/177 passed** (18 files), including the 3 new/rewritten onboarding tests: full submission through to a server-confirmed `awaiting_payment` confirmation with no card fields anywhere, a failed submission that keeps the draft and shows a real error without confirming, and a direct-URL-with-`?order=` load proving the confirmation survives a refresh.
- `npm run build` → succeeded, 52 routes prerendered, zero errors.

**Backend (cannot execute no Python interpreter in this environment, same constraint as Part 1):**
- New `server/tests/test_checkout.py`: unauthenticated rejection, unknown/inactive package, unknown/inactive add-on, unauthorized `business_id`, client-supplied price ignored (asserts the real catalog price wins), totals computed from catalog + Texas config, `awaiting_payment`/`not_collected` outcome when payments aren't configured, idempotency-key replay returns the same order.
- `server/tests/test_applications.py` additions: repeated autosave with the same `business_id` never creates a second business; submitting an already-submitted application returns 409.
- **Exact command to run these**: `cd server && pip install -r requirements.txt && pytest`. Written against the existing `conftest.py` fixtures and passing-test patterns, but not executed by me please run and report back.

## Known limitations / follow-ups for Part 3

1. **Dashboard pages don't reflect real orders/applications yet.** `Businesses.jsx`, `BusinessDetail.jsx`, `Orders.jsx`, `Billing.jsx`, and the admin dashboard still read `BusinessContext`/`OrdersContext` localStorage for display. Every detailed Part 2 instruction was scoped to onboarding→checkout→confirmation specifically; wiring the dashboard to `GET /api/applications/:id` / `GET /api/orders` is real, separate work for Part 3.
2. **Marketing pricing pages** (`PricingCards.jsx`, `AddOnPricingCards.jsx`, `Pricing.jsx`) still show their own hardcoded catalog rather than fetching `/api/packages`/`/api/add-ons` live. Only `seed.py`'s numbers were corrected to match what they already display. `api.getPackages()`/`getAddOns()`/`getTexasConfig()` exist and are ready for a future fully-dynamic pass.
3. **`AccountStep.jsx`'s embedded signup** (email/password fields shown to an anonymous visitor at step 11) still doesn't call `api.signup()` directly the account is expected to already exist by the time `saveApplication`/`submitApplication` run (both require a JWT). If a genuinely anonymous visitor reaches the final step without having created an account through `Signup.jsx` first, `submitOrder` will fail with a 401 from the backend (a real, visible error not a silent failure) rather than transparently creating the account inline. Making `AccountStep` actually call `api.signup()` when `!user` is a reasonable small Part 3 addition.
4. **`RATELIMIT_STORAGE_URI=memory://`** still applies (unchanged from Part 1 needs Redis for a multi-worker production deploy).
5. **A role change requires re-login** (unchanged JWT behavior from Part 1, still relevant if Part 3 builds admin order-management actions).
