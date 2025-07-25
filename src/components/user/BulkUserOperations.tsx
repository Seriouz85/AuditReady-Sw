import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/utils/toast';
import { formatDate } from '@/utils/formatDate';
import {
  bulkUserOperationsService,
  BulkUserOperation,
  BulkInviteParams,
  ImportValidationResult,
} from '@/services/user/BulkUserOperationsService';
// import { RBACService } from '@/services/rbac/RBACService'; // TODO: Fix import path
import { organizationHierarchyService } from '@/services/organization/OrganizationHierarchyService';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users, Upload, Download, UserPlus,
  FileText, CheckCircle, XCircle, AlertCircle,
  RefreshCw, Mail, Shield, Building2,
  Trash2, Settings, UserCheck, UserX
} from 'lucide-react';

interface BulkUserOperationsProps {
  onOperationComplete?: (operation: BulkUserOperation) => void;
}

export const BulkUserOperations: React.FC<BulkUserOperationsProps> = ({
  onOperationComplete: _onOperationComplete
}) => {
  const { user, organization, isDemo } = useAuth();
  const [activeOperations, setActiveOperations] = useState<BulkUserOperation[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Bulk invite state
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [inviteDepartment, setInviteDepartment] = useState('');
  const [inviteTeams, setInviteTeams] = useState<string[]>([]);
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [customMessage, setCustomMessage] = useState('');

  // CSV import state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [_csvData, setCsvData] = useState(''); // Used in file reader
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [importRole, setImportRole] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Operation tracking
  const [selectedOperation, setSelectedOperation] = useState<BulkUserOperation | null>(null);
  const [isOperationDialogOpen, setIsOperationDialogOpen] = useState(false);

  const loadReferenceData = useCallback(async () => {
    if (!organization) return;

    try {
      const [rolesData, departmentsData, teamsData] = await Promise.all([
        Promise.resolve([]), // RBACService.getInstance().getRoles(organization.id), // TODO: Fix service
        organizationHierarchyService.getDepartments(organization.id),
        organizationHierarchyService.getTeams(organization.id)
      ]);

      setRoles(rolesData);
      setDepartments(departmentsData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error loading reference data:', error);
    }
  }, [organization]);

  const loadActiveOperations = useCallback(async () => {
    // In production, load actual active operations
    // For demo, show mock data
    const mockOperations: BulkUserOperation[] = [
      {
        id: 'op-1',
        operation_type: 'invite',
        target_users: ['user1@example.com', 'user2@example.com'],
        parameters: { emails: ['user1@example.com', 'user2@example.com'] },
        status: 'in_progress',
        created_by: 'admin',
        organization_id: organization?.id || 'demo-org',
        created_at: new Date(Date.now() - 300000).toISOString(),
        started_at: new Date(Date.now() - 250000).toISOString(),
        progress: 65,
        total_users: 2,
        successful_users: 1,
        failed_users: 0
      }
    ];

    setActiveOperations(mockOperations);
  }, [organization]);

  useEffect(() => {
    loadReferenceData();
    loadActiveOperations();
  }, [loadReferenceData, loadActiveOperations]);

  const handleBulkInvite = async () => {
    if (!user || !organization || !inviteEmails.trim() || !inviteRole) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isDemo) {
      toast.info('Bulk user operations are not available in demo mode');
      return;
    }

    try {
      setLoading(true);

      const emails = inviteEmails
        .split('\n')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      if (emails.length === 0) {
        toast.error('Please enter at least one email address');
        return;
      }

      const params: BulkInviteParams = {
        emails,
        role_id: inviteRole,
        ...(inviteDepartment && { department_id: inviteDepartment }),
        ...(inviteTeams.length > 0 && { team_ids: inviteTeams }),
        send_welcome_email: sendWelcomeEmail,
        ...(customMessage && { custom_message: customMessage })
      };

      const result = await bulkUserOperationsService.bulkInviteUsers(
        organization.id,
        params,
        user.id
      );

      if (result.success) {
        toast.success(`Bulk invite operation started for ${emails.length} users`);
        
        // Clear form
        setInviteEmails('');
        setInviteRole('');
        setInviteDepartment('');
        setInviteTeams([]);
        setCustomMessage('');
        
        // Reload operations
        await loadActiveOperations();
      } else {
        toast.error(result.error || 'Failed to start bulk invite operation');
      }
    } catch (error) {
      console.error('Error starting bulk invite:', error);
      toast.error('Failed to start bulk invite operation');
    } finally {
      setLoading(false);
    }
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvData(content);
        validateCsvData(content);
      };
      reader.readAsText(file);
    }
  };

  const validateCsvData = async (data: string) => {
    try {
      setIsValidating(true);
      const result = await bulkUserOperationsService.validateUserImport(data);
      setValidationResult(result);
    } catch (error) {
      console.error('Error validating CSV:', error);
      toast.error('Failed to validate CSV file');
    } finally {
      setIsValidating(false);
    }
  };

  const handleCsvImport = async () => {
    if (!validationResult || !importRole || !user || !organization) {
      toast.error('Please select a role and ensure CSV is validated');
      return;
    }

    if (isDemo) {
      toast.info('CSV import is not available in demo mode');
      return;
    }

    try {
      setLoading(true);

      const result = await bulkUserOperationsService.processUserImport(
        organization.id,
        validationResult.valid_users,
        importRole,
        user.id
      );

      if (result.success) {
        toast.success(`CSV import started for ${validationResult.valid_users.length} users`);
        
        // Clear form
        setCsvFile(null);
        setCsvData('');
        setValidationResult(null);
        setImportRole('');
        
        // Reload operations
        await loadActiveOperations();
      } else {
        toast.error(result.error || 'Failed to start CSV import');
      }
    } catch (error) {
      console.error('Error starting CSV import:', error);
      toast.error('Failed to start CSV import');
    } finally {
      setLoading(false);
    }
  };

  const getOperationStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'partial':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'invite':
        return <UserPlus className="h-4 w-4" />;
      case 'role_change':
        return <Shield className="h-4 w-4" />;
      case 'department_assign':
        return <Building2 className="h-4 w-4" />;
      case 'deactivate':
        return <UserX className="h-4 w-4" />;
      case 'activate':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const downloadCsvTemplate = () => {
    const csvContent = `email,first_name,last_name,job_title,department,role,phone,start_date
user1@example.com,John,Doe,Security Analyst,Information Security,analyst,+1-555-0123,2025-02-01
user2@example.com,Jane,Smith,Compliance Manager,Information Security,manager,,2025-02-15`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk User Operations
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="invite">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="invite">Bulk Invite</TabsTrigger>
              <TabsTrigger value="import">CSV Import</TabsTrigger>
              <TabsTrigger value="operations">Active Operations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="invite" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="invite-emails">Email Addresses *</Label>
                    <Textarea
                      id="invite-emails"
                      placeholder="Enter email addresses, one per line&#10;user1@example.com&#10;user2@example.com"
                      value={inviteEmails}
                      onChange={(e) => setInviteEmails(e.target.value)}
                      rows={8}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter one email address per line
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="invite-role">Default Role *</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="invite-department">Department (Optional)</Label>
                    <Select value={inviteDepartment || 'none'} onValueChange={(value) => setInviteDepartment(value === 'none' ? '' : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No department</SelectItem>
                        {departments.map(dept => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Teams (Optional)</Label>
                    <ScrollArea className="h-32 border rounded-md p-2">
                      {teams.map(team => (
                        <div key={team.id} className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id={`team-${team.id}`}
                            checked={inviteTeams.includes(team.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setInviteTeams([...inviteTeams, team.id]);
                              } else {
                                setInviteTeams(inviteTeams.filter(id => id !== team.id));
                              }
                            }}
                          />
                          <Label htmlFor={`team-${team.id}`} className="text-sm">
                            {team.name}
                          </Label>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="send-welcome"
                      checked={sendWelcomeEmail}
                      onCheckedChange={(checked) => setSendWelcomeEmail(!!checked)}
                    />
                    <Label htmlFor="send-welcome">Send welcome email</Label>
                  </div>
                  
                  <div>
                    <Label htmlFor="custom-message">Custom Message (Optional)</Label>
                    <Textarea
                      id="custom-message"
                      placeholder="Add a custom message to the invitation email"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleBulkInvite}
                  disabled={loading || isDemo}
                  className="min-w-32"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitations
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="import" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>CSV File Upload</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <Label htmlFor="csv-upload" className="cursor-pointer">
                          <span className="text-sm font-medium">Upload CSV file</span>
                          <span className="block text-xs text-muted-foreground">
                            or drag and drop
                          </span>
                        </Label>
                        <Input
                          id="csv-upload"
                          type="file"
                          accept=".csv"
                          onChange={handleCsvUpload}
                          className="hidden"
                        />
                      </div>
                      
                      {csvFile && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm font-medium">{csvFile.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCsvFile(null);
                                setCsvData('');
                                setValidationResult(null);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadCsvTemplate}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                  
                  <div>
                    <Label htmlFor="import-role">Default Role *</Label>
                    <Select value={importRole} onValueChange={setImportRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {isValidating && (
                    <div className="text-center p-4">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Validating CSV file...</p>
                    </div>
                  )}
                  
                  {validationResult && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Validation Results</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Valid: {validationResult.summary.valid_count}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span>Invalid: {validationResult.summary.invalid_count}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <span>Duplicates: {validationResult.summary.duplicate_count}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span>Total: {validationResult.summary.total_rows}</span>
                          </div>
                        </div>
                        
                        {validationResult.invalid_users.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium text-red-600">Errors:</Label>
                            <ScrollArea className="h-24 border rounded p-2 mt-1">
                              {validationResult.invalid_users.slice(0, 5).map((invalid, index) => (
                                <div key={index} className="text-xs text-red-600 mb-1">
                                  Row {invalid.row}: {invalid.errors.join(', ')}
                                </div>
                              ))}
                              {validationResult.invalid_users.length > 5 && (
                                <div className="text-xs text-muted-foreground">
                                  And {validationResult.invalid_users.length - 5} more errors...
                                </div>
                              )}
                            </ScrollArea>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleCsvImport}
                  disabled={!validationResult || validationResult.valid_users.length === 0 || !importRole || loading || isDemo}
                  className="min-w-32"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Users
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="operations" className="space-y-4">
              {activeOperations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No active operations</p>
                  <p className="text-sm">Bulk operations will appear here when started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeOperations.map(operation => (
                    <Card key={operation.id} className="cursor-pointer hover:bg-muted/50" onClick={() => {
                      setSelectedOperation(operation);
                      setIsOperationDialogOpen(true);
                    }}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              {getOperationIcon(operation.operation_type)}
                            </div>
                            <div>
                              <p className="font-medium capitalize">
                                {operation.operation_type.replace('_', ' ')} Operation
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {operation.total_users} users • Started {formatDate(operation.started_at || operation.created_at)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <Badge className={getOperationStatusColor(operation.status)}>
                                {operation.status.replace('_', ' ')}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {operation.successful_users}/{operation.total_users} completed
                              </p>
                            </div>
                            
                            {operation.status === 'in_progress' && (
                              <div className="w-16">
                                <Progress value={operation.progress} />
                                <p className="text-xs text-muted-foreground text-center">
                                  {operation.progress}%
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Operation Details Dialog */}
      <Dialog open={isOperationDialogOpen} onOpenChange={setIsOperationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Operation Details</DialogTitle>
            <DialogDescription>
              View detailed information about the bulk operation
            </DialogDescription>
          </DialogHeader>
          
          {selectedOperation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Operation Type</Label>
                  <p className="text-sm capitalize">
                    {selectedOperation.operation_type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getOperationStatusColor(selectedOperation.status)}>
                    {selectedOperation.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm">{formatDate(selectedOperation.created_at)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Progress</Label>
                  <div className="flex items-center gap-2">
                    <Progress value={selectedOperation.progress} className="flex-1" />
                    <span className="text-sm">{selectedOperation.progress}%</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{selectedOperation.total_users}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{selectedOperation.successful_users}</p>
                  <p className="text-sm text-muted-foreground">Successful</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{selectedOperation.failed_users}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>
              
              {selectedOperation.error_details && selectedOperation.error_details.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium">Errors</Label>
                    <ScrollArea className="h-32 border rounded p-2 mt-2">
                      {selectedOperation.error_details.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 mb-1">
                          {error.user_id}: {error.error}
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};