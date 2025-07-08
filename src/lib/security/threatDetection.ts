import { reportError, addBreadcrumb, setTag } from '@/lib/monitoring/sentry';
import { analytics } from '@/lib/monitoring/analytics';
import { alertingService } from '@/lib/monitoring/alerting';

export type ThreatLevel = 'low' | 'medium' | 'high' | 'critical';
export type ThreatType = 
  | 'brute_force' 
  | 'sql_injection' 
  | 'xss_attempt' 
  | 'csrf_attempt'
  | 'unusual_activity'
  | 'account_takeover'
  | 'data_exfiltration'
  | 'privilege_escalation'
  | 'suspicious_login'
  | 'rate_limit_abuse';

interface ThreatEvent {
  id: string;
  type: ThreatType;
  level: ThreatLevel;
  timestamp: Date;
  sourceIP: string;
  userAgent: string;
  userId?: string;
  organizationId?: string;
  details: Record<string, any>;
  blocked: boolean;
  resolved: boolean;
}

interface ThreatRule {
  id: string;
  name: string;
  type: ThreatType;
  enabled: boolean;
  threshold: number;
  timeWindow: number; // in milliseconds
  action: 'log' | 'block' | 'challenge';
  severity: ThreatLevel;
  conditions: ThreatCondition[];
}

interface ThreatCondition {
  field: string;
  operator: 'eq' | 'gt' | 'lt' | 'contains' | 'regex' | 'in';
  value: any;
}

interface SecurityMetrics {
  totalThreats: number;
  blockedThreats: number;
  threatsByType: Record<ThreatType, number>;
  threatsByLevel: Record<ThreatLevel, number>;
  recentActivity: ThreatEvent[];
}

class ThreatDetectionService {
  private threatEvents: Map<string, ThreatEvent> = new Map();
  private threatRules: Map<string, ThreatRule> = new Map();
  private ipActivityTracker: Map<string, Array<{ timestamp: number; action: string }>> = new Map();
  private userActivityTracker: Map<string, Array<{ timestamp: number; action: string; ip: string }>> = new Map();
  private blockedIPs: Set<string> = new Set();
  private suspiciousIPs: Map<string, { level: number; lastActivity: number }> = new Map();
  private maxEventHistory = 10000;

  constructor() {
    this.initializeDefaultRules();
    this.startCleanupTasks();
  }

  private initializeDefaultRules(): void {
    // Brute force detection
    this.addRule({
      id: 'brute-force-login',
      name: 'Brute Force Login Attempts',
      type: 'brute_force',
      enabled: true,
      threshold: 5,
      timeWindow: 300000, // 5 minutes
      action: 'block',
      severity: 'high',
      conditions: [
        { field: 'action', operator: 'eq', value: 'login_failed' },
        { field: 'endpoint', operator: 'contains', value: '/auth/login' }
      ]
    });

    // SQL injection detection
    this.addRule({
      id: 'sql-injection',
      name: 'SQL Injection Attempt',
      type: 'sql_injection',
      enabled: true,
      threshold: 1,
      timeWindow: 60000, // 1 minute
      action: 'block',
      severity: 'critical',
      conditions: [
        { field: 'payload', operator: 'regex', value: /(union|select|insert|update|delete|drop|create|alter|exec|script)/i }
      ]
    });

    // XSS detection
    this.addRule({
      id: 'xss-attempt',
      name: 'Cross-Site Scripting Attempt',
      type: 'xss_attempt',
      enabled: true,
      threshold: 1,
      timeWindow: 60000,
      action: 'block',
      severity: 'high',
      conditions: [
        { field: 'payload', operator: 'regex', value: /<script|javascript:|data:text\/html|vbscript:|onload=|onerror=/i }
      ]
    });

    // Rate limiting abuse
    this.addRule({
      id: 'rate-limit-abuse',
      name: 'Rate Limit Abuse',
      type: 'rate_limit_abuse',
      enabled: true,
      threshold: 100,
      timeWindow: 60000, // 1 minute
      action: 'challenge',
      severity: 'medium',
      conditions: [
        { field: 'method', operator: 'in', value: ['POST', 'PUT', 'DELETE'] }
      ]
    });

    // Unusual login patterns
    this.addRule({
      id: 'suspicious-login',
      name: 'Suspicious Login Pattern',
      type: 'suspicious_login',
      enabled: true,
      threshold: 1,
      timeWindow: 300000, // 5 minutes
      action: 'challenge',
      severity: 'medium',
      conditions: [
        { field: 'action', operator: 'eq', value: 'login_success' },
        { field: 'location_change', operator: 'eq', value: true }
      ]
    });

    // Data exfiltration detection
    this.addRule({
      id: 'data-exfiltration',
      name: 'Potential Data Exfiltration',
      type: 'data_exfiltration',
      enabled: true,
      threshold: 50,
      timeWindow: 600000, // 10 minutes
      action: 'log',
      severity: 'high',
      conditions: [
        { field: 'endpoint', operator: 'contains', value: '/api/export' },
        { field: 'data_volume', operator: 'gt', value: 1000000 } // 1MB
      ]
    });

    // Privilege escalation
    this.addRule({
      id: 'privilege-escalation',
      name: 'Privilege Escalation Attempt',
      type: 'privilege_escalation',
      enabled: true,
      threshold: 1,
      timeWindow: 60000,
      action: 'block',
      severity: 'critical',
      conditions: [
        { field: 'action', operator: 'eq', value: 'role_change' },
        { field: 'target_role', operator: 'in', value: ['admin', 'owner'] }
      ]
    });
  }

  private startCleanupTasks(): void {
    // Clean up old events every hour
    setInterval(() => {
      this.cleanupOldEvents();
    }, 3600000);

    // Clean up tracking data every 30 minutes
    setInterval(() => {
      this.cleanupTrackingData();
    }, 1800000);

    // Review blocked IPs every 24 hours
    setInterval(() => {
      this.reviewBlockedIPs();
    }, 86400000);
  }

  addRule(rule: ThreatRule): void {
    this.threatRules.set(rule.id, rule);
    
    analytics.track('threat_rule_added', {
      rule_id: rule.id,
      type: rule.type,
      severity: rule.severity
    });
  }

  removeRule(ruleId: string): void {
    this.threatRules.delete(ruleId);
    
    analytics.track('threat_rule_removed', {
      rule_id: ruleId
    });
  }

  updateRule(ruleId: string, updates: Partial<ThreatRule>): void {
    const existing = this.threatRules.get(ruleId);
    if (existing) {
      this.threatRules.set(ruleId, { ...existing, ...updates });
    }
  }

  analyzeRequest(requestData: {
    ip: string;
    userAgent: string;
    method: string;
    endpoint: string;
    payload?: any;
    headers?: Record<string, string>;
    userId?: string;
    organizationId?: string;
    timestamp?: Date;
  }): { allowed: boolean; threats: ThreatEvent[]; action?: string } {
    const timestamp = requestData.timestamp || new Date();
    const threats: ThreatEvent[] = [];
    let blocked = false;
    let challengeRequired = false;

    // Check if IP is already blocked
    if (this.blockedIPs.has(requestData.ip)) {
      blocked = true;
      const threat = this.createThreatEvent({
        type: 'unusual_activity',
        level: 'high',
        sourceIP: requestData.ip,
        userAgent: requestData.userAgent,
        userId: requestData.userId,
        organizationId: requestData.organizationId,
        details: { reason: 'ip_blocked', endpoint: requestData.endpoint },
        blocked: true,
        timestamp
      });
      threats.push(threat);
    }

    // Track activity
    this.trackActivity(requestData.ip, requestData.endpoint, requestData.userId);

    // Apply threat detection rules
    for (const rule of this.threatRules.values()) {
      if (!rule.enabled) continue;

      const ruleMatched = this.evaluateRule(rule, requestData, timestamp);
      
      if (ruleMatched) {
        const threat = this.createThreatEvent({
          type: rule.type,
          level: rule.severity,
          sourceIP: requestData.ip,
          userAgent: requestData.userAgent,
          userId: requestData.userId,
          organizationId: requestData.organizationId,
          details: {
            rule_id: rule.id,
            rule_name: rule.name,
            endpoint: requestData.endpoint,
            method: requestData.method,
            payload: this.sanitizePayload(requestData.payload)
          },
          blocked: rule.action === 'block',
          timestamp
        });

        threats.push(threat);

        // Apply rule action
        switch (rule.action) {
          case 'block':
            blocked = true;
            this.blockIP(requestData.ip, rule.severity);
            break;
          case 'challenge':
            challengeRequired = true;
            break;
          case 'log':
            // Just log, already handled by creating threat event
            break;
        }

        // Alert for high/critical threats
        if (rule.severity === 'high' || rule.severity === 'critical') {
          this.triggerSecurityAlert(threat);
        }
      }
    }

    // Additional behavioral analysis
    const behavioralThreat = this.performBehavioralAnalysis(requestData, timestamp);
    if (behavioralThreat) {
      threats.push(behavioralThreat);
      if (behavioralThreat.level === 'critical' || behavioralThreat.level === 'high') {
        challengeRequired = true;
      }
    }

    // Store threat events
    threats.forEach(threat => {
      this.threatEvents.set(threat.id, threat);
      this.notifyThreatDetected(threat);
    });

    return {
      allowed: !blocked,
      threats,
      action: blocked ? 'block' : challengeRequired ? 'challenge' : 'allow'
    };
  }

  private evaluateRule(rule: ThreatRule, requestData: any, timestamp: Date): boolean {
    // Count recent events for this rule
    const recentEvents = this.getRecentEvents(rule.type, rule.timeWindow);
    
    // Check if threshold is exceeded
    if (recentEvents.length >= rule.threshold) {
      return true;
    }

    // Evaluate rule conditions
    return rule.conditions.every(condition => 
      this.evaluateCondition(condition, requestData)
    );
  }

  private evaluateCondition(condition: ThreatCondition, data: any): boolean {
    const value = this.getNestedValue(data, condition.field);
    
    switch (condition.operator) {
      case 'eq':
        return value === condition.value;
      case 'gt':
        return Number(value) > Number(condition.value);
      case 'lt':
        return Number(value) < Number(condition.value);
      case 'contains':
        return String(value).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'regex':
        return condition.value.test(String(value));
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);
      default:
        return false;
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private performBehavioralAnalysis(requestData: any, timestamp: Date): ThreatEvent | null {
    const { ip, userId, endpoint, method } = requestData;

    // Analyze IP behavior
    const ipActivity = this.ipActivityTracker.get(ip) || [];
    const recentIpActivity = ipActivity.filter(
      a => timestamp.getTime() - a.timestamp < 300000 // 5 minutes
    );

    // Detect rapid requests from same IP
    if (recentIpActivity.length > 50) {
      return this.createThreatEvent({
        type: 'unusual_activity',
        level: 'medium',
        sourceIP: ip,
        userAgent: requestData.userAgent,
        userId,
        organizationId: requestData.organizationId,
        details: {
          reason: 'rapid_requests',
          request_count: recentIpActivity.length,
          endpoint
        },
        blocked: false,
        timestamp
      });
    }

    // Analyze user behavior if authenticated
    if (userId) {
      const userActivity = this.userActivityTracker.get(userId) || [];
      const recentUserActivity = userActivity.filter(
        a => timestamp.getTime() - a.timestamp < 3600000 // 1 hour
      );

      // Detect multiple IPs for same user
      const uniqueIPs = new Set(recentUserActivity.map(a => a.ip));
      if (uniqueIPs.size > 3) {
        return this.createThreatEvent({
          type: 'account_takeover',
          level: 'high',
          sourceIP: ip,
          userAgent: requestData.userAgent,
          userId,
          organizationId: requestData.organizationId,
          details: {
            reason: 'multiple_ips',
            unique_ips: uniqueIPs.size,
            ips: Array.from(uniqueIPs)
          },
          blocked: false,
          timestamp
        });
      }

      // Detect unusual access patterns
      const adminEndpoints = recentUserActivity.filter(
        a => a.action.includes('/admin') || a.action.includes('/api/admin')
      );
      
      if (adminEndpoints.length > 10 && endpoint.includes('/admin')) {
        return this.createThreatEvent({
          type: 'privilege_escalation',
          level: 'medium',
          sourceIP: ip,
          userAgent: requestData.userAgent,
          userId,
          organizationId: requestData.organizationId,
          details: {
            reason: 'excessive_admin_access',
            admin_requests: adminEndpoints.length
          },
          blocked: false,
          timestamp
        });
      }
    }

    return null;
  }

  private createThreatEvent(data: {
    type: ThreatType;
    level: ThreatLevel;
    sourceIP: string;
    userAgent: string;
    userId?: string;
    organizationId?: string;
    details: Record<string, any>;
    blocked: boolean;
    timestamp: Date;
  }): ThreatEvent {
    const id = `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id,
      type: data.type,
      level: data.level,
      timestamp: data.timestamp,
      sourceIP: data.sourceIP,
      userAgent: data.userAgent,
      userId: data.userId,
      organizationId: data.organizationId,
      details: data.details,
      blocked: data.blocked,
      resolved: false
    };
  }

  private trackActivity(ip: string, action: string, userId?: string): void {
    const timestamp = Date.now();

    // Track IP activity
    if (!this.ipActivityTracker.has(ip)) {
      this.ipActivityTracker.set(ip, []);
    }
    const ipActivity = this.ipActivityTracker.get(ip)!;
    ipActivity.push({ timestamp, action });
    
    // Keep only recent activity
    const cutoff = timestamp - 3600000; // 1 hour
    this.ipActivityTracker.set(ip, ipActivity.filter(a => a.timestamp > cutoff));

    // Track user activity
    if (userId) {
      if (!this.userActivityTracker.has(userId)) {
        this.userActivityTracker.set(userId, []);
      }
      const userActivity = this.userActivityTracker.get(userId)!;
      userActivity.push({ timestamp, action, ip });
      
      // Keep only recent activity
      this.userActivityTracker.set(userId, userActivity.filter(a => a.timestamp > cutoff));
    }
  }

  private blockIP(ip: string, severity: ThreatLevel): void {
    this.blockedIPs.add(ip);
    
    // Set automatic unblock time based on severity
    const unblockTime = this.getUnblockTime(severity);
    setTimeout(() => {
      this.unblockIP(ip);
    }, unblockTime);

    analytics.track('ip_blocked', {
      ip: this.hashIP(ip),
      severity,
      unblock_time: unblockTime
    });
  }

  private unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
    
    analytics.track('ip_unblocked', {
      ip: this.hashIP(ip)
    });
  }

  private getUnblockTime(severity: ThreatLevel): number {
    switch (severity) {
      case 'critical': return 86400000; // 24 hours
      case 'high': return 3600000; // 1 hour
      case 'medium': return 900000; // 15 minutes
      case 'low': return 300000; // 5 minutes
      default: return 300000;
    }
  }

  private triggerSecurityAlert(threat: ThreatEvent): void {
    alertingService.recordEvent('security_threat', {
      threat_id: threat.id,
      type: threat.type,
      level: threat.level,
      source_ip: this.hashIP(threat.sourceIP),
      user_id: threat.userId,
      organization_id: threat.organizationId,
      blocked: threat.blocked
    });

    // Send to Sentry for critical threats
    if (threat.level === 'critical') {
      setTag('threat_type', threat.type);
      setTag('threat_level', threat.level);
      
      reportError(new Error(`Security threat detected: ${threat.type}`), {
        threat_id: threat.id,
        source_ip: this.hashIP(threat.sourceIP),
        details: threat.details
      }, 'error');
    }

    addBreadcrumb(
      `Security threat: ${threat.type}`,
      'security',
      threat.level === 'critical' ? 'error' : 'warning',
      {
        threat_id: threat.id,
        source_ip: this.hashIP(threat.sourceIP),
        blocked: threat.blocked
      }
    );
  }

  private notifyThreatDetected(threat: ThreatEvent): void {
    analytics.track('threat_detected', {
      type: threat.type,
      level: threat.level,
      source_ip: this.hashIP(threat.sourceIP),
      blocked: threat.blocked,
      user_id: threat.userId,
      organization_id: threat.organizationId
    });
  }

  private sanitizePayload(payload: any): any {
    if (!payload) return null;
    
    // Remove sensitive data from payload for logging
    const sanitized = JSON.parse(JSON.stringify(payload));
    
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'session'];
    
    const sanitizeObject = (obj: any): void => {
      if (typeof obj !== 'object' || obj === null) return;
      
      for (const key in obj) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          sanitizeObject(obj[key]);
        }
      }
    };
    
    sanitizeObject(sanitized);
    return sanitized;
  }

  private hashIP(ip: string): string {
    // Simple hash for IP anonymization in logs
    let hash = 0;
    for (let i = 0; i < ip.length; i++) {
      const char = ip.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private getRecentEvents(type: ThreatType, timeWindow: number): ThreatEvent[] {
    const cutoff = Date.now() - timeWindow;
    return Array.from(this.threatEvents.values()).filter(
      event => event.type === type && event.timestamp.getTime() > cutoff
    );
  }

  private cleanupOldEvents(): void {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days
    
    for (const [id, event] of this.threatEvents.entries()) {
      if (event.timestamp.getTime() < cutoff) {
        this.threatEvents.delete(id);
      }
    }

    // Limit total events
    if (this.threatEvents.size > this.maxEventHistory) {
      const events = Array.from(this.threatEvents.entries())
        .sort((a, b) => b[1].timestamp.getTime() - a[1].timestamp.getTime())
        .slice(this.maxEventHistory);
      
      this.threatEvents.clear();
      events.forEach(([id, event]) => this.threatEvents.set(id, event));
    }
  }

  private cleanupTrackingData(): void {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours
    
    // Clean IP activity
    for (const [ip, activity] of this.ipActivityTracker.entries()) {
      const filtered = activity.filter(a => a.timestamp > cutoff);
      if (filtered.length === 0) {
        this.ipActivityTracker.delete(ip);
      } else {
        this.ipActivityTracker.set(ip, filtered);
      }
    }

    // Clean user activity
    for (const [userId, activity] of this.userActivityTracker.entries()) {
      const filtered = activity.filter(a => a.timestamp > cutoff);
      if (filtered.length === 0) {
        this.userActivityTracker.delete(userId);
      } else {
        this.userActivityTracker.set(userId, filtered);
      }
    }
  }

  private reviewBlockedIPs(): void {
    // This would typically check against threat intelligence feeds
    // and potentially unblock IPs that are no longer considered threats
    
    analytics.track('blocked_ips_review', {
      blocked_count: this.blockedIPs.size
    });
  }

  // Public methods for threat management
  getThreatEvents(filters?: {
    type?: ThreatType;
    level?: ThreatLevel;
    userId?: string;
    organizationId?: string;
    timeRange?: { start: Date; end: Date };
  }): ThreatEvent[] {
    let events = Array.from(this.threatEvents.values());

    if (filters) {
      if (filters.type) {
        events = events.filter(e => e.type === filters.type);
      }
      if (filters.level) {
        events = events.filter(e => e.level === filters.level);
      }
      if (filters.userId) {
        events = events.filter(e => e.userId === filters.userId);
      }
      if (filters.organizationId) {
        events = events.filter(e => e.organizationId === filters.organizationId);
      }
      if (filters.timeRange) {
        events = events.filter(e => 
          e.timestamp >= filters.timeRange!.start && 
          e.timestamp <= filters.timeRange!.end
        );
      }
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  resolveThreat(threatId: string): boolean {
    const threat = this.threatEvents.get(threatId);
    if (threat) {
      threat.resolved = true;
      
      analytics.track('threat_resolved', {
        threat_id: threatId,
        type: threat.type,
        level: threat.level
      });
      
      return true;
    }
    return false;
  }

  getSecurityMetrics(): SecurityMetrics {
    const events = Array.from(this.threatEvents.values());
    
    const threatsByType: Record<ThreatType, number> = {
      brute_force: 0,
      sql_injection: 0,
      xss_attempt: 0,
      csrf_attempt: 0,
      unusual_activity: 0,
      account_takeover: 0,
      data_exfiltration: 0,
      privilege_escalation: 0,
      suspicious_login: 0,
      rate_limit_abuse: 0
    };

    const threatsByLevel: Record<ThreatLevel, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    events.forEach(event => {
      threatsByType[event.type]++;
      threatsByLevel[event.level]++;
    });

    return {
      totalThreats: events.length,
      blockedThreats: events.filter(e => e.blocked).length,
      threatsByType,
      threatsByLevel,
      recentActivity: events
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 50)
    };
  }

  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs).map(ip => this.hashIP(ip));
  }

  getThreatRules(): ThreatRule[] {
    return Array.from(this.threatRules.values());
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  }> {
    const metrics = this.getSecurityMetrics();
    const criticalThreats = metrics.threatsByLevel.critical;
    const recentThreats = metrics.recentActivity.filter(
      t => Date.now() - t.timestamp.getTime() < 3600000 // Last hour
    ).length;

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (criticalThreats > 5 || recentThreats > 50) {
      status = 'unhealthy';
    } else if (criticalThreats > 0 || recentThreats > 20) {
      status = 'degraded';
    }

    return {
      status,
      details: {
        total_threats: metrics.totalThreats,
        critical_threats: criticalThreats,
        recent_threats: recentThreats,
        blocked_ips: this.blockedIPs.size,
        active_rules: this.threatRules.size,
        events_in_memory: this.threatEvents.size
      }
    };
  }
}

// Create singleton instance
export const threatDetection = new ThreatDetectionService();

// Helper middleware for Express-like frameworks
export const threatDetectionMiddleware = (req: any, res: any, next: any) => {
  const requestData = {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent') || '',
    method: req.method,
    endpoint: req.path,
    payload: req.body,
    headers: req.headers,
    userId: req.user?.id,
    organizationId: req.user?.organizationId
  };

  const result = threatDetection.analyzeRequest(requestData);

  if (!result.allowed) {
    return res.status(403).json({
      error: 'Request blocked by security system',
      code: 'SECURITY_BLOCK'
    });
  }

  if (result.action === 'challenge') {
    res.set('X-Security-Challenge', 'required');
  }

  // Add threat info to request for logging
  req.securityAnalysis = result;

  next();
};

export default threatDetection;