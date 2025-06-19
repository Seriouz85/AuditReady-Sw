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
  FileText, User, Tag, ChevronRight, Target
} from "lucide-react";
import { TagList } from "@/components/ui/tag-selector";

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

// Demo data for demo accounts
const demoAssignments: Assignment[] = [
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
    tags: ['tag-organizational', 'tag-organization'],
    notes: 'Focus on implementing comprehensive information security policies aligned with organizational objectives.'
  },
  {
    id: 'demo-assignment-2',
    requirementId: 'iso-27001-A6.1',
    requirementCode: 'A.6.1',
    requirementName: 'Screening',
    requirementDescription: 'Background verification checks on all candidates for employment shall be carried out in accordance with relevant laws, regulations and ethics and shall be proportional to the business requirements, the classification of the information to be accessed and the perceived risks.',
    standardId: 'iso-27002-2022',
    standardName: 'ISO 27002:2022',
    status: 'in_progress',
    priority: 'medium',
    fulfillmentLevel: 'partially-fulfilled',
    dueDate: '2025-01-20',
    assignedBy: 'Demo Admin',
    assignedAt: '2025-01-04T14:30:00Z',
    tags: ['tag-awareness', 'tag-organization']
  },
  {
    id: 'demo-assignment-3',
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
    assignedBy: 'Demo CISO',
    assignedAt: '2025-01-02T09:15:00Z',
    tags: ['tag-endpoint', 'tag-device']
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
              filteredAssignments.map((assignment) => (
                <Card key={assignment.id} className={`transition-all hover:shadow-md ${
                  isOverdue(assignment.dueDate) && assignment.status !== 'completed' 
                    ? 'border-red-200 bg-red-50/30' 
                    : ''
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(assignment.status)}
                          <CardTitle className="text-lg">
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
                    
                    {assignment.tags && assignment.tags.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <TagList tagIds={assignment.tags} />
                      </div>
                    )}
                    
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
              ))
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