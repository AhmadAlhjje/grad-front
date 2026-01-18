import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Debug: Log the API URL being used
console.log('[Axios Config] API_URL:', API_URL);
console.log('[Axios Config] NEXT_PUBLIC_API_URL env var:', process.env.NEXT_PUBLIC_API_URL);

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('access_token');

    // Debug: Log every outgoing request
    console.log('[Axios Request]', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
    });

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[Axios Request] Authorization header set');
    } else {
      console.warn('[Axios Request] No access token found in cookies');
    }
    return config;
  },
  (error) => {
    console.error('[Axios Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Extract data from the wrapper if it exists
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      console.log('[Axios Response] Unwrapping nested data structure');
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log error for debugging
    console.error('API Error:', {
      status: error.response?.status,
      message: error.message,
      url: originalRequest?.url,
      data: error.response?.data,
    });

    // Handle 401 Unauthorized - only try refresh once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token
      const refreshToken = Cookies.get('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          Cookies.set('access_token', access_token);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear tokens but DON'T redirect automatically
          // Let the component handle the error and show appropriate message
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          console.error('Token refresh failed:', refreshError);
        }
      } else {
        // No refresh token - clear access token
        Cookies.remove('access_token');
        console.warn('No refresh token available');
      }
    }

    // Always reject with the error so components can handle it
    return Promise.reject(error);
  }
);

// Helper function to extract error message
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message: string; errors?: Record<string, string[]> }>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.response?.data?.errors) {
      const errors = Object.values(axiosError.response.data.errors).flat();
      return errors.join(', ');
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'حدث خطأ غير متوقع';
};

export default apiClient;
