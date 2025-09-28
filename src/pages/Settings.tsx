import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/utils/toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useProfile } from "@/hooks/useProfile";
import { RequirementAssignmentModal } from "@/components/settings/RequirementAssignmentModal";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useEntraId } from "@/hooks/useEntraId";
import { DataClassificationSettings } from "@/components/settings/DataClassificationSettings";
import { CustomerDashboardSettings } from "@/components/dashboard/CustomerDashboardSettings";

// Import extracted components
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { OrganizationSettings } from "@/components/settings/OrganizationSettings";
import { UsersAccessSettings } from "@/components/settings/UsersAccessSettings";
import { AssignmentSettings } from "@/components/settings/AssignmentSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { IntegrationSettings } from "@/components/settings/IntegrationSettings";
import { ImportExportSettings } from "@/components/settings/ImportExportSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { RequirementAssignmentInterface } from "@/components/settings/RequirementAssignmentInterface";

// Demo data for demo accounts only
const demoUsers = [
  {
    id: 'demo-user-1',
    email: 'admin@democorp.com',
    name: 'Demo Admin',
    role: 'admin',
    status: 'active',
    lastLogin: '2025-01-06T10:30:00Z',
    invitedBy: null,
    joinedAt: '2024-12-01T09:00:00Z'
  },
  {
    id: 'demo-user-2', 
    email: 'ciso@democorp.com',
    name: 'Demo CISO',
    role: 'ciso',
    status: 'active',
    lastLogin: '2025-01-05T16:45:00Z',
    invitedBy: 'demo-user-1',
    joinedAt: '2024-12-15T14:20:00Z'
  },
  {
    id: 'demo-user-3',
    email: 'analyst@democorp.com', 
    name: 'Demo Analyst',
    role: 'analyst',
    status: 'invited',
    lastLogin: null,
    invitedBy: 'demo-user-2',
    joinedAt: null
  }
];

const Settings = () => {
  const { user, organization, isDemo, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    users,
    roles,
    invitations,
    isLoading,
    error,
    inviteUser,
    revokeUserAccess,
    updateUserRole,
    refreshData
  } = useUserManagement();
  
  const {
    profile,
    loading: profileLoading,
    updating: profileUpdating,
    updateProfile,
    updatePassword,
    updateProfilePicture,
    updateTwoFactorAuth
  } = useProfile();

  const {
    connections,
    loading: entraLoading,
    error: entraError
  } = useEntraId();
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: '', message: '' });
  const [localLoading, setLocalLoading] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  
  // Use demo data for demo accounts, real data for production accounts
  const displayUsers = isDemo ? demoUsers : users;
  const displayRoles = isDemo ? [
    { id: 'admin', name: 'Administrator', description: 'Full system access' },
    { id: 'ciso', name: 'CISO/Security Officer', description: 'Security oversight' },
    { id: 'manager', name: 'Manager', description: 'Team management' },
    { id: 'analyst', name: 'Security Analyst', description: 'Analysis and assessments' },
    { id: 'auditor', name: 'Auditor', description: 'Read-only audit access' },
    { id: 'viewer', name: 'Viewer', description: 'Read-only access' }
  ] : roles;
  
  // Load data on component mount for real accounts
  useEffect(() => {
    if (!isDemo && organization) {
      refreshData();
    }
  }, [organization, isDemo, refreshData]);
  
  const handleSave = () => {
    toast.success("Settings saved successfully");
  };
  
  const handleInviteUser = async () => {
    if (!inviteForm.email || !inviteForm.role) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (isDemo) {
      toast.info("User invitations are not available in demo mode");
      return;
    }
    
    if (!hasPermission('user_management')) {
      toast.error("You don't have permission to invite users");
      return;
    }
    
    setLocalLoading(true);
    try {
      await inviteUser({
        email: inviteForm.email,
        roleId: inviteForm.role,
        message: inviteForm.message
      });
      
      setInviteForm({ email: '', role: '', message: '' });
      setIsInviteDialogOpen(false);
      toast.success(`Invitation sent to ${inviteForm.email}`);
    } catch (error) {
      console.error('Failed to invite user:', error);
      toast.error("Failed to send invitation");
    } finally {
      setLocalLoading(false);
    }
  };
  
  const handleRevokeUser = async (userId: string) => {
    if (isDemo) {
      toast.info("User access management is not available in demo mode");
      return;
    }
    
    if (!hasPermission('user_management')) {
      toast.error("You don't have permission to revoke user access");
      return;
    }
    
    try {
      await revokeUserAccess(userId);
      toast.success("User access revoked");
    } catch (error) {
      console.error('Failed to revoke user access:', error);
      toast.error("Failed to revoke user access");
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'invited':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Invited</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="h-3 w-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  const getRoleDisplayName = (roleId: string | any) => {
    if (typeof roleId === 'object' && roleId?.name) {
      return roleId.name;
    }
    return displayRoles.find(role => role.id === roleId)?.name || roleId;
  };

  const getUserDisplayName = (user: any) => {
    if (isDemo) {
      return user.name || user.email;
    }
    // For real OrganizationUser type
    return user.user?.raw_user_meta_data?.full_name || 
           user.user?.raw_user_meta_data?.first_name || 
           user.user?.email?.split('@')[0] || 
           'Unknown User';
  };

  const getUserEmail = (user: any) => {
    if (isDemo) {
      return user.email;
    }
    // For real OrganizationUser type
    return user.user?.email || '';
  };

  const getUserLastLogin = (user: any) => {
    if (isDemo) {
      return user.lastLogin;
    }
    // For real OrganizationUser type
    return user.last_login_at;
  };

  const getUserJoinedAt = (user: any) => {
    if (isDemo) {
      return user.joinedAt;
    }
    // For real OrganizationUser type
    return user.joined_at;
  };
  
  const formatDateWithTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-2 -mx-2 px-2">
          <TabsList className="grid w-max grid-cols-10 gap-1 p-1 h-auto bg-muted/50">
            <TabsTrigger value="profile" className="text-xs px-2 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">Profile</TabsTrigger>
            <TabsTrigger value="organization" className="text-xs px-2 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">Organization</TabsTrigger>
            <TabsTrigger value="users" className="text-xs px-2 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">Users & Access</TabsTrigger>
            <TabsTrigger value="assignments" className="text-xs px-2 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">Assignments</TabsTrigger>
            <TabsTrigger value="security" className="text-xs px-2 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">Security</TabsTrigger>
            <TabsTrigger value="dashboard" className="text-xs px-2 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">Dashboard</TabsTrigger>
            <TabsTrigger value="classification" className="text-xs px-2 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">Data Classification</TabsTrigger>
            <TabsTrigger value="integrations" className="text-xs px-2 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">Integrations</TabsTrigger>
            <TabsTrigger value="importing" className="text-xs px-2 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">Import/Export</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs px-2 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">Notifications</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="space-y-6 mt-6">
          <ProfileSettings
            profile={profile}
            isDemo={isDemo}
            profileUpdating={profileUpdating}
            updateProfile={updateProfile}
            updateProfilePicture={updateProfilePicture}
            updateTwoFactorAuth={updateTwoFactorAuth}
            updatePassword={updatePassword}
          />
        </TabsContent>
        
        <TabsContent value="organization" className="space-y-6 mt-6">
          <OrganizationSettings
            organization={organization}
            user={user}
            isDemo={isDemo}
            handleSave={handleSave}
          />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6 mt-6">
          <UsersAccessSettings
            displayUsers={displayUsers}
            displayRoles={displayRoles}
            isDemo={isDemo}
            isLoading={isLoading}
            localLoading={localLoading}
            inviteForm={inviteForm}
            isInviteDialogOpen={isInviteDialogOpen}
            setIsInviteDialogOpen={setIsInviteDialogOpen}
            setInviteForm={setInviteForm}
            handleInviteUser={handleInviteUser}
            handleRevokeUser={handleRevokeUser}
            getStatusBadge={getStatusBadge}
            getRoleDisplayName={getRoleDisplayName}
            getUserDisplayName={getUserDisplayName}
            getUserEmail={getUserEmail}
            getUserLastLogin={getUserLastLogin}
            getUserJoinedAt={getUserJoinedAt}
            formatDateWithTime={formatDateWithTime}
          />
        </TabsContent>

        <TabsContent value="security" className="space-y-6 mt-6">
          <SecuritySettings isDemo={isDemo} />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6 mt-6">
          <AssignmentSettings
            displayUsers={displayUsers}
            isDemo={isDemo}
            RequirementAssignmentInterface={RequirementAssignmentInterface}
          />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6 mt-6">
          <CustomerDashboardSettings organizationId={organization?.id || 'demo-org'} />
        </TabsContent>

        <TabsContent value="classification" className="space-y-6 mt-6">
          <DataClassificationSettings organizationId={organization?.id || 'demo-org'} />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6 mt-6">
          <IntegrationSettings
            isDemo={isDemo}
            connections={connections}
            organization={organization}
          />
        </TabsContent>
        
        <TabsContent value="importing" className="space-y-6 mt-6">
          <ImportExportSettings />
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <NotificationSettings handleSave={handleSave} />
        </TabsContent>
      </Tabs>

      {/* Assignment Modal */}
      <RequirementAssignmentModal
        open={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        users={displayUsers}
        onAssign={(requirementIds, userId) => {
          toast.success(`Assigned ${requirementIds.length} requirements successfully`);
          setIsAssignmentModalOpen(false);
        }}
      />
    </div>
  );
};

export default Settings;