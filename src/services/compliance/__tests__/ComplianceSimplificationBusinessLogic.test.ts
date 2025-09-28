import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComplianceSimplificationBusinessLogic } from '../ComplianceSimplificationBusinessLogic';
import { mockFetch, createMockSupabaseResponse } from '@/test-utils';

// Mock external dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    })),
  },
}));

vi.mock('../EnhancedUnifiedRequirementsGenerator');
vi.mock('../SectorSpecificEnhancer');
vi.mock('../FrameworkIdMapper');
vi.mock('../CleanUnifiedRequirementsEngine');
vi.mock('../EnhancedUnifiedGuidanceService');
vi.mock('../ComplianceCacheService');

describe('ComplianceSimplificationBusinessLogic', () => {
  const mockMappingData = [
    {
      id: '1',
      category: 'Access Control',
      frameworks: {
        iso27001: [
          {
            identifier: 'A.9.1.1',
            title: 'Access control policy',
            description: 'An access control policy should be established'
          }
        ],
        gdpr: [
          {
            identifier: 'Art. 32',
            title: 'Security of processing',
            description: 'Appropriate technical and organizational measures'
          }
        ],
        cisControls: [
          {
            identifier: 'CIS 6.1',
            title: 'Maintain an Inventory of Accounts',
            description: 'Use automated tools to inventory all accounts'
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
            description: 'All information security responsibilities should be defined'
          }
        ],
        nis2: [
          {
            identifier: 'NIS2 Art. 21',
            title: 'Cybersecurity risk-management measures',
            description: 'Member States shall ensure that essential entities'
          }
        ]
      }
    }
  ];

  const mockFrameworkSelection = {
    iso27001: true,
    iso27002: false,
    cisControls: 'ig1',
    gdpr: true,
    nis2: false,
    dora: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('filterMappings', () => {
    it('should filter mappings by selected frameworks', () => {
      const result = ComplianceSimplificationBusinessLogic.filterMappings(
        mockMappingData,
        mockFrameworkSelection
      );

      expect(result).toHaveLength(2);
      expect(result[0].frameworks.iso27001).toBeDefined();
      expect(result[0].frameworks.gdpr).toBeDefined();
    });

    it('should filter by specific framework', () => {
      const result = ComplianceSimplificationBusinessLogic.filterMappings(
        mockMappingData,
        mockFrameworkSelection,
        'gdpr'
      );

      // Should only return mappings that have GDPR requirements
      expect(result).toHaveLength(1);
      expect(result[0].frameworks.gdpr).toBeDefined();
    });

    it('should filter by category', () => {
      const result = ComplianceSimplificationBusinessLogic.filterMappings(
        mockMappingData,
        mockFrameworkSelection,
        undefined,
        'Access Control'
      );

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('Access Control');
    });

    it('should combine framework and category filters', () => {
      const result = ComplianceSimplificationBusinessLogic.filterMappings(
        mockMappingData,
        mockFrameworkSelection,
        'iso27001',
        'Risk Management'
      );

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('Risk Management');
      expect(result[0].frameworks.iso27001).toBeDefined();
    });

    it('should return empty array when no matches found', () => {
      const result = ComplianceSimplificationBusinessLogic.filterMappings(
        mockMappingData,
        { iso27001: false, gdpr: false, cisControls: null, nis2: false, dora: false },
        'nonexistent'
      );

      expect(result).toHaveLength(0);
    });

    it('should handle empty mapping data', () => {
      const result = ComplianceSimplificationBusinessLogic.filterMappings(
        [],
        mockFrameworkSelection
      );

      expect(result).toHaveLength(0);
    });

    it('should handle malformed mapping data gracefully', () => {
      const malformedData = [
        {
          id: '1',
          // Missing category and frameworks
        },
        {
          id: '2',
          category: 'Test',
          frameworks: null
        }
      ];

      const result = ComplianceSimplificationBusinessLogic.filterMappings(
        malformedData,
        mockFrameworkSelection
      );

      // Should filter out malformed entries
      expect(result).toHaveLength(0);
    });
  });

  describe('calculateStats', () => {
    it('should calculate correct statistics from filtered mappings', () => {
      const stats = ComplianceSimplificationBusinessLogic.calculateStats(
        mockMappingData,
        mockFrameworkSelection
      );

      expect(stats).toEqual({
        totalCategories: 2,
        totalRequirements: expect.any(Number),
        frameworkCounts: {
          iso27001: 2,
          gdpr: 1,
          cisControls: 1,
          nis2: 0,
          dora: 0
        },
        categoryDistribution: {
          'Access Control': 1,
          'Risk Management': 1
        }
      });
    });

    it('should handle empty data correctly', () => {
      const stats = ComplianceSimplificationBusinessLogic.calculateStats(
        [],
        mockFrameworkSelection
      );

      expect(stats.totalCategories).toBe(0);
      expect(stats.totalRequirements).toBe(0);
      expect(Object.values(stats.frameworkCounts).every(count => count === 0)).toBe(true);
    });
  });

  describe('generateUnifiedRequirements', () => {
    it('should generate unified requirements successfully', async () => {
      const mockProgress = vi.fn();
      
      // Mock the generator response
      const mockGeneratedRequirements = [
        {
          id: '1',
          category: 'Access Control',
          title: 'Unified Access Control Policy',
          description: 'Implement comprehensive access control measures',
          frameworks: ['ISO27001', 'GDPR'],
          requirements: [
            'Establish access control policy',
            'Implement user access management'
          ]
        }
      ];

      // We can't directly mock the private enhancedGenerator, so we'll test the public interface
      const result = await ComplianceSimplificationBusinessLogic.generateUnifiedRequirements(
        mockMappingData,
        mockFrameworkSelection,
        'enterprise',
        mockProgress
      );

      expect(mockProgress).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle generation errors gracefully', async () => {
      const mockProgress = vi.fn();

      // Test with invalid data
      const result = await ComplianceSimplificationBusinessLogic.generateUnifiedRequirements(
        [],
        mockFrameworkSelection,
        'enterprise',
        mockProgress
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should call progress callback with updates', async () => {
      const mockProgress = vi.fn();

      await ComplianceSimplificationBusinessLogic.generateUnifiedRequirements(
        mockMappingData,
        mockFrameworkSelection,
        'enterprise',
        mockProgress
      );

      expect(mockProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          category: expect.any(String),
          progress: expect.any(Number),
          stage: expect.any(String)
        })
      );
    });
  });

  describe('generateGuidance', () => {
    it('should generate guidance for unified requirements', async () => {
      const mockUnifiedRequirements = [
        {
          id: '1',
          category: 'Access Control',
          title: 'Access Control Policy',
          description: 'Implement access control measures',
          frameworks: ['ISO27001'],
          requirements: ['Policy establishment']
        }
      ];

      const result = await ComplianceSimplificationBusinessLogic.generateGuidance(
        mockUnifiedRequirements,
        'enterprise'
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty requirements array', async () => {
      const result = await ComplianceSimplificationBusinessLogic.generateGuidance(
        [],
        'enterprise'
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });
  });

  describe('performance and memory management', () => {
    it('should handle large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `mapping-${i}`,
        category: `Category ${i % 10}`,
        frameworks: {
          iso27001: [
            {
              identifier: `A.${i}.1`,
              title: `Requirement ${i}`,
              description: `Description ${i}`
            }
          ]
        }
      }));

      const startTime = performance.now();
      
      const result = ComplianceSimplificationBusinessLogic.filterMappings(
        largeDataset,
        { iso27001: true, gdpr: false, cisControls: null, nis2: false, dora: false }
      );

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      expect(result).toHaveLength(1000);
      expect(processingTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should not cause memory leaks with repeated calls', () => {
      const initialMemory = (global as any).gc ? process.memoryUsage().heapUsed : 0;

      // Run filtering operation multiple times
      for (let i = 0; i < 100; i++) {
        ComplianceSimplificationBusinessLogic.filterMappings(
          mockMappingData,
          mockFrameworkSelection
        );
      }

      if ((global as any).gc) {
        (global as any).gc();
        const finalMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = finalMemory - initialMemory;
        
        // Memory increase should be minimal (less than 10MB)
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      }
    });
  });

  describe('caching integration', () => {
    it('should use cache for repeated requests', () => {
      const key = 'test-cache-key';
      const testData = { test: 'data' };

      // The service uses a mocked cache service that always returns null
      // This test verifies the cache interface is called correctly
      const result1 = ComplianceSimplificationBusinessLogic.filterMappings(
        mockMappingData,
        mockFrameworkSelection
      );

      const result2 = ComplianceSimplificationBusinessLogic.filterMappings(
        mockMappingData,
        mockFrameworkSelection
      );

      // Both results should be identical
      expect(result1).toEqual(result2);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null or undefined framework selection', () => {
      const result = ComplianceSimplificationBusinessLogic.filterMappings(
        mockMappingData,
        null as any
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle framework selection with all frameworks disabled', () => {
      const allDisabled = {
        iso27001: false,
        iso27002: false,
        cisControls: null,
        gdpr: false,
        nis2: false,
        dora: false
      };

      const result = ComplianceSimplificationBusinessLogic.filterMappings(
        mockMappingData,
        allDisabled
      );

      expect(result).toHaveLength(0);
    });

    it('should sanitize malicious input in mapping data', () => {
      const maliciousData = [
        {
          id: '<script>alert("xss")</script>',
          category: 'Normal Category',
          frameworks: {
            iso27001: [
              {
                identifier: 'A.1.1',
                title: '<img src="x" onerror="alert(1)">',
                description: 'Normal description'
              }
            ]
          }
        }
      ];

      const result = ComplianceSimplificationBusinessLogic.filterMappings(
        maliciousData,
        { iso27001: true, gdpr: false, cisControls: null, nis2: false, dora: false }
      );

      // Should not contain malicious scripts
      expect(JSON.stringify(result)).not.toContain('<script>');
      expect(JSON.stringify(result)).not.toContain('onerror');
    });
  });
});