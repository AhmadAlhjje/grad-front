import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import type { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;

  // Role checks
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isViewer: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setTokens: (accessToken, refreshToken) => {
        Cookies.set('access_token', accessToken, {
          expires: 1, // 1 day
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });

        if (refreshToken) {
          Cookies.set('refresh_token', refreshToken, {
            expires: 7, // 7 days
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
          });
        }
      },

      clearAuth: () => {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      hasRole: (role) => {
        const { user } = get();
        if (!user) return false;
        if (Array.isArray(role)) {
          return role.includes(user.role);
        }
        return user.role === role;
      },

      isAdmin: () => get().hasRole('admin'),
      isManager: () => get().hasRole(['admin', 'manager']),
      isViewer: () => get().hasRole(['admin', 'manager', 'viewer']),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
