/**
 * Mermaid Diagram Viewer - Display Only
 * Following official Mermaid approach: render and display, no editing
 */

import React, { useRef, useEffect, useState } from 'react';
import { GlassButton } from '../ui/glassmorphic/GlassButton';
import { ZoomIn, ZoomOut, RotateCcw, Download, Maximize2 } from 'lucide-react';

interface MermaidViewerProps {
  diagramText: string;
  isRendering?: boolean;
  onExport?: (format: string) => void;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({
  diagramText,
  isRendering = false,
  onExport
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Render diagram using Mermaid
  const renderDiagram = async () => {
    if (!containerRef.current || !diagramText.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Import Mermaid dynamically
      const mermaid = (await import('mermaid')).default;

      // Initialize Mermaid with AuditReady theme
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          primaryColor: '#3b82f6',
          primaryTextColor: '#f8fafc',
          primaryBorderColor: '#1e40af',
          lineColor: '#64748b',
          sectionBkgColor: '#1e293b',
          altSectionBkgColor: '#334155',
          gridColor: '#475569',
          secondaryColor: '#06b6d4',
          tertiaryColor: '#8b5cf6'
        },
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis'
        },
        securityLevel: 'loose',
        deterministicIds: true,
        maxTextSize: 50000
      });

      // Generate unique ID
      const diagramId = `mermaid-viewer-${Date.now()}`;

      // Validate and render
      await mermaid.parse(diagramText);
      const { svg } = await mermaid.render(diagramId, diagramText);

      // Insert SVG into container
      containerRef.current.innerHTML = svg;

      // Apply custom styling
      const svgElement = containerRef.current.querySelector('svg');
      if (svgElement) {
        svgElement.style.maxWidth = '100%';
        svgElement.style.height = 'auto';
        svgElement.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';

        // Apply zoom
        svgElement.style.transform = `scale(${zoom})`;
        svgElement.style.transformOrigin = 'top left';
      }

      console.log('✅ Diagram rendered successfully');
    } catch (error) {
      console.error('❌ Failed to render diagram:', error);
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
            font-family: Inter, sans-serif;
            margin: 20px;
          ">
            <h3 style="margin: 0 0 8px 0; color: #fecaca;">⚠️ Diagram Error</h3>
            <p style="margin: 0 0 16px 0; font-size: 14px;">${(error as Error).message}</p>
            <p style="margin: 0; font-size: 12px; opacity: 0.7;">
              Check your Mermaid syntax and try again.
            </p>
          </div>
        `;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Re-render when diagram text changes
  useEffect(() => {
    renderDiagram();
  }, [diagramText]);

  // Re-apply zoom when zoom changes
  useEffect(() => {
    if (containerRef.current) {
      const svgElement = containerRef.current.querySelector('svg');
      if (svgElement) {
        svgElement.style.transform = `scale(${zoom})`;
      }
    }
  }, [zoom]);

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.2));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  // Export functionality
  const handleExport = (format: string) => {
    if (!containerRef.current) return;

    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    try {
      if (format === 'svg') {
        // Export as SVG
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `diagram-${Date.now()}.svg`;
        link.click();

        URL.revokeObjectURL(url);
      } else if (format === 'png') {
        // Export as PNG
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          canvas.width = img.width * 2; // 2x scale for better quality
          canvas.height = img.height * 2;
          ctx?.scale(2, 2);
          ctx?.drawImage(img, 0, 0);

          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `diagram-${Date.now()}.png`;
              link.click();
              URL.revokeObjectURL(url);
            }
          }, 'image/png');
        };

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        img.src = URL.createObjectURL(blob);
      }

      console.log(`✅ Exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error(`❌ Failed to export as ${format}:`, error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Viewer Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Zoom: {Math.round(zoom * 100)}%</span>
          <GlassButton
            variant="secondary"
            size="sm"
            icon={<ZoomOut size={16} />}
            onClick={handleZoomOut}
            disabled={zoom <= 0.2}
          />
          <GlassButton
            variant="secondary"
            size="sm"
            icon={<ZoomIn size={16} />}
            onClick={handleZoomIn}
            disabled={zoom >= 3}
          />
          <GlassButton
            variant="secondary"
            size="sm"
            icon={<RotateCcw size={16} />}
            onClick={handleResetZoom}
          >
            Reset
          </GlassButton>
        </div>

        <div className="flex items-center gap-2">
          <GlassButton
            variant="secondary"
            size="sm"
            icon={<Download size={16} />}
            onClick={() => handleExport('svg')}
          >
            SVG
          </GlassButton>
          <GlassButton
            variant="secondary"
            size="sm"
            icon={<Download size={16} />}
            onClick={() => handleExport('png')}
          >
            PNG
          </GlassButton>
        </div>
      </div>

      {/* Diagram Container */}
      <div className="flex-1 overflow-auto bg-gray-900 relative">
        {(isLoading || isRendering) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-400">Rendering diagram...</p>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          className="p-4 min-h-full flex items-center justify-center"
          style={{
            transformOrigin: 'top left',
            transition: 'transform 0.2s ease'
          }}
        />
      </div>

      {/* Status */}
      {error && (
        <div className="p-2 bg-red-900 border-t border-red-700 text-red-200 text-sm">
          Error: {error}
        </div>
      )}
    </div>
  );
};
