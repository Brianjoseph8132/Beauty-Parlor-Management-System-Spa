from flask import Flask, jsonify, request
from flask_migrate import Migrate
from models import db, TokenBlocklist
from datetime import datetime
from datetime import timedelta
from flask_jwt_extended import JWTManager
from flask_jwt_extended import create_access_token
from flask_mail import Mail
import os
from sqlalchemy import event
from sqlalchemy.engine import Engine
import sqlite3
from flask_cors import CORS


app = Flask(__name__)


CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
# migration initialization
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///parlor.sqlite'
migrate = Migrate(app, db)
db.init_app(app)


# jwt
app.config["JWT_SECRET_KEY"] = "bjdhbjfhdjgewuhedhgdhghgdfgwegyegywgwy"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] =  timedelta(hours=1)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=14)

jwt = JWTManager(app)
jwt.init_app(app)



# Flask mail configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = 'ashley.testingmoringa@gmail.com'  
app.config['MAIL_PASSWORD'] ='wksb hzbp lyqu wyxo'  
app.config['MAIL_DEFAULT_SENDER'] = "ashley.testingmoringa@gmail.com"

mail = Mail(app)

app.config["JWT_TOKEN_LOCATION"] = ["headers", "cookies"]
app.config["JWT_COOKIE_SECURE"] = False  
app.config["JWT_COOKIE_SAMESITE"] = "Lax"
app.config["JWT_COOKIE_CSRF_PROTECT"] = False

# imports functions from views
from views import *

app.register_blueprint(user_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(category_bp)
app.register_blueprint(service_bp)
app.register_blueprint(booking_bp)
app.register_blueprint(employee_bp)
app.register_blueprint(receipt_bp)
app.register_blueprint(reminder_bp)
app.register_blueprint(allergy_bp)
app.register_blueprint(attendance_bp)
app.register_blueprint(products_bp)
app.register_blueprint(mail_bp)

from views.reminder import start_scheduler




@event.listens_for(Engine, "connect")
def enable_sqlite_fk(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, sqlite3.Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.close()



@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload: dict) -> bool:
    jti = jwt_payload["jti"]
    token = db.session.query(TokenBlocklist.id).filter_by(jti=jti).scalar()

    return token is not None



if __name__ == "__main__":
    with app.app_context():
        start_scheduler()
    app.run(debug=True)