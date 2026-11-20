package com.equipoise.backend.service;

import com.equipoise.backend.entity.*;
import com.equipoise.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlertGenerationServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private AlertRepository alertRepository;

    @Mock
    private AlertRuleRepository ruleRepository;

    @Mock
    private LeaveRepository leaveRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private SettingsRepository settingsRepository;

    @Mock
    private com.equipoise.backend.notification.NotificationService notificationService;

    @InjectMocks
    private AlertGenerationService alertGenerationService;

    private Employee employee;
    private Settings settings;

    @BeforeEach
    void setUp() {
        settings = Settings.builder()
                .spareThreshold(80)
                .balancedThreshold(100)
                .stretchedThreshold(110)
                .overloadedThreshold(125)
                .build();
        lenient().when(settingsRepository.findAll()).thenReturn(List.of(settings));

        employee = Employee.builder()
                .id("marcus-reed")
                .name("Marcus Reed")
                .allocatedHours(52)
                .contractedHours(40)
                .consecutiveLongWeeks(4)
                .overdueTasks(2)
                .weekendHours(4)
                .leaveRecoveryDays(0)
                .build();
    }

    @Test
    @DisplayName("Generates new alerts when conditions are met and no active alert exists")
    void generatesAlertsWhenConditionMet() {
        when(employeeRepository.findAll()).thenReturn(List.of(employee));
        when(ruleRepository.findAll()).thenReturn(Collections.emptyList());
        when(leaveRepository.findAll()).thenReturn(Collections.emptyList());
        when(alertRepository.findByPersonIdAndRuleKeyAndIsArchivedFalse(any(), any()))
                .thenReturn(Collections.emptyList());

        alertGenerationService.generateAlerts();

        // Should save alerts for elevated risk, consecutive overtime, and overdue tasks
        ArgumentCaptor<Alert> alertCaptor = ArgumentCaptor.forClass(Alert.class);
        verify(alertRepository, atLeast(1)).save(alertCaptor.capture());

        List<Alert> saved = alertCaptor.getAllValues();
        assertTrue(saved.stream().anyMatch(a -> "consecutive-overtime".equals(a.getRuleKey())));
        assertTrue(saved.stream().anyMatch(a -> "overdue-tasks".equals(a.getRuleKey())));
    }

    @Test
    @DisplayName("Prevents duplicate alerts when an unarchived alert already exists for the same rule and person")
    void preventsDuplicateAlerts() {
        when(employeeRepository.findAll()).thenReturn(List.of(employee));
        when(ruleRepository.findAll()).thenReturn(Collections.emptyList());
        when(leaveRepository.findAll()).thenReturn(Collections.emptyList());

        lenient().when(alertRepository.findByPersonIdAndRuleKeyAndIsArchivedFalse(any(), any()))
                .thenReturn(Collections.emptyList());

        // Existing open alert for consecutive-overtime
        Alert existingAlert = Alert.builder()
                .id("alert-existing")
                .personId("marcus-reed")
                .ruleKey("consecutive-overtime")
                .isArchived(false)
                .build();

        lenient().when(alertRepository.findByPersonIdAndRuleKeyAndIsArchivedFalse("marcus-reed", "consecutive-overtime"))
                .thenReturn(List.of(existingAlert));

        alertGenerationService.generateAlerts();

        // Verify that no new alert with ruleKey "consecutive-overtime" was saved
        ArgumentCaptor<Alert> alertCaptor = ArgumentCaptor.forClass(Alert.class);
        verify(alertRepository, atLeast(0)).save(alertCaptor.capture());

        List<Alert> newlySaved = alertCaptor.getAllValues().stream()
                .filter(a -> !"alert-existing".equals(a.getId()))
                .toList();

        assertFalse(newlySaved.stream().anyMatch(a -> "consecutive-overtime".equals(a.getRuleKey())));
    }

    @Test
    @DisplayName("Auto-resolves (archives) existing alert when the condition clears")
    void autoResolvesAlertWhenConditionClears() {
        // Employee has recovered: no overdue tasks, low overtime, normal capacity
        Employee recovered = Employee.builder()
                .id("marcus-reed")
                .name("Marcus Reed")
                .allocatedHours(35)
                .contractedHours(40)
                .consecutiveLongWeeks(0)
                .overdueTasks(0)
                .weekendHours(0)
                .leaveRecoveryDays(7)
                .build();

        when(employeeRepository.findAll()).thenReturn(List.of(recovered));
        when(ruleRepository.findAll()).thenReturn(Collections.emptyList());
        when(leaveRepository.findAll()).thenReturn(Collections.emptyList());

        lenient().when(alertRepository.findByPersonIdAndRuleKeyAndIsArchivedFalse(any(), any()))
                .thenReturn(Collections.emptyList());

        Alert activeOverdueAlert = Alert.builder()
                .id("alert-overdue-1")
                .personId("marcus-reed")
                .ruleKey("overdue-tasks")
                .isArchived(false)
                .isRead(false)
                .build();

        lenient().when(alertRepository.findByPersonIdAndRuleKeyAndIsArchivedFalse("marcus-reed", "overdue-tasks"))
                .thenReturn(List.of(activeOverdueAlert));

        alertGenerationService.generateAlerts();

        // The alert should be marked as archived and read
        assertTrue(activeOverdueAlert.getIsArchived());
        assertTrue(activeOverdueAlert.getIsRead());
        verify(alertRepository).save(activeOverdueAlert);
    }
}
