import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Settings, 
  BookOpen, 
  Building2,
  CheckCircle,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OriginalFrameworkSelectionInterfaceProps {
  frameworksSelected: Record<string, any>;
  handleFrameworkToggle: (framework: string, value: any) => void;
  frameworkCounts: Record<string, number>;
  generateUnifiedRequirements: () => Promise<void>;
  isGenerating: boolean;
  selectedIndustrySector?: string | null;
  setSelectedIndustrySector?: (sector: string | null) => void;
  industrySectors?: any[];
  isLoadingSectors?: boolean;
  isLoadingCounts?: boolean;
}

export const OriginalFrameworkSelectionInterface: React.FC<OriginalFrameworkSelectionInterfaceProps> = ({
  frameworksSelected,
  handleFrameworkToggle,
  frameworkCounts,
  generateUnifiedRequirements,
  isGenerating,
  selectedIndustrySector,
  setSelectedIndustrySector,
  industrySectors,
  isLoadingSectors,
  isLoadingCounts = false
}) => {
  const hasSelectedFrameworks = Object.values(frameworksSelected).some(Boolean);

  return (
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
        {/* Framework Cards Grid - EXACT ORIGINAL 140px HEIGHT */}
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
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">Security Controls</p>
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
                    const igLevel = frameworksSelected['cisControls'];
                    if (!frameworkCounts || isLoadingCounts) {
                      return igLevel === 'ig1' ? 36 : igLevel === 'ig2' ? 82 : 155;
                    }
                    return igLevel === 'ig1' ? (frameworkCounts.cisIG1 || 36) : 
                           igLevel === 'ig2' ? (frameworkCounts.cisIG2 || 82) : 
                           (frameworkCounts.cisIG3 || 155);
                  })()} requirements
                </p>
              </div>
              
              {/* IG Level Selection */}
              <div className="space-y-1 w-full">
                {['ig1', 'ig2', 'ig3'].map((level) => (
                  <motion.button
                    key={level}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full px-2 py-1 text-xs rounded-md transition-all duration-200 ${
                      frameworksSelected['cisControls'] === level
                        ? 'bg-purple-500 text-white shadow-sm'
                        : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFrameworkToggle('cisControls', level as 'ig1' | 'ig2' | 'ig3');
                    }}
                  >
                    {level.toUpperCase()} - {level === 'ig1' ? 'Basic' : level === 'ig2' ? 'Reasonable' : 'Advanced'}
                  </motion.button>
                ))}
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
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-500/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-purple-300'
            }`}
            onClick={() => handleFrameworkToggle('gdpr', !frameworksSelected['gdpr'])}
          >
            {frameworksSelected['gdpr'] && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                <Badge className="bg-purple-500 text-white px-3 py-1 text-xs rounded-full">
                  Selected
                </Badge>
              </div>
            )}
            
            <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
              <div className={`p-2 rounded-full ${frameworksSelected['gdpr'] ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                <BookOpen className={`w-5 h-5 ${frameworksSelected['gdpr'] ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <div className="flex flex-col space-y-1">
                <h3 className="font-semibold text-sm h-5 flex items-center justify-center">GDPR</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">Data Protection</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium text-center">
                  {frameworkCounts?.gdpr || 23} requirements
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
          <div className="relative min-h-[140px] flex flex-col">
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
              {frameworksSelected['nis2'] && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-indigo-500 text-white px-3 py-1 text-xs rounded-full">
                    Selected
                  </Badge>
                </div>
              )}
              
              <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
                <div className={`p-2 rounded-full ${frameworksSelected['nis2'] ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  <Shield className={`w-5 h-5 ${frameworksSelected['nis2'] ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div className="flex flex-col space-y-1">
                  <h3 className="font-semibold text-sm h-5 flex items-center justify-center">NIS2</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">EU Cybersecurity Directive</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium text-center">
                    {frameworkCounts?.nis2 || 17} requirements
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

            {/* NIS2 Sector Selection */}
            {frameworksSelected['nis2'] && setSelectedIndustrySector && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2"
              >
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
                  <div className="text-xs font-medium text-indigo-800 dark:text-indigo-200 mb-1">Industry Sector</div>
                  <Select 
                    value={selectedIndustrySector || "none"} 
                    onValueChange={(value) => setSelectedIndustrySector(value === "none" ? null : value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific sector</SelectItem>
                      {isLoadingSectors ? (
                        <SelectItem value="loading" disabled>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0 animate-pulse"></div>
                            <span className="text-xs">Loading...</span>
                          </div>
                        </SelectItem>
                      ) : (industrySectors || []).map((sector) => (
                        <SelectItem key={sector.id} value={sector.id} className="text-xs py-1 px-2">
                          <div className="flex items-center gap-2 w-full">
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              sector.nis2Essential ? 'bg-red-500' : 
                              sector.nis2Important ? 'bg-orange-500' : 
                              'bg-green-500'
                            }`}></div>
                            <span className="text-xs truncate flex-1 min-w-0">{sector.name}</span>
                            {sector.nis2Essential && (
                              <Badge variant="destructive" className="text-[9px] px-1 py-0 h-3 flex-shrink-0">
                                Essential
                              </Badge>
                            )}
                            {sector.nis2Important && !sector.nis2Essential && (
                              <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3 flex-shrink-0">
                                Important
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedIndustrySector && industrySectors && (
                    <div className="mt-0.5 p-0.5 bg-white dark:bg-indigo-800/50 rounded text-[7px] border border-indigo-200 dark:border-indigo-600">
                      <p className="text-indigo-800 dark:text-indigo-200 leading-tight">
                        {industrySectors.find(s => s.id === selectedIndustrySector)?.description}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

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
            {frameworksSelected['dora'] && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                <Badge className="bg-red-500 text-white px-3 py-1 text-xs rounded-full">
                  Selected
                </Badge>
              </div>
            )}
            
            <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-4">
              <div className={`p-2 rounded-full ${frameworksSelected['dora'] ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                <Shield className={`w-5 h-5 ${frameworksSelected['dora'] ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <div className="flex flex-col space-y-1">
                <h3 className="font-semibold text-sm h-5 flex items-center justify-center">DORA</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">Digital Operational Resilience</p>
                <p className="text-xs text-red-600 dark:text-red-400 font-medium text-center">
                  {frameworkCounts?.dora || 64} requirements
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
        <div className="border-t pt-8">
          <div className="flex justify-center">
            <Button
              onClick={generateUnifiedRequirements}
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
  );
};