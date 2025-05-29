/**
 * Core Mermaid.js Service
 * Handles initialization, configuration, and lifecycle management
 */
import mermaid from 'mermaid';
import { MermaidConfig, DiagramType, RenderOptions } from './types/mermaid-config';

export class MermaidService {
  private static instance: MermaidService;
  private isInitialized: boolean = false;
  private config: MermaidConfig;

  private constructor() {
    this.config = this.getDefaultConfig();
  }

  public static getInstance(): MermaidService {
    if (!MermaidService.instance) {
      MermaidService.instance = new MermaidService();
    }
    return MermaidService.instance;
  }

  /**
   * Initialize Mermaid with AuditReady-specific configuration
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      mermaid.initialize(this.config);
      this.isInitialized = true;
      console.log('✅ Mermaid.js initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Mermaid.js:', error);
      throw new Error('Mermaid initialization failed');
    }
  }

  /**
   * Get default configuration optimized for AuditReady
   */
  private getDefaultConfig(): MermaidConfig {
    return {
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#3b82f6',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#1e40af',
        lineColor: '#64748b',
        sectionBkgColor: '#1e293b',
        altSectionBkgColor: '#334155',
        gridColor: '#475569',
        secondaryColor: '#06b6d4',
        tertiaryColor: '#8b5cf6'
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      sequence: {
        diagramMarginX: 50,
        diagramMarginY: 10,
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35
      },
      gantt: {
        titleTopMargin: 25,
        barHeight: 20,
        fontFamily: 'Inter, sans-serif',
        fontSize: 11,
        gridLineStartPadding: 35,
        bottomPadding: 25,
        leftPadding: 75,
        rightPadding: 35
      },
      securityLevel: 'loose',
      deterministicIds: true,
      maxTextSize: 50000
    };
  }

  /**
   * Validate Mermaid syntax
   */
  public validateSyntax(text: string): { isValid: boolean; error?: string; suggestions?: string[] } {
    if (!text.trim()) {
      return { isValid: false, error: 'Empty diagram text' };
    }

    try {
      mermaid.parse(text);
      return { isValid: true };
    } catch (error) {
      const errorMessage = (error as Error).message;
      const suggestions = this.generateSyntaxSuggestions(text, errorMessage);

      return {
        isValid: false,
        error: errorMessage,
        suggestions
      };
    }
  }

  /**
   * Generate syntax suggestions based on common errors
   */
  private generateSyntaxSuggestions(text: string, error: string): string[] {
    const suggestions: string[] = [];

    if (error.includes('Parse error')) {
      suggestions.push('Check for missing arrows (-->) or incorrect syntax');
    }

    if (error.includes('Expecting')) {
      suggestions.push('Verify diagram type declaration (flowchart TD, sequenceDiagram, etc.)');
    }

    if (!text.includes('flowchart') && !text.includes('graph') && !text.includes('sequenceDiagram')) {
      suggestions.push('Start with a diagram type: flowchart TD, sequenceDiagram, gantt, etc.');
    }

    if (text.includes('[') && !text.includes(']')) {
      suggestions.push('Check for unmatched brackets in node definitions');
    }

    return suggestions;
  }

  /**
   * Render diagram from Mermaid text with enhanced error handling
   */
  public async renderDiagram(
    text: string,
    elementId: string,
    options?: RenderOptions
  ): Promise<{ svg: string; bindFunctions?: any; metadata?: any }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Validate syntax first
    const validation = this.validateSyntax(text);
    if (!validation.isValid) {
      throw new Error(`Syntax Error: ${validation.error}`);
    }

    try {
      const result = await mermaid.render(elementId, text);

      // Extract additional metadata
      const metadata = {
        diagramType: this.detectDiagramType(text),
        nodeCount: this.countNodes(text),
        edgeCount: this.countEdges(text),
        complexity: this.calculateComplexity(text)
      };

      console.log('✅ Diagram rendered successfully', metadata);
      return { ...result, metadata };
    } catch (error) {
      console.error('❌ Failed to render diagram:', error);
      throw new Error(`Diagram rendering failed: ${(error as Error).message}`);
    }
  }

  /**
   * Detect diagram type from text
   */
  private detectDiagramType(text: string): string {
    const firstLine = text.trim().split('\n')[0].toLowerCase();

    if (firstLine.includes('flowchart') || firstLine.includes('graph')) return 'flowchart';
    if (firstLine.includes('sequencediagram')) return 'sequence';
    if (firstLine.includes('classdiagram')) return 'class';
    if (firstLine.includes('statediagram')) return 'state';
    if (firstLine.includes('gantt')) return 'gantt';
    if (firstLine.includes('pie')) return 'pie';
    if (firstLine.includes('mindmap')) return 'mindmap';
    if (firstLine.includes('timeline')) return 'timeline';
    if (firstLine.includes('quadrantchart')) return 'quadrant';
    if (firstLine.includes('sankey')) return 'sankey';

    return 'unknown';
  }

  /**
   * Count nodes in diagram
   */
  private countNodes(text: string): number {
    const nodePattern = /\w+\[.*?\]|\w+\(.*?\)|\w+\{.*?\}/g;
    return (text.match(nodePattern) || []).length;
  }

  /**
   * Count edges in diagram
   */
  private countEdges(text: string): number {
    const edgePattern = /-->|---|\-\.\->/g;
    return (text.match(edgePattern) || []).length;
  }

  /**
   * Calculate diagram complexity
   */
  private calculateComplexity(text: string): 'simple' | 'medium' | 'complex' {
    const nodeCount = this.countNodes(text);
    const edgeCount = this.countEdges(text);
    const totalElements = nodeCount + edgeCount;

    if (totalElements <= 5) return 'simple';
    if (totalElements <= 15) return 'medium';
    return 'complex';
  }

  /**
   * Update Mermaid configuration
   */
  public updateConfig(newConfig: Partial<MermaidConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (this.isInitialized) {
      mermaid.initialize(this.config);
    }
  }

  /**
   * Get supported diagram types
   */
  public getSupportedDiagramTypes(): DiagramType[] {
    return [
      'flowchart',
      'sequence',
      'classDiagram',
      'stateDiagram',
      'entityRelationshipDiagram',
      'userJourney',
      'gantt',
      'pieChart',
      'requirementDiagram',
      'gitgraph',
      'mindmap',
      'timeline',
      'quadrantChart',
      'sankey'
    ];
  }

  /**
   * Get current configuration
   */
  public getConfig(): MermaidConfig {
    return { ...this.config };
  }

  /**
   * Check if service is initialized
   */
  public isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Reset service to initial state
   */
  public reset(): void {
    this.isInitialized = false;
    this.config = this.getDefaultConfig();
  }
}
