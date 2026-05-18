package com.nutritrack.dto;

import jakarta.validation.constraints.NotEmpty;

public record FacilityDto(
        @NotEmpty String name,
        @NotEmpty String type,
        @NotEmpty String location,
        String phone,
        String email,
        int staff,
        int capacity,
        String services
) {}
