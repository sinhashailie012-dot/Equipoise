package com.equipoise.backend.controller;

import com.equipoise.backend.dto.AuthDtos;
import com.equipoise.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        return authService.login(request.email(), request.password());
    }

    @PostMapping("/refresh")
    public Map<String, String> refresh(@Valid @RequestBody AuthDtos.RefreshRequest request) {
        return authService.refresh(request.refreshToken());
    }

    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        return authService.currentUser(authentication.getName());
    }

    @PostMapping("/logout")
    public Map<String, Boolean> logout() {
        return Map.of("success", true);
    }
}
