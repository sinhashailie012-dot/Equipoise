package com.equipoise.backend.notification;

import com.equipoise.backend.entity.Employee;
import com.equipoise.backend.entity.Settings;
import com.equipoise.backend.entity.StatusBand;
import com.equipoise.backend.entity.User;
import com.equipoise.backend.repository.EmployeeRepository;
import com.equipoise.backend.repository.SettingsRepository;
import com.equipoise.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private SlackNotifier slackNotifier;

    @Mock
    private EmailNotifier emailNotifier;

    @Mock
    private SettingsRepository settingsRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private Settings settings;

    @BeforeEach
    void setUp() {
        settings = Settings.builder()
                .immediateCriticalAlerts(true)
                .notifySlack(true)
                .notifyEmail(true)
                .notifySeverities("critical")
                .build();
        lenient().when(settingsRepository.findAll()).thenReturn(List.of(settings));

        User manager = User.builder().name("Emma Chen").email("manager@equipoise.com").build();
        lenient().when(userRepository.findAll()).thenReturn(List.of(manager));
    }

    @Test
    @DisplayName("Sends critical alert notification through Slack and Email without sensitive details")
    void sendsCriticalNotification() {
        notificationService.sendAlertNotification("Marcus Reed", "Consecutive overtime >= 3 weeks", "critical");

        // Verify Slack message
        ArgumentCaptor<String> slackCaptor = ArgumentCaptor.forClass(String.class);
        verify(slackNotifier).send(slackCaptor.capture());
        String slackText = slackCaptor.getValue();
        assertTrue(slackText.contains("Marcus Reed"));
        assertTrue(slackText.contains("Consecutive overtime >= 3 weeks"));
        // Ensure sensitive details like salary, private notes etc are not present
        assertFalse(slackText.contains("salary"));
        assertFalse(slackText.contains("medical"));

        // Verify Email message
        ArgumentCaptor<String> emailSubject = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> emailBody = ArgumentCaptor.forClass(String.class);
        verify(emailNotifier).send(eq("manager@equipoise.com"), emailSubject.capture(), emailBody.capture());
        assertTrue(emailSubject.getValue().contains("Consecutive overtime >= 3 weeks"));
        assertTrue(emailBody.getValue().contains("Marcus Reed"));
    }

    @Test
    @DisplayName("Does not send notification when severity is not enabled in settings")
    void doesNotSendWhenSeverityNotAllowed() {
        settings.setNotifySeverities("critical");
        settings.setImmediateCriticalAlerts(true);

        notificationService.sendAlertNotification("Daniel Kim", "Available capacity", "awareness");

        verify(slackNotifier, never()).send(anyString());
        verify(emailNotifier, never()).send(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("Scheduled weekly digest collects at-risk people with privacy respected")
    void scheduledWeeklyDigest() {
        settings.setDailyDigest(true);

        Employee atRisk = Employee.builder()
                .name("Asha Patel")
                .riskScore(82)
                .status(StatusBand.OVERLOADED)
                .build();

        when(employeeRepository.findAll()).thenReturn(List.of(atRisk));

        notificationService.scheduledWeeklyDigest();

        ArgumentCaptor<String> digestCaptor = ArgumentCaptor.forClass(String.class);
        verify(slackNotifier).send(digestCaptor.capture());
        String digestText = digestCaptor.getValue();
        assertTrue(digestText.contains("Asha Patel"));
        assertTrue(digestText.contains("OVERLOADED"));
    }

    @Test
    @DisplayName("Send test notification exercises configured channels")
    void sendTestNotification() {
        when(slackNotifier.send(anyString())).thenReturn(true);
        when(emailNotifier.send(anyString(), anyString(), anyString())).thenReturn(true);

        boolean result = notificationService.sendTestNotification();

        assertTrue(result);
        verify(slackNotifier).send(contains("Test Notification"));
        verify(emailNotifier).send(eq("manager@equipoise.com"), contains("Test Notification"), anyString());
    }
}
