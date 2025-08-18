/**
 * AI System Monitoring Widget
 * Real-time monitoring widget for the admin dashboard
 * Displays system health, alerts, and performance metrics
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Clock,
  Shield,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { aiSystemMonitor, type SystemHealthStatus, type HealthLevel } from '@/services/monitoring/AISystemMonitor';

interface AISystemMonitoringWidgetProps {
  showDetailed?: boolean;
  refreshInterval?: number; // seconds
}

const AISystemMonitoringWidget: React.FC<AISystemMonitoringWidgetProps> = ({
  showDetailed = false,
  refreshInterval = 30
}) => {
  const [healthStatus, setHealthStatus] = useState<SystemHealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load system health data
  useEffect(() => {
    loadHealthData();
    
    const interval = setInterval(() => {
      loadHealthData();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadHealthData = async () => {
    try {
      setIsLoading(true);
      const health = await aiSystemMonitor.getSystemHealth();
      setHealthStatus(health);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthIcon = (level: HealthLevel) => {
    switch (level) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getHealthColor = (level: HealthLevel) => {
    switch (level) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (value: number, baseline: number = 0) => {
    if (value > baseline * 1.1) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < baseline * 0.9) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  if (isLoading && !healthStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            AI System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading system health...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!healthStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            AI System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Monitoring Unavailable</AlertTitle>
            <AlertDescription>
              Unable to load system health data. Please check the monitoring service.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const criticalIssues = healthStatus.issues.filter(issue => issue.severity === 'critical');
  const warningIssues = healthStatus.issues.filter(issue => issue.severity === 'high' || issue.severity === 'medium');

  return (
    <div className="space-y-4">
      {/* Overall Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              AI System Health
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={loadHealthData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Badge variant="outline" className={getHealthColor(healthStatus.overall)}>
                {healthStatus.overall.toUpperCase()}
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            Last updated: {lastRefresh.toLocaleTimeString()} • Uptime: {healthStatus.uptime.toFixed(1)}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Critical Alerts */}
          {criticalIssues.length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Critical Issues Detected</AlertTitle>
              <AlertDescription>
                {criticalIssues.length} critical issue{criticalIssues.length !== 1 ? 's' : ''} require immediate attention.
                <ul className="mt-2 space-y-1">
                  {criticalIssues.slice(0, 3).map((issue, index) => (
                    <li key={index} className="text-sm">• {issue.issue} ({issue.service})</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Service Status Grid */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {healthStatus.services.map((service) => (
              <div key={service.serviceName} className={`p-3 border rounded-lg ${getHealthColor(service.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getHealthIcon(service.status)}
                    <span className="font-medium text-sm capitalize">
                      {service.serviceName.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                  {service.alerts.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {service.alerts.length}
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Response</div>
                    <div className="font-medium">{service.responseTime}ms</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Success</div>
                    <div className="font-medium">{((1 - service.errorRate) * 100).toFixed(1)}%</div>
                  </div>
                </div>

                {showDetailed && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>CPU</span>
                      <span>{service.metrics.resourceUsage.cpuUsage}%</span>
                    </div>
                    <Progress value={service.metrics.resourceUsage.cpuUsage} className="h-1" />
                    
                    <div className="flex justify-between text-xs">
                      <span>Memory</span>
                      <span>{service.metrics.resourceUsage.memoryUsage}%</span>
                    </div>
                    <Progress value={service.metrics.resourceUsage.memoryUsage} className="h-1" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* System Metrics Summary */}
          {showDetailed && (
            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold">{healthStatus.services.length}</div>
                <div className="text-sm text-muted-foreground">Active Services</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-green-600">
                  {healthStatus.services.filter(s => s.status === 'healthy').length}
                </div>
                <div className="text-sm text-muted-foreground">Healthy</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-yellow-600">
                  {healthStatus.services.filter(s => s.status === 'warning').length}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div className="text-center p-3 border rounded">
                <div className="text-2xl font-bold text-red-600">
                  {healthStatus.services.filter(s => s.status === 'critical').length}
                </div>
                <div className="text-sm text-muted-foreground">Critical</div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {healthStatus.recommendations.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Recommendations
              </h4>
              <ul className="space-y-1">
                {healthStatus.recommendations.slice(0, 3).map((rec, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recent Alerts */}
          {warningIssues.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Warnings
              </h4>
              <div className="space-y-2">
                {warningIssues.slice(0, 2).map((issue, index) => (
                  <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <div className="font-medium text-yellow-800">{issue.service}</div>
                    <div className="text-yellow-700">{issue.issue}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AISystemMonitoringWidget;