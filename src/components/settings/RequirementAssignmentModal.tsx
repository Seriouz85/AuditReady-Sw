import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/utils/toast";
import { Search, Filter, UserPlus, Tag } from "lucide-react";
import { useRequirementsService } from "@/services/requirements/RequirementsService";
import { useAuth } from "@/contexts/AuthContext";

interface AssignmentModalProps {
  open: boolean;
  onClose: () => void;
  users: any[];
  onAssign: (requirementIds: string[], userId: string) => void;
}

export function RequirementAssignmentModal({ open, onClose, users, onAssign }: AssignmentModalProps) {
  const { isDemo } = useAuth();
  const requirementsService = useRequirementsService();
  const [requirements, setRequirements] = useState<any[]>([]);
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [standardFilter, setStandardFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadRequirements();
    }
  }, [open]);

  const loadRequirements = async () => {
    try {
      setLoading(true);
      if (isDemo) {
        // Use mock data for demo
        const mockRequirements = [
          {
            id: 'req-1',
            code: 'A.5.1',
            name: 'Policies for information security',
            standardId: 'iso-27002-2022',
            standardName: 'ISO 27002:2022',
            tags: ['tag-organizational', 'tag-organization'],
            status: 'not-fulfilled'
          },
          {
            id: 'req-2',
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
            code: '5.1',
            name: 'Establish and Maintain an Inventory of Accounts',
            standardId: 'cis-ig1',
            standardName: 'CIS Controls IG1',
            tags: ['tag-identity', 'tag-organization'],
            status: 'not-fulfilled'
          }
        ];
        setRequirements(mockRequirements);
      } else {
        const data = await requirementsService.getRequirements();
        setRequirements(data);
      }
    } catch (error) {
      console.error('Error loading requirements:', error);
      toast.error('Failed to load requirements');
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

  const handleAssign = () => {
    if (selectedRequirements.length === 0) {
      toast.error("Please select at least one requirement");
      return;
    }
    if (!selectedUser) {
      toast.error("Please select a user to assign to");
      return;
    }
    
    onAssign(selectedRequirements, selectedUser);
    onClose();
    setSelectedRequirements([]);
    setSelectedUser("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Assign Requirements</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Filters */}
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

          {/* Requirements List */}
          <div className="border rounded-lg">
            <div className="flex items-center justify-between p-3 border-b bg-muted/50">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedRequirements.length === filteredRequirements.length && filteredRequirements.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedRequirements.length} of {filteredRequirements.length} selected
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSelectAll}
              >
                {selectedRequirements.length === filteredRequirements.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            
            <ScrollArea className="h-[300px]">
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
                        className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
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
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{req.code}</span>
                            <span className="text-sm">{req.name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
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
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* User Selection */}
          <div className="space-y-2">
            <Label>Assign to User</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <UserPlus className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.filter(user => user.status === 'active').map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email} ({user.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={selectedRequirements.length === 0 || !selectedUser}>
            <UserPlus className="h-4 w-4 mr-2" />
            Assign {selectedRequirements.length} Requirement{selectedRequirements.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}