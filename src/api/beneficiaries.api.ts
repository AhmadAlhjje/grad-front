import apiClient from '@/lib/axios';
import type { Project } from '@/types';

// Response wrapper type from backend
interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message: string;
}

export interface Beneficiary {
  _id: string;
  project: string | Project;
  name: string;
  beneficiaryType: 'person' | 'area' | 'group';
  city?: string;
  region?: string;
  populationSize?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBeneficiaryData {
  project: string;
  name: string;
  beneficiaryType: 'person' | 'area' | 'group';
  city?: string;
  region?: string;
  populationSize?: number;
  notes?: string;
}

export interface UpdateBeneficiaryData extends Partial<CreateBeneficiaryData> {}

export interface BeneficiariesListParams {
  projectId?: string;
  beneficiaryType?: string;
  city?: string;
  region?: string;
}

export interface BeneficiaryTypeStats {
  count: number;
  totalPopulation: number;
}

export interface BeneficiaryStatistics {
  total: number;
  byType: {
    person?: BeneficiaryTypeStats;
    area?: BeneficiaryTypeStats;
    group?: BeneficiaryTypeStats;
  };
}

export const beneficiariesApi = {
  /**
   * Create new beneficiary
   * POST /beneficiaries
   */
  create: async (beneficiaryData: CreateBeneficiaryData): Promise<Beneficiary> => {
    const { data } = await apiClient.post<ApiResponse<Beneficiary> | Beneficiary>('/beneficiaries', beneficiaryData);
    if ('data' in data && 'statusCode' in data) {
      return data.data;
    }
    return data as Beneficiary;
  },

  /**
   * Get all beneficiaries
   * GET /beneficiaries
   */
  getAll: async (params?: BeneficiariesListParams): Promise<Beneficiary[]> => {
    const { data } = await apiClient.get<ApiResponse<Beneficiary[]> | Beneficiary[]>('/beneficiaries', { params });
    if ('data' in data && 'statusCode' in data) {
      return data.data;
    }
    return data as Beneficiary[];
  },

  /**
   * Get beneficiaries statistics
   * GET /beneficiaries/statistics
   */
  getStatistics: async (projectId?: string): Promise<BeneficiaryStatistics> => {
    const { data } = await apiClient.get<ApiResponse<BeneficiaryStatistics> | BeneficiaryStatistics>('/beneficiaries/statistics', {
      params: projectId ? { projectId } : undefined,
    });
    if ('data' in data && 'statusCode' in data) {
      return data.data;
    }
    return data as BeneficiaryStatistics;
  },

  /**
   * Get beneficiaries by project
   * GET /beneficiaries/project/:projectId
   */
  getByProject: async (projectId: string): Promise<Beneficiary[]> => {
    const { data } = await apiClient.get<ApiResponse<Beneficiary[]> | Beneficiary[]>(`/beneficiaries/project/${projectId}`);
    if ('data' in data && 'statusCode' in data) {
      return data.data;
    }
    return data as Beneficiary[];
  },

  /**
   * Get beneficiaries by type
   * GET /beneficiaries/type/:type
   */
  getByType: async (
    type: string,
    projectId?: string
  ): Promise<Beneficiary[]> => {
    const { data } = await apiClient.get<ApiResponse<Beneficiary[]> | Beneficiary[]>(`/beneficiaries/type/${type}`, {
      params: projectId ? { projectId } : undefined,
    });
    if ('data' in data && 'statusCode' in data) {
      return data.data;
    }
    return data as Beneficiary[];
  },

  /**
   * Get beneficiaries by location
   * GET /beneficiaries/location
   */
  getByLocation: async (city?: string, region?: string): Promise<Beneficiary[]> => {
    const { data } = await apiClient.get<ApiResponse<Beneficiary[]> | Beneficiary[]>('/beneficiaries/location', {
      params: { city, region },
    });
    if ('data' in data && 'statusCode' in data) {
      return data.data;
    }
    return data as Beneficiary[];
  },

  /**
   * Get beneficiaries count
   * GET /beneficiaries/count
   */
  getCount: async (projectId?: string): Promise<{ count: number }> => {
    const { data } = await apiClient.get<ApiResponse<{ count: number }> | { count: number }>('/beneficiaries/count', {
      params: projectId ? { projectId } : undefined,
    });
    if ('data' in data && 'statusCode' in data) {
      return data.data;
    }
    return data as { count: number };
  },

  /**
   * Get beneficiary by ID
   * GET /beneficiaries/:id
   */
  getById: async (id: string): Promise<Beneficiary> => {
    const { data } = await apiClient.get<ApiResponse<Beneficiary> | Beneficiary>(`/beneficiaries/${id}`);
    if ('data' in data && 'statusCode' in data) {
      return data.data;
    }
    return data as Beneficiary;
  },

  /**
   * Update beneficiary
   * PATCH /beneficiaries/:id
   */
  update: async (id: string, beneficiaryData: UpdateBeneficiaryData): Promise<Beneficiary> => {
    const { data } = await apiClient.patch<ApiResponse<Beneficiary> | Beneficiary>(`/beneficiaries/${id}`, beneficiaryData);
    if ('data' in data && 'statusCode' in data) {
      return data.data;
    }
    return data as Beneficiary;
  },

  /**
   * Delete beneficiary
   * DELETE /beneficiaries/:id
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/beneficiaries/${id}`);
  },
};
