/**
 * Enhanced CSV Export Service
 * 
 * Provides professional, executive-ready CSV exports with improved formatting
 * and structure suitable for compliance officers and executive reports.
 * 
 * Key Features:
 * - Professional column headers and formatting
 * - Enhanced unified guidance formatting for spreadsheet readability
 * - Multi-line content handling optimized for Excel/Google Sheets
 * - Executive summary sections
 * - Proper framework mapping display
 * - Timestamp and metadata inclusion
 */

import { formatCSVField, generateCSVFilename, downloadCSV } from '@/utils/csvUtils';

export interface UnifiedMapping {
  id: string;
  category: string;
  auditReadyUnified?: {
    title: string;
    description: string;
    subRequirements: string[];
  };
  frameworks?: {
    iso27001?: Array<{ code: string; title: string }>;
    iso27002?: Array<{ code: string; title: string }>;
    cisControls?: Array<{ code: string; title: string }>;
    nis2?: Array<{ code: string; title: string }>;
  };
}

export interface GuidanceContent {
  title: string;
  content: string;
  tips?: string[];
  examples?: string[];
  priority?: string;
  implementationTimeframe?: string;
}

export class EnhancedCSVExportService {
  private static instance: EnhancedCSVExportService;
  
  static getInstance(): EnhancedCSVExportService {
    if (!EnhancedCSVExportService.instance) {
      EnhancedCSVExportService.instance = new EnhancedCSVExportService();
    }
    return EnhancedCSVExportService.instance;
  }
  
  /**
   * Export unified compliance mappings with PROFESSIONAL EXECUTIVE-GRADE formatting
   * Optimized for Excel and Google Sheets with clear column differentiation
   */
  exportUnifiedComplianceMappings(
    mappings: UnifiedMapping[],
    getGuidanceContent: (category: string) => GuidanceContent | null,
    options: {
      includeExecutiveSummary?: boolean;
      includeDetailedGuidance?: boolean;
      includeFrameworkCounts?: boolean;
      selectedFrameworks?: string[];
      organizationName?: string;
      reportPurpose?: string;
    } = {}
  ): void {
    try {
      const {
        includeExecutiveSummary = true,
        includeDetailedGuidance = true,
        includeFrameworkCounts = true,
        selectedFrameworks = [],
        organizationName = 'Organization',
        reportPurpose = 'Compliance Assessment'
      } = options;

      console.log('🚀 Starting PROFESSIONAL CSV export with enhanced formatting...');

      // Create PROFESSIONAL headers with column width optimization
      const { headers, columnWidths } = this.createExecutiveHeaders(includeDetailedGuidance);

      // Process mappings data with enhanced formatting
      const dataRows = this.processUnifiedMappingsEnhanced(mappings, getGuidanceContent, includeDetailedGuidance);

      // Create executive summary with professional styling
      const summaryRows = includeExecutiveSummary 
        ? this.createProfessionalExecutiveSummary(mappings, selectedFrameworks, organizationName, reportPurpose, headers.length)
        : [];

      // Add framework statistics with visual formatting
      const statsRows = includeFrameworkCounts
        ? this.createVisualFrameworkStatistics(mappings, headers.length)
        : [];

      // Create column width hints for Excel/Google Sheets
      const columnWidthHints = this.createColumnWidthHints(columnWidths);

      // Combine all content with proper visual separation
      const allRows = [
        // Column width hints (hidden metadata for spreadsheet apps)
        ...columnWidthHints,
        // Professional section dividers
        this.createSectionDivider('AUDIT READINESS COMPLIANCE REPORT', headers.length),
        ...summaryRows,
        ...(summaryRows.length > 0 ? [this.createVisualSeparator(headers.length, '─')] : []),
        ...statsRows,
        ...(statsRows.length > 0 ? [this.createVisualSeparator(headers.length, '═')] : []),
        // Enhanced headers with formatting
        this.createFormattedHeaderRow(headers),
        this.createVisualSeparator(headers.length, '═'),
        ...dataRows
      ];

      // Generate CSV content with enhanced formatting
      const csvContent = this.generateEnhancedCSVContent(allRows);

      // Create descriptive filename with professional naming
      const filename = generateCSVFilename(
        `AuditReady-Executive-Compliance-Report-${organizationName.replace(/[^a-zA-Z0-9]/g, '-')}`
      );

      // Download with enhanced compatibility
      this.downloadProfessionalCSV(csvContent, filename);

      console.log('✅ PROFESSIONAL CSV export completed successfully with executive formatting!');
    } catch (error) {
      console.error('❌ Enhanced CSV export failed:', error);
      throw new Error(`Failed to export CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create professional, descriptive column headers
   */
  private createProfessionalHeaders(includeDetailedGuidance: boolean): string[] {
    const baseHeaders = [
      'Compliance Category',
      'Unified Requirement Title',
      'Sub-Requirement Details',
      'ISO 27001 Controls Mapped',
      'ISO 27002 Implementation Guidelines',
      'CIS Security Controls',
      'NIS2 Directive Articles',
      'AuditReady Description',
      'Implementation Priority',
      'Framework Coverage Count'
    ];

    if (includeDetailedGuidance) {
      baseHeaders.push(
        'Implementation Guidance Overview',
        'Key Implementation Steps',
        'Best Practice Tips',
        'Estimated Implementation Time',
        'Success Criteria'
      );
    }

    return baseHeaders;
  }

  /**
   * Process unified mappings with enhanced formatting
   */
  private processUnifiedMappings(
    mappings: UnifiedMapping[],
    getGuidanceContent: (category: string) => GuidanceContent | null,
    includeDetailedGuidance: boolean
  ): string[][] {
    return mappings.flatMap(mapping => 
      (mapping.auditReadyUnified?.subRequirements || ['N/A']).map((subReq, index) => {
        const guidance = getGuidanceContent(mapping.category);
        
        // Count framework mappings
        const frameworkCount = this.countFrameworkMappings(mapping);
        
        // Determine priority based on framework coverage
        const priority = frameworkCount > 2 ? 'HIGH' : frameworkCount > 1 ? 'MEDIUM' : 'LOW';

        const baseRow = [
          mapping.category,
          mapping.auditReadyUnified?.title || 'No title available',
          this.formatSubRequirement(subReq, index + 1),
          this.formatFrameworkMappings(mapping.frameworks?.iso27001),
          this.formatFrameworkMappings(mapping.frameworks?.iso27002),
          this.formatFrameworkMappings(mapping.frameworks?.cisControls),
          this.formatFrameworkMappings(mapping.frameworks?.nis2),
          this.formatDescription(mapping.auditReadyUnified?.description),
          priority,
          frameworkCount.toString()
        ];

        if (includeDetailedGuidance && guidance) {
          baseRow.push(
            this.formatGuidanceOverview(guidance),
            this.formatImplementationSteps(guidance),
            this.formatBestPracticeTips(guidance),
            guidance.implementationTimeframe || 'To be determined',
            this.generateSuccessCriteria(guidance, subReq)
          );
        }

        return baseRow;
      })
    );
  }

  /**
   * Create executive summary section
   */
  private createExecutiveSummary(
    mappings: UnifiedMapping[],
    selectedFrameworks: string[],
    organizationName: string,
    reportPurpose: string
  ): string[][] {
    const timestamp = new Date().toLocaleString();
    const totalRequirements = mappings.reduce((sum, m) => 
      sum + (m.auditReadyUnified?.subRequirements?.length || 0), 0
    );
    
    const frameworkCoverage = {
      iso27001: mappings.filter(m => m.frameworks?.iso27001?.length).length,
      iso27002: mappings.filter(m => m.frameworks?.iso27002?.length).length,
      cisControls: mappings.filter(m => m.frameworks?.cisControls?.length).length,
      nis2: mappings.filter(m => m.frameworks?.nis2?.length).length,
    };

    return [
      ['EXECUTIVE SUMMARY', '', '', '', '', '', '', '', '', ''],
      ['Report Generated:', timestamp, '', '', '', '', '', '', '', ''],
      ['Organization:', organizationName, '', '', '', '', '', '', '', ''],
      ['Report Purpose:', reportPurpose, '', '', '', '', '', '', '', ''],
      ['Total Unified Requirement Groups:', mappings.length.toString(), '', '', '', '', '', '', '', ''],
      ['Total Sub-Requirements:', totalRequirements.toString(), '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['FRAMEWORK COVERAGE ANALYSIS', '', '', '', '', '', '', '', '', ''],
      ['ISO 27001 Coverage:', `${frameworkCoverage.iso27001} requirements (${Math.round(frameworkCoverage.iso27001 / mappings.length * 100)}%)`, '', '', '', '', '', '', '', ''],
      ['ISO 27002 Coverage:', `${frameworkCoverage.iso27002} requirements (${Math.round(frameworkCoverage.iso27002 / mappings.length * 100)}%)`, '', '', '', '', '', '', '', ''],
      ['CIS Controls Coverage:', `${frameworkCoverage.cisControls} requirements (${Math.round(frameworkCoverage.cisControls / mappings.length * 100)}%)`, '', '', '', '', '', '', '', ''],
      ['NIS2 Directive Coverage:', `${frameworkCoverage.nis2} requirements (${Math.round(frameworkCoverage.nis2 / mappings.length * 100)}%)`, '', '', '', '', '', '', '', ''],
    ];
  }

  /**
   * Create framework statistics section
   */
  private createFrameworkStatistics(mappings: UnifiedMapping[]): string[][] {
    const stats = {
      highPriority: mappings.filter(m => this.countFrameworkMappings(m) > 2).length,
      mediumPriority: mappings.filter(m => this.countFrameworkMappings(m) === 2).length,
      lowPriority: mappings.filter(m => this.countFrameworkMappings(m) < 2).length,
    };

    return [
      ['PRIORITY ANALYSIS', '', '', '', '', '', '', '', '', ''],
      ['High Priority (3+ frameworks):', stats.highPriority.toString(), '', '', '', '', '', '', '', ''],
      ['Medium Priority (2 frameworks):', stats.mediumPriority.toString(), '', '', '', '', '', '', '', ''],
      ['Low Priority (1 framework):', stats.lowPriority.toString(), '', '', '', '', '', '', '', ''],
    ];
  }

  /**
   * Format framework mappings for professional display
   */
  private formatFrameworkMappings(frameworks?: Array<{ code: string; title: string }>): string {
    if (!frameworks || frameworks.length === 0) {
      return 'No mapping available';
    }

    if (frameworks.length === 1) {
      return `${frameworks[0].code}: ${frameworks[0].title}`;
    }

    return frameworks
      .map((f, index) => `${index + 1}. ${f.code}: ${f.title}`)
      .join('\n');
  }

  /**
   * Format sub-requirement with professional numbering
   */
  private formatSubRequirement(subReq: string, index: number): string {
    return `${index}. ${subReq}`;
  }

  /**
   * Format description with proper line breaking
   */
  private formatDescription(description?: string): string {
    if (!description) return 'No description available';
    
    // Break long descriptions into readable chunks
    const maxLength = 200;
    if (description.length <= maxLength) {
      return description;
    }

    // Split at sentence boundaries near the max length
    const sentences = description.split('. ');
    let result = '';
    let currentLength = 0;

    for (const sentence of sentences) {
      if (currentLength + sentence.length > maxLength && result.length > 0) {
        result += '\n\nContinued: ';
        currentLength = 0;
      }
      result += sentence + (sentence === sentences[sentences.length - 1] ? '' : '. ');
      currentLength += sentence.length + 2;
    }

    return result;
  }

  /**
   * Count framework mappings for priority calculation
   */
  private countFrameworkMappings(mapping: UnifiedMapping): number {
    let count = 0;
    if (mapping.frameworks?.iso27001?.length) count++;
    if (mapping.frameworks?.iso27002?.length) count++;
    if (mapping.frameworks?.cisControls?.length) count++;
    if (mapping.frameworks?.nis2?.length) count++;
    return count;
  }

  /**
   * Format guidance overview for spreadsheet readability
   */
  private formatGuidanceOverview(guidance: GuidanceContent): string {
    return `${guidance.title}\n\n${guidance.content.substring(0, 300)}${guidance.content.length > 300 ? '...' : ''}`;
  }

  /**
   * Format implementation steps
   */
  private formatImplementationSteps(guidance: GuidanceContent): string {
    if (!guidance.tips || guidance.tips.length === 0) {
      return 'Refer to framework-specific implementation guidelines';
    }

    return guidance.tips
      .slice(0, 5) // Limit to top 5 for spreadsheet readability
      .map((tip, index) => `Step ${index + 1}: ${tip}`)
      .join('\n');
  }

  /**
   * Format best practice tips
   */
  private formatBestPracticeTips(guidance: GuidanceContent): string {
    if (!guidance.examples || guidance.examples.length === 0) {
      return 'Follow industry best practices for implementation';
    }

    return guidance.examples
      .slice(0, 3) // Limit to top 3 for readability
      .map((example, index) => `Tip ${index + 1}: ${example}`)
      .join('\n');
  }

  /**
   * Generate success criteria based on guidance and requirement
   */
  private generateSuccessCriteria(guidance: GuidanceContent, subRequirement: string): string {
    return [
      '1. Implementation completed according to framework specifications',
      '2. Documentation updated and accessible to audit teams',
      '3. Regular monitoring and review processes established',
      '4. Staff training completed for relevant personnel',
      '5. Compliance verification through testing or assessment'
    ].join('\n');
  }

  /**
   * Validate export data before processing
   */
  validateExportData(mappings: UnifiedMapping[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!mappings || mappings.length === 0) {
      errors.push('No unified mappings available for export');
    }

    if (mappings) {
      const mappingsWithoutTitles = mappings.filter(m => !m.auditReadyUnified?.title);
      if (mappingsWithoutTitles.length > 0) {
        errors.push(`${mappingsWithoutTitles.length} mappings are missing titles`);
      }

      const mappingsWithoutCategories = mappings.filter(m => !m.category);
      if (mappingsWithoutCategories.length > 0) {
        errors.push(`${mappingsWithoutCategories.length} mappings are missing categories`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default EnhancedCSVExportService;