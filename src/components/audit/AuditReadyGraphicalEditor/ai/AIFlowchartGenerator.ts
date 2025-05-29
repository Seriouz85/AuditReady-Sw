/**
 * AI-Powered Flowchart Generator
 * Inspired by YN's plugin architecture and diagram integration patterns
 */

import * as fabric from 'fabric';
import { DiagramNode, DiagramTemplate } from 'src/types/diagram/types';

export interface AIFlowchartRequest {
  prompt: string;
  context?: {
    auditType?: string;
    industry?: string;
    framework?: string;
    existingControls?: string[];
  };
  style?: 'simple' | 'detailed' | 'hierarchical';
  format?: 'horizontal' | 'vertical' | 'circular';
}

export class AIFlowchartGenerator {
  private canvas: fabric.Canvas;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
  }

  /**
   * Generate flowchart from natural language prompt
   */
  async generateFromPrompt(request: AIFlowchartRequest): Promise<DiagramTemplate> {
    try {
      console.log('Generating flowchart from prompt:', request.prompt);

      // For demo purposes, return sample data
      // In production, this would call an AI service
      const sampleFlowchart = this.generateSampleFlowchart(request);

      return sampleFlowchart;
    } catch (error) {
      console.error('Failed to generate flowchart:', error);
      throw new Error('Failed to generate flowchart. Please try again.');
    }
  }

  /**
   * Generate sample flowchart based on prompt analysis
   */
  private generateSampleFlowchart(request: AIFlowchartRequest): DiagramTemplate {
    const prompt = request.prompt.toLowerCase();

    if (prompt.includes('audit') || prompt.includes('review')) {
      return this.generateAuditProcessFlowchart();
    } else if (prompt.includes('risk') || prompt.includes('assessment')) {
      return this.generateRiskAssessmentFlowchart();
    } else if (prompt.includes('compliance') || prompt.includes('control')) {
      return this.generateComplianceFlowchart(request);
    } else {
      return this.generateGenericProcessFlowchart();
    }
  }

  /**
   * Generate audit process flowchart
   */
  private generateAuditProcessFlowchart(): DiagramTemplate {
    const nodes: DiagramNode[] = [
      {
        id: 'start',
        type: 'start',
        label: 'Start Audit',
        x: 100,
        y: 50,
        width: 120,
        height: 60,
        connections: ['planning']
      },
      {
        id: 'planning',
        type: 'process',
        label: 'Audit Planning\n& Risk Assessment',
        x: 100,
        y: 150,
        width: 160,
        height: 80,
        connections: ['fieldwork'],
        metadata: { riskLevel: 'medium', controlType: 'preventive' }
      },
      {
        id: 'fieldwork',
        type: 'process',
        label: 'Fieldwork\n& Testing',
        x: 100,
        y: 280,
        width: 140,
        height: 80,
        connections: ['evaluation'],
        metadata: { riskLevel: 'high', controlType: 'detective' }
      },
      {
        id: 'evaluation',
        type: 'decision',
        label: 'Issues\nIdentified?',
        x: 100,
        y: 410,
        width: 120,
        height: 80,
        connections: ['findings', 'reporting']
      },
      {
        id: 'findings',
        type: 'process',
        label: 'Document\nFindings',
        x: 300,
        y: 410,
        width: 120,
        height: 80,
        connections: ['reporting'],
        metadata: { riskLevel: 'high', controlType: 'corrective' }
      },
      {
        id: 'reporting',
        type: 'process',
        label: 'Audit\nReporting',
        x: 100,
        y: 540,
        width: 120,
        height: 80,
        connections: ['end']
      },
      {
        id: 'end',
        type: 'end',
        label: 'Audit Complete',
        x: 100,
        y: 670,
        width: 120,
        height: 60,
        connections: []
      }
    ];

    return {
      nodes,
      name: 'Audit Process Flow',
      description: 'Standard audit process from planning to completion',
      category: 'audit-process',
      id: 'ai-audit-process',
      edges: []
    };
  }

  /**
   * Generate risk assessment flowchart
   */
  private generateRiskAssessmentFlowchart(): DiagramTemplate {
    const nodes: DiagramNode[] = [
      {
        id: 'start',
        type: 'start',
        label: 'Risk Assessment',
        x: 100,
        y: 50,
        width: 140,
        height: 60,
        connections: ['identify']
      },
      {
        id: 'identify',
        type: 'process',
        label: 'Identify\nRisks',
        x: 100,
        y: 150,
        width: 120,
        height: 80,
        connections: ['analyze'],
        metadata: { riskLevel: 'medium', controlType: 'detective' }
      },
      {
        id: 'analyze',
        type: 'process',
        label: 'Analyze\nLikelihood & Impact',
        x: 100,
        y: 280,
        width: 160,
        height: 80,
        connections: ['evaluate'],
        metadata: { riskLevel: 'high', controlType: 'detective' }
      },
      {
        id: 'evaluate',
        type: 'decision',
        label: 'Risk Level\nAcceptable?',
        x: 100,
        y: 410,
        width: 140,
        height: 80,
        connections: ['accept', 'mitigate']
      },
      {
        id: 'mitigate',
        type: 'process',
        label: 'Develop\nMitigation Plan',
        x: 320,
        y: 410,
        width: 140,
        height: 80,
        connections: ['monitor'],
        metadata: { riskLevel: 'high', controlType: 'preventive' }
      },
      {
        id: 'accept',
        type: 'process',
        label: 'Accept\nRisk',
        x: 100,
        y: 540,
        width: 100,
        height: 60,
        connections: ['monitor'],
        metadata: { riskLevel: 'low', controlType: 'preventive' }
      },
      {
        id: 'monitor',
        type: 'process',
        label: 'Monitor\n& Review',
        x: 210,
        y: 540,
        width: 120,
        height: 80,
        connections: ['end'],
        metadata: { riskLevel: 'medium', controlType: 'detective' }
      },
      {
        id: 'end',
        type: 'end',
        label: 'Risk Managed',
        x: 210,
        y: 670,
        width: 120,
        height: 60,
        connections: []
      }
    ];

    return {
      nodes,
      name: 'Risk Assessment Process',
      description: 'Comprehensive risk identification and management workflow',
      category: 'risk-assessment',
      id: 'ai-risk-assessment',
      edges: []
    };
  }

  /**
   * Generate compliance flowchart
   */
  private generateComplianceFlowchart(request: AIFlowchartRequest): DiagramTemplate {
    const framework = request.context?.framework || 'ISO 27001';

    const nodes: DiagramNode[] = [
      {
        id: 'start',
        type: 'start',
        label: `${framework}\nCompliance Check`,
        x: 100,
        y: 50,
        width: 140,
        height: 80,
        connections: ['requirements']
      },
      {
        id: 'requirements',
        type: 'process',
        label: 'Review\nRequirements',
        x: 100,
        y: 180,
        width: 140,
        height: 80,
        connections: ['assess'],
        metadata: { compliance: [framework] }
      },
      {
        id: 'assess',
        type: 'process',
        label: 'Assess Current\nControls',
        x: 100,
        y: 310,
        width: 140,
        height: 80,
        connections: ['gaps'],
        metadata: { controlType: 'detective', compliance: [framework] }
      },
      {
        id: 'gaps',
        type: 'decision',
        label: 'Gaps\nIdentified?',
        x: 100,
        y: 440,
        width: 120,
        height: 80,
        connections: ['remediate', 'compliant']
      },
      {
        id: 'remediate',
        type: 'process',
        label: 'Remediation\nPlan',
        x: 300,
        y: 440,
        width: 120,
        height: 80,
        connections: ['implement'],
        metadata: { riskLevel: 'high', controlType: 'corrective' }
      },
      {
        id: 'implement',
        type: 'process',
        label: 'Implement\nControls',
        x: 300,
        y: 570,
        width: 120,
        height: 80,
        connections: ['verify'],
        metadata: { controlType: 'preventive' }
      },
      {
        id: 'verify',
        type: 'process',
        label: 'Verify\nEffectiveness',
        x: 200,
        y: 700,
        width: 120,
        height: 80,
        connections: ['compliant'],
        metadata: { controlType: 'detective' }
      },
      {
        id: 'compliant',
        type: 'end',
        label: 'Compliant',
        x: 100,
        y: 570,
        width: 100,
        height: 60,
        connections: []
      }
    ];

    return {
      nodes,
      name: `${framework} Compliance Process`,
      description: `Compliance verification workflow for ${framework}`,
      category: 'compliance-check',
      id: 'ai-compliance-check',
      edges: []
    };
  }

  /**
   * Generate generic process flowchart
   */
  private generateGenericProcessFlowchart(): DiagramTemplate {
    const nodes: DiagramNode[] = [
      {
        id: 'start',
        type: 'start',
        label: 'Start Process',
        x: 100,
        y: 50,
        width: 120,
        height: 60,
        connections: ['step1']
      },
      {
        id: 'step1',
        type: 'process',
        label: 'Process Step 1',
        x: 100,
        y: 150,
        width: 140,
        height: 80,
        connections: ['decision']
      },
      {
        id: 'decision',
        type: 'decision',
        label: 'Decision\nPoint?',
        x: 100,
        y: 280,
        width: 120,
        height: 80,
        connections: ['step2a', 'step2b']
      },
      {
        id: 'step2a',
        type: 'process',
        label: 'Option A',
        x: 50,
        y: 410,
        width: 100,
        height: 60,
        connections: ['end']
      },
      {
        id: 'step2b',
        type: 'process',
        label: 'Option B',
        x: 200,
        y: 410,
        width: 100,
        height: 60,
        connections: ['end']
      },
      {
        id: 'end',
        type: 'end',
        label: 'End Process',
        x: 125,
        y: 520,
        width: 120,
        height: 60,
        connections: []
      }
    ];

    return {
      nodes,
      name: 'Generic Process Flow',
      description: 'Basic process workflow template',
      category: 'audit-process',
      id: 'ai-generic-process-flow',
      edges: []
    };
  }

  /**
   * Render flowchart on canvas
   */
  async renderFlowchart(flowchartData: DiagramTemplate): Promise<void> {
    console.log('Rendering flowchart:', flowchartData.name);

    // Clear existing objects
    this.canvas.clear();

    // Create fabric objects for each node
    const fabricObjects: fabric.Object[] = [];
    const nodeMap = new Map<string, fabric.Object>();

    // Create nodes
    for (const node of flowchartData.nodes) {
      const fabricNode = this.createFlowchartNode(node);
      fabricObjects.push(fabricNode);
      nodeMap.set(node.id, fabricNode);
    }

    // Create connections
    for (const node of flowchartData.nodes) {
      for (const connectionId of node.connections) {
        const targetNode = flowchartData.nodes.find(n => n.id === connectionId);
        if (targetNode) {
          const connection = this.createConnection(node, targetNode);
          fabricObjects.push(connection);
        }
      }
    }

    // Add all objects to canvas
    fabricObjects.forEach(obj => this.canvas.add(obj));

    // Add title
    const title = new fabric.Text(flowchartData.name, {
      left: 50,
      top: 10,
      fontSize: 20,
      fontWeight: 'bold',
      fill: '#1f2937'
    });
    this.canvas.add(title);

    this.canvas.renderAll();
  }

  /**
   * Create fabric object for flowchart node
   */
  private createFlowchartNode(node: DiagramNode): fabric.Group {
    let shape: fabric.Object;
    const colors = this.getNodeColors(node);

    switch (node.type) {
      case 'start':
      case 'end':
        shape = new fabric.Ellipse({
          rx: node.width / 2,
          ry: node.height / 2,
          fill: colors.fill,
          stroke: colors.stroke,
          strokeWidth: 2
        });
        break;
      case 'decision':
        // Create diamond shape using polygon
        const points = [
          { x: node.width / 2, y: 0 },
          { x: node.width, y: node.height / 2 },
          { x: node.width / 2, y: node.height },
          { x: 0, y: node.height / 2 }
        ];
        shape = new fabric.Polygon(points, {
          fill: colors.fill,
          stroke: colors.stroke,
          strokeWidth: 2
        });
        break;
      default:
        shape = new fabric.Rect({
          width: node.width,
          height: node.height,
          fill: colors.fill,
          stroke: colors.stroke,
          strokeWidth: 2,
          rx: 5,
          ry: 5
        });
    }

    const text = new fabric.Text(node.label, {
      fontSize: 12,
      fill: '#1f2937',
      textAlign: 'center',
      originX: 'center',
      originY: 'center'
    });

    const group = new fabric.Group([shape, text], {
      left: node.x,
      top: node.y,
      selectable: true,
      hasControls: true
    });

    // Add metadata
    (group as any).nodeData = node;

    return group;
  }

  /**
   * Get colors for node based on type and metadata
   */
  private getNodeColors(node: DiagramNode): { fill: string; stroke: string } {
    const riskColors = {
      low: { fill: '#d1fae5', stroke: '#10b981' },
      medium: { fill: '#fef3c7', stroke: '#f59e0b' },
      high: { fill: '#fee2e2', stroke: '#ef4444' }
    };

    const riskLevel = node.metadata?.riskLevel as 'low' | 'medium' | 'high' | undefined;
    if (riskLevel && riskColors[riskLevel]) {
      return riskColors[riskLevel];
    }

    switch (node.type) {
      case 'start':
        return { fill: '#dbeafe', stroke: '#3b82f6' };
      case 'end':
        return { fill: '#f3e8ff', stroke: '#8b5cf6' };
      case 'decision':
        return { fill: '#fef3c7', stroke: '#f59e0b' };
      default:
        return { fill: '#f9fafb', stroke: '#6b7280' };
    }
  }

  /**
   * Create connection line between nodes
   */
  private createConnection(fromNode: DiagramNode, toNode: DiagramNode): fabric.Line {
    const fromX = fromNode.x + fromNode.width / 2;
    const fromY = fromNode.y + fromNode.height;
    const toX = toNode.x + toNode.width / 2;
    const toY = toNode.y;

    return new fabric.Line([fromX, fromY, toX, toY], {
      stroke: '#6b7280',
      strokeWidth: 2,
      selectable: false,
      evented: false
    });
  }
}
