import React from 'react';
import { Campaign, PhishingTemplate } from '../types';
import { CampaignDetails } from './CampaignDetails';
import { NewCampaignForm } from './NewCampaignForm';
import { CampaignList } from './CampaignList';

interface CampaignManagerProps {
  campaigns: Campaign[];
  templates: PhishingTemplate[];
  showCampaignDetails: boolean;
  selectedCampaign: Campaign | null;
  showNewCampaign: boolean;
  newCampaign: Partial<Campaign>;
  setShowCampaignDetails: (show: boolean) => void;
  setShowNewCampaign: (show: boolean) => void;
  setNewCampaign: (campaign: Partial<Campaign>) => void;
  getTemplateById: (id: string) => PhishingTemplate;
  handleCreateCampaign: () => void;
  handleViewCampaignDetails: (campaign: Campaign) => void;
}

export const CampaignManager: React.FC<CampaignManagerProps> = ({
  campaigns,
  templates,
  showCampaignDetails,
  selectedCampaign,
  showNewCampaign,
  newCampaign,
  setShowCampaignDetails,
  setShowNewCampaign,
  setNewCampaign,
  getTemplateById,
  handleCreateCampaign,
  handleViewCampaignDetails
}) => {
  if (showCampaignDetails && selectedCampaign) {
    return (
      <CampaignDetails
        campaign={selectedCampaign}
        getTemplateById={getTemplateById}
        onBack={() => setShowCampaignDetails(false)}
      />
    );
  }

  if (showNewCampaign) {
    return (
      <NewCampaignForm
        newCampaign={newCampaign}
        setNewCampaign={setNewCampaign}
        templates={templates}
        onCancel={() => setShowNewCampaign(false)}
        onSave={handleCreateCampaign}
      />
    );
  }

  return (
    <CampaignList
      campaigns={campaigns}
      getTemplateById={getTemplateById}
      onViewDetails={handleViewCampaignDetails}
      onCreateFirst={() => setShowNewCampaign(true)}
    />
  );
};