import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Sparkles, 
  Shield, 
  Users, 
  FileText, 
  BarChart3,
  Zap,
  CheckCircle,
  Lock,
  GitBranch,
  BookOpen,
  Target,
  Database,
  Layers,
  Workflow,
  Eye,
  Calendar,
  Code,
  Globe,
  Settings
} from 'lucide-react';

export default function Features() {
  const navigate = useNavigate();

  const featureCategories = [
    {
      title: "Compliance Management",
      description: "Complete framework support and assessment tools",
      icon: <Shield className="w-6 h-6" />,
      color: "blue",
      features: [
        {
          name: "Standards Library",
          description: "Support for ISO 27001, ISO 27002, NIS2 Directive, GDPR, CIS Controls, and custom frameworks",
          icon: <FileText className="w-5 h-5" />,
          status: "Available"
        },
        {
          name: "Assessment Engine", 
          description: "Multi-standard assessments with workflow stages and approval processes",
          icon: <Target className="w-5 h-5" />,
          status: "Available"
        },
        {
          name: "Gap Analysis",
          description: "Automated compliance gap identification and remediation tracking",
          icon: <BarChart3 className="w-5 h-5" />,
          status: "Available"
        },
        {
          name: "Real-time Monitoring",
          description: "Live compliance dashboards with scoring and trending analytics",
          icon: <Eye className="w-5 h-5" />,
          status: "Available"
        }
      ]
    },
    {
      title: "Document Management",
      description: "Enterprise-grade document control and workflows",
      icon: <FileText className="w-6 h-6" />,
      color: "purple",
      features: [
        {
          name: "Version Control",
          description: "Complete document versioning with approval workflows and audit trails",
          icon: <GitBranch className="w-5 h-5" />,
          status: "Available"
        },
        {
          name: "Template Library",
          description: "Policy, procedure, and evidence templates for rapid deployment",
          icon: <Layers className="w-5 h-5" />,
          status: "Available"
        },
        {
          name: "Automated Generation",
          description: "AI-powered compliance documentation including Statement of Applicability",
          icon: <Zap className="w-5 h-5" />,
          status: "Available"
        },
        {
          name: "Secure Storage",
          description: "Supabase-powered file storage with enterprise-grade security",
          icon: <Database className="w-5 h-5" />,
          status: "Available"
        }
      ]
    },
    {
      title: "Learning Management",
      description: "Comprehensive training and awareness programs",
      icon: <BookOpen className="w-6 h-6" />,
      color: "green",
      features: [
        {
          name: "Course Builder",
          description: "Interactive course creation with multiple content types and assessments",
          icon: <BookOpen className="w-5 h-5" />,
          status: "Available"
        },
        {
          name: "Learning Paths",
          description: "Structured learning progression with role-based curricula",
          icon: <Workflow className="w-5 h-5" />,
          status: "Available"
        },
        {
          name: "Phishing Simulation",
          description: "Security awareness training with realistic simulation campaigns",
          icon: <Shield className="w-5 h-5" />,
          status: "Available"
        },
        {
          name: "Progress Analytics",
          description: "Individual and organizational learning analytics with reporting",
          icon: <BarChart3 className="w-5 h-5" />,
          status: "Available"
        }
      ]
    },
    {
      title: "Enterprise Security",
      description: "Advanced authentication and access controls",
      icon: <Lock className="w-6 h-6" />,
      color: "red",
      features: [
        {
          name: "Multi-Factor Authentication",
          description: "TOTP, SMS, and email-based MFA with backup codes",
          icon: <Shield className="w-5 h-5" />,
          status: "Available"
        },
        {
          name: "Enterprise SSO",
          description: "Microsoft Entra ID integration with SAML/OIDC protocols",
          icon: <Users className="w-5 h-5" />,
          status: "Available"
        },
        {
          name: "Conditional Access",
          description: "Advanced security rules and device compliance policies",
          icon: <Settings className="w-5 h-5" />,
          status: "Available"
        },
        {
          name: "Row Level Security",
          description: "Database-level multi-tenant isolation with audit logging",
          icon: <Database className="w-5 h-5" />,
          status: "Available"
        }
      ]
    },
    {
      title: "Visual Diagramming",
      description: "Professional diagram creation and documentation",
      icon: <Code className="w-6 h-6" />,
      color: "orange",
      features: [
        {
          name: "Mermaid Integration",
          description: "Professional diagram creation with 14+ diagram types",
          icon: <Code className="w-5 h-5" />,
          status: "Available"
        },
        {
          name: "Visual Editor",
          description: "Drag-and-drop interface with glassmorphic design",
          icon: <Eye className="w-5 h-5" />,
          status: "Available"
        },
        {
          name: "AI Assistance",
          description: "Automated diagram generation and optimization",
          icon: <Sparkles className="w-5 h-5" />,
          status: "Available"
        },
        {
          name: "Export Capabilities",
          description: "Multiple format support (PDF, PNG, SVG, DOCX)",
          icon: <FileText className="w-5 h-5" />,
          status: "Available"
        }
      ]
    },
    {
      title: "Technical Architecture",
      description: "Modern, scalable platform foundation",
      icon: <Globe className="w-6 h-6" />,
      color: "indigo",
      features: [
        {
          name: "React 18 + TypeScript",
          description: "Type-safe modern frontend with Vite and Tailwind CSS",
          icon: <Code className="w-5 h-5" />,
          status: "Available"
        },
        {
          name: "Real-time Collaboration",
          description: "Multi-user editing with conflict resolution and live updates",
          icon: <Users className="w-5 h-5" />,
          status: "Available"
        },
        {
          name: "Performance Optimized",
          description: "Code splitting and lazy loading (46% bundle size reduction)",
          icon: <Zap className="w-5 h-5" />,
          status: "Available"
        },
        {
          name: "Enterprise Deployment",
          description: "Supabase backend with PostgreSQL and comprehensive APIs",
          icon: <Database className="w-5 h-5" />,
          status: "Available"
        }
      ]
    }
  ];

  const stats = [
    { label: "Compliance Frameworks", value: "15+", icon: <Shield className="w-5 h-5" /> },
    { label: "Security Controls", value: "200+", icon: <Lock className="w-5 h-5" /> },
    { label: "Document Templates", value: "50+", icon: <FileText className="w-5 h-5" /> },
    { label: "Enterprise Integrations", value: "25+", icon: <Globe className="w-5 h-5" /> }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "from-blue-500 to-blue-600 border-blue-200 dark:border-blue-800",
      purple: "from-purple-500 to-purple-600 border-purple-200 dark:border-purple-800", 
      green: "from-green-500 to-green-600 border-green-200 dark:border-green-800",
      red: "from-red-500 to-red-600 border-red-200 dark:border-red-800",
      orange: "from-orange-500 to-orange-600 border-orange-200 dark:border-orange-800",
      indigo: "from-indigo-500 to-indigo-600 border-indigo-200 dark:border-indigo-800"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-white/80 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Platform Features</h1>
                  <p className="text-sm text-white/80">Comprehensive compliance management with enterprise-grade security</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-12">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center border-2">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-3">
                      <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
                        {stat.icon}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Feature Categories */}
            <div className="space-y-8">
              {featureCategories.map((category, index) => (
                <Card key={index} className={`border-2 ${getColorClasses(category.color)}`}>
                  <CardHeader className={`bg-gradient-to-r ${getColorClasses(category.color)} text-white rounded-t-lg`}>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        {category.icon}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">{category.title}</h2>
                        <p className="text-sm text-white/80 font-normal">{category.description}</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {category.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                          <div className={`p-2 bg-gradient-to-r ${getColorClasses(category.color)} text-white rounded-lg flex-shrink-0`}>
                            {feature.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {feature.name}
                              </h3>
                              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex-shrink-0 ml-2">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {feature.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Technical Specifications */}
            <Card className="border-2 border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-t-lg">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-600 text-white rounded-lg">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">Technical Specifications</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">Enterprise-grade architecture and performance</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Frontend</h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        React 18 + TypeScript
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Vite + Tailwind CSS
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Shadcn/ui Components
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Framer Motion
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Backend</h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Supabase PostgreSQL
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Row Level Security
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Real-time Subscriptions
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Auto-scaling Infrastructure
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Security</h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        End-to-end Encryption
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        SOC 2 Compliance
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        GDPR Compliant
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        24/7 Monitoring
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Compliance?</h2>
                <p className="text-lg text-white/80 mb-6 max-w-2xl mx-auto">
                  Experience the power of modern compliance management with enterprise-grade security and intuitive design.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-gray-100"
                    onClick={() => navigate('/onboarding')}
                  >
                    Start Free Trial
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white text-white hover:bg-white/10"
                    onClick={() => navigate('/pricing')}
                  >
                    View Pricing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}