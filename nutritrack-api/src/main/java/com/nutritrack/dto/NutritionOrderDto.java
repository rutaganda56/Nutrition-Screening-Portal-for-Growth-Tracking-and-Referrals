package com.nutritrack.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record NutritionOrderDto(
        @NotNull Long patientId,
        Long screeningId,
        Long serviceRequestId,
        @NotEmpty String orderType,
        String supplement,
        String dosage,
        String frequency,
        String duration,
        @NotEmpty String instructions,
        LocalDate startDate,
        LocalDate endDate
) {}
