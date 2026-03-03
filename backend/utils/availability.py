from datetime import datetime, timedelta
from sqlalchemy import and_, or_

def is_employee_available(employee, booking_date, start_time, end_time, service=None):

    # 1. Check if employee is active
    if not employee.is_active:
        return False

    # 2. Check if employee works on this day
    weekday = booking_date.weekday()  # 0=Monday, 6=Sunday
    try:
        work_days = [int(d) for d in employee.work_days.split(",") if d.strip()]
    except (ValueError, AttributeError):
        return False
    
    if weekday not in work_days:
        return False

    # 3. Check if booking fits within employee's working hours
    if start_time < employee.work_start or end_time > employee.work_end:
        return False

    # 4. Check skill match (if service provided)
    if service is not None:
        # Check if employee has this service in their skills
        has_skill = any(skill.id == service.id for skill in employee.skills)
        if not has_skill:
            return False

    # 5. Check for overlapping bookings
    # Import here to avoid circular imports
    from models import Booking
    
    overlapping_booking = Booking.query.filter(
        Booking.employee_id == employee.id,
        Booking.booking_date == booking_date,
        Booking.status.in_(["confirmed", "in_progress"]),
        or_(
            # New booking starts during an existing booking
            and_(Booking.start_time <= start_time, Booking.end_time > start_time),
            # New booking ends during an existing booking
            and_(Booking.start_time < end_time, Booking.end_time >= end_time),
            # New booking completely contains an existing booking
            and_(Booking.start_time >= start_time, Booking.end_time <= end_time),
        )
    ).first()

    if overlapping_booking:
        return False

    return True



# def auto_assign_employee(service, booking_date, start_time, end_time):
#     employees = service.employees  # only skilled employees

#     for employee in employees:
#         if is_employee_available(employee, service, booking_date, start_time, end_time):
#             return employee

#     return None



def monitor_overdue_services():
    now = datetime.utcnow()

    overdue_bookings = Booking.query.filter(
        Booking.status == "in_progress",
        Booking.end_time < now.time()
    ).all()

    for booking in overdue_bookings:
        # Send notification
        notify_employee_overdue(booking)

        # Optional: auto-complete after grace period
        grace_minutes = 15
        overdue_limit = datetime.combine(
            booking.booking_date, booking.end_time
        ) + timedelta(minutes=grace_minutes)

        if now > overdue_limit:
            booking.status = "completed"
            db.session.commit()
