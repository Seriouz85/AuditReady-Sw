import { reportError, reportMessage, setTag, setContext } from './sentry';
import { analytics } from './analytics';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertChannel = 'sentry' | 'email' | 'slack' | 'webhook' | 'console';

interface AlertConfig {
  id: string;
  name: string;
  description: string;
  severity: AlertSeverity;
  channels: AlertChannel[];
  enabled: boolean;
  throttle?: number; // Minimum time between alerts in milliseconds
  conditions?: AlertCondition[];
  metadata?: Record<string, any>;
}

interface AlertCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'contains';
  threshold: number | string;
  duration?: number; // Time window in milliseconds
}

interface Alert {
  id: string;
  configId: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  metadata: Record<string, any>;
  channels: AlertChannel[];
}

interface MetricThreshold {
  metric: string;
  value: number;
  threshold: number;
  operator: string;
  severity: AlertSeverity;
}

class AlertingService {
  private alertConfigs: Map<string, AlertConfig> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();
  private alertHistory: Alert[] = [];
  private throttleTracker: Map<string, number> = new Map();
  private metricBuffer: Map<string, { value: number; timestamp: number }[]> = new Map();
  private maxHistorySize = 1000;
  private webhookEndpoints: Map<string, string> = new Map();

  constructor() {
    this.initializeDefaultAlerts();
    this.startMetricCollection();
  }

  private initializeDefaultAlerts(): void {
    // Performance alerts
    this.registerAlert({
      id: 'high-error-rate',
      name: 'High Error Rate',
      description: 'Error rate exceeds threshold',
      severity: 'high',
      channels: ['sentry', 'console'],
      enabled: true,
      throttle: 300000, // 5 minutes
      conditions: [
        {
          metric: 'error_rate',
          operator: 'gt',
          threshold: 5, // 5% error rate
          duration: 60000 // Over 1 minute
        }
      ]
    });

    this.registerAlert({
      id: 'slow-response-time',
      name: 'Slow Response Time',
      description: 'API response time is degraded',
      severity: 'medium',
      channels: ['console'],
      enabled: true,
      throttle: 600000, // 10 minutes
      conditions: [
        {
          metric: 'avg_response_time',
          operator: 'gt',
          threshold: 2000, // 2 seconds
          duration: 120000 // Over 2 minutes
        }
      ]
    });

    // Security alerts
    this.registerAlert({
      id: 'failed-authentication',
      name: 'Multiple Failed Authentication Attempts',
      description: 'High number of failed authentication attempts detected',
      severity: 'high',
      channels: ['sentry', 'console'],
      enabled: true,
      throttle: 300000,
      conditions: [
        {
          metric: 'auth_failures',
          operator: 'gt',
          threshold: 10,
          duration: 300000 // Over 5 minutes
        }
      ]
    });

    // Business alerts
    this.registerAlert({
      id: 'low-compliance-score',
      name: 'Low Compliance Score',
      description: 'Organization compliance score has dropped significantly',
      severity: 'medium',
      channels: ['console'],
      enabled: true,
      throttle: 3600000, // 1 hour
      conditions: [
        {
          metric: 'compliance_score',
          operator: 'lt',
          threshold: 70 // Below 70%
        }
      ]
    });

    // Infrastructure alerts
    this.registerAlert({
      id: 'high-memory-usage',
      name: 'High Memory Usage',
      description: 'Memory usage is critically high',
      severity: 'critical',
      channels: ['sentry', 'console'],
      enabled: true,
      throttle: 180000, // 3 minutes
      conditions: [
        {
          metric: 'memory_usage_percent',
          operator: 'gt',
          threshold: 90
        }
      ]
    });

    this.registerAlert({
      id: 'cache-miss-rate',
      name: 'High Cache Miss Rate',
      description: 'Cache performance is degraded',
      severity: 'low',
      channels: ['console'],
      enabled: true,
      throttle: 1800000, // 30 minutes
      conditions: [
        {
          metric: 'cache_miss_rate',
          operator: 'gt',
          threshold: 80 // 80% miss rate
        }
      ]
    });
  }

  private startMetricCollection(): void {
    // Collect metrics every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);

    // Clean up old metrics every 10 minutes
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 600000);
  }

  private async collectSystemMetrics(): Promise<void> {
    try {
      // Memory usage
      if (typeof performance !== 'undefined' && (performance as any).memory) {
        const memory = (performance as any).memory;
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        this.recordMetric('memory_usage_percent', usagePercent);
      }

      // Cache metrics (if cache service is available)
      try {
        const { cacheService } = await import('@/lib/cache/cacheService');
        const stats = cacheService.getStats();
        const missRate = (stats.redis.misses / (stats.redis.hits + stats.redis.misses)) * 100;
        this.recordMetric('cache_miss_rate', missRate || 0);
      } catch (error) {
        // Cache service not available
      }

      // Network performance
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          this.recordMetric('network_downlink', connection.downlink || 0);
          this.recordMetric('network_rtt', connection.rtt || 0);
        }
      }

    } catch (error) {
      console.warn('Failed to collect system metrics:', error);
    }
  }

  private cleanupOldMetrics(): void {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
    
    for (const [metric, values] of this.metricBuffer.entries()) {
      const filtered = values.filter(v => v.timestamp > cutoff);
      if (filtered.length === 0) {
        this.metricBuffer.delete(metric);
      } else {
        this.metricBuffer.set(metric, filtered);
      }
    }
  }

  registerAlert(config: AlertConfig): void {
    this.alertConfigs.set(config.id, config);
    analytics.track('alert_registered', {
      alert_id: config.id,
      severity: config.severity,
      channels: config.channels.length
    });
  }

  unregisterAlert(alertId: string): void {
    this.alertConfigs.delete(alertId);
    // Resolve any active alerts for this config
    for (const [id, alert] of this.activeAlerts.entries()) {
      if (alert.configId === alertId) {
        this.resolveAlert(id);
      }
    }
  }

  updateAlert(alertId: string, updates: Partial<AlertConfig>): void {
    const existing = this.alertConfigs.get(alertId);
    if (existing) {
      this.alertConfigs.set(alertId, { ...existing, ...updates });
    }
  }

  recordMetric(metric: string, value: number, timestamp?: Date): void {
    const ts = timestamp?.getTime() || Date.now();
    
    if (!this.metricBuffer.has(metric)) {
      this.metricBuffer.set(metric, []);
    }
    
    const buffer = this.metricBuffer.get(metric)!;
    buffer.push({ value, timestamp: ts });
    
    // Keep only last 1000 data points
    if (buffer.length > 1000) {
      buffer.splice(0, buffer.length - 1000);
    }
    
    // Check for threshold breaches
    this.checkThresholds(metric, value);
  }

  recordEvent(event: string, metadata: Record<string, any> = {}): void {
    // Record as a metric with value 1
    this.recordMetric(`event_${event}`, 1);
    
    // Track in analytics
    analytics.track('custom_event', {
      event_name: event,
      ...metadata
    });

    // Check for event-based alerts
    this.checkEventAlerts(event, metadata);
  }

  private checkThresholds(metric: string, value: number): void {
    for (const [configId, config] of this.alertConfigs.entries()) {
      if (!config.enabled || !config.conditions) continue;

      for (const condition of config.conditions) {
        if (condition.metric === metric) {
          const breached = this.evaluateCondition(condition, value);
          
          if (breached) {
            this.triggerAlert(configId, {
              metric,
              value,
              threshold: condition.threshold,
              operator: condition.operator,
              severity: config.severity
            });
          }
        }
      }
    }
  }

  private checkEventAlerts(event: string, metadata: Record<string, any>): void {
    // Check for authentication failure patterns
    if (event === 'auth_failure') {
      const recentFailures = this.getMetricValues('event_auth_failure', 300000); // 5 minutes
      const failureCount = recentFailures.length;
      
      if (failureCount >= 10) {
        this.triggerAlert('failed-authentication', {
          event,
          failure_count: failureCount,
          metadata
        });
      }
    }

    // Check for error patterns
    if (event === 'error' && metadata.severity === 'high') {
      this.triggerAlert('high-error-rate', {
        event,
        error_details: metadata
      });
    }
  }

  private evaluateCondition(condition: AlertCondition, value: number): boolean {
    const threshold = typeof condition.threshold === 'number' 
      ? condition.threshold 
      : parseFloat(condition.threshold.toString());

    switch (condition.operator) {
      case 'gt': return value > threshold;
      case 'lt': return value < threshold;
      case 'eq': return value === threshold;
      case 'gte': return value >= threshold;
      case 'lte': return value <= threshold;
      default: return false;
    }
  }

  private triggerAlert(configId: string, context: Record<string, any>): void {
    const config = this.alertConfigs.get(configId);
    if (!config) return;

    // Check throttling
    const lastTriggered = this.throttleTracker.get(configId);
    const now = Date.now();
    
    if (config.throttle && lastTriggered && (now - lastTriggered) < config.throttle) {
      return; // Throttled
    }

    this.throttleTracker.set(configId, now);

    const alert: Alert = {
      id: `${configId}_${now}`,
      configId,
      severity: config.severity,
      title: config.name,
      message: this.formatAlertMessage(config, context),
      timestamp: new Date(),
      resolved: false,
      metadata: { ...config.metadata, ...context },
      channels: config.channels
    };

    this.activeAlerts.set(alert.id, alert);
    this.addToHistory(alert);
    this.sendAlert(alert);

    analytics.track('alert_triggered', {
      alert_id: alert.id,
      config_id: configId,
      severity: alert.severity,
      channels: alert.channels.length
    });
  }

  private formatAlertMessage(config: AlertConfig, context: Record<string, any>): string {
    let message = config.description;
    
    if (context.metric && context.value && context.threshold) {
      message += ` | ${context.metric}: ${context.value} ${context.operator} ${context.threshold}`;
    }
    
    if (context.error_details) {
      message += ` | Error: ${context.error_details.message || 'Unknown error'}`;
    }
    
    return message;
  }

  private async sendAlert(alert: Alert): Promise<void> {
    const promises = alert.channels.map(channel => this.sendToChannel(alert, channel));
    await Promise.allSettled(promises);
  }

  private async sendToChannel(alert: Alert, channel: AlertChannel): Promise<void> {
    try {
      switch (channel) {
        case 'sentry':
          await this.sendToSentry(alert);
          break;
        case 'console':
          this.sendToConsole(alert);
          break;
        case 'webhook':
          await this.sendToWebhook(alert);
          break;
        case 'email':
          // Email integration would go here
          console.log('Email alerts not implemented yet');
          break;
        case 'slack':
          // Slack integration would go here
          console.log('Slack alerts not implemented yet');
          break;
        default:
          console.warn(`Unknown alert channel: ${channel}`);
      }
    } catch (error) {
      console.error(`Failed to send alert to ${channel}:`, error);
    }
  }

  private async sendToSentry(alert: Alert): Promise<void> {
    setTag('alert_severity', alert.severity);
    setContext('alert', {
      id: alert.id,
      config_id: alert.configId,
      timestamp: alert.timestamp.toISOString(),
      metadata: alert.metadata
    });

    if (alert.severity === 'critical' || alert.severity === 'high') {
      reportError(new Error(alert.message), alert.metadata, 'error');
    } else {
      reportMessage(alert.message, 'warning', alert.metadata);
    }
  }

  private sendToConsole(alert: Alert): void {
    const timestamp = alert.timestamp.toISOString();
    const severity = alert.severity.toUpperCase();
    
    const logMethod = alert.severity === 'critical' || alert.severity === 'high' 
      ? console.error 
      : alert.severity === 'medium' 
      ? console.warn 
      : console.log;

    logMethod(`[ALERT ${severity}] ${timestamp} - ${alert.title}: ${alert.message}`, alert.metadata);
  }

  private async sendToWebhook(alert: Alert): Promise<void> {
    const webhookUrl = this.webhookEndpoints.get('default');
    if (!webhookUrl) return;

    const payload = {
      alert_id: alert.id,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      timestamp: alert.timestamp.toISOString(),
      metadata: alert.metadata
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  }

  resolveAlert(alertId: string): void {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      this.activeAlerts.delete(alertId);
      
      analytics.track('alert_resolved', {
        alert_id: alertId,
        config_id: alert.configId,
        duration: Date.now() - alert.timestamp.getTime()
      });
    }
  }

  resolveAlertsByConfig(configId: string): number {
    let resolved = 0;
    
    for (const [id, alert] of this.activeAlerts.entries()) {
      if (alert.configId === configId) {
        this.resolveAlert(id);
        resolved++;
      }
    }
    
    return resolved;
  }

  private addToHistory(alert: Alert): void {
    this.alertHistory.push(alert);
    
    // Keep only recent history
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory.splice(0, this.alertHistory.length - this.maxHistorySize);
    }
  }

  private getMetricValues(metric: string, duration?: number): number[] {
    const buffer = this.metricBuffer.get(metric);
    if (!buffer) return [];
    
    if (!duration) return buffer.map(v => v.value);
    
    const cutoff = Date.now() - duration;
    return buffer
      .filter(v => v.timestamp >= cutoff)
      .map(v => v.value);
  }

  getMetricStatistics(metric: string, duration?: number): {
    count: number;
    min: number;
    max: number;
    avg: number;
    sum: number;
  } | null {
    const values = this.getMetricValues(metric, duration);
    if (values.length === 0) return null;
    
    const sum = values.reduce((a, b) => a + b, 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = sum / values.length;
    
    return { count: values.length, min, max, avg, sum };
  }

  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values());
  }

  getAlertHistory(limit?: number): Alert[] {
    const history = [...this.alertHistory].reverse(); // Most recent first
    return limit ? history.slice(0, limit) : history;
  }

  getAlertsByConfig(configId: string): Alert[] {
    return this.alertHistory.filter(alert => alert.configId === configId);
  }

  getAlertConfig(alertId: string): AlertConfig | undefined {
    return this.alertConfigs.get(alertId);
  }

  getAllAlertConfigs(): AlertConfig[] {
    return Array.from(this.alertConfigs.values());
  }

  configureWebhook(name: string, url: string): void {
    this.webhookEndpoints.set(name, url);
  }

  getMetrics(): {
    activeAlerts: number;
    totalAlerts: number;
    alertsByConfig: Record<string, number>;
    alertsBySeverity: Record<AlertSeverity, number>;
    recentMetrics: Record<string, number>;
  } {
    const alertsByConfig: Record<string, number> = {};
    const alertsBySeverity: Record<AlertSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    for (const alert of this.alertHistory) {
      alertsByConfig[alert.configId] = (alertsByConfig[alert.configId] || 0) + 1;
      alertsBySeverity[alert.severity]++;
    }

    const recentMetrics: Record<string, number> = {};
    for (const [metric, buffer] of this.metricBuffer.entries()) {
      if (buffer.length > 0) {
        recentMetrics[metric] = buffer[buffer.length - 1].value;
      }
    }

    return {
      activeAlerts: this.activeAlerts.size,
      totalAlerts: this.alertHistory.length,
      alertsByConfig,
      alertsBySeverity,
      recentMetrics
    };
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  }> {
    const metrics = this.getMetrics();
    const criticalAlerts = metrics.alertsBySeverity.critical;
    const highAlerts = metrics.alertsBySeverity.high;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (criticalAlerts > 0) {
      status = 'unhealthy';
    } else if (highAlerts > 3 || metrics.activeAlerts > 10) {
      status = 'degraded';
    }

    return {
      status,
      details: {
        active_alerts: metrics.activeAlerts,
        critical_alerts: criticalAlerts,
        high_alerts: highAlerts,
        configured_alerts: this.alertConfigs.size,
        recent_metrics_count: Object.keys(metrics.recentMetrics).length
      }
    };
  }
}

// Create singleton instance
export const alertingService = new AlertingService();

// Helper functions for common alert scenarios
export const alertHelpers = {
  recordAPICall: (endpoint: string, duration: number, status: number) => {
    alertingService.recordMetric('api_response_time', duration);
    alertingService.recordMetric('api_call_count', 1);
    
    if (status >= 400) {
      alertingService.recordEvent('api_error', {
        endpoint,
        status,
        duration
      });
    }
  },

  recordAuthEvent: (event: 'success' | 'failure', metadata: Record<string, any> = {}) => {
    alertingService.recordEvent(`auth_${event}`, metadata);
    
    if (event === 'failure') {
      alertingService.recordMetric('auth_failure_count', 1);
    }
  },

  recordBusinessMetric: (metric: string, value: number) => {
    alertingService.recordMetric(metric, value);
  },

  recordError: (error: Error, context: Record<string, any> = {}) => {
    alertingService.recordEvent('error', {
      message: error.message,
      stack: error.stack,
      severity: 'high',
      ...context
    });
  }
};

export default alertingService;