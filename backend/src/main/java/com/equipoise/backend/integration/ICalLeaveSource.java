package com.equipoise.backend.integration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.io.BufferedReader;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Component
public class ICalLeaveSource implements LeaveSource {

    private static final Logger log = LoggerFactory.getLogger(ICalLeaveSource.class);

    private final String feedUrl;
    private final RestTemplate restTemplate;

    public ICalLeaveSource(
            @Value("${app.integrations.ical.feed-url:}") String feedUrl,
            RestTemplate restTemplate
    ) {
        this.feedUrl = feedUrl == null ? "" : feedUrl.trim();
        this.restTemplate = restTemplate;
    }

    @Override
    public boolean isConfigured() {
        return !feedUrl.isBlank();
    }

    @Override
    public String getSourceType() {
        return "ical";
    }

    @Override
    public List<ExternalLeave> fetchLeaves() {
        if (!isConfigured()) {
            return List.of();
        }

        List<ExternalLeave> leaves = new ArrayList<>();
        try {
            String icalContent = restTemplate.getForObject(feedUrl, String.class);
            if (icalContent != null) {
                leaves = parseIcal(icalContent);
            }
        } catch (Exception e) {
            log.error("Failed to fetch leaves from iCal feed: {}", e.getMessage());
            throw new RuntimeException("iCal integration error: " + e.getMessage(), e);
        }
        return leaves;
    }

    public static List<ExternalLeave> parseIcal(String icalContent) {
        List<ExternalLeave> result = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new StringReader(icalContent))) {
            String line;
            boolean inEvent = false;
            String uid = "";
            String summary = "";
            String description = "";
            String dtStart = "";
            String dtEnd = "";
            String attendee = "";

            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.equalsIgnoreCase("BEGIN:VEVENT")) {
                    inEvent = true;
                    uid = "";
                    summary = "";
                    description = "";
                    dtStart = "";
                    dtEnd = "";
                    attendee = "";
                } else if (line.equalsIgnoreCase("END:VEVENT")) {
                    inEvent = false;
                    // Check if event indicates out of office or leave
                    String fullText = (summary + " " + description).toLowerCase(Locale.ROOT);
                    if (fullText.contains("ooo") || fullText.contains("out of office")
                            || fullText.contains("leave") || fullText.contains("vacation") || fullText.contains("holiday")) {

                        String email = extractEmail(attendee, description, summary);
                        String externalId = uid.isBlank() ? "ical-" + Math.abs(summary.hashCode()) : "ical-" + uid;
                        String dates = formatDates(dtStart, dtEnd);

                        result.add(new ExternalLeave(
                                externalId,
                                email,
                                summary.isBlank() ? "Out of office" : summary,
                                dates,
                                "16 hrs",
                                "Approved"
                        ));
                    }
                } else if (inEvent) {
                    if (line.startsWith("UID:")) {
                        uid = line.substring(4);
                    } else if (line.startsWith("SUMMARY:")) {
                        summary = line.substring(8);
                    } else if (line.startsWith("DESCRIPTION:")) {
                        description = line.substring(12);
                    } else if (line.startsWith("DTSTART")) {
                        int colon = line.indexOf(':');
                        if (colon != -1) dtStart = line.substring(colon + 1);
                    } else if (line.startsWith("DTEND")) {
                        int colon = line.indexOf(':');
                        if (colon != -1) dtEnd = line.substring(colon + 1);
                    } else if (line.toUpperCase(Locale.ROOT).startsWith("ATTENDEE") || line.toUpperCase(Locale.ROOT).startsWith("ORGANIZER")) {
                        int colon = line.indexOf(':');
                        if (colon != -1) attendee = line.substring(colon + 1);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error parsing iCal: {}", e.getMessage());
        }
        return result;
    }

    private static String extractEmail(String attendee, String description, String summary) {
        String combined = attendee + " " + description + " " + summary;
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}").matcher(combined);
        if (m.find()) {
            return m.group(0);
        }
        return "";
    }

    private static String formatDates(String start, String end) {
        if (start.isBlank()) return "Upcoming";
        if (start.length() >= 8) {
            String y = start.substring(0, 4);
            String m = start.substring(4, 6);
            String d = start.substring(6, 8);
            return d + "/" + m + "/" + y;
        }
        return start;
    }
}
