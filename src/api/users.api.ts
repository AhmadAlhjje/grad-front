import apiClient from '@/lib/axios';
import type { User, PaginatedResponse } from '@/types';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'viewer';
  phone?: string;
  organization?: string;
  department?: string;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  organization?: string;
  department?: string;
  role?: 'admin' | 'manager' | 'viewer';
  isActive?: boolean;
}

export interface UsersListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export const usersApi = {
  /**
   * Get all users
   * GET /users
   */
  getAll: async (params?: UsersListParams): Promise<PaginatedResponse<User>> => {
    const { data } = await apiClient.get<PaginatedResponse<User>>('/users', { params });
    return data;
  },

  /**
   * Get user by ID
   * GET /users/:id
   */
  getById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get<User>(`/users/${id}`);
    return data;
  },

  /**
   * Create new user (Admin only)
   * POST /users
   */
  create: async (userData: CreateUserData): Promise<User> => {
    const { data } = await apiClient.post<User>('/users', userData);
    return data;
  },

  /**
   * Update user
   * PATCH /users/:id
   */
  update: async (id: string, userData: UpdateUserData): Promise<User> => {
    const { data } = await apiClient.patch<User>(`/users/${id}`, userData);
    return data;
  },

  /**
   * Delete user
   * DELETE /users/:id
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
