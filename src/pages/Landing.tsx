import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Shield, 
  Zap, 
  Lock, 
  FileCheck, 
  Users, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  BarChart3,
  FileText,
  PieChart,
  LineChart,
  ClipboardCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "next-themes";

export default function Landing() {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const { theme } = useTheme();

  const stats = [
    { number: "85%", label: "Time Saved on Assessments" },
    { number: "24/7", label: "Continuous Monitoring" },
    { number: "99.9%", label: "Platform Uptime" },
    { number: "500+", label: "Security Controls" },
  ];

  const testimonials = [
    {
      quote: "AuditReady transformed our compliance process. What used to take months now takes weeks.",
      author: "Sarah Chen",
      role: "CISO at TechCorp",
      company: "TechCorp Global",
    },
    {
      quote: "The automated assessment feature alone saved us countless hours of manual work.",
      author: "Michael Rodriguez",
      role: "Security Director",
      company: "FinanceSecure Ltd",
    },
    {
      quote: "Finally, a compliance platform that understands the needs of modern security teams.",
      author: "Emma Thompson",
      role: "Compliance Manager",
      company: "HealthTech Solutions",
    },
  ];

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-gradient-to-b from-slate-100 to-white' : 'bg-gradient-to-b from-slate-950 to-slate-900'}`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${theme === 'light' ? 'bg-white/80 border-slate-200' : 'bg-slate-900/80 border-slate-800'} backdrop-blur-md border-b`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className={`h-8 w-8 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
            <span className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-800' : 'bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent'}`}>
              AuditReady
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              className={`${theme === 'light' ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
              onClick={() => navigate("/login")}
            >
              Log in
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              onClick={() => navigate("/signup")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className={`absolute inset-0 bg-[url('/grid.svg')] ${theme === 'light' ? 'opacity-10' : 'opacity-5'}`}></div>
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className={`mb-4 ${theme === 'light' ? 'text-blue-600 border-blue-300' : 'text-blue-400 border-blue-500/30'}`}>
              Trusted by Leading Security Teams
            </Badge>
            <h1 className={`text-5xl md:text-7xl font-bold mb-6 ${theme === 'light' ? 'text-slate-900' : 'bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent'} leading-tight`}>
              Transform Your{" "}
              <span className={`${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`}>Compliance</span>{" "}
              Journey
            </h1>
            <p className={`text-xl ${theme === 'light' ? 'text-slate-700' : 'text-slate-400'} max-w-3xl mx-auto mb-8`}>
              Experience the future of compliance management. Automated assessments, 
              real-time monitoring, and AI-powered insights—all in one powerful platform.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-lg"
              onClick={() => navigate("/signup")}
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className={`${theme === 'light' 
                ? 'border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300' 
                : 'border-blue-800 text-blue-300 hover:bg-blue-900/40 hover:text-blue-200'} px-8 h-12 text-lg`}
              onClick={() => navigate("/demo")}
            >
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="text-center"
              >
                <h3 className={`text-4xl font-bold ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'} mb-2`}>{stat.number}</h3>
                <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className={`mb-4 ${theme === 'light' ? 'text-blue-600 border-blue-300' : 'text-blue-400 border-blue-500/30'}`}>
              Powerful Features
            </Badge>
            <h2 className={`text-3xl md:text-4xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'} mb-4`}>
              Your Command Center for Compliance
            </h2>
            <p className={`text-lg ${theme === 'light' ? 'text-slate-700' : 'text-slate-400'} max-w-2xl mx-auto`}>
              Get a bird's-eye view of your compliance status across all frameworks.
              Monitor, track, and improve your security posture in real-time.
            </p>
          </div>

          {/* Dashboard Mockup */}
          <div className="relative mx-auto max-w-6xl">
            <div className={`relative rounded-lg overflow-hidden shadow-2xl ${theme === 'light' ? 'border border-slate-200' : 'border border-slate-700'}`}>
              <div className={`${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'} p-2 flex items-center gap-2`}>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className={`${theme === 'light' ? 'bg-white' : 'bg-slate-900'} p-6`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className={`${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`${theme === 'light' ? 'text-slate-900' : 'text-white'} font-semibold`}>Compliance Score</h3>
                        <PieChart className={`h-5 w-5 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
                      </div>
                      <div className={`text-3xl font-bold ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`}>87%</div>
                      <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-400'} text-sm mt-2`}>+12% from last month</p>
                    </CardContent>
                  </Card>
                  <Card className={`${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`${theme === 'light' ? 'text-slate-900' : 'text-white'} font-semibold`}>Active Assessments</h3>
                        <ClipboardCheck className={`h-5 w-5 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
                      </div>
                      <div className={`text-3xl font-bold ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`}>12</div>
                      <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-400'} text-sm mt-2`}>3 due this week</p>
                    </CardContent>
                  </Card>
                  <Card className={`${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-700'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`${theme === 'light' ? 'text-slate-900' : 'text-white'} font-semibold`}>Risk Score</h3>
                        <LineChart className={`h-5 w-5 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
                      </div>
                      <div className="text-3xl font-bold text-green-500">Low</div>
                      <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-400'} text-sm mt-2`}>No critical findings</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assessment Preview Section */}
      <section className={`py-20 px-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900/50'}`}>
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className={`mb-4 ${theme === 'light' ? 'text-blue-600 border-blue-300' : 'text-blue-400 border-blue-500/30'}`}>
              Streamlined Assessments
            </Badge>
            <h2 className={`text-3xl md:text-4xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'} mb-4`}>
              Automated Assessment Engine
            </h2>
            <p className={`text-lg ${theme === 'light' ? 'text-slate-700' : 'text-slate-400'} max-w-2xl mx-auto`}>
              Say goodbye to spreadsheets and manual tracking. Our intelligent assessment
              engine handles the heavy lifting for you.
            </p>
          </div>

          {/* Assessment Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className={`rounded-full ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/10'} p-3`}>
                  <CheckCircle2 className={`h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
                </div>
                <div>
                  <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'} mb-2`}>Smart Control Mapping</h3>
                  <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-400'}`}>
                    Automatically map controls across multiple frameworks. Save hours of manual work
                    with intelligent control suggestions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className={`rounded-full ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/10'} p-3`}>
                  <BarChart3 className={`h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
                </div>
                <div>
                  <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'} mb-2`}>Real-time Progress Tracking</h3>
                  <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-400'}`}>
                    Monitor assessment progress in real-time. Get instant visibility into completion
                    rates and bottlenecks.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className={`rounded-full ${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/10'} p-3`}>
                  <FileText className={`h-6 w-6 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
                </div>
                <div>
                  <h3 className={`text-xl font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'} mb-2`}>Evidence Management</h3>
                  <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-400'}`}>
                    Centralized evidence repository with version control. Link evidence to multiple
                    controls and frameworks effortlessly.
                  </p>
                </div>
              </div>
            </div>

            {/* Assessment Preview Mockup */}
            <div className={`relative rounded-lg overflow-hidden shadow-2xl ${theme === 'light' ? 'border border-slate-200' : 'border border-slate-700'}`}>
              <div className={`${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'} p-4`}>
                <h3 className={`${theme === 'light' ? 'text-slate-900' : 'text-white'} font-semibold`}>ISO 27001 Assessment</h3>
              </div>
              <div className={`${theme === 'light' ? 'bg-white' : 'bg-slate-900'} p-6`}>
                <div className="space-y-4">
                  <div className={`flex items-center justify-between p-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'} rounded-lg`}>
                    <div>
                      <h4 className={`${theme === 'light' ? 'text-slate-900' : 'text-white'} font-medium`}>A.5.1.1 Information Security Policies</h4>
                      <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Last updated 3 days ago</p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                      Compliant
                    </Badge>
                  </div>
                  <div className={`flex items-center justify-between p-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'} rounded-lg`}>
                    <div>
                      <h4 className={`${theme === 'light' ? 'text-slate-900' : 'text-white'} font-medium`}>A.6.1.1 Security Roles and Responsibilities</h4>
                      <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Last updated 1 week ago</p>
                    </div>
                    <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
                      In Review
                    </Badge>
                  </div>
                  <div className={`flex items-center justify-between p-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800'} rounded-lg`}>
                    <div>
                      <h4 className={`${theme === 'light' ? 'text-slate-900' : 'text-white'} font-medium`}>A.7.1.1 Screening</h4>
                      <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Last updated 2 days ago</p>
                    </div>
                    <Badge className={`${theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/10'} ${theme === 'light' ? 'text-blue-700' : 'text-blue-500'} hover:bg-blue-500/20`}>
                      In Progress
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className={`mb-4 ${theme === 'light' ? 'text-blue-600 border-blue-300' : 'text-blue-400 border-blue-500/30'}`}>
              Customer Stories
            </Badge>
            <h2 className={`text-3xl md:text-4xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'} mb-4`}>
              Trusted by Security Leaders
            </h2>
            <p className={`text-lg ${theme === 'light' ? 'text-slate-700' : 'text-slate-400'} max-w-2xl mx-auto`}>
              See how leading organizations are transforming their compliance processes
              with AuditReady.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className={`${theme === 'light' ? 'bg-white border-slate-200 shadow-md' : 'bg-slate-800/50 border-slate-700'}`}>
                <CardContent className="p-6">
                  <div className="mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`${theme === 'light' ? 'text-yellow-500' : 'text-blue-500'}`}>★</span>
                    ))}
                  </div>
                  <p className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} mb-4`}>{testimonial.quote}</p>
                  <div>
                    <p className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{testimonial.author}</p>
                    <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{testimonial.role}</p>
                    <p className={`text-sm ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-8 md:p-12"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <motion.div
              className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"
              initial={false}
              animate={{
                opacity: isHovered ? 0.3 : 0.2,
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Compliance Process?
              </h2>
              <p className="text-lg text-blue-100 mb-8 max-w-3xl">
                Join the growing community of security professionals who have already 
                modernized their compliance management. Start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8"
                  onClick={() => navigate("/signup")}
                >
                  Get Started Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/20 px-8"
                  onClick={() => navigate("/contact")}
                >
                  Talk to Sales
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className={`py-12 px-4 border-t ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className={`${theme === 'light' ? 'text-slate-900' : 'text-white'} font-semibold mb-4`}>Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>Features</a></li>
                <li><a href="#pricing" className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>Pricing</a></li>
                <li><a href="#security" className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>Security</a></li>
                <li><a href="#roadmap" className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h3 className={`${theme === 'light' ? 'text-slate-900' : 'text-white'} font-semibold mb-4`}>Company</h3>
              <ul className="space-y-2">
                <li><a href="#about" className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>About</a></li>
                <li><a href="#careers" className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>Careers</a></li>
                <li><a href="#blog" className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>Blog</a></li>
                <li><a href="#press" className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className={`${theme === 'light' ? 'text-slate-900' : 'text-white'} font-semibold mb-4`}>Resources</h3>
              <ul className="space-y-2">
                <li><a href="#documentation" className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>Documentation</a></li>
                <li><a href="#help" className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>Help Center</a></li>
                <li><a href="#guides" className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>Guides</a></li>
                <li><a href="#api" className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>API Reference</a></li>
              </ul>
            </div>
            <div>
              <h3 className={`${theme === 'light' ? 'text-slate-900' : 'text-white'} font-semibold mb-4`}>Legal</h3>
              <ul className="space-y-2">
                <li><a href="#privacy" className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>Privacy</a></li>
                <li><a href="#terms" className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>Terms</a></li>
                <li><a href="#security" className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>Security</a></li>
                <li><a href="#cookies" className={`${theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}>Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className={`text-center ${theme === 'light' ? 'text-slate-600' : 'text-slate-500'} pt-8 ${theme === 'light' ? 'border-t border-slate-200' : 'border-t border-slate-800'}`}>
            <p>© 2024 AuditReady. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors">
      <CardContent className="p-6">
        <div className="rounded-full bg-blue-500/10 w-12 h-12 flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400">{description}</p>
      </CardContent>
    </Card>
  );
} 