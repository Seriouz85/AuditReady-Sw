import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Zap,
  Lock,
  Users,
  BarChart3,
  FileText,
  Brain
} from "lucide-react";
import { useTheme } from "next-themes";

const features = [
  {
    icon: Zap,
    title: "Automated Assessments",
    description: "AI-powered gap analysis and compliance mapping across multiple frameworks.",
    gradient: "from-blue-500 to-indigo-600"
  },
  {
    icon: Lock,
    title: "Real-time Monitoring",
    description: "Continuous compliance tracking with instant alerts and notifications.",
    gradient: "from-green-500 to-emerald-600"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Seamless collaboration with role-based access and task management.",
    gradient: "from-purple-500 to-pink-600"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Comprehensive insights and trend analysis for informed decision-making.",
    gradient: "from-orange-500 to-red-600"
  },
  {
    icon: FileText,
    title: "Document Generation",
    description: "Professional compliance documents and reports generated automatically.",
    gradient: "from-cyan-500 to-blue-600"
  },
  {
    icon: Brain,
    title: "AI Assistance",
    description: "Smart recommendations and guidance powered by advanced AI.",
    gradient: "from-violet-500 to-purple-600"
  },
];

export default function FeaturesGrid() {
  const { theme } = useTheme();

  return (
    <section className="py-16 sm:py-20 px-3 sm:px-4">
      <div className="container mx-auto max-w-7xl">
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
                <Card
                  className={`${theme === 'light'
                    ? 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg'
                    : 'bg-slate-800 border-slate-700 hover:border-blue-500/50 hover:shadow-blue-500/10 hover:shadow-lg'} transition-all duration-300 h-full`}
                >
                  <CardContent className="p-6">
                    <div className={`relative rounded-xl bg-gradient-to-br ${feature.gradient} p-4 w-fit mb-4 shadow-lg overflow-hidden group`}>
                      <div className="absolute -inset-1 rounded-xl bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Icon className="relative h-6 w-6 text-white transform group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-3`}>
                      {feature.title}
                    </h3>
                    <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                      {feature.description}
                    </p>
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
