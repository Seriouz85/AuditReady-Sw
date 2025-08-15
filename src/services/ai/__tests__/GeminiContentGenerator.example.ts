/**
 * Gemini Content Generator - Usage Examples and Integration Guide
 * 
 * This file demonstrates how to integrate and use the GeminiContentGenerator
 * in various scenarios within the Audit-Readiness-Hub application.
 */

import { 
  geminiContentGenerator,
  type ContentGenerationRequest,
  type GenerationContext,
  type QualityLevel
} from '../GeminiContentGenerator';

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Generate Foundation Content for ISO 27001 Implementation
 */
export async function generateISO27001FoundationContent() {
  const context: GenerationContext = {
    frameworks: ['ISO 27001', 'NIST Cybersecurity Framework'],
    industry: 'Financial Services',
    organizationSize: 'enterprise',
    userRole: 'ciso',
    experienceLevel: 'advanced',
    specificRequirements: [
      'Information Security Management System (ISMS)',
      'Risk Management Process',
      'Security Controls Implementation'
    ]
  };

  const request: ContentGenerationRequest = {
    templateId: 'iso27001-foundation-template',
    userId: 'user-123',
    organizationId: 'org-456',
    sessionId: 'session-789',
    prompt: 'Provide comprehensive foundation guidance for implementing ISO 27001 in a financial services organization. Focus on ISMS establishment, risk management integration, and regulatory compliance alignment.',
    contentType: 'foundation',
    context,
    quality: 'ciso-grade' as QualityLevel,
    options: {
      temperature: 0.7,
      maxTokens: 4000,
      topP: 0.9
    }
  };

  try {
    const response = await geminiContentGenerator.generateFoundationContent(request);
    
    console.log('Generated Foundation Content:');
    console.log('Content Hash:', response.contentHash);
    console.log('Quality Score:', response.quality.overallScore);
    console.log('Cost:', `$${response.metadata.costEstimate.totalCost}`);
    console.log('Processing Time:', `${response.metadata.processingTime}ms`);
    
    return response;
  } catch (error) {
    console.error('Foundation content generation failed:', error);
    throw error;
  }
}

/**
 * Example 2: Generate Implementation Steps for Multi-Framework Compliance
 */
export async function generateMultiFrameworkImplementation() {
  const context: GenerationContext = {
    frameworks: ['SOC 2', 'ISO 27001', 'CIS Controls'],
    industry: 'Technology',
    organizationSize: 'sme',
    userRole: 'compliance-officer',
    experienceLevel: 'intermediate',
    existingContent: 'We have basic security policies in place but need to formalize our compliance program.'
  };

  const request: ContentGenerationRequest = {
    organizationId: 'org-789',
    prompt: 'Create detailed implementation steps for achieving SOC 2 Type II, ISO 27001, and CIS Controls compliance simultaneously. Focus on efficient resource utilization and avoiding duplicate efforts.',
    contentType: 'implementation',
    context,
    quality: 'professional' as QualityLevel
  };

  try {
    const response = await geminiContentGenerator.generateImplementationSteps(request);
    
    // Process the response for UI display
    const implementationPlan = {
      content: response.content,
      phases: extractImplementationPhases(response.content),
      estimatedTimeline: extractTimeline(response.content),
      requiredResources: extractResources(response.content),
      qualityScore: response.quality.overallScore,
      relatedFrameworks: response.relatedFrameworks
    };
    
    return implementationPlan;
  } catch (error) {
    console.error('Implementation generation failed:', error);
    throw error;
  }
}

/**
 * Example 3: Generate Practical Tools Recommendations
 */
export async function generateSecurityToolsGuidance() {
  const context: GenerationContext = {
    frameworks: ['NIST Cybersecurity Framework', 'CIS Controls'],
    industry: 'Healthcare',
    organizationSize: 'large-enterprise',
    userRole: 'security-analyst',
    experienceLevel: 'advanced',
    specificRequirements: [
      'HIPAA compliance tools',
      'Network security monitoring', 
      'Endpoint detection and response',
      'Vulnerability management'
    ]
  };

  const request: ContentGenerationRequest = {
    organizationId: 'healthcare-org-001',
    prompt: 'Recommend specific cybersecurity tools and platforms for a large healthcare organization implementing NIST CSF and CIS Controls. Include both commercial and open-source options with cost considerations.',
    contentType: 'tools',
    context,
    quality: 'professional' as QualityLevel
  };

  try {
    const response = await geminiContentGenerator.generatePracticalTools(request);
    
    const toolsRecommendation = {
      commercialTools: extractToolCategory(response.content, 'Commercial'),
      openSourceTools: extractToolCategory(response.content, 'Open Source'),
      cloudNativeTools: extractToolCategory(response.content, 'Cloud'),
      totalCostEstimate: extractCostInformation(response.content),
      implementationPriority: extractPriorityOrder(response.content),
      qualityMetrics: response.quality
    };
    
    return toolsRecommendation;
  } catch (error) {
    console.error('Tools generation failed:', error);
    throw error;
  }
}

/**
 * Example 4: Generate Audit Evidence Requirements
 */
export async function generateAuditEvidenceGuide() {
  const context: GenerationContext = {
    frameworks: ['SOC 2', 'ISO 27001'],
    industry: 'SaaS',
    organizationSize: 'startup',
    userRole: 'auditor',
    experienceLevel: 'expert'
  };

  const request: ContentGenerationRequest = {
    organizationId: 'saas-startup-123',
    prompt: 'Define comprehensive audit evidence requirements for a SaaS startup pursuing SOC 2 Type II and ISO 27001 certification. Focus on practical, cost-effective evidence collection strategies.',
    contentType: 'evidence',
    context,
    quality: 'executive' as QualityLevel
  };

  try {
    const response = await geminiContentGenerator.generateAuditEvidence(request);
    
    const evidenceGuide = {
      documentationRequirements: extractEvidenceCategory(response.content, 'Documentation'),
      technicalArtifacts: extractEvidenceCategory(response.content, 'Technical'),
      operationalRecords: extractEvidenceCategory(response.content, 'Operational'),
      continuousMonitoring: extractEvidenceCategory(response.content, 'Monitoring'),
      auditReadinessScore: calculateReadinessScore(response.quality),
      evidenceGaps: response.suggestions || []
    };
    
    return evidenceGuide;
  } catch (error) {
    console.error('Evidence generation failed:', error);
    throw error;
  }
}

/**
 * Example 5: Enhance Existing Content
 */
export async function enhanceExistingGuidance() {
  const existingContent = `
    Our organization needs to implement access controls as part of our compliance program.
    We should have user authentication and authorization in place.
    Regular access reviews are important for maintaining security.
  `;

  const context: GenerationContext = {
    frameworks: ['ISO 27001', 'SOC 2'],
    industry: 'Financial Services',
    organizationSize: 'enterprise',
    userRole: 'ciso',
    experienceLevel: 'advanced',
    existingContent
  };

  const request: ContentGenerationRequest = {
    organizationId: 'financial-org-456',
    prompt: existingContent,
    contentType: 'enhancement',
    context,
    quality: 'ciso-grade' as QualityLevel
  };

  try {
    const response = await geminiContentGenerator.enhanceExistingContent(request);
    
    const enhancement = {
      originalContent: existingContent,
      enhancedContent: response.content,
      improvementSummary: extractImprovementSummary(response.content),
      qualityImprovement: calculateQualityImprovement(response.quality),
      addedValue: response.suggestions || [],
      professionalScore: response.quality.professionalTone
    };
    
    return enhancement;
  } catch (error) {
    console.error('Content enhancement failed:', error);
    throw error;
  }
}

/**
 * Example 6: Validate Content Quality
 */
export async function validateContentQuality() {
  const contentToValidate = `
    Information Security Management System (ISMS) Implementation Guide
    
    An ISMS is a systematic approach to managing sensitive company information...
    [content continues]
  `;

  const context: GenerationContext = {
    frameworks: ['ISO 27001'],
    userRole: 'ciso',
    experienceLevel: 'expert'
  };

  try {
    const qualityMetrics = await geminiContentGenerator.validateContentQuality(
      contentToValidate, 
      context
    );
    
    const validationResult = {
      overallScore: qualityMetrics.overallScore,
      breakdown: {
        relevance: qualityMetrics.relevance,
        coherence: qualityMetrics.coherence,
        accuracy: qualityMetrics.accuracy,
        completeness: qualityMetrics.completeness,
        professionalTone: qualityMetrics.professionalTone
      },
      recommendation: getQualityRecommendation(qualityMetrics.overallScore),
      passesThreshold: qualityMetrics.overallScore >= 3.5
    };
    
    return validationResult;
  } catch (error) {
    console.error('Quality validation failed:', error);
    throw error;
  }
}

/**
 * Example 7: Monitor API Usage and Costs
 */
export async function monitorAPIUsage(organizationId: string) {
  try {
    // Get monthly usage statistics
    const monthlyStats = await geminiContentGenerator.getUsageStatistics(
      organizationId, 
      'month'
    );
    
    // Get weekly usage statistics
    const weeklyStats = await geminiContentGenerator.getUsageStatistics(
      organizationId, 
      'week'
    );
    
    const usageAnalysis = {
      monthly: {
        totalCost: monthlyStats?.summary?.total_cost || 0,
        totalRequests: monthlyStats?.summary?.total_requests || 0,
        successRate: monthlyStats?.summary?.success_rate || 0,
        averageQuality: monthlyStats?.summary?.overall_quality_score || 0
      },
      weekly: {
        totalCost: weeklyStats?.summary?.total_cost || 0,
        totalRequests: weeklyStats?.summary?.total_requests || 0,
        trending: calculateTrend(weeklyStats?.daily_breakdown || [])
      },
      recommendations: generateCostOptimizationRecommendations(monthlyStats)
    };
    
    return usageAnalysis;
  } catch (error) {
    console.error('Usage monitoring failed:', error);
    throw error;
  }
}

// ============================================================================
// UTILITY FUNCTIONS FOR PROCESSING RESPONSES
// ============================================================================

function extractImplementationPhases(content: string): string[] {
  // Extract phase headers from content
  const phaseRegex = /## Phase \d+: ([^\n]+)/g;
  const phases: string[] = [];
  let match;
  
  while ((match = phaseRegex.exec(content)) !== null) {
    phases.push(match[1]);
  }
  
  return phases;
}

function extractTimeline(content: string): string {
  // Look for timeline information in content
  const timelineMatch = content.match(/timeline[:\s]+([^\n.]+)/i);
  return timelineMatch ? timelineMatch[1].trim() : 'Timeline not specified';
}

function extractResources(content: string): string[] {
  // Extract resource requirements
  const resourcesSection = content.match(/## Required Resources([\s\S]*?)(?=##|$)/i);
  if (resourcesSection) {
    return resourcesSection[1]
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim());
  }
  return [];
}

function extractToolCategory(content: string, category: string): any[] {
  const categoryRegex = new RegExp(`## ${category}[\\s\\S]*?(?=##|$)`, 'i');
  const categoryMatch = content.match(categoryRegex);
  
  if (categoryMatch) {
    const tools = categoryMatch[0]
      .split('\n')
      .filter(line => line.includes('**') || line.includes('•'))
      .map(line => line.trim());
    return tools;
  }
  
  return [];
}

function extractCostInformation(content: string): string {
  const costMatch = content.match(/cost[:\s]+([^\n.]+)/i);
  return costMatch ? costMatch[1].trim() : 'Cost information not available';
}

function extractPriorityOrder(content: string): string[] {
  const priorityMatch = content.match(/priority[:\s]+([\s\S]*?)(?=##|$)/i);
  if (priorityMatch) {
    return priorityMatch[1]
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim());
  }
  return [];
}

function extractEvidenceCategory(content: string, category: string): string[] {
  const categoryRegex = new RegExp(`## ${category}[\\s\\S]*?(?=##|$)`, 'i');
  const match = content.match(categoryRegex);
  
  if (match) {
    return match[0]
      .split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
      .map(line => line.replace(/^[-•]\s*/, '').trim());
  }
  
  return [];
}

function calculateReadinessScore(quality: any): number {
  return Math.round((quality.overallScore / 5.0) * 100);
}

function extractImprovementSummary(content: string): string {
  const summaryMatch = content.match(/improvement[:\s]+([^\n.]+)/i);
  return summaryMatch ? summaryMatch[1].trim() : 'Content enhanced for professional quality';
}

function calculateQualityImprovement(quality: any): number {
  // Assume baseline quality of 3.0 for original content
  const baselineQuality = 3.0;
  return Math.round(((quality.overallScore - baselineQuality) / baselineQuality) * 100);
}

function getQualityRecommendation(score: number): string {
  if (score >= 4.5) return 'Exceptional quality - ready for executive review';
  if (score >= 4.0) return 'High quality - suitable for professional use';
  if (score >= 3.5) return 'Good quality - minor improvements recommended';
  if (score >= 3.0) return 'Acceptable quality - moderate improvements needed';
  return 'Quality improvements required before use';
}

function calculateTrend(dailyData: any[]): string {
  if (!dailyData || dailyData.length < 2) return 'Insufficient data';
  
  const recent = dailyData.slice(-3);
  const earlier = dailyData.slice(0, 3);
  
  const recentAvg = recent.reduce((sum, day) => sum + (day.requests || 0), 0) / recent.length;
  const earlierAvg = earlier.reduce((sum, day) => sum + (day.requests || 0), 0) / earlier.length;
  
  const change = ((recentAvg - earlierAvg) / earlierAvg) * 100;
  
  if (change > 10) return 'Increasing usage';
  if (change < -10) return 'Decreasing usage';
  return 'Stable usage';
}

function generateCostOptimizationRecommendations(stats: any): string[] {
  const recommendations: string[] = [];
  
  if (stats?.summary?.avg_cost_per_request > 0.1) {
    recommendations.push('Consider using Gemini Flash model for simple requests to reduce costs');
  }
  
  if (stats?.summary?.success_rate < 90) {
    recommendations.push('Investigate failed requests to improve API efficiency');
  }
  
  if (stats?.summary?.avg_response_time_ms > 5000) {
    recommendations.push('Optimize prompt length and complexity to improve response times');
  }
  
  return recommendations;
}

// ============================================================================
// INTEGRATION WITH EXISTING COMPONENTS
// ============================================================================

/**
 * Example integration with Compliance Simplification component
 */
export async function integrateWithComplianceSimplification(
  category: string,
  selectedFrameworks: Record<string, boolean>,
  organizationId: string,
  userId: string
) {
  const frameworks = Object.keys(selectedFrameworks).filter(f => selectedFrameworks[f]);
  
  const context: GenerationContext = {
    frameworks,
    userRole: 'compliance-officer',
    experienceLevel: 'intermediate'
  };

  // Generate all content types for the category
  const promises = [
    geminiContentGenerator.generateFoundationContent({
      organizationId,
      userId,
      prompt: `Provide foundation guidance for ${category} compliance across ${frameworks.join(', ')} frameworks`,
      contentType: 'foundation',
      context,
      quality: 'professional'
    }),
    geminiContentGenerator.generateImplementationSteps({
      organizationId,
      userId,
      prompt: `Create implementation steps for ${category} across ${frameworks.join(', ')} frameworks`,
      contentType: 'implementation',
      context,
      quality: 'professional'
    }),
    geminiContentGenerator.generatePracticalTools({
      organizationId,
      userId,
      prompt: `Recommend tools and resources for ${category} implementation`,
      contentType: 'tools',
      context,
      quality: 'professional'
    }),
    geminiContentGenerator.generateAuditEvidence({
      organizationId,
      userId,
      prompt: `Define audit evidence requirements for ${category}`,
      contentType: 'evidence',
      context,
      quality: 'professional'
    })
  ];

  try {
    const [foundation, implementation, tools, evidence] = await Promise.all(promises);
    
    return {
      category,
      frameworks,
      content: {
        foundation: foundation.content,
        implementation: implementation.content,
        tools: tools.content,
        evidence: evidence.content
      },
      metadata: {
        totalCost: foundation.metadata.costEstimate.totalCost + 
                   implementation.metadata.costEstimate.totalCost +
                   tools.metadata.costEstimate.totalCost +
                   evidence.metadata.costEstimate.totalCost,
        totalProcessingTime: foundation.metadata.processingTime +
                            implementation.metadata.processingTime +
                            tools.metadata.processingTime +
                            evidence.metadata.processingTime,
        overallQuality: (foundation.quality.overallScore +
                        implementation.quality.overallScore +
                        tools.quality.overallScore +
                        evidence.quality.overallScore) / 4
      }
    };
  } catch (error) {
    console.error('Compliance simplification integration failed:', error);
    throw error;
  }
}

/**
 * Example error handling and fallback strategies
 */
export async function generateWithFallback(request: ContentGenerationRequest) {
  try {
    // Try with highest quality first
    const response = await geminiContentGenerator.generateFoundationContent({
      ...request,
      quality: 'ciso-grade'
    });
    return response;
  } catch (error) {
    console.warn('High-quality generation failed, trying standard quality:', error);
    
    try {
      // Fallback to standard quality
      const response = await geminiContentGenerator.generateFoundationContent({
        ...request,
        quality: 'standard',
        options: {
          ...request.options,
          maxTokens: 2000 // Reduce token limit
        }
      });
      return response;
    } catch (fallbackError) {
      console.error('All generation attempts failed:', fallbackError);
      
      // Return a basic response structure
      return {
        content: 'Content generation is temporarily unavailable. Please try again later.',
        contentHash: 'fallback-hash',
        quality: {
          relevance: 0,
          coherence: 0,
          accuracy: 0,
          completeness: 0,
          professionalTone: 0,
          overallScore: 0
        },
        metadata: {
          model: 'fallback',
          tokensUsed: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          costEstimate: { promptCost: 0, completionCost: 0, totalCost: 0, currency: 'USD' },
          processingTime: 0,
          generationParameters: {},
          contentLength: 0,
          language: 'en'
        }
      };
    }
  }
}