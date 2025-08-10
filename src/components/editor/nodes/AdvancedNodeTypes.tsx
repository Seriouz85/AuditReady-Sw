/**
 * Advanced Node Types for Professional Diagramming
 * Includes BPMN, Gantt, Swimlane, Timeline, and other specialized nodes
 */

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

// BPMN Node Types
export const BPMNStartEvent = memo(({ data, selected }: NodeProps) => (
  <div 
    className={`relative bg-white border-2 rounded-full w-12 h-12 flex items-center justify-center ${
      selected ? 'border-blue-500 shadow-lg' : 'border-green-500'
    }`}
  >
    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
      <span className="text-white text-xs font-bold">S</span>
    </div>
    <Handle type="source" position={Position.Right} className="w-3 h-3" />
    {data.label && (
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap">
        {data.label}
      </div>
    )}
  </div>
));

export const BPMNEndEvent = memo(({ data, selected }: NodeProps) => (
  <div 
    className={`relative bg-white border-4 rounded-full w-12 h-12 flex items-center justify-center ${
      selected ? 'border-blue-500 shadow-lg' : 'border-red-500'
    }`}
  >
    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
      <span className="text-white text-xs font-bold">E</span>
    </div>
    <Handle type="target" position={Position.Left} className="w-3 h-3" />
    {data.label && (
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap">
        {data.label}
      </div>
    )}
  </div>
));

export const BPMNTask = memo(({ data, selected }: NodeProps) => (
  <div 
    className={`relative bg-white border-2 rounded-lg p-4 min-w-32 min-h-16 flex items-center justify-center ${
      selected ? 'border-blue-500 shadow-lg' : 'border-gray-400'
    }`}
  >
    <div className="text-center">
      <div className="text-sm font-medium">{data.label || 'Task'}</div>
      {data.assignee && (
        <div className="text-xs text-gray-500 mt-1">{data.assignee}</div>
      )}
    </div>
    <Handle type="target" position={Position.Left} className="w-3 h-3" />
    <Handle type="source" position={Position.Right} className="w-3 h-3" />
    {data.type === 'user' && (
      <div className="absolute top-1 left-1 w-4 h-4 bg-blue-100 rounded border border-blue-400">
        <span className="text-blue-600 text-xs">👤</span>
      </div>
    )}
    {data.type === 'service' && (
      <div className="absolute top-1 left-1 w-4 h-4 bg-purple-100 rounded border border-purple-400">
        <span className="text-purple-600 text-xs">⚙️</span>
      </div>
    )}
  </div>
));

export const BPMNGateway = memo(({ data, selected }: NodeProps) => (
  <div 
    className={`relative bg-yellow-100 border-2 transform rotate-45 w-12 h-12 ${
      selected ? 'border-blue-500 shadow-lg' : 'border-yellow-500'
    }`}
  >
    <div className="absolute inset-0 transform -rotate-45 flex items-center justify-center">
      <span className="text-yellow-700 text-lg font-bold">
        {data.gatewayType === 'exclusive' ? '×' : data.gatewayType === 'parallel' ? '+' : '◇'}
      </span>
    </div>
    <Handle type="target" position={Position.Left} className="w-3 h-3 transform -translate-x-2" />
    <Handle type="source" position={Position.Right} className="w-3 h-3 transform translate-x-2" />
    <Handle type="source" position={Position.Top} className="w-3 h-3 transform -translate-y-2" />
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 transform translate-y-2" />
    {data.label && (
      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 -rotate-45 text-xs whitespace-nowrap">
        {data.label}
      </div>
    )}
  </div>
));

// Swimlane Components
export const SwimlaneHeader = memo(({ data, selected }: NodeProps) => (
  <div 
    className={`relative bg-blue-50 border-2 border-blue-300 p-3 min-w-48 min-h-16 ${
      selected ? 'border-blue-500 shadow-lg' : ''
    }`}
  >
    <div className="text-center">
      <div className="font-semibold text-blue-800">{data.label || 'Lane'}</div>
      {data.role && (
        <div className="text-sm text-blue-600">{data.role}</div>
      )}
    </div>
  </div>
));

export const SwimlaneActivity = memo(({ data, selected }: NodeProps) => (
  <div 
    className={`relative bg-white border-2 border-dashed border-gray-400 p-3 min-w-32 min-h-20 ${
      selected ? 'border-blue-500 shadow-lg' : ''
    }`}
  >
    <div className="text-center">
      <div className="text-sm font-medium">{data.label || 'Activity'}</div>
      {data.duration && (
        <div className="text-xs text-gray-500 mt-1">{data.duration}</div>
      )}
      {data.status && (
        <div className={`text-xs mt-1 px-2 py-1 rounded ${
          data.status === 'completed' ? 'bg-green-100 text-green-800' :
          data.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {data.status}
        </div>
      )}
    </div>
    <Handle type="target" position={Position.Left} className="w-3 h-3" />
    <Handle type="source" position={Position.Right} className="w-3 h-3" />
  </div>
));

// Timeline Components
export const TimelineEvent = memo(({ data, selected }: NodeProps) => (
  <div className="relative">
    <div 
      className={`bg-white border-2 rounded-lg p-3 min-w-40 ${
        selected ? 'border-blue-500 shadow-lg' : 'border-gray-300'
      }`}
    >
      <div className="text-sm font-semibold">{data.label || 'Event'}</div>
      {data.date && (
        <div className="text-xs text-gray-500 mt-1">{data.date}</div>
      )}
      {data.description && (
        <div className="text-xs text-gray-700 mt-2">{data.description}</div>
      )}
    </div>
    {/* Timeline connector dot */}
    <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow"></div>
    <Handle type="target" position={Position.Left} className="w-3 h-3 opacity-0" />
    <Handle type="source" position={Position.Right} className="w-3 h-3 opacity-0" />
  </div>
));

export const TimelineMilestone = memo(({ data, selected }: NodeProps) => (
  <div className="relative">
    <div 
      className={`bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3 min-w-40 ${
        selected ? 'border-blue-500 shadow-lg' : ''
      }`}
    >
      <div className="text-sm font-bold text-yellow-800">🏁 {data.label || 'Milestone'}</div>
      {data.date && (
        <div className="text-xs text-yellow-600 mt-1">{data.date}</div>
      )}
      {data.criteria && (
        <div className="text-xs text-yellow-700 mt-2">{data.criteria}</div>
      )}
    </div>
    {/* Milestone diamond */}
    <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 rotate-45 w-3 h-3 bg-yellow-500 border-2 border-white shadow"></div>
    <Handle type="target" position={Position.Left} className="w-3 h-3 opacity-0" />
    <Handle type="source" position={Position.Right} className="w-3 h-3 opacity-0" />
  </div>
));

// Gantt Chart Components
export const GanttTask = memo(({ data, selected }: NodeProps) => (
  <div className="relative">
    <div 
      className={`bg-blue-100 border-2 border-blue-400 p-2 min-w-48 min-h-12 ${
        selected ? 'border-blue-600 shadow-lg' : ''
      }`}
      style={{ 
        width: `${(data.duration || 1) * 20}px`,
        background: `linear-gradient(to right, ${data.fillColor || '#dbeafe'} ${data.progress || 0}%, #f3f4f6 ${data.progress || 0}%)`
      }}
    >
      <div className="text-xs font-medium">{data.label || 'Task'}</div>
      <div className="text-xs text-gray-600">
        {data.startDate} - {data.endDate}
      </div>
      {data.progress && (
        <div className="text-xs text-blue-700 font-semibold">
          {data.progress}%
        </div>
      )}
    </div>
    <Handle type="target" position={Position.Left} className="w-3 h-3" />
    <Handle type="source" position={Position.Right} className="w-3 h-3" />
  </div>
));

export const GanttMilestone = memo(({ data, selected }: NodeProps) => (
  <div className="relative">
    <div 
      className={`transform rotate-45 w-6 h-6 border-2 ${
        selected ? 'bg-blue-500 border-blue-600 shadow-lg' : 'bg-yellow-400 border-yellow-500'
      }`}
    >
    </div>
    {data.label && (
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap">
        {data.label}
      </div>
    )}
    <Handle type="target" position={Position.Left} className="w-3 h-3 opacity-0" />
  </div>
));

// Network Diagram Components
export const NetworkDevice = memo(({ data, selected }: NodeProps) => (
  <div 
    className={`relative bg-white border-2 rounded-lg p-4 min-w-32 min-h-24 ${
      selected ? 'border-blue-500 shadow-lg' : 'border-gray-400'
    }`}
  >
    <div className="text-center">
      <div className="text-2xl mb-2">
        {data.deviceType === 'router' ? '📡' :
         data.deviceType === 'switch' ? '🔀' :
         data.deviceType === 'firewall' ? '🛡️' :
         data.deviceType === 'server' ? '🖥️' : '💻'}
      </div>
      <div className="text-sm font-medium">{data.label || 'Device'}</div>
      {data.ip && (
        <div className="text-xs text-gray-500 mt-1">{data.ip}</div>
      )}
      {data.status && (
        <div className={`text-xs mt-1 px-1 rounded ${
          data.status === 'online' ? 'bg-green-100 text-green-800' :
          data.status === 'offline' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {data.status}
        </div>
      )}
    </div>
    <Handle type="target" position={Position.Left} className="w-3 h-3" />
    <Handle type="source" position={Position.Right} className="w-3 h-3" />
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
));

// Mind Map Components
export const MindMapCentralNode = memo(({ data, selected }: NodeProps) => (
  <div 
    className={`relative bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-full p-6 min-w-32 min-h-32 flex items-center justify-center ${
      selected ? 'shadow-2xl transform scale-110' : 'shadow-lg'
    }`}
  >
    <div className="text-center">
      <div className="font-bold text-lg">{data.label || 'Central Topic'}</div>
    </div>
    <Handle type="source" position={Position.Top} className="w-4 h-4 bg-blue-500" />
    <Handle type="source" position={Position.Right} className="w-4 h-4 bg-blue-500" />
    <Handle type="source" position={Position.Bottom} className="w-4 h-4 bg-blue-500" />
    <Handle type="source" position={Position.Left} className="w-4 h-4 bg-blue-500" />
  </div>
));

export const MindMapBranchNode = memo(({ data, selected }: NodeProps) => (
  <div 
    className={`relative bg-white border-2 rounded-full p-3 min-w-24 min-h-24 flex items-center justify-center ${
      selected ? 'border-blue-500 shadow-lg' : 'border-gray-300'
    }`}
    style={{ borderColor: data.color || '#d1d5db' }}
  >
    <div className="text-center">
      <div className="font-medium text-sm">{data.label || 'Branch'}</div>
    </div>
    <Handle type="target" position={Position.Left} className="w-3 h-3" />
    <Handle type="source" position={Position.Right} className="w-3 h-3" />
  </div>
));

// Organization Chart Components
export const OrgChartPerson = memo(({ data, selected }: NodeProps) => (
  <div 
    className={`relative bg-white border-2 rounded-lg p-4 min-w-40 ${
      selected ? 'border-blue-500 shadow-lg' : 'border-gray-300'
    }`}
  >
    <div className="text-center">
      <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl">
        {data.avatar || '👤'}
      </div>
      <div className="font-semibold text-sm">{data.label || 'Name'}</div>
      {data.title && (
        <div className="text-xs text-gray-600 mt-1">{data.title}</div>
      )}
      {data.department && (
        <div className="text-xs text-blue-600 mt-1">{data.department}</div>
      )}
    </div>
    <Handle type="target" position={Position.Top} className="w-3 h-3" />
    <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
  </div>
));

// Kanban Components
export const KanbanCard = memo(({ data, selected }: NodeProps) => (
  <div 
    className={`relative bg-white border border-gray-300 rounded-lg p-3 min-w-48 shadow-sm ${
      selected ? 'border-blue-500 shadow-md' : ''
    }`}
  >
    <div className="space-y-2">
      <div className="font-medium text-sm">{data.label || 'Card'}</div>
      {data.description && (
        <div className="text-xs text-gray-600">{data.description}</div>
      )}
      <div className="flex items-center justify-between">
        {data.priority && (
          <span className={`text-xs px-2 py-1 rounded ${
            data.priority === 'high' ? 'bg-red-100 text-red-800' :
            data.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {data.priority}
          </span>
        )}
        {data.assignee && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {data.assignee}
          </span>
        )}
      </div>
      {data.dueDate && (
        <div className="text-xs text-gray-500">Due: {data.dueDate}</div>
      )}
    </div>
    <Handle type="target" position={Position.Left} className="w-3 h-3 opacity-0" />
    <Handle type="source" position={Position.Right} className="w-3 h-3 opacity-0" />
  </div>
));

// Export all node types
export const advancedNodeTypes = {
  // BPMN
  'bpmn-start': BPMNStartEvent,
  'bpmn-end': BPMNEndEvent,
  'bpmn-task': BPMNTask,
  'bpmn-gateway': BPMNGateway,
  
  // Swimlane
  'swimlane-header': SwimlaneHeader,
  'swimlane-activity': SwimlaneActivity,
  
  // Timeline
  'timeline-event': TimelineEvent,
  'timeline-milestone': TimelineMilestone,
  
  // Gantt
  'gantt-task': GanttTask,
  'gantt-milestone': GanttMilestone,
  
  // Network
  'network-device': NetworkDevice,
  
  // Mind Map
  'mindmap-central': MindMapCentralNode,
  'mindmap-branch': MindMapBranchNode,
  
  // Organization Chart
  'org-person': OrgChartPerson,
  
  // Kanban
  'kanban-card': KanbanCard
};

// Helper function to create nodes of specific types
export const createAdvancedNode = (
  type: keyof typeof advancedNodeTypes,
  id: string,
  position: { x: number; y: number },
  data: any
) => ({
  id,
  type,
  position,
  data
});

export default advancedNodeTypes;