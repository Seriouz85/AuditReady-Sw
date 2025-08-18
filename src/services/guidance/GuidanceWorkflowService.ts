/**
 * Guidance Workflow Service
 * Manages the full lifecycle of AI-enhanced unified guidance content
 * Integrates with existing EnhancedUnifiedGuidanceService while adding workflow capabilities
 */

import { supabase } from '@/lib/supabase';
import { EnhancedUnifiedGuidanceService } from '../compliance/EnhancedUnifiedGuidanceService';
import { RAGGenerationService } from '../rag/RAGGenerationService';

export interface GuidanceVersion {
  id: string;
  unifiedRequirementId: string;
  versionNumber: number;
  contentBlocks: GuidanceBlock[];
  frameworkConditions: Record<string, boolean>;
  status: 'draft' | 'in_review' | 'approved' | 'published' | 'archived';
  workflowStage: 'editing' | 'review' | 'approval' | 'publishing';
  wordCount: number;
  rowCount: number;
  lintScore: number;
  readabilityScore: number;
  createdBy: string;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  publishedBy?: string;
  publishedAt?: string;
  aiSuggestionsCount: number;
  aiApprovedCount: number;
  aiConfidenceAvg: number;
  lastAiEnhancement?: string;
}

export interface GuidanceBlock {
  id: string;
  versionId: string;
  blockType: 'intro' | 'baseline' | 'conditional' | 'operational_excellence';
  blockOrder: number;
  subRequirementLetter?: string;
  content: string;
  frameworkConditions: Record<string, boolean>;
  citations: Citation[];
  lintViolations: LintViolation[];
  styleScore: number;
  aiGenerated: boolean;
  aiConfidence?: number;
  aiRationale?: string;
  aiModelVersion?: string;
}

export interface Citation {
  id: string;
  knowledgeContentId: string;
  citationText: string;
  pageNumber?: number;
  sectionReference?: string;
  relevanceScore: number;
  contextBefore?: string;
  contextAfter?: string;
}

export interface AISuggestion {
  id: string;
  unifiedRequirementId: string;
  targetVersionId: string;
  suggestionType: 'addition' | 'replacement' | 'enhancement' | 'compression';
  targetBlockId?: string;
  originalContent?: string;
  suggestedContent: string;
  rationale: string;
  confidenceScore: number;
  impactLabel: 'clarity' | 'completeness' | 'duplication_reduction' | 'compliance' | 'style';
  citations: Citation[];
  sourceChunks: string[];
  status: 'pending' | 'approved' | 'rejected' | 'superseded';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewerNotes?: string;
  createdAt: string;
  createdByAiModel: string;
  processingTimeMs?: number;
  tokenUsage?: Record<string, number>;
}

export interface LintViolation {
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  line?: number;
  suggestion?: string;
}

export interface WorkflowTransition {
  id: string;
  versionId: string;
  fromStatus: string;
  toStatus: string;
  fromStage: string;
  toStage: string;
  actorId: string;
  actorRole: 'editor' | 'reviewer' | 'publisher' | 'admin' | 'system';
  changeSummary: string;
  rationale?: string;
  blocksAffected: number;
  suggestionsProcessed: number;
  transitionAt: string;
  metadata: Record<string, any>;
}

export class GuidanceWorkflowService {
  
  /**
   * Get versioned guidance content (integrates with existing system)
   * Falls back to legacy EnhancedUnifiedGuidanceService for backwards compatibility
   */
  static async getGuidanceContent(
    categoryId: string,
    version: 'draft' | 'published' | number = 'published',
    selectedFrameworks: Record<string, boolean | string> = {}
  ): Promise<{
    content: string;
    version?: GuidanceVersion;
    citations: Citation[];
    isVersioned: boolean;
  }> {
    try {
      // Try to get versioned content first
      const versionedContent = await this.getVersionedGuidance(categoryId, version, selectedFrameworks);
      
      if (versionedContent) {
        return {
          content: this.renderGuidanceContent(versionedContent, selectedFrameworks),
          version: versionedContent,
          citations: this.extractCitations(versionedContent),
          isVersioned: true
        };
      }
      
      // Fallback to legacy system for backwards compatibility
      console.log(`[GuidanceWorkflow] No versioned content found for ${categoryId}, falling back to legacy system`);
      const legacyContent = await EnhancedUnifiedGuidanceService.getEnhancedGuidance(
        categoryId,
        selectedFrameworks
      );
      
      return {
        content: legacyContent,
        citations: [],
        isVersioned: false
      };
      
    } catch (error) {
      console.error('[GuidanceWorkflow] Error getting guidance content:', error);
      // Ultimate fallback to legacy system
      const legacyContent = await EnhancedUnifiedGuidanceService.getEnhancedGuidance(
        categoryId,
        selectedFrameworks
      );
      
      return {
        content: legacyContent,
        citations: [],
        isVersioned: false
      };
    }
  }
  
  /**
   * Get specific versioned guidance
   */
  static async getVersionedGuidance(
    categoryId: string,
    version: 'draft' | 'published' | number = 'published',
    selectedFrameworks: Record<string, boolean | string> = {}
  ): Promise<GuidanceVersion | null> {
    try {
      // First get the unified requirement for this category
      const { data: requirement } = await supabase
        .from('unified_requirements')
        .select('id')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .single();
      
      if (!requirement) {
        console.log(`[GuidanceWorkflow] No unified requirement found for category ${categoryId}`);
        return null;
      }
      
      let query = supabase
        .from('guidance_versions')
        .select(`
          *,
          guidance_blocks (
            *,
            citations (*)
          )
        `)
        .eq('unified_requirement_id', requirement.id);
      
      // Apply version filter
      if (version === 'draft') {
        query = query.eq('status', 'draft').order('version_number', { ascending: false });
      } else if (version === 'published') {
        query = query.eq('status', 'published').order('version_number', { ascending: false });
      } else if (typeof version === 'number') {
        query = query.eq('version_number', version);
      }
      
      const { data: versionData, error } = await query.limit(1).single();
      
      if (error || !versionData) {
        console.log(`[GuidanceWorkflow] No version found for requirement ${requirement.id}, version: ${version}`);
        return null;
      }
      
      // Transform to our interface
      return this.transformVersionData(versionData);
      
    } catch (error) {
      console.error('[GuidanceWorkflow] Error getting versioned guidance:', error);
      return null;
    }
  }
  
  /**
   * Create a new draft version for editing
   */
  static async createDraftVersion(
    unifiedRequirementId: string,
    baseVersionId?: string,
    createdBy: string = 'system'
  ): Promise<GuidanceVersion> {
    try {
      // Get the next version number
      const { data: latestVersion } = await supabase
        .from('guidance_versions')
        .select('version_number')
        .eq('unified_requirement_id', unifiedRequirementId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();
      
      const nextVersion = (latestVersion?.version_number || 0) + 1;
      
      // Get base content (either from specified version or latest published)
      let baseContent = [];
      if (baseVersionId) {
        const { data: baseVersion } = await supabase
          .from('guidance_versions')
          .select('content_blocks')
          .eq('id', baseVersionId)
          .single();
        baseContent = baseVersion?.content_blocks || [];
      } else {
        const { data: publishedVersion } = await supabase
          .from('guidance_versions')
          .select('content_blocks')
          .eq('unified_requirement_id', unifiedRequirementId)
          .eq('status', 'published')
          .order('version_number', { ascending: false })
          .limit(1)
          .single();
        baseContent = publishedVersion?.content_blocks || [];
      }
      
      // Create new draft version
      const { data: newVersion, error } = await supabase
        .from('guidance_versions')
        .insert({
          unified_requirement_id: unifiedRequirementId,
          version_number: nextVersion,
          content_blocks: baseContent,
          framework_conditions: {
            iso27001: true,
            iso27002: true,
            cisControls: true,
            gdpr: true,
            nis2: true
          },
          status: 'draft',
          workflow_stage: 'editing',
          created_by: createdBy
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Record workflow transition
      await this.recordWorkflowTransition(newVersion.id, {
        fromStatus: 'none',
        toStatus: 'draft',
        fromStage: 'none',
        toStage: 'editing',
        actorId: createdBy,
        actorRole: 'editor',
        changeSummary: `Created draft version ${nextVersion}`,
        blocksAffected: baseContent.length
      });
      
      return this.transformVersionData(newVersion);
      
    } catch (error) {
      console.error('[GuidanceWorkflow] Error creating draft version:', error);
      throw error;
    }
  }
  
  /**
   * Generate AI suggestions for a guidance version
   */
  static async generateAISuggestions(
    versionId: string,
    options: {
      suggestionTypes?: Array<'addition' | 'replacement' | 'enhancement' | 'compression'>;
      targetBlocks?: string[]; // Specific block IDs to enhance
      maxSuggestions?: number;
      confidenceThreshold?: number;
    } = {}
  ): Promise<AISuggestion[]> {
    try {
      const {
        suggestionTypes = ['enhancement', 'addition'],
        maxSuggestions = 5,
        confidenceThreshold = 0.7
      } = options;
      
      // Get version with blocks
      const { data: version, error } = await supabase
        .from('guidance_versions')
        .select(`
          *,
          unified_requirements (
            title,
            description,
            sub_requirements,
            unified_compliance_categories (name)
          ),
          guidance_blocks (*)
        `)
        .eq('id', versionId)
        .single();
      
      if (error || !version) throw new Error('Version not found');
      
      const suggestions: AISuggestion[] = [];
      const categoryName = version.unified_requirements.unified_compliance_categories.name;
      
      // Generate suggestions for each block or specified blocks
      const blocksToEnhance = options.targetBlocks 
        ? version.guidance_blocks.filter(b => options.targetBlocks.includes(b.id))
        : version.guidance_blocks;
      
      for (const block of blocksToEnhance) {
        if (suggestions.length >= maxSuggestions) break;
        
        for (const suggestionType of suggestionTypes) {
          if (suggestions.length >= maxSuggestions) break;
          
          try {
            const suggestion = await this.generateBlockSuggestion(
              block,
              version.unified_requirements,
              categoryName,
              suggestionType,
              confidenceThreshold
            );
            
            if (suggestion && suggestion.confidenceScore >= confidenceThreshold) {
              suggestions.push(suggestion);
            }
          } catch (error) {
            console.warn(`[GuidanceWorkflow] Failed to generate ${suggestionType} suggestion for block ${block.id}:`, error);
          }
        }
      }
      
      // Store suggestions in database
      for (const suggestion of suggestions) {
        await this.storeSuggestion(suggestion);
      }
      
      // Update version AI stats
      await this.updateVersionAIStats(versionId, suggestions.length);
      
      return suggestions;
      
    } catch (error) {
      console.error('[GuidanceWorkflow] Error generating AI suggestions:', error);
      throw error;
    }
  }
  
  /**
   * Private helper methods
   */
  
  private static transformVersionData(versionData: any): GuidanceVersion {
    return {
      id: versionData.id,
      unifiedRequirementId: versionData.unified_requirement_id,
      versionNumber: versionData.version_number,
      contentBlocks: (versionData.guidance_blocks || []).map((block: any) => ({
        id: block.id,
        versionId: block.version_id,
        blockType: block.block_type,
        blockOrder: block.block_order,
        subRequirementLetter: block.sub_requirement_letter,
        content: block.content,
        frameworkConditions: block.framework_conditions || {},
        citations: (block.citations || []).map((citation: any) => ({
          id: citation.id,
          knowledgeContentId: citation.knowledge_content_id,
          citationText: citation.citation_text,
          pageNumber: citation.page_number,
          sectionReference: citation.section_reference,
          relevanceScore: citation.relevance_score,
          contextBefore: citation.context_before,
          contextAfter: citation.context_after
        })),
        lintViolations: block.lint_violations || [],
        styleScore: block.style_score || 1.0,
        aiGenerated: block.ai_generated || false,
        aiConfidence: block.ai_confidence,
        aiRationale: block.ai_rationale,
        aiModelVersion: block.ai_model_version
      })),
      frameworkConditions: versionData.framework_conditions || {},
      status: versionData.status,
      workflowStage: versionData.workflow_stage,
      wordCount: versionData.word_count || 0,
      rowCount: versionData.row_count || 0,
      lintScore: versionData.lint_score || 0,
      readabilityScore: versionData.readability_score || 0,
      createdBy: versionData.created_by,
      createdAt: versionData.created_at,
      reviewedBy: versionData.reviewed_by,
      reviewedAt: versionData.reviewed_at,
      approvedBy: versionData.approved_by,
      approvedAt: versionData.approved_at,
      publishedBy: versionData.published_by,
      publishedAt: versionData.published_at,
      aiSuggestionsCount: versionData.ai_suggestions_count || 0,
      aiApprovedCount: versionData.ai_approved_count || 0,
      aiConfidenceAvg: versionData.ai_confidence_avg || 0,
      lastAiEnhancement: versionData.last_ai_enhancement
    };
  }
  
  private static renderGuidanceContent(
    version: GuidanceVersion,
    selectedFrameworks: Record<string, boolean | string>
  ): string {
    const activeFrameworks = Object.entries(selectedFrameworks)
      .filter(([_, selected]) => selected !== false && selected !== null)
      .map(([framework]) => framework);
    
    let content = '';
    
    // Sort blocks by order
    const sortedBlocks = version.contentBlocks.sort((a, b) => a.blockOrder - b.blockOrder);
    
    for (const block of sortedBlocks) {
      // Check framework conditions
      const blockFrameworks = Object.entries(block.frameworkConditions)
        .filter(([_, enabled]) => enabled)
        .map(([framework]) => framework);
      
      // Show block if no conditions or if any active framework matches
      const shouldShow = blockFrameworks.length === 0 || 
        blockFrameworks.some(fw => activeFrameworks.includes(fw));
      
      if (shouldShow) {
        content += block.content + '\n\n';
        
        // Add citations if available
        if (block.citations.length > 0) {
          const citationText = block.citations
            .map((c, i) => `[${i + 1}] ${c.citationText}`)
            .join('\n');
          content += `**Sources:**\n${citationText}\n\n`;
        }
      }
    }
    
    return content.trim();
  }
  
  private static extractCitations(version: GuidanceVersion): Citation[] {
    const allCitations: Citation[] = [];
    
    for (const block of version.contentBlocks) {
      allCitations.push(...block.citations);
    }
    
    return allCitations;
  }
  
  private static async generateBlockSuggestion(
    block: any,
    requirement: any,
    categoryName: string,
    suggestionType: string,
    confidenceThreshold: number
  ): Promise<AISuggestion | null> {
    try {
      // Use existing RAG service to generate enhanced content
      const ragResult = await RAGGenerationService.generateGuidance(
        {
          title: requirement.title,
          description: block.content
        },
        categoryName,
        { all: true } // Get suggestions for all frameworks
      );
      
      if (!ragResult.success || ragResult.confidence < confidenceThreshold) {
        return null;
      }
      
      // Transform RAG result to suggestion format
      return {
        id: crypto.randomUUID(),
        unifiedRequirementId: requirement.id,
        targetVersionId: block.version_id,
        suggestionType: suggestionType as any,
        targetBlockId: block.id,
        originalContent: block.content,
        suggestedContent: ragResult.content,
        rationale: `AI-enhanced content based on ${ragResult.sourcesUsed?.length || 0} authoritative sources`,
        confidenceScore: ragResult.confidence || 0,
        impactLabel: 'completeness',
        citations: [], // Will be populated when storing
        sourceChunks: ragResult.sourcesUsed || [],
        status: 'pending',
        createdAt: new Date().toISOString(),
        createdByAiModel: 'gemini-pro',
        processingTimeMs: ragResult.processingTimeMs,
        tokenUsage: ragResult.tokenUsage || {}
      };
      
    } catch (error) {
      console.error('[GuidanceWorkflow] Error generating block suggestion:', error);
      return null;
    }
  }
  
  private static async storeSuggestion(suggestion: AISuggestion): Promise<void> {
    try {
      await supabase
        .from('ai_suggestions')
        .insert({
          unified_requirement_id: suggestion.unifiedRequirementId,
          target_version_id: suggestion.targetVersionId,
          suggestion_type: suggestion.suggestionType,
          target_block_id: suggestion.targetBlockId,
          original_content: suggestion.originalContent,
          suggested_content: suggestion.suggestedContent,
          rationale: suggestion.rationale,
          confidence_score: suggestion.confidenceScore,
          impact_label: suggestion.impactLabel,
          citations: suggestion.citations,
          source_chunks: suggestion.sourceChunks,
          status: suggestion.status,
          created_by_ai_model: suggestion.createdByAiModel,
          processing_time_ms: suggestion.processingTimeMs,
          token_usage: suggestion.tokenUsage
        });
    } catch (error) {
      console.error('[GuidanceWorkflow] Error storing suggestion:', error);
      throw error;
    }
  }
  
  private static async updateVersionAIStats(
    versionId: string,
    newSuggestionsCount: number
  ): Promise<void> {
    try {
      await supabase
        .from('guidance_versions')
        .update({
          ai_suggestions_count: newSuggestionsCount,
          last_ai_enhancement: new Date().toISOString()
        })
        .eq('id', versionId);
    } catch (error) {
      console.error('[GuidanceWorkflow] Error updating AI stats:', error);
    }
  }
  
  private static async recordWorkflowTransition(
    versionId: string,
    transition: Partial<WorkflowTransition>
  ): Promise<void> {
    try {
      await supabase
        .from('workflow_transitions')
        .insert({
          version_id: versionId,
          from_status: transition.fromStatus || '',
          to_status: transition.toStatus || '',
          from_stage: transition.fromStage || '',
          to_stage: transition.toStage || '',
          actor_id: transition.actorId || 'system',
          actor_role: transition.actorRole || 'system',
          change_summary: transition.changeSummary || '',
          rationale: transition.rationale,
          blocks_affected: transition.blocksAffected || 0,
          suggestions_processed: transition.suggestionsProcessed || 0,
          metadata: transition.metadata || {}
        });
    } catch (error) {
      console.error('[GuidanceWorkflow] Error recording workflow transition:', error);
    }
  }
}

export const guidanceWorkflowService = new GuidanceWorkflowService();