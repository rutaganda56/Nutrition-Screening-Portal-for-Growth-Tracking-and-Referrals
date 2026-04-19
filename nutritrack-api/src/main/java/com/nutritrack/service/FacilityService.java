package com.nutritrack.service;

import com.nutritrack.dto.FacilityDto;
import com.nutritrack.dto.FacilityResponseDto;
import com.nutritrack.mapper.FacilityMapper;
import com.nutritrack.model.HealthFacility;
import com.nutritrack.repository.HealthFacilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacilityService {

    @Autowired
    private HealthFacilityRepository facilityRepository;

    @Autowired
    private FacilityMapper facilityMapper;

    public List<FacilityResponseDto> getAllFacilities() {
        return facilityRepository.findAll().stream()
                .map(facilityMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public FacilityResponseDto getFacilityById(Long id) {
        HealthFacility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found"));
        return facilityMapper.toResponseDto(facility);
    }

    public FacilityResponseDto createFacility(FacilityDto dto) {
        HealthFacility facility = facilityMapper.toEntity(dto);
        return facilityMapper.toResponseDto(facilityRepository.save(facility));
    }

    public FacilityResponseDto updateFacility(Long id, FacilityDto dto) {
        HealthFacility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found"));
        facility.setName(dto.name());
        facility.setType(dto.type());
        facility.setLocation(dto.location());
        facility.setPhone(dto.phone());
        facility.setEmail(dto.email());
        facility.setStaff(dto.staff());
        facility.setCapacity(dto.capacity());
        facility.setServices(dto.services());
        return facilityMapper.toResponseDto(facilityRepository.save(facility));
    }

    public void deleteFacility(Long id) {
        facilityRepository.deleteById(id);
    }

    public FacilityResponseDto toggleStatus(Long id) {
        HealthFacility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found"));
        facility.setStatus("ACTIVE".equals(facility.getStatus()) ? "INACTIVE" : "ACTIVE");
        return facilityMapper.toResponseDto(facilityRepository.save(facility));
    }
}
