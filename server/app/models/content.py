from ..extensions import db
from .base import BaseModel

LEAD_STATUSES = ("new", "contacted", "qualified", "converted", "lost")


class Lead(BaseModel):
    __tablename__ = "leads"

    source = db.Column(db.String(60), nullable=False)
    business_name = db.Column(db.String(200))
    name = db.Column(db.String(200))
    email = db.Column(db.String(255))
    phone = db.Column(db.String(40))
    funnel_step = db.Column(db.String(60))
    status = db.Column(db.String(20), nullable=False, default="new")  # new|contacted|qualified|converted|lost
    assigned_to = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)
    notes = db.Column(db.Text)
    follow_up_date = db.Column(db.Date, nullable=True)

    def to_dict(self):
        return {
            "id": self.id, "source": self.source, "business_name": self.business_name,
            "name": self.name, "email": self.email, "status": self.status,
            "created_at": self.created_at.isoformat(),
        }


class ContactSubmission(BaseModel):
    __tablename__ = "contact_submissions"

    first_name = db.Column(db.String(120))
    last_name = db.Column(db.String(120))
    email = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(40))
    service = db.Column(db.String(120))
    message = db.Column(db.Text, nullable=False)
    resolved = db.Column(db.Boolean, default=False, nullable=False)


class BlogPost(BaseModel):
    __tablename__ = "blog_posts"

    slug = db.Column(db.String(160), unique=True, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    excerpt = db.Column(db.String(400))
    body_html = db.Column(db.Text)
    published = db.Column(db.Boolean, default=False, nullable=False)
    published_at = db.Column(db.DateTime, nullable=True)
    author_name = db.Column(db.String(120))


class FAQ(BaseModel):
    __tablename__ = "faqs"

    question = db.Column(db.String(300), nullable=False)
    answer = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(80))
    sort_order = db.Column(db.Integer, default=0)
    published = db.Column(db.Boolean, default=True, nullable=False)


class Testimonial(BaseModel):
    __tablename__ = "testimonials"

    customer_name = db.Column(db.String(160), nullable=False)
    customer_role = db.Column(db.String(160))
    quote = db.Column(db.Text, nullable=False)
    verified = db.Column(db.Boolean, default=False, nullable=False)
    published = db.Column(db.Boolean, default=False, nullable=False)


class SiteSetting(BaseModel):
    __tablename__ = "site_settings"

    key = db.Column(db.String(120), unique=True, nullable=False)
    value = db.Column(db.JSON, nullable=False)
