from models import Service,db, Category
from flask import jsonify,request, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from decorator import admin_required


service_bp = Blueprint("service_bp", __name__)

# Add service
@service_bp.route("/service", methods=["POST"])
@jwt_required()
@admin_required
def add_service():
    data = request.get_json()

    title = data.get("title")
    description = data.get("description")
    duration_minutes = data.get("duration_minutes")
    price = data.get("price")
    image = data.get("image")
    is_active = data.get("is_active", True)
    category_name = data.get("category_name")

    # Validate required fields
    if not title or duration_minutes is None or price is None or not category_name:
        return jsonify({
            "error": "title, duration_minutes, price, and category_name are required"
        }), 400

    # Validate numeric fields
    try:
        duration_minutes = int(duration_minutes)
        price = float(price)
    except ValueError:
        return jsonify({
            "error": "duration_minutes must be an string and price must be a number"
        }), 400

    # Get or create category
    category = Category.query.filter_by(name=category_name).first()
    if not category:
        category = Category(name=category_name)
        db.session.add(category)
        db.session.commit()  # needed to get category.id

    # Optional: prevent duplicate services
    existing_service = Service.query.filter_by(title=title).first()
    if existing_service:
        return jsonify({"error": "Service with this title already exists"}), 400

    # Create service
    service = Service(
        title=title,
        description=description,
        duration_minutes=duration_minutes,
        price=price,
        image=image,
        is_active=is_active,
        category_id=category.id
    )

    db.session.add(service)
    db.session.commit()

    return jsonify({
        "success": "Service added successfully",
        "service": service.to_dict()
    }), 201


# Get all services
@service_bp.route("/services", methods=["GET"])
def get_services():
    # Query all services
    services = Service.query.all()

    # Convert each service to a dictionary
    all_services = [service.to_dict() for service in services]

    return jsonify(all_services), 200



# get one service by id
@service_bp.route("/service/<int:service_id>", methods=["GET"])
def get_service(service_id):
    # Find service by ID
    service = Service.query.get(service_id)

    if not service:
        return jsonify({"error": "Service not found"}), 404

    # Return the service as a dictionary using to_dict()
    return jsonify(service.to_dict()), 200


# Update 
@service_bp.route("/services/<int:service_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_service(service_id):
    data = request.get_json()

    # Find the service
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"error": "Service not found"}), 404

    # Update fields if provided
    title = data.get('title')
    description = data.get('description')
    duration_minutes = data.get('duration_minutes')
    price = data.get('price')
    image = data.get('image')
    is_active = data.get('is_active')
    category_name = data.get('category_name')

    if title:
        service.title = title
    if description:
        service.description = description
    if duration_minutes is not None:
        try:
            service.duration_minutes = int(duration_minutes)
        except ValueError:
            return jsonify({"error": "duration_minutes must be a string"}), 400
    if price is not None:
        try:
            service.price = float(price)
        except ValueError:
            return jsonify({"error": "price must be a number"}), 400
    if image is not None:
        service.image = image
    if is_active is not None:
        service.is_active = bool(is_active)

    # Update category if provided
    if category_name:
        category = Category.query.filter_by(name=category_name).first()
        if not category:
            category = Category(name=category_name)
            db.session.add(category)
            db.session.commit()
        service.category_id = category.id

    db.session.commit()

    return jsonify({
        "message": f"Service '{service.title}' updated successfully",
        "service": service.to_dict()
    }), 200



@service_bp.route("/service-del/<int:service_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_service(service_id):
    # Find the service
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"error": "Service not found"}), 404

    db.session.delete(service)
    db.session.commit()

    return jsonify({"message": f"Service deleted successfully"}), 200

