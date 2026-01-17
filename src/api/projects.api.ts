import apiClient from '@/lib/axios';
import type { Project, ProjectStatistics, CreateProjectData, PaginatedResponse } from '@/types';

export interface ProjectsListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  status?: 'draft' | 'active' | 'completed' | 'suspended';
}

export const projectsApi = {
  /**
   * Get all projects
   * GET /projects
   */
  getAll: async (params?: ProjectsListParams): Promise<PaginatedResponse<Project>> => {
    const { data } = await apiClient.get<PaginatedResponse<Project>>('/projects', { params });
    return data;
  },

  /**
   * Get my projects
   * GET /projects/my-projects
   */
  getMyProjects: async (): Promise<Project[]> => {
    const { data } = await apiClient.get<Project[]>('/projects/my-projects');
    return data;
  },

  /**
   * Get project by ID
   * GET /projects/:id
   */
  getById: async (id: string): Promise<Project> => {
    const { data } = await apiClient.get<Project>(`/projects/${id}`);
    return data;
  },

  /**
   * Get project statistics
   * GET /projects/:id/statistics
   */
  getStatistics: async (id: string): Promise<ProjectStatistics> => {
    const { data } = await apiClient.get<ProjectStatistics>(`/projects/${id}/statistics`);
    return data;
  },

  /**
   * Create new project
   * POST /projects
   */
  create: async (projectData: CreateProjectData): Promise<Project> => {
    const { data } = await apiClient.post<Project>('/projects', projectData);
    return data;
  },

  /**
   * Update project
   * PATCH /projects/:id
   */
  update: async (id: string, projectData: UpdateProjectData): Promise<Project> => {
    const { data } = await apiClient.patch<Project>(`/projects/${id}`, projectData);
    return data;
  },

  /**
   * Delete project
   * DELETE /projects/:id
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },

  /**
   * Add team member to project
   * POST /projects/:projectId/team/:userId
   */
  addTeamMember: async (projectId: string, userId: string): Promise<Project> => {
    const { data } = await apiClient.post<Project>(`/projects/${projectId}/team/${userId}`);
    return data;
  },

  /**
   * Remove team member from project
   * DELETE /projects/:projectId/team/:userId
   */
  removeTeamMember: async (projectId: string, userId: string): Promise<Project> => {
    const { data } = await apiClient.delete<Project>(`/projects/${projectId}/team/${userId}`);
    return data;
  },
};
