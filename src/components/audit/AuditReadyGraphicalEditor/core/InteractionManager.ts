import * as fabric from 'fabric';
import { getAnimationManager } from './AnimationManager';

export interface InteractionOptions {
  enableHoverEffects: boolean;
  enableSelectionAnimations: boolean;
  enableSmoothMovement: boolean;
  hoverScale: number;
  selectionGlow: boolean;
}

export class InteractionManager {
  private canvas: fabric.Canvas;
  private options: InteractionOptions = {
    enableHoverEffects: true,
    enableSelectionAnimations: true,
    enableSmoothMovement: true,
    hoverScale: 1.05,
    selectionGlow: true
  };
  private hoveredObject: fabric.Object | null = null;
  private originalProperties: Map<fabric.Object, any> = new Map();

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.setupEventListeners();
    this.enhanceObjectInteractions();
  }

  private setupEventListeners(): void {
    this.canvas.on('mouse:over', this.handleMouseOver.bind(this));
    this.canvas.on('mouse:out', this.handleMouseOut.bind(this));
    this.canvas.on('selection:created', this.handleSelectionCreated.bind(this));
    this.canvas.on('selection:updated', this.handleSelectionUpdated.bind(this));
    this.canvas.on('selection:cleared', this.handleSelectionCleared.bind(this));
    this.canvas.on('object:moving', this.handleObjectMoving.bind(this));
    this.canvas.on('object:scaling', this.handleObjectScaling.bind(this));
    this.canvas.on('object:rotating', this.handleObjectRotating.bind(this));
  }

  private enhanceObjectInteractions(): void {
    // Make all objects more responsive
    this.canvas.getObjects().forEach(obj => {
      this.enhanceObject(obj);
    });

    // Enhance new objects as they're added
    this.canvas.on('object:added', (e) => {
      if (e.target) {
        this.enhanceObject(e.target);
      }
    });
  }

  private enhanceObject(obj: fabric.Object): void {
    if (obj.isConnectionPoint || obj.isConnector) return;

    // Store original properties
    this.originalProperties.set(obj, {
      scaleX: obj.scaleX || 1,
      scaleY: obj.scaleY || 1,
      shadow: obj.shadow,
      opacity: obj.opacity || 1
    });

    // Enhance cursor behavior
    obj.set({
      hoverCursor: 'move',
      moveCursor: 'grabbing'
    });
  }

  private handleMouseOver(e: any): void {
    const target = e.target;
    if (!target || target.isConnectionPoint || target.isConnector) return;
    if (!this.options.enableHoverEffects) return;

    this.hoveredObject = target;
    const original = this.originalProperties.get(target);
    if (!original) return;

    // Apply hover effects
    const animationManager = getAnimationManager();
    if (animationManager && this.options.enableSmoothMovement) {
      animationManager.animateObjectTo(target, {
        scaleX: original.scaleX * this.options.hoverScale,
        scaleY: original.scaleY * this.options.hoverScale,
        opacity: Math.min(original.opacity * 1.1, 1)
      }, {
        duration: 150
      });
    } else {
      target.set({
        scaleX: original.scaleX * this.options.hoverScale,
        scaleY: original.scaleY * this.options.hoverScale,
        opacity: Math.min(original.opacity * 1.1, 1)
      });
      this.canvas.renderAll();
    }

    // Add subtle shadow
    if (!target.shadow) {
      target.set({
        shadow: new fabric.Shadow({
          color: 'rgba(0, 0, 0, 0.2)',
          blur: 8,
          offsetX: 2,
          offsetY: 2
        })
      });
      this.canvas.renderAll();
    }
  }

  private handleMouseOut(e: any): void {
    const target = e.target;
    if (!target || target !== this.hoveredObject) return;
    if (!this.options.enableHoverEffects) return;

    this.hoveredObject = null;
    const original = this.originalProperties.get(target);
    if (!original) return;

    // Remove hover effects
    const animationManager = getAnimationManager();
    if (animationManager && this.options.enableSmoothMovement) {
      animationManager.animateObjectTo(target, {
        scaleX: original.scaleX,
        scaleY: original.scaleY,
        opacity: original.opacity
      }, {
        duration: 150
      });
    } else {
      target.set({
        scaleX: original.scaleX,
        scaleY: original.scaleY,
        opacity: original.opacity
      });
      this.canvas.renderAll();
    }

    // Remove shadow if it was added by hover
    if (target.shadow && !original.shadow) {
      target.set({ shadow: null });
      this.canvas.renderAll();
    }
  }

  private handleSelectionCreated(e: any): void {
    if (!this.options.enableSelectionAnimations) return;

    const targets = e.selected || [e.target];
    targets.forEach((target: fabric.Object) => {
      this.applySelectionEffects(target);
    });
  }

  private handleSelectionUpdated(e: any): void {
    if (!this.options.enableSelectionAnimations) return;

    const targets = e.selected || [e.target];
    targets.forEach((target: fabric.Object) => {
      this.applySelectionEffects(target);
    });
  }

  private handleSelectionCleared(): void {
    // Remove selection effects from all objects
    this.canvas.getObjects().forEach(obj => {
      this.removeSelectionEffects(obj);
    });
  }

  private applySelectionEffects(target: fabric.Object): void {
    if (!target || target.isConnectionPoint || target.isConnector) return;

    const animationManager = getAnimationManager();
    
    // Pulse animation
    if (animationManager) {
      animationManager.pulseObject(target);
    }

    // Selection glow
    if (this.options.selectionGlow) {
      target.set({
        shadow: new fabric.Shadow({
          color: '#3b82f6',
          blur: 15,
          offsetX: 0,
          offsetY: 0
        })
      });
      this.canvas.renderAll();
    }
  }

  private removeSelectionEffects(target: fabric.Object): void {
    if (!target || target.isConnectionPoint || target.isConnector) return;

    const original = this.originalProperties.get(target);
    if (original && this.options.selectionGlow) {
      target.set({
        shadow: original.shadow
      });
      this.canvas.renderAll();
    }
  }

  private handleObjectMoving(e: any): void {
    const target = e.target;
    if (!target || !this.options.enableSmoothMovement) return;

    // Add movement feedback
    if (!target.shadow || target.shadow.blur < 10) {
      target.set({
        shadow: new fabric.Shadow({
          color: 'rgba(0, 0, 0, 0.3)',
          blur: 12,
          offsetX: 3,
          offsetY: 3
        })
      });
    }
  }

  private handleObjectScaling(e: any): void {
    // Add scaling feedback if needed
    const target = e.target;
    if (target && this.options.enableSmoothMovement) {
      // Could add scaling-specific effects here
    }
  }

  private handleObjectRotating(e: any): void {
    // Add rotation feedback if needed
    const target = e.target;
    if (target && this.options.enableSmoothMovement) {
      // Could add rotation-specific effects here
    }
  }

  // Public methods for customization
  public setOptions(newOptions: Partial<InteractionOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  public getOptions(): InteractionOptions {
    return { ...this.options };
  }

  public enableHoverEffects(enabled: boolean): void {
    this.options.enableHoverEffects = enabled;
    if (!enabled && this.hoveredObject) {
      this.handleMouseOut({ target: this.hoveredObject });
    }
  }

  public enableSelectionAnimations(enabled: boolean): void {
    this.options.enableSelectionAnimations = enabled;
    if (!enabled) {
      this.handleSelectionCleared();
    }
  }

  public enableSmoothMovement(enabled: boolean): void {
    this.options.enableSmoothMovement = enabled;
  }

  public setHoverScale(scale: number): void {
    this.options.hoverScale = Math.max(1, Math.min(2, scale));
  }

  public enableSelectionGlow(enabled: boolean): void {
    this.options.selectionGlow = enabled;
    if (!enabled) {
      this.handleSelectionCleared();
    }
  }

  // Enhanced object creation with smooth appearance
  public addObjectWithAnimation(object: fabric.Object): Promise<void> {
    const animationManager = getAnimationManager();
    if (animationManager && this.options.enableSelectionAnimations) {
      return animationManager.animateObjectAppear(object);
    } else {
      this.canvas.add(object);
      return Promise.resolve();
    }
  }

  // Enhanced object removal with smooth disappearance
  public removeObjectWithAnimation(object: fabric.Object): Promise<void> {
    const animationManager = getAnimationManager();
    if (animationManager && this.options.enableSelectionAnimations) {
      return animationManager.animateObjectDisappear(object);
    } else {
      this.canvas.remove(object);
      return Promise.resolve();
    }
  }

  // Smooth object duplication
  public duplicateObjectWithAnimation(object: fabric.Object): Promise<fabric.Object> {
    return new Promise((resolve) => {
      object.clone((cloned: fabric.Object) => {
        cloned.set({
          left: (cloned.left || 0) + 20,
          top: (cloned.top || 0) + 20,
        });

        this.addObjectWithAnimation(cloned).then(() => {
          this.canvas.setActiveObject(cloned);
          resolve(cloned);
        });
      });
    });
  }

  // Enhanced multi-select with visual feedback
  public selectMultipleObjects(objects: fabric.Object[]): void {
    if (objects.length === 0) return;

    const animationManager = getAnimationManager();
    
    // Animate each object selection
    objects.forEach((obj, index) => {
      setTimeout(() => {
        if (animationManager) {
          animationManager.pulseObject(obj);
        }
      }, index * 50);
    });

    // Create selection after animations
    setTimeout(() => {
      const selection = new fabric.ActiveSelection(objects, {
        canvas: this.canvas
      });
      this.canvas.setActiveObject(selection);
      this.canvas.renderAll();
    }, objects.length * 50);
  }

  public cleanup(): void {
    this.canvas.off('mouse:over', this.handleMouseOver);
    this.canvas.off('mouse:out', this.handleMouseOut);
    this.canvas.off('selection:created', this.handleSelectionCreated);
    this.canvas.off('selection:updated', this.handleSelectionUpdated);
    this.canvas.off('selection:cleared', this.handleSelectionCleared);
    this.canvas.off('object:moving', this.handleObjectMoving);
    this.canvas.off('object:scaling', this.handleObjectScaling);
    this.canvas.off('object:rotating', this.handleObjectRotating);
    this.canvas.off('object:added');
    
    this.originalProperties.clear();
    this.hoveredObject = null;
  }
}

// Singleton instance
let interactionManagerInstance: InteractionManager | null = null;

export const getInteractionManager = (canvas?: fabric.Canvas): InteractionManager | null => {
  if (canvas && !interactionManagerInstance) {
    interactionManagerInstance = new InteractionManager(canvas);
  }
  return interactionManagerInstance;
};

export const cleanupInteractionManager = (): void => {
  if (interactionManagerInstance) {
    interactionManagerInstance.cleanup();
    interactionManagerInstance = null;
  }
};
