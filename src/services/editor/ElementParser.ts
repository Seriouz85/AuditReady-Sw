/**
 * Enhanced Mermaid Parser Service
 * Parses Mermaid diagrams and provides full AST manipulation for visual editing
 */
import { DiagramElement } from '../../components/editor/VisualElementEditor';

export interface ParsedDiagram {
  elements: DiagramElement[];
  connections: Connection[];
  diagramType: string;
  rawText: string;
  ast: MermaidAST;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  type: 'arrow' | 'line' | 'dotted';
  label?: string;
  lineNumber?: number;
}

export interface MermaidAST {
  type: string;
  nodes: MermaidNode[];
  edges: MermaidEdge[];
  subgraphs: MermaidSubgraph[];
}

export interface MermaidNode {
  id: string;
  text: string;
  shape: 'rectangle' | 'circle' | 'diamond' | 'ellipse' | 'cylinder' | 'hexagon';
  lineNumber: number;
  position?: { x: number; y: number };
  style?: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  };
}

export interface MermaidEdge {
  id: string;
  from: string;
  to: string;
  type: 'arrow' | 'line' | 'dotted' | 'thick';
  label?: string;
  lineNumber: number;
}

export interface MermaidSubgraph {
  id: string;
  title: string;
  nodes: string[];
  lineNumber: number;
}

export interface MermaidAST {
  type: string;
  nodes: MermaidNode[];
  edges: MermaidEdge[];
  subgraphs: MermaidSubgraph[];
}

export interface ParsedDiagram {
  ast: MermaidAST;
  elements: DiagramElement[];
  connections: Connection[];
  diagramType: string;
  rawText?: string;
}

export class ElementParser {
  private static instance: ElementParser;

  private constructor() {}

  public static getInstance(): ElementParser {
    if (!ElementParser.instance) {
      ElementParser.instance = new ElementParser();
    }
    return ElementParser.instance;
  }

  /**
   * Parse Mermaid diagram text and extract elements with full AST
   */
  public parseDiagram(diagramText: string): ParsedDiagram {
    const lines = diagramText.trim().split('\n').map((line, index) => ({
      content: line.trim(),
      lineNumber: index + 1
    })).filter(line => line.content);

    if (lines.length === 0) {
      return {
        elements: [],
        connections: [],
        diagramType: 'unknown',
        rawText: diagramText,
        ast: { type: 'unknown', nodes: [], edges: [], subgraphs: [] }
      };
    }

    const diagramType = this.detectDiagramType(lines[0].content);
    const ast: MermaidAST = {
      type: diagramType,
      nodes: [],
      edges: [],
      subgraphs: []
    };

    // Parse content lines (skip diagram type declaration)
    const contentLines = lines.slice(1);

    switch (diagramType) {
      case 'flowchart':
        this.parseFlowchartAST(contentLines, ast);
        break;
      case 'sequence':
        this.parseSequenceAST(contentLines, ast);
        break;
      case 'class':
        this.parseClassAST(contentLines, ast);
        break;
      default:
        this.parseFlowchartAST(contentLines, ast); // Default to flowchart
    }

    // Convert AST to elements and connections
    const elements = this.astToElements(ast);
    const connections = this.astToConnections(ast);

    return {
      elements,
      connections,
      diagramType,
      rawText: diagramText,
      ast
    };
  }

  /**
   * Parse flowchart into AST
   */
  private parseFlowchartAST(lines: Array<{content: string, lineNumber: number}>, ast: MermaidAST): void {
    lines.forEach(({ content, lineNumber }) => {
      // Parse node definitions: A[Text] or A(Text) or A{Text}
      const nodeMatch = content.match(/^\s*(\w+)[\[\(\{]([^\]\)\}]+)[\]\)\}]/);
      if (nodeMatch) {
        const [, id, text] = nodeMatch;
        const shape = this.getShapeFromBrackets(content);

        ast.nodes.push({
          id,
          text: text.trim(),
          shape,
          lineNumber
        });
        return;
      }

      // Parse connections: A --> B or A --- B
      const connectionMatch = content.match(/^\s*(\w+)\s*(-->|---|\-\.\->|===|===>)\s*(\w+)(\s*\|\s*([^\|]+)\s*\|)?/);
      if (connectionMatch) {
        const [, from, arrow, to, , label] = connectionMatch;
        const type = this.getConnectionType(arrow);

        ast.edges.push({
          id: `${from}-${to}-${lineNumber}`,
          from,
          to,
          type,
          label: label?.trim(),
          lineNumber
        });
        return;
      }

      // Parse subgraph definitions
      const subgraphMatch = content.match(/^\s*subgraph\s+(\w+)\s*\[([^\]]+)\]/);
      if (subgraphMatch) {
        const [, id, title] = subgraphMatch;
        ast.subgraphs.push({
          id,
          title: title.trim(),
          nodes: [],
          lineNumber
        });
      }
    });
  }

  /**
   * Convert AST nodes to DiagramElements
   */
  private astToElements(ast: MermaidAST): DiagramElement[] {
    return ast.nodes.map(node => ({
      id: node.id,
      type: 'node' as const,
      text: node.text,
      shape: node.shape,
      position: node.position,
      style: node.style
    }));
  }

  /**
   * Convert AST edges to Connections
   */
  private astToConnections(ast: MermaidAST): Connection[] {
    return ast.edges.map(edge => ({
      id: edge.id,
      from: edge.from,
      to: edge.to,
      type: edge.type,
      label: edge.label,
      lineNumber: edge.lineNumber
    }));
  }

  /**
   * Get connection type from arrow syntax
   */
  private getConnectionType(arrow: string): 'arrow' | 'line' | 'dotted' | 'thick' {
    switch (arrow) {
      case '-->': return 'arrow';
      case '---': return 'line';
      case '-.->': return 'dotted';
      case '===':
      case '===>': return 'thick';
      default: return 'arrow';
    }
  }

  /**
   * Convert AST back to Mermaid text
   */
  public generateDiagramText(parsed: ParsedDiagram): string {
    const { ast } = parsed;

    let result = this.getDiagramTypeDeclaration(ast.type) + '\n';

    // Add nodes
    ast.nodes.forEach(node => {
      result += this.generateNodeFromAST(node) + '\n';
    });

    // Add edges
    ast.edges.forEach(edge => {
      result += this.generateEdgeFromAST(edge) + '\n';
    });

    // Add subgraphs
    ast.subgraphs.forEach(subgraph => {
      result += this.generateSubgraphFromAST(subgraph) + '\n';
    });

    return result.trim();
  }

  /**
   * Add new node to AST and return updated diagram text
   */
  public addNode(diagramText: string, nodeId: string, text: string, shape: MermaidNode['shape'] = 'rectangle'): string {
    console.log('🔧 Adding node to diagram:', { nodeId, text, shape });

    const parsed = this.parseDiagram(diagramText);

    // Check if node already exists
    if (parsed.ast.nodes.find(n => n.id === nodeId)) {
      throw new Error(`Node with ID '${nodeId}' already exists`);
    }

    // Add new node to AST
    parsed.ast.nodes.push({
      id: nodeId,
      text,
      shape,
      lineNumber: parsed.ast.nodes.length + 2 // After diagram declaration
    });

    const result = this.generateDiagramText(parsed);
    console.log('✅ Node added successfully, updated diagram:', result);
    return result;
  }

  /**
   * Add connection between nodes
   */
  public addConnection(diagramText: string, fromId: string, toId: string, type: MermaidEdge['type'] = 'arrow', label?: string): string {
    const parsed = this.parseDiagram(diagramText);

    // Verify nodes exist
    const fromNode = parsed.ast.nodes.find(n => n.id === fromId);
    const toNode = parsed.ast.nodes.find(n => n.id === toId);

    if (!fromNode) throw new Error(`Source node '${fromId}' not found`);
    if (!toNode) throw new Error(`Target node '${toId}' not found`);

    // Add new edge to AST
    const edgeId = `${fromId}-${toId}-${Date.now()}`;
    parsed.ast.edges.push({
      id: edgeId,
      from: fromId,
      to: toId,
      type,
      label,
      lineNumber: parsed.ast.edges.length + parsed.ast.nodes.length + 2
    });

    return this.generateDiagramText(parsed);
  }

  /**
   * Update node text
   */
  public updateNodeText(diagramText: string, nodeId: string, newText: string): string {
    const parsed = this.parseDiagram(diagramText);

    const node = parsed.ast.nodes.find(n => n.id === nodeId);
    if (!node) throw new Error(`Node '${nodeId}' not found`);

    node.text = newText;
    return this.generateDiagramText(parsed);
  }

  /**
   * Update node shape
   */
  public updateNodeShape(diagramText: string, nodeId: string, newShape: MermaidNode['shape']): string {
    const parsed = this.parseDiagram(diagramText);

    const node = parsed.ast.nodes.find(n => n.id === nodeId);
    if (!node) throw new Error(`Node '${nodeId}' not found`);

    node.shape = newShape;
    return this.generateDiagramText(parsed);
  }

  /**
   * Delete node and all connected edges
   */
  public deleteNode(diagramText: string, nodeId: string): string {
    const parsed = this.parseDiagram(diagramText);

    // Remove node
    parsed.ast.nodes = parsed.ast.nodes.filter(n => n.id !== nodeId);

    // Remove connected edges
    parsed.ast.edges = parsed.ast.edges.filter(e => e.from !== nodeId && e.to !== nodeId);

    return this.generateDiagramText(parsed);
  }

  /**
   * Delete connection
   */
  public deleteConnection(diagramText: string, fromId: string, toId: string): string {
    const parsed = this.parseDiagram(diagramText);

    // Remove edge
    parsed.ast.edges = parsed.ast.edges.filter(e => !(e.from === fromId && e.to === toId));

    return this.generateDiagramText(parsed);
  }

  /**
   * Generate unique node ID
   */
  public generateNodeId(diagramText: string, prefix: string = 'node'): string {
    const parsed = this.parseDiagram(diagramText);
    const existingIds = parsed.ast.nodes.map(n => n.id);

    let counter = 1;
    let newId = `${prefix}${counter}`;

    while (existingIds.includes(newId)) {
      counter++;
      newId = `${prefix}${counter}`;
    }

    return newId;
  }

  /**
   * Update element in diagram text
   */
  public updateElementInText(diagramText: string, elementId: string, newText: string): string {
    const lines = diagramText.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if line contains the element
      if (line.includes(elementId)) {
        // Replace the text content while preserving structure
        lines[i] = this.replaceElementText(line, elementId, newText);
      }
    }

    return lines.join('\n');
  }

  /**
   * Extract elements from SVG
   */
  public extractElementsFromSVG(svgElement: SVGElement): DiagramElement[] {
    const elements: DiagramElement[] = [];

    // Find all nodes
    const nodes = svgElement.querySelectorAll('.node');
    nodes.forEach((node, index) => {
      const textElement = node.querySelector('text');
      const rect = node.getBoundingClientRect();

      if (textElement) {
        elements.push({
          id: `node-${index}`,
          type: 'node',
          text: textElement.textContent || '',
          position: { x: rect.left, y: rect.top },
          svgElement: node as SVGElement,
          style: this.extractElementStyle(node as SVGElement)
        });
      }
    });

    // Find all edges
    const edges = svgElement.querySelectorAll('.edge');
    edges.forEach((edge, index) => {
      const textElement = edge.querySelector('text');
      const rect = edge.getBoundingClientRect();

      elements.push({
        id: `edge-${index}`,
        type: 'edge',
        text: textElement?.textContent || '',
        position: { x: rect.left, y: rect.top },
        svgElement: edge as SVGElement,
        style: this.extractElementStyle(edge as SVGElement)
      });
    });

    return elements;
  }

  /**
   * Detect diagram type from first line
   */
  private detectDiagramType(firstLine: string): string {
    const line = firstLine.toLowerCase();

    if (line.includes('flowchart') || line.includes('graph')) return 'flowchart';
    if (line.includes('sequencediagram')) return 'sequence';
    if (line.includes('classdiagram')) return 'class';
    if (line.includes('statediagram')) return 'state';
    if (line.includes('gantt')) return 'gantt';
    if (line.includes('pie')) return 'pie';

    return 'flowchart'; // Default
  }

  /**
   * Parse flowchart diagram
   */
  private parseFlowchart(lines: string[], elements: DiagramElement[], connections: Connection[]): void {
    lines.forEach((line, index) => {
      // Parse node definitions: A[Text] or A(Text) or A{Text}
      const nodeMatch = line.match(/(\w+)[\[\(\{]([^\]\)\}]+)[\]\)\}]/);
      if (nodeMatch) {
        const [, id, text] = nodeMatch;
        elements.push({
          id,
          type: 'node',
          text: text.trim(),
          shape: this.getShapeFromBrackets(line)
        });
      }

      // Parse connections: A --> B or A --- B
      const connectionMatch = line.match(/(\w+)\s*(-->|---|\-\.\->)\s*(\w+)(\|([^\|]+)\|)?/);
      if (connectionMatch) {
        const [, from, arrow, to, , label] = connectionMatch;
        connections.push({
          id: `conn-${index}`,
          from,
          to,
          type: arrow === '-->' ? 'arrow' : arrow === '---' ? 'line' : 'dotted',
          label: label?.trim()
        });
      }
    });
  }

  /**
   * Parse sequence diagram into AST
   */
  private parseSequenceAST(lines: Array<{content: string, lineNumber: number}>, ast: MermaidAST): void {
    lines.forEach(({ content, lineNumber }) => {
      // Parse participant definitions
      const participantMatch = content.match(/^\s*participant\s+(\w+)(?:\s+as\s+(.+))?/);
      if (participantMatch) {
        const [, id, alias] = participantMatch;
        ast.nodes.push({
          id,
          text: alias || id,
          shape: 'rectangle',
          lineNumber
        });
        return;
      }

      // Parse messages
      const messageMatch = content.match(/^\s*(\w+)\s*(->|-->|->>|-->>)\s*(\w+)\s*:\s*(.+)/);
      if (messageMatch) {
        const [, from, arrow, to, message] = messageMatch;
        const type = arrow.includes('>') ? 'arrow' : 'line';

        ast.edges.push({
          id: `${from}-${to}-${lineNumber}`,
          from,
          to,
          type,
          label: message.trim(),
          lineNumber
        });
      }
    });
  }

  /**
   * Parse class diagram into AST
   */
  private parseClassAST(lines: Array<{content: string, lineNumber: number}>, ast: MermaidAST): void {
    lines.forEach(({ content, lineNumber }) => {
      // Parse class definitions
      const classMatch = content.match(/^\s*class\s+(\w+)\s*\{([^}]*)\}/);
      if (classMatch) {
        const [, className] = classMatch;
        ast.nodes.push({
          id: className,
          text: className,
          shape: 'rectangle',
          lineNumber
        });
        return;
      }

      // Parse relationships
      const relationMatch = content.match(/^\s*(\w+)\s*(-->|<\|--|o--|\|\|--)\s*(\w+)/);
      if (relationMatch) {
        const [, from, , to] = relationMatch;
        ast.edges.push({
          id: `${from}-${to}-${lineNumber}`,
          from,
          to,
          type: 'arrow',
          lineNumber
        });
      }
    });
  }

  /**
   * Parse sequence diagram (legacy)
   */
  private parseSequenceDiagram(lines: string[], elements: DiagramElement[], connections: Connection[]): void {
    lines.forEach((line, index) => {
      // Parse participant definitions
      const participantMatch = line.match(/participant\s+(\w+)(?:\s+as\s+(.+))?/);
      if (participantMatch) {
        const [, id, alias] = participantMatch;
        elements.push({
          id,
          type: 'node',
          text: alias || id
        });
      }

      // Parse messages
      const messageMatch = line.match(/(\w+)\s*(->|-->|->>|-->>)\s*(\w+)\s*:\s*(.+)/);
      if (messageMatch) {
        const [, from, arrow, to, message] = messageMatch;
        connections.push({
          id: `msg-${index}`,
          from,
          to,
          type: arrow.includes('>') ? 'arrow' : 'line',
          label: message.trim()
        });
      }
    });
  }

  /**
   * Parse class diagram
   */
  private parseClassDiagram(lines: string[], elements: DiagramElement[], connections: Connection[]): void {
    lines.forEach((line, index) => {
      // Parse class definitions
      const classMatch = line.match(/class\s+(\w+)\s*\{([^}]*)\}/);
      if (classMatch) {
        const [, className, content] = classMatch;
        elements.push({
          id: className,
          type: 'node',
          text: className
        });
      }

      // Parse relationships
      const relationMatch = line.match(/(\w+)\s*(-->|<\|--|o--|\|\|--)\s*(\w+)/);
      if (relationMatch) {
        const [, from, relation, to] = relationMatch;
        connections.push({
          id: `rel-${index}`,
          from,
          to,
          type: 'arrow'
        });
      }
    });
  }

  /**
   * Parse generic diagram
   */
  private parseGenericDiagram(lines: string[], elements: DiagramElement[], connections: Connection[]): void {
    // Fallback to flowchart parsing
    this.parseFlowchart(lines, elements, connections);
  }

  /**
   * Get shape from bracket type
   */
  private getShapeFromBrackets(line: string): DiagramElement['shape'] {
    if (line.includes('[') && line.includes(']')) return 'rectangle';
    if (line.includes('(') && line.includes(')')) return 'ellipse';
    if (line.includes('{') && line.includes('}')) return 'diamond';
    if (line.includes('((') && line.includes('))')) return 'circle';
    return 'rectangle';
  }

  /**
   * Extract style from SVG element
   */
  private extractElementStyle(element: SVGElement): DiagramElement['style'] {
    const computedStyle = window.getComputedStyle(element);

    return {
      fill: computedStyle.fill !== 'none' ? computedStyle.fill : undefined,
      stroke: computedStyle.stroke !== 'none' ? computedStyle.stroke : undefined,
      strokeWidth: computedStyle.strokeWidth ? parseFloat(computedStyle.strokeWidth) : undefined,
      fontSize: computedStyle.fontSize ? parseFloat(computedStyle.fontSize) : undefined,
      fontWeight: computedStyle.fontWeight || undefined
    };
  }

  /**
   * Get diagram type declaration
   */
  private getDiagramTypeDeclaration(diagramType: string): string {
    switch (diagramType) {
      case 'flowchart': return 'flowchart TD';
      case 'sequence': return 'sequenceDiagram';
      case 'class': return 'classDiagram';
      case 'state': return 'stateDiagram-v2';
      case 'gantt': return 'gantt';
      case 'pie': return 'pie title Pie Chart';
      default: return 'flowchart TD';
    }
  }

  /**
   * Generate node from AST
   */
  private generateNodeFromAST(node: MermaidNode): string {
    const brackets = this.getBracketsForShape(node.shape);
    return `    ${node.id}${brackets[0]}${node.text}${brackets[1]}`;
  }

  /**
   * Generate edge from AST
   */
  private generateEdgeFromAST(edge: MermaidEdge): string {
    const arrow = this.getArrowForType(edge.type);
    let result = `    ${edge.from} ${arrow} ${edge.to}`;

    if (edge.label) {
      result += ` |${edge.label}|`;
    }

    return result;
  }

  /**
   * Generate subgraph from AST
   */
  private generateSubgraphFromAST(subgraph: MermaidSubgraph): string {
    return `    subgraph ${subgraph.id}[${subgraph.title}]`;
  }

  /**
   * Get arrow syntax for connection type
   */
  private getArrowForType(type: MermaidEdge['type']): string {
    switch (type) {
      case 'arrow': return '-->';
      case 'line': return '---';
      case 'dotted': return '-.->';
      case 'thick': return '===>';
      default: return '-->';
    }
  }

  /**
   * Generate connection text
   */
  private generateConnectionText(connection: Connection, elements: DiagramElement[]): string {
    const arrow = connection.type === 'arrow' ? '-->' :
                 connection.type === 'dotted' ? '-..->' : '---';

    let result = `    ${connection.from} ${arrow} ${connection.to}`;

    if (connection.label) {
      result += ` |${connection.label}|`;
    }

    return result;
  }

  /**
   * Get brackets for shape
   */
  private getBracketsForShape(shape?: DiagramElement['shape']): [string, string] {
    switch (shape) {
      case 'rectangle': return ['[', ']'];
      case 'ellipse': return ['(', ')'];
      case 'diamond': return ['{', '}'];
      case 'circle': return ['((', '))'];
      default: return ['[', ']'];
    }
  }

  /**
   * Replace element text in line
   */
  private replaceElementText(line: string, elementId: string, newText: string): string {
    // Replace text within brackets while preserving structure
    const patterns = [
      new RegExp(`(${elementId}\\[)[^\\]]+\\]`, 'g'),
      new RegExp(`(${elementId}\\()[^\\)]+\\)`, 'g'),
      new RegExp(`(${elementId}\\{)[^\\}]+\\}`, 'g'),
      new RegExp(`(${elementId}\\(\\()[^\\)]+\\)\\)`, 'g')
    ];

    for (const pattern of patterns) {
      if (pattern.test(line)) {
        return line.replace(pattern, (match) => {
          const openBracket = match.substring(elementId.length, match.length - (match.length - elementId.length - 1));
          const closeBracket = match.charAt(match.length - 1);
          return `${elementId}${openBracket}${newText}${closeBracket}`;
        });
      }
    }

    return line;
  }
}
