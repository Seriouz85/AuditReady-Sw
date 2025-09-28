import { motion } from 'framer-motion';
import { Target, Zap, Shield, ArrowRight, CheckCircle, BookOpen, Users, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OverviewTabProps } from '@/types/ComplianceSimplificationTypes';

export function ComplianceOverviewTab({
  maximumOverviewStats = {
    maxRequirements: 0,
    unifiedGroups: 0,
    reductionPercentage: "0",
    reduction: 0,
    efficiencyRatio: 0
  },
  setActiveTab
}: Pick<OverviewTabProps, 'maximumOverviewStats'> & { 
  setActiveTab: (tab: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Problem Statement */}
      <Card className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 dark:from-red-950/50 dark:via-orange-950/50 dark:to-amber-950/50 border-b border-red-100 dark:border-red-800/30 pb-4">
          <CardTitle className="flex items-start space-x-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg shadow-md shadow-red-500/20">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">The Compliance Complexity Problem</h2>
                <div className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <span className="text-xs font-medium text-red-700 dark:text-red-300">CHALLENGE</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Why traditional compliance is overwhelming organizations worldwide</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <motion.div 
              className="text-center"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl mb-3 w-fit mx-auto">
                <BookOpen className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Overlapping Requirements</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Multiple frameworks often have similar requirements with different wording, creating confusion and redundancy.
              </p>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl mb-3 w-fit mx-auto">
                <Users className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Implementation Confusion</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Teams struggle to understand which requirements apply and how to avoid duplicate work across frameworks.
              </p>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl mb-3 w-fit mx-auto">
                <Settings className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Resource Inefficiency</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Organizations waste time and resources implementing the same control multiple times for different frameworks.
              </p>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Solution Statement */}
      <Card className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50 via-emerald-50 to-blue-50 dark:from-green-950/50 dark:via-emerald-950/50 dark:to-blue-950/50 border-b border-green-100 dark:border-green-800/30 pb-4">
          <CardTitle className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg shadow-md shadow-green-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">The AuditReady Solution</h2>
                  <div className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <span className="text-xs font-medium text-green-700 dark:text-green-300">SOLUTION</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">AI-powered compliance unification that transforms complexity into clarity</p>
              </div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-4"
            >
              <Button
                onClick={() => setActiveTab('mapping')}
                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-lg shadow-blue-500/25 border-0 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200"
              >
                <Shield className="w-4 h-4 mr-2" />
                Unify Frameworks
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <motion.div 
              className="text-center"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl mb-3 w-fit mx-auto">
                <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Intelligent Unification</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Our AI transforms {maximumOverviewStats.maxRequirements} scattered requirements from multiple frameworks into just {maximumOverviewStats.unifiedGroups} comprehensive requirement groups, reducing complexity by {maximumOverviewStats.reductionPercentage}%.
              </p>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-3 w-fit mx-auto">
                <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Complete Coverage</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Every detail from source frameworks is preserved in our unified requirements, ensuring nothing is lost.
              </p>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl mb-3 w-fit mx-auto">
                <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">Clear Implementation</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Plain language descriptions with actionable sub-requirements make implementation straightforward and effective.
              </p>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            value: `${maximumOverviewStats.maxRequirements}→${maximumOverviewStats.unifiedGroups}`, 
            label: "Requirements Simplified", 
            desc: `From ${maximumOverviewStats.maxRequirements} scattered requirements to ${maximumOverviewStats.unifiedGroups} unified groups`, 
            color: "blue",
            bgClass: "bg-blue-50 dark:bg-blue-900/20",
            textClass: "text-blue-600 dark:text-blue-400"
          },
          { 
            value: `${maximumOverviewStats.reductionPercentage}%`, 
            label: "Complexity Reduction", 
            desc: `${maximumOverviewStats.reduction} fewer requirements to manage`, 
            color: "green",
            bgClass: "bg-green-50 dark:bg-green-900/20",
            textClass: "text-green-600 dark:text-green-400"
          },
          { 
            value: `${maximumOverviewStats.efficiencyRatio}:1`, 
            label: "Efficiency Ratio", 
            desc: `${maximumOverviewStats.efficiencyRatio} traditional requirements per 1 unified group`, 
            color: "purple",
            bgClass: "bg-purple-50 dark:bg-purple-900/20",
            textClass: "text-purple-600 dark:text-purple-400"
          },
          { 
            value: "100%", 
            label: "Coverage Maintained", 
            desc: "All original requirements preserved", 
            color: "emerald",
            bgClass: "bg-emerald-50 dark:bg-emerald-900/20",
            textClass: "text-emerald-600 dark:text-emerald-400"
          }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="flex"
          >
            <Card className={`text-center border border-slate-200 dark:border-slate-700 rounded-xl ${stat.bgClass} hover:shadow-md transition-all duration-200 flex-1`}>
              <CardContent className="p-4">
                <div className={`text-2xl font-bold ${stat.textClass} mb-2`}>
                  {stat.value}
                </div>
                <div className="font-medium text-slate-900 dark:text-slate-100 text-sm mb-2">
                  {stat.label}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {stat.desc}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}