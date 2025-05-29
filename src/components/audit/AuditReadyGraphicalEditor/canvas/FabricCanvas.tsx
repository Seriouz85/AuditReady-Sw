import React, { useRef, useEffect, useState } from 'react';
import * as fabric from 'fabric';
import { useFabricCanvasStore } from '../core/FabricCanvasStore';
import {
  initializeFabric,
  customizeBoundingBox,
  setupTrackpadZoom,
  AUDIT_COLORS
} from '../core/fabric-utils';
import { getEventManager, cleanupEventManager } from '../core/EventManager';
import { EditorTestUtils } from '../utils/EditorTestUtils';
import { getGridManager } from '../core/GridManager';
import { Grid3X3, MousePointer2, ZoomIn, ZoomOut, EyeOff } from 'lucide-react';

interface FabricCanvasProps {
  className?: string;
}

const FabricCanvas: React.FC<FabricCanvasProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const initAttemptedRef = useRef(false);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [zoom, setZoom] = useState(1);

  const { setCanvas, markAsModified, setShowProperties } = useFabricCanvasStore();

  useEffect(() => {
    const cleanUpCanvas = () => {
      if (fabricCanvasRef.current) {
        try {
          // Clean up event manager
          cleanupEventManager();

          // Dispose canvas
          fabricCanvasRef.current.dispose();
        } catch (e) {
          console.error('Error cleaning up canvas', e);
        }

        fabricCanvasRef.current = null;
        setCanvas(null);
      }
    };

    cleanUpCanvas();
    initAttemptedRef.current = false;

    const initCanvas = async () => {
      if (
        typeof window === 'undefined' ||
        !canvasRef.current ||
        initAttemptedRef.current
      ) {
        return;
      }

      initAttemptedRef.current = true;

      try {
        const fabricCanvas = await initializeFabric(canvasRef.current);

        if (!fabricCanvas) {
          console.error('Failed to initialize Fabric.js canvas');
          return;
        }

        // Set reasonable canvas dimensions - start with container size
        const containerWidth = canvasContainerRef.current?.offsetWidth || 1200;
        const containerHeight = canvasContainerRef.current?.offsetHeight || 800;

        // Start with container size, will expand dynamically as content is added
        const canvasWidth = Math.max(containerWidth, 1200); // Minimum reasonable width
        const canvasHeight = Math.max(containerHeight, 600); // Minimum reasonable height

        fabricCanvas.setDimensions({
          width: canvasWidth,
          height: canvasHeight
        });

        fabricCanvasRef.current = fabricCanvas;
        setCanvas(fabricCanvas);

        console.log('Fabric canvas initialized and set in store');
        console.log('Canvas dimensions:', fabricCanvas.width, 'x', fabricCanvas.height);
        console.log('Container dimensions:', containerWidth, 'x', containerHeight);

        // Apply audit-ready styling for controls
        customizeBoundingBox(fabricCanvas);

        // Style the canvas wrapper with scrollbar support
        setTimeout(() => {
          if (fabricCanvas && fabricCanvas.wrapperEl && canvasContainerRef.current) {
            // Style the canvas wrapper
            fabricCanvas.wrapperEl.style.position = 'relative';
            fabricCanvas.wrapperEl.style.border = '2px solid #e2e8f0';
            fabricCanvas.wrapperEl.style.borderRadius = '8px';
            fabricCanvas.wrapperEl.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            fabricCanvas.wrapperEl.style.backgroundColor = 'white';
            fabricCanvas.wrapperEl.style.display = 'block';

            // Style the container for scrolling
            const container = canvasContainerRef.current;
            container.style.overflow = 'auto'; // Enable scrollbars only when needed
            container.style.maxWidth = '100%';
            container.style.maxHeight = '100%';
            container.style.position = 'relative';

            // Add custom scrollbar styling
            container.style.scrollbarWidth = 'thin';
            container.style.scrollbarColor = `${AUDIT_COLORS.primary} ${AUDIT_COLORS.background}`;

            // Start at top-left (no initial scrolling)
            container.scrollLeft = 0;
            container.scrollTop = 0;
          }
        }, 100);

        // Initialize the event manager for centralized event handling
        const eventManager = getEventManager(fabricCanvas);
        if (eventManager) {
          eventManager.initialize();
          console.log('Event manager initialized for canvas');
        } else {
          console.error('Failed to initialize event manager');
        }

        // Add trackpad pinch-to-zoom functionality
        setupTrackpadZoom(fabricCanvas, canvasContainerRef.current);

        // Add test utilities to window for development
        if (typeof window !== 'undefined') {
          (window as any).testEditor = () => EditorTestUtils.runAllTests(fabricCanvas);
          (window as any).createTestScenario = () => EditorTestUtils.createTestScenario(fabricCanvas);
          (window as any).logCanvasState = () => EditorTestUtils.logCanvasState(fabricCanvas);
          console.log('Test utilities available: testEditor(), createTestScenario(), logCanvasState()');
        }

        // Initial render
        fabricCanvas.renderAll();

        const gridManager = getGridManager(fabricCanvas);
        if (gridManager) {
          gridManager.setEnabled(true);
          gridManager.setSnapToGrid(true);
        }

      } catch (error) {
        console.error('Error initializing canvas:', error);
        initAttemptedRef.current = false;
      }
    };

    // Initialize canvas with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(initCanvas, 100);

    return () => {
      clearTimeout(timeoutId);
      cleanUpCanvas();
    };
  }, [setCanvas, markAsModified, setShowProperties]);

  // Canvas controls handlers
  const handleToggleGrid = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const gridManager = getGridManager(canvas);
    if (gridManager) {
      gridManager.setEnabled(!showGrid);
      setShowGrid(!showGrid);
    }
  };
  const handleToggleSnap = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const gridManager = getGridManager(canvas);
    if (gridManager) {
      gridManager.setSnapToGrid(!snapToGrid);
      setSnapToGrid(!snapToGrid);
    }
  };
  const handleZoomIn = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const newZoom = Math.min(zoom + 0.1, 2);
    canvas.setZoom(newZoom);
    setZoom(newZoom);
    canvas.requestRenderAll();
  };
  const handleZoomOut = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const newZoom = Math.max(zoom - 0.1, 0.2);
    canvas.setZoom(newZoom);
    setZoom(newZoom);
    canvas.requestRenderAll();
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Floating Canvas Controls */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: 'rgba(255,255,255,0.95)',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: 10,
        border: '1px solid #e5e7eb',
        alignItems: 'center',
        minWidth: 44
      }}>
        <button title={showGrid ? 'Hide Grid' : 'Show Grid'} onClick={handleToggleGrid} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          {showGrid ? <Grid3X3 color="#3b82f6" /> : <EyeOff color="#9ca3af" />}
        </button>
        <button title={snapToGrid ? 'Disable Snap to Grid' : 'Enable Snap to Grid'} onClick={handleToggleSnap} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <MousePointer2 color={snapToGrid ? '#3b82f6' : '#9ca3af'} />
        </button>
        <button title="Zoom In" onClick={handleZoomIn} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ZoomIn color="#3b82f6" />
        </button>
        <button title="Zoom Out" onClick={handleZoomOut} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ZoomOut color="#3b82f6" />
        </button>
      </div>
      {/* Canvas container with scrollbar support */}
      <div
        ref={canvasContainerRef}
        style={{
          display: 'inline-block',
          width: 'auto',
          height: 'auto',
          overflow: 'auto',
          position: 'relative',
          scrollbarWidth: 'thin',
          scrollbarColor: `${AUDIT_COLORS.primary} ${AUDIT_COLORS.background}`,
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            width: 12px;
            height: 12px;
          }

          div::-webkit-scrollbar-track {
            background: ${AUDIT_COLORS.background};
            border-radius: 6px;
          }

          div::-webkit-scrollbar-thumb {
            background: ${AUDIT_COLORS.primary};
            border-radius: 6px;
            border: 2px solid ${AUDIT_COLORS.background};
          }

          div::-webkit-scrollbar-thumb:hover {
            background: ${AUDIT_COLORS.secondary};
          }

          div::-webkit-scrollbar-corner {
            background: ${AUDIT_COLORS.background};
          }
        `}</style>

        <canvas
          ref={canvasRef}
          className="block"
          style={{
            display: 'block',
            background: 'transparent'
          }}
        />
      </div>

      {/* Scroll indicators */}
      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-gray-600 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span>Scroll to explore</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FabricCanvas;