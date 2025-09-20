import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle } from 'lucide-react';
import { TabsContent } from '@/components/ui/tabs';
import { FrameworkSelection } from '@/types/ComplianceSimplificationTypes';
import { OriginalFrameworkSelectionInterface } from '@/components/compliance/selection/OriginalFrameworkSelectionInterface';
import { OriginalFrameworkFilteringSystem } from '@/components/compliance/mapping/OriginalFrameworkFilteringSystem';
import { DynamicColumnsLayout } from '@/components/compliance/mapping/DynamicColumnsLayout';

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
  isLoadingCounts?: boolean;
  
  // Generation function
  generateUnifiedRequirements: () => Promise<void>;
  
  // NIS2 Sector Selection (optional)
  selectedIndustrySector?: string | null;
  setSelectedIndustrySector?: (sector: string | null) => void;
  industrySectors?: any[];
  isLoadingSectors?: boolean;
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
  isLoadingCounts = false,
  generateUnifiedRequirements,
  selectedIndustrySector,
  setSelectedIndustrySector,
  industrySectors,
  isLoadingSectors
}) => {
  // Local state for filtering
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [frameworkFilter, setFrameworkFilter] = React.useState('all');
  
  // Filter category mappings based on GDPR special logic from original
  const filteredCategoryMappings = React.useMemo(() => {
    let filtered = categoryMappings || [];
    
    // Apply GDPR special filtering logic from original
    if (frameworksSelected['gdpr'] && !frameworksSelected['iso27001'] && !frameworksSelected['iso27002'] && !frameworksSelected['cisControls'] && !frameworksSelected['nis2'] && !frameworksSelected['dora']) {
      // Only GDPR selected - show only GDPR groups
      filtered = filtered.filter(mapping => mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948');
    } else if (!frameworksSelected['gdpr'] && (frameworksSelected['iso27001'] || frameworksSelected['iso27002'] || frameworksSelected['cisControls'] || frameworksSelected['nis2'] || frameworksSelected['dora'])) {
      // No GDPR selected but other frameworks - hide GDPR groups
      filtered = filtered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    } else if (frameworksSelected['gdpr'] && (frameworksSelected['iso27001'] || frameworksSelected['iso27002'] || frameworksSelected['cisControls'] || frameworksSelected['nis2'] || frameworksSelected['dora'])) {
      // Both GDPR and others selected - show all
      filtered = categoryMappings || [];
    } else {
      // Nothing selected - show non-GDPR groups by default
      filtered = filtered.filter(mapping => mapping.id !== '397d97f9-2452-4eb0-b367-024152a5d948');
    }

    // Filter by framework selection
    filtered = filtered.map(mapping => {
      // For GDPR group, only show GDPR frameworks
      if (mapping.id === '397d97f9-2452-4eb0-b367-024152a5d948') {
        if (!frameworksSelected['gdpr']) return null;
        
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
          iso27001: frameworksSelected['iso27001'] ? (mapping.frameworks?.['iso27001'] || []) : [],
          iso27002: frameworksSelected['iso27002'] ? (mapping.frameworks?.['iso27002'] || []) : [],
          cisControls: frameworksSelected['cisControls'] ? (mapping.frameworks?.['cisControls'] || []) : [],
          gdpr: frameworksSelected['gdpr'] ? (mapping.frameworks?.['gdpr'] || []) : [],
          nis2: frameworksSelected['nis2'] ? (mapping.frameworks?.['nis2'] || []) : [],
          dora: frameworksSelected['dora'] ? (mapping.frameworks?.['dora'] || []) : []
        }
      };
      
      return newMapping;
    }).filter(mapping => mapping !== null);
    
    // Apply framework filter
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
  }, [categoryMappings, frameworksSelected, frameworkFilter, categoryFilter]);

  // Convert frameworksSelected to SelectedFrameworks format for FrameworkSelectionInterface
  const selectedFrameworksForInterface = {
    iso27001: !!frameworksSelected.iso27001,
    iso27002: !!frameworksSelected.iso27002,
    cisControls: frameworksSelected.cisControls || false,
    gdpr: !!frameworksSelected.gdpr,
    nis2: !!frameworksSelected.nis2,
    dora: !!frameworksSelected.dora
  };

  return (
    <TabsContent value="mapping" className="space-y-6">
      <div className="relative">
        {/* Framework Selection Interface with AI Overlay */}
        <div className="relative">
          {/* AI Generation Overlay - INLINE som GitHub */}
          <AnimatePresence>
            {showGeneration && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[10000] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl border-2 border-blue-200 dark:border-blue-800 flex flex-col items-center justify-center"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 180, 360] 
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: isGenerating ? Infinity : 0 
                  }}
                  className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4"
                >
                  <Zap className="w-8 h-8 text-white" />
                </motion.div>
                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-xl font-semibold text-gray-900 dark:text-white mb-2"
                >
                  {isGenerating ? 'AI Analyzing Frameworks...' : 'Unified Requirements Generated!'}
                </motion.h3>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md"
                >
                  {isGenerating 
                    ? 'Our AI is processing your selected frameworks and creating optimized unified requirements...'
                    : 'Your customized compliance roadmap is ready! Scroll down to see the unified requirements.'
                  }
                </motion.p>
                {!isGenerating && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="mt-4 flex items-center space-x-2 text-green-600"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Generation Complete</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Original Framework Selection Interface */}
          <OriginalFrameworkSelectionInterface
            frameworksSelected={frameworksSelected}
            handleFrameworkToggle={handleFrameworkToggle}
            frameworkCounts={frameworkCounts}
            generateUnifiedRequirements={generateUnifiedRequirements}
            isGenerating={isGenerating}
            selectedIndustrySector={selectedIndustrySector}
            setSelectedIndustrySector={setSelectedIndustrySector}
            industrySectors={industrySectors}
            isLoadingSectors={isLoadingSectors}
            isLoadingCounts={isLoadingCounts}
          />
        </div>

        {/* Enhanced Framework Mapping Display */}
        {categoryMappings && categoryMappings.length > 0 && Object.values(frameworksSelected).some(Boolean) && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Framework Mapping Analysis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                See how your selected frameworks map to unified compliance categories
              </p>
            </div>

            {/* Original Framework Filtering System */}
            <OriginalFrameworkFilteringSystem
              frameworkFilter={frameworkFilter}
              setFrameworkFilter={setFrameworkFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              categoryMappings={filteredCategoryMappings}
            />

            {/* Dynamic Columns Layout */}
            <DynamicColumnsLayout
              filteredCategoryMappings={filteredCategoryMappings}
              frameworksSelected={frameworksSelected}
              getFrameworkBadges={getFrameworkBadges}
              selectedMapping={selectedMapping}
              setSelectedMapping={setSelectedMapping}
            />
          </div>
        )}
      </div>
    </TabsContent>
  );
};

export default FrameworkMappingTab;