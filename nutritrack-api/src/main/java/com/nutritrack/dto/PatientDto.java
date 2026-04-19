package com.nutritrack.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PatientDto(
        @NotEmpty String firstName,
        @NotEmpty String lastName,
        @NotNull @Past LocalDate birthDate,
        @NotEmpty String gender,
        BigDecimal birthWeightKg,
        BigDecimal birthLengthCm,
        @NotEmpty String guardianFirstName,
        @NotEmpty String guardianLastName,
        @NotEmpty String guardianRelationship,
        @NotEmpty String guardianPhone,
        String guardianAltPhone,
        @NotEmpty String village,
        @NotEmpty String zone,
        String householdId,
        @NotEmpty String address,
        String notes,
        @NotNull Long facilityId
) {}
