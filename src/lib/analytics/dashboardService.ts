import { supabase } from '@/lib/supabase';
import { mlAnalyticsService } from '@/lib/ml/analyticsService';
import { riskPredictionService } from '@/lib/ml/riskPrediction';
import { anomalyDetectionService } from '@/lib/ml/anomalyDetection';
import { cacheService } from '@/lib/cache/cacheService';
import { reportError } from '@/lib/monitoring/sentry';
import { analytics } from '@/lib/monitoring/analytics';

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'progress' | 'heatmap' | 'gauge' | 'timeline';
  title: string;
  subtitle?: string;
  data: any;
  config: WidgetConfig;
  refreshInterval?: number; // seconds
  lastUpdated: Date;
}

export interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  yAxisLabel?: string;
  xAxisLabel?: string;
  threshold?: number;
  format?: 'percentage' | 'currency' | 'number' | 'duration';
  size?: 'small' | 'medium' | 'large';
}

export interface DashboardLayout {
  organizationId: string;
  name: string;
  description?: string;
  widgets: DashboardWidgetPosition[];
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface DashboardWidgetPosition {
  widgetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RealTimeMetrics {
  complianceScore: number;
  riskLevel: string;
  activeAssessments: number;
  overdueRequirements: number;
  recentAlerts: number;
  timestamp: Date;
}

class DashboardService {
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly REALTIME_REFRESH = 30; // 30 seconds for real-time widgets

  async getDashboardData(organizationId: string, layout?: string): Promise<DashboardWidget[]> {
    const cacheKey = `dashboard:${organizationId}:${layout || 'default'}`;
    const cached = await cacheService.get<DashboardWidget[]>(cacheKey);
    if (cached) return cached;

    try {
      const widgets = await this.generateDefaultWidgets(organizationId);
      await cacheService.set(cacheKey, widgets, this.CACHE_TTL);
      
      analytics.track('dashboard_loaded', {
        organization_id: organizationId,
        widget_count: widgets.length,
        layout: layout || 'default'
      });

      return widgets;
    } catch (error) {
      reportError(error instanceof Error ? error : new Error('Failed to load dashboard'), {
        organization_id: organizationId,
        layout
      });
      return [];
    }
  }

  async getRealTimeMetrics(organizationId: string): Promise<RealTimeMetrics> {
    const cacheKey = `realtime:${organizationId}`;
    const cached = await cacheService.get<RealTimeMetrics>(cacheKey);
    if (cached) return cached;

    try {
      const [complianceScore, riskAnalysis, assessmentStats, alerts] = await Promise.all([
        mlAnalyticsService.calculateComplianceScore(organizationId),
        riskPredictionService.analyzeRisk(organizationId),
        this.getAssessmentStats(organizationId),
        this.getRecentAlerts(organizationId)
      ]);

      const metrics: RealTimeMetrics = {
        complianceScore,
        riskLevel: riskAnalysis.level,
        activeAssessments: assessmentStats.active,
        overdueRequirements: assessmentStats.overdue,
        recentAlerts: alerts.length,
        timestamp: new Date()
      };

      await cacheService.set(cacheKey, metrics, this.REALTIME_REFRESH);
      return metrics;
    } catch (error) {
      reportError(error instanceof Error ? error : new Error('Failed to get real-time metrics'), {
        organization_id: organizationId
      });
      throw error;
    }
  }

  async createCustomWidget(organizationId: string, widgetConfig: {
    type: DashboardWidget['type'];
    title: string;
    dataSource: string;
    config: WidgetConfig;
  }): Promise<DashboardWidget> {
    try {
      const widget: DashboardWidget = {
        id: `widget_${Date.now()}`,
        type: widgetConfig.type,
        title: widgetConfig.title,
        data: await this.fetchWidgetData(organizationId, widgetConfig.dataSource),
        config: widgetConfig.config,
        refreshInterval: this.getRefreshInterval(widgetConfig.type),
        lastUpdated: new Date()
      };

      // Store custom widget
      const { error } = await supabase
        .from('dashboard_widgets')
        .insert([{
          id: widget.id,
          organization_id: organizationId,
          type: widget.type,
          title: widget.title,
          config: widget.config,
          data_source: widgetConfig.dataSource,
          refresh_interval: widget.refreshInterval
        }]);

      if (error) throw error;

      analytics.track('custom_widget_created', {
        organization_id: organizationId,
        widget_type: widget.type,
        data_source: widgetConfig.dataSource
      });

      return widget;
    } catch (error) {
      reportError(error instanceof Error ? error : new Error('Failed to create custom widget'), {
        organization_id: organizationId,
        widget_config: widgetConfig
      });
      throw error;
    }
  }

  async updateWidgetData(organizationId: string, widgetId: string): Promise<DashboardWidget | null> {
    try {
      // Get widget configuration
      const { data: widgetConfig, error } = await supabase
        .from('dashboard_widgets')
        .select('*')
        .eq('id', widgetId)
        .eq('organization_id', organizationId)
        .single();

      if (error) throw error;

      // Fetch fresh data
      const data = await this.fetchWidgetData(organizationId, widgetConfig.data_source);

      const updatedWidget: DashboardWidget = {
        id: widgetId,
        type: widgetConfig.type,
        title: widgetConfig.title,
        data,
        config: widgetConfig.config,
        refreshInterval: widgetConfig.refresh_interval,
        lastUpdated: new Date()
      };

      return updatedWidget;
    } catch (error) {
      reportError(error instanceof Error ? error : new Error('Failed to update widget data'), {
        organization_id: organizationId,
        widget_id: widgetId
      });
      return null;
    }
  }

  async exportDashboard(organizationId: string, format: 'pdf' | 'png' | 'json'): Promise<string> {
    try {
      const dashboardData = await this.getDashboardData(organizationId);
      const metrics = await this.getRealTimeMetrics(organizationId);

      // Create export data
      const exportData = {
        organization_id: organizationId,
        generated_at: new Date().toISOString(),
        metrics,
        widgets: dashboardData,
        format
      };

      // Store export request
      const { data, error } = await supabase
        .from('dashboard_exports')
        .insert([{
          organization_id: organizationId,
          format,
          data: exportData,
          status: 'completed'
        }])
        .select()
        .single();

      if (error) throw error;

      // Generate download URL (mock - would integrate with actual file service)
      const downloadUrl = `${process.env.APP_URL}/exports/${data.id}.${format}`;

      analytics.track('dashboard_exported', {
        organization_id: organizationId,
        format,
        export_id: data.id
      });

      return downloadUrl;
    } catch (error) {
      reportError(error instanceof Error ? error : new Error('Failed to export dashboard'), {
        organization_id: organizationId,
        format
      });
      throw error;
    }
  }

  private async generateDefaultWidgets(organizationId: string): Promise<DashboardWidget[]> {
    const widgets: DashboardWidget[] = [];

    // Compliance Score Gauge
    widgets.push({
      id: 'compliance-score',
      type: 'gauge',
      title: 'Overall Compliance Score',
      subtitle: 'Current compliance percentage',
      data: {
        value: await mlAnalyticsService.calculateComplianceScore(organizationId),
        min: 0,
        max: 100,
        threshold: 80
      },
      config: {
        colors: ['#ff4444', '#ffaa00', '#44aa44'],
        format: 'percentage',
        size: 'medium'
      },
      refreshInterval: 300,
      lastUpdated: new Date()
    });

    // Risk Level Indicator
    const riskAnalysis = await riskPredictionService.analyzeRisk(organizationId);
    widgets.push({
      id: 'risk-level',
      type: 'metric',
      title: 'Risk Level',
      subtitle: `Score: ${riskAnalysis.overallScore}`,
      data: {
        value: riskAnalysis.level,
        color: this.getRiskColor(riskAnalysis.level),
        trend: this.calculateRiskTrend(organizationId)
      },
      config: {
        size: 'medium'
      },
      refreshInterval: 600,
      lastUpdated: new Date()
    });

    // Compliance Trends Chart
    const complianceOverview = await mlAnalyticsService.getComplianceOverview(organizationId);
    widgets.push({
      id: 'compliance-trends',
      type: 'chart',
      title: 'Compliance Trends',
      subtitle: 'Last 30 days',
      data: {
        datasets: [{
          label: 'Overall Compliance',
          data: complianceOverview.trendsData.map(t => ({
            x: t.date,
            y: t.score
          })),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)'
        }]
      },
      config: {
        chartType: 'line',
        showGrid: true,
        yAxisLabel: 'Compliance Score (%)',
        size: 'large'
      },
      refreshInterval: 1800,
      lastUpdated: new Date()
    });

    // Framework Status Progress Bars
    widgets.push({
      id: 'framework-status',
      type: 'progress',
      title: 'Framework Compliance',
      subtitle: 'Progress by framework',
      data: {
        frameworks: complianceOverview.frameworks.map(f => ({
          name: f.framework,
          progress: f.score,
          status: f.status,
          total: f.totalRequirements,
          completed: f.requirementsCompleted
        }))
      },
      config: {
        colors: ['#ef4444', '#f97316', '#eab308', '#22c55e'],
        format: 'percentage',
        size: 'medium'
      },
      refreshInterval: 600,
      lastUpdated: new Date()
    });

    // Upcoming Deadlines Table
    widgets.push({
      id: 'upcoming-deadlines',
      type: 'table',
      title: 'Upcoming Deadlines',
      subtitle: 'Next 30 days',
      data: {
        headers: ['Assessment', 'Framework', 'Due Date', 'Priority'],
        rows: complianceOverview.upcomingDeadlines.map(d => [
          d.title,
          d.framework,
          d.dueDate.toLocaleDateString(),
          d.priority
        ])
      },
      config: {
        size: 'large'
      },
      refreshInterval: 3600,
      lastUpdated: new Date()
    });

    // Recent Anomalies
    const recentAnomalies = await this.getRecentAlerts(organizationId);
    widgets.push({
      id: 'recent-anomalies',
      type: 'timeline',
      title: 'Recent Alerts',
      subtitle: 'Last 24 hours',
      data: {
        events: recentAnomalies.map(a => ({
          title: a.title,
          description: a.description,
          timestamp: a.detectedAt,
          severity: a.severity,
          type: a.type
        }))
      },
      config: {
        colors: ['#10b981', '#f59e0b', '#ef4444', '#dc2626'],
        size: 'medium'
      },
      refreshInterval: 300,
      lastUpdated: new Date()
    });

    // Active Assessments Metric
    const assessmentStats = await this.getAssessmentStats(organizationId);
    widgets.push({
      id: 'active-assessments',
      type: 'metric',
      title: 'Active Assessments',
      subtitle: `${assessmentStats.overdue} overdue`,
      data: {
        value: assessmentStats.active,
        change: assessmentStats.weeklyChange,
        trend: assessmentStats.weeklyChange >= 0 ? 'up' : 'down'
      },
      config: {
        format: 'number',
        size: 'small'
      },
      refreshInterval: 900,
      lastUpdated: new Date()
    });

    // Risk Categories Pie Chart
    widgets.push({
      id: 'risk-categories',
      type: 'chart',
      title: 'Risk by Category',
      subtitle: 'Current risk distribution',
      data: {
        labels: riskAnalysis.categories.map(c => c.name),
        datasets: [{
          data: riskAnalysis.categories.map(c => c.score),
          backgroundColor: [
            '#ef4444', '#f97316', '#eab308', '#22c55e',
            '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'
          ]
        }]
      },
      config: {
        chartType: 'doughnut',
        showLegend: true,
        size: 'medium'
      },
      refreshInterval: 1800,
      lastUpdated: new Date()
    });

    return widgets;
  }

  private async fetchWidgetData(organizationId: string, dataSource: string): Promise<any> {
    switch (dataSource) {
      case 'compliance_overview':
        return mlAnalyticsService.getComplianceOverview(organizationId);
      case 'risk_analysis':
        return riskPredictionService.analyzeRisk(organizationId);
      case 'ml_insights':
        return mlAnalyticsService.getInsights(organizationId);
      case 'anomalies':
        return anomalyDetectionService.detectAnomalies(organizationId);
      case 'assessments':
        return this.getAssessmentStats(organizationId);
      default:
        throw new Error(`Unknown data source: ${dataSource}`);
    }
  }

  private async getAssessmentStats(organizationId: string): Promise<any> {
    const { data: assessments } = await supabase
      .from('assessments')
      .select('*')
      .eq('organization_id', organizationId);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const active = assessments?.filter(a => a.status === 'active').length || 0;
    const overdue = assessments?.filter(a => 
      a.due_date && new Date(a.due_date) < now
    ).length || 0;
    const recentlyCreated = assessments?.filter(a => 
      new Date(a.created_at) > weekAgo
    ).length || 0;

    return {
      active,
      overdue,
      weeklyChange: recentlyCreated,
      total: assessments?.length || 0
    };
  }

  private async getRecentAlerts(organizationId: string): Promise<any[]> {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const { data } = await supabase
      .from('anomaly_alerts')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('detected_at', yesterday.toISOString())
      .eq('resolved', false)
      .order('detected_at', { ascending: false });

    return data || [];
  }

  private async calculateRiskTrend(organizationId: string): Promise<'up' | 'down' | 'stable'> {
    const { data: snapshots } = await supabase
      .from('risk_snapshots')
      .select('overall_score')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(2);

    if (!snapshots || snapshots.length < 2) return 'stable';

    const current = snapshots[0].overall_score;
    const previous = snapshots[1].overall_score;
    const change = current - previous;

    if (Math.abs(change) < 2) return 'stable';
    return change > 0 ? 'up' : 'down';
  }

  private getRiskColor(riskLevel: string): string {
    switch (riskLevel) {
      case 'LOW': return '#22c55e';
      case 'MEDIUM': return '#eab308';
      case 'HIGH': return '#f97316';
      case 'CRITICAL': return '#ef4444';
      default: return '#6b7280';
    }
  }

  private getRefreshInterval(widgetType: DashboardWidget['type']): number {
    switch (widgetType) {
      case 'metric':
      case 'gauge':
        return 300; // 5 minutes
      case 'chart':
        return 900; // 15 minutes
      case 'table':
      case 'timeline':
        return 600; // 10 minutes
      default:
        return 1800; // 30 minutes
    }
  }
}

// Create singleton instance
export const dashboardService = new DashboardService();

export default dashboardService;