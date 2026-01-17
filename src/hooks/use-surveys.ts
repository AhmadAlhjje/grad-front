'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  surveysApi,
  type SurveysListParams,
  type UpdateSurveyData,
  type UpdateQuestionData,
} from '@/api';
import { queryKeys } from '@/lib/query-client';
import { getErrorMessage } from '@/lib/axios';
import { notify } from '@/store/ui.store';
import type { CreateSurveyData, CreateQuestionData } from '@/types';

// ============================================
// Survey Hooks
// ============================================

export function useSurveys(params?: SurveysListParams) {
  return useQuery({
    queryKey: queryKeys.surveys.list((params || {}) as Record<string, unknown>),
    queryFn: () => surveysApi.getAll(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useSurvey(id: string) {
  return useQuery({
    queryKey: queryKeys.surveys.detail(id),
    queryFn: () => surveysApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSurveyData) => surveysApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.surveys.all });
      notify.success('تم إنشاء الاستبيان بنجاح');
    },
    onError: (error) => {
      notify.error('فشل إنشاء الاستبيان', getErrorMessage(error));
    },
  });
}

export function useUpdateSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSurveyData }) =>
      surveysApi.update(id, data),
    onSuccess: (survey) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.surveys.all });
      queryClient.setQueryData(queryKeys.surveys.detail(survey._id), survey);
      notify.success('تم تحديث الاستبيان بنجاح');
    },
    onError: (error) => {
      notify.error('فشل تحديث الاستبيان', getErrorMessage(error));
    },
  });
}

export function useDeleteSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => surveysApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.surveys.all });
      queryClient.removeQueries({ queryKey: queryKeys.surveys.detail(id) });
      notify.success('تم حذف الاستبيان بنجاح');
    },
    onError: (error) => {
      notify.error('فشل حذف الاستبيان', getErrorMessage(error));
    },
  });
}

// ============================================
// Questions Hooks
// ============================================

export function useSurveyQuestions(surveyId: string) {
  return useQuery({
    queryKey: queryKeys.surveys.questions(surveyId),
    queryFn: () => surveysApi.getQuestions(surveyId),
    enabled: !!surveyId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuestionData) => surveysApi.addQuestion(data),
    onSuccess: (question) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.surveys.questions(question.survey),
      });
      notify.success('تمت إضافة السؤال بنجاح');
    },
    onError: (error) => {
      notify.error('فشل إضافة السؤال', getErrorMessage(error));
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      surveyId,
    }: {
      id: string;
      data: UpdateQuestionData;
      surveyId: string;
    }) => surveysApi.updateQuestion(id, data),
    onSuccess: (_, { surveyId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.surveys.questions(surveyId),
      });
      notify.success('تم تحديث السؤال بنجاح');
    },
    onError: (error) => {
      notify.error('فشل تحديث السؤال', getErrorMessage(error));
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, surveyId }: { id: string; surveyId: string }) =>
      surveysApi.deleteQuestion(id),
    onSuccess: (_, { surveyId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.surveys.questions(surveyId),
      });
      notify.success('تم حذف السؤال بنجاح');
    },
    onError: (error) => {
      notify.error('فشل حذف السؤال', getErrorMessage(error));
    },
  });
}

export function useReorderQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ surveyId, questionIds }: { surveyId: string; questionIds: string[] }) =>
      surveysApi.reorderQuestions(surveyId, questionIds),
    onSuccess: (_, { surveyId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.surveys.questions(surveyId),
      });
    },
    onError: (error) => {
      notify.error('فشل إعادة ترتيب الأسئلة', getErrorMessage(error));
    },
  });
}

// ============================================
// Analytics Hook
// ============================================

export function useSurveyAnalytics(surveyId: string) {
  return useQuery({
    queryKey: queryKeys.surveys.analytics(surveyId),
    queryFn: () => surveysApi.getAnalytics(surveyId),
    enabled: !!surveyId,
    staleTime: 5 * 60 * 1000,
  });
}
