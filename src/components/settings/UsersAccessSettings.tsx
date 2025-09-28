import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/utils/toast";
import { 
  UserPlus, Edit, Trash2, Eye, CheckCircle, XCircle, 
  Clock, Loader 
} from "lucide-react";

interface UsersAccessSettingsProps {
  displayUsers: any[];
  displayRoles: any[];
  isDemo: boolean;
  isLoading: boolean;
  localLoading: boolean;
  inviteForm: {
    email: string;
    role: string;
    message: string;
  };
  isInviteDialogOpen: boolean;
  setIsInviteDialogOpen: (open: boolean) => void;
  setInviteForm: (form: any) => void;
  handleInviteUser: () => void;
  handleRevokeUser: (userId: string) => void;
  getStatusBadge: (status: string) => JSX.Element;
  getRoleDisplayName: (roleId: string) => string;
  getUserDisplayName: (user: any) => string;
  getUserEmail: (user: any) => string;
  getUserLastLogin: (user: any) => string;
  getUserJoinedAt: (user: any) => string;
  formatDateWithTime: (dateString: string | null) => string;
}

export const UsersAccessSettings = ({
  displayUsers,
  displayRoles,
  isDemo,
  isLoading,
  localLoading,
  inviteForm,
  isInviteDialogOpen,
  setIsInviteDialogOpen,
  setInviteForm,
  handleInviteUser,
  handleRevokeUser,
  getStatusBadge,
  getRoleDisplayName,
  getUserDisplayName,
  getUserEmail,
  getUserLastLogin,
  getUserJoinedAt,
  formatDateWithTime
}: UsersAccessSettingsProps) => {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Manage user access and permissions for your organization
            </CardDescription>
          </div>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="user@company.com"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="invite-role">Role</Label>
                  <Select value={inviteForm.role} onValueChange={(value) => setInviteForm({...inviteForm, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {displayRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div>
                            <div className="font-medium">{role.name}</div>
                            <div className="text-sm text-muted-foreground">{role.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="invite-message">Personal Message (Optional)</Label>
                  <Textarea
                    id="invite-message"
                    placeholder="Welcome to the team!"
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm({...inviteForm, message: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInviteUser} disabled={localLoading || isDemo}>
                  {localLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  {isDemo ? 'Not Available in Demo' : 'Send Invitation'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading && !isDemo ? (
              <div className="flex items-center justify-center p-8">
                <Loader className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading users...</span>
              </div>
            ) : displayUsers.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                No team members found. Invite your first team member to get started.
              </div>
            ) : (
              displayUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${getUserDisplayName(user)}`} />
                    <AvatarFallback>
                      {getUserDisplayName(user).split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{getUserDisplayName(user)}</div>
                    <div className="text-sm text-muted-foreground">{getUserEmail(user)}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusBadge(user.status)}
                      <Badge variant="outline">{getRoleDisplayName(user.role)}</Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    Last login: {formatDateWithTime(getUserLastLogin(user))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Joined: {formatDateWithTime(getUserJoinedAt(user))}
                  </div>
                  <div className="flex space-x-2 mt-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => {
                      toast.info(`Edit user profile for ${getUserDisplayName(user)}. This would open user management interface.`);
                      // In production, this would open user editing modal
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke Access</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to revoke access for {getUserEmail(user)}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRevokeUser(user.id)} className="bg-red-600 hover:bg-red-700">
                            Revoke Access
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>
            Configure roles and permissions for your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayRoles.map((role) => (
              <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{role.name}</div>
                  <div className="text-sm text-muted-foreground">{role.description}</div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    toast.info(`${role.name} permissions: Can view dashboards, assessments, and requirements. Advanced permissions available in enterprise plan.`);
                    // In production, this would show detailed permission matrix
                  }}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Permissions
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    toast.info(`Edit permissions for ${role.name} role. Contact support for custom role configuration.`);
                    // In production, this would open role editing interface
                  }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};