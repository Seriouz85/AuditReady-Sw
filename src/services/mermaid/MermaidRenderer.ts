/**
 * Mermaid Rendering Engine Wrapper
 * Handles canvas integration and rendering lifecycle
 */
import { MermaidService } from './MermaidService';
import { RenderOptions, DiagramMetadata } from './types/mermaid-config';
import { DragDropHandler } from '../editor/DragDropHandler';
import { ElementParser } from '../editor/ElementParser';
import { DiagramElement } from '../../components/editor/VisualElementEditor';

export class MermaidRenderer {
  private mermaidService: MermaidService;
  private containerElement: HTMLElement | null = null;
  private currentDiagramId: string | null = null;
  private dragDropHandler: DragDropHandler;
  private elementParser: ElementParser;
  private currentElements: DiagramElement[] = [];
  private isVisualEditingEnabled: boolean = false;

  constructor() {
    this.mermaidService = MermaidService.getInstance();
    this.dragDropHandler = DragDropHandler.getInstance();
    this.elementParser = ElementParser.getInstance();
  }

  /**
   * Set the container element for rendering
   */
  public setContainer(element: HTMLElement): void {
    this.containerElement = element;
  }

  /**
   * Render diagram in the container with enhanced error handling
   */
  public async renderToContainer(
    mermaidText: string,
    options?: RenderOptions
  ): Promise<DiagramMetadata> {
    if (!this.containerElement) {
      throw new Error('Container element not set');
    }

    const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    this.currentDiagramId = diagramId;

    try {
      // Validate syntax first
      const validation = await this.mermaidService.validateSyntax(mermaidText);
      if (!validation.isValid) {
        this.renderErrorState(validation.error || 'Invalid syntax', validation.suggestions);
        throw new Error(`Syntax validation failed: ${validation.error}`);
      }

      const result = await this.mermaidService.renderDiagram(
        mermaidText,
        diagramId,
        options
      );

      // Clear container and insert new SVG
      this.containerElement.innerHTML = result.svg;

      // Apply AuditReady-specific styling
      this.applyCustomStyling();

      // Add interactive features
      this.addInteractiveFeatures();

      // Enable visual editing if requested
      if (this.isVisualEditingEnabled) {
        this.enableVisualEditing(mermaidText);
      }

      // Extract metadata
      const metadata = this.extractDiagramMetadata(result.svg, result.metadata);

      console.log('✅ Diagram rendered to container successfully', metadata);
      return metadata;
    } catch (error) {
      console.error('❌ Failed to render diagram to container:', error);
      this.renderErrorState((error as Error).message);
      throw error;
    }
  }

  /**
   * Render error state in container
   */
  private renderErrorState(errorMessage: string, suggestions?: string[]): void {
    if (!this.containerElement) return;

    const errorHtml = `
      <div style="
        padding: 24px;
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
        border: 1px solid rgba(239, 68, 68, 0.2);
        border-radius: 12px;
        backdrop-filter: blur(10px);
        color: #f8fafc;
        font-family: Inter, sans-serif;
        text-align: center;
        min-height: 200px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 48px;
          height: 48px;
          background: rgba(239, 68, 68, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        ">
          ⚠️
        </div>
        <h3 style="
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #fecaca;
        ">
          Diagram Rendering Error
        </h3>
        <p style="
          margin: 0 0 16px 0;
          font-size: 14px;
          color: rgba(248, 250, 252, 0.8);
          max-width: 400px;
          line-height: 1.5;
        ">
          ${errorMessage}
        </p>
        ${suggestions && suggestions.length > 0 ? `
          <div style="
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.2);
            border-radius: 8px;
            padding: 12px;
            margin-top: 8px;
            max-width: 400px;
          ">
            <div style="
              font-size: 12px;
              font-weight: 600;
              color: #93c5fd;
              margin-bottom: 8px;
            ">
              💡 Suggestions:
            </div>
            ${suggestions.map(suggestion => `
              <div style="
                font-size: 12px;
                color: rgba(248, 250, 252, 0.9);
                margin-bottom: 4px;
                padding-left: 8px;
                border-left: 2px solid rgba(59, 130, 246, 0.3);
              ">
                ${suggestion}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    this.containerElement.innerHTML = errorHtml;
  }

  /**
   * Add interactive features to rendered diagram
   */
  private addInteractiveFeatures(): void {
    if (!this.containerElement) return;

    const svgElement = this.containerElement.querySelector('svg');
    if (!svgElement) return;

    console.log('🎯 Adding interactive features to diagram...');

    // Add click handlers for nodes
    const nodes = svgElement.querySelectorAll('.node');
    console.log(`🎯 Found ${nodes.length} nodes to make interactive`);

    nodes.forEach((node, index) => {
      // Remove existing listeners to prevent duplicates
      const clonedNode = node.cloneNode(true);
      node.parentNode?.replaceChild(clonedNode, node);

      clonedNode.addEventListener('click', (event) => {
        event.stopPropagation();
        console.log(`🎯 Node ${index} clicked`);

        // Check if clicking on text element for inline editing
        if ((event.target as Element).tagName === 'text') {
          this.handleInlineTextEdit(event.target as SVGTextElement, clonedNode as SVGElement, index);
        } else {
          this.handleNodeClick(clonedNode as SVGElement, index);
        }
      });

      clonedNode.addEventListener('mouseenter', () => {
        this.handleNodeHover(clonedNode as SVGElement, true);
      });

      clonedNode.addEventListener('mouseleave', () => {
        this.handleNodeHover(clonedNode as SVGElement, false);
      });

      // FIXED: Drag functionality with proper Mermaid text updates
      this.makeDraggableWithTextUpdate(clonedNode as SVGElement, index);
    });

    // Add click handlers for edges
    const edges = svgElement.querySelectorAll('.edge');
    console.log(`🎯 Found ${edges.length} edges to make interactive`);

    edges.forEach((edge, index) => {
      // Remove existing listeners to prevent duplicates
      const clonedEdge = edge.cloneNode(true);
      edge.parentNode?.replaceChild(clonedEdge, edge);

      clonedEdge.addEventListener('click', (event) => {
        event.stopPropagation();
        console.log(`🎯 Edge ${index} clicked`);
        this.handleEdgeClick(clonedEdge as SVGElement, index);
      });
    });

    // Add canvas click handler
    svgElement.addEventListener('click', (event) => {
      // Only handle if clicking on the SVG itself, not child elements
      if (event.target === svgElement) {
        console.log('🎯 Canvas (SVG) clicked');
        this.handleCanvasClick();
      }
    });

    console.log('✅ Interactive features added successfully');
  }

  /**
   * Handle inline text editing
   */
  private handleInlineTextEdit(textElement: SVGTextElement, nodeElement: SVGElement, index: number): void {
    console.log('🎯 Starting inline text edit for node:', index);

    const currentText = textElement.textContent || '';
    const rect = textElement.getBoundingClientRect();

    // Create input element for editing
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${Math.max(rect.width, 100)}px;
      height: ${rect.height}px;
      font-size: ${window.getComputedStyle(textElement).fontSize};
      font-family: ${window.getComputedStyle(textElement).fontFamily};
      background: white;
      border: 2px solid #3b82f6;
      border-radius: 4px;
      padding: 2px 6px;
      z-index: 10000;
      outline: none;
    `;

    // Hide original text temporarily
    textElement.style.opacity = '0';

    // Add input to document
    document.body.appendChild(input);
    input.focus();
    input.select();

    const finishEdit = () => {
      const newText = input.value.trim();
      if (newText && newText !== currentText) {
        // Update the text element
        textElement.textContent = newText;

        // Emit text change event
        this.emitEvent('nodeTextChanged', {
          element: nodeElement,
          index,
          oldText: currentText,
          newText,
          nodeId: this.extractNodeId(nodeElement)
        });
      }

      // Cleanup
      textElement.style.opacity = '1';
      document.body.removeChild(input);
    };

    // Handle input events
    input.addEventListener('blur', finishEdit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        finishEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        textElement.style.opacity = '1';
        document.body.removeChild(input);
      }
    });
  }

  /**
   * Handle node click events
   */
  private handleNodeClick(node: SVGElement, index: number): void {
    console.log('🎯 Node clicked:', index, 'Element:', node);

    // Remove previous selections
    this.clearSelections();

    // Add selection styling
    node.classList.add('selected');
    node.style.filter = 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))';

    // Emit selection event
    this.emitEvent('nodeSelected', { node, index });
    console.log('🎯 Node selected event emitted:', index);
  }

  /**
   * Handle edge click events
   */
  private handleEdgeClick(edge: SVGElement, index: number): void {
    // Remove previous selections
    this.clearSelections();

    // Add selection styling
    edge.classList.add('selected');
    edge.style.filter = 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.6))';

    // Emit selection event
    this.emitEvent('edgeSelected', { edge, index });
    console.log('🎯 Edge selected:', index);
  }

  /**
   * Handle canvas click events
   */
  private handleCanvasClick(): void {
    this.clearSelections();
    this.emitEvent('canvasClicked', {});
    console.log('🎯 Canvas clicked - selection cleared');
  }

  /**
   * Handle node hover events
   */
  private handleNodeHover(node: SVGElement, isHovering: boolean): void {
    if (isHovering) {
      node.style.opacity = '0.8';
      node.style.cursor = 'grab';
    } else {
      node.style.opacity = '1';
      node.style.cursor = 'default';
    }
  }

  /**
   * Make an SVG element draggable with proper Mermaid text updates - FIXED VERSION
   */
  private makeDraggableWithTextUpdate(element: SVGElement, index: number): void {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    // Make element visually draggable
    element.style.cursor = 'grab';

    // Parse existing transform to get current position
    const parseTransform = (transform: string): { x: number; y: number } => {
      if (!transform) return { x: 0, y: 0 };
      const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
      if (match) {
        return { x: parseFloat(match[1]) || 0, y: parseFloat(match[2]) || 0 };
      }
      return { x: 0, y: 0 };
    };

    // Get initial position from existing transform
    const initialTransform = element.getAttribute('transform') || '';
    const initialPos = parseTransform(initialTransform);
    currentX = initialPos.x;
    currentY = initialPos.y;

    const handleMouseDown = (event: MouseEvent) => {
      // Only start drag if not clicking on text (to allow text editing)
      if ((event.target as Element).tagName === 'text') return;

      event.preventDefault();
      event.stopPropagation();

      isDragging = true;
      startX = event.clientX;
      startY = event.clientY;

      element.style.cursor = 'grabbing';
      console.log(`🎯 Started dragging node ${index} from position (${currentX}, ${currentY})`);

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;

      event.preventDefault();

      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      // Calculate new position
      const newX = currentX + deltaX;
      const newY = currentY + deltaY;

      // Apply transform with absolute positioning - this prevents disappearing
      const newTransform = `translate(${newX}, ${newY})`;
      element.setAttribute('transform', newTransform);
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (!isDragging) return;

      isDragging = false;
      element.style.cursor = 'grab';

      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      // Update current position
      currentX += deltaX;
      currentY += deltaY;

      console.log(`🎯 Finished dragging node ${index}, final position (${currentX}, ${currentY})`);

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // Apply final transform
      const finalTransform = `translate(${currentX}, ${currentY})`;
      element.setAttribute('transform', finalTransform);

      // Emit drag end event with position data
      this.emitEvent('nodeDragged', {
        element,
        index,
        deltaX,
        deltaY,
        finalTransform,
        nodeId: this.extractNodeId(element)
      });
    };

    element.addEventListener('mousedown', handleMouseDown);
  }

  /**
   * Extract node ID from SVG element
   */
  private extractNodeId(element: SVGElement): string {
    // Try to get node ID from various attributes
    const id = element.getAttribute('id') ||
               element.getAttribute('data-id') ||
               element.querySelector('text')?.textContent?.trim() ||
               `node-${Date.now()}`;
    return id;
  }

  /**
   * Clear all selections
   */
  private clearSelections(): void {
    if (!this.containerElement) return;

    const selected = this.containerElement.querySelectorAll('.selected');
    selected.forEach(element => {
      element.classList.remove('selected');
      (element as HTMLElement).style.filter = '';
    });
  }

  /**
   * Emit custom events
   */
  private emitEvent(eventName: string, data: any): void {
    if (this.containerElement) {
      const event = new CustomEvent(`mermaid:${eventName}`, {
        detail: data,
        bubbles: true,
        cancelable: true
      });
      this.containerElement.dispatchEvent(event);
      console.log(`📡 Event emitted: mermaid:${eventName}`, data);
    } else {
      console.warn('⚠️ Cannot emit event - no container element');
    }
  }

  /**
   * Apply custom styling to rendered SVG
   */
  private applyCustomStyling(): void {
    if (!this.containerElement) return;

    const svg = this.containerElement.querySelector('svg');
    if (!svg) return;

    // Apply AuditReady theme styling
    svg.style.background = 'transparent';
    svg.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';

    // Add glassmorphic effects to nodes
    const nodes = svg.querySelectorAll('.node rect, .node circle, .node polygon');
    nodes.forEach(node => {
      const element = node as SVGElement;
      element.style.filter = 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))';
      element.style.backdropFilter = 'blur(10px)';
    });

    // Style text elements
    const textElements = svg.querySelectorAll('text');
    textElements.forEach(text => {
      text.style.fontFamily = 'Inter, sans-serif';
      text.style.fontWeight = '500';
    });
  }

  /**
   * Extract metadata from rendered SVG
   */
  private extractDiagramMetadata(svg: string, additionalMetadata?: any): DiagramMetadata {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');

    if (!svgElement) {
      throw new Error('Invalid SVG content');
    }

    const viewBox = svgElement.getAttribute('viewBox');
    const [x, y, width, height] = viewBox ? viewBox.split(' ').map(Number) : [0, 0, 0, 0];

    const baseMetadata = {
      id: this.currentDiagramId!,
      width,
      height,
      viewBox: { x, y, width, height },
      nodeCount: doc.querySelectorAll('.node').length,
      edgeCount: doc.querySelectorAll('.edge').length,
      diagramType: this.detectDiagramType(svg)
    };

    // Merge with additional metadata if provided
    return additionalMetadata ? { ...baseMetadata, ...additionalMetadata } : baseMetadata;
  }

  /**
   * Detect diagram type from SVG content
   */
  private detectDiagramType(svg: string): string {
    if (svg.includes('flowchart')) return 'flowchart';
    if (svg.includes('sequenceDiagram')) return 'sequence';
    if (svg.includes('classDiagram')) return 'class';
    if (svg.includes('stateDiagram')) return 'state';
    if (svg.includes('gantt')) return 'gantt';
    if (svg.includes('pie')) return 'pie';
    if (svg.includes('mindmap')) return 'mindmap';
    return 'unknown';
  }

  /**
   * Export current diagram as SVG
   */
  public exportAsSVG(): string | null {
    if (!this.containerElement) return null;

    const svg = this.containerElement.querySelector('svg');
    return svg ? svg.outerHTML : null;
  }

  /**
   * Export current diagram as PNG
   */
  public async exportAsPNG(scale: number = 2): Promise<Blob | null> {
    const svg = this.exportAsSVG();
    if (!svg) return null;

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx?.scale(scale, scale);
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob(resolve, 'image/png');
      };

      const blob = new Blob([svg], { type: 'image/svg+xml' });
      img.src = URL.createObjectURL(blob);
    });
  }

  /**
   * Clear the container
   */
  public clear(): void {
    if (this.containerElement) {
      this.containerElement.innerHTML = '';
    }
    this.currentDiagramId = null;
  }

  /**
   * Get current diagram ID
   */
  public getCurrentDiagramId(): string | null {
    return this.currentDiagramId;
  }

  /**
   * Check if container is set
   */
  public hasContainer(): boolean {
    return this.containerElement !== null;
  }

  /**
   * Enable visual editing mode
   */
  public enableVisualEditingMode(): void {
    this.isVisualEditingEnabled = true;
  }

  /**
   * Disable visual editing mode
   */
  public disableVisualEditingMode(): void {
    this.isVisualEditingEnabled = false;
  }

  /**
   * Enable visual editing for current diagram
   */
  private enableVisualEditing(_diagramText: string): void {
    if (!this.containerElement) return;

    // Extract elements from SVG
    const svgElement = this.containerElement.querySelector('svg');
    if (svgElement) {
      this.currentElements = this.elementParser.extractElementsFromSVG(svgElement);

      // DISABLED: Drag functionality causes nodes to disappear
      // this.currentElements.forEach(element => {
      //   if (element.svgElement) {
      //     this.dragDropHandler.makeDraggable(element.svgElement);
      //   }
      // });

      // Register canvas as drop zone
      this.dragDropHandler.registerDropZone({
        id: 'canvas',
        element: this.containerElement,
        bounds: this.containerElement.getBoundingClientRect(),
        onDrop: (element, position) => {
          this.handleElementDrop(element, position);
        }
      });
    }
  }

  /**
   * Handle element drop
   */
  private handleElementDrop(element: SVGElement, position: { x: number; y: number }): void {
    // Update element position
    const transform = `translate(${position.x}, ${position.y})`;
    element.setAttribute('transform', transform);

    // Emit position change event
    this.emitEvent('elementMoved', { element, position });

    console.log('✅ Element moved to:', position);
  }

  /**
   * Get current editable elements
   */
  public getCurrentElements(): DiagramElement[] {
    return [...this.currentElements];
  }

  /**
   * Update element in diagram
   */
  public updateElement(elementId: string, updates: Partial<DiagramElement>): void {
    const elementIndex = this.currentElements.findIndex(el => el.id === elementId);
    if (elementIndex !== -1) {
      this.currentElements[elementIndex] = {
        ...this.currentElements[elementIndex],
        ...updates
      };

      // Apply visual updates to SVG element
      const element = this.currentElements[elementIndex];
      if (element.svgElement) {
        this.applyElementUpdates(element);
      }

      // Emit update event
      this.emitEvent('elementUpdated', { element });
    }
  }

  /**
   * Apply updates to SVG element
   */
  private applyElementUpdates(element: DiagramElement): void {
    if (!element.svgElement) return;

    // Update text content
    const textElement = element.svgElement.querySelector('text');
    if (textElement && element.text) {
      textElement.textContent = element.text;
    }

    // Update styles
    if (element.style) {
      const { fill, stroke, strokeWidth, fontSize } = element.style;

      if (fill) element.svgElement.style.fill = fill;
      if (stroke) element.svgElement.style.stroke = stroke;
      if (strokeWidth) element.svgElement.style.strokeWidth = strokeWidth.toString();
      if (fontSize && textElement) textElement.style.fontSize = `${fontSize}px`;
    }
  }

  /**
   * Delete element from diagram
   */
  public deleteElement(elementId: string): void {
    const elementIndex = this.currentElements.findIndex(el => el.id === elementId);
    if (elementIndex !== -1) {
      const element = this.currentElements[elementIndex];

      // Remove from DOM
      if (element.svgElement) {
        element.svgElement.remove();
      }

      // Remove from array
      this.currentElements.splice(elementIndex, 1);

      // Emit delete event
      this.emitEvent('elementDeleted', { elementId });

      console.log('🗑️ Element deleted:', elementId);
    }
  }

  /**
   * Duplicate element
   */
  public duplicateElement(elementId: string): DiagramElement | null {
    const element = this.currentElements.find(el => el.id === elementId);
    if (!element) return null;

    const newElement: DiagramElement = {
      ...element,
      id: `${element.id}-copy-${Date.now()}`,
      position: element.position ? {
        x: element.position.x + 20,
        y: element.position.y + 20
      } : undefined
    };

    this.currentElements.push(newElement);

    // Emit duplicate event
    this.emitEvent('elementDuplicated', { original: element, duplicate: newElement });

    console.log('📋 Element duplicated:', elementId);
    return newElement;
  }
}
