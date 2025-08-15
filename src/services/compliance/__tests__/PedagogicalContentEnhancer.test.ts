/**
 * Test suite for PedagogicalContentEnhancer
 * Validates enhanced content generation functionality
 */

import { PedagogicalContentEnhancer } from '../PedagogicalContentEnhancer';

describe('PedagogicalContentEnhancer', () => {
  describe('enhanceRequirement', () => {
    it('should enhance data classification requirement with detailed implementation guidance', () => {
      const basicText = 'Data classification with 4-tier model and automated discovery';
      const category = 'Data Protection';
      const index = 0;

      const result = PedagogicalContentEnhancer.enhanceRequirement(basicText, category, index);

      expect(result.letter).toBe('a)');
      expect(result.title).toContain('Classification');
      expect(result.overview).toContain('comprehensive 4-tier data classification system');
      expect(result.howToImplement).toHaveLength(6);
      expect(result.howToImplement[0]).toContain('Define Classification Schema');
      expect(result.timeline).toContain('Phase 1');
      expect(result.metrics.length).toBeGreaterThan(0);
      expect(result.tools.length).toBeGreaterThan(0);
      expect(result.examples.length).toBeGreaterThan(0);
      expect(result.commonPitfalls.length).toBeGreaterThan(0);
      expect(result.bestPractices.length).toBeGreaterThan(0);
    });

    it('should enhance MFA requirement with comprehensive implementation steps', () => {
      const basicText = 'Multi-factor authentication for all privileged accounts';
      const category = 'Access Control & Identity Management';
      const index = 1;

      const result = PedagogicalContentEnhancer.enhanceRequirement(basicText, category, index);

      expect(result.letter).toBe('b)');
      expect(result.title).toContain('Multi-Factor Authentication');
      expect(result.howToImplement.length).toBeGreaterThan(5);
      expect(result.timeline).toContain('Week 1');
      expect(result.tools).toContain('Microsoft Authenticator (enterprise integration)');
      expect(result.examples.some(example => example.includes('Finance Firm'))).toBe(true);
    });

    it('should enhance incident response requirement with regulatory compliance details', () => {
      const basicText = 'Immediate response within 0-1 hours with incident team activation';
      const category = 'Incident Response & Recovery';
      const index = 0;

      const result = PedagogicalContentEnhancer.enhanceRequirement(basicText, category, index);

      expect(result.title).toContain('Immediate Incident Response');
      expect(result.overview).toContain('GDPR 72-hour and NIS2 24-hour');
      expect(result.metrics.some(metric => metric.includes('30 minutes'))).toBe(true);
      expect(result.tools.some(tool => tool.includes('SOAR'))).toBe(true);
    });

    it('should handle generic requirements with standard enhancement', () => {
      const basicText = 'Security monitoring and logging procedures';
      const category = 'Monitoring & Logging';
      const index = 2;

      const result = PedagogicalContentEnhancer.enhanceRequirement(basicText, category, index);

      expect(result.letter).toBe('c)');
      expect(result.title).toBe('Security monitoring and logging procedures');
      expect(result.howToImplement).toHaveLength(4);
      expect(result.timeline).toContain('Month 1');
    });
  });

  describe('formatEnhancedRequirement', () => {
    it('should format enhanced requirement with all sections', () => {
      const basicText = 'Test requirement';
      const category = 'Test Category';
      const index = 0;

      const enhanced = PedagogicalContentEnhancer.enhanceRequirement(basicText, category, index);
      const formatted = PedagogicalContentEnhancer.formatEnhancedRequirement(enhanced);

      expect(formatted).toContain('a) **');
      expect(formatted).toContain('🔧 HOW TO IMPLEMENT:');
      expect(formatted).toContain('⏱️ TIMELINE:');
      expect(formatted).toContain('📊 SUCCESS METRICS:');
      expect(formatted).toContain('🛠️ RECOMMENDED TOOLS:');
      expect(formatted).toContain('💡 REAL-WORLD EXAMPLES:');
      expect(formatted).toContain('⚠️ COMMON PITFALLS TO AVOID:');
      expect(formatted).toContain('✅ BEST PRACTICES:');
    });
  });

  describe('extractTitle', () => {
    it('should extract title from requirement text', () => {
      const enhancer = PedagogicalContentEnhancer as any;
      
      expect(enhancer.extractTitle('Data classification with automated discovery: Implement comprehensive system')).toBe('Data classification with automated discovery');
      expect(enhancer.extractTitle('Multi-factor authentication. Deploy across all systems')).toBe('Multi-factor authentication');
      expect(enhancer.extractTitle('Risk assessment and management procedures')).toBe('Risk assessment and management procedures');
    });
  });
});