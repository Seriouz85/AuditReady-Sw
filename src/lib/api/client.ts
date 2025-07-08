import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { supabase } from '@/lib/supabase';
import { toast } from '@/utils/toast';

interface ApiErrorResponse {
  error: string;
  message?: string;
  statusCode?: number;
  details?: any;
}

class ApiClient {
  private client: AxiosInstance;
  private supabaseUrl: string;

  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    
    this.client = axios.create({
      baseURL: `${this.supabaseUrl}/functions/v1`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Configure retry logic
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          (error.response?.status ? error.response.status >= 500 : false);
      },
      onRetry: (retryCount, error) => {
        console.log(`Retry attempt ${retryCount} for ${error.config?.url}`);
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Add auth token
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
        }

        // Add request ID for tracing
        config.headers['X-Request-ID'] = this.generateRequestId();

        // Add timestamp
        config.headers['X-Request-Timestamp'] = new Date().toISOString();

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log successful responses in development
        if (import.meta.env.DEV) {
          console.log(`API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          });
        }
        return response;
      },
      async (error: AxiosError<ApiErrorResponse>) => {
        // Handle different error scenarios
        if (error.response) {
          // Server responded with error status
          const { status, data } = error.response;
          
          switch (status) {
            case 401:
              // Unauthorized - redirect to login
              await supabase.auth.signOut();
              window.location.href = '/login';
              break;
            
            case 403:
              // Forbidden
              toast.error('You do not have permission to perform this action');
              break;
            
            case 404:
              // Not found
              if (import.meta.env.DEV) {
                console.error(`Resource not found: ${error.config?.url}`);
              }
              break;
            
            case 429:
              // Rate limited
              toast.error('Too many requests. Please try again later.');
              break;
            
            case 500:
            case 502:
            case 503:
            case 504:
              // Server errors
              toast.error('Server error. Please try again later.');
              break;
            
            default:
              // Other errors
              const errorMessage = data?.message || data?.error || 'An unexpected error occurred';
              toast.error(errorMessage);
          }

          // Log error details in development
          if (import.meta.env.DEV) {
            console.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
              status,
              data,
              headers: error.response.headers,
            });
          }
        } else if (error.request) {
          // Request made but no response received
          toast.error('Network error. Please check your connection.');
          console.error('Network error:', error.request);
        } else {
          // Error in request setup
          toast.error('Request failed. Please try again.');
          console.error('Request setup error:', error.message);
        }

        return Promise.reject(error);
      }
    );
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Supabase-specific methods
  async callFunction<T>(functionName: string, data?: any): Promise<T> {
    return this.post<T>(`/${functionName}`, data);
  }

  // File upload with progress
  async uploadFile(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  // Batch requests
  async batch<T>(requests: Array<() => Promise<any>>): Promise<T[]> {
    try {
      return await Promise.all(requests.map(req => req()));
    } catch (error) {
      console.error('Batch request failed:', error);
      throw error;
    }
  }

  // Cancel token support
  getCancelToken() {
    return axios.CancelToken.source();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types
export type { ApiErrorResponse };