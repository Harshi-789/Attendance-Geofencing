package com.employee.attendance_geofencing.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.employee.attendance_geofencing.dto.LoginRequest;
import com.employee.attendance_geofencing.entity.Employee;
import com.employee.attendance_geofencing.exception.AttendanceException;
import com.employee.attendance_geofencing.repository.EmployeeRepository;
import com.employee.attendance_geofencing.security.JwtService;

@Service
public class AuthService {

	private final EmployeeRepository employeeRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public AuthService(EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {

		this.employeeRepository = employeeRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	public String login(LoginRequest request) {

		Employee employee = employeeRepository.findByEmail(request.getEmail()).orElse(null);

		if (employee == null) {
			throw new AttendanceException("Invalid email or password");
		}

		boolean passwordMatches = passwordEncoder.matches(request.getPassword(), employee.getPassword());

		if (!passwordMatches) {
			throw new AttendanceException("Invalid email or password");
		}

		return jwtService.generateToken(employee.getEmail(), employee.getRole());
	}
}