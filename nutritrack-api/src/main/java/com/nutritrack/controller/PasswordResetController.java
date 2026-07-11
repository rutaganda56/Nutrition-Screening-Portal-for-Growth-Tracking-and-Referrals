package com.nutritrack.controller;

import com.nutritrack.dto.ForgotPasswordDto;
import com.nutritrack.dto.ResetPasswordDto;
import com.nutritrack.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class PasswordResetController {

    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordDto dto) {
        passwordResetService.processForgotPassword(dto.email());
        return ResponseEntity.ok(Map.of("message", "If your email is registered, a reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordDto dto) {
        try {
            passwordResetService.resetPassword(dto.token(), dto.newPassword());
            return ResponseEntity.ok(Map.of("message", "Password reset successfully."));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
}
