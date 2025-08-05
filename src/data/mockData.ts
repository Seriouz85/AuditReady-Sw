import { Standard, Requirement, Assessment, ComplianceStats, Tag, InternalUser, Supplier, Application, Notification } from '@/types';
import { EnhancedApplication } from '@/types/applications';

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
  },
  {
    id: 'assessment-2',
    name: 'SOC 2 Type II Annual Assessment',
    standardIds: ['soc-2-type-ii'], 
    description: 'Annual SOC 2 Type II assessment covering security, availability, and confidentiality controls.',
    status: 'completed',
    progress: 100,
    startDate: '2024-01-10T08:00:00Z',
    endDate: '2024-03-15T17:00:00Z',
    assessorName: 'Sarah Johnson',
    assessorId: 'user-2',
    notes: 'Successfully completed SOC 2 Type II assessment with no significant findings. All controls operating effectively.',
    evidence: 'Control testing documentation, system walkthroughs, and compliance evidence collected.',
    methods: ['Document Review', 'Interviews', 'Control Testing'],
    updatedAt: '2024-03-15T17:00:00Z',
    createdAt: '2024-01-10T08:00:00Z',
    isRecurring: true,
    recurrenceSettings: {
      frequency: 'yearly',
      interval: 1,
      skipWeekends: true,
      startDate: '2024-01-10T08:00:00Z'
    },
    nextDueDate: '2025-01-10T08:00:00Z'
  },
  {
    id: 'assessment-3',
    name: 'GDPR Compliance Review - Q1 2024',
    standardIds: ['gdpr-2018'], 
    description: 'Quarterly GDPR compliance review focusing on data processing activities and privacy controls.',
    status: 'in-progress',
    progress: 45,
    startDate: '2024-03-01T09:00:00Z',
    assessorName: 'Elena Rodriguez',
    assessorId: 'user-3',
    notes: 'Reviewing data processing activities and privacy impact assessments. Found some gaps in consent management.',
    evidence: 'Privacy policy documentation, data mapping records, consent logs.',
    methods: ['Document Review', 'Data Analysis & Statistics', 'Process Walkthrough'],
    updatedAt: '2024-03-20T15:30:00Z',
    createdAt: '2024-03-01T09:00:00Z',
    isRecurring: true,
    recurrenceSettings: {
      frequency: 'quarterly',
      interval: 1,
      skipWeekends: true,
      startDate: '2024-03-01T09:00:00Z'
    },
    nextDueDate: '2024-06-01T09:00:00Z'
  },
  {
    id: 'assessment-4',
    name: 'CIS Controls Implementation Assessment',
    standardIds: ['cis-controls-v8'], 
    description: 'Comprehensive assessment of CIS Controls v8 implementation across IT infrastructure.',
    status: 'draft',
    progress: 15,
    startDate: '2024-03-25T10:00:00Z',
    assessorName: 'David Park',
    assessorId: 'user-4',
    notes: 'Initial planning phase. Gathering asset inventory and security tool configurations.',
    evidence: 'Asset inventory, security tool configurations, policy documentation.',
    methods: ['Document Review', 'Technical Testing', 'Interviews'],
    updatedAt: '2024-03-25T10:00:00Z',
    createdAt: '2024-03-25T10:00:00Z',
    isRecurring: false
  },
  {
    id: 'assessment-5',
    name: 'NIST Cybersecurity Framework Assessment',
    standardIds: ['nist-csf-2.0'], 
    description: 'Annual NIST CSF 2.0 maturity assessment evaluating current cybersecurity posture.',
    status: 'completed',
    progress: 100,
    startDate: '2023-11-01T08:30:00Z',
    endDate: '2024-01-31T16:00:00Z',
    assessorName: 'Jennifer Wilson',
    assessorId: 'user-5',
    notes: 'Completed NIST CSF assessment with overall maturity score of 3.2/5.0. Recommendations provided for improvement.',
    evidence: 'Maturity assessment questionnaires, gap analysis reports, improvement roadmap.',
    methods: ['Document Review', 'Interviews', 'Maturity Assessment', 'Gap Analysis'],
    updatedAt: '2024-01-31T16:00:00Z',
    createdAt: '2023-11-01T08:30:00Z',
    isRecurring: true,
    recurrenceSettings: {
      frequency: 'yearly',
      interval: 1,
      skipWeekends: true,
      startDate: '2023-11-01T08:30:00Z'
    },
    nextDueDate: '2024-11-01T08:30:00Z'
  },
  {
    id: 'assessment-6',
    name: 'NIS2 Directive Readiness Assessment',
    standardIds: ['nis2-directive'], 
    description: 'Preparatory assessment for NIS2 Directive compliance covering essential services.',
    status: 'in-progress',
    progress: 28,
    startDate: '2024-02-20T09:15:00Z',
    assessorName: 'Thomas Anderson',
    assessorId: 'user-6',
    notes: 'Assessing current state against NIS2 requirements. Focus on incident reporting and supply chain security.',
    evidence: 'Incident response procedures, supply chain documentation, network security assessments.',
    methods: ['Document Review', 'Gap Analysis', 'Process Walkthrough', 'Technical Assessment'],
    updatedAt: '2024-03-22T11:45:00Z',
    createdAt: '2024-02-20T09:15:00Z',
    isRecurring: false
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
export const internalUsers: InternalUser[] = [
  {
    id: 'internal-user-1',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@democorp.com',
    department: 'Information Security',
    title: 'Chief Information Security Officer'
  },
  {
    id: 'internal-user-2',
    name: 'Michael Chen',
    email: 'michael.chen@democorp.com',
    department: 'IT Operations',
    title: 'IT Director'
  },
  {
    id: 'internal-user-3',
    name: 'Elena Rodriguez',
    email: 'elena.rodriguez@democorp.com',
    department: 'Compliance',
    title: 'Compliance Manager'
  },
  {
    id: 'internal-user-4',
    name: 'David Park',
    email: 'david.park@democorp.com',
    department: 'Procurement',
    title: 'Vendor Management Specialist'
  },
  {
    id: 'internal-user-5',
    name: 'Jennifer Harrison',
    email: 'jennifer.harrison@democorp.com',
    department: 'Enterprise Architecture',
    title: 'Principal Solutions Architect'
  },
  {
    id: 'internal-user-6',
    name: 'Robert Kumar',
    email: 'robert.kumar@democorp.com',
    department: 'Database Administration',
    title: 'Senior Database Administrator'
  },
  {
    id: 'internal-user-7',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@democorp.com',
    department: 'DevOps',
    title: 'DevOps Engineering Manager'
  },
  {
    id: 'internal-user-8',
    name: 'Marcus Williams',
    email: 'marcus.williams@democorp.com',
    department: 'Finance',
    title: 'Finance Systems Manager'
  },
  {
    id: 'internal-user-9',
    name: 'Amanda Foster',
    email: 'amanda.foster@democorp.com',
    department: 'Human Resources',
    title: 'HR Technology Director'
  },
  {
    id: 'internal-user-10',
    name: 'Daniel Lee',
    email: 'daniel.lee@democorp.com',
    department: 'Customer Success',
    title: 'Customer Platform Manager'
  },
  {
    id: 'internal-user-11',
    name: 'Rachel Green',
    email: 'rachel.green@democorp.com',
    department: 'Cloud Engineering',
    title: 'Cloud Infrastructure Architect'
  },
  {
    id: 'internal-user-12',
    name: 'Kevin Zhang',
    email: 'kevin.zhang@democorp.com',
    department: 'Mobile Development',
    title: 'Mobile Engineering Lead'
  }
];

// Mock Suppliers
export const suppliers: Supplier[] = [
  {
    id: 'supplier-1',
    name: 'CloudSecure Solutions',
    organizationNumber: 'ORG-556789123',
    address: '1234 Enterprise Blvd, Seattle, WA 98101',
    website: 'https://cloudsecure.example.com',
    category: 'Cloud Security',
    status: 'active',
    contact: {
      name: 'Jennifer Adams',
      email: 'jennifer.adams@cloudsecure.example.com',
      phone: '+1-206-555-0198',
      title: 'Compliance Director'
    },
    internalResponsible: {
      id: 'internal-user-1',
      name: 'Sarah Mitchell',
      email: 'sarah.mitchell@democorp.com',
      department: 'Information Security'
    },
    associatedStandards: [
      {
        standardId: 'iso-27001',
        requirementIds: ['iso-27001-A.8.1.1', 'iso-27001-A.8.1.2', 'iso-27001-A.13.1.1'],
        sentDate: '2024-12-15T10:00:00Z',
        status: 'completed'
      },
      {
        standardId: 'soc-2',
        requirementIds: ['soc-2-CC6.1', 'soc-2-CC6.2'],
        sentDate: '2024-12-20T14:30:00Z',
        status: 'in-progress'
      }
    ],
    createdAt: '2024-11-01T09:00:00Z',
    updatedAt: '2024-12-20T16:45:00Z'
  },
  {
    id: 'supplier-2',
    name: 'DataGuard Analytics',
    organizationNumber: 'ORG-445678901',
    address: '5678 Tech Park Dr, Austin, TX 73301',
    website: 'https://dataguard.example.com',
    category: 'Data Analytics',
    status: 'active',
    contact: {
      name: 'Robert Kim',
      email: 'robert.kim@dataguard.example.com',
      phone: '+1-512-555-0287',
      title: 'Security Operations Manager'
    },
    internalResponsible: {
      id: 'internal-user-3',
      name: 'Elena Rodriguez',
      email: 'elena.rodriguez@democorp.com',
      department: 'Compliance'
    },
    associatedStandards: [
      {
        standardId: 'iso-27001',
        requirementIds: ['iso-27001-A.12.1.1', 'iso-27001-A.12.6.1', 'iso-27001-A.18.1.4'],
        sentDate: '2024-12-10T08:15:00Z',
        status: 'completed'
      }
    ],
    createdAt: '2024-10-15T14:20:00Z',
    updatedAt: '2024-12-18T11:00:00Z'
  },
  {
    id: 'supplier-3',
    name: 'SecureComm Networks',
    organizationNumber: 'ORG-334567890',
    address: '910 Innovation Way, Boston, MA 02101',
    website: 'https://securecomm.example.com',
    category: 'Network Infrastructure',
    status: 'pending-review',
    contact: {
      name: 'Amanda Foster',
      email: 'amanda.foster@securecomm.example.com',
      phone: '+1-617-555-0376',
      title: 'Chief Technology Officer'
    },
    internalResponsible: {
      id: 'internal-user-2',
      name: 'Michael Chen',
      email: 'michael.chen@democorp.com',
      department: 'IT Operations'
    },
    associatedStandards: [
      {
        standardId: 'iso-27001',
        requirementIds: ['iso-27001-A.13.1.1', 'iso-27001-A.13.2.1'],
        status: 'draft'
      }
    ],
    createdAt: '2024-12-01T16:30:00Z',
    updatedAt: '2024-12-22T09:15:00Z'
  }
];

// Enhanced Applications - Comprehensive Demo Data
export const enhancedApplications: EnhancedApplication[] = [
  // MANUAL APPLICATIONS - Traditional manually managed applications
  {
    id: 'app-manual-1',
    name: 'Legacy HR Management System',
    description: 'Core HR system managing employee records, payroll, and benefits administration for 2,800+ employees across 12 global offices',
    organizationNumber: 'APP-HR-001',
    type: 'Enterprise Application',
    category: 'Human Resources',
    status: 'active',
    criticality: 'critical',
    syncMode: 'manual',
    contact: {
      name: 'Patricia Williams',
      email: 'patricia.williams@democorp.com',
      phone: '+1-555-0156',
      title: 'HR Systems Manager'
    },
    internalResponsible: {
      id: 'internal-user-9',
      name: 'Amanda Foster',
      email: 'amanda.foster@democorp.com',
      department: 'Human Resources'
    },
    requirementFulfillments: [
      {
        id: 'rf-manual-1-1',
        requirementId: 'iso-27001-A.9.1.1',
        applicationId: 'app-manual-1',
        status: 'fulfilled',
        isAutoAnswered: false,
        evidence: 'Role-based access control implemented with quarterly access reviews. Last review completed March 2024.',
        justification: 'Comprehensive RBAC system with segregation of duties for sensitive HR functions.',
        responsibleParty: 'Amanda Foster',
        lastAssessmentDate: '2024-03-15T10:00:00Z',
        lastModifiedBy: 'Elena Rodriguez',
        lastModifiedAt: '2024-03-15T14:30:00Z',
        isManualOverride: false,
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-03-15T14:30:00Z'
      },
      {
        id: 'rf-manual-1-2',
        requirementId: 'iso-27001-A.18.1.4',
        applicationId: 'app-manual-1',
        status: 'partially_fulfilled',
        isAutoAnswered: false,
        evidence: 'Privacy impact assessment completed in 2023. Annual update scheduled for Q2 2024.',
        justification: 'Core privacy controls in place, minor updates needed for new features.',
        responsibleParty: 'Amanda Foster',
        lastAssessmentDate: '2024-02-20T10:00:00Z',
        lastModifiedBy: 'Elena Rodriguez',
        lastModifiedAt: '2024-02-20T15:45:00Z',
        isManualOverride: false,
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-02-20T15:45:00Z'
      }
    ],
    associatedRequirements: ['iso-27001-A.9.1.1', 'iso-27001-A.18.1.4', 'iso-27001-A.12.1.1'],
    lastReviewDate: '2024-03-15T10:00:00Z',
    nextReviewDate: '2024-09-15T10:00:00Z',
    complianceScore: 85,
    createdAt: '2023-06-15T10:00:00Z',
    updatedAt: '2024-03-15T14:30:00Z'
  },
  {
    id: 'app-manual-2',
    name: 'Customer Support Portal',
    description: 'Customer-facing support portal with ticketing system, knowledge base, and live chat functionality serving 15,000+ active customers',
    organizationNumber: 'APP-CS-001',
    type: 'Web Application',
    category: 'Customer Service',
    status: 'active',
    criticality: 'high',
    syncMode: 'manual',
    contact: {
      name: 'Thomas Rodriguez',
      email: 'thomas.rodriguez@democorp.com',
      phone: '+1-555-0189',
      title: 'Customer Success Engineering Lead'
    },
    internalResponsible: {
      id: 'internal-user-10',
      name: 'Daniel Lee',
      email: 'daniel.lee@democorp.com',
      department: 'Customer Success'
    },
    requirementFulfillments: [
      {
        id: 'rf-manual-2-1',
        requirementId: 'iso-27001-A.14.1.3',
        applicationId: 'app-manual-2',
        status: 'fulfilled',
        isAutoAnswered: false,
        evidence: 'Secure development lifecycle implemented with code reviews, security testing, and vulnerability scanning.',
        justification: 'Comprehensive secure development practices following OWASP guidelines.',
        responsibleParty: 'Daniel Lee',
        lastAssessmentDate: '2024-03-10T14:00:00Z',
        lastModifiedBy: 'Sarah Mitchell',
        lastModifiedAt: '2024-03-10T16:20:00Z',
        isManualOverride: false,
        createdAt: '2024-01-20T09:00:00Z',
        updatedAt: '2024-03-10T16:20:00Z'
      }
    ],
    associatedRequirements: ['iso-27001-A.14.1.3', 'iso-27001-A.13.1.1', 'iso-27001-A.8.1.1'],
    lastReviewDate: '2024-03-10T14:00:00Z',
    nextReviewDate: '2024-09-10T14:00:00Z',
    complianceScore: 92,
    createdAt: '2023-08-20T10:00:00Z',
    updatedAt: '2024-03-10T16:20:00Z'
  },
  {
    id: 'app-manual-3',
    name: 'Manufacturing Execution System',
    description: 'Real-time manufacturing execution system controlling production lines, quality control, and inventory tracking across 4 manufacturing facilities',
    organizationNumber: 'APP-MFG-001',
    type: 'Industrial Control System',
    category: 'Manufacturing',
    status: 'active',
    criticality: 'critical',
    syncMode: 'manual',
    contact: {
      name: 'William Chang',
      email: 'william.chang@democorp.com',
      phone: '+1-555-0267',
      title: 'Manufacturing IT Director'
    },
    internalResponsible: {
      id: 'internal-user-2',
      name: 'Michael Chen',
      email: 'michael.chen@democorp.com',
      department: 'IT Operations'
    },
    requirementFulfillments: [
      {
        id: 'rf-manual-3-1',
        requirementId: 'iso-27001-A.11.2.1',
        applicationId: 'app-manual-3',
        status: 'fulfilled',
        isAutoAnswered: false,
        evidence: 'Equipment maintenance procedures documented and followed. Regular maintenance logs maintained.',
        justification: 'Comprehensive maintenance program with predictive maintenance capabilities.',
        responsibleParty: 'Michael Chen',
        lastAssessmentDate: '2024-02-28T10:00:00Z',
        lastModifiedBy: 'Michael Chen',
        lastModifiedAt: '2024-02-28T14:30:00Z',
        isManualOverride: false,
        createdAt: '2024-01-10T09:00:00Z',
        updatedAt: '2024-02-28T14:30:00Z'
      }
    ],
    associatedRequirements: ['iso-27001-A.11.2.1', 'iso-27001-A.13.1.1', 'iso-27001-A.12.1.2'],
    lastReviewDate: '2024-02-28T10:00:00Z',
    nextReviewDate: '2024-08-28T10:00:00Z',
    complianceScore: 88,
    createdAt: '2023-05-10T10:00:00Z',
    updatedAt: '2024-02-28T14:30:00Z'
  },

  // AZURE-SYNCED APPLICATIONS - Modern cloud applications with auto-answered requirements
  {
    id: 'app-azure-1',
    name: 'Customer Data Platform',
    description: 'Azure-hosted customer analytics platform with real-time data processing, machine learning insights, and comprehensive customer 360-degree view',
    organizationNumber: 'APP-CDP-001',
    type: 'Cloud Application',
    category: 'Analytics & Data',
    status: 'active',
    criticality: 'high',
    syncMode: 'azure',
    azureSyncMetadata: {
      lastSyncDate: '2024-03-25T08:30:00Z',
      syncVersion: '2.1.3',
      azureResourceId: '/subscriptions/12345678-1234-1234-1234-123456789abc/resourceGroups/production-rg/providers/Microsoft.Web/sites/customer-data-platform',
      azureSubscriptionId: '12345678-1234-1234-1234-123456789abc',
      azureResourceGroup: 'production-rg',
      syncStatus: 'synced',
      dataSource: 'Azure Security Center, Azure Policy',
      lastSuccessfulSync: '2024-03-25T08:30:00Z',
      syncFrequency: 'daily',
      autoAnsweredRequirements: 12,
      manualOverrides: 2
    },
    contact: {
      name: 'Emily Watson',
      email: 'emily.watson@democorp.com',
      phone: '+1-555-0298',
      title: 'Data Platform Product Owner'
    },
    internalResponsible: {
      id: 'internal-user-11',
      name: 'Rachel Green',
      email: 'rachel.green@democorp.com',
      department: 'Cloud Engineering'
    },
    requirementFulfillments: [
      {
        id: 'rf-azure-1-1',
        requirementId: 'iso-27001-A.8.11',
        applicationId: 'app-azure-1',
        status: 'fulfilled',
        isAutoAnswered: true,
        confidenceLevel: 'high',
        autoAnswerSource: 'Azure Security Center',
        evidence: 'Azure Security Center validates encryption at rest for all storage accounts. AES-256 encryption enabled for all data stores with customer-managed keys.',
        justification: 'Azure native encryption at rest implemented across all storage tiers with advanced key management.',
        responsibleParty: 'Rachel Green',
        lastAssessmentDate: '2024-03-25T08:30:00Z',
        lastModifiedBy: 'Azure Sync Service',
        lastModifiedAt: '2024-03-25T08:30:00Z',
        isManualOverride: false,
        createdAt: '2024-02-01T10:00:00Z',
        updatedAt: '2024-03-25T08:30:00Z'
      },
      {
        id: 'rf-azure-1-2',
        requirementId: 'iso-27001-A.8.12',
        applicationId: 'app-azure-1',
        status: 'fulfilled',
        isAutoAnswered: true,
        confidenceLevel: 'high',
        autoAnswerSource: 'Azure Policy',
        evidence: 'Azure Policy enforces TLS 1.2+ for all data in transit. Application Gateway with WAF and private endpoints configured.',
        justification: 'Comprehensive encryption in transit using Azure managed services with policy enforcement.',
        responsibleParty: 'Rachel Green',
        lastAssessmentDate: '2024-03-25T08:30:00Z',
        lastModifiedBy: 'Azure Sync Service',
        lastModifiedAt: '2024-03-25T08:30:00Z',
        isManualOverride: false,
        createdAt: '2024-02-01T10:00:00Z',
        updatedAt: '2024-03-25T08:30:00Z'
      },
      {
        id: 'rf-azure-1-3',
        requirementId: 'iso-27001-A.9.1.2',
        applicationId: 'app-azure-1',
        status: 'fulfilled',
        isAutoAnswered: true,
        confidenceLevel: 'medium',
        autoAnswerSource: 'Azure Active Directory',
        evidence: 'Azure AD integration with conditional access policies, MFA enforcement, and privileged identity management.',
        justification: 'Enterprise-grade identity management with advanced security features.',
        responsibleParty: 'Rachel Green',
        lastAssessmentDate: '2024-03-25T08:30:00Z',
        lastModifiedBy: 'Azure Sync Service',
        lastModifiedAt: '2024-03-25T08:30:00Z',
        isManualOverride: true,
        originalAutoAnswer: 'partially_fulfilled',
        createdAt: '2024-02-01T10:00:00Z',
        updatedAt: '2024-03-20T14:15:00Z'
      }
    ],
    associatedRequirements: ['iso-27001-A.8.11', 'iso-27001-A.8.12', 'iso-27001-A.9.1.2', 'iso-27001-A.12.3.1'],
    lastReviewDate: '2024-03-20T14:00:00Z',
    nextReviewDate: '2024-09-20T14:00:00Z',
    complianceScore: 94,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-03-25T08:30:00Z'
  },
  {
    id: 'app-azure-2',
    name: 'Enterprise API Gateway',
    description: 'Azure API Management service providing secure, scalable API gateway for microservices architecture with developer portal and analytics',
    organizationNumber: 'APP-API-001',
    type: 'API Gateway',
    category: 'Integration & APIs',
    status: 'active',
    criticality: 'critical',
    syncMode: 'azure',
    azureSyncMetadata: {
      lastSyncDate: '2024-03-25T09:15:00Z',
      syncVersion: '2.1.3',
      azureResourceId: '/subscriptions/12345678-1234-1234-1234-123456789abc/resourceGroups/api-rg/providers/Microsoft.ApiManagement/service/enterprise-apim',
      azureSubscriptionId: '12345678-1234-1234-1234-123456789abc',
      azureResourceGroup: 'api-rg',
      syncStatus: 'synced',
      dataSource: 'Azure Security Center, Azure Monitor',
      lastSuccessfulSync: '2024-03-25T09:15:00Z',
      syncFrequency: 'daily',
      autoAnsweredRequirements: 15,
      manualOverrides: 1
    },
    contact: {
      name: 'Alex Thompson',
      email: 'alex.thompson@democorp.com',
      phone: '+1-555-0245',
      title: 'API Platform Architect'
    },
    internalResponsible: {
      id: 'internal-user-5',
      name: 'Jennifer Harrison',
      email: 'jennifer.harrison@democorp.com',
      department: 'Enterprise Architecture'
    },
    requirementFulfillments: [
      {
        id: 'rf-azure-2-1',
        requirementId: 'iso-27001-A.13.1.1',
        applicationId: 'app-azure-2',
        status: 'fulfilled',
        isAutoAnswered: true,
        confidenceLevel: 'high',
        autoAnswerSource: 'Azure Security Center',
        evidence: 'Network security groups, Azure Firewall, and DDoS protection configured. Network segmentation implemented with virtual networks.',
        justification: 'Enterprise-grade network security with Azure native protections and monitoring.',
        responsibleParty: 'Jennifer Harrison',
        lastAssessmentDate: '2024-03-25T09:15:00Z',
        lastModifiedBy: 'Azure Sync Service',
        lastModifiedAt: '2024-03-25T09:15:00Z',
        isManualOverride: false,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-03-25T09:15:00Z'
      },
      {
        id: 'rf-azure-2-2',
        requirementId: 'iso-27001-A.14.2.2',
        applicationId: 'app-azure-2',
        status: 'fulfilled',
        isAutoAnswered: true,
        confidenceLevel: 'high',
        autoAnswerSource: 'Azure DevOps',
        evidence: 'Secure CI/CD pipeline with Azure DevOps, code scanning, dependency checking, and deployment approvals.',
        justification: 'Comprehensive secure development and deployment practices with automated security validation.',
        responsibleParty: 'Jennifer Harrison',
        lastAssessmentDate: '2024-03-25T09:15:00Z',
        lastModifiedBy: 'Azure Sync Service',
        lastModifiedAt: '2024-03-25T09:15:00Z',
        isManualOverride: false,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-03-25T09:15:00Z'
      }
    ],
    associatedRequirements: ['iso-27001-A.13.1.1', 'iso-27001-A.14.2.2', 'iso-27001-A.12.6.1', 'iso-27001-A.8.11'],
    lastReviewDate: '2024-03-22T10:00:00Z',
    nextReviewDate: '2024-09-22T10:00:00Z',
    complianceScore: 96,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-25T09:15:00Z'
  },
  {
    id: 'app-azure-3',
    name: 'Financial Data Lake',
    description: 'Azure Data Lake Analytics solution for financial reporting, regulatory compliance, and business intelligence with petabyte-scale data processing',
    organizationNumber: 'APP-FDL-001',
    type: 'Data Lake',
    category: 'Financial Systems',
    status: 'active',
    criticality: 'critical',
    syncMode: 'azure',
    azureSyncMetadata: {
      lastSyncDate: '2024-03-25T07:45:00Z',
      syncVersion: '2.1.3',
      azureResourceId: '/subscriptions/12345678-1234-1234-1234-123456789abc/resourceGroups/finance-rg/providers/Microsoft.DataLakeStore/accounts/finance-datalake',
      azureSubscriptionId: '12345678-1234-1234-1234-123456789abc',
      azureResourceGroup: 'finance-rg',
      syncStatus: 'synced',
      dataSource: 'Azure Security Center, Azure Purview',
      lastSuccessfulSync: '2024-03-25T07:45:00Z',
      syncFrequency: 'daily',
      autoAnsweredRequirements: 18,
      manualOverrides: 0
    },
    contact: {
      name: 'Diana Foster',
      email: 'diana.foster@democorp.com',
      phone: '+1-555-0312',
      title: 'Chief Data Officer'
    },
    internalResponsible: {
      id: 'internal-user-8',
      name: 'Marcus Williams',
      email: 'marcus.williams@democorp.com',
      department: 'Finance'
    },
    requirementFulfillments: [
      {
        id: 'rf-azure-3-1',
        requirementId: 'iso-27001-A.12.3.1',
        applicationId: 'app-azure-3',
        status: 'fulfilled',
        isAutoAnswered: true,
        confidenceLevel: 'high',
        autoAnswerSource: 'Azure Backup',
        evidence: 'Azure Backup configured with geo-redundant storage, point-in-time recovery, and automated backup verification.',
        justification: 'Comprehensive backup and recovery solution meeting enterprise RPO/RTO requirements.',
        responsibleParty: 'Marcus Williams',
        lastAssessmentDate: '2024-03-25T07:45:00Z',
        lastModifiedBy: 'Azure Sync Service',
        lastModifiedAt: '2024-03-25T07:45:00Z',
        isManualOverride: false,
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-03-25T07:45:00Z'
      },
      {
        id: 'rf-azure-3-2',
        requirementId: 'iso-27001-A.18.1.4',
        applicationId: 'app-azure-3',
        status: 'fulfilled',
        isAutoAnswered: true,
        confidenceLevel: 'high',
        autoAnswerSource: 'Azure Purview',
        evidence: 'Azure Purview data governance with automated data classification, lineage tracking, and privacy compliance monitoring.',
        justification: 'Enterprise data governance platform with built-in privacy and regulatory compliance capabilities.',
        responsibleParty: 'Marcus Williams',
        lastAssessmentDate: '2024-03-25T07:45:00Z',
        lastModifiedBy: 'Azure Sync Service',
        lastModifiedAt: '2024-03-25T07:45:00Z',
        isManualOverride: false,
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-03-25T07:45:00Z'
      }
    ],
    associatedRequirements: ['iso-27001-A.12.3.1', 'iso-27001-A.18.1.4', 'iso-27001-A.8.11', 'iso-27001-A.9.1.1'],
    lastReviewDate: '2024-03-24T14:00:00Z',
    nextReviewDate: '2024-09-24T14:00:00Z',
    complianceScore: 98,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-03-25T07:45:00Z'
  },
  {
    id: 'app-azure-4',
    name: 'Mobile Customer App',
    description: 'React Native mobile application with Azure backend services, providing customer self-service, account management, and real-time notifications',
    organizationNumber: 'APP-MOB-001',
    type: 'Mobile Application',
    category: 'Customer Engagement',
    status: 'active',
    criticality: 'high',
    syncMode: 'azure',
    azureSyncMetadata: {
      lastSyncDate: '2024-03-25T10:20:00Z',
      syncVersion: '2.1.3',
      azureResourceId: '/subscriptions/12345678-1234-1234-1234-123456789abc/resourceGroups/mobile-rg/providers/Microsoft.Web/sites/customer-mobile-api',
      azureSubscriptionId: '12345678-1234-1234-1234-123456789abc',
      azureResourceGroup: 'mobile-rg',
      syncStatus: 'synced',
      dataSource: 'Azure Security Center, App Center',
      lastSuccessfulSync: '2024-03-25T10:20:00Z',
      syncFrequency: 'daily',
      autoAnsweredRequirements: 10,
      manualOverrides: 3
    },
    contact: {
      name: 'Jordan Kim',
      email: 'jordan.kim@democorp.com',
      phone: '+1-555-0387',
      title: 'Mobile Product Manager'
    },
    internalResponsible: {
      id: 'internal-user-12',
      name: 'Kevin Zhang',
      email: 'kevin.zhang@democorp.com',
      department: 'Mobile Development'
    },
    requirementFulfillments: [
      {
        id: 'rf-azure-4-1',
        requirementId: 'iso-27001-A.14.1.2',
        applicationId: 'app-azure-4',
        status: 'fulfilled',
        isAutoAnswered: true,
        confidenceLevel: 'medium',
        autoAnswerSource: 'Azure DevOps, App Center',
        evidence: 'Secure development lifecycle with Azure DevOps, App Center security scanning, and mobile-specific security testing.',
        justification: 'Comprehensive mobile security development with platform-specific security measures.',
        responsibleParty: 'Kevin Zhang',
        lastAssessmentDate: '2024-03-25T10:20:00Z',
        lastModifiedBy: 'Azure Sync Service',
        lastModifiedAt: '2024-03-25T10:20:00Z',
        isManualOverride: true,
        originalAutoAnswer: 'partially_fulfilled',
        createdAt: '2024-02-10T10:00:00Z',
        updatedAt: '2024-03-18T16:30:00Z'
      }
    ],
    associatedRequirements: ['iso-27001-A.14.1.2', 'iso-27001-A.13.1.3', 'iso-27001-A.8.12'],
    lastReviewDate: '2024-03-18T16:00:00Z',
    nextReviewDate: '2024-09-18T16:00:00Z',
    complianceScore: 89,
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-03-25T10:20:00Z'
  },
  {
    id: 'app-azure-5',
    name: 'IoT Sensor Network',
    description: 'Azure IoT Hub solution managing 50,000+ industrial sensors across manufacturing facilities, with real-time monitoring and predictive analytics',
    organizationNumber: 'APP-IOT-001',
    type: 'IoT Platform',
    category: 'Industrial IoT',
    status: 'active',
    criticality: 'high',
    syncMode: 'azure',
    azureSyncMetadata: {
      lastSyncDate: '2024-03-24T23:30:00Z',
      syncVersion: '2.1.3',
      azureResourceId: '/subscriptions/12345678-1234-1234-1234-123456789abc/resourceGroups/iot-rg/providers/Microsoft.Devices/IotHubs/enterprise-iot-hub',
      azureSubscriptionId: '12345678-1234-1234-1234-123456789abc',
      azureResourceGroup: 'iot-rg',
      syncStatus: 'error',
      syncErrors: ['Certificate validation timeout for device authentication'],
      dataSource: 'Azure IoT Hub, Azure Security Center',
      lastSuccessfulSync: '2024-03-23T23:30:00Z',
      syncFrequency: 'daily',
      autoAnsweredRequirements: 8,
      manualOverrides: 1
    },
    contact: {
      name: 'Chen Liu',
      email: 'chen.liu@democorp.com',
      phone: '+1-555-0401',
      title: 'IoT Solutions Architect'
    },
    internalResponsible: {
      id: 'internal-user-7',
      name: 'Lisa Thompson',
      email: 'lisa.thompson@democorp.com',
      department: 'DevOps'
    },
    requirementFulfillments: [
      {
        id: 'rf-azure-5-1',
        requirementId: 'iso-27001-A.13.1.3',
        applicationId: 'app-azure-5',
        status: 'fulfilled',
        isAutoAnswered: true,
        confidenceLevel: 'high',
        autoAnswerSource: 'Azure IoT Hub',
        evidence: 'Device-to-cloud and cloud-to-device messaging with TLS 1.2, device certificates, and network isolation.',
        justification: 'Enterprise IoT security with certificate-based device authentication and encrypted communications.',
        responsibleParty: 'Lisa Thompson',
        lastAssessmentDate: '2024-03-23T23:30:00Z',
        lastModifiedBy: 'Azure Sync Service',
        lastModifiedAt: '2024-03-23T23:30:00Z',
        isManualOverride: false,
        createdAt: '2024-02-05T10:00:00Z',
        updatedAt: '2024-03-23T23:30:00Z'
      }
    ],
    associatedRequirements: ['iso-27001-A.13.1.3', 'iso-27001-A.11.2.1', 'iso-27001-A.8.11'],
    lastReviewDate: '2024-03-15T14:00:00Z',
    nextReviewDate: '2024-09-15T14:00:00Z',
    complianceScore: 91,
    createdAt: '2024-02-05T10:00:00Z',
    updatedAt: '2024-03-24T23:30:00Z'
  },
  {
    id: 'app-azure-6',
    name: 'Document Management System',
    description: 'SharePoint Online and Azure-based document management with advanced search, version control, and compliance features for enterprise content',
    organizationNumber: 'APP-DMS-001',
    type: 'Document Management',
    category: 'Content Management',
    status: 'active',
    criticality: 'medium',
    syncMode: 'azure',
    azureSyncMetadata: {
      lastSyncDate: '2024-03-25T06:00:00Z',
      syncVersion: '2.1.3',
      azureResourceId: '/subscriptions/12345678-1234-1234-1234-123456789abc/resourceGroups/sharepoint-rg/providers/Microsoft.SharePoint/sites/enterprise-docs',
      azureSubscriptionId: '12345678-1234-1234-1234-123456789abc',
      azureResourceGroup: 'sharepoint-rg',
      syncStatus: 'pending',
      dataSource: 'Microsoft 365 Compliance Center, Azure Information Protection',
      lastSuccessfulSync: '2024-03-24T06:00:00Z',
      syncFrequency: 'daily',
      autoAnsweredRequirements: 14,
      manualOverrides: 0
    },
    contact: {
      name: 'Susan Brown',
      email: 'susan.brown@democorp.com',
      phone: '+1-555-0456',
      title: 'Knowledge Management Director'
    },
    internalResponsible: {
      id: 'internal-user-2',
      name: 'Michael Chen',
      email: 'michael.chen@democorp.com',
      department: 'IT Operations'
    },
    requirementFulfillments: [
      {
        id: 'rf-azure-6-1',
        requirementId: 'iso-27001-A.8.2.1',
        applicationId: 'app-azure-6',
        status: 'fulfilled',
        isAutoAnswered: true,
        confidenceLevel: 'high',
        autoAnswerSource: 'Azure Information Protection',
        evidence: 'Automated data classification with Azure Information Protection, sensitivity labels, and data loss prevention policies.',
        justification: 'Enterprise data protection with automated classification and rights management.',
        responsibleParty: 'Michael Chen',
        lastAssessmentDate: '2024-03-24T06:00:00Z',
        lastModifiedBy: 'Azure Sync Service',
        lastModifiedAt: '2024-03-24T06:00:00Z',
        isManualOverride: false,
        createdAt: '2024-01-25T10:00:00Z',
        updatedAt: '2024-03-24T06:00:00Z'
      }
    ],
    associatedRequirements: ['iso-27001-A.8.2.1', 'iso-27001-A.8.3.2', 'iso-27001-A.18.1.4'],
    lastReviewDate: '2024-03-20T10:00:00Z',
    nextReviewDate: '2024-09-20T10:00:00Z',
    complianceScore: 93,
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-03-25T06:00:00Z'
  },
  
  // ADDITIONAL MANUAL APPLICATIONS - Show variety across different business domains
  {
    id: 'app-manual-4',
    name: 'Legacy Accounting System',
    description: 'Core financial accounting system handling general ledger, accounts payable/receivable, and financial reporting for enterprise operations',
    organizationNumber: 'APP-ACC-001',
    type: 'ERP System',
    category: 'Financial Systems',
    status: 'under-review',
    criticality: 'critical',
    syncMode: 'manual',
    contact: {
      name: 'Robert Martinez',
      email: 'robert.martinez@democorp.com',
      phone: '+1-555-0278',
      title: 'Finance Systems Administrator'
    },
    internalResponsible: {
      id: 'internal-user-8',
      name: 'Marcus Williams',
      email: 'marcus.williams@democorp.com',
      department: 'Finance'
    },
    requirementFulfillments: [
      {
        id: 'rf-manual-4-1',
        requirementId: 'iso-27001-A.12.1.2',
        applicationId: 'app-manual-4',
        status: 'not_fulfilled',
        isAutoAnswered: false,
        evidence: 'System lacks comprehensive change management procedures. Ad-hoc updates without proper approval workflow.',
        justification: 'Legacy system requires modernization of change management practices.',
        responsibleParty: 'Marcus Williams',
        lastAssessmentDate: '2024-03-10T10:00:00Z',
        lastModifiedBy: 'Elena Rodriguez',
        lastModifiedAt: '2024-03-10T14:20:00Z',
        isManualOverride: false,
        createdAt: '2024-02-15T09:00:00Z',
        updatedAt: '2024-03-10T14:20:00Z'
      }
    ],
    associatedRequirements: ['iso-27001-A.12.1.2', 'iso-27001-A.9.1.1', 'iso-27001-A.12.3.1'],
    lastReviewDate: '2024-03-10T10:00:00Z',
    nextReviewDate: '2024-06-10T10:00:00Z',
    complianceScore: 65,
    createdAt: '2021-03-15T10:00:00Z',
    updatedAt: '2024-03-10T14:20:00Z'
  },
  {
    id: 'app-manual-5',
    name: 'Inventory Management System',
    description: 'Warehouse and inventory management system tracking 100,000+ SKUs across 8 distribution centers with real-time stock levels',
    organizationNumber: 'APP-INV-001',
    type: 'Inventory System',
    category: 'Supply Chain',
    status: 'active',
    criticality: 'high',
    syncMode: 'manual',
    contact: {
      name: 'Laura Wilson',
      email: 'laura.wilson@democorp.com',
      phone: '+1-555-0334',
      title: 'Supply Chain Technology Manager'
    },
    internalResponsible: {
      id: 'internal-user-2',
      name: 'Michael Chen',
      email: 'michael.chen@democorp.com',
      department: 'IT Operations'
    },
    requirementFulfillments: [
      {
        id: 'rf-manual-5-1',
        requirementId: 'iso-27001-A.8.1.1',
        applicationId: 'app-manual-5',
        status: 'fulfilled',
        isAutoAnswered: false,
        evidence: 'Comprehensive asset inventory with automated discovery and regular audits. Integration with CMDB for complete visibility.',
        justification: 'Comprehensive inventory management system with full asset lifecycle tracking.',
        responsibleParty: 'Michael Chen',
        lastAssessmentDate: '2024-03-05T10:00:00Z',
        lastModifiedBy: 'Michael Chen',
        lastModifiedAt: '2024-03-05T15:30:00Z',
        isManualOverride: false,
        createdAt: '2024-01-30T09:00:00Z',
        updatedAt: '2024-03-05T15:30:00Z'
      }
    ],
    associatedRequirements: ['iso-27001-A.8.1.1', 'iso-27001-A.8.1.2', 'iso-27001-A.12.5.1'],
    lastReviewDate: '2024-03-05T10:00:00Z',
    nextReviewDate: '2024-09-05T10:00:00Z',
    complianceScore: 87,
    createdAt: '2023-07-20T10:00:00Z',
    updatedAt: '2024-03-05T15:30:00Z'
  }
];

// Legacy Applications array for backward compatibility
export const applications: Application[] = enhancedApplications.map(app => {
  const result: Application = {
    id: app.id,
    name: app.name,
    organizationNumber: app.organizationNumber,
    status: app.status,
    criticality: app.criticality,
    contact: app.contact,
    internalResponsible: app.internalResponsible,
    associatedRequirements: app.associatedRequirements,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt
  };
  
  if (app.description) result.description = app.description;
  if (app.type) result.type = app.type;
  if (app.category) result.category = app.category;
  if (app.lastReviewDate) result.lastReviewDate = app.lastReviewDate;
  if (app.nextReviewDate) result.nextReviewDate = app.nextReviewDate;
  
  return result;
});

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

/*
ENHANCED APPLICATION DEMO DATA SUMMARY:
========================================

📊 Total Applications: 13 (5 Manual + 6 Azure-Synced + 2 Additional Manual)

🏢 MANUAL APPLICATIONS (Traditional):
• Legacy HR Management System (Critical) - 2,800+ employees, 12 offices
• Customer Support Portal (High) - 15,000+ customers, ticketing system
• Manufacturing Execution System (Critical) - 4 facilities, production control
• Legacy Accounting System (Critical/Under Review) - Financial ERP with gaps
• Inventory Management System (High) - 100,000+ SKUs, 8 distribution centers

☁️ AZURE-SYNCED APPLICATIONS (Modern Cloud):
• Customer Data Platform (High) - Azure analytics with ML insights
• Enterprise API Gateway (Critical) - Azure APIM with 15 auto-answered requirements
• Financial Data Lake (Critical) - Petabyte-scale analytics with 18 auto-answered requirements
• Mobile Customer App (High) - React Native with Azure backend
• IoT Sensor Network (High) - 50,000+ sensors with sync error example
• Document Management System (Medium) - SharePoint Online with AIP classification

🎯 KEY DEMO FEATURES SHOWCASED:
• Diverse application portfolio across business domains
• Realistic Azure resource metadata and sync statuses
• Auto-answered requirements with different confidence levels
• Manual overrides demonstrating hybrid management
• Comprehensive requirement fulfillments with detailed evidence
• Various sync statuses (synced, error, pending) for realistic scenarios
• High compliance scores for Azure apps (89-98%) vs manual (65-92%)
• Enterprise-scale descriptions and contact information
• Varied criticality levels and review schedules

💡 BUSINESS VALUE DEMONSTRATION:
• Shows efficiency gains from Azure sync automation
• Demonstrates comprehensive compliance coverage
• Highlights manual vs automated requirement management
• Showcases enterprise-grade security and governance
• Proves scalability across different application types
*/