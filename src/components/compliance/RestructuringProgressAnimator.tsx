/**
 * RestructuringProgressAnimator.tsx
 * 
 * Progressive animation system for category-by-category AI text restructuring.
 * Shows real-time progress as categories are processed with professional animations.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, Zap, Loader2, Brain, Sparkles } from 'lucide-react';

export interface CategoryProgress {
  name: string;
  status: 'pending' | 'restructuring' | 'completed' | 'error';
  progress: number; // 0-100
  processingTimeMs?: number;
  reductionPercentage?: number;
  qualityScore?: number;
  errorMessage?: string;
}

export interface RestructuringProgressProps {
  categories: CategoryProgress[];
  isVisible: boolean;
  onComplete?: () => void;
  onCancel?: () => void;
  totalEstimatedTime?: number;
  isCompact?: boolean; // New compact mode
}

export const RestructuringProgressAnimator: React.FC<RestructuringProgressProps> = ({
  categories,
  isVisible,
  onComplete,
  onCancel,
  totalEstimatedTime = 60000, // 60 seconds default
  isCompact = false // Compact mode for right-side panel
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Calculate overall progress
  const completedCategories = categories.filter(cat => cat.status === 'completed').length;
  const totalCategories = categories.length;
  const overallProgress = totalCategories > 0 ? (completedCategories / totalCategories) * 100 : 0;

  // Start timer when restructuring begins
  useEffect(() => {
    if (isVisible && !startTime) {
      setStartTime(Date.now());
    }
  }, [isVisible, startTime]);

  // Update current time
  useEffect(() => {
    if (!isVisible || !startTime) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [isVisible, startTime]);

  // Call onComplete when all categories are done
  useEffect(() => {
    if (completedCategories === totalCategories && totalCategories > 0 && onComplete) {
      setTimeout(onComplete, 1000); // Delay to show completion animation
    }
  }, [completedCategories, totalCategories, onComplete]);

  if (!isVisible) return null;

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
  };

  const getStatusIcon = (status: CategoryProgress['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'restructuring':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
          <span className="text-white text-xs">!</span>
        </div>;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: CategoryProgress['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 border-green-200 bg-green-50';
      case 'restructuring': return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'error': return 'text-red-600 border-red-200 bg-red-50';
      default: return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  // Render compact mode (right-side panel)
  if (isCompact) {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed top-4 right-4 z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
          >
            {/* Compact Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Brain className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <h3 className="text-sm font-semibold">AI Restructuring</h3>
                    <p className="text-xs text-blue-100">{Math.round(overallProgress)}% Complete</p>
                  </div>
                </div>
                <button
                  onClick={onCancel}
                  className="text-white/70 hover:text-white text-lg leading-none"
                  title="Close"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Compact Progress */}
            <div className="p-3 max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {categories.slice(0, 5).map((category, index) => ( // Show only first 5
                  <div key={category.name} className="flex items-center space-x-2 text-xs">
                    <div className="flex-shrink-0">
                      {getStatusIcon(category.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium text-gray-900">
                        {category.name.replace(/^\d+\.\s*/, '')}
                      </div>
                      {category.status === 'completed' && category.reductionPercentage && (
                        <div className="text-green-600 font-semibold">
                          -{category.reductionPercentage}% text
                        </div>
                      )}
                    </div>
                    {category.status === 'restructuring' && (
                      <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500"
                          initial={{ width: '0%' }}
                          animate={{ width: `${category.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
                {categories.length > 5 && (
                  <div className="text-xs text-gray-500 text-center py-1">
                    +{categories.length - 5} more categories
                  </div>
                )}
              </div>
            </div>

            {/* Compact Footer */}
            <div className="bg-gray-50 px-3 py-2 border-t text-xs text-gray-600">
              <div className="flex justify-between items-center">
                <span>{completedCategories} of {totalCategories} done</span>
                <span>{formatTime(currentTime)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Full-screen mode (original)
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Brain className="w-8 h-8" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold">AI Restructuring Requirements</h2>
                  <p className="text-blue-100">Optimizing compliance content with artificial intelligence</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100">Progress</div>
                <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="mt-4">
              <div className="bg-blue-500 bg-opacity-30 rounded-full h-3">
                <motion.div
                  className="bg-white rounded-full h-3 flex items-center justify-end pr-2"
                  initial={{ width: '0%' }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 0.5 }}
                >
                  {overallProgress > 20 && (
                    <Sparkles className="w-3 h-3 text-blue-600" />
                  )}
                </motion.div>
              </div>
              <div className="flex justify-between text-sm text-blue-100 mt-2">
                <span>{completedCategories} of {totalCategories} categories completed</span>
                <span>Elapsed: {formatTime(currentTime)}</span>
              </div>
            </div>
          </div>

          {/* Categories List */}
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {categories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border rounded-lg p-4 transition-all duration-300 ${getStatusColor(category.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(category.status)}
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <div className="text-sm opacity-75">
                          {category.status === 'restructuring' && (
                            <span className="flex items-center space-x-1">
                              <Zap className="w-3 h-3" />
                              <span>Restructuring with AI...</span>
                            </span>
                          )}
                          {category.status === 'completed' && category.processingTimeMs && (
                            <span>Completed in {formatTime(category.processingTimeMs)}</span>
                          )}
                          {category.status === 'pending' && (
                            <span>Waiting...</span>
                          )}
                          {category.status === 'error' && category.errorMessage && (
                            <span className="text-red-600">{category.errorMessage}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {category.status === 'completed' && (
                        <div className="text-sm">
                          {category.reductionPercentage !== undefined && (
                            <div className="text-green-600 font-semibold">
                              -{category.reductionPercentage}% text
                            </div>
                          )}
                          {category.qualityScore !== undefined && (
                            <div className="text-gray-500">
                              Quality: {category.qualityScore}%
                            </div>
                          )}
                        </div>
                      )}
                      {category.status === 'restructuring' && (
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-blue-500"
                            initial={{ width: '0%' }}
                            animate={{ width: `${category.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Individual Progress Bar for Restructuring */}
                  {category.status === 'restructuring' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-current border-opacity-20"
                    >
                      <div className="flex items-center space-x-2 text-sm">
                        <span>AI Processing:</span>
                        <div className="flex-1 bg-current bg-opacity-20 rounded-full h-1">
                          <motion.div
                            className="h-full bg-current rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: `${category.progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <span>{category.progress}%</span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <span>🤖 AI-powered text optimization</span>
                  <span>📊 Preserving all compliance details</span>
                  <span>⚡ Rate limit protected</span>
                </div>
              </div>
              <div className="flex space-x-3">
                {onCancel && overallProgress < 100 && (
                  <button
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                {overallProgress === 100 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={onComplete}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Complete</span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RestructuringProgressAnimator;