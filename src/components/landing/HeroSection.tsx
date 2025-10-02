import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";

const stats = [
  { number: "85%", label: "Time Saved on Assessments" },
  { number: "24/7", label: "Continuous Monitoring" },
  { number: "99.9%", label: "Platform Uptime" },
  { number: "500+", label: "Security Controls" },
];

export function HeroSection() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <section className="pt-20 sm:pt-32 pb-16 sm:pb-20 px-3 sm:px-4 relative overflow-hidden">
      <div className={`absolute inset-0 ${theme === 'light' ? 'bg-[url(\'/grid.svg\')] opacity-10' : 'bg-gradient-to-br from-slate-900/20 via-transparent to-slate-700/10'}`}></div>
      <div className="container mx-auto text-center relative z-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className={`mb-3 sm:mb-4 text-xs sm:text-sm ${theme === 'light' ? 'text-blue-600 border-blue-300' : 'text-blue-400 border-blue-500/30'}`}>
            Built by security specialists for ... everyone
          </Badge>
          <h1 className={`text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 ${theme === 'light' ? 'text-slate-900' : 'bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent'} leading-tight px-2`}>
            Transform Your{" "}
            <span className={`${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`}>Compliance</span>{" "}
            Journey
          </h1>
          <p className={`text-base sm:text-xl ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} max-w-3xl mx-auto mb-6 sm:mb-8 px-4`}>
            Experience the future of compliance management. Automated assessments,
            real-time monitoring, and AI-powered insights—all in one powerful platform.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
        >
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 h-10 sm:h-12 text-sm sm:text-lg w-full sm:w-auto"
            onClick={() => navigate("/onboarding")}
          >
            Start Your Journey
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`${theme === 'light'
              ? 'border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300'
              : 'border-blue-800 text-blue-300 hover:bg-blue-900/40 hover:text-blue-200'} px-6 sm:px-8 h-10 sm:h-12 text-sm sm:text-lg w-full sm:w-auto`}
            onClick={() => navigate("/login")}
          >
            Try Demo
          </Button>
        </motion.div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mt-12 sm:mt-20 px-2">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="text-center"
            >
              <h3 className={`text-2xl sm:text-4xl font-bold ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'} mb-1 sm:mb-2`}>{stat.number}</h3>
              <p className={`text-xs sm:text-base ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
