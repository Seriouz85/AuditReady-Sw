import * as fabric from 'fabric';

export interface ContentSuggestion {
  id: string;
  type: 'text' | 'shape' | 'icon' | 'template' | 'color' | 'layout';
  title: string;
  description: string;
  confidence: number; // 0-1
  category: 'audit' | 'risk' | 'compliance' | 'process' | 'general';
  content: any;
  preview?: string;
  reasoning: string;
  context: string[];
}

export interface ContextAnalysis {
  domain: 'audit' | 'risk' | 'compliance' | 'process' | 'general';
  keywords: string[];
  entities: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  complexity: 'simple' | 'medium' | 'complex';
  purpose: 'documentation' | 'presentation' | 'analysis' | 'workflow';
}

export interface SmartTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  objects: any[];
  metadata: {
    useCase: string;
    industry: string;
    complexity: string;
    tags: string[];
  };
}

export class ContentSuggestionsManager {
  private canvas: fabric.Canvas;
  private isEnabled: boolean = true;
  private auditKeywords: string[] = [
    'audit', 'compliance', 'risk', 'control', 'assessment', 'review',
    'procedure', 'policy', 'standard', 'framework', 'governance',
    'internal', 'external', 'financial', 'operational', 'IT', 'security'
  ];
  private riskKeywords: string[] = [
    'risk', 'threat', 'vulnerability', 'impact', 'likelihood', 'mitigation',
    'assessment', 'matrix', 'register', 'appetite', 'tolerance', 'exposure'
  ];
  private complianceKeywords: string[] = [
    'compliance', 'regulation', 'law', 'requirement', 'standard', 'guideline',
    'SOX', 'GDPR', 'ISO', 'COSO', 'COBIT', 'NIST', 'PCI', 'HIPAA'
  ];
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.canvas.on('object:added', this.handleContentChange.bind(this));
    this.canvas.on('object:modified', this.handleContentChange.bind(this));
    this.canvas.on('text:changed', this.handleTextChange.bind(this));
  }

  private handleContentChange(): void {
    if (!this.isEnabled) return;
    
    // Debounce suggestions
    setTimeout(() => {
      this.generateSuggestions();
    }, 2000);
  }

  private handleTextChange(e: any): void {
    if (!this.isEnabled) return;
    
    const textObj = e.target;
    if (textObj && textObj.text) {
      this.analyzeTextContent(textObj.text);
    }
  }

  public async generateSuggestions(): Promise<ContentSuggestion[]> {
    const context = this.analyzeCanvasContext();
    const suggestions: ContentSuggestion[] = [];

    // Generate different types of suggestions based on context
    suggestions.push(...await this.generateTextSuggestions(context));
    suggestions.push(...await this.generateShapeSuggestions(context));
    suggestions.push(...await this.generateTemplateSuggestions(context));
    suggestions.push(...await this.generateColorSuggestions(context));
    suggestions.push(...await this.generateLayoutSuggestions(context));

    // Sort by confidence and relevance
    const sortedSuggestions = suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10); // Limit to top 10

    this.emit('suggestions:generated', sortedSuggestions);
    return sortedSuggestions;
  }

  private analyzeCanvasContext(): ContextAnalysis {
    const objects = this.canvas.getObjects().filter(obj => 
      !obj.isConnectionPoint && !obj.isConnector
    );

    const textObjects = objects.filter(obj => obj.type === 'i-text' || obj.type === 'text');
    const allText = textObjects.map(obj => (obj as fabric.IText).text || '').join(' ').toLowerCase();

    const keywords = this.extractKeywords(allText);
    const entities = this.extractEntities(allText);
    const domain = this.determineDomain(keywords);
    const sentiment = this.analyzeSentiment(allText);
    const complexity = this.determineComplexity(objects);
    const purpose = this.determinePurpose(allText, objects);

    return {
      domain,
      keywords,
      entities,
      sentiment,
      complexity,
      purpose
    };
  }

  private extractKeywords(text: string): string[] {
    const words = text.split(/\s+/).filter(word => word.length > 3);
    const allKeywords = [...this.auditKeywords, ...this.riskKeywords, ...this.complianceKeywords];
    
    return words.filter(word => 
      allKeywords.some(keyword => word.includes(keyword) || keyword.includes(word))
    );
  }

  private extractEntities(text: string): string[] {
    // Simple entity extraction - in a real implementation, use NLP library
    const entities: string[] = [];
    
    // Extract potential company names, standards, etc.
    const patterns = [
      /\b[A-Z]{2,10}\b/g, // Acronyms
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // Proper nouns
      /\b\d{4}\b/g // Years
    ];

    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        entities.push(...matches);
      }
    });

    return [...new Set(entities)];
  }

  private determineDomain(keywords: string[]): ContextAnalysis['domain'] {
    const auditScore = keywords.filter(k => this.auditKeywords.includes(k)).length;
    const riskScore = keywords.filter(k => this.riskKeywords.includes(k)).length;
    const complianceScore = keywords.filter(k => this.complianceKeywords.includes(k)).length;

    if (auditScore >= riskScore && auditScore >= complianceScore) return 'audit';
    if (riskScore >= complianceScore) return 'risk';
    if (complianceScore > 0) return 'compliance';
    
    return 'general';
  }

  private analyzeSentiment(text: string): ContextAnalysis['sentiment'] {
    const positiveWords = ['good', 'excellent', 'effective', 'strong', 'compliant', 'adequate'];
    const negativeWords = ['poor', 'weak', 'inadequate', 'non-compliant', 'risk', 'issue', 'deficiency'];

    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private determineComplexity(objects: fabric.Object[]): ContextAnalysis['complexity'] {
    if (objects.length < 5) return 'simple';
    if (objects.length < 15) return 'medium';
    return 'complex';
  }

  private determinePurpose(text: string, objects: fabric.Object[]): ContextAnalysis['purpose'] {
    const hasFlowElements = objects.some(obj => obj.type === 'line' || (obj as any).isConnector);
    const hasCharts = objects.some(obj => obj.type === 'circle' || obj.type === 'rect');
    
    if (hasFlowElements) return 'workflow';
    if (text.includes('report') || text.includes('summary')) return 'documentation';
    if (text.includes('present') || text.includes('meeting')) return 'presentation';
    if (hasCharts) return 'analysis';
    
    return 'documentation';
  }

  private async generateTextSuggestions(context: ContextAnalysis): Promise<ContentSuggestion[]> {
    const suggestions: ContentSuggestion[] = [];

    if (context.domain === 'audit') {
      suggestions.push({
        id: 'text_audit_1',
        type: 'text',
        title: 'Add Audit Objective',
        description: 'Include clear audit objectives for this section',
        confidence: 0.8,
        category: 'audit',
        content: 'Audit Objective: To evaluate the effectiveness of...',
        reasoning: 'Audit documents should clearly state objectives',
        context: ['audit', 'objective']
      });

      suggestions.push({
        id: 'text_audit_2',
        type: 'text',
        title: 'Add Risk Rating',
        description: 'Include risk assessment ratings',
        confidence: 0.7,
        category: 'audit',
        content: 'Risk Rating: [High/Medium/Low]',
        reasoning: 'Risk ratings provide quick assessment overview',
        context: ['risk', 'rating']
      });
    }

    if (context.domain === 'risk') {
      suggestions.push({
        id: 'text_risk_1',
        type: 'text',
        title: 'Add Impact Assessment',
        description: 'Include potential impact description',
        confidence: 0.8,
        category: 'risk',
        content: 'Impact: Financial/Operational/Reputational',
        reasoning: 'Risk assessments should quantify potential impact',
        context: ['impact', 'assessment']
      });
    }

    if (context.domain === 'compliance') {
      suggestions.push({
        id: 'text_compliance_1',
        type: 'text',
        title: 'Add Regulatory Reference',
        description: 'Reference applicable regulations or standards',
        confidence: 0.9,
        category: 'compliance',
        content: 'Regulatory Reference: [Standard/Regulation]',
        reasoning: 'Compliance documents should reference applicable standards',
        context: ['regulation', 'standard']
      });
    }

    return suggestions;
  }

  private async generateShapeSuggestions(context: ContextAnalysis): Promise<ContentSuggestion[]> {
    const suggestions: ContentSuggestion[] = [];
    const objects = this.canvas.getObjects();
    const hasShapes = objects.some(obj => obj.type === 'rect' || obj.type === 'circle');

    if (!hasShapes && context.purpose === 'workflow') {
      suggestions.push({
        id: 'shape_process_1',
        type: 'shape',
        title: 'Add Process Box',
        description: 'Add rectangular process step',
        confidence: 0.8,
        category: 'process',
        content: { type: 'rect', width: 120, height: 60, fill: '#e3f2fd' },
        reasoning: 'Workflow diagrams benefit from process boxes',
        context: ['process', 'workflow']
      });

      suggestions.push({
        id: 'shape_decision_1',
        type: 'shape',
        title: 'Add Decision Diamond',
        description: 'Add diamond shape for decision points',
        confidence: 0.7,
        category: 'process',
        content: { type: 'polygon', points: [60, 0, 120, 30, 60, 60, 0, 30], fill: '#fff3e0' },
        reasoning: 'Decision points are common in process flows',
        context: ['decision', 'workflow']
      });
    }

    if (context.domain === 'risk' && !hasShapes) {
      suggestions.push({
        id: 'shape_risk_matrix',
        type: 'shape',
        title: 'Add Risk Matrix Grid',
        description: 'Create a risk assessment matrix',
        confidence: 0.9,
        category: 'risk',
        content: { type: 'grid', rows: 3, cols: 3, cellSize: 40 },
        reasoning: 'Risk assessments often use matrix visualization',
        context: ['risk', 'matrix']
      });
    }

    return suggestions;
  }

  private async generateTemplateSuggestions(context: ContextAnalysis): Promise<ContentSuggestion[]> {
    const suggestions: ContentSuggestion[] = [];

    if (context.domain === 'audit' && context.complexity === 'simple') {
      suggestions.push({
        id: 'template_audit_checklist',
        type: 'template',
        title: 'Audit Checklist Template',
        description: 'Pre-built audit checklist layout',
        confidence: 0.8,
        category: 'audit',
        content: this.getAuditChecklistTemplate(),
        reasoning: 'Simple audit contexts benefit from structured checklists',
        context: ['audit', 'checklist']
      });
    }

    if (context.domain === 'risk') {
      suggestions.push({
        id: 'template_risk_register',
        type: 'template',
        title: 'Risk Register Template',
        description: 'Standard risk register layout',
        confidence: 0.9,
        category: 'risk',
        content: this.getRiskRegisterTemplate(),
        reasoning: 'Risk management requires structured documentation',
        context: ['risk', 'register']
      });
    }

    if (context.purpose === 'workflow') {
      suggestions.push({
        id: 'template_process_flow',
        type: 'template',
        title: 'Process Flow Template',
        description: 'Standard process flow diagram',
        confidence: 0.8,
        category: 'process',
        content: this.getProcessFlowTemplate(),
        reasoning: 'Workflow purposes benefit from process templates',
        context: ['process', 'workflow']
      });
    }

    return suggestions;
  }

  private async generateColorSuggestions(context: ContextAnalysis): Promise<ContentSuggestion[]> {
    const suggestions: ContentSuggestion[] = [];
    const objects = this.canvas.getObjects();
    const colors = new Set<string>();
    
    objects.forEach(obj => {
      if (obj.fill && typeof obj.fill === 'string') colors.add(obj.fill);
      if (obj.stroke && typeof obj.stroke === 'string') colors.add(obj.stroke);
    });

    if (colors.size > 6) {
      suggestions.push({
        id: 'color_palette_1',
        type: 'color',
        title: 'Simplify Color Palette',
        description: 'Reduce to 4-5 main colors for better consistency',
        confidence: 0.7,
        category: 'general',
        content: this.getRecommendedPalette(context.domain),
        reasoning: 'Too many colors can reduce visual clarity',
        context: ['color', 'palette']
      });
    }

    if (context.domain === 'risk' && !Array.from(colors).some(c => c.includes('red'))) {
      suggestions.push({
        id: 'color_risk_1',
        type: 'color',
        title: 'Add Risk Color Coding',
        description: 'Use red/amber/green for risk levels',
        confidence: 0.8,
        category: 'risk',
        content: ['#f44336', '#ff9800', '#4caf50'], // Red, Amber, Green
        reasoning: 'Risk documents benefit from standard color coding',
        context: ['risk', 'color-coding']
      });
    }

    return suggestions;
  }

  private async generateLayoutSuggestions(context: ContextAnalysis): Promise<ContentSuggestion[]> {
    const suggestions: ContentSuggestion[] = [];
    const objects = this.canvas.getObjects().filter(obj => 
      !obj.isConnectionPoint && !obj.isConnector
    );

    if (objects.length > 5) {
      const bounds = objects.map(obj => obj.getBoundingRect());
      const isCluttered = this.detectClutteredLayout(bounds);

      if (isCluttered) {
        suggestions.push({
          id: 'layout_organize_1',
          type: 'layout',
          title: 'Organize Layout',
          description: 'Arrange objects in a cleaner grid layout',
          confidence: 0.7,
          category: 'general',
          content: { type: 'grid', spacing: 20 },
          reasoning: 'Current layout appears cluttered',
          context: ['layout', 'organization']
        });
      }
    }

    if (context.purpose === 'presentation' && objects.length > 0) {
      suggestions.push({
        id: 'layout_presentation_1',
        type: 'layout',
        title: 'Presentation Layout',
        description: 'Optimize for presentation viewing',
        confidence: 0.8,
        category: 'general',
        content: { type: 'presentation', margins: 40 },
        reasoning: 'Presentation layouts need clear margins and hierarchy',
        context: ['presentation', 'layout']
      });
    }

    return suggestions;
  }

  private detectClutteredLayout(bounds: any[]): boolean {
    // Simple cluttering detection based on overlap and spacing
    let overlapCount = 0;
    
    for (let i = 0; i < bounds.length; i++) {
      for (let j = i + 1; j < bounds.length; j++) {
        const b1 = bounds[i];
        const b2 = bounds[j];
        
        if (!(b1.left + b1.width <= b2.left ||
              b2.left + b2.width <= b1.left ||
              b1.top + b1.height <= b2.top ||
              b2.top + b2.height <= b1.top)) {
          overlapCount++;
        }
      }
    }

    return overlapCount > bounds.length * 0.2; // More than 20% overlap
  }

  // Template generators
  private getAuditChecklistTemplate(): any {
    return {
      objects: [
        { type: 'text', text: 'Audit Checklist', fontSize: 18, fontWeight: 'bold', left: 20, top: 20 },
        { type: 'rect', width: 15, height: 15, left: 20, top: 60, fill: 'white', stroke: 'black' },
        { type: 'text', text: 'Control 1: Description', fontSize: 12, left: 45, top: 60 },
        { type: 'rect', width: 15, height: 15, left: 20, top: 90, fill: 'white', stroke: 'black' },
        { type: 'text', text: 'Control 2: Description', fontSize: 12, left: 45, top: 90 }
      ]
    };
  }

  private getRiskRegisterTemplate(): any {
    return {
      objects: [
        { type: 'text', text: 'Risk Register', fontSize: 18, fontWeight: 'bold', left: 20, top: 20 },
        { type: 'rect', width: 100, height: 30, left: 20, top: 60, fill: '#e3f2fd', stroke: 'black' },
        { type: 'text', text: 'Risk ID', fontSize: 12, left: 25, top: 70 },
        { type: 'rect', width: 200, height: 30, left: 130, top: 60, fill: '#e3f2fd', stroke: 'black' },
        { type: 'text', text: 'Risk Description', fontSize: 12, left: 135, top: 70 }
      ]
    };
  }

  private getProcessFlowTemplate(): any {
    return {
      objects: [
        { type: 'rect', width: 100, height: 50, left: 50, top: 50, fill: '#e3f2fd', stroke: 'black' },
        { type: 'text', text: 'Start', fontSize: 12, left: 85, top: 70 },
        { type: 'rect', width: 100, height: 50, left: 200, top: 50, fill: '#fff3e0', stroke: 'black' },
        { type: 'text', text: 'Process', fontSize: 12, left: 230, top: 70 }
      ]
    };
  }

  private getRecommendedPalette(domain: ContextAnalysis['domain']): string[] {
    switch (domain) {
      case 'audit':
        return ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2'];
      case 'risk':
        return ['#d32f2f', '#ff9800', '#4caf50', '#2196f3', '#9e9e9e'];
      case 'compliance':
        return ['#3f51b5', '#009688', '#ff5722', '#795548', '#607d8b'];
      default:
        return ['#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#607d8b'];
    }
  }

  private analyzeTextContent(text: string): void {
    const context = this.extractKeywords(text.toLowerCase());
    if (context.length > 0) {
      this.emit('context:detected', { text, keywords: context });
    }
  }

  // Public methods
  public async applySuggestion(suggestion: ContentSuggestion): Promise<void> {
    switch (suggestion.type) {
      case 'text':
        await this.applyTextSuggestion(suggestion);
        break;
      case 'shape':
        await this.applyShapeSuggestion(suggestion);
        break;
      case 'template':
        await this.applyTemplateSuggestion(suggestion);
        break;
      case 'color':
        await this.applyColorSuggestion(suggestion);
        break;
      case 'layout':
        await this.applyLayoutSuggestion(suggestion);
        break;
    }

    this.emit('suggestion:applied', suggestion);
    console.log(`Applied suggestion: ${suggestion.title}`);
  }

  private async applyTextSuggestion(suggestion: ContentSuggestion): Promise<void> {
    const text = new fabric.IText(suggestion.content, {
      left: 100,
      top: 100,
      fontSize: 14,
      fill: '#333333'
    });
    this.canvas.add(text);
  }

  private async applyShapeSuggestion(suggestion: ContentSuggestion): Promise<void> {
    const config = suggestion.content;
    let shape: fabric.Object;

    switch (config.type) {
      case 'rect':
        shape = new fabric.Rect({
          left: 100,
          top: 100,
          width: config.width,
          height: config.height,
          fill: config.fill
        });
        break;
      case 'circle':
        shape = new fabric.Circle({
          left: 100,
          top: 100,
          radius: config.radius,
          fill: config.fill
        });
        break;
      default:
        return;
    }

    this.canvas.add(shape);
  }

  private async applyTemplateSuggestion(suggestion: ContentSuggestion): Promise<void> {
    const template = suggestion.content;
    // This would load a full template - simplified for now
    console.log('Template application not fully implemented');
  }

  private async applyColorSuggestion(suggestion: ContentSuggestion): Promise<void> {
    const colors = suggestion.content as string[];
    const objects = this.canvas.getObjects();
    
    objects.forEach((obj, index) => {
      if (obj.fill && typeof obj.fill === 'string') {
        obj.set('fill', colors[index % colors.length]);
      }
    });
    
    this.canvas.renderAll();
  }

  private async applyLayoutSuggestion(suggestion: ContentSuggestion): Promise<void> {
    // Layout application would be more complex - simplified for now
    console.log('Layout suggestion application not fully implemented');
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`Content Suggestions ${enabled ? 'enabled' : 'disabled'}`);
  }

  public isContentSuggestionsEnabled(): boolean {
    return this.isEnabled;
  }

  // Event system
  public on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  public off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  public cleanup(): void {
    this.canvas.off('object:added', this.handleContentChange);
    this.canvas.off('object:modified', this.handleContentChange);
    this.canvas.off('text:changed', this.handleTextChange);
    
    this.eventHandlers.clear();
  }
}

// Singleton instance
let contentSuggestionsManagerInstance: ContentSuggestionsManager | null = null;

export const getContentSuggestionsManager = (canvas?: fabric.Canvas): ContentSuggestionsManager | null => {
  if (canvas && !contentSuggestionsManagerInstance) {
    contentSuggestionsManagerInstance = new ContentSuggestionsManager(canvas);
  }
  return contentSuggestionsManagerInstance;
};

export const cleanupContentSuggestionsManager = (): void => {
  if (contentSuggestionsManagerInstance) {
    contentSuggestionsManagerInstance.cleanup();
    contentSuggestionsManagerInstance = null;
  }
};
