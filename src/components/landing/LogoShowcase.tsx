import { motion } from "framer-motion";
import { Shield, CheckCircle2, Lock, Sparkles, Zap } from "lucide-react";
import { useTheme } from "next-themes";

export function LogoShowcase() {
  const { theme } = useTheme();

  return (
    <section className="py-16 sm:py-24 px-3 sm:px-4 relative overflow-hidden">
      <div className="container mx-auto px-3 sm:px-6 relative z-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto"
        >
          <div className="relative">
            {/* Very subtle background effect */}
            <div className={`absolute -inset-x-20 -inset-y-16 ${theme === 'light'
              ? 'bg-gradient-to-r from-blue-50/30 via-transparent to-purple-50/30'
              : 'bg-gradient-to-r from-blue-950/10 via-transparent to-purple-950/10'} blur-3xl`}></div>

            <div className="relative z-10">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
                {/* Logo Side */}
                <div className="text-center lg:text-left lg:pl-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="relative inline-block"
                    style={{
                      transform: 'translateX(0px) translateY(-10px)',
                      animation: 'float 4s ease-in-out infinite'
                    }}
                  >
                    {/* Futuristic AuditReady Shield Logo */}
                    <div className="relative">
                      {/* Multi-layered Background Glow */}
                      <div className="absolute inset-0 w-48 h-48 sm:w-80 sm:h-80 mx-auto">
                        <div className={`absolute inset-0 rounded-full ${theme === 'light'
                          ? 'bg-gradient-to-r from-blue-400/30 via-cyan-300/20 to-indigo-500/30 blur-3xl'
                          : 'bg-gradient-to-r from-blue-400/40 via-cyan-300/30 to-indigo-400/40 blur-3xl'}`}></div>
                        <div className={`absolute inset-6 rounded-full ${theme === 'light'
                          ? 'bg-gradient-to-r from-cyan-300/20 to-blue-400/20 blur-2xl'
                          : 'bg-gradient-to-r from-cyan-300/30 to-blue-400/30 blur-2xl'}`}></div>
                      </div>

                      {/* Main Holographic Shield */}
                      <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto">
                        {/* Shield Base with Holographic Effect */}
                        <div className={`relative w-full h-full rounded-[3rem] flex items-center justify-center ${theme === 'light'
                          ? 'bg-gradient-to-br from-slate-200/90 via-blue-100/80 to-indigo-200/90 backdrop-blur-sm border border-blue-300/50 shadow-2xl'
                          : 'bg-gradient-to-br from-slate-800/90 via-blue-900/80 to-indigo-900/90 backdrop-blur-sm border border-blue-400/30 shadow-2xl'}`}>

                          {/* Inner Holographic Layers */}
                          <div className="absolute inset-2 rounded-[2.5rem] bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
                          <div className="absolute inset-4 rounded-[2rem] bg-gradient-to-tl from-transparent via-blue-300/20 to-transparent"></div>

                          {/* Center Shield Symbol */}
                          <div className="relative z-10 flex flex-col items-center">
                            {/* Main Shield Icon */}
                            <div className={`relative w-24 h-24 rounded-2xl flex items-center justify-center mb-3 ${theme === 'light'
                              ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 shadow-lg'
                              : 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 shadow-lg'}`}>
                              <Shield className="h-14 w-14 text-white drop-shadow-lg" strokeWidth={2} />
                              {/* Checkmark Overlay */}
                              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                                <CheckCircle2 className="h-5 w-5 text-white" strokeWidth={2.5} />
                              </div>
                            </div>

                            {/* AUDITREADY Text */}
                            <div className={`text-center ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>
                              <div className="text-xl font-bold tracking-wider mb-1">AUDITREADY</div>
                              <div className={`text-sm font-semibold ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'} tracking-wide`}>CYBER SECURITY</div>
                            </div>
                          </div>

                          {/* Animated Security Icons */}
                          <div className="absolute top-6 right-6 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                            <Lock className="h-3 w-3 text-white" />
                          </div>
                          <div className="absolute top-6 left-6 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg animate-pulse delay-700">
                            <Sparkles className="h-3 w-3 text-white" />
                          </div>
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse delay-300">
                            <Zap className="h-3 w-3 text-white" />
                          </div>
                        </div>

                        {/* Orbital Elements */}
                        <div className="absolute inset-0" style={{ animation: 'spin 12s linear infinite' }}>
                          <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3 w-5 h-5 rounded-full ${theme === 'light' ? 'bg-blue-500' : 'bg-blue-400'} opacity-70 shadow-lg`}></div>
                          <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-3 w-4 h-4 rounded-full ${theme === 'light' ? 'bg-indigo-500' : 'bg-indigo-400'} opacity-50 shadow-lg`}></div>
                          <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-3 w-3 h-3 rounded-full ${theme === 'light' ? 'bg-purple-500' : 'bg-purple-400'} opacity-60 shadow-lg`}></div>
                          <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-3 w-3 h-3 rounded-full ${theme === 'light' ? 'bg-cyan-500' : 'bg-cyan-400'} opacity-60 shadow-lg`}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Content Side */}
                <div className="space-y-10">
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="space-y-8"
                  >
                    <h2 className={`text-5xl lg:text-6xl font-bold leading-tight ${theme === 'light'
                      ? 'bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent'
                      : 'bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent'}`}>
                      AuditReady
                    </h2>
                    <div className={`text-2xl font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>
                      <span className={theme === 'light' ? 'text-blue-600' : 'text-blue-400'}>Security</span> • <span className={theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'}>Compliance</span> • <span className={theme === 'light' ? 'text-purple-600' : 'text-purple-400'}>Excellence</span>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    viewport={{ once: true }}
                    className="space-y-8"
                  >
                    <blockquote className={`text-2xl lg:text-3xl leading-relaxed font-light italic ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>
                      "Transforming compliance from a burden into a <span className={`font-semibold not-italic ${theme === 'light' ? 'text-blue-700' : 'text-blue-400'}`}>competitive advantage</span>.
                      Where security meets innovation, and audit readiness becomes second nature."
                    </blockquote>

                    <div className="flex items-center gap-6 pt-6">
                      <div className={`w-16 h-1 ${theme === 'light' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-blue-400 to-indigo-400'} rounded-full`}></div>
                      <span className={`text-lg font-medium ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                        Empowering Organizations Worldwide
                      </span>
                    </div>
                  </motion.div>

                  {/* Trust Indicators */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    viewport={{ once: true }}
                    className="flex flex-wrap gap-6 pt-10"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${theme === 'light' ? 'bg-blue-500' : 'bg-blue-400'}`}></div>
                      <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>ISO 27001 Ready</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${theme === 'light' ? 'bg-purple-500' : 'bg-purple-400'}`}></div>
                      <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Enterprise Grade</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
