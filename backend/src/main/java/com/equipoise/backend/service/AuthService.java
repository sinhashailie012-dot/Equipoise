package com.equipoise.backend.service;

import com.equipoise.backend.config.JwtService;
import com.equipoise.backend.entity.User;
import com.equipoise.backend.exception.ResourceNotFoundException;
import com.equipoise.backend.repository.UserRepository;
import io.jsonwebtoken.Claims;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public Map<String, Object> login(String email, String password) {
        User user = users.findByEmail(email.trim().toLowerCase())
                .filter(candidate -> passwordEncoder.matches(password, candidate.getPassword()))
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));
        return tokens(user);
    }

    public Map<String, String> refresh(String refreshToken) {
        Claims claims = jwtService.parse(refreshToken);
        if (!"refresh".equals(claims.get("type", String.class))) {
            throw new BadCredentialsException("A refresh token is required.");
        }
        User user = users.findByEmail(claims.getSubject())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        return Map.of("token", jwtService.createAccessToken(user));
    }

    public Map<String, Object> currentUser(String email) {
        return userProfile(users.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found.")));
    }

    public Map<String, Object> tokens(User user) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("token", jwtService.createAccessToken(user));
        result.put("refreshToken", jwtService.createRefreshToken(user));
        result.put("user", userProfile(user));
        return result;
    }

    private Map<String, Object> userProfile(User user) {
        return Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name(),
                "title", value(user.getTitle()),
                "initials", value(user.getInitials()),
                "workspace", value(user.getWorkspace()),
                "department", value(user.getDepartment())
        );
    }

    private String value(String text) {
        return text == null ? "" : text;
    }
}
