/**
 * 🔍 Diagram Validation Service
 * Handles parsing, validation, and data extraction for AI-generated diagrams
 * Extracted from OneShotDiagramService for better maintainability and separation of concerns
 */

import { MarkerType } from 'reactflow';
import type { OneShotDiagramRequest, OneShotDiagramResponse, GanttTask } from './OneShotDiagramService';

export class DiagramValidationService {
  private static instance: DiagramValidationService;

  private constructor() {}

  public static getInstance(): DiagramValidationService {
    if (!DiagramValidationService.instance) {
      DiagramValidationService.instance = new DiagramValidationService();
    }
    return DiagramValidationService.instance;
  }

  /**
   * 🔍 GEMINI RESPONSE PARSER
   * Parses and validates AI-generated diagram responses
   */
  public parseGeminiResponse(content: string, request: OneShotDiagramRequest): OneShotDiagramResponse {
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

  /**
   * 📝 GANTT TASK EXTRACTION
   * Extracts project tasks and phases from user prompts
   */
  public extractTasksFromPrompt(prompt: string, complexity: string): GanttTask[] {
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

  /**
   * 📋 FLOWCHART STEPS EXTRACTION  
   * Extracts process steps from user prompts with intelligent categorization
   */
  public extractStepsFromPrompt(prompt: string, complexity: string): any[] {
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
   * 🌐 NETWORK COMPONENTS EXTRACTION
   * Extracts network components and infrastructure elements from prompts
   */
  public extractNetworkComponents(prompt: string, complexity: string): any[] {
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
   * 🏗️ PROJECT PHASE IDENTIFICATION
   * Identifies project type and returns appropriate phases
   */
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

  /**
   * ⏱️ PHASE DURATION CALCULATION
   * Calculates realistic durations based on phase type and complexity
   */
  private calculatePhaseDuration(phaseName: string, complexity: string): number {
    const phaseNameLower = phaseName.toLowerCase();
    const complexityMultiplier = complexity === 'simple' ? 0.7 : complexity === 'complex' ? 1.5 : 1.0;
    
    // Base durations in days
    const baseDurations: { [key: string]: number } = {
      'planning': 7,
      'analysis': 10,
      'design': 14,
      'development': 21,
      'testing': 14,
      'deployment': 7,
      'review': 5,
      'documentation': 3
    };
    
    // Find matching phase type
    for (const [type, baseDuration] of Object.entries(baseDurations)) {
      if (phaseNameLower.includes(type)) {
        return Math.ceil(baseDuration * complexityMultiplier);
      }
    }
    
    // Default duration
    return Math.ceil(10 * complexityMultiplier);
  }

  /**
   * 🔧 PROCESS-SPECIFIC STEPS GENERATOR
   * Generates intelligent steps instead of generic "Step 1, Step 2"
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

  /**
   * 🎯 TITLE GENERATOR
   * Generates meaningful titles from user prompts
   */
  public generateTitleFromPrompt(prompt: string): string {
    const words = prompt.split(' ').slice(0, 4);
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  // Phase generation methods - import template service
  private getSoftwareDevelopmentPhases(complexity: string): any[] {
    const { DiagramTemplateService } = require('./DiagramTemplateService');
    return DiagramTemplateService.getInstance().getSoftwareDevelopmentPhases(complexity);
  }

  private getAuditCompliancePhases(complexity: string): any[] {
    const { DiagramTemplateService } = require('./DiagramTemplateService');
    return DiagramTemplateService.getInstance().getAuditCompliancePhases(complexity);
  }

  private getMarketingCampaignPhases(complexity: string): any[] {
    const { DiagramTemplateService } = require('./DiagramTemplateService');
    return DiagramTemplateService.getInstance().getMarketingCampaignPhases(complexity);
  }

  private getConstructionPhases(complexity: string): any[] {
    const { DiagramTemplateService } = require('./DiagramTemplateService');
    return DiagramTemplateService.getInstance().getConstructionPhases(complexity);
  }

  private getGenericProjectPhases(complexity: string): any[] {
    const { DiagramTemplateService } = require('./DiagramTemplateService');
    return DiagramTemplateService.getInstance().getGenericProjectPhases(complexity);
  }
}