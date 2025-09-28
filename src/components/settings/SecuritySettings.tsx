import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/utils/toast";
import { Save, Key } from "lucide-react";
import { MFAManager } from '@/components/mfa/MFAManager';

interface SecuritySettingsProps {
  isDemo?: boolean;
}

export const SecuritySettings = ({ isDemo }: SecuritySettingsProps) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Password Policy</CardTitle>
          <CardDescription>
            Configure password requirements for your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Minimum Password Length</Label>
              <p className="text-sm text-muted-foreground">Require at least 8 characters</p>
            </div>
            <Input 
              type="number" 
              defaultValue="8" 
              className="w-20" 
              min="6" 
              max="32" 
              onChange={(e) => {
                toast.success(`Password length requirement updated to ${e.target.value} characters`);
              }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Special Characters</Label>
              <p className="text-sm text-muted-foreground">Include symbols (!@#$%^&*)</p>
            </div>
            <Switch 
              defaultChecked 
              onCheckedChange={(checked) => {
                toast.success(`Special characters requirement ${checked ? 'enabled' : 'disabled'}`);
              }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Numbers</Label>
              <p className="text-sm text-muted-foreground">Include at least one number</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Password Expiration</Label>
              <p className="text-sm text-muted-foreground">Force password change every 90 days</p>
            </div>
            <Switch />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => {
            toast.success("Password policy updated successfully");
            // In production, this would save to the database
          }}>
            <Save className="mr-2 h-4 w-4" />
            Save Password Policy
          </Button>
        </CardFooter>
      </Card>

      <MFAManager onMFAStatusChange={(enabled) => {
        // Handle MFA status change for any additional UI updates
        if (enabled) {
          toast.success("MFA has been successfully enabled for your account");
        }
      }} />

      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
          <CardDescription>
            Control user session behavior and timeouts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Session Timeout (minutes)</Label>
              <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
            </div>
            <Input 
              type="number" 
              defaultValue="30" 
              className="w-20" 
              min="5" 
              max="480" 
              onChange={(e) => {
                toast.success(`Session timeout updated to ${e.target.value} minutes`);
              }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maximum Concurrent Sessions</Label>
              <p className="text-sm text-muted-foreground">Limit active sessions per user</p>
            </div>
            <Input type="number" defaultValue="3" className="w-20" min="1" max="10" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Force Logout on Password Change</Label>
              <p className="text-sm text-muted-foreground">End all sessions when password is updated</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => {
            toast.success("Session settings updated successfully");
            // In production, this would save to the database
          }}>
            <Key className="mr-2 h-4 w-4" />
            Save Session Settings
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};