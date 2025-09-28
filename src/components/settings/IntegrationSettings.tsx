import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/utils/toast";
import { useNavigate } from "react-router-dom";
import { 
  Building2, CheckCircle, ExternalLink, Eye, Trash2, Key, 
  Activity, UserPlus 
} from "lucide-react";
import { IntegrationIcon } from "@/components/ui/IntegrationIcon";
import { AzureIntegrationCard } from "@/components/settings/AzureIntegrationCard";

interface IntegrationSettingsProps {
  isDemo: boolean;
  connections: any[] | null;
  organization: any;
}

export const IntegrationSettings = ({
  isDemo,
  connections,
  organization
}: IntegrationSettingsProps) => {
  const navigate = useNavigate();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Single Sign-On (SSO)</CardTitle>
          <CardDescription>
            Configure enterprise authentication providers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <h4 className="font-medium">Microsoft Entra ID</h4>
                </div>
                {isDemo ? (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Demo Available
                  </Badge>
                ) : connections && connections.length > 0 ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {connections.length} Connection{connections.length !== 1 ? 's' : ''}
                  </Badge>
                ) : (
                  <Badge variant="outline">Not Configured</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Enterprise SSO with Microsoft Entra ID (Azure AD)
              </p>
              {isDemo ? (
                <div className="text-xs text-muted-foreground mb-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Demo Production AD</span>
                    <Badge className="bg-green-100 text-green-800" variant="outline">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Demo Dev Environment</span>
                    <Badge className="bg-blue-100 text-blue-800" variant="outline">
                      Testing
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Demo: 250 synced users
                  </div>
                </div>
              ) : connections && connections.length > 0 && (
                <div className="text-xs text-muted-foreground mb-3 space-y-1">
                  {connections.slice(0, 2).map((conn) => (
                    <div key={conn.id} className="flex items-center justify-between">
                      <span>{conn.name}</span>
                      <Badge 
                        className={conn.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                        variant="outline"
                      >
                        {conn.status}
                      </Badge>
                    </div>
                  ))}
                  {connections.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{connections.length - 2} more...
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={connections && connections.length > 0 ? "default" : "outline"}
                  onClick={() => {
                    if (isDemo) {
                      // In demo mode, still allow navigation to see the interface
                      navigate('/app/admin/sso');
                      return;
                    }
                    // Navigate to Enterprise SSO management page
                    navigate('/app/admin/sso');
                  }}
                >
                  {(isDemo || (connections && connections.length > 0)) ? 'Manage' : 'Configure'}
                </Button>
                {(isDemo || (connections && connections.length > 0)) && (
                  <Button size="sm" variant="outline" onClick={() => navigate('/app/admin/sso')}>
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                )}
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Google Workspace</h4>
                <Badge variant="outline">Not Configured</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Enable SSO with Google Workspace
              </p>
              <Button size="sm" variant="outline" onClick={() => {
                toast.info("Google Workspace SSO configuration would open here. Contact support for setup assistance.");
                // In production, this would open Google Workspace configuration wizard
              }}>Configure</Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Okta</h4>
                <Badge variant="outline">Not Configured</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Enterprise identity management
              </p>
              <Button size="sm" variant="outline" onClick={() => {
                toast.info("Okta SSO configuration would open here. Contact support for enterprise setup.");
                // In production, this would open Okta configuration wizard
              }}>Configure</Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Custom SAML</h4>
                <Badge variant="outline">Not Configured</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Custom SAML 2.0 provider
              </p>
              <Button size="sm" variant="outline" onClick={() => {
                toast.info("Custom SAML configuration requires enterprise support. Contact our team for setup.");
                // In production, this would open SAML configuration interface
              }}>Configure</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage API access for integrations and automation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Production API Key</div>
                <div className="text-sm text-muted-foreground">Created on Dec 1, 2024</div>
                <div className="text-sm text-muted-foreground">Last used: 2 hours ago</div>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => {
                  toast.info("API key would be revealed here. Feature requires secure authentication.");
                  // In production, this would show the API key after authentication
                }}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  toast.success("API key revoked successfully. Any applications using this key will lose access.");
                  // In production, this would revoke the API key
                }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Button variant="outline" onClick={() => {
              const newKey = 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
              toast.success(`New API key generated: ${newKey.substring(0, 20)}... (Copy this key immediately as it won't be shown again)`);
              // In production, this would generate a real API key and store it securely
            }}>
              <Key className="mr-2 h-4 w-4" />
              Generate New API Key
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
          <CardDescription>
            Configure webhook endpoints for real-time notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button variant="outline" onClick={() => {
              toast.info("Webhook endpoint configuration dialog would open here. Configure endpoints for real-time notifications.");
              // In production, this would open a modal to configure webhook endpoints
            }}>
              <Activity className="mr-2 h-4 w-4" />
              Add Webhook Endpoint
            </Button>
            <p className="text-sm text-muted-foreground">
              No webhook endpoints configured. Add endpoints to receive real-time notifications about compliance events.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Third-Party Integrations</CardTitle>
          <CardDescription>
            Connect with external security and compliance tools
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Popular Integrations */}
            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <IntegrationIcon provider="okta" size="medium" />
                <div>
                  <h4 className="font-semibold">Okta</h4>
                  <p className="text-xs text-muted-foreground">Identity Management</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Connect with Okta for identity and access management
              </p>
              <Button size="sm" variant="outline" className="w-full">
                <UserPlus className="w-3 h-3 mr-1" />
                Connect
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <IntegrationIcon provider="aws" size="medium" />
                <div>
                  <h4 className="font-semibold">AWS</h4>
                  <p className="text-xs text-muted-foreground">Cloud Security</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Import compliance data from AWS services
              </p>
              <Button size="sm" variant="outline" className="w-full">
                <UserPlus className="w-3 h-3 mr-1" />
                Connect
              </Button>
            </div>

            <AzureIntegrationCard organizationId={organization?.id || 'demo-org'} />

            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <IntegrationIcon provider="teams" size="medium" />
                <div>
                  <h4 className="font-semibold">Microsoft Teams</h4>
                  <p className="text-xs text-muted-foreground">Communication</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Send compliance notifications to Teams channels
              </p>
              <Button size="sm" variant="outline" className="w-full">
                <UserPlus className="w-3 h-3 mr-1" />
                Connect
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <IntegrationIcon provider="m365" size="medium" />
                <div>
                  <h4 className="font-semibold">Microsoft 365</h4>
                  <p className="text-xs text-muted-foreground">Office Suite & Collaboration</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Sync compliance documents with Microsoft 365
              </p>
              <Button size="sm" variant="outline" className="w-full">
                <UserPlus className="w-3 h-3 mr-1" />
                Connect
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <IntegrationIcon provider="slack" size="medium" />
                <div>
                  <h4 className="font-semibold">Slack</h4>
                  <p className="text-xs text-muted-foreground">Communication</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Send notifications and alerts to Slack channels
              </p>
              <Button size="sm" variant="outline" className="w-full">
                <UserPlus className="w-3 h-3 mr-1" />
                Connect
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <IntegrationIcon provider="jira" size="medium" />
                <div>
                  <h4 className="font-semibold">Jira</h4>
                  <p className="text-xs text-muted-foreground">Project Management</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Create and manage compliance issues in Jira
              </p>
              <Button size="sm" variant="outline" className="w-full">
                <UserPlus className="w-3 h-3 mr-1" />
                Connect
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <IntegrationIcon provider="servicenow" size="medium" />
                <div>
                  <h4 className="font-semibold">ServiceNow</h4>
                  <p className="text-xs text-muted-foreground">IT Service Management</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Integrate with ServiceNow for incident management
              </p>
              <Button size="sm" variant="outline" className="w-full">
                <UserPlus className="w-3 h-3 mr-1" />
                Connect
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <IntegrationIcon provider="google" size="medium" />
                <div>
                  <h4 className="font-semibold">Google Workspace</h4>
                  <p className="text-xs text-muted-foreground">Identity & Security</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Connect with Google Workspace for user management
              </p>
              <Button size="sm" variant="outline" className="w-full">
                <UserPlus className="w-3 h-3 mr-1" />
                Connect
              </Button>
            </div>

            <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <IntegrationIcon provider="github" size="medium" />
                <div>
                  <h4 className="font-semibold">GitHub</h4>
                  <p className="text-xs text-muted-foreground">Code Security</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Monitor code security and compliance in repos
              </p>
              <Button size="sm" variant="outline" className="w-full">
                <UserPlus className="w-3 h-3 mr-1" />
                Connect
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="w-4 h-4" />
              <span className="font-medium">Need a Custom Integration?</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Don't see your tool? We can help you build custom integrations using our API.
            </p>
            <Button size="sm" variant="outline">
              View API Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};