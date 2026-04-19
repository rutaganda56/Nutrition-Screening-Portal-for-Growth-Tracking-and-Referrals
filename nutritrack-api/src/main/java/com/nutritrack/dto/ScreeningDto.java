package com.nutritrack.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ScreeningDto(
        @NotNull Long patientId,
        @NotNull BigDecimal weightKg,
        @NotNull BigDecimal heightCm,
        @NotNull BigDecimal muacCm,
        boolean edema,
        String appetite,
        String observationNotes,
        @NotNull LocalDate screeningDate
) {}
