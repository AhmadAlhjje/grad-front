'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, type ProjectsListParams, type UpdateProjectData } from '@/api';
import { queryKeys } from '@/lib/query-client';
import { getErrorMessage } from '@/lib/axios';
import { notify } from '@/store/ui.store';
import type { CreateProjectData } from '@/types';

export function useProjects(params?: ProjectsListParams) {
  return useQuery({
    queryKey: queryKeys.projects.list((params || {}) as Record<string, unknown>),
    queryFn: () => projectsApi.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useMyProjects() {
  return useQuery({
    queryKey: queryKeys.projects.myProjects(),
    queryFn: projectsApi.getMyProjects,
    staleTime: 2 * 60 * 1000,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => projectsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProjectStatistics(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.statistics(id),
    queryFn: () => projectsApi.getStatistics(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectData) => projectsApi.create(data),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      notify.success('تم إنشاء المشروع بنجاح');
      return project;
    },
    onError: (error) => {
      notify.error('فشل إنشاء المشروع', getErrorMessage(error));
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectData }) =>
      projectsApi.update(id, data),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.setQueryData(queryKeys.projects.detail(project._id), project);
      notify.success('تم تحديث المشروع بنجاح');
    },
    onError: (error) => {
      notify.error('فشل تحديث المشروع', getErrorMessage(error));
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.removeQueries({ queryKey: queryKeys.projects.detail(id) });
      notify.success('تم حذف المشروع بنجاح');
    },
    onError: (error) => {
      notify.error('فشل حذف المشروع', getErrorMessage(error));
    },
  });
}

export function useAddTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      projectsApi.addTeamMember(projectId, userId),
    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.projects.detail(project._id), project);
      notify.success('تمت إضافة العضو بنجاح');
    },
    onError: (error) => {
      notify.error('فشل إضافة العضو', getErrorMessage(error));
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      projectsApi.removeTeamMember(projectId, userId),
    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.projects.detail(project._id), project);
      notify.success('تمت إزالة العضو بنجاح');
    },
    onError: (error) => {
      notify.error('فشل إزالة العضو', getErrorMessage(error));
    },
  });
}
