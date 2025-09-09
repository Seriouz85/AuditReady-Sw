/**
 * Approval Workflow Manager
 * Advanced workflow system for content approval with validation steps
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Eye,
  Edit,
  Send,
  RefreshCw,
  Search,
  User,
  Shield,
  GitBranch,
  Target,
  Activity,
  TrendingUp,
  Copy
} from 'lucide-react';
import { RequirementValidationService, type ValidationResult } from '@/services/rag/RequirementValidationService';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ApprovalItem {
  id: string;
  type: 'source' | 'guidance' | 'content' | 'template';
  title: string;
  description: string;
  category: string;
  content: string;
  submittedAt: string;
  submittedBy: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'changes_requested';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  validationResults?: ValidationResult;
  comments: ApprovalComment[];
  metadata: {
    frameworks: string[];
    estimatedReviewTime: number;
    complexity: 'basic' | 'intermediate' | 'advanced';
    riskLevel: 'low' | 'medium' | 'high';
    autoChecks: {
      passed: number;
      total: number;
      details: string[];
    };
  };
  workflow: {
    currentStep: number;
    totalSteps: number;
    steps: WorkflowStep[];
  };
}

interface ApprovalComment {
  id: string;
  userId: string;
  userEmail: string;
  content: string;
  type: 'comment' | 'suggestion' | 'approval' | 'rejection';
  createdAt: string;
  isResolved: boolean;
  attachments?: string[];
}

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'validation' | 'review' | 'approval' | 'notification';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  assignee?: string;
  completedAt?: string;
  completedBy?: string;
  automated: boolean;
  required: boolean;
  estimatedTime: number;
  dependencies: string[];
}

interface ApprovalRule {
  id: string;
  name: string;
  description: string;
  type: 'content_type' | 'priority' | 'category' | 'quality_score';
  condition: string;
  action: 'auto_approve' | 'require_review' | 'escalate' | 'reject';
  reviewers: string[];
  enabled: boolean;
  createdAt: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  contentTypes: string[];
  steps: Omit<WorkflowStep, 'status' | 'completedAt' | 'completedBy'>[];
  autoAssignRules: {
    condition: string;
    assignee: string;
  }[];
  estimatedDuration: number;
  isDefault: boolean;
}

interface ApprovalMetrics {
  totalItems: number;
  pendingItems: number;
  avgReviewTime: number;
  approvalRate: number;
  topReviewers: { email: string; count: number; avgTime: number }[];
  categoryBreakdown: { category: string; count: number; approvalRate: number }[];
  weeklyTrend: { week: string; submitted: number; approved: number }[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ApprovalWorkflowManager() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('queue');
  
  // State management
  const [approvalItems, setApprovalItems] = useState<ApprovalItem[]>([]);
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>([]);
  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplate[]>([]);
  const [metrics, setMetrics] = useState<ApprovalMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  
  // Dialog states
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  
  // Form states
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | 'request_changes'>('approve');
  const [approvalComment, setApprovalComment] = useState('');

  // Load data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadApprovalItems(),
        loadApprovalRules(),
        loadWorkflowTemplates(),
        loadMetrics()
      ]);
    } catch (error) {
      console.error('Failed to load approval workflow data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadApprovalItems = async () => {
    // Mock approval items with comprehensive data
    const mockItems: ApprovalItem[] = [
      {
        id: 'approval_1',
        type: 'guidance',
        title: 'Enhanced Access Control Implementation Guide',
        description: 'Comprehensive guidance for implementing advanced access control mechanisms',
        category: 'Access Control & Identity Management',
        content: 'Access control is fundamental to information security...',
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        submittedBy: 'content.ai@system.com',
        status: 'in_review',
        priority: 'high',
        assignedTo: user?.email,
        reviewedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        reviewedBy: user?.email,
        validationResults: {
          score: 0.85,
          checks: [
            { name: 'Content Quality', passed: true, score: 0.9, details: 'High quality content', severity: 'low', category: 'quality' },
            { name: 'Framework Coverage', passed: true, score: 0.8, details: 'Good framework coverage', severity: 'low', category: 'compliance' },
            { name: 'Technical Accuracy', passed: false, score: 0.7, details: 'Minor technical issues', severity: 'medium', category: 'content' }
          ],
          recommendations: ['Review technical implementation details', 'Add more specific examples'],
          confidence: 0.8,
          isValid: true,
          metadata: {
            processingTime: 1500,
            validatedAt: new Date().toISOString(),
            validator: 'AI-ValidationService'
          }
        },
        comments: [
          {
            id: 'comment_1',
            userId: 'reviewer_1',
            userEmail: user?.email || 'reviewer@auditready.com',
            content: 'Overall good content, but needs more specific implementation examples.',
            type: 'suggestion',
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            isResolved: false
          }
        ],
        metadata: {
          frameworks: ['ISO 27001', 'NIST CSF', 'CIS Controls'],
          estimatedReviewTime: 45,
          complexity: 'intermediate',
          riskLevel: 'medium',
          autoChecks: {
            passed: 8,
            total: 10,
            details: ['Grammar check passed', 'Compliance terminology validated', 'Structure check failed']
          }
        },
        workflow: {
          currentStep: 2,
          totalSteps: 4,
          steps: [
            {
              id: 'step_1',
              name: 'Automated Validation',
              description: 'AI-powered content validation',
              type: 'validation',
              status: 'completed',
              automated: true,
              required: true,
              estimatedTime: 5,
              dependencies: [],
              completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              completedBy: 'system'
            },
            {
              id: 'step_2',
              name: 'Expert Review',
              description: 'Subject matter expert review',
              type: 'review',
              status: 'in_progress',
              automated: false,
              required: true,
              estimatedTime: 45,
              dependencies: ['step_1'],
              assignee: user?.email || undefined
            },
            {
              id: 'step_3',
              name: 'Compliance Approval',
              description: 'Final compliance approval',
              type: 'approval',
              status: 'pending',
              automated: false,
              required: true,
              estimatedTime: 30,
              dependencies: ['step_2'],
              assignee: 'compliance@auditready.com'
            },
            {
              id: 'step_4',
              name: 'Publication',
              description: 'Content publication and notification',
              type: 'notification',
              status: 'pending',
              automated: true,
              required: true,
              estimatedTime: 5,
              dependencies: ['step_3']
            }
          ]
        }
      },
      {
        id: 'approval_2',
        type: 'source',
        title: 'NIST Cybersecurity Framework Update',
        description: 'New knowledge source from NIST with updated cybersecurity guidelines',
        category: 'Risk Management & Assessment',
        content: 'https://nist.gov/cybersecurity/framework/2.0',
        submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        submittedBy: 'admin@auditready.com',
        status: 'pending',
        priority: 'critical',
        comments: [],
        metadata: {
          frameworks: ['NIST CSF'],
          estimatedReviewTime: 30,
          complexity: 'advanced',
          riskLevel: 'low',
          autoChecks: {
            passed: 10,
            total: 10,
            details: ['URL validation passed', 'Domain authority verified', 'Security scan passed']
          }
        },
        workflow: {
          currentStep: 1,
          totalSteps: 3,
          steps: [
            {
              id: 'step_1',
              name: 'Source Validation',
              description: 'Validate knowledge source quality and safety',
              type: 'validation',
              status: 'in_progress',
              automated: true,
              required: true,
              estimatedTime: 10,
              dependencies: []
            },
            {
              id: 'step_2',
              name: 'Content Review',
              description: 'Review source content relevance',
              type: 'review',
              status: 'pending',
              automated: false,
              required: true,
              estimatedTime: 20,
              dependencies: ['step_1']
            },
            {
              id: 'step_3',
              name: 'Ingestion Approval',
              description: 'Approve for knowledge ingestion',
              type: 'approval',
              status: 'pending',
              automated: false,
              required: true,
              estimatedTime: 15,
              dependencies: ['step_2']
            }
          ]
        }
      }
    ];

    setApprovalItems(mockItems);
  };

  const loadApprovalRules = async () => {
    // Mock approval rules
    const mockRules: ApprovalRule[] = [
      {
        id: 'rule_1',
        name: 'Auto-approve high-quality AI content',
        description: 'Automatically approve AI-generated content with quality score > 0.9',
        type: 'quality_score',
        condition: 'quality_score > 0.9 AND type = "guidance" AND source = "ai"',
        action: 'auto_approve',
        reviewers: [],
        enabled: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'rule_2',
        name: 'Critical priority escalation',
        description: 'Escalate critical priority items to senior reviewers',
        type: 'priority',
        condition: 'priority = "critical"',
        action: 'escalate',
        reviewers: ['senior@auditready.com', 'ciso@auditready.com'],
        enabled: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'rule_3',
        name: 'Low-quality content rejection',
        description: 'Automatically reject content with quality score < 0.5',
        type: 'quality_score',
        condition: 'quality_score < 0.5',
        action: 'reject',
        reviewers: [],
        enabled: true,
        createdAt: new Date().toISOString()
      }
    ];

    setApprovalRules(mockRules);
  };

  const loadWorkflowTemplates = async () => {
    // Mock workflow templates
    const mockTemplates: WorkflowTemplate[] = [
      {
        id: 'template_1',
        name: 'Standard Guidance Review',
        description: 'Standard workflow for guidance content approval',
        contentTypes: ['guidance'],
        steps: [
          {
            id: 'step_1',
            name: 'Automated Validation',
            description: 'AI-powered content validation',
            type: 'validation',
            automated: true,
            required: true,
            estimatedTime: 5,
            dependencies: []
          },
          {
            id: 'step_2',
            name: 'Expert Review',
            description: 'Subject matter expert review',
            type: 'review',
            automated: false,
            required: true,
            estimatedTime: 45,
            dependencies: ['step_1']
          },
          {
            id: 'step_3',
            name: 'Compliance Approval',
            description: 'Final compliance approval',
            type: 'approval',
            automated: false,
            required: true,
            estimatedTime: 30,
            dependencies: ['step_2']
          }
        ],
        autoAssignRules: [
          { condition: 'category = "Access Control"', assignee: 'access-expert@auditready.com' },
          { condition: 'category = "Risk Management"', assignee: 'risk-expert@auditready.com' }
        ],
        estimatedDuration: 80,
        isDefault: true
      }
    ];

    setWorkflowTemplates(mockTemplates);
  };

  const loadMetrics = async () => {
    // Mock metrics
    const mockMetrics: ApprovalMetrics = {
      totalItems: 156,
      pendingItems: 23,
      avgReviewTime: 42,
      approvalRate: 0.87,
      topReviewers: [
        { email: 'expert1@auditready.com', count: 45, avgTime: 35 },
        { email: 'expert2@auditready.com', count: 38, avgTime: 42 },
        { email: 'expert3@auditready.com', count: 31, avgTime: 48 }
      ],
      categoryBreakdown: [
        { category: 'Access Control', count: 28, approvalRate: 0.92 },
        { category: 'Risk Management', count: 24, approvalRate: 0.85 },
        { category: 'Data Protection', count: 22, approvalRate: 0.88 }
      ],
      weeklyTrend: [
        { week: 'Week 1', submitted: 15, approved: 12 },
        { week: 'Week 2', submitted: 18, approved: 16 },
        { week: 'Week 3', submitted: 22, approved: 19 },
        { week: 'Week 4', submitted: 20, approved: 18 }
      ]
    };

    setMetrics(mockMetrics);
  };

  // Event handlers
  const handleApprovalAction = async (action: 'approve' | 'reject' | 'request_changes') => {
    if (!selectedItem) return;

    try {
      const updatedItem = { ...selectedItem };
      const now = new Date().toISOString();

      switch (action) {
        case 'approve':
          updatedItem.status = 'approved';
          updatedItem.approvedAt = now;
          updatedItem.approvedBy = user?.email || undefined;
          break;
        case 'reject':
          updatedItem.status = 'rejected';
          updatedItem.reviewedAt = now;
          updatedItem.reviewedBy = user?.email || undefined;
          break;
        case 'request_changes':
          updatedItem.status = 'changes_requested';
          updatedItem.reviewedAt = now;
          updatedItem.reviewedBy = user?.email || undefined;
          break;
      }

      // Add comment if provided
      if (approvalComment.trim()) {
        updatedItem.comments.push({
          id: `comment_${Date.now()}`,
          userId: user?.id || 'unknown',
          userEmail: user?.email || 'unknown',
          content: approvalComment,
          type: action === 'approve' ? 'approval' : action === 'reject' ? 'rejection' : 'suggestion',
          createdAt: now,
          isResolved: false
        });
      }

      // Update workflow step
      const currentStep = updatedItem.workflow.steps[updatedItem.workflow.currentStep - 1];
      if (currentStep) {
        currentStep.status = action === 'approve' ? 'completed' : 'failed';
        currentStep.completedAt = now;
        currentStep.completedBy = user?.email || undefined;
        
        if (action === 'approve' && updatedItem.workflow.currentStep < updatedItem.workflow.totalSteps) {
          updatedItem.workflow.currentStep += 1;
        }
      }

      // Update items
      setApprovalItems(prev => prev.map(item => 
        item.id === selectedItem.id ? updatedItem : item
      ));

      setShowApprovalDialog(false);
      setApprovalComment('');
      setSelectedItem(null);

      toast.success(`Item ${action}d successfully`);

      // Reload metrics
      await loadMetrics();

    } catch (error) {
      console.error('Approval action failed:', error);
      toast.error('Failed to process approval');
    }
  };

  // Removed unused handleBulkAction function

  const handleValidateItem = async (item: ApprovalItem) => {
    try {
      toast.info('Running validation...');
      
      const result = await RequirementValidationService.validateContent(
        item.content,
        item.type as 'source' | 'guidance'
      );

      const updatedItem = { ...item, validationResults: result };
      setApprovalItems(prev => prev.map(i => 
        i.id === item.id ? updatedItem : i
      ));

      toast.success('Validation completed');

    } catch (error) {
      console.error('Validation failed:', error);
      toast.error('Validation failed');
    }
  };

  // Filter functions
  const filteredItems = approvalItems.filter(item => {
    const matchesSearch = searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesAssignee = assigneeFilter === 'all' || item.assignedTo === assigneeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesAssignee;
  });

  // Helper functions
  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      in_review: 'default',
      approved: 'default',
      rejected: 'destructive',
      changes_requested: 'outline'
    };
    return <Badge variant={(variants[status as keyof typeof variants] || 'outline') as "default" | "secondary" | "destructive" | "outline"}>{status.replace('_', ' ')}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      critical: 'destructive',
      high: 'default',
      medium: 'secondary',
      low: 'outline'
    };
    return <Badge variant={(variants[priority as keyof typeof variants] || 'outline') as "default" | "secondary" | "destructive" | "outline"}>{priority}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      source: 'outline',
      guidance: 'default',
      content: 'secondary',
      template: 'outline'
    };
    return <Badge variant={(variants[type as keyof typeof variants] || 'outline') as "default" | "secondary" | "destructive" | "outline"}>{type}</Badge>;
  };

  const getWorkflowProgress = (item: ApprovalItem) => {
    return (item.workflow.currentStep / item.workflow.totalSteps) * 100;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3">Loading approval workflow data...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <GitBranch className="h-8 w-8 text-blue-600" />
            Approval Workflow Manager
          </h2>
          <p className="text-gray-600 mt-2">
            Advanced workflow system for content approval with validation steps
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => toast.info('Rule editor coming soon')}>
            <Shield className="h-4 w-4 mr-2" />
            Manage Rules
          </Button>
          <Button variant="outline" onClick={() => toast.info('Workflow editor coming soon')}>
            <GitBranch className="h-4 w-4 mr-2" />
            Workflow Templates
          </Button>
        </div>
      </div>
      
      {/* Quick Stats */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.totalItems}</div>
              <p className="text-xs text-gray-500">All time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{metrics.pendingItems}</div>
              <p className="text-xs text-gray-500">Awaiting action</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Review Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{metrics.avgReviewTime}m</div>
              <p className="text-xs text-gray-500">Minutes per item</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Approval Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{(metrics.approvalRate * 100).toFixed(0)}%</div>
              <p className="text-xs text-gray-500">Items approved</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{approvalRules.filter(r => r.enabled).length}</div>
              <p className="text-xs text-gray-500">Automation rules</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="changes_requested">Changes Requested</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="requirements">Requirements</SelectItem>
                <SelectItem value="guidance">Guidance</SelectItem>
                <SelectItem value="policies">Policies</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="me">Assigned to Me</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="queue">
            <Clock className="h-4 w-4 mr-2" />
            Approval Queue
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="rules">
            <Shield className="h-4 w-4 mr-2" />
            Rules & Automation
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <GitBranch className="h-4 w-4 mr-2" />
            Workflow Templates
          </TabsTrigger>
        </TabsList>
        
        {/* Approval Queue Tab */}
        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Approval Queue</CardTitle>
                  <CardDescription>
                    Items awaiting review and approval
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Bulk Approve
                  </Button>
                  <Button variant="outline" size="sm">
                    <XCircle className="h-4 w-4 mr-2" />
                    Bulk Reject
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input type="checkbox" />
                    </TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <input type="checkbox" />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-gray-600">{item.category}</div>
                          <div className="flex gap-1 mt-1">
                            {item.metadata.frameworks.slice(0, 2).map(fw => (
                              <Badge key={fw} variant="outline" className="text-xs">
                                {fw}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(item.type)}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Step {item.workflow.currentStep}/{item.workflow.totalSteps}</span>
                            <span>{getWorkflowProgress(item).toFixed(0)}%</span>
                          </div>
                          <Progress value={getWorkflowProgress(item)} className="h-1" />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.assignedTo ? (
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{item.assignedTo.split('@')[0]}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(item.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowItemDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleValidateItem(item)}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          {item.status === 'in_review' && item.assignedTo === user?.email && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(item);
                                setShowApprovalDialog(true);
                              }}
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No items in approval queue matching your criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {metrics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Top Reviewers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metrics.topReviewers.map((reviewer, index) => (
                      <div key={reviewer.email} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium">{reviewer.email.split('@')[0]}</div>
                            <div className="text-sm text-gray-600">{reviewer.count} reviews</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">{reviewer.avgTime}m avg</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Category Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metrics.categoryBreakdown.map((category) => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{category.category}</span>
                          <span className="text-sm">{(category.approvalRate * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={category.approvalRate * 100} className="h-2" />
                        <div className="text-xs text-gray-600">{category.count} items</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Weekly Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    {metrics.weeklyTrend.map((week) => (
                      <div key={week.week} className="text-center p-4 border rounded">
                        <div className="text-lg font-bold text-blue-600">{week.submitted}</div>
                        <div className="text-sm text-gray-600">Submitted</div>
                        <div className="text-lg font-bold text-green-600 mt-2">{week.approved}</div>
                        <div className="text-sm text-gray-600">Approved</div>
                        <div className="text-xs text-gray-500 mt-2">{week.week}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Approval Rules</CardTitle>
                  <CardDescription>
                    Automated rules for content approval
                  </CardDescription>
                </div>
                <Button onClick={() => toast.info('Rule editor coming soon')}>
                  <Shield className="h-4 w-4 mr-2" />
                  Create Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvalRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{rule.name}</div>
                          <div className="text-sm text-gray-600">{rule.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{rule.type.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{rule.condition}</TableCell>
                      <TableCell>
                        <Badge variant={rule.action === 'auto_approve' ? 'default' : 'secondary'}>
                          {rule.action.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch checked={rule.enabled} />
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Workflow Templates</CardTitle>
                  <CardDescription>
                    Define approval workflow templates
                  </CardDescription>
                </div>
                <Button onClick={() => toast.info('Workflow editor coming soon')}>
                  <GitBranch className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {workflowTemplates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        {template.isDefault && (
                          <Badge variant="default">Default</Badge>
                        )}
                      </div>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm">
                        <div><strong>Content Types:</strong> {template.contentTypes.join(', ')}</div>
                        <div><strong>Steps:</strong> {template.steps.length}</div>
                        <div><strong>Est. Duration:</strong> {template.estimatedDuration} minutes</div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Workflow Steps</div>
                        {template.steps.map((step, index) => (
                          <div key={step.id} className="flex items-center space-x-2 text-sm">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                            </div>
                            <span>{step.name}</span>
                            {step.automated && (
                              <Badge variant="outline" className="text-xs">Auto</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex space-x-2 pt-2 border-t">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4 mr-2" />
                          Clone
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Item Details Dialog */}
      <Dialog open={showItemDetails} onOpenChange={setShowItemDetails}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Approval Item Details</DialogTitle>
            <DialogDescription>
              Comprehensive review of approval item
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Title:</strong> {selectedItem.title}</div>
                    <div><strong>Type:</strong> {getTypeBadge(selectedItem.type)}</div>
                    <div><strong>Category:</strong> {selectedItem.category}</div>
                    <div><strong>Status:</strong> {getStatusBadge(selectedItem.status)}</div>
                    <div><strong>Priority:</strong> {getPriorityBadge(selectedItem.priority)}</div>
                    <div><strong>Submitted:</strong> {new Date(selectedItem.submittedAt).toLocaleString()}</div>
                    <div><strong>Submitted By:</strong> {selectedItem.submittedBy}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Workflow Progress</h3>
                  <div className="space-y-3">
                    <Progress value={getWorkflowProgress(selectedItem)} className="h-2" />
                    <div className="text-sm text-gray-600">
                      Step {selectedItem.workflow.currentStep} of {selectedItem.workflow.totalSteps}
                    </div>
                    
                    <div className="space-y-2">
                      {selectedItem.workflow.steps.map((step, index) => (
                        <div key={step.id} className="flex items-center space-x-3 text-sm">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            step.status === 'completed' ? 'bg-green-100 text-green-600' :
                            step.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                            step.status === 'failed' ? 'bg-red-100 text-red-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {step.status === 'completed' ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : step.status === 'failed' ? (
                              <XCircle className="h-3 w-3" />
                            ) : (
                              <span className="text-xs font-semibold">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{step.name}</div>
                            {step.assignee && (
                              <div className="text-xs text-gray-600">Assigned to: {step.assignee}</div>
                            )}
                          </div>
                          {step.completedAt && (
                            <div className="text-xs text-gray-500">
                              {new Date(step.completedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Content Preview</h3>
                <div className="border rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{selectedItem.content}</pre>
                </div>
              </div>
              
              {selectedItem.validationResults && (
                <div>
                  <h3 className="font-semibold mb-3">Validation Results</h3>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold">
                        Score: {(selectedItem.validationResults.score * 100).toFixed(0)}%
                      </span>
                      <Badge variant={selectedItem.validationResults.isValid ? 'default' : 'destructive'}>
                        {selectedItem.validationResults.isValid ? 'Valid' : 'Invalid'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {selectedItem.validationResults.checks.map((check, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-2">
                            {check.passed ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-sm">{check.name}</span>
                          </div>
                          <span className="text-sm">{(check.score * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold mb-3">Comments & Reviews</h3>
                <div className="space-y-3">
                  {selectedItem.comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{comment.userEmail}</span>
                          <Badge variant="outline" className="text-xs">
                            {comment.type}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-600">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
                  
                  {selectedItem.comments.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No comments yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemDetails(false)}>
              Close
            </Button>
            {selectedItem && selectedItem.status === 'in_review' && selectedItem.assignedTo === user?.email && (
              <Button onClick={() => {
                setShowItemDetails(false);
                setShowApprovalDialog(true);
              }}>
                Review & Approve
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Approval Action Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Item</DialogTitle>
            <DialogDescription>
              Provide your review decision and comments
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Decision</Label>
              <Select value={approvalAction} onValueChange={(value) => setApprovalAction(value as "approve" | "reject" | "request_changes")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approve</SelectItem>
                  <SelectItem value="request_changes">Request Changes</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="approval-comment">Comments</Label>
              <Textarea
                id="approval-comment"
                placeholder="Add your review comments..."
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleApprovalAction(approvalAction)}>
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}