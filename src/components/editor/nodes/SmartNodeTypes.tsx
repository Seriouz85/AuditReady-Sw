/**
 * 🎨 Smart Node Types - Beautiful Professional Nodes
 * Enterprise-grade node components with stunning designs
 */

import React from 'react';
import { Handle, Position } from 'reactflow';
import GanttChartNode from './GanttChartNode';

// Beautiful Process Node - handles different shapes including Gantt
export const ProcessNode = ({ data, selected }: any) => {
  const shape = data.shape || 'rectangle';
  
  // Handle Gantt chart nodes
  if (shape === 'gantt-task' || shape === 'gantt-milestone' || shape === 'gantt-summary') {
    return <GanttChartNode data={data} selected={selected} />;
  }
  
  // Base styles
  const baseClasses = `transition-all duration-200 min-w-[120px] ${
    selected 
      ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-400 shadow-lg text-white' 
      : 'bg-white border-gray-300 shadow-sm hover:shadow-md hover:border-blue-300'
  }`;
  
  // Shape-specific styles
  const shapeClasses = {
    rectangle: 'px-6 py-4 rounded-lg border-2',
    circle: 'w-20 h-20 rounded-full border-2 flex items-center justify-center p-2',
    diamond: 'w-20 h-20 border-2 transform rotate-45 flex items-center justify-center',
    hexagon: 'px-6 py-4 bg-clip-path-hexagon border-2 rounded-md',
    parallelogram: 'px-6 py-4 transform skew-x-12 border-2 rounded-md'
  };
  
  const contentClasses = shape === 'diamond' ? 'transform -rotate-45' : 
                        shape === 'parallelogram' ? 'transform -skew-x-12' : '';
  
  return (
    <div className={`${baseClasses} ${shapeClasses[shape as keyof typeof shapeClasses] || shapeClasses.rectangle}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className={`text-center ${contentClasses}`}>
        <div className="text-sm font-semibold">{data.label}</div>
        {data.description && (shape === 'rectangle' || shape === 'hexagon') && (
          <div className="text-xs opacity-80 mt-1">{data.description}</div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
      
      {/* Additional handles for diamond shapes */}
      {shape === 'diamond' && (
        <>
          <Handle type="source" position={Position.Left} className="w-3 h-3" />
          <Handle type="source" position={Position.Right} className="w-3 h-3" />
        </>
      )}
    </div>
  );
};

// Beautiful Decision Node
export const DecisionNode = ({ data, selected }: any) => (
  <div 
    className={`relative w-24 h-24 transform rotate-45 transition-all duration-200 ${
      selected 
        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg' 
        : 'bg-gradient-to-br from-yellow-100 to-yellow-200 shadow-sm hover:shadow-md'
    }`}
  >
    <Handle type="target" position={Position.Top} className="w-3 h-3 -rotate-45" style={{top: -6}} />
    <div className="absolute inset-0 flex items-center justify-center -rotate-45">
      <div className="text-xs font-semibold text-center px-2">
        {data.label}
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 -rotate-45" style={{bottom: -6}} />
    <Handle type="source" position={Position.Left} className="w-3 h-3 -rotate-45" style={{left: -6}} />
    <Handle type="source" position={Position.Right} className="w-3 h-3 -rotate-45" style={{right: -6}} />
  </div>
);

// Beautiful Start/End Node  
export const StartEndNode = ({ data, selected }: any) => (
  <div 
    className={`px-8 py-3 rounded-full border-2 transition-all duration-200 ${
      selected 
        ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-400 shadow-lg text-white' 
        : 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-300 shadow-sm hover:shadow-md'
    }`}
  >
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <div className="text-sm font-semibold text-center">{data.label}</div>
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
);

// Universal Custom Node - handles all shapes including Gantt
export const CustomNode = ({ data, selected }: any) => {
  const shape = data.shape || 'rectangle';
  
  // Route to specialized nodes
  if (shape === 'gantt-task' || shape === 'gantt-milestone' || shape === 'gantt-summary') {
    return <GanttChartNode data={data} selected={selected} />;
  }
  
  // Route to other specialized nodes
  if (shape === 'diamond') {
    return <DecisionNode data={data} selected={selected} />;
  }
  
  if (shape === 'circle' && (data.label?.toLowerCase().includes('start') || data.label?.toLowerCase().includes('end'))) {
    return <StartEndNode data={data} selected={selected} />;
  }
  
  // Default to ProcessNode for all other shapes
  return <ProcessNode data={data} selected={selected} />;
};

const SmartNodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
  startEnd: StartEndNode,
  custom: CustomNode,
  gantt: GanttChartNode,
  default: CustomNode
};

export default SmartNodeTypes;