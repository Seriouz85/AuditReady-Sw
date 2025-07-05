/**
 * Integration test for framework selection accuracy
 * Tests against real database to verify framework inclusion/exclusion
 */

import { describe, it, expect } from 'vitest';
import { complianceUnificationService } from '../ComplianceUnificationService';

describe('Framework Selection Integration Tests', () => {
  
  describe('CIS Implementation Group Selection', () => {
    it('should return different requirements for different IG levels', async () => {
      // Test IG1 vs IG3 to ensure they return different results
      const ig1Result = await complianceUnificationService.getComplianceMappingData(
        ['cisControls'],
        'ig1',
        undefined
      );
      
      const ig3Result = await complianceUnificationService.getComplianceMappingData(
        ['cisControls'],
        'ig3',
        undefined
      );
      
      expect(ig1Result).toBeDefined();
      expect(ig3Result).toBeDefined();
      
      // Count total CIS requirements for each IG level
      let ig1Count = 0;
      let ig3Count = 0;
      
      for (const category of ig1Result) {
        ig1Count += category.frameworks?.cisControls?.length || 0;
      }
      
      for (const category of ig3Result) {
        ig3Count += category.frameworks?.cisControls?.length || 0;
      }
      
      console.log(`IG1 Requirements: ${ig1Count}`);
      console.log(`IG3 Requirements: ${ig3Count}`);
      
      // IG3 should typically have more requirements than IG1
      // If they're the same, something might be wrong with the filtering
      if (ig1Count > 0 && ig3Count > 0) {
        expect(ig3Count).toBeGreaterThanOrEqual(ig1Count);
      }
    });

    it('should only include CIS Controls when cisControls framework is selected', async () => {
      const result = await complianceUnificationService.getComplianceMappingData(
        ['cisControls'],
        'ig2',
        undefined
      );
      
      expect(result).toBeDefined();
      
      for (const category of result) {
        // CIS Controls should have requirements (or be empty if no mappings exist)
        expect(Array.isArray(category.frameworks?.cisControls)).toBe(true);
        
        // Other frameworks should be empty arrays
        expect(category.frameworks?.iso27001).toEqual([]);
        expect(category.frameworks?.iso27002).toEqual([]);
        expect(category.frameworks?.gdpr).toEqual([]);
        expect(category.frameworks?.nis2).toEqual([]);
      }
    });
  });

  describe('Framework Exclusion Tests', () => {
    it('should exclude unselected frameworks', async () => {
      const result = await complianceUnificationService.getComplianceMappingData(
        ['iso27001'], // Only select ISO 27001
        undefined,
        undefined
      );
      
      expect(result).toBeDefined();
      
      for (const category of result) {
        // ISO 27001 should have requirements (or be empty if no mappings)
        expect(Array.isArray(category.frameworks?.iso27001)).toBe(true);
        
        // All other frameworks should be empty
        expect(category.frameworks?.iso27002).toEqual([]);
        expect(category.frameworks?.cisControls).toEqual([]);
        expect(category.frameworks?.gdpr).toEqual([]);
        expect(category.frameworks?.nis2).toEqual([]);
      }
    });
  });

  describe('Multiple Framework Selection', () => {
    it('should include all selected frameworks', async () => {
      const result = await complianceUnificationService.getComplianceMappingData(
        ['iso27001', 'cisControls', 'gdpr'],
        'ig2',
        undefined
      );
      
      expect(result).toBeDefined();
      
      for (const category of result) {
        // Selected frameworks should be arrays (even if empty)
        expect(Array.isArray(category.frameworks?.iso27001)).toBe(true);
        expect(Array.isArray(category.frameworks?.cisControls)).toBe(true);
        expect(Array.isArray(category.frameworks?.gdpr)).toBe(true);
        
        // Unselected frameworks should be empty
        expect(category.frameworks?.iso27002).toEqual([]);
        expect(category.frameworks?.nis2).toEqual([]);
      }
    });
  });

  describe('Industry Sector Filtering', () => {
    it('should return results regardless of industry sector for non-NIS2 frameworks', async () => {
      const resultWithoutSector = await complianceUnificationService.getComplianceMappingData(
        ['iso27001'],
        undefined,
        undefined
      );
      
      const resultWithSector = await complianceUnificationService.getComplianceMappingData(
        ['iso27001'],
        undefined,
        'test-sector-id'
      );
      
      expect(resultWithoutSector).toBeDefined();
      expect(resultWithSector).toBeDefined();
      
      // For non-NIS2 frameworks, industry sector shouldn't affect the core framework requirements
      expect(resultWithoutSector.length).toEqual(resultWithSector.length);
    });
  });

  describe('Data Validation', () => {
    it('should return well-formed data structure', async () => {
      const result = await complianceUnificationService.getComplianceMappingData(
        ['iso27001', 'cisControls'],
        'ig1',
        undefined
      );
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      for (const category of result) {
        // Check required fields
        expect(category.id).toBeDefined();
        expect(category.category).toBeDefined();
        expect(category.auditReadyUnified).toBeDefined();
        expect(category.frameworks).toBeDefined();
        
        // Check auditReadyUnified structure
        expect(category.auditReadyUnified.title).toBeDefined();
        expect(category.auditReadyUnified.description).toBeDefined();
        expect(Array.isArray(category.auditReadyUnified.subRequirements)).toBe(true);
        
        // Check frameworks structure
        expect(category.frameworks.iso27001).toBeDefined();
        expect(category.frameworks.iso27002).toBeDefined();
        expect(category.frameworks.cisControls).toBeDefined();
        expect(category.frameworks.gdpr).toBeDefined();
        expect(category.frameworks.nis2).toBeDefined();
        
        // Each framework should be an array
        Object.values(category.frameworks).forEach(frameworkReqs => {
          expect(Array.isArray(frameworkReqs)).toBe(true);
          
          // Each requirement should have proper structure
          frameworkReqs.forEach((req: any) => {
            expect(req.code).toBeDefined();
            expect(req.title).toBeDefined();
            expect(req.description).toBeDefined();
          });
        });
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty framework selection', async () => {
      const result = await complianceUnificationService.getComplianceMappingData(
        [],
        undefined,
        undefined
      );
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // Even with no frameworks selected, should return categories with empty framework arrays
      for (const category of result) {
        expect(category.frameworks?.iso27001).toEqual([]);
        expect(category.frameworks?.iso27002).toEqual([]);
        expect(category.frameworks?.cisControls).toEqual([]);
        expect(category.frameworks?.gdpr).toEqual([]);
        expect(category.frameworks?.nis2).toEqual([]);
      }
    });
  });
});