package com.nutritrack.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;

public record ForgotPasswordDto(
        @NotEmpty @Email String email
) {}
