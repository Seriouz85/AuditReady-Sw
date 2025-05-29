/**
 * Infinity Loop Template - Recreating the exact template from the provided image
 * Features curved infinity shape with 6 sections and surrounding text boxes
 */

export interface InfinityLoopNode {
  id: string;
  type: 'shape' | 'text';
  position: { x: number; y: number };
  data: {
    label: string;
    shape?: 'infinity-section' | 'text-box';
    fillColor?: string;
    strokeColor?: string;
    textColor?: string;
    sectionNumber?: number;
    icon?: string;
  };
}

export const INFINITY_LOOP_TEMPLATE: InfinityLoopNode[] = [
  // Center infinity shape sections
  {
    id: 'infinity-1',
    type: 'shape',
    position: { x: 300, y: 200 },
    data: {
      label: '1',
      shape: 'infinity-section',
      fillColor: '#3b82f6', // Blue
      strokeColor: '#ffffff',
      textColor: '#ffffff',
      sectionNumber: 1,
      icon: '🔒'
    }
  },
  {
    id: 'infinity-2',
    type: 'shape',
    position: { x: 450, y: 150 },
    data: {
      label: '2',
      shape: 'infinity-section',
      fillColor: '#8b5cf6', // Purple
      strokeColor: '#ffffff',
      textColor: '#ffffff',
      sectionNumber: 2,
      icon: '📊'
    }
  },
  {
    id: 'infinity-3',
    type: 'shape',
    position: { x: 500, y: 250 },
    data: {
      label: '3',
      shape: 'infinity-section',
      fillColor: '#06b6d4', // Cyan
      strokeColor: '#ffffff',
      textColor: '#ffffff',
      sectionNumber: 3,
      icon: '🛡️'
    }
  },
  {
    id: 'infinity-4',
    type: 'shape',
    position: { x: 450, y: 350 },
    data: {
      label: '4',
      shape: 'infinity-section',
      fillColor: '#8b5cf6', // Purple
      strokeColor: '#ffffff',
      textColor: '#ffffff',
      sectionNumber: 4,
      icon: '⚙️'
    }
  },
  {
    id: 'infinity-5',
    type: 'shape',
    position: { x: 300, y: 300 },
    data: {
      label: '5',
      shape: 'infinity-section',
      fillColor: '#d946ef', // Magenta
      strokeColor: '#ffffff',
      textColor: '#ffffff',
      sectionNumber: 5,
      icon: '📋'
    }
  },
  {
    id: 'infinity-6',
    type: 'shape',
    position: { x: 200, y: 250 },
    data: {
      label: '6',
      shape: 'infinity-section',
      fillColor: '#3b82f6', // Blue
      strokeColor: '#ffffff',
      textColor: '#ffffff',
      sectionNumber: 6,
      icon: '🎯'
    }
  },

  // Surrounding text boxes
  {
    id: 'text-top-left',
    type: 'text',
    position: { x: 100, y: 80 },
    data: {
      label: 'Title Here',
      shape: 'text-box',
      textColor: '#1e293b'
    }
  },
  {
    id: 'text-desc-top-left',
    type: 'text',
    position: { x: 100, y: 110 },
    data: {
      label: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, eiusmod tempor incididunt',
      shape: 'text-box',
      textColor: '#64748b'
    }
  },
  {
    id: 'text-top-right',
    type: 'text',
    position: { x: 600, y: 80 },
    data: {
      label: 'Title Here',
      shape: 'text-box',
      textColor: '#1e293b'
    }
  },
  {
    id: 'text-desc-top-right',
    type: 'text',
    position: { x: 600, y: 110 },
    data: {
      label: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, eiusmod tempor incididunt',
      shape: 'text-box',
      textColor: '#64748b'
    }
  },
  {
    id: 'text-left',
    type: 'text',
    position: { x: 50, y: 220 },
    data: {
      label: 'Title Here',
      shape: 'text-box',
      textColor: '#1e293b'
    }
  },
  {
    id: 'text-desc-left',
    type: 'text',
    position: { x: 50, y: 250 },
    data: {
      label: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, eiusmod tempor incididunt',
      shape: 'text-box',
      textColor: '#64748b'
    }
  },
  {
    id: 'text-right',
    type: 'text',
    position: { x: 650, y: 220 },
    data: {
      label: 'Title Here',
      shape: 'text-box',
      textColor: '#1e293b'
    }
  },
  {
    id: 'text-desc-right',
    type: 'text',
    position: { x: 650, y: 250 },
    data: {
      label: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, eiusmod tempor incididunt',
      shape: 'text-box',
      textColor: '#64748b'
    }
  },
  {
    id: 'text-bottom-left',
    type: 'text',
    position: { x: 100, y: 420 },
    data: {
      label: 'Title Here',
      shape: 'text-box',
      textColor: '#1e293b'
    }
  },
  {
    id: 'text-desc-bottom-left',
    type: 'text',
    position: { x: 100, y: 450 },
    data: {
      label: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, eiusmod tempor incididunt',
      shape: 'text-box',
      textColor: '#64748b'
    }
  },
  {
    id: 'text-bottom-right',
    type: 'text',
    position: { x: 600, y: 420 },
    data: {
      label: 'Title Here',
      shape: 'text-box',
      textColor: '#1e293b'
    }
  },
  {
    id: 'text-desc-bottom-right',
    type: 'text',
    position: { x: 600, y: 450 },
    data: {
      label: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, eiusmod tempor incididunt',
      shape: 'text-box',
      textColor: '#64748b'
    }
  }
];

/**
 * Generate Mermaid code for the infinity loop template
 */
export const generateInfinityLoopMermaid = (): string => {
  return `
graph TD
    subgraph "Infinity Process Loop"
        A[Section 1: Security Assessment] 
        B[Section 2: Risk Analysis]
        C[Section 3: Implementation]
        D[Section 4: Monitoring]
        E[Section 5: Review]
        F[Section 6: Optimization]
        
        A --> B
        B --> C
        C --> D
        D --> E
        E --> F
        F --> A
    end
    
    %% Styling for infinity loop appearance
    style A fill:#3b82f6,stroke:#fff,stroke-width:3px,color:#fff
    style B fill:#8b5cf6,stroke:#fff,stroke-width:3px,color:#fff
    style C fill:#06b6d4,stroke:#fff,stroke-width:3px,color:#fff
    style D fill:#8b5cf6,stroke:#fff,stroke-width:3px,color:#fff
    style E fill:#d946ef,stroke:#fff,stroke-width:3px,color:#fff
    style F fill:#3b82f6,stroke:#fff,stroke-width:3px,color:#fff
  `;
};

/**
 * Load infinity loop template into React Flow
 */
export const loadInfinityLoopTemplate = () => {
  const nodes = INFINITY_LOOP_TEMPLATE.map(templateNode => ({
    id: templateNode.id,
    type: 'custom',
    position: templateNode.position,
    data: {
      label: templateNode.data.label,
      shape: templateNode.type === 'text' ? 'text' : 'circle',
      fillColor: templateNode.data.fillColor || (templateNode.type === 'text' ? 'transparent' : '#f8fafc'),
      strokeColor: templateNode.data.strokeColor || (templateNode.type === 'text' ? 'transparent' : '#2563eb'),
      strokeWidth: templateNode.type === 'text' ? 0 : 3,
      textColor: templateNode.data.textColor || '#1e293b',
      onLabelChange: () => {}
    }
  }));

  // Create connecting edges for the infinity loop
  const edges = [
    { id: 'e1-2', source: 'infinity-1', target: 'infinity-2', animated: true },
    { id: 'e2-3', source: 'infinity-2', target: 'infinity-3', animated: true },
    { id: 'e3-4', source: 'infinity-3', target: 'infinity-4', animated: true },
    { id: 'e4-5', source: 'infinity-4', target: 'infinity-5', animated: true },
    { id: 'e5-6', source: 'infinity-5', target: 'infinity-6', animated: true },
    { id: 'e6-1', source: 'infinity-6', target: 'infinity-1', animated: true }
  ];

  return { nodes, edges };
};
