import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/utils/toast";
import { Upload, Save } from "lucide-react";

interface ProfileSettingsProps {
  profile: any;
  isDemo: boolean;
  profileUpdating: boolean;
  updateProfile: (data: any) => Promise<void>;
  updateProfilePicture: (file: File) => Promise<void>;
  updateTwoFactorAuth: (enabled: boolean) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

export const ProfileSettings = ({
  profile,
  isDemo,
  profileUpdating,
  updateProfile,
  updateProfilePicture,
  updateTwoFactorAuth,
  updatePassword
}: ProfileSettingsProps) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Personal Profile</CardTitle>
          <CardDescription>
            Manage your personal information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isDemo && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                👤 Demo Mode: Profile changes are demonstration only. In production, these would be saved to your account.
              </p>
            </div>
          )}
          
          {/* Profile Picture Section */}
          <div className="flex items-center space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage 
                src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.name || profile?.email}`} 
                alt={profile?.name || 'User'} 
              />
              <AvatarFallback className="text-lg">
                {profile?.name ? 
                  profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 
                  profile?.email?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-2">
              <h3 className="text-lg font-medium">
                {profile?.name || profile?.email?.split('@')[0] || 'User'}
              </h3>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={isDemo || profileUpdating}
                onClick={() => {
                  if (isDemo) {
                    toast.info('Profile picture upload is not available in demo mode');
                    return;
                  }
                  
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      await updateProfilePicture(file);
                    }
                  };
                  input.click();
                }}
              >
                <Upload className="mr-2 h-4 w-4" />
                {profileUpdating ? 'Uploading...' : 'Change Picture'}
              </Button>
            </div>
          </div>
          
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input 
                id="first-name" 
                defaultValue={profile?.first_name || (isDemo ? "Demo" : "")} 
                disabled={isDemo || profileUpdating}
                onBlur={async (e) => {
                  if (!isDemo && e.target.value !== profile?.first_name) {
                    await updateProfile({ first_name: e.target.value });
                  }
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input 
                id="last-name" 
                defaultValue={profile?.last_name || (isDemo ? "User" : "")} 
                disabled={isDemo || profileUpdating}
                onBlur={async (e) => {
                  if (!isDemo && e.target.value !== profile?.last_name) {
                    await updateProfile({ last_name: e.target.value });
                  }
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input 
                id="display-name" 
                defaultValue={profile?.name || (isDemo ? "Demo User" : "")} 
                disabled={isDemo || profileUpdating}
                onBlur={async (e) => {
                  if (!isDemo && e.target.value !== profile?.name) {
                    await updateProfile({ name: e.target.value });
                  }
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                defaultValue={profile?.phone || (isDemo ? "+1 (555) 123-4567" : "")} 
                disabled={isDemo || profileUpdating}
                onBlur={async (e) => {
                  if (!isDemo && e.target.value !== profile?.phone) {
                    await updateProfile({ phone: e.target.value });
                  }
                }}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={3}
                defaultValue={profile?.bio || (isDemo ? "Cybersecurity professional focused on compliance and risk management." : "")}
                disabled={isDemo || profileUpdating}
                onBlur={async (e) => {
                  if (!isDemo && e.target.value !== profile?.bio) {
                    await updateProfile({ bio: e.target.value });
                  }
                }}
              />
            </div>
          </div>
          
          {/* Preferences */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Preferences</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Time Zone</Label>
                <p className="text-sm text-muted-foreground">Your local time zone for scheduling</p>
              </div>
              <Select 
                defaultValue={profile?.timezone || (isDemo ? "America/New_York" : "UTC")} 
                disabled={isDemo || profileUpdating}
                onValueChange={async (value) => {
                  if (!isDemo) {
                    await updateProfile({ timezone: value });
                  }
                }}
              >
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time (UTC-5)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (UTC-8)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (UTC-6)</SelectItem>
                  <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (UTC+1)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (UTC+9)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Language</Label>
                <p className="text-sm text-muted-foreground">Interface language preference</p>
              </div>
              <Select 
                defaultValue={profile?.language || "en"} 
                disabled={isDemo || profileUpdating}
                onValueChange={async (value) => {
                  if (!isDemo) {
                    await updateProfile({ language: value });
                  }
                }}
              >
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch 
                checked={profile?.email_notifications ?? true}
                disabled={isDemo || profileUpdating}
                onCheckedChange={async (checked) => {
                  if (!isDemo) {
                    await updateProfile({ email_notifications: checked });
                  } else {
                    toast.info('Email notification settings are read-only in demo mode');
                  }
                }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Enhanced account security</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={isDemo || profileUpdating}
                onClick={async () => {
                  if (isDemo) {
                    toast.info('2FA configuration is not available in demo mode');
                    return;
                  }
                  
                  const current2FA = profile?.two_factor_enabled || false;
                  await updateTwoFactorAuth(!current2FA);
                }}
              >
                {profileUpdating ? 'Updating...' : 
                 profile?.two_factor_enabled ? 'Disable 2FA' : 'Enable 2FA'}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => {
            if (isDemo) {
              toast.info('Profile changes are read-only in demo mode');
            } else {
              toast.success('Profile saved successfully');
              // In production, save all changes to Supabase
            }
          }}>
            <Save className="mr-2 h-4 w-4" />
            {isDemo ? 'Read-Only in Demo' : 'Save Profile'}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>
            Manage your account security and login settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-email">Email Address</Label>
            <Input 
              id="current-email" 
              type="email" 
              defaultValue={profile?.email || ""} 
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Contact support to change your email address
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="flex gap-2">
              <Input 
                type="password" 
                value="••••••••" 
                disabled 
                className="flex-1"
              />
              <Button 
                variant="outline" 
                disabled={isDemo || profileUpdating}
                onClick={() => {
                  if (isDemo) {
                    toast.info('Password change is not available in demo mode');
                    return;
                  }
                  
                  // Create a simple password change dialog
                  const newPassword = prompt('Enter your new password:');
                  if (newPassword && newPassword.length >= 8) {
                    updatePassword(newPassword);
                  } else if (newPassword) {
                    toast.error('Password must be at least 8 characters long');
                  }
                }}
              >
                {profileUpdating ? 'Updating...' : 'Change Password'}
              </Button>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h5 className="font-medium mb-2">Recent Login Activity</h5>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Current session: {new Date().toLocaleString()}</p>
              {isDemo && (
                <>
                  <p>• Web browser: Yesterday at 3:24 PM</p>
                  <p>• Mobile app: 3 days ago</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};