// ============================================
// Base Types
// ============================================

export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// ============================================
// User Types
// ============================================

export type UserRole = 'admin' | 'manager' | 'viewer';

export interface User extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  department?: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  organization?: string;
  department?: string;
}

// ============================================
// Project Types
// ============================================

export type ProjectStatus = 'draft' | 'active' | 'completed' | 'suspended';
export type ProjectType = 'intervention' | 'research' | 'assessment' | 'monitoring';

export interface ProjectBudget {
  total: number;
  currency: string;
  spent: number;
}

export interface ProjectGoals {
  short_term: string[];
  long_term: string[];
}

export interface Project extends BaseEntity {
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  location: string;
  targetGroups: string[];
  budget: ProjectBudget;
  goals: ProjectGoals;
  tags: string[];
  owner: string | User;
  team: string[] | User[];
}

export interface ProjectStatistics {
  totalBeneficiaries: number;
  totalActivities: number;
  totalSurveys: number;
  completionRate: number;
  budgetUtilization: number;
  impactScore: number;
}

export interface CreateProjectData {
  name: string;
  description: string;
  type: ProjectType;
  status?: ProjectStatus;
  startDate: string;
  endDate: string;
  location: string;
  targetGroups: string[];
  budget: ProjectBudget;
  goals: ProjectGoals;
  tags?: string[];
}

// ============================================
// Survey Types
// ============================================

export type SurveyStatus = 'draft' | 'active' | 'closed' | 'archived';
export type SurveyType = 'pre_evaluation' | 'post_evaluation' | 'needs_assessment' | 'satisfaction' | 'feedback';

export type QuestionType =
  | 'rating'
  | 'multiple_choice'
  | 'single_choice'
  | 'textarea'
  | 'text'
  | 'scale'
  | 'yes_no'
  | 'date'
  | 'number';

export interface RatingConfig {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  step: number;
}

export interface QuestionValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  errorMessage?: string;
}

export interface SurveySettings {
  showProgressBar: boolean;
  randomizeQuestions: boolean;
  requiredCompletion: boolean;
  language: 'ar' | 'en';
}

export interface Survey extends BaseEntity {
  title: string;
  description: string;
  type: SurveyType;
  status: SurveyStatus;
  project: string | Project;
  startDate: string;
  endDate: string;
  isAnonymous: boolean;
  allowMultipleResponses: boolean;
  welcomeMessage?: string;
  thankYouMessage?: string;
  targetResponses: number;
  currentResponses: number;
  tags: string[];
  settings: SurveySettings;
  questions?: Question[];
}

export interface Question extends BaseEntity {
  survey: string;
  questionText: string;
  type: QuestionType;
  order: number;
  isRequired: boolean;
  description?: string;
  placeholder?: string;
  options?: string[];
  ratingConfig?: RatingConfig;
  validation?: QuestionValidation;
  category?: string;
  conditionalLogic?: ConditionalLogic;
}

export interface ConditionalLogic {
  dependsOn: string;
  showWhen: {
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: string | number | boolean;
  };
}

export interface CreateSurveyData {
  title: string;
  description: string;
  type: SurveyType;
  project: string;
  startDate: string;
  endDate: string;
  isAnonymous?: boolean;
  allowMultipleResponses?: boolean;
  welcomeMessage?: string;
  thankYouMessage?: string;
  targetResponses?: number;
  tags?: string[];
  settings?: Partial<SurveySettings>;
}

export interface CreateQuestionData {
  survey: string;
  questionText: string;
  type: QuestionType;
  order: number;
  isRequired?: boolean;
  description?: string;
  placeholder?: string;
  options?: string[];
  ratingConfig?: RatingConfig;
  validation?: QuestionValidation;
  category?: string;
}

// ============================================
// Survey Response Types
// ============================================

export type AnswerValueType = 'text' | 'number' | 'boolean' | 'array';

export interface Answer {
  question: string;
  valueType: AnswerValueType;
  textValue?: string;
  numberValue?: number;
  booleanValue?: boolean;
  arrayValue?: string[];
  timeSpent?: number;
}

export interface SurveyResponse extends BaseEntity {
  survey: string | Survey;
  respondent?: string | User;
  answers: Answer[];
  status: 'draft' | 'submitted';
  completionTime?: number;
  language: 'ar' | 'en';
  metadata?: {
    deviceType?: string;
    browser?: string;
    ipAddress?: string;
  };
}

export interface SubmitResponseData {
  survey: string;
  answers: Answer[];
  language?: 'ar' | 'en';
  metadata?: {
    deviceType?: string;
    browser?: string;
  };
}

export interface SurveyAnalytics {
  totalResponses: number;
  completionRate: number;
  averageCompletionTime: number;
  responsesByDate: { date: string; count: number }[];
  questionAnalytics: QuestionAnalytics[];
}

export interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  type: QuestionType;
  totalAnswers: number;
  distribution?: { value: string; count: number; percentage: number }[];
  average?: number;
  median?: number;
}

// ============================================
// Analysis Types
// ============================================

export interface SentimentResult {
  overall: 'positive' | 'negative' | 'neutral';
  score: number;
  breakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface TopicResult {
  topic: string;
  frequency: number;
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface TextInsight {
  category: string;
  insight: string;
  confidence: number;
  examples: string[];
}

export interface AnalysisResult extends BaseEntity {
  project: string;
  survey?: string;
  analysisType: 'text_analysis' | 'impact_evaluation' | 'needs_assessment' | 'comprehensive';
  sentiment?: SentimentResult;
  topics?: TopicResult[];
  insights?: TextInsight[];
  recommendations?: string[];
  impactScore?: number;
  summary?: string;
}

export interface ImpactEvaluation {
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
  improvement: {
    knowledge: number;
    confidence: number;
    skill: number;
    overall: number;
  };
}

// ============================================
// Indicator Types
// ============================================

export type IndicatorCategory = 'output' | 'outcome' | 'impact';

export interface Indicator extends BaseEntity {
  name: string;
  description: string;
  category: IndicatorCategory;
  project: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  history: { date: string; value: number }[];
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardKPIs {
  totalProjects: number;
  activeProjects: number;
  totalBeneficiaries: number;
  totalSurveys: number;
  averageImpactScore: number;
  completionRate: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }[];
}
