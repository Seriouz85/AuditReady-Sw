import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Move, 
  Maximize2, 
  Minimize2, 
  X, 
  GripVertical,
  Lock,
  Unlock,
  Layers,
  Grid as GridIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getCardClasses, getIconClasses } from '@/lib/ui-standards';

export interface WidgetSize {
  width: 1 | 2 | 3 | 4;
  height: 1 | 2 | 3;
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface DashboardWidget {
  id: string;
  component: React.ReactNode;
  size: WidgetSize;
  position: WidgetPosition;
  minSize?: WidgetSize;
  maxSize?: WidgetSize;
  isResizable?: boolean;
  isLocked?: boolean;
}

interface DashboardWidgetGridProps {
  widgets: DashboardWidget[];
  onUpdateWidget: (id: string, updates: Partial<DashboardWidget>) => void;
  onRemoveWidget: (id: string) => void;
  isEditMode: boolean;
  columns?: number;
  rowHeight?: number;
  gap?: number;
}

export function DashboardWidgetGrid({
  widgets,
  onUpdateWidget,
  onRemoveWidget,
  isEditMode,
  columns = 4,
  rowHeight = 120,
  gap = 16
}: DashboardWidgetGridProps) {
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [resizingWidget, setResizingWidget] = useState<string | null>(null);
  const [ghostPosition, setGhostPosition] = useState<WidgetPosition | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Calculate grid metrics
  const getCellSize = () => {
    if (!gridRef.current) return { width: 0, height: 0 };
    const gridWidth = gridRef.current.offsetWidth;
    const cellWidth = (gridWidth - gap * (columns - 1)) / columns;
    return { width: cellWidth, height: rowHeight };
  };

  // Convert pixel position to grid coordinates
  const getGridPosition = (clientX: number, clientY: number): WidgetPosition => {
    if (!gridRef.current) return { x: 0, y: 0 };
    
    const rect = gridRef.current.getBoundingClientRect();
    const cellSize = getCellSize();
    
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;
    
    const x = Math.max(0, Math.min(columns - 1, Math.floor(relativeX / (cellSize.width + gap))));
    const y = Math.max(0, Math.floor(relativeY / (cellSize.height + gap)));
    
    return { x, y };
  };

  // Check if position is valid for widget
  const isValidPosition = (widget: DashboardWidget, position: WidgetPosition): boolean => {
    // Check if widget fits within grid bounds
    if (position.x + widget.size.width > columns) return false;
    
    // Check for collisions with other widgets
    return !widgets.some(w => {
      if (w.id === widget.id) return false;
      
      const collision = 
        position.x < w.position.x + w.size.width &&
        position.x + widget.size.width > w.position.x &&
        position.y < w.position.y + w.size.height &&
        position.y + widget.size.height > w.position.y;
        
      return collision;
    });
  };

  // Find nearest valid position
  const findNearestValidPosition = (widget: DashboardWidget, targetPos: WidgetPosition): WidgetPosition => {
    // Try target position first
    if (isValidPosition(widget, targetPos)) return targetPos;
    
    // Search in expanding radius
    for (let radius = 1; radius < Math.max(columns, 10); radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
          
          const testPos = {
            x: Math.max(0, Math.min(columns - widget.size.width, targetPos.x + dx)),
            y: Math.max(0, targetPos.y + dy)
          };
          
          if (isValidPosition(widget, testPos)) return testPos;
        }
      }
    }
    
    return widget.position; // Return original if no valid position found
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    if (!isEditMode) return;
    
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget || widget.isLocked) return;
    
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    if (!isEditMode || !draggedWidget) return;
    e.preventDefault();
    
    const position = getGridPosition(e.clientX, e.clientY);
    setGhostPosition(position);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    if (!isEditMode || !draggedWidget) return;
    e.preventDefault();
    
    const widget = widgets.find(w => w.id === draggedWidget);
    if (!widget) return;
    
    const targetPosition = getGridPosition(e.clientX, e.clientY);
    const validPosition = findNearestValidPosition(widget, targetPosition);
    
    onUpdateWidget(draggedWidget, { position: validPosition });
    
    setDraggedWidget(null);
    setGhostPosition(null);
  };

  // Handle resize
  const handleResize = (widgetId: string, newSize: WidgetSize) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget || widget.isLocked || !widget.isResizable) return;
    
    // Respect min/max constraints
    const constrainedSize = {
      width: Math.max(
        widget.minSize?.width || 1,
        Math.min(widget.maxSize?.width || columns, newSize.width)
      ) as WidgetSize['width'],
      height: Math.max(
        widget.minSize?.height || 1,
        Math.min(widget.maxSize?.height || 3, newSize.height)
      ) as WidgetSize['height']
    };
    
    // Check if new size is valid at current position
    const testWidget = { ...widget, size: constrainedSize };
    if (isValidPosition(testWidget, widget.position)) {
      onUpdateWidget(widgetId, { size: constrainedSize });
    }
  };

  // Calculate widget style
  const getWidgetStyle = (widget: DashboardWidget) => {
    const cellSize = getCellSize();
    return {
      width: widget.size.width * cellSize.width + (widget.size.width - 1) * gap,
      height: widget.size.height * cellSize.height + (widget.size.height - 1) * gap,
      transform: `translate(${widget.position.x * (cellSize.width + gap)}px, ${widget.position.y * (cellSize.height + gap)}px)`,
    };
  };

  // Calculate grid height
  const gridHeight = Math.max(
    ...widgets.map(w => w.position.y + w.size.height),
    3 // Minimum 3 rows
  ) * (rowHeight + gap) - gap;

  return (
    <div 
      ref={gridRef}
      className={cn(
        "relative w-full transition-all",
        isEditMode && "ring-2 ring-primary/20 rounded-lg"
      )}
      style={{ height: gridHeight, minHeight: 400 }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Grid overlay in edit mode */}
      {isEditMode && (
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="grid h-full opacity-20"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gridTemplateRows: `repeat(auto-fill, ${rowHeight}px)`,
              gap: `${gap}px`
            }}
          >
            {Array.from({ length: columns * Math.ceil(gridHeight / (rowHeight + gap)) }).map((_, i) => (
              <div 
                key={i} 
                className="border border-dashed border-primary/50 rounded"
              />
            ))}
          </div>
        </div>
      )}

      {/* Ghost position indicator */}
      {isEditMode && ghostPosition && draggedWidget && (
        <motion.div
          className="absolute bg-primary/20 border-2 border-primary/50 rounded-lg pointer-events-none z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={getWidgetStyle({
            ...widgets.find(w => w.id === draggedWidget)!,
            position: ghostPosition
          })}
        />
      )}

      {/* Widgets */}
      <AnimatePresence>
        {widgets.map(widget => (
          <motion.div
            key={widget.id}
            className={cn(
              "absolute overflow-hidden",
              isEditMode && !widget.isLocked && "cursor-move",
              draggedWidget === widget.id && "opacity-50 z-20",
              widget.isLocked && "ring-2 ring-muted-foreground/20"
            )}
            style={getWidgetStyle(widget)}
            draggable={isEditMode && !widget.isLocked}
            onDragStart={(e) => handleDragStart(e, widget.id)}
            layout
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            {/* Widget controls in edit mode */}
            {isEditMode && (
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-background/90 to-transparent p-2 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {!widget.isLocked && (
                      <GripVertical className={cn(getIconClasses('xs'), "text-muted-foreground")} />
                    )}
                    <span className="text-xs font-medium">
                      {widget.size.width}x{widget.size.height}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {widget.isResizable && !widget.isLocked && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => handleResize(widget.id, {
                            width: Math.min(4, widget.size.width + 1) as WidgetSize['width'],
                            height: widget.size.height
                          })}
                        >
                          <Maximize2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => handleResize(widget.id, {
                            width: Math.max(1, widget.size.width - 1) as WidgetSize['width'],
                            height: widget.size.height
                          })}
                        >
                          <Minimize2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => onUpdateWidget(widget.id, { isLocked: !widget.isLocked })}
                    >
                      {widget.isLocked ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        <Unlock className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => onRemoveWidget(widget.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Widget content */}
            <div className="h-full w-full">
              {widget.component}
            </div>

            {/* Resize handle */}
            {isEditMode && widget.isResizable && !widget.isLocked && (
              <div 
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setResizingWidget(widget.id);
                }}
              >
                <svg 
                  className="w-full h-full text-primary/50" 
                  viewBox="0 0 6 6"
                >
                  <path d="M 6 0 L 6 6 L 0 6" fill="currentColor" />
                </svg>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}