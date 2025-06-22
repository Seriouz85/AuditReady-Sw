import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Shield, Mail, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "@/utils/toast";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ZoomToggle } from "@/components/ui/zoom-toggle";
import { useAuth } from "@/contexts/AuthContext";

const EmailVerification = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | 'expired'>('pending');
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Auto-verify if we have tokens in URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');

    if (type === 'signup' && accessToken && refreshToken) {
      handleEmailVerification(accessToken, refreshToken);
    } else if (user?.email_confirmed_at) {
      // User is already verified
      setVerificationStatus('success');
    } else {
      // Check if we can enable resend (after cooldown)
      const lastResent = localStorage.getItem('last_verification_resent');
      if (lastResent) {
        const timeSince = Date.now() - parseInt(lastResent);
        const cooldownTime = 60000; // 1 minute cooldown
        
        if (timeSince < cooldownTime) {
          setResendCooldown(Math.ceil((cooldownTime - timeSince) / 1000));
          const interval = setInterval(() => {
            setResendCooldown(prev => {
              if (prev <= 1) {
                setCanResend(true);
                clearInterval(interval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          return () => clearInterval(interval);
        } else {
          setCanResend(true);
        }
      } else {
        setCanResend(true);
      }
    }
  }, [searchParams, user]);

  const handleEmailVerification = async (accessToken: string, refreshToken: string) => {
    setIsVerifying(true);
    try {
      // Set the session with the verification tokens
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      if (error) {
        console.error('Email verification failed:', error);
        setVerificationStatus('error');
        setErrorMessage(error.message);
        return;
      }

      if (data.user?.email_confirmed_at) {
        setVerificationStatus('success');
        toast.success('Email verified successfully!');
        
        // Redirect to onboarding after a short delay
        setTimeout(() => {
          navigate('/onboarding', { replace: true });
        }, 2000);
      } else {
        setVerificationStatus('error');
        setErrorMessage('Email verification incomplete');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('error');
      setErrorMessage('An unexpected error occurred during verification');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resendEmail.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resendEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: resendEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/email-verification`
        }
      });

      if (error) {
        console.error('Resend verification failed:', error);
        if (error.message.includes('Email rate limit exceeded')) {
          toast.error('Too many verification emails sent. Please wait before trying again.');
        } else if (error.message.includes('User not found')) {
          toast.error('No account found with this email address');
        } else {
          toast.error(`Failed to resend verification: ${error.message}`);
        }
      } else {
        toast.success('Verification email sent! Check your inbox and spam folder.');
        setCanResend(false);
        setResendCooldown(60);
        localStorage.setItem('last_verification_resent', Date.now().toString());
        
        // Start cooldown timer
        const interval = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              setCanResend(true);
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'success':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className={`h-16 w-16 mx-auto ${theme === 'light' ? 'text-green-500' : 'text-green-400'}`} />
            <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
              Email Verified!
            </h1>
            <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
              Your email has been successfully verified. You can now access all features of AuditReady.
            </p>
            <Button 
              onClick={() => navigate('/onboarding')}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              Continue to Setup
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-4">
            <AlertCircle className={`h-16 w-16 mx-auto ${theme === 'light' ? 'text-red-500' : 'text-red-400'}`} />
            <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
              Verification Failed
            </h1>
            <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
              {errorMessage || 'The verification link is invalid or has expired. Please request a new one.'}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => setVerificationStatus('pending')}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              >
                Back to Login
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            {isVerifying ? (
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
                <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                  Verifying Email...
                </h1>
                <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                  Please wait while we verify your email address.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center space-y-4">
                  <Mail className={`h-16 w-16 mx-auto ${theme === 'light' ? 'text-blue-500' : 'text-blue-400'}`} />
                  <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                    Verify Your Email
                  </h1>
                  <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                    We've sent a verification link to your email address. Click the link to verify your account and complete your registration.
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${theme === 'light' ? 'bg-blue-50 border border-blue-200' : 'bg-blue-900/20 border border-blue-700'}`}>
                  <h3 className={`font-medium mb-2 ${theme === 'light' ? 'text-blue-900' : 'text-blue-100'}`}>
                    Didn't receive the email?
                  </h3>
                  <ul className={`text-sm space-y-1 mb-4 ${theme === 'light' ? 'text-blue-700' : 'text-blue-300'}`}>
                    <li>• Check your spam/junk folder</li>
                    <li>• Make sure you entered the correct email address</li>
                    <li>• Wait a few minutes for the email to arrive</li>
                  </ul>
                  
                  <form onSubmit={handleResendVerification} className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className={`${theme === 'light' ? 'bg-white border-blue-300' : 'bg-slate-700 border-blue-600'}`}
                      required
                    />
                    <Button
                      type="submit"
                      disabled={isResending || !canResend}
                      variant="outline"
                      className={`w-full ${theme === 'light' ? 'border-blue-300 text-blue-700' : 'border-blue-600 text-blue-300'}`}
                    >
                      {isResending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : !canResend ? (
                        `Resend in ${resendCooldown}s`
                      ) : (
                        'Resend Verification Email'
                      )}
                    </Button>
                  </form>
                </div>

                <div className="text-center">
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/login')}
                    className={`text-sm ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}
                  >
                    Back to Login
                  </Button>
                </div>
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen flex ${theme === 'light' ? 'bg-slate-100' : 'bg-gradient-to-b from-slate-900 to-slate-800'}`}>
      {/* Main Content */}
      <div className={`flex-1 flex flex-col items-center justify-center p-4 ${theme === 'light' ? 'bg-white' : 'bg-slate-800/90'}`}>
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <Shield className={`h-8 w-8 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
              <span className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>AuditReady</span>
            </div>
            <div className="flex items-center gap-2">
              <ZoomToggle />
              <ThemeToggle />
            </div>
          </div>

          {/* Content */}
          <div className={`p-8 rounded-2xl border shadow-xl ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-600'}`}>
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Right side - Benefits */}
      <div className={`hidden lg:flex flex-1 flex-col justify-center px-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
        <div className="max-w-lg mr-auto ml-8">
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
            Secure Email Verification
          </h2>
          <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
            Email verification helps us ensure the security of your account and enables important features.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/20'}`}>
                <Shield className={`h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
              </div>
              <div>
                <h3 className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                  Account Security
                </h3>
                <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                  Verification protects your account from unauthorized access
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`p-2 rounded ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/20'}`}>
                <Mail className={`h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
              </div>
              <div>
                <h3 className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                  Important Notifications
                </h3>
                <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                  Receive critical updates about your compliance progress
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`p-2 rounded ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/20'}`}>
                <CheckCircle className={`h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
              </div>
              <div>
                <h3 className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                  Full Platform Access
                </h3>
                <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                  Unlock all features after email verification
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;