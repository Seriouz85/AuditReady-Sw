import { motion } from "framer-motion";
import { 
  Shield, 
  Users, 
  Lightbulb,
  Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ZoomToggle } from "@/components/ui/zoom-toggle";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";

const LinkedInIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor"
    className="w-full h-full"
  >
    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
  </svg>
);

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
      description: "Smart automation for repetitive security tasks and processes",
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
    <div className={`min-h-screen ${theme === 'light' ? 'bg-gradient-to-b from-slate-50/50 to-white' : 'bg-gradient-to-b from-slate-900 to-slate-800'}`}>
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
      <section className="pt-16 sm:pt-20 pb-12 sm:pb-16 px-3 sm:px-4 relative min-h-[600px]">
        {/* AR Logo Background */}
        <motion.div
          initial={{ opacity: 0, x: -100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute -left-64 md:-left-48 lg:-left-32 top-8 sm:top-12 w-[600px] md:w-[800px] lg:w-[900px] h-[600px] md:h-[800px] lg:h-[900px]"
        >
          {/* Gradient overlay for smooth blending */}
          {theme === 'light' && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at left center, transparent 0%, transparent 40%, rgba(248,250,252,0.4) 60%, rgba(248,250,252,0.7) 80%, rgba(248,250,252,0.9) 100%)'
              }}
            />
          )}
          <img 
            src="/ar-logo.jpeg" 
            alt="AR Shield Logo"
            className={`w-full h-full object-contain ${theme === 'light' ? 'opacity-100' : 'opacity-60'}`}
            style={{
              maskImage: theme === 'light'
                ? 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.2) 85%, rgba(0,0,0,0) 100%)'
                : 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.2) 90%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: theme === 'light'
                ? 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.2) 85%, rgba(0,0,0,0) 100%)'
                : 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.2) 90%, rgba(0,0,0,0) 100%)',
              filter: theme === 'light' ? 'contrast(1.05)' : 'none',
              imageRendering: 'high-quality',
              WebkitImageRendering: 'high-quality',
              imageInterpolation: 'high-quality',
              msInterpolationMode: 'bicubic',
              transformOrigin: 'center',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          />
        </motion.div>
        
        <div className="container mx-auto max-w-7xl px-3 sm:px-4 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <Badge variant="outline" className={`${theme === 'light' ? 'text-blue-600 border-blue-300' : 'text-blue-400 border-blue-500/30'} text-xs sm:text-sm`}>
                About the Developer
              </Badge>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-4 sm:space-y-6"
            >
              <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light ${theme === 'light' ? 'text-slate-800' : 'bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent'} leading-tight tracking-wide font-sans`}>
                Payam Razifar
              </h1>
              
              <p className={`text-sm sm:text-base md:text-lg lg:text-xl ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} leading-relaxed font-light max-w-xl mx-auto`}>
                Transforming Information Security from Complex to Clear
              </p>
              
              <div className="flex justify-center pt-2">
                <a 
                  href="https://www.linkedin.com/in/payam-razifar/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-base ${theme === 'light' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg' : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25'} transition-all transform hover:scale-105 hover:shadow-xl`}
                >
                  <div className="w-5 h-5">
                    <LinkedInIcon />
                  </div>
                  Connect on LinkedIn
                </a>
              </div>
            </motion.div>
          </div>
          
          {/* My Vision card - positioned to the right */}
          <div className="flex justify-end mt-8" style={{marginLeft: '30rem'}}>
            <div className="w-full max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-16"
              >
                <div className={`relative group`}>
                  {/* Glowing background effect */}
                  <div className={`absolute -inset-1 ${theme === 'light' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-blue-400 to-blue-600'} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000`}></div>
                  
                  <Card className={`relative ${theme === 'light' ? 'bg-white/2 border-slate-200/20 shadow-2xl' : 'bg-slate-800/2 border-slate-600/20 shadow-2xl shadow-slate-900/50'} backdrop-blur-sm`}>
                    <CardContent className="p-8 md:p-10">
                    {/* Decorative element */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                      className="flex justify-center mb-6"
                    >
                      <div className={`w-16 h-1 ${theme === 'light' ? 'bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400' : 'bg-gradient-to-r from-blue-300 via-blue-500 to-blue-300'} rounded-full`}></div>
                    </motion.div>
                    
                    <h2 className={`text-3xl md:text-4xl font-light ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'} mb-8 text-center tracking-wide font-sans`}>
                      My Vision
                    </h2>
                    
                    <div className="text-center mb-10">
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className={`text-xl md:text-2xl lg:text-3xl font-bold mb-6 leading-tight tracking-tight`}
                      >
                        <span className={`${theme === 'light' ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent' : 'bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent'}`}>
                          Making compliance intuitive.
                        </span>
                        <br />
                        <span className={`${theme === 'light' ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent' : 'bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent'}`}>
                          Security accessible.
                        </span>
                        <br />
                        <span className={`${theme === 'light' ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent' : 'bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent'}`}>
                          Work enjoyable.
                        </span>
                      </motion.p>
                      
                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className={`text-base md:text-lg ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} leading-relaxed max-w-xl mx-auto font-light italic`}
                      >
                        I believe information security doesn't have to be overwhelming.<br className="hidden sm:block" />
                        With the right tools and approach, we can transform complex compliance requirements into clear, actionable insights that empower teams to work more effectively and confidently.
                      </motion.p>
                    </div>
                    
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="grid grid-cols-3 gap-4 md:gap-6"
                    >
                      <div className={`text-center p-4 rounded-xl ${theme === 'light' ? 'bg-gradient-to-br from-blue-50/70 to-blue-100/40 border border-blue-200/20' : 'bg-gradient-to-br from-blue-900/20 to-blue-800/10'} backdrop-blur-sm transition-transform hover:scale-105`}>
                        <div className={`text-3xl md:text-4xl font-black mb-2 font-serif ${theme === 'light' ? 'text-blue-700' : 'text-blue-300'}`}>
                          Simple
                        </div>
                        <p className={`text-xs md:text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'} font-medium tracking-wide uppercase`}>
                          Complexity simplified
                        </p>
                      </div>
                      
                      <div className={`text-center p-4 rounded-xl ${theme === 'light' ? 'bg-gradient-to-br from-purple-50/70 to-purple-100/40 border border-purple-200/20' : 'bg-gradient-to-br from-purple-900/20 to-purple-800/10'} backdrop-blur-sm transition-transform hover:scale-105`}>
                        <div className={`text-3xl md:text-4xl font-black mb-2 font-serif ${theme === 'light' ? 'text-purple-700' : 'text-purple-300'}`}>
                          Smart
                        </div>
                        <p className={`text-xs md:text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'} font-medium tracking-wide uppercase`}>
                          AI-powered insights
                        </p>
                      </div>
                      
                      <div className={`text-center p-4 rounded-xl ${theme === 'light' ? 'bg-gradient-to-br from-blue-50/70 to-blue-100/40 border border-blue-200/20' : 'bg-gradient-to-br from-blue-900/20 to-blue-800/10'} backdrop-blur-sm transition-transform hover:scale-105`}>
                        <div className={`text-3xl md:text-4xl font-black mb-2 font-serif ${theme === 'light' ? 'text-blue-700' : 'text-blue-300'}`}>
                          Effective
                        </div>
                        <p className={`text-xs md:text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'} font-medium tracking-wide uppercase`}>
                          Results that matter
                        </p>
                      </div>
                    </motion.div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        
      </section>


      {/* Inspirational Quote */}
      <section className="py-4 px-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="container mx-auto max-w-7xl"
        >
          <div className="flex justify-end">
            <div className="max-w-md text-right">
              <p className={`text-base md:text-lg lg:text-xl font-light italic ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} leading-relaxed mb-4`}>
                "For security specialists, by security specialists."
              </p>
              <div className={`w-12 h-0.5 ${theme === 'light' ? 'bg-blue-300' : 'bg-blue-500'} ml-auto`}></div>
            </div>
          </div>
        </motion.div>
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
                  <CardContent className="p-10 text-center h-full flex flex-col">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`rounded-3xl ${
                        area.color === 'blue' ? (theme === 'light' ? 'bg-gradient-to-br from-blue-100 to-blue-200' : 'bg-gradient-to-br from-blue-500/20 to-blue-600/30') :
                        area.color === 'purple' ? (theme === 'light' ? 'bg-gradient-to-br from-purple-100 to-purple-200' : 'bg-gradient-to-br from-purple-500/20 to-purple-600/30') :
                        area.color === 'green' ? (theme === 'light' ? 'bg-gradient-to-br from-green-100 to-green-200' : 'bg-gradient-to-br from-green-500/20 to-green-600/30') :
                        (theme === 'light' ? 'bg-gradient-to-br from-amber-100 to-amber-200' : 'bg-gradient-to-br from-amber-500/20 to-amber-600/30')
                      } p-6 mx-auto w-fit mb-8 shadow-lg flex items-center justify-center`}
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
                    {area.color !== 'amber' && <div className="flex-grow"></div>}
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
                  <div className="w-6 h-6 mr-3">
                    <LinkedInIcon />
                  </div>
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