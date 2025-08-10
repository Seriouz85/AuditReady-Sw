/**
 * Responsive Editor Wrapper
 * Provides mobile-first responsive design with touch gestures and adaptive UI
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Menu, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '../ui/button';
import { useDiagramStore } from '../../stores/diagramStore';

// Device types
type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveEditorWrapperProps {
  children: React.ReactNode;
  className?: string;
}

// Touch gesture types
interface TouchGesture {
  type: 'pan' | 'pinch' | 'tap' | 'long-press';
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  scale?: number;
  rotation?: number;
  duration: number;
}

// Responsive breakpoints
const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200
};

export const ResponsiveEditorWrapper: React.FC<ResponsiveEditorWrapperProps> = ({
  children,
  className = ''
}) => {
  // Device and viewport state
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // UI state for mobile/tablet
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileToolbar, setShowMobileToolbar] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [touchMode, setTouchMode] = useState(false);
  
  // Touch handling state
  const [activeGesture, setActiveGesture] = useState<TouchGesture | null>(null);
  const [lastTouchEnd, setLastTouchEnd] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const gestureRef = useRef<any>(null);
  
  // Store access
  const { 
    panelStates, 
    togglePanel, 
    zoom, 
    setZoom, 
    canvasPosition, 
    setCanvasPosition,
    showGrid,
    setShowGrid 
  } = useDiagramStore();

  // Detect device type and update state
  const updateDeviceInfo = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    setViewportSize({ width, height });
    setOrientation(width > height ? 'landscape' : 'portrait');
    
    if (width <= breakpoints.mobile) {
      setDeviceType('mobile');
      setCompactMode(true);
      setTouchMode('ontouchstart' in window);
    } else if (width <= breakpoints.tablet) {
      setDeviceType('tablet');
      setCompactMode(false);
      setTouchMode('ontouchstart' in window);
    } else {
      setDeviceType('desktop');
      setCompactMode(false);
      setTouchMode(false);
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    updateDeviceInfo();
    
    const handleResize = () => {
      updateDeviceInfo();
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [updateDeviceInfo]);

  // Touch gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!touchMode) return;
    
    const touch = e.touches[0];
    const now = Date.now();
    
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: now
    };
    
    // Detect double tap
    if (now - lastTouchEnd <= 300) {
      handleDoubleTap(touch.clientX, touch.clientY);
      return;
    }
    
    // Multi-touch gestures
    if (e.touches.length === 2) {
      handlePinchStart(e);
    } else {
      // Single touch - potential pan or tap
      setActiveGesture({
        type: 'tap',
        startPosition: { x: touch.clientX, y: touch.clientY },
        currentPosition: { x: touch.clientX, y: touch.clientY },
        duration: 0
      });
    }
  }, [touchMode, lastTouchEnd]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchMode || !activeGesture) return;
    
    e.preventDefault(); // Prevent scrolling
    
    const touch = e.touches[0];
    const currentPos = { x: touch.clientX, y: touch.clientY };
    
    if (e.touches.length === 2) {
      handlePinchMove(e);
      return;
    }
    
    // Calculate movement distance
    const deltaX = currentPos.x - activeGesture.startPosition.x;
    const deltaY = currentPos.y - activeGesture.startPosition.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // If moved more than threshold, it's a pan gesture
    if (distance > 10 && activeGesture.type === 'tap') {
      setActiveGesture({
        ...activeGesture,
        type: 'pan',
        currentPosition: currentPos
      });
      
      // Update canvas position for panning
      setCanvasPosition({
        x: canvasPosition.x + deltaX * 0.5,
        y: canvasPosition.y + deltaY * 0.5
      });
    }
  }, [touchMode, activeGesture, canvasPosition, setCanvasPosition]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchMode) return;
    
    const now = Date.now();
    setLastTouchEnd(now);
    
    if (activeGesture && touchStartRef.current) {
      const duration = now - touchStartRef.current.time;
      
      // Long press detection
      if (duration > 500 && activeGesture.type === 'tap') {
        handleLongPress(activeGesture.startPosition);
      }
    }
    
    setActiveGesture(null);
    touchStartRef.current = null;
  }, [touchMode, activeGesture]);

  // Pinch to zoom handling
  const handlePinchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2) return;
    
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    
    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    
    gestureRef.current = {
      initialDistance: distance,
      initialZoom: zoom
    };
  }, [zoom]);

  const handlePinchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2 || !gestureRef.current) return;
    
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    
    const currentDistance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    
    const scale = currentDistance / gestureRef.current.initialDistance;
    const newZoom = Math.max(0.25, Math.min(3, gestureRef.current.initialZoom * scale));
    
    setZoom(newZoom);
  }, [setZoom]);

  // Gesture action handlers
  const handleDoubleTap = useCallback((x: number, y: number) => {
    // Double tap to zoom in/out
    const newZoom = zoom >= 1 ? 0.75 : 1.5;
    setZoom(newZoom);
  }, [zoom, setZoom]);

  const handleLongPress = useCallback((position: { x: number; y: number }) => {
    // Long press to open context menu
    console.log('Long press at:', position);
    // Could open a context menu or selection tool
  }, []);

  // Mobile-specific UI handlers
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(Math.min(3, zoom * 1.2));
  }, [zoom, setZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom(Math.max(0.25, zoom * 0.8));
  }, [zoom, setZoom]);

  const resetView = useCallback(() => {
    setZoom(1);
    setCanvasPosition({ x: 0, y: 0 });
  }, [setZoom, setCanvasPosition]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  // Layout configurations for different devices
  const getLayoutConfig = () => {
    switch (deviceType) {
      case 'mobile':
        return {
          showLeftPanel: false,
          showRightPanel: false,
          toolbarPosition: 'bottom',
          compactControls: true,
          gestureEnabled: true
        };
      case 'tablet':
        return {
          showLeftPanel: !mobileMenuOpen ? false : panelStates.leftPanel,
          showRightPanel: false,
          toolbarPosition: orientation === 'landscape' ? 'top' : 'bottom',
          compactControls: true,
          gestureEnabled: true
        };
      default:
        return {
          showLeftPanel: panelStates.leftPanel,
          showRightPanel: panelStates.rightPanel,
          toolbarPosition: 'top',
          compactControls: false,
          gestureEnabled: false
        };
    }
  };

  const layoutConfig = getLayoutConfig();

  return (
    <ReactFlowProvider>
      <div 
        className={`relative w-full h-full bg-gray-50 ${className}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          touchAction: touchMode ? 'none' : 'auto',
          userSelect: touchMode ? 'none' : 'auto'
        }}
      >
        {/* Mobile Header */}
        {deviceType === 'mobile' && (
          <div className="absolute top-0 left-0 right-0 z-50 bg-white shadow-sm border-b">
            <div className="flex items-center justify-between px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="p-2"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">AR Editor</span>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Mobile</span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="p-2"
              >
                <Monitor size={20} />
              </Button>
            </div>
          </div>
        )}

        {/* Mobile Side Menu */}
        {deviceType === 'mobile' && mobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed left-0 top-12 bottom-0 w-80 bg-white shadow-xl z-50 overflow-y-auto">
              <div className="p-4">
                <h3 className="font-semibold mb-4">Tools & Templates</h3>
                {/* Add mobile-optimized tools and templates here */}
              </div>
            </div>
          </>
        )}

        {/* Tablet Header */}
        {deviceType === 'tablet' && (
          <div className="absolute top-0 left-0 right-0 z-50 bg-white shadow-sm border-b">
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePanel('leftPanel')}
                >
                  <Menu size={20} />
                </Button>
                <span className="font-medium">AR Editor</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                  <ZoomOut size={18} />
                </Button>
                <span className="text-sm text-gray-600 min-w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                  <ZoomIn size={18} />
                </Button>
                <Button variant="ghost" size="sm" onClick={resetView}>
                  <RotateCcw size={18} />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Toolbar */}
        {deviceType === 'mobile' && showMobileToolbar && (
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-white shadow-lg border-t">
            <div className="flex items-center justify-around px-2 py-3">
              <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                <ZoomOut size={20} />
              </Button>
              
              <div className="text-xs text-center">
                <div className="font-medium">{Math.round(zoom * 100)}%</div>
              </div>
              
              <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                <ZoomIn size={20} />
              </Button>
              
              <Button variant="ghost" size="sm" onClick={resetView}>
                <RotateCcw size={20} />
              </Button>
              
              <Button variant="ghost" size="sm" onClick={() => setShowGrid(!showGrid)}>
                {showGrid ? <Eye size={20} /> : <EyeOff size={20} />}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowMobileToolbar(false)}
              >
                <X size={20} />
              </Button>
            </div>
          </div>
        )}

        {/* Device indicator */}
        <div className="absolute top-4 right-4 z-40 bg-white rounded-lg shadow-sm border px-3 py-1">
          <div className="flex items-center space-x-2 text-sm">
            {deviceType === 'mobile' && <Smartphone size={16} />}
            {deviceType === 'tablet' && <Tablet size={16} />}
            {deviceType === 'desktop' && <Monitor size={16} />}
            <span className="capitalize text-gray-600">{deviceType}</span>
            <span className="text-xs text-gray-400">
              {viewportSize.width}×{viewportSize.height}
            </span>
          </div>
        </div>

        {/* Touch gesture feedback */}
        {touchMode && activeGesture && (
          <div className="absolute top-20 left-4 z-40 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
            Gesture: {activeGesture.type}
          </div>
        )}

        {/* Main content with responsive padding */}
        <div 
          className="w-full h-full"
          style={{
            paddingTop: deviceType !== 'desktop' ? '48px' : '0',
            paddingBottom: deviceType === 'mobile' && showMobileToolbar ? '64px' : '0'
          }}
        >
          {children}
        </div>

        {/* Hidden toolbar toggle for mobile */}
        {deviceType === 'mobile' && !showMobileToolbar && (
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowMobileToolbar(true)}
            className="absolute bottom-4 right-4 z-50 rounded-full w-12 h-12 shadow-lg"
          >
            <Settings size={20} />
          </Button>
        )}

        {/* PWA install prompt */}
        {deviceType === 'mobile' && (
          <div className="absolute top-16 left-4 right-4 z-30">
            {/* PWA installation prompt would go here */}
          </div>
        )}

        {/* Custom CSS for responsive behavior */}
        <style jsx>{`
          @media (max-width: ${breakpoints.mobile}px) {
            .react-flow__controls {
              display: none;
            }
            
            .react-flow__minimap {
              display: none;
            }
            
            .react-flow__attribution {
              display: none;
            }
          }
          
          @media (max-width: ${breakpoints.tablet}px) {
            .react-flow__node {
              font-size: 14px;
            }
            
            .react-flow__edge {
              stroke-width: 3px;
            }
            
            .react-flow__handle {
              width: 12px;
              height: 12px;
            }
          }
          
          @media (orientation: portrait) and (max-width: ${breakpoints.tablet}px) {
            .react-flow__panel {
              bottom: 80px;
            }
          }
        `}</style>
      </div>
    </ReactFlowProvider>
  );
};

export default ResponsiveEditorWrapper;