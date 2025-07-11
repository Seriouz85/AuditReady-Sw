import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from './toast';
import { UnifiedAssessmentData } from '@/components/assessments/UnifiedAssessmentTemplate';
import { AssessmentDataProcessor } from '@/services/assessments/AssessmentDataProcessor';

/**
 * OptimizedPdfGenerator
 * 
 * High-performance PDF generation without html2canvas.
 * Creates small, professional PDF files with consistent formatting.
 * 
 * Performance improvements:
 * - No DOM rendering or image capture
 * - Direct PDF generation with jsPDF
 * - Optimized table generation
 * - Small file sizes (<2MB)
 */
export class OptimizedPdfGenerator {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageWidth: number;
  private pageHeight: number;
  private margins = { top: 20, bottom: 20, left: 20, right: 20 };
  
  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
  }
  
  /**
   * Generate optimized PDF from unified assessment data
   */
  static async generateAssessmentPDF(data: UnifiedAssessmentData): Promise<void> {
    try {
      const generator = new OptimizedPdfGenerator();
      
      // Generate PDF content
      generator.generateHeader(data);
      generator.generateMetadata(data);
      generator.generateSummarySection(data);
      generator.generateMetricsSection(data);
      
      if (data.config.showRequirements) {
        generator.generateRequirementsSection(data);
      }
      
      generator.generateFooter(data);
      
      // Generate filename and save
      const filename = AssessmentDataProcessor.generateExportFilename(
        data.assessment.name,
        'pdf'
      );
      
      generator.doc.save(filename);
      toast.success('PDF exported successfully!');
      
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
      throw error;
    }
  }
  
  /**
   * Generate professional header section
   */
  private generateHeader(data: UnifiedAssessmentData): void {
    const { assessment, standards } = data;
    
    // Header background
    this.doc.setFillColor(30, 41, 59); // slate-900
    this.doc.rect(0, 0, this.pageWidth, 50, 'F');
    
    // Company branding
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('AuditReady Security Platform', this.margins.left, 15);
    
    // Confidentiality marking
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('CONFIDENTIAL - ASSESSMENT REPORT', this.pageWidth - this.margins.right, 15, { align: 'right' });
    
    // Assessment title
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    const titleLines = this.doc.splitTextToSize(assessment.name, this.pageWidth - 40);
    this.doc.text(titleLines, this.margins.left, 30);
    
    // Standards
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    const standardsText = standards.map(s => `${s.name} ${s.version}`).join(' | ');
    const standardsLines = this.doc.splitTextToSize(standardsText, this.pageWidth - 40);
    this.doc.text(standardsLines, this.margins.left, 42);
    
    this.currentY = 60;
  }
  
  /**
   * Generate assessment metadata section
   */
  private generateMetadata(data: UnifiedAssessmentData): void {
    const { assessment, metrics } = data;
    
    this.checkPageBreak(40);
    
    // Metadata table
    const metadataRows = [
      ['Assessor', assessment.assessorNames?.join(', ') || assessment.assessorName || 'Not Assigned'],
      ['Status', assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)],
      ['Compliance Score', `${metrics.complianceScore}%`],
      ['Start Date', assessment.startDate ? new Date(assessment.startDate).toLocaleDateString() : 'Not Set'],
      ['Last Updated', new Date(assessment.updatedAt).toLocaleDateString()],
      ['Generated', new Date().toLocaleDateString()]
    ];
    
    if (assessment.endDate) {
      metadataRows.splice(4, 0, ['Completion Date', new Date(assessment.endDate).toLocaleDateString()]);
    }
    
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Field', 'Value']],
      body: metadataRows,
      theme: 'grid',
      styles: { 
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: { 
        fillColor: [71, 85, 105], // slate-600
        textColor: [255, 255, 255]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // slate-50
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 'auto' }
      }
    });
    
    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }
  
  /**
   * Generate assessment summary section
   */
  private generateSummarySection(data: UnifiedAssessmentData): void {
    const { assessment, attachments } = data;
    
    this.checkPageBreak(80);
    
    // Section header
    this.addSectionHeader('ASSESSMENT SUMMARY');
    
    // Assessment Notes
    if (assessment.notes) {
      this.addSubsectionHeader('1. Assessment Notes');
      this.addTextContent(AssessmentDataProcessor.cleanTextForExport(assessment.notes));
    }
    
    // Evidence
    if (assessment.evidence) {
      this.addSubsectionHeader('2. Evidence Collection');
      this.addTextContent(AssessmentDataProcessor.cleanTextForExport(assessment.evidence));
    }
    
    // Attachments
    if (attachments.length > 0) {
      this.addSubsectionHeader('3. Attached Evidence Documents');
      
      const attachmentRows = attachments.map(att => [
        att.filename,
        att.description,
        att.size || 'N/A',
        att.type || 'Document'
      ]);
      
      autoTable(this.doc, {
        startY: this.currentY,
        head: [['File Name', 'Description', 'Size', 'Type']],
        body: attachmentRows,
        theme: 'striped',
        styles: { 
          fontSize: 9,
          cellPadding: 3
        },
        headStyles: { 
          fillColor: [180, 83, 9], // amber-600
          textColor: [255, 255, 255]
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 80 },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' }
        }
      });
      
      this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
    }
  }
  
  /**
   * Generate metrics section with visual indicators
   */
  private generateMetricsSection(data: UnifiedAssessmentData): void {
    const { metrics } = data;
    
    this.checkPageBreak(60);
    
    // Section header
    this.addSectionHeader('COMPLIANCE METRICS');
    
    // Metrics table
    const metricsRows = [
      ['Fulfilled', metrics.fulfilled.toString(), `${Math.round((metrics.fulfilled / metrics.totalRequirements) * 100)}%`],
      ['Partially Fulfilled', metrics.partiallyFulfilled.toString(), `${Math.round((metrics.partiallyFulfilled / metrics.totalRequirements) * 100)}%`],
      ['Not Fulfilled', metrics.notFulfilled.toString(), `${Math.round((metrics.notFulfilled / metrics.totalRequirements) * 100)}%`],
      ['Not Applicable', metrics.notApplicable.toString(), `${Math.round((metrics.notApplicable / metrics.totalRequirements) * 100)}%`],
      ['TOTAL', metrics.totalRequirements.toString(), '100%']
    ];
    
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Status', 'Count', 'Percentage']],
      body: metricsRows,
      theme: 'grid',
      styles: { 
        fontSize: 11,
        cellPadding: 4
      },
      headStyles: { 
        fillColor: [71, 85, 105], // slate-600
        textColor: [255, 255, 255],
        fontSize: 12,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // slate-50
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { halign: 'center', cellWidth: 30 },
        2: { halign: 'center', cellWidth: 30 }
      },
      didParseCell: (data) => {
        // Color code status rows
        if (data.section === 'body' && data.column.index === 0) {
          const status = data.cell.text[0].toLowerCase();
          if (status.includes('fulfilled') && !status.includes('not')) {
            data.cell.styles.textColor = [21, 128, 61]; // green-700
          } else if (status.includes('partially')) {
            data.cell.styles.textColor = [217, 119, 6]; // amber-600
          } else if (status.includes('not fulfilled')) {
            data.cell.styles.textColor = [220, 38, 38]; // red-600
          } else if (status.includes('not applicable')) {
            data.cell.styles.textColor = [107, 114, 128]; // gray-500
          } else if (status.includes('total')) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [226, 232, 240]; // slate-200
          }
        }
      }
    });
    
    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }
  
  /**
   * Generate detailed requirements section
   */
  private generateRequirementsSection(data: UnifiedAssessmentData): void {
    const { requirementsBySection } = data;
    
    this.checkPageBreak(60);
    
    // Section header
    this.addSectionHeader('DETAILED REQUIREMENTS ANALYSIS');
    
    Object.entries(requirementsBySection).forEach(([section, requirements]) => {
      this.checkPageBreak(50);
      
      // Section header
      this.doc.setFillColor(30, 41, 59); // slate-900
      this.doc.rect(this.margins.left, this.currentY, this.pageWidth - 40, 12, 'F');
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(section, this.margins.left + 5, this.currentY + 8);
      this.doc.setFontSize(10);
      this.doc.text(`${requirements.length} requirement${requirements.length !== 1 ? 's' : ''}`, 
                   this.pageWidth - this.margins.right - 5, this.currentY + 8, { align: 'right' });
      
      this.currentY += 18;
      
      // Requirements cards (limit to first 10 per section for performance)
      const displayRequirements = requirements.slice(0, 10);
      
      displayRequirements.forEach(req => {
        this.checkPageBreak(35);
        
        // Requirement card
        this.doc.setDrawColor(226, 232, 240); // border-slate-200
        this.doc.setLineWidth(0.5);
        this.doc.rect(this.margins.left, this.currentY, this.pageWidth - 40, 30, 'S');
        
        // Code badge
        this.doc.setFillColor(241, 245, 249); // bg-slate-100
        this.doc.rect(this.margins.left + 3, this.currentY + 3, 20, 10, 'F');
        this.doc.setTextColor(51, 65, 85); // text-slate-700
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(req.code, this.margins.left + 13, this.currentY + 9, { align: 'center' });
        
        // Requirement name
        this.doc.setTextColor(15, 23, 42); // text-slate-900
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'bold');
        const nameLines = this.doc.splitTextToSize(req.name, 100);
        this.doc.text(nameLines.slice(0, 2), this.margins.left + 28, this.currentY + 7);
        
        // Status badge
        const statusColor = this.getStatusColor(req.status);
        this.doc.setFillColor(statusColor.r, statusColor.g, statusColor.b);
        this.doc.rect(this.pageWidth - this.margins.right - 30, this.currentY + 3, 25, 8, 'F');
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(req.status.replace('-', ' ').toUpperCase(), 
                     this.pageWidth - this.margins.right - 17.5, this.currentY + 8, { align: 'center' });
        
        // Description
        this.doc.setTextColor(71, 85, 105); // text-slate-600
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        const descLines = this.doc.splitTextToSize(req.description, this.pageWidth - 50);
        this.doc.text(descLines.slice(0, 2), this.margins.left + 3, this.currentY + 17);
        
        // Notes (if any)
        if (req.notes) {
          this.doc.setFontSize(8);
          this.doc.setFont('helvetica', 'bold');
          this.doc.setTextColor(59, 130, 246); // blue-500
          this.doc.text('Notes:', this.margins.left + 3, this.currentY + 26);
          
          this.doc.setFont('helvetica', 'normal');
          this.doc.setTextColor(71, 85, 105);
          const notesLines = this.doc.splitTextToSize(req.notes, this.pageWidth - 60);
          this.doc.text(notesLines.slice(0, 1), this.margins.left + 18, this.currentY + 26);
        }
        
        this.currentY += 35;
      });
      
      // Note if there are more requirements
      if (requirements.length > 10) {
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'italic');
        this.doc.setTextColor(107, 114, 128); // gray-500
        this.doc.text(`Note: Showing first 10 of ${requirements.length} requirements in this section`, 
                     this.margins.left, this.currentY);
        this.currentY += 10;
      }
      
      this.currentY += 10; // Space between sections
    });
  }
  
  /**
   * Generate footer on all pages
   */
  private generateFooter(data: UnifiedAssessmentData): void {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Footer line
      this.doc.setDrawColor(203, 213, 224); // border-slate-300
      this.doc.setLineWidth(0.5);
      this.doc.line(this.margins.left, this.pageHeight - 25, this.pageWidth - this.margins.right, this.pageHeight - 25);
      
      // Footer content
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(107, 114, 128); // gray-500
      
      // Left side - confidentiality
      this.doc.text('CONFIDENTIAL - This assessment report is proprietary and confidential', 
                   this.margins.left, this.pageHeight - 15);
      
      // Right side - page number
      this.doc.text(`Page ${i} of ${pageCount}`, 
                   this.pageWidth - this.margins.right, this.pageHeight - 15, { align: 'right' });
      
      // Center - generated by
      this.doc.text('Generated by AuditReady Security Platform', 
                   this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });
    }
  }
  
  /**
   * Helper methods
   */
  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - 30) {
      this.doc.addPage();
      this.currentY = this.margins.top;
    }
  }
  
  private addSectionHeader(title: string): void {
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(30, 41, 59); // slate-900
    this.doc.text(title, this.margins.left, this.currentY);
    
    // Underline
    this.doc.setDrawColor(148, 163, 184); // slate-400
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margins.left, this.currentY + 2, this.margins.left + 100, this.currentY + 2);
    
    this.currentY += 12;
  }
  
  private addSubsectionHeader(title: string): void {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(51, 65, 85); // slate-700
    this.doc.text(title, this.margins.left, this.currentY);
    this.currentY += 8;
  }
  
  private addTextContent(text: string): void {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(71, 85, 105); // slate-600
    
    const lines = this.doc.splitTextToSize(text, this.pageWidth - 50);
    this.doc.text(lines, this.margins.left + 5, this.currentY);
    this.currentY += lines.length * 4 + 8;
  }
  
  private getStatusColor(status: string): { r: number; g: number; b: number } {
    switch (status.toLowerCase()) {
      case 'fulfilled':
        return { r: 16, g: 185, b: 129 }; // emerald-500
      case 'partially-fulfilled':
        return { r: 245, g: 158, b: 11 }; // amber-500
      case 'not-fulfilled':
        return { r: 239, g: 68, b: 68 }; // red-500
      case 'not-applicable':
        return { r: 107, g: 114, b: 128 }; // gray-500
      default:
        return { r: 71, g: 85, b: 105 }; // slate-600
    }
  }
}

export default OptimizedPdfGenerator;