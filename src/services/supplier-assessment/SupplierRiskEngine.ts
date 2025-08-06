/**
 * Supplier Risk Assessment Engine
 * Advanced risk calculation and KPI generation for supplier assessments
 */

import type { 
  SupplierAssessmentCampaign,
  SupplierRequirementResponse,
  SupplierRiskFactor,
  SupplierComplianceMetrics,
  SupplierRiskDashboard,
  FulfillmentLevel,
  RiskLevel
} from '@/types/supplier-assessment';

export interface RiskCalculationInput {
  campaign: SupplierAssessmentCampaign;
  responses: SupplierRequirementResponse[];
  requirements: any[]; // From requirements table
  standards: any[]; // From standards table
}

export interface RiskWeighting {
  standard_id: string;
  category: string;
  weight: number;
  criticality: number; // 1-5 scale
}

export interface ComplianceGapAnalysis {
  total_gaps: number;
  critical_gaps: number;
  high_risk_gaps: number;
  medium_risk_gaps: number;
  low_risk_gaps: number;
  gap_details: {
    requirement_id: string;
    requirement_name: string;
    standard_name: string;
    current_level: FulfillmentLevel;
    expected_level: FulfillmentLevel;
    risk_impact: number;
    remediation_effort: 'low' | 'medium' | 'high';
  }[];
}

export interface SupplierBenchmark {
  industry_average: number;
  top_quartile: number;
  bottom_quartile: number;
  peer_comparison: {
    better_than: number; // percentage of similar suppliers
    position: 'top' | 'above-average' | 'average' | 'below-average' | 'bottom';
  };
}

export interface RiskTrend {
  period: string;
  risk_score: number;
  trend: 'improving' | 'stable' | 'declining';
  change_percentage: number;
}

export class SupplierRiskEngine {
  
  // Standard risk weightings by category
  private readonly STANDARD_WEIGHTS: Record<string, RiskWeighting[]> = {
    'ISO27001': [
      { standard_id: 'iso27001', category: 'access_control', weight: 1.2, criticality: 5 },
      { standard_id: 'iso27001', category: 'incident_management', weight: 1.1, criticality: 4 },
      { standard_id: 'iso27001', category: 'data_protection', weight: 1.3, criticality: 5 },
      { standard_id: 'iso27001', category: 'business_continuity', weight: 1.0, criticality: 3 },
    ],
    'NIS2': [
      { standard_id: 'nis2', category: 'network_security', weight: 1.4, criticality: 5 },
      { standard_id: 'nis2', category: 'incident_response', weight: 1.2, criticality: 4 },
      { standard_id: 'nis2', category: 'supply_chain', weight: 1.1, criticality: 4 },
    ],
    'CIS': [
      { standard_id: 'cis', category: 'basic_controls', weight: 1.0, criticality: 3 },
      { standard_id: 'cis', category: 'foundational_controls', weight: 1.1, criticality: 4 },
      { standard_id: 'cis', category: 'organizational_controls', weight: 0.9, criticality: 2 },
    ]
  };

  /**
   * Calculate comprehensive risk score for a supplier assessment
   */
  async calculateRiskScore(input: RiskCalculationInput): Promise<number> {
    const { campaign, responses, requirements } = input;
    
    // Base compliance score (0-100)
    const complianceScore = this.calculateComplianceScore(responses, requirements);
    
    // Apply weightings based on standards and criticality
    const weightedScore = this.applyRiskWeightings(complianceScore, responses, campaign);
    
    // Factor in response quality and confidence
    const qualityAdjustment = this.calculateQualityAdjustment(responses);
    
    // Apply time penalties for overdue assessments
    const timePenalty = this.calculateTimePenalty(campaign);
    
    // Calculate final risk score (higher = more risky)
    let riskScore = 100 - weightedScore + qualityAdjustment + timePenalty;
    
    // Ensure score stays within bounds
    return Math.max(0, Math.min(100, Math.round(riskScore)));
  }

  /**
   * Calculate base compliance score from responses
   */
  private calculateComplianceScore(responses: SupplierRequirementResponse[], requirements: any[]): number {
    if (requirements.length === 0) return 0;
    
    let totalScore = 0;
    let totalWeight = 0;
    
    requirements.forEach(req => {
      const response = responses.find(r => r.requirement_id === req.id);
      const weight = req.weight || 1.0;
      
      let score = 0;
      if (response && !response.is_draft) {
        switch (response.fulfillment_level) {
          case 'fulfilled':
            score = 100;
            break;
          case 'partially_fulfilled':
            score = 60;
            break;
          case 'in_progress':
            score = 40;
            break;
          case 'not_fulfilled':
            score = 0;
            break;
          case 'not_applicable':
            // Don't count N/A requirements
            return;
        }
        
        // Adjust based on confidence level
        if (response.confidence_level) {
          const confidenceMultiplier = response.confidence_level / 5.0;
          score *= confidenceMultiplier;
        }
      }
      
      totalScore += score * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Apply risk weightings based on standards and categories
   */
  private applyRiskWeightings(baseScore: number, responses: SupplierRequirementResponse[], campaign: SupplierAssessmentCampaign): number {
    // Get standards in this campaign
    const campaignStandards = campaign.standards?.map(s => s.standard_id) || [];
    
    let weightedScore = baseScore;
    let totalWeightAdjustment = 0;
    let appliedWeights = 0;
    
    campaignStandards.forEach(standardId => {
      const weights = this.getStandardWeights(standardId);
      
      weights.forEach(weight => {
        // Find responses for this category
        const categoryResponses = responses.filter(r => 
          this.getRequirementCategory(r.requirement_id) === weight.category
        );
        
        if (categoryResponses.length > 0) {
          const categoryScore = this.calculateCategoryScore(categoryResponses);
          const adjustment = (categoryScore - baseScore) * weight.weight * (weight.criticality / 5.0);
          
          totalWeightAdjustment += adjustment;
          appliedWeights++;
        }
      });
    });
    
    if (appliedWeights > 0) {
      weightedScore += totalWeightAdjustment / appliedWeights;
    }
    
    return Math.max(0, Math.min(100, weightedScore));
  }

  /**
   * Calculate quality adjustment based on response completeness and detail
   */
  private calculateQualityAdjustment(responses: SupplierRequirementResponse[]): number {
    if (responses.length === 0) return 10; // Penalty for no responses
    
    let qualityScore = 0;
    let totalResponses = 0;
    
    responses.forEach(response => {
      if (response.is_draft) return; // Skip draft responses
      
      let responseQuality = 0;
      
      // Response text quality (0-5 points)
      if (response.response_text) {
        const wordCount = response.response_text.split(' ').length;
        if (wordCount >= 50) responseQuality += 5;
        else if (wordCount >= 20) responseQuality += 3;
        else if (wordCount >= 10) responseQuality += 1;
      }
      
      // Evidence description (0-3 points)
      if (response.evidence_description && response.evidence_description.length > 20) {
        responseQuality += 3;
      }
      
      // Confidence level bonus (0-2 points)
      if (response.confidence_level && response.confidence_level >= 4) {
        responseQuality += 2;
      } else if (response.confidence_level && response.confidence_level >= 3) {
        responseQuality += 1;
      }
      
      qualityScore += responseQuality;
      totalResponses++;
    });
    
    const averageQuality = totalResponses > 0 ? qualityScore / totalResponses : 0;
    const maxQuality = 10; // 5 + 3 + 2
    
    // Convert to risk adjustment (lower quality = higher risk)
    const qualityPercentage = averageQuality / maxQuality;
    return (1 - qualityPercentage) * 15; // Up to 15 point penalty
  }

  /**
   * Calculate time penalty for overdue assessments
   */
  private calculateTimePenalty(campaign: SupplierAssessmentCampaign): number {
    if (!campaign.due_date) return 0;
    
    const dueDate = new Date(campaign.due_date);
    const now = new Date();
    
    if (now <= dueDate) return 0;
    
    const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Escalating penalty: 1 point per day for first week, 2 points per day after
    let penalty = 0;
    if (daysOverdue <= 7) {
      penalty = daysOverdue;
    } else {
      penalty = 7 + (daysOverdue - 7) * 2;
    }
    
    return Math.min(penalty, 30); // Cap at 30 points
  }

  /**
   * Generate detailed compliance metrics
   */
  async generateComplianceMetrics(input: RiskCalculationInput): Promise<SupplierComplianceMetrics> {
    const { campaign, responses, requirements, standards } = input;
    
    const totalRequirements = requirements.length;
    const completedRequirements = responses.filter(r => !r.is_draft).length;
    const compliancePercentage = totalRequirements > 0 ? Math.round((completedRequirements / totalRequirements) * 100) : 0;
    
    // Fulfillment breakdown
    const fulfillmentBreakdown = {
      fulfilled: responses.filter(r => r.fulfillment_level === 'fulfilled' && !r.is_draft).length,
      partially_fulfilled: responses.filter(r => r.fulfillment_level === 'partially_fulfilled' && !r.is_draft).length,
      not_fulfilled: responses.filter(r => r.fulfillment_level === 'not_fulfilled' && !r.is_draft).length,
      not_applicable: responses.filter(r => r.fulfillment_level === 'not_applicable' && !r.is_draft).length,
      in_progress: responses.filter(r => r.fulfillment_level === 'in_progress' && !r.is_draft).length,
    };
    
    // Standards compliance breakdown
    const standardsCompliance = standards.map(standard => {
      const standardRequirements = requirements.filter(r => r.standard_id === standard.id);
      const standardResponses = responses.filter(r => 
        standardRequirements.some(req => req.id === r.requirement_id) && !r.is_draft
      );
      
      return {
        standard_id: standard.id,
        standard_name: standard.name,
        total_requirements: standardRequirements.length,
        completed_requirements: standardResponses.length,
        compliance_percentage: standardRequirements.length > 0 
          ? Math.round((standardResponses.length / standardRequirements.length) * 100) 
          : 0
      };
    });
    
    // Calculate time to completion
    const startDate = new Date(campaign.created_at);
    const completionDate = campaign.completed_at ? new Date(campaign.completed_at) : new Date();
    const timeToCompletionDays = Math.floor((completionDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Find last activity
    const lastActivity = responses.length > 0 
      ? responses.reduce((latest, response) => 
          new Date(response.updated_at) > new Date(latest.updated_at) ? response : latest
        ).updated_at
      : campaign.updated_at;
    
    return {
      campaign_id: campaign.id,
      total_requirements: totalRequirements,
      completed_requirements: completedRequirements,
      compliance_percentage: compliancePercentage,
      fulfillment_breakdown: fulfillmentBreakdown,
      standards_compliance: standardsCompliance,
      time_to_completion_days: campaign.status === 'completed' ? timeToCompletionDays : undefined,
      last_activity: lastActivity
    };
  }

  /**
   * Perform gap analysis to identify compliance gaps
   */
  async performGapAnalysis(input: RiskCalculationInput): Promise<ComplianceGapAnalysis> {
    const { responses, requirements, standards } = input;
    
    const gaps: ComplianceGapAnalysis['gap_details'] = [];
    let criticalGaps = 0;
    let highRiskGaps = 0;
    let mediumRiskGaps = 0;
    let lowRiskGaps = 0;
    
    requirements.forEach(req => {
      const response = responses.find(r => r.requirement_id === req.id);
      const standard = standards.find(s => s.id === req.standard_id);
      
      // Determine if this is a gap
      const isGap = !response || 
        response.is_draft || 
        response.fulfillment_level === 'not_fulfilled' || 
        response.fulfillment_level === 'partially_fulfilled';
      
      if (isGap) {
        const currentLevel = response?.fulfillment_level || 'not_fulfilled';
        const riskImpact = this.calculateRequirementRiskImpact(req, currentLevel);
        const remediationEffort = this.estimateRemediationEffort(req, currentLevel);
        
        gaps.push({
          requirement_id: req.id,
          requirement_name: req.name,
          standard_name: standard?.name || 'Unknown',
          current_level: currentLevel,
          expected_level: 'fulfilled',
          risk_impact: riskImpact,
          remediation_effort: remediationEffort
        });
        
        // Categorize by risk level
        if (riskImpact >= 4) criticalGaps++;
        else if (riskImpact >= 3) highRiskGaps++;
        else if (riskImpact >= 2) mediumRiskGaps++;
        else lowRiskGaps++;
      }
    });
    
    return {
      total_gaps: gaps.length,
      critical_gaps: criticalGaps,
      high_risk_gaps: highRiskGaps,
      medium_risk_gaps: mediumRiskGaps,
      low_risk_gaps: lowRiskGaps,
      gap_details: gaps
    };
  }

  /**
   * Generate risk factors for detailed analysis
   */
  async generateRiskFactors(input: RiskCalculationInput): Promise<SupplierRiskFactor[]> {
    const { campaign, responses, requirements } = input;
    const factors: SupplierRiskFactor[] = [];
    
    // Response completeness factor
    const completionRate = requirements.length > 0 
      ? responses.filter(r => !r.is_draft).length / requirements.length 
      : 0;
    
    factors.push({
      id: '',
      campaign_id: campaign.id,
      factor_type: 'completion',
      factor_name: 'Assessment Completion Rate',
      weight: 1.0,
      current_value: Math.round(completionRate * 100),
      max_value: 100,
      risk_impact: completionRate < 0.5 ? 4 : completionRate < 0.8 ? 2 : 1,
      description: `${Math.round(completionRate * 100)}% of requirements have been completed`,
      calculated_at: new Date().toISOString()
    });
    
    // Response quality factor
    const avgConfidence = responses.length > 0
      ? responses.reduce((sum, r) => sum + (r.confidence_level || 3), 0) / responses.length
      : 3;
    
    factors.push({
      id: '',
      campaign_id: campaign.id,
      factor_type: 'quality',
      factor_name: 'Response Confidence Level',
      weight: 0.8,
      current_value: Math.round(avgConfidence * 20), // Convert to 0-100 scale
      max_value: 100,
      risk_impact: avgConfidence < 2 ? 4 : avgConfidence < 3 ? 3 : avgConfidence < 4 ? 2 : 1,
      description: `Average confidence level: ${avgConfidence.toFixed(1)}/5.0`,
      calculated_at: new Date().toISOString()
    });
    
    // Critical requirements factor
    const criticalRequirements = requirements.filter(r => r.is_mandatory);
    const criticalCompleted = criticalRequirements.filter(r => {
      const response = responses.find(resp => resp.requirement_id === r.id);
      return response && !response.is_draft && response.fulfillment_level === 'fulfilled';
    }).length;
    
    const criticalCompletionRate = criticalRequirements.length > 0 
      ? criticalCompleted / criticalRequirements.length 
      : 1;
    
    factors.push({
      id: '',
      campaign_id: campaign.id,
      factor_type: 'critical',
      factor_name: 'Critical Requirements Fulfillment',
      weight: 1.5,
      current_value: Math.round(criticalCompletionRate * 100),
      max_value: 100,
      risk_impact: criticalCompletionRate < 0.7 ? 5 : criticalCompletionRate < 0.9 ? 3 : 1,
      description: `${criticalCompleted}/${criticalRequirements.length} critical requirements fulfilled`,
      calculated_at: new Date().toISOString()
    });
    
    // Time factor
    if (campaign.due_date) {
      const dueDate = new Date(campaign.due_date);
      const now = new Date();
      const isOverdue = now > dueDate;
      const daysOverdue = isOverdue 
        ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      factors.push({
        id: '',
        campaign_id: campaign.id,
        factor_type: 'timeliness',
        factor_name: 'Assessment Timeliness',
        weight: 0.6,
        current_value: isOverdue ? Math.max(0, 100 - daysOverdue * 5) : 100,
        max_value: 100,
        risk_impact: daysOverdue > 14 ? 4 : daysOverdue > 7 ? 3 : daysOverdue > 0 ? 2 : 1,
        description: isOverdue 
          ? `Assessment is ${daysOverdue} days overdue`
          : 'Assessment is on time',
        calculated_at: new Date().toISOString()
      });
    }
    
    return factors;
  }

  /**
   * Convert risk score to risk level
   */
  getRiskLevel(riskScore: number): RiskLevel {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    if (riskScore >= 0) return 'low';
    return 'unknown';
  }

  /**
   * Generate supplier risk dashboard data
   */
  async generateRiskDashboard(campaigns: SupplierAssessmentCampaign[]): Promise<SupplierRiskDashboard> {
    const totalSuppliers = new Set(campaigns.map(c => c.supplier_id)).size;
    const activeAssessments = campaigns.filter(c => c.status === 'in_progress' || c.status === 'sent').length;
    const completedAssessments = campaigns.filter(c => c.status === 'completed').length;
    const overdueAssessments = campaigns.filter(c => {
      if (!c.due_date) return false;
      return new Date() > new Date(c.due_date) && c.status !== 'completed';
    }).length;
    
    // Calculate average risk score
    const scoresWithRisk = campaigns.filter(c => c.risk_score !== undefined && c.risk_score > 0);
    const averageRiskScore = scoresWithRisk.length > 0 
      ? Math.round(scoresWithRisk.reduce((sum, c) => sum + c.risk_score, 0) / scoresWithRisk.length)
      : 0;
    
    // Risk distribution
    const riskDistribution = {
      low: campaigns.filter(c => c.risk_level === 'low').length,
      medium: campaigns.filter(c => c.risk_level === 'medium').length,
      high: campaigns.filter(c => c.risk_level === 'high').length,
      critical: campaigns.filter(c => c.risk_level === 'critical').length,
    };
    
    // Top risk suppliers
    const topRiskSuppliers = campaigns
      .filter(c => c.risk_score > 0 && c.supplier)
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 10)
      .map(c => ({
        supplier: c.supplier!,
        risk_score: c.risk_score,
        risk_level: c.risk_level,
        last_assessment: c.updated_at
      }));
    
    return {
      total_suppliers: totalSuppliers,
      active_assessments: activeAssessments,
      completed_assessments: completedAssessments,
      overdue_assessments: overdueAssessments,
      average_risk_score: averageRiskScore,
      risk_distribution: riskDistribution,
      recent_activities: [], // Would be populated from activities table
      top_risk_suppliers: topRiskSuppliers
    };
  }

  // Helper methods
  private getStandardWeights(standardId: string): RiskWeighting[] {
    const upperStandardId = standardId.toUpperCase();
    return this.STANDARD_WEIGHTS[upperStandardId] || [];
  }

  private getRequirementCategory(requirementId: string): string {
    // This would typically be looked up from the requirements table
    // For now, return a default category
    return 'general';
  }

  private calculateCategoryScore(responses: SupplierRequirementResponse[]): number {
    if (responses.length === 0) return 0;
    
    let totalScore = 0;
    responses.forEach(response => {
      switch (response.fulfillment_level) {
        case 'fulfilled': totalScore += 100; break;
        case 'partially_fulfilled': totalScore += 60; break;
        case 'in_progress': totalScore += 40; break;
        case 'not_fulfilled': totalScore += 0; break;
        case 'not_applicable': break; // Skip
      }
    });
    
    return totalScore / responses.length;
  }

  private calculateRequirementRiskImpact(requirement: any, currentLevel: FulfillmentLevel): number {
    // Risk impact calculation based on requirement criticality and current fulfillment
    let baseImpact = requirement.weight || 1;
    
    // Adjust based on current fulfillment level
    const levelMultiplier = {
      'fulfilled': 0,
      'partially_fulfilled': 0.5,
      'in_progress': 0.7,
      'not_fulfilled': 1.0,
      'not_applicable': 0
    };
    
    return Math.round(baseImpact * (levelMultiplier[currentLevel] || 1) * 5);
  }

  private estimateRemediationEffort(requirement: any, currentLevel: FulfillmentLevel): 'low' | 'medium' | 'high' {
    // Estimate effort based on requirement complexity and current state
    const complexity = requirement.weight || 1;
    
    if (currentLevel === 'fulfilled' || currentLevel === 'not_applicable') return 'low';
    if (currentLevel === 'partially_fulfilled') return complexity > 2 ? 'medium' : 'low';
    if (currentLevel === 'in_progress') return complexity > 2 ? 'high' : 'medium';
    
    // not_fulfilled
    return complexity > 3 ? 'high' : complexity > 1.5 ? 'medium' : 'low';
  }
}

export const supplierRiskEngine = new SupplierRiskEngine();

// Mock demo service that integrates with existing mock data
export class MockSupplierRiskEngine extends SupplierRiskEngine {
  async generateComplianceMetrics(input: RiskCalculationInput): Promise<SupplierComplianceMetrics> {
    // Use more dynamic mock data based on actual input when possible
    const { campaign, responses, requirements, standards } = input;
    
    // Use real data if available, otherwise use mock data
    if (responses.length > 0 && requirements.length > 0) {
      // Use the parent class implementation with real data
      return super.generateComplianceMetrics(input);
    }
    
    // Enhanced mock data for demo purposes with variations based on campaign
    let mockMetrics: SupplierComplianceMetrics;
    
    // Adjust mock data based on campaign characteristics
    if (campaign.risk_level === 'critical') {
      mockMetrics = {
        campaign_id: campaign.id,
        total_requirements: 18,
        completed_requirements: 12,
        compliance_percentage: 67,
        fulfillment_breakdown: {
          fulfilled: 5,
          partially_fulfilled: 4,
          not_fulfilled: 3,
          not_applicable: 2,
          in_progress: 4
        },
        standards_compliance: [
          {
            standard_id: 'iso-27001',
            standard_name: 'ISO/IEC 27001:2022',
            total_requirements: 10,
            completed_requirements: 6,
            compliance_percentage: 60
          },
          {
            standard_id: 'soc-2',
            standard_name: 'SOC 2 Type II',
            total_requirements: 6,
            completed_requirements: 4,
            compliance_percentage: 67
          },
          {
            standard_id: 'nis2',
            standard_name: 'NIS2 Directive',
            total_requirements: 2,
            completed_requirements: 2,
            compliance_percentage: 100
          }
        ],
        last_activity: new Date().toISOString()
      };
    } else if (campaign.status === 'completed') {
      mockMetrics = {
        campaign_id: campaign.id,
        total_requirements: 15,
        completed_requirements: 15,
        compliance_percentage: 93,
        fulfillment_breakdown: {
          fulfilled: 12,
          partially_fulfilled: 2,
          not_fulfilled: 0,
          not_applicable: 1,
          in_progress: 0
        },
        standards_compliance: [
          {
            standard_id: 'iso-27001',
            standard_name: 'ISO/IEC 27001:2022',
            total_requirements: 8,
            completed_requirements: 8,
            compliance_percentage: 100
          },
          {
            standard_id: 'soc-2',
            standard_name: 'SOC 2 Type II',
            total_requirements: 5,
            completed_requirements: 5,
            compliance_percentage: 100
          },
          {
            standard_id: 'nis2',
            standard_name: 'NIS2 Directive',
            total_requirements: 2,
            completed_requirements: 2,
            compliance_percentage: 100
          }
        ],
        time_to_completion_days: 45,
        last_activity: campaign.completed_at || new Date().toISOString()
      };
    } else {
      // Default mock data for other scenarios
      mockMetrics = {
        campaign_id: campaign.id,
        total_requirements: 15,
        completed_requirements: 12,
        compliance_percentage: 80,
        fulfillment_breakdown: {
          fulfilled: 8,
          partially_fulfilled: 3,
          not_fulfilled: 1,
          not_applicable: 2,
          in_progress: 1
        },
        standards_compliance: [
          {
            standard_id: 'iso-27001',
            standard_name: 'ISO/IEC 27001:2022',
            total_requirements: 8,
            completed_requirements: 7,
            compliance_percentage: 88
          },
          {
            standard_id: 'soc-2',
            standard_name: 'SOC 2 Type II',
            total_requirements: 5,
            completed_requirements: 4,
            compliance_percentage: 80
          },
          {
            standard_id: 'nis2',
            standard_name: 'NIS2 Directive',
            total_requirements: 2,
            completed_requirements: 1,
            compliance_percentage: 50
          }
        ],
        last_activity: new Date().toISOString()
      };
    }
    
    return mockMetrics;
  }

  async performGapAnalysis(input: RiskCalculationInput): Promise<ComplianceGapAnalysis> {
    const { campaign, responses, requirements } = input;
    
    // Use real data if available, otherwise use mock data
    if (responses.length > 0 && requirements.length > 0) {
      // Use the parent class implementation with real data
      return super.performGapAnalysis(input);
    }
    
    // Enhanced mock data with variations based on campaign characteristics
    let mockGapAnalysis: ComplianceGapAnalysis;
    
    if (campaign.risk_level === 'critical') {
      mockGapAnalysis = {
        total_gaps: 9,
        critical_gaps: 3,
        high_risk_gaps: 3,
        medium_risk_gaps: 2,
        low_risk_gaps: 1,
        gap_details: [
          {
            requirement_id: 'iso-27001-A.16.1.1',
            requirement_name: 'Incident Response Procedures',
            standard_name: 'ISO/IEC 27001:2022',
            current_level: 'not_fulfilled',
            expected_level: 'fulfilled',
            risk_impact: 5,
            remediation_effort: 'high'
          },
          {
            requirement_id: 'iso-27001-A.8.1.1',
            requirement_name: 'Data Classification Policy',
            standard_name: 'ISO/IEC 27001:2022',
            current_level: 'not_fulfilled',
            expected_level: 'fulfilled',
            risk_impact: 5,
            remediation_effort: 'medium'
          },
          {
            requirement_id: 'iso-27001-A.9.1.1',
            requirement_name: 'Access Control Policy',
            standard_name: 'ISO/IEC 27001:2022',
            current_level: 'partially_fulfilled',
            expected_level: 'fulfilled',
            risk_impact: 4,
            remediation_effort: 'high'
          },
          {
            requirement_id: 'soc-2-CC6.1',
            requirement_name: 'Logical Access Controls',
            standard_name: 'SOC 2 Type II',
            current_level: 'in_progress',
            expected_level: 'fulfilled',
            risk_impact: 4,
            remediation_effort: 'medium'
          }
        ]
      };
    } else if (campaign.status === 'completed') {
      mockGapAnalysis = {
        total_gaps: 3,
        critical_gaps: 0,
        high_risk_gaps: 0,
        medium_risk_gaps: 2,
        low_risk_gaps: 1,
        gap_details: [
          {
            requirement_id: 'iso-27001-A.8.1.2',
            requirement_name: 'Information Labeling',
            standard_name: 'ISO/IEC 27001:2022',
            current_level: 'partially_fulfilled',
            expected_level: 'fulfilled',
            risk_impact: 2,
            remediation_effort: 'low'
          },
          {
            requirement_id: 'soc-2-CC6.3',
            requirement_name: 'User Access Reviews',
            standard_name: 'SOC 2 Type II',
            current_level: 'partially_fulfilled',
            expected_level: 'fulfilled',
            risk_impact: 2,
            remediation_effort: 'medium'
          }
        ]
      };
    } else {
      // Default mock data for other scenarios
      mockGapAnalysis = {
        total_gaps: 6,
        critical_gaps: 1,
        high_risk_gaps: 2,
        medium_risk_gaps: 2,
        low_risk_gaps: 1,
        gap_details: [
          {
            requirement_id: 'iso-27001-A.8.1.1',
            requirement_name: 'Data Classification Policy',
            standard_name: 'ISO/IEC 27001:2022',
            current_level: 'not_fulfilled',
            expected_level: 'fulfilled',
            risk_impact: 5,
            remediation_effort: 'low'
          },
          {
            requirement_id: 'iso-27001-A.9.1.1',
            requirement_name: 'Access Control Policy',
            standard_name: 'ISO/IEC 27001:2022',
            current_level: 'partially_fulfilled',
            expected_level: 'fulfilled',
            risk_impact: 4,
            remediation_effort: 'medium'
          },
          {
            requirement_id: 'soc-2-CC6.1',
            requirement_name: 'Logical Access Controls',
            standard_name: 'SOC 2 Type II',
            current_level: 'in_progress',
            expected_level: 'fulfilled',
            risk_impact: 3,
            remediation_effort: 'high'
          }
        ]
      };
    }
    
    return mockGapAnalysis;
  }
  
  async generateRiskDashboard(campaigns: SupplierAssessmentCampaign[]): Promise<SupplierRiskDashboard> {
    // If we have real campaigns data, use the parent implementation
    if (campaigns.length > 0) {
      return super.generateRiskDashboard(campaigns);
    }
    
    // Enhanced mock dashboard for demo
    return {
      total_suppliers: 8,
      active_assessments: 3,
      completed_assessments: 5,
      overdue_assessments: 1,
      average_risk_score: 68,
      risk_distribution: {
        low: 2,
        medium: 4,
        high: 1,
        critical: 1
      },
      recent_activities: [],
      top_risk_suppliers: [
        {
          supplier: {
            id: 'supplier-1',
            name: 'CloudSecure Solutions',
            organizationNumber: 'ORG-556789123',
            address: '1234 Enterprise Blvd, Seattle, WA 98101',
            website: 'https://cloudsecure.example.com',
            category: 'Cloud Security',
            status: 'active',
            contact: {
              name: 'Jennifer Adams',
              email: 'jennifer.adams@cloudsecure.example.com',
              phone: '+1-206-555-0198',
              title: 'Compliance Director'
            },
            internalResponsible: {
              id: 'internal-user-1',
              name: 'Sarah Mitchell',
              email: 'sarah.mitchell@democorp.com',
              department: 'Information Security'
            },
            associatedStandards: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          risk_score: 92,
          risk_level: 'critical',
          last_assessment: '2024-03-01T10:00:00Z'
        }
      ]
    };
  }
}

export const mockSupplierRiskEngine = new MockSupplierRiskEngine();