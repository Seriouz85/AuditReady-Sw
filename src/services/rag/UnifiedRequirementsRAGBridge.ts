/**
 * Unified Requirements RAG Bridge
 * Seamless connection between unified requirements and RAG-generated guidance
 */

import { supabase } from '@/lib/supabase';
import { EnhancedRAGService } from './EnhancedRAGService';
import { UnifiedRequirementsService } from '../compliance/UnifiedRequirementsService';

export interface RequirementGuidanceMapping {
  requirementId: string;
  category: string;
  frameworkCode: string;
  framework: string;
  requirement: string;
  guidanceId?: string;
  hasGuidance: boolean;
  guidanceQuality?: number;
  lastGenerated?: string;
  needsUpdate: boolean;
}

export interface GuidanceConnectivityReport {
  totalRequirements: number;
  connectedRequirements: number;
  connectivityRate: number;
  categoryBreakdown: {
    category: string;
    totalRequirements: number;
    connectedRequirements: number;
    avgQuality: number;
  }[];
  frameworkBreakdown: {
    framework: string;
    totalRequirements: number;
    connectedRequirements: number;
    avgQuality: number;
  }[];
  qualityDistribution: {
    excellent: number; // > 0.9
    good: number;      // 0.7-0.9
    fair: number;      // 0.5-0.7
    poor: number;      // < 0.5
  };
  recommendations: string[];
}

export interface AutoGuidanceGenerationResult {
  success: boolean;
  generated: number;
  updated: number;
  failed: number;
  errors: string[];
  details: {
    category: string;
    requirements: number;
    guidanceGenerated: boolean;
    quality?: number;
    error?: string;
  }[];
}

export class UnifiedRequirementsRAGBridge {
  /**
   * Analyze connectivity between unified requirements and guidance
   */
  static async analyzeConnectivity(frameworks: {
    iso27001: boolean;
    iso27002: boolean;
    cisControls: boolean;
    gdpr: boolean;
    nis2: boolean;
  }): Promise<GuidanceConnectivityReport> {
    try {
      console.log('[RAG Bridge] Analyzing connectivity between requirements and guidance');

      // Get all unified requirements for selected frameworks
      const unifiedRequirements = await UnifiedRequirementsService.getUnifiedRequirements(frameworks);
      
      // Get existing guidance mappings
      const guidanceMappings = await this.getGuidanceMappings();
      
      // Build connectivity report
      const totalRequirements = unifiedRequirements.length;
      let connectedRequirements = 0;
      const categoryBreakdown: Record<string, { total: number; connected: number; qualitySum: number; qualityCount: number }> = {};
      const frameworkBreakdown: Record<string, { total: number; connected: number; qualitySum: number; qualityCount: number }> = {};
      const qualityDistribution = { excellent: 0, good: 0, fair: 0, poor: 0 };

      // Analyze each requirement
      unifiedRequirements.forEach(req => {
        const mapping = guidanceMappings.find(g => 
          g.category === req.category && g.frameworkCode === req.code
        );

        // Update category breakdown
        if (!categoryBreakdown[req.category]) {
          categoryBreakdown[req.category] = { total: 0, connected: 0, qualitySum: 0, qualityCount: 0 };
        }
        categoryBreakdown[req.category].total++;

        // Update framework breakdown
        const frameworkKey = this.getFrameworkKey(req.framework);
        if (!frameworkBreakdown[frameworkKey]) {
          frameworkBreakdown[frameworkKey] = { total: 0, connected: 0, qualitySum: 0, qualityCount: 0 };
        }
        frameworkBreakdown[frameworkKey].total++;

        if (mapping?.hasGuidance && mapping.guidanceQuality) {
          connectedRequirements++;
          categoryBreakdown[req.category].connected++;
          categoryBreakdown[req.category].qualitySum += mapping.guidanceQuality;
          categoryBreakdown[req.category].qualityCount++;
          
          frameworkBreakdown[frameworkKey].connected++;
          frameworkBreakdown[frameworkKey].qualitySum += mapping.guidanceQuality;
          frameworkBreakdown[frameworkKey].qualityCount++;

          // Quality distribution
          if (mapping.guidanceQuality > 0.9) qualityDistribution.excellent++;
          else if (mapping.guidanceQuality > 0.7) qualityDistribution.good++;
          else if (mapping.guidanceQuality > 0.5) qualityDistribution.fair++;
          else qualityDistribution.poor++;
        }
      });

      // Generate recommendations
      const recommendations = this.generateConnectivityRecommendations(
        totalRequirements,
        connectedRequirements,
        categoryBreakdown,
        qualityDistribution
      );

      return {
        totalRequirements,
        connectedRequirements,
        connectivityRate: totalRequirements > 0 ? connectedRequirements / totalRequirements : 0,
        categoryBreakdown: Object.entries(categoryBreakdown).map(([category, data]) => ({
          category,
          totalRequirements: data.total,
          connectedRequirements: data.connected,
          avgQuality: data.qualityCount > 0 ? data.qualitySum / data.qualityCount : 0
        })),
        frameworkBreakdown: Object.entries(frameworkBreakdown).map(([framework, data]) => ({
          framework,
          totalRequirements: data.total,
          connectedRequirements: data.connected,
          avgQuality: data.qualityCount > 0 ? data.qualitySum / data.qualityCount : 0
        })),
        qualityDistribution,
        recommendations
      };

    } catch (error) {
      console.error('[RAG Bridge] Failed to analyze connectivity:', error);
      throw error;
    }
  }

  /**
   * Generate guidance for all requirements missing guidance
   */
  static async generateMissingGuidance(frameworks: {
    iso27001: boolean;
    iso27002: boolean;
    cisControls: boolean;
    gdpr: boolean;
    nis2: boolean;
  }, batchSize: number = 5): Promise<AutoGuidanceGenerationResult> {
    try {
      console.log('[RAG Bridge] Generating missing guidance for requirements');

      const result: AutoGuidanceGenerationResult = {
        success: true,
        generated: 0,
        updated: 0,
        failed: 0,
        errors: [],
        details: []
      };

      // Get unified requirements
      const unifiedRequirements = await UnifiedRequirementsService.getUnifiedRequirements(frameworks);
      
      // Get existing guidance mappings
      const guidanceMappings = await this.getGuidanceMappings();
      
      // Group requirements by category
      const requirementsByCategory: Record<string, any[]> = {};
      unifiedRequirements.forEach(req => {
        if (!requirementsByCategory[req.category]) {
          requirementsByCategory[req.category] = [];
        }
        requirementsByCategory[req.category].push(req);
      });

      // Process each category
      for (const [category, requirements] of Object.entries(requirementsByCategory)) {
        const categoryDetail = {
          category,
          requirements: requirements.length,
          guidanceGenerated: false,
          quality: undefined,
          error: undefined
        };

        try {
          // Check if category already has good quality guidance
          const existingMapping = guidanceMappings.find(g => 
            g.category === category && g.hasGuidance && (g.guidanceQuality || 0) > 0.8
          );

          if (existingMapping) {
            console.log(`[RAG Bridge] Category ${category} already has high-quality guidance, skipping`);
            categoryDetail.guidanceGenerated = true;
            categoryDetail.quality = existingMapping.guidanceQuality;
            result.details.push(categoryDetail);
            continue;
          }

          // Generate enhanced guidance for this category
          const guidanceResult = await EnhancedRAGService.generateEnhancedGuidance({
            category,
            frameworks,
            complexityLevel: 'intermediate',
            includeImplementationSteps: true,
            includeBestPractices: true,
            includeValidationCriteria: true
          });

          if (guidanceResult.success) {
            // Store the guidance-requirement mapping
            await this.createGuidanceRequirementMapping(
              category,
              requirements,
              guidanceResult.content,
              guidanceResult.qualityScore
            );

            categoryDetail.guidanceGenerated = true;
            categoryDetail.quality = guidanceResult.qualityScore;
            result.generated++;
          } else {
            categoryDetail.error = guidanceResult.errors?.join(', ') || 'Unknown error';
            result.failed++;
            result.errors.push(`${category}: ${categoryDetail.error}`);
          }

        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          categoryDetail.error = errorMsg;
          result.failed++;
          result.errors.push(`${category}: ${errorMsg}`);
        }

        result.details.push(categoryDetail);

        // Add delay between batches to avoid overwhelming the system
        if (result.details.length % batchSize === 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      result.success = result.failed === 0;
      
      console.log(`[RAG Bridge] Guidance generation completed: ${result.generated} generated, ${result.failed} failed`);
      return result;

    } catch (error) {
      console.error('[RAG Bridge] Failed to generate missing guidance:', error);
      return {
        success: false,
        generated: 0,
        updated: 0,
        failed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        details: []
      };
    }
  }

  /**
   * Get guidance for a specific requirement
   */
  static async getGuidanceForRequirement(
    category: string,
    frameworkCode: string,
    frameworks: { [key: string]: boolean }
  ): Promise<{
    hasGuidance: boolean;
    content?: string;
    quality?: number;
    lastGenerated?: string;
    sources?: string[];
  }> {
    try {
      // Check if guidance exists
      const { data: existingGuidance } = await supabase
        .from('requirement_guidance_mappings')
        .select('*')
        .eq('category', category)
        .eq('framework_code', frameworkCode)
        .single();

      if (existingGuidance && existingGuidance.guidance_content) {
        return {
          hasGuidance: true,
          content: existingGuidance.guidance_content,
          quality: existingGuidance.quality_score,
          lastGenerated: existingGuidance.generated_at,
          sources: existingGuidance.sources_used || []
        };
      }

      // Generate new guidance if none exists
      const guidanceResult = await EnhancedRAGService.generateEnhancedGuidance({
        category,
        frameworks,
        complexityLevel: 'intermediate',
        includeImplementationSteps: true,
        includeBestPractices: true,
        includeValidationCriteria: false
      });

      if (guidanceResult.success) {
        // Store the guidance
        await supabase
          .from('requirement_guidance_mappings')
          .upsert({
            category,
            framework_code: frameworkCode,
            guidance_content: guidanceResult.content,
            quality_score: guidanceResult.qualityScore,
            sources_used: guidanceResult.sourcesUsed,
            generated_at: new Date().toISOString()
          });

        return {
          hasGuidance: true,
          content: guidanceResult.content,
          quality: guidanceResult.qualityScore,
          lastGenerated: new Date().toISOString(),
          sources: guidanceResult.sourcesUsed
        };
      }

      return { hasGuidance: false };

    } catch (error) {
      console.error('[RAG Bridge] Failed to get guidance for requirement:', error);
      return { hasGuidance: false };
    }
  }

  /**
   * Update guidance quality threshold and regenerate if needed
   */
  static async updateGuidanceQualityThreshold(
    minQualityThreshold: number = 0.8
  ): Promise<{ updated: number; errors: string[] }> {
    try {
      const { data: lowQualityGuidance } = await supabase
        .from('requirement_guidance_mappings')
        .select('*')
        .lt('quality_score', minQualityThreshold);

      const result = { updated: 0, errors: [] };

      if (lowQualityGuidance) {
        for (const guidance of lowQualityGuidance) {
          try {
            // Regenerate guidance for low-quality items
            const guidanceResult = await EnhancedRAGService.generateEnhancedGuidance({
              category: guidance.category,
              frameworks: { iso27001: true, iso27002: true, cisControls: true, gdpr: true, nis2: true },
              complexityLevel: 'advanced',
              includeImplementationSteps: true,
              includeBestPractices: true,
              includeValidationCriteria: true
            });

            if (guidanceResult.success && guidanceResult.qualityScore > guidance.quality_score) {
              await supabase
                .from('requirement_guidance_mappings')
                .update({
                  guidance_content: guidanceResult.content,
                  quality_score: guidanceResult.qualityScore,
                  sources_used: guidanceResult.sourcesUsed,
                  generated_at: new Date().toISOString()
                })
                .eq('id', guidance.id);

              result.updated++;
            }
          } catch (error) {
            result.errors.push(`Failed to update ${guidance.category}: ${error}`);
          }
        }
      }

      return result;

    } catch (error) {
      console.error('[RAG Bridge] Failed to update guidance quality:', error);
      return { updated: 0, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  // Private helper methods

  private static async getGuidanceMappings(): Promise<RequirementGuidanceMapping[]> {
    try {
      const { data, error } = await supabase
        .from('requirement_guidance_mappings')
        .select('*');

      if (error) throw error;

      return (data || []).map(item => ({
        requirementId: item.requirement_id || '',
        category: item.category,
        frameworkCode: item.framework_code,
        framework: item.framework || '',
        requirement: item.requirement_text || '',
        guidanceId: item.guidance_id,
        hasGuidance: Boolean(item.guidance_content),
        guidanceQuality: item.quality_score,
        lastGenerated: item.generated_at,
        needsUpdate: item.quality_score < 0.7
      }));

    } catch (error) {
      console.error('Failed to get guidance mappings:', error);
      return [];
    }
  }

  private static async createGuidanceRequirementMapping(
    category: string,
    requirements: any[],
    guidanceContent: string,
    qualityScore: number
  ): Promise<void> {
    try {
      const mappings = requirements.map(req => ({
        category,
        framework: req.framework,
        framework_code: req.code,
        requirement_text: req.requirement || req.description,
        guidance_content: guidanceContent,
        quality_score: qualityScore,
        generated_at: new Date().toISOString()
      }));

      await supabase
        .from('requirement_guidance_mappings')
        .upsert(mappings, {
          onConflict: 'category,framework_code'
        });

    } catch (error) {
      console.error('Failed to create guidance-requirement mapping:', error);
      throw error;
    }
  }

  private static getFrameworkKey(framework: string): string {
    const normalizedFramework = framework.toLowerCase();
    if (normalizedFramework.includes('iso 27001') || normalizedFramework.includes('iso27001')) return 'ISO 27001';
    if (normalizedFramework.includes('iso 27002') || normalizedFramework.includes('iso27002')) return 'ISO 27002';
    if (normalizedFramework.includes('cis')) return 'CIS Controls';
    if (normalizedFramework.includes('gdpr')) return 'GDPR';
    if (normalizedFramework.includes('nis2')) return 'NIS2';
    if (normalizedFramework.includes('nist')) return 'NIST';
    return framework;
  }

  private static generateConnectivityRecommendations(
    total: number,
    connected: number,
    categoryBreakdown: Record<string, any>,
    qualityDistribution: any
  ): string[] {
    const recommendations: string[] = [];
    const connectivityRate = connected / total;

    if (connectivityRate < 0.5) {
      recommendations.push('Low connectivity detected. Consider running auto-generation for missing guidance.');
    }

    if (qualityDistribution.poor > 0) {
      recommendations.push(`${qualityDistribution.poor} requirements have poor quality guidance. Consider regenerating with enhanced prompts.`);
    }

    const lowConnectivityCategories = Object.entries(categoryBreakdown)
      .filter(([, data]: [string, any]) => data.connected / data.total < 0.6)
      .map(([category]) => category);

    if (lowConnectivityCategories.length > 0) {
      recommendations.push(`Categories with low connectivity: ${lowConnectivityCategories.join(', ')}`);
    }

    if (connectivityRate > 0.9 && qualityDistribution.excellent / total > 0.8) {
      recommendations.push('Excellent connectivity and quality! Consider this configuration as a template for other assessments.');
    }

    return recommendations;
  }

  /**
   * Get real-time connectivity status for dashboard
   */
  static async getConnectivityStatus(): Promise<{
    status: 'excellent' | 'good' | 'fair' | 'poor';
    percentage: number;
    totalRequirements: number;
    connectedRequirements: number;
    lastUpdated: string;
  }> {
    try {
      const { data } = await supabase
        .from('requirement_guidance_mappings')
        .select('id, quality_score, generated_at')
        .not('guidance_content', 'is', null);

      const totalConnected = data?.length || 0;
      
      // This is a simplified version - in production you'd want to calculate against all requirements
      const estimatedTotal = Math.max(totalConnected * 1.3, 100); // Rough estimate
      const percentage = totalConnected / estimatedTotal;

      let status: 'excellent' | 'good' | 'fair' | 'poor';
      if (percentage > 0.9) status = 'excellent';
      else if (percentage > 0.7) status = 'good';
      else if (percentage > 0.5) status = 'fair';
      else status = 'poor';

      const lastUpdated = data?.reduce((latest, item) => {
        return !latest || item.generated_at > latest ? item.generated_at : latest;
      }, '') || new Date().toISOString();

      return {
        status,
        percentage: Math.round(percentage * 100) / 100,
        totalRequirements: Math.round(estimatedTotal),
        connectedRequirements: totalConnected,
        lastUpdated
      };

    } catch (error) {
      console.error('Failed to get connectivity status:', error);
      return {
        status: 'poor',
        percentage: 0,
        totalRequirements: 0,
        connectedRequirements: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }
}