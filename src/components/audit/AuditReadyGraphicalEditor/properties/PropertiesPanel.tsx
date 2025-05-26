import React, { useState, useEffect } from 'react';
import { useFabricCanvasStore } from '../core/FabricCanvasStore';
import { AUDIT_COLORS } from '../core/fabric-utils';
import {
  X,
  Palette,
  Type,
  Move,
  RotateCw,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ArrowRight,
  Minus
} from 'lucide-react';

const PropertiesPanel: React.FC = () => {
  const { canvas, showProperties, setShowProperties } = useFabricCanvasStore();
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [isConnector, setIsConnector] = useState(false);
  const [connectorInstance, setConnectorInstance] = useState<any>(null);
  const [objectProps, setObjectProps] = useState({
    fill: '#000000',
    stroke: '#000000',
    strokeWidth: 1,
    opacity: 1,
    angle: 0,
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    fontSize: 16,
    fontFamily: 'Arial',
    text: '',
    locked: false,
    visible: true,
    // Connector properties
    lineStyle: 'solid' as 'solid' | 'dashed' | 'dotted',
    hasArrow: true
  });

  useEffect(() => {
    if (!canvas) return;

    const updateSelectedObject = () => {
      try {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
          setSelectedObject(activeObject);

          // Check if it's a smart connector
          const isSmartConnector = (activeObject as any).isSmartConnector || (activeObject as any).isConnector;
          const connectorInst = (activeObject as any).connectorInstance;

          setIsConnector(isSmartConnector);
          setConnectorInstance(connectorInst || null);

          if (isSmartConnector && connectorInst) {
            try {
              // Set connector properties with error handling
              const connectorProps = connectorInst.getProperties();
              setObjectProps({
                fill: connectorProps.strokeColor || '#000000',
                stroke: connectorProps.strokeColor || '#000000',
                strokeWidth: connectorProps.strokeWidth || 2,
                opacity: activeObject.opacity || 1,
                angle: activeObject.angle || 0,
                left: Math.round(activeObject.left || 0),
                top: Math.round(activeObject.top || 0),
                width: 0,
                height: 0,
                fontSize: 16,
                fontFamily: 'Arial',
                text: '',
                locked: !activeObject.selectable,
                visible: activeObject.visible !== false,
                lineStyle: connectorProps.lineStyle || 'solid',
                hasArrow: connectorProps.hasArrow !== false
              });
            } catch (error) {
              console.error('Error getting connector properties:', error);
              // Fallback to basic properties
              setObjectProps({
                fill: '#000000',
                stroke: '#000000',
                strokeWidth: 2,
                opacity: 1,
                angle: 0,
                left: 0,
                top: 0,
                width: 0,
                height: 0,
                fontSize: 16,
                fontFamily: 'Arial',
                text: '',
                locked: false,
                visible: true,
                lineStyle: 'solid',
                hasArrow: true
              });
            }
          } else {
            // Set regular object properties with safe property access
            const safeGet = (prop: string, defaultValue: any) => {
              try {
                return activeObject[prop] !== undefined ? activeObject[prop] : defaultValue;
              } catch {
                return defaultValue;
              }
            };

            setObjectProps({
              fill: safeGet('fill', '#000000'),
              stroke: safeGet('stroke', '#000000'),
              strokeWidth: safeGet('strokeWidth', 1),
              opacity: safeGet('opacity', 1),
              angle: safeGet('angle', 0),
              left: Math.round(safeGet('left', 0)),
              top: Math.round(safeGet('top', 0)),
              width: Math.round((safeGet('width', 0)) * (safeGet('scaleX', 1))),
              height: Math.round((safeGet('height', 0)) * (safeGet('scaleY', 1))),
              fontSize: safeGet('fontSize', 16),
              fontFamily: safeGet('fontFamily', 'Arial'),
              text: safeGet('text', ''),
              locked: !safeGet('selectable', true),
              visible: safeGet('visible', true),
              lineStyle: 'solid',
              hasArrow: true
            });
          }
          setShowProperties(true);
        } else {
          setSelectedObject(null);
          setIsConnector(false);
          setConnectorInstance(null);
          setShowProperties(false);
        }
      } catch (error) {
        console.error('Error updating selected object:', error);
        // Reset state on error
        setSelectedObject(null);
        setIsConnector(false);
        setConnectorInstance(null);
        setShowProperties(false);
      }
    };

    canvas.on('selection:created', updateSelectedObject);
    canvas.on('selection:updated', updateSelectedObject);
    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
      setIsConnector(false);
      setConnectorInstance(null);
      setShowProperties(false);
    });

    return () => {
      canvas.off('selection:created', updateSelectedObject);
      canvas.off('selection:updated', updateSelectedObject);
      canvas.off('selection:cleared');
    };
  }, [canvas, setShowProperties]);

  const updateObjectProperty = (property: string, value: any) => {
    if (!selectedObject || !canvas) return;

    selectedObject.set(property, value);
    canvas.renderAll();

    setObjectProps(prev => ({ ...prev, [property]: value }));
  };

  const updateConnectorProperty = (property: string, value: any) => {
    if (!connectorInstance) return;

    switch (property) {
      case 'strokeColor':
        connectorInstance.updateStyle({ strokeColor: value });
        setObjectProps(prev => ({ ...prev, fill: value, stroke: value }));
        break;
      case 'strokeWidth':
        connectorInstance.updateStyle({ strokeWidth: value });
        setObjectProps(prev => ({ ...prev, strokeWidth: value }));
        break;
      case 'lineStyle':
        connectorInstance.updateStyle({ lineStyle: value });
        setObjectProps(prev => ({ ...prev, lineStyle: value }));
        break;
      case 'hasArrow':
        connectorInstance.updateStyle({ hasArrow: value });
        setObjectProps(prev => ({ ...prev, hasArrow: value }));
        break;
    }
  };

  const handlePositionChange = (property: 'left' | 'top', value: number) => {
    updateObjectProperty(property, value);
  };

  const handleSizeChange = (property: 'width' | 'height', value: number) => {
    if (!selectedObject) return;

    const scaleProperty = property === 'width' ? 'scaleX' : 'scaleY';
    const originalSize = property === 'width' ? selectedObject.width : selectedObject.height;
    const scale = value / originalSize;

    updateObjectProperty(scaleProperty, scale);
  };

  const duplicateObject = () => {
    if (!selectedObject || !canvas) return;

    selectedObject.clone((cloned: any) => {
      cloned.set({
        left: cloned.left + 10,
        top: cloned.top + 10,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
    });
  };

  const deleteObject = () => {
    if (!selectedObject || !canvas) return;

    // If it's a smart connector, use its remove method
    if (connectorInstance) {
      connectorInstance.remove();
    } else {
      canvas.remove(selectedObject);
    }

    canvas.renderAll();
    setShowProperties(false);
  };

  const toggleLock = () => {
    if (!selectedObject) return;

    const newLocked = !objectProps.locked;
    selectedObject.set({
      selectable: !newLocked,
      evented: !newLocked
    });
    canvas.renderAll();
    setObjectProps(prev => ({ ...prev, locked: newLocked }));
  };

  const toggleVisibility = () => {
    if (!selectedObject) return;

    const newVisible = !objectProps.visible;
    selectedObject.set('visible', newVisible);
    canvas.renderAll();
    setObjectProps(prev => ({ ...prev, visible: newVisible }));
  };

  if (!showProperties || !selectedObject) return null;

  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top: '64px', // Start below header
        bottom: 0,
        width: '320px',
        backgroundColor: 'white',
        borderLeft: '1px solid #e2e8f0',
        boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.1)',
        zIndex: 999,
        overflowY: 'auto',
        overflowX: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
        fontSize: '14px',
        lineHeight: 1.5,
        color: '#1f2937'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 20px 16px 20px',
          borderBottom: '1px solid #f1f5f9',
          backgroundColor: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <h3 style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#1e293b',
          margin: 0,
          fontFamily: 'inherit'
        }}>
          {isConnector ? 'Connector Properties' : 'Object Properties'}
        </h3>
        <button
          onClick={() => setShowProperties(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            background: 'transparent',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#64748b',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
            e.currentTarget.style.color = '#334155';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#64748b';
          }}
        >
          <X style={{ width: '16px', height: '16px' }} />
        </button>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Object Actions */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#475569',
            margin: '0 0 12px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontFamily: 'inherit'
          }}>
            Actions
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px'
          }}>
            {!isConnector && (
              <button
                onClick={duplicateObject}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  fontSize: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  fontWeight: 500
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <Copy style={{ width: '14px', height: '14px' }} />
                Duplicate
              </button>
            )}
            <button
              onClick={deleteObject}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                fontSize: '12px',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#dc2626',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fef2f2';
                e.currentTarget.style.borderColor = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#fecaca';
              }}
            >
              <Trash2 style={{ width: '14px', height: '14px' }} />
              Delete
            </button>
            <button
              onClick={toggleLock}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                fontSize: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#374151',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              {objectProps.locked ? <Unlock style={{ width: '14px', height: '14px' }} /> : <Lock style={{ width: '14px', height: '14px' }} />}
              {objectProps.locked ? 'Unlock' : 'Lock'}
            </button>
            <button
              onClick={toggleVisibility}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                fontSize: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#374151',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              {objectProps.visible ? <EyeOff style={{ width: '14px', height: '14px' }} /> : <Eye style={{ width: '14px', height: '14px' }} />}
              {objectProps.visible ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Connector-specific properties */}
        {isConnector && connectorInstance && (
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Connector Style
            </h4>

            {/* Line Style */}
            <div>
              <label className="block text-xs text-gray-600 mb-2">Line Style</label>
              <div className="grid grid-cols-3 gap-2">
                {['solid', 'dashed', 'dotted'].map((style) => (
                  <button
                    key={style}
                    onClick={() => updateConnectorProperty('lineStyle', style)}
                    className={`p-2 border rounded text-xs font-medium transition-colors ${
                      objectProps.lineStyle === style
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      {style === 'solid' && <Minus className="w-4 h-4" />}
                      {style === 'dashed' && <span className="text-xs">- - -</span>}
                      {style === 'dotted' && <span className="text-xs">• • •</span>}
                    </div>
                    <span className="capitalize">{style}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Arrow Toggle */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={objectProps.hasArrow}
                  onChange={(e) => updateConnectorProperty('hasArrow', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Show Arrow</span>
              </label>
            </div>

            {/* Line Color */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Line Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={objectProps.stroke}
                  onChange={(e) => updateConnectorProperty('strokeColor', e.target.value)}
                  className="w-8 h-8 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={objectProps.stroke}
                  onChange={(e) => updateConnectorProperty('strokeColor', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border rounded"
                  style={{ borderColor: AUDIT_COLORS.border }}
                />
              </div>
            </div>

            {/* Line Width */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Line Width</label>
              <input
                type="range"
                min="1"
                max="10"
                value={objectProps.strokeWidth}
                onChange={(e) => updateConnectorProperty('strokeWidth', Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-600 text-center">{objectProps.strokeWidth}px</div>
            </div>

            {/* Connection Info */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-xs text-gray-700 mb-2">Connection Info</h5>
              <div className="text-xs text-gray-600 space-y-1">
                <div>From: {connectorInstance.startPoint}</div>
                <div>To: {connectorInstance.endPoint}</div>
              </div>
            </div>
          </div>
        )}

        {/* Regular object properties */}
        {!isConnector && (
          <>
            {/* Position & Size */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                <Move className="w-4 h-4" />
                Position & Size
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">X</label>
                  <input
                    type="number"
                    value={objectProps.left}
                    onChange={(e) => handlePositionChange('left', Number(e.target.value))}
                    className="w-full px-2 py-1 text-sm border rounded"
                    style={{ borderColor: AUDIT_COLORS.border }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Y</label>
                  <input
                    type="number"
                    value={objectProps.top}
                    onChange={(e) => handlePositionChange('top', Number(e.target.value))}
                    className="w-full px-2 py-1 text-sm border rounded"
                    style={{ borderColor: AUDIT_COLORS.border }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Width</label>
                  <input
                    type="number"
                    value={objectProps.width}
                    onChange={(e) => handleSizeChange('width', Number(e.target.value))}
                    className="w-full px-2 py-1 text-sm border rounded"
                    style={{ borderColor: AUDIT_COLORS.border }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Height</label>
                  <input
                    type="number"
                    value={objectProps.height}
                    onChange={(e) => handleSizeChange('height', Number(e.target.value))}
                    className="w-full px-2 py-1 text-sm border rounded"
                    style={{ borderColor: AUDIT_COLORS.border }}
                  />
                </div>
              </div>
            </div>

            {/* Rotation */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                <RotateCw className="w-4 h-4" />
                Rotation
              </h4>
              <input
                type="range"
                min="0"
                max="360"
                value={objectProps.angle}
                onChange={(e) => updateObjectProperty('angle', Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-600 text-center">{Math.round(objectProps.angle)}°</div>
            </div>

            {/* Opacity */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Opacity</h4>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={objectProps.opacity}
                onChange={(e) => updateObjectProperty('opacity', Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-600 text-center">{Math.round(objectProps.opacity * 100)}%</div>
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Colors
              </h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Fill</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={objectProps.fill}
                      onChange={(e) => updateObjectProperty('fill', e.target.value)}
                      className="w-8 h-8 border rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={objectProps.fill}
                      onChange={(e) => updateObjectProperty('fill', e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border rounded"
                      style={{ borderColor: AUDIT_COLORS.border }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Stroke</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={objectProps.stroke}
                      onChange={(e) => updateObjectProperty('stroke', e.target.value)}
                      className="w-8 h-8 border rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={objectProps.stroke}
                      onChange={(e) => updateObjectProperty('stroke', e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border rounded"
                      style={{ borderColor: AUDIT_COLORS.border }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Stroke Width</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={objectProps.strokeWidth}
                    onChange={(e) => updateObjectProperty('strokeWidth', Number(e.target.value))}
                    className="w-full px-2 py-1 text-sm border rounded"
                    style={{ borderColor: AUDIT_COLORS.border }}
                  />
                </div>
              </div>
            </div>

            {/* Text Properties */}
            {(selectedObject.type === 'i-text' || selectedObject.type === 'text' || selectedObject.type === 'textbox') && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Text
                </h4>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Content</label>
                  <textarea
                    value={objectProps.text}
                    onChange={(e) => updateObjectProperty('text', e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded resize-none"
                    style={{ borderColor: AUDIT_COLORS.border }}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Font Size</label>
                  <input
                    type="number"
                    min="8"
                    max="200"
                    value={objectProps.fontSize}
                    onChange={(e) => updateObjectProperty('fontSize', Number(e.target.value))}
                    className="w-full px-2 py-1 text-sm border rounded"
                    style={{ borderColor: AUDIT_COLORS.border }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Font Family</label>
                  <select
                    value={objectProps.fontFamily}
                    onChange={(e) => updateObjectProperty('fontFamily', e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded"
                    style={{ borderColor: AUDIT_COLORS.border }}
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Inter">Inter</option>
                  </select>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;