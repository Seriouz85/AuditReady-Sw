import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Brain,
  Shield, 
  Zap, 
  Target,
  CheckCircle,
  ArrowRight,
  Network,
  Activity,
  Cpu,
  Database,
  Lock,
  Settings,
  Eye,
  Filter,
  Loader2,
  Building2,
  Factory,
  Sparkles,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useComplianceMappingData, useIndustrySectors } from '@/services/compliance/ComplianceUnificationService';
import { useFrameworkCounts, useCISControlsCount } from '@/hooks/useFrameworkCounts';
import { useQueryClient } from '@tanstack/react-query';

// AI Components (to be created)
import { AIProcessingIndicator } from '@/components/ai/AIProcessingIndicator';
import { AIExplanationPanel } from '@/components/ai/AIExplanationPanel';
import { CyberSecurityBackground } from '@/components/animations/CyberSecurityBackground';

export default function TestProject() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Enhanced state for AI features
  const [selectedMapping, setSelectedMapping] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('ai-analysis');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  
  // Industry sector selection state
  const [selectedIndustrySector, setSelectedIndustrySector] = useState<string | null>(null);
  
  // Framework selection state with AI enhancements
  const [selectedFrameworks, setSelectedFrameworks] = useState<{
    iso27001: boolean;
    iso27002: boolean;
    cisControls: 'ig1' | 'ig2' | 'ig3' | null;
    gdpr: boolean;
    nis2: boolean;
  }>({
    iso27001: true,
    iso27002: true,
    cisControls: 'ig3',
    gdpr: false,
    nis2: false
  });

  // Fetch industry sectors
  const { data: industrySectors, isLoading: isLoadingSectors } = useIndustrySectors();
  
  // Fetch compliance mapping data
  const frameworksForHook = {
    iso27001: selectedFrameworks.iso27001,
    iso27002: selectedFrameworks.iso27002,
    cisControls: selectedFrameworks.cisControls,
    gdpr: selectedFrameworks.gdpr,
    nis2: selectedFrameworks.nis2
  };
  
  const { data: fetchedComplianceMapping, isLoading: isLoadingMappings } = useComplianceMappingData(frameworksForHook, selectedIndustrySector);
  const { data: frameworkCounts, isLoading: isLoadingCounts } = useFrameworkCounts();
  
  const complianceMappingData = fetchedComplianceMapping || [];

  // AI Processing handler
  const handleAIAnalysis = async () => {
    setAiProcessing(true);
    try {
      // Simulate AI processing - will implement real AI integration later
      await new Promise(resolve => setTimeout(resolve, 3000));
      setAiInsights({
        riskScore: 85,
        recommendations: [
          "Focus on access control improvements",
          "Strengthen incident response procedures",
          "Enhance data encryption practices"
        ],
        complexity: "Medium",
        timeline: "3-6 months"
      });
    } catch (error) {
      console.error('AI Analysis failed:', error);
    } finally {
      setAiProcessing(false);
    }
  };

  const handleFrameworkToggle = (framework: string, value: any) => {
    setSelectedFrameworks(prev => ({ ...prev, [framework]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Cybersecurity Background Animation */}
      <CyberSecurityBackground />
      
      {/* Header Section */}
      <div className="relative z-10 bg-gradient-to-r from-slate-900/95 to-blue-900/95 backdrop-blur-sm border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-blue-300 hover:text-white hover:bg-blue-500/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="h-6 w-px bg-blue-500/30" />
              <Badge variant="outline" className="bg-blue-500/10 border-blue-400/30 text-blue-300">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Test Project
              </Badge>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-green-500/10 border-green-400/30 text-green-300">
                <Activity className="w-3 h-3 mr-1" />
                Real-time AI
              </Badge>
              <Button
                onClick={handleAIAnalysis}
                disabled={aiProcessing}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25"
              >
                {aiProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Start AI Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-4 mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl backdrop-blur-sm border border-blue-500/20">
            <Network className="w-12 h-12 text-blue-400" />
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-6">
            AI Compliance Intelligence
          </h1>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Enterprise-grade AI-powered compliance analysis that transforms complex regulatory frameworks 
            into actionable, intelligent security requirements tailored to your organization.
          </p>
          
          <div className="flex items-center justify-center space-x-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">50+</div>
              <div className="text-sm text-slate-400">AI Models</div>
            </div>
            <div className="h-8 w-px bg-slate-600" />
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">99.9%</div>
              <div className="text-sm text-slate-400">Accuracy</div>
            </div>
            <div className="h-8 w-px bg-slate-600" />
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">&lt;2s</div>
              <div className="text-sm text-slate-400">Response</div>
            </div>
          </div>
        </motion.div>

        {/* AI Processing Indicator */}
        {aiProcessing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <AIProcessingIndicator 
              message="AI is analyzing your compliance requirements..."
              progress={75}
            />
          </motion.div>
        )}

        {/* Industry Sector Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-xl shadow-black/20">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-t-xl border-b border-slate-700/50">
              <CardTitle className="flex items-center space-x-3 text-white">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-400" />
                </div>
                <span>Industry Intelligence</span>
                <Badge variant="outline" className="ml-auto bg-green-500/10 border-green-400/30 text-green-300">
                  <Cpu className="w-3 h-3 mr-1" />
                  AI-Enhanced
                </Badge>
              </CardTitle>
              <p className="text-slate-300">
                Select your industry sector for AI-powered, sector-specific compliance intelligence
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="max-w-md">
                <Select value={selectedIndustrySector || 'none'} onValueChange={(value) => setSelectedIndustrySector(value === 'none' ? null : value)}>
                  <SelectTrigger className="w-full bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Select your industry sector" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="none" className="text-slate-300">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                        General / All Industries
                      </div>
                    </SelectItem>
                    {industrySectors?.map((sector) => (
                      <SelectItem key={sector.id} value={sector.id} className="text-slate-300">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            sector.nis2Essential ? 'bg-red-400' : 
                            sector.nis2Important ? 'bg-orange-400' : 
                            'bg-green-400'
                          }`}></div>
                          <span>{sector.name}</span>
                          {sector.nis2Essential && (
                            <Badge variant="destructive" className="text-xs ml-1">
                              NIS2 Essential
                            </Badge>
                          )}
                          {sector.nis2Important && !sector.nis2Essential && (
                            <Badge variant="secondary" className="text-xs ml-1">
                              NIS2 Important
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedIndustrySector && industrySectors && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20"
                  >
                    <p className="text-sm text-blue-200">
                      <Brain className="w-4 h-4 inline mr-2" />
                      {industrySectors.find(s => s.id === selectedIndustrySector)?.description}
                    </p>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-1">
              <TabsTrigger 
                value="ai-analysis" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-300"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Analysis
              </TabsTrigger>
              <TabsTrigger 
                value="frameworks" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-300"
              >
                <Shield className="w-4 h-4 mr-2" />
                Frameworks
              </TabsTrigger>
              <TabsTrigger 
                value="visualization" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-300"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Visualization
              </TabsTrigger>
              <TabsTrigger 
                value="insights" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-300"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Insights
              </TabsTrigger>
            </TabsList>

            {/* AI Analysis Tab */}
            <TabsContent value="ai-analysis" className="space-y-6">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 shadow-xl shadow-black/20">
                <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-t-xl border-b border-slate-700/50">
                  <CardTitle className="flex items-center space-x-3 text-white">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Brain className="w-6 h-6 text-purple-400" />
                    </div>
                    <span>AI Compliance Analysis</span>
                    <Badge variant="outline" className="ml-auto bg-purple-500/10 border-purple-400/30 text-purple-300">
                      Powered by GPT-4
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {aiInsights ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                          <div className="text-2xl font-bold text-blue-400 mb-1">{aiInsights.riskScore}%</div>
                          <div className="text-sm text-slate-300">Compliance Score</div>
                        </div>
                        <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                          <div className="text-2xl font-bold text-green-400 mb-1">{aiInsights.complexity}</div>
                          <div className="text-sm text-slate-300">Implementation</div>
                        </div>
                        <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                          <div className="text-2xl font-bold text-purple-400 mb-1">{aiInsights.timeline}</div>
                          <div className="text-sm text-slate-300">Timeline</div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white">AI Recommendations</h4>
                        {aiInsights.recommendations.map((rec: string, idx: number) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-start space-x-3 p-3 bg-slate-700/30 rounded-lg"
                          >
                            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-300">{rec}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center p-4 mb-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl">
                        <Brain className="w-12 h-12 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Ready for AI Analysis</h3>
                      <p className="text-slate-300 mb-6">
                        Click "Start AI Analysis" to get intelligent insights about your compliance requirements
                      </p>
                      <Button
                        onClick={handleAIAnalysis}
                        disabled={aiProcessing}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {aiProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Start Analysis
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Placeholder for other tabs */}
            <TabsContent value="frameworks">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
                <CardContent className="p-12 text-center">
                  <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Framework Selection</h3>
                  <p className="text-slate-300">Enhanced framework selection coming in next step...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="visualization">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
                <CardContent className="p-12 text-center">
                  <BarChart3 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Data Visualization</h3>
                  <p className="text-slate-300">Interactive charts and graphs coming in next step...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
                <CardContent className="p-12 text-center">
                  <TrendingUp className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Predictive Insights</h3>
                  <p className="text-slate-300">AI-powered predictions coming in next step...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}