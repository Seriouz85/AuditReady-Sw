import React, { useState } from 'react';
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
import { Shield, Smartphone, Key, AlertTriangle, Loader2 } from 'lucide-react';
import { backupRestoreService } from '@/services/backup/BackupRestoreService';

interface MFAVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  sessionId: string;
  operationDescription: string;
  requiredMethods: string[];
}

export const MFAVerificationDialog: React.FC<MFAVerificationDialogProps> = ({
  isOpen,
  onClose,
  onVerified,
  sessionId,
  operationDescription,
  requiredMethods
}) => {
  const [totpCode, setTotpCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(requiredMethods[0] || 'totp');

  const handleTOTPVerification = async () => {
    if (!totpCode || totpCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const verified = await backupRestoreService.completeMFAVerification(
        sessionId,
        totpCode,
        'totp'
      );

      if (verified) {
        onVerified();
        onClose();
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBackupCodeVerification = async () => {
    if (!backupCode || backupCode.length < 6) {
      setError('Please enter a valid backup code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const verified = await backupRestoreService.completeMFAVerification(
        sessionId,
        backupCode.toUpperCase(),
        'backup_codes'
      );

      if (verified) {
        onVerified();
        onClose();
      } else {
        setError('Invalid backup code. Please try again.');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === 'Enter' && !isVerifying) {
      handler();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-600" />
            Multi-Factor Authentication Required
          </DialogTitle>
          <DialogDescription>
            This operation requires additional verification for security:
            <div className="mt-2 p-2 bg-muted rounded text-sm font-medium">
              {operationDescription}
            </div>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {requiredMethods.includes('totp') && (
              <TabsTrigger value="totp" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Authenticator
              </TabsTrigger>
            )}
            {requiredMethods.includes('backup_codes') && (
              <TabsTrigger value="backup_codes" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Backup Code
              </TabsTrigger>
            )}
          </TabsList>

          {requiredMethods.includes('totp') && (
            <TabsContent value="totp" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totp-code">
                  Enter the 6-digit code from your authenticator app
                </Label>
                <Input
                  id="totp-code"
                  type="text"
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setTotpCode(value);
                  }}
                  onKeyPress={(e) => handleKeyPress(e, handleTOTPVerification)}
                  className="text-center text-lg font-mono tracking-widest"
                  maxLength={6}
                  autoComplete="one-time-code"
                  disabled={isVerifying}
                />
              </div>
              <Button
                onClick={handleTOTPVerification}
                className="w-full"
                disabled={isVerifying || totpCode.length !== 6}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </Button>
            </TabsContent>
          )}

          {requiredMethods.includes('backup_codes') && (
            <TabsContent value="backup_codes" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backup-code">
                  Enter one of your backup codes
                </Label>
                <Input
                  id="backup-code"
                  type="text"
                  placeholder="ABCD-EFGH"
                  value={backupCode}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    setBackupCode(value);
                  }}
                  onKeyPress={(e) => handleKeyPress(e, handleBackupCodeVerification)}
                  className="text-center text-lg font-mono tracking-widest"
                  maxLength={10}
                  disabled={isVerifying}
                />
                <p className="text-xs text-muted-foreground">
                  Note: Each backup code can only be used once
                </p>
              </div>
              <Button
                onClick={handleBackupCodeVerification}
                className="w-full"
                disabled={isVerifying || backupCode.length < 6}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Backup Code'
                )}
              </Button>
            </TabsContent>
          )}
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isVerifying}>
            Cancel
          </Button>
          <div className="text-xs text-muted-foreground text-right">
            Session expires in 5 minutes
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};