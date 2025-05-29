# Mermaid.js Integration & Editor Revamp Plan

## Overview
This document outlines the comprehensive plan to revamp our AuditReady Graphical Editor using Mermaid.js framework, creating a stunning, modern, and professional-grade diagramming tool with best-in-class UI/UX.

---

## 🎯 Vision Statement
Transform our editor into a world-class diagramming platform that combines:
- **Mermaid.js Power**: Full integration with Mermaid's extensive diagram types and syntax
- **Stunning Design**: Modern, dark gradient blue theme with professional aesthetics
- **AI-Powered Intelligence**: Enhanced AI flowchart generation with Mermaid compatibility
- **Enterprise Features**: Advanced collaboration, export, and template management
- **Seamless UX**: Intuitive interface following best practices from Figma, Linear, and modern design tools

---

## 📋 15-Point Project Plan

### Phase 1: Foundation & Architecture (Points 1-5)

#### 1. **Mermaid.js Core Integration**
- Install and configure Mermaid.js as primary rendering engine
- Replace Fabric.js with Mermaid for diagram rendering
- Implement Mermaid parser and renderer integration
- Create abstraction layer for backward compatibility
- Set up Mermaid configuration and theming system

#### 2. **Modern Design System Overhaul**
- Implement stunning dark gradient blue theme
- Create comprehensive design tokens for the new aesthetic
- Design modern component library with glassmorphism effects
- Implement smooth animations and micro-interactions
- Create responsive layout system with proper spacing

#### 3. **Architecture Refactoring**
- Restructure codebase to support Mermaid-first approach
- Create new diagram type system aligned with Mermaid
- Implement unified data models for all diagram types
- Set up proper TypeScript interfaces for Mermaid integration
- Create plugin architecture for extensibility

#### 4. **Enhanced Template System**
- Redesign template gallery with modern card-based UI
- Create Mermaid-native templates for all diagram types
- Implement template preview with live Mermaid rendering
- Add template categorization and search functionality
- Create template import/export with Mermaid syntax

#### 5. **AI Integration Enhancement**
- Upgrade AI flowchart generator to output Mermaid syntax
- Implement intelligent diagram type detection
- Create domain-specific AI templates (audit, risk, compliance)
- Add natural language to Mermaid conversion
- Implement AI-powered diagram optimization

### Phase 2: Core Features & UI (Points 6-10)

#### 6. **Stunning Header & Navigation Redesign**
- Create glassmorphic header with dark gradient blue background
- Implement floating action buttons with smooth hover effects
- Add breadcrumb navigation with modern typography
- Create contextual toolbar that adapts to selected diagram type
- Implement search functionality with instant results

#### 7. **Revolutionary Sidebar Experience**
- Design collapsible sidebar with smooth animations
- Create tabbed interface for different tool categories
- Implement drag-and-drop from sidebar to canvas
- Add real-time preview of elements before placement
- Create smart categorization with visual icons

#### 8. **Canvas & Rendering Engine**
- Implement Mermaid-powered canvas with zoom/pan controls
- Create infinite canvas with smart viewport management
- Add grid system with customizable spacing
- Implement real-time collaboration cursors
- Create export functionality with multiple formats

#### 9. **Properties Panel Revolution**
- Design context-aware properties panel
- Implement live preview of changes
- Create advanced styling options for Mermaid elements
- Add bulk editing capabilities
- Implement property templates and presets

#### 10. **Advanced Diagram Types Support**
- Implement all Mermaid diagram types (flowchart, sequence, gantt, etc.)
- Create audit-specific diagram extensions
- Add custom node types for compliance frameworks
- Implement diagram validation and error checking
- Create diagram conversion between types

### Phase 3: Advanced Features & Polish (Points 11-15)

#### 11. **AI-Powered Diagram Generation 2.0**
- Implement GPT-4 integration for natural language processing
- Create intelligent diagram suggestions based on content
- Add auto-layout optimization using AI
- Implement smart connector routing
- Create diagram completion and enhancement suggestions

#### 12. **Collaboration & Real-time Features**
- Implement real-time collaborative editing
- Add user presence indicators and cursors
- Create comment and annotation system
- Implement version control and change tracking
- Add team workspace management

#### 13. **Export & Integration Ecosystem**
- Create advanced export options (SVG, PNG, PDF, Mermaid syntax)
- Implement integration with popular tools (Notion, Confluence, etc.)
- Add API for third-party integrations
- Create embeddable widget for external sites
- Implement batch export and processing

#### 14. **Performance & Optimization**
- Implement virtual rendering for large diagrams
- Create smart caching system for templates and assets
- Optimize Mermaid rendering performance
- Implement progressive loading for complex diagrams
- Add performance monitoring and analytics

#### 15. **Enterprise Features & Security**
- Implement enterprise-grade authentication
- Add role-based access control
- Create audit trails and compliance reporting
- Implement data encryption and security measures
- Add enterprise deployment options

---

## 🎨 Design Specifications

### Color Palette
```css
/* Primary Dark Gradient Blue Theme */
--primary-gradient: linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #1e1b4b 100%);
--secondary-gradient: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
--accent-blue: #3b82f6;
--accent-cyan: #06b6d4;
--surface-glass: rgba(255, 255, 255, 0.1);
--surface-elevated: rgba(255, 255, 255, 0.05);
--text-primary: #f8fafc;
--text-secondary: #cbd5e1;
--border-glass: rgba(255, 255, 255, 0.2);
```

### Typography
```css
/* Modern Typography Stack */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', monospace;
--font-display: 'Cal Sans', 'Inter', sans-serif;
```

### Glassmorphism Effects
```css
/* Glass Components */
.glass-panel {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```

---

## 🚀 Implementation Strategy

### Week 1-2: Foundation Setup
- Install Mermaid.js and configure build system
- Create new design system with dark gradient theme
- Set up TypeScript interfaces for Mermaid integration
- Begin architecture refactoring

### Week 3-4: Core UI Components
- Implement new header and navigation
- Create modern sidebar with glassmorphic design
- Build canvas component with Mermaid integration
- Design properties panel with live preview

### Week 5-6: Diagram Types & Templates
- Implement all Mermaid diagram types
- Create audit-specific templates
- Build template gallery with modern UI
- Add template import/export functionality

### Week 7-8: AI & Advanced Features
- Upgrade AI integration for Mermaid output
- Implement collaboration features
- Add advanced export options
- Create performance optimizations

### Week 9-10: Polish & Testing
- Implement animations and micro-interactions
- Add comprehensive error handling
- Create extensive testing suite
- Optimize performance and accessibility

---

## 📊 Success Metrics

### User Experience
- **Load Time**: < 2 seconds for initial render
- **Interaction Response**: < 100ms for all UI interactions
- **Diagram Rendering**: < 500ms for complex diagrams
- **User Satisfaction**: > 95% positive feedback

### Technical Performance
- **Bundle Size**: < 2MB total JavaScript
- **Memory Usage**: < 100MB for large diagrams
- **CPU Usage**: < 30% during active editing
- **Accessibility**: WCAG 2.1 AA compliance

### Feature Adoption
- **Template Usage**: > 80% of users use templates
- **AI Generation**: > 60% of diagrams use AI assistance
- **Collaboration**: > 40% of teams use real-time features
- **Export**: > 90% of diagrams are exported

---

## 🔧 Technical Architecture

### Core Dependencies
```json
{
  "mermaid": "^10.6.0",
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "framer-motion": "^10.0.0",
  "zustand": "^4.4.0",
  "react-query": "^5.0.0"
}
```

### Folder Structure
```
src/
├── components/
│   ├── editor/
│   │   ├── MermaidCanvas/
│   │   ├── ModernSidebar/
│   │   ├── GlassHeader/
│   │   └── PropertiesPanel/
│   ├── ui/
│   │   ├── design-system/
│   │   ├── animations/
│   │   └── glassmorphic/
│   └── templates/
├── services/
│   ├── mermaid/
│   ├── ai/
│   └── collaboration/
├── types/
│   ├── mermaid.ts
│   ├── diagrams.ts
│   └── editor.ts
└── utils/
    ├── mermaid-parser/
    ├── export/
    └── performance/
```

---

## 🎯 Detailed Implementation Guide

### **PHASE 1 - POINT 1: Mermaid.js Core Integration**

#### **Step 1.1: Install Mermaid.js Dependencies**
```bash
# Install core Mermaid.js package
npm install mermaid@^10.6.0

# Install additional dependencies for enhanced functionality
npm install @types/d3@^7.4.3
npm install d3@^7.9.0

# Install Mermaid-related utilities
npm install @mermaid-js/mermaid@^10.6.0
```

#### **Step 1.2: Create Mermaid Service Architecture**
Create the following file structure:
```
src/services/mermaid/
├── MermaidService.ts          # Main service class
├── MermaidRenderer.ts         # Rendering engine wrapper
├── MermaidParser.ts           # Text parsing utilities
├── MermaidThemeManager.ts     # Theme and styling management
├── MermaidExporter.ts         # Export functionality
└── types/
    ├── mermaid-config.ts      # Mermaid configuration types
    ├── diagram-types.ts       # Diagram type definitions
    └── theme-types.ts         # Theme configuration types
```

#### **Step 1.3: Implement MermaidService.ts**
```typescript
/**
 * Core Mermaid.js Service
 * Handles initialization, configuration, and lifecycle management
 */
import mermaid from 'mermaid';
import { MermaidConfig, DiagramType, RenderOptions } from './types/mermaid-config';

export class MermaidService {
  private static instance: MermaidService;
  private isInitialized: boolean = false;
  private config: MermaidConfig;

  private constructor() {
    this.config = this.getDefaultConfig();
  }

  public static getInstance(): MermaidService {
    if (!MermaidService.instance) {
      MermaidService.instance = new MermaidService();
    }
    return MermaidService.instance;
  }

  /**
   * Initialize Mermaid with AuditReady-specific configuration
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      mermaid.initialize(this.config);
      this.isInitialized = true;
      console.log('✅ Mermaid.js initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Mermaid.js:', error);
      throw new Error('Mermaid initialization failed');
    }
  }

  /**
   * Get default configuration optimized for AuditReady
   */
  private getDefaultConfig(): MermaidConfig {
    return {
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#3b82f6',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#1e40af',
        lineColor: '#64748b',
        sectionBkgColor: '#1e293b',
        altSectionBkgColor: '#334155',
        gridColor: '#475569',
        secondaryColor: '#06b6d4',
        tertiaryColor: '#8b5cf6'
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      sequence: {
        diagramMarginX: 50,
        diagramMarginY: 10,
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35
      },
      gantt: {
        titleTopMargin: 25,
        barHeight: 20,
        fontFamily: 'Inter, sans-serif',
        fontSize: 11,
        gridLineStartPadding: 35,
        bottomPadding: 25,
        leftPadding: 75,
        rightPadding: 35
      },
      securityLevel: 'loose',
      deterministicIds: true,
      maxTextSize: 50000
    };
  }

  /**
   * Render diagram from Mermaid text
   */
  public async renderDiagram(
    text: string,
    elementId: string,
    options?: RenderOptions
  ): Promise<{ svg: string; bindFunctions?: any }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const result = await mermaid.render(elementId, text);
      console.log('✅ Diagram rendered successfully');
      return result;
    } catch (error) {
      console.error('❌ Failed to render diagram:', error);
      throw new Error(`Diagram rendering failed: ${error.message}`);
    }
  }

  /**
   * Update Mermaid configuration
   */
  public updateConfig(newConfig: Partial<MermaidConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (this.isInitialized) {
      mermaid.initialize(this.config);
    }
  }

  /**
   * Get supported diagram types
   */
  public getSupportedDiagramTypes(): DiagramType[] {
    return [
      'flowchart',
      'sequence',
      'classDiagram',
      'stateDiagram',
      'entityRelationshipDiagram',
      'userJourney',
      'gantt',
      'pieChart',
      'requirementDiagram',
      'gitgraph',
      'mindmap',
      'timeline',
      'quadrantChart',
      'sankey'
    ];
  }

  /**
   * Validate Mermaid syntax
   */
  public validateSyntax(text: string): { isValid: boolean; errors?: string[] } {
    try {
      // Use Mermaid's internal parser to validate
      mermaid.parse(text);
      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        errors: [error.message]
      };
    }
  }
}
```

#### **Step 1.4: Create MermaidRenderer.ts**
```typescript
/**
 * Mermaid Rendering Engine Wrapper
 * Handles canvas integration and rendering lifecycle
 */
import { MermaidService } from './MermaidService';
import { RenderOptions, DiagramMetadata } from './types/mermaid-config';

export class MermaidRenderer {
  private mermaidService: MermaidService;
  private containerElement: HTMLElement | null = null;
  private currentDiagramId: string | null = null;

  constructor() {
    this.mermaidService = MermaidService.getInstance();
  }

  /**
   * Set the container element for rendering
   */
  public setContainer(element: HTMLElement): void {
    this.containerElement = element;
  }

  /**
   * Render diagram in the container
   */
  public async renderToContainer(
    mermaidText: string,
    options?: RenderOptions
  ): Promise<DiagramMetadata> {
    if (!this.containerElement) {
      throw new Error('Container element not set');
    }

    const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.currentDiagramId = diagramId;

    try {
      const { svg } = await this.mermaidService.renderDiagram(
        mermaidText,
        diagramId,
        options
      );

      // Clear container and insert new SVG
      this.containerElement.innerHTML = svg;

      // Apply AuditReady-specific styling
      this.applyCustomStyling();

      // Extract metadata
      const metadata = this.extractDiagramMetadata(svg);

      console.log('✅ Diagram rendered to container successfully');
      return metadata;
    } catch (error) {
      console.error('❌ Failed to render diagram to container:', error);
      throw error;
    }
  }

  /**
   * Apply custom styling to rendered SVG
   */
  private applyCustomStyling(): void {
    if (!this.containerElement) return;

    const svg = this.containerElement.querySelector('svg');
    if (!svg) return;

    // Apply AuditReady theme styling
    svg.style.background = 'transparent';
    svg.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';

    // Add glassmorphic effects to nodes
    const nodes = svg.querySelectorAll('.node rect, .node circle, .node polygon');
    nodes.forEach(node => {
      const element = node as SVGElement;
      element.style.filter = 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))';
      element.style.backdropFilter = 'blur(10px)';
    });

    // Style text elements
    const textElements = svg.querySelectorAll('text');
    textElements.forEach(text => {
      text.style.fontFamily = 'Inter, sans-serif';
      text.style.fontWeight = '500';
    });
  }

  /**
   * Extract metadata from rendered SVG
   */
  private extractDiagramMetadata(svg: string): DiagramMetadata {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');

    if (!svgElement) {
      throw new Error('Invalid SVG content');
    }

    const viewBox = svgElement.getAttribute('viewBox');
    const [x, y, width, height] = viewBox ? viewBox.split(' ').map(Number) : [0, 0, 0, 0];

    return {
      id: this.currentDiagramId!,
      width,
      height,
      viewBox: { x, y, width, height },
      nodeCount: doc.querySelectorAll('.node').length,
      edgeCount: doc.querySelectorAll('.edge').length,
      diagramType: this.detectDiagramType(svg)
    };
  }

  /**
   * Detect diagram type from SVG content
   */
  private detectDiagramType(svg: string): string {
    if (svg.includes('flowchart')) return 'flowchart';
    if (svg.includes('sequenceDiagram')) return 'sequence';
    if (svg.includes('classDiagram')) return 'class';
    if (svg.includes('stateDiagram')) return 'state';
    if (svg.includes('gantt')) return 'gantt';
    if (svg.includes('pie')) return 'pie';
    if (svg.includes('mindmap')) return 'mindmap';
    return 'unknown';
  }

  /**
   * Export current diagram as SVG
   */
  public exportAsSVG(): string | null {
    if (!this.containerElement) return null;

    const svg = this.containerElement.querySelector('svg');
    return svg ? svg.outerHTML : null;
  }

  /**
   * Export current diagram as PNG
   */
  public async exportAsPNG(scale: number = 2): Promise<Blob | null> {
    const svg = this.exportAsSVG();
    if (!svg) return null;

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx?.scale(scale, scale);
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob(resolve, 'image/png');
      };

      const blob = new Blob([svg], { type: 'image/svg+xml' });
      img.src = URL.createObjectURL(blob);
    });
  }

  /**
   * Clear the container
   */
  public clear(): void {
    if (this.containerElement) {
      this.containerElement.innerHTML = '';
    }
    this.currentDiagramId = null;
  }
}
```

#### **Step 1.5: Create Type Definitions**
Create `src/services/mermaid/types/mermaid-config.ts`:
```typescript
/**
 * Mermaid Configuration Types
 * Comprehensive type definitions for Mermaid.js integration
 */

export interface MermaidConfig {
  startOnLoad: boolean;
  theme: 'default' | 'dark' | 'forest' | 'neutral';
  themeVariables: ThemeVariables;
  flowchart: FlowchartConfig;
  sequence: SequenceConfig;
  gantt: GanttConfig;
  securityLevel: 'strict' | 'loose' | 'antiscript' | 'sandbox';
  deterministicIds: boolean;
  maxTextSize: number;
}

export interface ThemeVariables {
  primaryColor: string;
  primaryTextColor: string;
  primaryBorderColor: string;
  lineColor: string;
  sectionBkgColor: string;
  altSectionBkgColor: string;
  gridColor: string;
  secondaryColor: string;
  tertiaryColor: string;
}

export interface FlowchartConfig {
  useMaxWidth: boolean;
  htmlLabels: boolean;
  curve: 'basis' | 'linear' | 'cardinal';
}

export interface SequenceConfig {
  diagramMarginX: number;
  diagramMarginY: number;
  actorMargin: number;
  width: number;
  height: number;
  boxMargin: number;
  boxTextMargin: number;
  noteMargin: number;
  messageMargin: number;
}

export interface GanttConfig {
  titleTopMargin: number;
  barHeight: number;
  fontFamily: string;
  fontSize: number;
  gridLineStartPadding: number;
  bottomPadding: number;
  leftPadding: number;
  rightPadding: number;
}

export interface RenderOptions {
  theme?: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
}

export interface DiagramMetadata {
  id: string;
  width: number;
  height: number;
  viewBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  nodeCount: number;
  edgeCount: number;
  diagramType: string;
}

export type DiagramType =
  | 'flowchart'
  | 'sequence'
  | 'classDiagram'
  | 'stateDiagram'
  | 'entityRelationshipDiagram'
  | 'userJourney'
  | 'gantt'
  | 'pieChart'
  | 'requirementDiagram'
  | 'gitgraph'
  | 'mindmap'
  | 'timeline'
  | 'quadrantChart'
  | 'sankey';
```

#### **Step 1.6: Create Abstraction Layer for Backward Compatibility**
Create `src/services/mermaid/MermaidFabricBridge.ts`:
```typescript
/**
 * Bridge between Mermaid.js and existing Fabric.js code
 * Provides backward compatibility during migration
 */
import { MermaidRenderer } from './MermaidRenderer';
import { DiagramTemplate } from '../../types/diagram/types';

export class MermaidFabricBridge {
  private mermaidRenderer: MermaidRenderer;

  constructor() {
    this.mermaidRenderer = new MermaidRenderer();
  }

  /**
   * Convert Fabric.js diagram template to Mermaid syntax
   */
  public convertFabricToMermaid(template: DiagramTemplate): string {
    const { nodes, edges } = template;

    // Start with flowchart syntax
    let mermaidText = 'flowchart TD\n';

    // Add nodes
    nodes.forEach(node => {
      const nodeId = this.sanitizeId(node.id);
      const label = node.label || node.id;

      // Determine node shape based on type
      let nodeDefinition = '';
      switch (node.type) {
        case 'start':
          nodeDefinition = `${nodeId}([${label}])`;
          break;
        case 'end':
          nodeDefinition = `${nodeId}([${label}])`;
          break;
        case 'decision':
          nodeDefinition = `${nodeId}{${label}}`;
          break;
        case 'process':
        default:
          nodeDefinition = `${nodeId}[${label}]`;
          break;
      }

      mermaidText += `    ${nodeDefinition}\n`;
    });

    // Add edges
    edges.forEach(edge => {
      const sourceId = this.sanitizeId(edge.source);
      const targetId = this.sanitizeId(edge.target);
      const label = edge.label ? `|${edge.label}|` : '';

      mermaidText += `    ${sourceId} -->${label} ${targetId}\n`;
    });

    return mermaidText;
  }

  /**
   * Sanitize ID for Mermaid compatibility
   */
  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  /**
   * Render Fabric template using Mermaid
   */
  public async renderFabricTemplate(
    template: DiagramTemplate,
    container: HTMLElement
  ): Promise<void> {
    const mermaidText = this.convertFabricToMermaid(template);
    this.mermaidRenderer.setContainer(container);
    await this.mermaidRenderer.renderToContainer(mermaidText);
  }
}
```

#### **Step 1.7: Integration Testing Setup**
Create `src/services/mermaid/__tests__/MermaidService.test.ts`:
```typescript
/**
 * Test suite for Mermaid.js integration
 */
import { MermaidService } from '../MermaidService';

describe('MermaidService', () => {
  let service: MermaidService;

  beforeEach(() => {
    service = MermaidService.getInstance();
  });

  test('should initialize successfully', async () => {
    await expect(service.initialize()).resolves.not.toThrow();
  });

  test('should validate correct Mermaid syntax', () => {
    const validSyntax = `
      flowchart TD
        A[Start] --> B[Process]
        B --> C[End]
    `;

    const result = service.validateSyntax(validSyntax);
    expect(result.isValid).toBe(true);
  });

  test('should detect invalid Mermaid syntax', () => {
    const invalidSyntax = 'invalid mermaid syntax';

    const result = service.validateSyntax(invalidSyntax);
    expect(result.isValid).toBe(false);
    expect(result.errors).toBeDefined();
  });

  test('should return supported diagram types', () => {
    const types = service.getSupportedDiagramTypes();
    expect(types).toContain('flowchart');
    expect(types).toContain('sequence');
    expect(types).toContain('gantt');
  });
});
```

#### **Step 1.8: Update Package.json Scripts**
Add these scripts to package.json:
```json
{
  "scripts": {
    "test:mermaid": "jest src/services/mermaid",
    "build:mermaid": "tsc --project tsconfig.mermaid.json",
    "dev:mermaid": "npm run test:mermaid -- --watch"
  }
}
```

#### **Step 1.9: Create Mermaid-specific TSConfig**
Create `tsconfig.mermaid.json`:
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist/mermaid",
    "rootDir": "./src/services/mermaid"
  },
  "include": [
    "src/services/mermaid/**/*"
  ],
  "exclude": [
    "src/services/mermaid/**/*.test.ts"
  ]
}
```

#### **Step 1.10: Documentation and Examples**
Create `src/services/mermaid/README.md`:
```markdown
# Mermaid.js Integration Service

## Overview
This service provides a complete integration layer between AuditReady Editor and Mermaid.js, enabling powerful diagram rendering with modern styling and audit-specific features.

## Quick Start
```typescript
import { MermaidService, MermaidRenderer } from './services/mermaid';

// Initialize service
const service = MermaidService.getInstance();
await service.initialize();

// Render a diagram
const renderer = new MermaidRenderer();
renderer.setContainer(document.getElementById('diagram-container'));

const mermaidText = `
  flowchart TD
    A[Audit Planning] --> B[Risk Assessment]
    B --> C[Fieldwork]
    C --> D[Reporting]
`;

await renderer.renderToContainer(mermaidText);
```

## Features
- ✅ Full Mermaid.js integration
- ✅ AuditReady theme support
- ✅ Backward compatibility with Fabric.js
- ✅ TypeScript support
- ✅ Export functionality (SVG, PNG)
- ✅ Syntax validation
- ✅ Performance optimization

## Supported Diagram Types
- Flowcharts
- Sequence Diagrams
- Gantt Charts
- Class Diagrams
- State Diagrams
- Entity Relationship Diagrams
- User Journey Maps
- Pie Charts
- Requirement Diagrams
- Git Graphs
- Mind Maps
- Timelines
- Quadrant Charts
- Sankey Diagrams

## Configuration
The service comes pre-configured with AuditReady-optimized settings, but can be customized:

```typescript
service.updateConfig({
  theme: 'dark',
  themeVariables: {
    primaryColor: '#your-color'
  }
});
```
```

### **Completion Checklist for Step 1**
- [ ] Install Mermaid.js dependencies
- [ ] Create service architecture files
- [ ] Implement MermaidService class
- [ ] Implement MermaidRenderer class
- [ ] Create type definitions
- [ ] Build backward compatibility bridge
- [ ] Set up testing framework
- [ ] Update build configuration
- [ ] Create documentation
- [ ] Test integration with existing codebase

### **Success Criteria**
- ✅ Mermaid.js renders diagrams successfully
- ✅ AuditReady theme is applied correctly
- ✅ Existing Fabric.js templates can be converted
- ✅ All tests pass
- ✅ Performance meets requirements (< 500ms render time)
- ✅ TypeScript compilation succeeds
- ✅ Documentation is complete and accurate

### **Next Step Preview**
After completing Step 1, proceed to **Step 2: Modern Design System Overhaul**, which will involve:
- Creating the dark gradient blue theme
- Implementing glassmorphism effects
- Building the new component library
- Setting up animation systems

---

## 📚 References & Inspiration

### Design Inspiration
- **Figma**: Modern interface design and component system
- **Linear**: Clean typography and smooth animations
- **Notion**: Intuitive user experience and functionality
- **Framer**: Advanced animation and interaction patterns

### Technical References
- [Mermaid.js Documentation](https://mermaid.js.org/)
- [Mermaid GitHub Repository](https://github.com/mermaid-js/mermaid)
- [Glassmorphism Design Principles](https://uxdesign.cc/glassmorphism-in-user-interfaces-1f39bb1308c9)
- [Modern Design System Guidelines](https://designsystem.digital.gov/)

---

*This document will be continuously updated as the project progresses. Last updated: December 2024*