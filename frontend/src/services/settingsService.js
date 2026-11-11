import apiClient, { USE_MOCK } from './api';
import { initialSettings } from '../data/settings';

let settingsState = JSON.parse(JSON.stringify(initialSettings));

export const settingsService = {
  async getSettings() {
    if (!USE_MOCK) {
      const response = await apiClient.get('/settings');
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 200));
    return JSON.parse(JSON.stringify(settingsState));
  },

  async updateSettings(newSettings) {
    if (!USE_MOCK) {
      const response = await apiClient.put('/settings', newSettings);
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 250));

    settingsState = {
      ...settingsState,
      ...newSettings,
      workingHours: {
        ...settingsState.workingHours,
        ...(newSettings.workingHours || {}),
      },
      notifications: {
        ...settingsState.notifications,
        ...(newSettings.notifications || {}),
      },
    };

    if (newSettings.thresholds) {
      settingsState.thresholds = newSettings.thresholds;
    }

    if (newSettings.members) {
      settingsState.members = newSettings.members;
    }

    return JSON.parse(JSON.stringify(settingsState));
  },

  async inviteMember(memberData) {
    if (!USE_MOCK) {
      const response = await apiClient.post('/settings/members', memberData);
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 200));

    const newMember = {
      id: 'member-' + Date.now(),
      initials: memberData.name ? memberData.name.split(' ').map((n) => n[0]).join('').toUpperCase() : 'NM',
      name: memberData.name || 'New Member',
      description: memberData.description || 'Team contributor',
      role: memberData.role || 'Contributor',
    };
    settingsState.members.push(newMember);
    return { success: true, member: newMember };
  },
};

export default settingsService;

