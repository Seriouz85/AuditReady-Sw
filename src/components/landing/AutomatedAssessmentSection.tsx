import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Cpu, Activity, Database } from "lucide-react";
import { useTheme } from "next-themes";

export function AutomatedAssessmentSection() {
  const { theme } = useTheme();

  return (
    <section className={`py-20 px-3 sm:px-4 ${theme === 'light' ? 'bg-white' : 'bg-slate-900'}`}>
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className={`mb-6 ${theme === 'light' ? 'text-blue-600 border-blue-300' : 'text-blue-400 border-blue-500/30'}`}>
            Smart Automation
          </Badge>
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
            Automated Assessment Engine
          </h2>
          <p className={`text-lg ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} max-w-2xl mx-auto`}>
            Say goodbye to spreadsheets and manual tracking. Our intelligent assessment
            engine handles the heavy lifting for you.
          </p>
        </motion.div>

        {/* Assessment Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex items-start gap-4">
              <div className={`relative rounded-full ${theme === 'light' ? 'bg-gradient-to-br from-emerald-100 to-green-100' : 'bg-gradient-to-br from-emerald-500/20 to-green-500/20'} p-3 overflow-hidden group`}>
                <div className={`absolute -inset-2 rounded-full ${theme === 'light' ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-emerald-400 to-green-400'} opacity-20 blur-lg group-hover:opacity-50 transition-all duration-300`}></div>
                <Cpu className={`relative h-6 w-6 ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-500'} transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`} />
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-2`}>Smart Control Mapping</h3>
                <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Automatically map controls across multiple frameworks. Save hours of manual work
                  with intelligent control suggestions.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className={`relative rounded-full ${theme === 'light' ? 'bg-gradient-to-br from-blue-100 to-purple-100' : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'} p-3 overflow-hidden`}>
                <div className={`absolute -inset-2 rounded-full ${theme === 'light' ? 'bg-gradient-to-r from-blue-400 to-purple-500' : 'bg-gradient-to-r from-blue-400 to-purple-400'} opacity-20 blur-lg animate-pulse`}></div>
                <Activity className={`relative h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'} animate-pulse`} />
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-2`}>Real-time Progress Tracking</h3>
                <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Monitor assessment progress in real-time. Get instant visibility into completion
                  rates and bottlenecks.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className={`relative rounded-full ${theme === 'light' ? 'bg-gradient-to-br from-green-100 to-blue-100' : 'bg-gradient-to-br from-green-500/20 to-blue-500/20'} p-3 overflow-hidden group`}>
                <div className={`absolute -inset-2 rounded-full ${theme === 'light' ? 'bg-gradient-to-r from-green-400 to-blue-500' : 'bg-gradient-to-r from-green-400 to-blue-400'} opacity-20 blur-lg group-hover:opacity-40 transition-opacity`}></div>
                <Database className={`relative h-6 w-6 ${theme === 'light' ? 'text-green-600' : 'text-green-500'} transform group-hover:scale-110 transition-transform`} />
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-2`}>Evidence Management</h3>
                <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  Centralized evidence repository with version control. Link evidence to multiple
                  controls and frameworks effortlessly.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Assessment Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className={`relative rounded-lg overflow-hidden shadow-2xl ${theme === 'light' ? 'border border-slate-200' : 'border border-slate-600'}`}
          >
            <div className={`${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700'} p-4`}>
              <h3 className={`${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} font-semibold`}>ISO 27001 Assessment</h3>
            </div>
            <div className={`${theme === 'light' ? 'bg-white' : 'bg-slate-800'} p-6`}>
              <div className="space-y-4">
                <div className={`flex items-center justify-between p-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-700'} rounded-lg`}>
                  <div>
                    <h4 className={`${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} font-medium`}>A.5.1.1 Information Security Policies</h4>
                    <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Last updated 3 days ago</p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                    Compliant
                  </Badge>
                </div>
                <div className={`flex items-center justify-between p-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-700'} rounded-lg`}>
                  <div>
                    <h4 className={`${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} font-medium`}>A.6.1.1 Security Roles and Responsibilities</h4>
                    <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Last updated 1 week ago</p>
                  </div>
                  <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
                    In Review
                  </Badge>
                </div>
                <div className={`flex items-center justify-between p-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-700'} rounded-lg`}>
                  <div>
                    <h4 className={`${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} font-medium`}>A.7.1.1 Screening</h4>
                    <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Last updated 2 days ago</p>
                  </div>
                  <Badge className={`${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/10'} ${theme === 'light' ? 'text-blue-700' : 'text-blue-500'} hover:bg-blue-500/20`}>
                    In Progress
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
