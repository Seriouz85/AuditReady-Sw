import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle,
  AlignmentType,
  ShadingType,
  PageBreak,
  Header,
  Footer
} from 'docx';
import { saveAs } from 'file-saver';
import { toast } from './toast';
import { UnifiedAssessmentData } from '@/components/assessments/UnifiedAssessmentTemplate';
import { AssessmentDataProcessor } from '@/services/assessments/AssessmentDataProcessor';

/**
 * OptimizedWordGenerator
 * 
 * High-performance Word document generation with consistent formatting
 * that matches the PDF output exactly.
 * 
 * Features:
 * - Professional enterprise formatting
 * - Consistent styling with PDF exports
 * - Optimized for performance and file size
 * - Responsive tables and layouts
 */
export class OptimizedWordGenerator {
  
  /**
   * Generate optimized Word document from unified assessment data
   */
  static async generateAssessmentWord(data: UnifiedAssessmentData): Promise<void> {
    try {
      const doc = this.createDocument(data);
      
      const blob = await Packer.toBlob(doc);
      const filename = AssessmentDataProcessor.generateExportFilename(
        data.assessment.name,
        'docx'
      );
      
      saveAs(blob, filename);
      toast.success('Word document exported successfully!');
      
    } catch (error) {
      console.error('Word generation error:', error);
      toast.error('Failed to generate Word document');
      throw error;
    }
  }
  
  /**
   * Create the complete Word document
   */
  private static createDocument(data: UnifiedAssessmentData): Document {
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const doc = new Document({
      creator: 'AuditReady Security Platform',
      title: data.assessment.name,
      description: 'Professional cybersecurity assessment report',
      styles: {
        default: {
          heading1: {
            run: {
              size: 32,
              bold: true,
              color: '1E293B', // slate-900
              font: 'Calibri'
            },
            paragraph: {
              spacing: { after: 240, before: 240 }
            }
          },
          heading2: {
            run: {
              size: 24,
              bold: true,
              color: '334155', // slate-700
              font: 'Calibri'
            },
            paragraph: {
              spacing: { after: 200, before: 200 }
            }
          },
          heading3: {
            run: {
              size: 20,
              bold: true,
              color: '475569', // slate-600
              font: 'Calibri'
            },
            paragraph: {
              spacing: { after: 160, before: 160 }
            }
          }
        }
      },
      sections: [{
        headers: {
          default: this.createHeader(data, reportDate)
        },
        footers: {
          default: this.createFooter(reportDate)
        },
        children: [
          // Document Title
          new Paragraph({
            children: [
              new TextRun({
                text: data.assessment.name,
                bold: true,
                size: 48,
                color: '1E293B',
                font: 'Calibri'
              })
            ],
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          
          // Standards badges
          new Paragraph({
            children: data.standards.map(standard => 
              new TextRun({
                text: `${standard.name} ${standard.version}  `,
                size: 20,
                color: '3B82F6', // blue-500
                font: 'Calibri'
              })
            ),
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 }
          }),
          
          // Executive Summary
          ...this.createExecutiveSummary(data),
          
          new Paragraph({ children: [new PageBreak()] }),
          
          // Assessment Summary
          ...this.createAssessmentSummary(data),
          
          new Paragraph({ children: [new PageBreak()] }),
          
          // Compliance Metrics
          ...this.createComplianceMetrics(data),
          
          // Requirements Analysis
          ...(data.config.showRequirements ? [
            new Paragraph({ children: [new PageBreak()] }),
            ...this.createRequirementsAnalysis(data)
          ] : [])
        ]
      }]
    });
    
    return doc;
  }
  
  /**
   * Create document header
   */
  private static createHeader(data: UnifiedAssessmentData, reportDate: string): Header {
    return new Header({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: 'AuditReady Security Platform',
              bold: true,
              size: 28,
              color: 'FFFFFF',
              font: 'Calibri'
            })
          ],
          alignment: AlignmentType.LEFT,
          spacing: { after: 100 },
          shading: {
            type: ShadingType.SOLID,
            color: '1E293B'
          }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'CONFIDENTIAL - ASSESSMENT REPORT',
              size: 20,
              color: 'FFFFFF',
              font: 'Calibri'
            }),
            new TextRun({
              text: `\t\t\t\t\tGenerated: ${reportDate}`,
              size: 18,
              color: 'FFFFFF',
              font: 'Calibri'
            })
          ],
          alignment: AlignmentType.LEFT,
          shading: {
            type: ShadingType.SOLID,
            color: '1E293B'
          }
        })
      ]
    });
  }
  
  /**
   * Create document footer
   */
  private static createFooter(reportDate: string): Footer {
    return new Footer({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: 'Generated by AuditReady Platform - ',
              size: 16,
              color: '6B7280',
              font: 'Calibri'
            }),
            new TextRun({
              text: reportDate,
              size: 16,
              color: '6B7280',
              font: 'Calibri'
            })
          ],
          alignment: AlignmentType.CENTER
        })
      ]
    });
  }
  
  /**
   * Create executive summary section
   */
  private static createExecutiveSummary(data: UnifiedAssessmentData): Array<Paragraph | Table> {
    const { assessment, metrics } = data;
    const content: Array<Paragraph | Table> = [];
    
    content.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'EXECUTIVE SUMMARY',
            bold: true,
            size: 28,
            color: '1E293B',
            font: 'Calibri'
          })
        ],
        heading: HeadingLevel.HEADING_1,
        shading: {
          type: ShadingType.SOLID,
          color: 'F8FAFC'
        },
        spacing: { after: 200 }
      })
    );
    
    // Summary table
    const summaryRows = [
      this.createTableRow(['Assessment Type:', data.standards.map(s => s.name).join(', ')]),
      this.createTableRow(['Status:', assessment.status.toUpperCase()]),
      this.createTableRow(['Assessor:', assessment.assessorNames?.join(', ') || assessment.assessorName || 'Not Assigned']),
      this.createTableRow(['Compliance Score:', `${metrics.complianceScore}%`]),
      this.createTableRow(['Start Date:', assessment.startDate ? new Date(assessment.startDate).toLocaleDateString() : 'Not Set']),
      this.createTableRow(['Generated:', new Date().toLocaleDateString()])
    ];
    
    content.push(
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
    
    content.push(
      new Paragraph({
        children: [new TextRun('')],
        spacing: { after: 400 }
      })
    );
    
    return content;
  }
  
  /**
   * Create assessment summary section
   */
  private static createAssessmentSummary(data: UnifiedAssessmentData): Array<Paragraph | Table> {
    const { assessment, attachments } = data;
    const content: Array<Paragraph | Table> = [];
    
    content.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'ASSESSMENT SUMMARY',
            bold: true,
            size: 28,
            color: 'FFFFFF',
            font: 'Calibri'
          })
        ],
        heading: HeadingLevel.HEADING_1,
        shading: {
          type: ShadingType.SOLID,
          color: '1E293B'
        },
        spacing: { after: 200 }
      })
    );
    
    // Assessment Notes
    if (assessment.notes) {
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '1. Assessment Notes',
              bold: true,
              size: 24,
              color: '1E40AF',
              font: 'Calibri'
            })
          ],
          shading: {
            type: ShadingType.SOLID,
            color: 'EFF6FF'
          },
          spacing: { after: 120 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: AssessmentDataProcessor.cleanTextForExport(assessment.notes),
              size: 20,
              color: '334155',
              font: 'Calibri'
            })
          ],
          spacing: { after: 300 }
        })
      );
    }
    
    // Evidence
    if (assessment.evidence) {
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '2. Evidence Collection',
              bold: true,
              size: 24,
              color: '15803D',
              font: 'Calibri'
            })
          ],
          shading: {
            type: ShadingType.SOLID,
            color: 'F0FDF4'
          },
          spacing: { after: 120 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: AssessmentDataProcessor.cleanTextForExport(assessment.evidence),
              size: 20,
              color: '334155',
              font: 'Calibri'
            })
          ],
          spacing: { after: 300 }
        })
      );
    }
    
    // Attachments
    if (attachments.length > 0) {
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '3. Attached Evidence Documents',
              bold: true,
              size: 24,
              color: 'B45309',
              font: 'Calibri'
            })
          ],
          shading: {
            type: ShadingType.SOLID,
            color: 'FEF9C3'
          },
          spacing: { after: 200 }
        })
      );
      
      const attachmentRows = [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'File Name', bold: true, size: 18, color: 'FFFFFF' })]
              })],
              shading: { type: ShadingType.SOLID, color: 'B45309' },
              width: { size: 30, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Description', bold: true, size: 18, color: 'FFFFFF' })]
              })],
              shading: { type: ShadingType.SOLID, color: 'B45309' },
              width: { size: 40, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Size', bold: true, size: 18, color: 'FFFFFF' })]
              })],
              shading: { type: ShadingType.SOLID, color: 'B45309' },
              width: { size: 15, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: 'Type', bold: true, size: 18, color: 'FFFFFF' })]
              })],
              shading: { type: ShadingType.SOLID, color: 'B45309' },
              width: { size: 15, type: WidthType.PERCENTAGE }
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
                  children: [new TextRun({ text: att.filename, size: 18 })]
                })],
                shading: { 
                  type: ShadingType.SOLID, 
                  color: index % 2 === 0 ? 'FFFFFF' : 'FEF9C3' 
                }
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: att.description, size: 18 })]
                })],
                shading: { 
                  type: ShadingType.SOLID, 
                  color: index % 2 === 0 ? 'FFFFFF' : 'FEF9C3' 
                }
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: att.size || 'N/A', size: 18 })]
                })],
                shading: { 
                  type: ShadingType.SOLID, 
                  color: index % 2 === 0 ? 'FFFFFF' : 'FEF9C3' 
                }
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: att.type || 'Document', size: 18 })]
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
      
      content.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'B45309' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'B45309' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'B45309' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'B45309' }
          },
          rows: attachmentRows
        })
      );
    }
    
    return content;
  }
  
  /**
   * Create compliance metrics section
   */
  private static createComplianceMetrics(data: UnifiedAssessmentData): Array<Paragraph | Table> {
    const { metrics } = data;
    const content: Array<Paragraph | Table> = [];
    
    content.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'COMPLIANCE METRICS',
            bold: true,
            size: 28,
            color: 'FFFFFF',
            font: 'Calibri'
          })
        ],
        heading: HeadingLevel.HEADING_1,
        shading: {
          type: ShadingType.SOLID,
          color: '1E293B'
        },
        spacing: { after: 200 }
      })
    );
    
    const metricsRows = [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: 'Status', bold: true, size: 20, color: 'FFFFFF' })]
            })],
            shading: { type: ShadingType.SOLID, color: '475569' },
            width: { size: 40, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: 'Count', bold: true, size: 20, color: 'FFFFFF' })]
            })],
            shading: { type: ShadingType.SOLID, color: '475569' },
            width: { size: 20, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: 'Percentage', bold: true, size: 20, color: 'FFFFFF' })]
            })],
            shading: { type: ShadingType.SOLID, color: '475569' },
            width: { size: 40, type: WidthType.PERCENTAGE }
          })
        ]
      }),
      this.createMetricsRow('Fulfilled', metrics.fulfilled, metrics.totalRequirements, '15803D', 'F0FDF4'),
      this.createMetricsRow('Partially Fulfilled', metrics.partiallyFulfilled, metrics.totalRequirements, 'D97706', 'FEF3C7'),
      this.createMetricsRow('Not Fulfilled', metrics.notFulfilled, metrics.totalRequirements, 'DC2626', 'FEF2F2'),
      this.createMetricsRow('Not Applicable', metrics.notApplicable, metrics.totalRequirements, '6B7280', 'F9FAFB'),
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: 'TOTAL REQUIREMENTS', bold: true, size: 20, color: '1E293B' })]
            })],
            shading: { type: ShadingType.SOLID, color: 'E2E8F0' }
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: metrics.totalRequirements.toString(), bold: true, size: 20 })]
            })]
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: '100%', bold: true, size: 20 })]
            })]
          })
        ]
      })
    ];
    
    content.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: '475569' },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: '475569' },
          left: { style: BorderStyle.SINGLE, size: 1, color: '475569' },
          right: { style: BorderStyle.SINGLE, size: 1, color: '475569' }
        },
        rows: metricsRows
      })
    );
    
    return content;
  }
  
  /**
   * Create requirements analysis section
   */
  private static createRequirementsAnalysis(data: UnifiedAssessmentData): Array<Paragraph | Table> {
    const { requirementsBySection } = data;
    const content: Array<Paragraph | Table> = [];
    
    content.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'DETAILED REQUIREMENTS ANALYSIS',
            bold: true,
            size: 28,
            color: 'FFFFFF',
            font: 'Calibri'
          })
        ],
        heading: HeadingLevel.HEADING_1,
        shading: {
          type: ShadingType.SOLID,
          color: '1E293B'
        },
        spacing: { after: 200 }
      })
    );
    
    Object.entries(requirementsBySection).forEach(([section, requirements]) => {
      // Section header
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section,
              bold: true,
              size: 20,
              color: 'FFFFFF',
              font: 'Calibri'
            }),
            new TextRun({
              text: `    ${requirements.length} requirement${requirements.length !== 1 ? 's' : ''}`,
              size: 16,
              color: 'CBD5E1',
              font: 'Calibri'
            })
          ],
          shading: {
            type: ShadingType.SOLID,
            color: '1E293B'
          },
          spacing: { after: 200, before: 200 }
        })
      );
      
      // Requirements (limit to first 10 for performance)
      const displayRequirements = requirements.slice(0, 10);
      
      displayRequirements.forEach(req => {
        const statusColor = this.getStatusColor(req.status);
        
        const reqRows = [
          // Header row
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({
                    text: req.code,
                    bold: true,
                    size: 18,
                    color: '334155',
                    font: 'Calibri'
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
                    size: 16,
                    color: '0F172A',
                    font: 'Calibri'
                  })]
                })],
                width: { size: 65, type: WidthType.PERCENTAGE }
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({
                    text: req.status.replace('-', ' ').toUpperCase(),
                    bold: true,
                    size: 14,
                    color: 'FFFFFF',
                    font: 'Calibri'
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
                    size: 14,
                    color: '475569',
                    font: 'Calibri'
                  })]
                })],
                shading: { type: ShadingType.SOLID, color: 'F8FAFC' }
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({
                    text: req.description,
                    size: 14,
                    color: '475569',
                    font: 'Calibri'
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
                      size: 14,
                      color: '3B82F6',
                      font: 'Calibri'
                    })]
                  })],
                  shading: { type: ShadingType.SOLID, color: 'EFF6FF' }
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({
                      text: AssessmentDataProcessor.cleanTextForExport(req.notes),
                      size: 14,
                      color: '475569',
                      font: 'Calibri'
                    })]
                  })],
                  columnSpan: 2,
                  shading: { type: ShadingType.SOLID, color: 'F0F9FF' }
                })
              ]
            })
          );
        }
        
        content.push(
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
        content.push(
          new Paragraph({
            children: [new TextRun('')],
            spacing: { after: 200 }
          })
        );
      });
      
      // Note if truncated
      if (requirements.length > 10) {
        content.push(
          new Paragraph({
            children: [new TextRun({
              text: `Note: Showing first 10 of ${requirements.length} requirements in this section`,
              italic: true,
              size: 16,
              color: '6B7280',
              font: 'Calibri'
            })],
            spacing: { after: 200 }
          })
        );
      }
    });
    
    return content;
  }
  
  /**
   * Helper methods
   */
  private static createTableRow(data: [string, string]): TableRow {
    return new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: data[0], bold: true, size: 20 })]
          })],
          width: { size: 50, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: data[1], size: 20 })]
          })],
          width: { size: 50, type: WidthType.PERCENTAGE }
        })
      ]
    });
  }
  
  private static createMetricsRow(
    status: string, 
    count: number, 
    total: number, 
    textColor: string, 
    bgColor: string
  ): TableRow {
    return new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: status, size: 20, color: textColor })]
          })],
          shading: { type: ShadingType.SOLID, color: bgColor }
        }),
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: count.toString(), size: 20 })]
          })]
        }),
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: `${Math.round((count / total) * 100)}%`, size: 20 })]
          })]
        })
      ]
    });
  }
  
  private static getStatusColor(status: string): string {
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
}

export default OptimizedWordGenerator;