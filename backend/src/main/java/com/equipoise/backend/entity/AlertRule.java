package com.equipoise.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "alert_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertRule {

    @Id
    private String id; // e.g. "rule-1"

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer thresholdPercent;

    @Column(nullable = false)
    private String severity; // "critical", "needs-attention", "awareness"

    @Builder.Default
    private Boolean active = true;
}

