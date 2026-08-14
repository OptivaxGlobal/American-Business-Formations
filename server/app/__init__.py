import os

from flask import Flask, request

from .extensions import db, migrate, jwt, mail, cors, limiter
from .utils import ok, error


def create_app(config_object=None):
    app = Flask(__name__)

    if config_object is None:
        from config import get_config
        config_object = get_config()
    app.config.from_object(config_object)

    if os.getenv("FLASK_ENV") == "production":
        from config import validate_production_config
        validate_production_config(app.config)

    db_uri = app.config["SQLALCHEMY_DATABASE_URI"]
    if db_uri.startswith("sqlite:///") and db_uri != "sqlite:///:memory:":
        os.makedirs(os.path.dirname(db_uri.replace("sqlite:///", "")), exist_ok=True)
    os.makedirs(app.config["UPLOAD_DIR"], exist_ok=True)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    limiter.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["FRONTEND_ORIGIN"]}}, supports_credentials=True)

    # Flask-JWT-Extended's own default error responses use a different JSON
    # shape ({"msg": "..."}) than every other error this API returns
    # ({"ok": false, "message": "..."} via utils.error()) caught by the
    # backend test suite's first-ever real run (test_auth.py expected
    # "message" and got "msg" for a request with no auth cookie at all).
    # Every jwt_required()-protected route error now goes through the same
    # envelope as the rest of the API, so the frontend's handleResponse()
    # (which reads data.message) never silently falls back to a generic
    # "Request failed" for an auth failure specifically.
    @jwt.unauthorized_loader
    def _jwt_missing_token(reason):
        return error("Authentication required.", 401)

    @jwt.invalid_token_loader
    def _jwt_invalid_token(reason):
        return error("Your session is invalid. Please log in again.", 401)

    @jwt.expired_token_loader
    def _jwt_expired_token(jwt_header, jwt_payload):
        return error("Your session has expired. Please log in again.", 401)

    @jwt.revoked_token_loader
    def _jwt_revoked_token(jwt_header, jwt_payload):
        return error("Your session is no longer valid. Please log in again.", 401)

    @jwt.needs_fresh_token_loader
    def _jwt_needs_fresh_token(jwt_header, jwt_payload):
        return error("Please log in again to continue.", 401)

    @jwt.user_lookup_error_loader
    def _jwt_user_lookup_error(jwt_header, jwt_payload):
        return error("Your session is invalid. Please log in again.", 401)

    from .models import User  # noqa: F401 - ensures models are registered with SQLAlchemy

    from .api import blueprints as api_blueprints
    from .admin import blueprints as admin_blueprints
    for bp in api_blueprints + admin_blueprints:
        app.register_blueprint(bp)

    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        # This API never serves HTML/JS itself (the React app is a separate
        # static deploy) 'none' by default plus 'self' for the few
        # directives that matter (e.g. a browser directly opening a JSON
        # error page) keeps this from ever accidentally allowing a script.
        response.headers["Content-Security-Policy"] = (
            "default-src 'none'; frame-ancestors 'none'; base-uri 'none'"
        )
        if app.config.get("ENV") == "production" or os.getenv("FLASK_ENV") == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        # Every authenticated endpoint must never be cached by a shared
        # cache/proxy/CDN a cached response could leak one customer's
        # orders, applications, support thread, or account details to
        # whoever's request happens to hit the same cache entry next.
        # Applied to the whole API rather than an endpoint-by-endpoint
        # allowlist (which previously only covered /auth/me, /admin/, and
        # /documents/ missing /orders, /applications, /support, /account,
        # /notifications, /compliance) so a newly-added authenticated route
        # is private-by-default instead of needing to remember to opt in.
        # The few genuinely public GET reads (catalog/packages, testimonials,
        # announcement, health) have nothing sensitive to leak, so the
        # blanket header costs them nothing.
        if request.path.startswith("/api/"):
            response.headers["Cache-Control"] = "private, no-store"
        return response

    @app.get("/api/health")
    def health():
        return ok({"service": "american-business-formations-api"})

    @app.errorhandler(404)
    def not_found(_err):
        return error("Resource not found.", 404)

    @app.errorhandler(405)
    def method_not_allowed(_err):
        return error("Method not allowed.", 405)

    @app.errorhandler(413)
    def payload_too_large(_err):
        return error("The file must be smaller than 10 MB.", 413)

    @app.errorhandler(400)
    def bad_request(_err):
        return error("Please correct the highlighted fields.", 400)

    @app.errorhandler(429)
    def rate_limited(_err):
        return error("Too many requests. Please slow down and try again shortly.", 429)

    @app.errorhandler(500)
    def server_error(err):
        app.logger.exception("Unhandled server error: %s", err)
        # Never leak stack traces or internals to the client, even in debug builds served over the API.
        return error("Something went wrong on our end. Please try again.", 500)

    return app
