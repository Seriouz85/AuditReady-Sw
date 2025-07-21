import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  RotateCcw, 
  User, 
  Calendar, 
  AlertTriangle,
  ChevronRight,
  Download,
  Upload,
  Shield,
  Activity,
  Database,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { backupRestoreService, AuditEntry, RestorePoint, UserActivity } from '@/services/backup/BackupRestoreService';
import { format, parseISO } from 'date-fns';
import { toast } from '@/utils/toast';

// Timeline component for visualizing changes
const Timeline = ({ entries }: { entries: AuditEntry[] }) => {
  return (
    <div className="space-y-6">
      {entries.map((entry, index) => (
        <div key={entry.id} className="flex gap-4">
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${
              entry.action === 'DELETE' ? 'bg-red-500' :
              entry.action === 'INSERT' ? 'bg-green-500' :
              entry.action === 'UPDATE' ? 'bg-blue-500' :
              'bg-purple-500'
            }`} />
            {index < entries.length - 1 && (
              <div className="absolute top-3 left-1.5 w-0.5 h-full bg-gray-200" />
            )}
          </div>
          
          <div className="flex-1 pb-6">
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={
                    entry.action === 'DELETE' ? 'destructive' :
                    entry.action === 'INSERT' ? 'default' :
                    entry.action === 'UPDATE' ? 'secondary' :
                    'outline'
                  }>
                    {entry.action}
                  </Badge>
                  <span className="text-sm font-medium">{entry.tableName}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(parseISO(entry.createdAt), 'MMM d, yyyy HH:mm')}
                </span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>By: {entry.userEmail}</p>
                {entry.changedFields && entry.changedFields.length > 0 && (
                  <p className="mt-1">Changed: {entry.changedFields.join(', ')}</p>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => {/* Show details */}}
              >
                View Details
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// User activity card
const UserActivityCard = ({ activity }: { activity: UserActivity }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{activity.userEmail}</span>
          </div>
          <Badge variant="outline">{activity.changeCount} changes</Badge>
        </div>
        
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Session: {format(parseISO(activity.startTime), 'MMM d, HH:mm')} - {
            activity.endTime ? format(parseISO(activity.endTime), 'HH:mm') : 'Active'
          }</p>
          <p>Tables: {activity.affectedTables.join(', ')}</p>
        </div>
        
        <div className="flex gap-4 mt-3 text-xs">
          <span className="text-green-600">+{activity.summary.inserts}</span>
          <span className="text-blue-600">~{activity.summary.updates}</span>
          <span className="text-red-600">-{activity.summary.deletes}</span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3"
          onClick={() => {/* Restore session */}}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Restore Session
        </Button>
      </CardContent>
    </Card>
  );
};

export const BackupRestore = () => {
  const { organization, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('activity');
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  // Check permissions
  const canRestore = hasPermission('restore_data') || hasPermission('admin');
  const canViewAudit = hasPermission('view_audit_trail') || hasPermission('admin');

  useEffect(() => {
    if (organization?.id) {
      loadData();
    }
  }, [organization?.id, selectedTimeRange]);

  const loadData = async () => {
    if (!organization?.id) return;
    
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      let startDate = new Date();
      
      switch (selectedTimeRange) {
        case '24h':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
      }

      // Load audit trail
      const auditResult = await backupRestoreService.getAuditTrail(
        organization.id,
        {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          limit: 50
        }
      );
      setAuditEntries(auditResult.data);

      // Load restore points
      const points = await backupRestoreService.getRestorePoints(
        organization.id,
        selectedTimeRange === '24h' ? 1 : selectedTimeRange === '7d' ? 7 : 30
      );
      setRestorePoints(points);

      // Load user activities
      const activities = await backupRestoreService.getUserActivity(
        organization.id,
        {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      );
      setUserActivities(activities);

    } catch (error) {
      console.error('Error loading backup/restore data:', error);
      toast.error('Failed to load backup and restore data');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (type: string, target: any) => {
    try {
      // Preview restore first
      const preview = await backupRestoreService.previewRestore({
        organizationId: organization!.id,
        restoreType: type as any,
        targetTimestamp: target.timestamp,
        reason: 'User requested restore'
      });

      // Show confirmation dialog
      const confirmed = window.confirm(
        `This will restore ${preview.totalChanges} changes. Continue?`
      );

      if (!confirmed) return;

      // Perform restore
      const result = await backupRestoreService.performRestore({
        organizationId: organization!.id,
        restoreType: type as any,
        targetTimestamp: target.timestamp,
        reason: 'User requested restore'
      });

      if (result.success) {
        toast.success(`Successfully restored ${result.restoredCount} changes`);
        loadData(); // Reload data
      }
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Failed to perform restore operation');
    }
  };

  if (!canViewAudit) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to view backup and restore data.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Backup & Restore</h1>
          <p className="text-muted-foreground mt-2">
            View activity history and restore previous data states
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Security Notice */}
      {canRestore && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Security Notice</AlertTitle>
          <AlertDescription>
            All restore operations are logged and may require approval. 
            Restoring data will create new audit entries.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-2" />
            Activity Timeline
          </TabsTrigger>
          <TabsTrigger value="users">
            <User className="h-4 w-4 mr-2" />
            User Sessions
          </TabsTrigger>
          <TabsTrigger value="restore">
            <RotateCcw className="h-4 w-4 mr-2" />
            Restore Points
          </TabsTrigger>
          <TabsTrigger value="backup">
            <Database className="h-4 w-4 mr-2" />
            Backups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                All changes made to your organization's data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : auditEntries.length > 0 ? (
                <Timeline entries={auditEntries} />
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No activity found for the selected time range
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userActivities.map(activity => (
              <UserActivityCard key={activity.sessionId} activity={activity} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="restore" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Restore Points</CardTitle>
              <CardDescription>
                Select a point in time to restore your data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {restorePoints.map(point => (
                  <div
                    key={point.timestamp}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{point.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(point.timestamp), 'MMM d, yyyy HH:mm:ss')}
                        </p>
                      </div>
                    </div>
                    
                    {canRestore && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore('TIME_POINT', point)}
                      >
                        Restore to this point
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Backup Management</CardTitle>
              <CardDescription>
                Automatic backups are created daily
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Database className="h-4 w-4" />
                <AlertTitle>Automatic Backups</AlertTitle>
                <AlertDescription>
                  Your data is automatically backed up every 24 hours. 
                  Point-in-time recovery is available for the last 30 days.
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 space-y-4">
                <Button className="w-full" disabled>
                  <Upload className="h-4 w-4 mr-2" />
                  Create Manual Backup (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};