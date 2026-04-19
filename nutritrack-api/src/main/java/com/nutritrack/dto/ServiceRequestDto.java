package com.nutritrack.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record ServiceRequestDto(
        @NotNull Long patientId,
        @NotNull Long screeningId,
        @NotEmpty String priority,
        @NotEmpty String reasonCode,
        @NotEmpty String description,
        Long assignedToId
) {}
