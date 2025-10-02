import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Shield, CheckCircle2, ArrowRight, Layers, Gauge, Lock, Crown } from "lucide-react";
import { useTheme } from "next-themes";

export function DataGovernanceSection() {
  const { theme } = useTheme();

  const features = [
    {
      icon: Shield,
      title: "Multi-Factor Authentication",
      description: "TOTP-based MFA with backup codes and risk-based authentication. Enterprise policies with time-limited sessions protect sensitive operations.",
      gradient: "from-blue-500 to-blue-600",
      items: ["TOTP & backup codes", "Risk-based security", "Enterprise device management"],
      color: "blue"
    },
    {
      icon: ArrowRight,
      title: "Time-Travel Data Restore",
      description: "Point-in-time recovery with hour/day granularity. Undo user sessions atomically or restore specific records with comprehensive audit trails.",
      gradient: "from-green-500 to-emerald-600",
      items: ["Point-in-time recovery", "Session-based restore", "99.9% restore reliability"],
      color: "green"
    },
    {
      icon: Layers,
      title: "Complete Audit Trails",
      description: "Comprehensive change tracking with JSONB diff functions. User session management and sensitive operations logging for regulatory compliance.",
      gradient: "from-purple-500 to-indigo-600",
      items: ["JSONB change tracking", "User session trails", "GDPR/CCPA ready"],
      color: "purple"
    },
    {
      icon: Gauge,
      title: "Custom Dashboard Builder",
      description: "Drag-and-drop dashboard customization with role-based widgets. Create executive, analyst, and operational views with real-time data visualization.",
      gradient: "from-orange-500 to-red-600",
      items: ["Drag-and-drop widgets", "Role-based permissions", "Real-time analytics"],
      color: "orange"
    },
    {
      icon: Lock,
      title: "Azure Purview Integration",
      description: "Native Microsoft Information Protection integration with automatic PII detection, custom classification labels, and GDPR/CCPA compliance automation.",
      gradient: "from-red-500 to-pink-600",
      items: ["Microsoft Purview sync", "Custom classification labels", "GDPR compliance reports"],
      color: "red"
    },
    {
      icon: Crown,
      title: "Enterprise Management",
      description: "Comprehensive organization management with real-time monitoring, advanced analytics, and enterprise-grade controls for large-scale operations.",
      gradient: "from-indigo-500 to-purple-600",
      items: ["Organization oversight", "Real-time monitoring", "Advanced analytics"],
      color: "indigo"
    }
  ];

  return (
    <section className="py-16 sm:py-20 px-3 sm:px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className={`mb-4 ${theme === 'light' ? 'text-blue-600 border-blue-300' : 'text-blue-400 border-blue-500/30'}`}>
            Enterprise Security & Data Governance
          </Badge>
          <h2 className={`text-3xl md:text-4xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-4`}>
            Built by security specialists, for everyone
          </h2>
          <p className={`text-lg ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} max-w-3xl mx-auto`}>
            Enterprise-grade data governance with multi-factor authentication, time-travel restore capabilities,
            and comprehensive audit trails. Because your data security can't be an afterthought.
          </p>
        </motion.div>

        {/* Security & Governance Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`h-full ${theme === 'light' ? `bg-gradient-to-br from-${feature.color}-50 to-${feature.color}-100/50 border-${feature.color}-200` : `bg-gradient-to-br from-${feature.color}-900/20 to-${feature.color}-800/10 border-${feature.color}-500/30`}`}>
                  <CardContent className="p-6">
                    <div className={`relative rounded-xl bg-gradient-to-br ${feature.gradient} p-3 w-fit mb-4 shadow-lg overflow-hidden group`}>
                      <div className="absolute -inset-1 rounded-xl bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                      <Icon className="relative h-6 w-6 text-white transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                    </div>
                    <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-3`}>
                      {feature.title}
                    </h3>
                    <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} mb-4`}>
                      {feature.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      {feature.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className={`h-4 w-4 ${theme === 'light' ? `text-${feature.color}-600` : `text-${feature.color}-500`}`} />
                          <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Security Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className={`mt-12 p-8 rounded-lg ${theme === 'light' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200' : 'bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/30'}`}
        >
          <div className="text-center">
            <div className={`rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-4 mx-auto mb-4 w-fit shadow-lg`}>
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-4`}>
              Security-First Architecture
            </h3>
            <p className={`text-lg ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} max-w-3xl mx-auto`}>
              Built by information security specialists who understand the critical importance of data protection.
              Every feature is designed with enterprise security and compliance requirements at its core.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
