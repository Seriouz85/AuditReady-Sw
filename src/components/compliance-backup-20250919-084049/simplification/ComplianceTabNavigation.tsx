import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Target, Zap } from 'lucide-react';

interface ComplianceTabNavigationProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const ComplianceTabNavigation: React.FC<ComplianceTabNavigationProps> = ({
  activeTab,
  onTabChange
}) => {
  return (
    <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 rounded-2xl">
      <TabsTrigger value="overview" className="flex items-center space-x-1 sm:space-x-2 rounded-xl text-xs sm:text-sm">
        <Eye className="w-4 h-4" />
        <span>Overview</span>
      </TabsTrigger>
      <TabsTrigger value="mapping" className="flex items-center space-x-1 sm:space-x-2 rounded-xl text-xs sm:text-sm">
        <Target className="w-4 h-4" />
        <span>Framework Mapping</span>
      </TabsTrigger>
      <TabsTrigger value="unified" className="flex items-center space-x-1 sm:space-x-2 rounded-xl text-xs sm:text-sm">
        <Zap className="w-4 h-4" />
        <span>Unified Requirements</span>
      </TabsTrigger>
      <TabsTrigger value="overlap" className="flex items-center space-x-1 sm:space-x-2 rounded-xl text-xs sm:text-sm">
        <Eye className="w-4 h-4" />
        <span>Framework Overlap</span>
      </TabsTrigger>
    </TabsList>
  );
};