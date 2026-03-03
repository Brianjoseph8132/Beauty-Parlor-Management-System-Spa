from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from functools import wraps
from models import User

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or not user.is_admin:
            return jsonify({"error": "Admin access required"}), 403

        return fn(*args, **kwargs)
    return wrapper


def beautician_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or not user.is_beautician:
            return jsonify({"error": "Beautician access required"}), 403

        return fn(*args, **kwargs)
    return wrapper


def receptionist_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or not user.is_receptionist:
            return jsonify({"error": "Receptionist access required"}), 403

        return fn(*args, **kwargs)
    return wrapper