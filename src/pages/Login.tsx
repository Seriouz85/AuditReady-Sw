import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Shield, Key, Fingerprint, AlertCircle, Mail, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DEMO_EMAIL, DEMO_PASSWORD, supabase } from "@/lib/supabase";
import { toast } from "@/utils/toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ZoomToggle } from "@/components/ui/zoom-toggle";
import { EntraIdLoginButton } from "@/components/auth/EntraIdLoginButton";

// Removed unused variables: createAdminUser, ADMIN_EMAIL, ADMIN_PASSWORD, MAIN_APP_URL

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { signIn, user, loading } = useAuth();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitTimeLeft, setRateLimitTimeLeft] = useState(0);

  // Redirect if already logged in (but only for users with proper organizations or special roles)
  useEffect(() => {
    if (user && !loading) {
      // Only auto-redirect if we came from a protected route or if user has proper setup
      if (location.state?.from?.pathname) {
        navigate(location.state.from.pathname, { replace: true });
      }
      // Otherwise let the user manually navigate via the login form
    }
  }, [user, loading, navigate, location]);

  useEffect(() => {
    // Check if Supabase is properly configured
    const checkSupabase = async () => {
      try {
        const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'];
        const supabaseKey = import.meta.env['VITE_SUPABASE_ANON_KEY'];
        
        if (supabaseUrl && supabaseKey && supabaseUrl !== 'your-supabase-url') {
          setIsSupabaseConfigured(true);
        } else {
          console.log("Supabase not configured, will use mock authentication");
          setIsSupabaseConfigured(false);
        }
      } catch (error) {
        console.error("Error checking Supabase configuration:", error);
        setIsSupabaseConfigured(false);
      }
    };
    
    // Load remembered credentials if they exist
    const loadRememberedCredentials = () => {
      const rememberedEmail = localStorage.getItem('auditready_remember_email');
      const rememberedPassword = localStorage.getItem('auditready_remember_password');
      const isRemembered = localStorage.getItem('auditready_remember_me') === 'true';
      
      if (isRemembered && rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberMe(true);
        // Only load password if it exists (for demo purposes)
        if (rememberedPassword) {
          setPassword(rememberedPassword);
        }
      }
    };
    
    checkSupabase();
    loadRememberedCredentials();
  }, []);

  // Rate limiting effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRateLimited && rateLimitTimeLeft > 0) {
      timer = setInterval(() => {
        setRateLimitTimeLeft(prev => {
          if (prev <= 1) {
            setIsRateLimited(false);
            setLoginAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRateLimited, rateLimitTimeLeft]);

  // Function to handle remember me storage
  const handleRememberMe = () => {
    if (rememberMe) {
      localStorage.setItem('auditready_remember_me', 'true');
      localStorage.setItem('auditready_remember_email', email);
      // Only save password for demo credentials for convenience
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        localStorage.setItem('auditready_remember_password', password);
      }
    } else {
      localStorage.removeItem('auditready_remember_me');
      localStorage.removeItem('auditready_remember_email');
      localStorage.removeItem('auditready_remember_password');
    }
  };

  // Function to redirect to the main app
  const redirectToMainApp = () => {
    navigate("/app");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting (bypass for platform admins)
    const isPlatformAdminEmail = email.toLowerCase() === 'payam.razifar@gmail.com' || 
                                 email.toLowerCase() === 'admin@auditready.com';
    if (isRateLimited && !isPlatformAdminEmail) {
      setLoginError(`Too many failed attempts. Please try again in ${rateLimitTimeLeft} seconds.`);
      return;
    }

    setIsLoading(true);
    setLoginError("");

    try {
      const result = await signIn(email, password);
      
      if (result.error) {
        // Handle password security issues specifically
        if (result.passwordSecurity?.isWeak) {
          setLoginError(result.passwordSecurity.reason || 'Password security issue detected');
          toast.error(`🔐 Security Alert: ${result.passwordSecurity.reason || 'Your password has security issues'}`);
          // Optionally redirect to password reset
          setShowForgotPassword(true);
        } else {
          setLoginError(result.error);
        }
        
        // Handle failed login attempt for rate limiting (skip for platform admins)
        if (!isPlatformAdminEmail) {
          const newAttempts = loginAttempts + 1;
          setLoginAttempts(newAttempts);
          
          // Rate limit after 5 failed attempts
          if (newAttempts >= 5) {
            setIsRateLimited(true);
            setRateLimitTimeLeft(300); // 5 minutes
          }
        }
        return;
      }
      
      // Success - handle remember me and reset attempts
      handleRememberMe();
      setLoginAttempts(0);
      setIsRateLimited(false);
      
      // Show success message
      if (email === DEMO_EMAIL) {
        toast.success("Successfully logged in with demo credentials");
      } else {
        toast.success("Successfully logged in");
      }
      
      // Small delay to ensure auth state propagates before redirect
      setTimeout(() => {
        // Check if this is a platform admin
        const isPlatformAdmin = email.toLowerCase() === 'payam.razifar@gmail.com' || 
                               email.toLowerCase() === 'admin@auditready.com';
        
        // Redirect based on user type and context
        if (isPlatformAdmin) {
          // Platform admins always go to admin console
          navigate("/admin", { replace: true });
        } else if (location.state?.from?.pathname) {
          // User was trying to access a protected route, redirect there
          navigate(location.state.from.pathname, { replace: true });
        } else {
          // Direct login, redirect to main app
          navigate("/app", { replace: true });
        }
      }, 100);
      
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'microsoft') => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: provider === 'microsoft' ? 'azure' : provider,
          options: {
            redirectTo: `${window.location.origin}/app`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          }
        });
        
        if (error) {
          console.error(`${provider} OAuth error:`, error);
          if (error.message.includes('not enabled')) {
            toast.error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login is not configured for this application`);
          } else {
            toast.error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login failed: ${error.message}`);
          }
        } else {
          // OAuth redirect will happen automatically
          toast.info(`Redirecting to ${provider.charAt(0).toUpperCase() + provider.slice(1)}...`);
        }
      } else {
        // Demo mode - simulate social login success  
        const result = await signIn(DEMO_EMAIL, DEMO_PASSWORD);
        if (!result.error) {
          toast.success(`Successfully logged in with ${provider.charAt(0).toUpperCase() + provider.slice(1)} (demo mode)`);
          handleRememberMe();
          redirectToMainApp();
        } else {
          throw new Error(result.error);
        }
      }
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };


  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsForgotPasswordLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
          redirectTo: `${window.location.origin}/reset-password`
        });
        
        if (error) {
          console.error("Password reset failed:", error);
          // Provide more user-friendly error messages
          if (error.message.includes('User not found')) {
            toast.error("No account found with this email address");
          } else if (error.message.includes('Email rate limit exceeded')) {
            toast.error("Too many password reset attempts. Please try again later.");
          } else {
            toast.error(`Password reset failed: ${error.message}`);
          }
        } else {
          toast.success("Password reset email sent! Check your inbox and spam folder.");
          setShowForgotPassword(false);
          setForgotPasswordEmail("");
        }
      } else {
        // Demo mode - simulate realistic behavior
        console.log("Demo password reset for:", forgotPasswordEmail);
        
        // Simulate email validation for demo accounts
        if (forgotPasswordEmail === 'demo@auditready.com') {
          toast.success("Password reset email sent! (Demo mode - password remains: AuditReady@Demo2025!)");
        } else {
          toast.info("Password reset email sent (demo mode - check console for details)");
        }
        
        setShowForgotPassword(false);
        setForgotPasswordEmail("");
      }
    } catch (error) {
      const err = error as Error;
      console.error("Password reset error:", err);
      toast.error("Failed to send password reset email. Please try again.");
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex ${theme === 'light' ? 'bg-gradient-to-b from-slate-100 to-white' : 'bg-gradient-to-b from-slate-900 to-slate-800'}`}>
      {/* Left side - Login Form */}
      <div className={`flex-1 flex flex-col items-center justify-center p-1 sm:p-2 ${theme === 'light' ? 'bg-white' : 'bg-slate-800/90'}`}>
        {/* Card Container for Login */}
        <div className="w-full max-w-lg px-2 sm:ml-auto sm:mr-8">
          {/* Logo and Theme Toggle */}
          <div className="w-full flex justify-between items-center mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <Shield className={`h-6 w-6 sm:h-8 sm:w-8 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
              <span className={`text-xl sm:text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent'}`}>AuditReady</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                className={`flex items-center gap-2 ${theme === 'light' ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-200 hover:text-slate-100 hover:bg-slate-700'}`}
                onClick={() => navigate("/")}
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              <ZoomToggle />
              <ThemeToggle />
            </div>
          </div>
          {/* Divider */}
          <div className={`w-full h-px ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-600'} mb-3 sm:mb-4`} />
          {/* Card for Login Form */}
          <div className={`w-full space-y-6 p-8 rounded-2xl border shadow-xl ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800/90 backdrop-blur-lg border-slate-600'}`}> 
            <div className="text-center space-y-4">
              <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>Welcome Back</h1>
              <p className={`text-base ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Secure access to your compliance dashboard</p>
              
              {/* Demo vs Live Mode Indicator */}
              {isSupabaseConfigured ? (
                <div className={`mt-2 p-2 rounded-lg border ${theme === 'light' ? 'bg-green-50 border-green-200' : 'bg-green-900/20 border-green-700'}`}>
                  <p className={`text-xs font-medium ${theme === 'light' ? 'text-green-800' : 'text-green-300'}`}>
                    🟢 Live Mode
                  </p>
                </div>
              ) : (
                <div className={`mt-2 p-2 rounded-lg border ${theme === 'light' ? 'bg-amber-50 border-amber-200' : 'bg-amber-900/20 border-amber-700'}`}>
                  <p className={`text-xs font-medium ${theme === 'light' ? 'text-amber-800' : 'text-amber-300'}`}>
                    🧪 Demo Mode
                  </p>
                </div>
              )}
            </div>
            {loginError && (
              <div className={`rounded-lg p-3 text-sm flex items-start gap-2 border-2 ${theme === 'light' ? 'bg-red-50 border-red-300' : 'bg-red-900/20 border-red-700'}`}> 
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className={`font-medium ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`}>Authentication Error</p>
                  <p className={theme === 'light' ? 'text-red-600' : 'text-red-300'}>{loginError}</p>
                  {loginAttempts > 0 && loginAttempts < 5 && !isRateLimited && (
                    <p className={`mt-1 text-xs ${theme === 'light' ? 'text-red-500' : 'text-red-400'}`}>
                      {5 - loginAttempts} attempts remaining before temporary lockout
                    </p>
                  )}
                </div>
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <label className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`h-12 border-2 transition-all ${theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100' : 'bg-slate-600/50 border-slate-500 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-900/30'}`}
                  placeholder={DEMO_EMAIL}
                  required
                />
              </div>
              <div className="space-y-3">
                <label className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-12 border-2 transition-all ${theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100' : 'bg-slate-600/50 border-slate-500 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-900/30'}`}
                  placeholder="••••••"
                  required
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe} 
                    onCheckedChange={(checked) => {
                      const isChecked = checked === true;
                      setRememberMe(isChecked);
                      // If unchecked, immediately clear stored credentials
                      if (!isChecked) {
                        localStorage.removeItem('auditready_remember_me');
                        localStorage.removeItem('auditready_remember_email');
                        localStorage.removeItem('auditready_remember_password');
                      }
                    }} 
                  />
                  <label htmlFor="remember" className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Remember me</label>
                </div>
                <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="link" className={`text-sm px-0 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}>
                      Forgot password?
                    </Button>
                  </DialogTrigger>
                  <DialogContent className={`sm:max-w-md ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-600'}`}>
                    <DialogHeader>
                      <DialogTitle className={`flex items-center gap-2 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                        <Mail className="h-5 w-5" />
                        Reset Password
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="space-y-2">
                        <label className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                          Enter your email address and we'll send you a secure password reset link.
                        </label>
                        <Input
                          type="email"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          className={`${theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-blue-500' : 'bg-slate-700 border-slate-600 text-slate-100 focus:border-blue-500'}`}
                          placeholder="Enter your email address"
                          required
                          autoComplete="email"
                        />
                        {!isSupabaseConfigured && (
                          <p className={`text-xs ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`}>
                            Demo mode: Password reset simulation only
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowForgotPassword(false)}
                          className={`flex-1 ${theme === 'light' ? 'border-slate-200 text-slate-600' : 'border-slate-600 text-slate-300'}`}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isForgotPasswordLoading}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                        >
                          {isForgotPasswordLoading ? 'Sending...' : 'Send Reset Email'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <Button type="submit" className="w-full h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg text-white font-semibold text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading || isRateLimited}>
                {isRateLimited 
                  ? `Try again in ${rateLimitTimeLeft}s` 
                  : isLoading 
                    ? 'Signing in...' 
                    : 'Sign In'
                }
              </Button>
            </form>
            <div className="flex items-center gap-2 my-1">
              <div className={`flex-1 h-px ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-600'}`} />
              <span className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>or</span>
              <div className={`flex-1 h-px ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-600'}`} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                type="button" 
                onClick={() => handleSocialLogin('google')} 
                disabled={isLoading}
                className={`h-12 rounded-full font-semibold shadow-sm border transition-all flex items-center justify-center gap-2 ${theme === 'light' ? 'bg-white hover:bg-gray-50 text-gray-700 border-slate-200' : 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-500'}`}
                title={isSupabaseConfigured ? 'Sign in with Google' : 'Demo Google login'}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <EntraIdLoginButton
                tenantId={import.meta.env['VITE_ENTRA_TENANT_ID']}
                clientId={import.meta.env['VITE_ENTRA_CLIENT_ID']}
                redirectUri={`${window.location.origin}/auth/callback/entra`}
                disabled={isLoading}
                onLoginStart={() => setIsLoading(true)}
                onLoginError={(error) => {
                  setIsLoading(false);
                  setLoginError(error);
                  toast.error(`Microsoft SSO failed: ${error}`);
                }}
                className="w-full"
              />
            </div>
            
            <div className="text-center space-y-2">
              <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                Don't have an account?{' '}
                <Link to={isSupabaseConfigured ? "/signup" : "/pricing"} className={`${theme === 'light' ? 'text-blue-600' : 'text-blue-400'} hover:underline font-medium`}>
                  {isSupabaseConfigured ? "Create account" : "Try demo"}
                </Link>
              </p>
              {isSupabaseConfigured && (
                <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  Or explore our{' '}
                  <Link to="/pricing" className={`${theme === 'light' ? 'text-blue-600' : 'text-blue-400'} hover:underline`}>
                    pricing and demo
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Features */}
      <div className={`hidden lg:flex flex-1 flex-col justify-center px-4 relative ${theme === 'light' ? 'bg-slate-50' : ''}`}>
        {theme === 'dark' && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-transparent to-slate-700/10"></div>
        )}
        {/* Added max-width container to bring content closer to center */}
        <div className="max-w-lg mr-auto ml-8 relative z-10">
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>Why Choose AuditReady?</h2>
          <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
            Join thousands of organizations that trust AuditReady for their compliance needs
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/20'}`}>
                <Shield className={`h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
              </div>
              <div>
                <h3 className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>Comprehensive Compliance</h3>
                <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>Manage multiple compliance frameworks in one place</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`p-2 rounded ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/20'}`}>
                <Key className={`h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
              </div>
              <div>
                <h3 className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>Enterprise Security</h3>
                <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>Bank-grade security with end-to-end encryption</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`p-2 rounded ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/20'}`}>
                <Fingerprint className={`h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
              </div>
              <div>
                <h3 className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>Automated Workflows</h3>
                <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>Streamline your compliance processes with automation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 