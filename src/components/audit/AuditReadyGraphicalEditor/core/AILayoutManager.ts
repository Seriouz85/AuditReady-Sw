import * as fabric from 'fabric';

export interface LayoutSuggestion {
  id: string;
  type: 'alignment' | 'spacing' | 'grouping' | 'hierarchy' | 'flow' | 'balance';
  title: string;
  description: string;
  confidence: number; // 0-1
  preview?: string; // Base64 image
  objects: fabric.Object[];
  changes: LayoutChange[];
  reasoning: string;
}

export interface LayoutChange {
  objectId: string;
  property: string;
  currentValue: any;
  suggestedValue: any;
  reason: string;
}

export interface LayoutAnalysis {
  score: number; // 0-100
  issues: LayoutIssue[];
  strengths: string[];
  suggestions: LayoutSuggestion[];
  metrics: LayoutMetrics;
}

export interface LayoutIssue {
  type: 'alignment' | 'spacing' | 'overlap' | 'hierarchy' | 'balance' | 'accessibility';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedObjects: string[];
  suggestion?: string;
}

export interface LayoutMetrics {
  alignmentScore: number;
  spacingConsistency: number;
  visualBalance: number;
  hierarchyClarity: number;
  readability: number;
  accessibility: number;
}

export class AILayoutManager {
  private canvas: fabric.Canvas;
  private isEnabled: boolean = true;
  private analysisCache: Map<string, LayoutAnalysis> = new Map();
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.canvas.on('object:modified', this.handleLayoutChange.bind(this));
    this.canvas.on('object:added', this.handleLayoutChange.bind(this));
    this.canvas.on('object:removed', this.handleLayoutChange.bind(this));
  }

  private handleLayoutChange(): void {
    if (!this.isEnabled) return;
    
    // Debounce analysis
    setTimeout(() => {
      this.analyzeLayout();
    }, 1000);
  }

  public async analyzeLayout(): Promise<LayoutAnalysis> {
    const objects = this.canvas.getObjects().filter(obj => 
      !obj.isConnectionPoint && !obj.isConnector
    );

    if (objects.length === 0) {
      return this.createEmptyAnalysis();
    }

    const cacheKey = this.generateCacheKey(objects);
    const cached = this.analysisCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const analysis = await this.performLayoutAnalysis(objects);
    this.analysisCache.set(cacheKey, analysis);
    this.emit('analysis:completed', analysis);

    return analysis;
  }

  private async performLayoutAnalysis(objects: fabric.Object[]): Promise<LayoutAnalysis> {
    const metrics = this.calculateLayoutMetrics(objects);
    const issues = this.detectLayoutIssues(objects);
    const suggestions = await this.generateLayoutSuggestions(objects, issues);
    const strengths = this.identifyLayoutStrengths(objects, metrics);
    const score = this.calculateOverallScore(metrics, issues);

    return {
      score,
      issues,
      strengths,
      suggestions,
      metrics
    };
  }

  private calculateLayoutMetrics(objects: fabric.Object[]): LayoutMetrics {
    return {
      alignmentScore: this.calculateAlignmentScore(objects),
      spacingConsistency: this.calculateSpacingConsistency(objects),
      visualBalance: this.calculateVisualBalance(objects),
      hierarchyClarity: this.calculateHierarchyClarity(objects),
      readability: this.calculateReadability(objects),
      accessibility: this.calculateAccessibility(objects)
    };
  }

  private calculateAlignmentScore(objects: fabric.Object[]): number {
    if (objects.length < 2) return 100;

    let alignedPairs = 0;
    let totalPairs = 0;
    const tolerance = 5;

    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        const obj1 = objects[i];
        const obj2 = objects[j];
        const bounds1 = obj1.getBoundingRect();
        const bounds2 = obj2.getBoundingRect();

        totalPairs++;

        // Check horizontal alignment
        if (Math.abs(bounds1.left - bounds2.left) <= tolerance ||
            Math.abs(bounds1.left + bounds1.width - bounds2.left - bounds2.width) <= tolerance ||
            Math.abs(bounds1.left + bounds1.width/2 - bounds2.left - bounds2.width/2) <= tolerance) {
          alignedPairs++;
        }
        // Check vertical alignment
        else if (Math.abs(bounds1.top - bounds2.top) <= tolerance ||
                 Math.abs(bounds1.top + bounds1.height - bounds2.top - bounds2.height) <= tolerance ||
                 Math.abs(bounds1.top + bounds1.height/2 - bounds2.top - bounds2.height/2) <= tolerance) {
          alignedPairs++;
        }
      }
    }

    return totalPairs > 0 ? (alignedPairs / totalPairs) * 100 : 100;
  }

  private calculateSpacingConsistency(objects: fabric.Object[]): number {
    if (objects.length < 3) return 100;

    const spacings: number[] = [];
    const sortedObjects = objects.sort((a, b) => (a.left || 0) - (b.left || 0));

    for (let i = 0; i < sortedObjects.length - 1; i++) {
      const obj1 = sortedObjects[i];
      const obj2 = sortedObjects[i + 1];
      const bounds1 = obj1.getBoundingRect();
      const bounds2 = obj2.getBoundingRect();
      const spacing = bounds2.left - (bounds1.left + bounds1.width);
      if (spacing > 0) {
        spacings.push(spacing);
      }
    }

    if (spacings.length === 0) return 100;

    const avgSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;
    const variance = spacings.reduce((acc, spacing) => acc + Math.pow(spacing - avgSpacing, 2), 0) / spacings.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower standard deviation = higher consistency
    return Math.max(0, 100 - (standardDeviation / avgSpacing) * 100);
  }

  private calculateVisualBalance(objects: fabric.Object[]): number {
    if (objects.length === 0) return 100;

    const canvasCenter = {
      x: (this.canvas.width || 800) / 2,
      y: (this.canvas.height || 600) / 2
    };

    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;

    objects.forEach(obj => {
      const bounds = obj.getBoundingRect();
      const weight = bounds.width * bounds.height; // Visual weight
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;

      totalWeight += weight;
      weightedX += centerX * weight;
      weightedY += centerY * weight;
    });

    const visualCenter = {
      x: weightedX / totalWeight,
      y: weightedY / totalWeight
    };

    const distance = Math.sqrt(
      Math.pow(visualCenter.x - canvasCenter.x, 2) + 
      Math.pow(visualCenter.y - canvasCenter.y, 2)
    );

    const maxDistance = Math.sqrt(
      Math.pow(canvasCenter.x, 2) + Math.pow(canvasCenter.y, 2)
    );

    return Math.max(0, 100 - (distance / maxDistance) * 100);
  }

  private calculateHierarchyClarity(objects: fabric.Object[]): number {
    const textObjects = objects.filter(obj => obj.type === 'i-text' || obj.type === 'text');
    if (textObjects.length === 0) return 100;

    const fontSizes = textObjects.map(obj => (obj as fabric.IText).fontSize || 12);
    const uniqueSizes = [...new Set(fontSizes)].sort((a, b) => b - a);

    // Good hierarchy has 2-4 distinct font sizes
    if (uniqueSizes.length >= 2 && uniqueSizes.length <= 4) {
      return 100;
    } else if (uniqueSizes.length === 1) {
      return 60; // All same size = poor hierarchy
    } else {
      return Math.max(40, 100 - (uniqueSizes.length - 4) * 10); // Too many sizes
    }
  }

  private calculateReadability(objects: fabric.Object[]): number {
    const textObjects = objects.filter(obj => obj.type === 'i-text' || obj.type === 'text');
    if (textObjects.length === 0) return 100;

    let readabilityScore = 0;
    let totalTexts = 0;

    textObjects.forEach(obj => {
      const textObj = obj as fabric.IText;
      const fontSize = textObj.fontSize || 12;
      const text = textObj.text || '';
      
      totalTexts++;
      let score = 100;

      // Font size check
      if (fontSize < 10) score -= 30;
      else if (fontSize < 12) score -= 15;

      // Text length check
      if (text.length > 100) score -= 20;
      else if (text.length > 50) score -= 10;

      // Color contrast (simplified)
      const fill = textObj.fill as string;
      if (fill && (fill === '#ffffff' || fill === '#000000')) {
        score += 10; // Bonus for high contrast
      }

      readabilityScore += Math.max(0, score);
    });

    return totalTexts > 0 ? readabilityScore / totalTexts : 100;
  }

  private calculateAccessibility(objects: fabric.Object[]): number {
    let score = 100;
    const textObjects = objects.filter(obj => obj.type === 'i-text' || obj.type === 'text');

    // Check minimum font sizes
    textObjects.forEach(obj => {
      const fontSize = (obj as fabric.IText).fontSize || 12;
      if (fontSize < 12) score -= 10;
    });

    // Check color contrast (simplified)
    objects.forEach(obj => {
      if (obj.fill === obj.stroke && obj.fill !== 'transparent') {
        score -= 15; // Poor contrast
      }
    });

    return Math.max(0, score);
  }

  private detectLayoutIssues(objects: fabric.Object[]): LayoutIssue[] {
    const issues: LayoutIssue[] = [];

    // Detect overlapping objects
    const overlaps = this.detectOverlaps(objects);
    if (overlaps.length > 0) {
      issues.push({
        type: 'overlap',
        severity: 'high',
        description: `${overlaps.length} objects are overlapping`,
        affectedObjects: overlaps.flat(),
        suggestion: 'Adjust object positions to eliminate overlaps'
      });
    }

    // Detect poor alignment
    const alignmentScore = this.calculateAlignmentScore(objects);
    if (alignmentScore < 60) {
      issues.push({
        type: 'alignment',
        severity: 'medium',
        description: 'Objects are poorly aligned',
        affectedObjects: objects.map(obj => obj.id || ''),
        suggestion: 'Use alignment tools to improve object positioning'
      });
    }

    // Detect inconsistent spacing
    const spacingScore = this.calculateSpacingConsistency(objects);
    if (spacingScore < 70) {
      issues.push({
        type: 'spacing',
        severity: 'medium',
        description: 'Inconsistent spacing between objects',
        affectedObjects: objects.map(obj => obj.id || ''),
        suggestion: 'Standardize spacing between related objects'
      });
    }

    return issues;
  }

  private detectOverlaps(objects: fabric.Object[]): string[][] {
    const overlaps: string[][] = [];

    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        const obj1 = objects[i];
        const obj2 = objects[j];
        
        if (this.objectsOverlap(obj1, obj2)) {
          overlaps.push([obj1.id || '', obj2.id || '']);
        }
      }
    }

    return overlaps;
  }

  private objectsOverlap(obj1: fabric.Object, obj2: fabric.Object): boolean {
    const bounds1 = obj1.getBoundingRect();
    const bounds2 = obj2.getBoundingRect();

    return !(bounds1.left + bounds1.width <= bounds2.left ||
             bounds2.left + bounds2.width <= bounds1.left ||
             bounds1.top + bounds1.height <= bounds2.top ||
             bounds2.top + bounds2.height <= bounds1.top);
  }

  private async generateLayoutSuggestions(objects: fabric.Object[], issues: LayoutIssue[]): Promise<LayoutSuggestion[]> {
    const suggestions: LayoutSuggestion[] = [];

    // Generate alignment suggestions
    if (issues.some(issue => issue.type === 'alignment')) {
      suggestions.push(await this.generateAlignmentSuggestion(objects));
    }

    // Generate spacing suggestions
    if (issues.some(issue => issue.type === 'spacing')) {
      suggestions.push(await this.generateSpacingSuggestion(objects));
    }

    // Generate grouping suggestions
    const groupingSuggestion = await this.generateGroupingSuggestion(objects);
    if (groupingSuggestion) {
      suggestions.push(groupingSuggestion);
    }

    return suggestions.filter(Boolean);
  }

  private async generateAlignmentSuggestion(objects: fabric.Object[]): Promise<LayoutSuggestion> {
    const changes: LayoutChange[] = [];
    
    // Find objects that could be aligned
    const leftAligned = this.findAlignmentCandidates(objects, 'left');
    const centerAligned = this.findAlignmentCandidates(objects, 'center');
    
    const bestAlignment = leftAligned.length > centerAligned.length ? 'left' : 'center';
    const candidates = bestAlignment === 'left' ? leftAligned : centerAligned;

    if (candidates.length >= 2) {
      const targetPosition = this.calculateAlignmentTarget(candidates, bestAlignment);
      
      candidates.forEach(obj => {
        const currentPos = bestAlignment === 'left' ? obj.left : (obj.left || 0) + (obj.width || 0) / 2;
        changes.push({
          objectId: obj.id || '',
          property: 'left',
          currentValue: obj.left,
          suggestedValue: bestAlignment === 'left' ? targetPosition : targetPosition - (obj.width || 0) / 2,
          reason: `Align ${bestAlignment} with other objects`
        });
      });
    }

    return {
      id: `alignment_${Date.now()}`,
      type: 'alignment',
      title: `Align Objects ${bestAlignment}`,
      description: `Align ${candidates.length} objects to improve visual consistency`,
      confidence: 0.8,
      objects: candidates,
      changes,
      reasoning: `Objects appear to be intended for ${bestAlignment} alignment based on their current positions`
    };
  }

  private async generateSpacingSuggestion(objects: fabric.Object[]): Promise<LayoutSuggestion> {
    const changes: LayoutChange[] = [];
    const sortedObjects = objects.sort((a, b) => (a.left || 0) - (b.left || 0));
    
    // Calculate optimal spacing
    const totalWidth = sortedObjects.reduce((sum, obj) => sum + (obj.width || 0), 0);
    const canvasWidth = this.canvas.width || 800;
    const availableSpace = canvasWidth - totalWidth - 40; // 20px margin on each side
    const optimalSpacing = Math.max(20, availableSpace / (sortedObjects.length - 1));

    let currentX = 20; // Start margin
    sortedObjects.forEach(obj => {
      changes.push({
        objectId: obj.id || '',
        property: 'left',
        currentValue: obj.left,
        suggestedValue: currentX,
        reason: 'Standardize spacing between objects'
      });
      currentX += (obj.width || 0) + optimalSpacing;
    });

    return {
      id: `spacing_${Date.now()}`,
      type: 'spacing',
      title: 'Standardize Spacing',
      description: `Apply consistent ${Math.round(optimalSpacing)}px spacing between objects`,
      confidence: 0.75,
      objects: sortedObjects,
      changes,
      reasoning: 'Consistent spacing improves visual rhythm and readability'
    };
  }

  private async generateGroupingSuggestion(objects: fabric.Object[]): Promise<LayoutSuggestion | null> {
    // Find objects that are close together and could be grouped
    const groups = this.findGroupingCandidates(objects);
    
    if (groups.length === 0) return null;

    const largestGroup = groups.reduce((max, group) => group.length > max.length ? group : max);
    
    if (largestGroup.length < 3) return null;

    return {
      id: `grouping_${Date.now()}`,
      type: 'grouping',
      title: 'Group Related Objects',
      description: `Group ${largestGroup.length} related objects together`,
      confidence: 0.6,
      objects: largestGroup,
      changes: [],
      reasoning: 'Objects are positioned close together and appear to be related'
    };
  }

  private findAlignmentCandidates(objects: fabric.Object[], type: 'left' | 'center' | 'right'): fabric.Object[] {
    const tolerance = 10;
    const positions = new Map<number, fabric.Object[]>();

    objects.forEach(obj => {
      const bounds = obj.getBoundingRect();
      let position: number;
      
      switch (type) {
        case 'left':
          position = bounds.left;
          break;
        case 'center':
          position = bounds.left + bounds.width / 2;
          break;
        case 'right':
          position = bounds.left + bounds.width;
          break;
      }

      // Find existing position within tolerance
      let foundPosition = false;
      for (const [pos, objs] of positions.entries()) {
        if (Math.abs(pos - position) <= tolerance) {
          objs.push(obj);
          foundPosition = true;
          break;
        }
      }

      if (!foundPosition) {
        positions.set(position, [obj]);
      }
    });

    // Return the largest group
    let largestGroup: fabric.Object[] = [];
    for (const group of positions.values()) {
      if (group.length > largestGroup.length) {
        largestGroup = group;
      }
    }

    return largestGroup.length >= 2 ? largestGroup : [];
  }

  private calculateAlignmentTarget(objects: fabric.Object[], type: 'left' | 'center' | 'right'): number {
    const positions = objects.map(obj => {
      const bounds = obj.getBoundingRect();
      switch (type) {
        case 'left':
          return bounds.left;
        case 'center':
          return bounds.left + bounds.width / 2;
        case 'right':
          return bounds.left + bounds.width;
      }
    });

    return positions.reduce((sum, pos) => sum + pos, 0) / positions.length;
  }

  private findGroupingCandidates(objects: fabric.Object[]): fabric.Object[][] {
    const groups: fabric.Object[][] = [];
    const visited = new Set<fabric.Object>();
    const proximityThreshold = 50;

    objects.forEach(obj => {
      if (visited.has(obj)) return;

      const group = [obj];
      visited.add(obj);
      const objBounds = obj.getBoundingRect();

      objects.forEach(other => {
        if (visited.has(other) || other === obj) return;

        const otherBounds = other.getBoundingRect();
        const distance = Math.sqrt(
          Math.pow(objBounds.left - otherBounds.left, 2) +
          Math.pow(objBounds.top - otherBounds.top, 2)
        );

        if (distance <= proximityThreshold) {
          group.push(other);
          visited.add(other);
        }
      });

      if (group.length >= 2) {
        groups.push(group);
      }
    });

    return groups;
  }

  private identifyLayoutStrengths(objects: fabric.Object[], metrics: LayoutMetrics): string[] {
    const strengths: string[] = [];

    if (metrics.alignmentScore >= 80) {
      strengths.push('Excellent object alignment');
    }
    if (metrics.spacingConsistency >= 80) {
      strengths.push('Consistent spacing throughout');
    }
    if (metrics.visualBalance >= 80) {
      strengths.push('Well-balanced composition');
    }
    if (metrics.hierarchyClarity >= 80) {
      strengths.push('Clear visual hierarchy');
    }
    if (metrics.readability >= 80) {
      strengths.push('Good text readability');
    }
    if (metrics.accessibility >= 80) {
      strengths.push('Accessible design choices');
    }

    return strengths;
  }

  private calculateOverallScore(metrics: LayoutMetrics, issues: LayoutIssue[]): number {
    const avgMetrics = Object.values(metrics).reduce((sum, val) => sum + val, 0) / Object.keys(metrics).length;
    
    // Deduct points for issues
    let deduction = 0;
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'high':
          deduction += 15;
          break;
        case 'medium':
          deduction += 10;
          break;
        case 'low':
          deduction += 5;
          break;
      }
    });

    return Math.max(0, Math.min(100, avgMetrics - deduction));
  }

  private createEmptyAnalysis(): LayoutAnalysis {
    return {
      score: 100,
      issues: [],
      strengths: ['Clean canvas ready for design'],
      suggestions: [],
      metrics: {
        alignmentScore: 100,
        spacingConsistency: 100,
        visualBalance: 100,
        hierarchyClarity: 100,
        readability: 100,
        accessibility: 100
      }
    };
  }

  private generateCacheKey(objects: fabric.Object[]): string {
    return objects.map(obj => `${obj.id}-${obj.left}-${obj.top}-${obj.width}-${obj.height}`).join('|');
  }

  // Public methods
  public async applySuggestion(suggestion: LayoutSuggestion): Promise<void> {
    suggestion.changes.forEach(change => {
      const obj = this.canvas.getObjects().find(o => o.id === change.objectId);
      if (obj) {
        obj.set(change.property, change.suggestedValue);
        obj.setCoords();
      }
    });

    this.canvas.renderAll();
    this.emit('suggestion:applied', suggestion);
    console.log(`Applied suggestion: ${suggestion.title}`);
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.analysisCache.clear();
    }
    console.log(`AI Layout Analysis ${enabled ? 'enabled' : 'disabled'}`);
  }

  public isAIEnabled(): boolean {
    return this.isEnabled;
  }

  public clearCache(): void {
    this.analysisCache.clear();
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
    this.canvas.off('object:modified', this.handleLayoutChange);
    this.canvas.off('object:added', this.handleLayoutChange);
    this.canvas.off('object:removed', this.handleLayoutChange);
    
    this.analysisCache.clear();
    this.eventHandlers.clear();
  }
}

// Singleton instance
let aiLayoutManagerInstance: AILayoutManager | null = null;

export const getAILayoutManager = (canvas?: fabric.Canvas): AILayoutManager | null => {
  if (canvas && !aiLayoutManagerInstance) {
    aiLayoutManagerInstance = new AILayoutManager(canvas);
  }
  return aiLayoutManagerInstance;
};

export const cleanupAILayoutManager = (): void => {
  if (aiLayoutManagerInstance) {
    aiLayoutManagerInstance.cleanup();
    aiLayoutManagerInstance = null;
  }
};
