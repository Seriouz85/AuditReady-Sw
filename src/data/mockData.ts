import { Standard, Requirement, Assessment, ComplianceStats, Tag, InternalUser, Supplier, Application, Notification } from '@/types';

// Mock Tags
export const tags: Tag[] = [
  // Type category tags - Industry Standard Categories
  {
    id: 'tag-organizational',
    name: 'Organizational',
    color: '#10B981', // Green
    description: 'Policies, governance, management controls and organizational oversight',
    category: 'type'
  },
  {
    id: 'tag-identity',
    name: 'Identity',
    color: '#A21CAF', // Purple
    description: 'Identity and access management, authentication, authorization',
    category: 'type'
  },
  {
    id: 'tag-endpoint',
    name: 'Endpoint',
    color: '#3B82F6', // Blue
    description: 'Endpoint protection, device security, and endpoint controls',
    category: 'type'
  },
  {
    id: 'tag-assets',
    name: 'Assets',
    color: '#F59E0B', // Amber
    description: 'Asset management, inventory, and configuration management',
    category: 'type'
  },
  {
    id: 'tag-awareness',
    name: 'Awareness',
    color: '#F59E42', // Orange
    description: 'Training, awareness, security culture, and human factors',
    category: 'type'
  },
  {
    id: 'tag-network',
    name: 'Network',
    color: '#8B5CF6', // Purple
    description: 'Network security, infrastructure protection, and communications',
    category: 'type'
  },
  {
    id: 'tag-physical',
    name: 'Physical',
    color: '#059669', // Emerald
    description: 'Physical security controls, facilities, and environmental protection',
    category: 'type'
  },
  {
    id: 'tag-data-management',
    name: 'Data Management',
    color: '#06B6D4', // Cyan
    description: 'Data protection, classification, handling, backup, and recovery',
    category: 'type'
  },
  // Applies-to category tags - Target Systems and Entities
  {
    id: 'tag-application',
    name: 'Application',
    color: '#0EA5E9', // Sky
    description: 'Applies to software applications',
    category: 'applies-to'
  },
  {
    id: 'tag-device',
    name: 'Device',
    color: '#8B5CF6', // Purple
    description: 'Applies to hardware devices',
    category: 'applies-to'
  },
  {
    id: 'tag-organization',
    name: 'Organization',
    color: '#F59E0B', // Amber
    description: 'Applies to the organization as a whole',
    category: 'applies-to'
  },
  {
    id: 'tag-location',
    name: 'Location',
    color: '#10B981', // Green
    description: 'Applies to physical locations',
    category: 'applies-to'
  },
  
  // Device subtags
  {
    id: 'tag-client',
    name: 'Client',
    color: '#8B5CF6', // Purple (lighter)
    description: 'Client devices (computers, laptops, mobile devices)',
    category: 'applies-to',
    parentId: 'tag-device'
  },
  {
    id: 'tag-network-device',
    name: 'Network Device',
    color: '#8B5CF6', // Purple (lighter)
    description: 'Network infrastructure devices (routers, switches, firewalls)',
    category: 'applies-to',
    parentId: 'tag-device'
  },
  {
    id: 'tag-server',
    name: 'Server',
    color: '#8B5CF6', // Purple (lighter)
    description: 'Server hardware and infrastructure',
    category: 'applies-to',
    parentId: 'tag-device'
  }
];

// Mock Standards
// Standards are now loaded from the database via StandardsService
// Demo account will load the same standards from database as regular accounts
export const standards: Standard[] = [];

// Requirements are now loaded from the database via RequirementsService
// Demo account will load the same requirements from database as regular accounts
export const requirements: Requirement[] = [];

// Mock Assessments
export const assessments: Assessment[] = [
  {
    id: 'assessment-1',
    name: 'TechCorp Global - ISO 27001 Annual Certification Review',
    standardIds: ['55742f4e-769b-4efe-912c-1371de5e1cd6'], // Real database UUID for ISO/IEC 27001
    description: 'Annual comprehensive review of ISO 27001 ISMS implementation across 12 global offices and cloud infrastructure.',
    status: 'in-progress',
    progress: 72,
    startDate: '2024-02-15T09:00:00Z',
    assessorName: 'Michael Thompson',
    assessorId: 'user-1',
    notes: `🎯 **TechCorp Global ISO 27001 Assessment Overview:**
Annual certification review covering 114 ISO 27001 controls across TechCorp's global infrastructure including 12 offices, 3 data centers, and hybrid cloud environment. Assessment validates ISMS effectiveness and prepares for external certification audit.

📋 **Progress Summary (72% Complete):**
• Information Security Controls: 95% compliance (110 of 114 controls assessed)
• Risk Management: Completed - 127 risks identified and treated
• Business Continuity: 85% complete - testing scheduled for next week
• Supplier Security: 78% complete - 43 critical vendors assessed

🔍 **Key Achievements:**
• Zero critical security incidents in 2024
• 94% completion rate for mandatory security training (2,847 employees)
• Successful implementation of Zero Trust architecture
• Enhanced cloud security posture across AWS and Azure environments

⚡ **Final Phase Activities:**
Completing physical security assessments at London and Singapore offices. Management review scheduled for next Friday. Target certification date: April 30, 2024.`,
    evidence: `📁 **Documentation Reviewed:**
• Information Security Policy v3.2 and 12 supporting policies
• Risk Assessment Report (Q4 2023) with 127 identified risks
• Vulnerability Assessment Report (January 2024) - 47 pages
• Penetration Test Results (Q4 2023) - RedTeam Security Ltd.
• Business Continuity Plan v2.1 (updated December 2023)
• Incident Response Playbook v4.3 (62 pages, last updated Q3 2023)
• Security Awareness Training Records (2023-2024)
• Vendor Security Assessment Questionnaires (15 critical suppliers)

📎 **Attached Evidence Files:**
• ISO27001_Risk_Register_2024.xlsx (updated 2024-02-20, 15.2 MB)
• Security_Incident_Log_2023.pdf (annual summary, 8.4 MB)
• Penetration_Test_Report_Q4_2023.pdf (confidential, 12.1 MB)
• ISMS_Audit_Findings_2023.docx (internal audit, 3.7 MB)
• Security_Training_Completion_Matrix.xlsx (HR records, 2.1 MB)
• Incident Response Plan and 15 incident reports from 2023
• Security Awareness Training records (287 employees, 87% completion)
• Vendor Security Assessment results (43 vendors evaluated)

🔐 **Technical Evidence:**
• SIEM logs analysis covering 6 months (Jan-Jun 2024)
• Vulnerability scan results from Qualys (monthly scans)
• Access control reviews covering 2,847 user accounts
• Backup and recovery test results (last performed March 2024)
• Security tool configurations (Firewall, IDS/IPS, EDR)

🏢 **Physical Security:**
• Badge access logs and physical security assessment
• Data center environmental controls documentation
• Secure disposal certificates for 23 decommissioned assets
• Visitor log reviews and clean desk policy compliance checks

📊 **Compliance Evidence:**
• Internal audit reports (Q1 2024) from Ernst & Young
• Third-party security assessments (SOC 2 Type II report)
• Penetration testing results (conducted February 2024)
• Security metrics dashboard showing KPI trends
• Management review meeting minutes (quarterly reviews)`,
    methods: ['Document Review', 'Interviews', 'Observation', 'Data Analysis & Statistics', 'Process Walkthrough'],
    updatedAt: '2024-03-28T14:30:00Z',
    createdAt: '2024-02-15T09:00:00Z',
    isRecurring: true,
    recurrenceSettings: {
      frequency: 'yearly',
      interval: 1,
      skipWeekends: true,
      startDate: '2024-02-15T09:00:00Z'
    },
    nextDueDate: '2025-02-15T09:00:00Z'
  }
];

// Mock Organizations
// Organizations are now loaded from the database via OrganizationsService
// Demo account uses the same organizations from database as regular accounts
export const organizations = [];

// Mock Users
// Users are now loaded from the database via UsersService  
// Demo account uses the same users from database as regular accounts
export const users = [];

// Mock Compliance Stats
export const complianceStats: ComplianceStats = {
  totalStandards: 0,
  totalRequirements: 0,
  totalAssessments: 0,
  complianceScore: 0,
  requirementStatusCounts: {
    fulfilled: 0,
    partiallyFulfilled: 0,
    notFulfilled: 0,
    notApplicable: 0
  }
};

// Mock Internal Users
export const internalUsers: InternalUser[] = [];

// Mock Suppliers
export const suppliers: Supplier[] = [];

// Mock Applications
export const applications: Application[] = [];

// Mock Notifications
export const notifications: Notification[] = [];

// Mock Dashboard Stats
export const dashboardStats = {
  totalRequirements: 0,
  fulfilledRequirements: 0,
  compliancePercentage: 0,
  assessmentsInProgress: 0,
  recentActivity: []
};

// All other mock data arrays are now loaded from database
// Demo account uses the same data as regular accounts for consistency