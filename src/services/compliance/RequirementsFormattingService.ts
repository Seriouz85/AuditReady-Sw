import { RequirementDetail, UnifiedSection } from './types/ComplianceTypesDefinitions';

/**
 * Requirements Formatting Service
 * 
 * Handles professional formatting and output generation for compliance
 * requirements. Responsible for creating structured, readable content
 * with proper framework references and professional presentation.
 */
export class RequirementsFormattingService {

  /**
   * Format sections into professional content with framework references
   */
  formatProfessionalContent(
    sections: UnifiedSection[], 
    selectedFrameworks: string[], 
    cisIGLevel?: string
  ): string[] {
    console.log(`📝 [FORMAT] Formatting ${sections.length} sections for professional output`);
    
    return sections.map((section, index) => {
      console.log(`🔧 [FORMAT] Processing section ${index + 1}: "${section.id}) ${section.title}"`);
      console.log(`📊 [FORMAT] Section stats:`, {
        id: section.id,
        title_length: section.title.length,
        description_length: section.description.length,
        requirements_count: section.requirements.length,
        frameworks_count: section.frameworks.size,
        combined_text_length: section.combinedText?.length || 0,
        has_combined_text: !!(section.combinedText && section.combinedText.trim().length > 0)
      });
      
      let content = `**${section.id}) ${section.title}**\n\n`;
      
      // Only show description if we have NO requirements (as context)
      // If we have requirements, they will provide the actual content
      if (section.requirements.length > 0) {
        console.log(`✅ [FORMAT] Section has ${section.requirements.length} requirements - using database content`);
        
        // Show the INJECTED content from database requirements
        if (section.combinedText && section.combinedText.trim().length > 0) {
          console.log(`📝 [FORMAT] Using combined text (${section.combinedText.length} chars)`);
          content += section.combinedText;
        } else {
          console.log(`⚠️ [FORMAT] No combined text - using direct requirements formatting`);
          const directContent = this.formatRequirementsDirectly(section.requirements);
          content += directContent;
          console.log(`📄 [FORMAT] Direct content: ${directContent.length} chars`);
        }
        
        // Add framework references
        if (section.frameworks.size > 0) {
          console.log(`🔗 [FORMAT] Adding framework references for ${section.frameworks.size} frameworks`);
          const frameworkRefs = this.buildFrameworkReferences(section.requirements);
          if (frameworkRefs) {
            content += `\n\nFramework References: ${frameworkRefs}`;
            console.log(`✅ [FORMAT] Added references: "${frameworkRefs}"`);
            console.log(`🎯 [DEBUG] Content now contains: "${content.substring(0, 200)}"`);
          } else {
            console.log(`⚠️ [FORMAT] No framework references generated`);
          }
        } else {
          console.log(`⚠️ [FORMAT] No frameworks to reference`);
        }
      } else {
        console.log(`📋 [FORMAT] Section has no requirements - using description as placeholder`);
        // Show the original description as a framework/placeholder
        if (section.description && section.description.trim().length > 0) {
          content += `${section.description}\n`;
          console.log(`📝 [FORMAT] Used description (${section.description.length} chars)`);
          
          // Add framework references even for fallback descriptions
          const selectedFrameworkNames = this.getSelectedFrameworkNames(selectedFrameworks, cisIGLevel);
          if (selectedFrameworkNames.length > 0) {
            const frameworkRefs = selectedFrameworkNames.join(' | ');
            content += `\n\nFramework References: ${frameworkRefs}`;
            console.log(`✅ [FORMAT] Added fallback framework references: "${frameworkRefs}"`);
          }
        } else {
          console.log(`⚠️ [FORMAT] No description available`);
        }
      }
      
      console.log(`🎯 [FORMAT] Final content for section ${section.id}: ${content.length} chars`);
      console.log(`📄 [FORMAT] Content preview: "${content.substring(0, 150)}..."`);
      
      return content;
    });
  }

  /**
   * Format requirements directly if combinedText generation failed
   */
  private formatRequirementsDirectly(requirements: RequirementDetail[]): string {
    const formatted: string[] = [];
    
    requirements.slice(0, 5).forEach(req => {
      const bestSource = this.selectBestContentSource(req);
      if (bestSource.length > 20) {
        const extracted = this.extractSpecificDetails(bestSource, req);
        if (extracted && extracted.trim().length > 10) {
          formatted.push(`• ${this.cleanText(extracted)}`);
        }
      }
    });
    
    return formatted.join('\n');
  }

  /**
   * Build framework references from requirements
   */
  buildFrameworkReferences(requirements: RequirementDetail[]): string {
    console.log(`🔗 [REFS] Building framework references for ${requirements.length} requirements`);
    
    const refMap = new Map<string, string[]>();
    
    requirements.forEach(req => {
      console.log(`📋 [REFS] Processing: ${req.control_id} (${req.framework})`);
      
      if (!refMap.has(req.framework)) {
        refMap.set(req.framework, []);
        console.log(`🆕 [REFS] Created new framework group: ${req.framework}`);
      }
      const frameworkGroup = refMap.get(req.framework);
      if (frameworkGroup) {
        frameworkGroup.push(req.control_id);
      }
    });
    
    console.log(`📊 [REFS] Framework groups:`, Array.from(refMap.entries()).map(([framework, ids]) => ({
      framework,
      count: ids.length,
      ids: ids.join(', ')
    })));
    
    const references: string[] = [];
    refMap.forEach((controlIds, framework) => {
      const sortedIds = controlIds.sort();
      const reference = `${framework}: ${sortedIds.join(', ')}`;
      references.push(reference);
      console.log(`✅ [REFS] Created reference: ${reference}`);
    });
    
    const result = references.join('; ');
    console.log(`🎯 [REFS] Final framework references: "${result}"`);
    
    return result;
  }

  /**
   * Get selected framework names for display
   */
  private getSelectedFrameworkNames(frameworks: string[], cisIGLevel?: string): string[] {
    const names: string[] = [];
    
    if (frameworks.includes('iso27001')) names.push('ISO 27001');
    if (frameworks.includes('iso27002')) names.push('ISO 27002');
    if (frameworks.includes('nis2')) names.push('NIS2');
    if (frameworks.includes('gdpr')) names.push('GDPR');
    
    if (frameworks.includes('cisControls') && cisIGLevel) {
      if (cisIGLevel === 'ig1') names.push('CIS IG1');
      if (cisIGLevel === 'ig2') names.push('CIS IG2');
      if (cisIGLevel === 'ig3') names.push('CIS IG3');
    }
    
    return names;
  }

  /**
   * Select best content source for requirement
   */
  private selectBestContentSource(req: RequirementDetail): string {
    // Prioritize audit_ready_guidance first, then official_description, finally description
    if (req.audit_ready_guidance && req.audit_ready_guidance.trim().length > 50) {
      return req.audit_ready_guidance;
    }
    
    if (req.official_description && req.official_description.trim().length > 50) {
      return req.official_description;
    }
    
    return req.description || '';
  }

  /**
   * Extract specific technical details from requirement description
   */
  private extractSpecificDetails(requirementText: string, req: RequirementDetail): string {
    console.log(`🔍 [EXTRACT] Processing "${req.control_id}": ${req.title}`);
    
    // Return the first meaningful sentence or paragraph
    const sentences = requirementText.split(/[.!?]+/).filter(s => s.trim().length > 20);
    if (sentences.length > 0) {
      return sentences[0].trim();
    }
    
    return requirementText.substring(0, 200).trim();
  }

  /**
   * Clean text for presentation - remove asterisks, fix capitalization
   */
  private cleanText(text: string): string {
    return text
      // Remove asterisks
      .replace(/\*+/g, '')
      // Fix capitalization - convert ALL CAPS to proper case
      .replace(/\b[A-Z]{2,}\b/g, (match) => {
        // Keep common acronyms in uppercase
        if (['ISMS', 'IT', 'AI', 'API', 'URL', 'DNS', 'IP', 'VPN', 'SSL', 'TLS', 'CIA', 'NIST', 'ISO', 'CIS', 'GDPR', 'NIS2'].includes(match)) {
          return match;
        }
        // Convert to proper case
        return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
      })
      // Remove repetitive implementation guidance sentences
      .replace(/Implementation guidance will be provided based on your selected compliance frameworks\.?\s*/gi, '')
      .replace(/\s*Implementation guidance will be provided.*?\.\s*/gi, '')
      // Clean up whitespace and periods
      .replace(/\s+/g, ' ')
      .replace(/^Requirements?:\s*/i, '')
      .replace(/\.+$/, '') // Remove trailing periods
      .trim();
  }

  /**
   * Format content with proper markdown structure
   */
  formatMarkdownContent(sections: UnifiedSection[]): string {
    const formattedSections = sections.map(section => {
      let content = `## ${section.id}) ${section.title}\n\n`;
      
      if (section.combinedText && section.combinedText.trim().length > 0) {
        content += `${section.combinedText}\n\n`;
      } else if (section.description && section.description.trim().length > 0) {
        content += `${section.description}\n\n`;
      }
      
      // Add framework references if available
      if (section.frameworks.size > 0 && section.requirements.length > 0) {
        const frameworkRefs = this.buildFrameworkReferences(section.requirements);
        if (frameworkRefs) {
          content += `**Framework References:** ${frameworkRefs}\n\n`;
        }
      }
      
      return content;
    });
    
    return formattedSections.join('---\n\n');
  }

  /**
   * Format content for PDF export
   */
  formatPDFContent(sections: UnifiedSection[], metadata?: {
    title?: string;
    organization?: string;
    frameworks?: string[];
    generatedDate?: Date;
  }): string {
    let content = '';
    
    // Add header if metadata provided
    if (metadata) {
      content += `# ${metadata.title || 'Compliance Requirements'}\n\n`;
      
      if (metadata.organization) {
        content += `**Organization:** ${metadata.organization}\n\n`;
      }
      
      if (metadata.frameworks && metadata.frameworks.length > 0) {
        content += `**Frameworks:** ${metadata.frameworks.join(', ')}\n\n`;
      }
      
      if (metadata.generatedDate) {
        content += `**Generated:** ${metadata.generatedDate.toLocaleDateString()}\n\n`;
      }
      
      content += '---\n\n';
    }
    
    // Add formatted sections
    const formattedSections = this.formatProfessionalContent(sections, metadata?.frameworks || []);
    content += formattedSections.join('\n\n---\n\n');
    
    return content;
  }

  /**
   * Format content for Word export
   */
  formatWordContent(sections: UnifiedSection[], metadata?: {
    title?: string;
    organization?: string;
    frameworks?: string[];
    generatedDate?: Date;
  }): string {
    // Word formatting is similar to PDF but with additional styling hints
    let content = this.formatPDFContent(sections, metadata);
    
    // Add Word-specific formatting hints
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    content = content.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    content = content.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    
    return content;
  }

  /**
   * Create executive summary of requirements
   */
  createExecutiveSummary(sections: UnifiedSection[], frameworks: string[]): string {
    const totalSections = sections.length;
    const sectionsWithContent = sections.filter(s => 
      (s.combinedText && s.combinedText.trim().length > 0) || 
      s.requirements.length > 0
    ).length;
    
    const totalRequirements = sections.reduce((sum, section) => sum + section.requirements.length, 0);
    const allFrameworks = new Set<string>();
    sections.forEach(section => {
      section.frameworks.forEach(fw => allFrameworks.add(fw));
    });
    
    let summary = `## Executive Summary\n\n`;
    summary += `This document contains ${totalSections} compliance requirement sections covering ${frameworks.join(', ')} frameworks.\n\n`;
    summary += `**Coverage Statistics:**\n`;
    summary += `- Total Sections: ${totalSections}\n`;
    summary += `- Sections with Content: ${sectionsWithContent}\n`;
    summary += `- Total Requirements Mapped: ${totalRequirements}\n`;
    summary += `- Frameworks Covered: ${Array.from(allFrameworks).join(', ')}\n\n`;
    
    if (sectionsWithContent < totalSections) {
      const missingContent = totalSections - sectionsWithContent;
      summary += `**Note:** ${missingContent} sections require additional content development.\n\n`;
    }
    
    return summary;
  }

  /**
   * Format requirements table for quick reference
   */
  formatRequirementsTable(sections: UnifiedSection[]): string {
    let table = `## Requirements Reference Table\n\n`;
    table += `| Section | Title | Requirements | Frameworks |\n`;
    table += `|---------|-------|-------------|------------|\n`;
    
    sections.forEach(section => {
      const requirementCount = section.requirements.length;
      const frameworkList = Array.from(section.frameworks).join(', ') || 'None';
      
      table += `| ${section.id} | ${section.title} | ${requirementCount} | ${frameworkList} |\n`;
    });
    
    return table;
  }
}