import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface MFADevice {
  id: string;
  user_id: string;
  device_name: string;
  device_type: 'totp' | 'backup_codes' | 'hardware_key';
  secret?: string;
  backup_codes?: string[];
  is_active: boolean;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MFAVerificationRequest {
  operation_type: 'restore_data' | 'export_data' | 'delete_data' | 'user_management';
  operation_details: {
    target: string;
    scope: string;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface MFAVerificationResponse {
  verification_id: string;
  required_methods: string[];
  expires_at: string;
  is_verified: boolean;
}

export class MFAService {
  private static instance: MFAService;
  
  public static getInstance(): MFAService {
    if (!MFAService.instance) {
      MFAService.instance = new MFAService();
    }
    return MFAService.instance;
  }

  /**
   * Check if user has MFA enabled
   */
  async hasMFAEnabled(userId?: string): Promise<boolean> {
    try {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!targetUserId) return false;

      const { data, error } = await supabase
        .from('mfa_devices')
        .select('id')
        .eq('user_id', targetUserId)
        .eq('is_active', true)
        .limit(1);

      if (error) {
        console.error('Error checking MFA status:', error);
        return false;
      }

      return (data?.length ?? 0) > 0;
    } catch (error) {
      console.error('Error checking MFA status:', error);
      return false;
    }
  }

  /**
   * Get user's MFA devices
   */
  async getMFADevices(userId?: string): Promise<MFADevice[]> {
    try {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from('mfa_devices')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching MFA devices:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching MFA devices:', error);
      return [];
    }
  }

  /**
   * Setup TOTP (Time-based One-Time Password)
   */
  async setupTOTP(deviceName: string): Promise<{ secret: string; qr_code: string } | null> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // Generate TOTP secret
      const secret = this.generateTOTPSecret();
      const serviceName = 'AuditReady Hub';
      const accountName = user.email || 'user@auditready.com';
      
      // Create TOTP URL for QR code
      const totpUrl = `otpauth://totp/${serviceName}:${accountName}?secret=${secret}&issuer=${serviceName}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpUrl)}`;

      // Store device (inactive until verified)
      const { data, error } = await supabase
        .from('mfa_devices')
        .insert({
          user_id: user.id,
          device_name: deviceName,
          device_type: 'totp',
          secret: secret,
          is_active: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error setting up TOTP:', error);
        return null;
      }

      return {
        secret: secret,
        qr_code: qrCodeUrl
      };
    } catch (error) {
      console.error('Error setting up TOTP:', error);
      return null;
    }
  }

  /**
   * Verify TOTP token and activate device
   */
  async verifyAndActivateTOTP(deviceId: string, token: string): Promise<boolean> {
    try {
      // Get device details
      const { data: device, error: deviceError } = await supabase
        .from('mfa_devices')
        .select('*')
        .eq('id', deviceId)
        .single();

      if (deviceError || !device) {
        console.error('Device not found:', deviceError);
        return false;
      }

      // Verify TOTP token
      const isValid = this.verifyTOTPToken(device.secret!, token);
      
      if (!isValid) {
        toast({
          title: "Invalid Code",
          description: "The verification code is incorrect. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Activate device
      const { error: updateError } = await supabase
        .from('mfa_devices')
        .update({ 
          is_active: true,
          last_used_at: new Date().toISOString()
        })
        .eq('id', deviceId);

      if (updateError) {
        console.error('Error activating device:', updateError);
        return false;
      }

      toast({
        title: "MFA Setup Complete",
        description: "Your authenticator app has been successfully configured.",
      });

      return true;
    } catch (error) {
      console.error('Error verifying TOTP:', error);
      return false;
    }
  }

  /**
   * Generate backup codes
   */
  async generateBackupCodes(): Promise<string[] | null> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      const backupCodes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );

      // Store backup codes
      const { error } = await supabase
        .from('mfa_devices')
        .insert({
          user_id: user.id,
          device_name: 'Backup Codes',
          device_type: 'backup_codes',
          backup_codes: backupCodes,
          is_active: true
        });

      if (error) {
        console.error('Error generating backup codes:', error);
        return null;
      }

      return backupCodes;
    } catch (error) {
      console.error('Error generating backup codes:', error);
      return null;
    }
  }

  /**
   * Request MFA verification for sensitive operations
   */
  async requestMFAVerification(request: MFAVerificationRequest): Promise<MFAVerificationResponse | null> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // Check if user has MFA enabled
      const hasMFA = await this.hasMFAEnabled(user.id);
      
      if (!hasMFA && request.operation_details.risk_level !== 'low') {
        toast({
          title: "MFA Required",
          description: "This operation requires multi-factor authentication. Please enable MFA in your security settings.",
          variant: "destructive",
        });
        return null;
      }

      // Get active MFA methods
      const devices = await this.getMFADevices(user.id);
      const activeDevices = devices.filter(d => d.is_active);
      
      const requiredMethods = activeDevices.map(d => d.device_type);
      
      // For demo purposes, create verification request
      const verificationId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

      return {
        verification_id: verificationId,
        required_methods: requiredMethods,
        expires_at: expiresAt,
        is_verified: false
      };
    } catch (error) {
      console.error('Error requesting MFA verification:', error);
      return null;
    }
  }

  /**
   * Verify MFA token for a verification request
   */
  async verifyMFAToken(
    verificationId: string,
    token: string,
    deviceType: 'totp' | 'backup_codes' = 'totp'
  ): Promise<boolean> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return false;

      // Get user's devices of the specified type
      const devices = await this.getMFADevices(user.id);
      const device = devices.find(d => d.device_type === deviceType && d.is_active);
      
      if (!device) return false;

      let isValid = false;

      if (deviceType === 'totp' && device.secret) {
        isValid = this.verifyTOTPToken(device.secret, token);
      } else if (deviceType === 'backup_codes' && device.backup_codes) {
        isValid = device.backup_codes.includes(token.toUpperCase());
        
        // Remove used backup code
        if (isValid) {
          const updatedCodes = device.backup_codes.filter(code => code !== token.toUpperCase());
          await supabase
            .from('mfa_devices')
            .update({ backup_codes: updatedCodes })
            .eq('id', device.id);
        }
      }

      if (isValid) {
        // Update last used timestamp
        await supabase
          .from('mfa_devices')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', device.id);
      }

      return isValid;
    } catch (error) {
      console.error('Error verifying MFA token:', error);
      return false;
    }
  }

  /**
   * Remove MFA device
   */
  async removeMFADevice(deviceId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('mfa_devices')
        .delete()
        .eq('id', deviceId);

      if (error) {
        console.error('Error removing MFA device:', error);
        return false;
      }

      toast({
        title: "Device Removed",
        description: "MFA device has been successfully removed.",
      });

      return true;
    } catch (error) {
      console.error('Error removing MFA device:', error);
      return false;
    }
  }

  /**
   * Generate TOTP secret (32-character base32)
   */
  private generateTOTPSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  /**
   * Verify TOTP token (simplified implementation)
   * In production, use a proper TOTP library like 'otplib'
   */
  private verifyTOTPToken(secret: string, token: string): boolean {
    // This is a simplified implementation
    // In production, use a proper TOTP verification library
    
    try {
      // Get current time step (30 seconds window)
      const timeStep = Math.floor(Date.now() / 1000 / 30);
      
      // Check current, previous, and next time steps for clock drift tolerance
      for (let i = -1; i <= 1; i++) {
        const expectedToken = this.generateTOTPToken(secret, timeStep + i);
        if (expectedToken === token) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error verifying TOTP token:', error);
      return false;
    }
  }

  /**
   * Generate TOTP token for a given time step (simplified)
   */
  private generateTOTPToken(secret: string, timeStep: number): string {
    // This is a placeholder implementation
    // In production, use proper TOTP generation with HMAC-SHA1
    
    // Generate a 6-digit token based on secret and time step
    const hash = this.simpleHash(secret + timeStep.toString());
    const token = (hash % 1000000).toString().padStart(6, '0');
    
    return token;
  }

  /**
   * Simple hash function (placeholder for proper HMAC-SHA1)
   */
  private simpleHash(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

export const mfaService = MFAService.getInstance();