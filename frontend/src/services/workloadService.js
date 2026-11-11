import apiClient, { USE_MOCK } from './api';
import { initialEmployees } from '../data/employees';
import { initialTasks } from '../data/tasks';
import { getUtilization, getStatusFromThresholds } from '../utils/workload';

let tasksState = JSON.parse(JSON.stringify(initialTasks));
let suggestionDismissed = false;
let suggestionAccepted = false;

export const workloadService = {
  async getOverviewData(dateRange = '2-8 Nov 2026') {
    if (!USE_MOCK) {
      const response = await apiClient.get('/workload/overview', { params: { dateRange } });
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 200));

    return {
      dateRange,
      kpis: {
        teamUtilization: { value: '96%', note: '306 of 320 hrs allocated', fraction: '306 / 320' },
        atRiskEmployees: { value: '3 of 8', note: 'Risk score above 60' },
        overdueTasks: { value: '5', note: 'Across 3 people' },
        spareCapacity: { value: '38 hrs', note: 'Available across 4 people' },
      },
      heatmap: {
        weeks: ['14 Sep', '21 Sep', '28 Sep', '5 Oct', '12 Oct', '19 Oct', '26 Oct', '2 Nov'],
        capacity: 40,
        rows: [
          { name: 'Asha Patel', id: 'asha-patel', hours: [34, 36, 38, 40, 44, 46, 50, 48] },
          { name: 'Daniel Kim', id: 'daniel-kim', hours: [32, 30, 34, 32, 30, 28, 30, 28] },
          { name: 'Sofia Rivera', id: 'sofia-rivera', hours: [32, 34, 36, 38, 40, 42, 44, 44] },
          { name: 'James Okafor', id: 'james-okafor', hours: [30, 32, 34, 36, 34, 36, 38, 36] },
          { name: 'Mei Tan', id: 'mei-tan', hours: [36, 38, 36, 40, 38, 40, 40, 40] },
          { name: 'Marcus Reed', id: 'marcus-reed', hours: [36, 38, 42, 44, 46, 48, 50, 52] },
          { name: 'Olivia Brooks', id: 'olivia-brooks', hours: [32, 30, 28, 30, 28, 26, 28, 26] },
          { name: 'Noah Williams', id: 'noah-williams', hours: [28, 30, 30, 32, 34, 32, 34, 32] },
        ],
      },
      teamBurnoutRisk: {
        score: 58,
        label: 'Elevated · 58 / 100',
        change: '+6 points from last week',
        insight: 'Sustained overtime is the strongest signal. Start with Marcus and Asha.',
      },
      needsAttention: [
        { id: 'marcus-reed', name: 'Marcus Reed', initials: 'MR', allocated: '52 hrs allocated', overdue: '2 overdue', status: 'critical' },
        { id: 'asha-patel', name: 'Asha Patel', initials: 'AP', allocated: '48 hrs allocated', overdue: '2 overdue', status: 'overloaded' },
        { id: 'sofia-rivera', name: 'Sofia Rivera', initials: 'SR', allocated: '44 hrs allocated', overdue: '1 overdue', status: 'stretched' },
      ],
      overtimeHistory: [
        { week: 'Sep 14', hours: 0 },
        { week: '21', hours: 0 },
        { week: '28', hours: 2 },
        { week: 'Oct 5', hours: 4 },
        { week: '12', hours: 10 },
        { week: '19', hours: 16 },
        { week: '26', hours: 24 },
        { week: 'Nov 2', hours: 24 },
      ],
      recommendation: {
        title: 'A small move could make a real difference.',
        body: 'Move 6 hrs from Asha to Daniel without changing the Atlas deadline.',
        actionLabel: 'Review rebalance',
        actionRoute: '/rebalancer',
      },
    };
  },

  async getRebalancerData(projectFilter = 'atlas-redesign') {
    if (!USE_MOCK) {
      const response = await apiClient.get('/workload/rebalancer', { params: { project: projectFilter } });
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 200));

    // Atlas redesign members: Asha Patel, Daniel Kim, James Okafor
    const people = [
      { id: 'asha-patel', name: 'Asha Patel', initials: 'AP', role: 'Senior product designer', project: 'Atlas redesign', contractedHours: 40 },
      { id: 'daniel-kim', name: 'Daniel Kim', initials: 'DK', role: 'Product designer', project: 'Atlas redesign', contractedHours: 40 },
      { id: 'james-okafor', name: 'James Okafor', initials: 'JO', role: 'UX researcher', project: 'Atlas redesign', contractedHours: 40 },
    ];

    const columns = people.map((person) => {
      const personTasks = tasksState.filter((t) => t.assigneeId === person.id && (projectFilter === 'all' || t.project.toLowerCase().includes('atlas')));
      const totalHours = personTasks.reduce((sum, t) => sum + (t.hours || 0), 0);
      const util = getUtilization(totalHours, person.contractedHours);
      const statusObj = getStatusFromThresholds(util);

      return {
        ...person,
        allocatedHours: totalHours,
        utilization: util,
        status: statusObj.key,
        statusLabel: statusObj.label,
        tasks: personTasks,
      };
    });

    const activeSuggestion = (!suggestionDismissed && !suggestionAccepted)
      ? {
          id: 'sugg-1',
          taskId: 'task-2',
          title: 'Move 6 hrs from Asha to Daniel',
          taskName: 'Research synthesis · Atlas redesign · Due 6 Nov',
          impactText: 'Asha: 48 → 42 hrs · 120% → 105%    Daniel: 28 → 34 hrs · 70% → 85%',
          matchText: 'Skill match: research synthesis · No deadline change',
        }
      : null;

    return {
      project: 'Atlas redesign · 3 people',
      dateRange: '2–8 Nov 2026',
      suggestion: activeSuggestion,
      columns,
    };
  },

  async reassignTask({ taskId, fromEmployeeId, toEmployeeId, notify = true }) {
    if (!USE_MOCK) {
      const response = await apiClient.post('/workload/reassign', { taskId, fromEmployeeId, toEmployeeId, notify });
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 250));

    const task = tasksState.find((t) => t.id === taskId);
    if (task) {
      task.assigneeId = toEmployeeId;
      task.isSuggested = false;
    }
    return { success: true, taskId, fromEmployeeId, toEmployeeId };
  },

  async acceptSuggestion(suggestionId) {
    if (!USE_MOCK) {
      const response = await apiClient.post(`/workload/suggestions/${suggestionId}/accept`);
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 200));

    suggestionAccepted = true;
    const task = tasksState.find((t) => t.id === 'task-2');
    if (task) {
      task.assigneeId = 'daniel-kim';
      task.isSuggested = false;
    }
    return { success: true, message: 'Suggestion accepted. 6 hours moved from Asha to Daniel.' };
  },

  async dismissSuggestion(suggestionId) {
    if (!USE_MOCK) {
      const response = await apiClient.post(`/workload/suggestions/${suggestionId}/dismiss`);
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 150));
    suggestionDismissed = true;
    return { success: true, message: 'Suggestion dismissed.' };
  },

  async resetRebalancer() {
    tasksState = JSON.parse(JSON.stringify(initialTasks));
    suggestionDismissed = false;
    suggestionAccepted = false;
    return Promise.resolve({ success: true });
  },
};

export default workloadService;
