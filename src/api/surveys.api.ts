import apiClient from '@/lib/axios';
import type {
  Survey,
  Question,
  CreateSurveyData,
  CreateQuestionData,
  SurveyAnalytics,
  SurveyResponse,
  PaginatedResponse,
} from '@/types';

export interface SurveysListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  project?: string;
}

export interface UpdateSurveyData extends Partial<CreateSurveyData> {
  status?: 'draft' | 'active' | 'closed' | 'archived';
}

export interface UpdateQuestionData extends Partial<CreateQuestionData> {}

// Response wrapper type from backend
interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message: string;
}

export const surveysApi = {
  // ============================================
  // Survey CRUD
  // ============================================

  /**
   * Get all surveys
   * GET /surveys
   */
  getAll: async (params?: SurveysListParams): Promise<Survey[]> => {
    const { data } = await apiClient.get<ApiResponse<Survey[]> | Survey[]>('/surveys', { params });
    // Handle both wrapped and unwrapped responses
    if ('data' in data && 'statusCode' in data) {
      return data.data;
    }
    return data as Survey[];
  },

  /**
   * Get survey by ID
   * GET /surveys/:id
   */
  getById: async (id: string): Promise<Survey> => {
    const { data } = await apiClient.get<ApiResponse<Survey> | Survey>(`/surveys/${id}`);
    // Handle both wrapped and unwrapped responses
    if ('data' in data && 'statusCode' in data) {
      return data.data;
    }
    return data as Survey;
  },

  /**
   * Create new survey
   * POST /surveys
   */
  create: async (surveyData: CreateSurveyData): Promise<Survey> => {
    const { data } = await apiClient.post<ApiResponse<Survey> | Survey>('/surveys', surveyData);
    if ('data' in data && 'statusCode' in data) {
      return data.data;
    }
    return data as Survey;
  },

  /**
   * Update survey
   * PATCH /surveys/:id
   */
  update: async (id: string, surveyData: UpdateSurveyData): Promise<Survey> => {
    const { data } = await apiClient.patch<ApiResponse<Survey> | Survey>(`/surveys/${id}`, surveyData);
    if ('data' in data && 'statusCode' in data) {
      return data.data;
    }
    return data as Survey;
  },

  /**
   * Delete survey
   * DELETE /surveys/:id
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/surveys/${id}`);
  },

  // ============================================
  // Questions CRUD
  // ============================================

  /**
   * Get survey questions
   * GET /surveys/:surveyId/questions
   */
  getQuestions: async (surveyId: string): Promise<Question[]> => {
    const { data } = await apiClient.get<ApiResponse<Question[]> | Question[]>(`/surveys/${surveyId}/questions`);
    if ('data' in data && 'statusCode' in data) {
      return data.data;
    }
    return data as Question[];
  },

  /**
   * Add question to survey
   * POST /surveys/questions
   */
  addQuestion: async (questionData: CreateQuestionData): Promise<Question> => {
    const { data } = await apiClient.post<ApiResponse<Question> | Question>('/surveys/questions', questionData);
    if ('data' in data && 'statusCode' in data) {
      return data.data;
    }
    return data as Question;
  },

  /**
   * Update question
   * PATCH /surveys/questions/:id
   */
  updateQuestion: async (id: string, questionData: UpdateQuestionData): Promise<Question> => {
    const { data } = await apiClient.patch<ApiResponse<Question> | Question>(`/surveys/questions/${id}`, questionData);
    if ('data' in data && 'statusCode' in data) {
      return data.data;
    }
    return data as Question;
  },

  /**
   * Delete question
   * DELETE /surveys/questions/:id
   */
  deleteQuestion: async (id: string): Promise<void> => {
    await apiClient.delete(`/surveys/questions/${id}`);
  },

  /**
   * Reorder questions
   * PATCH /surveys/:surveyId/questions/reorder
   */
  reorderQuestions: async (surveyId: string, questionIds: string[]): Promise<Question[]> => {
    const { data } = await apiClient.patch<ApiResponse<Question[]> | Question[]>(`/surveys/${surveyId}/questions/reorder`, {
      questionIds,
    });
    if ('data' in data && 'statusCode' in data) {
      return data.data;
    }
    return data as Question[];
  },

  // ============================================
  // Analytics
  // ============================================

  /**
   * Get survey analytics
   * GET /surveys/:surveyId/analytics
   */
  getAnalytics: async (surveyId: string): Promise<SurveyAnalytics> => {
    const { data } = await apiClient.get<ApiResponse<SurveyAnalytics> | SurveyAnalytics>(`/surveys/${surveyId}/analytics`);
    if ('data' in data && 'statusCode' in data) {
      return data.data;
    }
    return data as SurveyAnalytics;
  },

  // ============================================
  // Responses
  // ============================================

  /**
   * Get survey responses
   * GET /surveys/:surveyId/responses
   */
  getResponses: async (surveyId: string): Promise<SurveyResponse[]> => {
    const { data } = await apiClient.get<ApiResponse<SurveyResponse[]> | SurveyResponse[]>(`/surveys/${surveyId}/responses`);
    if ('data' in data && 'statusCode' in data) {
      return data.data;
    }
    return data as SurveyResponse[];
  },

  /**
   * Get response by ID
   * GET /surveys/responses/:responseId
   */
  getResponseById: async (responseId: string): Promise<SurveyResponse> => {
    const { data } = await apiClient.get<ApiResponse<SurveyResponse> | SurveyResponse>(`/surveys/responses/${responseId}`);
    if ('data' in data && 'statusCode' in data) {
      return data.data;
    }
    return data as SurveyResponse;
  },
};
