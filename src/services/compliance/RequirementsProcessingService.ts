import { RequirementDetail, UnifiedSection, FRAMEWORK_CODES, MIN_CONTENT_LENGTHS, SIMILARITY_THRESHOLDS } from './types/ComplianceTypesDefinitions';

/**
 * Requirements Processing Service
 * 
 * Handles intelligent assignment, combination, and processing of compliance
 * requirements. Includes smart matching algorithms, content deduplication,
 * and framework-specific processing logic.
 */
export class RequirementsProcessingService {

  /**
   * Smart assignment with requirement combination
   */
  async assignAndCombineRequirements(
    sections: UnifiedSection[],
    requirements: RequirementDetail[]
  ): Promise<UnifiedSection[]> {
    const enhancedSections = [...sections];
    const assignedRequirements = new Set<string>();
    
    console.log(`[PROCESSING] Assigning ${requirements.length} requirements to ${sections.length} sub-sections`);
    
    // Requirements come from CATEGORY level, we need to distribute them to sub-requirements
    // based on content matching
    for (const req of requirements) {
      let bestSection: UnifiedSection | null = null;
      let bestScore = 0;
      
      // Find the BEST matching sub-section for this requirement
      for (const section of enhancedSections) {
        const keywords = this.getSectionKeywords(section.title, section.description);
        const score = this.calculateMatchScore(req, keywords, section);
        
        if (score > bestScore) {
          bestScore = score;
          bestSection = section;
        }
      }
      
      // Assign to best matching section (or first section if no good match)
      if (bestSection && bestScore > 1) {
        bestSection.requirements.push(req);
        bestSection.frameworks.add(req.framework);
        assignedRequirements.add(req.control_id);
        console.log(`✅ [PROCESSING] Assigned "${req.control_id}" to section "${bestSection.title}" (score: ${bestScore})`);
      } else if (enhancedSections.length > 0) {
        // Fallback: assign to most relevant section based on keywords
        const fallbackSection = this.findBestFallbackSection(req, enhancedSections);
        if (fallbackSection) {
          fallbackSection.requirements.push(req);
          fallbackSection.frameworks.add(req.framework);
          assignedRequirements.add(req.control_id);
          console.log(`🔄 [PROCESSING] Fallback assigned "${req.control_id}" to section "${fallbackSection.title}"`);
        }
      }
    }
    
    // Phase 2: Distribute unassigned requirements (AGGRESSIVE - ensure ALL get assigned)
    const unassigned = requirements.filter(r => !assignedRequirements.has(r.control_id));
    console.log(`[PROCESSING] Phase 2: ${unassigned.length} unassigned requirements to distribute`);
    
    if (unassigned.length > 0 && enhancedSections.length > 0) {
      // If we have unassigned requirements, distribute them across sections
      unassigned.forEach((req, index) => {
        const sectionIndex = index % enhancedSections.length; // Round-robin assignment
        const section = enhancedSections[sectionIndex];
        
        if (section) {
          section.requirements.push(req);
          section.frameworks.add(req.framework);
          assignedRequirements.add(req.control_id);
          
          console.log(`✅ [PROCESSING] Round-robin assigned "${req.control_id}" to section "${section.title}"`);
        }
      });
    }
    
    // Phase 3: Combine similar requirements into coherent text
    for (const section of enhancedSections) {
      section.combinedText = this.combineRequirements(section.requirements);
    }
    
    return enhancedSections;
  }

  /**
   * INJECT REAL DETAILS from user's selected frameworks using ENHANCED VALIDATION
   * Captures ALL technical details with comprehensive quality checks
   */
  combineRequirements(requirements: RequirementDetail[]): string {
    console.log(`🎯 [COMBINE] Starting enhanced combination for ${requirements.length} requirements`);
    
    if (requirements.length === 0) {
      console.log(`🎯 [COMBINE] No requirements - returning empty string`);
      return ''; // NO generic text - leave empty if no real requirements found
    }
    
    // Enhanced tracking for better deduplication and quality control
    const uniqueDetails = new Map<string, { content: string; framework: string; score: number }>();
    const processedKeywords = new Set<string>();
    const frameworkCoverage = new Map<string, number>();
    
    // Sort requirements by framework to ensure balanced coverage
    const sortedRequirements = this.sortRequirementsByFramework(requirements);
    
    sortedRequirements.forEach((req, index) => {
      console.log(`🔍 [COMBINE] Processing requirement ${index + 1}/${sortedRequirements.length}: ${req.control_id}`);
      
      // Get the BEST available source with prioritized selection
      const bestSource = this.selectBestContentSource(req);
      console.log(`📊 [COMBINE] Selected content source for ${req.control_id}:`, {
        source_type: this.getSourceType(req, bestSource),
        source_length: bestSource.length,
        framework: req.framework
      });
      
      if (bestSource.length < this.getMinContentLengthForFramework(req.framework)) {
        console.log(`⚠️ [COMBINE] Skipping ${req.control_id} - source too short for framework ${req.framework}`);
        return;
      }
      
      // Enhanced concept extraction with framework awareness
      const keyConcepts = this.extractFrameworkAwareKeyConcepts(bestSource, req.framework);
      console.log(`🏷️ [COMBINE] Framework-aware key concepts for ${req.control_id}:`, keyConcepts.slice(0, 3));
      
      // More intelligent duplicate detection with similarity scoring
      const similarityScore = this.calculateContentSimilarity(bestSource, Array.from(uniqueDetails.values()).map(d => d.content));
      
      if (similarityScore < this.getFrameworkSimilarityThreshold(req.framework)) {
        console.log(`✨ [COMBINE] Processing unique content for ${req.control_id} (similarity: ${similarityScore.toFixed(2)})`);
        
        // Extract framework-specific details with enhanced logic
        const extractedDetail = this.extractFrameworkSpecificDetails(bestSource, req);
        console.log(`🎯 [COMBINE] Extracted framework-specific detail for ${req.control_id}:`, {
          raw_length: extractedDetail?.length || 0,
          framework: req.framework,
          preview: extractedDetail?.substring(0, 150) + '...' || 'None'
        });
        
        if (extractedDetail && extractedDetail.trim().length > 15) {
          const cleanDetail = this.cleanText(extractedDetail);
          console.log(`🧹 [COMBINE] Clean detail for ${req.control_id}:`, {
            clean_length: cleanDetail.length,
            framework: req.framework,
            preview: cleanDetail.substring(0, 150) + '...'
          });
          
          // Store with enhanced metadata for better selection
          const bulletPoint = `• ${cleanDetail}`;
          uniqueDetails.set(req.control_id, {
            content: bulletPoint,
            framework: req.framework,
            score: 0.8 // Default quality score
          });
          
          // Update framework coverage tracking
          frameworkCoverage.set(req.framework, (frameworkCoverage.get(req.framework) || 0) + 1);
          
          console.log(`✅ [COMBINE] Added unique detail for ${req.control_id}: "${bulletPoint.substring(0, 120)}..."`);
          
          // Mark enhanced concepts as processed
          keyConcepts.forEach(c => processedKeywords.add(c));
        } else {
          console.log(`⚠️ [COMBINE] No valid extracted detail for ${req.control_id}`);
        }
      } else {
        console.log(`🔄 [COMBINE] Skipping similar content for ${req.control_id} (similarity: ${similarityScore.toFixed(2)})`);
      }
      
      // Dynamic limit based on framework diversity
      const maxDetails = this.calculateMaxDetailsForFrameworks(frameworkCoverage);
      if (uniqueDetails.size >= maxDetails) {
        console.log(`🚫 [COMBINE] Reached optimal limit of ${maxDetails} details - stopping`);
        return;
      }
    });
    
    // Sort final results by quality score and framework balance
    const sortedDetails = this.sortDetailsByQualityAndBalance(uniqueDetails, frameworkCoverage);
    const result = sortedDetails.join('\n');
    
    console.log(`✅ [COMBINE] Final enhanced result:`, {
      unique_details: uniqueDetails.size,
      total_chars: result.length,
      framework_coverage: Object.fromEntries(frameworkCoverage),
      avg_quality_score: Array.from(uniqueDetails.values()).reduce((sum, d) => sum + d.score, 0) / uniqueDetails.size
    });
    
    return result;
  }

  /**
   * Calculate match score between requirement and section
   */
  private calculateMatchScore(
    req: RequirementDetail,
    keywords: string[],
    section: UnifiedSection
  ): number {
    const reqText = `${req.title} ${req.description}`.toLowerCase();
    let score = 0;
    
    for (const keyword of keywords) {
      if (reqText.includes(keyword.toLowerCase())) {
        score += keyword.length > 8 ? 3 : 2;
      }
    }
    
    // Bonus for exact title matches
    if (req.title.toLowerCase().includes(section.title.toLowerCase())) {
      score += 5;
    }
    
    return score;
  }

  /**
   * Find best fallback section for requirement
   */
  private findBestFallbackSection(req: RequirementDetail, sections: UnifiedSection[]): UnifiedSection | null {
    // Smart fallback based on requirement content
    const reqText = `${req.title} ${req.description}`.toLowerCase();
    
    // Keywords for each typical sub-section
    const sectionPatterns: { [key: string]: string[] } = {
      'inventory': ['inventory', 'discover', 'catalog', 'asset', 'tracking', 'maintain'],
      'control': ['control', 'unauthorized', 'prevent', 'block', 'removal', 'detection'],
      'compliance': ['compliance', 'license', 'licensing', 'legal', 'agreement'],
      'discovery': ['automated', 'discovery', 'scanning', 'tools', 'continuous'],
      'enforcement': ['enforcement', 'allowlist', 'whitelist', 'approved', 'policy'],
      'libraries': ['library', 'libraries', 'third-party', 'components', 'dependencies'],
      'script': ['script', 'executable', 'powershell', 'macro', 'code execution']
    };
    
    let bestSection: UnifiedSection | null = null;
    let bestMatchCount = 0;
    
    for (const section of sections) {
      let matchCount = 0;
      const sectionTitle = section.title.toLowerCase();
      
      // Check each pattern group
      for (const [pattern, keywords] of Object.entries(sectionPatterns)) {
        if (sectionTitle.includes(pattern)) {
          // Count keyword matches
          for (const keyword of keywords) {
            if (reqText.includes(keyword)) {
              matchCount++;
            }
          }
        }
      }
      
      if (matchCount > bestMatchCount) {
        bestMatchCount = matchCount;
        bestSection = section;
      }
    }
    
    // If still no match, use the first section as ultimate fallback
    return bestSection || sections[0] || null;
  }

  /**
   * Get keywords for section matching
   */
  private getSectionKeywords(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const keywords: string[] = [];
    
    // Extract meaningful words (>3 chars, not common words)
    const commonWords = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'this', 'shall', 'must', 'should']);
    const words = text.split(/\s+/).filter(w => w.length > 3 && !commonWords.has(w));
    
    keywords.push(...words);
    
    // Add domain-specific keywords based on title
    const domainKeywords: { [key: string]: string[] } = {
      'leadership': ['management', 'commitment', 'responsibility', 'executive'],
      'scope': ['boundary', 'definition', 'coverage', 'isms'],
      'policy': ['procedure', 'documentation', 'framework', 'standard'],
      'personnel': ['employee', 'staff', 'human', 'screening', 'training'],
      'asset': ['inventory', 'disposal', 'equipment', 'resource'],
      'risk': ['assessment', 'analysis', 'treatment', 'evaluation'],
      'incident': ['response', 'emergency', 'escalation', 'breach'],
      'access': ['control', 'authorization', 'authentication', 'identity'],
      'third': ['party', 'supplier', 'vendor', 'contractor', 'outsourcing']
    };
    
    for (const [key, values] of Object.entries(domainKeywords)) {
      if (text.includes(key)) {
        keywords.push(...values);
      }
    }
    
    return Array.from(new Set(keywords));
  }

  /**
   * Sort requirements by framework to ensure balanced coverage
   */
  private sortRequirementsByFramework(requirements: RequirementDetail[]): RequirementDetail[] {
    // Group by framework first
    const frameworkGroups = new Map<string, RequirementDetail[]>();
    
    requirements.forEach(req => {
      const framework = req.framework;
      if (!frameworkGroups.has(framework)) {
        frameworkGroups.set(framework, []);
      }
      frameworkGroups.get(framework)!.push(req);
    });
    
    // Interleave requirements from different frameworks for balanced coverage
    const result: RequirementDetail[] = [];
    const frameworkArrays = Array.from(frameworkGroups.values());
    const maxLength = Math.max(...frameworkArrays.map(arr => arr.length));
    
    for (let i = 0; i < maxLength; i++) {
      for (const frameworkArray of frameworkArrays) {
        if (i < frameworkArray.length) {
          result.push(frameworkArray[i]);
        }
      }
    }
    
    return result;
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
   * Get source type for logging
   */
  private getSourceType(req: RequirementDetail, selectedSource: string): string {
    if (selectedSource === req.audit_ready_guidance) return 'audit_ready_guidance';
    if (selectedSource === req.official_description) return 'official_description';
    return 'description';
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
   * Extract framework-aware key concepts
   */
  private extractFrameworkAwareKeyConcepts(content: string, framework: string): string[] {
    const frameworkSpecificTerms = this.getFrameworkSpecificTerms(framework);
    const concepts: string[] = [];
    
    // Extract framework-specific terms
    for (const term of frameworkSpecificTerms) {
      if (content.toLowerCase().includes(term.toLowerCase())) {
        concepts.push(term);
      }
    }
    
    // Add general technical terms
    const technicalTerms = /\b(software|library|control|technical|authorized|unauthorized|dll|exe|ocx|scanning|inventory|verification|signing|automated)\b/gi;
    const matches = content.match(technicalTerms);
    if (matches) {
      concepts.push(...matches);
    }
    
    return Array.from(new Set(concepts));
  }

  /**
   * Get framework-specific terms
   */
  private getFrameworkSpecificTerms(framework: string): string[] {
    const frameworkTerms: Record<string, string[]> = {
      'ISO 27001': ['ISMS', 'management system', 'clause', 'annex', 'control'],
      'CIS Controls': ['implementation group', 'safeguard', 'asset', 'inventory'],
      'NIST': ['cybersecurity framework', 'identify', 'protect', 'detect', 'respond', 'recover'],
      'SOC 2': ['trust service criteria', 'control environment', 'monitoring'],
      'NIS2': ['essential services', 'digital service provider', 'incident reporting']
    };
    
    return frameworkTerms[framework] || [];
  }

  /**
   * Calculate content similarity between new content and existing content
   */
  private calculateContentSimilarity(newContent: string, existingContents: string[]): number {
    if (existingContents.length === 0) return 0;
    
    const newWords = new Set(newContent.toLowerCase().split(/\s+/).filter(w => w.length > 4));
    let maxSimilarity = 0;
    
    for (const existing of existingContents) {
      const existingWords = new Set(existing.toLowerCase().split(/\s+/).filter(w => w.length > 4));
      
      let matchCount = 0;
      newWords.forEach(word => {
        if (existingWords.has(word)) {
          matchCount++;
        }
      });
      
      const similarity = matchCount / Math.max(newWords.size, existingWords.size);
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }
    
    return maxSimilarity;
  }

  /**
   * Get framework similarity threshold
   */
  private getFrameworkSimilarityThreshold(framework: string): number {
    return SIMILARITY_THRESHOLDS[framework as keyof typeof SIMILARITY_THRESHOLDS] || SIMILARITY_THRESHOLDS.DEFAULT;
  }

  /**
   * Get minimum content length for framework
   */
  private getMinContentLengthForFramework(framework: string): number {
    return MIN_CONTENT_LENGTHS[framework as keyof typeof MIN_CONTENT_LENGTHS] || MIN_CONTENT_LENGTHS.DEFAULT;
  }

  /**
   * Extract framework-specific details
   */
  private extractFrameworkSpecificDetails(content: string, req: RequirementDetail): string {
    // Framework-specific extraction logic
    switch (req.framework) {
      case 'CIS Controls':
        return this.extractCISSpecificDetails(content, req);
      case 'ISO 27001':
        return this.extractISOSpecificDetails(content, req);
      default:
        return this.extractSpecificDetails(content, req);
    }
  }

  /**
   * Extract CIS-specific details
   */
  private extractCISSpecificDetails(content: string, req: RequirementDetail): string {
    // Look for CIS-specific patterns
    const cisPatterns = [
      /safeguard\s+[\d.]+[:\s].*?(?=\n|$)/gi,
      /implementation group\s+\d+.*?(?=\n|$)/gi,
      /asset.*?inventory.*?(?=\n|$)/gi
    ];
    
    for (const pattern of cisPatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return this.extractSpecificDetails(content, req);
  }

  /**
   * Extract ISO-specific details
   */
  private extractISOSpecificDetails(content: string, req: RequirementDetail): string {
    // Look for ISO-specific patterns
    const isoPatterns = [
      /clause\s+[\d.]+.*?(?=\n|$)/gi,
      /annex\s+[A-Z][\d.]*.*?(?=\n|$)/gi,
      /ISMS.*?(?=\n|$)/gi
    ];
    
    for (const pattern of isoPatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return this.extractSpecificDetails(content, req);
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
   * Calculate maximum details for frameworks
   */
  private calculateMaxDetailsForFrameworks(frameworkCoverage: Map<string, number>): number {
    const frameworkCount = frameworkCoverage.size;
    // Allow more details for multiple frameworks
    return Math.min(15, Math.max(5, frameworkCount * 4));
  }

  /**
   * Sort details by quality and framework balance
   */
  private sortDetailsByQualityAndBalance(
    uniqueDetails: Map<string, { content: string; framework: string; score: number }>,
    frameworkCoverage: Map<string, number>
  ): string[] {
    const details = Array.from(uniqueDetails.values());
    
    // Sort by quality score (descending) and then by framework balance
    details.sort((a, b) => {
      // Primary sort: quality score
      if (Math.abs(a.score - b.score) > 0.1) {
        return b.score - a.score;
      }
      
      // Secondary sort: framework diversity (favor less represented frameworks)
      const aCoverage = frameworkCoverage.get(a.framework) || 0;
      const bCoverage = frameworkCoverage.get(b.framework) || 0;
      return aCoverage - bCoverage;
    });
    
    return details.map(d => d.content);
  }
}