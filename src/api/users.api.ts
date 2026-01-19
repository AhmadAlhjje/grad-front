import apiClient from '@/lib/axios';
import type { User } from '@/types';

// Response types matching actual API
export interface UsersResponse {
  data: User[];
  total: number;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'viewer';
  phone?: string;
  organization?: string;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  organization?: string;
  department?: string;
  role?: 'admin' | 'manager' | 'viewer';
  status?: 'active' | 'inactive' | 'suspended';
}

export interface UsersListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export const usersApi = {
  /**
   * Get all users
   * GET /users
   * Returns array of users (axios interceptor unwraps data property)
   */
  getAll: async (params?: UsersListParams): Promise<UsersResponse> => {
    const { data } = await apiClient.get<User[]>('/users', { params });
    // data is already unwrapped by axios interceptor
    const users = Array.isArray(data) ? data : [];
    return {
      data: users,
      total: users.length,
    };
  },

  /**
   * Get user by ID
   * GET /users/:id
   * Returns single user (axios interceptor unwraps data property)
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
