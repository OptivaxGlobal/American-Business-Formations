import pytest

from config import DEV_SECRET_KEY, validate_production_config


def _valid_config(**overrides):
    base = {
        "SECRET_KEY": "a-real-random-production-secret",
        "JWT_SECRET_KEY": "a-different-real-random-production-secret",
        "FRONTEND_ORIGIN": "https://americanbusinessformations.com",
    }
    base.update(overrides)
    return base


def test_accepts_a_properly_configured_production_environment():
    validate_production_config(_valid_config())  # should not raise


def test_rejects_the_development_default_secret_key():
    with pytest.raises(RuntimeError, match="SECRET_KEY"):
        validate_production_config(_valid_config(SECRET_KEY=DEV_SECRET_KEY))


def test_rejects_the_development_default_jwt_secret_key():
    with pytest.raises(RuntimeError, match="JWT_SECRET_KEY"):
        validate_production_config(_valid_config(JWT_SECRET_KEY=DEV_SECRET_KEY))


def test_rejects_a_missing_secret_key():
    with pytest.raises(RuntimeError, match="SECRET_KEY"):
        validate_production_config(_valid_config(SECRET_KEY=""))


def test_rejects_a_non_https_frontend_origin():
    with pytest.raises(RuntimeError, match="FRONTEND_ORIGIN"):
        validate_production_config(_valid_config(FRONTEND_ORIGIN="http://localhost:5173"))


def test_rejects_a_missing_frontend_origin():
    with pytest.raises(RuntimeError, match="FRONTEND_ORIGIN"):
        validate_production_config(_valid_config(FRONTEND_ORIGIN=""))
