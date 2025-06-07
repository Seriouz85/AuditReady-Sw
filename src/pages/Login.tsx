import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Key, Fingerprint, AlertCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabaseAuth, DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/supabase";
import { toast } from "@/utils/toast";
import { mockSignIn, mockSignInAnonymously } from "@/lib/mockAuth";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ZoomToggle } from "@/components/ui/zoom-toggle";

// Removed unused variables: createAdminUser, ADMIN_EMAIL, ADMIN_PASSWORD, MAIN_APP_URL

const Login = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
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

  useEffect(() => {
    // Check if Supabase is properly configured
    const checkSupabase = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
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
    
    checkSupabase();
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

  // Function to redirect to the main app
  const redirectToMainApp = () => {
    navigate("/app");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    if (isRateLimited) {
      setLoginError(`Too many failed attempts. Please try again in ${rateLimitTimeLeft} seconds.`);
      return;
    }

    setIsLoading(true);
    setLoginError("");

    console.log("Attempting login with", email);

    try {
      // Check for demo credentials first to avoid unnecessary Supabase calls
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        console.log("Demo credentials detected, using mock authentication");
        try {
          const mockUser = await mockSignIn(email, password);
          console.log("Mock login successful for demo:", mockUser);
          toast.success("Successfully logged in with demo credentials");
          // Reset attempts on successful login
          setLoginAttempts(0);
          setIsRateLimited(false);
          redirectToMainApp();
          return;
        } catch (mockError) {
          console.error("Mock login failed for demo:", mockError);
          // Fall back to anonymous auth for demo
          await mockSignInAnonymously();
          toast.info("Logged in with demo credentials");
          setLoginAttempts(0);
          setIsRateLimited(false);
          redirectToMainApp();
          return;
        }
      }

      if (isSupabaseConfigured) {
        // Try Supabase authentication for real credentials
        try {
          console.log("Attempting Supabase login");
          const { data, error } = await supabaseAuth.signIn(email, password);
          
          if (error) {
            console.error("Supabase login failed:", error);
            setLoginError(`Login failed: ${error.message}`);
            
            // Handle failed login attempt for rate limiting
            const newAttempts = loginAttempts + 1;
            setLoginAttempts(newAttempts);
            
            // Rate limit after 5 failed attempts
            if (newAttempts >= 5) {
              setIsRateLimited(true);
              setRateLimitTimeLeft(300); // 5 minutes lockout
              toast.error("Too many failed attempts. Account temporarily locked for 5 minutes.");
            }
          } else if (data?.user) {
            console.log("Supabase login successful:", data.user);
            toast.success("Successfully logged in");
            // Reset attempts on successful login
            setLoginAttempts(0);
            setIsRateLimited(false);
            redirectToMainApp();
            return;
          }
        } catch (error) {
          console.error("Supabase error:", error);
          setLoginError("Authentication service error");
        }
      } else {
        // If Supabase is not configured, use mock authentication
        try {
          console.log("Using mock authentication (Supabase not configured)");
          const mockUser = await mockSignIn(email, password);
          console.log("Mock login successful:", mockUser);
          toast.success("Successfully logged in (demo mode)");
          // Reset attempts on successful login
          setLoginAttempts(0);
          setIsRateLimited(false);
          redirectToMainApp();
          return;
        } catch (mockError) {
          const error = mockError as Error;
          console.error("Mock login failed:", error);
          setLoginError(`Login failed: ${error.message}`);
          
          // Handle failed login attempt for rate limiting
          const newAttempts = loginAttempts + 1;
          setLoginAttempts(newAttempts);
          
          // Rate limit after 5 failed attempts
          if (newAttempts >= 5) {
            setIsRateLimited(true);
            setRateLimitTimeLeft(300); // 5 minutes lockout
            toast.error("Too many failed attempts. Account temporarily locked for 5 minutes.");
            return;
          }
          
        }
      }
    } catch (error) {
      const err = error as Error;
      console.error("Login process error:", err);
      toast.error("Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOLogin = async () => {
    setIsLoading(true);
    try {
      // Try anonymous auth with mock system
      await mockSignInAnonymously();
      toast.info("Logged in with SSO (demo mode)");
      redirectToMainApp();
    } catch (error) {
      console.error("SSO login failed:", error);
      toast.error("SSO login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setIsForgotPasswordLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabaseAuth.resetPassword(forgotPasswordEmail);
        if (error) {
          console.error("Password reset failed:", error);
          toast.error(`Password reset failed: ${error.message}`);
        } else {
          toast.success("Password reset email sent. Check your inbox!");
          setShowForgotPassword(false);
          setForgotPasswordEmail("");
        }
      } else {
        // Mock mode - just show success message
        toast.info("Password reset email sent (demo mode)");
        setShowForgotPassword(false);
        setForgotPasswordEmail("");
      }
    } catch (error) {
      const err = error as Error;
      console.error("Password reset error:", err);
      toast.error("Failed to send password reset email");
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex ${theme === 'light' ? 'bg-slate-100' : 'bg-gradient-to-b from-slate-900 to-slate-800'}`}>
      {/* Left side - Login Form */}
      <div className={`flex-1 flex flex-col items-center justify-center p-4 ${theme === 'light' ? 'bg-white' : 'bg-slate-800/90'}`}>
        {/* Card Container for Login */}
        <div className="w-full max-w-lg ml-auto mr-8">
          {/* Logo and Theme Toggle */}
          <div className="w-full flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <Shield className={`h-8 w-8 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
              <span className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent'}`}>AuditReady</span>
            </div>
            <div className="flex items-center gap-2">
              <ZoomToggle />
              <ThemeToggle />
            </div>
          </div>
          {/* Divider */}
          <div className={`w-full h-px ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-600'} mb-8`} />
          {/* Card for Login Form */}
          <div className={`w-full space-y-6 p-8 rounded-2xl border shadow-xl ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-700/70 border-slate-600'}`}> 
            <div className="text-center space-y-2">
              <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>Welcome Back</h1>
              <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Secure access to your compliance dashboard</p>
              <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Demo credentials: {DEMO_EMAIL} / {DEMO_PASSWORD}</p>
              {!isSupabaseConfigured && (
                <p className={`mt-2 text-xs ${theme === 'light' ? 'text-amber-600 bg-amber-50' : 'text-amber-400 bg-amber-900/20'} p-2 rounded`}>
                  Demo mode: Using local authentication
                </p>
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
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`h-12 border-2 transition-all ${theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100' : 'bg-slate-600/50 border-slate-500 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-900/30'}`}
                  placeholder={DEMO_EMAIL}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-12 border-2 transition-all ${theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100' : 'bg-slate-600/50 border-slate-500 text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-900/30'}`}
                  placeholder="••••••"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked === true)} />
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
                          Enter your email address and we'll send you a password reset link.
                        </label>
                        <Input
                          type="email"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          className={`${theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-blue-500' : 'bg-slate-700 border-slate-600 text-slate-100 focus:border-blue-500'}`}
                          placeholder="Enter your email"
                          required
                        />
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
              <Button type="submit" className="w-full h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg text-white font-semibold text-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed" disabled={isLoading || isRateLimited}>
                {isRateLimited 
                  ? `Try again in ${rateLimitTimeLeft}s` 
                  : isLoading 
                    ? 'Signing in...' 
                    : 'Sign In'
                }
              </Button>
            </form>
            <div className="flex items-center gap-2 my-2">
              <div className={`flex-1 h-px ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-600'}`} />
              <span className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>or</span>
              <div className={`flex-1 h-px ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-600'}`} />
            </div>
            <Button type="button" onClick={handleSSOLogin} className={`w-full h-12 rounded-full font-semibold shadow-sm border transition-all ${theme === 'light' ? 'bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 border-slate-200' : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-slate-100 border-slate-500'}`}>
              Sign in with SSO
            </Button>
            
            <div className="text-center">
              <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                Don't have an account?{' '}
                <Link to="/signup" className={`${theme === 'light' ? 'text-blue-600' : 'text-blue-400'} hover:underline font-medium`}>
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Features */}
      <div className={`hidden lg:flex flex-1 flex-col justify-center px-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
        {/* Added max-width container to bring content closer to center */}
        <div className="max-w-lg mr-auto ml-8">
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