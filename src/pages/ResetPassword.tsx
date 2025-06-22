import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Shield, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "@/utils/toast";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ZoomToggle } from "@/components/ui/zoom-toggle";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Password strength validation
  const validatePassword = (pwd: string) => {
    const requirements = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    };
    
    return requirements;
  };

  const passwordRequirements = validatePassword(password);
  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  useEffect(() => {
    // Check if we have the necessary tokens from the URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');

    if (type === 'recovery' && accessToken && refreshToken) {
      // Set the session with the tokens
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      }).then(({ error }) => {
        if (error) {
          console.error('Session setup failed:', error);
          setIsTokenValid(false);
          toast.error('Invalid or expired reset link. Please request a new one.');
        } else {
          setIsTokenValid(true);
        }
      });
    } else {
      setIsTokenValid(false);
      toast.error('Invalid reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      setResetError("Password doesn't meet security requirements");
      return;
    }

    if (!doPasswordsMatch) {
      setResetError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setResetError("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error("Password reset failed:", error);
        setResetError(`Password reset failed: ${error.message}`);
      } else {
        setIsComplete(true);
        toast.success("Password updated successfully!");
        
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login", { 
            state: { 
              message: "Password updated successfully. Please log in with your new password." 
            }
          });
        }, 3000);
      }
    } catch (error) {
      const err = error as Error;
      console.error("Password reset error:", err);
      setResetError("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isTokenValid === null) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'light' ? 'bg-slate-100' : 'bg-gradient-to-b from-slate-900 to-slate-800'}`}>
        <div className={`text-center ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          Validating reset link...
        </div>
      </div>
    );
  }

  if (isTokenValid === false) {
    return (
      <div className={`min-h-screen flex ${theme === 'light' ? 'bg-slate-100' : 'bg-gradient-to-b from-slate-900 to-slate-800'}`}>
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

            <div className={`p-8 rounded-2xl border shadow-xl ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-600'}`}>
              <div className="text-center space-y-4">
                <AlertCircle className={`h-16 w-16 mx-auto ${theme === 'light' ? 'text-red-500' : 'text-red-400'}`} />
                <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                  Invalid Reset Link
                </h1>
                <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
                <Button 
                  onClick={() => navigate("/login")} 
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className={`min-h-screen flex ${theme === 'light' ? 'bg-slate-100' : 'bg-gradient-to-b from-slate-900 to-slate-800'}`}>
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

            <div className={`p-8 rounded-2xl border shadow-xl ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-600'}`}>
              <div className="text-center space-y-4">
                <CheckCircle className={`h-16 w-16 mx-auto ${theme === 'light' ? 'text-green-500' : 'text-green-400'}`} />
                <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                  Password Updated!
                </h1>
                <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                  Your password has been successfully updated. You'll be redirected to the login page shortly.
                </p>
                <Button 
                  onClick={() => navigate("/login")} 
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                >
                  Continue to Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${theme === 'light' ? 'bg-slate-100' : 'bg-gradient-to-b from-slate-900 to-slate-800'}`}>
      {/* Left side - Reset Form */}
      <div className={`flex-1 flex flex-col items-center justify-center p-4 ${theme === 'light' ? 'bg-white' : 'bg-slate-800/90'}`}>
        <div className="w-full max-w-lg">
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

          {/* Reset Form */}
          <div className={`p-8 rounded-2xl border shadow-xl ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-600'}`}>
            <div className="text-center space-y-2 mb-6">
              <Lock className={`h-12 w-12 mx-auto ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
              <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                Create New Password
              </h1>
              <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                Enter a strong new password for your account
              </p>
            </div>

            {resetError && (
              <div className={`rounded-lg p-3 text-sm flex items-start gap-2 border-2 mb-4 ${theme === 'light' ? 'bg-red-50 border-red-300' : 'bg-red-900/20 border-red-700'}`}>
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className={`font-medium ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`}>Error</p>
                  <p className={theme === 'light' ? 'text-red-600' : 'text-red-300'}>{resetError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* New Password */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`h-12 border-2 pr-10 transition-all ${theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-blue-500' : 'bg-slate-600/50 border-slate-500 text-slate-100 focus:border-blue-500'}`}
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme === 'light' ? 'text-slate-400 hover:text-slate-600' : 'text-slate-400 hover:text-slate-300'}`}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              {password && (
                <div className={`p-3 rounded-lg ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-700/50'}`}>
                  <p className={`text-sm font-medium mb-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Password Requirements:
                  </p>
                  <div className="space-y-1">
                    {Object.entries({
                      'At least 8 characters': passwordRequirements.length,
                      'One uppercase letter': passwordRequirements.uppercase,
                      'One lowercase letter': passwordRequirements.lowercase,
                      'One number': passwordRequirements.number,
                      'One special character': passwordRequirements.special
                    }).map(([requirement, met]) => (
                      <div key={requirement} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          met ? 'bg-green-500' : theme === 'light' ? 'bg-slate-300' : 'bg-slate-600'
                        }`}>
                          {met && <CheckCircle className="h-3 w-3 text-white" />}
                        </div>
                        <span className={`text-xs ${
                          met 
                            ? theme === 'light' ? 'text-green-600' : 'text-green-400'
                            : theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          {requirement}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`h-12 border-2 pr-10 transition-all ${
                      confirmPassword && !doPasswordsMatch
                        ? theme === 'light' 
                          ? 'bg-red-50 border-red-300 focus:border-red-500' 
                          : 'bg-red-900/20 border-red-600 focus:border-red-500'
                        : theme === 'light' 
                          ? 'bg-slate-50 border-slate-200 focus:border-blue-500' 
                          : 'bg-slate-600/50 border-slate-500 text-slate-100 focus:border-blue-500'
                    }`}
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme === 'light' ? 'text-slate-400 hover:text-slate-600' : 'text-slate-400 hover:text-slate-300'}`}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {confirmPassword && !doPasswordsMatch && (
                  <p className={`text-xs ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`}>
                    Passwords do not match
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg text-white font-semibold text-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed" 
                disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
              >
                {isLoading ? 'Updating Password...' : 'Update Password'}
              </Button>
            </form>

            <div className="text-center mt-6">
              <Button 
                variant="link" 
                onClick={() => navigate("/login")}
                className={`text-sm ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}
              >
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Security Info */}
      <div className={`hidden lg:flex flex-1 flex-col justify-center px-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
        <div className="max-w-lg mr-auto ml-8">
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
            Secure Password Reset
          </h2>
          <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
            Your security is our priority. Create a strong password to protect your account.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/20'}`}>
                <Shield className={`h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
              </div>
              <div>
                <h3 className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                  Encrypted Storage
                </h3>
                <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                  Your password is encrypted and securely stored
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`p-2 rounded ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/20'}`}>
                <Lock className={`h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
              </div>
              <div>
                <h3 className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                  Strong Requirements
                </h3>
                <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                  Password policies ensure account security
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`p-2 rounded ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/20'}`}>
                <CheckCircle className={`h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
              </div>
              <div>
                <h3 className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                  Secure Reset Process
                </h3>
                <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                  Time-limited tokens ensure reset security
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;