from flask import Blueprint, jsonify, current_app
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from models import db, Booking, User, Service, Employee
from flask_jwt_extended import jwt_required, get_jwt_identity
import atexit
from flask_mail import Message
from app import mail
from sqlalchemy import or_, and_


# Create Blueprint for reminder routes
reminder_bp = Blueprint('reminder_bp', __name__)

def send_reminder_email_batch(mail, emails_data):
    """
    Send reminder emails in batch (more efficient for many users)
    """

    sent_count = 0
    failed_count = 0
    
    with mail.connect() as conn:
        for data in emails_data:
            try:
                user = data['user']
                booking = data['booking']
                service = data['service']
                employee = data['employee']
                booking_datetime = datetime.combine(booking.booking_date, booking.start_time)
                
                msg = Message(
                    subject="Booking Reminder - Your Appointment is Tomorrow!",
                    sender=current_app.config.get('MAIL_DEFAULT_SENDER'),
                    recipients=[user.email]
                )
                
                # HTML email body
                msg.html = f"""
                <html>
                    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #4CAF50;">Booking Reminder</h2>
                            <p>Hello {user.username},</p>
                            
                            <p>This is a friendly reminder that your appointment is scheduled for tomorrow:</p>
                            
                            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <p><strong>Service:</strong> {service.title}</p>
                                <p><strong>Employee:</strong> {employee.full_name}</p>
                                <p><strong>Date:</strong> {booking_datetime.strftime('%B %d, %Y')}</p>
                                <p><strong>Time:</strong> {booking.start_time.strftime('%I:%M %p')} - {booking.end_time.strftime('%I:%M %p')}</p>
                                <p><strong>Price:</strong> ${booking.price}</p>
                                <p><strong>Status:</strong> {booking.status.upper()}</p>
                            </div>
                            
                            <p>Please arrive 5-10 minutes early. If you need to reschedule or cancel, please contact us as soon as possible.</p>
                            
                            <p style="margin-top: 30px;">
                                Best regards,<br>
                                Salon Management Team
                            </p>
                        </div>
                    </body>
                </html>
                """
                
                # Plain text fallback
                msg.body = f"""
                Booking Reminder
                
                Hello {user.username},
                
                This is a friendly reminder that your appointment is scheduled for tomorrow:
                
                Service: {service.title}
                Employee: {employee.full_name}
                Date: {booking_datetime.strftime('%B %d, %Y')}
                Time: {booking.start_time.strftime('%I:%M %p')} - {booking.end_time.strftime('%I:%M %p')}
                Price: ${booking.price}
                Status: {booking.status.upper()}
                
                Please arrive 5-10 minutes early. If you need to reschedule or cancel, please contact us as soon as possible.
                
                Best regards,
                Salon Management Team
                """
                
                conn.send(msg)
                sent_count += 1
                print(f"✓ Reminder sent to {user.email} for booking #{booking.id}")
                
            except Exception as e:
                print(f"✗ Error sending email to {user.email}: {str(e)}")
                failed_count += 1
                continue
    
    print(f"✓ Batch email complete: {sent_count} sent, {failed_count} failed")
    return sent_count, failed_count


def check_and_send_reminders(app):
    """Check for bookings 24 hours away and send reminders (optimized for many users)"""
    with app.app_context():
        
        try:
            # Calculate time window (23-25 hours from now for 24-hour reminder)
            now = datetime.utcnow()
            reminder_start = now + timedelta(hours=23)
            reminder_end = now + timedelta(hours=25)
            
            # Optimized query with eager loading to reduce database calls
            bookings_data = db.session.query(Booking, User, Service, Employee).join(
                User, Booking.user_id == User.id
            ).join(
                Service, Booking.service_id == Service.id
            ).join(
                Employee, Booking.employee_id == Employee.id
            ).filter(
                Booking.status.in_(['confirmed', 'pending']),
                Booking.reminder_sent == False,
                Booking.booking_date >= reminder_start.date(),
                Booking.booking_date <= reminder_end.date()
            ).all()
            
            # Prepare emails to send
            emails_to_send = []
            booking_ids_to_update = []
            
            for booking, user, service, employee in bookings_data:
                # Combine date and time for accurate comparison
                booking_datetime = datetime.combine(booking.booking_date, booking.start_time)
                
                # Check if booking is within the 24-hour window
                if reminder_start <= booking_datetime <= reminder_end:
                    emails_to_send.append({
                        'user': user,
                        'booking': booking,
                        'service': service,
                        'employee': employee
                    })
                    booking_ids_to_update.append(booking.id)
            
            # Send emails in batch (more efficient)
            reminders_sent = 0
            if emails_to_send:
                sent_count, failed_count = send_reminder_email_batch(mail, emails_to_send)
                reminders_sent = sent_count
                
                # Bulk update reminder_sent flag (much faster than individual updates)
                if booking_ids_to_update:
                    db.session.query(Booking).filter(
                        Booking.id.in_(booking_ids_to_update)
                    ).update(
                        {Booking.reminder_sent: True},
                        synchronize_session=False
                    )
            
            # Commit all changes in one transaction
            db.session.commit()
            
            print(f"✓ Reminder check complete: {reminders_sent} sent out of {len(emails_to_send)} scheduled")
            return reminders_sent
            
        except Exception as e:
            print(f"✗ Error in check_and_send_reminders: {str(e)}")
            db.session.rollback()
            return 0


def delete_expired_bookings(app):
    """Delete bookings that are 1 day past and not completed/rescheduled (optimized for scale)"""
    with app.app_context():
        try:
            # Calculate cutoff datetime (1 day ago)
            cutoff_datetime = datetime.utcnow() - timedelta(days=1)
            cutoff_date = cutoff_datetime.date()
            cutoff_time = cutoff_datetime.time()
            
            # Use bulk delete for better performance
            deleted_count = db.session.query(Booking).filter(
                or_(
                    Booking.booking_date < cutoff_date,
                    and_(
                        Booking.booking_date == cutoff_date,
                        Booking.end_time < cutoff_time
                    )
                ),
                ~Booking.status.in_(['completed', 'rescheduled'])
            ).delete(synchronize_session=False)
            
            db.session.commit()
            
            print(f"✓ Deleted {deleted_count} expired booking(s)")
            return deleted_count
            
        except Exception as e:
            print(f"✗ Error in delete_expired_bookings: {str(e)}")
            db.session.rollback()
            return 0


@reminder_bp.route('/api/reminders/process', methods=['POST'])
def process_reminders():
    """
    Endpoint to manually trigger reminder processing
    This will:
    1. Send reminders for bookings 24 hours away
    2. Delete expired bookings
    """
    try:
        reminders_sent = check_and_send_reminders(current_app._get_current_object())
        deleted_count = delete_expired_bookings(current_app._get_current_object())
        
        return jsonify({
            'success': True,
            'reminders_sent': reminders_sent,
            'bookings_deleted': deleted_count,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@reminder_bp.route('/api/reminders/status', methods=['GET'])
def reminder_status():
    """Get status of upcoming reminders and expiring bookings"""
    try:
        now = datetime.utcnow()
        reminder_window = now + timedelta(hours=24)
        
        # Count bookings needing reminders (within next 24 hours, not sent yet)
        upcoming_bookings = Booking.query.filter(
            Booking.status.in_(['confirmed', 'pending']),
            Booking.reminder_sent == False,
            Booking.booking_date >= now.date(),
            Booking.booking_date <= reminder_window.date()
        ).count()
        
        # Count bookings to be deleted (past due and not completed/rescheduled)
        cutoff_datetime = now - timedelta(days=1)
        expired_bookings = Booking.query.filter(
            or_(
                Booking.booking_date < cutoff_datetime.date(),
                and_(
                    Booking.booking_date == cutoff_datetime.date(),
                    Booking.end_time < cutoff_datetime.time()
                )
            ),
            ~Booking.status.in_(['completed', 'rescheduled'])
        ).count()
        
        return jsonify({
            'success': True,
            'pending_reminders': upcoming_bookings,
            'bookings_to_delete': expired_bookings,
            'timestamp': now.isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@reminder_bp.route('/api/reminders/upcoming', methods=['GET'])
def get_upcoming_reminders():
    """Get list of bookings that will receive reminders soon"""
    try:
        now = datetime.utcnow()
        reminder_start = now + timedelta(hours=23)
        reminder_end = now + timedelta(hours=25)
        
        bookings_data = db.session.query(Booking, User, Service).join(
            User, Booking.user_id == User.id
        ).join(
            Service, Booking.service_id == Service.id
        ).filter(
            Booking.status.in_(['confirmed', 'pending']),
            Booking.reminder_sent == False,
            Booking.booking_date >= reminder_start.date(),
            Booking.booking_date <= reminder_end.date()
        ).all()
        
        upcoming = []
        for booking, user, service in bookings_data:
            booking_datetime = datetime.combine(booking.booking_date, booking.start_time)
            if reminder_start <= booking_datetime <= reminder_end:
                upcoming.append({
                    'booking_id': booking.id,
                    'user_email': user.email,
                    'service_name': service.name,
                    'booking_date': booking.booking_date.isoformat(),
                    'start_time': booking.start_time.isoformat(),
                    'status': booking.status,
                    'reminder_sent': booking.reminder_sent
                })
        
        return jsonify({
            'success': True,
            'count': len(upcoming),
            'bookings': upcoming
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


def reset_reminder_flag(booking_id):
    """
    Utility function to reset reminder_sent flag
    Call this function whenever a booking is rescheduled
    """
    try:
        booking = Booking.query.get(booking_id)
        if booking:
            booking.reminder_sent = False
            db.session.commit()
            print(f"✓ Reminder flag reset for booking #{booking_id}")
            return True
        return False
    except Exception as e:
        print(f"✗ Error resetting reminder flag: {str(e)}")
        db.session.rollback()
        return False


# Scheduler setup
scheduler = None

def start_scheduler():
    """Initialize the background scheduler"""
    global scheduler
    
    if scheduler is not None:
        return scheduler
    
    app = current_app._get_current_object()
    
    scheduler = BackgroundScheduler()
    
    # Run reminder check every hour
    scheduler.add_job(
        func=lambda: check_and_send_reminders(app),
        trigger="interval",
        hours=1,
        id='reminder_check',
        replace_existing=True,
        next_run_time=datetime.now()  # Run immediately on startup
    )
    
    # Run cleanup every 6 hours
    scheduler.add_job(
        func=lambda: delete_expired_bookings(app),
        trigger="interval",
        hours=6,
        id='booking_cleanup',
        replace_existing=True,
        next_run_time=datetime.now() + timedelta(minutes=5)  # Run 5 min after startup
    )
    
    scheduler.start()
    # print("✓ Automatic reminder scheduler started!")
    # print("  → Reminders will be checked every hour")
    # print("  → Expired bookings will be deleted every 6 hours")
    
    # Shut down the scheduler when exiting the app
    atexit.register(lambda: scheduler.shutdown())
    
    return scheduler




@reminder_bp.route('/reminders/my-upcoming', methods=['GET'])
@jwt_required()
def get_my_upcoming_appointments():
    """Get current user's upcoming appointments within 24 hours"""
    try:
        user_id = int(get_jwt_identity())
        now = datetime.utcnow()
        next_24_hours = now + timedelta(hours=24)
        
        # Query user's upcoming bookings
        bookings_data = db.session.query(Booking, Service, Employee).join(
            Service, Booking.service_id == Service.id
        ).join(
            Employee, Booking.employee_id == Employee.id
        ).filter(
            Booking.user_id == user_id,
            Booking.status.in_(['confirmed', 'pending']),
            Booking.booking_date >= now.date(),
            Booking.booking_date <= next_24_hours.date()
        ).order_by(Booking.booking_date, Booking.start_time).all()
        
        upcoming = []
        for booking, service, employee in bookings_data:
            booking_datetime = datetime.combine(booking.booking_date, booking.start_time)
            
            # Only include if within 24 hours
            if now <= booking_datetime <= next_24_hours:
                hours_until = (booking_datetime - now).total_seconds() / 3600
                
                # Calculate duration
                start_dt = datetime.combine(booking.booking_date, booking.start_time)
                end_dt = datetime.combine(booking.booking_date, booking.end_time)
                duration_minutes = int((end_dt - start_dt).total_seconds() / 60)
                
                # Format date
                if booking.booking_date == now.date():
                    date_text = "Today"
                elif booking.booking_date == (now + timedelta(days=1)).date():
                    date_text = "Tomorrow"
                else:
                    date_text = booking.booking_date.strftime("%B %d, %Y")
                
                upcoming.append({
                    'booking_id': booking.id,
                    'service': service.title,
                    'employee': employee.full_name,
                    'employee_full_name': employee.full_name if hasattr(employee, 'full_name') else employee.username,
                    'date': date_text,
                    'date_full': booking.booking_date.isoformat(),
                    'time': booking.start_time.strftime('%I:%M %p'),
                    'start_time': booking.start_time.isoformat(),
                    'end_time': booking.end_time.isoformat(),
                    'duration': f"{duration_minutes} minutes" if duration_minutes < 60 else f"{duration_minutes // 60} hour{'s' if duration_minutes >= 120 else ''}",
                    'duration_minutes': duration_minutes,
                    'hours_until': round(hours_until, 1),
                    'status': booking.status,
                    'price': float(booking.price)
                })
        
        return jsonify({
            'success': True,
            'count': len(upcoming),
            'appointments': upcoming
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500