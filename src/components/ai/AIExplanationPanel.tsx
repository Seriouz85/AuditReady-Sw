import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ThumbsUp, ThumbsDown, Copy, Share2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AIExplanation {
  id: string;
  title: string;
  explanation: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  sources: string[];
}

interface AIExplanationPanelProps {
  explanation?: AIExplanation;
  isLoading?: boolean;
  onFeedback?: (explanationId: string, positive: boolean) => void;
}

export const AIExplanationPanel: React.FC<AIExplanationPanelProps> = ({
  explanation,
  isLoading = false,
  onFeedback
}) => {
  const [feedback, setFeedback] = useState<boolean | null>(null);

  const handleFeedback = (positive: boolean) => {
    setFeedback(positive);
    onFeedback?.(explanation?.id || '', positive);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'border-red-500/30 bg-red-500/10 text-red-300';
      case 'high': return 'border-orange-500/30 bg-orange-500/10 text-orange-300';
      case 'medium': return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300';
      case 'low': return 'border-green-500/30 bg-green-500/10 text-green-300';
      default: return 'border-slate-500/30 bg-slate-500/10 text-slate-300';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-6 h-6 text-blue-400" />
            </motion.div>
            <span className="text-white">AI is analyzing...</span>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                className="h-4 bg-slate-700/50 rounded"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!explanation) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardContent className="p-6 text-center">
          <Brain className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">No AI analysis available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border-slate-700/50 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-3 text-white">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Brain className="w-5 h-5 text-blue-400" />
                </div>
                <span>{explanation.title}</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge className={`${getRiskColor(explanation.riskLevel)} border`}>
                  {explanation.riskLevel.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="bg-blue-500/10 border-blue-400/30 text-blue-300">
                  {explanation.confidence}% confident
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Main Explanation */}
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 leading-relaxed">{explanation.explanation}</p>
            </div>

            {/* Recommendations */}
            {explanation.recommendations.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
                  AI Recommendations
                </h4>
                <div className="space-y-2">
                  {explanation.recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-slate-700/30 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">{rec}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Sources */}
            {explanation.sources.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-3">Sources</h4>
                <div className="flex flex-wrap gap-2">
                  {explanation.sources.map((source, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="bg-slate-700/30 border-slate-600 text-slate-300"
                    >
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-400">Was this helpful?</span>
                <Button
                  size="sm"
                  variant={feedback === true ? "default" : "ghost"}
                  onClick={() => handleFeedback(true)}
                  className="h-8 w-8 p-0"
                >
                  <ThumbsUp className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={feedback === false ? "default" : "ghost"}
                  onClick={() => handleFeedback(false)}
                  className="h-8 w-8 p-0"
                >
                  <ThumbsDown className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};