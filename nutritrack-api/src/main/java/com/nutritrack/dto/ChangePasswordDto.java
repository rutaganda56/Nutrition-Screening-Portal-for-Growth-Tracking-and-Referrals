package com.nutritrack.dto;

import jakarta.validation.constraints.NotEmpty;

public record ChangePasswordDto(
        @NotEmpty String currentPassword,
        @NotEmpty String newPassword
) {}
