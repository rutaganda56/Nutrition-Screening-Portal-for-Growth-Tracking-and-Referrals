package com.nutritrack.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ScreeningResponseDto(
        Long id,
        String screeningCode,
        Long patientId,
        String patientName,
        String conductedByName,
        String facilityName,
        LocalDate screeningDate,
        BigDecimal weightKg,
        BigDecimal heightCm,
        BigDecimal muacCm,
        boolean edema,
        String classification,   // server-calculated
        BigDecimal zScore,
        String appetite,
        String observationNotes,
        String recommendation,   // server-generated
        LocalDateTime createdAt
) {}
