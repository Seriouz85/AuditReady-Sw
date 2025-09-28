import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const NotificationSettings: React.FC = () => {
  return (
    <div className="border-t pt-6 mt-6">
      <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="dailyDigest" className="cursor-pointer">Daily Campaign Digest</Label>
            <p className="text-xs text-muted-foreground">Receive a daily summary of campaign performance</p>
          </div>
          <Switch id="dailyDigest" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="campaignAlerts" className="cursor-pointer">Campaign Alerts</Label>
            <p className="text-xs text-muted-foreground">Get notified of significant campaign events</p>
          </div>
          <Switch id="campaignAlerts" defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="weeklyReports" className="cursor-pointer">Weekly Reports</Label>
            <p className="text-xs text-muted-foreground">Receive detailed weekly performance reports</p>
          </div>
          <Switch id="weeklyReports" defaultChecked />
        </div>
      </div>
    </div>
  );
};