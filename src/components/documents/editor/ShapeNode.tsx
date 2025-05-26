import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  Box, 
  Typography,
  ClickAwayListener,
  TextField,
  Paper,
  Fade,
  IconButton,
  Tooltip,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material';
import { 
  Add as AddIcon,
  CropSquare as RectangleIcon, 
  PentagonOutlined as DiamondIcon,
  CircleOutlined as CircleIcon,
  Timeline as LineIcon
} from '@mui/icons-material';

interface ShapeMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onSelect: (shapeType: string) => void;
}

// Shape selection menu component
const ShapeMenu: React.FC<ShapeMenuProps> = ({ anchorEl, open, onClose, onSelect }) => {
  const theme = useTheme();
  
  const shapeOptions = [
    { type: 'rectangle', label: 'Rectangle', icon: <RectangleIcon sx={{ color: theme.palette.primary.main }} /> },
    { type: 'circle', label: 'Circle', icon: <CircleIcon sx={{ color: theme.palette.primary.main }} /> },
    { type: 'diamond', label: 'Diamond', icon: <DiamondIcon sx={{ color: theme.palette.primary.main }} /> }
  ];
  
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      sx={{ 
        '& .MuiPaper-root': { 
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'rgba(0,0,0,0.08)'
        }
      }}
    >
      <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: 'text.secondary', fontWeight: 500 }}>
        Select Shape
      </Typography>
      {shapeOptions.map((shape) => (
        <MenuItem 
          key={shape.type} 
          onClick={() => {
            onSelect(shape.type);
            onClose();
          }}
          sx={{ 
            borderRadius: 1, 
            mx: 1, 
            my: 0.5,
            '&:hover': { 
              backgroundColor: `${theme.palette.primary.main}15`
            }
          }}
        >
          <ListItemIcon>
            {shape.icon}
          </ListItemIcon>
          {shape.label}
        </MenuItem>
      ))}
    </Menu>
  );
};

// Shape node (rectangle, circle, diamond, etc.)
const ShapeNode = ({ data, selected, id }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [labelText, setLabelText] = useState(data.label || '');
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    position: 'right' | 'bottom';
  } | null>(null);
  const [hovered, setHovered] = useState(false);
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPosition, setMenuPosition] = useState<'right' | 'bottom'>('right');
  const shapeRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // State for displaying locked tooltip
  const [showLockedTooltip, setShowLockedTooltip] = useState(false);
  
  // Use proper shape type or fallback to rectangle
  const shapeType = data.shapeType || 'rectangle';
  // Get width and height from data or use defaults
  const width = data.width || 150;
  const height = data.height || 100;
  // Get color or use default
  const color = data.color || '#1976d2';
  // Get gradient if it exists
  const gradient = data.gradient;
  // Get text color or use default
  const textColor = data.textColor || '#ffffff';
  // Check if node is part of a locked template
  const isLocked = Boolean(data.isLocked);
  
  // Add specific class for timeline diamonds
  const isTimelineDiamond = 
    data.templateId === 'yearly-timeline' && 
    data.shapeType === 'diamond' &&
    (id.includes('month-') || id.includes('milestone'));
  
  // Update local label when data changes from outside
  useEffect(() => {
    if (data.label !== undefined && data.label !== labelText) {
      setLabelText(data.label);
    }
  }, [data.label]);

  // Get shape style
  const getShapeStyle = () => {
    let style: React.CSSProperties = {
      width: width,
      height: height,
      backgroundColor: gradient || color,
      color: textColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px',
      transition: 'all 0.2s ease',
      position: 'relative',
      cursor: isLocked ? 'default' : 'move'
    };
    
    // Add extra styling for locked template nodes
    if (isLocked) {
      style.boxShadow = selected 
        ? '0 0 0 2px rgba(32, 101, 209, 0.8)' 
        : 'none';
    } else {
      style.boxShadow = selected || hovered
        ? '0 0 20px rgba(0, 0, 0, 0.15)'
        : 'none';
    }

    // Add specific styles based on shape type
    switch (shapeType) {
      case 'circle':
        style.borderRadius = '50%';
        break;
      
      case 'rectangle':
        style.borderRadius = data.borderRadius || '4px';
        break;
        
      case 'rounded-rect':
        style.borderRadius = '10px';
        break;
        
      case 'diamond':
        style.transform = 'rotate(45deg)';
        style.width = (width) * 0.7;
        style.height = (height) * 0.7;
        break;
      
      case 'pill':
        style.borderRadius = '999px';
        break;
        
      case 'hexagon':
        // Use clip-path to create a hexagon shape
        style.clipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
        // Ensure dimensions are equal for a regular hexagon
        const maxDimension = Math.max(width, height);
        style.width = maxDimension;
        style.height = maxDimension;
        break;
        
      // default rectangle
      default:
        style.borderRadius = '4px';
    }
    
    // Add gradient if provided
    if (gradient) {
      style.background = gradient;
    }
    
    return style;
  };

  // Helper function to lighten or darken a color
  const adjustColor = (color: string, amount: number): string => {
    // Skip processing if it's not a hex color
    if (!color || color.indexOf('#') !== 0) return color;
    
    let hex = color.slice(1);
    
    // Convert to RGB
    let r = parseInt(hex.substr(0,2), 16);
    let g = parseInt(hex.substr(2,2), 16);
    let b = parseInt(hex.substr(4,2), 16);
    
    // Lighten or darken
    r = Math.min(255, Math.max(0, r + amount));
    g = Math.min(255, Math.max(0, g + amount));
    b = Math.min(255, Math.max(0, b + amount));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Even if the shape is locked, we allow editing the text content
    if (!isEditing) {
      setIsEditing(true);
      setLabelText(data.label || '');
      // Focus the input after it's rendered
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 10);
    }
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If template is locked, show indication
    if (isLocked && !isEditing) {
      setShowLockedTooltip(true);
      setTimeout(() => setShowLockedTooltip(false), 2000);
    }
  };

  // Handle text change
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newText = event.target.value;
    setLabelText(newText);
    
    // Update node data
    if (data.updateLabel) {
      data.updateLabel(newText);
    } else {
      data.label = newText;
    }
  };

  // Handle click away to save
  const handleClickAway = () => {
    setIsEditing(false);
  };

  // Handle key press (save on Enter)
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      setIsEditing(false);
    }
  };

  // Open shape menu
  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement | HTMLDivElement>, position: 'right' | 'bottom') => {
    // Don't show context menu for locked templates
    if (isLocked) {
      setShowLockedTooltip(true);
      setTimeout(() => setShowLockedTooltip(false), 2000);
      return;
    }
    
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      position
    });
  };

  // Close shape menu
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Add a connected node with the selected shape
  const addConnectedShape = (shapeType: string) => {
    if (data.addConnectedNode) {
      // Call the parent function to add a connected node
      data.addConnectedNode(menuPosition, shapeType);
      
      // Immediately toggle the menu closed after selection
      handleCloseMenu();
      
      // Highlight the current node briefly to indicate it's the source of connection
      const currentShape = shapeRef.current;
      if (currentShape) {
        currentShape.style.boxShadow = '0 0 0 3px #4D93FE, 0 16px 32px rgba(0,0,0,0.15)';
        setTimeout(() => {
          if (currentShape) {
            currentShape.style.boxShadow = selected 
              ? '0 16px 32px rgba(0,0,0,0.15), 0 3px 8px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.1) inset'
              : '0 8px 24px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.05) inset';
          }
        }, 300);
      }
      
      // Force panel to shift and track new item position by dispatching a custom event
      try {
        const panelShiftEvent = new CustomEvent('panel-shift-requested', { 
          detail: { direction: menuPosition, sourceNodeId: data.id }
        });
        document.dispatchEvent(panelShiftEvent);
      } catch (error) {
        console.error('Error dispatching panel shift event:', error);
      }
    }
  };

  // Define the connection handle styles
  const handleStyle = {
    background: '#fff', 
    border: '2px solid',
    borderColor: color,
    width: 10, 
    height: 10, 
    zIndex: 10,
    opacity: hovered || selected ? 1 : 0,
    transition: 'opacity 0.2s, transform 0.2s',
    transform: hovered || selected ? 'scale(1)' : 'scale(0.8)',
    boxShadow: '0 0 10px rgba(0,0,0,0.15)'
  };

  // Add a subtle glow effect based on the shape color
  const getBackgroundGlow = (): React.CSSProperties => {
    if (!hovered && !selected) return {};
    return {
      boxShadow: `0 0 30px ${adjustColor(color, 60)}`
    };
  };

  // Generate class names based on template and lock status
  const getNodeClasses = () => {
    let classes = selected ? 'selected' : '';
    
    if (isLocked) {
      classes += ' locked-template-element';
    }
    
    if (data.templateId) {
      classes += ` ${data.templateId}-element`;
    }
    
    if (isTimelineDiamond) {
      classes += ' timeline-diamond';
    }
    
    if (isEditing) {
      classes += ' template-text-edit-mode';
    }
    
    return classes;
  };

  return (
    <div 
      ref={nodeRef}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
      className={getNodeClasses()}
      style={getShapeStyle()}
    >
      {isEditing ? (
        <ClickAwayListener onClickAway={handleClickAway}>
          <input
            ref={inputRef}
            value={labelText}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            style={{
              width: '90%',
              height: '80%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: textColor,
              fontSize: data.fontSize ? `${data.fontSize}px` : '16px',
              fontWeight: data.fontWeight || 'normal',
              textAlign: 'center',
              fontFamily: 'inherit'
            }}
          />
        </ClickAwayListener>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              padding: '10px',
              color: textColor,
              fontSize: data.fontSize ? `${data.fontSize}px` : '16px',
              fontWeight: data.fontWeight || 'normal',
              textAlign: 'center',
              userSelect: 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word'
            }}
          >
            {data.label}
          </div>
          
          {/* Show locked indicator tooltip */}
          {showLockedTooltip && (
            <div style={{
              position: 'absolute',
              top: -45,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '4px',
              fontSize: '12px',
              zIndex: 1000,
              whiteSpace: 'nowrap'
            }}>
              Template is locked. Double-click to edit text.
            </div>
          )}
          
          {/* Only show context menu triggers for unlocked elements */}
          {!isLocked && (
            <>
              <div 
                className="node-context-trigger" 
                onClick={(e) => handleOpenMenu(e, 'right')}
                style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: selected ? '#1976d2' : '#ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: selected ? 0.8 : 0,
                  transition: 'opacity 0.2s ease',
                  zIndex: 10
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </div>
              
              <div 
                className="node-context-trigger" 
                onClick={(e) => handleOpenMenu(e, 'bottom')}
                style={{
                  position: 'absolute',
                  bottom: '-10px',
                  left: 'calc(50% - 10px)',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: selected ? '#1976d2' : '#ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: selected ? 0.8 : 0,
                  transition: 'opacity 0.2s ease',
                  zIndex: 10
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="19" r="1" />
                  <circle cx="12" cy="5" r="1" />
                </svg>
              </div>
            </>
          )}
        </>
      )}

      {/* Handle displays - hide for locked templates */}
      {!isLocked && selected && !isEditing && (
        <>
          {/* Background glow effect for selected nodes */}
          {selected && <div style={getBackgroundGlow()} />}
          
          {/* Add button with menu - Right */}
          {(hovered || selected) && (
            <Fade in={true}>
              <Tooltip title="Add connected shape to right" placement="right">
                <IconButton
                  size="small"
                  onClick={(e) => handleOpenMenu(e, 'right')}
                  className="add-node-button"
                  sx={{
                    position: 'absolute',
                    right: '-18px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                    color: color,
                    border: '2px solid',
                    borderColor: color,
                    '&:hover': {
                      backgroundColor: adjustColor(color, 30),
                      transform: 'translateY(-50%) scale(1.1)',
                    },
                    width: '26px',
                    height: '26px',
                    zIndex: 10,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <AddIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
            </Fade>
          )}
          
          {/* Add button with menu - Bottom */}
          {(hovered || selected) && (
            <Fade in={true}>
              <Tooltip title="Add connected shape below" placement="bottom">
                <IconButton
                  size="small"
                  onClick={(e) => handleOpenMenu(e, 'bottom')}
                  className="add-node-button"
                  sx={{
                    position: 'absolute',
                    bottom: '-18px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                    color: color,
                    border: '2px solid',
                    borderColor: color,
                    '&:hover': {
                      backgroundColor: adjustColor(color, 30),
                      transform: 'translateX(-50%) scale(1.1)',
                    },
                    width: '26px',
                    height: '26px',
                    zIndex: 10,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <AddIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </Tooltip>
            </Fade>
          )}
          
          {/* Shape menu */}
          <ShapeMenu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            onSelect={addConnectedShape}
          />
        </>
      )}
      
      {/* Special indicator for locked template nodes */}
      {isLocked && selected && !isEditing && (
        <div style={{
          position: 'absolute',
          top: '-18px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          whiteSpace: 'nowrap',
          zIndex: 1000
        }}>
          Double-click to edit text
        </div>
      )}

      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        style={handleStyle}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={handleStyle}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={handleStyle}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={handleStyle}
      />
    </div>
  );
};

export default ShapeNode; 