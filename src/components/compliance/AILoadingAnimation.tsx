import React from 'react';
import { motion } from 'framer-motion';

export const AILoadingAnimation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        {/* Advanced AI Logo Animation */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Outer rotating ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-800"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
          </motion.div>

          {/* Middle pulsing ring */}
          <motion.div
            className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Inner AI core */}
          <motion.div
            className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Neural network pattern */}
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <motion.circle
                cx="50"
                cy="25"
                r="4"
                fill="white"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              />
              <motion.circle
                cx="25"
                cy="50"
                r="4"
                fill="white"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
              <motion.circle
                cx="75"
                cy="50"
                r="4"
                fill="white"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />
              <motion.circle
                cx="50"
                cy="75"
                r="4"
                fill="white"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              />
              
              {/* Connecting lines */}
              <motion.path
                d="M50 25 L25 50 L50 75 L75 50 Z"
                stroke="white"
                strokeWidth="1"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: [0, 1, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </svg>
          </motion.div>

          {/* Particle effects */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              initial={{
                x: 64,
                y: 64,
              }}
              animate={{
                x: [64, 64 + Math.cos(i * 60 * Math.PI / 180) * 80, 64],
                y: [64, 64 + Math.sin(i * 60 * Math.PI / 180) * 80, 64],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Loading text with typewriter effect */}
        <motion.h2 
          className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading AI Compliance Engine
        </motion.h2>
        
        <motion.p 
          className="text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Analyzing framework requirements
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          >
            ...
          </motion.span>
        </motion.p>

        {/* Progress indicator */}
        <div className="mt-6 w-64 mx-auto">
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 7, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};