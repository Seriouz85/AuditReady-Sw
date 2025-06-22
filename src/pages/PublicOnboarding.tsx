import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Building2, Users, Check, ChevronRight, ChevronLeft, ArrowRight, Crown } from "lucide-react";
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
  const totalSteps = 4;

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

  const handleComplete = () => {
    const finalPlan = selectedPlan || getRecommendedPlan();
    
    // Store onboarding data in localStorage for later use
    localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
    localStorage.setItem('selectedPlan', finalPlan);
    localStorage.setItem('recommendedPlan', getRecommendedPlan());
    
    // Navigate to pricing with selected plan
    navigate(`/pricing?recommended=${finalPlan}`);
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
    { value: "other", label: "Other" }
  ];

  const frameworks = [
    { value: "iso27001", label: "ISO 27001" },
    { value: "soc2", label: "SOC 2" },
    { value: "pci", label: "PCI DSS" },
    { value: "gdpr", label: "GDPR" },
    { value: "hipaa", label: "HIPAA" },
    { value: "nist", label: "NIST Framework" },
    { value: "cis", label: "CIS Controls" },
    { value: "fedramp", label: "FedRAMP" }
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-xl font-bold">Tell us about your organization</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Help us understand your compliance needs
              </p>
            </div>
            
            <div className="space-y-5">
              <div>
                <Label className="text-base font-medium">Organization size</Label>
                <RadioGroup 
                  value={onboardingData.organizationInfo.size} 
                  onValueChange={(value) => updateData('organizationInfo', { size: value })}
                  className="grid grid-cols-3 gap-3 mt-3"
                >
                  {organizationSizes.map((size) => (
                    <Label 
                      key={size.value}
                      className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <RadioGroupItem value={size.value} />
                      <span className="text-sm">{size.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium">Industry</Label>
                <RadioGroup 
                  value={onboardingData.organizationInfo.industry} 
                  onValueChange={(value) => updateData('organizationInfo', { industry: value })}
                  className="grid grid-cols-3 gap-3 mt-3"
                >
                  {industries.map((industry) => (
                    <Label 
                      key={industry.value}
                      className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <RadioGroupItem value={industry.value} />
                      <span className="text-sm">{industry.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-xl font-bold">Compliance frameworks</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Which frameworks do you need to comply with?
              </p>
            </div>
            
            <div className="space-y-5">
              <div>
                <Label className="text-sm font-medium">Select all that apply</Label>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {frameworks.map((framework) => (
                    <Label 
                      key={framework.value}
                      className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
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

              <div>
                <Label className="text-sm font-medium">Current compliance maturity</Label>
                <RadioGroup 
                  value={onboardingData.organizationInfo.currentMaturity} 
                  onValueChange={(value) => updateData('organizationInfo', { currentMaturity: value })}
                  className="grid grid-cols-3 gap-3 mt-3"
                >
                  <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    <RadioGroupItem value="none" />
                    <span className="text-sm">Getting started</span>
                  </Label>
                  <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    <RadioGroupItem value="basic" />
                    <span className="text-sm">Some policies</span>
                  </Label>
                  <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    <RadioGroupItem value="intermediate" />
                    <span className="text-sm">Partially compliant</span>
                  </Label>
                  <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 col-span-2">
                    <RadioGroupItem value="advanced" />
                    <span className="text-sm">Need refinement</span>
                  </Label>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-xl font-bold">Team and goals</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Help us understand your team structure and objectives
              </p>
            </div>
            
            <div className="space-y-5">
              <div>
                <Label className="text-sm font-medium">Team size working on compliance</Label>
                <RadioGroup 
                  value={onboardingData.teamSetup.teamSize} 
                  onValueChange={(value) => updateData('teamSetup', { teamSize: value })}
                  className="grid grid-cols-3 gap-3 mt-3"
                >
                  <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    <RadioGroupItem value="1-2" />
                    <span className="text-sm">1-2 people</span>
                  </Label>
                  <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    <RadioGroupItem value="3-5" />
                    <span className="text-sm">3-5 people</span>
                  </Label>
                  <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    <RadioGroupItem value="6-10" />
                    <span className="text-sm">6-10 people</span>
                  </Label>
                  <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    <RadioGroupItem value="11-50" />
                    <span className="text-sm">11-50 people</span>
                  </Label>
                  <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 col-span-2">
                    <RadioGroupItem value="50+" />
                    <span className="text-sm">50+ people</span>
                  </Label>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-sm font-medium">Primary goal</Label>
                <RadioGroup 
                  value={onboardingData.goals.primaryGoal} 
                  onValueChange={(value) => updateData('goals', { primaryGoal: value })}
                  className="grid grid-cols-3 gap-3 mt-3"
                >
                  <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    <RadioGroupItem value="first_certification" />
                    <span className="text-sm">First compliance certification</span>
                  </Label>
                  <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    <RadioGroupItem value="improve_existing" />
                    <span className="text-sm">Improve existing program</span>
                  </Label>
                  <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    <RadioGroupItem value="multiple_frameworks" />
                    <span className="text-sm">Multiple frameworks</span>
                  </Label>
                  <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 col-span-2">
                    <RadioGroupItem value="enterprise_compliance" />
                    <span className="text-sm">Enterprise management</span>
                  </Label>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium">Timeline</Label>
                <RadioGroup 
                  value={onboardingData.goals.timeline} 
                  onValueChange={(value) => updateData('goals', { timeline: value })}
                  className="grid grid-cols-3 gap-3 mt-3"
                >
                  <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    <RadioGroupItem value="immediate" />
                    <span className="text-sm">Immediate (1-3 months)</span>
                  </Label>
                  <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    <RadioGroupItem value="short" />
                    <span className="text-sm">Short term (3-6 months)</span>
                  </Label>
                  <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                    <RadioGroupItem value="medium" />
                    <span className="text-sm">Medium term (6-12 months)</span>
                  </Label>
                  <Label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 col-span-2">
                    <RadioGroupItem value="long" />
                    <span className="text-sm">Long term (12+ months)</span>
                  </Label>
                </RadioGroup>
              </div>
            </div>
          </div>
        );

      case 4:
        const recommendedPlan = getRecommendedPlan();
        
        // Set default selected plan to recommended if not already selected
        if (!selectedPlan) {
          setSelectedPlan(recommendedPlan);
        }
        
        const allPlans = [
          {
            id: "free",
            name: "Starter", 
            price: "Free",
            description: "Perfect for getting started",
            features: ["Basic compliance tracking", "Up to 2 standards", "Community support", "Basic templates"],
            recommended: recommendedPlan === 'free',
            popular: false
          },
          {
            id: "team",
            name: "Team",
            price: "$49",
            period: "/month",
            description: "Great for small teams",
            features: ["Advanced tracking", "Up to 5 standards", "Team collaboration", "Priority support", "Advanced analytics"],
            recommended: recommendedPlan === 'team',
            popular: true
          },
          {
            id: "business", 
            name: "Business",
            price: "$149",
            period: "/month", 
            description: "Perfect for growing companies",
            features: ["Unlimited standards", "Advanced analytics", "Custom reports", "Dedicated support", "API access", "Custom workflows"],
            recommended: recommendedPlan === 'business',
            popular: false
          },
          {
            id: "enterprise",
            name: "Enterprise",
            price: "Custom",
            description: "Built for large organizations", 
            features: ["White-label solution", "Custom integrations", "Dedicated CSM", "SLA guarantees", "On-premise deployment", "24/7 phone support"],
            recommended: recommendedPlan === 'enterprise',
            popular: false
          }
        ];

        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold">Choose Your Perfect Plan</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Select the plan that best fits your organization's needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {allPlans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`relative h-full flex flex-col cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? 'border-2 border-blue-500 shadow-lg bg-blue-50 dark:bg-blue-900/10' 
                      : plan.recommended 
                        ? 'border-2 border-green-500 shadow-lg bg-green-50 dark:bg-green-900/10' 
                        : plan.popular
                          ? 'border-2 border-purple-500 shadow-lg bg-purple-50 dark:bg-purple-900/10'
                          : 'border hover:shadow-md'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {selectedPlan === plan.id && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white px-3 py-1">
                        ✓ Selected
                      </Badge>
                    </div>
                  )}
                  {plan.recommended && selectedPlan !== plan.id && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-500 text-white px-3 py-1">
                        ✓ Recommended for You
                      </Badge>
                    </div>
                  )}
                  {plan.popular && !plan.recommended && selectedPlan !== plan.id && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-500 text-white px-3 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4 pt-6">
                    <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold">
                      {plan.price}
                      {plan.period && <span className="text-sm font-normal text-slate-500">{plan.period}</span>}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent className="flex-1 pt-0">
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h3 className="font-semibold mb-2">All plans include:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-slate-600 dark:text-slate-400">
                <div>• 14-day free trial</div>
                <div>• No setup fees</div>
                <div>• Cancel anytime</div>
              </div>
            </div>
          </div>
        );


      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-800/90 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">AuditReady</span>
          </div>
          
          {/* Center - Home Button */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Button variant="outline" onClick={() => navigate("/")}>
              Home
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <ZoomToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={nextStep}
            disabled={
              (currentStep === 1 && (!onboardingData.organizationInfo.size || !onboardingData.organizationInfo.industry)) ||
              (currentStep === 2 && (!onboardingData.organizationInfo.currentMaturity)) ||
              (currentStep === 3 && (!onboardingData.teamSetup.teamSize || !onboardingData.goals.primaryGoal || !onboardingData.goals.timeline)) ||
              (currentStep === 4 && !selectedPlan)
            }
            className="flex items-center"
          >
            {currentStep === 4 ? (
              <>
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PublicOnboarding;