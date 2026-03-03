from models import Booking,db, Employee, Service, User
from flask import jsonify,request, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.availability import is_employee_available
from utils.constants import SALON_CLOSE, SALON_OPEN, TIME_BLOCKS, BUFFER_MINUTES, RESCHEDULE_HOURS_BEFORE
from datetime import datetime, date, timedelta
from utils.slots import generate_service_slots, categorize_slot
from flask_mail import  Message
from app import mail
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import io
from .receipt import generate_receipt_pdf
from sqlalchemy.orm import joinedload
from decorator import beautician_required
# from decorator import admin_required


booking_bp = Blueprint("booking_bp", __name__)


@booking_bp.route("/book", methods=["POST"])
@jwt_required()
def create_booking():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    # Validate required fields
    required_fields = ["service_id", "date", "start_time"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    service_id = data["service_id"]
    date_str = data["date"]
    start_str = data["start_time"]
    preferred_employee_id = data.get("employee_id")  # Optional

    # Parse and validate date/time
    try:
        booking_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        start_time = datetime.strptime(start_str, "%H:%M").time()
    except ValueError:
        return jsonify({"error": "Invalid date or time format. Use YYYY-MM-DD and HH:MM"}), 400

    # Validate booking is not in the past
    if booking_date < datetime.today().date():
        return jsonify({"error": "Cannot book appointments in the past"}), 400
    
    if booking_date == date.today() and start_time < datetime.now().time():
        return jsonify({"error": "Cannot book appointments in the past"}), 400

    # Get service details
    service = Service.query.get_or_404(service_id)
    duration = service.duration_minutes

    # Calculate end time (service duration only, no buffer in stored time)
    start_datetime = datetime.combine(booking_date, start_time)
    end_datetime = start_datetime + timedelta(minutes=duration)
    end_time = end_datetime.time()
    
    # Calculate end time with buffer for availability checking
    end_with_buffer = (start_datetime + timedelta(minutes=duration + BUFFER_MINUTES)).time()

    # Validate booking is within salon operating hours
    if start_time < SALON_OPEN:
        return jsonify({"error": f"Salon opens at {SALON_OPEN.strftime('%H:%M')}"}), 400
    
    if end_time > SALON_CLOSE:
        return jsonify({"error": f"Salon closes at {SALON_CLOSE.strftime('%H:%M')}. This appointment would exceed closing time."}), 400

    # Helper to check employee availability
    def check_employee_availability(emp):
        """
        Check if employee is available for the requested slot + buffer time
        CRITICAL: Pass the service object, not service_id
        """
        # Call is_available with the correct parameters
        # The method signature is: is_available(self, booking_date, start_time, end_time, service=None)
        return emp.is_available(
            booking_date=booking_date,
            start_time=start_time,
            end_time=end_with_buffer,  # Use buffer time for checking
            service=service  # Pass the service object
        )

    assigned_employee = None

    # Try to book with preferred employee first
    if preferred_employee_id:
        preferred_emp = Employee.query.get(preferred_employee_id)
        if preferred_emp and check_employee_availability(preferred_emp):
            assigned_employee = preferred_emp

    # If no preferred employee or they're unavailable, find any available employee
    if not assigned_employee:
        # Get all employees who have this service as a skill
        employees = Employee.query.filter(
            Employee.skills.any(id=service.id),
            Employee._is_active == True  # Pre-filter for active employees
        ).order_by(db.func.random()).all()  # Random distribution for fairness

        for emp in employees:
            if check_employee_availability(emp):
                assigned_employee = emp
                break

    # If no employee is available, return error
    if not assigned_employee:
        return jsonify({
            "error": "No employee available for this time slot",
            "suggestion": "Please try a different time"
        }), 409

    # Create the booking
    try:
        booking = Booking(
            user_id=user_id,
            service_id=service.id,
            employee_id=assigned_employee.id,
            booking_date=booking_date,
            start_time=start_time,
            end_time=end_time,  # Store actual service end time, not with buffer
            price=service.price,  # CRITICAL: Set the price from service
            status="confirmed"
        )
        db.session.add(booking)
        db.session.commit()

        # Send email confirmation AFTER successful commit
        try:
            send_booking_confirmation_email(user_id, booking, service, assigned_employee)
        except Exception as e:
            # Log the error but don't fail the booking
            print(f"Failed to send confirmation email: {str(e)}")

        return jsonify({
            "success": "Booking confirmed",
            "booking_id": booking.id,
            "employee_id": assigned_employee.id,
            "employee_name": assigned_employee.full_name,
            "service_name": service.title,
            "service_id": service.id,
            "date": booking_date.strftime("%Y-%m-%d"),
            "start_time": start_time.strftime("%H:%M"),
            "end_time": end_time.strftime("%H:%M"),
            "duration_minutes": duration,
            "price": float(service.price)
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create booking: {str(e)}"}), 500


def send_booking_confirmation_email(user_id, booking, service, employee):
    """Send booking confirmation email to user"""
    try:
        user = User.query.get(user_id)
        if not user or not user.email:
            print(f"No email found for user {user_id}")
            return

        msg = Message(
            subject="Booking Confirmation - Your Appointment",
            recipients=[user.email],
            body=f"""
Hello {user.username or 'there'},

Your booking has been confirmed!

Service: {service.title}
Date: {booking.booking_date.strftime('%A, %B %d, %Y')}
Time: {booking.start_time.strftime('%I:%M %p')} - {booking.end_time.strftime('%I:%M %p')}
Duration: {service.duration_minutes} minutes
Employee: {employee.full_name}
Price: ${booking.price}

Please arrive 5-10 minutes before your appointment time.

If you need to cancel or reschedule, please contact us at least 24 hours in advance.

Thank you for booking with us!
We look forward to seeing you.

Best regards,
Your Salon Team
            """.strip()
        )
        mail.send(msg)
        print(f"Confirmation email sent to {user.email}")
        
    except Exception as e:
        # Log but don't raise - email failure shouldn't fail the booking
        print(f"Error sending confirmation email: {str(e)}")



@booking_bp.route("/bookings/preview", methods=["GET"])
@jwt_required(optional=True)
def booking_preview():
    # Get query parameters from frontend
    service_id = request.args.get("service_id", type=int)
    date_str = request.args.get("date")  # YYYY-MM-DD
    start_time_str = request.args.get("start_time")  # HH:MM
    employee_id = request.args.get("employee_id", type=int)  # optional

    if not all([service_id, date_str, start_time_str]):
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        booking_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        start_time = datetime.strptime(start_time_str, "%H:%M").time()
    except ValueError:
        return jsonify({"error": "Invalid date or time format"}), 400

    service = Service.query.get_or_404(service_id)

    # Calculate end time (with buffer)
    BUFFER_MINUTES = 10
    start_datetime = datetime.combine(booking_date, start_time)
    end_datetime = start_datetime + timedelta(minutes=service.duration_minutes + BUFFER_MINUTES)
    end_time = end_datetime.time()

    # Determine employee
    selected_employee = None
    if employee_id:
        selected_employee = Employee.query.get(employee_id)
        if not selected_employee or service not in selected_employee.skills:
            return jsonify({"error": "Selected employee cannot perform this service"}), 400
    else:
        # Optional: auto-pick one available employee for display
        available = Employee.query.filter(
            Employee.skills.any(id=service.id)
        ).all()
        if available:
            selected_employee = available[0]  # or pick randomly

    # # You might have a Location model — adjust accordingly
    # # For now, assuming salon has one main location
    # location_name = "Poplar Beauty Palace"
    # location_address = "1 Poplar Street, Noordwyk, Midrand, South Africa"

    # Build response
    preview = {
        "service": {
            "title": service.title,
            "duration": f"{service.duration_minutes}min",
            "price": f"R{service.price:.2f}" if hasattr(service, 'price') else "R280.00"
        },
        "date_time": {
            "date": booking_date.strftime("%B %d, %Y"),  # e.g., December 17, 2025
            "day": booking_date.strftime("%A"),         # e.g., Wednesday
            "start_time": start_time.strftime("%I:%M %p"),
            "end_time": end_time.strftime("%I:%M %p"),
            "display": f"{booking_date.strftime('%B %d, %Y')} • {start_time.strftime('%I:%M %p')} - {end_time.strftime('%I:%M %p')}"
        },
        "employee": {
            "name": selected_employee.full_name if selected_employee else "Any available stylist",
            "id": selected_employee.id if selected_employee else None
        },
        "total_price": f"R{service.price:.2f}" if hasattr(service, 'price') else "R280.00"
    }

    return jsonify(preview), 200




# All Booking 
@booking_bp.route("/bookings", methods=["GET"])
@jwt_required()
def get_user_bookings():
    """Get all bookings for the current user"""
    user_id = int(get_jwt_identity())

    status_filter = request.args.get("status")  

    
    query = Booking.query.filter_by(user_id=user_id)
  
    if status_filter:
        query = query.filter_by(status=status_filter)
    
    bookings = query.order_by(Booking.booking_date.desc(), Booking.start_time.desc()).all()
    
    
    return jsonify([{
        "id": b.id,
        "service_name": b.service.title,
        "service_id":b.service.id,
        "duration":b.service.duration_minutes, 
        "employee_name": b.employee.full_name,
        "date": b.booking_date.strftime("%Y-%m-%d"),
        "start_time": b.start_time.strftime("%H:%M"),
        "end_time": b.end_time.strftime("%H:%M"),
        "status": b.status,
        "price": float(b.price)
    } for b in bookings]), 200




# Cacellation
@booking_bp.route("/bookings/cancel/<int:booking_id>", methods=["PATCH"])
@jwt_required()
def cancel_booking(booking_id):
    user_id = int(get_jwt_identity())

    booking = Booking.query.get_or_404(booking_id)

    if booking.user_id != user_id:
        return jsonify({"error": "You do not have permission to cancel this booking"}), 403

    if booking.status not in ["confirmed", "rescheduled"]:
        return jsonify({"error": "This booking cannot be cancelled"}), 400

    booking_start = datetime.combine(
        booking.booking_date,
        booking.start_time
    )

    now = datetime.utcnow()

    if (booking_start - now).total_seconds() < 24 * 3600:
        return jsonify({
            "error": "Cannot cancel within 24 hours of the appointment"
        }), 403

    booking.status = "cancelled"
    db.session.commit()

    customer = User.query.get(user_id)
    employee = booking.employee
    service = booking.service

    if customer and customer.email:
        send_cancellation_email_to_customer(
            customer, booking, service, employee
        )

    if employee.user and employee.user.email:
        send_cancellation_email_to_employee(
            employee.user, booking, service, customer
        )

    return jsonify({
        "success": "Booking cancelled successfully",
        "booking_id": booking.id,
        "cancelled_date": booking.booking_date.strftime("%Y-%m-%d"),
        "cancelled_time": f"{booking.start_time.strftime('%H:%M')} - {booking.end_time.strftime('%H:%M')}"
    }), 200



def send_cancellation_email_to_customer(customer, booking, service, employee):
    msg = Message(
        subject="Your Booking Has Been Cancelled",
        recipients=[customer.email],
        body=f"""
        Hello {customer.username or 'there'},

        Your appointment has been cancelled as requested.

        Service: {service.title}
        Date: {booking.booking_date.strftime('%Y-%m-%d')}
        Time: {booking.start_time.strftime('%H:%M')} - {booking.end_time.strftime('%H:%M')}
        Employee: {employee.full_name}

        We're sorry to miss you this time. Feel free to book a new appointment whenever you're ready!

        Best regards,
        Your Salon/Team
        Contact: support@yourdomain.com | +1 (555) 123-4567
        """
    )
    mail.send(msg)

def send_cancellation_email_to_employee(employee_user, booking, service, customer):
    msg = Message(
        subject="Appointment Cancelled",
        recipients=[employee_user.email],
        body=f"""
        Hello {employee_user.username or 'there'},

        A booking has been cancelled:

        Service: {service.title}
        Customer: {customer.username or 'Client'}
        Date: {booking.booking_date.strftime('%Y-%m-%d')}
        Time: {booking.start_time.strftime('%H:%M')} - {booking.end_time.strftime('%H:%M')}

        The time slot is now free.

        Best regards,
        Your Salon/Team
        """
    )
    mail.send(msg)



# Slots
@booking_bp.route("/available-slots", methods=["GET"])
def available_slots():
    service_id = request.args.get("service_id")
    date_str = request.args.get("date")

    # Validate required parameters
    if not service_id or not date_str:
        return jsonify({"error": "service_id and date are required"}), 400

    # Get service
    service = Service.query.get(service_id)

    if not service:
        return jsonify({"error": "Service not found"}), 404
    
    # Validate and parse date
    try:
        booking_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    # Don't allow booking in the past
    if booking_date < date.today():
        return jsonify({"error": "Cannot check slots for past dates"}), 400

    # Generate all possible slots based on service duration
    all_slots = generate_service_slots(service.duration_minutes)

    # Get employees who can perform this service
    employees = Employee.query.filter(
        Employee.skills.any(id=service.id),
        Employee._is_active == True  # Pre-filter for active employees
    ).all()

    if not employees:
        return jsonify({
            "error": "No employees available for this service",
            "slots": {"morning": [], "afternoon": [], "evening": []}
        }), 404

    # Organize available slots by time period
    available_slots = {
        "morning": [],
        "afternoon": [],
        "evening": []
    }

    # Check each slot for availability
    for start_time, end_time in all_slots:
        # Calculate end time with buffer for availability checking
        start_datetime = datetime.combine(booking_date, start_time)
        end_with_buffer = (start_datetime + timedelta(
            minutes=service.duration_minutes + BUFFER_MINUTES
        )).time()

        # Check if ANY employee is available for this slot
        slot_available = False
        available_employee = None
        
        for emp in employees:
            # CRITICAL: Pass the service object to is_available
            if emp.is_available(
                booking_date=booking_date,
                start_time=start_time,
                end_time=end_with_buffer,  # Use buffer time for checking
                service=service  # Pass service object, not ID
            ):
                slot_available = True
                available_employee = emp
                break  # One available employee is enough

        # If slot is available, add it to the appropriate time period
        if slot_available:
            period = categorize_slot(start_time)
            available_slots[period].append({
                "start_time": start_time.strftime("%H:%M"),
                "end_time": end_time.strftime("%H:%M"),  # Return actual service end, not with buffer
                "employee_id": available_employee.id,
                "employee_name": available_employee.full_name
            })

    # Return response with metadata
    return jsonify({
        "date": date_str,
        "service_id": service_id,
        "service_title": service.title,
        "duration_minutes": service.duration_minutes,
        "price": float(service.price),
        "slots": available_slots,
        "total_available": (
            len(available_slots["morning"]) +
            len(available_slots["afternoon"]) +
            len(available_slots["evening"])
        )
    }), 200







# Complete
@booking_bp.route("/bookings/complete/<int:booking_id>", methods=["PATCH"])
@jwt_required()
def complete_service(booking_id):
    current_user_id = int(get_jwt_identity())
    user = User.query.get(int(get_jwt_identity()))

    if not user.is_beautician:
        return jsonify({"error": "Access denied"}), 403 

    booking = Booking.query.get_or_404(booking_id)

    # Only allow if booking is in progress
    if booking.status != "in_progress":
        return jsonify({"error": "Booking is not in progress"}), 400

    # Only assigned employee can complete
    if not booking.employee or booking.employee.user_id != current_user_id:
        return jsonify({"error": "You are not authorized to complete this booking"}), 403

    # Update booking
    booking.status = "completed"
    booking.completed_by = booking.employee.full_name
    booking.completed_at = datetime.utcnow()

    db.session.commit()

    # Get customer
    customer = booking.user  # assumes relationship exists

    # Generate PDF receipt
    pdf_buffer = generate_receipt_pdf(booking, customer)

    # Send receipt email
    try:
        send_receipt_email(customer, booking, pdf_buffer)
    except Exception as e:
        # Log error but do NOT fail completion
        print("Receipt email failed:", str(e))

    return jsonify({
        "success": "Service completed successfully",
        "booking_id": booking.id,
        "receipt_sent": True,
        "completed_at": booking.completed_at.isoformat(),
    }), 200





def send_receipt_email(user, booking, pdf_buffer):
    msg = Message(
        subject="Your Service Receipt – Poplar Beauty Place",
        recipients=[user.email],
    )

    msg.body = f"""
Hi {user.username},

Thank you for choosing Poplar Beauty Place.

Your service "{booking.service.title}" has been completed successfully.
Please find your receipt attached.

Service: {booking.service.title}
Employee: {booking.employee.full_name}
Date: {booking.booking_date.strftime('%d %b %Y')} | Time: {booking.start_time.strftime('%H:%M')}
Amount Paid: R{booking.price:.2f}

We look forward to serving you again.

— Poplar Beauty Place
"""

    msg.attach(
        filename=f"receipt-BK{booking.id:06d}.pdf",
        content_type="application/pdf",
        data=pdf_buffer.getvalue(),
    )

    mail.send(msg)





# Started
@booking_bp.route("/bookings/start/<int:booking_id>", methods=["PATCH"])
@jwt_required()
def start_service(booking_id):
    current_user_id = int(get_jwt_identity())
    print("JWT USER:", current_user_id)
    user = User.query.get(get_jwt_identity())
    print("IS BEAUTICIAN:", user.is_beautician)

    if not user.is_beautician:
        return jsonify({"error": "Access denied"}), 403  

    booking = Booking.query.get_or_404(booking_id)
    print("BOOKING EMPLOYEE:", booking.employee.user_id)

    # Only allow if currently confirmed
    if booking.status != "confirmed":
        return jsonify({"error": "Booking is not confirmed and cannot be started"}), 400

    # Only the assigned employee can start the service
    if not booking.employee or booking.employee.user_id != current_user_id:
        return jsonify({"error": "You are not authorized to start this booking"}), 403

    # Check if the appointment time has arrived (prevent starting too early)
    now = datetime.now()
    appointment_start = datetime.combine(booking.booking_date, booking.start_time)
    if now < appointment_start - timedelta(minutes=15):  # e.g., allow 15 min early
        return jsonify({"error": "Cannot start service too early"}), 400

    # Update status
    booking.status = "in_progress"
    booking.started_at = datetime.utcnow()  # Nice to track when it actually started

    db.session.commit()

    return jsonify({
        "success": "Service started successfully",
        "booking_id": booking.id,
        "service": booking.service.title,
        "customer": booking.user.username if booking.user else "Unknown",
        "started_at": booking.started_at.isoformat()
    }), 200


# Reschedule
@booking_bp.route("/bookings/reschedule/<int:booking_id>", methods=["PATCH"])
@jwt_required()
def reschedule_booking(booking_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()

    # Fetch the booking
    booking = Booking.query.get_or_404(booking_id)

    # Security: Only owner can reschedule
    if booking.user_id != user_id:
        return jsonify({"error": "You do not have permission to reschedule this booking"}), 403

    # Only confirmed bookings can be rescheduled
    if booking.status != "confirmed":
        return jsonify({"error": "This booking cannot be rescheduled"}), 400

    # 24-hour deadline
    booking_start = datetime.combine(booking.booking_date, booking.start_time)
    now = datetime.now()
    if (booking_start - now).total_seconds() < 24 * 3600:
        return jsonify({"error": "Cannot reschedule within 24 hours of the appointment"}), 403

    # Required fields
    required_fields = ["date", "start_time"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields (date and start_time)"}), 400

    try:
        new_date = datetime.strptime(data["date"], "%Y-%m-%d").date()
        new_start_time = datetime.strptime(data["start_time"], "%H:%M").time()
    except ValueError:
        return jsonify({"error": "Invalid date or time format"}), 400

    # Service and buffer
    service = booking.service
    BUFFER_MINUTES = 10

    new_start_datetime = datetime.combine(new_date, new_start_time)
    new_end_datetime = new_start_datetime + timedelta(minutes=service.duration_minutes + BUFFER_MINUTES)
    new_end_time = new_end_datetime.time()

    # Optional preferred employee
    preferred_employee_id = data.get("employee_id")

    # Start transaction
    # with db.session.begin():
    available_employees = []

    # Try preferred employee first
    if preferred_employee_id:
        preferred_emp = Employee.query.get(preferred_employee_id)
        if preferred_emp and service in preferred_emp.skills:
            if preferred_emp.is_available(new_date, new_start_time, new_end_datetime.time()):
                available_employees.append(preferred_emp)

    # If no preferred or unavailable, find any available
    if not available_employees:
        qualified_employees = Employee.query.filter(
            Employee.skills.any(id=service.id)
        ).order_by(db.func.random()).all()

        for emp in qualified_employees:
            if emp.is_available(new_date, new_start_time, new_end_datetime.time()):
                available_employees.append(emp)

    if not available_employees:
        return jsonify({"error": "No available employee for the requested time"}), 409

    # Pick the first available
    selected_employee = available_employees[0]

    # Update booking
    booking.booking_date = new_date
    booking.start_time = new_start_time
    booking.end_time = new_end_time
    booking.employee_id = selected_employee.id
    booking.status = "rescheduled"

    booking.reminder_sent = False

    db.session.commit()

    # Fetch user (customer)
    customer = User.query.get(user_id)

    # Send email to CUSTOMER
    try:
        if customer and customer.email:
            send_reschedule_email_to_customer(
                customer, booking, service, selected_employee, preferred_employee_id
            )
    except Exception as e:
        print("Email error (customer):", e)

    # Send email to EMPLOYEE
    try:
        if selected_employee.user and selected_employee.user.email:
            send_reschedule_email_to_employee(
                selected_employee.user, booking, service, customer
            )
    except Exception as e:
        print("Email error (employee):", e)

    return jsonify({
        "success": "Booking rescheduled successfully",
        "booking_id": booking.id,
        "new_date": new_date.strftime("%Y-%m-%d"),
        "new_start_time": new_start_time.strftime("%H:%M"),
        "new_end_time": new_end_time.strftime("%H:%M"),
        "employee": selected_employee.full_name,
        "employee_id": selected_employee.id
    }), 200


# Email to customer (user)
def send_reschedule_email_to_customer(customer, booking, service, employee, preferred_employee_id):
    is_preferred = preferred_employee_id and int(preferred_employee_id) == employee.id

    msg = Message(
        subject="Your Booking Has Been Rescheduled",
        recipients=[customer.email],
        body=f"""
        Hello {customer.username or 'there'},

        Your appointment has been successfully rescheduled!

        Service: {service.title}
        New Date: {booking.booking_date.strftime('%Y-%m-%d')}
        New Time: {booking.start_time.strftime('%H:%M')} - {booking.end_time.strftime('%H:%M')}
        Employee: {employee.full_name} {'(your preferred employee)' if is_preferred else '(auto-assigned)'}

        Thank you for booking with us!
        Best regards,
        Your Salon/Team
        """
    )
    mail.send(msg)


# Email to employee (using employee.user)
def send_reschedule_email_to_employee(employee_user, booking, service, customer):
    msg = Message(
        subject="Appointment Rescheduled",
        recipients=[employee_user.email],
        body=f"""
        Hello {employee_user.username or 'there'},

        A booking for your services has been rescheduled:

        Service: {service.title}
        Customer: {customer.username or 'Client'}
        New Date: {booking.booking_date.strftime('%Y-%m-%d')}
        New Time: {booking.start_time.strftime('%H:%M')} - {booking.end_time.strftime('%H:%M')}

        Please ensure you're available at this time.
        Thank you for your great work!

        Best regards,
        Your Salon/Team
        """
    )
    mail.send(msg)





# Fetch Book
@booking_bp.route("/bookings/<int:booking_id>", methods=["GET"])
@jwt_required()
def get_booking_details(booking_id):
    booking = Booking.query.get_or_404(booking_id)

    return jsonify({
        "booking": {
            "id": booking.id,
            "date": booking.booking_date.isoformat(),
            "start_time": booking.start_time.strftime("%H:%M"),
            "end_time": booking.end_time.strftime("%H:%M"),
            "status": booking.status,
            "price": float(booking.price),
        },
        "client": {
            "id": booking.user.id,
            "name": booking.user.username,
            "allergies": [
                {"id": a.id, "name": a.name}
                for a in booking.user.allergies
            ]
        }
    }), 200




# Fetch all Bookings
@booking_bp.route("/beautician/bookings", methods=["GET"])
@jwt_required()
def get_beautician_bookings():
    user = User.query.get_or_404(int(get_jwt_identity()))

    if not (user.is_beautician or user.is_admin or user.is_receptionist):
        return jsonify({"error": "Access denied"}), 403

    if not user.employee:
        return jsonify({"error": "No employee record found"}), 403

    employee_id = user.employee.id

    bookings = (
        Booking.query
        .filter(Booking.employee_id == employee_id)
        .options(
            joinedload(Booking.user).joinedload(User.allergies),
            joinedload(Booking.service)
        )
        .order_by(Booking.booking_date.desc(), Booking.start_time.asc())
        .all()
    )

    response = [
        {
            "booking": {
                "id": b.id,
                "date": b.booking_date.isoformat(),
                "start_time": b.start_time.strftime("%H:%M") if b.start_time else None,
                "end_time": b.end_time.strftime("%H:%M") if b.end_time else None,
                "status": b.status,
                "price": float(b.price or 0),
            },
            "service": {
                "id": b.service.id,
                "title": b.service.title,
                "duration_minutes": b.service.duration_minutes,
                "price": float(b.service.price or 0),
            },
            "client": {
                "id": b.user.id,
                "username": b.user.username,
                "profile_picture": b.user.profile_picture,
                "allergies": [{"id": a.id, "name": a.name} for a in (b.user.allergies or [])],
            },
        }
        for b in bookings
    ]

    return jsonify(response), 200
