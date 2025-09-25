import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  File, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GeneratedContent } from '@/services/compliance/DynamicContentGenerator';
import { FrameworkSelection } from '@/services/compliance/FrameworkMappingResolver';
import * as ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ComplianceExportMenuProps {
  data: Map<string, GeneratedContent>;
  frameworks: FrameworkSelection;
  selectedCategory?: string;
  disabled?: boolean;
}

// Type declaration for jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

export function ComplianceExportMenu({
  data,
  frameworks,
  selectedCategory,
  disabled = false
}: ComplianceExportMenuProps) {
  
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<{ type: string; timestamp: Date } | null>(null);

  const getSelectedFrameworkNames = () => {
    const names: string[] = [];
    if (frameworks.iso27001) names.push('ISO 27001');
    if (frameworks.iso27002) names.push('ISO 27002');
    if (frameworks.cisControls) names.push(`CIS Controls ${frameworks.cisControls.toUpperCase()}`);
    if (frameworks.gdpr) names.push('GDPR');
    if (frameworks.nis2) names.push('NIS2');
    return names;
  };

  const generateFileName = (type: string, category?: string) => {
    const frameworkNames = getSelectedFrameworkNames();
    const frameworkSuffix = frameworkNames.length > 0 ? `_${frameworkNames.join('_').replace(/\s+/g, '_')}` : '';
    const categorySuffix = category ? `_${category.replace(/\s+/g, '_')}` : '_All_Categories';
    const timestamp = new Date().toISOString().split('T')[0];
    
    return `Compliance_Requirements${categorySuffix}${frameworkSuffix}_${timestamp}.${type}`;
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(0, 150, 200);
      doc.text('Compliance Requirements Report', margin, 30);
      
      // Metadata
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 40);
      
      const frameworkNames = getSelectedFrameworkNames();
      if (frameworkNames.length > 0) {
        doc.text(`Frameworks: ${frameworkNames.join(', ')}`, margin, 47);
      }
      
      if (selectedCategory) {
        doc.text(`Category: ${selectedCategory}`, margin, 54);
      }
      
      let yPos = 70;
      
      const dataToExport = selectedCategory && data.has(selectedCategory) 
        ? [[selectedCategory, data.get(selectedCategory)!]] 
        : Array.from(data.entries());
      
      for (const [categoryName, content] of dataToExport) {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 30;
        }
        
        // Category header
        doc.setFontSize(16);
        doc.setTextColor(0, 100, 150);
        doc.text(categoryName, margin, yPos);
        yPos += 10;
        
        // Requirements table
        if (content.unifiedRequirements.length > 0) {
          const tableData = content.unifiedRequirements.map(req => [
            req.title,
            req.frameworks.join(', '),
            req.priority >= 80 ? 'High' : req.priority >= 60 ? 'Medium' : 'Low',
            req.description.substring(0, 200) + (req.description.length > 200 ? '...' : '')
          ]);
          
          autoTable(doc, {
            head: [['Requirement', 'Frameworks', 'Priority', 'Description']],
            body: tableData,
            startY: yPos,
            margin: { left: margin, right: margin },
            styles: {
              fontSize: 8,
              cellPadding: 3
            },
            headStyles: {
              fillColor: [0, 150, 200],
              textColor: [255, 255, 255],
              fontSize: 9
            },
            columnStyles: {
              0: { cellWidth: 40 },
              1: { cellWidth: 30 },
              2: { cellWidth: 20 },
              3: { cellWidth: 'auto' }
            }
          });
          
          yPos = doc.lastAutoTable.finalY + 10;
        }
      }
      
      doc.save(generateFileName('pdf', selectedCategory));
      setLastExport({ type: 'PDF', timestamp: new Date() });
      
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    
    try {
      // Create workbook with ExcelJS (secure replacement for xlsx)
      const workbook = new ExcelJS.Workbook();
      
      const dataToExport = selectedCategory && data.has(selectedCategory) 
        ? [[selectedCategory, data.get(selectedCategory)!]] 
        : Array.from(data.entries());
      
      // Summary sheet
      const summarySheet = workbook.addWorksheet('Summary');
      
      const summaryData = [
        ['Compliance Requirements Export'],
        [''],
        ['Generated:', new Date().toLocaleDateString()],
        ['Frameworks:', getSelectedFrameworkNames().join(', ')],
        ['Categories:', dataToExport.length.toString()],
        ['Total Requirements:', dataToExport.reduce((sum, [, content]) => sum + content.unifiedRequirements.length, 0).toString()],
        [''],
        ['Category Summary:'],
        ['Category', 'Requirements', 'High Priority', 'Medium Priority', 'Low Priority'],
        ...dataToExport.map(([categoryName, content]) => [
          categoryName,
          content.unifiedRequirements.length,
          content.unifiedRequirements.filter(req => req.priority >= 80).length,
          content.unifiedRequirements.filter(req => req.priority >= 60 && req.priority < 80).length,
          content.unifiedRequirements.filter(req => req.priority < 60).length
        ])
      ];
      
      summaryData.forEach(row => {
        summarySheet.addRow(row);
      });
      
      // Individual category sheets
      for (const [categoryName, content] of dataToExport) {
        if (content.unifiedRequirements.length === 0) continue;
        
        const sheetName = categoryName.substring(0, 31); // Excel sheet name limit
        const categorySheet = workbook.addWorksheet(sheetName);
        
        // Add header row
        categorySheet.addRow(['Requirement ID', 'Title', 'Description', 'Frameworks', 'Priority', 'Priority Level', 'Sub-Requirements', 'References']);
        
        // Add data rows
        content.unifiedRequirements.forEach(req => {
          categorySheet.addRow([
            req.id,
            req.title,
            req.description,
            req.frameworks.join(', '),
            req.priority,
            req.priority >= 80 ? 'High' : req.priority >= 60 ? 'Medium' : 'Low',
            req.subRequirements.join(' | '),
            req.references.map(ref => `${ref.framework}: ${ref.codes.join(', ')}`).join(' | ')
          ]);
        });
        
        // Set column widths
        categorySheet.columns = [
          { width: 15 }, // ID
          { width: 25 }, // Title
          { width: 50 }, // Description
          { width: 20 }, // Frameworks
          { width: 10 }, // Priority
          { width: 12 }, // Priority Level
          { width: 60 }, // Sub-Requirements
          { width: 40 }  // References
        ];
      }
      
      // Generate and download file securely using ExcelJS
      const filename = generateFileName('xlsx', selectedCategory);
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
      setLastExport({ type: 'Excel', timestamp: new Date() });
      
    } catch (error) {
      console.error('Excel export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToMarkdown = async () => {
    setIsExporting(true);
    
    try {
      const dataToExport = selectedCategory && data.has(selectedCategory) 
        ? [[selectedCategory, data.get(selectedCategory)!]] 
        : Array.from(data.entries());
      
      const content = [
        '# Compliance Requirements Report',
        '',
        `**Generated:** ${new Date().toLocaleDateString()}`,
        `**Frameworks:** ${getSelectedFrameworkNames().join(', ')}`,
        selectedCategory ? `**Category:** ${selectedCategory}` : `**Categories:** ${dataToExport.length}`,
        '',
        '## Summary',
        '',
        '| Category | Requirements | High Priority | Medium Priority | Low Priority |',
        '|----------|-------------|---------------|-----------------|--------------|',
        ...dataToExport.map(([categoryName, content]) => 
          `| ${categoryName} | ${content.unifiedRequirements.length} | ${content.unifiedRequirements.filter(req => req.priority >= 80).length} | ${content.unifiedRequirements.filter(req => req.priority >= 60 && req.priority < 80).length} | ${content.unifiedRequirements.filter(req => req.priority < 60).length} |`
        ),
        '',
        '## Requirements Details',
        '',
        ...dataToExport.flatMap(([categoryName, content]) => [
          `### ${categoryName}`,
          '',
          ...content.unifiedRequirements.map(req => [
            `#### ${req.title}`,
            '',
            `**Frameworks:** ${req.frameworks.join(', ')}`,
            `**Priority:** ${req.priority >= 80 ? 'High' : req.priority >= 60 ? 'Medium' : 'Low'} (${req.priority})`,
            '',
            `**Description:**`,
            req.description,
            '',
            ...(req.subRequirements.length > 0 ? [
              '**Implementation Details:**',
              ...req.subRequirements.map(sub => `- ${sub}`),
              ''
            ] : []),
            ...(req.references.length > 0 ? [
              '**Framework References:**',
              ...req.references.map(ref => `- **${ref.framework}:** ${ref.codes.join(', ')}`),
              ''
            ] : []),
            '---',
            ''
          ]).flat(),
          ''
        ])
      ].join('\n');
      
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = generateFileName('md', selectedCategory);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setLastExport({ type: 'Markdown', timestamp: new Date() });
      
    } catch (error) {
      console.error('Markdown export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getTotalRequirements = () => {
    if (selectedCategory && data.has(selectedCategory)) {
      return data.get(selectedCategory)!.unifiedRequirements.length;
    }
    return Array.from(data.values()).reduce((sum, content) => sum + content.unifiedRequirements.length, 0);
  };

  const hasData = data.size > 0 && getTotalRequirements() > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled || !hasData || isExporting}
          className="text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/10 disabled:opacity-50"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export
          {hasData && (
            <Badge variant="secondary" className="ml-2">
              {getTotalRequirements()}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 bg-black/95 backdrop-blur-md border-gray-800">
        {!hasData ? (
          <DropdownMenuItem disabled>
            <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />
            No data to export
          </DropdownMenuItem>
        ) : (
          <>
            <div className="px-2 py-1.5 text-xs text-gray-400">
              {selectedCategory ? `Category: ${selectedCategory}` : `All Categories (${data.size})`}
            </div>
            <DropdownMenuSeparator className="bg-gray-800" />
            
            <DropdownMenuItem onClick={exportToPDF}>
              <FileText className="h-4 w-4 mr-2 text-red-400" />
              Export as PDF
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={exportToExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2 text-green-400" />
              Export as Excel
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={exportToMarkdown}>
              <File className="h-4 w-4 mr-2 text-blue-400" />
              Export as Markdown
            </DropdownMenuItem>
            
            {lastExport && (
              <>
                <DropdownMenuSeparator className="bg-gray-800" />
                <div className="px-2 py-1.5 text-xs text-gray-500 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  Last: {lastExport.type} at {lastExport.timestamp.toLocaleTimeString()}
                </div>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}