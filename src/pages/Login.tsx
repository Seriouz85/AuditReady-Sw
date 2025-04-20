import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Key, Fingerprint, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { signInWithEmailAndPassword, signInAnonymously, AuthError } from "firebase/auth";
import { auth, DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/firebase";
import { toast } from "@/utils/toast";
import { mockSignIn, mockSignInAnonymously } from "@/lib/mockAuth";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";

// Removed unused variables: createAdminUser, ADMIN_EMAIL, ADMIN_PASSWORD, MAIN_APP_URL

const Login = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isFirebaseAvailable, setIsFirebaseAvailable] = useState(true);

  useEffect(() => {
    // Check if Firebase is available by attempting anon auth
    const checkFirebase = async () => {
      try {
        await signInAnonymously(auth);
        setIsFirebaseAvailable(true);
      } catch (error) {
        console.error("Firebase authentication is unavailable:", error);
        setIsFirebaseAvailable(false);
      }
    };
    
    checkFirebase();
  }, []);

  // Function to redirect to the main app
  const redirectToMainApp = () => {
    navigate("/app");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    console.log("Attempting login with", email);

    try {
      if (isFirebaseAvailable) {
        // Try Firebase authentication first
        try {
          console.log("Attempting Firebase login");
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          console.log("Firebase login successful:", userCredential.user);
          toast.success("Successfully logged in");
          redirectToMainApp();
          return;
        } catch (error) {
          const authError = error as AuthError;
          console.error("Firebase login attempt failed:", authError.code);
          setLoginError(`Firebase login failed: ${authError.code}`);
        }
      }
      
      // If Firebase fails or is unavailable, use mock authentication
      try {
        console.log("Attempting mock login");
        const mockUser = await mockSignIn(email, password);
        console.log("Mock login successful:", mockUser);
        toast.success("Successfully logged in with mock authentication");
        redirectToMainApp();
        return;
      } catch (mockError) {
        const error = mockError as Error;
        console.error("Mock login attempt failed:", error);
        
        // If credentials don't match, show error
        setLoginError((prev) => 
          prev ? `${prev}, Mock login failed: ${error.message}` : `Mock login failed: ${error.message}`
        );
        
        // Try anonymous login as last resort
        try {
          console.log("Attempting anonymous mock login");
          await mockSignInAnonymously();
          console.log("Anonymous mock login successful");
          toast.info("Logged in anonymously for demo purposes");
          redirectToMainApp();
          return;
        } catch (anonymousError) {
          console.error("Anonymous mock login failed:", anonymousError);
          toast.error("All authentication methods failed");
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

  return (
    <div className={`min-h-screen flex ${theme === 'light' ? 'bg-slate-100' : 'bg-[#1a1f2e]'}`}>
      {/* Left side - Login Form */}
      <div className={`flex-1 flex flex-col items-center justify-center p-4 ${theme === 'light' ? 'bg-white shadow-xl' : ''}`}>
        {/* Logo and Theme Toggle */}
        <div className="w-full max-w-md flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Shield className={`h-8 w-8 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
            <span className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              AuditReady
            </span>
          </div>
          <ThemeToggle />
        </div>

        {/* Login Form */}
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Welcome Back</h1>
            <p className={`${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>
              Secure access to your compliance dashboard
            </p>
            <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-gray-500'}`}>
              Demo credentials: {DEMO_EMAIL} / {DEMO_PASSWORD}
            </p>
            {!isFirebaseAvailable && (
              <p className={`mt-2 text-xs ${theme === 'light' ? 'text-amber-600 bg-amber-50' : 'text-amber-400 bg-amber-900/20'} p-2 rounded`}>
                Using local authentication (Firebase unavailable)
              </p>
            )}
          </div>

          {loginError && (
            <div className={`${theme === 'light' ? 'bg-red-50 border-red-200' : 'bg-red-900/20 border-red-800'} rounded-md p-3 text-sm flex items-start gap-2 border`}>
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className={`font-medium ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`}>Authentication Error</p>
                <p className={theme === 'light' ? 'text-red-600' : 'text-red-300'}>{loginError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-12 ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#2a2f3e] border-gray-700 text-white'}`}
                placeholder={DEMO_EMAIL}
                required
              />
            </div>

            <div className="space-y-2">
              <label className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`h-12 ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#2a2f3e] border-gray-700 text-white'}`}
                placeholder="••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className={`${theme === 'light' ? 'border-slate-300' : 'border-gray-600'} data-[state=checked]:bg-blue-500`}
                />
                <label htmlFor="remember" className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>
                  Remember me
                </label>
              </div>
              <a href="#forgot-password" className="text-sm text-blue-500 hover:text-blue-400">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              className={`w-full h-12 text-base font-medium ${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${theme === 'light' ? 'border-slate-200' : 'border-gray-700'}`}></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className={`px-2 ${theme === 'light' ? 'bg-white text-slate-500' : 'bg-[#1a1f2e] text-gray-500'}`}>OR</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleSSOLogin}
              className={`w-full h-12 text-base font-medium flex items-center justify-center gap-2 ${theme === 'light' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
              disabled={isLoading}
            >
              <Fingerprint className="h-5 w-5" />
              Sign in with SSO
            </Button>
          </form>
        </div>
      </div>

      {/* Right side - Features */}
      <div className={`hidden lg:flex flex-1 flex-col justify-center p-8 ${theme === 'light' ? 'bg-slate-50' : ''}`}>
        <div className="max-w-md mx-auto">
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Why Choose AuditReady?</h2>
          <p className={`mb-8 ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`}>
            Join thousands of organizations that trust AuditReady for their compliance needs
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/10'}`}>
                <Shield className={`h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
              </div>
              <div>
                <h3 className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Comprehensive Compliance</h3>
                <p className={theme === 'light' ? 'text-slate-600' : 'text-gray-400'}>Manage multiple compliance frameworks in one place</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className={`p-2 rounded ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/10'}`}>
                <Key className={`h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
              </div>
              <div>
                <h3 className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Enterprise Security</h3>
                <p className={theme === 'light' ? 'text-slate-600' : 'text-gray-400'}>Bank-grade security with end-to-end encryption</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className={`p-2 rounded ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/10'}`}>
                <Fingerprint className={`h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
              </div>
              <div>
                <h3 className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Automated Workflows</h3>
                <p className={theme === 'light' ? 'text-slate-600' : 'text-gray-400'}>Streamline your compliance processes with automation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 