package com.nutritrack.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ReferralDto(
        @NotNull Long patientId,
        Long serviceRequestId,
        @NotEmpty String referredTo,
        @NotEmpty String priority,
        @NotEmpty String urgency,
        @NotEmpty String diagnosis,
        @NotEmpty String referralReason,
        boolean transportArranged,
        LocalDate followUpDate
) {}
