import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Mail,
  Clock,
  ChevronRight,
  Bot
} from 'lucide-react';
import { Campaign, PhishingTemplate } from '../types';

interface CampaignListProps {
  campaigns: Campaign[];
  getTemplateById: (id: string) => PhishingTemplate;
  onViewDetails: (campaign: Campaign) => void;
  onCreateFirst: () => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({
  campaigns,
  getTemplateById,
  onViewDetails,
  onCreateFirst
}) => {
  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Campaigns Created Yet</h3>
        <p className="text-muted-foreground mb-6">Create your first phishing campaign to start testing your organization</p>
        <Button 
          onClick={onCreateFirst}
          className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
        >
          Create First Campaign
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map(campaign => {
        const template = getTemplateById(campaign.templateId);
        return (
          <Card key={campaign.id} className="overflow-hidden rounded-xl border-0 shadow-lg hover:shadow-xl transition-all">
            <div className="p-6 border-b relative">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-transparent to-gray-50 opacity-50 -z-10"></div>
              <div className="flex justify-between items-start">
                <div>
                  <Badge 
                    className={`${
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      campaign.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-amber-100 text-amber-800'
                    } mb-2 px-2.5 py-0.5 rounded-full text-xs font-medium`}
                  >
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </Badge>
                  <h2 className="text-lg font-semibold">{campaign.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{campaign.description}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-gray-50 to-white">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>{template.name}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>{campaign.schedule.frequency}</span>
                </div>
              </div>
              
              {campaign.stats && (
                <div className="mt-3 grid grid-cols-4 gap-2 border-t border-border/50 pt-3">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Sent</p>
                    <p className="font-medium">{campaign.stats.sent}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Opened</p>
                    <p className="font-medium">{campaign.stats.opened}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Clicked</p>
                    <p className="font-medium text-red-600">{campaign.stats.clicked}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Reported</p>
                    <p className="font-medium text-green-600">{campaign.stats.reported}</p>
                  </div>
                </div>
              )}
              
              <Button 
                variant="ghost" 
                className="w-full mt-2 text-sm justify-start p-2 h-auto" 
                onClick={() => onViewDetails(campaign)}
              >
                View Details
                <ChevronRight className="ml-auto h-4 w-4" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};