import React, { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  Box, 
  TextField, 
  ClickAwayListener,
  Paper,
  Typography,
  Fade,
  useTheme,
  Tooltip
} from '@mui/material';

// Text node with editable content
const TextNode: React.FC<NodeProps> = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.label || 'Text');
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const [showLockedTooltip, setShowLockedTooltip] = useState(false);

  // Determine if this node is part of a locked template
  const isLockedTemplate = data.isLocked === true;
  const templateId = data.templateId || '';

  // Focus the input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text when entering edit mode for better UX
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.select();
        }
      }, 10);
    }
  }, [isEditing]);
  
  // Update local text when data changes from outside
  useEffect(() => {
    if (data.label !== undefined && data.label !== text) {
      setText(data.label);
    }
  }, [data.label]);

  // Handle double click to enter edit mode - even allowed for locked templates
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Always allow text editing, even in locked templates
    setIsEditing(true);
    
    // Focus input after render
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 10);
  };

  // Handle single click to select
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Show tooltip for locked elements
    if (isLockedTemplate && !isEditing) {
      setShowLockedTooltip(true);
      setTimeout(() => setShowLockedTooltip(false), 2000);
    }
  };

  // Handle text change
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newText = event.target.value;
    setText(newText);
    // Also update the node data
    if (data.updateLabel) {
      data.updateLabel(newText);
    } else {
      data.label = newText;
    }
  };

  // Handle click away to save changes
  const handleClickAway = () => {
    setIsEditing(false);
  };

  // Handle key press - save on enter
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      setIsEditing(false);
    }
  };

  // Define the connection handle styles
  const handleStyle = {
    background: '#fff', 
    border: '2px solid',
    borderColor: data.color || theme.palette.primary.main,
    width: 10, 
    height: 10, 
    zIndex: 10,
    opacity: hovered || selected ? 1 : 0,
    transition: 'opacity 0.3s, transform 0.2s',
    transform: hovered || selected ? 'scale(1)' : 'scale(0.8)',
    boxShadow: '0 0 10px rgba(0,0,0,0.15)'
  };

  // Get the right selection style for better visibility
  const getSelectionStyle = () => {
    if (selected) {
      return {
        boxShadow: `0 0 0 2px ${theme.palette.primary.main}, 0 0 0 4px rgba(32, 101, 209, 0.2), 0 12px 24px rgba(0,0,0,0.1)`,
        borderColor: theme.palette.primary.main,
        transform: 'scale(1.02)'
      };
    }
    if (hovered) {
      return {
        boxShadow: '0 12px 24px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05), 0 0 1px rgba(0,0,0,0.1)',
        borderColor: 'rgba(32, 101, 209, 0.3)',
        transform: 'scale(1.02)'
      };
    }
    return {
      boxShadow: '0 2px 12px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.03)',
      borderColor: 'rgba(0, 0, 0, 0.08)',
      transform: 'scale(1)'
    };
  };

  // Get the text node style
  const getNodeStyle = () => {
    // Base style that applies to all text nodes
    const style: React.CSSProperties = {
      padding: '8px 12px',
      fontSize: data.fontSize ? `${data.fontSize}px` : '16px',
      fontWeight: data.fontWeight || 'normal',
      color: data.color || '#2065D1',
      backgroundColor: data.backgroundColor || 'transparent',
      boxSizing: 'border-box',
      borderRadius: '4px',
      width: data.width ? `${data.width}px` : 'auto',
      maxWidth: '300px',
      textAlign: data.textAlign || 'left',
      position: 'relative',
      transition: 'all 0.2s ease',
      userSelect: 'none',
      cursor: isLockedTemplate ? 'default' : 'move',
      border: selected ? '1px dashed rgba(32, 101, 209, 0.5)' : '1px dashed transparent',
    };

    // Special styling for locked templates
    if (isLockedTemplate) {
      style.cursor = 'text'; // Always show text cursor on locked templates to indicate text is editable
    }

    return style;
  };

  // Generate class names based on template and lock status
  const getNodeClasses = () => {
    let classes = selected ? 'selected' : '';
    
    if (isLockedTemplate) {
      classes += ' locked-template-element';
    }
    
    if (templateId) {
      classes += ` ${templateId}-element`;
    }
    
    if (isEditing) {
      classes += ' template-text-edit-mode';
    }
    
    return classes;
  };

  return (
    <Box 
      sx={{ 
        position: 'relative',
        padding: 1.5,
        border: selected ? `2px solid ${theme.palette.primary.main}` : 'none',
        borderRadius: 2,
        minWidth: '120px',
        minHeight: '50px',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hovered && !selected ? 'translateY(-4px)' : 'translateY(0)',
        filter: hovered || selected ? `drop-shadow(0 4px 12px rgba(32, 101, 209, 0.3))` : 'none'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Connection points with improved styling */}
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

      {/* Text content with improved styling */}
      <ClickAwayListener onClickAway={handleClickAway}>
        <Paper 
          elevation={0}
          sx={{
            padding: 2,
            background: data.backgroundColor || 'rgba(255, 255, 255, 0.95)',
            borderRadius: 2,
            transition: 'box-shadow 0.2s ease, background 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
            border: '1px solid',
            backdropFilter: 'blur(8px)',
            overflow: 'visible',
            ...getSelectionStyle(),
            position: 'relative',
            '&:after': selected ? {
              content: '""',
              position: 'absolute',
              inset: -1,
              padding: 1,
              borderRadius: 'inherit',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}30, ${theme.palette.primary.light}30)`,
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              zIndex: 0
            } : {},
            cursor: 'pointer'
          }}
          onClick={() => !isEditing && setIsEditing(true)}
        >
          {isEditing ? (
            <TextField
              inputRef={inputRef}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              variant="outlined"
              size="small"
              fullWidth
              autoFocus
              multiline
              sx={{ 
                '& .MuiOutlinedInput-root': { 
                  fontSize: data.fontSize || 16,
                  fontWeight: data.fontWeight || '500',
                  color: data.color || '#333',
                  lineHeight: 1.5,
                  padding: 1,
                  '& fieldset': {
                    borderColor: `${theme.palette.primary.main}50`
                  },
                  '&:hover fieldset': {
                    borderColor: `${theme.palette.primary.main}70`
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2
                  }
                } 
              }}
            />
          ) : (
            <Fade in timeout={300}>
              <Typography
                onDoubleClick={handleDoubleClick}
                sx={{
                  fontSize: data.fontSize || 16,
                  fontWeight: data.fontWeight || '500',
                  color: data.color || '#333',
                  textAlign: 'center',
                  width: '100%',
                  cursor: 'text',
                  wordBreak: 'break-word',
                  lineHeight: 1.5,
                  letterSpacing: '0.01em',
                  fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif',
                  userSelect: 'text', // Allow text selection
                  position: 'relative',
                  zIndex: 1,
                  padding: '8px',
                  borderRadius: 1,
                  backgroundColor: selected ? `${theme.palette.primary.main}10` : 'transparent',
                  '&:hover': {
                    color: data.color ? data.color : theme.palette.primary.main,
                    backgroundColor: `${theme.palette.primary.main}10`
                  },
                  transition: 'color 0.2s ease, background-color 0.2s ease'
                }}
              >
                {text}
                {(selected || hovered) && (
                  <Box 
                    sx={{
                      position: 'absolute',
                      bottom: -24,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: 11,
                      fontWeight: 500,
                      color: theme.palette.text.secondary,
                      bgcolor: 'rgba(255, 255, 255, 0.95)',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      zIndex: 10
                    }}
                  >
                    Double-click to edit
                  </Box>
                )}
              </Typography>
            </Fade>
          )}
        </Paper>
      </ClickAwayListener>

      {/* Show locked tooltip */}
      {showLockedTooltip && (
        <Tooltip
          title="Template is locked. Double-click to edit text."
          arrow
          placement="top"
        >
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
        </Tooltip>
      )}
    </Box>
  );
};

export default TextNode; 