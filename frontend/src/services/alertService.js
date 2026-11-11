import apiClient, { USE_MOCK } from './api';
import { initialAlerts } from '../data/alerts';

let alertsState = JSON.parse(JSON.stringify(initialAlerts));
let rulesState = [
  { id: 'rule-1', name: 'Workload > 125%', threshold: 125, severity: 'critical', active: true },
  { id: 'rule-2', name: 'Consecutive overtime >= 3 weeks', threshold: 3, severity: 'critical', active: true },
  { id: 'rule-3', name: 'Overdue tasks >= 2', threshold: 2, severity: 'needs-attention', active: true },
];

export const alertService = {
  async getAlerts(params = {}) {
    if (!USE_MOCK) {
      const response = await apiClient.get('/alerts', { params });
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 200));

    let list = [...alertsState];

    // Filter by tab
    if (params.tab === 'unread') {
      list = list.filter((a) => !a.isRead && !a.isArchived);
    } else if (params.tab === 'archived') {
      list = list.filter((a) => a.isArchived);
    } else {
      // all non-archived
      list = list.filter((a) => !a.isArchived);
    }

    // Filter by severity
    if (params.severity && params.severity !== 'all') {
      list = list.filter((a) => a.category === params.severity);
    }

    const unreadCount = alertsState.filter((a) => !a.isRead && !a.isArchived).length;

    return {
      alerts: list,
      unreadCount,
      totalCount: alertsState.filter((a) => !a.isArchived).length,
    };
  },

  async markAlertRead(id) {
    if (!USE_MOCK) {
      const response = await apiClient.put(`/alerts/${id}/read`);
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 150));

    const item = alertsState.find((a) => a.id === id);
    if (item) {
      item.isRead = true;
    }
    return { success: true, id };
  },

  async markAllAlertsRead() {
    if (!USE_MOCK) {
      const response = await apiClient.put('/alerts/read-all');
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 200));

    alertsState.forEach((a) => {
      a.isRead = true;
    });
    return { success: true, message: 'All alerts marked as read' };
  },

  async snoozeAlert(id, hours = 24) {
    if (!USE_MOCK) {
      const response = await apiClient.put(`/alerts/${id}/snooze`, { hours });
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 150));

    const item = alertsState.find((a) => a.id === id);
    if (item) {
      item.isSnoozed = true;
      item.snoozedUntil = new Date(Date.now() + hours * 3600 * 1000).toISOString();
    }
    return { success: true, message: `Alert snoozed for ${hours} hours` };
  },

  async archiveAlert(id) {
    if (!USE_MOCK) {
      const response = await apiClient.put(`/alerts/${id}/archive`);
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 150));

    const item = alertsState.find((a) => a.id === id);
    if (item) {
      item.isArchived = true;
    }
    return { success: true, message: 'Alert archived' };
  },

  async addAlertRule(rule) {
    if (!USE_MOCK) {
      const response = await apiClient.post('/alerts/rules', rule);
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 200));

    const newRule = {
      id: 'rule-' + Date.now(),
      name: rule.name || 'Custom rule',
      threshold: rule.threshold || 100,
      severity: rule.severity || 'needs-attention',
      active: true,
    };
    rulesState.push(newRule);
    return { success: true, rule: newRule };
  },

  async getAlertRules() {
    if (!USE_MOCK) {
      const response = await apiClient.get('/alerts/rules');
      return response.data;
    }
    return Promise.resolve(rulesState);
  },
};

export default alertService;

