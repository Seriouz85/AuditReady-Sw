import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  BookOpen, 
  Settings, 
  Activity, 
  Building,
  ArrowLeft,
  Home
} from 'lucide-react';

export const AdminNavigation: React.FC = () => {
  const { isPlatformAdmin } = useAuth();
  const location = useLocation();

  if (!isPlatformAdmin) {
    return null;
  }

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { to: '/admin', icon: <Home size={20} />, label: 'Dashboard', exact: true },
    { to: '/admin/standards', icon: <Shield size={20} />, label: 'Standards' },
    { to: '/admin/organizations', icon: <Building size={20} />, label: 'Organizations' },
    { to: '/admin/users', icon: <Users size={20} />, label: 'Users' },
    { to: '/admin/compliance', icon: <BookOpen size={20} />, label: 'Compliance' },
    { to: '/admin/system', icon: <Settings size={20} />, label: 'System' },
    { to: '/admin/logs', icon: <Activity size={20} />, label: 'Audit Logs' },
  ];

  return (
    <div className="bg-slate-900 text-white min-h-screen w-64 fixed left-0 top-0 z-50">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold">AuditReady</h1>
            <Badge variant="outline" className="bg-blue-900/20 text-blue-300 border-blue-400 text-xs">
              Platform Admin
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const itemIsActive = item.exact 
            ? location.pathname === item.to
            : isActive(item.to);
            
          return (
            <Link key={item.to} to={item.to}>
              <Button
                variant={itemIsActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  itemIsActive 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Return to App */}
      <div className="absolute bottom-6 left-4 right-4">
        <Link to="/app">
          <Button variant="outline" className="w-full justify-start gap-3 border-slate-600 text-slate-300 hover:text-white hover:bg-slate-800">
            <ArrowLeft size={16} />
            <span>Back to App</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};