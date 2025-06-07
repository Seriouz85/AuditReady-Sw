import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Building, User, Mail, Lock, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabaseAuth } from "@/lib/supabase";
import { toast } from "@/utils/toast";
import { mockSignInAnonymously } from "@/lib/mockAuth";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ZoomToggle } from "@/components/ui/zoom-toggle";

const SignUp = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check if Supabase is properly configured
    const checkSupabase = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseKey && supabaseUrl !== 'your-supabase-url') {
          setIsSupabaseConfigured(true);
        } else {
          console.log("Supabase not configured, signup will be in demo mode");
          setIsSupabaseConfigured(false);
        }
      } catch (error) {
        console.error("Error checking Supabase configuration:", error);
        setIsSupabaseConfigured(false);
      }
    };
    
    checkSupabase();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSignupError(""); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setSignupError("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      setSignupError("Last name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setSignupError("Email is required");
      return false;
    }
    if (!formData.organizationName.trim()) {
      setSignupError("Organization name is required");
      return false;
    }
    if (formData.password.length < 8) {
      setSignupError("Password must be at least 8 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setSignupError("Passwords do not match");
      return false;
    }
    if (!acceptTerms) {
      setSignupError("You must accept the Terms of Service to continue");
      return false;
    }
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSignupError("");

    try {
      if (isSupabaseConfigured) {
        // Try Supabase signup
        const { data, error } = await supabaseAuth.signUp(formData.email, formData.password);
        
        if (error) {
          console.error("Supabase signup failed:", error);
          setSignupError(`Signup failed: ${error.message}`);
        } else if (data?.user) {
          console.log("Supabase signup successful:", data.user);
          setShowSuccess(true);
          toast.success("Account created! Please check your email for verification.");
          
          // TODO: Create organization/tenant record in database
          // TODO: Send welcome email
          // TODO: Set up default organization structure
        }
      } else {
        // Demo mode - simulate successful signup
        console.log("Demo signup for:", formData.email);
        setShowSuccess(true);
        toast.success("Account created successfully (demo mode)!");
        
        // In demo mode, redirect to onboarding after a short delay
        setTimeout(() => {
          navigate("/onboarding");
        }, 2000);
      }
    } catch (error) {
      const err = error as Error;
      console.error("Signup process error:", err);
      setSignupError("Account creation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: 'google' | 'microsoft') => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        // TODO: Implement actual OAuth signup with Supabase
        console.log(`Social signup with ${provider} (not yet configured)`);
        toast.info(`${provider.charAt(0).toUpperCase() + provider.slice(1)} signup not configured yet`);
      } else {
        // Demo mode - simulate social signup success
        await mockSignInAnonymously();
        toast.success(`Account created with ${provider.charAt(0).toUpperCase() + provider.slice(1)} (demo mode)!`);
        setShowSuccess(true);
        
        // Redirect to onboarding after delay
        setTimeout(() => {
          navigate("/onboarding");
        }, 2000);
      }
    } catch (error) {
      console.error(`${provider} signup failed:`, error);
      toast.error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} signup failed`);
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'light' ? 'bg-slate-100' : 'bg-gradient-to-b from-slate-900 to-slate-800'}`}>
        <div className={`w-full max-w-md p-8 rounded-2xl border shadow-xl ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-600'}`}>
          <div className="text-center space-y-4">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-green-100' : 'bg-green-900/30'}`}>
              <Check className={`h-8 w-8 ${theme === 'light' ? 'text-green-600' : 'text-green-400'}`} />
            </div>
            <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
              Welcome to AuditReady!
            </h1>
            <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
              {isSupabaseConfigured 
                ? "We've sent a verification email to your inbox. Please check your email and click the verification link to activate your account."
                : "Your account has been created successfully in demo mode."
              }
            </p>
            <Button 
              onClick={() => navigate(isSupabaseConfigured ? "/login" : "/onboarding")} 
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              {isSupabaseConfigured ? "Continue to Login" : "Complete Setup"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${theme === 'light' ? 'bg-slate-100' : 'bg-gradient-to-b from-slate-900 to-slate-800'}`}>
      {/* Left side - Sign Up Form */}
      <div className={`flex-1 flex flex-col items-center justify-center p-4 ${theme === 'light' ? 'bg-white' : 'bg-slate-800/90'}`}>
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
          
          {/* Sign Up Form */}
          <div className={`w-full space-y-6 p-8 rounded-2xl border shadow-xl ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-700/70 border-slate-600'}`}> 
            <div className="text-center space-y-2">
              <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>Create Your Account</h1>
              <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Start your compliance journey with AuditReady</p>
              {!isSupabaseConfigured && (
                <p className={`mt-2 text-xs ${theme === 'light' ? 'text-amber-600 bg-amber-50' : 'text-amber-400 bg-amber-900/20'} p-2 rounded`}>
                  Demo mode: Account creation simulation
                </p>
              )}
            </div>

            {signupError && (
              <div className={`rounded-lg p-3 text-sm flex items-start gap-2 border-2 ${theme === 'light' ? 'bg-red-50 border-red-300' : 'bg-red-900/20 border-red-700'}`}> 
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className={`font-medium ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`}>Signup Error</p>
                  <p className={theme === 'light' ? 'text-red-600' : 'text-red-300'}>{signupError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>First Name</label>
                  <Input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`h-12 border-2 transition-all ${theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-blue-500' : 'bg-slate-600/50 border-slate-500 text-slate-100 focus:border-blue-500'}`}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Last Name</label>
                  <Input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`h-12 border-2 transition-all ${theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-blue-500' : 'bg-slate-600/50 border-slate-500 text-slate-100 focus:border-blue-500'}`}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Work Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`h-12 border-2 transition-all ${theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-blue-500' : 'bg-slate-600/50 border-slate-500 text-slate-100 focus:border-blue-500'}`}
                  placeholder="john@company.com"
                  required
                />
              </div>

              {/* Organization */}
              <div className="space-y-2">
                <label className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Organization Name</label>
                <Input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => handleInputChange('organizationName', e.target.value)}
                  className={`h-12 border-2 transition-all ${theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-blue-500' : 'bg-slate-600/50 border-slate-500 text-slate-100 focus:border-blue-500'}`}
                  placeholder="Your Company Inc."
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Password</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`h-12 border-2 transition-all ${theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-blue-500' : 'bg-slate-600/50 border-slate-500 text-slate-100 focus:border-blue-500'}`}
                  placeholder="Min. 8 characters"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Confirm Password</label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`h-12 border-2 transition-all ${theme === 'light' ? 'bg-slate-50 border-slate-200 focus:border-blue-500' : 'bg-slate-600/50 border-slate-500 text-slate-100 focus:border-blue-500'}`}
                  placeholder="Confirm password"
                  required
                />
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={acceptTerms} 
                    onCheckedChange={(checked) => setAcceptTerms(checked === true)} 
                  />
                  <label htmlFor="terms" className={`text-sm leading-5 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                    I agree to the{' '}
                    <a href="/terms" className={`${theme === 'light' ? 'text-blue-600' : 'text-blue-400'} hover:underline`}>
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className={`${theme === 'light' ? 'text-blue-600' : 'text-blue-400'} hover:underline`}>
                      Privacy Policy
                    </a>
                  </label>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="marketing" 
                    checked={acceptMarketing} 
                    onCheckedChange={(checked) => setAcceptMarketing(checked === true)} 
                  />
                  <label htmlFor="marketing" className={`text-sm leading-5 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                    I'd like to receive product updates and marketing communications
                  </label>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg text-white font-semibold text-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed" 
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="flex items-center gap-2 my-4">
              <div className={`flex-1 h-px ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-600'}`} />
              <span className={`text-xs ${theme === 'light' ? 'text-slate-400' : 'text-slate-400'}`}>or</span>
              <div className={`flex-1 h-px ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-600'}`} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button 
                type="button" 
                onClick={() => handleSocialSignUp('google')} 
                disabled={isLoading}
                className={`h-12 rounded-full font-semibold shadow-sm border transition-all flex items-center justify-center gap-2 ${theme === 'light' ? 'bg-white hover:bg-gray-50 text-gray-700 border-slate-200' : 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-500'}`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button 
                type="button" 
                onClick={() => handleSocialSignUp('microsoft')} 
                disabled={isLoading}
                className={`h-12 rounded-full font-semibold shadow-sm border transition-all flex items-center justify-center gap-2 ${theme === 'light' ? 'bg-white hover:bg-gray-50 text-gray-700 border-slate-200' : 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-500'}`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#f25022" d="M1 1h10v10H1z"/>
                  <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                  <path fill="#7fba00" d="M1 13h10v10H1z"/>
                  <path fill="#ffb900" d="M13 13h10v10H13z"/>
                </svg>
                Microsoft
              </Button>
            </div>

            <div className="text-center">
              <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                Already have an account?{' '}
                <Link to="/login" className={`${theme === 'light' ? 'text-blue-600' : 'text-blue-400'} hover:underline font-medium`}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Benefits */}
      <div className={`hidden lg:flex flex-1 flex-col justify-center px-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
        <div className="max-w-lg mr-auto ml-8">
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>Join AuditReady Today</h2>
          <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
            Start your compliance journey with a platform trusted by organizations worldwide
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/20'}`}>
                <Building className={`h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
              </div>
              <div>
                <h3 className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>Multi-Tenant Architecture</h3>
                <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>Secure, isolated environments for your organization</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`p-2 rounded ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/20'}`}>
                <User className={`h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
              </div>
              <div>
                <h3 className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>Team Collaboration</h3>
                <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>Invite team members and manage permissions</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`p-2 rounded ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/20'}`}>
                <Shield className={`h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
              </div>
              <div>
                <h3 className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>Enterprise Ready</h3>
                <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>SOC 2, GDPR compliant with advanced security</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;