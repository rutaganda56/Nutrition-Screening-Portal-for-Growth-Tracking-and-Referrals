package com.nutritrack.dto;

import java.time.LocalDateTime;

public record UserResponseDto(
        Long id,
        String fullName,
        String email,
        String phone,
        String role,
        String department,
        String status,
        String facilityName,
        LocalDateTime createdAt
) {}
