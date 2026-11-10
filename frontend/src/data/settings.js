export const initialSettings = {
  workingHours: {
    defaultWeeklyCapacity: '40 hours',
    workspaceTimeZone: 'London · GMT (UTC+0)',
    workdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    workdayStarts: '09:00',
    workdayEnds: '18:00',
    unpaidBreak: '60 minutes',
    deductLeaveAutomatically: true,
  },
  thresholds: [
    { band: 'spare', label: 'Spare capacity', range: 'Below 80%', note: 'Below 32 hrs at 40 hr capacity' },
    { band: 'balanced', label: 'Balanced', range: '80–100%', note: '32–40 hrs at 40 hr capacity' },
    { band: 'stretched', label: 'Stretched', range: 'Above 100–110%', note: 'Above 40–44 hrs at 40 hr capacity' },
    { band: 'overloaded', label: 'Overloaded', range: 'Above 110–125%', note: 'Above 44–50 hrs at 40 hr capacity' },
    { band: 'critical', label: 'Critical', range: 'Above 125%', note: 'Above 50 hrs at 40 hr capacity' },
  ],
  riskScores: {
    atRiskScore: 'Above 60 / 100',
    criticalRiskScore: '80 / 100 and above',
  },
  members: [
    {
      id: 'priya-shah',
      initials: 'PS',
      name: 'Priya Shah',
      description: 'Workspace, billing, team data and access',
      role: 'Workspace admin',
    },
    {
      id: 'emma-chen',
      initials: 'EC',
      name: 'Emma Chen',
      description: 'Team workload, risk signals and interventions',
      role: 'Manager',
    },
    {
      id: 'daniel-kim',
      initials: 'DK',
      name: 'Daniel Kim',
      description: 'Own tasks, allocation and leave only',
      role: 'Contributor',
    },
  ],
  notifications: {
    immediateCriticalAlerts: true,
    dailyDigest: true,
    weekendEmail: false,
  },
};

