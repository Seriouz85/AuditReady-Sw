/**
 * Compliance Tab System Components
 * Extracted from ComplianceSimplification.tsx to reduce complexity
 * CRITICAL: Preserves EXACT visual styling and behavior
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Eye, FileSpreadsheet, Target, Zap } from 'lucide-react';

/**
 * Main compliance tabs container - EXACT preservation
 */
export function ComplianceTabSystem({ 
  activeTab, 
  onTabChange, 
  children 
}: {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <ComplianceTabsList />
      {children}
    </Tabs>
  );
}

/**
 * Tab list with EXACT styling preservation
 */
export function ComplianceTabsList() {
  return (
    <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 rounded-2xl">
      <ComplianceTabTrigger value="overview" icon={Eye} label="Overview" />
      <ComplianceTabTrigger value="mapping" icon={Target} label="Framework Mapping" />
      <ComplianceTabTrigger value="unified" icon={Zap} label="Unified Requirements" />
      <ComplianceTabTrigger value="overlap" icon={FileSpreadsheet} label="Framework Overlap" />
    </TabsList>
  );
}

/**
 * Individual tab trigger with icon and label - EXACT preservation
 */
function ComplianceTabTrigger({ 
  value, 
  icon: Icon, 
  label 
}: {
  value: string;
  icon: React.ComponentType<any>;
  label: string;
}) {
  return (
    <TabsTrigger 
      value={value} 
      className="flex items-center space-x-1 sm:space-x-2 rounded-xl text-xs sm:text-sm"
    >
      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label.split(' ')[0]}</span>
    </TabsTrigger>
  );
}

/**
 * Tab content wrapper - EXACT preservation
 */
export function ComplianceTabContent({ 
  value, 
  children, 
  className = '' 
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsContent value={value} className={`mt-6 ${className}`}>
      {children}
    </TabsContent>
  );
}

/**
 * Tab section header with optional badge - EXACT preservation
 */
export function TabSectionHeader({ 
  title, 
  badgeText, 
  badgeVariant = 'secondary' 
}: {
  title: string;
  badgeText?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
        {title}
      </h2>
      {badgeText && (
        <Badge variant={badgeVariant} className="text-xs">
          {badgeText}
        </Badge>
      )}
    </div>
  );
}