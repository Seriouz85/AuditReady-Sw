import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mfaService } from '@/services/security/MFAService';

// Mock fetch globally
global.fetch = vi.fn();

describe('MFAService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isMFAEnabled', () => {
    it('returns true when MFA is enabled', async () => {
      const mockResponse = { enabled: true };
      (fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      });

      const result = await mfaService.isMFAEnabled('user123');
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith('/api/auth/mfa/status/user123');
    });

    it('returns false when MFA is disabled', async () => {
      const mockResponse = { enabled: false };
      (fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse),
      });

      const result = await mfaService.isMFAEnabled('user123');
      expect(result).toBe(false);
    });

    it('returns false when request fails', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await mfaService.isMFAEnabled('user123');
      expect(result).toBe(false);
    });
  });

  describe('setupTOTP', () => {
    it('returns setup data on success', async () => {
      const mockSetupData = {
        secret: 'SECRET123',
        qrCode: 'data:image/png;base64,abc123',
        backupCodes: ['123456', '789012']
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSetupData),
      });

      const result = await mfaService.setupTOTP('user123');
      expect(result).toEqual(mockSetupData);
      expect(fetch).toHaveBeenCalledWith('/api/auth/mfa/setup/totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user123' })
      });
    });

    it('throws error on failure', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
      });

      await expect(mfaService.setupTOTP('user123')).rejects.toThrow('Failed to setup TOTP');
    });
  });

  describe('verifyMFA', () => {
    it('returns success result when verification passes', async () => {
      const mockResult = { success: true, token: 'jwt-token' };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const request = {
        code: '123456',
        providerId: 'totp-provider',
        rememberDevice: false
      };

      const result = await mfaService.verifyMFA(request);
      expect(result).toEqual(mockResult);
    });

    it('throws error when verification fails', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
      });

      const request = {
        code: '123456',
        providerId: 'totp-provider'
      };

      await expect(mfaService.verifyMFA(request)).rejects.toThrow('Failed to verify MFA');
    });
  });
});