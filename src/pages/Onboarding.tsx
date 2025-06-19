import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Building2, Users, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/utils/toast";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ZoomToggle } from "@/components/ui/zoom-toggle";

interface OnboardingData {
  organizationInfo: {
    size: string;
    industry: string;
    complianceFrameworks: string[];
  };
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

const Onboarding = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    organizationInfo: {
      size: "",
      industry: "",
      complianceFrameworks: [],
    },
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
    "1-10 employees",
    "11-50 employees", 
    "51-200 employees",
    "201-1000 employees",
    "1000+ employees"
  ];

  const industries = [
    "Technology",
    "Healthcare",
    "Financial Services",
    "Manufacturing", 
    "Retail",
    "Education",
    "Government",
    "Other"
  ];

  const complianceFrameworks = [
    "SOC 2",
    "ISO 27001",
    "GDPR",
    "HIPAA",
    "PCI DSS",
    "NIST",
    "FedRAMP",
    "Other"
  ];

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

  const handleFrameworkToggle = (framework: string) => {
    const current = onboardingData.organizationInfo.complianceFrameworks;
    const updated = current.includes(framework)
      ? current.filter(f => f !== framework)
      : [...current, framework];
    
    setOnboardingData(prev => ({
      ...prev,
      organizationInfo: {
        ...prev.organizationInfo,
        complianceFrameworks: updated
      }
    }));
  };

  const addEmailField = () => {
    setOnboardingData(prev => ({
      ...prev,
      teamSetup: {
        ...prev.teamSetup,
        inviteEmails: [...prev.teamSetup.inviteEmails, ""]
      }
    }));
  };

  const updateEmail = (index: number, email: string) => {
    setOnboardingData(prev => ({
      ...prev,
      teamSetup: {
        ...prev.teamSetup,
        inviteEmails: prev.teamSetup.inviteEmails.map((e, i) => i === index ? email : e)
      }
    }));
  };

  const removeEmail = (index: number) => {
    setOnboardingData(prev => ({
      ...prev,
      teamSetup: {
        ...prev.teamSetup,
        inviteEmails: prev.teamSetup.inviteEmails.filter((_, i) => i !== index)
      }
    }));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Save onboarding data to localStorage for use in payment flow
      localStorage.setItem('auditready_onboarding_data', JSON.stringify(onboardingData));
      
      // Get intended plan from session storage (set from pricing cards)
      const intendedPlan = sessionStorage.getItem('intendedPlan') || 'team';
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success("Setup complete! Let's set up your subscription.");
      
      // Navigate to pricing assessment for payment
      navigate('/pricing-assessment');
    } catch (error) {
      console.error("Onboarding completion failed:", error);
      toast.error("Failed to complete setup. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return onboardingData.organizationInfo.size && onboardingData.organizationInfo.industry;
      case 2:
        return onboardingData.organizationInfo.complianceFrameworks.length > 0;
      case 3:
        return true; // Team setup is optional
      case 4:
        return true; // Preferences have defaults
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
                This helps us customize AuditReady for your needs
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Organization Size
                </label>
                <div className="grid grid-cols-1 gap-1">
                  {organizationSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setOnboardingData(prev => ({
                        ...prev,
                        organizationInfo: { ...prev.organizationInfo, size }
                      }))}
                      className={`p-2 text-left rounded-lg border transition-all text-sm ${
                        onboardingData.organizationInfo.size === size
                          ? theme === 'light'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-blue-400 bg-blue-900/30 text-blue-300'
                          : theme === 'light'
                            ? 'border-slate-200 hover:border-slate-300'
                            : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Industry
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {industries.map((industry) => (
                    <button
                      key={industry}
                      onClick={() => setOnboardingData(prev => ({
                        ...prev,
                        organizationInfo: { ...prev.organizationInfo, industry }
                      }))}
                      className={`p-2 text-left rounded-lg border transition-all text-sm ${
                        onboardingData.organizationInfo.industry === industry
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Shield className={`h-12 w-12 mx-auto ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
              <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                Compliance Frameworks
              </h2>
              <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                Select the compliance frameworks relevant to your organization
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {complianceFrameworks.map((framework) => (
                <button
                  key={framework}
                  onClick={() => handleFrameworkToggle(framework)}
                  className={`p-4 text-left rounded-lg border transition-all flex items-center gap-3 ${
                    onboardingData.organizationInfo.complianceFrameworks.includes(framework)
                      ? theme === 'light'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-blue-400 bg-blue-900/30 text-blue-300'
                      : theme === 'light'
                        ? 'border-slate-200 hover:border-slate-300'
                        : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    onboardingData.organizationInfo.complianceFrameworks.includes(framework)
                      ? 'bg-blue-500 border-blue-500'
                      : theme === 'light' ? 'border-slate-300' : 'border-slate-500'
                  }`}>
                    {onboardingData.organizationInfo.complianceFrameworks.includes(framework) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  {framework}
                </button>
              ))}
            </div>

            <div className="text-center">
              <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                Selected: {onboardingData.organizationInfo.complianceFrameworks.length} framework(s)
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Users className={`h-12 w-12 mx-auto ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
              <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                Invite Your Team
              </h2>
              <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                Add team members to collaborate on compliance (optional)
              </p>
            </div>

            <div className="space-y-4">
              {onboardingData.teamSetup.inviteEmails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="colleague@company.com"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    className={`flex-1 ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-700 border-slate-600'}`}
                  />
                  {onboardingData.teamSetup.inviteEmails.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeEmail(index)}
                      className={theme === 'light' ? 'border-slate-200' : 'border-slate-600'}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addEmailField}
                className={`w-full ${theme === 'light' ? 'border-slate-200' : 'border-slate-600'}`}
              >
                + Add Another Email
              </Button>
            </div>

            <div className={`text-center text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              Team members will receive an invitation email to join your organization
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Check className={`h-12 w-12 mx-auto ${theme === 'light' ? 'text-green-600' : 'text-green-400'}`} />
              <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                Notification Preferences
              </h2>
              <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                Stay informed about your compliance progress
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                    Email Notifications
                  </h3>
                  <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    Get notified about important updates and deadlines
                  </p>
                </div>
                <Checkbox
                  checked={onboardingData.preferences.notifications}
                  onCheckedChange={(checked) => setOnboardingData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, notifications: checked === true }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                    Weekly Reports
                  </h3>
                  <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    Receive weekly compliance progress summaries
                  </p>
                </div>
                <Checkbox
                  checked={onboardingData.preferences.weeklyReports}
                  onCheckedChange={(checked) => setOnboardingData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, weeklyReports: checked === true }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                    Compliance Alerts
                  </h3>
                  <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                    Get alerts when compliance tasks need attention
                  </p>
                </div>
                <Checkbox
                  checked={onboardingData.preferences.complianceAlerts}
                  onCheckedChange={(checked) => setOnboardingData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, complianceAlerts: checked === true }
                  }))}
                />
              </div>
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
              Setup
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
                    {step < currentStep ? <Check className="h-3 w-3" /> : step}
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
            <ZoomToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-2">

        {/* Step Content */}
        <Card className={`w-full max-w-2xl mx-auto ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-4 max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
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
              onClick={handleComplete}
              disabled={isLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              {isLoading ? "Setting up..." : "Complete Setup"}
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;