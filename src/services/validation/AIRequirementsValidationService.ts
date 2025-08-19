/**
 * AI Requirements Validation Service
 * 
 * Provides AI-driven analysis and validation of unified requirements
 * against standard-krav with framework-specific recommendations
 */

export interface StandardRequirement {
  id: string;
  framework: string; // ISO 27001, NIS2, GDPR, etc.
  category: string;
  control_id: string;
  title: string;
  description: string;
  implementation_guidance?: string;
}

export interface UnifiedRequirementAnalysis {
  requirement_id: string;
  letter: string; // a, b, c, etc.
  title: string;
  description: string;
  current_length: number; // word count
  optimal_length_range: [number, number]; // min, max words for 4-5 lines
  
  // Quality metrics
  length_compliance: 'too_short' | 'optimal' | 'too_long';
  clarity_score: number; // 0-1
  completeness_score: number; // 0-1
  framework_coverage_score: number; // 0-1
  
  // Framework analysis
  detected_frameworks: string[];
  mapped_standards: StandardRequirement[];
  missing_framework_coverage: string[];
  
  // AI suggestions
  suggestions: RequirementSuggestion[];
  confidence_score: number; // 0-1, AI confidence in analysis
}

export interface RequirementSuggestion {
  id: string;
  type: 'length_optimization' | 'framework_enhancement' | 'clarity_improvement' | 'completeness_addition';
  priority: 'low' | 'medium' | 'high' | 'critical';
  current_text: string;
  suggested_text: string;
  rationale: string;
  framework_specific?: string;
  estimated_word_change: number;
  confidence: number;
}

export interface CategoryValidationResult {
  category: string;
  total_requirements: number;
  analyzed_requirements: UnifiedRequirementAnalysis[];
  
  // Overall category metrics
  overall_quality_score: number;
  overall_framework_coverage: number;
  requirements_needing_attention: number;
  
  // Framework coverage analysis
  framework_gaps: {
    framework: string;
    missing_topics: string[];
    coverage_percentage: number;
  }[];
  
  // Recommendations
  category_suggestions: {
    add_new_requirements: boolean;
    merge_requirements: string[];
    split_requirements: string[];
    priority_fixes: RequirementSuggestion[];
  };
}

export class AIRequirementsValidationService {
  private static readonly OPTIMAL_WORD_RANGE = [15, 25]; // 4-5 lines ≈ 15-25 words per line
  private static readonly MAX_WORD_LIMIT = 100; // Hard limit for any requirement

  /**
   * 🤖 Analyze a single unified requirement against standards
   */
  static async analyzeRequirement(
    requirement: {
      letter: string;
      title: string;
      description: string;
      originalText: string;
    },
    mappedStandards: StandardRequirement[],
    categoryName: string
  ): Promise<UnifiedRequirementAnalysis> {
    console.log('🤖 DIAGNOSTIC: AI analyzing unified requirement', {
      letter: requirement.letter,
      title: requirement.title.substring(0, 50) + '...',
      categoryName,
      mappedStandardsCount: mappedStandards.length,
      timestamp: new Date().toISOString()
    });

    try {
      const combinedText = requirement.description ? 
        `${requirement.title} - ${requirement.description}` : 
        requirement.title;
      
      const wordCount = combinedText.split(/\s+/).length;
      
      // Analyze length compliance
      const lengthCompliance = this.assessLengthCompliance(wordCount);
      
      // Detect frameworks in text
      const detectedFrameworks = this.detectFrameworksInText(combinedText);
      
      // Calculate quality scores
      const clarityScore = this.calculateClarityScore(combinedText);
      const completenessScore = this.calculateCompletenessScore(combinedText, mappedStandards);
      const frameworkCoverageScore = this.calculateFrameworkCoverageScore(detectedFrameworks, mappedStandards);
      
      // Find missing framework coverage
      const missingFrameworkCoverage = this.identifyMissingFrameworkCoverage(detectedFrameworks, mappedStandards);
      
      // Generate AI suggestions
      const suggestions = await this.generateAISuggestions(requirement, mappedStandards, {
        lengthCompliance,
        clarityScore,
        completenessScore,
        frameworkCoverageScore,
        detectedFrameworks,
        missingFrameworkCoverage
      });
      
      const analysis: UnifiedRequirementAnalysis = {
        requirement_id: `${categoryName}-${requirement.letter}`,
        letter: requirement.letter,
        title: requirement.title,
        description: requirement.description,
        current_length: wordCount,
        optimal_length_range: [this.OPTIMAL_WORD_RANGE[0], this.OPTIMAL_WORD_RANGE[1]],
        length_compliance: lengthCompliance,
        clarity_score: clarityScore,
        completeness_score: completenessScore,
        framework_coverage_score: frameworkCoverageScore,
        detected_frameworks: detectedFrameworks,
        mapped_standards: mappedStandards,
        missing_framework_coverage: missingFrameworkCoverage,
        suggestions,
        confidence_score: this.calculateOverallConfidence(clarityScore, completenessScore, frameworkCoverageScore)
      };
      
      console.log('✅ DIAGNOSTIC: AI requirement analysis complete', {
        letter: requirement.letter,
        wordCount,
        lengthCompliance,
        detectedFrameworks,
        suggestionsCount: suggestions.length,
        confidenceScore: analysis.confidence_score,
        timestamp: new Date().toISOString()
      });
      
      return analysis;
    } catch (error) {
      console.error('❌ DIAGNOSTIC: AI requirement analysis failed:', error);
      throw error;
    }
  }

  /**
   * 📏 Assess if requirement length is compliant with 4-5 line rule
   */
  private static assessLengthCompliance(wordCount: number): 'too_short' | 'optimal' | 'too_long' {
    if (wordCount < this.OPTIMAL_WORD_RANGE[0]) return 'too_short';
    if (wordCount > this.OPTIMAL_WORD_RANGE[1] * 2) return 'too_long'; // More than 50 words = definitely too long
    if (wordCount <= this.OPTIMAL_WORD_RANGE[1]) return 'optimal';
    return 'too_long';
  }

  /**
   * 🔍 Detect frameworks mentioned in text
   */
  private static detectFrameworksInText(text: string): string[] {
    const frameworks = [];
    const textLower = text.toLowerCase();
    
    // Only include frameworks that actually exist in our database
    if (textLower.includes('iso 27001') || textLower.includes('iso27001') || textLower.includes('isms')) {
      frameworks.push('ISO 27001');
    }
    if (textLower.includes('iso 27002') || textLower.includes('iso27002')) {
      frameworks.push('ISO 27002');
    }
    if (textLower.includes('cis controls') || textLower.includes('critical security controls')) {
      frameworks.push('CIS Controls');
    }
    if (textLower.includes('nis2') || textLower.includes('nis 2') || textLower.includes('network and information security')) {
      frameworks.push('NIS2');
    }
    if (textLower.includes('gdpr') || textLower.includes('general data protection') || textLower.includes('personal data')) {
      frameworks.push('GDPR');
    }
    
    return frameworks;
  }

  /**
   * ✨ Calculate clarity score based on text readability
   */
  private static calculateClarityScore(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).length;
    const avgSentenceLength = sentences.length > 0 ? words / sentences.length : 0;
    
    let score = 0.5; // Base score
    
    // Good sentence length (10-20 words per sentence)
    if (avgSentenceLength >= 10 && avgSentenceLength <= 20) score += 0.2;
    else if (avgSentenceLength > 25) score -= 0.3; // Too complex
    
    // Check for clear action words
    const hasActionWords = /\b(must|shall|should|implement|establish|ensure|maintain|define|document)\b/i.test(text);
    if (hasActionWords) score += 0.2;
    
    // Avoid jargon overload
    const jargonCount = (text.match(/\b(utilize|facilitate|implement|establish|leverage)\b/gi) || []).length;
    if (jargonCount > words * 0.1) score -= 0.2; // More than 10% jargon
    
    return Math.max(0, Math.min(1, score));
  }

  /**
   * 📊 Calculate completeness score against mapped standards
   */
  private static calculateCompletenessScore(text: string, mappedStandards: StandardRequirement[]): number {
    if (mappedStandards.length === 0) return 0.5; // Default if no standards to compare
    
    let score = 0.3; // Base score
    
    // Check coverage of key topics from standards
    const keyTopics = mappedStandards.flatMap(std => 
      (std.description + ' ' + (std.implementation_guidance || '')).toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 4) // Only longer words
    );
    
    const uniqueTopics = [...new Set(keyTopics)];
    const textLower = text.toLowerCase();
    
    const topicsCovered = uniqueTopics.filter(topic => textLower.includes(topic)).length;
    const coverageRatio = uniqueTopics.length > 0 ? topicsCovered / uniqueTopics.length : 0;
    
    score += coverageRatio * 0.4; // Up to 40% bonus for topic coverage
    
    // Check for specific compliance elements
    const hasSpecificElements = /\b(policy|procedure|process|control|audit|review|assess|monitor|report)\b/i.test(text);
    if (hasSpecificElements) score += 0.2;
    
    // Check for measurable criteria
    const hasMeasurableCriteria = /\b(annual|quarterly|monthly|daily|minimum|maximum|\d+)\b/i.test(text);
    if (hasMeasurableCriteria) score += 0.1;
    
    return Math.max(0, Math.min(1, score));
  }

  /**
   * 🎯 Calculate framework coverage score
   */
  private static calculateFrameworkCoverageScore(detectedFrameworks: string[], mappedStandards: StandardRequirement[]): number {
    if (mappedStandards.length === 0) return 1; // Perfect score if no standards to cover
    
    const standardFrameworks = [...new Set(mappedStandards.map(std => std.framework))];
    const coverageRatio = standardFrameworks.length > 0 ? 
      detectedFrameworks.filter(fw => standardFrameworks.includes(fw)).length / standardFrameworks.length : 
      0;
    
    return Math.max(0, Math.min(1, coverageRatio));
  }

  /**
   * 🕳️ Identify missing framework coverage
   */
  private static identifyMissingFrameworkCoverage(detectedFrameworks: string[], mappedStandards: StandardRequirement[]): string[] {
    const standardFrameworks = [...new Set(mappedStandards.map(std => std.framework))];
    return standardFrameworks.filter(fw => !detectedFrameworks.includes(fw));
  }

  /**
   * 🧠 Generate AI suggestions for improvement
   */
  private static async generateAISuggestions(
    requirement: any,
    mappedStandards: StandardRequirement[],
    analysis: any
  ): Promise<RequirementSuggestion[]> {
    const suggestions: RequirementSuggestion[] = [];
    const combinedText = requirement.description ? 
      `${requirement.title} - ${requirement.description}` : 
      requirement.title;
    
    // Length optimization suggestions
    if (analysis.lengthCompliance === 'too_long') {
      suggestions.push({
        id: `length-opt-${requirement.letter}`,
        type: 'length_optimization',
        priority: 'high',
        current_text: combinedText,
        suggested_text: this.generateShorterVersion(combinedText),
        rationale: 'Requirement exceeds 4-5 line limit. Consider condensing while maintaining key compliance elements.',
        estimated_word_change: -Math.floor(combinedText.split(/\s+/).length * 0.3),
        confidence: 0.8
      });
    } else if (analysis.lengthCompliance === 'too_short') {
      suggestions.push({
        id: `length-exp-${requirement.letter}`,
        type: 'completeness_addition',
        priority: 'medium',
        current_text: combinedText,
        suggested_text: this.generateExpandedVersion(combinedText, mappedStandards),
        rationale: 'Requirement may be too brief. Consider adding implementation guidance or specific criteria.',
        estimated_word_change: Math.floor(this.OPTIMAL_WORD_RANGE[0] - combinedText.split(/\s+/).length),
        confidence: 0.7
      });
    }
    
    // Framework enhancement suggestions
    for (const missingFramework of analysis.missingFrameworkCoverage) {
      const frameworkStandards = mappedStandards.filter(std => std.framework === missingFramework);
      if (frameworkStandards.length > 0) {
        suggestions.push({
          id: `fw-enh-${requirement.letter}-${missingFramework.replace(/\s+/g, '-')}`,
          type: 'framework_enhancement',
          priority: 'high',
          current_text: combinedText,
          suggested_text: this.generateFrameworkEnhancedVersion(combinedText, missingFramework, frameworkStandards),
          rationale: `Add ${missingFramework}-specific language to ensure comprehensive compliance coverage.`,
          framework_specific: missingFramework,
          estimated_word_change: 5,
          confidence: 0.9
        });
      }
    }
    
    // Clarity improvement suggestions
    if (analysis.clarityScore < 0.6) {
      suggestions.push({
        id: `clarity-imp-${requirement.letter}`,
        type: 'clarity_improvement',
        priority: 'medium',
        current_text: combinedText,
        suggested_text: this.generateClearerVersion(combinedText),
        rationale: 'Improve clarity by using more direct language and specific action verbs.',
        estimated_word_change: 0,
        confidence: 0.7
      });
    }
    
    console.log(`🧠 DIAGNOSTIC: Generated ${suggestions.length} AI suggestions for requirement ${requirement.letter}`, {
      suggestions: suggestions.map(s => ({ type: s.type, priority: s.priority, confidence: s.confidence }))
    });
    
    return suggestions;
  }

  /**
   * 📝 Generate shorter version of text
   */
  private static generateShorterVersion(text: string): string {
    // Simple heuristic: remove redundant phrases, combine sentences
    return text
      .replace(/\b(in order to|for the purpose of|with the aim of)\b/gi, 'to')
      .replace(/\b(it is important to|it is necessary to|organizations should)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 📝 Generate expanded version of text
   */
  private static generateExpandedVersion(text: string, standards: StandardRequirement[]): string {
    const keyTerms = standards.length > 0 ? 
      standards[0].description.split(/\s+/).slice(0, 3).join(' ') : 
      'implementation guidelines';
    return `${text}. Include ${keyTerms} and regular review processes.`;
  }

  /**
   * 🎯 Generate framework-enhanced version
   */
  private static generateFrameworkEnhancedVersion(text: string, framework: string, standards: StandardRequirement[]): string {
    const frameworkTerms = {
      'ISO 27001': 'ISMS controls and management review',
      'ISO 27002': 'code of practice for information security controls',
      'NIS2': 'incident notification and cybersecurity measures',
      'GDPR': 'data protection and privacy by design',
      'CIS Controls': 'critical security controls and implementation groups'
    };
    
    const enhancement = frameworkTerms[framework as keyof typeof frameworkTerms] || 'compliance requirements';
    return `${text} (${framework}: ${enhancement})`;
  }

  /**
   * ✨ Generate clearer version of text
   */
  private static generateClearerVersion(text: string): string {
    return text
      .replace(/\butilize\b/gi, 'use')
      .replace(/\bfacilitate\b/gi, 'enable')
      .replace(/\bin conjunction with\b/gi, 'with')
      .replace(/\bsubsequent to\b/gi, 'after')
      .trim();
  }

  /**
   * 🎯 Calculate overall confidence score
   */
  private static calculateOverallConfidence(clarityScore: number, completenessScore: number, frameworkCoverageScore: number): number {
    return (clarityScore + completenessScore + frameworkCoverageScore) / 3;
  }

  /**
   * 📊 Analyze entire category of unified requirements
   */
  static async analyzeCategoryRequirements(
    categoryName: string,
    requirements: Array<{
      letter: string;
      title: string;
      description: string;
      originalText: string;
    }>,
    mappedStandards: StandardRequirement[]
  ): Promise<CategoryValidationResult> {
    console.log('📊 DIAGNOSTIC: Starting category validation analysis', {
      categoryName,
      requirementsCount: requirements.length,
      mappedStandardsCount: mappedStandards.length,
      timestamp: new Date().toISOString()
    });

    try {
      // Analyze each requirement
      const analyzedRequirements: UnifiedRequirementAnalysis[] = [];
      for (const req of requirements) {
        const analysis = await this.analyzeRequirement(req, mappedStandards, categoryName);
        analyzedRequirements.push(analysis);
      }

      // Calculate overall metrics
      const overallQualityScore = analyzedRequirements.length > 0 ? 
        analyzedRequirements.reduce((sum, req) => sum + req.confidence_score, 0) / analyzedRequirements.length : 
        0;

      const frameworkCoverageScores = analyzedRequirements.map(req => req.framework_coverage_score);
      const overallFrameworkCoverage = frameworkCoverageScores.length > 0 ? 
        frameworkCoverageScores.reduce((sum, score) => sum + score, 0) / frameworkCoverageScores.length : 
        0;

      const requirementsNeedingAttention = analyzedRequirements.filter(req => 
        req.confidence_score < 0.7 || req.suggestions.filter(s => s.priority === 'high' || s.priority === 'critical').length > 0
      ).length;

      // Identify framework gaps
      const allFrameworks = [...new Set(mappedStandards.map(std => std.framework))];
      const frameworkGaps = allFrameworks.map(framework => {
        const frameworkStandards = mappedStandards.filter(std => std.framework === framework);
        const requirementsWithFramework = analyzedRequirements.filter(req => 
          req.detected_frameworks.includes(framework)
        ).length;
        
        return {
          framework,
          missing_topics: [], // TODO: Implement detailed gap analysis
          coverage_percentage: requirements.length > 0 ? (requirementsWithFramework / requirements.length) * 100 : 0
        };
      });

      // Generate category-level suggestions
      const priorityFixes = analyzedRequirements
        .flatMap(req => req.suggestions)
        .filter(suggestion => suggestion.priority === 'critical' || suggestion.priority === 'high')
        .slice(0, 5); // Top 5 priority fixes

      const result: CategoryValidationResult = {
        category: categoryName,
        total_requirements: requirements.length,
        analyzed_requirements: analyzedRequirements,
        overall_quality_score: overallQualityScore,
        overall_framework_coverage: overallFrameworkCoverage,
        requirements_needing_attention: requirementsNeedingAttention,
        framework_gaps: frameworkGaps,
        category_suggestions: {
          add_new_requirements: frameworkGaps.some(gap => gap.coverage_percentage < 50),
          merge_requirements: [], // TODO: Identify requirements that could be merged
          split_requirements: analyzedRequirements
            .filter(req => req.current_length > this.MAX_WORD_LIMIT)
            .map(req => req.requirement_id),
          priority_fixes: priorityFixes
        }
      };

      console.log('✅ DIAGNOSTIC: Category validation analysis complete', {
        categoryName,
        overallQualityScore,
        overallFrameworkCoverage,
        requirementsNeedingAttention,
        priorityFixesCount: priorityFixes.length,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      console.error('❌ DIAGNOSTIC: Category validation analysis failed:', error);
      throw error;
    }
  }
}