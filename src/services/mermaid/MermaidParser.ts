/**
 * Mermaid Text Parsing Utilities
 * Handles parsing and validation of Mermaid syntax
 */
import { DiagramType, ParsedDiagram, ValidationResult } from './types/mermaid-config';

export class MermaidParser {
  /**
   * Parse Mermaid text and extract diagram information
   */
  public static parseDiagram(mermaidText: string): ParsedDiagram {
    const lines = mermaidText.split('\n').map(l => l.trim()).filter(Boolean);
    
    if (lines.length === 0) {
      throw new Error('Empty diagram text');
    }

    const firstLine = lines[0].toLowerCase();
    const diagramType = this.detectDiagramType(firstLine);
    
    switch (diagramType) {
      case 'flowchart':
        return this.parseFlowchart(lines);
      case 'sequence':
        return this.parseSequenceDiagram(lines);
      case 'gantt':
        return this.parseGanttChart(lines);
      default:
        return this.parseGenericDiagram(lines, diagramType);
    }
  }

  /**
   * Detect diagram type from first line
   */
  private static detectDiagramType(firstLine: string): DiagramType {
    if (firstLine.startsWith('flowchart') || firstLine.startsWith('graph')) {
      return 'flowchart';
    }
    if (firstLine.startsWith('sequencediagram')) {
      return 'sequence';
    }
    if (firstLine.startsWith('gantt')) {
      return 'gantt';
    }
    if (firstLine.startsWith('classDiagram')) {
      return 'classDiagram';
    }
    if (firstLine.startsWith('stateDiagram')) {
      return 'stateDiagram';
    }
    if (firstLine.startsWith('erDiagram')) {
      return 'entityRelationshipDiagram';
    }
    if (firstLine.startsWith('journey')) {
      return 'userJourney';
    }
    if (firstLine.startsWith('pie')) {
      return 'pieChart';
    }
    if (firstLine.startsWith('requirementDiagram')) {
      return 'requirementDiagram';
    }
    if (firstLine.startsWith('gitgraph')) {
      return 'gitgraph';
    }
    if (firstLine.startsWith('mindmap')) {
      return 'mindmap';
    }
    if (firstLine.startsWith('timeline')) {
      return 'timeline';
    }
    if (firstLine.startsWith('quadrantChart')) {
      return 'quadrantChart';
    }
    if (firstLine.startsWith('sankey')) {
      return 'sankey';
    }
    
    return 'flowchart'; // Default fallback
  }

  /**
   * Parse flowchart diagram
   */
  private static parseFlowchart(lines: string[]): ParsedDiagram {
    const nodes: any[] = [];
    const edges: any[] = [];
    const nodeMap = new Map<string, any>();

    // Skip the first line (flowchart declaration)
    const contentLines = lines.slice(1);

    contentLines.forEach((line, index) => {
      try {
        // Parse node definitions: A[Label] or A("Label") or A{Label}
        const nodeMatch = line.match(/^\s*(\w+)(\[.*?\]|\(.*?\)|\{.*?\}|>.*?])/);
        if (nodeMatch) {
          const [, id, definition] = nodeMatch;
          const label = this.extractLabel(definition);
          const nodeType = this.getNodeTypeFromDefinition(definition);
          
          const node = {
            id,
            label,
            type: nodeType,
            position: { x: 0, y: 0 },
            size: { width: 120, height: 60 }
          };
          
          nodes.push(node);
          nodeMap.set(id, node);
        }

        // Parse edge definitions: A --> B or A -- label --> B
        const edgeMatch = line.match(/^\s*(\w+)\s*(--[>-]*|==+>*)\s*(\|.*?\|)?\s*(\w+)/);
        if (edgeMatch) {
          const [, source, connector, labelMatch, target] = edgeMatch;
          const label = labelMatch ? labelMatch.slice(1, -1) : undefined;
          
          // Ensure source and target nodes exist
          if (!nodeMap.has(source)) {
            nodeMap.set(source, { id: source, label: source, type: 'process' });
            nodes.push(nodeMap.get(source));
          }
          if (!nodeMap.has(target)) {
            nodeMap.set(target, { id: target, label: target, type: 'process' });
            nodes.push(nodeMap.get(target));
          }
          
          edges.push({
            id: `${source}-${target}-${edges.length}`,
            source,
            target,
            label,
            type: this.getEdgeTypeFromConnector(connector)
          });
        }
      } catch (error) {
        console.warn(`Failed to parse line ${index + 1}: ${line}`, error);
      }
    });

    return {
      type: 'flowchart',
      nodes,
      edges,
      metadata: {
        direction: this.extractDirection(lines[0]),
        lineCount: lines.length
      }
    };
  }

  /**
   * Parse sequence diagram
   */
  private static parseSequenceDiagram(lines: string[]): ParsedDiagram {
    const nodes: any[] = [];
    const edges: any[] = [];
    const participants = new Set<string>();

    lines.slice(1).forEach(line => {
      // Parse participant declarations
      const participantMatch = line.match(/^\s*participant\s+(\w+)(?:\s+as\s+(.+))?/);
      if (participantMatch) {
        const [, id, label] = participantMatch;
        participants.add(id);
        nodes.push({
          id,
          label: label || id,
          type: 'participant',
          position: { x: 0, y: 0 },
          size: { width: 100, height: 40 }
        });
      }

      // Parse messages
      const messageMatch = line.match(/^\s*(\w+)\s*(-->>|->|-->>|--x)\s*(\w+)\s*:\s*(.+)/);
      if (messageMatch) {
        const [, source, arrow, target, message] = messageMatch;
        
        // Add participants if not already declared
        [source, target].forEach(p => {
          if (!participants.has(p)) {
            participants.add(p);
            nodes.push({
              id: p,
              label: p,
              type: 'participant',
              position: { x: 0, y: 0 },
              size: { width: 100, height: 40 }
            });
          }
        });

        edges.push({
          id: `${source}-${target}-${edges.length}`,
          source,
          target,
          label: message,
          type: this.getSequenceArrowType(arrow)
        });
      }
    });

    return {
      type: 'sequence',
      nodes,
      edges,
      metadata: {
        participantCount: participants.size
      }
    };
  }

  /**
   * Parse Gantt chart
   */
  private static parseGanttChart(lines: string[]): ParsedDiagram {
    const nodes: any[] = [];
    const edges: any[] = [];
    let currentSection = '';

    lines.slice(1).forEach(line => {
      // Parse sections
      const sectionMatch = line.match(/^\s*section\s+(.+)/);
      if (sectionMatch) {
        currentSection = sectionMatch[1];
        return;
      }

      // Parse tasks
      const taskMatch = line.match(/^\s*(.+?)\s*:\s*(\w+)?,?\s*(.+)/);
      if (taskMatch) {
        const [, title, id, timeSpec] = taskMatch;
        nodes.push({
          id: id || `task-${nodes.length}`,
          label: title,
          type: 'task',
          position: { x: 0, y: 0 },
          size: { width: 200, height: 30 },
          style: {
            section: currentSection,
            timeSpec
          }
        });
      }
    });

    return {
      type: 'gantt',
      nodes,
      edges,
      metadata: {
        sections: [...new Set(nodes.map(n => n.style?.section).filter(Boolean))]
      }
    };
  }

  /**
   * Parse generic diagram types
   */
  private static parseGenericDiagram(lines: string[], type: DiagramType): ParsedDiagram {
    return {
      type,
      nodes: [],
      edges: [],
      metadata: {
        rawLines: lines,
        parsed: false
      }
    };
  }

  /**
   * Extract label from node definition
   */
  private static extractLabel(definition: string): string {
    const match = definition.match(/[\[\(\{>](.+?)[\]\)\}]/);
    return match ? match[1] : definition;
  }

  /**
   * Get node type from definition syntax
   */
  private static getNodeTypeFromDefinition(definition: string): string {
    if (definition.startsWith('[') && definition.endsWith(']')) return 'process';
    if (definition.startsWith('([') && definition.endsWith('])')) return 'start';
    if (definition.startsWith('{') && definition.endsWith('}')) return 'decision';
    if (definition.startsWith('>') && definition.endsWith(']')) return 'flag';
    return 'process';
  }

  /**
   * Get edge type from connector syntax
   */
  private static getEdgeTypeFromConnector(connector: string): string {
    if (connector.includes('>')) return 'arrow';
    if (connector.includes('=')) return 'thick';
    return 'line';
  }

  /**
   * Get sequence arrow type
   */
  private static getSequenceArrowType(arrow: string): string {
    if (arrow === '-->>') return 'async';
    if (arrow === '->') return 'sync';
    if (arrow === '--x') return 'cross';
    return 'sync';
  }

  /**
   * Extract direction from flowchart declaration
   */
  private static extractDirection(firstLine: string): string {
    const match = firstLine.match(/flowchart\s+(TD|TB|BT|RL|LR)/i);
    return match ? match[1].toUpperCase() : 'TD';
  }

  /**
   * Validate Mermaid syntax
   */
  public static validateSyntax(mermaidText: string): ValidationResult {
    try {
      const parsed = this.parseDiagram(mermaidText);
      const warnings: string[] = [];

      // Check for common issues
      if (parsed.nodes.length === 0) {
        warnings.push('No nodes found in diagram');
      }
      if (parsed.edges.length === 0 && parsed.type === 'flowchart') {
        warnings.push('No connections found in flowchart');
      }

      return {
        isValid: true,
        warnings,
        diagramType: parsed.type
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [(error as Error).message]
      };
    }
  }
}
