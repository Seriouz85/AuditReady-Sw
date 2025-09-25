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
  Phone,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { enhancedMFAService } from '@/services/auth/EnhancedMFAService';
import { toast } from '@/hooks/use-toast';

interface EnhancedMFASetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSetupComplete: () => void;
}

type SetupStep = 'method' | 'totp-setup' | 'totp-verify' | 'phone-setup' | 'phone-verify' | 'success';
type FactorType = 'totp' | 'phone';

export const EnhancedMFASetupDialog: React.FC<EnhancedMFASetupDialogProps> = ({
  isOpen,
  onClose,
  onSetupComplete
}) => {
  const [step, setStep] = useState<SetupStep>('method');
  const [selectedFactorType, setSelectedFactorType] = useState<FactorType>('totp');
  const [factorId, setFactorId] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // TOTP specific state
  const [deviceName, setDeviceName] = useState('My Authenticator');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [totpCode, setTotpCode] = useState('');

  // Phone specific state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');

  useEffect(() => {
    if (step === 'method') {
      // Reset state when returning to method selection
      setError('');
      setFactorId('');
      setChallengeId('');
      setQrCode('');
      setSecret('');
      setTotpCode('');
      setPhoneNumber('');
      setSmsCode('');
    }
  }, [step]);

  const handleMethodSelection = (factorType: FactorType) => {
    setSelectedFactorType(factorType);
    if (factorType === 'totp') {
      setStep('totp-setup');
      handleTOTPSetup();
    } else if (factorType === 'phone') {
      setStep('phone-setup');
    }
  };

  const handleTOTPSetup = async () => {
    if (!deviceName.trim()) {
      setError('Please enter a device name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await enhancedMFAService.setupTOTP(deviceName.trim());
      
      if (result) {
        setFactorId(result.id);
        setQrCode(result.qr_code);
        setSecret(result.secret);
        // Step is already set to 'totp-setup'
      } else {
        setError('Failed to set up authenticator. Please try again.');
      }
    } catch (error) {
      console.error('TOTP setup error:', error);
      setError('Failed to set up authenticator. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTOTPVerify = async () => {
    if (!totpCode || totpCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // First create a challenge
      const challenge = await enhancedMFAService.challenge(factorId);
      if (!challenge) {
        setError('Failed to create verification challenge');
        return;
      }

      // Then verify the code
      const verified = await enhancedMFAService.verify(factorId, challenge.id, totpCode);
      
      if (verified) {
        setStep('success');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('TOTP verification error:', error);
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSetup = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await enhancedMFAService.setupPhoneMFA(phoneNumber.trim(), 'My Phone');
      
      if (result) {
        setFactorId(result.id);
        setStep('phone-verify');
        
        // Automatically create a challenge to send SMS
        const challenge = await enhancedMFAService.challenge(result.id);
        if (challenge) {
          setChallengeId(challenge.id);
        }
      } else {
        setError('Failed to set up phone MFA. Please try again.');
      }
    } catch (error) {
      console.error('Phone MFA setup error:', error);
      setError('Failed to set up phone MFA. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneVerify = async () => {
    if (!smsCode || smsCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const verified = await enhancedMFAService.verify(factorId, challengeId, smsCode);
      
      if (verified) {
        setStep('success');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('Phone verification error:', error);
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      toast({
        title: "Secret Copied",
        description: "The secret key has been copied to your clipboard.",
      });
    }
  };

  const handleComplete = () => {
    onSetupComplete();
    onClose();
    toast({
      title: "MFA Setup Complete",
      description: "Multi-factor authentication has been successfully enabled for your account.",
    });
  };

  const availableFactorTypes = enhancedMFAService.getAvailableFactorTypes();

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
              {availableFactorTypes.map((factorType) => (
                <Card 
                  key={factorType.type}
                  className="cursor-pointer transition-colors hover:ring-2 hover:ring-primary"
                  onClick={() => handleMethodSelection(factorType.type)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      {factorType.type === 'totp' ? (
                        <Smartphone className="h-5 w-5" />
                      ) : (
                        <Phone className="h-5 w-5" />
                      )}
                      {factorType.name}
                      {factorType.recommended && (
                        <Badge variant="secondary">Recommended</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {factorType.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 'totp-setup' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Step 1:</span>
              <span>Configure your authenticator app</span>
            </div>

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

              {!qrCode && (
                <Button 
                  onClick={handleTOTPSetup}
                  disabled={!deviceName.trim() || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Generate QR Code'
                  )}
                </Button>
              )}

              {qrCode && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-center p-4 border rounded-lg bg-white">
                      <img src={qrCode} alt="QR Code" className="w-48 h-48" />
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
              )}

              {qrCode && (
                <Button 
                  onClick={() => setStep('totp-verify')}
                  className="w-full"
                >
                  I've Added the Account to My App
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {step === 'totp-verify' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Step 2:</span>
              <span>Enter the verification code from your authenticator app</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totp-code">Verification Code</Label>
                <Input
                  id="totp-code"
                  type="text"
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setTotpCode(value);
                  }}
                  className="text-center text-lg font-mono tracking-widest"
                  maxLength={6}
                  disabled={isLoading}
                />
              </div>

              <Button
                onClick={handleTOTPVerify}
                disabled={totpCode.length !== 6 || isLoading}
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

        {step === 'phone-setup' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Step 1:</span>
              <span>Enter your phone number</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone-number">Phone Number</Label>
                <Input
                  id="phone-number"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Include country code (e.g., +1 for US)
                </p>
              </div>

              <Button 
                onClick={handlePhoneSetup}
                disabled={!phoneNumber.trim() || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'phone-verify' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Step 2:</span>
              <span>Enter the code sent to your phone</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sms-code">SMS Verification Code</Label>
                <Input
                  id="sms-code"
                  type="text"
                  placeholder="000000"
                  value={smsCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setSmsCode(value);
                  }}
                  className="text-center text-lg font-mono tracking-widest"
                  maxLength={6}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Check your text messages for the 6-digit code
                </p>
              </div>

              <Button
                onClick={handlePhoneVerify}
                disabled={smsCode.length !== 6 || isLoading}
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

        {step === 'success' && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-green-600">
                  MFA Successfully Enabled!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your account is now protected with multi-factor authentication
                </p>
              </div>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Enhancement Complete:</strong> Your account now requires verification from your {selectedFactorType === 'totp' ? 'authenticator app' : 'phone'} when signing in.
              </AlertDescription>
            </Alert>

            <Button onClick={handleComplete} className="w-full">
              Complete Setup
            </Button>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
          {(step === 'totp-verify' || step === 'phone-verify') && (
            <Button 
              variant="ghost" 
              onClick={() => setStep('method')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Methods
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};