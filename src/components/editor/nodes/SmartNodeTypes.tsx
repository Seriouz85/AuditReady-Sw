/**
 * 🎨 Smart Node Types - Beautiful Professional Nodes
 * Enterprise-grade node components with stunning designs
 */

import React from 'react';
import { Handle, Position } from 'reactflow';
import GanttChartNode from './GanttChartNode';
import {
  Play, Pause, Server, Database, Cloud, User, Users, BarChart3, 
  PieChart, Diamond, Circle, Square, Box
} from 'lucide-react';

// Beautiful Process Node - handles different shapes including Gantt
export const ProcessNode = ({ data, selected }: any) => {
  const shape = data.shape || 'rectangle';
  
  // Handle Gantt chart nodes
  if (shape === 'gantt-task' || shape === 'gantt-milestone' || shape === 'gantt-summary') {
    return <GanttChartNode data={data} selected={selected} />;
  }
  
  // For diamond shapes, use the dedicated DecisionNode component
  if (shape === 'diamond') {
    return <DecisionNode data={data} selected={selected} />;
  }
  
  // Beautiful shape styles matching the panel - with professional gradients and shadows
  const getShapeStyles = (shape: string, selected: boolean): React.CSSProperties => {
    const baseStyles = {
      transition: 'all 0.2s ease',
      position: 'relative' as const,
      zIndex: 10,
      fontWeight: '500' as const
    };

    switch (shape) {
      case 'rectangle':
        return {
          ...baseStyles,
          background: selected ? 
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: '2px solid rgba(102, 126, 234, 0.3)',
          borderRadius: '8px',
          color: 'white',
          padding: '12px 20px',
          boxShadow: selected ? 
            '0 8px 25px rgba(102, 126, 234, 0.4)' : 
            '0 4px 20px rgba(102, 126, 234, 0.25)',
          minWidth: '120px'
        };
      
      case 'circle':
        return {
          ...baseStyles,
          background: selected ?
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' :
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          border: 'none', // Remove border to avoid double circles
          borderRadius: '50%',
          color: 'white',
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: selected ?
            '0 8px 25px rgba(240, 147, 251, 0.4)' :
            '0 4px 20px rgba(240, 147, 251, 0.25)'
        };
      
      case 'hexagon':
        return {
          ...baseStyles,
          background: selected ?
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' :
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          border: '2px solid rgba(168, 237, 234, 0.3)',
          borderRadius: '8px',
          color: '#1f2937',
          padding: '12px 20px',
          boxShadow: selected ?
            '0 8px 25px rgba(168, 237, 234, 0.4)' :
            '0 4px 20px rgba(168, 237, 234, 0.25)',
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 50%, 80% 100%, 20% 100%, 0% 50%)'
        };
      
      case 'parallelogram':
        return {
          ...baseStyles,
          background: selected ?
            'linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%)' :
            'linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%)',
          border: '2px solid rgba(253, 187, 45, 0.3)',
          borderRadius: '8px',
          color: 'white',
          padding: '12px 20px',
          boxShadow: selected ?
            '0 8px 25px rgba(253, 187, 45, 0.4)' :
            '0 4px 20px rgba(253, 187, 45, 0.25)',
          transform: 'skewX(-12deg)'
        };
      
      case 'cloud':
        return {
          ...baseStyles,
          background: selected ?
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' :
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          border: '3px solid rgba(79, 172, 254, 0.4)',
          borderRadius: '50px',
          color: 'white',
          padding: '16px 32px',
          boxShadow: selected ?
            '0 10px 40px rgba(79, 172, 254, 0.4)' :
            '0 8px 30px rgba(79, 172, 254, 0.3)'
        };
      
      case 'database':
        return {
          ...baseStyles,
          background: selected ?
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' :
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          border: '2px solid rgba(240, 147, 251, 0.3)',
          borderRadius: '20px 20px 40px 40px',
          color: 'white',
          padding: '16px 20px',
          boxShadow: selected ?
            '0 8px 30px rgba(240, 147, 251, 0.4)' :
            '0 6px 25px rgba(240, 147, 251, 0.3)',
          minHeight: '60px'
        };
      
      case 'server':
        return {
          ...baseStyles,
          background: selected ?
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: '3px solid rgba(102, 126, 234, 0.4)',
          borderRadius: '16px',
          color: 'white',
          padding: '20px',
          boxShadow: selected ?
            '0 10px 35px rgba(102, 126, 234, 0.4)' :
            '0 8px 30px rgba(102, 126, 234, 0.35)',
          minHeight: '80px'
        };
      
      case 'user':
        return {
          ...baseStyles,
          background: selected ?
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' :
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          border: '2px solid rgba(168, 237, 234, 0.4)',
          borderRadius: '50% 50% 20px 20px',
          color: '#2d3748',
          padding: '20px 16px 12px',
          boxShadow: selected ?
            '0 8px 30px rgba(168, 237, 234, 0.4)' :
            '0 6px 25px rgba(168, 237, 234, 0.3)',
          minWidth: '60px'
        };
      
      case 'team':
        return {
          ...baseStyles,
          background: selected ?
            'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' :
            'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
          border: '3px solid rgba(255, 236, 210, 0.5)',
          borderRadius: '20px',
          color: '#744210',
          padding: '18px 24px',
          boxShadow: selected ?
            '0 10px 35px rgba(252, 182, 159, 0.4)' :
            '0 8px 30px rgba(252, 182, 159, 0.3)'
        };
        
      default:
        return {
          ...baseStyles,
          background: selected ?
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: '2px solid rgba(102, 126, 234, 0.3)',
          borderRadius: '8px',
          color: 'white',
          padding: '12px 20px',
          boxShadow: selected ?
            '0 8px 25px rgba(102, 126, 234, 0.4)' :
            '0 4px 20px rgba(102, 126, 234, 0.25)',
          minWidth: '120px'
        };
    }
  };

  // Apply custom styles from data if provided
  const customStyles = getShapeStyles(shape, selected);
  const hasCustomStyle = data.fillColor || data.strokeColor || data.textColor;
  
  if (hasCustomStyle) {
    if (data.fillColor) {
      if (data.fillColor.includes('gradient')) {
        customStyles.background = data.fillColor;
      } else {
        customStyles.background = data.fillColor;
      }
    }
    if (data.strokeColor) {
      customStyles.borderColor = data.strokeColor;
    }
    if (data.textColor) {
      customStyles.color = data.textColor;
    }
  }
  
  const contentClasses = shape === 'parallelogram' ? 'transform -skew-x-12' : '';
  
  return (
    <div 
      style={customStyles}
      className="hover:scale-105"
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" style={{ zIndex: 15 }} />
      <div 
        className={`text-center ${contentClasses}`}
        style={{
          zIndex: 20, // Ensure text stays above everything
          position: 'relative',
          textShadow: shape === 'circle' ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'
        }}
      >
        <div className="text-sm font-semibold leading-tight">{data.label}</div>
        {data.description && (
          <div 
            className={`text-xs opacity-90 mt-1 leading-tight ${
              shape === 'circle' ? 'line-clamp-2' : ''
            }`} 
            title={data.description}
            style={{
              textShadow: 'inherit'
            }}
          >
            {data.description}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" style={{ zIndex: 15 }} />
    </div>
  );
};

// Beautiful Decision Node - True Diamond Shape using SVG
export const DecisionNode = ({ data, selected }: any) => {
  const size = 120; // Increased size for better text readability
  const hasCustomStyle = data.fillColor || data.strokeColor || data.textColor;
  
  // Apply custom styles with beautiful gradients from panel
  let fillColor = selected ? '#4facfe' : '#4facfe'; // Beautiful blue gradient like panel
  let strokeColor = '#00f2fe';
  let textColor = '#ffffff';
  
  if (hasCustomStyle) {
    if (data.fillColor) {
      fillColor = data.fillColor.includes('gradient') ? '#4facfe' : data.fillColor;
    }
    if (data.strokeColor) {
      strokeColor = data.strokeColor;
    }
    if (data.textColor) {
      textColor = data.textColor;
    }
  }
  
  return (
    <div 
      className="relative transition-all duration-200"
      style={{ width: size, height: size }}
    >
      {/* Handles positioned at diamond edges */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3" 
        style={{ top: -6, left: '50%', transform: 'translateX(-50%)', zIndex: 15 }} 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3" 
        style={{ bottom: -6, left: '50%', transform: 'translateX(-50%)', zIndex: 15 }} 
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        className="w-3 h-3" 
        style={{ left: -6, top: '50%', transform: 'translateY(-50%)', zIndex: 15 }} 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3" 
        style={{ right: -6, top: '50%', transform: 'translateY(-50%)', zIndex: 15 }} 
      />
      
      {/* True Diamond Shape using SVG - matching panel styling */}
      <svg width={size} height={size} className="absolute inset-0" style={{ zIndex: 10 }}>
        <defs>
          <linearGradient id={`diamond-gradient-${data.id || 'default'}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4facfe" />
            <stop offset="100%" stopColor="#00f2fe" />
          </linearGradient>
          <filter id={`diamond-shadow-${data.id || 'default'}`}>
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.25" />
          </filter>
        </defs>
        <path
          d={`M ${size/2} 12 L ${size-12} ${size/2} L ${size/2} ${size-12} L 12 ${size/2} Z`}
          fill={hasCustomStyle && data.fillColor && !data.fillColor.includes('gradient') 
            ? fillColor 
            : `url(#diamond-gradient-${data.id || 'default'})`}
          stroke="none"
          filter={`url(#diamond-shadow-${data.id || 'default'})`}
          className={selected ? 'drop-shadow-lg' : 'drop-shadow-md hover:drop-shadow-lg'}
        />
      </svg>
      
      {/* Text Content - PERFECTLY centered in diamond */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ 
          zIndex: 30, // Highest z-index to ensure text is always visible
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        <div 
          className="text-center flex flex-col items-center justify-center"
          style={{
            color: textColor,
            maxWidth: '70px', // Limit width to fit inside diamond
            wordBreak: 'break-word',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)' // Dark shadow for white text on blue background
          }}
        >
          <div className="text-xs font-semibold leading-none mb-1" style={{ fontSize: '11px' }}>
            {data.label}
          </div>
          {data.description && (
            <div 
              className="text-[10px] opacity-90 leading-none" 
              title={data.description}
              style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textShadow: 'inherit',
                lineHeight: '1.1'
              }}
            >
              {data.description.length > 20 ? data.description.substring(0, 20) + '...' : data.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Beautiful Shape Node with Icons - Shows icons like in preview with text UNDER
export const BeautifulShapeNode = ({ data, selected }: any) => {
  const { shape = 'rectangle', label = 'Label', description, nodeType } = data;
  
  // Map shapes to their icons and styles
  const getShapeConfig = (shapeType: string) => {
    const configs = {
      // Basic shapes
      'circle': { 
        icon: Circle, 
        style: { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '50%' },
        iconColor: 'white'
      },
      'diamond': { 
        icon: Diamond, 
        style: { 
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
        },
        iconColor: 'white'
      },
      'rectangle': { 
        icon: Square, 
        style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px' },
        iconColor: 'white'
      },
      
      // Network & IT
      'server': { 
        icon: Server, 
        style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px' },
        iconColor: 'white'
      },
      'database': { 
        icon: Database, 
        style: { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '20px 20px 40px 40px' },
        iconColor: 'white'
      },
      'cloud': { 
        icon: Cloud, 
        style: { background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '50px' },
        iconColor: 'white'
      },
      
      // Business Elements  
      'user': { 
        icon: User, 
        style: { background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', borderRadius: '50% 50% 20px 20px' },
        iconColor: '#2d3748'
      },
      'team': { 
        icon: Users, 
        style: { background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', borderRadius: '20px' },
        iconColor: '#744210'
      },
      
      // Data & Analytics
      'chart-bar': { 
        icon: BarChart3, 
        style: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px' },
        iconColor: 'white'
      },
      'chart-pie': { 
        icon: PieChart, 
        style: { 
          background: 'conic-gradient(from 0deg, #667eea 0deg 120deg, #764ba2 120deg 240deg, #f093fb 240deg 360deg)', 
          borderRadius: '50%' 
        },
        iconColor: 'white'
      },
      
      // Flow elements
      'process': { 
        icon: Box, 
        style: { background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', borderRadius: '12px' },
        iconColor: '#2d3748'
      },
      'start-end': { 
        icon: Play, 
        style: { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '50px' },
        iconColor: 'white'
      }
    };
    
    return configs[shapeType] || configs['rectangle'];
  };
  
  const config = getShapeConfig(nodeType || shape);
  const Icon = config.icon;
  
  // Container style with proper dimensions
  const containerStyle = {
    ...config.style,
    width: shape === 'circle' || shape === 'chart-pie' ? '100px' : 
           shape === 'diamond' ? '100px' : '140px',
    height: '120px', // Increased height to fit icon + text under
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '12px',
    boxShadow: selected ? 
      '0 8px 25px rgba(0,0,0,0.3)' : '0 4px 15px rgba(0,0,0,0.15)',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
    overflow: 'hidden'
  };
  
  return (
    <div style={containerStyle} className="hover:scale-105">
      <Handle type="target" position={Position.Top} className="w-3 h-3" style={{ zIndex: 15 }} />
      
      {/* Icon Section - Only for complex shapes, not basic shapes */}
      {!['rectangle', 'circle', 'diamond'].includes(nodeType || shape) && (
        <div className="flex-1 flex items-center justify-center">
          <Icon 
            className="drop-shadow-sm" 
            style={{ 
              width: '32px', 
              height: '32px',
              color: config.iconColor,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }} 
          />
        </div>
      )}
      
      {/* Text Section - Centered when no icon, bottom when icon exists */}
      <div 
        className={`text-center ${
          ['rectangle', 'circle', 'diamond'].includes(nodeType || shape) 
            ? 'flex-1 flex flex-col items-center justify-center' 
            : ''
        }`}
        style={{ 
          color: config.iconColor,
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          maxWidth: '100%'
        }}
      >
        <div className="text-sm font-semibold leading-tight mb-2" style={{ fontSize: '13px' }}>
          {label}
        </div>
        {description && (
          <div 
            className="text-xs opacity-90 leading-tight" 
            title={description}
            style={{ 
              fontSize: '11px', 
              maxHeight: ['rectangle', 'circle', 'diamond'].includes(nodeType || shape) ? '40px' : '24px',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: ['rectangle', 'circle', 'diamond'].includes(nodeType || shape) ? 3 : 2,
              WebkitBoxOrient: 'vertical' as const
            }}
          >
            {['rectangle', 'circle', 'diamond'].includes(nodeType || shape) && description.length > 60 ? 
              description.substring(0, 60) + '...' : 
              description.length > 25 ? description.substring(0, 25) + '...' : description}
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" style={{ zIndex: 15 }} />
    </div>
  );
};

// Beautiful Start/End Node  
export const StartEndNode = ({ data, selected }: any) => {
  const styles: React.CSSProperties = {
    background: selected 
      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    border: '2px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '50px',
    color: 'white',
    padding: '12px 32px',
    fontWeight: '500',
    boxShadow: selected 
      ? '0 8px 25px rgba(16, 185, 129, 0.4)' 
      : '0 4px 20px rgba(16, 185, 129, 0.25)',
    transition: 'all 0.2s ease',
    position: 'relative' as const,
    zIndex: 10
  };

  return (
    <div 
      style={styles}
      className="hover:scale-105"
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" style={{ zIndex: 15 }} />
      <div className="text-sm font-semibold text-center">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" style={{ zIndex: 15 }} />
    </div>
  );
};

// Universal Custom Node - handles all shapes including Gantt
export const CustomNode = ({ data, selected }: any) => {
  const shape = data.shape || 'rectangle';
  const nodeType = data.nodeType || shape;
  
  // Route to specialized nodes
  if (shape === 'gantt-task' || shape === 'gantt-milestone' || shape === 'gantt-summary') {
    return <GanttChartNode data={data} selected={selected} />;
  }
  
  // Beautiful shapes from the Beautiful Node Palette - use BeautifulShapeNode
  const beautifulShapes = [
    'circle', 'diamond', 'rectangle', 'server', 'database', 'cloud', 
    'user', 'team', 'chart-bar', 'chart-pie', 'process', 'start-end'
  ];
  
  if (beautifulShapes.includes(nodeType) || data.customStyle) {
    return <BeautifulShapeNode data={data} selected={selected} />;
  }
  
  // Legacy diamond handling
  if (shape === 'diamond') {
    return <BeautifulShapeNode data={data} selected={selected} />;
  }
  
  if (shape === 'circle' && (data.label?.toLowerCase().includes('start') || data.label?.toLowerCase().includes('end'))) {
    return <StartEndNode data={data} selected={selected} />;
  }
  
  // Default to ProcessNode for basic shapes
  return <ProcessNode data={data} selected={selected} />;
};

const SmartNodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
  beautiful: BeautifulShapeNode,
  startEnd: StartEndNode,
  custom: CustomNode,
  gantt: GanttChartNode,
  default: CustomNode
};

export default SmartNodeTypes;