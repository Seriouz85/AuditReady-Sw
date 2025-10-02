import { Shield, Key, Fingerprint } from "lucide-react";

interface LoginFeaturesProps {
  theme?: string;
}

export function LoginFeatures({ theme = 'dark' }: LoginFeaturesProps) {
  const features = [
    {
      icon: Shield,
      title: "Comprehensive Compliance",
      description: "Manage multiple compliance frameworks in one place"
    },
    {
      icon: Key,
      title: "Enterprise Security",
      description: "Bank-grade security with end-to-end encryption"
    },
    {
      icon: Fingerprint,
      title: "Automated Workflows",
      description: "Streamline your compliance processes with automation"
    }
  ];

  return (
    <div className={`hidden lg:flex flex-1 flex-col justify-center px-4 relative ${theme === 'light' ? 'bg-slate-50' : ''}`}>
      {theme === 'dark' && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-transparent to-slate-700/10" aria-hidden="true" />
      )}

      <div className="max-w-lg mr-auto ml-8 relative z-10">
        <h2 className={`text-2xl font-bold mb-4 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
          Why Choose AuditReady?
        </h2>
        <p className={`mb-6 ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
          Join thousands of organizations that trust AuditReady for their compliance needs
        </p>

        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`p-2 rounded ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/20'}`}>
                <feature.icon className={`h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} aria-hidden="true" />
              </div>
              <div>
                <h3 className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                  {feature.title}
                </h3>
                <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
