import apiClient from '@/lib/axios';

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalSurveys: number;
  totalBeneficiaries: number;
  totalResponses: number;
  completionRate: number;
  impactScore: number;
}

export const dashboardApi = {
  /**
   * Get dashboard statistics
   * GET /dashboard/stats
   */
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get<DashboardStats>('/dashboard/stats');
    return data;
  },
};
