package com.nutritrack.dto;

import java.time.LocalDateTime;

public record UserResponseDto(
        Long id,
        String fullName,
        String email,
        String phone,
        String role,
        String status,
        String facilityName,
        Long facilityId,
        LocalDateTime createdAt
) {}
