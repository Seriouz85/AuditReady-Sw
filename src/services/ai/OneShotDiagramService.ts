/**
 * 🧠 One-Shot AI Diagram Generation Service (Refactored)
 * Orchestrates AI diagram generation using specialized service components
 * 
 * ✨ REFACTORED ARCHITECTURE:
 * - AIPromptService: Handles AI prompts and Gemini API integration
 * - DiagramTemplateService: Manages intelligent template generation
 * - DiagramValidationService: Handles parsing and validation
 * - DiagramGenerationService: Creates nodes, edges, and positioning
 * 
 * This orchestrator coordinates all services while maintaining the same public API
 */

import { Node, Edge, MarkerType } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { AIPromptService } from './AIPromptService';
import { DiagramTemplateService } from './DiagramTemplateService';
import { DiagramValidationService } from './DiagramValidationService';
import { DiagramGenerationService } from './DiagramGenerationService';

// Type definitions
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

  // Service dependencies
  private aiPromptService: AIPromptService;
  private templateService: DiagramTemplateService;
  private validationService: DiagramValidationService;
  private generationService: DiagramGenerationService;

  private constructor() {
    // Initialize all specialized services
    this.aiPromptService = AIPromptService.getInstance();
    this.templateService = DiagramTemplateService.getInstance();
    this.validationService = DiagramValidationService.getInstance();
    this.generationService = DiagramGenerationService.getInstance();
  }

  public static getInstance(): OneShotDiagramService {
    if (!OneShotDiagramService.instance) {
      OneShotDiagramService.instance = new OneShotDiagramService();
    }
    return OneShotDiagramService.instance;
  }

  /**
   * 🎯 ONE-SHOT DIAGRAM GENERATION (Orchestrator)
   * Single method call → Complete diagram using specialized services
   */
  public async generateDiagram(request: OneShotDiagramRequest): Promise<OneShotDiagramResponse> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 One-shot diagram generation started:', request);

      // Check for Gemini API key and determine generation strategy
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      let response: OneShotDiagramResponse;

      if (geminiKey) {
        try {
          // Use AI service for Gemini generation
          response = await this.aiPromptService.generateWithGemini(request, geminiKey);
          response.metadata = {
            ...response.metadata,
            apiProvider: 'gemini'
          };
        } catch (geminiError) {
          console.warn('⚠️ Gemini API failed, falling back to intelligent templates:', geminiError);
          // Fallback to template service
          response = await this.templateService.generateWithIntelligentTemplate(request);
          response.metadata = {
            ...response.metadata,
            apiProvider: 'template',
            usedTemplate: true
          };
        }
      } else {
        console.log('💡 No Gemini API key found, using intelligent templates');
        // Use template service directly
        response = await this.templateService.generateWithIntelligentTemplate(request);
        response.metadata = {
          ...response.metadata,
          apiProvider: 'template',
          usedTemplate: true
        };
      }

      // Set processing time and log success
      response.processingTime = Date.now() - startTime;
      console.log('✅ Diagram generated successfully in', response.processingTime, 'ms');
      console.log('📊 Generated', response.metadata?.nodeCount, 'nodes and', response.metadata?.edgeCount, 'edges');
      
      return response;

    } catch (error) {
      console.error('❌ One-shot diagram generation failed:', error);
      return this.createErrorResponse(error, Date.now() - startTime);
    }
  }

  /**
   * 🔧 VALIDATION AND UTILITY METHODS
   * Public methods to access validation service functionality
   */
  public validateDiagramRequest(request: OneShotDiagramRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.prompt || request.prompt.trim().length === 0) {
      errors.push('Prompt is required');
    }

    if (request.prompt && request.prompt.length > 2000) {
      errors.push('Prompt is too long (max 2000 characters)');
    }

    const validDiagramTypes = ['flowchart', 'gantt', 'network', 'process', 'timeline', 'decision', 'swimlane'];
    if (!validDiagramTypes.includes(request.diagramType)) {
      errors.push(`Invalid diagram type. Must be one of: ${validDiagramTypes.join(', ')}`);
    }

    const validComplexity = ['simple', 'medium', 'complex'];
    if (request.complexity && !validComplexity.includes(request.complexity)) {
      errors.push(`Invalid complexity. Must be one of: ${validComplexity.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 📝 EXTRACT TASKS FOR EXTERNAL USE
   * Public access to task extraction functionality
   */
  public extractTasksFromPrompt(prompt: string, complexity: string = 'medium'): GanttTask[] {
    return this.validationService.extractTasksFromPrompt(prompt, complexity);
  }

  /**
   * 📋 EXTRACT STEPS FOR EXTERNAL USE
   * Public access to step extraction functionality
   */
  public extractStepsFromPrompt(prompt: string, complexity: string = 'medium'): any[] {
    return this.validationService.extractStepsFromPrompt(prompt, complexity);
  }

  /**
   * 🌐 EXTRACT NETWORK COMPONENTS FOR EXTERNAL USE
   * Public access to network component extraction
   */
  public extractNetworkComponents(prompt: string, complexity: string = 'medium'): any[] {
    return this.validationService.extractNetworkComponents(prompt, complexity);
  }

  /**
   * 🎨 GENERATE NODES FOR EXTERNAL USE
   * Public access to node generation functionality
   */
  public createGanttNodes(tasks: GanttTask[]): ReactFlowGanttNode[] {
    return this.generationService.createGanttNodes(tasks);
  }

  public createFlowchartNodes(steps: any[], complexity: string = 'medium'): Node[] {
    return this.generationService.createEnhancedFlowchartNodes(steps, complexity);
  }

  public createNetworkNodes(components: any[]): Node[] {
    return this.generationService.createNetworkNodes(components);
  }

  /**
   * 🔗 GENERATE EDGES FOR EXTERNAL USE
   * Public access to edge generation functionality
   */
  public createGanttEdges(tasks: GanttTask[]): Edge[] {
    return this.generationService.createGanttEdges(tasks);
  }

  public createFlowchartEdges(steps: any[], complexity: string = 'medium'): Edge[] {
    return this.generationService.createEnhancedFlowchartEdges(steps, complexity);
  }

  public createNetworkEdges(components: any[]): Edge[] {
    return this.generationService.createNetworkEdges(components);
  }

  /**
   * 🎯 GENERATE TITLE FOR EXTERNAL USE
   * Public access to title generation
   */
  public generateTitleFromPrompt(prompt: string): string {
    return this.validationService.generateTitleFromPrompt(prompt);
  }

  /**
   * ❌ ERROR RESPONSE GENERATOR
   * Creates standardized error responses
   */
  private createErrorResponse(error: unknown, processingTime: number): OneShotDiagramResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      nodes: [],
      edges: [],
      title: 'Generation Failed',
      description: `Failed to generate diagram: ${errorMessage}`,
      confidence: 0,
      processingTime,
      suggestions: [
        'Try a simpler prompt',
        'Check your internet connection',
        'Ensure the diagram type is supported',
        'Contact support if the issue persists'
      ],
      error: errorMessage,
      metadata: {
        diagramType: 'error',
        nodeCount: 0,
        edgeCount: 0,
        usedTemplate: false,
        apiProvider: 'template'
      }
    };
  }

  /**
   * 📊 SERVICE HEALTH CHECK
   * Verifies all services are initialized and functioning
   */
  public getServiceHealth(): { healthy: boolean; services: { [key: string]: boolean } } {
    const serviceStatus = {
      aiPromptService: !!this.aiPromptService,
      templateService: !!this.templateService,
      validationService: !!this.validationService,
      generationService: !!this.generationService
    };

    const healthy = Object.values(serviceStatus).every(status => status);

    return {
      healthy,
      services: serviceStatus
    };
  }

  /**
   * 🔧 SERVICE CONFIGURATION
   * Returns configuration details for debugging
   */
  public getServiceConfiguration(): { 
    version: string; 
    services: string[]; 
    geminiEnabled: boolean;
    supportedDiagramTypes: string[];
  } {
    return {
      version: '2.0.0-refactored',
      services: [
        'AIPromptService',
        'DiagramTemplateService', 
        'DiagramValidationService',
        'DiagramGenerationService'
      ],
      geminiEnabled: !!import.meta.env.VITE_GEMINI_API_KEY,
      supportedDiagramTypes: ['flowchart', 'gantt', 'network', 'process', 'timeline', 'decision', 'swimlane']
    };
  }
}

// Export singleton instance for compatibility
export const oneShotDiagramService = OneShotDiagramService.getInstance();

export default OneShotDiagramService;