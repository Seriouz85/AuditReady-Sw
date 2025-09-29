import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { mockFetch, createMockSupabaseResponse, createMockAuthUser } from '@/test-utils';

// Mock the auth context and supabase
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    }))
  }
}));

// Import components after mocking
import App from '@/App';
import { useAuth } from '@/contexts/AuthContext';

describe('Authentication Flow Integration Tests', () => {
  let queryClient: QueryClient;
  let mockUseAuth: any;

  const mockUser = createMockAuthUser({
    email: 'demo@auditready.com',
    user_metadata: { full_name: 'Demo User' }
  });

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: 0, gcTime: 0 },
        mutations: { retry: false }
      }
    });

    mockUseAuth = vi.mocked(useAuth);
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
    vi.restoreAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  describe('Demo Account Login Flow', () => {
    it('should allow demo login and redirect to dashboard', async () => {
      // Mock unauthenticated state initially
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signIn: vi.fn().mockResolvedValue({ user: mockUser, error: null }),
        signOut: vi.fn(),
        signUp: vi.fn()
      });

      renderWithProviders(<App />);

      // Should show login page initially
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();

      // Fill in demo credentials
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await fireEvent.change(emailInput, { target: { value: 'demo@auditready.com' } });
      await fireEvent.change(passwordInput, { target: { value: 'demo123' } });

      // Submit login form
      const loginButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(loginButton);

      // Wait for authentication to complete
      await waitFor(() => {
        expect(mockUseAuth().signIn).toHaveBeenCalledWith(
          'demo@auditready.com',
          'demo123'
        );
      });
    });

    it('should handle invalid login credentials', async () => {
      const mockSignIn = vi.fn().mockResolvedValue({
        user: null,
        error: { message: 'Invalid login credentials' }
      });

      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signIn: mockSignIn,
        signOut: vi.fn(),
        signUp: vi.fn()
      });

      renderWithProviders(<App />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await fireEvent.change(emailInput, { target: { value: 'invalid@email.com' } });
      await fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

      const loginButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during authentication', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn()
      });

      renderWithProviders(<App />);

      // Should show loading spinner or similar
      expect(screen.getByTestId('loading-spinner') || 
             screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('User Session Management', () => {
    it('should maintain user session across page refreshes', async () => {
      // Simulate existing user session
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn()
      });

      renderWithProviders(<App />);

      // Should go directly to dashboard without login
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i) || 
               screen.getByText(/welcome/i)).toBeInTheDocument();
      });
    });

    it('should handle session expiration gracefully', async () => {
      const mockSignOut = vi.fn().mockResolvedValue({ error: null });

      // Start with authenticated user
      mockUseAuth.mockReturnValueOnce({
        user: mockUser,
        loading: false,
        signIn: vi.fn(),
        signOut: mockSignOut,
        signUp: vi.fn()
      });

      const { rerender } = renderWithProviders(<App />);

      // Simulate session expiration
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signIn: vi.fn(),
        signOut: mockSignOut,
        signUp: vi.fn()
      });

      rerender(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      );

      // Should redirect to login
      await waitFor(() => {
        expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      });
    });

    it('should handle logout functionality', async () => {
      const mockSignOut = vi.fn().mockResolvedValue({ error: null });

      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        signIn: vi.fn(),
        signOut: mockSignOut,
        signUp: vi.fn()
      });

      renderWithProviders(<App />);

      // Find and click logout button
      const logoutButton = screen.getByRole('button', { name: /logout/i }) ||
                          screen.getByText(/sign out/i);
      
      if (logoutButton) {
        fireEvent.click(logoutButton);

        await waitFor(() => {
          expect(mockSignOut).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Route Protection', () => {
    it('should redirect unauthenticated users to login', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn()
      });

      // Try to access protected route directly
      window.history.pushState({}, '', '/dashboard');
      
      renderWithProviders(<App />);

      // Should redirect to login
      await waitFor(() => {
        expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      });
    });

    it('should allow authenticated users to access protected routes', async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn()
      });

      window.history.pushState({}, '', '/dashboard');
      
      renderWithProviders(<App />);

      // Should access dashboard
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i) || 
               screen.getByText(/welcome/i)).toBeInTheDocument();
      });
    });

    it('should handle admin route protection', async () => {
      const adminUser = createMockAuthUser({
        email: 'admin@auditready.com',
        user_metadata: { role: 'admin' }
      });

      mockUseAuth.mockReturnValue({
        user: adminUser,
        loading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn()
      });

      window.history.pushState({}, '', '/admin');
      
      renderWithProviders(<App />);

      // Admin user should access admin routes
      await waitFor(() => {
        expect(screen.getByText(/admin/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during authentication', async () => {
      const mockSignIn = vi.fn().mockRejectedValue(
        new Error('Network error')
      );

      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signIn: mockSignIn,
        signOut: vi.fn(),
        signUp: vi.fn()
      });

      renderWithProviders(<App />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await fireEvent.change(emailInput, { target: { value: 'demo@auditready.com' } });
      await fireEvent.change(passwordInput, { target: { value: 'demo123' } });

      const loginButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i) ||
               screen.getByText(/connection/i)).toBeInTheDocument();
      });
    });

    it('should recover from authentication errors', async () => {
      const mockSignIn = vi.fn()
        .mockRejectedValueOnce(new Error('Server error'))
        .mockResolvedValueOnce({ user: mockUser, error: null });

      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signIn: mockSignIn,
        signOut: vi.fn(),
        signUp: vi.fn()
      });

      renderWithProviders(<App />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });
      
      // First attempt fails
      await fireEvent.change(emailInput, { target: { value: 'demo@auditready.com' } });
      await fireEvent.change(passwordInput, { target: { value: 'demo123' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });

      // Second attempt succeeds
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('User Experience', () => {
    it('should provide helpful validation messages', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn()
      });

      renderWithProviders(<App />);

      // Try to submit without email
      const loginButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i) ||
               screen.getByText(/please enter/i)).toBeInTheDocument();
      });
    });

    it('should remember form state during errors', async () => {
      const mockSignIn = vi.fn().mockResolvedValue({
        user: null,
        error: { message: 'Invalid credentials' }
      });

      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signIn: mockSignIn,
        signOut: vi.fn(),
        signUp: vi.fn()
      });

      renderWithProviders(<App />);

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      
      await fireEvent.change(emailInput, { target: { value: 'demo@auditready.com' } });
      await fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });

      const loginButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      // Form should retain email value
      expect(emailInput.value).toBe('demo@auditready.com');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn()
      });

      renderWithProviders(<App />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      // Should be able to tab through form elements
      emailInput.focus();
      expect(document.activeElement).toBe(emailInput);

      fireEvent.keyDown(emailInput, { key: 'Tab' });
      expect(document.activeElement).toBe(passwordInput);

      fireEvent.keyDown(passwordInput, { key: 'Tab' });
      expect(document.activeElement).toBe(loginButton);
    });

    it('should have proper ARIA labels and descriptions', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn()
      });

      renderWithProviders(<App />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Should have proper labels
      expect(emailInput).toHaveAccessibleName();
      expect(passwordInput).toHaveAccessibleName();
    });
  });
});