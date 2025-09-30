import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ZoomToggle } from "@/components/ui/zoom-toggle";
import { useTheme } from "next-themes";

export function LandingHeader() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 ${theme === 'light' ? 'bg-white/80 border-slate-200' : 'bg-slate-800/90 border-slate-700'} backdrop-blur-md border-b`}>
      <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between max-w-7xl">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Shield className={`h-6 w-6 sm:h-8 sm:w-8 ${theme === 'light' ? 'text-blue-600' : 'text-blue-500'}`} />
          <span className={`text-lg sm:text-2xl font-bold ${theme === 'light' ? 'text-slate-800' : 'bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent'}`}>
            AuditReady
          </span>
        </div>

        {/* Center Navigation */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Button
            variant="ghost"
            size="sm"
            className={`inline-flex ${theme === 'light' ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-200 hover:text-slate-100 hover:bg-slate-700'}`}
            onClick={() => navigate("/roadmap")}
          >
            <span className="hidden md:inline">Roadmap</span>
            <span className="md:hidden">Map</span>
          </Button>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className={`inline-flex ${theme === 'light' ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-200 hover:text-slate-100 hover:bg-slate-700'}`}
            onClick={() => navigate("/about")}
          >
            <span className="hidden sm:inline">About Dev</span>
            <span className="sm:hidden">Dev</span>
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
  );
}
