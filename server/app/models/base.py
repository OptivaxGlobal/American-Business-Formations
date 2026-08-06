import uuid

from ..extensions import db
from ..utils import utcnow


def gen_uuid():
    return str(uuid.uuid4())


class BaseModel(db.Model):
    __abstract__ = True

    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    created_at = db.Column(db.DateTime, default=utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=utcnow,
        onupdate=utcnow,
        nullable=False,
    )
    deleted_at = db.Column(db.DateTime, nullable=True)

    def soft_delete(self):
        self.deleted_at = utcnow()

    @property
    def is_deleted(self):
        return self.deleted_at is not None
