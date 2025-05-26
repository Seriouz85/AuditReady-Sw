import React, { useState, useEffect } from 'react';
import { useFabricCanvasStore } from '../../core/FabricCanvasStore';
import { toggleDrawingMode, AUDIT_COLORS } from '../../core/fabric-utils';
import { Pencil, Eraser, Palette, Minus, Plus, Droplets } from 'lucide-react';

const drawingColors = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
  AUDIT_COLORS.primary, AUDIT_COLORS.secondary, AUDIT_COLORS.warning, AUDIT_COLORS.danger
];

const brushSizes = [
  { label: 'XS', value: 2 },
  { label: 'S', value: 5 },
  { label: 'M', value: 10 },
  { label: 'L', value: 15 },
  { label: 'XL', value: 25 },
  { label: 'XXL', value: 35 }
];

const DrawingPanel: React.FC = () => {
  const { canvas } = useFabricCanvasStore();
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [drawingColor, setDrawingColor] = useState<string>('#000000'); // Default to black
  const [brushWidth, setBrushWidth] = useState(5);
  const [drawingOpacity, setDrawingOpacity] = useState(100);

  // Auto-activate drawing mode when panel opens
  useEffect(() => {
    if (canvas && !isDrawingMode) {
      console.log('DrawingPanel: Activating drawing mode');
      setIsDrawingMode(true);
      toggleDrawingMode(canvas, true, drawingColor, brushWidth);
    }
    
    // Cleanup: exit drawing mode when component unmounts
    return () => {
      if (canvas && isDrawingMode) {
        console.log('DrawingPanel: Deactivating drawing mode');
        toggleDrawingMode(canvas, false, drawingColor, brushWidth);
        setIsDrawingMode(false);
      }
    };
  }, [canvas, drawingColor, brushWidth]); // Include dependencies for proper activation

  // Update brush when color or width changes
  useEffect(() => {
    if (canvas && isDrawingMode && canvas.freeDrawingBrush) {
      if (!isErasing) {
        canvas.freeDrawingBrush.color = drawingColor;
        canvas.freeDrawingBrush.width = brushWidth;
      }
    }
  }, [canvas, isDrawingMode, drawingColor, brushWidth, isErasing]);

  const handleToggleDrawingMode = () => {
    if (!canvas) return;
    
    const newMode = !isDrawingMode;
    setIsDrawingMode(newMode);
    
    if (newMode && isErasing) {
      setIsErasing(false);
    }
    
    toggleDrawingMode(canvas, newMode, drawingColor, brushWidth);
  };

  const handleDrawingColorChange = (color: string) => {
    setDrawingColor(color);
    
    if (canvas && isDrawingMode && !isErasing && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color;
    }
  };

  const handleBrushWidthChange = (width: number) => {
    setBrushWidth(width);
    if (canvas && isDrawingMode && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = isErasing ? width * 2 : width;
    }
  };

  const handleDrawingOpacityChange = (opacity: number) => {
    setDrawingOpacity(opacity);
    if (canvas && isDrawingMode && canvas.freeDrawingBrush) {
      // Note: Fabric.js doesn't directly support brush opacity, 
      // but we can simulate it with color alpha
      const alpha = Math.round(opacity * 2.55).toString(16).padStart(2, '0');
      const colorWithAlpha = drawingColor + alpha;
      canvas.freeDrawingBrush.color = colorWithAlpha;
    }
  };

  const handleToggleErasing = () => {
    if (!canvas || !isDrawingMode) return;
    
    const newErasing = !isErasing;
    setIsErasing(newErasing);
    
    if (canvas.freeDrawingBrush) {
      if (newErasing) {
        canvas.freeDrawingBrush.color = '#ffffff';
        canvas.freeDrawingBrush.width = brushWidth * 2;
      } else {
        canvas.freeDrawingBrush.color = drawingColor;
        canvas.freeDrawingBrush.width = brushWidth;
      }
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Drawing Mode Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: isDrawingMode ? `${AUDIT_COLORS.primary}15` : `${AUDIT_COLORS.neutral}15`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Pencil 
            style={{ 
              width: '20px', 
              height: '20px', 
              color: isDrawingMode ? AUDIT_COLORS.primary : AUDIT_COLORS.neutral 
            }} 
            className={isDrawingMode ? 'animate-bounce' : ''}
          />
          <span style={{ 
            fontWeight: 600, 
            color: isDrawingMode ? AUDIT_COLORS.primary : AUDIT_COLORS.neutral 
          }}>
            {isDrawingMode ? 'Drawing Mode Active' : 'Drawing Mode Inactive'}
          </span>
        </div>
        <button
          onClick={handleToggleDrawingMode}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            borderRadius: '6px',
            border: `1px solid ${isDrawingMode ? AUDIT_COLORS.primary : AUDIT_COLORS.neutral}`,
            color: isDrawingMode ? AUDIT_COLORS.primary : AUDIT_COLORS.neutral,
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          {isDrawingMode ? 'Exit' : 'Activate'}
        </button>
      </div>

      {isDrawingMode && (
        <>
          {/* Color Palette */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Palette style={{ width: '16px', height: '16px', color: AUDIT_COLORS.primary }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Color Palette</span>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: '2px solid #e5e7eb',
                  backgroundColor: drawingColor,
                  marginLeft: 'auto'
                }}
              />
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gap: '8px' 
            }}>
              {drawingColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleDrawingColorChange(color)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: `2px solid ${color === drawingColor ? AUDIT_COLORS.primary : (color === '#ffffff' ? '#e5e7eb' : color)}`,
                    backgroundColor: color,
                    cursor: 'pointer',
                    transform: color === drawingColor ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                    boxShadow: color === drawingColor ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
                  }}
                  disabled={isErasing}
                />
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="color"
                value={drawingColor}
                onChange={(e) => handleDrawingColorChange(e.target.value)}
                style={{
                  width: '48px',
                  height: '40px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                disabled={isErasing}
              />
              <input
                type="text"
                value={drawingColor}
                onChange={(e) => handleDrawingColorChange(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
                disabled={isErasing}
              />
            </div>
          </div>

          {/* Brush Size */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Pencil style={{ width: '16px', height: '16px', color: AUDIT_COLORS.primary }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Brush Size</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Minus style={{ width: '16px', height: '16px', color: '#6b7280' }} />
              <input
                type="range"
                min="1"
                max="50"
                value={brushWidth}
                onChange={(e) => handleBrushWidthChange(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <Plus style={{ width: '16px', height: '16px', color: '#6b7280' }} />
            </div>
            <div style={{ 
              textAlign: 'center', 
              fontSize: '13px', 
              color: '#6b7280',
              fontWeight: 500
            }}>
              {brushWidth}px
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '8px' 
            }}>
              {brushSizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => handleBrushWidthChange(size.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: `1px solid ${size.value === brushWidth ? AUDIT_COLORS.primary : '#e5e7eb'}`,
                    backgroundColor: size.value === brushWidth ? `${AUDIT_COLORS.primary}15` : 'white',
                    color: size.value === brushWidth ? AUDIT_COLORS.primary : '#374151',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opacity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Droplets style={{ width: '16px', height: '16px', color: AUDIT_COLORS.primary }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Opacity</span>
              <span style={{ 
                marginLeft: 'auto', 
                fontSize: '13px', 
                color: '#6b7280',
                fontWeight: 500
              }}>
                {drawingOpacity}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={drawingOpacity}
              onChange={(e) => handleDrawingOpacityChange(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Eraser Tool */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eraser style={{ width: '16px', height: '16px', color: AUDIT_COLORS.warning }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Eraser Tool</span>
            </div>
            
            <button
              onClick={handleToggleErasing}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: `1px solid ${isErasing ? AUDIT_COLORS.warning : '#e5e7eb'}`,
                backgroundColor: isErasing ? `${AUDIT_COLORS.warning}15` : 'white',
                color: isErasing ? AUDIT_COLORS.warning : '#374151',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
                             <Eraser 
                 style={{ 
                   width: '18px', 
                   height: '18px'
                 }}
                 className={isErasing ? 'animate-pulse' : ''}
               />
              {isErasing ? 'Exit Eraser Mode' : 'Enter Eraser Mode'}
            </button>
            
            {isErasing && (
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: `${AUDIT_COLORS.warning}10`,
                border: `1px solid ${AUDIT_COLORS.warning}30`
              }}>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0,
                  lineHeight: 1.4
                }}>
                  Eraser mode is active. Draw to erase parts of your drawing.
                  Eraser size is automatically 2x your brush size.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DrawingPanel; 