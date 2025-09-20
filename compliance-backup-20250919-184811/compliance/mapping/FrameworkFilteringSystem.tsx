import React from 'react';
import { motion } from 'framer-motion';
import { Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FrameworkFilteringSystemProps {
  frameworkFilter: string;
  setFrameworkFilter: (filter: string) => void;
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
  categoryMappings: any[];
  frameworksSelected: Record<string, any>;
}

export const FrameworkFilteringSystem: React.FC<FrameworkFilteringSystemProps> = ({
  frameworkFilter,
  setFrameworkFilter,
  categoryFilter,
  setCategoryFilter,
  categoryMappings,
  frameworksSelected
}) => {
  const hasSelectedFrameworks = Object.values(frameworksSelected).some(Boolean);

  const frameworkFilterOptions = [
    { value: 'all', label: 'All Frameworks', count: 0 },
    { value: 'iso27001', label: 'ISO 27001', count: 0, enabled: frameworksSelected.iso27001 },
    { value: 'iso27002', label: 'ISO 27002', count: 0, enabled: frameworksSelected.iso27002 },
    { value: 'cis', label: 'CIS Controls', count: 0, enabled: frameworksSelected.cisControls },
    { value: 'gdpr', label: 'GDPR', count: 0, enabled: frameworksSelected.gdpr },
    { value: 'nis2', label: 'NIS2', count: 0, enabled: frameworksSelected.nis2 },
    { value: 'dora', label: 'DORA', count: 0, enabled: frameworksSelected.dora }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Filter className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filter Category Mappings
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Framework Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by Framework
          </label>
          <div className="flex flex-wrap gap-2">
            {frameworkFilterOptions.map((option) => {
              const isActive = frameworkFilter === option.value;
              const isEnabled = option.value === 'all' || option.enabled;
              
              return (
                <motion.button
                  key={option.value}
                  whileHover={isEnabled ? { scale: 1.02 } : {}}
                  whileTap={isEnabled ? { scale: 0.98 } : {}}
                  onClick={() => isEnabled && setFrameworkFilter(option.value)}
                  disabled={!isEnabled}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-md'
                      : isEnabled
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {option.label}
                </motion.button>
              );
            })}
          </div>
          {!hasSelectedFrameworks && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Select frameworks above to enable filtering
            </p>
          )}
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by Category
          </label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-white dark:bg-slate-800">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryMappings.map((mapping) => (
                <SelectItem key={mapping.id} value={mapping.id}>
                  {mapping.category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(frameworkFilter !== 'all' || categoryFilter !== 'all') && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Active Filters:
              </span>
              <div className="flex flex-wrap gap-1">
                {frameworkFilter !== 'all' && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs">
                    {frameworkFilterOptions.find(opt => opt.value === frameworkFilter)?.label}
                  </span>
                )}
                {categoryFilter !== 'all' && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs">
                    {categoryMappings.find(mapping => mapping.id === categoryFilter)?.category}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFrameworkFilter('all');
                setCategoryFilter('all');
              }}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};