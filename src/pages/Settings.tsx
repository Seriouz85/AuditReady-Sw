
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/utils/toast";
import { Download, Save, Upload, Users } from "lucide-react";

const Settings = () => {
  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>
      
      <Tabs defaultValue="organization">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="importing">Importing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        {/* Organization Settings */}
        <TabsContent value="organization" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Profile</CardTitle>
              <CardDescription>
                Manage your organization details and compliance settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input id="org-name" defaultValue="Acme Corporation" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" defaultValue="Technology" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="compliance-contact">Primary Compliance Contact</Label>
                <Input id="compliance-contact" defaultValue="John Smith" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input id="contact-email" type="email" defaultValue="compliance@acme.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Organization Description</Label>
                <Textarea
                  id="description"
                  defaultValue="Acme Corporation is a technology company that provides innovative solutions to businesses worldwide."
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Manage team members and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Manage Team
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Importing Settings */}
        <TabsContent value="importing" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Standards</CardTitle>
              <CardDescription>
                Import standards and regulations from files or repositories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Available Standards</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">ISO 27001:2022</p>
                      <p className="text-sm text-muted-foreground">Information Security Management</p>
                    </div>
                    <Button>Import</Button>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">NIST CSF 2.0</p>
                      <p className="text-sm text-muted-foreground">Cybersecurity Framework</p>
                    </div>
                    <Button>Import</Button>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">GDPR</p>
                      <p className="text-sm text-muted-foreground">General Data Protection Regulation</p>
                    </div>
                    <Button>Import</Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium mb-2">Import from File</h3>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CSV
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload JSON
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium mb-2">Export Data</h3>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Export All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="assessment-notifications">Assessment Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about assessment deadlines
                  </p>
                </div>
                <Switch id="assessment-notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compliance-updates">Compliance Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about changes to compliance status
                  </p>
                </div>
                <Switch id="compliance-updates" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="team-activity">Team Activity</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about team member actions
                  </p>
                </div>
                <Switch id="team-activity" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="standard-updates">Standard Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications when standards are updated
                  </p>
                </div>
                <Switch id="standard-updates" defaultChecked />
              </div>
              
              <div className="space-y-2 mt-4">
                <Label htmlFor="notification-email">Notification Email</Label>
                <Input id="notification-email" type="email" defaultValue="alerts@acme.com" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
