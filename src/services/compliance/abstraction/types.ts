/**
 * Core types for SmartSemanticAnalyzer and RequirementHarmonizer services
 * Provides TypeScript interfaces for semantic analysis and harmonization components
 */

export interface SemanticAnalysisResult {
  similarity: number;
  confidence: number;
  matches: SemanticMatch[];
  entities: ComplianceEntity[];
  structure: RequirementStructure;
  processing_time: number;
}

export interface SemanticMatch {
  source_id: string;
  target_id: string;
  similarity_score: number;
  match_type: 'semantic' | 'structural' | 'contextual' | 'hybrid';
  confidence: number;
  matched_concepts: string[];
  overlap_percentage: number;
}

export interface ComplianceEntity {
  type: 'CONTROL' | 'POLICY' | 'PROCESS' | 'REQUIREMENT' | 'DOMAIN' | 'ASSET' | 'RISK';
  text: string;
  confidence: number;
  position: [number, number];
  domain: string;
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface RequirementStructure {
  main_clause: string;
  sub_clauses: string[];
  conditions: string[];
  exceptions: string[];
  references: string[];
  action_verbs: string[];
  domain_context: string;
}

export interface ProcessedRequirement {
  id: string;
  framework: string;
  original_text: string;
  normalized_text: string;
  entities: ComplianceEntity[];
  structure: RequirementStructure;
  metadata: RequirementMetadata;
  vector: number[];
  keywords: string[];
  hash: string;
}

export interface RequirementMetadata {
  category: string;
  domain: string;
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  complexity: number;
  word_count: number;
  readability_score: number;
  technical_terms: string[];
  extracted_at: Date;
}

export interface SimilarityResult {
  source_id: string;
  target_id: string;
  semantic_score: number;
  structural_score: number;
  contextual_score: number;
  combined_score: number;
  confidence: number;
  explanation: string;
  clusters: ClusterInfo[];
}

export interface ClusterInfo {
  cluster_id: string;
  size: number;
  centroid: ProcessedRequirement;
  members: string[];
  quality_score: number;
  dominant_concepts: string[];
}

export interface AnalysisConfig {
  tfidf_weights: {
    control_terms: number;
    process_terms: number;
    technical_terms: number;
    domain_terms: number;
  };
  similarity_thresholds: {
    semantic: number;
    structural: number;
    contextual: number;
    clustering: number;
  };
  clustering_config: {
    min_cluster_size: number;
    max_clusters: number;
    quality_threshold: number;
  };
  performance_limits: {
    max_processing_time: number;
    max_requirements_per_batch: number;
    cache_ttl: number;
  };
}

export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  ttl: number;
  hits: number;
  key_hash: string;
}

export interface PerformanceMetrics {
  processing_time: number;
  cache_hit_rate: number;
  total_requirements_processed: number;
  average_similarity_computation_time: number;
  memory_usage: number;
  errors_encountered: number;
}

export interface SemanticAnalyzerOptions {
  config: AnalysisConfig;
  enable_caching: boolean;
  performance_monitoring: boolean;
  debug_mode: boolean;
  batch_size: number;
}