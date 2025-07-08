/**
 * Visual Overlay Service
 * Creates intelligent visual overlays for Mermaid diagrams
 * Enables pseudo-visual editing while maintaining text-first approach
 */

export interface NodeInfo {
  id: string;
  text: string;
  type: 'rectangle' | 'circle' | 'diamond' | 'hexagon' | 'parallelogram';
  position: { x: number; y: number };
  size: { width: number; height: number };
  element: SVGElement;
  textPosition?: number; // Position in the diagram text
}

export interface EdgeInfo {
  id: string;
  from: string;
  to: string;
  text?: string;
  element: SVGElement;
}

export interface OverlayEvent {
  type: 'nodeClick' | 'nodeHover' | 'edgeClick' | 'canvasClick';
  nodeId?: string;
  edgeId?: string;
  position?: { x: number; y: number };
  originalEvent: Event;
}

export class VisualOverlayService {
  private static instance: VisualOverlayService;
  private containerElement: HTMLElement | null = null;
  private svgElement: SVGElement | null = null;
  private overlayElement: HTMLElement | null = null;
  private nodes: Map<string, NodeInfo> = new Map();
  private edges: Map<string, EdgeInfo> = new Map();
  private eventListeners: Map<string, ((event: OverlayEvent) => void)[]> = new Map();

  private constructor() {}

  public static getInstance(): VisualOverlayService {
    if (!VisualOverlayService.instance) {
      VisualOverlayService.instance = new VisualOverlayService();
    }
    return VisualOverlayService.instance;
  }

  /**
   * Initialize the overlay service with a container
   */
  public initialize(container: HTMLElement): void {
    this.containerElement = container;
    this.createOverlay();
    console.log('🎯 Visual overlay service initialized');
  }

  /**
   * Analyze the rendered SVG and extract node/edge information
   */
  public analyzeDiagram(diagramText: string): void {
    if (!this.containerElement) return;

    this.svgElement = this.containerElement.querySelector('svg');
    if (!this.svgElement) return;

    console.log('🔍 Analyzing diagram structure...');

    // Clear previous analysis
    this.nodes.clear();
    this.edges.clear();

    // Extract nodes from SVG
    this.extractNodes();
    
    // Extract edges from SVG
    this.extractEdges();

    // Map to diagram text positions
    this.mapToTextPositions(diagramText);

    console.log(`✅ Analysis complete: ${this.nodes.size} nodes, ${this.edges.size} edges`);
  }

  /**
   * Add event listener for overlay events
   */
  public addEventListener(eventType: string, callback: (event: OverlayEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(eventType: string, callback: (event: OverlayEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Get node information by ID
   */
  public getNode(nodeId: string): NodeInfo | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Get all nodes
   */
  public getAllNodes(): NodeInfo[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get node at position
   */
  public getNodeAtPosition(x: number, y: number): NodeInfo | null {
    for (const node of this.nodes.values()) {
      const { position, size } = node;
      if (
        x >= position.x &&
        x <= position.x + size.width &&
        y >= position.y &&
        y <= position.y + size.height
      ) {
        return node;
      }
    }
    return null;
  }

  /**
   * Highlight a node
   */
  public highlightNode(nodeId: string, highlight: boolean = true): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    if (highlight) {
      node.element.style.filter = 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))';
      node.element.style.transform = 'scale(1.02)';
      node.element.style.transition = 'all 0.2s ease';
    } else {
      node.element.style.filter = '';
      node.element.style.transform = '';
      node.element.style.transition = '';
    }
  }

  /**
   * Show tooltip for a node
   */
  public showNodeTooltip(nodeId: string, show: boolean = true): void {
    const node = this.nodes.get(nodeId);
    if (!node || !this.overlayElement) return;

    const tooltipId = `tooltip-${nodeId}`;
    let tooltip = this.overlayElement.querySelector(`#${tooltipId}`) as HTMLElement;

    if (show) {
      if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = tooltipId;
        tooltip.className = 'node-tooltip';
        tooltip.style.cssText = `
          position: absolute;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          pointer-events: none;
          z-index: 1000;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        `;
        this.overlayElement.appendChild(tooltip);
      }

      tooltip.textContent = `${node.id}: ${node.text}`;
      tooltip.style.left = `${node.position.x + node.size.width / 2}px`;
      tooltip.style.top = `${node.position.y - 30}px`;
      tooltip.style.transform = 'translateX(-50%)';
      tooltip.style.display = 'block';
    } else if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  /**
   * Create the overlay element
   */
  private createOverlay(): void {
    if (!this.containerElement) return;

    // Remove existing overlay
    const existingOverlay = this.containerElement.querySelector('.visual-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // Create new overlay
    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'visual-overlay';
    this.overlayElement.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
    `;

    this.containerElement.appendChild(this.overlayElement);
  }

  /**
   * Extract nodes from the SVG
   */
  private extractNodes(): void {
    if (!this.svgElement) return;

    const nodeElements = this.svgElement.querySelectorAll('.node');
    
    nodeElements.forEach((element, index) => {
      const svgElement = element as SVGElement;
      const bbox = svgElement.getBBox();
      
      // Extract node ID from class or data attributes
      const nodeId = this.extractNodeId(svgElement, index);
      
      // Extract text content
      const textElement = svgElement.querySelector('text, foreignObject');
      const text = textElement?.textContent?.trim() || `Node ${index + 1}`;
      
      // Determine node type from shape
      const type = this.determineNodeType(svgElement);

      const nodeInfo: NodeInfo = {
        id: nodeId,
        text,
        type,
        position: { x: bbox.x, y: bbox.y },
        size: { width: bbox.width, height: bbox.height },
        element: svgElement
      };

      this.nodes.set(nodeId, nodeInfo);

      // Add click listener
      svgElement.style.cursor = 'pointer';
      svgElement.addEventListener('click', (event) => {
        event.stopPropagation();
        this.emitEvent({
          type: 'nodeClick',
          nodeId,
          position: { x: event.clientX, y: event.clientY },
          originalEvent: event
        });
      });

      // Add hover listeners
      svgElement.addEventListener('mouseenter', (event) => {
        this.emitEvent({
          type: 'nodeHover',
          nodeId,
          position: { x: event.clientX, y: event.clientY },
          originalEvent: event
        });
      });
    });
  }

  /**
   * Extract edges from the SVG
   */
  private extractEdges(): void {
    if (!this.svgElement) return;

    const edgeElements = this.svgElement.querySelectorAll('.edge');
    
    edgeElements.forEach((element, index) => {
      const svgElement = element as SVGElement;
      const edgeId = `edge-${index}`;
      
      // Extract edge text if available
      const textElement = svgElement.querySelector('text');
      const text = textElement?.textContent?.trim();

      const edgeInfo: EdgeInfo = {
        id: edgeId,
        from: '', // Will be determined from diagram analysis
        to: '',   // Will be determined from diagram analysis
        text,
        element: svgElement
      };

      this.edges.set(edgeId, edgeInfo);

      // Add click listener
      svgElement.style.cursor = 'pointer';
      svgElement.addEventListener('click', (event) => {
        event.stopPropagation();
        this.emitEvent({
          type: 'edgeClick',
          edgeId,
          position: { x: event.clientX, y: event.clientY },
          originalEvent: event
        });
      });
    });
  }

  /**
   * Map nodes to their positions in the diagram text
   */
  private mapToTextPositions(diagramText: string): void {
    const lines = diagramText.split('\n');
    
    this.nodes.forEach((node) => {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes(node.id) && line.includes(node.text)) {
          node.textPosition = i;
          break;
        }
      }
    });
  }

  /**
   * Extract node ID from SVG element
   */
  private extractNodeId(element: SVGElement, fallbackIndex: number): string {
    // Try to extract from class names or data attributes
    const classes = element.className.baseVal || '';
    const match = classes.match(/node-(\w+)/);
    if (match) {
      return match[1];
    }

    // Fallback to alphabet-based ID
    return String.fromCharCode(65 + fallbackIndex); // A, B, C, etc.
  }

  /**
   * Determine node type from SVG shape
   */
  private determineNodeType(element: SVGElement): NodeInfo['type'] {
    const shapes = element.querySelectorAll('rect, circle, polygon, path');
    
    if (shapes.length === 0) return 'rectangle';
    
    const shape = shapes[0];
    
    if (shape.tagName === 'circle') return 'circle';
    if (shape.tagName === 'polygon') return 'diamond';
    if (shape.tagName === 'path') return 'hexagon';
    
    return 'rectangle';
  }

  /**
   * Emit overlay event
   */
  private emitEvent(event: OverlayEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }
}
