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
    { label: "Phases Completed", value: "9/10", icon: <CheckCircle className="w-5 h-5" />, color: "green" },
    { label: "Features Delivered", value: "127+", icon: <Rocket className="w-5 h-5" />, color: "blue" },
    { label: "Performance Gain", value: "46%", icon: <TrendingUp className="w-5 h-5" />, color: "purple" },
    { label: "Enterprise Ready", value: "100%", icon: <Shield className="w-5 h-5" />, color: "orange" }
  ];

  const currentStatus = [
    {
      title: "Enterprise Platform Foundation",
      status: "in-progress",
      progress: 85,
      quarter: "Q1 2025",
      category: "enterprise",
      achievements: [
        "Multi-tenant architecture with Row Level Security",
        "Enterprise SSO (Microsoft Entra ID) with auto-provisioning", 
        "Advanced RBAC with conditional access policies",
        "Real-time collaboration with conflict resolution"
      ],
      impact: "Enables secure multi-organization deployments"
    },
    {
      title: "Performance & Code Quality",
      status: "upcoming", 
      progress: 30,
      quarter: "Q2 2025",
      category: "platform",
      achievements: [
        "46% bundle size reduction (1.7GB → 915MB)",
        "Complete Tailwind CSS migration from legacy CSS",
        "Lazy loading for admin components",
        "TypeScript strict mode with comprehensive testing"
      ],
      impact: "50% faster load times and improved developer experience"
    },
    {
      title: "Advanced Security Framework",
      status: "upcoming",
      progress: 20, 
      quarter: "Q2 2025",
      category: "security",
      achievements: [
        "Multi-factor authentication (TOTP, SMS, email)",
        "Zero Trust architecture foundations",
        "Comprehensive audit logging and monitoring",
        "SOC 2 Type II certification progress"
      ],
      impact: "Enterprise-grade security meeting compliance requirements"
    },
    {
      title: "Compliance Management Suite",
      status: "upcoming",
      progress: 15,
      quarter: "Q2 2025", 
      category: "compliance",
      achievements: [
        "Support for 15+ compliance frameworks",
        "Advanced diagram editor with Mermaid integration",
        "Document management with version control",
        "Gap analysis and remediation tracking"
      ],
      impact: "Complete compliance lifecycle management"
    },
    {
      title: "AI-Powered Platform Intelligence",
      status: "in-progress",
      progress: 75,
      quarter: "Q1 2025",
      category: "ai",
      achievements: [
        "AuditReady Guidance: AI-powered compliance descriptions and recommendations",
        "LMS AI Generator: Intelligent security training content creation",
        "Visual Flow AI Editor: Real-time flowchart generation with near-zero latency",
        "Smart compliance mapping with context-aware suggestions"
      ],
      impact: "Transforms manual compliance work into intelligent, automated processes"
    }
  ];

  const futureRoadmap = [
    {
      title: "Next-Generation AI Intelligence",
      status: "upcoming",
      progress: 15,
      quarter: "Q3 2025",
      category: "ai",
      features: [
        "Advanced Document AI: Word, Excel, PDF requirement interpretation",
        "AI Insights Engine: Risk management and application analytics",
        "Enhanced Visual Flow AI: Complex diagram generation with advanced layouts", 
        "Intelligent Compliance Copilot: Real-time guidance and recommendations"
      ],
      impact: "Revolutionary AI-first compliance management experience",
      effort: "High",
      businessValue: "Transformational"
    },
    {
      title: "Enterprise Integration Hub",
      status: "planned", 
      progress: 0,
      quarter: "Q4 2025",
      category: "enterprise",
      features: [
        "Native ServiceNow ITSM/GRC integration",
        "Jira/Confluence workspace synchronization", 
        "Microsoft 365 ecosystem deep integration",
        "Slack/Teams collaboration workflows"
      ],
      impact: "Seamless workflow integration for enterprise customers",
      effort: "High",
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
      title: "Enterprise Foundation", 
      status: "completed", 
      color: "green",
      description: "Multi-tenant architecture, Enterprise SSO, Advanced RBAC, Real-time collaboration",
      achievements: ["100% Enterprise Ready", "Row Level Security", "Microsoft Entra ID Integration"]
    },
    { 
      date: "Q2 2025", 
      title: "Performance & Security", 
      status: "completed", 
      color: "green",
      description: "46% bundle reduction, Tailwind migration, MFA implementation, SOC 2 progress",
      achievements: ["50% Faster Load Times", "Multi-Factor Authentication", "Zero Trust Architecture"]
    },
    { 
      date: "Q3 2025", 
      title: "AI Intelligence", 
      status: "in-progress", 
      color: "blue",
      description: "Advanced Document AI, Visual Flow Editor, AI Insights Engine, Compliance Copilot",
      achievements: ["Real-time AI Processing", "Document Interpretation", "Smart Risk Analytics"]
    },
    { 
      date: "Q4 2025", 
      title: "Enterprise Hub", 
      status: "upcoming", 
      color: "blue",
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
                  <Map className="w-6 h-6" />
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
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 shadow-lg">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="current" className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Current Status</span>
              </TabsTrigger>
              <TabsTrigger value="future" className="flex items-center space-x-2">
                <Rocket className="w-4 h-4" />
                <span>Future Roadmap</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center space-x-2">
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
                    <Card className="text-center border-2 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-center mb-3">
                          <div className={`p-3 bg-gradient-to-r ${getStatColor(stat.color)} text-white rounded-lg`}>
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
              <Card className="border-2 border-blue-200 dark:border-blue-800">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
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
              <Card className="border-2 border-green-200 dark:border-green-800">
                <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Recent Achievements</h2>
                      <p className="text-sm text-white/80 font-normal">Major milestones delivered in Q4 2024 - Q1 2025</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { icon: <Users className="w-5 h-5" />, title: "Enterprise SSO", desc: "Microsoft Entra ID with auto-provisioning" },
                      { icon: <Zap className="w-5 h-5" />, title: "Performance Boost", desc: "46% bundle size reduction, 50% faster loads" },
                      { icon: <Shield className="w-5 h-5" />, title: "Security Hardening", desc: "MFA, Zero Trust foundations, SOC 2 progress" },
                      { icon: <Code className="w-5 h-5" />, title: "Code Quality", desc: "Complete TypeScript migration, comprehensive testing" }
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
                      <Card className="border-2 hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold">{item.title}</h3>
                                <Badge className={getStatusBadge(item.status)}>
                                  {item.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                                  {item.status === 'in-progress' && <Clock className="w-3 h-3 mr-1" />}
                                  {item.status.replace('-', ' ')}
                                </Badge>
                              </CardTitle>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.quarter}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900 dark:text-white">{item.progress}%</div>
                              <Progress value={item.progress} className="w-20 mt-1" />
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
                      <Card className="border-2 hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold">{item.title}</h3>
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
                      <div className="text-center mb-12">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8 }}
                        >
                          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                            Innovation Timeline
                          </h2>
                          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Witness the evolution of compliance technology through our revolutionary development journey
                          </p>
                        </motion.div>
                      </div>

                      {/* Visual Timeline */}
                      <div className="relative">
                        {/* Main Timeline Path */}
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8">
                          <svg 
                            viewBox="0 0 1400 600" 
                            className="w-full h-auto mb-6"
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
                            </defs>
                            
                            {/* True Exponential Growth Curve */}
                            <motion.path
                              d="M 120 400 C 200 390, 280 375, 360 350 C 440 320, 520 280, 600 220 C 680 150, 760 90, 840 50 C 920 25, 1000 15, 1080 10 C 1160 8, 1240 7, 1280 6"
                              stroke="url(#exponentialGradient)"
                              strokeWidth="5"
                              fill="none"
                              filter="url(#glow)"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 4, ease: "easeInOut" }}
                            />

                            {/* Grid Lines for better readability */}
                            <defs>
                              <pattern id="grid" width="100" height="50" patternUnits="userSpaceOnUse">
                                <path d="M 100 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.3"/>
                              </pattern>
                            </defs>
                            <rect width="1400" height="500" fill="url(#grid)" />

                            {/* X-Axis */}
                            <line x1="120" y1="430" x2="1280" y2="430" stroke="#6b7280" strokeWidth="2" />
                            
                            {/* Y-Axis */}
                            <line x1="120" y1="430" x2="120" y2="50" stroke="#6b7280" strokeWidth="2" />
                            
                            {/* Y-Axis Labels */}
                            <text x="100" y="420" textAnchor="end" className="fill-gray-600 text-sm font-medium">Foundation</text>
                            <text x="100" y="320" textAnchor="end" className="fill-gray-600 text-sm font-medium">Advanced</text>
                            <text x="100" y="220" textAnchor="end" className="fill-gray-600 text-sm font-medium">Innovative</text>
                            <text x="100" y="120" textAnchor="end" className="fill-gray-600 text-sm font-medium">Revolutionary</text>
                            <text x="80" y="250" textAnchor="middle" className="fill-gray-700 text-base font-bold" transform="rotate(-90, 80, 250)">Innovation Impact</text>

                            {/* Current Time Marker */}
                            <motion.g
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 3, duration: 1 }}
                            >
                              <line 
                                x1={currentTime.position + 25} 
                                y1="50" 
                                x2={currentTime.position + 25} 
                                y2="450" 
                                stroke="#ef4444" 
                                strokeWidth="4" 
                                strokeDasharray="12,6"
                                opacity="0.9"
                              />
                              <rect 
                                x={currentTime.position - 25} 
                                y="15" 
                                width="100" 
                                height="30" 
                                fill="#ef4444" 
                                rx="15"
                                stroke="#dc2626"
                                strokeWidth="2"
                              />
                              <text 
                                x={currentTime.position + 25} 
                                y="34" 
                                textAnchor="middle" 
                                className="fill-white text-sm font-bold"
                              >
                                NOW ({currentTime.label})
                              </text>
                              
                              {/* Pulsing glow effect for NOW marker */}
                              <motion.rect 
                                x={currentTime.position - 25} 
                                y="15" 
                                width="100" 
                                height="30" 
                                fill="none"
                                stroke="#ef4444" 
                                strokeWidth="2"
                                rx="15"
                                opacity="0.6"
                                animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.2, 0.6] }}
                                transition={{ duration: 2.5, repeat: Infinity }}
                              />
                            </motion.g>
                            
                            {/* Timeline Milestones with True Exponential Positioning */}
                            {milestones.map((milestone, index) => {
                              // Spread across full width with exponential X spacing
                              const baseX = 120;
                              const maxX = 1280;
                              const exponentialX = baseX + (Math.pow(index + 1, 1.2) / Math.pow(milestones.length, 1.2)) * (maxX - baseX);
                              const x = Math.min(exponentialX, maxX);
                              
                              // True exponential Y positioning
                              const maxY = 400;
                              const minY = 60;
                              const exponentialFactor = Math.pow(2.5, index) / Math.pow(2.5, milestones.length - 1);
                              const y = maxY - (exponentialFactor * (maxY - minY));
                              
                              return (
                                <motion.g
                                  key={milestone.date}
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 1 + index * 0.4, duration: 0.8 }}
                                >
                                  {/* Milestone Circle */}
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r={12 + index * 2}
                                    fill={milestone.status === 'completed' ? '#10b981' : 
                                          milestone.status === 'in-progress' ? '#06b6d4' :
                                          milestone.status === 'upcoming' ? '#3b82f6' : '#8b5cf6'}
                                    stroke="white"
                                    strokeWidth="3"
                                    filter="url(#glow)"
                                    className="cursor-pointer transition-all duration-300 hover:opacity-80"
                                    onMouseEnter={() => {
                                      setHoveredMilestone(index);
                                      setCarouselPosition(index);
                                    }}
                                    onMouseLeave={() => setHoveredMilestone(null)}
                                  />
                                  
                                  {/* Pulsing Animation - Only for in-progress status (current active work) */}
                                  {milestone.status === 'in-progress' && (
                                    <motion.circle
                                      cx={x}
                                      cy={y}
                                      r={12 + index * 2}
                                      fill="none"
                                      stroke="#06b6d4"
                                      strokeWidth="3"
                                      opacity="0.7"
                                      animate={{ r: [12 + index * 2, 22 + index * 2, 12 + index * 2], opacity: [0.7, 0.1, 0.7] }}
                                      transition={{ duration: 2.5, repeat: Infinity }}
                                    />
                                  )}
                                  
                                  {/* X-Axis Date Label */}
                                  <text 
                                    x={x} 
                                    y="560" 
                                    textAnchor="middle" 
                                    className="fill-gray-700 text-sm font-bold"
                                  >
                                    {milestone.date}
                                  </text>
                                </motion.g>
                              );
                            })}
                          </svg>
                          
                          {/* Implementation Cards Carousel */}
                          <div className="mt-4 relative">
                            {/* Labels */}
                            <div className="flex justify-between items-center mb-6 px-4">
                              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">Past</h3>
                              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">Future</h3>
                            </div>
                            
                            {/* Carousel Container */}
                            <div className="overflow-hidden px-4">
                              <motion.div 
                                className="flex gap-6"
                                animate={{ 
                                  x: `${-carouselPosition * (100/3)}%`
                                }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                              >
                                {milestones.map((milestone, index) => (
                                  <motion.div
                                    key={milestone.date}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 2 + index * 0.1, duration: 0.6 }}
                                    className="min-w-[33.33%] flex-shrink-0"
                                  >
                                    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 transition-all duration-300 h-full ${
                                      hoveredMilestone === index
                                        ? 'border-blue-400 dark:border-blue-500 shadow-xl transform scale-105'
                                        : milestone.status === 'in-progress'
                                        ? 'border-blue-300 dark:border-blue-600'
                                        : 'border-gray-200 dark:border-gray-700'
                                    }`}>
                                      <div className="flex items-center justify-between mb-4">
                                        <div className={`w-4 h-4 rounded-full ${
                                          milestone.status === 'completed' ? 'bg-green-500' :
                                          milestone.status === 'in-progress' ? 'bg-cyan-500' :
                                          milestone.status === 'upcoming' ? 'bg-blue-500' : 'bg-purple-500'
                                        }`}></div>
                                        <Badge className={`${
                                          milestone.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                          milestone.status === 'in-progress' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400' :
                                          milestone.status === 'upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                        } text-xs px-2 py-1`}>
                                          {milestone.date}
                                        </Badge>
                                      </div>
                                      
                                      <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3">{milestone.title}</h4>
                                      
                                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                                        {milestone.description}
                                      </p>
                                      
                                      <div className="flex flex-wrap gap-2">
                                        {milestone.achievements.slice(0, 3).map((achievement, i) => (
                                          <span 
                                            key={i} 
                                            className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-xs font-medium"
                                          >
                                            {achievement}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </motion.div>
                            </div>
                          </div>
                        </div>


                        {/* Timeline Content Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {milestones.slice(0, 4).map((milestone, index) => (
                            <motion.div
                              key={milestone.date}
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 1 + index * 0.2 }}
                              className="relative h-full"
                            >
                              <Card className={`h-full border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                                milestone.status === 'completed' 
                                  ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:border-green-300' 
                                  : milestone.status === 'in-progress'
                                  ? 'border-cyan-200 bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 hover:border-cyan-300'
                                  : milestone.status === 'upcoming'
                                  ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 hover:border-blue-300'
                                  : 'border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 hover:border-purple-300'
                              }`}>
                                <CardContent className="p-6 h-full flex flex-col justify-between">
                                  <div className="text-center">
                                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                                      milestone.status === 'completed' 
                                        ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                                        : milestone.status === 'in-progress'
                                        ? 'bg-gradient-to-br from-cyan-500 to-teal-600'
                                        : milestone.status === 'upcoming'
                                        ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                                        : 'bg-gradient-to-br from-purple-500 to-violet-600'
                                    } shadow-lg transform transition-transform duration-300 hover:scale-110`}>
                                      {milestone.status === 'completed' ? (
                                        <CheckCircle className="w-8 h-8 text-white" />
                                      ) : milestone.status === 'in-progress' ? (
                                        <Settings className="w-8 h-8 text-white animate-spin" />
                                      ) : milestone.status === 'upcoming' ? (
                                        <Zap className="w-8 h-8 text-white" />
                                      ) : (
                                        <Clock className="w-8 h-8 text-white" />
                                      )}
                                    </div>
                                    
                                    <h3 className="font-bold text-lg mb-2 min-h-[3rem] flex items-center justify-center">{milestone.title}</h3>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                                      {milestone.date}
                                    </p>
                                  </div>
                                  
                                  <div className="mt-auto flex justify-center">
                                    <Badge className={`${
                                      milestone.status === 'completed' 
                                        ? 'bg-green-500 hover:bg-green-600 text-white border-0 shadow-md hover:shadow-lg' 
                                        : milestone.status === 'upcoming'
                                        ? 'bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-md hover:shadow-lg'
                                        : milestone.status === 'in-progress'
                                        ? 'bg-cyan-500 hover:bg-cyan-600 text-white border-0 shadow-md hover:shadow-lg'
                                        : 'bg-purple-500 hover:bg-purple-600 text-white border-0 shadow-md hover:shadow-lg'
                                    } transition-all duration-300 transform hover:scale-105`}>
                                      {milestone.status === 'completed' ? '✓ Completed' : 
                                       milestone.status === 'in-progress' ? '🔄 In Progress' :
                                       milestone.status === 'upcoming' ? '⚡ Active' : '📋 Planned'}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
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