package com.employee.attendance_geofencing.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.employee.attendance_geofencing.entity.OfficeLocation;
import com.employee.attendance_geofencing.exception.ResourceNotFoundException;
import com.employee.attendance_geofencing.repository.OfficeLocationRepository;

@Service
public class OfficeLocationService {

    private final OfficeLocationRepository officeLocationRepository;

    public OfficeLocationService(OfficeLocationRepository officeLocationRepository) {
        this.officeLocationRepository = officeLocationRepository;
    }

    public OfficeLocation createOfficeLocation(OfficeLocation officeLocation) {
        return officeLocationRepository.save(officeLocation);
    }

    public List<OfficeLocation> getAllOfficeLocations() {
        return officeLocationRepository.findAll();
    }

    public OfficeLocation getOfficeLocationById(Long id) {
        return officeLocationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Office location not found")
                );
    }

    public OfficeLocation updateOfficeLocation(
            Long id,
            OfficeLocation officeLocation) {

        OfficeLocation existingOfficeLocation =
                officeLocationRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Office location not found")
                        );

        existingOfficeLocation.setOfficeName(
                officeLocation.getOfficeName());

        existingOfficeLocation.setLatitude(
                officeLocation.getLatitude());

        existingOfficeLocation.setLongitude(
                officeLocation.getLongitude());

        existingOfficeLocation.setRadius(
                officeLocation.getRadius());

        return officeLocationRepository.save(existingOfficeLocation);
    }

    public void deleteOfficeLocation(Long id) {
        OfficeLocation existingOfficeLocation =
                officeLocationRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Office location not found")
                        );

        officeLocationRepository.delete(existingOfficeLocation);
    }
}