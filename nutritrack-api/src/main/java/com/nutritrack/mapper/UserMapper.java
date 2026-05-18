package com.nutritrack.mapper;

import com.nutritrack.dto.UserDto;
import com.nutritrack.dto.UserResponseDto;
import com.nutritrack.model.Users;
import org.springframework.stereotype.Service;

@Service
public class UserMapper {

    public Users toEntity(UserDto dto) {
        Users user = new Users();
        user.setFullName(dto.fullName());
        user.setEmail(dto.email());
        user.setPhone(dto.phone());
        user.setRole(dto.role());
        user.setStatus(dto.status() != null ? dto.status() : "ACTIVE");
        return user;
    }

    public UserResponseDto toResponseDto(Users user) {
        return new UserResponseDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getStatus(),
                user.getFacility() != null ? user.getFacility().getName() : null,
                user.getCreatedAt());
    }
}
