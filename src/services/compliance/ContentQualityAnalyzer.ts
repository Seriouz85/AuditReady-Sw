import { EnhancedUnifiedRequirementsGenerator } from './EnhancedUnifiedRequirementsGenerator';
import type { ComprehensiveQualityReport, CategoryQualityReport } from './EnhancedUnifiedRequirementsGenerator';

/**
 * Content Quality Analyzer Service
 * 
 * Provides high-level API for content quality analysis and reporting
 * Used by admin console and quality management interfaces
 */
export class ContentQualityAnalyzer {
  private generator: EnhancedUnifiedRequirementsGenerator;

  constructor() {
    this.generator = new EnhancedUnifiedRequirementsGenerator();
  }

  /**
   * Run comprehensive quality analysis on all unified requirements
   */
  async runComprehensiveAnalysis(): Promise<ComprehensiveQualityReport> {
    console.log('[QUALITY-SERVICE] 🚀 Starting comprehensive quality analysis...');
    
    try {
      const startTime = Date.now();
      const report = await this.generator.generateComprehensiveQualityReport();
      const duration = Date.now() - startTime;
      
      console.log(`[QUALITY-SERVICE] ✅ Analysis completed in ${duration}ms`);
      console.log(`[QUALITY-SERVICE] 📊 Results: ${report.totalIssues} issues across ${report.totalCategories} categories`);
      
      return report;
    } catch (error) {
      console.error('[QUALITY-SERVICE] ❌ Analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze a specific category
   */
  async analyzeSingleCategory(categoryName: string): Promise<CategoryQualityReport> {
    console.log(`[QUALITY-SERVICE] 🎯 Analyzing category: ${categoryName}`);
    
    try {
      const report = await this.generator.analyzeSingleCategory(categoryName);
      console.log(`[QUALITY-SERVICE] ✅ Category analysis complete: ${report.totalIssues} issues found`);
      
      return report;
    } catch (error) {
      console.error(`[QUALITY-SERVICE] ❌ Category analysis failed for ${categoryName}:`, error);
      throw error;
    }
  }

  /**
   * Get quick quality scan overview
   */
  async getQualityOverview(): Promise<{
    totalCategories: number;
    categoriesWithIssues: number;
    estimatedTotalIssues: number;
    worstCategories: string[];
  }> {
    console.log('[QUALITY-SERVICE] ⚡ Running quick quality overview...');
    
    try {
      const overview = await this.generator.getQualityScanSummary();
      console.log('[QUALITY-SERVICE] ✅ Overview complete:', overview);
      
      return overview;
    } catch (error) {
      console.error('[QUALITY-SERVICE] ❌ Overview failed:', error);
      throw error;
    }
  }

  /**
   * Export quality report as downloadable text file
   */
  async exportQualityReport(): Promise<{ content: string; filename: string }> {
    console.log('[QUALITY-SERVICE] 📄 Generating quality report export...');
    
    try {
      const report = await this.runComprehensiveAnalysis();
      const content = this.generator.exportQualityReportAsText(report);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `unified-requirements-quality-report-${timestamp}.txt`;
      
      console.log(`[QUALITY-SERVICE] ✅ Report exported: ${content.length} characters`);
      
      return { content, filename };
    } catch (error) {
      console.error('[QUALITY-SERVICE] ❌ Export failed:', error);
      throw error;
    }
  }

  /**
   * Get quality metrics for dashboard display
   */
  async getQualityMetrics(): Promise<{
    overallScore: number;
    totalIssues: number;
    criticalIssues: number;
    highPriorityIssues: number;
    categoriesNeedingAttention: string[];
    lastAnalyzed: Date;
  }> {
    console.log('[QUALITY-SERVICE] 📈 Calculating quality metrics...');
    
    try {
      const report = await this.runComprehensiveAnalysis();
      
      const criticalIssues = report.statistics.issuesBySeverity.critical || 0;
      const highPriorityIssues = report.statistics.issuesBySeverity.high || 0;
      
      const categoriesNeedingAttention = report.categoriesByScore
        .filter(cat => cat.overallScore < 70)
        .slice(0, 5)
        .map(cat => cat.categoryName);
      
      return {
        overallScore: report.overallScore,
        totalIssues: report.totalIssues,
        criticalIssues,
        highPriorityIssues,
        categoriesNeedingAttention,
        lastAnalyzed: report.generatedAt
      };
    } catch (error) {
      console.error('[QUALITY-SERVICE] ❌ Metrics calculation failed:', error);
      throw error;
    }
  }

  /**
   * Get issue breakdown by type for chart display
   */
  async getIssueBreakdown(): Promise<{
    byType: Array<{ type: string; count: number; description: string }>;
    bySeverity: Array<{ severity: string; count: number; color: string }>;
  }> {
    console.log('[QUALITY-SERVICE] 📊 Getting issue breakdown...');
    
    try {
      const report = await this.runComprehensiveAnalysis();
      
      const typeDescriptions: Record<string, string> = {
        'incomplete_sentence': 'Sentences ending with connecting words',
        'markdown_leakage': 'Markdown formatting in content',
        'duplicate_content': 'Repetitive content within requirements',
        'vague_terminology': 'Vague terms without specific context',
        'broken_content': 'Missing or severely incomplete content',
        'structure_inconsistency': 'Inconsistent formatting or structure'
      };
      
      const severityColors: Record<string, string> = {
        'critical': '#ef4444', // Red
        'high': '#f97316',     // Orange
        'medium': '#eab308',   // Yellow
        'low': '#22c55e'       // Green
      };
      
      const byType = Object.entries(report.statistics.issuesByType).map(([type, count]) => ({
        type: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count,
        description: typeDescriptions[type] || 'Other quality issue'
      }));
      
      const bySeverity = Object.entries(report.statistics.issuesBySeverity).map(([severity, count]) => ({
        severity: severity.charAt(0).toUpperCase() + severity.slice(1),
        count,
        color: severityColors[severity] || '#6b7280'
      }));
      
      return { byType, bySeverity };
    } catch (error) {
      console.error('[QUALITY-SERVICE] ❌ Issue breakdown failed:', error);
      throw error;
    }
  }

  /**
   * Get prioritized action plan for improvement
   */
  async getActionPlan(): Promise<{
    immediateActions: string[];
    shortTermActions: string[];
    longTermActions: string[];
    estimatedEffort: {
      critical: number; // hours
      high: number;
      medium: number;
      low: number;
    };
  }> {
    console.log('[QUALITY-SERVICE] 📋 Generating action plan...');
    
    try {
      const report = await this.runComprehensiveAnalysis();
      
      const immediateActions: string[] = [];
      const shortTermActions: string[] = [];
      const longTermActions: string[] = [];
      
      report.prioritizedActions.forEach(({ priority, actions }) => {
        switch (priority) {
          case 'critical':
            immediateActions.push(...actions);
            break;
          case 'high':
            shortTermActions.push(...actions);
            break;
          case 'medium':
          case 'low':
            longTermActions.push(...actions);
            break;
        }
      });
      
      // Estimate effort based on issue counts
      const criticalCount = report.statistics.issuesBySeverity.critical || 0;
      const highCount = report.statistics.issuesBySeverity.high || 0;
      const mediumCount = report.statistics.issuesBySeverity.medium || 0;
      const lowCount = report.statistics.issuesBySeverity.low || 0;
      
      const estimatedEffort = {
        critical: criticalCount * 0.5, // 30 minutes per critical issue
        high: highCount * 0.25,        // 15 minutes per high issue
        medium: mediumCount * 0.1,     // 6 minutes per medium issue
        low: lowCount * 0.05           // 3 minutes per low issue
      };
      
      return {
        immediateActions,
        shortTermActions,
        longTermActions,
        estimatedEffort
      };
    } catch (error) {
      console.error('[QUALITY-SERVICE] ❌ Action plan generation failed:', error);
      throw error;
    }
  }

  /**
   * Validate specific content for quality issues (useful for real-time validation)
   */
  validateContent(content: string, categoryName?: string): {
    score: number;
    issues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      suggestion?: string;
    }>;
  } {
    const issues: any[] = [];
    let score = 100;
    
    // Quick content validation (subset of full analysis)
    if (!content || content.trim().length < 5) {
      issues.push({
        type: 'broken_content',
        severity: 'critical',
        description: 'Content is empty or too short',
        suggestion: 'Add meaningful content (minimum 5 words)'
      });
      score -= 50;
    }
    
    // Check for incomplete sentences
    const connectingWords = ['of', 'to', 'and', 'the', 'for', 'with'];
    const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    
    sentences.forEach(sentence => {
      const words = sentence.toLowerCase().split(/\s+/);
      const lastWord = words[words.length - 1];
      
      if (connectingWords.includes(lastWord)) {
        issues.push({
          type: 'incomplete_sentence',
          severity: 'high',
          description: `Sentence ends with connecting word: "${lastWord}"`,
          suggestion: 'Complete the sentence with proper ending'
        });
        score -= 15;
      }
    });
    
    // Check for markdown
    if (/#{1,6}\s|auditreadyguidance|executive summary|\*\*.*\*\*/i.test(content)) {
      issues.push({
        type: 'markdown_leakage',
        severity: 'medium',
        description: 'Content contains markdown formatting or references',
        suggestion: 'Remove markdown formatting and clean up references'
      });
      score -= 10;
    }
    
    // Check for vague terms
    const vaguePatterns = [
      /\bappropriate\b(?!\s+(controls?|measures?))/gi,
      /\bessential entities\b(?!\s+such as)/gi
    ];
    
    vaguePatterns.forEach(pattern => {
      if (pattern.test(content)) {
        issues.push({
          type: 'vague_terminology',
          severity: 'medium',
          description: 'Content contains vague terminology',
          suggestion: 'Replace vague terms with specific requirements'
        });
        score -= 5;
      }
    });
    
    return {
      score: Math.max(0, Math.min(100, score)),
      issues
    };
  }
}

// Export singleton instance
export const contentQualityAnalyzer = new ContentQualityAnalyzer();