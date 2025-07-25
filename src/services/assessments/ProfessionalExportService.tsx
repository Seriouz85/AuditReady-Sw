import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { toast } from '@/utils/toast';
import { Assessment, Requirement, Standard } from '@/types';
import { UnifiedAssessmentData } from '@/components/assessments/UnifiedAssessmentTemplate';
import { AssessmentDataProcessor } from './AssessmentDataProcessor';
import { ProfessionalAssessmentDocument } from '@/components/assessments/ProfessionalAssessmentDocument';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, ShadingType } from 'docx';

export interface ExportProgress {
  stage: 'preparing' | 'generating' | 'downloading' | 'complete' | 'error';
  progress: number;
  message: string;
}

export interface ExportOptions {
  activeStandardId?: string;
  showHeader?: boolean;
  showSummary?: boolean;
  showCharts?: boolean;
  showRequirements?: boolean;
  showAttachments?: boolean;
  onProgress?: (progress: ExportProgress) => void;
}

export class ProfessionalExportService {
  private static instance: ProfessionalExportService;

  static getInstance(): ProfessionalExportService {
    if (!ProfessionalExportService.instance) {
      ProfessionalExportService.instance = new ProfessionalExportService();
    }
    return ProfessionalExportService.instance;
  }

  /**
   * Export assessment as professional PDF using @react-pdf/renderer
   */
  async exportPDF(
    assessment: Assessment,
    requirements: Requirement[],
    standards: Standard[],
    options: ExportOptions = {}
  ): Promise<void> {
    const { onProgress } = options;

    try {
      // Stage 1: Validation and preparation
      onProgress?.({
        stage: 'preparing',
        progress: 10,
        message: 'Validating assessment data...'
      });

      const validation = AssessmentDataProcessor.validateAssessmentData(
        assessment,
        requirements,
        standards
      );

      if (!validation.valid) {
        throw new Error(`Invalid assessment data: ${validation.errors.join(', ')}`);
      }

      // Create fallback standards if none provided but assessment has standardIds
      let exportStandards = standards;
      if ((!standards || standards.length === 0) && assessment.standardIds.length > 0) {
        exportStandards = assessment.standardIds.map(id => ({
          id,
          name: `Standard ${id.substring(0, 8)}...`, // Show first 8 chars of UUID
          version: 'Unknown',
          description: 'Standard details not available',
          category: 'Unknown',
          requirements: []
        }));
        console.warn('Created fallback standards for PDF export');
      }

      // Stage 2: Process data
      onProgress?.({
        stage: 'preparing',
        progress: 30,
        message: 'Processing assessment data...'
      });

      const data = AssessmentDataProcessor.processAssessmentData(
        assessment,
        requirements,
        exportStandards,
        { ...options, format: 'pdf' }
      );

      // Stage 3: Generate PDF
      onProgress?.({
        stage: 'generating',
        progress: 50,
        message: 'Generating professional PDF document...'
      });

      const blob = await pdf(<ProfessionalAssessmentDocument data={data} />).toBlob();

      // Stage 4: Download
      onProgress?.({
        stage: 'downloading',
        progress: 90,
        message: 'Preparing download...'
      });

      const filename = AssessmentDataProcessor.generateExportFilename(
        assessment.name,
        'pdf'
      );

      saveAs(blob, filename);

      // Stage 5: Complete
      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'PDF exported successfully!'
      });

      toast.success('Professional PDF exported successfully!');

    } catch (error) {
      console.error('PDF export failed:', error);
      
      onProgress?.({
        stage: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'PDF export failed'
      });

      toast.error(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Export assessment as professional Word document using docx.js v9.5.1
   */
  async exportWord(
    assessment: Assessment,
    requirements: Requirement[],
    standards: Standard[],
    options: ExportOptions = {}
  ): Promise<void> {
    const { onProgress } = options;

    try {
      // Stage 1: Validation and preparation
      onProgress?.({
        stage: 'preparing',
        progress: 10,
        message: 'Validating assessment data...'
      });

      // Create fallback standards if none provided but assessment has standardIds
      let exportStandards = standards;
      if ((!standards || standards.length === 0) && assessment.standardIds.length > 0) {
        exportStandards = assessment.standardIds.map(id => ({
          id,
          name: `Standard ${id.substring(0, 8)}...`, // Show first 8 chars of UUID
          version: 'Unknown',
          description: 'Standard details not available',
          category: 'Unknown',
          requirements: []
        }));
        console.warn('Created fallback standards for Word export');
      }

      const validation = AssessmentDataProcessor.validateAssessmentData(
        assessment,
        requirements,
        exportStandards
      );

      if (!validation.valid) {
        throw new Error(`Invalid assessment data: ${validation.errors.join(', ')}`);
      }

      // Stage 2: Process data
      onProgress?.({
        stage: 'preparing',
        progress: 30,
        message: 'Processing assessment data...'
      });

      const data = AssessmentDataProcessor.processAssessmentData(
        assessment,
        requirements,
        exportStandards,
        { ...options, format: 'word' }
      );

      // Stage 3: Generate Word document
      onProgress?.({
        stage: 'generating',
        progress: 50,
        message: 'Generating professional Word document...'
      });

      const doc = this.createProfessionalWordDocument(data);
      const blob = await Packer.toBlob(doc);

      // Stage 4: Download
      onProgress?.({
        stage: 'downloading',
        progress: 90,
        message: 'Preparing download...'
      });

      const filename = AssessmentDataProcessor.generateExportFilename(
        assessment.name,
        'docx'
      );

      saveAs(blob, filename);

      // Stage 5: Complete
      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'Word document exported successfully!'
      });

      toast.success('Professional Word document exported successfully!');

    } catch (error) {
      console.error('Word export failed:', error);
      
      onProgress?.({
        stage: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Word export failed'
      });

      toast.error(`Word export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Export assessment as CSV with proper error handling
   */
  async exportCSV(
    assessment: Assessment,
    requirements: Requirement[],
    standards: Standard[],
    options: ExportOptions = {}
  ): Promise<void> {
    const { onProgress } = options;

    try {
      // Stage 1: Validation
      onProgress?.({
        stage: 'preparing',
        progress: 20,
        message: 'Validating assessment data...'
      });

      const validation = AssessmentDataProcessor.validateAssessmentData(
        assessment,
        requirements,
        standards
      );

      if (!validation.valid) {
        throw new Error(`Invalid assessment data: ${validation.errors.join(', ')}`);
      }

      // Stage 2: Generate CSV
      onProgress?.({
        stage: 'generating',
        progress: 60,
        message: 'Generating CSV data...'
      });

      const data = AssessmentDataProcessor.processAssessmentData(
        assessment,
        requirements,
        standards,
        options
      );

      const csvContent = this.generateCSVContent(data);

      // Stage 3: Download
      onProgress?.({
        stage: 'downloading',
        progress: 90,
        message: 'Preparing download...'
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const filename = AssessmentDataProcessor.generateExportFilename(
        assessment.name,
        'csv'
      );

      saveAs(blob, filename);

      // Stage 4: Complete
      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'CSV exported successfully!'
      });

      toast.success('CSV exported successfully!');

    } catch (error) {
      console.error('CSV export failed:', error);
      
      onProgress?.({
        stage: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'CSV export failed'
      });

      toast.error(`CSV export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Create professional Word document with proper multi-standard organization
   */
  private createProfessionalWordDocument(data: UnifiedAssessmentData): Document {
    const { assessment, metrics, requirementsBySection, standards, attachments } = data;
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const sections = [];

    // Document Title
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: assessment.name,
            bold: true,
            size: 48,
            color: '1E293B',
            font: 'Arial'
          })
        ],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );

    // Standards
    sections.push(
      new Paragraph({
        children: standards.map(standard => 
          new TextRun({
            text: `${standard.name} ${standard.version}  `,
            size: 20,
            color: '3B82F6',
            font: 'Arial'
          })
        ),
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    );

    // Executive Summary
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'EXECUTIVE SUMMARY',
            bold: true,
            size: 28,
            color: '1E293B',
            font: 'Arial'
          })
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 }
      })
    );

    // Summary Table
    const summaryRows = [
      this.createWordTableRow(['Assessment Type:', standards.map(s => s.name).join(', ')]),
      this.createWordTableRow(['Status:', assessment.status.toUpperCase()]),
      this.createWordTableRow(['Assessor:', assessment.assessorNames?.join(', ') || assessment.assessorName || 'Not Assigned']),
      this.createWordTableRow(['Compliance Score:', `${metrics.complianceScore}%`]),
      this.createWordTableRow(['Start Date:', assessment.startDate ? new Date(assessment.startDate).toLocaleDateString() : 'Not Set']),
      this.createWordTableRow(['Generated:', reportDate])
    ];

    sections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
          left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
          right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' }
        },
        rows: summaryRows
      })
    );

    // Assessment Summary
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'ASSESSMENT SUMMARY',
            bold: true,
            size: 28,
            color: 'FFFFFF',
            font: 'Arial'
          })
        ],
        heading: HeadingLevel.HEADING_1,
        shading: {
          type: ShadingType.SOLID,
          color: '1E293B'
        },
        spacing: { after: 200, before: 400 }
      })
    );

    // Assessment Notes
    if (assessment.notes) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '1. Assessment Notes',
              bold: true,
              size: 20,
              color: '1E40AF',
              font: 'Arial'
            })
          ],
          spacing: { after: 120 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: AssessmentDataProcessor.cleanTextForExport(assessment.notes),
              size: 18,
              color: '334155',
              font: 'Arial'
            })
          ],
          spacing: { after: 300 }
        })
      );
    }

    // Assessment Methods
    if (assessment.methods && assessment.methods.length > 0) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '2. Assessment Methods',
              bold: true,
              size: 20,
              color: '6366F1',
              font: 'Arial'
            })
          ],
          spacing: { after: 120 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: assessment.methods.join(', '),
              size: 18,
              color: '334155',
              font: 'Arial'
            })
          ],
          spacing: { after: 300 }
        })
      );
    }

    // Evidence
    if (assessment.evidence) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '3. Evidence Collection',
              bold: true,
              size: 20,
              color: '15803D',
              font: 'Arial'
            })
          ],
          spacing: { after: 120 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: AssessmentDataProcessor.cleanTextForExport(assessment.evidence),
              size: 18,
              color: '334155',
              font: 'Arial'
            })
          ],
          spacing: { after: 300 }
        })
      );
    }

    // Attachments
    if (attachments.length > 0) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '4. Attached Evidence Documents',
              bold: true,
              size: 20,
              color: 'B45309',
              font: 'Arial'
            })
          ],
          spacing: { after: 200 }
        })
      );

      const attachmentRows = [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'File Name', bold: true, size: 16, color: 'FFFFFF' })]
              })],
              shading: { type: ShadingType.SOLID, color: 'B45309' }
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Description', bold: true, size: 16, color: 'FFFFFF' })]
              })],
              shading: { type: ShadingType.SOLID, color: 'B45309' }
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Size', bold: true, size: 16, color: 'FFFFFF' })]
              })],
              shading: { type: ShadingType.SOLID, color: 'B45309' }
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Type', bold: true, size: 16, color: 'FFFFFF' })]
              })],
              shading: { type: ShadingType.SOLID, color: 'B45309' }
            })
          ]
        })
      ];

      attachments.forEach((att, index) => {
        attachmentRows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: att.filename, size: 16 })]
                })],
                shading: { 
                  type: ShadingType.SOLID, 
                  color: index % 2 === 0 ? 'FFFFFF' : 'FEF9C3' 
                }
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: att.description, size: 16 })]
                })],
                shading: { 
                  type: ShadingType.SOLID, 
                  color: index % 2 === 0 ? 'FFFFFF' : 'FEF9C3' 
                }
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: att.size || 'N/A', size: 16 })]
                })],
                shading: { 
                  type: ShadingType.SOLID, 
                  color: index % 2 === 0 ? 'FFFFFF' : 'FEF9C3' 
                }
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: att.type || 'Document', size: 16 })]
                })],
                shading: { 
                  type: ShadingType.SOLID, 
                  color: index % 2 === 0 ? 'FFFFFF' : 'FEF9C3' 
                }
              })
            ]
          })
        );
      });

      sections.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: attachmentRows
        })
      );
    }

    // Requirements Analysis - Professional Organization by Standard
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'DETAILED REQUIREMENTS ANALYSIS',
            bold: true,
            size: 28,
            color: 'FFFFFF',
            font: 'Arial'
          })
        ],
        heading: HeadingLevel.HEADING_1,
        shading: {
          type: ShadingType.SOLID,
          color: '1E293B'
        },
        spacing: { after: 200, before: 400 }
      })
    );

    // Professional multi-standard organization
    Object.entries(requirementsBySection).forEach(([section, requirements]) => {
      // Section header with proper numbering
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section,
              bold: true,
              size: 20,
              color: 'FFFFFF',
              font: 'Arial'
            }),
            new TextRun({
              text: `    ${requirements.length} requirement${requirements.length !== 1 ? 's' : ''}`,
              size: 16,
              color: 'CBD5E1',
              font: 'Arial'
            })
          ],
          shading: {
            type: ShadingType.SOLID,
            color: '1E293B'
          },
          spacing: { after: 200, before: 200 }
        })
      );

      // Requirements for this section
      requirements.forEach((req, index) => {
        const statusColor = this.getWordStatusColor(req.status);
        
        const reqRows = [
          // Header row
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({
                    text: req.code,
                    bold: true,
                    size: 16,
                    color: '334155',
                    font: 'Arial'
                  })]
                })],
                shading: { type: ShadingType.SOLID, color: 'F1F5F9' },
                width: { size: 15, type: WidthType.PERCENTAGE }
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({
                    text: req.name,
                    bold: true,
                    size: 14,
                    color: '0F172A',
                    font: 'Arial'
                  })]
                })],
                width: { size: 65, type: WidthType.PERCENTAGE }
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({
                    text: req.status.replace('-', ' ').toUpperCase(),
                    bold: true,
                    size: 12,
                    color: 'FFFFFF',
                    font: 'Arial'
                  })],
                  alignment: AlignmentType.CENTER
                })],
                shading: { type: ShadingType.SOLID, color: statusColor },
                width: { size: 20, type: WidthType.PERCENTAGE }
              })
            ]
          }),
          // Description row
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({
                    text: 'Description',
                    bold: true,
                    size: 12,
                    color: '475569',
                    font: 'Arial'
                  })]
                })],
                shading: { type: ShadingType.SOLID, color: 'F8FAFC' }
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({
                    text: req.description,
                    size: 12,
                    color: '475569',
                    font: 'Arial'
                  })]
                })],
                columnSpan: 2
              })
            ]
          })
        ];

        // Notes row (if exists)
        if (req.notes) {
          reqRows.push(
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({
                      text: 'Notes',
                      bold: true,
                      size: 12,
                      color: '3B82F6',
                      font: 'Arial'
                    })]
                  })],
                  shading: { type: ShadingType.SOLID, color: 'EFF6FF' }
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({
                      text: AssessmentDataProcessor.cleanTextForExport(req.notes),
                      size: 12,
                      color: '475569',
                      font: 'Arial'
                    })]
                  })],
                  columnSpan: 2,
                  shading: { type: ShadingType.SOLID, color: 'F0F9FF' }
                })
              ]
            })
          );
        }

        sections.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' }
            },
            rows: reqRows
          })
        );

        // Spacing between requirements
        sections.push(
          new Paragraph({
            children: [new TextRun('')],
            spacing: { after: 200 }
          })
        );
      });
    });

    return new Document({
      creator: 'AuditReady Security Platform',
      title: assessment.name,
      description: 'Professional cybersecurity assessment report',
      sections: [{
        properties: {},
        children: sections
      }]
    });
  }

  /**
   * Helper methods
   */
  private createWordTableRow(data: [string, string]): TableRow {
    return new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: data[0], bold: true, size: 18 })]
          })],
          width: { size: 50, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: data[1], size: 18 })]
          })],
          width: { size: 50, type: WidthType.PERCENTAGE }
        })
      ]
    });
  }

  private getWordStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'fulfilled':
        return '15803D'; // green-700
      case 'partially-fulfilled':
        return 'D97706'; // amber-600
      case 'not-fulfilled':
        return 'DC2626'; // red-600
      case 'not-applicable':
        return '6B7280'; // gray-500
      default:
        return '334155'; // slate-700
    }
  }

  private generateCSVContent(data: UnifiedAssessmentData): string {
    const { assessment, requirements, standards, metrics } = data;
    
    // CSV header
    const headerRow = [
      "Assessment_Name",
      "Standard",
      "Section",
      "Requirement_Code", 
      "Requirement_Name", 
      "Requirement_Description", 
      "Status", 
      "Notes", 
      "Evidence_Available"
    ].join(",");
    
    // CSV data rows with proper standard organization
    const dataRows = requirements.map(req => {
      const standard = standards.find(s => s.id === req.standardId);
      const standardName = standard ? `${standard.name} ${standard.version}` : 'Unknown Standard';
      const section = req.section || AssessmentDataProcessor.extractSectionFromCode(req.code);
      
      // Format CSV fields properly
      const formatCSVField = (text: string) => `"${(text || '').replace(/"/g, '""')}"`;
      
      return [
        formatCSVField(assessment.name),
        formatCSVField(standardName),
        formatCSVField(section),
        formatCSVField(req.code),
        formatCSVField(req.name),
        formatCSVField(req.description),
        formatCSVField(req.status),
        formatCSVField(AssessmentDataProcessor.cleanTextForExport(req.notes || '')),
        req.evidence ? 'Yes' : 'No'
      ].join(",");
    });
    
    // Add summary row
    const summaryRow = [
      formatCSVField(`${assessment.name} - SUMMARY`),
      formatCSVField('ALL_STANDARDS'),
      formatCSVField('SUMMARY'),
      formatCSVField('OVERALL'),
      formatCSVField('Assessment Summary'),
      formatCSVField(`Total: ${metrics.totalRequirements}, Fulfilled: ${metrics.fulfilled}, Partial: ${metrics.partiallyFulfilled}, Not Fulfilled: ${metrics.notFulfilled}, Not Applicable: ${metrics.notApplicable}`),
      formatCSVField(`${metrics.complianceScore}% Compliant`),
      formatCSVField(AssessmentDataProcessor.cleanTextForExport(assessment.notes || '')),
      assessment.evidence ? 'Yes' : 'No'
    ].join(",");
    
    // Combine all data
    return [headerRow, summaryRow, ...dataRows].join("\n");
  }

  private formatCSVField(text: string): string {
    return `"${(text || '').replace(/"/g, '""')}"`;
  }
}

export default ProfessionalExportService;