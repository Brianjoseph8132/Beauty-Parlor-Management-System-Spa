from models import User,db, TokenBlocklist
from flask import jsonify, request, Blueprint,url_for,session, make_response
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt, create_refresh_token, set_refresh_cookies,unset_jwt_cookies
from datetime import datetime
from datetime import timedelta
from datetime import timezone
from flask_mail import  Message
from app import mail
from itsdangerous import URLSafeTimedSerializer
from werkzeug.security import generate_password_hash
from sqlalchemy_serializer import SerializerMixin
import os
from google.oauth2 import id_token
from google.auth.transport import requests

serializer = URLSafeTimedSerializer("SECRET_KEY")
GOOGLE_CLIENT_ID ='1051478711226-l45r0i6svsr6caieqdmcnel42t3rltb4.apps.googleusercontent.com'
FRONTEND_URL ='http://localhost:5173'


auth_bp = Blueprint("auth_bp", __name__)


def generate_unique_username(base_name):
    username = base_name
    counter = 1
    while User.query.filter_by(username=username).first():
        username = f"{base_name}{counter}"
        counter += 1
    return username


# LOGIN
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    remember = data.get("rememberMe")

    user = User.query.filter_by(email=email).first()

    if not (user and check_password_hash(user.password, password)):
        return jsonify({"error": "Either email/password is incorrect"}), 404

    # Short-life access token
    access_token = create_access_token(identity=str(user.id))

    # Normal response payload
    response = make_response(jsonify({
        "access_token": access_token,
        "is_admin": user.is_admin,
        "is_beautician": user.is_beautician,
        "is_receptionist": user.is_receptionist
    }))

    # If Remember Me create long-life refresh token stored in cookie
    if remember:
        refresh_token = create_refresh_token(identity=str(user.id))
        set_refresh_cookies(response, refresh_token)

    return response


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    new_access = create_access_token(identity=user_id)
    return jsonify({"access_token": new_access})


# Current User
@auth_bp.route("/current_user", methods=["GET"])
@jwt_required()
def current_user():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    user_data ={
            'id':user.id,
            'email':user.email,
            'username':user.username,
            'is_admin':user.is_admin,
            "is_beautician": user.is_beautician,
            "is_receptionist": user.is_receptionist,
            "profile_picture": user.profile_picture
        }

    return jsonify(user_data)



@auth_bp.route("/login_with_google", methods=["POST"])
def login_with_google():
    data = request.get_json()
    token = data.get("token")

    if not token:
        return jsonify({"error": "Missing Google token"}), 400

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_CLIENT_ID 
        )
    except ValueError:
        return jsonify({"error": "Invalid Google token"}), 400

    email = idinfo["email"]
    name = idinfo.get("name")
    picture = idinfo.get("picture")

    user = User.query.filter_by(email=email).first()
    if not user:
        base_username = name or email.split("@")[0]
        unique_username = generate_unique_username(base_username)

        user = User(
            email=email,
            username=unique_username,
            password=generate_password_hash(os.urandom(32).hex()),
            profile_picture=picture,
            is_admin=False,
            is_beautician=False,
            is_receptionist=False
        )
        db.session.add(user)
        db.session.commit()


    access_token = create_access_token(identity=user.id)
    response = make_response(jsonify({
        "access_token": access_token,
        "is_admin": user.is_admin,
        "is_beautician": user.is_beautician,
        "is_receptionist": user.is_receptionist
    }))
    return response


@auth_bp.route('/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Generate a password reset token
    token = serializer.dumps(email, salt="password-reset")

    # Create the reset link pointing to the frontend
    reset_link = f"{FRONTEND_URL}/reset-password/{token}"

    # Send the email with the reset link
    msg = Message("Password Reset Request", sender="ashley.testingmoringa@gmail.com", recipients=[email])
    msg.html = f"Click <a href='{reset_link}'>here</a> to reset your password."
    mail.send(msg)

    return jsonify({"message": "Password reset email sent"}), 200


@auth_bp.route('/auth/reset-password/<token>', methods=['POST'])
def reset_password(token):
    data = request.get_json()
    new_password = data.get('password')

    if not new_password:
        return jsonify({"error": "Password is required"}), 400

    try:
        # Verify the token and get the email
        email = serializer.loads(token, salt="password-reset", max_age=1800)  # 30 min expiry
    except:
        return jsonify({"error": "Invalid or expired token"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Update the user's password
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()

    return jsonify({"message": "Password reset successful"}), 200




@auth_bp.route("/logout", methods=["DELETE"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    now = datetime.now(timezone.utc)
    db.session.add(TokenBlocklist(jti=jti, created_at=now))
    db.session.commit()

    response = jsonify({"success": "Logged out successfully"})
    unset_jwt_cookies(response)  
    return response
