package com.nutritrack.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ClinicalAssessmentResponseDto(
        Long id,
        Long patientId,
        String patientName,
        String diagnosis,
        String severity,
        String assessedByName,
        LocalDate assessedAt,
        LocalDateTime createdAt
) {}
