import { motion } from "framer-motion";
import { 
  Shield, 
  GraduationCap, 
  Briefcase, 
  Award, 
  Users, 
  Lightbulb,
  Mail,
  MapPin,
  BookOpen,
  Code,
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

  const achievements = [
    {
      icon: <Award className="h-5 w-5" />,
      text: "Google Cybersecurity Program"
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      text: "Information Security Education"
    },
    {
      icon: <Code className="h-5 w-5" />,
      text: "Self-Taught Developer"
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
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className={`h-8 w-8 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
            <span className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-800' : 'bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent'}`}>
              AuditReady
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className={`${theme === 'light' ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-200 hover:text-slate-100 hover:bg-slate-700'}`}
              onClick={() => navigate("/")}
            >
              Home
            </Button>
            <ZoomToggle />
            <ThemeToggle />
            <Button 
              variant="ghost" 
              className={`${theme === 'light' ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-200 hover:text-slate-100 hover:bg-slate-700'}`}
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

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className={`absolute inset-0 ${theme === 'light' ? 'bg-[url(\'/grid.svg\')] opacity-10' : 'bg-gradient-to-br from-slate-900/20 via-transparent to-slate-700/10'}`}></div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className={`mb-4 ${theme === 'light' ? 'text-blue-600 border-blue-300' : 'text-blue-400 border-blue-500/30'}`}>
                About the Developer
              </Badge>
              <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${theme === 'light' ? 'text-slate-900' : 'bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent'} leading-tight`}>
                Payam Razifar
              </h1>
              <p className={`text-xl ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} max-w-3xl mx-auto mb-8`}>
                Transforming Information Security from Complex to Clear
              </p>
              <div className="flex justify-center">
                <a 
                  href="https://www.linkedin.com/in/payam-razifar/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${theme === 'light' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'} transition-all transform hover:scale-105`}
                >
                  <Linkedin className="h-4 w-4" />
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
              <Card className={`${theme === 'light' ? 'bg-white border-slate-200 shadow-lg' : 'bg-slate-800/70 border-slate-600'}`}>
                <CardContent className="p-8">
                  <h2 className={`text-3xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-8 text-center`}>
                    My Vision
                  </h2>
                  <div className="text-center mb-8">
                    <p className={`text-2xl ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'} font-semibold mb-4`}>
                      Making compliance intuitive. Security accessible. Work enjoyable.
                    </p>
                    <p className={`text-lg ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'} leading-relaxed max-w-2xl mx-auto`}>
                      I believe information security doesn't have to be overwhelming. With the right tools and approach, 
                      we can transform complex compliance requirements into clear, actionable insights that empower teams 
                      to work more effectively and confidently.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-center"
                    >
                      <div className={`text-4xl font-bold ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'} mb-2`}>
                        Simple
                      </div>
                      <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                        Complexity simplified
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-center"
                    >
                      <div className={`text-4xl font-bold ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'} mb-2`}>
                        Smart
                      </div>
                      <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                        AI-powered insights
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-center"
                    >
                      <div className={`text-4xl font-bold ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'} mb-2`}>
                        Effective
                      </div>
                      <p className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
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
                <Card className={`h-full ${theme === 'light' ? 'bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-lg hover:shadow-xl' : 'bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 hover:border-slate-500'} transition-all duration-300`}>
                  <CardContent className="p-8 text-center">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className={`rounded-2xl ${
                        area.color === 'blue' ? (theme === 'light' ? 'bg-blue-100' : 'bg-blue-500/20') :
                        area.color === 'purple' ? (theme === 'light' ? 'bg-purple-100' : 'bg-purple-500/20') :
                        area.color === 'green' ? (theme === 'light' ? 'bg-green-100' : 'bg-green-500/20') :
                        (theme === 'light' ? 'bg-amber-100' : 'bg-amber-500/20')
                      } p-4 mx-auto w-fit mb-6`}
                    >
                      <div className={`${
                        area.color === 'blue' ? (theme === 'light' ? 'text-blue-600' : 'text-blue-400') :
                        area.color === 'purple' ? (theme === 'light' ? 'text-purple-600' : 'text-purple-400') :
                        area.color === 'green' ? (theme === 'light' ? 'text-green-600' : 'text-green-400') :
                        (theme === 'light' ? 'text-amber-600' : 'text-amber-400')
                      }`}>
                        {area.icon}
                      </div>
                    </motion.div>
                    <h3 className={`text-xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-3`}>
                      {area.title}
                    </h3>
                    <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} text-sm leading-relaxed`}>
                      {area.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements & Education */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-8">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className={`flex items-center gap-3 px-6 py-3 rounded-full ${theme === 'light' ? 'bg-slate-100 border border-slate-200' : 'bg-slate-800 border border-slate-700'}`}
                >
                  <div className={`${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}>
                    {achievement.icon}
                  </div>
                  <span className={`${theme === 'light' ? 'text-slate-700' : 'text-slate-200'} font-medium`}>
                    {achievement.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className={`py-20 px-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-800/50'}`}>
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="text-center"
                >
                  <h3 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-3`}>
                    {value.title}
                  </h3>
                  <p className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} text-lg`}>
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className={`text-3xl md:text-4xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'} mb-6`}>
              Ready to Make Security Simple?
            </h2>
            <p className={`text-lg ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} mb-8`}>
              Let's transform how your team experiences compliance and security.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8"
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
                  className={`${theme === 'light' ? 'border-slate-300 hover:bg-slate-100' : 'border-slate-600 hover:bg-slate-700'} px-8`}
                >
                  <Linkedin className="mr-2 h-5 w-5" />
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