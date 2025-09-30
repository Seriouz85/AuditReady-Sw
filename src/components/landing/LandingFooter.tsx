import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";

export default function LandingFooter() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <footer className={`${theme === 'light' ? 'bg-slate-900' : 'bg-slate-900'} text-white py-12 px-3 sm:px-4`}>
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold">AuditReady</span>
            </div>
            <p className="text-slate-400 text-sm">
              Enterprise compliance management platform for modern security teams.
            </p>
          </div>
          <div>
            <h3 className="text-slate-100 font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><button onClick={() => navigate("/features")} className="text-slate-400 hover:text-white text-left">Features</button></li>
              <li><a href="#pricing" className="text-slate-400 hover:text-white">Pricing</a></li>
              <li><button onClick={() => navigate("/security")} className="text-slate-400 hover:text-white text-left">Security</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-slate-100 font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><button onClick={() => navigate("/documentation")} className="text-slate-400 hover:text-white text-left">Documentation</button></li>
              <li><button onClick={() => navigate("/roadmap")} className="text-slate-400 hover:text-white text-left">Roadmap</button></li>
              <li><button onClick={() => navigate("/about")} className="text-slate-400 hover:text-white text-left">About Dev</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-slate-100 font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate("/compliance-simplification")} className="text-slate-400 hover:text-white text-left transition-colors">
                  Compliance Simplification
                </button>
              </li>
              <li><span className="text-slate-500 cursor-not-allowed">Help Center</span></li>
              <li><span className="text-slate-500 cursor-not-allowed">API Reference</span></li>
              <li><span className="text-slate-500 cursor-not-allowed">Status Page</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
          <p>&copy; 2025 AuditReady. All rights reserved. Built with ❤️ by security specialists.</p>
        </div>
      </div>
    </footer>
  );
}
