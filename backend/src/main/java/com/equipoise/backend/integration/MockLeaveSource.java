package com.equipoise.backend.integration;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MockLeaveSource implements LeaveSource {

    @Override
    public boolean isConfigured() {
        return false;
    }

    @Override
    public String getSourceType() {
        return "mock";
    }

    @Override
    public List<ExternalLeave> fetchLeaves() {
        return List.of(
                new ExternalLeave(
                        "ical-mock-1",
                        "marcus.reed@forma.studio",
                        "Out of office",
                        "1–2 Dec",
                        "16 hrs",
                        "Approved"
                ),
                new ExternalLeave(
                        "ical-mock-2",
                        "sofia.rivera@forma.studio",
                        "Annual leave",
                        "4–5 Dec",
                        "16 hrs",
                        "Approved"
                )
        );
    }
}
