package com.employee.attendance_geofencing.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.employee.attendance_geofencing.entity.Department;

public interface DepartmentRepository extends JpaRepository<Department, Long>{

}
