/**
 * Mermaid.js Integration Service
 * Main entry point for all Mermaid-related functionality
 */

// Core services
export { MermaidService } from './MermaidService';
export { MermaidRenderer } from './MermaidRenderer';
export { MermaidParser } from './MermaidParser';
export { MermaidThemeManager } from './MermaidThemeManager';
export { MermaidExporter } from './MermaidExporter';
export { MermaidFabricBridge } from './MermaidFabricBridge';

// Type definitions
export type {
  MermaidConfig,
  ThemeVariables,
  FlowchartConfig,
  SequenceConfig,
  GanttConfig,
  RenderOptions,
  DiagramMetadata,
  DiagramType,
  MermaidTheme,
  ExportOptions,
  ValidationResult,
  RenderResult,
  MermaidError,
  DiagramNode,
  DiagramEdge,
  ParsedDiagram
} from './types/mermaid-config';

// Convenience functions
import { MermaidService } from './MermaidService';
import { MermaidRenderer } from './MermaidRenderer';
import { MermaidThemeManager } from './MermaidThemeManager';
import { MermaidExporter } from './MermaidExporter';
import { MermaidFabricBridge } from './MermaidFabricBridge';
import { MermaidConfig } from './types/mermaid-config';

export const createMermaidService = () => MermaidService.getInstance();
export const createMermaidRenderer = () => new MermaidRenderer();
export const createMermaidThemeManager = () => MermaidThemeManager.getInstance();
export const createMermaidExporter = () => MermaidExporter.getInstance();
export const createMermaidFabricBridge = () => new MermaidFabricBridge();

// Quick setup function
export const setupMermaid = async (config?: Partial<MermaidConfig>) => {
  const service = MermaidService.getInstance();

  if (config) {
    service.updateConfig(config);
  }

  await service.initialize();
  return service;
};

// Version information
export const MERMAID_SERVICE_VERSION = '1.0.0';
export const SUPPORTED_MERMAID_VERSION = '^10.6.0';
