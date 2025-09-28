/**
 * Email Management Console
 * Platform Admin interface for managing email notifications, templates, and analytics
 */

import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Mail,
  Send,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Eye,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Filter,
  Download,
  Play,
  Pause,
  RotateCcw,
  FileText,
  Bell,
  Zap,
  Target,
  Activity,
  Calendar,
  Globe,
  Shield
} from 'lucide-react';

import {
  EmailNotificationService,
  EmailTemplate,
  EmailNotification,
  EmailAnalytics,
  EmailCategory,
  EmailPriority,
  TemplateVariable,
  emailService
} from '@/services/email/EmailNotificationService';
import { seedDefaultTemplates } from '@/data/defaultEmailTemplates';
import { supabase } from '@/lib/supabase';

// ============================================================================
// INTERFACES
// ============================================================================

interface EmailManagementConsoleProps {
  className?: string;
}

interface TemplateFormData {
  name: string;
  subject: string;
  html_body: string;
  text_body?: string;
  category: EmailCategory;
  priority: EmailPriority;
  variables: TemplateVariable[];
  is_active: boolean;
}

interface QueueStats {
  pending: number;
  queued: number;
  sending: number;
  sent: number;
  failed: number;
  total: number;
}

// ============================================================================
// EMAIL MANAGEMENT CONSOLE
// ============================================================================

export const EmailManagementConsole: React.FC<EmailManagementConsoleProps> = ({ className }) => {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<EmailAnalytics[]>([]);
  const [queueStats, setQueueStats] = useState<QueueStats>({
    pending: 0, queued: 0, sending: 0, sent: 0, failed: 0, total: 0
  });
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showTestEmailDialog, setShowTestEmailDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [templateFormData, setTemplateFormData] = useState<TemplateFormData>({
    name: '',
    subject: '',
    html_body: '',
    text_body: '',
    category: 'system',
    priority: 'normal',
    variables: [],
    is_active: true
  });
  const [testEmail, setTestEmail] = useState('');
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState('7d');

  // Load data on component mount
  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadQueueStats, 30000); // Update queue stats every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadTemplates(),
        loadNotifications(),
        loadAnalytics(),
        loadQueueStats()
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load email management data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await emailService.getAllTemplates();
      setTemplates(data);
      console.log('✅ Loaded', data.length, 'email templates');
    } catch (error) {
      console.error('Failed to load templates:', error);
      // Fallback to empty array instead of failing
      setTemplates([]);
    }
  };

  const loadNotifications = async () => {
    try {
      // For now, use mock data since RLS policies need setup
      const mockNotifications: EmailNotification[] = [
        {
          id: '1',
          recipient_email: 'demo@auditready.com',
          subject: 'Assessment Reminder - Due Tomorrow',
          html_body: '<p>Your assessment is due tomorrow. Please complete it.</p>',
          status: 'sent' as any,
          priority: 'medium' as EmailPriority,
          scheduled_for: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          retry_count: 0,
          max_retries: 3,
          template_data: {},
          metadata: {},
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2', 
          recipient_email: 'admin@example.com',
          subject: 'NIS2 Compliance Alert',
          html_body: '<p>NIS2 compliance requires immediate attention.</p>',
          status: 'delivered' as any,
          priority: 'high' as EmailPriority,
          scheduled_for: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          retry_count: 0,
          max_retries: 3,
          template_data: {},
          metadata: {},
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ];

      setNotifications(mockNotifications);
      
      // Create recent activity from notifications
      const activity = mockNotifications.slice(0, 4).map(notif => ({
        type: notif.status,
        count: 1,
        template: 'Email Template',
        time: new Date(notif.created_at).toLocaleString(),
        recipient: notif.recipient_email
      }));
      
      setRecentActivity(activity);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Use mock analytics data for demo
      const mockAnalytics = [
        {
          date: new Date().toISOString().split('T')[0],
          total_sent: 45,
          total_delivered: 43,
          total_opened: 32,
          total_clicked: 8,
          total_bounced: 1,
          total_failed: 1,
          open_rate: 74.4,
          click_rate: 18.6,
          bounce_rate: 2.3
        }
      ];
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const loadQueueStats = async () => {
    try {
      // Use mock data for demo since RLS policies need setup
      const mockStats = {
        pending: 0,
        queued: 0,
        sending: 1,
        sent: 847,
        failed: 3,
        bounced: 1,
        total: 852
      };

      setQueueStats(mockStats);
    } catch (error) {
      console.error('Failed to load queue stats:', error);
    }
  };

  // ============================================================================
  // TEMPLATE MANAGEMENT
  // ============================================================================

  const handleCreateTemplate = async () => {
    try {
      const template = await emailService.createTemplate({
        ...templateFormData,
        metadata: {}
      });
      
      setTemplates(prev => [template, ...prev]);
      setShowTemplateDialog(false);
      resetTemplateForm();
      toast.success('Email template created successfully');
    } catch (error) {
      console.error('Failed to create template:', error);
      toast.error('Failed to create template');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      const updated = await emailService.updateTemplate(selectedTemplate.id, templateFormData);
      setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
      setShowTemplateDialog(false);
      setSelectedTemplate(null);
      resetTemplateForm();
      toast.success('Template updated successfully');
    } catch (error) {
      console.error('Failed to update template:', error);
      toast.error('Failed to update template');
    }
  };

  const handleDeleteTemplate = async (template: EmailTemplate) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) return;

    try {
      await emailService.deleteTemplate(template.id);
      setTemplates(prev => prev.filter(t => t.id !== template.id));
      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleTestTemplate = async () => {
    if (!selectedTemplate || !testEmail) return;

    try {
      const result = await emailService.sendEmail({
        templateId: selectedTemplate.id,
        to: testEmail,
        templateData: {
          userName: 'Test User',
          companyName: 'Test Company',
          currentDate: new Date().toLocaleDateString(),
          unsubscribe_token: 'test-token'
        },
        priority: 'high'
      });

      if (result.success) {
        toast.success(`Test email sent to ${testEmail}`);
        setShowTestEmailDialog(false);
        setTestEmail('');
      } else {
        toast.error(`Failed to send test email: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to send test email:', error);
      toast.error('Failed to send test email');
    }
  };

  const resetTemplateForm = () => {
    setTemplateFormData({
      name: '',
      subject: '',
      html_body: '',
      text_body: '',
      category: 'system',
      priority: 'normal',
      variables: [],
      is_active: true
    });
  };

  // ============================================================================
  // QUEUE PROCESSING
  // ============================================================================

  const handleProcessQueue = async () => {
    setIsProcessing(true);
    try {
      const result = await emailService.processQueue();
      toast.success(`Processed ${result.processed} emails, ${result.errors} errors`);
      await loadQueueStats();
    } catch (error) {
      console.error('Failed to process queue:', error);
      toast.error('Failed to process email queue');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSeedTemplates = async () => {
    setIsLoading(true);
    try {
      const result = await seedDefaultTemplates();
      if (result.success) {
        toast.success(`Successfully seeded ${result.count} default email templates`);
        await loadTemplates(); // Reload templates to show new ones
      } else {
        toast.error(`Failed to seed templates: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to seed templates:', error);
      toast.error('Failed to seed default templates');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getCategoryIcon = (category: EmailCategory) => {
    const iconMap = {
      assessment: FileText,
      compliance: Shield,
      onboarding: Users,
      report: BarChart3,
      team: Users,
      system: Settings
    };
    const Icon = iconMap[category] || Bell;
    return <Icon className="h-4 w-4" />;
  };

  const getPriorityBadge = (priority: EmailPriority) => {
    const variants = {
      critical: 'destructive',
      high: 'default',
      normal: 'secondary',
      low: 'outline'
    } as const;
    
    return <Badge variant={variants[priority] || 'secondary'}>{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'outline' as const, icon: Clock, color: 'text-yellow-600' },
      queued: { variant: 'secondary' as const, icon: Clock, color: 'text-blue-600' },
      sending: { variant: 'default' as const, icon: Send, color: 'text-blue-600' },
      sent: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      failed: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
      bounced: { variant: 'destructive' as const, icon: AlertTriangle, color: 'text-red-600' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="h-8 w-8 text-blue-600" />
            Email Management Console
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage email notifications, templates, and delivery analytics
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={loadAllData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleProcessQueue}
            disabled={isProcessing}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Process Queue
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{queueStats.pending + queueStats.queued}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Send className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{queueStats.sending}</p>
                <p className="text-xs text-muted-foreground">Sending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{queueStats.sent}</p>
                <p className="text-xs text-muted-foreground">Sent Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{queueStats.failed}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{templates.length}</p>
                <p className="text-xs text-muted-foreground">Templates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {queueStats.total > 0 ? Math.round((queueStats.sent / queueStats.total) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="queue">
            <Clock className="h-4 w-4 mr-2" />
            Queue ({queueStats.pending + queueStats.queued})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Email Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        {getStatusBadge(activity.type)}
                        <div>
                          <p className="font-medium">{activity.template}</p>
                          <p className="text-sm text-muted-foreground">to {activity.recipient}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No recent email activity</p>
                      <p className="text-sm">Send your first email to see activity here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Queue Processing Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Queue Processing Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing Progress</span>
                    <span>{Math.round((queueStats.sent / queueStats.total) * 100)}%</span>
                  </div>
                  <Progress value={(queueStats.sent / queueStats.total) * 100} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-blue-50">
                    <p className="text-2xl font-bold text-blue-600">{queueStats.queued}</p>
                    <p className="text-sm text-muted-foreground">Queued</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-50">
                    <p className="text-2xl font-bold text-green-600">{queueStats.sent}</p>
                    <p className="text-sm text-muted-foreground">Processed Today</p>
                  </div>
                </div>

                <Button 
                  onClick={handleProcessQueue} 
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing Queue...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Process Queue Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                onClick={handleSeedTemplates}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Seed Default Templates
              </Button>
              <Button 
                onClick={() => {
                  resetTemplateForm();
                  setSelectedTemplate(null);
                  setShowTemplateDialog(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates
                    .filter(template => categoryFilter === 'all' || template.category === categoryFilter)
                    .map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-md">
                            {template.subject}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(template.category)}
                          <span className="capitalize">{template.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(template.priority)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={template.is_active ? 'default' : 'secondary'}>
                          {template.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(template.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setShowPreviewDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setShowTestEmailDialog(true);
                            }}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setTemplateFormData({ ...template });
                              setShowTemplateDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template)}
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                    <p className="text-2xl font-bold">{queueStats.sent.toLocaleString()}</p>
                  </div>
                  <Send className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
                    <p className="text-2xl font-bold">
                      {analytics.length > 0 
                        ? `${Math.round(analytics.reduce((acc, a) => acc + a.open_rate, 0) / analytics.length)}%`
                        : '0%'
                      }
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Click Rate</p>
                    <p className="text-2xl font-bold">
                      {analytics.length > 0 
                        ? `${Math.round(analytics.reduce((acc, a) => acc + a.click_rate, 0) / analytics.length)}%`
                        : '0%'
                      }
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bounce Rate</p>
                    <p className="text-2xl font-bold">
                      {analytics.length > 0 
                        ? `${Math.round(analytics.reduce((acc, a) => acc + a.bounce_rate, 0) / analytics.length)}%`
                        : '0%'
                      }
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Email Performance Trends</CardTitle>
              <CardDescription>
                Email delivery and engagement metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                📈 Email analytics chart would be implemented here with a charting library
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Provider Configuration</CardTitle>
                <CardDescription>
                  Configure your email delivery provider settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email Provider</Label>
                  <Select defaultValue="supabase">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supabase">Supabase (Built-in)</SelectItem>
                      <SelectItem value="resend">Resend</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="ses">Amazon SES</SelectItem>
                      <SelectItem value="smtp">SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input type="password" placeholder="Enter your API key" />
                </div>

                <div className="space-y-2">
                  <Label>From Email</Label>
                  <Input defaultValue="notifications@auditready.com" />
                </div>

                <div className="space-y-2">
                  <Label>From Name</Label>
                  <Input defaultValue="AuditReady" />
                </div>

                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Update Configuration
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Queue Processing Settings</CardTitle>
                <CardDescription>
                  Configure how email queue processing works
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-process Queue</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically process email queue every 5 minutes
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Batch Size</Label>
                  <Input type="number" defaultValue="50" min="1" max="100" />
                  <p className="text-xs text-muted-foreground">
                    Number of emails to process per batch
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Max Retries</Label>
                  <Input type="number" defaultValue="3" min="0" max="10" />
                  <p className="text-xs text-muted-foreground">
                    Maximum retry attempts for failed emails
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Rate Limiting</p>
                    <p className="text-sm text-muted-foreground">
                      Limit email sending rate to prevent spam flags
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button className="w-full" variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Edit Email Template' : 'Create Email Template'}
            </DialogTitle>
            <DialogDescription>
              Design and configure email templates for automated notifications
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={templateFormData.name}
                  onChange={(e) => setTemplateFormData(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  placeholder="e.g. Assessment Reminder"
                />
              </div>

              <div>
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={templateFormData.subject}
                  onChange={(e) => setTemplateFormData(prev => ({
                    ...prev,
                    subject: e.target.value
                  }))}
                  placeholder="e.g. {{assessmentName}} due in {{daysLeft}} days"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={templateFormData.category} 
                    onValueChange={(value) => setTemplateFormData(prev => ({
                      ...prev,
                      category: value as EmailCategory
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={templateFormData.priority} 
                    onValueChange={(value) => setTemplateFormData(prev => ({
                      ...prev,
                      priority: value as EmailPriority
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={templateFormData.is_active}
                  onCheckedChange={(checked) => setTemplateFormData(prev => ({
                    ...prev,
                    is_active: checked
                  }))}
                />
                <Label>Template Active</Label>
              </div>
            </div>

            <div className="space-y-4">
              <Alert>
                <Bell className="h-4 w-4" />
                <AlertDescription>
                  <strong>Available Variables:</strong>{' '}
                  <code>{'{{userName}}'}</code>, <code>{'{{companyName}}'}</code>, <code>{'{{currentDate}}'}</code>, <code>{'{{assessmentName}}'}</code>, <code>{'{{daysLeft}}'}</code>, <code>{'{{dueDate}}'}</code>
                </AlertDescription>
              </Alert>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="html_body">HTML Content</Label>
              <Textarea
                id="html_body"
                rows={10}
                value={templateFormData.html_body}
                onChange={(e) => setTemplateFormData(prev => ({
                  ...prev,
                  html_body: e.target.value
                }))}
                placeholder="Enter HTML email content..."
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="text_body">Plain Text Content (Optional)</Label>
              <Textarea
                id="text_body"
                rows={6}
                value={templateFormData.text_body}
                onChange={(e) => setTemplateFormData(prev => ({
                  ...prev,
                  text_body: e.target.value
                }))}
                placeholder="Enter plain text version..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={selectedTemplate ? handleUpdateTemplate : handleCreateTemplate}>
              {selectedTemplate ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>📧 Template Preview: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Preview how this email template will appear to recipients
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
            {/* Template Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Subject Line</Label>
                <div className="p-3 bg-slate-50 rounded border text-sm font-medium">
                  {selectedTemplate?.subject}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Category & Priority</Label>
                <div className="flex gap-2">
                  <Badge variant={selectedTemplate?.category === 'system' ? 'destructive' : 'secondary'}>
                    {selectedTemplate?.category}
                  </Badge>
                  <Badge variant={selectedTemplate?.priority === 'critical' ? 'destructive' : 'outline'}>
                    {selectedTemplate?.priority}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Template Variables</Label>
                <div className="text-xs text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                  {selectedTemplate?.variables && selectedTemplate.variables.length > 0 ? (
                    selectedTemplate.variables.map((variable: TemplateVariable, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <code className="bg-slate-100 px-1 rounded">{'{{' + variable.name + '}}'}</code>
                        <span>{variable.description}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-muted-foreground">No variables defined</span>
                  )}
                </div>
              </div>
            </div>

            {/* Email Preview */}
            <div className="space-y-2 overflow-hidden">
              <Label>Email Preview</Label>
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="bg-slate-100 px-4 py-2 border-b text-sm font-medium">
                  📧 {selectedTemplate?.subject}
                </div>
                <div 
                  className="p-4 overflow-y-auto max-h-96"
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(
                      selectedTemplate?.html_body?.replace(/{{(\w+)}}/g, '<span style="background: #fef3c7; padding: 2px 4px; border-radius: 3px; font-weight: 500;">{{$1}}</span>') || '',
                      { 
                        ALLOWED_TAGS: ['span', 'div', 'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
                        ALLOWED_ATTR: ['style', 'class'],
                        KEEP_CONTENT: true
                      }
                    )
                  }}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowPreviewDialog(false);
              setShowTestEmailDialog(true);
            }}>
              <Send className="h-4 w-4 mr-2" />
              Send Test Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Email Dialog */}
      <Dialog open={showTestEmailDialog} onOpenChange={setShowTestEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send a test email using the template: {selectedTemplate?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="testEmail">Test Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="admin@company.com"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestEmailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleTestTemplate} disabled={!testEmail}>
              <Send className="h-4 w-4 mr-2" />
              Send Test Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailManagementConsole;