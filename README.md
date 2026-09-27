# 🕒 Employee Attendance Management System with Geofencing

A **Spring Boot-based Employee Attendance Management System** that allows employees to check in and check out based on their configured office location using **geofencing**.

The system provides **JWT authentication, role-based access control, employee management, department management, attendance tracking, and reporting** through a responsive web dashboard.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Authentication | JWT-based authentication with secure login |
| 👤 Role-Based Access | Separate access for ADMIN and EMPLOYEE roles |
| 👥 Employee Management | Add, update, view, and manage employee records |
| 🏢 Department Management | Organize employees by department |
| 📍 Office Location | Configure office coordinates and geofence radius |
| 🕘 Attendance | Check-in and check-out with validation |
| ⏰ Time Rules | Check-in until 10:30 AM and check-out after 5:00 PM |
| 🚫 Duplicate Prevention | Prevent duplicate attendance for the same day |
| 📊 Attendance Reports | View today's and date-based attendance reports |
| 🛡️ Validation | Input validation and global exception handling |
| 💻 Web Dashboard | Responsive dashboard for attendance management |

---

## 🛠️ Tech Stack

### Backend

- ☕ Java 21
- 🌱 Spring Boot 4.1.1
- 🔐 Spring Security
- 🎟️ JWT
- 🗄️ Spring Data JPA
- ⚙️ Hibernate
- 📦 Maven

### Database

- 🐬 MySQL

### Frontend

- HTML5
- CSS3
- JavaScript

### Tools

- Spring Tool Suite (STS) / Eclipse
- Postman
- Git
- GitHub

---

## 🏗️ System Architecture

```text
                  ┌───────────────────────┐
                  │       Frontend        │
                  │    HTML / CSS / JS    │
                  └───────────┬───────────┘
                              │
                              │ REST API
                              ▼
                  ┌───────────────────────┐
                  │      Controller       │
                  └───────────┬───────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │       Service         │
                  │    Business Logic     │
                  └───────────┬───────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │      Repository       │
                  │    Spring Data JPA    │
                  └───────────┬───────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │        MySQL          │
                  └───────────────────────┘

## 📂 Project Structure
attendance-geofencing/
│
├── src/
│   └── main/
│       ├── java/
│       │   └── com.employee.attendance_geofencing/
│       │       ├── controller/
│       │       ├── service/
│       │       ├── repository/
│       │       ├── entity/
│       │       ├── dto/
│       │       ├── security/
│       │       └── exception/
│       │
│       └── resources/
│           ├── static/
│           │   ├── index.html
│           │   ├── style.css
│           │   ├── script.js
│           │   ├── dashboard.html
│           │   ├── dashboard.css
│           │   └── dashboard.js
│           │
│           └── application.properties
│
├── pom.xml
└── README.md

## 🔐 Authentication & Authorization

The application uses JWT (JSON Web Token) authentication to secure REST APIs.

ADMIN
Admin users can:

Manage employees
Manage departments
Manage office locations
View attendance reports
Update attendance records
Delete attendance records

👤 EMPLOYEE
Employee users can:

Login securely
View their attendance
Check in
Check out
Access the employee dashboard

## Authentication Flow
Login
  ↓
Validate Email & Password
  ↓
Generate JWT Token
  ↓
Send JWT with API Requests
  ↓
JWT Authentication Filter
  ↓
Role-Based Authorization
  ↓
Access Protected API

## 📍 Geofencing

The system validates attendance based on the distance between the employee's location and the configured office location.

Office Configuration
Office Name : Bangalore Main Office
Latitude    : 12.9716
Longitude   : 77.5946
Radius      : 150 meters

The active office location is configured using:
office.location.id=1

## Geofencing Flow
Employee Location
       │
       ▼
Calculate Distance
       │
       ▼
Compare with Office Radius
       │
       ├───────────────┐
       ▼               ▼
   Within Radius   Outside Radius
       │               │
       ▼               ▼
    Allowed          Rejected
🕘 Attendance Flow
Check-In
Login
  ↓
JWT Authentication
  ↓
Validate Employee
  ↓
Validate Check-In Time
  ↓
Validate Office Location
  ↓
Check Duplicate Attendance
  ↓
Record Attendance

##Check-Out
Check-Out
  ↓
Validate Employee
  ↓
Validate Check-Out Time
  ↓
Validate Office Location
  ↓
Validate Existing Attendance
  ↓
Complete Attendance

⏰ Attendance Rules

Rule	Condition:
-Check-In	Allowed until 10:30 AM
-Check-Out	Allowed after 5:00 PM
-Duplicate Check-In	Not allowed
-Duplicate Check-Out	Not allowed
-Geofencing	Employee must be within configured office radius

## 📊 Attendance Reports

The dashboard provides attendance reporting features such as:

Today's attendance
-Attendance by selected date
-Employee name
-Employee email
-Check-in time
-Check-out time
-Attendance status
-Total employees
-Pending check-outs
-Office locations

## 🔗 REST API Endpoints

|  Method  | Endpoint                             |     Access    | Description                        |
| :------: | ------------------------------------ | :-----------: | ---------------------------------- |
|  `POST`  | `/auth/login`                        |     Public    | Login and receive JWT token        |
|   `GET`  | `/employees`                         | Authenticated | Get all employees                  |
|   `GET`  | `/employees/{id}`                    | Authenticated | Get employee by ID                 |
|  `POST`  | `/employees`                         |     ADMIN     | Create a new employee              |
|   `PUT`  | `/employees/{id}`                    |     ADMIN     | Update employee details            |
| `DELETE` | `/employees/{id}`                    |     ADMIN     | Delete an employee                 |
|   `GET`  | `/departments`                       | Authenticated | Get all departments                |
|   `GET`  | `/departments/{id}`                  | Authenticated | Get department by ID               |
|  `POST`  | `/departments`                       |     ADMIN     | Create a department                |
|   `PUT`  | `/departments/{id}`                  |     ADMIN     | Update a department                |
| `DELETE` | `/departments/{id}`                  |     ADMIN     | Delete a department                |
|   `GET`  | `/office-locations`                  | Authenticated | Get office locations               |
|   `GET`  | `/office-locations/{id}`             | Authenticated | Get office location by ID          |
|  `POST`  | `/office-locations`                  |     ADMIN     | Create an office location          |
|   `PUT`  | `/office-locations/{id}`             |     ADMIN     | Update an office location          |
| `DELETE` | `/office-locations/{id}`             |     ADMIN     | Delete an office location          |
|   `GET`  | `/attendances`                       | Authenticated | Get attendance records             |
|   `GET`  | `/attendances/{id}`                  | Authenticated | Get attendance by ID               |
|  `POST`  | `/attendances/check-in`              | Authenticated | Check in for attendance            |
|  `POST`  | `/attendances/check-out`             | Authenticated | Check out from attendance          |
|   `GET`  | `/attendances/employee/{employeeId}` | Authenticated | Get attendance for an employee     |
|   `GET`  | `/attendances/today`                 |     ADMIN     | Get today's attendance             |
|   `GET`  | `/attendances/date/{date}`           |     ADMIN     | Get attendance for a selected date |
|   `PUT`  | `/attendances/{id}`                  |     ADMIN     | Update attendance record           |
| `DELETE` | `/attendances/{id}`                  |     ADMIN     | Delete attendance record           |


## 🗄️ Database Setup

Create the MySQL database:
CREATE DATABASE employee_attendance;

The application uses Hibernate to automatically create and update tables:

spring.jpa.hibernate.ddl-auto=update

## 🚀 Getting Started

1. Clone the Repository
git clone https://github.com/Harshi-789/Attendance-Geofencing.git
cd Attendance-Geofencing

2. Open the Project
Import the project into Spring Tool Suite (STS) or Eclipse as an existing Maven project.

3. Create the Database
Open MySQL and run:
CREATE DATABASE employee_attendance;

4. Configure application.properties
Open:
src/main/resources/application.properties

Configure your database credentials:
spring.datasource.url=jdbc:mysql://localhost:3306/employee_attendance
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

spring.jpa.hibernate.ddl-auto=update

jwt.secret=YOUR_JWT_SECRET

office.location.id=1

⚠️ Important: Never upload your actual database password or private JWT secret to GitHub.

5. Run the Application

From STS/Eclipse, run:
AttendanceGeofencingApplication.java

Or run:

mvn spring-boot:run
6. Open the Application

Open your browser:

http://localhost:8080

Login using your registered ADMIN or EMPLOYEE credentials.

## 🧪 API Testing

The REST APIs can be tested using Postman.

Testing Flow
1. Login
      ↓
2. Receive JWT Token
      ↓
3. Copy JWT Token
      ↓
4. Add Bearer Token
      ↓
5. Call Protected APIs
      ↓
6. Verify API Response

Example Authorization:
Authorization: Bearer <JWT_TOKEN>

## 🔒 Security
The application implements:

JWT authentication
BCrypt password hashing
Role-based authorization
Protected REST endpoints
Employee-specific attendance access
Global exception handling
Input validation
Unauthorized request handling
Resource-not-found handling

##💻 Dashboard
The web dashboard provides a centralized interface for:

┌──────────────────────────────────────┐
│       EMPLOYEE ATTENDANCE            │
│             DASHBOARD                │
├──────────────────────────────────────┤
│                                      │
│  Today's Status                      │
│  ├── Check-In                        │
│  ├── Check-Out                       │
│  └── Attendance Status               │
│                                      │
│  Office Location                     │
│  └── Geofence Information             │
│                                      │
│  Employee Management                 │
│  └── Add / Edit / Delete Employees  │
│                                      │
│  Attendance Reports                  │
│  └── Date-Based Attendance           │
│                                      │
└──────────────────────────────────────┘

## 🛡️ Exception Handling

The backend provides centralized exception handling for common API errors.
Examples include:

400 → Validation / Attendance errors
401 → Unauthorized request
403 → Access denied
404 → Resource not found

This provides consistent and meaningful API responses.

## 🔮 Future Enhancements

Possible future improvements include:

📍 Live browser GPS integration
📱 Mobile-friendly employee application
📧 Email notifications
📊 Advanced attendance analytics
📅 Monthly and yearly reports
📥 Excel/PDF report export
☁️ Cloud deployment
🔔 Attendance reminders
🤝 Contributing

Contributions are welcome.

git checkout -b feature/your-feature
git add .
git commit -m "Add your feature"
git push origin feature/your-feature

Then create a Pull Request.

📄 License
This project is licensed under the MIT License.
