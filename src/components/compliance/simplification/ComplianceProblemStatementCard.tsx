import { motion } from 'framer-motion';
import { Target, BookOpen, Users, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ComplianceProblemStatementCard() {
  return (
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
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
  );
}