import React from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Grid3X3,
  Magnet,
  ArrowLeftRight,
  ArrowUpDown
} from 'lucide-react';
import { useFabricCanvasStore } from '../core/FabricCanvasStore';
import { getAlignmentManager } from '../core/AlignmentManager';
import { getGridManager } from '../core/GridManager';
import { AUDIT_COLORS } from '../core/fabric-utils';

interface AlignmentToolbarProps {
  visible: boolean;
  selectedObjects: fabric.Object[];
}

const AlignmentToolbar: React.FC<AlignmentToolbarProps> = ({ visible, selectedObjects }) => {
  const { canvas } = useFabricCanvasStore();
  const alignmentManager = getAlignmentManager();
  const gridManager = getGridManager();
  const [snapEnabled, setSnapEnabled] = React.useState(true);
  const [gridEnabled, setGridEnabled] = React.useState(true);

  if (!visible || !canvas || !alignmentManager || selectedObjects.length < 2) {
    return null;
  }

  const handleAlignLeft = () => alignmentManager.alignLeft(selectedObjects);
  const handleAlignCenter = () => alignmentManager.alignCenterVertical(selectedObjects);
  const handleAlignRight = () => alignmentManager.alignRight(selectedObjects);
  const handleAlignTop = () => alignmentManager.alignTop(selectedObjects);
  const handleAlignMiddle = () => alignmentManager.alignCenterHorizontal(selectedObjects);
  const handleAlignBottom = () => alignmentManager.alignBottom(selectedObjects);
  const handleDistributeH = () => alignmentManager.distributeHorizontally(selectedObjects);
  const handleDistributeV = () => alignmentManager.distributeVertically(selectedObjects);

  const toolbarStyle: React.CSSProperties = {
    position: 'absolute',
    top: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'white',
    border: `1px solid ${AUDIT_COLORS.border}`,
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    padding: '8px',
    display: 'flex',
    gap: '4px',
    zIndex: 1000,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    color: '#374151'
  };

  const separatorStyle: React.CSSProperties = {
    width: '1px',
    height: '28px',
    backgroundColor: '#e5e7eb',
    margin: '4px 8px'
  };

  const Button: React.FC<{
    onClick: () => void;
    title: string;
    icon: React.ReactNode;
    disabled?: boolean;
  }> = ({ onClick, title, icon, disabled = false }) => (
    <button
      style={{
        ...buttonStyle,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
      onClick={disabled ? undefined : onClick}
      title={title}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {icon}
    </button>
  );

  return (
    <div style={toolbarStyle}>
      {/* Horizontal Alignment */}
      <Button
        onClick={handleAlignLeft}
        title="Align Left"
        icon={<AlignLeft size={18} />}
      />
      <Button
        onClick={handleAlignCenter}
        title="Align Center"
        icon={<AlignCenter size={18} />}
      />
      <Button
        onClick={handleAlignRight}
        title="Align Right"
        icon={<AlignRight size={18} />}
      />

      <div style={separatorStyle} />

      {/* Vertical Alignment */}
      <Button
        onClick={handleAlignTop}
        title="Align Top"
        icon={<AlignStartVertical size={18} />}
      />
      <Button
        onClick={handleAlignMiddle}
        title="Align Middle"
        icon={<AlignCenterVertical size={18} />}
      />
      <Button
        onClick={handleAlignBottom}
        title="Align Bottom"
        icon={<AlignEndVertical size={18} />}
      />

      <div style={separatorStyle} />

      {/* Distribution */}
      <Button
        onClick={handleDistributeH}
        title="Distribute Horizontally"
        icon={<ArrowLeftRight size={18} />}
        disabled={selectedObjects.length < 3}
      />
      <Button
        onClick={handleDistributeV}
        title="Distribute Vertically"
        icon={<ArrowUpDown size={18} />}
        disabled={selectedObjects.length < 3}
      />

      <div style={separatorStyle} />

      {/* Grid and Snap Toggle */}
      <Button
        onClick={() => {
          const newGridState = !gridEnabled;
          setGridEnabled(newGridState);
          if (gridManager) {
            gridManager.setEnabled(newGridState);
          }
        }}
        title={`${gridEnabled ? 'Hide' : 'Show'} Grid`}
        icon={<Grid3X3 size={18} style={{ color: gridEnabled ? '#3b82f6' : '#9ca3af' }} />}
      />
      <Button
        onClick={() => {
          const newSnapState = !snapEnabled;
          setSnapEnabled(newSnapState);
          alignmentManager.setEnabled(newSnapState);
        }}
        title={`${snapEnabled ? 'Disable' : 'Enable'} Snap to Guidelines`}
        icon={<Magnet size={18} style={{ color: snapEnabled ? '#3b82f6' : '#9ca3af' }} />}
      />
    </div>
  );
};

export default AlignmentToolbar;
