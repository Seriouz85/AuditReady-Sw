import { BarChart3, BookOpen, CheckSquare, Shield, TrendingUp, Calendar, Clock, Edit } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ComplianceChart } from "@/components/dashboard/ComplianceChart";
import { AssessmentProgress } from "@/components/dashboard/AssessmentProgress";
import { dashboardStats, assessments, requirements } from "@/data/mockData";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Dashboard = () => {
  console.log("Dashboard component loaded");
  const navigate = useNavigate();
  const { isPlatformAdmin } = useAuth();

  // Platform admins should see the Platform Admin Console, not customer dashboard
  useEffect(() => {
    if (isPlatformAdmin) {
      console.log("Platform admin detected, redirecting to admin console");
      navigate("/admin", { replace: true });
    }
  }, [isPlatformAdmin, navigate]);

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

  // Calculate actual requirement counts dynamically
  const calculateRequirementCounts = () => {
    const counts = {
      fulfilled: 0,
      partiallyFulfilled: 0,
      notFulfilled: 0,
      notApplicable: 0
    };

    requirements.forEach(req => {
      switch (req.status) {
        case 'fulfilled':
          counts.fulfilled++;
          break;
        case 'partially-fulfilled':
          counts.partiallyFulfilled++;
          break;
        case 'not-fulfilled':
          counts.notFulfilled++;
          break;
        case 'not-applicable':
          counts.notApplicable++;
          break;
      }
    });

    return counts;
  };

  const dynamicRequirementCounts = calculateRequirementCounts();

  return (
    <motion.div
      className="pt-0 space-y-6 pb-8 w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight">Compliance Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your organization's compliance status and assessments across all standards
          </p>
        </div>
        <div className="mt-3 md:mt-0 py-1 px-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">
          <h2 className="text-xl font-bold tracking-tight text-blue-800 dark:text-blue-400">Welcome Security User</h2>
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
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full"
        variants={itemVariants}
      >
        <div onClick={() => navigate("/app/standards")} className="cursor-pointer">
          <StatsCard
            title="Total Standards"
            value={dashboardStats.totalStandards}
            icon={<Shield size={16} />}
            description="Active compliance standards"
            className="shadow-md hover:shadow-lg transition-shadow hover:bg-muted/20 dark:hover:bg-slate-800/60 border border-border/70"
            data-card="true"
          />
        </div>
        <div onClick={() => navigate("/app/requirements")} className="cursor-pointer">
          <StatsCard
            title="Total Requirements"
            value={dashboardStats.totalRequirements}
            icon={<BookOpen size={16} />}
            description="Across all standards"
            className="shadow-md hover:shadow-lg transition-shadow hover:bg-muted/20 dark:hover:bg-slate-800/60 border border-border/70"
            data-card="true"
          />
        </div>
        <div onClick={() => navigate("/app/assessments")} className="cursor-pointer">
          <StatsCard
            title="Total Assessments"
            value={dashboardStats.totalAssessments}
            icon={<CheckSquare size={16} />}
            description="Ongoing and completed"
            className="shadow-md hover:shadow-lg transition-shadow hover:bg-muted/20 dark:hover:bg-slate-800/60 border border-border/70"
            data-card="true"
          />
        </div>
        <StatsCard
          title="Compliance Score"
          value={`${dashboardStats.complianceScore}%`}
          icon={<BarChart3 size={16} />}
          trend={{
            value: 5,
            isPositive: true
          }}
          description="Overall compliance rate"
          className="shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-background to-blue-50 dark:from-gray-900 dark:to-blue-950/30 border border-border/70"
          data-card="true"
        />
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-5 gap-5 w-full"
        variants={itemVariants}
      >
        <div className="flex flex-col gap-5 lg:col-span-2">
          <motion.div variants={itemVariants} className="shadow-lg rounded-xl overflow-hidden">
            <ComplianceChart data={dynamicRequirementCounts} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="shadow-md hover:shadow-lg transition-all h-full border border-border/70" data-card="true">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Upcoming Tasks</h3>
                  <Button variant="outline" size="sm" className="px-2 py-1 h-auto text-xs">View All</Button>
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="p-2 border border-border/50 rounded-lg flex justify-between items-center hover:bg-muted/20 dark:hover:bg-slate-800/60 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-lg">
                          <Shield size={14} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Complete ISO 27001 Assessment</p>
                          <p className="text-xs text-muted-foreground">Due in 3 days</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2 py-1 h-auto text-xs"
                        onClick={() => navigate("/app/assessments/1")}
                      >
                        Start
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="shadow-lg rounded-xl overflow-hidden lg:col-span-3 border border-border/70" data-card="true">
          <AssessmentProgress
            assessments={assessments}
            onAssessmentClick={(id) => navigate(`/app/assessments/${id}`)}
          />
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
        </div>
        <QuickActions />
      </motion.div>
    </motion.div>
  );
};

// Add a new "Quick Actions" section to the dashboard
const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
      <div
        onClick={() => navigate('/editor')}
        className="cursor-pointer"
      >
        <Card className="shadow-md hover:shadow-lg transition-shadow hover:bg-muted/20 dark:hover:bg-slate-800/60 border border-border/70 h-full" data-card="true">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full mt-2 mb-3">
              <Edit size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold">AuditReady Mermaid Editor</h3>
            <p className="text-sm text-muted-foreground mt-1">Create stunning professional diagrams with Mermaid.js - 14+ diagram types, glassmorphic design, audit themes</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for additional quick action cards */}
      <div
        className="cursor-pointer opacity-60 hover:opacity-80 transition-opacity"
        onClick={() => alert("Coming soon!")}
      >
        <Card className="shadow-md border border-border/70 h-full" data-card="true">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full mt-2 mb-3">
              <BookOpen size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold">Documentation Generator</h3>
            <p className="text-sm text-muted-foreground mt-1">Generate compliance documentation (Coming soon)</p>
          </CardContent>
        </Card>
      </div>

      <div
        className="cursor-pointer opacity-60 hover:opacity-80 transition-opacity"
        onClick={() => alert("Coming soon!")}
      >
        <Card className="shadow-md border border-border/70 h-full" data-card="true">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full mt-2 mb-3">
              <CheckSquare size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold">Compliance Wizard</h3>
            <p className="text-sm text-muted-foreground mt-1">Generate assessments faster (Coming soon)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
