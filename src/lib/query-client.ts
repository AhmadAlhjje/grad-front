import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: false, // Disable automatic retry to see errors
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      throwOnError: false, // Don't throw errors, handle them in components
    },
    mutations: {
      retry: false, // Disable automatic retry for mutations
      throwOnError: false,
    },
  },
});

// Query keys factory for type-safe query keys
export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    profile: () => [...queryKeys.auth.all, 'profile'] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  // Projects
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.projects.lists(), filters] as const,
    myProjects: () => [...queryKeys.projects.all, 'my-projects'] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
    statistics: (id: string) => [...queryKeys.projects.all, 'statistics', id] as const,
  },

  // Surveys
  surveys: {
    all: ['surveys'] as const,
    lists: () => [...queryKeys.surveys.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.surveys.lists(), filters] as const,
    details: () => [...queryKeys.surveys.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.surveys.details(), id] as const,
    questions: (surveyId: string) => [...queryKeys.surveys.all, 'questions', surveyId] as const,
    analytics: (surveyId: string) => [...queryKeys.surveys.all, 'analytics', surveyId] as const,
    responses: (surveyId: string) => [...queryKeys.surveys.all, 'responses', surveyId] as const,
    response: (responseId: string) => [...queryKeys.surveys.all, 'response', responseId] as const,
  },

  // Survey Responses
  responses: {
    all: ['responses'] as const,
    bySurvey: (surveyId: string) => [...queryKeys.responses.all, 'survey', surveyId] as const,
    detail: (id: string) => [...queryKeys.responses.all, 'detail', id] as const,
  },

  // Analysis
  analysis: {
    all: ['analysis'] as const,
    byProject: (projectId: string) => [...queryKeys.analysis.all, 'project', projectId] as const,
  },

  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    kpis: () => [...queryKeys.dashboard.all, 'kpis'] as const,
    charts: () => [...queryKeys.dashboard.all, 'charts'] as const,
  },
} as const;
