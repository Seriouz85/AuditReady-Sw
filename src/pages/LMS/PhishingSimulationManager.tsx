import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Fish,
  Target,
  Mail,
  Users,
  BarChart,
  BarChart2,
  Settings,
  Plus
} from 'lucide-react';

// Import extracted components
import { CampaignManager } from '@/components/lms/phishing/simulation/CampaignManager';
import { TemplateManager } from '@/components/lms/phishing/simulation/TemplateManager';
import { TargetingConfig } from '@/components/lms/phishing/config/TargetingConfig';
import { PhishingSettings } from '@/components/lms/phishing/config/PhishingSettings';
import { PhishingAnalytics } from '@/components/lms/phishing/reports/PhishingAnalytics';

// Import types and sample data
import { 
  PhishingTemplate, 
  Campaign, 
  AIConfig, 
  ScheduleSettings,
  sampleTemplates,
  sampleCampaigns,
  sampleUsers,
  sampleGroups
} from '@/components/lms/phishing/types';

const PhishingSimulationManager: React.FC = () => {
  const navigate = useNavigate();
  
  // Core state
  const [activeTab, setActiveTab] = useState('campaigns');
  const [templates, setTemplates] = useState<PhishingTemplate[]>(sampleTemplates);
  const [campaigns, setCampaigns] = useState<Campaign[]>(sampleCampaigns);
  
  // Campaign state
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: '',
    description: '',
    status: 'draft',
    targetGroups: [],
    templateId: '',
    schedule: { startDate: '', frequency: 'once', randomize: false }
  });
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  
  // Template state
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PhishingTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<PhishingTemplate>>({
    name: '', subject: '', content: '', difficultyLevel: 'Medium', category: 'General', 
    trackingLinks: [{ url: 'https://tracking.example.com/click?id=' + Date.now(), displayText: 'Click Here', trackingId: 'link-' + Date.now() }],
    qrCodes: []
  });
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('all');
  
  // Targeting state
  const [targetingTab, setTargetingTab] = useState<'groups' | 'users'>('groups');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [riskFilterLevel, setRiskFilterLevel] = useState('all');
  const [isEntraConnected, setIsEntraConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Settings state
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings>({
    advancedOptions: false, businessHoursOnly: true, excludeHolidays: true,
    timezone: 'America/New_York', daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    timeWindows: [{startTime: '09:00', endTime: '17:00'}], maxEmailsPerDay: 50,
    randomDelayBetweenEmails: true, delayRange: [5, 30]
  });
  const [emailProvider, setEmailProvider] = useState('sendgrid');
  const [apiConfig, setApiConfig] = useState({
    apiKey: '', smtpHost: '', smtpPort: 587, useTLS: true, username: '', password: '', saved: false
  });
  const [showApiKey, setShowApiKey] = useState(false);
  
  // AI and Reports state
  const [aiConfig, setAIConfig] = useState<AIConfig>({
    enabled: true, apiKey: import.meta.env.VITE_GEMINI_API_KEY || '', 
    generating: false, prompt: '', error: null
  });
  const [showReports, setShowReports] = useState(false);
  
  // Derived data
  const uniqueCategories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];
  
  // Load API key from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setAIConfig(prev => ({...prev, apiKey: savedApiKey}));
    }
  }, []);
  
  // Save API key to localStorage when it changes
  useEffect(() => {
    if (aiConfig.apiKey) {
      localStorage.setItem('gemini_api_key', aiConfig.apiKey);
    }
  }, [aiConfig.apiKey]);

  // Campaign handlers
  const handleCreateCampaign = () => {
    const campaignId = `campaign-${Date.now()}`;
    const newCampaignData: Campaign = {
      id: campaignId,
      name: newCampaign.name || 'Untitled Campaign',
      description: newCampaign.description || '',
      status: 'draft',
      targetGroups: newCampaign.targetGroups || [],
      templateId: newCampaign.templateId || templates[0].id,
      schedule: {
        startDate: newCampaign.schedule?.startDate || new Date().toISOString().split('T')[0],
        frequency: newCampaign.schedule?.frequency || 'once',
        randomize: newCampaign.schedule?.randomize || false
      }
    };
    
    setCampaigns([...campaigns, newCampaignData]);
    setShowNewCampaign(false);
    setNewCampaign({
      name: '', description: '', status: 'draft', targetGroups: [], templateId: '',
      schedule: { startDate: '', frequency: 'once', randomize: false }
    });
  };

  const handleViewCampaignDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowCampaignDetails(true);
  };

  // Template handlers
  const handleCreateTemplate = () => {
    const templateId = `template-${Date.now()}`;
    const newTemplateData: PhishingTemplate = {
      id: templateId,
      name: newTemplate.name || 'Untitled Template',
      subject: newTemplate.subject || '',
      content: newTemplate.content || '',
      difficultyLevel: newTemplate.difficultyLevel || 'Medium',
      category: newTemplate.category || 'General',
      trackingLinks: newTemplate.trackingLinks || [],
      qrCodes: newTemplate.qrCodes || [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setTemplates([...templates, newTemplateData]);
    setShowTemplateEditor(false);
    setSelectedTemplate(null);
    resetNewTemplate();
  };

  const handleUpdateTemplate = () => {
    if (!selectedTemplate) return;
    
    const updatedTemplates = templates.map(template => 
      template.id === selectedTemplate.id 
        ? { ...template, ...newTemplate, lastUsed: new Date().toISOString().split('T')[0] }
        : template
    );
    
    setTemplates(updatedTemplates);
    setShowTemplateEditor(false);
    setSelectedTemplate(null);
    resetNewTemplate();
  };

  const handleEditTemplate = (template: PhishingTemplate) => {
    setSelectedTemplate(template);
    setNewTemplate(template);
    setShowTemplateEditor(true);
  };

  const handleDuplicateTemplate = (template: PhishingTemplate) => {
    const duplicatedTemplate: PhishingTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTemplates([...templates, duplicatedTemplate]);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
  };

  const resetNewTemplate = () => {
    setNewTemplate({
      name: '', subject: '', content: '', difficultyLevel: 'Medium', category: 'General',
      trackingLinks: [{ url: 'https://tracking.example.com/click?id=' + Date.now(), displayText: 'Click Here', trackingId: 'link-' + Date.now() }],
      qrCodes: []
    });
  };

  // Template helper functions
  const addTrackingLink = () => {
    const newLink = { url: `https://tracking.example.com/click?id=${Date.now()}`, displayText: 'Click Here', trackingId: `link-${Date.now()}` };
    setNewTemplate({ ...newTemplate, trackingLinks: [...(newTemplate.trackingLinks || []), newLink] });
  };

  const removeTrackingLink = (index: number) => {
    const updatedLinks = [...(newTemplate.trackingLinks || [])];
    updatedLinks.splice(index, 1);
    setNewTemplate({ ...newTemplate, trackingLinks: updatedLinks });
  };

  const generateQRCode = () => {
    const newQRCode = { url: `https://tracking.example.com/qr-code?id=${Date.now()}`, description: 'Scan to verify identity', trackingId: `qr-${Date.now()}` };
    setNewTemplate({ ...newTemplate, qrCodes: [...(newTemplate.qrCodes || []), newQRCode] });
  };

  const removeQRCode = (index: number) => {
    const updatedQRCodes = [...(newTemplate.qrCodes || [])];
    updatedQRCodes.splice(index, 1);
    setNewTemplate({ ...newTemplate, qrCodes: updatedQRCodes });
  };

  const generatePhishingTemplate = async () => {
    if (!aiConfig.prompt) {
      setAIConfig({...aiConfig, error: "Please describe the type of phishing email you need."});
      return;
    }
    
    setAIConfig({...aiConfig, generating: true, error: null});
    
    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${aiConfig.apiKey}`;
      const promptText = `Generate a phishing email template based on: "${aiConfig.prompt}". Return only valid JSON with fields: name, subject, content, difficultyLevel, category, trackingLinks array, needsQRCode boolean.`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
        })
      });
      
      if (!response.ok) throw new Error(`API request failed: ${response.status}`);
      
      const data = await response.json();
      const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) throw new Error('No response from AI');
      
      const jsonString = responseText.replace(/```json|```/g, '').trim();
      const generatedTemplate = JSON.parse(jsonString);
      
      setNewTemplate({
        ...newTemplate,
        name: generatedTemplate.name,
        subject: generatedTemplate.subject,
        content: generatedTemplate.content,
        difficultyLevel: generatedTemplate.difficultyLevel,
        category: generatedTemplate.category,
        trackingLinks: generatedTemplate.trackingLinks?.map((link: any, index: number) => ({
          url: `https://tracking.example.com/click?id=${Date.now()}_${index}`,
          displayText: link.displayText,
          trackingId: `link-${Date.now()}_${index}`
        })) || newTemplate.trackingLinks
      });
      
      if (generatedTemplate.needsQRCode) {
        generateQRCode();
      }
      
      setAIConfig({...aiConfig, generating: false, error: null});
    } catch (error) {
      console.error('AI generation error:', error);
      setAIConfig({...aiConfig, generating: false, error: error instanceof Error ? error.message : 'An unexpected error occurred'});
    }
  };

  // Targeting handlers
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups(prev => prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]);
  };

  const handleConnectEntra = () => {
    setIsConnecting(true);
    setTimeout(() => { setIsEntraConnected(true); setIsConnecting(false); }, 2000);
  };

  // Utility functions
  const getTemplateById = (id: string): PhishingTemplate => {
    return templates.find(t => t.id === id) || templates[0];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-br from-orange-600 via-red-600 to-pink-700 p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-yellow-300/20 rounded-full blur-xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/lms')} className="rounded-full hover:bg-white/20 text-white backdrop-blur-sm">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Fish className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">Phishing Simulation Manager</h1>
                  <p className="text-white/90 text-sm font-medium mt-1">Create and manage security awareness campaigns</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-white hover:bg-white/20 backdrop-blur-sm rounded-xl" onClick={() => setShowReports(true)}>
                <BarChart2 className="h-4 w-4 mr-2" />
                View Reports
              </Button>
              <Button className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30 rounded-xl shadow-lg"
                onClick={() => { setShowNewCampaign(false); setShowCampaignDetails(false); setShowTemplateEditor(false); setShowReports(false); setActiveTab('settings'); }}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
          
          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-orange-200" />
                <div>
                  <p className="text-2xl font-bold text-white">{campaigns.filter(c => c.status === 'active').length}</p>
                  <p className="text-white/80 text-sm">Active Campaigns</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-8 w-8 text-red-200" />
                <div>
                  <p className="text-2xl font-bold text-white">{templates.length}</p>
                  <p className="text-white/80 text-sm">Email Templates</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-pink-200" />
                <div>
                  <p className="text-2xl font-bold text-white">{sampleUsers.length}</p>
                  <p className="text-white/80 text-sm">Target Users</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <BarChart className="h-8 w-8 text-yellow-200" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {Math.round(campaigns.reduce((acc, c) => acc + (c.stats?.reportRate || 0), 0) / campaigns.length) || 0}%
                  </p>
                  <p className="text-white/80 text-sm">Avg Report Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Analytics Reports Modal */}
      <PhishingAnalytics 
        isOpen={showReports} 
        onClose={() => setShowReports(false)} 
        campaigns={campaigns} 
        templates={templates} 
      />
      
      <div className="container max-w-7xl mx-auto p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100 mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
              <TabsList className="bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="campaigns" className="data-[state=active]:bg-white rounded-lg data-[state=active]:shadow-sm">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Campaigns
                </TabsTrigger>
                <TabsTrigger value="templates" className="data-[state=active]:bg-white rounded-lg data-[state=active]:shadow-sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="targeting" className="data-[state=active]:bg-white rounded-lg data-[state=active]:shadow-sm">
                  <Users className="h-4 w-4 mr-2" />
                  Targeting
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-white rounded-lg data-[state=active]:shadow-sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
              
              {activeTab === 'campaigns' && (
                <Button onClick={() => setShowNewCampaign(true)} className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md hover:shadow-lg transition-all">
                  <Plus className="mr-2 h-4 w-4" />
                  New Campaign
                </Button>
              )}
            </div>
            
            <TabsContent value="campaigns" className="space-y-6 pt-2">
              <CampaignManager
                campaigns={campaigns}
                templates={templates}
                showCampaignDetails={showCampaignDetails}
                selectedCampaign={selectedCampaign}
                showNewCampaign={showNewCampaign}
                newCampaign={newCampaign}
                setShowCampaignDetails={setShowCampaignDetails}
                setShowNewCampaign={setShowNewCampaign}
                setNewCampaign={setNewCampaign}
                getTemplateById={getTemplateById}
                handleCreateCampaign={handleCreateCampaign}
                handleViewCampaignDetails={handleViewCampaignDetails}
              />
            </TabsContent>
            
            <TabsContent value="templates" className="space-y-6">
              <TemplateManager
                templates={templates}
                showTemplateEditor={showTemplateEditor}
                selectedTemplate={selectedTemplate}
                newTemplate={newTemplate}
                templateSearchQuery={templateSearchQuery}
                templateCategoryFilter={templateCategoryFilter}
                uniqueCategories={uniqueCategories}
                aiConfig={aiConfig}
                setShowTemplateEditor={setShowTemplateEditor}
                setSelectedTemplate={setSelectedTemplate}
                setNewTemplate={setNewTemplate}
                setTemplateSearchQuery={setTemplateSearchQuery}
                setTemplateCategoryFilter={setTemplateCategoryFilter}
                setAIConfig={setAIConfig}
                handleCreateTemplate={handleCreateTemplate}
                handleUpdateTemplate={handleUpdateTemplate}
                handleEditTemplate={handleEditTemplate}
                handleDuplicateTemplate={handleDuplicateTemplate}
                handleDeleteTemplate={handleDeleteTemplate}
                addTrackingLink={addTrackingLink}
                removeTrackingLink={removeTrackingLink}
                generateQRCode={generateQRCode}
                removeQRCode={removeQRCode}
                generatePhishingTemplate={generatePhishingTemplate}
              />
            </TabsContent>
            
            <TabsContent value="targeting" className="space-y-6">
              <TargetingConfig
                targetingTab={targetingTab}
                selectedUsers={selectedUsers}
                selectedGroups={selectedGroups}
                userSearchQuery={userSearchQuery}
                groupSearchQuery={groupSearchQuery}
                riskFilterLevel={riskFilterLevel}
                isEntraConnected={isEntraConnected}
                isConnecting={isConnecting}
                setTargetingTab={setTargetingTab}
                setSelectedUsers={setSelectedUsers}
                setSelectedGroups={setSelectedGroups}
                setUserSearchQuery={setUserSearchQuery}
                setGroupSearchQuery={setGroupSearchQuery}
                setRiskFilterLevel={setRiskFilterLevel}
                onConnectEntra={handleConnectEntra}
                onToggleUserSelection={toggleUserSelection}
                onToggleGroupSelection={toggleGroupSelection}
              />
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <PhishingSettings
                scheduleSettings={scheduleSettings}
                emailProvider={emailProvider}
                apiConfig={apiConfig}
                aiConfig={aiConfig}
                showApiKey={showApiKey}
                onScheduleSettingsChange={setScheduleSettings}
                onEmailProviderChange={setEmailProvider}
                onAPIConfigChange={setApiConfig}
                onAIConfigChange={setAIConfig}
                onToggleApiKey={() => setShowApiKey(!showApiKey)}
                onSaveAPIConfig={() => setApiConfig({...apiConfig, saved: true})}
                onSaveAllSettings={() => console.log('Saving all settings')}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PhishingSimulationManager;