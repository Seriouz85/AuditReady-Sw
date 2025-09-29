/**
 * Performance Optimization Hook
 * Implements virtualization, memoization, code splitting, and performance monitoring
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Node, Edge } from 'reactflow';
import { useDiagramStore } from '../../stores/diagramStore';

// Performance metrics interface
interface PerformanceMetrics {
  renderTime: number;
  nodeCount: number;
  edgeCount: number;
  memoryUsage: number;
  fps: number;
  lastUpdateTime: number;
  virtualizedNodes: number;
  cacheHitRate: number;
}

// Virtualization configuration
interface VirtualizationConfig {
  enabled: boolean;
  viewportPadding: number;
  maxVisibleNodes: number;
  chunkSize: number;
  preloadDistance: number;
}

// Memoization cache
interface MemoCache {
  [key: string]: {
    value: any;
    timestamp: number;
    hits: number;
  };
}

export const usePerformanceOptimization = () => {
  // State management
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    nodeCount: 0,
    edgeCount: 0,
    memoryUsage: 0,
    fps: 0,
    lastUpdateTime: Date.now(),
    virtualizedNodes: 0,
    cacheHitRate: 0
  });

  const [virtualizationConfig, setVirtualizationConfig] = useState<VirtualizationConfig>({
    enabled: false,
    viewportPadding: 200,
    maxVisibleNodes: 100,
    chunkSize: 25,
    preloadDistance: 300
  });

  const [isHighPerformanceMode, setIsHighPerformanceMode] = useState(false);
  const [renderMode, setRenderMode] = useState<'svg' | 'canvas'>('svg');

  // Refs for performance tracking
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);
  const frameTimeRef = useRef<number[]>([]);
  const cacheRef = useRef<MemoCache>({});
  const renderStartTimeRef = useRef<number>(0);
  const viewportRef = useRef<{ x: number; y: number; width: number; height: number }>({
    x: 0, y: 0, width: 1200, height: 800
  });

  // Store access
  const { nodes, edges, zoom, canvasPosition } = useDiagramStore();

  // Auto-detect performance mode based on diagram complexity
  const shouldUseHighPerformanceMode = useMemo(() => {
    const totalElements = nodes.length + edges.length;
    const complexityScore = totalElements + (edges.length * 0.5); // Edges are less expensive than nodes
    return complexityScore > 50;
  }, [nodes.length, edges.length]);

  // Auto-enable virtualization for large diagrams
  useEffect(() => {
    const shouldVirtualize = nodes.length > virtualizationConfig.maxVisibleNodes;
    
    setVirtualizationConfig(prev => ({
      ...prev,
      enabled: shouldVirtualize
    }));

    setIsHighPerformanceMode(shouldUseHighPerformanceMode);
    
    // Switch to canvas mode for very large diagrams
    if (nodes.length > 200) {
      setRenderMode('canvas');
    } else {
      setRenderMode('svg');
    }
  }, [nodes.length, shouldUseHighPerformanceMode, virtualizationConfig.maxVisibleNodes]);

  // Viewport-based virtualization
  const getVisibleNodes = useCallback(() => {
    if (!virtualizationConfig.enabled) {
      return nodes;
    }

    const viewport = viewportRef.current;
    const padding = virtualizationConfig.viewportPadding;
    const scale = zoom;

    // Calculate visible bounds with padding
    const visibleBounds = {
      left: (viewport.x - canvasPosition.x) / scale - padding,
      right: (viewport.x - canvasPosition.x + viewport.width) / scale + padding,
      top: (viewport.y - canvasPosition.y) / scale - padding,
      bottom: (viewport.y - canvasPosition.y + viewport.height) / scale + padding
    };

    // Filter nodes within visible bounds
    const visibleNodes = nodes.filter(node => {
      const nodeWidth = node.width || 150;
      const nodeHeight = node.height || 50;
      
      return (
        node.position.x + nodeWidth >= visibleBounds.left &&
        node.position.x <= visibleBounds.right &&
        node.position.y + nodeHeight >= visibleBounds.top &&
        node.position.y <= visibleBounds.bottom
      );
    });

    // Update metrics
    setMetrics(prev => ({
      ...prev,
      virtualizedNodes: visibleNodes.length
    }));

    return visibleNodes;
  }, [nodes, zoom, canvasPosition, virtualizationConfig]);

  // Memoized edge calculations
  const getVisibleEdges = useMemo(() => {
    if (!virtualizationConfig.enabled) {
      return edges;
    }

    const visibleNodes = getVisibleNodes();
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

    return edges.filter(edge => 
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }, [edges, getVisibleNodes, virtualizationConfig.enabled]);

  // Memoization utility with cache management
  const memoize = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string
  ): T => {
    return ((...args: Parameters<T>): ReturnType<T> => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      const now = Date.now();
      const cached = cacheRef.current[key];

      // Check cache validity (5 minute TTL)
      if (cached && now - cached.timestamp < 300000) {
        cached.hits++;
        return cached.value;
      }

      // Calculate new value
      const value = fn(...args);
      
      // Store in cache
      cacheRef.current[key] = {
        value,
        timestamp: now,
        hits: 0
      };

      return value;
    }) as T;
  }, []);

  // Memoized node calculations
  const getMemoizedNodeStyle = useMemo(() => 
    memoize((nodeId: string, nodeData: any) => {
      // Expensive style calculations here
      return {
        background: nodeData.fillColor || '#ffffff',
        border: `${nodeData.strokeWidth || 1}px solid ${nodeData.strokeColor || '#000000'}`,
        color: nodeData.textColor || '#000000'
      };
    }, (nodeId, nodeData) => `${nodeId}-${JSON.stringify(nodeData)}`)
  , [memoize]);

  // Chunked rendering for large datasets
  const getNodeChunks = useCallback(() => {
    const visibleNodes = getVisibleNodes();
    const chunks: Node[][] = [];
    const chunkSize = virtualizationConfig.chunkSize;

    for (let i = 0; i < visibleNodes.length; i += chunkSize) {
      chunks.push(visibleNodes.slice(i, i + chunkSize));
    }

    return chunks;
  }, [getVisibleNodes, virtualizationConfig.chunkSize]);

  // Progressive loading for better perceived performance
  const createProgressiveLoader = useCallback((totalItems: number, batchSize: number = 10) => {
    return {
      initialCount: Math.min(batchSize, totalItems),
      loadMore: () => Math.min(batchSize, totalItems)
    };
  }, []);

  // Performance monitoring
  const startPerformanceMonitoring = useCallback(() => {
    if (!performanceObserverRef.current && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
          if (entry.entryType === 'measure' && entry.name === 'diagram-render') {
            setMetrics(prev => ({
              ...prev,
              renderTime: entry.duration
            }));
          }
        });
      });
      
      observer.observe({ entryTypes: ['measure'] });
      performanceObserverRef.current = observer;
    }
  }, []);

  const stopPerformanceMonitoring = useCallback(() => {
    if (performanceObserverRef.current) {
      performanceObserverRef.current.disconnect();
      performanceObserverRef.current = null;
    }
  }, []);

  // FPS tracking
  const trackFPS = useCallback(() => {
    let lastTime = performance.now();
    
    const measureFrame = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      
      frameTimeRef.current.push(deltaTime);
      
      // Keep only last 60 frames
      if (frameTimeRef.current.length > 60) {
        frameTimeRef.current.shift();
      }
      
      // Calculate FPS every 30 frames
      if (frameTimeRef.current.length >= 30) {
        const averageFrameTime = frameTimeRef.current.reduce((a, b) => a + b, 0) / frameTimeRef.current.length;
        const fps = Math.round(1000 / averageFrameTime);
        
        setMetrics(prev => ({
          ...prev,
          fps
        }));
      }
      
      lastTime = currentTime;
      requestAnimationFrame(measureFrame);
    };
    
    requestAnimationFrame(measureFrame);
  }, []);

  // Memory usage tracking
  const trackMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memInfo.usedJSHeapSize / 1024 / 1024 // MB
      }));
    }
  }, []);

  // Cache statistics
  const getCacheStats = useCallback(() => {
    const cache = cacheRef.current;
    const entries = Object.values(cache);
    const totalRequests = entries.reduce((sum, entry) => sum + entry.hits + 1, 0);
    const cacheHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    const hitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;

    setMetrics(prev => ({
      ...prev,
      cacheHitRate: hitRate
    }));
  }, []);

  // Cache cleanup
  const cleanupCache = useCallback(() => {
    const now = Date.now();
    const maxAge = 300000; // 5 minutes
    
    Object.keys(cacheRef.current).forEach(key => {
      if (now - cacheRef.current[key].timestamp > maxAge) {
        delete cacheRef.current[key];
      }
    });
  }, []);

  // Debounced performance updates
  const debouncedUpdateMetrics = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setMetrics(prev => ({
          ...prev,
          nodeCount: nodes.length,
          edgeCount: edges.length,
          lastUpdateTime: Date.now()
        }));
        
        getCacheStats();
      }, 100);
    };
  }, [nodes.length, edges.length, getCacheStats]);

  // Web Worker factory for heavy computations
  const createWebWorker = useCallback((workerScript: string) => {
    try {
      const workerInstance = new Worker(workerScript);
      
      return {
        worker: workerInstance,
        postMessage: (data: any) => {
          return new Promise((resolve, reject) => {
            const handleMessage = (e: MessageEvent) => {
              workerInstance.removeEventListener('message', handleMessage);
              workerInstance.removeEventListener('error', handleError);
              resolve(e.data);
            };
            
            const handleError = (err: ErrorEvent) => {
              workerInstance.removeEventListener('message', handleMessage);
              workerInstance.removeEventListener('error', handleError);
              reject(new Error(err.message));
            };
            
            workerInstance.addEventListener('message', handleMessage);
            workerInstance.addEventListener('error', handleError);
            workerInstance.postMessage(data);
          });
        },
        terminate: () => workerInstance.terminate(),
        isReady: true,
        error: null
      };
    } catch (err) {
      return {
        worker: null,
        postMessage: () => Promise.reject(new Error('Worker not available')),
        terminate: () => {},
        isReady: false,
        error: err as Error
      };
    }
  }, []);

  // Viewport update handler
  const updateViewport = useCallback((viewport: { x: number; y: number; width: number; height: number }) => {
    viewportRef.current = viewport;
  }, []);

  // Performance optimization suggestions
  const getPerformanceSuggestions = useCallback(() => {
    const suggestions: string[] = [];
    
    if (metrics.nodeCount > 100 && !virtualizationConfig.enabled) {
      suggestions.push('Enable virtualization for better performance with large diagrams');
    }
    
    if (metrics.fps < 30) {
      suggestions.push('Consider reducing visual effects or switching to canvas rendering');
    }
    
    if (metrics.memoryUsage > 100) {
      suggestions.push('High memory usage detected. Consider clearing diagram history');
    }
    
    if (metrics.renderTime > 16) {
      suggestions.push('Slow rendering detected. Enable high performance mode');
    }
    
    if (metrics.cacheHitRate < 50) {
      suggestions.push('Low cache hit rate. Consider optimizing data structures');
    }
    
    return suggestions;
  }, [metrics, virtualizationConfig.enabled]);

  // Initialize performance monitoring
  useEffect(() => {
    startPerformanceMonitoring();
    trackFPS();
    
    const memoryInterval = setInterval(trackMemoryUsage, 5000);
    const cacheCleanupInterval = setInterval(cleanupCache, 60000);
    
    return () => {
      stopPerformanceMonitoring();
      clearInterval(memoryInterval);
      clearInterval(cacheCleanupInterval);
    };
  }, [startPerformanceMonitoring, trackFPS, trackMemoryUsage, cleanupCache, stopPerformanceMonitoring]);

  // Update metrics when data changes
  useEffect(() => {
    debouncedUpdateMetrics();
  }, [debouncedUpdateMetrics]);

  return {
    // Virtualization
    visibleNodes: getVisibleNodes(),
    visibleEdges: getVisibleEdges,
    nodeChunks: getNodeChunks(),
    updateViewport,
    virtualizationConfig,
    setVirtualizationConfig,
    
    // Performance state
    metrics,
    isHighPerformanceMode,
    renderMode,
    setRenderMode,
    
    // Optimization utilities
    memoize,
    getMemoizedNodeStyle,
    useProgressiveLoading,
    useWebWorker,
    
    // Performance monitoring
    startPerformanceMonitoring,
    stopPerformanceMonitoring,
    getPerformanceSuggestions,
    
    // Cache management
    cleanupCache,
    cacheStats: {
      size: Object.keys(cacheRef.current).length,
      hitRate: metrics.cacheHitRate
    }
  };
};