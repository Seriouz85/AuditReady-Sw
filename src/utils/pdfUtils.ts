import { RefObject } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { toast } from './toast';

interface AssessmentPDFData {
  title: string;
  status: string;
  progress: number;
  assessor: string;
  startDate: string;
  endDate?: string;
  description?: string;
  // Enhanced Assessment Summary Structure
  assessmentSummary: {
    assessmentNotes?: string;
    evidence?: string;
    attachments?: Array<{
      filename: string;
      description: string;
      size?: string;
      type?: string;
    }>;
  };
  standards: Array<{ name: string; version: string }>;
  summary: {
    totalRequirements: number;
    fulfilled: number;
    partial: number;
    notFulfilled: number;
    notApplicable: number;
  };
  requirements: Array<{
    code: string;
    name: string;
    description: string;
    status: string;
    notes?: string;
    evidence?: string;
  }>;
  // Additional metadata for professional presentation
  metadata?: {
    organizationName?: string;
    reportType?: string;
    confidentialityLevel?: string;
    version?: string;
  };
}

/**
 * Visual PDF generation for Assessment Reports
 * Captures the actual visual design with cards, circles, and colors
 */
export const generatePDF = async (
  contentRef: RefObject<HTMLElement>,
  title: string = 'Assessment Report',
  onFinish?: () => void,
  assessmentData?: any
): Promise<void> => {
  try {
    if (!contentRef.current) {
      throw new Error('Content reference is not available');
    }

    // First, try visual capture approach
    try {
      await generateVisualPDF(contentRef, title, onFinish);
      return;
    } catch (visualError) {
      console.warn('Visual PDF generation failed, falling back to text-based PDF:', visualError);
      
      // Fallback to text-based PDF if visual capture fails
      const pdfData = assessmentData || extractAssessmentDataFromHTML(contentRef.current);
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      generateProfessionalAssessmentPDF(doc, pdfData, title);

      const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast.success('PDF exported successfully (text format)');
      if (onFinish) onFinish();
    }
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF');
    if (onFinish) onFinish();
  }
};

/**
 * Generate visual PDF using html2canvas - preserves design elements
 */
async function generateVisualPDF(
  contentRef: RefObject<HTMLElement>,
  title: string,
  onFinish?: () => void
): Promise<void> {
  if (!contentRef.current) {
    throw new Error('Content reference is not available');
  }

  const element = contentRef.current;
  
  // Ensure all styles are loaded and images are rendered
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Configure html2canvas for high quality capture
  const canvas = await html2canvas(element, {
    scale: 2, // Higher resolution
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    scrollX: 0,
    scrollY: 0,
    width: element.scrollWidth,
    height: element.scrollHeight,
    onclone: (clonedDoc) => {
      // Ensure all gradients and styles are preserved in the cloned document
      const clonedElement = clonedDoc.querySelector('[data-assessment-report]') || 
                           clonedDoc.querySelector('.assessment-report-content');
      if (clonedElement) {
        // Force visibility and remove any transforms that might hide content
        (clonedElement as HTMLElement).style.transform = 'none';
        (clonedElement as HTMLElement).style.visibility = 'visible';
        (clonedElement as HTMLElement).style.opacity = '1';
      }
    }
  });

  // Create PDF with appropriate dimensions
  const imgWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  const doc = new jsPDF({
    orientation: imgHeight > pageHeight ? 'portrait' : 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const actualPageHeight = doc.internal.pageSize.getHeight();
  
  // Convert canvas to image data
  const imgData = canvas.toDataURL('image/png');
  
  // If content fits on one page
  if (imgHeight <= actualPageHeight) {
    doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  } else {
    // Multi-page PDF - split the content
    let position = 0;
    let pageIndex = 0;
    
    while (position < imgHeight) {
      if (pageIndex > 0) {
        doc.addPage();
      }
      
      const remainingHeight = imgHeight - position;
      const currentPageHeight = Math.min(actualPageHeight, remainingHeight);
      
      // Create a new canvas for this page section
      const pageCanvas = document.createElement('canvas');
      const pageContext = pageCanvas.getContext('2d');
      
      if (pageContext) {
        pageCanvas.width = canvas.width;
        pageCanvas.height = (currentPageHeight * canvas.width) / imgWidth;
        
        // Draw the portion of the original canvas for this page
        pageContext.drawImage(
          canvas,
          0, (position * canvas.width) / imgWidth, // Source x, y
          canvas.width, pageCanvas.height, // Source width, height
          0, 0, // Destination x, y
          pageCanvas.width, pageCanvas.height // Destination width, height
        );
        
        const pageImgData = pageCanvas.toDataURL('image/png');
        doc.addImage(pageImgData, 'PNG', 0, 0, imgWidth, currentPageHeight);
      }
      
      position += actualPageHeight;
      pageIndex++;
    }
  }
  
  // Add page numbers and footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages} - Generated by AuditReady Platform`,
      pageWidth / 2,
      actualPageHeight - 5,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  
  toast.success('PDF exported successfully with visual design!');
  if (onFinish) onFinish();
}

/**
 * Extract assessment data from HTML content (fallback only)
 */
function extractAssessmentDataFromHTML(element: HTMLElement | null): AssessmentPDFData {
  console.warn('Using fallback HTML extraction - should pass assessment data directly');
  
  return {
    title: 'Assessment Report',
    status: 'In Progress',
    progress: 0,
    assessor: 'Unknown',
    startDate: new Date().toLocaleDateString(),
    description: 'No description available',
    notes: undefined,
    evidence: undefined,
    standards: [{ name: 'Unknown Standard', version: '' }],
    summary: {
      totalRequirements: 0,
      fulfilled: 0,
      partial: 0,
      notFulfilled: 0,
      notApplicable: 0
    },
    requirements: []
  };
}

/**
 * Generate professional cybersecurity assessment PDF using jsPDF
 * Conservative, clean design for enterprise cybersecurity assessments
 */
function generateProfessionalAssessmentPDF(doc: jsPDF, data: AssessmentPDFData, title: string): void {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPos = 20;
  
  // Simple, professional header - no patterns or excessive colors
  doc.setDrawColor(100, 100, 100); // Gray border
  doc.setLineWidth(0.5);
  doc.line(20, 15, pageWidth - 20, 15); // Top line
  
  // Company/Platform branding - simple text
  doc.setTextColor(50, 50, 50); // Dark gray, not black
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('AuditReady Security Platform', 20, 25);
  
  // Document title - clean and centered
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(data.title, pageWidth / 2, 40, { align: 'center' });
  
  // Report metadata - right aligned, simple
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Generated: ${reportDate}`, pageWidth - 20, 25, { align: 'right' });
  
  const confidentiality = data.metadata?.confidentialityLevel || 'CONFIDENTIAL';
  doc.text(`Classification: ${confidentiality}`, pageWidth - 20, 35, { align: 'right' });
  
  // Bottom border line
  doc.line(20, 50, pageWidth - 20, 50);
  
  // Reset colors and position
  doc.setTextColor(40, 40, 40); // Dark gray for body text
  yPos = 65;
  
  // Executive Summary - clean section header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Executive Summary', 20, yPos);
  
  // Simple underline
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  doc.line(20, yPos + 2, 120, yPos + 2);
  
  yPos += 10;
  
  // Summary details in clean table format
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  
  const leftCol = 20;
  const rightCol = 110;
  const lineHeight = 6;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Assessment Type:', leftCol, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.standards.map(s => s.name).join(', '), rightCol, yPos);
  yPos += lineHeight;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Status:', leftCol, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.status.toUpperCase(), rightCol, yPos);
  yPos += lineHeight;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Assessor:', leftCol, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.assessor, rightCol, yPos);
  yPos += lineHeight;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Compliance Score:', leftCol, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.progress}%`, rightCol, yPos);
  yPos += lineHeight;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Start Date:', leftCol, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.startDate, rightCol, yPos);
  yPos += lineHeight;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Report Date:', leftCol, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString(), rightCol, yPos);
  
  yPos += 15;
  
  // ASSESSMENT SUMMARY SECTION (Key requirement from user)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Assessment Summary', 20, yPos);
  
  // Simple underline
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  doc.line(20, yPos + 2, 140, yPos + 2);
  
  yPos += 12;
  
  // 1. ASSESSMENT NOTES SECTION
  if (data.assessmentSummary?.assessmentNotes) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('1. Assessment Notes', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    // Clean and format assessment notes
    const cleanNotes = data.assessmentSummary.assessmentNotes
      .replace(/🎯|📋|🔍|⚡|•/g, '') // Remove emojis
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .trim();
    
    const notesLines = doc.splitTextToSize(cleanNotes, pageWidth - 50);
    doc.text(notesLines, 25, yPos);
    yPos += notesLines.length * 4 + 12;
  }
  
  // 2. EVIDENCE SECTION
  if (data.assessmentSummary?.evidence) {
    // Check if we need a new page
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('2. Evidence Collection', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    
    const cleanEvidence = data.assessmentSummary.evidence
      .replace(/📁|📎|•/g, '') // Remove emojis
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .trim();
    
    const evidenceLines = doc.splitTextToSize(cleanEvidence, pageWidth - 50);
    doc.text(evidenceLines, 25, yPos);
    yPos += evidenceLines.length * 4 + 12;
  }
  
  // 3. ATTACHMENTS DESCRIPTIONS SECTION
  if (data.assessmentSummary?.attachments && data.assessmentSummary.attachments.length > 0) {
    // Check if we need a new page
    if (yPos > pageHeight - 100) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('3. Attached Evidence Documents', 20, yPos);
    yPos += 8;
    
    // Create simple attachment table without colors
    const attachmentData = data.assessmentSummary.attachments.map(att => [
      att.filename,
      att.description,
      att.size || 'N/A',
      att.type || 'Document'
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['File Name', 'Description', 'Size', 'Type']],
      body: attachmentData,
      theme: 'plain',
      styles: { 
        fontSize: 9, 
        cellPadding: 3,
        textColor: [60, 60, 60]
      },
      headStyles: { 
        fillColor: [240, 240, 240],
        textColor: [40, 40, 40],
        fontStyle: 'bold',
        lineWidth: 0.1,
        lineColor: [200, 200, 200]
      },
      bodyStyles: {
        lineWidth: 0.1,
        lineColor: [220, 220, 220]
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 80 },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' }
      }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // COMPLIANCE METRICS SECTION
  if (yPos > pageHeight - 100) {
    doc.addPage();
    yPos = 20;
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Compliance Metrics', 20, yPos);
  
  // Simple underline
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.3);
  doc.line(20, yPos + 2, 130, yPos + 2);
  
  yPos += 15;
  
  // Simple metrics table without colors
  const metricsData = [
    ['Status', 'Count', 'Percentage'],
    ['Fulfilled', data.summary.fulfilled.toString(), `${Math.round((data.summary.fulfilled / data.summary.totalRequirements) * 100)}%`],
    ['Partially Fulfilled', data.summary.partial.toString(), `${Math.round((data.summary.partial / data.summary.totalRequirements) * 100)}%`],
    ['Not Fulfilled', data.summary.notFulfilled.toString(), `${Math.round((data.summary.notFulfilled / data.summary.totalRequirements) * 100)}%`],
    ['Not Applicable', data.summary.notApplicable.toString(), `${Math.round((data.summary.notApplicable / data.summary.totalRequirements) * 100)}%`],
    ['Total Requirements', data.summary.totalRequirements.toString(), '100%']
  ];
  
  autoTable(doc, {
    startY: yPos,
    body: metricsData,
    theme: 'plain',
    styles: { 
      fontSize: 10, 
      cellPadding: 4,
      textColor: [60, 60, 60]
    },
    headStyles: { 
      fillColor: [240, 240, 240],
      textColor: [40, 40, 40],
      fontStyle: 'bold',
      lineWidth: 0.1,
      lineColor: [200, 200, 200]
    },
    bodyStyles: {
      lineWidth: 0.1,
      lineColor: [220, 220, 220]
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'normal' },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 30, halign: 'center' }
    }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // DETAILED REQUIREMENTS ANALYSIS
  if (data.requirements && data.requirements.length > 0) {
    // Check if we need a new page
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Detailed Requirements Analysis', 20, yPos);
    
    // Simple underline
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    doc.line(20, yPos + 2, 160, yPos + 2);
    
    yPos += 15;
    
    // Group requirements by status for better presentation
    const reqsByStatus = data.requirements.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Show key requirements (first 15 for comprehensive view)
    const requirementsToShow = data.requirements
      .filter(req => req.status !== 'not-applicable') // Focus on actionable requirements
      .slice(0, 15);
    
    // Group requirements by section
    const groupedReqs = requirementsToShow.reduce((acc, req) => {
      // Extract section from requirement code (e.g., "A5.1" -> "A5")
      const section = req.code.split('.')[0] || 'Other';
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(req);
      return acc;
    }, {} as Record<string, typeof requirementsToShow>);
    
    // Create professional requirement cards for each section
    Object.entries(groupedReqs).forEach(([section, sectionReqs]) => {
      // Check if we need a new page
      if (yPos > pageHeight - 100) {
        doc.addPage();
        yPos = 20;
      }
      
      // Section header
      doc.setFillColor(30, 41, 59); // Slate-900 equivalent
      doc.rect(15, yPos, pageWidth - 30, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${section}`, 20, yPos + 8);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${sectionReqs.length} requirement${sectionReqs.length !== 1 ? 's' : ''}`, pageWidth - 20, yPos + 8, { align: 'right' });
      
      yPos += 18;
      
      // Individual requirement cards
      sectionReqs.forEach((req) => {
        // Check if we need a new page for this requirement
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = 20;
        }
        
        // Card background
        doc.setFillColor(255, 255, 255);
        doc.rect(15, yPos, pageWidth - 30, 45, 'F');
        doc.setDrawColor(226, 232, 240); // border-gray-200
        doc.setLineWidth(0.5);
        doc.rect(15, yPos, pageWidth - 30, 45, 'S');
        
        // Code badge
        doc.setFillColor(241, 245, 249); // bg-slate-100
        doc.rect(20, yPos + 5, 20, 12, 'F');
        doc.setDrawColor(203, 213, 224); // border-slate-200
        doc.rect(20, yPos + 5, 20, 12, 'S');
        doc.setTextColor(51, 65, 85); // text-slate-700
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(req.code, 30, yPos + 12, { align: 'center' });
        
        // Requirement name
        doc.setTextColor(15, 23, 42); // text-slate-900
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        const nameLines = doc.splitTextToSize(req.name, 120);
        doc.text(nameLines.slice(0, 2), 45, yPos + 8); // Limit to 2 lines
        
        // Status badge (right aligned)
        const statusText = req.status.replace('-', ' ').toUpperCase();
        const statusColor = getStatusColorRGB(req.status);
        doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
        doc.rect(pageWidth - 45, yPos + 5, 25, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(statusText, pageWidth - 32.5, yPos + 10, { align: 'center' });
        
        // Description
        doc.setTextColor(71, 85, 105); // text-slate-600
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(req.description, pageWidth - 50);
        doc.text(descLines.slice(0, 3), 20, yPos + 22); // Limit to 3 lines
        
        // Notes section (if exists)
        if (req.notes) {
          // Notes indicator
          doc.setFillColor(59, 130, 246); // bg-blue-500
          doc.circle(20, yPos + 38, 1, 'F');
          doc.setTextColor(51, 65, 85); // text-slate-700
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text('Notes', 25, yPos + 40);
          
          // Notes content
          doc.setTextColor(71, 85, 105); // text-slate-600
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          const notesLines = doc.splitTextToSize(req.notes, pageWidth - 60);
          doc.text(notesLines.slice(0, 2), 35, yPos + 40); // Limit to 2 lines
        }
        
        yPos += 50; // Space between cards
      });
      
      yPos += 5; // Extra space between sections
    });
    
    // Note if there are more requirements
    if (data.requirements.length > 10) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text(`Note: Showing first 10 of ${data.requirements.length} total requirements`, 25, yPos);
      yPos += 15;
    }
  }
  
  // PROFESSIONAL FOOTER SECTION
  // Add a final page break if needed
  if (yPos > pageHeight - 40) {
    doc.addPage();
    yPos = 20;
  }
  
  // Add disclaimer and legal information
  doc.setFillColor(248, 250, 252);
  doc.rect(15, pageHeight - 35, pageWidth - 30, 25, 'F');
  doc.setDrawColor(203, 213, 224);
  doc.rect(15, pageHeight - 35, pageWidth - 30, 25, 'S');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  
  const disclaimerText = 'This assessment report is confidential and intended solely for the use of the organization. ' +
    'The findings and recommendations are based on the assessment methodology and evidence available at the time of evaluation. ' +
    'For questions regarding this report, contact your assigned security assessor.';
  
  const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 40);
  doc.text(disclaimerLines, 20, pageHeight - 28);
  
  // Professional signature line
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Generated by AuditReady Security Assessment Platform', 20, pageHeight - 15);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Assessment ID: ${data.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`, 20, pageHeight - 10);
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Page ${i} of ${pageCount} - Generated by AuditReady Platform`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }
}

/**
 * Get RGB status color for requirements
 */
function getStatusColorRGB(status: string): [number, number, number] {
  switch (status.toLowerCase()) {
    case 'fulfilled':
      return [34, 197, 94]; // Green
    case 'partially-fulfilled':
    case 'partial':
      return [245, 158, 11]; // Amber
    case 'not-fulfilled':
      return [239, 68, 68]; // Red
    case 'not-applicable':
      return [148, 163, 184]; // Gray
    default:
      return [71, 85, 105]; // Default slate
  }
} 