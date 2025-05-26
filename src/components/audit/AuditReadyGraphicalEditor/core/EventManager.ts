import * as fabric from 'fabric';
import { useFabricCanvasStore } from './FabricCanvasStore';
import {
  hideAllConnectionPoints,
  showConnectionPoints,
  hideConnectionPointsForObject
} from '../utils/connection-points';
import { getAllConnectors } from '../utils/connector-utils';
import { getUndoRedoManager } from './UndoRedoManager';
import { getAlignmentManager } from './AlignmentManager';
// Removed old template manager import - using new TemplateManager
import { getAnimationManager } from './AnimationManager';
import { getKeyboardManager } from './KeyboardManager';
import { getGridManager } from './GridManager';
import { getInteractionManager } from './InteractionManager';
import { getLayerManager } from './LayerManager';
import { getHistoryManager } from './HistoryManager';
import { getSearchManager } from './SearchManager';
import { getTextAlignmentManager } from './TextAlignmentManager';
import { getCollaborationManager } from './CollaborationManager';
import { getCloudStorageManager } from './CloudStorageManager';
import { getAILayoutManager } from './AILayoutManager';
import { getAnalyticsManager } from './AnalyticsManager';
import { getContentSuggestionsManager } from './ContentSuggestionsManager';
import { getAdvancedExportManager } from './AdvancedExportManager';
import { getTemplateManager } from './TemplateManager';
import { getSmartPlacementManager } from './SmartPlacementManager';
import { getViewportManager } from './ViewportManager';
import { getCanvasBackgroundManager } from './CanvasBackgroundManager';
import { getWorkflowAutomationEngine } from './WorkflowAutomationEngine';
import { getSmartFormBuilder } from './SmartFormBuilder';
import { getDocumentIntelligenceManager } from './DocumentIntelligenceManager';
import { getAdvancedAnalyticsManager } from './AdvancedAnalyticsManager';

export class EventManager {
  private canvas: fabric.Canvas;
  private eventHandlers: Map<string, Function[]> = new Map();
  private isInitialized = false;

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
  }

  public initialize(): void {
    if (this.isInitialized) {
      console.warn('EventManager already initialized');
      return;
    }

    this.setupCanvasEvents();

    // Initialize all managers (keyboard manager handles its own events)
    getUndoRedoManager(this.canvas);
    getAlignmentManager(this.canvas);
    getTemplateManager(this.canvas);
    getAnimationManager(this.canvas);
    getKeyboardManager(this.canvas);
    getGridManager(this.canvas);
    getInteractionManager(this.canvas);
    getLayerManager(this.canvas);
    getHistoryManager(this.canvas);
    getSearchManager(this.canvas);
    getTextAlignmentManager(this.canvas);
    getCollaborationManager(this.canvas);
    getCloudStorageManager(this.canvas);
    getAILayoutManager(this.canvas);
    getAnalyticsManager(this.canvas);
    getContentSuggestionsManager(this.canvas);
    getAdvancedExportManager(this.canvas);
    getTemplateManager(this.canvas);
    getSmartPlacementManager(this.canvas);
    getViewportManager(this.canvas);
    getCanvasBackgroundManager(this.canvas);
    getWorkflowAutomationEngine(this.canvas);
    getSmartFormBuilder(this.canvas);
    getDocumentIntelligenceManager(this.canvas);
    getAdvancedAnalyticsManager(this.canvas);

    this.isInitialized = true;
    console.log('EventManager initialized with all Phase 9 managers including Advanced Analytics');
  }

  public cleanup(): void {
    if (!this.isInitialized) return;

    // Remove all canvas event listeners
    this.eventHandlers.forEach((handlers, eventName) => {
      handlers.forEach(handler => {
        this.canvas.off(eventName as any, handler as any);
      });
    });

    // Keyboard events are handled by KeyboardManager

    this.eventHandlers.clear();
    this.isInitialized = false;
    console.log('EventManager cleaned up');
  }

  private setupCanvasEvents(): void {
    // Object lifecycle events
    this.addCanvasEvent('object:added', this.handleObjectAdded);
    this.addCanvasEvent('object:modified', this.handleObjectModified);
    this.addCanvasEvent('object:removed', this.handleObjectRemoved);

    // Selection events
    this.addCanvasEvent('selection:created', this.handleSelectionCreated);
    this.addCanvasEvent('selection:updated', this.handleSelectionUpdated);
    this.addCanvasEvent('selection:cleared', this.handleSelectionCleared);

    // Mouse events
    this.addCanvasEvent('mouse:over', this.handleMouseOver);
    this.addCanvasEvent('mouse:out', this.handleMouseOut);
    this.addCanvasEvent('mouse:down', this.handleMouseDown);

    // Text editing events
    this.addCanvasEvent('text:editing:entered', this.handleTextEditingEntered);
    this.addCanvasEvent('text:editing:exited', this.handleTextEditingExited);
  }

  // Keyboard events are now handled by KeyboardManager

  private addCanvasEvent(eventName: string, handler: Function): void {
    const boundHandler = handler.bind(this);

    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, []);
    }

    this.eventHandlers.get(eventName)!.push(boundHandler);
    this.canvas.on(eventName as any, boundHandler);
  }

  private handleObjectAdded = (e: any) => {
    this.markAsModified();
    console.log('Object added:', e.target?.type);
  };

  private handleObjectModified = (e: any) => {
    this.markAsModified();

    // Update connectors when objects move
    const target = e.target;
    if (target && !target.isConnector) {
      this.updateConnectorsForObject(target);
    }
  };

  private handleObjectRemoved = (e: any) => {
    this.markAsModified();

    const target = e.target;
    if (target && !target.isConnectionPoint && !target.isConnector) {
      hideConnectionPointsForObject(this.canvas, target);
    }
  };

  private handleSelectionCreated = (e: any) => {
    const target = e.selected?.[0];
    if (target && !target.isConnector && !target.isConnectionPoint) {
      showConnectionPoints(this.canvas, target);
      this.setShowProperties(true);
    }
  };

  private handleSelectionUpdated = (e: any) => {
    hideAllConnectionPoints(this.canvas);

    const target = e.selected?.[0];
    if (target && !target.isConnector && !target.isConnectionPoint) {
      showConnectionPoints(this.canvas, target);
      this.setShowProperties(true);
    }
  };

  private handleSelectionCleared = () => {
    hideAllConnectionPoints(this.canvas);
    this.setShowProperties(false);
  };

  private handleMouseOver = (e: any) => {
    const target = e.target;
    if (target?.isConnectionPoint) {
      target.set({
        fill: '#3b82f6',
        stroke: '#1d4ed8',
        strokeWidth: 2
      });
      this.canvas.renderAll();
    }
  };

  private handleMouseOut = (e: any) => {
    const target = e.target;
    if (target?.isConnectionPoint) {
      target.set({
        fill: '#e5e7eb',
        stroke: '#9ca3af',
        strokeWidth: 1
      });
      this.canvas.renderAll();
    }
  };

  private handleMouseDown = (e: any) => {
    const target = e.target;

    // Handle connection point clicks
    if (target?.isConnectionPoint) {
      e.e.preventDefault();
      e.e.stopPropagation();
      // Connection logic is handled in connection-points.ts
      return;
    }

    // Clear connection points when clicking on canvas
    if (!target) {
      hideAllConnectionPoints(this.canvas);
    }
  };

  private handleTextEditingEntered = () => {
    console.log('Text editing started');
    // Hide connection points during text editing to avoid interference
    hideAllConnectionPoints(this.canvas);
  };

  private handleTextEditingExited = () => {
    console.log('Text editing finished');
    // Show connection points again if object is selected
    const activeObject = this.canvas.getActiveObject();
    if (activeObject && !(activeObject as any).isConnector) {
      setTimeout(() => {
        showConnectionPoints(this.canvas, activeObject);
      }, 100);
    }
  };

  // Keyboard handling moved to KeyboardManager

  private updateConnectorsForObject(obj: fabric.Object): void {
    const connectors = getAllConnectors(this.canvas);
    connectors.forEach(connector => {
      if (connector.startObject === obj || connector.endObject === obj) {
        connector.updatePosition();
      }
    });
  }

  private markAsModified(): void {
    const { markAsModified } = useFabricCanvasStore.getState();
    markAsModified();
  }

  private setShowProperties(show: boolean): void {
    const { setShowProperties } = useFabricCanvasStore.getState();
    setShowProperties(show);
  }
}

// Singleton instance
let eventManagerInstance: EventManager | null = null;

export const getEventManager = (canvas?: fabric.Canvas): EventManager | null => {
  if (canvas && !eventManagerInstance) {
    eventManagerInstance = new EventManager(canvas);
  }
  return eventManagerInstance;
};

export const cleanupEventManager = (): void => {
  if (eventManagerInstance) {
    eventManagerInstance.cleanup();
    eventManagerInstance = null;
  }
};
