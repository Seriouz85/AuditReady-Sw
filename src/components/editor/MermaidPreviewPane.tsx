/**
 * Mermaid Preview Pane - Following Official Mermaid Live Editor
 * Clean, simple diagram rendering with zoom and export controls
 */

import React, { useRef, useEffect, useState } from 'react';
import { GlassButton, GlassPanel, MermaidDesignTokens } from '../ui';
import {
  ZoomIn, ZoomOut, RotateCcw, Download, Copy,
  Maximize2, Grid3X3, Eye, AlertCircle
} from 'lucide-react';

interface MermaidPreviewPaneProps {
  diagramText: string;
  isRendering?: boolean;
  onExport?: (format: 'svg' | 'png' | 'pdf') => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
}

export const MermaidPreviewPane: React.FC<MermaidPreviewPaneProps> = ({
  diagramText,
  isRendering = false,
  onExport,
  zoom = 1,
  onZoomChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(zoom);

  // Render diagram using official Mermaid.js approach
  const renderDiagram = async () => {
    if (!containerRef.current || !diagramText.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Import Mermaid dynamically (official approach)
      const mermaid = (await import('mermaid')).default;

      // Initialize with professional white theme
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
          primaryColor: '#2563eb',
          primaryTextColor: '#1e293b',
          primaryBorderColor: '#1d4ed8',
          lineColor: '#64748b',
          sectionBkgColor: '#f8fafc',
          altSectionBkgColor: '#f1f5f9',
          gridColor: '#e2e8f0',
          secondaryColor: '#3b82f6',
          tertiaryColor: '#60a5fa',
          background: '#ffffff',
          mainBkg: '#ffffff',
          secondBkg: '#f8fafc'
        },
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis'
        },
        sequence: {
          useMaxWidth: true,
          wrap: true
        },
        gantt: {
          useMaxWidth: true
        },
        securityLevel: 'loose',
        deterministicIds: true,
        maxTextSize: 50000,
        maxEdges: 500
      });

      // Generate unique ID for this render
      const diagramId = `mermaid-preview-${Date.now()}`;

      // Render diagram (official method)
      const { svg } = await mermaid.render(diagramId, diagramText);

      // Insert SVG into container
      if (containerRef.current) {
        containerRef.current.innerHTML = svg;

        // Apply zoom
        const svgElement = containerRef.current.querySelector('svg');
        if (svgElement) {
          svgElement.style.transform = `scale(${currentZoom})`;
          svgElement.style.transformOrigin = 'top left';
          svgElement.style.transition = 'transform 0.2s ease';
        }
      }

      console.log('✅ Diagram rendered successfully');
    } catch (error) {
      console.error('❌ Diagram rendering failed:', error);
      setError((error as Error).message);

      // Show error in container
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div style="
            padding: 24px;
            text-align: center;
            color: #f8fafc;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 12px;
            font-family: ${MermaidDesignTokens.typography.fontFamily.sans};
            margin: 20px;
          ">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Diagram Syntax Error</h3>
            </div>
            <p style="margin: 0 0 8px 0; font-size: 14px;">${(error as Error).message}</p>
            <p style="margin: 0; font-size: 12px; opacity: 0.7;">Check your Mermaid syntax and try again.</p>
          </div>
        `;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Re-render when diagram text changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      renderDiagram();
    }, 300); // Debounce rendering

    return () => clearTimeout(timeoutId);
  }, [diagramText]);

  // Handle zoom changes
  const handleZoomIn = () => {
    const newZoom = Math.min(currentZoom + 0.1, 3);
    setCurrentZoom(newZoom);
    onZoomChange?.(newZoom);

    const svgElement = containerRef.current?.querySelector('svg');
    if (svgElement) {
      svgElement.style.transform = `scale(${newZoom})`;
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(currentZoom - 0.1, 0.2);
    setCurrentZoom(newZoom);
    onZoomChange?.(newZoom);

    const svgElement = containerRef.current?.querySelector('svg');
    if (svgElement) {
      svgElement.style.transform = `scale(${newZoom})`;
    }
  };

  const handleResetZoom = () => {
    setCurrentZoom(1);
    onZoomChange?.(1);

    const svgElement = containerRef.current?.querySelector('svg');
    if (svgElement) {
      svgElement.style.transform = 'scale(1)';
    }
  };

  // Copy SVG to clipboard
  const handleCopySVG = async () => {
    const svgElement = containerRef.current?.querySelector('svg');
    if (svgElement) {
      try {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        await navigator.clipboard.writeText(svgString);
      } catch (error) {
        console.error('Failed to copy SVG:', error);
      }
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: MermaidDesignTokens.colors.glass.primary,
      borderRadius: MermaidDesignTokens.borderRadius.xl,
      overflow: 'hidden'
    }}>
      {/* Preview Toolbar */}
      <GlassPanel variant="elevated" padding="2" style={{
        borderRadius: 0,
        borderBottom: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: MermaidDesignTokens.spacing[2]
      }}>
        {/* Left side - View controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: MermaidDesignTokens.spacing[2] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: MermaidDesignTokens.spacing[1] }}>
            <GlassButton
              variant="ghost"
              size="sm"
              icon={<ZoomOut size={16} />}
              onClick={handleZoomOut}
              disabled={currentZoom <= 0.2}
              title="Zoom Out"
            />
            <span style={{
              fontSize: MermaidDesignTokens.typography.fontSize.sm,
              color: MermaidDesignTokens.colors.text.secondary,
              minWidth: '60px',
              textAlign: 'center'
            }}>
              {Math.round(currentZoom * 100)}%
            </span>
            <GlassButton
              variant="ghost"
              size="sm"
              icon={<ZoomIn size={16} />}
              onClick={handleZoomIn}
              disabled={currentZoom >= 3}
              title="Zoom In"
            />
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={handleResetZoom}
              title="Reset Zoom (100%)"
              style={{ fontSize: MermaidDesignTokens.typography.fontSize.xs }}
            >
              1:1
            </GlassButton>
          </div>

          <div style={{
            width: '1px',
            height: '24px',
            background: MermaidDesignTokens.colors.glass.border
          }} />

          <GlassButton
            variant={showGrid ? "primary" : "ghost"}
            size="sm"
            icon={<Grid3X3 size={16} />}
            onClick={() => setShowGrid(!showGrid)}
            title={showGrid ? "Hide Grid" : "Show Grid"}
          />
        </div>

        {/* Right side - Export controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: MermaidDesignTokens.spacing[2] }}>
          <GlassButton
            variant="ghost"
            size="sm"
            icon={<Copy size={16} />}
            onClick={handleCopySVG}
            title="Copy SVG"
          />

          {onExport && (
            <>
              <GlassButton
                variant="ghost"
                size="sm"
                icon={<Download size={16} />}
                onClick={() => onExport('svg')}
                title="Export as SVG"
              />
              <GlassButton
                variant="secondary"
                size="sm"
                icon={<Download size={16} />}
                onClick={() => onExport('png')}
                title="Export as PNG"
              />
            </>
          )}
        </div>
      </GlassPanel>

      {/* Preview Container */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'auto',
        background: showGrid ?
          `radial-gradient(circle, ${MermaidDesignTokens.colors.glass.border} 1px, transparent 1px)` :
          'transparent',
        backgroundSize: showGrid ? '20px 20px' : 'auto'
      }}>
        {/* Loading Overlay */}
        {(isLoading || isRendering) && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              color: MermaidDesignTokens.colors.text.primary,
              fontSize: MermaidDesignTokens.typography.fontSize.lg,
              display: 'flex',
              alignItems: 'center',
              gap: MermaidDesignTokens.spacing[2]
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid transparent',
                borderTop: '2px solid currentColor',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Rendering diagram...
            </div>
          </div>
        )}

        {/* Diagram Container */}
        <div
          ref={containerRef}
          style={{
            padding: MermaidDesignTokens.spacing[4],
            minHeight: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />

        {/* Empty State */}
        {!diagramText.trim() && !isLoading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: MermaidDesignTokens.colors.text.secondary
          }}>
            <Eye size={48} style={{ opacity: 0.3, marginBottom: MermaidDesignTokens.spacing[4] }} />
            <h3 style={{
              margin: 0,
              fontSize: MermaidDesignTokens.typography.fontSize.lg,
              fontWeight: MermaidDesignTokens.typography.fontWeight.medium
            }}>
              Start Your Diagram
            </h3>
            <p style={{
              margin: `${MermaidDesignTokens.spacing[2]} 0 0 0`,
              fontSize: MermaidDesignTokens.typography.fontSize.sm
            }}>
              Write Mermaid code in the editor to see your diagram here
            </p>
          </div>
        )}
      </div>

      {/* Add CSS for loading animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MermaidPreviewPane;
