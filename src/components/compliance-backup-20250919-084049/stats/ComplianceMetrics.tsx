/**
 * Compliance Stats & Metrics Components
 * Extracted from ComplianceSimplification.tsx stats patterns
 * CRITICAL: Preserves EXACT visual styling and calculations
 */

import React from 'react';
import { StatsGridItem } from '../shared/UnifiedStyledComponents';

/**
 * Stats data interface - EXACT preservation of data structure
 */
interface StatsData {
  value: string;
  label: string;
  description: string;
  bgClass: string;
  textClass: string;
}

/**
 * Main stats grid container - EXACT preservation of 4-column layout
 */
export function ComplianceStatsGrid({ 
  stats, 
  frameworkStats, 
  progressStats, 
  overlapStats 
}: { 
  stats?: StatsData[];
  frameworkStats?: StatsData[];
  progressStats?: StatsData[];
  overlapStats?: StatsData[];
}) {
  // Use stats if provided, otherwise combine the individual stat arrays
  const displayStats = stats || [...(frameworkStats || []), ...(progressStats || []), ...(overlapStats || [])];
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
      {displayStats.map((stat, index) => (
        <StatsGridItem
          key={index}
          value={stat.value}
          label={stat.label}
          description={stat.description}
          bgClass={stat.bgClass}
          textClass={stat.textClass}
          index={index}
        />
      ))}
    </div>
  );
}

/**
 * Framework counts stats generator - EXACT preservation of calculation logic
 */
export function generateFrameworkStats(frameworkCounts: any) {
  const stats: StatsData[] = [
    {
      value: frameworkCounts?.iso27001?.toString() || '0',
      label: 'ISO 27001',
      description: 'Information Security Management requirements',
      bgClass: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50',
      textClass: 'text-blue-600 dark:text-blue-400'
    },
    {
      value: frameworkCounts?.nis2?.toString() || '0',
      label: 'NIS2 Directive',
      description: 'Network and Information Security requirements',
      bgClass: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50',
      textClass: 'text-purple-600 dark:text-purple-400'
    },
    {
      value: frameworkCounts?.cis?.toString() || '0',
      label: 'CIS Controls',
      description: 'Cybersecurity implementation guidelines',
      bgClass: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50',
      textClass: 'text-green-600 dark:text-green-400'
    },
    {
      value: frameworkCounts?.nist?.toString() || '0',
      label: 'NIST Framework',
      description: 'Cybersecurity framework components',
      bgClass: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50',
      textClass: 'text-orange-600 dark:text-orange-400'
    }
  ];

  return stats;
}

/**
 * Progress metrics generator - EXACT preservation of percentage calculations
 */
export function generateProgressStats(
  unifiedMappings: any[], 
  generatedContent: Map<string, any>
) {
  const totalCategories = unifiedMappings.length;
  const completedCategories = Array.from(generatedContent.keys()).length;
  const completionPercentage = totalCategories > 0 ? Math.round((completedCategories / totalCategories) * 100) : 0;

  const stats: StatsData[] = [
    {
      value: totalCategories.toString(),
      label: 'Total Categories',
      description: 'Unified compliance categories available',
      bgClass: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/50 dark:to-slate-900/50',
      textClass: 'text-slate-600 dark:text-slate-400'
    },
    {
      value: completedCategories.toString(),
      label: 'Generated',
      description: 'Categories with generated content',
      bgClass: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50',
      textClass: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      value: `${completionPercentage}%`,
      label: 'Completion',
      description: 'Overall content generation progress',
      bgClass: 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50',
      textClass: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      value: (totalCategories - completedCategories).toString(),
      label: 'Remaining',
      description: 'Categories pending content generation',
      bgClass: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50',
      textClass: 'text-amber-600 dark:text-amber-400'
    }
  ];

  return stats;
}

/**
 * Framework overlap metrics - EXACT preservation of overlap calculation logic
 */
export function generateOverlapStats(mappingData: any) {
  // Preserve exact overlap calculation logic from original
  const totalMappings = mappingData?.length || 0;
  const uniqueRequirements = new Set();
  
  mappingData?.forEach((mapping: any) => {
    if (mapping.iso27001_requirement) uniqueRequirements.add(mapping.iso27001_requirement);
    if (mapping.nis2_requirement) uniqueRequirements.add(mapping.nis2_requirement);
    if (mapping.cis_control) uniqueRequirements.add(mapping.cis_control);
    if (mapping.nist_function) uniqueRequirements.add(mapping.nist_function);
  });

  const overlapPercentage = totalMappings > 0 ? Math.round(((totalMappings - uniqueRequirements.size) / totalMappings) * 100) : 0;

  const stats: StatsData[] = [
    {
      value: totalMappings.toString(),
      label: 'Total Mappings',
      description: 'Framework requirement mappings',
      bgClass: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50',
      textClass: 'text-blue-600 dark:text-blue-400'
    },
    {
      value: uniqueRequirements.size.toString(),
      label: 'Unique Requirements',
      description: 'Distinct compliance requirements',
      bgClass: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50',
      textClass: 'text-green-600 dark:text-green-400'
    },
    {
      value: `${overlapPercentage}%`,
      label: 'Overlap Rate',
      description: 'Framework requirement overlap',
      bgClass: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50',
      textClass: 'text-purple-600 dark:text-purple-400'
    },
    {
      value: (totalMappings - uniqueRequirements.size).toString(),
      label: 'Overlapping',
      description: 'Redundant requirements identified',
      bgClass: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50',
      textClass: 'text-orange-600 dark:text-orange-400'
    }
  ];

  return stats;
}