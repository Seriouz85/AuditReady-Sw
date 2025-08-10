import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
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
  Lightbulb,
  Network,
  Lock,
  AlertTriangle,
  Users,
  FileText
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
  layer: number;
}

interface ProcessingPhase {
  id: string;
  name: string;
  status: 'waiting' | 'processing' | 'complete';
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface ComplianceExample {
  framework: string;
  requirement: string;
  code: string;
  vector: number[];
  mappedTo: string;
  confidence: number;
  category: string;
  icon: React.ReactNode;
  color: string;
}

// Real compliance examples from NIS2, ISO 27002, and CIS Controls (2 examples for parallel display)
const COMPLIANCE_EXAMPLES: ComplianceExample[] = [
  {
    framework: "NIS2 Directive",
    requirement: "Organizations must implement multi-factor authentication for privileged users accessing critical systems",
    code: "Art. 21.2(a)",
    vector: [0.89, 0.72, 0.95, 0.84, 0.91, 0.78, 0.86, 0.93],
    mappedTo: "Access Control & Identity Management",
    confidence: 94,
    category: "Authentication",
    icon: <Lock className="w-4 h-4" />,
    color: "blue"
  },
  {
    framework: "ISO 27002:2022",
    requirement: "Information security incident management procedures shall be established and maintained",
    code: "A.5.26",
    vector: [0.76, 0.88, 0.82, 0.91, 0.74, 0.89, 0.85, 0.92],
    mappedTo: "Incident Response & Recovery",
    confidence: 91,
    category: "Incident Management",
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "purple"
  }
];

export default function UltraAIShowcase() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);
  const [neuralNodes, setNeuralNodes] = useState<NeuralNode[]>([]);
  const [progress, setProgress] = useState(0);
  const [showMatrix, setShowMatrix] = useState(false);
  const [vectorData, setVectorData] = useState<number[]>([]);
  const [similarityScores, setSimilarityScores] = useState<number[]>([]);

  // Initialize neural network visualization with multiple layers
  useEffect(() => {
    const nodes: NeuralNode[] = [];
    const layers = [4, 6, 8, 6, 2]; // Input, Hidden1, Hidden2, Hidden3, Output layers (2 outputs for 2 cards)
    let nodeId = 0;
    
    layers.forEach((layerSize, layerIndex) => {
      const layerX = (layerIndex * 80) + 50; // Slightly expand nodes outward
      const containerHeight = 384; // Back to original container height
      const startY = ((containerHeight - 100) - (layerSize * 30)) / 2 + 20; // Move nodes up from x-axis
      
      for (let i = 0; i < layerSize; i++) {
        nodes.push({
          id: nodeId++,
          x: layerX,
          y: startY + (i * 30), // Reduced node spacing
          activated: false,
          value: Math.random(),
          layer: layerIndex
        });
      }
    });
    
    setNeuralNodes(nodes);
  }, []);

  // Auto-start processing when component comes into view
  useEffect(() => {
    if (isInView && !isProcessing) {
      // Start after a brief delay
      const timer = setTimeout(() => {
        startProcessing();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  const phases: ProcessingPhase[] = [
    { 
      id: 'tokenize', 
      name: 'Text Tokenization', 
      status: 'waiting', 
      icon: <Code className="w-4 h-4" />, 
      color: 'blue',
      description: 'Breaking down compliance text into semantic tokens'
    },
    { 
      id: 'vectorize', 
      name: 'Neural Vectorization', 
      status: 'waiting', 
      icon: <Brain className="w-4 h-4" />, 
      color: 'purple',
      description: 'Converting tokens to 768-dimensional embeddings'
    },
    { 
      id: 'similarity', 
      name: 'Cosine Similarity', 
      status: 'waiting', 
      icon: <Target className="w-4 h-4" />, 
      color: 'green',
      description: 'Computing semantic similarity scores'
    },
    { 
      id: 'mapping', 
      name: 'Auto-Classification', 
      status: 'waiting', 
      icon: <Layers className="w-4 h-4" />, 
      color: 'orange',
      description: 'Mapping to unified compliance categories'
    }
  ];

  const startProcessing = async () => {
    setIsProcessing(true);
    setProgress(0);
    setShowMatrix(true);
    setCurrentExample(0);
    
    // Generate realistic vector data
    const vectors = Array.from({ length: 768 }, () => Math.random() * 2 - 1);
    setVectorData(vectors);
    
    // Simulate multi-layer neural network activation
    for (let phase = 0; phase < phases.length; phase++) {
      setCurrentPhase(phase);
      
      // Activate nodes layer by layer for this phase
      const layersToActivate = Math.min(phase + 2, 5);
      
      for (let layer = 0; layer < layersToActivate; layer++) {
        const layerNodes = neuralNodes.filter(node => node.layer === layer);
        
        for (let i = 0; i < layerNodes.length; i++) {
          setTimeout(() => {
            setNeuralNodes(prev => prev.map(node => 
              node.layer === layer && node.id <= layerNodes[i].id
                ? { ...node, activated: true }
                : node
            ));
            
            // Update progress
            const totalProgress = (phase * 25) + (layer * 5) + (i * 2);
            setProgress(Math.min(totalProgress, 95));
            
            // Generate similarity scores during similarity phase
            if (phase === 2) {
              const scores = COMPLIANCE_EXAMPLES.map(() => Math.random() * 0.3 + 0.7);
              setSimilarityScores(scores);
            }
          }, (layer * 300) + (i * 100));
        }
      }
      
      // Cycle through examples during processing
      if (phase >= 1) {
        const exampleTimer = setInterval(() => {
          setCurrentExample(prev => (prev + 1) % COMPLIANCE_EXAMPLES.length);
        }, 1200);
        
        setTimeout(() => clearInterval(exampleTimer), 2500);
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    setProgress(100);
    
    // Keep showing results, but don't auto-restart (run once only)
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <section ref={ref} className="relative py-24 overflow-hidden bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-30">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-transparent"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}
          />
        </div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 25,
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
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
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
            <span className="text-5xl md:text-7xl">VECTORIZATION</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed"
          >
            Watch our neural networks automatically categorize requirements, detect overlap, and simplify your compliance journey.
            <br />
            <span className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text font-semibold">
              NIS2, ISO 27002, CIS Controls → Unified Intelligence
            </span>
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Enhanced AI Processing Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <Card className="bg-black/40 backdrop-blur-xl border-gray-700/50 p-8 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Multi-Layer Neural Processing</h3>
                  <p className="text-gray-400">
                    {COMPLIANCE_EXAMPLES[currentExample]?.framework} → Vector Analysis
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {isProcessing && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-3 h-3 bg-green-400 rounded-full"
                    />
                  )}
                  <Badge className={`${isProcessing ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'}`}>
                    {isProcessing ? 'PROCESSING' : 'READY'}
                  </Badge>
                </div>
              </div>

              {/* Multi-Layer Neural Network Visualization - Increased height */}
              <div className="relative h-96 mb-6 bg-gradient-to-br from-gray-900/50 to-black/50 rounded-xl border border-gray-700/50 overflow-visible">
                {/* Animated Background Matrix */}
                <motion.div
                  className="absolute inset-0"
                  animate={showMatrix ? {
                    backgroundImage: [
                      'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
                      'radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
                      'radial-gradient(circle at 40% 60%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)'
                    ]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                <svg className="absolute inset-0 w-full h-full">
                  {/* Neural connections with dynamic activation */}
                  {neuralNodes.map((sourceNode, i) => 
                    neuralNodes
                      .filter(targetNode => targetNode.layer === sourceNode.layer + 1)
                      .map((targetNode, j) => {
                        const shouldShow = sourceNode.activated && (currentPhase >= sourceNode.layer);
                        const opacity = shouldShow ? (0.3 + (sourceNode.value * 0.7)) : 0.05;
                        return (
                          <motion.line
                            key={`${i}-${j}`}
                            x1={sourceNode.x}
                            y1={sourceNode.y}
                            x2={targetNode.x}
                            y2={targetNode.y}
                            stroke={shouldShow ? `url(#gradient-${sourceNode.layer})` : "rgba(75,85,99,0.1)"}
                            strokeWidth={shouldShow ? "1" : "0.3"}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ 
                              pathLength: shouldShow ? 1 : 0,
                              opacity: shouldShow ? opacity : 0.05
                            }}
                            transition={{ 
                              duration: 0.8,
                              delay: (sourceNode.layer * 0.2) + (i * 0.05)
                            }}
                          />
                        );
                      })
                  )}
                  
                  {/* Layer-specific gradients */}
                  <defs>
                    <linearGradient id="gradient-0" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                    <linearGradient id="gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                    <linearGradient id="gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                    <linearGradient id="gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Neural nodes with mind-blowing animations */}
                {neuralNodes.map((node, index) => (
                  <motion.div
                    key={node.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ 
                      left: node.x, 
                      top: node.y,
                    }}
                  >
                    {/* Outer pulse ring */}
                    {node.activated && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                          width: '12px',
                          height: '12px',
                          left: '-6px',
                          top: '-6px',
                          background: `radial-gradient(circle, ${
                            node.layer === 4 ? 'rgba(34, 197, 94, 0.3)' :
                            node.layer === 3 ? 'rgba(236, 72, 153, 0.3)' :
                            node.layer === 2 ? 'rgba(147, 51, 234, 0.3)' :
                            node.layer === 1 ? 'rgba(59, 130, 246, 0.3)' :
                            'rgba(6, 182, 212, 0.3)'
                          } 0%, transparent 70%)`
                        }}
                        animate={{
                          scale: [1, 2, 1],
                          opacity: [0.8, 0, 0.8]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: node.layer * 0.2
                        }}
                      />
                    )}
                    
                    {/* Main node */}
                    <motion.div
                      className={`rounded-full ${
                        node.activated 
                          ? `bg-gradient-to-r ${
                              node.layer === 4 ? 'from-green-400 to-emerald-500' :
                              node.layer === 3 ? 'from-pink-400 to-purple-500' :
                              node.layer === 2 ? 'from-purple-400 to-blue-500' :
                              node.layer === 1 ? 'from-blue-400 to-cyan-500' :
                              'from-cyan-400 to-teal-500'
                            } shadow-lg` 
                          : 'bg-gray-700/50 border border-gray-600/30'
                      }`}
                      style={{ 
                        width: node.layer === 0 || node.layer === 4 ? '8px' : '6px',
                        height: node.layer === 0 || node.layer === 4 ? '8px' : '6px',
                        boxShadow: node.activated ? 
                          `0 0 ${10 + node.value * 5}px ${
                            node.layer === 4 ? 'rgba(34, 197, 94, 0.8)' :
                            node.layer === 3 ? 'rgba(236, 72, 153, 0.8)' :
                            node.layer === 2 ? 'rgba(147, 51, 234, 0.8)' :
                            node.layer === 1 ? 'rgba(59, 130, 246, 0.8)' :
                            'rgba(6, 182, 212, 0.8)'
                          }` : 'none'
                      }}
                      animate={node.activated ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360]
                      } : {
                        scale: 1
                      }}
                      transition={{ 
                        duration: 2 + (node.value * 1), 
                        repeat: Infinity,
                        delay: (node.layer * 0.1) + (index * 0.05)
                      }}
                    />
                    
                    {/* Energy wave for output nodes */}
                    {node.layer === 4 && node.activated && (
                      <motion.div
                        className="absolute rounded-full"
                        style={{
                          width: '24px',
                          height: '24px',
                          left: '-12px',
                          top: '-12px',
                          border: '1px solid',
                          borderColor: index % 2 === 0 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(147, 51, 234, 0.5)'
                        }}
                        animate={{
                          scale: [1, 3, 1],
                          opacity: [1, 0, 1]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: index * 0.5
                        }}
                      />
                    )}
                  </motion.div>
                ))}

                {/* Layer Labels - Improved spacing and visibility */}
                <div className="absolute bottom-4 left-4 right-4 text-xs text-gray-300 font-mono">
                  <div className="flex justify-between items-center">
                    <span className="opacity-80 font-semibold bg-gray-800/60 px-2 py-1 rounded">Input</span>
                    <span className="opacity-80 font-semibold bg-gray-800/60 px-2 py-1 rounded">Hidden1</span>
                    <span className="opacity-80 font-semibold bg-gray-800/60 px-2 py-1 rounded">Hidden2</span>
                    <span className="opacity-80 font-semibold bg-gray-800/60 px-2 py-1 rounded">Hidden3</span>
                    <span className="opacity-80 font-semibold bg-gray-800/60 px-2 py-1 rounded">Output</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Processing Phases - Compact */}
              <div className="space-y-2">
                {phases.map((phase, index) => (
                  <motion.div
                    key={phase.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${
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
                      <p className="text-xs text-gray-400 mt-1">{phase.description}</p>
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

          {/* Real-time Results with Real Examples */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
            style={{ minHeight: '800px' }} // Match left side height
          >
            <motion.div
              className="text-center mb-8"
              animate={isProcessing ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Eye className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-white mb-2">Live Compliance Mapping</h3>
              <p className="text-gray-400">Real requirements from global standards</p>
            </motion.div>

            {/* Real Compliance Examples Mapping - Only 2 cards aligned with outputs */}
            <div className="space-y-4">
              {COMPLIANCE_EXAMPLES.map((example, index) => (
                <motion.div
                  key={`${example.framework}-${index}`}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ 
                    opacity: currentPhase >= 1 || index === currentExample ? 1 : 0.3, 
                    y: 0, 
                    scale: currentPhase >= 1 || index === currentExample ? 1 : 0.9,
                  }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ 
                    delay: index * 0.2, 
                    duration: 0.6,
                    type: "spring",
                    stiffness: 200
                  }}
                  className={`relative overflow-hidden rounded-xl border transition-all duration-500 ${
                    currentPhase >= 2 && (isProcessing || index === currentExample)
                      ? `bg-black/60 backdrop-blur-xl border-${example.color}-500/50 shadow-xl shadow-${example.color}-500/20` 
                      : 'bg-gray-900/20 border-gray-800/50'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-${example.color}-500/20 flex items-center justify-center`}>
                          {example.icon}
                        </div>
                        <div>
                          <Badge className={`bg-${example.color}-500/30 text-${example.color}-200 border-${example.color}-400/50 text-xs font-semibold`}>
                            {example.confidence}% Confidence
                          </Badge>
                          <div className="text-xs text-gray-200 mt-1 font-semibold">{example.framework}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-200">
                        <Lightbulb className="w-4 h-4" />
                        <span className="font-medium">AI Match</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-900/80 rounded-lg border border-gray-600/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs text-cyan-300 font-bold">{example.framework}</div>
                          <Badge variant="outline" className="text-xs border-gray-400 text-gray-100">{example.code}</Badge>
                        </div>
                        <div className="text-sm text-gray-100 leading-relaxed font-medium">{example.requirement}</div>
                      </div>
                      
                      {/* Vector Visualization */}
                      {currentPhase >= 1 && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/20"
                        >
                          <div className="text-xs text-purple-400 font-semibold mb-2">Vector Embedding (Sample)</div>
                          <div className="flex flex-wrap gap-1">
                            {example.vector.slice(0, 16).map((value, i) => (
                              <motion.span
                                key={i}
                                className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-mono"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                              >
                                {value.toFixed(2)}
                              </motion.span>
                            ))}
                            <span className="px-2 py-1 text-purple-400 text-xs">...768d</span>
                          </div>
                        </motion.div>
                      )}
                      
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
                      
                      <div className={`p-4 bg-gradient-to-r from-${example.color}-500/20 to-${example.color}-600/20 rounded-lg border border-${example.color}-400/50`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs text-purple-200 font-bold">Unified Category</div>
                          <Badge className="bg-green-500/30 text-green-200 border-green-400/50 text-xs font-semibold">
                            Mapped
                          </Badge>
                        </div>
                        <div className="text-sm font-bold text-white">{example.mappedTo}</div>
                        <div className="text-xs text-gray-200 mt-1 font-medium">{example.category}</div>
                      </div>
                    </div>
                  </div>
                  
                  {currentPhase >= 3 && (
                    <motion.div
                      className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-${example.color}-400 to-${example.color}-600`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: index * 0.3 + 0.5, duration: 0.8 }}
                    />
                  )}
                  {/* Visual connection from neural network to this card */}
                  {currentPhase >= 3 && index < 2 && (
                    <motion.div
                      className="absolute -left-8 top-1/2 transform -translate-y-1/2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <svg width="32" height="2" className="overflow-visible">
                        <motion.line
                          x1="0"
                          y1="1"
                          x2="32"
                          y2="1"
                          stroke={`url(#connection-gradient-${index})`}
                          strokeWidth="2"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, delay: index * 0.3 }}
                        />
                        <defs>
                          <linearGradient id={`connection-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={index === 0 ? "#22c55e" : "#a855f7"} stopOpacity="0.8" />
                            <stop offset="100%" stopColor={index === 0 ? "#06b6d4" : "#ec4899"} stopOpacity="0.8" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Enhanced Performance Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="grid grid-cols-3 gap-4 mt-8"
            >
              {[
                { label: "Processing Speed", value: "1.2s", icon: TrendingUp, color: "green", description: "Per requirement" },
                { label: "Accuracy Rate", value: "94.2%", icon: Target, color: "blue", description: "Auto-mapping" },
                { label: "Frameworks", value: "12+", icon: Shield, color: "purple", description: "Supported" },
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
                  <div className="text-xs text-gray-500 mt-1">{stat.description}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}