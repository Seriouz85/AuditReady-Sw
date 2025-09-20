import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  BookOpen, 
  Lightbulb, 
  Target, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  ExternalLink,
  Copy,
  Download
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GuidanceContent } from '@/services/compliance/DynamicContentGenerator';
import { FrameworkReference } from '@/services/compliance/ContentDeduplicator';

interface UnifiedGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  guidanceContent: GuidanceContent | null;
  references: FrameworkReference[];
}

export function UnifiedGuidanceModal({
  isOpen,
  onClose,
  guidanceContent,
  references
}: UnifiedGuidanceModalProps) {
  
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = async (text: string, sectionId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionId);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const exportGuidance = () => {
    if (!guidanceContent) return;

    const content = [
      `# ${guidanceContent.title}`,
      '',
      `## Description`,
      guidanceContent.description,
      '',
      ...guidanceContent.sections.map(section => [
        `## ${section.title}`,
        section.content,
        ...(section.bestPractices ? [
          '### Best Practices:',
          ...section.bestPractices.map(bp => `- ${bp}`)
        ] : []),
        ...(section.examples ? [
          '### Examples:',
          ...section.examples.map(ex => `- ${ex}`)
        ] : []),
        ''
      ]).flat(),
      '## Practical Tips',
      ...guidanceContent.tips.map(tip => `- ${tip}`),
      '',
      '## Framework References',
      ...references.map(ref => [
        `### ${ref.framework}`,
        `Codes: ${ref.codes.join(', ')}`,
        `Strength: ${ref.strength}`,
        ''
      ]).flat()
    ].join('\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${guidanceContent.category.replace(/\s+/g, '_')}_guidance.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!guidanceContent) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-black/95 backdrop-blur-md border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">Loading Guidance...</DialogTitle>
          </DialogHeader>
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Generating guidance content...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-black/95 backdrop-blur-md border-gray-800 overflow-hidden">
        <DialogHeader className="border-b border-gray-800 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl text-cyan-400 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {guidanceContent.title}
              </DialogTitle>
              <p className="text-sm text-gray-400 mt-1">
                {guidanceContent.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={exportGuidance}
                className="text-cyan-400 border-cyan-500/50"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button size="sm" variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Framework Badges */}
          {guidanceContent.frameworks.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {guidanceContent.frameworks.map(framework => (
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
          )}
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
          <Tabs defaultValue="guidance" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-900/50">
              <TabsTrigger value="guidance" className="data-[state=active]:bg-cyan-500/20">
                <BookOpen className="h-4 w-4 mr-1" />
                Guidance
              </TabsTrigger>
              <TabsTrigger value="references" className="data-[state=active]:bg-cyan-500/20">
                <FileText className="h-4 w-4 mr-1" />
                References ({references.length})
              </TabsTrigger>
              <TabsTrigger value="tips" className="data-[state=active]:bg-cyan-500/20">
                <Lightbulb className="h-4 w-4 mr-1" />
                Tips ({guidanceContent.tips.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="guidance" className="mt-4 space-y-4">
              {guidanceContent.sections.length > 0 ? (
                guidanceContent.sections.map((section, index) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="bg-black/40 backdrop-blur-md border-gray-800/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg text-white flex items-center gap-2">
                            <Target className="h-5 w-5 text-cyan-400" />
                            {section.title}
                          </CardTitle>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(section.content, section.id)}
                            className="text-gray-400 hover:text-cyan-400"
                          >
                            {copiedSection === section.id ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {section.frameworks.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {section.frameworks.map(framework => (
                              <Badge key={framework} variant="secondary" className="text-xs">
                                {framework}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-invert prose-sm max-w-none">
                          <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                            {section.content}
                          </div>
                        </div>

                        {/* Best Practices */}
                        {section.bestPractices && section.bestPractices.length > 0 && (
                          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <h4 className="text-sm font-semibold text-green-300 mb-2 flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Best Practices
                            </h4>
                            <ul className="text-sm text-gray-300 space-y-1">
                              {section.bestPractices.map((practice, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-green-400 mt-1">•</span>
                                  <span>{practice}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Examples */}
                        {section.examples && section.examples.length > 0 && (
                          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-1">
                              <Lightbulb className="h-4 w-4" />
                              Examples
                            </h4>
                            <ul className="text-sm text-gray-300 space-y-1">
                              {section.examples.map((example, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-blue-400 mt-1">•</span>
                                  <span>{example}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card className="bg-black/40 backdrop-blur-md border-gray-800/50">
                  <CardContent className="p-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">
                      No guidance sections available
                    </h3>
                    <p className="text-gray-500">
                      Guidance content is being generated dynamically based on your selected frameworks.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="references" className="mt-4 space-y-3">
              {references.length > 0 ? (
                references.map((reference, index) => (
                  <motion.div
                    key={reference.framework}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="bg-black/40 backdrop-blur-md border-gray-800/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-white">{reference.framework}</h3>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  reference.strength === 'exact' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                  reference.strength === 'strong' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                  reference.strength === 'partial' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                  'bg-gray-500/20 text-gray-300 border-gray-500/30'
                                }`}
                              >
                                {reference.strength}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div>
                                <span className="text-xs text-gray-400 uppercase tracking-wide">Codes:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {reference.codes.map(code => (
                                    <Badge key={code} variant="secondary" className="text-xs font-mono">
                                      {code}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              {reference.titles.length > 0 && (
                                <div>
                                  <span className="text-xs text-gray-400 uppercase tracking-wide">Requirements:</span>
                                  <ul className="text-sm text-gray-300 mt-1 space-y-1">
                                    {reference.titles.slice(0, 3).map((title, idx) => (
                                      <li key={idx} className="flex items-start gap-2">
                                        <span className="text-cyan-400 mt-1 text-xs">•</span>
                                        <span className="line-clamp-2">{title}</span>
                                      </li>
                                    ))}
                                    {reference.titles.length > 3 && (
                                      <li className="text-xs text-gray-500 ml-4">
                                        +{reference.titles.length - 3} more requirements
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(
                              `${reference.framework}: ${reference.codes.join(', ')}`,
                              reference.framework
                            )}
                            className="text-gray-400 hover:text-cyan-400"
                          >
                            {copiedSection === reference.framework ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card className="bg-black/40 backdrop-blur-md border-gray-800/50">
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">
                      No references available
                    </h3>
                    <p className="text-gray-500">
                      Framework references will appear here once requirements are loaded.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="tips" className="mt-4 space-y-3">
              {guidanceContent.tips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {guidanceContent.tips.map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="bg-black/40 backdrop-blur-md border-gray-800/50 h-full">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-cyan-500/20 p-2 rounded-lg flex-shrink-0">
                              <Lightbulb className="h-4 w-4 text-cyan-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-300 leading-relaxed">{tip}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(tip, `tip-${index}`)}
                              className="text-gray-400 hover:text-cyan-400 flex-shrink-0"
                            >
                              {copiedSection === `tip-${index}` ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="bg-black/40 backdrop-blur-md border-gray-800/50">
                  <CardContent className="p-8 text-center">
                    <Lightbulb className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">
                      No tips available
                    </h3>
                    <p className="text-gray-500">
                      Practical tips will be generated based on your selected frameworks.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}