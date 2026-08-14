from ..extensions import db
from .base import BaseModel

DOCUMENT_TYPES = (
    "formation_questionnaire", "certificate_of_formation", "state_acknowledgment",
    "operating_agreement", "ein_confirmation", "registered_agent_agreement",
    "professional_license", "receipt", "invoice", "compliance_notice",
    "customer_upload", "other",
)

# Part 8/24 requirement badge and review-status vocabulary shown on the
# Documents & Verification step and (once built) an admin review UI.
# `status` is a plain VARCHAR (no DB-level CHECK constraint, consistent
# with every other status column in this app see StatusHistory), so
# these tuples are the enforced contract at the API layer instead.
DOCUMENT_REQUIREMENT_TYPES = ("required", "conditional", "optional", "generated")
DOCUMENT_STATUSES = (
    "not_started", "uploaded", "received", "under_review", "approved",
    "needs_attention", "not_required",
)


class Document(BaseModel):
    __tablename__ = "documents"

    business_id = db.Column(db.String(36), db.ForeignKey("businesses.id"), nullable=False, index=True)
    uploaded_by = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)
    document_type = db.Column(db.String(40), nullable=False, default="other")
    requirement_type = db.Column(db.String(20), nullable=False, default="optional")
    status = db.Column(db.String(20), nullable=False, default="uploaded")
    file_name = db.Column(db.String(255), nullable=False)
    storage_path = db.Column(db.String(500), nullable=False)
    content_type = db.Column(db.String(100))
    size_bytes = db.Column(db.Integer)
    version = db.Column(db.Integer, default=1, nullable=False)
    uploaded_by_admin = db.Column(db.Boolean, default=False, nullable=False)
    # Part 24 admin document review. reviewer_notes is internal-only and
    # must never be exposed to the customer-facing to_dict() below.
    reviewed_at = db.Column(db.DateTime, nullable=True)
    reviewed_by = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)
    reviewer_notes = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id, "document_type": self.document_type, "file_name": self.file_name,
            "requirement_type": self.requirement_type, "status": self.status,
            "size_bytes": self.size_bytes, "version": self.version,
            "created_at": self.created_at.isoformat(),
            "reviewed_at": self.reviewed_at.isoformat() if self.reviewed_at else None,
        }

    def to_admin_dict(self):
        """Includes internal review notes never sent to the customer-facing
        to_dict() above (Part 24: 'Do NOT show internal staff notes to
        customers')."""
        data = self.to_dict()
        data["reviewer_notes"] = self.reviewer_notes
        data["uploaded_by_admin"] = self.uploaded_by_admin
        return data


class ComplianceTask(BaseModel):
    __tablename__ = "compliance_tasks"

    business_id = db.Column(db.String(36), db.ForeignKey("businesses.id"), nullable=False, index=True)
    task_key = db.Column(db.String(80), nullable=False)  # e.g. public-information-report
    name = db.Column(db.String(200), nullable=False)
    due_date = db.Column(db.Date, nullable=True)
    done = db.Column(db.Boolean, default=False, nullable=False)
    reminder_sent_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id, "task_key": self.task_key, "name": self.name,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "done": self.done,
        }


class Notification(BaseModel):
    __tablename__ = "notifications"

    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    body = db.Column(db.String(500))
    read_at = db.Column(db.DateTime, nullable=True)
    link = db.Column(db.String(300))


class SupportThread(BaseModel):
    __tablename__ = "support_threads"

    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    business_id = db.Column(db.String(36), db.ForeignKey("businesses.id"), nullable=True)
    subject = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(20), nullable=False, default="open")  # open | pending | closed
    priority = db.Column(db.String(10), nullable=False, default="normal")

    messages = db.relationship("SupportMessage", backref="thread", lazy="dynamic", cascade="all, delete-orphan")


class SupportMessage(BaseModel):
    __tablename__ = "support_messages"

    thread_id = db.Column(db.String(36), db.ForeignKey("support_threads.id"), nullable=False, index=True)
    author_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    body = db.Column(db.Text, nullable=False)
    is_staff = db.Column(db.Boolean, default=False, nullable=False)
    read_at = db.Column(db.DateTime, nullable=True)
    attachment_path = db.Column(db.String(500), nullable=True)
