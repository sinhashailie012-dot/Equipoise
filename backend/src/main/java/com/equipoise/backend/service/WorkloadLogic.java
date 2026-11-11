package com.equipoise.backend.service;

import com.equipoise.backend.entity.Employee;
import com.equipoise.backend.entity.Settings;
import com.equipoise.backend.entity.StatusBand;

public final class WorkloadLogic {
    private WorkloadLogic() {}

    public static int utilization(int allocatedHours, int capacityHours) {
        return capacityHours <= 0 ? 0 : (int) Math.round((double) allocatedHours * 100 / capacityHours);
    }

    public static StatusBand status(int utilization, Settings settings) {
        int spare = settings == null ? 80 : settings.getSpareThreshold();
        int balanced = settings == null ? 100 : settings.getBalancedThreshold();
        int stretched = settings == null ? 110 : settings.getStretchedThreshold();
        int overloaded = settings == null ? 125 : settings.getOverloadedThreshold();
        if (utilization < spare) return StatusBand.SPARE;
        if (utilization <= balanced) return StatusBand.BALANCED;
        if (utilization <= stretched) return StatusBand.STRETCHED;
        if (utilization <= overloaded) return StatusBand.OVERLOADED;
        return StatusBand.CRITICAL;
    }

    public static int burnoutScore(Employee employee) {
        int overtime = csvTotal(employee.getOvertimeHistoryCsv());
        int aboveCapacityWeeks = csvLongWeeks(employee.getWeeklyAllocationCsv(), employee.getContractedHours());
        int score = 15 + Math.min(employee.getConsecutiveLongWeeks() * 6, 30)
                + Math.min(employee.getWeekendHours() * 2, 20)
                + Math.min(overtime, 24)
                + Math.min(aboveCapacityWeeks * 3, 15)
                + Math.max(0, 7 - employee.getLeaveRecoveryDays()) * 2;
        return Math.min(100, Math.max(0, score));
    }

    private static int csvTotal(String values) {
        if (values == null || values.isBlank()) return 0;
        int total = 0;
        for (String value : values.split(",")) {
            try {
                total += Integer.parseInt(value.trim());
            } catch (NumberFormatException exception) {
                throw new IllegalStateException("Invalid numeric value in workload history: " + value, exception);
            }
        }
        return total;
    }

    private static int csvLongWeeks(String values, Integer capacity) {
        if (values == null || values.isBlank() || capacity == null) return 0;
        int count = 0;
        for (String value : values.split(",")) {
            try {
                if (Integer.parseInt(value.trim()) > capacity) count++;
            } catch (NumberFormatException exception) {
                throw new IllegalStateException("Invalid numeric value in workload history: " + value, exception);
            }
        }
        return count;
    }
}
