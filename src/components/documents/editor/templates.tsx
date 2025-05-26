import { Node, Edge, MarkerType } from 'reactflow';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'Flowchart' | 'Process' | 'Organization' | 'Timeline' | 'Infographic' | 'Brainstorming';
  nodes: Node[];
  edges: Edge[];
}

// ... existing templates

// New Professional Timeline Template based on the image
const yearlyTimelineTemplate: Template = {
  id: 'yearly-timeline',
  name: 'Yearly Timeline',
  description: 'Professional 12-month timeline with hexagonal elements',
  category: 'Timeline',
  nodes: [
    // Title 
    {
      id: 'timeline-title',
      type: 'textNode',
      position: { x: 475, y: 100 },
      data: {
        label: 'ANNUAL TIMELINE',
        fontSize: 30,
        fontWeight: 'bold',
        color: '#333333',
        width: 300,
        textAlign: 'center'
      }
    },
    {
      id: 'timeline-subtitle',
      type: 'textNode',
      position: { x: 475, y: 140 },
      data: {
        label: 'KEY MILESTONES FOR THE YEAR',
        fontSize: 16,
        fontWeight: 'normal',
        color: '#666666',
        width: 300,
        textAlign: 'center'
      }
    },
    
    // Main timeline bar background
    {
      id: 'timeline-bar-bg',
      type: 'shapeNode',
      position: { x: 475, y: 230 },
      data: {
        shapeType: 'rectangle',
        label: '',
        color: '#F2F2F2',
        width: 730,
        height: 40,
        borderRadius: 8
      }
    },
    
    // Month segments - January to December - positioned perfectly side by side
    {
      id: 'month-segment-jan',
      type: 'shapeNode',
      position: { x: 145, y: 230 },
      data: {
        shapeType: 'rectangle',
        label: 'Jan',
        color: '#ED6B5B',
        textColor: 'white',
        width: 60,
        height: 40,
        borderRadius: '8px 0 0 8px',
        fontSize: 11,
        fontWeight: 'bold'
      }
    },
    {
      id: 'month-segment-feb',
      type: 'shapeNode',
      position: { x: 205, y: 230 },
      data: {
        shapeType: 'rectangle',
        label: 'Feb',
        color: '#F39C63',
        textColor: 'white',
        width: 60,
        height: 40,
        fontSize: 11,
        fontWeight: 'bold'
      }
    },
    {
      id: 'month-segment-mar',
      type: 'shapeNode',
      position: { x: 265, y: 230 },
      data: {
        shapeType: 'rectangle',
        label: 'Mar',
        color: '#F9C74F',
        textColor: 'white',
        width: 60,
        height: 40,
        fontSize: 11,
        fontWeight: 'bold'
      }
    },
    {
      id: 'month-segment-apr',
      type: 'shapeNode',
      position: { x: 325, y: 230 },
      data: {
        shapeType: 'rectangle',
        label: 'Apr',
        color: '#B8CE6D',
        textColor: 'white',
        width: 60,
        height: 40,
        fontSize: 11,
        fontWeight: 'bold'
      }
    },
    {
      id: 'month-segment-may',
      type: 'shapeNode',
      position: { x: 385, y: 230 },
      data: {
        shapeType: 'rectangle',
        label: 'May',
        color: '#71BC88',
        textColor: 'white',
        width: 60,
        height: 40,
        fontSize: 11,
        fontWeight: 'bold'
      }
    },
    {
      id: 'month-segment-jun',
      type: 'shapeNode',
      position: { x: 445, y: 230 },
      data: {
        shapeType: 'rectangle',
        label: 'Jun',
        color: '#73C2BE',
        textColor: 'white',
        width: 60,
        height: 40,
        fontSize: 11,
        fontWeight: 'bold'
      }
    },
    {
      id: 'month-segment-jul',
      type: 'shapeNode',
      position: { x: 505, y: 230 },
      data: {
        shapeType: 'rectangle',
        label: 'Jul',
        color: '#65B0C9',
        textColor: 'white',
        width: 60,
        height: 40,
        fontSize: 11,
        fontWeight: 'bold'
      }
    },
    {
      id: 'month-segment-aug',
      type: 'shapeNode',
      position: { x: 565, y: 230 },
      data: {
        shapeType: 'rectangle',
        label: 'Aug',
        color: '#4E89C5',
        textColor: 'white',
        width: 60,
        height: 40,
        fontSize: 11,
        fontWeight: 'bold'
      }
    },
    {
      id: 'month-segment-sep',
      type: 'shapeNode',
      position: { x: 625, y: 230 },
      data: {
        shapeType: 'rectangle',
        label: 'Sep',
        color: '#6973BC',
        textColor: 'white',
        width: 60,
        height: 40,
        fontSize: 11,
        fontWeight: 'bold'
      }
    },
    {
      id: 'month-segment-oct',
      type: 'shapeNode',
      position: { x: 685, y: 230 },
      data: {
        shapeType: 'rectangle',
        label: 'Oct',
        color: '#9370B3',
        textColor: 'white',
        width: 60,
        height: 40,
        fontSize: 11,
        fontWeight: 'bold'
      }
    },
    {
      id: 'month-segment-nov',
      type: 'shapeNode',
      position: { x: 745, y: 230 },
      data: {
        shapeType: 'rectangle',
        label: 'Nov',
        color: '#A65C9E',
        textColor: 'white',
        width: 60,
        height: 40,
        fontSize: 11,
        fontWeight: 'bold'
      }
    },
    {
      id: 'month-segment-dec',
      type: 'shapeNode',
      position: { x: 805, y: 230 },
      data: {
        shapeType: 'rectangle',
        label: 'Dec',
        color: '#C25687',
        textColor: 'white',
        width: 60,
        height: 40,
        borderRadius: '0 8px 8px 0',
        fontSize: 11,
        fontWeight: 'bold'
      }
    },
    
    // Odd month hexagons (top row) - positioned evenly aligned with month segments
    {
      id: 'hexagon-01',
      type: 'shapeNode',
      position: { x: 175, y: 170 },
      data: {
        shapeType: 'hexagon',
        label: '01',
        color: '#ED6B5B',
        textColor: 'white',
        width: 36,
        height: 36,
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    {
      id: 'hexagon-03',
      type: 'shapeNode',
      position: { x: 295, y: 170 },
      data: {
        shapeType: 'hexagon',
        label: '03',
        color: '#F9C74F',
        textColor: 'white',
        width: 36,
        height: 36,
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    {
      id: 'hexagon-05',
      type: 'shapeNode',
      position: { x: 415, y: 170 },
      data: {
        shapeType: 'hexagon',
        label: '05',
        color: '#71BC88',
        textColor: 'white',
        width: 36,
        height: 36,
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    {
      id: 'hexagon-07',
      type: 'shapeNode',
      position: { x: 535, y: 170 },
      data: {
        shapeType: 'hexagon',
        label: '07',
        color: '#65B0C9',
        textColor: 'white',
        width: 36,
        height: 36,
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    {
      id: 'hexagon-09',
      type: 'shapeNode',
      position: { x: 655, y: 170 },
      data: {
        shapeType: 'hexagon',
        label: '09',
        color: '#6973BC',
        textColor: 'white',
        width: 36,
        height: 36,
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    {
      id: 'hexagon-11',
      type: 'shapeNode',
      position: { x: 775, y: 170 },
      data: {
        shapeType: 'hexagon',
        label: '11',
        color: '#A65C9E',
        textColor: 'white',
        width: 36,
        height: 36,
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    
    // Even month hexagons (bottom row) - aligned precisely with month segments
    {
      id: 'hexagon-02',
      type: 'shapeNode',
      position: { x: 235, y: 290 },
      data: {
        shapeType: 'hexagon',
        label: '02',
        color: '#F39C63',
        textColor: 'white',
        width: 36,
        height: 36,
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    {
      id: 'hexagon-04',
      type: 'shapeNode',
      position: { x: 355, y: 290 },
      data: {
        shapeType: 'hexagon',
        label: '04',
        color: '#B8CE6D',
        textColor: 'white',
        width: 36,
        height: 36,
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    {
      id: 'hexagon-06',
      type: 'shapeNode',
      position: { x: 475, y: 290 },
      data: {
        shapeType: 'hexagon',
        label: '06',
        color: '#73C2BE',
        textColor: 'white',
        width: 36,
        height: 36,
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    {
      id: 'hexagon-08',
      type: 'shapeNode',
      position: { x: 595, y: 290 },
      data: {
        shapeType: 'hexagon',
        label: '08',
        color: '#4E89C5',
        textColor: 'white',
        width: 36,
        height: 36,
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    {
      id: 'hexagon-10',
      type: 'shapeNode',
      position: { x: 715, y: 290 },
      data: {
        shapeType: 'hexagon',
        label: '10',
        color: '#9370B3',
        textColor: 'white',
        width: 36,
        height: 36,
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    {
      id: 'hexagon-12',
      type: 'shapeNode',
      position: { x: 835, y: 290 },
      data: {
        shapeType: 'hexagon',
        label: '12',
        color: '#C25687',
        textColor: 'white',
        width: 36,
        height: 36,
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    
    // Titles and content text - aligned with hexagons
    {
      id: 'title-01',
      type: 'textNode',
      position: { x: 175, y: 130 },
      data: {
        label: 'Q1 Goals',
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333333',
        textAlign: 'center',
        width: 60
      }
    },
    
    {
      id: 'content-01',
      type: 'textNode',
      position: { x: 175, y: 335 },
      data: {
        label: 'Key milestone achieved',
        fontSize: 10,
        color: '#555555',
        width: 80,
        textAlign: 'center'
      }
    },
    
    // Add some content examples for other months
    {
      id: 'title-07',
      type: 'textNode',
      position: { x: 535, y: 130 },
      data: {
        label: 'Mid-year Review',
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333333',
        textAlign: 'center',
        width: 80
      }
    },
    
    {
      id: 'content-07',
      type: 'textNode',
      position: { x: 535, y: 335 },
      data: {
        label: 'Half-year assessment complete',
        fontSize: 10,
        color: '#555555',
        width: 90,
        textAlign: 'center'
      }
    },
    
    {
      id: 'title-12',
      type: 'textNode',
      position: { x: 835, y: 335 },
      data: {
        label: 'Year-end Summary',
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333333',
        textAlign: 'center',
        width: 80
      }
    }
  ],
  // Add connector edges to visualize relationships
  edges: [
    // January milestone connection
    {
      id: 'edge-jan-milestone',
      source: 'month-segment-jan',
      target: 'hexagon-01',
      type: 'default',
      style: { stroke: '#ED6B5B', strokeWidth: 2, strokeDasharray: '5,5' }
    },
    // March milestone connection
    {
      id: 'edge-mar-milestone',
      source: 'month-segment-mar',
      target: 'hexagon-03',
      type: 'default',
      style: { stroke: '#F9C74F', strokeWidth: 2, strokeDasharray: '5,5' }
    },
    // July milestone connection
    {
      id: 'edge-jul-milestone', 
      source: 'month-segment-jul',
      target: 'hexagon-07',
      type: 'default',
      style: { stroke: '#65B0C9', strokeWidth: 2, strokeDasharray: '5,5' }
    },
    // September milestone connection
    {
      id: 'edge-sep-milestone',
      source: 'month-segment-sep',
      target: 'hexagon-09',
      type: 'default',
      style: { stroke: '#6973BC', strokeWidth: 2, strokeDasharray: '5,5' }
    },
    // December milestone connection
    {
      id: 'edge-dec-milestone',
      source: 'month-segment-dec',
      target: 'hexagon-12',
      type: 'default',
      style: { stroke: '#C25687', strokeWidth: 2, strokeDasharray: '5,5' }
    }
  ]
};

// Project Plan Template
const projectPlanTemplate: Template = {
  id: 'project-plan',
  name: 'Project Plan',
  description: 'Professional project planning timeline with milestones and phases',
  category: 'Timeline',
  nodes: [
    // Header/Title
    {
      id: 'project-title',
      type: 'textNode',
      position: { x: 640, y: 50 },
      data: {
        label: 'PROJECT PLAN',
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333333',
        width: 300,
        textAlign: 'center'
      }
    },
    {
      id: 'project-subtitle',
      type: 'textNode',
      position: { x: 640, y: 90 },
      data: {
        label: 'STRATEGIC IMPLEMENTATION TIMELINE',
        fontSize: 16,
        fontWeight: 'normal',
        color: '#666666',
        width: 300,
        textAlign: 'center'
      }
    },
    
    // Main timeline container
    {
      id: 'timeline-container',
      type: 'shapeNode',
      position: { x: 640, y: 350 },
      data: {
        shapeType: 'rectangle',
        label: '',
        color: '#FAFAFA',
        width: 1100,
        height: 400,
        borderRadius: 8
      }
    },
    
    // Phase headers
    {
      id: 'phase-header-1',
      type: 'textNode',
      position: { x: 250, y: 180 },
      data: {
        label: 'PHASE 1: PLANNING',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2065D1',
        width: 200,
        textAlign: 'center'
      }
    },
    {
      id: 'phase-header-2',
      type: 'textNode',
      position: { x: 640, y: 180 },
      data: {
        label: 'PHASE 2: IMPLEMENTATION',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#00A76F',
        width: 200,
        textAlign: 'center'
      }
    },
    {
      id: 'phase-header-3',
      type: 'textNode',
      position: { x: 1030, y: 180 },
      data: {
        label: 'PHASE 3: EVALUATION',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF5630',
        width: 200,
        textAlign: 'center'
      }
    },
    
    // Phase dividers 
    {
      id: 'phase-divider-1',
      type: 'shapeNode',
      position: { x: 250, y: 350 },
      data: {
        shapeType: 'rectangle',
        label: '',
        color: 'rgba(32, 101, 209, 0.08)',
        width: 2,
        height: 400
      }
    },
    {
      id: 'phase-divider-2',
      type: 'shapeNode',
      position: { x: 640, y: 350 },
      data: {
        shapeType: 'rectangle',
        label: '',
        color: 'rgba(0, 167, 111, 0.08)',
        width: 2,
        height: 400
      }
    },
    {
      id: 'phase-divider-3',
      type: 'shapeNode',
      position: { x: 1030, y: 350 },
      data: {
        shapeType: 'rectangle',
        label: '',
        color: 'rgba(255, 86, 48, 0.08)',
        width: 2,
        height: 400
      }
    },
    
    // Timeline horizontal line
    {
      id: 'timeline-line',
      type: 'shapeNode',
      position: { x: 640, y: 350 },
      data: {
        shapeType: 'rectangle',
        label: '',
        color: '#DDDDDD',
        width: 1000,
        height: 4
      }
    },
    
    // Time markers
    {
      id: 'time-marker-1',
      type: 'textNode',
      position: { x: 150, y: 320 },
      data: {
        label: 'MONTH 1',
        fontSize: 14,
        fontWeight: 'normal',
        color: '#666666',
        width: 100,
        textAlign: 'center'
      }
    },
    {
      id: 'time-marker-2',
      type: 'textNode',
      position: { x: 350, y: 320 },
      data: {
        label: 'MONTH 2',
        fontSize: 14,
        fontWeight: 'normal',
        color: '#666666',
        width: 100,
        textAlign: 'center'
      }
    },
    {
      id: 'time-marker-3',
      type: 'textNode',
      position: { x: 550, y: 320 },
      data: {
        label: 'MONTH 3',
        fontSize: 14,
        fontWeight: 'normal',
        color: '#666666',
        width: 100,
        textAlign: 'center'
      }
    },
    {
      id: 'time-marker-4',
      type: 'textNode',
      position: { x: 750, y: 320 },
      data: {
        label: 'MONTH 4',
        fontSize: 14,
        fontWeight: 'normal',
        color: '#666666',
        width: 100,
        textAlign: 'center'
      }
    },
    {
      id: 'time-marker-5',
      type: 'textNode',
      position: { x: 950, y: 320 },
      data: {
        label: 'MONTH 5',
        fontSize: 14,
        fontWeight: 'normal',
        color: '#666666',
        width: 100,
        textAlign: 'center'
      }
    },
    {
      id: 'time-marker-6',
      type: 'textNode',
      position: { x: 1150, y: 320 },
      data: {
        label: 'MONTH 6',
        fontSize: 14,
        fontWeight: 'normal',
        color: '#666666',
        width: 100,
        textAlign: 'center'
      }
    },
    
    // Phase 1 Tasks
    {
      id: 'task-1-1',
      type: 'shapeNode',
      position: { x: 200, y: 250 },
      data: {
        shapeType: 'rectangle',
        label: 'Requirements Analysis',
        color: '#2065D1',
        textColor: '#FFFFFF',
        width: 180,
        height: 60,
        borderRadius: 8
      }
    },
    {
      id: 'task-1-2',
      type: 'shapeNode',
      position: { x: 350, y: 250 },
      data: {
        shapeType: 'rectangle',
        label: 'Research & Planning',
        color: '#2065D1',
        textColor: '#FFFFFF',
        width: 180,
        height: 60,
        borderRadius: 8
      }
    },
    
    // Phase 2 Tasks
    {
      id: 'task-2-1',
      type: 'shapeNode',
      position: { x: 500, y: 250 },
      data: {
        shapeType: 'rectangle',
        label: 'Design Phase',
        color: '#00A76F',
        textColor: '#FFFFFF',
        width: 180,
        height: 60,
        borderRadius: 8
      }
    },
    {
      id: 'task-2-2',
      type: 'shapeNode',
      position: { x: 650, y: 250 },
      data: {
        shapeType: 'rectangle',
        label: 'Development',
        color: '#00A76F',
        textColor: '#FFFFFF',
        width: 180,
        height: 60,
        borderRadius: 8
      }
    },
    {
      id: 'task-2-3',
      type: 'shapeNode',
      position: { x: 800, y: 250 },
      data: {
        shapeType: 'rectangle',
        label: 'Testing',
        color: '#00A76F',
        textColor: '#FFFFFF',
        width: 180,
        height: 60,
        borderRadius: 8
      }
    },
    
    // Phase 3 Tasks
    {
      id: 'task-3-1',
      type: 'shapeNode',
      position: { x: 950, y: 250 },
      data: {
        shapeType: 'rectangle',
        label: 'Deployment',
        color: '#FF5630',
        textColor: '#FFFFFF',
        width: 180,
        height: 60,
        borderRadius: 8
      }
    },
    {
      id: 'task-3-2',
      type: 'shapeNode',
      position: { x: 1100, y: 250 },
      data: {
        shapeType: 'rectangle',
        label: 'Review & Feedback',
        color: '#FF5630',
        textColor: '#FFFFFF',
        width: 180,
        height: 60,
        borderRadius: 8
      }
    },
    
    // Milestones
    {
      id: 'milestone-1',
      type: 'shapeNode',
      position: { x: 350, y: 400 },
      data: {
        shapeType: 'diamond',
        label: 'Project Kickoff',
        color: '#2065D1',
        textColor: '#FFFFFF',
        width: 120,
        height: 120
      }
    },
    {
      id: 'milestone-2',
      type: 'shapeNode',
      position: { x: 650, y: 400 },
      data: {
        shapeType: 'diamond',
        label: 'MVP Release',
        color: '#00A76F',
        textColor: '#FFFFFF',
        width: 120,
        height: 120
      }
    },
    {
      id: 'milestone-3',
      type: 'shapeNode',
      position: { x: 950, y: 400 },
      data: {
        shapeType: 'diamond',
        label: 'Project Completion',
        color: '#FF5630',
        textColor: '#FFFFFF',
        width: 120,
        height: 120
      }
    },
    
    // Task descriptions
    {
      id: 'desc-1-1',
      type: 'textNode',
      position: { x: 200, y: 450 },
      data: {
        label: 'Define project scope and gather requirements from stakeholders',
        fontSize: 12,
        fontWeight: 'normal',
        color: '#666666',
        width: 180,
        textAlign: 'center'
      }
    },
    {
      id: 'desc-1-2',
      type: 'textNode',
      position: { x: 350, y: 500 },
      data: {
        label: 'Project plan approved and resources allocated',
        fontSize: 12,
        fontWeight: 'normal',
        color: '#666666',
        width: 180,
        textAlign: 'center'
      }
    },
    {
      id: 'desc-2-1',
      type: 'textNode',
      position: { x: 500, y: 450 },
      data: {
        label: 'Create wireframes and technical architecture',
        fontSize: 12,
        fontWeight: 'normal',
        color: '#666666',
        width: 180,
        textAlign: 'center'
      }
    },
    {
      id: 'desc-2-2',
      type: 'textNode',
      position: { x: 650, y: 500 },
      data: {
        label: 'First version of the product with core functionality',
        fontSize: 12,
        fontWeight: 'normal',
        color: '#666666',
        width: 180,
        textAlign: 'center'
      }
    },
    {
      id: 'desc-2-3',
      type: 'textNode',
      position: { x: 800, y: 450 },
      data: {
        label: 'QA testing and bug fixing',
        fontSize: 12,
        fontWeight: 'normal',
        color: '#666666',
        width: 180,
        textAlign: 'center'
      }
    },
    {
      id: 'desc-3-1',
      type: 'textNode',
      position: { x: 950, y: 500 },
      data: {
        label: 'Final product delivered to end users',
        fontSize: 12,
        fontWeight: 'normal',
        color: '#666666',
        width: 180,
        textAlign: 'center'
      }
    },
    {
      id: 'desc-3-2',
      type: 'textNode',
      position: { x: 1100, y: 450 },
      data: {
        label: 'Collect feedback and identify improvements',
        fontSize: 12,
        fontWeight: 'normal',
        color: '#666666',
        width: 180,
        textAlign: 'center'
      }
    },
    
    // Legend
    {
      id: 'legend-title',
      type: 'textNode',
      position: { x: 640, y: 600 },
      data: {
        label: 'LEGEND',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333333',
        width: 100,
        textAlign: 'center'
      }
    },
    {
      id: 'legend-item-1',
      type: 'shapeNode',
      position: { x: 520, y: 635 },
      data: {
        shapeType: 'rectangle',
        label: 'Task',
        color: '#2065D1',
        textColor: '#FFFFFF',
        width: 100,
        height: 30,
        borderRadius: 8
      }
    },
    {
      id: 'legend-item-2',
      type: 'shapeNode',
      position: { x: 640, y: 635 },
      data: {
        shapeType: 'diamond',
        label: 'Milestone',
        color: '#00A76F',
        textColor: '#FFFFFF',
        width: 60,
        height: 60
      }
    },
    {
      id: 'legend-item-3',
      type: 'textNode',
      position: { x: 760, y: 635 },
      data: {
        label: 'Description',
        fontSize: 14,
        fontWeight: 'normal',
        color: '#666666',
        width: 100,
        textAlign: 'center'
      }
    }
  ],
  edges: [
    // Connections between tasks (flow)
    {
      id: 'edge-task1-1-to-task1-2',
      source: 'task-1-1',
      target: 'task-1-2',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#2065D1', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#2065D1' }
    },
    {
      id: 'edge-task1-2-to-task2-1',
      source: 'task-1-2',
      target: 'task-2-1',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#2065D1', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#2065D1' }
    },
    {
      id: 'edge-task2-1-to-task2-2',
      source: 'task-2-1',
      target: 'task-2-2',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#00A76F', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#00A76F' }
    },
    {
      id: 'edge-task2-2-to-task2-3',
      source: 'task-2-2',
      target: 'task-2-3',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#00A76F', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#00A76F' }
    },
    {
      id: 'edge-task2-3-to-task3-1',
      source: 'task-2-3',
      target: 'task-3-1',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#00A76F', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#00A76F' }
    },
    {
      id: 'edge-task3-1-to-task3-2',
      source: 'task-3-1',
      target: 'task-3-2',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#FF5630', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#FF5630' }
    },
    
    // Connections to milestones
    {
      id: 'edge-task1-2-to-milestone1',
      source: 'task-1-2',
      target: 'milestone-1',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#2065D1', strokeWidth: 2, strokeDasharray: '5,5' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#2065D1' }
    },
    {
      id: 'edge-task2-2-to-milestone2',
      source: 'task-2-2',
      target: 'milestone-2',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#00A76F', strokeWidth: 2, strokeDasharray: '5,5' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#00A76F' }
    },
    {
      id: 'edge-task3-1-to-milestone3',
      source: 'task-3-1',
      target: 'milestone-3',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#FF5630', strokeWidth: 2, strokeDasharray: '5,5' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#FF5630' }
    }
  ]
};

// Export the templates
export const templates = {
  'process-flow': {
    id: 'process-flow',
    name: 'Process Flow',
    description: 'A standard process flow diagram with connected steps',
    category: 'Process',
    nodes: [
      // Process flow nodes - positioned in exact horizontal alignment
      {
        id: 'start',
        type: 'shapeNode',
        position: { x: 100, y: 200 },
        data: {
          shapeType: 'rectangle',
          width: 150,
          height: 60,
          color: '#4CAF50',
          label: 'Start Process',
          textColor: '#fff',
        },
      },
      {
        id: 'step1',
        type: 'shapeNode',
        position: { x: 350, y: 200 },
        data: {
          shapeType: 'rectangle',
          width: 150,
          height: 60,
          color: '#2196F3',
          label: 'Step 1',
          textColor: '#fff',
        },
      },
      {
        id: 'step2',
        type: 'shapeNode',
        position: { x: 600, y: 200 },
        data: {
          shapeType: 'rectangle',
          width: 150,
          height: 60,
          color: '#2196F3',
          label: 'Step 2',
          textColor: '#fff',
        },
      },
      {
        id: 'end',
        type: 'shapeNode',
        position: { x: 850, y: 200 },
        data: {
          shapeType: 'rectangle',
          width: 150,
          height: 60,
          color: '#F44336',
          label: 'End Process',
          textColor: '#fff',
        },
      },
    ],
    edges: [
      {
        id: 'e1-2',
        source: 'start',
        target: 'step1',
        type: 'smoothstep',
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#555' },
        style: { stroke: '#555', strokeWidth: 2 },
      },
      {
        id: 'e2-3',
        source: 'step1',
        target: 'step2',
        type: 'smoothstep',
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#555' },
        style: { stroke: '#555', strokeWidth: 2 },
      },
      {
        id: 'e3-4',
        source: 'step2',
        target: 'end',
        type: 'smoothstep',
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#555' },
        style: { stroke: '#555', strokeWidth: 2 },
      },
    ],
  },
  'org-chart': {
    id: 'org-chart',
    name: 'Organization Chart',
    description: 'A hierarchical organizational structure with leadership roles',
    category: 'Organization',
    nodes: [
      {
        id: 'ceo',
        type: 'shapeNode',
        position: { x: 400, y: 50 },
        data: {
          shapeType: 'rectangle',
          width: 180,
          height: 70,
          color: '#3f51b5',
          label: 'CEO',
          textColor: '#fff',
        },
      },
      {
        id: 'cto',
        type: 'shapeNode',
        position: { x: 200, y: 200 },
        data: {
          shapeType: 'rectangle',
          width: 160,
          height: 70,
          color: '#00796b',
          label: 'CTO',
          textColor: '#fff',
        },
      },
      {
        id: 'cfo',
        type: 'shapeNode',
        position: { x: 400, y: 200 },
        data: {
          shapeType: 'rectangle',
          width: 160,
          height: 70,
          color: '#00796b',
          label: 'CFO',
          textColor: '#fff',
        },
      },
      {
        id: 'coo',
        type: 'shapeNode',
        position: { x: 600, y: 200 },
        data: {
          shapeType: 'rectangle',
          width: 160,
          height: 70,
          color: '#00796b',
          label: 'COO',
          textColor: '#fff',
        },
      },
    ],
    edges: [
      {
        id: 'e1-2',
        source: 'ceo',
        target: 'cto',
        type: 'step',
        style: { stroke: '#555', strokeWidth: 2 },
      },
      {
        id: 'e1-3',
        source: 'ceo',
        target: 'cfo',
        type: 'step',
        style: { stroke: '#555', strokeWidth: 2 },
      },
      {
        id: 'e1-4',
        source: 'ceo',
        target: 'coo',
        type: 'step',
        style: { stroke: '#555', strokeWidth: 2 },
      },
    ],
  },
  'flowchart': {
    id: 'flowchart',
    name: 'Decision Flowchart',
    description: 'A decision-based flowchart with yes/no paths and outcomes',
    category: 'Flowchart',
    nodes: [
      {
        id: 'start',
        type: 'shapeNode',
        position: { x: 400, y: 50 },
        data: {
          shapeType: 'rectangle',
          width: 140,
          height: 60,
          color: '#4CAF50',
          label: 'Start',
          textColor: '#fff',
        },
      },
      {
        id: 'decision',
        type: 'shapeNode',
        position: { x: 400, y: 180 },
        data: {
          shapeType: 'diamond',
          width: 200,
          height: 100,
          color: '#FF9800',
          label: 'Decision?',
          textColor: '#fff',
        },
      },
      {
        id: 'yes',
        type: 'shapeNode',
        position: { x: 200, y: 320 },
        data: {
          shapeType: 'rectangle',
          width: 120,
          height: 60,
          color: '#4CAF50',
          label: 'Yes',
          textColor: '#fff',
        },
      },
      {
        id: 'no',
        type: 'shapeNode',
        position: { x: 600, y: 320 },
        data: {
          shapeType: 'rectangle',
          width: 120,
          height: 60,
          color: '#F44336',
          label: 'No',
          textColor: '#fff',
        },
      },
      {
        id: 'end',
        type: 'shapeNode',
        position: { x: 400, y: 450 },
        data: {
          shapeType: 'rectangle',
          width: 140,
          height: 60,
          color: '#607D8B',
          label: 'End',
          textColor: '#fff',
        },
      },
    ],
    edges: [
      {
        id: 'e1-2',
        source: 'start',
        target: 'decision',
        type: 'smoothstep',
        style: { stroke: '#555', strokeWidth: 2 },
      },
      {
        id: 'e2-3',
        source: 'decision',
        target: 'yes',
        type: 'smoothstep',
        style: { stroke: '#555', strokeWidth: 2 },
        label: 'Yes',
      },
      {
        id: 'e2-4',
        source: 'decision',
        target: 'no',
        type: 'smoothstep',
        style: { stroke: '#555', strokeWidth: 2 },
        label: 'No',
      },
      {
        id: 'e3-5',
        source: 'yes',
        target: 'end',
        type: 'smoothstep',
        style: { stroke: '#555', strokeWidth: 2 },
      },
      {
        id: 'e4-5',
        source: 'no',
        target: 'end',
        type: 'smoothstep',
        style: { stroke: '#555', strokeWidth: 2 },
      },
    ],
  },
  'mind-map': {
    id: 'mind-map',
    name: 'Mind Map',
    description: 'A central idea with related concepts branching outward',
    category: 'Brainstorming',
    nodes: [
      {
        id: 'central',
        type: 'shapeNode',
        position: { x: 400, y: 200 },
        data: {
          shapeType: 'circle',
          width: 120,
          height: 120,
          color: '#673AB7',
          label: 'Main Idea',
          textColor: '#fff',
        },
      },
      {
        id: 'topic1',
        type: 'shapeNode',
        position: { x: 200, y: 100 },
        data: {
          shapeType: 'circle',
          width: 90,
          height: 90,
          color: '#2196F3',
          label: 'Topic 1',
          textColor: '#fff',
        },
      },
      {
        id: 'topic2',
        type: 'shapeNode',
        position: { x: 600, y: 100 },
        data: {
          shapeType: 'circle',
          width: 90,
          height: 90,
          color: '#4CAF50',
          label: 'Topic 2',
          textColor: '#fff',
        },
      },
      {
        id: 'topic3',
        type: 'shapeNode',
        position: { x: 200, y: 300 },
        data: {
          shapeType: 'circle',
          width: 90,
          height: 90,
          color: '#FF9800',
          label: 'Topic 3',
          textColor: '#fff',
        },
      },
      {
        id: 'topic4',
        type: 'shapeNode',
        position: { x: 600, y: 300 },
        data: {
          shapeType: 'circle',
          width: 90,
          height: 90,
          color: '#E91E63',
          label: 'Topic 4',
          textColor: '#fff',
        },
      },
    ],
    edges: [
      {
        id: 'e-center-1',
        source: 'central',
        target: 'topic1',
        style: { stroke: '#555', strokeWidth: 2 },
      },
      {
        id: 'e-center-2',
        source: 'central',
        target: 'topic2',
        style: { stroke: '#555', strokeWidth: 2 },
      },
      {
        id: 'e-center-3',
        source: 'central',
        target: 'topic3',
        style: { stroke: '#555', strokeWidth: 2 },
      },
      {
        id: 'e-center-4',
        source: 'central',
        target: 'topic4',
        style: { stroke: '#555', strokeWidth: 2 },
      },
    ],
  },
  'timeline': {
    id: 'timeline',
    name: 'Timeline',
    description: 'Chronological representation of events or milestones',
    category: 'Timeline',
    nodes: [
      {
        id: 'event1',
        type: 'shapeNode',
        position: { x: 100, y: 100 },
        data: {
          shapeType: 'rectangle',
          width: 150,
          height: 70,
          color: '#3f51b5',
          label: 'Phase 1',
          textColor: '#fff',
        },
      },
      {
        id: 'event2',
        type: 'shapeNode',
        position: { x: 300, y: 200 },
        data: {
          shapeType: 'rectangle',
          width: 150,
          height: 70,
          color: '#00796b',
          label: 'Phase 2',
          textColor: '#fff',
        },
      },
      {
        id: 'event3',
        type: 'shapeNode',
        position: { x: 500, y: 100 },
        data: {
          shapeType: 'rectangle',
          width: 150,
          height: 70,
          color: '#e53935',
          label: 'Phase 3',
          textColor: '#fff',
        },
      },
      {
        id: 'event4',
        type: 'shapeNode',
        position: { x: 700, y: 200 },
        data: {
          shapeType: 'rectangle',
          width: 150,
          height: 70,
          color: '#ff9800',
          label: 'Phase 4',
          textColor: '#fff',
        },
      },
      {
        id: 'date1',
        type: 'textNode',
        position: { x: 100, y: 180 },
        data: {
          label: 'Jan 2023',
          fontSize: 12,
          color: '#666',
        },
      },
      {
        id: 'date2',
        type: 'textNode',
        position: { x: 300, y: 280 },
        data: {
          label: 'Apr 2023',
          fontSize: 12,
          color: '#666',
        },
      },
      {
        id: 'date3',
        type: 'textNode',
        position: { x: 500, y: 180 },
        data: {
          label: 'Jul 2023',
          fontSize: 12,
          color: '#666',
        },
      },
      {
        id: 'date4',
        type: 'textNode',
        position: { x: 700, y: 280 },
        data: {
          label: 'Oct 2023',
          fontSize: 12,
          color: '#666',
        },
      },
    ],
    edges: [
      {
        id: 'e1-2',
        source: 'event1',
        target: 'event2',
        type: 'straight',
        style: { stroke: '#666', strokeWidth: 2, strokeDasharray: '5,5' },
      },
      {
        id: 'e2-3',
        source: 'event2',
        target: 'event3',
        type: 'straight',
        style: { stroke: '#666', strokeWidth: 2, strokeDasharray: '5,5' },
      },
      {
        id: 'e3-4',
        source: 'event3',
        target: 'event4',
        type: 'straight',
        style: { stroke: '#666', strokeWidth: 2, strokeDasharray: '5,5' },
      },
    ],
  },
  'modern-infographic': {
    id: 'modern-infographic',
    name: 'Modern Infographic',
    description: 'A visually appealing infographic with statistics and steps',
    category: 'Infographic',
    nodes: [
      // Title
      {
        id: 'infographic-title',
        type: 'textNode',
        position: { x: 400, y: 60 },
        data: {
          label: 'PROJECT ROADMAP',
          fontSize: 24,
          fontWeight: 'bold',
          color: '#333333',
        },
      },
      // Subtitle
      {
        id: 'infographic-subtitle',
        type: 'textNode',
        position: { x: 400, y: 90 },
        data: {
          label: 'Key steps for successful implementation',
          fontSize: 16,
          color: '#666666',
        },
      },
      // Step 1 Card
      {
        id: 'step1-card',
        type: 'shapeNode',
        position: { x: 150, y: 180 },
        data: {
          shapeType: 'rounded-rect',
          width: 180,
          height: 200,
          gradient: 'linear-gradient(135deg, #6B46C1 0%, #9F7AEA 100%)',
          label: '',
          textColor: '#fff',
        },
      },
      // Step 1 Number
      {
        id: 'step1-number',
        type: 'shapeNode',
        position: { x: 150, y: 160 },
        data: {
          shapeType: 'circle',
          width: 40,
          height: 40,
          color: '#6B46C1',
          label: '1',
          textColor: '#fff',
        },
      },
      // Step 1 Title
      {
        id: 'step1-title',
        type: 'textNode',
        position: { x: 150, y: 210 },
        data: {
          label: 'Research',
          fontSize: 18,
          fontWeight: 'bold',
          color: '#FFFFFF',
        },
      },
      // Step 1 Description
      {
        id: 'step1-desc',
        type: 'textNode',
        position: { x: 150, y: 260 },
        data: {
          label: 'Gather information\nand analyze data',
          fontSize: 14,
          color: '#FFFFFF',
        },
      },
    ],
    edges: [] as Edge[]
  },
  'yearly-timeline': yearlyTimelineTemplate,
  'project-plan': projectPlanTemplate,
};

export default templates; 