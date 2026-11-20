package com.equipoise.backend.integration;

import com.equipoise.backend.dto.SyncReport;
import com.equipoise.backend.entity.Employee;
import com.equipoise.backend.entity.Leave;
import com.equipoise.backend.entity.Project;
import com.equipoise.backend.entity.Task;
import com.equipoise.backend.repository.EmployeeRepository;
import com.equipoise.backend.repository.LeaveRepository;
import com.equipoise.backend.repository.ProjectRepository;
import com.equipoise.backend.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class IntegrationSyncService {

    private static final Logger log = LoggerFactory.getLogger(IntegrationSyncService.class);

    private final JiraTaskSource jiraTaskSource;
    private final MockTaskSource mockTaskSource;
    private final ICalLeaveSource iCalLeaveSource;
    private final MockLeaveSource mockLeaveSource;

    private final TaskRepository taskRepository;
    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;

    private volatile SyncReport lastReport = SyncReport.builder()
            .taskSourceMode("demo")
            .leaveSourceMode("demo")
            .lastSyncTime(Instant.now())
            .build();

    public IntegrationSyncService(
            JiraTaskSource jiraTaskSource,
            MockTaskSource mockTaskSource,
            ICalLeaveSource iCalLeaveSource,
            MockLeaveSource mockLeaveSource,
            TaskRepository taskRepository,
            LeaveRepository leaveRepository,
            EmployeeRepository employeeRepository,
            ProjectRepository projectRepository
    ) {
        this.jiraTaskSource = jiraTaskSource;
        this.mockTaskSource = mockTaskSource;
        this.iCalLeaveSource = iCalLeaveSource;
        this.mockLeaveSource = mockLeaveSource;
        this.taskRepository = taskRepository;
        this.leaveRepository = leaveRepository;
        this.employeeRepository = employeeRepository;
        this.projectRepository = projectRepository;
    }

    public SyncReport getLastReport() {
        return lastReport;
    }

    @Scheduled(cron = "${app.integrations.sync-cron:0 */30 * * * *}")
    public void scheduledSync() {
        log.info("Starting scheduled integration sync...");
        sync();
    }

    @Transactional
    public SyncReport sync() {
        TaskSource taskSource = jiraTaskSource.isConfigured() ? jiraTaskSource : mockTaskSource;
        LeaveSource leaveSource = iCalLeaveSource.isConfigured() ? iCalLeaveSource : mockLeaveSource;

        String taskMode = jiraTaskSource.isConfigured() ? "real" : "demo";
        String leaveMode = iCalLeaveSource.isConfigured() ? "real" : "demo";

        SyncReport report = SyncReport.builder()
                .taskSourceMode(taskMode)
                .leaveSourceMode(leaveMode)
                .lastSyncTime(Instant.now())
                .build();

        // 1. Sync Tasks
        try {
            List<TaskSource.ExternalTask> externalTasks = taskSource.fetchTasks();
            for (TaskSource.ExternalTask ext : externalTasks) {
                syncTask(ext, report);
            }
        } catch (Exception e) {
            report.addError("Task sync failed: " + e.getMessage());
            log.error("Error during task sync: {}", e.getMessage());
        }

        // 2. Sync Leaves
        try {
            List<LeaveSource.ExternalLeave> externalLeaves = leaveSource.fetchLeaves();
            for (LeaveSource.ExternalLeave ext : externalLeaves) {
                syncLeave(ext, report);
            }
        } catch (Exception e) {
            report.addError("Leave sync failed: " + e.getMessage());
            log.error("Error during leave sync: {}", e.getMessage());
        }

        this.lastReport = report;
        return report;
    }

    private void syncTask(TaskSource.ExternalTask ext, SyncReport report) {
        Employee assignee = null;
        if (ext.assigneeEmail() != null && !ext.assigneeEmail().isBlank()) {
            assignee = employeeRepository.findByEmailIgnoreCase(ext.assigneeEmail()).orElse(null);
        }

        Project project = null;
        if (ext.projectName() != null && !ext.projectName().isBlank()) {
            project = projectRepository.findAll().stream()
                    .filter(p -> p.getName().equalsIgnoreCase(ext.projectName()))
                    .findFirst()
                    .orElse(null);
        }

        Optional<Task> existing = taskRepository.findByExternalId(ext.externalId());
        if (existing.isPresent()) {
            Task task = existing.get();
            task.setTitle(ext.title());
            task.setProject(project != null ? project.getName() : ext.projectName());
            task.setProjectEntity(project);
            task.setAssignee(assignee);
            task.setHours(ext.estimatedHours());
            task.setStatus(ext.status());
            if (ext.dueDate() != null && !ext.dueDate().isBlank()) {
                task.setDue(ext.dueDate());
            }
            taskRepository.save(task);
            report.setTasksUpdated(report.getTasksUpdated() + 1);
        } else {
            Task task = Task.builder()
                    .id("task-" + UUID.randomUUID().toString().substring(0, 8))
                    .externalId(ext.externalId())
                    .title(ext.title())
                    .project(project != null ? project.getName() : ext.projectName())
                    .projectEntity(project)
                    .assignee(assignee)
                    .hours(ext.estimatedHours())
                    .status(ext.status())
                    .due(ext.dueDate() == null || ext.dueDate().isBlank() ? "Upcoming" : ext.dueDate())
                    .isSuggested(false)
                    .build();
            taskRepository.save(task);
            report.setTasksImported(report.getTasksImported() + 1);
        }
    }

    private void syncLeave(LeaveSource.ExternalLeave ext, SyncReport report) {
        Employee employee = null;
        if (ext.employeeEmail() != null && !ext.employeeEmail().isBlank()) {
            employee = employeeRepository.findByEmailIgnoreCase(ext.employeeEmail()).orElse(null);
        }

        Optional<Leave> existing = leaveRepository.findByExternalId(ext.externalId());
        if (existing.isPresent()) {
            Leave leave = existing.get();
            leave.setType(ext.type());
            leave.setDates(ext.dates());
            leave.setHours(ext.hours());
            leave.setStatus(ext.status());
            if (employee != null) {
                leave.setEmployee(employee);
                leave.setEmployeeName(employee.getName());
            }
            leaveRepository.save(leave);
            report.setLeavesUpdated(report.getLeavesUpdated() + 1);
        } else {
            Leave leave = Leave.builder()
                    .id("leave-" + UUID.randomUUID().toString().substring(0, 8))
                    .externalId(ext.externalId())
                    .employee(employee)
                    .employeeName(employee != null ? employee.getName() : "Team member")
                    .type(ext.type())
                    .dates(ext.dates())
                    .hours(ext.hours())
                    .status(ext.status())
                    .build();
            leaveRepository.save(leave);
            report.setLeavesImported(report.getLeavesImported() + 1);
        }
    }
}
