import * as fabric from 'fabric';

export interface UserAction {
  id: string;
  type: 'create' | 'modify' | 'delete' | 'select' | 'move' | 'resize' | 'rotate' | 'copy' | 'paste' | 'undo' | 'redo';
  timestamp: Date;
  objectType?: string;
  objectId?: string;
  duration?: number; // milliseconds
  details?: any;
  sessionId: string;
}

export interface DesignMetrics {
  totalObjects: number;
  objectTypes: Record<string, number>;
  canvasUtilization: number; // percentage of canvas used
  designComplexity: number; // 0-100 score
  colorPalette: string[];
  fontUsage: Record<string, number>;
  averageObjectSize: { width: number; height: number };
  layoutDensity: number;
}

export interface UsageStatistics {
  sessionDuration: number;
  actionsPerMinute: number;
  mostUsedTools: Record<string, number>;
  errorRate: number;
  undoRedoRatio: number;
  collaborationTime: number;
  peakUsageHours: Record<string, number>;
}

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  canvasSize: { width: number; height: number };
  objectCount: number;
  averageResponseTime: number;
  frameRate: number;
}

export interface AnalyticsReport {
  id: string;
  timestamp: Date;
  sessionId: string;
  designMetrics: DesignMetrics;
  usageStatistics: UsageStatistics;
  performanceMetrics: PerformanceMetrics;
  userActions: UserAction[];
  insights: string[];
  recommendations: string[];
}

export class AnalyticsManager {
  private canvas: fabric.Canvas;
  private sessionId: string;
  private sessionStart: Date;
  private userActions: UserAction[] = [];
  private performanceData: number[] = [];
  private isEnabled: boolean = true;
  private reportInterval: number = 300000; // 5 minutes
  private reportTimer: NodeJS.Timeout | null = null;
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessionStart = new Date();
    this.setupEventListeners();
    this.startPerformanceMonitoring();
    this.startReportGeneration();
  }

  private setupEventListeners(): void {
    // Canvas events
    this.canvas.on('object:added', (e) => this.trackAction('create', e.target));
    this.canvas.on('object:modified', (e) => this.trackAction('modify', e.target));
    this.canvas.on('object:removed', (e) => this.trackAction('delete', e.target));
    this.canvas.on('selection:created', (e) => this.trackAction('select', e.target));
    this.canvas.on('selection:updated', (e) => this.trackAction('select', e.target));
    this.canvas.on('object:moving', (e) => this.trackAction('move', e.target));
    this.canvas.on('object:scaling', (e) => this.trackAction('resize', e.target));
    this.canvas.on('object:rotating', (e) => this.trackAction('rotate', e.target));

    // Performance monitoring
    this.canvas.on('after:render', this.measureRenderPerformance.bind(this));
  }

  private trackAction(type: UserAction['type'], target?: fabric.Object, details?: any): void {
    if (!this.isEnabled) return;

    const action: UserAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date(),
      objectType: target?.type,
      objectId: target?.id,
      details,
      sessionId: this.sessionId
    };

    this.userActions.push(action);
    this.emit('action:tracked', action);

    // Limit action history
    if (this.userActions.length > 10000) {
      this.userActions = this.userActions.slice(-5000);
    }
  }

  public trackCustomAction(type: string, details?: any): void {
    this.trackAction(type as UserAction['type'], undefined, details);
  }

  private measureRenderPerformance(): void {
    const now = performance.now();
    this.performanceData.push(now);

    // Keep only last 100 measurements
    if (this.performanceData.length > 100) {
      this.performanceData = this.performanceData.slice(-50);
    }
  }

  private startPerformanceMonitoring(): void {
    setInterval(() => {
      if (!this.isEnabled) return;

      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        this.emit('performance:memory', {
          used: memoryInfo.usedJSHeapSize,
          total: memoryInfo.totalJSHeapSize,
          limit: memoryInfo.jsHeapSizeLimit
        });
      }
    }, 10000); // Every 10 seconds
  }

  private startReportGeneration(): void {
    this.reportTimer = setInterval(() => {
      this.generateReport();
    }, this.reportInterval);
  }

  public async generateReport(): Promise<AnalyticsReport> {
    const designMetrics = this.calculateDesignMetrics();
    const usageStatistics = this.calculateUsageStatistics();
    const performanceMetrics = this.calculatePerformanceMetrics();
    const insights = this.generateInsights(designMetrics, usageStatistics);
    const recommendations = this.generateRecommendations(designMetrics, usageStatistics, performanceMetrics);

    const report: AnalyticsReport = {
      id: `report_${Date.now()}`,
      timestamp: new Date(),
      sessionId: this.sessionId,
      designMetrics,
      usageStatistics,
      performanceMetrics,
      userActions: [...this.userActions],
      insights,
      recommendations
    };

    this.emit('report:generated', report);
    return report;
  }

  private calculateDesignMetrics(): DesignMetrics {
    const objects = this.canvas.getObjects().filter(obj => 
      !obj.isConnectionPoint && !obj.isConnector
    );

    const objectTypes: Record<string, number> = {};
    const colors = new Set<string>();
    const fonts: Record<string, number> = {};
    let totalArea = 0;
    let totalWidth = 0;
    let totalHeight = 0;

    objects.forEach(obj => {
      // Count object types
      const type = obj.type || 'unknown';
      objectTypes[type] = (objectTypes[type] || 0) + 1;

      // Collect colors
      if (obj.fill && typeof obj.fill === 'string') {
        colors.add(obj.fill);
      }
      if (obj.stroke && typeof obj.stroke === 'string') {
        colors.add(obj.stroke);
      }

      // Collect fonts
      if (obj.type === 'i-text' || obj.type === 'text') {
        const fontFamily = (obj as fabric.IText).fontFamily || 'default';
        fonts[fontFamily] = (fonts[fontFamily] || 0) + 1;
      }

      // Calculate areas and sizes
      const bounds = obj.getBoundingRect();
      totalArea += bounds.width * bounds.height;
      totalWidth += bounds.width;
      totalHeight += bounds.height;
    });

    const canvasArea = (this.canvas.width || 800) * (this.canvas.height || 600);
    const canvasUtilization = (totalArea / canvasArea) * 100;

    return {
      totalObjects: objects.length,
      objectTypes,
      canvasUtilization,
      designComplexity: this.calculateComplexity(objects),
      colorPalette: Array.from(colors),
      fontUsage: fonts,
      averageObjectSize: {
        width: objects.length > 0 ? totalWidth / objects.length : 0,
        height: objects.length > 0 ? totalHeight / objects.length : 0
      },
      layoutDensity: this.calculateLayoutDensity(objects)
    };
  }

  private calculateComplexity(objects: fabric.Object[]): number {
    let complexity = 0;

    // Base complexity from object count
    complexity += Math.min(objects.length * 2, 40);

    // Add complexity for different object types
    const uniqueTypes = new Set(objects.map(obj => obj.type));
    complexity += uniqueTypes.size * 5;

    // Add complexity for text objects
    const textObjects = objects.filter(obj => obj.type === 'i-text' || obj.type === 'text');
    complexity += textObjects.length * 3;

    // Add complexity for paths and custom shapes
    const pathObjects = objects.filter(obj => obj.type === 'path');
    complexity += pathObjects.length * 8;

    return Math.min(complexity, 100);
  }

  private calculateLayoutDensity(objects: fabric.Object[]): number {
    if (objects.length === 0) return 0;

    const bounds = objects.map(obj => obj.getBoundingRect());
    const minX = Math.min(...bounds.map(b => b.left));
    const maxX = Math.max(...bounds.map(b => b.left + b.width));
    const minY = Math.min(...bounds.map(b => b.top));
    const maxY = Math.max(...bounds.map(b => b.top + b.height));

    const usedArea = (maxX - minX) * (maxY - minY);
    const totalObjectArea = bounds.reduce((sum, b) => sum + b.width * b.height, 0);

    return usedArea > 0 ? (totalObjectArea / usedArea) * 100 : 0;
  }

  private calculateUsageStatistics(): UsageStatistics {
    const sessionDuration = Date.now() - this.sessionStart.getTime();
    const actionsPerMinute = (this.userActions.length / (sessionDuration / 60000));

    const toolUsage: Record<string, number> = {};
    let undoCount = 0;
    let redoCount = 0;
    let errorCount = 0;

    this.userActions.forEach(action => {
      toolUsage[action.type] = (toolUsage[action.type] || 0) + 1;
      
      if (action.type === 'undo') undoCount++;
      if (action.type === 'redo') redoCount++;
      if (action.details?.error) errorCount++;
    });

    const undoRedoRatio = this.userActions.length > 0 ? 
      (undoCount + redoCount) / this.userActions.length : 0;

    const errorRate = this.userActions.length > 0 ? 
      errorCount / this.userActions.length : 0;

    return {
      sessionDuration,
      actionsPerMinute,
      mostUsedTools: toolUsage,
      errorRate,
      undoRedoRatio,
      collaborationTime: 0, // TODO: Implement collaboration time tracking
      peakUsageHours: this.calculatePeakUsageHours()
    };
  }

  private calculatePeakUsageHours(): Record<string, number> {
    const hourlyUsage: Record<string, number> = {};

    this.userActions.forEach(action => {
      const hour = action.timestamp.getHours().toString();
      hourlyUsage[hour] = (hourlyUsage[hour] || 0) + 1;
    });

    return hourlyUsage;
  }

  private calculatePerformanceMetrics(): PerformanceMetrics {
    const objects = this.canvas.getObjects();
    const averageResponseTime = this.performanceData.length > 1 ? 
      this.performanceData.reduce((sum, time, index) => {
        if (index === 0) return 0;
        return sum + (time - this.performanceData[index - 1]);
      }, 0) / (this.performanceData.length - 1) : 0;

    return {
      renderTime: averageResponseTime,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      canvasSize: {
        width: this.canvas.width || 800,
        height: this.canvas.height || 600
      },
      objectCount: objects.length,
      averageResponseTime,
      frameRate: this.calculateFrameRate()
    };
  }

  private calculateFrameRate(): number {
    if (this.performanceData.length < 2) return 60;

    const recentData = this.performanceData.slice(-10);
    const intervals = [];

    for (let i = 1; i < recentData.length; i++) {
      intervals.push(recentData[i] - recentData[i - 1]);
    }

    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    return averageInterval > 0 ? 1000 / averageInterval : 60;
  }

  private generateInsights(designMetrics: DesignMetrics, usageStats: UsageStatistics): string[] {
    const insights: string[] = [];

    // Design insights
    if (designMetrics.totalObjects > 50) {
      insights.push('High object count detected - consider grouping related elements');
    }

    if (designMetrics.canvasUtilization > 80) {
      insights.push('Canvas is highly utilized - good space efficiency');
    } else if (designMetrics.canvasUtilization < 20) {
      insights.push('Canvas has lots of unused space - consider resizing or adding content');
    }

    if (designMetrics.colorPalette.length > 10) {
      insights.push('Many colors used - consider limiting palette for better consistency');
    }

    if (designMetrics.designComplexity > 80) {
      insights.push('High design complexity - ensure clarity and readability');
    }

    // Usage insights
    if (usageStats.undoRedoRatio > 0.3) {
      insights.push('High undo/redo usage suggests workflow inefficiencies');
    }

    if (usageStats.actionsPerMinute > 10) {
      insights.push('High activity rate - user is very engaged');
    } else if (usageStats.actionsPerMinute < 2) {
      insights.push('Low activity rate - user may need assistance');
    }

    return insights;
  }

  private generateRecommendations(
    designMetrics: DesignMetrics, 
    usageStats: UsageStatistics, 
    perfMetrics: PerformanceMetrics
  ): string[] {
    const recommendations: string[] = [];

    // Design recommendations
    if (designMetrics.totalObjects > 100) {
      recommendations.push('Consider using layers to organize many objects');
    }

    if (designMetrics.colorPalette.length > 8) {
      recommendations.push('Limit color palette to 5-8 colors for better visual harmony');
    }

    if (Object.keys(designMetrics.fontUsage).length > 3) {
      recommendations.push('Use fewer font families (2-3 max) for better typography');
    }

    // Performance recommendations
    if (perfMetrics.objectCount > 200) {
      recommendations.push('High object count may impact performance - consider optimization');
    }

    if (perfMetrics.frameRate < 30) {
      recommendations.push('Low frame rate detected - reduce visual effects or object count');
    }

    // Usage recommendations
    if (usageStats.errorRate > 0.1) {
      recommendations.push('Consider providing more user guidance to reduce errors');
    }

    if (usageStats.undoRedoRatio > 0.2) {
      recommendations.push('Implement better preview features to reduce trial-and-error');
    }

    return recommendations;
  }

  // Public methods
  public getSessionStatistics(): {
    sessionId: string;
    duration: number;
    actionCount: number;
    objectCount: number;
  } {
    return {
      sessionId: this.sessionId,
      duration: Date.now() - this.sessionStart.getTime(),
      actionCount: this.userActions.length,
      objectCount: this.canvas.getObjects().length
    };
  }

  public exportAnalytics(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      sessionStart: this.sessionStart,
      userActions: this.userActions,
      performanceData: this.performanceData
    });
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`Analytics ${enabled ? 'enabled' : 'disabled'}`);
  }

  public isAnalyticsEnabled(): boolean {
    return this.isEnabled;
  }

  public setReportInterval(intervalMs: number): void {
    this.reportInterval = Math.max(60000, intervalMs); // Minimum 1 minute
    
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.startReportGeneration();
    }
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
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = null;
    }

    this.canvas.off('object:added');
    this.canvas.off('object:modified');
    this.canvas.off('object:removed');
    this.canvas.off('selection:created');
    this.canvas.off('selection:updated');
    this.canvas.off('object:moving');
    this.canvas.off('object:scaling');
    this.canvas.off('object:rotating');
    this.canvas.off('after:render');

    this.userActions = [];
    this.performanceData = [];
    this.eventHandlers.clear();
  }
}

// Singleton instance
let analyticsManagerInstance: AnalyticsManager | null = null;

export const getAnalyticsManager = (canvas?: fabric.Canvas): AnalyticsManager | null => {
  if (canvas && !analyticsManagerInstance) {
    analyticsManagerInstance = new AnalyticsManager(canvas);
  }
  return analyticsManagerInstance;
};

export const cleanupAnalyticsManager = (): void => {
  if (analyticsManagerInstance) {
    analyticsManagerInstance.cleanup();
    analyticsManagerInstance = null;
  }
};
