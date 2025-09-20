/**
 * 🏆 Expert CISO Unified Requirements Review Service
 * 
 * This service provides systematic review and improvement of unified requirements
 * from an expert CISO perspective, ensuring enterprise-grade quality and comprehensive
 * framework coverage across all 21 categories.
 */

import { UnifiedRequirementsService, UnifiedRequirement, CategoryRequirements } from './UnifiedRequirementsService';
import { CorrectedGovernanceService } from './CorrectedGovernanceService';

export interface CISOReviewResult {
  categoryName: string;
  categoryIndex: number;
  currentRequirements: UnifiedRequirement[];
  reviewResults: CISORequirementReview[];
  overallQualityScore: number;
  frameworkCoverageScore: number;
  improvementsApplied: number;
  recommendations: CISORecommendation[];
}

export interface CISORequirementReview {
  letter: string;
  originalText: string;
  improvedText?: string;
  qualityScore: number; // 0-100
  improvementType: 'terminology' | 'framework_coverage' | 'clarity' | 'structure' | 'completeness' | 'none';
  frameworkAlignment: FrameworkAlignment;
  cisoComments: string;
  hasImprovement: boolean;
}

export interface FrameworkAlignment {
  iso27001: boolean;
  iso27002: boolean;
  nis2: boolean;
  gdpr: boolean;
  cisControls: boolean;
  gapsIdentified: string[];
}

export interface CISORecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'add_content' | 'enhance_existing' | 'framework_mapping' | 'terminology_improvement';
  title: string;
  description: string;
  expectedImpact: string;
  implementationEffort: 'low' | 'medium' | 'high';
}

export class ExpertCISOReviewService {
  
  /**
   * 🎯 Systematic review of all unified requirements from expert CISO perspective
   */
  static async conductSystematicReview(complianceMappings: any[]): Promise<CISOReviewResult[]> {
    console.log('🏆 EXPERT CISO SYSTEMATIC REVIEW STARTED');
    console.log(`📊 Reviewing ${complianceMappings.length} categories for enterprise compliance quality`);
    
    const results: CISOReviewResult[] = [];
    
    for (let i = 0; i < complianceMappings.length; i++) {
      const mapping = complianceMappings[i];
      const categoryResult = await this.reviewCategory(mapping, i + 1);
      results.push(categoryResult);
      
      console.log(`✅ Category ${i + 1}: ${categoryResult.categoryName} - Quality: ${categoryResult.overallQualityScore}/100`);
    }
    
    return results;
  }
  
  /**
   * 🔍 Review individual category with expert CISO analysis
   */
  static async reviewCategory(categoryMapping: any, categoryIndex: number): Promise<CISOReviewResult> {
    const categoryName = categoryMapping.category || `Category ${categoryIndex}`;
    
    // Extract unified requirements using existing service
    const categoryRequirements = UnifiedRequirementsService.extractUnifiedRequirements(categoryMapping);
    
    // Conduct expert CISO review of each requirement
    const reviewResults: CISORequirementReview[] = [];
    let totalQualityScore = 0;
    let totalFrameworkScore = 0;
    let improvementsApplied = 0;
    
    for (const req of categoryRequirements.requirements) {
      const review = this.reviewIndividualRequirement(req, categoryName);
      reviewResults.push(review);
      totalQualityScore += review.qualityScore;
      totalFrameworkScore += this.calculateFrameworkCoverageScore(review.frameworkAlignment);
      
      if (review.hasImprovement) {
        improvementsApplied++;
      }
    }
    
    const overallQualityScore = categoryRequirements.requirements.length > 0 
      ? Math.round(totalQualityScore / categoryRequirements.requirements.length)
      : 0;
      
    const frameworkCoverageScore = categoryRequirements.requirements.length > 0
      ? Math.round(totalFrameworkScore / categoryRequirements.requirements.length)
      : 0;
    
    // Generate CISO recommendations
    const recommendations = this.generateCISORecommendations(reviewResults, categoryName);
    
    return {
      categoryName,
      categoryIndex,
      currentRequirements: categoryRequirements.requirements,
      reviewResults,
      overallQualityScore,
      frameworkCoverageScore,
      improvementsApplied,
      recommendations
    };
  }
  
  /**
   * 🔬 Expert CISO analysis of individual requirement
   */
  static reviewIndividualRequirement(requirement: UnifiedRequirement, categoryName: string): CISORequirementReview {
    const originalText = requirement.originalText || requirement.title;
    const combinedText = requirement.description ? 
      `${requirement.title} - ${requirement.description}` : 
      requirement.title;
    
    // Analyze framework alignment
    const frameworkAlignment = this.analyzeFrameworkAlignment(combinedText, categoryName);
    
    // Calculate quality score based on CISO criteria
    const qualityScore = this.calculateQualityScore(combinedText, frameworkAlignment);
    
    // Identify improvement type and generate enhanced text
    const improvementAnalysis = this.identifyImprovementOpportunity(combinedText, categoryName, frameworkAlignment);
    
    return {
      letter: requirement.letter,
      originalText,
      improvedText: improvementAnalysis.improvedText,
      qualityScore,
      improvementType: improvementAnalysis.type,
      frameworkAlignment,
      cisoComments: improvementAnalysis.cisoComments,
      hasImprovement: improvementAnalysis.hasImprovement
    };
  }
  
  /**
   * 🎯 Analyze framework coverage from CISO perspective
   */
  static analyzeFrameworkAlignment(text: string, categoryName: string): FrameworkAlignment {
    const lowerText = text.toLowerCase();
    const lowerCategory = categoryName.toLowerCase();
    
    // ISO 27001/27002 alignment check
    const iso27001 = lowerText.includes('isms') || 
                     lowerText.includes('management system') ||
                     lowerText.includes('policy') ||
                     lowerText.includes('process');
    
    const iso27002 = lowerText.includes('control') ||
                     lowerText.includes('implement') ||
                     lowerText.includes('monitor') ||
                     lowerText.includes('maintain');
    
    // NIS2 alignment check
    const nis2 = lowerText.includes('incident') ||
                 lowerText.includes('cyber') ||
                 lowerText.includes('resilience') ||
                 lowerCategory.includes('governance');
    
    // GDPR alignment check  
    const gdpr = lowerText.includes('data') ||
                 lowerText.includes('privacy') ||
                 lowerText.includes('personal') ||
                 lowerCategory.includes('asset');
    
    // CIS Controls alignment check
    const cisControls = lowerText.includes('inventory') ||
                        lowerText.includes('access') ||
                        lowerText.includes('configuration') ||
                        lowerText.includes('monitor');
    
    // Identify gaps
    const gapsIdentified: string[] = [];
    if (!iso27001 && lowerCategory.includes('governance')) {
      gapsIdentified.push('Missing ISO 27001 ISMS terminology');
    }
    if (!nis2 && (lowerCategory.includes('incident') || lowerCategory.includes('governance'))) {
      gapsIdentified.push('Missing NIS2 directive requirements');
    }
    if (!gdpr && lowerCategory.includes('data')) {
      gapsIdentified.push('Missing GDPR data protection obligations');
    }
    
    return {
      iso27001,
      iso27002,
      nis2,
      gdpr,
      cisControls,
      gapsIdentified
    };
  }
  
  /**
   * 📊 Calculate quality score using CISO criteria
   */
  static calculateQualityScore(text: string, frameworkAlignment: FrameworkAlignment): number {
    let score = 0;
    
    // Professional terminology (0-25 points)
    const professionalTerms = ['establish', 'implement', 'maintain', 'monitor', 'systematic', 'comprehensive', 'procedures', 'framework'];
    const termScore = professionalTerms.filter(term => text.toLowerCase().includes(term)).length;
    score += Math.min(25, termScore * 3);
    
    // Framework coverage (0-25 points)
    const frameworkScore = this.calculateFrameworkCoverageScore(frameworkAlignment);
    score += Math.round(frameworkScore * 0.25);
    
    // Length appropriateness (0-25 points)
    const wordCount = text.split(/\s+/).length;
    if (wordCount >= 15 && wordCount <= 35) {
      score += 25; // Optimal length
    } else if (wordCount >= 10 && wordCount <= 40) {
      score += 20; // Good length
    } else {
      score += 10; // Needs improvement
    }
    
    // Clarity and actionability (0-25 points)
    const actionTerms = ['define', 'establish', 'implement', 'conduct', 'ensure', 'maintain'];
    const actionScore = actionTerms.filter(term => text.toLowerCase().includes(term)).length;
    score += Math.min(25, actionScore * 5);
    
    return Math.min(100, score);
  }
  
  /**
   * 🔍 Identify improvement opportunities with expert CISO perspective
   */
  static identifyImprovementOpportunity(text: string, categoryName: string, frameworkAlignment: FrameworkAlignment): {
    type: CISORequirementReview['improvementType'];
    improvedText?: string;
    cisoComments: string;
    hasImprovement: boolean;
  } {
    const lowerText = text.toLowerCase();
    const lowerCategory = categoryName.toLowerCase();
    
    // Check for terminology improvements
    if (!lowerText.includes('establish') && !lowerText.includes('implement')) {
      return {
        type: 'terminology',
        improvedText: text.replace(/^([a-z]\)\s*)(.+?)(\s*-\s*)/, '$1Establish and implement $2$3'),
        cisoComments: 'Enhanced with professional cybersecurity terminology for better clarity and implementation guidance.',
        hasImprovement: true
      };
    }
    
    // Check for framework coverage gaps
    if (frameworkAlignment.gapsIdentified.length > 0) {
      let improvedText = text;
      if (lowerCategory.includes('governance') && !lowerText.includes('management system')) {
        improvedText += ' within the information security management system framework';
      }
      
      return {
        type: 'framework_coverage',
        improvedText,
        cisoComments: `Added framework-specific terminology to address: ${frameworkAlignment.gapsIdentified.join(', ')}`,
        hasImprovement: true
      };
    }
    
    // Check for clarity improvements
    if (text.length < 50) {
      return {
        type: 'completeness',
        improvedText: text + ' with documented procedures, regular review processes, and continuous monitoring mechanisms',
        cisoComments: 'Enhanced completeness to provide more comprehensive implementation guidance.',
        hasImprovement: true
      };
    }
    
    return {
      type: 'none',
      cisoComments: 'Requirement meets expert CISO quality standards with appropriate terminology, framework alignment, and clarity.',
      hasImprovement: false
    };
  }
  
  /**
   * 📊 Calculate framework coverage score
   */
  static calculateFrameworkCoverageScore(frameworkAlignment: FrameworkAlignment): number {
    const frameworks = [
      frameworkAlignment.iso27001,
      frameworkAlignment.iso27002,
      frameworkAlignment.nis2,
      frameworkAlignment.gdpr,
      frameworkAlignment.cisControls
    ];
    
    const covered = frameworks.filter(Boolean).length;
    return Math.round((covered / frameworks.length) * 100);
  }
  
  /**
   * 🎯 Generate expert CISO recommendations
   */
  static generateCISORecommendations(reviewResults: CISORequirementReview[], categoryName: string): CISORecommendation[] {
    const recommendations: CISORecommendation[] = [];
    
    // Analyze overall quality issues
    const lowQualityReqs = reviewResults.filter(r => r.qualityScore < 70);
    if (lowQualityReqs.length > 0) {
      recommendations.push({
        priority: 'high',
        type: 'enhance_existing',
        title: 'Improve Low-Quality Requirements',
        description: `${lowQualityReqs.length} requirements scored below 70/100 and need enhancement for professional terminology and clarity.`,
        expectedImpact: 'Improved customer confidence and compliance effectiveness',
        implementationEffort: 'medium'
      });
    }
    
    // Analyze framework gaps
    const frameworkGaps = reviewResults.flatMap(r => r.frameworkAlignment.gapsIdentified);
    if (frameworkGaps.length > 0) {
      recommendations.push({
        priority: 'critical',
        type: 'framework_mapping',
        title: 'Address Framework Coverage Gaps',
        description: `Multiple framework gaps identified: ${[...new Set(frameworkGaps)].join(', ')}`,
        expectedImpact: 'Complete regulatory compliance coverage and reduced audit findings',
        implementationEffort: 'high'
      });
    }
    
    // Category-specific recommendations
    const lowerCategory = categoryName.toLowerCase();
    if (lowerCategory.includes('governance')) {
      recommendations.push({
        priority: 'medium',
        type: 'add_content',
        title: 'Enhance Governance Leadership Requirements',
        description: 'Consider adding executive accountability and board reporting requirements for comprehensive governance.',
        expectedImpact: 'Stronger organizational commitment and leadership engagement',
        implementationEffort: 'low'
      });
    }
    
    return recommendations;
  }
}

export default ExpertCISOReviewService;