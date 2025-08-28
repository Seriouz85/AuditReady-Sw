import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Target, 
  Zap,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UnifiedRequirement } from '@/services/compliance/DynamicContentGenerator';
import { FrameworkReference } from '@/services/compliance/ContentDeduplicator';

interface UnifiedRequirementsDisplayProps {
  category: string;
  requirements: UnifiedRequirement[];
  references: FrameworkReference[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onShowGuidance: () => void;
}

export function UnifiedRequirementsDisplay({
  category,
  requirements,
  references,
  searchTerm,
  onSearchChange,
  onShowGuidance
}: UnifiedRequirementsDisplayProps) {
  
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [frameworkFilter, setFrameworkFilter] = useState<string>('all');
  const [expandedRequirements, setExpandedRequirements] = useState<Set<string>>(new Set());

  const toggleRequirement = (requirementId: string) => {
    setExpandedRequirements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requirementId)) {
        newSet.delete(requirementId);
      } else {
        newSet.add(requirementId);
      }
      return newSet;
    });
  };

  const filteredRequirements = requirements.filter(req => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        req.title.toLowerCase().includes(searchLower) ||
        req.description.toLowerCase().includes(searchLower) ||
        req.frameworks.some(fw => fw.toLowerCase().includes(searchLower)) ||
        req.subRequirements.some(sub => sub.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      if (priorityFilter === 'high' && req.priority < 80) return false;
      if (priorityFilter === 'medium' && (req.priority >= 80 || req.priority < 60)) return false;
      if (priorityFilter === 'low' && req.priority >= 60) return false;
    }

    // Framework filter
    if (frameworkFilter !== 'all' && !req.frameworks.includes(frameworkFilter)) {
      return false;
    }

    return true;
  });

  const getAvailableFrameworks = () => {
    const frameworks = new Set<string>();
    requirements.forEach(req => req.frameworks.forEach(fw => frameworks.add(fw)));
    return Array.from(frameworks).sort();
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 80) return 'text-red-400 bg-red-500/20 border-red-500/30';
    if (priority >= 60) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-green-400 bg-green-500/20 border-green-500/30';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 80) return 'High';
    if (priority >= 60) return 'Medium';
    return 'Low';
  };

  const getPriorityIcon = (priority: number) => {
    if (priority >= 80) return AlertCircle;
    if (priority >= 60) return Target;
    return CheckCircle;
  };

  const getStats = () => {
    return {
      total: filteredRequirements.length,
      high: filteredRequirements.filter(req => req.priority >= 80).length,
      medium: filteredRequirements.filter(req => req.priority >= 60 && req.priority < 80).length,
      low: filteredRequirements.filter(req => req.priority < 60).length
    };
  };

  const stats = getStats();

  if (!requirements.length) {
    return (
      <Card className="bg-black/40 backdrop-blur-md border-gray-800/50">
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            No Requirements Available
          </h3>
          <p className="text-gray-500">
            Select frameworks to see unified requirements for this category.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-black/40 backdrop-blur-md border-gray-800/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-cyan-400 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {category} Requirements
            </CardTitle>
            <Button
              onClick={onShowGuidance}
              variant="outline"
              size="sm"
              className="text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/10"
            >
              View Guidance
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-gray-400">Total Requirements</div>
            </div>
            <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <div className="text-2xl font-bold text-red-400">{stats.high}</div>
              <div className="text-xs text-red-300">High Priority</div>
            </div>
            <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
              <div className="text-2xl font-bold text-yellow-400">{stats.medium}</div>
              <div className="text-xs text-yellow-300">Medium Priority</div>
            </div>
            <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
              <div className="text-2xl font-bold text-green-400">{stats.low}</div>
              <div className="text-xs text-green-300">Low Priority</div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search requirements..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-700"
              />
            </div>

            <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
              <SelectTrigger className="bg-gray-900/50 border-gray-700">
                <SelectValue placeholder="Priority filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>

            <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
              <SelectTrigger className="bg-gray-900/50 border-gray-700">
                <SelectValue placeholder="Framework filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frameworks</SelectItem>
                {getAvailableFrameworks().map(framework => (
                  <SelectItem key={framework} value={framework}>{framework}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requirements List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredRequirements.map((requirement, index) => {
            const isExpanded = expandedRequirements.has(requirement.id);
            const PriorityIcon = getPriorityIcon(requirement.priority);

            return (
              <motion.div
                key={requirement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="bg-black/40 backdrop-blur-md border-gray-800/50 hover:bg-black/60 transition-colors">
                  <CardContent className="p-4">
                    <div 
                      className="flex items-start gap-4 cursor-pointer"
                      onClick={() => toggleRequirement(requirement.id)}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <PriorityIcon className={`h-5 w-5 ${
                          requirement.priority >= 80 ? 'text-red-400' :
                          requirement.priority >= 60 ? 'text-yellow-400' : 'text-green-400'
                        }`} />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-white">{requirement.title}</h3>
                            <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                              {requirement.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge 
                              variant="outline"
                              className={`text-xs ${getPriorityColor(requirement.priority)}`}
                            >
                              {getPriorityLabel(requirement.priority)}
                            </Badge>
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {requirement.frameworks.map(framework => (
                            <Badge 
                              key={framework}
                              variant="outline"
                              className={`text-xs ${
                                framework === 'ISO 27001' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                framework === 'ISO 27002' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                                framework.startsWith('CIS') ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                framework === 'GDPR' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                                framework === 'NIS2' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                                'bg-gray-500/20 text-gray-300 border-gray-500/30'
                              }`}
                            >
                              {framework}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 pt-4 border-t border-gray-800/50"
                        >
                          {requirement.subRequirements.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-cyan-400 text-sm">Implementation Details:</h4>
                              <ul className="space-y-1">
                                {requirement.subRequirements.map((subReq, idx) => (
                                  <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                    <span className="text-cyan-400 font-mono text-xs mt-0.5">•</span>
                                    <span>{subReq}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {requirement.references.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <h4 className="font-medium text-cyan-400 text-sm">Framework References:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {requirement.references.map(ref => (
                                  <div key={ref.framework} className="bg-gray-900/50 p-2 rounded text-xs">
                                    <div className="font-semibold text-white">{ref.framework}</div>
                                    <div className="text-gray-400">
                                      {ref.codes.join(', ')}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredRequirements.length === 0 && (
          <Card className="bg-black/40 backdrop-blur-md border-gray-800/50">
            <CardContent className="p-8 text-center">
              <Filter className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">
                No requirements match your filters
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}