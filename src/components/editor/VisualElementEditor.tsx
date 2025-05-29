/**
 * Visual Element Editor Component
 * Provides click-to-edit functionality for Mermaid diagram elements
 */
import React, { useState, useEffect, useRef } from 'react';
import { Edit3, Type, Palette, Move, RotateCw, Trash2, Copy, Plus, Square, Circle, Diamond } from 'lucide-react';
import { GlassPanel, GlassButton, GlassInput, MermaidDesignTokens } from '../ui';
import { ShapeAdditionService, ShapeTemplate } from '../../services/editor/ShapeAdditionService';

export interface DiagramElement {
  id: string;
  type: 'node' | 'edge' | 'label';
  text: string;
  position?: { x: number; y: number };
  style?: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    fontSize?: number;
    fontWeight?: string;
  };
  shape?: 'rectangle' | 'circle' | 'diamond' | 'ellipse' | 'cylinder';
  svgElement?: SVGElement;
}

interface VisualElementEditorProps {
  selectedElement: DiagramElement | null;
  onElementUpdate: (element: DiagramElement) => void;
  onElementDelete: (elementId: string) => void;
  onElementDuplicate: (element: DiagramElement) => void;
  diagramText: string;
  onDiagramTextChange: (text: string) => void;
  onShapeAdd?: (shapeType: DiagramElement['shape'], text?: string) => void;
}

export const VisualElementEditor: React.FC<VisualElementEditorProps> = ({
  selectedElement,
  onElementUpdate,
  onElementDelete,
  onElementDuplicate,
  diagramText,
  onDiagramTextChange,
  onShapeAdd
}) => {
  const [editingText, setEditingText] = useState('');
  const [editingStyle, setEditingStyle] = useState<DiagramElement['style']>({});
  const [isTextEditing, setIsTextEditing] = useState(false);
  const [showShapePanel, setShowShapePanel] = useState(false);
  const [shapeTemplates, setShapeTemplates] = useState<ShapeTemplate[]>([]);
  const textInputRef = useRef<HTMLInputElement>(null);
  const shapeService = useRef(ShapeAdditionService.getInstance());

  // Initialize shape templates
  useEffect(() => {
    setShapeTemplates(shapeService.current.getShapeTemplates());
  }, []);

  // Update local state when selected element changes
  useEffect(() => {
    if (selectedElement) {
      setEditingText(selectedElement.text);
      setEditingStyle(selectedElement.style || {});
    }
  }, [selectedElement]);

  // Focus text input when entering edit mode
  useEffect(() => {
    if (isTextEditing && textInputRef.current) {
      textInputRef.current.focus();
      textInputRef.current.select();
    }
  }, [isTextEditing]);

  const handleTextEdit = () => {
    setIsTextEditing(true);
  };

  const handleTextSave = () => {
    if (selectedElement && editingText.trim() && editingText.trim() !== selectedElement.text) {
      console.log('💾 Saving text change:', selectedElement.id, 'from:', selectedElement.text, 'to:', editingText.trim());

      const updatedElement = {
        ...selectedElement,
        text: editingText.trim()
      };

      // Update through the main handler which will trigger re-rendering
      onElementUpdate(updatedElement);

      // Also update the diagram text directly using the parser
      try {
        const updatedDiagramText = updateDiagramText(selectedElement, updatedElement);
        onDiagramTextChange(updatedDiagramText);
        console.log('✅ Diagram text updated directly');
      } catch (error) {
        console.warn('⚠️ Direct diagram text update failed, relying on main handler:', error);
      }

      console.log('✅ Text update sent to main handler');
    }
    setIsTextEditing(false);
  };

  const handleTextCancel = () => {
    if (selectedElement) {
      setEditingText(selectedElement.text);
    }
    setIsTextEditing(false);
  };

  const handleStyleChange = (property: string, value: string | number) => {
    const newStyle = { ...editingStyle, [property]: value };
    setEditingStyle(newStyle);

    if (selectedElement) {
      const updatedElement = {
        ...selectedElement,
        style: newStyle
      };
      onElementUpdate(updatedElement);
    }
  };

  const handleDelete = () => {
    if (selectedElement) {
      onElementDelete(selectedElement.id);
    }
  };

  const handleDuplicate = () => {
    if (selectedElement) {
      onElementDuplicate(selectedElement);
    }
  };

  const handleShapeAdd = async (template: ShapeTemplate) => {
    try {
      console.log('🔧 Adding shape from template:', template.name, template.shape);

      // Use the parent's onShapeAdd if available (preferred method)
      if (onShapeAdd) {
        await onShapeAdd(template.shape, template.defaultText);
        setShowShapePanel(false);
        console.log('✅ Shape added via parent handler:', template.name);
        return;
      }

      // Fallback to direct service call
      const result = shapeService.current.addShape(diagramText, template.shape, {
        text: template.defaultText
      });

      console.log('✅ Shape added successfully:', result.nodeId);
      console.log('📝 Updated diagram text:', result.updatedText);

      onDiagramTextChange(result.updatedText);
      setShowShapePanel(false);

      console.log('✅ Shape added from template:', template.name);
    } catch (error) {
      console.error('❌ Failed to add shape:', error);
      alert(`Failed to add shape: ${(error as Error).message}`);
    }
  };

  const handleQuickAddProcess = () => {
    try {
      const steps = ['Start', 'Process', 'End'];
      const updatedText = shapeService.current.addProcessFlow(diagramText, steps);
      onDiagramTextChange(updatedText);
      console.log('✅ Process flow added');
    } catch (error) {
      console.error('❌ Failed to add process flow:', error);
    }
  };

  const getShapeIcon = (shape: DiagramElement['shape']) => {
    switch (shape) {
      case 'rectangle': return <Square size={16} />;
      case 'circle': return <Circle size={16} />;
      case 'diamond': return <Diamond size={16} />;
      case 'ellipse': return <Circle size={16} />;
      case 'cylinder': return <Square size={16} />;
      case 'hexagon': return <Square size={16} />;
      default: return <Square size={16} />;
    }
  };

  const updateDiagramText = (oldElement: DiagramElement, newElement: DiagramElement) => {
    // Simple text replacement for now
    // In a more sophisticated implementation, this would parse and update the Mermaid AST
    const oldText = oldElement.text;
    const newText = newElement.text;

    if (oldText !== newText) {
      const updatedDiagramText = diagramText.replace(
        new RegExp(`\\[${escapeRegExp(oldText)}\\]`, 'g'),
        `[${newText}]`
      ).replace(
        new RegExp(`\\(${escapeRegExp(oldText)}\\)`, 'g'),
        `(${newText})`
      ).replace(
        new RegExp(`\\{${escapeRegExp(oldText)}\\}`, 'g'),
        `{${newText}}`
      );

      onDiagramTextChange(updatedDiagramText);
    }
  };

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  if (!selectedElement) {
    return (
      <GlassPanel variant="elevated" padding="4">
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: MermaidDesignTokens.spacing[4]
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: MermaidDesignTokens.spacing[2]
          }}>
            <Plus size={20} style={{ color: MermaidDesignTokens.colors.accent.green }} />
            <h3 style={{
              fontSize: MermaidDesignTokens.typography.fontSize.lg,
              fontWeight: MermaidDesignTokens.typography.fontWeight.semibold,
              margin: 0,
              color: MermaidDesignTokens.colors.text.primary
            }}>
              Add Shapes
            </h3>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: MermaidDesignTokens.spacing[4] }}>
          <GlassButton
            variant="primary"
            onClick={handleQuickAddProcess}
            icon={<Plus size={16} />}
            style={{ width: '100%', marginBottom: MermaidDesignTokens.spacing[2] }}
          >
            Quick Process Flow
          </GlassButton>
          <GlassButton
            variant="secondary"
            onClick={() => setShowShapePanel(!showShapePanel)}
            icon={<Square size={16} />}
            style={{ width: '100%' }}
          >
            {showShapePanel ? 'Hide Shapes' : 'Show All Shapes'}
          </GlassButton>
        </div>

        {/* Shape Templates */}
        {showShapePanel && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: MermaidDesignTokens.spacing[2],
            marginBottom: MermaidDesignTokens.spacing[4]
          }}>
            {shapeTemplates.map((template) => (
              <GlassButton
                key={template.id}
                variant="ghost"
                onClick={() => handleShapeAdd(template)}
                style={{
                  padding: MermaidDesignTokens.spacing[3],
                  height: 'auto',
                  flexDirection: 'column',
                  gap: MermaidDesignTokens.spacing[1]
                }}
              >
                <div style={{ fontSize: '20px' }}>{template.icon}</div>
                <span style={{
                  fontSize: MermaidDesignTokens.typography.fontSize.xs,
                  color: MermaidDesignTokens.colors.text.secondary
                }}>
                  {template.name}
                </span>
              </GlassButton>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div style={{
          padding: MermaidDesignTokens.spacing[3],
          background: MermaidDesignTokens.colors.glass.secondary,
          borderRadius: MermaidDesignTokens.borderRadius.lg,
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: MermaidDesignTokens.typography.fontSize.sm,
            margin: 0,
            color: MermaidDesignTokens.colors.text.tertiary,
            lineHeight: 1.5
          }}>
            Add shapes to your diagram or click on existing elements to edit them
          </p>
        </div>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel variant="elevated" padding="4">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: MermaidDesignTokens.spacing[4]
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: MermaidDesignTokens.spacing[2]
        }}>
          <Edit3 size={20} style={{ color: MermaidDesignTokens.colors.accent.blue }} />
          <h3 style={{
            fontSize: MermaidDesignTokens.typography.fontSize.lg,
            fontWeight: MermaidDesignTokens.typography.fontWeight.semibold,
            margin: 0,
            color: MermaidDesignTokens.colors.text.primary,
            textTransform: 'capitalize'
          }}>
            {selectedElement.type} Editor
          </h3>
        </div>

        <div style={{ display: 'flex', gap: MermaidDesignTokens.spacing[1] }}>
          <GlassButton
            variant="ghost"
            size="sm"
            icon={<Copy size={14} />}
            onClick={handleDuplicate}
            title="Duplicate Element"
          />
          <GlassButton
            variant="ghost"
            size="sm"
            icon={<Trash2 size={14} />}
            onClick={handleDelete}
            title="Delete Element"
            style={{ color: MermaidDesignTokens.colors.semantic.error[500] }}
          />
        </div>
      </div>

      {/* Element Info */}
      <div style={{
        padding: MermaidDesignTokens.spacing[3],
        background: MermaidDesignTokens.colors.glass.secondary,
        borderRadius: MermaidDesignTokens.borderRadius.lg,
        marginBottom: MermaidDesignTokens.spacing[4]
      }}>
        <div style={{
          fontSize: MermaidDesignTokens.typography.fontSize.xs,
          color: MermaidDesignTokens.colors.text.tertiary,
          marginBottom: '4px'
        }}>
          Element ID
        </div>
        <div style={{
          fontSize: MermaidDesignTokens.typography.fontSize.sm,
          fontFamily: MermaidDesignTokens.typography.fontFamily.mono,
          color: MermaidDesignTokens.colors.text.primary
        }}>
          {selectedElement.id}
        </div>
      </div>

      {/* Text Editing */}
      <div style={{ marginBottom: MermaidDesignTokens.spacing[4] }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: MermaidDesignTokens.spacing[2],
          marginBottom: MermaidDesignTokens.spacing[2]
        }}>
          <Type size={16} style={{ color: MermaidDesignTokens.colors.accent.blue }} />
          <span style={{
            fontSize: MermaidDesignTokens.typography.fontSize.sm,
            fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
            color: MermaidDesignTokens.colors.text.primary
          }}>
            Text Content
          </span>
        </div>

        {isTextEditing ? (
          <div style={{ display: 'flex', gap: MermaidDesignTokens.spacing[2] }}>
            <GlassInput
              ref={textInputRef}
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleTextSave();
                } else if (e.key === 'Escape') {
                  handleTextCancel();
                }
              }}
              style={{ flex: 1 }}
            />
            <GlassButton
              variant="primary"
              size="sm"
              onClick={handleTextSave}
            >
              Save
            </GlassButton>
            <GlassButton
              variant="ghost"
              size="sm"
              onClick={handleTextCancel}
            >
              Cancel
            </GlassButton>
          </div>
        ) : (
          <div
            onClick={handleTextEdit}
            style={{
              padding: MermaidDesignTokens.spacing[3],
              background: MermaidDesignTokens.colors.glass.primary,
              border: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
              borderRadius: MermaidDesignTokens.borderRadius.lg,
              cursor: 'pointer',
              transition: `all ${MermaidDesignTokens.animation.duration[200]} ${MermaidDesignTokens.animation.easing.inOut}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = MermaidDesignTokens.colors.glass.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = MermaidDesignTokens.colors.glass.primary;
            }}
          >
            <span style={{
              fontSize: MermaidDesignTokens.typography.fontSize.sm,
              color: MermaidDesignTokens.colors.text.primary
            }}>
              {selectedElement.text}
            </span>
            <Edit3 size={14} style={{
              color: MermaidDesignTokens.colors.text.tertiary,
              opacity: 0.7
            }} />
          </div>
        )}
      </div>

      {/* Style Editing */}
      <div style={{ marginBottom: MermaidDesignTokens.spacing[4] }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: MermaidDesignTokens.spacing[2],
          marginBottom: MermaidDesignTokens.spacing[3]
        }}>
          <Palette size={16} style={{ color: MermaidDesignTokens.colors.accent.purple }} />
          <span style={{
            fontSize: MermaidDesignTokens.typography.fontSize.sm,
            fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
            color: MermaidDesignTokens.colors.text.primary
          }}>
            Visual Style
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: MermaidDesignTokens.spacing[3] }}>
          {/* Fill Color */}
          <div>
            <label style={{
              fontSize: MermaidDesignTokens.typography.fontSize.xs,
              color: MermaidDesignTokens.colors.text.secondary,
              marginBottom: MermaidDesignTokens.spacing[1],
              display: 'block'
            }}>
              Fill Color
            </label>
            <div style={{ display: 'flex', gap: MermaidDesignTokens.spacing[2] }}>
              <input
                type="color"
                value={editingStyle.fill || '#3b82f6'}
                onChange={(e) => handleStyleChange('fill', e.target.value)}
                style={{
                  width: '40px',
                  height: '32px',
                  border: 'none',
                  borderRadius: MermaidDesignTokens.borderRadius.base,
                  cursor: 'pointer'
                }}
              />
              <GlassInput
                value={editingStyle.fill || '#3b82f6'}
                onChange={(e) => handleStyleChange('fill', e.target.value)}
                placeholder="#3b82f6"
                style={{ flex: 1 }}
              />
            </div>
          </div>

          {/* Stroke Color */}
          <div>
            <label style={{
              fontSize: MermaidDesignTokens.typography.fontSize.xs,
              color: MermaidDesignTokens.colors.text.secondary,
              marginBottom: MermaidDesignTokens.spacing[1],
              display: 'block'
            }}>
              Border Color
            </label>
            <div style={{ display: 'flex', gap: MermaidDesignTokens.spacing[2] }}>
              <input
                type="color"
                value={editingStyle.stroke || '#1e40af'}
                onChange={(e) => handleStyleChange('stroke', e.target.value)}
                style={{
                  width: '40px',
                  height: '32px',
                  border: 'none',
                  borderRadius: MermaidDesignTokens.borderRadius.base,
                  cursor: 'pointer'
                }}
              />
              <GlassInput
                value={editingStyle.stroke || '#1e40af'}
                onChange={(e) => handleStyleChange('stroke', e.target.value)}
                placeholder="#1e40af"
                style={{ flex: 1 }}
              />
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label style={{
              fontSize: MermaidDesignTokens.typography.fontSize.xs,
              color: MermaidDesignTokens.colors.text.secondary,
              marginBottom: MermaidDesignTokens.spacing[1],
              display: 'block'
            }}>
              Font Size
            </label>
            <GlassInput
              type="number"
              value={editingStyle.fontSize || 14}
              onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value))}
              min="8"
              max="32"
              placeholder="14"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'flex',
        gap: MermaidDesignTokens.spacing[2],
        paddingTop: MermaidDesignTokens.spacing[3],
        borderTop: `1px solid ${MermaidDesignTokens.colors.glass.border}`
      }}>
        <GlassButton
          variant="secondary"
          size="sm"
          icon={<Move size={14} />}
          style={{ flex: 1 }}
        >
          Move
        </GlassButton>
        <GlassButton
          variant="secondary"
          size="sm"
          icon={<RotateCw size={14} />}
          style={{ flex: 1 }}
        >
          Rotate
        </GlassButton>
      </div>
    </GlassPanel>
  );
};

export default VisualElementEditor;
