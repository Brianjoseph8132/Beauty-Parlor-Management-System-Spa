from models import Category,db
from flask import jsonify,request, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
# from decorator import admin_required


category_bp = Blueprint("category_bp", __name__)


# Add Category
@category_bp.route("/category", methods=["POST"])
# @jwt_required()
# @admin_required
def add_category():
    data = request.get_json()

    # Validate input
    if not data or not data.get("name"):
        return jsonify({"error": "Category name is required"}), 400

    # Check if category already exists
    existing_category = Category.query.filter_by(name=data["name"]).first()
    if existing_category:
        return jsonify({"error": "Category already exists"}), 400

    # Create new category
    new_category = Category(name=data["name"])
    db.session.add(new_category)
    db.session.commit()

    return jsonify({
        "success": f"Category added successfully",
    }), 201



# Get all categories
@category_bp.route("/categories", methods=["GET"])
def get_categories():
    categories = Category.query.filter_by(is_active=True).all()

    all_categories = [
        {
            "id": category.id,
            "name": category.name
        } for category in categories
    ] 
    return jsonify( all_categories)


# Delete category
@category_bp.route("/categories/name/<string:category_name>", methods=["DELETE"])
@jwt_required()
# @admin_required
def delete_category_by_name(category_name):
    category = Category.query.filter_by(name=category_name).first()

    if not category:
        return jsonify({"error": "Category not found"}), 404

    db.session.delete(category)
    db.session.commit()

    return jsonify({
        "success": f"Category  deleted successfully"
    }), 200


# Update category
@category_bp.route("/category/name/<string:current_name>", methods=["PUT"])
@jwt_required()
# @admin_required
def update_category_by_name(current_name):
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    category = Category.query.filter_by(name=current_name).first()

    if not category:
        return jsonify({"error": "Category not found"}), 404

    # Update name (if provided)
    new_name = data.get("name")
    if new_name:
        # Prevent duplicate category names
        existing_category = Category.query.filter_by(name=new_name).first()
        if existing_category and existing_category.id != category.id:
            return jsonify({"error": "Category name already exists"}), 400

        category.name = new_name

    db.session.commit()

    return jsonify({
        "success": f"Category updated successfully",
        "category": {
            "id": category.id,
            "name": category.name,
        }
    }), 200
