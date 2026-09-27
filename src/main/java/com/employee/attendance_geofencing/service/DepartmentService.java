package com.employee.attendance_geofencing.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.employee.attendance_geofencing.entity.Department;
import com.employee.attendance_geofencing.exception.ResourceNotFoundException;
import com.employee.attendance_geofencing.repository.DepartmentRepository;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public Department createDepartment(Department department) {
        return departmentRepository.save(department);
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Department getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Department not found")
                );

        return department;
    }

    public Department updateDepartment(Long id, Department department) {
        Department existingDepartment = departmentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Department not found")
                );

        existingDepartment.setDepartmentName(
                department.getDepartmentName()
        );

        return departmentRepository.save(existingDepartment);
    }

    public void deleteDepartment(Long id) {
        Department existingDepartment = departmentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Department not found")
                );

        departmentRepository.delete(existingDepartment);
    }
}