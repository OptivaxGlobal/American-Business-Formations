from functools import wraps

from flask_jwt_extended import get_jwt, jwt_required

from ..utils import error


def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get("role") not in ("admin", "staff"):
            return error("Admin access required.", 403)
        return fn(*args, **kwargs)
    return wrapper
