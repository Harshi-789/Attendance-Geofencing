package com.employee.attendance_geofencing.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.employee.attendance_geofencing.dto.AttendanceResponse;
import com.employee.attendance_geofencing.dto.CheckInRequest;
import com.employee.attendance_geofencing.dto.CheckOutRequest;
import com.employee.attendance_geofencing.entity.Attendance;
import com.employee.attendance_geofencing.service.AttendanceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/attendances")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public List<AttendanceResponse> getAllAttendances() {
        return attendanceService.getAllAttendances();
    }

    @GetMapping("/{id}")
    public AttendanceResponse getAttendanceById(@PathVariable Long id) {
        return attendanceService.getAttendanceById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Attendance updateAttendance(
            @PathVariable Long id,
            @RequestBody Attendance attendance) {

        return attendanceService.updateAttendance(id, attendance);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return "Attendance deleted successfully";
    }

    @PostMapping("/check-in")
    public AttendanceResponse checkIn(
            @Valid @RequestBody CheckInRequest request) {

        return attendanceService.checkIn(request);
    }

    @PostMapping("/check-out")
    public AttendanceResponse checkOut(
            @Valid @RequestBody CheckOutRequest request) {

        return attendanceService.checkOut(request);
    }

    @GetMapping("/employee/{employeeId}")
    public List<AttendanceResponse> getAttendanceByEmployee(
            @PathVariable Long employeeId,
            Authentication authentication) {

        String email = authentication.getName();

        String role = authentication.getAuthorities()
                .iterator()
                .next()
                .getAuthority()
                .replace("ROLE_", "");

        return attendanceService.getAttendanceByEmployee(
                employeeId,
                email,
                role
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/date/{date}")
    public List<AttendanceResponse> getAttendanceByDate(
            @PathVariable LocalDate date) {

        return attendanceService.getAttendanceByDate(date);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/today")
    public List<AttendanceResponse> getTodayAttendance() {
        return attendanceService.getTodayAttendance();
    }
}