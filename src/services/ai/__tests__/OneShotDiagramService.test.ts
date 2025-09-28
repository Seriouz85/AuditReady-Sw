import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OneShotDiagramService, OneShotDiagramRequest, OneShotDiagramResponse } from '../OneShotDiagramService';
import { AIPromptService } from '../AIPromptService';
import { DiagramTemplateService } from '../DiagramTemplateService';
import { DiagramValidationService } from '../DiagramValidationService';
import { DiagramGenerationService } from '../DiagramGenerationService';

// Mock the service dependencies
vi.mock('../AIPromptService');
vi.mock('../DiagramTemplateService');
vi.mock('../DiagramValidationService');
vi.mock('../DiagramGenerationService');

describe('OneShotDiagramService', () => {
  let service: OneShotDiagramService;
  let mockAIPromptService: any;
  let mockTemplateService: any;
  let mockValidationService: any;
  let mockGenerationService: any;

  const mockNodes = [
    {
      id: '1',
      type: 'default',
      position: { x: 100, y: 100 },
      data: { label: 'Start' }
    },
    {
      id: '2',
      type: 'default',
      position: { x: 200, y: 200 },
      data: { label: 'End' }
    }
  ];

  const mockEdges = [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'default'
    }
  ];

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup mock service instances
    mockAIPromptService = {
      generateDiagram: vi.fn(),
      generateFlowchartPrompt: vi.fn(),
      generateGanttPrompt: vi.fn()
    };

    mockTemplateService = {
      generateFromTemplate: vi.fn(),
      getAvailableTemplates: vi.fn(),
      createCustomTemplate: vi.fn()
    };

    mockValidationService = {
      validateAndParseDiagram: vi.fn(),
      validateNodes: vi.fn(),
      validateEdges: vi.fn()
    };

    mockGenerationService = {
      generateNodes: vi.fn(),
      generateEdges: vi.fn(),
      calculatePositions: vi.fn(),
      generateGanttNodes: vi.fn()
    };

    // Mock the getInstance methods
    (AIPromptService.getInstance as any).mockReturnValue(mockAIPromptService);
    (DiagramTemplateService.getInstance as any).mockReturnValue(mockTemplateService);
    (DiagramValidationService.getInstance as any).mockReturnValue(mockValidationService);
    (DiagramGenerationService.getInstance as any).mockReturnValue(mockGenerationService);

    // Get fresh instance for each test
    service = OneShotDiagramService.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should create a singleton instance', () => {
      const instance1 = OneShotDiagramService.getInstance();
      const instance2 = OneShotDiagramService.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should initialize all service dependencies', () => {
      expect(AIPromptService.getInstance).toHaveBeenCalled();
      expect(DiagramTemplateService.getInstance).toHaveBeenCalled();
      expect(DiagramValidationService.getInstance).toHaveBeenCalled();
      expect(DiagramGenerationService.getInstance).toHaveBeenCalled();
    });
  });

  describe('generateDiagram', () => {
    const basicRequest: OneShotDiagramRequest = {
      prompt: 'Create a simple flowchart for user authentication',
      diagramType: 'flowchart',
      complexity: 'simple'
    };

    it('should successfully generate a flowchart diagram', async () => {
      // Mock successful AI response
      mockAIPromptService.generateDiagram.mockResolvedValue({
        success: true,
        content: 'Start -> Login -> Verify -> Dashboard',
        confidence: 0.9
      });

      // Mock successful validation
      mockValidationService.validateAndParseDiagram.mockResolvedValue({
        success: true,
        parsedContent: {
          nodes: [
            { id: 'start', label: 'Start' },
            { id: 'login', label: 'Login' },
            { id: 'verify', label: 'Verify' },
            { id: 'dashboard', label: 'Dashboard' }
          ],
          edges: [
            { source: 'start', target: 'login' },
            { source: 'login', target: 'verify' },
            { source: 'verify', target: 'dashboard' }
          ]
        }
      });

      // Mock generation services
      mockGenerationService.generateNodes.mockReturnValue(mockNodes);
      mockGenerationService.generateEdges.mockReturnValue(mockEdges);

      const result = await service.generateDiagram(basicRequest);

      expect(result.success).toBe(true);
      expect(result.nodes).toEqual(mockNodes);
      expect(result.edges).toEqual(mockEdges);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(mockAIPromptService.generateDiagram).toHaveBeenCalledWith(
        expect.stringContaining('flowchart'),
        basicRequest.diagramType,
        basicRequest.complexity
      );
    });

    it('should handle AI service errors gracefully', async () => {
      mockAIPromptService.generateDiagram.mockRejectedValue(
        new Error('API rate limit exceeded')
      );

      const result = await service.generateDiagram(basicRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('AI service error');
      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
    });

    it('should fall back to template when AI fails', async () => {
      // Mock AI failure
      mockAIPromptService.generateDiagram.mockRejectedValue(
        new Error('AI service unavailable')
      );

      // Mock successful template generation
      mockTemplateService.generateFromTemplate.mockResolvedValue({
        success: true,
        nodes: mockNodes,
        edges: mockEdges,
        title: 'Template Diagram',
        description: 'Generated from template'
      });

      const result = await service.generateDiagram(basicRequest);

      expect(result.success).toBe(true);
      expect(result.nodes).toEqual(mockNodes);
      expect(result.edges).toEqual(mockEdges);
      expect(result.metadata?.apiProvider).toBe('template');
      expect(mockTemplateService.generateFromTemplate).toHaveBeenCalled();
    });

    it('should validate request parameters', async () => {
      const invalidRequest = {
        ...basicRequest,
        prompt: '', // Empty prompt
        diagramType: 'invalid' as any
      };

      const result = await service.generateDiagram(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid request parameters');
    });

    it('should handle different diagram types', async () => {
      const ganttRequest: OneShotDiagramRequest = {
        prompt: 'Create a project timeline for software development',
        diagramType: 'gantt',
        complexity: 'medium',
        includeTimeline: true,
        projectDuration: '6 months'
      };

      mockAIPromptService.generateDiagram.mockResolvedValue({
        success: true,
        content: 'Planning | Development | Testing | Deployment',
        confidence: 0.85
      });

      mockValidationService.validateAndParseDiagram.mockResolvedValue({
        success: true,
        parsedContent: {
          tasks: [
            { name: 'Planning', duration: 30, startDate: new Date() },
            { name: 'Development', duration: 90, startDate: new Date() }
          ]
        }
      });

      mockGenerationService.generateGanttNodes.mockReturnValue([]);

      const result = await service.generateDiagram(ganttRequest);

      expect(mockAIPromptService.generateDiagram).toHaveBeenCalledWith(
        expect.stringContaining('gantt'),
        'gantt',
        'medium'
      );
    });
  });

  describe('generateGanttChart', () => {
    const ganttRequest = {
      prompt: 'Project timeline for audit compliance',
      projectDuration: '3 months',
      complexity: 'medium' as const,
      industry: 'audit' as const
    };

    it('should generate Gantt chart with timeline', async () => {
      const mockTasks = [
        {
          id: '1',
          name: 'Planning Phase',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
          duration: 30,
          progress: 100
        }
      ];

      mockAIPromptService.generateGanttPrompt.mockResolvedValue({
        success: true,
        tasks: mockTasks
      });

      mockGenerationService.generateGanttNodes.mockReturnValue(mockNodes);

      const result = await service.generateGanttChart(ganttRequest);

      expect(result.success).toBe(true);
      expect(result.nodes).toEqual(mockNodes);
      expect(mockAIPromptService.generateGanttPrompt).toHaveBeenCalledWith(
        ganttRequest.prompt,
        ganttRequest.projectDuration,
        ganttRequest.complexity,
        ganttRequest.industry
      );
    });

    it('should handle invalid project duration', async () => {
      const invalidRequest = {
        ...ganttRequest,
        projectDuration: 'invalid duration'
      };

      const result = await service.generateGanttChart(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid project duration');
    });
  });

  describe('performance and reliability', () => {
    it('should complete generation within timeout', async () => {
      const startTime = Date.now();

      mockAIPromptService.generateDiagram.mockImplementation(
        () => new Promise(resolve => 
          setTimeout(() => resolve({
            success: true,
            content: 'Simple flow',
            confidence: 0.8
          }), 1000)
        )
      );

      mockValidationService.validateAndParseDiagram.mockResolvedValue({
        success: true,
        parsedContent: { nodes: [], edges: [] }
      });

      mockGenerationService.generateNodes.mockReturnValue([]);
      mockGenerationService.generateEdges.mockReturnValue([]);

      const result = await service.generateDiagram({
        prompt: 'Test diagram',
        diagramType: 'flowchart'
      });

      const processingTime = Date.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(processingTime).toBeLessThan(5000); // Should complete in under 5 seconds
      expect(result.processingTime).toBeGreaterThan(0);
    });

    it('should handle memory efficiently with large diagrams', async () => {
      const largeNodeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: `node-${i}`,
        type: 'default',
        position: { x: i * 10, y: i * 10 },
        data: { label: `Node ${i}` }
      }));

      mockAIPromptService.generateDiagram.mockResolvedValue({
        success: true,
        content: 'Large diagram content',
        confidence: 0.75
      });

      mockValidationService.validateAndParseDiagram.mockResolvedValue({
        success: true,
        parsedContent: { nodes: largeNodeArray, edges: [] }
      });

      mockGenerationService.generateNodes.mockReturnValue(largeNodeArray);
      mockGenerationService.generateEdges.mockReturnValue([]);

      const result = await service.generateDiagram({
        prompt: 'Large complex diagram',
        diagramType: 'flowchart',
        complexity: 'complex'
      });

      expect(result.success).toBe(true);
      expect(result.nodes).toHaveLength(1000);
      expect(result.metadata?.nodeCount).toBe(1000);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockAIPromptService.generateDiagram.mockRejectedValue(
        new Error('Network error: Failed to fetch')
      );

      mockTemplateService.generateFromTemplate.mockRejectedValue(
        new Error('Template service unavailable')
      );

      const result = await service.generateDiagram({
        prompt: 'Test diagram',
        diagramType: 'flowchart'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('service error');
      expect(result.suggestions).toContain('check your internet connection');
    });

    it('should sanitize malicious input', async () => {
      const maliciousRequest: OneShotDiagramRequest = {
        prompt: '<script>alert("xss")</script>Create a flowchart',
        diagramType: 'flowchart'
      };

      mockAIPromptService.generateDiagram.mockResolvedValue({
        success: true,
        content: 'Safe content',
        confidence: 0.8
      });

      mockValidationService.validateAndParseDiagram.mockResolvedValue({
        success: true,
        parsedContent: { nodes: [], edges: [] }
      });

      const result = await service.generateDiagram(maliciousRequest);

      // Verify that the prompt was sanitized before being passed to AI service
      expect(mockAIPromptService.generateDiagram).toHaveBeenCalledWith(
        expect.not.stringContaining('<script>'),
        'flowchart',
        undefined
      );
    });
  });

  describe('caching and optimization', () => {
    it('should cache similar requests', async () => {
      const request: OneShotDiagramRequest = {
        prompt: 'Login process flowchart',
        diagramType: 'flowchart'
      };

      // Setup mock responses
      mockAIPromptService.generateDiagram.mockResolvedValue({
        success: true,
        content: 'Start -> Login -> End',
        confidence: 0.9
      });

      mockValidationService.validateAndParseDiagram.mockResolvedValue({
        success: true,
        parsedContent: { nodes: mockNodes, edges: mockEdges }
      });

      mockGenerationService.generateNodes.mockReturnValue(mockNodes);
      mockGenerationService.generateEdges.mockReturnValue(mockEdges);

      // First request
      const result1 = await service.generateDiagram(request);
      
      // Second identical request
      const result2 = await service.generateDiagram(request);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      
      // Should have cached the result (AI service called only once)
      expect(mockAIPromptService.generateDiagram).toHaveBeenCalledTimes(1);
    });
  });
});