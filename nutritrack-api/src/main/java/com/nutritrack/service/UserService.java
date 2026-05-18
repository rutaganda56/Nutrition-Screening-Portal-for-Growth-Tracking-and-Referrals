package com.nutritrack.service;

import com.nutritrack.dto.*;
import com.nutritrack.mapper.UserMapper;
import com.nutritrack.model.HealthFacility;
import com.nutritrack.model.Users;
import com.nutritrack.repository.HealthFacilityRepository;
import com.nutritrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HealthFacilityRepository facilityRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public UserResponseDto createUser(UserDto dto) {
        if (userRepository.existsByEmail(dto.email())) {
            throw new RuntimeException("Email already registered");
        }
        Users user = new Users();
        user.setFullName(dto.fullName());
        user.setEmail(dto.email());
        user.setPhone(dto.phone());
        user.setRole(dto.role());
        user.setStatus("ACTIVE");
        // Use provided password or generate a temporary one
        String rawPassword = (dto.status() != null && !dto.status().isBlank()) ? dto.status() : "Temp@" + dto.fullName().replaceAll("\\s+", "").substring(0, Math.min(4, dto.fullName().replaceAll("\\s+", "").length())) + "123";
        user.setPassword(passwordEncoder.encode(rawPassword));
        if (dto.facilityId() != null) {
            HealthFacility facility = facilityRepository.findById(dto.facilityId())
                    .orElseThrow(() -> new RuntimeException("Facility not found"));
            user.setFacility(facility);
        }
        return userMapper.toResponseDto(userRepository.save(user));
    }

    public UserResponseDto changePassword(Long id, String currentPassword, String newPassword) {
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        return userMapper.toResponseDto(userRepository.save(user));
    }

    public UserResponseDto register(RegisterDto dto) {
        if (userRepository.existsByEmail(dto.email())) {
            throw new RuntimeException("Email already registered");
        }
        Users user = new Users();
        user.setFullName(dto.fullName());
        user.setEmail(dto.email());
        user.setPhone(dto.phone());
        user.setPassword(passwordEncoder.encode(dto.password()));
        user.setRole(dto.role());
        user.setStatus("ACTIVE");
        return userMapper.toResponseDto(userRepository.save(user));
    }

    public UserResponseDto login(LoginDto dto) {
        Users user = userRepository.findByEmail(dto.email());
        if (user == null || !passwordEncoder.matches(dto.password(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        return userMapper.toResponseDto(user);
    }

    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    public UserResponseDto getUserById(Long id) {
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userMapper.toResponseDto(user);
    }

    public UserResponseDto updateUser(Long id, UserDto dto) {
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setFullName(dto.fullName());
        user.setEmail(dto.email());
        user.setPhone(dto.phone());
        user.setRole(dto.role());
        if (dto.status() != null) user.setStatus(dto.status());
        if (dto.facilityId() != null) {
            HealthFacility facility = facilityRepository.findById(dto.facilityId())
                    .orElseThrow(() -> new RuntimeException("Facility not found"));
            user.setFacility(facility);
        }
        return userMapper.toResponseDto(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public UserResponseDto toggleStatus(Long id) {
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus("ACTIVE".equals(user.getStatus()) ? "INACTIVE" : "ACTIVE");
        return userMapper.toResponseDto(userRepository.save(user));
    }
}
