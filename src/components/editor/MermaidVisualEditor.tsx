/**
 * Mermaid Visual Editor - Following Design Inspiration
 * Clean white & blue theme with left template panel
 * No visible code - pure visual interface
 */

import React, { useState } from 'react';
import {
  ArrowLeft, Save, FolderOpen, PanelLeftOpen, Trash2
} from 'lucide-react';
import {
  GlassPanel,
  GlassButton,
  AnimationProvider,
  MermaidDesignTokens
} from '../ui';
import { InteractiveMermaidEditor } from './InteractiveMermaidEditor';
import { VisualEditorSidebar } from './VisualEditorSidebar';
import { SaveExportModal } from './SaveExportModal';

interface MermaidVisualEditorProps {
  showBackButton?: boolean;
  onBack?: () => void;
}

export const MermaidVisualEditor: React.FC<MermaidVisualEditorProps> = ({
  showBackButton = true,
  onBack
}) => {
  // State Management
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [diagramText, setDiagramText] = useState(`flowchart TD
    A[Start Your Secure Design Journey] --> B[Select Template]
    B --> C[Customize Design]
    C --> D[Export & Share]

    style A fill:#2563eb,stroke:#1d4ed8,stroke-width:2px,color:#fff
    style B fill:#3b82f6,stroke:#2563eb,stroke-width:2px,color:#fff
    style C fill:#60a5fa,stroke:#3b82f6,stroke-width:2px,color:#fff
    style D fill:#93c5fd,stroke:#60a5fa,stroke-width:2px,color:#fff`);
  const [showSaveExportModal, setShowSaveExportModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [canvasBackground, setCanvasBackground] = useState('#f8fafc');
  const [currentNodes, setCurrentNodes] = useState<any[]>([]);
  const [currentEdges, setCurrentEdges] = useState<any[]>([]);

  // Convert template to React Flow nodes
  const createNodesFromTemplate = (template: any) => {
    if (!reactFlowInstance || !template) return;

    // Parse template based on its type and create appropriate nodes
    const nodes = createTemplateNodes(template);
    const edges = createTemplateEdges(template);

    if (nodes.length > 0) {
      reactFlowInstance.setNodes(nodes);
      reactFlowInstance.setEdges(edges);
      setTimeout(() => reactFlowInstance.fitView(), 100);
    }
  };

  const createTemplateNodes = (template: any) => {
    // Enhanced template parsing for specific templates
    switch (template.id) {
      case 'audit-process':
        return [
          { id: '1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Audit Planning', shape: 'circle', fillColor: '#dbeafe', strokeColor: '#2563eb', strokeWidth: 2, textColor: '#1e293b' }},
          { id: '2', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Risk Assessment', shape: 'rectangle', fillColor: '#f1f5f9', strokeColor: '#475569', strokeWidth: 2, textColor: '#1e293b' }},
          { id: '3', type: 'custom', position: { x: 250, y: 250 }, data: { label: 'Control Testing', shape: 'rectangle', fillColor: '#f1f5f9', strokeColor: '#475569', strokeWidth: 2, textColor: '#1e293b' }},
          { id: '4', type: 'custom', position: { x: 250, y: 350 }, data: { label: 'Evidence Collection', shape: 'rectangle', fillColor: '#f1f5f9', strokeColor: '#475569', strokeWidth: 2, textColor: '#1e293b' }},
          { id: '5', type: 'custom', position: { x: 250, y: 450 }, data: { label: 'Findings Analysis', shape: 'diamond', fillColor: '#fef3c7', strokeColor: '#d97706', strokeWidth: 2, textColor: '#1e293b' }},
          { id: '6', type: 'custom', position: { x: 250, y: 550 }, data: { label: 'Report Generation', shape: 'rectangle', fillColor: '#f1f5f9', strokeColor: '#475569', strokeWidth: 2, textColor: '#1e293b' }},
          { id: '7', type: 'custom', position: { x: 250, y: 650 }, data: { label: 'Management Review', shape: 'rectangle', fillColor: '#f1f5f9', strokeColor: '#475569', strokeWidth: 2, textColor: '#1e293b' }},
          { id: '8', type: 'custom', position: { x: 250, y: 750 }, data: { label: 'Action Plan', shape: 'circle', fillColor: '#dcfce7', strokeColor: '#16a34a', strokeWidth: 2, textColor: '#1e293b' }}
        ];

      case 'risk-assessment':
        return [
          { id: '1', type: 'custom', position: { x: 250, y: 50 }, data: { label: 'Identify Risks', shape: 'circle', fillColor: '#dbeafe', strokeColor: '#2563eb', strokeWidth: 2, textColor: '#1e293b' }},
          { id: '2', type: 'custom', position: { x: 250, y: 150 }, data: { label: 'Assess Probability', shape: 'rectangle', fillColor: '#f1f5f9', strokeColor: '#475569', strokeWidth: 2, textColor: '#1e293b' }},
          { id: '3', type: 'custom', position: { x: 250, y: 250 }, data: { label: 'Assess Impact', shape: 'rectangle', fillColor: '#f1f5f9', strokeColor: '#475569', strokeWidth: 2, textColor: '#1e293b' }},
          { id: '4', type: 'custom', position: { x: 250, y: 350 }, data: { label: 'Risk Level', shape: 'diamond', fillColor: '#fef3c7', strokeColor: '#d97706', strokeWidth: 2, textColor: '#1e293b' }},
          { id: '5', type: 'custom', position: { x: 100, y: 450 }, data: { label: 'Immediate Action', shape: 'rectangle', fillColor: '#fee2e2', strokeColor: '#dc2626', strokeWidth: 2, textColor: '#1e293b' }},
          { id: '6', type: 'custom', position: { x: 250, y: 450 }, data: { label: 'Planned Mitigation', shape: 'rectangle', fillColor: '#fef3c7', strokeColor: '#d97706', strokeWidth: 2, textColor: '#1e293b' }},
          { id: '7', type: 'custom', position: { x: 400, y: 450 }, data: { label: 'Monitor & Review', shape: 'rectangle', fillColor: '#dcfce7', strokeColor: '#16a34a', strokeWidth: 2, textColor: '#1e293b' }}
        ];

      case 'business-process':
        return [
          { id: '1', type: 'custom', position: { x: 50, y: 200 }, data: { label: 'Start', shape: 'circle', fillColor: '#dbeafe', strokeColor: '#2563eb', strokeWidth: 2, textColor: '#1e293b' }},
          { id: '2', type: 'custom', position: { x: 150, y: 200 }, data: { label: 'Input Validation', shape: 'rectangle', fillColor: '#f1f5f9', strokeColor: '#475569', strokeWidth: 2, textColor: '#1e293b' }},
          { id: '3', type: 'custom', position: { x: 270, y: 200 }, data: { label: 'Valid Input?', shape: 'diamond', fillColor: '#fef3c7', strokeColor: '#d97706', strokeWidth: 2, textColor: '#1e293b' }},
          { id: '4', type: 'custom', position: { x: 400, y: 150 }, data: { label: 'Process Request', shape: 'rectangle', fillColor: '#f1f5f9', strokeColor: '#475569', strokeWidth: 2, textColor: '#1e293b' }},
          { id: '5', type: 'custom', position: { x: 400, y: 250 }, data: { label: 'Error Handling', shape: 'rectangle', fillColor: '#fee2e2', strokeColor: '#dc2626', strokeWidth: 2, textColor: '#1e293b' }},
          { id: '6', type: 'custom', position: { x: 550, y: 150 }, data: { label: 'Generate Output', shape: 'rectangle', fillColor: '#f1f5f9', strokeColor: '#475569', strokeWidth: 2, textColor: '#1e293b' }},
          { id: '7', type: 'custom', position: { x: 700, y: 200 }, data: { label: 'End', shape: 'circle', fillColor: '#dcfce7', strokeColor: '#16a34a', strokeWidth: 2, textColor: '#1e293b' }}
        ];

      case 'infinity-loop-process':
        return [
          { id: '1', type: 'custom', position: { x: 250, y: 50 }, data: { label: '1. Security Assessment', shape: 'circle', fillColor: '#dbeafe', strokeColor: '#2563eb', strokeWidth: 3, textColor: '#fff' }},
          { id: '2', type: 'custom', position: { x: 400, y: 150 }, data: { label: '2. Risk Analysis', shape: 'circle', fillColor: '#f3e8ff', strokeColor: '#8b5cf6', strokeWidth: 3, textColor: '#fff' }},
          { id: '3', type: 'custom', position: { x: 400, y: 350 }, data: { label: '3. Implementation Planning', shape: 'circle', fillColor: '#cffafe', strokeColor: '#06b6d4', strokeWidth: 3, textColor: '#fff' }},
          { id: '4', type: 'custom', position: { x: 250, y: 450 }, data: { label: '4. Process Execution', shape: 'circle', fillColor: '#f3e8ff', strokeColor: '#8b5cf6', strokeWidth: 3, textColor: '#fff' }},
          { id: '5', type: 'custom', position: { x: 100, y: 350 }, data: { label: '5. Monitoring & Review', shape: 'circle', fillColor: '#fdf4ff', strokeColor: '#d946ef', strokeWidth: 3, textColor: '#fff' }},
          { id: '6', type: 'custom', position: { x: 100, y: 150 }, data: { label: '6. Optimization & Feedback', shape: 'circle', fillColor: '#dbeafe', strokeColor: '#3b82f6', strokeWidth: 3, textColor: '#fff' }}
        ];

      default:
        // Create basic nodes from template name
        return [
          { id: '1', type: 'custom', position: { x: 250, y: 100 }, data: { label: template.name || 'Start', shape: 'circle', fillColor: '#dbeafe', strokeColor: '#2563eb', strokeWidth: 2, textColor: '#1e293b' }},
          { id: '2', type: 'custom', position: { x: 250, y: 200 }, data: { label: 'Process Step', shape: 'rectangle', fillColor: '#f1f5f9', strokeColor: '#475569', strokeWidth: 2, textColor: '#1e293b' }},
          { id: '3', type: 'custom', position: { x: 250, y: 300 }, data: { label: 'Complete', shape: 'circle', fillColor: '#dcfce7', strokeColor: '#16a34a', strokeWidth: 2, textColor: '#1e293b' }}
        ];
    }
  };

  // Clear canvas function
  const handleClearCanvas = () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear the entire canvas? This action cannot be undone.'
    );
    
    if (confirmed && reactFlowInstance) {
      // Clear all nodes and edges
      reactFlowInstance.setNodes([]);
      reactFlowInstance.setEdges([]);
      setCurrentNodes([]);
      setCurrentEdges([]);
      setDiagramText('');
      
      // Reset canvas background to default
      setCanvasBackground('#f8fafc');
    }
  };

  const createTemplateEdges = (template: any) => {
    switch (template.id) {
      case 'audit-process':
        return [
          { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 2 }, markerEnd: { type: 'ArrowClosed', color: '#475569' }},
          { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 2 }, markerEnd: { type: 'ArrowClosed', color: '#475569' }},
          { id: 'e3-4', source: '3', target: '4', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 2 }, markerEnd: { type: 'ArrowClosed', color: '#475569' }},
          { id: 'e4-5', source: '4', target: '5', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 2 }, markerEnd: { type: 'ArrowClosed', color: '#475569' }},
          { id: 'e5-6', source: '5', target: '6', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 2 }, markerEnd: { type: 'ArrowClosed', color: '#475569' }},
          { id: 'e6-7', source: '6', target: '7', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 2 }, markerEnd: { type: 'ArrowClosed', color: '#475569' }},
          { id: 'e7-8', source: '7', target: '8', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 2 }, markerEnd: { type: 'ArrowClosed', color: '#475569' }}
        ];

      case 'risk-assessment':
        return [
          { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 2 }, markerEnd: { type: 'ArrowClosed', color: '#475569' }},
          { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 2 }, markerEnd: { type: 'ArrowClosed', color: '#475569' }},
          { id: 'e3-4', source: '3', target: '4', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 2 }, markerEnd: { type: 'ArrowClosed', color: '#475569' }},
          { id: 'e4-5', source: '4', target: '5', type: 'smoothstep', style: { stroke: '#dc2626', strokeWidth: 2 }, markerEnd: { type: 'ArrowClosed', color: '#dc2626' }, label: 'High' },
          { id: 'e4-6', source: '4', target: '6', type: 'smoothstep', style: { stroke: '#d97706', strokeWidth: 2 }, markerEnd: { type: 'ArrowClosed', color: '#d97706' }, label: 'Medium' },
          { id: 'e4-7', source: '4', target: '7', type: 'smoothstep', style: { stroke: '#16a34a', strokeWidth: 2 }, markerEnd: { type: 'ArrowClosed', color: '#16a34a' }, label: 'Low' }
        ];

      case 'business-process':
        return [
          { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 2 }, markerEnd: { type: 'ArrowClosed', color: '#475569' }},
          { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 2 }, markerEnd: { type: 'ArrowClosed', color: '#475569' }},
          { id: 'e3-4', source: '3', target: '4', type: 'smoothstep', style: { stroke: '#16a34a', strokeWidth: 2 }, markerEnd: { type: 'ArrowClosed', color: '#16a34a' }, label: 'Yes' },
          { id: 'e3-5', source: '3', target: '5', type: 'smoothstep', style: { stroke: '#dc2626', strokeWidth: 2 }, markerEnd: { type: 'ArrowClosed', color: '#dc2626' }, label: 'No' },
          { id: 'e4-6', source: '4', target: '6', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 2 }, markerEnd: { type: 'ArrowClosed', color: '#475569' }},
          { id: 'e5-7', source: '5', target: '7', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 2 }, markerEnd: { type: 'ArrowClosed', color: '#475569' }},
          { id: 'e6-7', source: '6', target: '7', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 2 }, markerEnd: { type: 'ArrowClosed', color: '#475569' }}
        ];

      case 'infinity-loop-process':
        return [
          { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 3 }, markerEnd: { type: 'ArrowClosed', color: '#475569' }},
          { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 3 }, markerEnd: { type: 'ArrowClosed', color: '#475569' }},
          { id: 'e3-4', source: '3', target: '4', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 3 }, markerEnd: { type: 'ArrowClosed', color: '#475569' }},
          { id: 'e4-5', source: '4', target: '5', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 3 }, markerEnd: { type: 'ArrowClosed', color: '#475569' }},
          { id: 'e5-6', source: '5', target: '6', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 3 }, markerEnd: { type: 'ArrowClosed', color: '#475569' }},
          { id: 'e6-1', source: '6', target: '1', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 3 }, markerEnd: { type: 'ArrowClosed', color: '#475569' }}
        ];

      default:
        return [
          { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 2 }, markerEnd: { type: 'ArrowClosed', color: '#475569' }},
          { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', style: { stroke: '#475569', strokeWidth: 2 }, markerEnd: { type: 'ArrowClosed', color: '#475569' }}
        ];
    }
  };

  return (
    <AnimationProvider>
      <div style={{
        height: '100vh',
        width: '100vw',
        background: MermaidDesignTokens.colors.primary.gradient,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <GlassPanel variant="elevated" padding={4} style={{
          borderRadius: 0,
          borderBottom: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '64px'
        }}>
          {/* Left side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: MermaidDesignTokens.spacing[4] }}>
            {/* Clear Button - Far left as requested */}
            <GlassButton
              variant="ghost"
              size="sm"
              icon={<Trash2 size={16} />}
              onClick={handleClearCanvas}
              title="Clear Canvas - Remove all content"
              style={{ 
                color: MermaidDesignTokens.colors.semantic.error[500],
                marginRight: MermaidDesignTokens.spacing[2]
              }}
            >
              Clear
            </GlassButton>
            
            {showBackButton && (
              <GlassButton
                variant="ghost"
                size="sm"
                icon={<ArrowLeft size={16} />}
                onClick={onBack}
              >
                Back
              </GlassButton>
            )}

            <div>
              <h1 style={{
                fontSize: MermaidDesignTokens.typography.fontSize.xl,
                fontWeight: MermaidDesignTokens.typography.fontWeight.bold,
                color: MermaidDesignTokens.colors.text.primary,
                margin: 0
              }}>
                AI Security Architect
              </h1>
              <p style={{
                fontSize: MermaidDesignTokens.typography.fontSize.sm,
                color: MermaidDesignTokens.colors.text.secondary,
                margin: 0
              }}>
                Leverage AI to visualize your security posture
              </p>
            </div>
          </div>

          {/* Center - Title */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: MermaidDesignTokens.typography.fontSize.lg,
              fontWeight: MermaidDesignTokens.typography.fontWeight.semibold,
              color: MermaidDesignTokens.colors.text.primary,
              margin: 0
            }}>
              Visual Process Designer
            </h2>
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: MermaidDesignTokens.spacing[2] }}>
            <GlassButton
              variant="ghost"
              size="sm"
              icon={<FolderOpen size={16} />}
              onClick={() => setShowSaveExportModal(true)}
              title="Open Project"
            >
              Open
            </GlassButton>
            <GlassButton
              variant="primary"
              size="sm"
              icon={<Save size={16} />}
              onClick={() => setShowSaveExportModal(true)}
              title="Save & Export Project"
            >
              Save
            </GlassButton>
          </div>
        </GlassPanel>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
          {/* Reopen Sidebar Button - Only visible when sidebar is hidden */}
          {!showLeftPanel && (
            <div style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1001
            }}>
              <GlassButton
                variant="ghost"
                size="sm"
                icon={<PanelLeftOpen size={16} />}
                onClick={() => setShowLeftPanel(true)}
                title="Show Sidebar Panel"
                style={{
                  background: MermaidDesignTokens.colors.glass.secondary,
                  border: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: MermaidDesignTokens.shadows.glass.md
                }}
              />
            </div>
          )}

          {/* Left Visual Editor Sidebar - Templates + AI Chat */}
          <VisualEditorSidebar
            isVisible={showLeftPanel}
            onHide={() => setShowLeftPanel(false)}
            onTemplateSelect={(template) => {
              setDiagramText(template.code);
              // Also create React Flow nodes based on template
              createNodesFromTemplate(template);
            }}
            onDiagramGenerate={(code) => {
              setDiagramText(code);
            }}
            onReactFlowGenerate={(nodes, edges) => {
              // Pass the nodes and edges to the InteractiveMermaidEditor
              if (reactFlowInstance) {
                reactFlowInstance.setNodes(nodes);
                reactFlowInstance.setEdges(edges);
                // Update state to track current nodes and edges
                setCurrentNodes(nodes);
                setCurrentEdges(edges);
                // Fit view to show all nodes
                setTimeout(() => reactFlowInstance.fitView(), 100);
              }
            }}
            onReactFlowAdd={(newNodes, newEdges) => {
              // Add new nodes and edges to existing ones
              if (reactFlowInstance) {
                const existingNodes = reactFlowInstance.getNodes();
                const existingEdges = reactFlowInstance.getEdges();
                
                // Merge new nodes with existing ones
                const allNodes = [...existingNodes, ...newNodes];
                const allEdges = [...existingEdges, ...newEdges];
                
                reactFlowInstance.setNodes(allNodes);
                reactFlowInstance.setEdges(allEdges);
                
                // Update state to track current nodes and edges
                setCurrentNodes(allNodes);
                setCurrentEdges(allEdges);
                
                // Fit view to show all nodes
                setTimeout(() => reactFlowInstance.fitView(), 100);
              }
            }}
            currentNodes={currentNodes}
            currentEdges={currentEdges}
          />

          {/* Main Canvas Area - Interactive Only */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <InteractiveMermaidEditor
              onMermaidCodeChange={(code) => {
                setDiagramText(code);
              }}
              onReactFlowInstanceChange={setReactFlowInstance}
              canvasBackground={canvasBackground}
              onCanvasBackgroundChange={setCanvasBackground}
              onNodesChange={(nodes) => {
                setCurrentNodes(nodes);
              }}
              onEdgesChange={(edges) => {
                setCurrentEdges(edges);
              }}
            />
          </div>
        </div>

        {/* Save & Export Modal */}
        <SaveExportModal
          isVisible={showSaveExportModal}
          onClose={() => setShowSaveExportModal(false)}
          diagramText={diagramText}
          projectName={projectName}
          canvasBackground={canvasBackground}
          onProjectNameChange={setProjectName}
          onProjectSaved={(savedProjectName) => {
            console.log('Project saved:', savedProjectName);
          }}
          onProjectLoad={(loadedDiagramText, loadedCanvasBackground, flowData) => {
            console.log('Loading diagram text:', loadedDiagramText);
            console.log('Loading canvas background:', loadedCanvasBackground);
            console.log('Loading flow data:', flowData);

            setDiagramText(loadedDiagramText);
            if (loadedCanvasBackground) {
              setCanvasBackground(loadedCanvasBackground);
            }

            // If we have flow data, restore the complete React Flow state
            if (flowData && reactFlowInstance) {
              console.log('Restoring React Flow state...');
              try {
                // Restore the complete flow state including nodes, edges, and viewport
                reactFlowInstance.setNodes(flowData.nodes || []);
                reactFlowInstance.setEdges(flowData.edges || []);
                if (flowData.viewport) {
                  reactFlowInstance.setViewport(flowData.viewport);
                }
                console.log('React Flow state restored successfully');
              } catch (error) {
                console.error('Error restoring React Flow state:', error);
              }
            }
          }}
          reactFlowInstance={reactFlowInstance}
        />
      </div>
    </AnimationProvider>
  );
};

export default MermaidVisualEditor;
