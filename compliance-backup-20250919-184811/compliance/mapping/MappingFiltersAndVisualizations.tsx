/**
 * Mapping Filters and Visualizations
 * Extracted from ComplianceSimplification.tsx to reduce complexity
 * 
 * FEATURES:
 * - Framework filtering buttons
 * - Category filtering dropdown
 * - Visual framework connections display
 * - Animated mapping cards
 * - Framework-specific layouts (GDPR vs others)
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Filter,
  Target,
  Shield,
  Lock,
  Settings,
  BookOpen,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { cleanMarkdownFormatting } from '@/utils/textFormatting';
import type { SelectedFrameworks } from '@/utils/FrameworkUtilities';

// Types for mapping and requirement objects
interface Requirement {
  code: string;
  title: string;
}

interface Mapping {
  id: string;
  category: string;
  frameworks: {
    [key: string]: Requirement[];
  };
  auditReadyUnified: {
    description: string;
    subRequirements?: string[];
  };
}

interface CategoryOption {
  id: string;
  category: string;
}

export interface MappingFiltersAndVisualizationsProps {
  filterFramework: string;
  setFilterFramework: (framework: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  filteredMappings: Mapping[];
  categoryOptions: CategoryOption[];
  selectedFrameworks: SelectedFrameworks;
}

export function MappingFiltersAndVisualizations({
  filterFramework,
  setFilterFramework,
  filterCategory,
  setFilterCategory,
  filteredMappings,
  categoryOptions,
  selectedFrameworks
}: MappingFiltersAndVisualizationsProps) {

  const frameworkFilters = [
    { id: 'all', label: 'All Frameworks', icon: <Target className="w-4 h-4" /> },
    { id: 'iso27001', label: 'ISO 27001', icon: <Shield className="w-4 h-4" /> },
    { id: 'iso27002', label: 'ISO 27002', icon: <Lock className="w-4 h-4" /> },
    { id: 'cis', label: 'CIS Controls', icon: <Settings className="w-4 h-4" /> },
    { id: 'gdpr', label: 'GDPR', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'nis2', label: 'NIS2', icon: <Shield className="w-4 h-4" /> },
    { id: 'dora', label: 'DORA', icon: <Shield className="w-4 h-4" /> }
  ];

  return (
    <>
      {/* Filters */}
      <div className="space-y-4">
        {/* Framework Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium">Filter by Framework:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {frameworkFilters.map((filter) => (
              <Button
                key={filter.id}
                variant={filterFramework === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterFramework(filter.id)}
                className="flex items-center space-x-1 rounded-full"
              >
                {filter.icon}
                <span>{filter.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-col space-y-2 sm:flex-row sm:flex-wrap sm:gap-4 sm:items-center sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium">Filter by Category:</span>
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-[400px] max-w-lg">
              <SelectValue placeholder="Select a category to filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryOptions.map((mapping) => (
                <SelectItem key={mapping.id} value={mapping.id}>
                  {mapping.category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Visual Framework Connections */}
      <div className="space-y-8">
        <AnimatePresence>
          {filteredMappings.map((mapping, index) => (
            <motion.div
              key={mapping.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <Card className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold">{mapping.category}</h3>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Framework Grid - Different layout for GDPR vs other frameworks */}
                  {mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948' ? (
                    /* GDPR-only layout */
                    <div className="border-b border-slate-200 dark:border-slate-700">
                      <div className="p-4 sm:p-6 bg-orange-50 dark:bg-orange-900/10">
                        <div className="flex items-center space-x-2 mb-4">
                          <BookOpen className="w-5 h-5 text-orange-600" />
                          <h4 className="font-semibold text-orange-900 dark:text-orange-100">GDPR Articles</h4>
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-100 dark:scrollbar-thumb-orange-600 dark:scrollbar-track-orange-900">
                          {(mapping.frameworks['gdpr'] || []).map((req: Requirement, i: number) => (
                            <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-orange-200 dark:border-orange-700">
                              <div className="font-medium text-sm text-orange-900 dark:text-orange-100">{req.code}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{req.title}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Regular layout for ISO/CIS/NIS2 frameworks - Only show selected frameworks */
                    <div className={`grid gap-0 border-b border-slate-200 dark:border-slate-700 grid-cols-1 ${
                      (() => {
                        const activeFrameworks = Object.keys(selectedFrameworks).filter(fw => selectedFrameworks[fw as keyof SelectedFrameworks]);
                        return activeFrameworks.length === 1 ? 'grid-cols-1' :
                               activeFrameworks.length === 2 ? 'grid-cols-2' :
                               activeFrameworks.length === 3 ? 'grid-cols-3' :
                               'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
                      })()
                    }`}>
                      {/* ISO 27001 */}
                      {selectedFrameworks['iso27001'] && (
                        <div className="p-4 sm:p-6 bg-blue-50 dark:bg-blue-900/10 border-r border-slate-200 dark:border-slate-700 last:border-r-0">
                          <div className="flex items-center space-x-2 mb-4">
                            <Shield className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100">ISO 27001</h4>
                            <Badge className="bg-blue-500 text-white text-xs">
                              {(mapping.frameworks['iso27001'] || []).length}
                            </Badge>
                          </div>
                          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100 dark:scrollbar-thumb-blue-600 dark:scrollbar-track-blue-900">
                            {(mapping.frameworks['iso27001'] || []).map((req: Requirement, i: number) => (
                              <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700">
                                <div className="font-medium text-sm text-blue-900 dark:text-blue-100">{req.code}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{req.title}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ISO 27002 */}
                      {selectedFrameworks['iso27002'] && (
                        <div className="p-4 sm:p-6 bg-green-50 dark:bg-green-900/10 border-r border-slate-200 dark:border-slate-700 last:border-r-0">
                          <div className="flex items-center space-x-2 mb-4">
                            <Lock className="w-5 h-5 text-green-600" />
                            <h4 className="font-semibold text-green-900 dark:text-green-100">ISO 27002</h4>
                            <Badge className="bg-green-500 text-white text-xs">
                              {(mapping.frameworks['iso27002'] || []).length}
                            </Badge>
                          </div>
                          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-green-100 dark:scrollbar-thumb-green-600 dark:scrollbar-track-green-900">
                            {(mapping.frameworks['iso27002'] || []).map((req: Requirement, i: number) => (
                              <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-700">
                                <div className="font-medium text-sm text-green-900 dark:text-green-100">{req.code}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{req.title}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CIS Controls */}
                      {selectedFrameworks['cisControls'] && (
                        <div className="p-4 sm:p-6 bg-purple-50 dark:bg-purple-900/10 border-r border-slate-200 dark:border-slate-700 last:border-r-0">
                          <div className="flex items-center space-x-2 mb-4">
                            <Settings className="w-5 h-5 text-purple-600" />
                            <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                              CIS Controls {selectedFrameworks['cisControls'] && selectedFrameworks['cisControls'] !== null ? selectedFrameworks['cisControls'].toString().toUpperCase() : ''}
                            </h4>
                            <Badge className="bg-purple-500 text-white text-xs">
                              {(mapping.frameworks['cisControls'] || []).length}
                            </Badge>
                          </div>
                          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100 dark:scrollbar-thumb-purple-600 dark:scrollbar-track-purple-900">
                            {(mapping.frameworks['cisControls'] || []).map((req: Requirement, i: number) => (
                              <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-purple-200 dark:border-purple-700">
                                <div className="font-medium text-sm text-purple-900 dark:text-purple-100">{req.code}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{req.title}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* NIS2 */}
                      {selectedFrameworks['nis2'] && (
                        <div className="p-4 sm:p-6 bg-indigo-50 dark:bg-indigo-900/10 border-r border-slate-200 dark:border-slate-700 last:border-r-0">
                          <div className="flex items-center space-x-2 mb-4">
                            <Shield className="w-5 h-5 text-indigo-600" />
                            <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">NIS2</h4>
                            <Badge className="bg-indigo-500 text-white text-xs">
                              {(mapping.frameworks['nis2'] || []).length}
                            </Badge>
                          </div>
                          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-indigo-100 dark:scrollbar-thumb-indigo-600 dark:scrollbar-track-indigo-900">
                            {(mapping.frameworks['nis2'] || []).map((req: Requirement, i: number) => (
                              <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                <div className="font-medium text-sm text-indigo-900 dark:text-indigo-100">{req.code}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{req.title}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* DORA */}
                      {selectedFrameworks['dora'] && (
                        <div className="p-4 sm:p-6 bg-red-50 dark:bg-red-900/10 border-r border-slate-200 dark:border-slate-700 last:border-r-0">
                          <div className="flex items-center space-x-2 mb-4">
                            <Shield className="w-5 h-5 text-red-600" />
                            <h4 className="font-semibold text-red-900 dark:text-red-100">DORA</h4>
                            <Badge className="bg-red-500 text-white text-xs">
                              {(mapping.frameworks['dora'] || []).length}
                            </Badge>
                          </div>
                          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-red-100 dark:scrollbar-thumb-red-600 dark:scrollbar-track-red-900">
                            {(mapping.frameworks['dora'] || []).map((req: Requirement, i: number) => (
                              <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-red-200 dark:border-red-700">
                                <div className="font-medium text-sm text-red-900 dark:text-red-100">{req.code}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{req.title}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AuditReady Unified Requirements Section */}
                  <div className="p-4 sm:p-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-orange-600" />
                        <h4 className="font-semibold text-orange-900 dark:text-orange-100">AuditReady Unified</h4>
                      </div>
                      <Badge className="bg-orange-500 text-white text-xs">
                        {mapping.auditReadyUnified.subRequirements?.length || 0} simplified
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {cleanMarkdownFormatting(mapping.auditReadyUnified.description)}
                      </p>
                      <div className="space-y-2">
                        {(mapping.auditReadyUnified.subRequirements || []).slice(0, 3).map((req: string, i: number) => (
                          <div key={i} className="flex items-start space-x-2 text-sm">
                            <ArrowRight className="w-3 h-3 text-orange-500 mt-1 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{req}</span>
                          </div>
                        ))}
                        {(mapping.auditReadyUnified.subRequirements || []).length > 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                            + {(mapping.auditReadyUnified.subRequirements || []).length - 3} more requirements...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

export default MappingFiltersAndVisualizations;