import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Factory } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Clean renderer for unified requirements
 * 
 * This component takes clean, abstracted unified requirements and renders them
 * in a professional format with proper sectioning and framework references.
 */

interface UnifiedRequirement {
  category: string;
  title: string;
  description: string;
  subRequirements: {
    letter: string;
    title: string;
    description: string;
    requirements: string[];
    frameworkReferences: string;
  }[];
  frameworksCovered: string[];
  totalRequirementsProcessed: number;
}

interface UnifiedRequirementsRendererProps {
  requirements: UnifiedRequirement[];
  selectedIndustrySector?: string | null;
  onShowGuidance: (category: string) => void;
}

export const UnifiedRequirementsRenderer: React.FC<UnifiedRequirementsRendererProps> = ({
  requirements,
  selectedIndustrySector,
  onShowGuidance,
}) => {
  
  return (
    <div className="space-y-6">
      {requirements.map((requirement, index) => (
        <motion.div
          key={requirement.category}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {requirement.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {requirement.description}
              </p>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {requirement.category}
              </Badge>
            </div>
            
            <div className="text-right flex flex-col items-end space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="mb-2 text-xs px-3 py-1 text-emerald-700 border-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-500 dark:hover:bg-emerald-900/20"
                onClick={() => onShowGuidance(requirement.category)}
              >
                Unified Guidance
              </Button>
              <div className="text-xs text-gray-500 dark:text-gray-400">Replaces</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {requirement.totalRequirementsProcessed}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">requirements</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {requirement.subRequirements.length} sub-requirements
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Implementation Guidelines:</h4>
            
            <div className="space-y-4">
              {requirement.subRequirements.map((subReq) => (
                <div key={subReq.letter} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  {/* Sub-requirement header */}
                  <div className="mb-3">
                    <h5 className="font-bold text-gray-900 dark:text-white">
                      {subReq.letter}) {subReq.title}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {subReq.description}
                    </p>
                  </div>
                  
                  {/* Requirements list */}
                  {subReq.requirements.length > 0 && (
                    <div className="mb-3">
                      <div className="space-y-2">
                        {subReq.requirements.map((req, reqIndex) => (
                          <div key={reqIndex} className="flex items-start space-x-2 text-sm">
                            <ArrowRight className="w-3 h-3 text-blue-500 mt-1 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                              {req}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Framework references */}
                  {subReq.frameworkReferences && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          Framework References: 
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 ml-1">
                          {subReq.frameworkReferences}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Industry-specific notice if applicable */}
          {selectedIndustrySector && (
            <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
              <div className="flex items-center space-x-2">
                <Factory className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Sector-Specific Enhancements Available
                </span>
                <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                  {selectedIndustrySector}
                </Badge>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Additional requirements and enhancements for {selectedIndustrySector} are included in the unified guidance.
              </p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};