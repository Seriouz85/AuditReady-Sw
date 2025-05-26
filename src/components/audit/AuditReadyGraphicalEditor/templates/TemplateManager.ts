import * as fabric from 'fabric';
import { AUDIT_COLORS } from '../core/fabric-utils';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'flowchart' | 'orgchart' | 'timeline' | 'process' | 'custom';
  thumbnail: string;
  data: any; // Fabric.js JSON data
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  templates: Template[];
}

export class TemplateManager {
  private canvas: fabric.Canvas;
  private templates: Map<string, Template> = new Map();
  private categories: Map<string, TemplateCategory> = new Map();

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates(): void {
    // Flowchart Templates
    this.addTemplate({
      id: 'simple-flowchart',
      name: 'Simple Flowchart',
      description: 'Basic flowchart with start, process, and end nodes',
      category: 'flowchart',
      thumbnail: '',
      data: this.createSimpleFlowchartData(),
      tags: ['flowchart', 'process', 'basic'],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.addTemplate({
      id: 'decision-flowchart',
      name: 'Decision Flowchart',
      description: 'Flowchart with decision points and branches',
      category: 'flowchart',
      thumbnail: '',
      data: this.createDecisionFlowchartData(),
      tags: ['flowchart', 'decision', 'branching'],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Organization Chart Templates
    this.addTemplate({
      id: 'basic-orgchart',
      name: 'Basic Org Chart',
      description: 'Simple organizational hierarchy',
      category: 'orgchart',
      thumbnail: '',
      data: this.createBasicOrgChartData(),
      tags: ['organization', 'hierarchy', 'team'],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Timeline Templates
    this.addTemplate({
      id: 'project-timeline',
      name: 'Project Timeline',
      description: 'Timeline for project milestones',
      category: 'timeline',
      thumbnail: '',
      data: this.createProjectTimelineData(),
      tags: ['timeline', 'project', 'milestones'],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Process Templates
    this.addTemplate({
      id: 'audit-process',
      name: 'Audit Process',
      description: 'Standard audit workflow process',
      category: 'process',
      thumbnail: '',
      data: this.createAuditProcessData(),
      tags: ['audit', 'process', 'workflow'],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.initializeCategories();
  }

  private initializeCategories(): void {
    this.categories.set('flowchart', {
      id: 'flowchart',
      name: 'Flowcharts',
      description: 'Process flows and decision trees',
      icon: 'GitBranch',
      templates: Array.from(this.templates.values()).filter(t => t.category === 'flowchart')
    });

    this.categories.set('orgchart', {
      id: 'orgchart',
      name: 'Organization Charts',
      description: 'Organizational hierarchies and structures',
      icon: 'Users',
      templates: Array.from(this.templates.values()).filter(t => t.category === 'orgchart')
    });

    this.categories.set('timeline', {
      id: 'timeline',
      name: 'Timelines',
      description: 'Project timelines and schedules',
      icon: 'Calendar',
      templates: Array.from(this.templates.values()).filter(t => t.category === 'timeline')
    });

    this.categories.set('process', {
      id: 'process',
      name: 'Processes',
      description: 'Business and audit processes',
      icon: 'Workflow',
      templates: Array.from(this.templates.values()).filter(t => t.category === 'process')
    });
  }

  private createSimpleFlowchartData(): any {
    return {
      version: '5.3.0',
      objects: [
        {
          type: 'ellipse',
          left: 150,
          top: 50,
          width: 120,
          height: 60,
          fill: AUDIT_COLORS.success,
          stroke: AUDIT_COLORS.successBorder,
          strokeWidth: 2,
          rx: 30,
          ry: 30
        },
        {
          type: 'i-text',
          left: 150,
          top: 50,
          text: 'Start',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: 'white',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        },
        {
          type: 'rect',
          left: 150,
          top: 150,
          width: 120,
          height: 60,
          fill: AUDIT_COLORS.primary,
          stroke: AUDIT_COLORS.primaryBorder,
          strokeWidth: 2,
          rx: 8,
          ry: 8
        },
        {
          type: 'i-text',
          left: 150,
          top: 150,
          text: 'Process',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: 'white',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        },
        {
          type: 'ellipse',
          left: 150,
          top: 250,
          width: 120,
          height: 60,
          fill: AUDIT_COLORS.error,
          stroke: AUDIT_COLORS.errorBorder,
          strokeWidth: 2,
          rx: 30,
          ry: 30
        },
        {
          type: 'i-text',
          left: 150,
          top: 250,
          text: 'End',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: 'white',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        }
      ]
    };
  }

  private createDecisionFlowchartData(): any {
    return {
      version: '5.3.0',
      objects: [
        {
          type: 'ellipse',
          left: 200,
          top: 50,
          width: 120,
          height: 60,
          fill: AUDIT_COLORS.success,
          stroke: AUDIT_COLORS.successBorder,
          strokeWidth: 2,
          rx: 30,
          ry: 30
        },
        {
          type: 'i-text',
          left: 200,
          top: 50,
          text: 'Start',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: 'white',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        },
        {
          type: 'polygon',
          left: 200,
          top: 150,
          width: 120,
          height: 80,
          fill: AUDIT_COLORS.warning,
          stroke: AUDIT_COLORS.warningBorder,
          strokeWidth: 2,
          points: [
            { x: 60, y: 0 },
            { x: 120, y: 40 },
            { x: 60, y: 80 },
            { x: 0, y: 40 }
          ]
        },
        {
          type: 'i-text',
          left: 200,
          top: 150,
          text: 'Decision?',
          fontSize: 14,
          fontFamily: 'Inter',
          fill: 'white',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        },
        {
          type: 'rect',
          left: 100,
          top: 250,
          width: 100,
          height: 60,
          fill: AUDIT_COLORS.primary,
          stroke: AUDIT_COLORS.primaryBorder,
          strokeWidth: 2,
          rx: 8,
          ry: 8
        },
        {
          type: 'i-text',
          left: 100,
          top: 250,
          text: 'Yes Path',
          fontSize: 14,
          fontFamily: 'Inter',
          fill: 'white',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        },
        {
          type: 'rect',
          left: 300,
          top: 250,
          width: 100,
          height: 60,
          fill: AUDIT_COLORS.primary,
          stroke: AUDIT_COLORS.primaryBorder,
          strokeWidth: 2,
          rx: 8,
          ry: 8
        },
        {
          type: 'i-text',
          left: 300,
          top: 250,
          text: 'No Path',
          fontSize: 14,
          fontFamily: 'Inter',
          fill: 'white',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        }
      ]
    };
  }

  private createBasicOrgChartData(): any {
    return {
      version: '5.3.0',
      objects: [
        {
          type: 'rect',
          left: 200,
          top: 50,
          width: 140,
          height: 80,
          fill: AUDIT_COLORS.primary,
          stroke: AUDIT_COLORS.primaryBorder,
          strokeWidth: 2,
          rx: 8,
          ry: 8
        },
        {
          type: 'i-text',
          left: 200,
          top: 50,
          text: 'CEO',
          fontSize: 18,
          fontFamily: 'Inter',
          fill: 'white',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        },
        {
          type: 'rect',
          left: 100,
          top: 180,
          width: 120,
          height: 70,
          fill: AUDIT_COLORS.secondary,
          stroke: AUDIT_COLORS.secondaryBorder,
          strokeWidth: 2,
          rx: 8,
          ry: 8
        },
        {
          type: 'i-text',
          left: 100,
          top: 180,
          text: 'Manager A',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: 'white',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        },
        {
          type: 'rect',
          left: 280,
          top: 180,
          width: 120,
          height: 70,
          fill: AUDIT_COLORS.secondary,
          stroke: AUDIT_COLORS.secondaryBorder,
          strokeWidth: 2,
          rx: 8,
          ry: 8
        },
        {
          type: 'i-text',
          left: 280,
          top: 180,
          text: 'Manager B',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: 'white',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        }
      ]
    };
  }

  private createProjectTimelineData(): any {
    return {
      version: '5.3.0',
      objects: [
        {
          type: 'line',
          left: 50,
          top: 150,
          x1: 0,
          y1: 0,
          x2: 400,
          y2: 0,
          stroke: AUDIT_COLORS.border,
          strokeWidth: 3
        },
        {
          type: 'circle',
          left: 100,
          top: 150,
          radius: 8,
          fill: AUDIT_COLORS.primary,
          stroke: AUDIT_COLORS.primaryBorder,
          strokeWidth: 2
        },
        {
          type: 'i-text',
          left: 100,
          top: 120,
          text: 'Phase 1',
          fontSize: 14,
          fontFamily: 'Inter',
          fill: AUDIT_COLORS.text,
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        },
        {
          type: 'circle',
          left: 250,
          top: 150,
          radius: 8,
          fill: AUDIT_COLORS.warning,
          stroke: AUDIT_COLORS.warningBorder,
          strokeWidth: 2
        },
        {
          type: 'i-text',
          left: 250,
          top: 120,
          text: 'Phase 2',
          fontSize: 14,
          fontFamily: 'Inter',
          fill: AUDIT_COLORS.text,
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        },
        {
          type: 'circle',
          left: 400,
          top: 150,
          radius: 8,
          fill: AUDIT_COLORS.success,
          stroke: AUDIT_COLORS.successBorder,
          strokeWidth: 2
        },
        {
          type: 'i-text',
          left: 400,
          top: 120,
          text: 'Complete',
          fontSize: 14,
          fontFamily: 'Inter',
          fill: AUDIT_COLORS.text,
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        }
      ]
    };
  }

  private createAuditProcessData(): any {
    return {
      version: '5.3.0',
      objects: [
        {
          type: 'rect',
          left: 50,
          top: 50,
          width: 120,
          height: 60,
          fill: AUDIT_COLORS.primary,
          stroke: AUDIT_COLORS.primaryBorder,
          strokeWidth: 2,
          rx: 8,
          ry: 8
        },
        {
          type: 'i-text',
          left: 50,
          top: 50,
          text: 'Planning',
          fontSize: 14,
          fontFamily: 'Inter',
          fill: 'white',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        },
        {
          type: 'rect',
          left: 220,
          top: 50,
          width: 120,
          height: 60,
          fill: AUDIT_COLORS.warning,
          stroke: AUDIT_COLORS.warningBorder,
          strokeWidth: 2,
          rx: 8,
          ry: 8
        },
        {
          type: 'i-text',
          left: 220,
          top: 50,
          text: 'Fieldwork',
          fontSize: 14,
          fontFamily: 'Inter',
          fill: 'white',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        },
        {
          type: 'rect',
          left: 390,
          top: 50,
          width: 120,
          height: 60,
          fill: AUDIT_COLORS.success,
          stroke: AUDIT_COLORS.successBorder,
          strokeWidth: 2,
          rx: 8,
          ry: 8
        },
        {
          type: 'i-text',
          left: 390,
          top: 50,
          text: 'Reporting',
          fontSize: 14,
          fontFamily: 'Inter',
          fill: 'white',
          textAlign: 'center',
          originX: 'center',
          originY: 'center'
        }
      ]
    };
  }

  public addTemplate(template: Template): void {
    this.templates.set(template.id, template);
    this.updateCategories();
  }

  public getTemplate(id: string): Template | undefined {
    return this.templates.get(id);
  }

  public getAllTemplates(): Template[] {
    return Array.from(this.templates.values());
  }

  public getTemplatesByCategory(category: string): Template[] {
    return Array.from(this.templates.values()).filter(t => t.category === category);
  }

  public getCategories(): TemplateCategory[] {
    return Array.from(this.categories.values());
  }

  public searchTemplates(query: string): Template[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.templates.values()).filter(template =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  public async applyTemplate(templateId: string): Promise<boolean> {
    const template = this.getTemplate(templateId);
    if (!template) {
      console.error('Template not found:', templateId);
      return false;
    }

    try {
      // Clear current canvas
      this.canvas.clear();
      
      // Load template data
      await this.canvas.loadFromJSON(template.data);
      this.canvas.renderAll();
      
      console.log('Template applied successfully:', template.name);
      return true;
    } catch (error) {
      console.error('Error applying template:', error);
      return false;
    }
  }

  public async saveAsTemplate(name: string, description: string, category: string, tags: string[]): Promise<string> {
    const templateId = `custom-${Date.now()}`;
    const canvasData = this.canvas.toJSON();
    
    const template: Template = {
      id: templateId,
      name,
      description,
      category: category as any,
      thumbnail: '', // Could generate thumbnail here
      data: canvasData,
      tags,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.addTemplate(template);
    console.log('Template saved:', name);
    return templateId;
  }

  private updateCategories(): void {
    this.categories.forEach(category => {
      category.templates = Array.from(this.templates.values()).filter(t => t.category === category.id);
    });
  }
}

// Singleton instance
let templateManagerInstance: TemplateManager | null = null;

export const getTemplateManager = (canvas?: fabric.Canvas): TemplateManager | null => {
  if (canvas && !templateManagerInstance) {
    templateManagerInstance = new TemplateManager(canvas);
  }
  return templateManagerInstance;
};

export const cleanupTemplateManager = (): void => {
  templateManagerInstance = null;
};
