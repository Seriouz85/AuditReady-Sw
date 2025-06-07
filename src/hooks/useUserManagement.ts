import { useState, useEffect } from 'react';
import { userManagementService, OrganizationUser, UserRole, UserInvitation, Organization } from '@/services/userManagementService';
import { toast } from '@/utils/toast';

export function useUserManagement() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user's organization
      const org = await userManagementService.getCurrentUserOrganization();
      if (!org) {
        setError('No organization found for current user');
        return;
      }
      setOrganization(org);

      // Load all data in parallel
      const [usersData, invitationsData, rolesData] = await Promise.all([
        userManagementService.getOrganizationUsers(org.id),
        userManagementService.getOrganizationInvitations(org.id),
        userManagementService.getUserRoles()
      ]);

      setUsers(usersData);
      setInvitations(invitationsData);
      setRoles(rolesData);
    } catch (err) {
      console.error('Error loading user management data:', err);
      setError('Failed to load user management data');
    } finally {
      setIsLoading(false);
    }
  };

  const inviteUser = async (params: {
    email: string;
    roleId: string;
    message?: string;
  }) => {
    if (!organization) {
      toast.error('No organization found');
      return false;
    }

    try {
      const result = await userManagementService.inviteUser({
        organizationId: organization.id,
        ...params
      });

      if (result.success) {
        toast.success(`Invitation sent to ${params.email}`);
        // Reload invitations to show the new one
        const invitationsData = await userManagementService.getOrganizationInvitations(organization.id);
        setInvitations(invitationsData);
        return true;
      } else {
        toast.error(result.error || 'Failed to send invitation');
        return false;
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error('Failed to send invitation');
      return false;
    }
  };

  const updateUserRole = async (userId: string, roleId: string) => {
    if (!organization) {
      toast.error('No organization found');
      return false;
    }

    try {
      const result = await userManagementService.updateUserRole({
        organizationId: organization.id,
        userId,
        roleId
      });

      if (result.success) {
        toast.success('User role updated successfully');
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.user_id === userId 
              ? { ...user, role_id: roleId, role: roles.find(r => r.id === roleId) }
              : user
          )
        );
        return true;
      } else {
        toast.error(result.error || 'Failed to update user role');
        return false;
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
      return false;
    }
  };

  const removeUser = async (userId: string) => {
    if (!organization) {
      toast.error('No organization found');
      return false;
    }

    try {
      const result = await userManagementService.removeUser({
        organizationId: organization.id,
        userId
      });

      if (result.success) {
        toast.success('User removed successfully');
        // Remove from local state
        setUsers(prevUsers => prevUsers.filter(user => user.user_id !== userId));
        return true;
      } else {
        toast.error(result.error || 'Failed to remove user');
        return false;
      }
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Failed to remove user');
      return false;
    }
  };

  const revokeInvitation = async (invitationId: string) => {
    try {
      const result = await userManagementService.revokeInvitation(invitationId);

      if (result.success) {
        toast.success('Invitation revoked successfully');
        // Remove from local state
        setInvitations(prevInvitations => 
          prevInvitations.filter(invitation => invitation.id !== invitationId)
        );
        return true;
      } else {
        toast.error(result.error || 'Failed to revoke invitation');
        return false;
      }
    } catch (error) {
      console.error('Error revoking invitation:', error);
      toast.error('Failed to revoke invitation');
      return false;
    }
  };

  const refreshData = () => {
    loadData();
  };

  return {
    // Data
    organization,
    users,
    invitations,
    roles,
    isLoading,
    error,

    // Actions
    inviteUser,
    updateUserRole,
    removeUser,
    revokeInvitation,
    refreshData,

    // Computed values
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    pendingInvitations: invitations.length,
    adminUsers: users.filter(u => u.role?.name === 'admin').length
  };
}

// Hook for checking user permissions
export function useUserPermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setIsLoading(true);
      
      // Get current user's organization and permissions
      const org = await userManagementService.getCurrentUserOrganization();
      if (!org) {
        setPermissions([]);
        return;
      }

      // Note: We'll need to get the current user ID
      // For now, we'll use mock permissions based on organization membership
      setPermissions(['read', 'write', 'user_management']); // Mock permissions
    } catch (error) {
      console.error('Error loading permissions:', error);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: string) => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]) => {
    return requiredPermissions.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (requiredPermissions: string[]) => {
    return requiredPermissions.every(permission => permissions.includes(permission));
  };

  return {
    permissions,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refreshPermissions: loadPermissions
  };
}