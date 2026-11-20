package com.equipoise.backend.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class SlackNotifier {

    private static final Logger log = LoggerFactory.getLogger(SlackNotifier.class);

    private final String webhookUrl;
    private final RestTemplate restTemplate;

    public SlackNotifier(
            @Value("${app.notifications.slack-webhook-url:}") String webhookUrl,
            RestTemplate restTemplate
    ) {
        this.webhookUrl = webhookUrl == null ? "" : webhookUrl.trim();
        this.restTemplate = restTemplate;
    }

    public boolean isConfigured() {
        return !webhookUrl.isBlank();
    }

    public boolean send(String text) {
        if (!isConfigured()) {
            log.info("[SLACK NOT CONFIGURED] Message logged only: {}", text);
            return false;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> request = new HttpEntity<>(Map.of("text", text), headers);
            restTemplate.postForEntity(webhookUrl, request, String.class);
            log.info("Successfully sent Slack notification.");
            return true;
        } catch (Exception e) {
            log.error("Failed to send Slack notification to webhook: {}", e.getMessage());
            return false;
        }
    }
}
