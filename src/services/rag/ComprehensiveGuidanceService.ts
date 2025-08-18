import { supabase } from '@/lib/supabase';
import { RAGGenerationService } from './RAGGenerationService';

export interface CategoryGuidance {
  category_id: string;
  category_name: string;
  comprehensive_guidance: string;
  frameworks_included: string[];
  confidence_score: number;
  total_requirements: number;
  coverage_percentage: number;
  last_generated: string;
  key_topics: string[];
  implementation_steps: string[];
  compliance_notes: string[];
}

export interface ComprehensiveGuidanceReport {
  categories: CategoryGuidance[];
  overall_coverage: number;
  total_categories: number;
  frameworks_analyzed: string[];
  generation_timestamp: string;
}

export class ComprehensiveGuidanceService {
  
  /**
   * 🧠 Generate comprehensive unified guidance for all categories
   * Using maximum framework coverage for the most complete guidance
   */
  static async generateComprehensiveGuidance(
    organizationId: string,
    options: {
      onProgress?: (progress: number, currentCategory?: string) => void;
      forceRegenerate?: boolean;
      includeAllFrameworks?: boolean;
    } = {}
  ): Promise<ComprehensiveGuidanceReport> {
    const { onProgress, forceRegenerate = false, includeAllFrameworks = true } = options;
    
    try {
      console.log('🧠 Starting comprehensive guidance generation...');
      onProgress?.(5);

      // 1. Load all categories
      const { data: categories, error: categoriesError } = await supabase
        .from('unified_compliance_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (categoriesError) throw categoriesError;

      onProgress?.(15);

      // 2. Load existing comprehensive guidance (if not forcing regeneration)
      let existingGuidance: CategoryGuidance[] = [];
      if (!forceRegenerate) {
        const { data: existing } = await supabase
          .from('category_comprehensive_guidance')
          .select('*')
          .eq('organization_id', organizationId);
        
        existingGuidance = existing || [];
      }

      onProgress?.(25);

      // 3. Get all available frameworks for maximum coverage
      const availableFrameworks = includeAllFrameworks 
        ? await this.getAllAvailableFrameworks()
        : await this.getOrganizationFrameworks(organizationId);

      onProgress?.(35);

      // 4. Generate guidance for each category
      const categoryGuidances: CategoryGuidance[] = [];
      const totalCategories = categories?.length || 0;

      for (let i = 0; i < totalCategories; i++) {
        const category = categories![i];
        onProgress?.(35 + (i / totalCategories) * 60, category.name);

        // Check if we already have recent comprehensive guidance
        const existingCategoryGuidance = existingGuidance.find(eg => eg.category_id === category.id);
        const isRecentEnough = existingCategoryGuidance && 
          new Date(existingCategoryGuidance.last_generated) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days

        if (!forceRegenerate && isRecentEnough) {
          categoryGuidances.push(existingCategoryGuidance);
          continue;
        }

        // Generate comprehensive guidance for this category
        const categoryGuidance = await this.generateCategoryGuidance(
          category,
          availableFrameworks,
          organizationId
        );

        categoryGuidances.push(categoryGuidance);

        // Store the generated guidance
        await this.storeCategoryGuidance(organizationId, categoryGuidance);
      }

      onProgress?.(95);

      // 5. Generate overall report
      const report: ComprehensiveGuidanceReport = {
        categories: categoryGuidances,
        overall_coverage: this.calculateOverallCoverage(categoryGuidances),
        total_categories: totalCategories,
        frameworks_analyzed: availableFrameworks,
        generation_timestamp: new Date().toISOString()
      };

      onProgress?.(100);
      console.log('✅ Comprehensive guidance generation completed');
      
      return report;

    } catch (error) {
      console.error('❌ Comprehensive guidance generation failed:', error);
      throw error;
    }
  }

  /**
   * 🎯 Generate comprehensive guidance for a single category
   */
  private static async generateCategoryGuidance(
    category: any,
    frameworks: string[],
    organizationId: string
  ): Promise<CategoryGuidance> {
    
    try {
      // Create a comprehensive requirement context for this category
      const comprehensiveRequirement = {
        id: `comprehensive-${category.id}`,
        title: `Comprehensive ${category.name} Guidance`,
        description: this.buildCategoryDescription(category, frameworks),
        category_id: category.id,
        organization_id: organizationId,
        category: category
      };

      // Generate guidance using all frameworks
      const frameworkSelection = frameworks.reduce((acc, framework) => {
        acc[framework] = true;
        return acc;
      }, {} as Record<string, boolean>);

      const result = await RAGGenerationService.generateGuidance(
        comprehensiveRequirement,
        category.name,
        frameworkSelection
      );

      // Get requirements count for this category
      const { count: requirementsCount } = await supabase
        .from('unified_requirements')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('organization_id', organizationId);

      // Extract key topics and implementation steps from guidance
      const guidance = result.guidance || '';
      const keyTopics = this.extractKeyTopics(guidance, category.name);
      const implementationSteps = this.extractImplementationSteps(guidance);
      const complianceNotes = this.extractComplianceNotes(guidance, frameworks);

      return {
        category_id: category.id,
        category_name: category.name,
        comprehensive_guidance: guidance,
        frameworks_included: frameworks,
        confidence_score: result.confidence || 0.8,
        total_requirements: requirementsCount || 0,
        coverage_percentage: this.calculateCategoryCoverage(guidance, frameworks),
        last_generated: new Date().toISOString(),
        key_topics: keyTopics,
        implementation_steps: implementationSteps,
        compliance_notes: complianceNotes
      };

    } catch (error) {
      console.error(`Error generating guidance for category ${category.name}:`, error);
      return {
        category_id: category.id,
        category_name: category.name,
        comprehensive_guidance: 'Error generating comprehensive guidance. Please try again.',
        frameworks_included: [],
        confidence_score: 0,
        total_requirements: 0,
        coverage_percentage: 0,
        last_generated: new Date().toISOString(),
        key_topics: [],
        implementation_steps: [],
        compliance_notes: []
      };
    }
  }

  /**
   * 📚 Get all available frameworks for maximum coverage
   */
  private static async getAllAvailableFrameworks(): Promise<string[]> {
    try {
      const { data: knowledgeSources } = await supabase
        .from('knowledge_sources')
        .select('domain, url')
        .eq('status', 'completed')
        .gte('authority_score', 7);

      const frameworks = new Set<string>();
      
      // Add standard frameworks
      frameworks.add('ISO 27001');
      frameworks.add('NIST Cybersecurity Framework');
      frameworks.add('NIS2 Directive');
      frameworks.add('CIS Controls');
      frameworks.add('SOC 2');
      frameworks.add('GDPR');
      frameworks.add('CCPA');

      // Extract frameworks from knowledge sources
      knowledgeSources?.forEach(source => {
        const framework = this.extractFrameworkFromSource(source.domain, source.url);
        if (framework) frameworks.add(framework);
      });

      return Array.from(frameworks);

    } catch (error) {
      console.error('Error getting available frameworks:', error);
      return ['ISO 27001', 'NIST Cybersecurity Framework', 'NIS2 Directive'];
    }
  }

  /**
   * 🏢 Get frameworks specific to organization
   */
  private static async getOrganizationFrameworks(organizationId: string): Promise<string[]> {
    try {
      // This would check what frameworks the organization has selected
      // For now, return all available frameworks for maximum coverage
      return this.getAllAvailableFrameworks();
    } catch (error) {
      console.error('Error getting organization frameworks:', error);
      return [];
    }
  }

  /**
   * 📝 Build comprehensive category description
   */
  private static buildCategoryDescription(category: any, frameworks: string[]): string {
    return `
Provide comprehensive unified guidance for ${category.name} that covers all aspects from multiple compliance frameworks: ${frameworks.join(', ')}.

This guidance should include:
- Detailed implementation requirements and best practices
- Framework-specific compliance considerations
- Risk assessment and management approaches
- Monitoring and measurement criteria
- Documentation and evidence requirements
- Training and awareness considerations
- Incident response procedures where applicable
- Continuous improvement recommendations

The guidance should be practical, actionable, and suitable for enterprise implementation across all specified frameworks.

Category context: ${category.description || 'Core compliance category requiring comprehensive coverage'}
    `.trim();
  }

  /**
   * 🔍 Extract key topics from guidance
   */
  private static extractKeyTopics(guidance: string, categoryName: string): string[] {
    const topics = new Set<string>();
    
    // Common security topics
    const commonTopics = [
      'Risk Assessment', 'Access Control', 'Monitoring', 'Documentation',
      'Training', 'Incident Response', 'Audit', 'Compliance', 'Security Controls',
      'Policy Management', 'Vulnerability Management', 'Data Protection',
      'Physical Security', 'Network Security', 'Cryptography'
    ];

    // Add category-specific topics
    const categorySpecific = this.getCategorySpecificTopics(categoryName);
    
    // Check which topics are mentioned in the guidance
    const guidanceLower = guidance.toLowerCase();
    [...commonTopics, ...categorySpecific].forEach(topic => {
      if (guidanceLower.includes(topic.toLowerCase())) {
        topics.add(topic);
      }
    });

    return Array.from(topics).slice(0, 8); // Limit to top 8 topics
  }

  /**
   * 📋 Extract implementation steps from guidance
   */
  private static extractImplementationSteps(guidance: string): string[] {
    const steps: string[] = [];
    
    // Look for numbered lists, bullet points, or step indicators
    const stepPatterns = [
      /(\d+[\.\)]\s+[^\.]+)/g,
      /(Step\s+\d+[:\s]+[^\.]+)/gi,
      /([•\-\*]\s+[^\.]+)/g
    ];

    stepPatterns.forEach(pattern => {
      const matches = guidance.match(pattern);
      if (matches) {
        matches.slice(0, 5).forEach(match => {
          const cleaned = match.replace(/^\d+[\.\)]\s*|^Step\s+\d+[:\s]*|^[•\-\*]\s*/i, '').trim();
          if (cleaned.length > 20 && cleaned.length < 200) {
            steps.push(cleaned);
          }
        });
      }
    });

    return steps.slice(0, 6); // Limit to top 6 steps
  }

  /**
   * 📄 Extract compliance notes from guidance
   */
  private static extractComplianceNotes(guidance: string, frameworks: string[]): string[] {
    const notes: string[] = [];
    
    frameworks.forEach(framework => {
      const frameworkPattern = new RegExp(
        `(${framework}[^\.]*(?:requires?|mandates?|specifies?)[^\.]*\.)`,
        'gi'
      );
      const matches = guidance.match(frameworkPattern);
      if (matches) {
        notes.push(...matches.slice(0, 2));
      }
    });

    return notes.slice(0, 4); // Limit to top 4 notes
  }

  /**
   * 🎯 Get category-specific topics
   */
  private static getCategorySpecificTopics(categoryName: string): string[] {
    const topicMap: Record<string, string[]> = {
      'access control': ['Authentication', 'Authorization', 'Identity Management', 'Privileged Access'],
      'asset management': ['Asset Inventory', 'Asset Classification', 'Asset Handling', 'Asset Disposal'],
      'cryptography': ['Key Management', 'Encryption Standards', 'Digital Signatures', 'Certificate Management'],
      'physical security': ['Facility Security', 'Equipment Protection', 'Environmental Controls', 'Visitor Management'],
      'incident management': ['Detection', 'Response Procedures', 'Recovery Planning', 'Lessons Learned'],
      'business continuity': ['Continuity Planning', 'Disaster Recovery', 'Emergency Response', 'Testing'],
      'supplier relationships': ['Due Diligence', 'Contract Management', 'Performance Monitoring', 'Risk Assessment']
    };

    const categoryLower = categoryName.toLowerCase();
    for (const [key, topics] of Object.entries(topicMap)) {
      if (categoryLower.includes(key)) {
        return topics;
      }
    }

    return [];
  }

  /**
   * 🔗 Extract framework from knowledge source
   */
  private static extractFrameworkFromSource(domain: string, url: string): string | null {
    const lowerUrl = url.toLowerCase();
    const lowerDomain = domain.toLowerCase();

    if (lowerUrl.includes('iso') && lowerUrl.includes('27001')) return 'ISO 27001';
    if (lowerUrl.includes('nist')) return 'NIST Cybersecurity Framework';
    if (lowerUrl.includes('nis2') || lowerUrl.includes('nis-2')) return 'NIS2 Directive';
    if (lowerUrl.includes('cis') && lowerUrl.includes('control')) return 'CIS Controls';
    if (lowerUrl.includes('soc') && lowerUrl.includes('2')) return 'SOC 2';
    if (lowerUrl.includes('gdpr')) return 'GDPR';
    if (lowerUrl.includes('ccpa')) return 'CCPA';
    
    return null;
  }

  /**
   * 📊 Calculate category coverage percentage
   */
  private static calculateCategoryCoverage(guidance: string, frameworks: string[]): number {
    if (!guidance || guidance.length < 100) return 0;
    
    let coverage = 40; // Base coverage for having guidance
    
    // Add coverage for framework mentions
    frameworks.forEach(framework => {
      if (guidance.toLowerCase().includes(framework.toLowerCase())) {
        coverage += 8;
      }
    });

    // Add coverage for comprehensive elements
    const comprehensiveElements = [
      'implementation', 'monitoring', 'documentation', 'training',
      'risk', 'audit', 'compliance', 'procedures', 'policy'
    ];

    comprehensiveElements.forEach(element => {
      if (guidance.toLowerCase().includes(element)) {
        coverage += 3;
      }
    });

    return Math.min(100, coverage);
  }

  /**
   * 📈 Calculate overall coverage
   */
  private static calculateOverallCoverage(categoryGuidances: CategoryGuidance[]): number {
    if (categoryGuidances.length === 0) return 0;
    
    const totalCoverage = categoryGuidances.reduce((sum, cg) => sum + cg.coverage_percentage, 0);
    return Math.round(totalCoverage / categoryGuidances.length);
  }

  /**
   * 💾 Store category guidance in database
   */
  private static async storeCategoryGuidance(
    organizationId: string, 
    categoryGuidance: CategoryGuidance
  ): Promise<void> {
    try {
      await supabase
        .from('category_comprehensive_guidance')
        .upsert({
          organization_id: organizationId,
          category_id: categoryGuidance.category_id,
          category_name: categoryGuidance.category_name,
          comprehensive_guidance: categoryGuidance.comprehensive_guidance,
          frameworks_included: categoryGuidance.frameworks_included,
          confidence_score: categoryGuidance.confidence_score,
          total_requirements: categoryGuidance.total_requirements,
          coverage_percentage: categoryGuidance.coverage_percentage,
          key_topics: categoryGuidance.key_topics,
          implementation_steps: categoryGuidance.implementation_steps,
          compliance_notes: categoryGuidance.compliance_notes,
          last_generated: categoryGuidance.last_generated,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error storing category guidance:', error);
      // Don't throw - guidance generation can succeed without storage
    }
  }

  /**
   * 📖 Load existing comprehensive guidance
   */
  static async loadComprehensiveGuidance(organizationId: string): Promise<CategoryGuidance[]> {
    try {
      const { data, error } = await supabase
        .from('category_comprehensive_guidance')
        .select('*')
        .eq('organization_id', organizationId)
        .order('category_name');

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Error loading comprehensive guidance:', error);
      return [];
    }
  }
}