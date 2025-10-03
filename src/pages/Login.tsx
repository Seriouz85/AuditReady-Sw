import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Shield, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_EMAIL, DEMO_PASSWORD, supabase } from "@/lib/supabase";
import { toast } from "@/utils/toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ZoomToggle } from "@/components/ui/zoom-toggle";
import { LoginForm } from "@/components/auth/LoginForm";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { ForgotPasswordDialog } from "@/components/auth/ForgotPasswordDialog";
import { LoginFeatures } from "@/components/auth/LoginFeatures";
import { isPlatformAdmin, getLoginRedirectPath, shouldBypassRateLimit } from "@/utils/authHelpers";

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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitTimeLeft, setRateLimitTimeLeft] = useState(0);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      // Don't auto-redirect to admin routes - let login flow handle proper routing
      const fromPath = location.state?.from?.pathname;
      if (fromPath && !fromPath.startsWith('/admin')) {
        navigate(fromPath, { replace: true });
      }
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
      const isRemembered = localStorage.getItem('auditready_remember_me') === 'true';

      if (isRemembered && rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberMe(true);
        // 🔒 SECURITY FIX (Issue #1): Never store passwords in localStorage, even for demo
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
      // 🔒 SECURITY FIX (Issue #1): Never store passwords - only email
    } else {
      localStorage.removeItem('auditready_remember_me');
      localStorage.removeItem('auditready_remember_email');
      // Clean up any legacy password storage
      localStorage.removeItem('auditready_remember_password');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limiting (bypass for platform admins)
    if (isRateLimited && !shouldBypassRateLimit(email)) {
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
          setShowForgotPassword(true);
        } else {
          setLoginError(result.error);
        }

        // Handle failed login attempt for rate limiting (skip for platform admins)
        if (!shouldBypassRateLimit(email)) {
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

      // Check if user is a platform administrator (skip for demo account)
      // Small delay to ensure auth state propagates before checking admin status
      setTimeout(async () => {
        try {
          // Skip admin check for demo account
          if (email === DEMO_EMAIL) {
            const redirectPath = getLoginRedirectPath(
              email,
              location.state?.from?.pathname
            );
            navigate(redirectPath, { replace: true });
            return;
          }

          // Check platform_administrators table for real users
          const { data: adminData } = await supabase
            .from('platform_administrators')
            .select('role')
            .eq('email', email)
            .eq('is_active', true)
            .maybeSingle();

          // Redirect platform admins to admin console
          if (adminData) {
            console.log('🔒 Platform admin login detected, redirecting to admin console');
            navigate('/admin', { replace: true });
          } else {
            // Regular users go to dashboard or their intended path
            const redirectPath = getLoginRedirectPath(
              email,
              location.state?.from?.pathname
            );
            navigate(redirectPath, { replace: true });
          }
        } catch (error) {
          console.error('Error checking platform admin status:', error);
          // Fallback to regular redirect
          const redirectPath = getLoginRedirectPath(
            email,
            location.state?.from?.pathname
          );
          navigate(redirectPath, { replace: true });
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
          toast.info(`Redirecting to ${provider.charAt(0).toUpperCase() + provider.slice(1)}...`);
        }
      } else {
        // Demo mode - simulate social login success
        const result = await signIn(DEMO_EMAIL, DEMO_PASSWORD);
        if (!result.error) {
          toast.success(`Successfully logged in with ${provider.charAt(0).toUpperCase() + provider.slice(1)} (demo mode)`);
          handleRememberMe();
          navigate("/app");
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

  return (
    <div className={`min-h-screen flex ${theme === 'light' ? 'bg-gradient-to-b from-slate-100 to-white' : 'bg-gradient-to-b from-slate-900 to-slate-800'}`}>
      {/* Left side - Login Form */}
      <div className={`flex-1 flex flex-col items-center justify-center p-1 sm:p-2 ${theme === 'light' ? 'bg-white' : 'bg-slate-800/90'}`}>
        <div className="w-full max-w-lg px-2 sm:ml-auto sm:mr-8">
          {/* Logo and Theme Toggle */}
          <div className="w-full flex justify-between items-center mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <Shield className={`h-6 w-6 sm:h-8 sm:w-8 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} aria-hidden="true" />
              <span className={`text-xl sm:text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent'}`}>
                AuditReady
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 ${theme === 'light' ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-200 hover:text-slate-100 hover:bg-slate-700'}`}
                onClick={() => navigate("/")}
                aria-label="Go to home page"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              <ZoomToggle />
              <ThemeToggle />
            </div>
          </div>

          {/* Divider */}
          <div className={`w-full h-px ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-600'} mb-3 sm:mb-4`} aria-hidden="true" />

          {/* Card for Login Form */}
          <div className={`w-full space-y-6 p-8 rounded-2xl border shadow-xl ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800/90 backdrop-blur-lg border-slate-600'}`}>
            <div className="text-center space-y-4">
              <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                Welcome Back
              </h1>
              <p className={`text-base ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                Secure access to your compliance dashboard
              </p>

              {/* Demo vs Live Mode Indicator */}
              {isSupabaseConfigured ? (
                <div
                  className={`mt-2 p-2 rounded-lg border ${theme === 'light' ? 'bg-green-50 border-green-200' : 'bg-green-900/20 border-green-700'}`}
                  role="status"
                  aria-label="Live mode active"
                >
                  <p className={`text-xs font-medium ${theme === 'light' ? 'text-green-800' : 'text-green-300'}`}>
                    🟢 Live Mode
                  </p>
                </div>
              ) : (
                <div
                  className={`mt-2 p-2 rounded-lg border ${theme === 'light' ? 'bg-amber-50 border-amber-200' : 'bg-amber-900/20 border-amber-700'}`}
                  role="status"
                  aria-label="Demo mode active"
                >
                  <p className={`text-xs font-medium ${theme === 'light' ? 'text-amber-800' : 'text-amber-300'}`}>
                    🧪 Demo Mode
                  </p>
                </div>
              )}
            </div>

            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
              loginError={loginError}
              loginAttempts={loginAttempts}
              isRateLimited={isRateLimited}
              rateLimitTimeLeft={rateLimitTimeLeft}
              isLoading={isLoading}
              onSubmit={handleLogin}
              onForgotPassword={() => setShowForgotPassword(true)}
              theme={theme}
            />

            <SocialLoginButtons
              isLoading={isLoading}
              isSupabaseConfigured={isSupabaseConfigured}
              onGoogleLogin={() => handleSocialLogin('google')}
              onMicrosoftLoginStart={() => setIsLoading(true)}
              onMicrosoftLoginError={(error) => {
                setIsLoading(false);
                setLoginError(error);
                toast.error(`Microsoft SSO failed: ${error}`);
              }}
              theme={theme}
            />

            <div className="text-center space-y-2">
              <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                Don't have an account?{' '}
                <Link
                  to={isSupabaseConfigured ? "/signup" : "/pricing"}
                  className={`${theme === 'light' ? 'text-blue-600' : 'text-blue-400'} hover:underline font-medium`}
                >
                  {isSupabaseConfigured ? "Create account" : "Try demo"}
                </Link>
              </p>
              {isSupabaseConfigured && (
                <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  Or explore our{' '}
                  <Link
                    to="/pricing"
                    className={`${theme === 'light' ? 'text-blue-600' : 'text-blue-400'} hover:underline`}
                  >
                    pricing and demo
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Features */}
      <LoginFeatures theme={theme} />

      {/* Forgot Password Dialog */}
      <ForgotPasswordDialog
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
        isSupabaseConfigured={isSupabaseConfigured}
        theme={theme}
      />
    </div>
  );
};

export default Login;
