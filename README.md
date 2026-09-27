##Employee Attendance Management System with Geofencing

A Spring Boot-based Employee Attendance Management System that lets employees check in and check out based on their configured office location using geofencing.
The system provides JWT authentication, role-based access control, employee management, attendance tracking, and reporting through a responsive web dashboard.

---
#Table of Contents
Features
Tech Stack
Project Structure
Prerequisites
Getting Started
Geofencing
Attendance Flow
Contributing
License
---
#Features
Category	Details

Authentication	JWT-based login with role-based access control (Admin, Employee)
Employee Management	Add, update, and manage employee records
Department Management	Organize employees by department
Office Location	Configure one or more office locations for geofencing
Attendance	Check-in/check-out validated against office geofence and time window
Time Rules	Check-in allowed until 10:30 AM · Check-out allowed after 5:00 PM
Duplicate Prevention	Blocks duplicate check-in and check-out for the same day
Reporting	Attendance history, per-employee history, and today's attendance report
Reliability	Input validation and global exception handling
UI	Responsive web dashboard
---
## 🛠️Tech Stack
Backend
Java 21
Spring Boot 4.1.1
Spring Security
JWT
Spring Data JPA / Hibernate
Maven
Database
MySQL
Frontend
HTML, CSS, JavaScript
Tools
Spring Tool Suite (STS) / Eclipse
Postman
Git & GitHub
---

## 📂Project Structure

attendance-geofencing
│
├── src/main/java
│   └── com.employee.attendance_geofencing
│       ├── controller
│       ├── service
│       ├── repository
│       ├── entity
│       ├── dto
│       ├── security
│       └── exception
│
├── src/main/resources
│   ├── static
│   │   ├── index.html
│   │   ├── style.css
│   │   ├── script.js
│   │   ├── dashboard.html
│   │   ├── dashboard.css
│   │   └── dashboard.js
│   │
│   └── application.properties
│
├── pom.xml
└── README.md
```
---
## Prerequisites

Make sure you have the following installed before setting up the project:
Java Development Kit (JDK) 21+
Maven 3.8+
MySQL 8.0+
Spring Tool Suite (STS) or Eclipse (optional, for IDE-based development)
Postman (optional, for API testing)
---
## 🚀How to Run
1. Clone the Repository
```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd attendance-geofencing
```
2. Open the Project
Open the project in Spring Tool Suite (STS) or Eclipse as an existing Maven project.

3. Create the MySQL Database
```sql
CREATE DATABASE employee_attendance;
```

4. Configure the Application
Edit `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/employee_attendance
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

spring.jpa.hibernate.ddl-auto=update

jwt.secret=YOUR_JWT_SECRET

office.location.id=1
```
> **Note:** Replace `YOUR_MYSQL_PASSWORD` and `YOUR_JWT_SECRET` with your own values before running the application.

5. Run the Application
From STS/Eclipse, run:
```
AttendanceGeofencingApplication.java
```
Or from the command line:
```bash
mvn spring-boot:run
```

6. Access the Application
Open your browser and go to:
```
http://localhost:8080
```

7. Log In
Log in with your registered Employee or Admin credentials, then use the dashboard to check in, check out, and view attendance reports.
---

## Geofencing
The system checks the distance between an employee's current coordinates and the configured office location before allowing attendance.
```
Employee Location
        │
        ▼
Calculate Distance
        │
        ▼
Compare to Office Radius
        │
   ┌────┴────┐
   ▼         ▼
Within     Outside
Radius     Radius
   │         │
   ▼         ▼
Allowed    Rejected
```
The active office is set using:
```properties
office.location.id=1
```
---
## Attendance Flow
Check-In
```
Login → JWT Authentication → Dashboard → Check-In
   → Validate Employee → Validate Time → Validate Office Location
   → Attendance Recorded
```

Check-Out
```text
Check-Out → Validate Employee → Validate Time → Validate Office Location
   → Attendance Completed
```
---
## Contributing
Contributions are welcome. To contribute:
Fork the repository
Create a feature branch (`git checkout -b feature/your-feature`)
Commit your changes (`git commit -m "Add your feature"`)
Push to the branch (`git push origin feature/your-feature`)
Open a Pull Request
---
## License
This project is licensed under the MIT License.