import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Shield, Building2, Users } from "lucide-react";
import { IntegrationIcon } from "@/components/ui/IntegrationIcon";
import { useTheme } from "next-themes";

const integrations = [
  { provider: "okta", name: "Okta", delay: 0.1 },
  { provider: "aws", name: "AWS", delay: 0.2 },
  { provider: "azure", name: "Azure", delay: 0.3 },
  { provider: "slack", name: "Slack", delay: 0.4 },
  { provider: "teams", name: "Teams", delay: 0.5 },
  { provider: "google", name: "Google", delay: 0.6 },
  { provider: "jira", name: "Jira", delay: 0.7 },
  { provider: "servicenow", name: "ServiceNow", delay: 0.8 },
];

export function IntegrationsSection() {
  const { theme } = useTheme();

  return (
    <section className={`py-16 sm:py-20 px-3 sm:px-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <Badge variant="outline" className={`mb-4 ${theme === 'light' ? 'text-blue-600 border-blue-300' : 'text-blue-400 border-blue-500/30'}`}>
            Enterprise Integrations
          </Badge>
          <h2 className={`text-3xl md:text-4xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-4`}>
            Connect Your Entire Security Stack
          </h2>
          <p className={`text-lg ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} max-w-3xl mx-auto`}>
            AuditReady seamlessly integrates with your existing tools and workflows.
            Automate compliance data collection and reduce manual effort across your organization.
          </p>
        </div>

        {/* Integration Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className={`rounded-full ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/20'} p-4 mx-auto mb-4 w-fit`}>
              <Shield className={`h-8 w-8 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
            </div>
            <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-2`}>Security & Identity</h3>
            <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
              Connect with identity providers and security tools for automated user management and compliance monitoring.
            </p>
          </div>
          <div className="text-center">
            <div className={`rounded-full ${theme === 'light' ? 'bg-green-100' : 'bg-green-500/20'} p-4 mx-auto mb-4 w-fit`}>
              <Building2 className={`h-8 w-8 ${theme === 'light' ? 'text-green-600' : 'text-green-500'}`} />
            </div>
            <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-2`}>Cloud & Infrastructure</h3>
            <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
              Import security configurations and compliance data from your cloud infrastructure automatically.
            </p>
          </div>
          <div className="text-center">
            <div className={`rounded-full ${theme === 'light' ? 'bg-purple-100' : 'bg-purple-500/20'} p-4 mx-auto mb-4 w-fit`}>
              <Users className={`h-8 w-8 ${theme === 'light' ? 'text-purple-600' : 'text-purple-500'}`} />
            </div>
            <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-2`}>Team Collaboration</h3>
            <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
              Keep your team informed with real-time notifications and seamless workflow integration.
            </p>
          </div>
        </div>

        {/* Integration Logos Grid */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent rounded-2xl"></div>
          <div className={`p-8 rounded-2xl ${theme === 'light' ? 'bg-white/80 border border-slate-200' : 'bg-slate-800/50 border border-slate-700'} backdrop-blur-sm`}>
            <div className="text-center mb-8">
              <h3 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-2`}>
                Popular Integrations
              </h3>
              <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} max-w-md mx-auto`}>
                Connect with the tools your team already uses
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-center">
              {integrations.map(({ provider, name, delay }) => (
                <motion.div
                  key={provider}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay }}
                  viewport={{ once: true }}
                  className={`p-4 rounded-xl border ${theme === 'light' ? 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg' : 'border-slate-600 bg-slate-700/50 hover:border-blue-400 hover:shadow-xl'} transition-all duration-300 cursor-pointer group`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="transform transition-all duration-300 group-hover:scale-110">
                      <IntegrationIcon provider={provider as any} size="large" />
                    </div>
                    <span className={`text-sm font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
