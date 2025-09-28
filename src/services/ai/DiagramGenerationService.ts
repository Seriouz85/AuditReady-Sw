/**
 * 🏗️ Diagram Generation Service
 * Handles node/edge creation, positioning, and styling for ReactFlow diagrams
 * Extracted from OneShotDiagramService for better maintainability and separation of concerns
 */

import { Node, Edge, MarkerType } from 'reactflow';
import type { GanttTask, ReactFlowGanttNode } from './OneShotDiagramService';

export class DiagramGenerationService {
  private static instance: DiagramGenerationService;

  private constructor() {}

  public static getInstance(): DiagramGenerationService {
    if (!DiagramGenerationService.instance) {
      DiagramGenerationService.instance = new DiagramGenerationService();
    }
    return DiagramGenerationService.instance;
  }

  /**
   * 📊 GANTT CHART NODE CREATION
   * Creates ReactFlow nodes for Gantt chart visualization
   */
  public createGanttNodes(tasks: GanttTask[]): ReactFlowGanttNode[] {
    const nodes: ReactFlowGanttNode[] = [];
    let yPosition = 100;

    for (const task of tasks) {
      const node: ReactFlowGanttNode = {
        id: task.id,
        type: 'custom',
        position: { 
          x: this.dateToXPosition(task.startDate), 
          y: yPosition 
        },
        data: {
          label: task.name,
          shape: task.milestone ? 'gantt-milestone' : 'gantt-task',
          startDate: task.startDate,
          endDate: task.endDate,
          duration: task.duration,
          progress: task.progress || 0,
          priority: task.priority || 'medium',
          assignee: task.assignee,
          fillColor: this.getPriorityColor(task.priority || 'medium'),
          strokeColor: this.getPriorityStroke(task.priority || 'medium'),
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        },
        style: {
          width: this.calculateTaskWidth(task.duration),
          height: task.milestone ? 30 : 60
        }
      };

      nodes.push(node);
      yPosition += 80;
    }

    return nodes;
  }

  /**
   * 🔗 GANTT CHART EDGE CREATION
   * Creates dependency connections between Gantt tasks
   */
  public createGanttEdges(tasks: GanttTask[]): Edge[] {
    const edges: Edge[] = [];

    for (const task of tasks) {
      if (task.dependencies) {
        for (const depId of task.dependencies) {
          const dependencyTask = tasks.find(t => t.id === depId || `task-${depId}` === task.id);
          if (dependencyTask) {
            edges.push({
              id: `dep-${dependencyTask.id}-${task.id}`,
              source: dependencyTask.id,
              target: task.id,
              type: 'straight',
              style: { stroke: '#64748b', strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
              label: 'depends on'
            });
          }
        }
      }
    }

    return edges;
  }

  /**
   * 📐 ENHANCED FLOWCHART NODE CREATION
   * Creates professional flowchart nodes with better positioning and styling
   */
  public createEnhancedFlowchartNodes(steps: any[], complexity: string): Node[] {
    const positions = this.createAlignedPositions(steps.length, 'flowchart');
    
    return steps.map((step, index) => {
      const shape = step.shape || (step.type === 'start' || step.type === 'end' ? 'circle' : 'rectangle');
      let fillColor = '#f1f5f9';
      let strokeColor = '#475569';
      
      // Enhanced color coding based on step type and shape
      if (step.type === 'start') {
        fillColor = '#dbeafe';
        strokeColor = '#2563eb';
      } else if (step.type === 'end') {
        fillColor = '#dcfce7';
        strokeColor = '#16a34a';
      } else if (shape === 'diamond') {
        fillColor = '#fef3c7';
        strokeColor = '#d97706';
      } else if (shape === 'parallelogram') {
        fillColor = '#e0e7ff';
        strokeColor = '#6366f1';
      } else if (step.name.toLowerCase().includes('error') || step.name.toLowerCase().includes('fail')) {
        fillColor = '#fee2e2';
        strokeColor = '#dc2626';
      } else if (step.name.toLowerCase().includes('success') || step.name.toLowerCase().includes('complete')) {
        fillColor = '#dcfce7';
        strokeColor = '#16a34a';
      }

      return {
        id: step.id,
        type: 'custom',
        position: positions[index],
        data: {
          label: step.name,
          shape,
          fillColor,
          strokeColor,
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      };
    });
  }

  /**
   * 🔗 ENHANCED FLOWCHART EDGE CREATION
   * Creates sophisticated edge connections with proper styling and labels
   */
  public createEnhancedFlowchartEdges(steps: any[], complexity: string): Edge[] {
    const edges: Edge[] = [];
    let edgeCounter = 1;
    
    for (let i = 0; i < steps.length - 1; i++) {
      const currentStep = steps[i];
      const nextStep = steps[i + 1];
      
      let label = '';
      let edgeStyle = { stroke: '#1e293b', strokeWidth: 2 };
      
      // Enhanced edge styling based on step types and complexity
      if (currentStep.name.toLowerCase().includes('decision') || currentStep.shape === 'diamond') {
        // Decision point styling
        label = 'Yes/Approve';
        edgeStyle.stroke = '#16a34a';
        
        // Add alternative path for decision points in complex scenarios
        if (complexity === 'complex' && i < steps.length - 2) {
          const alternativeTarget = steps[Math.min(i + 2, steps.length - 1)].id;
          edges.push({
            id: `edge-alt-${edgeCounter++}`,
            source: currentStep.id,
            target: alternativeTarget,
            type: 'straight',
            label: 'No/Reject',
            style: { stroke: '#dc2626', strokeWidth: 2, strokeDasharray: '5,5' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#dc2626' }
          });
        }
      } else if (currentStep.name.toLowerCase().includes('error')) {
        // Error recovery paths
        label = 'Retry';
        edgeStyle = { stroke: '#dc2626', strokeWidth: 2, strokeDasharray: '5,5' };
      } else if (currentStep.name.toLowerCase().includes('parallel') || currentStep.name.toLowerCase().includes('validation')) {
        // Parallel process styling
        edgeStyle.stroke = '#6366f1';
      }
      
      // Main edge
      edges.push({
        id: `edge-${edgeCounter++}`,
        source: currentStep.id,
        target: nextStep.id,
        type: 'straight',
        label,
        style: edgeStyle,
        markerEnd: { type: MarkerType.ArrowClosed, color: edgeStyle.stroke }
      });
      
      // Add feedback loops for complex processes
      if (complexity === 'complex' && currentStep.name.toLowerCase().includes('review') && i < steps.length - 2) {
        const feedbackTarget = steps[Math.max(0, i - 1)].id;
        edges.push({
          id: `edge-feedback-${edgeCounter++}`,
          source: currentStep.id,
          target: feedbackTarget,
          type: 'straight',
          label: 'Revision Required',
          style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '10,5' },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' }
        });
      }
    }
    
    return edges;
  }

  /**
   * 🔄 SIMPLE FLOWCHART CREATION
   * Fallback for simple flowchart generation
   */
  public createFlowchartNodes(steps: any[]): Node[] {
    return this.createEnhancedFlowchartNodes(steps, 'medium');
  }

  public createFlowchartEdges(steps: any[]): Edge[] {
    return this.createEnhancedFlowchartEdges(steps, 'medium');
  }

  /**
   * 🌐 NETWORK DIAGRAM NODE CREATION
   * Creates nodes for network topology diagrams
   */
  public createNetworkNodes(components: any[]): Node[] {
    return components.map((comp, index) => ({
      id: comp.id,
      type: 'custom',
      position: { x: 150 + (index % 3) * 200, y: 100 + Math.floor(index / 3) * 150 },
      data: {
        label: comp.name,
        shape: comp.type === 'database' ? 'hexagon' : 'rectangle',
        fillColor: this.getNetworkTypeColor(comp.type),
        strokeColor: this.getNetworkTypeStroke(comp.type),
        textColor: '#1e293b',
        onLabelChange: () => {},
        onUpdate: () => {}
      }
    }));
  }

  /**
   * 🔗 NETWORK DIAGRAM EDGE CREATION
   * Creates connections between network components
   */
  public createNetworkEdges(components: any[]): Edge[] {
    const edges: Edge[] = [];
    
    // Create logical connections between components
    for (let i = 0; i < components.length - 1; i++) {
      edges.push({
        id: `conn-${i}`,
        source: components[i].id,
        target: components[i + 1].id,
        type: 'straight',
        style: { stroke: '#64748b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' }
      });
    }
    
    return edges;
  }

  /**
   * ⚠️ RISK MANAGEMENT EDGE CREATION
   * Creates sophisticated edge connections for risk management processes
   */
  public createRiskManagementEdges(): Edge[] {
    return [
      {
        id: 'risk-edge-1',
        source: 'risk-start',
        target: 'risk-register-check',
        type: 'smoothstep',
        style: { stroke: '#2563eb', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#2563eb' }
      },
      {
        id: 'risk-edge-2',
        source: 'risk-register-check',
        target: 'risk-assessment',
        type: 'smoothstep',
        label: 'No',
        style: { stroke: '#16a34a', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#16a34a' }
      }
      // Additional risk management edges would be added here...
    ];
  }

  /**
   * 📐 IMPROVED ALIGNMENT POSITIONING
   * Creates perfectly aligned grid positions for process flows
   */
  public createAlignedPositions(nodeCount: number, diagramType: string): Array<{x: number, y: number}> {
    const positions: Array<{x: number, y: number}> = [];
    const GRID_SIZE = 150; // Standard spacing for better alignment
    const START_X = 400; // Center alignment
    const START_Y = 100; // Top margin
    
    if (diagramType === 'flowchart' || diagramType === 'process') {
      // Vertical flow with perfect center alignment
      for (let i = 0; i < nodeCount; i++) {
        positions.push({
          x: START_X, // All nodes perfectly centered
          y: START_Y + (i * GRID_SIZE) // Equal vertical spacing
        });
      }
    } else if (diagramType === 'network') {
      // Grid layout for network diagrams
      const cols = Math.ceil(Math.sqrt(nodeCount));
      for (let i = 0; i < nodeCount; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        positions.push({
          x: START_X + (col - (cols-1)/2) * GRID_SIZE, // Center horizontally
          y: START_Y + row * GRID_SIZE
        });
      }
    } else {
      // Default linear layout with perfect alignment
      for (let i = 0; i < nodeCount; i++) {
        positions.push({
          x: START_X,
          y: START_Y + (i * GRID_SIZE)
        });
      }
    }
    
    return positions;
  }

  // Helper methods for positioning and styling
  private dateToXPosition(date: Date): number {
    const now = new Date();
    const daysDiff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return 100 + (daysDiff * 30); // 30px per day
  }

  private calculateTaskWidth(duration: number): number {
    return Math.max(120, duration * 30); // Minimum 120px, 30px per day
  }

  private getPriorityColor(priority: string): string {
    const colors = {
      'critical': '#ef4444',
      'high': '#f97316',
      'medium': '#3b82f6',
      'low': '#10b981'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  }

  private getPriorityStroke(priority: string): string {
    const colors = {
      'critical': '#dc2626',
      'high': '#ea580c',
      'medium': '#2563eb',
      'low': '#059669'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  }

  private getNetworkTypeColor(type: string): string {
    const colors = {
      'server': '#e1f5fe',
      'database': '#f3e5f5',
      'security': '#ffebee',
      'network': '#e8f5e8',
      'user': '#fff3e0'
    };
    return colors[type as keyof typeof colors] || '#f1f5f9';
  }

  private getNetworkTypeStroke(type: string): string {
    const strokes = {
      'server': '#0288d1',
      'database': '#7b1fa2',
      'security': '#d32f2f',
      'network': '#2e7d32',
      'user': '#f57c00'
    };
    return strokes[type as keyof typeof strokes] || '#475569';
  }
}