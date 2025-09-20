/**
 * ConflictResolver.ts
 * Smart conflict resolution for differing requirements
 * Handles frequencies, scopes, methods, and evidence requirements
 */

import { ProcessedRequirement, ComplianceEntity, RequirementStructure } from './types';
import { ConflictResolution, HarmonizationConfig } from './RequirementHarmonizer';

export interface ConflictAnalysisResult {
  conflicts_detected: DetectedConflict[];
  resolutions: ConflictResolution[];
  resolution_confidence: number;
  unresolvable_conflicts: UnresolvableConflict[];
  resolution_metadata: ResolutionMetadata;
}

export interface DetectedConflict {
  conflict_id: string;
  conflict_type: 'FREQUENCY' | 'SCOPE' | 'METHOD' | 'EVIDENCE' | 'TERMINOLOGY' | 'CRITICALITY';
  source_requirements: string[];
  conflicting_values: ConflictingValue[];
  impact_severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  frameworks_affected: string[];
  description: string;
}

export interface ConflictingValue {
  requirement_id: string;
  framework: string;
  value: string;
  context: string;
  confidence: number;
  extraction_method: string;
}

export interface UnresolvableConflict {
  conflict_id: string;
  reason: string;
  manual_resolution_required: boolean;
  suggested_approaches: string[];
  escalation_priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface ResolutionMetadata {
  total_conflicts_detected: number;
  conflicts_resolved: number;
  conflicts_unresolved: number;
  resolution_strategies_used: string[];
  processing_time_ms: number;
  confidence_average: number;
}

export interface FrequencyConflict {
  frequencies: string[];
  temporal_units: string[];
  numerical_values: number[];
  contexts: string[];
}

export interface ScopeConflict {
  scopes: string[];
  scope_boundaries: string[];
  inclusion_criteria: string[];
  exclusion_criteria: string[];
}

export interface MethodConflict {
  methods: string[];
  implementation_approaches: string[];
  technical_specifications: string[];
  tool_requirements: string[];
}

export interface EvidenceConflict {
  evidence_types: string[];
  documentation_requirements: string[];
  retention_periods: string[];
  validation_methods: string[];
}

export class ConflictResolver {
  private config: HarmonizationConfig;
  private frequencyHierarchy: Map<string, number>;
  private scopeHierarchy: Map<string, number>;
  private methodPriority: Map<string, number>;
  private evidenceWeights: Map<string, number>;

  constructor(config: HarmonizationConfig) {
    this.config = config;
    this.initializeFrequencyHierarchy();
    this.initializeScopeHierarchy();
    this.initializeMethodPriority();
    this.initializeEvidenceWeights();
  }

  /**
   * Resolve conflicts between requirements
   */
  async resolveConflicts(requirements: ProcessedRequirement[]): Promise<ConflictResolution[]> {
    const startTime = performance.now();

    if (requirements.length < 2) {
      return [];
    }

    // Step 1: Detect all conflicts
    const detectedConflicts = this.detectAllConflicts(requirements);

    // Step 2: Resolve each conflict based on strategy
    const resolutions: ConflictResolution[] = [];
    
    for (const conflict of detectedConflicts) {
      try {
        const resolution = await this.resolveIndividualConflict(conflict, requirements);
        if (resolution) {
          resolutions.push(resolution);
        }
      } catch (error) {
        console.warn(`Failed to resolve conflict ${conflict.conflict_id}: ${error.message}`);
      }
    }

    return resolutions;
  }

  /**
   * Detect all types of conflicts between requirements
   */
  private detectAllConflicts(requirements: ProcessedRequirement[]): DetectedConflict[] {
    const conflicts: DetectedConflict[] = [];

    // Frequency conflicts
    conflicts.push(...this.detectFrequencyConflicts(requirements));

    // Scope conflicts
    conflicts.push(...this.detectScopeConflicts(requirements));

    // Method conflicts
    conflicts.push(...this.detectMethodConflicts(requirements));

    // Evidence conflicts
    conflicts.push(...this.detectEvidenceConflicts(requirements));

    // Terminology conflicts
    conflicts.push(...this.detectTerminologyConflicts(requirements));

    return conflicts;
  }

  /**
   * Detect frequency conflicts (different timing requirements)
   */
  private detectFrequencyConflicts(requirements: ProcessedRequirement[]): DetectedConflict[] {
    const conflicts: DetectedConflict[] = [];
    const frequencyPattern = /\b(annually|quarterly|monthly|weekly|daily|continuously|immediately|within\s+\d+\s+\w+)\b/gi;

    const frequencyMap = new Map<string, ConflictingValue[]>();

    for (const req of requirements) {
      const matches = req.normalized_text.match(frequencyPattern);
      if (matches) {
        for (const match of matches) {
          const normalizedFreq = this.normalizeFrequency(match);
          if (!frequencyMap.has(normalizedFreq)) {
            frequencyMap.set(normalizedFreq, []);
          }
          frequencyMap.get(normalizedFreq)!.push({
            requirement_id: req.id,
            framework: req.framework,
            value: match,
            context: this.extractContext(req.normalized_text, match),
            confidence: 0.9,
            extraction_method: 'REGEX_PATTERN'
          });
        }
      }
    }

    // Identify conflicts (different frequencies for similar contexts)
    for (const [frequency, values] of Array.from(frequencyMap.entries())) {
      if (values.length > 1) {
        const uniqueFrameworks = Array.from(new Set(values.map(v => v.framework)));
        if (uniqueFrameworks.length > 1) {
          conflicts.push({
            conflict_id: `freq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            conflict_type: 'FREQUENCY',
            source_requirements: values.map(v => v.requirement_id),
            conflicting_values: values,
            impact_severity: this.assessFrequencyImpact(values),
            frameworks_affected: uniqueFrameworks,
            description: `Different frequency requirements detected: ${values.map(v => v.value).join(', ')}`
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect scope conflicts (different coverage areas)
   */
  private detectScopeConflicts(requirements: ProcessedRequirement[]): DetectedConflict[] {
    const conflicts: DetectedConflict[] = [];
    const scopeIndicators = ['all', 'every', 'each', 'entire', 'complete', 'partial', 'selected', 'specific', 'applicable'];

    const scopeMap = new Map<string, ConflictingValue[]>();

    for (const req of requirements) {
      for (const indicator of scopeIndicators) {
        const regex = new RegExp(`\\b${indicator}\\s+\\w+`, 'gi');
        const matches = req.normalized_text.match(regex);
        if (matches) {
          for (const match of matches) {
            const scopeKey = this.extractScopeKey(match);
            if (!scopeMap.has(scopeKey)) {
              scopeMap.set(scopeKey, []);
            }
            scopeMap.get(scopeKey)!.push({
              requirement_id: req.id,
              framework: req.framework,
              value: match,
              context: this.extractContext(req.normalized_text, match),
              confidence: 0.8,
              extraction_method: 'SCOPE_INDICATOR'
            });
          }
        }
      }
    }

    // Identify scope conflicts
    for (const [scopeKey, values] of Array.from(scopeMap.entries())) {
      if (values.length > 1) {
        const conflictingScopes = this.identifyConflictingScopes(values);
        if (conflictingScopes.length > 0) {
          conflicts.push({
            conflict_id: `scope_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            conflict_type: 'SCOPE',
            source_requirements: values.map(v => v.requirement_id),
            conflicting_values: conflictingScopes,
            impact_severity: this.assessScopeImpact(conflictingScopes),
            frameworks_affected: Array.from(new Set(values.map(v => v.framework))),
            description: `Conflicting scope requirements: ${conflictingScopes.map(v => v.value).join(' vs ')}`
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect method conflicts (different implementation approaches)
   */
  private detectMethodConflicts(requirements: ProcessedRequirement[]): DetectedConflict[] {
    const conflicts: DetectedConflict[] = [];
    const methodKeywords = ['implement', 'establish', 'deploy', 'configure', 'install', 'setup', 'use', 'apply'];

    const methodMap = new Map<string, ConflictingValue[]>();

    for (const req of requirements) {
      for (const keyword of methodKeywords) {
        const regex = new RegExp(`\\b${keyword}\\s+[\\w\\s]{1,50}`, 'gi');
        const matches = req.normalized_text.match(regex);
        if (matches) {
          for (const match of matches) {
            const methodKey = this.extractMethodKey(match);
            if (!methodMap.has(methodKey)) {
              methodMap.set(methodKey, []);
            }
            methodMap.get(methodKey)!.push({
              requirement_id: req.id,
              framework: req.framework,
              value: match,
              context: this.extractContext(req.normalized_text, match),
              confidence: 0.7,
              extraction_method: 'METHOD_KEYWORD'
            });
          }
        }
      }
    }

    // Identify method conflicts
    for (const [methodKey, values] of Array.from(methodMap.entries())) {
      if (values.length > 1) {
        const conflictingMethods = this.identifyConflictingMethods(values);
        if (conflictingMethods.length > 0) {
          conflicts.push({
            conflict_id: `method_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            conflict_type: 'METHOD',
            source_requirements: values.map(v => v.requirement_id),
            conflicting_values: conflictingMethods,
            impact_severity: this.assessMethodImpact(conflictingMethods),
            frameworks_affected: Array.from(new Set(values.map(v => v.framework))),
            description: `Different implementation methods: ${conflictingMethods.map(v => v.value).join(' vs ')}`
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect evidence conflicts (different documentation requirements)
   */
  private detectEvidenceConflicts(requirements: ProcessedRequirement[]): DetectedConflict[] {
    const conflicts: DetectedConflict[] = [];
    const evidenceTerms = ['document', 'record', 'log', 'evidence', 'report', 'certificate', 'audit trail'];

    const evidenceMap = new Map<string, ConflictingValue[]>();

    for (const req of requirements) {
      for (const term of evidenceTerms) {
        const regex = new RegExp(`\\b${term}[\\w\\s]{1,30}`, 'gi');
        const matches = req.normalized_text.match(regex);
        if (matches) {
          for (const match of matches) {
            const evidenceKey = this.extractEvidenceKey(match);
            if (!evidenceMap.has(evidenceKey)) {
              evidenceMap.set(evidenceKey, []);
            }
            evidenceMap.get(evidenceKey)!.push({
              requirement_id: req.id,
              framework: req.framework,
              value: match,
              context: this.extractContext(req.normalized_text, match),
              confidence: 0.8,
              extraction_method: 'EVIDENCE_TERM'
            });
          }
        }
      }
    }

    // Identify evidence conflicts
    for (const [evidenceKey, values] of Array.from(evidenceMap.entries())) {
      if (values.length > 1) {
        const conflictingEvidence = this.identifyConflictingEvidence(values);
        if (conflictingEvidence.length > 0) {
          conflicts.push({
            conflict_id: `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            conflict_type: 'EVIDENCE',
            source_requirements: values.map(v => v.requirement_id),
            conflicting_values: conflictingEvidence,
            impact_severity: this.assessEvidenceImpact(conflictingEvidence),
            frameworks_affected: Array.from(new Set(values.map(v => v.framework))),
            description: `Conflicting evidence requirements: ${conflictingEvidence.map(v => v.value).join(' vs ')}`
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Detect terminology conflicts (different terms for same concept)
   */
  private detectTerminologyConflicts(requirements: ProcessedRequirement[]): DetectedConflict[] {
    const conflicts: DetectedConflict[] = [];
    
    // Common terminology mappings
    const terminologyGroups = [
      ['policy', 'procedure', 'guideline', 'standard'],
      ['assessment', 'evaluation', 'review', 'audit'],
      ['incident', 'event', 'occurrence', 'breach'],
      ['monitor', 'track', 'observe', 'supervise'],
      ['validate', 'verify', 'confirm', 'check']
    ];

    for (const group of terminologyGroups) {
      const usageMap = new Map<string, ConflictingValue[]>();
      
      for (const req of requirements) {
        for (const term of group) {
          if (req.normalized_text.toLowerCase().includes(term)) {
            if (!usageMap.has(term)) {
              usageMap.set(term, []);
            }
            usageMap.get(term)!.push({
              requirement_id: req.id,
              framework: req.framework,
              value: term,
              context: this.extractContext(req.normalized_text, term),
              confidence: 0.9,
              extraction_method: 'TERMINOLOGY_GROUP'
            });
          }
        }
      }

      // Check if multiple terms from the same group are used
      const usedTerms = Array.from(usageMap.keys());
      if (usedTerms.length > 1) {
        const allValues = Array.from(usageMap.values()).flat();
        conflicts.push({
          conflict_id: `term_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          conflict_type: 'TERMINOLOGY',
          source_requirements: allValues.map(v => v.requirement_id),
          conflicting_values: allValues,
          impact_severity: 'LOW',
          frameworks_affected: Array.from(new Set(allValues.map(v => v.framework))),
          description: `Inconsistent terminology: ${usedTerms.join(' vs ')}`
        });
      }
    }

    return conflicts;
  }

  /**
   * Resolve individual conflict based on type and strategy
   */
  private async resolveIndividualConflict(
    conflict: DetectedConflict,
    requirements: ProcessedRequirement[]
  ): Promise<ConflictResolution | null> {
    switch (conflict.conflict_type) {
      case 'FREQUENCY':
        return this.resolveFrequencyConflict(conflict);
      case 'SCOPE':
        return this.resolveScopeConflict(conflict);
      case 'METHOD':
        return this.resolveMethodConflict(conflict);
      case 'EVIDENCE':
        return this.resolveEvidenceConflict(conflict);
      case 'TERMINOLOGY':
        return this.resolveTerminologyConflict(conflict);
      default:
        return null;
    }
  }

  /**
   * Resolve frequency conflicts using most stringent strategy
   */
  private resolveFrequencyConflict(conflict: DetectedConflict): ConflictResolution {
    const frequencies = conflict.conflicting_values.map(v => v.value);
    const mostStringent = this.findMostStringentFrequency(frequencies);

    return {
      conflict_type: 'FREQUENCY',
      source_values: frequencies,
      resolved_value: mostStringent,
      resolution_strategy: this.config.conflict_resolution.frequency_strategy,
      confidence: 0.9
    };
  }

  /**
   * Resolve scope conflicts using broadest strategy
   */
  private resolveScopeConflict(conflict: DetectedConflict): ConflictResolution {
    const scopes = conflict.conflicting_values.map(v => v.value);
    const broadestScope = this.findBroadestScope(scopes);

    return {
      conflict_type: 'SCOPE',
      source_values: scopes,
      resolved_value: broadestScope,
      resolution_strategy: this.config.conflict_resolution.scope_strategy,
      confidence: 0.8
    };
  }

  /**
   * Resolve method conflicts using all options strategy
   */
  private resolveMethodConflict(conflict: DetectedConflict): ConflictResolution {
    const methods = conflict.conflicting_values.map(v => v.value);
    const combinedMethods = this.combineAllMethods(methods);

    return {
      conflict_type: 'METHOD',
      source_values: methods,
      resolved_value: combinedMethods,
      resolution_strategy: this.config.conflict_resolution.method_strategy,
      confidence: 0.7
    };
  }

  /**
   * Resolve evidence conflicts using combined strategy
   */
  private resolveEvidenceConflict(conflict: DetectedConflict): ConflictResolution {
    const evidence = conflict.conflicting_values.map(v => v.value);
    const combinedEvidence = this.combineEvidenceRequirements(evidence);

    return {
      conflict_type: 'EVIDENCE',
      source_values: evidence,
      resolved_value: combinedEvidence,
      resolution_strategy: this.config.conflict_resolution.evidence_strategy,
      confidence: 0.8
    };
  }

  /**
   * Resolve terminology conflicts using most formal term
   */
  private resolveTerminologyConflict(conflict: DetectedConflict): ConflictResolution {
    const terms = conflict.conflicting_values.map(v => v.value);
    const preferredTerm = this.selectPreferredTerm(terms);

    return {
      conflict_type: 'TERMINOLOGY',
      source_values: terms,
      resolved_value: preferredTerm,
      resolution_strategy: 'FORMAL_PREFERENCE',
      confidence: 0.9
    };
  }

  /**
   * Helper methods for conflict resolution
   */
  private findMostStringentFrequency(frequencies: string[]): string {
    const normalized = frequencies.map(f => this.normalizeFrequency(f));
    const ranked = normalized.sort((a, b) => (this.frequencyHierarchy.get(a) || 0) - (this.frequencyHierarchy.get(b) || 0));
    return ranked[0];
  }

  private findBroadestScope(scopes: string[]): string {
    const ranked = scopes.sort((a, b) => (this.scopeHierarchy.get(a) || 0) - (this.scopeHierarchy.get(b) || 0));
    return ranked[0];
  }

  private combineAllMethods(methods: string[]): string {
    const uniqueMethods = Array.from(new Set(methods));
    return uniqueMethods.join(' or ');
  }

  private combineEvidenceRequirements(evidence: string[]): string {
    const uniqueEvidence = Array.from(new Set(evidence));
    return uniqueEvidence.join(', ');
  }

  private selectPreferredTerm(terms: string[]): string {
    // Select most formal/standard term
    const formalityOrder = ['standard', 'policy', 'procedure', 'guideline', 'assessment', 'audit', 'evaluation', 'review'];
    
    for (const formal of formalityOrder) {
      const match = terms.find(term => term.toLowerCase().includes(formal));
      if (match) return match;
    }
    
    return terms[0];
  }

  private normalizeFrequency(frequency: string): string {
    const freq = frequency.toLowerCase();
    if (freq.includes('annual')) return 'annually';
    if (freq.includes('quarter')) return 'quarterly';
    if (freq.includes('month')) return 'monthly';
    if (freq.includes('week')) return 'weekly';
    if (freq.includes('day') || freq.includes('daily')) return 'daily';
    if (freq.includes('continuous')) return 'continuously';
    if (freq.includes('immediate')) return 'immediately';
    return frequency;
  }

  private extractScopeKey(match: string): string {
    return match.split(/\s+/).slice(1).join(' ').toLowerCase();
  }

  private extractMethodKey(match: string): string {
    return match.split(/\s+/).slice(1, 3).join(' ').toLowerCase();
  }

  private extractEvidenceKey(match: string): string {
    return match.split(/\s+/).slice(1, 2).join(' ').toLowerCase();
  }

  private extractContext(text: string, match: string): string {
    const index = text.indexOf(match);
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + match.length + 50);
    return text.substring(start, end);
  }

  private identifyConflictingScopes(values: ConflictingValue[]): ConflictingValue[] {
    // Simple conflict detection - different scope indicators for same context
    const contexts = values.map(v => this.extractScopeKey(v.value));
    const uniqueContexts = Array.from(new Set(contexts));
    return uniqueContexts.length > 1 ? values : [];
  }

  private identifyConflictingMethods(values: ConflictingValue[]): ConflictingValue[] {
    // Check for mutually exclusive methods
    const exclusiveKeywords = [['manual', 'automated'], ['centralized', 'distributed'], ['local', 'remote']];
    
    for (const [option1, option2] of exclusiveKeywords) {
      const hasOption1 = values.some(v => v.value.toLowerCase().includes(option1));
      const hasOption2 = values.some(v => v.value.toLowerCase().includes(option2));
      if (hasOption1 && hasOption2) {
        return values;
      }
    }
    
    return [];
  }

  private identifyConflictingEvidence(values: ConflictingValue[]): ConflictingValue[] {
    // Check for different evidence types for same requirement
    const evidenceTypes = values.map(v => v.value.split(/\s+/)[0].toLowerCase());
    const uniqueTypes = Array.from(new Set(evidenceTypes));
    return uniqueTypes.length > 1 ? values : [];
  }

  private assessFrequencyImpact(values: ConflictingValue[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const frequencies = values.map(v => this.normalizeFrequency(v.value));
    const rankings = frequencies.map(f => this.frequencyHierarchy.get(f) || 0);
    const range = Math.max(...rankings) - Math.min(...rankings);
    
    if (range > 5) return 'HIGH';
    if (range > 2) return 'MEDIUM';
    return 'LOW';
  }

  private assessScopeImpact(values: ConflictingValue[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const hasAll = values.some(v => v.value.toLowerCase().includes('all'));
    const hasPartial = values.some(v => v.value.toLowerCase().includes('partial') || v.value.toLowerCase().includes('selected'));
    
    if (hasAll && hasPartial) return 'HIGH';
    return 'MEDIUM';
  }

  private assessMethodImpact(values: ConflictingValue[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    // Methods can usually be combined, so impact is generally lower
    return 'MEDIUM';
  }

  private assessEvidenceImpact(values: ConflictingValue[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    // Evidence requirements should generally be combined
    return 'LOW';
  }

  /**
   * Initialize hierarchy and priority mappings
   */
  private initializeFrequencyHierarchy(): void {
    this.frequencyHierarchy = new Map([
      ['continuously', 1],
      ['immediately', 2],
      ['daily', 3],
      ['weekly', 4],
      ['monthly', 5],
      ['quarterly', 6],
      ['annually', 7]
    ]);
  }

  private initializeScopeHierarchy(): void {
    this.scopeHierarchy = new Map([
      ['all', 1],
      ['entire', 2],
      ['complete', 3],
      ['every', 4],
      ['each', 5],
      ['applicable', 6],
      ['selected', 7],
      ['specific', 8],
      ['partial', 9]
    ]);
  }

  private initializeMethodPriority(): void {
    this.methodPriority = new Map([
      ['automated', 1],
      ['systematic', 2],
      ['standardized', 3],
      ['manual', 4],
      ['ad-hoc', 5]
    ]);
  }

  private initializeEvidenceWeights(): void {
    this.evidenceWeights = new Map([
      ['audit trail', 1.0],
      ['documentation', 0.9],
      ['records', 0.8],
      ['logs', 0.7],
      ['reports', 0.6]
    ]);
  }
}