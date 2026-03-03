from models import db, Employee, Service, User
from flask import jsonify,request, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.constants import DAY_MAP, DAY_NAME_TO_NUM
from datetime import time, datetime
from decorator import admin_required,beautician_required, receptionist_required


employee_bp = Blueprint("employee_bp", __name__)

# Added Employee
@employee_bp.route("/employee", methods=["POST"])
@jwt_required()
@admin_required
def add_employee():
    data = request.json
    username = data.get("username")
    full_name = data.get("full_name")
    work_start_str = data.get("work_start")
    work_end_str = data.get("work_end")
    work_days = data.get("work_days", [])        # List of day names
    skills_names = data.get("skills", [])             # Existing service names
    other_skills_list = data.get("other_skills", [])  # Other skills
    override_active = data.get("override_active")
    employee_profile_picture = data.get('profile_picture', "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=")
    is_active = data.get("is_active", True)
    role = data.get("role") 

    # Validate required fields
    if not all([full_name, work_start_str, work_end_str, work_days, username]):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Validate role
    if role not in ["beautician", "receptionist"]:
        return jsonify({"error": "Role must be either 'beautician' or 'receptionist'"}), 400


    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({"error": "User with this username not found"}), 404

    if user.employee:
        return jsonify({"error": "This user is already an employee"}), 400
    
    user.profile_picture = employee_profile_picture


    # Convert times
    try:
        work_start = datetime.strptime(work_start_str, "%H:%M").time()
        work_end = datetime.strptime(work_end_str, "%H:%M").time()
    except ValueError:
        return jsonify({"error": "Invalid time format, use HH:MM"}), 400

    # Convert day names → numbers for storage
    try:
        work_days_numbers = [DAY_NAME_TO_NUM[day] for day in work_days]
    except KeyError as e:
        return jsonify({"error": f"Invalid day name: {str(e)}"}), 400

    # Create employee
    employee = Employee(
        user_id=user.id,
        full_name=full_name,
        work_start=work_start,
        work_end=work_end,
        work_days=",".join(work_days_numbers),
        employee_profile_picture=employee_profile_picture,
        override_active=override_active,
        _is_active=is_active,
        other_skills=",".join(other_skills_list) if other_skills_list else None
    )

   # Assign skills only if beautician
    if role == "beautician" and skills_names:
        services = Service.query.filter(Service.title.in_(skills_names)).all()
        valid_titles = [s.title for s in services]
        invalid_skills = [name for name in skills_names if name not in valid_titles]

        if invalid_skills:
            return jsonify({
                "error": "Some service names are invalid",
                "invalid_services": invalid_skills
            }), 400

        employee.skills.extend(services)
    

    if role == "receptionist" and skills_names:
        return jsonify({"error": "Receptionists cannot have service skills"}), 400
    
    # THIS IS THE KEY PART: Set the appropriate role flag on the User
    if role == "beautician":
        user.is_beautician = True
    elif role == "receptionist":
        user.is_receptionist = True

    # Save
    try:
        db.session.add(employee)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create employee: {str(e)}"}), 500

    # Response
    employee_data = {
        "id": employee.id,
        "user_id": employee.user_id,
        "full_name": employee.full_name,
        "role": role,
        "work_start": employee.work_start.strftime("%H:%M"),
        "work_end": employee.work_end.strftime("%H:%M"),
        "work_days": [DAY_MAP[d] for d in employee.work_days.split(",") if d in DAY_MAP],
        "skills": [s.title for s in employee.skills] if role == "beautician" else [],
        "other_skills": employee.other_skills.split(",") if employee.other_skills else [],
        "is_active": employee.is_active,
        "profile_picture": employee.employee_profile_picture
    }

    return jsonify({"success": "Employee added successfully"}), 201



# Fetch Employee
@employee_bp.route("/employee-profile", methods=["GET"])
@jwt_required()
@beautician_required
def get_my_employee_profile():
    user_id = int(get_jwt_identity())

    employee = Employee.query.filter_by(user_id=user_id).first()
    if not employee:
        return jsonify({"error": "Employee profile not found"}), 404


    work_days_list = [DAY_MAP[d] for d in employee.work_days.split(",") if d in DAY_MAP]

    employee_data = {
        "id": employee.id,
        "full_name": employee.full_name,
        "work_start": employee.work_start.strftime("%H:%M"),
        "work_end": employee.work_end.strftime("%H:%M"),
        "work_days": work_days_list,
        "skills": [s.title for s in employee.skills],
        "other_skills": employee.other_skills.split(",") if employee.other_skills else [],
        "is_active": employee.is_active,
        "employee_profile_picture": employee.employee_profile_picture,
        "username": employee.user.username,
        "email": employee.user.email,
    }

    return jsonify({"employee": employee_data}), 200


# Update Employee
@employee_bp.route("/employees/<int:employee_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_employee(employee_id):
    data = request.json
    employee = Employee.query.get(employee_id)

    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    # Update full name
    full_name = data.get("full_name")
    if full_name:
        employee.full_name = full_name

    # Update working hours
    work_start_str = data.get("work_start")
    work_end_str = data.get("work_end")
    if work_start_str:
        try:
            employee.work_start = datetime.strptime(work_start_str, "%H:%M").time()
        except ValueError:
            return jsonify({"error": "Invalid work_start time format, use HH:MM"}), 400
    if work_end_str:
        try:
            employee.work_end = datetime.strptime(work_end_str, "%H:%M").time()
        except ValueError:
            return jsonify({"error": "Invalid work_end time format, use HH:MM"}), 400

    # Update working days (using day names)
    work_days_input = data.get("work_days")
    if work_days_input:
        try:
            work_days_numbers = [DAY_NAME_TO_NUM[day] for day in work_days_input]
            employee.work_days = ",".join(work_days_numbers)
        except KeyError as e:
            return jsonify({"error": f"Invalid day name: {str(e)}"}), 400

    # Update skills (existing services)
    skills_names = data.get("skills")
    if skills_names is not None:  # allow clearing skills with empty list
        services = Service.query.filter(Service.title.in_(skills_names)).all()
        valid_titles = [s.title for s in services]
        invalid_skills = [name for name in skills_names if name not in valid_titles]

        if invalid_skills:
            return jsonify({
                "error": "Some service names are invalid",
                "invalid_services": invalid_skills
            }), 400

        employee.skills = services  # replace current skills

    # Update other skills
    other_skills_list = data.get("other_skills")
    if other_skills_list is not None:  # allow clearing other skills
        employee.other_skills = ",".join(other_skills_list) if other_skills_list else None

    # Update active status
    if "is_active" in data:
        employee.is_active = bool(data["is_active"])
        employee.override_active = None  # optional but recommended

    if "override_active" in data:
        employee.override_active = (
            bool(data["override_active"])
            if data["override_active"] is not None
            else None
        )

    # Update profile picture
    if "employee_profile_picture" in data:
        new_picture = data["employee_profile_picture"]
        employee.employee_profile_picture = new_picture
        employee.user.profile_picture = new_picture

    db.session.commit()

    # Prepare response
    employee_data = {
        "id": employee.id,
        "full_name": employee.full_name,
        "work_start": employee.work_start.strftime("%H:%M"),
        "work_end": employee.work_end.strftime("%H:%M"),
        "work_days": [DAY_MAP[d] for d in employee.work_days.split(",") if d in DAY_MAP],
        "skills": [s.title for s in employee.skills],
        "other_skills": employee.other_skills.split(",") if employee.other_skills else [],
        "is_active": employee.is_active,
        "employee_profile_picture": employee.employee_profile_picture
    }

    return jsonify({"success": "Employee updated successfully"}), 200


# Delete 
@employee_bp.route("/employees/<int:employee_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_employee(employee_id):
    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    # Optional: check if employee has bookings
    if employee.bookings:
        return jsonify({
            "error": "Cannot delete employee with existing bookings"
        }), 400

    # Remove all skill associations
    employee.skills = []
    user = employee.user
    user.is_beautician = False
    user.is_receptionist=False


    # Delete employee
    db.session.delete(employee)
    db.session.commit()

    return jsonify({"success": "Employee deleted successfully"}), 200



# All Employees
@employee_bp.route("/employees", methods=["GET"])
@jwt_required()
def list_employees():
    user = User.query.get(int(get_jwt_identity()))

    # Check if user is admin OR receptionist
    if not (user.is_admin or user.is_receptionist):
        return jsonify({"error": "Access denied"}), 403

    employees = Employee.query.all()
    employees_data = []

    for employee in employees:
        employees_data.append({
            "id": employee.id,
            "full_name": employee.full_name,
            "username": employee.user.username,
            "email": employee.user.email,
            "work_start": employee.work_start.strftime("%H:%M"),
            "work_end": employee.work_end.strftime("%H:%M"),
            "work_days": [DAY_MAP[d] for d in employee.work_days.split(",") if d in DAY_MAP],
            "skills": [s.title for s in employee.skills],
            "other_skills": employee.other_skills.split(",") if employee.other_skills else [],
            "is_active": employee.is_active,
            "employee_profile_picture": employee.employee_profile_picture
        })

    return jsonify({"employees": employees_data}), 200


# Fetch employee id 
@employee_bp.route("/employee-profile/<int:employee_id>", methods=["GET"])
@jwt_required()
@admin_required
def get_employee_profile(employee_id):
    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({"error": "Employee profile not found"}), 404

    work_days_list = [
        DAY_MAP[d] for d in employee.work_days.split(",")
        if d in DAY_MAP
    ]

    employee_data = {
        "id": employee.id,
        "full_name": employee.full_name,
        "work_start": employee.work_start.strftime("%H:%M"),
        "work_end": employee.work_end.strftime("%H:%M"),
        "work_days": work_days_list,
        "skills": [s.title for s in employee.skills],
        "other_skills": employee.other_skills.split(",") if employee.other_skills else [],
        "is_active": employee.is_active,
        "employee_profile_picture": employee.employee_profile_picture,
        "username": employee.user.username,
        "email": employee.user.email,
    }

    return jsonify({"employee": employee_data}), 200


