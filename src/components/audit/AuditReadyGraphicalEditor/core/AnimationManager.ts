import * as fabric from 'fabric';

export interface AnimationOptions {
  duration?: number;
  easing?: string;
  onChange?: () => void;
  onComplete?: () => void;
}

export class AnimationManager {
  private canvas: fabric.Canvas;
  private activeAnimations: Map<string, any> = new Map();

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
  }

  // Smooth object movement animation
  public animateObjectTo(
    object: fabric.Object,
    targetProps: Partial<fabric.Object>,
    options: AnimationOptions = {}
  ): Promise<void> {
    return new Promise((resolve) => {
      const animationId = `${object.type}-${Date.now()}`;
      
      // Cancel any existing animation for this object
      this.cancelObjectAnimation(object);

      const defaultOptions = {
        duration: 300,
        easing: fabric.util.ease.easeOutCubic,
        onChange: () => {
          this.canvas.renderAll();
          options.onChange?.();
        },
        onComplete: () => {
          this.activeAnimations.delete(animationId);
          options.onComplete?.();
          resolve();
        }
      };

      const animation = object.animate(targetProps, {
        ...defaultOptions,
        ...options
      });

      this.activeAnimations.set(animationId, animation);
    });
  }

  // Smooth zoom animation
  public animateZoom(targetZoom: number, options: AnimationOptions = {}): Promise<void> {
    return new Promise((resolve) => {
      const currentZoom = this.canvas.getZoom();
      const duration = options.duration || 400;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        
        const zoom = currentZoom + (targetZoom - currentZoom) * eased;
        this.canvas.setZoom(zoom);
        this.canvas.renderAll();

        options.onChange?.();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          options.onComplete?.();
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  // Smooth pan animation
  public animatePan(targetX: number, targetY: number, options: AnimationOptions = {}): Promise<void> {
    return new Promise((resolve) => {
      const vpt = this.canvas.viewportTransform!;
      const currentX = vpt[4];
      const currentY = vpt[5];
      const duration = options.duration || 400;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        
        const x = currentX + (targetX - currentX) * eased;
        const y = currentY + (targetY - currentY) * eased;
        
        this.canvas.viewportTransform![4] = x;
        this.canvas.viewportTransform![5] = y;
        this.canvas.renderAll();

        options.onChange?.();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          options.onComplete?.();
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  // Animate object appearance
  public animateObjectAppear(object: fabric.Object, options: AnimationOptions = {}): Promise<void> {
    // Start with object invisible
    object.set({ opacity: 0, scaleX: 0.8, scaleY: 0.8 });
    this.canvas.add(object);

    return this.animateObjectTo(object, {
      opacity: 1,
      scaleX: 1,
      scaleY: 1
    }, {
      duration: 250,
      ...options
    });
  }

  // Animate object disappear
  public animateObjectDisappear(object: fabric.Object, options: AnimationOptions = {}): Promise<void> {
    return this.animateObjectTo(object, {
      opacity: 0,
      scaleX: 0.8,
      scaleY: 0.8
    }, {
      duration: 200,
      onComplete: () => {
        this.canvas.remove(object);
        options.onComplete?.();
      }
    });
  }

  // Pulse animation for highlighting
  public pulseObject(object: fabric.Object, options: AnimationOptions = {}): Promise<void> {
    return new Promise((resolve) => {
      const originalScale = { x: object.scaleX || 1, y: object.scaleY || 1 };
      const pulseScale = 1.1;

      this.animateObjectTo(object, {
        scaleX: originalScale.x * pulseScale,
        scaleY: originalScale.y * pulseScale
      }, {
        duration: 150,
        onComplete: () => {
          this.animateObjectTo(object, {
            scaleX: originalScale.x,
            scaleY: originalScale.y
          }, {
            duration: 150,
            onComplete: () => {
              options.onComplete?.();
              resolve();
            }
          });
        }
      });
    });
  }

  // Shake animation for errors
  public shakeObject(object: fabric.Object, options: AnimationOptions = {}): Promise<void> {
    return new Promise((resolve) => {
      const originalLeft = object.left || 0;
      const shakeDistance = 5;
      let shakeCount = 0;
      const maxShakes = 6;

      const shake = () => {
        if (shakeCount >= maxShakes) {
          object.set({ left: originalLeft });
          this.canvas.renderAll();
          options.onComplete?.();
          resolve();
          return;
        }

        const direction = shakeCount % 2 === 0 ? 1 : -1;
        const distance = shakeDistance * (1 - shakeCount / maxShakes);
        
        this.animateObjectTo(object, {
          left: originalLeft + (direction * distance)
        }, {
          duration: 50,
          onComplete: () => {
            shakeCount++;
            shake();
          }
        });
      };

      shake();
    });
  }

  // Smooth selection animation
  public animateSelection(object: fabric.Object): void {
    this.pulseObject(object, {
      onComplete: () => {
        // Add subtle glow effect
        object.set({
          shadow: new fabric.Shadow({
            color: '#3b82f6',
            blur: 10,
            offsetX: 0,
            offsetY: 0
          })
        });
        this.canvas.renderAll();
      }
    });
  }

  // Center object in viewport with animation
  public centerObject(object: fabric.Object, options: AnimationOptions = {}): Promise<void> {
    const objectCenter = object.getCenterPoint();
    const canvasCenter = this.canvas.getCenter();
    
    const deltaX = canvasCenter.left - objectCenter.x;
    const deltaY = canvasCenter.top - objectCenter.y;

    return this.animatePan(deltaX, deltaY, options);
  }

  // Fit object to viewport with animation
  public fitObjectToViewport(object: fabric.Object, padding: number = 50): Promise<void> {
    const objectBounds = object.getBoundingRect();
    const canvasWidth = this.canvas.width!;
    const canvasHeight = this.canvas.height!;

    const scaleX = (canvasWidth - padding * 2) / objectBounds.width;
    const scaleY = (canvasHeight - padding * 2) / objectBounds.height;
    const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%

    return this.animateZoom(scale, {
      onComplete: () => {
        this.centerObject(object);
      }
    });
  }

  // Cancel specific object animation
  public cancelObjectAnimation(object: fabric.Object): void {
    // Fabric.js doesn't provide a direct way to cancel animations
    // This is a placeholder for future implementation
    console.log('Canceling animation for object:', object.type);
  }

  // Cancel all animations
  public cancelAllAnimations(): void {
    this.activeAnimations.forEach((animation, id) => {
      // Cancel animation if possible
      console.log('Canceling animation:', id);
    });
    this.activeAnimations.clear();
  }

  // Cleanup
  public cleanup(): void {
    this.cancelAllAnimations();
  }
}

// Singleton instance
let animationManagerInstance: AnimationManager | null = null;

export const getAnimationManager = (canvas?: fabric.Canvas): AnimationManager | null => {
  if (canvas && !animationManagerInstance) {
    animationManagerInstance = new AnimationManager(canvas);
  }
  return animationManagerInstance;
};

export const cleanupAnimationManager = (): void => {
  if (animationManagerInstance) {
    animationManagerInstance.cleanup();
    animationManagerInstance = null;
  }
};
