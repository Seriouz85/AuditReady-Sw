import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building, 
  Users, 
  Shield, 
  BookOpen, 
  Activity, 
  TrendingUp, 
  DollarSign, 
  CreditCard 
} from 'lucide-react';
import type { StatsWidgetProps, StripeStats } from '../shared/AdminSharedTypes';

interface ExtendedStatsWidgetProps extends StatsWidgetProps {
  stripeStats: StripeStats | null;
}

export const StatsWidget: React.FC<ExtendedStatsWidgetProps> = ({
  stats,
  organizations,
  standards,
  stripeStats,
  loading
}) => {
  if (!stats) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
      {/* Organizations Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">Organizations</CardTitle>
          <div className="rounded-full bg-blue-600 p-2">
            <Building className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-900">{stats.totalOrganizations}</div>
          <p className="text-xs text-blue-600 mt-1">Active customers</p>
          <div className="mt-2">
            <div className="h-1 bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Card */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700">Users</CardTitle>
          <div className="rounded-full bg-green-600 p-2">
            <Users className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-900">{stats.totalUsers}</div>
          <p className="text-xs text-green-600 mt-1">Total platform users</p>
          <div className="mt-2">
            <div className="h-1 bg-green-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 rounded-full w-4/5"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Standards Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700">Standards</CardTitle>
          <div className="rounded-full bg-purple-600 p-2">
            <Shield className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-900">{stats.totalStandards}</div>
          <p className="text-xs text-purple-600 mt-1">Available frameworks</p>
          <div className="mt-2">
            <div className="h-1 bg-purple-200 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full w-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements Card */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-700">Requirements</CardTitle>
          <div className="rounded-full bg-orange-600 p-2">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-900">{stats.totalRequirements}</div>
          <p className="text-xs text-orange-600 mt-1">Total controls</p>
          <div className="mt-2">
            <div className="h-1 bg-orange-200 rounded-full overflow-hidden">
              <div className="h-full bg-orange-600 rounded-full w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Assessments Card */}
      <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-cyan-700">Active Assessments</CardTitle>
          <div className="rounded-full bg-cyan-600 p-2">
            <Activity className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-cyan-900">{stats.activeAssessments}</div>
          <p className="text-xs text-cyan-600 mt-1">In progress</p>
          <div className="mt-2">
            <div className="h-1 bg-cyan-200 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-600 rounded-full w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Updates Card */}
      <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-rose-700">Recent Updates</CardTitle>
          <div className="rounded-full bg-rose-600 p-2">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-rose-900">{stats.recentUpdates}</div>
          <p className="text-xs text-rose-600 mt-1">Last 7 days</p>
          <div className="mt-2">
            <div className="h-1 bg-rose-200 rounded-full overflow-hidden">
              <div className="h-full bg-rose-600 rounded-full w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Stripe Revenue Cards */}
      {stripeStats && (
        <>
          {/* Monthly Revenue Card */}
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-600/10 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Monthly Revenue</CardTitle>
              <div className="rounded-full bg-emerald-600 p-2">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-900">
                ${stripeStats.monthlyRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-emerald-600 mt-1">MRR from Stripe</p>
              <div className="mt-2">
                <div className="h-1 bg-emerald-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full w-4/5"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions Card */}
          <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-violet-600/10 rounded-full -mr-10 -mt-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-violet-700">Subscriptions</CardTitle>
              <div className="rounded-full bg-violet-600 p-2">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-violet-900">{stripeStats.activeSubscriptions}</div>
              <p className="text-xs text-violet-600 mt-1">Active paying customers</p>
              <div className="flex items-center mt-2">
                <div className={`w-2 h-2 rounded-full ${stripeStats.connectionStatus ? 'bg-green-500' : 'bg-red-500'} mr-1 animate-pulse`} />
                <span className="text-xs text-violet-600">
                  Stripe {stripeStats.connectionStatus ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};