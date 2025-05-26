import React, { useState, useEffect, useRef } from 'react';
import { 
  Copy, 
  Trash2, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  AlignLeft,
  AlignRight,
  AlignCenter,
  Edit3,
  Layers,
  MoreHorizontal
} from 'lucide-react';
import { useFabricCanvasStore } from '../core/FabricCanvasStore';
import { getAlignmentManager } from '../core/AlignmentManager';
import { AUDIT_COLORS } from '../core/fabric-utils';

interface ContextMenuProps {
  x: number;
  y: number;
  visible: boolean;
  onClose: () => void;
  targetObject?: fabric.Object;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
  submenu?: MenuItem[];
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, visible, onClose, targetObject }) => {
  const { canvas } = useFabricCanvasStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const [submenuVisible, setSubmenuVisible] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onClose]);

  if (!visible || !canvas || !targetObject) return null;

  const isLocked = !targetObject.selectable;
  const isVisible = targetObject.visible !== false;
  const isConnector = (targetObject as any).isConnector;
  const isText = targetObject.type === 'i-text' || targetObject.type === 'text';

  const duplicateObject = () => {
    targetObject.clone((cloned: fabric.Object) => {
      cloned.set({
        left: (cloned.left || 0) + 10,
        top: (cloned.top || 0) + 10,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
    });
    onClose();
  };

  const deleteObject = () => {
    canvas.remove(targetObject);
    canvas.renderAll();
    onClose();
  };

  const toggleLock = () => {
    targetObject.set({
      selectable: isLocked,
      evented: isLocked
    });
    canvas.renderAll();
    onClose();
  };

  const toggleVisibility = () => {
    targetObject.set('visible', !isVisible);
    canvas.renderAll();
    onClose();
  };

  const bringToFront = () => {
    canvas.bringObjectToFront(targetObject);
    canvas.renderAll();
    onClose();
  };

  const sendToBack = () => {
    canvas.sendObjectToBack(targetObject);
    canvas.renderAll();
    onClose();
  };

  const editText = () => {
    if (isText) {
      canvas.setActiveObject(targetObject);
      (targetObject as fabric.IText).enterEditing();
      (targetObject as fabric.IText).selectAll();
    }
    onClose();
  };

  const alignmentItems: MenuItem[] = [
    {
      id: 'align-left',
      label: 'Align Left',
      icon: <AlignLeft size={16} />,
      action: () => {
        const alignmentManager = getAlignmentManager();
        const selectedObjects = canvas.getActiveObjects();
        if (alignmentManager && selectedObjects.length > 1) {
          alignmentManager.alignLeft(selectedObjects);
        }
        onClose();
      },
      disabled: canvas.getActiveObjects().length < 2
    },
    {
      id: 'align-center',
      label: 'Align Center',
      icon: <AlignCenter size={16} />,
      action: () => {
        const alignmentManager = getAlignmentManager();
        const selectedObjects = canvas.getActiveObjects();
        if (alignmentManager && selectedObjects.length > 1) {
          alignmentManager.alignCenterVertical(selectedObjects);
        }
        onClose();
      },
      disabled: canvas.getActiveObjects().length < 2
    },
    {
      id: 'align-right',
      label: 'Align Right',
      icon: <AlignRight size={16} />,
      action: () => {
        const alignmentManager = getAlignmentManager();
        const selectedObjects = canvas.getActiveObjects();
        if (alignmentManager && selectedObjects.length > 1) {
          alignmentManager.alignRight(selectedObjects);
        }
        onClose();
      },
      disabled: canvas.getActiveObjects().length < 2
    }
  ];

  const menuItems: MenuItem[] = [
    ...(isText ? [{
      id: 'edit-text',
      label: 'Edit Text',
      icon: <Edit3 size={16} />,
      action: editText
    }] : []),
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: <Copy size={16} />,
      action: duplicateObject,
      disabled: isConnector
    },
    {
      id: 'separator-1',
      label: '',
      icon: null,
      action: () => {},
      separator: true
    },
    {
      id: 'alignment',
      label: 'Alignment',
      icon: <AlignCenter size={16} />,
      action: () => setSubmenuVisible(submenuVisible === 'alignment' ? null : 'alignment'),
      submenu: alignmentItems
    },
    {
      id: 'layer-up',
      label: 'Bring Forward',
      icon: <ArrowUp size={16} />,
      action: bringToFront
    },
    {
      id: 'layer-down',
      label: 'Send Backward',
      icon: <ArrowDown size={16} />,
      action: sendToBack
    },
    {
      id: 'separator-2',
      label: '',
      icon: null,
      action: () => {},
      separator: true
    },
    {
      id: 'lock',
      label: isLocked ? 'Unlock' : 'Lock',
      icon: isLocked ? <Unlock size={16} /> : <Lock size={16} />,
      action: toggleLock
    },
    {
      id: 'visibility',
      label: isVisible ? 'Hide' : 'Show',
      icon: isVisible ? <EyeOff size={16} /> : <Eye size={16} />,
      action: toggleVisibility
    },
    {
      id: 'separator-3',
      label: '',
      icon: null,
      action: () => {},
      separator: true
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 size={16} />,
      action: deleteObject
    }
  ];

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: x,
    top: y,
    backgroundColor: 'white',
    border: `1px solid ${AUDIT_COLORS.border}`,
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    zIndex: 10000,
    minWidth: '200px',
    padding: '8px 0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    fontSize: '14px'
  };

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    color: '#374151',
    userSelect: 'none'
  };

  const disabledItemStyle: React.CSSProperties = {
    ...itemStyle,
    color: '#9ca3af',
    cursor: 'not-allowed'
  };

  const separatorStyle: React.CSSProperties = {
    height: '1px',
    backgroundColor: '#e5e7eb',
    margin: '4px 0'
  };

  return (
    <div ref={menuRef} style={menuStyle}>
      {menuItems.map((item, index) => {
        if (item.separator) {
          return <div key={`separator-${index}`} style={separatorStyle} />;
        }

        return (
          <div
            key={item.id}
            style={item.disabled ? disabledItemStyle : itemStyle}
            onClick={item.disabled ? undefined : item.action}
            onMouseEnter={(e) => {
              if (!item.disabled) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {item.icon}
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.submenu && (
              <MoreHorizontal size={16} style={{ color: '#9ca3af' }} />
            )}
          </div>
        );
      })}

      {/* Submenu for alignment */}
      {submenuVisible === 'alignment' && (
        <div
          style={{
            ...menuStyle,
            left: x + 200,
            top: y + 80,
            minWidth: '180px'
          }}
        >
          {alignmentItems.map((item, index) => (
            <div
              key={item.id}
              style={item.disabled ? disabledItemStyle : itemStyle}
              onClick={item.disabled ? undefined : item.action}
              onMouseEnter={(e) => {
                if (!item.disabled) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContextMenu;
