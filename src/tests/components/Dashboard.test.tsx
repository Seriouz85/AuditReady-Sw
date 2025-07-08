import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../utils/test-utils';
import Dashboard from '@/pages/Dashboard';
import { useAuthStore } from '@/stores/authStore';
import { useOrganizationStore } from '@/stores/organizationStore';
import { mockUser, mockOrganization, mockAssessments, mockRisks } from '../fixtures/testData';

// Mock the stores
vi.mock('@/stores/authStore');
vi.mock('@/stores/organizationStore');

// Mock chart components to avoid canvas issues in tests
vi.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />
}));

describe('Dashboard', () => {
  const mockUseAuthStore = useAuthStore as any;
  const mockUseOrganizationStore = useOrganizationStore as any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup default store states
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false
    });

    mockUseOrganizationStore.mockReturnValue({
      currentOrganization: mockOrganization,
      isLoading: false
    });
  });

  it('renders dashboard with user greeting', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome back,/)).toBeInTheDocument();
      expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    });
  });

  it('displays organization information', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(mockOrganization.name)).toBeInTheDocument();
    });
  });

  it('shows loading state when data is loading', () => {
    mockUseOrganizationStore.mockReturnValue({
      currentOrganization: null,
      isLoading: true
    });

    renderWithProviders(<Dashboard />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays compliance overview cards', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Compliance Score')).toBeInTheDocument();
      expect(screen.getByText('Active Assessments')).toBeInTheDocument();
      expect(screen.getByText('Open Risks')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
    });
  });

  it('renders charts when data is available', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
  });

  it('handles navigation to assessments', async () => {
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', () => ({
      ...vi.importActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));

    renderWithProviders(<Dashboard />);
    
    const assessmentCard = screen.getByText('Active Assessments').closest('div');
    if (assessmentCard) {
      fireEvent.click(assessmentCard);
    }
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/assessments');
    });
  });

  it('displays recent activity when available', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });
  });

  it('shows quick actions section', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('New Assessment')).toBeInTheDocument();
      expect(screen.getByText('Upload Document')).toBeInTheDocument();
      expect(screen.getByText('Add Risk')).toBeInTheDocument();
    });
  });

  it('handles unauthenticated user', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });

    renderWithProviders(<Dashboard />);
    
    expect(screen.getByText('Please log in to access the dashboard')).toBeInTheDocument();
  });

  it('displays error state when organization fails to load', () => {
    mockUseOrganizationStore.mockReturnValue({
      currentOrganization: null,
      isLoading: false,
      error: 'Failed to load organization'
    });

    renderWithProviders(<Dashboard />);
    
    expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
  });

  it('refreshes data when refresh button is clicked', async () => {
    const mockRefresh = vi.fn();
    mockUseOrganizationStore.mockReturnValue({
      currentOrganization: mockOrganization,
      isLoading: false,
      refresh: mockRefresh
    });

    renderWithProviders(<Dashboard />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);
    
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('filters dashboard data based on time period', async () => {
    renderWithProviders(<Dashboard />);
    
    const timeFilter = screen.getByRole('combobox', { name: /time period/i });
    fireEvent.change(timeFilter, { target: { value: '30d' } });
    
    await waitFor(() => {
      // Verify that data is filtered accordingly
      expect(screen.getByDisplayValue('30d')).toBeInTheDocument();
    });
  });

  it('displays responsive layout on mobile', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    renderWithProviders(<Dashboard />);
    
    const dashboardContainer = screen.getByTestId('dashboard-container');
    expect(dashboardContainer).toHaveClass('mobile-layout');
  });

  it('tracks analytics events on page load', async () => {
    const mockTrackPageView = vi.fn();
    vi.mock('@/lib/monitoring/analytics', () => ({
      analytics: {
        trackPageView: mockTrackPageView
      }
    }));

    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(mockTrackPageView).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles keyboard navigation', async () => {
    renderWithProviders(<Dashboard />);
    
    const firstCard = screen.getAllByRole('button')[0];
    firstCard.focus();
    
    fireEvent.keyDown(firstCard, { key: 'Enter' });
    
    // Verify navigation behavior
    await waitFor(() => {
      expect(firstCard).toHaveFocus();
    });
  });

  it('displays accessibility indicators', () => {
    renderWithProviders(<Dashboard />);
    
    // Check for ARIA labels and roles
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByLabelText('Dashboard navigation')).toBeInTheDocument();
  });
});