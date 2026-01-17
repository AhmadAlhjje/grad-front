'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { useAuth } from '@/hooks';
import { Loading } from '@/components/ui';
import type { UserRole } from '@/types';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const { checkAuth } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      checkAuth();
    }
  }, [isAuthenticated, isLoading, checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Check role if required
  useEffect(() => {
    if (user && requiredRole) {
      const hasRole = Array.isArray(requiredRole)
        ? requiredRole.includes(user.role)
        : user.role === requiredRole;

      if (!hasRole) {
        router.push('/dashboard');
      }
    }
  }, [user, requiredRole, router]);

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
