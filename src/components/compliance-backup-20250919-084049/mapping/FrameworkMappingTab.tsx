import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  CheckCircle, 
  Settings, 
  Shield, 
  Lock, 
  Eye,
  Target,
  Users,
  Building,
  AlertTriangle,
  TrendingUp,
  Database,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FrameworkSelection } from '@/types/ComplianceSimplificationTypes';

interface FrameworkMappingTabProps {
  // Generation state
  showGeneration: boolean;
  isGenerating: boolean;
  
  // Framework selection
  frameworksSelected: Record<string, any>;
  handleFrameworkToggle: (framework: string, value: any) => void;
  frameworkCounts: Record<string, number>;
  
  // Mapping state
  categoryMappings: any[];
  selectedFrameworks: FrameworkSelection;
  selectedMapping: string | null;
  setSelectedMapping: (id: string | null) => void;
  
  // Utility functions
  getFrameworkBadges: (mapping: any) => Array<{ name: string; color: string }>;
  
  // Loading states
  isLoadingCategoryMapping: boolean;
  
  // Generation function
  generateUnifiedRequirements: () => Promise<void>;
}

const FrameworkMappingTab: React.FC<FrameworkMappingTabProps> = ({
  showGeneration,
  isGenerating,
  frameworksSelected,
  handleFrameworkToggle,
  frameworkCounts,
  categoryMappings,
  selectedFrameworks = {
    iso27001: false,
    iso27002: false,
    cisControls: null,
    gdpr: false,
    nis2: false,
    dora: false
  },
  selectedMapping,
  setSelectedMapping,
  getFrameworkBadges,
  isLoadingCategoryMapping,
  generateUnifiedRequirements
}) => {
  // Local state for GitHub-style filtering
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [frameworkFilter, setFrameworkFilter] = React.useState('all');
  
  // Filter category mappings based on original complex logic from backup
  const filteredCategoryMappings = React.useMemo(() => {
    let filtered = categoryMappings || [];
    
    // Apply GDPR special filtering logic from original
    if (selectedFrameworks['gdpr'] && !selectedFrameworks['iso27001'] && !selectedFrameworks['iso27002'] && !selectedFrameworks['cisControls'] && !selectedFrameworks['nis2'] && !selectedFrameworks['dora']) {
      // Only GDPR selected - show only GDPR groups
      filtered = filtered.filter(mapping => mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948');
    } else if (!selectedFrameworks['gdpr'] && (selectedFrameworks['iso27001'] || selectedFrameworks['iso27002'] || selectedFrameworks['cisControls'] || selectedFrameworks['nis2'] || selectedFrameworks['dora'])) {
      // No GDPR selected but other frameworks - hide GDPR groups
      filtered = filtered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    } else if (selectedFrameworks['gdpr'] && (selectedFrameworks['iso27001'] || selectedFrameworks['iso27002'] || selectedFrameworks['cisControls'] || selectedFrameworks['nis2'] || selectedFrameworks['dora'])) {
      // Both GDPR and others selected - show all
      filtered = categoryMappings || [];
    } else {
      // Nothing selected - show non-GDPR groups by default
      filtered = filtered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    }

    // Filter by framework selection - apply framework content filtering
    filtered = filtered.map(mapping => {
      // For GDPR group, only show GDPR frameworks
      if (mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948') {
        if (!selectedFrameworks['gdpr']) return null;
        
        return {
          ...mapping,
          frameworks: {
            iso27001: [],
            iso27002: [],
            cisControls: [],
            nis2: [],
            gdpr: mapping.frameworks?.['gdpr'] || [],
            dora: []
          }
        };
      }
      
      // For non-GDPR groups, filter based on selected frameworks
      const newMapping = {
        ...mapping,
        frameworks: {
          iso27001: selectedFrameworks['iso27001'] ? (mapping.frameworks?.['iso27001'] || []) : [],
          iso27002: selectedFrameworks['iso27002'] ? (mapping.frameworks?.['iso27002'] || []) : [],
          cisControls: selectedFrameworks['cisControls'] ? (mapping.frameworks?.['cisControls'] || []) : [],
          gdpr: selectedFrameworks['gdpr'] ? (mapping.frameworks?.['gdpr'] || []) : [],
          nis2: selectedFrameworks['nis2'] ? (mapping.frameworks?.['nis2'] || []) : [],
          dora: selectedFrameworks['dora'] ? (mapping.frameworks?.['dora'] || []) : []
        }
      };
      
      // Only include if it has at least one framework with controls
      const hasControls = (newMapping.frameworks?.iso27001?.length || 0) > 0 || 
                         (newMapping.frameworks?.iso27002?.length || 0) > 0 || 
                         (newMapping.frameworks?.cisControls?.length || 0) > 0 ||
                         (newMapping.frameworks?.gdpr?.length || 0) > 0 ||
                         (newMapping.frameworks?.nis2?.length || 0) > 0 ||
                         (newMapping.frameworks?.dora?.length || 0) > 0;
      
      return hasControls ? newMapping : null;
    }).filter(mapping => mapping !== null);
    
    // Filter by traditional framework filter (for backwards compatibility)
    if (frameworkFilter !== 'all') {
      filtered = filtered.filter(mapping => {
        switch (frameworkFilter) {
          case 'iso27001':
            return (mapping.frameworks?.['iso27001']?.length || 0) > 0;
          case 'iso27002':
            return (mapping.frameworks?.['iso27002']?.length || 0) > 0;
          case 'cis':
            return (mapping.frameworks?.['cisControls']?.length || 0) > 0;
          case 'gdpr':
            return (mapping.frameworks['gdpr']?.length || 0) > 0;
          case 'nis2':
            return (mapping.frameworks['nis2']?.length || 0) > 0;
          case 'dora':
            return (mapping.frameworks['dora']?.length || 0) > 0;
          default:
            return true;
        }
      });
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(mapping => mapping.id === categoryFilter);
    }
    
    // Apply dynamic numbering: GDPR always comes last
    const nonGdprGroups = filtered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    const gdprGroups = filtered.filter(mapping => mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948');
    
    // Number non-GDPR groups sequentially
    const numberedNonGdpr = nonGdprGroups.map((mapping, index) => {
      const number = String(index + 1).padStart(2, '0');
      return {
        ...mapping,
        category: mapping.category.startsWith(number + '.') ? mapping.category : `${number}. ${mapping.category.replace(/^\d+\.\s*/, '')}`
      };
    });
    
    // Number GDPR groups to come after non-GDPR groups
    const numberedGdpr = gdprGroups.map((mapping) => {
      const number = String(nonGdprGroups.length + 1).padStart(2, '0');
      return {
        ...mapping,
        category: `${number}. ${mapping.category.replace(/^\d+\.\s*/, '')}`
      };
    });
    
    return [...numberedNonGdpr, ...numberedGdpr];
  }, [categoryMappings, selectedFrameworks, frameworkFilter, categoryFilter]);
  return (
    <TabsContent value="mapping" className="space-y-6">
      {/* Framework Selection Interface - Enhanced */}
      <div className="relative">
        {/* Enhanced AI Generation Overlay */}
        <AnimatePresence>
          {showGeneration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute inset-0 z-[10000] bg-white/98 dark:bg-gray-900/98 backdrop-blur-md rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-2xl flex flex-col items-center justify-center min-h-[400px]"
            >
              {/* Neural Network Animation Background */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <motion.div
                  animate={{ 
                    background: [
                      'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                      'radial-gradient(circle at 80% 50%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
                      'radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0"
                />
              </div>

              {/* Main Content */}
              <div className="relative z-10 flex flex-col items-center text-center px-8 py-6">
                {/* AI Icon with Enhanced Animation */}
                <motion.div
                  animate={{ 
                    scale: isGenerating ? [1, 1.15, 1] : [1],
                    rotate: isGenerating ? [0, 360] : [0],
                    boxShadow: isGenerating ? [
                      '0 0 20px rgba(59, 130, 246, 0.4)',
                      '0 0 40px rgba(147, 51, 234, 0.6)',
                      '0 0 20px rgba(59, 130, 246, 0.4)'
                    ] : ['0 0 20px rgba(34, 197, 94, 0.4)']
                  }}
                  transition={{ 
                    duration: isGenerating ? 3 : 1,
                    repeat: isGenerating ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                  className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center mb-6 border-4 border-white/20"
                >
                  <Zap className="w-10 h-10 text-white" />
                </motion.div>

                {/* Title with Typing Effect */}
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-bold text-gray-900 dark:text-white mb-3"
                >
                  {isGenerating ? (
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      AI Unifying Requirements...
                    </span>
                  ) : (
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Unified Requirements Ready!
                    </span>
                  )}
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-base text-gray-600 dark:text-gray-300 text-center max-w-lg leading-relaxed"
                >
                  {isGenerating ? (
                    <>
                      <span className="font-medium">Processing your selected frameworks...</span>
                      <br />
                      <span className="text-sm">Analyzing overlaps, merging duplicates, and creating unified compliance requirements</span>
                    </>
                  ) : (
                    <>
                      <span className="font-medium">🎉 Your compliance roadmap is ready!</span>
                      <br />
                      <span className="text-sm">Navigate to the "Unified Requirements" tab to view your personalized guidelines</span>
                    </>
                  )}
                </motion.p>

                {/* Progress Indicators */}
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 space-y-3 w-full max-w-md"
                  >
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Analyzing frameworks</span>
                      <span>Unifying requirements</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        animate={{ width: ["0%", "100%"] }}
                        transition={{ duration: 8, ease: "easeInOut" }}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Success State */}
                {!isGenerating && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    className="mt-6 flex items-center space-x-3 px-4 py-2 bg-green-50 dark:bg-green-900/30 rounded-xl"
                  >
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <span className="text-green-700 dark:text-green-300 font-medium">
                      Generation Complete
                    </span>
                  </motion.div>
                )}

                {/* Framework Logos/Icons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 flex items-center space-x-2 opacity-60"
                >
                  <Shield className="w-4 h-4 text-blue-500" />
                  <Lock className="w-4 h-4 text-green-500" />
                  <Settings className="w-4 h-4 text-purple-500" />
                  <BookOpen className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    Powered by AuditReady AI
                  </span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="border border-slate-200 dark:border-slate-700 rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-3 text-xl">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Settings className="w-6 h-6 text-blue-600" />
              </motion.div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI-Powered Framework Unification
              </span>
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Select your compliance frameworks and watch our AI instantly generate unified, simplified requirements tailored to your organization
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Framework Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-stretch">
              
              {/* ISO 27001 Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[140px] flex flex-col ${
                  frameworksSelected['iso27001']
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-blue-300'
                }`}
                onClick={() => handleFrameworkToggle('iso27001', !frameworksSelected['iso27001'])}
              >
                {/* Selected Badge at Top */}
                {frameworksSelected['iso27001'] && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-blue-500 text-white px-3 py-1 text-xs rounded-full">
                      Selected
                    </Badge>
                  </div>
                )}
                
                <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                  <div className={`p-2 rounded-full ${frameworksSelected['iso27001'] ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <Shield className={`w-5 h-5 ${frameworksSelected['iso27001'] ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <h3 className="font-semibold text-sm h-5 flex items-center justify-center">ISO 27001</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">Info Security Management</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium text-center">
                      {frameworkCounts?.iso27001 || 24} requirements
                    </p>
                  </div>
                </div>
                {frameworksSelected['iso27001'] && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.div>

              {/* ISO 27002 Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[140px] flex flex-col ${
                  frameworksSelected['iso27002']
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg shadow-green-500/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-green-300'
                }`}
                onClick={() => handleFrameworkToggle('iso27002', !frameworksSelected['iso27002'])}
              >
                {/* Selected Badge at Top */}
                {frameworksSelected['iso27002'] && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-green-500 text-white px-3 py-1 text-xs rounded-full">
                      Selected
                    </Badge>
                  </div>
                )}
                
                <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                  <div className={`p-2 rounded-full ${frameworksSelected['iso27002'] ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <Lock className={`w-5 h-5 ${frameworksSelected['iso27002'] ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <h3 className="font-semibold text-sm h-5 flex items-center justify-center">ISO 27002</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">Information Security Controls</p>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium text-center">
                      {frameworkCounts?.iso27002 || 93} requirements
                    </p>
                  </div>
                </div>
                {frameworksSelected['iso27002'] && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.div>

              {/* CIS Controls Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[140px] flex flex-col ${
                  frameworksSelected['cisControls']
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-500/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-purple-300'
                }`}
                onClick={(e) => {
                  // If clicking on the card background (not on IG buttons), deselect CIS Controls
                  if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.space-y-1') === null) {
                    handleFrameworkToggle('cisControls', null);
                  }
                }}
              >
                {/* Selected Badge at Top */}
                {frameworksSelected['cisControls'] && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-purple-500 text-white px-3 py-1 text-xs rounded-full">
                      Selected
                    </Badge>
                  </div>
                )}
                
                <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                  <div className={`p-2 rounded-full ${frameworksSelected['cisControls'] ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <Settings className={`w-5 h-5 ${frameworksSelected['cisControls'] ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <h3 className="font-semibold text-sm h-5 flex items-center justify-center">CIS Controls</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">Cybersecurity Best Practices</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium text-center">
                      {(() => {
                        if (frameworksSelected['cisControls'] === 'IG1') {
                          return `${frameworkCounts?.cisIG1 || 56} requirements`;
                        } else if (frameworksSelected['cisControls'] === 'IG2') {
                          return `${frameworkCounts?.cisIG2 || 74} requirements`;
                        } else if (frameworksSelected['cisControls'] === 'IG3') {
                          return `${frameworkCounts?.cisIG3 || 79} requirements`;
                        } else {
                          return `${frameworkCounts?.cisControls || 153} total controls`;
                        }
                      })()}
                    </p>
                  </div>
                  
                  {/* IG Selection Buttons */}
                  <div className="space-y-1 w-full">
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">Implementation Groups:</div>
                    <div className="flex flex-col space-y-1">
                      {['IG1', 'IG2', 'IG3'].map((ig) => (
                        <Button
                          key={ig}
                          variant={frameworksSelected['cisControls'] === ig ? 'default' : 'outline'}
                          size="sm"
                          className={`text-xs h-6 px-2 ${
                            frameworksSelected['cisControls'] === ig 
                              ? 'bg-purple-500 text-white border-purple-500' 
                              : 'text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-purple-300'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFrameworkToggle('cisControls', ig);
                          }}
                        >
                          {ig} ({ig === 'IG1' ? frameworkCounts?.cisIG1 || 56 : ig === 'IG2' ? frameworkCounts?.cisIG2 || 74 : frameworkCounts?.cisIG3 || 79})
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                {frameworksSelected['cisControls'] && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.div>

              {/* GDPR Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[140px] flex flex-col ${
                  frameworksSelected['gdpr']
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg shadow-orange-500/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-orange-300'
                }`}
                onClick={() => handleFrameworkToggle('gdpr', !frameworksSelected['gdpr'])}
              >
                {/* Selected Badge at Top */}
                {frameworksSelected['gdpr'] && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-orange-500 text-white px-3 py-1 text-xs rounded-full">
                      Selected
                    </Badge>
                  </div>
                )}
                
                <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                  <div className={`p-2 rounded-full ${frameworksSelected['gdpr'] ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <Database className={`w-5 h-5 ${frameworksSelected['gdpr'] ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <h3 className="font-semibold text-sm h-5 flex items-center justify-center">GDPR</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">Data Protection Regulation</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium text-center">
                      {frameworkCounts?.gdpr || 84} requirements
                    </p>
                  </div>
                </div>
                {frameworksSelected['gdpr'] && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.div>

              {/* NIS2 Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[140px] flex flex-col ${
                  frameworksSelected['nis2']
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-indigo-300'
                }`}
                onClick={() => handleFrameworkToggle('nis2', !frameworksSelected['nis2'])}
              >
                {/* Selected Badge at Top */}
                {frameworksSelected['nis2'] && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-indigo-500 text-white px-3 py-1 text-xs rounded-full">
                      Selected
                    </Badge>
                  </div>
                )}
                
                <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                  <div className={`p-2 rounded-full ${frameworksSelected['nis2'] ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <Target className={`w-5 h-5 ${frameworksSelected['nis2'] ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <h3 className="font-semibold text-sm h-5 flex items-center justify-center">NIS2</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">EU Network & Info Security</p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium text-center">
                      {frameworkCounts?.nis2 || 21} requirements
                    </p>
                  </div>
                </div>
                {frameworksSelected['nis2'] && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.div>

              {/* DORA Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[140px] flex flex-col ${
                  frameworksSelected['dora']
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-lg shadow-red-500/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-red-300'
                }`}
                onClick={() => handleFrameworkToggle('dora', !frameworksSelected['dora'])}
              >
                {/* Selected Badge at Top */}
                {frameworksSelected['dora'] && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-red-500 text-white px-3 py-1 text-xs rounded-full">
                      Selected
                    </Badge>
                  </div>
                )}
                
                <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                  <div className={`p-2 rounded-full ${frameworksSelected['dora'] ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <Building className={`w-5 h-5 ${frameworksSelected['dora'] ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <h3 className="font-semibold text-sm h-5 flex items-center justify-center">DORA</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">Digital Operational Resilience</p>
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium text-center">
                      {frameworkCounts?.dora || 72} requirements
                    </p>
                  </div>
                </div>
                {frameworksSelected['dora'] && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-center">
              <Button 
                onClick={generateUnifiedRequirements}
                disabled={Object.values(frameworksSelected).every(val => !val) || isGenerating}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-5 h-5 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Unified Requirements'}
              </Button>
            </div>

            {/* Enhanced Framework Mapping Display */}
            {!isLoadingCategoryMapping && categoryMappings && categoryMappings.length > 0 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Framework Mapping Analysis
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    See how your selected frameworks map to unified compliance categories
                  </p>
                </div>

                {/* Filter Bar - GitHub Version */}
                <div className="mb-6 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  {/* Framework Filters */}
                  <div className="flex flex-col space-y-2 sm:flex-row sm:flex-wrap sm:gap-4 sm:items-center sm:space-y-0 mb-4">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">Filter by Framework:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'all', label: 'All Frameworks', icon: <Target className="w-4 h-4" /> },
                        { id: 'iso27001', label: 'ISO 27001', icon: <Shield className="w-4 h-4" /> },
                        { id: 'iso27002', label: 'ISO 27002', icon: <Lock className="w-4 h-4" /> },
                        { id: 'cis', label: 'CIS Controls', icon: <Settings className="w-4 h-4" /> },
                        { id: 'gdpr', label: 'GDPR', icon: <BookOpen className="w-4 h-4" /> },
                        { id: 'nis2', label: 'NIS2', icon: <Shield className="w-4 h-4" /> },
                        { id: 'dora', label: 'DORA', icon: <Shield className="w-4 h-4" /> }
                      ].map((filter) => (
                        <Button
                          key={filter.id}
                          variant={frameworkFilter === filter.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFrameworkFilter(filter.id)}
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
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full sm:w-[400px] max-w-lg">
                        <SelectValue placeholder="Select a category to filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {filteredCategoryMappings.map((mapping) => (
                          <SelectItem key={mapping.id} value={mapping.id}>
                            {mapping.category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {filteredCategoryMappings.map((mapping, index) => (
                  <Card key={mapping.id || index} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    
                    {/* Category Header */}
                    <div className="p-4 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-slate-600 rounded-lg">
                            <Target className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                              {mapping.category}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {mapping.auditReadyUnified?.description || 'Compliance category'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {Object.keys(selectedFrameworks || {}).filter(fw => {
                              const framework = selectedFrameworks?.[fw as keyof FrameworkSelection];
                              return (fw === 'cisControls' ? !!framework : framework) && mapping.frameworks[fw];
                            }).length} frameworks
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Framework Requirements Row */}
                    {Object.keys(selectedFrameworks || {}).some(fw => {
                      const framework = selectedFrameworks?.[fw as keyof FrameworkSelection];
                      return (fw === 'cisControls' ? !!framework : framework) && mapping.frameworks[fw];
                    }) && (
                    <div className={`grid gap-0 border-b border-slate-200 dark:border-slate-700 grid-cols-1 ${
                      // Calculate grid columns based on selected frameworks (GitHub pattern)
                      (() => {
                        const selectedCount = 
                          (selectedFrameworks?.iso27001 ? 1 : 0) +
                          (selectedFrameworks?.iso27002 ? 1 : 0) +
                          (selectedFrameworks?.cisControls ? 1 : 0) +
                          (selectedFrameworks?.gdpr ? 1 : 0) +
                          (selectedFrameworks?.nis2 ? 1 : 0) +
                          (selectedFrameworks?.dora ? 1 : 0);
                        
                        if (selectedCount === 1) return 'lg:grid-cols-1';
                        if (selectedCount === 2) return 'sm:grid-cols-2';
                        if (selectedCount === 3) return 'sm:grid-cols-2 lg:grid-cols-3';
                        if (selectedCount === 4) return 'sm:grid-cols-2 lg:grid-cols-4';
                        if (selectedCount === 5) return 'sm:grid-cols-2 lg:grid-cols-5';
                        if (selectedCount === 6) return 'sm:grid-cols-2 lg:grid-cols-6';
                        return 'sm:grid-cols-2 lg:grid-cols-3'; // fallback
                      })()
                    }`}>
                      
                      {/* ISO 27001 Column - Only show if selected */}
                      {selectedFrameworks?.iso27001 && (
                        <div className="p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/10">
                          <div className="flex items-center space-x-2 mb-4">
                            <Shield className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100">ISO 27001</h4>
                          </div>
                          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100 dark:scrollbar-thumb-blue-600 dark:scrollbar-track-blue-900">
                            {(mapping.frameworks['iso27001'] || []).map((req, i) => (
                              <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700">
                                <div className="font-medium text-sm text-blue-900 dark:text-blue-100">{req.code}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">{req.title}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ISO 27002 Column - Only show if selected */}
                      {selectedFrameworks?.iso27002 && (
                        <div className="p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700 bg-green-50 dark:bg-green-900/10">
                          <div className="flex items-center space-x-2 mb-4">
                            <Lock className="w-5 h-5 text-green-600" />
                            <h4 className="font-semibold text-green-900 dark:text-green-100">ISO 27002</h4>
                          </div>
                          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-green-100 dark:scrollbar-thumb-green-600 dark:scrollbar-track-green-900">
                            {(mapping.frameworks['iso27002'] || []).map((req, i) => (
                              <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-700">
                                <div className="font-medium text-sm text-green-900 dark:text-green-100">{req.code}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">{req.title}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CIS Controls Column - Only show if selected */}
                      {selectedFrameworks?.cisControls && (
                        <div className="p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700 bg-purple-50 dark:bg-purple-900/10">
                          <div className="flex items-center space-x-2 mb-4">
                            <Settings className="w-5 h-5 text-purple-600" />
                            <h4 className="font-semibold text-purple-900 dark:text-purple-100">CIS Controls</h4>
                          </div>
                          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100 dark:scrollbar-thumb-purple-600 dark:scrollbar-track-purple-900">
                            {(mapping.frameworks['cisControls'] || []).map((req, i) => (
                              <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-purple-200 dark:border-purple-700">
                                <div className="font-medium text-sm text-purple-900 dark:text-purple-100">{req.code}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">{req.title}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* GDPR Column - Only show if selected */}
                      {selectedFrameworks?.gdpr && (
                        <div className="p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700 bg-orange-50 dark:bg-orange-900/10">
                          <div className="flex items-center space-x-2 mb-4">
                            <Database className="w-5 h-5 text-orange-600" />
                            <h4 className="font-semibold text-orange-900 dark:text-orange-100">GDPR</h4>
                          </div>
                          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-100 dark:scrollbar-thumb-orange-600 dark:scrollbar-track-orange-900">
                            {(mapping.frameworks['gdpr'] || []).map((req, i) => (
                              <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-orange-200 dark:border-orange-700">
                                <div className="font-medium text-sm text-orange-900 dark:text-orange-100">{req.code}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">{req.title}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* NIS2 Column - Only show if selected */}
                      {selectedFrameworks?.nis2 && (
                        <div className="p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700 bg-indigo-50 dark:bg-indigo-900/10">
                          <div className="flex items-center space-x-2 mb-4">
                            <Target className="w-5 h-5 text-indigo-600" />
                            <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">NIS2</h4>
                          </div>
                          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-indigo-100 dark:scrollbar-thumb-indigo-600 dark:scrollbar-track-indigo-900">
                            {(mapping.frameworks['nis2'] || []).map((req, i) => (
                              <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-indigo-200 dark:border-indigo-700">
                                <div className="font-medium text-sm text-indigo-900 dark:text-indigo-100">{req.code}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">{req.title}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* DORA Column - Only show if selected */}
                      {selectedFrameworks?.dora && (
                        <div className="p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700 bg-red-50 dark:bg-red-900/10">
                          <div className="flex items-center space-x-2 mb-4">
                            <Shield className="w-5 h-5 text-red-600" />
                            <h4 className="font-semibold text-red-900 dark:text-red-100">DORA</h4>
                          </div>
                          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-red-100 dark:scrollbar-thumb-red-600 dark:scrollbar-track-red-900">
                            {(mapping.frameworks['dora'] || []).map((req, i) => (
                              <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-red-200 dark:border-red-700">
                                <div className="font-medium text-sm text-red-900 dark:text-red-100">{req.code}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">{req.title}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                    )}

                    {/* AuditReady Unified Row */}
                    <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-1.5 bg-white/20 rounded-lg">
                            <Zap className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-base">AuditReady Unified</h4>
                            <p className="text-xs text-white/90">{mapping.auditReadyUnified.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-center bg-white/20 rounded-lg px-3 py-1">
                            <span className="text-xs font-medium block">
                              {(() => {
                                if (mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948') {
                                  // For GDPR groups, show GDPR articles count
                                  const totalGdprReqs = mapping.frameworks['gdpr']?.length || 0;
                                  const unifiedReqs = mapping.auditReadyUnified.subRequirements.length;
                                  const reductionPercent = totalGdprReqs > 1 ? Math.round((1 - unifiedReqs / totalGdprReqs) * 100) : 0;
                                  return `Unifies ${totalGdprReqs} GDPR articles - ${reductionPercent}% simpler`;
                                } else {
                                  // For regular groups, show framework requirements from selected frameworks only
                                  const totalFrameworkReqs = 
                                    (selectedFrameworks?.iso27001 ? (mapping.frameworks?.['iso27001']?.length || 0) : 0) + 
                                    (selectedFrameworks?.iso27002 ? (mapping.frameworks?.['iso27002']?.length || 0) : 0) + 
                                    (selectedFrameworks?.cisControls ? (mapping.frameworks?.['cisControls']?.length || 0) : 0) +
                                    (selectedFrameworks?.gdpr ? (mapping.frameworks?.['gdpr']?.length || 0) : 0) +
                                    (selectedFrameworks?.nis2 ? (mapping.frameworks?.['nis2']?.length || 0) : 0) +
                                    (selectedFrameworks?.dora ? (mapping.frameworks?.['dora']?.length || 0) : 0);
                                  const reductionPercent = totalFrameworkReqs > 1 ? Math.round((1 - 1 / totalFrameworkReqs) * 100) : 0;
                                  return totalFrameworkReqs > 0 ? `Replaces ${totalFrameworkReqs} requirements - ${reductionPercent}% reduction` : 'No requirements from selected frameworks';
                                }
                              })()}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedMapping(selectedMapping === mapping.id ? null : mapping.id)}
                            className="text-white hover:bg-white/20 whitespace-nowrap text-xs px-2 py-1 h-auto"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            <span>{selectedMapping === mapping.id ? 'Hide' : 'Show'} Sub-Requirements</span>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Detailed View */}
                    <AnimatePresence>
                      {selectedMapping === mapping.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-gray-50 dark:bg-gray-800/50"
                        >
                          <div className="p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h5 className="font-semibold text-gray-900 dark:text-white">Unified Sub-Requirements</h5>
                              <div className="flex gap-1 flex-wrap">
                                {getFrameworkBadges(mapping).map((badge, idx) => (
                                  <Badge key={idx} className={`text-xs ${badge.color}`}>
                                    {badge.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {mapping.auditReadyUnified.subRequirements.map((subReq, subIdx) => (
                              <div key={subIdx} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
                                <div className="flex items-start space-x-2">
                                  <div className="flex-shrink-0 w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mt-0.5">
                                    <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">{subIdx + 1}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h6 className="font-medium text-sm text-gray-900 dark:text-white leading-tight">{subReq.title}</h6>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{subReq.description}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
};

export default FrameworkMappingTab;