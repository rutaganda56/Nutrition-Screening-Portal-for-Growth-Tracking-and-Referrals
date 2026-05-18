package com.nutritrack.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ScreeningDto(
        @NotNull Long patientId,
        @NotNull BigDecimal weightKg,
        @NotNull BigDecimal heightCm,
        @NotNull BigDecimal muacCm,
        String appetite,
        String observationNotes,
        @NotNull String screeningDate
) {}
