package com.nutritrack.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ServiceRequestResponseDto(
        Long id,
        String requestCode,
        Long patientId,
        String patientName,
        String patientAge,
        String householdId,
        String priority,
        String status,
        String reasonCode,
        String description,
        String submittedByName,
        String assignedToName,
        String screeningCode,
        String classification,
        BigDecimal weightKg,
        BigDecimal heightCm,
        BigDecimal muacCm,
        boolean edema,
        LocalDateTime submittedAt
) {}
