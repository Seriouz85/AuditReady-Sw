import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Info, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { enhancedMFAService } from '@/services/auth/EnhancedMFAService';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PasswordSecurityValidatorProps {
  password: string;
  onPasswordChange: (password: string) => void;
  showStrengthIndicator?: boolean;
  requireStrongPassword?: boolean;
  onValidationChange?: (isValid: boolean, issues: string[]) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

interface PasswordStrength {
  score: number;
  issues: string[];
  recommendations: string[];
  level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
  color: string;
}

const getPasswordStrength = (password: string): PasswordStrength => {
  const validation = enhancedMFAService.validatePasswordStrength(password);
  
  let level: PasswordStrength['level'] = 'very-weak';
  let color = '#ef4444'; // red
  
  if (validation.score >= 90) {
    level = 'strong';
    color = '#10b981'; // green
  } else if (validation.score >= 70) {
    level = 'good';
    color = '#3b82f6'; // blue
  } else if (validation.score >= 50) {
    level = 'fair';
    color = '#f59e0b'; // yellow
  } else if (validation.score >= 25) {
    level = 'weak';
    color = '#f97316'; // orange
  }
  
  return {
    ...validation,
    level,
    color
  };
};

export const PasswordSecurityValidator: React.FC<PasswordSecurityValidatorProps> = ({
  password,
  onPasswordChange,
  showStrengthIndicator = true,
  requireStrongPassword = true,
  onValidationChange,
  className = '',
  placeholder = '••••••••••••',
  disabled = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    issues: [],
    recommendations: [],
    level: 'very-weak',
    color: '#ef4444'
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const strength = getPasswordStrength(password);
    setPasswordStrength(strength);
    
    // Notify parent component about validation status
    if (onValidationChange) {
      const isValid = requireStrongPassword 
        ? strength.score >= 70 && strength.issues.length === 0
        : strength.score >= 25;
      onValidationChange(isValid, strength.issues);
    }
  }, [password, requireStrongPassword, onValidationChange]);

  const generateStrongPassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';
    
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest (12-16 characters total)
    const length = 12 + Math.floor(Math.random() * 5);
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    onPasswordChange(password);
  };

  const getStrengthText = (level: PasswordStrength['level']): string => {
    switch (level) {
      case 'very-weak': return 'Very Weak';
      case 'weak': return 'Weak';
      case 'fair': return 'Fair';
      case 'good': return 'Good';
      case 'strong': return 'Strong';
      default: return 'Unknown';
    }
  };

  const getSecurityIcon = () => {
    if (passwordStrength.score >= 70) {
      return <Shield className="h-4 w-4 text-green-600" />;
    } else if (passwordStrength.score >= 50) {
      return <Info className="h-4 w-4 text-blue-600" />;
    } else if (passwordStrength.score >= 25) {
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="password-input" className="flex items-center gap-2">
          Password
          {getSecurityIcon()}
        </Label>
        
        <div className="relative">
          <Input
            id="password-input"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="pr-20"
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              className="h-6 w-6 p-0"
              disabled={disabled}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={generateStrongPassword}
              className="h-6 w-6 p-0"
              title="Generate strong password"
              disabled={disabled}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {showStrengthIndicator && password && (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Password Strength</span>
              <span 
                className="font-medium"
                style={{ color: passwordStrength.color }}
              >
                {getStrengthText(passwordStrength.level)} ({passwordStrength.score}%)
              </span>
            </div>
            
            <Progress 
              value={passwordStrength.score} 
              className="h-2"
              style={{
                '--progress-background': passwordStrength.color
              } as React.CSSProperties}
            />
          </div>

          {passwordStrength.issues.length > 0 && (
            <Alert variant={passwordStrength.score >= 50 ? "default" : "destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Security Issues:</p>
                  <ul className="text-sm space-y-1">
                    {passwordStrength.issues.map((issue, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-destructive">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {passwordStrength.recommendations.length > 0 && (
            <div className="space-y-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
              >
                {showDetails ? 'Hide' : 'Show'} Security Recommendations
              </Button>
              
              {showDetails && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Recommendations:</p>
                      <ul className="text-sm space-y-1">
                        {passwordStrength.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 mt-1 text-blue-600" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Security Benefits Information */}
          {passwordStrength.score >= 70 && (
            <Alert className="border-green-200 bg-green-50">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Excellent Security:</strong> This password provides strong protection against brute force attacks and is suitable for high-security applications.
              </AlertDescription>
            </Alert>
          )}

          {/* Leaked Password Warning */}
          {password.length >= 6 && (
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Breach Protection:</strong> When you submit this password, our system will automatically check if it has been found in data breaches and reject compromised passwords.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};