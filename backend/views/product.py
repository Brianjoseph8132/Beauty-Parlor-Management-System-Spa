from models import db, User, Product, Employee,Booking
from flask import jsonify, request, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, case
from datetime import date, timedelta
from flask import request, jsonify


products_bp = Blueprint("products_bp", __name__)


@products_bp.route("/products", methods=["POST"])
@jwt_required()
def create_product():
    user = User.query.get(int(get_jwt_identity()))

    if not (user.is_admin or user.is_receptionist):
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json() or {}

    required_fields = ["product_name", "price_per_each"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    if Product.query.filter_by(product_name=data["product_name"]).first():
        return jsonify({"error": "Product already exists"}), 400

    product = Product(
        product_name=data["product_name"],
        quantity=0,  # always start at zero
        price_per_each=data["price_per_each"],
        supplier_name=data.get("supplier_name"),
        description=data.get("description"),
        min_stock_level=data.get("min_stock_level", 5),
        product_image=data.get("product_image")
    )

    db.session.add(product)
    db.session.commit()

    return jsonify({
        "success": "Product created successfully",
        "product": product.to_dict()
    }), 201



# Restock existing Products
@products_bp.route("/products/restock/<int:product_id>", methods=["POST"])
@jwt_required()
def restock_product(product_id):
    user = User.query.get(int(get_jwt_identity()))

    if not (user.is_admin or user.is_receptionist):
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json() or {}
    quantity = data.get("quantity")

    if quantity is None or quantity <= 0:
        return jsonify({"error": "Quantity must be greater than zero"}), 400

    product = Product.query.get_or_404(product_id)
    product.quantity += quantity

    db.session.commit()

    return jsonify({
        "success": "Product restocked successfully",
        "product": product.to_dict()
    })



# Stock-out / usage endpoint
@products_bp.route("/products/stock-out/<int:product_id>", methods=["POST"])
@jwt_required()
def stock_out_product(product_id):
    user = User.query.get(int(get_jwt_identity()))

    if not (user.is_admin or user.is_receptionist):
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json() or {}
    quantity = data.get("quantity")

    if quantity is None or quantity <= 0:
        return jsonify({"error": "Quantity must be greater than zero"}), 400

    product = Product.query.get_or_404(product_id)

    if product.quantity < quantity:
        return jsonify({
            "error": "Insufficient stock",
            "available": product.quantity
        }), 400

    product.quantity -= quantity
    db.session.commit()

    return jsonify({
        "success": "Stock reduced successfully",
        "product": product.to_dict()
    })


# Get all products (inventory)
@products_bp.route("/products/inventory", methods=["GET"])
@jwt_required()
def get_products():
    user = User.query.get(int(get_jwt_identity()))

    if not (user.is_admin or user.is_receptionist):
        return jsonify({"error": "Access denied"}), 403

    # Only fetch active products (important for soft delete)
    products = (
        Product.query
        .filter(Product.is_active == True)
        .order_by(Product.product_name)
        .all()
    )

    total_value = 0
    low_stock_count = 0
    out_of_stock_count = 0

    for product in products:
        # total_amount should already be quantity * price_per_each
        total_value += product.total_amount

        if product.quantity == 0:
            out_of_stock_count += 1
        elif product.quantity <= product.min_stock_level:
            low_stock_count += 1

    response = {
        "total_products": len(products),
        "total_inventory_value": round(total_value, 2),
        "low_stock_count": low_stock_count,
        "out_of_stock_count": out_of_stock_count,
        "products": [product.to_dict() for product in products],
    }

    return jsonify(response), 200


# Update
@products_bp.route("/products/<int:product_id>", methods=["PUT"])
@jwt_required()
def update_product(product_id):
    user = User.query.get(int(get_jwt_identity()))

    if not (user.is_admin or user.is_receptionist):
        return jsonify({"error": "Access denied"}), 403

    product = Product.query.get_or_404(product_id)

   
    data = request.get_json() or {}

    # Prevent stock manipulation
    if "quantity" in data:
        return jsonify({
            "error": "Quantity cannot be updated here. Use restock or stock-out endpoints."
        }), 400

    # product_name
    if "product_name" in data:
        new_name = data["product_name"].strip()

        if not new_name:
            return jsonify({"error": "Product name cannot be empty"}), 400

        existing = Product.query.filter(
            Product.product_name == new_name,
            Product.id != product_id
        ).first()

        if existing:
            return jsonify({"error": "Product name already exists"}), 400

        product.product_name = new_name

    # price
    if "price_per_each" in data:
        try:
            price = float(data["price_per_each"])
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid price value"}), 400

        if price <= 0:
            return jsonify({"error": "Price must be greater than zero"}), 400

        product.price_per_each = price

    # optional fields
    if "supplier_name" in data:
        product.supplier_name = data["supplier_name"]

    if "description" in data:
        product.description = data["description"]

    if "min_stock_level" in data:
        try:
            min_stock = int(data["min_stock_level"])
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid minimum stock level"}), 400

        if min_stock < 0:
            return jsonify({"error": "Minimum stock level cannot be negative"}), 400

        product.min_stock_level = min_stock

    # product image URL (simple & correct)
    if "product_image" in data:
        product.product_image = data["product_image"]
    
    if "is_active" in data:
        product.is_active = bool(data["is_active"])


    db.session.commit()

    return jsonify({
        "success": "Product updated successfully",
        "product": product.to_dict()
    })



# Low-stock alert endpoint
# @products_bp.route("/products/low-stock", methods=["GET"])
# @jwt_required()
# def low_stock_products():
#     products = Product.query.filter(
#         Product.quantity <= Product.min_stock_level
#     ).all()

#     return jsonify({
#         "low_stock_count": len(products),
#         "items": [p.to_dict() for p in products]
#     })



# Delete
@products_bp.route("/products/delete/<int:product_id>", methods=["DELETE"])
@jwt_required()
def soft_delete_product(product_id):
    user = User.query.get(int(get_jwt_identity()))

    if not user.is_admin:
        return jsonify({"error": "Access denied"}), 403

    product = Product.query.get_or_404(product_id)

    if product.quantity > 0:
        return jsonify({
            "error": "Cannot delete product with remaining stock",
            "available_quantity": product.quantity
        }), 400

    product.is_active = False
    db.session.commit()

    return jsonify({
        "success": "Product deactivated successfully"
    })


# Single Product
@products_bp.route("/products/<int:product_id>", methods=["GET"])
@jwt_required()
def get_product_by_id(product_id):
    user = User.query.get(int(get_jwt_identity()))

    if not (user.is_admin or user.is_receptionist):
        return jsonify({"error": "Access denied"}), 403

    product = Product.query.get(product_id)

    if not product:
        return jsonify({
            "error": "Product not found"
        }), 404

    return jsonify(product.to_dict()), 200





# Analysis
@products_bp.route("/employee-performance", methods=["GET"])
@jwt_required()
def employee_performance():
    user = User.query.get(int(get_jwt_identity()))

    if not (user.is_admin or user.is_receptionist):
        return jsonify({"error": "Access denied"}), 403


    period = request.args.get("period", "today")
    today = date.today()

    if period == "today":
        start_date = today
        end_date = today

    elif period == "week":
        start_date = today - timedelta(days=today.weekday())
        end_date = today

    elif period == "month":
        start_date = today.replace(day=1)
        end_date = today
    else:
        return jsonify({"error": "Invalid period"}), 400

    # Subquery filtered bookings
    filtered_bookings = (
        db.session.query(Booking)
        .filter(Booking.booking_date.between(start_date, end_date))
        .subquery()
    )

    # Main aggregation query (EXCLUDING receptionist users)
    results = (
        db.session.query(
            Employee.id,
            Employee.full_name,
            Employee.employee_profile_picture,
            func.count(filtered_bookings.c.id).label("total_appointments"),
            func.sum(
                case(
                    (filtered_bookings.c.status == "completed", 1),
                    else_=0
                )
            ).label("completed"),
            func.coalesce(
                func.sum(
                    case(
                        (
                            filtered_bookings.c.status == "completed",
                            filtered_bookings.c.price
                        ),
                        else_=0
                    )
                ),
                0
            ).label("total_revenue")
        )
        # JOIN User to exclude receptionist
        .join(User, Employee.user_id == User.id)
        .outerjoin(
            filtered_bookings,
            Employee.id == filtered_bookings.c.employee_id
        )
        .filter(
            User.is_receptionist == False,
            User.is_beautician == True   # ensure only service providers
        )
        .group_by(Employee.id)
        .all()
    )

    # Calculate overall totals
    total_revenue_all = sum(float(r.total_revenue or 0) for r in results)
    total_appointments_all = sum(r.total_appointments for r in results)
    total_completed_all = sum(r.completed or 0 for r in results)

    # Unique clients served (completed only, excluding receptionist bookings)
    total_clients = (
        db.session.query(func.count(func.distinct(Booking.user_id)))
        .join(Employee, Booking.employee_id == Employee.id)
        .join(User, Employee.user_id == User.id)
        .filter(
            Booking.booking_date.between(start_date, end_date),
            Booking.status == "completed",
            User.is_receptionist == False,
            User.is_beautician == True
        )
        .scalar()
    )

    employees_data = []

    for r in results:
        revenue = float(r.total_revenue or 0)

        contribution = (
            (revenue / total_revenue_all) * 100
            if total_revenue_all > 0 else 0
        )

        employees_data.append({
            "employee_id": r.id,
            "employee_name": r.full_name,
            "avatar": r.employee_profile_picture,
            "total_appointments": r.total_appointments,
            "completed": int(r.completed or 0),
            "total_revenue": revenue,
            "contribution_percent": round(contribution, 2)
        })

    return jsonify({
        "period": period,
        "summary": {
            "total_clients": total_clients or 0,
            "total_appointments": total_appointments_all,
            "completed": total_completed_all,
            "total_revenue": total_revenue_all
        },
        "employees": employees_data
    })
