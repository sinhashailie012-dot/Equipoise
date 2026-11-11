/**
 * Equipoise Workload & Burnout Calculations
 * Shared logic for utilization, status thresholds, and burnout risk scoring.
 */

export const DEFAULT_THRESHOLDS = {
  spare: 80,       // Below 80%
  balanced: 100,   // 80% - 100%
  stretched: 110,  // Above 100% - 110%
  overloaded: 125, // Above 110% - 125%
  critical: 125,   // Above 125%
  atRiskScore: 60,
  criticalRiskScore: 80,
};

export const STATUS_CONFIG = {
  spare: {
    key: 'spare',
    label: 'Spare capacity',
    dotColor: '#4F7A7F',
    bgColor: '#E7EFF0',
    textColor: '#2D5155',
    barColor: '#4F7A7F',
  },
  balanced: {
    key: 'balanced',
    label: 'Balanced',
    dotColor: '#7E9C7A',
    bgColor: '#EAF0E9',
    textColor: '#375734',
    barColor: '#7E9C7A',
  },
  stretched: {
    key: 'stretched',
    label: 'Stretched',
    dotColor: '#D4A537',
    bgColor: '#FAF3E1',
    textColor: '#7B5E1A',
    barColor: '#D4A537',
  },
  overloaded: {
    key: 'overloaded',
    label: 'Overloaded',
    dotColor: '#C4613F',
    bgColor: '#F8ECE7',
    textColor: '#873B21',
    barColor: '#C4613F',
  },
  critical: {
    key: 'critical',
    label: 'Critical',
    dotColor: '#7A2E3A',
    bgColor: '#F5EAEB',
    textColor: '#611C28',
    barColor: '#7A2E3A',
  },
};

/**
 * Calculates utilization percentage
 */
export function getUtilization(assignedHours, capacityHours = 40) {
  if (!capacityHours || capacityHours <= 0) return 0;
  return Math.round((assignedHours / capacityHours) * 100);
}

/**
 * Derives status from utilization percentage and configurable thresholds
 */
export function getStatusFromThresholds(utilizationPercent, thresholds = DEFAULT_THRESHOLDS) {
  const t = { ...DEFAULT_THRESHOLDS, ...thresholds };
  
  if (utilizationPercent < t.spare) {
    return STATUS_CONFIG.spare;
  }
  if (utilizationPercent <= t.balanced) {
    return STATUS_CONFIG.balanced;
  }
  if (utilizationPercent <= t.stretched) {
    return STATUS_CONFIG.stretched;
  }
  if (utilizationPercent <= t.overloaded) {
    return STATUS_CONFIG.overloaded;
  }
  return STATUS_CONFIG.critical;
}

/**
 * Calculates a burnout score (0 to 100) based on work patterns:
 * - Consecutive overtime weeks (weight: 35%)
 * - Current weekly overtime (weight: 25%)
 * - Weekend working hours (weight: 15%)
 * - Days without full recovery leave (weight: 15%)
 * - Overdue task pressure (weight: 10%)
 */
export function calculateBurnoutScore({
  consecutiveOvertimeWeeks = 0,
  overtimeHours = 0,
  weekendHours = 0,
  daysSinceLastLeave = 0,
  overdueTasksCount = 0,
} = {}) {
  // 1. Consecutive weeks over capacity: up to 6 weeks = 35 pts
  const consecutiveScore = Math.min(35, (consecutiveOvertimeWeeks / 6) * 35);

  // 2. Overtime hours this week: up to 16 hrs = 25 pts
  const overtimeScore = Math.min(25, (Math.max(0, overtimeHours) / 16) * 25);

  // 3. Weekend hours: up to 8 hrs = 15 pts
  const weekendScore = Math.min(15, (Math.max(0, weekendHours) / 8) * 15);

  // 4. Recovery debt (days since last full day off): 90+ days = 15 pts, 60+ = 10 pts
  let recoveryScore = 0;
  if (daysSinceLastLeave >= 90) recoveryScore = 15;
  else if (daysSinceLastLeave >= 60) recoveryScore = 10;
  else if (daysSinceLastLeave >= 45) recoveryScore = 5;

  // 5. Overdue tasks pressure: up to 3 overdue tasks = 10 pts
  const overdueScore = Math.min(10, overdueTasksCount * 3.5);

  const total = Math.round(consecutiveScore + overtimeScore + weekendScore + recoveryScore + overdueScore);
  return Math.min(100, Math.max(0, total));
}

/**
 * Returns qualitative label for burnout score
 */
export function getBurnoutLabel(score) {
  if (score >= 80) return { label: 'Critical', severity: 'critical', color: '#7A2E3A' };
  if (score >= 60) return { label: 'Elevated', severity: 'stretched', color: '#D4A537' };
  if (score >= 40) return { label: 'Moderate', severity: 'stretched', color: '#B8862F' };
  return { label: 'Low', severity: 'balanced', color: '#7E9C7A' };
}

/**
 * Get color for heatmap cell given hours and capacity
 */
export function getHeatmapColor(hours, capacity = 40, thresholds = DEFAULT_THRESHOLDS) {
  const util = getUtilization(hours, capacity);
  const status = getStatusFromThresholds(util, thresholds);
  return {
    util,
    statusKey: status.key,
    bgColor: status.bgColor,
    textColor: status.textColor,
    dotColor: status.dotColor,
  };
}

/**
 * Extracts initials from employee full name
 */
export function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '??';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Format hours display e.g. "48 hrs" or "48 / 40 hrs"
 */
export function formatHours(hours) {
  return `${hours} hrs`;
}

