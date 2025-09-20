/**
 * ContentFingerprinter.ts
 * Generates consistent fingerprints for content caching and validation
 */

import { CleanUnifiedRequirement } from '../CleanUnifiedRequirementsGenerator';
import { AIIntegrationOptions } from './AIIntegrationService';

export class ContentFingerprinter {
  /**
   * Generate content fingerprint for consistent caching
   */
  static generateContentFingerprint(
    unifiedRequirement: CleanUnifiedRequirement,
    config: AIIntegrationOptions
  ): string {
    const content = JSON.stringify({
      category: unifiedRequirement.category,
      content: unifiedRequirement.content,
      frameworks: unifiedRequirement.frameworksCovered.sort(),
      config: {
        targetReduction: config.targetReduction,
        preserveAllDetails: config.preserveAllDetails
      }
    });

    return this.hashContent(content);
  }

  /**
   * Generate fingerprint for framework requirements
   */
  static generateFrameworkFingerprint(
    requirements: Array<{
      id: string;
      code: string;
      title: string;
      description: string;
      framework: string;
    }>
  ): string {
    const content = JSON.stringify({
      requirements: requirements.map(req => ({
        code: req.code,
        framework: req.framework,
        description: req.description.substring(0, 100) // First 100 chars for consistency
      })).sort((a, b) => `${a.framework}-${a.code}`.localeCompare(`${b.framework}-${b.code}`))
    });

    return this.hashContent(content);
  }

  /**
   * Generate fingerprint for consolidation request
   */
  static generateConsolidationFingerprint(
    content: string,
    category: string,
    frameworks: string[],
    targetReduction: number
  ): string {
    const consolidationContent = JSON.stringify({
      content: content.substring(0, 500), // First 500 chars for performance
      category,
      frameworks: frameworks.sort(),
      targetReduction
    });

    return this.hashContent(consolidationContent);
  }

  /**
   * Simple hash function for fingerprinting
   */
  private static hashContent(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  }

  /**
   * Generate short hash for cache keys
   */
  static generateShortHash(input: string): string {
    return this.hashContent(input).substring(0, 8);
  }

  /**
   * Validate fingerprint format
   */
  static isValidFingerprint(fingerprint: string): boolean {
    return /^[0-9a-f]+$/i.test(fingerprint) && fingerprint.length >= 8;
  }

  /**
   * Compare two fingerprints for equality
   */
  static areEqual(fp1: string, fp2: string): boolean {
    return fp1.toLowerCase() === fp2.toLowerCase();
  }
}