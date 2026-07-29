from ..extensions import db
from .base import BaseModel


class AuditLog(BaseModel):
    __tablename__ = "audit_logs"

    actor_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)
    actor_label = db.Column(db.String(200))
    action = db.Column(db.String(200), nullable=False)
    details = db.Column(db.Text)
    ip_address = db.Column(db.String(64))

    def to_dict(self):
        return {
            "id": self.id, "actor": self.actor_label, "action": self.action,
            "details": self.details, "at": self.created_at.isoformat(),
        }


class StatusHistory(BaseModel):
    __tablename__ = "status_history"

    entity_type = db.Column(db.String(40), nullable=False)  # business | application | order | lead
    entity_id = db.Column(db.String(36), nullable=False, index=True)
    from_status = db.Column(db.String(40))
    to_status = db.Column(db.String(40), nullable=False)
    changed_by = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)


class EmailLog(BaseModel):
    __tablename__ = "email_logs"

    to_email = db.Column(db.String(255), nullable=False)
    template = db.Column(db.String(80), nullable=False)
    subject = db.Column(db.String(200))
    status = db.Column(db.String(20), nullable=False, default="sent")  # sent | failed | skipped_no_smtp
    error = db.Column(db.Text, nullable=True)
