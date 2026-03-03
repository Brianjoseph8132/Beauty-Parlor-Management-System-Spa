# Beauty Parlor Management System
A full-stack Beauty Parlor Management System built with **Flask (Backend)** and **React (Frontend)**.
The system helps manage bookings, employees, services, attendance, and email notifications with role-based access control.

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access:
  - Admin
  - Beautician
  - Client
- Secure protected routes

### Booking Management
- Create new bookings
- Reschedule bookings
- Start and complete services
- Booking status tracking (Pending, Confirmed, Ongoing, Completed, Cancelled)

### Employee Management (Admin)
- Add, update, delete employees
- Assign services to employees
- View employee attendance

### Attendance System
- Admin can view attendance by:
  - Today
  - This week
  - This month

### Email Notifications
- Admin can send emails to specific clients
- Booking-related notifications

### Service Management
- Add new services
- Update service pricing
- Assign services to beauticians

---

## Tech Stack

### Backend
- Python
- Flask
- Flask-JWT-Extended
- SQLAlchemy
- MySQL

### Frontend
- React
- Context API
- Tailwind CSS
- React Router
- React Toastify

---

## Installation Guide

### Clone the Repository

```bash
git clone https://github.com/your-username/beauty-parlor.git
cd beauty-parlor
```
---

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

---

## Run the server:
```bash
flask run
```
---

## Frontend Setup

```bash
cd frontend
npm install
```

## Run the server
```bash
npm run dev
```

---

## API Authentication

```bash
Authorization: Bearer <JWT_TOKEN>
```

---

## Core API Endpoints

# Authentication
POST /register

POST /login

# Bookings
POST /bookings

PATCH /bookings/start/<booking_id>

PATCH /bookings/complete/<booking_id>

# Admin
GET /admin/employee-attendance

POST /send-email/client/<username>

---

## System Roles
| Role       | Permissions                    |
| ---------- | ------------------------------ |
| Admin      | Full access                    |
| Beautician | Manage assigned bookings       |
| Client     | Create and manage own bookings |

---

## Future Improvements
-Payment integration (M-PESA)

-Dashboard analytics

-SMS notifications

-Inventory management

-Reporting & export system

---

## Author
Phoebe Muthoni Njagi


