/**
 * Real-time Content Recommendation Engine
 * AI-powered real-time recommendations for enhanced guidance generation
 * Provides dynamic suggestions, content optimization, and user experience enhancement
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabase';

export interface RecommendationContext {
  userId?: string;
  organizationId?: string;
  categoryId: string;
  currentContent: string;
  selectedFrameworks: Record<string, boolean>;
  userProfile?: UserProfile;
  sessionData?: SessionData;
  performanceMetrics?: PerformanceMetrics;
}

export interface UserProfile {
  role: string;
  industry: string;
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  preferences: UserPreferences;
  historyData: UserHistoryData;
}

export interface UserPreferences {
  preferredFrameworks: string[];
  contentDetailLevel: 'basic' | 'detailed' | 'comprehensive';
  focusAreas: string[];
  avoidancePatterns: string[];
}

export interface UserHistoryData {
  previousCategories: string[];
  frequentFrameworks: string[];
  qualityFeedback: number[];
  commonIssues: string[];
}

export interface SessionData {
  sessionId: string;
  startTime: Date;
  categoriesProcessed: string[];
  currentWorkflow: string;
  timeSpent: number;
  errorCount: number;
}

export interface PerformanceMetrics {
  averageQualityScore: number;
  averageProcessingTime: number;
  successRate: number;
  userSatisfaction: number;
}

export interface RecommendationResult {
  id: string;
  type: RecommendationType;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionable: boolean;
  implementation: RecommendationImplementation;
  confidence: number;
  estimatedImpact: EstimatedImpact;
  metadata: RecommendationMetadata;
}

export type RecommendationType = 
  | 'content-enhancement'
  | 'framework-alignment'
  | 'quality-improvement'
  | 'user-experience'
  | 'performance-optimization'
  | 'compliance-validation'
  | 'cross-reference'
  | 'personalization';

export interface RecommendationImplementation {
  autoApplicable: boolean;
  steps: string[];
  requiredActions: string[];
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'complex';
}

export interface EstimatedImpact {
  qualityImprovement: number; // 0-1
  userSatisfaction: number; // 0-1
  complianceAlignment: number; // 0-1
  processingEfficiency: number; // 0-1
}

export interface RecommendationMetadata {
  generatedAt: string;
  modelUsed: string;
  contextFactors: string[];
  validUntil: string;
  associatedCategories: string[];
}

export class RealtimeRecommendationEngine {
  private static genAI: GoogleGenerativeAI | null = null;
  private static readonly RECOMMENDATION_CACHE = new Map<string, RecommendationResult[]>();
  private static readonly CACHE_TTL = 300000; // 5 minutes
  private static readonly MAX_RECOMMENDATIONS = 8;

  /**
   * Initialize AI service
   */
  private static initializeAI(): GoogleGenerativeAI {
    if (!this.genAI) {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  /**
   * 🚀 MAIN RECOMMENDATION ENGINE
   * Generate real-time recommendations based on context
   */
  static async generateRealtimeRecommendations(
    context: RecommendationContext
  ): Promise<RecommendationResult[]> {
    const startTime = Date.now();
    
    try {
      console.log(`[RecommendationEngine] Generating recommendations for category: ${context.categoryId}`);

      // Check cache first
      const cacheKey = this.generateCacheKey(context);
      const cached = this.getCachedRecommendations(cacheKey);
      if (cached) {
        console.log('[RecommendationEngine] Returning cached recommendations');
        return cached;
      }

      // Generate fresh recommendations
      const recommendations: RecommendationResult[] = [];

      // 1. Content Enhancement Recommendations
      const contentRecommendations = await this.generateContentEnhancementRecommendations(context);
      recommendations.push(...contentRecommendations);

      // 2. Framework Alignment Recommendations
      const frameworkRecommendations = await this.generateFrameworkAlignmentRecommendations(context);
      recommendations.push(...frameworkRecommendations);

      // 3. Quality Improvement Recommendations
      const qualityRecommendations = await this.generateQualityImprovementRecommendations(context);
      recommendations.push(...qualityRecommendations);

      // 4. User Experience Recommendations
      const uxRecommendations = await this.generateUserExperienceRecommendations(context);
      recommendations.push(...uxRecommendations);

      // 5. Performance Optimization Recommendations
      const performanceRecommendations = await this.generatePerformanceOptimizationRecommendations(context);
      recommendations.push(...performanceRecommendations);

      // 6. AI-Generated Dynamic Recommendations
      const aiRecommendations = await this.generateAIDynamicRecommendations(context);
      recommendations.push(...aiRecommendations);

      // Sort and filter recommendations
      const finalRecommendations = this.prioritizeAndFilterRecommendations(recommendations);

      // Cache results
      this.cacheRecommendations(cacheKey, finalRecommendations);

      // Store recommendation analytics
      await this.storeRecommendationAnalytics(context, finalRecommendations, Date.now() - startTime);

      console.log(`[RecommendationEngine] Generated ${finalRecommendations.length} recommendations in ${Date.now() - startTime}ms`);
      return finalRecommendations;

    } catch (error) {
      console.error('[RecommendationEngine] Recommendation generation failed:', error);
      return this.getFallbackRecommendations(context);
    }
  }

  /**
   * ✨ Generate content enhancement recommendations
   */
  private static async generateContentEnhancementRecommendations(
    context: RecommendationContext
  ): Promise<RecommendationResult[]> {
    const recommendations: RecommendationResult[] = [];

    try {
      // Analyze current content for enhancement opportunities
      const contentAnalysis = await this.analyzeContentForEnhancement(context.currentContent, context.categoryId);

      if (contentAnalysis.lengthIssues) {
        recommendations.push({
          id: `content-length-${Date.now()}`,
          type: 'content-enhancement',
          priority: 'high',
          title: 'Content Length Optimization',
          description: contentAnalysis.lengthIssues.description,
          actionable: true,
          implementation: {
            autoApplicable: true,
            steps: contentAnalysis.lengthIssues.steps,
            requiredActions: ['Review content structure', 'Apply AI compression/expansion'],
            estimatedTime: '2-3 minutes',
            difficulty: 'easy'
          },
          confidence: 0.85,
          estimatedImpact: {
            qualityImprovement: 0.3,
            userSatisfaction: 0.2,
            complianceAlignment: 0.1,
            processingEfficiency: 0.15
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            modelUsed: 'content-analysis',
            contextFactors: ['content-length', 'category-requirements'],
            validUntil: new Date(Date.now() + 300000).toISOString(),
            associatedCategories: [context.categoryId]
          }
        });
      }

      if (contentAnalysis.structureIssues) {
        recommendations.push({
          id: `content-structure-${Date.now()}`,
          type: 'content-enhancement',
          priority: 'medium',
          title: 'Content Structure Improvement',
          description: contentAnalysis.structureIssues.description,
          actionable: true,
          implementation: {
            autoApplicable: false,
            steps: contentAnalysis.structureIssues.steps,
            requiredActions: ['Review content organization', 'Apply structural improvements'],
            estimatedTime: '5-7 minutes',
            difficulty: 'medium'
          },
          confidence: 0.75,
          estimatedImpact: {
            qualityImprovement: 0.4,
            userSatisfaction: 0.3,
            complianceAlignment: 0.2,
            processingEfficiency: 0.1
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            modelUsed: 'structure-analysis',
            contextFactors: ['content-structure', 'readability'],
            validUntil: new Date(Date.now() + 300000).toISOString(),
            associatedCategories: [context.categoryId]
          }
        });
      }

      return recommendations;

    } catch (error) {
      console.error('[RecommendationEngine] Content enhancement recommendations failed:', error);
      return [];
    }
  }

  /**
   * 🎯 Generate framework alignment recommendations
   */
  private static async generateFrameworkAlignmentRecommendations(
    context: RecommendationContext
  ): Promise<RecommendationResult[]> {
    const recommendations: RecommendationResult[] = [];

    try {
      const activeFrameworks = Object.entries(context.selectedFrameworks)
        .filter(([, isSelected]) => isSelected)
        .map(([framework]) => framework);

      // Check for missing framework coverage
      const frameworkGaps = await this.identifyFrameworkGaps(
        context.currentContent,
        activeFrameworks,
        context.categoryId
      );

      if (frameworkGaps.length > 0) {
        recommendations.push({
          id: `framework-gaps-${Date.now()}`,
          type: 'framework-alignment',
          priority: 'high',
          title: 'Framework Coverage Gaps',
          description: `Missing coverage for: ${frameworkGaps.join(', ')}`,
          actionable: true,
          implementation: {
            autoApplicable: true,
            steps: frameworkGaps.map(fw => `Add ${fw}-specific guidance`),
            requiredActions: ['Generate framework-specific content', 'Validate alignment'],
            estimatedTime: '3-5 minutes',
            difficulty: 'medium'
          },
          confidence: 0.9,
          estimatedImpact: {
            qualityImprovement: 0.5,
            userSatisfaction: 0.3,
            complianceAlignment: 0.8,
            processingEfficiency: 0.2
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            modelUsed: 'framework-analysis',
            contextFactors: ['framework-coverage', 'compliance-requirements'],
            validUntil: new Date(Date.now() + 600000).toISOString(),
            associatedCategories: [context.categoryId]
          }
        });
      }

      // Check for framework conflicts
      const conflicts = await this.identifyFrameworkConflicts(context.currentContent, activeFrameworks);
      if (conflicts.length > 0) {
        recommendations.push({
          id: `framework-conflicts-${Date.now()}`,
          type: 'framework-alignment',
          priority: 'critical',
          title: 'Framework Requirement Conflicts',
          description: `Conflicting requirements detected between frameworks`,
          actionable: true,
          implementation: {
            autoApplicable: false,
            steps: ['Review conflicting requirements', 'Harmonize guidance', 'Validate resolution'],
            requiredActions: ['Manual review required', 'Expert consultation recommended'],
            estimatedTime: '10-15 minutes',
            difficulty: 'complex'
          },
          confidence: 0.8,
          estimatedImpact: {
            qualityImprovement: 0.7,
            userSatisfaction: 0.4,
            complianceAlignment: 0.9,
            processingEfficiency: 0.1
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            modelUsed: 'conflict-analysis',
            contextFactors: ['framework-conflicts', 'requirement-harmonization'],
            validUntil: new Date(Date.now() + 300000).toISOString(),
            associatedCategories: [context.categoryId]
          }
        });
      }

      return recommendations;

    } catch (error) {
      console.error('[RecommendationEngine] Framework alignment recommendations failed:', error);
      return [];
    }
  }

  /**
   * 📈 Generate quality improvement recommendations
   */
  private static async generateQualityImprovementRecommendations(
    context: RecommendationContext
  ): Promise<RecommendationResult[]> {
    const recommendations: RecommendationResult[] = [];

    try {
      // Analyze content quality metrics
      const qualityAnalysis = await this.analyzeContentQuality(context.currentContent, context.categoryId);

      if (qualityAnalysis.readabilityScore < 0.7) {
        recommendations.push({
          id: `readability-${Date.now()}`,
          type: 'quality-improvement',
          priority: 'medium',
          title: 'Readability Enhancement',
          description: 'Content readability can be improved for better user comprehension',
          actionable: true,
          implementation: {
            autoApplicable: true,
            steps: ['Simplify complex sentences', 'Improve paragraph structure', 'Add transition words'],
            requiredActions: ['Apply readability improvements', 'Validate changes'],
            estimatedTime: '3-4 minutes',
            difficulty: 'easy'
          },
          confidence: 0.8,
          estimatedImpact: {
            qualityImprovement: 0.3,
            userSatisfaction: 0.5,
            complianceAlignment: 0.1,
            processingEfficiency: 0.2
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            modelUsed: 'readability-analysis',
            contextFactors: ['readability-score', 'user-comprehension'],
            validUntil: new Date(Date.now() + 300000).toISOString(),
            associatedCategories: [context.categoryId]
          }
        });
      }

      if (qualityAnalysis.professionalismScore < 0.8) {
        recommendations.push({
          id: `professionalism-${Date.now()}`,
          type: 'quality-improvement',
          priority: 'high',
          title: 'Professional Tone Enhancement',
          description: 'Content tone could be more professional and authoritative',
          actionable: true,
          implementation: {
            autoApplicable: true,
            steps: ['Remove casual language', 'Enhance professional terminology', 'Improve authoritative tone'],
            requiredActions: ['Apply tone improvements', 'Validate professional standards'],
            estimatedTime: '2-3 minutes',
            difficulty: 'easy'
          },
          confidence: 0.85,
          estimatedImpact: {
            qualityImprovement: 0.4,
            userSatisfaction: 0.3,
            complianceAlignment: 0.3,
            processingEfficiency: 0.1
          },
          metadata: {
            generatedAt: new Date().toISOString(),
            modelUsed: 'tone-analysis',
            contextFactors: ['professional-tone', 'authority-level'],
            validUntil: new Date(Date.now() + 300000).toISOString(),
            associatedCategories: [context.categoryId]
          }
        });
      }

      return recommendations;

    } catch (error) {
      console.error('[RecommendationEngine] Quality improvement recommendations failed:', error);
      return [];
    }
  }

  /**
   * 👤 Generate user experience recommendations
   */
  private static async generateUserExperienceRecommendations(
    context: RecommendationContext
  ): Promise<RecommendationResult[]> {
    const recommendations: RecommendationResult[] = [];

    try {
      // Personalization recommendations based on user profile
      if (context.userProfile) {
        const personalizationRecommendations = await this.generatePersonalizationRecommendations(context);
        recommendations.push(...personalizationRecommendations);
      }

      // Session-based recommendations
      if (context.sessionData) {
        const sessionRecommendations = await this.generateSessionBasedRecommendations(context);
        recommendations.push(...sessionRecommendations);
      }

      return recommendations;

    } catch (error) {
      console.error('[RecommendationEngine] User experience recommendations failed:', error);
      return [];
    }
  }

  /**
   * ⚡ Generate performance optimization recommendations
   */
  private static async generatePerformanceOptimizationRecommendations(
    context: RecommendationContext
  ): Promise<RecommendationResult[]> {
    const recommendations: RecommendationResult[] = [];

    try {
      if (context.performanceMetrics) {
        if (context.performanceMetrics.averageProcessingTime > 5000) { // > 5 seconds
          recommendations.push({
            id: `performance-${Date.now()}`,
            type: 'performance-optimization',
            priority: 'medium',
            title: 'Processing Speed Optimization',
            description: 'Consider using cached guidance or simplified processing for better performance',
            actionable: true,
            implementation: {
              autoApplicable: true,
              steps: ['Enable content caching', 'Use optimized processing', 'Implement smart defaults'],
              requiredActions: ['Apply performance optimizations'],
              estimatedTime: '1-2 minutes',
              difficulty: 'easy'
            },
            confidence: 0.9,
            estimatedImpact: {
              qualityImprovement: 0.1,
              userSatisfaction: 0.4,
              complianceAlignment: 0.0,
              processingEfficiency: 0.6
            },
            metadata: {
              generatedAt: new Date().toISOString(),
              modelUsed: 'performance-analysis',
              contextFactors: ['processing-time', 'user-experience'],
              validUntil: new Date(Date.now() + 600000).toISOString(),
              associatedCategories: [context.categoryId]
            }
          });
        }
      }

      return recommendations;

    } catch (error) {
      console.error('[RecommendationEngine] Performance optimization recommendations failed:', error);
      return [];
    }
  }

  /**
   * 🤖 Generate AI-powered dynamic recommendations
   */
  private static async generateAIDynamicRecommendations(
    context: RecommendationContext
  ): Promise<RecommendationResult[]> {
    try {
      const genAI = this.initializeAI();
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const activeFrameworks = Object.entries(context.selectedFrameworks)
        .filter(([, isSelected]) => isSelected)
        .map(([framework]) => framework);

      const prompt = `Analyze this compliance guidance content and provide intelligent recommendations for improvement.

**CONTENT ANALYSIS:**
Category: ${context.categoryId}
Current Content: ${context.currentContent.substring(0, 2000)}
Active Frameworks: ${activeFrameworks.join(', ')}

**USER CONTEXT:**
${context.userProfile ? `Role: ${context.userProfile.role}, Experience: ${context.userProfile.experienceLevel}` : 'No user profile available'}

**ANALYSIS REQUIREMENTS:**
1. Identify specific areas for improvement
2. Suggest actionable enhancements
3. Consider framework-specific optimizations
4. Focus on practical implementation value
5. Maintain professional compliance standards

**RECOMMENDATION CATEGORIES:**
- Content gaps or weaknesses
- Framework alignment opportunities
- Implementation practicality improvements
- Cross-reference suggestions
- User experience enhancements

Provide recommendations in JSON format:
{
  "recommendations": [
    {
      "type": "content-enhancement|framework-alignment|quality-improvement|cross-reference",
      "priority": "critical|high|medium|low",
      "title": "Clear recommendation title",
      "description": "Detailed description of the issue/opportunity",
      "confidence": 0.8,
      "implementation": {
        "autoApplicable": true,
        "difficulty": "easy|medium|complex",
        "estimatedTime": "2-3 minutes"
      }
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiResponse = response.text();

      // Parse AI recommendations
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const aiData = JSON.parse(jsonMatch[0]);
        return this.parseAIRecommendations(aiData.recommendations || [], context);
      }

      return [];

    } catch (error) {
      console.error('[RecommendationEngine] AI dynamic recommendations failed:', error);
      return [];
    }
  }

  // Helper methods

  private static generateCacheKey(context: RecommendationContext): string {
    const keyData = {
      categoryId: context.categoryId,
      frameworks: Object.keys(context.selectedFrameworks).sort(),
      contentHash: this.hashString(context.currentContent.substring(0, 500)),
      userRole: context.userProfile?.role || 'default'
    };
    return btoa(JSON.stringify(keyData));
  }

  private static getCachedRecommendations(cacheKey: string): RecommendationResult[] | null {
    const cached = this.RECOMMENDATION_CACHE.get(cacheKey);
    if (cached && cached.length > 0) {
      const firstRecommendation = cached[0];
      const validUntil = new Date(firstRecommendation.metadata.validUntil);
      if (validUntil > new Date()) {
        return cached;
      }
      this.RECOMMENDATION_CACHE.delete(cacheKey);
    }
    return null;
  }

  private static cacheRecommendations(cacheKey: string, recommendations: RecommendationResult[]): void {
    this.RECOMMENDATION_CACHE.set(cacheKey, recommendations);
    
    // Clean cache periodically
    if (this.RECOMMENDATION_CACHE.size > 100) {
      const keysToDelete = Array.from(this.RECOMMENDATION_CACHE.keys()).slice(0, 20);
      keysToDelete.forEach(key => this.RECOMMENDATION_CACHE.delete(key));
    }
  }

  private static prioritizeAndFilterRecommendations(
    recommendations: RecommendationResult[]
  ): RecommendationResult[] {
    return recommendations
      .sort((a, b) => {
        // Sort by priority first
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by confidence
        return b.confidence - a.confidence;
      })
      .slice(0, this.MAX_RECOMMENDATIONS);
  }

  private static async analyzeContentForEnhancement(content: string, categoryId: string): Promise<any> {
    const analysis: any = {};
    
    // Length analysis
    const contentRows = content.split('\n').filter(line => line.trim().length > 20).length;
    if (contentRows < 6) {
      analysis.lengthIssues = {
        description: `Content too short: ${contentRows} rows (recommended: 8-10 rows)`,
        steps: ['Expand implementation details', 'Add framework-specific guidance', 'Include practical examples']
      };
    } else if (contentRows > 12) {
      analysis.lengthIssues = {
        description: `Content too long: ${contentRows} rows (recommended: 8-10 rows)`,
        steps: ['Compress redundant information', 'Focus on essential guidance', 'Remove verbose explanations']
      };
    }

    // Structure analysis
    const hasHeaders = content.includes('**') || content.includes('#');
    const hasBulletPoints = content.includes('•') || content.includes('-');
    if (!hasHeaders && !hasBulletPoints) {
      analysis.structureIssues = {
        description: 'Content lacks clear structure and organization',
        steps: ['Add section headers', 'Use bullet points for lists', 'Improve content flow']
      };
    }

    return analysis;
  }

  private static async identifyFrameworkGaps(
    content: string,
    activeFrameworks: string[],
    categoryId: string
  ): Promise<string[]> {
    const lowerContent = content.toLowerCase();
    const gaps: string[] = [];

    for (const framework of activeFrameworks) {
      const frameworkMentioned = lowerContent.includes(framework.toLowerCase()) ||
                                lowerContent.includes(framework.replace(/\d+/g, '').toLowerCase());
      if (!frameworkMentioned) {
        gaps.push(framework);
      }
    }

    return gaps;
  }

  private static async identifyFrameworkConflicts(
    content: string,
    activeFrameworks: string[]
  ): Promise<string[]> {
    // Simplified conflict detection - in practice, this would be more sophisticated
    const conflicts: string[] = [];
    
    // Check for contradictory statements (simplified)
    if (content.includes('not required') && content.includes('mandatory')) {
      conflicts.push('Contradictory requirement statements detected');
    }

    return conflicts;
  }

  private static async analyzeContentQuality(content: string, categoryId: string): Promise<any> {
    const analysis: any = {};

    // Readability analysis (simplified)
    const avgSentenceLength = content.split(/[.!?]+/).reduce((sum, sentence) => {
      return sum + sentence.trim().split(/\s+/).length;
    }, 0) / content.split(/[.!?]+/).length;

    analysis.readabilityScore = avgSentenceLength > 25 ? 0.5 : 0.8; // Simplified

    // Professionalism analysis
    const casualPhrases = ['think of it', 'imagine', 'basically', 'obviously', 'simple'];
    const hasCasualLanguage = casualPhrases.some(phrase => 
      content.toLowerCase().includes(phrase)
    );
    analysis.professionalismScore = hasCasualLanguage ? 0.6 : 0.9;

    return analysis;
  }

  private static async generatePersonalizationRecommendations(
    context: RecommendationContext
  ): Promise<RecommendationResult[]> {
    const recommendations: RecommendationResult[] = [];

    if (context.userProfile?.experienceLevel === 'beginner') {
      recommendations.push({
        id: `beginner-help-${Date.now()}`,
        type: 'personalization',
        priority: 'medium',
        title: 'Beginner-Friendly Enhancements',
        description: 'Add explanatory content for compliance beginners',
        actionable: true,
        implementation: {
          autoApplicable: true,
          steps: ['Add terminology explanations', 'Include basic concepts', 'Provide step-by-step guidance'],
          requiredActions: ['Enhance for beginner understanding'],
          estimatedTime: '3-5 minutes',
          difficulty: 'easy'
        },
        confidence: 0.8,
        estimatedImpact: {
          qualityImprovement: 0.2,
          userSatisfaction: 0.6,
          complianceAlignment: 0.1,
          processingEfficiency: 0.1
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          modelUsed: 'personalization-engine',
          contextFactors: ['user-experience-level', 'content-complexity'],
          validUntil: new Date(Date.now() + 300000).toISOString(),
          associatedCategories: [context.categoryId]
        }
      });
    }

    return recommendations;
  }

  private static async generateSessionBasedRecommendations(
    context: RecommendationContext
  ): Promise<RecommendationResult[]> {
    const recommendations: RecommendationResult[] = [];

    if (context.sessionData?.errorCount && context.sessionData.errorCount > 2) {
      recommendations.push({
        id: `session-support-${Date.now()}`,
        type: 'user-experience',
        priority: 'high',
        title: 'Session Support Recommendation',
        description: 'Multiple errors detected - consider simplified guidance approach',
        actionable: true,
        implementation: {
          autoApplicable: true,
          steps: ['Use simpler language', 'Provide more examples', 'Add troubleshooting tips'],
          requiredActions: ['Apply user-friendly enhancements'],
          estimatedTime: '2-3 minutes',
          difficulty: 'easy'
        },
        confidence: 0.75,
        estimatedImpact: {
          qualityImprovement: 0.2,
          userSatisfaction: 0.5,
          complianceAlignment: 0.1,
          processingEfficiency: 0.2
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          modelUsed: 'session-analysis',
          contextFactors: ['error-rate', 'user-difficulty'],
          validUntil: new Date(Date.now() + 300000).toISOString(),
          associatedCategories: [context.categoryId]
        }
      });
    }

    return recommendations;
  }

  private static parseAIRecommendations(
    aiRecommendations: any[],
    context: RecommendationContext
  ): RecommendationResult[] {
    return aiRecommendations.map((rec, index) => ({
      id: `ai-rec-${Date.now()}-${index}`,
      type: rec.type as RecommendationType,
      priority: rec.priority || 'medium',
      title: rec.title || 'AI Recommendation',
      description: rec.description || 'AI-generated recommendation',
      actionable: rec.implementation?.autoApplicable || false,
      implementation: {
        autoApplicable: rec.implementation?.autoApplicable || false,
        steps: Array.isArray(rec.steps) ? rec.steps : ['Apply AI recommendation'],
        requiredActions: ['Review and apply AI suggestion'],
        estimatedTime: rec.implementation?.estimatedTime || '3-5 minutes',
        difficulty: rec.implementation?.difficulty || 'medium'
      },
      confidence: rec.confidence || 0.7,
      estimatedImpact: {
        qualityImprovement: 0.3,
        userSatisfaction: 0.3,
        complianceAlignment: 0.2,
        processingEfficiency: 0.2
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        modelUsed: 'gemini-pro',
        contextFactors: ['ai-analysis', 'content-optimization'],
        validUntil: new Date(Date.now() + 300000).toISOString(),
        associatedCategories: [context.categoryId]
      }
    }));
  }

  private static getFallbackRecommendations(context: RecommendationContext): RecommendationResult[] {
    return [{
      id: `fallback-${Date.now()}`,
      type: 'quality-improvement',
      priority: 'medium',
      title: 'General Content Review',
      description: 'Review content for compliance accuracy and completeness',
      actionable: true,
      implementation: {
        autoApplicable: false,
        steps: ['Review content accuracy', 'Check framework alignment', 'Validate completeness'],
        requiredActions: ['Manual content review'],
        estimatedTime: '5-10 minutes',
        difficulty: 'medium'
      },
      confidence: 0.6,
      estimatedImpact: {
        qualityImprovement: 0.3,
        userSatisfaction: 0.2,
        complianceAlignment: 0.3,
        processingEfficiency: 0.1
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        modelUsed: 'fallback',
        contextFactors: ['general-review'],
        validUntil: new Date(Date.now() + 300000).toISOString(),
        associatedCategories: [context.categoryId]
      }
    }];
  }

  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private static async storeRecommendationAnalytics(
    context: RecommendationContext,
    recommendations: RecommendationResult[],
    processingTime: number
  ): Promise<void> {
    try {
      await supabase
        .from('recommendation_analytics')
        .insert({
          category_id: context.categoryId,
          user_id: context.userId,
          organization_id: context.organizationId,
          recommendations_count: recommendations.length,
          processing_time_ms: processingTime,
          recommendation_types: recommendations.map(r => r.type),
          average_confidence: recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length,
          session_id: context.sessionData?.sessionId,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('[RecommendationEngine] Failed to store analytics:', error);
    }
  }

  /**
   * 📊 Get recommendation engine statistics
   */
  static getEngineStatistics(): any {
    return {
      cacheSize: this.RECOMMENDATION_CACHE.size,
      maxRecommendations: this.MAX_RECOMMENDATIONS,
      cacheTTL: this.CACHE_TTL,
      supportedTypes: [
        'content-enhancement',
        'framework-alignment', 
        'quality-improvement',
        'user-experience',
        'performance-optimization',
        'compliance-validation',
        'cross-reference',
        'personalization'
      ]
    };
  }
}