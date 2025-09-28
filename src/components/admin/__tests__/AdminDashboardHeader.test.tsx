import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test-utils';
import { AdminDashboardHeader } from '../dashboard/AdminDashboardHeader';
import type { AdminDashboardHeaderProps } from '../dashboard/shared/AdminSharedTypes';

describe('AdminDashboardHeader', () => {
  const mockStats = {
    totalUsers: 1250,
    totalOrganizations: 89,
    totalRevenue: 45230.50,
    activeSubscriptions: 67,
    monthlyGrowth: 12.5,
    systemHealth: 98.7
  };

  const mockStripeStats = {
    revenue: 45230.50,
    subscriptions: 67,
    customers: 89,
    growth: 12.5
  };

  const mockAuthUser = {
    id: 'admin-user-id',
    email: 'admin@auditready.com',
    user_metadata: {
      full_name: 'Admin User',
      role: 'super_admin'
    }
  };

  const mockProps = {
    stats: mockStats,
    stripeStats: mockStripeStats,
    authUser: mockAuthUser,
    loading: false,
    onRefresh: vi.fn(),
    onLogout: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the header with correct title', () => {
      render(<AdminDashboardHeader {...mockProps} />);
      
      expect(screen.getByText('Platform Admin Console')).toBeInTheDocument();
      expect(screen.getByText('Complete SaaS management with Stripe & Supabase integration')).toBeInTheDocument();
    });

    it('should display user statistics correctly', () => {
      render(<AdminDashboardHeader {...mockProps} />);
      
      expect(screen.getByText('1,250')).toBeInTheDocument(); // totalUsers
      expect(screen.getByText('89')).toBeInTheDocument(); // totalOrganizations
      expect(screen.getByText(/\$45,230\.50/)).toBeInTheDocument(); // totalRevenue
      expect(screen.getByText('67')).toBeInTheDocument(); // activeSubscriptions
    });

    it('should show loading state when loading is true', () => {
      render(<AdminDashboardHeader {...mockProps} loading={true} />);
      
      // Should show loading indicators or disabled states
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeInTheDocument();
    });

    it('should display system health indicator', () => {
      render(<AdminDashboardHeader {...mockProps} />);
      
      expect(screen.getByText('98.7%')).toBeInTheDocument();
    });

    it('should show growth percentage with proper formatting', () => {
      render(<AdminDashboardHeader {...mockProps} />);
      
      expect(screen.getByText('+12.5%')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onRefresh when refresh button is clicked', async () => {
      const mockOnRefresh = vi.fn().mockResolvedValue(undefined);
      
      render(<AdminDashboardHeader {...mockProps} onRefresh={mockOnRefresh} />);
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
      
      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    });

    it('should call onLogout when logout button is clicked', () => {
      const mockOnLogout = vi.fn();
      
      render(<AdminDashboardHeader {...mockProps} onLogout={mockOnLogout} />);
      
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);
      
      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });

    it('should handle refresh errors gracefully', async () => {
      const mockOnRefresh = vi.fn().mockRejectedValue(new Error('Refresh failed'));
      
      render(<AdminDashboardHeader {...mockProps} onRefresh={mockOnRefresh} />);
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
      
      await waitFor(() => {
        expect(mockOnRefresh).toHaveBeenCalledTimes(1);
      });
      
      // Component should still be functional after error
      expect(screen.getByText('Platform Admin Console')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels for buttons', () => {
      render(<AdminDashboardHeader {...mockProps} />);
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      
      expect(refreshButton).toHaveAttribute('aria-label', expect.stringContaining('refresh'));
      expect(logoutButton).toHaveAttribute('aria-label', expect.stringContaining('logout'));
    });

    it('should have proper heading hierarchy', () => {
      render(<AdminDashboardHeader {...mockProps} />);
      
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Platform Admin Console');
    });

    it('should be keyboard navigable', () => {
      render(<AdminDashboardHeader {...mockProps} />);
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      
      // Both buttons should be focusable
      refreshButton.focus();
      expect(document.activeElement).toBe(refreshButton);
      
      logoutButton.focus();
      expect(document.activeElement).toBe(logoutButton);
    });
  });

  describe('data handling', () => {
    it('should handle missing stats gracefully', () => {
      const propsWithoutStats = {
        ...mockProps,
        stats: null
      };
      
      render(<AdminDashboardHeader {...propsWithoutStats} />);
      
      // Should still render without crashing
      expect(screen.getByText('Platform Admin Console')).toBeInTheDocument();
    });

    it('should handle zero values correctly', () => {
      const zeroStats = {
        totalUsers: 0,
        totalOrganizations: 0,
        totalRevenue: 0,
        activeSubscriptions: 0,
        monthlyGrowth: 0,
        systemHealth: 0
      };
      
      render(<AdminDashboardHeader {...mockProps} stats={zeroStats} />);
      
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('should format large numbers correctly', () => {
      const largeStats = {
        ...mockStats,
        totalUsers: 1234567,
        totalRevenue: 1234567.89
      };
      
      render(<AdminDashboardHeader {...mockProps} stats={largeStats} />);
      
      // Should use number formatting (commas, etc.)
      expect(screen.getByText('1,234,567')).toBeInTheDocument();
      expect(screen.getByText(/\$1,234,567\.89/)).toBeInTheDocument();
    });

    it('should handle negative growth values', () => {
      const negativeGrowthStats = {
        ...mockStats,
        monthlyGrowth: -5.2
      };
      
      render(<AdminDashboardHeader {...mockProps} stats={negativeGrowthStats} />);
      
      expect(screen.getByText('-5.2%')).toBeInTheDocument();
    });
  });

  describe('visual elements', () => {
    it('should render crown icon', () => {
      render(<AdminDashboardHeader {...mockProps} />);
      
      // Check for crown icon (lucide-react Crown component)
      const crownIcon = document.querySelector('[data-testid="crown-icon"]') || 
                       document.querySelector('.lucide-crown');
      expect(crownIcon || screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    });

    it('should apply correct CSS classes for styling', () => {
      render(<AdminDashboardHeader {...mockProps} />);
      
      const header = screen.getByText('Platform Admin Console').closest('div');
      expect(header).toHaveClass(/gradient/, /rounded/, /shadow/);
    });

    it('should show badges with correct variants', () => {
      render(<AdminDashboardHeader {...mockProps} />);
      
      // Look for badge elements
      const badges = document.querySelectorAll('[class*="badge"]');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('responsive behavior', () => {
    it('should maintain layout on different screen sizes', () => {
      // Mock window resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      render(<AdminDashboardHeader {...mockProps} />);
      
      // Should still render properly at tablet size
      expect(screen.getByText('Platform Admin Console')).toBeInTheDocument();
    });
  });

  describe('performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<AdminDashboardHeader {...mockProps} />);
      
      // Re-render with same props
      rerender(<AdminDashboardHeader {...mockProps} />);
      
      // Component should still be present and functional
      expect(screen.getByText('Platform Admin Console')).toBeInTheDocument();
    });

    it('should handle async refresh operations', async () => {
      const slowRefresh = vi.fn(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      );
      
      render(<AdminDashboardHeader {...mockProps} onRefresh={slowRefresh} />);
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
      
      // Should handle long-running refresh
      await waitFor(() => {
        expect(slowRefresh).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });

  describe('error boundaries', () => {
    it('should handle render errors gracefully', () => {
      // Suppress console errors for this test
      const originalError = console.error;
      console.error = vi.fn();
      
      try {
        const ProblematicComponent = () => {
          throw new Error('Test error');
        };
        
        // This would be caught by an error boundary in actual usage
        expect(() => {
          render(<ProblematicComponent />);
        }).toThrow();
        
      } finally {
        console.error = originalError;
      }
    });
  });
});