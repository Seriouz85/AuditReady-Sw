import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Smartphone, 
  Key, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  QrCode,
  Download
} from 'lucide-react';
import { mfaService } from '@/services/auth/MFAService';
import { toast } from '@/hooks/use-toast';

interface MFASetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSetupComplete: () => void;
}

export const MFASetupDialog: React.FC<MFASetupDialogProps> = ({
  isOpen,
  onClose,
  onSetupComplete
}) => {
  const [step, setStep] = useState<'method' | 'setup' | 'verify' | 'backup'>('method');
  const [selectedMethod, setSelectedMethod] = useState<'totp' | 'backup'>('totp');
  const [deviceName, setDeviceName] = useState('My Authenticator');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    if (step === 'method') {
      setError('');
      setVerificationCode('');
      setQrCode('');
      setSecret('');
    }
  }, [step]);

  const handleSetupTOTP = async () => {
    if (!deviceName.trim()) {
      setError('Please enter a device name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await mfaService.setupTOTP(deviceName.trim());
      
      if (result) {
        setQrCode(result.qr_code);
        setSecret(result.secret);
        setStep('setup');
      } else {
        setError('Failed to set up authenticator. Please try again.');
      }
    } catch (error) {
      setError('Failed to set up authenticator. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTOTP = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const verified = await mfaService.verifyAndActivateTOTP(deviceId, verificationCode);
      
      if (verified) {
        setStep('backup');
        await generateBackupCodes();
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateBackupCodes = async () => {
    setIsLoading(true);
    try {
      const codes = await mfaService.generateBackupCodes();
      if (codes) {
        setBackupCodes(codes);
      }
    } catch (error) {
      console.error('Failed to generate backup codes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast({
      title: "Secret Copied",
      description: "The secret key has been copied to your clipboard.",
    });
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    toast({
      title: "Backup Codes Copied",
      description: "All backup codes have been copied to your clipboard.",
    });
  };

  const downloadBackupCodes = () => {
    const codesText = [
      'AuditReady Hub - MFA Backup Codes',
      '=====================================',
      '',
      'Keep these codes in a safe place. Each code can only be used once.',
      '',
      ...backupCodes,
      '',
      `Generated on: ${new Date().toLocaleString()}`,
    ].join('\n');

    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'auditready-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Backup Codes Downloaded",
      description: "Your backup codes have been saved to a text file.",
    });
  };

  const handleComplete = () => {
    onSetupComplete();
    onClose();
    toast({
      title: "MFA Setup Complete",
      description: "Multi-factor authentication has been successfully enabled for your account.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Set Up Multi-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            Secure your account with an additional layer of protection
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'method' && (
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground">
              Choose your preferred method for multi-factor authentication:
            </div>

            <div className="grid gap-4">
              <Card 
                className={`cursor-pointer transition-colors ${
                  selectedMethod === 'totp' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedMethod('totp')}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Smartphone className="h-5 w-5" />
                    Authenticator App
                    <Badge variant="secondary">Recommended</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Use an authenticator app like Google Authenticator, Authy, or 1Password to generate time-based codes.
                  </p>
                </CardContent>
              </Card>
            </div>

            {selectedMethod === 'totp' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="device-name">Device Name</Label>
                  <Input
                    id="device-name"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="e.g., My iPhone, Work Computer"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Give this device a memorable name for easy identification
                  </p>
                </div>

                <Button 
                  onClick={handleSetupTOTP}
                  disabled={!deviceName.trim() || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Set Up Authenticator'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 'setup' && (
          <div className="space-y-6">
            <div className="text-sm">
              <strong>Step 1:</strong> Scan the QR code or enter the secret key manually
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-center p-4 border rounded-lg bg-white">
                  {qrCode ? (
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center border-2 border-dashed">
                      <QrCode className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Manual Entry Key</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={secret}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copySecret}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use this if you can't scan the QR code
                  </p>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Popular authenticator apps:
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>• Google Authenticator</li>
                      <li>• Microsoft Authenticator</li>
                      <li>• Authy</li>
                      <li>• 1Password</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <Button 
              onClick={() => setStep('verify')}
              className="w-full"
            >
              I've Added the Account to My App
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-6">
            <div className="text-sm">
              <strong>Step 2:</strong> Enter the 6-digit code from your authenticator app to verify the setup
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setVerificationCode(value);
                  }}
                  className="text-center text-lg font-mono tracking-widest"
                  maxLength={6}
                  disabled={isLoading}
                />
              </div>

              <Button
                onClick={handleVerifyTOTP}
                disabled={verificationCode.length !== 6 || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify and Enable MFA'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'backup' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">MFA Successfully Enabled!</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Save these backup codes in a secure location. Each code can only be used once.
              </p>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Key className="h-4 w-4" />
                  Backup Recovery Codes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="p-2 bg-muted rounded text-center">
                      {code}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={copyBackupCodes}
                className="flex-1"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Codes
              </Button>
              <Button
                variant="outline"
                onClick={downloadBackupCodes}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Store these backup codes securely. They allow you to access your account if you lose your authenticator device.
              </AlertDescription>
            </Alert>

            <Button onClick={handleComplete} className="w-full">
              Complete Setup
            </Button>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {step === 'backup' ? 'Skip for Now' : 'Cancel'}
          </Button>
          {step !== 'method' && step !== 'backup' && (
            <Button variant="ghost" onClick={() => setStep('method')}>
              Back
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};