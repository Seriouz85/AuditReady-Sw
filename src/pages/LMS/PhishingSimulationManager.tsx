import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  ActivitySquare,
  AlertCircle,
  BarChart,
  BarChart2,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock,
  Copy,
  Edit,
  Eye,
  FileCheck,
  FileInput,
  FileWarning,
  Fish,
  Group,
  LineChart,
  Loader2,
  Mail,
  MousePointer,
  Plus,
  Save,
  Search,
  Settings,
  Sparkles,
  Target,
  Trash2,
  UserPlus,
  UserRound,
  Users,
  X
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";

// Add QRCode library import
import { QRCodeSVG } from 'qrcode.react';

interface PhishingTemplate {
  id: string;
  name: string;
  subject: string;
  difficultyLevel: string;
  category: string;
  html?: string;
  content?: string; // Plain text content
  trackingLinks: Array<{url: string, displayText: string, trackingId: string}>;
  qrCodes?: Array<{url: string, description: string, trackingId: string}>;
  createdAt?: string;
  lastUsed?: string;
  successRate?: number;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  targetGroups: string[];
  templateId: string;
  schedule: {
    startDate: string;
    frequency: 'once' | 'weekly' | 'monthly';
    randomize: boolean;
  };
  stats?: {
    sent: number;
    opened: number;
    clicked: number;
    reported: number;
    progress?: number;
    openRate?: number;
    clickRate?: number;
    reportRate?: number;
    timeline?: Array<{ date: string; sent: number; opened: number; clicked: number; reported: number }>;
  };
  createdAt?: string;
  createdBy?: string;
  lastUpdated?: string;
}

// Add interface for user and group data
interface UserData {
  id: string;
  name: string;
  email: string;
  department: string;
  title: string;
  location: string;
  manager?: string;
  riskScore?: number;
}

interface GroupData {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  type: 'security' | 'distribution' | 'microsoft-365' | 'custom';
}

// Enhanced sample templates
const sampleTemplates: PhishingTemplate[] = [
  {
    id: 'template-1',
    name: 'Password Reset',
    subject: 'Urgent: Your password will expire today',
    content: 'Dear User,\n\nOur system indicates that your password will expire in the next 2 hours. To ensure uninterrupted access to your account, please reset your password immediately by clicking the link below:\n\nReset Password Now\n\nIf you do not reset your password before it expires, you may experience difficulties accessing your account and company resources.\n\nThank you,\nIT Security Team',
    difficultyLevel: 'Easy',
    category: 'Account Security',
    trackingLinks: [
      {
        url: 'https://tracking.example.com/password-reset?id=123456',
        displayText: 'Reset Password Now',
        trackingId: 'link-123'
      }
    ],
    createdAt: '2023-11-15',
    lastUsed: '2023-12-01',
    successRate: 42
  },
  {
    id: 'template-2',
    name: 'IT Department - Urgent Update',
    subject: 'Critical Security Update Required',
    content: 'Dear Employee,\n\nOur security monitoring system has detected several unauthorized access attempts to your company account.\n\nTo secure your account, please verify your identity immediately by clicking on the following link:\n\nVerify Account Security\n\nFailure to verify within 24 hours may result in temporary account suspension for security purposes.\n\nRegards,\nIT Security Department',
    difficultyLevel: 'Medium',
    category: 'IT Security',
    trackingLinks: [
      {
        url: 'https://tracking.example.com/security-verify?id=78901',
        displayText: 'Verify Account Security',
        trackingId: 'link-456'
      }
    ],
    qrCodes: [
      {
        url: 'https://tracking.example.com/qr-security-verify?id=78901',
        description: 'Scan to verify on mobile',
        trackingId: 'qr-123'
      }
    ],
    createdAt: '2023-10-20',
    lastUsed: '2023-11-10',
    successRate: 38
  },
  {
    id: 'template-3',
    name: 'Company Benefits Update',
    subject: 'Important: Changes to your benefits package',
    content: 'Dear Valued Employee,\n\nWe are writing to inform you about important updates to your employee benefits package that will take effect next month.\n\nPlease review the changes and confirm your selections by clicking the link below:\n\nReview Benefits Changes\n\nThe deadline for confirmation is the end of this week. If you do not confirm, your current benefits selection will remain unchanged.\n\nBest regards,\nHuman Resources Department',
    difficultyLevel: 'Hard',
    category: 'HR',
    trackingLinks: [
      {
        url: 'https://tracking.example.com/benefits-update?id=34567',
        displayText: 'Review Benefits Changes',
        trackingId: 'link-789'
      }
    ],
    createdAt: '2023-09-05',
    lastUsed: '2023-09-28',
    successRate: 25
  },
  {
    id: 'template-4',
    name: 'Shared Document',
    subject: 'Document shared with you: Q4 Financial Report',
    content: 'Hello,\n\nA confidential document "Q4 Financial Report.pdf" has been shared with you through our secure document sharing system.\n\nTo access this document, please click the link below and sign in with your company credentials:\n\nAccess Shared Document\n\nThis link will expire in 7 days.\n\nThank you,\nDocument Management System',
    difficultyLevel: 'Medium',
    category: 'Document Sharing',
    trackingLinks: [
      {
        url: 'https://tracking.example.com/shared-doc?id=91011',
        displayText: 'Access Shared Document',
        trackingId: 'link-101'
      }
    ],
    createdAt: '2023-10-15',
    lastUsed: '2023-11-22',
    successRate: 52
  },
  {
    id: 'template-5',
    name: 'Executive Announcement',
    subject: 'Important Message from the CEO',
    content: 'Dear Team Member,\n\nI would like to share some important updates about our company\'s direction and upcoming organizational changes.\n\nPlease review the attached announcement and provide your acknowledgment by clicking on the link below:\n\nAcknowledge Receipt\n\nYour feedback is important to us as we navigate these changes together.\n\nBest regards,\nCEO',
    difficultyLevel: 'Hard',
    category: 'Executive',
    trackingLinks: [
      {
        url: 'https://tracking.example.com/exec-announcement?id=121314',
        displayText: 'Acknowledge Receipt',
        trackingId: 'link-202'
      }
    ],
    createdAt: '2023-11-01',
    lastUsed: '2023-11-05',
    successRate: 31
  }
];

// Updated sample campaigns with enhanced statistics
const sampleCampaigns: Campaign[] = [
  {
    id: 'campaign-1',
    name: 'Q2 Security Awareness',
    description: 'Quarterly phishing test for all employees',
    status: 'active',
    targetGroups: ['All Employees'],
    templateId: 'template-1',
    schedule: {
      startDate: '2023-04-15',
      frequency: 'once',
      randomize: true
    },
    stats: {
      sent: 245,
      opened: 180,
      clicked: 45,
      reported: 20,
      progress: 87,
      openRate: 73.5,
      clickRate: 18.4,
      reportRate: 8.2,
      timeline: [
        { date: '2023-04-15', sent: 245, opened: 120, clicked: 30, reported: 12 },
        { date: '2023-04-16', sent: 0, opened: 45, clicked: 10, reported: 5 },
        { date: '2023-04-17', sent: 0, opened: 15, clicked: 5, reported: 3 }
      ]
    },
    createdAt: '2023-04-10',
    createdBy: 'Admin User',
    lastUpdated: '2023-04-14'
  },
  {
    id: 'campaign-2',
    name: 'Finance Department Training',
    description: 'Targeted phishing test for finance team',
    status: 'scheduled',
    targetGroups: ['Finance', 'Accounting'],
    templateId: 'template-2',
    schedule: {
      startDate: '2023-05-01',
      frequency: 'weekly',
      randomize: false
    },
    createdAt: '2023-04-20',
    createdBy: 'Admin User',
    lastUpdated: '2023-04-22'
  }
];

// Sample user and group data
const sampleUsers: UserData[] = [
  { id: 'u1', name: 'John Smith', email: 'john.smith@company.com', department: 'IT', title: 'Systems Administrator', location: 'New York', riskScore: 15 },
  { id: 'u2', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', department: 'Finance', title: 'Financial Analyst', location: 'Chicago', riskScore: 75 },
  { id: 'u3', name: 'Michael Brown', email: 'michael.brown@company.com', department: 'Executive', title: 'CEO', location: 'New York', riskScore: 92 },
  { id: 'u4', name: 'Emily Davis', email: 'emily.davis@company.com', department: 'HR', title: 'HR Manager', location: 'Boston', riskScore: 45 },
  { id: 'u5', name: 'Robert Wilson', email: 'robert.wilson@company.com', department: 'Sales', title: 'Sales Representative', location: 'Los Angeles', riskScore: 62 },
  { id: 'u6', name: 'Jennifer Lee', email: 'jennifer.lee@company.com', department: 'Marketing', title: 'Marketing Specialist', location: 'San Francisco', riskScore: 38 },
  { id: 'u7', name: 'David Martinez', email: 'david.martinez@company.com', department: 'IT', title: 'Network Engineer', location: 'Chicago', riskScore: 27 },
  { id: 'u8', name: 'Lisa Anderson', email: 'lisa.anderson@company.com', department: 'Finance', title: 'Accountant', location: 'New York', riskScore: 53 }
];

const sampleGroups: GroupData[] = [
  { id: 'g1', name: 'IT Department', description: 'All IT department members', memberCount: 42, type: 'security' },
  { id: 'g2', name: 'Finance Team', description: 'Finance department staff', memberCount: 18, type: 'distribution' },
  { id: 'g3', name: 'Executive Leadership', description: 'Executive team members', memberCount: 8, type: 'security' },
  { id: 'g4', name: 'Sales Representatives', description: 'Sales team members', memberCount: 35, type: 'microsoft-365' },
  { id: 'g5', name: 'Marketing Department', description: 'Marketing staff', memberCount: 15, type: 'distribution' },
  { id: 'g6', name: 'HR Team', description: 'Human Resources department', memberCount: 12, type: 'microsoft-365' },
  { id: 'g7', name: 'New York Office', description: 'All employees in NY office', memberCount: 78, type: 'custom' },
  { id: 'g8', name: 'Admins', description: 'System administrators', memberCount: 6, type: 'security' }
];

// Add additional schedule settings
interface ScheduleSettings {
  advancedOptions: boolean;
  businessHoursOnly: boolean;
  excludeHolidays: boolean;
  timezone: string;
  daysOfWeek: string[];
  timeWindows: Array<{startTime: string; endTime: string}>;
  maxEmailsPerDay: number;
  randomDelayBetweenEmails: boolean;
  delayRange: [number, number]; // minutes
}

// Add API key input and AI section
interface AIConfig {
  enabled: boolean;
  apiKey: string;
  generating: boolean;
  prompt: string;
  error: string | null;
}

const PhishingSimulationManager: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [templates, setTemplates] = useState<PhishingTemplate[]>(sampleTemplates);
  const [campaigns, setCampaigns] = useState<Campaign[]>(sampleCampaigns);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: '',
    description: '',
    status: 'draft',
    targetGroups: [],
    templateId: '',
    schedule: {
      startDate: '',
      frequency: 'once',
      randomize: false
    }
  });
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PhishingTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<PhishingTemplate>>({
    name: '',
    subject: '',
    content: '',
    difficultyLevel: 'Medium',
    category: 'General',
    html: '',
    trackingLinks: [
      {
        url: 'https://tracking.example.com/click?id=' + Date.now(),
        displayText: 'Click Here',
        trackingId: 'link-' + Date.now()
      }
    ],
    qrCodes: []
  });
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showReports, setShowReports] = useState(false);
  
  // Add AI configuration state
  const [aiConfig, setAIConfig] = useState<AIConfig>({
    enabled: true,  // Always enabled
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',  // Use Vite environment variable
    generating: false,
    prompt: '',
    error: null
  });
  
  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setAIConfig(prev => ({...prev, apiKey: savedApiKey}));
    }
  }, []);
  
  // Add state variables for settings and reports modals
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings>({
    advancedOptions: false,
    businessHoursOnly: true,
    excludeHolidays: true,
    timezone: 'America/New_York',
    daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    timeWindows: [{startTime: '09:00', endTime: '17:00'}],
    maxEmailsPerDay: 50,
    randomDelayBetweenEmails: true,
    delayRange: [5, 30]
  });
  
  // Get unique categories from templates
  const uniqueCategories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];
  
  // Handler for creating a new campaign
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
      name: '',
      description: '',
      status: 'draft',
      targetGroups: [],
      templateId: '',
      schedule: {
        startDate: '',
        frequency: 'once',
        randomize: false
      }
    });
  };
  
  // Get template details by ID
  const getTemplateById = (id: string) => {
    return templates.find(template => template.id === id) || {
      name: 'Unknown Template',
      subject: '',
      difficultyLevel: '',
      category: ''
    };
  };
  
  // Handle creating a new template
  const handleCreateTemplate = () => {
    const templateId = `template-${Date.now()}`;
    const newTemplateData: PhishingTemplate = {
      id: templateId,
      name: newTemplate.name || 'Untitled Template',
      subject: newTemplate.subject || 'No Subject',
      difficultyLevel: newTemplate.difficultyLevel || 'Medium',
      category: newTemplate.category || 'General',
      html: newTemplate.html || '',
      content: newTemplate.content || '',
      trackingLinks: newTemplate.trackingLinks || [],
      qrCodes: newTemplate.qrCodes || [],
      createdAt: new Date().toISOString().split('T')[0],
      successRate: 0
    };
    
    setTemplates([...templates, newTemplateData]);
    setShowTemplateEditor(false);
    setNewTemplate({
      name: '',
      subject: '',
      content: '',
      difficultyLevel: 'Medium',
      category: 'General',
      html: '',
      trackingLinks: [
        {
          url: 'https://tracking.example.com/click?id=' + Date.now(),
          displayText: 'Click Here',
          trackingId: 'link-' + Date.now()
        }
      ],
      qrCodes: []
    });
  };
  
  // Handle editing an existing template
  const handleEditTemplate = (template: PhishingTemplate) => {
    setSelectedTemplate(template);
    setNewTemplate({
      name: template.name,
      subject: template.subject,
      difficultyLevel: template.difficultyLevel,
      category: template.category,
      html: template.html || '',
      content: template.content || '',
      trackingLinks: template.trackingLinks || [],
      qrCodes: template.qrCodes || []
    });
    setShowTemplateEditor(true);
  };
  
  // Handle updating a template
  const handleUpdateTemplate = () => {
    if (!selectedTemplate) return;
    
    const updatedTemplates = templates.map(template => 
      template.id === selectedTemplate.id 
        ? {
            ...template,
            name: newTemplate.name || template.name,
            subject: newTemplate.subject || template.subject,
            difficultyLevel: newTemplate.difficultyLevel || template.difficultyLevel,
            category: newTemplate.category || template.category,
            html: newTemplate.html || template.html,
            content: newTemplate.content || template.content,
            trackingLinks: newTemplate.trackingLinks || template.trackingLinks,
            qrCodes: newTemplate.qrCodes || template.qrCodes
          }
        : template
    );
    
    setTemplates(updatedTemplates);
    setShowTemplateEditor(false);
    setSelectedTemplate(null);
    setNewTemplate({
      name: '',
      subject: '',
      content: '',
      difficultyLevel: 'Medium',
      category: 'General',
      html: '',
      trackingLinks: [
        {
          url: 'https://tracking.example.com/click?id=' + Date.now(),
          displayText: 'Click Here',
          trackingId: 'link-' + Date.now()
        }
      ],
      qrCodes: []
    });
  };
  
  // Initialize newTemplate state for duplicating a template
  const handleDuplicateTemplate = (template: PhishingTemplate) => {
    const templateId = `template-${Date.now()}`;
    const duplicatedTemplate: PhishingTemplate = {
      ...template,
      id: templateId,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: undefined,
      successRate: 0
    };
    
    setTemplates([...templates, duplicatedTemplate]);
  };
  
  // Handle deleting a template
  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(template => template.id !== templateId));
  };
  
  // Add this function to view campaign details
  const handleViewCampaignDetails = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowCampaignDetails(true);
  };
  
  // Add state for Entra ID integration
  const [isEntraConnected, setIsEntraConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [targetingTab, setTargetingTab] = useState<'groups' | 'users'>('groups');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [riskFilterLevel, setRiskFilterLevel] = useState('all');
  
  // Filter users based on search query and risk level
  const filteredUsers = sampleUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                         user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                         user.department.toLowerCase().includes(userSearchQuery.toLowerCase());
    
    const matchesRisk = riskFilterLevel === 'all' || 
                       (riskFilterLevel === 'high' && user.riskScore && user.riskScore >= 70) ||
                       (riskFilterLevel === 'medium' && user.riskScore && user.riskScore >= 30 && user.riskScore < 70) ||
                       (riskFilterLevel === 'low' && user.riskScore && user.riskScore < 30);
    
    return matchesSearch && matchesRisk;
  });
  
  // Filter groups based on search query
  const filteredGroups = sampleGroups.filter(group => 
    group.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) || 
    group.description.toLowerCase().includes(groupSearchQuery.toLowerCase())
  );
  
  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };
  
  // Toggle group selection
  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId) 
        : [...prev, groupId]
    );
  };
  
  // Connect to Entra ID
  const handleConnectEntra = () => {
    setIsConnecting(true);
    // Simulate connecting to Entra ID
    setTimeout(() => {
      setIsEntraConnected(true);
      setIsConnecting(false);
    }, 2000);
  };
  
  // Add to component state
  const [emailProvider, setEmailProvider] = useState('sendgrid');
  const [apiConfig, setApiConfig] = useState({
    apiKey: '',
    smtpHost: '',
    smtpPort: 587,
    useTLS: true,
    username: '',
    password: '',
    saved: false
  });
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Holidays are referenced in the scheduleSettings excludeHolidays setting
  
  // Add QR code generator function
  const generateQRCode = () => {
    if (!newTemplate.qrCodes) {
      newTemplate.qrCodes = [];
    }
    
    const newQRCode = {
      url: `https://tracking.example.com/qr-code?id=${Date.now()}`,
      description: 'Scan to verify identity',
      trackingId: `qr-${Date.now()}`
    };
    
    setNewTemplate({
      ...newTemplate,
      qrCodes: [...(newTemplate.qrCodes || []), newQRCode]
    });
  };
  
  // Add tracking link function
  const addTrackingLink = () => {
    const newLink = {
      url: `https://tracking.example.com/click?id=${Date.now()}`,
      displayText: 'Click Here',
      trackingId: `link-${Date.now()}`
    };
    
    setNewTemplate({
      ...newTemplate,
      trackingLinks: [...(newTemplate.trackingLinks || []), newLink]
    });
  };
  
  // Update the removeTrackingLink function
  const removeTrackingLink = (index: number) => {
    const updatedLinks = [...(newTemplate.trackingLinks || [])];
    updatedLinks.splice(index, 1);
    setNewTemplate({
      ...newTemplate,
      trackingLinks: updatedLinks
    });
  };
  
  // Remove QR code function
  const removeQRCode = (index: number) => {
    const updatedQRCodes = [...(newTemplate.qrCodes || [])];
    updatedQRCodes.splice(index, 1);
    setNewTemplate({
      ...newTemplate,
      qrCodes: updatedQRCodes
    });
  };
  
  // Add AI template generation function
  const generatePhishingTemplate = async () => {
    if (!aiConfig.prompt) {
      setAIConfig({...aiConfig, error: "Please describe the type of phishing email you need."});
      return;
    }
    
    // Set generating state
    setAIConfig({...aiConfig, generating: true, error: null});
    
    try {
      console.log('Making API request to Gemini...');
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${aiConfig.apiKey}`;
      
      const promptText = `You are a cybersecurity expert who creates realistic phishing simulation templates for security awareness training. 

Generate a complete phishing email template based on the following requirements: "${aiConfig.prompt}"

Your response should be structured as a JSON object with the following fields:
{
  "name": "A descriptive name for this template",
  "subject": "The email subject line",
  "content": "The main body content of the email with line breaks",
  "difficultyLevel": "Easy, Medium, or Hard",
  "category": "The category this phishing attempt falls under (e.g., Account Security, IT, HR, Financial)",
  "trackingLinks": [
    {
      "displayText": "The text that will be displayed for a tracking link",
      "url": "A sample tracking URL"
    }
  ],
  "needsQRCode": boolean (true/false) indicating if a QR code would be appropriate for this phishing attempt
}

Important guidelines:
1. Make the phishing attempt realistic but not too obvious
2. Include at least one tracking link with appropriate display text 
3. Use real-world phishing tactics that match the given difficulty level
4. For medium/hard difficulty, incorporate more sophisticated social engineering techniques
5. If a QR code makes sense for this scenario, set needsQRCode to true
6. Ensure the template includes elements that would make users want to click (urgency, authority, etc.)
7. VERY IMPORTANT: Format your entire response as a valid JSON object and nothing else. Do NOT include any text before or after the JSON.

The subject and content fields are the most important elements, make sure they're well-crafted and convincing.`;

      const requestBody = {
        contents: [{
          parts: [{
            text: promptText
          }]
        }]
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
        },
        mode: 'cors',
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error?.message || 'API request failed');
        } catch (e) {
          throw new Error(`API request failed with status ${response.status}: ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('API Response:', data);

      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!aiResponse) {
        throw new Error('No valid response from AI');
      }
      
      // Try to extract JSON from the response which might have additional text
      const jsonMatch = aiResponse.match(/(\{[\s\S]*\})/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      
      try {
        // Parse the JSON response
        const templateData = JSON.parse(jsonString);
        
        if (!templateData.subject || !templateData.content) {
          throw new Error('The AI response is missing required fields (subject or content)');
        }
        
        // Format the template data for our system
        const newTemplateData: Partial<PhishingTemplate> = {
          name: templateData.name || 'AI Generated Template',
          subject: templateData.subject,
          content: templateData.content,
          difficultyLevel: templateData.difficultyLevel || 'Medium',
          category: templateData.category || 'General',
          trackingLinks: Array.isArray(templateData.trackingLinks) ? 
            templateData.trackingLinks.map((link: { url: string; displayText: string }, index: number) => ({
              url: link.url || `https://tracking.example.com/click?id=${Date.now()}-${index}`,
              displayText: link.displayText || 'Click Here',
              trackingId: `link-ai-${Date.now()}-${index}`
            })) : [
              {
                url: `https://tracking.example.com/click?id=${Date.now()}`,
                displayText: 'Click Here',
                trackingId: `link-ai-${Date.now()}`
              }
            ],
          qrCodes: templateData.needsQRCode ? [
            {
              url: `https://tracking.example.com/qr-generated?id=${Date.now()}`,
              description: 'Scan this QR code',
              trackingId: `qr-ai-${Date.now()}`
            }
          ] : []
        };
        
        // Update the form with generated data
        setNewTemplate(newTemplateData);
        setAIConfig({...aiConfig, generating: false, error: null});
        
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError, jsonString);
        setAIConfig({...aiConfig, generating: false, error: 'Failed to parse AI response. Please try again with a simpler request.'});
      }
      
    } catch (error) {
      console.error('AI generation error:', error);
      let errorMessage = 'An unexpected error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setAIConfig({...aiConfig, generating: false, error: errorMessage});
    }
  };
  
  // Save API key to localStorage when it changes
  useEffect(() => {
    if (aiConfig.apiKey) {
      localStorage.setItem('gemini_api_key', aiConfig.apiKey);
    }
  }, [aiConfig.apiKey]);
  
  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2)_0%,rgba(0,0,0,0.1)_100%)]"></div>
          <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-8 -left-8 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto flex justify-between items-center relative z-10">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate('/lms')} className="rounded-full hover:bg-white/20 text-white mr-3">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center">
                <Fish className="h-8 w-8 text-white mr-3" />
                <h1 className="text-2xl font-bold text-white">Phishing Simulation Manager</h1>
              </div>
              <p className="text-white/80 text-sm mt-1 ml-11">Create and manage phishing campaigns to enhance security awareness</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/20"
              onClick={() => setShowReports(true)}
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              View Reports
            </Button>
            <Button 
              className="bg-white text-blue-600 hover:bg-white/90"
              onClick={() => {
                console.log('Settings button clicked, changing to settings tab');
                // Close any open dialogs or detailed views to avoid interference
                setShowNewCampaign(false);
                setShowCampaignDetails(false);
                setShowTemplateEditor(false);
                setShowReports(false);
                // Set the active tab to settings
                setActiveTab('settings');
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>
      
      {/* Analytics Reports Modal */}
      {showReports && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <div className="flex items-center">
                <BarChart2 className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold">Phishing Campaign Analytics</h2>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowReports(false)} 
                className="rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-90px)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-4 bg-green-50 border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Average Open Rate</p>
                      <h3 className="text-3xl font-bold text-green-700">68.2%</h3>
                    </div>
                    <div className="bg-green-100 rounded-full p-3">
                      <Mail className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-sm text-green-600 mt-2">↑ 12% from previous month</p>
                </Card>
                
                <Card className="p-4 bg-red-50 border-red-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600 font-medium">Average Click Rate</p>
                      <h3 className="text-3xl font-bold text-red-700">42.5%</h3>
                    </div>
                    <div className="bg-red-100 rounded-full p-3">
                      <MousePointer className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <p className="text-sm text-red-600 mt-2">↓ 5% from previous month</p>
                </Card>
                
                <Card className="p-4 bg-blue-50 border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Report Rate</p>
                      <h3 className="text-3xl font-bold text-blue-700">15.8%</h3>
                    </div>
                    <div className="bg-blue-100 rounded-full p-3">
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-sm text-blue-600 mt-2">↑ 23% from previous month</p>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Campaign Performance Over Time</h3>
                    <Select defaultValue="6months">
                      <SelectTrigger className="w-[150px] rounded-xl">
                        <SelectValue placeholder="Time Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30days">Last 30 Days</SelectItem>
                        <SelectItem value="3months">Last 3 Months</SelectItem>
                        <SelectItem value="6months">Last 6 Months</SelectItem>
                        <SelectItem value="1year">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="h-80 flex flex-col justify-center items-center">
                    <div className="w-20 h-20 flex items-center justify-center">
                      <BarChart className="h-20 w-20 text-gray-300" />
                    </div>
                    <p className="text-gray-500 mt-4">Campaign performance chart will appear here</p>
                  </div>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Most Effective Templates</h3>
                    <div className="space-y-4">
                      {templates.slice(0, 5).map((template, index) => (
                        <div key={template.id} className="flex items-center gap-4">
                          <div className="bg-gray-100 text-gray-800 h-8 w-8 rounded-full flex items-center justify-center font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-muted-foreground">{template.category}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-lg">{75 - index * 5}%</div>
                            <div className="text-xs text-muted-foreground">Click Rate</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Vulnerable Departments</h3>
                    <div className="space-y-4">
                      {['Sales', 'Marketing', 'Finance', 'HR', 'Engineering'].map((dept, index) => (
                        <div key={dept} className="flex items-center gap-4">
                          <div className="bg-gray-100 text-gray-800 h-8 w-8 rounded-full flex items-center justify-center font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{dept}</div>
                            <div className="text-sm text-muted-foreground">{20 + index * 15} employees</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-lg">{70 - index * 8}%</div>
                            <div className="text-xs text-muted-foreground">Failure Rate</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
                
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Campaigns</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Campaign Name</th>
                          <th className="text-left py-3 px-4 font-medium">Start Date</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-right py-3 px-4 font-medium">Open Rate</th>
                          <th className="text-right py-3 px-4 font-medium">Click Rate</th>
                          <th className="text-right py-3 px-4 font-medium">Report Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map(campaign => (
                          <tr key={campaign.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{campaign.name}</td>
                            <td className="py-3 px-4">{campaign.schedule.startDate}</td>
                            <td className="py-3 px-4">
                              <Badge 
                                className={`${
                                  campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                                  campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                  campaign.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                  'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right font-medium">
                              {campaign.stats?.openRate || '0'}%
                            </td>
                            <td className="py-3 px-4 text-right font-medium">
                              {campaign.stats?.clickRate || '0'}%
                            </td>
                            <td className="py-3 px-4 text-right font-medium">
                              {campaign.stats?.reportRate || '0'}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <Button 
                onClick={() => setShowReports(false)} 
                className="rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="container max-w-7xl mx-auto p-6">
        {/* Glass effect card for tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100 mb-6">
          <Tabs value={activeTab} onValueChange={(value) => {
            console.log('Tab value changing to:', value);
            setActiveTab(value);
          }} className="w-full">
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
                <Button 
                  onClick={() => setShowNewCampaign(true)}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Campaign
                </Button>
              )}
            </div>
            
            {/* Campaigns Tab - Enhanced with details view */}
            <TabsContent value="campaigns" className="space-y-6 pt-2">
              {showCampaignDetails && selectedCampaign ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowCampaignDetails(false)} 
                        className="mr-2"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Campaigns
                      </Button>
                      <Badge 
                        className={`${
                          selectedCampaign.status === 'active' ? 'bg-green-100 text-green-800' :
                          selectedCampaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          selectedCampaign.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                          'bg-amber-100 text-amber-800'
                        } px-2.5 py-0.5 rounded-full text-xs font-medium`}
                      >
                        {selectedCampaign.status.charAt(0).toUpperCase() + selectedCampaign.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Campaign
                      </Button>
                      {selectedCampaign.status === 'draft' && (
                        <Button variant="outline" size="sm" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
                          <ActivitySquare className="h-4 w-4 mr-2" />
                          Launch Campaign
                        </Button>
                      )}
                      {selectedCampaign.status === 'active' && (
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
                          <h2 className="text-2xl font-bold">{selectedCampaign.name}</h2>
                          <p className="text-gray-600 mt-1">{selectedCampaign.description}</p>
                        </div>
                        {selectedCampaign.stats?.progress !== undefined && (
                          <div className="bg-gray-50 rounded-full w-20 h-20 flex flex-col items-center justify-center border">
                            <div className="text-xl font-semibold">{selectedCampaign.stats.progress}%</div>
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
                                  selectedCampaign.status === 'active' ? 'bg-green-100 text-green-800' :
                                  selectedCampaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                  selectedCampaign.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                                  'bg-amber-100 text-amber-800'
                                } px-2.5 py-0.5 rounded-full text-xs font-medium`}
                              >
                                {selectedCampaign.status.charAt(0).toUpperCase() + selectedCampaign.status.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-500">Template</span>
                              <span className="font-medium">{getTemplateById(selectedCampaign.templateId).name}</span>
                            </div>
                            
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-500">Start Date</span>
                              <span className="font-medium">{selectedCampaign.schedule.startDate}</span>
                            </div>
                            
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-500">Frequency</span>
                              <span className="font-medium capitalize">{selectedCampaign.schedule.frequency}</span>
                            </div>
                            
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-500">Randomize</span>
                              <Badge variant={selectedCampaign.schedule.randomize ? "default" : "outline"}>
                                {selectedCampaign.schedule.randomize ? "Yes" : "No"}
                              </Badge>
                            </div>
                            
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-500">Target Groups</span>
                              <div className="flex flex-wrap gap-1 justify-end">
                                {selectedCampaign.targetGroups.map(group => (
                                  <Badge key={group} variant="outline" className="text-xs">
                                    {group}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            {selectedCampaign.createdAt && (
                              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-500">Created</span>
                                <span className="text-sm">{selectedCampaign.createdAt} by {selectedCampaign.createdBy}</span>
                              </div>
                            )}
                            
                            {selectedCampaign.lastUpdated && (
                              <div className="flex justify-between items-center py-2">
                                <span className="text-gray-500">Last Updated</span>
                                <span className="text-sm">{selectedCampaign.lastUpdated}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {selectedCampaign.stats && (
                          <div>
                            <h3 className="text-lg font-semibold mb-3">Campaign Results</h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <Card className="p-4 bg-blue-50 border-blue-100">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <Mail className="h-5 w-5 text-blue-600 mr-2" />
                                    <div>
                                      <p className="text-sm text-blue-700">Emails Sent</p>
                                      <p className="text-xl font-semibold text-blue-800">{selectedCampaign.stats.sent}</p>
                                    </div>
                                  </div>
                                  <div className="text-sm text-blue-700">Total</div>
                                </div>
                              </Card>
                              
                              <Card className="p-4 bg-amber-50 border-amber-100">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <FileCheck className="h-5 w-5 text-amber-600 mr-2" />
                                    <div>
                                      <p className="text-sm text-amber-700">Opened</p>
                                      <p className="text-xl font-semibold text-amber-800">{selectedCampaign.stats.opened}</p>
                                    </div>
                                  </div>
                                  <div className="text-sm text-amber-700">{selectedCampaign.stats.openRate}%</div>
                                </div>
                              </Card>
                              
                              <Card className="p-4 bg-red-50 border-red-100">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <FileWarning className="h-5 w-5 text-red-600 mr-2" />
                                    <div>
                                      <p className="text-sm text-red-700">Clicked</p>
                                      <p className="text-xl font-semibold text-red-800">{selectedCampaign.stats.clicked}</p>
                                    </div>
                                  </div>
                                  <div className="text-sm text-red-700">{selectedCampaign.stats.clickRate}%</div>
                                </div>
                              </Card>
                              
                              <Card className="p-4 bg-green-50 border-green-100">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <Target className="h-5 w-5 text-green-600 mr-2" />
                                    <div>
                                      <p className="text-sm text-green-700">Reported</p>
                                      <p className="text-xl font-semibold text-green-800">{selectedCampaign.stats.reported}</p>
                                    </div>
                                  </div>
                                  <div className="text-sm text-green-700">{selectedCampaign.stats.reportRate}%</div>
                                </div>
                              </Card>
                            </div>
                            
                            <div className="border rounded-xl p-4 mt-6">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="font-medium">Campaign Timeline</h4>
                                <Badge className="text-xs">Last 3 days</Badge>
                              </div>
                              <div className="h-[200px] flex items-end justify-between">
                                {selectedCampaign.stats.timeline?.map((day, index) => (
                                  <div key={index} className="flex-1 flex flex-col items-center">
                                    <div className="w-full flex justify-around items-end h-[160px] px-1">
                                      <div 
                                        className="w-2 bg-blue-200 rounded-t-sm" 
                                        style={{height: `${(day.sent / Math.max(...selectedCampaign.stats!.timeline!.map(d => d.sent))) * 100}%`}}
                                      ></div>
                                      <div 
                                        className="w-2 bg-amber-200 rounded-t-sm" 
                                        style={{height: `${(day.opened / Math.max(...selectedCampaign.stats!.timeline!.map(d => Math.max(d.opened, 1)))) * 100}%`}}
                                      ></div>
                                      <div 
                                        className="w-2 bg-red-200 rounded-t-sm" 
                                        style={{height: `${(day.clicked / Math.max(...selectedCampaign.stats!.timeline!.map(d => Math.max(d.clicked, 1)))) * 100}%`}}
                                      ></div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">{day.date.split('-')[2]}</div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-center mt-2">
                                <div className="flex items-center mr-4 text-xs">
                                  <div className="w-3 h-3 bg-blue-200 rounded-sm mr-1"></div>
                                  <span>Sent</span>
                                </div>
                                <div className="flex items-center mr-4 text-xs">
                                  <div className="w-3 h-3 bg-amber-200 rounded-sm mr-1"></div>
                                  <span>Opened</span>
                                </div>
                                <div className="flex items-center text-xs">
                                  <div className="w-3 h-3 bg-red-200 rounded-sm mr-1"></div>
                                  <span>Clicked</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 pt-4 border-t flex gap-2 justify-end">
                        <Button variant="outline">
                          <BarChart className="h-4 w-4 mr-2" />
                          Export Data
                        </Button>
                        <Button>
                          <LineChart className="h-4 w-4 mr-2" />
                          View Full Report
                        </Button>
                      </div>
                    </Card>
                  </div>
                </div>
              ) : (
                <>
                  {showNewCampaign ? (
                    <Card className="p-6 rounded-xl border-0 shadow-lg overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-50 to-transparent -z-10"></div>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Create New Campaign</h2>
                        <Button variant="ghost" size="icon" onClick={() => setShowNewCampaign(false)} className="rounded-full hover:bg-gray-100">
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
                                  value={newCampaign.name}
                                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="campaignDescription">Description</Label>
                                <Textarea 
                                  id="campaignDescription" 
                                  placeholder="Describe the purpose of this campaign" 
                                  className="mt-1 min-h-[100px] rounded-xl"
                                  value={newCampaign.description}
                                  onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="templateSelect">Select Template</Label>
                                <Select 
                                  value={newCampaign.templateId}
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
                                  value={newCampaign.schedule?.startDate}
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
                                    value={newCampaign.schedule?.frequency}
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
                                  checked={newCampaign.schedule?.randomize}
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
                        <Button variant="outline" className="rounded-full" onClick={() => setShowNewCampaign(false)}>
                          Cancel
                        </Button>
                        <Button className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" onClick={handleCreateCampaign}>
                          <Save className="mr-2 h-4 w-4" />
                          Create Campaign
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <>
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
                                
                                <Button variant="ghost" className="w-full mt-2 text-sm justify-start p-2 h-auto" onClick={() => handleViewCampaignDetails(campaign)}>
                                  View Details
                                  <ChevronRight className="ml-auto h-4 w-4" />
                                </Button>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                      
                      {campaigns.length === 0 && (
                        <div className="text-center py-12">
                          <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Campaigns Created Yet</h3>
                          <p className="text-muted-foreground mb-6">Create your first phishing campaign to start testing your organization</p>
                          <Button 
                            onClick={() => setShowNewCampaign(true)}
                            className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Create First Campaign
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </TabsContent>
            
            {/* Templates Tab - Enhanced */}
            <TabsContent value="templates" className="space-y-6">
              {showTemplateEditor ? (
                <Card className="p-6 rounded-xl border-0 shadow-lg overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-50 to-transparent -z-10"></div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                      {selectedTemplate ? `Edit Template: ${selectedTemplate.name}` : 'Create New Template'}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={() => {
                      setShowTemplateEditor(false);
                      setSelectedTemplate(null);
                    }} className="rounded-full hover:bg-gray-100">
                      <Trash2 className="h-5 w-5 text-gray-400" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="templateName">Template Name</Label>
                        <Input 
                          id="templateName" 
                          placeholder="Enter template name" 
                          className="mt-1 rounded-xl"
                          value={newTemplate.name}
                          onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="templateSubject">Email Subject</Label>
                        <Input 
                          id="templateSubject" 
                          placeholder="Enter email subject line" 
                          className="mt-1 rounded-xl"
                          value={newTemplate.subject}
                          onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="templateContent">Email Content</Label>
                        <Textarea 
                          id="templateContent" 
                          placeholder="Enter the main content of your email" 
                          className="mt-1 min-h-[120px] rounded-xl"
                          value={newTemplate.content}
                          onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <Label className="flex justify-between items-center">
                          <span>Tracking Links</span>
                          <Button variant="outline" size="sm" onClick={addTrackingLink}>
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Add Link
                          </Button>
                        </Label>
                        <div className="space-y-3 mt-2">
                          {(newTemplate.trackingLinks || []).map((link, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input 
                                placeholder="Display Text" 
                                className="flex-1 rounded-l-xl rounded-r-none"
                                value={link.displayText}
                                onChange={(e) => {
                                  const updatedLinks = [...(newTemplate.trackingLinks || [])];
                                  updatedLinks[index] = {...link, displayText: e.target.value};
                                  setNewTemplate({...newTemplate, trackingLinks: updatedLinks});
                                }}
                              />
                              <Input 
                                placeholder="URL" 
                                className="flex-1"
                                value={link.url}
                                onChange={(e) => {
                                  const updatedLinks = [...(newTemplate.trackingLinks || [])];
                                  updatedLinks[index] = {...link, url: e.target.value};
                                  setNewTemplate({...newTemplate, trackingLinks: updatedLinks});
                                }}
                              />
                              <Button variant="ghost" size="icon" onClick={() => removeTrackingLink(index)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="flex justify-between items-center">
                          <span>QR Codes</span>
                          <Button variant="outline" size="sm" onClick={generateQRCode}>
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Add QR Code
                          </Button>
                        </Label>
                        <div className="space-y-3 mt-2">
                          {(newTemplate.qrCodes || []).map((qrCode, index) => (
                            <div key={index} className="flex items-start gap-3 border p-3 rounded-xl">
                              <div className="bg-white p-2 rounded-md">
                                <QRCodeSVG value={qrCode.url} size={80} />
                              </div>
                              <div className="flex-1">
                                <Input 
                                  placeholder="Description" 
                                  className="mb-2 w-full"
                                  value={qrCode.description}
                                  onChange={(e) => {
                                    const updatedQRCodes = [...(newTemplate.qrCodes || [])];
                                    updatedQRCodes[index] = {...qrCode, description: e.target.value};
                                    setNewTemplate({...newTemplate, qrCodes: updatedQRCodes});
                                  }}
                                />
                                <Input 
                                  placeholder="URL" 
                                  className="w-full"
                                  value={qrCode.url}
                                  onChange={(e) => {
                                    const updatedQRCodes = [...(newTemplate.qrCodes || [])];
                                    updatedQRCodes[index] = {...qrCode, url: e.target.value};
                                    setNewTemplate({...newTemplate, qrCodes: updatedQRCodes});
                                  }}
                                />
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => removeQRCode(index)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-8 border-t pt-6 mb-6">
                        <div>
                          <div className="flex items-center mb-4">
                            <Bot className="h-5 w-5 text-purple-500 mr-2" />
                            <h3 className="font-medium">AI Phishing Template Generator</h3>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="aiPrompt">What kind of phishing email do you need?</Label>
                              <Textarea 
                                id="aiPrompt" 
                                placeholder="Describe the scenario (e.g., 'Password reset email targeting finance department' or 'IT security update with urgent action required')" 
                                className="mt-1 min-h-[80px] rounded-xl"
                                value={aiConfig.prompt}
                                onChange={(e) => setAIConfig({...aiConfig, prompt: e.target.value})}
                              />
                            </div>
                            
                            {aiConfig.error && (
                              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                <div className="flex items-start">
                                  <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                                  <p>{aiConfig.error}</p>
                                </div>
                              </div>
                            )}
                            
                            <Button 
                              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
                              onClick={generatePhishingTemplate}
                              disabled={aiConfig.generating || !aiConfig.prompt}
                            >
                              {aiConfig.generating ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Generating Your Phishing Template...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="mr-2 h-4 w-4" />
                                  Generate Phishing Template
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="templateDifficulty">Difficulty Level</Label>
                          <Select 
                            value={newTemplate.difficultyLevel}
                            onValueChange={(value) => setNewTemplate({...newTemplate, difficultyLevel: value})}
                          >
                            <SelectTrigger id="templateDifficulty" className="mt-1 rounded-xl">
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Easy">Easy</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="templateCategory">Category</Label>
                          <Select 
                            value={newTemplate.category}
                            onValueChange={(value) => setNewTemplate({...newTemplate, category: value})}
                          >
                            <SelectTrigger id="templateCategory" className="mt-1 rounded-xl">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Account Security">Account Security</SelectItem>
                              <SelectItem value="IT Security">IT Security</SelectItem>
                              <SelectItem value="HR">HR</SelectItem>
                              <SelectItem value="Executive">Executive</SelectItem>
                              <SelectItem value="Document Sharing">Document Sharing</SelectItem>
                              <SelectItem value="General">General</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>Email Preview</Label>
                          <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                            <Eye className="h-3 w-3 mr-1" />
                            Preview in New Window
                          </Button>
                        </div>
                        <div className="border rounded-xl overflow-hidden">
                          <div className="bg-gray-100 p-2 text-sm border-b">
                            <div className="flex justify-between mb-1">
                              <div><span className="font-medium">From:</span> Security Team &lt;security@company.com&gt;</div>
                            </div>
                            <div className="mb-1"><span className="font-medium">To:</span> recipient@company.com</div>
                            <div className="mb-1"><span className="font-medium">Subject:</span> {newTemplate.subject || 'No Subject'}</div>
                          </div>
                          <div className="bg-white p-4 max-h-[400px] overflow-y-auto">
                            {newTemplate.content ? (
                              <div className="email-preview">
                                {newTemplate.content.split('\n').map((line, i) => {
                                  // Check if this line contains any of our tracking link texts
                                  const matchingLink = (newTemplate.trackingLinks || []).find(
                                    link => line.includes(link.displayText)
                                  );
                                  
                                  if (matchingLink) {
                                    const parts = line.split(matchingLink.displayText);
                                    return (
                                      <p key={i} className="mb-2">
                                        {parts[0]}
                                        <a 
                                          href="#" 
                                          className="text-blue-600 underline font-medium"
                                          onClick={(e) => e.preventDefault()}
                                        >
                                          {matchingLink.displayText}
                                        </a>
                                        {parts[1]}
                                      </p>
                                    );
                                  }
                                  
                                  return <p key={i} className="mb-2">{line}</p>;
                                })}
                                
                                {/* Render QR codes if any */}
                                {(newTemplate.qrCodes || []).length > 0 && (
                                  <div className="mt-4 pt-4 border-t">
                                    <p className="text-gray-700 mb-2">Scan the QR code below:</p>
                                    <div className="flex flex-wrap gap-4">
                                      {(newTemplate.qrCodes || []).map((qrCode, i) => (
                                        <div key={i} className="text-center">
                                          <div className="bg-white inline-block p-2 rounded-md shadow-sm border">
                                            <QRCodeSVG value={qrCode.url} size={100} />
                                          </div>
                                          <p className="text-sm mt-1">{qrCode.description}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="p-4 text-center text-gray-500 border border-dashed rounded-lg">
                                <Mail className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p>This template does not have any content yet.</p>
                                <p className="text-sm mt-1">Add content to see the preview here.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center">
                          <Button variant="outline" size="sm">
                            <FileInput className="h-4 w-4 mr-2" />
                            Import HTML
                          </Button>
                        </div>
                        
                        <div>
                          <Button variant="outline" className="mr-2" onClick={() => setShowTemplateEditor(false)}>
                            Cancel
                          </Button>
                          <Button 
                            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                            onClick={selectedTemplate ? handleUpdateTemplate : handleCreateTemplate}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            {selectedTemplate ? 'Update Template' : 'Create Template'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <>
                  {/* Templates list view */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <div className="relative w-64 mr-4">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input 
                            placeholder="Search templates" 
                            className="pl-10 rounded-xl"
                            value={templateSearchQuery}
                            onChange={(e) => setTemplateSearchQuery(e.target.value)}
                          />
                        </div>
                        <Select 
                          value={templateCategoryFilter}
                          onValueChange={(value) => setTemplateCategoryFilter(value)}
                        >
                          <SelectTrigger className="w-[180px] rounded-xl">
                            <SelectValue placeholder="Filter by category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {uniqueCategories
                              .filter(category => category !== 'all')
                              .map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button 
                        onClick={() => {
                          setSelectedTemplate(null);
                          setNewTemplate({
                            name: '',
                            subject: '',
                            content: '',
                            difficultyLevel: 'Medium',
                            category: 'General',
                            html: '',
                            trackingLinks: [
                              {
                                url: 'https://tracking.example.com/click?id=' + Date.now(),
                                displayText: 'Click Here',
                                trackingId: 'link-' + Date.now()
                              }
                            ],
                            qrCodes: []
                          });
                          setShowTemplateEditor(true);
                        }}
                        className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md hover:shadow-lg transition-all"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Template
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {templates.map(template => (
                        <Card key={template.id} className="overflow-hidden rounded-xl border-0 shadow-lg hover:shadow-xl transition-all">
                          <div className="p-6 border-b relative">
                            <div className="flex justify-between items-start">
                              <div>
                                <Badge 
                                  className={`mb-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    template.difficultyLevel === 'Easy' ? 'bg-green-100 text-green-800' :
                                    template.difficultyLevel === 'Medium' ? 'bg-amber-100 text-amber-800' :
                                    'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {template.difficultyLevel}
                                </Badge>
                                <h2 className="text-lg font-semibold">{template.name}</h2>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {template.subject}
                                </p>
                              </div>
                              <Badge variant="outline" className="ml-2">{template.category}</Badge>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-gradient-to-br from-gray-50 to-white">
                            <div className="flex items-center justify-between text-sm mb-4">
                              <div className="flex items-center">
                                <FileCheck className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span>Success Rate: {template.successRate || 0}%</span>
                              </div>
                              {template.lastUsed && (
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                  <span>Last Used: {template.lastUsed}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex justify-between gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleEditTemplate(template)}
                              >
                                <Edit className="h-3.5 w-3.5 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleDuplicateTemplate(template)}
                              >
                                <Copy className="h-3.5 w-3.5 mr-1" />
                                Duplicate
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteTemplate(template.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
            
            {/* Targeting Tab - Enhanced */}
            <TabsContent value="targeting" className="space-y-6">
              <Card className="p-6 rounded-xl border-0 shadow-lg overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Target Selection</h2>
                    <p className="text-sm text-muted-foreground">Choose users and groups to target with phishing campaigns</p>
                  </div>
                  
                  <Button 
                    onClick={handleConnectEntra}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                    disabled={isEntraConnected || isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : isEntraConnected ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Connected
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Connect to Microsoft Entra ID
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="mt-6 border-t pt-6">
                  <div className="flex gap-2 mb-6">
                    <Button
                      variant={targetingTab === 'groups' ? 'default' : 'outline'}
                      onClick={() => setTargetingTab('groups')}
                      className="rounded-xl"
                    >
                      <Group className="mr-2 h-4 w-4" />
                      Groups
                    </Button>
                    <Button
                      variant={targetingTab === 'users' ? 'default' : 'outline'}
                      onClick={() => setTargetingTab('users')}
                      className="rounded-xl"
                    >
                      <UserRound className="mr-2 h-4 w-4" />
                      Individual Users
                    </Button>
                  </div>
                  
                  {targetingTab === 'groups' ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input 
                            placeholder="Search groups by name or description" 
                            className="pl-10 rounded-xl"
                            value={groupSearchQuery}
                            onChange={(e) => setGroupSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="border rounded-xl overflow-hidden">
                        <div className="bg-gray-50 p-3 border-b grid grid-cols-12 gap-4 font-medium text-gray-500 text-sm">
                          <div className="col-span-1"></div>
                          <div className="col-span-3">Name</div>
                          <div className="col-span-4">Description</div>
                          <div className="col-span-2">Type</div>
                          <div className="col-span-2">Members</div>
                        </div>
                        
                        <div className="max-h-[400px] overflow-y-auto">
                          {filteredGroups.map(group => (
                            <div key={group.id} className="border-b last:border-none hover:bg-gray-50 transition-colors">
                              <div className="p-3 grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-1">
                                  <Checkbox 
                                    checked={selectedGroups.includes(group.id)}
                                    onCheckedChange={() => toggleGroupSelection(group.id)}
                                  />
                                </div>
                                <div className="col-span-3 font-medium">{group.name}</div>
                                <div className="col-span-4 text-sm text-gray-600">{group.description}</div>
                                <div className="col-span-2">
                                  <Badge variant="outline" className="capitalize text-xs">
                                    {group.type}
                                  </Badge>
                                </div>
                                <div className="col-span-2 text-sm">
                                  {group.memberCount} users
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {selectedGroups.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium text-blue-800">{selectedGroups.length} groups selected</span>
                              <p className="text-sm text-blue-600">Will target approximately {selectedGroups.reduce((total, groupId) => {
                                const group = sampleGroups.find(g => g.id === groupId);
                                return total + (group?.memberCount || 0);
                              }, 0)} users</p>
                            </div>
                            <Button variant="outline" size="sm" className="text-blue-700 border-blue-200">
                              Save as Target Group
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input 
                            placeholder="Search users by name, email or department" 
                            className="pl-10 rounded-xl"
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                          />
                        </div>
                        <Select 
                          value={riskFilterLevel}
                          onValueChange={(value) => setRiskFilterLevel(value)}
                        >
                          <SelectTrigger className="w-[180px] rounded-xl">
                            <SelectValue placeholder="Filter by risk score" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Risk Levels</SelectItem>
                            <SelectItem value="high">High Risk</SelectItem>
                            <SelectItem value="medium">Medium Risk</SelectItem>
                            <SelectItem value="low">Low Risk</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="border rounded-xl overflow-hidden">
                        <div className="bg-gray-50 p-3 border-b grid grid-cols-12 gap-4 font-medium text-gray-500 text-sm">
                          <div className="col-span-1"></div>
                          <div className="col-span-3">Name</div>
                          <div className="col-span-3">Email</div>
                          <div className="col-span-2">Department</div>
                          <div className="col-span-2">Location</div>
                          <div className="col-span-1">Risk</div>
                        </div>
                        
                        <div className="max-h-[400px] overflow-y-auto">
                          {filteredUsers.map(user => (
                            <div key={user.id} className="border-b last:border-none hover:bg-gray-50 transition-colors">
                              <div className="p-3 grid grid-cols-12 gap-4 items-center">
                                <div className="col-span-1">
                                  <Checkbox 
                                    checked={selectedUsers.includes(user.id)}
                                    onCheckedChange={() => toggleUserSelection(user.id)}
                                  />
                                </div>
                                <div className="col-span-3 font-medium">{user.name}</div>
                                <div className="col-span-3 text-sm">{user.email}</div>
                                <div className="col-span-2 text-sm">{user.department}</div>
                                <div className="col-span-2 text-sm">{user.location}</div>
                                <div className="col-span-1">
                                  <Badge className={
                                    user.riskScore && user.riskScore >= 70 ? 'bg-red-100 text-red-800' :
                                    user.riskScore && user.riskScore >= 30 ? 'bg-amber-100 text-amber-800' :
                                    'bg-green-100 text-green-800'
                                  }>
                                    {user.riskScore && user.riskScore >= 70 ? 'High' : 
                                     user.riskScore && user.riskScore >= 30 ? 'Med' : 'Low'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {selectedUsers.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium text-blue-800">{selectedUsers.length} users selected</span>
                            </div>
                            <Button variant="outline" size="sm" className="text-blue-700 border-blue-200">
                              Save as Target Group
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
            
            {/* Settings Tab - Enhanced */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="p-6 rounded-xl border-0 shadow-lg overflow-hidden">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-1">Campaign Settings</h2>
                  <p className="text-sm text-muted-foreground">Configure default settings for phishing campaigns</p>
                </div>
                
                <div className="mt-6 space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Schedule Settings */}
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Schedule Settings</h3>
                        <Switch 
                          checked={scheduleSettings.advancedOptions}
                          onCheckedChange={(checked) => 
                            setScheduleSettings({...scheduleSettings, advancedOptions: checked})
                          }
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
                            checked={scheduleSettings.businessHoursOnly}
                            onCheckedChange={(checked) => 
                              setScheduleSettings({...scheduleSettings, businessHoursOnly: checked})
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="excludeHolidays" className="cursor-pointer">Exclude Holidays</Label>
                            <p className="text-xs text-muted-foreground">Don't send phishing emails on holidays</p>
                          </div>
                          <Switch 
                            id="excludeHolidays"
                            checked={scheduleSettings.excludeHolidays}
                            onCheckedChange={(checked) => 
                              setScheduleSettings({...scheduleSettings, excludeHolidays: checked})
                            }
                          />
                        </div>
                      </div>
                      
                      {scheduleSettings.advancedOptions && (
                        <div className="space-y-4 border-t pt-4 mt-4">
                          <div>
                            <Label htmlFor="timezone">Timezone</Label>
                            <Select 
                              value={scheduleSettings.timezone}
                              onValueChange={(value) => 
                                setScheduleSettings({...scheduleSettings, timezone: value})
                              }
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
                                  variant={scheduleSettings.daysOfWeek.includes(day) ? "default" : "outline"}
                                  className="cursor-pointer"
                                  onClick={() => {
                                    if (scheduleSettings.daysOfWeek.includes(day)) {
                                      setScheduleSettings({
                                        ...scheduleSettings, 
                                        daysOfWeek: scheduleSettings.daysOfWeek.filter(d => d !== day)
                                      });
                                    } else {
                                      setScheduleSettings({
                                        ...scheduleSettings, 
                                        daysOfWeek: [...scheduleSettings.daysOfWeek, day]
                                      });
                                    }
                                  }}
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
                                  value={scheduleSettings.timeWindows[0].startTime}
                                  onChange={(e) => {
                                    const updatedWindows = [...scheduleSettings.timeWindows];
                                    updatedWindows[0] = {...updatedWindows[0], startTime: e.target.value};
                                    setScheduleSettings({...scheduleSettings, timeWindows: updatedWindows});
                                  }}
                                />
                              </div>
                              <div>
                                <Label htmlFor="endTime" className="text-xs text-muted-foreground">End Time</Label>
                                <Input 
                                  id="endTime" 
                                  type="time" 
                                  className="mt-1 rounded-xl"
                                  value={scheduleSettings.timeWindows[0].endTime}
                                  onChange={(e) => {
                                    const updatedWindows = [...scheduleSettings.timeWindows];
                                    updatedWindows[0] = {...updatedWindows[0], endTime: e.target.value};
                                    setScheduleSettings({...scheduleSettings, timeWindows: updatedWindows});
                                  }}
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
                              value={scheduleSettings.maxEmailsPerDay}
                              onChange={(e) => 
                                setScheduleSettings({
                                  ...scheduleSettings, 
                                  maxEmailsPerDay: parseInt(e.target.value) || 50
                                })
                              }
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="randomDelay" className="cursor-pointer">Random Delay Between Emails</Label>
                              <p className="text-xs text-muted-foreground">Adds realism by varying when emails are sent</p>
                            </div>
                            <Switch 
                              id="randomDelay"
                              checked={scheduleSettings.randomDelayBetweenEmails}
                              onCheckedChange={(checked) => 
                                setScheduleSettings({...scheduleSettings, randomDelayBetweenEmails: checked})
                              }
                            />
                          </div>
                          
                          {scheduleSettings.randomDelayBetweenEmails && (
                            <div>
                              <Label>Delay Range (minutes)</Label>
                              <div className="flex items-center gap-4 mt-2">
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="60" 
                                  className="rounded-xl"
                                  value={scheduleSettings.delayRange[0]}
                                  onChange={(e) => 
                                    setScheduleSettings({
                                      ...scheduleSettings, 
                                      delayRange: [parseInt(e.target.value) || 5, scheduleSettings.delayRange[1]]
                                    })
                                  }
                                />
                                <span>to</span>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="120" 
                                  className="rounded-xl"
                                  value={scheduleSettings.delayRange[1]}
                                  onChange={(e) => 
                                    setScheduleSettings({
                                      ...scheduleSettings, 
                                      delayRange: [scheduleSettings.delayRange[0], parseInt(e.target.value) || 30]
                                    })
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* API Configuration */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">Email API Configuration</h3>
                      <p className="text-sm text-muted-foreground">
                        Connect to an email service provider to send phishing simulation emails.
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="apiProvider">Email Provider</Label>
                          <Select value={emailProvider} onValueChange={setEmailProvider}>
                            <SelectTrigger id="apiProvider" className="mt-1 rounded-xl">
                              <SelectValue placeholder="Select email provider" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sendgrid">SendGrid</SelectItem>
                              <SelectItem value="mailchimp">Mailchimp</SelectItem>
                              <SelectItem value="mailgun">Mailgun</SelectItem>
                              <SelectItem value="amazon-ses">Amazon SES</SelectItem>
                              <SelectItem value="microsoft-graph">Microsoft Graph API</SelectItem>
                              <SelectItem value="custom">Custom SMTP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="apiKey">API Key / Connection String</Label>
                          <div className="mt-1 relative">
                            <Input 
                              id="apiKey" 
                              type="password" 
                              className="rounded-xl font-mono text-sm pr-16"
                              value={apiConfig.apiKey}
                              onChange={(e) => setApiConfig({...apiConfig, apiKey: e.target.value})}
                            />
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 text-xs"
                              onClick={() => setShowApiKey(!showApiKey)}
                            >
                              {showApiKey ? 'Hide' : 'Show'}
                            </Button>
                          </div>
                        </div>
                        
                        {emailProvider === 'custom' && (
                          <div className="space-y-4 border rounded-xl p-4">
                            <div>
                              <Label htmlFor="smtpHost">SMTP Host</Label>
                              <Input 
                                id="smtpHost" 
                                className="mt-1 rounded-xl"
                                value={apiConfig.smtpHost || ''}
                                onChange={(e) => setApiConfig({...apiConfig, smtpHost: e.target.value})}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="smtpPort">SMTP Port</Label>
                              <Input 
                                id="smtpPort" 
                                type="number" 
                                className="mt-1 rounded-xl"
                                value={apiConfig.smtpPort || 587}
                                onChange={(e) => setApiConfig({...apiConfig, smtpPort: parseInt(e.target.value) || 587})}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label htmlFor="useTLS" className="cursor-pointer">Use TLS</Label>
                              </div>
                              <Switch 
                                id="useTLS"
                                checked={apiConfig.useTLS || false}
                                onCheckedChange={(checked) => 
                                  setApiConfig({...apiConfig, useTLS: checked})
                                }
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="smtpUsername">Username</Label>
                              <Input 
                                id="smtpUsername" 
                                className="mt-1 rounded-xl"
                                value={apiConfig.username || ''}
                                onChange={(e) => setApiConfig({...apiConfig, username: e.target.value})}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="smtpPassword">Password</Label>
                              <Input 
                                id="smtpPassword" 
                                type="password" 
                                className="mt-1 rounded-xl"
                                value={apiConfig.password || ''}
                                onChange={(e) => setApiConfig({...apiConfig, password: e.target.value})}
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                            Connection Status: OK
                          </Button>
                          
                          <Button 
                            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                            onClick={() => setApiConfig({...apiConfig, saved: true})}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Save API Configuration
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Configuration Settings */}
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-medium mb-4">AI Template Generator Settings</h3>
                    
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Configure your Gemini API key to enable AI-powered phishing template generation
                      </p>

                      <div>
                        <Label htmlFor="geminiApiKey">Gemini API Key</Label>
                        <div className="mt-1 relative">
                          <Input 
                            id="geminiApiKey" 
                            type={showApiKey ? "text" : "password"}
                            className="rounded-xl font-mono text-sm pr-16"
                            value={aiConfig.apiKey}
                            onChange={(e) => setAIConfig({...aiConfig, apiKey: e.target.value})}
                            placeholder="Enter your Gemini API key"
                          />
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 text-xs"
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? 'Hide' : 'Show'}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Get a Gemini API key from <a href="https://makersuite.google.com/app/apikey" className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">Google AI Studio</a>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Notification Settings */}
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
                  
                  <div className="flex justify-end">
                    <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
                      <Save className="mr-2 h-4 w-4" />
                      Save All Settings
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PhishingSimulationManager; 