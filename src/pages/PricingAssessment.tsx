import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Shield, Building2, Users, Check, ChevronRight, ChevronLeft, 
  Star, Zap, Crown, Calculator, TrendingUp, Home 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ZoomToggle } from "@/components/ui/zoom-toggle";

interface AssessmentData {
  organizationType: string;
  organizationName: string;
  industry: string;
  companySize: string;
  complianceFrameworks: string[];
  timeline: string;
}

interface PricingTier {
  id: string;
  name: string;
  icon: React.ReactNode;
  price: number;
  userRange: string;
  description: string;
  features: string[];
  recommended?: boolean;
  popular?: boolean;
}

const PricingAssessment = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [recommendedTier, setRecommendedTier] = useState<string | null>(null);
  
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    organizationType: "",
    organizationName: "",
    industry: "",
    companySize: "",
    complianceFrameworks: [],
    timeline: "",
  });

  const totalSteps = 3;

  const organizationTypes = [
    { id: "startup", name: "Startup", description: "Early stage company, rapid growth" },
    { id: "smb", name: "Small/Medium Business", description: "Established business, 10-500 employees" },
    { id: "enterprise", name: "Enterprise", description: "Large organization, 500+ employees" },
    { id: "nonprofit", name: "Non-Profit", description: "Non-profit organization or charity" },
    { id: "government", name: "Government", description: "Government agency or department" },
    { id: "consulting", name: "Consulting Firm", description: "Professional services or consulting" }
  ];

  const industries = [
    "Technology & Software",
    "Financial Services",
    "Healthcare & Life Sciences", 
    "Manufacturing",
    "Retail & E-commerce",
    "Education",
    "Government & Public Sector",
    "Professional Services",
    "Energy & Utilities",
    "Other"
  ];

  const companySizeOptions = [
    { id: "test", name: "Test Version", description: "Demo/evaluation purposes", tier: "free" },
    { id: "small", name: "Small Team", description: "1-50 employees", tier: "team" },
    { id: "medium", name: "Business", description: "50-1000 employees", tier: "business" },
    { id: "enterprise", name: "Enterprise", description: "1000+ employees", tier: "enterprise" }
  ];

  const complianceFrameworks = [
    "SOC 2 Type I/II",
    "ISO 27001",
    "GDPR Compliance",
    "HIPAA",
    "PCI DSS",
    "NIST Framework",
    "FedRAMP",
    "CCPA",
    "Other/Custom"
  ];

  const timelineOptions = [
    "Immediate (within 1 month)",
    "Short-term (1-3 months)",
    "Medium-term (3-6 months)", 
    "Long-term (6-12 months)",
    "Future planning (12+ months)"
  ];

  const pricingTiers: PricingTier[] = [
    {
      id: "free",
      name: "Free",
      icon: <Star className="h-6 w-6" />,
      price: 0,
      userRange: "Test version",
      description: "Try AuditReady with mock authentication",
      features: [
        "Full feature access (demo mode)",
        "Mock data and workflows",
        "Basic compliance templates",
        "Standard reporting",
        "Community support"
      ]
    },
    {
      id: "team", 
      name: "Team",
      icon: <Users className="h-6 w-6" />,
      price: 499,
      userRange: "1-50 employees",
      description: "Perfect for small to medium teams",
      features: [
        "All core features",
        "Multi-framework support",
        "Advanced reporting & analytics", 
        "Team collaboration tools",
        "Email support",
        "Up to 5 compliance frameworks"
      ],
      popular: true
    },
    {
      id: "business",
      name: "Business", 
      icon: <Building2 className="h-6 w-6" />,
      price: 699,
      userRange: "50-1000 employees",
      description: "Advanced features for growing businesses",
      features: [
        "Everything in Team",
        "Custom audit templates",
        "API integrations",
        "Priority support",
        "Advanced security features",
        "Unlimited frameworks",
        "Custom workflows"
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise", 
      icon: <Crown className="h-6 w-6" />,
      price: 999,
      userRange: "1000+ employees",
      description: "Complete solution for large organizations",
      features: [
        "Everything in Business",
        "White-label solution",
        "Dedicated support manager",
        "Single Sign-On (SSO)",
        "Custom development",
        "SLA guarantees",
        "On-premise deployment",
        "24/7 phone support"
      ],
      recommended: true
    }
  ];

  const calculateRecommendedTier = () => {
    const companySize = assessmentData.companySize;
    const frameworks = assessmentData.complianceFrameworks.length;
    
    // Get recommended tier based on company size
    const sizeOption = companySizeOptions.find(option => option.id === companySize);
    let recommendedTier = sizeOption?.tier || "free";
    
    // Upgrade recommendation based on compliance requirements
    if (frameworks >= 4) {
      recommendedTier = "enterprise";
    } else if (frameworks >= 2 && recommendedTier === "free") {
      recommendedTier = "team";
    }
    
    return recommendedTier;
  };

  const handleNext = () => {
    if (currentStep === 2) {
      // Calculate recommendation before showing pricing
      const recommended = calculateRecommendedTier();
      setRecommendedTier(recommended);
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // Navigate to landing page when on step 1
      navigate('/');
    }
  };

  const handleFrameworkToggle = (framework: string) => {
    const current = assessmentData.complianceFrameworks;
    const updated = current.includes(framework)
      ? current.filter(f => f !== framework)
      : [...current, framework];
    
    setAssessmentData(prev => ({
      ...prev,
      complianceFrameworks: updated
    }));
  };


  const handleSelectTier = async (tierId: string) => {
    // Store the selected tier and assessment data
    localStorage.setItem('auditready_assessment_data', JSON.stringify(assessmentData));
    localStorage.setItem('auditready_selected_tier', tierId);
    
    // Handle payment flow based on tier
    if (tierId === 'free') {
      // Free tier goes directly to signup
      navigate('/signup');
      return;
    }
    
    if (tierId === 'enterprise') {
      // Enterprise goes to contact sales
      navigate('/contact');
      return;
    }
    
    // For paid tiers, check if Stripe is configured
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey || publishableKey === 'your-stripe-publishable-key') {
      // If Stripe not configured, go directly to signup
      navigate('/signup');
      return;
    }
    
    // TODO: Implement guest checkout for paid tiers
    // For now, redirect to signup (payment will happen after account creation)
    navigate('/signup');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return assessmentData.organizationType && assessmentData.organizationName && assessmentData.industry && assessmentData.companySize;
      case 2:
        return assessmentData.complianceFrameworks.length > 0 && assessmentData.timeline;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <Building2 className={`h-8 w-8 mx-auto ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
              <h2 className={`text-xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                Tell us about your organization
              </h2>
              <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                Help us understand your compliance needs and recommend the perfect plan
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-4 mt-4">
              <div className="space-y-3">
                <div>
                  <label className={`text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Organization Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Your Company Inc."
                    value={assessmentData.organizationName}
                    onChange={(e) => setAssessmentData(prev => ({
                      ...prev,
                      organizationName: e.target.value
                    }))}
                    className={`mt-1 h-10 text-sm ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-700 border-slate-600'}`}
                  />
                </div>

                <div>
                  <label className={`text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Organization Type
                  </label>
                  <div className="grid grid-cols-1 gap-1 mt-1">
                    {organizationTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setAssessmentData(prev => ({
                          ...prev,
                          organizationType: type.id
                        }))}
                        className={`p-2 text-left rounded-lg border transition-all text-sm ${
                          assessmentData.organizationType === type.id
                            ? theme === 'light'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-blue-400 bg-blue-900/30 text-blue-300'
                            : theme === 'light'
                              ? 'border-slate-200 hover:border-slate-300'
                              : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <div className="font-medium text-sm">{type.name}</div>
                        <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          {type.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={`text-base font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Industry
                  </label>
                  <div className="grid grid-cols-1 gap-2 mt-3">
                    {industries.map((industry) => (
                      <button
                        key={industry}
                        onClick={() => setAssessmentData(prev => ({
                          ...prev,
                          industry
                        }))}
                        className={`p-2 text-left rounded-lg border transition-all text-sm ${
                          assessmentData.industry === industry
                            ? theme === 'light'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-blue-400 bg-blue-900/30 text-blue-300'
                            : theme === 'light'
                              ? 'border-slate-200 hover:border-slate-300'
                              : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        {industry}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={`text-base font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    Company Size
                  </label>
                  <div className="grid grid-cols-1 gap-3 mt-3">
                    {companySizeOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setAssessmentData(prev => ({
                          ...prev,
                          companySize: option.id
                        }))}
                        className={`p-2 text-left rounded-lg border transition-all text-sm ${
                          assessmentData.companySize === option.id
                            ? theme === 'light'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-blue-400 bg-blue-900/30 text-blue-300'
                            : theme === 'light'
                              ? 'border-slate-200 hover:border-slate-300'
                              : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <div className="font-medium text-sm">{option.name}</div>
                        <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          {option.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <Shield className={`h-14 w-14 mx-auto ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
              <h2 className={`text-3xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                Compliance Requirements & Timeline
              </h2>
              <p className={`text-lg ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                Tell us about your compliance needs and implementation timeline
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 mt-6">
              <div className="space-y-6">
                <label className={`text-base font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Compliance Frameworks (select all that apply)
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-2">
                  {complianceFrameworks.map((framework) => (
                    <button
                      key={framework}
                      onClick={() => handleFrameworkToggle(framework)}
                      className={`p-3 text-left rounded-lg border transition-all flex items-center gap-3 ${
                        assessmentData.complianceFrameworks.includes(framework)
                          ? theme === 'light'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-blue-400 bg-blue-900/30 text-blue-300'
                          : theme === 'light'
                            ? 'border-slate-200 hover:border-slate-300'
                            : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        assessmentData.complianceFrameworks.includes(framework)
                          ? 'bg-blue-500 border-blue-500'
                          : theme === 'light' ? 'border-slate-300' : 'border-slate-500'
                      }`}>
                        {assessmentData.complianceFrameworks.includes(framework) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{framework}</span>
                    </button>
                  ))}
                </div>
                <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  Selected: {assessmentData.complianceFrameworks.length} framework(s)
                </p>
              </div>

              <div className="space-y-6">
                <label className={`text-base font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Implementation Timeline
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {timelineOptions.map((timeline) => (
                    <button
                      key={timeline}
                      onClick={() => setAssessmentData(prev => ({
                        ...prev,
                        timeline
                      }))}
                      className={`p-3 text-left rounded-lg border transition-all ${
                        assessmentData.timeline === timeline
                          ? theme === 'light'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-blue-400 bg-blue-900/30 text-blue-300'
                          : theme === 'light'
                            ? 'border-slate-200 hover:border-slate-300'
                            : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <span className="text-sm font-medium">{timeline}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <TrendingUp className={`h-12 w-12 mx-auto ${theme === 'light' ? 'text-green-600' : 'text-green-400'}`} />
              <h2 className={`text-3xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                Perfect! Here's your recommendation
              </h2>
              <p className={`text-lg ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                Based on your needs, we've found the ideal plan for {assessmentData.organizationName}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {pricingTiers.map((tier) => (
                <Card 
                  key={tier.id}
                  className={`relative transition-all cursor-pointer h-full flex flex-col ${
                    tier.id === recommendedTier
                      ? theme === 'light'
                        ? 'border-green-500 bg-green-50 shadow-lg'
                        : 'border-green-400 bg-green-900/20 shadow-lg'
                      : tier.popular
                        ? theme === 'light'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-blue-400 bg-blue-900/20'
                        : theme === 'light'
                          ? 'border-slate-200 hover:border-slate-300'
                          : 'border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => handleSelectTier(tier.id)}
                >
                  {tier.id === recommendedTier && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-500 text-white px-3 py-1 text-xs whitespace-nowrap">
                        Recommended
                      </Badge>
                    </div>
                  )}
                  {tier.popular && tier.id !== recommendedTier && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center flex-shrink-0 pb-4">
                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${
                      tier.id === recommendedTier
                        ? 'bg-green-500 text-white'
                        : tier.popular
                          ? 'bg-blue-500 text-white'
                          : theme === 'light'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-slate-700 text-slate-300'
                    }`}>
                      {tier.icon}
                    </div>
                    <CardTitle className={`text-lg ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-1`}>
                      {tier.name}
                    </CardTitle>
                    <div className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                      {tier.price === 0 ? 'Free' : `€${tier.price}`}
                      {tier.price > 0 && (
                        <span className={`text-xs font-normal ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          /month
                        </span>
                      )}
                    </div>
                    {tier.price > 0 && (
                      <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'} mb-1`}>
                        Excl. VAT
                      </p>
                    )}
                    <p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                      {tier.userRange}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col pt-0">
                    <p className={`text-xs mb-3 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                      {tier.description}
                    </p>
                    <ul className="space-y-1 flex-1">
                      {tier.features.slice(0, 4).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className={`h-3 w-3 mt-0.5 flex-shrink-0 ${
                            tier.id === recommendedTier
                              ? 'text-green-500'
                              : 'text-blue-500'
                          }`} />
                          <span className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                      {tier.features.length > 4 && (
                        <li className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'} pl-5`}>
                          +{tier.features.length - 4} more features
                        </li>
                      )}
                    </ul>
                    
                    <Button 
                      size="sm"
                      className={`w-full mt-4 ${
                        tier.id === recommendedTier
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : tier.popular
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : theme === 'light'
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                              : 'bg-slate-700 hover:bg-slate-600 text-slate-100'
                      }`}
                    >
                      {tier.id === recommendedTier ? 'Get Started' : 'Select Plan'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className={`text-center text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              All plans include a 14-day free trial • No credit card required • Cancel anytime
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-slate-50' : 'bg-gradient-to-b from-slate-900 to-slate-800'}`}>
      {/* Header */}
      <div className={`border-b ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className={`h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
            <h1 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
              Find Your Perfect Plan
            </h1>
          </div>
          
          {/* Step Progress Indicator */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step < currentStep 
                      ? `${theme === 'light' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}` 
                      : step === currentStep 
                      ? `${theme === 'light' ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' : 'bg-blue-900/50 text-blue-400 border-2 border-blue-400'}` 
                      : `${theme === 'light' ? 'bg-slate-100 text-slate-400' : 'bg-slate-700 text-slate-500'}`
                  }`}>
                    {step < currentStep ? '✓' : step}
                  </div>
                  {step < totalSteps && (
                    <div className={`w-6 h-0.5 ${
                      step < currentStep 
                        ? `${theme === 'light' ? 'bg-blue-600' : 'bg-blue-500'}` 
                        : `${theme === 'light' ? 'bg-slate-200' : 'bg-slate-600'}`
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className={`flex items-center gap-2 ${theme === 'light' ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-200 hover:text-slate-100 hover:bg-slate-700'}`}
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
            <ZoomToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full mx-auto px-6 py-2">

        {/* Step Content */}
        <div className="w-full max-w-7xl mx-auto px-4">
          {currentStep === 3 ? (
            // Pricing step gets full width
            <div className={`w-full ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'} rounded-xl border p-6`}>
              {renderStepContent()}
            </div>
          ) : (
            // Other steps get full width layout
            <Card className={`w-full ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
              <CardContent className="p-6">
                {renderStepContent()}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8 max-w-7xl mx-auto px-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className={`flex items-center gap-2 ${theme === 'light' ? 'border-slate-200' : 'border-slate-600'}`}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => navigate('/signup')}
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

export default PricingAssessment;