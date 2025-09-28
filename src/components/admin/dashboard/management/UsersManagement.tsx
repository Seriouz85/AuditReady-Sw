import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  UserPlus, 
  TrendingUp, 
  Activity, 
  Mail, 
  Shield, 
  Filter, 
  Download, 
  Eye, 
  UserCheck, 
  Sparkles 
} from 'lucide-react';
import { formatDate } from '../shared/AdminUtilities';
import type { PlatformStats, OrganizationSummary } from '../shared/AdminSharedTypes';

interface UsersManagementProps {
  stats: PlatformStats | null;
  organizations: OrganizationSummary[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({
  stats,
  organizations,
  loading,
  searchTerm,
  onSearchChange
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              User Management
            </h2>
            <p className="text-muted-foreground mt-2">Manage users across all organizations with enterprise controls</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            User Management
          </h2>
          <p className="text-muted-foreground mt-2">Manage users across all organizations with enterprise controls</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button 
            onClick={() => navigate('/admin/users')} 
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* User Stats Cards */}
      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{stats?.totalUsers || 0}</div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +{(stats as any)?.newUsersThisMonth || 0} this month
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{(stats as any)?.activeUsers || 0}</div>
            <div className="flex items-center mt-2 text-sm text-blue-600">
              <Activity className="w-4 h-4 mr-1" />
              Last 30 days
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Pending Invites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">{(stats as any)?.pendingInvites || 0}</div>
            <div className="flex items-center mt-2 text-sm text-yellow-600">
              <Mail className="w-4 h-4 mr-1" />
              Awaiting response
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{(stats as any)?.adminUsers || 0}</div>
            <div className="flex items-center mt-2 text-sm text-purple-600">
              <Shield className="w-4 h-4 mr-1" />
              Platform admins
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users Table */}
      {organizations.length > 0 ? (
        <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">Recent Users</CardTitle>
                <CardDescription>Latest user registrations and activity</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-3 h-3 mr-1" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {organizations.slice(0, 8).map((org, index) => (
                <div key={org.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors group">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-gradient-to-br from-green-500 to-teal-500 p-2 text-white">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{org.name} Users</div>
                      <div className="text-sm text-gray-500">Organization • {org.userCount} members</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{org.userCount} users</div>
                      <div className="text-xs text-gray-500">Last login {formatDate(org.lastActivity)}</div>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/admin/organizations/${org.id}`)}>
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Manage
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
          <CardContent className="p-12 text-center">
            <div className="rounded-full bg-green-100 p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Users className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-green-900">No Users Yet</h3>
            <p className="text-green-700 mb-6 max-w-md mx-auto">
              Start by creating organizations and inviting users to your platform.
            </p>
            <Button onClick={() => navigate('/admin/users')} size="lg" className="bg-gradient-to-r from-green-600 to-teal-600">
              <UserPlus className="w-5 h-5 mr-2" />
              Invite First User
            </Button>
          </CardContent>
        </Card>
      )}

      {/* User Management Tools */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <Sparkles className="w-5 h-5 mr-2" />
            User Management Tools
          </CardTitle>
          <CardDescription>Powerful tools for managing users across your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col border-green-200 text-green-700 hover:bg-green-50" 
              onClick={() => navigate('/admin/users')}
            >
              <Users className="w-6 h-6 mb-2" />
              <span className="text-sm">Browse All Users</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col border-green-200 text-green-700 hover:bg-green-50" 
              onClick={() => navigate('/admin/users')}
            >
              <Shield className="w-6 h-6 mb-2" />
              <span className="text-sm">Role Management</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col border-green-200 text-green-700 hover:bg-green-50" 
              onClick={() => navigate('/admin/users')}
            >
              <Activity className="w-6 h-6 mb-2" />
              <span className="text-sm">Access Logs</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col border-green-200 text-green-700 hover:bg-green-50">
              <Mail className="w-6 h-6 mb-2" />
              <span className="text-sm">Bulk Invitations</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};