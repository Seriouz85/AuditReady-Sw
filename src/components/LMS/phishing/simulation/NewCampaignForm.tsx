import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Trash2,
  Save,
  Users
} from 'lucide-react';
import { Campaign, PhishingTemplate } from '../types';

interface NewCampaignFormProps {
  newCampaign: Partial<Campaign>;
  setNewCampaign: (campaign: Partial<Campaign>) => void;
  templates: PhishingTemplate[];
  onCancel: () => void;
  onSave: () => void;
}

export const NewCampaignForm: React.FC<NewCampaignFormProps> = ({
  newCampaign,
  setNewCampaign,
  templates,
  onCancel,
  onSave
}) => {
  return (
    <Card className="p-6 rounded-xl border-0 shadow-lg overflow-hidden relative">
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-50 to-transparent -z-10"></div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Create New Campaign</h2>
        <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full hover:bg-gray-100">
          <Trash2 className="h-5 w-5 text-gray-400" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campaign Details column */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Campaign Details</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="campaignName">Campaign Name</Label>
                <Input 
                  id="campaignName" 
                  placeholder="Enter campaign name" 
                  className="mt-1 rounded-xl"
                  value={newCampaign.name || ''}
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="campaignDescription">Description</Label>
                <Textarea 
                  id="campaignDescription" 
                  placeholder="Describe the purpose of this campaign" 
                  className="mt-1 min-h-[100px] rounded-xl"
                  value={newCampaign.description || ''}
                  onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="templateSelect">Select Template</Label>
                <Select 
                  value={newCampaign.templateId || ''}
                  onValueChange={(value) => setNewCampaign({...newCampaign, templateId: value})}
                >
                  <SelectTrigger id="templateSelect" className="mt-1 rounded-xl">
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} - {template.difficultyLevel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-blue-500 mt-1 mr-2" />
                  <div>
                    <h4 className="font-medium text-blue-700 mb-1">Campaign Targets</h4>
                    <p className="text-sm text-blue-600 mb-3">Select who will receive the phishing emails</p>
                    <Button variant="outline" size="sm" className="bg-white border-blue-200">
                      Select Target Users/Groups
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Schedule column */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Campaign Schedule</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="scheduleType">Schedule Type</Label>
                <Select defaultValue="once">
                  <SelectTrigger id="scheduleType" className="mt-1 rounded-xl">
                    <SelectValue placeholder="Select schedule type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">One-time Campaign</SelectItem>
                    <SelectItem value="recurring">Recurring Campaign</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="campaignStartDate">Start Date</Label>
                <Input 
                  id="campaignStartDate" 
                  type="date" 
                  className="mt-1 rounded-xl"
                  value={newCampaign.schedule?.startDate || ''}
                  onChange={(e) => setNewCampaign({
                    ...newCampaign, 
                    schedule: {
                      startDate: e.target.value,
                      frequency: newCampaign.schedule?.frequency || 'once',
                      randomize: newCampaign.schedule?.randomize || false
                    }
                  })}
                />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Select defaultValue="09:00">
                    <SelectTrigger id="startTime" className="mt-1 rounded-xl">
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="13:00">1:00 PM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  <Label htmlFor="campaignFrequency">Frequency</Label>
                  <Select 
                    value={newCampaign.schedule?.frequency || 'once'}
                    onValueChange={(value: 'once' | 'weekly' | 'monthly') => setNewCampaign({
                      ...newCampaign, 
                      schedule: {
                        frequency: value,
                        startDate: newCampaign.schedule?.startDate || new Date().toISOString().split('T')[0],
                        randomize: newCampaign.schedule?.randomize || false
                      }
                    })}
                  >
                    <SelectTrigger id="campaignFrequency" className="mt-1 rounded-xl">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch 
                  id="randomize"
                  checked={newCampaign.schedule?.randomize || false}
                  onCheckedChange={(checked) => setNewCampaign({
                    ...newCampaign, 
                    schedule: {
                      randomize: checked,
                      startDate: newCampaign.schedule?.startDate || new Date().toISOString().split('T')[0],
                      frequency: newCampaign.schedule?.frequency || 'once'
                    }
                  })}
                />
                <Label htmlFor="randomize">Randomize email delivery times</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox id="businessHoursOnly" defaultChecked />
                <Label htmlFor="businessHoursOnly">Business hours only (9 AM - 5 PM)</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Checkbox id="excludeHolidays" defaultChecked />
                <Label htmlFor="excludeHolidays">Exclude holidays and weekends</Label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" className="rounded-full" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" onClick={onSave}>
          <Save className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>
    </Card>
  );
};