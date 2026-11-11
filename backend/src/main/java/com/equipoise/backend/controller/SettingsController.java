package com.equipoise.backend.controller;

import com.equipoise.backend.service.EquipoiseService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {
    private final EquipoiseService service;

    public SettingsController(EquipoiseService service) {
        this.service = service;
    }

    @GetMapping
    public Map<String, Object> get() {
        return service.getSettings();
    }

    @PutMapping
    public Map<String, Object> update(@RequestBody Map<String, Object> body) {
        return service.updateSettings(body);
    }

    @PostMapping("/members")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> invite(@RequestBody Map<String, Object> body) {
        return service.inviteMember(body);
    }
}
