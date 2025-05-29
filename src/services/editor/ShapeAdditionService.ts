/**
 * Shape Addition Service
 * Handles manual addition of shapes to Mermaid diagrams
 */
import { ElementParser, MermaidNode } from './ElementParser';

export interface ShapeTemplate {
  id: string;
  name: string;
  shape: MermaidNode['shape'];
  defaultText: string;
  icon: string;
  category: 'basic' | 'process' | 'decision' | 'data' | 'connector';
}

export interface AddShapeOptions {
  position?: { x: number; y: number };
  text?: string;
  autoConnect?: boolean;
  connectTo?: string;
}

export class ShapeAdditionService {
  private static instance: ShapeAdditionService;
  private elementParser: ElementParser;

  private constructor() {
    this.elementParser = ElementParser.getInstance();
  }

  public static getInstance(): ShapeAdditionService {
    if (!ShapeAdditionService.instance) {
      ShapeAdditionService.instance = new ShapeAdditionService();
    }
    return ShapeAdditionService.instance;
  }

  /**
   * Get available shape templates
   */
  public getShapeTemplates(): ShapeTemplate[] {
    return [
      // Basic shapes
      {
        id: 'rectangle',
        name: 'Rectangle',
        shape: 'rectangle',
        defaultText: 'Process',
        icon: '⬜',
        category: 'basic'
      },
      {
        id: 'circle',
        name: 'Circle',
        shape: 'circle',
        defaultText: 'Start/End',
        icon: '⭕',
        category: 'basic'
      },
      {
        id: 'diamond',
        name: 'Diamond',
        shape: 'diamond',
        defaultText: 'Decision',
        icon: '🔷',
        category: 'decision'
      },
      {
        id: 'ellipse',
        name: 'Ellipse',
        shape: 'ellipse',
        defaultText: 'Process',
        icon: '⭕',
        category: 'process'
      },
      {
        id: 'cylinder',
        name: 'Cylinder',
        shape: 'cylinder',
        defaultText: 'Database',
        icon: '🗄️',
        category: 'data'
      },
      {
        id: 'hexagon',
        name: 'Hexagon',
        shape: 'hexagon',
        defaultText: 'Preparation',
        icon: '⬡',
        category: 'process'
      }
    ];
  }

  /**
   * Add shape to diagram
   */
  public addShape(
    diagramText: string,
    shapeType: MermaidNode['shape'],
    options: AddShapeOptions = {}
  ): { updatedText: string; nodeId: string } {
    try {
      // Generate unique node ID
      const nodeId = this.elementParser.generateNodeId(diagramText, this.getNodePrefix(shapeType));
      
      // Get default text for shape
      const text = options.text || this.getDefaultText(shapeType);
      
      // Add node to diagram
      let updatedText = this.elementParser.addNode(diagramText, nodeId, text, shapeType);
      
      // Auto-connect if requested
      if (options.autoConnect && options.connectTo) {
        updatedText = this.elementParser.addConnection(
          updatedText,
          options.connectTo,
          nodeId,
          'arrow'
        );
      }
      
      console.log(`✅ Added ${shapeType} shape:`, nodeId);
      return { updatedText, nodeId };
      
    } catch (error) {
      console.error('❌ Failed to add shape:', error);
      throw error;
    }
  }

  /**
   * Add connection between two nodes
   */
  public addConnection(
    diagramText: string,
    fromId: string,
    toId: string,
    connectionType: 'arrow' | 'line' | 'dotted' | 'thick' = 'arrow',
    label?: string
  ): string {
    try {
      return this.elementParser.addConnection(diagramText, fromId, toId, connectionType, label);
    } catch (error) {
      console.error('❌ Failed to add connection:', error);
      throw error;
    }
  }

  /**
   * Quick add process flow
   */
  public addProcessFlow(
    diagramText: string,
    steps: string[],
    startFromNode?: string
  ): string {
    let updatedText = diagramText;
    let previousNodeId = startFromNode;

    steps.forEach((stepText, index) => {
      const nodeId = this.elementParser.generateNodeId(updatedText, 'step');
      
      // Add the step node
      updatedText = this.elementParser.addNode(updatedText, nodeId, stepText, 'rectangle');
      
      // Connect to previous node
      if (previousNodeId) {
        updatedText = this.elementParser.addConnection(updatedText, previousNodeId, nodeId, 'arrow');
      }
      
      previousNodeId = nodeId;
    });

    return updatedText;
  }

  /**
   * Add decision branch
   */
  public addDecisionBranch(
    diagramText: string,
    fromNodeId: string,
    decisionText: string,
    yesText: string,
    noText: string
  ): string {
    let updatedText = diagramText;

    // Add decision node
    const decisionId = this.elementParser.generateNodeId(updatedText, 'decision');
    updatedText = this.elementParser.addNode(updatedText, decisionId, decisionText, 'diamond');
    
    // Connect from source to decision
    updatedText = this.elementParser.addConnection(updatedText, fromNodeId, decisionId, 'arrow');

    // Add yes branch
    const yesId = this.elementParser.generateNodeId(updatedText, 'yes');
    updatedText = this.elementParser.addNode(updatedText, yesId, yesText, 'rectangle');
    updatedText = this.elementParser.addConnection(updatedText, decisionId, yesId, 'arrow', 'Yes');

    // Add no branch
    const noId = this.elementParser.generateNodeId(updatedText, 'no');
    updatedText = this.elementParser.addNode(updatedText, noId, noText, 'rectangle');
    updatedText = this.elementParser.addConnection(updatedText, decisionId, noId, 'arrow', 'No');

    return updatedText;
  }

  /**
   * Get node prefix for shape type
   */
  private getNodePrefix(shape: MermaidNode['shape']): string {
    switch (shape) {
      case 'rectangle': return 'proc';
      case 'circle': return 'start';
      case 'diamond': return 'decision';
      case 'ellipse': return 'process';
      case 'cylinder': return 'data';
      case 'hexagon': return 'prep';
      default: return 'node';
    }
  }

  /**
   * Get default text for shape type
   */
  private getDefaultText(shape: MermaidNode['shape']): string {
    const template = this.getShapeTemplates().find(t => t.shape === shape);
    return template?.defaultText || 'New Node';
  }

  /**
   * Get shape categories
   */
  public getShapeCategories(): Array<{ id: string; name: string; shapes: ShapeTemplate[] }> {
    const templates = this.getShapeTemplates();
    const categories = new Map<string, ShapeTemplate[]>();

    templates.forEach(template => {
      if (!categories.has(template.category)) {
        categories.set(template.category, []);
      }
      categories.get(template.category)!.push(template);
    });

    return [
      { id: 'basic', name: 'Basic Shapes', shapes: categories.get('basic') || [] },
      { id: 'process', name: 'Process', shapes: categories.get('process') || [] },
      { id: 'decision', name: 'Decision', shapes: categories.get('decision') || [] },
      { id: 'data', name: 'Data', shapes: categories.get('data') || [] },
      { id: 'connector', name: 'Connectors', shapes: categories.get('connector') || [] }
    ];
  }

  /**
   * Validate shape addition
   */
  public validateShapeAddition(diagramText: string, nodeId: string): { isValid: boolean; error?: string } {
    try {
      const parsed = this.elementParser.parseDiagram(diagramText);
      
      if (parsed.ast.nodes.find(n => n.id === nodeId)) {
        return { isValid: false, error: `Node with ID '${nodeId}' already exists` };
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: (error as Error).message };
    }
  }

  /**
   * Get suggested connections for a node
   */
  public getSuggestedConnections(diagramText: string, nodeId: string): string[] {
    const parsed = this.elementParser.parseDiagram(diagramText);
    const suggestions: string[] = [];

    // Find nodes that could logically connect to this one
    parsed.ast.nodes.forEach(node => {
      if (node.id !== nodeId) {
        // Check if not already connected
        const hasConnection = parsed.ast.edges.some(edge => 
          (edge.from === nodeId && edge.to === node.id) ||
          (edge.from === node.id && edge.to === nodeId)
        );

        if (!hasConnection) {
          suggestions.push(node.id);
        }
      }
    });

    return suggestions;
  }

  /**
   * Auto-layout nodes (basic positioning)
   */
  public autoLayout(diagramText: string): string {
    // For now, return as-is since Mermaid handles layout automatically
    // In the future, could add positioning hints or subgraph organization
    return diagramText;
  }
}
