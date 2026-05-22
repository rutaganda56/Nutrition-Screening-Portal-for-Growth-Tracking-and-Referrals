package com.nutritrack.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterDto(
        @NotEmpty String fullName,
        @NotEmpty @Email String email,
        @NotEmpty @Pattern(regexp = "^[0-9+\\-() ]+$", message = "Invalid phone number") String phone,
        @NotEmpty @Size(min = 6, message = "Password must be at least 6 characters") String password,
        @NotEmpty @Pattern(regexp = "^(DOCTOR|COMMUNITY_HEALTH_WORKER|ADMINISTRATOR)$",
                message = "Role must be DOCTOR, COMMUNITY_HEALTH_WORKER, or ADMINISTRATOR") String role,
        String department,
        Long facilityId
) {}
