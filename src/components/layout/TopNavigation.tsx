import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileDropdown } from './UserProfileDropdown';
import { NotificationsMenu } from '@/components/NotificationsMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ZoomToggle } from '@/components/ui/zoom-toggle';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Home, Shield } from 'lucide-react';

export const TopNavigation: React.FC = () => {
  const { user, organization, isDemo } = useAuth();
  const location = useLocation();

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    // Always start with Dashboard for app routes
    if (pathSegments[0] === 'app') {
      breadcrumbs.push({ label: 'Dashboard', path: '/app', icon: Home });
      
      // Add subsequent segments
      for (let i = 1; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        const path = '/' + pathSegments.slice(0, i + 1).join('/');
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
        breadcrumbs.push({ label, path });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Left side - Logo & Breadcrumbs */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl">AuditReady</span>
              {isDemo && (
                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                  Demo Mode
                </Badge>
              )}
            </div>
            
            {breadcrumbs.length > 0 && (
              <>
                <div className="hidden sm:block h-4 w-px bg-border" />
                <Breadcrumb className="hidden sm:flex">
                  <BreadcrumbList>
                    {breadcrumbs.map((crumb, index) => (
                      <React.Fragment key={crumb.path}>
                        <BreadcrumbItem>
                          {index === breadcrumbs.length - 1 ? (
                            <BreadcrumbPage className="flex items-center">
                              {crumb.icon && <crumb.icon className="h-4 w-4 mr-1" />}
                              {crumb.label}
                            </BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink asChild>
                              <Link to={crumb.path} className="flex items-center">
                                {crumb.icon && <crumb.icon className="h-4 w-4 mr-1" />}
                                {crumb.label}
                              </Link>
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </>
            )}
          </div>

          {/* Right side - Organization info & User controls */}
          <div className="flex items-center space-x-3">
            {/* Organization info */}
            {organization && (
              <div className="hidden md:flex flex-col items-end text-sm">
                <span className="font-medium text-foreground">{organization.name}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {organization.subscription_tier} Plan
                </span>
              </div>
            )}
            
            {/* Controls */}
            <div className="flex items-center space-x-2">
              <ZoomToggle />
              <ThemeToggle />
              <NotificationsMenu />
              {user && <UserProfileDropdown />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};