/**
 * Test suite for Mermaid.js integration
 */

// Mock mermaid module
jest.mock('mermaid', () => ({
  initialize: jest.fn(),
  render: jest.fn().mockResolvedValue({ svg: '<svg>test</svg>' }),
  parse: jest.fn()
}));

import { MermaidService } from '../MermaidService';

describe('MermaidService', () => {
  let service: MermaidService;

  beforeEach(() => {
    service = MermaidService.getInstance();
    service.reset(); // Reset to initial state
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      await expect(service.initialize()).resolves.not.toThrow();
      expect(service.isServiceInitialized()).toBe(true);
    });

    test('should not initialize twice', async () => {
      await service.initialize();
      const mermaid = require('mermaid');
      await service.initialize();

      // Should only call initialize once
      expect(mermaid.initialize).toHaveBeenCalledTimes(1);
    });

    test('should handle initialization errors', async () => {
      const mermaid = require('mermaid');
      mermaid.initialize.mockImplementationOnce(() => {
        throw new Error('Initialization failed');
      });

      await expect(service.initialize()).rejects.toThrow('Mermaid initialization failed');
    });
  });

  describe('Configuration', () => {
    test('should have default configuration', () => {
      const config = service.getConfig();

      expect(config.theme).toBe('dark');
      expect(config.startOnLoad).toBe(false);
      expect(config.themeVariables.primaryColor).toBe('#3b82f6');
    });

    test('should update configuration', () => {
      const newConfig = {
        theme: 'light' as const,
        themeVariables: {
          primaryColor: '#ff0000'
        }
      };

      service.updateConfig(newConfig);
      const config = service.getConfig();

      expect(config.theme).toBe('light');
      expect(config.themeVariables.primaryColor).toBe('#ff0000');
    });
  });

  describe('Diagram Rendering', () => {
    test('should render diagram successfully', async () => {
      const mermaidText = 'flowchart TD\n  A[Start] --> B[End]';
      const elementId = 'test-diagram';

      const result = await service.renderDiagram(mermaidText, elementId);

      expect(result.svg).toBe('<svg>test</svg>');
      expect(require('mermaid').render).toHaveBeenCalledWith(elementId, mermaidText);
    });

    test('should initialize before rendering if not initialized', async () => {
      const mermaidText = 'flowchart TD\n  A[Start] --> B[End]';
      const elementId = 'test-diagram';

      await service.renderDiagram(mermaidText, elementId);

      expect(require('mermaid').initialize).toHaveBeenCalled();
    });

    test('should handle rendering errors', async () => {
      const mermaid = require('mermaid');
      mermaid.render.mockRejectedValueOnce(new Error('Rendering failed'));

      const mermaidText = 'invalid syntax';
      const elementId = 'test-diagram';

      await expect(service.renderDiagram(mermaidText, elementId))
        .rejects.toThrow('Diagram rendering failed: Rendering failed');
    });
  });

  describe('Syntax Validation', () => {
    test('should validate correct Mermaid syntax', () => {
      const validSyntax = `
        flowchart TD
          A[Start] --> B[Process]
          B --> C[End]
      `;

      const result = service.validateSyntax(validSyntax);
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    test('should detect invalid Mermaid syntax', () => {
      const mermaid = require('mermaid');
      mermaid.parse.mockImplementationOnce(() => {
        throw new Error('Invalid syntax');
      });

      const invalidSyntax = 'invalid mermaid syntax';

      const result = service.validateSyntax(invalidSyntax);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid syntax');
    });
  });

  describe('Supported Diagram Types', () => {
    test('should return supported diagram types', () => {
      const types = service.getSupportedDiagramTypes();

      expect(types).toContain('flowchart');
      expect(types).toContain('sequence');
      expect(types).toContain('gantt');
      expect(types).toContain('classDiagram');
      expect(types).toContain('mindmap');
      expect(types.length).toBeGreaterThan(10);
    });
  });

  describe('Service Management', () => {
    test('should be a singleton', () => {
      const service1 = MermaidService.getInstance();
      const service2 = MermaidService.getInstance();

      expect(service1).toBe(service2);
    });

    test('should reset service state', () => {
      service.updateConfig({ theme: 'light' });
      expect(service.getConfig().theme).toBe('light');

      service.reset();
      expect(service.getConfig().theme).toBe('dark');
      expect(service.isServiceInitialized()).toBe(false);
    });
  });
});
