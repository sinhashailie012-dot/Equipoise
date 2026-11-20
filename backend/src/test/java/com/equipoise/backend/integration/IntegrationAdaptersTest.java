package com.equipoise.backend.integration;

import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IntegrationAdaptersTest {

    @Mock
    private RestTemplate restTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @DisplayName("JiraTaskSource reports unconfigured when keys are missing and returns empty")
    void jiraUnconfigured() {
        JiraTaskSource source = new JiraTaskSource("", "", "", "", restTemplate, objectMapper);
        assertFalse(source.isConfigured());
        assertEquals("jira", source.getSourceType());
        assertTrue(source.fetchTasks().isEmpty());
    }

    @Test
    @DisplayName("JiraTaskSource parses Jira REST API issues into external tasks")
    void jiraParsesIssuesSuccessfully() {
        JiraTaskSource source = new JiraTaskSource(
                "https://forma.atlassian.net",
                "manager@forma.studio",
                "dummy_api_token",
                "statusCategory != Done",
                restTemplate,
                objectMapper
        );
        assertTrue(source.isConfigured());

        String jsonResponse = """
                {
                  "issues": [
                    {
                      "key": "DES-101",
                      "fields": {
                        "summary": "Implement dark theme palette",
                        "timeoriginalestimate": 28800,
                        "project": { "name": "Atlas redesign" },
                        "assignee": { "emailAddress": "marcus.reed@forma.studio" },
                        "status": { "name": "In progress" },
                        "duedate": "2026-12-05"
                      }
                    }
                  ]
                }
                """;

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(jsonResponse, HttpStatus.OK));

        List<TaskSource.ExternalTask> tasks = source.fetchTasks();

        assertEquals(1, tasks.size());
        TaskSource.ExternalTask task = tasks.get(0);
        assertEquals("jira-DES-101", task.externalId());
        assertEquals("Implement dark theme palette", task.title());
        assertEquals("marcus.reed@forma.studio", task.assigneeEmail());
        assertEquals("Atlas redesign", task.projectName());
        assertEquals(8, task.estimatedHours()); // 28800 seconds / 3600 = 8h
        assertEquals("In progress", task.status());
    }

    @Test
    @DisplayName("ICalLeaveSource parses iCal calendar events into external leave records")
    void iCalParsesEventsSuccessfully() {
        ICalLeaveSource source = new ICalLeaveSource("https://calendar.google.com/feed.ics", restTemplate);
        assertTrue(source.isConfigured());

        String icalResponse = """
                BEGIN:VCALENDAR
                VERSION:2.0
                BEGIN:VEVENT
                UID:event-12345@google.com
                SUMMARY:Out of office - Annual Vacation
                DESCRIPTION:Out of office for Asha Patel (asha.patel@forma.studio)
                DTSTART:20261125T090000Z
                DTEND:20261126T180000Z
                END:VEVENT
                END:VCALENDAR
                """;

        when(restTemplate.getForObject(anyString(), eq(String.class)))
                .thenReturn(icalResponse);

        List<LeaveSource.ExternalLeave> leaves = source.fetchLeaves();

        assertEquals(1, leaves.size());
        LeaveSource.ExternalLeave leave = leaves.get(0);
        assertEquals("ical-event-12345@google.com", leave.externalId());
        assertEquals("asha.patel@forma.studio", leave.employeeEmail());
        assertTrue(leave.type().contains("Out of office"));
    }

    @Test
    @DisplayName("MockTaskSource and MockLeaveSource provide demo fallback data")
    void mockAdaptersProvideData() {
        MockTaskSource mockTaskSource = new MockTaskSource();
        assertFalse(mockTaskSource.isConfigured());
        assertEquals("mock", mockTaskSource.getSourceType());
        assertFalse(mockTaskSource.fetchTasks().isEmpty());

        MockLeaveSource mockLeaveSource = new MockLeaveSource();
        assertFalse(mockLeaveSource.isConfigured());
        assertEquals("mock", mockLeaveSource.getSourceType());
        assertFalse(mockLeaveSource.fetchLeaves().isEmpty());
    }
}
