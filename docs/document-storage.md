# Document Storage

## Current adapter: local disk (development)

`server/app/api/documents.py` stores uploaded files under `UPLOAD_DIR` (see `server/.env.example`), one subdirectory per business, named `<uuid>_<secure_filename>`. The `Document.storage_path` column holds that relative path (`<business_id>/<uuid>_<filename>`) never the original filename alone, and never taken from user input when reading it back (downloads look it up by `Document.id`, not by path).

Security already in place:
- Ownership is checked server-side on every upload/list/download (`_business_for()` customer must own the business; `admin`/`staff` roles bypass the ownership filter, everyone else can't).
- Extension allow-list (`ALLOWED_UPLOAD_EXTENSIONS`) plus an explicit deny-list (`svg`, `html`, `htm`, `exe`, `js`, `mjs`, `sh`, `bat`, `php`) regardless of what the allow-list says.
- File-signature check (`_matches_signature`) the first bytes of the actual upload must match what the claimed extension implies (PDF magic bytes, PNG/JPEG headers, ZIP header for `.docx`, OLE2 header for legacy `.doc`). A `.html` file renamed to `.pdf` is rejected even though the extension alone would pass.
- 10MB request-body cap (`MAX_CONTENT_LENGTH` in `config.py`) enforced by Flask/Werkzeug before the view function even runs.
- Downloads are always forced attachments (`send_from_directory(..., as_attachment=True, download_name=doc.file_name)`) a PDF or image can never render inline and take over the tab.
- `Cache-Control: private, no-store` on every `/api/documents/*` response (via the global `after_request` hook in `server/app/__init__.py`).
- The raw storage path is never returned to the client `Document.to_dict()` only exposes `id`, `document_type`, `file_name`, `size_bytes`, `version`, `created_at`.

## Designed (not implemented) adapter: S3 / Cloudflare R2

For a real production deployment, swap the local-disk calls in `documents.py` for an object-storage client. The schema doesn't need to change `Document.storage_path` just becomes the object key instead of a local relative path, so this is a one-file change:

1. **Bucket**: one private bucket per environment (`abf-documents-prod`, `abf-documents-staging`), no public read access, versioning enabled.
2. **Upload**: stream the incoming file directly to the bucket (`put_object`) instead of `file.save(destination)`; key format stays `<business_id>/<uuid>_<secure_filename>` for continuity.
3. **Download**: replace `send_from_directory` with a short-lived **signed URL** (`generate_presigned_url` for S3, or R2's equivalent) expiry on the order of minutes, single-use in spirit (the URL itself is the credential, so keep the expiry short and never log it). The Flask route still enforces ownership *before* minting the signed URL; the signed URL itself carries no ownership check, so it must never be handed out to an unauthorized caller.
4. **Config**: add `STORAGE_BACKEND` (`local` | `s3`), `S3_BUCKET`, `S3_REGION`, `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` (or R2's equivalent `R2_ACCOUNT_ID`/`R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`) to `config.py`, following the same "absent = feature disabled/falls back" pattern already used for Stripe (`PAYMENTS_ENABLED`) and SMTP (`EMAIL_ENABLED`).
5. **Migration**: existing local files would need a one-time backfill script (list `UPLOAD_DIR`, upload each to the bucket at the same key, then flip `STORAGE_BACKEND`) not needed today since there's no production data yet.

## Malware scanning (recommended, not implemented)

Before a file is ever servable to another user (in particular staff-facing downloads of customer uploads), run it through a scanning step:
- **Self-hosted**: a ClamAV sidecar/daemon the upload endpoint calls synchronously (or asynchronously with the document marked "pending scan" until clean) before `db.session.commit()`.
- **Managed**: many cloud storage providers offer built-in scanning on upload (e.g. a Lambda/Worker triggered by the object-created event) this fits the S3/R2 adapter above without adding scanning logic to the Flask process itself.

Not implemented in this pass no scanning service is available in this environment to integrate against or test.
