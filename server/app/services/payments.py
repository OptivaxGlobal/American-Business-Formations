"""Stripe adapter. All Stripe calls are isolated here so the rest of the
app never talks to the SDK directly swapping providers means changing
only this file. Requires STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET; without
them, PAYMENTS_ENABLED is False and checkout_session() raises a clear error
instead of silently pretending a payment succeeded."""

from flask import current_app


class PaymentsNotConfigured(RuntimeError):
    pass


def _stripe():
    import stripe  # imported lazily so the package is optional until configured
    stripe.api_key = current_app.config["STRIPE_SECRET_KEY"]
    return stripe


def create_checkout_session(order, success_url, cancel_url, customer_email=None):
    if not current_app.config["PAYMENTS_ENABLED"]:
        raise PaymentsNotConfigured(
            "Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to enable real checkout."
        )
    stripe = _stripe()
    line_items = [{
        "price_data": {
            "currency": "usd",
            "product_data": {"name": item.name},
            "unit_amount": item.price_cents,
        },
        "quantity": 1,
    } for item in order.items]

    session = stripe.checkout.Session.create(
        mode="payment",
        line_items=line_items,
        success_url=success_url,
        cancel_url=cancel_url,
        customer_email=customer_email,
        client_reference_id=order.id,
        idempotency_key=order.idempotency_key,
        metadata={"order_id": order.id, "order_number": order.order_number},
    )
    return session


def verify_webhook_signature(payload, sig_header):
    if not current_app.config["PAYMENTS_ENABLED"]:
        raise PaymentsNotConfigured("Stripe webhook secret is not configured.")
    stripe = _stripe()
    return stripe.Webhook.construct_event(
        payload, sig_header, current_app.config["STRIPE_WEBHOOK_SECRET"]
    )
