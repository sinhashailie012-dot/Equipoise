import apiClient, { USE_MOCK } from './api';
import { teamCapacityTimeline, capacityWeeks } from '../data/capacity';

let timelineState = JSON.parse(JSON.stringify(teamCapacityTimeline));

let upcomingLeaveList = [
  { id: 'leave-1', employee: 'Asha Patel', dates: '16–17 Nov', type: 'Annual leave', hours: '16 hrs', status: 'Approved' },
  { id: 'leave-2', employee: 'Olivia Brooks', dates: '27 Nov', type: 'Annual leave', hours: '8 hrs', status: 'Approved' },
];

export const capacityService = {
  async getCapacityData(view = 'weeks') {
    if (!USE_MOCK) {
      const response = await apiClient.get('/capacity', { params: { view } });
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 200));

    return {
      kpis: {
        currentAllocation: { value: '96%', note: 'Week of 2 November' },
        nextWeek: { value: '93%', note: '296 of 320 hrs committed' },
        knownLeave: { value: '24 hrs', note: '3 days in this horizon' },
        capacityIn6Weeks: { value: '68 hrs', note: 'Uncommitted · week of 7 Dec' },
      },
      weeks: capacityWeeks,
      timeline: timelineState,
      upcomingLeave: upcomingLeaveList,
      recoveryCallout: {
        title: 'Protect the recovery window.',
        body: 'Asha returns to a 24-hour week on 16 November. Keep Atlas handoff work with Daniel, rather than compressing it around her leave.',
        actionLabel: 'Review Atlas allocations',
        actionRoute: '/rebalancer',
      },
    };
  },

  async addLeave(leaveData) {
    if (!USE_MOCK) {
      const response = await apiClient.post('/capacity/leave', leaveData);
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 250));

    const newLeave = {
      id: 'leave-' + Date.now(),
      employee: leaveData.employee || 'Asha Patel',
      dates: leaveData.dates || '1–2 Dec',
      type: leaveData.type || 'Annual leave',
      hours: `${leaveData.hours || 16} hrs`,
      status: 'Approved',
    };
    upcomingLeaveList.push(newLeave);

    // Also deduct capacity from that week in timeline if applicable
    const empTimeline = timelineState.find((t) => t.name.toLowerCase().includes(newLeave.employee.toLowerCase()));
    if (empTimeline && empTimeline.schedule[2]) {
      empTimeline.schedule[2].isLeave = true;
      empTimeline.schedule[2].leaveLabel = '24 / 24h · leave';
    }

    return { success: true, leave: newLeave };
  },

  async addAllocation(allocationData) {
    if (!USE_MOCK) {
      const response = await apiClient.post('/capacity/allocations', allocationData);
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 200));

    return { success: true, allocationData };
  },
};

export default capacityService;

