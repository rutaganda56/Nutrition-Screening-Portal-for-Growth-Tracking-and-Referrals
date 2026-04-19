package com.nutritrack.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PatientResponseDto(
        Long id,
        String patientCode,
        String firstName,
        String lastName,
        LocalDate birthDate,
        String ageDisplay,       // computed: e.g. "2y 4m"
        String gender,
        String guardianFirstName,
        String guardianLastName,
        String guardianPhone,
        String householdId,
        String village,
        String zone,
        String address,
        String facilityName,
        String registeredByName,
        String currentStatus,
        LocalDate lastScreeningDate,
        int totalScreenings,
        LocalDateTime createdAt
) {}
