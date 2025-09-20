import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Brain, Sparkles } from 'lucide-react';

interface AIGenerationOverlayProps {
  showGeneration: boolean;
  isGenerating: boolean;
}

export const AIGenerationOverlay: React.FC<AIGenerationOverlayProps> = ({
  showGeneration,
  isGenerating
}) => {
  return (
    <AnimatePresence>
      {showGeneration && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute inset-0 z-[10000] bg-white/98 dark:bg-gray-900/98 backdrop-blur-md rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-2xl flex flex-col items-center justify-center min-h-[400px]"
        >
          {/* Neural Network Animation Background */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-indigo-50/50 dark:from-blue-950/50 dark:via-purple-950/50 dark:to-indigo-950/50" />
            
            {/* Animated Neural Network Nodes */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-400/60 rounded-full"
                style={{
                  left: `${20 + (i % 4) * 20}%`,
                  top: `${20 + Math.floor(i / 4) * 20}%`,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
            
            {/* Animated connection lines */}
            <svg className="absolute inset-0 w-full h-full">
              {[...Array(8)].map((_, i) => (
                <motion.path
                  key={i}
                  d={`M ${100 + i * 50} 100 Q ${150 + i * 50} 200 ${200 + i * 50} 100`}
                  stroke="url(#gradient)"
                  strokeWidth="1"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeInOut"
                  }}
                />
              ))}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Central AI Icon with Animation */}
          <motion.div
            className="relative z-10 mb-8"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/30">
              <motion.div
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-12 h-12 text-white" />
              </motion.div>
            </div>
            
            {/* Orbiting particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-yellow-400 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transformOrigin: '0 0',
                }}
                animate={{
                  rotate: [0, 360],
                  scale: [0.5, 1, 0.5],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeInOut"
                }}
                transform={`translate(-50%, -50%) translateY(-60px) rotate(${i * 60}deg)`}
              >
                <Sparkles className="w-3 h-3" />
              </motion.div>
            ))}
          </motion.div>

          {/* Content */}
          <div className="relative z-10 text-center max-w-md px-6">
            <motion.h3
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4"
            >
              {isGenerating ? 'AI Analyzing Frameworks' : 'Generation Complete!'}
            </motion.h3>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed"
            >
              {isGenerating 
                ? 'Our advanced AI is analyzing your selected compliance frameworks and generating unified, simplified requirements tailored to your organization.'
                : 'Your unified compliance requirements have been generated successfully! The results are now displayed in the Unified Requirements tab.'
              }
            </motion.p>

            {/* Progress Animation */}
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="space-y-4"
              >
                <div className="flex justify-center space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 bg-blue-500 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ 
                      duration: 8, 
                      repeat: Infinity, 
                      ease: "easeInOut",
                      repeatType: "reverse"
                    }}
                  />
                </div>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    Processing compliance frameworks...
                  </motion.span>
                </div>
              </motion.div>
            )}

            {/* Success Animation */}
            {!isGenerating && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                className="flex justify-center"
              >
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, type: "spring", stiffness: 300 }}
                  >
                    <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};