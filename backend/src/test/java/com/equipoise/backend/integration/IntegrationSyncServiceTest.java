package com.equipoise.backend.integration;

import com.equipoise.backend.dto.SyncReport;
import com.equipoise.backend.entity.Employee;
import com.equipoise.backend.entity.Leave;
import com.equipoise.backend.entity.Task;
import com.equipoise.backend.repository.EmployeeRepository;
import com.equipoise.backend.repository.LeaveRepository;
import com.equipoise.backend.repository.ProjectRepository;
import com.equipoise.backend.repository.TaskRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IntegrationSyncServiceTest {

    @Mock
    private JiraTaskSource jiraTaskSource;

    @Mock
    private MockTaskSource mockTaskSource;

    @Mock
    private ICalLeaveSource iCalLeaveSource;

    @Mock
    private MockLeaveSource mockLeaveSource;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private LeaveRepository leaveRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private IntegrationSyncService integrationSyncService;

    @Test
    @DisplayName("Sync imports tasks idempotently using externalId without duplicates")
    void syncTasksIdempotently() {
        when(jiraTaskSource.isConfigured()).thenReturn(false);
        when(iCalLeaveSource.isConfigured()).thenReturn(false);

        TaskSource.ExternalTask task1 = new TaskSource.ExternalTask(
                "ext-task-1",
                "Figma Token Migration",
                "marcus.reed@forma.studio",
                "Core platform",
                6,
                "In progress",
                "2026-11-29"
        );

        when(mockTaskSource.fetchTasks()).thenReturn(List.of(task1));
        when(mockLeaveSource.fetchLeaves()).thenReturn(Collections.emptyList());

        // First run: external ID not found in database -> insert
        when(taskRepository.findByExternalId("ext-task-1")).thenReturn(Optional.empty());

        SyncReport report1 = integrationSyncService.sync();
        assertEquals(1, report1.getTasksImported());
        assertEquals(0, report1.getTasksUpdated());
        assertEquals("demo", report1.getTaskSourceMode());
        verify(taskRepository, times(1)).save(any(Task.class));

        // Second run: external ID already in DB -> update without inserting new record
        Task existingTask = Task.builder().id("task-100").externalId("ext-task-1").build();
        when(taskRepository.findByExternalId("ext-task-1")).thenReturn(Optional.of(existingTask));

        SyncReport report2 = integrationSyncService.sync();
        assertEquals(0, report2.getTasksImported());
        assertEquals(1, report2.getTasksUpdated());
        verify(taskRepository, times(1)).save(existingTask);
        verify(taskRepository, times(2)).save(any(Task.class));
    }
}
