package com.equipoise.backend.entity;

public enum StatusBand {
    SPARE("spare", "Spare capacity", "#4F7A7F"),
    BALANCED("balanced", "Balanced", "#7E9C7A"),
    STRETCHED("stretched", "Stretched", "#D4A537"),
    OVERLOADED("overloaded", "Overloaded", "#C4613F"),
    CRITICAL("critical", "Critical", "#7A2E3A");

    private final String key;
    private final String label;
    private final String color;

    StatusBand(String key, String label, String color) {
        this.key = key;
        this.label = label;
        this.color = color;
    }

    public String getKey() {
        return key;
    }

    public String getLabel() {
        return label;
    }

    public String getColor() {
        return color;
    }
}

