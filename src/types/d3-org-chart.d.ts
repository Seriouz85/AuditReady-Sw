declare module 'd3-org-chart' {
  export default class OrgChart {
    constructor();
    container(container: string | HTMLElement): this;
    data(data: any[]): this;
    nodeWidth(width: number): this;
    nodeHeight(height: number): this;
    childrenMargin(margin: number): this;
    compactMarginBetween(margin: number): this;
    compactMarginPair(margin: number): this;
    nodeContent(callback: (d: any) => string): this;
    buttonContent(callback: (params: { node: any, state: string }) => string): this;
    render(): this;
    clear(): void;
    addNode(data: any): void;
    removeNode(nodeId: string): void;
    setExpanded(nodeId: string, expanded?: boolean): this;
    setCentered(nodeId: string): this;
    setHighlighted(nodeId: string): this;
    setUpToTheRootHighlighted(nodeId: string): this;
    clearHighlighting(): this;
    fullscreen(): void;
    zoomIn(): void;
    zoomOut(): void;
    exportImg(options?: { full?: boolean, scale?: number, onLoad?: (base64: string) => void, save?: boolean, backgroundColor?: string }): void;
    exportSvg(): void;
    expandAll(): void;
    collapseAll(): void;
    connections(connections: Array<{ from: string, to: string, label: string }>): this;
    layout(layout: 'top' | 'bottom' | 'left' | 'right'): this;
    fit(): this;
  }
} 