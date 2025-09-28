import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScheduleSettings as ScheduleSettingsType } from '../types';

interface ScheduleSettingsProps {
  settings: ScheduleSettingsType;
  onSettingsChange: (settings: ScheduleSettingsType) => void;
}

export const ScheduleSettings: React.FC<ScheduleSettingsProps> = ({
  settings,
  onSettingsChange
}) => {
  const updateSettings = (updates: Partial<ScheduleSettingsType>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  const toggleDayOfWeek = (day: string) => {
    if (settings.daysOfWeek.includes(day)) {
      updateSettings({
        daysOfWeek: settings.daysOfWeek.filter(d => d !== day)
      });
    } else {
      updateSettings({
        daysOfWeek: [...settings.daysOfWeek, day]
      });
    }
  };

  const updateTimeWindow = (field: 'startTime' | 'endTime', value: string) => {
    const updatedWindows = [...settings.timeWindows];
    updatedWindows[0] = { ...updatedWindows[0], [field]: value };
    updateSettings({ timeWindows: updatedWindows });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Schedule Settings</h3>
        <Switch 
          checked={settings.advancedOptions}
          onCheckedChange={(checked) => updateSettings({ advancedOptions: checked })}
        />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="businessHours" className="cursor-pointer">Business Hours Only</Label>
            <p className="text-xs text-muted-foreground">Only send emails during work hours</p>
          </div>
          <Switch 
            id="businessHours"
            checked={settings.businessHoursOnly}
            onCheckedChange={(checked) => updateSettings({ businessHoursOnly: checked })}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="excludeHolidays" className="cursor-pointer">Exclude Holidays</Label>
            <p className="text-xs text-muted-foreground">Don't send phishing emails on holidays</p>
          </div>
          <Switch 
            id="excludeHolidays"
            checked={settings.excludeHolidays}
            onCheckedChange={(checked) => updateSettings({ excludeHolidays: checked })}
          />
        </div>
      </div>
      
      {settings.advancedOptions && (
        <div className="space-y-4 border-t pt-4 mt-4">
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select 
              value={settings.timezone}
              onValueChange={(value) => updateSettings({ timezone: value })}
            >
              <SelectTrigger id="timezone" className="mt-1 rounded-xl">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                <SelectItem value="Europe/London">London (GMT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Days of Week</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <Badge 
                  key={day}
                  variant={settings.daysOfWeek.includes(day) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleDayOfWeek(day)}
                >
                  {day}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <Label>Business Hours</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label htmlFor="startTime" className="text-xs text-muted-foreground">Start Time</Label>
                <Input 
                  id="startTime" 
                  type="time" 
                  className="mt-1 rounded-xl"
                  value={settings.timeWindows[0]?.startTime || '09:00'}
                  onChange={(e) => updateTimeWindow('startTime', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endTime" className="text-xs text-muted-foreground">End Time</Label>
                <Input 
                  id="endTime" 
                  type="time" 
                  className="mt-1 rounded-xl"
                  value={settings.timeWindows[0]?.endTime || '17:00'}
                  onChange={(e) => updateTimeWindow('endTime', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="maxEmails">Maximum Emails Per Day</Label>
            <Input 
              id="maxEmails" 
              type="number" 
              min="1" 
              max="1000" 
              className="mt-1 rounded-xl"
              value={settings.maxEmailsPerDay}
              onChange={(e) => updateSettings({ maxEmailsPerDay: parseInt(e.target.value) || 50 })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="randomDelay" className="cursor-pointer">Random Delay Between Emails</Label>
              <p className="text-xs text-muted-foreground">Adds realism by varying when emails are sent</p>
            </div>
            <Switch 
              id="randomDelay"
              checked={settings.randomDelayBetweenEmails}
              onCheckedChange={(checked) => updateSettings({ randomDelayBetweenEmails: checked })}
            />
          </div>
          
          {settings.randomDelayBetweenEmails && (
            <div>
              <Label>Delay Range (minutes)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Input 
                  type="number" 
                  min="1" 
                  max="60" 
                  className="rounded-xl"
                  value={settings.delayRange[0]}
                  onChange={(e) => updateSettings({
                    delayRange: [parseInt(e.target.value) || 5, settings.delayRange[1]]
                  })}
                />
                <span>to</span>
                <Input 
                  type="number" 
                  min="1" 
                  max="120" 
                  className="rounded-xl"
                  value={settings.delayRange[1]}
                  onChange={(e) => updateSettings({
                    delayRange: [settings.delayRange[0], parseInt(e.target.value) || 30]
                  })}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};