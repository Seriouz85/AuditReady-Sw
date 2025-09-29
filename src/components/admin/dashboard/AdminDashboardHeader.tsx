import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  DollarSign, 
  Users, 
  RefreshCw, 
  LogOut, 
  Sparkles 
} from 'lucide-react';
import type { AdminDashboardHeaderProps } from './shared/AdminSharedTypes';

interface AdminDashboardHeaderExtendedProps extends AdminDashboardHeaderProps {
  loading: boolean;
  onRefresh: () => Promise<void>;
  onLogout: () => void;
}

export const AdminDashboardHeader: React.FC<AdminDashboardHeaderExtendedProps> = ({
  stats,
  stripeStats,
  authUser,
  loading,
  onRefresh,
  onLogout,
  signOut
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 shadow-2xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-600/90"></div>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
      
      {/* Content */}
      <div className="relative flex items-center justify-between text-white">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
              <Crown className="h-8 w-8 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Platform Admin Console</h1>
              <p className="text-blue-100 text-lg">
                Complete SaaS management with Stripe & Supabase integration
              </p>
            </div>
          </div>
          
          {/* Live Stats Bar */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-blue-100">Live Data Connected</span>
            </div>
            {stripeStats && (
              <>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-300" />
                  <span className="text-blue-100">${stripeStats.monthlyRevenue.toLocaleString()} MRR</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-300" />
                  <span className="text-blue-100">{stats?.totalUsers || 0} Users</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${stripeStats?.connectionStatus ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm text-blue-100">Stripe</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-sm text-blue-100">Supabase</span>
              </div>
            </div>
          </div>
          
          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Platform Administrator
          </Badge>
          
          <Button 
            variant="secondary" 
            onClick={onRefresh}
            disabled={loading}
            className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={onLogout}
            className="bg-red-500/20 text-white border-red-300/30 hover:bg-red-500/30 backdrop-blur-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};