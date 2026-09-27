package com.employee.attendance_geofencing.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.employee.attendance_geofencing.entity.OfficeLocation;

public interface OfficeLocationRepository extends JpaRepository<OfficeLocation, Long> {

}
