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
import org.springframework.dao.DataIntegrityViolationException;

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

    @Autowired
    private JwtService jwtService;

    public UserResponseDto createUser(UserDto dto) {
        if (userRepository.existsByEmailIgnoreCase(dto.email())) {
            throw new RuntimeException("Email already registered");
        }
        Users user = new Users();
        user.setFullName(dto.fullName());
        user.setEmail(dto.email());
        user.setPhone(dto.phone());
        user.setRole(dto.role());
        user.setDepartment(dto.department());
        user.setStatus("ACTIVE");
        
        // Use provided temporary password or generate a temporary one
        String rawPassword = (dto.temporaryPassword() != null && !dto.temporaryPassword().isBlank()) 
                ? dto.temporaryPassword() 
                : "Temp@" + dto.fullName().replaceAll("\\s+", "").substring(0, Math.min(4, dto.fullName().replaceAll("\\s+", "").length())) + "123";
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
        if (userRepository.existsByEmailIgnoreCase(dto.email())) {
            throw new RuntimeException("Email already registered");
        }
        Users user = new Users();
        user.setFullName(dto.fullName());
        user.setEmail(dto.email());
        user.setPhone(dto.phone());
        user.setPassword(passwordEncoder.encode(dto.password()));
        user.setRole(dto.role());
        user.setStatus("ACTIVE");
        if (dto.facilityId() != null) {
            HealthFacility facility = facilityRepository.findById(dto.facilityId())
                    .orElseThrow(() -> new RuntimeException("Facility not found"));
            user.setFacility(facility);
        }
        try {
            return userMapper.toResponseDto(userRepository.save(user));
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Email already registered");
        }
    }

    public AuthResponseDto login(LoginDto dto) {
        Users user = userRepository.findByEmailIgnoreCase(dto.email());
        if (user == null) {
            throw new RuntimeException("Account not found with this email");
        }
        if (!passwordEncoder.matches(dto.password(), user.getPassword())) {
            throw new RuntimeException("Incorrect password");
        }
        if (!user.getRole().equalsIgnoreCase(dto.role())) {
            throw new RuntimeException("Role mismatch. You selected the wrong role.");
        }
        return new AuthResponseDto(
                jwtService.generateToken(user),
                "Bearer",
                jwtService.getExpirationMillis() / 1000,
                userMapper.toResponseDto(user));
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
        user.setDepartment(dto.department());
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
