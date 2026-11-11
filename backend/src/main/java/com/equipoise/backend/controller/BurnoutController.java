package com.equipoise.backend.controller;

import com.equipoise.backend.service.EquipoiseService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.Map;

@RestController
@RequestMapping("/api/burnout")
public class BurnoutController {
    private final EquipoiseService service;

    public BurnoutController(EquipoiseService service) {
        this.service = service;
    }

    @GetMapping
    public Map<String, Object> get() {
        return service.getBurnout();
    }

    @PostMapping("/check-in")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> schedule(@RequestBody Map<String, Object> body) {
        return service.scheduleCheckIn(body);
    }

    @PutMapping("/interventions/{id}")
    public Map<String, Object> updateIntervention(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return service.updateIntervention(id, body);
    }
}
