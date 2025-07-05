import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Settings,
  LogOut,
  Shield,
  CreditCard,
  HelpCircle,
  Crown
} from 'lucide-react';
import { toast } from '@/utils/toast';

export const UserProfileDropdown: React.FC = () => {
  const { user, organization, userRole, isDemo, isPlatformAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Successfully signed out');
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const getUserInitials = () => {
    // CRITICAL SECURITY: Use demo data for demo accounts
    if (isDemo) {
      return 'DU'; // Demo User
    }
    
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    // CRITICAL SECURITY: Use demo data for demo accounts
    if (isDemo) {
      return 'Demo User';
    }
    
    return user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  };

  const getSubscriptionTier = () => {
    if (isDemo) return 'Demo';
    return organization?.subscription_tier || 'Free';
  };

  const getSubscriptionBadgeColor = () => {
    const tier = getSubscriptionTier().toLowerCase();
    switch (tier) {
      case 'enterprise':
        return 'bg-purple-500 text-white';
      case 'business':
        return 'bg-blue-500 text-white';
      case 'team':
        return 'bg-green-500 text-white';
      case 'demo':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage 
              src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${getUserDisplayName()}`} 
              alt={getUserDisplayName()} 
            />
            <AvatarFallback className="text-sm font-medium">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${getUserDisplayName()}`} 
                  alt={getUserDisplayName()} 
                />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {isDemo ? 'demo@auditready.com' : user.email}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                {organization && (
                  <p className="text-xs text-muted-foreground">{organization.name}</p>
                )}
                {isPlatformAdmin ? (
                  <Badge variant="outline" className="text-xs w-fit bg-red-50 text-red-700 border-red-200">
                    <Shield className="h-3 w-3 mr-1" />
                    Platform Administrator
                  </Badge>
                ) : userRole && (
                  <Badge variant="outline" className="text-xs w-fit">
                    <Shield className="h-3 w-3 mr-1" />
                    {userRole.display_name}
                  </Badge>
                )}
              </div>
              
              <Badge className={`text-xs ${getSubscriptionBadgeColor()}`}>
                {isDemo && <Crown className="h-3 w-3 mr-1" />}
                {getSubscriptionTier()}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => navigate('/app/settings?tab=profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => navigate('/app/settings?tab=organization')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Account Settings</span>
        </DropdownMenuItem>
        
        {!isDemo && (
          <DropdownMenuItem onClick={async () => {
            try {
              const { getCustomerPortalUrl } = await import('@/api/stripe');
              const portalUrl = await getCustomerPortalUrl();
              window.open(portalUrl, '_blank');
            } catch (error) {
              toast.error('Unable to open billing portal');
            }
          }}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing & Subscription</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={() => window.open('https://docs.auditready.com', '_blank')}>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Documentation</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {isPlatformAdmin && (
          <>
            <DropdownMenuItem onClick={() => navigate('/admin')}>
              <Shield className="mr-2 h-4 w-4" />
              <span className="text-red-600 font-medium">Platform Admin Console</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        {isDemo && (
          <>
            <DropdownMenuItem onClick={() => navigate('/pricing')}>
              <Crown className="mr-2 h-4 w-4" />
              <span className="text-blue-600 font-medium">Upgrade to Full Version</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};