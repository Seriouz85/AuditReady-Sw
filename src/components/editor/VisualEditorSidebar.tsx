/**
 * Visual Editor Sidebar with Templates and AI Chat
 * Modern, professional design with AuditReady theme system
 */

import React, { useState } from 'react';
import { Grid3X3, Brain, PanelLeftClose, X } from 'lucide-react';
import { Button } from '../ui/button';
import { ModernTemplateGallery } from './ModernTemplateGallery';
import ConversationalAI from './ConversationalAI';
import { AuditReadyThemes } from '../ui/design-system/AuditReadyDesignSystem';

interface VisualEditorSidebarProps {
  isVisible: boolean;
  onHide?: () => void;
  onTemplateSelect?: (template: any) => void;
  onDiagramGenerate?: (code: string) => void;
  onReactFlowGenerate?: (nodes: any[], edges: any[]) => void;
  onReactFlowAdd?: (nodes: any[], edges: any[]) => void; // New: additive mode
  currentNodes?: any[]; // Current nodes in the editor
  currentEdges?: any[]; // Current edges in the editor
  currentTheme?: string;
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
  currentEdges = [],
  currentTheme = 'Executive Clean'
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('templates'); // Start with templates
  
  const themeData = AuditReadyThemes[currentTheme as keyof typeof AuditReadyThemes] || AuditReadyThemes['Executive Clean'];

  if (!isVisible) return null;

  return (
    <div 
      className="flex flex-col h-full overflow-hidden relative shadow-lg"
      style={{
        width: '380px',
        background: themeData.colors.primary,
        borderRight: `1px solid ${themeData.colors.border}`
      }}
    >
      {/* Hide Panel Button */}
      {onHide && (
        <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={onHide}
            className="w-8 h-8 p-0 rounded-full bg-white shadow-md border-gray-300 hover:bg-gray-50"
          >
            <X className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      )}

      {/* Modern Tab Header */}
      <div 
        className="flex p-2 border-b"
        style={{ borderColor: themeData.colors.border }}
      >
        <Button
          variant={activeTab === 'templates' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('templates')}
          className="flex-1 justify-center text-sm"
          style={{
            backgroundColor: activeTab === 'templates' ? themeData.colors.accent : 'transparent',
            color: activeTab === 'templates' ? 'white' : themeData.colors.text.secondary
          }}
        >
          <Grid3X3 className="h-4 w-4 mr-2" />
          Templates
        </Button>
        <Button
          variant={activeTab === 'ai' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('ai')}
          className="flex-1 justify-center text-sm ml-1"
          style={{
            backgroundColor: activeTab === 'ai' ? themeData.colors.accent : 'transparent',
            color: activeTab === 'ai' ? 'white' : themeData.colors.text.secondary
          }}
        >
          <Brain className="h-4 w-4 mr-2" />
          AI Assistant
        </Button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {/* Templates Panel */}
        {activeTab === 'templates' && (
          <ModernTemplateGallery
            onTemplateSelect={onTemplateSelect || (() => {})}
            currentTheme={currentTheme}
          />
        )}

        {/* AI Panel */}
        {activeTab === 'ai' && (
          <ConversationalAI
            isVisible={true}
            onDiagramGenerate={onDiagramGenerate}
            onReactFlowGenerate={(nodes, edges) => {
              console.log('VisualEditorSidebar - Received onReactFlowGenerate call with:', { nodes: nodes.length, edges: edges.length });
              if (onReactFlowGenerate) {
                onReactFlowGenerate(nodes, edges);
              }
            }}
            onReactFlowAdd={onReactFlowAdd}
            currentNodes={currentNodes}
            currentEdges={currentEdges}
            showHeader={false}
          />
        )}
      </div>
    </div>
  );
};

export default VisualEditorSidebar;