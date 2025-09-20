import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Shield, 
  CheckCircle, 
  Target, 
  ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SolutionStatementProps {
  onShowUnified: () => void;
  stats: { 
    unifiedGroups: number; 
    reductionPercentage: string;
    maxRequirements: number;
  };
}

export const ComplianceSolutionStatementCard: React.FC<SolutionStatementProps> = ({ 
  onShowUnified, 
  stats 
}) => {
  return (
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
              onClick={onShowUnified}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
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
              Our AI transforms {stats.maxRequirements} scattered requirements from multiple frameworks into just {stats.unifiedGroups} comprehensive requirement groups, reducing complexity by {stats.reductionPercentage}%.
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
  );
};