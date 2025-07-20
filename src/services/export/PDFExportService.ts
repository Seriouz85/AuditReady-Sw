import { RequirementWithStatus } from '@/services/requirements/RequirementsService';
import { Standard } from '@/types';

interface PDFContent {
  standardName: string;
  standardVersion: string;
  standardDescription: string;
  requirements: RequirementWithStatus[];
  exportDate: string;
  organizationName?: string;
}

interface StatusSummary {
  fulfilled: number;
  partiallyFulfilled: number;
  notFulfilled: number;
  notApplicable: number;
  total: number;
}

export class PDFExportService {
  /**
   * Export standard requirements to PDF
   */
  static async exportStandardToPDF(
    standard: Standard,
    requirements: RequirementWithStatus[],
    organizationName?: string
  ): Promise<void> {
    // Sort requirements by numerical order for export
    const sortedRequirements = this.sortRequirementsNumerically(requirements);
    
    const content: PDFContent = {
      standardName: standard.name,
      standardVersion: standard.version,
      standardDescription: standard.description,
      requirements: sortedRequirements,
      exportDate: new Date().toLocaleDateString(),
      organizationName
    };

    // Check if we have jsPDF available
    if (typeof window !== 'undefined') {
      try {
        // Dynamic import to avoid SSR issues
        const { jsPDF } = await import('jspdf');
        await this.generatePDFWithJsPDF(content);
      } catch (error) {
        console.warn('jsPDF not available, falling back to HTML export:', error);
        this.generateHTMLExport(content);
      }
    } else {
      // Fallback for server-side
      this.generateHTMLExport(content);
    }
  }

  /**
   * Sort requirements numerically by code
   */
  private static sortRequirementsNumerically(requirements: RequirementWithStatus[]): RequirementWithStatus[] {
    return [...requirements].sort((a, b) => {
      const aCode = String(a.code);
      const bCode = String(b.code);
      
      // Extract numbers from codes for proper numerical sorting
      const aMatch = aCode.match(/(\d+(?:\.\d+)*)/);
      const bMatch = bCode.match(/(\d+(?:\.\d+)*)/);
      
      if (aMatch && bMatch) {
        const aParts = aMatch[1].split('.').map(Number);
        const bParts = bMatch[1].split('.').map(Number);
        
        // Compare each part numerically
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const aPart = aParts[i] || 0;
          const bPart = bParts[i] || 0;
          if (aPart !== bPart) {
            return aPart - bPart;
          }
        }
      }
      
      // Fallback to string comparison
      return aCode.localeCompare(bCode);
    });
  }

  /**
   * Generate status summary for the standard
   */
  private static generateStatusSummary(requirements: RequirementWithStatus[]): StatusSummary {
    return requirements.reduce((summary, req) => {
      summary.total++;
      switch (req.status) {
        case 'fulfilled':
          summary.fulfilled++;
          break;
        case 'partially-fulfilled':
          summary.partiallyFulfilled++;
          break;
        case 'not-fulfilled':
          summary.notFulfilled++;
          break;
        case 'not-applicable':
          summary.notApplicable++;
          break;
      }
      return summary;
    }, {
      fulfilled: 0,
      partiallyFulfilled: 0,
      notFulfilled: 0,
      notApplicable: 0,
      total: 0
    });
  }

  /**
   * Get status color for visual indicators
   */
  private static getStatusColor(status: string): string {
    switch (status) {
      case 'fulfilled':
        return '#10B981'; // Green
      case 'partially-fulfilled':
        return '#F59E0B'; // Amber
      case 'not-fulfilled':
        return '#EF4444'; // Red
      case 'not-applicable':
        return '#6B7280'; // Gray
      default:
        return '#6B7280';
    }
  }

  /**
   * Format status for display
   */
  private static formatStatus(status: string): string {
    return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Generate PDF using jsPDF with autoTable for professional layout
   */
  private static async generatePDFWithJsPDF(content: PDFContent): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;

    // Company branding colors
    const primaryColor = [51, 65, 85]; // Slate-700 RGB
    const accentColor = [16, 185, 129]; // Emerald-500 RGB  
    const lightGray = [248, 250, 252]; // Slate-50 RGB

    let currentY = margin;

    // === HEADER SECTION ===
    // Company logo area (placeholder)
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, currentY, pageWidth - (margin * 2), 25, 'F');
    
    // Company name and export info
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('AUDIT READINESS HUB', margin + 5, currentY + 8);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Export Date: ${content.exportDate}`, pageWidth - margin - 40, currentY + 8);
    
    if (content.organizationName) {
      doc.text(`Organization: ${content.organizationName}`, margin + 5, currentY + 16);
    }
    
    currentY += 35;

    // === STANDARD TITLE SECTION ===
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(content.standardName, margin, currentY);
    currentY += 10;

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Version: ${content.standardVersion}`, margin, currentY);
    currentY += 15;

    // === DESCRIPTION SECTION ===
    if (content.standardDescription) {
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Standard Description', margin, currentY);
      currentY += 8;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const descLines = doc.splitTextToSize(content.standardDescription, pageWidth - (margin * 2));
      doc.text(descLines, margin, currentY);
      currentY += (descLines.length * 4) + 10;
    }

    // === STATUS SUMMARY SECTION ===
    const statusSummary = this.generateStatusSummary(content.requirements);
    const applicableTotal = statusSummary.total - statusSummary.notApplicable;
    const complianceScore = applicableTotal > 0 ? 
      Math.round(((statusSummary.fulfilled + statusSummary.partiallyFulfilled * 0.5) / applicableTotal) * 100) : 0;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Compliance Summary', margin, currentY);
    currentY += 10;

    // Summary table
    autoTable(doc, {
      startY: currentY,
      head: [['Status', 'Count', 'Percentage']],
      body: [
        ['Fulfilled', statusSummary.fulfilled.toString(), `${Math.round((statusSummary.fulfilled / statusSummary.total) * 100)}%`],
        ['Partially Fulfilled', statusSummary.partiallyFulfilled.toString(), `${Math.round((statusSummary.partiallyFulfilled / statusSummary.total) * 100)}%`],
        ['Not Fulfilled', statusSummary.notFulfilled.toString(), `${Math.round((statusSummary.notFulfilled / statusSummary.total) * 100)}%`],
        ['Not Applicable', statusSummary.notApplicable.toString(), `${Math.round((statusSummary.notApplicable / statusSummary.total) * 100)}%`],
        ['', '', ''],
        ['Overall Compliance Score', '', `${complianceScore}%`]
      ],
      theme: 'grid',
      headStyles: { 
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        2: { halign: 'right' }
      },
      didParseCell: function(data) {
        // Highlight the compliance score row
        if (data.row.index === 5) {
          data.cell.styles.fillColor = lightGray;
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // === REQUIREMENTS TABLE ===
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Requirements Details', margin, currentY);
    currentY += 10;

    // Prepare table data
    const tableData = content.requirements.map(req => [
      req.code || '',
      req.name || '',
      this.formatStatus(req.status),
      req.fulfillmentPercentage ? `${req.fulfillmentPercentage}%` : '',
      req.notes ? req.notes.substring(0, 100) + (req.notes.length > 100 ? '...' : '') : ''
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Code', 'Requirement', 'Status', 'Progress', 'Notes']],
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      styles: { 
        fontSize: 9,
        cellPadding: 4
      },
      columnStyles: {
        0: { cellWidth: 20, fontStyle: 'bold' }, // Code
        1: { cellWidth: 60 }, // Requirement name
        2: { cellWidth: 25, halign: 'center' }, // Status
        3: { cellWidth: 20, halign: 'center' }, // Progress
        4: { cellWidth: 55 } // Notes
      },
      didParseCell: function(data) {
        // Color-code status cells
        if (data.column.index === 2 && data.section === 'body') {
          const status = content.requirements[data.row.index]?.status;
          if (status) {
            const colorHex = PDFExportService.getStatusColor(status);
            const rgb = PDFExportService.hexToRgb(colorHex);
            data.cell.styles.textColor = [rgb.r, rgb.g, rgb.b];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      margin: { left: margin, right: margin },
      pageBreak: 'auto',
      showHead: 'everyPage'
    });

    // === FOOTER ON ALL PAGES ===
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      
      // Footer text
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text(
        `${content.standardName} - Compliance Report`,
        margin,
        pageHeight - 8
      );
      doc.text(
        `Page ${i} of ${totalPages} | Generated by Audit Readiness Hub`,
        pageWidth - margin,
        pageHeight - 8,
        { align: 'right' }
      );
    }

    // Save the PDF
    const fileName = `${content.standardName.replace(/[^a-z0-9]/gi, '_')}_compliance_report.pdf`;
    doc.save(fileName);
  }

  /**
   * Convert hex color to RGB
   */
  private static hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  /**
   * Fallback HTML export if PDF library is not available
   */
  private static generateHTMLExport(content: PDFContent): void {
    const statusSummary = this.generateStatusSummary(content.requirements);
    const applicableTotal = statusSummary.total - statusSummary.notApplicable;
    const complianceScore = applicableTotal > 0 ? 
      Math.round(((statusSummary.fulfilled + statusSummary.partiallyFulfilled * 0.5) / applicableTotal) * 100) : 0;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${content.standardName} - Compliance Report</title>
        <style>
          * { box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px;
            background-color: #f8fafc;
            color: #334155;
          }
          .container { max-width: 1200px; margin: 0 auto; background: white; padding: 0; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { 
            background: linear-gradient(135deg, #334155 0%, #475569 100%); 
            color: white; 
            padding: 30px; 
            border-radius: 8px 8px 0 0;
          }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
          .header .subtitle { font-size: 16px; opacity: 0.9; margin-top: 8px; }
          .content { padding: 30px; }
          .section { margin-bottom: 30px; }
          .section h2 { 
            font-size: 20px; 
            font-weight: 600; 
            margin-bottom: 15px; 
            color: #334155;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
          }
          .description { 
            background-color: #f1f5f9; 
            padding: 20px; 
            border-radius: 6px; 
            border-left: 4px solid #10b981;
            margin-bottom: 20px;
          }
          .summary-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 15px; 
            margin-bottom: 20px;
          }
          .summary-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 15px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .summary-card .number { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .summary-card .label { font-size: 14px; color: #64748b; }
          .compliance-score {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            grid-column: 1 / -1;
          }
          .compliance-score .number { font-size: 36px; }
          .table-container { overflow-x: auto; margin-top: 20px; }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            background: white;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          th { 
            background: #334155; 
            color: white; 
            padding: 12px; 
            text-align: left; 
            font-weight: 600;
            font-size: 14px;
          }
          td { 
            padding: 12px; 
            border-bottom: 1px solid #e2e8f0; 
            font-size: 13px;
            vertical-align: top;
          }
          tr:nth-child(even) td { background-color: #f8fafc; }
          tr:hover td { background-color: #f1f5f9; }
          .status-fulfilled { color: #10b981; font-weight: 600; }
          .status-partially-fulfilled { color: #f59e0b; font-weight: 600; }
          .status-not-fulfilled { color: #ef4444; font-weight: 600; }
          .status-not-applicable { color: #6b7280; font-weight: 600; }
          .code-cell { font-family: 'Courier New', monospace; font-weight: 600; }
          .notes-cell { max-width: 300px; font-size: 12px; color: #64748b; }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }
          @media print {
            body { background: white; }
            .container { box-shadow: none; }
            .header { background: #334155 !important; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AUDIT READINESS HUB</h1>
            <div class="subtitle">Compliance Report - ${content.exportDate}</div>
            ${content.organizationName ? `<div class="subtitle">Organization: ${content.organizationName}</div>` : ''}
          </div>
          
          <div class="content">
            <div class="section">
              <h1 style="font-size: 28px; margin-bottom: 10px;">${content.standardName}</h1>
              <p style="color: #64748b; font-size: 16px;">Version: ${content.standardVersion}</p>
            </div>

            ${content.standardDescription ? `
            <div class="section">
              <h2>Standard Description</h2>
              <div class="description">
                ${content.standardDescription}
              </div>
            </div>
            ` : ''}

            <div class="section">
              <h2>Compliance Summary</h2>
              <div class="summary-grid">
                <div class="summary-card">
                  <div class="number" style="color: #10b981;">${statusSummary.fulfilled}</div>
                  <div class="label">Fulfilled</div>
                </div>
                <div class="summary-card">
                  <div class="number" style="color: #f59e0b;">${statusSummary.partiallyFulfilled}</div>
                  <div class="label">Partially Fulfilled</div>
                </div>
                <div class="summary-card">
                  <div class="number" style="color: #ef4444;">${statusSummary.notFulfilled}</div>
                  <div class="label">Not Fulfilled</div>
                </div>
                <div class="summary-card">
                  <div class="number" style="color: #6b7280;">${statusSummary.notApplicable}</div>
                  <div class="label">Not Applicable</div>
                </div>
                <div class="summary-card compliance-score">
                  <div class="number">${complianceScore}%</div>
                  <div class="label">Overall Compliance Score</div>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>Requirements Details (${content.requirements.length} total)</h2>
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th style="width: 15%;">Code</th>
                      <th style="width: 35%;">Requirement</th>
                      <th style="width: 15%;">Status</th>
                      <th style="width: 10%;">Progress</th>
                      <th style="width: 25%;">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${content.requirements.map(req => `
                      <tr>
                        <td class="code-cell">${req.code || ''}</td>
                        <td><strong>${req.name || ''}</strong></td>
                        <td class="status-${req.status}">${this.formatStatus(req.status)}</td>
                        <td style="text-align: center;">${req.fulfillmentPercentage ? `${req.fulfillmentPercentage}%` : ''}</td>
                        <td class="notes-cell">${req.notes || ''}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <div class="footer">
              Generated by Audit Readiness Hub | ${content.standardName} - Compliance Report
            </div>
          </div>
        </div>
        
        <script>
          // Auto-print functionality
          setTimeout(() => {
            window.print();
          }, 1000);
        </script>
      </body>
      </html>
    `;

    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  }
}