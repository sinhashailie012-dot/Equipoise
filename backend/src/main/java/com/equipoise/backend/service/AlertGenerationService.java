package com.equipoise.backend.service;

import com.equipoise.backend.entity.*;
import com.equipoise.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AlertGenerationService {

    private static final Logger log = LoggerFactory.getLogger(AlertGenerationService.class);
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("d MMM, HH:mm");

    private final EmployeeRepository employees;
    private final AlertRepository alerts;
    private final AlertRuleRepository rules;
    private final LeaveRepository leaves;
    private final TaskRepository tasks;
    private final SettingsRepository settingsRepository;
    private final com.equipoise.backend.notification.NotificationService notificationService;

    private volatile Instant lastChecked = Instant.now();

    public AlertGenerationService(
            EmployeeRepository employees,
            AlertRepository alerts,
            AlertRuleRepository rules,
            LeaveRepository leaves,
            TaskRepository tasks,
            SettingsRepository settingsRepository,
            com.equipoise.backend.notification.NotificationService notificationService
    ) {
        this.employees = employees;
        this.alerts = alerts;
        this.rules = rules;
        this.leaves = leaves;
        this.tasks = tasks;
        this.settingsRepository = settingsRepository;
        this.notificationService = notificationService;
    }

    public Instant getLastChecked() {
        return lastChecked;
    }

    public void setLastChecked(Instant lastChecked) {
        this.lastChecked = lastChecked;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        log.info("Running initial automatic alert generation at startup...");
        generateAlerts();
    }

    @Scheduled(cron = "${app.alerts.cron:0 0 * * * *}")
    public void scheduledAlertCheck() {
        log.info("Running scheduled automatic alert generation...");
        generateAlerts();
    }

    @Transactional
    public void generateAlerts() {
        this.lastChecked = Instant.now();
        Settings settings = settingsRepository.findAll().stream().findFirst()
                .orElse(Settings.builder()
                        .spareThreshold(80)
                        .balancedThreshold(100)
                        .stretchedThreshold(110)
                        .overloadedThreshold(125)
                        .build());

        List<Employee> employeeList = employees.findAll();
        List<AlertRule> activeRules = rules.findAll().stream()
                .filter(r -> Boolean.TRUE.equals(r.getActive()))
                .toList();

        for (Employee emp : employeeList) {
            // Recompute utilization & burnout score using WorkloadLogic
            int utilization = WorkloadLogic.utilization(emp.getAllocatedHours(), emp.getContractedHours());
            StatusBand status = WorkloadLogic.status(utilization, settings);
            int burnoutScore = WorkloadLogic.burnoutScore(emp);

            emp.setStatus(status);
            emp.setRiskScore(burnoutScore);
            employees.save(emp);

            // Check condition 1: Risk score above 60 (or configured threshold)
            checkRiskScoreAlert(emp, burnoutScore);

            // Check condition 2: Overload for consecutive weeks (e.g. consecutiveLongWeeks >= 3 or rule threshold)
            checkConsecutiveWeeksAlert(emp);

            // Check condition 3: Overdue tasks
            checkOverdueTasksAlert(emp);

            // Check condition 4: Leave causing overload / pressure
            checkLeaveOverloadAlert(emp, utilization);

            // Check dynamic AlertRules
            checkDynamicRules(emp, utilization, activeRules);
        }
    }

    private void checkRiskScoreAlert(Employee emp, int burnoutScore) {
        String ruleKey = "risk-score";
        boolean condition = burnoutScore >= 60;
        handleAlertCondition(
                emp,
                ruleKey,
                condition,
                burnoutScore >= 75 ? Severity.CRITICAL : Severity.NEEDS_ATTENTION,
                emp.getName() + " has elevated burnout risk score (" + burnoutScore + "/100)",
                "Burnout score calculated at " + burnoutScore + "/100 based on consecutive overtime, allocation, and recovery days.",
                "Review workload",
                "/team/" + emp.getId(),
                "navigate"
        );
    }

    private void checkConsecutiveWeeksAlert(Employee emp) {
        String ruleKey = "consecutive-overtime";
        boolean condition = emp.getConsecutiveLongWeeks() >= 3;
        handleAlertCondition(
                emp,
                ruleKey,
                condition,
                Severity.CRITICAL,
                emp.getName() + " has recorded " + emp.getConsecutiveLongWeeks() + " consecutive long weeks",
                "Working sustained overtime with " + emp.getConsecutiveLongWeeks() + " consecutive weeks above capacity.",
                "Review workload",
                "/team/" + emp.getId(),
                "navigate"
        );
    }

    private void checkOverdueTasksAlert(Employee emp) {
        String ruleKey = "overdue-tasks";
        boolean condition = emp.getOverdueTasks() > 0;
        handleAlertCondition(
                emp,
                ruleKey,
                condition,
                emp.getOverdueTasks() >= 2 ? Severity.CRITICAL : Severity.NEEDS_ATTENTION,
                emp.getName() + " has " + emp.getOverdueTasks() + " overdue task(s)",
                emp.getOverdueTasks() + " task(s) currently overdue and require rebalancing or deadline adjustments.",
                "Rebalance tasks",
                "/rebalancer",
                "navigate"
        );
    }

    private void checkLeaveOverloadAlert(Employee emp, int utilization) {
        String ruleKey = "leave-overload";
        List<Leave> employeeLeaves = leaves.findAll().stream()
                .filter(l -> l.getEmployee() != null && l.getEmployee().getId().equals(emp.getId()))
                .filter(l -> "Approved".equalsIgnoreCase(l.getStatus()) || "Pending".equalsIgnoreCase(l.getStatus()))
                .toList();

        // If employee has scheduled leave and utilization is stretched/overloaded (>= 110%)
        boolean hasUpcomingLeave = !employeeLeaves.isEmpty();
        boolean condition = hasUpcomingLeave && utilization >= 110;

        handleAlertCondition(
                emp,
                ruleKey,
                condition,
                Severity.NEEDS_ATTENTION,
                emp.getName() + " has scheduled leave while overloaded (" + utilization + "%)",
                "Approved leave coincides with high workload allocation (" + emp.getAllocatedHours() + "h / " + emp.getContractedHours() + "h). Reassign tasks to protect recovery time.",
                "Rebalance tasks",
                "/rebalancer",
                "navigate"
        );
    }

    private void checkDynamicRules(Employee emp, int utilization, List<AlertRule> activeRules) {
        for (AlertRule rule : activeRules) {
            String ruleKey = "rule-" + rule.getId();
            String name = rule.getName().toLowerCase(Locale.ROOT);
            boolean condition = false;

            if (name.contains("workload") || name.contains("capacity") || name.contains("%")) {
                condition = utilization >= rule.getThresholdPercent();
            } else if (name.contains("overtime") || name.contains("consecutive")) {
                condition = emp.getConsecutiveLongWeeks() >= rule.getThresholdPercent();
            } else if (name.contains("overdue")) {
                condition = emp.getOverdueTasks() >= rule.getThresholdPercent();
            } else if (name.contains("risk") || name.contains("burnout")) {
                condition = emp.getRiskScore() >= rule.getThresholdPercent();
            }

            Severity severity = switch (rule.getSeverity().toLowerCase(Locale.ROOT)) {
                case "critical" -> Severity.CRITICAL;
                case "awareness" -> Severity.AWARENESS;
                default -> Severity.NEEDS_ATTENTION;
            };

            handleAlertCondition(
                    emp,
                    ruleKey,
                    condition,
                    severity,
                    emp.getName() + " crossed alert rule: " + rule.getName(),
                    "Triggered by threshold (" + rule.getThresholdPercent() + "). Current utilization: " + utilization + "%, overdue: " + emp.getOverdueTasks() + ".",
                    "Review workload",
                    "/team/" + emp.getId(),
                    "navigate"
            );
        }
    }

    private void handleAlertCondition(
            Employee emp,
            String ruleKey,
            boolean conditionMet,
            Severity severity,
            String title,
            String description,
            String actionLabel,
            String actionRoute,
            String actionType
    ) {
        List<Alert> existingOpenAlerts = alerts.findByPersonIdAndRuleKeyAndIsArchivedFalse(emp.getId(), ruleKey);

        if (conditionMet) {
            // Prevent duplicate alert if an active open alert for this person & ruleKey already exists
            if (existingOpenAlerts.isEmpty()) {
                Alert newAlert = Alert.builder()
                        .id("alert-" + UUID.randomUUID())
                        .category(severity)
                        .severityLabel(severity.getKey())
                        .sender("Equipoise")
                        .time(LocalDateTime.now().format(TIME_FORMATTER))
                        .title(title)
                        .description(description)
                        .actionLabel(actionLabel)
                        .actionRoute(actionRoute)
                        .actionType(actionType)
                        .personId(emp.getId())
                        .ruleKey(ruleKey)
                        .isRead(false)
                        .isArchived(false)
                        .isSnoozed(false)
                        .build();
                alerts.save(newAlert);
                log.info("Created alert for employee {} under rule {}", emp.getId(), ruleKey);

                if (severity == Severity.CRITICAL) {
                    try {
                        notificationService.sendAlertNotification(emp.getName(), title, "critical");
                    } catch (Exception e) {
                        log.warn("Failed sending notification for alert {}: {}", newAlert.getId(), e.getMessage());
                    }
                }
            }
        } else {
            // Auto-resolve when condition clears: archive any existing open alerts for this ruleKey & person
            if (!existingOpenAlerts.isEmpty()) {
                for (Alert alert : existingOpenAlerts) {
                    alert.setIsArchived(true);
                    alert.setIsRead(true);
                    alerts.save(alert);
                    log.info("Auto-resolved alert {} for employee {} (condition cleared)", alert.getId(), emp.getId());
                }
            }
        }
    }
}
