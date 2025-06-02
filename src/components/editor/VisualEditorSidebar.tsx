/**
 * Visual Editor Sidebar with Templates and AI Chat
 * Simplified sidebar specifically for MermaidVisualEditor
 */

import React, { useState } from 'react';
import { Grid3X3, Brain, PanelLeftClose } from 'lucide-react';
import { GlassButton, GlassPanel, MermaidDesignTokens } from '../ui';
import { MermaidTemplatePanel } from './MermaidTemplatePanel';
import ConversationalAI from './ConversationalAI';

interface VisualEditorSidebarProps {
  isVisible: boolean;
  onHide?: () => void;
  onTemplateSelect?: (template: any) => void;
  onDiagramGenerate?: (code: string) => void;
  onReactFlowGenerate?: (nodes: any[], edges: any[]) => void;
  onReactFlowAdd?: (nodes: any[], edges: any[]) => void; // New: additive mode
  currentNodes?: any[]; // Current nodes in the editor
  currentEdges?: any[]; // Current edges in the editor
}

type TabType = 'ai' | 'templates';

export const VisualEditorSidebar: React.FC<VisualEditorSidebarProps> = ({
  isVisible,
  onHide,
  onTemplateSelect,
  onDiagramGenerate,
  onReactFlowGenerate,
  onReactFlowAdd,
  currentNodes = [],
  currentEdges = []
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('ai'); // Start with AI tab active

  if (!isVisible) return null;

  return (
    <div style={{
      width: '320px',
      height: '100%',
      background: MermaidDesignTokens.colors.glass.secondary,
      backdropFilter: MermaidDesignTokens.backdropBlur.xl,
      borderLeft: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Hide Panel Button */}
      {onHide && (
        <div style={{
          position: 'absolute',
          right: '-16px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1001
        }}>
          <GlassButton
            variant="ghost"
            size="sm"
            icon={<PanelLeftClose size={16} />}
            onClick={onHide}
            title="Hide Sidebar Panel"
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

      {/* Tab Header */}
      <GlassPanel variant="elevated" padding={3} style={{
        borderRadius: 0,
        borderBottom: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
        display: 'flex',
        gap: MermaidDesignTokens.spacing[1]
      }}>
        <GlassButton
          variant={activeTab === 'ai' ? 'primary' : 'ghost'}
          size="sm"
          icon={<Brain size={16} />}
          onClick={() => setActiveTab('ai')}
          style={{
            flex: 1,
            justifyContent: 'center',
            fontSize: MermaidDesignTokens.typography.fontSize.sm
          }}
        >
          AI Assistant
        </GlassButton>
        <GlassButton
          variant={activeTab === 'templates' ? 'primary' : 'ghost'}
          size="sm"
          icon={<Grid3X3 size={16} />}
          onClick={() => setActiveTab('templates')}
          style={{
            flex: 1,
            justifyContent: 'center',
            fontSize: MermaidDesignTokens.typography.fontSize.sm
          }}
        >
          Templates
        </GlassButton>
      </GlassPanel>

      {/* Tab Content - Full height panels that manage their own layout */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* AI Panel */}
        {activeTab === 'ai' && (
          <ConversationalAI
            isVisible={true}
            onDiagramGenerate={onDiagramGenerate}
            onReactFlowGenerate={onReactFlowGenerate}
            onReactFlowAdd={onReactFlowAdd}
            currentNodes={currentNodes}
            currentEdges={currentEdges}
            showHeader={false}
          />
        )}

        {/* Templates Panel */}
        {activeTab === 'templates' && (
          <div style={{
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Hide the original panel borders and recreate just the content */}
            <div style={{ 
              flex: 1, 
              overflow: 'hidden',
              marginTop: '-1px' // Hide the top border from MermaidTemplatePanel
            }}>
              <MermaidTemplatePanel
                isVisible={true}
                onTemplateSelect={onTemplateSelect || (() => {})}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualEditorSidebar;