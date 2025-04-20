import { BarChart3, BookOpen, CheckSquare, Shield, TrendingUp, Calendar, Clock } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ComplianceChart } from "@/components/dashboard/ComplianceChart";
import { AssessmentProgress } from "@/components/dashboard/AssessmentProgress";
import { dashboardStats, assessments, requirements } from "@/data/mockData";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RequirementStatus } from "@/types";

const Dashboard = () => {
  console.log("Dashboard component loaded");
  
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between !border-none !pb-0">
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
        className="bg-gradient-to-r from-blue-50 via-white to-teal-50 dark:from-blue-950/30 dark:via-slate-900/50 dark:to-teal-950/30 rounded-xl p-4 shadow-lg w-full"
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
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
              <div className="bg-amber-100 dark:bg-amber-900/50 p-1.5 rounded-lg">
                <Calendar size={14} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Next assessment</p>
                <p className="text-sm font-medium">June 15, 2023</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
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
        <StatsCard
          title="Total Standards"
          value={dashboardStats.totalStandards}
          icon={<Shield size={16} />}
          description="Active compliance standards"
          className="shadow-md hover:shadow-lg transition-shadow"
        />
        <StatsCard
          title="Total Requirements"
          value={dashboardStats.totalRequirements}
          icon={<BookOpen size={16} />}
          description="Across all standards"
          className="shadow-md hover:shadow-lg transition-shadow"
        />
        <StatsCard
          title="Total Assessments"
          value={dashboardStats.totalAssessments}
          icon={<CheckSquare size={16} />}
          description="Ongoing and completed"
          className="shadow-md hover:shadow-lg transition-shadow"
        />
        <StatsCard
          title="Compliance Score"
          value={`${dashboardStats.complianceScore}%`}
          icon={<BarChart3 size={16} />}
          trend={{
            value: 5,
            isPositive: true
          }}
          description="Overall compliance rate"
          className="shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-950/30"
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
            <Card className="shadow-md hover:shadow-lg transition-all h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Upcoming Tasks</h3>
                  <Button variant="outline" size="sm" className="px-2 py-1 h-auto text-xs">View All</Button>
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="p-2 border rounded-lg flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-lg">
                          <Shield size={14} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Complete ISO 27001 Assessment</p>
                          <p className="text-xs text-muted-foreground">Due in 3 days</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="px-2 py-1 h-auto text-xs">Start</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <motion.div variants={itemVariants} className="shadow-lg rounded-xl overflow-hidden lg:col-span-3">
          <AssessmentProgress assessments={assessments} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
