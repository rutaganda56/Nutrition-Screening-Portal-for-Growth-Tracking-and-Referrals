package com.nutritrack.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record AlertDto(
        @NotNull Long patientId,
        @NotNull Long assignedToId,
        @NotEmpty String alertType,
        @NotEmpty String message,
        LocalDate dueDate
) {}
