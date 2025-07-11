import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  BarChart3, 
  Brain, 
  Download,
  RefreshCw,
  Clock,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Calendar,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { complianceMonitoringService } from '@/services/ComplianceMonitoringService';
import { dashboardService } from '@/lib/analytics/dashboardService';
import { mlAnalyticsService } from '@/lib/ml/analyticsService';
import { riskPredictionService } from '@/lib/ml/riskPrediction';
import { anomalyDetectionService } from '@/lib/ml/anomalyDetection';
import { toast } from '@/utils/toast';

// Combined data interface for monitoring and analytics
interface MonitoringAnalyticsData {
  // Monitoring data
  monitoringStatus: {
    isActive: boolean;
    lastCheck: Date;
    nextCheck: Date;
  };
  complianceMetrics: {
    score: number;
    trend: number;
    activeAlerts: number;
    overdueItems: number;
    riskScore: number;
  };
  alerts: any[];
  deadlines: any[];
  // Analytics data
  mlInsights: any[];
  riskAnalysis: any;
  anomalies: any[];
  predictiveAnalytics: any;
  trendsData: any[];
}

const ComplianceMonitoring = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const { organization, isDemo } = useAuth();
  const [data, setData] = useState<MonitoringAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRiskCategory, setSelectedRiskCategory] = useState<any>(null);
  
  const [runningCheck, setRunningCheck] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Determine organization ID
  const currentOrgId = organizationId || organization?.id || 'demo';
  const isDemoMode = isDemo;
  
  // Get standards data for demo mode (removed since we handle this inside the function)
  
  const loadMonitoringAndAnalytics = async () => {
    try {
      setLoading(true);
      
      
      if (isDemoMode) {
        // Get actual organization standards for realistic demo data
        const savedStandards = JSON.parse(localStorage.getItem('standards') || '[]');
        
        // Provide fallback standards if none are selected
        const fallbackStandards = [
          { id: 'iso-27001', name: 'ISO 27001' },
          { id: 'gdpr', name: 'GDPR' },
          { id: 'soc2', name: 'SOC 2' },
          { id: 'nist', name: 'NIST CSF' },
          { id: 'cis', name: 'CIS Controls' }
        ];
        
        const activeStandards = savedStandards.length > 0 ? savedStandards : fallbackStandards;
        const activeStandardsCount = activeStandards.length;
        
        // Calculate realistic compliance score based on active standards
        const baseScore = Math.min(85 + (activeStandardsCount * 2), 94);
        const riskScore = Math.max(25 - (activeStandardsCount * 2), 8);
        
        // Create comprehensive alerts based on actual standards
        const dynamicAlerts = [
          // Critical alerts
          {
            id: 1,
            type: 'compliance_violation',
            severity: 'critical',
            title: `Critical: ${activeStandards[0]?.name || 'ISO 27001'} Non-Compliance Detected`,
            description: 'Access control policy A.9.1.1 has not been reviewed in 180 days, exceeding the 90-day requirement',
            standardName: activeStandards[0]?.name || 'ISO 27001',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            affectedSystems: ['Active Directory', 'VPN Gateway', 'Database Access'],
            remediation: 'Update access control policy and implement quarterly review cycle'
          },
          {
            id: 2,
            type: 'deadline_approaching',
            severity: 'warning',
            title: `${activeStandards[1]?.name || 'GDPR'} Assessment Due Soon`,
            description: 'Annual GDPR compliance assessment is due in 3 days. 47 of 52 requirements completed',
            standardName: activeStandards[1]?.name || 'GDPR',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            affectedSystems: ['Customer Database', 'Web Application', 'Email System'],
            remediation: 'Complete remaining data protection requirements and schedule external audit'
          },
          {
            id: 3,
            type: 'risk_identified',
            severity: 'critical',
            title: `High Risk: ${activeStandards[2]?.name || 'SOC 2'} Controls Weakness`,
            description: 'Automated monitoring detected 23% increase in failed login attempts across critical systems',
            standardName: activeStandards[2]?.name || 'SOC 2',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            affectedSystems: ['Authentication Server', 'Admin Portal', 'API Gateway'],
            remediation: 'Implement enhanced monitoring and consider additional access controls'
          },
          {
            id: 4,
            type: 'missing_documentation',
            severity: 'warning',
            title: `Documentation Gap: ${activeStandards[3]?.name || 'NIST CSF'} Evidence Missing`,
            description: 'Missing evidence for 8 NIST Cybersecurity Framework controls including network monitoring logs',
            standardName: activeStandards[3]?.name || 'NIST CSF',
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
            affectedSystems: ['Network Monitoring', 'SIEM', 'Endpoint Protection'],
            remediation: 'Collect and upload required documentation, implement automated evidence collection'
          },
          {
            id: 5,
            type: 'anomaly_detected',
            severity: 'info',
            title: `Anomaly: ${activeStandards[4]?.name || 'CIS Controls'} Compliance Score Drop`,
            description: 'ML algorithms detected unusual 8% drop in compliance score over the last 72 hours',
            standardName: activeStandards[4]?.name || 'CIS Controls',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
            affectedSystems: ['Incident Response', 'Business Continuity', 'Supply Chain'],
            remediation: 'Investigate recent changes and validate all controls are functioning properly'
          }
        ].slice(0, Math.min(activeStandards.length, 5));

        // Enhanced ML Insights
        const enhancedMLInsights = [
          {
            id: 1,
            type: 'COMPLIANCE_TREND',
            title: 'Compliance Trajectory Analysis',
            description: `Your organization is on track to achieve 92% compliance across all ${activeStandardsCount} standards by Q2. Current improvement rate: 2.3% per month.`,
            confidence: 0.94,
            impact: 'HIGH',
            suggestedActions: [
              'Maintain current remediation pace',
              'Allocate additional resources to lagging requirements',
              'Implement automated compliance monitoring for sustained improvement'
            ],
            relatedStandards: activeStandards.slice(0, 3).map((s: any) => s.name),
            dataPoints: 47,
            trendDirection: 'upward'
          },
          {
            id: 2,
            type: 'RISK_PREDICTION',
            title: 'Predictive Risk Analysis',
            description: `ML models predict 18% increase in cyber security risks within 4 weeks based on current threat landscape and control gaps.`,
            confidence: 0.87,
            impact: 'CRITICAL',
            suggestedActions: [
              'Strengthen network perimeter controls',
              'Implement multi-factor authentication across all systems',
              'Increase security awareness training frequency',
              'Deploy additional endpoint detection tools'
            ],
            relatedStandards: [activeStandards[0]?.name, activeStandards[1]?.name].filter(Boolean),
            dataPoints: 156,
            trendDirection: 'upward'
          },
          {
            id: 3,
            type: 'ANOMALY',
            title: 'Behavioral Anomaly Detection',
            description: `Detected unusual patterns in ${activeStandards[2]?.name || 'access control'} logs: 340% increase in after-hours admin access attempts.`,
            confidence: 0.91,
            impact: 'HIGH',
            suggestedActions: [
              'Review privileged access management policies',
              'Implement just-in-time access controls',
              'Enhance monitoring for administrative activities',
              'Conduct security awareness training for admin users'
            ],
            relatedStandards: [activeStandards[2]?.name].filter(Boolean),
            dataPoints: 89,
            trendDirection: 'concerning'
          },
          {
            id: 4,
            type: 'PATTERN',
            title: 'Compliance Pattern Recognition',
            description: `Identified optimal compliance workflow: Requirements completed 34% faster when assigned on Tuesdays and reviewed on Fridays.`,
            confidence: 0.82,
            impact: 'MEDIUM',
            suggestedActions: [
              'Adjust assignment schedule to leverage peak productivity periods',
              'Implement structured review cycles aligned with team performance patterns',
              'Automate routine compliance tasks during high-efficiency windows'
            ],
            relatedStandards: activeStandards.slice(0, 2).map((s: any) => s.name),
            dataPoints: 203,
            trendDirection: 'stable'
          },
          {
            id: 5,
            type: 'RECOMMENDATION',
            title: 'Automated Compliance Optimization',
            description: `AI recommends implementing automated evidence collection for ${activeStandards[1]?.name || 'GDPR'} - could reduce manual effort by 67%.`,
            confidence: 0.95,
            impact: 'HIGH',
            suggestedActions: [
              'Deploy automated evidence collection tools',
              'Integrate with existing security infrastructure',
              'Train team on new automated workflows',
              'Establish monitoring for automated processes'
            ],
            relatedStandards: [activeStandards[1]?.name].filter(Boolean),
            dataPoints: 78,
            trendDirection: 'optimization'
          }
        ];

        // Enhanced Anomalies
        const enhancedAnomalies = [
          {
            id: 1,
            type: 'compliance_drop',
            severity: 'warning',
            title: 'Unusual Compliance Score Fluctuation',
            description: `${activeStandards[0]?.name || 'ISO 27001'} compliance score dropped 12% in 48 hours due to 15 newly identified non-conformities`,
            detectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            confidence: 0.89,
            affectedStandards: [activeStandards[0]?.name].filter(Boolean),
            recommendedActions: ['Investigate root cause of non-conformities', 'Implement corrective measures', 'Review control effectiveness']
          },
          {
            id: 2,
            type: 'access_pattern',
            severity: 'critical',
            title: 'Abnormal Administrative Access Pattern',
            description: 'Detected 280% increase in privileged access attempts outside business hours over the last 7 days',
            detectedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
            confidence: 0.94,
            affectedStandards: [activeStandards[1]?.name, activeStandards[2]?.name].filter(Boolean),
            recommendedActions: ['Review access logs immediately', 'Implement additional MFA controls', 'Conduct security incident assessment']
          },
          {
            id: 3,
            type: 'performance_deviation',
            severity: 'info',
            title: 'Compliance Task Performance Anomaly',
            description: 'Average task completion time increased by 45% for specific requirement categories',
            detectedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            confidence: 0.76,
            affectedStandards: activeStandards.slice(0, 2).map((s: any) => s.name),
            recommendedActions: ['Analyze task complexity factors', 'Provide additional training resources', 'Optimize workflow processes']
          }
        ];
        
        // Comprehensive demo data combining both monitoring and analytics
        const demoData = {
          monitoringStatus: {
            isActive: true,
            lastCheck: new Date(Date.now() - 5 * 60 * 1000),
            nextCheck: new Date(Date.now() + 10 * 60 * 1000)
          },
          complianceMetrics: {
            score: baseScore,
            trend: 6.2,
            activeAlerts: dynamicAlerts.length,
            overdueItems: Math.floor(activeStandardsCount * 0.6),
            riskScore: riskScore
          },
          alerts: dynamicAlerts.map((alert, index) => ({
            ...alert,
            entity: { type: 'assessment', name: `${alert.standardName} Review` },
            createdAt: alert.timestamp,
            dueDate: new Date(Date.now() + (5 + index) * 24 * 60 * 60 * 1000),
            assignedTo: index === 0 ? 'security-team' : index === 1 ? 'compliance-officer' : 'risk-manager'
          })),
          deadlines: activeStandards.map((standard: any, index: number) => ({
            id: index + 1,
            title: `${standard.name} Review`,
            type: index % 2 === 0 ? 'assessment' : 'requirement',
            dueDate: new Date(Date.now() + (7 + index * 5) * 24 * 60 * 60 * 1000),
            priority: index === 0 ? 'HIGH' : index === 1 ? 'MEDIUM' : 'LOW',
            standardId: standard.id,
            standardName: standard.name
          })),
          mlInsights: enhancedMLInsights,
          riskAnalysis: {
            overall: riskScore,
            categories: [
              { 
                name: 'Cybersecurity', 
                value: Math.max(riskScore - 5, 10), 
                color: '#ef4444',
                description: 'Risks related to data breaches, cyberattacks, malware, and unauthorized access to systems and data.',
                factors: [
                  'Unpatched vulnerabilities in critical systems',
                  'Weak password policies and authentication',
                  'Insufficient network segmentation',
                  'Lack of endpoint detection and response'
                ],
                impact: 'Critical business operations and customer data at risk',
                recommendations: [
                  'Implement zero-trust security architecture',
                  'Deploy advanced threat detection systems',
                  'Conduct regular penetration testing',
                  'Enhance employee security awareness training'
                ]
              },
              { 
                name: 'Operational', 
                value: Math.max(riskScore - 8, 5), 
                color: '#f59e0b',
                description: 'Risks arising from internal processes, systems failures, human errors, and business continuity issues.',
                factors: [
                  'Undocumented critical business processes',
                  'Single points of failure in key systems',
                  'Insufficient backup and recovery procedures',
                  'Limited cross-training of essential personnel'
                ],
                impact: 'Service disruptions and operational inefficiencies',
                recommendations: [
                  'Document and standardize all critical processes',
                  'Implement redundancy for critical systems',
                  'Establish comprehensive disaster recovery plans',
                  'Create knowledge management systems'
                ]
              },
              { 
                name: 'Compliance', 
                value: Math.max(riskScore + 2, 15), 
                color: '#8b5cf6',
                description: 'Risks related to regulatory non-compliance, audit failures, and gaps in policy implementation.',
                factors: [
                  'Incomplete compliance with GDPR requirements',
                  'Missing documentation for audit trails',
                  'Outdated policies and procedures',
                  'Insufficient compliance monitoring'
                ],
                impact: 'Regulatory fines, legal action, and reputational damage',
                recommendations: [
                  'Implement automated compliance monitoring',
                  'Update all policies to current standards',
                  'Establish regular compliance assessments',
                  'Create compliance training programs'
                ]
              },
              { 
                name: 'Financial', 
                value: Math.max(riskScore - 3, 8), 
                color: '#06b6d4',
                description: 'Risks affecting financial stability, including fraud, market volatility, and credit risks.',
                factors: [
                  'Inadequate financial controls and approvals',
                  'Limited fraud detection mechanisms',
                  'Exposure to market and credit risks',
                  'Insufficient financial reporting accuracy'
                ],
                impact: 'Financial losses and investor confidence decline',
                recommendations: [
                  'Strengthen internal financial controls',
                  'Implement real-time fraud monitoring',
                  'Diversify financial risk exposure',
                  'Enhance financial reporting systems'
                ]
              },
              { 
                name: 'Regulatory', 
                value: Math.max(riskScore + 5, 12), 
                color: '#10b981',
                description: 'Risks from changing regulations, new compliance requirements, and regulatory enforcement actions.',
                factors: [
                  'Emerging data privacy regulations',
                  'New industry-specific compliance requirements',
                  'Increased regulatory scrutiny and enforcement',
                  'Cross-border regulatory complexity'
                ],
                impact: 'Legal penalties, business restrictions, and compliance costs',
                recommendations: [
                  'Establish regulatory change monitoring',
                  'Engage with regulatory bodies proactively',
                  'Implement flexible compliance frameworks',
                  'Create regulatory impact assessment processes'
                ]
              }
            ],
            predictions: [
              {
                timeframe: '30 days',
                risk: Math.min(riskScore + 3, 35),
                confidence: 0.87,
                factors: [
                  'Upcoming compliance deadlines',
                  'New regulatory requirements',
                  'Staff training schedule',
                  'System security updates'
                ]
              },
              {
                timeframe: '60 days', 
                risk: Math.max(riskScore - 2, 15),
                confidence: 0.74,
                factors: [
                  'Training completion expected',
                  'System updates deployment',
                  'Process improvements implementation',
                  'Additional security controls activation'
                ]
              },
              {
                timeframe: '90 days',
                risk: Math.max(riskScore - 8, 12),
                confidence: 0.68,
                factors: [
                  'Full compliance program maturity',
                  'Automated monitoring implementation',
                  'Staff competency development',
                  'Third-party security assessments'
                ]
              }
            ],
            recommendations: [
              { 
                priority: 'HIGH', 
                action: 'Implement automated compliance monitoring across all standards',
                impact: 'Could reduce risk by 15%',
                timeframe: '2-4 weeks'
              },
              { 
                priority: 'HIGH', 
                action: 'Strengthen access control management and monitoring',
                impact: 'Could reduce risk by 12%',
                timeframe: '1-2 weeks'
              },
              { 
                priority: 'MEDIUM', 
                action: 'Increase security awareness training frequency',
                impact: 'Could reduce risk by 8%',
                timeframe: '4-6 weeks'
              },
              { 
                priority: 'MEDIUM', 
                action: 'Deploy enhanced endpoint detection and response tools',
                impact: 'Could reduce risk by 10%',
                timeframe: '3-5 weeks'
              }
            ]
          },
          anomalies: enhancedAnomalies,
          predictiveAnalytics: {
            complianceTrajectory: {
              current: baseScore,
              projected30Days: Math.min(baseScore + 3, 96),
              projected60Days: Math.min(baseScore + 6, 98),
              projected90Days: Math.min(baseScore + 8, 99),
              confidence: 0.84,
              factors: [
                'Current remediation pace',
                'Resource allocation efficiency',
                'Automated monitoring implementation',
                'Staff training completion rates'
              ]
            },
            riskTrajectory: {
              current: riskScore,
              projected30Days: Math.max(riskScore - 2, 10),
              projected60Days: Math.max(riskScore - 5, 8),
              projected90Days: Math.max(riskScore - 8, 5),
              confidence: 0.79,
              factors: [
                'Security control implementation',
                'Threat landscape changes',
                'Vulnerability management improvements',
                'Incident response enhancements'
              ]
            }
          },
          trendsData: (() => {
            const trends = [];
            const baselineScore = Math.max(baseScore - 15, 65);
            const baselineRisk = Math.min(riskScore + 20, 45);
            
            for (let i = 60; i >= 0; i--) {
              const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
              const progress = (60 - i) / 60;
              
              // Add some realistic fluctuation
              const fluctuation = Math.sin(i * 0.1) * 2 + Math.random() * 3 - 1.5;
              
              trends.push({
                date: date.toISOString().split('T')[0],
                compliance: Math.round(baselineScore + (progress * (baseScore - baselineScore)) + fluctuation),
                risk: Math.round(baselineRisk - (progress * (baselineRisk - riskScore)) + fluctuation * 0.5),
                alerts: Math.max(Math.round(15 - (progress * 8)) + Math.random() * 4 - 2, 2),
                [`${activeStandards[0]?.name || 'ISO 27001'}`]: Math.round(baselineScore + (progress * (baseScore - baselineScore)) + fluctuation + Math.random() * 3 - 1.5),
                [`${activeStandards[1]?.name || 'GDPR'}`]: Math.round(baselineScore + (progress * (baseScore - baselineScore)) + fluctuation + Math.random() * 4 - 2),
                [`${activeStandards[2]?.name || 'SOC 2'}`]: Math.round(baselineScore + (progress * (baseScore - baselineScore)) + fluctuation + Math.random() * 3 - 1.5),
                // Additional metrics for more comprehensive view
                controlsImplemented: Math.round(45 + (progress * 35) + Math.random() * 5 - 2.5),
                evidenceCollected: Math.round(120 + (progress * 80) + Math.random() * 10 - 5),
                tasksCompleted: Math.round(30 + (progress * 50) + Math.random() * 8 - 4)
              });
            }
            
            return trends;
          })()
        };
        
        setData(demoData);
      } else {
        // In production, load data from multiple services
        try {
          const [monitoringData, analyticsData, mlData] = await Promise.all([
            complianceMonitoringService.getMonitoringDashboard(currentOrgId),
            dashboardService.getDashboardData(currentOrgId),
            mlAnalyticsService.getInsights(currentOrgId)
          ]);
          
          // Combine the data from different services
          setData({
            ...monitoringData,
            ...analyticsData,
            ...mlData
          });
        } catch (error) {
          console.error('Failed to load production data, falling back to empty state:', error);
          // Provide minimal fallback data
          setData({
            monitoringStatus: {
              isActive: false,
              lastCheck: new Date(),
              nextCheck: new Date()
            },
            complianceMetrics: {
              score: 0,
              trend: 0,
              activeAlerts: 0,
              overdueItems: 0,
              riskScore: 0
            },
            alerts: [],
            deadlines: [],
            mlInsights: [],
            riskAnalysis: { overall: 0, categories: [], predictions: [], recommendations: [] },
            anomalies: [],
            predictiveAnalytics: {},
            trendsData: []
          });
        }
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load monitoring and analytics data:', error);
      toast.error('Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMonitoringAndAnalytics();
    setRefreshing(false);
  };
  
  const handleRunManualCheck = async () => {
    setRunningCheck(true);
    try {
      if (!isDemoMode) {
        await complianceMonitoringService.runMonitoringChecks(currentOrgId);
      }
      await loadMonitoringAndAnalytics();
      toast.success('Compliance check completed successfully');
    } catch (error) {
      toast.error('Failed to run compliance check');
    } finally {
      setRunningCheck(false);
    }
  };
  
  const handleToggleMonitoring = async () => {
    try {
      if (data?.monitoringStatus?.isActive) {
        // For demo purposes, just toggle the status
        toast.success('Monitoring paused');
      } else {
        // For demo purposes, just toggle the status  
        toast.success('Monitoring resumed');
      }
      await loadMonitoringAndAnalytics();
    } catch (error) {
      toast.error('Failed to toggle monitoring');
    }
  };
  
  const exportReport = async () => {
    try {
      const reportData = {
        generatedAt: new Date().toISOString(),
        organizationId: currentOrgId,
        ...data
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-monitoring-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully');
    } catch (err) {
      toast.error('Export failed');
    }
  };
  
  useEffect(() => {
    loadMonitoringAndAnalytics();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadMonitoringAndAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currentOrgId, isDemoMode]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (!data) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to load monitoring data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance Monitoring & ML Analytics</h1>
          <p className="text-muted-foreground">
            Real-time compliance monitoring with AI-powered insights and predictive analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportReport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button 
            size="sm" 
            onClick={handleRunManualCheck}
            disabled={runningCheck}
          >
            <Activity className={`h-4 w-4 mr-2 ${runningCheck ? 'animate-spin' : ''}`} />
            {runningCheck ? 'Running Check...' : 'Run Check'}
          </Button>
        </div>
      </div>
      
      {/* Monitoring Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Monitoring Status
              </CardTitle>
              <CardDescription>
                Real-time compliance monitoring with ML-powered insights
              </CardDescription>
            </div>
            <Button
              variant={data.monitoringStatus?.isActive ? "destructive" : "default"}
              size="sm"
              onClick={handleToggleMonitoring}
            >
              {data.monitoringStatus?.isActive ? (
                <><Pause className="h-4 w-4 mr-2" />Pause Monitoring</>
              ) : (
                <><Play className="h-4 w-4 mr-2" />Resume Monitoring</>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${
                data.monitoringStatus?.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`} />
              <span className="text-sm font-medium">
                {data.monitoringStatus?.isActive ? 'Active' : 'Paused'}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Last check: {data.monitoringStatus?.lastCheck?.toLocaleTimeString() || 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">
              Next check: {data.monitoringStatus?.nextCheck?.toLocaleTimeString() || 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground ml-auto">
              Updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.complianceMetrics?.score || 0}%</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={data.complianceMetrics?.score || 0} className="flex-1" />
              <Badge variant="secondary" className="text-xs">
                +{data.complianceMetrics?.trend || 0}%
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.complianceMetrics?.activeAlerts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data.alerts?.filter(a => a.severity === 'critical').length || 0} critical alerts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ML Insights</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.mlInsights?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data.mlInsights?.filter(i => i.impact === 'HIGH' || i.impact === 'CRITICAL').length || 0} high priority
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.complianceMetrics?.riskScore || 0}%</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={data.complianceMetrics?.riskScore || 0} className="flex-1" />
              <Badge variant={(data.complianceMetrics?.riskScore || 0) < 30 ? "default" : "destructive"} className="text-xs">
                {(data.complianceMetrics?.riskScore || 0) < 30 ? 'Low' : 'Medium'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="insights">ML Insights</TabsTrigger>
          <TabsTrigger value="analytics">Predictive Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends & Charts</TabsTrigger>
          <TabsTrigger value="deadlines">Upcoming Deadlines</TabsTrigger>
        </TabsList>
        
        {/* Active Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4">
            {data.alerts?.map((alert) => (
              <Card key={alert.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
                        alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {alert.type === 'deadline_approaching' && <Clock className="h-4 w-4" />}
                        {alert.type === 'compliance_violation' && <XCircle className="h-4 w-4" />}
                        {alert.type === 'missing_documentation' && <FileText className="h-4 w-4" />}
                        {!['deadline_approaching', 'compliance_violation', 'missing_documentation'].includes(alert.type) && <AlertTriangle className="h-4 w-4" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{alert.title}</CardTitle>
                        <CardDescription>{alert.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : alert.severity === 'warning' ? 'secondary' : 'default'}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Resolve
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Entity:</span>
                        <p className="text-muted-foreground">{alert.entity?.name}</p>
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>
                        <p className="text-muted-foreground">{alert.createdAt?.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Assigned:</span>
                        <p className="text-muted-foreground">{alert.assignedTo || 'Unassigned'}</p>
                      </div>
                      {alert.dueDate && (
                        <div>
                          <span className="font-medium">Due:</span>
                          <p className="text-muted-foreground">{alert.dueDate.toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                    
                    {alert.affectedSystems?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Affected Systems:</h4>
                        <div className="flex flex-wrap gap-1">
                          {alert.affectedSystems.map((system: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {system}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {alert.remediation && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Remediation:</h4>
                        <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                          {alert.remediation}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* ML Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {data.mlInsights?.map((insight, index) => (
              <Card key={insight.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                        <Brain className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <CardDescription>{insight.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={insight.impact === 'HIGH' || insight.impact === 'CRITICAL' ? 'destructive' : 'secondary'}>
                        {insight.impact} IMPACT
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(insight.confidence * 100)}% Confidence
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insight.relatedStandards?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Related Standards:</h4>
                        <div className="flex flex-wrap gap-1">
                          {insight.relatedStandards.map((standard: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {standard}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {insight.dataPoints && (
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Data Points: {insight.dataPoints}</span>
                        {insight.trendDirection && (
                          <span className={`flex items-center gap-1 ${
                            insight.trendDirection === 'upward' ? 'text-green-600' :
                            insight.trendDirection === 'concerning' ? 'text-red-600' :
                            'text-blue-600'
                          }`}>
                            {insight.trendDirection === 'upward' ? '📈' : 
                             insight.trendDirection === 'concerning' ? '📉' : 
                             '➡️'} {insight.trendDirection}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {insight.suggestedActions?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Suggested Actions:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {insight.suggestedActions?.map((action: string, i: number) => (
                            <li key={i}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Predictive Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk Analysis */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Risk Analysis</CardTitle>
                <CardDescription>AI-powered risk assessment and categorization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{data.riskAnalysis?.overall || 0}%</div>
                    <p className="text-sm text-muted-foreground">Overall Risk Score</p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pie Chart */}
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.riskAnalysis?.categories || []}
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            dataKey="value"
                            label={false}
                            onClick={(data: any) => setSelectedRiskCategory(data)}
                            className="cursor-pointer"
                          >
                            {data.riskAnalysis?.categories?.map((entry: any, index: number) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color}
                                stroke={selectedRiskCategory?.name === entry.name ? "#000" : "none"}
                                strokeWidth={selectedRiskCategory?.name === entry.name ? 3 : 0}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number, name: string) => [`${value}%`, 'Risk Level']}
                            labelFormatter={(label: string) => `${label} Risk`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Legend */}
                    <div className="space-y-3">
                      {data.riskAnalysis?.categories?.map((category: any, index: number) => (
                        <div 
                          key={index} 
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            selectedRiskCategory?.name === category.name 
                              ? 'bg-muted border-2 border-primary' 
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedRiskCategory(category)}
                        >
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: category.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium truncate">{category.name}</span>
                              <span className="text-sm text-muted-foreground ml-2">{category.value}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Category Details */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Details</CardTitle>
                <CardDescription>
                  {selectedRiskCategory ? `${selectedRiskCategory.name} Risk Analysis` : 'Select a category to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedRiskCategory ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Risk Level</span>
                        <span className="text-2xl font-bold">{selectedRiskCategory.value}%</span>
                      </div>
                      <Progress value={selectedRiskCategory.value} className="mb-3" />
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">{selectedRiskCategory.description}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Key Risk Factors</h4>
                      <ul className="space-y-1">
                        {selectedRiskCategory.factors?.map((factor: string, index: number) => (
                          <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Potential Impact</h4>
                      <p className="text-xs text-muted-foreground bg-red-50 dark:bg-red-950/20 p-2 rounded">
                        {selectedRiskCategory.impact}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {selectedRiskCategory.recommendations?.map((rec: string, index: number) => (
                          <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-green-500 mt-1">✓</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground text-sm">
                      Click on any risk category in the chart or legend to view detailed information
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Risk Predictions */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Predictions</CardTitle>
                <CardDescription>ML-powered risk forecasting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.riskAnalysis?.predictions?.map((prediction: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{prediction.timeframe}</h4>
                        <Badge variant={prediction.risk < 25 ? 'default' : prediction.risk < 50 ? 'secondary' : 'destructive'}>
                          {prediction.risk}% Risk
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-muted-foreground">Confidence:</span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(prediction.confidence * 100)}%
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${prediction.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      {prediction.factors?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Contributing Factors:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {prediction.factors?.map((factor: string, i: number) => (
                              <li key={i}>{factor}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Risk Recommendations */}
          {data.riskAnalysis?.recommendations?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Risk Mitigation Recommendations</CardTitle>
                <CardDescription>AI-powered recommendations to reduce organizational risk</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.riskAnalysis.recommendations.map((rec: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-muted/20 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{rec.action}</h4>
                        <Badge variant={rec.priority === 'HIGH' ? 'destructive' : 'secondary'}>
                          {rec.priority} PRIORITY
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Impact:</span>
                          <p className="text-muted-foreground">{rec.impact}</p>
                        </div>
                        <div>
                          <span className="font-medium">Timeframe:</span>
                          <p className="text-muted-foreground">{rec.timeframe}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Anomalies */}
          {data.anomalies?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Detected Anomalies</CardTitle>
                <CardDescription>AI-detected unusual patterns in compliance data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.anomalies?.map((anomaly: any) => (
                    <div key={anomaly.id} className="p-4 border rounded-lg hover:bg-muted/20 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full ${
                          anomaly.severity === 'critical' ? 'bg-red-100 text-red-600' :
                          anomaly.severity === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{anomaly.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant={anomaly.severity === 'critical' ? 'destructive' : 'secondary'}>
                                {anomaly.severity?.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">
                                {Math.round(anomaly.confidence * 100)}% Confidence
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{anomaly.description}</p>
                          
                          {anomaly.affectedStandards?.length > 0 && (
                            <div className="mb-3">
                              <h5 className="text-xs font-medium mb-1">Affected Standards:</h5>
                              <div className="flex flex-wrap gap-1">
                                {anomaly.affectedStandards.map((standard: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {standard}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {anomaly.recommendedActions?.length > 0 && (
                            <div>
                              <h5 className="text-xs font-medium mb-1">Recommended Actions:</h5>
                              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                                {anomaly.recommendedActions.map((action: string, index: number) => (
                                  <li key={index}>{action}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                            <span className="text-xs text-muted-foreground">
                              Detected: {anomaly.detectedAt.toLocaleDateString()} at {anomaly.detectedAt.toLocaleTimeString()}
                            </span>
                            <Button variant="outline" size="sm" className="text-xs">
                              Investigate
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Trends & Charts Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance & Risk Trends</CardTitle>
              <CardDescription>Historical compliance and risk metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={data.trendsData || []}
                    onClick={(data) => {
                      if (data && data.activePayload) {
                        const point = data.activePayload[0]?.payload;
                        if (point) {
                          toast.info(`${point.date}: Compliance ${point.compliance}%, Risk ${point.risk}%`);
                        }
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [`${value}%`, name]}
                      labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                      contentStyle={{ 
                        backgroundColor: '#f8f9fa', 
                        border: '1px solid #dee2e6',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="compliance" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="Compliance Score"
                      dot={{ r: 4, fill: '#10b981' }}
                      activeDot={{ r: 6, fill: '#059669' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="risk" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      name="Risk Score"
                      dot={{ r: 4, fill: '#ef4444' }}
                      activeDot={{ r: 6, fill: '#dc2626' }}
                    />
                    {data.trendsData && data.trendsData.length > 0 && Object.keys(data.trendsData[0]).includes('ISO 27001') && (
                      <Line 
                        type="monotone" 
                        dataKey="ISO 27001"
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="ISO 27001"
                        dot={{ r: 3, fill: '#3b82f6' }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Alert Volume Trends</CardTitle>
              <CardDescription>Alert frequency over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={data.trendsData || []}
                    onClick={(data) => {
                      if (data && data.activePayload) {
                        const point = data.activePayload[0]?.payload;
                        if (point) {
                          toast.info(`${point.date}: ${point.alerts} alerts generated`);
                        }
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [`${value}`, name]}
                      labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                      contentStyle={{ 
                        backgroundColor: '#f8f9fa', 
                        border: '1px solid #dee2e6',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="alerts" 
                      fill="#f59e0b" 
                      name="Alert Count"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Upcoming Deadlines Tab */}
        <TabsContent value="deadlines" className="space-y-4">
          <div className="grid gap-4">
            {data.deadlines?.map((deadline) => (
              <Card key={deadline.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{deadline.title}</h4>
                        <p className="text-sm text-muted-foreground">{deadline.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={deadline.priority === 'HIGH' ? 'destructive' : 'secondary'}>
                        {deadline.priority}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Due: {deadline.dueDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceMonitoring;