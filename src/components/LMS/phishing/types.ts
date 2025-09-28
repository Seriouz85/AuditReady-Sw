export interface PhishingTemplate {
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

export interface Campaign {
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

export interface UserData {
  id: string;
  name: string;
  email: string;
  department: string;
  title: string;
  location: string;
  manager?: string;
  riskScore?: number;
}

export interface GroupData {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  type: 'security' | 'distribution' | 'microsoft-365' | 'custom';
}

export interface ScheduleSettings {
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

export interface AIConfig {
  enabled: boolean;
  apiKey: string;
  generating: boolean;
  prompt: string;
  error: string | null;
}

// Sample data for demo purposes
export const sampleTemplates: PhishingTemplate[] = [
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

export const sampleCampaigns: Campaign[] = [
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

export const sampleUsers: UserData[] = [
  { id: 'u1', name: 'John Smith', email: 'john.smith@company.com', department: 'IT', title: 'Systems Administrator', location: 'New York', riskScore: 15 },
  { id: 'u2', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', department: 'Finance', title: 'Financial Analyst', location: 'Chicago', riskScore: 75 },
  { id: 'u3', name: 'Michael Brown', email: 'michael.brown@company.com', department: 'Executive', title: 'CEO', location: 'New York', riskScore: 92 },
  { id: 'u4', name: 'Emily Davis', email: 'emily.davis@company.com', department: 'HR', title: 'HR Manager', location: 'Boston', riskScore: 45 },
  { id: 'u5', name: 'Robert Wilson', email: 'robert.wilson@company.com', department: 'Sales', title: 'Sales Representative', location: 'Los Angeles', riskScore: 62 },
  { id: 'u6', name: 'Jennifer Lee', email: 'jennifer.lee@company.com', department: 'Marketing', title: 'Marketing Specialist', location: 'San Francisco', riskScore: 38 },
  { id: 'u7', name: 'David Martinez', email: 'david.martinez@company.com', department: 'IT', title: 'Network Engineer', location: 'Chicago', riskScore: 27 },
  { id: 'u8', name: 'Lisa Anderson', email: 'lisa.anderson@company.com', department: 'Finance', title: 'Accountant', location: 'New York', riskScore: 53 }
];

export const sampleGroups: GroupData[] = [
  { id: 'g1', name: 'IT Department', description: 'All IT department members', memberCount: 42, type: 'security' },
  { id: 'g2', name: 'Finance Team', description: 'Finance department staff', memberCount: 18, type: 'distribution' },
  { id: 'g3', name: 'Executive Leadership', description: 'Executive team members', memberCount: 8, type: 'security' },
  { id: 'g4', name: 'Sales Representatives', description: 'Sales team members', memberCount: 35, type: 'microsoft-365' },
  { id: 'g5', name: 'Marketing Department', description: 'Marketing staff', memberCount: 15, type: 'distribution' },
  { id: 'g6', name: 'HR Team', description: 'Human Resources department', memberCount: 12, type: 'microsoft-365' },
  { id: 'g7', name: 'New York Office', description: 'All employees in NY office', memberCount: 78, type: 'custom' },
  { id: 'g8', name: 'Admins', description: 'System administrators', memberCount: 6, type: 'security' }
];