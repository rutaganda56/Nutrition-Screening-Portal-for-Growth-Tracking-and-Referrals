package com.nutritrack.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record FollowUpDto(
        @NotNull Long patientId,
        @NotNull Long assignedToId,
        @NotEmpty String followupType,
        @NotEmpty String message,
        @NotNull LocalDate dueDate
) {}
