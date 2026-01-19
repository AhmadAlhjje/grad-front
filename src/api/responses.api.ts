import apiClient from '@/lib/axios';
import type { SurveyResponse, SubmitResponseData, PaginatedResponse } from '@/types';

export interface ResponsesListParams {
  page?: number;
  limit?: number;
  status?: 'draft' | 'submitted';
  startDate?: string;
  endDate?: string;
}

// Response wrapper type from backend
interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message: string;
}

export const responsesApi = {
  /**
   * Get survey responses
   * GET /surveys/:surveyId/responses
   */
  getBySurvey: async (
    surveyId: string,
    params?: ResponsesListParams
  ): Promise<SurveyResponse[]> => {
    const { data } = await apiClient.get<ApiResponse<SurveyResponse[]> | SurveyResponse[]>(
      `/surveys/${surveyId}/responses`,
      { params }
    );
    if ('data' in data && 'statusCode' in data) {
      return data.data;
    }
    return data as SurveyResponse[];
  },

  /**
   * Get response by ID with answers
   * GET /surveys/responses/:id
   */
  getById: async (id: string): Promise<SurveyResponse> => {
    const { data } = await apiClient.get<ApiResponse<SurveyResponse> | SurveyResponse>(`/surveys/responses/${id}`);
    if ('data' in data && 'statusCode' in data) {
      return data.data;
    }
    return data as SurveyResponse;
  },

  /**
   * Submit survey response
   * POST /surveys/responses
   */
  submit: async (responseData: SubmitResponseData): Promise<{ response: SurveyResponse }> => {
    const { data } = await apiClient.post<{ response: SurveyResponse }>(
      '/surveys/responses',
      responseData
    );
    return data;
  },

  /**
   * Save draft response
   * POST /surveys/responses/draft
   */
  saveDraft: async (responseData: SubmitResponseData): Promise<{ response: SurveyResponse }> => {
    const { data } = await apiClient.post<{ response: SurveyResponse }>(
      '/surveys/responses/draft',
      responseData
    );
    return data;
  },

  /**
   * Update draft response
   * PATCH /surveys/responses/:id
   */
  updateDraft: async (
    id: string,
    responseData: Partial<SubmitResponseData>
  ): Promise<SurveyResponse> => {
    const { data } = await apiClient.patch<SurveyResponse>(`/surveys/responses/${id}`, responseData);
    return data;
  },

  /**
   * Delete response
   * DELETE /surveys/responses/:id
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/surveys/responses/${id}`);
  },

  /**
   * Get my draft responses
   * GET /surveys/responses/my-drafts
   */
  getMyDrafts: async (): Promise<SurveyResponse[]> => {
    const { data } = await apiClient.get<SurveyResponse[]>('/surveys/responses/my-drafts');
    return data;
  },
};
