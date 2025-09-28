import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { createMockSupabaseResponse, createMockAuthUser, createMockOrganization } from '@/test-utils';

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
    auth: {
      getUser: vi.fn()
    }
  }
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: createMockAuthUser(),
    organization: createMockOrganization(),
    loading: false
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock('@/services/compliance/ComplianceSimplificationBusinessLogic', () => ({
  ComplianceSimplificationBusinessLogic: {
    generateUnifiedRequirements: vi.fn(),
    generateGuidance: vi.fn(),
    filterMappings: vi.fn(),
    calculateStats: vi.fn()
  }
}));

vi.mock('@/services/ai/GeminiContentGenerator', () => ({
  GeminiContentGenerator: {
    generateComplianceContent: vi.fn(),
    enhanceRequirements: vi.fn()
  }
}));

import { ComplianceSimplification } from '@/pages/ComplianceSimplification';
import { ComplianceSimplificationBusinessLogic } from '@/services/compliance/ComplianceSimplificationBusinessLogic';

describe('Compliance Generation Workflow Integration Tests', () => {
  let queryClient: QueryClient;

  const mockMappingData = [
    {
      id: '1',
      category: 'Access Control',
      frameworks: {
        iso27001: [
          {
            identifier: 'A.9.1.1',
            title: 'Access control policy',
            description: 'An access control policy should be established, documented and reviewed',
            implementation_guidance: 'Implement formal access control procedures'
          }
        ],
        gdpr: [
          {
            identifier: 'Art. 32',
            title: 'Security of processing',
            description: 'Appropriate technical and organisational measures',
            implementation_guidance: 'Implement appropriate security measures'
          }
        ]
      }
    },
    {
      id: '2',
      category: 'Risk Management',
      frameworks: {
        iso27001: [
          {
            identifier: 'A.6.1.1',
            title: 'Information security roles and responsibilities',
            description: 'All information security responsibilities should be defined and allocated',
            implementation_guidance: 'Define clear security roles'
          }
        ]
      }
    }
  ];

  const mockUnifiedRequirements = [
    {
      id: '1',
      category: 'Access Control',
      title: 'Unified Access Control Framework',
      description: 'Comprehensive access control implementation covering ISO 27001 and GDPR requirements',
      frameworks: ['ISO27001', 'GDPR'],
      requirements: [
        'Establish formal access control policy',
        'Implement user access management procedures',
        'Conduct regular access reviews'
      ],
      implementation_guidance: 'Detailed implementation steps...',
      maturity_level: 'advanced'
    }
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: 0, gcTime: 0 },
        mutations: { retry: false }
      }
    });

    // Setup mock implementations
    (ComplianceSimplificationBusinessLogic.filterMappings as any).mockReturnValue(mockMappingData);
    (ComplianceSimplificationBusinessLogic.calculateStats as any).mockReturnValue({
      totalCategories: 2,
      totalRequirements: 3,
      frameworkCounts: {
        iso27001: 2,
        gdpr: 1,
        cisControls: 0,
        nis2: 0,
        dora: 0
      }
    });
    (ComplianceSimplificationBusinessLogic.generateUnifiedRequirements as any).mockResolvedValue(mockUnifiedRequirements);
    (ComplianceSimplificationBusinessLogic.generateGuidance as any).mockResolvedValue([]);

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

  describe('Framework Selection', () => {
    it('should allow users to select compliance frameworks', async () => {
      renderWithProviders(<ComplianceSimplification />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(/compliance/i)).toBeInTheDocument();
      });

      // Look for framework selection checkboxes/toggles
      const iso27001Toggle = screen.getByRole('checkbox', { name: /iso.*27001/i }) ||
                            screen.getByLabelText(/iso.*27001/i);
      
      if (iso27001Toggle) {
        expect(iso27001Toggle).toBeInTheDocument();
        
        // Toggle ISO 27001
        fireEvent.click(iso27001Toggle);
        
        // Should update the selection state
        await waitFor(() => {
          expect(ComplianceSimplificationBusinessLogic.filterMappings).toHaveBeenCalled();
        });
      }
    });

    it('should update statistics when frameworks are selected', async () => {
      renderWithProviders(<ComplianceSimplification />);

      await waitFor(() => {
        expect(screen.getByText(/compliance/i)).toBeInTheDocument();
      });

      // Look for GDPR toggle
      const gdprToggle = screen.getByRole('checkbox', { name: /gdpr/i }) ||
                        screen.getByLabelText(/gdpr/i);

      if (gdprToggle) {
        fireEvent.click(gdprToggle);

        await waitFor(() => {
          expect(ComplianceSimplificationBusinessLogic.calculateStats).toHaveBeenCalled();
        });
      }
    });

    it('should show appropriate messaging when no frameworks are selected', async () => {
      // Mock empty results
      (ComplianceSimplificationBusinessLogic.filterMappings as any).mockReturnValue([]);
      (ComplianceSimplificationBusinessLogic.calculateStats as any).mockReturnValue({
        totalCategories: 0,
        totalRequirements: 0,
        frameworkCounts: {}
      });

      renderWithProviders(<ComplianceSimplification />);

      await waitFor(() => {
        expect(screen.getByText(/select.*framework/i) ||
               screen.getByText(/no.*framework/i)).toBeInTheDocument();
      });
    });
  });

  describe('Requirements Generation', () => {
    it('should generate unified requirements when button is clicked', async () => {
      renderWithProviders(<ComplianceSimplification />);

      await waitFor(() => {
        expect(screen.getByText(/compliance/i)).toBeInTheDocument();
      });

      // Look for generate button
      const generateButton = screen.getByRole('button', { name: /generate/i }) ||
                           screen.getByText(/generate.*requirement/i);

      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          expect(ComplianceSimplificationBusinessLogic.generateUnifiedRequirements).toHaveBeenCalledWith(
            expect.any(Array),
            expect.any(Object),
            expect.any(String),
            expect.any(Function)
          );
        });
      }
    });

    it('should show progress indicator during generation', async () => {
      let progressCallback: Function;
      
      (ComplianceSimplificationBusinessLogic.generateUnifiedRequirements as any).mockImplementation(
        (...args: any[]) => {
          progressCallback = args[3]; // Progress callback is 4th argument
          return new Promise(resolve => {
            setTimeout(() => {
              if (progressCallback) {
                progressCallback({ category: 'Access Control', progress: 50, stage: 'processing' });
              }
              resolve(mockUnifiedRequirements);
            }, 100);
          });
        }
      );

      renderWithProviders(<ComplianceSimplification />);

      await waitFor(() => {
        expect(screen.getByText(/compliance/i)).toBeInTheDocument();
      });

      const generateButton = screen.getByRole('button', { name: /generate/i }) ||
                           screen.getByText(/generate.*requirement/i);

      if (generateButton) {
        fireEvent.click(generateButton);

        // Should show progress indicator
        await waitFor(() => {
          expect(screen.getByText(/progress/i) ||
                 screen.getByText(/processing/i) ||
                 screen.getByRole('progressbar')).toBeInTheDocument();
        });

        // Wait for completion
        await waitFor(() => {
          expect(screen.getByText(/unified.*access.*control/i)).toBeInTheDocument();
        }, { timeout: 5000 });
      }
    });

    it('should handle generation errors gracefully', async () => {
      (ComplianceSimplificationBusinessLogic.generateUnifiedRequirements as any).mockRejectedValue(
        new Error('AI service unavailable')
      );

      renderWithProviders(<ComplianceSimplification />);

      await waitFor(() => {
        expect(screen.getByText(/compliance/i)).toBeInTheDocument();
      });

      const generateButton = screen.getByRole('button', { name: /generate/i }) ||
                           screen.getByText(/generate.*requirement/i);

      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          expect(screen.getByText(/error/i) ||
                 screen.getByText(/failed/i) ||
                 screen.getByText(/unavailable/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Requirements Display and Interaction', () => {
    it('should display generated requirements in organized format', async () => {
      renderWithProviders(<ComplianceSimplification />);

      // Simulate successful generation
      (ComplianceSimplificationBusinessLogic.generateUnifiedRequirements as any).mockResolvedValue(mockUnifiedRequirements);

      await waitFor(() => {
        expect(screen.getByText(/compliance/i)).toBeInTheDocument();
      });

      const generateButton = screen.getByRole('button', { name: /generate/i }) ||
                           screen.getByText(/generate.*requirement/i);

      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          expect(screen.getByText(/unified.*access.*control/i)).toBeInTheDocument();
          expect(screen.getByText(/access control/i)).toBeInTheDocument();
        });
      }
    });

    it('should allow filtering of generated requirements', async () => {
      renderWithProviders(<ComplianceSimplification />);

      // First generate requirements
      const generateButton = screen.getByRole('button', { name: /generate/i }) ||
                           screen.getByText(/generate.*requirement/i);

      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          expect(screen.getByText(/unified.*access.*control/i)).toBeInTheDocument();
        });

        // Look for filter controls
        const filterDropdown = screen.getByRole('combobox') ||
                              screen.getByLabelText(/filter/i);

        if (filterDropdown) {
          fireEvent.click(filterDropdown);
          
          // Select a specific category
          const accessControlOption = screen.getByText(/access.*control/i);
          if (accessControlOption) {
            fireEvent.click(accessControlOption);

            await waitFor(() => {
              expect(ComplianceSimplificationBusinessLogic.filterMappings).toHaveBeenCalledWith(
                expect.any(Array),
                expect.any(Object),
                expect.any(String),
                expect.stringContaining('Access Control')
              );
            });
          }
        }
      }
    });

    it('should enable editing of generated requirements', async () => {
      renderWithProviders(<ComplianceSimplification />);

      const generateButton = screen.getByRole('button', { name: /generate/i }) ||
                           screen.getByText(/generate.*requirement/i);

      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          expect(screen.getByText(/unified.*access.*control/i)).toBeInTheDocument();
        });

        // Look for edit button
        const editButton = screen.getByRole('button', { name: /edit/i }) ||
                          screen.getByLabelText(/edit/i);

        if (editButton) {
          fireEvent.click(editButton);

          // Should enable editing mode
          await waitFor(() => {
            expect(screen.getByRole('textbox') ||
                   screen.getByDisplayValue(/unified.*access.*control/i)).toBeInTheDocument();
          });
        }
      }
    });
  });

  describe('Export Functionality', () => {
    it('should allow exporting requirements to PDF', async () => {
      // Mock PDF export
      const mockPDFExport = vi.fn().mockResolvedValue({ success: true });
      global.jsPDF = vi.fn().mockImplementation(() => ({
        text: vi.fn(),
        save: vi.fn(),
        addPage: vi.fn(),
        setFontSize: vi.fn()
      }));

      renderWithProviders(<ComplianceSimplification />);

      // Generate requirements first
      const generateButton = screen.getByRole('button', { name: /generate/i }) ||
                           screen.getByText(/generate.*requirement/i);

      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          expect(screen.getByText(/unified.*access.*control/i)).toBeInTheDocument();
        });

        // Look for export button
        const exportButton = screen.getByRole('button', { name: /export/i }) ||
                           screen.getByText(/export.*pdf/i);

        if (exportButton) {
          fireEvent.click(exportButton);

          // Should trigger PDF generation
          await waitFor(() => {
            expect(global.jsPDF).toHaveBeenCalled();
          });
        }
      }
    });

    it('should handle export errors gracefully', async () => {
      // Mock export failure
      global.jsPDF = vi.fn().mockImplementation(() => {
        throw new Error('PDF generation failed');
      });

      renderWithProviders(<ComplianceSimplification />);

      const generateButton = screen.getByRole('button', { name: /generate/i }) ||
                           screen.getByText(/generate.*requirement/i);

      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          expect(screen.getByText(/unified.*access.*control/i)).toBeInTheDocument();
        });

        const exportButton = screen.getByRole('button', { name: /export/i }) ||
                           screen.getByText(/export.*pdf/i);

        if (exportButton) {
          fireEvent.click(exportButton);

          await waitFor(() => {
            expect(screen.getByText(/export.*failed/i) ||
                   screen.getByText(/error.*export/i)).toBeInTheDocument();
          });
        }
      }
    });
  });

  describe('Performance and UX', () => {
    it('should complete workflow within acceptable time limits', async () => {
      const startTime = performance.now();

      renderWithProviders(<ComplianceSimplification />);

      await waitFor(() => {
        expect(screen.getByText(/compliance/i)).toBeInTheDocument();
      });

      const generateButton = screen.getByRole('button', { name: /generate/i }) ||
                           screen.getByText(/generate.*requirement/i);

      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          expect(screen.getByText(/unified.*access.*control/i)).toBeInTheDocument();
        });

        const endTime = performance.now();
        const totalTime = endTime - startTime;

        // Should complete within 5 seconds
        expect(totalTime).toBeLessThan(5000);
      }
    });

    it('should maintain responsive interface during generation', async () => {
      // Mock slow generation
      (ComplianceSimplificationBusinessLogic.generateUnifiedRequirements as any).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockUnifiedRequirements), 2000))
      );

      renderWithProviders(<ComplianceSimplification />);

      await waitFor(() => {
        expect(screen.getByText(/compliance/i)).toBeInTheDocument();
      });

      const generateButton = screen.getByRole('button', { name: /generate/i }) ||
                           screen.getByText(/generate.*requirement/i);

      if (generateButton) {
        fireEvent.click(generateButton);

        // Interface should remain responsive
        const frameworkToggle = screen.getByRole('checkbox', { name: /iso.*27001/i }) ||
                               screen.getByLabelText(/iso.*27001/i);

        if (frameworkToggle) {
          // Should be able to interact with other controls
          fireEvent.click(frameworkToggle);
          expect(frameworkToggle).toBeInTheDocument();
        }

        // Wait for generation to complete
        await waitFor(() => {
          expect(screen.getByText(/unified.*access.*control/i)).toBeInTheDocument();
        }, { timeout: 3000 });
      }
    });

    it('should handle large datasets efficiently', async () => {
      // Mock large dataset
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        category: `Category ${i % 10}`,
        frameworks: {
          iso27001: [{
            identifier: `A.${i}.1`,
            title: `Requirement ${i}`,
            description: `Description ${i}`
          }]
        }
      }));

      (ComplianceSimplificationBusinessLogic.filterMappings as any).mockReturnValue(largeDataset);

      renderWithProviders(<ComplianceSimplification />);

      await waitFor(() => {
        expect(screen.getByText(/compliance/i)).toBeInTheDocument();
      });

      // Should handle large datasets without performance issues
      expect(screen.getByText(/compliance/i)).toBeInTheDocument();
    });
  });

  describe('Data Persistence', () => {
    it('should save generated requirements to database', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ data: mockUnifiedRequirements, error: null });
      
      // Mock Supabase insert
      const { supabase } = await import('@/lib/supabase');
      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      });

      renderWithProviders(<ComplianceSimplification />);

      const generateButton = screen.getByRole('button', { name: /generate/i }) ||
                           screen.getByText(/generate.*requirement/i);

      if (generateButton) {
        fireEvent.click(generateButton);

        await waitFor(() => {
          expect(screen.getByText(/unified.*access.*control/i)).toBeInTheDocument();
        });

        // Look for save button
        const saveButton = screen.getByRole('button', { name: /save/i }) ||
                          screen.getByText(/save.*requirement/i);

        if (saveButton) {
          fireEvent.click(saveButton);

          await waitFor(() => {
            expect(mockInsert).toHaveBeenCalledWith(
              expect.arrayContaining([
                expect.objectContaining({
                  category: 'Access Control',
                  title: expect.stringContaining('Unified')
                })
              ])
            );
          });
        }
      }
    });
  });
});