/**
 * Enhanced Sidebar for Mermaid Editor
 * Modern collapsible sidebar with diagram templates and tools
 */
import React, { useState } from 'react';
import {
  ChevronLeft, ChevronRight, FileText, Zap, Palette,
  BarChart3, GitBranch, Calendar, Users, Database,
  PieChart, Target, Workflow, Brain, Clock, Grid3X3, Edit3
} from 'lucide-react';
import {
  GlassPanel,
  GlassButton,
  GlassInput,
  FadeInContainer,
  MermaidDesignTokens
} from '../ui';
import AIPoweredPanel from './AIPoweredPanel';
import VisualElementEditor from './VisualElementEditor';
import SyntaxValidator from './SyntaxValidator';

interface EnhancedSidebarProps {
  diagramText: string;
  onDiagramTextChange: (text: string) => void;
  onRenderDiagram: () => void;
  isRendering: boolean;
  showThemes: boolean;
  onToggleThemes: () => void;
  availableThemes: any[];
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  onExport: (format: 'svg' | 'png' | 'pdf') => void;
  // Visual editing props
  selectedElement?: any;
  onElementUpdate?: (element: any) => void;
  onElementDelete?: (elementId: string) => void;
  onElementDuplicate?: (element: any) => void;
  isVisualEditingMode?: boolean;
  onShapeAdd?: (shapeType: any, text?: string) => void;
}

const diagramTemplates = [
  {
    id: 'audit-process',
    name: 'Audit Process Flow',
    icon: <Workflow size={16} />,
    category: 'Audit',
    template: `flowchart TD
    A[Audit Planning] --> B[Risk Assessment]
    B --> C[Control Testing]
    C --> D[Evidence Collection]
    D --> E[Findings Analysis]
    E --> F[Report Generation]
    F --> G[Management Review]
    G --> H[Action Plan]`
  },
  {
    id: 'risk-matrix',
    name: 'Risk Assessment',
    icon: <Target size={16} />,
    category: 'Risk',
    template: `quadrantChart
    title Risk Assessment Matrix
    x-axis Low --> High
    y-axis Low --> High
    quadrant-1 Monitor
    quadrant-2 Mitigate
    quadrant-3 Accept
    quadrant-4 Avoid`
  },
  {
    id: 'compliance-timeline',
    name: 'Compliance Timeline',
    icon: <Clock size={16} />,
    category: 'Compliance',
    template: `timeline
    title Compliance Implementation
    section Planning
        Requirements Analysis : Risk Assessment
                              : Gap Analysis
    section Implementation
        Controls Design      : Policy Development
                            : Procedure Creation
    section Testing
        Control Testing      : Evidence Collection
                            : Validation`
  },
  {
    id: 'org-chart',
    name: 'Organization Chart',
    icon: <Users size={16} />,
    category: 'Organization',
    template: `flowchart TD
    CEO[Chief Executive Officer]
    CFO[Chief Financial Officer]
    CTO[Chief Technology Officer]
    CAO[Chief Audit Officer]

    CEO --> CFO
    CEO --> CTO
    CEO --> CAO

    CFO --> ACC[Accounting]
    CFO --> FIN[Finance]
    CTO --> DEV[Development]
    CTO --> OPS[Operations]
    CAO --> INT[Internal Audit]
    CAO --> COMP[Compliance]`
  },
  {
    id: 'data-flow',
    name: 'Data Flow Diagram',
    icon: <Database size={16} />,
    category: 'Process',
    template: `flowchart LR
    A[Data Input] --> B[Validation]
    B --> C[Processing]
    C --> D[Storage]
    D --> E[Analysis]
    E --> F[Reporting]
    F --> G[Decision Making]`
  },
  {
    id: 'gantt-project',
    name: 'Project Timeline',
    icon: <Calendar size={16} />,
    category: 'Project',
    template: `gantt
    title Audit Project Timeline
    dateFormat  YYYY-MM-DD
    section Planning
    Requirements    :done,    req, 2024-01-01,2024-01-15
    Risk Assessment :done,    risk, 2024-01-10,2024-01-25
    section Execution
    Fieldwork       :active,  field, 2024-01-20,2024-02-15
    Testing         :         test, 2024-02-01,2024-02-20
    section Reporting
    Draft Report    :         draft, 2024-02-15,2024-02-25
    Final Report    :         final, 2024-02-20,2024-03-01`
  }
];

export const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({
  diagramText,
  onDiagramTextChange,
  onRenderDiagram,
  isRendering,
  showThemes,
  onToggleThemes,
  availableThemes,
  currentTheme,
  onThemeChange,
  onExport,
  selectedElement,
  onElementUpdate,
  onElementDelete,
  onElementDuplicate,
  isVisualEditingMode,
  onShapeAdd
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'templates' | 'themes' | 'ai' | 'visual'>('editor');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Audit', 'Risk', 'Compliance', 'Organization', 'Process', 'Project'];

  const filteredTemplates = selectedCategory === 'All'
    ? diagramTemplates
    : diagramTemplates.filter(t => t.category === selectedCategory);

  const sidebarWidth = isCollapsed ? '60px' : '320px';

  const sidebarStyles: React.CSSProperties = {
    width: sidebarWidth,
    background: MermaidDesignTokens.colors.glass.secondary,
    backdropFilter: MermaidDesignTokens.backdropBlur.xl,
    borderRight: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
    display: 'flex',
    flexDirection: 'column',
    transition: `width ${MermaidDesignTokens.animation.duration[300]} ${MermaidDesignTokens.animation.easing.inOut}`,
    overflow: 'hidden'
  };

  const handleTemplateSelect = (template: typeof diagramTemplates[0]) => {
    onDiagramTextChange(template.template);
    setActiveTab('editor');
  };

  if (isCollapsed) {
    return (
      <div style={sidebarStyles}>
        <div style={{
          padding: MermaidDesignTokens.spacing[4],
          display: 'flex',
          flexDirection: 'column',
          gap: MermaidDesignTokens.spacing[2],
          alignItems: 'center'
        }}>
          <GlassButton
            variant="ghost"
            size="sm"
            icon={<ChevronRight size={16} />}
            onClick={() => setIsCollapsed(false)}
            title="Expand Sidebar"
          />
          <GlassButton
            variant={activeTab === 'editor' ? 'primary' : 'ghost'}
            size="sm"
            icon={<FileText size={16} />}
            onClick={() => {
              setActiveTab('editor');
              setIsCollapsed(false);
            }}
            title="Editor"
          />
          <GlassButton
            variant={activeTab === 'templates' ? 'primary' : 'ghost'}
            size="sm"
            icon={<Grid3X3 size={16} />}
            onClick={() => {
              setActiveTab('templates');
              setIsCollapsed(false);
            }}
            title="Templates"
          />
          <GlassButton
            variant={activeTab === 'themes' ? 'primary' : 'ghost'}
            size="sm"
            icon={<Palette size={16} />}
            onClick={() => {
              setActiveTab('themes');
              setIsCollapsed(false);
            }}
            title="Themes"
          />
          <GlassButton
            variant={activeTab === 'ai' ? 'primary' : 'ghost'}
            size="sm"
            icon={<Brain size={16} />}
            onClick={() => {
              setActiveTab('ai');
              setIsCollapsed(false);
            }}
            title="AI Assistant"
          />
          {isVisualEditingMode && (
            <GlassButton
              variant={activeTab === 'visual' ? 'primary' : 'ghost'}
              size="sm"
              icon={<Edit3 size={16} />}
              onClick={() => {
                setActiveTab('visual');
                setIsCollapsed(false);
              }}
              title="Visual Editor"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <FadeInContainer style={sidebarStyles}>
      {/* Sidebar Header */}
      <div style={{
        padding: MermaidDesignTokens.spacing[4],
        borderBottom: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h3 style={{
          fontSize: MermaidDesignTokens.typography.fontSize.lg,
          fontWeight: MermaidDesignTokens.typography.fontWeight.semibold,
          margin: 0,
          color: MermaidDesignTokens.colors.text.primary
        }}>
          Editor Tools
        </h3>
        <GlassButton
          variant="ghost"
          size="sm"
          icon={<ChevronLeft size={16} />}
          onClick={() => setIsCollapsed(true)}
          title="Collapse Sidebar"
        />
      </div>

      {/* Tab Navigation */}
      <div style={{
        padding: MermaidDesignTokens.spacing[2],
        display: 'flex',
        gap: MermaidDesignTokens.spacing[1],
        borderBottom: `1px solid ${MermaidDesignTokens.colors.glass.border}`
      }}>
        <GlassButton
          variant={activeTab === 'editor' ? 'primary' : 'ghost'}
          size="sm"
          icon={<FileText size={14} />}
          onClick={() => setActiveTab('editor')}
          style={{ flex: 1, fontSize: MermaidDesignTokens.typography.fontSize.xs }}
        >
          Editor
        </GlassButton>
        <GlassButton
          variant={activeTab === 'templates' ? 'primary' : 'ghost'}
          size="sm"
          icon={<Grid3X3 size={14} />}
          onClick={() => setActiveTab('templates')}
          style={{ flex: 1, fontSize: MermaidDesignTokens.typography.fontSize.xs }}
        >
          Templates
        </GlassButton>
        <GlassButton
          variant={activeTab === 'themes' ? 'primary' : 'ghost'}
          size="sm"
          icon={<Palette size={14} />}
          onClick={() => setActiveTab('themes')}
          style={{ flex: 1, fontSize: MermaidDesignTokens.typography.fontSize.xs }}
        >
          Themes
        </GlassButton>
        <GlassButton
          variant={activeTab === 'ai' ? 'primary' : 'ghost'}
          size="sm"
          icon={<Brain size={14} />}
          onClick={() => setActiveTab('ai')}
          style={{ flex: 1, fontSize: MermaidDesignTokens.typography.fontSize.xs }}
        >
          AI
        </GlassButton>
        {isVisualEditingMode && (
          <GlassButton
            variant={activeTab === 'visual' ? 'primary' : 'ghost'}
            size="sm"
            icon={<Edit3 size={14} />}
            onClick={() => setActiveTab('visual')}
            style={{ flex: 1, fontSize: MermaidDesignTokens.typography.fontSize.xs }}
          >
            Visual
          </GlassButton>
        )}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: MermaidDesignTokens.spacing[4] }}>
        {activeTab === 'editor' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: MermaidDesignTokens.spacing[4] }}>
            <GlassPanel variant="elevated" padding="4">
              <h4 style={{
                fontSize: MermaidDesignTokens.typography.fontSize.base,
                fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                margin: `0 0 ${MermaidDesignTokens.spacing[3]} 0`,
                color: MermaidDesignTokens.colors.text.primary
              }}>
                Quick Create
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: MermaidDesignTokens.spacing[2] }}>
                <GlassButton
                  variant="primary"
                  onClick={() => {
                    const newFlow = `flowchart TD
    A[Start] --> B[Process Step]
    B --> C{Decision Point}
    C -->|Yes| D[Action A]
    C -->|No| E[Action B]
    D --> F[End]
    E --> F`;
                    onDiagramTextChange(newFlow);
                    onRenderDiagram();
                  }}
                  icon={<Workflow size={16} />}
                  style={{ width: '100%' }}
                >
                  Process Flow
                </GlassButton>

                <GlassButton
                  variant="secondary"
                  onClick={() => {
                    const newTree = `flowchart TD
    Start([Start]) --> Question{Question?}
    Question -->|Yes| ActionA[Action A]
    Question -->|No| ActionB[Action B]
    ActionA --> End([End])
    ActionB --> End`;
                    onDiagramTextChange(newTree);
                    onRenderDiagram();
                  }}
                  icon={<GitBranch size={16} />}
                  style={{ width: '100%' }}
                >
                  Decision Tree
                </GlassButton>

                <GlassButton
                  variant="secondary"
                  onClick={() => {
                    const newOrg = `flowchart TD
    CEO[CEO] --> CTO[CTO]
    CEO --> CFO[CFO]
    CTO --> Dev1[Developer 1]
    CTO --> Dev2[Developer 2]
    CFO --> Acc1[Accountant]`;
                    onDiagramTextChange(newOrg);
                    onRenderDiagram();
                  }}
                  icon={<Users size={16} />}
                  style={{ width: '100%' }}
                >
                  Org Chart
                </GlassButton>

                <GlassButton
                  variant="ghost"
                  onClick={() => {
                    onDiagramTextChange('flowchart TD\n    A[Start Here]');
                    onRenderDiagram();
                  }}
                  icon={<FileText size={16} />}
                  style={{ width: '100%' }}
                >
                  Start Blank
                </GlassButton>
              </div>
            </GlassPanel>

            {/* Syntax Validator */}
            <SyntaxValidator
              diagramText={diagramText}
              onValidationChange={() => {}} // Handled in main editor
              showInline={true}
            />
          </div>
        )}

        {activeTab === 'templates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: MermaidDesignTokens.spacing[4] }}>
            {/* Category Filter */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: MermaidDesignTokens.spacing[1] }}>
              {categories.map(category => (
                <GlassButton
                  key={category}
                  variant={selectedCategory === category ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  style={{ fontSize: MermaidDesignTokens.typography.fontSize.xs }}
                >
                  {category}
                </GlassButton>
              ))}
            </div>

            {/* Templates Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: MermaidDesignTokens.spacing[2] }}>
              {filteredTemplates.map(template => (
                <GlassPanel
                  key={template.id}
                  variant="primary"
                  padding="3"
                  style={{
                    cursor: 'pointer',
                    transition: `all ${MermaidDesignTokens.animation.duration[200]} ${MermaidDesignTokens.animation.easing.inOut}`
                  }}
                  onClick={() => handleTemplateSelect(template)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = MermaidDesignTokens.shadows.glass.lg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = MermaidDesignTokens.shadows.glass.md;
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: MermaidDesignTokens.spacing[2] }}>
                    <div style={{ color: MermaidDesignTokens.colors.accent.blue }}>
                      {template.icon}
                    </div>
                    <div>
                      <div style={{
                        fontSize: MermaidDesignTokens.typography.fontSize.sm,
                        fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
                        color: MermaidDesignTokens.colors.text.primary
                      }}>
                        {template.name}
                      </div>
                      <div style={{
                        fontSize: MermaidDesignTokens.typography.fontSize.xs,
                        color: MermaidDesignTokens.colors.text.tertiary
                      }}>
                        {template.category}
                      </div>
                    </div>
                  </div>
                </GlassPanel>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'themes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: MermaidDesignTokens.spacing[3] }}>
            <h4 style={{
              fontSize: MermaidDesignTokens.typography.fontSize.base,
              fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
              margin: 0,
              color: MermaidDesignTokens.colors.text.primary
            }}>
              Available Themes
            </h4>
            {availableThemes.map((theme) => (
              <GlassButton
                key={theme.name}
                variant={currentTheme === theme.name ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onThemeChange(theme.name)}
                style={{ justifyContent: 'flex-start' }}
              >
                <div>
                  <div style={{ fontWeight: MermaidDesignTokens.typography.fontWeight.medium }}>
                    {theme.name}
                  </div>
                  <div style={{
                    fontSize: MermaidDesignTokens.typography.fontSize.xs,
                    opacity: 0.8
                  }}>
                    {theme.description}
                  </div>
                </div>
              </GlassButton>
            ))}
          </div>
        )}

        {activeTab === 'ai' && (
          <AIPoweredPanel
            onDiagramGenerated={onDiagramTextChange}
            currentDiagram={diagramText}
            onDiagramOptimized={onDiagramTextChange}
          />
        )}

        {activeTab === 'visual' && isVisualEditingMode && (
          <VisualElementEditor
            selectedElement={selectedElement}
            onElementUpdate={onElementUpdate || (() => {})}
            onElementDelete={onElementDelete || (() => {})}
            onElementDuplicate={onElementDuplicate || (() => {})}
            diagramText={diagramText}
            onDiagramTextChange={onDiagramTextChange}
            onShapeAdd={onShapeAdd}
          />
        )}
      </div>
    </FadeInContainer>
  );
};

export default EnhancedSidebar;
