import React, { ReactElement } from 'react';
import { render, RenderOptions, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { LanguageProvider } from '@/providers/LanguageProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { TooltipProvider } from '@/components/ui/tooltip';

// Create a test query client
const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  });
};

// All providers wrapper
interface AllProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

const AllProviders = ({ children, queryClient }: AllProvidersProps) => {
  const client = queryClient || createTestQueryClient();
  
  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <TooltipProvider>
                {children}
              </TooltipProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  withRouter?: boolean;
  withAuth?: boolean;
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    queryClient,
    withRouter = true,
    withAuth = true,
    ...renderOptions
  } = options;

  if (withRouter && withAuth) {
    return render(ui, {
      wrapper: ({ children }) => (
        <AllProviders queryClient={queryClient}>{children}</AllProviders>
      ),
      ...renderOptions,
    });
  }

  // Minimal wrapper for unit tests
  const MinimalWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient || createTestQueryClient()}>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </QueryClientProvider>
  );

  return render(ui, {
    wrapper: MinimalWrapper,
    ...renderOptions,
  });
};

// Helper to wait for loading states
export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

// Helper to find elements by test id
export const getByTestId = (testId: string) => screen.getByTestId(testId);
export const queryByTestId = (testId: string) => screen.queryByTestId(testId);
export const findByTestId = (testId: string) => screen.findByTestId(testId);

// Helper to check if element has class
export const hasClass = (element: Element, className: string) => {
  return element.classList.contains(className);
};

// Helper to simulate user interactions
export const userEvent = {
  click: (element: Element) => {
    const event = new MouseEvent('click', { bubbles: true });
    element.dispatchEvent(event);
  },
  type: (element: Element, text: string) => {
    const event = new Event('input', { bubbles: true });
    (element as HTMLInputElement).value = text;
    element.dispatchEvent(event);
  },
  submit: (form: Element) => {
    const event = new Event('submit', { bubbles: true });
    form.dispatchEvent(event);
  },
};

// Mock implementation helpers
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
  user_metadata: {
    name: 'Test User',
    first_name: 'Test',
    last_name: 'User',
  },
  app_metadata: {},
  role: 'authenticated',
  ...overrides,
});

export const createMockOrganization = (overrides = {}) => ({
  id: 'test-org-id',
  name: 'Test Organization',
  slug: 'test-org',
  industry: 'Technology',
  company_size: '11-50',
  subscription_tier: 'professional',
  settings: {},
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockFramework = (overrides = {}) => ({
  id: 'test-framework-id',
  name: 'Test Framework',
  version: '1.0',
  description: 'Test compliance framework',
  type: 'standard',
  is_active: true,
  organization_id: 'test-org-id',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockAssessment = (overrides = {}) => ({
  id: 'test-assessment-id',
  title: 'Test Assessment',
  description: 'Test assessment description',
  status: 'draft',
  organization_id: 'test-org-id',
  framework_id: 'test-framework-id',
  created_by: 'test-user-id',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };
export { createTestQueryClient };