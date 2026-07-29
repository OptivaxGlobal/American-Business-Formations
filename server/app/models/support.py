from ..extensions import db
from .base import BaseModel

DOCUMENT_TYPES = (
    "formation_questionnaire", "certificate_of_formation", "state_acknowledgment",
    "operating_agreement", "ein_confirmation", "registered_agent_agreement",
    "receipt", "invoice", "compliance_notice", "customer_upload", "other",
)


class Document(BaseModel):
    __tablename__ = "documents"

    business_id = db.Column(db.String(36), db.ForeignKey("businesses.id"), nullable=False, index=True)
    uploaded_by = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)
    document_type = db.Column(db.String(40), nullable=False, default="other")
    file_name = db.Column(db.String(255), nullable=False)
    storage_path = db.Column(db.String(500), nullable=False)
    content_type = db.Column(db.String(100))
    size_bytes = db.Column(db.Integer)
    version = db.Column(db.Integer, default=1, nullable=False)
    uploaded_by_admin = db.Column(db.Boolean, default=False, nullable=False)

    def to_dict(self):
        return {
            "id": self.id, "document_type": self.document_type, "file_name": self.file_name,
            "size_bytes": self.size_bytes, "version": self.version,
            "created_at": self.created_at.isoformat(),
        }


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
