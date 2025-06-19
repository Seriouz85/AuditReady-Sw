import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/utils/toast";
import { formatDate } from "@/utils/formatDate";
import { useAuth } from "@/contexts/AuthContext";
import { useUserManagement } from "@/hooks/useUserManagement";
import { useProfile } from "@/hooks/useProfile";
import { RequirementAssignmentModal } from "@/components/settings/RequirementAssignmentModal";
import { 
  Download, Save, Upload, UserPlus, Settings as SettingsIcon, Shield, 
  Key, Activity, Trash2, Edit, Eye, Clock,
  CheckCircle, XCircle, Loader, ListChecks, Search, Filter, Tag, Mail
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRequirementsService } from "@/services/requirements/RequirementsService";
import { requirementAssignmentService } from "@/services/assignments/RequirementAssignmentService";
import { RequirementAssignment } from "@/types";

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

// Enhanced Requirement Assignment Interface Component
const RequirementAssignmentInterface = ({ users, isDemo }: { users: any[], isDemo: boolean }) => {
  const requirementsService = useRequirementsService();
  const [requirements, setRequirements] = useState<any[]>([]);
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [standardFilter, setStandardFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    role: 'analyst'
  });

  useEffect(() => {
    loadRequirements();
  }, []);

  const loadRequirements = async () => {
    try {
      setLoading(true);
      if (isDemo) {
        // Use mock data for demo - load organization-specific requirements
        const mockRequirements = await requirementAssignmentService.getOrganizationRequirements('demo-org-1');
        
        // Convert to the expected format for the UI
        const formattedRequirements = mockRequirements.map(req => ({
          id: req.id,
          code: req.code,
          name: req.name,
          standardId: req.standardId,
          standardName: getStandardName(req.standardId),
          tags: req.tags || [],
          status: req.status
        }));
        
        setRequirements([
          ...formattedRequirements,
          // Add some additional demo requirements
          {
            id: 'req-demo-1',
            code: 'A.5.1',
            name: 'Policies for information security',
            standardId: 'iso-27002-2022',
            standardName: 'ISO 27002:2022',
            tags: ['tag-organizational', 'tag-organization'],
            status: 'not-fulfilled'
          },
          {
            id: 'req-demo-2',
            code: 'A.6.1',
            name: 'Screening',
            standardId: 'iso-27002-2022',
            standardName: 'ISO 27002:2022',
            tags: ['tag-awareness', 'tag-organization'],
            status: 'not-fulfilled'
          },
          {
            id: 'req-3',
            code: 'A.8.1',
            name: 'User end point devices',
            standardId: 'iso-27002-2022',
            standardName: 'ISO 27002:2022',
            tags: ['tag-endpoint', 'tag-device'],
            status: 'partially-fulfilled'
          },
          {
            id: 'req-4',
            code: '1.1',
            name: 'Establish and Maintain Detailed Enterprise Asset Inventory',
            standardId: 'cis-ig1',
            standardName: 'CIS Controls IG1',
            tags: ['tag-assets', 'tag-organization'],
            status: 'not-fulfilled'
          },
          {
            id: 'req-5',
            code: '2.1',
            name: 'Establish and Maintain a Software Inventory',
            standardId: 'cis-ig1',
            standardName: 'CIS Controls IG1',
            tags: ['tag-assets', 'tag-device'],
            status: 'fulfilled'
          },
          {
            id: 'req-6',
            code: 'A.7.1',
            name: 'Physical security perimeters',
            standardId: 'iso-27002-2022',
            standardName: 'ISO 27002:2022',
            tags: ['tag-physical', 'tag-organization'],
            status: 'not-fulfilled'
          }
        ]);
        // Note: Removed the redundant setRequirements(mockRequirements) call
      } else {
        const data = await requirementsService.getOrganizationRequirements();
        setRequirements(data);
      }
    } catch (error) {
      console.error('Error loading requirements:', error);
      toast.error("Failed to load requirements");
    } finally {
      setLoading(false);
    }
  };

  const getTypeTagName = (tags: string[]) => {
    const typeTagMap: Record<string, string> = {
      'tag-organizational': 'Organizational',
      'tag-identity': 'Identity',
      'tag-endpoint': 'Endpoint',
      'tag-assets': 'Assets',
      'tag-awareness': 'Awareness',
      'tag-network': 'Network',
      'tag-physical': 'Physical',
      'tag-data-management': 'Data Management'
    };
    
    const typeTag = tags?.find(tag => typeTagMap[tag]);
    return typeTag ? typeTagMap[typeTag] : '';
  };

  const getTypeTagColor = (tags: string[]) => {
    const colorMap: Record<string, string> = {
      'tag-organizational': '#10B981',
      'tag-identity': '#A21CAF',
      'tag-endpoint': '#3B82F6',
      'tag-assets': '#F59E0B',
      'tag-awareness': '#F59E42',
      'tag-network': '#8B5CF6',
      'tag-physical': '#059669',
      'tag-data-management': '#06B6D4'
    };
    
    const typeTag = tags?.find(tag => colorMap[tag]);
    return typeTag ? colorMap[typeTag] : '#6B7280';
  };

  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = 
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || (req.tags && req.tags.includes(typeFilter));
    const matchesStandard = standardFilter === "all" || req.standardId === standardFilter;
    
    return matchesSearch && matchesType && matchesStandard;
  });

  const uniqueStandards = Array.from(new Set(requirements.map(req => req.standardId)))
    .map(id => {
      const req = requirements.find(r => r.standardId === id);
      return { id, name: req?.standardName || id };
    });

  const handleSelectAll = () => {
    if (selectedRequirements.length === filteredRequirements.length) {
      setSelectedRequirements([]);
    } else {
      setSelectedRequirements(filteredRequirements.map(req => req.id));
    }
  };

  // Helper function to get standard name
  const getStandardName = (standardId: string): string => {
    const standardNames: Record<string, string> = {
      'iso-27002-2022': 'ISO 27002:2022',
      'cis-controls-v8': 'CIS Controls v8',
      'nist-csf': 'NIST Cybersecurity Framework',
      'gdpr': 'GDPR',
      'hipaa': 'HIPAA'
    };
    return standardNames[standardId] || 'Unknown Standard';
  };

  const handleAssign = async () => {
    if (selectedRequirements.length === 0) {
      toast.error("Please select at least one requirement");
      return;
    }
    if (!selectedUser) {
      toast.error("Please select a user to assign to");
      return;
    }
    
    // If inviting new user, show the invite dialog
    if (selectedUser === 'invite-new') {
      setShowInviteDialog(true);
      return;
    }
    
    try {
      const user = users.find(u => u.id === selectedUser);
      if (!user) {
        toast.error("Selected user not found");
        return;
      }

      // Convert demo user to InternalUser format
      const assignedToUser = {
        id: user.id,
        name: user.name || user.email,
        email: user.email,
        department: user.role
      };

      // Get selected requirements details
      const selectedReqs = requirements.filter(req => selectedRequirements.includes(req.id));
      const requirementDetails = selectedReqs.map(req => ({
        id: req.id,
        standardId: req.standardId,
        section: req.code.split('.')[0] || 'A',
        code: req.code,
        name: req.name,
        description: req.name, // Using name as description for demo
        status: req.status as any,
        tags: req.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      // Assign requirements using the service
      const assignments = await requirementAssignmentService.assignRequirements(
        selectedRequirements,
        requirementDetails,
        assignedToUser,
        'current-user-id', // In real app, this would come from auth context
        'Current Admin', // In real app, this would come from auth context
        'demo-org-1', // In real app, this would come from auth context
        // Due date could be added here
      );

      toast.success(`Successfully assigned ${assignments.length} requirement${assignments.length !== 1 ? 's' : ''} to ${user.name || user.email}`);
      
      // Reset selections
      setSelectedRequirements([]);
      setSelectedUser("");

    } catch (error) {
      console.error('Assignment error:', error);
      toast.error("Failed to assign requirements. Please try again.");
    }
  };

  const handleInviteAndAssign = async () => {
    if (!inviteForm.email) {
      toast.error("Please enter an email address");
      return;
    }
    
    try {
      // Get selected requirements details
      const selectedReqs = requirements.filter(req => selectedRequirements.includes(req.id));
      const requirementDetails = selectedReqs.map(req => ({
        id: req.id,
        standardId: req.standardId,
        section: req.code.split('.')[0] || 'A',
        code: req.code,
        name: req.name,
        description: req.name,
        status: req.status as any,
        tags: req.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      // Invite user and assign requirements
      const result = await requirementAssignmentService.inviteUserAndAssign(
        inviteForm.email,
        inviteForm.name || inviteForm.email,
        inviteForm.role,
        selectedRequirements,
        requirementDetails,
        'current-user-id', // In real app, from auth context
        'Current Admin', // In real app, from auth context
        'demo-org-1' // In real app, from auth context
      );

      if (result.error) {
        // Check if it's a seat limit error
        if (result.error.includes('No available seats')) {
          toast.error(result.error);
          // Close current dialog and show upgrade prompt
          setShowInviteDialog(false);
          // TODO: Show upgrade dialog
          return;
        }
        throw new Error(result.error);
      }

      toast.success(`Successfully invited ${inviteForm.email} and assigned ${result.assignments.length} requirement${result.assignments.length !== 1 ? 's' : ''}`);
      
      // Reset everything
      setSelectedRequirements([]);
      setSelectedUser("");
      setShowInviteDialog(false);
      setInviteForm({ email: '', name: '', role: 'analyst' });

    } catch (error) {
      console.error('Invite and assign error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to invite user. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium">Requirement Assignment</h4>
        <p className="text-sm text-muted-foreground">
          Select requirements and assign them to team members
        </p>
      </div>

      {/* Filters and Assignment Controls */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requirements..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <Tag className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="tag-organizational">Organizational</SelectItem>
              <SelectItem value="tag-identity">Identity</SelectItem>
              <SelectItem value="tag-endpoint">Endpoint</SelectItem>
              <SelectItem value="tag-assets">Assets</SelectItem>
              <SelectItem value="tag-awareness">Awareness</SelectItem>
              <SelectItem value="tag-network">Network</SelectItem>
              <SelectItem value="tag-physical">Physical</SelectItem>
              <SelectItem value="tag-data-management">Data Management</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={standardFilter} onValueChange={setStandardFilter}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by standard" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Standards</SelectItem>
              {uniqueStandards.map(standard => (
                <SelectItem key={standard.id} value={standard.id}>
                  {standard.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assignment Controls - Moved here and made more compact */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-3 bg-muted/30 rounded-lg border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              Assign Selected:
            </span>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <UserPlus className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {users.filter(user => user.status === 'active').map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email} ({user.role})
                  </SelectItem>
                ))}
                <SelectItem value="invite-new" className="border-t">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Invite new user via email</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleAssign} 
              disabled={selectedRequirements.length === 0 || !selectedUser}
              size="sm"
              className="w-full sm:w-auto"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {selectedUser === 'invite-new' ? 'Invite & Assign' : 'Assign'} ({selectedRequirements.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Requirements List */}
      <div className="border rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-muted/30 to-muted/50">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedRequirements.length === filteredRequirements.length && filteredRequirements.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <div>
              <span className="text-sm font-medium">
                {selectedRequirements.length} of {filteredRequirements.length} selected
              </span>
              {selectedRequirements.length > 0 && (
                <span className="text-xs text-muted-foreground ml-2">
                  • Ready for assignment
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {filteredRequirements.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {filteredRequirements.length} requirement{filteredRequirements.length !== 1 ? 's' : ''}
              </Badge>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSelectAll}
            >
              {selectedRequirements.length === filteredRequirements.length ? "Deselect All" : "Select All"}
            </Button>
          </div>
        </div>
        
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : filteredRequirements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No requirements found matching your filters
            </div>
          ) : (
            <div className="divide-y">
              {filteredRequirements.map(req => {
                const typeTag = getTypeTagName(req.tags);
                const typeColor = getTypeTagColor(req.tags);
                
                return (
                  <div
                    key={req.id}
                    className={`flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-all duration-200 ${
                      selectedRequirements.includes(req.id) 
                        ? 'bg-blue-50/50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' 
                        : 'border-l-4 border-l-transparent'
                    }`}
                    onClick={() => {
                      setSelectedRequirements(prev =>
                        prev.includes(req.id)
                          ? prev.filter(id => id !== req.id)
                          : [...prev, req.id]
                      );
                    }}
                  >
                    <Checkbox
                      checked={selectedRequirements.includes(req.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedRequirements([...selectedRequirements, req.id]);
                        } else {
                          setSelectedRequirements(selectedRequirements.filter(id => id !== req.id));
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-sm bg-muted/50 px-2 py-1 rounded text-foreground">
                          {req.code}
                        </span>
                        <span className="text-sm flex-1">{req.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {req.standardName}
                        </Badge>
                        {typeTag && (
                          <Badge
                            style={{
                              backgroundColor: `${typeColor}20`,
                              color: typeColor,
                              borderColor: `${typeColor}40`
                            }}
                            className="text-xs border"
                          >
                            {typeTag}
                          </Badge>
                        )}
                        <div className="ml-auto">
                          <Badge 
                            variant={req.status === 'fulfilled' ? 'default' : req.status === 'partially-fulfilled' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {req.status === 'fulfilled' ? 'Fulfilled' : 
                             req.status === 'partially-fulfilled' ? 'Partial' : 
                             req.status === 'not-applicable' ? 'N/A' : 'Not Fulfilled'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Invite User Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Invite New User & Assign Requirements</DialogTitle>
            <DialogDescription>
              Invite a new team member and assign them {selectedRequirements.length} selected requirement{selectedRequirements.length !== 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invite-email" className="text-right">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                placeholder="user@example.com"
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invite-name" className="text-right">
                Name
              </Label>
              <Input
                id="invite-name"
                type="text"
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                placeholder="John Doe (optional)"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="invite-role" className="text-right">
                Role <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={inviteForm.role} 
                onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}
              >
                <SelectTrigger id="invite-role" className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="analyst">Analyst</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-muted/50 p-3 mt-2">
              <p className="text-sm text-muted-foreground">
                The user will receive an email invitation to join your organization with the selected requirements already assigned to them.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteAndAssign}>
              <Mail className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

const Settings = () => {
  const { user, organization, isDemo, hasPermission } = useAuth();
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
          <TabsList className="grid w-max grid-cols-8 gap-1 p-1 h-auto bg-muted/50">
            <TabsTrigger value="profile" className="text-xs px-2 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">Profile</TabsTrigger>
            <TabsTrigger value="organization" className="text-xs px-2 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">Organization</TabsTrigger>
            <TabsTrigger value="users" className="text-xs px-2 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">Users & Access</TabsTrigger>
            <TabsTrigger value="assignments" className="text-xs px-2 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">Assignments</TabsTrigger>
            <TabsTrigger value="security" className="text-xs px-2 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">Security</TabsTrigger>
            <TabsTrigger value="integrations" className="text-xs px-2 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">Integrations</TabsTrigger>
            <TabsTrigger value="importing" className="text-xs px-2 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">Import/Export</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs px-2 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">Notifications</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Profile</CardTitle>
              <CardDescription>
                Manage your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isDemo && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    👤 Demo Mode: Profile changes are demonstration only. In production, these would be saved to your account.
                  </p>
                </div>
              )}
              
              {/* Profile Picture Section */}
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.name || profile?.email}`} 
                    alt={profile?.name || 'User'} 
                  />
                  <AvatarFallback className="text-lg">
                    {profile?.name ? 
                      profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 
                      profile?.email?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-2">
                  <h3 className="text-lg font-medium">
                    {profile?.name || profile?.email?.split('@')[0] || 'User'}
                  </h3>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={isDemo || profileUpdating}
                    onClick={() => {
                      if (isDemo) {
                        toast.info('Profile picture upload is not available in demo mode');
                        return;
                      }
                      
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          await updateProfilePicture(file);
                        }
                      };
                      input.click();
                    }}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {profileUpdating ? 'Uploading...' : 'Change Picture'}
                  </Button>
                </div>
              </div>
              
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input 
                    id="first-name" 
                    defaultValue={profile?.first_name || (isDemo ? "Demo" : "")} 
                    disabled={isDemo || profileUpdating}
                    onBlur={async (e) => {
                      if (!isDemo && e.target.value !== profile?.first_name) {
                        await updateProfile({ first_name: e.target.value });
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input 
                    id="last-name" 
                    defaultValue={profile?.last_name || (isDemo ? "User" : "")} 
                    disabled={isDemo || profileUpdating}
                    onBlur={async (e) => {
                      if (!isDemo && e.target.value !== profile?.last_name) {
                        await updateProfile({ last_name: e.target.value });
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input 
                    id="display-name" 
                    defaultValue={profile?.name || (isDemo ? "Demo User" : "")} 
                    disabled={isDemo || profileUpdating}
                    onBlur={async (e) => {
                      if (!isDemo && e.target.value !== profile?.name) {
                        await updateProfile({ name: e.target.value });
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    defaultValue={profile?.phone || (isDemo ? "+1 (555) 123-4567" : "")} 
                    disabled={isDemo || profileUpdating}
                    onBlur={async (e) => {
                      if (!isDemo && e.target.value !== profile?.phone) {
                        await updateProfile({ phone: e.target.value });
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    defaultValue={profile?.bio || (isDemo ? "Cybersecurity professional focused on compliance and risk management." : "")}
                    disabled={isDemo || profileUpdating}
                    onBlur={async (e) => {
                      if (!isDemo && e.target.value !== profile?.bio) {
                        await updateProfile({ bio: e.target.value });
                      }
                    }}
                  />
                </div>
              </div>
              
              {/* Preferences */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Preferences</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Time Zone</Label>
                    <p className="text-sm text-muted-foreground">Your local time zone for scheduling</p>
                  </div>
                  <Select 
                    defaultValue={profile?.timezone || (isDemo ? "America/New_York" : "UTC")} 
                    disabled={isDemo || profileUpdating}
                    onValueChange={async (value) => {
                      if (!isDemo) {
                        await updateProfile({ timezone: value });
                      }
                    }}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (UTC-8)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (UTC-6)</SelectItem>
                      <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (UTC+1)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (UTC+9)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Language</Label>
                    <p className="text-sm text-muted-foreground">Interface language preference</p>
                  </div>
                  <Select 
                    defaultValue={profile?.language || "en"} 
                    disabled={isDemo || profileUpdating}
                    onValueChange={async (value) => {
                      if (!isDemo) {
                        await updateProfile({ language: value });
                      }
                    }}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch 
                    checked={profile?.email_notifications ?? true}
                    disabled={isDemo || profileUpdating}
                    onCheckedChange={async (checked) => {
                      if (!isDemo) {
                        await updateProfile({ email_notifications: checked });
                      } else {
                        toast.info('Email notification settings are read-only in demo mode');
                      }
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Enhanced account security</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={isDemo || profileUpdating}
                    onClick={async () => {
                      if (isDemo) {
                        toast.info('2FA configuration is not available in demo mode');
                        return;
                      }
                      
                      const current2FA = profile?.two_factor_enabled || false;
                      await updateTwoFactorAuth(!current2FA);
                    }}
                  >
                    {profileUpdating ? 'Updating...' : 
                     profile?.two_factor_enabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => {
                if (isDemo) {
                  toast.info('Profile changes are read-only in demo mode');
                } else {
                  toast.success('Profile saved successfully');
                  // In production, save all changes to Supabase
                }
              }}>
                <Save className="mr-2 h-4 w-4" />
                {isDemo ? 'Read-Only in Demo' : 'Save Profile'}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Account Security */}
          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>
                Manage your account security and login settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-email">Email Address</Label>
                <Input 
                  id="current-email" 
                  type="email" 
                  defaultValue={profile?.email || ""} 
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Contact support to change your email address
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="flex gap-2">
                  <Input 
                    type="password" 
                    value="••••••••" 
                    disabled 
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    disabled={isDemo || profileUpdating}
                    onClick={() => {
                      if (isDemo) {
                        toast.info('Password change is not available in demo mode');
                        return;
                      }
                      
                      // Create a simple password change dialog
                      const newPassword = prompt('Enter your new password:');
                      if (newPassword && newPassword.length >= 8) {
                        updatePassword(newPassword);
                      } else if (newPassword) {
                        toast.error('Password must be at least 8 characters long');
                      }
                    }}
                  >
                    {profileUpdating ? 'Updating...' : 'Change Password'}
                  </Button>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h5 className="font-medium mb-2">Recent Login Activity</h5>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Current session: {new Date().toLocaleString()}</p>
                  {isDemo && (
                    <>
                      <p>• Web browser: Yesterday at 3:24 PM</p>
                      <p>• Mobile app: 3 days ago</p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Organization Settings */}
        <TabsContent value="organization" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Profile</CardTitle>
              <CardDescription>
                Manage your organization details and compliance settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isDemo && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    📊 Demo Mode: Organization settings are read-only in the demo version.
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input 
                  id="org-name" 
                  defaultValue={organization?.name || (isDemo ? "Demo Company" : "")} 
                  disabled={isDemo}
                  onBlur={e => {
                    if (!isDemo) {
                      localStorage.setItem('organizationProfile', JSON.stringify({ name: e.target.value }));
                      toast.success('Organization name updated successfully');
                    }
                  }} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input 
                  id="industry" 
                  defaultValue={organization?.industry || (isDemo ? "Technology" : "")} 
                  disabled={isDemo}
                  onBlur={e => {
                    if (!isDemo) {
                      toast.success('Industry information updated successfully');
                    }
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company-size">Company Size</Label>
                <Input 
                  id="company-size" 
                  defaultValue={organization?.company_size || (isDemo ? "51-200 employees" : "")} 
                  disabled={isDemo}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input 
                  id="contact-email" 
                  type="email" 
                  defaultValue={user?.email || (isDemo ? "contact@democorp.com" : "")} 
                  disabled={isDemo}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Organization Description</Label>
                <Textarea
                  id="description"
                  defaultValue={isDemo ? "Demo Company showcasing AuditReady's comprehensive compliance management platform." : ""}
                  rows={4}
                  disabled={isDemo}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isDemo}>
                <Save className="mr-2 h-4 w-4" />
                {isDemo ? 'Read-Only in Demo' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Subscription & Billing</CardTitle>
              <CardDescription>
                Manage your subscription plan and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border">
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    {isDemo ? 'Demo Plan' : 
                     organization?.subscription_tier === 'team' ? 'Team Plan' :
                     organization?.subscription_tier === 'business' ? 'Business Plan' :
                     organization?.subscription_tier === 'enterprise' ? 'Enterprise Plan' : 'Free Plan'}
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {isDemo ? 'Full feature demo • No billing' :
                     organization?.subscription_tier === 'team' ? '€99/month • Up to 50 employees' :
                     organization?.subscription_tier === 'business' ? '€699/month • Up to 1000 employees' :
                     organization?.subscription_tier === 'enterprise' ? 'Custom pricing • Unlimited employees' : 'Free • Up to 5 users'}
                  </p>
                </div>
                <Badge className={isDemo ? "bg-purple-500 text-white" : "bg-blue-500 text-white"}>
                  {isDemo ? 'Demo' : 'Current Plan'}
                </Badge>
              </div>
              
              {!isDemo && (
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={async () => {
                    try {
                      const { getCustomerPortalUrl } = await import('@/api/stripe');
                      const portalUrl = await getCustomerPortalUrl();
                      window.open(portalUrl, '_blank');
                    } catch (error) {
                      toast.error('Unable to open billing portal');
                    }
                  }}>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Manage Billing
                  </Button>
                  <Button variant="outline" onClick={async () => {
                    try {
                      const { getInvoices } = await import('@/api/stripe');
                      const invoices = await getInvoices();
                      if (invoices.length === 0) {
                        toast.info('No invoices found');
                      } else {
                        // Generate demo invoice download
                        const currentDate = new Date().toLocaleDateString();
                        toast.success(`Invoice downloaded: AuditReady_Invoice_${currentDate.replace(/\//g, '-')}.pdf`);
                        // In production, this would download actual invoice PDFs
                      }
                    } catch (error) {
                      toast.error('Unable to fetch invoices');
                    }
                  }}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Invoices
                  </Button>
                </div>
              )}
              
              {isDemo && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md">
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    🚀 This is a demo account showcasing all premium features. To access billing and subscription management, please sign up for a paid plan.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Users & Access Management */}
        <TabsContent value="users" className="space-y-6 mt-6">
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
                      <div className="flex space-x-2 mt-2">
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
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
              <CardDescription>
                Configure password requirements for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Minimum Password Length</Label>
                  <p className="text-sm text-muted-foreground">Require at least 8 characters</p>
                </div>
                <Input 
                  type="number" 
                  defaultValue="8" 
                  className="w-20" 
                  min="6" 
                  max="32" 
                  onChange={(e) => {
                    toast.success(`Password length requirement updated to ${e.target.value} characters`);
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Special Characters</Label>
                  <p className="text-sm text-muted-foreground">Include symbols (!@#$%^&*)</p>
                </div>
                <Switch 
                  defaultChecked 
                  onCheckedChange={(checked) => {
                    toast.success(`Special characters requirement ${checked ? 'enabled' : 'disabled'}`);
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Numbers</Label>
                  <p className="text-sm text-muted-foreground">Include at least one number</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Password Expiration</Label>
                  <p className="text-sm text-muted-foreground">Force password change every 90 days</p>
                </div>
                <Switch />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => {
                toast.success("Password policy updated successfully");
                // In production, this would save to the database
              }}>
                <Save className="mr-2 h-4 w-4" />
                Save Password Policy
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Multi-Factor Authentication</CardTitle>
              <CardDescription>
                Enhance security with two-factor authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require MFA for Admin Users</Label>
                  <p className="text-sm text-muted-foreground">Mandatory 2FA for administrators</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require MFA for All Users</Label>
                  <p className="text-sm text-muted-foreground">Organization-wide MFA requirement</p>
                </div>
                <Switch />
              </div>
              
              <div className="space-y-2">
                <Label>Allowed MFA Methods</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <label className="text-sm">Authenticator Apps (Google Authenticator, Authy)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <label className="text-sm">SMS Text Messages</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <label className="text-sm">Hardware Security Keys (YubiKey)</label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => {
                toast.success("MFA settings updated successfully");
                // In production, this would save to the database
              }}>
                <Shield className="mr-2 h-4 w-4" />
                Save MFA Settings
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>
                Control user session behavior and timeouts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session Timeout (minutes)</Label>
                  <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                </div>
                <Input 
                  type="number" 
                  defaultValue="30" 
                  className="w-20" 
                  min="5" 
                  max="480" 
                  onChange={(e) => {
                    toast.success(`Session timeout updated to ${e.target.value} minutes`);
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maximum Concurrent Sessions</Label>
                  <p className="text-sm text-muted-foreground">Limit active sessions per user</p>
                </div>
                <Input type="number" defaultValue="3" className="w-20" min="1" max="10" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Force Logout on Password Change</Label>
                  <p className="text-sm text-muted-foreground">End all sessions when password is updated</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => {
                toast.success("Session settings updated successfully");
                // In production, this would save to the database
              }}>
                <Key className="mr-2 h-4 w-4" />
                Save Session Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Assignments */}
        <TabsContent value="assignments" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Requirement Assignments</CardTitle>
              <CardDescription>
                Assign requirements to team members based on their roles and expertise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isDemo && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    📋 Demo Mode: Assignment features are demonstration only. In production, these would create real user assignments.
                  </p>
                </div>
              )}

              {/* Enhanced Requirement Assignment Interface */}
              <RequirementAssignmentInterface 
                users={displayUsers}
                isDemo={isDemo}
              />

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Current Assignment Rules</h4>
                <div className="space-y-3">
                  {isDemo && (
                    <>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge style={{ backgroundColor: '#A21CAF20', color: '#A21CAF' }}>Identity</Badge>
                          <span className="text-sm">→ Demo CISO (ciso)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">15 requirements</Badge>
                          <Button size="sm" variant="ghost" onClick={() => {
                            toast.info("Edit assignment rule: Modify which user types should receive these requirements.");
                            // In production, this would open assignment rule editor
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge style={{ backgroundColor: '#3B82F620', color: '#3B82F6' }}>Endpoint</Badge>
                          <span className="text-sm">→ Demo Analyst (analyst)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">12 requirements</Badge>
                          <Button size="sm" variant="ghost" onClick={() => {
                            toast.info("Edit assignment rule: Modify which user types should receive these requirements.");
                            // In production, this would open assignment rule editor
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge style={{ backgroundColor: '#F59E4220', color: '#F59E42' }}>Awareness</Badge>
                          <span className="text-sm">→ Demo Admin (admin)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">8 requirements</Badge>
                          <Button size="sm" variant="ghost" onClick={() => {
                            toast.info("Edit assignment rule: Modify which user types should receive these requirements.");
                            // In production, this would open assignment rule editor
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {!isDemo && (
                    <div className="text-center py-8 text-muted-foreground">
                      <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No assignment rules configured yet.</p>
                      <p className="text-sm">Create bulk assignments above to get started.</p>
                    </div>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Single Sign-On (SSO)</CardTitle>
              <CardDescription>
                Configure enterprise authentication providers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Microsoft Azure AD</h4>
                    <Badge variant="outline">Not Configured</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Enable SSO with Microsoft Active Directory
                  </p>
                  <Button size="sm" variant="outline" onClick={() => {
                    toast.info("Azure AD SSO configuration would open here. Contact support for setup assistance.");
                    // In production, this would open Azure AD configuration wizard
                  }}>Configure</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Google Workspace</h4>
                    <Badge variant="outline">Not Configured</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Enable SSO with Google Workspace
                  </p>
                  <Button size="sm" variant="outline" onClick={() => {
                    toast.info("Google Workspace SSO configuration would open here. Contact support for setup assistance.");
                    // In production, this would open Google Workspace configuration wizard
                  }}>Configure</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Okta</h4>
                    <Badge variant="outline">Not Configured</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Enterprise identity management
                  </p>
                  <Button size="sm" variant="outline" onClick={() => {
                    toast.info("Okta SSO configuration would open here. Contact support for enterprise setup.");
                    // In production, this would open Okta configuration wizard
                  }}>Configure</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Custom SAML</h4>
                    <Badge variant="outline">Not Configured</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Custom SAML 2.0 provider
                  </p>
                  <Button size="sm" variant="outline" onClick={() => {
                    toast.info("Custom SAML configuration requires enterprise support. Contact our team for setup.");
                    // In production, this would open SAML configuration interface
                  }}>Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage API access for integrations and automation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Production API Key</div>
                    <div className="text-sm text-muted-foreground">Created on Dec 1, 2024</div>
                    <div className="text-sm text-muted-foreground">Last used: 2 hours ago</div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => {
                      toast.info("API key would be revealed here. Feature requires secure authentication.");
                      // In production, this would show the API key after authentication
                    }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      toast.success("API key revoked successfully. Any applications using this key will lose access.");
                      // In production, this would revoke the API key
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <Button variant="outline" onClick={() => {
                  const newKey = 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                  toast.success(`New API key generated: ${newKey.substring(0, 20)}... (Copy this key immediately as it won't be shown again)`);
                  // In production, this would generate a real API key and store it securely
                }}>
                  <Key className="mr-2 h-4 w-4" />
                  Generate New API Key
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>
                Configure webhook endpoints for real-time notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" onClick={() => {
                  toast.info("Webhook endpoint configuration dialog would open here. Configure endpoints for real-time notifications.");
                  // In production, this would open a modal to configure webhook endpoints
                }}>
                  <Activity className="mr-2 h-4 w-4" />
                  Add Webhook Endpoint
                </Button>
                <p className="text-sm text-muted-foreground">
                  No webhook endpoints configured. Add endpoints to receive real-time notifications about compliance events.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Import/Export Settings */}
        <TabsContent value="importing" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                Export system activity and audit logs for compliance reporting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Date Range</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Last 30 days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                      <SelectItem value="1y">Last year</SelectItem>
                      <SelectItem value="custom">Custom range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Activity Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All activities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Activities</SelectItem>
                      <SelectItem value="user">User Management</SelectItem>
                      <SelectItem value="security">Security Events</SelectItem>
                      <SelectItem value="compliance">Compliance Changes</SelectItem>
                      <SelectItem value="system">System Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Format</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="CSV" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => {
                toast.success("Audit logs export started. You'll receive an email when it's ready.");
                // In production, this would trigger a real export
              }}>
                <Download className="mr-2 h-4 w-4" />
                Export Audit Logs
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="assessment-notifications">Assessment Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about assessment deadlines
                  </p>
                </div>
                <Switch 
                  id="assessment-notifications" 
                  defaultChecked 
                  onCheckedChange={(checked) => {
                    toast.success(`Assessment reminder notifications ${checked ? 'enabled' : 'disabled'}`);
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compliance-updates">Compliance Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about changes to compliance status
                  </p>
                </div>
                <Switch 
                  id="compliance-updates" 
                  defaultChecked 
                  onCheckedChange={(checked) => {
                    toast.success(`Compliance update notifications ${checked ? 'enabled' : 'disabled'}`);
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="team-activity">Team Activity</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about team member actions
                  </p>
                </div>
                <Switch 
                  id="team-activity" 
                  onCheckedChange={(checked) => {
                    toast.success(`Team activity notifications ${checked ? 'enabled' : 'disabled'}`);
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="standard-updates">Standard Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications when standards are updated
                  </p>
                </div>
                <Switch 
                  id="standard-updates" 
                  defaultChecked 
                  onCheckedChange={(checked) => {
                    toast.success(`Standard update notifications ${checked ? 'enabled' : 'disabled'}`);
                  }}
                />
              </div>
              
              <div className="space-y-2 mt-4">
                <Label htmlFor="notification-email">Notification Email</Label>
                <Input id="notification-email" type="email" defaultValue="alerts@acme.com" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
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