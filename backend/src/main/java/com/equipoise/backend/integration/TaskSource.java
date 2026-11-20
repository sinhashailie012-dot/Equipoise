package com.equipoise.backend.integration;

import java.util.List;

public interface TaskSource {
    boolean isConfigured();
    String getSourceType();
    List<ExternalTask> fetchTasks();

    record ExternalTask(
            String externalId,
            String title,
            String assigneeEmail,
            String projectName,
            int estimatedHours,
            String status,
            String dueDate
    ) {}
}
