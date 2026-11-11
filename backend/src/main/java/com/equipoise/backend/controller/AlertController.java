package com.equipoise.backend.controller;

import com.equipoise.backend.service.EquipoiseService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {
    private final EquipoiseService service;

    public AlertController(EquipoiseService service) {
        this.service = service;
    }

    @GetMapping
    public Map<String, Object> list(@RequestParam Map<String, String> params) {
        return service.getAlerts(params);
    }

    @PutMapping("/{id}/read")
    public Map<String, Object> markRead(@PathVariable String id) {
        return service.alertAction(id, "read", null);
    }

    @PutMapping("/read-all")
    public Map<String, Object> markAllRead() {
        return service.markAllAlertsRead();
    }

    @PutMapping("/{id}/snooze")
    public Map<String, Object> snooze(@PathVariable String id, @RequestBody(required = false) Map<String, Integer> body) {
        return service.alertAction(id, "snooze", body == null ? null : body.get("hours"));
    }

    @PutMapping("/{id}/archive")
    public Map<String, Object> archive(@PathVariable String id) {
        return service.alertAction(id, "archive", null);
    }

    @GetMapping("/rules")
    public Object rules() {
        return service.getAlertRules();
    }

    @PostMapping("/rules")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> addRule(@RequestBody Map<String, Object> body) {
        return service.addAlertRule(body);
    }
}
