import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { apiClient } from '@/lib/api/client';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

// Mock supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'mock-token' } }
      }),
    },
  },
}));

// Mock toast
vi.mock('@/utils/toast', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('ApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock axios create
    mockedAxios.create = vi.fn().mockReturnValue({
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('creates axios instance with correct config', () => {
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: expect.stringContaining('/functions/v1'),
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('configures request and response interceptors', () => {
    const mockInstance = {
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    };

    mockedAxios.create = vi.fn().mockReturnValue(mockInstance);

    // Import the client after mocking to trigger constructor
    require('@/lib/api/client');

    expect(mockInstance.interceptors.request.use).toHaveBeenCalled();
    expect(mockInstance.interceptors.response.use).toHaveBeenCalled();
  });

  describe('HTTP methods', () => {
    let mockAxiosInstance: any;

    beforeEach(() => {
      mockAxiosInstance = {
        get: vi.fn().mockResolvedValue({ data: { success: true } }),
        post: vi.fn().mockResolvedValue({ data: { id: 1 } }),
        put: vi.fn().mockResolvedValue({ data: { updated: true } }),
        patch: vi.fn().mockResolvedValue({ data: { patched: true } }),
        delete: vi.fn().mockResolvedValue({ data: null }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      };

      mockedAxios.create = vi.fn().mockReturnValue(mockAxiosInstance);
    });

    it('makes GET requests', async () => {
      const result = await apiClient.get('/test');
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', undefined);
      expect(result).toEqual({ success: true });
    });

    it('makes POST requests', async () => {
      const data = { name: 'test' };
      const result = await apiClient.post('/test', data);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', data, undefined);
      expect(result).toEqual({ id: 1 });
    });

    it('makes PUT requests', async () => {
      const data = { name: 'updated' };
      const result = await apiClient.put('/test/1', data);
      
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test/1', data, undefined);
      expect(result).toEqual({ updated: true });
    });

    it('makes PATCH requests', async () => {
      const data = { name: 'patched' };
      const result = await apiClient.patch('/test/1', data);
      
      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/test/1', data, undefined);
      expect(result).toEqual({ patched: true });
    });

    it('makes DELETE requests', async () => {
      const result = await apiClient.delete('/test/1');
      
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test/1', undefined);
      expect(result).toBeNull();
    });
  });

  describe('specialized methods', () => {
    let mockAxiosInstance: any;

    beforeEach(() => {
      mockAxiosInstance = {
        post: vi.fn().mockResolvedValue({ data: { result: 'success' } }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      };

      mockedAxios.create = vi.fn().mockReturnValue(mockAxiosInstance);
    });

    it('calls Edge Functions', async () => {
      const functionName = 'my-function';
      const data = { input: 'test' };
      
      const result = await apiClient.callFunction(functionName, data);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(`/${functionName}`, data);
      expect(result).toEqual({ result: 'success' });
    });

    it('handles file uploads with progress', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const onProgress = vi.fn();
      
      await apiClient.uploadFile('/upload', mockFile, onProgress);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: expect.any(Function),
        })
      );
    });

    it('handles batch requests', async () => {
      const requests = [
        () => Promise.resolve('result1'),
        () => Promise.resolve('result2'),
        () => Promise.resolve('result3'),
      ];
      
      const results = await apiClient.batch(requests);
      
      expect(results).toEqual(['result1', 'result2', 'result3']);
    });
  });

  describe('error handling', () => {
    it('handles network errors gracefully', async () => {
      const mockAxiosInstance = {
        get: vi.fn().mockRejectedValue(new Error('Network Error')),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      };

      mockedAxios.create = vi.fn().mockReturnValue(mockAxiosInstance);

      await expect(apiClient.get('/test')).rejects.toThrow('Network Error');
    });
  });
});