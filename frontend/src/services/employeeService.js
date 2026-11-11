import apiClient, { USE_MOCK } from './api';
import { initialEmployees } from '../data/employees';
import { initialTasks } from '../data/tasks';

// In-memory persistent state for mock mode
let employeesState = JSON.parse(JSON.stringify(initialEmployees));
let tasksState = JSON.parse(JSON.stringify(initialTasks));

export const employeeService = {
  async getEmployees(params = {}) {
    if (!USE_MOCK) {
      const response = await apiClient.get('/employees', { params });
      const result = response.data.content || response.data;
      return params.sortBy === 'lowest'
        ? [...result].sort((a, b) => a.allocatedHours - b.allocatedHours)
        : result;
    }
    await new Promise((res) => setTimeout(res, 200));

    let result = [...employeesState];

    // Search filter
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (emp) =>
          emp.name.toLowerCase().includes(q) ||
          emp.role.toLowerCase().includes(q) ||
          emp.project.toLowerCase().includes(q)
      );
    }

    // Tab filter: 'all', 'at-risk', 'spare'
    if (params.tab === 'at-risk') {
      result = result.filter((emp) => emp.riskScore >= 60 || ['critical', 'overloaded', 'stretched'].includes(emp.status));
    } else if (params.tab === 'spare') {
      result = result.filter((emp) => emp.status === 'spare' || (emp.allocatedHours < emp.contractedHours * 0.8));
    }

    // Team filter
    if (params.team && params.team !== 'all') {
      result = result.filter((emp) => emp.department.toLowerCase().includes(params.team.toLowerCase()));
    }

    // Sort: default highest allocation first
    result.sort((a, b) => {
      if (params.sortBy === 'name') return a.name.localeCompare(b.name);
      if (params.sortBy === 'risk') return b.riskScore - a.riskScore;
      return (b.allocatedHours / b.contractedHours) - (a.allocatedHours / a.contractedHours);
    });

    return result;
  },

  async getEmployeeById(id) {
    if (!USE_MOCK) {
      const response = await apiClient.get(`/employees/${id}`);
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 200));

    const emp = employeesState.find((e) => e.id === id) || employeesState[0];
    const employeeTasks = tasksState.filter((t) => t.assigneeId === emp.id);

    return {
      ...emp,
      tasks: employeeTasks,
    };
  },

  async addManagerNote(employeeId, noteText, author = 'Emma Chen') {
    if (!USE_MOCK) {
      const response = await apiClient.post(`/employees/${employeeId}/notes`, { note: noteText, author });
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 250));

    const emp = employeesState.find((e) => e.id === employeeId);
    if (emp) {
      emp.managerNotes = noteText;
      emp.managerNoteDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return { success: true, employeeId, noteText, author };
  },

  async updateEmployee(employeeId, data) {
    if (!USE_MOCK) {
      const response = await apiClient.put(`/employees/${employeeId}`, data);
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 200));

    const idx = employeesState.findIndex((e) => e.id === employeeId);
    if (idx !== -1) {
      employeesState[idx] = { ...employeesState[idx], ...data };
      return employeesState[idx];
    }
    throw new Error('Employee not found');
  },
};

export default employeeService;
