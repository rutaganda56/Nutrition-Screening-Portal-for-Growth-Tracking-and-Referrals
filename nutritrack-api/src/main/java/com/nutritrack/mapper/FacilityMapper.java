package com.nutritrack.mapper;

import com.nutritrack.dto.FacilityDto;
import com.nutritrack.dto.FacilityResponseDto;
import com.nutritrack.model.HealthFacility;
import org.springframework.stereotype.Service;

@Service
public class FacilityMapper {

    public HealthFacility toEntity(FacilityDto dto) {
        HealthFacility facility = new HealthFacility();
        facility.setName(dto.name());
        facility.setType(dto.type());
        facility.setLocation(dto.location());
        facility.setPhone(dto.phone());
        facility.setEmail(dto.email());
        facility.setStaff(dto.staff());
        facility.setCapacity(dto.capacity());
        facility.setServices(dto.services());
        facility.setStatus("ACTIVE");
        return facility;
    }

    public FacilityResponseDto toResponseDto(HealthFacility facility) {
        return new FacilityResponseDto(
                facility.getId(),
                facility.getName(),
                facility.getType(),
                facility.getStatus(),
                facility.getLocation(),
                facility.getPhone(),
                facility.getEmail(),
                facility.getStaff(),
                facility.getCapacity(),
                facility.getServices()
        );
    }
}
