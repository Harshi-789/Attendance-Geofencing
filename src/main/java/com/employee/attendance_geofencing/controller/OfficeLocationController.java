package com.employee.attendance_geofencing.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.employee.attendance_geofencing.entity.OfficeLocation;
import com.employee.attendance_geofencing.service.OfficeLocationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/office-locations")
public class OfficeLocationController {

    private final OfficeLocationService officeLocationService;

    public OfficeLocationController(OfficeLocationService officeLocationService) {
        this.officeLocationService = officeLocationService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public OfficeLocation createOfficeLocation(
            @Valid @RequestBody OfficeLocation officeLocation) {

        return officeLocationService.createOfficeLocation(officeLocation);
    }

    @GetMapping
    public List<OfficeLocation> getAllOfficeLocations() {
        return officeLocationService.getAllOfficeLocations();
    }

    @GetMapping("/{id}")
    public OfficeLocation getOfficeLocationById(@PathVariable Long id) {
        return officeLocationService.getOfficeLocationById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public OfficeLocation updateOfficeLocation(
            @PathVariable Long id,
            @RequestBody OfficeLocation officeLocation) {

        return officeLocationService.updateOfficeLocation(id, officeLocation);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteOfficeLocation(@PathVariable Long id) {
        officeLocationService.deleteOfficeLocation(id);
        return "Office location deleted successfully";
    }
}