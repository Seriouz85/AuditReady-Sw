import React from 'react';
import { 
  Lightbulb,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface AIGuidanceModalProps {
  showUnifiedGuidance: boolean;
  setShowUnifiedGuidance: (show: boolean) => void;
  selectedGuidanceCategory: string;
  showFrameworkReferences: boolean;
  setShowFrameworkReferences: (show: boolean) => void;
  aiEnvironment: any;
  aiProviderInfo: any;
  getGuidanceContent: () => string;
}

export const AIGuidanceModal: React.FC<AIGuidanceModalProps> = ({
  showUnifiedGuidance,
  setShowUnifiedGuidance,
  selectedGuidanceCategory,
  showFrameworkReferences,
  setShowFrameworkReferences,
  aiEnvironment,
  aiProviderInfo,
  getGuidanceContent
}) => {
  return (
    <Dialog open={showUnifiedGuidance} onOpenChange={setShowUnifiedGuidance}>
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
                    <span className="text-base">{aiProviderInfo.icon}</span>
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
                onClick={() => setShowFrameworkReferences(!showFrameworkReferences)}
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
          {(selectedGuidanceCategory ? getGuidanceContent() : 'No category selected').split('\n').map((line, index) => {
            // Clean line but preserve bold formatting markers
            const cleanLine = line.trim();
            
            if (cleanLine === '') return <div key={index} className="h-3" />;
            
            // Hide FRAMEWORK REFERENCES header and sub-sections when toggle is off
            if (!showFrameworkReferences) {
              if (cleanLine.startsWith('FRAMEWORK REFERENCES:') ||
                  cleanLine.includes('Primary Requirements:') ||
                  cleanLine.includes('Supporting Requirements:') ||
                  cleanLine.includes('Cross-References:') ||
                  cleanLine.includes('Framework References for Selected Standards:') ||
                  cleanLine.match(/^(ISO 27001|ISO 27002|CIS Controls|GDPR|NIS2 Directive|DORA):/i) ||
                  // Match any line that looks like a requirement reference format
                  cleanLine.match(/^[A-Z0-9.\-]+:/)) {
                return null;
              }
            }
            
            // Section headers in CAPS
            if (cleanLine.match(/^[A-Z\s&]+:$/) && cleanLine.length < 50) {
              return (
                <h3 key={index} className="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  {cleanLine.replace(':', '')}
                </h3>
              );
            }
            
            // Framework headers (ISO 27001:, CIS Controls:, etc.)
            if (cleanLine.match(/^(ISO 27001|ISO 27002|CIS Controls|GDPR|NIS2 Directive|DORA):/i)) {
              return (
                <h4 key={index} className="text-base font-semibold text-blue-800 dark:text-blue-200 mt-4 mb-2 flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>{cleanLine}</span>
                </h4>
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
            
            // Phase headers (Phase 1:, Phase 2:, etc.)
            if (cleanLine.match(/^Phase \d+:/)) {
              return (
                <div key={index} className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg mb-3 border-l-4 border-indigo-400">
                  <p className="font-semibold text-indigo-800 dark:text-indigo-200 text-base">{cleanLine}</p>
                </div>
              );
            }
            
            // Implementation phases or numbered items
            if (cleanLine.match(/^\d+\./)) {
              return (
                <div key={index} className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg mb-2 border-l-2 border-gray-400">
                  <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{cleanLine}</p>
                </div>
              );
            }

            // Handle indented requirement subcategories (Primary Requirements, Supporting Requirements, Cross-References)
            if (line.trim().match(/^(Primary Requirements|Supporting Requirements|Cross-References):/)) {
              const subcategoryText = line.trim();
              return (
                <div key={index} className="ml-8 mt-3 mb-2">
                  <h5 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{subcategoryText}</h5>
                </div>
              );
            }

            // Handle deeply indented requirement items (individual requirements under subcategories)
            if (line.match(/^ {4}[A-Z0-9.\-]+:/)) {
              const requirementText = line.trim();
              const [code, title] = requirementText.split(': ');
              return (
                <div key={index} className="ml-12 mb-1 flex items-start space-x-2">
                  <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300 shrink-0">
                    {code}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{title}</span>
                </div>
              );
            }
            
            // Handle **bold** markdown formatting
            if (cleanLine.includes('**')) {
              const parts = cleanLine.split('**');
              const formattedParts = parts.map((part, partIndex) => {
                if (partIndex % 2 === 1) {
                  // This part should be bold
                  return <strong key={partIndex} className="font-bold text-gray-900 dark:text-gray-100">{part}</strong>;
                }
                return part;
              });
              
              return (
                <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 text-sm">
                  {formattedParts}
                </p>
              );
            }
            
            // Subsection titles (a), b), c) etc. with bold styling
            if (cleanLine.match(/^[a-z]\)\s+/)) {
              // Match only the letter and the title part (until first period, colon, or end of reasonable title)
              const subsectionMatch = cleanLine.match(/^([a-z]\)\s+[^.\n]*(?:\.[^a-z]|$)?)/);
              if (subsectionMatch && subsectionMatch[1]) {
                // Find a better breaking point - look for title that's reasonable length
                const letterMatch = cleanLine.match(/^([a-z]\))\s+([^.\n]{1,80})/);
                if (letterMatch && letterMatch[2]) {
                  const letter = letterMatch[1];
                  const titleText = letterMatch[2].trim();
                  const remainingText = cleanLine.substring((letter + ' ' + titleText).length);
                  
                  return (
                    <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 text-sm">
                      <span className="font-bold text-gray-900 dark:text-gray-100">{letter} {titleText}</span>
                      {remainingText}
                    </p>
                  );
                }
              }
            }
            
            // Regular paragraph text
            return (
              <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 text-sm">
                {cleanLine}
              </p>
            );
          })}
        </div>
        <div className="flex justify-end mt-6">
          <Button 
            variant="outline" 
            onClick={() => setShowUnifiedGuidance(false)}
            className="px-6"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};