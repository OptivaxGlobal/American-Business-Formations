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
        if app.config.get("ENV") == "production" or os.getenv("FLASK_ENV") == "production":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
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
