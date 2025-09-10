/**
 * 🧠 One-Shot AI Diagram Generation Service
 * Seamless Gemini API integration for instant diagram creation
 * Specialized for Gantt charts, flowcharts, and other diagram types
 */

import { Node, Edge, MarkerType } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';

export interface OneShotDiagramRequest {
  prompt: string;
  diagramType: 'flowchart' | 'gantt' | 'network' | 'process' | 'timeline' | 'decision' | 'swimlane';
  complexity?: 'simple' | 'medium' | 'complex';
  includeTimeline?: boolean;
  projectDuration?: string;
  industry?: 'audit' | 'compliance' | 'software' | 'business' | 'general';
}

export interface OneShotDiagramResponse {
  success: boolean;
  nodes: Node[];
  edges: Edge[];
  title: string;
  description: string;
  confidence: number;
  processingTime: number;
  suggestions: string[];
  error?: string;
  metadata?: {
    diagramType: string;
    nodeCount: number;
    edgeCount: number;
    usedTemplate: boolean;
    apiProvider: 'gemini' | 'template';
  };
}

export interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  dependencies?: string[];
  progress?: number;
  assignee?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  milestone?: boolean;
}

export interface ReactFlowGanttNode extends Node {
  data: {
    label: string;
    shape: 'gantt-task' | 'gantt-milestone' | 'gantt-summary';
    startDate: Date;
    endDate: Date;
    duration: number;
    progress: number;
    priority: string;
    assignee?: string;
    fillColor: string;
    strokeColor: string;
    textColor: string;
    onLabelChange: (newLabel: string) => void;
    onUpdate: (updates: any) => void;
  };
}

class OneShotDiagramService {
  private static instance: OneShotDiagramService;
  private readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

  private constructor() {}

  public static getInstance(): OneShotDiagramService {
    if (!OneShotDiagramService.instance) {
      OneShotDiagramService.instance = new OneShotDiagramService();
    }
    return OneShotDiagramService.instance;
  }

  /**
   * 🎯 ONE-SHOT DIAGRAM GENERATION
   * Single method call → Complete diagram
   */
  public async generateDiagram(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 One-shot diagram generation started:', request);

      // Check for Gemini API key
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      let response: OneShotDiagramResponse;

      if (geminiKey) {
        try {
          response = await this.generateWithGemini(request, geminiKey);
          response.metadata = {
            ...response.metadata,
            apiProvider: 'gemini'
          };
        } catch (geminiError) {
          console.warn('⚠️ Gemini API failed, falling back to intelligent templates:', geminiError);
          response = await this.generateWithIntelligentTemplate(request);
          response.metadata = {
            ...response.metadata,
            apiProvider: 'template',
            usedTemplate: true
          };
        }
      } else {
        console.log('💡 No Gemini API key found, using intelligent templates');
        response = await this.generateWithIntelligentTemplate(request);
        response.metadata = {
          ...response.metadata,
          apiProvider: 'template',
          usedTemplate: true
        };
      }

      response.processingTime = Date.now() - startTime;
      console.log('✅ Diagram generated successfully in', response.processingTime, 'ms');
      
      return response;

    } catch (error) {
      console.error('❌ One-shot diagram generation failed:', error);
      return {
        success: false,
        nodes: [],
        edges: [],
        title: 'Generation Failed',
        description: `Failed to generate diagram: ${error instanceof Error ? error.message : 'Unknown error'}`,
        confidence: 0,
        processingTime: Date.now() - startTime,
        suggestions: ['Try a simpler prompt', 'Check your internet connection', 'Contact support if the issue persists'],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 🤖 GEMINI API INTEGRATION
   */
  private async generateWithGemini(request: OneShotDiagramRequest, apiKey: string): Promise<OneShotDiagramResponse> {
    const systemPrompt = this.buildProcessSpecificSystemPrompt(request);
    const userPrompt = this.buildProcessSpecificUserPrompt(request);

    const response = await fetch(`${this.GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\nUser Request: ${userPrompt}` }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 3000,
          topP: 0.8,
          topK: 40
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
      throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No content generated by Gemini API');
    }

    return this.parseGeminiResponse(generatedText, request);
  }

  /**
   * 🧩 INTELLIGENT TEMPLATE SYSTEM
   */
  private async generateWithIntelligentTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
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
   * 📊 SPECIALIZED GANTT CHART GENERATION
   */
  private generateGanttTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    const { prompt, projectDuration = '6 months', complexity = 'medium' } = request;
    
    // Parse prompt for project phases and tasks
    const tasks = this.extractTasksFromPrompt(prompt, complexity);
    const ganttNodes = this.createGanttNodes(tasks);
    const ganttEdges = this.createGanttEdges(tasks);

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

  private extractTasksFromPrompt(prompt: string, complexity: string): GanttTask[] {
    const now = new Date();
    const tasks: GanttTask[] = [];
    
    // Intelligence: Extract phases and tasks from prompt
    const phases = this.identifyProjectPhases(prompt, complexity);
    
    let currentDate = new Date(now);
    let taskId = 1;

    for (const phase of phases) {
      // Add phase summary task
      const phaseDuration = this.calculatePhaseDuration(phase.name, complexity);
      const phaseEndDate = new Date(currentDate.getTime() + phaseDuration * 24 * 60 * 60 * 1000);
      
      tasks.push({
        id: `phase-${taskId}`,
        name: phase.name,
        startDate: new Date(currentDate),
        endDate: phaseEndDate,
        duration: phaseDuration,
        progress: 0,
        priority: phase.priority || 'medium'
      });

      // Add phase tasks
      for (const task of phase.tasks) {
        const taskDuration = Math.ceil(phaseDuration / phase.tasks.length * 0.8); // 80% of phase duration
        const taskEndDate = new Date(currentDate.getTime() + taskDuration * 24 * 60 * 60 * 1000);
        
        tasks.push({
          id: `task-${taskId}-${task.id}`,
          name: task.name,
          startDate: new Date(currentDate),
          endDate: taskEndDate,
          duration: taskDuration,
          dependencies: task.dependencies,
          progress: 0,
          assignee: task.assignee,
          priority: task.priority || 'medium',
          milestone: task.milestone
        });

        currentDate = new Date(taskEndDate.getTime() + 24 * 60 * 60 * 1000); // Add 1 day buffer
      }
      
      taskId++;
      currentDate = new Date(phaseEndDate.getTime() + 24 * 60 * 60 * 1000); // Add 1 day buffer between phases
    }

    return tasks;
  }

  private identifyProjectPhases(prompt: string, complexity: string): any[] {
    const promptLower = prompt.toLowerCase();
    
    // Intelligence: Identify project type and generate appropriate phases
    if (promptLower.includes('software') || promptLower.includes('app') || promptLower.includes('development')) {
      return this.getSoftwareDevelopmentPhases(complexity);
    } else if (promptLower.includes('audit') || promptLower.includes('compliance')) {
      return this.getAuditCompliancePhases(complexity);
    } else if (promptLower.includes('marketing') || promptLower.includes('campaign')) {
      return this.getMarketingCampaignPhases(complexity);
    } else if (promptLower.includes('construction') || promptLower.includes('building')) {
      return this.getConstructionPhases(complexity);
    } else {
      return this.getGenericProjectPhases(complexity);
    }
  }

  private getSoftwareDevelopmentPhases(complexity: string): any[] {
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

  private getAuditCompliancePhases(complexity: string): any[] {
    return [
      {
        name: '📊 Planning & Preparation',
        tasks: [
          { id: 1, name: 'Audit Scope Definition', priority: 'high' },
          { id: 2, name: 'Risk Assessment', priority: 'high' },
          { id: 3, name: 'Team Assignment' }
        ],
        priority: 'high'
      },
      {
        name: '🔍 Fieldwork & Testing',
        tasks: [
          { id: 1, name: 'Control Testing', priority: 'high' },
          { id: 2, name: 'Evidence Collection', priority: 'high' },
          { id: 3, name: 'Interviews & Walkthroughs' },
          { id: 4, name: 'Documentation Review' }
        ],
        priority: 'high'
      },
      {
        name: '📝 Reporting & Review',
        tasks: [
          { id: 1, name: 'Findings Analysis', priority: 'medium' },
          { id: 2, name: 'Draft Report Creation' },
          { id: 3, name: 'Management Review', milestone: true },
          { id: 4, name: 'Final Report' }
        ],
        priority: 'medium'
      },
      {
        name: '✅ Follow-up & Closure',
        tasks: [
          { id: 1, name: 'Remediation Planning', priority: 'medium' },
          { id: 2, name: 'Follow-up Testing' },
          { id: 3, name: 'Audit Closure', milestone: true }
        ],
        priority: 'low'
      }
    ];
  }

  private getMarketingCampaignPhases(complexity: string): any[] {
    return [
      {
        name: '🎯 Strategy & Planning',
        tasks: [
          { id: 1, name: 'Market Research', priority: 'high' },
          { id: 2, name: 'Target Audience Analysis', priority: 'high' },
          { id: 3, name: 'Campaign Strategy', dependencies: ['task-1-1', 'task-1-2'] }
        ],
        priority: 'high'
      },
      {
        name: '🎨 Creative Development',
        tasks: [
          { id: 1, name: 'Creative Concept', priority: 'medium' },
          { id: 2, name: 'Asset Creation', dependencies: ['task-2-1'] },
          { id: 3, name: 'Content Production' },
          { id: 4, name: 'Review & Approval', milestone: true }
        ],
        priority: 'medium'
      },
      {
        name: '📢 Campaign Launch',
        tasks: [
          { id: 1, name: 'Media Planning', priority: 'high' },
          { id: 2, name: 'Campaign Setup' },
          { id: 3, name: 'Go-Live', milestone: true },
          { id: 4, name: 'Monitoring & Optimization' }
        ],
        priority: 'high'
      },
      {
        name: '📊 Analysis & Reporting',
        tasks: [
          { id: 1, name: 'Performance Analysis', priority: 'medium' },
          { id: 2, name: 'ROI Calculation' },
          { id: 3, name: 'Final Report', milestone: true }
        ],
        priority: 'low'
      }
    ];
  }

  private getConstructionPhases(complexity: string): any[] {
    return [
      {
        name: '📐 Design & Planning',
        tasks: [
          { id: 1, name: 'Site Survey', priority: 'high' },
          { id: 2, name: 'Architectural Design', priority: 'high' },
          { id: 3, name: 'Permit Applications', dependencies: ['task-1-2'] },
          { id: 4, name: 'Contract Finalization', milestone: true }
        ],
        priority: 'high'
      },
      {
        name: '🏗️ Foundation & Structure',
        tasks: [
          { id: 1, name: 'Site Preparation', priority: 'high' },
          { id: 2, name: 'Foundation Work', dependencies: ['task-2-1'] },
          { id: 3, name: 'Structural Framework', dependencies: ['task-2-2'] },
          { id: 4, name: 'Structural Inspection', milestone: true }
        ],
        priority: 'high'
      },
      {
        name: '🔌 Systems & Utilities',
        tasks: [
          { id: 1, name: 'Electrical Installation', priority: 'medium' },
          { id: 2, name: 'Plumbing Installation', priority: 'medium' },
          { id: 3, name: 'HVAC Installation' },
          { id: 4, name: 'Systems Testing', milestone: true }
        ],
        priority: 'medium'
      },
      {
        name: '🎨 Finishing & Handover',
        tasks: [
          { id: 1, name: 'Interior Finishing', priority: 'low' },
          { id: 2, name: 'Exterior Finishing' },
          { id: 3, name: 'Final Inspection', milestone: true },
          { id: 4, name: 'Project Handover', milestone: true }
        ],
        priority: 'low'
      }
    ];
  }

  private getGenericProjectPhases(complexity: string): any[] {
    return [
      {
        name: '🚀 Initiation',
        tasks: [
          { id: 1, name: 'Project Charter', priority: 'high' },
          { id: 2, name: 'Stakeholder Identification', priority: 'high' },
          { id: 3, name: 'Initial Planning' }
        ],
        priority: 'high'
      },
      {
        name: '📋 Planning',
        tasks: [
          { id: 1, name: 'Detailed Planning', priority: 'high' },
          { id: 2, name: 'Resource Allocation', priority: 'medium' },
          { id: 3, name: 'Risk Planning' },
          { id: 4, name: 'Plan Approval', milestone: true }
        ],
        priority: 'high'
      },
      {
        name: '⚡ Execution',
        tasks: [
          { id: 1, name: 'Work Package 1', priority: 'high' },
          { id: 2, name: 'Work Package 2', priority: 'high' },
          { id: 3, name: 'Quality Assurance' },
          { id: 4, name: 'Progress Review', milestone: true }
        ],
        priority: 'high'
      },
      {
        name: '✅ Closure',
        tasks: [
          { id: 1, name: 'Final Deliverables', priority: 'medium' },
          { id: 2, name: 'Lessons Learned' },
          { id: 3, name: 'Project Closure', milestone: true }
        ],
        priority: 'low'
      }
    ];
  }

  private calculatePhaseDuration(phaseName: string, complexity: string): number {
    const baseDurations: Record<string, number> = {
      'planning': 14,
      'development': 30,
      'testing': 14,
      'deployment': 7,
      'initiation': 7,
      'execution': 21,
      'closure': 7
    };

    const multipliers = {
      'simple': 0.7,
      'medium': 1.0,
      'complex': 1.5
    };

    const phaseKey = Object.keys(baseDurations).find(key => 
      phaseName.toLowerCase().includes(key)
    ) || 'execution';

    return Math.ceil(baseDurations[phaseKey] * multipliers[complexity]);
  }

  private createGanttNodes(tasks: GanttTask[]): ReactFlowGanttNode[] {
    const nodes: ReactFlowGanttNode[] = [];
    let yPosition = 100;

    for (const task of tasks) {
      const node: ReactFlowGanttNode = {
        id: task.id,
        type: 'custom',
        position: { 
          x: this.dateToXPosition(task.startDate), 
          y: yPosition 
        },
        data: {
          label: task.name,
          shape: task.milestone ? 'gantt-milestone' : 'gantt-task',
          startDate: task.startDate,
          endDate: task.endDate,
          duration: task.duration,
          progress: task.progress || 0,
          priority: task.priority || 'medium',
          assignee: task.assignee,
          fillColor: this.getPriorityColor(task.priority || 'medium'),
          strokeColor: this.getPriorityStroke(task.priority || 'medium'),
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        },
        style: {
          width: this.calculateTaskWidth(task.duration),
          height: task.milestone ? 30 : 60
        }
      };

      nodes.push(node);
      yPosition += 80;
    }

    return nodes;
  }

  private createGanttEdges(tasks: GanttTask[]): Edge[] {
    const edges: Edge[] = [];

    for (const task of tasks) {
      if (task.dependencies) {
        for (const depId of task.dependencies) {
          const dependencyTask = tasks.find(t => t.id === depId || `task-${depId}` === task.id);
          if (dependencyTask) {
            edges.push({
              id: `dep-${dependencyTask.id}-${task.id}`,
              source: dependencyTask.id,
              target: task.id,
              type: 'straight', // Improved straight arrows for better alignment
              style: { stroke: '#64748b', strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
              label: 'depends on'
            });
          }
        }
      }
    }

    return edges;
  }

  private dateToXPosition(date: Date): number {
    const now = new Date();
    const daysDiff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return 100 + (daysDiff * 30); // 30px per day
  }

  /**
   * 📐 IMPROVED ALIGNMENT POSITIONING
   * Creates perfectly aligned grid positions for process flows
   */
  private createAlignedPositions(nodeCount: number, diagramType: string): Array<{x: number, y: number}> {
    const positions: Array<{x: number, y: number}> = [];
    const GRID_SIZE = 150; // Standard spacing for better alignment
    const START_X = 400; // Center alignment
    const START_Y = 100; // Top margin
    
    if (diagramType === 'flowchart' || diagramType === 'process') {
      // Vertical flow with perfect center alignment
      for (let i = 0; i < nodeCount; i++) {
        positions.push({
          x: START_X, // All nodes perfectly centered
          y: START_Y + (i * GRID_SIZE) // Equal vertical spacing
        });
      }
    } else if (diagramType === 'network') {
      // Grid layout for network diagrams
      const cols = Math.ceil(Math.sqrt(nodeCount));
      for (let i = 0; i < nodeCount; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        positions.push({
          x: START_X + (col - (cols-1)/2) * GRID_SIZE, // Center horizontally
          y: START_Y + row * GRID_SIZE
        });
      }
    } else {
      // Default linear layout with perfect alignment
      for (let i = 0; i < nodeCount; i++) {
        positions.push({
          x: START_X,
          y: START_Y + (i * GRID_SIZE)
        });
      }
    }
    
    return positions;
  }

  private calculateTaskWidth(duration: number): number {
    return Math.max(120, duration * 30); // Minimum 120px, 30px per day
  }

  private getPriorityColor(priority: string): string {
    const colors = {
      'critical': '#ef4444',
      'high': '#f97316',
      'medium': '#3b82f6',
      'low': '#10b981'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  }

  private getPriorityStroke(priority: string): string {
    const colors = {
      'critical': '#dc2626',
      'high': '#ea580c',
      'medium': '#2563eb',
      'low': '#059669'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  }

  private extractProjectName(prompt: string): string {
    // Extract meaningful project name from prompt
    const words = prompt.split(' ').slice(0, 4);
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  /**
   * 📊 OTHER DIAGRAM TEMPLATES
   */
  private generateFlowchartTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    const { prompt, complexity = 'medium' } = request;
    
    const steps = this.extractStepsFromPrompt(prompt, complexity);
    const nodes = this.createFlowchartNodes(steps);
    const edges = this.createFlowchartEdges(steps);

    return Promise.resolve({
      success: true,
      nodes,
      edges,
      title: `${this.generateTitleFromPrompt(prompt)} - Flowchart`,
      description: `Process flowchart with ${steps.length} steps and decision points`,
      confidence: 0.88,
      processingTime: 0,
      suggestions: [
        'Add decision points for branching logic',
        'Include error handling paths',
        'Add parallel processing options',
        'Customize node colors and styles'
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

  private generateNetworkTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    const { prompt, complexity = 'medium' } = request;
    
    const components = this.extractNetworkComponents(prompt, complexity);
    const nodes = this.createNetworkNodes(components);
    const edges = this.createNetworkEdges(components);

    return Promise.resolve({
      success: true,
      nodes,
      edges,
      title: `${this.generateTitleFromPrompt(prompt)} - Network Diagram`,
      description: `Network architecture with ${components.length} components and connections`,
      confidence: 0.85,
      processingTime: 0,
      suggestions: [
        'Add security zones and firewalls',
        'Include load balancers and redundancy',
        'Show data flow directions',
        'Add IP address ranges'
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

  // Additional template methods would go here...
  private generateProcessTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    const { prompt } = request;
    const promptLower = prompt.toLowerCase();
    
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

  private generateTimelineTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    // Implementation for timeline diagrams
    return this.generateGenericTemplate(request);
  }

  private generateDecisionTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    // Implementation for decision trees
    return this.generateRiskDecisionTreeTemplate(request);
  }

  private generateSwimlaneTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    // Implementation for swimlane diagrams
    return this.generateGenericTemplate(request);
  }

  /**
   * 🎯 RISK MANAGEMENT TEMPLATE
   * Professional risk management process with decision points and feedback loops
   */
  private generateRiskManagementTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    const nodes: Node[] = [
      // Risk Identification Phase
      {
        id: 'start',
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
        id: 'risk-register',
        type: 'custom',
        position: { x: 400, y: 150 },
        data: {
          label: 'Update Risk Register',
          shape: 'parallelogram',
          fillColor: '#e0e7ff',
          strokeColor: '#6366f1',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      // Risk Assessment Phase
      {
        id: 'likelihood-assessment',
        type: 'custom',
        position: { x: 200, y: 250 },
        data: {
          label: 'Likelihood Assessment',
          shape: 'rectangle',
          fillColor: '#f1f5f9',
          strokeColor: '#475569',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      {
        id: 'impact-assessment',
        type: 'custom',
        position: { x: 600, y: 250 },
        data: {
          label: 'Impact Assessment',
          shape: 'rectangle',
          fillColor: '#f1f5f9',
          strokeColor: '#475569',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      {
        id: 'risk-analysis',
        type: 'custom',
        position: { x: 400, y: 350 },
        data: {
          label: 'Risk Analysis & Prioritization',
          shape: 'rectangle',
          fillColor: '#f1f5f9',
          strokeColor: '#475569',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      // Risk Evaluation Decision Point
      {
        id: 'risk-evaluation',
        type: 'custom',
        position: { x: 400, y: 450 },
        data: {
          label: 'Risk Level Acceptable?',
          shape: 'diamond',
          fillColor: '#fef3c7',
          strokeColor: '#d97706',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      // Risk Treatment Options
      {
        id: 'treatment-selection',
        type: 'custom',
        position: { x: 400, y: 600 },
        data: {
          label: 'Select Treatment Strategy',
          shape: 'diamond',
          fillColor: '#fef3c7',
          strokeColor: '#d97706',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      // Treatment Options
      {
        id: 'accept',
        type: 'custom',
        position: { x: 100, y: 750 },
        data: {
          label: 'Accept Risk',
          shape: 'rectangle',
          fillColor: '#fef3c7',
          strokeColor: '#d97706',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      {
        id: 'mitigate',
        type: 'custom',
        position: { x: 300, y: 750 },
        data: {
          label: 'Mitigate Risk',
          shape: 'rectangle',
          fillColor: '#dbeafe',
          strokeColor: '#2563eb',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      {
        id: 'transfer',
        type: 'custom',
        position: { x: 500, y: 750 },
        data: {
          label: 'Transfer Risk',
          shape: 'rectangle',
          fillColor: '#e0e7ff',
          strokeColor: '#6366f1',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      {
        id: 'avoid',
        type: 'custom',
        position: { x: 700, y: 750 },
        data: {
          label: 'Avoid Risk',
          shape: 'rectangle',
          fillColor: '#fee2e2',
          strokeColor: '#dc2626',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      // Implementation and Monitoring
      {
        id: 'implementation',
        type: 'custom',
        position: { x: 400, y: 900 },
        data: {
          label: 'Implement Controls',
          shape: 'rectangle',
          fillColor: '#f1f5f9',
          strokeColor: '#475569',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      {
        id: 'monitoring',
        type: 'custom',
        position: { x: 400, y: 1000 },
        data: {
          label: 'Monitor & Review',
          shape: 'rectangle',
          fillColor: '#f1f5f9',
          strokeColor: '#475569',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      {
        id: 'effectiveness-check',
        type: 'custom',
        position: { x: 400, y: 1100 },
        data: {
          label: 'Controls Effective?',
          shape: 'diamond',
          fillColor: '#fef3c7',
          strokeColor: '#d97706',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      {
        id: 'accept-residual',
        type: 'custom',
        position: { x: 600, y: 1200 },
        data: {
          label: 'Accept Residual Risk',
          shape: 'circle',
          fillColor: '#dcfce7',
          strokeColor: '#16a34a',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      }
    ];

    const edges: Edge[] = [
      // Main flow
      {
        id: 'e1',
        source: 'start',
        target: 'risk-register',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
      },
      {
        id: 'e2a',
        source: 'risk-register',
        target: 'likelihood-assessment',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
      },
      {
        id: 'e2b',
        source: 'risk-register',
        target: 'impact-assessment',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
      },
      {
        id: 'e3a',
        source: 'likelihood-assessment',
        target: 'risk-analysis',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
      },
      {
        id: 'e3b',
        source: 'impact-assessment',
        target: 'risk-analysis',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
      },
      {
        id: 'e4',
        source: 'risk-analysis',
        target: 'risk-evaluation',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
      },
      // Decision branches
      {
        id: 'e5-accept-direct',
        source: 'risk-evaluation',
        target: 'accept-residual-risk',
        label: 'Yes',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#16a34a', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#16a34a' }
      },
      {
        id: 'e5-treat',
        source: 'risk-evaluation',
        target: 'treatment-selection',
        label: 'No',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#dc2626', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#dc2626' }
      },
      // Treatment options
      {
        id: 'e6a',
        source: 'treatment-selection',
        target: 'accept',
        label: 'Accept',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#d97706', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#d97706' }
      },
      {
        id: 'e6b',
        source: 'treatment-selection',
        target: 'mitigate',
        label: 'Mitigate',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#2563eb', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#2563eb' }
      },
      {
        id: 'e6c',
        source: 'treatment-selection',
        target: 'transfer',
        label: 'Transfer',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#6366f1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
      },
      {
        id: 'e6d',
        source: 'treatment-selection',
        target: 'avoid',
        label: 'Avoid',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#dc2626', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#dc2626' }
      },
      // Implementation flow
      {
        id: 'e7a',
        source: 'mitigate',
        target: 'implementation',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
      },
      {
        id: 'e7b',
        source: 'transfer',
        target: 'implementation',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
      },
      {
        id: 'e8',
        source: 'implementation',
        target: 'monitoring',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
      },
      {
        id: 'e9',
        source: 'monitoring',
        target: 'effectiveness-check',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
      },
      // Feedback loops
      {
        id: 'e10-success',
        source: 'effectiveness-check',
        target: 'accept-residual',
        label: 'Yes',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#16a34a', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#16a34a' }
      },
      {
        id: 'e10-feedback',
        source: 'effectiveness-check',
        target: 'treatment-selection',
        label: 'No - Reassess',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#dc2626', strokeWidth: 2, strokeDasharray: '5 5' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#dc2626' }
      },
      // Direct acceptance paths
      {
        id: 'e11',
        source: 'accept',
        target: 'accept-residual',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#16a34a', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#16a34a' }
      },
      // Continuous monitoring feedback
      {
        id: 'e12-continuous',
        source: 'accept-residual',
        target: 'start',
        label: 'Continuous Monitoring',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '10 5' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' }
      }
    ];

    // Add direct acceptance node if missing
    nodes.push({
      id: 'accept-residual-risk',
      type: 'custom',
      position: { x: 800, y: 450 },
      data: {
        label: 'Accept Risk\n(Low Level)',
        shape: 'circle',
        fillColor: '#dcfce7',
        strokeColor: '#16a34a',
        textColor: '#1e293b',
        onLabelChange: () => {},
        onUpdate: () => {}
      }
    });

    return Promise.resolve({
      success: true,
      nodes,
      edges,
      title: 'Risk Management Process Flow',
      description: 'Professional risk management workflow with assessment, treatment options, and continuous monitoring',
      confidence: 0.95,
      processingTime: 0,
      suggestions: [
        'Customize risk categories for your industry',
        'Add specific risk scoring criteria',
        'Include stakeholder approval processes',
        'Add risk communication workflows',
        'Integrate with risk management tools'
      ],
      metadata: {
        diagramType: 'process',
        nodeCount: nodes.length,
        edgeCount: edges.length,
        usedTemplate: true,
        apiProvider: 'template'
      }
    });
  }

  /**
   * 🚨 INCIDENT RESPONSE TEMPLATE
   */
  private generateIncidentResponseTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    const nodes: Node[] = [
      {
        id: 'detection',
        type: 'custom',
        position: { x: 400, y: 50 },
        data: {
          label: 'Incident Detection',
          shape: 'circle',
          fillColor: '#fee2e2',
          strokeColor: '#dc2626',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      {
        id: 'initial-triage',
        type: 'custom',
        position: { x: 400, y: 150 },
        data: {
          label: 'Initial Triage & Classification',
          shape: 'diamond',
          fillColor: '#fef3c7',
          strokeColor: '#d97706',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      {
        id: 'low-severity',
        type: 'custom',
        position: { x: 150, y: 300 },
        data: {
          label: 'Low Severity\nStandard Response',
          shape: 'rectangle',
          fillColor: '#dcfce7',
          strokeColor: '#16a34a',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      {
        id: 'high-severity',
        type: 'custom',
        position: { x: 650, y: 300 },
        data: {
          label: 'High Severity\nEscalate & Mobilize',
          shape: 'rectangle',
          fillColor: '#fee2e2',
          strokeColor: '#dc2626',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      {
        id: 'analysis',
        type: 'custom',
        position: { x: 400, y: 450 },
        data: {
          label: 'Analysis & Investigation',
          shape: 'rectangle',
          fillColor: '#f1f5f9',
          strokeColor: '#475569',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      {
        id: 'containment',
        type: 'custom',
        position: { x: 200, y: 600 },
        data: {
          label: 'Short-term\nContainment',
          shape: 'rectangle',
          fillColor: '#dbeafe',
          strokeColor: '#2563eb',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      {
        id: 'eradication',
        type: 'custom',
        position: { x: 400, y: 600 },
        data: {
          label: 'Eradication',
          shape: 'rectangle',
          fillColor: '#f1f5f9',
          strokeColor: '#475569',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      {
        id: 'recovery',
        type: 'custom',
        position: { x: 600, y: 600 },
        data: {
          label: 'Recovery &\nLong-term Containment',
          shape: 'rectangle',
          fillColor: '#dcfce7',
          strokeColor: '#16a34a',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      {
        id: 'lessons-learned',
        type: 'custom',
        position: { x: 400, y: 750 },
        data: {
          label: 'Post-Incident Review\n& Lessons Learned',
          shape: 'rectangle',
          fillColor: '#e0e7ff',
          strokeColor: '#6366f1',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      }
    ];

    const edges: Edge[] = [
      {
        id: 'e1',
        source: 'detection',
        target: 'initial-triage',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#dc2626', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#dc2626' }
      },
      {
        id: 'e2a',
        source: 'initial-triage',
        target: 'low-severity',
        label: 'Low',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#16a34a', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#16a34a' }
      },
      {
        id: 'e2b',
        source: 'initial-triage',
        target: 'high-severity',
        label: 'High/Critical',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#dc2626', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#dc2626' }
      },
      {
        id: 'e3a',
        source: 'low-severity',
        target: 'analysis',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
      },
      {
        id: 'e3b',
        source: 'high-severity',
        target: 'analysis',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
      },
      {
        id: 'e4a',
        source: 'analysis',
        target: 'containment',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#2563eb', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#2563eb' }
      },
      {
        id: 'e4b',
        source: 'analysis',
        target: 'eradication',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
      },
      {
        id: 'e4c',
        source: 'analysis',
        target: 'recovery',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#16a34a', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#16a34a' }
      },
      {
        id: 'e5',
        source: 'containment',
        target: 'lessons-learned',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
      },
      {
        id: 'e6',
        source: 'eradication',
        target: 'lessons-learned',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
      },
      {
        id: 'e7',
        source: 'recovery',
        target: 'lessons-learned',
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
      }
    ];

    return Promise.resolve({
      success: true,
      nodes,
      edges,
      title: 'Cybersecurity Incident Response Process',
      description: 'Comprehensive incident response workflow following NIST guidelines',
      confidence: 0.93,
      processingTime: 0,
      suggestions: [
        'Add communication workflows and stakeholder notifications',
        'Include evidence preservation and forensics steps',
        'Add legal and regulatory notification requirements',
        'Integrate with SIEM and security tools',
        'Add post-incident improvement recommendations'
      ],
      metadata: {
        diagramType: 'process',
        nodeCount: nodes.length,
        edgeCount: edges.length,
        usedTemplate: true,
        apiProvider: 'template'
      }
    });
  }

  /**
   * 📋 AUDIT PROCESS TEMPLATE
   */
  private generateAuditProcessTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    // Implementation would go here - similar structure to risk management
    return this.generateGenericProcessTemplate(request);
  }

  /**
   * 🔄 GENERIC PROCESS TEMPLATE
   */
  private generateGenericProcessTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    // Enhanced version of the current generic template
    return this.generateGenericTemplate(request);
  }

  /**
   * 🎯 RISK DECISION TREE TEMPLATE
   */
  private generateRiskDecisionTreeTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    // Implementation for risk decision trees
    return this.generateGenericTemplate(request);
  }

  /**
   * 🎯 ENHANCED GENERIC TEMPLATE
   * Creates richer, more professional generic process flows
   */
  private generateGenericTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    const { prompt, complexity = 'medium' } = request;
    
    // Analyze prompt for meaningful steps
    const steps = this.extractStepsFromPrompt(prompt, complexity);
    const nodes = this.createEnhancedFlowchartNodes(steps, complexity);
    const edges = this.createEnhancedFlowchartEdges(steps, complexity);
    
    // Ensure minimum richness for any diagram
    if (nodes.length < 5) {
      return this.generateMinimumRichTemplate(request);
    }

    return Promise.resolve({
      success: true,
      nodes,
      edges,
      title: this.generateTitleFromPrompt(request.prompt),
      description: `Professional ${request.diagramType} process with ${steps.length} steps, decision points, and workflow optimization`,
      confidence: 0.85,
      processingTime: 0,
      suggestions: [
        'Customize process steps for your specific workflow',
        'Add role-based swimlanes for multi-department processes',
        'Include exception handling paths',
        'Add timing and SLA considerations',
        'Integrate with existing systems and tools'
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
   * 💎 MINIMUM RICHNESS TEMPLATE
   * Ensures every diagram has at least 8+ nodes with decision points and parallel paths
   */
  private generateMinimumRichTemplate(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    const positions = this.createAlignedPositions(10, 'flowchart');
    
    const nodes: Node[] = [
      // Start
      {
        id: 'start',
        type: 'custom',
        position: positions[0],
        data: {
          label: 'Process Initiation',
          shape: 'circle',
          fillColor: '#dbeafe',
          strokeColor: '#2563eb',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      // Input validation
      {
        id: 'input-validation',
        type: 'custom',
        position: positions[1],
        data: {
          label: 'Input Validation',
          shape: 'diamond',
          fillColor: '#fef3c7',
          strokeColor: '#d97706',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      // Error handling path
      {
        id: 'error-handling',
        type: 'custom',
        position: { x: 150, y: positions[1].y },
        data: {
          label: 'Error Handling',
          shape: 'rectangle',
          fillColor: '#fee2e2',
          strokeColor: '#dc2626',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      // Primary processing
      {
        id: 'primary-processing',
        type: 'custom',
        position: positions[2],
        data: {
          label: 'Primary Processing',
          shape: 'rectangle',
          fillColor: '#f1f5f9',
          strokeColor: '#475569',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      // Parallel process 1
      {
        id: 'parallel-1',
        type: 'custom',
        position: { x: 200, y: positions[3].y },
        data: {
          label: 'Validation Check',
          shape: 'rectangle',
          fillColor: '#e0e7ff',
          strokeColor: '#6366f1',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      // Parallel process 2
      {
        id: 'parallel-2',
        type: 'custom',
        position: { x: 600, y: positions[3].y },
        data: {
          label: 'Documentation',
          shape: 'parallelogram',
          fillColor: '#f0f9ff',
          strokeColor: '#0ea5e9',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      // Quality check
      {
        id: 'quality-check',
        type: 'custom',
        position: positions[4],
        data: {
          label: 'Quality Assurance',
          shape: 'diamond',
          fillColor: '#fef3c7',
          strokeColor: '#d97706',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      // Approval process
      {
        id: 'approval-required',
        type: 'custom',
        position: positions[5],
        data: {
          label: 'Approval Required?',
          shape: 'diamond',
          fillColor: '#fef3c7',
          strokeColor: '#d97706',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      // Approval workflow
      {
        id: 'stakeholder-approval',
        type: 'custom',
        position: { x: 650, y: positions[5].y },
        data: {
          label: 'Stakeholder Approval',
          shape: 'rectangle',
          fillColor: '#fef3c7',
          strokeColor: '#d97706',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      // Final processing
      {
        id: 'final-processing',
        type: 'custom',
        position: positions[6],
        data: {
          label: 'Final Processing',
          shape: 'rectangle',
          fillColor: '#f1f5f9',
          strokeColor: '#475569',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      // Output generation
      {
        id: 'output-generation',
        type: 'custom',
        position: positions[7],
        data: {
          label: 'Output Generation',
          shape: 'parallelogram',
          fillColor: '#f0f9ff',
          strokeColor: '#0ea5e9',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      },
      // End
      {
        id: 'completion',
        type: 'custom',
        position: positions[8],
        data: {
          label: 'Process Completion',
          shape: 'circle',
          fillColor: '#dcfce7',
          strokeColor: '#16a34a',
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      }
    ];

    const edges: Edge[] = [
      // Main flow
      {
        id: 'e1',
        source: 'start',
        target: 'input-validation',
        type: 'straight',
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
      },
      // Error path
      {
        id: 'e2a',
        source: 'input-validation',
        target: 'error-handling',
        label: 'Invalid',
        type: 'straight',
        style: { stroke: '#dc2626', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#dc2626' }
      },
      // Success path
      {
        id: 'e2b',
        source: 'input-validation',
        target: 'primary-processing',
        label: 'Valid',
        type: 'straight',
        style: { stroke: '#16a34a', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#16a34a' }
      },
      // Error recovery
      {
        id: 'e3',
        source: 'error-handling',
        target: 'start',
        label: 'Retry',
        type: 'straight',
        style: { stroke: '#dc2626', strokeWidth: 2, strokeDasharray: '5,5' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#dc2626' }
      },
      // Parallel processing
      {
        id: 'e4a',
        source: 'primary-processing',
        target: 'parallel-1',
        type: 'straight',
        style: { stroke: '#6366f1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
      },
      {
        id: 'e4b',
        source: 'primary-processing',
        target: 'parallel-2',
        type: 'straight',
        style: { stroke: '#0ea5e9', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#0ea5e9' }
      },
      // Convergence to quality check
      {
        id: 'e5a',
        source: 'parallel-1',
        target: 'quality-check',
        type: 'straight',
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
      },
      {
        id: 'e5b',
        source: 'parallel-2',
        target: 'quality-check',
        type: 'straight',
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
      },
      // Quality check decisions
      {
        id: 'e6-fail',
        source: 'quality-check',
        target: 'primary-processing',
        label: 'Fail - Rework',
        type: 'straight',
        style: { stroke: '#dc2626', strokeWidth: 2, strokeDasharray: '5,5' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#dc2626' }
      },
      {
        id: 'e6-pass',
        source: 'quality-check',
        target: 'approval-required',
        label: 'Pass',
        type: 'straight',
        style: { stroke: '#16a34a', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#16a34a' }
      },
      // Approval flow
      {
        id: 'e7a',
        source: 'approval-required',
        target: 'stakeholder-approval',
        label: 'Yes',
        type: 'straight',
        style: { stroke: '#d97706', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#d97706' }
      },
      {
        id: 'e7b',
        source: 'approval-required',
        target: 'final-processing',
        label: 'No',
        type: 'straight',
        style: { stroke: '#16a34a', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#16a34a' }
      },
      // Approval completion
      {
        id: 'e8',
        source: 'stakeholder-approval',
        target: 'final-processing',
        type: 'straight',
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
      },
      // Final flow
      {
        id: 'e9',
        source: 'final-processing',
        target: 'output-generation',
        type: 'straight',
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
      },
      {
        id: 'e10',
        source: 'output-generation',
        target: 'completion',
        type: 'straight',
        style: { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#1e293b' }
      }
    ];

    return Promise.resolve({
      success: true,
      nodes,
      edges,
      title: this.generateTitleFromPrompt(request.prompt),
      description: `Comprehensive process workflow with ${nodes.length} steps, multiple decision points, parallel processing, error handling, and approval workflows`,
      confidence: 0.88,
      processingTime: 0,
      suggestions: [
        'Customize step names for your specific process',
        'Add role assignments and responsibilities',
        'Include timing and SLA requirements',
        'Add integration points with external systems',
        'Configure notification and escalation rules'
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
   * 🛠️ UTILITY METHODS
   */
  private buildProcessSpecificSystemPrompt(request: OneShotDiagramRequest): string {
    const processContext = this.getProcessContext(request.prompt, request.diagramType);
    
    return `You are an expert diagram designer specializing in ${processContext.domain} processes. Create a professional ${request.diagramType} diagram using ReactFlow node/edge format.

🚫 ABSOLUTELY FORBIDDEN:
- Do NOT create simple linear "Step 1, Step 2, Step 3..." sequences
- Do NOT use generic labels like "Process Step 1", "Task 2", etc.  
- Do NOT create workflows without decision points
- Do NOT make straight-line processes without branches or loops

✅ MANDATORY REQUIREMENTS:
${processContext.specificInstructions}

TECHNICAL REQUIREMENTS:
- Return ONLY valid JSON with "nodes" and "edges" arrays
- Each node must have: id, type: "custom", position: {x, y}, data: {label, shape, fillColor, strokeColor, textColor}
- Each edge must have: id, source, target, type, style, markerEnd
- Use professional ${request.diagramType} conventions for ${processContext.domain}
- Include meaningful process-specific labels and logical connections
- Apply industry-standard styling and colors
- MUST include multiple decision points (diamond shapes)
- MUST show parallel processes and feedback loops
- MUST use specific business terminology, not generic steps

${processContext.shapeGuidance}

Color Coding Guidelines:
- Start/End nodes: Blue/Green circles (#dbeafe/#dcfce7)
- Process steps: Light gray rectangles (#f1f5f9)
- Decision points: Yellow diamonds (#fef3c7)
- Critical/Risk nodes: Red rectangles (#fee2e2)
- Success/Completion: Green rectangles (#dcfce7)

Example Response Structure:
{
  "nodes": [
    {
      "id": "start",
      "type": "custom", 
      "position": {"x": 400, "y": 50},
      "data": {
        "label": "${processContext.startLabel}",
        "shape": "circle",
        "fillColor": "#dbeafe", 
        "strokeColor": "#2563eb",
        "textColor": "#1e293b"
      }
    }
  ],
  "edges": [
    {
      "id": "edge1",
      "source": "start",
      "target": "process1", 
      "type": "smoothstep",
      "style": {"stroke": "#1e293b", "strokeWidth": 2},
      "markerEnd": {"type": "arrowclosed", "color": "#1e293b"}
    }
  ],
  "title": "${processContext.defaultTitle}",
  "description": "Professional ${processContext.domain.toLowerCase()} process diagram",
  "confidence": 0.9
}`;
  }

  private buildProcessSpecificUserPrompt(request: OneShotDiagramRequest): string {
    const processContext = this.getProcessContext(request.prompt, request.diagramType);
    let prompt = `Create a comprehensive ${request.diagramType} diagram for: ${request.prompt}`;
    
    // Add process-specific requirements
    prompt += `\n\n${processContext.requirements}`;
    
    if (request.diagramType === 'gantt') {
      prompt += `\n\nGantt Chart Requirements:
- Use "gantt-task" shape for tasks and "gantt-milestone" shape for milestones
- Calculate realistic start/end dates and durations based on industry standards
- Include logical task dependencies and critical path
- Position nodes to show timeline progression (x-axis = time, y-axis = tasks)
- Use colors to indicate priority levels and resource allocation`;
    }

    // Add complexity-specific guidance
    if (request.complexity) {
      const complexityMap = {
        simple: `Simple approach with ${processContext.simpleNodeCount} main components focusing on core ${processContext.domain.toLowerCase()} steps`,
        medium: `Moderate complexity with ${processContext.mediumNodeCount} components including decision points and ${processContext.domain.toLowerCase()} best practices`,
        complex: `Comprehensive approach with ${processContext.complexNodeCount}+ components, multiple decision points, parallel processes, feedback loops, and complete ${processContext.domain.toLowerCase()} workflow coverage`
      };
      prompt += `\n\nComplexity Level: ${complexityMap[request.complexity]}`;
    }

    // Add industry context
    if (request.industry && request.industry !== 'general') {
      prompt += `\n\nIndustry Context: Apply ${request.industry} industry standards and best practices. Include industry-specific terminology and compliance considerations.`;
    }

    return prompt;
  }

  /**
   * 🎯 PROCESS CONTEXT ANALYZER
   * Determines the specific context and requirements for different process types
   */
  private getProcessContext(prompt: string, diagramType: string): any {
    const promptLower = prompt.toLowerCase();
    
    // Risk Management Process Context
    if (promptLower.includes('risk') && (promptLower.includes('management') || promptLower.includes('assessment') || promptLower.includes('analysis'))) {
      return {
        domain: 'Risk Management',
        startLabel: 'Risk Identification',
        defaultTitle: 'Risk Management Process',
        simpleNodeCount: '5-7',
        mediumNodeCount: '8-12',
        complexNodeCount: '15',
        specificInstructions: `Create a comprehensive risk management flowchart with proper decision points, parallel processes, and feedback loops. NEVER create simple linear "Step 1, Step 2" processes. This must be a professional risk management workflow with:
- Multiple decision diamonds for risk evaluation gates
- Parallel processing paths for different risk categories
- Feedback loops from monitoring back to identification
- Branch points for different treatment options
- Approval gates and escalation paths`,
        requirements: `Risk Management Process Requirements (MANDATORY DECISION POINTS):
1. START: Risk Identification (circle, blue)
2. Risk Register Check (diamond): "Risk already in register?" → Yes/No paths
3. Risk Assessment (rectangle): Analyze likelihood and impact
4. Risk Level Decision (diamond): "Risk level?" → Low/Medium/High/Critical paths
5. Treatment Strategy (diamond): "Treatment approach?" → Accept/Mitigate/Transfer/Avoid
6. For MITIGATE path: Risk Mitigation Planning → Implementation → Monitoring
7. For TRANSFER path: Insurance/Outsourcing evaluation → Contract setup
8. For AVOID path: Process redesign → Alternative approach
9. For ACCEPT path: Direct to monitoring
10. Monitoring & Review (rectangle) → feeds back to Risk Assessment
11. Escalation Decision (diamond): "Requires escalation?" → Management/Board approval
12. Risk Register Update (parallelogram) 
13. END: Risk Accepted/Mitigated (circle, green)

CRITICAL: Include at least 4-5 decision diamonds, show parallel paths, and feedback loops.`,
        shapeGuidance: `Shape Usage (ENFORCED):
- Circles: Start/End points only (Risk Identification, Final Acceptance)
- Rectangles: Process activities (Analysis, Planning, Implementation, Monitoring)
- Diamonds: ALL decision points (Register check, Risk level, Treatment choice, Escalation needs)
- Parallelograms: Documentation outputs (Risk Register, Reports, Contracts)`
      };
    }
    
    // Audit Process Context
    if (promptLower.includes('audit') || promptLower.includes('compliance') || promptLower.includes('assessment')) {
      return {
        domain: 'Audit & Compliance',
        startLabel: 'Audit Planning',
        defaultTitle: 'Audit Process Flow',
        simpleNodeCount: '6-8',
        mediumNodeCount: '10-15',
        complexNodeCount: '20',
        specificInstructions: `Create a comprehensive audit process with proper phases: Planning, Fieldwork, Reporting, and Follow-up. Include compliance checkpoints and evidence collection.`,
        requirements: `Audit Process Requirements:
- Start with Audit Planning and Scope Definition
- Include Risk Assessment and Control Testing phases
- Show Evidence Collection and Documentation steps
- Add Findings Analysis and Gap Identification
- Include Draft Report and Management Review processes
- Show Final Report generation and Follow-up actions
- Add compliance validation checkpoints
- Include stakeholder communication touchpoints`,
        shapeGuidance: `Shape Usage:
- Circles: Process start/end points
- Rectangles: Audit activities and documentation
- Diamonds: Compliance checkpoints and approval gates
- Hexagons: External stakeholder interactions`
      };
    }
    
    // Software Development Context
    if (promptLower.includes('software') || promptLower.includes('development') || promptLower.includes('app') || promptLower.includes('system')) {
      return {
        domain: 'Software Development',
        startLabel: 'Requirements Gathering',
        defaultTitle: 'Software Development Process',
        simpleNodeCount: '5-7',
        mediumNodeCount: '8-12',
        complexNodeCount: '15',
        specificInstructions: `Focus on SDLC phases with proper gates, testing, and deployment processes. Include version control, code review, and quality assurance.`,
        requirements: `Software Development Requirements:
- Include all SDLC phases: Planning, Analysis, Design, Implementation, Testing, Deployment
- Show code review and quality assurance gates
- Include testing phases: Unit, Integration, System, User Acceptance
- Add deployment pipeline and rollback procedures
- Show iterative feedback loops and agile practices
- Include version control and branch management
- Add monitoring and maintenance phases`,
        shapeGuidance: `Shape Usage:
- Circles: Project milestones and releases
- Rectangles: Development activities
- Diamonds: Quality gates and decision points
- Parallelograms: Documentation and deliverables`
      };
    }
    
    // Incident Response Context
    if (promptLower.includes('incident') && promptLower.includes('response')) {
      return {
        domain: 'Incident Response',
        startLabel: 'Incident Detection',
        defaultTitle: 'Incident Response Process',
        simpleNodeCount: '6-8',
        mediumNodeCount: '10-14',
        complexNodeCount: '18',
        specificInstructions: `Create a comprehensive incident response workflow following NIST guidelines with Detection, Analysis, Containment, Eradication, Recovery phases.`,
        requirements: `Incident Response Requirements:
- Start with Incident Detection and Reporting
- Include Initial Triage and Classification (use severity diamonds)
- Show Analysis and Investigation phases
- Include Containment strategies (Short-term and Long-term)
- Add Eradication and Recovery processes
- Show Post-Incident Review and Lessons Learned
- Include communication and escalation paths
- Add evidence preservation and forensics steps`,
        shapeGuidance: `Shape Usage:
- Circles: Detection triggers and closure
- Rectangles: Response activities and procedures
- Diamonds: Severity assessment and escalation decisions
- Parallelograms: Documentation and reports`
      };
    }
    
    // Business Process Context
    if (promptLower.includes('business') || promptLower.includes('workflow') || promptLower.includes('process')) {
      return {
        domain: 'Business Process',
        startLabel: 'Process Initiation',
        defaultTitle: 'Business Process Flow',
        simpleNodeCount: '5-7',
        mediumNodeCount: '8-12',
        complexNodeCount: '15',
        specificInstructions: `Focus on business process optimization with clear roles, responsibilities, and handoff points. Include approval workflows and exception handling.`,
        requirements: `Business Process Requirements:
- Define clear start and end points
- Include role-based swim lanes where appropriate
- Show approval workflows and decision gates
- Add exception handling and error paths
- Include timing and SLA considerations
- Show system integrations and touchpoints
- Add performance metrics and KPIs
- Include feedback and improvement loops`,
        shapeGuidance: `Shape Usage:
- Circles: Process triggers and completion
- Rectangles: Business activities and tasks
- Diamonds: Business decisions and approvals
- Parallelograms: Documents and forms`
      };
    }
    
    // Default Generic Context
    return {
      domain: 'General Process',
      startLabel: 'Process Start',
      defaultTitle: 'Process Flow Diagram',
      simpleNodeCount: '4-6',
      mediumNodeCount: '7-10',
      complexNodeCount: '12',
      specificInstructions: `Create a logical process flow with clear sequence and decision points.`,
      requirements: `General Process Requirements:
- Define clear start and end points
- Show logical sequence of activities
- Include decision points where appropriate
- Add parallel processes if relevant
- Include feedback loops and iterations
- Show error handling where needed`,
      shapeGuidance: `Shape Usage:
- Circles: Start/end points
- Rectangles: Process activities
- Diamonds: Decision points
- Parallelograms: Input/output documents`
    };
  }

  private parseGeminiResponse(content: string, request: OneShotDiagramRequest): OneShotDiagramResponse {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and convert to proper ReactFlow format
      const nodes = (parsed.nodes || []).map((node: any, index: number) => ({
        id: node.id || `node-${index}`,
        type: 'custom',
        position: node.position || { x: 100 + index * 200, y: 100 },
        data: {
          label: node.data?.label || node.label || 'Node',
          shape: node.data?.shape || 'rectangle',
          fillColor: node.data?.fillColor || '#f1f5f9',
          strokeColor: node.data?.strokeColor || '#475569',
          textColor: node.data?.textColor || '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      }));

      const edges = (parsed.edges || []).map((edge: any, index: number) => ({
        id: edge.id || `edge-${index}`,
        source: edge.source,
        target: edge.target,
        type: edge.type || 'smoothstep',
        style: edge.style || { stroke: '#1e293b', strokeWidth: 2 },
        markerEnd: edge.markerEnd || { type: MarkerType.ArrowClosed, color: '#1e293b' },
        label: edge.label
      }));

      return {
        success: true,
        nodes,
        edges,
        title: parsed.title || this.generateTitleFromPrompt(request.prompt),
        description: parsed.description || `AI-generated ${request.diagramType} diagram`,
        confidence: parsed.confidence || 0.8,
        processingTime: 0,
        suggestions: parsed.suggestions || ['Customize colors and styling', 'Add more details', 'Refine connections'],
        metadata: {
          diagramType: request.diagramType,
          nodeCount: nodes.length,
          edgeCount: edges.length,
          usedTemplate: false,
          apiProvider: 'gemini'
        }
      };

    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper methods for template generation
  private extractStepsFromPrompt(prompt: string, complexity: string): any[] {
    const promptLower = prompt.toLowerCase();
    const steps = [];
    
    // Intelligence: Parse prompt for explicit steps first
    const explicitSteps = prompt.match(/(?:\d+\.?\s+)([^,\n]+)/g);
    
    if (explicitSteps && explicitSteps.length > 0) {
      explicitSteps.forEach((step, index) => {
        const stepName = step.replace(/^\d+\.?\s+/, '').trim();
        steps.push({
          id: `step-${index + 1}`,
          name: stepName,
          type: index === 0 ? 'start' : index === explicitSteps.length - 1 ? 'end' : 'process'
        });
      });
    } else {
      // Generate intelligent steps based on process type and content
      const processSteps = this.getProcessSpecificSteps(promptLower, complexity);
      processSteps.forEach((step, index) => {
        steps.push({
          id: `step-${index + 1}`,
          name: step.name,
          type: step.type,
          shape: step.shape || 'rectangle'
        });
      });
    }
    
    return steps;
  }

  /**
   * Get process-specific steps instead of generic "Step 1, Step 2" 
   */
  private getProcessSpecificSteps(promptLower: string, complexity: string): any[] {
    const stepCount = complexity === 'simple' ? 5 : complexity === 'medium' ? 8 : 12;
    
    // Software Development Process
    if (promptLower.includes('software') || promptLower.includes('development')) {
      const softwareSteps = [
        { name: 'Requirements Analysis', type: 'start', shape: 'circle' },
        { name: 'System Design', type: 'process', shape: 'rectangle' },
        { name: 'Architecture Review', type: 'process', shape: 'diamond' },
        { name: 'Implementation', type: 'process', shape: 'rectangle' },
        { name: 'Code Review', type: 'process', shape: 'diamond' },
        { name: 'Unit Testing', type: 'process', shape: 'rectangle' },
        { name: 'Integration Testing', type: 'process', shape: 'rectangle' },
        { name: 'User Acceptance Testing', type: 'process', shape: 'rectangle' },
        { name: 'Deployment', type: 'process', shape: 'rectangle' },
        { name: 'Production Monitoring', type: 'end', shape: 'circle' }
      ];
      return softwareSteps.slice(0, Math.min(stepCount, softwareSteps.length));
    }
    
    // Business Process
    if (promptLower.includes('business') || promptLower.includes('workflow')) {
      const businessSteps = [
        { name: 'Process Initiation', type: 'start', shape: 'circle' },
        { name: 'Request Validation', type: 'process', shape: 'diamond' },
        { name: 'Initial Processing', type: 'process', shape: 'rectangle' },
        { name: 'Approval Required?', type: 'process', shape: 'diamond' },
        { name: 'Stakeholder Review', type: 'process', shape: 'rectangle' },
        { name: 'Process Execution', type: 'process', shape: 'rectangle' },
        { name: 'Quality Check', type: 'process', shape: 'diamond' },
        { name: 'Documentation', type: 'process', shape: 'parallelogram' },
        { name: 'Process Completion', type: 'end', shape: 'circle' }
      ];
      return businessSteps.slice(0, Math.min(stepCount, businessSteps.length));
    }
    
    // Data Processing
    if (promptLower.includes('data') || promptLower.includes('etl')) {
      const dataSteps = [
        { name: 'Data Source Identification', type: 'start', shape: 'parallelogram' },
        { name: 'Data Extraction', type: 'process', shape: 'rectangle' },
        { name: 'Data Validation', type: 'process', shape: 'diamond' },
        { name: 'Data Transformation', type: 'process', shape: 'rectangle' },
        { name: 'Data Cleansing', type: 'process', shape: 'rectangle' },
        { name: 'Quality Checks', type: 'process', shape: 'diamond' },
        { name: 'Data Loading', type: 'process', shape: 'rectangle' },
        { name: 'Data Storage', type: 'end', shape: 'parallelogram' }
      ];
      return dataSteps.slice(0, Math.min(stepCount, dataSteps.length));
    }
    
    // Customer Service Process
    if (promptLower.includes('customer') || promptLower.includes('service')) {
      const customerSteps = [
        { name: 'Customer Contact', type: 'start', shape: 'circle' },
        { name: 'Issue Classification', type: 'process', shape: 'diamond' },
        { name: 'Initial Assessment', type: 'process', shape: 'rectangle' },
        { name: 'Resolution Attempt', type: 'process', shape: 'rectangle' },
        { name: 'Issue Resolved?', type: 'process', shape: 'diamond' },
        { name: 'Escalation Process', type: 'process', shape: 'rectangle' },
        { name: 'Customer Follow-up', type: 'process', shape: 'rectangle' },
        { name: 'Case Closure', type: 'end', shape: 'circle' }
      ];
      return customerSteps.slice(0, Math.min(stepCount, customerSteps.length));
    }
    
    // Generic Process - but with meaningful names
    const genericSteps = [
      { name: 'Process Initiation', type: 'start', shape: 'circle' },
      { name: 'Input Validation', type: 'process', shape: 'diamond' },
      { name: 'Primary Processing', type: 'process', shape: 'rectangle' },
      { name: 'Quality Control', type: 'process', shape: 'diamond' },
      { name: 'Secondary Processing', type: 'process', shape: 'rectangle' },
      { name: 'Final Review', type: 'process', shape: 'rectangle' },
      { name: 'Output Generation', type: 'process', shape: 'parallelogram' },
      { name: 'Process Completion', type: 'end', shape: 'circle' }
    ];
    
    return genericSteps.slice(0, Math.min(stepCount, genericSteps.length));
  }

  private extractNetworkComponents(prompt: string, complexity: string): any[] {
    const components = [];
    const promptLower = prompt.toLowerCase();
    
    // Intelligence: Identify network components from prompt
    if (promptLower.includes('server')) components.push({ id: 'server', name: 'Server', type: 'server' });
    if (promptLower.includes('database')) components.push({ id: 'db', name: 'Database', type: 'database' });
    if (promptLower.includes('firewall')) components.push({ id: 'firewall', name: 'Firewall', type: 'security' });
    if (promptLower.includes('router')) components.push({ id: 'router', name: 'Router', type: 'network' });
    
    // Add default components if none detected
    if (components.length === 0) {
      components.push(
        { id: 'user', name: 'Users', type: 'user' },
        { id: 'web-server', name: 'Web Server', type: 'server' },
        { id: 'app-server', name: 'App Server', type: 'server' },
        { id: 'database', name: 'Database', type: 'database' }
      );
    }
    
    return components;
  }

  /**
   * 📐 ENHANCED FLOWCHART NODE CREATION
   * Creates professional flowchart nodes with better positioning and styling
   */
  private createEnhancedFlowchartNodes(steps: any[], complexity: string): Node[] {
    const positions = this.createAlignedPositions(steps.length, 'flowchart');
    
    return steps.map((step, index) => {
      const shape = step.shape || (step.type === 'start' || step.type === 'end' ? 'circle' : 'rectangle');
      let fillColor = '#f1f5f9';
      let strokeColor = '#475569';
      
      // Enhanced color coding based on step type and shape
      if (step.type === 'start') {
        fillColor = '#dbeafe';
        strokeColor = '#2563eb';
      } else if (step.type === 'end') {
        fillColor = '#dcfce7';
        strokeColor = '#16a34a';
      } else if (shape === 'diamond') {
        fillColor = '#fef3c7';
        strokeColor = '#d97706';
      } else if (shape === 'parallelogram') {
        fillColor = '#e0e7ff';
        strokeColor = '#6366f1';
      } else if (step.name.toLowerCase().includes('error') || step.name.toLowerCase().includes('fail')) {
        fillColor = '#fee2e2';
        strokeColor = '#dc2626';
      } else if (step.name.toLowerCase().includes('approval') || step.name.toLowerCase().includes('review')) {
        fillColor = '#fef3c7';
        strokeColor = '#d97706';
      }
      
      return {
        id: step.id,
        type: 'custom',
        position: positions[index] || { x: 400, y: 100 + index * 120 },
        data: {
          label: step.name,
          shape,
          fillColor,
          strokeColor,
          textColor: '#1e293b',
          onLabelChange: () => {},
          onUpdate: () => {}
        }
      };
    });
  }
  
  private createFlowchartNodes(steps: any[]): Node[] {
    return this.createEnhancedFlowchartNodes(steps, 'medium');
  }

  /**
   * 🔗 ENHANCED FLOWCHART EDGE CREATION
   * Creates professional flowchart edges with decision branching and feedback loops
   */
  private createEnhancedFlowchartEdges(steps: any[], complexity: string): Edge[] {
    const edges: Edge[] = [];
    let edgeCounter = 0;
    
    for (let i = 0; i < steps.length - 1; i++) {
      const currentStep = steps[i];
      const nextStep = steps[i + 1];
      
      // Determine edge style based on step types
      let edgeStyle = { stroke: '#1e293b', strokeWidth: 2 };
      let label = undefined;
      
      // Enhanced logic for decision points with branching
      if (currentStep.shape === 'diamond') {
        // Create main success path
        label = nextStep.type === 'end' ? 'Approved' : 'Yes/Continue';
        edgeStyle.stroke = '#16a34a';
        
        // Add alternative path for decision points (failure/rejection)
        if (i > 1 && complexity !== 'simple') {
          const alternativeTarget = i > 2 ? steps[Math.max(0, i - 2)].id : 'start';
          edges.push({
            id: `edge-alt-${edgeCounter++}`,
            source: currentStep.id,
            target: alternativeTarget,
            type: 'straight',
            label: 'No/Reject',
            style: { stroke: '#dc2626', strokeWidth: 2, strokeDasharray: '5,5' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#dc2626' }
          });
        }
      } else if (currentStep.name.toLowerCase().includes('error')) {
        // Error recovery paths
        label = 'Retry';
        edgeStyle = { stroke: '#dc2626', strokeWidth: 2, strokeDasharray: '5,5' };
      } else if (currentStep.name.toLowerCase().includes('parallel') || currentStep.name.toLowerCase().includes('validation')) {
        // Parallel process styling
        edgeStyle.stroke = '#6366f1';
      }
      
      // Main edge
      edges.push({
        id: `edge-${edgeCounter++}`,
        source: currentStep.id,
        target: nextStep.id,
        type: 'straight',
        label,
        style: edgeStyle,
        markerEnd: { type: MarkerType.ArrowClosed, color: edgeStyle.stroke }
      });
      
      // Add feedback loops for complex processes
      if (complexity === 'complex' && currentStep.name.toLowerCase().includes('review') && i < steps.length - 2) {
        const feedbackTarget = steps[Math.max(0, i - 1)].id;
        edges.push({
          id: `edge-feedback-${edgeCounter++}`,
          source: currentStep.id,
          target: feedbackTarget,
          type: 'straight',
          label: 'Revision Required',
          style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '10,5' },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' }
        });
      }
    }
    
    return edges;
  }
  
  private createFlowchartEdges(steps: any[]): Edge[] {
    return this.createEnhancedFlowchartEdges(steps, 'medium');
  }

  private createNetworkNodes(components: any[]): Node[] {
    return components.map((comp, index) => ({
      id: comp.id,
      type: 'custom',
      position: { x: 150 + (index % 3) * 200, y: 100 + Math.floor(index / 3) * 150 },
      data: {
        label: comp.name,
        shape: comp.type === 'database' ? 'hexagon' : 'rectangle',
        fillColor: this.getNetworkTypeColor(comp.type),
        strokeColor: this.getNetworkTypeStroke(comp.type),
        textColor: '#1e293b',
        onLabelChange: () => {},
        onUpdate: () => {}
      }
    }));
  }

  private createNetworkEdges(components: any[]): Edge[] {
    const edges: Edge[] = [];
    
    // Create logical connections between components
    for (let i = 0; i < components.length - 1; i++) {
      edges.push({
        id: `conn-${i}`,
        source: components[i].id,
        target: components[i + 1].id,
        type: 'straight', // Improved straight arrows for better alignment
        style: { stroke: '#64748b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' }
      });
    }
    
    return edges;
  }

  private getNetworkTypeColor(type: string): string {
    const colors = {
      'server': '#e1f5fe',
      'database': '#f3e5f5',
      'security': '#ffebee',
      'network': '#e8f5e8',
      'user': '#fff3e0'
    };
    return colors[type as keyof typeof colors] || '#f1f5f9';
  }

  private getNetworkTypeStroke(type: string): string {
    const strokes = {
      'server': '#0288d1',
      'database': '#7b1fa2',
      'security': '#d32f2f',
      'network': '#2e7d32',
      'user': '#f57c00'
    };
    return strokes[type as keyof typeof strokes] || '#475569';
  }

  private generateTitleFromPrompt(prompt: string): string {
    const words = prompt.split(' ').slice(0, 4);
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
}

export const oneShotDiagramService = OneShotDiagramService.getInstance();