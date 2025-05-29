import React, { useState } from 'react';
import * as fabric from 'fabric';
import { useFabricCanvasStore } from '../../core/FabricCanvasStore';
import TemplateGallery from '../../ui/TemplateGallery';
import { templates } from '../../../../../data/diagram-templates';
import { DiagramTemplate } from '../../../../../types/diagram/types';
import {
  LayoutTemplate,
  Search,
  Sparkles
} from 'lucide-react';
import dagre from 'dagre';

const categories = [
  'All',
  'Audit',
  'Risk',
  'Compliance',
  'Testing',
  'Reporting',
  'Process',
  'Organization',
  'Infographic',
  'Flowchart',
  'Timeline',
  'Brainstorming',
  'IT Security'
];

// Utility: Auto-layout nodes using dagre (tighter spacing) or simple left-to-right
function layoutTemplateNodes(nodes: any[], edges: any[]): any[] {
  // If there are no edges, arrange nodes left-to-right, starting at x=60
  if (!edges || edges.length === 0) {
    const spacing = 60;
    let currentX = 60;
    return nodes.map((node, _) => {
      const n = { ...node, x: currentX, y: 120 };
      currentX += (node.width || 120) + spacing;
      return n;
    });
  }
  // Otherwise, use dagre for flow layout
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'LR', nodesep: 30, ranksep: 40 });
  g.setDefaultEdgeLabel(() => ({}));
  nodes.forEach((node) => {
    g.setNode(node.id, { width: node.width || 120, height: node.height || 60 });
  });
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });
  dagre.layout(g);
  return nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      x: pos ? pos.x - (node.width || 120) / 2 : node.x || 100,
      y: pos ? pos.y - (node.height || 60) / 2 : node.y || 100,
    };
  });
}

// Utility: Center diagram nodes in the canvas, with margin and canvas resize
function centerDiagram(nodes: any[], canvasWidth: number, canvasHeight: number, margin = 40): { nodes: any[], newWidth: number, newHeight: number } {
  if (!nodes.length) return { nodes, newWidth: canvasWidth, newHeight: canvasHeight };
  const minX = Math.min(...nodes.map(n => n.x || 0));
  const minY = Math.min(...nodes.map(n => n.y || 0));
  const maxX = Math.max(...nodes.map(n => (n.x || 0) + (n.width || 120)));
  const maxY = Math.max(...nodes.map(n => (n.y || 0) + (n.height || 60)));
  const diagramWidth = maxX - minX;
  const diagramHeight = maxY - minY;
  const totalWidth = diagramWidth + margin * 2;
  const totalHeight = diagramHeight + margin * 2;
  const offsetX = margin - minX;
  const offsetY = margin - minY;
  const centeredNodes = nodes.map(n => ({ ...n, x: (n.x || 0) + offsetX, y: (n.y || 0) + offsetY }));
  return {
    nodes: centeredNodes,
    newWidth: Math.max(canvasWidth, totalWidth),
    newHeight: Math.max(canvasHeight, totalHeight)
  };
}

// Utility: Map Mermaid-style DiagramNode/DiagramEdge to Fabric.js object
function addTemplateToFabricCanvas(canvas: fabric.Canvas, nodes: any[], edges: any[]) {
  if (!canvas) return;
  canvas.clear();
  nodes.forEach((node) => {
    let shape;
    const { x = 100, y = 100, width = 120, height = 60, color = '#1976d2', label = '', type, textColor = '#fff' } = node;
    switch (type) {
      case 'process':
      case 'custom':
        shape = new fabric.Rect({ left: x, top: y, width, height, fill: color, rx: 10, ry: 10 });
        break;
      case 'decision':
        shape = new fabric.Polygon([
          { x: x + width / 2, y },
          { x: x + width, y: y + height / 2 },
          { x: x + width / 2, y: y + height },
          { x, y: y + height / 2 },
        ], { fill: color });
        break;
      case 'actor':
        shape = new fabric.Circle({ left: x, top: y, radius: width / 2, fill: color });
        break;
      case 'entity':
        shape = new fabric.Rect({ left: x, top: y, width, height, fill: color, rx: 2, ry: 2 });
        break;
      case 'note':
        shape = new fabric.Rect({ left: x, top: y, width, height, fill: '#fffbe6', stroke: '#fbc02d', strokeWidth: 2 });
        break;
      default:
        shape = new fabric.Rect({ left: x, top: y, width, height, fill: color });
    }
    if (shape) {
      if (label) {
        const text = new fabric.Text(label, { left: x + width / 2, top: y + height / 2, fontSize: 16, fill: textColor, originX: 'center', originY: 'center' });
        const group = new fabric.Group([shape, text], { left: x, top: y });
        canvas.add(group);
      } else {
        canvas.add(shape);
      }
    }
  });
  // Draw edges after nodes are added
  edges.forEach((edge) => {
    const source = nodes.find((n) => n.id === edge.source);
    const target = nodes.find((n) => n.id === edge.target);
    if (source && target) {
      const x1 = (source.x || 0) + (source.width || 120) / 2;
      const y1 = (source.y || 0) + (source.height || 60) / 2;
      const x2 = (target.x || 0) + (target.width || 120) / 2;
      const y2 = (target.y || 0) + (target.height || 60) / 2;
      const line = new fabric.Line([x1, y1, x2, y2], {
        stroke: edge.style?.stroke || '#64748b',
        strokeWidth: edge.style?.strokeWidth || 2,
        selectable: false,
      });
      canvas.add(line);
      // Draw arrowhead for 'arrow' type
      if (edge.type === 'arrow') {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const arrowLength = 16;
        const arrowWidth = 8;
        const arrowX = x2 - arrowLength * Math.cos(angle);
        const arrowY = y2 - arrowLength * Math.sin(angle);
        const arrow = new fabric.Triangle({
          left: arrowX,
          top: arrowY,
          width: arrowLength,
          height: arrowWidth,
          fill: edge.style?.stroke || '#64748b',
          angle: (angle * 180) / Math.PI + 90,
          originX: 'center',
          originY: 'center',
          selectable: false,
        });
        canvas.add(arrow);
      }
    }
  });
  canvas.requestRenderAll();
}

// Utility: Find rightmost X position of all objects on the canvas
function getRightmostX(canvas: fabric.Canvas) {
  const objects = canvas.getObjects().filter((obj: any) => obj.type !== 'line' && obj.type !== 'arrow');
  if (objects.length === 0) return 60;
  return Math.max(...objects.map(obj => (obj.left || 0) + (obj.getScaledWidth ? obj.getScaledWidth() : obj.width || 120)));
}

const TemplatesPanel: React.FC = () => {
  const { canvas } = useFabricCanvasStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);

  // Flatten templates object to array
  const allTemplates: DiagramTemplate[] = Object.values(templates);

  const filteredTemplates = allTemplates.filter((template: DiagramTemplate) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || (template.category && template.category === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleTemplateSelect = async (template: DiagramTemplate) => {
    if (!canvas) {
      console.error('Canvas not available for template loading');
      return;
    }
    if (template.nodes && template.edges) {
      // Always run layout and centering
      let nodes = layoutTemplateNodes(template.nodes, template.edges);
      const { nodes: centeredNodes, newWidth, newHeight } = centerDiagram(nodes, canvas.width || 800, canvas.height || 400);
      // If canvas is not empty, offset all nodes to the right of the rightmost object
      const rightmostX = getRightmostX(canvas);
      const offset = rightmostX > 60 ? rightmostX + 60 : 0;
      const offsetNodes = centeredNodes.map(n => ({ ...n, x: (n.x || 0) + offset }));
      canvas.setDimensions({ width: Math.max(canvas.width || 800, newWidth + offset), height: Math.max(canvas.height || 400, newHeight) });
      canvas.setZoom(1);
      if (canvas.viewportTransform) {
        canvas.viewportTransform[4] = 0;
        canvas.viewportTransform[5] = 0;
      }
      addTemplateToFabricCanvas(canvas, offsetNodes, template.edges);
      return;
    }
    if ((template as any).createTemplate) {
      await (template as any).createTemplate(canvas);
      canvas.renderAll();
    }
  };

  return (
    <div style={{
      padding: '24px 16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
      fontSize: '14px',
      lineHeight: 1.5,
      color: '#1f2937',
      background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
      minHeight: '100vh',
      boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
      borderRight: '1px solid #e5e7eb',
      transition: 'background 0.3s',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0',
            letterSpacing: '0.01em',
            fontFamily: 'inherit',
            textShadow: '0 1px 0 #fff',
          }}>
            Diagram Templates
          </h4>
          <button
            onClick={() => setShowTemplateGallery(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              backgroundColor: '#f1f5f9',
              color: '#3b82f6',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(59,130,246,0.04)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#e0e7ef';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
            title="Open Template Gallery"
          >
            <Sparkles size={15} />
            Gallery
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{
        position: 'relative',
        marginBottom: '16px'
      }}>
        <Search style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '16px',
          height: '16px',
          color: '#9ca3af'
        }} />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            paddingLeft: '40px',
            paddingRight: '12px',
            paddingTop: '8px',
            paddingBottom: '8px',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '13px',
            outline: 'none',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Categories */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        marginBottom: '20px'
      }}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: 600,
              border: '1px solid',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              outline: 'none',
              userSelect: 'none' as const,
              backgroundColor: selectedCategory === category ? '#3b82f6' : 'white',
              borderColor: selectedCategory === category ? '#3b82f6' : '#e2e8f0',
              color: selectedCategory === category ? 'white' : '#6b7280'
            }}
            onMouseEnter={(e) => {
              if (selectedCategory !== category) {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#3b82f6';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCategory !== category) {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Templates List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '16px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{
                  flexShrink: 0,
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: '#eff6ff',
                  color: '#3b82f6'
                }}>
                  {template.icon}
                </div>
                <div style={{
                  flex: 1,
                  minWidth: 0
                }}>
                  <h5 style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#1f2937',
                    margin: '0 0 4px 0',
                    fontFamily: 'inherit'
                  }}>
                    {template.name}
                  </h5>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: '0 0 8px 0',
                    lineHeight: 1.4,
                    fontFamily: 'inherit'
                  }}>
                    {template.description}
                  </p>
                  <p style={{
                    fontSize: '10px',
                    color: '#9ca3af',
                    margin: '0',
                    fontFamily: 'monospace',
                    lineHeight: 1.3
                  }}>
                    {template.preview ?? ''}
                  </p>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <span style={{
                    fontSize: '10px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    backgroundColor: '#f0f9ff',
                    color: '#0369a1',
                    fontFamily: 'inherit'
                  }}>
                    {template.category}
                  </span>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '32px 16px',
            borderRadius: '8px',
            backgroundColor: '#f8fafc'
          }}>
            <LayoutTemplate style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 12px auto',
              color: '#9ca3af'
            }} />
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 4px 0',
              fontFamily: 'inherit'
            }}>
              No templates found
            </p>
            <p style={{
              fontSize: '12px',
              color: '#9ca3af',
              margin: '0',
              fontFamily: 'inherit'
            }}>
              Try adjusting your search or category filter
            </p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div style={{
        marginTop: '20px',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: '#eff6ff',
        fontSize: '12px'
      }}>
        <p style={{
          color: '#1f2937',
          margin: '0 0 8px 0',
          fontWeight: 600,
          fontFamily: 'inherit'
        }}>
          Tips:
        </p>
        <ul style={{
          color: '#6b7280',
          fontSize: '11px',
          margin: '0',
          paddingLeft: '16px',
          lineHeight: 1.4,
          fontFamily: 'inherit'
        }}>
          <li>Templates will replace current canvas content</li>
          <li>Customize templates after loading to fit your needs</li>
          <li>Use templates as starting points for complex diagrams</li>
        </ul>
      </div>

      {/* Template Gallery Modal */}
      <TemplateGallery
        visible={showTemplateGallery}
        onClose={() => setShowTemplateGallery(false)}
      />
    </div>
  );
};

export default TemplatesPanel;