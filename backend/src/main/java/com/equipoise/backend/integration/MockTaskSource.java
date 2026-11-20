package com.equipoise.backend.integration;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MockTaskSource implements TaskSource {

    @Override
    public boolean isConfigured() {
        return false;
    }

    @Override
    public String getSourceType() {
        return "mock";
    }

    @Override
    public List<ExternalTask> fetchTasks() {
        return List.of(
                new ExternalTask(
                        "jira-mock-1",
                        "Design System Token Audit",
                        "marcus.reed@forma.studio",
                        "Core platform",
                        8,
                        "In progress",
                        "2026-11-28"
                ),
                new ExternalTask(
                        "jira-mock-2",
                        "Customer Checkout Accessibility Review",
                        "asha.patel@forma.studio",
                        "Atlas redesign",
                        6,
                        "To do",
                        "2026-11-30"
                )
        );
    }
}
