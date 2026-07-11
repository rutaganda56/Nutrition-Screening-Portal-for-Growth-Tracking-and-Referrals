package com.nutritrack.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutritrack.model.Users;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class JwtService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";

    private final ObjectMapper objectMapper;
    private final String jwtSecret;
    private final long expirationMillis;

    public JwtService(
            ObjectMapper objectMapper,
            @Value("${app.jwt.secret}") String jwtSecret,
            @Value("${app.jwt.expiration-ms}") long expirationMillis) {
        this.objectMapper = objectMapper;
        this.jwtSecret = jwtSecret;
        this.expirationMillis = expirationMillis;
    }

    public String generateToken(Users user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusMillis(expirationMillis);

        Map<String, Object> header = new LinkedHashMap<>();
        header.put("alg", "HS256");
        header.put("typ", "JWT");

        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("iss", "nutritrack-api");
        claims.put("sub", user.getEmail());
        claims.put("userId", user.getId());
        claims.put("role", "ROLE_" + user.getRole()); // Prefix with ROLE_ for Spring Security
        claims.put("iat", now.getEpochSecond());
        claims.put("exp", expiresAt.getEpochSecond());

        String unsignedToken = base64UrlJson(header) + "." + base64UrlJson(claims);
        return unsignedToken + "." + sign(unsignedToken);
    }

    public Map<String, Object> extractClaims(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid JWT token format");
        }
        try {
            String payload = parts[1];
            while (payload.length() % 4 != 0) {
                payload += "=";
            }
            String payloadJson = new String(Base64.getUrlDecoder().decode(payload), StandardCharsets.UTF_8);
            return objectMapper.readValue(payloadJson, Map.class);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid JWT payload", e);
        }
    }

    public boolean isTokenValid(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return false;
            }
            String unsignedToken = parts[0] + "." + parts[1];
            String expectedSignature = sign(unsignedToken);
            if (!expectedSignature.equals(parts[2])) {
                return false;
            }
            Map<String, Object> claims = extractClaims(token);
            long exp = ((Number) claims.get("exp")).longValue();
            if (Instant.now().getEpochSecond() > exp) {
                return false;
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public long getExpirationMillis() {
        return expirationMillis;
    }

    private String base64UrlJson(Map<String, Object> value) {
        try {
            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(objectMapper.writeValueAsBytes(value));
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Unable to serialize JWT payload", ex);
        }
    }

    private String sign(String unsignedToken) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(resolveSecretBytes(), HMAC_ALGORITHM));
            byte[] signature = mac.doFinal(unsignedToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(signature);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to sign JWT", ex);
        }
    }

    private byte[] resolveSecretBytes() {
        String trimmedSecret = jwtSecret == null ? "" : jwtSecret.trim();
        if (trimmedSecret.isBlank()) {
            throw new IllegalStateException("JWT secret must be configured");
        }

        try {
            byte[] decoded = Base64.getDecoder().decode(trimmedSecret);
            if (decoded.length >= 32) {
                return decoded;
            }
        } catch (IllegalArgumentException ignored) {
            // Support plain-text secrets for local development.
        }

        byte[] raw = trimmedSecret.getBytes(StandardCharsets.UTF_8);
        if (raw.length < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 bytes");
        }
        return raw;
    }
}
