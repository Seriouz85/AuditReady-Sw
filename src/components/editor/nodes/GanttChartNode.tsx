/**
 * 📊 Gantt Chart Node Component
 * Specialized ReactFlow node for displaying Gantt chart tasks and milestones
 */

import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Flag, Diamond, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface GanttNodeData {
  label: string;
  shape: 'gantt-task' | 'gantt-milestone' | 'gantt-summary';
  startDate: Date;
  endDate: Date;
  duration: number;
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  fillColor: string;
  strokeColor: string;
  textColor: string;
  onLabelChange: (newLabel: string) => void;
  onUpdate: (updates: any) => void;
}

const GanttChartNode: React.FC<NodeProps<GanttNodeData>> = ({ data, selected }) => {
  const {
    label,
    shape,
    startDate,
    endDate,
    duration,
    progress,
    priority,
    assignee,
    fillColor,
    strokeColor,
    textColor
  } = data;

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Not set';
    
    // Convert string to Date if needed
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if it's a valid date
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (days: number) => {
    if (days <= 1) return `${days}d`;
    if (days <= 7) return `${days}d`;
    const weeks = Math.ceil(days / 7);
    return `${weeks}w`;
  };

  const getPriorityIcon = () => {
    switch (priority) {
      case 'critical':
        return <Flag className="w-3 h-3 text-red-600" />;
      case 'high':
        return <Flag className="w-3 h-3 text-orange-500" />;
      case 'medium':
        return <Flag className="w-3 h-3 text-blue-500" />;
      case 'low':
        return <Flag className="w-3 h-3 text-green-500" />;
      default:
        return null;
    }
  };

  const getProgressColor = () => {
    if (progress >= 100) return '#10b981'; // green
    if (progress >= 75) return '#3b82f6'; // blue
    if (progress >= 50) return '#f59e0b'; // amber
    if (progress >= 25) return '#ef4444'; // red
    return '#6b7280'; // gray
  };

  // Milestone node
  if (shape === 'gantt-milestone') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        className="relative"
      >
        <Handle type="target" position={Position.Left} className="w-2 h-2" />
        <Handle type="source" position={Position.Right} className="w-2 h-2" />
        
        {/* Diamond shape for milestone */}
        <div
          className={`w-8 h-8 transform rotate-45 border-2 ${
            selected ? 'ring-2 ring-blue-400 ring-offset-1' : ''
          } transition-all duration-200 shadow-sm`}
          style={{
            backgroundColor: fillColor,
            borderColor: strokeColor
          }}
        />
        
        {/* Milestone icon */}
        <div className="absolute inset-0 flex items-center justify-center -rotate-45">
          <Diamond className="w-4 h-4" style={{ color: textColor }} />
        </div>
        
        {/* Milestone details tooltip */}
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border p-2 opacity-0 hover:opacity-100 transition-opacity z-10 min-w-48">
          <div className="text-sm font-semibold text-gray-900 mb-1">{label}</div>
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(startDate)}</span>
            {getPriorityIcon()}
          </div>
          {assignee && (
            <div className="flex items-center space-x-1 mt-1">
              <User className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-600">{assignee}</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Task node (default)
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      className="relative min-w-40"
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2" />
      <Handle type="source" position={Position.Right} className="w-2 h-2" />
      
      {/* Task container */}
      <div
        className={`rounded-lg border-2 p-3 bg-white shadow-sm hover:shadow-md transition-all duration-200 ${
          selected ? 'ring-2 ring-blue-400 ring-offset-1' : ''
        }`}
        style={{
          borderColor: strokeColor,
          minHeight: shape === 'gantt-summary' ? '80px' : '60px'
        }}
      >
        {/* Task header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 
              className="text-sm font-semibold leading-tight"
              style={{ color: textColor }}
            >
              {label}
            </h4>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="text-xs px-1 py-0">
                {formatDuration(duration)}
              </Badge>
              {getPriorityIcon()}
            </div>
          </div>
          {progress === 100 && (
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>{progress}% complete</span>
            <span className="text-gray-500">
              {formatDate(startDate)} - {formatDate(endDate)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-2 rounded-full transition-all duration-300"
              style={{ backgroundColor: getProgressColor() }}
            />
          </div>
        </div>

        {/* Task details */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="w-3 h-3" />
            <span>{formatDate(startDate)}</span>
          </div>
          {assignee && (
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3 text-gray-500" />
              <span className="text-gray-600 truncate max-w-20">{assignee}</span>
            </div>
          )}
        </div>

        {/* Summary task indicator */}
        {shape === 'gantt-summary' && (
          <div
            className="absolute top-0 left-0 w-1 h-full rounded-l-lg"
            style={{ backgroundColor: fillColor }}
          />
        )}
      </div>

      {/* Task dependencies indicator */}
      <Handle
        type="target"
        position={Position.Top}
        id="dependency"
        className="w-2 h-2 bg-blue-500 opacity-0 hover:opacity-100"
        style={{ top: -5 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="dependency"
        className="w-2 h-2 bg-blue-500 opacity-0 hover:opacity-100"
        style={{ bottom: -5 }}
      />
    </motion.div>
  );
};

export default GanttChartNode;