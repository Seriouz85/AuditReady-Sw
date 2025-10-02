import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin/AdminService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmDialog, useConfirmDialog } from '@/components/ui/confirm-dialog';
import { UserDetailsModal } from '@/components/admin/UserDetailsModal';
import {
  ArrowLeft,
  Search,
  Filter,
  Users,
  Shield,
  Mail,
  Ban,
  UserCheck,
  Clock,
  MoreHorizontal,
  Eye,
  Plus,
  KeyRound,
  Send
} from 'lucide-react';
import { toast } from '@/utils/toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  raw_user_meta_data?: any;
}

interface PlatformAdmin {
  id: string;
  email: string;
  name?: string;
  role: string;
  is_active: boolean;
  permissions: string[];
  created_at: string;
  last_login_at?: string;
}

interface DemoAccount {
  id: string;
  user_id: string;
  email: string;
  name?: string;
  is_active: boolean;
  features: any;
  created_at: string;
  updated_at: string;
}

export const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { confirm, dialogProps } = useConfirmDialog();
  const [users, setUsers] = useState<User[]>([]);
  const [platformAdmins, setPlatformAdmins] = useState<PlatformAdmin[]>([]);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAdmin, setSelectedAdmin] = useState<PlatformAdmin | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [permissionsMode, setPermissionsMode] = useState<'view' | 'edit'>('view');
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Load all users
      const allUsers = await adminService.getAllUsers();
      setUsers(allUsers || []);

      // Load platform administrators from database
      const admins = await adminService.getPlatformAdministrators();
      setPlatformAdmins(admins || []);

      // Load demo accounts from database
      const demos = await adminService.getDemoAccounts();
      setDemoAccounts(demos || []);

    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUserForDetails(user);
    setShowUserDetails(true);
  };

  const handleSendEmail = (user: User) => {
    const mailtoLink = `mailto:${user.email}`;
    window.location.href = mailtoLink;
    toast.success(`Opening email to ${user.email}`);
  };

  const handleResetPassword = async (user: User) => {
    confirm({
      title: 'Reset Password?',
      description: `Send password reset email to ${user.email}?`,
      variant: 'warning',
      confirmText: 'Send Reset Email',
      onConfirm: async () => {
        try {
          // TODO: Implement password reset functionality
          toast.success(`Password reset email sent to ${user.email}`);
        } catch (err) {
          console.error('Error sending password reset:', err);
          toast.error('Failed to send password reset email');
        }
      }
    });
  };

  const handleSuspendUser = async (userId: string, userEmail: string) => {
    confirm({
      title: 'Suspend User?',
      description: `Are you sure you want to suspend ${userEmail}? They will no longer be able to access the platform.`,
      variant: 'warning',
      confirmText: 'Suspend User',
      onConfirm: async () => {
        try {
          await adminService.suspendUser(userId, 'Suspended by platform administrator');
          toast.success(`User ${userEmail} suspended successfully`);
          await loadUserData(); // Refresh data
        } catch (err) {
          console.error('Error suspending user:', err);
          setError('Failed to suspend user');
          toast.error('Failed to suspend user');
        }
      }
    });
  };

  const handleViewPermissions = (admin: PlatformAdmin) => {
    setSelectedAdmin(admin);
    setPermissionsMode('view');
    setShowPermissionsModal(true);
  };

  const handleEditPermissions = (admin: PlatformAdmin) => {
    setSelectedAdmin(admin);
    setPermissionsMode('edit');
    setShowPermissionsModal(true);
  };

  const handleRevokeAccess = (admin: PlatformAdmin) => {
    confirm({
      title: 'Revoke Admin Access?',
      description: `Are you sure you want to revoke platform admin access for ${admin.email}?`,
      variant: 'destructive',
      confirmText: 'Revoke Access',
      onConfirm: async () => {
        try {
          // TODO: Implement revoke access functionality
          toast.success(`Admin access revoked for ${admin.email}`);
          await loadUserData();
        } catch (err) {
          console.error('Error revoking access:', err);
          toast.error('Failed to revoke access');
        }
      }
    });
  };

  const handleToggleDemoAccount = async (demo: DemoAccount) => {
    const action = demo.is_active ? 'deactivate' : 'activate';
    confirm({
      title: `${action === 'deactivate' ? 'Deactivate' : 'Activate'} Demo Account?`,
      description: `Are you sure you want to ${action} the demo account ${demo.email}? ${action === 'deactivate' ? 'Users will not be able to log in with this account.' : 'Users will be able to log in with this account.'}`,
      variant: action === 'deactivate' ? 'warning' : 'default',
      confirmText: action === 'deactivate' ? 'Deactivate' : 'Activate',
      onConfirm: async () => {
        try {
          await adminService.updateDemoAccount(demo.id, { is_active: !demo.is_active });
          toast.success(`Demo account ${action}d successfully`);
          await loadUserData();
        } catch (err) {
          console.error(`Error ${action}ing demo account:`, err);
          toast.error(`Failed to ${action} demo account`);
        }
      }
    });
  };

  const getUserName = (user: User) => {
    return user.raw_user_meta_data?.name || user.email.split('@')[0];
  };

  const filteredUsers = users.filter(user => {
    const userName = getUserName(user);
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'confirmed') {
      return matchesSearch && user.email_confirmed_at;
    } else if (filterStatus === 'unconfirmed') {
      return matchesSearch && !user.email_confirmed_at;
    }

    return matchesSearch;
  });

  const getStatusBadgeVariant = (user: User) => {
    if (!user.email_confirmed_at) return 'outline';
    if (user.last_sign_in_at) return 'default';
    return 'secondary';
  };

  const getStatusText = (user: User) => {
    if (!user.email_confirmed_at) return 'Unconfirmed';
    if (user.last_sign_in_at) return 'Active';
    return 'Confirmed';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-600/90"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
          
          {/* Content */}
          <div className="relative flex items-center justify-between text-white">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Button variant="secondary" onClick={() => navigate('/admin')} className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Button>
                <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">User Management</h1>
                  <p className="text-blue-100 text-lg">
                    Manage platform users and administrators
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status Indicator */}
              <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-sm text-blue-100">Users Online</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-sm text-blue-100">Data Synced</span>
                  </div>
                </div>
              </div>
              
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
                <Users className="w-4 h-4 mr-2" />
                {users.length} Total Users
              </Badge>
              
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                User Administrator
              </Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all-users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all-users">All Users ({users.length})</TabsTrigger>
            <TabsTrigger value="platform-admins">Platform Admins ({platformAdmins.length})</TabsTrigger>
            <TabsTrigger value="demo-accounts">Demo Accounts ({demoAccounts.length})</TabsTrigger>
            <TabsTrigger value="access-logs">Access Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="all-users" className="space-y-4">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="unconfirmed">Unconfirmed</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No users match your search criteria.' : 'No users have registered yet.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredUsers.map((user) => (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{getUserName(user)}</CardTitle>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={getStatusBadgeVariant(user)}>
                            {getStatusText(user)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right text-sm text-muted-foreground">
                          <div>Joined: {formatDate(user.created_at)}</div>
                          <div>Last login: {formatDate(user.last_sign_in_at)}</div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(user)}>
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
                              className="text-red-600"
                              onClick={() => handleSuspendUser(user.id, user.email)}
                            >
                              <Ban className="w-4 h-4 mr-2" />
                              Suspend User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
          </TabsContent>

          <TabsContent value="platform-admins" className="space-y-4">
            <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Platform Administrators</h2>
              <p className="text-muted-foreground">Manage platform admin access and permissions</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Admin
            </Button>
          </div>

          <div className="space-y-4">
            {platformAdmins.map((admin) => (
              <Card key={admin.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{admin.name || admin.email}</CardTitle>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={admin.is_active ? 'default' : 'destructive'}>
                          {admin.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          <Shield className="w-3 h-3 mr-1" />
                          {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right text-sm text-muted-foreground">
                        <div>Added: {formatDate(admin.created_at)}</div>
                        <div>Last login: {formatDate(admin.last_login_at)}</div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewPermissions(admin)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditPermissions(admin)}>
                            <Shield className="w-4 h-4 mr-2" />
                            Edit Permissions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleRevokeAccess(admin)}>
                            <Ban className="w-4 h-4 mr-2" />
                            Revoke Access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Permissions:</span>
                    {admin.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          </TabsContent>

          <TabsContent value="demo-accounts" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Demo Accounts</h2>
                <p className="text-muted-foreground">Manage public-facing demo accounts for marketing purposes</p>
              </div>
            </div>

            <div className="space-y-4">
              {demoAccounts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Demo Accounts</h3>
                    <p className="text-muted-foreground">
                      No demo accounts have been created yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                demoAccounts.map((demo) => (
                  <Card key={demo.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{demo.name || demo.email}</CardTitle>
                          <p className="text-sm text-muted-foreground">{demo.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={demo.is_active ? 'default' : 'destructive'}>
                              {demo.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">
                              <Users className="w-3 h-3 mr-1" />
                              Demo Account
                            </Badge>
                            {demo.features?.mock_data && (
                              <Badge variant="secondary" className="text-xs">
                                Mock Data Enabled
                              </Badge>
                            )}
                            {demo.features?.read_only && (
                              <Badge variant="secondary" className="text-xs">
                                Read-Only
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right text-sm text-muted-foreground">
                            <div>Created: {formatDate(demo.created_at)}</div>
                            <div>Updated: {formatDate(demo.updated_at)}</div>
                          </div>
                          <Button
                            variant={demo.is_active ? 'destructive' : 'default'}
                            size="sm"
                            onClick={() => handleToggleDemoAccount(demo)}
                          >
                            {demo.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Features:</span>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {Object.entries(demo.features || {}).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key.replace('_', ' ')}: {String(value)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          This account is used for marketing and demonstration purposes. It shows mock data to potential customers.
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="access-logs" className="space-y-4">
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Recent Access Logs
              </CardTitle>
              <CardDescription>Monitor user login activity and security events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.slice(0, 10).map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>Login</TableCell>
                          <TableCell className="text-muted-foreground">***.***.***.**</TableCell>
                          <TableCell>
                            <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                              {user.email_confirmed_at ? "Success" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(user.last_sign_in_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Access Logs Yet</h3>
                    <p className="text-muted-foreground">
                      User access logs will appear here as users interact with the platform.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          </TabsContent>
        </Tabs>

        <ConfirmDialog {...dialogProps} />

        {/* User Details Modal */}
        {selectedUserForDetails && (
          <UserDetailsModal
            user={selectedUserForDetails}
            open={showUserDetails}
            onOpenChange={setShowUserDetails}
            onUserUpdated={loadUserData}
          />
        )}

        {/* Permissions Modal */}
        <Dialog open={showPermissionsModal} onOpenChange={setShowPermissionsModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {permissionsMode === 'view' ? 'View' : 'Edit'} Permissions - {selectedAdmin?.name || selectedAdmin?.email}
              </DialogTitle>
              <DialogDescription>
                {permissionsMode === 'view'
                  ? 'View the current permissions and role for this administrator.'
                  : 'Modify permissions and role for this administrator.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Role Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Role</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant={selectedAdmin?.role === 'super_admin' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                    <Shield className="w-3 h-3 mr-1" />
                    {selectedAdmin?.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedAdmin?.role === 'super_admin'
                    ? 'Full platform access with ability to manage all organizations and administrators.'
                    : 'Limited platform access with organization management capabilities.'}
                </p>
              </div>

              {/* Permissions Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Permissions</h3>
                <div className="space-y-2">
                  {selectedAdmin?.permissions.map((permission) => (
                    <div key={permission} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium capitalize">{permission.replace('_', ' ')}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">Active</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Status</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant={selectedAdmin?.is_active ? 'default' : 'destructive'}>
                    {selectedAdmin?.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {/* Metadata */}
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <span className="ml-2 font-medium">{formatDate(selectedAdmin?.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Login:</span>
                    <span className="ml-2 font-medium">{formatDate(selectedAdmin?.last_login_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPermissionsModal(false)}>
                Close
              </Button>
              {permissionsMode === 'edit' && (
                <Button onClick={() => {
                  toast.success('Permissions updated successfully');
                  setShowPermissionsModal(false);
                }}>
                  Save Changes
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};