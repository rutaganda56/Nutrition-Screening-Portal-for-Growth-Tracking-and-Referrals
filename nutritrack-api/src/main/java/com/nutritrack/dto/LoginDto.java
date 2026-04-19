package com.nutritrack.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;

public record LoginDto(
        @NotEmpty @Email String email,
        @NotEmpty String password,
        @NotEmpty String role
) {}
