import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { EnhancedUnifiedGuidanceService } from './EnhancedUnifiedGuidanceService';
import { ProfessionalGuidanceService } from './ProfessionalGuidanceService';

interface FrameworkSelection {
  iso27001?: boolean;
  iso27002?: boolean;
  cisControls?: boolean | string;
  gdpr?: boolean;
  nis2?: boolean;
  dora?: boolean;
}

interface ComplianceMapping {
  id: string;
  category: string;
  frameworks?: { [key: string]: any[] };
  auditReadyUnified?: {
    title?: string;
    description?: string;
    subRequirements?: any[];
  };
  industrySpecific?: any[];
}

interface IndustrySector {
  id: string;
  name: string;
}

/**
 * Service for exporting compliance data in various formats (CSV, XLSX, PDF)
 */
export class ComplianceExportService {
  
  /**
   * Clean markdown formatting from text
   */
  private static cleanMarkdownFormatting(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
      .replace(/`(.*?)`/g, '$1') // Remove code formatting
      .replace(/#{1,6}\s*/g, '') // Remove headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
      .replace(/>\s*/g, '') // Remove blockquotes
      .replace(/[-*+]\s+/g, '• ') // Convert list markers to bullets
      .trim();
  }

  /**
   * Clean compliance sub-requirement text
   */
  private static cleanComplianceSubRequirement(req: any): string {
    const text = typeof req === 'string' ? req : req?.description || req?.text || '';
    return this.cleanMarkdownFormatting(text);
  }

  /**
   * Export compliance data to CSV format
   */
  static exportToCSV(
    filteredUnifiedMappings: ComplianceMapping[],
    selectedFrameworks: FrameworkSelection,
    industrySectors: IndustrySector[] | null,
    selectedIndustrySector: string | null
  ): void {
    // Get selected frameworks for dynamic column generation
    const selectedFrameworksList = Object.entries(selectedFrameworks)
      .filter(([_, selected]) => selected !== false && selected !== null)
      .map(([framework, value]) => {
        if (framework === 'cisControls' && typeof value === 'string') {
          return `${framework} (${value.toUpperCase()})`;
        }
        return framework;
      });

    // Create dynamic headers based on selected frameworks
    const baseHeaders = [
      'Category',
      'Description of Category',
      'Unified Requirements',
      'Unified Guidance'
    ];
    
    // Add framework-specific columns only for selected frameworks
    const frameworkHeaders = [];
    if (selectedFrameworks.iso27001) frameworkHeaders.push('ISO 27001 Controls');
    if (selectedFrameworks.iso27002) frameworkHeaders.push('ISO 27002 Controls');
    if (selectedFrameworks.cisControls) {
      const igLevel = selectedFrameworks.cisControls.toString().toUpperCase();
      frameworkHeaders.push(`CIS Controls (${igLevel})`);
    }
    if (selectedFrameworks.gdpr) frameworkHeaders.push('GDPR Articles');
    if (selectedFrameworks.nis2) frameworkHeaders.push('NIS2 Articles');
    
    // Add industry-specific column if sector is selected
    if (selectedIndustrySector) {
      const sectorName = industrySectors?.find(s => s.id === selectedIndustrySector)?.name || 'Industry-Specific';
      frameworkHeaders.push(`${sectorName} Requirements`);
    }

    const headers = [...baseHeaders, ...frameworkHeaders];
    
    // Create enhanced rows with better formatting
    const rows = (filteredUnifiedMappings || []).map(mapping => {
      const baseRow = [
        mapping.category || '',
        this.cleanMarkdownFormatting(mapping.auditReadyUnified?.description || ''),
        mapping.auditReadyUnified?.title || '',
        // Format sub-requirements with proper line breaks for CSV
        (mapping.auditReadyUnified?.subRequirements || [])
          .map((req, index) => `${index + 1}. ${this.cleanComplianceSubRequirement(req)}`)
          .join('\n• ')
      ];

      // Add framework-specific data only for selected frameworks
      const frameworkData = [];
      
      if (selectedFrameworks.iso27001) {
        const iso27001Controls = (mapping.frameworks?.['iso27001'] || [])
          .map(r => `${r.code}: ${this.cleanMarkdownFormatting(r.title)}\n${this.cleanMarkdownFormatting(r.description).substring(0, 150)}...`)
          .join('\n\n• ');
        frameworkData.push(iso27001Controls);
      }
      
      if (selectedFrameworks.iso27002) {
        const iso27002Controls = (mapping.frameworks?.['iso27002'] || [])
          .map(r => `${r.code}: ${this.cleanMarkdownFormatting(r.title)}\n${this.cleanMarkdownFormatting(r.description).substring(0, 150)}...`)
          .join('\n\n• ');
        frameworkData.push(iso27002Controls);
      }
      
      if (selectedFrameworks.cisControls) {
        const cisControls = (mapping.frameworks?.['cisControls'] || [])
          .map(r => `${r.code}: ${this.cleanMarkdownFormatting(r.title)}\n${this.cleanMarkdownFormatting(r.description).substring(0, 150)}...`)
          .join('\n\n• ');
        frameworkData.push(cisControls);
      }
      
      if (selectedFrameworks.gdpr) {
        const gdprArticles = (mapping.frameworks?.['gdpr'] || [])
          .map(r => `${r.code}: ${this.cleanMarkdownFormatting(r.title)}\n${this.cleanMarkdownFormatting(r.description).substring(0, 150)}...`)
          .join('\n\n• ');
        frameworkData.push(gdprArticles);
      }
      
      if (selectedFrameworks.nis2) {
        const nis2Articles = (mapping.frameworks?.['nis2'] || [])
          .map(r => `${r.code}: ${this.cleanMarkdownFormatting(r.title)}\n${this.cleanMarkdownFormatting(r.description).substring(0, 150)}...`)
          .join('\n\n• ');
        frameworkData.push(nis2Articles);
      }

      // Add industry-specific requirements if available
      if (selectedIndustrySector && mapping.industrySpecific) {
        const industryReqs = mapping.industrySpecific
          .map(r => `[${r.relevanceLevel.toUpperCase()}] ${r.code}: ${this.cleanMarkdownFormatting(r.title)}\n${this.cleanMarkdownFormatting(r.description).substring(0, 120)}...`)
          .join('\n\n• ');
        frameworkData.push(industryReqs);
      }

      return [...baseRow, ...frameworkData];
    });

    // Create enhanced CSV with better formatting
    const csvRows = [];
    
    // Add title and metadata
    csvRows.push([`AuditReady Compliance Simplification Report`]);
    csvRows.push([`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`]);
    csvRows.push([`Selected Frameworks: ${selectedFrameworksList.join(', ')}`]);
    if (selectedIndustrySector) {
      const sectorName = industrySectors?.find(s => s.id === selectedIndustrySector)?.name || '';
      csvRows.push([`Industry Sector: ${sectorName}`]);
    }
    csvRows.push(['']); // Empty row for spacing
    
    // Add headers
    csvRows.push(headers);
    
    // Add data rows
    csvRows.push(...rows);
    
    // Add footer with summary
    csvRows.push(['']); // Empty row
    csvRows.push([`Total Categories: ${rows.length}`]);
    csvRows.push([`Export Format: Professional CSV with Enhanced Formatting`]);
    csvRows.push([`Note: Import into Excel or Google Sheets for optimal formatting`]);

    // Convert to CSV format with enhanced escaping
    const csvContent = csvRows.map(row => 
      row.map(cell => {
        // Enhanced cell formatting for better readability
        const cleanCell = String(cell || '')
          .replace(/"/g, '""') // Escape quotes
          .replace(/\n/g, '\n') // Preserve line breaks
          .replace(/\r/g, ''); // Remove carriage returns
        
        // Always quote cells to preserve formatting
        return `"${cleanCell}"`;
      }).join(',')
    ).join('\n');

    // Create download with enhanced filename
    const timestamp = new Date().toISOString().split('T')[0];
    const frameworkSuffix = selectedFrameworksList.length > 0 
      ? `_${selectedFrameworksList.join('_').replace(/[^a-zA-Z0-9]/g, '_')}` 
      : '';
    const filename = `AuditReady_Compliance_Report_${timestamp}${frameworkSuffix}.csv`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    console.log(`✅ Exported ${rows.length} compliance categories to ${filename}`);
  }

  /**
   * Export compliance data to XLSX format
   */
  static async exportToXLSX(
    filteredUnifiedMappings: ComplianceMapping[],
    selectedFrameworks: FrameworkSelection,
    industrySectors: IndustrySector[] | null,
    selectedIndustrySector: string | null,
    category?: string,
    results?: any
  ): Promise<void> {
    // Get selected frameworks for dynamic column generation
    const selectedFrameworksList = Object.entries(selectedFrameworks)
      .filter(([_, selected]) => selected !== false && selected !== null)
      .map(([framework, value]) => {
        if (framework === 'cisControls' && typeof value === 'string') {
          return `${framework} (${value.toUpperCase()})`;
        }
        return framework;
      });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // 🎨 ENTERPRISE-GRADE REPORT INFO WORKSHEET
    const currentDate = new Date();
    const metaData = [
      // Title Section with branding
      ['🛡️ AuditReady Enterprise Compliance Report', ''],
      ['', ''],
      ['📊 EXECUTIVE SUMMARY', ''],
      ['', ''],
      ['Report Generated:', currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) + ' at ' + currentDate.toLocaleTimeString()],
      ['Compliance Frameworks:', selectedFrameworksList.join(', ') || 'All Available'],
      ['Total Categories Analyzed:', (filteredUnifiedMappings || []).length],
      ['Coverage Assessment:', selectedFrameworksList.length > 3 ? 'Comprehensive Multi-Framework Analysis' : 'Focused Framework Analysis'],
      ['', ''],
      ['📋 REPORT SPECIFICATIONS', ''],
      ['', ''],
      ['✓ Category Analysis:', 'Complete coverage of all security domains'],
      ['✓ Framework Mapping:', 'Cross-referenced compliance requirements'],
      ['✓ Unified Guidance:', 'Consolidated implementation roadmap'],
      ['✓ Industry Alignment:', selectedIndustrySector ? 'Sector-specific customization included' : 'General applicability'],
      ['', ''],
      ['🎯 USAGE GUIDELINES', ''],
      ['', ''],
      ['• Executive Review:', 'Focus on streamlined Category and Unified Requirements'],
      ['• Technical Implementation:', 'Use consolidated requirements for efficient deployment'],  
      ['• Audit Preparation:', 'Reference unified requirements for implementation'],
      ['• Risk Assessment:', 'Prioritize categories based on organizational context']
    ];

    if (selectedIndustrySector) {
      const sectorName = industrySectors?.find(s => s.id === selectedIndustrySector)?.name || '';
      metaData.splice(7, 0, ['Industry Sector Focus:', `${sectorName} - Enhanced Requirements`]);
    }

    const metaWS = XLSX.utils.aoa_to_sheet(metaData);
    
    // 🎨 STUNNING METADATA STYLING
    metaWS['!cols'] = [
      { wch: 35 }, // Column A - Labels
      { wch: 65 }  // Column B - Values
    ];

    // Apply cell styling for metadata
    const metaRange = XLSX.utils.decode_range(metaWS['!ref'] || 'A1:B25');
    for (let row = metaRange.s.r; row <= metaRange.e.r; row++) {
      for (let col = metaRange.s.c; col <= metaRange.e.c; col++) {
        const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
        if (!metaWS[cellAddr]) continue;
        
        // Style different sections
        if (row === 0) {
          // Title row
          metaWS[cellAddr].s = {
            font: { bold: true, size: 18, color: { rgb: "1F4E79" } },
            fill: { fgColor: { rgb: "E7F3FF" } },
            alignment: { horizontal: "left", vertical: "center" }
          };
        } else if ([2, 9, 17].includes(row)) {
          // Section headers
          metaWS[cellAddr].s = {
            font: { bold: true, size: 14, color: { rgb: "2F5233" } },
            fill: { fgColor: { rgb: "F0F8F0" } },
            alignment: { horizontal: "left", vertical: "center" }
          };
        } else if ([4, 5, 6, 7, 8, 11, 12, 13, 14, 19, 20, 21, 22].includes(row) && col === 0) {
          // Data labels
          metaWS[cellAddr].s = {
            font: { bold: true, size: 11, color: { rgb: "404040" } },
            alignment: { horizontal: "left", vertical: "center" }
          };
        }
      }
    }

    // 🎨 MAIN DATA WORKSHEET - ENTERPRISE GRADE
    const baseHeaders = [
      '📂 Category', 
      '🎯 Unified Requirements'
    ];
    
    // Use the simplified structure: Category, Unified Requirements (only 2 columns for cleaner PDF)
    const headers = baseHeaders;
    
    // Create data rows with enhanced formatting
    const xlsxRows = [headers];
    
    for (let index = 0; index < (filteredUnifiedMappings || []).length; index++) {
      const mapping = filteredUnifiedMappings[index];
      if (!mapping) continue;
      
      // Get unified requirements (sub-requirements) - preserve formatting
      const unifiedRequirements = (mapping.auditReadyUnified?.subRequirements || [])
        .map((req) => {
          // Preserve formatting for all requirements, not just Governance
          return `✓ ${req}`;
        })
        .join('\n\n');
      
      // Get unified guidance content using the enhanced service
      
      // Use legacy system for PDF generation (async)
      const guidanceContent = await EnhancedUnifiedGuidanceService.getEnhancedGuidance(
        category,
        selectedFrameworks,
        results?.data?.[0] // categoryMapping
      ) || 'Enhanced guidance with actionable insights available in application';
      const unifiedGuidance = this.cleanMarkdownFormatting(
        guidanceContent.length > 1000 
          ? guidanceContent.substring(guidanceContent.indexOf('**') + 50, 1000) + '\\n\\n[Complete guidance available in application]'
          : guidanceContent.substring(guidanceContent.indexOf('**') + 50) || 'Enhanced guidance with actionable insights available in application'
      );
      
      // Collect all framework references for the References column
      const references: string[] = [];
      
      if (selectedFrameworks.iso27001 && mapping.frameworks?.['iso27001']?.length) {
        references.push('ISO 27001: ' + mapping.frameworks['iso27001'].map(r => r.code).join(', '));
      }
      if (selectedFrameworks.iso27002 && mapping.frameworks?.['iso27002']?.length) {
        references.push('ISO 27002: ' + mapping.frameworks['iso27002'].map(r => r.code).join(', '));
      }
      if (selectedFrameworks.cisControls && mapping.frameworks?.['cisControls']?.length) {
        references.push('CIS Controls: ' + mapping.frameworks['cisControls'].map(r => r.code).join(', '));
      }
      if (selectedFrameworks.gdpr && mapping.frameworks?.['gdpr']?.length) {
        references.push('GDPR: ' + mapping.frameworks['gdpr'].map(r => r.code).join(', '));
      }
      if (selectedFrameworks.nis2 && mapping.frameworks?.['nis2']?.length) {
        references.push('NIS2: ' + mapping.frameworks['nis2'].map(r => r.code).join(', '));
      }
      
      const referencesText = references.join('\n') || 'No specific framework mappings found';
      
      const row = [
        `${index + 1}. ${mapping.category || ''}`,
        unifiedRequirements
      ];

      xlsxRows.push(row);
    }

    const mainWS = XLSX.utils.aoa_to_sheet(xlsxRows);
    
    // 🎨 CALCULATE AUTO-ADJUSTED COLUMN WIDTHS
    const calculateOptimalWidth = (text: string, isHeader = false) => {
      if (!text) return 15;
      const lines = text.split('\n');
      const maxLineLength = Math.max(...lines.map(line => line.length));
      let baseWidth = Math.min(Math.max(maxLineLength * 1.2, 15), isHeader ? 35 : 60);
      if (isHeader) baseWidth += 5; // Extra space for headers
      return baseWidth;
    };

    // Calculate optimal column widths based on content
    const optimalWidths = headers.map((header, colIndex) => {
      let maxWidth = calculateOptimalWidth(header, true);
      
      // Check content width for this column
      xlsxRows.slice(1).forEach(row => {
        if (row[colIndex]) {
          const contentWidth = calculateOptimalWidth(String(row[colIndex]));
          maxWidth = Math.max(maxWidth, contentWidth);
        }
      });
      
      return { wch: Math.min(maxWidth, 70) }; // Cap at 70 characters
    });

    mainWS['!cols'] = optimalWidths;

    // 🎨 CALCULATE AUTO-ADJUSTED ROW HEIGHTS
    const range = XLSX.utils.decode_range(mainWS['!ref'] || 'A1:A1');
    mainWS['!rows'] = [];
    
    for (let i = 0; i <= range.e.r; i++) {
      if (i === 0) {
        // Header row with premium styling
        mainWS['!rows'][i] = { hpx: 45 };
      } else {
        // Calculate row height based on content
        let maxLines = 1;
        for (let j = 0; j < headers.length; j++) {
          const cellAddr = XLSX.utils.encode_cell({ r: i, c: j });
          if (mainWS[cellAddr] && mainWS[cellAddr].v) {
            const lines = String(mainWS[cellAddr].v).split('\n').length;
            maxLines = Math.max(maxLines, lines);
          }
        }
        // Set height based on content (minimum 25px, scale with content)
        const optimalHeight = Math.max(25, Math.min(maxLines * 18, 200));
        mainWS['!rows'][i] = { hpx: optimalHeight };
      }
    }

    // 🎨 APPLY STUNNING CELL STYLING
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
        if (!mainWS[cellAddr]) continue;

        if (row === 0) {
          // 🎨 PREMIUM HEADER STYLING
          mainWS[cellAddr].s = {
            font: { 
              bold: true, 
              size: 12, 
              color: { rgb: "FFFFFF" },
              name: "Calibri"
            },
            fill: { 
              fgColor: { rgb: col < 4 ? "1F4E79" : "2F5233" } // Different colors for base vs framework columns
            },
            alignment: { 
              horizontal: "center", 
              vertical: "center",
              wrapText: true 
            },
            border: {
              top: { style: "thick", color: { rgb: "FFFFFF" } },
              bottom: { style: "thick", color: { rgb: "FFFFFF" } },
              left: { style: "thick", color: { rgb: "FFFFFF" } },
              right: { style: "thick", color: { rgb: "FFFFFF" } }
            }
          };
        } else {
          // 🎨 ALTERNATING ROW COLORS WITH PREMIUM STYLING
          const isEvenRow = (row - 1) % 2 === 0;
          const backgroundColor = isEvenRow ? "F8F9FA" : "FFFFFF";
          const textColor = col === 0 ? "1F4E79" : "404040"; // Category column in blue
          
          mainWS[cellAddr].s = {
            font: { 
              size: 10,
              color: { rgb: textColor },
              name: "Calibri",
              bold: col === 0 // Bold category names
            },
            fill: { fgColor: { rgb: backgroundColor } },
            alignment: { 
              horizontal: col === 0 ? "left" : "left",
              vertical: "top",
              wrapText: true,
              indent: col === 0 ? 1 : 0
            },
            border: {
              top: { style: "thin", color: { rgb: "E0E0E0" } },
              bottom: { style: "thin", color: { rgb: "E0E0E0" } },
              left: { style: "thin", color: { rgb: "E0E0E0" } },
              right: { style: "thin", color: { rgb: "E0E0E0" } }
            }
          };
        }
      }
    }

    // 🎨 CREATE SUMMARY STATISTICS WORKSHEET
    const summaryData = [
      ['📊 COMPLIANCE COVERAGE ANALYSIS', ''],
      ['', ''],
      ['Framework', 'Requirements Mapped', 'Coverage %', 'Status'],
      ['', '', '', ''],
    ];

    // Add framework statistics
    selectedFrameworksList.forEach(framework => {
      const totalMapped = (filteredUnifiedMappings || []).reduce((count, mapping) => {
        const frameworkKey = framework.includes('(') ? (framework.split('(')[0]?.trim() || framework) : framework;
        const mappedFrameworks = Object.keys(mapping.frameworks || {});
        return count + (mappedFrameworks.includes(frameworkKey) ? 1 : 0);
      }, 0);
      
      const coverage = Math.round((totalMapped / Math.max((filteredUnifiedMappings || []).length, 1)) * 100);
      const status = coverage >= 90 ? '✅ Excellent' : coverage >= 70 ? '🟡 Good' : coverage >= 50 ? '🟠 Moderate' : '🔴 Limited';
      
      summaryData.push([framework, totalMapped.toString(), `${coverage}%`, status]);
    });

    summaryData.push(['', '', '', '']);
    summaryData.push(['Total Categories Analyzed', (filteredUnifiedMappings || []).length.toString(), '100%', 'Complete']);
    summaryData.push(['Report Generation Date', new Date().toLocaleDateString(), '', '']);
    summaryData.push(['Compliance Readiness Score', 
      selectedFrameworksList.length >= 3 ? 'High Multi-Framework Coverage' : 'Focused Framework Analysis', 
      '', 
      selectedFrameworksList.length >= 3 ? 'Enterprise' : 'Professional'
    ]);

    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWS['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 20 }];

    // Style summary worksheet
    const summaryRange = XLSX.utils.decode_range(summaryWS['!ref'] || 'A1:D10');
    for (let row = summaryRange.s.r; row <= summaryRange.e.r; row++) {
      for (let col = summaryRange.s.c; col <= summaryRange.e.c; col++) {
        const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
        if (!summaryWS[cellAddr]) continue;
        
        if (row === 0) {
          summaryWS[cellAddr].s = {
            font: { bold: true, size: 16, color: { rgb: "1F4E79" } },
            fill: { fgColor: { rgb: "E7F3FF" } },
            alignment: { horizontal: "left", vertical: "center" }
          };
        } else if (row === 2) {
          summaryWS[cellAddr].s = {
            font: { bold: true, size: 11, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "1F4E79" } },
            alignment: { horizontal: "center", vertical: "center" }
          };
        }
      }
    }

    // Add worksheets to workbook in order
    XLSX.utils.book_append_sheet(wb, metaWS, '📋 Report Overview');
    XLSX.utils.book_append_sheet(wb, summaryWS, '📊 Coverage Analysis');
    XLSX.utils.book_append_sheet(wb, mainWS, '🛡️ Compliance Mapping');

    // Create premium filename
    const timestamp = new Date().toISOString().split('T')[0];
    const frameworkSuffix = selectedFrameworksList.length > 0 
      ? `_${selectedFrameworksList.join('_').replace(/[^a-zA-Z0-9]/g, '_')}` 
      : '';
    const filename = `AuditReady_Enterprise_Compliance_Report_${timestamp}${frameworkSuffix}.xlsx`;

    // Export with enterprise branding
    XLSX.writeFile(wb, filename);
    
    console.log(`🏆 Exported enterprise-grade compliance report: ${filename}`);
    console.log(`📊 ${(filteredUnifiedMappings || []).length} categories analyzed across ${selectedFrameworksList.length} frameworks`);
  }

  /**
   * Export compliance data to PDF format
   */
  static exportToPDF(
    filteredUnifiedMappings: ComplianceMapping[],
    selectedFrameworks: FrameworkSelection,
    industrySectors: IndustrySector[] | null,
    selectedIndustrySector: string | null,
    getGuidanceContent: () => string
  ): void {
    // Get selected frameworks with proper formatting and years
    const selectedFrameworksList = Object.entries(selectedFrameworks)
      .filter(([_, selected]) => selected !== false && selected !== null)
      .map(([framework, value]) => {
        // Add version/year information to frameworks
        const frameworkWithVersion = {
          'iso27001': 'ISO 27001:2022',
          'iso27002': 'ISO 27002:2022', 
          'nis2': 'NIS2 Directive 2024',
          'dora': 'DORA 2024',
          'gdpr': 'GDPR 2018',
          'cisControls': `CIS Controls ${typeof value === 'string' ? value.toUpperCase() : 'IG3'} v8.1`
        }[framework];
        
        return frameworkWithVersion || ProfessionalGuidanceService.formatFrameworkName(framework);
      });

    // Create new PDF with normal A4 portrait dimensions
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm', 
      format: [210, 297], // Standard A4 portrait dimensions
      compress: true,
      putOnlyUsedFonts: true
    });
    const pageWidth = 210; // Standard A4 portrait width
    const pageHeight = 297; // Standard A4 portrait height
    const margin = 15; // Professional margin for A4
    

    // 🎨 PREMIUM HEADER DESIGN
    const createPremiumHeader = (pageNum = 1) => {
      // Background gradient effect (simulated with rectangles)
      doc.setFillColor(31, 78, 121); // Primary blue
      doc.rect(0, 0, pageWidth, 30, 'F');
      
      // Subtle accent line
      doc.setFillColor(239, 156, 18); // Gold accent
      doc.rect(0, 27, pageWidth, 3, 'F');
      
      // Company logo placeholder - portrait optimized
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, 6, 16, 16, 2, 2, 'F');
      doc.setFillColor(31, 78, 121);
      doc.roundedRect(margin + 2, 8, 12, 12, 1, 1, 'F');
      
      // Main title - portrait A4 optimized with proper width constraint
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18); // Reduced from 22 to prevent bleeding
      doc.setFont('helvetica', 'bold');
      // Ensure title fits within available width (pageWidth - margin - logo space - page number space)
      const maxTitleWidth = pageWidth - margin - 25 - 30; // Leave space for logo and page number
      doc.text('AUDITREADY ENTERPRISE COMPLIANCE', margin + 25, 17, { maxWidth: maxTitleWidth });
      
      // Subtitle with date - portrait formatting
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric', 
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Generated on ${currentDate}`, margin + 25, 23);
      
      // Only show page number at bottom right if not first page
      if (pageNum > 1) {
        // Add page number at bottom right
        doc.setTextColor(127, 140, 141);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${pageNum}`, pageWidth - margin - 10, pageHeight - 10);
      }
      
      return 40; // Return Y position after header
    };

    // Calculate actual number of pages needed based on content
    let currentY = createPremiumHeader(1);
    
    // EXECUTIVE SUMMARY SECTION - portrait A4 optimized
    doc.setFillColor(231, 243, 255); // Light blue background
    doc.roundedRect(margin, currentY, pageWidth - (2 * margin), 50, 3, 3, 'F');
    
    // Summary title - portrait optimized
    doc.setTextColor(31, 78, 121);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('EXECUTIVE SUMMARY', margin + 8, currentY + 12);
    
    // Single column layout for portrait format
    
    // Single column layout with enhanced formatting
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SELECTED FRAMEWORKS:', margin + 8, currentY + 22);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    // Format frameworks properly for portrait with proper width constraint
    let yOffset = currentY + 28;
    const maxFrameworkWidth = pageWidth - (2 * margin) - 20; // Ensure frameworks fit within blue box
    selectedFrameworksList.forEach((framework) => {
      doc.text(`• ${framework}`, margin + 12, yOffset, { maxWidth: maxFrameworkWidth });
      yOffset += 5;
    });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const totalCatY = Math.max(yOffset + 2, currentY + 38);
    doc.text('TOTAL CATEGORIES:', margin + 8, totalCatY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`${(filteredUnifiedMappings || []).length} compliance domains analyzed`, margin + 55, totalCatY);
    
    // Coverage assessment with proper width constraint
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const coverageText = selectedFrameworksList.length > 3 ? 'Comprehensive Analysis' : 'Focused Analysis';
    const maxCoverageWidth = pageWidth - (2 * margin) - 20; // Ensure it fits within blue design
    doc.text(`Coverage: ${coverageText}`, margin + 8, totalCatY + 6, { maxWidth: maxCoverageWidth });
    
    if (selectedIndustrySector) {
      const sectorName = industrySectors?.find(s => s.id === selectedIndustrySector)?.name || '';
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Industry Focus: ${sectorName}`, margin + 8, totalCatY + 12);
    }
    
    // Add introduction section on first page
    currentY = totalCatY + 30;
    
    // Introduction section with professional content
    doc.setFillColor(248, 251, 253); // Very light gray-blue background
    doc.roundedRect(margin, currentY, pageWidth - (2 * margin), 120, 3, 3, 'F');
    
    // Introduction title
    doc.setTextColor(31, 78, 121);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('UNIFIED COMPLIANCE REQUIREMENTS', margin + 8, currentY + 15);
    
    // Introduction subtitle
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(52, 73, 94);
    doc.text('Streamlined Framework Integration for Enterprise Compliance', margin + 8, currentY + 22);
    
    // Introduction content
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const introText = [
      'This comprehensive compliance report presents unified requirements where multiple regulatory',
      'frameworks have been consolidated to simplify implementation across organizational departments.',
      '',
      'Our unified approach enables:',
      '• Streamlined compliance management across multiple standards simultaneously',
      '• Reduced complexity through intelligently consolidated requirements',
      '• Enhanced departmental coordination and consistent implementation',
      '• Clear mapping between different regulatory frameworks and standards',
      '• Simplified audit preparation with comprehensive requirement coverage',
      '',
      'Each category on the following pages contains:',
      '• Unified requirements combining all selected frameworks',
      '• Clean, consolidated requirements text for efficient implementation',
      '',
      'This approach reduces duplication and ensures comprehensive coverage while maintaining',
      'compliance with all selected standards.'
    ];
    
    let introY = currentY + 35;
    introText.forEach((line: string) => {
      if (line.startsWith('•')) {
        doc.setTextColor(31, 78, 121); // Blue for bullet points
        doc.text(line.substring(0, 1), margin + 8, introY);
        doc.setTextColor(44, 62, 80);
        doc.text(line.substring(1), margin + 11, introY);
      } else {
        doc.text(line, margin + 8, introY);
      }
      introY += line === '' ? 3 : 5;
    });
    
    currentY += 130;

    // FRAMEWORK LEGEND - Removed duplicate section since frameworks are already shown in Executive Summary
    // This reduces redundancy and cleans up the report
    currentY += 5;

    // 🎯 OPERATIONAL EXCELLENCE FOOTER FUNCTION - Fixed dimensions and cleaned title
    const createOperationalExcellenceFooter = (doc: jsPDF, startY: number, pageWidth: number, margin: number) => {
      // Check if there's enough space for footer, otherwise add new page  
      if (startY + 85 > pageHeight - margin) {
        doc.addPage();
        startY = 50;
      }
      
      // Professional subtitle for section
      doc.setTextColor(100, 116, 139); // slate-500
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('IMPLEMENTATION SCORECARD', margin, startY + 2);
      
      // Main header with clean title (no emoji/special chars)
      doc.setFillColor(16, 185, 129); // emerald-500
      doc.roundedRect(margin, startY + 5, pageWidth - (2 * margin), 12, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('OPERATIONAL EXCELLENCE INDICATORS', margin + 8, startY + 13);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Track these metrics to demonstrate audit readiness', margin + 8, startY + 15.5);
      
      // Enhanced 4-section grid layout with better spacing and fixed dimensions
      const totalGridWidth = pageWidth - (2 * margin);
      const gapSize = 3; // Smaller gaps to prevent overflow
      const sectionWidth = (totalGridWidth - (3 * gapSize)) / 4;
      const sectionHeight = 58; // Taller sections for more content without overflow
      let currentX = margin;
      const sectionY = startY + 22;
      
      // Helper function to create rounded sections with proper text wrapping
      const createSection = (x: number, bgColor: [number, number, number], borderColor: [number, number, number], textColor: [number, number, number], title: string, items: string[]) => {
        // Background with rounded corners
        doc.setFillColor(...bgColor);
        doc.roundedRect(x, sectionY, sectionWidth, sectionHeight, 3, 3, 'F');
        
        // Border with rounded corners
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(1.5);
        doc.roundedRect(x, sectionY, sectionWidth, sectionHeight, 3, 3, 'S');
        
        // Title with proper positioning - remove any special characters
        doc.setTextColor(...textColor);
        doc.setFontSize(8); // Even smaller font to prevent bleeding
        doc.setFont('helvetica', 'bold');
        const cleanTitle = title.replace(/[✅💡🎯]/gu, '').trim(); // Remove special chars
        doc.text(cleanTitle, x + 2, sectionY + 6); // Move up slightly
        
        // Items with proper text wrapping and spacing
        doc.setFontSize(7); // Smaller font for items
        doc.setFont('helvetica', 'normal');
        let currentItemY = sectionY + 12; // Start higher to give title more space
        
        items.forEach((item) => {
          if (currentItemY + 4 > sectionY + sectionHeight - 3) return; // Prevent overflow
          
          const cleanItem = item.replace(/[•◆▪→]/g, '').trim(); // Remove bullet points
          const maxWidth = sectionWidth - 4; // Leave margin
          
          // Simple text wrapping
          const words = cleanItem.split(' ');
          let line = '';
          
          for (const word of words) {
            const testLine = line + (line ? ' ' : '') + word;
            const textWidth = doc.getTextWidth(testLine);
            
            if (textWidth > maxWidth && line !== '') {
              // Print current line and start new one
              doc.text(line, x + 2, currentItemY);
              currentItemY += 4;
              if (currentItemY + 4 > sectionY + sectionHeight - 3) break; // Prevent overflow
              line = word;
            } else {
              line = testLine;
            }
          }
          
          // Print final line
          if (line && currentItemY + 4 <= sectionY + sectionHeight - 3) {
            doc.text(line, x + 2, currentItemY);
            currentItemY += 5;
          }
        });
        
        // Add subtle shadow effect (using light gray instead of transparency)
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.line(x + 1, sectionY + sectionHeight + 1, x + sectionWidth + 1, sectionY + sectionHeight + 1);
        doc.line(x + sectionWidth + 1, sectionY + 1, x + sectionWidth + 1, sectionY + sectionHeight + 1);
      };
      
      // Section 1: FOUNDATIONAL CONTROLS
      createSection(currentX, [239, 246, 255], [59, 130, 246], [30, 64, 175], 'FOUNDATIONAL CONTROLS', [
        'Comprehensive policy documentation',
        'Documented security procedures', 
        'Adequate resource allocation',
        'Staff training and awareness',
        'Management approval processes'
      ]);
      
      // Section 2: ADVANCED CONTROLS
      currentX += sectionWidth + gapSize;
      createSection(currentX, [236, 253, 245], [34, 197, 94], [20, 83, 45], 'ADVANCED CONTROLS', [
        '• Continuous monitoring systems',
        '• Regular security reviews',
        '• Integrated business processes',
        '• Performance metrics & KPIs',
        '• Automated control validation'
      ]);
      
      // Section 3: AUDIT-READY DOCUMENTATION
      currentX += sectionWidth + gapSize;
      createSection(currentX, [254, 243, 199], [245, 158, 11], [180, 83, 9], 'IMPLEMENTATION TRACKING', [
        '• Systematic implementation monitoring',
        '• Complete requirement coverage',
        '• Regular gap analysis',
        '• Documented corrective actions',
        '• Continuous improvement tracking'
      ]);
      
      // Section 4: PRO IMPLEMENTATION TIP
      currentX += sectionWidth + gapSize;
      createSection(currentX, [252, 231, 243], [236, 72, 153], [157, 23, 77], 'IMPLEMENTATION GUIDE', [
        '• Phase over 6-12 months',
        '• Start with foundational controls',
        '• Build monitoring capabilities',
        '• Implement automation gradually',
        '• Measure and demonstrate value'
      ]);
      
      return startY + sectionHeight + 35; // Extra space for proper footer spacing
    };

    // MAIN DATA TABLE - CLEAN AND COMPLETE
    const createStunningTable = (data: any[], startY: number, categoryNum?: number, totalCategories?: number) => {
      // Simplified structure: Category, Unified Requirements (only these 2 columns)
      const allHeaders = ['CATEGORY', 'UNIFIED REQUIREMENTS'];
      
      // Add category header for single category pages with better visibility
      if (data.length === 1 && categoryNum && totalCategories) {
        doc.setFillColor(231, 243, 255); // Light blue background
        doc.roundedRect(margin, startY, pageWidth - (2 * margin), 25, 3, 3, 'F');
        
        doc.setTextColor(31, 78, 121);
        doc.setFontSize(13); // Reduced from 16 to prevent text overflow
        doc.setFont('helvetica', 'bold');
        const categoryName = ProfessionalGuidanceService.formatCategoryName(data[0].category).replace(/^\d+\.\s*/, '');
        const maxTitleWidth = pageWidth - (2 * margin) - 20; // Ensure title fits within blue box
        const titleText = `CATEGORY ${categoryNum} OF ${totalCategories}: ${categoryName.toUpperCase()}`;
        doc.text(titleText, margin + 10, startY + 15, { maxWidth: maxTitleWidth });
        
        startY += 35;
      }
      
      // Prepare table data with COMPLETE content from actual service
      // Loading real unified guidance content from getGuidanceContent function
      const tableData = data.map((mapping) => {
        // Get unified requirements with clean formatting and better numbering
        // Use database content directly - no more hardcoded overrides
        let requirements = mapping.auditReadyUnified?.subRequirements || [];
        
        const cleanedRequirements = requirements.map((req: any) => {
          const text = typeof req === 'string' ? req : req.description || req.text || '';
          // For Governance & Leadership, preserve bold formatting
          if (mapping.category === 'Governance & Leadership') {
            return text; // Don't clean - preserve ** formatting
          }
          return ProfessionalGuidanceService.cleanText(text);
        }).filter((req: string) => req && req.trim().length > 0); // Preserve all non-empty requirements
        
        // Also check for requirements in the title if subrequirements are minimal
        if (cleanedRequirements.length === 0 && mapping.auditReadyUnified?.title) {
          const titleText = ProfessionalGuidanceService.cleanText(mapping.auditReadyUnified.title);
          if (titleText.length > 10) {
            cleanedRequirements.push(titleText);
          }
        }
        
        // Format ALL requirements with proper lettering - ensure complete content
        let unifiedRequirements = '';
        if (cleanedRequirements.length > 0) {
          // Add lettering to all requirements consistently
          
          unifiedRequirements = cleanedRequirements.map((req: string, idx: number) => {
            const letter = String.fromCharCode(97 + idx); // a, b, c, d, ... p, etc.
            
            // Clean the requirement text
            let cleanReq = req.trim();
            
            // Add lettering if not already present
            if (cleanReq.match(/^[a-z]\)/)) {
              return cleanReq;
            } else {
              // Remove existing numbering/lettering and add proper lettering
              cleanReq = cleanReq.replace(/^[a-z]\)\s*/i, '').replace(/^\d+\.\s*/, '');
              return `${letter}) ${cleanReq}`;
            }
          }).join('\n\n');
        } else {
          // Fallback: try to extract from title or description
          const fallbackContent = mapping.auditReadyUnified?.title || mapping.auditReadyUnified?.description || '';
          if (fallbackContent) {
            const cleanTitle = ProfessionalGuidanceService.cleanText(fallbackContent);
            unifiedRequirements = `a) ${cleanTitle}`;
          } else {
            unifiedRequirements = 'Complete unified requirements available in application interface';
          }
        }
        
        // Get unified guidance content using the enhanced service with better formatting
        
        
        // Get ACTUAL unified guidance content from the service (same as buttons)
        const actualGuidanceContent = mapping.category ? getGuidanceContent() : 'No category specified';
        
        // Clean and format the actual guidance content for PDF
        let unifiedGuidance = '';
        if (actualGuidanceContent && actualGuidanceContent.length > 100) {
          // Process the actual guidance content line by line for proper formatting
          const guidanceLines = actualGuidanceContent.split('\n');
          const formattedLines: string[] = [];
          
          let currentSection = '';
          let isInRequirementsSection = false;
          
          let inOperationalExcellenceSection = false;
          
          guidanceLines.forEach((line) => {
            const cleanLine = line.replace(/\*\*/g, '').trim();
            
            if (cleanLine === '') {
              if (currentSection && !inOperationalExcellenceSection) formattedLines.push(''); 
              return;
            }
            
            // Mark start of OPERATIONAL EXCELLENCE section to skip everything after
            if (cleanLine.includes('🎯 OPERATIONAL EXCELLENCE INDICATORS')) {
              inOperationalExcellenceSection = true;
              return;
            }
            
            // Skip everything in operational excellence section for PDF
            if (inOperationalExcellenceSection) {
              return;
            }
            
            // For PDF, we want ALL content EXCEPT operational excellence
            // No filtering of guidance content for PDF
            
            // Look for requirement patterns to start processing content
            if (cleanLine.match(/^[a-z]\)/) || cleanLine.includes('**a)') || isInRequirementsSection) {
              isInRequirementsSection = true;
            }
            
            // Skip the "UNDERSTANDING THE REQUIREMENTS" line but add our header once
            if (cleanLine.includes('UNDERSTANDING THE REQUIREMENTS')) {
              if (!formattedLines.some(line => line.includes('IMPLEMENTATION GUIDANCE:'))) {
                formattedLines.push('IMPLEMENTATION GUIDANCE:');
                formattedLines.push('');
                formattedLines.push(''); // Extra spacing after header
              }
              return;
            }
            
            // Process requirements explanation if we're in the right section
            if (isInRequirementsSection && cleanLine.length > 5) {
              // Format subsection headers (a), b), c), etc.) with proper spacing
              if (cleanLine.match(/^[a-z]\)/)) {
                // Extract letter and title, make title bold
                const match = cleanLine.match(/^([a-z]\))\s*(.+)$/);
                if (match && match[2]) {
                  const letter = match[1];
                  const title = match[2];
                  
                  // Add extra spacing before each new requirement section (except the first one)
                  if (formattedLines.length > 0 && !formattedLines[formattedLines.length - 1]?.startsWith('IMPLEMENTATION GUIDANCE:')) {
                    formattedLines.push(''); // Extra blank line before new requirement
                    formattedLines.push(''); // Second blank line for visual separation
                  }
                  
                  // Split at colon to make only the part before colon bold
                  if (title?.includes(':')) {
                    const parts = title.split(':');
                    formattedLines.push(`${letter} ${parts[0]?.trim() || ''}:${parts.slice(1).join(':')}`);
                  } else {
                    formattedLines.push(`${letter} ${title?.trim() || ''}`);
                  }
                  formattedLines.push(''); // Add spacing after headers
                }
              } else {
                // Regular content with proper formatting and line breaks
                const cleanedContent = ProfessionalGuidanceService.cleanText(cleanLine);
                if (cleanedContent.length > 10) {  // Reduced threshold to capture more content
                  // Wrap long content for better readability in PDF
                  if (cleanedContent.length > 120) {
                    // Split at logical break points (sentences, but preserve readability)
                    const words = cleanedContent.split(' ');
                    let currentLine = '';
                    
                    words.forEach(word => {
                      if ((currentLine + word).length > 100 && currentLine.length > 0) {
                        formattedLines.push(currentLine.trim());
                        currentLine = word + ' ';
                      } else {
                        currentLine += word + ' ';
                      }
                    });
                    
                    if (currentLine.trim()) {
                      formattedLines.push(currentLine.trim());
                    }
                    
                    formattedLines.push(''); // Add spacing after wrapped content
                  } else {
                    formattedLines.push(cleanedContent);
                  }
                } else if (cleanedContent.length > 0) {
                  // Include even shorter content to ensure nothing is missed
                  formattedLines.push(cleanedContent);
                }
              }
            }
          });
          
          // Join the formatted lines and clean markdown formatting
          unifiedGuidance = this.cleanMarkdownFormatting(formattedLines.join('\n').trim());
        }
        
        // Fallback if no proper guidance content found
        if (!unifiedGuidance || unifiedGuidance.length < 50) {
          unifiedGuidance = 'Detailed implementation guidance available in application interface';
        }
        
        // Collect all framework references for the References column with proper formatting
        const references: string[] = [];
        
        // Collect ALL framework references with proper formatting and titles
        const frameworksToCheck = [
          { key: 'iso27001', title: 'ISO 27001:2022', selected: selectedFrameworks.iso27001 },
          { key: 'iso27002', title: 'ISO 27002:2022', selected: selectedFrameworks.iso27002 },
          { key: 'cisControls', title: `CIS Controls - ${selectedFrameworks.cisControls?.toString().toUpperCase() || 'IG3'} (v8.1.2)`, selected: selectedFrameworks.cisControls },
          { key: 'gdpr', title: 'GDPR (EU 2016/679)', selected: selectedFrameworks.gdpr },
          { key: 'nis2', title: 'NIS2 Directive (EU 2022/2555)', selected: selectedFrameworks.nis2 },
          { key: 'dora', title: 'DORA (EU 2022/2554)', selected: selectedFrameworks.dora }
        ];
        
        frameworksToCheck.forEach(framework => {
          if (framework.selected && mapping.frameworks?.[framework.key]?.length) {
            const items = mapping.frameworks[framework.key];
            
            // Get all codes and titles
            const codesList: string[] = [];
            items.forEach((item: any) => {
              const code = ProfessionalGuidanceService.cleanText(item.code || '');
              const title = ProfessionalGuidanceService.cleanText(item.title || '');
              
              if (code) {
                if (title && title.length > 0 && title !== code) {
                  codesList.push(`${code}: ${title.substring(0, 60)}${title.length > 60 ? '...' : ''}`);
                } else {
                  codesList.push(code);
                }
              }
            });
            
            if (codesList.length > 0) {
              references.push(`${framework.title}:\n${codesList.join('\n')}`);
            }
          }
        });
        
        // Format references with proper structure
        const referencesText = references.length > 0 
          ? references.join('\n\n')
          : 'Complete framework mappings available in application';
        
        return [
          ProfessionalGuidanceService.formatCategoryName(mapping.category || '').toUpperCase(),
          unifiedRequirements  // Only show unified requirements text
        ];
      });

      // 🎨 CREATE THE STUNNING TABLE WITH ENHANCED VISIBILITY AND FORMATTING
      autoTable(doc, {
        head: [allHeaders],
        body: tableData,
        startY: startY,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 9,  // Compact font for better fitting
          cellPadding: { top: 8, right: 6, bottom: 8, left: 6 },  // Increased padding for better readability
          lineColor: [180, 180, 180],
          lineWidth: 0.5,
          font: 'helvetica',
          valign: 'top',
          overflow: 'linebreak',
          cellWidth: 'wrap',
          textColor: [40, 40, 40]
        },
        headStyles: {
          fillColor: [31, 78, 121],
          textColor: [255, 255, 255],
          fontSize: 8,  // Smaller headers for better fit
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          cellPadding: { top: 6, right: 3, bottom: 6, left: 3 }
        },
        columnStyles: {
          0: { 
            cellWidth: 50, // Category - wider for better readability
            fontStyle: 'bold', 
            fillColor: [231, 243, 255], 
            fontSize: 10,
            textColor: [31, 78, 121],
            halign: 'center'
          },
          1: { 
            cellWidth: 130, // Unified Requirements - much wider to use full page width
            overflow: 'linebreak', 
            cellPadding: { top: 8, right: 8, bottom: 8, left: 8 }, 
            fontSize: 9,
            valign: 'top'
          }
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        didDrawCell: (data: any) => {
          // Enhanced cell styling with better borders
          if (data.section === 'head') {
            doc.setDrawColor(21, 58, 101);
            doc.setLineWidth(1.5);
            doc.line(data.cell.x, data.cell.y + data.cell.height, 
                    data.cell.x + data.cell.width, data.cell.y + data.cell.height);
          }
          
          // Category column special styling with enhanced visibility
          if (data.column.index === 0 && data.section === 'body') {
            doc.setTextColor(31, 78, 121);
            doc.setFont('helvetica', 'bold');
          }
          
          // Enhanced styling for Unified Requirements column (now column 1)
          if (data.column.index === 1 && data.section === 'body') {
            // Set enhanced styling for requirements content
            doc.setTextColor(40, 40, 40);
            doc.setFont('helvetica', 'normal');
          }
          
          // Add enhanced borders to separate columns better
          if (data.section === 'body') {
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.5);
            if (data.column.index < 1) {  // Only add border between the 2 columns
              doc.line(
                data.cell.x + data.cell.width, data.cell.y,
                data.cell.x + data.cell.width, data.cell.y + data.cell.height
              );
            }
          }
        },
        willDrawCell: (data: any) => {
          // Pre-process bold formatting in Unified Guidance column
          if (data.column.index === 2 && data.section === 'body') {
            const text = Array.isArray(data.cell.text) ? data.cell.text.join(' ') : data.cell.text;
            if (typeof text === 'string' && text.includes('**')) {
              // Process bold markers and adjust cell content
              data.cell.text = text.split('\n');
            }
          }
        },
        
        didParseCell: (data: any) => {
          // Enhanced header styling for better A4 visibility
          if (data.section === 'head') {
            data.cell.styles.fontSize = 13;
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [255, 255, 255];
          }
          
          // Column-specific font size optimizations
          if (data.section === 'body') {
            switch (data.column.index) {
              case 0: // Category column
                data.cell.styles.fontSize = 9;
                data.cell.styles.fontStyle = 'bold';
                break;
              case 1: // Requirements column
                data.cell.styles.fontSize = 8;
                break;
              case 2: // Guidance column
                data.cell.styles.fontSize = 8;
                break;
              case 3: // References column
                data.cell.styles.fontSize = 7;
                break;
            }
          }
          
          // Optimized auto-adjust row height for proper fitting
          if (data.section === 'body') {
            const text = Array.isArray(data.cell.text) ? data.cell.text.join('') : (data.cell.text || '');
            const lines = Math.ceil(text.length / 45); // Better estimation for compact fitting
            
            // Compact row heights to prevent text bleeding
            if (lines > 15) {
              data.cell.styles.minCellHeight = Math.max(35, lines * 2.2);
            } else if (lines > 10) {
              data.cell.styles.minCellHeight = Math.max(28, lines * 2.5);
            } else if (lines > 6) {
              data.cell.styles.minCellHeight = Math.max(22, lines * 2.8);
            } else if (lines > 3) {
              data.cell.styles.minCellHeight = Math.max(18, lines * 3.0);
            } else {
              data.cell.styles.minCellHeight = 16; // Compact minimum
            }
            
            // Compact and consistent padding
            data.cell.styles.cellPadding = { top: 4, right: 3, bottom: 4, left: 3 };
          }
        },
        showHead: 'everyPage',
        theme: 'grid',
        tableWidth: 'auto',
        pageBreak: 'auto'
      });

      // Get the final Y position after the table
      const finalY = (doc as any).lastAutoTable?.finalY || startY + 100;
      
      // Add OPERATIONAL EXCELLENCE INDICATORS as 4-section footer
      const footerY = finalY + 15;
      createOperationalExcellenceFooter(doc, footerY, pageWidth, margin);
      
      return finalY + 80; // Extra space for footer
    };

    // Start categories on page 2 - Add new page after introduction
    doc.addPage();
    let pageNum = 2;
    currentY = createPremiumHeader(pageNum);
    
    // Create separate sections for each category with page breaks
    const allData = filteredUnifiedMappings || [];
    
    allData.forEach((mapping, categoryIndex) => {
      // Add page break before each category (except the first one)
      if (categoryIndex > 0) {
        doc.addPage();
        pageNum++;
        currentY = createPremiumHeader(pageNum); // Page number only
      }
      
      // Create a beautiful category section for this single category
      currentY = createStunningTable([mapping], currentY, categoryIndex + 1, allData.length);
    });

    // Add footer to first page
    doc.setTextColor(127, 140, 141);
    doc.setFontSize(8);
    doc.text('This report contains confidential compliance analysis. © AuditReady Enterprise', 
             margin, pageHeight - 10);
    
    // Check if we need additional pages based on final Y position
    const finalY = (doc as any).lastAutoTable?.finalY || currentY;
    const totalPages = Math.ceil((finalY - 35) / (pageHeight - 80)) || 1;

    // Add statistics page
    doc.addPage();
    const statsPageNum = totalPages + 1;
    currentY = createPremiumHeader(statsPageNum);
    
    // STATISTICS AND INSIGHTS PAGE - CLEAN VERSION
    doc.setFillColor(247, 249, 252);
    doc.roundedRect(margin, currentY, pageWidth - (2 * margin), 60, 3, 3, 'F');
    
    doc.setTextColor(31, 78, 121);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPLIANCE ANALYTICS DASHBOARD', margin + 5, currentY + 12);
    
    // Coverage statistics
    currentY += 25;
    const statsData: string[][] = [];
    selectedFrameworksList.forEach((framework) => {
      const mapped = (filteredUnifiedMappings || []).reduce((count, mapping) => {
        const frameworkKey = framework.includes('(') ? framework.split('(')[0]?.trim() || framework : framework;
        return count + (Object.keys(mapping.frameworks || {}).includes(frameworkKey) ? 1 : 0);
      }, 0);
      
      const coverage = Math.round((mapped / Math.max((filteredUnifiedMappings || []).length, 1)) * 100);
      const status = coverage >= 90 ? 'Excellent' : coverage >= 70 ? 'Good' : 'Needs Review';
      
      statsData.push([framework, mapped.toString(), `${coverage}%`, status]);
    });

    // Statistics table
    autoTable(doc, {
      head: [['Framework', 'Mapped Categories', 'Coverage %', 'Status']],
      body: statsData,
      startY: currentY,
      margin: { left: margin + 20, right: margin + 20 },
      styles: {
        fontSize: 10,
        cellPadding: 4
      },
      headStyles: {
        fillColor: [47, 82, 51],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { halign: 'center', cellWidth: 30 },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'center', cellWidth: 40 }
      },
      theme: 'striped'
    });

    currentY = ((doc as any).lastAutoTable?.finalY || currentY) + 20;
    
    // RECOMMENDATIONS SECTION
    doc.setFillColor(240, 248, 240);
    doc.roundedRect(margin, currentY, pageWidth - (2 * margin), 45, 3, 3, 'F');
    
    doc.setTextColor(47, 82, 51);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('EXECUTIVE RECOMMENDATIONS', margin + 5, currentY + 10);
    
    const recommendations = [
      'Prioritize categories with multi-framework coverage for maximum compliance ROI',
      'Focus implementation efforts on areas with highest regulatory impact',
      'Establish continuous monitoring for all mapped compliance requirements',
      'Schedule quarterly reviews to maintain compliance posture effectiveness'
    ];
    
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    recommendations.forEach((rec, index) => {
      // Add bullet point for each recommendation
      doc.text(`\u2022 ${rec}`, margin + 5, currentY + 18 + (index * 6));
    });

    // Final footer - clean version
    doc.setTextColor(127, 140, 141);
    doc.setFontSize(8);
    doc.text('Enterprise-Grade Compliance Analysis | Confidential Report', 
             margin, pageHeight - 15);
    doc.text(`Report ID: AR-${Date.now().toString(36).toUpperCase()}`, 
             pageWidth - margin - 60, pageHeight - 15);

    // SAVE THE PDF
    const timestamp = new Date().toISOString().split('T')[0];
    const frameworkSuffix = selectedFrameworksList.length > 0 
      ? `_${selectedFrameworksList.join('_').replace(/[^a-zA-Z0-9]/g, '_')}` 
      : '';
    const filename = `AuditReady_Premium_Compliance_Report_${timestamp}${frameworkSuffix}.pdf`;

    doc.save(filename);
    
    console.log(`🎨 Exported stunning PDF compliance report: ${filename}`);
    console.log(`📄 ${(filteredUnifiedMappings || []).length} categories across 3 premium-designed pages`);
  }
}