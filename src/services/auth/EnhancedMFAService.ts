import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface SupabaseMFAFactor {
  id: string;
  friendly_name: string;
  factor_type: 'totp' | 'phone';
  status: 'verified' | 'unverified';
  created_at: string;
  updated_at: string;
  phone?: string;
}

export interface MFAEnrollResponse {
  id: string;
  type: 'totp' | 'phone';
  totp?: {
    qr_code: string;
    secret: string;
  };
  phone?: {
    phone: string;
  };
}

export interface MFAChallengeResponse {
  id: string;
  expires_at: string;
}

export interface AuthenticatorAssuranceLevel {
  currentLevel: 'aal1' | 'aal2' | null;
  nextLevel: 'aal1' | 'aal2' | null;
  currentAuthenticationMethods: string[];
}

/**
 * Enhanced MFA Service using native Supabase MFA APIs
 * This replaces the custom MFA implementation with Supabase's built-in MFA support
 */
export class EnhancedMFAService {
  private static instance: EnhancedMFAService;
  
  public static getInstance(): EnhancedMFAService {
    if (!EnhancedMFAService.instance) {
      EnhancedMFAService.instance = new EnhancedMFAService();
    }
    return EnhancedMFAService.instance;
  }

  /**
   * Get authenticator assurance level for current session
   */
  async getAuthenticatorAssuranceLevel(): Promise<AuthenticatorAssuranceLevel> {
    try {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      
      if (error) {
        console.error('Error getting AAL:', error);
        return {
          currentLevel: null,
          nextLevel: null,
          currentAuthenticationMethods: []
        };
      }

      return {
        currentLevel: data.currentLevel as 'aal1' | 'aal2' | null,
        nextLevel: data.nextLevel as 'aal1' | 'aal2' | null,
        currentAuthenticationMethods: data.currentAuthenticationMethods || []
      };
    } catch (error) {
      console.error('Error getting authenticator assurance level:', error);
      return {
        currentLevel: null,
        nextLevel: null,
        currentAuthenticationMethods: []
      };
    }
  }

  /**
   * List all MFA factors for current user
   */
  async listFactors(): Promise<{ totp: SupabaseMFAFactor[]; phone: SupabaseMFAFactor[] }> {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      
      if (error) {
        console.error('Error listing MFA factors:', error);
        return { totp: [], phone: [] };
      }

      return {
        totp: data.totp || [],
        phone: data.phone || []
      };
    } catch (error) {
      console.error('Error listing MFA factors:', error);
      return { totp: [], phone: [] };
    }
  }

  /**
   * Check if user has MFA enabled
   */
  async hasMFAEnabled(): Promise<boolean> {
    try {
      const factors = await this.listFactors();
      const verifiedFactors = [...factors.totp, ...factors.phone].filter(f => f.status === 'verified');
      return verifiedFactors.length > 0;
    } catch (error) {
      console.error('Error checking MFA status:', error);
      return false;
    }
  }

  /**
   * Enroll a new MFA factor
   */
  async enrollFactor(factorType: 'totp' | 'phone', options?: { phone?: string; friendlyName?: string }): Promise<MFAEnrollResponse | null> {
    try {
      const enrollData: any = {
        factorType: factorType
      };

      // Add phone number if enrolling phone MFA
      if (factorType === 'phone' && options?.phone) {
        enrollData.phone = options.phone;
      }

      if (options?.friendlyName) {
        enrollData.friendlyName = options.friendlyName;
      }

      const { data, error } = await supabase.auth.mfa.enroll(enrollData);
      
      if (error) {
        console.error('Error enrolling MFA factor:', error);
        toast({
          title: "MFA Enrollment Failed",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      console.log('🔐 MFA factor enrolled successfully:', data);
      
      return {
        id: data.id,
        type: factorType,
        totp: factorType === 'totp' ? {
          qr_code: data.totp?.qr_code || '',
          secret: data.totp?.secret || ''
        } : undefined,
        phone: factorType === 'phone' ? {
          phone: options?.phone || ''
        } : undefined
      };
    } catch (error) {
      console.error('Error enrolling MFA factor:', error);
      return null;
    }
  }

  /**
   * Create MFA challenge
   */
  async challenge(factorId: string): Promise<MFAChallengeResponse | null> {
    try {
      const { data, error } = await supabase.auth.mfa.challenge({ factorId });
      
      if (error) {
        console.error('Error creating MFA challenge:', error);
        return null;
      }

      return {
        id: data.id,
        expires_at: data.expires_at
      };
    } catch (error) {
      console.error('Error creating MFA challenge:', error);
      return null;
    }
  }

  /**
   * Verify MFA challenge
   */
  async verify(factorId: string, challengeId: string, code: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code
      });
      
      if (error) {
        console.error('Error verifying MFA challenge:', error);
        toast({
          title: "Verification Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      if (data) {
        console.log('🔐 MFA verification successful');
        toast({
          title: "MFA Verified",
          description: "Multi-factor authentication successful.",
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error verifying MFA challenge:', error);
      return false;
    }
  }

  /**
   * Unenroll (remove) an MFA factor
   */
  async unenrollFactor(factorId: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      
      if (error) {
        console.error('Error unenrolling MFA factor:', error);
        toast({
          title: "Removal Failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "MFA Factor Removed",
        description: "The MFA factor has been successfully removed.",
      });
      
      return true;
    } catch (error) {
      console.error('Error unenrolling MFA factor:', error);
      return false;
    }
  }

  /**
   * Complete TOTP enrollment (enroll + verify)
   */
  async setupTOTP(friendlyName: string): Promise<{ id: string; qr_code: string; secret: string } | null> {
    try {
      const enrollment = await this.enrollFactor('totp', { friendlyName });
      
      if (!enrollment || !enrollment.totp) {
        return null;
      }

      return {
        id: enrollment.id,
        qr_code: enrollment.totp.qr_code,
        secret: enrollment.totp.secret
      };
    } catch (error) {
      console.error('Error setting up TOTP:', error);
      return null;
    }
  }

  /**
   * Complete Phone/SMS enrollment (enroll + verify)
   */
  async setupPhoneMFA(phone: string, friendlyName?: string): Promise<{ id: string; phone: string } | null> {
    try {
      const enrollment = await this.enrollFactor('phone', { phone, friendlyName });
      
      if (!enrollment || !enrollment.phone) {
        return null;
      }

      return {
        id: enrollment.id,
        phone: enrollment.phone.phone
      };
    } catch (error) {
      console.error('Error setting up phone MFA:', error);
      return null;
    }
  }

  /**
   * Check if user needs to complete MFA challenge
   */
  async needsMFAChallenge(): Promise<boolean> {
    try {
      const aal = await this.getAuthenticatorAssuranceLevel();
      return aal.currentLevel === 'aal1' && aal.nextLevel === 'aal2';
    } catch (error) {
      console.error('Error checking MFA challenge requirement:', error);
      return false;
    }
  }

  /**
   * Get available factor types for this project
   */
  getAvailableFactorTypes(): Array<{ type: 'totp' | 'phone'; name: string; description: string; recommended?: boolean }> {
    return [
      {
        type: 'totp',
        name: 'Authenticator App',
        description: 'Use an authenticator app like Google Authenticator, Authy, or 1Password',
        recommended: true
      },
      {
        type: 'phone',
        name: 'SMS to Phone',
        description: 'Receive verification codes via SMS text message'
      }
    ];
  }

  /**
   * Security utility: Check password strength (client-side basic validation)
   */
  validatePasswordStrength(password: string): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 12) {
      score += 25;
    } else if (password.length >= 8) {
      score += 10;
      issues.push('Password should be at least 12 characters long');
      recommendations.push('Use at least 12 characters for better security');
    } else {
      issues.push('Password is too short (minimum 8 characters)');
      recommendations.push('Use at least 12 characters for optimal security');
    }

    // Character variety checks
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

    const varietyCount = [hasLower, hasUpper, hasNumbers, hasSymbols].filter(Boolean).length;
    score += varietyCount * 15;

    if (!hasLower) {
      issues.push('Missing lowercase letters');
      recommendations.push('Include lowercase letters (a-z)');
    }
    if (!hasUpper) {
      issues.push('Missing uppercase letters');
      recommendations.push('Include uppercase letters (A-Z)');
    }
    if (!hasNumbers) {
      issues.push('Missing numbers');
      recommendations.push('Include numbers (0-9)');
    }
    if (!hasSymbols) {
      issues.push('Missing special characters');
      recommendations.push('Include special characters (!@#$%^&* etc.)');
    }

    // Common patterns check (basic)
    const commonPatterns = [
      /123456/,
      /password/i,
      /admin/i,
      /qwerty/i,
      /letmein/i
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        score -= 20;
        issues.push('Contains common password patterns');
        recommendations.push('Avoid common words and patterns');
        break;
      }
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      issues,
      recommendations
    };
  }
}

export const enhancedMFAService = EnhancedMFAService.getInstance();