import apiClient, { USE_MOCK } from './api';
import { initialProjects } from '../data/projects';

let projectsState = JSON.parse(JSON.stringify(initialProjects));

export const projectService = {
  async getProjects(params = {}) {
    if (!USE_MOCK) {
      const response = await apiClient.get('/projects', { params });
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 200));

    let list = [...projectsState];

    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q) || p.lead.toLowerCase().includes(q)
      );
    }

    if (params.status && params.status !== 'all') {
      list = list.filter((p) => p.status.toLowerCase().includes(params.status.toLowerCase()));
    }

    if (params.lead && params.lead !== 'all') {
      list = list.filter((p) => p.lead.toLowerCase().includes(params.lead.toLowerCase()));
    }

    return {
      kpis: {
        activeProjects: { value: `${projectsState.length}`, note: '8 people contributing' },
        weeklyCommitments: { value: '306 hrs', note: 'Across 42 active tasks' },
        projectsNeedingCare: { value: '2', note: 'Atlas and Beacon' },
      },
      projects: list,
    };
  },

  async getProjectById(id) {
    if (!USE_MOCK) {
      const response = await apiClient.get(`/projects/${id}`);
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 200));

    const proj = projectsState.find((p) => p.id === id) || projectsState[0];
    return proj;
  },

  async createProject(projectData) {
    if (!USE_MOCK) {
      const response = await apiClient.post('/projects', projectData);
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 250));

    const newProject = {
      id: (projectData.name || 'new-project').toLowerCase().replace(/\s+/g, '-'),
      name: projectData.name || 'New Project',
      subtitle: projectData.subtitle || 'Project description and scope.',
      status: 'On track',
      statusVariant: 'balanced',
      accentColor: '#7E9C7A',
      lead: projectData.lead || 'Emma Chen',
      leadInitials: 'EC',
      weeklyAllocation: Number(projectData.weeklyAllocation) || 40,
      weeklyCapacity: Number(projectData.weeklyCapacity) || 40,
      percentage: 100,
      completedTasks: 0,
      totalTasks: 10,
      activeTasks: 10,
      overdueTasks: 0,
      atRiskPeople: 0,
      nextMilestone: projectData.nextMilestone || 'Sprint kickoff · 17 Nov',
      projectDueDate: projectData.projectDueDate || '15 Dec 2026',
      contributors: ['EC'],
      note: 'Newly created project. Team allocations pending setup.',
    };

    projectsState.push(newProject);
    return { success: true, project: newProject };
  },

  async updateProject(id, data) {
    if (!USE_MOCK) {
      const response = await apiClient.put(`/projects/${id}`, data);
      return response.data;
    }
    await new Promise((res) => setTimeout(res, 200));

    const idx = projectsState.findIndex((p) => p.id === id);
    if (idx !== -1) {
      projectsState[idx] = { ...projectsState[idx], ...data };
      return projectsState[idx];
    }
    throw new Error('Project not found');
  },
};

export default projectService;

