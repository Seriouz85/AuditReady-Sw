import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  XCircle,
  PlayCircle,
  StopCircle,
  Settings,
  FileText,
  Search,
  Filter,
  Eye,
  Trash2,
  RefreshCw,
  Archive,
  HardDrive,
  Cloud,
  Zap,
  Timer,
  Lock,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, differenceInDays, differenceInHours } from 'date-fns';
import { formatFileSize } from '@/services/utils/UnifiedUtilityService';

interface BackupPoint {
  id: string;
  type: 'automatic' | 'manual' | 'scheduled';
  name: string;
  description?: string;
  timestamp: string;
  size: number; // bytes
  compressionRatio: number;
  dataTypes: string[];
  organizationId: string;
  createdBy: string;
  status: 'completed' | 'in_progress' | 'failed' | 'corrupted';
  verificationStatus: 'verified' | 'pending' | 'failed';
  retentionDate: string;
  metadata: {
    tableCount: number;
    recordCount: number;
    documentCount: number;
    userCount: number;
    checksumMd5: string;
  };
}

interface RestoreJob {
  id: string;
  backupId: string;
  targetType: 'full' | 'selective' | 'preview';
  selectedTables: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startedAt: string;
  completedAt?: string;
  createdBy: string;
  mfaVerified: boolean;
  previewData?: any;
  conflictResolution: 'overwrite' | 'skip' | 'merge';
  estimatedDuration: number; // minutes
  actualDuration?: number;
}

interface BackupSchedule {
  id: string;
  name: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format for daily/weekly/monthly
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  isActive: boolean;
  retentionDays: number;
  includeDocuments: boolean;
  includeAuditLogs: boolean;
  compressionLevel: 'none' | 'fast' | 'standard' | 'maximum';
  nextRun: string;
  lastRun?: string;
  organizationId: string;
}

interface AuditEntry {
  id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'RESTORE';
  tableName: string;
  recordId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedFields: string[];
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  sessionId: string;
}

interface EnhancedBackupRestoreProps {
  organizationId: string;
}

export function EnhancedBackupRestore({ organizationId }: EnhancedBackupRestoreProps) {
  const { user, organization, isDemo } = useAuth();
  const { toast } = useToast();

  // State management
  const [backupPoints, setBackupPoints] = useState<BackupPoint[]>([]);
  const [restoreJobs, setRestoreJobs] = useState<RestoreJob[]>([]);
  const [backupSchedules, setBackupSchedules] = useState<BackupSchedule[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBackup, setActiveBackup] = useState<BackupPoint | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>(['all']);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  // Form states
  const [backupForm, setBackupForm] = useState({
    name: '',
    description: '',
    includeDocuments: true,
    includeAuditLogs: true,
    compressionLevel: 'standard' as BackupSchedule['compressionLevel']
  });

  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    frequency: 'daily' as BackupSchedule['frequency'],
    time: '02:00',
    retentionDays: 30,
    includeDocuments: true,
    includeAuditLogs: true,
    compressionLevel: 'standard' as BackupSchedule['compressionLevel']
  });

  const availableTables = [
    'all',
    'organizations',
    'users',
    'documents',
    'assessments',
    'standards',
    'requirements',
    'courses',
    'risks',
    'audit_logs',
    'user_activities',
    'settings'
  ];

  useEffect(() => {
    loadBackupData();
    const interval = setInterval(loadBackupData, 30000);
    return () => clearInterval(interval);
  }, [organizationId]);

  const loadBackupData = async () => {
    try {
      setLoading(true);

      // Load backup points - enhanced with more metadata
      const demoBackupPoints: BackupPoint[] = [
        {
          id: 'backup-1',
          type: 'automatic',
          name: 'Daily Auto Backup',
          description: 'Automatic daily backup with full data',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          size: 1024 * 1024 * 256, // 256MB
          compressionRatio: 0.35,
          dataTypes: ['organizations', 'users', 'documents', 'assessments', 'audit_logs'],
          organizationId,
          createdBy: 'system',
          status: 'completed',
          verificationStatus: 'verified',
          retentionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {
            tableCount: 15,
            recordCount: 12845,
            documentCount: 1250,
            userCount: 45,
            checksumMd5: 'a1b2c3d4e5f6'
          }
        },
        {
          id: 'backup-2',
          type: 'manual',
          name: 'Pre-Migration Backup',
          description: 'Manual backup before system update',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          size: 1024 * 1024 * 512, // 512MB
          compressionRatio: 0.42,
          dataTypes: ['all_tables'],
          organizationId,
          createdBy: user?.id || 'demo-user',
          status: 'completed',
          verificationStatus: 'verified',
          retentionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {
            tableCount: 18,
            recordCount: 15234,
            documentCount: 1420,
            userCount: 48,
            checksumMd5: 'f6e5d4c3b2a1'
          }
        },
        {
          id: 'backup-3',
          type: 'scheduled',
          name: 'Weekly Document Backup',
          description: 'Weekly backup focusing on documents and compliance data',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          size: 1024 * 1024 * 128, // 128MB
          compressionRatio: 0.28,
          dataTypes: ['documents', 'assessments', 'standards', 'requirements'],
          organizationId,
          createdBy: 'scheduler',
          status: 'completed',
          verificationStatus: 'verified',
          retentionDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {
            tableCount: 8,
            recordCount: 8945,
            documentCount: 1420,
            userCount: 0,
            checksumMd5: 'c3d4e5f6a1b2'
          }
        }
      ];
      setBackupPoints(demoBackupPoints);

      // Load restore jobs
      const demoRestoreJobs: RestoreJob[] = [
        {
          id: 'restore-1',
          backupId: 'backup-2',
          targetType: 'selective',
          selectedTables: ['documents', 'assessments'],
          status: 'completed',
          progress: 100,
          startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          createdBy: user?.id || 'demo-user',
          mfaVerified: true,
          conflictResolution: 'merge',
          estimatedDuration: 15,
          actualDuration: 12
        },
        {
          id: 'restore-2',
          backupId: 'backup-1',
          targetType: 'preview',
          selectedTables: ['all'],
          status: 'in_progress',
          progress: 65,
          startedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          createdBy: user?.id || 'demo-user',
          mfaVerified: true,
          conflictResolution: 'skip',
          estimatedDuration: 25
        }
      ];
      setRestoreJobs(demoRestoreJobs);

      // Load backup schedules
      const demoSchedules: BackupSchedule[] = [
        {
          id: 'schedule-1',
          name: 'Daily Full Backup',
          frequency: 'daily',
          time: '02:00',
          isActive: true,
          retentionDays: 30,
          includeDocuments: true,
          includeAuditLogs: true,
          compressionLevel: 'standard',
          nextRun: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
          lastRun: demoBackupPoints[0].timestamp,
          organizationId
        },
        {
          id: 'schedule-2',
          name: 'Weekly Archive Backup',
          frequency: 'weekly',
          time: '01:00',
          dayOfWeek: 0, // Sunday
          isActive: true,
          retentionDays: 90,
          includeDocuments: true,
          includeAuditLogs: false,
          compressionLevel: 'maximum',
          nextRun: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          lastRun: demoBackupPoints[2].timestamp,
          organizationId
        }
      ];
      setBackupSchedules(demoSchedules);

      // Load audit entries
      const demoAuditEntries: AuditEntry[] = [
        {
          id: 'audit-1',
          action: 'RESTORE',
          tableName: 'documents',
          recordId: 'doc-123',
          newValues: { title: 'ISO 27001 Assessment', status: 'draft' },
          changedFields: ['title', 'status'],
          userEmail: user?.email || 'demo@auditready.com',
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome/119.0',
          createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          sessionId: 'sess-abc123'
        },
        {
          id: 'audit-2',
          action: 'UPDATE',
          tableName: 'assessments',
          recordId: 'assess-456',
          oldValues: { score: 85 },
          newValues: { score: 92 },
          changedFields: ['score'],
          userEmail: user?.email || 'demo@auditready.com',
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome/119.0',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          sessionId: 'sess-def456'
        }
      ];
      setAuditEntries(demoAuditEntries);

    } catch (error) {
      console.error('Error loading backup data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load backup and restore data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      const newBackup: BackupPoint = {
        id: `backup-${Date.now()}`,
        type: 'manual',
        name: backupForm.name || `Manual Backup ${new Date().toLocaleString()}`,
        description: backupForm.description,
        timestamp: new Date().toISOString(),
        size: Math.floor(Math.random() * 1024 * 1024 * 500), // Random size for demo
        compressionRatio: backupForm.compressionLevel === 'maximum' ? 0.2 : 
                         backupForm.compressionLevel === 'standard' ? 0.35 : 
                         backupForm.compressionLevel === 'fast' ? 0.5 : 1.0,
        dataTypes: backupForm.includeDocuments && backupForm.includeAuditLogs ? 
                  ['all_tables'] : 
                  [...(backupForm.includeDocuments ? ['documents'] : []), 
                   ...(backupForm.includeAuditLogs ? ['audit_logs'] : [])],
        organizationId,
        createdBy: user?.id || 'demo-user',
        status: 'completed',
        verificationStatus: 'verified',
        retentionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          tableCount: 12,
          recordCount: Math.floor(Math.random() * 20000),
          documentCount: Math.floor(Math.random() * 2000),
          userCount: Math.floor(Math.random() * 100),
          checksumMd5: Math.random().toString(36).substring(2, 15)
        }
      };

      setBackupPoints(prev => [newBackup, ...prev]);
      setShowCreateDialog(false);
      setBackupForm({
        name: '',
        description: '',
        includeDocuments: true,
        includeAuditLogs: true,
        compressionLevel: 'standard'
      });

      toast({
        title: 'Backup Created',
        description: `Backup "${newBackup.name}" has been created successfully`
      });
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: 'Error',
        description: 'Failed to create backup',
        variant: 'destructive'
      });
    }
  };

  const handleRestoreFromBackup = async (backupId: string) => {
    try {
      const backup = backupPoints.find(b => b.id === backupId);
      if (!backup) return;

      const newRestore: RestoreJob = {
        id: `restore-${Date.now()}`,
        backupId,
        targetType: selectedTables.includes('all') ? 'full' : 'selective',
        selectedTables,
        status: 'in_progress',
        progress: 0,
        startedAt: new Date().toISOString(),
        createdBy: user?.id || 'demo-user',
        mfaVerified: true,
        conflictResolution: 'merge',
        estimatedDuration: Math.floor(Math.random() * 30) + 10
      };

      setRestoreJobs(prev => [newRestore, ...prev]);
      setShowRestoreDialog(false);

      // Simulate restore progress
      const progressInterval = setInterval(() => {
        setRestoreJobs(prev => prev.map(job => 
          job.id === newRestore.id ? 
            { ...job, progress: Math.min(job.progress + Math.random() * 20, 100) } : 
            job
        ));
      }, 1000);

      // Complete restore after 5 seconds (demo)
      setTimeout(() => {
        clearInterval(progressInterval);
        setRestoreJobs(prev => prev.map(job => 
          job.id === newRestore.id ? 
            { 
              ...job, 
              status: 'completed', 
              progress: 100, 
              completedAt: new Date().toISOString(),
              actualDuration: Math.floor(Math.random() * 20) + 5
            } : 
            job
        ));

        toast({
          title: 'Restore Completed',
          description: `Data has been restored from "${backup.name}"`
        });
      }, 5000);

      toast({
        title: 'Restore Started',
        description: `Restoring data from "${backup.name}"`
      });
    } catch (error) {
      console.error('Error starting restore:', error);
      toast({
        title: 'Error',
        description: 'Failed to start restore operation',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'automatic': return 'bg-blue-100 text-blue-800';
      case 'manual': return 'bg-purple-100 text-purple-800';
      case 'scheduled': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  const getTimeAgo = (timestamp: string) => {
    const date = parseISO(timestamp);
    const now = new Date();
    const hoursAgo = differenceInHours(now, date);
    const daysAgo = differenceInDays(now, date);

    if (hoursAgo < 1) return 'Just now';
    if (hoursAgo < 24) return `${hoursAgo} hour${hoursAgo !== 1 ? 's' : ''} ago`;
    return `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Backup & Restore</h2>
          <p className="text-gray-600">
            Enterprise-grade data protection with time-travel capabilities
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadBackupData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Database className="h-4 w-4 mr-2" />
                Create Backup
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Manual Backup</DialogTitle>
                <DialogDescription>
                  Create a point-in-time backup of your organization's data
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="backupName" className="text-right">Name</Label>
                  <Input
                    id="backupName"
                    value={backupForm.name}
                    onChange={(e) => setBackupForm(prev => ({ ...prev, name: e.target.value }))}
                    className="col-span-3"
                    placeholder="Optional backup name"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="backupDesc" className="text-right">Description</Label>
                  <Input
                    id="backupDesc"
                    value={backupForm.description}
                    onChange={(e) => setBackupForm(prev => ({ ...prev, description: e.target.value }))}
                    className="col-span-3"
                    placeholder="Purpose of this backup"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Include Documents</Label>
                  <Switch
                    checked={backupForm.includeDocuments}
                    onCheckedChange={(checked) => setBackupForm(prev => ({ ...prev, includeDocuments: checked }))}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Include Audit Logs</Label>
                  <Switch
                    checked={backupForm.includeAuditLogs}
                    onCheckedChange={(checked) => setBackupForm(prev => ({ ...prev, includeAuditLogs: checked }))}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="compression" className="text-right">Compression</Label>
                  <Select
                    value={backupForm.compressionLevel}
                    onValueChange={(value) => setBackupForm(prev => ({ ...prev, compressionLevel: value as any }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Fastest)</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="maximum">Maximum (Smallest)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBackup}>
                  Create Backup
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span>Backup System Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium">System Health</p>
                <p className="text-sm text-gray-600">All systems operational</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">Last Backup</p>
                <p className="text-sm text-gray-600">{getTimeAgo(backupPoints[0]?.timestamp || new Date().toISOString())}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <HardDrive className="h-8 w-8 text-purple-600" />
              <div>
                <p className="font-medium">Storage Used</p>
                <p className="text-sm text-gray-600">
                  {formatFileSize(backupPoints.reduce((sum, bp) => sum + bp.size, 0))}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <p className="font-medium">Recovery Rate</p>
                <p className="text-sm text-gray-600">99.9% success rate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="backups" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="backups">Backup Points</TabsTrigger>
          <TabsTrigger value="restore">Restore Jobs</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Backup Points Tab */}
        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Available Backup Points</CardTitle>
                <div className="flex space-x-2">
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="24h">Last 24h</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search backups..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-48"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backupPoints
                  .filter(bp => 
                    searchQuery === '' || 
                    bp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    bp.description?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((backup) => (
                    <motion.div
                      key={backup.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold">{backup.name}</h3>
                            <Badge className={getTypeColor(backup.type)}>
                              {backup.type}
                            </Badge>
                            <Badge className={getStatusColor(backup.status)}>
                              {backup.status}
                            </Badge>
                            {backup.verificationStatus === 'verified' && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          
                          {backup.description && (
                            <p className="text-sm text-gray-600 mb-3">{backup.description}</p>
                          )}
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Created</p>
                              <p className="font-medium">{format(parseISO(backup.timestamp), 'MMM d, yyyy HH:mm')}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Size</p>
                              <p className="font-medium">{formatFileSize(backup.size)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Compression</p>
                              <p className="font-medium">{Math.round((1 - backup.compressionRatio) * 100)}%</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Records</p>
                              <p className="font-medium">{backup.metadata.recordCount.toLocaleString()}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mt-3">
                            {backup.dataTypes.map((type) => (
                              <Badge key={type} variant="outline" className="text-xs">
                                {type.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setActiveBackup(backup);
                              setShowRestoreDialog(true);
                            }}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Restore
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Restore Jobs Tab */}
        <TabsContent value="restore" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Restore Operations</CardTitle>
              <p className="text-sm text-gray-600">
                Monitor and manage data restoration jobs
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {restoreJobs.map((job) => {
                  const backup = backupPoints.find(bp => bp.id === job.backupId);
                  return (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">
                            Restore from "{backup?.name || 'Unknown Backup'}"
                          </h3>
                          <p className="text-sm text-gray-600">
                            {job.targetType === 'full' ? 'Full restore' : 
                             job.targetType === 'selective' ? `Selective: ${job.selectedTables.join(', ')}` :
                             'Preview mode'}
                          </p>
                        </div>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {job.status === 'in_progress' && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">Progress</span>
                            <span className="text-sm font-medium">{Math.round(job.progress)}%</span>
                          </div>
                          <Progress value={job.progress} className="h-2" />
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Started</p>
                          <p className="font-medium">{getTimeAgo(job.startedAt)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Duration</p>
                          <p className="font-medium">
                            {job.actualDuration ? `${job.actualDuration}m` : 
                             job.status === 'in_progress' ? `${job.estimatedDuration}m est.` : 
                             '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Conflict Resolution</p>
                          <p className="font-medium capitalize">{job.conflictResolution}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">MFA Verified</p>
                          <p className="font-medium">
                            {job.mfaVerified ? (
                              <span className="text-green-600">✓ Yes</span>
                            ) : (
                              <span className="text-red-600">✗ No</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {restoreJobs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <RotateCcw className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No restore operations found.</p>
                    <p className="text-sm">Restore from a backup point to see operations here.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Backup Schedules</CardTitle>
                <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Timer className="h-4 w-4 mr-2" />
                      Add Schedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Create Backup Schedule</DialogTitle>
                      <DialogDescription>
                        Set up automated backups for your organization
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="scheduleName" className="text-right">Name</Label>
                        <Input
                          id="scheduleName"
                          value={scheduleForm.name}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, name: e.target.value }))}
                          className="col-span-3"
                          placeholder="e.g., Daily Backup"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="frequency" className="text-right">Frequency</Label>
                        <Select
                          value={scheduleForm.frequency}
                          onValueChange={(value) => setScheduleForm(prev => ({ ...prev, frequency: value as any }))}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="time" className="text-right">Time</Label>
                        <Input
                          id="time"
                          type="time"
                          value={scheduleForm.time}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="retention" className="text-right">Retention (days)</Label>
                        <Input
                          id="retention"
                          type="number"
                          value={scheduleForm.retentionDays}
                          onChange={(e) => setScheduleForm(prev => ({ ...prev, retentionDays: parseInt(e.target.value) }))}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => {
                        // Create schedule logic here
                        setShowScheduleDialog(false);
                        toast({
                          title: 'Schedule Created',
                          description: `Backup schedule "${scheduleForm.name}" has been created`
                        });
                      }}>
                        Create Schedule
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backupSchedules.map((schedule) => (
                  <div key={schedule.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{schedule.name}</h3>
                        <p className="text-sm text-gray-600">
                          {schedule.frequency} at {schedule.time}
                          {schedule.dayOfWeek !== undefined && ' on Sundays'}
                          {schedule.dayOfMonth !== undefined && ` on day ${schedule.dayOfMonth}`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={schedule.isActive}
                          onCheckedChange={(checked) => {
                            setBackupSchedules(prev => prev.map(s => 
                              s.id === schedule.id ? { ...s, isActive: checked } : s
                            ));
                          }}
                        />
                        <Badge className={schedule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {schedule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Next Run</p>
                        <p className="font-medium">{getTimeAgo(schedule.nextRun)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Run</p>
                        <p className="font-medium">
                          {schedule.lastRun ? getTimeAgo(schedule.lastRun) : 'Never'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Retention</p>
                        <p className="font-medium">{schedule.retentionDays} days</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Compression</p>
                        <p className="font-medium capitalize">{schedule.compressionLevel}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Trail Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Restore Audit Trail</CardTitle>
              <p className="text-sm text-gray-600">
                Complete history of all backup and restore operations
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditEntries.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge className={
                            entry.action === 'RESTORE' ? 'bg-blue-100 text-blue-800' :
                            entry.action === 'UPDATE' ? 'bg-green-100 text-green-800' :
                            entry.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {entry.action}
                          </Badge>
                          <span className="font-medium">{entry.tableName}</span>
                          <span className="text-sm text-gray-600">#{entry.recordId}</span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>User: {entry.userEmail}</p>
                          <p>IP: {entry.ipAddress} | Agent: {entry.userAgent}</p>
                          {entry.changedFields.length > 0 && (
                            <p>Changed fields: {entry.changedFields.join(', ')}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right text-sm text-gray-600">
                        <p>{format(parseISO(entry.createdAt), 'MMM d, yyyy')}</p>
                        <p>{format(parseISO(entry.createdAt), 'HH:mm:ss')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{backupPoints.length}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatFileSize(backupPoints.reduce((sum, bp) => sum + bp.size, 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  65% compression avg
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Restore Success</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">99.9%</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Restore Time</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12m</div>
                <p className="text-xs text-muted-foreground">
                  -3m from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Backup Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Backup performance chart</p>
                  <p className="text-sm">Chart visualization would be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Restore Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Restore from Backup</DialogTitle>
            <DialogDescription>
              Restore data from "{activeBackup?.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertTitle>MFA Required</AlertTitle>
              <AlertDescription>
                This operation requires multi-factor authentication verification.
              </AlertDescription>
            </Alert>
            
            <div>
              <Label>Select tables to restore</Label>
              <div className="mt-2 space-y-2">
                {availableTables.map((table) => (
                  <div key={table} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`table-${table}`}
                      checked={selectedTables.includes(table)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTables(prev => [...prev, table]);
                        } else {
                          setSelectedTables(prev => prev.filter(t => t !== table));
                        }
                      }}
                      className="rounded"
                    />
                    <Label htmlFor={`table-${table}`} className="capitalize">
                      {table.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => activeBackup && handleRestoreFromBackup(activeBackup.id)}
              disabled={selectedTables.length === 0}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Start Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}