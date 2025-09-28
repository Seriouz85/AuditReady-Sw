import { RequirementsDataService } from './RequirementsDataService';
import { RequirementsProcessingService } from './RequirementsProcessingService';
import { RequirementsValidationService } from './RequirementsValidationService';
import { RequirementsFormattingService } from './RequirementsFormattingService';
import { ComplianceQualityAnalysisService } from './ComplianceQualityAnalysisService';
import { 
  ValidationResult, 
  ValidationConfig, 
  ComprehensiveQualityReport, 
  CategoryQualityReport 
} from './types/ComplianceTypesDefinitions';

// Re-export types for backward compatibility
export type { 
  ValidationResult, 
  ValidationConfig, 
  ComprehensiveQualityReport, 
  CategoryQualityReport,
  RequirementDetail,
  UnifiedSection,
  ContentValidationResult,
  QualityIssue
} from './types/ComplianceTypesDefinitions';

/**
 * Enhanced Unified Requirements Generator (Refactored)
 * 
 * Main orchestrator class that coordinates all compliance requirements generation
 * services. This refactored version delegates responsibilities to specialized
 * services while maintaining the same public API for backward compatibility.
 * 
 * Architecture:
 * - RequirementsDataService: Database operations and data fetching
 * - RequirementsProcessingService: Smart assignment and content combination
 * - RequirementsValidationService: Content quality validation and scoring
 * - RequirementsFormattingService: Professional output formatting
 * - ComplianceQualityAnalysisService: Quality reporting and analysis
 * 
 * Design Philosophy:
 * 1. Service-oriented architecture with clear separation of concerns
 * 2. Maintains backward compatibility with existing API
 * 3. Enhanced maintainability through modular design
 * 4. Improved testability with dependency injection
 * 5. Scalable for future compliance frameworks
 */
export class EnhancedUnifiedRequirementsGenerator {
  private dataService: RequirementsDataService;
  private processingService: RequirementsProcessingService;
  private validationService: RequirementsValidationService;
  private formattingService: RequirementsFormattingService;
  private qualityAnalysisService: ComplianceQualityAnalysisService;

  constructor() {
    // Initialize all service dependencies
    this.dataService = new RequirementsDataService();
    this.processingService = new RequirementsProcessingService();
    this.validationService = new RequirementsValidationService();
    this.formattingService = new RequirementsFormattingService();
    this.qualityAnalysisService = new ComplianceQualityAnalysisService(this.dataService);
    
    console.log('[ENHANCED-GENERATOR] 🏗️ Initialized with modular service architecture');
  }

  /**
   * Main generation method - returns professionally formatted unified requirements
   * 
   * This is the primary public API method that maintains full backward compatibility
   * while leveraging the new modular service architecture underneath.
   */
  async generateUnifiedRequirements(
    categoryName: string,
    selectedFrameworks: string[],
    cisIGLevel?: string
  ): Promise<{ content: string[]; validation: ValidationResult }> {
    try {
      console.log('[ENHANCED-GENERATOR] 🚀 Starting unified requirements generation');
      console.log('[ENHANCED-GENERATOR] 📋 Category:', categoryName);
      console.log('[ENHANCED-GENERATOR] 🎯 Frameworks:', selectedFrameworks);
      console.log('[ENHANCED-GENERATOR] 🎚️ CIS IG Level:', cisIGLevel);
      
      // Step 1: Data Retrieval - Get database structure and requirements
      console.log('[ENHANCED-GENERATOR] 📥 Step 1: Retrieving data from database');
      const [sections, requirements] = await Promise.all([
        this.dataService.getDatabaseSections(categoryName),
        this.dataService.getMappedRequirements(categoryName, selectedFrameworks, cisIGLevel)
      ]);
      
      console.log(`[ENHANCED-GENERATOR] ✅ Retrieved ${sections.length} sections and ${requirements.length} requirements`);
      
      // Step 2: Processing - Smart assignment and combination
      console.log('[ENHANCED-GENERATOR] ⚙️ Step 2: Processing and combining requirements');
      const enhancedSections = await this.processingService.assignAndCombineRequirements(
        sections, 
        requirements
      );
      
      console.log(`[ENHANCED-GENERATOR] ✅ Processed ${enhancedSections.length} enhanced sections`);
      
      // Step 3: Formatting - Professional content generation
      console.log('[ENHANCED-GENERATOR] 📝 Step 3: Formatting professional content');
      const formattedContent = this.formattingService.formatProfessionalContent(
        enhancedSections, 
        selectedFrameworks, 
        cisIGLevel
      );
      
      console.log(`[ENHANCED-GENERATOR] ✅ Generated ${formattedContent.length} formatted sections`);
      
      // Step 4: Validation - Completeness and quality assessment
      console.log('[ENHANCED-GENERATOR] 🔍 Step 4: Validating completeness and quality');
      const validation = this.validationService.validateCompleteness(requirements, enhancedSections);
      
      console.log('[ENHANCED-GENERATOR] ✅ Generation completed successfully');
      console.log('[ENHANCED-GENERATOR] 📊 Results:', {
        sections: formattedContent.length,
        coverage: `${validation.coverage.toFixed(1)}%`,
        isValid: validation.isValid,
        totalCharacters: formattedContent.join('').length
      });
      
      return { content: formattedContent, validation };
      
    } catch (error) {
      console.error('[ENHANCED-GENERATOR] ❌ Generation failed:', error);
      return { 
        content: [], 
        validation: { 
          isValid: false, 
          missingRequirements: [], 
          coverage: 0, 
          suggestions: ['Failed to generate requirements due to system error'] 
        } 
      };
    }
  }

  /**
   * Set validation configuration for content quality checks
   * 
   * Allows customization of validation behavior including quality thresholds,
   * content length requirements, and framework-specific validation rules.
   */
  setValidationConfig(config: Partial<ValidationConfig>): void {
    console.log('[ENHANCED-GENERATOR] ⚙️ Updating validation configuration');
    this.validationService.setValidationConfig(config);
    console.log('[ENHANCED-GENERATOR] ✅ Validation configuration updated');
  }

  /**
   * Generate comprehensive quality report for all categories
   * 
   * Provides detailed quality analysis across all compliance categories
   * including issue identification, scoring, and actionable recommendations.
   */
  async generateComprehensiveQualityReport(): Promise<ComprehensiveQualityReport> {
    console.log('[ENHANCED-GENERATOR] 📊 Starting comprehensive quality analysis');
    
    try {
      const report = await this.qualityAnalysisService.generateComprehensiveQualityReport();
      
      console.log('[ENHANCED-GENERATOR] ✅ Quality analysis completed');
      console.log('[ENHANCED-GENERATOR] 📈 Report summary:', {
        overallScore: report.overallScore,
        totalCategories: report.totalCategories,
        totalIssues: report.totalIssues,
        criticalActions: report.prioritizedActions.find(a => a.priority === 'critical')?.actions.length || 0
      });
      
      return report;
    } catch (error) {
      console.error('[ENHANCED-GENERATOR] ❌ Quality analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze a single category for quality issues
   * 
   * Provides focused quality analysis for a specific compliance category
   * with detailed issue breakdowns and improvement recommendations.
   */
  async analyzeSingleCategory(categoryName: string): Promise<CategoryQualityReport> {
    console.log(`[ENHANCED-GENERATOR] 🎯 Analyzing single category: ${categoryName}`);
    
    try {
      const report = await this.qualityAnalysisService.analyzeSingleCategory(categoryName);
      
      console.log('[ENHANCED-GENERATOR] ✅ Category analysis completed');
      console.log('[ENHANCED-GENERATOR] 📊 Category stats:', {
        category: report.categoryName,
        score: report.overallScore,
        issues: report.totalIssues,
        subRequirements: report.subRequirements.length
      });
      
      return report;
    } catch (error) {
      console.error(`[ENHANCED-GENERATOR] ❌ Category analysis failed for ${categoryName}:`, error);
      throw error;
    }
  }

  /**
   * Get quick quality scan summary across all categories
   * 
   * Provides a high-level overview of content quality issues without
   * performing a full analysis. Useful for dashboard displays and
   * quick quality assessments.
   */
  async getQualityScanSummary(): Promise<{
    totalCategories: number;
    categoriesWithIssues: number;
    estimatedTotalIssues: number;
    worstCategories: string[];
  }> {
    console.log('[ENHANCED-GENERATOR] 🔍 Running quick quality scan');
    
    try {
      const summary = await this.qualityAnalysisService.getQualityScanSummary();
      
      console.log('[ENHANCED-GENERATOR] ✅ Quick scan completed');
      console.log('[ENHANCED-GENERATOR] 📈 Scan results:', summary);
      
      return summary;
    } catch (error) {
      console.error('[ENHANCED-GENERATOR] ❌ Quality scan failed:', error);
      throw error;
    }
  }

  /**
   * Export formatted content for external use
   * 
   * Provides multiple export formats including PDF, Word, and Markdown
   * with customizable metadata and styling options.
   */
  async exportFormattedContent(
    categoryName: string,
    selectedFrameworks: string[],
    format: 'pdf' | 'word' | 'markdown' = 'markdown',
    metadata?: {
      title?: string;
      organization?: string;
      generatedDate?: Date;
    }
  ): Promise<string> {
    console.log(`[ENHANCED-GENERATOR] 📤 Exporting content for ${categoryName} in ${format} format`);
    
    try {
      // Get the enhanced sections first
      const sections = await this.dataService.getDatabaseSections(categoryName);
      const requirements = await this.dataService.getMappedRequirements(categoryName, selectedFrameworks);
      const enhancedSections = await this.processingService.assignAndCombineRequirements(sections, requirements);
      
      let exportContent: string;
      const exportMetadata = {
        title: `${categoryName} Compliance Requirements`,
        frameworks: selectedFrameworks,
        generatedDate: new Date(),
        ...metadata
      };
      
      switch (format) {
        case 'pdf':
          exportContent = this.formattingService.formatPDFContent(enhancedSections, exportMetadata);
          break;
        case 'word':
          exportContent = this.formattingService.formatWordContent(enhancedSections, exportMetadata);
          break;
        case 'markdown':
        default:
          exportContent = this.formattingService.formatMarkdownContent(enhancedSections);
          break;
      }
      
      console.log(`[ENHANCED-GENERATOR] ✅ Export completed - ${exportContent.length} characters`);
      return exportContent;
      
    } catch (error) {
      console.error('[ENHANCED-GENERATOR] ❌ Export failed:', error);
      throw error;
    }
  }

  /**
   * Get service health status
   * 
   * Provides diagnostic information about the health and status of all
   * underlying services. Useful for monitoring and troubleshooting.
   */
  getServiceHealth(): {
    status: 'healthy' | 'degraded' | 'error';
    services: {
      dataService: 'ready' | 'error';
      processingService: 'ready' | 'error';
      validationService: 'ready' | 'error';
      formattingService: 'ready' | 'error';
      qualityAnalysisService: 'ready' | 'error';
    };
    version: string;
    architecture: string;
  } {
    try {
      // Basic health checks for all services
      const serviceStatus = {
        dataService: this.dataService ? 'ready' as const : 'error' as const,
        processingService: this.processingService ? 'ready' as const : 'error' as const,
        validationService: this.validationService ? 'ready' as const : 'error' as const,
        formattingService: this.formattingService ? 'ready' as const : 'error' as const,
        qualityAnalysisService: this.qualityAnalysisService ? 'ready' as const : 'error' as const
      };
      
      const hasErrors = Object.values(serviceStatus).some(status => status === 'error');
      const overallStatus = hasErrors ? 'error' : 'healthy';
      
      return {
        status: overallStatus,
        services: serviceStatus,
        version: '2.0.0-refactored',
        architecture: 'modular-service-oriented'
      };
    } catch (error) {
      console.error('[ENHANCED-GENERATOR] ❌ Health check failed:', error);
      return {
        status: 'error',
        services: {
          dataService: 'error',
          processingService: 'error',
          validationService: 'error',
          formattingService: 'error',
          qualityAnalysisService: 'error'
        },
        version: '2.0.0-refactored',
        architecture: 'modular-service-oriented'
      };
    }
  }

  /**
   * Get service metrics and statistics
   * 
   * Provides performance metrics and usage statistics for monitoring
   * and optimization purposes.
   */
  getServiceMetrics(): {
    totalGenerations: number;
    averageProcessingTime: number;
    cacheHitRate: number;
    errorRate: number;
    lastUpdated: Date;
  } {
    // This would typically be implemented with actual metrics tracking
    // For now, return placeholder metrics
    return {
      totalGenerations: 0,
      averageProcessingTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      lastUpdated: new Date()
    };
  }
}