package com.nutritrack.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;

public record UserDto(
        @NotEmpty String fullName,
        @NotEmpty @Email String email,
        String phone,
        @NotEmpty String role,
        String department,
        String status,
        Long facilityId,
        String temporaryPassword
) {}
