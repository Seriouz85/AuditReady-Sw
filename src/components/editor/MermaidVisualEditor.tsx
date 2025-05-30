/**
 * Mermaid Visual Editor - Following Design Inspiration
 * Clean white & blue theme with left template panel
 * No visible code - pure visual interface
 */

import React, { useState } from 'react';
import {
  ArrowLeft, Save, FolderOpen, PanelLeftOpen
} from 'lucide-react';
import {
  GlassPanel,
  GlassButton,
  AnimationProvider,
  MermaidDesignTokens
} from '../ui';
import { InteractiveMermaidEditor } from './InteractiveMermaidEditor';
import { MermaidTemplatePanel } from './MermaidTemplatePanel';
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

          {/* Left Template Panel - Conditionally Visible */}
          <MermaidTemplatePanel
            isVisible={showLeftPanel}
            onHide={() => setShowLeftPanel(false)}
            onTemplateSelect={(template) => {
              setDiagramText(template.code);
            }}
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
