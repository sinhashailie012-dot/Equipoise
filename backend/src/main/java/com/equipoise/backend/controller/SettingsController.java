package com.equipoise.backend.controller;

import com.equipoise.backend.dto.SyncReport;
import com.equipoise.backend.integration.IntegrationSyncService;
import com.equipoise.backend.notification.NotificationService;
import com.equipoise.backend.service.EquipoiseService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {
    private final EquipoiseService service;
    private final NotificationService notificationService;
    private final IntegrationSyncService integrationSyncService;

    public SettingsController(
            EquipoiseService service,
            NotificationService notificationService,
            IntegrationSyncService integrationSyncService
    ) {
        this.service = service;
        this.notificationService = notificationService;
        this.integrationSyncService = integrationSyncService;
    }

    @GetMapping
    public Map<String, Object> get() {
        return service.getSettings();
    }

    @PutMapping
    public Map<String, Object> update(@RequestBody Map<String, Object> body) {
        return service.updateSettings(body);
    }

    @PostMapping("/test-notification")
    public Map<String, Object> testNotification() {
        boolean sent = notificationService.sendTestNotification();
        return Map.of(
                "success", sent,
                "message", "Test notification triggered.",
                "slackConfigured", notificationService.isSlackConfigured(),
                "emailConfigured", notificationService.isEmailConfigured()
        );
    }

    @GetMapping("/integrations")
    public SyncReport getIntegrationsStatus() {
        return integrationSyncService.getLastReport();
    }

    @PostMapping("/integrations/sync")
    public SyncReport syncIntegrations() {
        return integrationSyncService.sync();
    }

    @PostMapping("/members")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> invite(@RequestBody Map<String, Object> body) {
        return service.inviteMember(body);
    }
}
