package com.employee.attendance_geofencing.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.employee.attendance_geofencing.dto.AttendanceResponse;
import com.employee.attendance_geofencing.dto.CheckInRequest;
import com.employee.attendance_geofencing.dto.CheckOutRequest;
import com.employee.attendance_geofencing.entity.Attendance;
import com.employee.attendance_geofencing.entity.Employee;
import com.employee.attendance_geofencing.entity.OfficeLocation;
import com.employee.attendance_geofencing.exception.AttendanceException;
import com.employee.attendance_geofencing.exception.ResourceNotFoundException;
import com.employee.attendance_geofencing.repository.AttendanceRepository;
import com.employee.attendance_geofencing.repository.EmployeeRepository;
import com.employee.attendance_geofencing.repository.OfficeLocationRepository;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final OfficeLocationRepository officeLocationRepository;

    @Value("${office.location.id}")
    private Long officeLocationId;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            EmployeeRepository employeeRepository,
            OfficeLocationRepository officeLocationRepository) {

        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
        this.officeLocationRepository = officeLocationRepository;
    }

    public List<AttendanceResponse> getAllAttendances() {
        return attendanceRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public AttendanceResponse getAttendanceById(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Attendance not found")
                );

        return convertToResponse(attendance);
    }

    public Attendance updateAttendance(Long id, Attendance attendance) {
        Attendance existingAttendance = attendanceRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Attendance not found")
                );

        existingAttendance.setEmployee(attendance.getEmployee());
        existingAttendance.setDate(attendance.getDate());
        existingAttendance.setCheckInTime(attendance.getCheckInTime());
        existingAttendance.setCheckOutTime(attendance.getCheckOutTime());
        existingAttendance.setStatus(attendance.getStatus());

        return attendanceRepository.save(existingAttendance);
    }

    public void deleteAttendance(Long id) {
        Attendance existingAttendance = attendanceRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Attendance not found")
                );

        attendanceRepository.delete(existingAttendance);
    }

    public AttendanceResponse checkIn(CheckInRequest request) {

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElse(null);

        OfficeLocation officeLocation =
                officeLocationRepository.findById(officeLocationId)
                        .orElse(null);

        if (employee == null) {
            throw new AttendanceException("Employee not found");
        }

        if (!"ACTIVE".equalsIgnoreCase(employee.getStatus())) {
            throw new AttendanceException(
                    "Employee is inactive and cannot check in");
        }

        if (officeLocation == null) {
            throw new AttendanceException("Office location not found");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();

        if (now.toLocalTime().isAfter(LocalTime.of(10, 30))) {
            throw new AttendanceException(
                    "Check-in is not allowed after 10:30 AM.");
        }

        boolean alreadyCheckedIn =
                attendanceRepository.existsByEmployeeAndDate(employee, today);

        if (alreadyCheckedIn) {
            throw new AttendanceException(
                    "Employee has already checked in today.");
        }

        double distance = calculateDistance(
                request.getLatitude(),
                request.getLongitude(),
                officeLocation.getLatitude(),
                officeLocation.getLongitude()
        );

        if (distance > officeLocation.getRadius()) {
            throw new AttendanceException(
                    "Check-in rejected. You are outside the office geofence.");
        }

        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setDate(today);
        attendance.setCheckInTime(now);
        attendance.setStatus("PRESENT");

        Attendance savedAttendance =
                attendanceRepository.save(attendance);

        return convertToResponse(savedAttendance);
    }

    private double calculateDistance(
            double employeeLatitude,
            double employeeLongitude,
            double officeLatitude,
            double officeLongitude) {

        double earthRadius = 6371000;

        double latitudeDifference =
                Math.toRadians(officeLatitude - employeeLatitude);

        double longitudeDifference =
                Math.toRadians(officeLongitude - employeeLongitude);

        double a =
                Math.sin(latitudeDifference / 2)
                        * Math.sin(latitudeDifference / 2)
                + Math.cos(Math.toRadians(employeeLatitude))
                        * Math.cos(Math.toRadians(officeLatitude))
                        * Math.sin(longitudeDifference / 2)
                        * Math.sin(longitudeDifference / 2);

        double c =
                2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return earthRadius * c;
    }

    public AttendanceResponse checkOut(CheckOutRequest request) {

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElse(null);

        if (employee == null) {
            throw new AttendanceException("Employee not found");
        }

        if (!"ACTIVE".equalsIgnoreCase(employee.getStatus())) {
            throw new AttendanceException(
                    "Employee is inactive and cannot check out");
        }

        OfficeLocation officeLocation =
                officeLocationRepository.findById(officeLocationId)
                        .orElse(null);

        if (officeLocation == null) {
            throw new AttendanceException("Office location not found");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();

        if (now.toLocalTime().isBefore(LocalTime.of(17, 0))) {
            throw new AttendanceException(
                    "Check-out is allowed only after 5:00 PM.");
        }

        Attendance attendance =
                attendanceRepository.findByEmployeeAndDate(employee, today)
                        .orElse(null);

        if (attendance == null) {
            throw new AttendanceException(
                    "No check-in record found for today.");
        }

        if (attendance.getCheckOutTime() != null) {
            throw new AttendanceException(
                    "Employee has already checked out today.");
        }

        double distance = calculateDistance(
                request.getLatitude(),
                request.getLongitude(),
                officeLocation.getLatitude(),
                officeLocation.getLongitude()
        );

        if (distance > officeLocation.getRadius()) {
            throw new AttendanceException(
                    "Check-out rejected. You are outside the office geofence.");
        }

        attendance.setCheckOutTime(now);
        attendance.setStatus("COMPLETED");

        Attendance savedAttendance =
                attendanceRepository.save(attendance);

        return convertToResponse(savedAttendance);
    }

    public List<AttendanceResponse> getAttendanceByEmployee(
            Long employeeId,
            String loggedInEmail,
            String loggedInRole) {

        Employee loggedInEmployee =
                employeeRepository.findByEmail(loggedInEmail)
                        .orElse(null);

        if (loggedInEmployee == null) {
            throw new AttendanceException(
                    "Logged-in employee not found");
        }

        if ("ADMIN".equals(loggedInRole)) {

            Employee employee =
                    employeeRepository.findById(employeeId)
                            .orElse(null);

            if (employee == null) {
                throw new AttendanceException("Employee not found");
            }

            return attendanceRepository.findByEmployee(employee)
                    .stream()
                    .map(this::convertToResponse)
                    .toList();
        }

        if (!loggedInEmployee.getEmployeeId().equals(employeeId)) {
            throw new AttendanceException(
                    "You can view only your own attendance");
        }

        return attendanceRepository.findByEmployee(loggedInEmployee)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public List<AttendanceResponse> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public List<AttendanceResponse> getTodayAttendance() {
        return attendanceRepository.findByDate(LocalDate.now())
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    private AttendanceResponse convertToResponse(Attendance attendance) {

        AttendanceResponse response = new AttendanceResponse();

        response.setAttendanceId(attendance.getAttendanceId());
        response.setDate(attendance.getDate());
        response.setCheckInTime(attendance.getCheckInTime());
        response.setCheckOutTime(attendance.getCheckOutTime());
        response.setStatus(attendance.getStatus());

        Employee employee = attendance.getEmployee();

        response.setEmployeeId(employee.getEmployeeId());
        response.setEmployeeName(employee.getName());
        response.setEmployeeEmail(employee.getEmail());
        response.setDesignation(employee.getDesignation());
        response.setRole(employee.getRole());

        return response;
    }
}