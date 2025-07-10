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
  TabStopPosition,
  TabStopType,
  PageBreak,
  Header,
  Footer
} from 'docx';
import { saveAs } from 'file-saver';
import { toast } from './toast';

interface AssessmentWordData {
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
 * Generate professional cybersecurity assessment Word document
 * Designed for enterprise-grade cybersecurity assessments
 */
export const generateWordExport = async (
  data: AssessmentWordData,
  title: string = 'Assessment Report'
): Promise<void> => {
  try {
    const doc = createProfessionalAssessmentDocument(data, title);
    
    const blob = await Packer.toBlob(doc);
    const fileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.docx`;
    
    saveAs(blob, fileName);
    toast.success('Word document exported successfully!');
    
  } catch (error) {
    console.error('Error generating Word document:', error);
    toast.error('Failed to generate Word document');
  }
};

/**
 * Create assessment summary content sections
 */
function createAssessmentSummaryContent(data: AssessmentWordData): Array<Paragraph | Table> {
  const content: Array<Paragraph | Table> = [];

  // 1. Assessment Notes Section
  if (data.assessmentSummary?.assessmentNotes) {
    content.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '1. Assessment Notes',
            bold: true,
            size: 24,
            color: '1E40AF',
            font: 'Arial'
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
            text: cleanTextForWord(data.assessmentSummary.assessmentNotes),
            size: 20,
            color: '334155',
            font: 'Arial'
          })
        ],
        spacing: { after: 300 }
      })
    );
  }

  // 2. Evidence Section
  if (data.assessmentSummary?.evidence) {
    content.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '2. Evidence Collection',
            bold: true,
            size: 24,
            color: '15803D',
            font: 'Arial'
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
            text: cleanTextForWord(data.assessmentSummary.evidence),
            size: 20,
            color: '334155',
            font: 'Arial'
          })
        ],
        spacing: { after: 300 }
      })
    );
  }

  // 3. Attachments Section
  if (data.assessmentSummary?.attachments && data.assessmentSummary.attachments.length > 0) {
    content.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '3. Attached Evidence Documents',
            bold: true,
            size: 24,
            color: 'B45309',
            font: 'Arial'
          })
        ],
        shading: {
          type: ShadingType.SOLID,
          color: 'FEF9C3'
        },
        spacing: { after: 200 }
      })
    );

    // Create attachments table
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

    // Add attachment data rows
    data.assessmentSummary.attachments.forEach((att, index) => {
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
        width: {
          size: 100,
          type: WidthType.PERCENTAGE
        },
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
 * Create requirements analysis content
 */
function createRequirementsAnalysisContent(data: AssessmentWordData): Array<Paragraph> {
  const content: Array<Paragraph> = [];

  if (data.requirements.length > 0) {
    content.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'REQUIREMENTS ANALYSIS',
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
        spacing: { after: 200 }
      })
    );

    // Add requirement details (limit to first 20 for performance)
    data.requirements.slice(0, 20).forEach(req => {
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${req.code}: `,
              bold: true,
              size: 18,
              color: '1E293B'
            }),
            new TextRun({
              text: req.name,
              size: 18,
              color: '334155'
            }),
            new TextRun({
              text: ` [${req.status.toUpperCase()}]`,
              bold: true,
              size: 16,
              color: getStatusColor(req.status)
            })
          ],
          spacing: { after: 120 }
        })
      );
    });
  }

  return content;
}

/**
 * Create professional cybersecurity assessment Word document
 */
function createProfessionalAssessmentDocument(data: AssessmentWordData, title: string): Document {
  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const confidentiality = data.metadata?.confidentialityLevel || 'CONFIDENTIAL';

  const doc = new Document({
    creator: 'AuditReady Security Platform',
    title: data.title,
    description: 'Professional cybersecurity assessment report',
    styles: {
      default: {
        heading1: {
          run: {
            size: 32,
            bold: true,
            color: '1E293B', // Professional dark blue-gray
            font: 'Arial'
          },
          paragraph: {
            spacing: {
              after: 240,
              before: 240
            }
          }
        },
        heading2: {
          run: {
            size: 24,
            bold: true,
            color: '334155',
            font: 'Arial'
          },
          paragraph: {
            spacing: {
              after: 200,
              before: 200
            }
          }
        },
        heading3: {
          run: {
            size: 20,
            bold: true,
            color: '475569',
            font: 'Arial'
          },
          paragraph: {
            spacing: {
              after: 160,
              before: 160
            }
          }
        }
      }
    },
    sections: [{
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'AuditReady Security Platform',
                  bold: true,
                  size: 28,
                  color: 'FFFFFF',
                  font: 'Arial'
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
                  text: `${confidentiality} - ASSESSMENT REPORT`,
                  size: 20,
                  color: 'FFFFFF',
                  font: 'Arial'
                }),
                new TextRun({
                  text: `\t\tGenerated: ${reportDate}`,
                  size: 18,
                  color: 'FFFFFF',
                  font: 'Arial'
                })
              ],
              alignment: AlignmentType.LEFT,
              tabStops: [
                {
                  type: TabStopType.RIGHT,
                  position: TabStopPosition.MAX
                }
              ],
              shading: {
                type: ShadingType.SOLID,
                color: '1E293B'
              }
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Generated by AuditReady Platform - ',
                  size: 16,
                  color: '808080',
                  font: 'Arial'
                }),
                new TextRun({
                  text: reportDate,
                  size: 16,
                  color: '808080',
                  font: 'Arial'
                })
              ],
              alignment: AlignmentType.CENTER
            })
          ]
        })
      },
      children: [
        // Document Title
        new Paragraph({
          children: [
            new TextRun({
              text: data.title,
              bold: true,
              size: 48,
              color: '1E293B',
              font: 'Arial'
            })
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),

        // Executive Summary Section
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
          shading: {
            type: ShadingType.SOLID,
            color: 'F8FAFC'
          },
          spacing: { after: 200 }
        }),

        // Executive Summary Table
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' }
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: 'Assessment Type:', bold: true, size: 20 })]
                  })],
                  width: { size: 50, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: data.standards.map(s => s.name).join(', '), size: 20 })]
                  })],
                  width: { size: 50, type: WidthType.PERCENTAGE }
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: 'Status:', bold: true, size: 20 })]
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: data.status.toUpperCase(), size: 20 })]
                  })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: 'Assessor:', bold: true, size: 20 })]
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: data.assessor, size: 20 })]
                  })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: 'Compliance Score:', bold: true, size: 20 })]
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: `${data.progress}%`, size: 20 })]
                  })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: 'Start Date:', bold: true, size: 20 })]
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: data.startDate, size: 20 })]
                  })]
                })
              ]
            })
          ]
        }),

        new Paragraph({ children: [new TextRun('')], spacing: { after: 400 } }),

        // Assessment Summary Section
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
          spacing: { after: 200 }
        }),

        // Assessment Summary Content - created dynamically
        ...createAssessmentSummaryContent(data),

        new Paragraph({
          children: [new PageBreak()]
        }),

        // Compliance Metrics Section
        new Paragraph({
          children: [
            new TextRun({
              text: 'COMPLIANCE METRICS',
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
          spacing: { after: 200 }
        }),

        // Metrics Table
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE
          },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: '475569' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: '475569' },
            left: { style: BorderStyle.SINGLE, size: 1, color: '475569' },
            right: { style: BorderStyle.SINGLE, size: 1, color: '475569' }
          },
          rows: [
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
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: 'Fulfilled', size: 20, color: '15803D' })]
                  })],
                  shading: { type: ShadingType.SOLID, color: 'F0FDF4' }
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: data.summary.fulfilled.toString(), size: 20 })]
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: `${Math.round((data.summary.fulfilled / data.summary.totalRequirements) * 100)}%`, size: 20 })]
                  })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: 'Partially Fulfilled', size: 20, color: 'D97706' })]
                  })],
                  shading: { type: ShadingType.SOLID, color: 'FEF3C7' }
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: data.summary.partial.toString(), size: 20 })]
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: `${Math.round((data.summary.partial / data.summary.totalRequirements) * 100)}%`, size: 20 })]
                  })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: 'Not Fulfilled', size: 20, color: 'DC2626' })]
                  })],
                  shading: { type: ShadingType.SOLID, color: 'FEF2F2' }
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: data.summary.notFulfilled.toString(), size: 20 })]
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: `${Math.round((data.summary.notFulfilled / data.summary.totalRequirements) * 100)}%`, size: 20 })]
                  })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: 'Not Applicable', size: 20, color: '6B7280' })]
                  })],
                  shading: { type: ShadingType.SOLID, color: 'F9FAFB' }
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: data.summary.notApplicable.toString(), size: 20 })]
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: `${Math.round((data.summary.notApplicable / data.summary.totalRequirements) * 100)}%`, size: 20 })]
                  })]
                })
              ]
            }),
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
                    children: [new TextRun({ text: data.summary.totalRequirements.toString(), bold: true, size: 20 })]
                  })]
                }),
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({ text: '100%', bold: true, size: 20 })]
                  })]
                })
              ]
            })
          ]
        }),

        new Paragraph({ children: [new TextRun('')], spacing: { after: 400 } }),

        // Requirements Analysis Section
        ...createRequirementsAnalysisContent(data)
      ]
    }]
  });

  return doc;
}

/**
 * Clean text for Word export by removing emojis and markdown
 */
function cleanTextForWord(text: string): string {
  return text
    .replace(/🎯|📋|🔍|⚡|•|📁|📎/g, '') // Remove emojis
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
    .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
    .trim();
}

/**
 * Get status color for requirements
 */
function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'fulfilled':
      return '15803D'; // Green
    case 'partially-fulfilled':
    case 'partial':
      return 'D97706'; // Amber
    case 'not-fulfilled':
      return 'DC2626'; // Red
    case 'not-applicable':
      return '6B7280'; // Gray
    default:
      return '334155'; // Default dark gray
  }
}