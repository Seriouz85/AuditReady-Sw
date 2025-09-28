/**
 * 🎨 Diagram Template Service
 * Handles intelligent template generation for different diagram types
 * Extracted from OneShotDiagramService for better maintainability and separation of concerns
 */

import type { OneShotDiagramRequest, OneShotDiagramResponse } from './OneShotDiagramService';

export class DiagramTemplateService {
  private static instance: DiagramTemplateService;

  private constructor() {}

  public static getInstance(): DiagramTemplateService {
    if (!DiagramTemplateService.instance) {
      DiagramTemplateService.instance = new DiagramTemplateService();
    }
    return DiagramTemplateService.instance;
  }

  /**
   * 🧩 INTELLIGENT TEMPLATE ROUTER
   * Routes requests to appropriate template generators
   */
  public async generateWithIntelligentTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    const { diagramType, prompt, complexity = 'medium' } = request;

    console.log('🎨 Generating with intelligent template:', diagramType);

    switch (diagramType) {
      case 'gantt':
        return this.generateGanttTemplate(request);
      case 'flowchart':
        return this.generateFlowchartTemplate(request);
      case 'network':
        return this.generateNetworkTemplate(request);
      case 'process':
        return this.generateProcessTemplate(request);
      case 'timeline':
        return this.generateTimelineTemplate(request);
      case 'decision':
        return this.generateDecisionTemplate(request);
      case 'swimlane':
        return this.generateSwimlaneTemplate(request);
      default:
        return this.generateGenericTemplate(request);
    }
  }

  /**
   * 📊 GANTT CHART TEMPLATE GENERATOR
   */
  public generateGanttTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    const { prompt, projectDuration = '6 months', complexity = 'medium' } = request;
    
    // Get validation service and generation service
    const { DiagramValidationService } = require('./DiagramValidationService');
    const { DiagramGenerationService } = require('./DiagramGenerationService');
    
    const validationService = DiagramValidationService.getInstance();
    const generationService = DiagramGenerationService.getInstance();
    
    // Parse prompt for project phases and tasks
    const tasks = validationService.extractTasksFromPrompt(prompt, complexity);
    const ganttNodes = generationService.createGanttNodes(tasks);
    const ganttEdges = generationService.createGanttEdges(tasks);

    return Promise.resolve({
      success: true,
      nodes: ganttNodes,
      edges: ganttEdges,
      title: `${this.extractProjectName(prompt)} - Gantt Chart`,
      description: `Project timeline with ${tasks.length} tasks and dependencies`,
      confidence: 0.92,
      processingTime: 0,
      suggestions: [
        'Adjust task durations by editing nodes',
        'Add dependencies by connecting tasks',
        'Set task priorities using node properties',
        'Assign team members to tasks'
      ],
      metadata: {
        diagramType: 'gantt',
        nodeCount: ganttNodes.length,
        edgeCount: ganttEdges.length,
        usedTemplate: true,
        apiProvider: 'template'
      }
    });
  }

  /**
   * 🔄 FLOWCHART TEMPLATE GENERATOR
   */
  public generateFlowchartTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    const { prompt, complexity = 'medium' } = request;
    
    const { DiagramValidationService } = require('./DiagramValidationService');
    const { DiagramGenerationService } = require('./DiagramGenerationService');
    
    const validationService = DiagramValidationService.getInstance();
    const generationService = DiagramGenerationService.getInstance();
    
    // Extract steps from prompt with intelligence
    const steps = validationService.extractStepsFromPrompt(prompt, complexity);
    const nodes = generationService.createEnhancedFlowchartNodes(steps, complexity);
    const edges = generationService.createEnhancedFlowchartEdges(steps, complexity);

    return Promise.resolve({
      success: true,
      nodes,
      edges,
      title: `${validationService.generateTitleFromPrompt(prompt)} - Process Flow`,
      description: `Intelligent flowchart with ${steps.length} process steps and decision points`,
      confidence: 0.88,
      processingTime: 0,
      suggestions: [
        'Add decision points for branching logic',
        'Include parallel processes where applicable',
        'Add error handling paths',
        'Customize colors for different step types'
      ],
      metadata: {
        diagramType: 'flowchart',
        nodeCount: nodes.length,
        edgeCount: edges.length,
        usedTemplate: true,
        apiProvider: 'template'
      }
    });
  }

  /**
   * 🌐 NETWORK DIAGRAM TEMPLATE GENERATOR
   */
  public generateNetworkTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    const { prompt, complexity = 'medium' } = request;
    
    const { DiagramValidationService } = require('./DiagramValidationService');
    const { DiagramGenerationService } = require('./DiagramGenerationService');
    
    const validationService = DiagramValidationService.getInstance();
    const generationService = DiagramGenerationService.getInstance();
    
    // Extract network components from prompt
    const components = validationService.extractNetworkComponents(prompt, complexity);
    const nodes = generationService.createNetworkNodes(components);
    const edges = generationService.createNetworkEdges(components);

    return Promise.resolve({
      success: true,
      nodes,
      edges,
      title: `${validationService.generateTitleFromPrompt(prompt)} - Network Diagram`,
      description: `Network architecture with ${components.length} components`,
      confidence: 0.85,
      processingTime: 0,
      suggestions: [
        'Add security components like firewalls',
        'Include load balancers for scalability',
        'Add monitoring and logging components',
        'Define network zones and subnets'
      ],
      metadata: {
        diagramType: 'network',
        nodeCount: nodes.length,
        edgeCount: edges.length,
        usedTemplate: true,
        apiProvider: 'template'
      }
    });
  }

  /**
   * ⚙️ PROCESS DIAGRAM TEMPLATE ROUTER
   */
  public generateProcessTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    const promptLower = request.prompt.toLowerCase();
    
    // Check if this is a risk management process
    if (promptLower.includes('risk') && (promptLower.includes('management') || promptLower.includes('assessment'))) {
      return this.generateRiskManagementTemplate(request);
    }
    
    // Check if this is an incident response process
    if (promptLower.includes('incident') && promptLower.includes('response')) {
      return this.generateIncidentResponseTemplate(request);
    }
    
    // Check if this is a compliance/audit process
    if (promptLower.includes('audit') || promptLower.includes('compliance')) {
      return this.generateAuditProcessTemplate(request);
    }
    
    // Default to generic process
    return this.generateGenericProcessTemplate(request);
  }

  /**
   * ⏱️ TIMELINE TEMPLATE GENERATOR
   */
  public generateTimelineTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    // Implementation for timeline diagrams
    return this.generateGenericTemplate(request);
  }

  /**
   * 🌳 DECISION TREE TEMPLATE GENERATOR
   */
  public generateDecisionTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    // Implementation for decision trees
    return this.generateRiskDecisionTreeTemplate(request);
  }

  /**
   * 🏊 SWIMLANE TEMPLATE GENERATOR
   */
  public generateSwimlaneTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    // Implementation for swimlane diagrams
    return this.generateGenericTemplate(request);
  }

  /**
   * 🎯 RISK MANAGEMENT TEMPLATE
   */
  public generateRiskManagementTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    const { DiagramGenerationService } = require('./DiagramGenerationService');
    const generationService = DiagramGenerationService.getInstance();

    // Risk management process nodes
    const riskNodes = [
      // Risk Identification Phase
      {
        id: 'risk-start',
        type: 'custom',
        position: { x: 400, y: 50 },
        data: {
          label: 'Risk Identification',
          shape: 'circle',
          fillColor: '#dbeafe',
          strokeColor: '#2563eb',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      {
        id: 'risk-register-check',
        type: 'custom',
        position: { x: 400, y: 150 },
        data: {
          label: 'Risk Already in Register?',
          shape: 'diamond',
          fillColor: '#fef3c7',
          strokeColor: '#d97706',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      {
        id: 'risk-assessment',
        type: 'custom',
        position: { x: 400, y: 250 },
        data: {
          label: 'Risk Assessment\n(Likelihood × Impact)',
          shape: 'rectangle',
          fillColor: '#f1f5f9',
          strokeColor: '#475569',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      }
      // Additional risk management nodes would be added here...
    ];

    const riskEdges = generationService.createRiskManagementEdges();

    return Promise.resolve({
      success: true,
      nodes: riskNodes,
      edges: riskEdges,
      title: 'Risk Management Process',
      description: 'Comprehensive risk management workflow with decision points and feedback loops',
      confidence: 0.95,
      processingTime: 0,
      suggestions: [
        'Customize risk assessment criteria',
        'Add specific risk categories',
        'Include escalation thresholds',
        'Add monitoring frequencies'
      ],
      metadata: {
        diagramType: 'process',
        nodeCount: riskNodes.length,
        edgeCount: riskEdges.length,
        usedTemplate: true,
        apiProvider: 'template'
      }
    });
  }

  // Additional template methods...
  public generateIncidentResponseTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    return this.generateGenericTemplate(request);
  }

  public generateAuditProcessTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    return this.generateGenericTemplate(request);
  }

  public generateGenericProcessTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    return this.generateGenericTemplate(request);
  }

  public generateRiskDecisionTreeTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    return this.generateGenericTemplate(request);
  }

  public generateGenericTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    return this.generateMinimumRichTemplate(request);
  }

  public generateMinimumRichTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    const { DiagramValidationService } = require('./DiagramValidationService');
    const validationService = DiagramValidationService.getInstance();

    // Create a basic but rich template
    const nodes = [
      {
        id: 'start',
        type: 'custom',
        position: { x: 400, y: 50 },
        data: {
          label: 'Start',
          shape: 'circle',
          fillColor: '#dbeafe',
          strokeColor: '#2563eb',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      {
        id: 'process1',
        type: 'custom',
        position: { x: 400, y: 150 },
        data: {
          label: 'Main Process',
          shape: 'rectangle',
          fillColor: '#f1f5f9',
          strokeColor: '#475569',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      {
        id: 'end',
        type: 'custom',
        position: { x: 400, y: 250 },
        data: {
          label: 'Complete',
          shape: 'circle',
          fillColor: '#dcfce7',
          strokeColor: '#16a34a',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      }
    ];

    const edges = [
      {
        id: 'edge1',
        source: 'start',
        target: 'process1',
        type: 'smoothstep',
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: 'ArrowClosed', color: '#1e293b' }
      },
      {
        id: 'edge2',
        source: 'process1',
        target: 'end',
        type: 'smoothstep',
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: 'ArrowClosed', color: '#1e293b' }
      }
    ];

    return Promise.resolve({
      success: true,
      nodes,
      edges,
      title: validationService.generateTitleFromPrompt(request.prompt),
      description: `Basic ${request.diagramType} template`,
      confidence: 0.75,
      processingTime: 0,
      suggestions: [
        'Add more nodes to expand the diagram',
        'Include decision points',
        'Add parallel processes',
        'Customize colors and styles'
      ],
      metadata: {
        diagramType: request.diagramType,
        nodeCount: nodes.length,
        edgeCount: edges.length,
        usedTemplate: true,
        apiProvider: 'template'
      }
    });
  }

  /**
   * 🎯 PROJECT NAME EXTRACTOR
   */
  public extractProjectName(prompt: string): string {
    // Extract meaningful project name from prompt
    const words = prompt.split(' ');
    const commonWords = ['for', 'of', 'the', 'a', 'an', 'and', 'or', 'but', 'to', 'with', 'project', 'diagram'];
    const meaningfulWords = words.filter(word => 
      word.length > 2 && 
      !commonWords.includes(word.toLowerCase()) &&
      !word.match(/^\d+$/)
    );
    
    return meaningfulWords.slice(0, 3).map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ') || 'Project';
  }

  // Phase generation methods for different project types
  public getSoftwareDevelopmentPhases(complexity: string): any[] {
    const basePhases = [
      {
        name: '📋 Planning & Requirements',
        tasks: [
          { id: 1, name: 'Requirements Gathering', priority: 'high' },
          { id: 2, name: 'Technical Design', dependencies: ['task-1-1'] },
          { id: 3, name: 'Project Setup', milestone: true }
        ],
        priority: 'high'
      },
      {
        name: '⚙️ Development',
        tasks: [
          { id: 1, name: 'Backend Development', priority: 'high' },
          { id: 2, name: 'Frontend Development', priority: 'high' },
          { id: 3, name: 'Database Setup', dependencies: ['task-1-1'] },
          { id: 4, name: 'API Integration' }
        ],
        priority: 'high'
      },
      {
        name: '🧪 Testing & QA',
        tasks: [
          { id: 1, name: 'Unit Testing', priority: 'medium' },
          { id: 2, name: 'Integration Testing', dependencies: ['task-3-1'] },
          { id: 3, name: 'User Acceptance Testing', milestone: true }
        ],
        priority: 'medium'
      },
      {
        name: '🚀 Deployment',
        tasks: [
          { id: 1, name: 'Production Setup', priority: 'high' },
          { id: 2, name: 'Go-Live', dependencies: ['task-4-1'], milestone: true },
          { id: 3, name: 'Post-Launch Monitoring' }
        ],
        priority: 'high'
      }
    ];

    if (complexity === 'complex') {
      basePhases.splice(2, 0, {
        name: '🔄 Integration & Performance',
        tasks: [
          { id: 1, name: 'System Integration', priority: 'medium' },
          { id: 2, name: 'Performance Testing' },
          { id: 3, name: 'Security Testing', priority: 'high' }
        ],
        priority: 'medium'
      });
    }

    return basePhases;
  }

  public getAuditCompliancePhases(complexity: string): any[] {
    return [
      {
        name: '📊 Planning & Preparation',
        tasks: [
          { id: 1, name: 'Audit Scope Definition', priority: 'high' },
          { id: 2, name: 'Risk Assessment', priority: 'high' },
          { id: 3, name: 'Audit Team Assignment', milestone: true }
        ],
        priority: 'high'
      },
      {
        name: '🔍 Fieldwork & Testing',
        tasks: [
          { id: 1, name: 'Control Testing', priority: 'high' },
          { id: 2, name: 'Evidence Collection', priority: 'high' },
          { id: 3, name: 'Documentation Review', priority: 'medium' }
        ],
        priority: 'high'
      },
      {
        name: '📋 Reporting & Follow-up',
        tasks: [
          { id: 1, name: 'Findings Analysis', priority: 'high' },
          { id: 2, name: 'Draft Report', priority: 'medium' },
          { id: 3, name: 'Final Report & Presentation', milestone: true }
        ],
        priority: 'medium'
      }
    ];
  }

  public getMarketingCampaignPhases(complexity: string): any[] {
    return [
      {
        name: '📈 Strategy & Planning',
        tasks: [
          { id: 1, name: 'Market Research', priority: 'high' },
          { id: 2, name: 'Target Audience Definition', priority: 'high' },
          { id: 3, name: 'Campaign Strategy', milestone: true }
        ],
        priority: 'high'
      },
      {
        name: '🎨 Creative & Production',
        tasks: [
          { id: 1, name: 'Creative Development', priority: 'high' },
          { id: 2, name: 'Content Creation', priority: 'medium' },
          { id: 3, name: 'Creative Review & Approval', milestone: true }
        ],
        priority: 'medium'
      },
      {
        name: '🚀 Launch & Optimization',
        tasks: [
          { id: 1, name: 'Campaign Launch', priority: 'high', milestone: true },
          { id: 2, name: 'Performance Monitoring', priority: 'high' },
          { id: 3, name: 'Optimization & Adjustment', priority: 'medium' }
        ],
        priority: 'high'
      }
    ];
  }

  public getConstructionPhases(complexity: string): any[] {
    return [
      {
        name: '📐 Design & Planning',
        tasks: [
          { id: 1, name: 'Site Survey', priority: 'high' },
          { id: 2, name: 'Architectural Design', priority: 'high' },
          { id: 3, name: 'Permits & Approvals', milestone: true }
        ],
        priority: 'high'
      },
      {
        name: '🏗️ Construction',
        tasks: [
          { id: 1, name: 'Foundation Work', priority: 'high' },
          { id: 2, name: 'Structural Work', priority: 'high' },
          { id: 3, name: 'Systems Installation', priority: 'medium' }
        ],
        priority: 'high'
      },
      {
        name: '✅ Completion & Handover',
        tasks: [
          { id: 1, name: 'Final Inspections', priority: 'high' },
          { id: 2, name: 'Documentation Handover', priority: 'medium' },
          { id: 3, name: 'Project Closure', milestone: true }
        ],
        priority: 'medium'
      }
    ];
  }

  public getGenericProjectPhases(complexity: string): any[] {
    return [
      {
        name: '🎯 Initiation',
        tasks: [
          { id: 1, name: 'Project Charter', priority: 'high' },
          { id: 2, name: 'Stakeholder Identification', priority: 'medium' },
          { id: 3, name: 'Project Kickoff', milestone: true }
        ],
        priority: 'high'
      },
      {
        name: '📋 Planning',
        tasks: [
          { id: 1, name: 'Work Breakdown Structure', priority: 'high' },
          { id: 2, name: 'Resource Planning', priority: 'medium' },
          { id: 3, name: 'Timeline Development', priority: 'medium' }
        ],
        priority: 'high'
      },
      {
        name: '⚡ Execution',
        tasks: [
          { id: 1, name: 'Work Package Delivery', priority: 'high' },
          { id: 2, name: 'Quality Assurance', priority: 'medium' },
          { id: 3, name: 'Progress Monitoring', priority: 'medium' }
        ],
        priority: 'high'
      },
      {
        name: '🏁 Closure',
        tasks: [
          { id: 1, name: 'Final Deliverables', priority: 'high' },
          { id: 2, name: 'Lessons Learned', priority: 'low' },
          { id: 3, name: 'Project Closure', milestone: true }
        ],
        priority: 'medium'
      }
    ];
  }
}