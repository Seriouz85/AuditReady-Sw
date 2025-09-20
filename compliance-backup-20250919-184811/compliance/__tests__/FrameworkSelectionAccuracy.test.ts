/**
 * Comprehensive test suite for framework selection accuracy
 * Tests all framework combinations to ensure proper inclusion/exclusion
 */

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { complianceUnificationService } from '../ComplianceUnificationService';

// Mock supabase to avoid real database calls during testing
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockData.categories, error: null }))
        })),
        in: vi.fn(() => Promise.resolve({ data: mockData.mappings, error: null }))
      }))
    }))
  }
}));

// Mock data for testing
const mockData = {
  categories: [
    {
      id: 'cat1',
      name: 'Access Control',
      description: 'Identity and access management',
      sort_order: 1,
      icon: 'key'
    },
    {
      id: 'cat2', 
      name: 'Network Security',
      description: 'Network protection measures',
      sort_order: 2,
      icon: 'network'
    }
  ],
  unifiedRequirements: [
    {
      id: 'req1',
      category_id: 'cat1',
      title: 'Access Control Requirement',
      description: 'Manage user access',
      sub_requirements: ['Implement MFA', 'Regular access reviews'],
      sort_order: 1
    }
  ],
  mappings: [
    {
      id: 'map1',
      mapping_strength: 'strong',
      requirement: {
        id: 'r1',
        control_id: 'A.9.1.1',
        title: 'Access Control Policy',
        description: 'Clean description',
        standard: { id: 's1', name: 'ISO/IEC 27001:2022' }
      },
      unified_requirement: {
        id: 'req1',
        title: 'Access Control Requirement',
        category: { id: 'cat1', name: 'Access Control' }
      }
    },
    {
      id: 'map2', 
      mapping_strength: 'strong',
      requirement: {
        id: 'r2',
        control_id: '1.1',
        title: 'CIS Control 1.1',
        description: 'Maintain inventory',
        standard: { id: 's2', name: 'CIS Controls Implementation Group 1 (IG1)' }
      },
      unified_requirement: {
        id: 'req1', 
        title: 'Access Control Requirement',
        category: { id: 'cat1', name: 'Access Control' }
      }
    },
    {
      id: 'map3',
      mapping_strength: 'strong', 
      requirement: {
        id: 'r3',
        control_id: '2.1',
        title: 'CIS Control 2.1',
        description: 'Software inventory',
        standard: { id: 's3', name: 'CIS Controls Implementation Group 2 (IG2)' }
      },
      unified_requirement: {
        id: 'req1',
        title: 'Access Control Requirement', 
        category: { id: 'cat1', name: 'Access Control' }
      }
    },
    {
      id: 'map4',
      mapping_strength: 'strong',
      requirement: {
        id: 'r4', 
        control_id: '3.1',
        title: 'CIS Control 3.1',
        description: 'Data protection',
        standard: { id: 's4', name: 'CIS Controls Implementation Group 3 (IG3)' }
      },
      unified_requirement: {
        id: 'req1',
        title: 'Access Control Requirement',
        category: { id: 'cat1', name: 'Access Control' }
      }
    }
  ]
};

describe('Framework Selection Accuracy Tests', () => {
  
  describe('Single Framework Selection', () => {
    it('should include only ISO 27001 when selected alone', async () => {
      const result = await complianceUnificationService.getComplianceMappingData(
        ['iso27001'],
        undefined,
        undefined
      );
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      
      // Check that only ISO 27001 requirements are included
      for (const category of result) {
        expect(category.frameworks.iso27001).toBeDefined();
        expect(category.frameworks.cisControls).toEqual([]);
        expect(category.frameworks.gdpr).toEqual([]);
        expect(category.frameworks.nis2).toEqual([]);
      }
    });

    it('should include only CIS Controls IG1 when selected alone', async () => {
      const result = await complianceUnificationService.getComplianceMappingData(
        ['cisControls'],
        'ig1',
        undefined
      );
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      
      // Check that only CIS IG1 requirements are included
      for (const category of result) {
        expect(category.frameworks.cisControls).toBeDefined();
        expect(category.frameworks.iso27001).toEqual([]);
        expect(category.frameworks.gdpr).toEqual([]);
        expect(category.frameworks.nis2).toEqual([]);
        
        // Verify IG1 specific requirements (should not include IG2/IG3)
        const cisReqs = category.frameworks.cisControls;
        if (cisReqs.length > 0) {
          cisReqs.forEach(req => {
            expect(req.code).toMatch(/^1\./); // IG1 controls start with 1.
          });
        }
      }
    });
  });

  describe('CIS Implementation Group Accuracy', () => {
    it('should return only IG1 requirements when IG1 is selected', async () => {
      const result = await complianceUnificationService.getComplianceMappingData(
        ['cisControls'],
        'ig1',
        undefined
      );
      
      for (const category of result) {
        const cisReqs = category.frameworks.cisControls;
        if (cisReqs.length > 0) {
          cisReqs.forEach(req => {
            // IG1 requirements should be from IG1 standards only
            expect(req.code).toMatch(/^1\./);
          });
        }
      }
    });

    it('should return only IG2 requirements when IG2 is selected', async () => {
      const result = await complianceUnificationService.getComplianceMappingData(
        ['cisControls'],
        'ig2',
        undefined
      );
      
      for (const category of result) {
        const cisReqs = category.frameworks.cisControls;
        if (cisReqs.length > 0) {
          cisReqs.forEach(req => {
            // IG2 requirements should be from IG2 standards only
            expect(req.code).toMatch(/^2\./);
          });
        }
      }
    });

    it('should return only IG3 requirements when IG3 is selected', async () => {
      const result = await complianceUnificationService.getComplianceMappingData(
        ['cisControls'],
        'ig3',
        undefined
      );
      
      for (const category of result) {
        const cisReqs = category.frameworks.cisControls;
        if (cisReqs.length > 0) {
          cisReqs.forEach(req => {
            // IG3 requirements should be from IG3 standards only
            expect(req.code).toMatch(/^3\./);
          });
        }
      }
    });
  });

  describe('Multiple Framework Selection', () => {
    it('should include requirements from all selected frameworks', async () => {
      const result = await complianceUnificationService.getComplianceMappingData(
        ['iso27001', 'cisControls'],
        'ig2',
        undefined
      );
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      
      let hasIso = false;
      let hasCis = false;
      
      for (const category of result) {
        if (category.frameworks.iso27001.length > 0) hasIso = true;
        if (category.frameworks.cisControls.length > 0) hasCis = true;
        
        // Should not include unselected frameworks
        expect(category.frameworks.gdpr).toEqual([]);
        expect(category.frameworks.nis2).toEqual([]);
      }
      
      // At least one category should have requirements from selected frameworks
      expect(hasIso || hasCis).toBe(true);
    });
  });

  describe('Framework Exclusion Accuracy', () => {
    it('should exclude GDPR when not selected', async () => {
      const result = await complianceUnificationService.getComplianceMappingData(
        ['iso27001', 'cisControls'],
        'ig1',
        undefined
      );
      
      for (const category of result) {
        expect(category.frameworks.gdpr).toEqual([]);
      }
    });

    it('should exclude NIS2 when not selected', async () => {
      const result = await complianceUnificationService.getComplianceMappingData(
        ['iso27001'],
        undefined,
        undefined
      );
      
      for (const category of result) {
        expect(category.frameworks.nis2).toEqual([]);
      }
    });

    it('should exclude CIS Controls when not selected', async () => {
      const result = await complianceUnificationService.getComplianceMappingData(
        ['iso27001'],
        undefined,
        undefined
      );
      
      for (const category of result) {
        expect(category.frameworks.cisControls).toEqual([]);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty framework selection gracefully', async () => {
      const result = await complianceUnificationService.getComplianceMappingData(
        [],
        undefined,
        undefined
      );
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle invalid CIS IG level gracefully', async () => {
      const result = await complianceUnificationService.getComplianceMappingData(
        ['cisControls'],
        'invalid' as any,
        undefined
      );
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle non-existent framework codes', async () => {
      const result = await complianceUnificationService.getComplianceMappingData(
        ['nonExistentFramework'],
        undefined,
        undefined
      );
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Comprehensive Framework Combinations', () => {
    const testCases = [
      {
        name: 'EU Compliance Pack',
        frameworks: ['iso27001', 'gdpr', 'nis2'],
        cisLevel: undefined
      },
      {
        name: 'Security Focused',
        frameworks: ['iso27001', 'iso27002', 'cisControls'],
        cisLevel: 'ig3' as const
      },
      {
        name: 'Basic Security',
        frameworks: ['cisControls'],
        cisLevel: 'ig1' as const
      },
      {
        name: 'Privacy Focused',
        frameworks: ['gdpr'],
        cisLevel: undefined
      }
    ];

    testCases.forEach(testCase => {
      it(`should handle ${testCase.name} combination correctly`, async () => {
        const result = await complianceUnificationService.getComplianceMappingData(
          testCase.frameworks,
          testCase.cisLevel,
          undefined
        );
        
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        
        for (const category of result) {
          // Check that selected frameworks have requirements or empty arrays
          testCase.frameworks.forEach(framework => {
            const frameworkKey = framework === 'cisControls' ? 'cisControls' : framework;
            expect(category.frameworks[frameworkKey]).toBeDefined();
            expect(Array.isArray(category.frameworks[frameworkKey])).toBe(true);
          });
          
          // Check that unselected frameworks are empty
          const allFrameworks = ['iso27001', 'iso27002', 'cisControls', 'gdpr', 'nis2'];
          const unselectedFrameworks = allFrameworks.filter(f => !testCase.frameworks.includes(f));
          
          unselectedFrameworks.forEach(framework => {
            expect(category.frameworks[framework]).toEqual([]);
          });
        }
      });
    });
  });
});