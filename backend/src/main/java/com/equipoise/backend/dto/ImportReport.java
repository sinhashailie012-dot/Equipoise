package com.equipoise.backend.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportReport {
    private int rowsCreated;
    private int rowsSkipped;
    @Builder.Default
    private List<ImportRowError> errors = new ArrayList<>();

    public void addError(int lineNumber, String message) {
        errors.add(new ImportRowError(lineNumber, message));
    }

    public void incrementCreated() {
        this.rowsCreated++;
    }

    public void incrementSkipped() {
        this.rowsSkipped++;
    }

    public boolean hasErrors() {
        return !errors.isEmpty();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportRowError {
        private int lineNumber;
        private String message;
    }
}
