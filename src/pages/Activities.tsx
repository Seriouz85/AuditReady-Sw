import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/utils/toast";
import { requirementAssignmentService } from "@/services/assignments/RequirementAssignmentService";
import { RequirementAssignment, UserActivity } from "@/types";
import { 
  CheckCircle, Clock, AlertCircle, Calendar, Search, Filter,
  FileText, User, Tag, ChevronRight, Target, ChevronDown,
  Building, Laptop, MapPin, Server, Network, Monitor
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Fixed TagList import issue
interface Assignment {
  id: string;
  requirementId: string;
  requirementCode: string;
  requirementName: string;
  requirementDescription: string;
  standardId: string;
  standardName: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  fulfillmentLevel?: 'not-fulfilled' | 'partially-fulfilled' | 'fulfilled' | 'not-applicable';
  dueDate?: string;
  assignedBy: string;
  assignedAt: string;
  tags?: string[];
  notes?: string;
}

interface Activity {
  id: string;
  activityType: 'assignment' | 'completion' | 'update' | 'comment';
  entityType: 'requirement' | 'assessment' | 'guidance';
  entityId: string;
  description: string;
  createdAt: string;
  metadata?: any;
}

// Demo data for demo accounts - Enhanced to showcase grouping
const demoAssignments: Assignment[] = [
  // Organization Requirements (8 items)
  {
    id: 'demo-assignment-1',
    requirementId: 'iso-27001-A5.1',
    requirementCode: 'A.5.1',
    requirementName: 'Policies for information security',
    requirementDescription: 'Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties, and reviewed at planned intervals and if significant changes occur.',
    standardId: 'iso-27002-2022',
    standardName: 'ISO 27002:2022',
    status: 'assigned',
    priority: 'high',
    fulfillmentLevel: 'not-fulfilled',
    dueDate: '2025-01-15',
    assignedBy: 'Demo CISO',
    assignedAt: '2025-01-06T10:00:00Z',
    tags: ['organizations'],
    notes: 'Focus on implementing comprehensive information security policies aligned with organizational objectives.'
  },
  {
    id: 'demo-assignment-2',
    requirementId: 'iso-27001-A6.1',
    requirementCode: 'A.6.1',
    requirementName: 'Personnel screening',
    requirementDescription: 'Background verification checks on all candidates for employment shall be carried out in accordance with relevant laws, regulations and ethics.',
    standardId: 'iso-27002-2022',
    standardName: 'ISO 27002:2022',
    status: 'in_progress',
    priority: 'medium',
    fulfillmentLevel: 'partially-fulfilled',
    dueDate: '2025-01-20',
    assignedBy: 'HR Director',
    assignedAt: '2025-01-04T14:30:00Z',
    tags: ['organizations'],
    notes: 'Coordinate with HR for background check procedures.'
  },
  {
    id: 'demo-assignment-3',
    requirementId: 'iso-27001-A7.1',
    requirementCode: 'A.7.1',
    requirementName: 'Prior to employment',
    requirementDescription: 'Security responsibilities and duties shall be defined and allocated to personnel.',
    standardId: 'iso-27002-2022',
    standardName: 'ISO 27002:2022',
    status: 'assigned',
    priority: 'medium',
    fulfillmentLevel: 'not-fulfilled',
    dueDate: '2025-02-01',
    assignedBy: 'CISO',
    assignedAt: '2025-01-05T09:00:00Z',
    tags: ['organizations']
  },
  {
    id: 'demo-assignment-4',
    requirementId: 'iso-27001-A12.1',
    requirementCode: 'A.12.1',
    requirementName: 'Event logging',
    requirementDescription: 'Event logs recording user activities, exceptions and information security events shall be produced and kept.',
    standardId: 'iso-27002-2022',
    standardName: 'ISO 27002:2022',
    status: 'overdue',
    priority: 'high',
    fulfillmentLevel: 'not-fulfilled',
    dueDate: '2025-01-05',
    assignedBy: 'IT Manager',
    assignedAt: '2025-01-02T11:00:00Z',
    tags: ['organizations']
  },

  // Applications/Systems Requirements (5 items)
  {
    id: 'demo-assignment-5',
    requirementId: 'iso-27001-A8.9',
    requirementCode: 'A.8.9',
    requirementName: 'Configuration management',
    requirementDescription: 'Configurations, including security configurations, of hardware, software, services and networks shall be established.',
    standardId: 'iso-27002-2022',
    standardName: 'ISO 27002:2022',
    status: 'in_progress',
    priority: 'high',
    fulfillmentLevel: 'partially-fulfilled',
    dueDate: '2025-01-18',
    assignedBy: 'DevOps Lead',
    assignedAt: '2025-01-03T08:30:00Z',
    tags: ['applications_systems']
  },
  {
    id: 'demo-assignment-6',
    requirementId: 'iso-27001-A8.14',
    requirementCode: 'A.8.14',
    requirementName: 'Data transfer',
    requirementDescription: 'Information transfer rules, procedures, or agreements shall be in place for all types of transfer facilities.',
    standardId: 'iso-27002-2022',
    standardName: 'ISO 27002:2022',
    status: 'assigned',
    priority: 'medium',
    fulfillmentLevel: 'not-fulfilled',
    dueDate: '2025-02-05',
    assignedBy: 'Data Officer',
    assignedAt: '2025-01-06T15:00:00Z',
    tags: ['applications_systems']
  },
  {
    id: 'demo-assignment-7',
    requirementId: 'iso-27001-A14.1',
    requirementCode: 'A.14.1',
    requirementName: 'Information security in development',
    requirementDescription: 'Information security shall be implemented in development and support processes.',
    standardId: 'iso-27002-2022',
    standardName: 'ISO 27002:2022',
    status: 'completed',
    priority: 'high',
    fulfillmentLevel: 'fulfilled',
    dueDate: '2025-01-12',
    assignedBy: 'CTO',
    assignedAt: '2025-01-01T12:00:00Z',
    tags: ['applications_systems']
  },

  // Device Requirements (4 items)
  {
    id: 'demo-assignment-8',
    requirementId: 'iso-27001-A8.1',
    requirementCode: 'A.8.1',
    requirementName: 'User end point devices',
    requirementDescription: 'Information stored on, processed by or accessible via user end point devices shall be protected.',
    standardId: 'iso-27002-2022',
    standardName: 'ISO 27002:2022',
    status: 'completed',
    priority: 'high',
    fulfillmentLevel: 'fulfilled',
    dueDate: '2025-01-10',
    assignedBy: 'IT Security',
    assignedAt: '2025-01-02T09:15:00Z',
    tags: ['devices_clients']
  },
  {
    id: 'demo-assignment-9',
    requirementId: 'iso-27001-A8.2',
    requirementCode: 'A.8.2',
    requirementName: 'Privileged access rights',
    requirementDescription: 'The allocation and use of privileged access rights shall be restricted and controlled.',
    standardId: 'iso-27002-2022',
    standardName: 'ISO 27002:2022',
    status: 'in_progress',
    priority: 'critical',
    fulfillmentLevel: 'partially-fulfilled',
    dueDate: '2025-01-25',
    assignedBy: 'CISO',
    assignedAt: '2025-01-05T10:00:00Z',
    tags: ['devices_servers']
  },
  {
    id: 'demo-assignment-10',
    requirementId: 'iso-27001-A13.1',
    requirementCode: 'A.13.1',
    requirementName: 'Network controls',
    requirementDescription: 'Networks shall be controlled and protected to protect information in systems and applications.',
    standardId: 'iso-27002-2022',
    standardName: 'ISO 27002:2022',
    status: 'assigned',
    priority: 'high',
    fulfillmentLevel: 'not-fulfilled',
    dueDate: '2025-01-30',
    assignedBy: 'Network Admin',
    assignedAt: '2025-01-06T14:00:00Z',
    tags: ['devices_networks']
  },

  // Location Requirements (2 items)
  {
    id: 'demo-assignment-11',
    requirementId: 'iso-27001-A11.1',
    requirementCode: 'A.11.1',
    requirementName: 'Physical security perimeters',
    requirementDescription: 'Physical security perimeters shall be defined and used to protect areas that contain information and other associated assets.',
    standardId: 'iso-27002-2022',
    standardName: 'ISO 27002:2022',
    status: 'assigned',
    priority: 'medium',
    fulfillmentLevel: 'not-fulfilled',
    dueDate: '2025-02-10',
    assignedBy: 'Facilities Manager',
    assignedAt: '2025-01-07T08:00:00Z',
    tags: ['locations']
  },
  {
    id: 'demo-assignment-12',
    requirementId: 'iso-27001-A11.2',
    requirementCode: 'A.11.2',
    requirementName: 'Physical entry',
    requirementDescription: 'Secure areas shall be protected by appropriate entry controls to ensure that only authorized personnel are allowed access.',
    standardId: 'iso-27002-2022',
    standardName: 'ISO 27002:2022',
    status: 'in_progress',
    priority: 'medium',
    fulfillmentLevel: 'partially-fulfilled',
    dueDate: '2025-02-15',
    assignedBy: 'Security Manager',
    assignedAt: '2025-01-04T16:30:00Z',
    tags: ['locations']
  }
];

const demoActivities: Activity[] = [
  {
    id: 'demo-activity-1',
    activityType: 'assignment',
    entityType: 'requirement',
    entityId: 'iso-27001-A5.1',
    description: 'Assigned requirement A.5.1 - Policies for information security',
    createdAt: '2025-01-06T10:00:00Z',
    metadata: { assignedBy: 'Demo CISO', priority: 'high' }
  },
  {
    id: 'demo-activity-2',
    activityType: 'completion',
    entityType: 'requirement',
    entityId: 'iso-27001-A8.1',
    description: 'Completed requirement A.8.1 - User end point devices',
    createdAt: '2025-01-10T16:45:00Z',
    metadata: { completedAhead: true }
  },
  {
    id: 'demo-activity-3',
    activityType: 'update',
    entityType: 'requirement',
    entityId: 'iso-27001-A6.1',
    description: 'Updated progress on A.6.1 - Screening',
    createdAt: '2025-01-05T11:20:00Z',
    metadata: { statusChanged: 'in_progress' }
  }
];

const Activities = () => {
  const { user, organization, isDemo } = useAuth();
  const [activeTab, setActiveTab] = useState('my-assignments');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Load assignments and activities for the logged-in user
  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user?.id, isDemo]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      if (isDemo) {
        // Load demo data including any new assignments from our service
        const demoOrgId = 'demo-org-1';
        const demoUserId = user?.id || 'demo-user-1';
        
        // Get assignments from our service
        const serviceAssignments = await requirementAssignmentService.getUserAssignments(demoUserId, demoOrgId);
        
        // Convert to Activity page format
        const convertedAssignments = serviceAssignments.map(assignment => ({
          id: assignment.id,
          requirementId: assignment.requirementId,
          requirementCode: assignment.requirementCode,
          requirementName: assignment.requirementName,
          requirementDescription: assignment.requirementName,
          standardId: assignment.standardId,
          standardName: assignment.standardName,
          status: assignment.status === 'pending' ? 'assigned' as const : assignment.status as 'assigned' | 'in_progress' | 'completed' | 'overdue',
          priority: 'medium' as const,
          dueDate: assignment.dueDate,
          assignedBy: assignment.assignedByUserName,
          assignedAt: assignment.assignedAt,
          notes: assignment.notes
        }));

        // Get activities from our service
        const serviceActivities = await requirementAssignmentService.getUserActivities(demoUserId);
        
        // Convert to Activity page format
        const convertedActivities = serviceActivities.map(activity => ({
          id: activity.id,
          activityType: activity.type === 'requirement_assigned' ? 'assignment' as const : 'completion' as const,
          entityType: activity.entityType,
          entityId: activity.entityId,
          description: activity.description,
          createdAt: activity.createdAt,
          metadata: {
            title: activity.title,
            status: activity.status
          }
        }));

        // Combine with existing demo data
        setAssignments([...demoAssignments, ...convertedAssignments]);
        setActivities([...demoActivities, ...convertedActivities]);
      } else {
        // For real accounts, load from assignment service
        if (user?.id && organization?.id) {
          const userAssignments = await requirementAssignmentService.getUserAssignments(user.id, organization.id);
          const userActivities = await requirementAssignmentService.getUserActivities(user.id);
          
          // Convert to Activity page format
          const convertedAssignments = userAssignments.map(assignment => ({
            id: assignment.id,
            requirementId: assignment.requirementId,
            requirementCode: assignment.requirementCode,
            requirementName: assignment.requirementName,
            requirementDescription: assignment.requirementName,
            standardId: assignment.standardId,
            standardName: assignment.standardName,
            status: assignment.status === 'pending' ? 'assigned' as const : assignment.status as 'assigned' | 'in_progress' | 'completed' | 'overdue',
            priority: 'medium' as const,
            dueDate: assignment.dueDate,
            assignedBy: assignment.assignedByUserName,
            assignedAt: assignment.assignedAt,
            notes: assignment.notes
          }));

          const convertedActivities = userActivities.map(activity => ({
            id: activity.id,
            activityType: activity.type === 'requirement_assigned' ? 'assignment' as const : 'completion' as const,
            entityType: activity.entityType,
            entityId: activity.entityId,
            description: activity.description,
            createdAt: activity.createdAt,
            metadata: {
              title: activity.title,
              status: activity.status
            }
          }));

          setAssignments(convertedAssignments);
          setActivities(convertedActivities);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (assignmentId: string, newStatus: string) => {
    try {
      // Update using our assignment service
      const updatedAssignment = await requirementAssignmentService.updateAssignmentStatus(
        assignmentId,
        newStatus as RequirementAssignment['status']
      );

      if (updatedAssignment) {
        // Update local state
        setAssignments(prev => prev.map(assignment => 
          assignment.id === assignmentId 
            ? { ...assignment, status: newStatus as any }
            : assignment
        ));
        
        // Reload activities to show any new activity records
        await loadUserData();
        
        toast.success('Status updated successfully');
      } else {
        toast.error('Assignment not found');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleFulfillmentLevelUpdate = async (assignmentId: string, newFulfillmentLevel: string) => {
    try {
      if (isDemo) {
        // Update demo data
        setAssignments(prev => prev.map(assignment => 
          assignment.id === assignmentId 
            ? { ...assignment, fulfillmentLevel: newFulfillmentLevel as any }
            : assignment
        ));
        toast.success('Fulfillment level updated successfully');
      } else {
        // TODO: API call to update real assignment fulfillment level
        toast.success('Fulfillment level updated successfully');
      }
    } catch (error) {
      console.error('Error updating fulfillment level:', error);
      toast.error('Failed to update fulfillment level');
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.requirementName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.requirementCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.standardName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || assignment.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFulfillmentLevelColor = (level: string) => {
    switch (level) {
      case 'fulfilled': return 'bg-green-100 text-green-800 border-green-200';
      case 'partially-fulfilled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'not-fulfilled': return 'bg-red-100 text-red-800 border-red-200';
      case 'not-applicable': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFulfillmentLevelLabel = (level: string) => {
    switch (level) {
      case 'fulfilled': return 'Fulfilled';
      case 'partially-fulfilled': return 'Partially Fulfilled';
      case 'not-fulfilled': return 'Not Fulfilled';
      case 'not-applicable': return 'Not Applicable';
      default: return 'Not Set';
    }
  };

  // Grouping functions
  const getGroupConfig = () => ({
    organizations: {
      label: 'Organization Requirements',
      icon: <Building className="h-5 w-5" />,
      description: 'Requirements that apply to your organization as a whole',
      color: 'border-blue-200 bg-blue-50/30'
    },
    applications_systems: {
      label: 'Applications/Systems Requirements',
      icon: <Laptop className="h-5 w-5" />,
      description: 'Requirements for software applications and systems',
      color: 'border-green-200 bg-green-50/30'
    },
    locations: {
      label: 'Location Requirements',
      icon: <MapPin className="h-5 w-5" />,
      description: 'Requirements for physical locations and facilities',
      color: 'border-purple-200 bg-purple-50/30'
    },
    devices_servers: {
      label: 'Server Requirements',
      icon: <Server className="h-5 w-5" />,
      description: 'Requirements for server infrastructure',
      color: 'border-orange-200 bg-orange-50/30'
    },
    devices_networks: {
      label: 'Network Requirements',
      icon: <Network className="h-5 w-5" />,
      description: 'Requirements for network infrastructure',
      color: 'border-cyan-200 bg-cyan-50/30'
    },
    devices_clients: {
      label: 'Client Device Requirements',
      icon: <Monitor className="h-5 w-5" />,
      description: 'Requirements for client devices and endpoints',
      color: 'border-indigo-200 bg-indigo-50/30'
    }
  });

  const groupAssignmentsByAppliesTo = (assignments: Assignment[]) => {
    const groups: Record<string, Assignment[]> = {};
    const groupConfig = getGroupConfig();
    
    // Initialize all groups
    Object.keys(groupConfig).forEach(key => {
      groups[key] = [];
    });

    // Group assignments by their first applies-to tag
    assignments.forEach(assignment => {
      if (assignment.tags && assignment.tags.length > 0) {
        const appliesTo = assignment.tags[0]; // Use first tag as primary group
        if (groups[appliesTo]) {
          groups[appliesTo].push(assignment);
        }
      }
    });

    return groups;
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  const getGroupStats = (assignments: Assignment[]) => {
    const stats = {
      total: assignments.length,
      completed: assignments.filter(a => a.status === 'completed').length,
      overdue: assignments.filter(a => isOverdue(a.dueDate) && a.status !== 'completed').length,
      inProgress: assignments.filter(a => a.status === 'in_progress').length
    };
    return stats;
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Activities</h1>
          <p className="text-muted-foreground">
            Track your assigned requirements and recent activity
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-assignments">
            My Assignments
            {assignments.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {assignments.filter(a => a.status !== 'completed').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="recent-activity">
            Recent Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-assignments" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assignments..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignments List */}
          <div className="space-y-4">
{filteredAssignments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No assignments found</h3>
                  <p className="text-muted-foreground text-center">
                    {assignments.length === 0 
                      ? "You don't have any assignments yet. Check back later or contact your administrator."
                      : "No assignments match your current filters. Try adjusting your search criteria."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              (() => {
                const groupedAssignments = groupAssignmentsByAppliesTo(filteredAssignments);
                const groupConfig = getGroupConfig();
                
                return (
                  <div className="space-y-4">
                    {Object.entries(groupedAssignments).map(([groupKey, groupAssignments]) => {
                      if (groupAssignments.length === 0) return null;
                      
                      const config = groupConfig[groupKey];
                      const stats = getGroupStats(groupAssignments);
                      const isExpanded = expandedGroups.has(groupKey);
                      
                      return (
                        <Card key={groupKey} className={`transition-all ${config.color}`}>
                          <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(groupKey)}>
                            <CollapsibleTrigger asChild>
                              <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white/60 border">
                                      {config.icon}
                                    </div>
                                    <div>
                                      <CardTitle className="text-lg flex items-center gap-2">
                                        {config.label}
                                        <Badge variant="secondary">{stats.total}</Badge>
                                      </CardTitle>
                                      <CardDescription>
                                        {config.description}
                                        {stats.overdue > 0 && (
                                          <span className="text-red-600 ml-2">
                                            • {stats.overdue} overdue
                                          </span>
                                        )}
                                      </CardDescription>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-right text-sm">
                                      <div className="font-medium">
                                        {stats.completed}/{stats.total} completed
                                      </div>
                                      <div className="text-muted-foreground text-xs">
                                        {stats.inProgress} in progress
                                      </div>
                                    </div>
                                    {isExpanded ? (
                                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent>
                              <CardContent className="pt-0">
                                <div className="space-y-3">
                                  {groupAssignments.map((assignment) => (
                                    <Card key={assignment.id} className={`transition-all hover:shadow-sm ${
                                      isOverdue(assignment.dueDate) && assignment.status !== 'completed' 
                                        ? 'border-red-200 bg-red-50/30' 
                                        : 'bg-white/50'
                                    }`}>
                                      <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                              {getStatusIcon(assignment.status)}
                                              <CardTitle className="text-base">
                                                {assignment.requirementCode} - {assignment.requirementName}
                                              </CardTitle>
                                            </div>
                                            <CardDescription className="flex items-center gap-2">
                                              <Badge variant="outline">{assignment.standardName}</Badge>
                                              <span>•</span>
                                              <span>Assigned by {assignment.assignedBy}</span>
                                            </CardDescription>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Badge className={getPriorityColor(assignment.priority)}>
                                              {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)}
                                            </Badge>
                                            {assignment.dueDate && (
                                              <Badge variant={isOverdue(assignment.dueDate) ? "destructive" : "secondary"}>
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {new Date(assignment.dueDate).toLocaleDateString()}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </CardHeader>
                                      <CardContent className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                          {assignment.requirementDescription}
                                        </p>
                                        
                                        {assignment.notes && (
                                          <div className="bg-muted/50 p-3 rounded-md">
                                            <div className="flex items-center gap-2 mb-1">
                                              <FileText className="h-4 w-4 text-muted-foreground" />
                                              <span className="text-sm font-medium">Assignment Notes:</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{assignment.notes}</p>
                                          </div>
                                        )}
                                        
                                        {/* Status and Fulfillment Section */}
                                        <div className="space-y-3 pt-2">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm text-muted-foreground">Status:</span>
                                              <Badge variant={
                                                assignment.status === 'completed' ? 'default' :
                                                assignment.status === 'in_progress' ? 'secondary' :
                                                assignment.status === 'overdue' ? 'destructive' :
                                                'outline'
                                              }>
                                                {assignment.status.replace('_', ' ').charAt(0).toUpperCase() + assignment.status.slice(1).replace('_', ' ')}
                                              </Badge>
                                            </div>
                                            
                                            {assignment.status !== 'completed' && (
                                              <div className="flex gap-2">
                                                {assignment.status === 'assigned' && (
                                                  <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => handleStatusUpdate(assignment.id, 'in_progress')}
                                                  >
                                                    Start Work
                                                  </Button>
                                                )}
                                                {assignment.status === 'in_progress' && (
                                                  <Button 
                                                    size="sm"
                                                    onClick={() => handleStatusUpdate(assignment.id, 'completed')}
                                                  >
                                                    Mark Complete
                                                  </Button>
                                                )}
                                                <Button size="sm" variant="ghost">
                                                  <ChevronRight className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                          
                                          {/* Fulfillment Level Dropdown */}
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm text-muted-foreground">Fulfillment Level:</span>
                                              <Badge className={getFulfillmentLevelColor(assignment.fulfillmentLevel || 'not-fulfilled')}>
                                                {getFulfillmentLevelLabel(assignment.fulfillmentLevel || 'not-fulfilled')}
                                              </Badge>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs text-muted-foreground">Update:</span>
                                              <Select
                                                value={assignment.fulfillmentLevel || 'not-fulfilled'}
                                                onValueChange={(value) => handleFulfillmentLevelUpdate(assignment.id, value)}
                                              >
                                                <SelectTrigger className="w-40 h-8 text-xs">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="not-fulfilled">Not Fulfilled</SelectItem>
                                                  <SelectItem value="partially-fulfilled">Partially Fulfilled</SelectItem>
                                                  <SelectItem value="fulfilled">Fulfilled</SelectItem>
                                                  <SelectItem value="not-applicable">Not Applicable</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </CardContent>
                            </CollapsibleContent>
                          </Collapsible>
                        </Card>
                      );
                    })}
                  </div>
                );
              })()
            )}
          </div>
        </TabsContent>

        <TabsContent value="recent-activity" className="space-y-4">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
                  <p className="text-muted-foreground">
                    Your activity history will appear here as you work on assignments.
                  </p>
                </CardContent>
              </Card>
            ) : (
              activities.map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {activity.activityType === 'assignment' && <Target className="h-4 w-4 text-blue-500" />}
                        {activity.activityType === 'completion' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {activity.activityType === 'update' && <Clock className="h-4 w-4 text-orange-500" />}
                        {activity.activityType === 'comment' && <FileText className="h-4 w-4 text-purple-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Activities;