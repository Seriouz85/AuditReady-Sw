import * as fabric from 'fabric';
import { addShapeToCanvas, addTextToCanvas } from '../core/fabric-utils';

export class EditorTestUtils {
  static async createTestScenario(canvas: fabric.Canvas): Promise<void> {
    if (!canvas) {
      console.error('Canvas not available for testing');
      return;
    }

    console.log('Creating test scenario...');

    try {
      // Add some test shapes
      const rect = await addShapeToCanvas(canvas, 'rectangle', {
        left: 100,
        top: 100,
        width: 120,
        height: 80,
        fill: '#3b82f6'
      });

      const circle = await addShapeToCanvas(canvas, 'circle', {
        left: 300,
        top: 100,
        radius: 50,
        fill: '#10b981'
      });

      const triangle = await addShapeToCanvas(canvas, 'triangle', {
        left: 200,
        top: 250,
        width: 100,
        height: 100,
        fill: '#f59e0b'
      });

      // Add some text
      await addTextToCanvas(canvas, 'Test Text 1', {
        left: 100,
        top: 300,
        fontSize: 18,
        fill: '#1f2937'
      });

      await addTextToCanvas(canvas, 'Double-click to edit', {
        left: 300,
        top: 300,
        fontSize: 16,
        fill: '#6b7280'
      });

      console.log('Test scenario created successfully');
      console.log('Test instructions:');
      console.log('1. Double-click shapes to add text');
      console.log('2. Try connecting shapes by dragging from connection points');
      console.log('3. Test undo/redo with Ctrl+Z/Ctrl+Y');
      console.log('4. Select objects to see properties panel');
      console.log('5. Try keyboard shortcuts (Delete, Escape)');

    } catch (error) {
      console.error('Error creating test scenario:', error);
    }
  }

  static testTextEditing(canvas: fabric.Canvas): void {
    console.log('Testing text editing functionality...');
    
    const objects = canvas.getObjects();
    const shapes = objects.filter(obj => 
      obj.type === 'rect' || 
      obj.type === 'circle' || 
      obj.type === 'triangle'
    );

    if (shapes.length > 0) {
      const testShape = shapes[0];
      console.log('Double-click the first shape to test text editing');
      
      // Simulate double-click
      testShape.fire('mousedblclick', {
        e: new MouseEvent('dblclick', { bubbles: true })
      });
    } else {
      console.log('No shapes found to test text editing');
    }
  }

  static testConnectors(canvas: fabric.Canvas): void {
    console.log('Testing connector functionality...');
    
    const objects = canvas.getObjects();
    const shapes = objects.filter(obj => 
      obj.type === 'rect' || 
      obj.type === 'circle' || 
      obj.type === 'triangle'
    );

    if (shapes.length >= 2) {
      console.log('Select a shape and look for connection points');
      console.log('Drag from one connection point to another to create connectors');
      
      // Select first shape to show connection points
      canvas.setActiveObject(shapes[0]);
      canvas.renderAll();
    } else {
      console.log('Need at least 2 shapes to test connectors');
    }
  }

  static testUndoRedo(): void {
    console.log('Testing undo/redo functionality...');
    console.log('1. Make some changes (add shapes, move objects)');
    console.log('2. Press Ctrl+Z to undo');
    console.log('3. Press Ctrl+Y to redo');
    console.log('4. Check the undo/redo buttons in the header');
  }

  static testPropertiesPanel(canvas: fabric.Canvas): void {
    console.log('Testing properties panel...');
    
    const objects = canvas.getObjects();
    if (objects.length > 0) {
      console.log('Selecting first object to show properties panel');
      canvas.setActiveObject(objects[0]);
      canvas.renderAll();
      console.log('Properties panel should appear on the right');
    } else {
      console.log('No objects found to test properties panel');
    }
  }

  static runAllTests(canvas: fabric.Canvas): void {
    console.log('=== Running All Editor Tests ===');
    
    setTimeout(() => {
      this.createTestScenario(canvas);
    }, 1000);

    setTimeout(() => {
      this.testTextEditing(canvas);
    }, 3000);

    setTimeout(() => {
      this.testConnectors(canvas);
    }, 5000);

    setTimeout(() => {
      this.testUndoRedo();
    }, 7000);

    setTimeout(() => {
      this.testPropertiesPanel(canvas);
    }, 9000);

    console.log('All tests scheduled. Check console for results.');
  }

  static logCanvasState(canvas: fabric.Canvas): void {
    console.log('=== Canvas State ===');
    console.log('Objects count:', canvas.getObjects().length);
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
    console.log('Active object:', canvas.getActiveObject()?.type || 'none');
    
    const objects = canvas.getObjects();
    objects.forEach((obj, index) => {
      console.log(`Object ${index}:`, {
        type: obj.type,
        left: obj.left,
        top: obj.top,
        width: obj.width,
        height: obj.height
      });
    });
  }
}

// Add to window for easy access in development
if (typeof window !== 'undefined') {
  (window as any).EditorTestUtils = EditorTestUtils;
}
