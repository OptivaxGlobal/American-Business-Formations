# Activating Stripe Payments

The Stripe adapter (`server/app/services/payments.py`) and webhook handler (`server/app/api/checkout.py`) already exist and are fully wired they are just inert until Stripe credentials are configured. **No frontend code changes are required** to turn payments on or off; the checkout flow already branches on whether Stripe is configured (see "How the switch works" below).

## Required environment variables

Set these in `server/.env` (see `server/.env.example`):

| Variable | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` | Server-side Stripe API key. Never exposed to the frontend. |
| `STRIPE_PUBLISHABLE_KEY` | Public key currently unused by the frontend (checkout redirects to a Stripe-hosted page, so no client-side Stripe.js integration is needed), but reserved for a future embedded-checkout flow. |
| `STRIPE_WEBHOOK_SECRET` | Used to verify that webhook requests actually came from Stripe (`stripe.Webhook.construct_event`). |

`config.py` computes `PAYMENTS_ENABLED = bool(STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET)` there is no separate `PAYMENTS_ENABLED` flag to set by hand. Setting both keys turns payments on; unsetting either turns them back off immediately on the next restart.

## How the switch works

`POST /api/checkout/session` (`server/app/api/checkout.py`) always computes the order total from the server-side `Package`/`AddOn` catalog first, then calls `create_checkout_session(order, ...)`:

- **`PAYMENTS_ENABLED=false`** (today, no keys set): `create_checkout_session` raises `PaymentsNotConfigured`. The order is saved as `status: "awaiting_payment"` with a `Payment(status="not_collected")` row, an admin notification and a customer email are sent (or logged if SMTP isn't configured never claimed as sent if it wasn't), and the response has `checkout_url: null`.
- **`PAYMENTS_ENABLED=true`** (once keys are set): the same call succeeds, returns a real Stripe Checkout Session, and the response has a real `checkout_url`. The frontend's existing handling of the checkout response (redirect to `checkout_url` when present, otherwise show the "payment temporarily unavailable" confirmation) requires no changes it already branches on whether `checkout_url` is present.

## Webhook

- **URL**: `POST /api/webhooks/stripe` (already registered, no auth required Stripe can't send a JWT cookie; the signature check *is* the authentication).
- **Required events**: `checkout.session.completed` (marks the order `paid`, creates a `Payment(status="succeeded")` row, sends the `payment_received` email) and `payment_intent.payment_failed` (marks the order `failed`).
- **Idempotency**: the handler checks `Payment.query.filter_by(raw_event_id=event["id"])` before processing a redelivered webhook is a no-op, not a double-charge or duplicate email.
- **Status-transition guard (Part 4)**: beyond the idempotency check above, `checkout.session.completed` only flips an order to `paid` if it's currently in `ORDER_STATUSES_PAYABLE_FROM` (`draft`/`pending`/`awaiting_payment`/`failed`) a stray or reordered event can never re-mark an already-`paid` order, or flip a `refunded`/`cancelled` one back to `paid`. Symmetrically, `payment_intent.payment_failed` never downgrades an order that's already `paid`.
- **Order is never marked paid from a success-page query parameter.** The `success_url` passed to Stripe (`/formation-details?checkout=success&order=<id>`) is purely for the user's benefit (so the frontend can fetch and display the order) the *only* thing that flips `status` to `"paid"` is a verified webhook event.

## Test-mode verification

1. Create a Stripe account (or use an existing one) and switch to **test mode**.
2. Get the test-mode secret key and set up a webhook endpoint pointed at your dev/staging URL + `/api/webhooks/stripe`, subscribed to the two events above; copy its signing secret.
3. Set `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` in `server/.env` (test-mode values) and restart the Flask process.
4. Use the Stripe CLI (`stripe listen --forward-to localhost:5000/api/webhooks/stripe`) to forward events locally, or use the real endpoint if testing against a deployed instance.
5. Run through onboarding checkout with a Stripe test card (e.g. `4242 4242 4242 4242`) and confirm: the order redirects to Stripe's hosted page, completes, the webhook fires, the order flips to `paid` in the database, and the confirmation page (loaded fresh from the server) reflects that.
6. Confirm a failed test card produces `status: "failed"`, not `paid`.

## Live-mode activation

1. Repeat the same steps with **live-mode** keys and a live-mode webhook endpoint once the Stripe account is fully verified/activated by Stripe.
2. Deploy the updated `server/.env` (or your platform's secret manager) never commit these values.
3. Do a single small real-money test order end-to-end before announcing payments are live.
4. Monitor the first several real orders in `/admin/orders` and the Stripe dashboard in parallel for at least a few days.

## Rollback / disabling

Unset (or rotate out) `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` and restart the server. `PAYMENTS_ENABLED` immediately goes back to `false`, and every new checkout reverts to the `awaiting_payment` flow described above no frontend deploy, no code change, no data migration needed. Orders already marked `paid` are unaffected; only new orders are routed to the disabled-payments path.
