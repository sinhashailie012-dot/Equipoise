package com.equipoise.backend.service;

import com.equipoise.backend.entity.Employee;
import com.equipoise.backend.entity.Settings;
import com.equipoise.backend.entity.StatusBand;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class WorkloadLogicTest {
    @Test
    void utilizationRoundsAssignedHoursAgainstCapacity() {
        assertEquals(120, WorkloadLogic.utilization(48, 40));
        assertEquals(0, WorkloadLogic.utilization(20, 0));
    }

    @Test
    void statusUsesConfiguredThresholdBoundaries() {
        Settings settings = Settings.builder()
                .spareThreshold(80)
                .balancedThreshold(100)
                .stretchedThreshold(110)
                .overloadedThreshold(125)
                .build();

        assertEquals(StatusBand.SPARE, WorkloadLogic.status(79, settings));
        assertEquals(StatusBand.BALANCED, WorkloadLogic.status(100, settings));
        assertEquals(StatusBand.STRETCHED, WorkloadLogic.status(110, settings));
        assertEquals(StatusBand.OVERLOADED, WorkloadLogic.status(125, settings));
        assertEquals(StatusBand.CRITICAL, WorkloadLogic.status(126, settings));
    }

    @Test
    void burnoutScoreAccountsForLongWeeksOvertimeWeekendWorkAndRecovery() {
        Employee employee = Employee.builder()
                .contractedHours(40)
                .consecutiveLongWeeks(4)
                .weekendHours(5)
                .leaveRecoveryDays(2)
                .weeklyAllocationCsv("40,42,45")
                .overtimeHistoryCsv("2,4,6")
                .build();

        assertEquals(77, WorkloadLogic.burnoutScore(employee));
    }
}
