import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cleanMarkdownFormatting } from '@/utils/textFormatting';

interface DynamicColumnsLayoutProps {
  filteredCategoryMappings: any[];
  frameworksSelected: Record<string, any>;
  getFrameworkBadges: (mapping: any) => Array<{ name: string; color: string }>;
  selectedMapping: string | null;
  setSelectedMapping: (id: string | null) => void;
}

export const DynamicColumnsLayout: React.FC<DynamicColumnsLayoutProps> = ({
  filteredCategoryMappings,
  frameworksSelected,
  getFrameworkBadges,
  selectedMapping,
  setSelectedMapping
}) => {
  // Calculate dynamic grid columns based on selected frameworks
  const getGridCols = () => {
    const selectedCount = Object.values(frameworksSelected).filter(Boolean).length;
    if (selectedCount === 0) return 'grid-cols-1';
    if (selectedCount === 1) return 'grid-cols-1 lg:grid-cols-1';
    if (selectedCount === 2) return 'grid-cols-1 lg:grid-cols-2';
    if (selectedCount === 3) return 'grid-cols-1 lg:grid-cols-3';
    if (selectedCount === 4) return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-4';
    if (selectedCount === 5) return 'grid-cols-1 lg:grid-cols-3 xl:grid-cols-5';
    return 'grid-cols-1 lg:grid-cols-3 xl:grid-cols-6';
  };

  // Framework specific colors - Darkened for better visibility
  const frameworkColors = {
    iso27001: 'border-blue-500 bg-blue-100 dark:bg-blue-950/50',
    iso27002: 'border-green-500 bg-green-100 dark:bg-green-950/50',
    cisControls: 'border-purple-500 bg-purple-100 dark:bg-purple-950/50',
    gdpr: 'border-orange-500 bg-orange-100 dark:bg-orange-950/50',
    nis2: 'border-indigo-500 bg-indigo-100 dark:bg-indigo-950/50',
    dora: 'border-red-500 bg-red-100 dark:bg-red-950/50'
  };

  const frameworkTitles = {
    iso27001: 'ISO 27001',
    iso27002: 'ISO 27002',
    cisControls: 'CIS Controls',
    gdpr: 'GDPR',
    nis2: 'NIS2',
    dora: 'DORA'
  };

  if (filteredCategoryMappings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium mb-2">No categories match your selection</p>
          <p className="text-sm">Try selecting different frameworks or adjusting your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filteredCategoryMappings.map((mapping, index) => (
        <motion.div
          key={mapping.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`border-2 rounded-xl transition-all duration-300 ${
            selectedMapping === mapping.id
              ? 'border-blue-500 shadow-lg shadow-blue-500/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
          }`}
        >
          {/* Category Header */}
          <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-t-xl border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {mapping.category}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {cleanMarkdownFormatting(mapping.description || 'No description available')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {getFrameworkBadges(mapping).map((badge, i) => (
                    <Badge key={i} variant="outline" className={badge.color}>
                      {badge.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.values(mapping.frameworks || {}).reduce((total: number, reqs: any) => 
                    total + (Array.isArray(reqs) ? reqs.length : 0), 0
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">requirements</div>
              </div>
            </div>
          </div>

          {/* Dynamic Framework Columns */}
          <div className={`grid ${getGridCols()} gap-0`}>
            {/* Show columns only for selected frameworks */}
            {frameworksSelected.iso27001 && (
              <div className={`p-4 border-r border-slate-200 dark:border-slate-700 last:border-r-0 ${frameworkColors.iso27001}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 text-sm">
                    {frameworkTitles.iso27001}
                  </h4>
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-200 dark:bg-blue-900/50 px-2 py-1 rounded">
                    {(mapping.frameworks?.iso27001 || []).length} reqs
                  </span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 dark:scrollbar-thumb-blue-600">
                  {(mapping.frameworks?.iso27001 || []).map((req: any, i: number) => (
                    <div key={i} className="p-2 bg-white/90 dark:bg-slate-800/90 rounded border border-blue-300 dark:border-blue-600">
                      <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                        {req.code || req.id}
                      </div>
                      <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {cleanMarkdownFormatting(req.title || req.description || 'No description')}
                      </div>
                    </div>
                  ))}
                  {(mapping.frameworks?.iso27001 || []).length === 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                      No requirements for this category
                    </div>
                  )}
                </div>
              </div>
            )}

            {frameworksSelected.iso27002 && (
              <div className={`p-4 border-r border-slate-200 dark:border-slate-700 last:border-r-0 ${frameworkColors.iso27002}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 text-sm">
                    {frameworkTitles.iso27002}
                  </h4>
                  <span className="text-xs font-medium text-green-700 dark:text-green-300 bg-green-200 dark:bg-green-900/50 px-2 py-1 rounded">
                    {(mapping.frameworks?.iso27002 || []).length} reqs
                  </span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-green-300 dark:scrollbar-thumb-green-600">
                  {(mapping.frameworks?.iso27002 || []).map((req: any, i: number) => (
                    <div key={i} className="p-2 bg-white/90 dark:bg-slate-800/90 rounded border border-green-300 dark:border-green-600">
                      <div className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                        {req.code || req.id}
                      </div>
                      <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {cleanMarkdownFormatting(req.title || req.description || 'No description')}
                      </div>
                    </div>
                  ))}
                  {(mapping.frameworks?.iso27002 || []).length === 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                      No requirements for this category
                    </div>
                  )}
                </div>
              </div>
            )}

            {frameworksSelected.cisControls && (
              <div className={`p-4 border-r border-slate-200 dark:border-slate-700 last:border-r-0 ${frameworkColors.cisControls}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 text-sm">
                    {frameworkTitles.cisControls} {frameworksSelected.cisControls ? frameworksSelected.cisControls.toUpperCase() : 'IG3'}
                  </h4>
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-200 dark:bg-purple-900/50 px-2 py-1 rounded">
                    {(mapping.frameworks?.cisControls || []).length} reqs
                  </span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 dark:scrollbar-thumb-purple-600">
                  {(mapping.frameworks?.cisControls || []).map((req: any, i: number) => (
                    <div key={i} className="p-2 bg-white/90 dark:bg-slate-800/90 rounded border border-purple-300 dark:border-purple-600">
                      <div className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                        {req.code || req.id}
                      </div>
                      <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {cleanMarkdownFormatting(req.title || req.description || 'No description')}
                      </div>
                    </div>
                  ))}
                  {(mapping.frameworks?.cisControls || []).length === 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                      No requirements for this category
                    </div>
                  )}
                </div>
              </div>
            )}

            {frameworksSelected.gdpr && (
              <div className={`p-4 border-r border-slate-200 dark:border-slate-700 last:border-r-0 ${frameworkColors.gdpr}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200 text-sm">
                    {frameworkTitles.gdpr}
                  </h4>
                  <span className="text-xs font-medium text-orange-700 dark:text-orange-300 bg-orange-200 dark:bg-orange-900/50 px-2 py-1 rounded">
                    {(mapping.frameworks?.gdpr || []).length} reqs
                  </span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-300 dark:scrollbar-thumb-orange-600">
                  {(mapping.frameworks?.gdpr || []).map((req: any, i: number) => (
                    <div key={i} className="p-2 bg-white/90 dark:bg-slate-800/90 rounded border border-orange-300 dark:border-orange-600">
                      <div className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-1">
                        {req.code || req.id}
                      </div>
                      <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {cleanMarkdownFormatting(req.title || req.description || 'No description')}
                      </div>
                    </div>
                  ))}
                  {(mapping.frameworks?.gdpr || []).length === 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                      No requirements for this category
                    </div>
                  )}
                </div>
              </div>
            )}

            {frameworksSelected.nis2 && (
              <div className={`p-4 border-r border-slate-200 dark:border-slate-700 last:border-r-0 ${frameworkColors.nis2}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-indigo-800 dark:text-indigo-200 text-sm">
                    {frameworkTitles.nis2}
                  </h4>
                  <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-200 dark:bg-indigo-900/50 px-2 py-1 rounded">
                    {(mapping.frameworks?.nis2 || []).length} reqs
                  </span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 dark:scrollbar-thumb-indigo-600">
                  {(mapping.frameworks?.nis2 || []).map((req: any, i: number) => (
                    <div key={i} className="p-2 bg-white/90 dark:bg-slate-800/90 rounded border border-indigo-300 dark:border-indigo-600">
                      <div className="text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-1">
                        {req.code || req.id}
                      </div>
                      <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {cleanMarkdownFormatting(req.title || req.description || 'No description')}
                      </div>
                    </div>
                  ))}
                  {(mapping.frameworks?.nis2 || []).length === 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                      No requirements for this category
                    </div>
                  )}
                </div>
              </div>
            )}

            {frameworksSelected.dora && (
              <div className={`p-4 ${frameworkColors.dora}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 text-sm">
                    {frameworkTitles.dora}
                  </h4>
                  <span className="text-xs font-medium text-red-700 dark:text-red-300 bg-red-200 dark:bg-red-900/50 px-2 py-1 rounded">
                    {(mapping.frameworks?.dora || []).length} reqs
                  </span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-red-300 dark:scrollbar-thumb-red-600">
                  {(mapping.frameworks?.dora || []).map((req: any, i: number) => (
                    <div key={i} className="p-2 bg-white/90 dark:bg-slate-800/90 rounded border border-red-300 dark:border-red-600">
                      <div className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">
                        {req.code || req.id}
                      </div>
                      <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {cleanMarkdownFormatting(req.title || req.description || 'No description')}
                      </div>
                    </div>
                  ))}
                  {(mapping.frameworks?.dora || []).length === 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                      No requirements for this category
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};