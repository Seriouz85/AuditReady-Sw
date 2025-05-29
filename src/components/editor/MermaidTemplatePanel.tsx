/**
 * Mermaid Template Panel - Beautiful Template Browsing
 * Large thumbnails with live previews following modern design patterns
 */

import React, { useState, useEffect } from 'react';
import { GlassButton, GlassPanel, GlassInput, MermaidDesignTokens } from '../ui';
import {
  Search, Grid3X3, List, Filter, Star, Clock,
  Zap, BarChart3, GitBranch, Calendar, Users,
  Database, PieChart, Target, Brain, PanelLeftClose, X
} from 'lucide-react';

interface MermaidTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  code: string;
  thumbnail: string;
  tags: string[];
  featured?: boolean;
  complexity: 'simple' | 'medium' | 'complex';
}

interface MermaidTemplatePanelProps {
  onTemplateSelect: (template: MermaidTemplate) => void;
  isVisible: boolean;
  onHide?: () => void;
}

// Template categories with icons
const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Templates', icon: Grid3X3 },
  { id: 'audit', name: 'Audit & Compliance', icon: Search },
  { id: 'process', name: 'Business Process', icon: Target },
  { id: 'organization', name: 'Organization', icon: Users },
  { id: 'project', name: 'Project Management', icon: Calendar },
  { id: 'data', name: 'Data Flow', icon: Database },
  { id: 'analysis', name: 'Analysis & Reports', icon: BarChart3 },
  { id: 'development', name: 'Development', icon: GitBranch }
];

// Comprehensive template library
const MERMAID_TEMPLATES: MermaidTemplate[] = [
  {
    id: 'audit-process',
    name: 'Audit Process Flow',
    description: 'Complete audit lifecycle from planning to reporting',
    category: 'audit',
    featured: true,
    complexity: 'medium',
    tags: ['audit', 'compliance', 'process'],
    thumbnail: '🔍',
    code: `flowchart TD
    A[Audit Planning] --> B[Risk Assessment]
    B --> C[Control Testing]
    C --> D[Evidence Collection]
    D --> E{Findings?}
    E -->|Yes| F[Document Issues]
    E -->|No| G[Continue Testing]
    F --> H[Analysis & Review]
    G --> C
    H --> I[Draft Report]
    I --> J[Management Review]
    J --> K[Final Report]
    K --> L[Follow-up Actions]`
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment Matrix',
    description: 'Visual risk evaluation and mitigation planning',
    category: 'audit',
    complexity: 'simple',
    tags: ['risk', 'assessment', 'matrix'],
    thumbnail: '⚠️',
    code: `flowchart TD
    A[Identify Risks] --> B[Assess Probability]
    B --> C[Assess Impact]
    C --> D{Risk Level}
    D -->|High| E[Immediate Action]
    D -->|Medium| F[Planned Mitigation]
    D -->|Low| G[Monitor & Review]
    E --> H[Implement Controls]
    F --> H
    G --> I[Regular Assessment]
    H --> I`
  },
  {
    id: 'compliance-framework',
    name: 'Compliance Framework',
    description: 'Regulatory compliance monitoring and reporting',
    category: 'audit',
    complexity: 'complex',
    tags: ['compliance', 'framework', 'monitoring'],
    thumbnail: '📋',
    code: `flowchart TD
    A[Regulatory Requirements] --> B[Policy Development]
    B --> C[Control Implementation]
    C --> D[Training & Awareness]
    D --> E[Monitoring & Testing]
    E --> F{Compliance Status}
    F -->|Compliant| G[Maintain Controls]
    F -->|Non-Compliant| H[Corrective Actions]
    H --> I[Root Cause Analysis]
    I --> J[Process Improvement]
    J --> C
    G --> K[Regular Review]
    K --> E`
  },
  {
    id: 'business-process',
    name: 'Business Process Map',
    description: 'Standard business process workflow',
    category: 'process',
    featured: true,
    complexity: 'simple',
    tags: ['business', 'process', 'workflow'],
    thumbnail: '🔄',
    code: `flowchart LR
    A[Start] --> B[Input Validation]
    B --> C{Valid Input?}
    C -->|Yes| D[Process Request]
    C -->|No| E[Error Handling]
    D --> F[Generate Output]
    F --> G[Quality Check]
    G --> H{Quality OK?}
    H -->|Yes| I[Deliver Result]
    H -->|No| J[Rework]
    J --> D
    E --> K[End]
    I --> K`
  },
  {
    id: 'org-chart',
    name: 'Organization Chart',
    description: 'Hierarchical organization structure',
    category: 'organization',
    complexity: 'simple',
    tags: ['organization', 'hierarchy', 'structure'],
    thumbnail: '🏢',
    code: `flowchart TD
    A[CEO] --> B[CTO]
    A --> C[CFO]
    A --> D[COO]
    B --> E[Engineering]
    B --> F[Product]
    C --> G[Finance]
    C --> H[Accounting]
    D --> I[Operations]
    D --> J[HR]
    E --> K[Frontend Team]
    E --> L[Backend Team]
    F --> M[Product Managers]
    F --> N[Designers]`
  },
  {
    id: 'project-timeline',
    name: 'Project Timeline',
    description: 'Project phases and milestones',
    category: 'project',
    complexity: 'medium',
    tags: ['project', 'timeline', 'milestones'],
    thumbnail: '📅',
    code: `gantt
    title Project Implementation Timeline
    dateFormat YYYY-MM-DD
    section Planning
    Requirements Analysis    :done, req, 2024-01-01, 2024-01-15
    System Design          :done, design, after req, 10d
    section Development
    Backend Development     :active, backend, after design, 20d
    Frontend Development    :frontend, after design, 25d
    section Testing
    Unit Testing           :testing, after backend, 10d
    Integration Testing    :integration, after frontend, 15d
    section Deployment
    Production Deployment  :deploy, after integration, 5d
    Go Live               :milestone, after deploy, 1d`
  },
  {
    id: 'infinity-loop-process',
    name: 'Infinity Loop Process Flow',
    description: 'Continuous improvement process with interconnected phases and text annotations',
    category: 'process',
    featured: true,
    complexity: 'medium',
    tags: ['Continuous Improvement', 'Process Loop', 'Infinity', 'Cycle'],
    thumbnail: '∞',
    code: `flowchart TD
    subgraph "Continuous Improvement Loop"
        A[("1<br/>🔒<br/>Security<br/>Assessment")]
        B[("2<br/>📊<br/>Risk<br/>Analysis")]
        C[("3<br/>🛡️<br/>Implementation<br/>Planning")]
        D[("4<br/>⚙️<br/>Process<br/>Execution")]
        E[("5<br/>📋<br/>Monitoring<br/>& Review")]
        F[("6<br/>🎯<br/>Optimization<br/>& Feedback")]

        A --> B
        B --> C
        C --> D
        D --> E
        E --> F
        F --> A
    end

    %% Text annotations around the loop
    TA["Title Here<br/><small>Lorem ipsum dolor sit amet,<br/>consectetur adipiscing elit</small>"]
    TB["Title Here<br/><small>Lorem ipsum dolor sit amet,<br/>consectetur adipiscing elit</small>"]
    TC["Title Here<br/><small>Lorem ipsum dolor sit amet,<br/>consectetur adipiscing elit</small>"]
    TD["Title Here<br/><small>Lorem ipsum dolor sit amet,<br/>consectetur adipiscing elit</small>"]
    TE["Title Here<br/><small>Lorem ipsum dolor sit amet,<br/>consectetur adipiscing elit</small>"]
    TF["Title Here<br/><small>Lorem ipsum dolor sit amet,<br/>consectetur adipiscing elit</small>"]

    %% Styling for infinity loop appearance
    style A fill:#3b82f6,stroke:#fff,stroke-width:3px,color:#fff
    style B fill:#8b5cf6,stroke:#fff,stroke-width:3px,color:#fff
    style C fill:#06b6d4,stroke:#fff,stroke-width:3px,color:#fff
    style D fill:#8b5cf6,stroke:#fff,stroke-width:3px,color:#fff
    style E fill:#d946ef,stroke:#fff,stroke-width:3px,color:#fff
    style F fill:#3b82f6,stroke:#fff,stroke-width:3px,color:#fff

    %% Text box styling
    style TA fill:transparent,stroke:none,color:#1e293b
    style TB fill:transparent,stroke:none,color:#1e293b
    style TC fill:transparent,stroke:none,color:#1e293b
    style TD fill:transparent,stroke:none,color:#1e293b
    style TE fill:transparent,stroke:none,color:#1e293b
    style TF fill:transparent,stroke:none,color:#1e293b`
  }
];

export const MermaidTemplatePanel: React.FC<MermaidTemplatePanelProps> = ({
  onTemplateSelect,
  isVisible,
  onHide
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredTemplates, setFilteredTemplates] = useState(MERMAID_TEMPLATES);

  // Filter templates based on category and search
  useEffect(() => {
    let filtered = MERMAID_TEMPLATES;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredTemplates(filtered);
  }, [selectedCategory, searchQuery]);

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
      {/* Hide Side Panel Button - Right border, center high */}
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
      {/* Header */}
      <GlassPanel variant="elevated" padding="4" style={{
        borderRadius: 0,
        borderBottom: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between'
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{
              margin: 0,
              fontSize: MermaidDesignTokens.typography.fontSize.lg,
              fontWeight: MermaidDesignTokens.typography.fontWeight.semibold,
              color: MermaidDesignTokens.colors.text.primary,
              display: 'flex',
              alignItems: 'center',
              gap: MermaidDesignTokens.spacing[2]
            }}>
              <Grid3X3 size={20} />
              Process Flow Templates
            </h2>
            <p style={{
              margin: `${MermaidDesignTokens.spacing[2]} 0 0 0`,
              fontSize: MermaidDesignTokens.typography.fontSize.sm,
              color: MermaidDesignTokens.colors.text.secondary
            }}>
              Beautiful templates with large thumbnails and live content preview
            </p>
          </div>
          {/* Remove the cross button from top right */}
        </div>
      </GlassPanel>

      {/* Search and Controls */}
      <div style={{ padding: MermaidDesignTokens.spacing[4] }}>
        <GlassInput
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: MermaidDesignTokens.spacing[3] }}
          icon={<Search size={16} />}
        />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: MermaidDesignTokens.spacing[3]
        }}>
          <div style={{ display: 'flex', gap: MermaidDesignTokens.spacing[1] }}>
            <GlassButton
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              icon={<Grid3X3 size={16} />}
              onClick={() => setViewMode('grid')}
            />
            <GlassButton
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              icon={<List size={16} />}
              onClick={() => setViewMode('list')}
            />
          </div>
          <span style={{
            fontSize: MermaidDesignTokens.typography.fontSize.sm,
            color: MermaidDesignTokens.colors.text.secondary
          }}>
            {filteredTemplates.length} templates
          </span>
        </div>
      </div>

      {/* Categories */}
      <div style={{
        padding: `0 ${MermaidDesignTokens.spacing[4]}`,
        marginBottom: MermaidDesignTokens.spacing[4]
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: MermaidDesignTokens.spacing[1]
        }}>
          {TEMPLATE_CATEGORIES.map(category => {
            const Icon = category.icon;
            return (
              <GlassButton
                key={category.id}
                variant={selectedCategory === category.id ? 'primary' : 'ghost'}
                size="sm"
                icon={<Icon size={14} />}
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  fontSize: MermaidDesignTokens.typography.fontSize.xs,
                  padding: `${MermaidDesignTokens.spacing[1]} ${MermaidDesignTokens.spacing[2]}`
                }}
              >
                {category.name}
              </GlassButton>
            );
          })}
        </div>
      </div>

      {/* Templates Grid/List */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: `0 ${MermaidDesignTokens.spacing[4]} ${MermaidDesignTokens.spacing[4]}`
      }}>
        {viewMode === 'grid' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: MermaidDesignTokens.spacing[3]
          }}>
            {filteredTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={onTemplateSelect}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: MermaidDesignTokens.spacing[2] }}>
            {filteredTemplates.map(template => (
              <TemplateListItem
                key={template.id}
                template={template}
                onSelect={onTemplateSelect}
              />
            ))}
          </div>
        )}

        {filteredTemplates.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: MermaidDesignTokens.spacing[8],
            color: MermaidDesignTokens.colors.text.secondary
          }}>
            <Search size={48} style={{ opacity: 0.3, marginBottom: MermaidDesignTokens.spacing[4] }} />
            <h3 style={{ margin: 0, fontSize: MermaidDesignTokens.typography.fontSize.lg }}>
              No templates found
            </h3>
            <p style={{ margin: `${MermaidDesignTokens.spacing[2]} 0 0 0` }}>
              Try adjusting your search or category filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Template Card Component
const TemplateCard: React.FC<{
  template: MermaidTemplate;
  onSelect: (template: MermaidTemplate) => void;
}> = ({ template, onSelect }) => {
  return (
    <GlassPanel
      variant="elevated"
      padding="3"
      style={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
        ':hover': {
          transform: 'translateY(-2px)',
          boxShadow: MermaidDesignTokens.shadows.glass.lg
        }
      }}
      onClick={() => onSelect(template)}
    >
      {/* Thumbnail */}
      <div style={{
        width: '100%',
        height: '120px',
        background: MermaidDesignTokens.colors.primary.gradient,
        borderRadius: MermaidDesignTokens.borderRadius.lg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '48px',
        marginBottom: MermaidDesignTokens.spacing[3],
        position: 'relative',
        overflow: 'hidden'
      }}>
        {template.thumbnail}
        {template.featured && (
          <div style={{
            position: 'absolute',
            top: MermaidDesignTokens.spacing[2],
            right: MermaidDesignTokens.spacing[2],
            background: MermaidDesignTokens.colors.accent.purple,
            borderRadius: MermaidDesignTokens.borderRadius.full,
            padding: MermaidDesignTokens.spacing[1],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Star size={12} fill="white" />
          </div>
        )}
      </div>

      {/* Content */}
      <h3 style={{
        margin: 0,
        fontSize: MermaidDesignTokens.typography.fontSize.base,
        fontWeight: MermaidDesignTokens.typography.fontWeight.semibold,
        color: MermaidDesignTokens.colors.text.primary,
        marginBottom: MermaidDesignTokens.spacing[1]
      }}>
        {template.name}
      </h3>

      <p style={{
        margin: 0,
        fontSize: MermaidDesignTokens.typography.fontSize.sm,
        color: MermaidDesignTokens.colors.text.secondary,
        lineHeight: MermaidDesignTokens.typography.lineHeight.snug,
        marginBottom: MermaidDesignTokens.spacing[2]
      }}>
        {template.description}
      </p>

      {/* Tags */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: MermaidDesignTokens.spacing[1]
      }}>
        {template.tags.slice(0, 3).map(tag => (
          <span
            key={tag}
            style={{
              fontSize: MermaidDesignTokens.typography.fontSize.xs,
              padding: `${MermaidDesignTokens.spacing[0.5]} ${MermaidDesignTokens.spacing[1.5]}`,
              background: MermaidDesignTokens.colors.glass.primary,
              border: `1px solid ${MermaidDesignTokens.colors.glass.border}`,
              borderRadius: MermaidDesignTokens.borderRadius.full,
              color: MermaidDesignTokens.colors.text.secondary
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </GlassPanel>
  );
};

// Template List Item Component
const TemplateListItem: React.FC<{
  template: MermaidTemplate;
  onSelect: (template: MermaidTemplate) => void;
}> = ({ template, onSelect }) => {
  return (
    <GlassPanel
      variant="primary"
      padding="3"
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: MermaidDesignTokens.spacing[3]
      }}
      onClick={() => onSelect(template)}
    >
      <div style={{
        width: '48px',
        height: '48px',
        background: MermaidDesignTokens.colors.primary.gradient,
        borderRadius: MermaidDesignTokens.borderRadius.lg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        flexShrink: 0
      }}>
        {template.thumbnail}
      </div>

      <div style={{ flex: 1 }}>
        <h4 style={{
          margin: 0,
          fontSize: MermaidDesignTokens.typography.fontSize.sm,
          fontWeight: MermaidDesignTokens.typography.fontWeight.medium,
          color: MermaidDesignTokens.colors.text.primary
        }}>
          {template.name}
        </h4>
        <p style={{
          margin: 0,
          fontSize: MermaidDesignTokens.typography.fontSize.xs,
          color: MermaidDesignTokens.colors.text.secondary
        }}>
          {template.description}
        </p>
      </div>
    </GlassPanel>
  );
};

export default MermaidTemplatePanel;
