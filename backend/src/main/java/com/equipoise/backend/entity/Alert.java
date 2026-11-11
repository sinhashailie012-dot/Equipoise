package com.equipoise.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alert {

    @Id
    private String id; // e.g. "alert-1"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity category;

    private String severityLabel;
    private String sender;
    private String time;

    @Builder.Default
    private Boolean isRead = false;

    @Builder.Default
    private Boolean isArchived = false;

    @Builder.Default
    private Boolean isSnoozed = false;

    private String snoozedUntil;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    private String actionLabel;
    private String actionRoute;
    private String actionType; // "navigate" | "modal"
    private String modalType;  // "schedule-1-1" | "reassign-task"
    private String personId;
    private String taskId;
}

