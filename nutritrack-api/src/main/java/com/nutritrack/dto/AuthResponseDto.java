package com.nutritrack.dto;

public record AuthResponseDto(
        String token,
        String tokenType,
        long expiresIn,
        UserResponseDto user
) {}
