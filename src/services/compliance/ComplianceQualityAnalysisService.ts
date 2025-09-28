import { 
  QualityIssue, 
  CategoryQualityReport, 
  ComprehensiveQualityReport, 
  UnifiedSection,
  QUALITY_THRESHOLDS,
  VALIDATION_PATTERNS
} from './types/ComplianceTypesDefinitions';
import { RequirementsDataService } from './RequirementsDataService';

/**
 * Compliance Quality Analysis Service
 * 
 * Provides comprehensive quality analysis and reporting capabilities
 * for compliance content. Identifies issues, generates recommendations,
 * and produces detailed quality reports across all categories.
 */
export class ComplianceQualityAnalysisService {
  
  constructor(private dataService: RequirementsDataService) {}

  /**
   * Generate comprehensive quality report for all categories
   */
  async generateComprehensiveQualityReport(): Promise<ComprehensiveQualityReport> {
    console.log('[QUALITY-ANALYSIS] 🔍 Starting comprehensive content quality analysis');
    
    try {
      // Get all categories from the database
      const categories = await this.dataService.getAllUnifiedCategories();
      console.log(`[QUALITY-ANALYSIS] 📋 Found ${categories.length} categories to analyze`);
      
      const categoryReports: CategoryQualityReport[] = [];
      let totalIssues = 0;
      const issuesByType: Record<string, number> = {};
      const issuesBySeverity: Record<string, number> = {};
      
      // Analyze each category
      for (const category of categories) {
        console.log(`[QUALITY-ANALYSIS] 🎯 Analyzing category: ${category}`);
        const categoryReport = await this.analyzeCategory(category);
        categoryReports.push(categoryReport);
        
        totalIssues += categoryReport.totalIssues;
        
        // Aggregate statistics
        categoryReport.issues.forEach(issue => {
          issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
          issuesBySeverity[issue.severity] = (issuesBySeverity[issue.severity] || 0) + 1;
        });
        
        categoryReport.subRequirements.forEach(subReq => {
          subReq.issues.forEach(issue => {
            issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
            issuesBySeverity[issue.severity] = (issuesBySeverity[issue.severity] || 0) + 1;
          });
        });
      }
      
      // Sort categories by score (worst first)
      categoryReports.sort((a, b) => a.overallScore - b.overallScore);
      
      const overallScore = categoryReports.reduce((sum, cat) => sum + cat.overallScore, 0) / categoryReports.length;
      const averageScoreByCategory = overallScore;
      
      // Generate prioritized action items
      const prioritizedActions = this.generatePrioritizedActions(categoryReports, issuesBySeverity);
      
      const report: ComprehensiveQualityReport = {
        overallScore: Math.round(overallScore * 100) / 100,
        totalCategories: categoryReports.length,
        totalIssues,
        categoriesByScore: categoryReports,
        prioritizedActions,
        statistics: {
          issuesByType,
          issuesBySeverity,
          averageScoreByCategory: Math.round(averageScoreByCategory * 100) / 100
        },
        generatedAt: new Date()
      };
      
      console.log('[QUALITY-ANALYSIS] ✅ Comprehensive analysis complete:', {
        overallScore: report.overallScore,
        totalCategories: report.totalCategories,
        totalIssues: report.totalIssues,
        criticalIssues: issuesBySeverity.critical || 0
      });
      
      return report;
    } catch (error) {
      console.error('[QUALITY-ANALYSIS] ❌ Analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze a specific category for quality issues
   */
  async analyzeCategory(categoryName: string): Promise<CategoryQualityReport> {
    console.log(`[QUALITY-ANALYSIS] 📊 Analyzing category: ${categoryName}`);
    
    // Get the database structure for this category
    const sections = await this.dataService.getDatabaseSections(categoryName);
    console.log(`[QUALITY-ANALYSIS] 📋 Found ${sections.length} sub-requirements for ${categoryName}`);
    
    const categoryIssues: QualityIssue[] = [];
    const subRequirementReports: CategoryQualityReport['subRequirements'] = [];
    let totalScore = 0;
    
    // Analyze each sub-requirement
    for (const section of sections) {
      const subReqIssues = this.analyzeSubRequirementContent(section, categoryName);
      const subReqScore = this.calculateSubRequirementScore(section, subReqIssues);
      
      subRequirementReports.push({
        id: section.id,
        title: section.title,
        score: subReqScore,
        issues: subReqIssues
      });
      
      totalScore += subReqScore;
    }
    
    // Check for category-level issues
    const categoryStructureIssues = this.analyzeCategoryStructure(sections, categoryName);
    categoryIssues.push(...categoryStructureIssues);
    
    const overallScore = sections.length > 0 ? totalScore / sections.length : 0;
    const totalIssues = categoryIssues.length + subRequirementReports.reduce((sum, sub) => sum + sub.issues.length, 0);
    
    const recommendations = this.generateCategoryRecommendations(categoryIssues, subRequirementReports);
    
    return {
      categoryName,
      overallScore: Math.round(overallScore * 100) / 100,
      totalIssues,
      issues: categoryIssues,
      subRequirements: subRequirementReports,
      recommendations
    };
  }

  /**
   * Analyze a single category (alias for analyzeCategory)
   */
  async analyzeSingleCategory(categoryName: string): Promise<CategoryQualityReport> {
    return await this.analyzeCategory(categoryName);
  }

  /**
   * Get quick quality scan summary
   */
  async getQualityScanSummary(): Promise<{
    totalCategories: number;
    categoriesWithIssues: number;
    estimatedTotalIssues: number;
    worstCategories: string[];
  }> {
    console.log('[QUALITY-ANALYSIS] 🔍 Running quick quality scan');
    
    const categories = await this.dataService.getAllUnifiedCategories();
    let categoriesWithIssues = 0;
    let estimatedTotalIssues = 0;
    const categoryScores: Array<{ name: string; score: number }> = [];
    
    for (const categoryName of categories.slice(0, 5)) { // Sample first 5 categories
      const sections = await this.dataService.getDatabaseSections(categoryName);
      let categoryIssues = 0;
      let categoryScore = 0;
      
      for (const section of sections) {
        const issues = this.analyzeSubRequirementContent(section, categoryName);
        if (issues.length > 0) {
          categoriesWithIssues++;
          break;
        }
        categoryIssues += issues.length;
        categoryScore += this.calculateSubRequirementScore(section, issues);
      }
      
      estimatedTotalIssues += categoryIssues;
      categoryScores.push({
        name: categoryName,
        score: sections.length > 0 ? categoryScore / sections.length : 0
      });
    }
    
    // Extrapolate to all categories
    const totalEstimatedIssues = Math.round(estimatedTotalIssues * (categories.length / 5));
    
    // Sort by score and get worst performing
    categoryScores.sort((a, b) => a.score - b.score);
    const worstCategories = categoryScores.slice(0, 3).map(c => c.name);
    
    return {
      totalCategories: categories.length,
      categoriesWithIssues,
      estimatedTotalIssues: totalEstimatedIssues,
      worstCategories
    };
  }

  /**
   * Analyze content quality issues in a sub-requirement
   */
  private analyzeSubRequirementContent(section: UnifiedSection, categoryName: string): QualityIssue[] {
    const issues: QualityIssue[] = [];
    const content = `${section.title} ${section.description}`.trim();
    
    if (!content) {
      issues.push({
        type: 'broken_content',
        severity: 'critical',
        description: 'Sub-requirement has no content',
        location: `Section ${section.id}`,
        suggestion: 'Add title and description content'
      });
      return issues;
    }
    
    // Check for incomplete sentences
    const incompleteSentences = this.detectIncompleteSentences(content);
    if (incompleteSentences.length > 0) {
      issues.push({
        type: 'incomplete_sentence',
        severity: 'high',
        description: `Found ${incompleteSentences.length} incomplete sentences`,
        location: `Section ${section.id}`,
        suggestion: 'Complete sentences ending with: ' + incompleteSentences.join(', ')
      });
    }
    
    // Check for markdown leakage
    const markdownIssues = this.detectMarkdownLeakage(content);
    if (markdownIssues.length > 0) {
      issues.push({
        type: 'markdown_leakage',
        severity: 'medium',
        description: 'Found markdown formatting in content',
        location: `Section ${section.id}`,
        suggestion: 'Remove markdown: ' + markdownIssues.join(', ')
      });
    }
    
    // Check for vague terminology
    const vagueTerms = this.detectVagueTerminology(content);
    if (vagueTerms.length > 0) {
      issues.push({
        type: 'vague_terminology',
        severity: 'medium',
        description: `Found vague terminology: ${vagueTerms.join(', ')}`,
        location: `Section ${section.id}`,
        suggestion: 'Replace vague terms with specific requirements'
      });
    }
    
    // Check for repetitive content within the same requirement
    const duplicateContent = this.detectDuplicateContent(content);
    if (duplicateContent.length > 0) {
      issues.push({
        type: 'duplicate_content',
        severity: 'low',
        description: `Found repetitive content: ${duplicateContent.join(', ')}`,
        location: `Section ${section.id}`,
        suggestion: 'Remove or consolidate repetitive content'
      });
    }
    
    // Check content length appropriateness
    const lengthIssues = this.checkContentLength(content);
    if (lengthIssues) {
      issues.push(lengthIssues);
    }
    
    return issues;
  }

  /**
   * Detect incomplete sentences that end with connecting words
   */
  private detectIncompleteSentences(content: string): string[] {
    const incompleteSentences: string[] = [];
    const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    
    const connectingWords = [
      'of', 'to', 'and', 'the', 'for', 'with', 'in', 'on', 'at', 'by', 'from',
      'or', 'but', 'as', 'if', 'when', 'while', 'because', 'since', 'that', 'which'
    ];
    
    sentences.forEach(sentence => {
      const words = sentence.toLowerCase().split(/\s+/);
      const lastWord = words[words.length - 1];
      
      if (connectingWords.includes(lastWord)) {
        incompleteSentences.push(`"...${sentence.substring(Math.max(0, sentence.length - 30))}"`);
      }
    });
    
    return incompleteSentences;
  }

  /**
   * Detect markdown formatting leakage
   */
  private detectMarkdownLeakage(content: string): string[] {
    const markdownIssues: string[] = [];
    
    // Check for markdown headers
    if (/#{1,6}\s/.test(content)) {
      markdownIssues.push('Markdown headers (#, ##, ###)');
    }
    
    // Check for specific problematic terms
    if (/auditreadyguidance/i.test(content)) {
      markdownIssues.push('"auditreadyguidance" reference');
    }
    
    if (/executive summary/i.test(content)) {
      markdownIssues.push('"Executive Summary" reference');
    }
    
    // Check for markdown lists
    if (/^\s*[-*+]\s/m.test(content)) {
      markdownIssues.push('Markdown list formatting');
    }
    
    // Check for markdown emphasis
    if (/\*\*.*\*\*|__.*__/.test(content)) {
      markdownIssues.push('Markdown bold formatting (**)'); 
    }
    
    return markdownIssues;
  }

  /**
   * Detect vague terminology without specifics
   */
  private detectVagueTerminology(content: string): string[] {
    const vagueTerms: string[] = [];
    
    const vaguePatterns = [
      { pattern: /\bappropriate\b(?!\s+(controls?|measures?|procedures?|standards?|documentation))/gi, term: 'appropriate (without context)' },
      { pattern: /\bessential entities\b(?!\s+(such as|including|like))/gi, term: 'essential entities (without examples)' },
      { pattern: /\brelevant\b(?!\s+(standards?|frameworks?|regulations?|requirements?))/gi, term: 'relevant (without context)' },
      { pattern: /\badequate\b(?!\s+(controls?|measures?|procedures?))/gi, term: 'adequate (without criteria)' },
      { pattern: /\bnecessary\b(?!\s+(steps?|actions?|measures?))/gi, term: 'necessary (without specifics)' },
      { pattern: /\bsufficient\b(?!\s+(evidence|controls?|measures?))/gi, term: 'sufficient (without criteria)' }
    ];
    
    vaguePatterns.forEach(({ pattern, term }) => {
      if (pattern.test(content)) {
        vagueTerms.push(term);
      }
    });
    
    return vagueTerms;
  }

  /**
   * Detect duplicate content within text
   */
  private detectDuplicateContent(content: string): string[] {
    const duplicates: string[] = [];
    const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
    
    for (let i = 0; i < sentences.length; i++) {
      for (let j = i + 1; j < sentences.length; j++) {
        const similarity = this.calculateSimilarity(sentences[i], sentences[j]);
        if (similarity > 0.8) {
          duplicates.push(`"${sentences[i].substring(0, 50)}..."`);
          break;
        }
      }
    }
    
    return duplicates;
  }

  /**
   * Check content length appropriateness
   */
  private checkContentLength(content: string): QualityIssue | null {
    if (content.length < 20) {
      return {
        type: 'broken_content',
        severity: 'high',
        description: `Content too short (${content.length} characters)`,
        suggestion: 'Expand content to provide meaningful guidance'
      };
    }
    
    if (content.length > 2000) {
      return {
        type: 'structure_inconsistency',
        severity: 'medium',
        description: `Content very long (${content.length} characters)`,
        suggestion: 'Consider breaking into smaller, focused sections'
      };
    }
    
    return null;
  }

  /**
   * Analyze category structure for issues
   */
  private analyzeCategoryStructure(sections: UnifiedSection[], categoryName: string): QualityIssue[] {
    const issues: QualityIssue[] = [];
    
    // Check if category has any sections
    if (sections.length === 0) {
      issues.push({
        type: 'structure_inconsistency',
        severity: 'critical',
        description: 'Category has no sub-requirements',
        location: categoryName,
        suggestion: 'Add sub-requirement sections for this category'
      });
      return issues;
    }
    
    // Check for consistent section numbering
    const expectedIds = Array.from({ length: sections.length }, (_, i) => String.fromCharCode(97 + i));
    const actualIds = sections.map(s => s.id).sort();
    
    if (JSON.stringify(expectedIds) !== JSON.stringify(actualIds)) {
      issues.push({
        type: 'structure_inconsistency',
        severity: 'medium',
        description: 'Inconsistent section numbering',
        location: categoryName,
        suggestion: `Expected sections ${expectedIds.join(', ')} but found ${actualIds.join(', ')}`
      });
    }
    
    // Check for very short or empty sections
    const shortSections = sections.filter(s => 
      `${s.title} ${s.description}`.trim().length < 50
    );
    
    if (shortSections.length > 0) {
      issues.push({
        type: 'broken_content',
        severity: 'high',
        description: `${shortSections.length} sections have insufficient content`,
        location: categoryName,
        suggestion: `Expand content for sections: ${shortSections.map(s => s.id).join(', ')}`
      });
    }
    
    return issues;
  }

  /**
   * Calculate sub-requirement score based on issues
   */
  private calculateSubRequirementScore(section: UnifiedSection, issues: QualityIssue[]): number {
    let score = 100;
    
    // Deduct points based on issue severity
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 30;
          break;
        case 'high':
          score -= 20;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });
    
    // Bonus for well-structured content
    const content = `${section.title} ${section.description}`.trim();
    if (content.length > 100 && content.length < 500) {
      score += 5; // Good length
    }
    
    // Bonus for technical specificity
    const technicalTerms = /\b(configure|implement|establish|maintain|monitor|control|policy|procedure|standard|framework)\b/gi;
    const technicalMatches = content.match(technicalTerms);
    if (technicalMatches && technicalMatches.length >= 2) {
      score += 5; // Technical depth
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate category-specific recommendations
   */
  private generateCategoryRecommendations(
    categoryIssues: QualityIssue[], 
    subRequirements: CategoryQualityReport['subRequirements']
  ): string[] {
    const recommendations: string[] = [];
    
    // Analyze issue patterns
    const severityCount = {
      critical: categoryIssues.filter(i => i.severity === 'critical').length,
      high: categoryIssues.filter(i => i.severity === 'high').length,
      medium: categoryIssues.filter(i => i.severity === 'medium').length,
      low: categoryIssues.filter(i => i.severity === 'low').length
    };
    
    if (severityCount.critical > 0) {
      recommendations.push(`Address ${severityCount.critical} critical issues immediately`);
    }
    
    if (severityCount.high > 2) {
      recommendations.push('Focus on high-severity content issues to improve quality');
    }
    
    // Analyze sub-requirement scores
    const lowScoringSections = subRequirements.filter(sub => sub.score < 60);
    if (lowScoringSections.length > 0) {
      recommendations.push(`Prioritize content improvement for sections: ${lowScoringSections.map(s => s.id).join(', ')}`);
    }
    
    // Content-specific recommendations
    const contentIssues = categoryIssues.filter(i => i.type === 'broken_content' || i.type === 'incomplete_sentence');
    if (contentIssues.length > 0) {
      recommendations.push('Review and complete incomplete content sections');
    }
    
    const vagueIssues = categoryIssues.filter(i => i.type === 'vague_terminology');
    if (vagueIssues.length > 2) {
      recommendations.push('Replace vague terminology with specific, actionable requirements');
    }
    
    return recommendations;
  }

  /**
   * Generate prioritized action items across all categories
   */
  private generatePrioritizedActions(
    categoryReports: CategoryQualityReport[], 
    issuesBySeverity: Record<string, number>
  ): ComprehensiveQualityReport['prioritizedActions'] {
    const actions: ComprehensiveQualityReport['prioritizedActions'] = [
      { priority: 'critical', actions: [] },
      { priority: 'high', actions: [] },
      { priority: 'medium', actions: [] },
      { priority: 'low', actions: [] }
    ];
    
    // Critical actions
    if (issuesBySeverity.critical > 0) {
      actions[0].actions.push(`Fix ${issuesBySeverity.critical} critical content issues immediately`);
    }
    
    const worstCategories = categoryReports.slice(0, 3);
    if (worstCategories.length > 0 && worstCategories[0].overallScore < 50) {
      actions[0].actions.push(`Priority review needed for: ${worstCategories.map(c => c.categoryName).join(', ')}`);
    }
    
    // High priority actions
    if (issuesBySeverity.high > 5) {
      actions[1].actions.push('Conduct comprehensive content review to address high-severity issues');
    }
    
    const structuralIssues = categoryReports.reduce((sum, cat) => 
      sum + cat.issues.filter(i => i.type === 'structure_inconsistency').length, 0
    );
    if (structuralIssues > 2) {
      actions[1].actions.push('Standardize content structure across all categories');
    }
    
    // Medium priority actions
    if (issuesBySeverity.medium > 10) {
      actions[2].actions.push('Schedule regular content quality reviews');
    }
    
    const avgScore = categoryReports.reduce((sum, cat) => sum + cat.overallScore, 0) / categoryReports.length;
    if (avgScore < 75) {
      actions[2].actions.push('Implement content quality standards and guidelines');
    }
    
    // Low priority actions
    if (issuesBySeverity.low > 0) {
      actions[3].actions.push('Address minor formatting and consistency issues');
    }
    
    return actions;
  }

  /**
   * Calculate similarity between two strings
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.toLowerCase().split(/\s+/));
    const words2 = new Set(str2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }
}