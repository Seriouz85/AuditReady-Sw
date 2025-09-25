/**
 * Clean Guidance Service
 * Implements the required guidance structure:
 * Section 1: Framework References
 * Section 2: Sub-Requirements with detailed guidance and audit evidence
 * Section 3: Operational Excellence Indicators (ending with PRO TIP)
 * NOW ENHANCED: Uses audit evidence extracted from unified requirements database content
 */

import { AuditEvidenceExtractor } from './AuditEvidenceExtractor';

interface SubRequirement {
  id: string;
  title: string;
  professionalExplanation: string;
  auditEvidencePoints: string[];
  implementationGuidance: string[];
  practicalTools: string[];
  bestPractices: string[];
}

interface CategoryGuidanceStructure {
  frameworkReferences: string;
  subRequirements: SubRequirement[];
  operationalExcellence: string;
}

export class CleanGuidanceService {
  
  /**
   * Get clean guidance with proper structure
   */
  static async getCleanGuidance(
    category: string, 
    selectedFrameworks: Record<string, boolean | string>,
    dynamicRequirements?: any,
    frameworkMappings?: any
  ): Promise<string> {
    const guidanceStructure = await this.buildGuidanceStructure(category, selectedFrameworks, dynamicRequirements, frameworkMappings);
    
    return this.formatGuidanceContent(guidanceStructure);
  }
  
  /**
   * Build guidance structure for category
   */
  private static async buildGuidanceStructure(
    category: string,
    selectedFrameworks: Record<string, boolean | string>,
    dynamicRequirements?: any,
    frameworkMappings?: any
  ): Promise<CategoryGuidanceStructure> {
    // Section 1: Framework References - Use actual framework mappings if available
    const frameworkReferences = this.buildFrameworkReferences(category, selectedFrameworks, frameworkMappings);
    
    // Section 2: Sub-Requirements with guidance
    const subRequirements = await this.buildSubRequirements(category, dynamicRequirements, selectedFrameworks);
    
    // Section 3: Operational Excellence
    const operationalExcellence = this.buildOperationalExcellence();
    
    return {
      frameworkReferences,
      subRequirements,
      operationalExcellence
    };
  }
  
  /**
   * Format complete guidance content
   */
  private static formatGuidanceContent(structure: CategoryGuidanceStructure): string {
    let content = '';
    
    // Section 1: Framework References - Added back for Show References button functionality
    content += 'Framework References for Selected Standards:\n';
    content += structure.frameworkReferences;
    content += '\n\n';
    
    // Section 2: Sub-Requirements with detailed guidance and audit evidence
    structure.subRequirements.forEach(subReq => {
      // Check if title already contains the letter prefix to avoid duplication
      const titleToDisplay = subReq.title.startsWith(`${subReq.id})`) ? 
        subReq.title : 
        `${subReq.id}) ${subReq.title}`;
      
      content += `${titleToDisplay}\n`;
      content += `${subReq.professionalExplanation}\n\n`;
      
      // Audit evidence points (now properly extracted from database content!)
      if (subReq.auditEvidencePoints.length > 0) {
        content += `📋 **Audit Ready Evidence Collection: Essential Documentation Required:**\n`;
        subReq.auditEvidencePoints.forEach(point => {
          content += `• ${point}\n`;
        });
        content += '\n';
      }
      
      // REMOVED: Generic Implementation Guidance section per user request
      // This eliminates generic bullet points like "Systematic breach classification and risk assessment procedures"
      
      content += '\n';
    });
    
    // Section 3: Operational Excellence Indicators
    content += structure.operationalExcellence;
    
    return content;
  }
  
  /**
   * Build framework references section using actual mapping data
   */
  private static buildFrameworkReferences(
    category: string,
    selectedFrameworks: Record<string, boolean | string>,
    frameworkMappings?: any
  ): string {
    const references: string[] = [];
    
    console.log(`[CleanGuidanceService] Building framework references for ${category}:`, {
      hasFrameworkMappings: !!frameworkMappings,
      selectedFrameworks: Object.keys(selectedFrameworks).filter(f => selectedFrameworks[f])
    });
    
    // Use actual framework mappings if available
    if (frameworkMappings) {
      Object.entries(selectedFrameworks).forEach(([framework, enabled]) => {
        if (enabled && frameworkMappings[framework] && frameworkMappings[framework].length > 0) {
          const frameworkName = this.getFrameworkDisplayName(framework);
          const requirements = frameworkMappings[framework];
          
          // Show ALL requirement codes/titles, not truncated
          const allCodes = requirements.map((req: any) => 
            req.code || req.id || req.title?.substring(0, 30) || 'N/A'
          );
          
          references.push(`${frameworkName}: ${allCodes.join(', ')}`);
        }
      });
    }
    
    // Fallback if no mappings or no references found
    if (references.length === 0) {
      Object.entries(selectedFrameworks).forEach(([framework, enabled]) => {
        if (enabled) {
          const frameworkName = this.getFrameworkDisplayName(framework);
          references.push(`${frameworkName}: Multiple controls apply to this category`);
        }
      });
    }
    
    return references.length > 0 
      ? references.join('\n')
      : 'Multiple framework controls apply to this category';
  }
  
  /**
   * Get display name for framework
   */
  private static getFrameworkDisplayName(framework: string): string {
    const displayNames: Record<string, string> = {
      'iso27001': 'ISO 27001',
      'iso27002': 'ISO 27002', 
      'cisControls': 'CIS Controls v8',
      'gdpr': 'GDPR',
      'nis2': 'NIS2 Directive',
      'dora': 'DORA (Digital Operational Resilience Act)'
    };
    
    return displayNames[framework] || framework.toUpperCase();
  }
  
  /**
   * Build sub-requirements with professional guidance
   * NOW ENHANCED: Uses audit evidence extracted from unified requirements database content
   */
  private static async buildSubRequirements(
    category: string,
    dynamicRequirements?: any,
    selectedFrameworks?: Record<string, boolean | string>
  ): Promise<SubRequirement[]> {
    // Use dynamicRequirements if provided (actual generated content)
    if (dynamicRequirements && Array.isArray(dynamicRequirements)) {
      console.log(`[CleanGuidanceService] Using dynamic requirements for ${category}, count: ${dynamicRequirements.length}`);
      console.log(`[CleanGuidanceService] First few items:`, dynamicRequirements.slice(0, 3));
      return await this.buildEnhancedSubRequirements(dynamicRequirements, selectedFrameworks);
    }
    
    // No more competing sources - if no dynamic requirements provided, return empty
    console.log(`[CleanGuidanceService] No dynamic requirements provided for ${category}, returning empty array`);
    return [];
  }
  
  /**
   * Build enhanced sub-requirements section (Section 2) - EMERGENCY SIMPLE FIX
   * Only extract clean titles, NO guidance processing to avoid chaos
   */
  private static async buildEnhancedSubRequirements(unifiedRequirements: string[], selectedFrameworks?: Record<string, boolean | string>): Promise<SubRequirement[]> {
    if (!unifiedRequirements || !Array.isArray(unifiedRequirements)) {
      console.warn('[CleanGuidanceService] No unified requirements provided');
      return [];
    }
    
    console.log(`[Section 2 FIX] Processing ALL ${unifiedRequirements.length} requirements`);
    
    const subRequirements: SubRequirement[] = [];
    
    for (let index = 0; index < unifiedRequirements.length; index++) {
      const requirement = unifiedRequirements[index];
      
      // Generate simple letters: a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z
      // If more than 26, continue with aa, bb, cc, dd, etc.
      let letter;
      if (index < 26) {
        letter = String.fromCharCode(97 + index); // a, b, c, ..., z
      } else {
        // For requirements beyond z, use double letters: aa, bb, cc, etc.
        const extraIndex = index - 26;
        const baseLetter = String.fromCharCode(97 + (extraIndex % 26));
        letter = baseLetter + baseLetter; // aa, bb, cc, dd, etc.
      }
      
      // DEBUG: Log the actual requirement format to understand the structure
      console.log(`[DEBUG] Requirement ${letter}:`, requirement.substring(0, 100));
      
      // Extract title - try multiple patterns to match actual data format
      let title = '';
      
      // Pattern 1: "a) **TITLE** - description"
      let titleMatch = requirement.match(/^[a-z]\)\s*\*\*([^*]+)\*\*/i);
      if (titleMatch) {
        title = titleMatch[1].trim();
      }
      
      // Pattern 2: "a) TITLE - description" (no bold markers)
      if (!title) {
        titleMatch = requirement.match(/^[a-z]\)\s*([^-]+)/i);
        if (titleMatch) {
          title = titleMatch[1].trim().replace(/\*\*/g, '');
        }
      }
      
      // Pattern 3: Just take everything after letter until dash or period
      if (!title) {
        titleMatch = requirement.match(/^[a-z]\)\s*(.+?)(?:\s*-|\s*\.|\s*$)/i);
        if (titleMatch) {
          title = titleMatch[1].trim().replace(/\*\*/g, '');
        }
      }
      
      // If no title found, use a fallback title but don't skip
      if (!title) {
        console.warn(`[Section 2] No title found for ${letter}, using fallback: "${requirement.substring(0, 50)}..."`);
        title = `Requirement ${letter.toUpperCase()}`;
      }
      
      // Clean title completely
      title = title
        .replace(/\*\*/g, '')
        .replace(/[#*_`~]/g, '')
        .trim();
      
      // Get REAL audit ready unified guidance from database
      const auditReadyGuidance = await this.getAuditReadyUnifiedGuidance(title, selectedFrameworks);
      
      console.log(`[Section 2] ${letter}) ${title}`);
      
      subRequirements.push({
        id: letter,
        title: title,
        professionalExplanation: auditReadyGuidance,
        auditEvidencePoints: [], 
        implementationGuidance: [], 
        practicalTools: [], 
        bestPractices: [] 
      });
    }
    
    console.log(`[Section 2 EMERGENCY FIX] Created ${subRequirements.length} clean sections`);
    return subRequirements;
  }
  
  /**
   * Get FULL unified guidance from requirements_library table
   * Simple approach: Find best matching requirement and return FULL audit_ready_guidance (11 rows max)
   * IMPORTANT: Filters by selected frameworks to prevent content leakage
   */
  private static async getAuditReadyUnifiedGuidance(title: string, selectedFrameworks?: Record<string, boolean | string>): Promise<string> {
    try {
      const { supabase } = await import('@/lib/supabase');
      
      // Clean title to get search keywords
      const cleanTitle = title
        .replace(/^[a-z]\)\s*/i, '') // Remove letter prefix like "a) "
        .replace(/[^\w\s]/g, ' ')
        .toLowerCase()
        .trim();
      
      // Extract key search terms (significant words only)
      const searchTerms = cleanTitle
        .split(/\s+/)
        .filter(word => word.length > 3)
        .filter(word => !['requirements', 'controls', 'management', 'security', 'information', 'isms', 'part', 'your'].includes(word))
        .slice(0, 3); // Top 3 keywords for better matching
      
      // Fallback search terms if no good keywords found
      if (searchTerms.length === 0) {
        const fallbackTerms = cleanTitle
          .split(/\s+/)
          .filter(word => word.length > 2)
          .slice(0, 2);
        searchTerms.push(...fallbackTerms);
      }
      
      console.log(`[getAuditReadyGuidance] Searching for "${cleanTitle}" using terms: ${searchTerms.join(', ')}`);
      
      // Search requirements_library for audit_ready_guidance that matches this title
      // Try multiple search strategies for better matching
      let requirements = null;
      
      // Strategy 1: Search by title keywords (without framework filtering for now to get content back)
      if (searchTerms.length > 0) {
        const { data } = await supabase
          .from('requirements_library')
          .select('audit_ready_guidance, title, description')
          .not('audit_ready_guidance', 'is', null)
          .neq('audit_ready_guidance', '')
          .or(searchTerms.map(term => `title.ilike.%${term}%`).join(','))
          .limit(5);
        requirements = data;
      }
      
      // Strategy 2: If no results, try broader search in description
      if (!requirements || requirements.length === 0) {
        const { data } = await supabase
          .from('requirements_library')
          .select('audit_ready_guidance, title, description')
          .not('audit_ready_guidance', 'is', null)
          .neq('audit_ready_guidance', '')
          .or(searchTerms.map(term => `description.ilike.%${term}%`).join(','))
          .limit(5);
        requirements = data;
      }
      
      // Strategy 3: If still no results, get any guidance related to common security topics
      if (!requirements || requirements.length === 0) {
        const commonTerms = ['policy', 'procedure', 'governance', 'management', 'control'];
        const { data } = await supabase
          .from('requirements_library')
          .select('audit_ready_guidance, title, description')
          .not('audit_ready_guidance', 'is', null)
          .neq('audit_ready_guidance', '')
          .or(commonTerms.map(term => `title.ilike.%${term}%`).join(','))
          .limit(3);
        requirements = data;
      }
      
      if (requirements && requirements.length > 0) {
        console.log(`[getAuditReadyGuidance] Found ${requirements.length} matching requirements`);
        
        // Find the best match and return FULL guidance (max 11 rows)
        for (const req of requirements) {
          const auditGuidance = (req as any).audit_ready_guidance;
          if (auditGuidance && typeof auditGuidance === 'string') {
            // Return FULL guidance content, limited to 11 rows max
            const fullGuidance = this.formatFullGuidanceContent(auditGuidance);
            console.log(`[getAuditReadyGuidance] Using FULL guidance from: ${(req as any).title}`);
            return fullGuidance;
          }
        }
      }
      
      console.log(`[getAuditReadyGuidance] No guidance found for "${cleanTitle}"`);
      return 'No specific guidance available for this requirement.';
      
    } catch (error) {
      console.error('[getAuditReadyGuidance] Error:', error);
      return 'Error loading guidance for this requirement.';
    }
  }
  
  /**
   * Format full guidance content - preserve ALL content, limit to 11 rows max
   * No cutoffs, no sentences lost, no details lost
   */
  private static formatFullGuidanceContent(auditGuidance: string): string {
    if (!auditGuidance) return '';
    
    // Split into lines and take first 11 meaningful lines
    const lines = auditGuidance.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, 11); // Max 11 rows as requested
    
    // Return full content, no modifications, no cutoffs
    return lines.join('\n');
  }
  
  /**
   * Convert selected frameworks to database framework names
   * This prevents framework-specific content leakage (e.g., SCADA content when NIS2 water/wastewater not selected)
   */
  private static getSelectedFrameworkNames(selectedFrameworks?: Record<string, boolean | string>): string[] {
    const frameworkNames: string[] = [];
    
    if (!selectedFrameworks) {
      return frameworkNames;
    }
    
    // Map UI framework names to database framework names
    if (selectedFrameworks.iso27001) {
      frameworkNames.push('ISO 27001');
    }
    if (selectedFrameworks.iso27002) {
      frameworkNames.push('ISO 27002');
    }
    if (selectedFrameworks.cisControls) {
      frameworkNames.push('CIS Controls');
    }
    if (selectedFrameworks.gdpr) {
      frameworkNames.push('GDPR');
    }
    if (selectedFrameworks.nis2) {
      frameworkNames.push('NIS2');
      // Note: Only include water/wastewater specific content if specifically selected
      // This prevents SCADA/industrial content from appearing in general guidance
    }
    if (selectedFrameworks.dora) {
      frameworkNames.push('DORA');
    }
    
    return frameworkNames;
  }

  

  /**
   * Abstract the description content to 3 key implementation points
   * Extract the lettered points (a), b), c), etc.) from the description
   */
  private static abstractAuditReadyGuidance(guidance: string): string {
    if (!guidance) return '';
    
    // Look for lettered points in the description (a), b), c), etc.)
    const letteredPoints = guidance.match(/[a-z]\)[^;]+/gi);
    
    if (letteredPoints && letteredPoints.length > 0) {
      // Take first 3 lettered points and clean them
      const cleanPoints = letteredPoints.slice(0, 3)
        .map(point => {
          // Remove letter prefix and clean up
          return point.replace(/^[a-z]\)\s*/i, '')
            .replace(/;$/, '')
            .trim();
        })
        .filter(point => point.length > 10);
      
      if (cleanPoints.length > 0) {
        return cleanPoints.join('.\n') + '.';
      }
    }
    
    // Fallback: extract first sentence and key requirements
    const firstSentence = guidance.split(/[.!?]/)[0];
    const keyPhrase = firstSentence.match(/shall\s+([^:]+)/i);
    
    if (keyPhrase) {
      return `${keyPhrase[1].trim()}.
Ensure proper documentation and management approval.
Implement regular review and monitoring processes.`;
    }
    
    // Ultimate fallback: take first 200 characters
    return guidance.substring(0, 200).trim() + '.';
  }
  
  /**
   * Extract key guidance points from the actual requirement text using smart text processing
   * NO AI APIs, just intelligent text analysis and extraction
   */
  private static async extractKeyGuidancePoints(title: string, fullRequirement: string): Promise<string> {
    try {
      // First, extract guidance from the requirement description itself
      const selfGuidance = this.extractGuidanceFromRequirementText(fullRequirement);
      
      // Then, search database for related guidance
      const { supabase } = await import('@/lib/supabase');
      
      // Search for requirements with similar titles/content
      const searchTerms = title.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3)
        .slice(0, 3); // Top 3 keywords only
      
      if (searchTerms.length === 0) {
        return selfGuidance || `Implement appropriate controls for ${title.toLowerCase()}.`;
      }
      
      const { data: relatedRequirements } = await supabase
        .from('requirements_library')
        .select('audit_ready_guidance, description')
        .or(searchTerms.map(term => `title.ilike.%${term}%`).join(','))
        .limit(2); // Only 2 results to avoid chaos
      
      const guidancePoints: string[] = [];
      
      // Add self-extracted guidance first
      if (selfGuidance) {
        guidancePoints.push(selfGuidance);
      }
      
      // Add key points from database
      if (relatedRequirements && relatedRequirements.length > 0) {
        relatedRequirements.forEach(req => {
          const auditGuidance = (req as any).audit_ready_guidance;
          if (auditGuidance && typeof auditGuidance === 'string') {
            const keyPoints = this.extractKeyPointsFromText(auditGuidance);
            guidancePoints.push(...keyPoints);
          }
        });
      }
      
      // Clean, deduplicate and limit to 4-6 practical points
      const cleanedGuidance = [...new Set(guidancePoints)]
        .map(point => this.cleanGuidanceText(point))
        .filter(point => point.length > 15 && point.length < 120)
        .slice(0, 6)
        .join('\n');
      
      return cleanedGuidance || `Implement appropriate controls and documentation for ${title.toLowerCase()}.`;
      
    } catch (error) {
      console.error('[extractKeyGuidancePoints] Error:', error);
      return `Implement appropriate controls and documentation for ${title.toLowerCase()}.`;
    }
  }
  
  /**
   * Extract guidance from the requirement text itself (the description part)
   */
  private static extractGuidanceFromRequirementText(requirement: string): string | null {
    // Look for the description part after the title
    const parts = requirement.split(' - ');
    if (parts.length < 2) return null;
    
    const description = parts.slice(1).join(' - ');
    
    // Extract key implementation points
    const sentences = description.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20)
      .filter(s => s.match(/must|shall|should|implement|establish|ensure|define|maintain|document/i))
      .slice(0, 2); // Top 2 key points
    
    return sentences.length > 0 ? sentences.join('.\n') + '.' : null;
  }
  
  /**
   * Extract key actionable points from guidance text
   */
  private static extractKeyPointsFromText(text: string): string[] {
    if (!text) return [];
    
    const points: string[] = [];
    
    // Split by common delimiters
    const sentences = text.split(/[.!?\n•-]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20);
    
    for (const sentence of sentences) {
      // Look for actionable guidance (implementation-focused)
      if (sentence.match(/implement|establish|ensure|define|maintain|document|conduct|create|develop/i)) {
        // Clean and format
        let cleaned = sentence
          .replace(/^[-•]\s*/, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (cleaned.length >= 20 && cleaned.length <= 100) {
          points.push(cleaned);
        }
      }
    }
    
    return points.slice(0, 3); // Max 3 points per source
  }
  
  /**
   * Clean guidance text - remove symbols but preserve meaning
   */
  private static cleanGuidanceText(text: string): string {
    return text
      .replace(/[#*_`~]/g, '')
      .replace(/\*\*/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  /**
   * Get SHORT abstracted guidance from database (2-3 lines max) - DEPRECATED, use getUnifiedGuidanceForRequirement instead
   * Hämta KORT sammanfattning från databasen
   */
  private static async getShortAbstractedGuidance(title: string): Promise<string> {
    try {
      // Search for related guidance in database
      const { supabase } = await import('@/lib/supabase');
      
      // Extract key search term from title
      const searchTerm = title.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .find(word => word.length > 4) || 'security';
      
      // Get ONE relevant requirement from database
      const { data } = await supabase
        .from('requirements_library')
        .select('description')
        .ilike('title', `%${searchTerm}%`)
        .limit(1);
      
      if (data && data[0] && (data[0] as any).description) {
        // Take ONLY first 150 chars as abstract
        const abstract = ((data[0] as any).description as string)
          .substring(0, 150)
          .trim();
        
        return `${abstract}. Establish documented procedures and regular review processes.`;
      }
    } catch (error) {
      // Ignore database errors
    }
    
    // Simple fallback - ONE sentence only
    const keyword = title.split(/\s+/)[0]?.toLowerCase() || 'security';
    return `Implement and maintain ${keyword} controls with appropriate documentation and regular assessments.`;
  }

  /**
   * Create clean, abstracted guidance for each sub-requirement title
   * Returns concise, practical guidance without database chaos or cutoffs
   */
  private static createAbstractedGuidance(title: string): string {
    // Clean title to extract key concept
    const cleanTitle = title.toLowerCase().trim();
    
    // Smart guidance mapping based on common security topics
    const guidanceMap: Record<string, string> = {
      // Leadership & Governance
      'leadership': 'Establish clear executive commitment to information security with documented policies, regular reviews, and accountability measures.',
      'commitment': 'Demonstrate visible leadership commitment through policy approval, resource allocation, and regular security reviews.',
      'governance': 'Implement comprehensive governance structure with defined roles, responsibilities, and oversight mechanisms.',
      'scope': 'Define clear boundaries and applicability of your information security management system covering all critical assets.',
      'policy': 'Develop comprehensive information security policies aligned with business objectives and regulatory requirements.',
      
      // Risk & Assessment
      'risk': 'Conduct systematic risk assessments, implement appropriate controls, and maintain risk registers with regular updates.',
      'assessment': 'Perform regular security assessments covering technical, procedural, and organizational aspects.',
      'evaluation': 'Establish ongoing evaluation processes to measure security effectiveness and identify improvement areas.',
      'monitoring': 'Implement continuous monitoring systems with defined metrics, reporting, and corrective action procedures.',
      
      // Asset Management
      'asset': 'Maintain comprehensive asset inventories with classification, ownership, and lifecycle management procedures.',
      'inventory': 'Create and maintain accurate inventories of all information assets with regular updates and verification.',
      'classification': 'Implement information classification schemes with appropriate handling and protection requirements.',
      
      // Access Control
      'access': 'Establish role-based access controls with regular reviews, provisioning procedures, and deprovisioning processes.',
      'authentication': 'Implement strong authentication mechanisms including multi-factor authentication for privileged accounts.',
      'authorization': 'Define clear authorization procedures with segregation of duties and least privilege principles.',
      
      // Technical Controls
      'cryptography': 'Implement appropriate cryptographic controls with key management, algorithm selection, and regular reviews.',
      'encryption': 'Deploy encryption for data at rest and in transit using approved algorithms and key management practices.',
      'network': 'Secure network infrastructure with segmentation, monitoring, and controlled access points.',
      'system': 'Harden systems according to security baselines with regular patching and configuration management.',
      
      // Operations
      'operations': 'Establish secure operational procedures with change management, capacity planning, and performance monitoring.',
      'incident': 'Implement incident response procedures with roles, communication plans, and recovery processes.',
      'backup': 'Maintain reliable backup systems with regular testing, offsite storage, and recovery procedures.',
      'continuity': 'Develop business continuity plans with regular testing, update procedures, and recovery time objectives.',
      
      // Compliance & Audit
      'compliance': 'Establish compliance management processes with regular assessments, gap analysis, and remediation tracking.',
      'audit': 'Conduct internal audits with defined scope, qualified auditors, and management review of findings.',
      'legal': 'Ensure compliance with applicable legal and regulatory requirements through regular reviews and updates.',
      
      // Human Resources
      'personnel': 'Implement personnel security controls including background checks, training, and confidentiality agreements.',
      'training': 'Provide regular security awareness training with role-specific content and effectiveness measurement.',
      'competence': 'Ensure staff competence through training programs, certifications, and performance evaluations.',
      
      // Third Party
      'supplier': 'Manage third-party risks through due diligence, contracts, and ongoing monitoring of security performance.',
      'contract': 'Include appropriate security requirements in contracts with regular reviews and compliance monitoring.'
    };
    
    // Find best matching guidance
    for (const [keyword, guidance] of Object.entries(guidanceMap)) {
      if (cleanTitle.includes(keyword)) {
        return guidance;
      }
    }
    
    // Extract first meaningful word for generic guidance
    const firstWord = cleanTitle.split(/\s+/)[0];
    if (firstWord && firstWord.length > 3) {
      return `Implement comprehensive ${firstWord} controls with documented procedures, regular assessments, and continuous improvement processes.`;
    }
    
    // Ultimate fallback
    return 'Establish appropriate security controls with documented procedures, regular reviews, and compliance monitoring.';
  }

  /**
   * Generate professional explanation for sub-requirement
   */
  private static generateProfessionalExplanation(title: string, description: string): string {
    if (description && description.length > 50) {
      return description;
    }
    
    // Generate based on title
    return `Establish comprehensive ${title.toLowerCase()} that define requirements, responsibilities, and procedures for this security domain. This includes policy development, implementation planning, and ongoing management processes.`;
  }
  
  /**
   * Generate relevant implementation guidance based on the specific requirement and selected frameworks
   */
  private static async generateRelevantGuidance(title: string, description: string, selectedFrameworks?: Record<string, boolean | string>): Promise<string[]> {
    // Extract real guidance from requirements_library.audit_ready_guidance based on title/description match
    // and filter based on selected frameworks
    
    try {
      const { supabase } = await import('../../lib/supabase');
      
      // Build framework filter
      const frameworkCodes: string[] = [];
      if (selectedFrameworks) {
        Object.entries(selectedFrameworks).forEach(([framework, selected]) => {
          if (selected) {
            // Map UI framework names to database codes
            switch (framework) {
              case 'iso27001': frameworkCodes.push('iso27001'); break;
              case 'iso27002': frameworkCodes.push('iso27002'); break;
              case 'cisControls': frameworkCodes.push('cis_controls'); break;
              case 'nis2': frameworkCodes.push('nis2'); break;
              case 'gdpr': frameworkCodes.push('gdpr'); break;
              case 'dora': frameworkCodes.push('dora'); break;
            }
          }
        });
      }
      
      // Query requirements_library for matching records with audit_ready_guidance
      const query = supabase
        .from('requirements_library')
        .select('audit_ready_guidance, title, description')
        .not('audit_ready_guidance', 'is', null)
        .neq('audit_ready_guidance', '');
      
      // Add framework filter if frameworks are selected
      if (frameworkCodes.length > 0) {
        query.in('framework_code', frameworkCodes);
      }
      
      // Add text matching - look for similar titles or descriptions
      if (title) {
        query.or(`title.ilike.%${title}%,description.ilike.%${title}%`);
      }
      
      const { data: requirements, error } = await query.limit(10);
      
      if (error) {
        console.error('[CleanGuidanceService] Error fetching guidance:', error);
        return [];
      }
      
      if (!requirements || requirements.length === 0) {
        return [];
      }
      
      // Extract guidance points from audit_ready_guidance text
      const guidancePoints: string[] = [];
      
      requirements.forEach(req => {
        const auditGuidance = (req as any).audit_ready_guidance;
        if (auditGuidance && typeof auditGuidance === 'string') {
          // Parse guidance from audit_ready_guidance text
          const guidance = this.extractGuidanceFromText(auditGuidance);
          guidancePoints.push(...guidance);
        }
      });
      
      // Remove duplicates and limit to 3-4 most relevant points
      const uniqueGuidance = [...new Set(guidancePoints)];
      return uniqueGuidance.slice(0, 4);
      
    } catch (error) {
      console.error('[CleanGuidanceService] Error generating guidance:', error);
      return [];
    }
  }
  
  /**
   * Extract implementation guidance points from audit_ready_guidance text
   */
  private static extractGuidanceFromText(text: string): string[] {
    if (!text) return [];
    
    const guidancePoints: string[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Look for lines that contain implementation guidance (not audit evidence)
      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        // Skip audit evidence bullets
        if (!/documented.*policy.*with.*management.*approval|implementation.*procedures.*and.*workflows|training.*records.*and.*competency/i.test(trimmed)) {
          // This looks like implementation guidance, not audit evidence
          const guidance = trimmed.replace(/^[•\-]\s*/, '').trim();
          if (guidance.length > 10) { // Filter out very short points
            guidancePoints.push(guidance);
          }
        }
      }
      
      // Also look for guidance sections
      if (/implementation.*guidance|best.*practice|recommended.*approach/i.test(trimmed)) {
        const guidance = trimmed.replace(/^[•\-]\s*/, '').trim();
        if (guidance.length > 10) {
          guidancePoints.push(guidance);
        }
      }
    }
    
    return guidancePoints;
  }
  
  /**
   * Build operational excellence section
   */
  private static buildOperationalExcellence(): string {
    return `🎯 OPERATIONAL EXCELLENCE INDICATORS

✅ FOUNDATIONAL CONTROLS

✅ **Policy Documentation** - Comprehensive policies covering all requirement areas with management approval and annual reviews
✅ **Process Implementation** - Documented and implemented procedures for all security processes with version control
✅ **Resource Allocation** - Adequate resources assigned to implementation with budget tracking and year-over-year analysis
✅ **Training Programs** - Staff training on relevant requirements with completion tracking and effectiveness measurement

✅ ADVANCED CONTROLS

✅ **Continuous Monitoring** - Automated monitoring where applicable with real-time dashboards and alerting
✅ **Regular Reviews** - Periodic assessment and improvement with quarterly management reviews and annual internal audits
✅ **Integration** - Integration with other business processes including project management and change control
✅ **Metrics and KPIs** - Measurable performance indicators tied to business objectives and executive accountability

✅ AUDIT-READY DOCUMENTATION

✅ **Evidence Collection** - Systematic evidence gathering with centralized repository and retention policies
✅ **Compliance Records** - Complete audit trails with timestamped logs and version-controlled documentation
✅ **Gap Analysis** - Regular assessment against requirements with remediation tracking and progress reporting
✅ **Corrective Actions** - Documented remediation activities with ownership, timelines, and effectiveness validation

💡 PRO TIP: Phase implementation over 6-12 months starting with foundational controls (policies, organizational structure), then advance to sophisticated monitoring and continuous improvement processes. Key success metrics include >95% policy compliance, executive participation in quarterly security reviews, documented incident response exercises, and evidence of year-over-year security program maturation.`;
  }
  
  /**
   * Get framework mappings for category
   */
  private static getCategoryFrameworkMappings(category: string): Record<string, string[]> {
    const mappings: Record<string, Record<string, string[]>> = {
      'Identity and Access Management': {
        'iso27001': ['A.9.1.1', 'A.9.1.2', 'A.9.2.1', 'A.9.2.2', 'A.9.2.3', 'A.9.2.4', 'A.9.2.5', 'A.9.2.6', 'A.9.3.1', 'A.9.4.1', 'A.9.4.2', 'A.9.4.3', 'A.9.4.4', 'A.9.4.5'],
        'cisControls': ['4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8'],
        'nistCsf': ['PR.AC-1', 'PR.AC-3', 'PR.AC-4', 'PR.AC-6', 'PR.AC-7'],
        'nis2': ['Article 21.2(a)', 'Article 21.2(b)']
      },
      'Governance & Leadership': {
        'iso27001': ['A.5.1', 'A.6.1', 'A.6.2', 'A.6.3'],
        'cisControls': ['14.1', '14.2', '14.3'],
        'nis2': ['Article 20', 'Article 21']
      }
      // Add more categories as needed
    };
    
    return mappings[category] || {};
  }
  
  /**
   * Get detailed guidance data for category
   */
  private static getCategoryGuidanceData(category: string): { subRequirements: SubRequirement[] } | null {
    const guidanceData: Record<string, { subRequirements: SubRequirement[] }> = {
      'Identity and Access Management': {
        subRequirements: [
          {
            id: 'a',
            title: 'User identity and authentication policies',
            professionalExplanation: 'Establish comprehensive user identity management policies that define authentication requirements, account lifecycle management, and identity verification procedures. These policies must address user registration, authentication mechanisms, password requirements, multi-factor authentication implementation, and identity federation standards.',
            auditEvidencePoints: [
              'Documented identity management policy with management approval',
              'Authentication mechanism specifications and configurations',
              'User account lifecycle procedures (creation, modification, deactivation)',
              'Multi-factor authentication implementation records',
              'Identity verification and validation processes'
            ],
            implementationGuidance: [
              'Define minimum password complexity and rotation requirements',
              'Implement multi-factor authentication for privileged accounts',
              'Establish automated account provisioning and deprovisioning workflows',
              'Create identity federation policies for third-party integrations'
            ],
            practicalTools: [
              'Identity and Access Management (IAM) systems',
              'Active Directory or LDAP directories',
              'Single Sign-On (SSO) solutions',
              'Multi-factor authentication tools'
            ],
            bestPractices: [
              'Regular access reviews and certifications',
              'Principle of least privilege implementation',
              'Automated user lifecycle management',
              'Strong authentication mechanisms'
            ]
          },
          {
            id: 'b',
            title: 'Access control and authorization framework',
            professionalExplanation: 'Implement robust access control mechanisms that enforce the principle of least privilege and provide appropriate authorization levels based on user roles and responsibilities. This includes role-based access control (RBAC), attribute-based access control (ABAC), and regular access reviews.',
            auditEvidencePoints: [
              'Access control policy documentation and approval',
              'Role definitions and permission matrices',
              'Access review procedures and schedules',
              'Authorization mechanism configurations',
              'Access control system logs and monitoring'
            ],
            implementationGuidance: [
              'Define user roles and associated permissions',
              'Implement automated access control enforcement',
              'Establish regular access certification processes',
              'Create exception handling procedures for emergency access'
            ],
            practicalTools: [
              'Role-Based Access Control (RBAC) systems',
              'Privileged Access Management (PAM) solutions',
              'Access governance platforms',
              'Identity governance and administration tools'
            ],
            bestPractices: [
              'Regular access recertification campaigns',
              'Segregation of duties enforcement',
              'Just-in-time access provisioning',
              'Comprehensive access logging and monitoring'
            ]
          },
          {
            id: 'c',
            title: 'Privileged access management and monitoring',
            professionalExplanation: 'Establish specialized controls for privileged accounts including administrative access, service accounts, and emergency access procedures. This requires enhanced monitoring, approval workflows, session recording, and regular review of privileged access rights.',
            auditEvidencePoints: [
              'Privileged access management policy and procedures',
              'Privileged account inventory and classifications',
              'Session monitoring and recording configurations',
              'Privileged access approval workflows',
              'Emergency access procedures and logs'
            ],
            implementationGuidance: [
              'Implement privileged account discovery and inventory',
              'Deploy session recording for privileged access',
              'Establish approval workflows for privileged access requests',
              'Create emergency access procedures with appropriate monitoring'
            ],
            practicalTools: [
              'Privileged Access Management (PAM) platforms',
              'Session recording and monitoring tools',
              'Password vaulting solutions',
              'Privileged account analytics platforms'
            ],
            bestPractices: [
              'Zero standing privileges implementation',
              'Comprehensive privileged session monitoring',
              'Regular privileged account reviews',
              'Automated privilege escalation controls'
            ]
          },
          {
            id: 'd',
            title: 'User access review and certification processes',
            professionalExplanation: 'Implement systematic processes for regular review and certification of user access rights to ensure continued appropriateness and compliance with the principle of least privilege. This includes automated review workflows, management attestation, and remediation procedures.',
            auditEvidencePoints: [
              'Access review policy and schedule documentation',
              'Access certification campaign results and approvals',
              'Remediation tracking and completion records',
              'Management attestation and sign-off procedures',
              'Access review automation configurations and logs'
            ],
            implementationGuidance: [
              'Establish quarterly access review cycles',
              'Implement automated access certification workflows',
              'Create remediation tracking and escalation procedures',
              'Define management attestation requirements and processes'
            ],
            practicalTools: [
              'Identity governance platforms',
              'Access certification workflow systems',
              'Automated access review tools',
              'Compliance reporting and dashboard solutions'
            ],
            bestPractices: [
              'Risk-based access review prioritization',
              'Continuous access monitoring and analytics',
              'Automated remediation where possible',
              'Regular review process improvement and optimization'
            ]
          }
        ]
      },
      'Governance & Leadership': {
        subRequirements: [
          {
            id: 'a',
            title: 'Leadership commitment and accountability',
            professionalExplanation: 'Information security leadership requires top management (CEO, Board of Directors) to actively demonstrate responsibility for protecting organizational information assets. This establishes the Information Security Management System (ISMS) as a systematic approach to managing sensitive company information and maintaining its confidentiality, integrity, and availability.',
            auditEvidencePoints: [
              'Board-level security governance committee charter and meeting minutes',
              'Executive security accountability framework with defined roles',
              'Annual security budget allocation and approval documentation',
              'Leadership participation in security incidents and responses',
              'Security performance metrics tied to executive compensation'
            ],
            implementationGuidance: [
              'Establish board-level security oversight committee',
              'Define executive security roles and responsibilities',
              'Implement security-focused KPIs for leadership team',
              'Create regular executive security briefing schedule'
            ],
            practicalTools: [
              'Governance, Risk, and Compliance (GRC) platforms',
              'Executive dashboard and reporting tools',
              'Board portal security modules',
              'Risk assessment and reporting systems'
            ],
            bestPractices: [
              'Monthly executive security reviews',
              'Annual security strategy development',
              'Leadership security awareness training',
              'Integration with business continuity planning'
            ]
          },
          {
            id: 'b',
            title: 'Organizational scope and boundaries',
            professionalExplanation: 'Scope definition requires comprehensive documentation of all organizational components within the security program coverage. This encompasses physical locations, digital boundaries, business processes, and data flows with clear inclusions and exclusions.',
            auditEvidencePoints: [
              'ISMS scope statement with management approval',
              'Asset inventory covering all locations and systems',
              'Business process documentation and security impact assessment',
              'Data flow mapping and classification documentation',
              'Scope exclusion justifications and risk assessments'
            ],
            implementationGuidance: [
              'Document all physical and logical boundaries',
              'Create comprehensive asset inventory',
              'Map critical business processes and dependencies',
              'Establish scope review and update procedures'
            ],
            practicalTools: [
              'Asset management systems',
              'Network discovery and mapping tools',
              'Business process modeling software',
              'Data flow analysis platforms'
            ],
            bestPractices: [
              'Regular scope reviews during organizational changes',
              'Risk-based scope prioritization',
              'Stakeholder involvement in scope definition',
              'Integration with business impact analysis'
            ]
          }
        ]
      }
      // Add more categories here
    };
    
    return guidanceData[category] || null;
  }
  
  // Removed getGuidanceTemplateFromDB method - not needed without audit evidence injection
  
  /**
   * Get sub-requirements directly from unified_requirements database table
   */
  private static async getSubRequirementsFromDatabase(category: string, selectedFrameworks?: Record<string, boolean | string>): Promise<string[] | null> {
    try {
      const { supabase } = await import('../../lib/supabase');
      
      console.log(`[CleanGuidanceService] Querying database for category: "${category}"`);
      
      // First, we need to find the category_id based on the category name
      const { data: categoryData, error: categoryError } = await supabase
        .from('unified_compliance_categories')
        .select('id')
        .eq('name', category)
        .single();
        
      if (categoryError) {
        console.error(`[CleanGuidanceService] Category error for "${category}":`, categoryError);
        return null;
      }
      
      if (!categoryData) {
        console.warn(`[CleanGuidanceService] Category not found: "${category}"`);
        return null;
      }
      
      const { data, error } = await supabase
        .from('unified_requirements')
        .select('sub_requirements, title, description')
        .eq('category_id', categoryData.id);
        
      if (error) {
        console.error(`[CleanGuidanceService] Database error for category "${category}":`, error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.warn(`[CleanGuidanceService] No unified requirements found for category "${category}"`);
        return null;
      }
      
      // Select the appropriate unified requirement based on frameworks
      let selectedRequirement = null;
      
      // Check if DORA is selected and there's a DORA-specific requirement
      if (selectedFrameworks?.dora) {
        const doraRequirement = data.find(req => (req as any).title && ((req as any).title as string).toLowerCase().includes('dora'));
        if (doraRequirement) {
          console.log(`[CleanGuidanceService] Using DORA-specific requirement for "${category}"`);
          selectedRequirement = doraRequirement;
        }
      }
      
      // If no DORA or no DORA-specific requirement found, use the first (main) one
      if (!selectedRequirement) {
        // Use the one with most sub-requirements (likely the main/comprehensive one)
        selectedRequirement = data.reduce((prev, current) => {
          const prevCount = Array.isArray((prev as any).sub_requirements) ? (prev as any).sub_requirements.length : 0;
          const currentCount = Array.isArray((current as any).sub_requirements) ? (current as any).sub_requirements.length : 0;
          return currentCount > prevCount ? current : prev;
        });
        console.log(`[CleanGuidanceService] Using main requirement (${Array.isArray((selectedRequirement as any).sub_requirements) ? (selectedRequirement as any).sub_requirements.length : 0} sub-requirements) for "${category}"`);
      }
      
      if (!selectedRequirement || !(selectedRequirement as any).sub_requirements) {
        console.warn(`[CleanGuidanceService] Selected requirement has no sub-requirements for category "${category}"`);
        return null;
      }
      
      // sub_requirements is a JSON array in the database
      const subRequirements = Array.isArray((selectedRequirement as any).sub_requirements) ? (selectedRequirement as any).sub_requirements : [];
      console.log(`[CleanGuidanceService] Retrieved ${subRequirements.length} sub-requirements from database for "${category}"`);
      
      // DEBUG: Log first few characters of each sub-requirement to see the structure
      subRequirements.forEach((req: any, index: number) => {
        const letter = String.fromCharCode(97 + index);
        console.log(`[CleanGuidanceService] ${letter}: ${(req as string).substring(0, 200)}...`);
      });
      
      return subRequirements;
      
    } catch (error) {
      console.error(`[CleanGuidanceService] Error fetching sub-requirements for "${category}":`, error);
      return null;
    }
  }

  /**
   * Parse unified requirement text to extract title, clean content, and audit evidence
   * FIXED: Now properly extracts titles that match the unified requirements display
   */
  private static parseUnifiedRequirement(requirement: string): { title: string; cleanContent: string; auditEvidence: string[] } {
    if (!requirement) {
      return { title: 'Unknown requirement', cleanContent: '', auditEvidence: [] };
    }
    
    console.log(`[CleanGuidanceService] Parsing requirement: "${requirement.substring(0, 300)}..."`);
    
    // First, check if this follows the pattern "a) TITLE" format used in unified requirements
    // Use the same regex pattern as CISOGradeRenderer for consistency
    // Expanded to handle more letters and multiline content
    const letterTitleMatch = requirement.match(/^([a-z])\)\s+(.+)/i);
    if (letterTitleMatch) {
      const [fullMatch, letter, restOfLine] = letterTitleMatch;
      
      // Extract the title part (everything until the first dash, parenthesis, or description starts)
      let titleText = restOfLine;
      let cleanContent = '';
      
      // Look for common separators that indicate where title ends and description begins
      const separators = [' - ', ' (', ': '];
      let titleEnd = titleText.length;
      
      for (const separator of separators) {
        const index = titleText.indexOf(separator);
        if (index > 0 && index < titleEnd) {
          titleEnd = index;
        }
      }
      
      // Split at the separator
      if (titleEnd < titleText.length) {
        cleanContent = titleText.substring(titleEnd).trim();
        titleText = titleText.substring(0, titleEnd).trim();
      }
      
      // The title should include the letter prefix for consistency with UnifiedRequirementsTab
      const fullTitle = `${letter}) ${titleText}`;
      
      console.log(`[CleanGuidanceService] Extracted title from letter pattern: "${fullTitle}"`);
      
      return {
        title: fullTitle,
        cleanContent,
        auditEvidence: [] // Will be populated from database content if available
      };
    }
    
    // Fallback parsing for other formats
    const lines = requirement.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let title = '';
    let cleanContent = '';
    const auditEvidence: string[] = [];
    let inAuditSection = false;
    let contentLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for audit evidence headers
      if (/📋.*[Aa]udit.*[Rr]eady.*[Ee]vidence.*[Cc]ollection/i.test(line) || 
          /[Ee]ssential.*[Dd]ocumentation.*[Rr]equired/i.test(line) ||
          /[Tt]echnical.*[Ee]vidence.*to.*[Cc]ollect/i.test(line)) {
        inAuditSection = true;
        continue;
      }
      
      // If we're in audit section, collect evidence points
      if (inAuditSection && line.startsWith('•')) {
        const evidencePoint = line.replace(/^•\s*/, '').trim();
        if (evidencePoint.length > 0) {
          auditEvidence.push(evidencePoint);
        }
        continue;
      }
      
      // If we hit non-audit content after audit section, we're done with audit
      if (inAuditSection && !line.startsWith('•') && !line.includes('📋') && !line.includes('Essential') && !line.includes('Technical Evidence')) {
        inAuditSection = false;
      }
      
      // Skip audit content for clean content
      if (!inAuditSection && !line.startsWith('•') && !line.includes('📋') && !line.includes('Essential')) {
        contentLines.push(line);
      }
    }
    
    // Extract title and content from clean lines
    if (contentLines.length > 0) {
      const firstLine = contentLines[0];
      
      // Try different patterns to extract the title
      if (firstLine.includes(' - ')) {
        // Pattern like "TITLE - Description" (space-hyphen-space separator)
        const parts = firstLine.split(' - ');
        if (parts.length >= 2) {
          title = parts[0].replace(/^[a-z]\)\s*/i, '').trim();
          cleanContent = parts.slice(1).join(' - ').trim();
          if (contentLines.length > 1) {
            cleanContent += ' ' + contentLines.slice(1).join(' ');
          }
        }
      } else {
        // Extract title from uppercase words at beginning
        const text = firstLine.replace(/^[a-z]\)\s*/i, '').trim();
        const words = text.split(' ');
        let titleWords = [];
        for (const word of words) {
          if (word === word.toUpperCase() && word.length > 1) {
            titleWords.push(word);
          } else {
            break; // Stop at first non-uppercase word
          }
        }
        
        if (titleWords.length > 0) {
          title = titleWords.join(' ');
          cleanContent = words.slice(titleWords.length).join(' ');
        } else {
          title = words.slice(0, 3).join(' '); // Fallback: first 3 words
          cleanContent = words.slice(3).join(' ');
        }
        
        if (contentLines.length > 1) {
          cleanContent += ' ' + contentLines.slice(1).join(' ');
        }
      }
    } else {
      // No content lines found, just return the whole requirement as title
      title = requirement.substring(0, 50).trim();
      cleanContent = requirement;
    }
    
    // Fallback
    if (!title) {
      title = 'Requirement';
    }
    
    console.log(`[CleanGuidanceService] Parsed requirement: title="${title}", clean content length=${cleanContent.length}, audit evidence count=${auditEvidence.length}`);
    
    return { title, cleanContent, auditEvidence };
  }
  
  /**
   * Get real implementation guidance from requirements_library.audit_ready_guidance
   * based on title/content matching and selected frameworks
   */
  private static async getRealGuidanceFromDatabase(title: string, content: string, selectedFrameworks?: Record<string, boolean | string>): Promise<string[]> {
    try {
      const { supabase } = await import('../../lib/supabase');
      
      // Build framework names filter (use the same approach as other services)
      const frameworkNames: string[] = [];
      if (selectedFrameworks) {
        Object.entries(selectedFrameworks).forEach(([framework, selected]) => {
          if (selected) {
            switch (framework) {
              case 'iso27001': frameworkNames.push('ISO 27001'); break;
              case 'iso27002': frameworkNames.push('ISO 27002'); break;  
              case 'cisControls': 
                if (typeof selected === 'string') {
                  frameworkNames.push('CIS Controls'); // The framework name, not the specific IG level
                } else {
                  frameworkNames.push('CIS Controls');
                }
                break;
              case 'nis2': frameworkNames.push('NIS2'); break;
              case 'gdpr': frameworkNames.push('GDPR'); break;
              case 'dora': frameworkNames.push('DORA'); break;
            }
          }
        });
      }
      
      // Query for matching guidance using standards_library relation
      let query = supabase
        .from('requirements_library')
        .select(`
          audit_ready_guidance,
          title,
          description,
          standards_library!inner(name)
        `)
        .not('audit_ready_guidance', 'is', null)
        .neq('audit_ready_guidance', '')
        .eq('is_active', true);
      
      // Filter by frameworks if specified
      if (frameworkNames.length > 0) {
        query = query.in('standards_library.name', frameworkNames);
        console.log(`[CleanGuidanceService] Filtering by framework names: ${frameworkNames.join(', ')}`);
      } else {
        console.log(`[CleanGuidanceService] No framework filter applied - getting guidance from all frameworks`);
      }
      
      const { data: requirements, error } = await query.limit(50);
      
      if (error) {
        console.error('[CleanGuidanceService] Database error:', error);
        return [];
      }
      
      if (!requirements || requirements.length === 0) {
        console.log('[CleanGuidanceService] No matching guidance found in database');
        return [];
      }
      
      console.log(`[CleanGuidanceService] Found ${requirements.length} requirements with audit_ready_guidance`);
      
      // Extract implementation guidance points (not audit evidence)
      const guidancePoints: string[] = [];
      
      requirements.forEach((req, index) => {
        const auditGuidance = (req as any).audit_ready_guidance;
        if (auditGuidance && typeof auditGuidance === 'string') {
          console.log(`[CleanGuidanceService] Processing requirement ${index + 1}: ${(req as any).standards_library?.name} - ${((req as any).title as string)?.substring(0, 50)}...`);
          const guidance = this.extractImplementationGuidanceFromText(auditGuidance);
          console.log(`[CleanGuidanceService] Extracted ${guidance.length} guidance points from this requirement`);
          guidancePoints.push(...guidance);
        }
      });
      
      // Remove duplicates and return top 4 most relevant points
      const uniqueGuidance = [...new Set(guidancePoints)];
      console.log(`[CleanGuidanceService] Found ${uniqueGuidance.length} unique guidance points for "${title}"`);
      
      return uniqueGuidance.slice(0, 4);
      
    } catch (error) {
      console.error('[CleanGuidanceService] Error fetching guidance:', error);
      return [];
    }
  }
  
  /**
   * Extract implementation guidance points from audit_ready_guidance text
   * IMPROVED: More aggressive extraction to find guidance anywhere in the text
   */
  private static extractImplementationGuidanceFromText(text: string): string[] {
    if (!text) return [];
    
    console.log(`[CleanGuidanceService] Extracting guidance from text (${text.length} chars): "${text.substring(0, 200)}..."`);
    
    const guidancePoints: string[] = [];
    const lines = text.split('\n');
    let inImplementationSection = false;
    let inAuditEvidenceSection = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Check for implementation guidance sections
      if (/implementation.*guidance|recommended.*practice|best.*practice|approach.*guide/i.test(trimmed)) {
        inImplementationSection = true;
        inAuditEvidenceSection = false;
        console.log('[CleanGuidanceService] Found implementation guidance section');
        continue;
      }
      
      // Check for audit evidence sections  
      if (/audit.*evidence|documentation.*required|evidence.*collect|essential.*documentation/i.test(trimmed)) {
        inAuditEvidenceSection = true;
        inImplementationSection = false;
        console.log('[CleanGuidanceService] Found audit evidence section - skipping');
        continue;
      }
      
      // Collect bullets from implementation sections
      if (inImplementationSection && (trimmed.startsWith('•') || trimmed.startsWith('-'))) {
        const guidance = trimmed.replace(/^[•\-]\s*/, '').trim();
        if (guidance.length > 15) {
          guidancePoints.push(guidance);
          console.log(`[CleanGuidanceService] Added implementation guidance: ${guidance.substring(0, 80)}...`);
        }
      }
      
      // Also collect standalone guidance bullets that look like implementation guidance
      if (!inAuditEvidenceSection && (trimmed.startsWith('•') || trimmed.startsWith('-'))) {
        const guidance = trimmed.replace(/^[•\-]\s*/, '').trim();
        
        if (guidance.length > 15 && 
            !this.isAuditEvidence(guidance) && 
            this.isImplementationGuidance(guidance)) {
          guidancePoints.push(guidance);
          console.log(`[CleanGuidanceService] Added standalone guidance: ${guidance.substring(0, 80)}...`);
        }
      }
      
      // FALLBACK: If we don't find explicit sections, extract any actionable bullets
      if (!inImplementationSection && !inAuditEvidenceSection && 
          (trimmed.startsWith('•') || trimmed.startsWith('-')) && 
          guidancePoints.length < 2) {
        const guidance = trimmed.replace(/^[•\-]\s*/, '').trim();
        
        if (guidance.length > 20 && 
            !this.isAuditEvidence(guidance) && 
            (this.isImplementationGuidance(guidance) || /establish|implement|ensure|maintain|deploy|configure/i.test(guidance))) {
          guidancePoints.push(guidance);
          console.log(`[CleanGuidanceService] Added fallback guidance: ${guidance.substring(0, 80)}...`);
        }
      }
    }
    
    console.log(`[CleanGuidanceService] Extracted ${guidancePoints.length} guidance points from text`);
    return guidancePoints;
  }
  
  /**
   * Check if a text line is audit evidence (not implementation guidance)
   */
  private static isAuditEvidence(text: string): boolean {
    const evidencePatterns = [
      /documented.*policy.*with.*management.*approval/i,
      /training.*records.*and.*competency/i,
      /implementation.*procedures.*and.*workflows/i,
      /regular.*review.*and.*update.*documentation/i,
      /compliance.*monitoring.*and.*reporting/i
    ];
    
    return evidencePatterns.some(pattern => pattern.test(text));
  }
  
  /**
   * Check if a text line is implementation guidance
   */
  private static isImplementationGuidance(text: string): boolean {
    const guidancePatterns = [
      /establish|implement|configure|deploy|create|define|maintain/i,
      /ensure.*that|make.*sure|verify.*that/i,
      /regular.*review|periodic.*assessment|continuous.*monitoring/i,
      /automated|centralized|systematic/i
    ];
    
    return guidancePatterns.some(pattern => pattern.test(text));
  }


  /**
   * Build default sub-requirements for categories without detailed guidance
   */
  private static buildDefaultSubRequirements(): SubRequirement[] {
    return [
      {
        id: 'a',
        title: 'Policy and framework establishment',
        professionalExplanation: 'Establish comprehensive policies and frameworks that define requirements, responsibilities, and procedures for this security domain.',
        auditEvidencePoints: [], // No audit evidence for fallback
        implementationGuidance: [], // REMOVED: No more generic guidance spam
        practicalTools: [], // REMOVED: No more generic tool spam
        bestPractices: [] // REMOVED: No more generic best practice spam
      },
      {
        id: 'b',
        title: 'Implementation and operational controls',
        professionalExplanation: 'Implement operational controls and procedures that ensure consistent application of security requirements across the organization.',
        auditEvidencePoints: [], // No audit evidence for fallback  
        implementationGuidance: [], // REMOVED: No more generic guidance spam
        practicalTools: [], // REMOVED: No more generic tool spam
        bestPractices: [] // REMOVED: No more generic best practice spam
      }
    ];
  }
}