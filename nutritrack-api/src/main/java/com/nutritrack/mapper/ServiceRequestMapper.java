package com.nutritrack.mapper;

import com.nutritrack.dto.ServiceRequestResponseDto;
import com.nutritrack.model.ServiceRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;

@Service
public class ServiceRequestMapper {

    public ServiceRequestResponseDto toResponseDto(ServiceRequest sr) {
        String patientName = sr.getPatient() != null
                ? sr.getPatient().getFirstName() + " " + sr.getPatient().getLastName() : null;
        String patientAge = sr.getPatient() != null ? computeAge(sr.getPatient().getBirthDate()) : null;
        return new ServiceRequestResponseDto(
                sr.getId(),
                sr.getRequestCode(),
                sr.getPatient() != null ? sr.getPatient().getId() : null,
                patientName,
                patientAge,
                sr.getPatient() != null ? sr.getPatient().getHouseholdId() : null,
                sr.getPriority(),
                sr.getStatus(),
                sr.getReasonCode(),
                sr.getDescription(),
                sr.getSubmittedBy() != null ? sr.getSubmittedBy().getFullName() : null,
                sr.getAssignedTo() != null ? sr.getAssignedTo().getFullName() : null,
                sr.getScreening() != null ? sr.getScreening().getScreeningCode() : null,
                sr.getScreening() != null ? sr.getScreening().getClassification() : null,
                sr.getScreening() != null ? sr.getScreening().getWeightKg() : null,
                sr.getScreening() != null ? sr.getScreening().getHeightCm() : null,
                sr.getScreening() != null ? sr.getScreening().getMuacCm() : null,
                sr.getScreening() != null && sr.getScreening().isEdema(),
                sr.getSubmittedAt()
        );
    }

    private String computeAge(LocalDate birthDate) {
        if (birthDate == null) return "";
        Period period = Period.between(birthDate, LocalDate.now());
        return period.getYears() + "y " + period.getMonths() + "m";
    }
}
