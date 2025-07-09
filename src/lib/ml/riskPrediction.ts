import { supabase } from '@/lib/supabase';
import { reportError } from '@/lib/monitoring/sentry';
import { analytics } from '@/lib/monitoring/analytics';
import { alertingService } from '@/lib/monitoring/alerting';
import { cacheService } from '@/lib/cache/cacheService';

export interface RiskAnalysis {
  overallScore: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  categories: RiskCategory[];
  recommendations: RiskRecommendation[];
  predictions: RiskPrediction[];
}

export interface RiskCategory {
  name: string;
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: string[];
}

export interface RiskRecommendation {
  id: string;
  title: string;
  description: string;
  impact: string;
  effort: string;
  category: string;
  potentialRiskReduction: number;
}

export interface RiskPrediction {
  timeframe: string;
  predictedScore: number;
  predictedLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  factors: string[];
}

interface RiskFactor {
  name: string;
  weight: number;
  value: number;
  category: string;
}

class RiskPredictionService {
  private readonly CACHE_TTL = 600; // 10 minutes
  private readonly RISK_THRESHOLDS = {
    CRITICAL: 80,
    HIGH: 60,
    MEDIUM: 40,
    LOW: 0
  };

  async analyzeRisk(organizationId: string): Promise<RiskAnalysis> {
    const cacheKey = `risk:analysis:${organizationId}`;
    const cached = await cacheService.get<RiskAnalysis>(cacheKey);
    if (cached) return cached;

    try {
      // Collect risk factors
      const factors = await this.collectRiskFactors(organizationId);
      
      // Calculate risk scores by category
      const categories = this.calculateCategoryScores(factors);
      
      // Calculate overall risk score
      const overallScore = this.calculateOverallScore(categories);
      const level = this.getRiskLevel(overallScore);
      
      // Generate predictions
      const predictions = await this.generatePredictions(organizationId, factors);
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(organizationId, categories, factors);
      
      const analysis: RiskAnalysis = {
        overallScore,
        level,
        categories,
        recommendations,
        predictions
      };

      await cacheService.set(cacheKey, analysis, this.CACHE_TTL);
      
      // Alert if critical risk
      if (level === 'CRITICAL') {
        alertingService.recordEvent('critical_risk_detected', {
          organization_id: organizationId,
          risk_score: overallScore,
          categories: categories.filter(c => c.level === 'CRITICAL').map(c => c.name)
        });
      }

      analytics.track('risk_analysis_completed', {
        organization_id: organizationId,
        overall_score: overallScore,
        risk_level: level
      });

      return analysis;
    } catch (error) {
      reportError(error instanceof Error ? error : new Error('Risk analysis failed'), {
        organization_id: organizationId
      });
      throw error;
    }
  }

  async calculateRiskScore(organizationId: string): Promise<{ score: number; level: string }> {
    const analysis = await this.analyzeRisk(organizationId);
    return {
      score: analysis.overallScore,
      level: analysis.level
    };
  }

  async predictFutureRisk(organizationId: string, timeframe?: string): Promise<RiskPrediction[]> {
    try {
      const currentAnalysis = await this.analyzeRisk(organizationId);
      const historicalData = await this.getHistoricalRiskData(organizationId);
      
      const timeframes = timeframe ? [timeframe] : ['30_days', '60_days', '90_days'];
      const predictions: RiskPrediction[] = [];

      for (const tf of timeframes) {
        const prediction = await this.predictForTimeframe(
          organizationId,
          tf,
          currentAnalysis,
          historicalData
        );
        predictions.push(prediction);
      }

      return predictions;
    } catch (error) {
      reportError(error instanceof Error ? error : new Error('Risk prediction failed'), {
        organization_id: organizationId,
        timeframe
      });
      return [];
    }
  }

  async createMitigationPlan(input: {
    organizationId: string;
    title: string;
    description: string;
    category: string;
    estimatedImpact: number;
  }): Promise<RiskRecommendation> {
    try {
      const mitigation: RiskRecommendation = {
        id: `mitigation_${Date.now()}`,
        title: input.title,
        description: input.description,
        impact: this.calculateImpactLevel(input.estimatedImpact),
        effort: 'medium', // Would be calculated based on requirements
        category: input.category,
        potentialRiskReduction: input.estimatedImpact
      };

      analytics.track('risk_mitigation_created', {
        organization_id: input.organizationId,
        category: input.category,
        estimated_impact: input.estimatedImpact
      });

      return mitigation;
    } catch (error) {
      reportError(error instanceof Error ? error : new Error('Failed to create mitigation plan'), {
        input
      });
      throw error;
    }
  }

  private async collectRiskFactors(organizationId: string): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = [];

    // Compliance factors
    const complianceFactors = await this.getComplianceRiskFactors(organizationId);
    factors.push(...complianceFactors);

    // Security factors
    const securityFactors = await this.getSecurityRiskFactors(organizationId);
    factors.push(...securityFactors);

    // Operational factors
    const operationalFactors = await this.getOperationalRiskFactors(organizationId);
    factors.push(...operationalFactors);

    // External factors
    const externalFactors = await this.getExternalRiskFactors(organizationId);
    factors.push(...externalFactors);

    return factors;
  }

  private async getComplianceRiskFactors(organizationId: string): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = [];

    // Get assessment data
    const { data: assessments } = await supabase
      .from('assessments')
      .select(`
        *,
        requirements(status),
        frameworks(criticality)
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    if (assessments) {
      // Overdue assessments
      const overdueCount = assessments.filter(a => 
        a.due_date && new Date(a.due_date) < new Date()
      ).length;
      
      factors.push({
        name: 'Overdue Assessments',
        weight: 0.15,
        value: Math.min(100, overdueCount * 20),
        category: 'compliance'
      });

      // Non-compliant requirements
      const totalRequirements = assessments.reduce((sum, a) => 
        sum + (a.requirements?.length || 0), 0
      );
      const nonCompliantRequirements = assessments.reduce((sum, a) => 
        sum + (a.requirements?.filter(r => r.status === 'NON_COMPLIANT').length || 0), 0
      );
      
      const nonComplianceRate = totalRequirements > 0 
        ? (nonCompliantRequirements / totalRequirements) * 100 
        : 0;

      factors.push({
        name: 'Non-Compliance Rate',
        weight: 0.2,
        value: nonComplianceRate,
        category: 'compliance'
      });

      // Critical framework compliance
      const criticalFrameworks = assessments.filter(a => 
        a.frameworks?.criticality === 'high'
      );
      const criticalComplianceScore = this.calculateAverageComplianceScore(criticalFrameworks);
      
      factors.push({
        name: 'Critical Framework Risk',
        weight: 0.25,
        value: 100 - criticalComplianceScore,
        category: 'compliance'
      });
    }

    return factors;
  }

  private async getSecurityRiskFactors(organizationId: string): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = [];

    // Get security incidents
    const { data: incidents } = await supabase
      .from('security_incidents')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

    const incidentScore = Math.min(100, (incidents?.length || 0) * 10);
    factors.push({
      name: 'Recent Security Incidents',
      weight: 0.15,
      value: incidentScore,
      category: 'security'
    });

    // Vulnerability assessment
    const { data: vulnerabilities } = await supabase
      .from('vulnerability_scans')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (vulnerabilities) {
      const criticalVulns = vulnerabilities.critical_count || 0;
      const highVulns = vulnerabilities.high_count || 0;
      const vulnScore = Math.min(100, criticalVulns * 20 + highVulns * 10);
      
      factors.push({
        name: 'Unpatched Vulnerabilities',
        weight: 0.2,
        value: vulnScore,
        category: 'security'
      });
    }

    // Access control risks
    const { data: users } = await supabase
      .from('organization_users')
      .select('*')
      .eq('organization_id', organizationId);

    const adminRatio = users 
      ? (users.filter(u => u.role === 'admin' || u.role === 'owner').length / users.length) * 100
      : 0;

    factors.push({
      name: 'Excessive Admin Access',
      weight: 0.1,
      value: adminRatio > 20 ? adminRatio : 0,
      category: 'security'
    });

    return factors;
  }

  private async getOperationalRiskFactors(organizationId: string): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = [];

    // Process maturity
    const { data: processes } = await supabase
      .from('organization_processes')
      .select('*')
      .eq('organization_id', organizationId);

    const undocumentedProcesses = processes
      ? processes.filter(p => !p.documented).length / processes.length * 100
      : 50; // Assume 50% if no data

    factors.push({
      name: 'Undocumented Processes',
      weight: 0.1,
      value: undocumentedProcesses,
      category: 'operational'
    });

    // Staff training
    const { data: training } = await supabase
      .from('training_records')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('completed_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

    const { data: userCount } = await supabase
      .from('organization_users')
      .select('id', { count: 'exact' })
      .eq('organization_id', organizationId);

    const trainingCoverage = userCount && userCount.length > 0
      ? ((training?.length || 0) / userCount.length) * 100
      : 0;

    factors.push({
      name: 'Insufficient Training',
      weight: 0.1,
      value: 100 - trainingCoverage,
      category: 'operational'
    });

    // Change management
    const { data: changes } = await supabase
      .from('change_requests')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'failed')
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

    const failedChangeRate = changes ? changes.length * 5 : 0;
    
    factors.push({
      name: 'Failed Changes',
      weight: 0.05,
      value: Math.min(100, failedChangeRate),
      category: 'operational'
    });

    return factors;
  }

  private async getExternalRiskFactors(organizationId: string): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = [];

    // Industry risk score (would come from external threat intelligence)
    const { data: org } = await supabase
      .from('organizations')
      .select('industry')
      .eq('id', organizationId)
      .single();

    const industryRiskScores: Record<string, number> = {
      'finance': 80,
      'healthcare': 85,
      'technology': 70,
      'retail': 60,
      'manufacturing': 50,
      'default': 60
    };

    const industryScore = industryRiskScores[org?.industry || 'default'] || 60;
    
    factors.push({
      name: 'Industry Risk',
      weight: 0.1,
      value: industryScore,
      category: 'external'
    });

    // Regulatory changes (simplified - would track actual regulatory updates)
    const regulatoryPressure = 40; // Base regulatory pressure
    
    factors.push({
      name: 'Regulatory Pressure',
      weight: 0.05,
      value: regulatoryPressure,
      category: 'external'
    });

    return factors;
  }

  private calculateCategoryScores(factors: RiskFactor[]): RiskCategory[] {
    const categoryMap = new Map<string, RiskFactor[]>();
    
    // Group factors by category
    factors.forEach(factor => {
      const categoryFactors = categoryMap.get(factor.category) || [];
      categoryFactors.push(factor);
      categoryMap.set(factor.category, categoryFactors);
    });

    // Calculate score for each category
    const categories: RiskCategory[] = [];
    
    categoryMap.forEach((categoryFactors, categoryName) => {
      const totalWeight = categoryFactors.reduce((sum, f) => sum + f.weight, 0);
      const weightedSum = categoryFactors.reduce((sum, f) => sum + (f.value * f.weight), 0);
      const score = totalWeight > 0 ? weightedSum / totalWeight : 0;
      
      categories.push({
        name: this.formatCategoryName(categoryName),
        score: Math.round(score),
        level: this.getRiskLevel(score),
        factors: categoryFactors.map(f => f.name)
      });
    });

    return categories.sort((a, b) => b.score - a.score);
  }

  private calculateOverallScore(categories: RiskCategory[]): number {
    if (categories.length === 0) return 0;
    
    // Weighted average with higher weight for higher risk categories
    let totalWeight = 0;
    let weightedSum = 0;
    
    categories.forEach((category, index) => {
      const weight = 1 + (categories.length - index) * 0.1; // Higher weight for higher risk
      totalWeight += weight;
      weightedSum += category.score * weight;
    });
    
    return Math.round(weightedSum / totalWeight);
  }

  private getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score >= this.RISK_THRESHOLDS.CRITICAL) return 'CRITICAL';
    if (score >= this.RISK_THRESHOLDS.HIGH) return 'HIGH';
    if (score >= this.RISK_THRESHOLDS.MEDIUM) return 'MEDIUM';
    return 'LOW';
  }

  private async generateRecommendations(
    organizationId: string,
    categories: RiskCategory[],
    factors: RiskFactor[]
  ): Promise<RiskRecommendation[]> {
    const recommendations: RiskRecommendation[] = [];
    
    // Generate recommendations for high-risk categories
    for (const category of categories) {
      if (category.level === 'HIGH' || category.level === 'CRITICAL') {
        const categoryFactors = factors.filter(f => 
          this.formatCategoryName(f.category) === category.name
        );
        
        const topFactors = categoryFactors
          .sort((a, b) => b.value - a.value)
          .slice(0, 3);
        
        for (const factor of topFactors) {
          const recommendation = this.generateFactorRecommendation(factor, category);
          if (recommendation) {
            recommendations.push(recommendation);
          }
        }
      }
    }

    // Sort by potential risk reduction
    recommendations.sort((a, b) => b.potentialRiskReduction - a.potentialRiskReduction);
    
    return recommendations.slice(0, 10); // Top 10 recommendations
  }

  private generateFactorRecommendation(
    factor: RiskFactor,
    category: RiskCategory
  ): RiskRecommendation | null {
    const recommendationMap: Record<string, {
      title: string;
      description: string;
      effort: string;
      reduction: number;
    }> = {
      'Overdue Assessments': {
        title: 'Complete Overdue Assessments',
        description: 'Prioritize completion of overdue compliance assessments to reduce regulatory risk.',
        effort: 'medium',
        reduction: factor.value * 0.8
      },
      'Non-Compliance Rate': {
        title: 'Remediate Non-Compliant Requirements',
        description: 'Focus on addressing non-compliant requirements, starting with critical frameworks.',
        effort: 'high',
        reduction: factor.value * 0.7
      },
      'Recent Security Incidents': {
        title: 'Strengthen Security Incident Response',
        description: 'Implement enhanced security monitoring and incident response procedures.',
        effort: 'high',
        reduction: factor.value * 0.6
      },
      'Unpatched Vulnerabilities': {
        title: 'Accelerate Vulnerability Patching',
        description: 'Establish a rapid patching program for critical and high vulnerabilities.',
        effort: 'medium',
        reduction: factor.value * 0.9
      },
      'Undocumented Processes': {
        title: 'Document Critical Processes',
        description: 'Create comprehensive documentation for all critical business processes.',
        effort: 'medium',
        reduction: factor.value * 0.5
      },
      'Insufficient Training': {
        title: 'Implement Compliance Training Program',
        description: 'Develop and deploy mandatory compliance and security training for all staff.',
        effort: 'medium',
        reduction: factor.value * 0.6
      }
    };

    const template = recommendationMap[factor.name];
    if (!template) return null;

    return {
      id: `rec_${factor.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
      title: template.title,
      description: template.description,
      impact: factor.value > 70 ? 'Critical' : factor.value > 50 ? 'High' : 'Medium',
      effort: template.effort,
      category: category.name,
      potentialRiskReduction: Math.round(template.reduction)
    };
  }

  private async predictForTimeframe(
    organizationId: string,
    timeframe: string,
    currentAnalysis: RiskAnalysis,
    historicalData: any[]
  ): Promise<RiskPrediction> {
    const days = this.parseTimeframeDays(timeframe);
    
    // Calculate trend from historical data
    const trend = this.calculateRiskTrend(historicalData);
    
    // Apply trend to current score
    const predictedScore = Math.max(0, Math.min(100, 
      currentAnalysis.overallScore + (trend * days)
    ));
    
    // Identify contributing factors
    const factors = this.identifyTrendFactors(currentAnalysis, trend);
    
    // Calculate confidence based on data quality and timeframe
    const confidence = Math.max(0.5, 1 - (days / 180));
    
    return {
      timeframe,
      predictedScore: Math.round(predictedScore),
      predictedLevel: this.getRiskLevel(predictedScore),
      confidence,
      factors
    };
  }

  private async getHistoricalRiskData(organizationId: string): Promise<any[]> {
    const { data } = await supabase
      .from('risk_snapshots')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(90);
    
    return data || [];
  }

  private calculateRiskTrend(historicalData: any[]): number {
    if (historicalData.length < 2) return 0;
    
    // Simple linear regression
    const n = historicalData.length;
    const x = historicalData.map((_, i) => i);
    const y = historicalData.map(d => d.overall_score);
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    return slope; // Risk change per day
  }

  private identifyTrendFactors(analysis: RiskAnalysis, trend: number): string[] {
    const factors: string[] = [];
    
    if (trend > 0) {
      // Increasing risk
      analysis.categories
        .filter(c => c.level === 'HIGH' || c.level === 'CRITICAL')
        .forEach(c => factors.push(`Increasing ${c.name} risk`));
    } else {
      // Decreasing risk
      factors.push('Ongoing risk mitigation efforts');
      factors.push('Improved compliance posture');
    }
    
    return factors;
  }

  private parseTimeframeDays(timeframe: string): number {
    const match = timeframe.match(/(\d+)_days?/);
    return match ? parseInt(match[1]) : 30;
  }

  private calculateAverageComplianceScore(assessments: any[]): number {
    if (assessments.length === 0) return 100;
    
    const totalScore = assessments.reduce((sum, assessment) => {
      const requirements = assessment.requirements || [];
      const compliant = requirements.filter(r => r.status === 'COMPLIANT').length;
      const score = requirements.length > 0 ? (compliant / requirements.length) * 100 : 100;
      return sum + score;
    }, 0);
    
    return totalScore / assessments.length;
  }

  private formatCategoryName(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  private calculateImpactLevel(impact: number): string {
    if (impact >= 20) return 'Critical';
    if (impact >= 15) return 'High';
    if (impact >= 10) return 'Medium';
    return 'Low';
  }
}

// Create singleton instance
export const riskPredictionService = new RiskPredictionService();

export default riskPredictionService;