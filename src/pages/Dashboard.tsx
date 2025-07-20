import { BarChart3, BookOpen, CheckSquare, Shield, TrendingUp, Calendar, Clock, Edit, Activity, User, FileText, AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ComplianceChart } from "@/components/dashboard/ComplianceChart";
import { AssessmentProgress } from "@/components/dashboard/AssessmentProgress";
import { CybersecurityNews } from "@/components/dashboard/CybersecurityNews";
import { assessments } from "@/data/mockData";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";

const Dashboard = () => {
  console.log("Dashboard component loaded");
  const navigate = useNavigate();
  const { user, isPlatformAdmin, isDemo } = useAuth();
  const { stats, loading, error } = useDashboardData();

  // Platform admins should see the Platform Admin Console, not customer dashboard
  useEffect(() => {
    if (isPlatformAdmin) {
      console.log("Platform admin detected, redirecting to admin console");
      navigate("/admin", { replace: true });
    }
  }, [isPlatformAdmin, navigate]);

  const getUserGreeting = () => {
    if (isDemo) {
      return "Welcome Demo User";
    }
    
    const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
    return `Welcome ${displayName}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="pt-0 space-y-4 sm:space-y-6 pb-6 sm:pb-8 w-full px-2 sm:px-0">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="pt-0 space-y-4 sm:space-y-6 pb-6 sm:pb-8 w-full px-2 sm:px-0">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="mt-2 text-muted-foreground">Error loading dashboard: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="pt-0 space-y-4 sm:space-y-6 pb-6 sm:pb-8 w-full px-2 sm:px-0"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Compliance Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Track your organization's compliance status and assessments across all standards
          </p>
        </div>
        <div className="mt-1 md:mt-0 py-2 px-3 sm:py-1 sm:px-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
          <h2 className="text-sm sm:text-base font-medium text-blue-800 dark:text-blue-400">{getUserGreeting()}</h2>
        </div>
      </div>

      {/* Re-added Recent Trend Card */}
      <motion.div
        variants={fadeInVariants}
        className="bg-gradient-to-r from-blue-50 via-background to-teal-50 dark:from-blue-950/30 dark:via-slate-900/60 dark:to-teal-950/30 rounded-xl p-4 shadow-lg w-full border border-border/70"
        data-card="true"
      >
        <div className="flex flex-col md:flex-row justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg">
              <TrendingUp size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium">Recent Trend</h3>
              <p className="text-xs text-muted-foreground">Your compliance is improving by 5% since last month</p>
            </div>
          </div>

          <div className="flex flex-row gap-3">
            <div className="flex items-center gap-2 bg-background dark:bg-gray-800/60 p-2 rounded-lg shadow-sm">
              <div className="bg-amber-100 dark:bg-amber-900/50 p-1.5 rounded-lg">
                <Calendar size={14} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Next assessment</p>
                <p className="text-sm font-medium">June 15, 2023</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-background dark:bg-gray-800/60 p-2 rounded-lg shadow-sm">
              <div className="bg-green-100 dark:bg-green-900/50 p-1.5 rounded-lg">
                <Clock size={14} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last updated</p>
                <p className="text-sm font-medium">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full"
        variants={itemVariants}
      >
        <div onClick={() => navigate("/app/standards")} className="cursor-pointer">
          <StatsCard
            title="Total Standards"
            value={stats.totalStandards}
            icon={<Shield size={16} />}
            description="Active compliance standards"
            className="shadow-md hover:shadow-lg transition-shadow hover:bg-muted/20 dark:hover:bg-slate-800/60 border border-border/70"
            data-card="true"
          />
        </div>
        <div onClick={() => navigate("/app/requirements")} className="cursor-pointer">
          <StatsCard
            title="Total Requirements"
            value={stats.totalRequirements}
            icon={<BookOpen size={16} />}
            description="Across all standards"
            className="shadow-md hover:shadow-lg transition-shadow hover:bg-muted/20 dark:hover:bg-slate-800/60 border border-border/70"
            data-card="true"
          />
        </div>
        <div onClick={() => navigate("/app/assessments")} className="cursor-pointer">
          <StatsCard
            title="Total Assessments"
            value={stats.totalAssessments}
            icon={<CheckSquare size={16} />}
            description="Ongoing and completed"
            className="shadow-md hover:shadow-lg transition-shadow hover:bg-muted/20 dark:hover:bg-slate-800/60 border border-border/70"
            data-card="true"
          />
        </div>
        <div onClick={() => navigate("/app/compliance-monitoring")} className="cursor-pointer">
          <StatsCard
            title="Compliance Score"
            value={`${stats.complianceScore}%`}
            icon={<BarChart3 size={16} />}
            trend={{
              value: 5,
              isPositive: true
            }}
            description="Overall compliance rate"
            className="shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-background to-blue-50 dark:from-gray-900 dark:to-blue-950/30 border border-border/70 hover:bg-muted/20 dark:hover:bg-slate-800/60"
            data-card="true"
          />
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-6 gap-5 w-full"
        variants={itemVariants}
      >
        {/* Left Column - Compliance Chart and Tasks */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          <motion.div variants={itemVariants} className="shadow-lg rounded-xl overflow-hidden">
            <ComplianceChart data={stats.complianceBreakdown} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <CurrentActivities />
          </motion.div>
        </div>

        {/* Right Column - Cybersecurity News (stretched to the right) */}
        <motion.div variants={itemVariants} className="lg:col-span-4">
          <CybersecurityNews />
        </motion.div>
      </motion.div>

      {/* Recent Assessments - Now below the news */}
      <motion.div variants={itemVariants} className="shadow-lg rounded-xl overflow-hidden border border-border/70" data-card="true">
        <AssessmentProgress
          assessments={assessments}
          onAssessmentClick={(id) => navigate(`/app/assessments/${id}`)}
        />
      </motion.div>

    </motion.div>
  );
};

// Current Activities component that matches RSS feed height
const CurrentActivities = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const activities = [
    {
      id: 1,
      type: 'assessment',
      title: 'ISO 27001 Assessment in Progress',
      description: '12 of 24 requirements completed',
      time: '2 hours ago',
      status: 'in-progress',
      icon: <Shield size={16} />,
      color: 'blue'
    },
    {
      id: 2,
      type: 'requirement',
      title: 'Updated Access Control Policy',
      description: 'Requirement A.9.1.1 marked as fulfilled',
      time: '4 hours ago',
      status: 'completed',
      icon: <CheckCircle2 size={16} />,
      color: 'green'
    },
    {
      id: 3,
      type: 'assignment',
      title: 'New Requirements Assigned',
      description: '5 network security requirements assigned to you',
      time: '6 hours ago',
      status: 'pending',
      icon: <AlertCircle size={16} />,
      color: 'amber'
    },
    {
      id: 4,
      type: 'document',
      title: 'Generated SOA Document',
      description: 'Statement of Applicability for ISO 27001',
      time: '1 day ago',
      status: 'completed',
      icon: <FileText size={16} />,
      color: 'purple'
    },
    {
      id: 5,
      type: 'review',
      title: 'Evidence Review Pending',
      description: 'Risk assessment documentation needs review',
      time: '1 day ago',
      status: 'pending',
      icon: <Clock3 size={16} />,
      color: 'orange'
    },
    {
      id: 6,
      type: 'assessment',
      title: 'CIS Controls Gap Analysis',
      description: 'Baseline assessment completed',
      time: '2 days ago',
      status: 'completed',
      icon: <BarChart3 size={16} />,
      color: 'teal'
    },
    {
      id: 7,
      type: 'training',
      title: 'Security Awareness Training',
      description: 'Completed mandatory cybersecurity module',
      time: '3 days ago',
      status: 'completed',
      icon: <BookOpen size={16} />,
      color: 'indigo'
    },
    {
      id: 8,
      type: 'collaboration',
      title: 'Team Collaboration Session',
      description: 'Discussed GDPR compliance strategy',
      time: '4 days ago',
      status: 'completed',
      icon: <User size={16} />,
      color: 'pink'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400';
      case 'in-progress': return 'text-blue-600 dark:text-blue-400';
      case 'pending': return 'text-amber-600 dark:text-amber-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getIconBg = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 dark:bg-blue-900/50',
      green: 'bg-green-100 dark:bg-green-900/50',
      amber: 'bg-amber-100 dark:bg-amber-900/50',
      purple: 'bg-purple-100 dark:bg-purple-900/50',
      orange: 'bg-orange-100 dark:bg-orange-900/50',
      teal: 'bg-teal-100 dark:bg-teal-900/50',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/50',
      pink: 'bg-pink-100 dark:bg-pink-900/50'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-all h-[340px] border border-border/70" data-card="true">
      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-lg">
              <Activity size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold">Current Activities</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="px-2 py-1 h-auto text-xs"
            onClick={() => navigate('/app/activities')}
          >
            View All
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="p-3 border border-border/50 rounded-lg hover:bg-muted/20 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              onClick={() => {
                if (activity.type === 'assessment') navigate('/app/assessments');
                else if (activity.type === 'requirement') navigate('/app/requirements');
                else if (activity.type === 'document') navigate('/app/documents');
                else navigate('/app/activities');
              }}
            >
              <div className="flex items-start gap-3">
                <div className={`${getIconBg(activity.color)} p-2 rounded-lg flex-shrink-0`}>
                  <div className={getStatusColor(activity.status)}>
                    {activity.icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium line-clamp-1">{activity.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' :
                      activity.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                    }`}>
                      {activity.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};


export default Dashboard;
