/**
 * Type definitions for D3 Organization Chart component
 */

export interface OrgNode {
  id: string;
  parentId?: string | null;
  name: string;
  role?: string;
  department?: string;
  email?: string;
  type?: string;
  hierarchyLevel?: number;
  children?: OrgNode[];
  _highlighted?: boolean;
  [key: string]: any;
}

export interface OrgChartInstance {
  container(selector: HTMLElement | string): OrgChartInstance;
  data(data: OrgNode | OrgNode[] | any): OrgChartInstance;
  nodeHeight(height: number | ((d: any) => number)): OrgChartInstance;
  nodeWidth(width: number | ((d: any) => number)): OrgChartInstance;
  childrenMargin(margin: number | ((d: any) => number)): OrgChartInstance;
  compactMarginBetween(margin: number | ((d: any) => number)): OrgChartInstance;
  compactMarginPair(margin: number | ((d: any) => number)): OrgChartInstance;
  neighbourMargin(margin: number | ((a: any, b: any) => number)): OrgChartInstance;
  siblingsMargin(margin: number | ((d: any) => number)): OrgChartInstance;
  buttonContent(content: (props: any) => string): OrgChartInstance;
  nodeContent(content: (node: any) => string): OrgChartInstance;
  onNodeClick(callback: (node: any) => void): OrgChartInstance;
  onNodeDblClick(callback: (node: any) => void): OrgChartInstance;
  duration(milliseconds: number): OrgChartInstance;
  compact(isCompact: boolean): OrgChartInstance;
  render(): OrgChartInstance;
  fit(): OrgChartInstance;
  zoomIn(): OrgChartInstance;
  zoomOut(): OrgChartInstance;
  expandAll(): OrgChartInstance;
  collapseAll(): OrgChartInstance;
  clearHighlighting(): OrgChartInstance;
  search(text: string, highlight?: boolean): OrgChartInstance;
  getNodeById(id: string): any;
  exportImg(options: { full?: boolean; scale?: number; onLoad: (dataUrl: string) => void }): void;
} 