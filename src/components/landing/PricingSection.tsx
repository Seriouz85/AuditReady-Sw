import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, Shield, Users, Building2, Crown } from "lucide-react";
import { useTheme } from "next-themes";

interface PricingSectionProps {
  onPricingClick: (tier: 'free' | 'team' | 'business' | 'enterprise') => void;
  isProcessingPayment: boolean;
  pricingLoading?: boolean;
  dynamicPlans?: any[];
}

export default function PricingSection({ onPricingClick, isProcessingPayment, pricingLoading, dynamicPlans }: PricingSectionProps) {
  const { theme } = useTheme();

  // Default plan structure with features
  const defaultPlanFeatures = {
    free: [
      'Up to 3 assessments',
      'Basic compliance tracking',
      '1 team member',
      'Community support',
      'Essential reports',
      'AI Assistant (Basic)'
    ],
    team: [
      'Up to 25 assessments',
      'Multi-framework support',
      'Up to 10 team members',
      'Priority email support',
      'Advanced analytics',
      'AI Assistant (Advanced)',
      'Document generation'
    ],
    business: [
      'Unlimited assessments',
      'All frameworks included',
      'Up to 50 team members',
      'Priority phone & email support',
      'Custom integrations',
      'Risk Management',
      'Learning Management System',
      'Azure Purview integration'
    ],
    enterprise: [
      'Unlimited everything',
      'Dedicated account manager',
      'Unlimited team members',
      '24/7 premium support',
      'White-label options',
      'Advanced admin controls',
      'Enterprise API access',
      'SLA guarantees'
    ]
  };

  // Use dynamic plans if available, otherwise fall back to static
  const plans = dynamicPlans && dynamicPlans.length > 0
    ? dynamicPlans.map(dynPlan => ({
        id: dynPlan.id as 'free' | 'team' | 'business' | 'enterprise',
        icon: dynPlan.id === 'free' ? Shield :
              dynPlan.id === 'team' ? Users :
              dynPlan.id === 'business' ? Building2 : Crown,
        name: dynPlan.name,
        price: dynPlan.price === 0 ? 'Free' :
               `€${dynPlan.price}`,
        period: dynPlan.price === 0 ? '' : '/month',
        popular: dynPlan.id === 'business',
        description: dynPlan.id === 'free' ? 'Perfect for getting started' :
                    dynPlan.id === 'team' ? 'For growing teams' :
                    dynPlan.id === 'business' ? 'For established organizations' :
                    'For large enterprises',
        features: defaultPlanFeatures[dynPlan.id as keyof typeof defaultPlanFeatures] || []
      }))
    : [
        {
          id: 'free' as const,
          icon: Shield,
          name: 'Free',
          price: 'Free',
          period: '',
          description: 'Perfect for getting started',
          features: defaultPlanFeatures.free
        },
        {
          id: 'team' as const,
          icon: Users,
          name: 'Team',
          price: '€499',
          period: '/month',
          popular: false,
          description: 'For growing teams',
          features: defaultPlanFeatures.team
        },
        {
          id: 'business' as const,
          icon: Building2,
          name: 'Business',
          price: '€699',
          period: '/month',
          popular: true,
          description: 'For established organizations',
          features: defaultPlanFeatures.business
        },
        {
          id: 'enterprise' as const,
          icon: Crown,
          name: 'Enterprise',
          price: '€999',
          period: '/month',
          description: 'For large enterprises',
          features: defaultPlanFeatures.enterprise
        }
      ];

  return (
    <section id="pricing" className={`py-24 px-3 sm:px-4 ${theme === 'light' ? 'bg-gradient-to-b from-slate-50 to-white' : 'bg-gradient-to-b from-slate-900 to-slate-800'}`}>
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <Badge variant="outline" className={`mb-6 ${theme === 'light' ? 'text-blue-600 border-blue-300' : 'text-blue-400 border-blue-500/30'}`}>
            Simple, Transparent Pricing
          </Badge>
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
            Choose Your Perfect Plan
          </h2>
          <p className={`text-xl ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} max-w-3xl mx-auto mb-8`}>
            Scale your compliance management as your organization grows. All plans include enterprise-grade security with no hidden fees.
          </p>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${theme === 'light' ? 'bg-blue-50 text-blue-700' : 'bg-blue-900/30 text-blue-300'}`}>
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">14-day free trial • No credit card required • Cancel anytime</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-full mx-auto pt-12">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="h-full relative"
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                <Card className={`h-full ${isPopular
                  ? theme === 'light'
                    ? 'border-blue-500 shadow-xl bg-white ring-2 ring-blue-500/20'
                    : 'border-blue-400 shadow-2xl bg-slate-800 ring-2 ring-blue-500/20'
                  : theme === 'light'
                    ? 'border-slate-200 hover:border-blue-300 bg-white'
                    : 'border-slate-600 hover:border-blue-500 bg-slate-800'} transition-all duration-300 hover:shadow-xl flex flex-col overflow-hidden`}
                >

                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="text-center mb-6">
                      <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 ${
                        plan.id === 'free'
                          ? theme === 'light' ? 'bg-blue-100' : 'bg-blue-900/30'
                          : plan.id === 'team'
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg'
                            : plan.id === 'business'
                              ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg'
                              : 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg'
                      }`}>
                        <Icon className={`h-6 w-6 ${
                          plan.id === 'free'
                            ? theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                            : 'text-white'
                        }`} />
                      </div>
                      <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>{plan.name}</h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className={`text-4xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>{plan.price}</span>
                        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{plan.period}</span>
                      </div>
                      <p className={`text-sm mt-2 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'} min-h-[2.5rem] flex items-center justify-center`}>
                        {plan.description}
                      </p>
                    </div>

                    <div className="flex-1 mb-6">
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => {
                          const isHighlight = feature.includes('AuditReady');
                          return (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                                {isHighlight && theme === 'light' && (
                                  <span className="relative inline-block">
                                    <span className="relative z-10 px-1 py-0.5 font-semibold">{feature}</span>
                                    <span className="absolute inset-0 bg-gradient-to-r from-blue-100/80 via-purple-100/80 to-blue-100/80 rounded-md shadow-sm"></span>
                                  </span>
                                )}
                                {isHighlight && theme === 'dark' && (
                                  <span className="relative inline-block">
                                    <span className="relative z-10 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent font-bold">{feature}</span>
                                    <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-md blur-sm"></span>
                                  </span>
                                )}
                                {!isHighlight && feature}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <Button
                      size="lg"
                      onClick={() => onPricingClick(plan.id)}
                      disabled={isProcessingPayment || pricingLoading}
                      className={`w-full ${isPopular
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                        : theme === 'light'
                          ? 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                          : 'bg-slate-700 border-2 border-blue-500 text-blue-400 hover:bg-slate-600'}`}
                    >
                      {plan.id === 'free' ? 'Get Started' : plan.id === 'enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
