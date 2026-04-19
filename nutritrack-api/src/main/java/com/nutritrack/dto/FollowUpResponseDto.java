package com.nutritrack.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record FollowUpResponseDto(
        Long id,
        String followupCode,
        String followupType,
        Long patientId,
        String patientName,
        String message,
        LocalDate dueDate,
        String status,
        String assignedToName,
        LocalDateTime createdAt
) {}
