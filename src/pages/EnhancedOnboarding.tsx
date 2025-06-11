import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Building2, Users, Check, ChevronRight, ChevronLeft, CreditCard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/utils/toast";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ZoomToggle } from "@/components/ui/zoom-toggle";
import { SubscriptionService, SUBSCRIPTION_PLANS, type SubscriptionPlan } from "@/services/billing/SubscriptionService";
import { useAuth } from "@/contexts/AuthContext";

interface OnboardingData {
  organizationInfo: {
    name: string;
    size: string;
    industry: string;
    complianceFrameworks: string[];
  };
  subscriptionPlan: string;
  teamSetup: {
    inviteEmails: string[];
    roles: string[];
  };
  preferences: {
    notifications: boolean;
    weeklyReports: boolean;
    complianceAlerts: boolean;
  };
}

const EnhancedOnboarding = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedPlan, setRecommendedPlan] = useState<SubscriptionPlan | null>(null);
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    organizationInfo: {
      name: "",
      size: "",
      industry: "",
      complianceFrameworks: [],
    },
    subscriptionPlan: "free",
    teamSetup: {
      inviteEmails: [""],
      roles: [],
    },
    preferences: {
      notifications: true,
      weeklyReports: true,
      complianceAlerts: true,
    },
  });

  const totalSteps = 4;

  const organizationSizes = [
    { value: "1", label: "Just me (1 person)" },
    { value: "2-10", label: "Small team (2-10 people)" },
    { value: "11-50", label: "Growing company (11-50 people)" },
    { value: "51-200", label: "Medium business (51-200 people)" },
    { value: "201-1000", label: "Large organization (201-1000 people)" },
    { value: "1000+", label: "Enterprise (1000+ people)" },
  ];

  const industries = [
    "Technology", "Healthcare", "Financial Services", "Manufacturing", 
    "Retail", "Education", "Government", "Non-profit", "Other"
  ];

  const complianceFrameworks = [
    "SOC 2", "ISO 27001", "HIPAA", "PCI DSS", "GDPR", 
    "NIST", "FedRAMP", "CIS Controls", "Other"
  ];

  // Update recommended plan when organization size changes
  const handleSizeChange = (size: string) => {
    setOnboardingData(prev => ({
      ...prev,
      organizationInfo: { ...prev.organizationInfo, size }
    }));
    
    const recommended = SubscriptionService.getRecommendedPlan(size);
    setRecommendedPlan(recommended);
    setOnboardingData(prev => ({
      ...prev,
      subscriptionPlan: recommended.id
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) {
      toast.error("Please log in to complete onboarding");
      return;
    }

    setIsLoading(true);
    
    try {
      // Create customer and organization
      const result = await SubscriptionService.createCustomerAndOrganization({
        organizationName: onboardingData.organizationInfo.name,
        email: user.email!,
        planId: onboardingData.subscriptionPlan,
        userId: user.id,
        metadata: {
          industry: onboardingData.organizationInfo.industry,
          size: onboardingData.organizationInfo.size,
          frameworks: onboardingData.organizationInfo.complianceFrameworks.join(',')
        }
      });

      if (result.requiresPayment) {
        // Create Stripe checkout session
        const session = await SubscriptionService.createCheckoutSession({
          planId: onboardingData.subscriptionPlan,
          customerEmail: user.email!,
          organizationId: result.organization.id,
          successUrl: `${window.location.origin}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/onboarding/cancelled`
        });

        // Redirect to Stripe Checkout
        window.location.href = session.url;
      } else {
        // Free plan - redirect directly to dashboard
        toast.success("Welcome to Audit Readiness Hub!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Failed to complete onboarding. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPlanCardClass = (plan: SubscriptionPlan) => {
    const baseClass = "relative cursor-pointer transition-all duration-200 hover:shadow-lg";
    const isSelected = onboardingData.subscriptionPlan === plan.id;
    const isRecommended = recommendedPlan?.id === plan.id;
    
    if (isSelected) {
      return `${baseClass} ring-2 ring-blue-500 shadow-lg scale-105`;
    }
    if (isRecommended) {
      return `${baseClass} ring-2 ring-green-500/50 shadow-md`;
    }
    return `${baseClass} border hover:border-blue-300`;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Building2 className="mx-auto h-12 w-12 text-blue-600" />
              <h2 className="text-2xl font-bold">Organization Information</h2>
              <p className="text-gray-600">Tell us about your organization</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="orgName">Organization Name *</Label>
                <Input
                  id="orgName"
                  placeholder="Enter your organization name"
                  value={onboardingData.organizationInfo.name}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    organizationInfo: { ...prev.organizationInfo, name: e.target.value }
                  }))}
                />
              </div>

              <div>
                <Label>Organization Size *</Label>
                <RadioGroup
                  value={onboardingData.organizationInfo.size}
                  onValueChange={handleSizeChange}
                  className="mt-2"
                >
                  {organizationSizes.map((size) => (
                    <div key={size.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={size.value} id={size.value} />
                      <Label htmlFor={size.value}>{size.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label>Industry</Label>
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={onboardingData.organizationInfo.industry}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    organizationInfo: { ...prev.organizationInfo, industry: e.target.value }
                  }))}
                >
                  <option value="">Select your industry</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Compliance Frameworks (select all that apply)</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {complianceFrameworks.map((framework) => (
                    <div key={framework} className="flex items-center space-x-2">
                      <Checkbox
                        id={framework}
                        checked={onboardingData.organizationInfo.complianceFrameworks.includes(framework)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setOnboardingData(prev => ({
                              ...prev,
                              organizationInfo: {
                                ...prev.organizationInfo,
                                complianceFrameworks: [...prev.organizationInfo.complianceFrameworks, framework]
                              }
                            }));
                          } else {
                            setOnboardingData(prev => ({
                              ...prev,
                              organizationInfo: {
                                ...prev.organizationInfo,
                                complianceFrameworks: prev.organizationInfo.complianceFrameworks.filter(f => f !== framework)
                              }
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={framework}>{framework}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CreditCard className="mx-auto h-12 w-12 text-blue-600" />
              <h2 className="text-2xl font-bold">Choose Your Plan</h2>
              <p className="text-gray-600">
                {recommendedPlan ? `We recommend the ${recommendedPlan.name} plan for your organization size` : "Select the plan that fits your needs"}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  className={getPlanCardClass(plan)}
                  onClick={() => setOnboardingData(prev => ({ ...prev, subscriptionPlan: plan.id }))}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                      Most Popular
                    </Badge>
                  )}
                  {recommendedPlan?.id === plan.id && (
                    <Badge className="absolute -top-2 right-2 bg-green-600">
                      Recommended
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold">
                      {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
                      {plan.price > 0 && <span className="text-sm font-normal text-gray-500">/month</span>}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {plan.features.slice(0, 4).map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                      <div>Users: {plan.limits.users === -1 ? 'Unlimited' : plan.limits.users}</div>
                      <div>Storage: {plan.limits.storage === -1 ? 'Unlimited' : `${plan.limits.storage}GB`}</div>
                      <div>Support: {plan.limits.support}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {onboardingData.subscriptionPlan !== 'free' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Payment Information</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      You'll be redirected to our secure payment processor to complete your subscription.
                      You can start your trial immediately and cancel anytime.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Users className="mx-auto h-12 w-12 text-blue-600" />
              <h2 className="text-2xl font-bold">Team Setup</h2>
              <p className="text-gray-600">Invite team members to your organization</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Invite Team Members (optional)</Label>
                <p className="text-sm text-gray-500 mb-2">You can always invite team members later</p>
                {onboardingData.teamSetup.inviteEmails.map((email, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <Input
                      placeholder="teammate@company.com"
                      value={email}
                      onChange={(e) => {
                        const newEmails = [...onboardingData.teamSetup.inviteEmails];
                        newEmails[index] = e.target.value;
                        setOnboardingData(prev => ({
                          ...prev,
                          teamSetup: { ...prev.teamSetup, inviteEmails: newEmails }
                        }));
                      }}
                    />
                    {index === onboardingData.teamSetup.inviteEmails.length - 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOnboardingData(prev => ({
                          ...prev,
                          teamSetup: {
                            ...prev.teamSetup,
                            inviteEmails: [...prev.teamSetup.inviteEmails, ""]
                          }
                        }))}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Shield className="mx-auto h-12 w-12 text-blue-600" />
              <h2 className="text-2xl font-bold">Preferences</h2>
              <p className="text-gray-600">Customize your experience</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notifications"
                    checked={onboardingData.preferences.notifications}
                    onCheckedChange={(checked) => setOnboardingData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, notifications: !!checked }
                    }))}
                  />
                  <Label htmlFor="notifications">Email notifications for important updates</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="weeklyReports"
                    checked={onboardingData.preferences.weeklyReports}
                    onCheckedChange={(checked) => setOnboardingData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, weeklyReports: !!checked }
                    }))}
                  />
                  <Label htmlFor="weeklyReports">Weekly compliance reports</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="complianceAlerts"
                    checked={onboardingData.preferences.complianceAlerts}
                    onCheckedChange={(checked) => setOnboardingData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, complianceAlerts: !!checked }
                    }))}
                  />
                  <Label htmlFor="complianceAlerts">Compliance deadline alerts</Label>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Ready to Get Started!</h4>
                <p className="text-sm text-green-700">
                  Click "Complete Setup" to finalize your onboarding and access your audit readiness dashboard.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return onboardingData.organizationInfo.name.trim() !== "" && 
               onboardingData.organizationInfo.size !== "";
      case 2:
        return onboardingData.subscriptionPlan !== "";
      case 3:
        return true; // Team setup is optional
      case 4:
        return true; // Preferences are optional
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to Home
        </Button>
        <ThemeToggle />
        <ZoomToggle />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <Card className="mb-8">
            <CardContent className="p-8">
              {renderStep()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canProceed() || isLoading}
                className="flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Setting up...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Setup</span>
                    <Check className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedOnboarding;