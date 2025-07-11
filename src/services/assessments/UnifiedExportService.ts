import { Assessment, Requirement, Standard } from '@/types';
import { UnifiedAssessmentData } from '@/components/assessments/UnifiedAssessmentTemplate';
import { AssessmentDataProcessor } from './AssessmentDataProcessor';
import { OptimizedPdfGenerator } from '@/utils/optimizedPdfUtils';
import { OptimizedWordGenerator } from '@/utils/optimizedWordUtils';
import { toast } from '@/utils/toast';

/**
 * UnifiedExportService
 * 
 * Central service for all assessment exports.
 * Provides consistent, optimized export functionality for:
 * - PDF exports (no html2canvas, <2MB files)
 * - Word exports (consistent formatting)
 * - CSV exports (for data analysis)
 * - Preview data processing
 * 
 * Key Benefits:
 * - Single source of truth for export logic
 * - Consistent formatting across all formats
 * - Optimized performance and file sizes
 * - Comprehensive error handling
 */
export class UnifiedExportService {
  private static instance: UnifiedExportService;
  
  static getInstance(): UnifiedExportService {
    if (!UnifiedExportService.instance) {
      UnifiedExportService.instance = new UnifiedExportService();
    }
    return UnifiedExportService.instance;
  }
  
  /**
   * Process assessment data for unified template usage
   */
  processAssessmentData(
    assessment: Assessment,
    requirements: Requirement[],
    standards: Standard[],
    options: {
      activeStandardId?: string;
      format?: 'preview' | 'pdf' | 'word';
      showHeader?: boolean;
      showSummary?: boolean;
      showCharts?: boolean;
      showRequirements?: boolean;
      showAttachments?: boolean;
    } = {}
  ): UnifiedAssessmentData {
    // Validate data before processing
    const validation = AssessmentDataProcessor.validateAssessmentData(
      assessment, 
      requirements, 
      standards
    );
    
    if (!validation.valid) {
      throw new Error(`Invalid assessment data: ${validation.errors.join(', ')}`);
    }
    
    return AssessmentDataProcessor.processAssessmentData(
      assessment,
      requirements,
      standards,
      options
    );
  }
  
  /**
   * Export assessment as optimized PDF
   */
  async exportPDF(
    assessment: Assessment,
    requirements: Requirement[],
    standards: Standard[],
    options: {
      activeStandardId?: string;
      showHeader?: boolean;
      showSummary?: boolean;
      showCharts?: boolean;
      showRequirements?: boolean;
      showAttachments?: boolean;
    } = {}
  ): Promise<void> {
    try {
      console.log('Starting optimized PDF export...');
      
      const data = this.processAssessmentData(
        assessment,
        requirements,
        standards,
        { ...options, format: 'pdf' }
      );
      
      await OptimizedPdfGenerator.generateAssessmentPDF(data);
      
      console.log('PDF export completed successfully');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to export PDF. Please try again.');
      throw error;
    }
  }
  
  /**
   * Export assessment as optimized Word document
   */
  async exportWord(
    assessment: Assessment,
    requirements: Requirement[],
    standards: Standard[],
    options: {
      activeStandardId?: string;
      showHeader?: boolean;
      showSummary?: boolean;
      showCharts?: boolean;
      showRequirements?: boolean;
      showAttachments?: boolean;
    } = {}
  ): Promise<void> {
    try {
      console.log('Starting optimized Word export...');
      
      const data = this.processAssessmentData(
        assessment,
        requirements,
        standards,
        { ...options, format: 'word' }
      );
      
      await OptimizedWordGenerator.generateAssessmentWord(data);
      
      console.log('Word export completed successfully');
    } catch (error) {
      console.error('Word export failed:', error);
      toast.error('Failed to export Word document. Please try again.');
      throw error;
    }
  }
  
  /**
   * Export assessment as CSV
   */
  exportCSV(
    assessment: Assessment,
    requirements: Requirement[],
    standards: Standard[],
    options: {
      activeStandardId?: string;
    } = {}
  ): void {
    try {
      console.log('Starting CSV export...');
      
      const data = this.processAssessmentData(
        assessment,
        requirements,
        standards,
        options
      );
      
      this.generateCSVExport(data);
      
      console.log('CSV export completed successfully');
    } catch (error) {
      console.error('CSV export failed:', error);
      toast.error('Failed to export CSV. Please try again.');
      throw error;
    }
  }
  
  /**
   * Generate CSV export with clean data
   */
  private generateCSVExport(data: UnifiedAssessmentData): void {
    const { assessment, requirements, metrics, standards } = data;
    
    // CSV header
    const headerRow = [
      "Assessment_Name",
      "Standard",
      "Requirement_Code", 
      "Requirement_Name", 
      "Requirement_Description", 
      "Status", 
      "Section",
      "Notes", 
      "Evidence_Available"
    ].join(",");
    
    // CSV data rows
    const dataRows = requirements.map(req => {
      const standardName = standards.find(s => s.id === req.standardId)?.name || 'Unknown';
      
      // Format CSV fields properly
      const formatCSVField = (text: string) => `"${(text || '').replace(/"/g, '""')}"`;
      
      return [
        formatCSVField(assessment.name),
        formatCSVField(standardName),
        formatCSVField(req.code),
        formatCSVField(req.name),
        formatCSVField(req.description),
        formatCSVField(req.status),
        formatCSVField(req.section || AssessmentDataProcessor.extractSectionFromCode(req.code)),
        formatCSVField(AssessmentDataProcessor.cleanTextForExport(req.notes || '')),
        req.evidence ? 'Yes' : 'No'
      ].join(",");
    });
    
    // Add summary row
    const summaryRow = [
      formatCSVField(`${assessment.name} - SUMMARY`),
      formatCSVField('ALL'),
      formatCSVField('SUMMARY'),
      formatCSVField('Assessment Summary'),
      formatCSVField(`Total: ${metrics.totalRequirements}, Fulfilled: ${metrics.fulfilled}, Partial: ${metrics.partiallyFulfilled}, Not Fulfilled: ${metrics.notFulfilled}, Not Applicable: ${metrics.notApplicable}`),
      formatCSVField(`${metrics.complianceScore}% Compliant`),
      formatCSVField('SUMMARY'),
      formatCSVField(AssessmentDataProcessor.cleanTextForExport(assessment.notes || '')),
      assessment.evidence ? 'Yes' : 'No'
    ].join(",");
    
    // Combine all data
    const csvContent = [headerRow, summaryRow, ...dataRows].join("\n");
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute('download', AssessmentDataProcessor.generateExportFilename(
      assessment.name, 
      'csv'
    ));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
    toast.success('CSV exported successfully!');
  }
  
  /**
   * Get assessment statistics for dashboard displays
   */
  getAssessmentStatistics(
    assessment: Assessment,
    requirements: Requirement[],
    standards: Standard[]
  ) {
    const data = this.processAssessmentData(assessment, requirements, standards);
    return {
      ...data.metrics,
      sectionsCount: Object.keys(data.requirementsBySection).length,
      standardsCount: standards.length,
      hasNotes: !!assessment.notes,
      hasEvidence: !!assessment.evidence,
      attachmentsCount: data.attachments.length,
      lastUpdated: assessment.updatedAt,
      status: assessment.status
    };
  }
  
  /**
   * Validate export prerequisites
   */
  validateExportData(
    assessment: Assessment,
    requirements: Requirement[],
    standards: Standard[]
  ): { canExport: boolean; warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Critical validations
    if (!assessment.name?.trim()) {
      errors.push('Assessment name is required');
    }
    
    if (!requirements || requirements.length === 0) {
      errors.push('Assessment must have at least one requirement');
    }
    
    if (!standards || standards.length === 0) {
      errors.push('Assessment must be associated with at least one standard');
    }
    
    // Warning validations
    if (!assessment.notes?.trim()) {
      warnings.push('Assessment notes are empty - consider adding assessment context');
    }
    
    if (!assessment.evidence?.trim()) {
      warnings.push('No evidence documented - consider adding evidence collection notes');
    }
    
    if (requirements.filter(r => r.status === 'not-fulfilled').length > 0) {
      warnings.push('Some requirements are not fulfilled - ensure this is intentional');
    }
    
    if (!assessment.assessorName && !assessment.assessorNames?.length) {
      warnings.push('No assessor assigned - consider assigning an assessor');
    }
    
    const incompleteRequirements = requirements.filter(r => !r.notes?.trim() && r.status !== 'not-applicable');
    if (incompleteRequirements.length > 0) {
      warnings.push(`${incompleteRequirements.length} requirements lack notes - consider adding implementation details`);
    }
    
    return {
      canExport: errors.length === 0,
      warnings,
      errors
    };
  }
  
  /**
   * Get export format recommendations based on use case
   */
  getExportRecommendations(
    assessment: Assessment,
    requirements: Requirement[]
  ): {
    pdf: { recommended: boolean; reason: string };
    word: { recommended: boolean; reason: string };
    csv: { recommended: boolean; reason: string };
  } {
    const totalRequirements = requirements.length;
    const hasNotes = requirements.some(r => r.notes?.trim());
    const hasEvidence = !!assessment.evidence?.trim();
    
    return {
      pdf: {
        recommended: true,
        reason: 'Best for official reports and document sharing. Professional formatting preserved.'
      },
      word: {
        recommended: hasNotes || hasEvidence,
        reason: hasNotes || hasEvidence 
          ? 'Recommended for further editing and collaboration. Rich content preserved.'
          : 'Consider PDF instead - limited content benefits less from Word format.'
      },
      csv: {
        recommended: totalRequirements > 20,
        reason: totalRequirements > 20
          ? 'Recommended for data analysis and integration with other systems.'
          : 'Consider PDF/Word for smaller assessments with rich formatting.'
      }
    };
  }
  
  /**
   * Clean up temporary resources (if any)
   */
  cleanup(): void {
    // Currently no persistent resources to clean up
    // This method is here for future extensibility
    console.log('UnifiedExportService cleanup completed');
  }
}

export default UnifiedExportService;