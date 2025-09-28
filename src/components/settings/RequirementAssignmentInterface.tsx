import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/utils/toast";
import { useRequirementsService } from "@/services/requirements/RequirementsService";
import { requirementAssignmentService } from "@/services/assignments/RequirementAssignmentService";
import { 
  Search, Filter, Tag, UserPlus, Mail 
} from "lucide-react";

interface RequirementAssignmentInterfaceProps {
  users: any[];
  isDemo: boolean;
}

export const RequirementAssignmentInterface = ({ users, isDemo }: RequirementAssignmentInterfaceProps) => {
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