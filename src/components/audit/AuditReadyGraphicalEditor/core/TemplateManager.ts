import * as fabric from 'fabric';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'audit' | 'risk' | 'compliance' | 'process' | 'presentation' | 'general';
  subcategory?: string;
  thumbnail: string;
  canvasData: any;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    version: string;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number; // minutes
    objectCount: number;
    canvasSize: { width: number; height: number };
  };
  isPublic: boolean;
  isPremium: boolean;
  usageCount: number;
  rating: number;
  reviews: TemplateReview[];
}

export interface TemplateReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  subcategories: TemplateSubcategory[];
  templateCount: number;
}

export interface TemplateSubcategory {
  id: string;
  name: string;
  description: string;
  templateCount: number;
}

export interface TemplateSearchFilters {
  category?: string;
  subcategory?: string;
  tags?: string[];
  difficulty?: Template['metadata']['difficulty'];
  isPremium?: boolean;
  rating?: number;
  sortBy?: 'name' | 'rating' | 'usage' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
}

export class TemplateManager {
  private canvas: fabric.Canvas;
  private templates: Map<string, Template> = new Map();
  private categories: TemplateCategory[] = [];
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.initializeDefaultCategories();
    this.loadBuiltInTemplates();
  }

  private initializeDefaultCategories(): void {
    this.categories = [
      {
        id: 'audit',
        name: 'Audit Templates',
        description: 'Templates for audit documentation and workflows',
        icon: '📋',
        subcategories: [
          { id: 'checklists', name: 'Audit Checklists', description: 'Structured audit checklists', templateCount: 0 },
          { id: 'reports', name: 'Audit Reports', description: 'Professional audit report layouts', templateCount: 0 },
          { id: 'findings', name: 'Findings Documentation', description: 'Templates for documenting audit findings', templateCount: 0 }
        ],
        templateCount: 0
      },
      {
        id: 'risk',
        name: 'Risk Management',
        description: 'Risk assessment and management templates',
        icon: '⚠️',
        subcategories: [
          { id: 'matrices', name: 'Risk Matrices', description: 'Risk assessment matrices and heatmaps', templateCount: 0 },
          { id: 'registers', name: 'Risk Registers', description: 'Comprehensive risk documentation', templateCount: 0 },
          { id: 'assessments', name: 'Risk Assessments', description: 'Risk evaluation frameworks', templateCount: 0 }
        ],
        templateCount: 0
      },
      {
        id: 'compliance',
        name: 'Compliance',
        description: 'Regulatory compliance and standards templates',
        icon: '✅',
        subcategories: [
          { id: 'frameworks', name: 'Compliance Frameworks', description: 'Standard compliance frameworks', templateCount: 0 },
          { id: 'mappings', name: 'Control Mappings', description: 'Control mapping visualizations', templateCount: 0 },
          { id: 'gaps', name: 'Gap Analysis', description: 'Compliance gap analysis templates', templateCount: 0 }
        ],
        templateCount: 0
      },
      {
        id: 'process',
        name: 'Process Flows',
        description: 'Business process and workflow templates',
        icon: '🔄',
        subcategories: [
          { id: 'workflows', name: 'Workflows', description: 'Business workflow diagrams', templateCount: 0 },
          { id: 'procedures', name: 'Procedures', description: 'Step-by-step procedures', templateCount: 0 },
          { id: 'swimlanes', name: 'Swimlane Diagrams', description: 'Cross-functional process flows', templateCount: 0 }
        ],
        templateCount: 0
      },
      {
        id: 'presentation',
        name: 'Presentations',
        description: 'Professional presentation layouts',
        icon: '📊',
        subcategories: [
          { id: 'dashboards', name: 'Dashboards', description: 'Executive dashboards and KPIs', templateCount: 0 },
          { id: 'reports', name: 'Report Layouts', description: 'Professional report designs', templateCount: 0 },
          { id: 'infographics', name: 'Infographics', description: 'Visual information graphics', templateCount: 0 }
        ],
        templateCount: 0
      }
    ];
  }

  private loadBuiltInTemplates(): void {
    // Audit Checklist Template
    this.addTemplate({
      id: 'audit-checklist-basic',
      name: 'Basic Audit Checklist',
      description: 'A simple audit checklist template with checkboxes and descriptions',
      category: 'audit',
      subcategory: 'checklists',
      thumbnail: this.generateThumbnail('audit-checklist'),
      canvasData: this.getAuditChecklistTemplate(),
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'AuditReady',
        version: '1.0',
        tags: ['audit', 'checklist', 'basic'],
        difficulty: 'beginner',
        estimatedTime: 5,
        objectCount: 8,
        canvasSize: { width: 800, height: 600 }
      },
      isPublic: true,
      isPremium: false,
      usageCount: 0,
      rating: 4.5,
      reviews: []
    });

    // Risk Matrix Template
    this.addTemplate({
      id: 'risk-matrix-3x3',
      name: '3x3 Risk Matrix',
      description: 'Standard 3x3 risk assessment matrix with color coding',
      category: 'risk',
      subcategory: 'matrices',
      thumbnail: this.generateThumbnail('risk-matrix'),
      canvasData: this.getRiskMatrixTemplate(),
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'AuditReady',
        version: '1.0',
        tags: ['risk', 'matrix', 'assessment'],
        difficulty: 'intermediate',
        estimatedTime: 10,
        objectCount: 12,
        canvasSize: { width: 800, height: 600 }
      },
      isPublic: true,
      isPremium: false,
      usageCount: 0,
      rating: 4.8,
      reviews: []
    });

    // Process Flow Template
    this.addTemplate({
      id: 'process-flow-basic',
      name: 'Basic Process Flow',
      description: 'Simple process flow diagram with start, process, and end elements',
      category: 'process',
      subcategory: 'workflows',
      thumbnail: this.generateThumbnail('process-flow'),
      canvasData: this.getProcessFlowTemplate(),
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'AuditReady',
        version: '1.0',
        tags: ['process', 'workflow', 'diagram'],
        difficulty: 'beginner',
        estimatedTime: 8,
        objectCount: 6,
        canvasSize: { width: 800, height: 600 }
      },
      isPublic: true,
      isPremium: false,
      usageCount: 0,
      rating: 4.3,
      reviews: []
    });

    // Compliance Framework Template
    this.addTemplate({
      id: 'compliance-framework-iso',
      name: 'ISO 27001 Framework',
      description: 'ISO 27001 compliance framework visualization',
      category: 'compliance',
      subcategory: 'frameworks',
      thumbnail: this.generateThumbnail('compliance-framework'),
      canvasData: this.getComplianceFrameworkTemplate(),
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'AuditReady',
        version: '1.0',
        tags: ['compliance', 'ISO27001', 'framework'],
        difficulty: 'advanced',
        estimatedTime: 15,
        objectCount: 15,
        canvasSize: { width: 800, height: 600 }
      },
      isPublic: true,
      isPremium: true,
      usageCount: 0,
      rating: 4.9,
      reviews: []
    });

    this.updateCategoryCounts();
  }

  private generateThumbnail(type: string): string {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 150;
    const ctx = canvas.getContext('2d')!;

    // Create professional thumbnails based on type
    switch (type) {
      case 'audit-checklist':
        this.drawAuditChecklistThumbnail(ctx);
        break;
      case 'risk-matrix':
        this.drawRiskMatrixThumbnail(ctx);
        break;
      case 'process-flow':
        this.drawProcessFlowThumbnail(ctx);
        break;
      case 'compliance-framework':
        this.drawComplianceFrameworkThumbnail(ctx);
        break;
      default:
        this.drawDefaultThumbnail(ctx, type);
        break;
    }

    return canvas.toDataURL();
  }

  private drawAuditChecklistThumbnail(ctx: CanvasRenderingContext2D): void {
    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 200, 150);

    // Header
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(0, 0, 200, 30);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('AUDIT CHECKLIST', 100, 20);

    // Checkboxes and text
    ctx.fillStyle = '#374151';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';

    for (let i = 0; i < 4; i++) {
      const y = 50 + i * 20;
      // Checkbox
      ctx.strokeStyle = '#6b7280';
      ctx.strokeRect(20, y - 8, 12, 12);
      if (i < 2) {
        // Checkmark
        ctx.fillStyle = '#10b981';
        ctx.fillText('✓', 23, y + 1);
        ctx.fillStyle = '#374151';
      }
      // Text
      ctx.fillText(`Control ${i + 1}: Sample requirement`, 40, y);
    }
  }

  private drawRiskMatrixThumbnail(ctx: CanvasRenderingContext2D): void {
    // Background
    ctx.fillStyle = '#fef2f2';
    ctx.fillRect(0, 0, 200, 150);

    // Title
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('RISK MATRIX', 100, 20);

    // 3x3 Matrix
    const colors = ['#10b981', '#f59e0b', '#ef4444'];
    const startX = 50;
    const startY = 40;
    const cellSize = 30;

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        ctx.fillStyle = colors[row];
        ctx.fillRect(startX + col * cellSize, startY + row * cellSize, cellSize, cellSize);
        ctx.strokeStyle = '#374151';
        ctx.strokeRect(startX + col * cellSize, startY + row * cellSize, cellSize, cellSize);
      }
    }

    // Labels
    ctx.fillStyle = '#374151';
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Low', startX + 15, startY + 105);
    ctx.fillText('Med', startX + 45, startY + 105);
    ctx.fillText('High', startX + 75, startY + 105);
  }

  private drawProcessFlowThumbnail(ctx: CanvasRenderingContext2D): void {
    // Background
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(0, 0, 200, 150);

    // Title
    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PROCESS FLOW', 100, 20);

    // Start circle
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(40, 70, 15, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = '8px Arial';
    ctx.fillText('Start', 40, 73);

    // Arrow
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(55, 70);
    ctx.lineTo(85, 70);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(80, 65);
    ctx.lineTo(85, 70);
    ctx.lineTo(80, 75);
    ctx.stroke();

    // Process rectangle
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(90, 55, 40, 30);
    ctx.fillStyle = 'white';
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Process', 110, 73);

    // Arrow
    ctx.strokeStyle = '#374151';
    ctx.beginPath();
    ctx.moveTo(130, 70);
    ctx.lineTo(160, 70);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(155, 65);
    ctx.lineTo(160, 70);
    ctx.lineTo(155, 75);
    ctx.stroke();

    // End circle
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(175, 70, 15, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.fillText('End', 175, 73);
  }

  private drawComplianceFrameworkThumbnail(ctx: CanvasRenderingContext2D): void {
    // Background
    ctx.fillStyle = '#faf5ff';
    ctx.fillRect(0, 0, 200, 150);

    // Title
    ctx.fillStyle = '#7c3aed';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ISO 27001 FRAMEWORK', 100, 18);

    // PDCA Cycle
    const centerX = 100;
    const centerY = 80;
    const radius = 40;

    // Plan
    ctx.fillStyle = '#ede9fe';
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI/2, 0);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#7c3aed';
    ctx.font = '8px Arial';
    ctx.fillText('Plan', centerX + 15, centerY - 15);

    // Do
    ctx.fillStyle = '#ddd6fe';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI/2);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillText('Do', centerX + 15, centerY + 15);

    // Check
    ctx.fillStyle = '#c4b5fd';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI/2, Math.PI);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillText('Check', centerX - 25, centerY + 15);

    // Act
    ctx.fillStyle = '#a78bfa';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, -Math.PI/2);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillText('Act', centerX - 25, centerY - 15);
  }

  private drawDefaultThumbnail(ctx: CanvasRenderingContext2D, type: string): void {
    // Background
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, 200, 150);

    // Border
    ctx.strokeStyle = '#e5e7eb';
    ctx.strokeRect(0, 0, 200, 150);

    // Icon placeholder
    ctx.fillStyle = '#d1d5db';
    ctx.fillRect(75, 50, 50, 40);

    // Text
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(type.replace('-', ' ').toUpperCase(), 100, 110);
  }

  private getAuditChecklistTemplate(): any {
    return {
      version: '5.3.0',
      objects: [
        {
          type: 'text',
          text: 'Audit Checklist',
          left: 50,
          top: 30,
          fontSize: 24,
          fontWeight: 'bold',
          fill: '#2563eb'
        },
        {
          type: 'rect',
          left: 50,
          top: 80,
          width: 20,
          height: 20,
          fill: 'white',
          stroke: '#374151',
          strokeWidth: 2
        },
        {
          type: 'text',
          text: 'Control 1: Access management procedures are documented',
          left: 80,
          top: 85,
          fontSize: 14,
          fill: '#374151'
        },
        {
          type: 'rect',
          left: 50,
          top: 120,
          width: 20,
          height: 20,
          fill: 'white',
          stroke: '#374151',
          strokeWidth: 2
        },
        {
          type: 'text',
          text: 'Control 2: User access reviews are performed quarterly',
          left: 80,
          top: 125,
          fontSize: 14,
          fill: '#374151'
        }
      ]
    };
  }

  private getRiskMatrixTemplate(): any {
    return {
      version: '5.3.0',
      objects: [
        {
          type: 'text',
          text: 'Risk Assessment Matrix',
          left: 200,
          top: 30,
          fontSize: 20,
          fontWeight: 'bold',
          fill: '#dc2626'
        },
        // Matrix grid (3x3)
        ...this.generateMatrixGrid(150, 100, 3, 3, 80)
      ]
    };
  }

  private getProcessFlowTemplate(): any {
    return {
      version: '5.3.0',
      objects: [
        {
          type: 'ellipse',
          left: 100,
          top: 100,
          rx: 50,
          ry: 30,
          fill: '#10b981',
          stroke: '#047857',
          strokeWidth: 2
        },
        {
          type: 'text',
          text: 'Start',
          left: 125,
          top: 115,
          fontSize: 14,
          fill: 'white',
          fontWeight: 'bold'
        },
        {
          type: 'rect',
          left: 250,
          top: 100,
          width: 100,
          height: 60,
          fill: '#3b82f6',
          stroke: '#1d4ed8',
          strokeWidth: 2
        },
        {
          type: 'text',
          text: 'Process',
          left: 285,
          top: 125,
          fontSize: 14,
          fill: 'white',
          fontWeight: 'bold'
        }
      ]
    };
  }

  private getComplianceFrameworkTemplate(): any {
    return {
      version: '5.3.0',
      objects: [
        {
          type: 'text',
          text: 'ISO 27001 Information Security Management',
          left: 150,
          top: 30,
          fontSize: 18,
          fontWeight: 'bold',
          fill: '#7c3aed'
        },
        {
          type: 'rect',
          left: 100,
          top: 80,
          width: 150,
          height: 80,
          fill: '#ede9fe',
          stroke: '#7c3aed',
          strokeWidth: 2
        },
        {
          type: 'text',
          text: 'Plan',
          left: 165,
          top: 115,
          fontSize: 16,
          fontWeight: 'bold',
          fill: '#7c3aed'
        }
      ]
    };
  }

  private generateMatrixGrid(startX: number, startY: number, rows: number, cols: number, cellSize: number): any[] {
    const objects = [];
    const colors = ['#10b981', '#f59e0b', '#ef4444']; // Green, Yellow, Red

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        objects.push({
          type: 'rect',
          left: startX + col * cellSize,
          top: startY + row * cellSize,
          width: cellSize,
          height: cellSize,
          fill: colors[row] || '#e5e7eb',
          stroke: '#374151',
          strokeWidth: 1,
          opacity: 0.7
        });
      }
    }

    return objects;
  }

  public addTemplate(template: Template): void {
    this.templates.set(template.id, template);
    this.updateCategoryCounts();
    this.emit('template:added', template);
  }

  public removeTemplate(templateId: string): boolean {
    const removed = this.templates.delete(templateId);
    if (removed) {
      this.updateCategoryCounts();
      this.emit('template:removed', templateId);
    }
    return removed;
  }

  public getTemplate(templateId: string): Template | undefined {
    return this.templates.get(templateId);
  }

  public getAllTemplates(): Template[] {
    return Array.from(this.templates.values());
  }

  public searchTemplates(query: string, filters: TemplateSearchFilters = {}): Template[] {
    let results = Array.from(this.templates.values());

    // Text search
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      results = results.filter(template =>
        template.name.toLowerCase().includes(searchTerm) ||
        template.description.toLowerCase().includes(searchTerm) ||
        template.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Apply filters
    if (filters.category) {
      results = results.filter(t => t.category === filters.category);
    }

    if (filters.subcategory) {
      results = results.filter(t => t.subcategory === filters.subcategory);
    }

    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(t =>
        filters.tags!.some(tag => t.metadata.tags.includes(tag))
      );
    }

    if (filters.difficulty) {
      results = results.filter(t => t.metadata.difficulty === filters.difficulty);
    }

    if (filters.isPremium !== undefined) {
      results = results.filter(t => t.isPremium === filters.isPremium);
    }

    if (filters.rating) {
      results = results.filter(t => t.rating >= filters.rating!);
    }

    // Sort results
    const sortBy = filters.sortBy || 'name';
    const sortOrder = filters.sortOrder || 'asc';

    results.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'usage':
          aValue = a.usageCount;
          bValue = b.usageCount;
          break;
        case 'created':
          aValue = a.metadata.createdAt.getTime();
          bValue = b.metadata.createdAt.getTime();
          break;
        case 'updated':
          aValue = a.metadata.updatedAt.getTime();
          bValue = b.metadata.updatedAt.getTime();
          break;
        case 'name':
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
      }

      if (sortOrder === 'desc') {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    return results;
  }

  public getCategories(): TemplateCategory[] {
    return [...this.categories];
  }

  public getTemplatesByCategory(categoryId: string): Template[] {
    return Array.from(this.templates.values()).filter(t => t.category === categoryId);
  }

  public async applyTemplate(templateId: string): Promise<boolean> {
    const template = this.templates.get(templateId);
    if (!template) {
      console.error(`Template not found: ${templateId}`);
      return false;
    }

    try {
      // Clear current canvas
      this.canvas.clear();

      // Load template data
      await new Promise<void>((resolve, reject) => {
        this.canvas.loadFromJSON(template.canvasData, () => {
          this.canvas.renderAll();
          resolve();
        });
      });

      // Update usage count
      template.usageCount++;
      template.metadata.updatedAt = new Date();

      this.emit('template:applied', template);
      console.log(`Applied template: ${template.name}`);
      return true;
    } catch (error) {
      console.error('Failed to apply template:', error);
      return false;
    }
  }

  public async saveAsTemplate(
    name: string,
    description: string,
    category: Template['category'],
    subcategory?: string,
    tags: string[] = []
  ): Promise<Template> {
    const canvasData = this.canvas.toJSON(['id', 'selectable', 'evented']);
    const thumbnail = this.canvas.toDataURL({
      format: 'png',
      quality: 0.3,
      multiplier: 0.2
    });

    const template: Template = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      category,
      subcategory,
      thumbnail,
      canvasData,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'User',
        version: '1.0',
        tags,
        difficulty: 'intermediate',
        estimatedTime: 10,
        objectCount: this.canvas.getObjects().length,
        canvasSize: {
          width: this.canvas.width || 800,
          height: this.canvas.height || 600
        }
      },
      isPublic: false,
      isPremium: false,
      usageCount: 0,
      rating: 0,
      reviews: []
    };

    this.addTemplate(template);
    this.emit('template:created', template);
    console.log(`Created template: ${name}`);
    return template;
  }

  public addReview(templateId: string, review: Omit<TemplateReview, 'id' | 'createdAt'>): boolean {
    const template = this.templates.get(templateId);
    if (!template) return false;

    const newReview: TemplateReview = {
      ...review,
      id: `review_${Date.now()}`,
      createdAt: new Date()
    };

    template.reviews.push(newReview);

    // Recalculate rating
    const totalRating = template.reviews.reduce((sum, r) => sum + r.rating, 0);
    template.rating = totalRating / template.reviews.length;

    this.emit('template:reviewed', { template, review: newReview });
    return true;
  }

  private updateCategoryCounts(): void {
    this.categories.forEach(category => {
      const categoryTemplates = this.getTemplatesByCategory(category.id);
      category.templateCount = categoryTemplates.length;

      category.subcategories.forEach(subcategory => {
        subcategory.templateCount = categoryTemplates.filter(
          t => t.subcategory === subcategory.id
        ).length;
      });
    });
  }

  // Event system
  public on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  public off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  public cleanup(): void {
    this.templates.clear();
    this.eventHandlers.clear();
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
  if (templateManagerInstance) {
    templateManagerInstance.cleanup();
    templateManagerInstance = null;
  }
};
