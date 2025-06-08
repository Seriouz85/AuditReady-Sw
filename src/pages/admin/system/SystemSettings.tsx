import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin/AdminService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  AlertTriangle
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

  useEffect(() => {
    loadSystemSettings();
  }, []);

  const loadSystemSettings = async () => {
    try {
      setLoading(true);
      
      // Mock system settings - in production, load from adminService.getSystemSettings()
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
      
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const getSettingsByCategory = (category: string) => {
    return settings.filter(setting => setting.category === category);
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

  const hasChanges = Object.keys(changedSettings).length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">System Settings</h1>
            <p className="text-muted-foreground">
              Configure platform-wide settings and preferences
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
              Unsaved Changes
            </Badge>
          )}
          <Button 
            onClick={handleSaveSettings} 
            disabled={!hasChanges || saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="limits">Limits</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                General Settings
              </CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
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

          <Card>
            <CardHeader>
              <CardTitle>Test Email Configuration</CardTitle>
              <CardDescription>Send a test email to verify settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Input placeholder="test@example.com" className="max-w-xs" />
                <Button variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Test Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
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

          <Card>
            <CardHeader>
              <CardTitle>Manual Backup</CardTitle>
              <CardDescription>Create an immediate backup of platform data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Create Backup
                </Button>
                <div className="text-sm text-muted-foreground">
                  Last backup: Never
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};