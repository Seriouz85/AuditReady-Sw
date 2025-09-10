import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PRICING_PLANS } from "@/lib/stripe";
import { createCheckoutSession, redirectToCheckout } from "@/api/stripe";
import { toast } from "@/utils/toast";
import { supabase } from "@/lib/supabase";
import { useDynamicPricing } from "@/hooks/useDynamicPricing";
import { 
  Shield, 
  Zap, 
  Lock, 
  Users, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  BarChart3,
  FileText,
  PieChart,
  LineChart,
  ClipboardCheck,
  Building2,
  Crown,
  Clock,
  Target,
  TrendingUp,
  Folder,
  Database,
  Activity,
  Gauge,
  Layers,
  Cpu,
  Brain,
  Eye,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ZoomToggle } from "@/components/ui/zoom-toggle";
import { IntegrationIcon } from "@/components/ui/IntegrationIcon";
import UltraAIShowcase from "@/components/landing/UltraAIShowcase";
import { useTheme } from "next-themes";

export default function Landing() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { theme } = useTheme();
  const { plans: dynamicPlans, loading: pricingLoading } = useDynamicPricing();

  const handlePricingClick = async (tier: 'free' | 'team' | 'business' | 'enterprise') => {
    if (tier === 'free') {
      // Free tier goes to onboarding
      navigate('/onboarding');
      return;
    }

    if (tier === 'enterprise') {
      // Enterprise goes to contact sales
      navigate('/contact');
      return;
    }

    // Check if Stripe is configured
    const publishableKey = import.meta.env['VITE_STRIPE_PUBLISHABLE_KEY'];
    if (!publishableKey || publishableKey === 'your-stripe-publishable-key') {
      // If Stripe not configured, go to onboarding flow
      navigate('/onboarding');
      return;
    }

    // Get the price ID from dynamic plans or fallback to static config
    const dynamicPlan = dynamicPlans.find(p => p.id === tier);
    const staticPlan = PRICING_PLANS[tier];
    const plan = dynamicPlan || staticPlan;
    
    if (!plan || !plan.stripePriceId) {
      toast.error('This plan is not yet configured. Please contact support.');
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Store the intended plan and redirect to onboarding
        sessionStorage.setItem('intendedPlan', tier);
        sessionStorage.setItem('intendedPriceId', plan.stripePriceId);
        navigate('/pricing');
        return;
      }

      // Create checkout session with user context
      const result = await createCheckoutSession({
        priceId: plan.stripePriceId,
        customerEmail: user.email || undefined,
        tier: tier
      });

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.sessionId) {
        // Redirect to Stripe Checkout
        await redirectToCheckout(result.sessionId);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Unable to process payment. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const stats = [
    { number: "85%", label: "Time Saved on Assessments" },
    { number: "24/7", label: "Continuous Monitoring" },
    { number: "99.9%", label: "Platform Uptime" },
    { number: "500+", label: "Security Controls" },
  ];

  const testimonials = [
    {
      quote: "AuditReady transformed our compliance process. What used to take months now takes weeks.",
      author: "Sarah Chen",
      role: "CISO at TechCorp",
      company: "TechCorp Global",
    },
    {
      quote: "The automated assessment feature alone saved us countless hours of manual work.",
      author: "Michael Rodriguez",
      role: "Security Director",
      company: "FinanceSecure Ltd",
    },
    {
      quote: "Finally, a compliance platform that understands the needs of modern security teams.",
      author: "Emma Thompson",
      role: "Compliance Manager",
      company: "HealthTech Solutions",
    },
  ];

  return (
    <div className={`min-h-screen overflow-x-hidden ${theme === 'light' ? 'bg-gradient-to-b from-slate-100 to-white' : 'bg-gradient-to-b from-slate-900 to-slate-800'}`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${theme === 'light' ? 'bg-white/80 border-slate-200' : 'bg-slate-800/90 border-slate-700'} backdrop-blur-md border-b`}>
        <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between max-w-7xl">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Shield className={`h-6 w-6 sm:h-8 sm:w-8 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
            <span className={`text-lg sm:text-2xl font-bold ${theme === 'light' ? 'text-slate-800' : 'bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent'}`}>
              AuditReady
            </span>
          </div>
          
          {/* Center Navigation */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Button 
              variant="ghost" 
              size="sm"
              className={`inline-flex ${theme === 'light' ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-200 hover:text-slate-100 hover:bg-slate-700'}`}
              onClick={() => navigate("/roadmap")}
            >
              <span className="hidden md:inline">Roadmap</span>
              <span className="md:hidden">Map</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              className={`inline-flex ${theme === 'light' ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-200 hover:text-slate-100 hover:bg-slate-700'}`}
              onClick={() => navigate("/about")}
            >
              <span className="hidden sm:inline">About Dev</span>
              <span className="sm:hidden">Dev</span>
            </Button>
            <div className="hidden sm:flex items-center space-x-2">
              <ZoomToggle />
              <ThemeToggle />
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className={`text-xs sm:text-sm px-2 sm:px-4 font-medium ${theme === 'light' ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 border border-slate-200/50' : 'text-slate-200 hover:text-slate-100 hover:bg-slate-700/80 border border-slate-600/50'}`}
              onClick={() => navigate("/login")}
            >
              Log in
            </Button>
            <Button 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-6 text-xs sm:text-sm font-semibold shadow-md border-2 border-blue-500/20"
              onClick={() => navigate("/onboarding")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="pt-20 sm:pt-32 pb-16 sm:pb-20 px-3 sm:px-4 relative overflow-hidden">
        <div className={`absolute inset-0 ${theme === 'light' ? 'bg-[url(\'/grid.svg\')] opacity-10' : 'bg-gradient-to-br from-slate-900/20 via-transparent to-slate-700/10'}`}></div>
        <div className="container mx-auto text-center relative z-10 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className={`mb-3 sm:mb-4 text-xs sm:text-sm ${theme === 'light' ? 'text-blue-600 border-blue-300' : 'text-blue-400 border-blue-500/30'}`}>
              Trusted by Leading Security Teams
            </Badge>
            <h1 className={`text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 ${theme === 'light' ? 'text-slate-900' : 'bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent'} leading-tight px-2`}>
              Transform Your{" "}
              <span className={`${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`}>Compliance</span>{" "}
              Journey
            </h1>
            <p className={`text-base sm:text-xl ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} max-w-3xl mx-auto mb-6 sm:mb-8 px-4`}>
              Experience the future of compliance management. Automated assessments, 
              real-time monitoring, and AI-powered insights—all in one powerful platform.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
          >
            <Button 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 h-10 sm:h-12 text-sm sm:text-lg w-full sm:w-auto"
              onClick={() => navigate("/onboarding")}
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button 
              size="sm"
              variant="outline" 
              className={`${theme === 'light' 
                ? 'border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300' 
                : 'border-blue-800 text-blue-300 hover:bg-blue-900/40 hover:text-blue-200'} px-6 sm:px-8 h-10 sm:h-12 text-sm sm:text-lg w-full sm:w-auto`}
              onClick={() => navigate("/login")}
            >
              Try Demo
            </Button>
          </motion.div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mt-12 sm:mt-20 px-2">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="text-center"
              >
                <h3 className={`text-2xl sm:text-4xl font-bold ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'} mb-1 sm:mb-2`}>{stat.number}</h3>
                <p className={`text-xs sm:text-base ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ultra Cool Logo Section - AI Robot Version */}
      {/* BACKUP: Original version without robot available in git history */}
      <section className="py-16 sm:py-24 px-3 sm:px-4 relative overflow-hidden">
        <div className="container mx-auto px-3 sm:px-6 relative z-10 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto"
          >
            <div className="relative">
              {/* Very subtle background effect */}
              <div className={`absolute -inset-x-20 -inset-y-16 ${theme === 'light' 
                ? 'bg-gradient-to-r from-blue-50/30 via-transparent to-purple-50/30' 
                : 'bg-gradient-to-r from-blue-950/10 via-transparent to-purple-950/10'} blur-3xl`}></div>
              
              <div className="relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
                  {/* Logo Side */}
                  <div className="text-center lg:text-left lg:pl-8">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 1, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="relative inline-block"
                      style={{
                        transform: 'translateX(0px) translateY(-10px)',
                        animation: 'float 4s ease-in-out infinite'
                      }}
                    >
                      {/* Futuristic AuditReady Shield Logo */}
                      <div className="relative">
                        {/* Multi-layered Background Glow */}
                        <div className="absolute inset-0 w-48 h-48 sm:w-80 sm:h-80 mx-auto">
                          <div className={`absolute inset-0 rounded-full ${theme === 'light' 
                            ? 'bg-gradient-to-r from-blue-400/30 via-cyan-300/20 to-indigo-500/30 blur-3xl' 
                            : 'bg-gradient-to-r from-blue-400/40 via-cyan-300/30 to-indigo-400/40 blur-3xl'}`}></div>
                          <div className={`absolute inset-6 rounded-full ${theme === 'light' 
                            ? 'bg-gradient-to-r from-cyan-300/20 to-blue-400/20 blur-2xl' 
                            : 'bg-gradient-to-r from-cyan-300/30 to-blue-400/30 blur-2xl'}`}></div>
                        </div>
                        
                        {/* Main Holographic Shield */}
                        <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto">
                          {/* Shield Base with Holographic Effect */}
                          <div className={`relative w-full h-full rounded-[3rem] flex items-center justify-center ${theme === 'light'
                            ? 'bg-gradient-to-br from-slate-200/90 via-blue-100/80 to-indigo-200/90 backdrop-blur-sm border border-blue-300/50 shadow-2xl'
                            : 'bg-gradient-to-br from-slate-800/90 via-blue-900/80 to-indigo-900/90 backdrop-blur-sm border border-blue-400/30 shadow-2xl'}`}>
                            
                            {/* Inner Holographic Layers */}
                            <div className="absolute inset-2 rounded-[2.5rem] bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
                            <div className="absolute inset-4 rounded-[2rem] bg-gradient-to-tl from-transparent via-blue-300/20 to-transparent"></div>
                            
                            {/* Center Shield Symbol */}
                            <div className="relative z-10 flex flex-col items-center">
                              {/* Main Shield Icon */}
                              <div className={`relative w-24 h-24 rounded-2xl flex items-center justify-center mb-3 ${theme === 'light'
                                ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 shadow-lg'
                                : 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 shadow-lg'}`}>
                                <Shield className="h-14 w-14 text-white drop-shadow-lg" strokeWidth={2} />
                                {/* Checkmark Overlay - positioned to not block text */}
                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                                  <CheckCircle2 className="h-5 w-5 text-white" strokeWidth={2.5} />
                                </div>
                              </div>
                              
                              {/* AUDITREADY Text */}
                              <div className={`text-center ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
                                <div className="text-xl font-bold tracking-wider mb-1">AUDITREADY</div>
                                <div className={`text-sm font-semibold ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'} tracking-wide`}>CYBER SECURITY</div>
                              </div>
                            </div>
                            
                            {/* Animated Security Icons */}
                            <div className="absolute top-6 right-6 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                              <Lock className="h-3 w-3 text-white" />
                            </div>
                            <div className="absolute top-6 left-6 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg animate-pulse delay-700">
                              <Sparkles className="h-3 w-3 text-white" />
                            </div>
                            
                            {/* Lightning icon positioned under AUDITREADY text */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse delay-300">
                              <Zap className="h-3 w-3 text-white" />
                            </div>
                          </div>
                          
                          {/* Orbital Elements */}
                          <div className="absolute inset-0" style={{ animation: 'spin 12s linear infinite' }}>
                            <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3 w-5 h-5 rounded-full ${theme === 'light' ? 'bg-blue-500' : 'bg-blue-400'} opacity-70 shadow-lg`}></div>
                            <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-3 w-4 h-4 rounded-full ${theme === 'light' ? 'bg-indigo-500' : 'bg-indigo-400'} opacity-50 shadow-lg`}></div>
                            <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-3 w-3 h-3 rounded-full ${theme === 'light' ? 'bg-purple-500' : 'bg-purple-400'} opacity-60 shadow-lg`}></div>
                            <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-3 w-3 h-3 rounded-full ${theme === 'light' ? 'bg-cyan-500' : 'bg-cyan-400'} opacity-60 shadow-lg`}></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Content Side */}
                  <div className="space-y-10">
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      viewport={{ once: true }}
                      className="space-y-8"
                    >
                      <h2 className={`text-5xl lg:text-6xl font-bold leading-tight ${theme === 'light' 
                        ? 'bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent' 
                        : 'bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent'}`}>
                        AuditReady
                      </h2>
                      <div className={`text-2xl font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>
                        <span className={theme === 'light' ? 'text-blue-600' : 'text-blue-400'}>Security</span> • <span className={theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'}>Compliance</span> • <span className={theme === 'light' ? 'text-purple-600' : 'text-purple-400'}>Excellence</span>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                      viewport={{ once: true }}
                      className="space-y-8"
                    >
                      <blockquote className={`text-2xl lg:text-3xl leading-relaxed font-light italic ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>
                        "Transforming compliance from a burden into a <span className={`font-semibold not-italic ${theme === 'light' ? 'text-blue-700' : 'text-blue-400'}`}>competitive advantage</span>. 
                        Where security meets innovation, and audit readiness becomes second nature."
                      </blockquote>
                      
                      <div className="flex items-center gap-6 pt-6">
                        <div className={`w-16 h-1 ${theme === 'light' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-blue-400 to-indigo-400'} rounded-full`}></div>
                        <span className={`text-lg font-medium ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                          Empowering Organizations Worldwide
                        </span>
                      </div>
                    </motion.div>

                    {/* Trust Indicators */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.8 }}
                      viewport={{ once: true }}
                      className="flex flex-wrap gap-6 pt-10"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${theme === 'light' ? 'bg-blue-500' : 'bg-blue-400'}`}></div>
                        <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>ISO 27001 Ready</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${theme === 'light' ? 'bg-purple-500' : 'bg-purple-400'}`}></div>
                        <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Enterprise Grade</span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Subtle divider for better flow */}
      <div className="relative">
        <div className={`absolute inset-0 flex items-center justify-center ${theme === 'light' ? 'opacity-30' : 'opacity-20'}`}>
          <div className={`h-px w-1/3 ${theme === 'light' ? 'bg-gradient-to-r from-transparent via-slate-300 to-transparent' : 'bg-gradient-to-r from-transparent via-slate-600 to-transparent'}`}></div>
        </div>
      </div>

      {/* Dashboard Preview Section */}
      <section className="py-16 sm:py-20 px-3 sm:px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className={`mb-4 ${theme === 'light' ? 'text-blue-600 border-blue-300' : 'text-blue-400 border-blue-500/30'}`}>
              Powerful Features
            </Badge>
            <h2 className={`text-3xl md:text-4xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-4`}>
              Your Command Center for Compliance
            </h2>
            <p className={`text-lg ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} max-w-2xl mx-auto`}>
              Get a bird's-eye view of your compliance status across all frameworks.
              Monitor, track, and improve your security posture in real-time.
            </p>
          </div>

          {/* Dashboard Mockup */}
          <div className="relative mx-auto max-w-4xl sm:max-w-6xl">
            <div className={`relative rounded-lg overflow-hidden shadow-2xl ${theme === 'light' ? 'border border-slate-200' : 'border border-slate-600'}`}>
              <div className={`${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700'} p-2 flex items-center gap-2`}>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className={`${theme === 'light' ? 'bg-white' : 'bg-slate-800'} p-6`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className={`${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-700/70 border-slate-600'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} font-semibold`}>Compliance Score</h3>
                        <div className="relative">
                          <div className={`absolute -inset-1 rounded-full ${theme === 'light' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-blue-400 to-indigo-400'} opacity-25 blur animate-spin`} style={{animationDuration: '8s'}}></div>
                          <Gauge className={`relative h-5 w-5 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
                        </div>
                      </div>
                      <div className={`text-3xl font-bold ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`}>87%</div>
                      <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} text-sm mt-2`}>+12% from last month</p>
                    </CardContent>
                  </Card>
                  <Card className={`${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-700/70 border-slate-600'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} font-semibold`}>Active Assessments</h3>
                        <div className="relative">
                          <div className={`absolute -inset-1 rounded-full ${theme === 'light' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-purple-500'} opacity-20 blur animate-pulse`}></div>
                          <Target className={`relative h-5 w-5 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
                        </div>
                      </div>
                      <div className={`text-3xl font-bold ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`}>12</div>
                      <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} text-sm mt-2`}>3 due this week</p>
                    </CardContent>
                  </Card>
                  <Card className={`${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-700/70 border-slate-600'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} font-semibold`}>Risk Score</h3>
                        <div className="relative">
                          <div className={`absolute -inset-1 rounded-full ${theme === 'light' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-green-400 to-emerald-400'} opacity-30 blur animate-pulse`}></div>
                          <TrendingUp className={`relative h-5 w-5 ${theme === 'light' ? 'text-green-600' : 'text-green-500'} animate-bounce`} style={{animationDuration: '3s'}} />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-green-500">Low</div>
                      <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} text-sm mt-2`}>No critical findings</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assessment Preview Section */}
      <section className={`py-16 sm:py-20 px-3 sm:px-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className={`mb-4 ${theme === 'light' ? 'text-blue-600 border-blue-300' : 'text-blue-400 border-blue-500/30'}`}>
              Streamlined Assessments
            </Badge>
            <h2 className={`text-3xl md:text-4xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-4`}>
              Automated Assessment Engine
            </h2>
            <p className={`text-lg ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} max-w-2xl mx-auto`}>
              Say goodbye to spreadsheets and manual tracking. Our intelligent assessment
              engine handles the heavy lifting for you.
            </p>
          </div>

          {/* Assessment Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className={`relative rounded-full ${theme === 'light' ? 'bg-gradient-to-br from-emerald-100 to-green-100' : 'bg-gradient-to-br from-emerald-500/20 to-green-500/20'} p-3 overflow-hidden group`}>
                  <div className={`absolute -inset-2 rounded-full ${theme === 'light' ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-emerald-400 to-green-400'} opacity-20 blur-lg group-hover:opacity-50 transition-all duration-300`}></div>
                  <Cpu className={`relative h-6 w-6 ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-500'} transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`} />
                </div>
                <div>
                  <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-2`}>Smart Control Mapping</h3>
                  <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Automatically map controls across multiple frameworks. Save hours of manual work
                    with intelligent control suggestions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className={`relative rounded-full ${theme === 'light' ? 'bg-gradient-to-br from-blue-100 to-purple-100' : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'} p-3 overflow-hidden`}>
                  <div className={`absolute -inset-2 rounded-full ${theme === 'light' ? 'bg-gradient-to-r from-blue-400 to-purple-500' : 'bg-gradient-to-r from-blue-400 to-purple-400'} opacity-20 blur-lg animate-pulse`}></div>
                  <Activity className={`relative h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'} animate-pulse`} />
                </div>
                <div>
                  <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-2`}>Real-time Progress Tracking</h3>
                  <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Monitor assessment progress in real-time. Get instant visibility into completion
                    rates and bottlenecks.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className={`relative rounded-full ${theme === 'light' ? 'bg-gradient-to-br from-green-100 to-blue-100' : 'bg-gradient-to-br from-green-500/20 to-blue-500/20'} p-3 overflow-hidden group`}>
                  <div className={`absolute -inset-2 rounded-full ${theme === 'light' ? 'bg-gradient-to-r from-green-400 to-blue-500' : 'bg-gradient-to-r from-green-400 to-blue-400'} opacity-20 blur-lg group-hover:opacity-40 transition-opacity`}></div>
                  <Database className={`relative h-6 w-6 ${theme === 'light' ? 'text-green-600' : 'text-green-500'} transform group-hover:scale-110 transition-transform`} />
                </div>
                <div>
                  <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-2`}>Evidence Management</h3>
                  <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Centralized evidence repository with version control. Link evidence to multiple
                    controls and frameworks effortlessly.
                  </p>
                </div>
              </div>
            </div>

            {/* Assessment Preview Mockup */}
            <div className={`relative rounded-lg overflow-hidden shadow-2xl ${theme === 'light' ? 'border border-slate-200' : 'border border-slate-600'}`}>
              <div className={`${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700'} p-4`}>
                <h3 className={`${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} font-semibold`}>ISO 27001 Assessment</h3>
              </div>
              <div className={`${theme === 'light' ? 'bg-white' : 'bg-slate-800'} p-6`}>
                <div className="space-y-4">
                  <div className={`flex items-center justify-between p-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-700'} rounded-lg`}>
                    <div>
                      <h4 className={`${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} font-medium`}>A.5.1.1 Information Security Policies</h4>
                      <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Last updated 3 days ago</p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                      Compliant
                    </Badge>
                  </div>
                  <div className={`flex items-center justify-between p-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-700'} rounded-lg`}>
                    <div>
                      <h4 className={`${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} font-medium`}>A.6.1.1 Security Roles and Responsibilities</h4>
                      <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Last updated 1 week ago</p>
                    </div>
                    <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
                      In Review
                    </Badge>
                  </div>
                  <div className={`flex items-center justify-between p-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-700'} rounded-lg`}>
                    <div>
                      <h4 className={`${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} font-medium`}>A.7.1.1 Screening</h4>
                      <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Last updated 2 days ago</p>
                    </div>
                    <Badge className={`${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/10'} ${theme === 'light' ? 'text-blue-700' : 'text-blue-500'} hover:bg-blue-500/20`}>
                      In Progress
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ultra AI Semantic Mapping Engine Showcase */}
      <UltraAIShowcase />

      {/* Data Governance & Security Section */}
      <section className="py-16 sm:py-20 px-3 sm:px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className={`mb-4 ${theme === 'light' ? 'text-blue-600 border-blue-300' : 'text-blue-400 border-blue-500/30'}`}>
              Enterprise Security & Data Governance
            </Badge>
            <h2 className={`text-3xl md:text-4xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-4`}>
              Built by Security Specialists, For Security Specialists
            </h2>
            <p className={`text-lg ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} max-w-3xl mx-auto`}>
              Enterprise-grade data governance with multi-factor authentication, time-travel restore capabilities, 
              and comprehensive audit trails. Because your data security can't be an afterthought.
            </p>
          </div>

          {/* Security & Governance Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className={`${theme === 'light' ? 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200' : 'bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/30'}`}>
              <CardContent className="p-6">
                <div className={`rounded-full ${theme === 'light' ? 'bg-blue-600' : 'bg-blue-500'} p-3 w-fit mb-4`}>
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-3`}>
                  Multi-Factor Authentication
                </h3>
                <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} mb-4`}>
                  TOTP-based MFA with backup codes and risk-based authentication. Enterprise policies with time-limited sessions protect sensitive operations.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>TOTP & backup codes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Risk-based security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Enterprise device management</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${theme === 'light' ? 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200' : 'bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/30'}`}>
              <CardContent className="p-6">
                <div className={`rounded-full ${theme === 'light' ? 'bg-green-600' : 'bg-green-500'} p-3 w-fit mb-4`}>
                  <ArrowRight className="h-6 w-6 text-white transform rotate-180" />
                </div>
                <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-3`}>
                  Time-Travel Data Restore
                </h3>
                <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} mb-4`}>
                  Point-in-time recovery with hour/day granularity. Undo user sessions atomically or restore specific records with comprehensive audit trails.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-green-600' : 'text-green-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Point-in-time recovery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-green-600' : 'text-green-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Session-based restore</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-green-600' : 'text-green-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>99.9% restore reliability</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${theme === 'light' ? 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200' : 'bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30'}`}>
              <CardContent className="p-6">
                <div className={`relative rounded-full ${theme === 'light' ? 'bg-gradient-to-br from-purple-600 to-indigo-600' : 'bg-gradient-to-br from-purple-500 to-indigo-500'} p-3 w-fit mb-4 overflow-hidden group`}>
                  <div className="absolute -inset-1 rounded-full bg-white/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                  <Layers className="relative h-6 w-6 text-white transform group-hover:scale-110 transition-transform" />
                </div>
                <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-3`}>
                  Complete Audit Trails
                </h3>
                <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} mb-4`}>
                  Comprehensive change tracking with JSONB diff functions. User session management and sensitive operations logging for regulatory compliance.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-purple-600' : 'text-purple-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>JSONB change tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-purple-600' : 'text-purple-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>User session trails</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-purple-600' : 'text-purple-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>GDPR/CCPA ready</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${theme === 'light' ? 'bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200' : 'bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-500/30'}`}>
              <CardContent className="p-6">
                <div className={`relative rounded-full ${theme === 'light' ? 'bg-gradient-to-br from-orange-600 to-red-500' : 'bg-gradient-to-br from-orange-500 to-red-400'} p-3 w-fit mb-4 overflow-hidden group`}>
                  <div className="absolute -inset-1 rounded-full bg-white/30 blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                  <Gauge className="relative h-6 w-6 text-white transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
                </div>
                <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-3`}>
                  Custom Dashboard Builder
                </h3>
                <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} mb-4`}>
                  Drag-and-drop dashboard customization with role-based widgets. Create executive, analyst, and operational views with real-time data visualization.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-orange-600' : 'text-orange-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Drag-and-drop widgets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-orange-600' : 'text-orange-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Role-based permissions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-orange-600' : 'text-orange-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Real-time analytics</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${theme === 'light' ? 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200' : 'bg-gradient-to-br from-red-900/20 to-red-800/10 border-red-500/30'}`}>
              <CardContent className="p-6">
                <div className={`rounded-full ${theme === 'light' ? 'bg-red-600' : 'bg-red-500'} p-3 w-fit mb-4`}>
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-3`}>
                  Azure Purview Integration
                </h3>
                <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} mb-4`}>
                  Native Microsoft Information Protection integration with automatic PII detection, custom classification labels, and GDPR/CCPA compliance automation.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-red-600' : 'text-red-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Microsoft Purview sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-red-600' : 'text-red-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Custom classification labels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-red-600' : 'text-red-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>GDPR compliance reports</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${theme === 'light' ? 'bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200' : 'bg-gradient-to-br from-indigo-900/20 to-indigo-800/10 border-indigo-500/30'}`}>
              <CardContent className="p-6">
                <div className={`rounded-full ${theme === 'light' ? 'bg-indigo-600' : 'bg-indigo-500'} p-3 w-fit mb-4`}>
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-3`}>
                  Platform Admin Console
                </h3>
                <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} mb-4`}>
                  Comprehensive multi-tenant management with real-time system monitoring, organization controls, and advanced health metrics for enterprise operations.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Multi-tenant oversight</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Real-time monitoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Enterprise operations</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Statement */}
          <div className={`mt-12 p-8 rounded-lg ${theme === 'light' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200' : 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/30'}`}>
            <div className="text-center">
              <div className={`rounded-full ${theme === 'light' ? 'bg-blue-600' : 'bg-blue-500'} p-4 mx-auto mb-4 w-fit`}>
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-4`}>
                Security-First Architecture
              </h3>
              <p className={`text-lg ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} max-w-3xl mx-auto`}>
                Built by information security specialists who understand the critical importance of data protection. 
                Our platform meets SOC 2, ISO 27001, and enterprise compliance requirements because 
                <strong className={`${theme === 'light' ? 'text-blue-700' : 'text-blue-400'}`}> your data security isn't negotiable</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Backup & Restore Section */}
      <section className="py-16 sm:py-20 px-3 sm:px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className={`mb-4 ${theme === 'light' ? 'text-green-600 border-green-300' : 'text-green-400 border-green-500/30'}`}>
              Enterprise Data Recovery
            </Badge>
            <h2 className={`text-3xl md:text-4xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-4`}>
              Advanced Backup & Restore System
            </h2>
            <p className={`text-lg ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} max-w-3xl mx-auto`}>
              Comprehensive data protection with automated backup schedules, granular restore options, and real-time progress tracking.
              Enterprise-grade recovery with MFA-protected operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className={`${theme === 'light' ? 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200' : 'bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/30'}`}>
              <CardContent className="p-6">
                <div className={`rounded-full ${theme === 'light' ? 'bg-green-600' : 'bg-green-500'} p-3 w-fit mb-4`}>
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-3`}>
                  Automated Scheduling
                </h3>
                <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} mb-4`}>
                  Flexible backup schedules from hourly to monthly with intelligent retention policies. Automated cleanup and storage optimization.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-green-600' : 'text-green-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Hourly to monthly schedules</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-green-600' : 'text-green-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Intelligent retention</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-green-600' : 'text-green-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Storage optimization</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${theme === 'light' ? 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200' : 'bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/30'}`}>
              <CardContent className="p-6">
                <div className={`rounded-full ${theme === 'light' ? 'bg-blue-600' : 'bg-blue-500'} p-3 w-fit mb-4`}>
                  <ArrowRight className="h-6 w-6 text-white transform rotate-180" />
                </div>
                <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-3`}>
                  Granular Restore
                </h3>
                <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} mb-4`}>
                  Table-level restore options with advanced filtering. Preview changes before restore and selective data recovery with zero downtime.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Table-level granularity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Preview before restore</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Zero downtime recovery</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${theme === 'light' ? 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200' : 'bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30'}`}>
              <CardContent className="p-6">
                <div className={`relative rounded-full ${theme === 'light' ? 'bg-gradient-to-br from-purple-600 via-violet-600 to-blue-600' : 'bg-gradient-to-br from-purple-500 via-violet-500 to-blue-500'} p-3 w-fit mb-4 overflow-hidden group`}>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity animate-spin"></div>
                  <Brain className="relative h-6 w-6 text-white transform group-hover:scale-110 transition-transform z-10" />
                </div>
                <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-3`}>
                  Analytics Dashboard
                </h3>
                <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} mb-4`}>
                  Real-time backup performance metrics, storage analytics, and recovery time objectives. Comprehensive reporting for compliance.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-purple-600' : 'text-purple-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Performance metrics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-purple-600' : 'text-purple-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Storage analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? 'text-purple-600' : 'text-purple-500'}`} />
                    <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Compliance reporting</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Backup Security Notice */}
          <div className={`mt-12 p-6 rounded-lg ${theme === 'light' ? 'bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200' : 'bg-gradient-to-r from-emerald-900/20 to-green-900/20 border border-green-500/30'}`}>
            <div className="flex items-center justify-center gap-4">
              <div className={`rounded-full ${theme === 'light' ? 'bg-green-600' : 'bg-green-500'} p-3`}>
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="text-center">
                <h4 className={`text-lg font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-2`}>
                  MFA-Protected Recovery Operations
                </h4>
                <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  All restore operations require multi-factor authentication and are logged for complete audit compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className={`py-16 sm:py-20 px-3 sm:px-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className={`mb-4 ${theme === 'light' ? 'text-blue-600 border-blue-300' : 'text-blue-400 border-blue-500/30'}`}>
              Enterprise Integrations
            </Badge>
            <h2 className={`text-3xl md:text-4xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-4`}>
              Connect Your Entire Security Stack
            </h2>
            <p className={`text-lg ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} max-w-3xl mx-auto`}>
              AuditReady seamlessly integrates with your existing tools and workflows. 
              Automate compliance data collection and reduce manual effort across your organization.
            </p>
          </div>

          {/* Integration Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className={`rounded-full ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/20'} p-4 mx-auto mb-4 w-fit`}>
                <Shield className={`h-8 w-8 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
              </div>
              <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-2`}>Security & Identity</h3>
              <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                Connect with identity providers and security tools for automated user management and compliance monitoring.
              </p>
            </div>
            <div className="text-center">
              <div className={`rounded-full ${theme === 'light' ? 'bg-green-100' : 'bg-green-500/20'} p-4 mx-auto mb-4 w-fit`}>
                <Building2 className={`h-8 w-8 ${theme === 'light' ? 'text-green-600' : 'text-green-500'}`} />
              </div>
              <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-2`}>Cloud & Infrastructure</h3>
              <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                Import security configurations and compliance data from your cloud infrastructure automatically.
              </p>
            </div>
            <div className="text-center">
              <div className={`rounded-full ${theme === 'light' ? 'bg-purple-100' : 'bg-purple-500/20'} p-4 mx-auto mb-4 w-fit`}>
                <Users className={`h-8 w-8 ${theme === 'light' ? 'text-purple-600' : 'text-purple-500'}`} />
              </div>
              <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-2`}>Team Collaboration</h3>
              <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                Keep your team informed with real-time notifications and seamless workflow integration.
              </p>
            </div>
          </div>

          {/* Integration Logos Grid */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent rounded-2xl"></div>
            <div className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-white/80 border border-slate-200' : 'bg-slate-800/50 border border-slate-700'} backdrop-blur-sm`}>
              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-2`}>
                  Popular Integrations
                </h3>
                <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} max-w-md mx-auto`}>
                  Connect with the tools your team already uses
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-center">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  className={`p-4 rounded-xl border ${theme === 'light' ? 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg' : 'border-slate-600 bg-slate-700/50 hover:border-blue-400 hover:shadow-xl'} transition-all duration-300 cursor-pointer group`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="transform transition-all duration-300 group-hover:scale-110">
                      <IntegrationIcon provider="okta" size="large" />
                    </div>
                    <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Okta</span>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className={`p-4 rounded-xl border ${theme === 'light' ? 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg' : 'border-slate-600 bg-slate-700/50 hover:border-blue-400 hover:shadow-xl'} transition-all duration-300 cursor-pointer group`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="transform transition-all duration-300 group-hover:scale-110">
                      <IntegrationIcon provider="aws" size="large" />
                    </div>
                    <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>AWS</span>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className={`p-4 rounded-xl border ${theme === 'light' ? 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg' : 'border-slate-600 bg-slate-700/50 hover:border-blue-400 hover:shadow-xl'} transition-all duration-300 cursor-pointer group`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="transform transition-all duration-300 group-hover:scale-110">
                      <IntegrationIcon provider="azure" size="large" />
                    </div>
                    <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Azure</span>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className={`p-4 rounded-xl border ${theme === 'light' ? 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg' : 'border-slate-600 bg-slate-700/50 hover:border-blue-400 hover:shadow-xl'} transition-all duration-300 cursor-pointer group`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="transform transition-all duration-300 group-hover:scale-110">
                      <IntegrationIcon provider="slack" size="large" />
                    </div>
                    <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Slack</span>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  viewport={{ once: true }}
                  className={`p-4 rounded-xl border ${theme === 'light' ? 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg' : 'border-slate-600 bg-slate-700/50 hover:border-blue-400 hover:shadow-xl'} transition-all duration-300 cursor-pointer group`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="transform transition-all duration-300 group-hover:scale-110">
                      <IntegrationIcon provider="teams" size="large" />
                    </div>
                    <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Teams</span>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                  className={`p-4 rounded-xl border ${theme === 'light' ? 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg' : 'border-slate-600 bg-slate-700/50 hover:border-blue-400 hover:shadow-xl'} transition-all duration-300 cursor-pointer group`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="transform transition-all duration-300 group-hover:scale-110">
                      <IntegrationIcon provider="google" size="large" />
                    </div>
                    <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Google</span>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  viewport={{ once: true }}
                  className={`p-4 rounded-xl border ${theme === 'light' ? 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg' : 'border-slate-600 bg-slate-700/50 hover:border-blue-400 hover:shadow-xl'} transition-all duration-300 cursor-pointer group`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="transform transition-all duration-300 group-hover:scale-110">
                      <IntegrationIcon provider="jira" size="large" />
                    </div>
                    <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Jira</span>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  viewport={{ once: true }}
                  className={`p-4 rounded-xl border ${theme === 'light' ? 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg' : 'border-slate-600 bg-slate-700/50 hover:border-blue-400 hover:shadow-xl'} transition-all duration-300 cursor-pointer group`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="transform transition-all duration-300 group-hover:scale-110">
                      <IntegrationIcon provider="servicenow" size="large" />
                    </div>
                    <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>ServiceNow</span>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  viewport={{ once: true }}
                  className={`p-4 rounded-xl border ${theme === 'light' ? 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg' : 'border-slate-600 bg-slate-700/50 hover:border-blue-400 hover:shadow-xl'} transition-all duration-300 cursor-pointer group`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="transform transition-all duration-300 group-hover:scale-110">
                      <IntegrationIcon provider="m365" size="large" />
                    </div>
                    <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>Microsoft 365</span>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  viewport={{ once: true }}
                  className={`p-4 rounded-xl border ${theme === 'light' ? 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg' : 'border-slate-600 bg-slate-700/50 hover:border-blue-400 hover:shadow-xl'} transition-all duration-300 cursor-pointer group`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="transform transition-all duration-300 group-hover:scale-110">
                      <IntegrationIcon provider="github" size="large" />
                    </div>
                    <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>GitHub</span>
                  </div>
                </motion.div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 px-3 sm:px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Badge variant="outline" className={`mb-4 ${theme === 'light' ? 'text-blue-600 border-blue-300' : 'text-blue-400 border-blue-500/30'}`}>
              Customer Stories
            </Badge>
            <h2 className={`text-3xl md:text-4xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-4`}>
              Trusted by Security Leaders
            </h2>
            <p className={`text-lg ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} max-w-2xl mx-auto`}>
              See how leading organizations are transforming their compliance processes
              with AuditReady.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className={`${theme === 'light' ? 'bg-white border-slate-200 shadow-md' : 'bg-slate-700/70 border-slate-600'}`}>
                <CardContent className="p-6">
                  <div className="mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`${theme === 'light' ? 'text-yellow-500' : 'text-blue-500'}`}>★</span>
                    ))}
                  </div>
                  <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-200'} mb-4`}>{testimonial.quote}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Pricing Section */}
      <section id="pricing" className={`py-24 px-3 sm:px-4 ${theme === 'light' ? 'bg-gradient-to-b from-slate-50 to-white' : 'bg-gradient-to-b from-slate-900 to-slate-800'}`}>
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge variant="outline" className={`mb-6 ${theme === 'light' ? 'text-blue-600 border-blue-300' : 'text-blue-400 border-blue-500/30'}`}>
              Simple, Transparent Pricing
            </Badge>
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
              Choose Your Perfect Plan
            </h2>
            <p className={`text-xl ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} max-w-3xl mx-auto mb-8`}>
              Scale your compliance management as your organization grows. All plans include enterprise-grade security with no hidden fees.
            </p>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${theme === 'light' ? 'bg-blue-50 text-blue-700' : 'bg-blue-900/30 text-blue-300'}`}>
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">14-day free trial • No credit card required • Cancel anytime</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-full mx-auto pt-12">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <Card className={`h-full relative ${theme === 'light' ? 'border-slate-200 hover:border-blue-300 bg-white' : 'border-slate-600 hover:border-blue-500 bg-slate-800'} transition-all duration-300 hover:shadow-xl flex flex-col overflow-hidden`}>
                <CardContent className="p-6 flex flex-col h-full">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-900/30'}`}>
                      <Shield className={`h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>Free</h3>
                    <div className={`text-4xl font-bold mb-1 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>€0</div>
                    <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>forever</p>
                  </div>

                  {/* Features */}
                  <div className="flex-1 mb-6">
                    <ul className="space-y-3 text-left">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Full feature access (demo)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Demo workflows & data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Community support</span>
                      </li>
                    </ul>
                  </div>

                  {/* CTA */}
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => handlePricingClick('free')}
                    disabled={isProcessingPayment}
                  >
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Team Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <Card className={`h-full relative ${theme === 'light' ? 'border-blue-500 shadow-xl bg-white' : 'border-blue-400 shadow-xl bg-slate-800'} transition-all duration-300 flex flex-col ring-2 ring-blue-500/20`}>
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
                <CardContent className="p-6 flex flex-col h-full">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                      {dynamicPlans.find(p => p.id === 'team')?.name || 'Team'}
                    </h3>
                    <div className={`text-4xl font-bold mb-1 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                      {pricingLoading ? '...' : `€${dynamicPlans.find(p => p.id === 'team')?.discountedPrice || dynamicPlans.find(p => p.id === 'team')?.price || 499}`}
                    </div>
                    <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                      per {dynamicPlans.find(p => p.id === 'team')?.interval || 'month'}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="flex-1 mb-6">
                    <ul className="space-y-3 text-left">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Up to 50 team members</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Multi-framework compliance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Team collaboration tools</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Automated assignments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Basic reporting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Email support</span>
                      </li>
                    </ul>
                  </div>

                  {/* CTA */}
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
                    onClick={() => handlePricingClick('team')}
                    disabled={isProcessingPayment}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Business Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <Card className={`h-full relative ${theme === 'light' ? 'border-purple-300 hover:border-purple-400 bg-white' : 'border-purple-400 hover:border-purple-300 bg-slate-800'} transition-all duration-300 hover:shadow-xl flex flex-col overflow-hidden`}>
                <CardContent className="p-6 flex flex-col h-full">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                      {dynamicPlans.find(p => p.id === 'business')?.name || 'Business'}
                    </h3>
                    <div className={`text-4xl font-bold mb-1 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                      {pricingLoading ? '...' : `€${dynamicPlans.find(p => p.id === 'business')?.discountedPrice || dynamicPlans.find(p => p.id === 'business')?.price || 699}`}
                    </div>
                    <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                      per {dynamicPlans.find(p => p.id === 'business')?.interval || 'month'}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="flex-1 mb-6">
                    <ul className="space-y-3 text-left">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Everything in Team</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Up to 250 team members</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>AuditReady Risk Management</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Learning Management System</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Advanced reporting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Custom templates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Priority support</span>
                      </li>
                    </ul>
                  </div>

                  {/* CTA */}
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => handlePricingClick('business')}
                    disabled={isProcessingPayment}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <Card className={`h-full relative ${theme === 'light' ? 'border-amber-300 hover:border-amber-400 bg-white' : 'border-amber-400 hover:border-amber-300 bg-slate-800'} transition-all duration-300 hover:shadow-xl flex flex-col overflow-hidden`}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"></div>
                <CardContent className="p-6 flex flex-col h-full">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                      {dynamicPlans.find(p => p.id === 'enterprise')?.name || 'Enterprise'}
                    </h3>
                    <div className={`text-4xl font-bold mb-1 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                      {pricingLoading ? '...' : `€${dynamicPlans.find(p => p.id === 'enterprise')?.discountedPrice || dynamicPlans.find(p => p.id === 'enterprise')?.price || 999}`}
                    </div>
                    <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                      per {dynamicPlans.find(p => p.id === 'enterprise')?.interval || 'month'}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="flex-1 mb-6">
                    <ul className="space-y-3 text-left">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Everything in Business</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Unlimited team members</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Phishing Simulation Tool</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>AuditReady AI Editor</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Advanced threat detection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>White-label solutions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Dedicated account manager</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>24/7 phone support & SLA</span>
                      </li>
                    </ul>
                  </div>

                  {/* CTA */}
                  <Button 
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg"
                    onClick={() => handlePricingClick('enterprise')}
                    disabled={isProcessingPayment}
                  >
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              All plans include 14-day free trial • No credit card required • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-3 sm:px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-8 md:p-12"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-blue-400/10 opacity-20"
              initial={false}
              animate={{
                opacity: isHovered ? 0.3 : 0.2,
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Compliance Process?
              </h2>
              <p className="text-lg text-blue-100 mb-8 max-w-3xl">
                Join the growing community of security professionals who have already 
                modernized their compliance management. Start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8"
                  onClick={() => navigate("/onboarding")}
                >
                  Get Started Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className={`px-8 ${theme === 'light' 
                    ? 'border-slate-400 text-slate-700 hover:bg-slate-100 hover:border-slate-500' 
                    : 'border-white text-white hover:bg-white/20'}`}
                  onClick={() => navigate("/contact")}
                >
                  Talk to Sales
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className={`py-12 px-3 sm:px-4 border-t ${theme === 'light' ? 'border-slate-200' : 'border-slate-600'}`}>
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className={`${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} font-semibold mb-4`}>Product</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate("/features")} className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-slate-100'} text-left`}>Features</button></li>
                <li><a href="#pricing" className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>Pricing</a></li>
                <li><button onClick={() => navigate("/security")} className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'} text-left`}>Security</button></li>
              </ul>
            </div>
            <div>
              <h3 className={`${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} font-semibold mb-4`}>Platform</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate("/documentation")} className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'} text-left`}>Documentation</button></li>
                <li><button onClick={() => navigate("/roadmap")} className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'} text-left`}>Roadmap</button></li>
                <li><button onClick={() => navigate("/about")} className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'} text-left`}>About Dev</button></li>
              </ul>
            </div>
            <div>
              <h3 className={`${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} font-semibold mb-4`}>Support</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => navigate("/compliance-simplification")} 
                    className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'} text-left transition-colors`}
                  >
                    Compliance Simplification
                  </button>
                </li>
                <li><span className={`${theme === 'light' ? 'text-slate-400' : 'text-slate-500'} cursor-not-allowed`}>Help Center</span></li>
                <li><span className={`${theme === 'light' ? 'text-slate-400' : 'text-slate-500'} cursor-not-allowed`}>API Reference</span></li>
                <li><span className={`${theme === 'light' ? 'text-slate-400' : 'text-slate-500'} cursor-not-allowed`}>Status Page</span></li>
              </ul>
            </div>
            <div>
              <h3 className={`${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} font-semibold mb-4`}>Legal</h3>
              <ul className="space-y-2">
                <li><button onClick={() => navigate("/privacy")} className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'} text-left`}>Privacy Policy</button></li>
                <li><button onClick={() => navigate("/terms")} className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'} text-left`}>Terms of Service</button></li>
                <li><button onClick={() => navigate("/cookies")} className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'} text-left`}>Cookie Policy</button></li>
              </ul>
            </div>
          </div>
          <div className={`text-center ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'} pt-8 ${theme === 'light' ? 'border-t border-slate-200' : 'border-t border-slate-600'}`}>
            <p>© 2025 AuditReady. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

