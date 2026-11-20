package com.equipoise.backend.notification;

import com.equipoise.backend.entity.Employee;
import com.equipoise.backend.entity.Settings;
import com.equipoise.backend.repository.EmployeeRepository;
import com.equipoise.backend.repository.SettingsRepository;
import com.equipoise.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final SlackNotifier slackNotifier;
    private final EmailNotifier emailNotifier;
    private final SettingsRepository settingsRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public NotificationServiceImpl(
            SlackNotifier slackNotifier,
            EmailNotifier emailNotifier,
            SettingsRepository settingsRepository,
            EmployeeRepository employeeRepository,
            UserRepository userRepository
    ) {
        this.slackNotifier = slackNotifier;
        this.emailNotifier = emailNotifier;
        this.settingsRepository = settingsRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
    }

    @Override
    public boolean isSlackConfigured() {
        return slackNotifier.isConfigured();
    }

    @Override
    public boolean isEmailConfigured() {
        return emailNotifier.isConfigured();
    }

    @Override
    public void sendAlertNotification(String personName, String alertTitle, String severity) {
        Settings settings = getSettings();

        // Check if notifications are enabled for this severity
        boolean immediateCritical = Boolean.TRUE.equals(settings.getImmediateCriticalAlerts());
        String allowedSeverities = settings.getNotifySeverities() == null ? "critical" : settings.getNotifySeverities().toLowerCase(Locale.ROOT);
        boolean severityAllowed = Arrays.stream(allowedSeverities.split(","))
                .map(String::trim)
                .anyMatch(s -> s.equalsIgnoreCase(severity));

        if ("critical".equalsIgnoreCase(severity) && !immediateCritical) {
            log.info("Immediate critical alert notifications disabled in settings.");
            return;
        }

        if (!severityAllowed && !("critical".equalsIgnoreCase(severity) && immediateCritical)) {
            log.info("Severity {} not enabled for notifications (enabled: {})", severity, allowedSeverities);
            return;
        }

        // Privacy rule: Never include sensitive personal details beyond the person's name and the alert title.
        String message = String.format("Alert [%s]: %s - %s", severity.toUpperCase(Locale.ROOT), personName, alertTitle);

        if (Boolean.TRUE.equals(settings.getNotifySlack())) {
            slackNotifier.send(message);
        }

        if (Boolean.TRUE.equals(settings.getNotifyEmail())) {
            // Email to configured managers or admin
            userRepository.findAll().stream()
                    .filter(u -> u.getEmail() != null && !u.getEmail().isBlank())
                    .forEach(u -> emailNotifier.send(
                            u.getEmail(),
                            "Equipoise Alert: " + alertTitle,
                            String.format("Hello %s,\n\nA new alert has been triggered in Equipoise:\n\nPerson: %s\nAlert: %s\nSeverity: %s\n\nPlease log in to review the team workload.\n\nEquipoise",
                                    u.getName(), personName, alertTitle, severity.toUpperCase(Locale.ROOT))
                    ));
        }
    }

    @Override
    public void sendDigest(String subject, String content) {
        Settings settings = getSettings();
        if (Boolean.TRUE.equals(settings.getNotifySlack())) {
            slackNotifier.send("*" + subject + "*\n" + content);
        }
        if (Boolean.TRUE.equals(settings.getNotifyEmail())) {
            userRepository.findAll().stream()
                    .filter(u -> u.getEmail() != null && !u.getEmail().isBlank())
                    .forEach(u -> emailNotifier.send(u.getEmail(), subject, content));
        }
    }

    @Scheduled(cron = "${app.notifications.digest-cron:0 0 9 * * MON}")
    public void scheduledWeeklyDigest() {
        Settings settings = getSettings();
        if (!Boolean.TRUE.equals(settings.getDailyDigest())) {
            log.info("Weekly digest is disabled in settings.");
            return;
        }

        List<Employee> atRisk = employeeRepository.findAll().stream()
                .filter(e -> (e.getRiskScore() != null && e.getRiskScore() >= 60)
                        || "overloaded".equalsIgnoreCase(e.getStatus().name())
                        || "critical".equalsIgnoreCase(e.getStatus().name()))
                .toList();

        StringBuilder body = new StringBuilder("Weekly Equipoise Digest - People Needing Care:\n\n");
        if (atRisk.isEmpty()) {
            body.append("All team members are currently within balanced workload boundaries.\n");
        } else {
            for (Employee e : atRisk) {
                // Keep privacy: only name and workload status
                body.append(String.format("• %s - Workload status: %s\n", e.getName(), e.getStatus().name()));
            }
        }
        body.append("\nLog in to the dashboard to review workload rebalancing.\n");

        sendDigest("Equipoise Weekly Workload Digest", body.toString());
    }

    @Override
    public boolean sendTestNotification() {
        Settings settings = getSettings();
        String testMessage = "Equipoise Test Notification: Notification channels are functioning properly.";
        boolean slackSuccess = false;
        boolean emailSuccess = false;

        if (Boolean.TRUE.equals(settings.getNotifySlack())) {
            slackSuccess = slackNotifier.send(testMessage);
        }

        if (Boolean.TRUE.equals(settings.getNotifyEmail())) {
            String adminEmail = userRepository.findAll().stream()
                    .map(u -> u.getEmail())
                    .filter(e -> e != null && !e.isBlank())
                    .findFirst()
                    .orElse("manager@equipoise.com");
            emailSuccess = emailNotifier.send(adminEmail, "Equipoise Test Notification", testMessage);
        }

        // Return true if at least one notifier succeeded or if notifiers logged safely
        return slackSuccess || emailSuccess || (!slackNotifier.isConfigured() && !emailNotifier.isConfigured());
    }

    private Settings getSettings() {
        return settingsRepository.findAll().stream().findFirst()
                .orElse(Settings.builder().build());
    }
}
