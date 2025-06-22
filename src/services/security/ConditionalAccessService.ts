/**
 * Conditional Access Service
 * Implements enterprise security policies and conditional access rules
 */

export interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  priority: number;
  conditions: AccessCondition[];
  actions: AccessAction[];
  createdAt: string;
  updatedAt: string;
}

export interface AccessCondition {
  type: 'location' | 'device' | 'time' | 'risk' | 'group' | 'application';
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in';
  value: string | string[];
}

export interface AccessAction {
  type: 'allow' | 'deny' | 'require_mfa' | 'require_compliant_device' | 'require_domain_join';
  parameters?: Record<string, any>;
}

export interface AccessRequest {
  userId: string;
  deviceId?: string;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    region: string;
    city: string;
  };
  application: string;
  timestamp: string;
}

export interface AccessResult {
  decision: 'allow' | 'deny' | 'challenge';
  requiredActions: string[];
  reason: string;
  policyId?: string;
}

class ConditionalAccessService {
  private readonly API_BASE = '/api/security/conditional-access';

  /**
   * Evaluate access request against policies
   */
  async evaluateAccess(request: AccessRequest): Promise<AccessResult> {
    try {
      const response = await fetch(`${this.API_BASE}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate access request');
      }

      return await response.json();
    } catch (error) {
      console.error('Access evaluation failed:', error);
      // Fail securely - deny access if evaluation fails
      return {
        decision: 'deny',
        requiredActions: [],
        reason: 'Unable to evaluate access request'
      };
    }
  }

  /**
   * Get location from IP address
   */
  async getLocationFromIP(ipAddress: string): Promise<{ country: string; region: string; city: string } | null> {
    try {
      // In production, use a real IP geolocation service
      const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
      if (!response.ok) throw new Error('Geolocation failed');
      
      const data = await response.json();
      return {
        country: data.country_name || 'Unknown',
        region: data.region || 'Unknown', 
        city: data.city || 'Unknown'
      };
    } catch (error) {
      console.warn('Failed to get location:', error);
      return null;
    }
  }

  /**
   * Check if device is compliant
   */
  async isDeviceCompliant(deviceId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/device-compliance/${deviceId}`);
      const data = await response.json();
      return data.compliant || false;
    } catch (error) {
      console.warn('Failed to check device compliance:', error);
      return false;
    }
  }

  /**
   * Calculate risk score for access request
   */
  async calculateRiskScore(request: AccessRequest): Promise<number> {
    try {
      const response = await fetch(`${this.API_BASE}/risk-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) throw new Error('Risk calculation failed');
      
      const data = await response.json();
      return data.score || 0;
    } catch (error) {
      console.warn('Failed to calculate risk score:', error);
      return 100; // High risk if calculation fails
    }
  }

  /**
   * Get user's access policies
   */
  async getUserPolicies(userId: string): Promise<AccessPolicy[]> {
    try {
      const response = await fetch(`${this.API_BASE}/policies/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user policies');
      return await response.json();
    } catch (error) {
      console.error('Failed to get user policies:', error);
      return [];
    }
  }

  /**
   * Check if user is in allowed location
   */
  isLocationAllowed(userLocation: any, allowedLocations: string[]): boolean {
    if (!userLocation || allowedLocations.length === 0) return true;
    
    return allowedLocations.some(allowed => 
      userLocation.country?.toLowerCase().includes(allowed.toLowerCase()) ||
      userLocation.region?.toLowerCase().includes(allowed.toLowerCase())
    );
  }

  /**
   * Check if access is during allowed time
   */
  isTimeAllowed(allowedTimes: string[]): boolean {
    if (allowedTimes.length === 0) return true;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    return allowedTimes.some(timeRange => {
      // Format: "Mon-Fri:09:00-17:00" or "All:00:00-23:59"
      const [days, hours] = timeRange.split(':');
      const [startHour, endHour] = hours.split('-').map(h => parseInt(h.split(':')[0]));
      
      const isDayAllowed = days === 'All' || 
        (days === 'Mon-Fri' && currentDay >= 1 && currentDay <= 5) ||
        (days === 'Weekend' && (currentDay === 0 || currentDay === 6));
      
      const isHourAllowed = currentHour >= startHour && currentHour <= endHour;
      
      return isDayAllowed && isHourAllowed;
    });
  }

  /**
   * Log access attempt for audit
   */
  async logAccessAttempt(request: AccessRequest, result: AccessResult): Promise<void> {
    try {
      await fetch(`${this.API_BASE}/audit-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request, result, timestamp: new Date().toISOString() })
      });
    } catch (error) {
      console.error('Failed to log access attempt:', error);
    }
  }

  /**
   * Create access request from current context
   */
  createAccessRequest(userId: string, application: string): AccessRequest {
    return {
      userId,
      application,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      deviceId: this.getDeviceId(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get client IP address (simplified)
   */
  private getClientIP(): string {
    // In production, this would be passed from the server
    return '127.0.0.1';
  }

  /**
   * Get or generate device ID
   */
  private getDeviceId(): string {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'device-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }
}

export const conditionalAccessService = new ConditionalAccessService();