package com.equipoise.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "leaves")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Leave {

    @Id
    private String id; // e.g. "leave-1"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    private String employeeName;
    private String type; // "Annual leave", "Sick leave", etc.
    private String dates; // "16–17 Nov"
    private String hours; // "16 hrs"

    @Builder.Default
    private String status = "Approved";
}

