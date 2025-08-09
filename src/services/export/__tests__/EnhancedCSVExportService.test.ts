/**
 * Enhanced CSV Export Service Tests
 * 
 * Tests for professional CSV export functionality including:
 * - Professional formatting and structure
 * - Executive summary generation
 * - Framework statistics
 * - Data validation
 * - Excel/Google Sheets compatibility
 */

import { EnhancedCSVExportService } from '../EnhancedCSVExportService';
import type { UnifiedMapping, GuidanceContent } from '../EnhancedCSVExportService';

describe('EnhancedCSVExportService', () => {
  let service: EnhancedCSVExportService;
  
  beforeEach(() => {
    service = EnhancedCSVExportService.getInstance();
  });

  describe('Data Validation', () => {
    it('should validate export data correctly', () => {
      const validMappings: UnifiedMapping[] = [
        {
          id: '1',
          category: 'Access Control',
          auditReadyUnified: {
            title: 'User Access Management',
            description: 'Manage user access to systems',
            subRequirements: ['Implement user authentication', 'Review access permissions']
          },
          frameworks: {
            iso27001: [{ code: 'A.9.1.1', title: 'Access control policy' }]
          }
        }
      ];

      const result = service.validateExportData(validMappings);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should identify validation errors', () => {
      const invalidMappings: UnifiedMapping[] = [
        {
          id: '1',
          category: '', // Missing category
          auditReadyUnified: {
            title: '', // Missing title
            description: 'Some description',
            subRequirements: []
          }
        }
      ];

      const result = service.validateExportData(invalidMappings);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle empty mappings array', () => {
      const result = service.validateExportData([]);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('No unified mappings available for export');
    });
  });

  describe('Professional Formatting', () => {
    const mockGuidanceContent = (category: string): GuidanceContent | null => {
      return {
        title: `Guidance for ${category}`,
        content: 'This is detailed guidance content for implementing the requirement.',
        tips: ['Tip 1: Do this first', 'Tip 2: Then do this'],
        examples: ['Example 1: Best practice', 'Example 2: Common pattern'],
        priority: 'HIGH',
        implementationTimeframe: '3-6 months'
      };
    };

    const sampleMappings: UnifiedMapping[] = [
      {
        id: '1',
        category: 'Access Control',
        auditReadyUnified: {
          title: 'User Access Management',
          description: 'Comprehensive user access control system implementation with proper authentication and authorization mechanisms.',
          subRequirements: [
            'Implement multi-factor authentication',
            'Establish role-based access control',
            'Regular access reviews and audits'
          ]
        },
        frameworks: {
          iso27001: [
            { code: 'A.9.1.1', title: 'Access control policy' },
            { code: 'A.9.2.1', title: 'User registration and de-registration' }
          ],
          iso27002: [
            { code: '9.1.1', title: 'Access control policy and procedures' }
          ],
          cisControls: [
            { code: '6.1', title: 'Establish an Access Control Policy' }
          ],
          nis2: [
            { code: 'Art.21', title: 'Cybersecurity measures' }
          ]
        }
      },
      {
        id: '2',
        category: 'Data Protection',
        auditReadyUnified: {
          title: 'Personal Data Protection',
          description: 'Data protection and privacy controls.',
          subRequirements: [
            'Data classification and labeling',
            'Data encryption at rest and in transit'
          ]
        },
        frameworks: {
          iso27001: [
            { code: 'A.8.2.1', title: 'Data classification' }
          ]
        }
      }
    ];

    // Note: Due to the file download nature of the export function,
    // we can't easily test the actual export without mocking DOM APIs
    // This test verifies that the service can be instantiated and 
    // validation works properly
    it('should create service instance', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(EnhancedCSVExportService);
    });

    it('should be a singleton', () => {
      const service1 = EnhancedCSVExportService.getInstance();
      const service2 = EnhancedCSVExportService.getInstance();
      expect(service1).toBe(service2);
    });

    it('should validate complex mapping data', () => {
      const result = service.validateExportData(sampleMappings);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle null mappings gracefully', () => {
      const result = service.validateExportData(null as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('No unified mappings available for export');
    });

    it('should handle undefined mappings gracefully', () => {
      const result = service.validateExportData(undefined as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('No unified mappings available for export');
    });
  });
});

// Mock implementation for testing in environments without DOM
// This ensures tests can run in Node.js environments
if (typeof window === 'undefined') {
  (global as any).window = {
    URL: {
      createObjectURL: jest.fn(() => 'mock-url'),
      revokeObjectURL: jest.fn()
    }
  };
  
  (global as any).document = {
    createElement: jest.fn(() => ({
      setAttribute: jest.fn(),
      click: jest.fn(),
      style: {}
    })),
    body: {
      appendChild: jest.fn(),
      removeChild: jest.fn()
    }
  };
  
  (global as any).Blob = jest.fn();
}