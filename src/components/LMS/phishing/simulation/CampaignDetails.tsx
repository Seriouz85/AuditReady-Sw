import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft,
  ActivitySquare,
  CircleAlert,
  Edit,
  Trash2,
  Mail,
  Eye,
  MousePointer,
  FileCheck,
  BarChart,
  LineChart
} from 'lucide-react';
import { Campaign, PhishingTemplate } from '../types';

interface CampaignDetailsProps {
  campaign: Campaign;
  getTemplateById: (id: string) => PhishingTemplate;
  onBack: () => void;
}

export const CampaignDetails: React.FC<CampaignDetailsProps> = ({
  campaign,
  getTemplateById,
  onBack
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack} 
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
          <Badge 
            className={`${
              campaign.status === 'active' ? 'bg-green-100 text-green-800' :
              campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
              campaign.status === 'completed' ? 'bg-gray-100 text-gray-800' :
              'bg-amber-100 text-amber-800'
            } px-2.5 py-0.5 rounded-full text-xs font-medium`}
          >
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Campaign
          </Button>
          {campaign.status === 'draft' && (
            <Button variant="outline" size="sm" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
              <ActivitySquare className="h-4 w-4 mr-2" />
              Launch Campaign
            </Button>
          )}
          {campaign.status === 'active' && (
            <Button variant="outline" size="sm" className="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100">
              <CircleAlert className="h-4 w-4 mr-2" />
              Pause Campaign
            </Button>
          )}
          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6 rounded-xl border-0 shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">{campaign.name}</h2>
              <p className="text-gray-600 mt-1">{campaign.description}</p>
            </div>
            {campaign.stats?.progress !== undefined && (
              <div className="bg-gray-50 rounded-full w-20 h-20 flex flex-col items-center justify-center border">
                <div className="text-xl font-semibold">{campaign.stats.progress}%</div>
                <div className="text-xs text-gray-500">Complete</div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Campaign Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Status</span>
                  <Badge 
                    className={`${
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      campaign.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-amber-100 text-amber-800'
                    } px-2.5 py-0.5 rounded-full text-xs font-medium`}
                  >
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Template</span>
                  <span className="font-medium">{getTemplateById(campaign.templateId).name}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Start Date</span>
                  <span className="font-medium">{campaign.schedule.startDate}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Frequency</span>
                  <span className="font-medium capitalize">{campaign.schedule.frequency}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Randomize</span>
                  <Badge variant={campaign.schedule.randomize ? "default" : "outline"}>
                    {campaign.schedule.randomize ? "Yes" : "No"}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Target Groups</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {campaign.targetGroups.map(group => (
                      <Badge key={group} variant="outline" className="text-xs">
                        {group}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {campaign.createdAt && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">Created</span>
                    <span className="text-sm">{campaign.createdAt} by {campaign.createdBy}</span>
                  </div>
                )}
                
                {campaign.lastUpdated && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">Last Updated</span>
                    <span className="text-sm">{campaign.lastUpdated}</span>
                  </div>
                )}
              </div>
            </div>
            
            {campaign.stats && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Campaign Results</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Card className="p-4 bg-blue-50 border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm text-blue-700">Emails Sent</p>
                          <p className="text-xl font-semibold text-blue-800">{campaign.stats.sent}</p>
                        </div>
                      </div>
                      <div className="text-sm text-blue-700">Total</div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-amber-50 border-amber-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Eye className="h-5 w-5 text-amber-600 mr-2" />
                        <div>
                          <p className="text-sm text-amber-700">Opened</p>
                          <p className="text-xl font-semibold text-amber-800">{campaign.stats.opened}</p>
                        </div>
                      </div>
                      <div className="text-sm text-amber-700">{campaign.stats.openRate?.toFixed(1)}%</div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-red-50 border-red-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MousePointer className="h-5 w-5 text-red-600 mr-2" />
                        <div>
                          <p className="text-sm text-red-700">Clicked</p>
                          <p className="text-xl font-semibold text-red-800">{campaign.stats.clicked}</p>
                        </div>
                      </div>
                      <div className="text-sm text-red-700">{campaign.stats.clickRate?.toFixed(1)}%</div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-green-50 border-green-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileCheck className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm text-green-700">Reported</p>
                          <p className="text-xl font-semibold text-green-800">{campaign.stats.reported}</p>
                        </div>
                      </div>
                      <div className="text-sm text-green-700">{campaign.stats.reportRate?.toFixed(1)}%</div>
                    </div>
                  </Card>
                </div>
                
                {campaign.stats.timeline && (
                  <div className="mt-6">
                    <h4 className="text-md font-medium mb-3 flex items-center">
                      <LineChart className="h-4 w-4 mr-2" />
                      Activity Timeline
                    </h4>
                    <div className="space-y-2">
                      {campaign.stats.timeline.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">{item.date}</span>
                          <div className="flex gap-4 text-xs">
                            <span className="text-blue-600">Sent: {item.sent}</span>
                            <span className="text-amber-600">Opened: {item.opened}</span>
                            <span className="text-red-600">Clicked: {item.clicked}</span>
                            <span className="text-green-600">Reported: {item.reported}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl">
              <BarChart className="h-4 w-4 mr-2" />
              View Full Report
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};