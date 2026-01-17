'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import {
  analysisApi,
  type AnalyzeSurveyResponsesData,
  type NeedsTopicsData,
  type ImpactEvaluationData,
  type ComprehensiveAnalysisData,
} from '@/api';
import { queryKeys } from '@/lib/query-client';
import { getErrorMessage } from '@/lib/axios';
import { notify } from '@/store/ui.store';

export function useProjectAnalysis(projectId: string) {
  return useQuery({
    queryKey: queryKeys.analysis.byProject(projectId),
    queryFn: () => analysisApi.getProjectAnalysis(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAnalyzeSurveyResponses() {
  return useMutation({
    mutationFn: (data: AnalyzeSurveyResponsesData) => analysisApi.analyzeSurveyResponses(data),
    onSuccess: () => {
      notify.success('تم تحليل الردود بنجاح');
    },
    onError: (error) => {
      notify.error('فشل تحليل الردود', getErrorMessage(error));
    },
  });
}

export function useExtractNeedsTopics() {
  return useMutation({
    mutationFn: (data: NeedsTopicsData) => analysisApi.extractNeedsTopics(data),
    onSuccess: () => {
      notify.success('تم استخراج المواضيع بنجاح');
    },
    onError: (error) => {
      notify.error('فشل استخراج المواضيع', getErrorMessage(error));
    },
  });
}

export function useEvaluateImpact() {
  return useMutation({
    mutationFn: (data: ImpactEvaluationData) => analysisApi.evaluateImpact(data),
    onSuccess: () => {
      notify.success('تم تقييم الأثر بنجاح');
    },
    onError: (error) => {
      notify.error('فشل تقييم الأثر', getErrorMessage(error));
    },
  });
}

export function useComprehensiveAnalysis() {
  return useMutation({
    mutationFn: (data: ComprehensiveAnalysisData) => analysisApi.comprehensiveAnalysis(data),
    onSuccess: () => {
      notify.success('تم التحليل الشامل بنجاح');
    },
    onError: (error) => {
      notify.error('فشل التحليل الشامل', getErrorMessage(error));
    },
  });
}
