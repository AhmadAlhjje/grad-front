import apiClient from '@/lib/axios';
import type { AnalysisResult, ImpactEvaluation } from '@/types';

export interface AnalyzeSurveyResponsesData {
  projectId: string;
  surveyId: string;
  responses: { textValue: string }[];
  language: 'ar' | 'en';
}

export interface NeedsTopicsData {
  projectId: string;
  projectName: string;
  responses: { text: string }[];
  language: 'ar' | 'en';
}

export interface ImpactEvaluationData {
  projectId: string;
  activityId?: string;
  preSurveyData: {
    averageKnowledgeScore: number;
    averageConfidence: number;
    skillLevel: number;
    responses: { question: string; average: number }[];
  };
  postSurveyData: {
    averageKnowledgeScore: number;
    averageConfidence: number;
    skillLevel: number;
    responses: { question: string; average: number }[];
  };
  indicators: {
    name: string;
    currentValue: number;
    targetValue: number;
    category: string;
  }[];
  language: 'ar' | 'en';
}

export interface ComprehensiveAnalysisData {
  projectId: string;
  projectData: {
    name: string;
    description: string;
    type: string;
    goals: {
      short_term: string[];
      long_term: string[];
    };
  };
  allSurveyData: {
    type: string;
    averageScore: number;
    totalResponses: number;
  }[];
  indicators: {
    name: string;
    currentValue: number;
    targetValue: number;
  }[];
  language: 'ar' | 'en';
}

export const analysisApi = {
  /**
   * Analyze survey text responses
   * POST /analysis/survey-responses
   */
  analyzeSurveyResponses: async (data: AnalyzeSurveyResponsesData): Promise<AnalysisResult> => {
    const { data: result } = await apiClient.post<AnalysisResult>(
      '/analysis/survey-responses',
      data
    );
    return result;
  },

  /**
   * Extract topics from needs assessment
   * POST /analysis/needs-topics
   */
  extractNeedsTopics: async (data: NeedsTopicsData): Promise<AnalysisResult> => {
    const { data: result } = await apiClient.post<AnalysisResult>('/analysis/needs-topics', data);
    return result;
  },

  /**
   * Evaluate impact (Pre/Post comparison)
   * POST /analysis/impact-evaluation
   */
  evaluateImpact: async (
    data: ImpactEvaluationData
  ): Promise<AnalysisResult & { evaluation: ImpactEvaluation }> => {
    const { data: result } = await apiClient.post<AnalysisResult & { evaluation: ImpactEvaluation }>(
      '/analysis/impact-evaluation',
      data
    );
    return result;
  },

  /**
   * Run comprehensive project analysis
   * POST /analysis/comprehensive
   */
  comprehensiveAnalysis: async (data: ComprehensiveAnalysisData): Promise<AnalysisResult> => {
    const { data: result } = await apiClient.post<AnalysisResult>('/analysis/comprehensive', data);
    return result;
  },

  /**
   * Get project analysis history
   * GET /analysis/project/:projectId
   */
  getProjectAnalysis: async (projectId: string): Promise<AnalysisResult[]> => {
    const { data } = await apiClient.get<AnalysisResult[]>(`/analysis/project/${projectId}`);
    return data;
  },

  /**
   * Get analysis by ID
   * GET /analysis/:id
   */
  getById: async (id: string): Promise<AnalysisResult> => {
    const { data } = await apiClient.get<AnalysisResult>(`/analysis/${id}`);
    return data;
  },
};
