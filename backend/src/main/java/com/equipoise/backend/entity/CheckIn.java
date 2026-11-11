package com.equipoise.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "check_ins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckIn {

    @Id
    private String id; // e.g. "checkin-1"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    private String employeeName;
    private String date;
    private String time;
    private String duration;
    private String location;

    @Column(length = 2000)
    private String agenda;

    @Builder.Default
    private String status = "Scheduled";
}

