import * as fabric from 'fabric';
import { getViewportManager } from './ViewportManager';

/**
 * Dynamically expands the canvas when content goes beyond bounds
 * Ensures the canvas is properly sized to accommodate all objects
 * with generous space for user expansion
 */
export const expandCanvasIfNeeded = (canvas: fabric.Canvas, margin: number = 200): void => {
  if (!canvas) return;

  const objects = canvas.getObjects();
  if (objects.length === 0) return;

  // Find the bounds of all objects
  let minLeft = Infinity;
  let minTop = Infinity;
  let maxRight = 0;
  let maxBottom = 0;

  // Find the furthest extent of all objects
  objects.forEach(obj => {
    const bounds = obj.getBoundingRect();
    minLeft = Math.min(minLeft, bounds.left);
    minTop = Math.min(minTop, bounds.top);
    maxRight = Math.max(maxRight, bounds.left + bounds.width);
    maxBottom = Math.max(maxBottom, bounds.top + bounds.height);
  });

  // More generous minimum canvas size to allow for expansion
  const minCanvasWidth = 1200;
  const minCanvasHeight = 1000;
  
  // Current canvas dimensions
  const currentWidth = canvas.width || minCanvasWidth;
  const currentHeight = canvas.height || minCanvasHeight;

  // Allow content to get closer to edges before expanding
  const minLeftMargin = 100;
  const minTopMargin = 100;
  
  // Calculate needed dimensions with generous margins
  const neededWidth = Math.max(maxRight + margin, minCanvasWidth);
  const neededHeight = Math.max(maxBottom + margin, minCanvasHeight);
  
  // Check if objects are too close to left or top edges
  const objectsTooClose = minLeft < minLeftMargin || minTop < minTopMargin;
  
  // Determine if canvas needs resizing
  let needsResize = false;
  let newWidth = currentWidth;
  let newHeight = currentHeight;

  // Calculate necessary width - be more generous
  if (maxRight + margin > currentWidth) {
    newWidth = Math.max(maxRight + margin, currentWidth * 1.5); // Expand by at least 50%
    needsResize = true;
  }

  // Calculate necessary height - be more generous
  if (maxBottom + margin > currentHeight) {
    newHeight = Math.max(maxBottom + margin, currentHeight * 1.5); // Expand by at least 50%
    needsResize = true;
  }
  
  // Resize canvas if needed
  if (needsResize) {
    canvas.setDimensions({
      width: newWidth,
      height: newHeight
    });
    
    canvas.renderAll();
    console.log(`Canvas expanded to ${newWidth}x${newHeight} to accommodate content`);
  }
  
  // If content is too close to the edges, add some space but don't move content unnecessarily
  if (objectsTooClose) {
    // Calculate minimum offsets needed to maintain margins
    const offsetX = minLeft < minLeftMargin ? (minLeftMargin - minLeft) : 0;
    const offsetY = minTop < minTopMargin ? (minTopMargin - minTop) : 0;
    
    if (offsetX > 0 || offsetY > 0) {
      // Apply minimum necessary offset to keep content visible
      objects.forEach(obj => {
        obj.set({
          left: (obj.left || 0) + offsetX,
          top: (obj.top || 0) + offsetY
        });
        obj.setCoords();
      });
      
      // Also expand canvas to accommodate the moved content
      const newCanvasWidth = Math.max(newWidth + offsetX, minCanvasWidth);
      const newCanvasHeight = Math.max(newHeight + offsetY, minCanvasHeight);
      
      canvas.setDimensions({
        width: newCanvasWidth,
        height: newCanvasHeight
      });
      
      canvas.renderAll();
      console.log(`Content adjusted by (${offsetX}, ${offsetY}) and canvas expanded to ${newCanvasWidth}x${newCanvasHeight}`);
    }
  }
  
  // Ensure viewport shows the content appropriately
  const viewportManager = getViewportManager();
  if (viewportManager && objects.length > 0) {
    // Update canvas metrics after expansion
    viewportManager.updateCanvasSize();
  }
}; 