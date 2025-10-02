import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { adminService } from '@/services/admin/AdminService';
import { supabase } from '@/lib/supabase';
import { toast } from '@/utils/toast';
import {
  Users,
  Search,
  UserPlus,
  TrendingUp,
  Activity,
  Mail,
  Shield,
  Eye,
  UserCheck,
  Sparkles,
  Clock,
  Ban,
  ArrowRight,
  MoreVertical,
  KeyRound,
  Send
} from 'lucide-react';

interface UsersManagementProps {
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  raw_user_meta_data?: any;
  organization_name?: string;
  name?: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  suspendedUsers: number;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({
  loading: parentLoading,
  searchTerm,
  onSearchChange
}) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    suspendedUsers: 0
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [suspendingUser, setSuspendingUser] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setDataLoading(true);
    try {
      // Load all users
      const allUsers = await adminService.getAllUsers();

      // Get organization names for users and extract names from metadata
      const usersWithOrgs = await Promise.all(
        (allUsers || []).map(async (user) => {
          try {
            // Try to get organization membership
            const { data: membership } = await supabase
              .from('organization_members')
              .select('organization:organizations(name)')
              .eq('user_id', user.id)
              .single();

            // Extract name from user metadata or email
            const userName = user.raw_user_meta_data?.name ||
                           user.raw_user_meta_data?.full_name ||
                           user.email.split('@')[0];

            return {
              ...user,
              organization_name: membership && (membership.organization as any)?.name || 'No Organization',
              name: userName
            };
          } catch {
            const userName = user.raw_user_meta_data?.name ||
                           user.raw_user_meta_data?.full_name ||
                           user.email.split('@')[0];
            return {
              ...user,
              organization_name: 'No Organization',
              name: userName
            };
          }
        })
      );

      setUsers(usersWithOrgs);

      // Calculate stats
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

      const activeUsers = usersWithOrgs.filter(u => {
        if (!u.last_sign_in_at) return false;
        return new Date(u.last_sign_in_at) >= thirtyDaysAgo;
      }).length;

      const newUsersThisMonth = usersWithOrgs.filter(u => {
        return new Date(u.created_at) >= oneMonthAgo;
      }).length;

      setStats({
        totalUsers: usersWithOrgs.length,
        activeUsers,
        newUsersThisMonth,
        suspendedUsers: 0 // Would come from user status if implemented
      });

    } catch (error) {
      console.error('Failed to load user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setDataLoading(false);
    }
  };

  const goToUserManagement = () => {
    navigate('/admin/users');
  };

  const handleSuspendUser = async () => {
    if (!selectedUser) return;

    setSuspendingUser(true);
    try {
      await adminService.suspendUser(selectedUser.id, 'Suspended by platform administrator');
      toast.success(`User ${selectedUser.email} has been suspended`);
      setShowSuspendDialog(false);
      setSelectedUser(null);
      // Reload users
      await loadUserData();
    } catch (error) {
      console.error('Failed to suspend user:', error);
      toast.error('Failed to suspend user');
    } finally {
      setSuspendingUser(false);
    }
  };

  const handleResetPassword = async (user: User) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success(`Password reset email sent to ${user.email}`);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      toast.error('Failed to send password reset email');
    }
  };

  const handleSendEmail = async (user: User) => {
    // For now, just show a toast - you can integrate with email service later
    toast.info(`Email functionality for ${user.email} - Coming soon`);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getTimeSince = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return `${Math.floor(diffDays / 30)} months ago`;
    } catch {
      return 'Unknown';
    }
  };

  if (parentLoading || dataLoading) {
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

  // Filter users based on search term
  const filteredUsers = searchTerm
    ? users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.organization_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

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
            onClick={goToUserManagement}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Manage Users
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
            <div className="text-3xl font-bold text-green-900">{stats.totalUsers}</div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <Users className="w-4 h-4 mr-1" />
              All users
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{stats.activeUsers}</div>
            <div className="flex items-center mt-2 text-sm text-blue-600">
              <Activity className="w-4 h-4 mr-1" />
              Last 30 days
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">New This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">{stats.newUsersThisMonth}</div>
            <div className="flex items-center mt-2 text-sm text-yellow-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              User growth
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Confirmed Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">
              {users.filter(u => u.email_confirmed_at).length}
            </div>
            <div className="flex items-center mt-2 text-sm text-purple-600">
              <Mail className="w-4 h-4 mr-1" />
              Email verified
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users List */}
      <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Recent Users</CardTitle>
              <CardDescription>Latest registered users ({filteredUsers.length} total)</CardDescription>
            </div>
            <Button onClick={goToUserManagement} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View All Users
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.slice(0, 10).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors group">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="rounded-full bg-gradient-to-br from-green-500 to-teal-500 p-2 text-white flex-shrink-0">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">{user.organization_name}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 flex-shrink-0">
                    <div className="text-right">
                      {user.email_confirmed_at ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <UserCheck className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Mail className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {getTimeSince(user.last_sign_in_at)}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={goToUserManagement}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendEmail(user)}>
                          <Send className="w-4 h-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                          <KeyRound className="w-4 h-4 mr-2" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setShowSuspendDialog(true);
                          }}
                          className="text-red-600"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Suspend User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

              {filteredUsers.length > 10 && (
                <Button onClick={goToUserManagement} variant="outline" className="w-full mt-4">
                  View All {filteredUsers.length} Users <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
              onClick={goToUserManagement}
            >
              <Users className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">All Users</span>
              <span className="text-xs text-gray-500">{stats.totalUsers} users</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col border-green-200 text-green-700 hover:bg-green-50"
              onClick={goToUserManagement}
            >
              <Shield className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Roles & Permissions</span>
              <span className="text-xs text-gray-500">Manage access</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col border-green-200 text-green-700 hover:bg-green-50"
              onClick={goToUserManagement}
            >
              <Ban className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Suspend Users</span>
              <span className="text-xs text-gray-500">Access control</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col border-green-200 text-green-700 hover:bg-green-50"
              onClick={goToUserManagement}
            >
              <Activity className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Activity Logs</span>
              <span className="text-xs text-gray-500">Audit trail</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suspend User Confirmation Dialog */}
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend this user? They will no longer be able to access the platform.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="py-4">
              <div className="rounded-lg bg-gray-50 p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Name:</span>
                  <span className="text-sm text-gray-900">{selectedUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Email:</span>
                  <span className="text-sm text-gray-900">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Organization:</span>
                  <span className="text-sm text-gray-900">{selectedUser.organization_name}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSuspendDialog(false);
                setSelectedUser(null);
              }}
              disabled={suspendingUser}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspendUser}
              disabled={suspendingUser}
            >
              {suspendingUser ? 'Suspending...' : 'Suspend User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
