import apiClient from '@/lib/axios';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '@/types';

export const authApi = {
  /**
   * Login user
   * POST /auth/login
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  /**
   * Register new user
   * POST /auth/register
   */
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', userData);
    return data;
  },

  /**
   * Get current user profile
   * GET /auth/profile
   */
  getProfile: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/profile');
    return data;
  },

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  refreshToken: async (refreshToken: string): Promise<{ access_token: string }> => {
    const { data } = await apiClient.post<{ access_token: string }>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return data;
  },

  /**
   * Logout user (clear tokens)
   */
  logout: async (): Promise<void> => {
    // Backend may have a logout endpoint
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    }
  },

  /**
   * Forgot password
   * POST /auth/forgot-password
   */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
    return data;
  },

  /**
   * Reset password
   * POST /auth/reset-password
   */
  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>('/auth/reset-password', {
      token,
      password,
    });
    return data;
  },
};
