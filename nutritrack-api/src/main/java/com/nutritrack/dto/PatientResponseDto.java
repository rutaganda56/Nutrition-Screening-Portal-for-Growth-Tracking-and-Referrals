package com.nutritrack.dto;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PatientResponseDto(
        Long id,
        String patientCode,
        String firstName,
        String lastName,
        LocalDate birthDate,
        String age,
        String gender,
        String guardianFirstName,
        String guardianLastName,
        String guardianPhone,
        String registeredByName,
        String facilityName,
        String currentStatus,
        LocalDate lastScreeningDate,
        int totalScreenings,
        LocalDateTime createdAt
) {}
