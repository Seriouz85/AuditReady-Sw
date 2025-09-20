import { useState, useMemo } from 'react';
import { ChevronDown, Eye, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { GuidanceTemplateGenerator } from '@/services/compliance/templates/GuidanceTemplateGenerator';

interface UnifiedGuidanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedGuidanceCategory: string;
  getGuidanceContent: () => string;
  aiEnvironment: {
    isValid: boolean;
    setupInstructions: string[];
  };
  aiProviderInfo?: {
    icon?: string;
    name?: string;
    color?: string;
    description?: string;
  };
}

export function UnifiedGuidanceModal({
  open,
  onOpenChange,
  selectedGuidanceCategory,
  getGuidanceContent,
  aiEnvironment,
  aiProviderInfo
}: UnifiedGuidanceModalProps) {
  const [showFrameworkReferences, setShowFrameworkReferences] = useState(false);
  const [showOperationalExcellence, setShowOperationalExcellence] = useState(false);

  // Enhanced guidance content with template fallback
  const enhancedGuidanceContent = useMemo(() => {
    const originalContent = getGuidanceContent();
    
    // If we have substantial content from AI/database, use it
    if (originalContent && originalContent.length > 200) {
      return originalContent;
    }

    // If AI is unavailable or content is minimal, try templates
    const template = GuidanceTemplateGenerator.getTemplate(selectedGuidanceCategory);
    if (template) {
      console.log(`[Template Fallback] Using template for: ${selectedGuidanceCategory}`);
      
      // Format template as guidance content
      return `${template.sections.foundation}

${template.sections.implementation}

${template.sections.validation}

${template.sections.resources}

## 📝 Implementation Requirements:

${template.subRequirements.map(req => req).join('\n\n')}`;
    }

    // Final fallback - generate minimal template
    const fallbackTemplate = GuidanceTemplateGenerator.generateFallbackTemplate(selectedGuidanceCategory);
    console.log(`[Fallback Template] Generated for: ${selectedGuidanceCategory}`);
    
    return `${fallbackTemplate.sections.foundation}

${fallbackTemplate.sections.implementation}

${fallbackTemplate.sections.validation}

${fallbackTemplate.sections.resources}

## 📝 Implementation Requirements:

${fallbackTemplate.subRequirements.map(req => req).join('\n\n')}`;
  }, [selectedGuidanceCategory, getGuidanceContent]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <DialogTitle className="flex items-center space-x-3 text-xl">
              <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <Lightbulb className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <span className="text-gray-900 dark:text-white">
                  {selectedGuidanceCategory.replace(/^\d+\. /, '')}
                </span>
                <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                  Implementation Guidance
                </div>
              </div>
            </DialogTitle>
            <div className="flex items-center space-x-3 mr-8">
              {/* Beautiful "Powered by AI" indicator - always shown when AI is available */}
              {aiEnvironment.isValid && (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700/50 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-base">{aiProviderInfo?.icon || '🤖'}</span>
                    <span className="font-semibold">Powered by AI</span>
                    <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              )}
              
              {/* Show unavailable status if AI is not configured */}
              {!aiEnvironment.isValid && (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-full text-xs font-medium text-gray-500 dark:text-gray-400">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>⚙️</span>
                  <span>AI Unavailable</span>
                </div>
              )}
              <Button
                variant={showFrameworkReferences ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  console.log('[Show References] Button clicked! Current state:', showFrameworkReferences);
                  console.log('[Show References] About to set state to:', !showFrameworkReferences);
                  setShowFrameworkReferences(!showFrameworkReferences);
                  console.log('[Show References] State should now be:', !showFrameworkReferences);
                  console.log('[Show References] Current guidance content length:', getGuidanceContent().length);
                }}
                className="flex items-center space-x-2 text-xs font-medium"
              >
                <Eye className="w-4 h-4" />
                <span>Show References</span>
              </Button>
            </div>
          </div>
          <DialogDescription className="text-gray-600 dark:text-gray-300 mt-2">
            Framework-specific guidance and best practices tailored to your selected compliance standards
          </DialogDescription>
          
          {/* AI Environment Status */}
          {!aiEnvironment.isValid && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start space-x-2">
                <span className="text-amber-600 dark:text-amber-400 text-lg">⚠️</span>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    AI Features Unavailable
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    AI-enhanced guidance requires an API key. You're currently viewing static content.
                  </p>
                  {aiEnvironment.setupInstructions.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-amber-600 dark:text-amber-400 hover:text-amber-700">
                        Setup Instructions
                      </summary>
                      <div className="mt-1 text-xs text-amber-700 dark:text-amber-300 whitespace-pre-line">
                        {aiEnvironment.setupInstructions.join('\n')}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogHeader>
        <div className="prose dark:prose-invert max-w-none pt-6">
          {(selectedGuidanceCategory ? enhancedGuidanceContent : 'No category selected').split('\n').map((line, index) => {
            // Clean line but preserve basic formatting markers
            let cleanLine = line.replace(/\*\*/g, '').trim();
            
            // Debug: Log lines that might be references
            if (cleanLine.includes('FRAMEWORK') || cleanLine.includes('References') || cleanLine.includes('ISO') || cleanLine.includes('CIS') || cleanLine.includes('A.')) {
              console.log('[References Debug] Found potential reference line:', cleanLine);
              console.log('[References Debug] showFrameworkReferences state:', showFrameworkReferences);
            }
            
            if (cleanLine === '') return <div key={index} className="h-3" />;
            
            // Hide FRAMEWORK REFERENCES header and sub-sections when toggle is off
            if (!showFrameworkReferences) {
              if (cleanLine.startsWith('FRAMEWORK REFERENCES:') ||
                  cleanLine.includes('Primary Requirements:') ||
                  cleanLine.includes('Supporting Requirements:') ||
                  cleanLine.includes('Cross-References:') ||
                  cleanLine.includes('Framework References for Selected Standards:') ||
                  cleanLine.match(/^(ISO 27001|ISO 27002|CIS Controls|GDPR|NIS2 Directive|DORA):/i) ||
                  cleanLine.match(/^Art\.\d+(\.\d+)*:/) || // NIS2 articles like "Art.20.1:", "Art.25.1:" etc.
                  cleanLine.match(/^A\.\d+(\.\d+)*:/) || // ISO codes like "A.5.1:", "A.6.2:", etc.
                  cleanLine.match(/^\d+\.\d+(\.\d+)?:/) || // All numeric codes like "7.5.1:", "9.3.2:", "14.1:" etc.
                  cleanLine.match(/^Article \d+:/) || // GDPR articles like "Article 32:"
                  cleanLine.match(/^Education\.\d+:/) || // Education.1: etc.
                  cleanLine.match(/^Government\.\d+:/)) { // Government.1: etc.
                console.log('[References Debug] HIDING reference line:', cleanLine);
                return null;
              }
            }
            
            // Track if we've hit OPERATIONAL EXCELLENCE section
            const isAfterOperationalExcellence = index > 0 && 
              getGuidanceContent().split('\n')
                .slice(0, index)
                .some(l => l.includes('🎯 OPERATIONAL EXCELLENCE INDICATORS'));
            
            // Hide EVERYTHING after OPERATIONAL EXCELLENCE when toggle is off
            if (!showOperationalExcellence && isAfterOperationalExcellence) {
              // Skip the header itself (it gets its own special rendering)
              if (!cleanLine.includes('🎯 OPERATIONAL EXCELLENCE INDICATORS')) {
                return null;
              }
            }
            
            // 🎯 Special styling for Operational Excellence Indicators header
            if (cleanLine.includes('🎯 OPERATIONAL EXCELLENCE INDICATORS')) {
              return (
                <div key={index} className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-2 border-emerald-400 p-6 mb-6 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 flex items-center">
                      <span className="text-3xl mr-3">🎯</span>
                      OPERATIONAL EXCELLENCE INDICATORS
                    </h3>
                    <button
                      onClick={() => setShowOperationalExcellence(!showOperationalExcellence)}
                      className="px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 border border-emerald-300 hover:border-emerald-500 rounded-md transition-colors duration-200 flex items-center gap-1"
                    >
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showOperationalExcellence ? 'transform rotate-180' : ''}`} />
                      {showOperationalExcellence ? 'Hide Details' : 'Show Details'}
                    </button>
                  </div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                    Your Compliance Scorecard - Track these metrics to demonstrate audit readiness
                  </p>
                </div>
              );
            }
            
            // Section headers for the scorecard categories (only match operational excellence section headers, not sub-requirements)
            if ((cleanLine.includes('FOUNDATIONAL CONTROLS') || 
                cleanLine.includes('ADVANCED CONTROLS') || 
                cleanLine.includes('AUDIT-READY DOCUMENTATION') || 
                cleanLine.includes('CONTINUOUS IMPROVEMENT')) && 
                !cleanLine.match(/^[a-z]\)/i)) { // Don't match sub-requirements like "o) CONTINUOUS IMPROVEMENT"
              
              const colors: Record<string, string> = {
                'FOUNDATIONAL CONTROLS': 'bg-blue-600 text-white',
                'ADVANCED CONTROLS': 'bg-purple-600 text-white', 
                'AUDIT-READY DOCUMENTATION': 'bg-orange-600 text-white',
                'CONTINUOUS IMPROVEMENT': 'bg-green-600 text-white'
              };
              
              const color = Object.keys(colors).find(key => cleanLine.includes(key));
              const colorClass = color ? colors[color] : 'bg-gray-600 text-white';
              
              return (
                <div key={index} className={`${colorClass} p-4 rounded-lg mb-4 mt-6`}>
                  <h4 className="font-bold text-lg flex items-center">
                    <span className="text-2xl mr-3">✅</span>
                    {cleanLine}
                  </h4>
                </div>
              );
            }
            
            // Framework References section with special styling
            if (cleanLine.includes('Framework References for Selected Standards:')) {
              if (!showFrameworkReferences) {
                return null; // Hide when references are not shown
              }
              return (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-500 p-5 mb-6 rounded-r-lg shadow-sm">
                  <h4 className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                    <span className="text-xl mr-2">📋</span>
                    Framework References for Selected Standards
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Specific control references mapped to your selected compliance frameworks
                  </p>
                </div>
              );
            }
            
            // Framework-specific references with enhanced styling
            if (cleanLine.match(/^(ISO 27001|ISO 27002|CIS Controls v8|GDPR|NIS2 Directive|DORA \(Digital Operational Resilience Act\)):/)) {
              if (!showFrameworkReferences) {
                return null; // Hide when references are not shown
              }
              const framework = cleanLine.split(':')[0];
              const content = cleanLine.split(':')[1];
              
              const frameworkColors: Record<string, string> = {
                'ISO 27001': 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 text-blue-800 dark:text-blue-200',
                'ISO 27002': 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-400 text-cyan-800 dark:text-cyan-200',
                'CIS Controls v8': 'bg-purple-50 dark:bg-purple-900/20 border-purple-400 text-purple-800 dark:text-purple-200',
                'GDPR': 'bg-orange-50 dark:bg-orange-900/20 border-orange-400 text-orange-800 dark:text-orange-200',
                'NIS2 Directive': 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-400 text-indigo-800 dark:text-indigo-200',
                'DORA (Digital Operational Resilience Act)': 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-800 dark:text-red-200'
              };
              
              const colorClass = frameworkColors[framework || ''] || 'bg-gray-50 dark:bg-gray-800/50 border-gray-400 text-gray-800 dark:text-gray-200';
              
              return (
                <div key={index} className={`ml-4 p-4 rounded-lg mb-3 border-l-4 ${colorClass}`}>
                  <div className="flex items-start space-x-3">
                    <span className="font-bold text-base shrink-0">{framework}:</span>
                    <p className="text-sm leading-relaxed">{content}</p>
                  </div>
                </div>
              );
            }
            
            // Major section headers (without **)
            if (line.startsWith('**') && line.endsWith('**') && !cleanLine.includes('✅')) {
              const headerText = line.replace(/\*\*/g, '');
              return (
                <div key={index} className="mt-8 mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white pb-3 border-b-2 border-gray-300 dark:border-gray-600 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-3"></span>
                    {headerText}
                  </h3>
                </div>
              );
            }
            
            // Subsection headers (bold but not wrapped in **)
            if (line.match(/^\*\*[^*]+\*\*$/) && !cleanLine.includes('✅')) {
              return (
                <h4 key={index} className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3 flex items-center">
                  <span className="w-1 h-6 bg-emerald-400 mr-3 rounded"></span>
                  {cleanLine}
                </h4>
              );
            }
            
            // ✅ Checkmark items with enhanced styling
            if (cleanLine.startsWith('✅')) {
              const content = cleanLine.replace('✅ ', '');
              const isBold = content.includes('**');
              const cleanContent = content.replace(/\*\*/g, '');
              
              return (
                <div key={index} className="flex items-start space-x-4 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r-lg mb-3 shadow-sm">
                  <span className="text-green-600 dark:text-green-400 text-xl shrink-0 mt-0.5">✅</span>
                  <p className={`text-green-800 dark:text-green-200 leading-relaxed ${isBold ? 'font-semibold text-base' : 'text-sm'}`}>
                    {cleanContent}
                  </p>
                </div>
              );
            }
            
            // 💡 PRO TIP styling
            if (cleanLine.startsWith('💡 PRO TIP:')) {
              return (
                <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-l-4 border-yellow-400 p-5 mb-6 rounded-r-lg shadow-lg">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <h4 className="font-bold text-yellow-800 dark:text-yellow-200 text-base mb-1">PRO TIP</h4>
                      <p className="text-yellow-700 dark:text-yellow-300 text-sm leading-relaxed">
                        {cleanLine.replace('💡 PRO TIP: ', '')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            
            // ⚠️ Important warnings
            if (cleanLine.startsWith('⚠️ IMPORTANT:')) {
              return (
                <div key={index} className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-l-4 border-red-400 p-5 mb-6 rounded-r-lg shadow-lg">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <h4 className="font-bold text-red-800 dark:text-red-200 text-base mb-1">IMPORTANT</h4>
                      <p className="text-red-700 dark:text-red-300 text-sm leading-relaxed">
                        {cleanLine.replace('⚠️ IMPORTANT: ', '')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            
            // 📝 Implementation note styling
            if (cleanLine.startsWith('📝 IMPLEMENTATION NOTE:')) {
              return (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-l-4 border-blue-400 p-5 mb-6 rounded-r-lg shadow-lg">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">📝</span>
                    <div>
                      <h4 className="font-bold text-blue-800 dark:text-blue-200 text-base mb-1">IMPLEMENTATION NOTE</h4>
                      <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                        {cleanLine.replace('📝 IMPLEMENTATION NOTE: ', '')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            
            // 🔍 Audit guidance styling
            if (cleanLine.startsWith('🔍 AUDIT GUIDANCE:')) {
              return (
                <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-l-4 border-purple-400 p-5 mb-6 rounded-r-lg shadow-lg">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">🔍</span>
                    <div>
                      <h4 className="font-bold text-purple-800 dark:text-purple-200 text-base mb-1">AUDIT GUIDANCE</h4>
                      <p className="text-purple-700 dark:text-purple-300 text-sm leading-relaxed">
                        {cleanLine.replace('🔍 AUDIT GUIDANCE: ', '')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            
            // 🎯 Action item styling
            if (cleanLine.startsWith('🎯 ACTION ITEM:')) {
              return (
                <div key={index} className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-l-4 border-emerald-400 p-5 mb-6 rounded-r-lg shadow-lg">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <h4 className="font-bold text-emerald-800 dark:text-emerald-200 text-base mb-1">ACTION ITEM</h4>
                      <p className="text-emerald-700 dark:text-emerald-300 text-sm leading-relaxed">
                        {cleanLine.replace('🎯 ACTION ITEM: ', '')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            
            // Regular paragraphs
            return (
              <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {cleanLine}
              </p>
            );
          })}
        </div>
        <div className="flex justify-end mt-6">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="px-6"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}