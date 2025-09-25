// Extracted export functionality from ComplianceSimplification.tsx
// PRESERVES ALL EXISTING LOGIC EXACTLY - just moved to service

import * as ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cleanMarkdownFormatting } from '@/utils/textFormatting';
import { EnhancedUnifiedGuidanceService } from '../EnhancedUnifiedGuidanceService';

// Type declaration for jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

export interface ExportData {
  filteredUnifiedMappings: any[];
  selectedFrameworks: any;
  selectedIndustrySector?: string | null;
  industrySectors?: any[];
}

export class ComplianceExportService {
  
  // Export to Excel - EXACT preservation from original file
  static async exportToExcel(data: ExportData): Promise<void> {
    try {
      console.log('[EXCEL EXPORT] Starting Excel export...');
      
      const { filteredUnifiedMappings, selectedFrameworks, selectedIndustrySector } = data;
      
      // Create workbook with multiple sheets using ExcelJS (secure replacement for xlsx)
      const workbook = new ExcelJS.Workbook();
      
      // Sheet 1: Summary
      const summarySheet = workbook.addWorksheet('Summary');
      
      // Add summary data
      const summaryRows = [
        ['AuditReady Compliance Simplification Report'],
        ['Generated on:', new Date().toLocaleDateString()],
        [''],
        ['Selected Frameworks:'],
        ...(selectedFrameworks.iso27001 ? [['✓ ISO 27001']] : []),
        ...(selectedFrameworks.iso27002 ? [['✓ ISO 27002']] : []),
        ...(selectedFrameworks.cisControls ? [['✓ CIS Controls ' + selectedFrameworks.cisControls.toUpperCase()]] : []),
        ...(selectedFrameworks.gdpr ? [['✓ GDPR']] : []),
        ...(selectedFrameworks.nis2 ? [['✓ NIS2']] : []),
        ...(selectedFrameworks.dora ? [['✓ DORA']] : []),
        [''],
        ['Total Unified Groups:', filteredUnifiedMappings.length]
      ];
      
      summaryRows.forEach(row => {
        summarySheet.addRow(row);
      });
      
      // Sheet 2: Unified Requirements
      const requirementsSheet = workbook.addWorksheet('Unified Requirements');
      
      // Add header row
      requirementsSheet.addRow(['Category', 'Description', 'Sub-Requirements Count', 'Framework Coverage']);
      
      filteredUnifiedMappings.forEach(mapping => {
        const frameworkCoverage = [];
        if (selectedFrameworks.iso27001 && mapping.frameworks?.iso27001?.length > 0) {
          frameworkCoverage.push('ISO 27001');
        }
        if (selectedFrameworks.iso27002 && mapping.frameworks?.iso27002?.length > 0) {
          frameworkCoverage.push('ISO 27002');
        }
        if (selectedFrameworks.cisControls && mapping.frameworks?.cisControls?.length > 0) {
          frameworkCoverage.push('CIS Controls');
        }
        if (selectedFrameworks.gdpr && mapping.frameworks?.gdpr?.length > 0) {
          frameworkCoverage.push('GDPR');
        }
        if (selectedFrameworks.nis2 && mapping.frameworks?.nis2?.length > 0) {
          frameworkCoverage.push('NIS2');
        }
        if (selectedFrameworks.dora && mapping.frameworks?.dora?.length > 0) {
          frameworkCoverage.push('DORA');
        }
        
        requirementsSheet.addRow([
          mapping.category.replace(/^\d+\. /, ''),
          cleanMarkdownFormatting(mapping.auditReadyUnified?.description || ''),
          mapping.auditReadyUnified?.subRequirements?.length || 0,
          frameworkCoverage.join(', ')
        ]);
      });
      
      // Sheet 3: Detailed Sub-Requirements
      const detailsSheet = workbook.addWorksheet('Detailed Requirements');
      
      // Add header row
      detailsSheet.addRow(['Category', 'Sub-Requirement', 'Description']);
      
      filteredUnifiedMappings.forEach(mapping => {
        const categoryName = mapping.category.replace(/^\d+\. /, '');
        if (mapping.auditReadyUnified?.subRequirements) {
          mapping.auditReadyUnified.subRequirements.forEach((subReq: any) => {
            detailsSheet.addRow([
              categoryName,
              subReq.title || '',
              cleanMarkdownFormatting(subReq.description || '')
            ]);
          });
        }
      });
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const frameworks = [];
      if (selectedFrameworks.iso27001) frameworks.push('ISO27001');
      if (selectedFrameworks.iso27002) frameworks.push('ISO27002');
      if (selectedFrameworks.cisControls) frameworks.push('CIS');
      if (selectedFrameworks.gdpr) frameworks.push('GDPR');
      if (selectedFrameworks.nis2) frameworks.push('NIS2');
      if (selectedFrameworks.dora) frameworks.push('DORA');
      
      const filename = `AuditReady_Compliance_${frameworks.join('_')}_${timestamp}.xlsx`;
      
      // Write file securely using ExcelJS
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
      console.log('[EXCEL EXPORT] Excel file exported successfully:', filename);
      
    } catch (error) {
      console.error('[EXCEL EXPORT] Error exporting to Excel:', error);
      throw error;
    }
  }

  // Export to PDF - EXACT preservation from original file with all formatting
  static async exportToPDF(data: ExportData): Promise<void> {
    try {
      console.log('[PDF EXPORT] Starting PDF export...');
      
      const { filteredUnifiedMappings, selectedFrameworks, selectedIndustrySector, industrySectors } = data;
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // PDF Configuration
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let currentY = margin;

      // Helper function to add new page if needed
      const checkPageBreak = (requiredHeight: number = 20) => {
        if (currentY + requiredHeight > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
          return true;
        }
        return false;
      };

      // Helper function to process requirement text
      const processRequirementText = (req: any, addLettering: boolean = false): string => {
        if (!req) return '';
        
        let text = '';
        if (req.title && req.description) {
          text = `${req.title}: ${req.description}`;
        } else if (req.title) {
          text = req.title;
        } else if (req.description) {
          text = req.description;
        } else if (typeof req === 'string') {
          text = req;
        }
        
        // Clean markdown and normalize text
        text = cleanMarkdownFormatting(text);
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
      };

      // Cover Page
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('AuditReady Compliance Report', pageWidth / 2, currentY + 20, { align: 'center' });
      
      currentY += 40;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('Unified Requirements', pageWidth / 2, currentY, { align: 'center' });
      
      currentY += 30;
      doc.setFontSize(12);
      const selectedFrameworksList = [];
      if (selectedFrameworks.iso27001) selectedFrameworksList.push('ISO 27001');
      if (selectedFrameworks.iso27002) selectedFrameworksList.push('ISO 27002');
      if (selectedFrameworks.cisControls) selectedFrameworksList.push(`CIS Controls ${selectedFrameworks.cisControls.toUpperCase()}`);
      if (selectedFrameworks.gdpr) selectedFrameworksList.push('GDPR');
      if (selectedFrameworks.nis2) selectedFrameworksList.push('NIS2');
      if (selectedFrameworks.dora) selectedFrameworksList.push('DORA');
      
      doc.text(`Selected Frameworks: ${selectedFrameworksList.join(', ')}`, pageWidth / 2, currentY, { align: 'center' });
      
      currentY += 20;
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, currentY, { align: 'center' });
      
      currentY += 20;
      doc.text(`Total Unified Groups: ${filteredUnifiedMappings.length}`, pageWidth / 2, currentY, { align: 'center' });

      // Executive Summary
      doc.addPage();
      currentY = margin;
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', margin, currentY);
      currentY += 15;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const executiveSummary = [
        ['• Strategic Overview:', 'This report consolidates multiple compliance frameworks'],
        ['✓ Unified Guidance:', 'Consolidated implementation roadmap'],
        ['📊 Efficiency Gains:', `${filteredUnifiedMappings.length} unified groups vs. hundreds of scattered requirements`],
        ['🎯 Focus Areas:', 'Streamlined approach reduces complexity by up to 70%'],
        ['• Executive Review:', 'Focus on streamlined Category and Unified Requirements'],
        ['📋 Implementation:', 'Each category provides comprehensive guidance'],
        ['• Audit Preparation:', 'Reference unified requirements for implementation'],
        ['✅ Compliance Coverage:', 'All framework requirements preserved and mapped']
      ];

      executiveSummary.forEach(([label, description]) => {
        checkPageBreak(8);
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(description, margin + 35, currentY);
        currentY += 7;
      });

      // Framework Overview
      checkPageBreak(40);
      currentY += 10;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Framework Coverage', margin, currentY);
      currentY += 10;

      const frameworkOverview = [
        '🎯 Unified Requirements'
      ];

      frameworkOverview.forEach(item => {
        checkPageBreak(6);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(item, margin, currentY);
        currentY += 6;
      });

      // Use the simplified structure: Category, Unified Requirements (only 2 columns for cleaner PDF)
      const allHeaders = ['CATEGORY', '🎯 UNIFIED REQUIREMENTS'];
      
      const allData: any[] = [];
      
      // Process each mapping
      for (const mapping of filteredUnifiedMappings) {
        console.log(`[PDF] Processing mapping: ${mapping.category}`);
        
        const cleanTitle = mapping.category.replace(/^\d+\. /, '');
        
        // Get unified requirements (sub-requirements) - preserve formatting
        const unifiedRequirements = (mapping.auditReadyUnified?.subRequirements || [])
          .map((req: any, index: number) => {
            const letter = String.fromCharCode(97 + index); // a, b, c, d...
            const reqText = processRequirementText(req, true);
            return reqText ? `${letter}) ${reqText}` : '';
          })
          .filter((req: string) => req.trim().length > 0);

        // Get unified guidance content using the enhanced service
        let unifiedGuidance = '';
        try {
          const guidanceContent = await EnhancedUnifiedGuidanceService.getEnhancedGuidance(
            cleanTitle,
            selectedFrameworks,
            selectedIndustrySector,
            mapping
          );
          
          unifiedGuidance = cleanMarkdownFormatting(
            guidanceContent || 'Detailed implementation guidance available in application interface'
          );
        } catch (error) {
          console.warn(`[PDF] Could not get guidance for ${cleanTitle}:`, error);
        }

        // Format final requirements text with proper line breaks and structure
        let finalRequirements = '';
        
        if (unifiedRequirements.length > 0) {
          // Group requirements logically for better readability
          const groupedRequirements: { [key: string]: string[] } = {};
          
          // Smart grouping based on content patterns
          unifiedRequirements.forEach((req, index) => {
            const letter = String.fromCharCode(97 + index);
            const reqText = req.replace(/^[a-z]\)\s*/, ''); // Remove letter prefix for analysis
            
            // Determine group based on content
            let groupName = 'Core Requirements';
            if (reqText.toLowerCase().includes('monitor') || reqText.toLowerCase().includes('review') || 
                reqText.toLowerCase().includes('audit') || reqText.toLowerCase().includes('compliance')) {
              groupName = 'Monitoring & Compliance';
            } else if (reqText.toLowerCase().includes('personnel') || reqText.toLowerCase().includes('training') || 
                      reqText.toLowerCase().includes('competence') || reqText.toLowerCase().includes('awareness')) {
              groupName = 'Human Resources';
            } else if (reqText.toLowerCase().includes('implement') || reqText.toLowerCase().includes('establish') || 
                      reqText.toLowerCase().includes('maintain') || reqText.toLowerCase().includes('procedure')) {
              groupName = 'Implementation Standards';
            }
            
            if (!groupedRequirements[groupName]) {
              groupedRequirements[groupName] = [];
            }
            groupedRequirements[groupName].push(req);
          });

          // Build formatted output with groups
          const groupOrder = ['Core Requirements', 'Implementation Standards', 'Human Resources', 'Monitoring & Compliance'];
          
          Object.keys(groupedRequirements).sort((a, b) => {
            const aIndex = groupOrder.indexOf(a);
            const bIndex = groupOrder.indexOf(b);
            if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
          }).forEach((groupName, groupIndex) => {
            const requirements = groupedRequirements[groupName];
            if (requirements.length > 0) {
              if (groupIndex > 0) finalRequirements += '\n\n';
              finalRequirements += `**${groupName.toUpperCase()}:**\n\n`;
              requirements.forEach(req => {
                finalRequirements += processRequirementText(req, false);
                finalRequirements += '\n\n';
              });
            }
          });
        }

        if (!finalRequirements.trim()) {
          if (mapping.auditReadyUnified?.description) {
            finalRequirements = `a) ${cleanTitle}`;
          } else {
            finalRequirements = 'Complete unified requirements available in application interface';
          }
        }

        // Ensure finalRequirements is properly set if still empty
        if (!finalRequirements.trim()) {
          finalRequirements = unifiedRequirements
            .map(req => processRequirementText(req, false))
            .join('\n\n')
            .trim();
        }

        // Enhanced guidance processing is already done above, no need to repeat

        allData.push([
          cleanTitle,
          finalRequirements || 'Complete unified requirements available in application interface'
        ]);
      }

      // Create the main table
      doc.addPage();
      currentY = margin;
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Unified Requirements Details', margin, currentY);
      currentY += 15;

      // Enhanced autoTable configuration for better formatting
      autoTable(doc, {
        head: [allHeaders],
        body: allData,
        startY: currentY,
        margin: { left: margin, right: margin },
        tableWidth: 'auto',
        columnStyles: {
          0: { 
            cellWidth: 60, // Category - narrower to give more space to requirements
            fontSize: 10,
            fontStyle: 'bold',
            fillColor: [240, 248, 255],
            textColor: [25, 25, 112],
            halign: 'left',
            valign: 'top'
          },
          1: { 
            cellWidth: 130, // Unified Requirements - much wider to use full page width
            fontSize: 9,
            fillColor: [248, 250, 252],
            textColor: [30, 30, 30],
            halign: 'left',
            valign: 'top',
            cellPadding: { top: 5, right: 5, bottom: 5, left: 5 }
          }
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: 'bold',
          halign: 'center',
          minCellHeight: 12
        },
        styles: {
          fontSize: 9,
          cellPadding: { top: 4, right: 4, bottom: 4, left: 4 },
          overflow: 'linebreak',
          lineColor: [200, 200, 200],
          lineWidth: 0.5
        },
        alternateRowStyles: {
          fillColor: [252, 252, 252]
        },
        didParseCell: (data) => {
          // Enhanced styling for Unified Requirements column (now column 1)
          if (data.column.index === 1) {
            // Pre-process bold formatting in Unified Guidance column
            const cell = data.cell;
            const text = cell.text.join(' ');
            
            // Handle bold text markers
            if (text.includes('**') || text.includes('CORE REQUIREMENTS') || 
                text.includes('IMPLEMENTATION') || text.includes('MONITORING')) {
              // Split text to handle formatting
              const parts = text.split(/(\*\*[^*]+\*\*|[A-Z][A-Z\s&]+:)/);
              cell.text = parts.map(part => {
                if (part.match(/^\*\*.*\*\*$/) || part.match(/^[A-Z][A-Z\s&]+:$/)) {
                  return part.replace(/\*\*/g, '').toUpperCase();
                }
                return part;
              });
              data.cell.styles.fontStyle = 'bold';
            }
          }
        },
        didDrawPage: (data) => {
          // Add page footer
          const pageNumber = (doc as any).internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text(
            `AuditReady Compliance Report - Page ${pageNumber}`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
          );
        }
      });

      // Report Footer
      const finalY = (doc as any).lastAutoTable?.finalY || currentY + 50;
      
      if (finalY + 60 > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      } else {
        currentY = finalY + 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Report Summary', margin, currentY);
      currentY += 15;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const reportSummary = [
        'This comprehensive compliance report presents unified requirements where multiple regulatory',
        'frameworks overlap. Each unified requirement eliminates duplication while preserving all',
        'necessary controls from the source frameworks.',
        '',
        'Key Benefits:',
        '• Reduced complexity through intelligent requirement consolidation',
        '• Unified requirements combining all selected frameworks',
        '• Complete traceability to source framework controls',
        '• Streamlined implementation guidance',
        '• Professional documentation suitable for audit purposes'
      ];

      reportSummary.forEach(line => {
        checkPageBreak(5);
        if (line.startsWith('•')) {
          doc.text(line, margin + 5, currentY);
        } else if (line === '') {
          currentY += 3;
          return;
        } else {
          doc.text(line, margin, currentY);
        }
        currentY += 5;
      });

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const frameworks = [];
      if (selectedFrameworks.iso27001) frameworks.push('ISO27001');
      if (selectedFrameworks.iso27002) frameworks.push('ISO27002');
      if (selectedFrameworks.cisControls) frameworks.push('CIS');
      if (selectedFrameworks.gdpr) frameworks.push('GDPR');
      if (selectedFrameworks.nis2) frameworks.push('NIS2');
      if (selectedFrameworks.dora) frameworks.push('DORA');
      
      const filename = `AuditReady_Compliance_${frameworks.join('_')}_${timestamp}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      console.log('[PDF EXPORT] PDF exported successfully:', filename);
      
    } catch (error) {
      console.error('[PDF EXPORT] Error exporting to PDF:', error);
      throw error;
    }
  }
}