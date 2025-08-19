/**
 * 🔍 UnifiedRequirementsAnalysisService
 * 
 * Advanced service for analyzing unified requirements quality, coverage, and framework compliance.
 * This service provides the core intelligence for Platform Admin to ensure unified requirements
 * contain ALL necessary details from ALL frameworks to prevent customer complaints about missing details.
 */

export interface FrameworkMapping {
  framework: string;
  control_id: string;
  title: string;
  description: string;
  mapped_to_unified: boolean;
  coverage_quality: number; // 0-1 score
  missing_elements?: string[];
}

export interface RequirementAnalysis {
  category_id: string;
  category_name: string;
  unified_requirements: UnifiedRequirement[];
  framework_mappings: FrameworkMapping[];
  coverage_analysis: CoverageAnalysis;
  quality_analysis: QualityAnalysis;
  gap_analysis: GapAnalysis;
  recommendations: Recommendation[];
}

export interface UnifiedRequirement {
  id: string;
  content: string;
  word_count: number;
  structure_score: number; // How well structured the content is
  completeness_score: number; // How complete vs source frameworks
  clarity_score: number; // How clear and actionable
}

export interface CoverageAnalysis {
  total_framework_controls: number;
  mapped_controls: number;
  unmapped_controls: number;
  coverage_percentage: number;
  framework_breakdown: Record<string, {
    total: number;
    mapped: number;
    coverage: number;
  }>;
}

export interface QualityAnalysis {
  overall_quality_score: number; // 0-1
  content_depth_score: number;
  actionability_score: number;
  consistency_score: number;
  compliance_alignment_score: number;
  quality_issues: QualityIssue[];
}

export interface QualityIssue {
  type: 'missing_details' | 'unclear_language' | 'inconsistent_structure' | 'framework_misalignment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affected_requirements: string[];
  suggested_fix: string;
}

export interface GapAnalysis {
  critical_gaps: Gap[];
  medium_gaps: Gap[];
  low_gaps: Gap[];
  total_gap_count: number;
  gap_score: number; // 0-1 (1 = no gaps)
}

export interface Gap {
  id: string;
  type: 'missing_framework_requirement' | 'insufficient_detail' | 'outdated_content' | 'framework_conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affected_frameworks: string[];
  missing_content: string;
  impact_assessment: string;
  remediation_priority: number; // 1-5
}

export interface Recommendation {
  id: string;
  type: 'add_content' | 'enhance_existing' | 'restructure' | 'framework_alignment';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expected_impact: string;
  implementation_effort: 'low' | 'medium' | 'high';
  ai_generated_content?: string; // AI suggestion for improvement
}

/**
 * 🔬 Core Analysis Service
 * Provides comprehensive analysis of unified requirements against all framework sources
 */
export class UnifiedRequirementsAnalysisService {

  /**
   * 🎯 Main analysis entry point
   * Performs comprehensive analysis of a category's unified requirements
   */
  static async analyzeCategory(
    categoryMapping: any,
    options: {
      includeAIRecommendations?: boolean;
      deepAnalysis?: boolean;
      frameworkFocus?: string[]; // Focus on specific frameworks
    } = {}
  ): Promise<RequirementAnalysis> {
    console.log('🔬 Starting comprehensive requirements analysis...', {
      category: categoryMapping.category,
      includeAI: options.includeAIRecommendations,
      deepAnalysis: options.deepAnalysis
    });

    try {
      // Step 1: Extract and analyze unified requirements
      const unifiedRequirements = this.extractUnifiedRequirements(categoryMapping);
      
      // Step 2: Map all framework controls
      const frameworkMappings = this.extractFrameworkMappings(categoryMapping, options.frameworkFocus);
      
      // Step 3: Perform coverage analysis
      const coverageAnalysis = this.performCoverageAnalysis(unifiedRequirements, frameworkMappings);
      
      // Step 4: Analyze quality
      const qualityAnalysis = this.performQualityAnalysis(unifiedRequirements, frameworkMappings);
      
      // Step 5: Identify gaps
      const gapAnalysis = this.performGapAnalysis(unifiedRequirements, frameworkMappings);
      
      // Step 6: Generate recommendations
      const recommendations = options.includeAIRecommendations 
        ? await this.generateAIRecommendations(unifiedRequirements, frameworkMappings, gapAnalysis)
        : this.generateBasicRecommendations(gapAnalysis, qualityAnalysis);

      const analysis: RequirementAnalysis = {
        category_id: categoryMapping.id || 'unknown',
        category_name: categoryMapping.category || 'Unknown Category',
        unified_requirements: unifiedRequirements,
        framework_mappings: frameworkMappings,
        coverage_analysis: coverageAnalysis,
        quality_analysis: qualityAnalysis,
        gap_analysis: gapAnalysis,
        recommendations: recommendations
      };

      console.log('✅ Analysis completed:', {
        category: analysis.category_name,
        unifiedCount: unifiedRequirements.length,
        mappingsCount: frameworkMappings.length,
        coverage: `${Math.round(coverageAnalysis.coverage_percentage * 100)}%`,
        quality: `${Math.round(qualityAnalysis.overall_quality_score * 100)}%`,
        gaps: gapAnalysis.total_gap_count,
        recommendations: recommendations.length
      });

      return analysis;

    } catch (error) {
      console.error('❌ Analysis failed:', error);
      throw new Error(`Requirements analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 📋 Extract unified requirements with quality scoring
   */
  private static extractUnifiedRequirements(categoryMapping: any): UnifiedRequirement[] {
    const subRequirements = categoryMapping.auditReadyUnified?.subRequirements || [];
    
    return subRequirements.map((req: any, index: number) => {
      const content = req.content || req.text || req.requirement || '';
      const wordCount = content.split(/\s+/).length;
      
      return {
        id: `unified-${index}`,
        content: content,
        word_count: wordCount,
        structure_score: this.calculateStructureScore(content),
        completeness_score: this.calculateCompletenessScore(content),
        clarity_score: this.calculateClarityScore(content)
      };
    });
  }

  /**
   * 🗺️ Extract framework mappings with coverage assessment
   */
  private static extractFrameworkMappings(categoryMapping: any, frameworkFocus?: string[]): FrameworkMapping[] {
    const mappings: FrameworkMapping[] = [];
    
    // Extract ISO 27001 controls
    if (!frameworkFocus || frameworkFocus.includes('iso27001')) {
      const iso27001Controls = categoryMapping.iso27001Controls || [];
      iso27001Controls.forEach((control: any) => {
        mappings.push({
          framework: 'ISO 27001',
          control_id: control.control_id || control.id,
          title: control.title || control.name,
          description: control.description || control.objective || '',
          mapped_to_unified: this.isControlMappedToUnified(control, categoryMapping),
          coverage_quality: this.assessControlCoverage(control, categoryMapping)
        });
      });
    }

    // Extract NIST CSF categories
    if (!frameworkFocus || frameworkFocus.includes('nist')) {
      const nistCategories = categoryMapping.nistCsfCategories || [];
      nistCategories.forEach((category: any) => {
        mappings.push({
          framework: 'NIST CSF',
          control_id: category.category_id || category.id,
          title: category.title || category.name,
          description: category.description || category.definition || '',
          mapped_to_unified: this.isControlMappedToUnified(category, categoryMapping),
          coverage_quality: this.assessControlCoverage(category, categoryMapping)
        });
      });
    }

    // Extract CIS Controls
    if (!frameworkFocus || frameworkFocus.includes('cis')) {
      const cisControls = categoryMapping.cisControls || [];
      cisControls.forEach((control: any) => {
        mappings.push({
          framework: 'CIS Controls',
          control_id: control.control_id || control.id,
          title: control.title || control.name,
          description: control.description || control.rationale || '',
          mapped_to_unified: this.isControlMappedToUnified(control, categoryMapping),
          coverage_quality: this.assessControlCoverage(control, categoryMapping)
        });
      });
    }

    // Extract NIS2 articles
    if (!frameworkFocus || frameworkFocus.includes('nis2')) {
      const nis2Articles = categoryMapping.nis2Articles || [];
      nis2Articles.forEach((article: any) => {
        mappings.push({
          framework: 'NIS2',
          control_id: article.article_id || article.id,
          title: article.title || article.name,
          description: article.description || article.requirement || '',
          mapped_to_unified: this.isControlMappedToUnified(article, categoryMapping),
          coverage_quality: this.assessControlCoverage(article, categoryMapping)
        });
      });
    }

    // Extract GDPR articles
    if (!frameworkFocus || frameworkFocus.includes('gdpr')) {
      const gdprArticles = categoryMapping.gdprArticles || [];
      gdprArticles.forEach((article: any) => {
        mappings.push({
          framework: 'GDPR',
          control_id: article.article_id || article.id,
          title: article.title || article.name,
          description: article.description || article.text || '',
          mapped_to_unified: this.isControlMappedToUnified(article, categoryMapping),
          coverage_quality: this.assessControlCoverage(article, categoryMapping)
        });
      });
    }

    console.log(`📊 Extracted ${mappings.length} framework mappings from ${new Set(mappings.map(m => m.framework)).size} frameworks`);
    return mappings;
  }

  /**
   * 📈 Perform coverage analysis
   */
  private static performCoverageAnalysis(
    unifiedRequirements: UnifiedRequirement[],
    frameworkMappings: FrameworkMapping[]
  ): CoverageAnalysis {
    const totalControls = frameworkMappings.length;
    const mappedControls = frameworkMappings.filter(m => m.mapped_to_unified).length;
    const unmappedControls = totalControls - mappedControls;
    
    // Framework breakdown
    const frameworkBreakdown: Record<string, { total: number; mapped: number; coverage: number }> = {};
    
    frameworkMappings.forEach(mapping => {
      if (!frameworkBreakdown[mapping.framework]) {
        frameworkBreakdown[mapping.framework] = { total: 0, mapped: 0, coverage: 0 };
      }
      frameworkBreakdown[mapping.framework].total++;
      if (mapping.mapped_to_unified) {
        frameworkBreakdown[mapping.framework].mapped++;
      }
    });

    // Calculate coverage percentages
    Object.keys(frameworkBreakdown).forEach(framework => {
      const data = frameworkBreakdown[framework];
      data.coverage = data.total > 0 ? data.mapped / data.total : 0;
    });

    return {
      total_framework_controls: totalControls,
      mapped_controls: mappedControls,
      unmapped_controls: unmappedControls,
      coverage_percentage: totalControls > 0 ? mappedControls / totalControls : 0,
      framework_breakdown: frameworkBreakdown
    };
  }

  /**
   * 🎯 Perform quality analysis
   */
  private static performQualityAnalysis(
    unifiedRequirements: UnifiedRequirement[],
    frameworkMappings: FrameworkMapping[]
  ): QualityAnalysis {
    if (unifiedRequirements.length === 0) {
      return {
        overall_quality_score: 0,
        content_depth_score: 0,
        actionability_score: 0,
        consistency_score: 0,
        compliance_alignment_score: 0,
        quality_issues: []
      };
    }

    // Calculate average scores
    const avgStructure = unifiedRequirements.reduce((sum, req) => sum + req.structure_score, 0) / unifiedRequirements.length;
    const avgCompleteness = unifiedRequirements.reduce((sum, req) => sum + req.completeness_score, 0) / unifiedRequirements.length;
    const avgClarity = unifiedRequirements.reduce((sum, req) => sum + req.clarity_score, 0) / unifiedRequirements.length;
    
    // Calculate compliance alignment
    const mappedControls = frameworkMappings.filter(m => m.mapped_to_unified);
    const avgCoverageQuality = mappedControls.length > 0 
      ? mappedControls.reduce((sum, m) => sum + m.coverage_quality, 0) / mappedControls.length 
      : 0;

    // Identify quality issues
    const qualityIssues = this.identifyQualityIssues(unifiedRequirements, frameworkMappings);

    const overallScore = (avgStructure + avgCompleteness + avgClarity + avgCoverageQuality) / 4;

    return {
      overall_quality_score: overallScore,
      content_depth_score: avgCompleteness,
      actionability_score: avgClarity,
      consistency_score: avgStructure,
      compliance_alignment_score: avgCoverageQuality,
      quality_issues: qualityIssues
    };
  }

  /**
   * 🕳️ Perform gap analysis
   */
  private static performGapAnalysis(
    unifiedRequirements: UnifiedRequirement[],
    frameworkMappings: FrameworkMapping[]
  ): GapAnalysis {
    const gaps: Gap[] = [];

    // Identify unmapped framework controls
    const unmappedControls = frameworkMappings.filter(m => !m.mapped_to_unified);
    unmappedControls.forEach((control, index) => {
      gaps.push({
        id: `gap-unmapped-${index}`,
        type: 'missing_framework_requirement',
        severity: this.assessGapSeverity(control),
        title: `Missing coverage for ${control.framework} ${control.control_id}`,
        description: `Framework control "${control.title}" is not adequately covered in unified requirements`,
        affected_frameworks: [control.framework],
        missing_content: control.description,
        impact_assessment: this.assessGapImpact(control),
        remediation_priority: this.calculateRemediationPriority(control)
      });
    });

    // Identify insufficient detail gaps
    const lowQualityMappings = frameworkMappings.filter(m => m.mapped_to_unified && m.coverage_quality < 0.6);
    lowQualityMappings.forEach((mapping, index) => {
      gaps.push({
        id: `gap-quality-${index}`,
        type: 'insufficient_detail',
        severity: 'medium',
        title: `Insufficient detail for ${mapping.framework} ${mapping.control_id}`,
        description: `Current unified requirements do not provide sufficient detail to meet ${mapping.framework} requirements`,
        affected_frameworks: [mapping.framework],
        missing_content: 'Enhanced detail and specific implementation guidance needed',
        impact_assessment: 'May lead to compliance gaps and customer dissatisfaction',
        remediation_priority: 3
      });
    });

    // Categorize gaps by severity
    const criticalGaps = gaps.filter(g => g.severity === 'critical');
    const highGaps = gaps.filter(g => g.severity === 'high');
    const mediumGaps = gaps.filter(g => g.severity === 'medium');
    const lowGaps = gaps.filter(g => g.severity === 'low');

    // Calculate gap score (1 = perfect, 0 = many critical gaps)
    const totalPossibleGaps = frameworkMappings.length;
    const gapScore = totalPossibleGaps > 0 
      ? Math.max(0, 1 - (gaps.length / totalPossibleGaps))
      : 1;

    return {
      critical_gaps: criticalGaps,
      medium_gaps: [...highGaps, ...mediumGaps],
      low_gaps: lowGaps,
      total_gap_count: gaps.length,
      gap_score: gapScore
    };
  }

  /**
   * 💡 Generate basic recommendations (non-AI)
   */
  private static generateBasicRecommendations(
    gapAnalysis: GapAnalysis,
    qualityAnalysis: QualityAnalysis
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    let recId = 0;

    // Address critical gaps first
    gapAnalysis.critical_gaps.forEach(gap => {
      recommendations.push({
        id: `rec-${recId++}`,
        type: 'add_content',
        priority: 'critical',
        title: `Address critical gap: ${gap.title}`,
        description: `Add comprehensive content to cover ${gap.affected_frameworks.join(', ')} requirements`,
        expected_impact: 'Eliminates critical compliance gap and prevents customer complaints',
        implementation_effort: 'medium'
      });
    });

    // Address quality issues
    if (qualityAnalysis.overall_quality_score < 0.7) {
      recommendations.push({
        id: `rec-${recId++}`,
        type: 'enhance_existing',
        priority: 'high',
        title: 'Improve overall content quality',
        description: 'Review and enhance existing requirements for better clarity, completeness, and actionability',
        expected_impact: 'Improves customer satisfaction and reduces support requests',
        implementation_effort: 'high'
      });
    }

    // Address coverage issues
    if (qualityAnalysis.compliance_alignment_score < 0.8) {
      recommendations.push({
        id: `rec-${recId++}`,
        type: 'framework_alignment',
        priority: 'high',
        title: 'Enhance framework alignment',
        description: 'Better align unified requirements with specific framework control objectives',
        expected_impact: 'Ensures comprehensive compliance coverage',
        implementation_effort: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * 🤖 Generate AI-powered recommendations (placeholder for future implementation)
   */
  private static async generateAIRecommendations(
    unifiedRequirements: UnifiedRequirement[],
    frameworkMappings: FrameworkMapping[],
    gapAnalysis: GapAnalysis
  ): Promise<Recommendation[]> {
    // This would integrate with AI service to generate specific content recommendations
    // For now, return enhanced basic recommendations
    const basicRecs = this.generateBasicRecommendations(gapAnalysis, {
      overall_quality_score: 0.7,
      content_depth_score: 0.7,
      actionability_score: 0.7,
      consistency_score: 0.7,
      compliance_alignment_score: 0.7,
      quality_issues: []
    });

    // Add AI-generated content suggestions
    basicRecs.forEach(rec => {
      if (rec.type === 'add_content') {
        rec.ai_generated_content = `AI-generated suggestion: Consider adding specific implementation steps, measurable criteria, and examples for ${rec.title}`;
      }
    });

    return basicRecs;
  }

  // Helper methods for scoring and assessment
  
  private static calculateStructureScore(content: string): number {
    const hasMultipleLines = content.includes('\n');
    const hasListItems = /[•\-\*]|\d+\./.test(content);
    const hasHeaders = /^[A-Z][^.!?]*:/.test(content);
    const wordCount = content.split(/\s+/).length;
    
    let score = 0.3; // Base score
    if (wordCount > 20) score += 0.2;
    if (hasMultipleLines) score += 0.2;
    if (hasListItems) score += 0.15;
    if (hasHeaders) score += 0.15;
    
    return Math.min(1, score);
  }

  private static calculateCompletenessScore(content: string): number {
    const wordCount = content.split(/\s+/).length;
    const hasActionVerbs = /\b(implement|establish|ensure|maintain|monitor|review|document|define)\b/i.test(content);
    const hasSpecificTerms = /\b(policy|procedure|process|control|measure|requirement)\b/i.test(content);
    const hasQuantifiableElements = /\b(annual|regular|continuous|minimum|maximum|\d+)\b/i.test(content);
    
    let score = 0.2; // Base score
    if (wordCount > 30) score += 0.3;
    if (wordCount > 60) score += 0.2;
    if (hasActionVerbs) score += 0.15;
    if (hasSpecificTerms) score += 0.1;
    if (hasQuantifiableElements) score += 0.05;
    
    return Math.min(1, score);
  }

  private static calculateClarityScore(content: string): number {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.length > 0 
      ? content.split(/\s+/).length / sentences.length 
      : 0;
    
    const hasJargon = /\b(utilize|facilitate|implement|establish)\b/gi.test(content);
    const hasClearActions = /\b(must|shall|should|will|ensure|verify|check)\b/i.test(content);
    
    let score = 0.5; // Base score
    if (avgSentenceLength > 15 && avgSentenceLength < 25) score += 0.2; // Good sentence length
    if (avgSentenceLength > 25) score -= 0.2; // Too long
    if (!hasJargon) score += 0.15; // Less jargon is better
    if (hasClearActions) score += 0.15; // Clear actions are good
    
    return Math.min(1, Math.max(0, score));
  }

  private static isControlMappedToUnified(control: any, categoryMapping: any): boolean {
    const unifiedRequirements = categoryMapping.auditReadyUnified?.subRequirements || [];
    const controlTerms = (control.title || control.name || '').toLowerCase().split(/\s+/);
    
    // Simple keyword matching - in real implementation, this would be more sophisticated
    return unifiedRequirements.some((req: any) => {
      const reqContent = (req.content || req.text || req.requirement || '').toLowerCase();
      return controlTerms.some(term => term.length > 3 && reqContent.includes(term));
    });
  }

  private static assessControlCoverage(control: any, categoryMapping: any): number {
    if (!this.isControlMappedToUnified(control, categoryMapping)) return 0;
    
    // Simple coverage assessment - would be enhanced with AI in production
    const controlLength = (control.description || control.objective || '').split(/\s+/).length;
    const unifiedContent = (categoryMapping.auditReadyUnified?.subRequirements || [])
      .map((req: any) => req.content || req.text || req.requirement || '')
      .join(' ');
    
    const coverageRatio = unifiedContent.length / Math.max(controlLength * 10, 100);
    return Math.min(1, coverageRatio);
  }

  private static assessGapSeverity(control: FrameworkMapping): 'low' | 'medium' | 'high' | 'critical' {
    // Framework priority weighting
    const frameworkPriority = {
      'ISO 27001': 'high',
      'NIS2': 'critical',
      'NIST CSF': 'high',
      'CIS Controls': 'medium',
      'GDPR': 'critical'
    };
    
    return frameworkPriority[control.framework as keyof typeof frameworkPriority] || 'medium';
  }

  private static assessGapImpact(control: FrameworkMapping): string {
    return `Missing ${control.framework} control ${control.control_id} may lead to compliance violations and customer concerns about incomplete coverage`;
  }

  private static calculateRemediationPriority(control: FrameworkMapping): number {
    const severityMap = { critical: 5, high: 4, medium: 3, low: 2 };
    const severity = this.assessGapSeverity(control);
    return severityMap[severity] || 3;
  }

  private static identifyQualityIssues(
    unifiedRequirements: UnifiedRequirement[],
    frameworkMappings: FrameworkMapping[]
  ): QualityIssue[] {
    const issues: QualityIssue[] = [];

    // Check for low-quality content
    const lowQualityReqs = unifiedRequirements.filter(req => 
      req.structure_score < 0.5 || req.completeness_score < 0.5 || req.clarity_score < 0.5
    );

    if (lowQualityReqs.length > 0) {
      issues.push({
        type: 'unclear_language',
        severity: lowQualityReqs.length > unifiedRequirements.length * 0.5 ? 'high' : 'medium',
        description: `${lowQualityReqs.length} requirements have poor structure, completeness, or clarity`,
        affected_requirements: lowQualityReqs.map(req => req.id),
        suggested_fix: 'Review and rewrite affected requirements with clearer language, better structure, and more complete details'
      });
    }

    // Check for missing framework alignment
    const unmappedFrameworks = frameworkMappings.filter(m => !m.mapped_to_unified);
    if (unmappedFrameworks.length > 0) {
      issues.push({
        type: 'framework_misalignment',
        severity: unmappedFrameworks.length > frameworkMappings.length * 0.3 ? 'critical' : 'high',
        description: `${unmappedFrameworks.length} framework controls are not adequately covered`,
        affected_requirements: [],
        suggested_fix: 'Add unified requirements to cover missing framework controls or enhance existing requirements'
      });
    }

    return issues;
  }

  /**
   * 📊 Quick category assessment for dashboard overview
   */
  static async quickAssessCategory(categoryMapping: any): Promise<{
    coverage_score: number;
    quality_score: number;
    gap_count: number;
    needs_attention: boolean;
  }> {
    try {
      const unifiedRequirements = this.extractUnifiedRequirements(categoryMapping);
      const frameworkMappings = this.extractFrameworkMappings(categoryMapping);
      const coverageAnalysis = this.performCoverageAnalysis(unifiedRequirements, frameworkMappings);
      const qualityAnalysis = this.performQualityAnalysis(unifiedRequirements, frameworkMappings);
      const gapAnalysis = this.performGapAnalysis(unifiedRequirements, frameworkMappings);

      return {
        coverage_score: coverageAnalysis.coverage_percentage,
        quality_score: qualityAnalysis.overall_quality_score,
        gap_count: gapAnalysis.total_gap_count,
        needs_attention: coverageAnalysis.coverage_percentage < 0.8 || 
                        qualityAnalysis.overall_quality_score < 0.7 || 
                        gapAnalysis.critical_gaps.length > 0
      };
    } catch (error) {
      console.error('Quick assessment failed:', error);
      return {
        coverage_score: 0,
        quality_score: 0,
        gap_count: 999,
        needs_attention: true
      };
    }
  }
}