import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  FileText,
  Users,
  Target,
  Sparkles,
  BarChart3,
  BookOpen,
  Settings,
  RefreshCw
} from 'lucide-react';
import { ComplianceService, type ComplianceStats, type FrameworkStatus, type ComplianceActivity } from '@/services/admin/ComplianceService';
import { formatDistanceToNow } from 'date-fns';

interface ComplianceManagementProps {
  loading: boolean;
}

export const ComplianceManagement: React.FC<ComplianceManagementProps> = ({
  loading: parentLoading
}) => {
  const [stats, setStats] = useState<ComplianceStats | null>(null);
  const [frameworks, setFrameworks] = useState<FrameworkStatus[]>([]);
  const [activities, setActivities] = useState<ComplianceActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const loadComplianceData = async () => {
    setLoading(true);
    try {
      const [statsData, frameworksData, activitiesData] = await Promise.all([
        ComplianceService.getComplianceStats(),
        ComplianceService.getFrameworkStatus(),
        ComplianceService.getRecentActivities(10)
      ]);

      setStats(statsData);
      setFrameworks(frameworksData);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error loading compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplianceData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', badge: 'bg-green-100 text-green-800' };
      case 'good': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800' };
      case 'needs_work': return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800' };
      case 'critical': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-100 text-red-800' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-800' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'good':
        return <CheckCircle className="w-5 h-5" />;
      case 'needs_work':
      case 'critical':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assessment': return <CheckCircle className="w-5 h-5" />;
      case 'policy': return <FileText className="w-5 h-5" />;
      case 'risk': return <AlertTriangle className="w-5 h-5" />;
      case 'training': return <Users className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'assessment': return 'bg-green-50 text-green-600';
      case 'policy': return 'bg-blue-50 text-blue-600';
      case 'risk': return 'bg-yellow-50 text-yellow-600';
      case 'training': return 'bg-purple-50 text-purple-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  if (loading || parentLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Compliance Dashboard
            </h2>
            <p className="text-muted-foreground mt-2">Monitor compliance status and assessment progress</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            Compliance Dashboard
          </h2>
          <p className="text-muted-foreground mt-2">Monitor compliance status and assessment progress</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadComplianceData}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {stats && stats.averageComplianceRate >= 75 && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Compliance Tracking Active
            </Badge>
          )}
        </div>
      </div>

      {/* Compliance Stats */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Active Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{stats.activeAssessments}</div>
              <div className="flex items-center mt-2 text-sm text-blue-600">
                <Activity className="w-4 h-4 mr-1" />
                In progress
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{stats.completedAssessments}</div>
              <div className="flex items-center mt-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                Assessments
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Compliance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-900">
                {stats.averageComplianceRate > 0 ? `${stats.averageComplianceRate.toFixed(1)}%` : 'N/A'}
              </div>
              <div className="flex items-center mt-2 text-sm text-yellow-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                {stats.averageComplianceRate > 0 ? 'Average score' : 'No data yet'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Risk Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{stats.riskItems}</div>
              <div className="flex items-center mt-2 text-sm text-purple-600">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {stats.riskItems > 0 ? 'Need attention' : 'All clear'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Compliance Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Framework Status
            </CardTitle>
            <CardDescription>Compliance status by framework</CardDescription>
          </CardHeader>
          <CardContent>
            {frameworks.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No frameworks configured yet</p>
                <p className="text-sm text-gray-400 mt-1">Add standards in the Standards tab to see compliance data</p>
              </div>
            ) : (
              <div className="space-y-4">
                {frameworks.map((framework) => {
                  const colors = getStatusColor(framework.status);
                  return (
                    <div key={framework.id} className={`flex items-center justify-between p-3 ${colors.bg} rounded-lg border ${colors.border}`}>
                      <div className="flex items-center space-x-3">
                        <div className={colors.text}>
                          {getStatusIcon(framework.status)}
                        </div>
                        <div>
                          <div className="font-medium">{framework.name}</div>
                          <div className="text-sm text-gray-500">
                            {framework.description || 'No description'}
                            {framework.assessmentCount > 0 && ` • ${framework.assessmentCount} assessments`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={colors.badge}>
                          {framework.complianceRate > 0 ? `${framework.complianceRate.toFixed(0)}%` : 'N/A'}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1 capitalize">
                          {framework.status.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest compliance activities</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400 mt-1">Activities will appear here as work progresses</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.slice(0, 4).map((activity) => (
                  <div key={activity.id} className={`flex items-center space-x-3 p-3 ${getActivityColor(activity.type)} rounded-lg`}>
                    <div>{getActivityIcon(activity.type)}</div>
                    <div className="flex-1">
                      <div className="font-medium">{activity.title}</div>
                      <div className="text-sm text-gray-500">{activity.description}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Compliance Tools */}
      <Card className="bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <Sparkles className="w-5 h-5 mr-2" />
            Compliance Management Tools
          </CardTitle>
          <CardDescription>Tools for managing compliance assessments and frameworks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-16 flex-col border-blue-200 text-blue-700 hover:bg-blue-50">
              <BarChart3 className="w-5 h-5 mb-1" />
              <span className="text-sm">Reports</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col border-blue-200 text-blue-700 hover:bg-blue-50">
              <BookOpen className="w-5 h-5 mb-1" />
              <span className="text-sm">Frameworks</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col border-blue-200 text-blue-700 hover:bg-blue-50">
              <Target className="w-5 h-5 mb-1" />
              <span className="text-sm">Assessments</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col border-blue-200 text-blue-700 hover:bg-blue-50">
              <Settings className="w-5 h-5 mb-1" />
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
