import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Zap,
  Users,
  FileText,
  Award,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  X
} from 'lucide-react';
import { useFabricCanvasStore } from '../core/FabricCanvasStore';
import {
  getAdvancedAnalyticsManager,
  AnalyticsMetrics,
  AnalyticsDashboard,
  AnalyticsInsight
} from '../core/AdvancedAnalyticsManager';
import { ModernPanel, ModernCard, ModernBadge } from '../design-system/ModernComponents';
import { DesignTokens, getColor, getSpacing } from '../design-system/DesignTokens';

interface ModernAnalyticsDashboardProps {
  visible: boolean;
  onClose: () => void;
}

const ModernAnalyticsDashboard: React.FC<ModernAnalyticsDashboardProps> = ({ visible, onClose }) => {
  const { canvas } = useFabricCanvasStore();
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboard | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'productivity' | 'quality' | 'insights'>('overview');

  const analyticsManager = getAdvancedAnalyticsManager(canvas);

  useEffect(() => {
    if (!visible || !analyticsManager || !canvas) return;

    loadAnalyticsData();

    // Set up real-time updates
    const handleMetricsUpdate = (updatedMetrics: AnalyticsMetrics) => {
      setMetrics(updatedMetrics);
      setDashboardData(analyticsManager.getDashboardData());
    };

    analyticsManager.on('metrics:updated', handleMetricsUpdate);

    // Update every 30 seconds
    const interval = setInterval(loadAnalyticsData, 30000);

    return () => {
      analyticsManager.off('metrics:updated', handleMetricsUpdate);
      clearInterval(interval);
    };
  }, [visible, analyticsManager]);

  const loadAnalyticsData = () => {
    if (!analyticsManager) return;

    const currentMetrics = analyticsManager.getMetrics();
    const dashboard = analyticsManager.getDashboardData();

    setMetrics(currentMetrics);
    setDashboardData(dashboard);
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const formatNumber = (num: number): string => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}k`;
    return `${(num / 1000000).toFixed(1)}m`;
  };

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving': return <ArrowUp size={16} color={getColor('success.600')} />;
      case 'declining': return <ArrowDown size={16} color={getColor('error.600')} />;
      default: return <Minus size={16} color={getColor('neutral.500')} />;
    }
  };

  const getPriorityColor = (priority: AnalyticsInsight['priority']) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'primary';
      default: return 'secondary';
    }
  };

  if (!visible || !metrics || !dashboardData) return null;

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
  }> = ({ title, value, subtitle, icon, trend, trendValue }) => (
    <ModernCard padding="5" hover>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: getSpacing(2),
            marginBottom: getSpacing(2)
          }}>
            <div style={{
              padding: getSpacing(2),
              borderRadius: DesignTokens.borderRadius.md,
              backgroundColor: getColor('primary.50'),
              color: getColor('primary.600')
            }}>
              {icon}
            </div>
            <span style={{
              fontSize: DesignTokens.typography.fontSize.sm,
              color: getColor('neutral.600'),
              fontWeight: DesignTokens.typography.fontWeight.medium
            }}>
              {title}
            </span>
          </div>
          <div style={{
            fontSize: DesignTokens.typography.fontSize['2xl'],
            fontWeight: DesignTokens.typography.fontWeight.bold,
            color: getColor('neutral.900'),
            lineHeight: DesignTokens.typography.lineHeight.tight
          }}>
            {value}
          </div>
          {subtitle && (
            <div style={{
              fontSize: DesignTokens.typography.fontSize.xs,
              color: getColor('neutral.500'),
              marginTop: getSpacing(1)
            }}>
              {subtitle}
            </div>
          )}
        </div>
        {trend && trendValue && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: getSpacing(1),
            padding: '4px 8px',
            borderRadius: DesignTokens.borderRadius.base,
            backgroundColor: trend === 'up' ? getColor('success.50') :
                           trend === 'down' ? getColor('error.50') : getColor('neutral.50'),
            color: trend === 'up' ? getColor('success.700') :
                   trend === 'down' ? getColor('error.700') : getColor('neutral.700')
          }}>
            {getTrendIcon(trend === 'up' ? 'improving' : trend === 'down' ? 'declining' : 'stable')}
            <span style={{ fontSize: DesignTokens.typography.fontSize.xs, fontWeight: DesignTokens.typography.fontWeight.medium }}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
    </ModernCard>
  );

  return (
    <ModernPanel
      title="Analytics Dashboard"
      subtitle="Real-time insights into your design workflow"
      onClose={onClose}
      width="1000px"
      maxHeight="90vh"
    >
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: `1px solid ${getColor('border.light')}`,
        marginBottom: getSpacing(6)
      }}>
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
          { id: 'productivity', label: 'Productivity', icon: <Zap size={16} /> },
          { id: 'quality', label: 'Quality', icon: <Award size={16} /> },
          { id: 'insights', label: 'Insights', icon: <Target size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: getSpacing(2),
              padding: `${getSpacing(3)} ${getSpacing(4)}`,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: DesignTokens.typography.fontSize.sm,
              fontWeight: DesignTokens.typography.fontWeight.medium,
              color: selectedTab === tab.id ? getColor('primary.600') : getColor('neutral.600'),
              borderBottom: selectedTab === tab.id ? `2px solid ${getColor('primary.600')}` : '2px solid transparent',
              transition: `all ${DesignTokens.animation.duration.normal}`
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: getSpacing(6) }}>
          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: getSpacing(4) }}>
            <StatCard
              title="Session Duration"
              value={formatDuration(metrics.usage.sessionDuration)}
              icon={<Clock size={20} />}
              subtitle="Current session"
            />
            <StatCard
              title="Objects Created"
              value={metrics.usage.objectsCreated}
              icon={<FileText size={20} />}
              subtitle="Total objects"
            />
            <StatCard
              title="Productivity"
              value={`${metrics.productivity.objectsPerMinute.toFixed(1)}/min`}
              icon={<TrendingUp size={20} />}
              subtitle="Objects per minute"
            />
            <StatCard
              title="Quality Score"
              value={`${metrics.quality.averageDocumentScore.toFixed(0)}%`}
              icon={<Award size={20} />}
              subtitle="Document quality"
            />
          </div>

          {/* Usage Breakdown */}
          <ModernCard padding="6">
            <h3 style={{
              margin: `0 0 ${getSpacing(4)} 0`,
              fontSize: DesignTokens.typography.fontSize.lg,
              fontWeight: DesignTokens.typography.fontWeight.semibold,
              color: getColor('neutral.900')
            }}>
              Usage Breakdown
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: getSpacing(4) }}>
              <div>
                <div style={{ fontSize: DesignTokens.typography.fontSize.sm, color: getColor('neutral.600'), marginBottom: getSpacing(2) }}>
                  Content Types
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: getSpacing(2) }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: DesignTokens.typography.fontSize.sm }}>Text Objects</span>
                    <ModernBadge variant="primary">{metrics.usage.textObjectsCreated}</ModernBadge>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: DesignTokens.typography.fontSize.sm }}>Shapes</span>
                    <ModernBadge variant="secondary">{metrics.usage.shapesCreated}</ModernBadge>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: DesignTokens.typography.fontSize.sm }}>Images</span>
                    <ModernBadge variant="secondary">{metrics.usage.imagesAdded}</ModernBadge>
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: DesignTokens.typography.fontSize.sm, color: getColor('neutral.600'), marginBottom: getSpacing(2) }}>
                  Actions
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: getSpacing(2) }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: DesignTokens.typography.fontSize.sm }}>Templates Used</span>
                    <ModernBadge variant="success">{metrics.usage.templatesUsed}</ModernBadge>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: DesignTokens.typography.fontSize.sm }}>Forms Created</span>
                    <ModernBadge variant="warning">{metrics.usage.formsCreated}</ModernBadge>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: DesignTokens.typography.fontSize.sm }}>Exports</span>
                    <ModernBadge variant="secondary">{metrics.usage.exportCount}</ModernBadge>
                  </div>
                </div>
              </div>
            </div>
          </ModernCard>
        </div>
      )}

      {selectedTab === 'productivity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: getSpacing(6) }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: getSpacing(4) }}>
            <StatCard
              title="Objects/Minute"
              value={metrics.productivity.objectsPerMinute.toFixed(1)}
              icon={<Zap size={20} />}
              subtitle="Creation rate"
            />
            <StatCard
              title="Actions/Minute"
              value={metrics.productivity.actionsPerMinute.toFixed(1)}
              icon={<TrendingUp size={20} />}
              subtitle="Total actions"
            />
            <StatCard
              title="Time to First Object"
              value={`${metrics.productivity.timeToFirstObject.toFixed(0)}s`}
              icon={<Clock size={20} />}
              subtitle="Getting started"
            />
            <StatCard
              title="Revisions"
              value={metrics.productivity.revisionCount}
              icon={<FileText size={20} />}
              subtitle="Object modifications"
            />
          </div>

          {/* Most Used Tools */}
          <ModernCard padding="6">
            <h3 style={{
              margin: `0 0 ${getSpacing(4)} 0`,
              fontSize: DesignTokens.typography.fontSize.lg,
              fontWeight: DesignTokens.typography.fontWeight.semibold,
              color: getColor('neutral.900')
            }}>
              Most Used Tools
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: getSpacing(3) }}>
              {metrics.behavior.mostUsedTools.slice(0, 8).map((tool, index) => (
                <div key={tool.tool} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: getSpacing(3),
                  backgroundColor: getColor('neutral.50'),
                  borderRadius: DesignTokens.borderRadius.md
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: getSpacing(3) }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: DesignTokens.borderRadius.base,
                      backgroundColor: getColor('primary.100'),
                      color: getColor('primary.600'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: DesignTokens.typography.fontSize.xs,
                      fontWeight: DesignTokens.typography.fontWeight.bold
                    }}>
                      {index + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: DesignTokens.typography.fontSize.sm, fontWeight: DesignTokens.typography.fontWeight.medium }}>
                        {tool.tool}
                      </div>
                      <div style={{ fontSize: DesignTokens.typography.fontSize.xs, color: getColor('neutral.500') }}>
                        {tool.category}
                      </div>
                    </div>
                  </div>
                  <ModernBadge variant="primary">{tool.usageCount}</ModernBadge>
                </div>
              ))}
            </div>
          </ModernCard>
        </div>
      )}

      {selectedTab === 'quality' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: getSpacing(6) }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: getSpacing(4) }}>
            <StatCard
              title="Overall Score"
              value={`${metrics.quality.averageDocumentScore.toFixed(0)}%`}
              icon={<Award size={20} />}
              subtitle="Document quality"
            />
            <StatCard
              title="Consistency"
              value={`${metrics.quality.consistencyScore.toFixed(0)}%`}
              icon={<CheckCircle size={20} />}
              subtitle="Visual consistency"
            />
            <StatCard
              title="Completeness"
              value={`${metrics.quality.completenessScore.toFixed(0)}%`}
              icon={<FileText size={20} />}
              subtitle="Content completeness"
            />
            <StatCard
              title="Professionalism"
              value={`${metrics.quality.professionalismScore.toFixed(0)}%`}
              icon={<Users size={20} />}
              subtitle="Professional appearance"
            />
          </div>

          {/* Quality Breakdown */}
          <ModernCard padding="6">
            <h3 style={{
              margin: `0 0 ${getSpacing(4)} 0`,
              fontSize: DesignTokens.typography.fontSize.lg,
              fontWeight: DesignTokens.typography.fontWeight.semibold,
              color: getColor('neutral.900')
            }}>
              Quality Metrics
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: getSpacing(4) }}>
              {[
                { label: 'Consistency', value: metrics.quality.consistencyScore, color: 'primary' },
                { label: 'Completeness', value: metrics.quality.completenessScore, color: 'success' },
                { label: 'Professionalism', value: metrics.quality.professionalismScore, color: 'warning' },
                { label: 'Accessibility', value: metrics.quality.accessibilityScore, color: 'error' }
              ].map(metric => (
                <div key={metric.label} style={{ display: 'flex', alignItems: 'center', gap: getSpacing(4) }}>
                  <div style={{ minWidth: '120px', fontSize: DesignTokens.typography.fontSize.sm }}>
                    {metric.label}
                  </div>
                  <div style={{ flex: 1, height: '8px', backgroundColor: getColor('neutral.200'), borderRadius: DesignTokens.borderRadius.full }}>
                    <div style={{
                      width: `${metric.value}%`,
                      height: '100%',
                      backgroundColor: getColor(`${metric.color}.500`),
                      borderRadius: DesignTokens.borderRadius.full,
                      transition: `width ${DesignTokens.animation.duration.slow}`
                    }} />
                  </div>
                  <div style={{ minWidth: '40px', fontSize: DesignTokens.typography.fontSize.sm, fontWeight: DesignTokens.typography.fontWeight.medium }}>
                    {metric.value.toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>
        </div>
      )}

      {selectedTab === 'insights' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: getSpacing(6) }}>
          {dashboardData.insights.length === 0 ? (
            <ModernCard padding="8">
              <div style={{ textAlign: 'center', color: getColor('neutral.500') }}>
                <Target size={48} style={{ marginBottom: getSpacing(4), opacity: 0.5 }} />
                <h3 style={{ margin: `0 0 ${getSpacing(2)} 0`, color: getColor('neutral.700') }}>
                  No Insights Available
                </h3>
                <p style={{ margin: 0, fontSize: DesignTokens.typography.fontSize.sm }}>
                  Continue using the editor to generate personalized insights
                </p>
              </div>
            </ModernCard>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: getSpacing(4) }}>
              {dashboardData.insights.map(insight => (
                <ModernCard key={insight.id} padding="6">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: getSpacing(4) }}>
                    <div style={{
                      padding: getSpacing(2),
                      borderRadius: DesignTokens.borderRadius.md,
                      backgroundColor: insight.priority === 'critical' ? getColor('error.50') :
                                     insight.priority === 'high' ? getColor('warning.50') :
                                     insight.priority === 'medium' ? getColor('primary.50') : getColor('neutral.50'),
                      color: insight.priority === 'critical' ? getColor('error.600') :
                             insight.priority === 'high' ? getColor('warning.600') :
                             insight.priority === 'medium' ? getColor('primary.600') : getColor('neutral.600')
                    }}>
                      {insight.priority === 'critical' ? <AlertCircle size={20} /> : <Target size={20} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: getSpacing(2), marginBottom: getSpacing(2) }}>
                        <h4 style={{
                          margin: 0,
                          fontSize: DesignTokens.typography.fontSize.base,
                          fontWeight: DesignTokens.typography.fontWeight.semibold,
                          color: getColor('neutral.900')
                        }}>
                          {insight.title}
                        </h4>
                        <ModernBadge variant={getPriorityColor(insight.priority) as any}>
                          {insight.priority}
                        </ModernBadge>
                        {getTrendIcon(insight.trend)}
                      </div>
                      <p style={{
                        margin: `0 0 ${getSpacing(3)} 0`,
                        fontSize: DesignTokens.typography.fontSize.sm,
                        color: getColor('neutral.600'),
                        lineHeight: DesignTokens.typography.lineHeight.relaxed
                      }}>
                        {insight.description}
                      </p>
                      <div style={{
                        padding: getSpacing(3),
                        backgroundColor: getColor('primary.50'),
                        borderRadius: DesignTokens.borderRadius.md,
                        borderLeft: `4px solid ${getColor('primary.500')}`
                      }}>
                        <div style={{
                          fontSize: DesignTokens.typography.fontSize.xs,
                          fontWeight: DesignTokens.typography.fontWeight.medium,
                          color: getColor('primary.700'),
                          marginBottom: getSpacing(1)
                        }}>
                          Recommendation
                        </div>
                        <div style={{
                          fontSize: DesignTokens.typography.fontSize.sm,
                          color: getColor('primary.800')
                        }}>
                          {insight.recommendation}
                        </div>
                      </div>
                    </div>
                  </div>
                </ModernCard>
              ))}
            </div>
          )}
        </div>
      )}
    </ModernPanel>
  );
};

export default ModernAnalyticsDashboard;
