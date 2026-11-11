package com.equipoise.backend.entity;

public enum Severity {
    CRITICAL("critical", "Critical"),
    NEEDS_ATTENTION("needs-attention", "Needs attention"),
    AWARENESS("awareness", "For your awareness");

    private final String key;
    private final String label;

    Severity(String key, String label) {
        this.key = key;
        this.label = label;
    }

    public String getKey() {
        return key;
    }

    public String getLabel() {
        return label;
    }
}

