package com.equipoise.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    private String id; // e.g. "atlas-redesign"

    @Column(nullable = false)
    private String name;

    private String subtitle;
    private String status;
    private String statusVariant; // e.g. "stretched", "overloaded", "balanced"
    private String accentColor;
    private String leadName;
    private String leadInitials;

    @Builder.Default
    private Integer weeklyAllocation = 112;

    @Builder.Default
    private Integer weeklyCapacity = 120;

    @Builder.Default
    private Integer percentage = 93;

    @Builder.Default
    private Integer completedTasks = 28;

    @Builder.Default
    private Integer totalTasks = 44;

    @Builder.Default
    private Integer activeTasks = 16;

    @Builder.Default
    private Integer overdueTasks = 2;

    @Builder.Default
    private Integer atRiskPeople = 1;

    private String nextMilestone;
    private String projectDueDate;
    private String contributorsCsv; // e.g. "AP,DK,JO"

    @Column(length = 1000)
    private String note;

    @OneToMany(mappedBy = "projectEntity", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Task> tasks = new ArrayList<>();
}

