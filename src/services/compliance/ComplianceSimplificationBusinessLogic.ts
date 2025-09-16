import { supabase } from '@/lib/supabase';
import { EnhancedUnifiedRequirementsGenerator } from './EnhancedUnifiedRequirementsGenerator';
import { SectorSpecificEnhancer } from './SectorSpecificEnhancer';

// Mock cache service to prevent errors
const complianceCacheService = {
  clear: () => {},
  get: (key: string) => null,
  set: (key: string, value: any) => {}
};

export class ComplianceSimplificationBusinessLogic {
  private enhancedGenerator = new EnhancedUnifiedRequirementsGenerator();

  async generateDynamicContentForCategory(
    categoryName: string,
    selectedFrameworks: any,
    filteredUnifiedMappings: any[]
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

  // Helper function to extract real framework mappings from categoryMapping
  extractFrameworkMappings(categoryMapping: any, categoryName: string) {
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
  buildReferencesSection(frameworkMappings: any, categoryName: string) {
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
}