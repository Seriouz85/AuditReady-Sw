/**
 * Multi-Factor Authentication Service
 * Handles TOTP, SMS, and Email-based MFA
 */

export interface MFAProvider {
  id: string;
  name: string;
  type: 'totp' | 'sms' | 'email' | 'hardware';
  isEnabled: boolean;
  isVerified: boolean;
  createdAt: string;
  lastUsed?: string;
}

export interface MFASetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface MFAVerificationRequest {
  code: string;
  providerId: string;
  rememberDevice?: boolean;
}

class MFAService {
  private readonly API_BASE = '/api/auth/mfa';

  /**
   * Check if MFA is enabled for user
   */
  async isMFAEnabled(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/status/${userId}`);
      const data = await response.json();
      return data.enabled || false;
    } catch (error) {
      console.warn('Failed to check MFA status:', error);
      return false;
    }
  }

  /**
   * Get user's MFA providers
   */
  async getMFAProviders(userId: string): Promise<MFAProvider[]> {
    try {
      const response = await fetch(`${this.API_BASE}/providers/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch MFA providers');
      return await response.json();
    } catch (error) {
      console.error('Failed to get MFA providers:', error);
      return [];
    }
  }

  /**
   * Setup TOTP (Time-based One-Time Password)
   */
  async setupTOTP(userId: string): Promise<MFASetupResponse> {
    const response = await fetch(`${this.API_BASE}/setup/totp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      throw new Error('Failed to setup TOTP');
    }

    return await response.json();
  }

  /**
   * Verify TOTP setup
   */
  async verifyTOTPSetup(userId: string, code: string, secret: string): Promise<boolean> {
    const response = await fetch(`${this.API_BASE}/verify/totp-setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, code, secret })
    });

    return response.ok;
  }

  /**
   * Setup SMS MFA
   */
  async setupSMS(userId: string, phoneNumber: string): Promise<void> {
    const response = await fetch(`${this.API_BASE}/setup/sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, phoneNumber })
    });

    if (!response.ok) {
      throw new Error('Failed to setup SMS MFA');
    }
  }

  /**
   * Send MFA challenge
   */
  async sendChallenge(userId: string, providerId: string): Promise<void> {
    const response = await fetch(`${this.API_BASE}/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, providerId })
    });

    if (!response.ok) {
      throw new Error('Failed to send MFA challenge');
    }
  }

  /**
   * Verify MFA code
   */
  async verifyMFA(request: MFAVerificationRequest): Promise<{ success: boolean; token?: string }> {
    const response = await fetch(`${this.API_BASE}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error('Failed to verify MFA');
    }

    return await response.json();
  }

  /**
   * Disable MFA provider
   */
  async disableMFA(userId: string, providerId: string): Promise<void> {
    const response = await fetch(`${this.API_BASE}/disable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, providerId })
    });

    if (!response.ok) {
      throw new Error('Failed to disable MFA');
    }
  }

  /**
   * Generate backup codes
   */
  async generateBackupCodes(userId: string): Promise<string[]> {
    const response = await fetch(`${this.API_BASE}/backup-codes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      throw new Error('Failed to generate backup codes');
    }

    const data = await response.json();
    return data.codes;
  }

  /**
   * Use backup code
   */
  async useBackupCode(userId: string, code: string): Promise<boolean> {
    const response = await fetch(`${this.API_BASE}/backup-codes/use`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, code })
    });

    return response.ok;
  }

  /**
   * Check if device is trusted
   */
  async isTrustedDevice(userId: string, deviceId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/trusted-devices/${userId}/${deviceId}`);
      const data = await response.json();
      return data.trusted || false;
    } catch (error) {
      console.warn('Failed to check trusted device:', error);
      return false;
    }
  }

  /**
   * Trust current device
   */
  async trustDevice(userId: string, deviceName: string): Promise<void> {
    const response = await fetch(`${this.API_BASE}/trusted-devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, deviceName })
    });

    if (!response.ok) {
      throw new Error('Failed to trust device');
    }
  }
}

export const mfaService = new MFAService();