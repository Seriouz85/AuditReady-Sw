import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/utils/toast';
import { rbacService, Role, Permission } from '@/services/rbac/RBACService';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, Edit, Trash2, Shield, Users, Settings, 
  Check, X, Copy, Crown, Lock, Unlock 
} from 'lucide-react';

interface RoleManagementProps {
  onRoleChange?: () => void;
}

export const RoleManagement: React.FC<RoleManagementProps> = ({ onRoleChange }) => {
  const { organization, isDemo } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionCategories, setPermissionCategories] = useState<Array<{ name: string; permissions: Permission[] }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, [organization]);

  const loadData = async () => {
    if (!organization) return;

    try {
      setLoading(true);
      const [rolesData, permissionsData] = await Promise.all([
        rbacService.getOrganizationRoles(organization.id),
        rbacService.getPermissions()
      ]);

      setRoles(rolesData);
      setPermissions(permissionsData);
      setPermissionCategories(rbacService.getPermissionCategories());
    } catch (error) {
      console.error('Error loading RBAC data:', error);
      toast.error('Failed to load roles and permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!organization) return;

    if (!createForm.name || !createForm.displayName) {
      toast.error('Please fill in required fields');
      return;
    }

    if (isDemo) {
      toast.info('Role creation is not available in demo mode');
      return;
    }

    try {
      const result = await rbacService.createRole({
        organizationId: organization.id,
        name: createForm.name.toLowerCase().replace(/\s+/g, '_'),
        displayName: createForm.displayName,
        description: createForm.description,
        permissions: createForm.permissions
      });

      if (result.success) {
        toast.success('Role created successfully');
        setIsCreateDialogOpen(false);
        setCreateForm({ name: '', displayName: '', description: '', permissions: [] });
        await loadData();
        onRoleChange?.();
      } else {
        toast.error(result.error || 'Failed to create role');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Failed to create role');
    }
  };

  const handleUpdatePermissions = async (role: Role, newPermissions: string[]) => {
    if (isDemo) {
      toast.info('Permission updates are not available in demo mode');
      return;
    }

    try {
      const result = await rbacService.updateRolePermissions(role.id, newPermissions);
      
      if (result.success) {
        toast.success('Permissions updated successfully');
        await loadData();
        onRoleChange?.();
      } else {
        toast.error(result.error || 'Failed to update permissions');
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('Failed to update permissions');
    }
  };

  const handleCloneRole = (role: Role) => {
    setCreateForm({
      name: `${role.name}_copy`,
      displayName: `${role.display_name} (Copy)`,
      description: `Copy of ${role.description}`,
      permissions: role.permissions.map(p => p.name)
    });
    setIsCreateDialogOpen(true);
  };

  const getPermissionsByCategory = (categoryName: string) => {
    return permissionCategories.find(cat => cat.name === categoryName)?.permissions || [];
  };

  const getRolePermissionCount = (role: Role) => {
    return role.permissions.length;
  };

  const getRoleUserCount = (role: Role) => {
    // This would typically come from a separate API call
    // For demo purposes, return mock data
    const mockCounts: Record<string, number> = {
      admin: 2,
      ciso: 1,
      manager: 3,
      analyst: 8,
      editor: 5,
      viewer: 12
    };
    return mockCounts[role.name] || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading roles and permissions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isDemo && (
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Demo Mode: Role management features are read-only. In production, you can create custom roles and modify permissions.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Role Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage user roles and permissions for your organization
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={isDemo}>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a custom role with specific permissions for your organization
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role-name">Role Name *</Label>
                  <Input
                    id="role-name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="e.g., auditor"
                  />
                </div>
                <div>
                  <Label htmlFor="role-display-name">Display Name *</Label>
                  <Input
                    id="role-display-name"
                    value={createForm.displayName}
                    onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
                    placeholder="e.g., External Auditor"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role-description">Description</Label>
                <Textarea
                  id="role-description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Describe the role's purpose and responsibilities"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Permissions</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Select the permissions this role should have
                </p>
                
                <Tabs defaultValue={permissionCategories[0]?.name} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 h-auto">
                    {permissionCategories.slice(0, 4).map((category) => (
                      <TabsTrigger 
                        key={category.name} 
                        value={category.name}
                        className="text-xs py-2"
                      >
                        {category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {permissionCategories.map((category) => (
                    <TabsContent key={category.name} value={category.name} className="mt-4">
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                        {category.permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={createForm.permissions.includes(permission.name)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setCreateForm({
                                    ...createForm,
                                    permissions: [...createForm.permissions, permission.name]
                                  });
                                } else {
                                  setCreateForm({
                                    ...createForm,
                                    permissions: createForm.permissions.filter(p => p !== permission.name)
                                  });
                                }
                              }}
                            />
                            <Label htmlFor={permission.id} className="text-xs">
                              {permission.description}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRole}>
                Create Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    {role.is_system_role ? (
                      <Crown className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Shield className="h-4 w-4 text-blue-500" />
                    )}
                    <CardTitle className="text-base">{role.display_name}</CardTitle>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCloneRole(role)}
                    disabled={isDemo}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedRole(role);
                      setIsEditDialogOpen(true);
                    }}
                    disabled={role.is_system_role || isDemo}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={role.is_system_role ? "default" : "secondary"}>
                  {role.is_system_role ? "System Role" : "Custom Role"}
                </Badge>
                <Badge variant="outline">
                  <Users className="h-3 w-3 mr-1" />
                  {getRoleUserCount(role)} users
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <CardDescription className="text-xs mb-3">
                {role.description}
              </CardDescription>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Permissions</span>
                  <span className="font-medium">{getRolePermissionCount(role)}</span>
                </div>
                
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {role.permissions.slice(0, 6).map((permission) => (
                    <Badge key={permission.id} variant="outline" className="text-xs py-0">
                      {permission.category}
                    </Badge>
                  ))}
                  {role.permissions.length > 6 && (
                    <Badge variant="outline" className="text-xs py-0">
                      +{role.permissions.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Role: {selectedRole?.display_name}</DialogTitle>
            <DialogDescription>
              Modify permissions for this role
            </DialogDescription>
          </DialogHeader>

          {selectedRole && (
            <div className="space-y-4 overflow-y-auto max-h-[60vh]">
              <Tabs defaultValue={permissionCategories[0]?.name} className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-auto">
                  {permissionCategories.slice(0, 4).map((category) => (
                    <TabsTrigger 
                      key={category.name} 
                      value={category.name}
                      className="text-xs py-2"
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {permissionCategories.map((category) => (
                  <TabsContent key={category.name} value={category.name} className="mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{category.name} Permissions</h4>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const categoryPermissions = getPermissionsByCategory(category.name);
                              const newPermissions = [
                                ...selectedRole.permissions.filter(p => p.category !== category.name),
                                ...categoryPermissions
                              ];
                              handleUpdatePermissions(selectedRole, newPermissions.map(p => p.name));
                            }}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Select All
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newPermissions = selectedRole.permissions.filter(p => p.category !== category.name);
                              handleUpdatePermissions(selectedRole, newPermissions.map(p => p.name));
                            }}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Deselect All
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-3">
                        {getPermissionsByCategory(category.name).map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-${permission.id}`}
                              checked={selectedRole.permissions.some(p => p.name === permission.name)}
                              onCheckedChange={(checked) => {
                                const currentPermissions = selectedRole.permissions.map(p => p.name);
                                const newPermissions = checked
                                  ? [...currentPermissions, permission.name]
                                  : currentPermissions.filter(p => p !== permission.name);
                                handleUpdatePermissions(selectedRole, newPermissions);
                              }}
                            />
                            <Label htmlFor={`edit-${permission.id}`} className="text-xs">
                              {permission.description}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};