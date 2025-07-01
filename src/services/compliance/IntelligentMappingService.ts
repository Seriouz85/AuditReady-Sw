import { supabase } from '@/lib/supabase';

export interface FrameworkRequirement {
  id: string;
  code: string;
  title: string;
  description: string;
  standardName: string;
  chapter?: string;
  section?: string;
}

export interface MappedRequirements {
  [categoryName: string]: {
    [frameworkKey: string]: FrameworkRequirement[];
  };
}

export class IntelligentMappingService {
  /**
   * Get requirements mapped to categories using intelligent mapping tables
   */
  async getIntelligentlyMappedRequirements(
    categories: Array<{ id: string; name: string }>,
    selectedFrameworks: string[]
  ): Promise<MappedRequirements> {
    try {
      const result: MappedRequirements = {};

      // Initialize result structure
      for (const category of categories) {
        result[category.name] = {
          iso27001: [],
          iso27002: [],
          cisControls: [],
          nis2: [],
          gdpr: []
        };
      }

      // Get framework control mappings
      const { data: mappings, error: mappingError } = await supabase
        .from('framework_control_mappings')
        .select(`
          *,
          category:unified_compliance_categories(id, name)
        `)
        .in('target_category_id', categories.map(c => c.id));

      if (mappingError) throw mappingError;

      // Build framework queries based on mappings
      const frameworkQueries: Array<{ framework: string; conditions: Array<{ chapter?: string; section?: string }> }> = [];

      // Group mappings by framework
      const frameworkMappings = new Map<string, Array<any>>();
      for (const mapping of mappings || []) {
        const framework = mapping.source_framework;
        if (!frameworkMappings.has(framework)) {
          frameworkMappings.set(framework, []);
        }
        frameworkMappings.get(framework)!.push(mapping);
      }

      // Build queries for each framework
      if (selectedFrameworks.includes('cisControls') && frameworkMappings.has('CIS Controls')) {
        const cisConditions = frameworkMappings.get('CIS Controls')!.map(m => ({
          chapter: m.source_chapter
        }));
        frameworkQueries.push({ framework: 'CIS Controls', conditions: cisConditions });
      }

      if (selectedFrameworks.includes('iso27001') && frameworkMappings.has('ISO 27001')) {
        const isoConditions = frameworkMappings.get('ISO 27001')!.map(m => ({
          section: m.source_section
        }));
        frameworkQueries.push({ framework: 'ISO 27001', conditions: isoConditions });
      }

      if (selectedFrameworks.includes('iso27002') && frameworkMappings.has('ISO 27002')) {
        const isoConditions = frameworkMappings.get('ISO 27002')!.map(m => ({
          section: m.source_section
        }));
        frameworkQueries.push({ framework: 'ISO 27002', conditions: isoConditions });
      }

      if (selectedFrameworks.includes('gdpr') && frameworkMappings.has('GDPR')) {
        const gdprConditions = frameworkMappings.get('GDPR')!.map(m => ({
          chapter: m.source_chapter
        }));
        frameworkQueries.push({ framework: 'GDPR', conditions: gdprConditions });
      }

      // Fetch requirements based on mappings
      for (const query of frameworkQueries) {
        const { data: requirements, error: reqError } = await this.fetchFrameworkRequirements(
          query.framework,
          query.conditions
        );

        if (reqError) {
          console.error(`Error fetching ${query.framework} requirements:`, reqError);
          continue;
        }

        // Map requirements to categories based on control mappings
        for (const req of requirements || []) {
          // Find which category this requirement belongs to
          const mapping = mappings?.find(m => 
            m.source_framework === query.framework &&
            (m.source_chapter === req.chapter || m.source_section === req.section)
          );

          if (mapping && mapping.category) {
            const categoryName = mapping.category.name;
            const frameworkKey = this.getFrameworkKey(query.framework);
            
            if (result[categoryName] && result[categoryName][frameworkKey]) {
              result[categoryName][frameworkKey].push({
                id: req.id,
                code: req.control_id || req.section || 'N/A',
                title: req.title || '',
                description: req.description || '',
                standardName: req.standard?.name || query.framework,
                chapter: req.chapter,
                section: req.section
              });
            }
          }
        }
      }

      // Sort requirements by code
      for (const category of Object.keys(result)) {
        for (const framework of Object.keys(result[category])) {
          result[category][framework].sort((a, b) => 
            a.code.localeCompare(b.code, undefined, { numeric: true })
          );
        }
      }

      return result;
    } catch (error) {
      console.error('Error in intelligent mapping:', error);
      return {};
    }
  }

  /**
   * Fetch framework requirements based on conditions
   */
  private async fetchFrameworkRequirements(
    frameworkName: string,
    conditions: Array<{ chapter?: string; section?: string }>
  ): Promise<any[]> {
    try {
      // Get standard ID
      const { data: standard, error: standardError } = await supabase
        .from('standards_library')
        .select('id')
        .ilike('name', `%${frameworkName}%`)
        .single();

      if (standardError || !standard) return [];

      // Build query for requirements
      let query = supabase
        .from('requirements_library')
        .select(`
          id,
          control_id,
          title,
          description,
          category,
          standard:standards_library(id, name)
        `)
        .eq('standard_id', standard.id);

      // For CIS Controls, filter by control_id prefix (chapter-based)
      if (frameworkName === 'CIS Controls' && conditions.length > 0) {
        const chapterNumbers = conditions
          .map(c => c.chapter?.match(/Chapter (\d+)/)?.[1])
          .filter(Boolean);
        
        if (chapterNumbers.length > 0) {
          // CIS control IDs are like "1.1", "2.3", etc.
          const controlPrefixes = chapterNumbers.map(n => `${n}.`);
          query = query.or(controlPrefixes.map(prefix => `control_id.ilike.${prefix}%`).join(','));
        }
      }
      
      // For ISO standards, filter by control_id prefix
      if ((frameworkName.includes('ISO 27001') || frameworkName.includes('ISO 27002')) && conditions.length > 0) {
        const sections = conditions.map(c => c.section).filter(Boolean);
        if (sections.length > 0) {
          query = query.or(sections.map(section => `control_id.ilike.${section}%`).join(','));
        }
      }

      const { data: requirements, error } = await query;

      if (error) throw error;

      // Add chapter/section info to requirements
      return (requirements || []).map(req => ({
        ...req,
        chapter: this.extractChapter(req.control_id, frameworkName),
        section: this.extractSection(req.control_id, frameworkName)
      }));
    } catch (error) {
      console.error(`Error fetching requirements for ${frameworkName}:`, error);
      return [];
    }
  }

  /**
   * Extract chapter from control ID
   */
  private extractChapter(controlId: string, frameworkName: string): string | undefined {
    if (frameworkName === 'CIS Controls' && controlId) {
      const match = controlId.match(/^(\d+)\./);
      return match ? `Chapter ${match[1]}` : undefined;
    }
    return undefined;
  }

  /**
   * Extract section from control ID
   */
  private extractSection(controlId: string, frameworkName: string): string | undefined {
    if (frameworkName.includes('ISO') && controlId) {
      const match = controlId.match(/^([A-Z]?\d+(?:\.\d+)?)/);
      return match ? match[1] : undefined;
    }
    return controlId;
  }

  /**
   * Get framework key for result mapping
   */
  private getFrameworkKey(frameworkName: string): string {
    if (frameworkName.includes('ISO 27001')) return 'iso27001';
    if (frameworkName.includes('ISO 27002')) return 'iso27002';
    if (frameworkName.includes('CIS Controls')) return 'cisControls';
    if (frameworkName.includes('GDPR')) return 'gdpr';
    if (frameworkName.includes('NIS2')) return 'nis2';
    return frameworkName.toLowerCase();
  }

  /**
   * Get aggregated requirements for a unified requirement
   */
  async getAggregatedRequirements(unifiedRequirementId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('aggregated_requirements')
        .select(`
          *,
          rule:aggregation_rules(*),
          unified:unified_requirements(*)
        `)
        .eq('unified_requirement_id', unifiedRequirementId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching aggregated requirements:', error);
      return [];
    }
  }

  /**
   * Get requirement clusters for intelligent grouping
   */
  async getRequirementClusters(categoryId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('requirement_clusters')
        .select(`
          *,
          members:requirement_cluster_members(
            *,
            requirement:requirements_library(
              *,
              standard:standards_library(*)
            )
          )
        `)
        .eq('unified_category_id', categoryId)
        .order('cluster_strength', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching requirement clusters:', error);
      return [];
    }
  }
}

export const intelligentMappingService = new IntelligentMappingService();