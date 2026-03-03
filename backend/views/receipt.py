from flask import Blueprint, send_file, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.colors import black, HexColor
from datetime import datetime
import io

from models import Booking, User, db 


receipt_bp = Blueprint("receipt_bp", __name__)


def generate_receipt_pdf(booking, user):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Colors
    primary = HexColor("#D4AA7D")
    dark = HexColor("#272727")

    # Margins
    x_margin = 25 * mm
    y = height - 30 * mm

    # Header
    c.setFont("Helvetica-Bold", 18)
    c.setFillColor(dark)
    c.drawString(x_margin, y, "POPLAR BEAUTY PLACE")

    y -= 20
    c.setFont("Helvetica", 10)
    c.drawString(x_margin, y, "Professional Beauty & Wellness Services")

    # Receipt meta
    c.setFont("Helvetica", 10)
    c.drawRightString(
        width - x_margin,
        height - 30 * mm,
        f"Receipt #: {booking.id}",
    )
    c.drawRightString(
        width - x_margin,
        height - 45 * mm,
        f"Issued: {datetime.utcnow().strftime('%d %b %Y')}",
    )

    # Divider
    y -= 25
    c.line(x_margin, y, width - x_margin, y)

    # Customer info
    y -= 30
    c.setFont("Helvetica-Bold", 11)
    c.drawString(x_margin, y, "Customer")

    y -= 15
    c.setFont("Helvetica", 10)
    c.drawString(x_margin, y, f"Name: {user.username}")
    y -= 15
    c.drawString(x_margin, y, f"Email: {user.email}")

    # Appointment info
    y -= 25
    c.setFont("Helvetica-Bold", 11)
    c.drawString(x_margin, y, "Appointment Details")

    y -= 15
    c.setFont("Helvetica", 10)
    c.drawString(x_margin, y, f"Service: {booking.service.title}")
    y -= 15
    c.drawString(x_margin, y, f"Employee: {booking.employee.full_name}")
    y -= 15
    c.drawString(
        x_margin,
        y,
        f"Date: {booking.booking_date.strftime('%d %b %Y')} | Time: {booking.start_time.strftime('%H:%M')}",
    )
    y -= 15
    c.drawString(x_margin, y, f"Duration: {booking.service.duration_minutes}")

    # Location
    y -= 25
    c.setFont("Helvetica-Bold", 11)
    c.drawString(x_margin, y, "Location")

    y -= 15
    c.setFont("Helvetica", 10)
    c.drawString(x_margin, y, "Poplar Beauty Place")
    y -= 15
    c.drawString(x_margin, y, "Ronald Ngala Street, RNG Plaza, 1st Floor, Shop No.203")

    # Payment summary
    y -= 30
    c.setFont("Helvetica-Bold", 11)
    c.drawString(x_margin, y, "Payment Summary")

    y -= 20
    c.setFont("Helvetica", 10)
    c.drawString(x_margin, y, "Service Fee")
    c.drawRightString(width - x_margin, y, f"KSH{booking.price:.2f}")

    y -= 15
    c.line(x_margin, y, width - x_margin, y)

    y -= 15
    c.setFont("Helvetica-Bold", 11)
    c.drawString(x_margin, y, "Total Paid")
    c.drawRightString(width - x_margin, y, f"KSH{booking.price:.2f}")

    # Status
    y -= 30
    c.setFont("Helvetica-Bold", 11)
    c.drawString(x_margin, y, f"Status: {booking.status.upper()}")

    # Footer
    y -= 40
    c.setFont("Helvetica", 9)
    c.setFillColor(black)
    c.drawCentredString(
        width / 2,
        y,
        "Thank you for choosing Poplar Beauty Place",
    )
    y -= 12
    c.drawCentredString(
        width / 2,
        y,
        "This receipt was generated electronically and is valid without a signature.",
    )

    c.showPage()
    c.save()

    buffer.seek(0)
    return buffer



@receipt_bp.route("/receipts/<int:booking_id>", methods=["GET"])
@jwt_required()
def download_receipt(booking_id):
    user_id = int(get_jwt_identity())

    booking = Booking.query.get_or_404(booking_id)

    # Security check
    if booking.user_id != user_id:
        abort(403)
    
    # Check if booking is completed
    if booking.status != "completed":
        return jsonify({
            "error": "Receipt not available",
            "message": "Receipt is only available for completed bookings",
            "current_status": booking.status
        }), 400

    user = User.query.get(user_id)

    pdf_buffer = generate_receipt_pdf(booking, user)

    return send_file(
        pdf_buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"receipt-BK{booking.id:06d}.pdf",
    )
