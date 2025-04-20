declare module '@/lib/org-chart/d3-org-chart' {
  export interface OrgNode {
    id: string;
    name?: string;
    role?: string;
    email?: string;
    parentId?: string | null;
    [key: string]: any;
  }

  export interface OrgChartOptions {
    data: OrgNode[];
    container: HTMLElement;
    nodeWidth: (d: any) => number;
    nodeHeight: (d: any) => number;
    compact: boolean;
    layout: 'top' | 'left' | 'right' | 'bottom';
    childrenMargin: (d: any) => number;
    siblingsMargin: (d: any) => number;
    neighbourMargin: (d: any) => number;
    onNodeClick: (d: any) => void;
    nodeContent: (node: any) => string;
  }

  export class OrgChart {
    constructor();
    container(container: HTMLElement | string): this;
    data(data: OrgNode[]): this;
    nodeWidth(fn: (node: any) => number): this;
    nodeHeight(fn: (node: any) => number): this;
    compact(isCompact: boolean): this;
    layout(layout: 'top' | 'left' | 'right' | 'bottom'): this;
    childrenMargin(fn: (node: any) => number): this;
    siblingsMargin(fn: (node: any) => number): this;
    neighbourMargin(fn: (node: any) => number): this;
    onNodeClick(fn: (node: any) => void): this;
    nodeContent(fn: (node: any) => string): this;
    render(): this;
    update(node: any): this;
    clear(): void;
    setExpanded(nodeId: string, isExpanded: boolean): this;
    setCentered(nodeId: string): this;
    setHighlighted(nodeId: string): this;
  }
} 