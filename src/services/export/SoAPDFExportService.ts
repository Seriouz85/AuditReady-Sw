import { Standard } from '@/types';

interface SoAExportData {
  standards: any[];
  requirements: any[];
  organizationName: string;
  exportDate: string;
  version: string;
  preparedBy: string;
  notes?: string;
}

interface LegendDefinition {
  code: string;
  description: string;
}

export class SoAPDFExportService {
  private static readonly LEGEND_DEFINITIONS: LegendDefinition[] = [
    { code: 'REG', description: 'The control is related to a regulatory or certification requirement' },
    { code: 'CON', description: 'The control is required due to contractual obligations' },
    { code: 'BP', description: 'The control is needed according to best practices' },
    { code: 'RC', description: 'The control is needed to mitigate inherent risk to control objectives' },
  ];

  /**
   * Export Statement of Applicability to PDF
   */
  static async exportSoAToPDF(data: SoAExportData): Promise<void> {
    try {
      // Dynamic import to avoid SSR issues
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Sort standards and requirements like in SoA component
      const applicableStandards = data.standards
        .filter((std: any) => std.isApplicable)
        .sort((a: any, b: any) => {
          const aIndex = data.standards.findIndex(s => s.id === a.id);
          const bIndex = data.standards.findIndex(s => s.id === b.id);
          return aIndex - bIndex;
        });
      
      const relevantRequirements = data.requirements.filter((req: any) => {
        return applicableStandards.some((std: any) => {
          const stdId = std.id?.toString().toLowerCase();
          const reqStdId = req.standardId?.toString().toLowerCase();
          return stdId === reqStdId;
        });
      });

      // Sort requirements by standard order, then numerically
      const sortedRequirements = relevantRequirements.sort((a: any, b: any) => {
        // First sort by standard order
        const aStandardIndex = applicableStandards.findIndex((std: any) => 
          std.id?.toString().toLowerCase() === a.standardId?.toString().toLowerCase()
        );
        const bStandardIndex = applicableStandards.findIndex((std: any) => 
          std.id?.toString().toLowerCase() === b.standardId?.toString().toLowerCase()
        );
        
        if (aStandardIndex !== bStandardIndex) {
          return aStandardIndex - bStandardIndex;
        }
        
        // Within same standard, sort numerically by code
        const aCode = String(a.code || '');
        const bCode = String(b.code || '');
        
        const aMatch = aCode.match(/(\d+(?:\.\d+)*)/);
        const bMatch = bCode.match(/(\d+(?:\.\d+)*)/);
        
        if (aMatch && bMatch) {
          const aParts = aMatch[1].split('.').map(Number);
          const bParts = bMatch[1].split('.').map(Number);
          
          for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
            const aPart = aParts[i] || 0;
            const bPart = bParts[i] || 0;
            if (aPart !== bPart) {
              return aPart - bPart;
            }
          }
        }
        
        return aCode.localeCompare(bCode);
      });

      await this.generateSoAPDF(doc, {
        ...data,
        requirements: sortedRequirements,
        standards: applicableStandards
      }, autoTable);

      // Save the PDF
      const fileName = `SoA_${data.organizationName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating SoA PDF:', error);
      throw new Error('Failed to generate SoA PDF');
    }
  }

  /**
   * Generate professional SoA PDF with proper formatting
   */
  private static async generateSoAPDF(doc: any, data: SoAExportData, autoTable: any): Promise<void> {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let currentY = margin;

    // Professional colors
    const primaryColor = [51, 65, 85]; // Slate-700
    const accentColor = [16, 185, 129]; // Emerald-500
    const lightGray = [248, 250, 252]; // Slate-50
    const borderGray = [226, 232, 240]; // Gray-200

    // === HEADER SECTION ===
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, currentY, pageWidth - (margin * 2), 20, 'F');
    
    // Header content - properly aligned within margins
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('AuditReady', margin + 5, currentY + 13);
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`Export Date: ${data.exportDate}`, pageWidth - margin - 5, currentY + 8, { align: 'right' });
    doc.text(`Organization: ${data.organizationName}`, pageWidth - margin - 5, currentY + 16, { align: 'right' });
    
    currentY += 30;

    // === TITLE SECTION ===
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Statement of Applicability (SoA)', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    // Document info section with proper margins
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont(undefined, 'normal');
    doc.text(`Document Version: ${data.version}`, margin, currentY);
    doc.text(`Prepared by: ${data.preparedBy}`, pageWidth - margin, currentY, { align: 'right' });
    currentY += 15;

    // Standards section - better formatted list
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont(undefined, 'bold');
    doc.text('Applicable Standards & Frameworks:', margin, currentY);
    currentY += 8;

    // List standards in a more structured way
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont(undefined, 'normal');
    
    data.standards.forEach((standard, index) => {
      const bulletPoint = `• ${standard.name}`;
      doc.text(bulletPoint, margin + 5, currentY);
      currentY += 5;
    });
    
    currentY += 10;

    // === LEGEND SECTION ===
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Legend for Control Inclusion:', margin, currentY);
    currentY += 8;

    // Legend table
    const legendData = this.LEGEND_DEFINITIONS.map(legend => [
      legend.code,
      legend.description
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Code', 'Description']],
      body: legendData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: pageWidth - margin * 2 - 18 }
      },
      margin: { left: margin, right: margin }
    });

    currentY = (doc as any).lastAutoTable.finalY + 20;

    // === SUMMARY SECTION ===
    if (currentY > pageHeight - 80) {
      doc.addPage();
      currentY = margin;
    }

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Compliance Summary', margin, currentY);
    currentY += 10;

    // Calculate statistics by standard
    const standardStats = data.standards.map(std => {
      const stdRequirements = data.requirements.filter(req => 
        req.standardId?.toString().toLowerCase() === std.id?.toString().toLowerCase()
      );
      
      const fulfilled = stdRequirements.filter(r => r.status === 'fulfilled').length;
      const partial = stdRequirements.filter(r => r.status === 'partially-fulfilled').length;
      const notFulfilled = stdRequirements.filter(r => r.status === 'not-fulfilled').length;
      const notApplicable = stdRequirements.filter(r => r.status === 'not-applicable').length;
      const total = stdRequirements.length;
      
      const applicableCount = total - notApplicable;
      const complianceScore = applicableCount > 0 ? 
        Math.round(((fulfilled + partial * 0.5) / applicableCount) * 100) : 0;

      return [
        std.name,
        total.toString(),
        fulfilled.toString(),
        partial.toString(),
        notFulfilled.toString(),
        notApplicable.toString(),
        `${complianceScore}%`
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['Standard', 'Total', 'Fulfilled', 'Partial', 'Not Fulfilled', 'N/A', 'Score']],
      body: standardStats,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' },
        1: { cellWidth: 18, halign: 'center' },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 18, halign: 'center' },
        4: { cellWidth: 22, halign: 'center' },
        5: { cellWidth: 12, halign: 'center' },
        6: { cellWidth: 17, halign: 'center', fontStyle: 'bold' }
      },
      margin: { left: margin, right: margin }
    });

    currentY = (doc as any).lastAutoTable.finalY + 20;

    // === REQUIREMENTS TABLE ===
    if (currentY > pageHeight - 100) {
      doc.addPage();
      currentY = margin;
    }

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Requirements Details (${data.requirements.length} total)`, margin, currentY);
    currentY += 10;

    // Prepare main SoA table data
    const tableData = data.requirements.map((req: any) => {
      const std = data.standards.find((s: any) => 
        s.id?.toString().toLowerCase() === req.standardId?.toString().toLowerCase()
      );
      
      const clause = req.code || req.section || '-';
      const regChecked = this.isISO27001(req.standardId) ? '✓' : '';
      const status = this.formatStatus(req.status);
      
      return [
        std?.name || 'Unknown',
        clause,
        req.name || '',
        regChecked,
        '', // CON
        '', // BP  
        '', // RC
        '', // Justification for exclusion
        status
      ];
    });

    // Main SoA table
    autoTable(doc, {
      startY: currentY,
      head: [
        [
          { content: 'Standard', rowSpan: 2 },
          { content: 'Clause', rowSpan: 2 },
          { content: 'Requirement', rowSpan: 2 },
          { content: 'Justification for inclusion', colSpan: 4 },
          { content: 'Justification for exclusion', rowSpan: 2 },
          { content: 'Status', rowSpan: 2 }
        ],
        [
          'REG',
          'CON', 
          'BP',
          'RC'
        ]
      ],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7,
        halign: 'center'
      },
      styles: {
        fontSize: 6,
        cellPadding: 1.5,
        lineWidth: 0.1,
        lineColor: borderGray
      },
      columnStyles: {
        0: { cellWidth: 22, fontStyle: 'bold' }, // Standard
        1: { cellWidth: 10, halign: 'center', fontStyle: 'bold' }, // Clause  
        2: { cellWidth: 45 }, // Requirement
        3: { cellWidth: 8, halign: 'center' }, // REG
        4: { cellWidth: 8, halign: 'center' }, // CON
        5: { cellWidth: 8, halign: 'center' }, // BP
        6: { cellWidth: 8, halign: 'center' }, // RC
        7: { cellWidth: 18 }, // Justification for exclusion
        8: { cellWidth: 15, halign: 'center', fontStyle: 'bold' } // Status
      },
      didParseCell: (cellData) => {
        // Color-code status column
        if (cellData.column.index === 8 && cellData.section === 'body') {
          const requirement = data.requirements[cellData.row.index];
          if (requirement?.status) {
            const color = this.getStatusColor(requirement.status);
            cellData.cell.styles.textColor = color;
          }
        }
        
        // Add visual separation between standards
        const reqIndex = cellData.row.index;
        if (reqIndex > 0 && cellData.section === 'body') {
          const currentReq = data.requirements[reqIndex];
          const prevReq = data.requirements[reqIndex - 1];
          
          if (currentReq?.standardId !== prevReq?.standardId) {
            cellData.cell.styles.fillColor = [240, 248, 255]; // Light blue background
          }
        }
      },
      margin: { left: margin, right: margin },
      pageBreak: 'auto',
      showHead: 'everyPage'
    });

    // === FOOTER ===
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      
      // Footer text
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text(
        `Statement of Applicability - ${data.organizationName}`,
        margin,
        pageHeight - 8
      );
      doc.text(
        `Page ${i} of ${totalPages} | Generated by AuditReady`,
        pageWidth - margin,
        pageHeight - 8,
        { align: 'right' }
      );
    }
  }

  /**
   * Check if standard is ISO 27001
   */
  private static isISO27001(standardId: string): boolean {
    return standardId?.toLowerCase().includes('iso-27001') || false;
  }

  /**
   * Format status for display
   */
  private static formatStatus(status: string): string {
    return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Get status color for PDF
   */
  private static getStatusColor(status: string): [number, number, number] {
    switch (status) {
      case 'fulfilled':
        return [16, 185, 129]; // Green
      case 'partially-fulfilled':
        return [245, 158, 11]; // Amber
      case 'not-fulfilled':
        return [239, 68, 68]; // Red
      case 'not-applicable':
        return [107, 114, 128]; // Gray
      default:
        return [107, 114, 128];
    }
  }
}