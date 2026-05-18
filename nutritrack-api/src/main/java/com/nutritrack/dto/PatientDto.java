package com.nutritrack.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record PatientDto(
        @NotEmpty String firstName,
        @NotEmpty String lastName,
        @NotNull String birthDate,
        @NotEmpty String gender,
        @NotEmpty String guardianFirstName,
        @NotEmpty String guardianLastName,
        @NotEmpty String guardianRelationship,
        @NotEmpty String guardianPhone,
        String notes
) {}
