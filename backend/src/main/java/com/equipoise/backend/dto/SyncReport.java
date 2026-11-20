package com.equipoise.backend.dto;

import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncReport {
    private String taskSourceMode; // "real" | "demo"
    private String leaveSourceMode; // "real" | "demo"
    private int tasksImported;
    private int tasksUpdated;
    private int leavesImported;
    private int leavesUpdated;
    private Instant lastSyncTime;
    @Builder.Default
    private List<String> errors = new ArrayList<>();

    public void addError(String err) {
        errors.add(err);
    }
}
