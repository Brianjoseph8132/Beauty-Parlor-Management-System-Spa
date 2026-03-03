from models import db, User
from flask import jsonify, request, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_mail import Message
from app import mail

mail_bp = Blueprint("mail_bp", __name__)



#  Branded HTML Email Template
def generate_email_template(title, message, recipient_name="Valued Guest"):
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>{title}</title>
    </head>
    <body style="margin:0;padding:0;background-color:#fdf6f9;font-family:'Georgia',serif;">

        <table width="100%" cellpadding="0" cellspacing="0"
               style="background-color:#fdf6f9;padding:40px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0"
                           style="background-color:#ffffff;border-radius:16px;
                                  overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                        <!-- ── HEADER BANNER ── -->
                        <tr>
                            <td style="background:linear-gradient(135deg,#b5478a 0%,#d4007a 50%,#e8559c 100%);
                                        padding:36px 40px 28px 40px;text-align:center;">

                                <div style="font-size:36px;margin-bottom:6px;">🌸</div>

                                <h1 style="margin:0;font-family:'Georgia',serif;
                                           font-size:28px;font-weight:bold;color:#ffffff;
                                           letter-spacing:2px;text-transform:uppercase;">
                                    POPLAR BEAUTY PLACE
                                </h1>

                                <p style="margin:6px 0 0 0;font-size:13px;
                                          color:rgba(255,255,255,0.85);letter-spacing:1.5px;
                                          text-transform:uppercase;font-family:Arial,sans-serif;">
                                    Professional Beauty &amp; Wellness Services
                                </p>

                                <div style="margin:16px auto 0 auto;width:60px;height:2px;
                                            background:rgba(255,255,255,0.5);border-radius:2px;"></div>
                            </td>
                        </tr>

                        <!-- ── CONTENT AREA ── -->
                        <tr>
                            <td style="padding:40px 40px 30px 40px;">

                                <p style="margin:0 0 6px 0;font-family:Arial,sans-serif;
                                          font-size:14px;color:#b5478a;font-weight:bold;
                                          text-transform:uppercase;letter-spacing:1px;">
                                    Hello, {recipient_name} 💖
                                </p>

                                <h2 style="margin:0 0 20px 0;font-family:'Georgia',serif;
                                           font-size:22px;color:#2d2d2d;">
                                    {title}
                                </h2>

                                <hr style="border:none;border-top:1px solid #f0d6e8;margin:0 0 24px 0;" />

                                <div style="font-family:Arial,sans-serif;font-size:15px;
                                            line-height:1.8;color:#444444;">
                                    {message}
                                </div>

                            </td>
                        </tr>

                        <!-- ── CALL TO ACTION ── -->
                        <tr>
                            <td style="padding:0 40px 36px 40px;text-align:center;">
                                <a href="#"
                                   style="display:inline-block;
                                          background:linear-gradient(135deg,#b5478a,#d4007a);
                                          color:#ffffff;text-decoration:none;padding:14px 36px;
                                          border-radius:30px;font-family:Arial,sans-serif;
                                          font-size:14px;font-weight:bold;letter-spacing:1px;
                                          text-transform:uppercase;">
                                    Book Your Appointment 🌸
                                </a>
                            </td>
                        </tr>

                        <!-- ── FOOTER ── -->
                        <tr>
                            <td style="background-color:#fdf0f7;border-top:1px solid #f0d6e8;
                                        padding:24px 40px;text-align:center;">

                                <p style="margin:0 0 6px 0;font-family:'Georgia',serif;
                                          font-size:14px;color:#b5478a;font-weight:bold;">
                                    POPLAR BEAUTY PLACE
                                </p>

                                <p style="margin:0 0 10px 0;font-family:Arial,sans-serif;
                                          font-size:12px;color:#999999;">
                                    Professional Beauty &amp; Wellness Services
                                </p>

                                <p style="margin:0;font-family:Arial,sans-serif;
                                          font-size:11px;color:#bbbbbb;line-height:1.6;">
                                    You are receiving this email because you are a valued client.<br/>
                                    &copy; 2025 Poplar Beauty Place. All rights reserved.
                                </p>

                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>

    </body>
    </html>
    """



#  Core Send Helper  (HTML email)
def send_email(subject, recipients, html_body):
    msg = Message(
        subject=subject,
        recipients=recipients,
        html=html_body          
    )
    mail.send(msg)


#  Route: Send to ALL Clients
@mail_bp.route("/send-email/all-clients", methods=["POST"])
@jwt_required()
def send_email_to_all_clients():
    user = User.query.get(int(get_jwt_identity()))

    if not user.is_admin:
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json()
    subject      = data.get("subject")
    message_body = data.get("message")
    email_title  = data.get("title", subject)

    if not subject or not message_body:
        return jsonify({"error": "Subject and message are required"}), 400

    clients = User.query.filter(
        User.is_admin        == False,
        User.is_beautician   == False,
        User.is_receptionist == False
    ).all()

    if not clients:
        return jsonify({"error": "No clients found"}), 404

    recipient_emails = [client.email for client in clients if client.email]

    html_content = generate_email_template(
        title=email_title,
        message=message_body
    )

    try:
        send_email(subject, recipient_emails, html_content)
    except Exception as e:
        return jsonify({"error": f"Failed to send email: {str(e)}"}), 500

    return jsonify({
        "success": f"Email sent to {len(recipient_emails)} client(s) successfully"  
    }), 200



#  Send to a Specific Client
@mail_bp.route("/send-email/client/<string:username>", methods=["POST"])
@jwt_required()
def send_email_to_specific_client(username):
    user = User.query.get(int(get_jwt_identity()))

    if not user.is_admin:
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json()
    subject      = data.get("subject")
    message_body = data.get("message")
    email_title  = data.get("title", subject)

    if not subject or not message_body:
        return jsonify({"error": "Subject and message are required"}), 400

    client = User.query.filter_by(username=username).first()

    if not client:
        return jsonify({"error": "User not found"}), 404

    if client.is_admin or client.is_beautician or client.is_receptionist:
        return jsonify({"error": "Selected user is not a client"}), 400

    recipient_name = client.username.capitalize()  # personalised greeting

    html_content = generate_email_template(
        title=email_title,
        message=message_body,
        recipient_name=recipient_name
    )

    try:
        send_email(subject, [client.email], html_content)
    except Exception as e:
        return jsonify({"error": f"Failed to send email: {str(e)}"}), 500

    return jsonify({
        "success": f"Email sent to {client.username} successfully"
    }), 200






@mail_bp.route("/admin/clients", methods=["GET"])
@jwt_required()
def get_all_clients():

    # Admin protection
    current_user = User.query.get(int(get_jwt_identity()))
    if not current_user or not current_user.is_admin:
        return jsonify({"error": "Admin access required"}), 403

    # Only real clients
    clients = User.query.filter(
        User.is_admin == False,
        User.is_beautician == False,
        User.is_receptionist == False
    ).order_by(User.username.asc()).all()

    clients_data = []

    for client in clients:
        clients_data.append({
            "id": client.id,
            "username": client.username,
            "email": client.email,
            "profile_picture": client.profile_picture,
            "total_bookings": len(client.bookings)
        })

    return jsonify({
        "total_clients": len(clients_data),
        "clients": clients_data
    }), 200





@mail_bp.route("/admin/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):

    # Ensure current user is admin
    current_user = User.query.get(int(get_jwt_identity()))

    if not current_user or not current_user.is_admin:
        return jsonify({"error": "Admin access required"}), 403

    # Find user to delete
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Prevent admin deleting themselves
    if user.id == current_user.id:
        return jsonify({"error": "You cannot delete your own account"}), 400

    # Prevent deleting another admin (extra protection)
    if user.is_admin:
        return jsonify({"error": "Cannot delete another admin"}), 400

    try:
        db.session.delete(user)
        db.session.commit()

        return jsonify({
            "success": f"User '{user.username}' deleted successfully"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "An error occurred while deleting user"
        }), 500
