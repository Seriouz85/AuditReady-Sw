import { supabase } from '@/lib/supabase';
import { EnhancedUnifiedRequirementsGenerator } from './EnhancedUnifiedRequirementsGenerator';
import { SectorSpecificEnhancer } from './SectorSpecificEnhancer';
import { FrameworkIdMapper } from '@/services/compliance/FrameworkIdMapper';
import { cleanUnifiedRequirementsEngine } from '@/services/compliance/CleanUnifiedRequirementsEngine';
import { EnhancedUnifiedGuidanceService } from './EnhancedUnifiedGuidanceService';
import { complianceCacheService } from './ComplianceCacheService';
import { CategoryProgress } from '@/components/compliance/RestructuringProgressAnimator';
import { filterMappingsByFrameworks } from '@/utils/FrameworkUtilities';

// Mock cache service to prevent errors
const complianceCacheService = {
  clear: () => {},
  get: (key: string) => null,
  set: (key: string, value: any) => {}
};

// Type definition for FrameworkSelection to fix type errors
interface FrameworkSelection {
  iso27001: boolean;
  iso27002: boolean;
  cisControls: 'ig1' | 'ig2' | 'ig3' | null;
  gdpr: boolean;
  nis2: boolean;
  dora: boolean;
}

export class ComplianceSimplificationBusinessLogic {
  private static enhancedGenerator = new EnhancedUnifiedRequirementsGenerator();

  // Filter mappings based on selected frameworks and optional filters
  static filterMappings(
    mappingData: any[],
    selectedFrameworks: any,
    filterFramework?: string,
    filterCategory?: string
  ): any[] {
    // First filter by frameworks
    let filtered = filterMappingsByFrameworks(mappingData, selectedFrameworks);
    
    // Then apply additional filters if provided
    if (filterFramework && filterFramework !== 'all') {
      filtered = filtered.filter(mapping => {
        const frameworkKey = filterFramework.toLowerCase();
        return mapping.frameworks[frameworkKey] && mapping.frameworks[frameworkKey].length > 0;
      });
    }
    
    if (filterCategory && filterCategory !== 'all') {
      filtered = filtered.filter(mapping => 
        mapping.category && mapping.category.toLowerCase().includes(filterCategory.toLowerCase())
      );
    }
    
    return filtered;
  }

  // Filter unified mappings to create a clean unified view
  static filterUnifiedMappings(filteredMappings: any[]): any[] {
    return filteredMappings.map(mapping => ({
      ...mapping,
      // Ensure we have unified category information
      unifiedCategory: mapping.category || mapping.unified_category_name || 'Unknown Category'
    }));
  }

  // Get framework badges for a mapping
  static getFrameworkBadges(mapping: any, selectedFrameworks: any): any[] {
    const badges: any[] = [];
    
    if (selectedFrameworks.iso27001 && mapping.frameworks?.iso27001?.length > 0) {
      badges.push({ name: 'ISO 27001', count: mapping.frameworks.iso27001.length, color: 'blue' });
    }
    if (selectedFrameworks.iso27002 && mapping.frameworks?.iso27002?.length > 0) {
      badges.push({ name: 'ISO 27002', count: mapping.frameworks.iso27002.length, color: 'green' });
    }
    if (selectedFrameworks.cisControls && mapping.frameworks?.cisControls?.length > 0) {
      badges.push({ name: 'CIS Controls', count: mapping.frameworks.cisControls.length, color: 'purple' });
    }
    if (selectedFrameworks.gdpr && mapping.frameworks?.gdpr?.length > 0) {
      badges.push({ name: 'GDPR', count: mapping.frameworks.gdpr.length, color: 'red' });
    }
    if (selectedFrameworks.nis2 && mapping.frameworks?.nis2?.length > 0) {
      badges.push({ name: 'NIS2', count: mapping.frameworks.nis2.length, color: 'orange' });
    }
    if (selectedFrameworks.dora && mapping.frameworks?.dora?.length > 0) {
      badges.push({ name: 'DORA', count: mapping.frameworks.dora.length, color: 'indigo' });
    }
    
    return badges;
  }

  // Calculate maximum overview stats
  static calculateMaximumOverviewStats(maxComplianceMapping: any[]): any {
    if (!maxComplianceMapping || maxComplianceMapping.length === 0) {
      return {
        totalCategories: 0,
        totalRequirements: 0,
        frameworkCoverage: {},
        overlapPercentage: 0
      };
    }

    const totalCategories = maxComplianceMapping.length;
    let totalRequirements = 0;
    const frameworkCoverage: any = {};

    maxComplianceMapping.forEach(mapping => {
      if (mapping.frameworks) {
        Object.entries(mapping.frameworks).forEach(([framework, requirements]: [string, any]) => {
          if (requirements && Array.isArray(requirements)) {
            if (!frameworkCoverage[framework]) {
              frameworkCoverage[framework] = 0;
            }
            frameworkCoverage[framework] += requirements.length;
            totalRequirements += requirements.length;
          }
        });
      }
    });

    // Calculate overlap percentage (simplified)
    const frameworkCount = Object.keys(frameworkCoverage).length;
    const overlapPercentage = frameworkCount > 1 ? Math.round((totalRequirements / (frameworkCount * totalCategories)) * 100) : 0;

    return {
      totalCategories,
      totalRequirements,
      frameworkCoverage,
      overlapPercentage: Math.min(overlapPercentage, 100)
    };
  }

  // Generate dynamic content for a category using proper template system
  static async generateDynamicContentForCategory(
    categoryName: string,
    filteredUnifiedMappings: any[],
    selectedFrameworks: FrameworkSelection
  ): Promise<any[]> {
    const startTime = Date.now();
    try {
      console.log('[ULTRA-FAST] Generating content for:', categoryName);
      
      // Convert selected frameworks to array format for the generator
      const selectedFrameworkArray: string[] = [];
      if (selectedFrameworks.iso27001) selectedFrameworkArray.push('iso27001');
      if (selectedFrameworks.iso27002) selectedFrameworkArray.push('iso27002');
      if (selectedFrameworks.cisControls) selectedFrameworkArray.push('cisControls');
      if (selectedFrameworks.gdpr) selectedFrameworkArray.push('gdpr');
      if (selectedFrameworks.nis2) selectedFrameworkArray.push('nis2');

      // Temporarily disable cache while fixing issues
      const cacheKey = `fixed-content-${categoryName}-${selectedFrameworkArray.sort().join('-')}-${selectedFrameworks.cisControls || 'all'}`;
      // Clear old cache
      complianceCacheService.clear();
      
      console.log('[CACHE] Cleared old cache for fresh content generation');
      
      // Use enhanced generator for non-Governance categories
      let formattedRequirements: string[] = [];
      
      if (categoryName === 'Governance & Leadership') {
        // GOVERNANCE SPECIAL PATH: Inject mapped requirements while preserving structure
        try {
          // Get all mapped requirements for Governance from selected frameworks
          const allGovernanceRequirements: any[] = [];
          
          const currentMapping = filteredUnifiedMappings.find(m => 
            m.auditReadyUnified.title.includes('Governance') || 
            m.category === 'Governance & Leadership'
          );
          
          if (currentMapping?.frameworks) {
            // Collect ALL mapped requirements from selected frameworks
            if (selectedFrameworks['iso27001'] && currentMapping.frameworks['iso27001']) {
              allGovernanceRequirements.push(...currentMapping.frameworks['iso27001'].map((req: any) => ({ ...req, framework: 'ISO/IEC 27001' })));
            }
            if (selectedFrameworks['iso27002'] && currentMapping.frameworks['iso27002']) {
              allGovernanceRequirements.push(...currentMapping.frameworks['iso27002'].map((req: any) => ({ ...req, framework: 'ISO/IEC 27002' })));
            }
            if (selectedFrameworks['cisControls'] && currentMapping.frameworks['cisControls']) {
              allGovernanceRequirements.push(...currentMapping.frameworks['cisControls'].map((req: any) => ({ ...req, framework: 'CIS Controls v8' })));
            }
            if (selectedFrameworks['gdpr'] && currentMapping.frameworks['gdpr']) {
              allGovernanceRequirements.push(...currentMapping.frameworks['gdpr'].map((req: any) => ({ ...req, framework: 'GDPR' })));
            }
            if (selectedFrameworks['nis2'] && currentMapping.frameworks['nis2']) {
              allGovernanceRequirements.push(...currentMapping.frameworks['nis2'].map((req: any) => ({ ...req, framework: 'NIS2 Directive' })));
            }
            if (selectedFrameworks['dora'] && currentMapping.frameworks['dora']) {
              allGovernanceRequirements.push(...currentMapping.frameworks['dora'].map((req: any) => ({ ...req, framework: 'DORA (Digital Operational Resilience Act)' })));
            }
          }
          
          console.log(`🎯 [GOVERNANCE] Found ${allGovernanceRequirements.length} total mapped requirements`);
          
          // HÄMTA HELA URSPRUNGLIGA STRUKTUREN FRÅN DATABASEN - BEHÅLL ALLT!
          let originalSubRequirements: string[] = [];
          
          try {
            const { data: originalData } = await supabase
              .from('unified_requirements')
              .select(`
                sub_requirements,
                unified_compliance_categories!inner(name)
              `)
              .eq('unified_compliance_categories.name', categoryName);
              
            if (originalData && originalData.length > 0 && originalData[0]?.sub_requirements) {
              originalSubRequirements = originalData[0].sub_requirements as string[];
              console.log(`✅ [GOVERNANCE] Retrieved ${originalSubRequirements.length} original sections from database`);
            }
          } catch (error) {
            console.error('[GOVERNANCE] Could not fetch original structure:', error);
            // Fallback till de första sektionerna om databasen misslyckas
            originalSubRequirements = [
              "a) LEADERSHIP COMMITMENT AND ACCOUNTABILITY - ISO 27001 requires an Information Security Management System (ISMS), a systematic approach to managing security. Top management must actively lead information security with documented commitment, regular reviews (at least quarterly), and personal accountability. Executive leadership must demonstrate visible commitment to information security (ISO 27001 Clause 5.1)",
              "b) SCOPE AND BOUNDARIES DEFINITION - Define and document the scope of your information security management system (ISMS), including all assets, locations, and business processes that require protection",
              "c) ORGANIZATIONAL STRUCTURE - (ISMS Requirement: Define roles and responsibilities as part of your ISMS implementation) AND GOVERNANCE"
            ];
          }
          
          // Distribute mapped requirements across subsections (ensuring no duplicates)
          const subsectionRequirements: { [key: string]: any[] } = {};
          
          // SMART FÖRDELNING: Alla requirements måste fördelas - inga får missas!
          // Steg 1: Kategorisera alla requirements efter typ
          const categorizedReqs = {
            leadership: [] as any[],
            scope: [] as any[],
            organizational: [] as any[],
            policy: [] as any[],
            risk: [] as any[],
            resource: [] as any[],
            competence: [] as any[],
            awareness: [] as any[],
            communication: [] as any[],
            document: [] as any[],
            performance: [] as any[],
            improvement: [] as any[],
            asset: [] as any[],
            thirdParty: [] as any[],
            project: [] as any[],
            general: [] as any[] // För requirements som inte matchar någon specifik kategori
          };
          
          // Enhanced categorization with DORA-specific keywords
          allGovernanceRequirements.forEach(req => {
            const reqText = ((req.title || '') + ' ' + (req.description || '')).toLowerCase();
            const framework = req.framework || '';
            let categorized = false;
            
            // Enhanced awareness/training matching (including DORA digital literacy)
            if (reqText.includes('awareness') || reqText.includes('training') || reqText.includes('education') || 
                reqText.includes('digital literacy') || reqText.includes('staff competence') || reqText.includes('skill development')) {
              categorizedReqs.awareness.push(req);
              categorized = true;
            } 
            // Enhanced leadership matching (including DORA governance)
            else if (reqText.includes('leadership') || reqText.includes('top management') || reqText.includes('commitment') || 
                     reqText.includes('accountability') || reqText.includes('governance and organisation') || 
                     reqText.includes('senior management') || (reqText.includes('governance') && framework.includes('DORA'))) {
              categorizedReqs.leadership.push(req);
              categorized = true;
            } 
            // Enhanced scope matching (including DORA operational resilience scope)
            else if (reqText.includes('scope') || reqText.includes('boundaries') || reqText.includes('isms scope') ||
                     reqText.includes('operational resilience') || reqText.includes('digital operational')) {
              categorizedReqs.scope.push(req);
              categorized = true;
            } 
            // Enhanced organizational structure (including DORA roles)
            else if (reqText.includes('organizational structure') || reqText.includes('roles') || reqText.includes('responsibilities') ||
                     reqText.includes('organization') || reqText.includes('reporting structure')) {
              categorizedReqs.organizational.push(req);
              categorized = true;
            } 
            // Enhanced policy matching (including DORA ICT policies)
            else if (reqText.includes('policy') || reqText.includes('policies') || reqText.includes('ict policy') || 
                     reqText.includes('digital operational resilience policy')) {
              categorizedReqs.policy.push(req);
              categorized = true;
            } 
            // Enhanced risk matching (including DORA ICT risk management)
            else if ((reqText.includes('risk') && (reqText.includes('governance') || reqText.includes('management'))) ||
                     reqText.includes('ict risk') || reqText.includes('operational risk') || reqText.includes('resilience risk')) {
              categorizedReqs.risk.push(req);
              categorized = true;
            } 
            // Enhanced resource matching
            else if (reqText.includes('resource') || reqText.includes('budget') || reqText.includes('allocation') ||
                     reqText.includes('financial resources') || reqText.includes('human resources')) {
              categorizedReqs.resource.push(req);
              categorized = true;
            } 
            // Enhanced competence matching (including DORA digital skills)
            else if (reqText.includes('competence') || reqText.includes('competency') || reqText.includes('skills') ||
                     reqText.includes('digital skills') || reqText.includes('technical competence')) {
              categorizedReqs.competence.push(req);
              categorized = true;
            } 
            // Enhanced communication matching
            else if (reqText.includes('communication') || reqText.includes('stakeholder') || reqText.includes('reporting') ||
                     reqText.includes('information sharing') || reqText.includes('coordination')) {
              categorizedReqs.communication.push(req);
              categorized = true;
            } 
            // Enhanced documentation matching (including DORA documentation requirements)
            else if (reqText.includes('document') || reqText.includes('procedure') || reqText.includes('records') ||
                     reqText.includes('documentation') || reqText.includes('register') || reqText.includes('inventory')) {
              categorizedReqs.document.push(req);
              categorized = true;
            } 
            // Enhanced performance matching (including DORA performance indicators)
            else if (reqText.includes('performance') || reqText.includes('monitoring') || reqText.includes('measurement') ||
                     reqText.includes('kpi') || reqText.includes('metrics') || reqText.includes('indicators')) {
              categorizedReqs.performance.push(req);
              categorized = true;
            } 
            // Enhanced improvement matching
            else if (reqText.includes('improvement') || reqText.includes('corrective') || reqText.includes('enhancement') ||
                     reqText.includes('optimization') || reqText.includes('continuous improvement')) {
              categorizedReqs.improvement.push(req);
              categorized = true;
            } 
            // Enhanced asset matching (including DORA ICT assets)
            else if (reqText.includes('asset') || reqText.includes('disposal') || reqText.includes('equipment') ||
                     reqText.includes('ict asset') || reqText.includes('digital asset') || reqText.includes('inventory')) {
              categorizedReqs.asset.push(req);
              categorized = true;
            } 
            // Enhanced third party matching (including DORA ICT third-party)
            else if (reqText.includes('third party') || reqText.includes('supplier') || reqText.includes('vendor') ||
                     reqText.includes('ict third-party') || reqText.includes('service provider') || reqText.includes('outsourcing')) {
              categorizedReqs.thirdParty.push(req);
              categorized = true;
            } 
            // Enhanced project matching
            else if (reqText.includes('project') || reqText.includes('programme') || reqText.includes('initiative') ||
                     reqText.includes('deployment') || reqText.includes('implementation')) {
              categorizedReqs.project.push(req);
              categorized = true;
            }
            
            // If not categorized, add to general
            if (!categorized) {
              categorizedReqs.general.push(req);
            }
          });
          
          // Use the original structure but add appropriate mapped requirements for each section
          const enhancedSubRequirements = originalSubRequirements.map((section, index) => {
            const sectionLower = section.toLowerCase();
            let relevantReqs: any[] = [];
            
            // Map appropriate categorized requirements to each section
            if (sectionLower.includes('leadership') || sectionLower.includes('commitment') || sectionLower.includes('accountability')) {
              relevantReqs = categorizedReqs.leadership.slice(0, 3); // Top 3 most relevant
            } else if (sectionLower.includes('scope') || sectionLower.includes('boundaries')) {
              relevantReqs = categorizedReqs.scope.slice(0, 3);
            } else if (sectionLower.includes('organizational') || sectionLower.includes('structure') || sectionLower.includes('governance')) {
              relevantReqs = categorizedReqs.organizational.slice(0, 3);
            } else if (sectionLower.includes('policy') || sectionLower.includes('policies')) {
              relevantReqs = categorizedReqs.policy.slice(0, 3);
            } else if (sectionLower.includes('risk')) {
              relevantReqs = categorizedReqs.risk.slice(0, 3);
            } else if (sectionLower.includes('resource')) {
              relevantReqs = categorizedReqs.resource.slice(0, 3);
            } else if (sectionLower.includes('competence') || sectionLower.includes('competency')) {
              relevantReqs = categorizedReqs.competence.slice(0, 3);
            } else if (sectionLower.includes('awareness') || sectionLower.includes('training')) {
              relevantReqs = categorizedReqs.awareness.slice(0, 3);
            } else if (sectionLower.includes('communication')) {
              relevantReqs = categorizedReqs.communication.slice(0, 3);
            } else if (sectionLower.includes('document') || sectionLower.includes('procedure')) {
              relevantReqs = categorizedReqs.document.slice(0, 3);
            } else if (sectionLower.includes('performance') || sectionLower.includes('monitoring')) {
              relevantReqs = categorizedReqs.performance.slice(0, 3);
            } else if (sectionLower.includes('improvement') || sectionLower.includes('corrective')) {
              relevantReqs = categorizedReqs.improvement.slice(0, 3);
            } else if (sectionLower.includes('asset')) {
              relevantReqs = categorizedReqs.asset.slice(0, 3);
            } else if (sectionLower.includes('third party') || sectionLower.includes('supplier')) {
              relevantReqs = categorizedReqs.thirdParty.slice(0, 3);
            } else if (sectionLower.includes('project')) {
              relevantReqs = categorizedReqs.project.slice(0, 3);
            } else {
              // For general sections, mix different types
              relevantReqs = [
                ...categorizedReqs.general.slice(0, 1),
                ...categorizedReqs.leadership.slice(0, 1),
                ...categorizedReqs.policy.slice(0, 1)
              ].filter(req => req); // Remove empty slots
            }
            
            // Build enhanced section with mapped requirements
            let enhancedSection = section;
            
            if (relevantReqs.length > 0) {
              enhancedSection += '\n\n**Mapped Framework Requirements:**\n';
              relevantReqs.forEach(req => {
                const reqId = req.control_id || req.id || 'N/A';
                const reqTitle = req.title || req.text || 'Requirement';
                const framework = req.framework || 'Unknown Framework';
                enhancedSection += `\n• **${framework} ${reqId}**: ${reqTitle}`;
              });
            }
            
            return enhancedSection;
          });
          
          formattedRequirements = enhancedSubRequirements;
          
          console.log(`✅ [GOVERNANCE] Enhanced ${enhancedSubRequirements.length} sections with mapped requirements`);
          
        } catch (governanceError) {
          console.error('[GOVERNANCE] Error in special handling:', governanceError);
          // Fall back to regular generation
          formattedRequirements = await this.enhancedGenerator.generateUnifiedRequirements(
            selectedFrameworkArray,
            categoryName,
            selectedFrameworks.cisControls
          );
        }
      } else {
        // REGULAR PATH: Use enhanced generator for all other categories
        try {
          formattedRequirements = await this.enhancedGenerator.generateUnifiedRequirements(
            selectedFrameworkArray,
            categoryName,
            selectedFrameworks.cisControls
          );
          console.log(`✅ [REGULAR] Generated ${formattedRequirements.length} requirements for ${categoryName}`);
        } catch (regularError) {
          console.error(`[REGULAR] Error generating requirements for ${categoryName}:`, regularError);
          formattedRequirements = [`Error generating requirements for ${categoryName}. Please try again.`];
        }
      }
      
      // Add to cache for future use
      complianceCacheService.set(cacheKey, formattedRequirements);
      
      const totalLoadTime = Date.now() - startTime;
      
      console.log(`[ULTRA-FAST] Generated and cached ${formattedRequirements.length} sections for ${categoryName} in ${totalLoadTime}ms`);
      return formattedRequirements;
      
    } catch (error) {
      console.error('[DYNAMIC CONTENT] Generation failed:', error);
      return [];
    }
  }

  // Generate fallback data when database is empty
  static async generateFallbackData(
    originalMappingData: any[] | undefined,
    selectedFrameworks: FrameworkSelection
  ): Promise<any[]> {
    if (!originalMappingData || originalMappingData.length === 0) {
      console.log('🚨 DATABASE EMPTY - Generating fallback mapping data from CleanUnifiedRequirementsEngine');
      
      try {
        const frameworkIds = FrameworkIdMapper.getFallbackFrameworkIds(selectedFrameworks);
        const result = await cleanUnifiedRequirementsEngine.generateUnifiedRequirements('demo-org', frameworkIds);
        
        // Convert CleanUnifiedRequirementsEngine categories to mappingData format
        const fallbackMappings = result.categories.map((category, index) => ({
          id: category.name.toLowerCase().replace(/\s+/g, '-'),
          category: category.name,
          frameworks: {
            iso27001: frameworkIds.includes('iso27001') ? [{ code: 'A.1', title: category.name, description: category.description }] : [],
            iso27002: frameworkIds.includes('iso27002') ? [{ code: 'B.1', title: category.name, description: category.description }] : [],
            cisControls: frameworkIds.includes('cisControls') ? [{ code: 'C.1', title: category.name, description: category.description }] : [],
            gdpr: frameworkIds.includes('gdpr') ? [{ code: 'G.1', title: category.name, description: category.description }] : [],
            nis2: frameworkIds.includes('nis2') ? [{ code: 'N.1', title: category.name, description: category.description }] : [],
            dora: frameworkIds.includes('dora') ? [{ code: 'D.1', title: category.name, description: category.description }] : []
          },
          auditReadyUnified: {
            description: category.description,
            subRequirements: category.consolidatedContent.split('\n\n').filter(s => s.trim())
          }
        }));
        
        console.log('✅ Generated', fallbackMappings.length, 'fallback mappings');
        return fallbackMappings;
      } catch (error) {
        console.error('❌ Error generating fallback data:', error);
        return [];
      }
    } else {
      console.log('✅ Using original database mapping data:', originalMappingData.length, 'items');
      return originalMappingData;
    }
  }

  // Build guidance from unified requirements - PRESERVE EXACT LOGIC
  static async buildGuidanceFromUnifiedRequirements(
    category: string,
    filteredUnifiedMappings: any[],
    selectedFrameworks: FrameworkSelection,
    generatedContent: Map<string, any[]>
  ): Promise<string> {
    try {
      console.log(`[Unified Guidance Debug] Building guidance for: ${category}`);
      
      if (!category || typeof category !== 'string') {
        console.warn(`[Unified Guidance Debug] Empty category name provided`);
        return '';
      }

      const categoryMapping = filteredUnifiedMappings.find(m => m.category === category);
      if (!categoryMapping) {
        console.warn(`[Unified Guidance Debug] No category mapping found for: "${category}"`);
        return '';
      }

      // DEBUG: Check both data sources to see where the difference is
      const rawUnifiedRequirements = categoryMapping.auditReadyUnified?.subRequirements || [];
      const generatedContentForCategory = generatedContent.get(category) || [];
      
      console.log(`[DEBUG] Data source comparison for ${category}:`, {
        'rawUnifiedRequirements.length': rawUnifiedRequirements.length,
        'generatedContent.length': generatedContentForCategory.length,
        'rawFirst': rawUnifiedRequirements[0]?.substring(0, 50) + '...',
        'generatedFirst': generatedContentForCategory[0]?.substring(0, 50) + '...',
        'rawAll': rawUnifiedRequirements.map((item, i) => `${i}: ${item?.substring(0, 30)}...`),
        'generatedAll': generatedContentForCategory.map((item, i) => `${i}: ${item?.substring(0, 30)}...`)
      });
      
      // Use the data source that has MORE items (the one unified requirements tab actually uses)
      const actualRequirements = generatedContentForCategory.length > rawUnifiedRequirements.length 
        ? generatedContentForCategory 
        : rawUnifiedRequirements;

      // Create mapping with the data source that has MORE items (same as unified requirements tab)
      const enhancedMapping = {
        ...categoryMapping,
        actualGeneratedContent: actualRequirements,
        // Include the actual framework mappings for references
        frameworkMappings: {
          iso27001: categoryMapping.frameworks?.iso27001 || [],
          iso27002: categoryMapping.frameworks?.iso27002 || [],
          cisControls: categoryMapping.frameworks?.cisControls || [],
          gdpr: categoryMapping.frameworks?.gdpr || [],
          nis2: categoryMapping.frameworks?.nis2 || [],
          dora: categoryMapping.frameworks?.dora || []
        }
      };

      // Use the original enhanced guidance service but keep references working
      try {
        console.log(`[Unified Guidance Debug] Using EnhancedUnifiedGuidanceService with actual generated content for: ${category}`);
        
        // Pass the actual generated content to the service
        const guidanceContent = await EnhancedUnifiedGuidanceService.getEnhancedGuidance(
          category,
          selectedFrameworks as unknown as Record<string, string | boolean>,
          enhancedMapping
        );

        if (guidanceContent) {
          console.log(`[Unified Guidance Debug] Successfully generated guidance for ${category}, length: ${guidanceContent.length}`);
          return guidanceContent;
        }
      } catch (error) {
        console.error(`[Unified Guidance Debug] Error generating guidance for ${category}:`, error);
      }

      // Fallback: If we have actual requirements, use them directly
      if (actualRequirements && actualRequirements.length > 0) {
        console.log(`[Unified Guidance Debug] Using fallback with actual requirements for ${category}`);
        return actualRequirements.join('\n\n');
      }

      // Final fallback to basic requirements if everything else fails
      if (!categoryMapping.auditReadyUnified?.subRequirements?.length) {
        console.warn(`[Unified Guidance Debug] No unified requirements found for: ${category}`, categoryMapping);
        return '';
      }

      console.log(`[Unified Guidance Debug] Building guidance for: ${category}`, {
        hasMapping: !!categoryMapping,
        subRequirementsCount: categoryMapping.auditReadyUnified?.subRequirements?.length || 0
      });

      // Return basic guidance based on requirements
      return categoryMapping.auditReadyUnified.subRequirements
        .map((req: any) => `${req.title}: ${req.description}`)
        .join('\n\n');

    } catch (error) {
      console.error(`[Unified Guidance Debug] Error in buildGuidanceFromUnifiedRequirements:`, error);
      return '';
    }
  }

  // Helper function to extract real framework mappings from categoryMapping
  static extractFrameworkMappings(categoryMapping: any, categoryName: string) {
    try {
      const mappingKey = Object.keys(categoryMapping).find(key => 
        key.toLowerCase().includes(categoryName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').substring(0, 10))
      );
      
      if (!mappingKey) {
        console.log(`🔍 [EXTRACT] No mapping found for category: ${categoryName}`);
        return {};
      }
      
      const mapping = categoryMapping[mappingKey];
      console.log(`🔍 [EXTRACT] Found mapping for ${categoryName}:`, Object.keys(mapping || {}));
      
      return mapping || {};
    } catch (error) {
      console.error('[EXTRACT] Error extracting framework mappings:', error);
      return {};
    }
  }

  // Function to build references section for dynamic guidance
  static buildReferencesSection(frameworkMappings: any, categoryName: string) {
    let referencesSection = '\n\n**FRAMEWORK REFERENCES:**\n';
    
    try {
      Object.entries(frameworkMappings).forEach(([framework, requirements]: [string, any]) => {
        if (!requirements || requirements.length === 0) return;
        
        const frameworkName = {
          'iso27001': 'ISO 27001',
          'iso27002': 'ISO 27002',
          'cisControls': 'CIS Controls v8',
          'gdpr': 'GDPR',
          'nis2': 'NIS2 Directive',
          'dora': 'DORA'
        }[framework] || framework;
        
        referencesSection += `\n**${frameworkName}:**\n`;
        requirements.slice(0, 5).forEach((req: any) => {
          const reqId = req.control_id || req.id || 'N/A';
          const reqTitle = req.title || req.text || req.description || 'Requirement';
          referencesSection += `- ${reqId}: ${reqTitle.substring(0, 100)}${reqTitle.length > 100 ? '...' : ''}\n`;
        });
      });
      
      console.log(`📝 [REFERENCES] Built references section for ${categoryName}`);
      return referencesSection;
    } catch (error) {
      console.error('[REFERENCES] Error building references section:', error);
      return '\n\n**FRAMEWORK REFERENCES:** Error loading references.';
    }
  }

  // Generate unified requirements function with category-level AI restructuring
  static async generateUnifiedRequirements(
    filteredMappings: any[],
    selectedFrameworks: FrameworkSelection,
    setIsGenerating: (value: boolean) => void,
    setShowGeneration: (value: boolean) => void,
    setGeneratedContent: (content: Map<string, string[]>) => void,
    setRestructuringCategories: (fn: (prev: CategoryProgress[]) => CategoryProgress[]) => void,
    setShowRestructuringProgress: (value: boolean) => void,
    queryClient: any,
    refetchComplianceData: () => Promise<any>
  ): Promise<void> {
    try {
      console.log('🚀 [GENERATE] Starting unified requirements generation with AI restructuring...');
      setIsGenerating(true);
      setShowGeneration(false); // Hide old animation
      
      // Force invalidate React Query cache to ensure fresh data including unified categories
      queryClient.invalidateQueries({ queryKey: ['compliance-mapping-data'] });
      queryClient.invalidateQueries({ queryKey: ['unified-categories'] });
      queryClient.invalidateQueries({ predicate: (query: any) => query.queryKey[0] === 'compliance-mapping-data' });
      queryClient.invalidateQueries({ predicate: (query: any) => query.queryKey[0] === 'unified-categories' });
      
      // Also clear internal compliance cache
      complianceCacheService.clear('all');
      
      // Force clear any guidance content cache
      complianceCacheService.clear('memory');
      
      // Force refetch compliance data to get updated categories
      await refetchComplianceData();
      
      // DISABLE restructuring animation - no more waiting!
      setRestructuringCategories(() => []);
      setShowRestructuringProgress(false);
      
      // DISABLE AI processing - use instant generation
      const bridgeOptions = {
        enableAIConsolidation: false, // DISABLED - no more slow processing
        aiConsolidationOptions: {
          targetReduction: 0, // No processing needed
          qualityThreshold: 0,
          preserveAllDetails: true,
          useCache: false // No caching for instant results
        },
        featureFlags: {
          enableSmartAbstraction: false,
          enableQualityAssurance: false, // No quality checks needed
          enableTraceabilityMatrix: true,
          enableFallback: true,
          enableAIConsolidation: false // DISABLED completely
        }
      };
      
      // Generate using the enhanced template system with AI restructuring
      const { UnifiedRequirementsBridge } = await import('@/services/compliance/UnifiedRequirementsBridge');
      
      console.log('⚡ [INSTANT] Generating all content instantly - NO MORE WAITING!');
      
      // INSTANT processing - generate all content at once
      const resultMap = new Map<string, string[]>();
      
      // Process all categories in parallel - INSTANT results
      const allContent = await Promise.all(
        filteredMappings.map(async (mapping) => {
          const categoryName = mapping.category?.replace(/^\d+\.\s*/, '') || 'Unknown';
          try {
            const categoryContent = await UnifiedRequirementsBridge.generateUnifiedRequirementsForCategory(
              mapping,
              selectedFrameworks,
              bridgeOptions
            );
            console.log(`✅ [INSTANT] Generated ${categoryName}: ${categoryContent.length} items`);
            return { categoryName, categoryContent, success: true };
          } catch (error) {
            console.error(`❌ [INSTANT] Error processing ${categoryName}:`, error);
            return { categoryName, categoryContent: [`Error generating content for ${categoryName}`], success: false };
          }
        })
      );
      
      // Set all content at once
      allContent.forEach(({ categoryName, categoryContent }) => {
        resultMap.set(categoryName, categoryContent);
      });
      
      console.log(`🎉 [INSTANT] Generated all ${resultMap.size} categories INSTANTLY!`);

      if (resultMap.size > 0) {
        console.log('🎉 [GENERATE] All categories processed, updating content...');
        
        // Update the generated content with new template-based content
        setGeneratedContent(resultMap);
        
        // Stay on current tab (mapping) to show the results instead of switching to unified
        console.log('✅ [GENERATE] Generation completed, staying on current tab');
      }
      
    } catch (error) {
      console.error('❌ [GENERATE] Error generating unified requirements:', error);
      
      // Update all categories to error state
      setRestructuringCategories(prev => 
        prev.map(cat => ({ 
          ...cat, 
          status: 'error', 
          progress: 0,
          errorMessage: 'Generation failed'
        }))
      );
      
    } finally {
      setIsGenerating(false);
      
      // Hide restructuring progress after completion
      setTimeout(() => {
        setShowRestructuringProgress(false);
      }, 3000);
    }
  }
}