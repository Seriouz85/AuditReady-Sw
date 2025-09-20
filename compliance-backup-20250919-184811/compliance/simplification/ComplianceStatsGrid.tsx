import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface StatsGridProps {
  stats: {
    maxRequirements: number;
    unifiedGroups: number;
    reduction: number;
    reductionPercentage: string;
    efficiencyRatio: number;
  };
}

export function ComplianceStatsGrid({ stats }: StatsGridProps) {
  const statItems = [
    { 
      value: `${stats.maxRequirements}→${stats.unifiedGroups}`, 
      label: "Requirements Simplified", 
      desc: `From ${stats.maxRequirements} scattered requirements to ${stats.unifiedGroups} unified groups`, 
      color: "blue",
      bgClass: "bg-blue-50 dark:bg-blue-900/20",
      textClass: "text-blue-600 dark:text-blue-400"
    },
    { 
      value: `${stats.reductionPercentage}%`, 
      label: "Complexity Reduction", 
      desc: `${stats.reduction} fewer requirements to manage`, 
      color: "green",
      bgClass: "bg-green-50 dark:bg-green-900/20",
      textClass: "text-green-600 dark:text-green-400"
    },
    { 
      value: `${stats.efficiencyRatio}:1`, 
      label: "Efficiency Ratio", 
      desc: `${stats.efficiencyRatio} traditional requirements per 1 unified group`, 
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
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statItems.map((stat, index) => (
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
  );
}