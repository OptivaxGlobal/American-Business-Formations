import os
from datetime import timedelta
from pathlib import Path

# `python-dotenv` is in requirements.txt but nothing ever called
# load_dotenv() server/.env was silently never read by the running app in
# every environment (local dev included), always falling back to hardcoded
# defaults regardless of what was in the file. Loaded here, before any
# os.getenv() call below, and only from a real file (never overrides a
# variable a hosting platform already injected directly into the process
# environment, since load_dotenv() defaults to not clobbering existing
# os.environ keys).
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent


# `os.getenv(key, default)` only falls back to `default` when the variable
# is completely *absent* a variable that's present but set to an empty
# string (exactly what an unfilled field in a hosting panel's env-var UI
# commonly produces, and what a `.env` file's `KEY=` line produces once
# python-dotenv actually loads it) is returned as `""` instead, silently
# discarding the documented default. This bit locally during this session's
# setup (a blank `UPLOAD_DIR=` line crashed `os.makedirs('')`) and is a real
# risk in any hosting panel that stores an empty field as `""` rather than
# omitting the variable. Every default below that isn't itself meant to be
# falsy goes through this instead of the raw `os.getenv(key, default)` form.
def _env(key, default=""):
    return os.getenv(key) or default


# Shared sentinel so both the config default and the production guard below
# (see validate_production_config) refer to the exact same string if
# someone changes the dev default they can't accidentally desync the check.
DEV_SECRET_KEY = "dev-secret-key-change-me"


class Config:
    SECRET_KEY = _env("SECRET_KEY", DEV_SECRET_KEY)
    JWT_SECRET_KEY = _env("JWT_SECRET_KEY", SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)
    JWT_TOKEN_LOCATION = ["cookies"]
    JWT_COOKIE_SECURE = os.getenv("FLASK_ENV") == "production"
    JWT_COOKIE_CSRF_PROTECT = True
    JWT_COOKIE_SAMESITE = "Lax"
    # Unset by default: a cookie set by api.example.com is only readable by
    # JS running on api.example.com, not example.com. If the backend ever
    # ends up on a different subdomain than the frontend (the realistic
    # outcome on Hostinger shared hosting, which can't run a persistent
    # Flask process see docs/deployment-checklist.md), the CSRF
    # double-submit cookie (src/lib/api.js reads csrf_access_token via
    # document.cookie) becomes invisible to the frontend's JS unless this
    # is set to the shared parent domain, e.g. ".americanbusinessformations.com"
    # (leading dot, no scheme, no trailing slash). Leave unset when frontend
    # and backend share the exact same origin.
    JWT_COOKIE_DOMAIN = os.getenv("JWT_COOKIE_DOMAIN") or None

    SQLALCHEMY_DATABASE_URI = _env("DATABASE_URL", f"sqlite:///{BASE_DIR / 'data' / 'dev.db'}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    FRONTEND_ORIGIN = _env("FRONTEND_ORIGIN", "http://localhost:5173")

    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB upload limit
    ALLOWED_UPLOAD_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "docx", "doc"}
    UPLOAD_DIR = _env("UPLOAD_DIR", str(BASE_DIR / "data" / "uploads"))

    INFO_EMAIL = _env("INFO_EMAIL", "info@americanbusinessformations.com")
    SUPPORT_EMAIL = _env("SUPPORT_EMAIL", INFO_EMAIL)
    FROM_EMAIL = _env("FROM_EMAIL", INFO_EMAIL)
    SMTP_HOST = _env("SMTP_HOST")
    SMTP_PORT = int(_env("SMTP_PORT", "587"))
    SMTP_USERNAME = _env("SMTP_USERNAME")
    SMTP_PASSWORD = _env("SMTP_PASSWORD")
    SMTP_USE_TLS = _env("SMTP_USE_TLS", "true").lower() == "true"
    EMAIL_ENABLED = bool(SMTP_HOST and SMTP_USERNAME and SMTP_PASSWORD)

    STRIPE_SECRET_KEY = _env("STRIPE_SECRET_KEY")
    STRIPE_PUBLISHABLE_KEY = _env("STRIPE_PUBLISHABLE_KEY")
    STRIPE_WEBHOOK_SECRET = _env("STRIPE_WEBHOOK_SECRET")
    PAYMENTS_ENABLED = bool(STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET)

    TEXAS_FILING_FEE = int(_env("TEXAS_FILING_FEE", "300"))
    TEXAS_FILING_FEE_VERIFIED = _env("TEXAS_FILING_FEE_VERIFIED", "false").lower() == "true"

    RATELIMIT_STORAGE_URI = _env("RATELIMIT_STORAGE_URI", "memory://")


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_COOKIE_CSRF_PROTECT = False
    RATELIMIT_ENABLED = False


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
}


def get_config():
    return config_by_name.get(os.getenv("FLASK_ENV", "development"), DevelopmentConfig)


def validate_production_config(config):
    """Refuse to boot in production with a known/default secret or an
    unset frontend origin. Called once from create_app() when
    FLASK_ENV=production this is the one place that decides whether the
    app is safe to start, rather than silently running with a guessable
    SECRET_KEY/JWT_SECRET_KEY or a CORS origin nobody configured.
    """
    errors = []
    if not config.get("SECRET_KEY") or config["SECRET_KEY"] == DEV_SECRET_KEY:
        errors.append("SECRET_KEY must be set to a unique secret value in production (the development default is not allowed).")
    if not config.get("JWT_SECRET_KEY") or config["JWT_SECRET_KEY"] == DEV_SECRET_KEY:
        errors.append("JWT_SECRET_KEY must be set to a unique secret value in production (the development default is not allowed).")
    frontend_origin = config.get("FRONTEND_ORIGIN") or ""
    if not frontend_origin.startswith("https://"):
        errors.append(f"FRONTEND_ORIGIN must be a valid https:// origin in production (got {frontend_origin!r}).")
    if errors:
        raise RuntimeError("Refusing to start in production due to invalid configuration:\n- " + "\n- ".join(errors))
