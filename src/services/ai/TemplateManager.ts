/**
 * Template Manager Service
 * =======================
 * 
 * Comprehensive database CRUD operations for unified guidance templates.
 * Handles content migration from existing EnhancedUnifiedGuidanceService,
 * template validation, quality scoring, and admin interface data preparation.
 * 
 * Features:
 * - Template lifecycle management (create, read, update, delete)
 * - Content migration from legacy guidance service
 * - Quality assessment and scoring integration
 * - Version management and change tracking
 * - Admin dashboard data preparation
 * - Framework requirement mapping management
 * - Multi-tenant security with RLS compliance
 */

import { supabase } from '../../lib/supabase';
import { EnhancedUnifiedGuidanceService } from '../compliance/EnhancedUnifiedGuidanceService';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UnifiedGuidanceTemplate {
  id: string;
  category_name: string;
  category_slug: string;
  
  // Content Structure
  foundation_content: string;
  implementation_steps: any[];
  practical_tools: any[];
  audit_evidence: any[];
  cross_references: any[];
  
  // AI Enhancement Configuration
  ai_prompt_foundation?: string;
  ai_prompt_implementation?: string;
  ai_context_keywords: string[];
  ai_enhancement_enabled: boolean;
  
  // Quality & Metadata
  content_quality_score?: number;
  last_ai_enhanced_at?: Date;
  review_status: 'pending' | 'approved' | 'needs_review' | 'rejected';
  
  // Vector Integration
  vector_embedding?: number[];
  vector_keywords: string[];
  embedding_model: string;
  last_indexed_at?: Date;
  
  // Multi-tenant security
  organization_id?: string;
  is_global_template: boolean;
  
  // Admin Management & Audit Trail
  created_by?: string;
  updated_by?: string;
  version: number;
  change_log: any[];
  
  // Timestamps
  created_at: Date;
  updated_at: Date;
}

export interface TemplateCreateRequest {
  category_name: string;
  foundation_content: string;
  implementation_steps?: any[];
  practical_tools?: any[];
  audit_evidence?: any[];
  organization_id?: string;
  is_global_template?: boolean;
  ai_enhancement_enabled?: boolean;
  ai_context_keywords?: string[];
  created_by?: string;
}

export interface TemplateUpdateRequest {
  foundation_content?: string;
  implementation_steps?: any[];
  practical_tools?: any[];
  audit_evidence?: any[];
  content_quality_score?: number;
  review_status?: 'pending' | 'approved' | 'needs_review' | 'rejected';
  ai_enhancement_enabled?: boolean;
  ai_context_keywords?: string[];
  last_ai_enhanced_at?: Date;
  updated_by?: string;
  version?: number;
}

export interface FrameworkMapping {
  id: string;
  template_id: string;
  framework_type: string;
  requirement_code: string;
  requirement_title: string;
  requirement_description?: string;
  relevance_level: 'primary' | 'supporting' | 'cross_reference' | 'related';
  ai_context_weight: number;
  custom_guidance_notes?: string;
  mapping_confidence?: number;
  validation_source: 'manual' | 'ai_assisted' | 'imported' | 'auto_mapped';
}

export interface TemplateSearchOptions {
  query?: string;
  frameworks?: string[];
  quality_threshold?: number;
  organization_id?: string;
  include_global?: boolean;
  review_status?: string;
  limit?: number;
  offset?: number;
}

export interface MigrationResult {
  category: string;
  success: boolean;
  template_id?: string;
  error?: string;
  quality_score?: number;
  frameworks_mapped?: number;
}

// ============================================================================
// MAIN TEMPLATE MANAGER CLASS
// ============================================================================

export class TemplateManager {
  
  // ============================================================================
  // TEMPLATE CRUD OPERATIONS
  // ============================================================================

  /**
   * Get template by ID with full details
   */
  public async getTemplateById(templateId: string, organizationId?: string): Promise<UnifiedGuidanceTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('unified_guidance_templates')
        .select(`
          *,
          framework_requirement_mappings (
            id,
            framework_type,
            requirement_code,
            requirement_title,
            relevance_level,
            ai_context_weight
          )
        `)
        .eq('id', templateId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return this.transformDatabaseTemplate(data);
    } catch (error) {
      console.error(`[TemplateManager] Error getting template by ID:`, error);
      throw error;
    }
  }

  /**
   * Get template by category name
   */
  public async getTemplateByCategory(categoryName: string, organizationId?: string): Promise<UnifiedGuidanceTemplate | null> {
    try {
      const categorySlug = this.generateCategorySlug(categoryName);
      
      let query = supabase
        .from('unified_guidance_templates')
        .select('*')
        .eq('category_slug', categorySlug);

      if (organizationId) {
        query = query.or(`organization_id.eq.${organizationId},is_global_template.eq.true`);
      } else {
        query = query.eq('is_global_template', true);
      }

      const { data, error } = await query.order('content_quality_score', { ascending: false }).limit(1);

      if (error) throw error;
      
      return data && data.length > 0 ? this.transformDatabaseTemplate(data[0]) : null;
    } catch (error) {
      console.error(`[TemplateManager] Error getting template by category:`, error);
      throw error;
    }
  }

  /**
   * Create new template
   */
  public async createTemplate(request: TemplateCreateRequest): Promise<UnifiedGuidanceTemplate> {
    try {
      const categorySlug = this.generateCategorySlug(request.category_name);
      
      const templateData = {
        category_name: request.category_name,
        category_slug: categorySlug,
        foundation_content: request.foundation_content,
        implementation_steps: request.implementation_steps || [],
        practical_tools: request.practical_tools || [],
        audit_evidence: request.audit_evidence || [],
        cross_references: [],
        ai_enhancement_enabled: request.ai_enhancement_enabled ?? true,
        ai_context_keywords: request.ai_context_keywords || [],
        organization_id: request.organization_id,
        is_global_template: request.is_global_template ?? false,
        created_by: request.created_by,
        review_status: 'pending',
        version: 1,
        change_log: [{
          action: 'created',
          timestamp: new Date().toISOString(),
          user_id: request.created_by,
          changes: 'Initial template creation'
        }]
      };

      const { data, error } = await supabase
        .from('unified_guidance_templates')
        .insert(templateData)
        .select()
        .single();

      if (error) throw error;

      console.log(`[TemplateManager] Created template: ${request.category_name}`);
      return this.transformDatabaseTemplate(data);
    } catch (error) {
      console.error(`[TemplateManager] Error creating template:`, error);
      throw error;
    }
  }

  /**
   * Update existing template
   */
  public async updateTemplate(templateId: string, updates: TemplateUpdateRequest): Promise<UnifiedGuidanceTemplate> {
    try {
      // Get current template for version tracking
      const current = await this.getTemplateById(templateId);
      if (!current) {
        throw new Error(`Template not found: ${templateId}`);
      }

      // Prepare update data
      const updateData: any = { ...updates };
      
      // Handle version increment
      if (updates.foundation_content && updates.foundation_content !== current.foundation_content) {
        updateData.version = (updates.version || current.version) + 1;
        
        // Add to change log
        const changeLogEntry = {
          action: 'content_updated',
          timestamp: new Date().toISOString(),
          user_id: updates.updated_by,
          changes: 'Foundation content updated',
          previous_version: current.version
        };
        
        updateData.change_log = [...current.change_log, changeLogEntry];
      }

      const { data, error } = await supabase
        .from('unified_guidance_templates')
        .update(updateData)
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;

      console.log(`[TemplateManager] Updated template: ${templateId}`);
      return this.transformDatabaseTemplate(data);
    } catch (error) {
      console.error(`[TemplateManager] Error updating template:`, error);
      throw error;
    }
  }

  /**
   * Update template quality score
   */
  public async updateTemplateQuality(templateId: string, qualityScore: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('unified_guidance_templates')
        .update({ 
          content_quality_score: qualityScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId);

      if (error) throw error;
      
      console.log(`[TemplateManager] Updated quality score for template ${templateId}: ${qualityScore}`);
    } catch (error) {
      console.error(`[TemplateManager] Error updating template quality:`, error);
      throw error;
    }
  }

  /**
   * Delete template (soft delete by marking inactive)
   */
  public async deleteTemplate(templateId: string, userId?: string): Promise<void> {
    try {
      // Update review status to indicate deletion
      const { error } = await supabase
        .from('unified_guidance_templates')
        .update({
          review_status: 'rejected',
          updated_by: userId,
          change_log: supabase.sql`change_log || ${JSON.stringify([{
            action: 'deleted',
            timestamp: new Date().toISOString(),
            user_id: userId,
            changes: 'Template marked as deleted'
          }])}`
        })
        .eq('id', templateId);

      if (error) throw error;
      
      console.log(`[TemplateManager] Soft deleted template: ${templateId}`);
    } catch (error) {
      console.error(`[TemplateManager] Error deleting template:`, error);
      throw error;
    }
  }

  // ============================================================================
  // SEARCH AND DISCOVERY
  // ============================================================================

  /**
   * Search templates with comprehensive filtering
   */
  public async searchTemplates(options: TemplateSearchOptions): Promise<{
    templates: UnifiedGuidanceTemplate[];
    total: number;
    page: number;
    hasMore: boolean;
  }> {
    try {
      let query = supabase.from('unified_guidance_templates').select('*', { count: 'exact' });

      // Apply filters
      if (options.organization_id) {
        if (options.include_global) {
          query = query.or(`organization_id.eq.${options.organization_id},is_global_template.eq.true`);
        } else {
          query = query.eq('organization_id', options.organization_id);
        }
      } else if (options.include_global) {
        query = query.eq('is_global_template', true);
      }

      if (options.frameworks && options.frameworks.length > 0) {
        // Join with framework mappings
        query = query.in('id', 
          supabase.from('framework_requirement_mappings')
            .select('template_id')
            .in('framework_type', options.frameworks)
        );
      }

      if (options.quality_threshold) {
        query = query.gte('content_quality_score', options.quality_threshold);
      }

      if (options.review_status) {
        query = query.eq('review_status', options.review_status);
      }

      // Text search
      if (options.query) {
        query = query.textSearch('category_name', options.query);
      }

      // Pagination
      const limit = options.limit || 20;
      const offset = options.offset || 0;
      query = query.range(offset, offset + limit - 1);

      // Order by quality and recency
      query = query.order('content_quality_score', { ascending: false })
                  .order('updated_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        templates: (data || []).map(this.transformDatabaseTemplate),
        total: count || 0,
        page: Math.floor(offset / limit) + 1,
        hasMore: (count || 0) > offset + limit
      };
    } catch (error) {
      console.error(`[TemplateManager] Error searching templates:`, error);
      throw error;
    }
  }

  /**
   * Get templates for admin dashboard
   */
  public async getAdminTemplateOverview(organizationId?: string): Promise<any[]> {
    try {
      let query = supabase.from('admin_template_overview').select('*');
      
      if (organizationId) {
        query = query.or(`organization_id.eq.${organizationId},is_global_template.eq.true`);
      }

      const { data, error } = await query.order('updated_at', { ascending: false });

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error(`[TemplateManager] Error getting admin overview:`, error);
      throw error;
    }
  }

  // ============================================================================
  // LEGACY CONTENT MIGRATION
  // ============================================================================

  /**
   * Create template from legacy EnhancedUnifiedGuidanceService
   */
  public async createTemplateFromLegacyService(
    categoryName: string, 
    organizationId?: string
  ): Promise<UnifiedGuidanceTemplate> {
    try {
      console.log(`[TemplateManager] Migrating category: ${categoryName}`);
      
      // Get content from legacy service
      const legacyContent = await EnhancedUnifiedGuidanceService.getEnhancedGuidance(
        categoryName,
        {
          'ISO 27001': true,
          'CIS Controls': true,
          'NIST': true
        }
      );

      if (!legacyContent) {
        throw new Error(`No legacy content found for category: ${categoryName}`);
      }

      // Parse legacy content into structured format
      const parsed = this.parseLegacyContent(legacyContent);
      
      // Create template
      const template = await this.createTemplate({
        category_name: categoryName,
        foundation_content: parsed.foundation,
        implementation_steps: parsed.implementationSteps,
        practical_tools: parsed.practicalTools,
        audit_evidence: parsed.auditEvidence,
        organization_id: organizationId,
        is_global_template: !organizationId, // Global if no org specified
        ai_enhancement_enabled: true,
        ai_context_keywords: parsed.keywords
      });

      // Create framework mappings
      await this.createFrameworkMappingsForTemplate(template.id, categoryName);

      console.log(`[TemplateManager] Successfully migrated: ${categoryName}`);
      return template;
    } catch (error) {
      console.error(`[TemplateManager] Error migrating category ${categoryName}:`, error);
      throw error;
    }
  }

  /**
   * Migrate all categories from legacy service
   */
  public async migrateAllLegacyContent(organizationId?: string): Promise<MigrationResult[]> {
    const results: MigrationResult[] = [];
    
    const categories = [
      'Access Control',
      'Asset Management',
      'Vulnerability Management',
      'Incident Response',
      'Risk Management',
      'Data Protection',
      'Security Awareness',
      'Business Continuity',
      'Supplier Risk',
      'Network Security',
      'Secure Development',
      'Physical Security',
      'Governance & Leadership',
      'Audit Logging',
      'Compliance & Audit'
    ];

    for (const category of categories) {
      try {
        const template = await this.createTemplateFromLegacyService(category, organizationId);
        results.push({
          category,
          success: true,
          template_id: template.id,
          quality_score: template.content_quality_score
        });
      } catch (error) {
        results.push({
          category,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`[TemplateManager] Migration completed. Success: ${results.filter(r => r.success).length}/${results.length}`);
    return results;
  }

  // ============================================================================
  // FRAMEWORK MAPPING MANAGEMENT
  // ============================================================================

  /**
   * Create framework mappings for template
   */
  public async createFrameworkMappingsForTemplate(templateId: string, category: string): Promise<void> {
    try {
      const mappings = this.generateFrameworkMappings(category);
      
      const mappingData = mappings.map(mapping => ({
        ...mapping,
        template_id: templateId
      }));

      const { error } = await supabase
        .from('framework_requirement_mappings')
        .insert(mappingData);

      if (error) throw error;
      
      console.log(`[TemplateManager] Created ${mappings.length} framework mappings for template: ${templateId}`);
    } catch (error) {
      console.error(`[TemplateManager] Error creating framework mappings:`, error);
      throw error;
    }
  }

  /**
   * Get framework mappings for template
   */
  public async getFrameworkMappings(templateId: string): Promise<FrameworkMapping[]> {
    try {
      const { data, error } = await supabase
        .from('framework_requirement_mappings')
        .select('*')
        .eq('template_id', templateId)
        .order('relevance_level', { ascending: false });

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error(`[TemplateManager] Error getting framework mappings:`, error);
      throw error;
    }
  }

  /**
   * Update framework mapping
   */
  public async updateFrameworkMapping(mappingId: string, updates: Partial<FrameworkMapping>): Promise<void> {
    try {
      const { error } = await supabase
        .from('framework_requirement_mappings')
        .update(updates)
        .eq('id', mappingId);

      if (error) throw error;
      
      console.log(`[TemplateManager] Updated framework mapping: ${mappingId}`);
    } catch (error) {
      console.error(`[TemplateManager] Error updating framework mapping:`, error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY AND HELPER METHODS
  // ============================================================================

  /**
   * Generate category slug from name
   */
  private generateCategorySlug(categoryName: string): string {
    return categoryName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Transform database template to typed interface
   */
  private transformDatabaseTemplate(dbTemplate: any): UnifiedGuidanceTemplate {
    return {
      id: dbTemplate.id,
      category_name: dbTemplate.category_name,
      category_slug: dbTemplate.category_slug,
      foundation_content: dbTemplate.foundation_content,
      implementation_steps: dbTemplate.implementation_steps || [],
      practical_tools: dbTemplate.practical_tools || [],
      audit_evidence: dbTemplate.audit_evidence || [],
      cross_references: dbTemplate.cross_references || [],
      ai_prompt_foundation: dbTemplate.ai_prompt_foundation,
      ai_prompt_implementation: dbTemplate.ai_prompt_implementation,
      ai_context_keywords: dbTemplate.ai_context_keywords || [],
      ai_enhancement_enabled: dbTemplate.ai_enhancement_enabled,
      content_quality_score: dbTemplate.content_quality_score,
      last_ai_enhanced_at: dbTemplate.last_ai_enhanced_at ? new Date(dbTemplate.last_ai_enhanced_at) : undefined,
      review_status: dbTemplate.review_status,
      vector_embedding: dbTemplate.vector_embedding,
      vector_keywords: dbTemplate.vector_keywords || [],
      embedding_model: dbTemplate.embedding_model,
      last_indexed_at: dbTemplate.last_indexed_at ? new Date(dbTemplate.last_indexed_at) : undefined,
      organization_id: dbTemplate.organization_id,
      is_global_template: dbTemplate.is_global_template,
      created_by: dbTemplate.created_by,
      updated_by: dbTemplate.updated_by,
      version: dbTemplate.version,
      change_log: dbTemplate.change_log || [],
      created_at: new Date(dbTemplate.created_at),
      updated_at: new Date(dbTemplate.updated_at)
    };
  }

  /**
   * Parse legacy content into structured format
   */
  private parseLegacyContent(legacyContent: string): {
    foundation: string;
    implementationSteps: any[];
    practicalTools: any[];
    auditEvidence: any[];
    keywords: string[];
  } {
    const sections = legacyContent.split(/\n## /);
    
    const foundation = sections.find(s => 
      s.toLowerCase().includes('strategic') || 
      s.toLowerCase().includes('foundation') ||
      s.toLowerCase().includes('principles')
    ) || legacyContent.substring(0, 2000);

    // Extract implementation steps
    const implementationSection = sections.find(s => 
      s.toLowerCase().includes('implementation') ||
      s.toLowerCase().includes('steps')
    );
    const implementationSteps = implementationSection ? 
      this.parseListItems(implementationSection) : [];

    // Extract tools
    const toolsSection = sections.find(s => 
      s.toLowerCase().includes('tools') ||
      s.toLowerCase().includes('resources')
    );
    const practicalTools = toolsSection ? 
      this.parseListItems(toolsSection) : [];

    // Extract audit evidence
    const evidenceSection = sections.find(s => 
      s.toLowerCase().includes('evidence') ||
      s.toLowerCase().includes('audit')
    );
    const auditEvidence = evidenceSection ? 
      this.parseListItems(evidenceSection) : [];

    // Extract keywords
    const keywords = this.extractKeywords(legacyContent);

    return {
      foundation: foundation.replace(/^[^#]*#*\s*/, '').trim(),
      implementationSteps,
      practicalTools,
      auditEvidence,
      keywords
    };
  }

  /**
   * Parse list items from text content
   */
  private parseListItems(content: string): any[] {
    const items = content
      .split(/\n[-*•]\s+/)
      .filter(item => item.trim().length > 0)
      .map(item => ({
        title: this.extractTitle(item),
        description: item.trim(),
        priority: this.calculatePriority(item)
      }));

    return items.slice(0, 10); // Limit to top 10 items
  }

  /**
   * Extract title from list item
   */
  private extractTitle(item: string): string {
    const firstLine = item.split('\n')[0];
    const colonIndex = firstLine.indexOf(':');
    
    if (colonIndex > 0 && colonIndex < 100) {
      return firstLine.substring(0, colonIndex).trim();
    }
    
    return firstLine.substring(0, 80).trim() + (firstLine.length > 80 ? '...' : '');
  }

  /**
   * Calculate priority based on content indicators
   */
  private calculatePriority(content: string): 'high' | 'medium' | 'low' {
    const highPriorityKeywords = ['critical', 'essential', 'mandatory', 'required', 'must'];
    const mediumPriorityKeywords = ['important', 'should', 'recommended'];
    
    const lowerContent = content.toLowerCase();
    
    if (highPriorityKeywords.some(kw => lowerContent.includes(kw))) {
      return 'high';
    }
    
    if (mediumPriorityKeywords.some(kw => lowerContent.includes(kw))) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Extract keywords for AI context
   */
  private extractKeywords(content: string): string[] {
    const keywords = new Set<string>();
    
    // Technical terms
    const technicalTerms = content.match(/\b[A-Z]{2,}(?:[A-Z][a-z]+)*\b/g) || [];
    technicalTerms.forEach(term => keywords.add(term.toLowerCase()));
    
    // Important nouns
    const importantNouns = [
      'access', 'control', 'security', 'audit', 'compliance', 'risk', 'management',
      'policy', 'procedure', 'monitoring', 'assessment', 'framework', 'standard',
      'implementation', 'governance', 'incident', 'response', 'vulnerability',
      'encryption', 'authentication', 'authorization', 'logging', 'backup'
    ];
    
    importantNouns.forEach(noun => {
      if (content.toLowerCase().includes(noun)) {
        keywords.add(noun);
      }
    });
    
    return Array.from(keywords).slice(0, 20);
  }

  /**
   * Generate framework mappings for category
   */
  private generateFrameworkMappings(category: string): Omit<FrameworkMapping, 'id' | 'template_id'>[] {
    const mappings: Omit<FrameworkMapping, 'id' | 'template_id'>[] = [];
    
    // ISO 27001 mappings
    const iso27001Mapping = this.getISO27001Mapping(category);
    if (iso27001Mapping) {
      mappings.push(iso27001Mapping);
    }
    
    // CIS Controls mappings
    const cisMapping = this.getCISControlsMapping(category);
    if (cisMapping) {
      mappings.push(cisMapping);
    }
    
    // NIST mappings
    const nistMapping = this.getNISTMapping(category);
    if (nistMapping) {
      mappings.push(nistMapping);
    }
    
    return mappings;
  }

  /**
   * Get ISO 27001 mapping for category
   */
  private getISO27001Mapping(category: string): Omit<FrameworkMapping, 'id' | 'template_id'> | null {
    const mappings: Record<string, any> = {
      'Access Control': {
        requirement_code: 'A.9',
        requirement_title: 'Access Control',
        requirement_description: 'Access to information and information processing facilities shall be restricted',
        relevance_level: 'primary' as const,
        ai_context_weight: 1.0
      },
      'Asset Management': {
        requirement_code: 'A.8',
        requirement_title: 'Asset Management',
        requirement_description: 'Assets associated with information and information processing facilities shall be identified and an inventory of these assets shall be drawn up and maintained',
        relevance_level: 'primary' as const,
        ai_context_weight: 1.0
      }
      // Add more mappings as needed
    };

    const mapping = mappings[category];
    if (!mapping) return null;

    return {
      framework_type: 'iso27001',
      ...mapping,
      mapping_confidence: 0.95,
      validation_source: 'auto_mapped' as const
    };
  }

  /**
   * Get CIS Controls mapping for category
   */
  private getCISControlsMapping(category: string): Omit<FrameworkMapping, 'id' | 'template_id'> | null {
    const mappings: Record<string, any> = {
      'Access Control': {
        requirement_code: '5',
        requirement_title: 'Account Management',
        requirement_description: 'Manage the lifecycle of system and application accounts',
        relevance_level: 'primary' as const,
        ai_context_weight: 1.0
      },
      'Asset Management': {
        requirement_code: '1',
        requirement_title: 'Inventory and Control of Enterprise Assets',
        requirement_description: 'Actively manage (inventory, track, and correct) all enterprise assets',
        relevance_level: 'primary' as const,
        ai_context_weight: 1.0
      }
      // Add more mappings as needed
    };

    const mapping = mappings[category];
    if (!mapping) return null;

    return {
      framework_type: 'cisControls',
      ...mapping,
      mapping_confidence: 0.90,
      validation_source: 'auto_mapped' as const
    };
  }

  /**
   * Get NIST mapping for category
   */
  private getNISTMapping(category: string): Omit<FrameworkMapping, 'id' | 'template_id'> | null {
    const mappings: Record<string, any> = {
      'Access Control': {
        requirement_code: 'PR.AC',
        requirement_title: 'Identity Management, Authentication and Access Control',
        requirement_description: 'Access to physical and logical assets and associated facilities is limited to authorized users, processes, and devices',
        relevance_level: 'primary' as const,
        ai_context_weight: 1.0
      },
      'Risk Management': {
        requirement_code: 'ID.RA',
        requirement_title: 'Risk Assessment',
        requirement_description: 'The organization understands the cybersecurity risk to organizational operations',
        relevance_level: 'primary' as const,
        ai_context_weight: 1.0
      }
      // Add more mappings as needed
    };

    const mapping = mappings[category];
    if (!mapping) return null;

    return {
      framework_type: 'nist',
      ...mapping,
      mapping_confidence: 0.90,
      validation_source: 'auto_mapped' as const
    };
  }
}