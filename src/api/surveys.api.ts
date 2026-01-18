import apiClient from '@/lib/axios';
import type {
  Survey,
  Question,
  CreateSurveyData,
  CreateQuestionData,
  SurveyAnalytics,
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

export const surveysApi = {
  // ============================================
  // Survey CRUD
  // ============================================

  /**
   * Get all surveys
   * GET /surveys
   */
  getAll: async (params?: SurveysListParams): Promise<Survey[]> => {
    const { data } = await apiClient.get<Survey[]>('/surveys', { params });
    return data;
  },

  /**
   * Get survey by ID
   * GET /surveys/:id
   */
  getById: async (id: string): Promise<Survey> => {
    const { data } = await apiClient.get<Survey>(`/surveys/${id}`);
    return data;
  },

  /**
   * Create new survey
   * POST /surveys
   */
  create: async (surveyData: CreateSurveyData): Promise<Survey> => {
    const { data } = await apiClient.post<Survey>('/surveys', surveyData);
    return data;
  },

  /**
   * Update survey
   * PATCH /surveys/:id
   */
  update: async (id: string, surveyData: UpdateSurveyData): Promise<Survey> => {
    const { data } = await apiClient.patch<Survey>(`/surveys/${id}`, surveyData);
    return data;
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
    const { data } = await apiClient.get<Question[]>(`/surveys/${surveyId}/questions`);
    return data;
  },

  /**
   * Add question to survey
   * POST /surveys/questions
   */
  addQuestion: async (questionData: CreateQuestionData): Promise<Question> => {
    const { data } = await apiClient.post<Question>('/surveys/questions', questionData);
    return data;
  },

  /**
   * Update question
   * PATCH /surveys/questions/:id
   */
  updateQuestion: async (id: string, questionData: UpdateQuestionData): Promise<Question> => {
    const { data } = await apiClient.patch<Question>(`/surveys/questions/${id}`, questionData);
    return data;
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
    const { data } = await apiClient.patch<Question[]>(`/surveys/${surveyId}/questions/reorder`, {
      questionIds,
    });
    return data;
  },

  // ============================================
  // Analytics
  // ============================================

  /**
   * Get survey analytics
   * GET /surveys/:surveyId/analytics
   */
  getAnalytics: async (surveyId: string): Promise<SurveyAnalytics> => {
    const { data } = await apiClient.get<SurveyAnalytics>(`/surveys/${surveyId}/analytics`);
    return data;
  },
};
