import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Smartphone, Shield, Download, Key, CheckCircle2, AlertTriangle } from 'lucide-react';
import { mfaService, MFAProvider, MFASetupResponse } from '@/services/security/MFAService';
import { LoadingSpinner } from '@/components/loading/LoadingStates';

interface MFASetupProps {
  userId: string;
  onSetupComplete?: () => void;
}

export function MFASetup({ userId, onSetupComplete }: MFASetupProps) {
  const [providers, setProviders] = useState<MFAProvider[]>([]);
  const [setupData, setSetupData] = useState<MFASetupResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSetup, setActiveSetup] = useState<'totp' | 'sms' | null>(null);

  useEffect(() => {
    loadMFAProviders();
  }, [userId]);

  const loadMFAProviders = async () => {
    try {
      const data = await mfaService.getMFAProviders(userId);
      setProviders(data);
    } catch (error) {
      setError('Failed to load MFA providers');
    }
  };

  const handleTOTPSetup = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await mfaService.setupTOTP(userId);
      setSetupData(data);
      setActiveSetup('totp');
    } catch (error) {
      setError('Failed to setup TOTP');
    } finally {
      setLoading(false);
    }
  };

  const handleTOTPVerification = async () => {
    if (!setupData || !verificationCode) return;
    
    setLoading(true);
    setError('');
    try {
      const success = await mfaService.verifyTOTPSetup(userId, verificationCode, setupData.secret);
      if (success) {
        setSuccess('TOTP setup completed successfully');
        setBackupCodes(setupData.backupCodes);
        await loadMFAProviders();
        setActiveSetup(null);
        onSetupComplete?.();
      } else {
        setError('Invalid verification code');
      }
    } catch (error) {
      setError('Failed to verify TOTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSMSSetup = async () => {
    if (!phoneNumber) return;
    
    setLoading(true);
    setError('');
    try {
      await mfaService.setupSMS(userId, phoneNumber);
      setSuccess('SMS MFA setup completed');
      await loadMFAProviders();
      setActiveSetup(null);
      onSetupComplete?.();
    } catch (error) {
      setError('Failed to setup SMS MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMFA = async (providerId: string) => {
    setLoading(true);
    setError('');
    try {
      await mfaService.disableMFA(userId, providerId);
      setSuccess('MFA provider disabled');
      await loadMFAProviders();
    } catch (error) {
      setError('Failed to disable MFA provider');
    } finally {
      setLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mfa-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Multi-Factor Authentication</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <CheckCircle2 className="w-4 h-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Current Providers */}
          <div className="space-y-3">
            <h3 className="font-medium">Active MFA Methods</h3>
            {providers.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No MFA methods configured. Add one below for enhanced security.
              </p>
            ) : (
              providers.map(provider => (
                <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {provider.type === 'totp' ? <Smartphone className="w-5 h-5" /> : <Key className="w-5 h-5" />}
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Last used: {provider.lastUsed || 'Never'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={provider.isVerified ? 'default' : 'secondary'}>
                      {provider.isVerified ? 'Verified' : 'Pending'}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDisableMFA(provider.id)}
                      disabled={loading}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* TOTP Setup */}
          {activeSetup !== 'totp' && (
            <div className="space-y-3">
              <h3 className="font-medium">Add Authenticator App</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use apps like Google Authenticator, Authy, or Microsoft Authenticator
              </p>
              <Button onClick={handleTOTPSetup} disabled={loading}>
                <Smartphone className="w-4 h-4 mr-2" />
                Setup Authenticator App
              </Button>
            </div>
          )}

          {activeSetup === 'totp' && setupData && (
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-medium">Setup Authenticator App</h3>
              <div className="space-y-3">
                <div className="text-center">
                  <img src={setupData.qrCode} alt="QR Code" className="mx-auto" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Scan this QR code with your authenticator app
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Or enter this key manually:</label>
                  <Input value={setupData.secret} readOnly className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Enter verification code:</label>
                  <Input
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="000000"
                    className="mt-1"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleTOTPVerification} disabled={loading || !verificationCode}>
                    {loading && <LoadingSpinner size="sm" />}
                    Verify & Enable
                  </Button>
                  <Button variant="outline" onClick={() => setActiveSetup(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* SMS Setup */}
          {activeSetup !== 'sms' && (
            <div className="space-y-3">
              <h3 className="font-medium">Add SMS Authentication</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive verification codes via text message
              </p>
              <Button onClick={() => setActiveSetup('sms')} disabled={loading}>
                Setup SMS Authentication
              </Button>
            </div>
          )}

          {activeSetup === 'sms' && (
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-medium">Setup SMS Authentication</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Phone Number:</label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                    className="mt-1"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleSMSSetup} disabled={loading || !phoneNumber}>
                    {loading && <LoadingSpinner size="sm" />}
                    Setup SMS
                  </Button>
                  <Button variant="outline" onClick={() => setActiveSetup(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Backup Codes */}
          {backupCodes.length > 0 && (
            <div className="space-y-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h3 className="font-medium flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Backup Codes</span>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Save these backup codes in a secure location. Each code can only be used once.
              </p>
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index} className="p-2 bg-white dark:bg-gray-800 rounded border">
                    {code}
                  </div>
                ))}
              </div>
              <Button onClick={downloadBackupCodes} size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download Codes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}