import * as fabric from 'fabric';

export interface SearchFilter {
  type?: string[];
  text?: string;
  color?: string[];
  size?: { min?: number; max?: number };
  position?: { x?: number; y?: number; radius?: number };
  visible?: boolean;
  locked?: boolean;
  hasStroke?: boolean;
  hasFill?: boolean;
  opacity?: { min?: number; max?: number };
  rotation?: { min?: number; max?: number };
}

export interface SearchResult {
  object: fabric.Object;
  score: number;
  matches: string[];
  highlights: { property: string; value: any }[];
}

export class SearchManager {
  private canvas: fabric.Canvas;
  private searchHistory: string[] = [];
  private maxHistorySize: number = 20;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
  }

  public search(query: string, filters?: SearchFilter): SearchResult[] {
    if (!query.trim() && !filters) return [];

    this.addToHistory(query);
    const objects = this.canvas.getObjects().filter(obj => 
      !obj.isConnectionPoint && !obj.isConnector
    );

    const results: SearchResult[] = [];

    objects.forEach(obj => {
      const result = this.evaluateObject(obj, query, filters);
      if (result.score > 0) {
        results.push(result);
      }
    });

    // Sort by relevance score
    return results.sort((a, b) => b.score - a.score);
  }

  private evaluateObject(obj: fabric.Object, query: string, filters?: SearchFilter): SearchResult {
    let score = 0;
    const matches: string[] = [];
    const highlights: { property: string; value: any }[] = [];

    // Text search
    if (query.trim()) {
      const textScore = this.searchText(obj, query.toLowerCase());
      score += textScore.score;
      matches.push(...textScore.matches);
      highlights.push(...textScore.highlights);
    }

    // Filter evaluation
    if (filters) {
      const filterScore = this.evaluateFilters(obj, filters);
      if (filterScore.score === 0 && filters) {
        return { object: obj, score: 0, matches: [], highlights: [] };
      }
      score += filterScore.score;
      matches.push(...filterScore.matches);
      highlights.push(...filterScore.highlights);
    }

    return { object: obj, score, matches, highlights };
  }

  private searchText(obj: fabric.Object, query: string): { score: number; matches: string[]; highlights: any[] } {
    let score = 0;
    const matches: string[] = [];
    const highlights: any[] = [];

    // Search in text content
    if (obj.type === 'i-text' || obj.type === 'text') {
      const text = (obj as fabric.IText).text?.toLowerCase() || '';
      if (text.includes(query)) {
        score += 10;
        matches.push('text content');
        highlights.push({ property: 'text', value: (obj as fabric.IText).text });
      }
    }

    // Search in object type
    if (obj.type?.toLowerCase().includes(query)) {
      score += 5;
      matches.push('object type');
      highlights.push({ property: 'type', value: obj.type });
    }

    // Search in object ID
    if (obj.id?.toLowerCase().includes(query)) {
      score += 3;
      matches.push('object ID');
      highlights.push({ property: 'id', value: obj.id });
    }

    // Search in colors
    if (obj.fill && typeof obj.fill === 'string') {
      if (obj.fill.toLowerCase().includes(query)) {
        score += 2;
        matches.push('fill color');
        highlights.push({ property: 'fill', value: obj.fill });
      }
    }

    if (obj.stroke && typeof obj.stroke === 'string') {
      if (obj.stroke.toLowerCase().includes(query)) {
        score += 2;
        matches.push('stroke color');
        highlights.push({ property: 'stroke', value: obj.stroke });
      }
    }

    return { score, matches, highlights };
  }

  private evaluateFilters(obj: fabric.Object, filters: SearchFilter): { score: number; matches: string[]; highlights: any[] } {
    let score = 0;
    const matches: string[] = [];
    const highlights: any[] = [];

    // Type filter
    if (filters.type && filters.type.length > 0) {
      if (filters.type.includes(obj.type || '')) {
        score += 5;
        matches.push('type match');
        highlights.push({ property: 'type', value: obj.type });
      } else {
        return { score: 0, matches: [], highlights: [] };
      }
    }

    // Visibility filter
    if (filters.visible !== undefined) {
      if ((obj.visible !== false) === filters.visible) {
        score += 2;
        matches.push('visibility match');
      } else {
        return { score: 0, matches: [], highlights: [] };
      }
    }

    // Lock filter
    if (filters.locked !== undefined) {
      if ((!obj.selectable) === filters.locked) {
        score += 2;
        matches.push('lock status match');
      } else {
        return { score: 0, matches: [], highlights: [] };
      }
    }

    // Color filters
    if (filters.color && filters.color.length > 0) {
      let colorMatch = false;
      if (obj.fill && typeof obj.fill === 'string' && filters.color.includes(obj.fill)) {
        colorMatch = true;
        highlights.push({ property: 'fill', value: obj.fill });
      }
      if (obj.stroke && typeof obj.stroke === 'string' && filters.color.includes(obj.stroke)) {
        colorMatch = true;
        highlights.push({ property: 'stroke', value: obj.stroke });
      }
      if (colorMatch) {
        score += 3;
        matches.push('color match');
      } else {
        return { score: 0, matches: [], highlights: [] };
      }
    }

    // Size filter
    if (filters.size) {
      const width = (obj.width || 0) * (obj.scaleX || 1);
      const height = (obj.height || 0) * (obj.scaleY || 1);
      const size = Math.max(width, height);

      if (filters.size.min !== undefined && size < filters.size.min) {
        return { score: 0, matches: [], highlights: [] };
      }
      if (filters.size.max !== undefined && size > filters.size.max) {
        return { score: 0, matches: [], highlights: [] };
      }
      if (filters.size.min !== undefined || filters.size.max !== undefined) {
        score += 2;
        matches.push('size match');
        highlights.push({ property: 'size', value: `${width.toFixed(0)}x${height.toFixed(0)}` });
      }
    }

    // Position filter
    if (filters.position) {
      const objX = obj.left || 0;
      const objY = obj.top || 0;

      if (filters.position.x !== undefined && filters.position.y !== undefined && filters.position.radius !== undefined) {
        const distance = Math.sqrt(
          Math.pow(objX - filters.position.x, 2) + Math.pow(objY - filters.position.y, 2)
        );
        if (distance <= filters.position.radius) {
          score += 3;
          matches.push('position match');
          highlights.push({ property: 'position', value: `${objX.toFixed(0)}, ${objY.toFixed(0)}` });
        } else {
          return { score: 0, matches: [], highlights: [] };
        }
      }
    }

    // Opacity filter
    if (filters.opacity) {
      const opacity = obj.opacity || 1;
      if (filters.opacity.min !== undefined && opacity < filters.opacity.min) {
        return { score: 0, matches: [], highlights: [] };
      }
      if (filters.opacity.max !== undefined && opacity > filters.opacity.max) {
        return { score: 0, matches: [], highlights: [] };
      }
      if (filters.opacity.min !== undefined || filters.opacity.max !== undefined) {
        score += 1;
        matches.push('opacity match');
        highlights.push({ property: 'opacity', value: `${Math.round(opacity * 100)}%` });
      }
    }

    // Rotation filter
    if (filters.rotation) {
      const rotation = obj.angle || 0;
      if (filters.rotation.min !== undefined && rotation < filters.rotation.min) {
        return { score: 0, matches: [], highlights: [] };
      }
      if (filters.rotation.max !== undefined && rotation > filters.rotation.max) {
        return { score: 0, matches: [], highlights: [] };
      }
      if (filters.rotation.min !== undefined || filters.rotation.max !== undefined) {
        score += 1;
        matches.push('rotation match');
        highlights.push({ property: 'rotation', value: `${rotation.toFixed(1)}°` });
      }
    }

    // Stroke/Fill filters
    if (filters.hasStroke !== undefined) {
      const hasStroke = !!(obj.stroke && obj.stroke !== 'transparent');
      if (hasStroke === filters.hasStroke) {
        score += 1;
        matches.push('stroke presence match');
      } else {
        return { score: 0, matches: [], highlights: [] };
      }
    }

    if (filters.hasFill !== undefined) {
      const hasFill = !!(obj.fill && obj.fill !== 'transparent');
      if (hasFill === filters.hasFill) {
        score += 1;
        matches.push('fill presence match');
      } else {
        return { score: 0, matches: [], highlights: [] };
      }
    }

    return { score, matches, highlights };
  }

  public selectSearchResults(results: SearchResult[]): void {
    if (results.length === 0) return;

    const objects = results.map(r => r.object);
    
    if (objects.length === 1) {
      this.canvas.setActiveObject(objects[0]);
    } else {
      const selection = new fabric.ActiveSelection(objects, {
        canvas: this.canvas
      });
      this.canvas.setActiveObject(selection);
    }

    this.canvas.renderAll();
  }

  public highlightSearchResults(results: SearchResult[], duration: number = 2000): void {
    const originalProperties = new Map();

    results.forEach(result => {
      const obj = result.object;
      
      // Store original properties
      originalProperties.set(obj, {
        stroke: obj.stroke,
        strokeWidth: obj.strokeWidth,
        shadow: obj.shadow
      });

      // Apply highlight
      obj.set({
        stroke: '#ff6b35',
        strokeWidth: 3,
        shadow: new fabric.Shadow({
          color: '#ff6b35',
          blur: 10,
          offsetX: 0,
          offsetY: 0
        })
      });
    });

    this.canvas.renderAll();

    // Remove highlight after duration
    setTimeout(() => {
      results.forEach(result => {
        const obj = result.object;
        const original = originalProperties.get(obj);
        if (original) {
          obj.set(original);
        }
      });
      this.canvas.renderAll();
    }, duration);
  }

  public getSearchSuggestions(query: string): string[] {
    const suggestions: Set<string> = new Set();

    // Add from search history
    this.searchHistory.forEach(term => {
      if (term.toLowerCase().includes(query.toLowerCase()) && term !== query) {
        suggestions.add(term);
      }
    });

    // Add object types
    const types = new Set(this.canvas.getObjects().map(obj => obj.type).filter(Boolean));
    types.forEach(type => {
      if (type!.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(type!);
      }
    });

    // Add common colors
    const colors = new Set<string>();
    this.canvas.getObjects().forEach(obj => {
      if (obj.fill && typeof obj.fill === 'string') colors.add(obj.fill);
      if (obj.stroke && typeof obj.stroke === 'string') colors.add(obj.stroke);
    });
    colors.forEach(color => {
      if (color.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(color);
      }
    });

    return Array.from(suggestions).slice(0, 10);
  }

  private addToHistory(query: string): void {
    if (!query.trim()) return;

    // Remove if already exists
    const index = this.searchHistory.indexOf(query);
    if (index > -1) {
      this.searchHistory.splice(index, 1);
    }

    // Add to beginning
    this.searchHistory.unshift(query);

    // Limit size
    if (this.searchHistory.length > this.maxHistorySize) {
      this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize);
    }
  }

  public getSearchHistory(): string[] {
    return [...this.searchHistory];
  }

  public clearSearchHistory(): void {
    this.searchHistory = [];
  }

  public getObjectStatistics(): {
    totalObjects: number;
    byType: Record<string, number>;
    byColor: Record<string, number>;
    visible: number;
    locked: number;
  } {
    const objects = this.canvas.getObjects().filter(obj => 
      !obj.isConnectionPoint && !obj.isConnector
    );

    const byType: Record<string, number> = {};
    const byColor: Record<string, number> = {};
    let visible = 0;
    let locked = 0;

    objects.forEach(obj => {
      // Count by type
      const type = obj.type || 'unknown';
      byType[type] = (byType[type] || 0) + 1;

      // Count by color
      if (obj.fill && typeof obj.fill === 'string') {
        byColor[obj.fill] = (byColor[obj.fill] || 0) + 1;
      }

      // Count visibility and lock status
      if (obj.visible !== false) visible++;
      if (!obj.selectable) locked++;
    });

    return {
      totalObjects: objects.length,
      byType,
      byColor,
      visible,
      locked
    };
  }

  public cleanup(): void {
    this.searchHistory = [];
  }
}

// Singleton instance
let searchManagerInstance: SearchManager | null = null;

export const getSearchManager = (canvas?: fabric.Canvas): SearchManager | null => {
  if (canvas && !searchManagerInstance) {
    searchManagerInstance = new SearchManager(canvas);
  }
  return searchManagerInstance;
};

export const cleanupSearchManager = (): void => {
  if (searchManagerInstance) {
    searchManagerInstance.cleanup();
    searchManagerInstance = null;
  }
};
