import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/utils/toast';
import { 
  organizationHierarchyService, 
  Department, 
  OrganizationChart,
  DepartmentStats 
} from '@/services/organization/OrganizationHierarchyService';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Building2, Users, Plus, Settings,
  MapPin, DollarSign, Crown,
  ChevronRight, ChevronDown, Edit,
  Calendar
} from 'lucide-react';

interface OrganizationHierarchyProps {
  organizationId?: string;
  viewMode?: 'chart' | 'list' | 'teams' | 'stats';
}

export const OrganizationHierarchy: React.FC<OrganizationHierarchyProps> = ({
  organizationId,
  viewMode = 'chart'
}) => {
  const { organization, isDemo } = useAuth();
  const [orgChart, setOrgChart] = useState<OrganizationChart | null>(null);
  const [departmentStats, setDepartmentStats] = useState<{ [id: string]: DepartmentStats }>({});
  const [loading, setLoading] = useState(true);
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [activeView, setActiveView] = useState(viewMode);
  const [isCreateDeptOpen, setIsCreateDeptOpen] = useState(false);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [createDeptForm, setCreateDeptForm] = useState({
    name: '',
    description: '',
    parentDepartmentId: '',
    location: '',
    budget: ''
  });
  const [createTeamForm, setCreateTeamForm] = useState({
    name: '',
    description: '',
    departmentId: '',
    teamType: 'permanent' as 'permanent' | 'project' | 'cross_functional'
  });

  const orgId = organizationId || organization?.id || 'demo-org';

  const loadOrganizationData = useCallback(async () => {
    try {
      setLoading(true);
      const chart = await organizationHierarchyService.getOrganizationChart(orgId);
      setOrgChart(chart);

      // Load department stats
      const statsPromises = chart.departments.map(async dept => {
        const stats = await organizationHierarchyService.getDepartmentStats(dept.id);
        return { id: dept.id, stats };
      });
      
      const statsResults = await Promise.all(statsPromises);
      const statsMap = statsResults.reduce((acc, { id, stats }) => {
        acc[id] = stats;
        return acc;
      }, {} as { [id: string]: DepartmentStats });
      
      setDepartmentStats(statsMap);
    } catch (error) {
      console.error('Error loading organization data:', error);
      toast.error('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    loadOrganizationData();
  }, [loadOrganizationData]);

  const handleCreateDepartment = async () => {
    if (!createDeptForm.name.trim()) {
      toast.error('Department name is required');
      return;
    }

    if (isDemo) {
      toast.info('Department creation is not available in demo mode');
      return;
    }

    try {
      const departmentParams: any = {
        organizationId: orgId,
        name: createDeptForm.name,
      };
      
      if (createDeptForm.description.trim()) {
        departmentParams.description = createDeptForm.description;
      }
      
      if (createDeptForm.parentDepartmentId) {
        departmentParams.parentDepartmentId = createDeptForm.parentDepartmentId;
      }
      
      if (createDeptForm.location.trim()) {
        departmentParams.location = createDeptForm.location;
      }
      
      if (createDeptForm.budget) {
        departmentParams.budget = parseFloat(createDeptForm.budget);
      }

      const result = await organizationHierarchyService.createDepartment(departmentParams);

      if (result.success) {
        toast.success('Department created successfully');
        setIsCreateDeptOpen(false);
        setCreateDeptForm({ name: '', description: '', parentDepartmentId: '', location: '', budget: '' });
        await loadOrganizationData();
      } else {
        toast.error(result.error || 'Failed to create department');
      }
    } catch (error) {
      console.error('Error creating department:', error);
      toast.error('Failed to create department');
    }
  };

  const handleCreateTeam = async () => {
    if (!createTeamForm.name.trim() || !createTeamForm.departmentId) {
      toast.error('Team name and department are required');
      return;
    }

    if (isDemo) {
      toast.info('Team creation is not available in demo mode');
      return;
    }

    try {
      const result = await organizationHierarchyService.createTeam({
        organizationId: orgId,
        departmentId: createTeamForm.departmentId,
        name: createTeamForm.name,
        description: createTeamForm.description,
        teamType: createTeamForm.teamType
      });

      if (result.success) {
        toast.success('Team created successfully');
        setIsCreateTeamOpen(false);
        setCreateTeamForm({ name: '', description: '', departmentId: '', teamType: 'permanent' });
        await loadOrganizationData();
      } else {
        toast.error(result.error || 'Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
    }
  };

  const toggleDepartment = (departmentId: string) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(departmentId)) {
      newExpanded.delete(departmentId);
    } else {
      newExpanded.add(departmentId);
    }
    setExpandedDepartments(newExpanded);
  };

  const renderDepartmentNode = (department: Department, level = 0) => {
    const isExpanded = expandedDepartments.has(department.id);
    const hasChildren = (orgChart?.hierarchy[department.id]?.children?.length || 0) > 0;
    const departmentTeams = orgChart?.teams.filter(team => team.department_id === department.id) || [];
    // const departmentUsers = orgChart?.users.filter(user => user.department_id === department.id) || [];
    const stats = departmentStats[department.id];

    return (
      <div key={department.id} className="space-y-2">
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer ${
            selectedDepartment?.id === department.id ? 'bg-blue-50 border-blue-200' : ''
          }`}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => setSelectedDepartment(department)}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleDepartment(department.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          
          <div className="flex-1 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span className="font-medium">{department.name}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {department.head_user && (
                <div className="flex items-center gap-1">
                  <Crown className="h-3 w-3 text-amber-500" />
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={department.head_user.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {department.head_user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {department.head_user.name}
                  </span>
                </div>
              )}
              
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {department.user_count || 0}
              </Badge>
              
              {departmentTeams.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {departmentTeams.length} team{departmentTeams.length !== 1 ? 's' : ''}
                </Badge>
              )}
              
              {department.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {department.location}
                </div>
              )}
              
              {stats && stats.compliance_score !== undefined && (
                <Badge 
                  variant={stats.compliance_score > 80 ? "default" : stats.compliance_score > 60 ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {stats.compliance_score}% compliance
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" disabled={isDemo}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" disabled={isDemo}>
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Show teams when department is expanded */}
        {isExpanded && departmentTeams.length > 0 && (
          <div className="ml-8 space-y-1">
            {departmentTeams.map(team => (
              <div
                key={team.id}
                className="flex items-center gap-3 p-2 rounded border-l-2 border-green-200 bg-green-50/50"
              >
                <Users className="h-4 w-4 text-green-600" />
                <span className="font-medium text-sm">{team.name}</span>
                <Badge variant="outline" className="text-xs">
                  {team.team_type}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {team.member_count || 0} members
                </Badge>
                {team.lead_user && (
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-xs text-muted-foreground">Lead:</span>
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={team.lead_user.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {team.lead_user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{team.lead_user.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Render child departments */}
        {isExpanded && hasChildren && (
          <div>
            {orgChart?.hierarchy[department.id]?.children.map(childId => {
              const childDept = orgChart.departments.find(d => d.id === childId);
              return childDept ? renderDepartmentNode(childDept, level + 1) : null;
            })}
          </div>
        )}
      </div>
    );
  };

  const renderTeamsView = () => {
    if (!orgChart) return null;

    const teamsByDepartment = orgChart.departments.map(dept => ({
      department: dept,
      teams: orgChart.teams.filter(team => team.department_id === dept.id)
    })).filter(group => group.teams.length > 0);

    return (
      <div className="space-y-6">
        {teamsByDepartment.map(({ department, teams }) => (
          <Card key={department.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {department.name}
                <Badge variant="secondary">{teams.length} teams</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map(team => (
                  <Card key={team.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{team.name}</CardTitle>
                        <Badge 
                          variant={team.team_type === 'permanent' ? 'default' : 
                                  team.team_type === 'project' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {team.team_type}
                        </Badge>
                      </div>
                      {team.description && (
                        <p className="text-xs text-muted-foreground">{team.description}</p>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {team.lead_user && (
                          <div className="flex items-center gap-2">
                            <Crown className="h-3 w-3 text-amber-500" />
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={team.lead_user.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {team.lead_user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{team.lead_user.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          <span className="text-sm">{team.member_count || 0} members</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span className="text-xs text-muted-foreground">
                            Created {new Date(team.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Hierarchy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading organization structure...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Hierarchy
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'chart' | 'list' | 'teams' | 'stats')}>
                <TabsList>
                  <TabsTrigger value="chart">Chart</TabsTrigger>
                  <TabsTrigger value="teams">Teams</TabsTrigger>
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Dialog open={isCreateDeptOpen} onOpenChange={setIsCreateDeptOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" disabled={isDemo}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Department
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Department</DialogTitle>
                    <DialogDescription>
                      Add a new department to your organization structure
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="dept-name">Department Name *</Label>
                      <Input
                        id="dept-name"
                        value={createDeptForm.name}
                        onChange={(e) => setCreateDeptForm({ ...createDeptForm, name: e.target.value })}
                        placeholder="e.g., Information Security"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="dept-description">Description</Label>
                      <Textarea
                        id="dept-description"
                        value={createDeptForm.description}
                        onChange={(e) => setCreateDeptForm({ ...createDeptForm, description: e.target.value })}
                        placeholder="Department purpose and responsibilities"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="parent-dept">Parent Department</Label>
                      <Select 
                        value={createDeptForm.parentDepartmentId || 'none'} 
                        onValueChange={(value) => setCreateDeptForm({ ...createDeptForm, parentDepartmentId: value === 'none' ? '' : value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select parent department (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No parent department</SelectItem>
                          {orgChart?.departments.map(dept => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dept-location">Location</Label>
                        <Input
                          id="dept-location"
                          value={createDeptForm.location}
                          onChange={(e) => setCreateDeptForm({ ...createDeptForm, location: e.target.value })}
                          placeholder="e.g., New York Office"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="dept-budget">Annual Budget</Label>
                        <Input
                          id="dept-budget"
                          type="number"
                          value={createDeptForm.budget}
                          onChange={(e) => setCreateDeptForm({ ...createDeptForm, budget: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setIsCreateDeptOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateDepartment}>
                      Create Department
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" disabled={isDemo}>
                    <Users className="h-4 w-4 mr-2" />
                    Add Team
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Team</DialogTitle>
                    <DialogDescription>
                      Create a new team within a department
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="team-name">Team Name *</Label>
                      <Input
                        id="team-name"
                        value={createTeamForm.name}
                        onChange={(e) => setCreateTeamForm({ ...createTeamForm, name: e.target.value })}
                        placeholder="e.g., Security Operations"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="team-dept">Department *</Label>
                      <Select 
                        value={createTeamForm.departmentId} 
                        onValueChange={(value) => setCreateTeamForm({ ...createTeamForm, departmentId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {orgChart?.departments.map(dept => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="team-type">Team Type</Label>
                      <Select 
                        value={createTeamForm.teamType} 
                        onValueChange={(value: any) => setCreateTeamForm({ ...createTeamForm, teamType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="permanent">Permanent</SelectItem>
                          <SelectItem value="project">Project Team</SelectItem>
                          <SelectItem value="cross_functional">Cross-functional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="team-description">Description</Label>
                      <Textarea
                        id="team-description"
                        value={createTeamForm.description}
                        onChange={(e) => setCreateTeamForm({ ...createTeamForm, description: e.target.value })}
                        placeholder="Team purpose and responsibilities"
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setIsCreateTeamOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTeam}>
                      Create Team
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {activeView === 'chart' && (
            <ScrollArea className="h-96">
              {orgChart?.departments.filter(dept => !dept.parent_department_id).map(dept => 
                renderDepartmentNode(dept)
              )}
            </ScrollArea>
          )}
          
          {activeView === 'teams' && renderTeamsView()}
          
          {activeView === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orgChart?.departments.map(dept => {
                const stats = departmentStats[dept.id];
                return (
                  <Card key={dept.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{dept.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stats && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Total Users:</span>
                            <span className="font-medium">{stats.total_users}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Active Users:</span>
                            <span className="font-medium">{stats.active_users}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Teams:</span>
                            <span className="font-medium">{stats.teams_count}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Compliance:</span>
                            <Badge variant={stats.compliance_score && stats.compliance_score > 80 ? "default" : "secondary"}>
                              {stats.compliance_score || 0}%
                            </Badge>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Department Details Panel */}
      {selectedDepartment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedDepartment.name}
              <Badge variant="outline">Department Details</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedDepartment.description || 'No description provided'}
                  </p>
                </div>
                
                {selectedDepartment.location && (
                  <div>
                    <Label className="text-sm font-medium">Location</Label>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedDepartment.location}
                    </p>
                  </div>
                )}
                
                {selectedDepartment.budget && (
                  <div>
                    <Label className="text-sm font-medium">Annual Budget</Label>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      ${selectedDepartment.budget.toLocaleString()}
                    </p>
                  </div>
                )}
                
                {selectedDepartment.cost_center && (
                  <div>
                    <Label className="text-sm font-medium">Cost Center</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedDepartment.cost_center}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {selectedDepartment.head_user && (
                  <div>
                    <Label className="text-sm font-medium">Department Head</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedDepartment.head_user.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {selectedDepartment.head_user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{selectedDepartment.head_user.name}</p>
                        <p className="text-xs text-muted-foreground">{selectedDepartment.head_user.email}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {departmentStats[selectedDepartment.id] && (
                  <div>
                    <Label className="text-sm font-medium">Statistics</Label>
                    <div className="mt-2 space-y-2">
                      {Object.entries(departmentStats[selectedDepartment.id] || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="capitalize">{key.replace('_', ' ')}:</span>
                          <span className="font-medium">
                            {typeof value === 'number' ? 
                              (key.includes('score') || key.includes('utilization') ? `${value}%` : value.toLocaleString())
                              : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};