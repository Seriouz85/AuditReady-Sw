import React, { useState, useEffect } from 'react';
import { adminService } from '@/services/admin/AdminService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConfirmDialog, ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Label } from '@/components/ui/label';
import {
  User,
  Mail,
  Shield,
  Clock,
  MapPin,
  Smartphone,
  KeyRound,
  Trash2,
  Send,
  Building2,
  Activity,
  CheckCircle2,
  XCircle,
  Ban,
} from 'lucide-react';
import { toast } from '@/utils/toast';

interface UserDetailsModalProps {
  user: {
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at?: string;
    email_confirmed_at?: string;
    raw_user_meta_data?: any;
    organization_memberships?: any[];
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated?: () => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user: initialUser,
  open,
  onOpenChange,
  onUserUpdated,
}) => {
  const { confirm, dialogProps } = useConfirmDialog();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(initialUser);
  const [mfaFactors, setMfaFactors] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);

  useEffect(() => {
    if (initialUser && open) {
      loadUserData();
    }
  }, [initialUser, open]);

  const loadUserData = async () => {
    if (!initialUser) return;

    setLoading(true);
    try {
      // Fetch COMPLETE user details from Edge Function (real data, no mocks)
      const completeUserDetails = await adminService.getUserDetails(initialUser.id);
      setUser(completeUserDetails);

      // Load MFA factors
      const factors = await adminService.getUserMFAFactors(initialUser.id);
      setMfaFactors(factors);

      // Load activity log
      const activity = await adminService.getUserActivityLog(initialUser.id);
      setActivityLog(activity);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
      // Fallback to initial user data if fetch fails
      setUser(initialUser);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReset = () => {
    if (!user) return;

    confirm({
      title: 'Send Password Reset Email?',
      description: `Send a password reset link to ${user.email}?`,
      variant: 'default',
      confirmText: 'Send Reset Email',
      onConfirm: async () => {
        try {
          await adminService.sendPasswordReset(user.email);
          toast.success(`Password reset email sent to ${user.email}`);
          await loadUserData();
        } catch (error) {
          console.error('Error sending password reset:', error);
          toast.error('Failed to send password reset email');
        }
      },
    });
  };

  const handleRemoveMFAFactor = (factorId: string, factorName: string) => {
    if (!user) return;

    confirm({
      title: 'Remove MFA Device?',
      description: `Remove the MFA device "${factorName}"? The user will need to set up MFA again.`,
      variant: 'destructive',
      confirmText: 'Remove Device',
      onConfirm: async () => {
        try {
          await adminService.removeMFAFactor(user.id, factorId);
          toast.success('MFA device removed successfully');
          await loadUserData();
        } catch (error) {
          console.error('Error removing MFA factor:', error);
          toast.error('Failed to remove MFA device');
        }
      },
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) return null;

  const userName = user.raw_user_meta_data?.name || user.email.split('@')[0];
  const isEmailVerified = !!user.email_confirmed_at;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="w-6 h-6" />
              <span>User Details - {userName}</span>
            </DialogTitle>
            <DialogDescription>
              Complete information and management tools for this user account (Real data from database)
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading real user data...</span>
            </div>
          ) : (
            <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="security">Security & MFA</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-4">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Name</Label>
                      <p className="font-medium">{userName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Email</Label>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{user.email}</p>
                        {isEmailVerified ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Created</Label>
                      <p className="font-medium">{formatDate(user.created_at)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Last Sign In</Label>
                      <p className="font-medium">{formatDate(user.last_sign_in_at)}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Label className="text-muted-foreground text-xs mb-2 block">Status</Label>
                    <div className="flex items-center space-x-2">
                      <Badge variant={isEmailVerified ? 'default' : 'destructive'}>
                        {isEmailVerified ? 'Email Verified' : 'Email Not Verified'}
                      </Badge>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Organizations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    Organizations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.organization_memberships && user.organization_memberships.length > 0 ? (
                    <div className="space-y-2">
                      {user.organization_memberships.map((org: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{org.organization?.name || 'Unknown Organization'}</p>
                            <p className="text-sm text-muted-foreground">{org.organization?.slug || ''}</p>
                          </div>
                          <Badge variant="outline">{org.organization?.subscription_tier || 'Free'}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not a member of any organization</p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleSendPasswordReset}>
                    <KeyRound className="w-4 h-4 mr-2" />
                    Send Password Reset
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = `mailto:${user.email}`}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => toast.info('Suspend functionality coming soon')}>
                    <Ban className="w-4 h-4 mr-2" />
                    Suspend Account
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SECURITY & MFA TAB */}
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Multi-Factor Authentication
                    </div>
                    <Badge variant={mfaFactors.length > 0 ? 'default' : 'outline'}>
                      {mfaFactors.length > 0 ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Manage MFA devices for this user account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {mfaFactors.length > 0 ? (
                    <div className="space-y-2">
                      {mfaFactors.map((factor) => (
                        <div key={factor.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Smartphone className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{factor.friendly_name || 'Unnamed Device'}</p>
                              <p className="text-xs text-muted-foreground">
                                Type: {factor.factor_type} • Added: {formatDate(factor.created_at)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMFAFactor(factor.id, factor.friendly_name)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No MFA devices configured</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <KeyRound className="w-4 h-4 mr-2" />
                    Password Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Last Password Change</Label>
                    <p className="font-medium">Unknown</p>
                  </div>
                  <Button variant="outline" onClick={handleSendPasswordReset}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Password Reset Email
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ACTIVITY LOG TAB */}
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Activity className="w-4 h-4 mr-2" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Login history and account changes</CardDescription>
                </CardHeader>
                <CardContent>
                  {activityLog.length > 0 ? (
                    <div className="space-y-2">
                      {activityLog.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium capitalize">{activity.activity_type.replace('_', ' ')}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(activity.created_at)}
                                {activity.ip_address && ` • IP: ${activity.ip_address}`}
                              </p>
                            </div>
                          </div>
                          {activity.success ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No activity log available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog {...dialogProps} />
    </>
  );
};
