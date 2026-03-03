from models import User,db
from flask import jsonify,request, Blueprint
from werkzeug.security import generate_password_hash
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import request
from email_validator import validate_email, EmailNotValidError


user_bp = Blueprint("user_bp", __name__)

def normalize_phone(phone):
    phone = phone.strip().replace(" ", "")

    if phone.startswith("0"):
        return "+254" + phone[1:]

    if phone.startswith("7"):
        return "+254" + phone

    if phone.startswith("+"):
        return phone

    raise ValueError("Invalid phone number")


# Add User
@user_bp.route("/user", methods=["POST"])
def add_users():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    raw_password = data.get('password')
    is_admin = data.get('is_admin', False)
    is_beautician = data.get('is_beautician', False)
    is_receptionist = data.get('is_receptionist', False)
    profile_picture = data.get('profile_picture', "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=")

    # Validation for password length before hashing it
    if not isinstance(raw_password, str) or len(raw_password) < 8:
        raise ValueError("Password must be a string of at least 8 characters")

    
    password = generate_password_hash(raw_password)

    # Email validation using email-validator
    try:
        valid_email = validate_email(email)
    except EmailNotValidError as e:
        return jsonify({"error": f"Invalid email address: {str(e)}"}), 400
    
    #check if username or email already exists
    check_username = User.query.filter_by(username=username).first()
    check_email = User.query.filter_by(email=email).first()

    if check_email or check_username:
        return jsonify({"error": "Username or Email already exists"}), 400
    
    #Add new User to the database
    new_user = User(
        username=username,
        email=email,
        password=password,
        is_admin=is_admin,
        is_beautician=is_beautician,
        is_receptionist=is_receptionist,
        profile_picture=profile_picture
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"success": " User added successfully"}), 200




# Delete
@user_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_users(user_id):
    current_user_id = int(get_jwt_identity())

    if user_id != current_user_id:
        return jsonify({"error": "Unauthorized"}), 403

    user = User.query.get_or_404(current_user_id)

    db.session.delete(user)
    db.session.commit()

    return jsonify({"success": "Deleted successfully"}), 200



# Update User
@user_bp.route('/update_profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()

    # Check if new username/email already exists (but exclude current user)
    if "username" in data and data["username"]:
        # Only check if username is DIFFERENT from current username
        if data["username"] != user.username:
            existing_user = User.query.filter_by(username=data["username"]).first()
            if existing_user:
                return jsonify({'error': 'Username already taken'}), 400
        user.username = data["username"]

    if "email" in data and data["email"]:
        # Only check if email is DIFFERENT from current email
        if data["email"] != user.email:
            existing_email = User.query.filter_by(email=data["email"]).first()
            if existing_email:
                return jsonify({'error': 'Email already in use'}), 400
        user.email = data["email"]

    # Only update password if provided and not empty
    if "password" in data and data["password"]:
        user.password = generate_password_hash(data["password"])

    if "profile_picture" in data and data["profile_picture"] is not None:
        user.profile_picture = data["profile_picture"]

    try:
        db.session.commit()
        
        # RETURN UPDATED USER DATA
        return jsonify({
            "success": "Profile updated successfully",
            "updatedUser": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "profile_picture": user.profile_picture,
                "is_beautician": user.is_beautician
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update profile', 'details': str(e)}), 500