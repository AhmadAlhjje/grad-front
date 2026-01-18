'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/api';
import { useAuthStore } from '@/store';
import { queryKeys } from '@/lib/query-client';
import { getErrorMessage } from '@/lib/axios';
import { notify } from '@/store/ui.store';
import type { LoginCredentials, RegisterData } from '@/types';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, setUser, setTokens, clearAuth, setLoading } = useAuthStore();

  // Fetch current user profile
  const profileQuery = useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: async (data) => {
      console.log('[useAuth] Login response received:', {
        hasAccessToken: !!data.access_token,
        hasRefreshToken: !!data.refresh_token,
        hasUser: !!data.user,
        userEmail: data.user?.email,
      });

      setTokens(data.access_token, data.refresh_token);
      setUser(data.user);
      queryClient.setQueryData(queryKeys.auth.profile(), data.user);
      notify.success('تم تسجيل الدخول بنجاح');

      // Small delay to ensure cookies are set before navigation
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('[useAuth] About to navigate to dashboard');
      router.push('/dashboard');
    },
    onError: (error) => {
      console.error('[useAuth] Login error:', error);
      notify.error('فشل تسجيل الدخول', getErrorMessage(error));
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token);
      setUser(data.user);
      queryClient.setQueryData(queryKeys.auth.profile(), data.user);
      notify.success('تم إنشاء الحساب بنجاح');
      router.push('/dashboard');
    },
    onError: (error) => {
      notify.error('فشل إنشاء الحساب', getErrorMessage(error));
    },
  });

  // Logout
  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      queryClient.clear();
      router.push('/login');
    }
  };

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: () => {
      notify.success('تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني');
    },
    onError: (error) => {
      notify.error('فشل إرسال البريد الإلكتروني', getErrorMessage(error));
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.resetPassword(token, password),
    onSuccess: () => {
      notify.success('تم إعادة تعيين كلمة المرور بنجاح');
      router.push('/login');
    },
    onError: (error) => {
      notify.error('فشل إعادة تعيين كلمة المرور', getErrorMessage(error));
    },
  });

  // Check auth on mount
  const checkAuth = async () => {
    setLoading(true);
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
    } catch {
      clearAuth();
    }
  };

  return {
    user: profileQuery.data || user,
    isAuthenticated,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,

    // Mutations
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,

    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,

    logout,

    forgotPassword: forgotPasswordMutation.mutate,
    isSendingResetEmail: forgotPasswordMutation.isPending,

    resetPassword: resetPasswordMutation.mutate,
    isResettingPassword: resetPasswordMutation.isPending,

    checkAuth,
  };
}
