import apiClient from '@/lib/axios';

export interface Activity {
  _id: string;
  project: string;
  name: string;
  description: string;
  activityType: string;
  startDate: string;
  endDate?: string;
  location?: string;
  capacity?: number;
  registeredParticipants?: number;
  attendedParticipants?: number;
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityData {
  project: string;
  name: string;
  description: string;
  activityType: string;
  startDate: string;
  endDate?: string;
  location?: string;
  capacity?: number;
  status?: 'planned' | 'ongoing' | 'completed' | 'cancelled';
}

export interface UpdateActivityData extends Partial<CreateActivityData> {}

export interface ActivitiesListParams {
  status?: string;
  activityType?: string;
  project?: string;
}

export interface ActivityStatistics {
  totalActivities: number;
  upcomingActivities: number;
  ongoingActivities: number;
  completedActivities: number;
  totalParticipants: number;
  averageAttendanceRate: number;
}

export const activitiesApi = {
  /**
   * Create new activity
   * POST /activities
   */
  create: async (activityData: CreateActivityData): Promise<Activity> => {
    const { data } = await apiClient.post<Activity>('/activities', activityData);
    return data;
  },

  /**
   * Get all activities
   * GET /activities
   */
  getAll: async (params?: ActivitiesListParams): Promise<Activity[]> => {
    const { data } = await apiClient.get<Activity[]>('/activities', { params });
    return data;
  },

  /**
   * Get upcoming activities
   * GET /activities/upcoming
   */
  getUpcoming: async (limit = 10): Promise<Activity[]> => {
    const { data } = await apiClient.get<Activity[]>('/activities/upcoming', {
      params: { limit },
    });
    return data;
  },

  /**
   * Get activities statistics
   * GET /activities/statistics
   */
  getStatistics: async (projectId?: string): Promise<ActivityStatistics> => {
    const { data } = await apiClient.get<ActivityStatistics>('/activities/statistics', {
      params: projectId ? { projectId } : undefined,
    });
    return data;
  },

  /**
   * Get activities by project
   * GET /activities/project/:projectId
   */
  getByProject: async (projectId: string): Promise<Activity[]> => {
    const { data } = await apiClient.get<Activity[]>(`/activities/project/${projectId}`);
    return data;
  },

  /**
   * Get activities by date range
   * GET /activities/date-range
   */
  getByDateRange: async (startDate: string, endDate: string): Promise<Activity[]> => {
    const { data } = await apiClient.get<Activity[]>('/activities/date-range', {
      params: { startDate, endDate },
    });
    return data;
  },

  /**
   * Get activity by ID
   * GET /activities/:id
   */
  getById: async (id: string): Promise<Activity> => {
    const { data } = await apiClient.get<Activity>(`/activities/${id}`);
    return data;
  },

  /**
   * Get activity report
   * GET /activities/:id/report
   */
  getReport: async (id: string): Promise<any> => {
    const { data } = await apiClient.get(`/activities/${id}/report`);
    return data;
  },

  /**
   * Update activity
   * PATCH /activities/:id
   */
  update: async (id: string, activityData: UpdateActivityData): Promise<Activity> => {
    const { data } = await apiClient.patch<Activity>(`/activities/${id}`, activityData);
    return data;
  },

  /**
   * Delete activity
   * DELETE /activities/:id
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/activities/${id}`);
  },

  /**
   * Register participant for activity
   * POST /activities/:id/register
   */
  registerParticipant: async (id: string, participantData: any): Promise<Activity> => {
    const { data } = await apiClient.post<Activity>(`/activities/${id}/register`, participantData);
    return data;
  },

  /**
   * Unregister participant from activity
   * POST /activities/:id/unregister
   */
  unregisterParticipant: async (id: string, participantId: string): Promise<Activity> => {
    const { data } = await apiClient.post<Activity>(`/activities/${id}/unregister`, {
      participantId,
    });
    return data;
  },

  /**
   * Mark attendance for activity
   * PATCH /activities/:id/attendance
   */
  markAttendance: async (id: string, attendeeCount: number): Promise<Activity> => {
    const { data } = await apiClient.patch<Activity>(`/activities/${id}/attendance`, {
      attendeeCount,
    });
    return data;
  },

  /**
   * Update activity capacity
   * PATCH /activities/:id/capacity
   */
  updateCapacity: async (id: string, capacity: number): Promise<Activity> => {
    const { data } = await apiClient.patch<Activity>(`/activities/${id}/capacity`, {
      capacity,
    });
    return data;
  },
};
