package com.nutritrack.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record ClinicalAssessmentDto(
        @NotNull Long serviceRequestId,
        @NotNull Long patientId,
        @NotEmpty String diagnosis,
        @NotEmpty String severity
) {}
