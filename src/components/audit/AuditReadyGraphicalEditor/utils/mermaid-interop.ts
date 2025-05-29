import { DiagramTemplate, DiagramNode, DiagramEdge } from '../../../../types/diagram/types';
import dagre from 'dagre';

/**
 * Auto-layout nodes using dagre (left-to-right, like Mermaid's graph LR)
 * Mutates the nodes array to assign x/y positions.
 */
export function autoLayoutDiagram(nodes: DiagramNode[], edges: DiagramEdge[], direction: 'LR' | 'TB' = 'LR') {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80 });
  g.setDefaultEdgeLabel(() => ({}));
  nodes.forEach((node) => {
    g.setNode(node.id, { width: node.width || 120, height: node.height || 60 });
  });
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });
  dagre.layout(g);
  nodes.forEach((node) => {
    const pos = g.node(node.id);
    if (pos) {
      node.x = pos.x - (node.width || 120) / 2;
      node.y = pos.y - (node.height || 60) / 2;
    }
  });
}

/**
 * Parses simple Mermaid.js flowchart text (graph LR) into a DiagramTemplate structure.
 * Supports: graph LR, nodes (A[Start], B("End")), and edges (A -- yes --> B)
 */
export function parseMermaidToDiagram(mermaidText: string): DiagramTemplate {
  // Only support 'graph LR' for now
  const lines = mermaidText.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines[0].startsWith('graph')) throw new Error('Only simple flowcharts supported');
  const direction = lines[0].split(' ')[1] || 'LR';
  const nodes: Record<string, DiagramNode> = {};
  const edges: DiagramEdge[] = [];
  for (const line of lines.slice(1)) {
    // Match edges: A -- label --> B
    const edgeMatch = line.match(/^(\w+)(?:\s*\[(.*?)\])?\s*--\s*(.*?)\s*--?>+\s*(\w+)(?:\s*\[(.*?)\])?/);
    if (edgeMatch) {
      const [_, from, fromLabel, edgeLabel, to, toLabel] = edgeMatch;
      if (!nodes[from]) nodes[from] = { id: from, label: fromLabel || from, type: 'process' };
      if (!nodes[to]) nodes[to] = { id: to, label: toLabel || to, type: 'process' };
      edges.push({ id: `${from}-${to}-${edges.length}`, source: from, target: to, type: 'arrow', label: edgeLabel && edgeLabel.trim() ? edgeLabel.trim() : undefined });
      continue;
    }
    // Match node with label: A[Start] or B("End")
    const nodeLabelMatch = line.match(/^(\w+)\s*(?:\[(.*?)\]|\("(.*?)"\))$/);
    if (nodeLabelMatch) {
      const id = nodeLabelMatch[1];
      const label = nodeLabelMatch[2] || nodeLabelMatch[3] || id;
      if (!nodes[id]) nodes[id] = { id, label, type: 'process' };
      continue;
    }
    // Match single node: A
    const nodeMatch = line.match(/^(\w+)$/);
    if (nodeMatch) {
      const id = nodeMatch[1];
      if (!nodes[id]) nodes[id] = { id, label: id, type: 'process' };
    }
  }
  return {
    id: 'imported-mermaid',
    name: 'Imported Mermaid Flowchart',
    description: 'Imported from Mermaid text',
    nodes: Object.values(nodes),
    edges,
    category: 'flowchart',
  };
}

/**
 * Serializes a DiagramTemplate (flowchart) into Mermaid.js text.
 * Supports node/edge labels.
 */
export function serializeDiagramToMermaid(diagram: DiagramTemplate): string {
  // Only support flowchart for now
  let out = 'graph LR\n';
  for (const node of diagram.nodes) {
    if (node.label && node.label !== node.id) {
      // Use [label] syntax for node label
      out += `  ${node.id}[${node.label}]\n`;
    } else {
      out += `  ${node.id}\n`;
    }
  }
  for (const edge of diagram.edges) {
    if (edge.label) {
      out += `  ${edge.source} -- ${edge.label} --> ${edge.target}\n`;
    } else {
      out += `  ${edge.source} --> ${edge.target}\n`;
    }
  }
  return out;
} 