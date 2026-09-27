package com.employee.attendance_geofencing.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.employee.attendance_geofencing.entity.Attendance;
import com.employee.attendance_geofencing.entity.Employee;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

	boolean existsByEmployeeAndDate(Employee employee, LocalDate date);

	Optional<Attendance> findByEmployeeAndDate(Employee employee, LocalDate date);

	List<Attendance> findByEmployee(Employee employee);

	List<Attendance> findByDate(LocalDate date);
}