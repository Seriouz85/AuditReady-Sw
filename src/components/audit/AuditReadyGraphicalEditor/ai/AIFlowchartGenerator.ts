/**
 * AI-Powered Flowchart Generator
 * Inspired by YN's plugin architecture and diagram integration patterns
 */

import * as fabric from 'fabric';

export interface FlowchartNode {
  id: string;
  type: 'start' | 'process' | 'decision' | 'end' | 'connector';
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  connections: string[];
  metadata?: {
    riskLevel?: 'low' | 'medium' | 'high';
    controlType?: 'preventive' | 'detective' | 'corrective';
    compliance?: string[];
  };
}

export interface FlowchartData {
  nodes: FlowchartNode[];
  title: string;
  description: string;
  category: 'audit-process' | 'risk-assessment' | 'compliance-check' | 'control-flow';
}

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
  private apiEndpoint: string;

  constructor(canvas: fabric.Canvas, apiEndpoint: string = '/api/ai/flowchart') {
    this.canvas = canvas;
    this.apiEndpoint = apiEndpoint;
  }

  /**
   * Generate flowchart from natural language prompt
   */
  async generateFromPrompt(request: AIFlowchartRequest): Promise<FlowchartData> {
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
  private generateSampleFlowchart(request: AIFlowchartRequest): FlowchartData {
    const prompt = request.prompt.toLowerCase();

    if (prompt.includes('audit') || prompt.includes('review')) {
      return this.generateAuditProcessFlowchart(request);
    } else if (prompt.includes('risk') || prompt.includes('assessment')) {
      return this.generateRiskAssessmentFlowchart(request);
    } else if (prompt.includes('compliance') || prompt.includes('control')) {
      return this.generateComplianceFlowchart(request);
    } else {
      return this.generateGenericProcessFlowchart(request);
    }
  }

  /**
   * Generate audit process flowchart
   */
  private generateAuditProcessFlowchart(request: AIFlowchartRequest): FlowchartData {
    const nodes: FlowchartNode[] = [
      {
        id: 'start',
        type: 'start',
        text: 'Start Audit',
        x: 100,
        y: 50,
        width: 120,
        height: 60,
        connections: ['planning']
      },
      {
        id: 'planning',
        type: 'process',
        text: 'Audit Planning\n& Risk Assessment',
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
        text: 'Fieldwork\n& Testing',
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
        text: 'Issues\nIdentified?',
        x: 100,
        y: 410,
        width: 120,
        height: 80,
        connections: ['findings', 'reporting']
      },
      {
        id: 'findings',
        type: 'process',
        text: 'Document\nFindings',
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
        text: 'Audit\nReporting',
        x: 100,
        y: 540,
        width: 120,
        height: 80,
        connections: ['end']
      },
      {
        id: 'end',
        type: 'end',
        text: 'Audit Complete',
        x: 100,
        y: 670,
        width: 120,
        height: 60,
        connections: []
      }
    ];

    return {
      nodes,
      title: 'Audit Process Flow',
      description: 'Standard audit process from planning to completion',
      category: 'audit-process'
    };
  }

  /**
   * Generate risk assessment flowchart
   */
  private generateRiskAssessmentFlowchart(request: AIFlowchartRequest): FlowchartData {
    const nodes: FlowchartNode[] = [
      {
        id: 'start',
        type: 'start',
        text: 'Risk Assessment',
        x: 100,
        y: 50,
        width: 140,
        height: 60,
        connections: ['identify']
      },
      {
        id: 'identify',
        type: 'process',
        text: 'Identify\nRisks',
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
        text: 'Analyze\nLikelihood & Impact',
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
        text: 'Risk Level\nAcceptable?',
        x: 100,
        y: 410,
        width: 140,
        height: 80,
        connections: ['accept', 'mitigate']
      },
      {
        id: 'mitigate',
        type: 'process',
        text: 'Develop\nMitigation Plan',
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
        text: 'Accept\nRisk',
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
        text: 'Monitor\n& Review',
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
        text: 'Risk Managed',
        x: 210,
        y: 670,
        width: 120,
        height: 60,
        connections: []
      }
    ];

    return {
      nodes,
      title: 'Risk Assessment Process',
      description: 'Comprehensive risk identification and management workflow',
      category: 'risk-assessment'
    };
  }

  /**
   * Generate compliance flowchart
   */
  private generateComplianceFlowchart(request: AIFlowchartRequest): FlowchartData {
    const framework = request.context?.framework || 'ISO 27001';

    const nodes: FlowchartNode[] = [
      {
        id: 'start',
        type: 'start',
        text: `${framework}\nCompliance Check`,
        x: 100,
        y: 50,
        width: 140,
        height: 80,
        connections: ['requirements']
      },
      {
        id: 'requirements',
        type: 'process',
        text: 'Review\nRequirements',
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
        text: 'Assess Current\nControls',
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
        text: 'Gaps\nIdentified?',
        x: 100,
        y: 440,
        width: 120,
        height: 80,
        connections: ['remediate', 'compliant']
      },
      {
        id: 'remediate',
        type: 'process',
        text: 'Remediation\nPlan',
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
        text: 'Implement\nControls',
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
        text: 'Verify\nEffectiveness',
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
        text: 'Compliant',
        x: 100,
        y: 570,
        width: 100,
        height: 60,
        connections: []
      }
    ];

    return {
      nodes,
      title: `${framework} Compliance Process`,
      description: `Compliance verification workflow for ${framework}`,
      category: 'compliance-check'
    };
  }

  /**
   * Generate generic process flowchart
   */
  private generateGenericProcessFlowchart(request: AIFlowchartRequest): FlowchartData {
    const nodes: FlowchartNode[] = [
      {
        id: 'start',
        type: 'start',
        text: 'Start Process',
        x: 100,
        y: 50,
        width: 120,
        height: 60,
        connections: ['step1']
      },
      {
        id: 'step1',
        type: 'process',
        text: 'Process Step 1',
        x: 100,
        y: 150,
        width: 140,
        height: 80,
        connections: ['decision']
      },
      {
        id: 'decision',
        type: 'decision',
        text: 'Decision\nPoint?',
        x: 100,
        y: 280,
        width: 120,
        height: 80,
        connections: ['step2a', 'step2b']
      },
      {
        id: 'step2a',
        type: 'process',
        text: 'Option A',
        x: 50,
        y: 410,
        width: 100,
        height: 60,
        connections: ['end']
      },
      {
        id: 'step2b',
        type: 'process',
        text: 'Option B',
        x: 200,
        y: 410,
        width: 100,
        height: 60,
        connections: ['end']
      },
      {
        id: 'end',
        type: 'end',
        text: 'End Process',
        x: 125,
        y: 520,
        width: 120,
        height: 60,
        connections: []
      }
    ];

    return {
      nodes,
      title: 'Generic Process Flow',
      description: 'Basic process workflow template',
      category: 'audit-process'
    };
  }

  /**
   * Render flowchart on canvas
   */
  async renderFlowchart(flowchartData: FlowchartData): Promise<void> {
    console.log('Rendering flowchart:', flowchartData.title);

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
    const title = new fabric.Text(flowchartData.title, {
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
  private createFlowchartNode(node: FlowchartNode): fabric.Group {
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

    const text = new fabric.Text(node.text, {
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
  private getNodeColors(node: FlowchartNode): { fill: string; stroke: string } {
    const riskColors = {
      low: { fill: '#d1fae5', stroke: '#10b981' },
      medium: { fill: '#fef3c7', stroke: '#f59e0b' },
      high: { fill: '#fee2e2', stroke: '#ef4444' }
    };

    if (node.metadata?.riskLevel) {
      return riskColors[node.metadata.riskLevel];
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
  private createConnection(fromNode: FlowchartNode, toNode: FlowchartNode): fabric.Line {
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
