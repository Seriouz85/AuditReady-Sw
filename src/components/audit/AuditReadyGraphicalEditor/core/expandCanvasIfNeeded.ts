import * as fabric from 'fabric';
import { getViewportManager } from './ViewportManager';

/**
 * Dynamically expands the canvas when content goes beyond bounds
 * Ensures the canvas is properly sized to accommodate all objects
 * while maintaining content closer to the top-left corner
 */
export const expandCanvasIfNeeded = (canvas: fabric.Canvas, margin: number = 80): void => {
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

  // Fixed minimum canvas size
  const minCanvasWidth = 800;
  const minCanvasHeight = 600;
  
  // Current canvas dimensions
  const currentWidth = canvas.width || minCanvasWidth;
  const currentHeight = canvas.height || minCanvasHeight;

  // Ensure minimum margins at left and top (smaller values to keep objects in upper left)
  const minLeftMargin = 40;
  const minTopMargin = 40;
  
  // Calculate needed dimensions with margins
  const neededWidth = Math.max(maxRight + margin, minCanvasWidth);
  const neededHeight = Math.max(maxBottom + margin, minCanvasHeight);
  
  // Check if objects are too close to left or top edges
  const objectsTooClose = minLeft < minLeftMargin || minTop < minTopMargin;
  
  // Determine if canvas needs resizing
  let needsResize = false;
  let newWidth = currentWidth;
  let newHeight = currentHeight;

  // Calculate necessary width
  if (maxRight + margin > currentWidth) {
    newWidth = maxRight + margin;
    needsResize = true;
  }

  // Calculate necessary height
  if (maxBottom + margin > currentHeight) {
    newHeight = maxBottom + margin;
    needsResize = true;
  }
  
  // Resize canvas if needed
  if (needsResize) {
    canvas.setDimensions({
      width: newWidth,
      height: newHeight
    });
    
    canvas.renderAll();
    console.log(`Canvas expanded to ${newWidth}x${newHeight}`);
  }
  
  // If content is too close to the edges, reposition all objects slightly
  // but maintain upper-left positioning as much as possible
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
      
      canvas.renderAll();
      console.log(`Content adjusted by (${offsetX}, ${offsetY}) to maintain margins`);
    }
  }
  
  // Ensure viewport shows the upper-left content
  const viewportManager = getViewportManager();
  if (viewportManager && objects.length > 0) {
    // Find the object in the upper left
    let upperLeftObject = objects[0];
    let minDistance = Infinity;
    
    objects.forEach(obj => {
      const bounds = obj.getBoundingRect();
      // Calculate distance from origin (0,0)
      const distance = Math.sqrt(bounds.left * bounds.left + bounds.top * bounds.top);
      if (distance < minDistance) {
        minDistance = distance;
        upperLeftObject = obj;
      }
    });
    
    // Ensure the upper-left object is visible
    viewportManager.ensureObjectVisible(upperLeftObject);
  }
}; 