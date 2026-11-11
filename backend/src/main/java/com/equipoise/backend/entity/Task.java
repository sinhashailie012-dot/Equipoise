package com.equipoise.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    private String id; // e.g. "task-1"

    @Column(nullable = false)
    private String title;

    private String project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project projectEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee assignee;

    @Column(nullable = false)
    @Builder.Default
    private Integer hours = 6;

    private String due;
    private String status; // "In progress", "To do", "Overdue", "Scheduled"

    @Builder.Default
    private Boolean isSuggested = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suggested_to_id")
    private Employee suggestedTo;
}

