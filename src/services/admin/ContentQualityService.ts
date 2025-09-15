import { contentQualityAnalyzer } from '../compliance/ContentQualityAnalyzer';
import type { ComprehensiveQualityReport, CategoryQualityReport } from '../compliance/EnhancedUnifiedRequirementsGenerator';

/**
 * Admin service for content quality management
 * 
 * Provides admin-level functions for content quality analysis and reporting
 * Used by platform administrators to maintain content standards
 */
export class ContentQualityService {
  
  /**
   * Run comprehensive quality analysis (admin only)
   */
  static async runComprehensiveAnalysis(): Promise<ComprehensiveQualityReport> {
    console.log('[ADMIN-QUALITY] 🔐 Admin: Running comprehensive quality analysis');
    
    try {
      const report = await contentQualityAnalyzer.runComprehensiveAnalysis();
      
      // Log admin activity
      console.log('[ADMIN-QUALITY] ✅ Analysis completed by admin:', {
        overallScore: report.overallScore,
        totalIssues: report.totalIssues,
        categoriesAnalyzed: report.totalCategories
      });
      
      return report;
    } catch (error) {
      console.error('[ADMIN-QUALITY] ❌ Admin analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze specific category (admin only)
   */
  static async analyzeSingleCategory(categoryName: string): Promise<CategoryQualityReport> {
    console.log(`[ADMIN-QUALITY] 🔐 Admin: Analyzing category: ${categoryName}`);
    
    try {
      const report = await contentQualityAnalyzer.analyzeSingleCategory(categoryName);
      
      console.log(`[ADMIN-QUALITY] ✅ Category analysis completed:`, {
        category: categoryName,
        score: report.overallScore,
        issues: report.totalIssues
      });
      
      return report;
    } catch (error) {
      console.error(`[ADMIN-QUALITY] ❌ Category analysis failed for ${categoryName}:`, error);
      throw error;
    }
  }

  /**
   * Get quality metrics for dashboard (admin only)
   */
  static async getQualityMetrics(): Promise<{
    overallScore: number;
    totalIssues: number;
    criticalIssues: number;
    highPriorityIssues: number;
    categoriesNeedingAttention: string[];
    lastAnalyzed: Date;
  }> {
    console.log('[ADMIN-QUALITY] 🔐 Admin: Getting quality metrics');
    
    try {
      const metrics = await contentQualityAnalyzer.getQualityMetrics();
      
      console.log('[ADMIN-QUALITY] ✅ Metrics retrieved:', {
        overallScore: metrics.overallScore,
        totalIssues: metrics.totalIssues,
        criticalIssues: metrics.criticalIssues
      });
      
      return metrics;
    } catch (error) {
      console.error('[ADMIN-QUALITY] ❌ Metrics retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Export quality report (admin only)
   */
  static async exportQualityReport(): Promise<{ content: string; filename: string }> {
    console.log('[ADMIN-QUALITY] 🔐 Admin: Exporting quality report');
    
    try {
      const exportData = await contentQualityAnalyzer.exportQualityReport();
      
      console.log('[ADMIN-QUALITY] ✅ Report exported:', {
        size: exportData.content.length,
        filename: exportData.filename
      });
      
      return exportData;
    } catch (error) {
      console.error('[ADMIN-QUALITY] ❌ Export failed:', error);
      throw error;
    }
  }

  /**
   * Get quick overview for admin dashboard
   */
  static async getQualityOverview(): Promise<{
    totalCategories: number;
    categoriesWithIssues: number;
    estimatedTotalIssues: number;
    worstCategories: string[];
    needsAttention: boolean;
    lastScanTime?: Date;
  }> {
    console.log('[ADMIN-QUALITY] 🔐 Admin: Getting quality overview');
    
    try {
      const overview = await contentQualityAnalyzer.getQualityOverview();
      
      const needsAttention = overview.estimatedTotalIssues > 50 || overview.worstCategories.length > 3;
      
      console.log('[ADMIN-QUALITY] ✅ Overview retrieved:', {
        totalCategories: overview.totalCategories,
        needsAttention
      });
      
      return {
        ...overview,
        needsAttention,
        lastScanTime: new Date()
      };
    } catch (error) {
      console.error('[ADMIN-QUALITY] ❌ Overview failed:', error);
      throw error;
    }
  }

  /**
   * Get issue breakdown for charts
   */
  static async getIssueBreakdown(): Promise<{
    byType: Array<{ type: string; count: number; description: string }>;
    bySeverity: Array<{ severity: string; count: number; color: string }>;
  }> {
    console.log('[ADMIN-QUALITY] 🔐 Admin: Getting issue breakdown');
    
    try {
      const breakdown = await contentQualityAnalyzer.getIssueBreakdown();
      
      console.log('[ADMIN-QUALITY] ✅ Breakdown retrieved:', {
        typeCount: breakdown.byType.length,
        severityCount: breakdown.bySeverity.length
      });
      
      return breakdown;
    } catch (error) {
      console.error('[ADMIN-QUALITY] ❌ Breakdown failed:', error);
      throw error;
    }
  }

  /**
   * Get action plan for improvements
   */
  static async getActionPlan(): Promise<{
    immediateActions: string[];
    shortTermActions: string[];
    longTermActions: string[];
    estimatedEffort: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
  }> {
    console.log('[ADMIN-QUALITY] 🔐 Admin: Getting action plan');
    
    try {
      const actionPlan = await contentQualityAnalyzer.getActionPlan();
      
      const totalHours = Object.values(actionPlan.estimatedEffort).reduce((sum, hours) => sum + hours, 0);
      
      console.log('[ADMIN-QUALITY] ✅ Action plan generated:', {
        immediateActions: actionPlan.immediateActions.length,
        totalEstimatedHours: totalHours.toFixed(1)
      });
      
      return actionPlan;
    } catch (error) {
      console.error('[ADMIN-QUALITY] ❌ Action plan failed:', error);
      throw error;
    }
  }

  /**
   * Validate specific content in real-time
   */
  static validateContent(content: string, categoryName?: string): {
    score: number;
    issues: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      suggestion?: string;
    }>;
  } {
    console.log('[ADMIN-QUALITY] 🔐 Admin: Validating content snippet');
    
    try {
      const validation = contentQualityAnalyzer.validateContent(content, categoryName);
      
      console.log('[ADMIN-QUALITY] ✅ Content validated:', {
        score: validation.score,
        issueCount: validation.issues.length
      });
      
      return validation;
    } catch (error) {
      console.error('[ADMIN-QUALITY] ❌ Content validation failed:', error);
      throw error;
    }
  }

  /**
   * Check if user has admin permissions for quality analysis
   */
  static hasQualityAnalysisPermissions(userRole?: string): boolean {
    const adminRoles = ['platform_admin', 'super_admin', 'content_admin'];
    return adminRoles.includes(userRole || '');
  }

  /**
   * Generate quality report summary for dashboard widgets
   */
  static async getQualityDashboardData(): Promise<{
    score: number;
    status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
    totalIssues: number;
    priorityBreakdown: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    topCategoriesToFix: string[];
    lastUpdated: Date;
  }> {
    console.log('[ADMIN-QUALITY] 🔐 Admin: Getting dashboard data');
    
    try {
      const [metrics, breakdown] = await Promise.all([
        this.getQualityMetrics(),
        this.getIssueBreakdown()
      ]);

      let status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
      if (metrics.overallScore >= 85) status = 'excellent';
      else if (metrics.overallScore >= 70) status = 'good';
      else if (metrics.overallScore >= 50) status = 'needs_improvement';
      else status = 'critical';

      const priorityBreakdown = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      };

      breakdown.bySeverity.forEach(item => {
        const severity = item.severity.toLowerCase() as keyof typeof priorityBreakdown;
        if (severity in priorityBreakdown) {
          priorityBreakdown[severity] = item.count;
        }
      });

      return {
        score: metrics.overallScore,
        status,
        totalIssues: metrics.totalIssues,
        priorityBreakdown,
        topCategoriesToFix: metrics.categoriesNeedingAttention.slice(0, 5),
        lastUpdated: metrics.lastAnalyzed
      };
    } catch (error) {
      console.error('[ADMIN-QUALITY] ❌ Dashboard data failed:', error);
      
      // Return safe default values
      return {
        score: 0,
        status: 'critical',
        totalIssues: 0,
        priorityBreakdown: { critical: 0, high: 0, medium: 0, low: 0 },
        topCategoriesToFix: [],
        lastUpdated: new Date()
      };
    }
  }
}