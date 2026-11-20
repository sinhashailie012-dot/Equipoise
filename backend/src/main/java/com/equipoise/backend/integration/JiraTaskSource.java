package com.equipoise.backend.integration;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Component
public class JiraTaskSource implements TaskSource {

    private static final Logger log = LoggerFactory.getLogger(JiraTaskSource.class);

    private final String baseUrl;
    private final String email;
    private final String apiToken;
    private final String jql;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public JiraTaskSource(
            @Value("${app.integrations.jira.base-url:}") String baseUrl,
            @Value("${app.integrations.jira.email:}") String email,
            @Value("${app.integrations.jira.api-token:}") String apiToken,
            @Value("${app.integrations.jira.jql:statusCategory != Done ORDER BY created DESC}") String jql,
            RestTemplate restTemplate,
            ObjectMapper objectMapper
    ) {
        this.baseUrl = baseUrl == null ? "" : baseUrl.trim().replaceAll("/+$", "");
        this.email = email == null ? "" : email.trim();
        this.apiToken = apiToken == null ? "" : apiToken.trim();
        this.jql = jql == null || jql.isBlank() ? "statusCategory != Done ORDER BY created DESC" : jql.trim();
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean isConfigured() {
        return !baseUrl.isBlank() && !email.isBlank() && !apiToken.isBlank();
    }

    @Override
    public String getSourceType() {
        return "jira";
    }

    @Override
    public List<ExternalTask> fetchTasks() {
        if (!isConfigured()) {
            return List.of();
        }

        List<ExternalTask> tasks = new ArrayList<>();
        try {
            String url = baseUrl + "/rest/api/3/search?jql=" + java.net.URLEncoder.encode(jql, StandardCharsets.UTF_8);
            HttpHeaders headers = new HttpHeaders();
            String auth = email + ":" + apiToken;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));
            headers.set("Authorization", "Basic " + encodedAuth);
            headers.set("Accept", "application/json");

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode issues = root.path("issues");
                if (issues.isArray()) {
                    for (JsonNode issue : issues) {
                        String key = issue.path("key").asText();
                        JsonNode fields = issue.path("fields");
                        String summary = fields.path("summary").asText("Untitled Issue");
                        String projectName = fields.path("project").path("name").asText("Jira");
                        String assigneeEmail = fields.path("assignee").path("emailAddress").asText("");
                        int estimateSeconds = fields.path("timeoriginalestimate").asInt(fields.path("aggregatetimeoriginalestimate").asInt(0));
                        int hours = estimateSeconds > 0 ? (int) Math.round((double) estimateSeconds / 3600) : 6;
                        String status = fields.path("status").path("name").asText("To do");
                        String dueDate = fields.path("duedate").asText("");

                        tasks.add(new ExternalTask(
                                "jira-" + key,
                                summary,
                                assigneeEmail,
                                projectName,
                                hours,
                                status,
                                dueDate
                        ));
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch tasks from Jira Cloud: {}", e.getMessage());
            throw new RuntimeException("Jira integration error: " + e.getMessage(), e);
        }
        return tasks;
    }
}
