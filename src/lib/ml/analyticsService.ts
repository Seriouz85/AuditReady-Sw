import { supabase } from '@/lib/supabase';
import { reportError } from '@/lib/monitoring/sentry';
import { analytics } from '@/lib/monitoring/analytics';
import { cacheService } from '@/lib/cache/cacheService';

export interface MLInsight {
  id: string;
  type: 'compliance_trend' | 'risk_prediction' | 'anomaly' | 'recommendation' | 'pattern';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  suggestedActions: string[];
  relatedData: Record<string, any>;
  createdAt: Date;
}

export interface ComplianceOverview {
  overallScore: number;
  frameworks: FrameworkStatus[];
  trendsData: ComplianceTrend[];
  upcomingDeadlines: Deadline[];
}

export interface FrameworkStatus {
  framework: string;
  score: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT';
  requirementsCompleted: number;
  totalRequirements: number;
}

export interface ComplianceTrend {
  date: Date;
  score: number;
  framework?: string;
}

export interface Deadline {
  id: string;
  title: string;
  dueDate: Date;
  framework: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

class MLAnalyticsService {
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly MIN_DATA_POINTS = 10;
  private readonly CONFIDENCE_THRESHOLD = 0.7;

  async calculateComplianceScore(organizationId: string): Promise<number> {
    const cacheKey = `ml:compliance_score:${organizationId}`;
    const cached = await cacheService.get<number>(cacheKey);
    if (cached !== null) return cached;

    try {
      // Fetch all assessments for the organization
      const { data: assessments, error } = await supabase
        .from('assessments')
        .select(`
          *,
          requirements(
            id,
            status,
            priority
          )
        `)
        .eq('organization_id', organizationId)
        .eq('status', 'active');

      if (error) throw error;

      if (!assessments || assessments.length === 0) {
        return 0;
      }

      // Calculate weighted compliance score
      let totalScore = 0;
      let totalWeight = 0;

      for (const assessment of assessments) {
        const requirements = assessment.requirements || [];
        if (requirements.length === 0) continue;

        const completed = requirements.filter(r => 
          r.status === 'COMPLIANT' || r.status === 'IMPLEMENTED'
        ).length;

        const weight = this.getFrameworkWeight(assessment.framework_id);
        const score = (completed / requirements.length) * 100;
        
        totalScore += score * weight;
        totalWeight += weight;
      }

      const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
      
      await cacheService.set(cacheKey, finalScore, this.CACHE_TTL);
      
      analytics.track('ml_compliance_score_calculated', {
        organization_id: organizationId,
        score: finalScore,
        assessment_count: assessments.length
      });

      return Math.round(finalScore * 100) / 100;
    } catch (error) {
      reportError(error instanceof Error ? error : new Error('Failed to calculate compliance score'), {
        organization_id: organizationId
      });
      return 0;
    }
  }

  async getComplianceOverview(organizationId: string): Promise<ComplianceOverview> {
    const cacheKey = `ml:compliance_overview:${organizationId}`;
    const cached = await cacheService.get<ComplianceOverview>(cacheKey);
    if (cached) return cached;

    try {
      // Get current compliance data
      const [overallScore, frameworks, trends, deadlines] = await Promise.all([
        this.calculateComplianceScore(organizationId),
        this.getFrameworkStatuses(organizationId),
        this.getComplianceTrends(organizationId),
        this.getUpcomingDeadlines(organizationId)
      ]);

      const overview: ComplianceOverview = {
        overallScore,
        frameworks,
        trendsData: trends,
        upcomingDeadlines: deadlines
      };

      await cacheService.set(cacheKey, overview, this.CACHE_TTL);
      
      return overview;
    } catch (error) {
      reportError(error instanceof Error ? error : new Error('Failed to get compliance overview'), {
        organization_id: organizationId
      });
      throw error;
    }
  }

  async getInsights(organizationId: string, type?: string, limit = 10): Promise<MLInsight[]> {
    try {
      const insights: MLInsight[] = [];

      // Get compliance trends insights
      if (!type || type === 'compliance_trend') {
        const trendInsights = await this.generateComplianceTrendInsights(organizationId);
        insights.push(...trendInsights);
      }

      // Get risk prediction insights
      if (!type || type === 'risk_prediction') {
        const riskInsights = await this.generateRiskPredictionInsights(organizationId);
        insights.push(...riskInsights);
      }

      // Get pattern recognition insights
      if (!type || type === 'pattern') {
        const patternInsights = await this.generatePatternInsights(organizationId);
        insights.push(...patternInsights);
      }

      // Get recommendation insights
      if (!type || type === 'recommendation') {
        const recommendationInsights = await this.generateRecommendationInsights(organizationId);
        insights.push(...recommendationInsights);
      }

      // Sort by confidence and impact
      insights.sort((a, b) => {
        const impactWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        const aScore = a.confidence * impactWeight[a.impact];
        const bScore = b.confidence * impactWeight[b.impact];
        return bScore - aScore;
      });

      return insights.slice(0, limit);
    } catch (error) {
      reportError(error instanceof Error ? error : new Error('Failed to get ML insights'), {
        organization_id: organizationId,
        type
      });
      return [];
    }
  }

  async generateComplianceReport(organizationId: string, framework: string, format: string): Promise<string> {
    try {
      // Generate comprehensive compliance report
      const [overview, insights, predictions] = await Promise.all([
        this.getComplianceOverview(organizationId),
        this.getInsights(organizationId, undefined, 50),
        this.predictComplianceTrajectory(organizationId, framework)
      ]);

      // Create report data
      const reportData = {
        generated_at: new Date().toISOString(),
        organization_id: organizationId,
        framework,
        overview,
        insights,
        predictions,
        executive_summary: this.generateExecutiveSummary(overview, insights),
        recommendations: this.generateRecommendations(insights, predictions)
      };

      // Store report in database
      const { data, error } = await supabase
        .from('compliance_reports')
        .insert([{
          organization_id: organizationId,
          framework,
          format,
          data: reportData,
          status: 'completed'
        }])
        .select()
        .single();

      if (error) throw error;

      // Generate download URL
      const { data: { publicUrl } } = supabase.storage
        .from('reports')
        .getPublicUrl(`${organizationId}/${data.id}.${format}`);

      analytics.track('ml_compliance_report_generated', {
        organization_id: organizationId,
        framework,
        format,
        report_id: data.id
      });

      return publicUrl;
    } catch (error) {
      reportError(error instanceof Error ? error : new Error('Failed to generate compliance report'), {
        organization_id: organizationId,
        framework,
        format
      });
      throw error;
    }
  }

  private async getFrameworkStatuses(organizationId: string): Promise<FrameworkStatus[]> {
    const { data: assessments, error } = await supabase
      .from('assessments')
      .select(`
        *,
        frameworks(name, abbreviation),
        requirements(id, status)
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    if (error) throw error;

    const frameworkMap = new Map<string, FrameworkStatus>();

    for (const assessment of assessments || []) {
      const framework = assessment.frameworks;
      if (!framework) continue;

      const requirements = assessment.requirements || [];
      const completed = requirements.filter(r => 
        r.status === 'COMPLIANT' || r.status === 'IMPLEMENTED'
      ).length;

      const score = requirements.length > 0 ? (completed / requirements.length) * 100 : 0;
      
      frameworkMap.set(framework.abbreviation, {
        framework: framework.abbreviation,
        score: Math.round(score),
        status: this.getComplianceStatus(score),
        requirementsCompleted: completed,
        totalRequirements: requirements.length
      });
    }

    return Array.from(frameworkMap.values());
  }

  private async getComplianceTrends(organizationId: string): Promise<ComplianceTrend[]> {
    // Get historical compliance data
    const { data: snapshots, error } = await supabase
      .from('compliance_snapshots')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(90); // Last 90 days

    if (error) throw error;

    return (snapshots || []).map(snapshot => ({
      date: new Date(snapshot.created_at),
      score: snapshot.overall_score,
      framework: snapshot.framework
    }));
  }

  private async getUpcomingDeadlines(organizationId: string): Promise<Deadline[]> {
    const { data: assessments, error } = await supabase
      .from('assessments')
      .select(`
        id,
        title,
        due_date,
        frameworks(abbreviation)
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .not('due_date', 'is', null)
      .order('due_date', { ascending: true })
      .limit(10);

    if (error) throw error;

    return (assessments || []).map(assessment => {
      const daysUntilDue = Math.ceil(
        (new Date(assessment.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: assessment.id,
        title: assessment.title,
        dueDate: new Date(assessment.due_date),
        framework: assessment.frameworks?.abbreviation || 'Unknown',
        priority: this.getDeadlinePriority(daysUntilDue)
      };
    });
  }

  private async generateComplianceTrendInsights(organizationId: string): Promise<MLInsight[]> {
    const insights: MLInsight[] = [];
    const trends = await this.getComplianceTrends(organizationId);

    if (trends.length < this.MIN_DATA_POINTS) return insights;

    // Analyze trend direction
    const recentTrends = trends.slice(0, 7);
    const olderTrends = trends.slice(7, 14);

    const recentAvg = recentTrends.reduce((sum, t) => sum + t.score, 0) / recentTrends.length;
    const olderAvg = olderTrends.reduce((sum, t) => sum + t.score, 0) / olderTrends.length;
    const change = recentAvg - olderAvg;

    if (Math.abs(change) > 5) {
      insights.push({
        id: `trend_${Date.now()}`,
        type: 'compliance_trend',
        title: change > 0 ? 'Compliance Score Improving' : 'Compliance Score Declining',
        description: `Your compliance score has ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}% over the past week.`,
        confidence: 0.85,
        impact: Math.abs(change) > 10 ? 'high' : 'medium',
        suggestedActions: change > 0 
          ? ['Continue current compliance activities', 'Document successful processes']
          : ['Review recent requirement changes', 'Accelerate remediation efforts', 'Schedule compliance review meeting'],
        relatedData: { recentAvg, olderAvg, change },
        createdAt: new Date()
      });
    }

    // Detect volatility
    const volatility = this.calculateVolatility(trends.map(t => t.score));
    if (volatility > 10) {
      insights.push({
        id: `volatility_${Date.now()}`,
        type: 'pattern',
        title: 'High Compliance Score Volatility',
        description: 'Your compliance score shows significant fluctuations, indicating inconsistent compliance management.',
        confidence: 0.8,
        impact: 'medium',
        suggestedActions: [
          'Establish consistent compliance review schedule',
          'Implement automated compliance monitoring',
          'Standardize evidence collection processes'
        ],
        relatedData: { volatility },
        createdAt: new Date()
      });
    }

    return insights;
  }

  private async generateRiskPredictionInsights(organizationId: string): Promise<MLInsight[]> {
    const insights: MLInsight[] = [];
    
    // Get upcoming deadlines and current progress
    const deadlines = await this.getUpcomingDeadlines(organizationId);
    const overview = await this.getComplianceOverview(organizationId);

    // Predict deadline risks
    for (const deadline of deadlines) {
      const daysUntilDue = Math.ceil(
        (deadline.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      const framework = overview.frameworks.find(f => f.framework === deadline.framework);
      if (!framework) continue;

      const remainingWork = framework.totalRequirements - framework.requirementsCompleted;
      const avgCompletionRate = framework.requirementsCompleted / Math.max(30, daysUntilDue);
      const predictedCompletion = framework.requirementsCompleted + (avgCompletionRate * daysUntilDue);
      
      if (predictedCompletion < framework.totalRequirements * 0.9) {
        insights.push({
          id: `risk_deadline_${deadline.id}`,
          type: 'risk_prediction',
          title: `High Risk: ${deadline.title} Deadline`,
          description: `Based on current progress, you may miss the ${deadline.framework} compliance deadline by ${Math.ceil(remainingWork / avgCompletionRate - daysUntilDue)} days.`,
          confidence: 0.75,
          impact: 'high',
          suggestedActions: [
            'Allocate additional resources to this assessment',
            'Prioritize critical requirements',
            'Consider requesting deadline extension',
            'Schedule daily progress reviews'
          ],
          relatedData: {
            deadline,
            remainingWork,
            avgCompletionRate,
            predictedCompletion
          },
          createdAt: new Date()
        });
      }
    }

    return insights;
  }

  private async generatePatternInsights(organizationId: string): Promise<MLInsight[]> {
    const insights: MLInsight[] = [];
    
    // Analyze requirement completion patterns
    const { data: requirementHistory, error } = await supabase
      .from('requirement_history')
      .select('*')
      .eq('organization_id', organizationId)
      .order('updated_at', { ascending: false })
      .limit(100);

    if (error || !requirementHistory) return insights;

    // Group by day of week and hour
    const patternMap = new Map<string, number>();
    
    for (const history of requirementHistory) {
      const date = new Date(history.updated_at);
      const dayHour = `${date.getDay()}_${date.getHours()}`;
      patternMap.set(dayHour, (patternMap.get(dayHour) || 0) + 1);
    }

    // Find peak productivity times
    const patterns = Array.from(patternMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (patterns.length > 0) {
      const peakTimes = patterns.map(([dayHour, count]) => {
        const [day, hour] = dayHour.split('_').map(Number);
        return {
          day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
          hour: `${hour}:00`,
          count
        };
      });

      insights.push({
        id: `pattern_productivity_${Date.now()}`,
        type: 'pattern',
        title: 'Peak Compliance Activity Times',
        description: `Your team is most productive on ${peakTimes[0].day}s around ${peakTimes[0].hour}.`,
        confidence: 0.7,
        impact: 'low',
        suggestedActions: [
          `Schedule important compliance work during peak times`,
          'Plan team meetings outside of peak productivity hours',
          'Align deadline reviews with high-activity periods'
        ],
        relatedData: { peakTimes },
        createdAt: new Date()
      });
    }

    return insights;
  }

  private async generateRecommendationInsights(organizationId: string): Promise<MLInsight[]> {
    const insights: MLInsight[] = [];
    const overview = await this.getComplianceOverview(organizationId);

    // Framework-specific recommendations
    for (const framework of overview.frameworks) {
      if (framework.score < 70) {
        const improvement = 80 - framework.score;
        const requiredCompletions = Math.ceil(
          (improvement / 100) * framework.totalRequirements
        );

        insights.push({
          id: `rec_framework_${framework.framework}_${Date.now()}`,
          type: 'recommendation',
          title: `Improve ${framework.framework} Compliance`,
          description: `Complete ${requiredCompletions} more requirements to reach 80% compliance for ${framework.framework}.`,
          confidence: 0.9,
          impact: framework.score < 50 ? 'high' : 'medium',
          suggestedActions: [
            'Focus on high-priority requirements first',
            'Assign dedicated team members to this framework',
            'Set weekly completion targets',
            'Implement automated evidence collection'
          ],
          relatedData: {
            currentScore: framework.score,
            targetScore: 80,
            requiredCompletions
          },
          createdAt: new Date()
        });
      }
    }

    // Overall compliance recommendations
    if (overview.overallScore < 75) {
      insights.push({
        id: `rec_overall_${Date.now()}`,
        type: 'recommendation',
        title: 'Accelerate Overall Compliance Progress',
        description: 'Your overall compliance score needs improvement to meet industry standards.',
        confidence: 0.85,
        impact: 'high',
        suggestedActions: [
          'Implement a compliance task force',
          'Automate evidence collection processes',
          'Schedule weekly compliance reviews',
          'Consider hiring compliance specialists',
          'Invest in compliance management tools'
        ],
        relatedData: {
          currentScore: overview.overallScore,
          industryBenchmark: 85
        },
        createdAt: new Date()
      });
    }

    return insights;
  }

  private async predictComplianceTrajectory(organizationId: string, framework: string): Promise<any> {
    const trends = await this.getComplianceTrends(organizationId);
    const frameworkTrends = trends.filter(t => !framework || t.framework === framework);

    if (frameworkTrends.length < this.MIN_DATA_POINTS) {
      return { predictions: [], confidence: 0 };
    }

    // Simple linear regression for trajectory prediction
    const n = frameworkTrends.length;
    const x = frameworkTrends.map((_, i) => i);
    const y = frameworkTrends.map(t => t.score);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate predictions for next 30, 60, 90 days
    const predictions = [30, 60, 90].map(days => {
      const predictedScore = intercept + slope * (n + days / 3);
      return {
        days,
        score: Math.max(0, Math.min(100, predictedScore)),
        confidence: Math.max(0.5, 1 - (days / 100))
      };
    });

    return { predictions, slope, intercept, confidence: 0.75 };
  }

  private generateExecutiveSummary(overview: ComplianceOverview, insights: MLInsight[]): string {
    const criticalInsights = insights.filter(i => i.impact === 'critical' || i.impact === 'high');
    const trendsDirection = overview.trendsData.length > 1 
      ? overview.trendsData[0].score > overview.trendsData[overview.trendsData.length - 1].score 
        ? 'improving' 
        : 'declining'
      : 'stable';

    return `
    Executive Summary:
    
    Overall Compliance: ${overview.overallScore.toFixed(1)}%
    Trend: ${trendsDirection}
    Critical Issues: ${criticalInsights.length}
    Upcoming Deadlines: ${overview.upcomingDeadlines.filter(d => d.priority === 'HIGH' || d.priority === 'CRITICAL').length}
    
    Key Findings:
    ${criticalInsights.slice(0, 3).map(i => `- ${i.title}: ${i.description}`).join('\n')}
    
    Immediate Actions Required:
    ${criticalInsights.flatMap(i => i.suggestedActions).slice(0, 5).map(a => `- ${a}`).join('\n')}
    `;
  }

  private generateRecommendations(insights: MLInsight[], predictions: any): string[] {
    const recommendations = new Set<string>();

    // Add high-confidence recommendations
    insights
      .filter(i => i.confidence > this.CONFIDENCE_THRESHOLD)
      .forEach(i => i.suggestedActions.forEach(a => recommendations.add(a)));

    // Add trajectory-based recommendations
    if (predictions.slope < 0) {
      recommendations.add('Urgent: Reverse declining compliance trend');
      recommendations.add('Implement daily compliance monitoring');
    }

    return Array.from(recommendations).slice(0, 10);
  }

  private getFrameworkWeight(frameworkId: string): number {
    // Assign weights based on framework importance
    const weights: Record<string, number> = {
      'soc2': 1.2,
      'iso27001': 1.2,
      'gdpr': 1.1,
      'hipaa': 1.1,
      'pci-dss': 1.0,
      'nist': 1.0,
      'ccpa': 0.9
    };
    return weights[frameworkId] || 1.0;
  }

  private getComplianceStatus(score: number): FrameworkStatus['status'] {
    if (score >= 95) return 'COMPLIANT';
    if (score >= 80) return 'PARTIALLY_COMPLIANT';
    if (score > 0) return 'IN_PROGRESS';
    return 'NOT_STARTED';
  }

  private getDeadlinePriority(daysUntilDue: number): Deadline['priority'] {
    if (daysUntilDue <= 7) return 'CRITICAL';
    if (daysUntilDue <= 14) return 'HIGH';
    if (daysUntilDue <= 30) return 'MEDIUM';
    return 'LOW';
  }

  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }
}

// Create singleton instance
export const mlAnalyticsService = new MLAnalyticsService();

export default mlAnalyticsService;