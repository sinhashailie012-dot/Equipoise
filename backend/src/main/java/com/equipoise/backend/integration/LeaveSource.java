package com.equipoise.backend.integration;

import java.util.List;

public interface LeaveSource {
    boolean isConfigured();
    String getSourceType();
    List<ExternalLeave> fetchLeaves();

    record ExternalLeave(
            String externalId,
            String employeeEmail,
            String type,
            String dates,
            String hours,
            String status
    ) {}
}
