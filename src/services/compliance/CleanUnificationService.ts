/**
 * Clean Unification Service
 * 
 * Bygger från grunden med respekt för:
 * 1. Kravbeskrivningar från database
 * 2. Mappningar (requirement → category mappings)
 * 3. Användarens val i Framework Mapping tab
 * 4. Referenslogik (Framework References)
 * 5. Template respekt av titlar (a., b., c., etc.)
 */

import { supabase } from '@/lib/supabase';
import { intelligentTextConsolidator } from './IntelligentTextConsolidator';

// Database types
interface DatabaseRequirement {
  id: string;
  identifier: string;
  title: string;
  description: string;
  standard_id: string;
  standard?: {
    id: string;
    name: string;
    version?: string;
  };
  unified_requirement_mappings?: Array<{
    unified_requirement?: {
      category?: {
        name: string;
        icon: string;
        description: string;
      };
    };
  }>;
}

interface GeneratedCategory {
  name: string;
  icon: string;
  description: string;
  subRequirements: SubRequirement[];
  frameworkReferences: FrameworkReference[];
  totalRequirements: number;
  originalLength: number;
  consolidatedLength: number;
}

interface SubRequirement {
  letter: string;
  title: string;
  content: string;
  references: string[];
  originalRequirements: string[];
}

interface FrameworkReference {
  framework: string;
  version?: string;
  identifiers: string[];
}

interface UnificationOptions {
  organizationId: string;
  selectedFrameworkIds: string[];
  enableAdvancedConsolidation: boolean;
  respectTemplateStructure: boolean;
}

export class CleanUnificationService {
  
  /**
   * Huvudmetod: Generera unified requirements baserat på användarens val
   */
  async generateUnifiedRequirements(options: UnificationOptions): Promise<GeneratedCategory[]> {
    console.log('🚀 Starting Clean Unification Process...');
    console.log('Selected frameworks:', options.selectedFrameworkIds);
    
    // Steg 1: Hämta requirements från databas baserat på användarens val
    const requirements = await this.fetchSelectedRequirements(
      options.organizationId,
      options.selectedFrameworkIds
    );
    
    console.log(`📚 Fetched ${requirements.length} requirements from ${options.selectedFrameworkIds.length} frameworks`);
    
    // Steg 2: Gruppera requirements enligt mappningar från databas
    const mappedCategories = this.mapRequirementsToCategories(requirements);
    console.log(`🏷️ Mapped to ${Object.keys(mappedCategories).length} categories`);
    
    // Steg 3: Generera unified content för varje kategori
    const unifiedCategories = await this.generateCategoryContent(
      mappedCategories,
      options
    );
    
    console.log(`✨ Generated unified content for ${unifiedCategories.length} categories`);
    
    return unifiedCategories;
  }
  
  /**
   * Hämta requirements från databas baserat på användarens framework-val
   */
  private async fetchSelectedRequirements(
    organizationId: string,
    selectedFrameworkIds: string[]
  ): Promise<DatabaseRequirement[]> {
    
    if (selectedFrameworkIds.length === 0) {
      console.warn('No frameworks selected');
      return [];
    }
    
    try {
      // Hämta requirements med mappningar
      const { data, error } = await supabase
        .from('requirements')
        .select(`
          id,
          identifier,
          title,
          description,
          standard_id,
          standard:standards(id, name, version),
          unified_requirement_mappings(
            unified_requirement(
              category(name, icon, description)
            )
          )
        `)
        .in('standard_id', selectedFrameworkIds)
        .order('identifier');
      
      if (error) {
        console.error('Database error fetching requirements:', error);
        return [];
      }
      
      const requirements = data || [];
      console.log(`✅ Successfully fetched ${requirements.length} requirements`);
      
      return requirements;
      
    } catch (error) {
      console.error('Error in fetchSelectedRequirements:', error);
      return [];
    }
  }
  
  /**
   * Mappa requirements till kategorier baserat på databas-mappningar
   */
  private mapRequirementsToCategories(
    requirements: DatabaseRequirement[]
  ): Record<string, DatabaseRequirement[]> {
    
    const mappedCategories: Record<string, DatabaseRequirement[]> = {};
    
    requirements.forEach(requirement => {
      // Hitta kategori från databas-mappning
      const categoryName = this.extractCategoryFromMapping(requirement);
      
      if (!mappedCategories[categoryName]) {
        mappedCategories[categoryName] = [];
      }
      
      mappedCategories[categoryName].push(requirement);
    });
    
    return mappedCategories;
  }
  
  /**
   * Extrahera kategorinamn från databas-mappning
   */
  private extractCategoryFromMapping(requirement: DatabaseRequirement): string {
    // Försök hämta från databas-mappning först
    const mappings = requirement.unified_requirement_mappings || [];
    
    for (const mapping of mappings) {
      const categoryName = mapping.unified_requirement?.category?.name;
      if (categoryName) {
        return categoryName;
      }
    }
    
    // Fallback: intelligent kategorisering
    return this.categorizeRequirementIntelligently(requirement);
  }
  
  /**
   * Intelligent kategorisering som fallback
   */
  private categorizeRequirementIntelligently(requirement: DatabaseRequirement): string {
    const text = `${requirement.title} ${requirement.description}`.toLowerCase();
    
    // Kategorimappning baserat på nyckelord
    const categoryKeywords = {
      'Governance & Leadership': ['governance', 'leadership', 'policy', 'strategy', 'management', 'board'],
      'Risk Management': ['risk', 'assessment', 'threat', 'vulnerability', 'business continuity'],
      'Asset Management': ['asset', 'inventory', 'classification', 'data', 'information'],
      'Access Control & Identity Management': ['access', 'identity', 'user', 'authentication', 'authorization'],
      'Cryptography & Encryption': ['cryptography', 'encryption', 'key', 'crypto', 'cipher'],
      'Physical & Environmental Security': ['physical', 'environmental', 'premises', 'facility'],
      'Operations Security': ['operations', 'procedures', 'operational', 'maintenance'],
      'Communications Security': ['communications', 'network', 'transmission', 'data flow'],
      'System Acquisition & Development': ['development', 'acquisition', 'software', 'application'],
      'Supplier Relationships': ['supplier', 'third party', 'vendor', 'outsourcing'],
      'Incident Response Management': ['incident', 'response', 'breach', 'emergency'],
      'Business Continuity & Disaster Recovery': ['continuity', 'disaster', 'recovery', 'backup'],
      'Compliance & Audit': ['compliance', 'audit', 'regulatory', 'legal'],
      'Human Resources Security': ['human resources', 'personnel', 'screening'],
      'Information Security Training': ['training', 'education', 'awareness', 'competence'],
      'Monitoring & Measurement': ['monitoring', 'logging', 'measurement', 'metrics'],
      'Vulnerability Management': ['vulnerability', 'patching', 'remediation', 'scanning'],
      'Data Protection & Privacy': ['privacy', 'data protection', 'personal data', 'GDPR'],
      'Network Security': ['network', 'firewall', 'infrastructure', 'perimeter'],
      'Cloud Security': ['cloud', 'hybrid', 'SaaS', 'IaaS'],
      'Mobile & Remote Work Security': ['mobile', 'remote', 'telework', 'BYOD']
    };
    
    let bestMatch = 'Governance & Leadership'; // Default
    let bestScore = 0;
    
    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      const score = keywords.reduce((total, keyword) => {
        return total + (text.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = category;
      }
    });
    
    return bestMatch;
  }
  
  /**
   * Generera unified content för varje kategori
   */
  private async generateCategoryContent(
    mappedCategories: Record<string, DatabaseRequirement[]>,
    options: UnificationOptions
  ): Promise<GeneratedCategory[]> {
    
    const generatedCategories: GeneratedCategory[] = [];
    
    for (const [categoryName, requirements] of Object.entries(mappedCategories)) {
      if (requirements.length === 0) continue;
      
      // Hämta kategori-metadata
      const categoryInfo = this.getCategoryInfo(categoryName);
      
      // Skapa sub-requirements med template respekt
      const subRequirements = await this.createSubRequirements(
        requirements,
        options.respectTemplateStructure
      );
      
      // Skapa framework references
      const frameworkReferences = this.createFrameworkReferences(requirements);
      
      // Beräkna statistik
      const originalLength = requirements.reduce((total, req) => total + req.description.length, 0);
      const consolidatedLength = subRequirements.reduce((total, sub) => total + sub.content.length, 0);
      
      generatedCategories.push({
        name: categoryName,
        icon: categoryInfo.icon,
        description: categoryInfo.description,
        subRequirements,
        frameworkReferences,
        totalRequirements: requirements.length,
        originalLength,
        consolidatedLength
      });
    }
    
    // Sortera kategorier efter antal requirements
    return generatedCategories.sort((a, b) => b.totalRequirements - a.totalRequirements);
  }
  
  /**
   * Skapa sub-requirements med respekt för template-struktur
   */
  private async createSubRequirements(
    requirements: DatabaseRequirement[],
    respectTemplateStructure: boolean
  ): Promise<SubRequirement[]> {
    
    if (!respectTemplateStructure) {
      // Enkel konsolidering utan template-struktur
      const consolidationResult = intelligentTextConsolidator.consolidateRequirements(
        requirements.map(req => ({
          content: `${req.title}: ${req.description}`,
          references: [`${req.standard?.name || 'Unknown'} ${req.identifier}`]
        }))
      );
      
      return [{
        letter: 'a',
        title: 'Unified Requirements',
        content: consolidationResult.consolidatedText,
        references: consolidationResult.referencesPreserved,
        originalRequirements: requirements.map(r => r.id)
      }];
    }
    
    // Avancerad template-struktur med a., b., c., etc.
    const topicGroups = this.groupRequirementsByTopic(requirements);
    const subRequirements: SubRequirement[] = [];
    
    let letterIndex = 0;
    
    for (const [topic, topicRequirements] of Object.entries(topicGroups)) {
      const letter = String.fromCharCode(97 + letterIndex); // a, b, c...
      
      // Konsolidera requirements för detta topic
      const consolidationResult = intelligentTextConsolidator.consolidateRequirements(
        topicRequirements.map(req => ({
          content: req.description,
          references: [`${req.standard?.name || 'Unknown'} ${req.identifier}`]
        }))
      );
      
      subRequirements.push({
        letter,
        title: this.formatTopicTitle(topic),
        content: consolidationResult.consolidatedText,
        references: consolidationResult.referencesPreserved,
        originalRequirements: topicRequirements.map(r => r.id)
      });
      
      letterIndex++;
    }
    
    return subRequirements;
  }
  
  /**
   * Gruppera requirements efter topic för template-struktur
   */
  private groupRequirementsByTopic(requirements: DatabaseRequirement[]): Record<string, DatabaseRequirement[]> {
    const topics: Record<string, DatabaseRequirement[]> = {};
    
    const topicKeywords = {
      'Policy and Governance': ['policy', 'governance', 'framework', 'strategy'],
      'Implementation': ['implement', 'establish', 'deploy', 'execute'],
      'Procedures': ['procedure', 'process', 'workflow', 'methodology'],
      'Training and Awareness': ['training', 'awareness', 'education', 'competence'],
      'Monitoring and Review': ['monitoring', 'review', 'audit', 'assessment'],
      'Documentation': ['document', 'record', 'evidence', 'documentation'],
      'Maintenance': ['maintain', 'update', 'improve', 'continual']
    };
    
    requirements.forEach(requirement => {
      const text = `${requirement.title} ${requirement.description}`.toLowerCase();
      
      let assignedTopic = 'General Requirements';
      
      for (const [topic, keywords] of Object.entries(topicKeywords)) {
        const matchCount = keywords.filter(keyword => text.includes(keyword)).length;
        if (matchCount >= 1) {
          assignedTopic = topic;
          break;
        }
      }
      
      if (!topics[assignedTopic]) {
        topics[assignedTopic] = [];
      }
      
      topics[assignedTopic].push(requirement);
    });
    
    return topics;
  }
  
  /**
   * Skapa framework references med korrekt formatering
   */
  private createFrameworkReferences(requirements: DatabaseRequirement[]): FrameworkReference[] {
    const frameworkMap: Record<string, { name: string; version?: string; identifiers: string[] }> = {};
    
    requirements.forEach(requirement => {
      const framework = requirement.standard;
      if (!framework) return;
      
      if (!frameworkMap[framework.id]) {
        frameworkMap[framework.id] = {
          name: framework.name,
          version: framework.version,
          identifiers: []
        };
      }
      
      frameworkMap[framework.id].identifiers.push(requirement.identifier);
    });
    
    return Object.values(frameworkMap).map(fw => ({
      framework: fw.name,
      version: fw.version,
      identifiers: fw.identifiers.sort()
    }));
  }
  
  /**
   * Formatera topic-titel för presentation
   */
  private formatTopicTitle(topic: string): string {
    return topic.charAt(0).toUpperCase() + topic.slice(1);
  }
  
  /**
   * Hämta kategori-information
   */
  private getCategoryInfo(categoryName: string) {
    const defaultInfo = { icon: 'Shield', description: 'Security requirements and controls' };
    
    const categoryMap: Record<string, { icon: string; description: string }> = {
      'Governance & Leadership': { icon: 'Crown', description: 'Strategic governance and leadership accountability' },
      'Risk Management': { icon: 'Shield', description: 'Risk assessment and management processes' },
      'Asset Management': { icon: 'Package', description: 'Information asset identification and handling' },
      'Access Control & Identity Management': { icon: 'Key', description: 'User access and identity controls' },
      'Cryptography & Encryption': { icon: 'Lock', description: 'Cryptographic controls and key management' },
      // ... (fortsätt för alla kategorier)
    };
    
    return categoryMap[categoryName] || defaultInfo;
  }
}

export const cleanUnificationService = new CleanUnificationService();