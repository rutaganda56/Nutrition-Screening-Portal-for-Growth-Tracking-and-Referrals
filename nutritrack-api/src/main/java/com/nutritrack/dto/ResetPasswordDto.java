package com.nutritrack.dto;

import jakarta.validation.constraints.NotEmpty;

public record ResetPasswordDto(
        @NotEmpty String token,
        @NotEmpty String newPassword
) {}
