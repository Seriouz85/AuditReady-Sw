/**
 * Framework Selection Interface
 * Extracted from ComplianceSimplification.tsx to reduce complexity
 * 
 * FEATURES:
 * - Interactive framework selection cards
 * - Real-time framework counts display
 * - CIS Controls IG level selection
 * - Industry sector selection
 * - AI-powered generation overlay
 * - Professional visual design with animations
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Zap, 
  Settings,
  CheckCircle,
  Lock,
  Building2,
  Factory
} from 'lucide-react';
import type { SelectedFrameworks } from '@/utils/FrameworkUtilities';

export interface FrameworkSelectionInterfaceProps {
  selectedFrameworks: SelectedFrameworks;
  onFrameworkToggle: (framework: string, value: boolean | 'ig1' | 'ig2' | 'ig3' | null) => void;
  selectedIndustrySector: string | null;
  onIndustrySectorChange: (sector: string | null) => void;
  isGenerating: boolean;
  showGeneration: boolean;
  onGenerate: () => void;
  frameworkCounts?: {
    iso27001?: number;
    iso27002?: number;
    cisControls?: number;
    gdpr?: number;
    nis2?: number;
    dora?: number;
  };
  industrySectors?: Array<{
    id: string;
    name: string;
    description: string;
    nis2Essential: boolean;
    nis2Important: boolean;
  }>;
}

export function FrameworkSelectionInterface({
  selectedFrameworks,
  onFrameworkToggle,
  selectedIndustrySector,
  onIndustrySectorChange,
  isGenerating,
  showGeneration,
  onGenerate,
  frameworkCounts,
  industrySectors
}: FrameworkSelectionInterfaceProps) {
  
  const handleGenerate = () => {
    onGenerate();
  };

  const hasSelectedFrameworks = selectedFrameworks.iso27001 || 
                                selectedFrameworks.iso27002 || 
                                selectedFrameworks.cisControls || 
                                selectedFrameworks.gdpr || 
                                selectedFrameworks.nis2 || 
                                selectedFrameworks.dora;

  return (
    <div className="relative">
      {/* AI Generation Overlay */}
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

      <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
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
                selectedFrameworks['iso27001']
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-blue-300'
              }`}
              onClick={() => onFrameworkToggle('iso27001', !selectedFrameworks['iso27001'])}
            >
              {/* Selected Badge at Top */}
              {selectedFrameworks['iso27001'] && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-blue-500 text-white px-3 py-1 text-xs rounded-full">
                    Selected
                  </Badge>
                </div>
              )}
              
              <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                <div className={`p-2 rounded-full ${selectedFrameworks['iso27001'] ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  <Shield className={`w-5 h-5 ${selectedFrameworks['iso27001'] ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div className="flex flex-col space-y-1">
                  <h3 className="font-semibold text-sm h-5 flex items-center justify-center">ISO 27001</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">Info Security Management</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium text-center">
                    {frameworkCounts?.iso27001 || 24} requirements
                  </p>
                </div>
              </div>
              {selectedFrameworks['iso27001'] && (
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
                selectedFrameworks['iso27002']
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg shadow-green-500/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-green-300'
              }`}
              onClick={() => onFrameworkToggle('iso27002', !selectedFrameworks['iso27002'])}
            >
              {/* Selected Badge at Top */}
              {selectedFrameworks['iso27002'] && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-green-500 text-white px-3 py-1 text-xs rounded-full">
                    Selected
                  </Badge>
                </div>
              )}
              
              <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                <div className={`p-2 rounded-full ${selectedFrameworks['iso27002'] ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  <Lock className={`w-5 h-5 ${selectedFrameworks['iso27002'] ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div className="flex flex-col space-y-1">
                  <h3 className="font-semibold text-sm h-5 flex items-center justify-center">ISO 27002</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">Security Controls</p>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium text-center">
                    {frameworkCounts?.iso27002 || 93} requirements
                  </p>
                </div>
              </div>
              {selectedFrameworks['iso27002'] && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </motion.div>

            {/* CIS Controls Card with IG Level Selection */}
            <div className="relative min-h-[140px] flex flex-col">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[140px] flex flex-col ${
                  selectedFrameworks['cisControls']
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg shadow-orange-500/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-orange-300'
                }`}
                onClick={() => onFrameworkToggle('cisControls', selectedFrameworks['cisControls'] ? false : 'ig3')}
              >
                {/* Selected Badge at Top */}
                {selectedFrameworks['cisControls'] && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-orange-500 text-white px-3 py-1 text-xs rounded-full">
                      Selected
                    </Badge>
                  </div>
                )}
                
                <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                  <div className={`p-2 rounded-full ${selectedFrameworks['cisControls'] ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <Shield className={`w-5 h-5 ${selectedFrameworks['cisControls'] ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <h3 className="font-semibold text-sm h-5 flex items-center justify-center">CIS Controls</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">Cybersecurity Controls</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium text-center">
                      {frameworkCounts?.cisControls || 153} requirements
                    </p>
                  </div>
                </div>
                {selectedFrameworks['cisControls'] && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.div>

              {/* CIS IG Level Selector */}
              {selectedFrameworks['cisControls'] && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2"
                >
                  <Select 
                    value={selectedFrameworks['cisControls'] as string} 
                    onValueChange={(value) => onFrameworkToggle('cisControls', value as 'ig1' | 'ig2' | 'ig3')}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select IG Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ig1">IG1 - Basic</SelectItem>
                      <SelectItem value="ig2">IG2 - Reasonable</SelectItem>
                      <SelectItem value="ig3">IG3 - Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              )}
            </div>

            {/* GDPR Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[140px] flex flex-col ${
                selectedFrameworks['gdpr']
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-500/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-purple-300'
              }`}
              onClick={() => onFrameworkToggle('gdpr', !selectedFrameworks['gdpr'])}
            >
              {/* Selected Badge at Top */}
              {selectedFrameworks['gdpr'] && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-purple-500 text-white px-3 py-1 text-xs rounded-full">
                    Selected
                  </Badge>
                </div>
              )}
              
              <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                <div className={`p-2 rounded-full ${selectedFrameworks['gdpr'] ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  <Shield className={`w-5 h-5 ${selectedFrameworks['gdpr'] ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div className="flex flex-col space-y-1">
                  <h3 className="font-semibold text-sm h-5 flex items-center justify-center">GDPR</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">Data Protection</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-medium text-center">
                    {frameworkCounts?.gdpr || 23} requirements
                  </p>
                </div>
              </div>
              {selectedFrameworks['gdpr'] && (
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
                selectedFrameworks['nis2']
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-lg shadow-red-500/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-red-300'
              }`}
              onClick={() => onFrameworkToggle('nis2', !selectedFrameworks['nis2'])}
            >
              {/* Selected Badge at Top */}
              {selectedFrameworks['nis2'] && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-red-500 text-white px-3 py-1 text-xs rounded-full">
                    Selected
                  </Badge>
                </div>
              )}
              
              <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                <div className={`p-2 rounded-full ${selectedFrameworks['nis2'] ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  <Shield className={`w-5 h-5 ${selectedFrameworks['nis2'] ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div className="flex flex-col space-y-1">
                  <h3 className="font-semibold text-sm h-5 flex items-center justify-center">NIS2</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">Network Security</p>
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium text-center">
                    {frameworkCounts?.nis2 || 18} requirements
                  </p>
                </div>
              </div>
              {selectedFrameworks['nis2'] && (
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
                selectedFrameworks['dora']
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-indigo-300'
              }`}
              onClick={() => onFrameworkToggle('dora', !selectedFrameworks['dora'])}
            >
              {/* Selected Badge at Top */}
              {selectedFrameworks['dora'] && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-indigo-500 text-white px-3 py-1 text-xs rounded-full">
                    Selected
                  </Badge>
                </div>
              )}
              
              <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                <div className={`p-2 rounded-full ${selectedFrameworks['dora'] ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  <Building2 className={`w-5 h-5 ${selectedFrameworks['dora'] ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div className="flex flex-col space-y-1">
                  <h3 className="font-semibold text-sm h-5 flex items-center justify-center">DORA</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">Digital Resilience</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium text-center">
                    {frameworkCounts?.dora || 15} requirements
                  </p>
                </div>
              </div>
              {selectedFrameworks['dora'] && (
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

          {/* Industry Sector Selection */}
          {selectedFrameworks['nis2'] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-2 border-orange-200 dark:border-orange-800 rounded-xl p-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20"
            >
              <div className="flex items-center space-x-3 mb-4">
                <Factory className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">Industry Sector</h3>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
                Select your industry sector to receive sector-specific NIS2 requirements and guidance.
              </p>
              <Select value={selectedIndustrySector || ''} onValueChange={onIndustrySectorChange}>
                <SelectTrigger className="bg-white dark:bg-slate-800">
                  <SelectValue placeholder="Select your industry sector (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific sector</SelectItem>
                  {industrySectors?.map(sector => (
                    <SelectItem key={sector.id} value={sector.id}>
                      <div className="flex items-center space-x-2">
                        <span>{sector.name}</span>
                        {sector.nis2Essential && (
                          <Badge variant="destructive" className="text-xs">Essential</Badge>
                        )}
                        {sector.nis2Important && !sector.nis2Essential && (
                          <Badge variant="secondary" className="text-xs">Important</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          )}
          
          {/* Generate Button */}
          <div className="border-t pt-8">
            <div className="flex justify-center">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !hasSelectedFrameworks}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-12 py-4 rounded-xl shadow-lg text-lg transition-all duration-300 transform hover:scale-105"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 mr-3"
                    >
                      <Zap className="w-6 h-6" />
                    </motion.div>
                    Generating Unified Requirements...
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6 mr-3" />
                    Generate Unified Requirements
                  </>
                )}
              </Button>
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-3">
              Select frameworks above and click to generate your unified compliance requirements
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FrameworkSelectionInterface;