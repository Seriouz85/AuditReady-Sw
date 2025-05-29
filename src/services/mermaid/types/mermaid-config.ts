/**
 * Mermaid Configuration Types
 * Comprehensive type definitions for Mermaid.js integration
 */

export interface MermaidConfig {
  startOnLoad: boolean;
  theme: 'default' | 'dark' | 'forest' | 'neutral';
  themeVariables: ThemeVariables;
  flowchart: FlowchartConfig;
  sequence: SequenceConfig;
  gantt: GanttConfig;
  securityLevel: 'strict' | 'loose' | 'antiscript' | 'sandbox';
  deterministicIds: boolean;
  maxTextSize: number;
}

export interface ThemeVariables {
  primaryColor: string;
  primaryTextColor: string;
  primaryBorderColor: string;
  lineColor: string;
  sectionBkgColor: string;
  altSectionBkgColor: string;
  gridColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  // Sequence diagram specific
  actorBkg?: string;
  actorBorder?: string;
  actorTextColor?: string;
  // Gantt chart specific
  cScale0?: string;
  cScale1?: string;
  cScale2?: string;
  // Pie chart specific
  pie1?: string;
  pie2?: string;
  pie3?: string;
  pie4?: string;
  // Additional Mermaid theme variables
  [key: string]: string | undefined;
}

export interface FlowchartConfig {
  useMaxWidth: boolean;
  htmlLabels: boolean;
  curve: 'basis' | 'linear' | 'cardinal';
}

export interface SequenceConfig {
  diagramMarginX: number;
  diagramMarginY: number;
  actorMargin: number;
  width: number;
  height: number;
  boxMargin: number;
  boxTextMargin: number;
  noteMargin: number;
  messageMargin: number;
}

export interface GanttConfig {
  titleTopMargin: number;
  barHeight: number;
  fontFamily: string;
  fontSize: number;
  gridLineStartPadding: number;
  bottomPadding: number;
  leftPadding: number;
  rightPadding: number;
}

export interface RenderOptions {
  theme?: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
}

export interface DiagramMetadata {
  id: string;
  width: number;
  height: number;
  viewBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  nodeCount: number;
  edgeCount: number;
  diagramType: string;
}

export type DiagramType =
  | 'flowchart'
  | 'sequence'
  | 'classDiagram'
  | 'stateDiagram'
  | 'entityRelationshipDiagram'
  | 'userJourney'
  | 'gantt'
  | 'pieChart'
  | 'requirementDiagram'
  | 'gitgraph'
  | 'mindmap'
  | 'timeline'
  | 'quadrantChart'
  | 'sankey';

export interface MermaidTheme {
  name: string;
  variables: ThemeVariables;
  description: string;
}

export interface ExportOptions {
  format: 'svg' | 'png' | 'pdf';
  scale?: number;
  quality?: number;
  backgroundColor?: string;
  width?: number;
  height?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
  diagramType?: DiagramType;
}

export interface RenderResult {
  svg: string;
  metadata: DiagramMetadata;
  bindFunctions?: any;
}

export interface MermaidError extends Error {
  code?: string;
  line?: number;
  column?: number;
  diagramType?: string;
}

export interface DiagramNode {
  id: string;
  label?: string;
  type?: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  style?: Record<string, any>;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
  style?: Record<string, any>;
}

export interface ParsedDiagram {
  type: DiagramType;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  metadata: Record<string, any>;
}
