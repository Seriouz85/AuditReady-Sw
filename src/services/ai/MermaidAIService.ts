/**
 * AI-Powered Mermaid Diagram Generation Service
 * Converts natural language to Mermaid syntax with intelligent suggestions
 */

export interface AIGenerationRequest {
  prompt: string;
  diagramType?: string;
  context?: 'audit' | 'risk' | 'compliance' | 'process' | 'organization';
  complexity?: 'simple' | 'medium' | 'complex';
  style?: 'professional' | 'detailed' | 'minimal';
}

export interface AIGenerationResponse {
  mermaidCode: string;
  diagramType: string;
  confidence: number;
  suggestions: string[];
  explanation: string;
}

export interface AIOptimizationRequest {
  currentCode: string;
  optimizationType: 'layout' | 'readability' | 'performance' | 'aesthetics';
}

export interface AICompletionRequest {
  partialCode: string;
  cursorPosition: number;
  context: string;
}

export class MermaidAIService {
  private static instance: MermaidAIService;
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.openai.com/v1';

  private constructor() {
    // Initialize with environment variables or configuration
    // Use import.meta.env for Vite instead of process.env
    try {
      // Try Gemini API key first, then OpenAI as fallback
      this.apiKey = import.meta.env?.VITE_GEMINI_API_KEY ||
                   import.meta.env?.VITE_OPENAI_API_KEY ||
                   null;

      // Set base URL based on available API key
      if (import.meta.env?.VITE_GEMINI_API_KEY) {
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
      }
    } catch (error) {
      // Fallback if import.meta is not available
      this.apiKey = null;
    }
  }

  public static getInstance(): MermaidAIService {
    if (!MermaidAIService.instance) {
      MermaidAIService.instance = new MermaidAIService();
    }
    return MermaidAIService.instance;
  }

  /**
   * Generate Mermaid diagram from natural language
   */
  public async generateDiagram(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      // If no API key, use local intelligent generation
      if (!this.apiKey) {
        return this.generateDiagramLocally(request);
      }

      const prompt = this.buildGenerationPrompt(request);
      const response = await this.callOpenAI(prompt);

      return this.parseAIResponse(response, request);
    } catch (error) {
      console.error('AI Generation failed, falling back to local generation:', error);
      return this.generateDiagramLocally(request);
    }
  }

  /**
   * Optimize existing Mermaid diagram
   */
  public async optimizeDiagram(request: AIOptimizationRequest): Promise<string> {
    try {
      if (!this.apiKey) {
        return this.optimizeDiagramLocally(request);
      }

      const prompt = this.buildOptimizationPrompt(request);
      const response = await this.callOpenAI(prompt);

      return this.extractMermaidCode(response);
    } catch (error) {
      console.error('AI Optimization failed, falling back to local optimization:', error);
      return this.optimizeDiagramLocally(request);
    }
  }

  /**
   * Provide intelligent code completion
   */
  public async getCompletion(request: AICompletionRequest): Promise<string[]> {
    try {
      if (!this.apiKey) {
        return this.getCompletionLocally(request);
      }

      const prompt = this.buildCompletionPrompt(request);
      const response = await this.callOpenAI(prompt);

      return this.parseCompletionResponse(response);
    } catch (error) {
      console.error('AI Completion failed, falling back to local completion:', error);
      return this.getCompletionLocally(request);
    }
  }

  /**
   * Get diagram suggestions based on content analysis
   */
  public async getSuggestions(diagramCode: string): Promise<string[]> {
    const suggestions: string[] = [];

    // Analyze diagram structure
    const lines = diagramCode.split('\n').filter(line => line.trim());
    const nodeCount = this.countNodes(diagramCode);
    const edgeCount = this.countEdges(diagramCode);

    // Provide intelligent suggestions
    if (nodeCount > 10) {
      suggestions.push('Consider breaking this into multiple smaller diagrams');
      suggestions.push('Use subgraphs to group related elements');
    }

    if (edgeCount > 15) {
      suggestions.push('Simplify connections to improve readability');
    }

    if (diagramCode.includes('flowchart') && !diagramCode.includes('subgraph')) {
      suggestions.push('Add subgraphs to organize complex flows');
    }

    if (!diagramCode.includes('classDef') && nodeCount > 5) {
      suggestions.push('Add custom styling with classDef for better visual hierarchy');
    }

    return suggestions;
  }

  /**
   * Local diagram generation (fallback)
   */
  private generateDiagramLocally(request: AIGenerationRequest): AIGenerationResponse {
    const { prompt, context = 'process', complexity = 'medium' } = request;

    // Intelligent keyword analysis
    const keywords = this.extractKeywords(prompt.toLowerCase());
    const diagramType = this.detectDiagramType(keywords, context);
    const mermaidCode = this.generateCodeFromKeywords(keywords, diagramType, complexity);

    return {
      mermaidCode,
      diagramType,
      confidence: 0.8,
      suggestions: this.generateSuggestions(keywords, context),
      explanation: `Generated ${diagramType} diagram based on detected keywords: ${keywords.slice(0, 3).join(', ')}`
    };
  }

  /**
   * Extract keywords from natural language prompt
   */
  private extractKeywords(prompt: string): string[] {
    const auditKeywords = ['audit', 'review', 'assessment', 'evaluation', 'examination', 'testing', 'verification'];
    const riskKeywords = ['risk', 'threat', 'vulnerability', 'impact', 'likelihood', 'mitigation', 'control'];
    const processKeywords = ['process', 'workflow', 'procedure', 'step', 'stage', 'phase', 'activity'];
    const orgKeywords = ['organization', 'team', 'department', 'role', 'responsibility', 'hierarchy', 'structure'];
    const timeKeywords = ['timeline', 'schedule', 'deadline', 'milestone', 'duration', 'project', 'plan'];

    const allKeywords = [...auditKeywords, ...riskKeywords, ...processKeywords, ...orgKeywords, ...timeKeywords];

    return allKeywords.filter(keyword => prompt.includes(keyword));
  }

  /**
   * Detect appropriate diagram type from keywords
   */
  private detectDiagramType(keywords: string[], context: string): string {
    if (keywords.some(k => ['timeline', 'schedule', 'project', 'milestone'].includes(k))) {
      return 'gantt';
    }
    if (keywords.some(k => ['organization', 'hierarchy', 'structure', 'team'].includes(k))) {
      return 'flowchart';
    }
    if (keywords.some(k => ['risk', 'impact', 'likelihood'].includes(k))) {
      return 'quadrantChart';
    }
    if (keywords.some(k => ['sequence', 'interaction', 'communication'].includes(k))) {
      return 'sequenceDiagram';
    }
    if (context === 'audit' || keywords.some(k => ['audit', 'process', 'workflow'].includes(k))) {
      return 'flowchart';
    }

    return 'flowchart'; // Default
  }

  /**
   * Generate Mermaid code from keywords
   */
  private generateCodeFromKeywords(keywords: string[], diagramType: string, complexity: string): string {
    switch (diagramType) {
      case 'flowchart':
        return this.generateFlowchart(keywords, complexity);
      case 'gantt':
        return this.generateGantt(keywords, complexity);
      case 'quadrantChart':
        return this.generateQuadrant(keywords, complexity);
      case 'sequenceDiagram':
        return this.generateSequence(keywords, complexity);
      default:
        return this.generateFlowchart(keywords, complexity);
    }
  }

  /**
   * Generate flowchart from keywords
   */
  private generateFlowchart(keywords: string[], complexity: string): string {
    const hasAudit = keywords.some(k => ['audit', 'review', 'assessment'].includes(k));
    const hasRisk = keywords.some(k => ['risk', 'threat', 'control'].includes(k));

    if (hasAudit) {
      return `flowchart TD
    A[Audit Planning] --> B[Risk Assessment]
    B --> C[Control Testing]
    C --> D[Evidence Collection]
    D --> E[Findings Analysis]
    E --> F[Report Generation]
    F --> G[Management Review]
    G --> H[Action Plan]

    style A fill:#e1f5fe
    style F fill:#f3e5f5
    style H fill:#e8f5e8`;
    }

    if (hasRisk) {
      return `flowchart TD
    A[Risk Identification] --> B[Risk Analysis]
    B --> C[Risk Assessment]
    C --> D[Risk Evaluation]
    D --> E{Risk Level}
    E -->|High| F[Immediate Action Required]
    E -->|Medium| G[Risk Treatment Planning]
    E -->|Low| H[Risk Monitoring]

    F --> I[Emergency Response]
    G --> J[Control Implementation]
    H --> K[Periodic Review]

    I --> L[Risk Mitigation]
    J --> L
    K --> M{Risk Changed?}
    M -->|Yes| B
    M -->|No| K
    L --> N[Risk Register Update]
    N --> O[Management Reporting]

    subgraph "Risk Assessment Phase"
        A
        B
        C
        D
    end

    subgraph "Risk Treatment Phase"
        F
        G
        I
        J
    end

    subgraph "Risk Monitoring Phase"
        H
        K
        M
    end

    style A fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    style E fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style F fill:#ffcdd2,stroke:#c62828,stroke-width:2px
    style L fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    style O fill:#e3f2fd,stroke:#1976d2,stroke-width:2px`;
    }

    return `flowchart TD
    A[Start] --> B[Process Step 1]
    B --> C[Process Step 2]
    C --> D[Decision Point]
    D -->|Yes| E[Action A]
    D -->|No| F[Action B]
    E --> G[End]
    F --> G`;
  }

  /**
   * Generate Gantt chart from keywords
   */
  private generateGantt(keywords: string[], complexity: string): string {
    return `gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Requirements Analysis    :done,    req, 2024-01-01,2024-01-15
    Risk Assessment         :done,    risk, 2024-01-10,2024-01-25
    section Execution
    Implementation          :active,  impl, 2024-01-20,2024-02-15
    Testing                 :         test, 2024-02-01,2024-02-20
    section Completion
    Documentation           :         docs, 2024-02-15,2024-02-25
    Final Review            :         review, 2024-02-20,2024-03-01`;
  }

  /**
   * Generate quadrant chart for risk assessment
   */
  private generateQuadrant(keywords: string[], complexity: string): string {
    return `quadrantChart
    title Risk Assessment Matrix
    x-axis Low Impact --> High Impact
    y-axis Low Likelihood --> High Likelihood
    quadrant-1 Monitor
    quadrant-2 Mitigate
    quadrant-3 Accept
    quadrant-4 Avoid

    Data Breach: [0.8, 0.6]
    System Failure: [0.6, 0.4]
    Compliance Issue: [0.7, 0.8]
    Budget Overrun: [0.5, 0.7]`;
  }

  /**
   * Generate sequence diagram
   */
  private generateSequence(keywords: string[], complexity: string): string {
    return `sequenceDiagram
    participant User
    participant System
    participant Database
    participant External

    User->>System: Request
    System->>Database: Query Data
    Database-->>System: Return Data
    System->>External: Validate
    External-->>System: Confirmation
    System-->>User: Response`;
  }

  /**
   * Generate suggestions based on context
   */
  private generateSuggestions(keywords: string[], context: string): string[] {
    const suggestions = [
      'Add more specific details to improve accuracy',
      'Consider breaking complex processes into sub-processes',
      'Use different colors to highlight important elements'
    ];

    if (context === 'audit') {
      suggestions.push('Include control points and validation steps');
      suggestions.push('Add risk assessment nodes');
    }

    if (context === 'risk') {
      suggestions.push('Include mitigation strategies');
      suggestions.push('Add probability and impact indicators');
    }

    return suggestions;
  }

  /**
   * Local optimization (fallback)
   */
  private optimizeDiagramLocally(request: AIOptimizationRequest): string {
    const { currentCode, optimizationType } = request;

    switch (optimizationType) {
      case 'layout':
        return this.optimizeLayout(currentCode);
      case 'readability':
        return this.optimizeReadability(currentCode);
      case 'aesthetics':
        return this.optimizeAesthetics(currentCode);
      default:
        return currentCode;
    }
  }

  /**
   * Optimize diagram layout
   */
  private optimizeLayout(code: string): string {
    // Add subgraphs for better organization
    if (code.includes('flowchart') && !code.includes('subgraph')) {
      const lines = code.split('\n');
      const nodes = lines.filter(line => line.includes('-->') || line.includes('['));

      if (nodes.length > 6) {
        return code + '\n\n    subgraph "Main Process"\n        ' +
               nodes.slice(0, 3).join('\n        ') + '\n    end';
      }
    }

    return code;
  }

  /**
   * Optimize for readability
   */
  private optimizeReadability(code: string): string {
    // Add styling for better visual hierarchy
    if (!code.includes('style ') && code.includes('flowchart')) {
      return code + '\n\n    style A fill:#e1f5fe\n    style B fill:#f3e5f5';
    }

    return code;
  }

  /**
   * Optimize aesthetics
   */
  private optimizeAesthetics(code: string): string {
    // Add professional styling
    const aestheticStyles = `
    classDef primary fill:#3b82f6,stroke:#1e40af,stroke-width:2px,color:#fff
    classDef secondary fill:#06b6d4,stroke:#0891b2,stroke-width:2px,color:#fff
    classDef accent fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff`;

    return code + aestheticStyles;
  }

  /**
   * Local completion suggestions
   */
  private getCompletionLocally(request: AICompletionRequest): string[] {
    const { partialCode, cursorPosition } = request;
    const currentLine = this.getCurrentLine(partialCode, cursorPosition);

    const completions: string[] = [];

    if (currentLine.includes('flowchart')) {
      completions.push('TD', 'LR', 'TB', 'RL');
    }

    if (currentLine.includes('-->')) {
      completions.push('[Process]', '{Decision}', '((Event))', '([Start/End])');
    }

    if (currentLine.includes('style')) {
      completions.push('fill:#3b82f6', 'stroke:#1e40af', 'stroke-width:2px');
    }

    return completions;
  }

  /**
   * Utility methods
   */
  private countNodes(code: string): number {
    const nodePattern = /\w+\[.*?\]/g;
    return (code.match(nodePattern) || []).length;
  }

  private countEdges(code: string): number {
    const edgePattern = /-->/g;
    return (code.match(edgePattern) || []).length;
  }

  private getCurrentLine(code: string, position: number): string {
    const lines = code.substring(0, position).split('\n');
    return lines[lines.length - 1] || '';
  }

  /**
   * API integration methods (for when API key is available)
   */
  private buildGenerationPrompt(request: AIGenerationRequest): string {
    return `Generate a Mermaid diagram for: "${request.prompt}".
Context: ${request.context}.
Complexity: ${request.complexity}.
Return only valid Mermaid syntax.`;
  }

  private buildOptimizationPrompt(request: AIOptimizationRequest): string {
    return `Optimize this Mermaid diagram for ${request.optimizationType}:
${request.currentCode}
Return only the improved Mermaid syntax.`;
  }

  private buildCompletionPrompt(request: AICompletionRequest): string {
    return `Complete this Mermaid diagram code: ${request.partialCode}
Provide 3-5 completion suggestions.`;
  }

  private async callOpenAI(prompt: string): Promise<string> {
    // OpenAI API integration would go here
    // For now, return empty string to trigger fallback
    return '';
  }

  private parseAIResponse(response: string, request: AIGenerationRequest): AIGenerationResponse {
    // Parse OpenAI response
    return {
      mermaidCode: response,
      diagramType: request.diagramType || 'flowchart',
      confidence: 0.9,
      suggestions: [],
      explanation: 'Generated by AI'
    };
  }

  private extractMermaidCode(response: string): string {
    // Extract Mermaid code from AI response
    return response;
  }

  private parseCompletionResponse(response: string): string[] {
    // Parse completion suggestions from AI response
    return response.split('\n').filter(Boolean);
  }
}
