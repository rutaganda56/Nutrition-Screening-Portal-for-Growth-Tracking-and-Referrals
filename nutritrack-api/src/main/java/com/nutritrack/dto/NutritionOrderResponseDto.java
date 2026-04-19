package com.nutritrack.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record NutritionOrderResponseDto(
        Long id,
        String orderCode,
        Long patientId,
        String patientName,
        String orderType,
        String supplement,
        String dosage,
        String frequency,
        String duration,
        String instructions,
        LocalDate startDate,
        LocalDate endDate,
        String status,
        String prescribedByName,
        LocalDateTime createdAt
) {}
