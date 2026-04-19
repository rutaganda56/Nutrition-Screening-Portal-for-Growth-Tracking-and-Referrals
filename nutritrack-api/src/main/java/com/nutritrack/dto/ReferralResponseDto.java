package com.nutritrack.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ReferralResponseDto(
        Long id,
        String referralCode,
        Long patientId,
        String patientName,
        String patientAge,
        String referredTo,
        String priority,
        String urgency,
        String diagnosis,
        String referralReason,
        boolean transportArranged,
        String status,
        LocalDate referredDate,
        LocalDate followUpDate,
        String referredByName,
        LocalDateTime createdAt
) {}
