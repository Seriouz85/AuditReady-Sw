/**
 * Bridge between Mermaid.js and existing Fabric.js code
 * Provides backward compatibility during migration
 */
import { MermaidRenderer } from './MermaidRenderer';
import { DiagramTemplate } from '../../types/diagram/types';

export class MermaidFabricBridge {
  private mermaidRenderer: MermaidRenderer;

  constructor() {
    this.mermaidRenderer = new MermaidRenderer();
  }

  /**
   * Convert Fabric.js diagram template to Mermaid syntax
   */
  public convertFabricToMermaid(template: DiagramTemplate): string {
    const { nodes, edges } = template;
    
    // Start with flowchart syntax
    let mermaidText = 'flowchart TD\n';
    
    // Add nodes
    nodes.forEach(node => {
      const nodeId = this.sanitizeId(node.id);
      const label = node.label || node.id;
      
      // Determine node shape based on type
      let nodeDefinition = '';
      switch (node.type) {
        case 'start':
          nodeDefinition = `${nodeId}([${label}])`;
          break;
        case 'end':
          nodeDefinition = `${nodeId}([${label}])`;
          break;
        case 'decision':
          nodeDefinition = `${nodeId}{${label}}`;
          break;
        case 'process':
        default:
          nodeDefinition = `${nodeId}[${label}]`;
          break;
      }
      
      mermaidText += `    ${nodeDefinition}\n`;
    });
    
    // Add edges
    edges.forEach(edge => {
      const sourceId = this.sanitizeId(edge.source);
      const targetId = this.sanitizeId(edge.target);
      const label = edge.label ? `|${edge.label}|` : '';
      
      mermaidText += `    ${sourceId} -->${label} ${targetId}\n`;
    });
    
    return mermaidText;
  }

  /**
   * Sanitize ID for Mermaid compatibility
   */
  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  /**
   * Render Fabric template using Mermaid
   */
  public async renderFabricTemplate(
    template: DiagramTemplate,
    container: HTMLElement
  ): Promise<void> {
    const mermaidText = this.convertFabricToMermaid(template);
    this.mermaidRenderer.setContainer(container);
    await this.mermaidRenderer.renderToContainer(mermaidText);
  }

  /**
   * Convert Mermaid syntax back to Fabric template format
   */
  public parseMermaidToFabric(mermaidText: string): Partial<DiagramTemplate> {
    const lines = mermaidText.split('\n').map(l => l.trim()).filter(Boolean);
    const nodes: any[] = [];
    const edges: any[] = [];
    
    // Skip the first line (flowchart declaration)
    const contentLines = lines.slice(1);
    
    contentLines.forEach(line => {
      // Parse node definitions
      const nodeMatch = line.match(/^\s*(\w+)(\[.*?\]|\(.*?\)|\{.*?\})/);
      if (nodeMatch) {
        const [, id, definition] = nodeMatch;
        const label = definition.slice(1, -1); // Remove brackets/parentheses
        
        let type = 'process';
        if (definition.startsWith('([') && definition.endsWith('])')) {
          type = 'start'; // or 'end'
        } else if (definition.startsWith('{') && definition.endsWith('}')) {
          type = 'decision';
        }
        
        nodes.push({
          id,
          label,
          type,
          x: 0,
          y: 0,
          width: 120,
          height: 60
        });
      }
      
      // Parse edge definitions
      const edgeMatch = line.match(/^\s*(\w+)\s*-->\s*(\w+)/);
      if (edgeMatch) {
        const [, source, target] = edgeMatch;
        edges.push({
          id: `${source}-${target}`,
          source,
          target,
          type: 'arrow'
        });
      }
    });
    
    return {
      nodes,
      edges,
      name: 'Converted from Mermaid',
      category: 'flowchart'
    };
  }

  /**
   * Get available conversion options
   */
  public getConversionOptions(): string[] {
    return [
      'fabric-to-mermaid',
      'mermaid-to-fabric',
      'auto-detect'
    ];
  }

  /**
   * Validate if template can be converted
   */
  public canConvert(template: DiagramTemplate): boolean {
    return template.nodes && template.nodes.length > 0;
  }

  /**
   * Get conversion statistics
   */
  public getConversionStats(template: DiagramTemplate): {
    nodeCount: number;
    edgeCount: number;
    supportedTypes: string[];
    unsupportedTypes: string[];
  } {
    const supportedTypes = ['start', 'end', 'process', 'decision'];
    const nodeTypes = template.nodes.map(n => n.type || 'process');
    
    return {
      nodeCount: template.nodes.length,
      edgeCount: template.edges?.length || 0,
      supportedTypes: nodeTypes.filter(t => supportedTypes.includes(t)),
      unsupportedTypes: nodeTypes.filter(t => !supportedTypes.includes(t))
    };
  }

  /**
   * Preview conversion without rendering
   */
  public previewConversion(template: DiagramTemplate): {
    mermaidText: string;
    estimatedSize: { width: number; height: number };
    warnings: string[];
  } {
    const mermaidText = this.convertFabricToMermaid(template);
    const warnings: string[] = [];
    
    // Check for potential issues
    if (template.nodes.length > 20) {
      warnings.push('Large diagram may have performance implications');
    }
    
    const stats = this.getConversionStats(template);
    if (stats.unsupportedTypes.length > 0) {
      warnings.push(`Unsupported node types: ${stats.unsupportedTypes.join(', ')}`);
    }
    
    return {
      mermaidText,
      estimatedSize: {
        width: Math.max(400, template.nodes.length * 150),
        height: Math.max(300, template.nodes.length * 100)
      },
      warnings
    };
  }
}
