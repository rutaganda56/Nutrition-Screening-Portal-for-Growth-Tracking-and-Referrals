package com.nutritrack.service;

import com.nutritrack.model.PasswordResetToken;
import com.nutritrack.model.Users;
import com.nutritrack.repository.PasswordResetTokenRepository;
import com.nutritrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public void processForgotPassword(String email) {
        System.out.println("=== FORGOT PASSWORD REQUEST for email: " + email + " ===");
        
        Users user = userRepository.findByEmailIgnoreCase(email);
        if (user == null) {
            System.err.println(">>> USER NOT FOUND in database for email: " + email);
            return;
        }
        
        System.out.println(">>> User found: " + user.getFullName() + " (" + user.getEmail() + ")");
        // Generate token (6-digit OTP)
        String tokenStr = String.format("%06d", new java.util.Random().nextInt(999999));
        System.out.println(">>> Generated OTP: " + tokenStr);
        
        Optional<PasswordResetToken> existingToken = tokenRepository.findByUser(user);
        PasswordResetToken token = existingToken.orElse(new PasswordResetToken());
        
        token.setUser(user);
        token.setToken(tokenStr);
        token.setExpiryDate(LocalDateTime.now().plusHours(1)); // 1 hour expiry
        
        tokenRepository.save(token);
        System.out.println(">>> Token saved to database");

        // Send OTP email
        String emailBody = "Your password reset OTP is: " + tokenStr + "\n\nIf you did not request this, please ignore this email.";
        
        System.out.println(">>> Attempting to send email to: " + user.getEmail());
        emailService.sendEmail(user.getEmail(), "Password Reset Request", emailBody);
    }

    public void resetPassword(String tokenStr, String newPassword) {
        PasswordResetToken token = tokenRepository.findByToken(tokenStr)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(token);
            throw new RuntimeException("Token expired");
        }

        Users user = token.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Delete token after successful reset
        tokenRepository.delete(token);
    }
}
