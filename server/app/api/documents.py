import os
import uuid

from flask import Blueprint, request, current_app, send_from_directory
from flask_jwt_extended import get_jwt_identity, get_jwt, jwt_required
from werkzeug.utils import secure_filename

from ..extensions import db, limiter
from ..models import Business, Document, AuditLog
from ..models.support import DOCUMENT_REQUIREMENT_TYPES, DOCUMENT_STATUSES
from ..admin.decorators import admin_required
from ..utils import ok, error, utcnow
from .notifications import notify_user

bp = Blueprint("documents", __name__, url_prefix="/api/documents")

# Explicitly blocked regardless of ALLOWED_UPLOAD_EXTENSIONS defense in
# depth against a future config change accidentally widening the allow-list
# to something that can execute in a browser or on the server.
_NEVER_ALLOWED_EXTENSIONS = {"svg", "html", "htm", "exe", "js", "mjs", "sh", "bat", "php"}

# First bytes that identify the real file type, independent of whatever
# extension the upload claims to have. A renamed .html-as-.pdf, for
# example, fails this check even though the extension alone would pass.
_SIGNATURES = {
    "pdf": (b"%PDF",),
    "png": (b"\x89PNG\r\n\x1a\n",),
    "jpg": (b"\xff\xd8\xff",),
    "jpeg": (b"\xff\xd8\xff",),
    # Modern .docx is a zip (OOXML); legacy .doc is OLE2 compound storage.
    "docx": (b"PK\x03\x04",),
    "doc": (b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1", b"PK\x03\x04"),
}


def _allowed(filename):
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext in _NEVER_ALLOWED_EXTENSIONS:
        return False
    return ext in current_app.config["ALLOWED_UPLOAD_EXTENSIONS"]


def _matches_signature(file_storage, filename):
    """Reads a small header from the actual upload stream and checks it
    against the signatures expected for the claimed extension an
    extension alone is just a label a renamed file can lie about."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    signatures = _SIGNATURES.get(ext)
    if not signatures:
        return True  # no known signature for this extension nothing further to check
    file_storage.stream.seek(0)
    header = file_storage.stream.read(16)
    file_storage.stream.seek(0)
    return any(header.startswith(sig) for sig in signatures)


def _business_for(user_id, role, business_id):
    query = Business.query.filter_by(id=business_id)
    if role not in ("admin", "staff"):
        query = query.filter_by(owner_id=user_id)
    return query.first()


@bp.post("/<business_id>/upload")
@jwt_required()
@limiter.limit("30 per hour")
def upload(business_id):
    """Requires an existing Business record i.e. a real formation session
    already exists for this customer (Part 13/14). There is no anonymous or
    orphan upload path: the JWT identifies the uploader, and
    `_business_for` refuses anything that isn't either the business's own
    owner or staff/admin."""
    claims = get_jwt()
    business = _business_for(get_jwt_identity(), claims.get("role"), business_id)
    if not business:
        return error("Not found", 404)

    file = request.files.get("file")
    if not file or not file.filename:
        return error("A file is required.", 422)
    if not _allowed(file.filename):
        return error("Unsupported file type.", 422)
    if not _matches_signature(file, file.filename):
        return error("This file's contents don't match its extension.", 422)

    document_type = request.form.get("document_type", "customer_upload")
    requirement_type = request.form.get("requirement_type", "conditional")
    if requirement_type not in DOCUMENT_REQUIREMENT_TYPES:
        requirement_type = "conditional"

    safe_name = secure_filename(file.filename)
    if not safe_name:
        return error("Unsupported file name.", 422)
    stored_name = f"{uuid.uuid4().hex}_{safe_name}"
    # Non-guessable storage path (Part 10): a per-business directory named
    # by the business's own opaque UUID, plus a random UUID prefix on the
    # filename itself so even two customers who upload identically-named
    # files never collide or become guessable from one another.
    business_dir = os.path.join(current_app.config["UPLOAD_DIR"], business.id)
    os.makedirs(business_dir, exist_ok=True)
    destination = os.path.join(business_dir, stored_name)
    if os.path.exists(destination):  # uuid collision is astronomically unlikely, but never silently overwrite
        return error("Please try uploading again.", 409)
    file.save(destination)

    doc = Document(
        business_id=business.id,
        uploaded_by=get_jwt_identity(),
        document_type=document_type,
        requirement_type=requirement_type,
        status="uploaded",
        file_name=safe_name,
        storage_path=os.path.join(business.id, stored_name),
        content_type=file.mimetype,
        size_bytes=os.path.getsize(destination),
        uploaded_by_admin=claims.get("role") in ("admin", "staff"),
    )
    db.session.add(doc)
    db.session.add(AuditLog(actor_id=get_jwt_identity(), action="Uploaded document", details=f"business={business.id} type={document_type} file={safe_name}"))
    if doc.uploaded_by_admin:
        notify_user(business.owner_id, "New document from our team", doc.file_name, link=f"/dashboard/businesses/{business.id}")
    db.session.commit()
    return ok(doc.to_dict(), 201)


@bp.get("/<business_id>")
@jwt_required()
def list_documents(business_id):
    claims = get_jwt()
    business = _business_for(get_jwt_identity(), claims.get("role"), business_id)
    if not business:
        return error("Not found", 404)
    docs = business.documents.order_by(Document.created_at.desc()).all()
    is_staff = claims.get("role") in ("admin", "staff")
    return ok([d.to_admin_dict() if is_staff else d.to_dict() for d in docs])


@bp.get("/<business_id>/<document_id>/download")
@jwt_required()
def download(business_id, document_id):
    claims = get_jwt()
    business = _business_for(get_jwt_identity(), claims.get("role"), business_id)
    if not business:
        return error("Not found", 404)
    doc = Document.query.filter_by(id=document_id, business_id=business.id).first()
    if not doc:
        return error("Not found", 404)
    # storage_path is server-generated (uuid + secure_filename), never user input, so no path traversal risk here.
    directory = os.path.join(current_app.config["UPLOAD_DIR"], business.id)
    filename = os.path.basename(doc.storage_path)
    return send_from_directory(directory, filename, as_attachment=True, download_name=doc.file_name)


@bp.delete("/<business_id>/<document_id>")
@jwt_required()
@limiter.limit("30 per hour")
def delete_document(business_id, document_id):
    """Part 8/9 'Remove file'. Ownership is enforced the same way as every
    other route here a customer can only delete their own business's
    documents; staff/admin can delete any (e.g. to clear a bad upload
    before requesting a replacement)."""
    claims = get_jwt()
    business = _business_for(get_jwt_identity(), claims.get("role"), business_id)
    if not business:
        return error("Not found", 404)
    doc = Document.query.filter_by(id=document_id, business_id=business.id).first()
    if not doc:
        return error("Not found", 404)

    directory = os.path.join(current_app.config["UPLOAD_DIR"], business.id)
    filename = os.path.basename(doc.storage_path)
    file_path = os.path.join(directory, filename)
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except OSError:
        pass  # the DB record is the source of truth for "does this document exist"; a stray file left on disk is a cleanup issue, not a correctness one

    db.session.add(AuditLog(actor_id=get_jwt_identity(), action="Deleted document", details=f"business={business.id} type={doc.document_type} file={doc.file_name}"))
    db.session.delete(doc)
    db.session.commit()
    return ok({"deleted": True})


@bp.patch("/<business_id>/<document_id>/status")
@admin_required
def update_document_status(business_id, document_id):
    """Part 24 staff/admin document review. Not customer-accessible:
    @admin_required rejects any non-admin/staff JWT with a real 403."""
    claims = get_jwt()
    business = _business_for(get_jwt_identity(), claims.get("role"), business_id)
    if not business:
        return error("Not found", 404)
    doc = Document.query.filter_by(id=document_id, business_id=business.id).first()
    if not doc:
        return error("Not found", 404)

    data = request.get_json(silent=True) or {}
    new_status = data.get("status")
    if new_status:
        if new_status not in DOCUMENT_STATUSES:
            return error("Invalid status.", 422)
        doc.status = new_status
        doc.reviewed_at = utcnow()
        doc.reviewed_by = get_jwt_identity()
    if "reviewer_notes" in data:
        doc.reviewer_notes = (data.get("reviewer_notes") or "")[:2000]

    db.session.add(AuditLog(actor_id=get_jwt_identity(), action="Updated document status", details=f"business={business.id} document={doc.id} status={doc.status}"))
    db.session.commit()

    if new_status == "needs_attention":
        notify_user(business.owner_id, "Action needed on a document", f"{doc.file_name} needs your attention.", link=f"/dashboard/businesses/{business.id}")

    return ok(doc.to_admin_dict())
