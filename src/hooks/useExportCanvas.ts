import { useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { toPng, toSvg } from 'html-to-image';

interface UseExportCanvasOptions {
  nodes: Node[];
  edges: Edge[];
  projectName?: string;
}

interface ToastOptions {
  type: 'loading' | 'success' | 'error';
  title: string;
  message: string;
  icon?: string;
  duration?: number;
}

export const useExportCanvas = ({ nodes, edges, projectName }: UseExportCanvasOptions) => {
  // Toast notification system
  const showToast = useCallback(({ type, title, message, icon, duration = 4000 }: ToastOptions) => {
    const gradients = {
      loading: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      success: 'linear-gradient(135deg, #10b981, #059669)',
      error: 'linear-gradient(135deg, #ef4444, #dc2626)'
    };

    const defaultIcons = {
      loading: '⏳',
      success: '✅',
      error: '❌'
    };

    const toast = document.createElement('div');
    toast.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${gradients[type]};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 600;
        box-shadow: 0 10px 25px ${type === 'loading' ? 'rgba(139, 92, 246, 0.3)' : type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 24px; ${type === 'loading' ? 'animation: spin 1s linear infinite;' : ''}">${icon || defaultIcons[type]}</div>
          <div>
            <div style="font-size: 16px; ${message ? 'margin-bottom: 4px;' : ''}">${title}</div>
            ${message ? `<div style="font-size: 14px; opacity: 0.9;">${message}</div>` : ''}
          </div>
        </div>
      </div>
    `;

    // Add animation styles if not already present
    if (!document.querySelector('#export-toast-styles')) {
      const style = document.createElement('style');
      style.id = 'export-toast-styles';
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Auto-remove toast after duration
    const removeToast = () => {
      if (toast.parentNode) {
        const toastElement = toast.firstElementChild as HTMLElement;
        if (toastElement) {
          toastElement.style.animation = 'slideOutRight 0.3s ease-in';
          setTimeout(() => toast.remove(), 300);
        } else {
          toast.remove();
        }
      }
    };

    if (type !== 'loading') {
      setTimeout(removeToast, duration);
    }

    return removeToast;
  }, []);

  // Export to JSON format
  const exportToJSON = useCallback(async () => {
    console.log('🔥 EXPORT JSON - exportToJSON called');
    
    const diagramData = {
      nodes,
      edges,
      projectName: projectName || 'Untitled Diagram',
      timestamp: new Date().toISOString()
    };
    
    const fileName = `${diagramData.projectName.replace(/\s+/g, '_')}`;
    
    try {
      const dataStr = JSON.stringify(diagramData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      console.log('📁 Exported as JSON:', { fileName: `${fileName}.json`, size: dataStr.length });
      
      // Show success toast
      const exportTime = new Date().toLocaleTimeString();
      showToast({
        type: 'success',
        title: 'Export Successful!',
        message: `📄 ${fileName}.json<br>📦 ${(dataStr.length / 1024).toFixed(1)} KB • ${diagramData.nodes.length} shapes<br>⏰ ${exportTime}`,
        icon: '📁'
      });
      
      return true;
    } catch (error) {
      console.error('❌ JSON Export failed:', error);
      showToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Could not export JSON file'
      });
      return false;
    }
  }, [nodes, edges, projectName, showToast]);

  // Export to PNG or SVG format
  const exportToImage = useCallback(async (format: 'png' | 'svg' = 'png') => {
    console.log('🔥 EXPORT IMAGE - exportToImage called with format:', format);
    
    const fileName = `${(projectName || 'Untitled Diagram').replace(/\s+/g, '_')}`;
    
    try {
      // Find the ReactFlow canvas element - look for the main viewport
      const reactFlowElement = document.querySelector('.react-flow__viewport') || 
                               document.querySelector('.react-flow') || 
                               document.querySelector('.react-flow__renderer');
      if (!reactFlowElement) {
        throw new Error('ReactFlow canvas not found');
      }

      // Show loading toast
      const removeLoadingToast = showToast({
        type: 'loading',
        title: 'Exporting Canvas...',
        message: `Capturing ${format.toUpperCase()} image`
      });

      // Auto-fit to content bounds - calculate bounding box of all nodes
      const nodeBounds = nodes.reduce((bounds, node) => {
        const x = node.position.x;
        const y = node.position.y;
        const width = node.width || 150; // Default width
        const height = node.height || 40; // Default height
        
        return {
          minX: Math.min(bounds.minX, x),
          minY: Math.min(bounds.minY, y),
          maxX: Math.max(bounds.maxX, x + width),
          maxY: Math.max(bounds.maxY, y + height)
        };
      }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });

      // Add padding around content
      const padding = 100;
      const contentWidth = Math.max(800, nodeBounds.maxX - nodeBounds.minX + padding * 2);
      const contentHeight = Math.max(600, nodeBounds.maxY - nodeBounds.minY + padding * 2);

      // Get the main ReactFlow element and temporarily adjust its size for export
      const mainReactFlowElement = document.querySelector('.react-flow') as HTMLElement;
      if (!mainReactFlowElement) {
        throw new Error('ReactFlow element not found');
      }

      // Store original styles
      const originalStyle = {
        width: mainReactFlowElement.style.width,
        height: mainReactFlowElement.style.height,
        transform: mainReactFlowElement.style.transform
      };

      // Temporarily adjust the viewport to fit all content
      mainReactFlowElement.style.width = `${contentWidth}px`;
      mainReactFlowElement.style.height = `${contentHeight}px`;

      // Get the viewport element and adjust its transform to show all content
      const viewport = mainReactFlowElement.querySelector('.react-flow__viewport') as HTMLElement;
      if (viewport) {
        // Calculate the transform to center all content
        const offsetX = -nodeBounds.minX + padding;
        const offsetY = -nodeBounds.minY + padding;
        viewport.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(1)`;
      }

      // SMART APPROACH: Remove only background rectangles, keep text labels
      const backgroundRects = mainReactFlowElement.querySelectorAll(`
        .react-flow__edge-textbg, 
        .react-flow__edge rect,
        .react-flow__edge-textwrapper rect,
        [class*="textbg"] rect
      `);
      const removedElements: { element: HTMLElement, child: HTMLElement }[] = [];
      const edgeTexts = mainReactFlowElement.querySelectorAll('.react-flow__edge text, .react-flow__edge-text');
      
      // Remove only the background rectangles that cause black boxes
      backgroundRects.forEach(el => {
        const parentElement = el.parentElement;
        if (parentElement && el.tagName.toLowerCase() === 'rect') {
          removedElements.push({ element: parentElement, child: el as HTMLElement });
          parentElement.removeChild(el);
        }
      });
      
      // Style remaining text elements to have white text shadow for visibility
      edgeTexts.forEach(el => {
        (el as HTMLElement).style.textShadow = '1px 1px 3px rgba(255, 255, 255, 0.8)';
        (el as HTMLElement).style.fill = '#1e293b';
        (el as HTMLElement).style.fontWeight = '600';
      });
      
      // Add exporting class to hide any remaining artifacts
      mainReactFlowElement.classList.add('exporting');
      document.body.classList.add('exporting');
      
      // Wait for DOM updates
      await new Promise(resolve => setTimeout(resolve, 200));

      // Capture the full canvas
      const exportFunction = format === 'png' ? toPng : toSvg;
      const dataUrl = await exportFunction(mainReactFlowElement, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: contentWidth,
        height: contentHeight,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        },
        filter: (node) => {
          // Include background, nodes, and edges, but exclude UI controls
          if (node.classList) {
            return !node.classList.contains('react-flow__controls') && 
                   !node.classList.contains('react-flow__minimap') &&
                   !node.classList.contains('react-flow__panel') &&
                   !node.classList.contains('react-flow__attribution') &&
                   !node.hasAttribute('data-floating-ui-portal') &&
                   !node.closest('[data-floating-ui-portal]');
          }
          return true;
        }
      });

      // Restore all removed background rectangles
      removedElements.forEach(({ element, child }) => {
        element.appendChild(child);
      });
      
      // Restore original text styling
      edgeTexts.forEach(el => {
        (el as HTMLElement).style.textShadow = '';
        (el as HTMLElement).style.fill = '';
        (el as HTMLElement).style.fontWeight = '';
      });
      
      // Remove exporting class
      mainReactFlowElement.classList.remove('exporting');
      document.body.classList.remove('exporting');
      
      // Restore original styles
      mainReactFlowElement.style.width = originalStyle.width;
      mainReactFlowElement.style.height = originalStyle.height;
      mainReactFlowElement.style.transform = originalStyle.transform;
      if (viewport) {
        // Reset viewport transform
        viewport.style.transform = '';
      }

      // Remove loading toast
      removeLoadingToast();

      // Create download link
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${fileName}.${format}`;
      link.click();

      console.log('✅ Successfully exported as', format.toUpperCase());

      // Show success toast
      showToast({
        type: 'success',
        title: 'Export Successful!',
        message: `💾 ${fileName}.${format}<br>📐 Canvas exported as ${format.toUpperCase()}`
      });

      return true;

    } catch (error) {
      console.error('❌ Image Export failed:', error);
      
      showToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Could not capture canvas'
      });
      
      return false;
    }
  }, [nodes, projectName, showToast]);

  // Main export handler
  const handleExport = useCallback(async (format: 'png' | 'svg' | 'json' = 'png') => {
    console.log('🔥 EXPORT BUTTON CLICKED - handleExport called with format:', format);
    
    if (format === 'json') {
      return await exportToJSON();
    } else {
      return await exportToImage(format);
    }
  }, [exportToJSON, exportToImage]);

  return {
    handleExport,
    exportToJSON,
    exportToImage,
    showToast
  };
};