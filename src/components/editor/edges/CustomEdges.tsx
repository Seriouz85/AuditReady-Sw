/**
 * Custom Edge Types - NO BACKGROUND LABELS for clean export
 */

import React from 'react';
import { BaseEdge, getStraightPath, getSmoothStepPath, EdgeProps } from 'reactflow';

// Custom Step Edge with NO label background
export const CustomStepEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  label
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0,
  });

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          stroke: '#94a3b8',
          strokeWidth: 2,
          ...style
        }} 
      />
      {/* Professional edge label - works on any background */}
      {label && (
        <g>
          {/* Strong white outline for visibility on any background */}
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="central"
            style={{
              fill: 'none',
              stroke: '#ffffff',
              strokeWidth: '4px',
              strokeLinejoin: 'round',
              strokeLinecap: 'round',
              fontSize: '12px',
              fontWeight: '700',
              pointerEvents: 'none'
            }}
          >
            {label}
          </text>
          {/* Main dark text */}
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="central"
            className="react-flow__edge-text-clean"
            style={{
              fill: '#1f2937',
              fontSize: '12px',
              fontWeight: '700',
              pointerEvents: 'none'
            }}
          >
            {label}
          </text>
        </g>
      )}
    </>
  );
};

// Edge types object
export const customEdgeTypes = {
  'step': CustomStepEdge,
  'step-clean': CustomStepEdge,
  'default': CustomStepEdge
};