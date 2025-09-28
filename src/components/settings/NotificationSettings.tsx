import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/utils/toast";
import { Save } from "lucide-react";

interface NotificationSettingsProps {
  handleSave: () => void;
}

export const NotificationSettings = ({ handleSave }: NotificationSettingsProps) => {
  return (
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
          <Switch 
            id="assessment-notifications" 
            defaultChecked 
            onCheckedChange={(checked) => {
              toast.success(`Assessment reminder notifications ${checked ? 'enabled' : 'disabled'}`);
            }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="compliance-updates">Compliance Updates</Label>
            <p className="text-sm text-muted-foreground">
              Get notified about changes to compliance status
            </p>
          </div>
          <Switch 
            id="compliance-updates" 
            defaultChecked 
            onCheckedChange={(checked) => {
              toast.success(`Compliance update notifications ${checked ? 'enabled' : 'disabled'}`);
            }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="team-activity">Team Activity</Label>
            <p className="text-sm text-muted-foreground">
              Notifications about team member actions
            </p>
          </div>
          <Switch 
            id="team-activity" 
            onCheckedChange={(checked) => {
              toast.success(`Team activity notifications ${checked ? 'enabled' : 'disabled'}`);
            }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="standard-updates">Standard Updates</Label>
            <p className="text-sm text-muted-foreground">
              Notifications when standards are updated
            </p>
          </div>
          <Switch 
            id="standard-updates" 
            defaultChecked 
            onCheckedChange={(checked) => {
              toast.success(`Standard update notifications ${checked ? 'enabled' : 'disabled'}`);
            }}
          />
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
  );
};