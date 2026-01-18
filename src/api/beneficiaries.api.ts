import apiClient from '@/lib/axios';

export interface Beneficiary {
  _id: string;
  project: string;
  name: string;
  beneficiaryType: 'individual' | 'family' | 'organization' | 'community';
  email?: string;
  phone?: string;
  city?: string;
  region?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  educationLevel?: string;
  employmentStatus?: string;
  householdSize?: number;
  monthlyIncome?: number;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBeneficiaryData {
  project: string;
  name: string;
  beneficiaryType: 'individual' | 'family' | 'organization' | 'community';
  email?: string;
  phone?: string;
  city?: string;
  region?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  educationLevel?: string;
  employmentStatus?: string;
  householdSize?: number;
  monthlyIncome?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateBeneficiaryData extends Partial<CreateBeneficiaryData> {}

export interface BeneficiariesListParams {
  projectId?: string;
  beneficiaryType?: string;
  city?: string;
  region?: string;
}

export interface BeneficiaryStatistics {
  totalBeneficiaries: number;
  byType: {
    individual: number;
    family: number;
    organization: number;
    community: number;
  };
  byRegion: Record<string, number>;
  byCity: Record<string, number>;
  averageAge?: number;
  genderDistribution?: {
    male: number;
    female: number;
    other: number;
  };
}

export const beneficiariesApi = {
  /**
   * Create new beneficiary
   * POST /beneficiaries
   */
  create: async (beneficiaryData: CreateBeneficiaryData): Promise<Beneficiary> => {
    const { data } = await apiClient.post<Beneficiary>('/beneficiaries', beneficiaryData);
    return data;
  },

  /**
   * Get all beneficiaries
   * GET /beneficiaries
   */
  getAll: async (params?: BeneficiariesListParams): Promise<Beneficiary[]> => {
    const { data } = await apiClient.get<Beneficiary[]>('/beneficiaries', { params });
    return data;
  },

  /**
   * Get beneficiaries statistics
   * GET /beneficiaries/statistics
   */
  getStatistics: async (projectId?: string): Promise<BeneficiaryStatistics> => {
    const { data } = await apiClient.get<BeneficiaryStatistics>('/beneficiaries/statistics', {
      params: projectId ? { projectId } : undefined,
    });
    return data;
  },

  /**
   * Get beneficiaries by project
   * GET /beneficiaries/project/:projectId
   */
  getByProject: async (projectId: string): Promise<Beneficiary[]> => {
    const { data } = await apiClient.get<Beneficiary[]>(`/beneficiaries/project/${projectId}`);
    return data;
  },

  /**
   * Get beneficiaries by type
   * GET /beneficiaries/type/:type
   */
  getByType: async (
    type: string,
    projectId?: string
  ): Promise<Beneficiary[]> => {
    const { data } = await apiClient.get<Beneficiary[]>(`/beneficiaries/type/${type}`, {
      params: projectId ? { projectId } : undefined,
    });
    return data;
  },

  /**
   * Get beneficiaries by location
   * GET /beneficiaries/location
   */
  getByLocation: async (city?: string, region?: string): Promise<Beneficiary[]> => {
    const { data } = await apiClient.get<Beneficiary[]>('/beneficiaries/location', {
      params: { city, region },
    });
    return data;
  },

  /**
   * Get beneficiaries count
   * GET /beneficiaries/count
   */
  getCount: async (projectId?: string): Promise<{ count: number }> => {
    const { data } = await apiClient.get<{ count: number }>('/beneficiaries/count', {
      params: projectId ? { projectId } : undefined,
    });
    return data;
  },

  /**
   * Get beneficiary by ID
   * GET /beneficiaries/:id
   */
  getById: async (id: string): Promise<Beneficiary> => {
    const { data } = await apiClient.get<Beneficiary>(`/beneficiaries/${id}`);
    return data;
  },

  /**
   * Update beneficiary
   * PATCH /beneficiaries/:id
   */
  update: async (id: string, beneficiaryData: UpdateBeneficiaryData): Promise<Beneficiary> => {
    const { data } = await apiClient.patch<Beneficiary>(`/beneficiaries/${id}`, beneficiaryData);
    return data;
  },

  /**
   * Delete beneficiary
   * DELETE /beneficiaries/:id
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/beneficiaries/${id}`);
  },
};
