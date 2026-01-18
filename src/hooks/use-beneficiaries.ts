'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  beneficiariesApi,
  type BeneficiariesListParams,
  type CreateBeneficiaryData,
  type UpdateBeneficiaryData,
} from '@/api';
import { queryKeys } from '@/lib/query-client';
import { getErrorMessage } from '@/lib/axios';
import { notify } from '@/store/ui.store';

export function useBeneficiaries(params?: BeneficiariesListParams) {
  return useQuery({
    queryKey: queryKeys.beneficiaries?.list?.(params as Record<string, unknown>) || [
      'beneficiaries',
      params,
    ],
    queryFn: () => beneficiariesApi.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useBeneficiariesStatistics(projectId?: string) {
  return useQuery({
    queryKey: projectId
      ? ['beneficiaries', 'statistics', projectId]
      : ['beneficiaries', 'statistics'],
    queryFn: () => beneficiariesApi.getStatistics(projectId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useBeneficiariesByProject(projectId: string) {
  return useQuery({
    queryKey: ['beneficiaries', 'project', projectId],
    queryFn: () => beneficiariesApi.getByProject(projectId),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useBeneficiary(id: string) {
  return useQuery({
    queryKey: ['beneficiaries', 'detail', id],
    queryFn: () => beneficiariesApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBeneficiariesCount(projectId?: string) {
  return useQuery({
    queryKey: projectId ? ['beneficiaries', 'count', projectId] : ['beneficiaries', 'count'],
    queryFn: () => beneficiariesApi.getCount(projectId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateBeneficiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBeneficiaryData) => beneficiariesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      notify.success('تم إضافة المستفيد بنجاح');
    },
    onError: (error) => {
      notify.error('فشل إضافة المستفيد', getErrorMessage(error));
    },
  });
}

export function useUpdateBeneficiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBeneficiaryData }) =>
      beneficiariesApi.update(id, data),
    onSuccess: (beneficiary) => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      queryClient.setQueryData(['beneficiaries', 'detail', beneficiary._id], beneficiary);
      notify.success('تم تحديث المستفيد بنجاح');
    },
    onError: (error) => {
      notify.error('فشل تحديث المستفيد', getErrorMessage(error));
    },
  });
}

export function useDeleteBeneficiary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => beneficiariesApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      queryClient.removeQueries({ queryKey: ['beneficiaries', 'detail', id] });
      notify.success('تم حذف المستفيد بنجاح');
    },
    onError: (error) => {
      notify.error('فشل حذف المستفيد', getErrorMessage(error));
    },
  });
}
