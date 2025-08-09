import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Target, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  Code,
  Database,
  Layers,
  Activity,
  TrendingUp,
  Shield,
  Cpu,
  Eye,
  Lightbulb
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface NeuralNode {
  id: number;
  x: number;
  y: number;
  activated: boolean;
  value: number;
}

interface ProcessingPhase {
  id: string;
  name: string;
  status: 'waiting' | 'processing' | 'complete';
  icon: React.ReactNode;
  color: string;
}

export default function UltraAIShowcase() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [neuralNodes, setNeuralNodes] = useState<NeuralNode[]>([]);
  const [progress, setProgress] = useState(0);
  const [showMatrix, setShowMatrix] = useState(false);

  // Initialize neural network visualization
  useEffect(() => {
    const nodes: NeuralNode[] = [];
    for (let i = 0; i < 24; i++) {
      nodes.push({
        id: i,
        x: (i % 8) * 60 + 30,
        y: Math.floor(i / 8) * 80 + 40,
        activated: false,
        value: Math.random()
      });
    }
    setNeuralNodes(nodes);
  }, []);

  const phases: ProcessingPhase[] = [
    { id: 'tokenize', name: 'Tokenization', status: 'waiting', icon: <Code className="w-4 h-4" />, color: 'blue' },
    { id: 'vectorize', name: 'Vectorization', status: 'waiting', icon: <Database className="w-4 h-4" />, color: 'purple' },
    { id: 'similarity', name: 'Similarity Analysis', status: 'waiting', icon: <Target className="w-4 h-4" />, color: 'green' },
    { id: 'mapping', name: 'Auto-Mapping', status: 'waiting', icon: <Layers className="w-4 h-4" />, color: 'orange' },
  ];

  const startProcessing = async () => {
    setIsProcessing(true);
    setProgress(0);
    setShowMatrix(true);
    
    // Simulate neural network activation
    for (let phase = 0; phase < phases.length; phase++) {
      setCurrentPhase(phase);
      
      // Activate nodes progressively
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          setNeuralNodes(prev => prev.map((node, idx) => ({
            ...node,
            activated: idx <= (phase * 6 + i)
          })));
          setProgress((phase * 25) + (i * 4));
        }, i * 400);
      }
      
      await new Promise(resolve => setTimeout(resolve, 2500));
    }
    
    setProgress(100);
    setTimeout(() => {
      setIsProcessing(false);
      setShowMatrix(false);
    }, 2000);
  };

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-transparent animate-pulse" 
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='10' cy='10' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                 backgroundSize: '20px 20px'
               }} />
        </div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center animate-pulse">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <Badge className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-100 border-cyan-400/30 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Revolutionary AI Engine
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-6xl md:text-8xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8 tracking-tight"
          >
            AI SEMANTIC
            <br />
            <span className="text-5xl md:text-7xl">MAPPING</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
          >
            Watch our neural network automatically map compliance frameworks in real-time.
            <br />
            <span className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text font-semibold">
              90% faster. Zero breaking changes. Infinite scalability.
            </span>
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* AI Processing Center */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <Card className="bg-black/40 backdrop-blur-xl border-gray-700/50 p-8 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Neural Processing Unit</h3>
                  <p className="text-gray-400">SOC 2 Framework Analysis</p>
                </div>
                <Button 
                  onClick={startProcessing}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  {isProcessing ? (
                    <>
                      <Cpu className="w-5 h-5 mr-2 animate-pulse" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Activate AI
                    </>
                  )}
                </Button>
              </div>

              {/* Neural Network Visualization */}
              <div className="relative h-64 mb-8 bg-gradient-to-br from-gray-900/50 to-black/50 rounded-xl border border-gray-700/50 overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10"
                  animate={showMatrix ? {
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                <svg className="absolute inset-0 w-full h-full">
                  {/* Neural connections */}
                  {neuralNodes.map((node, i) => 
                    neuralNodes.slice(i + 1).map((targetNode, j) => {
                      const shouldShow = node.activated && targetNode.activated;
                      return (
                        <motion.line
                          key={`${i}-${j}`}
                          x1={node.x}
                          y1={node.y}
                          x2={targetNode.x}
                          y2={targetNode.y}
                          stroke={shouldShow ? "url(#gradient)" : "rgba(75,85,99,0.1)"}
                          strokeWidth={shouldShow ? "2" : "1"}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: shouldShow ? 1 : 0 }}
                          transition={{ duration: 0.5 }}
                        />
                      );
                    })
                  )}
                  
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Neural nodes */}
                {neuralNodes.map((node) => (
                  <motion.div
                    key={node.id}
                    className={`absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${
                      node.activated 
                        ? 'bg-gradient-to-r from-cyan-400 to-purple-400 shadow-lg shadow-purple-400/50' 
                        : 'bg-gray-600'
                    }`}
                    style={{ left: node.x, top: node.y }}
                    animate={node.activated ? {
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                ))}
              </div>

              {/* Processing Phases */}
              <div className="space-y-3">
                {phases.map((phase, index) => (
                  <motion.div
                    key={phase.id}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                      currentPhase === index && isProcessing
                        ? `bg-gradient-to-r from-${phase.color}-500/20 to-${phase.color}-600/20 border border-${phase.color}-400/30`
                        : currentPhase > index
                        ? 'bg-green-500/10 border border-green-400/30'
                        : 'bg-gray-800/30 border border-gray-700/30'
                    }`}
                    animate={currentPhase === index && isProcessing ? {
                      scale: [1, 1.02, 1]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentPhase === index && isProcessing
                        ? `bg-${phase.color}-500 text-white animate-pulse`
                        : currentPhase > index
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {currentPhase > index ? <CheckCircle className="w-5 h-5" /> : phase.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{phase.name}</h4>
                      {currentPhase === index && isProcessing && (
                        <div className="w-full bg-gray-700 rounded-full h-1 mt-2 overflow-hidden">
                          <motion.div 
                            className={`h-full bg-gradient-to-r from-${phase.color}-400 to-${phase.color}-600`}
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2.5, ease: "easeInOut" }}
                          />
                        </div>
                      )}
                    </div>
                    {currentPhase === index && isProcessing && (
                      <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Progress Bar */}
              <motion.div 
                className="mt-6 bg-gray-800 rounded-full h-3 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: isProcessing ? 1 : 0 }}
              >
                <motion.div 
                  className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </Card>
          </motion.div>

          {/* Real-time Results */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <motion.div
              className="text-center mb-8"
              animate={isProcessing ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Eye className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-white mb-2">Live Mapping Results</h3>
              <p className="text-gray-400">Real-time AI decision making</p>
            </motion.div>

            {/* Mapping Results */}
            <AnimatePresence>
              {[
                { req: "CC6.1 - Logical access controls restrict access", match: "Access Control & Identity Management", confidence: 94, delay: 0 },
                { req: "CC7.2 - System vulnerabilities are identified", match: "Risk Management & Assessment", confidence: 89, delay: 0.5 },
                { req: "CC8.1 - Change management processes", match: "Governance & Leadership", confidence: 87, delay: 1.0 },
              ].map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ 
                    opacity: currentPhase >= 2 ? 1 : 0.3, 
                    y: 0, 
                    scale: currentPhase >= 2 ? 1 : 0.9,
                  }}
                  transition={{ delay: result.delay, duration: 0.6 }}
                  className={`relative overflow-hidden rounded-xl border transition-all duration-500 ${
                    currentPhase >= 2 
                      ? 'bg-black/40 backdrop-blur-xl border-gray-600/50 shadow-xl' 
                      : 'bg-gray-900/20 border-gray-800/50'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={`${
                        result.confidence >= 90 
                          ? 'bg-green-500/20 text-green-300 border-green-400/30' 
                          : 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                      }`}>
                        {result.confidence}% Confidence
                      </Badge>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Lightbulb className="w-4 h-4" />
                        AI Match
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-800/50 rounded-lg">
                        <div className="text-xs text-cyan-400 font-semibold mb-1">SOC 2 Requirement</div>
                        <div className="text-sm text-gray-200">{result.req}</div>
                      </div>
                      
                      <div className="flex items-center justify-center py-2">
                        <motion.div
                          animate={currentPhase >= 2 ? { 
                            x: [0, 10, 0],
                            opacity: [0.5, 1, 0.5] 
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <ArrowRight className="w-5 h-5 text-purple-400" />
                        </motion.div>
                      </div>
                      
                      <div className="p-3 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-lg border border-purple-400/30">
                        <div className="text-xs text-purple-400 font-semibold mb-1">Unified Category</div>
                        <div className="text-sm font-medium text-white">{result.match}</div>
                      </div>
                    </div>
                  </div>
                  
                  {currentPhase >= 2 && (
                    <motion.div
                      className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-500"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: result.delay + 0.5, duration: 0.8 }}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Performance Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="grid grid-cols-3 gap-4 mt-8"
            >
              {[
                { label: "Speed", value: "90%↑", icon: TrendingUp, color: "green" },
                { label: "Accuracy", value: "94%", icon: Target, color: "blue" },
                { label: "Reliability", value: "99.9%", icon: Shield, color: "purple" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className={`text-center p-4 bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-600/5 rounded-xl border border-${stat.color}-400/20 backdrop-blur-sm`}
                  animate={isProcessing ? {
                    scale: [1, 1.05, 1],
                    borderColor: [`rgba(${stat.color === 'green' ? '34,197,94' : stat.color === 'blue' ? '59,130,246' : '147,51,234'}, 0.2)`, `rgba(${stat.color === 'green' ? '34,197,94' : stat.color === 'blue' ? '59,130,246' : '147,51,234'}, 0.5)`, `rgba(${stat.color === 'green' ? '34,197,94' : stat.color === 'blue' ? '59,130,246' : '147,51,234'}, 0.2)`],
                  } : {}}
                  transition={{ duration: 2, delay: index * 0.5, repeat: Infinity }}
                >
                  <stat.icon className={`w-6 h-6 text-${stat.color}-400 mx-auto mb-2`} />
                  <div className={`text-xl font-bold text-${stat.color}-400 mb-1`}>{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}