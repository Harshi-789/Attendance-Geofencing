package com.employee.attendance_geofencing.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.employee.attendance_geofencing.dto.EmployeeResponse;
import com.employee.attendance_geofencing.entity.Employee;
import com.employee.attendance_geofencing.exception.ResourceNotFoundException;
import com.employee.attendance_geofencing.repository.EmployeeRepository;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(EmployeeRepository employeeRepository,
                           PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public EmployeeResponse createEmployee(Employee employee) {
        employee.setPassword(
                passwordEncoder.encode(employee.getPassword())
        );

        Employee savedEmployee = employeeRepository.save(employee);

        return convertToResponse(savedEmployee);
    }

    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found")
                );

        return convertToResponse(employee);
    }

    public EmployeeResponse updateEmployee(Long id, Employee employee) {
        Employee existingEmployee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found")
                );

        existingEmployee.setName(employee.getName());
        existingEmployee.setEmail(employee.getEmail());
        existingEmployee.setPhone(employee.getPhone());
        existingEmployee.setDesignation(employee.getDesignation());
        existingEmployee.setRole(employee.getRole());
        existingEmployee.setStatus(employee.getStatus());
        existingEmployee.setDepartment(employee.getDepartment());

        if (employee.getPassword() != null &&
                !employee.getPassword().isBlank()) {

            existingEmployee.setPassword(
                    passwordEncoder.encode(employee.getPassword())
            );
        }

        Employee savedEmployee = employeeRepository.save(existingEmployee);

        return convertToResponse(savedEmployee);
    }

    public void deleteEmployee(Long id) {
        Employee existingEmployee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found")
                );

        employeeRepository.delete(existingEmployee);
    }

    private EmployeeResponse convertToResponse(Employee employee) {
        EmployeeResponse response = new EmployeeResponse();

        response.setEmployeeId(employee.getEmployeeId());
        response.setName(employee.getName());
        response.setEmail(employee.getEmail());
        response.setPhone(employee.getPhone());
        response.setDesignation(employee.getDesignation());
        response.setRole(employee.getRole());
        response.setStatus(employee.getStatus());

        if (employee.getDepartment() != null) {
            response.setDepartmentId(
                    employee.getDepartment().getDepartmentId()
            );

            response.setDepartmentName(
                    employee.getDepartment().getDepartmentName()
            );
        }

        return response;
    }
}