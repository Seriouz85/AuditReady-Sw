import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Building2, Users, Check, ChevronRight, ChevronLeft, ArrowRight, Crown, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ZoomToggle } from "@/components/ui/zoom-toggle";
import { createCheckoutSession, redirectToCheckout } from "@/api/stripe";
import { PRICING_PLANS } from "@/lib/stripe";
import { toast } from "@/utils/toast";

interface OnboardingData {
  organizationInfo: {
    size: string;
    industry: string;
    complianceFrameworks: string[];
    currentMaturity: string;
    timeline: string;
  };
  teamSetup: {
    teamSize: string;
    roles: string[];
  };
  goals: {
    primaryGoal: string;
    priorityFrameworks: string[];
    timeline: string;
    specificRequirements: string;
  };
  preferences: {
    notifications: boolean;
    weeklyReports: boolean;
    complianceAlerts: boolean;
    trainingReminders: boolean;
  };
}

const PublicOnboarding = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const totalSteps = 3;

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    organizationInfo: {
      size: "",
      industry: "",
      complianceFrameworks: [],
      currentMaturity: "",
      timeline: ""
    },
    teamSetup: {
      teamSize: "",
      roles: []
    },
    goals: {
      primaryGoal: "",
      priorityFrameworks: [],
      timeline: "",
      specificRequirements: ""
    },
    preferences: {
      notifications: true,
      weeklyReports: true,
      complianceAlerts: true,
      trainingReminders: true
    }
  });

  const getRecommendedPlan = (): 'free' | 'team' | 'business' | 'enterprise' => {
    const { organizationInfo, teamSetup, goals } = onboardingData;
    
    // Enterprise indicators
    if (
      organizationInfo.size === "1000+" ||
      organizationInfo.industry === "finance" ||
      organizationInfo.industry === "healthcare" ||
      goals.primaryGoal === "enterprise_compliance" ||
      teamSetup.teamSize === "50+"
    ) {
      return 'enterprise';
    }
    
    // Business indicators
    if (
      organizationInfo.size === "101-500" ||
      organizationInfo.size === "501-1000" ||
      organizationInfo.complianceFrameworks.length > 2 ||
      teamSetup.teamSize === "11-50" ||
      goals.priorityFrameworks.length > 2
    ) {
      return 'business';
    }
    
    // Team indicators
    if (
      organizationInfo.size === "11-50" ||
      organizationInfo.size === "51-100" ||
      teamSetup.teamSize === "6-10" ||
      organizationInfo.complianceFrameworks.length > 0
    ) {
      return 'team';
    }
    
    // Default to free
    return 'free';
  };

  const updateData = (step: keyof OnboardingData, data: Partial<OnboardingData[keyof OnboardingData]>) => {
    setOnboardingData(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data }
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - show recommendations
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSelectPlan = (planId: string) => {
    if (!planId) return;
    
    // Store onboarding data in localStorage for later use
    localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
    localStorage.setItem('selectedPlan', planId);
    localStorage.setItem('recommendedPlan', getRecommendedPlan());
    
    // Go to signup - payment will be handled after account creation
    navigate('/signup', { state: { selectedPlan: planId, fromOnboarding: true } });
  };

  const organizationSizes = [
    { value: "1-10", label: "1-10 employees" },
    { value: "11-50", label: "11-50 employees" },
    { value: "51-100", label: "51-100 employees" },
    { value: "101-500", label: "101-500 employees" },
    { value: "501-1000", label: "501-1000 employees" },
    { value: "1000+", label: "1000+ employees" }
  ];

  const industries = [
    { value: "technology", label: "Technology" },
    { value: "finance", label: "Financial Services" },
    { value: "healthcare", label: "Healthcare" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "retail", label: "Retail" },
    { value: "education", label: "Education" },
    { value: "government", label: "Government" },
    { value: "consulting", label: "Consulting" },
    { value: "real_estate", label: "Real Estate" },
    { value: "legal", label: "Legal Services" },
    { value: "insurance", label: "Insurance" },
    { value: "energy", label: "Energy & Utilities" },
    { value: "transportation", label: "Transportation" },
    { value: "telecommunications", label: "Telecommunications" },
    { value: "non_profit", label: "Non-Profit" },
    { value: "other", label: "Other" }
  ];

  const frameworks = [
    { value: "iso27001", label: "ISO 27001" },
    { value: "iso27002", label: "ISO 27002" },
    { value: "nis2", label: "NIS2" },
    { value: "gdpr", label: "GDPR" },
    { value: "cis", label: "CIS Controls" },
    { value: "soc1", label: "SOC 1" },
    { value: "soc2", label: "SOC 2" }
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="h-full flex flex-col">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Tell us about your organization</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Help us understand your compliance needs
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-auto">
              {/* Left Column - Organization Size */}
              <div className="space-y-1">
                <div>
                  <Label className="text-base font-medium mb-2 block">Organization size</Label>
                  <RadioGroup 
                    value={onboardingData.organizationInfo.size} 
                    onValueChange={(value) => updateData('organizationInfo', { size: value })}
                    className="grid grid-cols-1 gap-1"
                  >
                    {organizationSizes.map((size) => (
                      <Label 
                        key={size.value}
                        className="flex items-center space-x-2 p-1.5 border rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-blue-300 dark:hover:border-blue-600"
                      >
                        <RadioGroupItem value={size.value} className="h-4 w-4" />
                        <span className="text-sm">{size.label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-medium mb-2 block">Primary goal</Label>
                  <RadioGroup 
                    value={onboardingData.goals.primaryGoal} 
                    onValueChange={(value) => updateData('goals', { primaryGoal: value })}
                    className="grid grid-cols-1 gap-1"
                  >
                    <Label className="flex items-center space-x-2 p-2 border-2 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-blue-300 dark:hover:border-blue-600">
                      <RadioGroupItem value="first_certification" className="h-4 w-4" />
                      <span className="text-sm">First certification</span>
                    </Label>
                    <Label className="flex items-center space-x-2 p-2 border-2 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-blue-300 dark:hover:border-blue-600">
                      <RadioGroupItem value="improve_existing" className="h-4 w-4" />
                      <span className="text-sm">Improve existing</span>
                    </Label>
                    <Label className="flex items-center space-x-2 p-2 border-2 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-blue-300 dark:hover:border-blue-600">
                      <RadioGroupItem value="multiple_frameworks" className="h-4 w-4" />
                      <span className="text-sm">Multiple frameworks</span>
                    </Label>
                    <Label className="flex items-center space-x-2 p-2 border-2 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-blue-300 dark:hover:border-blue-600">
                      <RadioGroupItem value="enterprise_compliance" className="h-4 w-4" />
                      <span className="text-sm">Enterprise management</span>
                    </Label>
                  </RadioGroup>
                </div>
              </div>

              {/* Middle Column - Industry */}
              <div className="space-y-2">
                <div>
                  <Label className="text-base font-medium mb-2 block">Industry</Label>
                  <RadioGroup 
                    value={onboardingData.organizationInfo.industry} 
                    onValueChange={(value) => updateData('organizationInfo', { industry: value })}
                    className="grid grid-cols-1 gap-1"
                  >
                    {industries.map((industry) => (
                      <Label 
                        key={industry.value}
                        className="flex items-center space-x-2 p-1.5 border rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-blue-300 dark:hover:border-blue-600"
                      >
                        <RadioGroupItem value={industry.value} className="h-3 w-3" />
                        <span className="text-xs">{industry.label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              {/* Right Column - Maturity Level */}
              <div className="space-y-2">
                <div>
                  <Label className="text-base font-medium mb-2 block">Maturity level</Label>
                  <RadioGroup 
                    value={onboardingData.organizationInfo.currentMaturity} 
                    onValueChange={(value) => updateData('organizationInfo', { currentMaturity: value })}
                    className="grid grid-cols-1 gap-2"
                  >
                    <Label className="flex items-center space-x-2 p-2 border-2 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-blue-300 dark:hover:border-blue-600">
                      <RadioGroupItem value="none" className="h-4 w-4" />
                      <span className="text-sm">Getting started</span>
                    </Label>
                    <Label className="flex items-center space-x-2 p-2 border-2 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-blue-300 dark:hover:border-blue-600">
                      <RadioGroupItem value="basic" className="h-4 w-4" />
                      <span className="text-sm">Some policies</span>
                    </Label>
                    <Label className="flex items-center space-x-2 p-2 border-2 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-blue-300 dark:hover:border-blue-600">
                      <RadioGroupItem value="intermediate" className="h-4 w-4" />
                      <span className="text-sm">Partially compliant</span>
                    </Label>
                    <Label className="flex items-center space-x-2 p-2 border-2 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-blue-300 dark:hover:border-blue-600">
                      <RadioGroupItem value="advanced" className="h-4 w-4" />
                      <span className="text-sm">Need refinement</span>
                    </Label>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="h-full flex flex-col">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Compliance Details</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Tell us about your current compliance status and timeline
              </p>
            </div>
            
            <div className="flex-1 grid grid-cols-3 gap-4">
              {/* Left Column - Frameworks */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium mb-2 block">Compliance frameworks</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Select all that apply</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {frameworks.map((framework) => (
                      <Label 
                        key={framework.value}
                        className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-blue-300 dark:hover:border-blue-600"
                      >
                        <Checkbox 
                          checked={onboardingData.organizationInfo.complianceFrameworks.includes(framework.value)}
                          onCheckedChange={(checked) => {
                            const current = onboardingData.organizationInfo.complianceFrameworks;
                            const updated = checked 
                              ? [...current, framework.value]
                              : current.filter(f => f !== framework.value);
                            updateData('organizationInfo', { complianceFrameworks: updated });
                          }}
                        />
                        <span className="text-sm">{framework.label}</span>
                      </Label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Middle Column - Team Size */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium mb-2 block">Team size</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Working on compliance</p>
                  <RadioGroup 
                    value={onboardingData.teamSetup.teamSize} 
                    onValueChange={(value) => updateData('teamSetup', { teamSize: value })}
                    className="grid grid-cols-1 gap-1"
                  >
                    <Label className="flex items-center space-x-2 p-2 border-2 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-blue-300 dark:hover:border-blue-600">
                      <RadioGroupItem value="1-2" className="h-4 w-4" />
                      <span className="text-sm">1-2 people</span>
                    </Label>
                    <Label className="flex items-center space-x-2 p-2 border-2 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-blue-300 dark:hover:border-blue-600">
                      <RadioGroupItem value="3-5" className="h-4 w-4" />
                      <span className="text-sm">3-5 people</span>
                    </Label>
                    <Label className="flex items-center space-x-2 p-2 border-2 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-blue-300 dark:hover:border-blue-600">
                      <RadioGroupItem value="6-10" className="h-4 w-4" />
                      <span className="text-sm">6-10 people</span>
                    </Label>
                    <Label className="flex items-center space-x-2 p-2 border-2 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-blue-300 dark:hover:border-blue-600">
                      <RadioGroupItem value="11-50" className="h-4 w-4" />
                      <span className="text-sm">11-50 people</span>
                    </Label>
                    <Label className="flex items-center space-x-2 p-2 border-2 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-blue-300 dark:hover:border-blue-600">
                      <RadioGroupItem value="50+" className="h-4 w-4" />
                      <span className="text-sm">50+ people</span>
                    </Label>
                  </RadioGroup>
                </div>
              </div>

              {/* Right Column - Timeline */}
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium mb-2 block">Timeline</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">When do you need this?</p>
                  <RadioGroup 
                    value={onboardingData.goals.timeline} 
                    onValueChange={(value) => updateData('goals', { timeline: value })}
                    className="grid grid-cols-1 gap-2"
                  >
                    <Label className="flex items-center space-x-2 p-2 border-2 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-blue-300 dark:hover:border-blue-600">
                      <RadioGroupItem value="immediate" className="h-4 w-4" />
                      <span className="text-sm">Immediate (1-3m)</span>
                    </Label>
                    <Label className="flex items-center space-x-2 p-2 border-2 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-blue-300 dark:hover:border-blue-600">
                      <RadioGroupItem value="short" className="h-4 w-4" />
                      <span className="text-sm">Short term (3-6m)</span>
                    </Label>
                    <Label className="flex items-center space-x-2 p-2 border-2 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-blue-300 dark:hover:border-blue-600">
                      <RadioGroupItem value="medium" className="h-4 w-4" />
                      <span className="text-sm">Medium term (6-12m)</span>
                    </Label>
                    <Label className="flex items-center space-x-2 p-2 border-2 rounded cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:border-blue-300 dark:hover:border-blue-600">
                      <RadioGroupItem value="long" className="h-4 w-4" />
                      <span className="text-sm">Long term (12m+)</span>
                    </Label>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        const recommendedPlan = getRecommendedPlan();
        
        // Set default selected plan to recommended if not already selected
        if (!selectedPlan) {
          setSelectedPlan(recommendedPlan);
        }
        
        const allPlans = [
          {
            id: "free",
            name: "Free", 
            price: "Free",
            description: "Perfect for exploring AuditReady features",
            features: ["Full feature access (demo)", "Demo workflows & data", "Community support"],
            recommended: recommendedPlan === 'free',
            popular: false
          },
          {
            id: "team",
            name: "Team",
            price: "€499",
            period: "/month",
            description: "Perfect for small to medium teams",
            features: ["Up to 50 team members", "Multi-framework compliance", "Team collaboration tools", "Automated assignments", "Basic reporting", "Email support"],
            recommended: recommendedPlan === 'team',
            popular: true
          },
          {
            id: "business", 
            name: "Business",
            price: "€699",
            period: "/month", 
            description: "Advanced features for growing companies",
            features: ["Everything in Team", "Up to 250 team members", "AuditReady Risk Management", "Learning Management System", "Advanced reporting", "Custom templates", "Priority support"],
            recommended: recommendedPlan === 'business',
            popular: false
          },
          {
            id: "enterprise",
            name: "Enterprise",
            price: "€999",
            period: "/month",
            description: "Complete solution for large organizations", 
            features: ["Everything in Business", "Unlimited team members", "Phishing Simulation Tool", "AuditReady AI Editor", "Advanced threat detection", "White-label solutions", "Dedicated account manager", "24/7 phone support & SLA"],
            recommended: recommendedPlan === 'enterprise',
            popular: false
          }
        ];

        return (
          <div className="h-full flex flex-col">
            <div className="text-center mb-6">
              <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-2 flex items-center justify-center gap-2`}>
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                Perfect! Here's your recommendation
              </h2>
              <p className={`text-slate-600 dark:text-slate-400 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                Based on your needs, we've found the ideal plan for your organization
              </p>
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-auto">
              {allPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-xl p-3 cursor-pointer transition-all h-full flex flex-col ${
                    selectedPlan === plan.id
                      ? 'border-2 border-blue-500 shadow-xl'
                      : plan.recommended
                        ? 'border-2 border-green-500 shadow-xl'
                        : plan.popular
                          ? 'border-2 border-blue-500 shadow-lg'
                          : 'border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  } ${
                    theme === 'light' ? 'bg-white' : 'bg-slate-800'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.recommended && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-green-500 text-white px-2 py-0.5 text-xs">
                        Recommended
                      </Badge>
                    </div>
                  )}
                  {plan.popular && !plan.recommended && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-blue-500 text-white px-2 py-0.5 text-xs">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  {/* Icon */}
                  <div className="text-center mb-3 mt-1">
                    <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center shadow-lg ${
                      plan.id === 'free' ? 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600' :
                      plan.id === 'team' ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30' :
                      plan.id === 'business' ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/30' :
                      'bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/30'
                    }`}>
                      {plan.id === 'free' && <Star className="h-5 w-5 text-slate-600 dark:text-slate-400" />}
                      {plan.id === 'team' && <Users className="h-5 w-5 text-white" />}
                      {plan.id === 'business' && <Building2 className="h-5 w-5 text-white" />}
                      {plan.id === 'enterprise' && <Crown className="h-5 w-5 text-white" />}
                    </div>
                  </div>
                  
                  {/* Plan Details */}
                  <div className="text-center mb-5">
                    <h3 className={`text-lg font-bold mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                      {plan.name}
                    </h3>
                    <div className="mb-2">
                      <span className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          {plan.period}
                        </span>
                      )}
                    </div>
                    {plan.price !== 'Free' && (
                      <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'} mb-2`}>
                        Excl. VAT
                      </p>
                    )}
                    <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'} leading-relaxed min-h-[2.5rem] flex items-center justify-center`}>
                      {plan.description}
                    </p>
                  </div>
                  
                  {/* Features */}
                  <ul className="space-y-1.5 mb-3 flex-1 text-left min-h-[180px] flex flex-col justify-start">
                    {plan.features.map((feature, index) => {
                      const isHighlight = feature.includes('AuditReady') || feature.includes('Phishing') || feature.includes('AI Editor') || feature.includes('Risk Management') || feature.includes('Learning Management');
                      return (
                        <li key={index} className="flex items-start text-sm min-h-[1.4rem]">
                          <Check className="h-3.5 w-3.5 text-green-500 mr-2.5 mt-0.5 flex-shrink-0" />
                          <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} leading-tight flex-1 ${
                            isHighlight ? 'font-semibold' : ''
                          }`}>
                            {isHighlight && theme === 'light' && (
                              <span className="relative inline-block">
                                <span className="relative z-10 px-1 py-0.5">{feature}</span>
                                <span className="absolute inset-0 bg-gradient-to-r from-blue-100/80 via-purple-100/80 to-blue-100/80 rounded-md shadow-sm"></span>
                              </span>
                            )}
                            {isHighlight && theme === 'dark' && (
                              <span className="relative inline-block">
                                <span className="relative z-10 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent font-bold">{feature}</span>
                                <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-md blur-sm"></span>
                              </span>
                            )}
                            {!isHighlight && feature}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  
                  {/* Button */}
                  <Button
                    size="default"
                    variant={selectedPlan === plan.id ? 'default' : 'outline'}
                    className={`w-full text-sm font-semibold py-3 ${
                      selectedPlan === plan.id
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                        : plan.recommended
                          ? 'border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 shadow-md'
                          : 'shadow-sm'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(plan.id);
                    }}
                  >
                    {selectedPlan === plan.id ? 'Selected' : plan.recommended ? 'Get Started' : 'Select Plan'}
                  </Button>
                </div>
              ))}
            </div>

            <div className={`text-center mt-2 p-1 rounded ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'}`}>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                All plans include a 14-day free trial • No credit card required • Cancel anytime
              </p>
            </div>
          </div>
        );


      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'light' ? 'bg-slate-50' : 'bg-gradient-to-b from-slate-900 to-slate-800'}`}>
      {/* Header */}
      <header className={`border-b ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className={`h-8 w-8 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
            <h1 className={`text-xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
              Find Your Perfect Plan
            </h1>
          </div>
          
          {/* Step Progress Indicators */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  step < currentStep
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : step === currentStep
                      ? 'border-blue-600 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'border-slate-300 text-slate-400 dark:border-slate-600 dark:text-slate-500'
                }`}>
                  {step < currentStep ? '✓' : step}
                </div>
                {step < totalSteps && (
                  <div className={`w-12 h-0.5 ${
                    step < currentStep
                      ? 'bg-blue-600'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className={theme === 'light' ? 'text-slate-700 hover:text-slate-900' : 'text-slate-300 hover:text-slate-100'}
            >
              Home
            </Button>
            <ZoomToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col px-6 py-6">

        {/* Main Content */}
        <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto">
          <Card className={`flex-1 flex flex-col ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'} shadow-lg`}>
            <CardContent className="flex-1 p-8 overflow-auto">
              {renderStep()}
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6 max-w-7xl mx-auto w-full">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 ${theme === 'light' ? 'border-slate-300' : 'border-slate-600'}`}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          {currentStep < totalSteps ? (
            <Button
              onClick={nextStep}
              disabled={
                (currentStep === 1 && (!onboardingData.organizationInfo.size || !onboardingData.organizationInfo.industry || !onboardingData.goals.primaryGoal || !onboardingData.organizationInfo.currentMaturity)) ||
                (currentStep === 2 && (!onboardingData.goals.timeline || !onboardingData.teamSetup.teamSize))
              }
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => handleSelectPlan(selectedPlan)}
              disabled={!selectedPlan}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              Continue to Sign Up
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicOnboarding;