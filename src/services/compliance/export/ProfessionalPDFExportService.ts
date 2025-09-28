/**
 * Professional PDF Export Service for Compliance Simplification
 * Extracted from ComplianceSimplification.tsx to reduce complexity
 * 
 * FEATURES:
 * - Professional corporate styling
 * - Intelligent content generation
 * - Framework-specific formatting
 * - Executive summary generation
 * - High-quality typography
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { SelectedFrameworks } from '@/utils/FrameworkUtilities';
import type { ComplianceMappingData } from '@/services/compliance/ComplianceUnificationService';

// Type declaration for jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

export interface PDFExportOptions {
  selectedFrameworks: SelectedFrameworks;
  filteredUnifiedMappings: ComplianceMappingData[];
  generatedContent: Map<string, any[]>;
  generateDynamicContentForCategory: (categoryName: string) => Promise<any[]>;
  organizationName?: string;
}

export interface PDFGenerationResult {
  success: boolean;
  filename?: string;
  error?: string;
  stats?: {
    categoriesProcessed: number;
    contentGenerated: number;
    fileSize: string;
  };
}

export class ProfessionalPDFExportService {
  private static readonly PAGE_WIDTH = 210; // A4 portrait width
  private static readonly PAGE_HEIGHT = 297; // A4 portrait height
  private static readonly MARGIN = 15; // Professional margin
  
  // Professional color palette
  private static readonly COLORS = {
    primary: [59, 130, 246], // blue-500
    secondary: [100, 116, 139], // slate-500
    accent: [16, 185, 129], // emerald-500
    text: [15, 23, 42], // slate-900
    textLight: [71, 85, 105], // slate-600
    background: [248, 250, 252], // slate-50
    border: [203, 213, 225], // slate-300
  } as const;

  /**
   * Main export function - generates professional PDF
   */
  async exportToPDF(options: PDFExportOptions): Promise<PDFGenerationResult> {
    try {
      console.log('[PDF Service] Starting professional PDF generation...');
      
      // Validate inputs
      const validation = this.validateInputs(options);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Generate enhanced content
      const contentToUse = await this.generateEnhancedContent(options);
      
      // Create PDF document with professional settings
      const doc = this.createProfessionalDocument();
      
      // Generate document sections
      await this.generateDocumentSections(doc, options, contentToUse);
      
      // Save with professional filename
      const filename = this.generateFilename(options.selectedFrameworks);
      doc.save(filename);
      
      const stats = this.calculateStats(contentToUse, options.filteredUnifiedMappings);
      
      console.log(`✅ [PDF Service] Generated: ${filename}`);
      return {
        success: true,
        filename,
        stats
      };
      
    } catch (error) {
      console.error('[PDF Service] Generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate export inputs
   */
  private validateInputs(options: PDFExportOptions): { valid: boolean; error?: string } {
    const { selectedFrameworks } = options;
    
    const hasSelectedFrameworks = selectedFrameworks.iso27001 || 
                                 selectedFrameworks.iso27002 || 
                                 selectedFrameworks.dora || 
                                 selectedFrameworks.gdpr || 
                                 selectedFrameworks.cisControls || 
                                 selectedFrameworks.nis2;
                                 
    if (!hasSelectedFrameworks) {
      return { valid: false, error: 'No frameworks selected for export' };
    }
    
    return { valid: true };
  }

  /**
   * Generate enhanced content for all categories
   */
  private async generateEnhancedContent(options: PDFExportOptions): Promise<Map<string, any[]>> {
    console.log('[PDF Service] Generating enhanced content...');
    
    const newGeneratedContent = new Map();
    
    for (const mapping of options.filteredUnifiedMappings) {
      const categoryName = mapping.category.replace(/^\d+\. /, '');
      
      try {
        const content = await options.generateDynamicContentForCategory(categoryName);
        if (content && content.length > 0) {
          newGeneratedContent.set(categoryName, content);
          console.log(`[PDF Service] Generated ${content.length} sections for ${categoryName}`);
        }
      } catch (error) {
        console.error(`[PDF Service] Failed to generate content for ${categoryName}:`, error);
      }
    }
    
    console.log(`[PDF Service] Content generation completed: ${newGeneratedContent.size} categories`);
    return newGeneratedContent;
  }

  /**
   * Create professional PDF document with corporate styling
   */
  private createProfessionalDocument(): jsPDF {
    return new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [ProfessionalPDFExportService.PAGE_WIDTH, ProfessionalPDFExportService.PAGE_HEIGHT],
      compress: true,
      putOnlyUsedFonts: true
    });
  }

  /**
   * Generate all document sections
   */
  private async generateDocumentSections(
    doc: jsPDF, 
    options: PDFExportOptions, 
    contentToUse: Map<string, any[]>
  ): Promise<void> {
    
    // 1. Title Page
    this.generateTitlePage(doc, options);
    
    // 2. Executive Summary
    this.generateExecutiveSummary(doc, options, contentToUse);
    
    // 3. Framework Overview
    this.generateFrameworkOverview(doc, options);
    
    // 4. Requirements Content
    await this.generateRequirementsContent(doc, options, contentToUse);
    
    // 5. Professional Footer
    this.addProfessionalFooter(doc);
  }

  /**
   * Generate professional title page
   */
  private generateTitlePage(doc: jsPDF, options: PDFExportOptions): void {
    const pageWidth = ProfessionalPDFExportService.PAGE_WIDTH;
    const margin = ProfessionalPDFExportService.MARGIN;
    
    // Corporate header with gradient effect
    doc.setFillColor(...ProfessionalPDFExportService.COLORS.primary);
    doc.rect(0, 0, pageWidth, 80, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text('Compliance Simplification Report', pageWidth / 2, 35, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Professional Enterprise Analysis', pageWidth / 2, 55, { align: 'center' });
    
    // Organization name
    if (options.organizationName) {
      doc.setFontSize(14);
      doc.text(`Prepared for: ${options.organizationName}`, pageWidth / 2, 70, { align: 'center' });
    }
    
    // Date and frameworks
    doc.setTextColor(...ProfessionalPDFExportService.COLORS.text);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    doc.text(`Generated: ${today}`, margin, 110);
    
    // Selected frameworks list
    const selectedFrameworksList = this.getSelectedFrameworksList(options.selectedFrameworks);
    doc.setFont('helvetica', 'bold');
    doc.text('Selected Frameworks:', margin, 130);
    
    doc.setFont('helvetica', 'normal');
    selectedFrameworksList.forEach((framework, index) => {
      doc.text(`• ${framework}`, margin + 5, 145 + (index * 8));
    });
  }

  /**
   * Generate executive summary
   */
  private generateExecutiveSummary(
    doc: jsPDF, 
    options: PDFExportOptions, 
    contentToUse: Map<string, any[]>
  ): void {
    doc.addPage();
    
    const margin = ProfessionalPDFExportService.MARGIN;
    let currentY = 30;
    
    // Section header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...ProfessionalPDFExportService.COLORS.primary);
    doc.text('Executive Summary', margin, currentY);
    
    currentY += 20;
    
    // Key metrics
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(...ProfessionalPDFExportService.COLORS.text);
    
    const stats = this.calculateStats(contentToUse, options.filteredUnifiedMappings);
    
    const summaryText = [
      `This report analyzes compliance requirements across ${stats.categoriesProcessed} key areas,`,
      `providing unified guidance for ${stats.contentGenerated} specific requirements.`,
      '',
      'Key Benefits:',
      '• Eliminates duplicate requirements across frameworks',
      '• Provides actionable implementation guidance',
      '• Reduces compliance complexity by up to 70%',
      '• Ensures comprehensive coverage across all selected standards'
    ];
    
    summaryText.forEach((line, index) => {
      if (line.startsWith('•')) {
        doc.setFont('helvetica', 'normal');
        doc.text(line, margin + 5, currentY + (index * 8));
      } else if (line === 'Key Benefits:') {
        doc.setFont('helvetica', 'bold');
        doc.text(line, margin, currentY + (index * 8));
      } else {
        doc.setFont('helvetica', 'normal');
        doc.text(line, margin, currentY + (index * 8));
      }
    });
  }

  /**
   * Generate framework overview section
   */
  private generateFrameworkOverview(doc: jsPDF, options: PDFExportOptions): void {
    const margin = ProfessionalPDFExportService.MARGIN;
    let currentY = 120;
    
    // Section header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...ProfessionalPDFExportService.COLORS.primary);
    doc.text('Framework Analysis', margin, currentY);
    
    currentY += 15;
    
    // Framework descriptions
    const frameworkDescriptions = this.getFrameworkDescriptions();
    const selectedFrameworks = this.getSelectedFrameworksList(options.selectedFrameworks);
    
    selectedFrameworks.forEach((framework) => {
      const description = frameworkDescriptions[framework] || 'Comprehensive compliance framework';
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(framework, margin, currentY);
      
      currentY += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(description, margin + 5, currentY);
      
      currentY += 12;
    });
  }

  /**
   * Generate detailed requirements content
   */
  private async generateRequirementsContent(
    doc: jsPDF,
    options: PDFExportOptions,
    contentToUse: Map<string, any[]>
  ): Promise<void> {
    
    for (const mapping of options.filteredUnifiedMappings) {
      // Add new page for each major category
      doc.addPage();
      
      const categoryName = mapping.category.replace(/^\d+\. /, '');
      const dynamicContent = contentToUse.get(categoryName) || [];
      
      await this.generateCategorySection(doc, mapping, dynamicContent);
    }
  }

  /**
   * Generate individual category section
   */
  private async generateCategorySection(
    doc: jsPDF,
    mapping: ComplianceMappingData,
    dynamicContent: any[]
  ): Promise<void> {
    
    const margin = ProfessionalPDFExportService.MARGIN;
    let currentY = 30;
    
    // Category header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...ProfessionalPDFExportService.COLORS.primary);
    doc.text(mapping.category, margin, currentY);
    
    currentY += 15;
    
    // Category description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...ProfessionalPDFExportService.COLORS.text);
    
    if (mapping.auditReadyUnified.description) {
      const descLines = doc.splitTextToSize(mapping.auditReadyUnified.description, 180);
      doc.text(descLines, margin, currentY);
      currentY += descLines.length * 6 + 10;
    }
    
    // Enhanced requirements content
    if (dynamicContent.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Implementation Requirements:', margin, currentY);
      currentY += 10;
      
      dynamicContent.forEach((content, index) => {
        if (currentY > 250) {
          doc.addPage();
          currentY = 30;
        }
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        const cleanContent = this.cleanContentForPDF(content);
        const contentLines = doc.splitTextToSize(cleanContent, 180);
        doc.text(contentLines, margin, currentY);
        currentY += contentLines.length * 5 + 8;
      });
    }
  }

  /**
   * Clean content for PDF display
   */
  private cleanContentForPDF(content: string): string {
    return content
      .replace(/\*\*/g, '') // Remove markdown bold
      .replace(/✅\s*/g, '') // Remove checkmarks
      .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
      .trim();
  }

  /**
   * Add professional footer to all pages
   */
  private addProfessionalFooter(doc: jsPDF): void {
    const pageCount = doc.getNumberOfPages();
    const pageWidth = ProfessionalPDFExportService.PAGE_WIDTH;
    const pageHeight = ProfessionalPDFExportService.PAGE_HEIGHT;
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(...ProfessionalPDFExportService.COLORS.border);
      doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
      
      // Footer text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...ProfessionalPDFExportService.COLORS.textLight);
      
      doc.text('AuditReady.com - Professional Compliance Management', 15, pageHeight - 12);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 15, pageHeight - 12, { align: 'right' });
    }
  }

  /**
   * Get selected frameworks list with proper formatting
   */
  private getSelectedFrameworksList(selectedFrameworks: SelectedFrameworks): string[] {
    return Object.entries(selectedFrameworks)
      .filter(([_, selected]) => selected !== false && selected !== null)
      .map(([framework, value]) => {
        const frameworkWithVersion = {
          'iso27001': 'ISO 27001:2022',
          'iso27002': 'ISO 27002:2022',
          'nis2': 'NIS2 Directive 2024',
          'gdpr': 'GDPR 2018',
          'dora': 'DORA 2024',
          'cisControls': value === 'ig1' ? 'CIS Controls v8 (IG1)' :
                         value === 'ig2' ? 'CIS Controls v8 (IG2)' :
                         value === 'ig3' ? 'CIS Controls v8 (IG3)' : 'CIS Controls v8'
        }[framework] || framework;
        
        return frameworkWithVersion;
      });
  }

  /**
   * Get framework descriptions
   */
  private getFrameworkDescriptions(): Record<string, string> {
    return {
      'ISO 27001:2022': 'International standard for information security management systems',
      'ISO 27002:2022': 'Code of practice for information security controls',
      'NIS2 Directive 2024': 'EU directive on network and information systems security',
      'GDPR 2018': 'EU General Data Protection Regulation for data privacy',
      'DORA 2024': 'Digital Operational Resilience Act for financial services',
      'CIS Controls v8 (IG1)': 'Center for Internet Security Controls - Implementation Group 1',
      'CIS Controls v8 (IG2)': 'Center for Internet Security Controls - Implementation Group 2',
      'CIS Controls v8 (IG3)': 'Center for Internet Security Controls - Implementation Group 3',
      'CIS Controls v8': 'Center for Internet Security Controls - Basic implementation'
    };
  }

  /**
   * Generate professional filename
   */
  private generateFilename(selectedFrameworks: SelectedFrameworks): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const frameworksList = this.getSelectedFrameworksList(selectedFrameworks);
    const frameworkSuffix = frameworksList.length > 0 
      ? `_${frameworksList.join('_').replace(/[^a-zA-Z0-9]/g, '_')}` 
      : '';
    
    return `AuditReady_Professional_Compliance_Report_${timestamp}${frameworkSuffix}.pdf`;
  }

  /**
   * Calculate generation statistics
   */
  private calculateStats(
    contentToUse: Map<string, any[]>, 
    filteredMappings: ComplianceMappingData[]
  ): { categoriesProcessed: number; contentGenerated: number; fileSize: string } {
    
    const categoriesProcessed = filteredMappings.length;
    const contentGenerated = Array.from(contentToUse.values()).reduce((total, arr) => total + arr.length, 0);
    
    return {
      categoriesProcessed,
      contentGenerated,
      fileSize: 'Estimated 2-5MB' // Placeholder - actual size would need file analysis
    };
  }
}

// Export singleton instance
export const professionalPDFExportService = new ProfessionalPDFExportService();