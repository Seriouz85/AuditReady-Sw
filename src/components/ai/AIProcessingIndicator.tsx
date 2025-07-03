import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Cpu, Database, Network } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface AIProcessingIndicatorProps {
  message?: string;
  progress?: number;
}

export const AIProcessingIndicator: React.FC<AIProcessingIndicatorProps> = ({ 
  message = "AI is processing...", 
  progress = 0 
}) => {
  const icons = [Brain, Cpu, Database, Network];
  
  return (
    <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm border-blue-500/30 shadow-xl shadow-blue-500/10">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          {/* Animated Icons */}
          <div className="flex space-x-2">
            {icons.map((Icon, index) => (
              <motion.div
                key={index}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  delay: index * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="p-2 bg-blue-500/20 rounded-lg"
              >
                <Icon className="w-5 h-5 text-blue-400" />
              </motion.div>
            ))}
          </div>
          
          {/* Progress Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">{message}</span>
              <span className="text-blue-400 text-sm">{progress}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-2 bg-slate-700"
            />
          </div>
          
          {/* Neural Network Animation */}
          <div className="relative w-12 h-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-blue-500/30 border-t-blue-500 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
            />
            <div className="absolute inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-80" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};