import os
import uuid

from flask import Blueprint, request, current_app, send_from_directory
from flask_jwt_extended import get_jwt_identity, get_jwt, jwt_required
from werkzeug.utils import secure_filename

from ..extensions import db, limiter
from ..models import Business, Document
from ..utils import ok, error
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

    safe_name = secure_filename(file.filename)
    stored_name = f"{uuid.uuid4().hex}_{safe_name}"
    business_dir = os.path.join(current_app.config["UPLOAD_DIR"], business.id)
    os.makedirs(business_dir, exist_ok=True)
    destination = os.path.join(business_dir, stored_name)
    file.save(destination)

    doc = Document(
        business_id=business.id,
        uploaded_by=get_jwt_identity(),
        document_type=request.form.get("document_type", "customer_upload"),
        file_name=safe_name,
        storage_path=os.path.join(business.id, stored_name),
        content_type=file.mimetype,
        size_bytes=os.path.getsize(destination),
        uploaded_by_admin=claims.get("role") in ("admin", "staff"),
    )
    db.session.add(doc)
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
    return ok([d.to_dict() for d in docs])


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
