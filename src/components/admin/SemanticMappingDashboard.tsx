import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Zap, 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Upload,
  Settings,
  BarChart3
} from 'lucide-react';
import { semanticMapper } from '@/services/compliance/SemanticMappingEngine';

interface ProcessingStats {
  total: number;
  autoMapped: number;
  needsReview: number;
  newCategories: number;
  confidence: number;
}

export default function SemanticMappingDashboard() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStats, setProcessingStats] = useState<ProcessingStats | null>(null);
  const [indexingProgress, setIndexingProgress] = useState(0);
  const [currentFramework, setCurrentFramework] = useState('');

  const handleIndexRequirements = async () => {
    setIsProcessing(true);
    setIndexingProgress(0);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setIndexingProgress(prev => Math.min(prev + 10, 90));
      }, 500);
      
      await semanticMapper.indexExistingRequirements();
      
      clearInterval(progressInterval);
      setIndexingProgress(100);
      
      setTimeout(() => {
        setIsProcessing(false);
        setIndexingProgress(0);
      }, 2000);
      
    } catch (error) {
      console.error('Indexing failed:', error);
      setIsProcessing(false);
    }
  };

  const simulateFrameworkProcessing = (framework: string) => {
    setCurrentFramework(framework);
    setIsProcessing(true);
    
    // Simulate AI processing with realistic stats
    setTimeout(() => {
      const mockStats: ProcessingStats = {
        total: Math.floor(Math.random() * 150) + 50,
        autoMapped: 0,
        needsReview: 0,
        newCategories: Math.floor(Math.random() * 3) + 1,
        confidence: Math.floor(Math.random() * 20) + 80
      };
      
      mockStats.autoMapped = Math.floor(mockStats.total * 0.7);
      mockStats.needsReview = mockStats.total - mockStats.autoMapped;
      
      setProcessingStats(mockStats);
      setIsProcessing(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-6 w-6 text-purple-600" />
        <h2 className="text-2xl font-semibold">AI Semantic Mapping Engine</h2>
        <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-blue-100">
          <Zap className="h-3 w-3 mr-1" />
          BETA
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Overview */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Processing Statistics
            </CardTitle>
            <CardDescription>
              AI-powered automatic framework mapping results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {processingStats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{processingStats.total}</div>
                  <div className="text-sm text-gray-600">Total Requirements</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{processingStats.autoMapped}</div>
                  <div className="text-sm text-gray-600">Auto-Mapped</div>
                  <div className="text-xs text-green-500 mt-1">
                    {Math.round((processingStats.autoMapped / processingStats.total) * 100)}% success
                  </div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">{processingStats.needsReview}</div>
                  <div className="text-sm text-gray-600">Needs Review</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{processingStats.confidence}%</div>
                  <div className="text-sm text-gray-600">Avg Confidence</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Process a framework to see statistics
              </div>
            )}
          </CardContent>
        </Card>

        {/* Index Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Index Management
            </CardTitle>
            <CardDescription>
              Prepare the AI engine for semantic matching
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleIndexRequirements} 
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Indexing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Index Requirements
                </>
              )}
            </Button>
            
            {isProcessing && indexingProgress > 0 && (
              <div className="space-y-2">
                <Progress value={indexingProgress} className="w-full" />
                <p className="text-sm text-gray-600 text-center">
                  {indexingProgress}% complete
                </p>
              </div>
            )}
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Run this once before processing new frameworks. Takes ~2-3 minutes.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Framework Processing */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Framework Processing
            </CardTitle>
            <CardDescription>
              Add new compliance frameworks with AI-powered mapping
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="soc2" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="soc2">SOC 2</TabsTrigger>
                <TabsTrigger value="nist">NIST</TabsTrigger>
                <TabsTrigger value="pci">PCI DSS</TabsTrigger>
                <TabsTrigger value="hipaa">HIPAA</TabsTrigger>
              </TabsList>
              
              {['soc2', 'nist', 'pci', 'hipaa'].map((framework) => (
                <TabsContent key={framework} value={framework} className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium capitalize">{framework.toUpperCase()} Framework</h4>
                        <p className="text-sm text-gray-600">
                          AI will analyze and map {framework.toUpperCase()} requirements
                        </p>
                      </div>
                      <Button 
                        onClick={() => simulateFrameworkProcessing(framework)}
                        disabled={isProcessing}
                        size="sm"
                      >
                        {isProcessing && currentFramework === framework ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Target className="h-4 w-4 mr-2" />
                            Process
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {currentFramework === framework && processingStats && (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription>
                          Successfully processed {processingStats.total} requirements. 
                          {processingStats.autoMapped} auto-mapped, {processingStats.needsReview} need review.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Semantic Mapping Works</CardTitle>
          <CardDescription>
            Understanding the AI-powered framework integration process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-medium">Text Analysis</h4>
              <p className="text-sm text-gray-600">
                AI converts requirements into mathematical vectors capturing their semantic meaning
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-medium">Similarity Matching</h4>
              <p className="text-sm text-gray-600">
                Finds conceptually similar requirements using cosine similarity algorithms
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-medium">Auto-Mapping</h4>
              <p className="text-sm text-gray-600">
                High-confidence matches are automatically mapped to existing unified requirements
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <h4 className="font-medium">Human Review</h4>
              <p className="text-sm text-gray-600">
                Low-confidence matches and new requirements are flagged for expert review
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}