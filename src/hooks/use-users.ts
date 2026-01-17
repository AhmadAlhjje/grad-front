'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, type UsersListParams, type CreateUserData, type UpdateUserData } from '@/api';
import { queryKeys } from '@/lib/query-client';
import { getErrorMessage } from '@/lib/axios';
import { notify } from '@/store/ui.store';

export function useUsers(params?: UsersListParams) {
  return useQuery({
    queryKey: queryKeys.users.list((params || {}) as Record<string, unknown>),
    queryFn: () => usersApi.getAll(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserData) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      notify.success('تم إنشاء المستخدم بنجاح');
    },
    onError: (error) => {
      notify.error('فشل إنشاء المستخدم', getErrorMessage(error));
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) => usersApi.update(id, data),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.setQueryData(queryKeys.users.detail(user._id), user);
      notify.success('تم تحديث المستخدم بنجاح');
    },
    onError: (error) => {
      notify.error('فشل تحديث المستخدم', getErrorMessage(error));
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(id) });
      notify.success('تم حذف المستخدم بنجاح');
    },
    onError: (error) => {
      notify.error('فشل حذف المستخدم', getErrorMessage(error));
    },
  });
}
