/**
 * Unified Styled Components for Compliance Simplification
 * Extracted from ComplianceSimplification.tsx to reduce duplication
 * CRITICAL: Preserves EXACT visual styling and gradients
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

/**
 * Main page background container - EXACT preservation
 */
export function PageBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {children}
    </div>
  );
}

/**
 * Sticky header with gradient - EXACT preservation
 */
export function StickyGradientHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {children}
      </div>
    </div>
  );
}

/**
 * Standard card with rounded corners and overflow hidden - EXACT preservation
 */
export function StandardCard({ children, className = '' }: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <Card className={`border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden ${className}`}>
      {children}
    </Card>
  );
}

/**
 * Problem statement card header - EXACT preservation of red/orange/amber gradient
 */
export function ProblemStatementHeader({ children }: { children: React.ReactNode }) {
  return (
    <CardHeader className="bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 dark:from-red-950/50 dark:via-orange-950/50 dark:to-amber-950/50 border-b border-red-100 dark:border-red-800/30 pb-4">
      {children}
    </CardHeader>
  );
}

/**
 * Solution statement card header - EXACT preservation of green/emerald/blue gradient
 */
export function SolutionStatementHeader({ children }: { children: React.ReactNode }) {
  return (
    <CardHeader className="bg-gradient-to-r from-green-50 via-emerald-50 to-blue-50 dark:from-green-950/50 dark:via-emerald-950/50 dark:to-blue-950/50 border-b border-green-100 dark:border-green-800/30 pb-4">
      {children}
    </CardHeader>
  );
}

/**
 * Icon container with gradient and shadow - EXACT preservation
 */
export function IconGradientContainer({ 
  children, 
  gradient = 'from-red-500 to-orange-600',
  shadowColor = 'shadow-red-500/20'
}: { 
  children: React.ReactNode; 
  gradient?: string;
  shadowColor?: string;
}) {
  return (
    <div className={`p-2 bg-gradient-to-br ${gradient} rounded-lg shadow-md ${shadowColor}`}>
      {children}
    </div>
  );
}

/**
 * Colored info box - EXACT preservation of styling patterns
 */
export function ColoredInfoBox({ 
  children, 
  bgColor = 'bg-red-100 dark:bg-red-900/30' 
}: { 
  children: React.ReactNode; 
  bgColor?: string; 
}) {
  return (
    <div className={`p-3 ${bgColor} rounded-xl mb-3 w-fit mx-auto`}>
      {children}
    </div>
  );
}

/**
 * Tab list container - EXACT preservation
 */
export function TabListContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid w-full grid-cols-4 bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 rounded-2xl">
      {children}
    </div>
  );
}

/**
 * Individual tab trigger - EXACT preservation
 */
export function TabTriggerButton({ children, className = '' }: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <button className={`flex items-center space-x-1 sm:space-x-2 rounded-xl text-xs sm:text-sm w-full p-3 justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 data-[state=active]:bg-blue-500 data-[state=active]:text-white ${className}`}>
      {children}
    </button>
  );
}

/**
 * Action button with gradient - EXACT preservation
 */
export function GradientActionButton({ 
  children, 
  onClick, 
  gradient = 'from-blue-600 to-emerald-600',
  hoverGradient = 'hover:from-blue-700 hover:to-emerald-700',
  shadowColor = 'shadow-blue-500/25',
  className = ''
}: {
  children: React.ReactNode;
  onClick?: () => void;
  gradient?: string;
  hoverGradient?: string;
  shadowColor?: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-r ${gradient} ${hoverGradient} text-white shadow-lg ${shadowColor} border-0 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Animated motion card - EXACT preservation of animation patterns
 */
export function AnimatedMotionCard({ 
  children, 
  delay = 0,
  className = ''
}: { 
  children: React.ReactNode; 
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Framework badge container - EXACT preservation
 */
export function FrameworkBadgeContainer({ 
  children, 
  color 
}: { 
  children: React.ReactNode; 
  color: string; 
}) {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
      {children}
    </span>
  );
}

/**
 * Stats grid item container - EXACT preservation from ComplianceStatsGrid pattern
 */
export function StatsGridItem({ 
  value,
  label, 
  description, 
  bgClass,
  textClass,
  index = 0
}: {
  value: string;
  label: string;
  description: string;
  bgClass: string;
  textClass: string;
  index?: number;
}) {
  return (
    <AnimatedMotionCard delay={index * 0.1} className="flex">
      <StandardCard className={`text-center ${bgClass} hover:shadow-md transition-all duration-200 flex-1`}>
        <CardContent className="p-4">
          <div className={`text-2xl font-bold ${textClass} mb-2`}>
            {value}
          </div>
          <div className="font-medium text-slate-900 dark:text-slate-100 text-sm mb-2">
            {label}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {description}
          </div>
        </CardContent>
      </StandardCard>
    </AnimatedMotionCard>
  );
}