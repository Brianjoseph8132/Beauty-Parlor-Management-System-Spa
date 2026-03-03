from models import Allergy,db, User
from flask import jsonify,request, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity



allergy_bp = Blueprint("allergy_bp", __name__)


# Add Allergy
@allergy_bp.route("/allergy", methods=["POST"])
@jwt_required()
def add_allergy():
    data = request.get_json()
    user_id = int(get_jwt_identity())

    if not data or not data.get("name"):
        return jsonify({"error": "Allergy name is required"}), 400

    existing_allergy = Allergy.query.filter_by(
        name=data["name"],
        user_id=user_id
    ).first()

    if existing_allergy:
        return jsonify({"error": "Allergy already exists"}), 400

    new_allergy = Allergy(name=data["name"], user_id=user_id)
    db.session.add(new_allergy)
    db.session.commit()

    return jsonify({
        "success": "Allergy added successfully",
        "allergy": {"id": new_allergy.id, "name": new_allergy.name}
    }), 201




# Get all allergies
@allergy_bp.route("/allergies", methods=["GET"])
@jwt_required()
def get_allergies():
    user_id = int(get_jwt_identity())  # get current user
    allergies = Allergy.query.filter_by(user_id=user_id).all()  # only user’s allergies

    all_allergies = [
        {"id": allergy.id, "name": allergy.name} for allergy in allergies
    ]
    return jsonify(all_allergies), 200



# Delete allergy
@allergy_bp.route("/allergy/<int:allergy_id>", methods=["DELETE"])
@jwt_required()
def delete_allergy(allergy_id):
    user_id = int(get_jwt_identity())

    allergy = Allergy.query.filter_by(id=allergy_id, user_id=user_id).first()
    if not allergy:
        return jsonify({"error": "Allergy not found"}), 404

    db.session.delete(allergy)
    db.session.commit()

    return jsonify({"success": "Allergy deleted successfully"}), 200



# Update allergy
@allergy_bp.route("/allergies/<int:allergy_id>", methods=["PUT"])
@jwt_required()
def update_allergy(allergy_id):
    data = request.get_json()
    if not data or not data.get("name"):
        return jsonify({"error": "Allergy name is required"}), 400

    user_id = int(get_jwt_identity())
    allergy = Allergy.query.filter_by(id=allergy_id, user_id=user_id).first()
    if not allergy:
        return jsonify({"error": "Allergy not found"}), 404

    new_name = data.get("name")

    # Prevent duplicates for the same user
    existing_allergy = Allergy.query.filter_by(name=new_name, user_id=user_id).first()
    if existing_allergy and existing_allergy.id != allergy.id:
        return jsonify({"error": "Allergy name already exists"}), 400

    allergy.name = new_name
    db.session.commit()

    return jsonify({
        "success": "Allergy updated successfully",
        "allergy": {"id": allergy.id, "name": allergy.name}
    }), 200
