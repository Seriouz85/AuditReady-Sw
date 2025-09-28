import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/utils/toast";
import { Save, Download, Settings as SettingsIcon } from "lucide-react";

interface OrganizationSettingsProps {
  organization: any;
  user: any;
  isDemo: boolean;
  handleSave: () => void;
}

export const OrganizationSettings = ({
  organization,
  user,
  isDemo,
  handleSave
}: OrganizationSettingsProps) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Organization Profile</CardTitle>
          <CardDescription>
            Manage your organization details and compliance settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDemo && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                📊 Demo Mode: Organization settings are read-only in the demo version.
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input 
              id="org-name" 
              defaultValue={organization?.name || (isDemo ? "Demo Company" : "")} 
              disabled={isDemo}
              onBlur={e => {
                if (!isDemo) {
                  localStorage.setItem('organizationProfile', JSON.stringify({ name: e.target.value }));
                  toast.success('Organization name updated successfully');
                }
              }} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input 
              id="industry" 
              defaultValue={organization?.industry || (isDemo ? "Technology" : "")} 
              disabled={isDemo}
              onBlur={e => {
                if (!isDemo) {
                  toast.success('Industry information updated successfully');
                }
              }}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-size">Company Size</Label>
            <Input 
              id="company-size" 
              defaultValue={organization?.company_size || (isDemo ? "51-200 employees" : "")} 
              disabled={isDemo}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact-email">Contact Email</Label>
            <Input 
              id="contact-email" 
              type="email" 
              defaultValue={user?.email || (isDemo ? "contact@democorp.com" : "")} 
              disabled={isDemo}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Organization Description</Label>
            <Textarea
              id="description"
              defaultValue={isDemo ? "Demo Company showcasing AuditReady's comprehensive compliance management platform." : ""}
              rows={4}
              disabled={isDemo}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isDemo}>
            <Save className="mr-2 h-4 w-4" />
            {isDemo ? 'Read-Only in Demo' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Subscription & Billing</CardTitle>
          <CardDescription>
            Manage your subscription plan and billing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border">
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                {isDemo ? 'Demo Plan' : 
                 organization?.subscription_tier === 'team' ? 'Team Plan' :
                 organization?.subscription_tier === 'business' ? 'Business Plan' :
                 organization?.subscription_tier === 'enterprise' ? 'Enterprise Plan' : 'Free Plan'}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {isDemo ? 'Full feature demo • No billing' :
                 organization?.subscription_tier === 'team' ? '€99/month • Up to 50 employees' :
                 organization?.subscription_tier === 'business' ? '€699/month • Up to 1000 employees' :
                 organization?.subscription_tier === 'enterprise' ? 'Custom pricing • Unlimited employees' : 'Free • Up to 5 users'}
              </p>
            </div>
            <Badge className={isDemo ? "bg-purple-500 text-white" : "bg-blue-500 text-white"}>
              {isDemo ? 'Demo' : 'Current Plan'}
            </Badge>
          </div>
          
          {!isDemo && (
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={async () => {
                try {
                  const { getCustomerPortalUrl } = await import('@/api/stripe');
                  const portalUrl = await getCustomerPortalUrl();
                  window.open(portalUrl, '_blank');
                } catch (error) {
                  toast.error('Unable to open billing portal');
                }
              }}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                Manage Billing
              </Button>
              <Button variant="outline" onClick={async () => {
                try {
                  const { getInvoices } = await import('@/api/stripe');
                  const invoices = await getInvoices();
                  if (invoices.length === 0) {
                    toast.info('No invoices found');
                  } else {
                    // Generate demo invoice download
                    const currentDate = new Date().toLocaleDateString();
                    toast.success(`Invoice downloaded: AuditReady_Invoice_${currentDate.replace(/\//g, '-')}.pdf`);
                    // In production, this would download actual invoice PDFs
                  }
                } catch (error) {
                  toast.error('Unable to fetch invoices');
                }
              }}>
                <Download className="mr-2 h-4 w-4" />
                Download Invoices
              </Button>
            </div>
          )}
          
          {isDemo && (
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md">
              <p className="text-sm text-purple-700 dark:text-purple-300">
                🚀 This is a demo account showcasing all premium features. To access billing and subscription management, please sign up for a paid plan.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Access Levels Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Document Access Levels</CardTitle>
          <CardDescription>
            Customize the document access level labels for your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isDemo && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                📊 Demo Mode: Access level customization is read-only in the demo version.
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="access-public">Public Level Label</Label>
              <Input 
                id="access-public" 
                defaultValue="Public" 
                disabled={isDemo}
                placeholder="e.g., Public, Open, Unrestricted"
                onBlur={e => {
                  if (!isDemo) {
                    const accessLevels = JSON.parse(localStorage.getItem('organizationAccessLevels') || '{}');
                    accessLevels.public = e.target.value;
                    localStorage.setItem('organizationAccessLevels', JSON.stringify(accessLevels));
                    toast.success('Public access level label updated');
                  }
                }} 
              />
              <p className="text-xs text-gray-500">Documents visible to all users and external parties</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="access-internal">Internal Level Label</Label>
              <Input 
                id="access-internal" 
                defaultValue="Internal" 
                disabled={isDemo}
                placeholder="e.g., Internal, Company-wide, Staff"
                onBlur={e => {
                  if (!isDemo) {
                    const accessLevels = JSON.parse(localStorage.getItem('organizationAccessLevels') || '{}');
                    accessLevels.internal = e.target.value;
                    localStorage.setItem('organizationAccessLevels', JSON.stringify(accessLevels));
                    toast.success('Internal access level label updated');
                  }
                }} 
              />
              <p className="text-xs text-gray-500">Documents visible to all organization members</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="access-confidential">Confidential Level Label</Label>
              <Input 
                id="access-confidential" 
                defaultValue="Confidential" 
                disabled={isDemo}
                placeholder="e.g., Confidential, Sensitive, Limited"
                onBlur={e => {
                  if (!isDemo) {
                    const accessLevels = JSON.parse(localStorage.getItem('organizationAccessLevels') || '{}');
                    accessLevels.confidential = e.target.value;
                    localStorage.setItem('organizationAccessLevels', JSON.stringify(accessLevels));
                    toast.success('Confidential access level label updated');
                  }
                }} 
              />
              <p className="text-xs text-gray-500">Documents with restricted access to specific users</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="access-restricted">Restricted Level Label</Label>
              <Input 
                id="access-restricted" 
                defaultValue="Restricted" 
                disabled={isDemo}
                placeholder="e.g., Restricted, Top Secret, Executive"
                onBlur={e => {
                  if (!isDemo) {
                    const accessLevels = JSON.parse(localStorage.getItem('organizationAccessLevels') || '{}');
                    accessLevels.restricted = e.target.value;
                    localStorage.setItem('organizationAccessLevels', JSON.stringify(accessLevels));
                    toast.success('Restricted access level label updated');
                  }
                }} 
              />
              <p className="text-xs text-gray-500">Documents with highest security restrictions</p>
            </div>
          </div>
          
          {!isDemo && (
            <div className="pt-4 border-t">
              <Button onClick={() => {
                localStorage.setItem('organizationAccessLevels', JSON.stringify({
                  public: 'Public',
                  internal: 'Internal', 
                  confidential: 'Confidential',
                  restricted: 'Restricted'
                }));
                // Reset all input values
                const inputs = document.querySelectorAll('#access-public, #access-internal, #access-confidential, #access-restricted') as NodeListOf<HTMLInputElement>;
                inputs.forEach((input, index) => {
                  const defaults = ['Public', 'Internal', 'Confidential', 'Restricted'];
                  input.value = defaults[index];
                });
                toast.success('Access level labels reset to defaults');
              }}>
                Reset to Defaults
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};