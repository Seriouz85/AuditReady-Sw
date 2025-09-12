/**
 * Pentagon Domain Mapping Service
 * 
 * Maps unified compliance categories to the 5 security domains of the pentagon visualization:
 * Domain 0: Governance 🛡️ - Leadership, management, policies, strategy
 * Domain 1: Physical 🏢 - Physical security, facilities, environmental controls
 * Domain 2: Technical ⚙️ - Technical controls, systems, encryption, access controls
 * Domain 3: Operational 🔧 - Operations, processes, procedures, incident management
 * Domain 4: Privacy 🔒 - Data protection, privacy, personal information handling
 */

export interface CategoryDomainMapping {
  categoryName: string;
  domain: number;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}

export class PentagonDomainMappingService {
  
  /**
   * Map a category name to its primary pentagon security domain
   */
  static mapCategoryToDomain(categoryName: string): CategoryDomainMapping {
    const name = categoryName.toLowerCase();
    
    // Domain 0: Governance 🛡️
    if (name.includes('governance') || name.includes('leadership') || 
        name.includes('management system') || name.includes('policy') ||
        name.includes('strategic') || name.includes('executive') ||
        name.includes('board') || name.includes('oversight')) {
      return {
        categoryName,
        domain: 0,
        confidence: 'high',
        reasoning: 'Governance and leadership category - strategic oversight and policy'
      };
    }
    
    // Domain 1: Physical 🏢
    if (name.includes('physical') || name.includes('environmental') ||
        name.includes('facilities') || name.includes('premises') ||
        name.includes('building') || name.includes('site') ||
        name.includes('location') || name.includes('workspace')) {
      return {
        categoryName,
        domain: 1,
        confidence: 'high',
        reasoning: 'Physical security category - facilities and environmental controls'
      };
    }
    
    // Domain 2: Technical ⚙️  
    if (name.includes('technical') || name.includes('technology') ||
        name.includes('system') || name.includes('network') ||
        name.includes('identity') || name.includes('access') ||
        name.includes('authentication') || name.includes('encryption') ||
        name.includes('software') || name.includes('application') ||
        name.includes('infrastructure') || name.includes('cybersecurity') ||
        name.includes('information security') || name.includes('cyber')) {
      return {
        categoryName,
        domain: 2,
        confidence: 'high',
        reasoning: 'Technical security category - systems, networks, and technical controls'
      };
    }
    
    // Domain 4: Privacy 🔒 (Check before Domain 3 due to "data" keyword overlap)
    if (name.includes('privacy') || name.includes('data protection') ||
        name.includes('personal data') || name.includes('gdpr') ||
        name.includes('data subject') || name.includes('consent') ||
        name.includes('data processing') || name.includes('pii') ||
        name.includes('personal information')) {
      return {
        categoryName,
        domain: 4,
        confidence: 'high',
        reasoning: 'Privacy category - personal data protection and privacy rights'
      };
    }
    
    // Domain 3: Operational 🔧
    if (name.includes('operational') || name.includes('operation') ||
        name.includes('process') || name.includes('procedure') ||
        name.includes('incident') || name.includes('response') ||
        name.includes('business continuity') || name.includes('disaster recovery') ||
        name.includes('risk management') || name.includes('threat') ||
        name.includes('vulnerability') || name.includes('audit') ||
        name.includes('compliance') || name.includes('monitoring') ||
        name.includes('assessment') || name.includes('supplier') ||
        name.includes('vendor') || name.includes('third party') ||
        name.includes('training') || name.includes('awareness') ||
        name.includes('human resources') || name.includes('personnel') ||
        name.includes('change management') || name.includes('asset') ||
        name.includes('data') && !name.includes('protection')) {
      return {
        categoryName,
        domain: 3,
        confidence: 'high',
        reasoning: 'Operational category - processes, procedures, and operational controls'
      };
    }
    
    // Default fallback - analyze for best fit
    if (name.includes('management') || name.includes('strategy')) {
      return {
        categoryName,
        domain: 0,
        confidence: 'medium',
        reasoning: 'Management-related category - likely governance domain'
      };
    }
    
    if (name.includes('security')) {
      return {
        categoryName,
        domain: 2,
        confidence: 'medium',
        reasoning: 'Security-related category - likely technical domain'
      };
    }
    
    // Ultimate fallback - operational domain
    return {
      categoryName,
      domain: 3,
      confidence: 'low',
      reasoning: 'General category - assigned to operational domain as fallback'
    };
  }
  
  /**
   * Get all domain mappings for an array of categories
   */
  static mapCategoriesToDomains(categoryNames: string[]): CategoryDomainMapping[] {
    return categoryNames.map(name => this.mapCategoryToDomain(name));
  }
  
  /**
   * Generate SQL update statements to assign pentagon domains to categories
   */
  static generateDomainUpdateSQL(categoryMappings: CategoryDomainMapping[]): string {
    const updates = categoryMappings.map(mapping => 
      `UPDATE unified_compliance_categories SET pentagon_domain = ${mapping.domain} WHERE name = '${mapping.categoryName.replace(/'/g, "''")}';`
    );
    
    return updates.join('\n');
  }
  
  /**
   * Validate domain distribution - ensure reasonable balance across domains
   */
  static validateDomainDistribution(mappings: CategoryDomainMapping[]): {
    isBalanced: boolean;
    distribution: Record<number, number>;
    warnings: string[];
  } {
    const distribution: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    const warnings: string[] = [];
    
    mappings.forEach(mapping => {
      distribution[mapping.domain]++;
    });
    
    // Check for empty domains
    Object.keys(distribution).forEach(domain => {
      if (distribution[parseInt(domain)] === 0) {
        const domainNames = ['Governance', 'Physical', 'Technical', 'Operational', 'Privacy'];
        warnings.push(`Domain ${domain} (${domainNames[parseInt(domain)]}) has no categories assigned`);
      }
    });
    
    // Check for overloaded domains (more than 60% of categories)
    const total = mappings.length;
    const threshold = total * 0.6;
    
    Object.entries(distribution).forEach(([domain, count]) => {
      if (count > threshold) {
        const domainNames = ['Governance', 'Physical', 'Technical', 'Operational', 'Privacy'];
        warnings.push(`Domain ${domain} (${domainNames[parseInt(domain)]}) is overloaded with ${count}/${total} categories (${Math.round(count/total*100)}%)`);
      }
    });
    
    return {
      isBalanced: warnings.length === 0,
      distribution,
      warnings
    };
  }
  
  /**
   * Get domain name and icon
   */
  static getDomainInfo(domain: number): { name: string; icon: string; color: string } {
    const domains = [
      { name: 'Governance', icon: '🛡️', color: '#3b82f6' },
      { name: 'Physical', icon: '🏢', color: '#10b981' },
      { name: 'Technical', icon: '⚙️', color: '#8b5cf6' },
      { name: 'Operational', icon: '🔧', color: '#f97316' },
      { name: 'Privacy', icon: '🔒', color: '#ef4444' }
    ];
    
    return domains[domain] || { name: 'Unknown', icon: '❓', color: '#6b7280' };
  }
}