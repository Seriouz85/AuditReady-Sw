import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Building2, Users, Check, ChevronRight, ChevronLeft, Rocket, BookOpen, Target, Import, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/utils/toast";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ZoomToggle } from "@/components/ui/zoom-toggle";
import { useAuth } from "@/contexts/AuthContext";

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
    inviteEmails: string[];
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
    importMethod: string;
  };
}

const EnhancedOnboardingFlow = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, organization } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    organizationInfo: {
      size: "",
      industry: "",
      complianceFrameworks: [],
      currentMaturity: "",
      timeline: "",
    },
    teamSetup: {
      teamSize: "",
      roles: [],
      inviteEmails: [""],
    },
    goals: {
      primaryGoal: "",
      priorityFrameworks: [],
      timeline: "",
      specificRequirements: "",
    },
    preferences: {
      notifications: true,
      weeklyReports: true,
      complianceAlerts: true,
      trainingReminders: true,
      importMethod: "guided",
    },
  });

  const totalSteps = 6;

  // Load any existing data from signup process
  useEffect(() => {
    const tempSignupData = localStorage.getItem('temp_signup_data');
    if (tempSignupData) {
      const data = JSON.parse(tempSignupData);
      // Pre-fill organization name and other data if available
      console.log('Loaded signup data:', data);
    }
  }, []);

  const organizationSizes = [
    { value: "1-10", label: "1-10 employees", description: "Small startup or team" },
    { value: "11-50", label: "11-50 employees", description: "Growing company" },
    { value: "51-200", label: "51-200 employees", description: "Mid-size business" },
    { value: "201-1000", label: "201-1000 employees", description: "Large organization" },
    { value: "1000+", label: "1000+ employees", description: "Enterprise" }
  ];

  const industries = [
    { value: "technology", label: "Technology", frameworks: ["SOC 2", "ISO 27001"] },
    { value: "healthcare", label: "Healthcare", frameworks: ["HIPAA", "SOC 2"] },
    { value: "financial", label: "Financial Services", frameworks: ["SOC 2", "PCI DSS", "GDPR"] },
    { value: "manufacturing", label: "Manufacturing", frameworks: ["ISO 27001", "NIST"] },
    { value: "retail", label: "Retail & E-commerce", frameworks: ["PCI DSS", "GDPR"] },
    { value: "education", label: "Education", frameworks: ["FERPA", "SOC 2"] },
    { value: "government", label: "Government", frameworks: ["FedRAMP", "NIST"] },
    { value: "other", label: "Other", frameworks: ["SOC 2", "ISO 27001"] }
  ];

  const complianceFrameworks = [
    { value: "soc2", label: "SOC 2", description: "Security, availability, and confidentiality" },
    { value: "iso27001", label: "ISO 27001", description: "Information security management" },
    { value: "gdpr", label: "GDPR", description: "EU data protection regulation" },
    { value: "hipaa", label: "HIPAA", description: "Healthcare information privacy" },
    { value: "pci", label: "PCI DSS", description: "Payment card industry standards" },
    { value: "nist", label: "NIST", description: "Cybersecurity framework" },
    { value: "fedramp", label: "FedRAMP", description: "Federal cloud security" },
    { value: "other", label: "Other", description: "Custom or additional frameworks" }
  ];

  const maturityLevels = [
    { value: "basic", label: "Basic", description: "Just getting started with compliance" },
    { value: "developing", label: "Developing", description: "Some processes in place, need structure" },
    { value: "defined", label: "Defined", description: "Clear processes, working toward certification" },
    { value: "managed", label: "Managed", description: "Certified, maintaining compliance" },
    { value: "optimizing", label: "Optimizing", description: "Continuous improvement and multiple frameworks" }
  ];

  const primaryGoals = [
    { value: "certification", label: "Get Certified", description: "Achieve compliance certification" },
    { value: "maintain", label: "Maintain Compliance", description: "Keep existing certifications current" },
    { value: "improve", label: "Improve Security", description: "Strengthen security posture" },
    { value: "prepare", label: "Prepare for Audit", description: "Get ready for upcoming audit" },
    { value: "streamline", label: "Streamline Processes", description: "Automate compliance workflows" }
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
      // Save comprehensive onboarding data
      localStorage.setItem('auditready_onboarding_complete', JSON.stringify({
        ...onboardingData,
        completedAt: new Date().toISOString(),
        userId: user?.id,
        organizationId: organization?.id
      }));
      
      // Clear temporary signup data
      localStorage.removeItem('temp_signup_data');
      
      // Simulate API call to save data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Welcome to AuditReady! Your setup is complete.");
      
      // Navigate to guided first standard import or main app
      if (onboardingData.preferences.importMethod === 'guided') {
        navigate('/guided-import');
      } else {
        navigate('/app');
      }
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
        return onboardingData.organizationInfo.currentMaturity;
      case 4:
        return onboardingData.goals.primaryGoal;
      case 5:
        return onboardingData.teamSetup.teamSize;
      case 6:
        return true; // Preferences have defaults
      default:
        return false;
    }
  };

  const getProgressPercentage = () => {
    return Math.round((currentStep / totalSteps) * 100);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Building2 className={`h-12 w-12 mx-auto ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
              <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                About Your Organization
              </h2>
              <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                Help us customize AuditReady for your specific needs
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <label className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Organization Size
                </label>
                <RadioGroup 
                  value={onboardingData.organizationInfo.size} 
                  onValueChange={(value) => setOnboardingData(prev => ({
                    ...prev,
                    organizationInfo: { ...prev.organizationInfo, size: value }
                  }))}
                >
                  {organizationSizes.map((size) => (
                    <div key={size.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={size.value} id={size.value} />
                      <Label htmlFor={size.value} className="flex-1 cursor-pointer">
                        <div>
                          <div className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                            {size.label}
                          </div>
                          <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            {size.description}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <label className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Industry
                </label>
                <RadioGroup 
                  value={onboardingData.organizationInfo.industry} 
                  onValueChange={(value) => {
                    // Auto-suggest relevant frameworks based on industry
                    const industry = industries.find(i => i.value === value);
                    setOnboardingData(prev => ({
                      ...prev,
                      organizationInfo: { 
                        ...prev.organizationInfo, 
                        industry: value,
                        complianceFrameworks: industry?.frameworks || []
                      }
                    }));
                  }}
                >
                  {industries.map((industry) => (
                    <div key={industry.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={industry.value} id={industry.value} />
                      <Label htmlFor={industry.value} className="flex-1 cursor-pointer">
                        <div>
                          <div className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                            {industry.label}
                          </div>
                          <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            Common: {industry.frameworks.join(', ')}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
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
                Select all compliance frameworks relevant to your organization
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {complianceFrameworks.map((framework) => (
                <button
                  key={framework.value}
                  onClick={() => handleFrameworkToggle(framework.value)}
                  className={`p-4 text-left rounded-lg border transition-all flex items-start gap-3 ${
                    onboardingData.organizationInfo.complianceFrameworks.includes(framework.value)
                      ? theme === 'light'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-blue-400 bg-blue-900/30 text-blue-300'
                      : theme === 'light'
                        ? 'border-slate-200 hover:border-slate-300'
                        : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center mt-1 ${
                    onboardingData.organizationInfo.complianceFrameworks.includes(framework.value)
                      ? 'bg-blue-500 border-blue-500'
                      : theme === 'light' ? 'border-slate-300' : 'border-slate-500'
                  }`}>
                    {onboardingData.organizationInfo.complianceFrameworks.includes(framework.value) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{framework.label}</div>
                    <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      {framework.description}
                    </div>
                  </div>
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
              <Target className={`h-12 w-12 mx-auto ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
              <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                Current Compliance Maturity
              </h2>
              <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                Where does your organization stand today?
              </p>
            </div>

            <RadioGroup 
              value={onboardingData.organizationInfo.currentMaturity} 
              onValueChange={(value) => setOnboardingData(prev => ({
                ...prev,
                organizationInfo: { ...prev.organizationInfo, currentMaturity: value }
              }))}
              className="space-y-3"
            >
              {maturityLevels.map((level) => (
                <div key={level.value} className={`p-4 rounded-lg border ${
                  onboardingData.organizationInfo.currentMaturity === level.value
                    ? theme === 'light' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-blue-400 bg-blue-900/30'
                    : theme === 'light' ? 'border-slate-200' : 'border-slate-600'
                }`}>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value={level.value} id={level.value} />
                    <Label htmlFor={level.value} className="flex-1 cursor-pointer">
                      <div className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                        {level.label}
                      </div>
                      <div className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                        {level.description}
                      </div>
                    </Label>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Rocket className={`h-12 w-12 mx-auto ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
              <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                Your Compliance Goals
              </h2>
              <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                What's your primary objective with AuditReady?
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <label className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Primary Goal
                </label>
                <RadioGroup 
                  value={onboardingData.goals.primaryGoal} 
                  onValueChange={(value) => setOnboardingData(prev => ({
                    ...prev,
                    goals: { ...prev.goals, primaryGoal: value }
                  }))}
                >
                  {primaryGoals.map((goal) => (
                    <div key={goal.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={goal.value} id={goal.value} />
                      <Label htmlFor={goal.value} className="flex-1 cursor-pointer">
                        <div>
                          <div className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                            {goal.label}
                          </div>
                          <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                            {goal.description}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Timeline (Optional)
                </label>
                <Input
                  placeholder="e.g., 6 months, end of year"
                  value={onboardingData.goals.timeline}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    goals: { ...prev.goals, timeline: e.target.value }
                  }))}
                  className={theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-700 border-slate-600'}
                />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Specific Requirements (Optional)
                </label>
                <Textarea
                  placeholder="Any specific compliance requirements, constraints, or objectives..."
                  value={onboardingData.goals.specificRequirements}
                  onChange={(e) => setOnboardingData(prev => ({
                    ...prev,
                    goals: { ...prev.goals, specificRequirements: e.target.value }
                  }))}
                  className={theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-700 border-slate-600'}
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Users className={`h-12 w-12 mx-auto ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
              <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                Team Setup
              </h2>
              <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                Configure your compliance team structure
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <label className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  How many people will be involved in compliance activities?
                </label>
                <RadioGroup 
                  value={onboardingData.teamSetup.teamSize} 
                  onValueChange={(value) => setOnboardingData(prev => ({
                    ...prev,
                    teamSetup: { ...prev.teamSetup, teamSize: value }
                  }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="just-me" id="just-me" />
                    <Label htmlFor="just-me">Just me (solo)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2-5" id="2-5" />
                    <Label htmlFor="2-5">2-5 people</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="6-10" id="6-10" />
                    <Label htmlFor="6-10">6-10 people</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="10+" id="10+" />
                    <Label htmlFor="10+">More than 10 people</Label>
                  </div>
                </RadioGroup>
              </div>

              {onboardingData.teamSetup.teamSize && onboardingData.teamSetup.teamSize !== 'just-me' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                      Invite Team Members (Optional)
                    </label>
                    <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      You can also invite team members later from the settings page
                    </p>
                  </div>
                  
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
                  
                  {onboardingData.teamSetup.inviteEmails.length < 5 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addEmailField}
                      className={`w-full ${theme === 'light' ? 'border-slate-200' : 'border-slate-600'}`}
                    >
                      + Add Another Email
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Settings className={`h-12 w-12 mx-auto ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
              <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                Final Preferences
              </h2>
              <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                Customize your AuditReady experience
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-4">
                <h3 className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                  Notifications
                </h3>
                
                {[
                  { key: 'notifications', label: 'Email Notifications', description: 'Important updates and deadlines' },
                  { key: 'weeklyReports', label: 'Weekly Reports', description: 'Progress summaries and insights' },
                  { key: 'complianceAlerts', label: 'Compliance Alerts', description: 'Urgent compliance matters' },
                  { key: 'trainingReminders', label: 'Training Reminders', description: 'Team training and education' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                        {item.label}
                      </h4>
                      <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                        {item.description}
                      </p>
                    </div>
                    <Checkbox
                      checked={onboardingData.preferences[item.key as keyof typeof onboardingData.preferences] as boolean}
                      onCheckedChange={(checked) => setOnboardingData(prev => ({
                        ...prev,
                        preferences: { 
                          ...prev.preferences, 
                          [item.key]: checked === true 
                        }
                      }))}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                  Getting Started
                </h3>
                <RadioGroup 
                  value={onboardingData.preferences.importMethod} 
                  onValueChange={(value) => setOnboardingData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, importMethod: value }
                  }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="guided" id="guided" />
                    <Label htmlFor="guided" className="flex-1">
                      <div>
                        <div className="font-medium">Guided Setup</div>
                        <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          Step-by-step help importing your first compliance standard
                        </div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="explore" id="explore" />
                    <Label htmlFor="explore" className="flex-1">
                      <div>
                        <div className="font-medium">Explore on My Own</div>
                        <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          Jump straight into the platform and explore features
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
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
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className={`h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
              <h1 className={`text-lg font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                Welcome to AuditReady
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <ZoomToggle />
              <ThemeToggle />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                Step {currentStep} of {totalSteps}
              </span>
              <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                {getProgressPercentage()}% complete
              </span>
            </div>
            <div className={`w-full h-2 rounded-full ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-700'}`}>
              <div 
                className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step Content */}
        <Card className={`w-full max-w-3xl mx-auto ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6 max-w-3xl mx-auto">
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
              disabled={isLoading || !canProceed()}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              {isLoading ? "Setting up..." : "Complete Setup"}
              <Rocket className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedOnboardingFlow;