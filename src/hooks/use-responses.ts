'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { responsesApi, type ResponsesListParams } from '@/api';
import { queryKeys } from '@/lib/query-client';
import { getErrorMessage } from '@/lib/axios';
import { notify } from '@/store/ui.store';
import type { SubmitResponseData } from '@/types';

export function useSurveyResponses(surveyId: string, params?: ResponsesListParams) {
  return useQuery({
    queryKey: queryKeys.responses.bySurvey(surveyId),
    queryFn: () => responsesApi.getBySurvey(surveyId, params),
    enabled: !!surveyId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useResponse(id: string) {
  return useQuery({
    queryKey: queryKeys.responses.detail(id),
    queryFn: () => responsesApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubmitResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitResponseData) => responsesApi.submit(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.responses.bySurvey(result.response.survey as string),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.surveys.analytics(result.response.survey as string),
      });
      notify.success('تم إرسال الرد بنجاح');
    },
    onError: (error) => {
      notify.error('فشل إرسال الرد', getErrorMessage(error));
    },
  });
}

export function useSaveDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitResponseData) => responsesApi.saveDraft(data),
    onSuccess: () => {
      notify.success('تم حفظ المسودة بنجاح');
    },
    onError: (error) => {
      notify.error('فشل حفظ المسودة', getErrorMessage(error));
    },
  });
}

export function useUpdateDraft() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SubmitResponseData> }) =>
      responsesApi.updateDraft(id, data),
    onSuccess: () => {
      notify.success('تم تحديث المسودة بنجاح');
    },
    onError: (error) => {
      notify.error('فشل تحديث المسودة', getErrorMessage(error));
    },
  });
}

export function useDeleteResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, surveyId }: { id: string; surveyId: string }) => responsesApi.delete(id),
    onSuccess: (_, { surveyId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.responses.bySurvey(surveyId),
      });
      notify.success('تم حذف الرد بنجاح');
    },
    onError: (error) => {
      notify.error('فشل حذف الرد', getErrorMessage(error));
    },
  });
}

export function useMyDrafts() {
  return useQuery({
    queryKey: ['my-drafts'],
    queryFn: responsesApi.getMyDrafts,
    staleTime: 2 * 60 * 1000,
  });
}
