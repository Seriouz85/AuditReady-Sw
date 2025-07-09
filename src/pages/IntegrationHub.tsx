import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Settings, 
  Activity, 
  Zap, 
  Link,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Upload,
  Shield,
  Database,
  Cloud,
  Workflow,
  MessageSquare,
  FileText,
  BarChart3,
  Users,
  Lock,
  Globe,
  Server,
  Smartphone
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Integration {
  id: string;
  name: string;
  description: string;
  type: 'api' | 'webhook' | 'file_sync' | 'database' | 'cloud_service';
  status: 'active' | 'inactive' | 'error' | 'pending';
  provider: string;
  config: Record<string, any>;
  lastSync?: Date;
  syncFrequency?: string;
  dataTypes: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface IntegrationTemplate {
  id: string;
  name: string;
  description: string;
  provider: string;
  type: string;
  logo?: string;
  category: 'security' | 'hr' | 'finance' | 'it' | 'compliance' | 'communication';
  popular: boolean;
  config: {
    fields: Array<{
      name: string;
      type: 'text' | 'password' | 'url' | 'number' | 'select';
      required: boolean;
      description: string;
      options?: string[];
    }>;
  };
}

const IntegrationHub: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [templates, setTemplates] = useState<IntegrationTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<IntegrationTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntegrations();
    loadTemplates();
  }, []);

  const loadIntegrations = async () => {
    try {
      // Mock data - in real app would fetch from database
      const mockIntegrations: Integration[] = [
        {
          id: '1',
          name: 'Okta SSO',
          description: 'Single Sign-On integration with Okta for user authentication',
          type: 'api',
          status: 'active',
          provider: 'Okta',
          config: { domain: 'company.okta.com', clientId: '***' },
          lastSync: new Date('2024-01-08T10:00:00Z'),
          syncFrequency: 'real-time',
          dataTypes: ['users', 'groups', 'authentication'],
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-08T10:00:00Z')
        },
        {
          id: '2',
          name: 'AWS CloudTrail',
          description: 'Import security logs and compliance data from AWS CloudTrail',
          type: 'api',
          status: 'active',
          provider: 'AWS',
          config: { region: 'us-east-1', bucket: 'compliance-logs' },
          lastSync: new Date('2024-01-08T09:30:00Z'),
          syncFrequency: 'hourly',
          dataTypes: ['logs', 'security_events', 'access_records'],
          createdAt: new Date('2024-01-02T00:00:00Z'),
          updatedAt: new Date('2024-01-08T09:30:00Z')
        },
        {
          id: '3',
          name: 'Slack Notifications',
          description: 'Send compliance alerts and updates to Slack channels',
          type: 'webhook',
          status: 'active',
          provider: 'Slack',
          config: { webhook_url: 'https://hooks.slack.com/***', channel: '#compliance' },
          lastSync: new Date('2024-01-08T11:15:00Z'),
          syncFrequency: 'real-time',
          dataTypes: ['notifications', 'alerts'],
          createdAt: new Date('2024-01-03T00:00:00Z'),
          updatedAt: new Date('2024-01-08T11:15:00Z')
        },
        {
          id: '4',
          name: 'Microsoft 365',
          description: 'Sync user data and security policies from Microsoft 365',
          type: 'api',
          status: 'error',
          provider: 'Microsoft',
          config: { tenant_id: '***', client_id: '***' },
          lastSync: new Date('2024-01-07T14:20:00Z'),
          syncFrequency: 'daily',
          dataTypes: ['users', 'policies', 'security_settings'],
          createdAt: new Date('2024-01-04T00:00:00Z'),
          updatedAt: new Date('2024-01-07T14:20:00Z')
        },
        {
          id: '5',
          name: 'Microsoft Teams',
          description: 'Send compliance notifications and alerts to Teams channels',
          type: 'webhook',
          status: 'active',
          provider: 'Teams',
          config: { webhook_url: 'https://hooks.office.com/***', team_name: 'Compliance Team' },
          lastSync: new Date('2024-01-08T12:00:00Z'),
          syncFrequency: 'real-time',
          dataTypes: ['notifications', 'alerts', 'compliance_updates'],
          createdAt: new Date('2024-01-05T00:00:00Z'),
          updatedAt: new Date('2024-01-08T12:00:00Z')
        },
        {
          id: '6',
          name: 'SharePoint',
          description: 'Sync compliance documents and manage document libraries',
          type: 'api',
          status: 'active',
          provider: 'SharePoint',
          config: { site_url: 'https://company.sharepoint.com/***', document_library: 'Compliance Docs' },
          lastSync: new Date('2024-01-08T11:30:00Z'),
          syncFrequency: 'hourly',
          dataTypes: ['documents', 'policies', 'procedures'],
          createdAt: new Date('2024-01-06T00:00:00Z'),
          updatedAt: new Date('2024-01-08T11:30:00Z')
        }
      ];
      setIntegrations(mockIntegrations);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    const mockTemplates: IntegrationTemplate[] = [
      {
        id: 'okta',
        name: 'Okta',
        description: 'Connect with Okta for identity and access management',
        provider: 'Okta',
        type: 'api',
        category: 'security',
        popular: true,
        config: {
          fields: [
            { name: 'domain', type: 'text', required: true, description: 'Your Okta domain (e.g., company.okta.com)' },
            { name: 'api_token', type: 'password', required: true, description: 'Okta API token' },
            { name: 'sync_frequency', type: 'select', required: true, description: 'How often to sync data', options: ['real-time', 'hourly', 'daily'] }
          ]
        }
      },
      {
        id: 'aws',
        name: 'AWS',
        description: 'Import compliance data from AWS services',
        provider: 'Amazon',
        type: 'api',
        category: 'security',
        popular: true,
        config: {
          fields: [
            { name: 'access_key', type: 'text', required: true, description: 'AWS Access Key ID' },
            { name: 'secret_key', type: 'password', required: true, description: 'AWS Secret Access Key' },
            { name: 'region', type: 'select', required: true, description: 'AWS Region', options: ['us-east-1', 'us-west-2', 'eu-west-1'] },
            { name: 'services', type: 'text', required: false, description: 'Comma-separated list of services to monitor' }
          ]
        }
      },
      {
        id: 'azure',
        name: 'Microsoft Azure',
        description: 'Connect with Azure for security and compliance monitoring',
        provider: 'Microsoft',
        type: 'api',
        category: 'security',
        popular: true,
        config: {
          fields: [
            { name: 'tenant_id', type: 'text', required: true, description: 'Azure Tenant ID' },
            { name: 'client_id', type: 'text', required: true, description: 'Application (client) ID' },
            { name: 'client_secret', type: 'password', required: true, description: 'Client Secret' },
            { name: 'subscription_id', type: 'text', required: true, description: 'Azure Subscription ID' }
          ]
        }
      },
      {
        id: 'slack',
        name: 'Slack',
        description: 'Send notifications and alerts to Slack channels',
        provider: 'Slack',
        type: 'webhook',
        category: 'communication',
        popular: true,
        config: {
          fields: [
            { name: 'webhook_url', type: 'url', required: true, description: 'Slack webhook URL' },
            { name: 'channel', type: 'text', required: true, description: 'Default channel for notifications' },
            { name: 'username', type: 'text', required: false, description: 'Bot username (optional)' }
          ]
        }
      },
      {
        id: 'jira',
        name: 'Jira',
        description: 'Create and manage compliance issues in Jira',
        provider: 'Atlassian',
        type: 'api',
        category: 'it',
        popular: false,
        config: {
          fields: [
            { name: 'base_url', type: 'url', required: true, description: 'Jira base URL' },
            { name: 'username', type: 'text', required: true, description: 'Jira username or email' },
            { name: 'api_token', type: 'password', required: true, description: 'Jira API token' },
            { name: 'project_key', type: 'text', required: true, description: 'Project key for compliance issues' }
          ]
        }
      },
      {
        id: 'servicenow',
        name: 'ServiceNow',
        description: 'Integrate with ServiceNow for incident and change management',
        provider: 'ServiceNow',
        type: 'api',
        category: 'it',
        popular: false,
        config: {
          fields: [
            { name: 'instance_url', type: 'url', required: true, description: 'ServiceNow instance URL' },
            { name: 'username', type: 'text', required: true, description: 'ServiceNow username' },
            { name: 'password', type: 'password', required: true, description: 'ServiceNow password' },
            { name: 'table', type: 'text', required: false, description: 'Default table name' }
          ]
        }
      },
      {
        id: 'teams',
        name: 'Microsoft Teams',
        description: 'Send compliance notifications and collaborate through Teams',
        provider: 'Microsoft',
        type: 'webhook',
        category: 'communication',
        popular: true,
        config: {
          fields: [
            { name: 'webhook_url', type: 'url', required: true, description: 'Teams webhook URL' },
            { name: 'team_name', type: 'text', required: true, description: 'Team name for notifications' },
            { name: 'channel', type: 'text', required: true, description: 'Default channel for compliance alerts' },
            { name: 'mention_users', type: 'text', required: false, description: 'Users to mention for critical alerts (comma-separated)' }
          ]
        }
      },
      {
        id: 'sharepoint',
        name: 'SharePoint',
        description: 'Sync compliance documents and manage document libraries',
        provider: 'Microsoft',
        type: 'api',
        category: 'compliance',
        popular: true,
        config: {
          fields: [
            { name: 'site_url', type: 'url', required: true, description: 'SharePoint site URL' },
            { name: 'tenant_id', type: 'text', required: true, description: 'Azure Tenant ID' },
            { name: 'client_id', type: 'text', required: true, description: 'Application (client) ID' },
            { name: 'client_secret', type: 'password', required: true, description: 'Client Secret' },
            { name: 'document_library', type: 'text', required: false, description: 'Default document library name' }
          ]
        }
      },
      {
        id: 'github',
        name: 'GitHub',
        description: 'Monitor code security and compliance in repositories',
        provider: 'GitHub',
        type: 'api',
        category: 'security',
        popular: false,
        config: {
          fields: [
            { name: 'api_token', type: 'password', required: true, description: 'GitHub Personal Access Token' },
            { name: 'organization', type: 'text', required: true, description: 'GitHub organization name' },
            { name: 'repositories', type: 'text', required: false, description: 'Repositories to monitor (comma-separated, leave empty for all)' },
            { name: 'webhook_secret', type: 'password', required: false, description: 'Webhook secret for real-time updates' }
          ]
        }
      },
      {
        id: 'google_workspace',
        name: 'Google Workspace',
        description: 'Connect with Google Workspace for user and security management',
        provider: 'Google',
        type: 'api',
        category: 'security',
        popular: true,
        config: {
          fields: [
            { name: 'service_account_key', type: 'password', required: true, description: 'Service Account JSON Key' },
            { name: 'domain', type: 'text', required: true, description: 'Google Workspace domain' },
            { name: 'admin_email', type: 'text', required: true, description: 'Admin email for impersonation' },
            { name: 'sync_frequency', type: 'select', required: true, description: 'How often to sync data', options: ['real-time', 'hourly', 'daily'] }
          ]
        }
      }
    ];
    setTemplates(mockTemplates);
  };

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive': return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: Integration['type']) => {
    switch (type) {
      case 'api': return <Zap className="h-4 w-4" />;
      case 'webhook': return <Link className="h-4 w-4" />;
      case 'file_sync': return <Upload className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'cloud_service': return <Cloud className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getProviderIcon = (provider: string, large: boolean = false) => {
    const size = large ? "w-8 h-8" : "w-5 h-5";
    const providerLower = provider.toLowerCase();
    
    // Official brand icons using SVG paths
    switch (providerLower) {
      case 'okta': 
        return (
          <div className={`${size} flex items-center justify-center`}>
            <svg className={size} viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="4" fill="#007DC1"/>
              <path d="M12 6L8 10L12 14L16 10L12 6Z" fill="white"/>
              <circle cx="12" cy="17" r="1.5" fill="white"/>
            </svg>
          </div>
        );
      case 'amazon': 
      case 'aws': 
        return (
          <div className={`${size} flex items-center justify-center`}>
            <svg className={size} viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="4" fill="#FF9900"/>
              <path d="M8.5 12.5C8.5 11.12 9.62 10 11 10H13C14.38 10 15.5 11.12 15.5 12.5V14H8.5V12.5Z" fill="white"/>
              <path d="M6 17C6 15.9 6.9 15 8 15H16C17.1 15 18 15.9 18 17V18H6V17Z" fill="white"/>
              <path d="M4 8L12 12L20 8" stroke="white" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
        );
      case 'microsoft': 
      case 'azure':
        return (
          <div className={`${size} flex items-center justify-center`}>
            <svg className={size} viewBox="0 0 24 24" fill="none">
              <rect width="10" height="10" x="2" y="2" fill="#F25022"/>
              <rect width="10" height="10" x="12" y="2" fill="#7FBA00"/>
              <rect width="10" height="10" x="2" y="12" fill="#00A4EF"/>
              <rect width="10" height="10" x="12" y="12" fill="#FFB900"/>
            </svg>
          </div>
        );
      case 'teams':
        return (
          <div className={`${size} flex items-center justify-center`}>
            <svg className={size} viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="4" fill="#6264A7"/>
              <path d="M8 6H16C17.1 6 18 6.9 18 8V16C18 17.1 17.1 18 16 18H8C6.9 18 6 17.1 6 16V8C6 6.9 6.9 6 8 6Z" fill="white"/>
              <circle cx="10" cy="10" r="2" fill="#6264A7"/>
              <path d="M14 14C14 12.9 13.1 12 12 12C10.9 12 10 12.9 10 14V16H14V14Z" fill="#6264A7"/>
            </svg>
          </div>
        );
      case 'sharepoint':
        return (
          <div className={`${size} flex items-center justify-center`}>
            <svg className={size} viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="4" fill="#0078D4"/>
              <path d="M6 8H18V10H6V8Z" fill="white"/>
              <path d="M6 11H18V13H6V11Z" fill="white"/>
              <path d="M6 14H14V16H6V14Z" fill="white"/>
              <circle cx="17" cy="15" r="1" fill="white"/>
            </svg>
          </div>
        );
      case 'slack': 
        return (
          <div className={`${size} flex items-center justify-center`}>
            <svg className={size} viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="4" fill="white"/>
              <path d="M8.5 2C7.12 2 6 3.12 6 4.5S7.12 7 8.5 7H10V4.5C10 3.12 8.88 2 7.5 2S5 3.12 5 4.5" fill="#E01E5A"/>
              <path d="M4.5 8.5C3.12 8.5 2 9.62 2 11S3.12 13.5 4.5 13.5H7V11C7 9.62 5.88 8.5 4.5 8.5Z" fill="#36C5F0"/>
              <path d="M15.5 22C16.88 22 18 20.88 18 19.5S16.88 17 15.5 17H14V19.5C14 20.88 15.12 22 16.5 22S19 20.88 19 19.5" fill="#2EB67D"/>
              <path d="M19.5 15.5C20.88 15.5 22 14.38 22 13S20.88 10.5 19.5 10.5H17V13C17 14.38 18.12 15.5 19.5 15.5Z" fill="#ECB22E"/>
            </svg>
          </div>
        );
      case 'atlassian': 
      case 'jira': 
        return (
          <div className={`${size} flex items-center justify-center`}>
            <svg className={size} viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="4" fill="#0052CC"/>
              <path d="M12 2L6 8L12 14L18 8L12 2Z" fill="white"/>
              <path d="M12 10L8 14L12 18L16 14L12 10Z" fill="#2684FF"/>
            </svg>
          </div>
        );
      case 'servicenow': 
        return (
          <div className={`${size} flex items-center justify-center`}>
            <svg className={size} viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="4" fill="#62D84E"/>
              <path d="M8 6H16C17.1 6 18 6.9 18 8V16C18 17.1 17.1 18 16 18H8C6.9 18 6 17.1 6 16V8C6 6.9 6.9 6 8 6Z" fill="white"/>
              <path d="M10 10H14V14H10V10Z" fill="#62D84E"/>
              <circle cx="12" cy="8.5" r="1" fill="#62D84E"/>
              <circle cx="12" cy="15.5" r="1" fill="#62D84E"/>
            </svg>
          </div>
        );
      case 'google': 
        return (
          <div className={`${size} flex items-center justify-center`}>
            <svg className={size} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" fill="white"/>
              <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.84 16.79 15.63 17.52V20.33H19.27C21.19 18.58 22.56 15.7 22.56 12.25Z" fill="#4285F4"/>
              <path d="M12 23C15.24 23 17.96 21.92 19.27 20.33L15.63 17.52C14.61 18.16 13.31 18.53 12 18.53C8.87 18.53 6.22 16.77 5.29 14.2H1.54V17.09C2.85 19.7 7.16 23 12 23Z" fill="#34A853"/>
              <path d="M5.29 14.2C5.09 13.56 4.97 12.89 4.97 12.2S5.09 10.84 5.29 10.2V7.31H1.54C0.56 9.26 0 10.69 0 12.2S0.56 15.14 1.54 17.09L5.29 14.2Z" fill="#FBBC05"/>
              <path d="M12 5.47C13.46 5.47 14.79 5.97 15.82 6.94L19 3.76C17.96 2.81 15.24 1.4 12 1.4C7.16 1.4 2.85 4.7 1.54 7.31L5.29 10.2C6.22 7.63 8.87 5.47 12 5.47Z" fill="#EA4335"/>
            </svg>
          </div>
        );
      case 'github': 
        return (
          <div className={`${size} flex items-center justify-center`}>
            <svg className={size} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" fill="#24292e"/>
              <path d="M12 2C6.48 2 2 6.48 2 12C2 16.42 4.87 20.17 8.84 21.5C9.34 21.58 9.5 21.27 9.5 21C9.5 20.77 9.5 20.14 9.5 19.31C6.73 19.91 6.14 17.97 6.14 17.97C5.68 16.81 5.03 16.5 5.03 16.5C4.12 15.88 5.1 15.9 5.1 15.9C6.1 15.97 6.63 16.93 6.63 16.93C7.5 18.45 8.97 18 9.54 17.76C9.63 17.11 9.89 16.67 10.17 16.42C7.95 16.17 5.62 15.31 5.62 11.5C5.62 10.39 6 9.5 6.65 8.79C6.55 8.54 6.2 7.5 6.75 6.15C6.75 6.15 7.59 5.88 9.5 7.17C10.29 6.95 11.15 6.84 12 6.84C12.85 6.84 13.71 6.95 14.5 7.17C16.41 5.88 17.25 6.15 17.25 6.15C17.8 7.5 17.45 8.54 17.35 8.79C18 9.5 18.38 10.39 18.38 11.5C18.38 15.32 16.04 16.16 13.81 16.41C14.17 16.72 14.5 17.33 14.5 18.26C14.5 19.6 14.5 20.68 14.5 21C14.5 21.27 14.66 21.59 15.17 21.5C19.14 20.16 22 16.42 22 12C22 6.48 17.52 2 12 2Z" fill="white"/>
            </svg>
          </div>
        );
      default: 
        return (
          <div className={`${size} bg-gray-600 rounded-lg flex items-center justify-center`}>
            <Zap className="h-4 w-4 text-white" />
          </div>
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security': return <Shield className="h-4 w-4 text-red-500" />;
      case 'hr': return <Users className="h-4 w-4 text-blue-500" />;
      case 'finance': return <BarChart3 className="h-4 w-4 text-green-500" />;
      case 'it': return <Server className="h-4 w-4 text-purple-500" />;
      case 'compliance': return <Lock className="h-4 w-4 text-orange-500" />;
      case 'communication': return <MessageSquare className="h-4 w-4 text-pink-500" />;
      default: return <Workflow className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'security', 'hr', 'finance', 'it', 'compliance', 'communication'];

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integration Hub</h1>
          <p className="text-muted-foreground">
            Connect AuditReady with your existing tools and services
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Integration</DialogTitle>
              <DialogDescription>
                Choose from our library of pre-built integrations or create a custom one.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search integrations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Popular Integrations */}
              {selectedCategory === 'all' && searchTerm === '' && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Popular Integrations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.filter(t => t.popular).map(template => (
                      <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setSelectedTemplate(template)}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getProviderIcon(template.provider, true)}
                              <CardTitle className="text-lg">{template.name}</CardTitle>
                            </div>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              {getCategoryIcon(template.category)}
                              {template.category}
                            </Badge>
                          </div>
                          <CardDescription>{template.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* All Integrations */}
              <div className="space-y-3">
                <h3 className="font-semibold">
                  {selectedCategory === 'all' ? 'All Integrations' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Integrations`}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map(template => (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedTemplate(template)}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getProviderIcon(template.provider)}
                            <CardTitle className="text-sm">{template.name}</CardTitle>
                          </div>
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            {getTypeIcon(template.type)}
                            {template.type}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs">{template.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrations.length}</div>
            <p className="text-xs text-muted-foreground">
              {integrations.filter(i => i.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.filter(i => i.type === 'api' || i.type === 'database').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Actively syncing data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhooks</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.filter(i => i.type === 'webhook').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((integrations.filter(i => i.status === 'active').length / integrations.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Integrations healthy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Integrations Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active ({integrations.filter(i => i.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="all">All Integrations</TabsTrigger>
          <TabsTrigger value="templates">Browse Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {integrations.filter(i => i.status === 'active').map(integration => (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getProviderIcon(integration.provider, true)}
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <CardDescription>{integration.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(integration.status)}
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Provider:</span>
                    <Badge variant="outline">{integration.provider}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="outline">{integration.type}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Sync:</span>
                    <span>{integration.lastSync?.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sync Frequency:</span>
                    <span>{integration.syncFrequency}</span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Data Types:</span>
                    <div className="flex flex-wrap gap-1">
                      {integration.dataTypes.map(type => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm">
                      <Activity className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            {integrations.map(integration => (
              <Card key={integration.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        {getProviderIcon(integration.provider, true)}
                        <div>
                          <h3 className="font-semibold">{integration.name}</h3>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(integration.status)}
                          <span className="text-sm capitalize">{integration.status}</span>
                        </div>
                        
                        <Badge variant="outline">{integration.provider}</Badge>
                        
                        {integration.lastSync && (
                          <span className="text-sm text-muted-foreground">
                            Last sync: {integration.lastSync.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={integration.status === 'active'} 
                        onCheckedChange={() => {}}
                      />
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {template.popular && <Badge variant="default">Popular</Badge>}
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Provider:</span>
                      <span>{template.provider}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline" className="text-xs">{template.type}</Badge>
                    </div>
                    
                    <Button className="w-full" onClick={() => setSelectedTemplate(template)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Integration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configure {selectedTemplate.name} Integration</DialogTitle>
              <DialogDescription>
                Set up your connection to {selectedTemplate.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Make sure you have the necessary permissions and API credentials from {selectedTemplate.provider}.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="integration-name">Integration Name</Label>
                  <Input id="integration-name" placeholder={`${selectedTemplate.name} Integration`} />
                </div>

                {selectedTemplate.config.fields.map(field => (
                  <div key={field.name}>
                    <Label htmlFor={field.name}>
                      {field.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {field.type === 'select' ? (
                      <select
                        id={field.name}
                        className="w-full px-3 py-2 border rounded-md"
                        required={field.required}
                      >
                        <option value="">Select {field.name.replace('_', ' ')}</option>
                        {field.options?.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id={field.name}
                        type={field.type}
                        placeholder={field.description}
                        required={field.required}
                      />
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                  Cancel
                </Button>
                <Button>
                  Test Connection
                </Button>
                <Button>
                  Create Integration
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default IntegrationHub;