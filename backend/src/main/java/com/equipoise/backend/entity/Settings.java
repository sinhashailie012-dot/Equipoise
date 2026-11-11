package com.equipoise.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Settings {

    @Id
    @Builder.Default
    private String id = "default";

    // Working hours
    @Builder.Default
    private String defaultWeeklyCapacity = "40 hours";

    @Builder.Default
    private String workspaceTimeZone = "London · GMT (UTC+0)";

    @Builder.Default
    private String workdaysCsv = "Mon,Tue,Wed,Thu,Fri";

    @Builder.Default
    private String workdayStarts = "09:00";

    @Builder.Default
    private String workdayEnds = "18:00";

    @Builder.Default
    private String unpaidBreak = "60 minutes";

    @Builder.Default
    private Boolean deductLeaveAutomatically = true;

    // Thresholds
    @Builder.Default
    private Integer spareThreshold = 80;

    @Builder.Default
    private Integer balancedThreshold = 100;

    @Builder.Default
    private Integer stretchedThreshold = 110;

    @Builder.Default
    private Integer overloadedThreshold = 125;

    @Builder.Default
    private String atRiskScore = "Above 60 / 100";

    @Builder.Default
    private String criticalRiskScore = "80 / 100 and above";

    // Notifications
    @Builder.Default
    private Boolean immediateCriticalAlerts = true;

    @Builder.Default
    private Boolean dailyDigest = true;

    @Builder.Default
    private Boolean weekendEmail = false;
}

