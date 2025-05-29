// Mermaid-style diagram types

export type DiagramNodeType =
  | 'start'
  | 'end'
  | 'process'
  | 'decision'
  | 'subgraph'
  | 'input'
  | 'output'
  | 'actor'
  | 'class'
  | 'state'
  | 'entity'
  | 'note'
  | 'mindmap'
  | 'timeline'
  | 'orgchart'
  | 'custom';

export interface DiagramNode {
  id: string;
  label: string;
  type: DiagramNodeType;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  textColor?: string;
  children?: string[];
  parent?: string;
  data?: Record<string, any>;
  metadata?: Record<string, any>; // for riskLevel, controlType, etc.
  connections?: string[]; // for flowchart-style node linking
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  type?: 'straight' | 'step' | 'curve' | 'orthogonal' | 'arrow' | 'association' | 'dependency' | 'custom';
  label?: string;
  style?: Record<string, any>;
}

export interface DiagramTemplate {
  id: string;
  name: string;
  description: string;
  category?: string;
  icon?: React.ReactNode;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  preview?: string;
  mermaidText?: string; // for import/export
} 