package com.nutritrack.dto;

public record FacilityResponseDto(
        Long id,
        String name,
        String type,
        String status,
        String location,
        String phone,
        String email,
        int staff,
        int capacity,
        String services
) {}
