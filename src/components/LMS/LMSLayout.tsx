import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  Home,
  BookOpen,
  GraduationCap,
  Trophy,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  Brain,
  Target,
  Clock,
  Users,
  FileText,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string | number;
  subItems?: NavItem[];
}

interface LMSLayoutProps {
  children?: React.ReactNode;
}

export const LMSLayout: React.FC<LMSLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      path: '/lms'
    },
    {
      id: 'my-learning',
      label: 'My Learning',
      icon: <BookOpen className="h-5 w-5" />,
      path: '/lms/my-learning',
      badge: 3,
      subItems: [
        {
          id: 'current-courses',
          label: 'Current Courses',
          icon: <Clock className="h-4 w-4" />,
          path: '/lms/my-learning/current',
          badge: 3
        },
        {
          id: 'completed',
          label: 'Completed',
          icon: <Trophy className="h-4 w-4" />,
          path: '/lms/my-learning/completed'
        },
        {
          id: 'certificates',
          label: 'Certificates',
          icon: <GraduationCap className="h-4 w-4" />,
          path: '/lms/my-learning/certificates'
        }
      ]
    },
    {
      id: 'discover',
      label: 'Discover',
      icon: <Sparkles className="h-5 w-5" />,
      path: '/lms/discover',
      subItems: [
        {
          id: 'catalog',
          label: 'Course Catalog',
          icon: <FileText className="h-4 w-4" />,
          path: '/lms/discover/catalog'
        },
        {
          id: 'recommended',
          label: 'Recommended',
          icon: <Brain className="h-4 w-4" />,
          path: '/lms/discover/recommended'
        },
        {
          id: 'trending',
          label: 'Trending Now',
          icon: <Target className="h-4 w-4" />,
          path: '/lms/discover/trending'
        }
      ]
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: <Calendar className="h-5 w-5" />,
      path: '/lms/calendar'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      path: '/lms/analytics'
    },
    {
      id: 'discussions',
      label: 'Discussions',
      icon: <MessageSquare className="h-5 w-5" />,
      path: '/lms/discussions',
      badge: 'New'
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: <Settings className="h-5 w-5" />,
      path: '/lms/admin',
      subItems: [
        {
          id: 'users',
          label: 'User Management',
          icon: <Users className="h-4 w-4" />,
          path: '/lms/admin/users'
        },
        {
          id: 'content',
          label: 'Content Management',
          icon: <FileText className="h-4 w-4" />,
          path: '/lms/admin/content'
        },
        {
          id: 'reports',
          label: 'Reports',
          icon: <BarChart3 className="h-4 w-4" />,
          path: '/lms/admin/reports'
        }
      ]
    }
  ];

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isItemActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isActive = isItemActive(item.path);

    return (
      <div key={item.id} className={cn(depth > 0 && "ml-6")}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start h-10 px-3 mb-1",
            isActive && "bg-primary/10 text-primary hover:bg-primary/20",
            !isActive && "hover:bg-muted/50",
            isCollapsed && depth === 0 && "justify-center px-2"
          )}
          onClick={() => {
            if (hasSubItems) {
              toggleItemExpansion(item.id);
            } else {
              navigate(item.path);
              setIsMobileMenuOpen(false);
            }
          }}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              {item.icon}
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                {item.badge && (
                  <Badge 
                    variant={typeof item.badge === 'string' ? 'secondary' : 'default'}
                    className="h-5 text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
                {hasSubItems && (
                  <ChevronRight 
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded && "rotate-90"
                    )}
                  />
                )}
              </div>
            )}
          </div>
        </Button>
        
        {hasSubItems && isExpanded && !isCollapsed && (
          <div className="mt-1">
            {item.subItems.map(subItem => renderNavItem(subItem, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-40 bg-card border-r transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 border-b flex items-center justify-between px-4">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">Training Hub</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4 px-3">
          {navItems.map(item => renderNavItem(item))}
        </ScrollArea>

        {/* Create Button */}
        <div className="p-3 border-t">
          <Button 
            className={cn(
              "w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
              isCollapsed && "px-2"
            )}
            onClick={() => navigate('/lms/create/learning-path')}
          >
            <Plus className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Create Course</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <header className="h-16 border-b bg-card/50 backdrop-blur-sm">
          <div className="h-full px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search courses, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80 h-9"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback>
                        {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/lms/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/lms/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};