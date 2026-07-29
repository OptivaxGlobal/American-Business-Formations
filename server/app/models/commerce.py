from ..extensions import db
from .base import BaseModel

ORDER_STATUSES = ("pending", "paid", "failed", "refunded", "cancelled")
PAYMENT_STATUSES = ("pending", "succeeded", "failed", "refunded")


class Package(BaseModel):
    __tablename__ = "packages"

    name = db.Column(db.String(80), nullable=False, unique=True)
    price_cents = db.Column(db.Integer, nullable=False)
    billing_note = db.Column(db.String(120))
    description = db.Column(db.String(400))
    features = db.Column(db.JSON, default=list)
    is_popular = db.Column(db.Boolean, default=False)
    active = db.Column(db.Boolean, default=True, nullable=False)
    sort_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "price_cents": self.price_cents,
            "billing_note": self.billing_note, "description": self.description,
            "features": self.features or [], "is_popular": self.is_popular,
        }


class AddOn(BaseModel):
    __tablename__ = "add_ons"

    slug = db.Column(db.String(80), nullable=False, unique=True)
    name = db.Column(db.String(160), nullable=False)
    price_cents = db.Column(db.Integer, nullable=False)
    recurring = db.Column(db.Boolean, default=False, nullable=False)
    active = db.Column(db.Boolean, default=True, nullable=False)

    def to_dict(self):
        return {
            "id": self.id, "slug": self.slug, "name": self.name,
            "price_cents": self.price_cents, "recurring": self.recurring,
        }


class Order(BaseModel):
    __tablename__ = "orders"

    order_number = db.Column(db.String(30), unique=True, nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    business_id = db.Column(db.String(36), db.ForeignKey("businesses.id"), nullable=True)
    status = db.Column(db.String(20), nullable=False, default="pending")
    service_fee_cents = db.Column(db.Integer, nullable=False, default=0)
    state_fee_cents = db.Column(db.Integer, nullable=False, default=0)
    add_on_fee_cents = db.Column(db.Integer, nullable=False, default=0)
    tax_cents = db.Column(db.Integer, nullable=False, default=0)
    discount_cents = db.Column(db.Integer, nullable=False, default=0)
    total_cents = db.Column(db.Integer, nullable=False, default=0)
    stripe_checkout_session_id = db.Column(db.String(120), unique=True, nullable=True)
    idempotency_key = db.Column(db.String(80), unique=True, nullable=True)

    items = db.relationship("OrderItem", backref="order", lazy="dynamic", cascade="all, delete-orphan")
    payments = db.relationship("Payment", backref="order", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id, "order_number": self.order_number, "status": self.status,
            "service_fee_cents": self.service_fee_cents, "state_fee_cents": self.state_fee_cents,
            "add_on_fee_cents": self.add_on_fee_cents, "tax_cents": self.tax_cents,
            "discount_cents": self.discount_cents, "total_cents": self.total_cents,
            "created_at": self.created_at.isoformat(),
        }


class OrderItem(BaseModel):
    __tablename__ = "order_items"

    order_id = db.Column(db.String(36), db.ForeignKey("orders.id"), nullable=False)
    item_type = db.Column(db.String(20), nullable=False)  # plan | state_fee | add_on
    name = db.Column(db.String(200), nullable=False)
    price_cents = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {"type": self.item_type, "name": self.name, "price_cents": self.price_cents}


class Payment(BaseModel):
    __tablename__ = "payments"

    order_id = db.Column(db.String(36), db.ForeignKey("orders.id"), nullable=False, index=True)
    provider = db.Column(db.String(30), nullable=False, default="stripe")
    provider_payment_id = db.Column(db.String(120), unique=True, nullable=True)
    status = db.Column(db.String(20), nullable=False, default="pending")
    amount_cents = db.Column(db.Integer, nullable=False)
    raw_event_id = db.Column(db.String(120), unique=True, nullable=True)  # for webhook idempotency


class Subscription(BaseModel):
    __tablename__ = "subscriptions"

    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    business_id = db.Column(db.String(36), db.ForeignKey("businesses.id"), nullable=True)
    add_on_slug = db.Column(db.String(80), nullable=False)
    provider_subscription_id = db.Column(db.String(120), unique=True, nullable=True)
    status = db.Column(db.String(20), nullable=False, default="active")  # active | canceled | past_due
    current_period_end = db.Column(db.DateTime, nullable=True)
