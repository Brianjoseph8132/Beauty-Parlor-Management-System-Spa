from models import db, Employee, Attendance, User
from flask import jsonify, request, Blueprint
from flask_jwt_extended import jwt_required
from utils.constants import SALON_OPEN, GRACE_PERIOD_END, SALON_CLOSE
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
from decorator import receptionist_required, admin_required
from datetime import timedelta
import calendar
from sqlalchemy import func, case
from backports.zoneinfo import ZoneInfo

attendance_bp = Blueprint("attendance_bp", __name__)


def is_employee_working_today(employee, target_date=None):
    target_date = target_date or date.today()
    return str(target_date.weekday()) in employee.work_days.split(",")


def calculate_worked_hours(check_in, check_out):
    if not check_in or not check_out:
        return 0.0

    if check_out < check_in:
        return 0.0

    duration = check_out - check_in
    hours = duration.total_seconds() / 3600
    return round(hours, 2)

NAIROBI_TZ = ZoneInfo("Africa/Nairobi")

UTC_TZ = ZoneInfo("UTC")

def to_nairobi(dt):
    """Convert UTC datetime to Nairobi time (safe)"""
    if not dt:
        return None
    return dt.astimezone(NAIROBI_TZ)


@attendance_bp.route("/attendance/check-in/<int:employee_id>", methods=["POST"])
@jwt_required()
def check_in(employee_id):
    user = User.query.get(int(get_jwt_identity()))

    # Check if user is admin OR receptionist
    if not (user.is_admin or user.is_receptionist):
        return jsonify({"error": "Access denied"}), 403
    
    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404
    
    if not employee.is_active:
        return jsonify({
            "error": "Employee is currently inactive"
        }), 400

    today = datetime.now(NAIROBI_TZ).date()

    # Not scheduled to work
    if not is_employee_working_today(employee, today):
        return jsonify({
            "error": "Employee is not scheduled to work today"
        }), 400

    now_na = datetime.now(NAIROBI_TZ)  # current Nairobi time
    now_time = now_na.time()  # for comparison

    # Salon closed
    if now_time < SALON_OPEN:
        return jsonify({
            "error": "Salon opens at 8:00 AM"
        }), 400

    attendance = Attendance.query.filter_by(
        employee_id=employee_id,
        date=today
    ).first()

    if attendance and attendance.check_in:
        return jsonify({"error": "Employee already checked in"}), 400

    if not attendance:
        attendance = Attendance(
            employee_id=employee_id,
            date=today
        )
        db.session.add(attendance)

    attendance.check_in = now_na.astimezone(ZoneInfo("UTC"))

    # Grace period logic (FINAL)
    attendance.status = (
        "Present"
        if now_time <= GRACE_PERIOD_END
        else "Late"
    )

    db.session.commit()

    return jsonify({
        "message": "Check-in successful",
        "employee": employee.full_name,
        "check_in": to_nairobi(attendance.check_in).strftime("%H:%M"),
        "status": attendance.status
    }), 200





@attendance_bp.route("/attendance/check-out/<int:employee_id>", methods=["POST"])
@jwt_required()
def check_out(employee_id):
    user = User.query.get(int(get_jwt_identity()))

    # Check if user is admin OR receptionist
    if not (user.is_admin or user.is_receptionist):
        return jsonify({"error": "Access denied"}), 403

    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404
    
    if not employee.is_active:
        return jsonify({"error": "Employee is currently inactive"}), 400

    today = datetime.now(NAIROBI_TZ).date()

    if not is_employee_working_today(employee, today):
        return jsonify({"error": "Employee is not scheduled to work today"}), 400

    attendance = Attendance.query.filter_by(
        employee_id=employee_id,
        date=today
    ).first()

    if not attendance or not attendance.check_in:
        return jsonify({"error": "Employee has not checked in"}), 400

    if attendance.check_out:
        return jsonify({"error": "Employee already checked out"}), 400

    now_na = datetime.now(NAIROBI_TZ)
    now_time = now_na.time()

    # Auto-close at salon closing time
    if now_time > SALON_CLOSE:
        now_na = datetime.combine(today, SALON_CLOSE, tzinfo=NAIROBI_TZ)

    attendance.check_out = now_na.astimezone(ZoneInfo("UTC"))

    # Calculate worked hours (convert back to Nairobi time for calculation)
    attendance.worked_hours = calculate_worked_hours(
        attendance.check_in.astimezone(NAIROBI_TZ),
        attendance.check_out.astimezone(NAIROBI_TZ)
    )

    db.session.commit()

    return jsonify({
        "message": "Check-out successful",
        "check_out": to_nairobi(attendance.check_out).strftime("%H:%M"),
        "worked_hours": attendance.worked_hours
    }), 200




@attendance_bp.route("/attendance/absent/<int:employee_id>", methods=["POST"])
@jwt_required()
def mark_absent(employee_id):
    user = User.query.get(int(get_jwt_identity()))

    if not (user.is_admin or user.is_receptionist):
        return jsonify({"error": "Access denied"}), 403

    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    if not employee.is_active:
        return jsonify({"error": "Employee is currently inactive"}), 400

    today = datetime.now(NAIROBI_TZ).date()

    if not is_employee_working_today(employee, today):
        return jsonify({"error": "Employee is not scheduled to work today"}), 400

    now_na = datetime.now(NAIROBI_TZ).time()

    if now_na < SALON_CLOSE:
        return jsonify({
            "error": "Employee can only be marked absent after salon closing time"
        }), 400

    attendance = Attendance.query.filter_by(
        employee_id=employee_id,
        date=today
    ).first()

    if attendance:
        if attendance.check_in or attendance.check_out:
            return jsonify({
                "error": "Employee has already checked in or out, cannot mark absent"
            }), 400
        if attendance.status == "Absent":
            return jsonify({"error": "Employee is already marked absent"}), 400

    if not attendance:
        attendance = Attendance(
            employee_id=employee_id,
            date=today,
            status="Absent"
        )
        db.session.add(attendance)
    else:
        attendance.status = "Absent"

    db.session.commit()

    return jsonify({"message": "Employee marked absent"}), 200




@attendance_bp.route("/attendance/report/monthly/<int:employee_id>", methods=["GET"])
@jwt_required()
@admin_required
def monthly_attendance_report(employee_id):
    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    month_str = request.args.get("month")
    if not month_str:
        return jsonify({"error": "month is required (YYYY-MM)"}), 400

    year, month = map(int, month_str.split("-"))
    start_date = date(year, month, 1)
    end_date = date(year, month, calendar.monthrange(year, month)[1])

    records = Attendance.query.filter(
        Attendance.employee_id == employee_id,
        Attendance.date.between(start_date, end_date)
    ).all()

    total_hours = sum(
        calculate_worked_hours(
            to_nairobi(a.check_in),
            to_nairobi(a.check_out)
        )
        for a in records
    )


    summary = db.session.query(
        func.count(Attendance.id).label("total_days"),
        func.sum(case((Attendance.status == "Present", 1), else_=0)).label("present"),
        func.sum(case((Attendance.status == "Late", 1), else_=0)).label("late"),
        func.sum(case((Attendance.status == "Absent", 1), else_=0)).label("absent")
    ).filter(
        Attendance.employee_id == employee_id,
        Attendance.date.between(start_date, end_date)
    ).first()

    return jsonify({
        "employee_id": employee.id,
        "employee_name": employee.full_name,
        "period": "monthly",
        "month": month_str,
        "summary": {
            "total_days": summary.total_days or 0,
            "present": summary.present or 0,
            "late": summary.late or 0,
            "absent": summary.absent or 0,
            "total_worked_hours": total_hours
        }
    }), 200




@attendance_bp.route("/attendance/report/weekly/<int:employee_id>", methods=["GET"])
@jwt_required()
@admin_required
def weekly_attendance_report(employee_id):
    employee = Employee.query.get(employee_id)
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    week_start_str = request.args.get("week_start")
    if not week_start_str:
        return jsonify({"error": "week_start is required (YYYY-MM-DD)"}), 400

    week_start = datetime.strptime(week_start_str, "%Y-%m-%d").date()
    week_end = week_start + timedelta(days=6)

    records = Attendance.query.filter(
        Attendance.employee_id == employee_id,
        Attendance.date.between(week_start, week_end)
    ).all()

    total_hours = sum(
        calculate_worked_hours(
            to_nairobi(a.check_in),
            to_nairobi(a.check_out)
        )
        for a in records
    )


    summary = db.session.query(
        func.count(Attendance.id).label("total_days"),
        func.sum(case((Attendance.status == "Present", 1), else_=0)).label("present"),
        func.sum(case((Attendance.status == "Late", 1), else_=0)).label("late"),
        func.sum(case((Attendance.status == "Absent", 1), else_=0)).label("absent")
    ).filter(
        Attendance.employee_id == employee_id,
        Attendance.date.between(week_start, week_end)
    ).first()

    return jsonify({
        "employee_id": employee.id,
        "employee_name": employee.full_name,
        "period": "weekly",
        "from": week_start.isoformat(),
        "to": week_end.isoformat(),
        "summary": {
            "total_days": summary.total_days or 0,
            "present": summary.present or 0,
            "late": summary.late or 0,
            "absent": summary.absent or 0,
            "total_worked_hours": total_hours
        }
    }), 200




@attendance_bp.route("/attendance", methods=["GET"])
@jwt_required()
def get_attendance_records():
    user = User.query.get(int(get_jwt_identity()))

    # Check if user is admin OR receptionist
    if not (user.is_admin or user.is_receptionist):
        return jsonify({"error": "Access denied"}), 403
        
    # Optional filters
    employee_id = request.args.get("employee_id", type=int)
    from_date_str = request.args.get("from_date")
    to_date_str = request.args.get("to_date")

    # Parse dates
    try:
        from_date = datetime.strptime(from_date_str, "%Y-%m-%d").date() if from_date_str else date.today()
        to_date = datetime.strptime(to_date_str, "%Y-%m-%d").date() if to_date_str else date.today()
    except ValueError:
        return jsonify({"error": "Invalid date format, use YYYY-MM-DD"}), 400

    # Base query
    query = Attendance.query.join(Employee)

    if employee_id:
        query = query.filter(Attendance.employee_id == employee_id)

    query = query.filter(Attendance.date.between(from_date, to_date)).order_by(Attendance.date.asc())

    records = query.all()

    data = []
    for rec in records:
        data.append({
            "employee_id": rec.employee_id,
            "employee_name": rec.employee.full_name,
            "date": rec.date.isoformat(),
            "check_in": (
                    to_nairobi(rec.check_in).strftime("%H:%M")
                    if rec.check_in else None
                ),
            "check_out": (
                to_nairobi(rec.check_out).strftime("%H:%M")
                if rec.check_out else None
            ),
            "status": rec.status,
            "worked_hours": rec.worked_hours or 0
        })

    return jsonify({
        "from_date": from_date.isoformat(),
        "to_date": to_date.isoformat(),
        "total_records": len(data),
        "attendance": data
    }), 200



@attendance_bp.route("/attendance/today-summary", methods=["GET"])
@jwt_required()
def attendance_today_summary():
    user = User.query.get(int(get_jwt_identity()))

    # Only admin or receptionist
    if not (user.is_admin or user.is_receptionist):
        return jsonify({"error": "Access denied"}), 403

    today = datetime.now(NAIROBI_TZ).date()
    now = datetime.now(NAIROBI_TZ).time()

    # 1. Get all employees (active + inactive)
    employees = Employee.query.all()

    # 2. Employees scheduled today
    scheduled_today = [e for e in employees if is_employee_working_today(e, today)]
    scheduled_ids = {e.id for e in scheduled_today}

    # 3. Fetch today's attendance records
    attendance_records = {a.employee_id: a for a in Attendance.query.filter_by(date=today).all()}

    checked_in_ids = {eid for eid, a in attendance_records.items() if a.check_in}
    present_today = len(checked_in_ids)

    pending_check_in = 0
    absent_today = 0

    for employee in scheduled_today:
        if employee.id not in checked_in_ids:
            if now < employee.work_end:
                pending_check_in += 1
            else:
                absent_today += 1

    return jsonify({
        "date": today.isoformat(),
        "scheduled_today_count": len(scheduled_ids),
        "present_today": present_today,
        "pending_check_in": pending_check_in,
        "absent_today": absent_today
    }), 200



# Employees scheduled today
@attendance_bp.route("/attendance/scheduled-today", methods=["GET"])
@jwt_required()
def get_scheduled_employees_today():
    user = User.query.get(int(get_jwt_identity()))

    # Admin or receptionist only
    if not (user.is_admin or user.is_receptionist):
        return jsonify({"error": "Access denied"}), 403

    today = date.today()
    weekday = today.weekday()  # 0 = Monday

    # 1. Get ALL employees (active + inactive)
    employees = Employee.query.all()

    # 2. Filter employees scheduled today
    scheduled_today = []
    for employee in employees:
        if not employee.work_days:
            continue

        work_days = [int(d) for d in employee.work_days.split(",")]
        if weekday in work_days:
            scheduled_today.append(employee)

    # 3. Serialize response
    data = []
    for employee in scheduled_today:
        data.append({
            "id": employee.id,
            "user_id": employee.user_id,
            "username": employee.user.username,
            "full_name": employee.full_name,
            "employee_profile_picture": employee.employee_profile_picture,
            "is_active": employee.is_active, 
            "work_start": employee.work_start.strftime("%H:%M"),
            "work_end": employee.work_end.strftime("%H:%M"),
        })

    return jsonify({
        "date": today.isoformat(),
        "total_scheduled": len(data),
        "employees": data
    }), 200




@attendance_bp.route("/attendance/today-records", methods=["GET"])
@jwt_required()
def get_today_attendance_records():
    user = User.query.get(int(get_jwt_identity()))

    if not (user.is_admin or user.is_receptionist):
        return jsonify({"error": "Access denied"}), 403


    now_na = datetime.now(NAIROBI_TZ)
    today = now_na.date()
    now = now_na.time()

    # 1. Get active employees
    employees = Employee.query.filter(Employee._is_active.is_(True)).all()

    # 2. Employees scheduled today
    scheduled_today = [
        e for e in employees if is_employee_working_today(e, today)
    ]

    # 3. Fetch today's attendance records (UTC stored, date is local)
    attendance_records = {
        a.employee_id: a
        for a in Attendance.query.filter_by(date=today).all()
    }

    data = {}

    for employee in scheduled_today:
        record = attendance_records.get(employee.id)

        # ---- UI STATUS DETERMINATION ----
        if record:
            if record.check_out:
                ui_status = "checked_out"
            elif record.check_in:
                ui_status = "checked_in"
            else:
                ui_status = "pending"
        else:
            work_end_dt = datetime.combine(today, employee.work_end, tzinfo=NAIROBI_TZ)
            ui_status = "absent" if now_na > work_end_dt else "pending"


        data[str(employee.id)] = {
            "employeeId": employee.id,
            "employeeName": employee.full_name,
            "username": employee.user.username,

            # Convert UTC → Nairobi for UI
            "checkIn": (
                record.check_in.astimezone(NAIROBI_TZ).strftime("%H:%M")
                if record and record.check_in
                else None
            ),
            "checkOut": (
                record.check_out.astimezone(NAIROBI_TZ).strftime("%H:%M")
                if record and record.check_out
                else None
            ),

            # UI logic
            "status": ui_status,

            # Backend truth
            "backendStatus": record.status if record else None,

            "workedHours": record.worked_hours if record else 0,
            "date": today.isoformat(),
        }

    return jsonify(data), 200



# Attendance
@attendance_bp.route("/admin/employee-attendance", methods=["GET"])
@jwt_required()
def employee_attendance():
    current_user = User.query.get(int(get_jwt_identity()))
    if not current_user or not current_user.is_admin:
        return jsonify({"error": "Admin access required"}), 403

    # Get period from query params
    period = request.args.get("period", "today")
    today = date.today()

    if period == "today":
        start_date = today
        end_date = today
    elif period == "week":
        start_date = today - timedelta(days=today.weekday())  # Monday
        end_date = today
    elif period == "month":
        start_date = today.replace(day=1)
        end_date = today
    else:
        return jsonify({"error": "Invalid period"}), 400

    # Subquery for attendance filtered by period
    attendance_summary = (
        db.session.query(
            Employee.id,
            Employee.full_name,
            Employee.employee_profile_picture,
            func.count(case((Attendance.status == "Present", 1))).label("days_present"),
            func.count(case((Attendance.status == "Absent", 1))).label("days_absent"),
            func.count(case((Attendance.status == "Late", 1))).label("days_late")
        )
        .outerjoin(Attendance, Employee.id == Attendance.employee_id)
        .filter(Employee.user.has(is_receptionist=False))
        .filter(Attendance.date.between(start_date, end_date))
        .group_by(Employee.id)
        .all()
    )

    # Calculate total possible workdays in period
    total_days_in_period = (end_date - start_date).days + 1

    # Prepare employees data
    employees_data = []
    total_present_all = 0
    total_absent_all = 0
    total_late_all = 0

    for r in attendance_summary:
        days_present = r.days_present or 0
        days_absent = r.days_absent or 0
        days_late = r.days_late or 0
        total = days_present + days_absent + days_late

        # Attendance percent: present / total possible days for the period
        attendance_percent = (days_present / total_days_in_period) * 100 if total_days_in_period > 0 else 0

        employees_data.append({
            "employee_id": r.id,
            "employee_name": r.full_name,
            "avatar": r.employee_profile_picture,
            "days_present": days_present,
            "days_absent": days_absent,
            "days_late": days_late,
            "attendance_percent": round(attendance_percent, 2)
        })

        total_present_all += days_present
        total_absent_all += days_absent
        total_late_all += days_late

    total_employees = len(employees_data)
    average_attendance_percent = (total_present_all / (total_employees * total_days_in_period) * 100) if total_employees > 0 else 0

    return jsonify({
        "period": period,
        "summary": {
            "total_employees": total_employees,
            "total_days_present": total_present_all,
            "total_days_absent": total_absent_all,
            "total_days_late": total_late_all,
            "average_attendance_percent": round(average_attendance_percent, 2)
        },
        "employees": employees_data
    })
