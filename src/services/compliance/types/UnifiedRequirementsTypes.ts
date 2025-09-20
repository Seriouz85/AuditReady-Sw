import { FrameworkSelection } from '@/types/ComplianceSimplificationTypes';

export interface RequirementDescriptor {
  id: string;
  code: string;
  title: string;
  description: string;
  framework: string;
  category: string;
  official_description?: string;
  audit_ready_guidance?: string;
}

export interface CategoryTemplate {
  categoryName: string;
  subRequirements: SubRequirement[];
}

export interface SubRequirement {
  id: string;
  title: string;
  baseDescription: string;
  keywords: string[];
  frameworkReferences: Map<string, string[]>;
  enhancedDescription?: string;
  injectedContent?: InjectedContent[];
}

export interface InjectedContent {
  framework: string;
  requirementCode: string;
  content: string;
  addedValue: string; // What unique value this adds
}

export interface UnificationResult {
  requirements: SubRequirement[];
  frameworksCovered: string[];
  totalOriginalRequirements: number;
  unifiedRequirements: number;
  reductionPercentage: number;
}

export interface DeduplicationConfig {
  similarityThreshold: number; // 0-1, how similar content needs to be to be considered duplicate
  keywordWeight: number; // How much weight to give keyword matches
  semanticWeight: number; // How much weight to give semantic similarity
  preserveFrameworkSpecifics: boolean; // Whether to preserve framework-specific details
}

export interface FrameworkMapping {
  framework: string;
  requirements: RequirementDescriptor[];
  category: string;
  mappingConfidence: number; // 0-1, how confident we are in this mapping
}

export interface UnifiedRequirementsGeneratorConfig {
  deduplication: DeduplicationConfig;
  includeCitations: boolean;
  includeFrameworkReferences: boolean;
  formatStyle: 'bullet' | 'numbered' | 'sectioned';
  maxDescriptionLength: number;
}