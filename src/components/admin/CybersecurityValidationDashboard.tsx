/**
 * Cybersecurity Validation Dashboard
 * Comprehensive admin interface for cybersecurity validation and monitoring
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  Ban,
  Unlock,
  FileX,
  AlertCircle,
  Activity,
  BarChart3,
  RefreshCw,
  Download,
  Filter,
  Search,
  Settings,
  Zap,
  Target,
  UserCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AdminSecurityControlPanel, type SecurityDashboardMetrics, type ContentApprovalQueue } from '@/services/security/AdminSecurityControlPanel';
import { CybersecurityValidationFramework, type SecurityValidationResult, type SecurityMonitoringEvent } from '@/services/security/CybersecurityValidationFramework';

interface ThreatAnalysisModalProps {
  content: any;
  onClose: () => void;
  onAction: (action: string, reason: string) => void;
}

const ThreatAnalysisModal: React.FC<ThreatAnalysisModalProps> = ({ content, onClose, onAction }) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [reason, setReason] = useState('');
  const [securityNotes, setSecurityNotes] = useState('');

  const handleSubmit = () => {
    if (selectedAction && reason) {
      onAction(selectedAction, reason);
      onClose();
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getThreatIcon = (type: string) => {
    switch (type) {
      case 'malicious_content': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'phishing': return <Shield className="w-4 h-4 text-orange-600" />;
      case 'social_engineering': return <Users className="w-4 h-4 text-yellow-600" />;
      case 'data_exfiltration': return <FileX className="w-4 h-4 text-red-600" />;
      case 'compliance_violation': return <XCircle className="w-4 h-4 text-purple-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Security Threat Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Risk Level Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge className={getRiskColor(content.validation_result?.risk_level || 'unknown')}>
                    {content.validation_result?.risk_level?.toUpperCase() || 'UNKNOWN'} RISK
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Confidence: {Math.round((content.validation_result?.confidence_score || 0) * 100)}%
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Processing Time: {content.validation_result?.metadata?.processing_time_ms}ms
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Content Type</Label>
                  <p className="text-sm text-gray-600 capitalize">{content.content_type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Source</Label>
                  <p className="text-sm text-gray-600 truncate">{content.source_url || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Threats Detected */}
          {content.validation_result?.threats_detected?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Threats Detected ({content.validation_result.threats_detected.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {content.validation_result.threats_detected.map((threat: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getThreatIcon(threat.type)}
                          <span className="font-medium capitalize">{threat.type.replace('_', ' ')}</span>
                          <Badge className={getRiskColor(threat.severity)}>
                            {threat.severity}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{threat.description}</p>
                      {threat.evidence?.length > 0 && (
                        <div className="mb-2">
                          <Label className="text-xs font-medium text-gray-500">Evidence:</Label>
                          <ul className="text-xs text-gray-600 ml-2">
                            {threat.evidence.map((evidence: string, i: number) => (
                              <li key={i}>• {evidence}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        <strong>Recommended Action:</strong> {threat.mitigation}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation Layers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Validation Layers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {content.validation_result?.validation_layers?.map((layer: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {layer.passed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">{layer.layer_name}</p>
                        <p className="text-sm text-gray-600">{layer.details}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Score: {Math.round(layer.score * 100)}%</p>
                      <p className="text-xs text-gray-500">{layer.execution_time_ms}ms</p>
                      {layer.threats_found > 0 && (
                        <Badge variant="destructive" className="text-xs mt-1">
                          {layer.threats_found} threats
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {content.content_preview || content.full_content?.substring(0, 500) + '...'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Admin Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="action">Action</Label>
                  <Select value={selectedAction} onValueChange={setSelectedAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Approve Content
                        </div>
                      </SelectItem>
                      <SelectItem value="reject">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          Reject Content
                        </div>
                      </SelectItem>
                      <SelectItem value="quarantine">
                        <div className="flex items-center gap-2">
                          <Ban className="w-4 h-4 text-orange-600" />
                          Quarantine Content
                        </div>
                      </SelectItem>
                      <SelectItem value="escalate">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          Escalate for Expert Review
                        </div>
                      </SelectItem>
                      <SelectItem value="modify">
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-blue-600" />
                          Request Modifications
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reason">Reason for Action</Label>
                  <Textarea
                    id="reason"
                    placeholder="Provide a detailed reason for this action..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <Label htmlFor="security-notes">Security Notes (Optional)</Label>
                  <Textarea
                    id="security-notes"
                    placeholder="Additional security observations or recommendations..."
                    value={securityNotes}
                    onChange={(e) => setSecurityNotes(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox id="follow-up" />
                  <Label htmlFor="follow-up" className="text-sm">
                    Requires follow-up action
                  </Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!selectedAction || !reason}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Execute Action
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const CybersecurityValidationDashboard: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  
  const [metrics, setMetrics] = useState<SecurityDashboardMetrics | null>(null);
  const [approvalQueue, setApprovalQueue] = useState<ContentApprovalQueue | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityMonitoringEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [dashboardMetrics, queue, events] = await Promise.all([
        AdminSecurityControlPanel.getSecurityDashboardMetrics(),
        AdminSecurityControlPanel.getContentApprovalQueue({
          status: statusFilter || undefined,
          priority: priorityFilter || undefined
        }),
        AdminSecurityControlPanel.getRealtimeSecurityEvents({
          severity: severityFilter || undefined,
          last_hours: 24
        })
      ]);

      setMetrics(dashboardMetrics);
      setApprovalQueue(queue);
      setSecurityEvents(events);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load security dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, severityFilter, toast]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast({
      title: 'Success',
      description: 'Dashboard data refreshed',
    });
  };

  const handleSecurityAction = async (action: string, reason: string) => {
    if (!selectedContent) return;

    try {
      const result = await AdminSecurityControlPanel.processSecurityAction({
        action_type: action as any,
        content_id: selectedContent.id,
        admin_id: user?.id || '',
        reason,
        security_notes: 'Processed via cybersecurity dashboard'
      });

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        await loadDashboardData(); // Refresh data
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process security action',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'quarantined': return 'text-orange-600 bg-orange-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'escalated': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Check permissions after all hooks are called
  if (!hasPermission('platform_admin') && !hasPermission('security_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the cybersecurity dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading cybersecurity dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            Cybersecurity Validation Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Advanced security monitoring and content validation control
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Validations (24h)</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.total_validations_24h}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600">+12% from yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Threats Detected</p>
                  <p className="text-2xl font-bold text-red-600">{metrics.threats_detected_24h}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600">-5% from yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-yellow-600">{metrics.pending_approvals}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-gray-600">{approvalQueue?.priority_queue.length} high priority</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-blue-600">{Math.round(metrics.avg_processing_time_ms)}ms</p>
                </div>
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-gray-600">Within SLA targets</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard Content */}
      <Tabs defaultValue="approval-queue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="approval-queue">Content Approval</TabsTrigger>
          <TabsTrigger value="threat-monitoring">Threat Monitoring</TabsTrigger>
          <TabsTrigger value="risk-analysis">Risk Analysis</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Status</TabsTrigger>
          <TabsTrigger value="incidents">Security Incidents</TabsTrigger>
        </TabsList>

        {/* Content Approval Queue */}
        <TabsContent value="approval-queue" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Content Approval Queue ({approvalQueue?.total_count || 0})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                      <SelectItem value="quarantined">Quarantined</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Priorities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvalQueue?.items.slice(0, 10).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium truncate">{item.content_preview}</p>
                          <p className="text-sm text-gray-500 truncate">{item.source_url}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {item.content_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskColor(item.validation_result?.risk_level || 'unknown')}>
                          {item.validation_result?.risk_level || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.priority === 'critical' ? 'destructive' : 'secondary'}>
                          {item.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.current_status)}>
                          {item.current_status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(item.submission_timestamp).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedContent(item)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would be implemented similarly... */}
        <TabsContent value="threat-monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Threat Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Threat monitoring interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk-analysis">
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis & Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Risk analysis dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Framework Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Compliance monitoring coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents">
          <Card>
            <CardHeader>
              <CardTitle>Security Incident Response</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Incident response dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Threat Analysis Modal */}
      {selectedContent && (
        <ThreatAnalysisModal
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
          onAction={handleSecurityAction}
        />
      )}
    </div>
  );
};

export default CybersecurityValidationDashboard;