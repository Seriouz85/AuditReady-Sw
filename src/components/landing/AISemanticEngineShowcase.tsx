import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Target, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  ChevronRight,
  BarChart3,
  Layers,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ProcessingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  progress: number;
  isActive: boolean;
  isComplete: boolean;
}

interface MappingResult {
  framework: string;
  requirement: string;
  unifiedMatch: string;
  confidence: number;
  mappingStrength: 'exact' | 'strong' | 'partial';
}

export default function AISemanticEngineShowcase() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [progress, setProgress] = useState(0);

  const processingSteps: ProcessingStep[] = [
    {
      id: 1,
      title: "Text Analysis",
      description: "Converting SOC 2 requirements into semantic vectors",
      icon: <Brain className="w-5 h-5" />,
      color: "blue",
      progress: 0,
      isActive: false,
      isComplete: false
    },
    {
      id: 2,
      title: "Similarity Matching",
      description: "Finding conceptually similar unified requirements",
      icon: <Target className="w-5 h-5" />,
      color: "purple",
      progress: 0,
      isActive: false,
      isComplete: false
    },
    {
      id: 3,
      title: "Auto-Mapping",
      description: "Creating high-confidence mappings automatically",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "green",
      progress: 0,
      isActive: false,
      isComplete: false
    }
  ];

  const mockResults: MappingResult[] = [
    {
      framework: "SOC 2",
      requirement: "CC6.1 - Logical access controls restrict access to data and system functionality",
      unifiedMatch: "Access Control & Identity Management",
      confidence: 94,
      mappingStrength: "exact"
    },
    {
      framework: "SOC 2", 
      requirement: "CC7.2 - System vulnerabilities are identified and managed",
      unifiedMatch: "Risk Management & Assessment",
      confidence: 89,
      mappingStrength: "strong"
    },
    {
      framework: "SOC 2",
      requirement: "CC8.1 - Change management processes are implemented",
      unifiedMatch: "Governance & Leadership", 
      confidence: 87,
      mappingStrength: "strong"
    }
  ];

  const stats = {
    totalRequirements: 147,
    autoMapped: 127,
    needsReview: 20,
    avgConfidence: 91
  };

  useEffect(() => {
    if (isProcessing) {
      const stepDuration = 2000; // 2 seconds per step
      const progressInterval = 50; // Update every 50ms for smooth animation
      
      let currentProgress = 0;
      const totalSteps = processingSteps.length;
      
      const progressTimer = setInterval(() => {
        const stepIndex = Math.floor(currentProgress / (100 / totalSteps));
        const stepProgress = (currentProgress % (100 / totalSteps)) * totalSteps;
        
        setCurrentStep(stepIndex);
        setProgress(stepProgress);
        
        if (currentProgress >= 100) {
          clearInterval(progressTimer);
          setShowResults(true);
          setIsProcessing(false);
        } else {
          currentProgress += (100 / totalSteps) / (stepDuration / progressInterval);
        }
      }, progressInterval);

      return () => clearInterval(progressTimer);
    }
  }, [isProcessing]);

  const startDemo = () => {
    setIsProcessing(true);
    setShowResults(false);
    setCurrentStep(0);
    setProgress(0);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-50';
    if (confidence >= 80) return 'text-blue-600 bg-blue-50';
    return 'text-orange-600 bg-orange-50';
  };

  const getMappingBadgeColor = (strength: string) => {
    switch (strength) {
      case 'exact': return 'bg-green-100 text-green-800 border-green-200';
      case 'strong': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'partial': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <section className="py-24 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border-purple-200">
            <Sparkles className="w-4 h-4 mr-2" />
            Revolutionary AI Technology
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 dark:from-gray-100 dark:via-purple-100 dark:to-blue-100 bg-clip-text text-transparent mb-6">
            Semantic Mapping Engine
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Watch AI automatically map new compliance frameworks to your existing requirements. 
            <span className="font-semibold text-purple-600"> Zero breaking changes, 90% time savings.</span>
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Demo Interface */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-2xl border-0">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    AI Framework Processor
                  </h3>
                  <Button 
                    onClick={startDemo} 
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isProcessing ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Process SOC 2
                      </>
                    )}
                  </Button>
                </div>

                {/* Processing Steps */}
                <div className="space-y-6">
                  {processingSteps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0.5 }}
                      animate={{ 
                        opacity: currentStep >= index || showResults ? 1 : 0.5,
                        scale: currentStep === index && isProcessing ? 1.02 : 1
                      }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 ${
                        currentStep >= index || showResults
                          ? `border-${step.color}-200 bg-${step.color}-50 dark:bg-${step.color}-900/20`
                          : 'border-gray-200 bg-gray-50 dark:bg-gray-800'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        currentStep >= index || showResults
                          ? `bg-${step.color}-500 text-white`
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {showResults || currentStep > index ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {step.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {step.description}
                        </p>
                        {currentStep === index && isProcessing && (
                          <Progress value={progress} className="mt-2 h-2" />
                        )}
                      </div>
                      {(showResults || currentStep > index) && (
                        <CheckCircle className={`w-6 h-6 text-${step.color}-500`} />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Results */}
                <AnimatePresence>
                  {showResults && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <h4 className="text-lg font-semibold text-green-800 dark:text-green-400">
                          Processing Complete!
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-white/50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{stats.autoMapped}</div>
                          <div className="text-sm text-gray-600">Auto-Mapped</div>
                        </div>
                        <div className="text-center p-3 bg-white/50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{stats.avgConfidence}%</div>
                          <div className="text-sm text-gray-600">Avg Confidence</div>
                        </div>
                      </div>

                      <div className="text-sm text-green-700 dark:text-green-400">
                        <strong>{stats.autoMapped}</strong> requirements automatically mapped, 
                        <strong> {stats.needsReview}</strong> flagged for review
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              Mapping Results
            </h3>
            
            <AnimatePresence>
              {(showResults || !isProcessing) && mockResults.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className={getMappingBadgeColor(result.mappingStrength)}>
                          {result.mappingStrength} match
                        </Badge>
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getConfidenceColor(result.confidence)}`}>
                          {result.confidence}%
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-1">
                            {result.framework} Requirement
                          </div>
                          <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                            {result.requirement}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-center py-2">
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                        </div>
                        
                        <div>
                          <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">
                            Mapped to Unified Category
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            {result.unifiedMatch}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {!showResults && !isProcessing && (
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800">
                <CardContent className="p-8 text-center">
                  <Layers className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Ready to Process
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Click "Process SOC 2" to see the AI semantic mapping engine in action
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {[
            { label: "Time Saved", value: "90%", icon: Clock, color: "green" },
            { label: "Auto-Mapping Accuracy", value: "85%+", icon: Target, color: "blue" },
            { label: "Frameworks Supported", value: "12+", icon: Layers, color: "purple" },
            { label: "Zero Breaking Changes", value: "100%", icon: CheckCircle, color: "emerald" }
          ].map((stat, index) => (
            <Card key={index} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6 text-center">
                <stat.icon className={`w-8 h-8 text-${stat.color}-500 mx-auto mb-3`} />
                <div className={`text-2xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400 mb-1`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
}