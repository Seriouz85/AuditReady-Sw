import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, FileText, Upload, Check, ChevronRight, ChevronLeft, BookOpen, Target, Users, Settings, Import, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/utils/toast";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ZoomToggle } from "@/components/ui/zoom-toggle";
import { AuthProgressIndicator } from "@/components/auth/AuthProgressIndicator";
import { AuthFeedback } from "@/components/auth/AuthFeedback";

interface StandardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  requirements: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  popular: boolean;
}

const GuidedStandardImport = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState<string>("");
  const [customRequirements, setCustomRequirements] = useState("");
  const [importMethod, setImportMethod] = useState<"template" | "upload" | "manual">("template");
  const [onboardingData, setOnboardingData] = useState<any>(null);

  const totalSteps = 4;

  // Load onboarding data to provide context
  useEffect(() => {
    const savedData = localStorage.getItem('auditready_onboarding_complete');
    if (savedData) {
      setOnboardingData(JSON.parse(savedData));
    }
  }, []);

  const standardTemplates: StandardTemplate[] = [
    {
      id: "soc2-type2",
      name: "SOC 2 Type II",
      description: "Comprehensive security, availability, and confidentiality controls",
      category: "Security",
      requirements: 64,
      difficulty: "Intermediate",
      estimatedTime: "3-6 months",
      popular: true
    },
    {
      id: "iso27001-2022",
      name: "ISO 27001:2022",
      description: "Information security management system standard",
      category: "Security",
      requirements: 93,
      difficulty: "Advanced",
      estimatedTime: "6-12 months",
      popular: true
    },
    {
      id: "gdpr-compliance",
      name: "GDPR Compliance",
      description: "EU General Data Protection Regulation requirements",
      category: "Privacy",
      requirements: 45,
      difficulty: "Intermediate",
      estimatedTime: "2-4 months",
      popular: true
    },
    {
      id: "hipaa-security",
      name: "HIPAA Security Rule",
      description: "Healthcare information privacy and security",
      category: "Healthcare",
      requirements: 32,
      difficulty: "Beginner",
      estimatedTime: "1-3 months",
      popular: false
    },
    {
      id: "pci-dss",
      name: "PCI DSS v4.0",
      description: "Payment Card Industry Data Security Standard",
      category: "Finance",
      requirements: 275,
      difficulty: "Advanced",
      estimatedTime: "6-9 months",
      popular: false
    },
    {
      id: "nist-csf",
      name: "NIST Cybersecurity Framework",
      description: "US cybersecurity framework",
      category: "Government",
      requirements: 108,
      difficulty: "Intermediate",
      estimatedTime: "4-8 months",
      popular: false
    }
  ];

  // Filter standards based on onboarding preferences
  const getRecommendedStandards = () => {
    if (!onboardingData?.organizationInfo?.complianceFrameworks) {
      return standardTemplates.slice(0, 3); // Default recommendations
    }

    const frameworkMap: Record<string, string> = {
      "soc2": "soc2-type2",
      "iso27001": "iso27001-2022", 
      "gdpr": "gdpr-compliance",
      "hipaa": "hipaa-security",
      "pci": "pci-dss",
      "nist": "nist-csf"
    };

    const recommended = onboardingData.organizationInfo.complianceFrameworks
      .map((framework: string) => frameworkMap[framework])
      .filter(Boolean)
      .map((id: string) => standardTemplates.find(t => t.id === id))
      .filter(Boolean);

    // Add popular standards if we don't have enough recommendations
    if (recommended.length < 3) {
      const popular = standardTemplates.filter(t => t.popular && !recommended.find(r => r.id === t.id));
      recommended.push(...popular.slice(0, 3 - recommended.length));
    }

    return recommended;
  };

  const steps = [
    {
      id: "select-method",
      label: "Import Method",
      status: currentStep > 1 ? "completed" : currentStep === 1 ? "active" : "pending",
      description: "Choose how to add standards"
    },
    {
      id: "select-standard", 
      label: "Select Standard",
      status: currentStep > 2 ? "completed" : currentStep === 2 ? "active" : "pending",
      description: "Pick your compliance framework"
    },
    {
      id: "customize",
      label: "Customize",
      status: currentStep > 3 ? "completed" : currentStep === 3 ? "active" : "pending", 
      description: "Tailor to your needs"
    },
    {
      id: "import",
      label: "Import",
      status: currentStep > 4 ? "completed" : currentStep === 4 ? "active" : "pending",
      description: "Set up your framework"
    }
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

  const handleImport = async () => {
    setIsLoading(true);
    try {
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedTemplate = standardTemplates.find(t => t.id === selectedStandard);
      toast.success(`Successfully imported ${selectedTemplate?.name || 'standard'}!`);
      
      // Store import completion
      localStorage.setItem('auditready_first_import_complete', JSON.stringify({
        standardId: selectedStandard,
        importMethod,
        customRequirements,
        completedAt: new Date().toISOString()
      }));
      
      // Navigate to main app
      navigate('/app', { 
        state: { 
          showWelcome: true,
          importedStandard: selectedTemplate?.name 
        }
      });
    } catch (error) {
      console.error("Import failed:", error);
      toast.error("Failed to import standard. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return importMethod !== "";
      case 2:
        return importMethod === "manual" || selectedStandard !== "";
      case 3:
        return true; // Customization is optional
      case 4:
        return true;
      default:
        return false;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return theme === 'light' ? 'text-green-600 bg-green-100' : 'text-green-400 bg-green-900/30';
      case "Intermediate":
        return theme === 'light' ? 'text-amber-600 bg-amber-100' : 'text-amber-400 bg-amber-900/30';
      case "Advanced":
        return theme === 'light' ? 'text-red-600 bg-red-100' : 'text-red-400 bg-red-900/30';
      default:
        return theme === 'light' ? 'text-slate-600 bg-slate-100' : 'text-slate-400 bg-slate-700';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Import className={`h-12 w-12 mx-auto ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
              <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                Import Your First Standard
              </h2>
              <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                Choose how you'd like to add compliance standards to AuditReady
              </p>
            </div>

            <RadioGroup 
              value={importMethod} 
              onValueChange={(value: "template" | "upload" | "manual") => setImportMethod(value)}
              className="space-y-4"
            >
              <div className={`p-4 rounded-lg border-2 transition-all ${
                importMethod === "template" 
                  ? theme === 'light' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-blue-400 bg-blue-900/30'
                  : theme === 'light' ? 'border-slate-200' : 'border-slate-600'
              }`}>
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="template" id="template" className="mt-1" />
                  <Label htmlFor="template" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      <span className="font-medium">Use Pre-built Template</span>
                      <Badge className="bg-green-500 text-white text-xs">Recommended</Badge>
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                      Start with industry-standard templates for common frameworks like SOC 2, ISO 27001, GDPR, etc.
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className={`flex items-center gap-1 ${theme === 'light' ? 'text-green-600' : 'text-green-400'}`}>
                        <Check className="h-3 w-3" />
                        Quick setup
                      </span>
                      <span className={`flex items-center gap-1 ${theme === 'light' ? 'text-green-600' : 'text-green-400'}`}>
                        <Check className="h-3 w-3" />
                        Best practices
                      </span>
                      <span className={`flex items-center gap-1 ${theme === 'light' ? 'text-green-600' : 'text-green-400'}`}>
                        <Check className="h-3 w-3" />
                        Industry tested
                      </span>
                    </div>
                  </Label>
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 transition-all ${
                importMethod === "upload" 
                  ? theme === 'light' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-blue-400 bg-blue-900/30'
                  : theme === 'light' ? 'border-slate-200' : 'border-slate-600'
              }`}>
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="upload" id="upload" className="mt-1" />
                  <Label htmlFor="upload" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      <span className="font-medium">Upload Existing Documents</span>
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                      Import your existing compliance documents, policies, and procedures.
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>
                        Supports: PDF, Word, Excel, CSV
                      </span>
                    </div>
                  </Label>
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 transition-all ${
                importMethod === "manual" 
                  ? theme === 'light' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-blue-400 bg-blue-900/30'
                  : theme === 'light' ? 'border-slate-200' : 'border-slate-600'
              }`}>
                <div className="flex items-start space-x-3">
                  <RadioGroupItem value="manual" id="manual" className="mt-1" />
                  <Label htmlFor="manual" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">Start from Scratch</span>
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                      Build your compliance framework manually with complete customization.
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>
                        Full control • Custom requirements • Advanced users
                      </span>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>

            {onboardingData && (
              <AuthFeedback
                type="info"
                title="Personalized Recommendations"
                message={`Based on your onboarding responses, we've identified ${onboardingData.organizationInfo?.complianceFrameworks?.length || 0} relevant frameworks for your ${onboardingData.organizationInfo?.industry || ''} organization.`}
              />
            )}
          </div>
        );

      case 2:
        if (importMethod === "manual") {
          return (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <FileText className={`h-12 w-12 mx-auto ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
                <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                  Custom Framework Setup
                </h2>
                <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                  You'll be taken to the framework builder to create your custom compliance standard
                </p>
              </div>

              <AuthFeedback
                type="info"
                title="Manual Setup Process"
                message="Creating a custom framework allows you to define your own requirements, controls, and procedures. This is ideal for unique compliance needs or proprietary standards."
                action={{
                  label: "Learn More About Framework Builder",
                  onClick: () => console.log("Open documentation")
                }}
              />
            </div>
          );
        }

        if (importMethod === "upload") {
          return (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <Upload className={`h-12 w-12 mx-auto ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
                <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                  Upload Your Documents
                </h2>
                <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                  Import existing compliance documents to jumpstart your setup
                </p>
              </div>

              <div className={`border-2 border-dashed rounded-lg p-8 text-center ${
                theme === 'light' ? 'border-slate-300 bg-slate-50' : 'border-slate-600 bg-slate-700/50'
              }`}>
                <Upload className={`h-8 w-8 mx-auto mb-4 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`} />
                <p className={`font-medium mb-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Drag and drop files here
                </p>
                <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  or click to browse
                </p>
                <Button variant="outline" className="mt-4">
                  Choose Files
                </Button>
              </div>

              <AuthFeedback
                type="warning"
                title="Document Processing"
                message="Uploaded documents will be analyzed and converted into actionable compliance requirements. This process may take a few minutes depending on document complexity."
              />
            </div>
          );
        }

        // Template selection
        const recommendedStandards = getRecommendedStandards();
        const otherStandards = standardTemplates.filter(t => !recommendedStandards.find(r => r.id === t.id));

        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <BookOpen className={`h-12 w-12 mx-auto ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
              <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                Choose Your Standard
              </h2>
              <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                Select the compliance framework you'd like to implement first
              </p>
            </div>

            {recommendedStandards.length > 0 && (
              <div className="space-y-3">
                <h3 className={`font-medium flex items-center gap-2 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                  <Target className="h-4 w-4" />
                  Recommended for You
                </h3>
                <div className="grid gap-3">
                  {recommendedStandards.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedStandard(template.id)}
                      className={`p-4 text-left rounded-lg border-2 transition-all ${
                        selectedStandard === template.id
                          ? theme === 'light'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-blue-400 bg-blue-900/30'
                          : theme === 'light'
                            ? 'border-slate-200 hover:border-slate-300'
                            : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                              {template.name}
                            </h4>
                            {template.popular && (
                              <Badge className="bg-orange-500 text-white text-xs">Popular</Badge>
                            )}
                          </div>
                          <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                            {template.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge className={getDifficultyColor(template.difficulty)}>
                              {template.difficulty}
                            </Badge>
                            <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                              {template.requirements} requirements
                            </span>
                            <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                              {template.estimatedTime}
                            </span>
                          </div>
                        </div>
                        {selectedStandard === template.id && (
                          <Check className="h-5 w-5 text-blue-500 mt-1" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {otherStandards.length > 0 && (
              <div className="space-y-3">
                <h3 className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                  Other Standards
                </h3>
                <div className="grid gap-3">
                  {otherStandards.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedStandard(template.id)}
                      className={`p-4 text-left rounded-lg border-2 transition-all ${
                        selectedStandard === template.id
                          ? theme === 'light'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-blue-400 bg-blue-900/30'
                          : theme === 'light'
                            ? 'border-slate-200 hover:border-slate-300'
                            : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                              {template.name}
                            </h4>
                          </div>
                          <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                            {template.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge className={getDifficultyColor(template.difficulty)}>
                              {template.difficulty}
                            </Badge>
                            <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                              {template.requirements} requirements
                            </span>
                            <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                              {template.estimatedTime}
                            </span>
                          </div>
                        </div>
                        {selectedStandard === template.id && (
                          <Check className="h-5 w-5 text-blue-500 mt-1" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        const selectedTemplate = standardTemplates.find(t => t.id === selectedStandard);
        
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Settings className={`h-12 w-12 mx-auto ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
              <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                Customize Your Framework
              </h2>
              <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                Tailor the standard to fit your organization's specific needs
              </p>
            </div>

            {selectedTemplate && (
              <Card className={theme === 'light' ? 'bg-blue-50 border-blue-200' : 'bg-blue-900/20 border-blue-700'}>
                <CardHeader>
                  <CardTitle className={`text-lg ${theme === 'light' ? 'text-blue-900' : 'text-blue-100'}`}>
                    {selectedTemplate.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={theme === 'light' ? 'text-blue-700' : 'text-blue-300'}>
                    {selectedTemplate.description}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <Badge className={getDifficultyColor(selectedTemplate.difficulty)}>
                      {selectedTemplate.difficulty}
                    </Badge>
                    <span className={`text-sm ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}>
                      {selectedTemplate.requirements} requirements
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Additional Requirements or Customizations (Optional)
                </label>
                <Textarea
                  placeholder="Describe any specific requirements, modifications, or additional controls you need..."
                  value={customRequirements}
                  onChange={(e) => setCustomRequirements(e.target.value)}
                  className={`min-h-[100px] ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-700 border-slate-600'}`}
                  rows={4}
                />
                <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  This information will help us customize the framework to better match your organization's specific compliance needs.
                </p>
              </div>

              <AuthFeedback
                type="info"
                title="Framework Customization"
                message="You can always modify requirements, add custom controls, and adjust the framework after import. This initial customization helps us provide a better starting point."
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Zap className={`h-12 w-12 mx-auto ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`} />
              <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                Ready to Import
              </h2>
              <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                Review your selections and import your compliance framework
              </p>
            </div>

            <div className="space-y-4">
              <Card className={theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-600'}>
                <CardHeader>
                  <CardTitle className="text-lg">Import Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>Method:</span>
                    <span className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                      {importMethod === "template" ? "Pre-built Template" : 
                       importMethod === "upload" ? "Document Upload" : "Manual Setup"}
                    </span>
                  </div>
                  
                  {selectedTemplate && (
                    <>
                      <div className="flex justify-between">
                        <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>Standard:</span>
                        <span className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                          {selectedTemplate.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>Requirements:</span>
                        <span className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                          {selectedTemplate.requirements}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>Estimated Time:</span>
                        <span className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                          {selectedTemplate.estimatedTime}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {customRequirements && (
                    <div>
                      <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>Custom Requirements:</span>
                      <p className={`text-sm mt-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                        {customRequirements}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <AuthFeedback
                type="success"
                title="What Happens Next"
                message="After import, you'll be able to assign requirements to team members, track progress, upload evidence, and generate compliance reports."
              />
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
                Guided Standard Import
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/app')}
                className={theme === 'light' ? 'border-slate-200' : 'border-slate-600'}
              >
                Skip for Now
              </Button>
              <div className="flex items-center gap-2">
                <ZoomToggle />
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-6">
            <AuthProgressIndicator steps={steps} />
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
              onClick={handleImport}
              disabled={isLoading || !canProceed()}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Importing...
                </>
              ) : (
                <>
                  Import Standard
                  <Import className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuidedStandardImport;