import apiClient, { USE_MOCK } from './api';
import { initialInterventions } from '../data/interventions';

let interventionsState = JSON.parse(JSON.stringify(initialInterventions));
let scheduledCheckIns = [];

export const burnoutService = {
  async getBurnoutRiskData() {
    if (!USE_MOCK) {
      const response = await apiClient.get('/burnout');
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 200));

    return {
      kpis: {
        employeesAtRisk: { value: '3 of 8', note: 'Risk scores above 60' },
        criticalSignals: { value: '2', note: 'Marcus and Asha score ≥80' },
        openInterventions: { value: `${interventionsState.filter((i) => i.state !== 'Completed').length}`, note: '2 need attention today' },
        teamRiskScore: { value: '58 / 100', note: 'Elevated · +6 this week' },
      },
      conversations: [
        {
          id: 'marcus-reed',
          score: 88,
          name: 'Marcus Reed',
          role: 'Senior product designer',
          initials: 'MR',
          signals: '6 weeks above capacity · 2 overdue tasks',
          recommendation: 'Reduce Beacon scope by 8 hrs',
          status: 'critical',
          actionLabel: 'Review plan',
          actionType: 'plan',
        },
        {
          id: 'asha-patel',
          score: 82,
          name: 'Asha Patel',
          role: 'Senior product designer',
          initials: 'AP',
          signals: '24 hrs overtime in 3 weeks · limited recovery',
          recommendation: 'Move 6 hrs to Daniel; schedule a 1:1',
          status: 'critical',
          actionLabel: 'Schedule 1:1',
          actionType: 'schedule-1-1',
        },
        {
          id: 'sofia-rivera',
          score: 67,
          name: 'Sofia Rivera',
          role: 'Content designer',
          initials: 'SR',
          signals: '3 weeks above capacity · 1 overdue task',
          recommendation: 'Move 4 hrs of visual QA to Olivia',
          status: 'stretched',
          actionLabel: 'Review plan',
          actionType: 'plan',
        },
      ],
      drivers: [
        { label: 'Sustained overtime', count: '3 of 8 people', percentage: 37.5, color: '#C4613F' },
        { label: 'Deadline compression', count: '3 of 8 people', percentage: 37.5, color: '#D4A537' },
        { label: 'Limited recovery time', count: '2 of 8 people', percentage: 25, color: '#4F7A7F' },
      ],
      interventions: interventionsState,
    };
  },

  async scheduleCheckIn({ employeeId, employeeName, date, time, duration, location, agenda }) {
    if (!USE_MOCK) {
      const response = await apiClient.post('/burnout/check-in', {
        employeeId,
        date,
        time,
        duration,
        location,
        agenda,
      });
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 250));

    const checkIn = {
      id: 'checkin-' + Date.now(),
      employeeId,
      employeeName: employeeName || 'Asha Patel',
      date: date || 'Friday, 6 Nov 2026',
      time: time || '10:00',
      duration: duration || '30 minutes',
      location: location || 'Google Meet',
      agenda,
      status: 'Scheduled',
    };
    scheduledCheckIns.push(checkIn);

    // Update intervention status if matching person
    const matched = interventionsState.find((i) => i.personId === employeeId || (employeeName && i.person.includes(employeeName)));
    if (matched) {
      matched.state = 'Scheduled';
      matched.due = date || '6 Nov';
    }

    return {
      success: true,
      message: `1:1 check-in scheduled with ${employeeName || 'Asha Patel'} for ${date || '6 Nov'} at ${time || '10:00'}.`,
      checkIn,
    };
  },

  async updateIntervention(id, data) {
    if (!USE_MOCK) {
      const response = await apiClient.put(`/burnout/interventions/${id}`, data);
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 200));

    const item = interventionsState.find((i) => i.id === id);
    if (item) {
      Object.assign(item, data);
      return item;
    }
    throw new Error('Intervention not found');
  },
};

export default burnoutService;

