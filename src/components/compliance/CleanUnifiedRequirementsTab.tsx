import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Filter, 
  Shield, 
  Lock, 
  Settings, 
  BookOpen, 
  Lightbulb, 
  ArrowRight,
  Crown,
  Package,
  Key
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cleanUnifiedRequirementsEngine } from '@/services/compliance/CleanUnifiedRequirementsEngine';

// CISO-Grade Renderer for clean formatting
const CISOGradeRenderer: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;
  
  // Split content into sections and format appropriately
  const sections = content.split(/\n\n## /).filter(section => section.trim());
  
  return (
    <div className="space-y-6">
      {sections.map((section, index) => {
        // Handle first section (may not have ## prefix)
        const sectionContent = index === 0 && !section.startsWith('##') ? section : `## ${section}`;
        const lines = sectionContent.split('\n').filter(line => line.trim());
        
        return (
          <div key={index} className="space-y-3">
            {lines.map((line, lineIndex) => {
              const trimmed = line.trim();
              if (!trimmed) return null;
              
              // Section headers (## Title)
              if (trimmed.startsWith('## ')) {
                return (
                  <h4 key={lineIndex} className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mt-6">
                    {trimmed.substring(3)}
                  </h4>
                );
              }
              
              // Sub-requirement letters (a., b., c.)
              const letterMatch = trimmed.match(/^([a-z])\.\s+(.+)$/);
              if (letterMatch) {
                return (
                  <div key={lineIndex} className="mt-4">
                    <div className="font-semibold text-gray-900 dark:text-white mb-2">
                      {letterMatch[1]}. {letterMatch[2]}
                    </div>
                  </div>
                );
              }
              
              // Framework References
              if (trimmed.startsWith('**Framework References:')) {
                return (
                  <div key={lineIndex} className="mt-3 mb-2">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      Framework References:
                    </span>
                  </div>
                );
              }
              
              // Framework reference lines
              if (trimmed.match(/^\s*(ISO|GDPR|NIS2|DORA|CIS)/)) {
                return (
                  <div key={lineIndex} className="ml-4 text-blue-600 dark:text-blue-400 text-sm">
                    {trimmed}
                  </div>
                );
              }
              
              // Regular content paragraphs
              return (
                <div key={lineIndex} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {trimmed}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

interface CleanUnifiedRequirementsTabProps {
  organizationId: string;
  selectedFrameworkIds: string[];
  selectedFrameworks: Record<string, any>;
  unifiedCategoryFilter: string;
  setUnifiedCategoryFilter: (value: string) => void;
  setSelectedGuidanceCategory: (value: string) => void;
  setShowUnifiedGuidance: (value: boolean) => void;
  showGeneration?: boolean;
  isGenerating?: boolean;
}

export const CleanUnifiedRequirementsTab: React.FC<CleanUnifiedRequirementsTabProps> = ({
  organizationId,
  selectedFrameworkIds,
  selectedFrameworks,
  unifiedCategoryFilter,
  setUnifiedCategoryFilter,
  setSelectedGuidanceCategory,
  setShowUnifiedGuidance,
  showGeneration = false,
  isGenerating = false,
}) => {
  const [unifiedCategories, setUnifiedCategories] = React.useState<any[]>([]);
  const [loadingGeneration, setLoadingGeneration] = React.useState(false);
  const [generationStats, setGenerationStats] = React.useState<any>(null);

  // Generate unified requirements when frameworks change
  React.useEffect(() => {
    const generateUnifiedRequirements = async () => {
      if (selectedFrameworkIds.length === 0) {
        setUnifiedCategories([]);
        setGenerationStats(null);
        return;
      }

      setLoadingGeneration(true);
      try {
        console.log('🚀 Generating clean unified requirements...');
        const result = await cleanUnifiedRequirementsEngine.generateUnifiedRequirements(
          organizationId,
          selectedFrameworkIds
        );
        
        setUnifiedCategories(result.categories);
        setGenerationStats(result.consolidationStats);
        console.log('✅ Clean unified requirements generated:', result);
      } catch (error) {
        console.error('❌ Error generating unified requirements:', error);
        setUnifiedCategories([]);
        setGenerationStats(null);
      } finally {
        setLoadingGeneration(false);
      }
    };

    generateUnifiedRequirements();
  }, [organizationId, selectedFrameworkIds]);

  // Filter categories based on filter selection
  const filteredCategories = React.useMemo(() => {
    if (unifiedCategoryFilter === 'all') {
      return unifiedCategories;
    }
    return unifiedCategories.filter(category => category.name === unifiedCategoryFilter);
  }, [unifiedCategories, unifiedCategoryFilter]);

  // Icon mapping
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      'Crown': Crown,
      'Shield': Shield,
      'Package': Package,
      'Key': Key,
      'Lock': Lock,
      'Settings': Settings,
      'BookOpen': BookOpen,
    };
    const IconComponent = iconMap[iconName] || Settings;
    return <IconComponent className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 dark:border-slate-700 rounded-xl">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-t-2xl">
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Clean Unified Requirements</h2>
              <p className="text-sm text-white/80 font-normal">AI-powered intelligent text consolidation</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          {/* Framework Integration Overview */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Filter className="w-5 h-5 mr-2 text-blue-600" />
                Clean Framework Integration
              </h3>
              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400">Generated Categories</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {unifiedCategories.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">unified categories</div>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Clean unified requirements generated from your selected compliance frameworks using intelligent text consolidation without external AI APIs:
            </p>
            
            {generationStats && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Intelligent Text Consolidation Complete
                  </span>
                </div>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  {Math.round(generationStats.reductionRatio * 100)}% text reduction achieved through semantic analysis
                </p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {selectedFrameworks['iso27001'] && (
                <Badge className="bg-blue-500 text-white px-3 py-1">
                  <Shield className="w-3 h-3 mr-1" />
                  ISO 27001
                </Badge>
              )}
              {selectedFrameworks['iso27002'] && (
                <Badge className="bg-green-500 text-white px-3 py-1">
                  <Lock className="w-3 h-3 mr-1" />
                  ISO 27002
                </Badge>
              )}
              {selectedFrameworks['cisControls'] && (
                <Badge className="bg-purple-500 text-white px-3 py-1">
                  <Settings className="w-3 h-3 mr-1" />
                  CIS Controls {selectedFrameworks['cisControls'].toUpperCase()}
                </Badge>
              )}
              {selectedFrameworks['gdpr'] && (
                <Badge className="bg-orange-500 text-white px-3 py-1">
                  <BookOpen className="w-3 h-3 mr-1" />
                  GDPR
                </Badge>
              )}
              {selectedFrameworks['nis2'] && (
                <Badge className="bg-indigo-500 text-white px-3 py-1">
                  <Shield className="w-3 h-3 mr-1" />
                  NIS2
                </Badge>
              )}
              {selectedFrameworks['dora'] && (
                <Badge className="bg-red-500 text-white px-3 py-1">
                  <Shield className="w-3 h-3 mr-1" />
                  DORA
                </Badge>
              )}
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">{unifiedCategories.length}</div>
                <div className="text-gray-600 dark:text-gray-400">Total Categories</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-600">
                  {unifiedCategories.reduce((total, category) => total + category.totalRequirements, 0)}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Original Requirements Consolidated</div>
              </div>
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Filter Categories:</span>
            </div>
            <Select 
              value={unifiedCategoryFilter}
              onValueChange={setUnifiedCategoryFilter}
            >
              <SelectTrigger className="w-full max-w-lg mt-2">
                <SelectValue placeholder="Filter requirement categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {unifiedCategories.map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Loading State */}
          {loadingGeneration && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Generating clean unified requirements...</p>
              </div>
            </div>
          )}

          {/* Categories Display */}
          <div className="space-y-6">
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.name}
                id={`unified-${category.name.replace(/\s+/g, '-').toLowerCase()}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        {getIconComponent(category.icon)}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-xs text-green-600 font-medium">Clean Generated</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {category.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {category.name}
                      </Badge>
                      {category.frameworks.map((framework: string) => (
                        <Badge key={framework} variant="outline" className="text-xs">
                          {framework}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mb-2 text-xs px-3 py-1 text-emerald-700 border-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-500 dark:hover:bg-emerald-900/20"
                      onClick={() => {
                        setSelectedGuidanceCategory(category.name);
                        setShowUnifiedGuidance(true);
                      }}
                    >
                      <Lightbulb className="w-3 h-3 mr-1" />
                      Unified Guidance
                    </Button>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Consolidates</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {category.totalRequirements}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">original requirements</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      From {category.frameworks.length} framework{category.frameworks.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                
                {/* Clean Consolidated Content */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Consolidated Requirements:</h4>
                  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="prose dark:prose-invert max-w-none">
                      <CISOGradeRenderer content={category.consolidatedContent} />
                    </div>
                    
                    {/* Framework References */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h5 className="font-semibold text-blue-600 dark:text-blue-400 mb-3">Framework References:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.frameworks.map((framework: string, idx: number) => (
                          <div key={idx} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                            <div className="font-medium text-blue-800 dark:text-blue-200">
                              {framework}
                            </div>
                            <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                              {category.requirements.filter((req: any) => req.framework === framework).length} requirements consolidated
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Statistics */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Consolidation Statistics:</h5>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <div className="text-2xl font-bold text-blue-600">{category.totalRequirements}</div>
                          <div className="text-xs text-gray-500">Original Requirements</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <div className="text-2xl font-bold text-green-600">{category.frameworks.length}</div>
                          <div className="text-xs text-gray-500">Frameworks</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round(((category.originalLength - category.consolidatedLength) / category.originalLength) * 100)}%
                          </div>
                          <div className="text-xs text-gray-500">Text Reduction</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Generation Overlay */}
      <AnimatePresence>
        {showGeneration && isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4"
            >
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-800"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                  </motion.div>
                  <motion.div
                    className="absolute inset-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute inset-6 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Zap className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
                
                <motion.h3
                  className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  Generating Clean Unified Requirements
                </motion.h3>
                
                <motion.p
                  className="text-gray-600 dark:text-gray-400 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Intelligent text consolidation is analyzing your selected frameworks...
                </motion.p>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};