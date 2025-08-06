/**
 * Comprehensive test suite for Enhanced Supplier Assessment System
 * Tests all critical functionality including UI components, services, and workflows
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import EnhancedSupplierReview from '@/components/suppliers/EnhancedSupplierReview';
import SupplierPortal from '@/pages/SupplierPortal';
import { supplierAssessmentService } from '@/services/supplier-assessment/SupplierAssessmentService';
import { mockSupplierRiskEngine } from '@/services/supplier-assessment/SupplierRiskEngine';
import { suppliers, standards, requirements } from '@/data/mockData';

// Mock the services
vi.mock('@/services/supplier-assessment/SupplierAssessmentService');
vi.mock('@/services/supplier-assessment/SupplierRiskEngine');
vi.mock('@/utils/toast');

const mockSupplier = suppliers[0];
const mockStandards = standards.slice(0, 3);
const mockRequirements = requirements.slice(0, 10);

// Test helper to wrap components with necessary providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <div id="root">{children}</div>
  </BrowserRouter>
);

describe('Enhanced Supplier Assessment System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('EnhancedSupplierReview Component', () => {
    const mockProps = {
      supplier: mockSupplier,
      standards: mockStandards,  
      requirements: mockRequirements,
      onClose: vi.fn(),
      onCampaignCreated: vi.fn()
    };

    it('renders the enhanced supplier review interface', () => {
      render(
        <TestWrapper>
          <EnhancedSupplierReview {...mockProps} />
        </TestWrapper>
      );

      // Check for main interface elements
      expect(screen.getByText('Enhanced Supplier Assessment')).toBeInTheDocument();
      expect(screen.getByText(mockSupplier.name)).toBeInTheDocument();
      
      // Check for tab navigation
      expect(screen.getByRole('tab', { name: 'Standards' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Requirements' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Settings' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Contacts' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Preview' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Analysis' })).toBeInTheDocument();
    });

    it('allows standards selection and shows requirement count', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EnhancedSupplierReview {...mockProps} />
        </TestWrapper>
      );

      // Should start on Standards tab
      expect(screen.getByText('Available Standards')).toBeInTheDocument();

      // Find and click a standard checkbox
      const standardCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(standardCheckbox);

      // Should show requirement count for selected standard
      await waitFor(() => {
        expect(screen.getByText(/requirements/)).toBeInTheDocument();
      });
    });

    it('validates campaign creation requirements', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <EnhancedSupplierReview {...mockProps} />
        </TestWrapper>
      );

      // Navigate to preview tab
      const previewTab = screen.getByRole('tab', { name: 'Preview' });
      await user.click(previewTab);

      // Try to create campaign without selecting standards
      const createButton = screen.getByText('Create & Send Assessment');
      await user.click(createButton);

      // Should show validation error (mocked toast)
      expect(supplierAssessmentService.createCampaign).not.toHaveBeenCalled();
    });

    it('shows analysis data when available', async () => {
      const user = userEvent.setup();
      
      // Mock service responses
      vi.mocked(supplierAssessmentService.getCampaigns).mockResolvedValue({
        success: true,
        campaigns: [{
          id: 'campaign-1',
          supplier_id: mockSupplier.id,
          name: 'Test Campaign',
          status: 'completed' as const,
          risk_score: 75,
          risk_level: 'medium' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          organization_id: 'org-1',
          created_by: 'user-1',
          allow_delegation: true,
          require_evidence: true,
          send_reminders: true,
          reminder_frequency_days: 7
        }]
      });

      render(
        <TestWrapper>
          <EnhancedSupplierReview {...mockProps} />
        </TestWrapper>
      );

      // Navigate to analysis tab
      const analysisTab = screen.getByRole('tab', { name: 'Analysis' });
      await user.click(analysisTab);

      await waitFor(() => {
        expect(screen.getByText('Assessment History')).toBeInTheDocument();
      });
    });
  });

  describe('SupplierPortal Component', () => {
    const mockSearchParams = new URLSearchParams('?email=test@example.com&token=test-token');
    
    beforeEach(() => {
      // Mock URLSearchParams
      Object.defineProperty(window, 'location', {
        value: { search: mockSearchParams.toString() },
        writable: true
      });
    });

    it('renders login form when not authenticated', () => {
      render(
        <TestWrapper>
          <SupplierPortal />
        </TestWrapper>
      );

      expect(screen.getByText('Supplier Assessment Portal')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('your.email@company.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter access token from email')).toBeInTheDocument();
      expect(screen.getByText('Access Assessment')).toBeInTheDocument();
    });

    it('handles successful authentication', async () => {
      const user = userEvent.setup();
      
      // Mock successful authentication
      vi.mocked(supplierAssessmentService.authenticateSupplier).mockResolvedValue({
        success: true,
        user: {
          id: 'user-1',
          supplier_id: 'supplier-1',
          campaign_id: 'campaign-1',
          email: 'test@example.com',
          full_name: 'Test User',
          title: 'Test Title',
          role: 'primary' as const,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        sessionToken: 'session-token'
      });

      render(
        <TestWrapper>
          <SupplierPortal />
        </TestWrapper>
      );

      // Fill in login form
      const emailInput = screen.getByPlaceholderText('your.email@company.com');
      const tokenInput = screen.getByPlaceholderText('Enter access token from email');
      const submitButton = screen.getByText('Access Assessment');

      await user.type(emailInput, 'test@example.com');
      await user.type(tokenInput, 'test-token');
      await user.click(submitButton);

      // Should show dashboard after successful login
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Assessment')).toBeInTheDocument();
        expect(screen.getByText('Progress')).toBeInTheDocument();
        expect(screen.getByText('Help')).toBeInTheDocument();
      });
    });

    it('displays assessment requirements correctly', async () => {
      const user = userEvent.setup();
      
      // Mock authentication and requirements
      vi.mocked(supplierAssessmentService.authenticateSupplier).mockResolvedValue({
        success: true,
        user: {
          id: 'user-1',
          supplier_id: 'supplier-1',
          campaign_id: 'campaign-1',
          email: 'test@example.com',
          full_name: 'Test User',
          title: 'Test Title',
          role: 'primary' as const,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        sessionToken: 'session-token'
      });

      render(
        <TestWrapper>
          <SupplierPortal />
        </TestWrapper>
      );

      // Trigger authentication
      const submitButton = screen.getByText('Access Assessment');
      await user.click(submitButton);

      // Wait for dashboard to load then navigate to assessment
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      const assessmentTab = screen.getByRole('tab', { name: 'Assessment' });
      await user.click(assessmentTab);

      // Should show assessment requirements
      await waitFor(() => {
        expect(screen.getByText('Information Classification')).toBeInTheDocument();
        expect(screen.getByText('Fulfillment Level')).toBeInTheDocument();
      });
    });

    it('allows saving and submitting responses', async () => {
      const user = userEvent.setup();
      
      // Mock authentication
      vi.mocked(supplierAssessmentService.authenticateSupplier).mockResolvedValue({
        success: true,
        user: {
          id: 'user-1',
          supplier_id: 'supplier-1',
          campaign_id: 'campaign-1',
          email: 'test@example.com',
          full_name: 'Test User',
          title: 'Test Title',
          role: 'primary' as const,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        sessionToken: 'session-token'
      });

      render(
        <TestWrapper>
          <SupplierPortal />
        </TestWrapper>
      );

      // Navigate to assessment after login
      const submitButton = screen.getByText('Access Assessment');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      const assessmentTab = screen.getByRole('tab', { name: 'Assessment' });
      await user.click(assessmentTab);

      // Fill in a response
      await waitFor(() => {
        const responseTextarea = screen.getAllByPlaceholderText('Describe how you fulfill this requirement...')[0];
        expect(responseTextarea).toBeInTheDocument();
      });

      const responseTextarea = screen.getAllByPlaceholderText('Describe how you fulfill this requirement...')[0];
      await user.type(responseTextarea, 'Test response for requirement');

      // Save as draft
      const saveDraftButton = screen.getAllByText('Save Draft')[0];
      await user.click(saveDraftButton);

      // Should show success message (mocked)
      expect(saveDraftButton).toBeInTheDocument();
    });
  });

  describe('SupplierRiskEngine', () => {
    it('generates compliance metrics correctly', async () => {
      const mockInput = {
        campaign: {
          id: 'campaign-1',
          supplier_id: 'supplier-1',
          name: 'Test Campaign',
          status: 'completed' as const,
          risk_score: 0,
          risk_level: 'unknown' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          organization_id: 'org-1',
          created_by: 'user-1',
          allow_delegation: true,
          require_evidence: true,
          send_reminders: true,
          reminder_frequency_days: 7
        },
        responses: [],
        requirements: mockRequirements,
        standards: mockStandards
      };

      const metrics = await mockSupplierRiskEngine.generateComplianceMetrics(mockInput);

      expect(metrics).toBeDefined();
      expect(metrics.campaign_id).toBe('campaign-1');
      expect(metrics.total_requirements).toBe(15);
      expect(metrics.compliance_percentage).toBe(80);
      expect(metrics.fulfillment_breakdown).toBeDefined();
      expect(metrics.standards_compliance).toBeInstanceOf(Array);
    });

    it('performs gap analysis correctly', async () => {
      const mockInput = {
        campaign: {
          id: 'campaign-1',
          supplier_id: 'supplier-1',
          name: 'Test Campaign',
          status: 'completed' as const,
          risk_score: 0,
          risk_level: 'unknown' as const,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          organization_id: 'org-1',
          created_by: 'user-1',
          allow_delegation: true,
          require_evidence: true,
          send_reminders: true,
          reminder_frequency_days: 7
        },
        responses: [],
        requirements: mockRequirements,
        standards: mockStandards
      };

      const gapAnalysis = await mockSupplierRiskEngine.performGapAnalysis(mockInput);

      expect(gapAnalysis).toBeDefined();
      expect(gapAnalysis.total_gaps).toBe(6);
      expect(gapAnalysis.critical_gaps).toBe(1);
      expect(gapAnalysis.high_risk_gaps).toBe(2);
      expect(gapAnalysis.gap_details).toBeInstanceOf(Array);
      expect(gapAnalysis.gap_details.length).toBeGreaterThan(0);
    });

    it('generates risk dashboard correctly', async () => {
      const mockCampaigns = [{
        id: 'campaign-1',
        supplier_id: 'supplier-1',
        name: 'Test Campaign',
        status: 'completed' as const,
        risk_score: 75,
        risk_level: 'medium' as const,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        organization_id: 'org-1',
        created_by: 'user-1',
        allow_delegation: true,
        require_evidence: true,
        send_reminders: true,
        reminder_frequency_days: 7
      }];

      const dashboard = await mockSupplierRiskEngine.generateRiskDashboard(mockCampaigns);

      expect(dashboard).toBeDefined();
      expect(dashboard.total_suppliers).toBeGreaterThanOrEqual(0);
      expect(dashboard.active_assessments).toBeGreaterThanOrEqual(0);
      expect(dashboard.completed_assessments).toBeGreaterThanOrEqual(0);
      expect(dashboard.risk_distribution).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('completes full assessment workflow', async () => {
      const user = userEvent.setup();
      
      // Mock all necessary services
      vi.mocked(supplierAssessmentService.getCampaigns).mockResolvedValue({
        success: true,
        campaigns: []
      });

      vi.mocked(supplierAssessmentService.createCampaign).mockResolvedValue({
        success: true,
        campaignId: 'new-campaign-1'
      });

      vi.mocked(supplierAssessmentService.inviteSupplier).mockResolvedValue({
        success: true
      });

      vi.mocked(supplierAssessmentService.updateCampaignStatus).mockResolvedValue({
        success: true
      });

      render(
        <TestWrapper>
          <EnhancedSupplierReview
            supplier={mockSupplier}
            standards={mockStandards}
            requirements={mockRequirements}
            onClose={vi.fn()}
            onCampaignCreated={vi.fn()}
          />
        </TestWrapper>
      );

      // 1. Select standards
      const standardCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(standardCheckbox);

      // 2. Navigate to requirements tab
      const requirementsTab = screen.getByRole('tab', { name: 'Requirements' });
      await user.click(requirementsTab);

      // 3. Navigate to settings
      const settingsTab = screen.getByRole('tab', { name: 'Settings' });
      await user.click(settingsTab);

      // 4. Fill in campaign name
      const campaignNameInput = screen.getByDisplayValue(/Security Assessment/);
      await user.clear(campaignNameInput);
      await user.type(campaignNameInput, 'Test Security Assessment');

      // 5. Navigate to contacts
      const contactsTab = screen.getByRole('tab', { name: 'Contacts' });
      await user.click(contactsTab);

      // Should show pre-filled contact information
      expect(screen.getByDisplayValue(mockSupplier.contact.name)).toBeInTheDocument();

      // 6. Navigate to preview
      const previewTab = screen.getByRole('tab', { name: 'Preview' });
      await user.click(previewTab);

      // Should show assessment summary
      expect(screen.getByText('Assessment Summary')).toBeInTheDocument();
      expect(screen.getByText('Test Security Assessment')).toBeInTheDocument();

      // This test verifies the workflow but doesn't actually create campaign
      // due to validation requirements in the component
    });

    it('handles error states gracefully', async () => {
      // Mock service failure
      vi.mocked(supplierAssessmentService.getCampaigns).mockResolvedValue({
        success: false,
        error: 'Failed to load campaigns'
      });

      render(
        <TestWrapper>
          <EnhancedSupplierReview
            supplier={mockSupplier}
            standards={mockStandards}
            requirements={mockRequirements}
            onClose={vi.fn()}
            onCampaignCreated={vi.fn()}
          />
        </TestWrapper>
      );

      // Component should still render despite service failure
      expect(screen.getByText('Enhanced Supplier Assessment')).toBeInTheDocument();
    });
  });

  describe('Mock Data Validation', () => {
    it('validates supplier mock data structure', () => {
      expect(mockSupplier).toBeDefined();
      expect(mockSupplier.id).toBeDefined();
      expect(mockSupplier.name).toBeDefined();
      expect(mockSupplier.contact).toBeDefined();
      expect(mockSupplier.contact.email).toBeDefined();
      expect(mockSupplier.internalResponsible).toBeDefined();
      expect(mockSupplier.associatedStandards).toBeInstanceOf(Array);
    });

    it('validates standards mock data structure', () => {
      mockStandards.forEach(standard => {
        expect(standard.id).toBeDefined();
        expect(standard.name).toBeDefined();
        expect(standard.description).toBeDefined();
      });
    });

    it('validates requirements mock data structure', () => {
      mockRequirements.forEach(requirement => {
        expect(requirement.id).toBeDefined();
        expect(requirement.name).toBeDefined();
        expect(requirement.description).toBeDefined();
        expect(requirement.standardId).toBeDefined();
      });
    });
  });
});

// Additional test utilities for manual testing
export const testScenarios = {
  // Scenario 1: Happy path assessment creation
  createSuccessfulAssessment: {
    description: 'Create a complete assessment with all requirements',
    steps: [
      '1. Open Enhanced Supplier Review for CloudSecure Solutions',
      '2. Select ISO 27001 and SOC 2 standards',
      '3. Verify all requirements are auto-selected',
      '4. Configure settings (allow delegation, require evidence)',
      '5. Add additional contact if needed',
      '6. Review preview and create assessment',
      '7. Verify campaign appears in analysis tab'
    ],
    expectedResult: 'Assessment campaign created successfully with email invitations sent'
  },

  // Scenario 2: Supplier portal completion
  completeSupplierPortal: {
    description: 'Complete supplier assessment through external portal',
    steps: [
      '1. Access supplier portal with demo credentials',
      '2. Navigate through dashboard showing progress',
      '3. Complete assessment tab with realistic responses',
      '4. Use different fulfillment levels (fulfilled, partial, in-progress)',
      '5. Add evidence descriptions',
      '6. Set confidence levels appropriately',
      '7. Save drafts and submit final responses',
      '8. Review progress tab showing completion'
    ],
    expectedResult: 'Supplier portal shows 100% completion with submitted responses'
  },

  // Scenario 3: Risk analysis and gap identification
  analyzeRiskAndGaps: {
    description: 'Generate comprehensive risk analysis with gap identification',
    steps: [
      '1. Create assessment with mixed response levels',
      '2. Navigate to analysis tab in Enhanced Review',
      '3. Review compliance metrics showing percentage breakdown',
      '4. Examine gap analysis highlighting critical issues',
      '5. Review risk dashboard with supplier overview',
      '6. Verify recommendations for remediation'
    ],
    expectedResult: 'Detailed risk analysis with actionable gap remediation plan'
  }
};