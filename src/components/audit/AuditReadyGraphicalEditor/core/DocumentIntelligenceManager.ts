import * as fabric from 'fabric';

export interface DocumentAnalysis {
  id: string;
  timestamp: Date;
  documentType: 'audit-report' | 'risk-assessment' | 'compliance-checklist' | 'process-flow' | 'dashboard' | 'unknown';
  confidence: number;
  structure: DocumentStructure;
  content: ContentAnalysis;
  quality: QualityMetrics;
  suggestions: DocumentSuggestion[];
  metadata: DocumentMetadata;
}

export interface DocumentStructure {
  hasHeader: boolean;
  hasFooter: boolean;
  sections: DocumentSection[];
  flowDirection: 'horizontal' | 'vertical' | 'mixed';
  layoutType: 'single-column' | 'multi-column' | 'grid' | 'free-form';
  hierarchy: HierarchyLevel[];
}

export interface DocumentSection {
  id: string;
  type: 'header' | 'title' | 'content' | 'table' | 'chart' | 'form' | 'signature' | 'footer';
  bounds: { x: number; y: number; width: number; height: number };
  objects: string[]; // Object IDs
  importance: number; // 0-1
}

export interface HierarchyLevel {
  level: number;
  elements: string[]; // Object IDs
  type: 'heading' | 'subheading' | 'content' | 'detail';
}

export interface ContentAnalysis {
  textContent: string;
  keywords: string[];
  entities: ExtractedEntity[];
  sentiment: 'positive' | 'neutral' | 'negative';
  language: string;
  readabilityScore: number;
  completeness: number; // 0-1
  auditTerms: AuditTerm[];
}

export interface ExtractedEntity {
  text: string;
  type: 'person' | 'organization' | 'date' | 'standard' | 'regulation' | 'risk' | 'control' | 'finding';
  confidence: number;
  position: { start: number; end: number };
}

export interface AuditTerm {
  term: string;
  category: 'control' | 'risk' | 'compliance' | 'finding' | 'recommendation';
  frequency: number;
  importance: number;
}

export interface QualityMetrics {
  overall: number; // 0-100
  consistency: number;
  completeness: number;
  clarity: number;
  professionalism: number;
  accessibility: number;
  issues: QualityIssue[];
}

export interface QualityIssue {
  type: 'formatting' | 'content' | 'structure' | 'accessibility' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: { objectId: string; bounds?: any };
  suggestion: string;
}

export interface DocumentSuggestion {
  id: string;
  type: 'structure' | 'content' | 'formatting' | 'template' | 'automation';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  action: SuggestionAction;
  impact: string;
}

export interface SuggestionAction {
  type: 'add' | 'modify' | 'remove' | 'reorganize' | 'apply-template';
  parameters: any;
  preview?: string;
}

export interface DocumentMetadata {
  objectCount: number;
  textObjectCount: number;
  imageCount: number;
  shapeCount: number;
  canvasSize: { width: number; height: number };
  colorPalette: string[];
  fontFamilies: string[];
  estimatedReadingTime: number; // minutes
}

export class DocumentIntelligenceManager {
  private canvas: fabric.Canvas;
  private analyses: Map<string, DocumentAnalysis> = new Map();
  private auditKeywords: string[] = [
    'audit', 'control', 'compliance', 'risk', 'assessment', 'review', 'finding',
    'recommendation', 'deficiency', 'weakness', 'strength', 'procedure', 'policy',
    'standard', 'framework', 'governance', 'internal', 'external', 'financial',
    'operational', 'IT', 'security', 'privacy', 'data', 'access', 'authorization'
  ];
  private complianceStandards: string[] = [
    'ISO 27001', 'ISO 9001', 'SOX', 'GDPR', 'HIPAA', 'PCI DSS', 'NIST',
    'COBIT', 'COSO', 'ITIL', 'SOC 1', 'SOC 2', 'FISMA', 'FedRAMP'
  ];
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.canvas.on('object:added', () => this.scheduleAnalysis());
    this.canvas.on('object:modified', () => this.scheduleAnalysis());
    this.canvas.on('object:removed', () => this.scheduleAnalysis());
    this.canvas.on('text:changed', () => this.scheduleAnalysis());
  }

  private scheduleAnalysis(): void {
    // Debounce analysis to avoid excessive computation
    clearTimeout((this as any).analysisTimeout);
    (this as any).analysisTimeout = setTimeout(() => {
      this.analyzeDocument();
    }, 2000);
  }

  public async analyzeDocument(): Promise<DocumentAnalysis> {
    const objects = this.canvas.getObjects().filter(obj => 
      !obj.isConnectionPoint && !obj.isConnector
    );

    const analysis: DocumentAnalysis = {
      id: `analysis_${Date.now()}`,
      timestamp: new Date(),
      documentType: 'unknown',
      confidence: 0,
      structure: await this.analyzeStructure(objects),
      content: await this.analyzeContent(objects),
      quality: await this.assessQuality(objects),
      suggestions: [],
      metadata: this.extractMetadata(objects)
    };

    // Determine document type
    analysis.documentType = this.determineDocumentType(analysis);
    analysis.confidence = this.calculateConfidence(analysis);

    // Generate suggestions
    analysis.suggestions = await this.generateSuggestions(analysis);

    this.analyses.set(analysis.id, analysis);
    this.emit('analysis:completed', analysis);

    console.log('Document analysis completed:', analysis);
    return analysis;
  }

  private async analyzeStructure(objects: fabric.Object[]): Promise<DocumentStructure> {
    const textObjects = objects.filter(obj => obj.type === 'i-text' || obj.type === 'text');
    const sections = this.identifySections(objects);
    const hierarchy = this.analyzeHierarchy(textObjects);

    return {
      hasHeader: this.hasHeader(objects),
      hasFooter: this.hasFooter(objects),
      sections,
      flowDirection: this.determineFlowDirection(objects),
      layoutType: this.determineLayoutType(objects),
      hierarchy
    };
  }

  private identifySections(objects: fabric.Object[]): DocumentSection[] {
    const sections: DocumentSection[] = [];
    const canvasHeight = this.canvas.height || 600;

    // Simple section identification based on Y position
    const topSection = objects.filter(obj => (obj.top || 0) < canvasHeight * 0.2);
    const middleSection = objects.filter(obj => {
      const top = obj.top || 0;
      return top >= canvasHeight * 0.2 && top < canvasHeight * 0.8;
    });
    const bottomSection = objects.filter(obj => (obj.top || 0) >= canvasHeight * 0.8);

    if (topSection.length > 0) {
      sections.push({
        id: 'header',
        type: 'header',
        bounds: this.calculateSectionBounds(topSection),
        objects: topSection.map(obj => obj.id || ''),
        importance: 0.9
      });
    }

    if (middleSection.length > 0) {
      sections.push({
        id: 'content',
        type: 'content',
        bounds: this.calculateSectionBounds(middleSection),
        objects: middleSection.map(obj => obj.id || ''),
        importance: 1.0
      });
    }

    if (bottomSection.length > 0) {
      sections.push({
        id: 'footer',
        type: 'footer',
        bounds: this.calculateSectionBounds(bottomSection),
        objects: bottomSection.map(obj => obj.id || ''),
        importance: 0.6
      });
    }

    return sections;
  }

  private calculateSectionBounds(objects: fabric.Object[]): { x: number; y: number; width: number; height: number } {
    if (objects.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

    const bounds = objects.map(obj => obj.getBoundingRect());
    const minX = Math.min(...bounds.map(b => b.left));
    const minY = Math.min(...bounds.map(b => b.top));
    const maxX = Math.max(...bounds.map(b => b.left + b.width));
    const maxY = Math.max(...bounds.map(b => b.top + b.height));

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  private analyzeHierarchy(textObjects: fabric.Object[]): HierarchyLevel[] {
    const levels: HierarchyLevel[] = [];
    
    // Group by font size (simple hierarchy detection)
    const fontSizeGroups = new Map<number, fabric.Object[]>();
    
    textObjects.forEach(obj => {
      const fontSize = (obj as fabric.IText).fontSize || 14;
      if (!fontSizeGroups.has(fontSize)) {
        fontSizeGroups.set(fontSize, []);
      }
      fontSizeGroups.get(fontSize)!.push(obj);
    });

    // Sort by font size (largest first)
    const sortedSizes = Array.from(fontSizeGroups.keys()).sort((a, b) => b - a);
    
    sortedSizes.forEach((fontSize, index) => {
      const objects = fontSizeGroups.get(fontSize)!;
      levels.push({
        level: index + 1,
        elements: objects.map(obj => obj.id || ''),
        type: index === 0 ? 'heading' : index === 1 ? 'subheading' : 'content'
      });
    });

    return levels;
  }

  private hasHeader(objects: fabric.Object[]): boolean {
    const canvasHeight = this.canvas.height || 600;
    const topObjects = objects.filter(obj => (obj.top || 0) < canvasHeight * 0.15);
    return topObjects.length > 0;
  }

  private hasFooter(objects: fabric.Object[]): boolean {
    const canvasHeight = this.canvas.height || 600;
    const bottomObjects = objects.filter(obj => (obj.top || 0) > canvasHeight * 0.85);
    return bottomObjects.length > 0;
  }

  private determineFlowDirection(objects: fabric.Object[]): 'horizontal' | 'vertical' | 'mixed' {
    if (objects.length < 2) return 'vertical';

    const bounds = objects.map(obj => obj.getBoundingRect());
    const horizontalSpread = Math.max(...bounds.map(b => b.left + b.width)) - Math.min(...bounds.map(b => b.left));
    const verticalSpread = Math.max(...bounds.map(b => b.top + b.height)) - Math.min(...bounds.map(b => b.top));

    if (horizontalSpread > verticalSpread * 1.5) return 'horizontal';
    if (verticalSpread > horizontalSpread * 1.5) return 'vertical';
    return 'mixed';
  }

  private determineLayoutType(objects: fabric.Object[]): DocumentStructure['layoutType'] {
    const bounds = objects.map(obj => obj.getBoundingRect());
    
    // Simple heuristic based on alignment
    const leftAligned = bounds.filter(b => Math.abs(b.left - bounds[0].left) < 20).length;
    const alignmentRatio = leftAligned / bounds.length;

    if (alignmentRatio > 0.8) return 'single-column';
    if (alignmentRatio > 0.4) return 'multi-column';
    return 'free-form';
  }

  private async analyzeContent(objects: fabric.Object[]): Promise<ContentAnalysis> {
    const textObjects = objects.filter(obj => obj.type === 'i-text' || obj.type === 'text');
    const allText = textObjects.map(obj => (obj as fabric.IText).text || '').join(' ');

    const keywords = this.extractKeywords(allText);
    const entities = this.extractEntities(allText);
    const auditTerms = this.extractAuditTerms(allText);

    return {
      textContent: allText,
      keywords,
      entities,
      sentiment: this.analyzeSentiment(allText),
      language: 'en', // Simplified
      readabilityScore: this.calculateReadability(allText),
      completeness: this.assessCompleteness(allText, objects),
      auditTerms
    };
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const wordFreq = new Map<string, number>();
    
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  private extractEntities(text: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    
    // Extract compliance standards
    this.complianceStandards.forEach(standard => {
      const regex = new RegExp(standard, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        entities.push({
          text: match[0],
          type: 'standard',
          confidence: 0.9,
          position: { start: match.index, end: match.index + match[0].length }
        });
      }
    });

    // Extract dates (simple pattern)
    const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/g;
    let dateMatch;
    while ((dateMatch = dateRegex.exec(text)) !== null) {
      entities.push({
        text: dateMatch[0],
        type: 'date',
        confidence: 0.8,
        position: { start: dateMatch.index, end: dateMatch.index + dateMatch[0].length }
      });
    }

    return entities;
  }

  private extractAuditTerms(text: string): AuditTerm[] {
    const terms: AuditTerm[] = [];
    const lowerText = text.toLowerCase();

    this.auditKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        terms.push({
          term: keyword,
          category: this.categorizeAuditTerm(keyword),
          frequency: matches.length,
          importance: this.calculateTermImportance(keyword, matches.length)
        });
      }
    });

    return terms.sort((a, b) => b.importance - a.importance);
  }

  private categorizeAuditTerm(term: string): AuditTerm['category'] {
    const controlTerms = ['control', 'procedure', 'policy', 'governance'];
    const riskTerms = ['risk', 'weakness', 'deficiency', 'threat'];
    const complianceTerms = ['compliance', 'standard', 'framework', 'regulation'];
    const findingTerms = ['finding', 'observation', 'issue', 'exception'];

    if (controlTerms.includes(term)) return 'control';
    if (riskTerms.includes(term)) return 'risk';
    if (complianceTerms.includes(term)) return 'compliance';
    if (findingTerms.includes(term)) return 'finding';
    return 'recommendation';
  }

  private calculateTermImportance(term: string, frequency: number): number {
    const baseImportance = this.auditKeywords.indexOf(term) !== -1 ? 0.8 : 0.5;
    return Math.min(baseImportance + (frequency * 0.1), 1.0);
  }

  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['good', 'excellent', 'effective', 'strong', 'compliant', 'adequate', 'satisfactory'];
    const negativeWords = ['poor', 'weak', 'inadequate', 'non-compliant', 'deficient', 'unsatisfactory'];

    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private calculateReadability(text: string): number {
    // Simplified readability score (0-100)
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;
    
    // Flesch Reading Ease approximation
    const score = 206.835 - (1.015 * avgWordsPerSentence);
    return Math.max(0, Math.min(100, score));
  }

  private assessCompleteness(text: string, objects: fabric.Object[]): number {
    let score = 0;
    
    // Check for essential audit document elements
    if (text.includes('objective') || text.includes('purpose')) score += 0.2;
    if (text.includes('scope')) score += 0.2;
    if (text.includes('methodology') || text.includes('approach')) score += 0.2;
    if (text.includes('finding') || text.includes('observation')) score += 0.2;
    if (text.includes('recommendation') || text.includes('conclusion')) score += 0.2;

    return score;
  }

  private async assessQuality(objects: fabric.Object[]): Promise<QualityMetrics> {
    const issues: QualityIssue[] = [];
    
    // Check for consistency issues
    const fontFamilies = new Set<string>();
    const colors = new Set<string>();
    
    objects.forEach(obj => {
      if (obj.type === 'i-text' || obj.type === 'text') {
        const textObj = obj as fabric.IText;
        fontFamilies.add(textObj.fontFamily || 'Arial');
        colors.add(textObj.fill as string || '#000000');
      }
    });

    if (fontFamilies.size > 3) {
      issues.push({
        type: 'formatting',
        severity: 'medium',
        description: 'Too many different font families used',
        suggestion: 'Limit to 2-3 font families for better consistency'
      });
    }

    if (colors.size > 5) {
      issues.push({
        type: 'formatting',
        severity: 'low',
        description: 'Many different colors used',
        suggestion: 'Consider using a consistent color palette'
      });
    }

    const consistency = Math.max(0, 100 - (fontFamilies.size * 10) - (colors.size * 5));
    const completeness = this.assessCompleteness(
      objects.filter(obj => obj.type === 'i-text' || obj.type === 'text')
        .map(obj => (obj as fabric.IText).text || '').join(' '),
      objects
    ) * 100;

    return {
      overall: (consistency + completeness) / 2,
      consistency,
      completeness,
      clarity: 75, // Simplified
      professionalism: 80, // Simplified
      accessibility: 70, // Simplified
      issues
    };
  }

  private determineDocumentType(analysis: DocumentAnalysis): DocumentAnalysis['documentType'] {
    const { content, structure } = analysis;
    
    // Check for audit-specific terms
    const auditScore = content.auditTerms.filter(term => 
      ['audit', 'control', 'compliance'].includes(term.term)
    ).reduce((sum, term) => sum + term.importance, 0);

    // Check for risk-specific terms
    const riskScore = content.auditTerms.filter(term => 
      ['risk', 'threat', 'vulnerability'].includes(term.term)
    ).reduce((sum, term) => sum + term.importance, 0);

    // Check for process flow indicators
    const hasConnectors = this.canvas.getObjects().some(obj => (obj as any).isConnector);
    const hasFlowShapes = structure.sections.some(section => 
      section.type === 'content' && section.objects.length > 3
    );

    if (auditScore > 2) return 'audit-report';
    if (riskScore > 2) return 'risk-assessment';
    if (hasConnectors || hasFlowShapes) return 'process-flow';
    if (content.auditTerms.some(term => term.term === 'compliance')) return 'compliance-checklist';
    
    return 'unknown';
  }

  private calculateConfidence(analysis: DocumentAnalysis): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on recognized patterns
    if (analysis.content.auditTerms.length > 3) confidence += 0.2;
    if (analysis.structure.sections.length > 1) confidence += 0.1;
    if (analysis.content.entities.length > 0) confidence += 0.1;
    if (analysis.documentType !== 'unknown') confidence += 0.1;

    return Math.min(1.0, confidence);
  }

  private async generateSuggestions(analysis: DocumentAnalysis): Promise<DocumentSuggestion[]> {
    const suggestions: DocumentSuggestion[] = [];

    // Structure suggestions
    if (!analysis.structure.hasHeader) {
      suggestions.push({
        id: 'add_header',
        type: 'structure',
        priority: 'medium',
        title: 'Add Document Header',
        description: 'Consider adding a header with document title and date',
        action: { type: 'add', parameters: { type: 'header' } },
        impact: 'Improves document professionalism and navigation'
      });
    }

    // Content suggestions based on document type
    if (analysis.documentType === 'audit-report' && analysis.content.completeness < 0.8) {
      suggestions.push({
        id: 'complete_audit_sections',
        type: 'content',
        priority: 'high',
        title: 'Complete Audit Sections',
        description: 'Add missing audit report sections (scope, methodology, findings)',
        action: { type: 'add', parameters: { type: 'audit-sections' } },
        impact: 'Ensures comprehensive audit documentation'
      });
    }

    // Quality suggestions
    if (analysis.quality.consistency < 70) {
      suggestions.push({
        id: 'improve_consistency',
        type: 'formatting',
        priority: 'medium',
        title: 'Improve Visual Consistency',
        description: 'Standardize fonts, colors, and spacing throughout the document',
        action: { type: 'modify', parameters: { type: 'standardize-formatting' } },
        impact: 'Enhances document professionalism and readability'
      });
    }

    return suggestions;
  }

  private extractMetadata(objects: fabric.Object[]): DocumentMetadata {
    const textObjects = objects.filter(obj => obj.type === 'i-text' || obj.type === 'text');
    const imageObjects = objects.filter(obj => obj.type === 'image');
    const shapeObjects = objects.filter(obj => 
      ['rect', 'circle', 'triangle', 'polygon'].includes(obj.type || '')
    );

    const colors = new Set<string>();
    const fonts = new Set<string>();

    objects.forEach(obj => {
      if (obj.fill && typeof obj.fill === 'string') colors.add(obj.fill);
      if (obj.stroke && typeof obj.stroke === 'string') colors.add(obj.stroke);
      
      if (obj.type === 'i-text' || obj.type === 'text') {
        fonts.add((obj as fabric.IText).fontFamily || 'Arial');
      }
    });

    const totalText = textObjects.map(obj => (obj as fabric.IText).text || '').join(' ');
    const wordCount = totalText.split(/\s+/).length;
    const estimatedReadingTime = Math.ceil(wordCount / 200); // 200 words per minute

    return {
      objectCount: objects.length,
      textObjectCount: textObjects.length,
      imageCount: imageObjects.length,
      shapeCount: shapeObjects.length,
      canvasSize: {
        width: this.canvas.width || 800,
        height: this.canvas.height || 600
      },
      colorPalette: Array.from(colors),
      fontFamilies: Array.from(fonts),
      estimatedReadingTime
    };
  }

  // Public API
  public getLatestAnalysis(): DocumentAnalysis | null {
    const analyses = Array.from(this.analyses.values());
    return analyses.length > 0 ? analyses[analyses.length - 1] : null;
  }

  public getAllAnalyses(): DocumentAnalysis[] {
    return Array.from(this.analyses.values());
  }

  public async applySuggestion(suggestionId: string): Promise<void> {
    const analysis = this.getLatestAnalysis();
    if (!analysis) return;

    const suggestion = analysis.suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;

    // Apply the suggestion based on its action
    switch (suggestion.action.type) {
      case 'add':
        await this.applySuggestionAdd(suggestion.action.parameters);
        break;
      case 'modify':
        await this.applySuggestionModify(suggestion.action.parameters);
        break;
      // Add more action types as needed
    }

    this.emit('suggestion:applied', suggestion);
  }

  private async applySuggestionAdd(parameters: any): Promise<void> {
    // Implementation for adding suggested content
    console.log('Applying add suggestion:', parameters);
  }

  private async applySuggestionModify(parameters: any): Promise<void> {
    // Implementation for modifying content based on suggestion
    console.log('Applying modify suggestion:', parameters);
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
    clearTimeout((this as any).analysisTimeout);
    this.canvas.off('object:added');
    this.canvas.off('object:modified');
    this.canvas.off('object:removed');
    this.canvas.off('text:changed');
    
    this.analyses.clear();
    this.eventHandlers.clear();
  }
}

// Singleton instance
let documentIntelligenceManagerInstance: DocumentIntelligenceManager | null = null;

export const getDocumentIntelligenceManager = (canvas?: fabric.Canvas): DocumentIntelligenceManager | null => {
  if (canvas && !documentIntelligenceManagerInstance) {
    documentIntelligenceManagerInstance = new DocumentIntelligenceManager(canvas);
  }
  return documentIntelligenceManagerInstance;
};

export const cleanupDocumentIntelligenceManager = (): void => {
  if (documentIntelligenceManagerInstance) {
    documentIntelligenceManagerInstance.cleanup();
    documentIntelligenceManagerInstance = null;
  }
};
