import { motion } from "framer-motion";
import { 
  Shield, 
  Users, 
  Lightbulb,
  Brain,
  Linkedin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ZoomToggle } from "@/components/ui/zoom-toggle";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";

export default function About() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const expertise = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Security Strategy",
      description: "Turning complex compliance into clear action plans",
      color: "blue"
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI Innovation",
      description: "Smart automation for repetitive security tasks",
      color: "purple"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Team Empowerment",
      description: "Making security work for people, not against them",
      color: "green"
    },
    {
      icon: <Lightbulb className="h-8 w-8" />,
      title: "Creative Solutions",
      description: "Fresh perspectives on traditional challenges",
      color: "amber"
    }
  ];


  const values = [
    {
      title: "Simplicity First",
      description: "Complex problems deserve clear solutions"
    },
    {
      title: "People-Centric",
      description: "Technology should work for people, not the other way around"
    },
    {
      title: "Continuous Growth", 
      description: "Every challenge is an opportunity to learn and improve"
    }
  ];

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-gradient-to-b from-slate-100 to-white' : 'bg-gradient-to-b from-slate-900 to-slate-800'}`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${theme === 'light' ? 'bg-white/80 border-slate-200' : 'bg-slate-800/90 border-slate-700'} backdrop-blur-md border-b`}>
        <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between max-w-7xl">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Shield className={`h-6 w-6 sm:h-8 sm:w-8 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
            <span className={`text-lg sm:text-2xl font-bold ${theme === 'light' ? 'text-slate-800' : 'bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent'}`}>
              AuditReady
            </span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-4">
            <Button 
              variant="ghost" 
              className={`hidden md:inline-flex ${theme === 'light' ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-200 hover:text-slate-100 hover:bg-slate-700'}`}
              onClick={() => navigate("/")}
            >
              Home
            </Button>
            <div className="hidden sm:flex items-center space-x-2">
              <ZoomToggle />
              <ThemeToggle />
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className={`text-xs sm:text-sm px-2 sm:px-4 font-medium ${theme === 'light' ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 border border-slate-200/50' : 'text-slate-200 hover:text-slate-100 hover:bg-slate-700/80 border border-slate-600/50'}`}
              onClick={() => navigate("/login")}
            >
              Log in
            </Button>
            <Button 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-6 text-xs sm:text-sm font-semibold shadow-md border-2 border-blue-500/20"
              onClick={() => navigate("/onboarding")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 sm:pt-20 pb-16 sm:pb-20 px-3 sm:px-4">
        <div className="container mx-auto max-w-7xl px-3 sm:px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className={`mb-4 ${theme === 'light' ? 'text-blue-600 border-blue-300' : 'text-blue-400 border-blue-500/30'}`}>
                About the Developer
              </Badge>
              <h1 className={`text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 ${theme === 'light' ? 'text-slate-900' : 'bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent'} leading-tight tracking-tight px-2`}>
                Payam Razifar
              </h1>
              <p className={`text-base sm:text-xl md:text-3xl ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} max-w-3xl mx-auto mb-6 sm:mb-8 px-4 leading-relaxed font-light`}>
                Transforming Information Security from Complex to Clear
              </p>
              <div className="flex justify-center">
                <a 
                  href="https://www.linkedin.com/in/payam-razifar/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg ${theme === 'light' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg' : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25'} transition-all transform hover:scale-105 hover:shadow-xl`}
                >
                  <Linkedin className="h-5 w-5" />
                  Connect on LinkedIn
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Professional Summary */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-16"
            >
              <Card className={`${theme === 'light' ? 'bg-gradient-to-br from-white to-slate-50/50 border-slate-200 shadow-xl' : 'bg-gradient-to-br from-slate-800/80 to-slate-700/50 border-slate-600 shadow-2xl shadow-slate-900/50'} backdrop-blur-sm`}>
                <CardContent className="p-12">
                  <h2 className={`text-4xl md:text-5xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-12 text-center tracking-tight`}>
                    My Vision
                  </h2>
                  <div className="text-center mb-12">
                    <p className={`text-3xl md:text-4xl ${theme === 'light' ? 'bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent' : 'bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent'} font-bold mb-8 leading-tight`}>
                      Making compliance intuitive. Security accessible. Work enjoyable.
                    </p>
                    <p className={`text-xl ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'} leading-relaxed max-w-3xl mx-auto font-light`}>
                      I believe information security doesn't have to be overwhelming. With the right tools and approach, 
                      we can transform complex compliance requirements into clear, actionable insights that empower teams 
                      to work more effectively and confidently.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-center"
                    >
                      <div className={`text-6xl font-bold ${theme === 'light' ? 'bg-gradient-to-b from-blue-600 to-blue-700 bg-clip-text text-transparent' : 'bg-gradient-to-b from-blue-400 to-blue-500 bg-clip-text text-transparent'} mb-4`}>
                        Simple
                      </div>
                      <p className={`text-lg ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} font-medium`}>
                        Complexity simplified
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-center"
                    >
                      <div className={`text-6xl font-bold ${theme === 'light' ? 'bg-gradient-to-b from-blue-600 to-blue-700 bg-clip-text text-transparent' : 'bg-gradient-to-b from-blue-400 to-blue-500 bg-clip-text text-transparent'} mb-4`}>
                        Smart
                      </div>
                      <p className={`text-lg ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} font-medium`}>
                        AI-powered insights
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-center"
                    >
                      <div className={`text-6xl font-bold ${theme === 'light' ? 'bg-gradient-to-b from-blue-600 to-blue-700 bg-clip-text text-transparent' : 'bg-gradient-to-b from-blue-400 to-blue-500 bg-clip-text text-transparent'} mb-4`}>
                        Effective
                      </div>
                      <p className={`text-lg ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} font-medium`}>
                        Results that matter
                      </p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Expertise Areas */}
      <section className={`py-20 px-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className={`text-4xl md:text-5xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-12`}>
                What I Bring to the Table
              </h2>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-20">
            {expertise.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className={`h-full ${theme === 'light' ? 'bg-gradient-to-br from-white to-slate-50/80 border-slate-200 shadow-xl hover:shadow-2xl' : 'bg-gradient-to-br from-slate-800/90 to-slate-700/60 border-slate-600 hover:border-slate-500 shadow-2xl shadow-slate-900/20'} transition-all duration-500 hover:scale-105`}>
                  <CardContent className="p-10 text-center">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`rounded-3xl ${
                        area.color === 'blue' ? (theme === 'light' ? 'bg-gradient-to-br from-blue-100 to-blue-200' : 'bg-gradient-to-br from-blue-500/20 to-blue-600/30') :
                        area.color === 'purple' ? (theme === 'light' ? 'bg-gradient-to-br from-purple-100 to-purple-200' : 'bg-gradient-to-br from-purple-500/20 to-purple-600/30') :
                        area.color === 'green' ? (theme === 'light' ? 'bg-gradient-to-br from-green-100 to-green-200' : 'bg-gradient-to-br from-green-500/20 to-green-600/30') :
                        (theme === 'light' ? 'bg-gradient-to-br from-amber-100 to-amber-200' : 'bg-gradient-to-br from-amber-500/20 to-amber-600/30')
                      } p-6 mx-auto w-fit mb-8 shadow-lg`}
                    >
                      <div className={`${
                        area.color === 'blue' ? (theme === 'light' ? 'text-blue-700' : 'text-blue-400') :
                        area.color === 'purple' ? (theme === 'light' ? 'text-purple-700' : 'text-purple-400') :
                        area.color === 'green' ? (theme === 'light' ? 'text-green-700' : 'text-green-400') :
                        (theme === 'light' ? 'text-amber-700' : 'text-amber-400')
                      }`}>
                        {area.icon}
                      </div>
                    </motion.div>
                    <h3 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-4`}>
                      {area.title}
                    </h3>
                    <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} text-base leading-relaxed font-medium`}>
                      {area.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Core Values */}
      <section className={`py-24 px-4`}>
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className={`text-4xl md:text-5xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-6 tracking-tight`}>
                  Core Values That Drive Excellence
                </h2>
                <p className={`text-xl ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} max-w-3xl mx-auto font-light`}>
                  The principles that guide every decision and solution
                </p>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * index, duration: 0.6 }}
                  className="text-center"
                >
                  <Card className={`h-full ${theme === 'light' ? 'bg-gradient-to-br from-white to-slate-50/50 border-slate-200 shadow-lg hover:shadow-xl' : 'bg-gradient-to-br from-slate-800/80 to-slate-700/50 border-slate-600 hover:border-slate-500 shadow-xl shadow-slate-900/20'} transition-all duration-300 hover:scale-105`}>
                    <CardContent className="p-8">
                      <h3 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-4`}>
                        {value.title}
                      </h3>
                      <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} text-lg leading-relaxed`}>
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className={`py-24 px-4 ${theme === 'light' ? 'bg-gradient-to-br from-slate-50 to-white' : 'bg-gradient-to-br from-slate-900 to-slate-800'}`}>
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className={`text-4xl md:text-6xl font-bold ${theme === 'light' ? 'text-slate-900' : 'bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent'} mb-8 tracking-tight`}>
              Ready to Make Security Simple?
            </h2>
            <p className={`text-xl md:text-2xl ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} mb-12 leading-relaxed font-light`}>
              Let's transform how your team experiences compliance and security.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                onClick={() => navigate("/login")}
              >
                Try AuditReady
              </Button>
              <a 
                href="https://www.linkedin.com/in/payam-razifar/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg" 
                  variant="outline" 
                  className={`${theme === 'light' ? 'border-slate-400 hover:bg-slate-100 text-slate-700' : 'border-slate-500 hover:bg-slate-700 text-slate-200'} px-12 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
                >
                  <Linkedin className="mr-3 h-6 w-6" />
                  Connect
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Footer */}
      <footer className={`py-8 px-4 border-t ${theme === 'light' ? 'border-slate-200' : 'border-slate-600'}`}>
        <div className="container mx-auto text-center">
          <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            © 2024 AuditReady by Payam Razifar. Building the future of compliance management.
          </p>
        </div>
      </footer>
    </div>
  );
}