import apiClient, { USE_MOCK } from './api';
import { initialTasks } from '../data/tasks';

let tasksState = JSON.parse(JSON.stringify(initialTasks));

export const taskService = {
  async getTasks(params = {}) {
    if (!USE_MOCK) {
      const response = await apiClient.get('/tasks', { params });
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 200));
    let list = [...tasksState];
    if (params.employeeId) list = list.filter((t) => t.assigneeId === params.employeeId);
    if (params.search) list = list.filter((t) => t.title.toLowerCase().includes(params.search.toLowerCase()));
    if (params.status) list = list.filter((t) => t.status === params.status);
    return { content: list, totalElements: list.length };
  },

  async createTask(data) {
    if (!USE_MOCK) {
      const response = await apiClient.post('/tasks', data);
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 200));
    const newTask = {
      id: 'task-' + Math.random().toString(36).substring(2, 9),
      title: data.title,
      project: data.project || 'Atlas redesign',
      assigneeId: data.assigneeId,
      assignee: data.assignee || 'Unassigned',
      hours: Number(data.hours || 0),
      due: data.due || 'Soon',
      status: data.status || 'To do',
      isSuggested: false,
    };
    tasksState.push(newTask);
    return newTask;
  },

  async updateTask(id, data) {
    if (!USE_MOCK) {
      const response = await apiClient.put(`/tasks/${id}`, data);
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 200));
    const idx = tasksState.findIndex((t) => t.id === id);
    if (idx !== -1) {
      tasksState[idx] = { ...tasksState[idx], ...data };
      return tasksState[idx];
    }
    throw new Error('Task not found');
  },

  async deleteTask(id) {
    if (!USE_MOCK) {
      const response = await apiClient.delete(`/tasks/${id}`);
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 200));
    tasksState = tasksState.filter((t) => t.id !== id);
    return { success: true, id };
  },
};

export default taskService;

