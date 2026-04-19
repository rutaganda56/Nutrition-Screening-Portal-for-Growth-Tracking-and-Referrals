package com.nutritrack.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AlertResponseDto(
        Long id,
        String alertCode,
        String alertType,
        Long patientId,
        String patientName,
        String message,
        String status,
        LocalDate dueDate,
        String assignedToName,
        LocalDateTime createdAt
) {}
