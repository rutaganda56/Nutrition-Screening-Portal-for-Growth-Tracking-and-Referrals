package com.nutritrack.mapper;

import com.nutritrack.dto.PatientResponseDto;
import com.nutritrack.model.Patient;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;

@Service
public class PatientMapper {

    public PatientResponseDto toResponseDto(Patient patient) {
        return new PatientResponseDto(
                patient.getId(),
                patient.getPatientCode(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getBirthDate(),
                computeAge(patient.getBirthDate()),
                patient.getGender(),
                patient.getGuardianFirstName(),
                patient.getGuardianLastName(),
                patient.getGuardianPhone(),
                patient.getRegisteredBy() != null ? patient.getRegisteredBy().getFullName() : null,
                patient.getFacility() != null ? patient.getFacility().getName() : null,
                patient.getCurrentStatus(),
                patient.getLastScreeningDate(),
                patient.getTotalScreenings(),
                patient.getCreatedAt()
        );
    }

    private String computeAge(LocalDate birthDate) {
        if (birthDate == null) return "";
        Period period = Period.between(birthDate, LocalDate.now());
        return period.getYears() + "y " + period.getMonths() + "m";
    }
}
