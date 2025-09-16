import { motion } from 'framer-motion';
import { Shield, Lock, Settings, BookOpen, Building2, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Framework selection types
interface FrameworkCounts {
  iso27001?: number;
  iso27002?: number;
  cisIG1?: number;
  cisIG2?: number;
  cisIG3?: number;
  gdpr?: number;
  nis2?: number;
  dora?: number;
}

interface IndustrySector {
  id: string;
  name: string;
  description: string;
  nis2Essential?: boolean;
  nis2Important?: boolean;
}

interface FrameworksSelected {
  iso27001: boolean;
  iso27002: boolean;
  cisControls: 'ig1' | 'ig2' | 'ig3' | null;
  gdpr: boolean;
  nis2: boolean;
  dora: boolean;
}

interface ComplianceFrameworkSelectionCardsProps {
  frameworksSelected: FrameworksSelected;
  onFrameworkToggle: (framework: string, value: boolean | 'ig1' | 'ig2' | 'ig3' | null) => void;
  frameworkCounts?: FrameworkCounts;
  isLoadingCounts?: boolean;
  selectedIndustrySector?: string | null;
  onIndustrySectorChange: (value: string | null) => void;
  industrySectors?: IndustrySector[];
  isLoadingSectors?: boolean;
  onPresetsChange: (frameworks: FrameworksSelected) => void;
}

export function ComplianceFrameworkSelectionCards({
  frameworksSelected,
  onFrameworkToggle,
  frameworkCounts,
  isLoadingCounts,
  selectedIndustrySector,
  onIndustrySectorChange,
  industrySectors,
  isLoadingSectors,
  onPresetsChange
}: ComplianceFrameworkSelectionCardsProps) {
  return (
    <>
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
          onClick={() => onFrameworkToggle('iso27001', !frameworksSelected['iso27001'])}
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
          onClick={() => onFrameworkToggle('iso27002', !frameworksSelected['iso27002'])}
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
              onFrameworkToggle('cisControls', null);
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
                  className={`w-full p-1.5 rounded-lg text-xs font-medium transition-all ${
                    frameworksSelected['cisControls'] === level
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-900/50'
                  }`}
                  onClick={() => onFrameworkToggle('cisControls', frameworksSelected['cisControls'] === level ? null : level as 'ig1' | 'ig2' | 'ig3')}
                >
                  {level.toUpperCase()} - {level === 'ig1' ? 'Basic' : level === 'ig2' ? 'Foundational' : 'Organizational'}
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
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg shadow-orange-500/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-orange-300'
          }`}
          onClick={() => onFrameworkToggle('gdpr', !frameworksSelected['gdpr'])}
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
              <BookOpen className={`w-5 h-5 ${frameworksSelected['gdpr'] ? 'text-white' : 'text-gray-600'}`} />
            </div>
            <div className="flex flex-col space-y-1">
              <h3 className="font-semibold text-sm h-5 flex items-center justify-center">GDPR</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">EU Data Protection Regulation</p>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-medium text-center">
                {frameworkCounts?.gdpr || 25} requirements
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
          onClick={(e) => {
            // Only toggle if clicking the card background, not the dropdown
            if (!(e.target as HTMLElement).closest('.industry-dropdown')) {
              onFrameworkToggle('nis2', !frameworksSelected['nis2']);
            }
          }}
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
              <Shield className={`w-5 h-5 ${frameworksSelected['nis2'] ? 'text-white' : 'text-gray-600'}`} />
            </div>
            <div className="flex flex-col space-y-1">
              <h3 className="font-semibold text-sm h-5 flex items-center justify-center">NIS2</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-1">EU Cybersecurity Directive</p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium text-center">
                {frameworkCounts?.nis2 || 17} requirements
              </p>
            </div>
            
            {/* Industry Sector Selection - Inside the card */}
            {frameworksSelected['nis2'] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full mt-2 industry-dropdown"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <div className="p-1 bg-indigo-50 dark:bg-indigo-900/30 rounded border border-indigo-200 dark:border-indigo-700 relative z-50">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Building2 className="w-2 h-2 text-indigo-600" />
                    <span className="text-[9px] font-medium text-indigo-700 dark:text-indigo-300">Sector</span>
                    <Badge variant="outline" className="text-[7px] px-0.5 py-0 h-3 border-indigo-300 text-indigo-600">
                      NIS2
                    </Badge>
                  </div>
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <Select 
                      value={selectedIndustrySector || 'none'} 
                      onValueChange={(value) => onIndustrySectorChange(value === 'none' ? null : value)}
                    >
                      <SelectTrigger 
                        className="w-full text-[9px] h-4 border-indigo-300 focus:border-indigo-500 px-1 py-0"
                      >
                        <SelectValue placeholder="All Industries" className="text-[9px] leading-none" />
                      </SelectTrigger>
                      <SelectContent className="max-h-48 overflow-y-auto z-[9999]">
                        <SelectItem value="none" className="text-xs py-1 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                            <span className="text-xs">All Industries</span>
                          </div>
                        </SelectItem>
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
                  </div>
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
          onClick={() => onFrameworkToggle('dora', !frameworksSelected['dora'])}
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

      {/* Quick Selection Presets */}
      <div className="border-t pt-6">
        <h4 className="text-lg font-semibold mb-4 text-center">Quick Presets</h4>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { name: 'Comprehensive Security', frameworks: { iso27001: true, iso27002: true, cisControls: 'ig3' as const, gdpr: false, nis2: false, dora: false } },
            { name: 'Privacy Focused', frameworks: { iso27001: false, iso27002: false, cisControls: null, gdpr: true, nis2: false, dora: false } },
            { name: 'EU Compliance', frameworks: { iso27001: true, iso27002: true, cisControls: 'ig2' as const, gdpr: true, nis2: true, dora: true } },
            { name: 'Basic Security', frameworks: { iso27001: true, iso27002: false, cisControls: 'ig1' as const, gdpr: false, nis2: false, dora: false } },
            { name: 'Financial Services', frameworks: { iso27001: true, iso27002: true, cisControls: 'ig3' as const, gdpr: true, nis2: false, dora: true } }
          ].map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              onClick={() => {
                onPresetsChange(preset.frameworks);
              }}
              className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}