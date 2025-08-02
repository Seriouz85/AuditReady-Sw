import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Sparkles, 
  Rocket, 
  Target, 
  TrendingUp,
  CheckCircle,
  Clock,
  Zap,
  Shield,
  Brain,
  Globe,
  Users,
  BarChart3,
  Code,
  Database,
  Calendar,
  Star,
  Award,
  Layers,
  Settings,
  Eye,
  Lock,
  GitBranch,
  Workflow,
  LineChart,
  PieChart,
  Map,
  Filter,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Roadmap() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedQuarter, setSelectedQuarter] = useState('all');
  const [hoveredMilestone, setHoveredMilestone] = useState<number | null>(null);
  const [carouselPosition, setCarouselPosition] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate current position based on actual date
  const getCurrentTimePosition = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    
    // Q1 2025 started in January 2025
    const q1Start = new Date(2025, 0, 1); // January 1, 2025
    const q4End = new Date(2024, 11, 31); // December 31, 2024
    
    // Timeline positions (x-coordinates for each quarter) - Exponential spacing
    const timelinePositions = {
      'Q1 2025': 120,     // Position 0 (start of graph)
      'Q2 2025': 240,     // Position 1  
      'Q3 2025': 420,     // Position 2 (current)
      'Q4 2025': 680,     // Position 3
      'Q1 2026': 980,     // Position 4
      'Q2 2026': 1280     // Position 5 (end of graph)
    };
    
    let position = 50; // Default to start
    let label = '';
    
    if (currentYear === 2025) {
      if (currentMonth <= 3) {
        // Q1 2025 (Jan-Mar)
        const progress = (currentMonth - 1) / 3; // 0 to 1
        position = timelinePositions['Q1 2025'] + (timelinePositions['Q2 2025'] - timelinePositions['Q1 2025']) * progress;
        label = `Q1 ${currentYear}`;
      } else if (currentMonth <= 4) {
        // Q2 2025 (Mar-Apr) - Adjusted timeline per user feedback
        const progress = (currentMonth - 3) / 2;
        position = timelinePositions['Q2 2025'] + (timelinePositions['Q3 2025'] - timelinePositions['Q2 2025']) * progress;
        label = `Q2 ${currentYear}`;
      } else if (currentMonth <= 8) {
        // Q3 2025 (May-Aug) - Adjusted timeline per user feedback (June 23 = Q3)
        const progress = (currentMonth - 5) / 4; // June = month 6, so (6-5)/4 = 0.25 (25% through Q3)
        position = timelinePositions['Q3 2025'] + (timelinePositions['Q4 2025'] - timelinePositions['Q3 2025']) * progress;
        label = `Q3 ${currentYear}`;
      } else {
        // Q4 2025 (Oct-Dec)
        const progress = (currentMonth - 10) / 3;
        position = timelinePositions['Q4 2025'] + (timelinePositions['Q1 2026'] - timelinePositions['Q4 2025']) * progress;
        label = `Q4 ${currentYear}`;
      }
    } else if (currentYear === 2026) {
      if (currentMonth <= 3) {
        // Q1 2026 (Jan-Mar)
        const progress = (currentMonth - 1) / 3;
        position = timelinePositions['Q1 2026'] + (timelinePositions['Q2 2026'] - timelinePositions['Q1 2026']) * progress;
        label = `Q1 ${currentYear}`;
      } else {
        // Q2 2026 and beyond (timeline ends at Q2 2026)
        position = timelinePositions['Q2 2026'];
        label = `Q2+ ${currentYear}`;
      }
    } else if (currentYear > 2026) {
      position = timelinePositions['Q2 2026'];
      label = `Q2+ ${currentYear}`;
    } else if (currentYear < 2025) {
      // Before our timeline starts
      position = timelinePositions['Q1 2025'];
      label = `Q1 2025`;
    }
    
    return { position, label };
  };

  const currentTime = getCurrentTimePosition();

  const roadmapStats = [
    { label: "Phases Completed", value: "17/17", icon: <CheckCircle className="w-5 h-5" />, color: "green" },
    { label: "Features Delivered", value: "280+", icon: <Rocket className="w-5 h-5" />, color: "blue" },
    { label: "Performance Gain", value: "90%", icon: <TrendingUp className="w-5 h-5" />, color: "purple" },
    { label: "Production Ready", value: "100%", icon: <Shield className="w-5 h-5" />, color: "orange" }
  ];

  const currentStatus = [
    {
      title: "Modern State Management & Architecture",
      status: "completed",
      progress: 100,
      quarter: "Q1 2025",
      category: "platform",
      achievements: [
        "Zustand stores for centralized state management",
        "Migration from Context API with backwards compatibility",
        "Performance optimized with reduced re-renders",
        "Type-safe state management across application"
      ],
      impact: "40% improvement in component render performance and developer experience"
    },
    {
      title: "Unified API Architecture & Error Handling",
      status: "completed",
      progress: 100,
      quarter: "Q1 2025",
      category: "platform",
      achievements: [
        "Axios-based HTTP client with comprehensive retry logic",
        "Automatic token management and request interceptors",
        "Structured endpoint organization for all services",
        "Batch operations and file upload progress tracking"
      ],
      impact: "Robust API layer with 99.9% request reliability and standardized error handling"
    },
    {
      title: "Performance Optimization & Code Splitting",
      status: "completed",
      progress: 100,
      quarter: "Q1 2025",
      category: "platform",
      achievements: [
        "Lazy loading for all non-critical routes and components",
        "React.memo optimization for expensive components",
        "Bundle size reduction through strategic code splitting",
        "Enhanced loading states with contextual messages"
      ],
      impact: "50% faster initial load times and improved user experience"
    },
    {
      title: "Enterprise Security Framework",
      status: "completed",
      progress: 100,
      quarter: "Q1 2025",
      category: "security",
      achievements: [
        "Content Security Policy with environment-specific directives",
        "Comprehensive input validation with Zod schemas",
        "HTML sanitization and XSS protection with DOMPurify",
        "Rate limiting and CSRF protection utilities"
      ],
      impact: "Enterprise-grade security meeting SOC 2 and compliance requirements"
    },
    {
      title: "Comprehensive Testing Infrastructure",
      status: "completed",
      progress: 100,
      quarter: "Q1 2025",
      category: "platform",
      achievements: [
        "Custom test utilities with provider wrappers",
        "Mock factories for consistent API testing",
        "Component, store, and API test examples",
        "Comprehensive test data fixtures"
      ],
      impact: "Solid foundation for maintaining code quality and preventing regressions"
    },
    {
      title: "Production Monitoring & Observability",
      status: "completed",
      progress: 100,
      quarter: "Q1 2025",
      category: "platform",
      achievements: [
        "Custom analytics system with user behavior tracking",
        "Enhanced Sentry integration with context-aware error reporting",
        "Performance monitoring with automatic metrics collection",
        "Production-ready observability for enterprise deployment"
      ],
      impact: "Complete visibility into application performance and user experience"
    },
    {
      title: "AI-Powered Platform Intelligence",
      status: "completed",
      progress: 100,
      quarter: "Q1 2025",
      category: "ai",
      achievements: [
        "AuditReady Guidance: AI-powered compliance descriptions and recommendations",
        "LMS AI Generator: Intelligent security training content creation",
        "Visual Flow AI Editor: Real-time flowchart generation with near-zero latency",
        "Smart compliance mapping with context-aware suggestions"
      ],
      impact: "Transforms manual compliance work into intelligent, automated processes"
    },
    {
      title: "Database Optimization & Caching Layer",
      status: "completed",
      progress: 100,
      quarter: "Q1 2025",
      category: "platform",
      achievements: [
        "Redis caching implementation with 90% cache hit rate",
        "Database query optimization with comprehensive indexing",
        "Materialized views for dashboard analytics",
        "Connection pooling and performance monitoring"
      ],
      impact: "75% improvement in database query performance and scalability"
    },
    {
      title: "Enhanced Developer Experience & CI/CD",
      status: "completed",
      progress: 100,
      quarter: "Q1 2025",
      category: "platform",
      achievements: [
        "GitHub Actions CI/CD pipeline with automated testing",
        "Security scanning with CodeQL and dependency checks",
        "Automated deployment with environment promotion",
        "Pre-commit hooks and code quality enforcement"
      ],
      impact: "Streamlined development workflow with 50% faster deployments"
    },
    {
      title: "Production Infrastructure & Deployment",
      status: "completed",
      progress: 100,
      quarter: "Q1 2025",
      category: "platform",
      achievements: [
        "Infrastructure as Code with Terraform",
        "Multi-environment deployment (staging, production)",
        "Automated backup and disaster recovery systems",
        "Load balancing and health monitoring"
      ],
      impact: "Enterprise-grade infrastructure ready for 10,000+ users"
    },
    {
      title: "Advanced Security & Threat Detection",
      status: "completed",
      progress: 100,
      quarter: "Q1 2025",
      category: "security",
      achievements: [
        "Advanced threat detection with behavioral analysis",
        "Real-time security monitoring and alerting",
        "IP blocking and rate limiting protection",
        "Comprehensive security event logging"
      ],
      impact: "Enterprise-grade security with 99.9% threat detection accuracy"
    },
    {
      title: "Customer Support Infrastructure",
      status: "completed",
      progress: 100,
      quarter: "Q1 2025",
      category: "platform",
      achievements: [
        "Comprehensive ticketing system with SLA management",
        "Auto-assignment based on agent skills and availability",
        "Escalation rules and satisfaction tracking",
        "Multi-channel support (email, chat, web)"
      ],
      impact: "Professional customer support with automated workflows"
    },
    {
      title: "Legal Compliance Framework",
      status: "completed",
      progress: 100,
      quarter: "Q1 2025",
      category: "compliance",
      achievements: [
        "SOC 2, ISO 27001, GDPR, CCPA compliance assessments",
        "Automated compliance monitoring and scoring",
        "Risk assessment and remediation planning",
        "Comprehensive audit reporting and evidence management"
      ],
      impact: "Complete regulatory compliance with automated assessments"
    },
    {
      title: "Enterprise Integration Hub",
      status: "completed",
      progress: 100,
      quarter: "Q1 2025",
      category: "enterprise",
      achievements: [
        "Comprehensive integration marketplace with 50+ connectors",
        "Real-time data synchronization with external systems",
        "Visual integration management dashboard",
        "API webhooks and event-driven architecture"
      ],
      impact: "Seamless enterprise workflow integration reducing manual data entry by 80%"
    },
    {
      title: "Data Management & Governance Hub",
      status: "completed", 
      progress: 100,
      quarter: "Q1 2025",
      category: "security",
      achievements: [
        "Comprehensive backup & restore with time-travel capabilities",
        "Multi-factor authentication for sensitive operations",
        "Complete audit trail with user session tracking",
        "Industry benchmarking and analytics engine",
        "GDPR/CCPA compliance automation tools",
        "Automated data classification and retention policies"
      ],
      impact: "Enterprise-grade data governance with 99.9% restore reliability and regulatory compliance"
    },
    {
      title: "Advanced Security & MFA System",
      status: "completed",
      progress: 100, 
      quarter: "Q1 2025",
      category: "security",
      achievements: [
        "TOTP-based multi-factor authentication with backup codes",
        "Risk-based authentication for sensitive operations",
        "Comprehensive sensitive operations logging",
        "MFA device management with enterprise policies",
        "Time-based verification sessions with auto-expiry",
        "Integration with existing RBAC and organization structure"
      ],
      impact: "Enhanced security posture meeting enterprise MFA requirements and compliance standards"
    },
    {
      title: "Azure Purview Data Classification System",
      status: "completed",
      progress: 100,
      quarter: "Q1 2025", 
      category: "security",
      achievements: [
        "Azure Purview integration for enterprise data governance",
        "Automatic PII detection with confidence scoring",
        "Custom classification labels with confidentiality levels",
        "Retention policies with GDPR/CCPA compliance automation",
        "Document Library enhanced with classification badges",
        "Settings UI for data classification management",
        "Compliance reporting with sensitive data tracking"
      ],
      impact: "Complete data governance solution with Microsoft Information Protection integration and automated compliance"
    }
  ];

  const futureRoadmap = [
    {
      title: "Advanced API Gateway & Microservices",
      status: "completed",
      progress: 100,
      quarter: "Q1 2025",
      category: "platform",
      features: [
        "GraphQL API gateway with Apollo Server",
        "Real-time WebSocket subscriptions and events",
        "Comprehensive API schema with type safety",
        "Performance monitoring and error handling"
      ],
      impact: "Scalable API architecture supporting enterprise workloads",
      effort: "High",
      businessValue: "High"
    },
    {
      title: "Advanced Analytics & Machine Learning",
      status: "completed", 
      progress: 100,
      quarter: "Q1 2025",
      category: "analytics",
      features: [
        "Predictive compliance risk modeling with ML algorithms",
        "AI-powered document analysis with NLP",
        "Real-time anomaly detection and alerting system",
        "Interactive business intelligence dashboards"
      ],
      impact: "AI-powered insights reducing compliance risks by 60%",
      effort: "High",
      businessValue: "Transformational"
    },
    {
      title: "Next-Generation AI Intelligence",
      status: "upcoming",
      progress: 15,
      quarter: "Q3 2025",
      category: "ai",
      features: [
        "Advanced Compliance AI: Word, Excel, PDF requirement interpretation",
        "AI Insights Engine: Risk management and application analytics",
        "Enhanced Visual Flow AI: Complex diagram generation with advanced layouts", 
        "Intelligent Compliance Copilot: Real-time guidance and recommendations"
      ],
      impact: "Revolutionary AI-first compliance management experience",
      effort: "High",
      businessValue: "Transformational"
    },
    {
      title: "Advanced Enterprise Integrations",
      status: "planned", 
      progress: 0,
      quarter: "Q3 2025",
      category: "enterprise",
      features: [
        "Advanced ServiceNow ITSM/GRC integration",
        "Enhanced Jira/Confluence workspace synchronization", 
        "Deep Microsoft 365 ecosystem integration",
        "Advanced Slack/Teams collaboration workflows"
      ],
      impact: "Advanced enterprise workflow automation and data synchronization",
      effort: "Medium",
      businessValue: "High"
    },
    {
      title: "Advanced Analytics & BI",
      status: "planned",
      progress: 0, 
      quarter: "Q1 2026",
      category: "analytics",
      features: [
        "Executive dashboards with KPI tracking",
        "Predictive compliance scoring algorithms",
        "Risk heat maps and trend analysis",
        "Automated compliance reporting (PDF/Excel)"
      ],
      impact: "Data-driven decision making for compliance teams",
      effort: "Medium",
      businessValue: "High"
    },
    {
      title: "Complete Data Governance Platform",
      status: "planned",
      progress: 0,
      quarter: "Q2 2025",
      category: "security",
      features: [
        "Advanced privacy & compliance automation (GDPR/CCPA)",
        "Data export center with compliance reporting",
        "Real-time data quality monitoring and anomaly detection",
        "Cross-border data controls and data residency management",
        "Advanced analytics with industry benchmarking"
      ],
      impact: "Complete enterprise data governance solution positioning as gold standard",
      effort: "High",
      businessValue: "Strategic"
    },
    {
      title: "Next-Generation Security",
      status: "planned",
      progress: 0,
      quarter: "Q2 2026", 
      category: "security",
      features: [
        "Complete Zero Trust implementation",
        "Blockchain-based immutable audit trails", 
        "Quantum-safe cryptography preparation",
        "Advanced threat detection with ML"
      ],
      impact: "Future-proof security architecture",
      effort: "High", 
      businessValue: "Strategic"
    },
    {
      title: "Global Platform & Developer Hub",
      status: "planned",
      progress: 0,
      quarter: "Q2 2026",
      category: "global",
      features: [
        "Multi-region data residency (EU, US, APAC)",
        "Public REST API with GraphQL support",
        "SDK for popular programming languages", 
        "12+ language localization",
        "Custom app marketplace for partners"
      ],
      impact: "Global enterprise market expansion with developer ecosystem",
      effort: "Very High",
      businessValue: "Strategic"
    }
  ];

  const milestones = [
    { 
      date: "Q1 2025", 
      title: "Enterprise Platform Foundation", 
      status: "completed", 
      color: "green",
      description: "Complete platform modernization with Azure Purview data classification, MFA security, PII detection, and retention policies",
      achievements: ["Production Ready", "100% Complete", "Enterprise Grade", "AI-Powered", "MFA Secured", "Azure Purview Integrated", "PII Detection", "Auto-Classification", "GDPR/CCPA Compliant"]
    },
    { 
      date: "Q2 2025", 
      title: "Advanced Architecture & Analytics", 
      status: "upcoming", 
      color: "blue",
      description: "Microservices architecture, Machine learning analytics, Advanced API gateway",
      achievements: ["Scalable Architecture", "ML Insights", "100K+ Users Ready"]
    },
    { 
      date: "Q3 2025", 
      title: "AI Intelligence", 
      status: "upcoming", 
      color: "blue",
      description: "Advanced Compliance AI, Visual Flow Editor, AI Insights Engine, Compliance Copilot",
      achievements: ["Real-time AI Processing", "Document Interpretation", "Smart Risk Analytics"]
    },
    { 
      date: "Q4 2025", 
      title: "Enterprise Hub", 
      status: "planned", 
      color: "purple",
      description: "ServiceNow integration, Microsoft 365 ecosystem, Slack/Teams workflows",
      achievements: ["Seamless Integrations", "Workflow Automation", "Enterprise Ecosystem"]
    },
    { 
      date: "Q1 2026", 
      title: "Advanced Analytics", 
      status: "planned", 
      color: "purple",
      description: "Executive dashboards, Predictive scoring, Risk heat maps, Automated reporting",
      achievements: ["Data-Driven Insights", "Predictive Analytics", "Executive Intelligence"]
    },
    { 
      date: "Q2 2026", 
      title: "Next-Gen Security & Global", 
      status: "planned", 
      color: "purple",
      description: "Advanced threat detection, Multi-region deployment, Global compliance frameworks",
      achievements: ["Quantum Security", "Global Reach", "Advanced Protection"]
    }
  ];

  const categories = [
    { id: 'all', label: 'All Categories', icon: <Layers className="w-4 h-4" /> },
    { id: 'ai', label: 'AI/ML', icon: <Brain className="w-4 h-4" /> },
    { id: 'enterprise', label: 'Enterprise', icon: <Users className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'platform', label: 'Platform', icon: <Code className="w-4 h-4" /> },
    { id: 'compliance', label: 'Compliance', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'global', label: 'Global', icon: <Globe className="w-4 h-4" /> }
  ];

  const quarters = [
    { id: 'all', label: 'All Quarters' },
    { id: 'Q1 2025', label: 'Q1 2025' },
    { id: 'Q2 2025', label: 'Q2 2025' },
    { id: 'Q3 2025', label: 'Q3 2025' },
    { id: 'Q4 2025', label: 'Q4 2025' },
    { id: 'Q1 2026', label: 'Q1 2026' },
    { id: 'Q2 2026', label: 'Q2 2026' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in-progress': return 'blue';
      case 'upcoming': return 'purple';
      case 'planned': return 'orange';
      default: return 'gray';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      'in-progress': "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", 
      upcoming: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      planned: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatColor = (color: string) => {
    const colors = {
      green: "from-green-500 to-green-600",
      blue: "from-blue-500 to-blue-600", 
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const filteredFutureItems = futureRoadmap.filter(item => {
    const categoryMatch = selectedFilter === 'all' || item.category === selectedFilter;
    const quarterMatch = selectedQuarter === 'all' || item.quarter === selectedQuarter;
    return categoryMatch && quarterMatch;
  });

  const filteredCurrentItems = currentStatus.filter(item => {
    const categoryMatch = selectedFilter === 'all' || item.category === selectedFilter;
    const quarterMatch = selectedQuarter === 'all' || item.quarter === selectedQuarter;
    return categoryMatch && quarterMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Product Roadmap</h1>
                  <p className="text-sm text-white/80">Our journey to revolutionize compliance management with cutting-edge technology</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 rounded-2xl">
              <TabsTrigger value="overview" className="flex items-center space-x-2 rounded-xl">
                <Eye className="w-4 h-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="current" className="flex items-center space-x-2 rounded-xl">
                <CheckCircle className="w-4 h-4" />
                <span>Current Status</span>
              </TabsTrigger>
              <TabsTrigger value="future" className="flex items-center space-x-2 rounded-xl">
                <Rocket className="w-4 h-4" />
                <span>Future Roadmap</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center space-x-2 rounded-xl">
                <Calendar className="w-4 h-4" />
                <span>Timeline</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {roadmapStats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="text-center border-2 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow rounded-2xl">
                      <CardContent className="p-6">
                        <div className="flex justify-center mb-3">
                          <div className={`p-3 bg-gradient-to-r ${getStatColor(stat.color)} text-white rounded-xl shadow-lg`}>
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
                  </motion.div>
                ))}
              </div>

              {/* Vision Statement */}
              <Card className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-2xl">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Our Vision</h2>
                      <p className="text-sm text-white/80 font-normal">Transforming compliance through innovation</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                        <Brain className="w-12 h-12 text-blue-600 mx-auto" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">AI-First Platform</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Leverage artificial intelligence to automate compliance processes and provide intelligent insights.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg mb-4">
                        <Globe className="w-12 h-12 text-purple-600 mx-auto" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Global Enterprise</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Scale globally with multi-region support, localization, and enterprise-grade integrations.
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mb-4">
                        <Shield className="w-12 h-12 text-green-600 mx-auto" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Zero Trust Security</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Implement next-generation security with blockchain audit trails and quantum-safe encryption.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Achievements */}
              <Card className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-2xl">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Recent Achievements</h2>
                      <p className="text-sm text-white/80 font-normal">Major milestones delivered in January 2025</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { icon: <Code className="w-5 h-5" />, title: "Modern Architecture", desc: "Zustand state management with 40% performance gain" },
                      { icon: <Zap className="w-5 h-5" />, title: "Performance Optimization", desc: "Code splitting with 50% faster load times" },
                      { icon: <Shield className="w-5 h-5" />, title: "Security Framework", desc: "Enterprise-grade validation, CSP, and monitoring" },
                      { icon: <Database className="w-5 h-5" />, title: "API Architecture", desc: "Unified client with retry logic and error handling" }
                    ].map((achievement, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="p-2 bg-green-600 text-white rounded-lg">
                          {achievement.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{achievement.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Current Status Tab */}
            <TabsContent value="current" className="space-y-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">Filter by:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedFilter === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter(category.id)}
                      className="flex items-center space-x-1"
                    >
                      {category.icon}
                      <span>{category.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Current Status Items */}
              <div className="space-y-6">
                <AnimatePresence>
                  {filteredCurrentItems.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-2 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow rounded-2xl">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="flex items-center space-x-3">
                                <span className="text-lg font-semibold">{item.title}</span>
                                <Badge className={getStatusBadge(item.status)}>
                                  {item.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                                  {item.status === 'in-progress' && <Clock className="w-3 h-3 mr-1" />}
                                  {item.status.replace('-', ' ')}
                                </Badge>
                              </CardTitle>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.quarter}</p>
                            </div>
                            <div className="text-right">
                              <div className="relative">
                                <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                  {item.progress}%
                                </div>
                                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                  Complete
                                </div>
                              </div>
                              <Progress value={item.progress} className="w-24 mt-2" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Key Achievements</h4>
                              <ul className="space-y-1">
                                {item.achievements.map((achievement, i) => (
                                  <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                                    {achievement}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Business Impact</h4>
                              <p className="text-sm text-blue-800 dark:text-blue-200">{item.impact}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>

            {/* Future Roadmap Tab */}
            <TabsContent value="future" className="space-y-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">Filter by:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedFilter === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter(category.id)}
                      className="flex items-center space-x-1"
                    >
                      {category.icon}
                      <span>{category.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quarter Filter */}
              <div className="flex flex-wrap gap-2">
                {quarters.map((quarter) => (
                  <Button
                    key={quarter.id}
                    variant={selectedQuarter === quarter.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedQuarter(quarter.id)}
                  >
                    {quarter.label}
                  </Button>
                ))}
              </div>

              {/* Future Roadmap Items */}
              <div className="space-y-6">
                <AnimatePresence>
                  {filteredFutureItems.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-2 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow rounded-2xl">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="flex items-center space-x-3">
                                <span className="text-lg font-semibold">{item.title}</span>
                                <Badge className={getStatusBadge(item.status)}>
                                  {item.status === 'planned' && <Clock className="w-3 h-3 mr-1" />}
                                  {item.status}
                                </Badge>
                              </CardTitle>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.quarter}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Badge variant="outline">{item.effort} Effort</Badge>
                              <Badge variant="secondary">{item.businessValue} Value</Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Planned Features</h4>
                              <ul className="space-y-1">
                                {item.features.map((feature, i) => (
                                  <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <ChevronRight className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                                    {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">Expected Impact</h4>
                              <p className="text-sm text-purple-800 dark:text-purple-200">{item.impact}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-8">
              {/* Hero Timeline Section */}
              <Card className="border-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    {/* Clean Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
                    
                    <div className="relative z-10 p-12">
                      <div className="text-center mb-6">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8 }}
                        >
                          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                            Innovation Timeline
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
                            Witness the evolution of compliance technology through our revolutionary development journey
                          </p>
                        </motion.div>
                      </div>

                      {/* Visual Timeline */}
                      <div className="relative">
                        {/* Main Timeline Graph */}
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8">
                          <svg 
                            viewBox="0 0 1400 600" 
                            className="w-full h-auto"
                            preserveAspectRatio="xMidYMid meet"
                          >
                            {/* Gradient Definitions */}
                            <defs>
                              <linearGradient id="exponentialGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="25%" stopColor="#8b5cf6" />
                                <stop offset="50%" stopColor="#ec4899" />
                                <stop offset="75%" stopColor="#f59e0b" />
                                <stop offset="100%" stopColor="#10b981" />
                              </linearGradient>
                              <filter id="glow">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                <feMerge> 
                                  <feMergeNode in="coloredBlur"/>
                                  <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                              </filter>
                              <filter id="shadow">
                                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                              </filter>
                            </defs>
                            
                            {/* Grid Lines for better readability */}
                            <defs>
                              <pattern id="grid" width="100" height="50" patternUnits="userSpaceOnUse">
                                <path d="M 100 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.3"/>
                              </pattern>
                            </defs>
                            <rect width="1400" height="600" fill="url(#grid)" />

                            {/* X-Axis */}
                            <line x1="120" y1="480" x2="1280" y2="480" stroke="#374151" strokeWidth="3" />
                            
                            {/* Y-Axis */}
                            <line x1="120" y1="480" x2="120" y2="80" stroke="#374151" strokeWidth="3" />
                            
                            {/* Y-Axis Labels */}
                            <text x="110" y="465" textAnchor="end" className="fill-gray-800 dark:fill-gray-200 text-sm font-semibold">Foundation</text>
                            <text x="110" y="365" textAnchor="end" className="fill-gray-800 dark:fill-gray-200 text-sm font-semibold">Advanced</text>
                            <text x="110" y="265" textAnchor="end" className="fill-gray-800 dark:fill-gray-200 text-sm font-semibold">Innovative</text>
                            <text x="110" y="165" textAnchor="end" className="fill-gray-800 dark:fill-gray-200 text-sm font-semibold">Revolutionary</text>
                            
                            {/* Y-Axis Title */}
                            <text x="20" y="50" textAnchor="start" className="fill-gray-900 dark:fill-gray-100 text-base font-bold">Innovation Impact</text>
                            
                            {/* X-Axis Title */}
                            <text x="700" y="560" textAnchor="middle" className="fill-gray-900 dark:fill-gray-100 text-base font-bold">Development Timeline</text>

                            {/* True Exponential Growth Curve */}
                            <motion.path
                              d="M 120 450 C 240 430, 360 390, 480 320 C 600 240, 720 160, 840 100 C 960 60, 1080 30, 1200 20 C 1240 15, 1280 12, 1280 10"
                              stroke="url(#exponentialGradient)"
                              strokeWidth="6"
                              fill="none"
                              filter="url(#glow)"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 4, ease: "easeInOut" }}
                            />

                            {/* Current Time Marker */}
                            <motion.g
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 2, duration: 1 }}
                            >
                              <line 
                                x1={currentTime.position + 25} 
                                y1="80" 
                                x2={currentTime.position + 25} 
                                y2="480" 
                                stroke="#ef4444" 
                                strokeWidth="3" 
                                strokeDasharray="8,4"
                                opacity="0.8"
                              />
                              <rect 
                                x={currentTime.position - 25} 
                                y="45" 
                                width="100" 
                                height="28" 
                                fill="#ef4444" 
                                rx="14"
                                filter="url(#shadow)"
                              />
                              <text 
                                x={currentTime.position + 25} 
                                y="63" 
                                textAnchor="middle" 
                                className="fill-white text-sm font-bold"
                              >
                                NOW ({currentTime.label})
                              </text>
                              
                              {/* Pulsing effect */}
                              <motion.circle
                                cx={currentTime.position + 25}
                                cy={480}
                                r="6"
                                fill="#ef4444"
                                animate={{ r: [6, 10, 6], opacity: [1, 0.3, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            </motion.g>
                            
                            {/* Timeline Milestones */}
                            {milestones.map((milestone, index) => {
                              // Position calculation
                              const positions = [120, 360, 600, 840, 1080, 1280];
                              const x = positions[index] || 1280;
                              
                              // Exponential Y positioning
                              const yPositions = [450, 390, 320, 160, 100, 20];
                              const y = yPositions[index] || 20;
                              
                              return (
                                <motion.g
                                  key={milestone.date}
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.5 + index * 0.3, duration: 0.8 }}
                                >
                                  {/* Connecting line from dot to card */}
                                  {hoveredMilestone === index && (
                                    <motion.line
                                      x1={x}
                                      y1={y}
                                      x2={x}
                                      y2={550}
                                      stroke="#3b82f6"
                                      strokeWidth="2"
                                      strokeDasharray="4,4"
                                      initial={{ pathLength: 0 }}
                                      animate={{ pathLength: 1 }}
                                      transition={{ duration: 0.3 }}
                                    />
                                  )}
                                  
                                  {/* Milestone Circle */}
                                  <g
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredMilestone(index)}
                                    onMouseLeave={() => setHoveredMilestone(null)}
                                  >
                                    <circle
                                      cx={x}
                                      cy={y}
                                      r="15"
                                      fill={milestone.status === 'completed' ? '#10b981' : 
                                            milestone.status === 'in-progress' ? '#06b6d4' :
                                            milestone.status === 'upcoming' ? '#3b82f6' : '#8b5cf6'}
                                      stroke="white"
                                      strokeWidth="4"
                                      filter="url(#shadow)"
                                      className="transition-all duration-300"
                                      style={{
                                        transform: hoveredMilestone === index ? 'scale(1.2)' : 'scale(1)',
                                        transformOrigin: `${x}px ${y}px`
                                      }}
                                    />
                                    
                                    {/* Icon inside circle */}
                                    {milestone.status === 'completed' && (
                                      <text x={x} y={y + 5} textAnchor="middle" className="fill-white text-lg font-bold pointer-events-none">✓</text>
                                    )}
                                    {milestone.status === 'in-progress' && (
                                      <text x={x} y={y + 5} textAnchor="middle" className="fill-white text-lg font-bold pointer-events-none">•••</text>
                                    )}
                                    {milestone.status === 'upcoming' && (
                                      <text x={x} y={y + 5} textAnchor="middle" className="fill-white text-lg font-bold pointer-events-none">→</text>
                                    )}
                                    {milestone.status === 'planned' && (
                                      <text x={x} y={y + 5} textAnchor="middle" className="fill-white text-base font-bold pointer-events-none">◯</text>
                                    )}
                                  </g>
                                  
                                  {/* Pulsing for in-progress */}
                                  {milestone.status === 'in-progress' && (
                                    <motion.circle
                                      cx={x}
                                      cy={y}
                                      r="15"
                                      fill="none"
                                      stroke="#06b6d4"
                                      strokeWidth="3"
                                      opacity="0.6"
                                      animate={{ r: [15, 25, 15], opacity: [0.6, 0.1, 0.6] }}
                                      transition={{ duration: 2.5, repeat: Infinity }}
                                      pointerEvents="none"
                                    />
                                  )}
                                  
                                  {/* X-Axis Date Label */}
                                  <text 
                                    x={x} 
                                    y="510" 
                                    textAnchor="middle" 
                                    className="fill-gray-700 dark:fill-gray-300 text-sm font-semibold"
                                  >
                                    {milestone.date}
                                  </text>
                                </motion.g>
                              );
                            })}
                          </svg>
                          
                          {/* Milestone Details Section - Compact Grid */}
                          <div className="mt-4">
                            <div className="grid grid-cols-3 gap-2">
                              {milestones.map((milestone, index) => (
                                <motion.div
                                  key={milestone.date}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ 
                                    opacity: 1, 
                                    y: 0,
                                    scale: hoveredMilestone === index ? 1.02 : 1
                                  }}
                                  transition={{ 
                                    delay: 2 + index * 0.1, 
                                    duration: 0.6,
                                    scale: { duration: 0.3 }
                                  }}
                                  onMouseEnter={() => setHoveredMilestone(index)}
                                  onMouseLeave={() => setHoveredMilestone(null)}
                                  onClick={() => setActiveTab('future')}
                                  className="relative cursor-pointer"
                                >
                                  {/* Connection indicator */}
                                  {hoveredMilestone === index && (
                                    <motion.div
                                      className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-10"
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-blue-500"></div>
                                    </motion.div>
                                  )}
                                  
                                  <Card className={`h-full border-2 transition-all duration-300 rounded-2xl ${
                                    hoveredMilestone === index
                                      ? 'border-blue-500 dark:border-blue-400 shadow-lg ring-2 ring-blue-500/20'
                                      : milestone.status === 'completed' 
                                      ? 'border-green-200 dark:border-green-700'
                                      : milestone.status === 'in-progress'
                                      ? 'border-cyan-200 dark:border-cyan-700'
                                      : milestone.status === 'upcoming'
                                      ? 'border-blue-200 dark:border-blue-700'
                                      : 'border-purple-200 dark:border-purple-700'
                                  }`}>
                                    <CardContent className="p-2">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                          milestone.status === 'completed' ? 'bg-green-500' :
                                          milestone.status === 'in-progress' ? 'bg-cyan-500' :
                                          milestone.status === 'upcoming' ? 'bg-blue-500' : 'bg-purple-500'
                                        } text-white text-xs font-bold`}>
                                          {milestone.status === 'completed' ? '✓' :
                                           milestone.status === 'in-progress' ? '•' :
                                           milestone.status === 'upcoming' ? '→' : '◯'}
                                        </div>
                                        <Badge className={`text-xs px-1 py-0 ${
                                          milestone.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                          milestone.status === 'in-progress' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400' :
                                          milestone.status === 'upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 
                                          'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                        }`}>
                                          {milestone.date}
                                        </Badge>
                                      </div>
                                      
                                      <h4 className="font-semibold text-xs text-gray-900 dark:text-white mb-1 line-clamp-1">{milestone.title}</h4>
                                      
                                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                                        {milestone.description}
                                      </p>
                                      
                                      <div className="flex flex-wrap gap-1">
                                        {milestone.achievements.slice(0, 2).map((achievement, i) => (
                                          <span 
                                            key={i} 
                                            className="px-1 py-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-xs font-medium shadow-sm"
                                          >
                                            {achievement.split(':')[0].substring(0, 8)}...
                                          </span>
                                        ))}
                                        {milestone.achievements.length > 2 && (
                                          <span className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs">
                                            +{milestone.achievements.length - 2}
                                          </span>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Timeline Legend */}
                        <div className="mt-8 flex flex-wrap justify-center gap-6">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-cyan-500"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">In Progress</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Upcoming</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Planned</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}