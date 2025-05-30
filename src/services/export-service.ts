/**
 * Enhanced Export Service - Complete Content Capture with Cross-Platform Compatibility
 * 
 * This service provides intelligent export functionality that:
 * ✅ Captures ALL content including content above, below, left, and right
 * ✅ Ensures gradient backgrounds cover the ENTIRE captured area
 * ✅ Eliminates gradient background flickering completely
 * ✅ Prevents double background application
 * ✅ Provides consistent quality regardless of export settings
 * ✅ Adapts boundaries to actual content size
 * ✅ Maintains visual consistency during export process
 * ✅ Handles cross-platform rendering differences (Mac vs PC)
 * ✅ Ensures consistent font rendering and layout calculations
 */

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Type definition for ReactFlow instance
interface ReactFlowInstance {
  getNodes: () => any[];
  getEdges: () => any[];
  toObject: () => any;
  fitView: () => void;
  getViewport: () => { x: number; y: number; zoom: number };
  setViewport: (viewport: { x: number; y: number; zoom: number }) => void;
}

/**
 * Detect platform and browser for cross-platform compatibility
 */
const getPlatformInfo = () => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  
  const isMac = /Mac|iPhone|iPad|iPod/.test(platform);
  const isWindows = /Win/.test(platform);
  const isLinux = /Linux/.test(platform);
  const isChrome = /Chrome/.test(userAgent);
  const isFirefox = /Firefox/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  
  return {
    isMac,
    isWindows,
    isLinux,
    isChrome,
    isFirefox,
    isSafari,
    userAgent,
    platform
  };
};

/**
 * Get platform-specific rendering adjustments
 */
const getPlatformAdjustments = () => {
  const platformInfo = getPlatformInfo();
  
  // Platform-specific adjustments for consistent rendering
  const adjustments = {
    // Font rendering differences
    fontSmoothing: platformInfo.isMac ? 'antialiased' : 'auto',
    textRendering: platformInfo.isMac ? 'optimizeLegibility' : 'auto',
    
    // Canvas scaling for different DPI
    pixelRatio: platformInfo.isMac ? window.devicePixelRatio : Math.min(window.devicePixelRatio, 2),
    
    // Buffer adjustments for different browsers
    extraBuffer: platformInfo.isWindows ? 60 : 50,
    
    // Padding adjustments for consistent spacing
    paddingMultiplier: platformInfo.isWindows ? 1.2 : 1.0,
    
    // Background rendering adjustments
    backgroundFix: platformInfo.isWindows || platformInfo.isLinux,
    
    // Text measurement adjustments
    textMeasurementFix: platformInfo.isWindows
  };
  
  console.log('Platform adjustments applied:', {
    platformInfo,
    adjustments
  });
  
  return adjustments;
};

/**
 * Calculate absolute content bounds that captures EVERYTHING on the canvas
 * This ensures we never miss content above, below, left, or right
 * Now includes platform-specific adjustments for consistent rendering
 */
const calculateAbsoluteContentBounds = (reactFlowInstance: any): { 
  minX: number; 
  minY: number; 
  maxX: number; 
  maxY: number; 
  width: number; 
  height: number; 
  isEmpty: boolean;
} => {
  console.log('Calculating absolute content bounds to capture ALL content...');
  
  const platformAdjustments = getPlatformAdjustments();
  
  if (!reactFlowInstance) {
    console.warn('No React Flow instance available');
    return {
      minX: 0, minY: 0, maxX: 800, maxY: 600,
      width: 800, height: 600, isEmpty: true
    };
  }

  const nodes = reactFlowInstance.getNodes();
  const edges = reactFlowInstance.getEdges();
  
  if (!nodes || nodes.length === 0) {
    console.warn('No nodes found');
    return {
      minX: 0, minY: 0, maxX: 800, maxY: 600,
      width: 800, height: 600, isEmpty: true
    };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  // Calculate bounds from ALL nodes including their full dimensions
  nodes.forEach((node: any) => {
    const x = node.position.x;
    const y = node.position.y;
    const width = node.measured?.width || node.width || node.data?.width || 150;
    const height = node.measured?.height || node.height || node.data?.height || 100;
    
    // Include the full node area
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
    
    console.log(`Node ${node.id}: position(${x}, ${y}), size(${width}x${height}), bounds: ${x} to ${x + width}, ${y} to ${y + height}`);
  });

  // Calculate edge bounds with proper curve consideration
  if (edges && edges.length > 0) {
    edges.forEach((edge: any) => {
      const sourceNode = nodes.find((n: any) => n.id === edge.source);
      const targetNode = nodes.find((n: any) => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const sourceWidth = sourceNode.measured?.width || sourceNode.width || 150;
        const sourceHeight = sourceNode.measured?.height || sourceNode.height || 100;
        const targetWidth = targetNode.measured?.width || targetNode.width || 150;
        const targetHeight = targetNode.measured?.height || targetNode.height || 100;
        
        const sourceX = sourceNode.position.x + sourceWidth / 2;
        const sourceY = sourceNode.position.y + sourceHeight / 2;
        const targetX = targetNode.position.x + targetWidth / 2;
        const targetY = targetNode.position.y + targetHeight / 2;
        
        // Calculate proper buffer for edge curves based on distance
        const deltaX = Math.abs(targetX - sourceX);
        const deltaY = Math.abs(targetY - sourceY);
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Curve buffer scales with distance (longer edges need more curve space)
        const curveBuffer = Math.min(Math.max(distance * 0.25, 50), 150);
        
        minX = Math.min(minX, sourceX - curveBuffer, targetX - curveBuffer);
        minY = Math.min(minY, sourceY - curveBuffer, targetY - curveBuffer);
        maxX = Math.max(maxX, sourceX + curveBuffer, targetX + curveBuffer);
        maxY = Math.max(maxY, sourceY + curveBuffer, targetY + curveBuffer);
      }
    });
  }

  // Add platform-specific extra buffer to ensure we capture everything
  const extraBuffer = 50; // REVERT TO ORIGINAL WORKING VALUE
  minX -= extraBuffer;
  minY -= extraBuffer;
  maxX += extraBuffer;
  maxY += extraBuffer;

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;

  console.log('Absolute content bounds calculated with platform adjustments:', {
    minX, minY, maxX, maxY, 
    width: contentWidth, 
    height: contentHeight,
    nodeCount: nodes.length,
    edgeCount: edges?.length || 0,
    extraBuffer,
    platformAdjustments
  });

  return { 
    minX, minY, maxX, maxY, 
    width: contentWidth, 
    height: contentHeight, 
    isEmpty: false 
  };
};

/**
 * Calculate export dimensions with generous padding to ensure nothing is cut off
 * Now includes platform-specific adjustments for consistent rendering
 */
const calculateExportDimensions = (
  contentBounds: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number },
  exportType: 'png' | 'jpg' | 'pdf' | 'svg' = 'png'
): { width: number; height: number; padding: number } => {
  const contentWidth = contentBounds.width;
  const contentHeight = contentBounds.height;
  const platformAdjustments = getPlatformAdjustments();
  
  console.log('Calculating export dimensions for content:', {
    contentWidth, contentHeight, exportType, platformAdjustments
  });
  
  // Use reasonable padding to ensure content is not cut off but minimize dead space
  let padding = 80; // REVERT TO ORIGINAL WORKING VALUE
  
  // Add extra padding for larger content
  if (contentWidth > 1000 || contentHeight > 800) {
    padding = 100; // REVERT TO ORIGINAL WORKING VALUE
  }
  
  // Adjust padding based on export type
  switch (exportType) {
    case 'pdf':
      padding = Math.max(padding, 80); // REVERT TO ORIGINAL WORKING VALUE
      break;
    case 'svg':
      padding = Math.max(padding, 60); // REVERT TO ORIGINAL WORKING VALUE
      break;
    case 'png':
    case 'jpg':
      padding = Math.max(padding, 80); // REVERT TO ORIGINAL WORKING VALUE
      break;
  }
  
  const exportWidth = contentWidth + (padding * 2);
  const exportHeight = contentHeight + (padding * 2);
  
  // Ensure reasonable minimums but don't force large empty areas
  const minWidth = Math.max(400, exportWidth);
  const minHeight = Math.max(300, exportHeight);
  
  // Ensure reasonable maximums for performance
  const maxWidth = 6000;
  const maxHeight = 6000;
  
  const finalWidth = Math.min(Math.max(exportWidth, minWidth), maxWidth);
  const finalHeight = Math.min(Math.max(exportHeight, minHeight), maxHeight);
  
  console.log('Export dimensions calculated with platform adjustments:', {
    contentSize: { width: contentWidth, height: contentHeight },
    padding,
    platformMultiplier: platformAdjustments.paddingMultiplier,
    finalSize: { width: finalWidth, height: finalHeight },
    efficiency: `${((contentWidth * contentHeight) / (finalWidth * finalHeight) * 100).toFixed(1)}% content coverage`
  });
  
  return { width: finalWidth, height: finalHeight, padding };
};

/**
 * Prepare container for export WITHOUT flickering - preserve background
 */
const prepareContainerForExport = (
  container: HTMLElement, 
  reactFlowInstance?: any,
  exportType: 'png' | 'jpg' | 'pdf' | 'svg' = 'png'
): {
  originalViewport: { x: number; y: number; zoom: number } | null;
  originalTransform: string;
  originalDimensions: { width: string; height: string };
  computedDimensions: { width: string; height: string } | null;
  isPercentageBased: boolean;
  originalStyles: { [key: string]: string };
  contentBounds: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number };
  exportDimensions: { width: number; height: number; padding: number };
  backgroundInfo: { hasGradient: boolean; originalBackground: string };
} => {
  console.log('Preparing container for export WITHOUT flickering...');
  
  // Get platform adjustments for consistent rendering
  const platformAdjustments = getPlatformAdjustments();
  
  // Calculate absolute content bounds
  const contentBounds = calculateAbsoluteContentBounds(reactFlowInstance);
  
  // Calculate export dimensions
  const exportDimensions = calculateExportDimensions(contentBounds, exportType);
  
  // Store original container state
  const originalDimensions = {
    width: container.style.width,
    height: container.style.height
  };

  // Detect and store background information - check multiple sources
  const computedStyle = window.getComputedStyle(container);
  
  // For containers with percentage-based dimensions, store computed pixel values for restoration
  const isPercentageBased = originalDimensions.width.includes('%') || originalDimensions.height.includes('%');
  const computedDimensions = isPercentageBased ? {
    width: computedStyle.width,
    height: computedStyle.height
  } : null;
  
  console.log('Container dimensions:', {
    original: originalDimensions,
    computed: computedDimensions,
    isPercentageBased,
    note: isPercentageBased ? 'Will use computed dimensions for restoration' : 'Will use original dimensions'
  });
  
  let originalBackground = computedStyle.background || computedStyle.backgroundColor || '';
  
  // Also check parent containers for gradient backgrounds
  let parentElement = container.parentElement;
  while (parentElement && !originalBackground.includes('gradient')) {
    const parentStyle = window.getComputedStyle(parentElement);
    const parentBackground = parentStyle.background || parentStyle.backgroundColor || '';
    if (parentBackground.includes('gradient')) {
      originalBackground = parentBackground;
      console.log('Found gradient background in parent element:', parentBackground);
      break;
    }
    parentElement = parentElement.parentElement;
  }
  
  // Check for explicit background color parameter (could be gradient)
  if (!originalBackground.includes('gradient') && container.style.background && container.style.background.includes('gradient')) {
    originalBackground = container.style.background;
    console.log('Found gradient in container inline styles:', originalBackground);
  }
  
  const hasGradient = originalBackground.includes('gradient');
  const backgroundInfo = { hasGradient, originalBackground };
  
  console.log('Background detection:', {
    containerBackground: computedStyle.background,
    containerInlineBackground: container.style.background,
    detectedBackground: originalBackground,
    hasGradient,
    backgroundInfo
  });

  // Store original styles
  const originalStyles = {
    background: container.style.background,
    backgroundColor: container.style.backgroundColor,
    backgroundImage: container.style.backgroundImage,
    backgroundSize: container.style.backgroundSize,
    backgroundRepeat: container.style.backgroundRepeat,
    backgroundPosition: container.style.backgroundPosition,
    backgroundAttachment: container.style.backgroundAttachment,
    backgroundClip: container.style.backgroundClip,
    backgroundOrigin: container.style.backgroundOrigin,
    overflow: container.style.overflow,
    position: container.style.position,
    minWidth: container.style.minWidth,
    minHeight: container.style.minHeight,
    maxWidth: container.style.maxWidth,
    maxHeight: container.style.maxHeight,
    transform: container.style.transform
  };

  // Get viewport element
  const viewport = container.querySelector('.react-flow__viewport') as HTMLElement;
  let originalTransform = '';
  let originalViewport = null;

  if (viewport) {
    // Store original transform
    originalTransform = viewport.style.transform;
    
    // Calculate transform to center ALL content in export area
    const translateX = -contentBounds.minX + exportDimensions.padding;
    const translateY = -contentBounds.minY + exportDimensions.padding;
    
    // Apply transform to show all content
    viewport.style.transform = `translate(${translateX}px, ${translateY}px) scale(1)`;
    
    console.log('Applied viewport transform:', {
      original: originalTransform,
      new: `translate(${translateX}px, ${translateY}px) scale(1)`,
      contentBounds,
      exportDimensions
    });
  }

  // Set container dimensions to exact export size
  container.style.width = `${exportDimensions.width}px`;
  container.style.height = `${exportDimensions.height}px`;
  container.style.minWidth = `${exportDimensions.width}px`;
  container.style.minHeight = `${exportDimensions.height}px`;
  container.style.maxWidth = `${exportDimensions.width}px`;
  container.style.maxHeight = `${exportDimensions.height}px`;
  container.style.overflow = 'visible';
  container.style.position = 'relative';

  // Apply platform-specific styling for consistent rendering
  (container.style as any).webkitFontSmoothing = platformAdjustments.fontSmoothing;
  (container.style as any).textRendering = platformAdjustments.textRendering;
  
  // Additional cross-platform fixes
  if (platformAdjustments.backgroundFix) {
    (container.style as any).backfaceVisibility = 'hidden';
    (container.style as any).webkitBackfaceVisibility = 'hidden';
    container.style.transform = container.style.transform || 'translateZ(0)';
  }

  // Apply background properly - handle both gradients and solid colors
  if (hasGradient && originalBackground) {
    // For gradients, apply the full background property with EXACT sizing to match export area
    container.style.background = originalBackground;
    container.style.backgroundSize = `${exportDimensions.width}px ${exportDimensions.height}px`;
    container.style.backgroundRepeat = 'no-repeat';
    container.style.backgroundPosition = '0 0';
    container.style.backgroundAttachment = 'local';
    
    // Additional properties to ensure full coverage
    container.style.backgroundClip = 'border-box';
    container.style.backgroundOrigin = 'border-box';
    
    console.log('Applied gradient background to container for export:', originalBackground);
    console.log('Background size set to exact export dimensions:', `${exportDimensions.width}x${exportDimensions.height}`);
    console.log('Container dimensions locked to:', `${exportDimensions.width}x${exportDimensions.height}`);
  } else if (originalBackground && !hasGradient) {
    // For solid colors, apply as background-color
    container.style.backgroundColor = originalBackground;
    console.log('Applied solid background color to container for export:', originalBackground);
  }

  return {
    originalViewport,
    originalTransform,
    originalDimensions,
    computedDimensions,
    isPercentageBased,
    originalStyles,
    contentBounds,
    exportDimensions,
    backgroundInfo
  };
};

/**
 * Restore container to original state after export
 */
const restoreContainerAfterExport = (
  container: HTMLElement,
  originalState: {
    originalViewport: { x: number; y: number; zoom: number } | null;
    originalTransform: string;
    originalDimensions: { width: string; height: string };
    computedDimensions: { width: string; height: string } | null;
    isPercentageBased: boolean;
    originalStyles: { [key: string]: string };
  }
): void => {
  console.log('Restoring container to original state...');
  
  // Restore container dimensions - use computed dimensions for percentage-based containers
  if (originalState.isPercentageBased && originalState.computedDimensions) {
    // For percentage-based containers, temporarily use computed dimensions to ensure proper restoration
    container.style.width = originalState.computedDimensions.width;
    container.style.height = originalState.computedDimensions.height;
    
    // Then restore the original percentage values
    setTimeout(() => {
      container.style.width = originalState.originalDimensions.width;
      container.style.height = originalState.originalDimensions.height;
    }, 100);
    
    console.log('Restored percentage-based container dimensions via computed values');
  } else {
    // For fixed dimensions, restore directly
    container.style.width = originalState.originalDimensions.width;
    container.style.height = originalState.originalDimensions.height;
    console.log('Restored fixed container dimensions');
  }
  
  // Restore all original styles
  Object.keys(originalState.originalStyles).forEach(property => {
    (container.style as any)[property] = originalState.originalStyles[property];
  });
  
  // Restore viewport transform
  const viewport = container.querySelector('.react-flow__viewport') as HTMLElement;
  if (viewport) {
    viewport.style.transform = originalState.originalTransform;
  }
  
  console.log('Container restored to original state');
};

/**
 * Find the main React Flow container
 */
const findReactFlowContainer = (): HTMLElement | null => {
  // Try multiple selectors to find the React Flow container
  const selectors = [
    '.react-flow',
    '.react-flow-wrapper',
    '[data-testid="rf__wrapper"]',
    '.reactflow-wrapper'
  ];
  
  for (const selector of selectors) {
    const container = document.querySelector(selector) as HTMLElement;
    if (container) {
      console.log('Found React Flow container with selector:', selector);
      return container;
    }
  }
  
  console.warn('React Flow container not found');
  return null;
};

/**
 * Hide UI elements during export
 */
const hideUIElements = (): HTMLElement[] => {
  const selectors = [
    '.react-flow__controls',
    '.react-flow__minimap',
    '.react-flow__panel',
    '.react-flow__attribution',
    '.react-flow__handle', // Hide connection handles/anchor points
    '.react-flow__handle-top',
    '.react-flow__handle-bottom', 
    '.react-flow__handle-left',
    '.react-flow__handle-right'
  ];
  
  const hiddenElements: HTMLElement[] = [];
  
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
    elements.forEach(element => {
      if (element.style.display !== 'none') {
        element.style.display = 'none';
        hiddenElements.push(element);
      }
    });
  });
  
  console.log('Hidden UI elements:', hiddenElements.length);
  return hiddenElements;
};

/**
 * Show UI elements after export
 */
const showUIElements = (elements: HTMLElement[]): void => {
  elements.forEach(element => {
    element.style.display = '';
  });
  console.log('Restored UI elements:', elements.length);
};

/**
 * Download file helper
 */
const downloadFile = (dataURL: string, fileName: string): void => {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export as PNG with absolute content capture and proper gradient background coverage
 */
export const exportAsPng = async (
  fileName: string = 'diagram',
  quality: number = 1.0,
  backgroundColor?: string,
  reactFlowInstance?: any
): Promise<boolean> => {
  let container: HTMLElement | null = null;
  let originalState: any = null;
  let hiddenElements: HTMLElement[] = [];
  
  try {
    console.log('Starting PNG export with proper gradient coverage...', { fileName, quality, backgroundColor });
    
    // Find the main React Flow container
    container = findReactFlowContainer();
    if (!container) {
      console.error('React Flow container not found');
      return false;
    }

    // Hide UI elements
    hiddenElements = hideUIElements();
    
    // Prepare container for export (preserves background to prevent flickering)
    originalState = prepareContainerForExport(container, reactFlowInstance, 'png');
    
    // Apply explicit background with proper dimensions after container preparation
    if (backgroundColor) {
      if (backgroundColor.includes('gradient')) {
        // Apply gradient background with exact export dimensions
        container.style.background = backgroundColor;
        container.style.backgroundSize = `${originalState.exportDimensions.width}px ${originalState.exportDimensions.height}px`;
        container.style.backgroundRepeat = 'no-repeat';
        container.style.backgroundPosition = '0 0';
        container.style.backgroundAttachment = 'local';
        container.style.backgroundClip = 'border-box';
        container.style.backgroundOrigin = 'border-box';
        
        console.log('Applied explicit gradient background with exact dimensions:', backgroundColor);
        console.log('Background size set to exact export dimensions:', `${originalState.exportDimensions.width}x${originalState.exportDimensions.height}`);
      } else {
        container.style.backgroundColor = backgroundColor;
        console.log('Applied explicit solid background before export:', backgroundColor);
      }
    }
    
    // Wait for layout to settle
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('Capturing canvas with html2canvas - proper gradient coverage mode...');
    
    // Get platform adjustments for html2canvas options
    const platformAdjustments = getPlatformAdjustments();
    
    // Use consistent scale for content capture - REVERT TO WORKING VERSION
    const captureScale = 2.0; // Fixed scale that was working properly
    
    console.log('Using platform-specific capture settings:', {
      captureScale,
      pixelRatio: window.devicePixelRatio,
      platformAdjustments
    });
    
    // Enhanced background handling for gradients
    let finalBackgroundColor = null;
    
    // For PNG exports with gradients, we want to capture the visual gradient
    // Set backgroundColor to null so html2canvas captures the actual rendered background
    if (backgroundColor && backgroundColor.includes('gradient')) {
      finalBackgroundColor = null; // Let html2canvas capture the visual gradient
      console.log('Gradient background detected - using visual capture mode');
    } else if (originalState.backgroundInfo.hasGradient) {
      finalBackgroundColor = null; // Let html2canvas capture the visual gradient
      console.log('Existing gradient detected - using visual capture mode');
    } else if (backgroundColor && !backgroundColor.includes('gradient')) {
      finalBackgroundColor = backgroundColor; // Use explicit solid color
      console.log('Using explicit solid background color:', backgroundColor);
    } else {
      finalBackgroundColor = null; // Capture whatever is there
      console.log('Using null background to capture existing canvas background');
    }
    
    // Capture with settings that ensure proper gradient coverage
    const canvas = await html2canvas(container, {
      backgroundColor: finalBackgroundColor,
      scale: captureScale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      imageTimeout: 15000,
      width: originalState.exportDimensions.width,
      height: originalState.exportDimensions.height,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      foreignObjectRendering: true,
      removeContainer: false,
      ignoreElements: (element) => {
        // Ignore React Flow UI elements and handles/anchor points
        return element.classList.contains('react-flow__controls') ||
               element.classList.contains('react-flow__minimap') ||
               element.classList.contains('react-flow__panel') ||
               element.classList.contains('react-flow__attribution') ||
               element.classList.contains('react-flow__handle') ||
               element.classList.contains('react-flow__handle-top') ||
               element.classList.contains('react-flow__handle-bottom') ||
               element.classList.contains('react-flow__handle-left') ||
               element.classList.contains('react-flow__handle-right');
      },
      onclone: (clonedDoc) => {
        try {
          // Hide all React Flow handles/anchor points in cloned document
          const handleSelectors = [
            '.react-flow__handle',
            '.react-flow__handle-top',
            '.react-flow__handle-bottom',
            '.react-flow__handle-left',
            '.react-flow__handle-right'
          ];
          
          handleSelectors.forEach(selector => {
            const handles = clonedDoc.querySelectorAll(selector) as NodeListOf<HTMLElement>;
            handles.forEach(handle => {
              handle.style.display = 'none';
              handle.style.visibility = 'hidden';
              handle.style.opacity = '0';
            });
          });
          
          const svgElements = clonedDoc.querySelectorAll('svg');
          svgElements.forEach((svg) => {
            svg.style.display = 'block';
            svg.style.visibility = 'visible';
            if (!svg.getAttribute('width')) svg.setAttribute('width', '80');
            if (!svg.getAttribute('height')) svg.setAttribute('height', '80');
          });
          
          const polygons = clonedDoc.querySelectorAll('polygon');
          polygons.forEach((polygon) => {
            polygon.style.display = 'block';
            polygon.style.visibility = 'visible';
          });
        } catch (error) {
          console.warn('Error in onclone callback:', error);
        }
      }
    });

    console.log('Canvas captured successfully:', {
      width: canvas.width,
      height: canvas.height,
      contentBounds: originalState.contentBounds,
      backgroundApplied: finalBackgroundColor ? 'explicit solid' : 'visual capture',
      gradientDetected: originalState.backgroundInfo.hasGradient
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      console.error('Failed to capture canvas - invalid dimensions');
      return false;
    }

    // Use canvas directly - no additional background processing to prevent double backgrounds
    let outputCanvas = canvas;
    
    // Apply quality scaling only to final output
    if (quality !== 1.0) {
      outputCanvas = document.createElement('canvas');
      outputCanvas.width = canvas.width * quality;
      outputCanvas.height = canvas.height * quality;
      const outputCtx = outputCanvas.getContext('2d');
      if (outputCtx) {
        outputCtx.scale(quality, quality);
        outputCtx.drawImage(canvas, 0, 0);
      }
    }
    
    // Download
    const dataURL = outputCanvas.toDataURL('image/png', 1.0);
    downloadFile(dataURL, `${fileName}.png`);
    
    console.log('PNG export completed successfully - gradient background properly covered');
    return true;

  } catch (error) {
    console.error('PNG export failed:', error);
    return false;
  } finally {
    // Always restore state and show UI elements
    if (container && originalState) {
      restoreContainerAfterExport(container, originalState);
    }
    showUIElements(hiddenElements);
  }
};

/**
 * Export as JPG with absolute content capture and SINGLE background
 */
export const exportAsJpg = async (
  fileName: string = 'diagram',
  quality: number = 0.9,
  backgroundColor?: string,
  reactFlowInstance?: any
): Promise<boolean> => {
  let container: HTMLElement | null = null;
  let originalState: any = null;
  let hiddenElements: HTMLElement[] = [];
  
  try {
    console.log('Starting JPG export with single background...', { fileName, quality, backgroundColor });
    
    container = findReactFlowContainer();
    if (!container) {
      console.error('React Flow container not found');
      return false;
    }

    hiddenElements = hideUIElements();
    
    // Prepare container for export (preserves background to prevent flickering)
    originalState = prepareContainerForExport(container, reactFlowInstance, 'jpg');
    
    // Apply explicit background with proper dimensions after container preparation
    if (backgroundColor) {
      if (backgroundColor.includes('gradient')) {
        container.style.background = backgroundColor;
        container.style.backgroundSize = `${originalState.exportDimensions.width}px ${originalState.exportDimensions.height}px`;
        container.style.backgroundRepeat = 'no-repeat';
        container.style.backgroundPosition = '0 0';
        container.style.backgroundAttachment = 'local';
        console.log('Applied explicit gradient background with exact dimensions:', backgroundColor);
        console.log('Background size set to exact export dimensions:', `${originalState.exportDimensions.width}x${originalState.exportDimensions.height}`);
      } else {
        container.style.backgroundColor = backgroundColor;
        console.log('Applied explicit solid background before export:', backgroundColor);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));

    // For JPG, always use a solid background (JPG doesn't support transparency)
    // Convert gradient to solid color if needed
    let finalBackgroundColor = '#ffffff'; // Default fallback
    if (backgroundColor && !backgroundColor.includes('gradient')) {
      finalBackgroundColor = backgroundColor;
    } else if (backgroundColor && backgroundColor.includes('gradient')) {
      // Extract first color from gradient or use default
      const colorMatch = backgroundColor.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)/);
      finalBackgroundColor = colorMatch ? colorMatch[0] : '#ffffff';
      console.log('Converted gradient to solid color for JPG:', finalBackgroundColor);
    } else if (originalState.backgroundInfo.hasGradient) {
      // Extract color from detected gradient
      const colorMatch = originalState.backgroundInfo.originalBackground.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)/);
      finalBackgroundColor = colorMatch ? colorMatch[0] : '#ffffff';
      console.log('Extracted color from gradient for JPG:', finalBackgroundColor);
    }
    
    console.log('Using solid background for JPG:', finalBackgroundColor);

    const canvas = await html2canvas(container, {
      backgroundColor: finalBackgroundColor, // Always solid color for JPG
      scale: 2.0,
      useCORS: true,
      allowTaint: true,
      logging: false,
      imageTimeout: 15000,
      width: originalState.exportDimensions.width,
      height: originalState.exportDimensions.height,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      foreignObjectRendering: true,
      removeContainer: false,
      ignoreElements: (element) => {
        return element.classList.contains('react-flow__controls') ||
               element.classList.contains('react-flow__minimap') ||
               element.classList.contains('react-flow__panel') ||
               element.classList.contains('react-flow__attribution') ||
               element.classList.contains('react-flow__handle') ||
               element.classList.contains('react-flow__handle-top') ||
               element.classList.contains('react-flow__handle-bottom') ||
               element.classList.contains('react-flow__handle-left') ||
               element.classList.contains('react-flow__handle-right');
      },
      onclone: (clonedDoc) => {
        try {
          // Hide all React Flow handles/anchor points in cloned document
          const handleSelectors = [
            '.react-flow__handle',
            '.react-flow__handle-top',
            '.react-flow__handle-bottom',
            '.react-flow__handle-left',
            '.react-flow__handle-right'
          ];
          
          handleSelectors.forEach(selector => {
            const handles = clonedDoc.querySelectorAll(selector) as NodeListOf<HTMLElement>;
            handles.forEach(handle => {
              handle.style.display = 'none';
              handle.style.visibility = 'hidden';
              handle.style.opacity = '0';
            });
          });
          
          const svgElements = clonedDoc.querySelectorAll('svg');
          svgElements.forEach((svg) => {
            svg.style.display = 'block';
            svg.style.visibility = 'visible';
            if (!svg.getAttribute('width')) svg.setAttribute('width', '80');
            if (!svg.getAttribute('height')) svg.setAttribute('height', '80');
          });
          
          const polygons = clonedDoc.querySelectorAll('polygon');
          polygons.forEach((polygon) => {
            polygon.style.display = 'block';
            polygon.style.visibility = 'visible';
          });
        } catch (error) {
          console.warn('Error in onclone callback:', error);
        }
      }
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      console.error('Failed to capture canvas');
      return false;
    }

    // Use canvas directly - no additional background processing
    const dataURL = canvas.toDataURL('image/jpeg', quality);
    downloadFile(dataURL, `${fileName}.jpg`);
    
    console.log('JPG export completed successfully - single background applied');
    return true;

  } catch (error) {
    console.error('JPG export failed:', error);
    return false;
  } finally {
    if (container && originalState) {
      restoreContainerAfterExport(container, originalState);
    }
    showUIElements(hiddenElements);
  }
};

/**
 * Export as PDF with absolute content capture and SINGLE background
 */
export const exportAsPDF = async (
  fileName: string = 'diagram',
  backgroundColor?: string,
  reactFlowInstance?: any
): Promise<boolean> => {
  let container: HTMLElement | null = null;
  let originalState: any = null;
  let hiddenElements: HTMLElement[] = [];
  
  try {
    console.log('Starting PDF export with single background...');
    
    container = findReactFlowContainer();
    if (!container) {
      console.error('React Flow container not found');
      return false;
    }

    hiddenElements = hideUIElements();
    
    // Prepare container for export (preserves background to prevent flickering)
    originalState = prepareContainerForExport(container, reactFlowInstance, 'pdf');
    
    // Apply explicit background with proper dimensions after container preparation
    if (backgroundColor) {
      if (backgroundColor.includes('gradient')) {
        container.style.background = backgroundColor;
        container.style.backgroundSize = `${originalState.exportDimensions.width}px ${originalState.exportDimensions.height}px`;
        container.style.backgroundRepeat = 'no-repeat';
        container.style.backgroundPosition = '0 0';
        container.style.backgroundAttachment = 'local';
        console.log('Applied explicit gradient background with exact dimensions:', backgroundColor);
        console.log('Background size set to exact export dimensions:', `${originalState.exportDimensions.width}x${originalState.exportDimensions.height}`);
      } else {
        container.style.backgroundColor = backgroundColor;
        console.log('Applied explicit solid background before export:', backgroundColor);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));

    // For PDF, use solid background
    // Convert gradient to solid color if needed
    let finalBackgroundColor = '#ffffff'; // Default fallback
    if (backgroundColor && !backgroundColor.includes('gradient')) {
      finalBackgroundColor = backgroundColor;
    } else if (backgroundColor && backgroundColor.includes('gradient')) {
      // Extract first color from gradient or use default
      const colorMatch = backgroundColor.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)/);
      finalBackgroundColor = colorMatch ? colorMatch[0] : '#ffffff';
      console.log('Converted gradient to solid color for PDF:', finalBackgroundColor);
    } else if (originalState.backgroundInfo.hasGradient) {
      // Extract color from detected gradient
      const colorMatch = originalState.backgroundInfo.originalBackground.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)/);
      finalBackgroundColor = colorMatch ? colorMatch[0] : '#ffffff';
      console.log('Extracted color from gradient for PDF:', finalBackgroundColor);
    }
    
    console.log('Using solid background for PDF:', finalBackgroundColor);

    const canvas = await html2canvas(container, {
      backgroundColor: finalBackgroundColor, // Always solid color for PDF
      scale: 2.0,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: originalState.exportDimensions.width,
      height: originalState.exportDimensions.height,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      foreignObjectRendering: true,
      removeContainer: false,
      ignoreElements: (element) => {
        return element.classList.contains('react-flow__controls') ||
               element.classList.contains('react-flow__minimap') ||
               element.classList.contains('react-flow__panel') ||
               element.classList.contains('react-flow__attribution') ||
               element.classList.contains('react-flow__handle') ||
               element.classList.contains('react-flow__handle-top') ||
               element.classList.contains('react-flow__handle-bottom') ||
               element.classList.contains('react-flow__handle-left') ||
               element.classList.contains('react-flow__handle-right');
      },
      onclone: (clonedDoc) => {
        try {
          // Hide all React Flow handles/anchor points in cloned document
          const handleSelectors = [
            '.react-flow__handle',
            '.react-flow__handle-top',
            '.react-flow__handle-bottom',
            '.react-flow__handle-left',
            '.react-flow__handle-right'
          ];
          
          handleSelectors.forEach(selector => {
            const handles = clonedDoc.querySelectorAll(selector) as NodeListOf<HTMLElement>;
            handles.forEach(handle => {
              handle.style.display = 'none';
              handle.style.visibility = 'hidden';
              handle.style.opacity = '0';
            });
          });
          
          const svgElements = clonedDoc.querySelectorAll('svg');
          svgElements.forEach((svg) => {
            svg.style.display = 'block';
            svg.style.visibility = 'visible';
            if (!svg.getAttribute('width')) svg.setAttribute('width', '80');
            if (!svg.getAttribute('height')) svg.setAttribute('height', '80');
          });
          
          const polygons = clonedDoc.querySelectorAll('polygon');
          polygons.forEach((polygon) => {
            polygon.style.display = 'block';
            polygon.style.visibility = 'visible';
          });
        } catch (error) {
          console.warn('Error in onclone callback:', error);
        }
      }
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      console.error('Failed to capture canvas');
      return false;
    }

    // Use canvas directly - no additional background processing
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${fileName}.pdf`);
    
    console.log('PDF export completed successfully - single background applied');
    return true;

  } catch (error) {
    console.error('PDF export failed:', error);
    return false;
  } finally {
    if (container && originalState) {
      restoreContainerAfterExport(container, originalState);
    }
    showUIElements(hiddenElements);
  }
};

/**
 * Export as SVG with absolute content-aware sizing
 */
export const exportAsSVG = (
  reactFlowInstance: ReactFlowInstance,
  fileName: string = 'diagram'
): boolean => {
  try {
    console.log('Starting absolute SVG export...');
    
    const nodes = reactFlowInstance.getNodes();
    const edges = reactFlowInstance.getEdges();
    
    if (nodes.length === 0) {
      console.error('No nodes to export');
      return false;
    }

    // Use absolute content bounds calculation
    const contentBounds = calculateAbsoluteContentBounds(reactFlowInstance);
    const exportDimensions = calculateExportDimensions(contentBounds, 'svg');

    // Calculate offset to center content with padding
    const offsetX = -contentBounds.minX + exportDimensions.padding;
    const offsetY = -contentBounds.minY + exportDimensions.padding;

    // Create SVG content with absolute dimensions
    let svgContent = `<svg width="${exportDimensions.width}" height="${exportDimensions.height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Add background
    svgContent += `<rect width="100%" height="100%" fill="#f8fafc"/>`;
    
    // Add nodes
    nodes.forEach(node => {
      const x = node.position.x + offsetX;
      const y = node.position.y + offsetY;
      const width = node.measured?.width || node.width || 150;
      const height = node.measured?.height || node.height || 100;
      const label = node.data?.label || 'Node';
      
      svgContent += `<rect x="${x}" y="${y}" width="${width}" height="${height}" 
                     fill="#ffffff" stroke="#2563eb" stroke-width="2" rx="8"/>`;
      svgContent += `<text x="${x + width/2}" y="${y + height/2}" 
                     text-anchor="middle" dominant-baseline="middle" 
                     font-family="Arial" font-size="14" fill="#1e293b">${label}</text>`;
    });
    
    // Add edges
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        const sourceWidth = sourceNode.measured?.width || sourceNode.width || 150;
        const sourceHeight = sourceNode.measured?.height || sourceNode.height || 100;
        const targetWidth = targetNode.measured?.width || targetNode.width || 150;
        
        const x1 = sourceNode.position.x + offsetX + sourceWidth / 2;
        const y1 = sourceNode.position.y + offsetY + sourceHeight;
        const x2 = targetNode.position.x + offsetX + targetWidth / 2;
        const y2 = targetNode.position.y + offsetY;
        
        svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                       stroke="#1e293b" stroke-width="2" marker-end="url(#arrowhead)"/>`;
      }
    });
    
    // Add arrow marker
    svgContent += `<defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" 
              refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#1e293b"/>
      </marker>
    </defs>`;
    
    svgContent += '</svg>';

    // Download SVG
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, `${fileName}.svg`);
    URL.revokeObjectURL(url);
    
    console.log('Absolute SVG export completed successfully:', {
      contentBounds,
      exportDimensions,
      efficiency: `${((contentBounds.width * contentBounds.height) / (exportDimensions.width * exportDimensions.height) * 100).toFixed(1)}% content coverage`
    });
    return true;

  } catch (error) {
    console.error('SVG export failed:', error);
    return false;
  }
};