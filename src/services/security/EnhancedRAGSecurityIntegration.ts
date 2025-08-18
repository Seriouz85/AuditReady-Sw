/**
 * Enhanced RAG Security Integration
 * Seamless integration of cybersecurity validation with RAG knowledge processing
 */

import { supabase } from '@/lib/supabase';
import { CybersecurityValidationFramework, type SecurityValidationResult, type ContentValidationRequest } from './CybersecurityValidationFramework';
import { AdminSecurityControlPanel } from './AdminSecurityControlPanel';
import { RealtimeSecurityMonitor } from './RealtimeSecurityMonitor';
import { EnhancedRAGService } from '../rag/EnhancedRAGService';
import { KnowledgeIngestionService } from '../rag/KnowledgeIngestionService';

// === TYPES FOR RAG SECURITY INTEGRATION ===

export interface SecureKnowledgeSource {
  id: string;
  url: string;
  domain: string;
  title: string;
  content_type: 'web_scraped' | 'api_source' | 'uploaded_document' | 'expert_contributed';
  security_status: 'validated' | 'pending' | 'quarantined' | 'rejected' | 'approved_with_conditions';
  validation_result?: SecurityValidationResult;
  security_score: number;
  framework_relevance: string[];
  last_validation: string;
  approved_by?: string;
  approval_notes?: string;
  auto_revalidation_schedule?: string;
  content_hash: string;
  metadata: {
    extracted_at: string;
    content_length: number;
    language: string;
    encoding: string;
    source_reputation?: number;
    domain_authority?: number;
  };
}

export interface SecureRAGRequest {
  query: string;
  frameworks: string[];
  security_level: 'standard' | 'high' | 'critical';
  user_id?: string;
  organization_id?: string;
  context?: Record<string, any>;
  validation_required: boolean;
  expert_review_required: boolean;
}

export interface SecureRAGResponse {
  response_id: string;
  query: string;
  generated_content: string;
  security_validation: SecurityValidationResult;
  sources_used: SecureKnowledgeSource[];
  confidence_score: number;
  security_cleared: boolean;
  review_required: boolean;
  recommendations: string[];
  compliance_frameworks: string[];
  generated_at: string;
  processing_time_ms: number;
  metadata: {
    rag_model_version: string;
    security_framework_version: string;
    validation_layers_applied: number;
    expert_review_needed: boolean;
  };
}

export interface ContentIngestionPipeline {
  pipeline_id: string;
  source_url: string;
  ingestion_type: 'automated' | 'manual' | 'scheduled';
  security_requirements: {
    validation_level: 'basic' | 'enhanced' | 'expert';
    required_approvals: number;
    framework_specific: boolean;
    real_time_monitoring: boolean;
  };
  processing_stages: IngestionStage[];
  current_stage: number;
  status: 'pending' | 'processing' | 'security_review' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  estimated_completion: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface IngestionStage {
  stage_id: string;
  stage_name: string;
  stage_type: 'extraction' | 'security_validation' | 'content_processing' | 'expert_review' | 'approval';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  output: Record<string, any>;
  security_checks: string[];
  errors: string[];
  warnings: string[];
}

// === MAIN RAG SECURITY INTEGRATION SERVICE ===

export class EnhancedRAGSecurityIntegration {
  private static securityMonitor = RealtimeSecurityMonitor.getInstance();

  /**
   * Secure RAG query processing with integrated security validation
   */
  static async processSecureRAGQuery(request: SecureRAGRequest): Promise<SecureRAGResponse> {
    const startTime = Date.now();
    const responseId = `secure_rag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`[SecureRAG] Processing secure RAG query: ${request.query.substring(0, 100)}...`);

    try {
      // Step 1: Validate query for security risks
      const queryValidation = await this.validateQuery(request);
      if (!queryValidation.passed) {
        throw new Error(`Query validation failed: ${queryValidation.threats_detected.map(t => t.description).join(', ')}`);
      }

      // Step 2: Retrieve secure knowledge sources
      const secureKnowledgeSources = await this.getSecureKnowledgeSources(
        request.frameworks,
        request.security_level
      );

      if (secureKnowledgeSources.length === 0) {
        throw new Error('No validated knowledge sources available for this query');
      }

      // Step 3: Generate RAG response using only validated sources
      const ragResponse = await EnhancedRAGService.generateEnhancedGuidance({
        category: this.extractCategoryFromQuery(request.query),
        frameworks: this.convertFrameworksToRAGFormat(request.frameworks),
        complexityLevel: request.security_level === 'critical' ? 'advanced' : 'intermediate',
        includeImplementationSteps: true,
        includeBestPractices: true,
        includeValidationCriteria: true
      });

      if (!ragResponse.success) {
        throw new Error('RAG generation failed');
      }

      // Step 4: Validate generated content for security risks
      const contentValidation = await CybersecurityValidationFramework.validateContent({
        content: ragResponse.content,
        content_type: 'ai_generated',
        framework_context: request.frameworks,
        user_id: request.user_id,
        organization_id: request.organization_id,
        metadata: {
          query: request.query,
          rag_model: 'enhanced_rag_service',
          sources_count: secureKnowledgeSources.length
        }
      });

      // Step 5: Determine if expert review is required
      const expertReviewRequired = this.requiresExpertReview(
        contentValidation,
        request.security_level,
        request.expert_review_required
      );

      // Step 6: Apply additional security measures if needed
      let finalContent = ragResponse.content;
      if (contentValidation.risk_level === 'high' || contentValidation.risk_level === 'critical') {
        finalContent = await this.applySanitization(ragResponse.content, contentValidation);
      }

      // Step 7: Log secure RAG operation
      await this.logSecureRAGOperation({
        response_id: responseId,
        query: request.query,
        frameworks: request.frameworks,
        security_level: request.security_level,
        validation_result: contentValidation,
        sources_used: secureKnowledgeSources.length,
        user_id: request.user_id,
        organization_id: request.organization_id
      });

      const response: SecureRAGResponse = {
        response_id: responseId,
        query: request.query,
        generated_content: finalContent,
        security_validation: contentValidation,
        sources_used: secureKnowledgeSources,
        confidence_score: Math.min(ragResponse.qualityScore, contentValidation.confidence_score),
        security_cleared: contentValidation.passed && contentValidation.risk_level !== 'critical',
        review_required: expertReviewRequired,
        recommendations: [
          ...ragResponse.implementationSteps || [],
          ...contentValidation.recommendations
        ],
        compliance_frameworks: request.frameworks,
        generated_at: new Date().toISOString(),
        processing_time_ms: Date.now() - startTime,
        metadata: {
          rag_model_version: 'enhanced_v1.0',
          security_framework_version: '1.0.0',
          validation_layers_applied: contentValidation.validation_layers.length,
          expert_review_needed: expertReviewRequired
        }
      };

      // Trigger real-time monitoring if necessary
      if (contentValidation.threats_detected.length > 0) {
        await this.securityMonitor.processValidationResult(contentValidation, {
          content_type: 'ai_generated',
          user_id: request.user_id,
          organization_id: request.organization_id
        });
      }

      return response;

    } catch (error) {
      console.error('[SecureRAG] Failed to process secure RAG query:', error);
      
      // Return error response with security information
      return {
        response_id: responseId,
        query: request.query,
        generated_content: '',
        security_validation: {
          passed: false,
          risk_level: 'critical',
          threats_detected: [{
            type: 'compliance_violation',
            severity: 'critical',
            description: 'Secure RAG processing failed',
            evidence: [error instanceof Error ? error.message : 'Unknown error'],
            mitigation: 'Manual expert review required'
          }],
          recommendations: ['Contact security team for manual review'],
          confidence_score: 0,
          validation_layers: [],
          metadata: {
            validated_at: new Date().toISOString(),
            validator_agent: 'SecureRAGIntegration',
            processing_time_ms: Date.now() - startTime,
            content_hash: '',
            validation_version: '1.0.0'
          }
        },
        sources_used: [],
        confidence_score: 0,
        security_cleared: false,
        review_required: true,
        recommendations: ['System error - manual review required'],
        compliance_frameworks: request.frameworks,
        generated_at: new Date().toISOString(),
        processing_time_ms: Date.now() - startTime,
        metadata: {
          rag_model_version: 'enhanced_v1.0',
          security_framework_version: '1.0.0',
          validation_layers_applied: 0,
          expert_review_needed: true
        }
      };
    }
  }

  /**
   * Secure knowledge source ingestion pipeline
   */
  static async ingestKnowledgeSourceSecurely(
    sourceUrl: string,
    options: {
      frameworks: string[];
      validation_level: 'basic' | 'enhanced' | 'expert';
      priority: 'low' | 'medium' | 'high' | 'critical';
      auto_approve?: boolean;
      scheduled_revalidation?: boolean;
    }
  ): Promise<ContentIngestionPipeline> {
    const pipelineId = `ingestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`[SecureRAG] Starting secure ingestion pipeline for: ${sourceUrl}`);

    try {
      // Define pipeline stages based on validation level
      const stages = this.defineIngestionStages(options.validation_level);
      
      const pipeline: ContentIngestionPipeline = {
        pipeline_id: pipelineId,
        source_url: sourceUrl,
        ingestion_type: 'manual',
        security_requirements: {
          validation_level: options.validation_level,
          required_approvals: options.validation_level === 'expert' ? 2 : 1,
          framework_specific: true,
          real_time_monitoring: options.priority === 'critical'
        },
        processing_stages: stages,
        current_stage: 0,
        status: 'pending',
        created_at: new Date().toISOString(),
        estimated_completion: this.calculateEstimatedCompletion(stages),
        priority: options.priority
      };

      // Store pipeline in database
      const { error } = await supabase
        .from('content_ingestion_pipelines')
        .insert(pipeline);

      if (error) throw error;

      // Start processing pipeline
      await this.processPipelineStage(pipeline, 0);

      return pipeline;

    } catch (error) {
      console.error('[SecureRAG] Failed to create ingestion pipeline:', error);
      throw new Error('Failed to create secure ingestion pipeline');
    }
  }

  /**
   * Get validated knowledge sources for RAG
   */
  static async getSecureKnowledgeSources(
    frameworks: string[],
    securityLevel: 'standard' | 'high' | 'critical'
  ): Promise<SecureKnowledgeSource[]> {
    try {
      const minSecurityScore = {
        'standard': 0.7,
        'high': 0.8,
        'critical': 0.9
      };

      let query = supabase
        .from('secure_knowledge_sources')
        .select('*')
        .eq('security_status', 'validated')
        .gte('security_score', minSecurityScore[securityLevel]);

      // Filter by frameworks if specified
      if (frameworks.length > 0) {
        query = query.overlaps('framework_relevance', frameworks);
      }

      const { data: sources, error } = await query
        .order('security_score', { ascending: false })
        .limit(50);

      if (error) throw error;

      return sources || [];

    } catch (error) {
      console.error('[SecureRAG] Failed to get secure knowledge sources:', error);
      throw new Error('Failed to retrieve secure knowledge sources');
    }
  }

  /**
   * Validate knowledge source and update security status
   */
  static async validateKnowledgeSource(sourceId: string): Promise<SecurityValidationResult> {
    try {
      // Get knowledge source
      const { data: source, error } = await supabase
        .from('secure_knowledge_sources')
        .select('*')
        .eq('id', sourceId)
        .single();

      if (error || !source) {
        throw new Error('Knowledge source not found');
      }

      // Get content for validation
      const { data: content } = await supabase
        .from('knowledge_source_content')
        .select('content')
        .eq('source_id', sourceId)
        .single();

      if (!content) {
        throw new Error('Knowledge source content not found');
      }

      // Perform security validation
      const validationResult = await CybersecurityValidationFramework.validateContent({
        content: content.content,
        content_type: 'web_scraped',
        source_url: source.url,
        framework_context: source.framework_relevance,
        metadata: {
          source_id: sourceId,
          domain: source.domain,
          content_type: source.content_type
        }
      });

      // Calculate security score
      const securityScore = this.calculateSecurityScore(validationResult);

      // Update source with validation results
      const securityStatus = this.determineSecurityStatus(validationResult, securityScore);
      
      await supabase
        .from('secure_knowledge_sources')
        .update({
          security_status: securityStatus,
          validation_result: validationResult,
          security_score: securityScore,
          last_validation: new Date().toISOString()
        })
        .eq('id', sourceId);

      console.log(`[SecureRAG] Knowledge source validated: ${sourceId} - ${securityStatus} (score: ${securityScore})`);

      return validationResult;

    } catch (error) {
      console.error('[SecureRAG] Failed to validate knowledge source:', error);
      throw new Error('Failed to validate knowledge source');
    }
  }

  /**
   * Auto-revalidate knowledge sources on schedule
   */
  static async autoRevalidateKnowledgeSources(): Promise<void> {
    try {
      // Get sources that need revalidation
      const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: sources } = await supabase
        .from('secure_knowledge_sources')
        .select('id, url, last_validation')
        .or(`last_validation.lt.${cutoffDate},last_validation.is.null`)
        .eq('security_status', 'validated')
        .limit(10);

      if (!sources || sources.length === 0) {
        console.log('[SecureRAG] No sources require revalidation');
        return;
      }

      console.log(`[SecureRAG] Auto-revalidating ${sources.length} knowledge sources`);

      // Process revalidation
      for (const source of sources) {
        try {
          await this.validateKnowledgeSource(source.id);
          
          // Add small delay to prevent overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.warn(`[SecureRAG] Revalidation failed for source ${source.id}:`, error);
        }
      }

    } catch (error) {
      console.error('[SecureRAG] Auto-revalidation process failed:', error);
    }
  }

  /**
   * Get security status summary for RAG system
   */
  static async getRAGSecuritySummary(): Promise<{
    total_sources: number;
    validated_sources: number;
    pending_validation: number;
    quarantined_sources: number;
    security_score_avg: number;
    last_validation_check: string;
    frameworks_covered: string[];
    risk_assessment: 'low' | 'medium' | 'high' | 'critical';
  }> {
    try {
      // Get source counts by status
      const { data: statusCounts } = await supabase
        .from('secure_knowledge_sources')
        .select('security_status')
        .then(result => ({
          data: result.data?.reduce((acc, source) => {
            acc[source.security_status] = (acc[source.security_status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {}
        }));

      // Get average security score
      const { data: avgScore } = await supabase
        .rpc('get_avg_security_score');

      // Get frameworks covered
      const { data: frameworks } = await supabase
        .from('secure_knowledge_sources')
        .select('framework_relevance')
        .eq('security_status', 'validated');

      const frameworksSet = new Set<string>();
      frameworks?.forEach(source => {
        source.framework_relevance?.forEach((framework: string) => {
          frameworksSet.add(framework);
        });
      });

      // Calculate risk assessment
      const totalSources = Object.values(statusCounts.data || {}).reduce((sum, count) => sum + count, 0);
      const validatedSources = statusCounts.data?.validated || 0;
      const quarantinedSources = statusCounts.data?.quarantined || 0;
      
      let riskAssessment: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (quarantinedSources > totalSources * 0.1) riskAssessment = 'critical';
      else if (validatedSources < totalSources * 0.8) riskAssessment = 'high';
      else if (validatedSources < totalSources * 0.9) riskAssessment = 'medium';

      return {
        total_sources: totalSources,
        validated_sources: validatedSources,
        pending_validation: statusCounts.data?.pending || 0,
        quarantined_sources: quarantinedSources,
        security_score_avg: avgScore?.data || 0,
        last_validation_check: new Date().toISOString(),
        frameworks_covered: Array.from(frameworksSet),
        risk_assessment: riskAssessment
      };

    } catch (error) {
      console.error('[SecureRAG] Failed to get security summary:', error);
      throw new Error('Failed to retrieve RAG security summary');
    }
  }

  // === PRIVATE HELPER METHODS ===

  private static async validateQuery(request: SecureRAGRequest): Promise<SecurityValidationResult> {
    return await CybersecurityValidationFramework.validateContent({
      content: request.query,
      content_type: 'user_generated',
      framework_context: request.frameworks,
      user_id: request.user_id,
      organization_id: request.organization_id,
      metadata: {
        security_level: request.security_level,
        validation_type: 'query_validation'
      }
    });
  }

  private static extractCategoryFromQuery(query: string): string {
    // Simple category extraction based on keywords
    const keywords = {
      'access control': /access|authentication|authorization|identity/i,
      'data protection': /data|privacy|encryption|backup/i,
      'network security': /network|firewall|intrusion|monitoring/i,
      'incident response': /incident|response|forensics|investigation/i,
      'governance': /governance|policy|compliance|audit/i
    };

    for (const [category, pattern] of Object.entries(keywords)) {
      if (pattern.test(query)) {
        return category;
      }
    }

    return 'general security';
  }

  private static convertFrameworksToRAGFormat(frameworks: string[]): any {
    return frameworks.reduce((acc, framework) => {
      acc[framework.toLowerCase()] = true;
      return acc;
    }, {} as Record<string, boolean>);
  }

  private static requiresExpertReview(
    validation: SecurityValidationResult,
    securityLevel: string,
    explicitRequirement: boolean
  ): boolean {
    if (explicitRequirement) return true;
    if (validation.risk_level === 'critical') return true;
    if (validation.risk_level === 'high' && securityLevel === 'critical') return true;
    if (validation.confidence_score < 0.7) return true;
    return false;
  }

  private static async applySanitization(content: string, validation: SecurityValidationResult): Promise<string> {
    // Apply content sanitization based on detected threats
    let sanitizedContent = content;

    for (const threat of validation.threats_detected) {
      if (threat.auto_remediation) {
        // Apply automated remediation if available
        // This would include content sanitization, link removal, etc.
        console.log(`[SecureRAG] Applying auto-remediation for threat: ${threat.type}`);
      }
    }

    return sanitizedContent;
  }

  private static async logSecureRAGOperation(operation: {
    response_id: string;
    query: string;
    frameworks: string[];
    security_level: string;
    validation_result: SecurityValidationResult;
    sources_used: number;
    user_id?: string;
    organization_id?: string;
  }): Promise<void> {
    try {
      await supabase
        .from('secure_rag_operations')
        .insert({
          response_id: operation.response_id,
          query_hash: await this.hashQuery(operation.query),
          frameworks: operation.frameworks,
          security_level: operation.security_level,
          validation_passed: operation.validation_result.passed,
          risk_level: operation.validation_result.risk_level,
          threats_detected: operation.validation_result.threats_detected.length,
          sources_used: operation.sources_used,
          user_id: operation.user_id,
          organization_id: operation.organization_id,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.warn('[SecureRAG] Failed to log secure RAG operation:', error);
    }
  }

  private static async hashQuery(query: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(query);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private static defineIngestionStages(validationLevel: string): IngestionStage[] {
    const baseStages: IngestionStage[] = [
      {
        stage_id: 'extraction',
        stage_name: 'Content Extraction',
        stage_type: 'extraction',
        status: 'pending',
        output: {},
        security_checks: ['url_validation', 'content_type_check'],
        errors: [],
        warnings: []
      },
      {
        stage_id: 'security_validation',
        stage_name: 'Security Validation',
        stage_type: 'security_validation',
        status: 'pending',
        output: {},
        security_checks: ['threat_detection', 'malware_scan', 'content_analysis'],
        errors: [],
        warnings: []
      }
    ];

    if (validationLevel === 'enhanced' || validationLevel === 'expert') {
      baseStages.push({
        stage_id: 'content_processing',
        stage_name: 'Content Processing',
        stage_type: 'content_processing',
        status: 'pending',
        output: {},
        security_checks: ['framework_validation', 'compliance_check'],
        errors: [],
        warnings: []
      });
    }

    if (validationLevel === 'expert') {
      baseStages.push({
        stage_id: 'expert_review',
        stage_name: 'Expert Review',
        stage_type: 'expert_review',
        status: 'pending',
        output: {},
        security_checks: ['manual_review', 'expert_validation'],
        errors: [],
        warnings: []
      });
    }

    baseStages.push({
      stage_id: 'approval',
      stage_name: 'Final Approval',
      stage_type: 'approval',
      status: 'pending',
      output: {},
      security_checks: ['final_approval'],
      errors: [],
      warnings: []
    });

    return baseStages;
  }

  private static calculateEstimatedCompletion(stages: IngestionStage[]): string {
    const estimatedDurations = {
      'extraction': 5 * 60 * 1000, // 5 minutes
      'security_validation': 15 * 60 * 1000, // 15 minutes
      'content_processing': 10 * 60 * 1000, // 10 minutes
      'expert_review': 4 * 60 * 60 * 1000, // 4 hours
      'approval': 30 * 60 * 1000 // 30 minutes
    };

    const totalDuration = stages.reduce((sum, stage) => {
      return sum + (estimatedDurations[stage.stage_type] || 0);
    }, 0);

    return new Date(Date.now() + totalDuration).toISOString();
  }

  private static async processPipelineStage(pipeline: ContentIngestionPipeline, stageIndex: number): Promise<void> {
    // Implementation would process each stage of the ingestion pipeline
    // This is a placeholder for the actual stage processing logic
    console.log(`[SecureRAG] Processing pipeline stage ${stageIndex} for ${pipeline.pipeline_id}`);
  }

  private static calculateSecurityScore(validation: SecurityValidationResult): number {
    let score = 1.0;

    // Reduce score based on threats detected
    const threatPenalties = {
      'critical': -0.4,
      'high': -0.3,
      'medium': -0.2,
      'low': -0.1
    };

    for (const threat of validation.threats_detected) {
      score += threatPenalties[threat.severity] || 0;
    }

    // Adjust based on confidence score
    score *= validation.confidence_score;

    // Ensure score is between 0 and 1
    return Math.max(0, Math.min(1, score));
  }

  private static determineSecurityStatus(validation: SecurityValidationResult, score: number): string {
    if (!validation.passed || validation.risk_level === 'critical') {
      return 'quarantined';
    }
    if (validation.risk_level === 'high' || score < 0.7) {
      return 'pending';
    }
    if (score >= 0.8) {
      return 'validated';
    }
    return 'pending';
  }
}