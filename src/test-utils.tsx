import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mock data for testing
export const mockUser = {
  id: 'test-user-id',
  email: 'demo@auditready.com',
  user_metadata: { 
    full_name: 'Test User',
    role: 'admin'
  },
  app_metadata: {
    organization_id: 'test-org-id'
  }
};

export const mockOrganization = {
  id: 'test-org-id',
  name: 'Test Organization',
  subscription_tier: 'premium',
  created_at: '2024-01-01T00:00:00Z',
  settings: {
    allow_ai_assistance: true,
    data_retention_days: 365
  }
};

export const mockAssessment = {
  id: 'test-assessment-id',
  title: 'Test Assessment',
  description: 'Test assessment description',
  status: 'in_progress' as const,
  framework: 'ISO27001',
  organization_id: 'test-org-id',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

export const mockRequirement = {
  id: 'test-requirement-id',
  identifier: 'A.5.1',
  title: 'Test Requirement',
  description: 'Test requirement description',
  framework: 'ISO27001',
  category: 'Information Security Policies',
  control_type: 'Organizational',
  maturity_level: 'basic',
  implementation_guidance: 'Test guidance'
};

// Create a custom render function that wraps with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Test utilities for common scenarios
export const createMockSupabaseResponse = <T>(data: T, error: any = null) => ({
  data,
  error,
  count: Array.isArray(data) ? data.length : data ? 1 : 0,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK'
});

export const createMockSupabaseQuery = () => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  gt: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lt: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  like: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  contains: vi.fn().mockReturnThis(),
  containedBy: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue(createMockSupabaseResponse(null)),
  maybeSingle: vi.fn().mockResolvedValue(createMockSupabaseResponse(null)),
});

export const createMockAuthUser = (overrides = {}) => ({
  ...mockUser,
  ...overrides
});

export const createMockOrganization = (overrides = {}) => ({
  ...mockOrganization,
  ...overrides
});

export const createMockAssessment = (overrides = {}) => ({
  ...mockAssessment,
  ...overrides
});

export const createMockRequirement = (overrides = {}) => ({
  ...mockRequirement,
  ...overrides
});

// Mock store helpers
export const createMockApplicationStore = (overrides = {}) => ({
  user: mockUser,
  organization: mockOrganization,
  isLoading: false,
  error: null,
  setUser: vi.fn(),
  setOrganization: vi.fn(),
  setError: vi.fn(),
  clearError: vi.fn(),
  reset: vi.fn(),
  ...overrides
});

// Form testing utilities
export const fillForm = async (
  getByLabelText: any,
  formData: Record<string, string>
) => {
  const { userEvent } = await import('@testing-library/user-event');
  const user = userEvent.setup();

  for (const [label, value] of Object.entries(formData)) {
    const field = getByLabelText(new RegExp(label, 'i'));
    await user.clear(field);
    await user.type(field, value);
  }
};

// File upload testing utilities
export const createMockFile = (
  name: string = 'test.pdf',
  type: string = 'application/pdf',
  content: string = 'test content'
) => {
  const file = new File([content], name, { type });
  return file;
};

// Error testing utilities
export const createMockError = (message: string, code?: string) => ({
  message,
  code,
  details: null,
  hint: null
});

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

// Accessibility testing utilities
export const checkAccessibility = async (container: HTMLElement) => {
  const { axe } = await import('axe-core');
  const results = await axe(container);
  return results;
};

// Wait utilities for async operations
export const waitForCondition = async (
  condition: () => boolean,
  timeout: number = 5000
) => {
  const start = Date.now();
  while (!condition() && Date.now() - start < timeout) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!condition()) {
    throw new Error('Condition not met within timeout');
  }
};

// Network mocking utilities
export const mockFetch = (response: any, status = 200) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(response),
    text: vi.fn().mockResolvedValue(JSON.stringify(response)),
    blob: vi.fn().mockResolvedValue(new Blob([JSON.stringify(response)])),
  });
};

// Console error suppression for expected errors in tests
export const suppressConsoleError = () => {
  const originalError = console.error;
  console.error = vi.fn();
  return () => {
    console.error = originalError;
  };
};

// Animation helpers for testing
export const mockAnimations = () => {
  // Mock requestAnimationFrame
  global.requestAnimationFrame = vi.fn((cb) => {
    setTimeout(cb, 16); // ~60fps
    return 1;
  });
  
  // Mock cancelAnimationFrame
  global.cancelAnimationFrame = vi.fn();
  
  // Mock CSS transitions
  const mockTransition = {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  
  Element.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
  });
};

// Date/time testing utilities
export const mockDate = (date: string | Date) => {
  const mockDateObj = new Date(date);
  vi.useFakeTimers();
  vi.setSystemTime(mockDateObj);
  return () => vi.useRealTimers();
};

// Test data generators
export const generateMockData = {
  users: (count: number) => Array.from({ length: count }, (_, i) => createMockAuthUser({ 
    id: `user-${i}`, 
    email: `user${i}@test.com` 
  })),
  
  organizations: (count: number) => Array.from({ length: count }, (_, i) => createMockOrganization({ 
    id: `org-${i}`, 
    name: `Organization ${i}` 
  })),
  
  assessments: (count: number) => Array.from({ length: count }, (_, i) => createMockAssessment({ 
    id: `assessment-${i}`, 
    title: `Assessment ${i}` 
  })),
  
  requirements: (count: number) => Array.from({ length: count }, (_, i) => createMockRequirement({ 
    id: `requirement-${i}`, 
    identifier: `A.${i}.1`,
    title: `Requirement ${i}` 
  }))
};

// Export everything
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Override the default render with our custom render
export { customRender as render };