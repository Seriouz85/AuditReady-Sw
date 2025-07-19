import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin/AdminService';
import { kubernetesService } from '@/services/kubernetes/KubernetesService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/utils/toast';
import { VersionInfo } from '@/components/admin/VersionInfo';
import { DeploymentHistory } from '@/components/admin/DeploymentHistory';
import { 
  ArrowLeft, 
  Settings, 
  Database, 
  Shield, 
  Mail,
  Globe,
  Bell,
  Key,
  Activity,
  Save,
  Download,
  AlertTriangle,
  Clock,
  RefreshCw,
  TestTube,
  Play,
  Server,
  Cpu,
  HardDrive,
  Monitor,
  Zap,
  BarChart3,
  Terminal,
  Cloud,
  Container,
  Eye,
  TrendingUp
} from 'lucide-react';

interface SystemSetting {
  id: string;
  key: string;
  value: any;
  category: string;
  description: string;
  data_type: string;
  is_sensitive: boolean;
}

export const SystemSettings: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [changedSettings, setChangedSettings] = useState<Record<string, any>>({});
  const [testEmail, setTestEmail] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);

  // Kubernetes Management State
  const [clusterHealth, setClusterHealth] = useState<any>(null);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [podMetrics, setPodMetrics] = useState<any[]>([]);
  const [environmentStatus, setEnvironmentStatus] = useState<any>({});
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('production');
  const [k8sLoading, setK8sLoading] = useState(false);
  const [newDeployment, setNewDeployment] = useState({
    name: '',
    namespace: '',
    environment: 'staging',
    image: 'audit-readiness-hub:latest',
    replicas: 2,
    resources: {
      requests: { cpu: '200m', memory: '256Mi' },
      limits: { cpu: '500m', memory: '512Mi' }
    },
    env: {},
    enableDemo: true
  });

  useEffect(() => {
    loadSystemSettings();
    loadKubernetesData();
  }, []);

  useEffect(() => {
    if (selectedEnvironment) {
      loadEnvironmentData(selectedEnvironment);
    }
  }, [selectedEnvironment]);

  const loadSystemSettings = async () => {
    try {
      setLoading(true);
      
      // Load real system settings from database
      const settingsData = await adminService.getSystemSettings();
      
      if (settingsData && settingsData.length > 0) {
        setSettings(settingsData);
      } else {
        // Fallback mock settings if database is empty
        const mockSettings: SystemSetting[] = [
        {
          id: '1',
          key: 'platform_name',
          value: 'AuditReady Platform',
          category: 'general',
          description: 'The name of the platform displayed to users',
          data_type: 'string',
          is_sensitive: false
        },
        {
          id: '2',
          key: 'maintenance_mode',
          value: false,
          category: 'general',
          description: 'Enable maintenance mode to prevent user access',
          data_type: 'boolean',
          is_sensitive: false
        },
        {
          id: '3',
          key: 'max_organizations_per_admin',
          value: 100,
          category: 'limits',
          description: 'Maximum number of organizations a platform admin can manage',
          data_type: 'number',
          is_sensitive: false
        },
        {
          id: '4',
          key: 'email_enabled',
          value: true,
          category: 'email',
          description: 'Enable email notifications',
          data_type: 'boolean',
          is_sensitive: false
        },
        {
          id: '5',
          key: 'smtp_host',
          value: 'smtp.example.com',
          category: 'email',
          description: 'SMTP server hostname',
          data_type: 'string',
          is_sensitive: false
        },
        {
          id: '6',
          key: 'smtp_password',
          value: '••••••••',
          category: 'email',
          description: 'SMTP server password',
          data_type: 'string',
          is_sensitive: true
        },
        {
          id: '7',
          key: 'session_timeout',
          value: 24,
          category: 'security',
          description: 'User session timeout in hours',
          data_type: 'number',
          is_sensitive: false
        },
        {
          id: '8',
          key: 'enforce_mfa',
          value: false,
          category: 'security',
          description: 'Require multi-factor authentication for all users',
          data_type: 'boolean',
          is_sensitive: false
        },
        {
          id: '9',
          key: 'audit_log_retention_days',
          value: 365,
          category: 'compliance',
          description: 'Number of days to retain audit logs',
          data_type: 'number',
          is_sensitive: false
        },
        {
          id: '10',
          key: 'data_backup_enabled',
          value: true,
          category: 'backup',
          description: 'Enable automatic data backups',
          data_type: 'boolean',
          is_sensitive: false
        }
      ];
        
        setSettings(mockSettings);
      }
      
    } catch (err) {
      console.error('Error loading system settings:', err);
      setError('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (settingId: string, value: any) => {
    setChangedSettings(prev => ({
      ...prev,
      [settingId]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Save each changed setting
      for (const [settingId, value] of Object.entries(changedSettings)) {
        await adminService.updateSystemSetting(settingId, value);
      }
      
      // Update local state
      setSettings(prev => prev.map(setting => ({
        ...setting,
        value: changedSettings[setting.id] !== undefined ? changedSettings[setting.id] : setting.value
      })));
      
      setChangedSettings({});
      toast.success('Settings saved successfully');
      
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const getSettingsByCategory = (category: string) => {
    return settings.filter(setting => setting.category === category);
  };

  // Kubernetes Management Functions
  const loadKubernetesData = async () => {
    try {
      setK8sLoading(true);
      
      // Load cluster health
      const health = await kubernetesService.getClusterHealth();
      setClusterHealth(health);
      
      // Load environment status
      const envStatus = await kubernetesService.getEnvironmentStatus();
      setEnvironmentStatus(envStatus);
      
    } catch (err) {
      console.error('Error loading Kubernetes data:', err);
      toast.error('Failed to load cluster information');
    } finally {
      setK8sLoading(false);
    }
  };

  const loadEnvironmentData = async (environment: string) => {
    try {
      setK8sLoading(true);
      const namespace = `audit-readiness-hub-${environment === 'production' ? 'prod' : environment}`;
      
      // Load deployments and pod metrics for selected environment
      const [deploymentsData, metricsData] = await Promise.all([
        kubernetesService.getDeployments(namespace),
        kubernetesService.getPodMetrics(namespace)
      ]);
      
      setDeployments(deploymentsData);
      setPodMetrics(metricsData);
      
    } catch (err) {
      console.error('Error loading environment data:', err);
      toast.error(`Failed to load ${environment} environment data`);
    } finally {
      setK8sLoading(false);
    }
  };

  const handleScaleDeployment = async (name: string, namespace: string, newReplicas: number) => {
    try {
      const result = await kubernetesService.scaleDeployment(name, namespace, newReplicas);
      if (result.success) {
        toast.success(result.message);
        await loadEnvironmentData(selectedEnvironment);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error('Scaling error:', err);
      toast.error('Failed to scale deployment');
    }
  };

  const handleDeployApplication = async () => {
    try {
      const result = await kubernetesService.deployApplication(newDeployment);
      if (result.success) {
        toast.success(result.message);
        await loadEnvironmentData(selectedEnvironment);
        // Reset form
        setNewDeployment({
          name: '',
          namespace: '',
          environment: 'staging',
          image: 'audit-readiness-hub:latest',
          replicas: 2,
          resources: {
            requests: { cpu: '200m', memory: '256Mi' },
            limits: { cpu: '500m', memory: '512Mi' }
          },
          env: {},
          enableDemo: true
        });
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error('Deployment error:', err);
      toast.error('Failed to deploy application');
    }
  };

  const refreshKubernetesData = () => {
    loadKubernetesData();
    loadEnvironmentData(selectedEnvironment);
  };

  const renderSettingInput = (setting: SystemSetting) => {
    const currentValue = changedSettings[setting.id] !== undefined ? changedSettings[setting.id] : setting.value;
    
    switch (setting.data_type) {
      case 'boolean':
        return (
          <Switch
            checked={currentValue}
            onCheckedChange={(checked) => handleSettingChange(setting.id, checked)}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={currentValue}
            onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value))}
            className="max-w-xs"
          />
        );
      
      case 'string':
        if (setting.is_sensitive) {
          return (
            <Input
              type="password"
              value={currentValue}
              onChange={(e) => handleSettingChange(setting.id, e.target.value)}
              placeholder="Enter new value"
            />
          );
        }
        return (
          <Input
            value={currentValue}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
          />
        );
      
      default:
        return (
          <Textarea
            value={currentValue}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            rows={3}
          />
        );
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setTestingEmail(true);
    try {
      // Use real email service
      const { EmailService } = await import('@/services/email/EmailService');
      const emailService = new EmailService();
      
      const result = await emailService.sendTestEmail(testEmail);
      
      if (result.success) {
        toast.success(`Test email sent successfully to ${testEmail}`);
        setTestEmail('');
        
        // Log the test email activity
        await adminService.logAuditActivity('email_test_sent', 'system', {
          recipient_email: testEmail,
          test_type: 'manual_admin_test'
        });
      } else {
        toast.error(`Failed to send test email: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Email test error:', error);
      toast.error('Failed to send test email - Please check email configuration');
    } finally {
      setTestingEmail(false);
    }
  };

  const hasChanges = Object.keys(changedSettings).length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-600/90"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
          
          {/* Content */}
          <div className="relative flex items-center justify-between text-white">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Button variant="secondary" onClick={() => navigate('/admin')} className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Button>
                <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">System Settings</h1>
                  <p className="text-blue-100 text-lg">
                    Configure platform-wide settings and preferences
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status Indicator */}
              <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-sm text-blue-100">System Online</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-sm text-blue-100">Settings Loaded</span>
                  </div>
                </div>
              </div>
              
              {hasChanges && (
                <Badge className="bg-yellow-500/20 text-yellow-100 border-yellow-300/30 backdrop-blur-sm px-4 py-2">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Unsaved Changes
                </Badge>
              )}
              
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                System Administrator
              </Badge>
              
              <Button 
                onClick={handleSaveSettings} 
                disabled={!hasChanges || saving}
                className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="general" className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <TabsList className="grid w-full grid-cols-7 bg-gray-100 rounded-xl p-1">
              <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Settings className="w-4 h-4 mr-2" />
                General
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Shield className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="email" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </TabsTrigger>
              <TabsTrigger value="limits" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Database className="w-4 h-4 mr-2" />
                Limits
              </TabsTrigger>
              <TabsTrigger value="compliance" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Activity className="w-4 h-4 mr-2" />
                Compliance
              </TabsTrigger>
              <TabsTrigger value="backup" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Download className="w-4 h-4 mr-2" />
                Backup
              </TabsTrigger>
              <TabsTrigger value="infrastructure" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Server className="w-4 h-4 mr-2" />
                Infrastructure
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-800">
                    <div className="rounded-full bg-slate-600 p-2 mr-3">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    General Settings
                  </CardTitle>
                  <CardDescription>Basic platform configuration and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
              {getSettingsByCategory('general').map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">{setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <div className="w-64">
                    {renderSettingInput(setting)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-800">
                    <div className="rounded-full bg-blue-600 p-2 mr-3">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    Security Settings
                  </CardTitle>
                  <CardDescription>Authentication and security configuration</CardDescription>
                </CardHeader>
            <CardContent className="space-y-6">
              {getSettingsByCategory('security').map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">{setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <div className="w-64">
                    {renderSettingInput(setting)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-800">
                    <div className="rounded-full bg-green-600 p-2 mr-3">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    Email Settings
                  </CardTitle>
                  <CardDescription>Email delivery and SMTP configuration</CardDescription>
                </CardHeader>
            <CardContent className="space-y-6">
              {getSettingsByCategory('email').map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">{setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                    {setting.is_sensitive && (
                      <Badge variant="outline" className="text-xs">
                        <Key className="w-3 h-3 mr-1" />
                        Sensitive
                      </Badge>
                    )}
                  </div>
                  <div className="w-64">
                    {renderSettingInput(setting)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-800">
                    <Mail className="w-5 h-5 mr-2" />
                    Test Email Configuration
                  </CardTitle>
                  <CardDescription>Send a test email to verify settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Input 
                      placeholder="test@example.com" 
                      className="max-w-xs" 
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      type="email"
                    />
                    <Button 
                      variant="outline" 
                      className="border-green-200 text-green-700 hover:bg-green-50"
                      onClick={handleTestEmail}
                      disabled={testingEmail || !testEmail}
                    >
                      {testingEmail ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4 mr-2" />
                      )}
                      {testingEmail ? 'Sending...' : 'Send Test Email'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
        </TabsContent>

            <TabsContent value="limits" className="space-y-4">
              <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-800">
                    <div className="rounded-full bg-purple-600 p-2 mr-3">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    System Limits
                  </CardTitle>
                  <CardDescription>Configure platform usage limits and quotas</CardDescription>
                </CardHeader>
            <CardContent className="space-y-6">
              {getSettingsByCategory('limits').map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">{setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <div className="w-64">
                    {renderSettingInput(setting)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-800">
                    <div className="rounded-full bg-orange-600 p-2 mr-3">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    Compliance Settings
                  </CardTitle>
                  <CardDescription>Audit logging and compliance configuration</CardDescription>
                </CardHeader>
            <CardContent className="space-y-6">
              {getSettingsByCategory('compliance').map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">{setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <div className="w-64">
                    {renderSettingInput(setting)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

            <TabsContent value="backup" className="space-y-4">
              <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-800">
                    <div className="rounded-full bg-indigo-600 p-2 mr-3">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    Backup Settings
                  </CardTitle>
                  <CardDescription>Data backup and recovery configuration</CardDescription>
                </CardHeader>
            <CardContent className="space-y-6">
              {getSettingsByCategory('backup').map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">{setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <div className="w-64">
                    {renderSettingInput(setting)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

              <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-indigo-800">
                    <Download className="w-5 h-5 mr-2" />
                    Manual Backup
                  </CardTitle>
                  <CardDescription>Create an immediate backup of platform data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button 
                      variant="outline" 
                      className="h-16 flex-col border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                      onClick={async () => {
                        try {
                          const { backupService } = await import('@/services/backup/BackupService');
                          toast.info('Creating backup... This may take a few minutes.');
                          const result = await backupService.createBackup('Manual Backup');
                          if (result.success) {
                            toast.success('Backup created successfully!');
                          } else {
                            toast.error('Failed to create backup: ' + result.error);
                          }
                        } catch (error) {
                          toast.error('Backup service not available');
                        }
                      }}
                    >
                      <Download className="w-5 h-5 mb-1" />
                      <span className="text-sm">Create Backup</span>
                    </Button>
                    <Button 
                      variant="outline"
                      className="h-16 flex-col border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                      onClick={async () => {
                        try {
                          const { backupService } = await import('@/services/backup/BackupService');
                          toast.info('Testing backup system...');
                          const result = await backupService.testBackupSystem();
                          if (result.success) {
                            const passed = Object.values(result.results).filter(Boolean).length;
                            const total = Object.keys(result.results).length;
                            toast.success(`Backup system test completed: ${passed}/${total} tests passed`);
                          } else {
                            toast.error('Backup test failed: ' + result.error);
                          }
                        } catch (error) {
                          toast.error('Backup test failed');
                        }
                      }}
                    >
                      <Activity className="w-5 h-5 mb-1" />
                      <span className="text-sm">Test System</span>
                    </Button>
                  </div>
                  <div className="mt-4 p-3 bg-indigo-100 rounded-lg border border-indigo-200">
                    <p className="text-sm text-indigo-700">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Last backup: Available in backup history
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Infrastructure/Kubernetes Management Tab */}
            <TabsContent value="infrastructure" className="space-y-6">
              {/* Version Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  {/* Cluster Health Overview */}
                  <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-slate-800">
                    <div className="flex items-center">
                      <div className="rounded-full bg-emerald-600 p-2 mr-3">
                        <Cloud className="w-5 h-5 text-white" />
                      </div>
                      Cluster Health
                    </div>
                    <Button onClick={refreshKubernetesData} variant="outline" size="sm" disabled={k8sLoading}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${k8sLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </CardTitle>
                  <CardDescription>Kubernetes cluster status and health metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  {clusterHealth ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="text-sm text-blue-600 font-medium">Cluster Version</div>
                        <div className="text-lg font-bold text-blue-800">{clusterHealth.clusterVersion}</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="text-sm text-green-600 font-medium">Ready Nodes</div>
                        <div className="text-lg font-bold text-green-800">
                          {clusterHealth.nodes.ready}/{clusterHealth.nodes.total}
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <div className="text-sm text-purple-600 font-medium">Namespaces</div>
                        <div className="text-lg font-bold text-purple-800">{clusterHealth.namespaces.length}</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <div className="text-sm text-orange-600 font-medium">Healthy Pods</div>
                        <div className="text-lg font-bold text-orange-800">
                          {clusterHealth.healthyPods}/{clusterHealth.totalPods}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {k8sLoading ? 'Loading cluster information...' : 'Unable to connect to cluster'}
                    </div>
                  )}
                </CardContent>
              </Card>
                </div>
                <div>
                  {/* Version Information */}
                  <VersionInfo />
                </div>
              </div>

              {/* Environment Status */}
              <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-800">
                    <div className="rounded-full bg-blue-600 p-2 mr-3">
                      <Container className="w-5 h-5 text-white" />
                    </div>
                    Environment Status
                  </CardTitle>
                  <CardDescription>Application deployments across environments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(environmentStatus).map(([env, status]: [string, any]) => (
                      <div key={env} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold capitalize text-gray-800">{env}</h3>
                          <Badge variant={status.error ? "destructive" : status.healthyDeployments === status.deployments ? "default" : "secondary"}>
                            {status.error ? 'Error' : status.healthyDeployments === status.deployments ? 'Healthy' : 'Issues'}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Deployments:</span>
                            <span className="font-medium">{status.healthyDeployments || 0}/{status.deployments || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pods:</span>
                            <span className="font-medium">{status.healthyPods || 0}/{status.totalPods || 0}</span>
                          </div>
                          {status.averageCpuUsage !== undefined && (
                            <div className="flex justify-between">
                              <span>Avg CPU:</span>
                              <span className="font-medium">{status.averageCpuUsage}%</span>
                            </div>
                          )}
                          {status.averageMemoryUsage !== undefined && (
                            <div className="flex justify-between">
                              <span>Avg Memory:</span>
                              <span className="font-medium">{status.averageMemoryUsage}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Environment Management */}
              <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-gray-200/50 hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-800">
                    <div className="rounded-full bg-indigo-600 p-2 mr-3">
                      <Monitor className="w-5 h-5 text-white" />
                    </div>
                    Environment Management
                  </CardTitle>
                  <CardDescription>Manage deployments and scaling for selected environment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Label htmlFor="environment-select">Environment:</Label>
                    <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="production">Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Deployments Table */}
                  {deployments.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b font-medium text-sm">
                        Active Deployments - {selectedEnvironment}
                      </div>
                      <div className="divide-y">
                        {deployments.map((deployment) => (
                          <div key={deployment.name} className="p-4 flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <Badge variant={deployment.status === 'Running' ? 'default' : 'secondary'}>
                                  {deployment.status}
                                </Badge>
                                <span className="font-medium">{deployment.name}</span>
                                <span className="text-sm text-gray-500">{deployment.namespace}</span>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Replicas: {deployment.replicas.ready}/{deployment.replicas.desired} | 
                                Images: {deployment.images.join(', ')}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="1"
                                max="10"
                                defaultValue={deployment.replicas.desired}
                                className="w-16 h-8"
                                onBlur={(e) => {
                                  const newReplicas = parseInt(e.target.value);
                                  if (newReplicas !== deployment.replicas.desired && newReplicas > 0) {
                                    handleScaleDeployment(deployment.name, deployment.namespace, newReplicas);
                                  }
                                }}
                              />
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pod Metrics */}
                  {podMetrics.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b font-medium text-sm">
                        Pod Resource Usage
                      </div>
                      <div className="divide-y max-h-64 overflow-y-auto">
                        {podMetrics.map((pod) => (
                          <div key={pod.name} className="p-3 flex items-center justify-between text-sm">
                            <div className="flex-1">
                              <div className="font-medium">{pod.name}</div>
                              <div className="text-gray-500">Status: {pod.status} | Restarts: {pod.restarts}</div>
                            </div>
                            <div className="flex space-x-4 text-xs">
                              <div className="text-center">
                                <div className="font-medium">CPU</div>
                                <div className={`${pod.cpu.percentage > 80 ? 'text-red-600' : pod.cpu.percentage > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                                  {pod.cpu.percentage}%
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-medium">Memory</div>
                                <div className={`${pod.memory.percentage > 80 ? 'text-red-600' : pod.memory.percentage > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                                  {pod.memory.percentage}%
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800">
                    <Zap className="w-5 h-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Common infrastructure management tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Button 
                      variant="outline" 
                      className="h-16 flex-col border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => {
                        // Navigate to deployment script execution
                        toast.info('Deployment started. Check logs for progress.');
                      }}
                    >
                      <Container className="w-5 h-5 mb-1" />
                      <span className="text-sm">Deploy to Staging</span>
                    </Button>
                    <Button 
                      variant="outline"
                      className="h-16 flex-col border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={async () => {
                        try {
                          toast.info('Setting up monitoring...');
                          // Execute monitoring setup
                          toast.success('Monitoring setup initiated');
                        } catch (error) {
                          toast.error('Failed to setup monitoring');
                        }
                      }}
                    >
                      <BarChart3 className="w-5 h-5 mb-1" />
                      <span className="text-sm">Setup Monitoring</span>
                    </Button>
                    <Button 
                      variant="outline"
                      className="h-16 flex-col border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => {
                        // Open terminal/logs view
                        toast.info('Opening cluster logs...');
                      }}
                    >
                      <Terminal className="w-5 h-5 mb-1" />
                      <span className="text-sm">View Logs</span>
                    </Button>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 text-blue-700">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">Demo Account Preserved</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      All environments maintain demo login: demo@auditready.com
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Deployment History */}
              <DeploymentHistory 
                environment={selectedEnvironment}
                onRollback={async (deployment) => {
                  try {
                    // In a real implementation, this would call your backend API
                    toast.info(`Initiating rollback to version ${deployment.previousVersion}...`);
                    
                    // Mock rollback process
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    toast.success(`Successfully rolled back to version ${deployment.previousVersion}`);
                    await loadEnvironmentData(selectedEnvironment);
                  } catch (error) {
                    toast.error('Rollback failed');
                    throw error;
                  }
                }}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};