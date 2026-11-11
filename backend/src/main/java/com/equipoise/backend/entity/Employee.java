package com.equipoise.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    private String id; // e.g. "asha-patel"

    @Column(nullable = false)
    private String name;

    private String initials;
    private String role;
    private String email;
    private String department;
    private String reportsTo;

    @Column(nullable = false)
    @Builder.Default
    private Integer allocatedHours = 40;

    @Column(nullable = false)
    @Builder.Default
    private Integer contractedHours = 40;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatusBand status = StatusBand.BALANCED;

    @Builder.Default
    private Integer riskScore = 50;

    @Builder.Default
    private Integer activeTasks = 0;

    @Builder.Default
    private Integer overdueTasks = 0;

    @Builder.Default
    private Integer consecutiveLongWeeks = 0;

    @Builder.Default
    private Integer weekendHours = 0;

    @Builder.Default
    private Integer leaveRecoveryDays = 7;

    @Builder.Default
    private String interventionState = "Needs attention";

    private String interventionDue;

    private String nextDeadline;
    private String project;

    @Column(length = 1000)
    private String weeklyAllocationCsv; // e.g. "34,36,38,40,44,46,50,48"

    @Column(length = 1000)
    private String overtimeHistoryCsv; // e.g. "0,0,0,0,4,6,10,8"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @OneToMany(mappedBy = "assignee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Task> tasks = new ArrayList<>();

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Note> notes = new ArrayList<>();

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Leave> leaves = new ArrayList<>();
}
