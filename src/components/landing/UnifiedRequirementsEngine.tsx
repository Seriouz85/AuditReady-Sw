import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface Requirement {
  id: string;
  text: string;
  framework: string;
  code: string;
}

interface UnifiedRequirement {
  id: string;
  text: string;
  frameworks: Array<{ name: string; code: string; gradient: string }>;
  count: number;
  savingsPercent: number;
}

// MODERN COMPLIANCE FRAMEWORKS - Clean, professional design
const FRAMEWORKS = [
  {
    name: 'ISO 27001',
    code: 'ISO/IEC 27001:2022',
    gradient: 'from-[#0EA5E9] via-[#3B82F6] to-[#6366F1]',
    accentColor: '#3B82F6',
    description: 'Information Security Management System'
  },
  {
    name: 'NIS2',
    code: 'Directive (EU) 2022/2555',
    gradient: 'from-[#8B5CF6] via-[#A855F7] to-[#C026D3]',
    accentColor: '#A855F7',
    description: 'Network & Information Security'
  },
  {
    name: 'DORA',
    code: 'Regulation (EU) 2022/2554',
    gradient: 'from-[#10B981] via-[#059669] to-[#047857]',
    accentColor: '#059669',
    description: 'Digital Operational Resilience Act'
  },
  {
    name: 'GDPR',
    code: 'Regulation (EU) 2016/679',
    gradient: 'from-[#F59E0B] via-[#F97316] to-[#EF4444]',
    accentColor: '#F97316',
    description: 'General Data Protection Regulation'
  },
  {
    name: 'CIS Controls',
    code: 'CIS Controls v8.1',
    gradient: 'from-[#EC4899] via-[#DB2777] to-[#BE185D]',
    accentColor: '#DB2777',
    description: 'Center for Internet Security'
  }
];

const SAMPLE_REQUIREMENTS: Requirement[] = [
  // Information Security Policy domain
  { id: 'r1', text: 'Information security policy framework', framework: 'ISO 27001', code: 'A.5.1' },
  { id: 'r2', text: 'Security governance structure', framework: 'NIS2', code: 'Art. 21' },
  { id: 'r3', text: 'ICT risk management framework', framework: 'DORA', code: 'Art. 6' },
  { id: 'r4', text: 'Data protection governance', framework: 'GDPR', code: 'Art. 24' },
  { id: 'r5', text: 'Enterprise security program', framework: 'CIS Controls', code: '1.1' },

  // Risk assessment domain
  { id: 'r6', text: 'Information security risk assessment', framework: 'ISO 27001', code: 'A.5.2' },
  { id: 'r7', text: 'Cybersecurity risk analysis', framework: 'NIS2', code: 'Art. 21.2' },
  { id: 'r8', text: 'ICT risk assessment process', framework: 'DORA', code: 'Art. 6.3' },
  { id: 'r9', text: 'Risk-based asset management', framework: 'CIS Controls', code: '1.2' },

  // Incident management domain
  { id: 'r10', text: 'Security incident procedures', framework: 'ISO 27001', code: 'A.5.24' },
  { id: 'r11', text: 'Incident notification mechanisms', framework: 'NIS2', code: 'Art. 23' },
  { id: 'r12', text: 'ICT incident classification', framework: 'DORA', code: 'Art. 17' },
  { id: 'r13', text: 'Personal data breach notification', framework: 'GDPR', code: 'Art. 33' },
  { id: 'r14', text: 'Incident response procedures', framework: 'CIS Controls', code: '17.1' },

  // Access control domain
  { id: 'r15', text: 'Access control policy', framework: 'ISO 27001', code: 'A.5.15' },
  { id: 'r16', text: 'Data subject access rights', framework: 'GDPR', code: 'Art. 15' },
  { id: 'r17', text: 'Account management controls', framework: 'CIS Controls', code: '5.1' },

  // Business continuity domain
  { id: 'r18', text: 'Business continuity planning', framework: 'ISO 27001', code: 'A.5.29' },
  { id: 'r19', text: 'Service continuity measures', framework: 'NIS2', code: 'Art. 21.2(e)' },
  { id: 'r20', text: 'Operational resilience testing', framework: 'DORA', code: 'Art. 11' },
];

export function UnifiedRequirementsEngine() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  const [phase, setPhase] = useState<'input' | 'processing' | 'output'>('input');
  const [inputRequirements, setInputRequirements] = useState<Requirement[]>([]);
  const [unifiedRequirements, setUnifiedRequirements] = useState<UnifiedRequirement[]>([]);
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isInView || isAnimating) return undefined;

    const timer = setTimeout(() => {
      void startAnimation();
    }, 1000);

    return () => clearTimeout(timer);
  }, [isInView, isAnimating]);

  const startAnimation = async () => {
    setIsAnimating(true);
    setPhase('input');
    setInputRequirements([]);
    setUnifiedRequirements([]);
    setProgress(0);

    // Phase 1: Requirements flow in
    await new Promise(resolve => setTimeout(resolve, 600));

    for (let i = 0; i < SAMPLE_REQUIREMENTS.length; i++) {
      setInputRequirements(prev => [...prev, SAMPLE_REQUIREMENTS[i]]);
      setProgress((i + 1) * (100 / SAMPLE_REQUIREMENTS.length));
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    // Phase 2: AI Processing
    setPhase('processing');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Phase 3: Unified output
    setPhase('output');

    const unified: UnifiedRequirement[] = [
      {
        id: 'u1',
        text: 'Information Security Governance Framework',
        frameworks: [
          { name: 'ISO 27001', code: 'A.5.1', gradient: FRAMEWORKS[0].gradient },
          { name: 'NIS2', code: 'Art. 21', gradient: FRAMEWORKS[1].gradient },
          { name: 'DORA', code: 'Art. 6', gradient: FRAMEWORKS[2].gradient },
          { name: 'GDPR', code: 'Art. 24', gradient: FRAMEWORKS[3].gradient },
          { name: 'CIS Controls', code: '1.1', gradient: FRAMEWORKS[4].gradient }
        ],
        count: 5,
        savingsPercent: 80
      },
      {
        id: 'u2',
        text: 'Risk Assessment & Asset Management',
        frameworks: [
          { name: 'ISO 27001', code: 'A.5.2', gradient: FRAMEWORKS[0].gradient },
          { name: 'NIS2', code: 'Art. 21.2', gradient: FRAMEWORKS[1].gradient },
          { name: 'DORA', code: 'Art. 6.3', gradient: FRAMEWORKS[2].gradient },
          { name: 'CIS Controls', code: '1.2', gradient: FRAMEWORKS[4].gradient }
        ],
        count: 4,
        savingsPercent: 75
      },
      {
        id: 'u3',
        text: 'Incident Response & Data Breach Notification',
        frameworks: [
          { name: 'ISO 27001', code: 'A.5.24', gradient: FRAMEWORKS[0].gradient },
          { name: 'NIS2', code: 'Art. 23', gradient: FRAMEWORKS[1].gradient },
          { name: 'DORA', code: 'Art. 17', gradient: FRAMEWORKS[2].gradient },
          { name: 'GDPR', code: 'Art. 33', gradient: FRAMEWORKS[3].gradient },
          { name: 'CIS Controls', code: '17.1', gradient: FRAMEWORKS[4].gradient }
        ],
        count: 5,
        savingsPercent: 80
      },
      {
        id: 'u4',
        text: 'Access Control & Account Management',
        frameworks: [
          { name: 'ISO 27001', code: 'A.5.15', gradient: FRAMEWORKS[0].gradient },
          { name: 'GDPR', code: 'Art. 15', gradient: FRAMEWORKS[3].gradient },
          { name: 'CIS Controls', code: '5.1', gradient: FRAMEWORKS[4].gradient }
        ],
        count: 3,
        savingsPercent: 67
      },
      {
        id: 'u5',
        text: 'Business Continuity & Operational Resilience',
        frameworks: [
          { name: 'ISO 27001', code: 'A.5.29', gradient: FRAMEWORKS[0].gradient },
          { name: 'NIS2', code: 'Art. 21.2(e)', gradient: FRAMEWORKS[1].gradient },
          { name: 'DORA', code: 'Art. 11', gradient: FRAMEWORKS[2].gradient }
        ],
        count: 3,
        savingsPercent: 67
      }
    ];

    for (let i = 0; i < unified.length; i++) {
      setUnifiedRequirements(prev => [...prev, unified[i]]);
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    await new Promise(resolve => setTimeout(resolve, 5000));
    setIsAnimating(false);
  };

  return (
    <section
      ref={ref}
      className="relative py-32 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
    >
      {/* Subtle modern background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      {/* Ambient glow */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-[1600px] mx-auto px-6">
        {/* Modern Header */}
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-3 mb-8 px-6 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-sm font-medium text-slate-300 tracking-wide">AI-Powered Compliance Intelligence</span>
          </motion.div>

          <h2 className="text-7xl md:text-8xl font-bold mb-8 tracking-tight">
            <span className="block bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Unified Compliance
            </span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Engine
            </span>
          </h2>

          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
            Automatically detect overlapping requirements across ISO 27001, NIS2, DORA, GDPR, CIS Controls & more.
            <br />
            Eliminate duplicates. Build once, comply everywhere.
          </p>
        </motion.div>

        {/* Main Animation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_1.2fr] gap-8 mb-24">

          {/* Left: Input Frameworks */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/10 p-8 h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Input</h3>
                  <p className="text-xs text-slate-500">5 frameworks, 20 requirements</p>
                </div>
              </div>

              <div className="space-y-3">
                {FRAMEWORKS.map((framework, idx) => (
                  <motion.div
                    key={framework.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="group relative"
                  >
                    <div className="relative p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all">
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${framework.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                      <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-white">{framework.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-md bg-gradient-to-r ${framework.gradient} text-white font-medium`}>
                            Active
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-1">{framework.code}</p>
                        <p className="text-xs text-slate-600">{framework.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Progress indicator during input phase */}
              {phase === 'input' && inputRequirements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-blue-500/20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-400">Analyzing requirements</span>
                    <span className="text-xs font-bold text-blue-400">{inputRequirements.length}/20</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>

          {/* Center: AI Processing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center"
          >
            <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/10 p-8 w-full">
              <div className="flex flex-col items-center justify-center min-h-[600px]">

                {/* AI Core */}
                <motion.div
                  className="relative mb-12"
                  animate={phase === 'processing' ? {
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: phase === 'processing' ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  <div className="relative w-32 h-32">
                    {/* Rotating rings */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-blue-500/30"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                      className="absolute inset-2 rounded-full border-2 border-purple-500/30"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                      className="absolute inset-4 rounded-full border-2 border-pink-500/30"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Core */}
                    <div className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                      <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>

                    {/* Processing glow */}
                    {phase === 'processing' && (
                      <>
                        <motion.div
                          className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-full bg-purple-500/20 blur-2xl"
                          animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0.8, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                        />
                      </>
                    )}
                  </div>
                </motion.div>

                {/* Process stages */}
                <div className="space-y-3 w-full mb-8">
                  <ProcessStage
                    active={phase === 'input'}
                    complete={phase === 'processing' || phase === 'output'}
                    label="Ingesting 20 requirements"
                  />
                  <ProcessStage
                    active={phase === 'processing'}
                    complete={phase === 'output'}
                    label="Detecting overlaps"
                  />
                  <ProcessStage
                    active={phase === 'output'}
                    complete={false}
                    label="Generating unified program"
                  />
                </div>

                {/* Result badge */}
                <AnimatePresence>
                  {phase === 'output' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-6 py-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20"
                    >
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-400 mb-1">15</div>
                        <div className="text-xs text-green-300/80">duplicates eliminated</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>

          {/* Right: Unified Output */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/10 p-8 h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Output</h3>
                  <p className="text-xs text-slate-500">
                    {unifiedRequirements.length > 0 ? `${unifiedRequirements.length} unified requirements` : 'Processing...'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {unifiedRequirements.length === 0 ? (
                    <motion.div
                      key="empty"
                      className="h-[500px] flex items-center justify-center"
                    >
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin mx-auto mb-4" />
                        <p className="text-sm text-slate-600">Awaiting AI processing</p>
                      </div>
                    </motion.div>
                  ) : (
                    unifiedRequirements.map((req, idx) => (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.15, type: "spring", stiffness: 100 }}
                        className="group relative"
                      >
                        <div className="relative p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-green-500/20 transition-all">
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                          <div className="relative">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-white leading-snug mb-3">{req.text}</p>

                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  {req.frameworks.map((fw, i) => (
                                    <span
                                      key={i}
                                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-gradient-to-r ${fw.gradient} text-white`}
                                    >
                                      {fw.name} {fw.code}
                                    </span>
                                  ))}
                                </div>

                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-green-400 font-semibold">{req.count}× merged</span>
                                  <span className="text-slate-600">•</span>
                                  <span className="text-slate-500">{req.savingsPercent}% efficiency gain</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Helper Components
interface ProcessStageProps {
  active: boolean;
  complete: boolean;
  label: string;
}

function ProcessStage({ active, complete, label }: ProcessStageProps) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
      active ? 'bg-blue-500/10 border border-blue-500/20' :
      complete ? 'bg-green-500/5 border border-green-500/10' :
      'bg-white/[0.02] border border-white/5'
    }`}>
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
        active ? 'bg-blue-500' :
        complete ? 'bg-green-500' :
        'bg-white/5'
      }`}>
        {complete ? (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white animate-pulse' : 'bg-white/30'}`} />
        )}
      </div>
      <span className={`text-xs font-medium ${
        active ? 'text-blue-300' :
        complete ? 'text-green-300' :
        'text-slate-600'
      }`}>
        {label}
      </span>
    </div>
  );
}
