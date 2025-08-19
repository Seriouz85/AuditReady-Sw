import { supabase } from '@/lib/supabase';
import { SubGuidanceItem } from './SubGuidanceGenerationService';

export interface IntegratedRequirement {
  id: string;
  category_id: string;
  category_name: string;
  title: string;
  description: string;
  sub_guidance_items: SubGuidanceItem[];
  integration_status: 'draft' | 'integrated' | 'exported';
  integrated_at?: string;
  integrated_by?: string;
  export_formats?: string[];
  audit_trail: IntegrationAuditEntry[];
}

export interface IntegrationAuditEntry {
  id: string;
  action: 'created' | 'integrated' | 'exported' | 'updated' | 'archived';
  performed_by: string;
  performed_by_name: string;
  performed_at: string;
  details: string;
  metadata?: Record<string, any>;
}

export interface ExportFormat {
  format: 'unified_requirements' | 'iso27001' | 'nist_csf' | 'nis2' | 'soc2' | 'custom';
  title: string;
  description: string;
  template_path?: string;
  mapping_rules: Record<string, string>;
}

export interface IntegrationResult {
  success: boolean;
  integrated_requirements: IntegratedRequirement[];
  failed_integrations: Array<{ category_id: string; error: string }>;
  audit_entries: IntegrationAuditEntry[];
  export_summary?: {
    total_exported: number;
    formats: string[];
    export_paths: string[];
  };
}

/**
 * 🔗 Phase 4: Service for integrating approved sub-guidance with existing requirements system
 * Handles the complete workflow from approval to export across compliance frameworks
 */
export class RequirementsIntegrationService {

  /**
   * 🚀 Main integration method: Connect approved sub-guidance to unified requirements
   */
  static async integrateApprovedSubGuidance(
    organizationId: string,
    options: {
      categoryIds?: string[]; // Specific categories or all
      onProgress?: (progress: number, message?: string) => void;
      createAuditTrail?: boolean;
      autoExport?: boolean;
      exportFormats?: ExportFormat[];
    } = {}
  ): Promise<IntegrationResult> {
    const { 
      categoryIds, 
      onProgress, 
      createAuditTrail = true, 
      autoExport = false, 
      exportFormats = [] 
    } = options;

    try {
      console.log('🔗 Starting Phase 4 requirements integration...');
      onProgress?.(10, 'Loading approved sub-guidance items...');

      // Step 1: Load all approved sub-guidance items
      const approvedSubGuidance = await this.loadApprovedSubGuidance(
        organizationId, 
        categoryIds
      );

      onProgress?.(30, 'Creating integrated requirements...');

      // Step 2: Create integrated requirements structure
      const integratedRequirements = await this.createIntegratedRequirements(
        organizationId,
        approvedSubGuidance
      );

      onProgress?.(60, 'Storing integrated requirements...');

      // Step 3: Store integrated requirements in database
      await this.storeIntegratedRequirements(organizationId, integratedRequirements);

      onProgress?.(80, 'Creating audit trail...');

      // Step 4: Create audit trail
      const auditEntries = createAuditTrail 
        ? await this.createIntegrationAuditTrail(
            organizationId, 
            integratedRequirements, 
            'integrated'
          )
        : [];

      let exportSummary;
      if (autoExport && exportFormats.length > 0) {
        onProgress?.(90, 'Exporting to compliance frameworks...');
        exportSummary = await this.exportToFrameworks(
          organizationId,
          integratedRequirements,
          exportFormats
        );
      }

      onProgress?.(100, 'Integration completed successfully');

      console.log(`✅ Phase 4 integration completed: ${integratedRequirements.length} requirements integrated`);

      return {
        success: true,
        integrated_requirements: integratedRequirements,
        failed_integrations: [],
        audit_entries: auditEntries,
        export_summary: exportSummary
      };

    } catch (error) {
      console.error('❌ Requirements integration failed:', error);
      return {
        success: false,
        integrated_requirements: [],
        failed_integrations: [{
          category_id: 'all',
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }],
        audit_entries: []
      };
    }
  }

  /**
   * 📥 Load approved sub-guidance items from all categories
   */
  private static async loadApprovedSubGuidance(
    organizationId: string,
    categoryIds?: string[]
  ): Promise<Record<string, { category: any, items: SubGuidanceItem[] }>> {
    try {
      // Load categories
      let categoriesQuery = supabase
        .from('unified_compliance_categories')
        .select('*')
        .eq('is_active', true);

      if (categoryIds && categoryIds.length > 0) {
        categoriesQuery = categoriesQuery.in('id', categoryIds);
      }

      const { data: categories, error: categoriesError } = await categoriesQuery;
      if (categoriesError) throw categoriesError;

      // Load sub-guidance for each category
      const approvedSubGuidance: Record<string, { category: any, items: SubGuidanceItem[] }> = {};

      for (const category of categories || []) {
        const { data: subGuidanceData, error } = await supabase
          .from('category_sub_guidance')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('category_id', category.id)
          .single();

        if (!error && subGuidanceData?.sub_guidance_items) {
          // Filter only approved items
          const approvedItems = subGuidanceData.sub_guidance_items.filter(
            (item: SubGuidanceItem) => item.status === 'approved'
          );

          if (approvedItems.length > 0) {
            approvedSubGuidance[category.id] = {
              category,
              items: approvedItems
            };
          }
        }
      }

      console.log(`✅ Loaded approved sub-guidance from ${Object.keys(approvedSubGuidance).length} categories`);
      return approvedSubGuidance;

    } catch (error) {
      console.error('Error loading approved sub-guidance:', error);
      return {};
    }
  }

  /**
   * 🏗️ Create integrated requirements structure
   */
  private static async createIntegratedRequirements(
    organizationId: string,
    approvedSubGuidance: Record<string, { category: any, items: SubGuidanceItem[] }>
  ): Promise<IntegratedRequirement[]> {
    const integratedRequirements: IntegratedRequirement[] = [];

    for (const [categoryId, { category, items }] of Object.entries(approvedSubGuidance)) {
      // Check if unified requirement already exists for this category
      let unifiedRequirement = await this.findOrCreateUnifiedRequirement(
        organizationId,
        category
      );

      const integrated: IntegratedRequirement = {
        id: `integrated-${categoryId}-${Date.now()}`,
        category_id: categoryId,
        category_name: category.name,
        title: unifiedRequirement.title,
        description: unifiedRequirement.description,
        sub_guidance_items: items,
        integration_status: 'integrated',
        integrated_at: new Date().toISOString(),
        integrated_by: 'system', // Will be updated with actual user info
        audit_trail: []
      };

      integratedRequirements.push(integrated);
    }

    return integratedRequirements;
  }

  /**
   * 🔍 Find or create unified requirement for category
   */
  private static async findOrCreateUnifiedRequirement(
    organizationId: string,
    category: any
  ): Promise<{ title: string; description: string; id?: string }> {
    try {
      // Look for existing unified requirement
      const { data: existing } = await supabase
        .from('unified_requirements')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('category_id', category.id)
        .single();

      if (existing) {
        return {
          id: existing.id,
          title: existing.title,
          description: existing.description
        };
      }

      // Create new unified requirement
      const newRequirement = {
        title: `Comprehensive ${category.name} Requirements`,
        description: `Unified compliance requirements for ${category.name} covering all applicable frameworks and standards. This requirement encompasses all sub-guidance items generated through AI analysis of authoritative sources.`,
        organization_id: organizationId,
        category_id: category.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: created, error } = await supabase
        .from('unified_requirements')
        .insert(newRequirement)
        .select()
        .single();

      if (error) throw error;

      return {
        id: created.id,
        title: created.title,
        description: created.description
      };

    } catch (error) {
      console.error('Error finding/creating unified requirement:', error);
      // Return default structure
      return {
        title: `Comprehensive ${category.name} Requirements`,
        description: `Unified compliance requirements for ${category.name}.`
      };
    }
  }

  /**
   * 💾 Store integrated requirements in database
   */
  private static async storeIntegratedRequirements(
    organizationId: string,
    integratedRequirements: IntegratedRequirement[]
  ): Promise<void> {
    try {
      for (const requirement of integratedRequirements) {
        await supabase
          .from('integrated_requirements')
          .upsert({
            id: requirement.id,
            organization_id: organizationId,
            category_id: requirement.category_id,
            category_name: requirement.category_name,
            title: requirement.title,
            description: requirement.description,
            sub_guidance_items: requirement.sub_guidance_items,
            integration_status: requirement.integration_status,
            integrated_at: requirement.integrated_at,
            integrated_by: requirement.integrated_by,
            export_formats: requirement.export_formats || [],
            audit_trail: requirement.audit_trail,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }

      console.log(`✅ Stored ${integratedRequirements.length} integrated requirements`);
    } catch (error) {
      console.error('Error storing integrated requirements:', error);
      throw error;
    }
  }

  /**
   * 📋 Create integration audit trail
   */
  private static async createIntegrationAuditTrail(
    organizationId: string,
    integratedRequirements: IntegratedRequirement[],
    action: 'integrated' | 'exported' | 'updated'
  ): Promise<IntegrationAuditEntry[]> {
    const auditEntries: IntegrationAuditEntry[] = [];

    for (const requirement of integratedRequirements) {
      const auditEntry: IntegrationAuditEntry = {
        id: `audit-${requirement.id}-${Date.now()}`,
        action,
        performed_by: 'system', // Will be updated with actual user
        performed_by_name: 'System Integration',
        performed_at: new Date().toISOString(),
        details: `${action} requirement "${requirement.title}" with ${requirement.sub_guidance_items.length} sub-guidance items`,
        metadata: {
          category_id: requirement.category_id,
          category_name: requirement.category_name,
          sub_guidance_count: requirement.sub_guidance_items.length,
          approved_items: requirement.sub_guidance_items.filter(item => item.status === 'approved').length
        }
      };

      auditEntries.push(auditEntry);

      // Store in database
      try {
        await supabase
          .from('integration_audit_log')
          .insert({
            id: auditEntry.id,
            organization_id: organizationId,
            requirement_id: requirement.id,
            action: auditEntry.action,
            performed_by: auditEntry.performed_by,
            performed_by_name: auditEntry.performed_by_name,
            performed_at: auditEntry.performed_at,
            details: auditEntry.details,
            metadata: auditEntry.metadata
          });
      } catch (error) {
        console.warn('Failed to store audit entry:', error);
      }
    }

    return auditEntries;
  }

  /**
   * 📤 Export to compliance frameworks
   */
  private static async exportToFrameworks(
    organizationId: string,
    integratedRequirements: IntegratedRequirement[],
    exportFormats: ExportFormat[]
  ): Promise<{ total_exported: number; formats: string[]; export_paths: string[] }> {
    const exportPaths: string[] = [];
    const exportedFormats: string[] = [];
    let totalExported = 0;

    for (const format of exportFormats) {
      try {
        const exportResult = await this.exportToFormat(
          organizationId,
          integratedRequirements,
          format
        );

        if (exportResult.success) {
          exportPaths.push(exportResult.path);
          exportedFormats.push(format.format);
          totalExported += exportResult.requirements_exported;
        }
      } catch (error) {
        console.error(`Failed to export to ${format.format}:`, error);
      }
    }

    return {
      total_exported: totalExported,
      formats: exportedFormats,
      export_paths: exportPaths
    };
  }

  /**
   * 📄 Export to specific format
   */
  private static async exportToFormat(
    organizationId: string,
    integratedRequirements: IntegratedRequirement[],
    format: ExportFormat
  ): Promise<{ success: boolean; path: string; requirements_exported: number }> {
    // This would be implemented based on specific format requirements
    // For now, create a JSON export as baseline
    
    const exportData = {
      format: format.format,
      title: format.title,
      organization_id: organizationId,
      export_timestamp: new Date().toISOString(),
      total_requirements: integratedRequirements.length,
      requirements: integratedRequirements.map(req => ({
        category: req.category_name,
        title: req.title,
        description: req.description,
        sub_guidance: req.sub_guidance_items.map(item => ({
          label: item.label,
          content: item.content,
          sources: item.sources,
          confidence: item.confidence,
          status: item.status,
          reviewer: item.reviewerName
        }))
      }))
    };

    // In real implementation, this would create actual format files
    // For now, store as JSON in database for later retrieval
    const exportPath = `exports/${organizationId}/${format.format}_${Date.now()}.json`;
    
    try {
      await supabase
        .from('requirement_exports')
        .insert({
          organization_id: organizationId,
          export_format: format.format,
          export_path: exportPath,
          export_data: exportData,
          requirements_count: integratedRequirements.length,
          created_at: new Date().toISOString()
        });

      return {
        success: true,
        path: exportPath,
        requirements_exported: integratedRequirements.length
      };
    } catch (error) {
      console.error('Export storage failed:', error);
      return {
        success: false,
        path: '',
        requirements_exported: 0
      };
    }
  }

  /**
   * 📊 Get integration status for dashboard
   */
  static async getIntegrationStatus(organizationId: string): Promise<{
    total_categories: number;
    categories_with_approved_guidance: number;
    integrated_requirements: number;
    pending_integration: number;
    export_formats_available: number;
    last_integration: string | null;
  }> {
    try {
      // Get total categories
      const { count: totalCategories } = await supabase
        .from('unified_compliance_categories')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get integrated requirements
      const { count: integratedCount } = await supabase
        .from('integrated_requirements')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId);

      // Get last integration timestamp
      const { data: lastIntegration } = await supabase
        .from('integrated_requirements')
        .select('integrated_at')
        .eq('organization_id', organizationId)
        .order('integrated_at', { ascending: false })
        .limit(1)
        .single();

      return {
        total_categories: totalCategories || 0,
        categories_with_approved_guidance: 0, // Would calculate from sub-guidance
        integrated_requirements: integratedCount || 0,
        pending_integration: 0, // Would calculate pending items
        export_formats_available: 6, // Standard formats available
        last_integration: lastIntegration?.integrated_at || null
      };
    } catch (error) {
      console.error('Error getting integration status:', error);
      return {
        total_categories: 0,
        categories_with_approved_guidance: 0,
        integrated_requirements: 0,
        pending_integration: 0,
        export_formats_available: 0,
        last_integration: null
      };
    }
  }

  /**
   * 📋 Get available export formats
   */
  static getAvailableExportFormats(): ExportFormat[] {
    return [
      {
        format: 'unified_requirements',
        title: 'Unified Requirements (JSON)',
        description: 'Complete unified requirements with sub-guidance in JSON format',
        mapping_rules: {}
      },
      {
        format: 'iso27001',
        title: 'ISO 27001 Control Set',
        description: 'Map to ISO 27001 Annex A controls with sub-requirements',
        mapping_rules: {
          'access_control': 'A.9',
          'cryptography': 'A.10',
          'physical_security': 'A.11',
          'incident_management': 'A.16'
        }
      },
      {
        format: 'nist_csf',
        title: 'NIST Cybersecurity Framework',
        description: 'Export as NIST CSF categories and subcategories',
        mapping_rules: {
          'access_control': 'PR.AC',
          'incident_management': 'RS',
          'risk_management': 'ID.RM'
        }
      },
      {
        format: 'nis2',
        title: 'NIS2 Directive Requirements',
        description: 'Map to NIS2 directive articles and requirements',
        mapping_rules: {}
      },
      {
        format: 'soc2',
        title: 'SOC 2 Trust Principles',
        description: 'Export as SOC 2 trust service criteria',
        mapping_rules: {}
      },
      {
        format: 'custom',
        title: 'Custom Export Format',
        description: 'Customizable export format with user-defined mapping',
        mapping_rules: {}
      }
    ];
  }
}