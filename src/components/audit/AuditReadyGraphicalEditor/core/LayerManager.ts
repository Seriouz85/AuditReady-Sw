import * as fabric from 'fabric';

export interface LayerInfo {
  id: string;
  name: string;
  object: fabric.Object;
  visible: boolean;
  locked: boolean;
  type: string;
  zIndex: number;
}

export interface LayerGroup {
  id: string;
  name: string;
  layers: LayerInfo[];
  visible: boolean;
  locked: boolean;
  expanded: boolean;
}

export class LayerManager {
  private canvas: fabric.Canvas;
  private layers: Map<string, LayerInfo> = new Map();
  private groups: Map<string, LayerGroup> = new Map();
  private layerCounter: number = 0;
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.setupEventListeners();
    this.initializeExistingObjects();
  }

  private setupEventListeners(): void {
    this.canvas.on('object:added', this.handleObjectAdded.bind(this));
    this.canvas.on('object:removed', this.handleObjectRemoved.bind(this));
    this.canvas.on('selection:created', this.handleSelectionChanged.bind(this));
    this.canvas.on('selection:updated', this.handleSelectionChanged.bind(this));
    this.canvas.on('selection:cleared', this.handleSelectionCleared.bind(this));
  }

  private initializeExistingObjects(): void {
    this.canvas.getObjects().forEach(obj => {
      if (!obj.isConnectionPoint && !obj.isConnector) {
        this.addLayer(obj);
      }
    });
  }

  private handleObjectAdded(e: any): void {
    const obj = e.target;
    if (obj && !obj.isConnectionPoint && !obj.isConnector && !this.layers.has(obj.id)) {
      this.addLayer(obj);
    }
  }

  private handleObjectRemoved(e: any): void {
    const obj = e.target;
    if (obj && this.layers.has(obj.id)) {
      this.removeLayer(obj.id);
    }
  }

  private handleSelectionChanged(e: any): void {
    this.emit('selection:changed', e.selected || [e.target]);
  }

  private handleSelectionCleared(): void {
    this.emit('selection:changed', []);
  }

  private generateLayerId(): string {
    return `layer_${++this.layerCounter}_${Date.now()}`;
  }

  private generateLayerName(object: fabric.Object): string {
    const type = object.type || 'Object';
    const count = Array.from(this.layers.values()).filter(l => l.type === type).length + 1;
    return `${type.charAt(0).toUpperCase() + type.slice(1)} ${count}`;
  }

  public addLayer(object: fabric.Object, groupId?: string): LayerInfo {
    const id = object.id || this.generateLayerId();
    object.id = id;

    const layerInfo: LayerInfo = {
      id,
      name: this.generateLayerName(object),
      object,
      visible: object.visible !== false,
      locked: !object.selectable,
      type: object.type || 'object',
      zIndex: this.canvas.getObjects().indexOf(object)
    };

    this.layers.set(id, layerInfo);

    if (groupId && this.groups.has(groupId)) {
      this.groups.get(groupId)!.layers.push(layerInfo);
    }

    this.emit('layer:added', layerInfo);
    return layerInfo;
  }

  public removeLayer(layerId: string): boolean {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    // Remove from groups
    this.groups.forEach(group => {
      group.layers = group.layers.filter(l => l.id !== layerId);
    });

    this.layers.delete(layerId);
    this.emit('layer:removed', layer);
    return true;
  }

  public getLayer(layerId: string): LayerInfo | undefined {
    return this.layers.get(layerId);
  }

  public getAllLayers(): LayerInfo[] {
    return Array.from(this.layers.values()).sort((a, b) => b.zIndex - a.zIndex);
  }

  public updateLayerName(layerId: string, name: string): boolean {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    layer.name = name;
    this.emit('layer:updated', layer);
    return true;
  }

  public toggleLayerVisibility(layerId: string): boolean {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    layer.visible = !layer.visible;
    layer.object.set('visible', layer.visible);
    this.canvas.renderAll();
    this.emit('layer:updated', layer);
    return true;
  }

  public toggleLayerLock(layerId: string): boolean {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    layer.locked = !layer.locked;
    layer.object.set({
      selectable: !layer.locked,
      evented: !layer.locked
    });
    this.canvas.renderAll();
    this.emit('layer:updated', layer);
    return true;
  }

  public moveLayerUp(layerId: string): boolean {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    this.canvas.bringObjectForward(layer.object);
    this.updateZIndices();
    this.emit('layer:reordered', this.getAllLayers());
    return true;
  }

  public moveLayerDown(layerId: string): boolean {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    this.canvas.sendObjectBackwards(layer.object);
    this.updateZIndices();
    this.emit('layer:reordered', this.getAllLayers());
    return true;
  }

  public moveLayerToTop(layerId: string): boolean {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    this.canvas.bringObjectToFront(layer.object);
    this.updateZIndices();
    this.emit('layer:reordered', this.getAllLayers());
    return true;
  }

  public moveLayerToBottom(layerId: string): boolean {
    const layer = this.layers.get(layerId);
    if (!layer) return false;

    this.canvas.sendObjectToBack(layer.object);
    this.updateZIndices();
    this.emit('layer:reordered', this.getAllLayers());
    return true;
  }

  private updateZIndices(): void {
    const objects = this.canvas.getObjects();
    objects.forEach((obj, index) => {
      if (obj.id && this.layers.has(obj.id)) {
        this.layers.get(obj.id)!.zIndex = index;
      }
    });
  }

  public selectLayer(layerId: string): boolean {
    const layer = this.layers.get(layerId);
    if (!layer || layer.locked) return false;

    this.canvas.setActiveObject(layer.object);
    this.canvas.renderAll();
    return true;
  }

  public selectMultipleLayers(layerIds: string[]): boolean {
    const objects = layerIds
      .map(id => this.layers.get(id))
      .filter(layer => layer && !layer.locked)
      .map(layer => layer!.object);

    if (objects.length === 0) return false;

    if (objects.length === 1) {
      this.canvas.setActiveObject(objects[0]);
    } else {
      const selection = new fabric.ActiveSelection(objects, {
        canvas: this.canvas
      });
      this.canvas.setActiveObject(selection);
    }

    this.canvas.renderAll();
    return true;
  }

  // Group management
  public createGroup(name: string, layerIds: string[]): LayerGroup {
    const id = `group_${Date.now()}`;
    const layers = layerIds
      .map(layerId => this.layers.get(layerId))
      .filter(layer => layer !== undefined) as LayerInfo[];

    const group: LayerGroup = {
      id,
      name,
      layers,
      visible: true,
      locked: false,
      expanded: true
    };

    this.groups.set(id, group);
    this.emit('group:created', group);
    return group;
  }

  public removeGroup(groupId: string): boolean {
    const group = this.groups.get(groupId);
    if (!group) return false;

    this.groups.delete(groupId);
    this.emit('group:removed', group);
    return true;
  }

  public toggleGroupVisibility(groupId: string): boolean {
    const group = this.groups.get(groupId);
    if (!group) return false;

    group.visible = !group.visible;
    group.layers.forEach(layer => {
      layer.visible = group.visible;
      layer.object.set('visible', group.visible);
    });

    this.canvas.renderAll();
    this.emit('group:updated', group);
    return true;
  }

  public toggleGroupLock(groupId: string): boolean {
    const group = this.groups.get(groupId);
    if (!group) return false;

    group.locked = !group.locked;
    group.layers.forEach(layer => {
      layer.locked = group.locked;
      layer.object.set({
        selectable: !group.locked,
        evented: !group.locked
      });
    });

    this.canvas.renderAll();
    this.emit('group:updated', group);
    return true;
  }

  public getAllGroups(): LayerGroup[] {
    return Array.from(this.groups.values());
  }

  // Event system
  public on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  public off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  public cleanup(): void {
    this.canvas.off('object:added', this.handleObjectAdded);
    this.canvas.off('object:removed', this.handleObjectRemoved);
    this.canvas.off('selection:created', this.handleSelectionChanged);
    this.canvas.off('selection:updated', this.handleSelectionChanged);
    this.canvas.off('selection:cleared', this.handleSelectionCleared);
    
    this.layers.clear();
    this.groups.clear();
    this.eventHandlers.clear();
  }
}

// Singleton instance
let layerManagerInstance: LayerManager | null = null;

export const getLayerManager = (canvas?: fabric.Canvas): LayerManager | null => {
  if (canvas && !layerManagerInstance) {
    layerManagerInstance = new LayerManager(canvas);
  }
  return layerManagerInstance;
};

export const cleanupLayerManager = (): void => {
  if (layerManagerInstance) {
    layerManagerInstance.cleanup();
    layerManagerInstance = null;
  }
};
