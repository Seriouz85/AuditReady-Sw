import { Standard, Requirement, Assessment, ComplianceStats, Tag, InternalUser, Supplier, Application } from '@/types';

// Mock Tags
export const tags: Tag[] = [
  // Type category tags
  {
    id: 'tag-security',
    name: 'Security',
    color: '#EF4444', // Red
    description: 'Related to security controls and measures',
    category: 'type'
  },
  {
    id: 'tag-documentation',
    name: 'Documentation',
    color: '#3B82F6', // Blue
    description: 'Related to documentation and record-keeping',
    category: 'type'
  },
  {
    id: 'tag-governance',
    name: 'Governance',
    color: '#10B981', // Green
    description: 'Related to management, leadership and oversight',
    category: 'type'
  },
  {
    id: 'tag-compliance',
    name: 'Compliance',
    color: '#F59E0B', // Amber
    description: 'Related to regulatory and legal compliance',
    category: 'type'
  },
  {
    id: 'tag-risk',
    name: 'Risk Management',
    color: '#8B5CF6', // Purple
    description: 'Related to risk assessment and management',
    category: 'type'
  },
  {
    id: 'tag-access-control',
    name: 'Access Control',
    color: '#EC4899', // Pink
    description: 'Related to user access and privileges',
    category: 'type'
  },
  {
    id: 'tag-data-protection',
    name: 'Data Protection',
    color: '#06B6D4', // Cyan
    description: 'Related to protecting data and information',
    category: 'type'
  },
  {
    id: 'tag-incident',
    name: 'Incident Management',
    color: '#6366F1', // Indigo
    description: 'Related to security incidents and response',
    category: 'type'
  },
  {
    id: 'tag-high-priority',
    name: 'High Priority',
    color: '#DC2626', // Dark red
    description: 'Requirements that need immediate attention',
    category: 'type'
  },
  {
    id: 'tag-technical',
    name: 'Technical',
    color: '#4B5563', // Gray
    description: 'Technical implementation requirements',
    category: 'type'
  },
  {
    id: 'tag-physical',
    name: 'Physical',
    color: '#059669', // Emerald
    description: 'Related to physical security',
    category: 'type'
  },
  {
    id: 'tag-operational',
    name: 'Operational',
    color: '#7C3AED', // Violet
    description: 'Operational procedures and controls',
    category: 'type'
  },
  {
    id: 'tag-policy',
    name: 'Policy',
    color: '#2563EB', // Blue
    description: 'Policy-related requirements',
    category: 'type'
  },
  {
    id: 'tag-identity',
    name: 'Identity',
    color: '#A21CAF', // Purple
    description: 'Related to identity and account management',
    category: 'type'
  },
  {
    id: 'tag-people',
    name: 'People',
    color: '#F59E42', // Orange (eller valfri färg)
    description: 'Related to people, training, and awareness',
    category: 'type'
  },
  {
    id: 'tag-supplier',
    name: 'Supplier',
    color: '#8B5CF6', // Lila (eller valfri färg)
    description: 'Related to supplier and service provider management',
    category: 'type'
  },
  {
    id: 'tag-logging',
    name: 'Logging',
    color: '#FBBF24', // Yellow
    description: 'Related to audit log management and monitoring',
    category: 'type'
  },
  {
    id: 'tag-endpoint',
    name: 'Endpoint',
    color: '#3B82F6', // Blue
    description: 'Related to endpoint protection and controls',
    category: 'type'
  },
  {
    id: 'tag-backup',
    name: 'Backup',
    color: '#10B981', // Green
    description: 'Related to backup and data recovery',
    category: 'type'
  },
  // Applies-to category tags
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
    id: 'tag-network',
    name: 'Network',
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
export const standards: Standard[] = [
  {
    id: 'iso-27001',
    name: 'ISO/IEC 27001',
    version: '2022',
    type: 'framework',
    description: 'Information Security Management System standard that provides requirements for an information security management system.',
    category: 'Information Security',
    requirements: [
      'iso-27001-4.1', 'iso-27001-4.2', 'iso-27001-4.3', 'iso-27001-4.4',
      'iso-27001-5.1', 'iso-27001-5.2', 'iso-27001-5.3',
      'iso-27001-6.1.1', 'iso-27001-6.1.2', 'iso-27001-6.1.3', 'iso-27001-6.2', 'iso-27001-6.3',
      'iso-27001-7.1', 'iso-27001-7.2', 'iso-27001-7.3', 'iso-27001-7.4', 'iso-27001-7.5.1', 'iso-27001-7.5.2', 'iso-27001-7.5.3',
      'iso-27001-8.1', 'iso-27001-8.2', 'iso-27001-8.3',
      'iso-27001-9.1', 'iso-27001-9.2.1', 'iso-27001-9.2.2', 'iso-27001-9.3.1', 'iso-27001-9.3.2', 'iso-27001-9.3.3',
      'iso-27001-10.1', 'iso-27001-10.2'
    ],
    createdAt: '2024-03-10T12:00:00Z',
    updatedAt: '2024-03-10T12:00:00Z',
  },
  {
    id: 'iso-27002-2022',
    name: 'ISO 27002:2022',
    version: '2022',
    type: 'framework',
    description: 'Code of practice for information security controls that provides guidance on implementing information security controls.',
    category: 'Information Security',
    requirements: [
      // Controls (A.5 - A.8)
      'iso-27001-A5.1', 'iso-27001-A5.2', 'iso-27001-A5.3', 'iso-27001-A5.4', 'iso-27001-A5.5', 'iso-27001-A5.6', 
      'iso-27001-A5.7', 'iso-27001-A5.8', 'iso-27001-A5.9', 'iso-27001-A5.10', 'iso-27001-A5.11', 'iso-27001-A5.12', 
      'iso-27001-A5.13', 'iso-27001-A5.14', 'iso-27001-A5.15', 'iso-27001-A5.16', 'iso-27001-A5.17', 'iso-27001-A5.18', 
      'iso-27001-A5.19', 'iso-27001-A5.20', 'iso-27001-A5.21', 'iso-27001-A5.22', 'iso-27001-A5.23', 'iso-27001-A5.24', 
      'iso-27001-A5.25', 'iso-27001-A5.26', 'iso-27001-A5.27', 'iso-27001-A5.28', 'iso-27001-A5.29', 'iso-27001-A5.30', 
      'iso-27001-A5.31', 'iso-27001-A5.32', 'iso-27001-A5.33', 'iso-27001-A5.34', 'iso-27001-A5.35', 'iso-27001-A5.36', 
      'iso-27001-A5.37',
      'iso-27001-A6.1', 'iso-27001-A6.2', 'iso-27001-A6.3', 'iso-27001-A6.4', 'iso-27001-A6.5', 'iso-27001-A6.6', 
      'iso-27001-A6.7', 'iso-27001-A6.8',
      'iso-27001-A7.1', 'iso-27001-A7.2', 'iso-27001-A7.3', 'iso-27001-A7.4', 'iso-27001-A7.5', 'iso-27001-A7.6', 
      'iso-27001-A7.7', 'iso-27001-A7.8', 'iso-27001-A7.9', 'iso-27001-A7.10', 'iso-27001-A7.11', 'iso-27001-A7.12', 
      'iso-27001-A7.13', 'iso-27001-A7.14',
      'iso-27001-A8.1', 'iso-27001-A8.2', 'iso-27001-A8.3', 'iso-27001-A8.4', 'iso-27001-A8.5', 'iso-27001-A8.6', 
      'iso-27001-A8.7', 'iso-27001-A8.8', 'iso-27001-A8.9', 'iso-27001-A8.10', 'iso-27001-A8.11', 'iso-27001-A8.12', 
      'iso-27001-A8.13', 'iso-27001-A8.14', 'iso-27001-A8.15', 'iso-27001-A8.16', 'iso-27001-A8.17', 'iso-27001-A8.18', 
      'iso-27001-A8.19', 'iso-27001-A8.20', 'iso-27001-A8.21', 'iso-27001-A8.22', 'iso-27001-A8.23', 'iso-27001-A8.24', 
      'iso-27001-A8.25', 'iso-27001-A8.26', 'iso-27001-A8.27', 'iso-27001-A8.28', 'iso-27001-A8.29', 'iso-27001-A8.30', 
      'iso-27001-A8.31', 'iso-27001-A8.32', 'iso-27001-A8.33', 'iso-27001-A8.34'
    ],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'nis2',
    name: 'NIS2 Directive',
    version: '2022',
    type: 'regulation',
    description: 'EU directive on measures for a high common level of cybersecurity across the Union.',
    category: 'Network Security',
    requirements: [
      'nis2-A1', 'nis2-A2', 'nis2-A3', 'nis2-A4', 'nis2-A5', 
      'nis2-B1', 'nis2-B2', 'nis2-B3', 'nis2-B4', 
      'nis2-C1', 'nis2-C2', 'nis2-C3'
    ],
    createdAt: '2024-03-12T14:30:00Z',
    updatedAt: '2024-03-12T14:30:00Z',
  },
  {
    id: 'gdpr',
    name: 'GDPR',
    version: '2018',
    type: 'regulation',
    description: 'General Data Protection Regulation for data protection and privacy in the EU.',
    category: 'Data Protection',
    requirements: [
      'gdpr-A1', 'gdpr-A2', 'gdpr-A3', 'gdpr-A4', 'gdpr-A5', 'gdpr-A6',
      'gdpr-B1', 'gdpr-B2', 'gdpr-B3', 'gdpr-B4', 'gdpr-B5',
      'gdpr-C1', 'gdpr-C2', 'gdpr-C3', 'gdpr-C4'
    ],
    createdAt: '2024-03-15T09:20:00Z',
    updatedAt: '2024-03-15T09:20:00Z',
  },
  {
    id: 'cis-ig1',
    name: 'CIS Controls IG1',
    version: '8.1',
    type: 'framework',
    description: 'CIS Implementation Group 1 (IG1) is the essential cyber hygiene standard, representing basic cyber defense readiness for all enterprises.',
    category: 'Cybersecurity',
    requirements: [
      // Fylls på med alla requirement-IDs för IG1 (dvs. där IG1 är markerad med x i tabellen)
      'cis-ig1-1.1', 'cis-ig1-1.2',
      'cis-ig1-2.1', 'cis-ig1-2.2', 'cis-ig1-2.3',
      'cis-ig1-3.1', 'cis-ig1-3.2', 'cis-ig1-3.3', 'cis-ig1-3.4', 'cis-ig1-3.5', 'cis-ig1-3.6',
      'cis-ig1-4.1', 'cis-ig1-4.2', 'cis-ig1-4.3', 'cis-ig1-4.4', 'cis-ig1-4.5', 'cis-ig1-4.6', 'cis-ig1-4.7',
      'cis-ig1-5.1', 'cis-ig1-5.2', 'cis-ig1-5.3', 'cis-ig1-5.4',
      'cis-ig1-6.1', 'cis-ig1-6.2', 'cis-ig1-6.3', 'cis-ig1-6.4', 'cis-ig1-6.5',
      'cis-ig1-7.1', 'cis-ig1-7.2', 'cis-ig1-7.3', 'cis-ig1-7.4',
      'cis-ig1-8.1', 'cis-ig1-8.2', 'cis-ig1-8.3',
      'cis-ig1-9.1', 'cis-ig1-9.2',
      'cis-ig1-10.1', 'cis-ig1-10.2', 'cis-ig1-10.3',
      'cis-ig1-11.1', 'cis-ig1-11.2', 'cis-ig1-11.3', 'cis-ig1-11.4',
      'cis-ig1-12.1',
      'cis-ig1-13.1',
      'cis-ig1-14.1', 'cis-ig1-14.2', 'cis-ig1-14.3', 'cis-ig1-14.4', 'cis-ig1-14.5', 'cis-ig1-14.6', 'cis-ig1-14.7', 'cis-ig1-14.8',
      'cis-ig1-15.1',
      'cis-ig1-16.1',
      'cis-ig1-17.1', 'cis-ig1-17.2', 'cis-ig1-17.3',
      'cis-ig1-18.1',
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2',
    name: 'CIS Controls IG2',
    version: '8.1',
    type: 'framework',
    description: 'CIS Implementation Group 2 (IG2) includes all IG1 safeguards plus additional safeguards for organizations with moderate cybersecurity maturity and resources.',
    category: 'Cybersecurity',
    requirements: [
      'cis-ig2-1.1', 'cis-ig2-1.2', 'cis-ig2-1.3', 'cis-ig2-1.4',
      'cis-ig2-2.1', 'cis-ig2-2.2', 'cis-ig2-2.3', 'cis-ig2-2.4', 'cis-ig2-2.5', 'cis-ig2-2.6',
      'cis-ig2-3.1', 'cis-ig2-3.2', 'cis-ig2-3.3', 'cis-ig2-3.4', 'cis-ig2-3.5', 'cis-ig2-3.6', 'cis-ig2-3.7', 'cis-ig2-3.8', 'cis-ig2-3.9', 'cis-ig2-3.10', 'cis-ig2-3.11', 'cis-ig2-3.12',
      'cis-ig2-4.1', 'cis-ig2-4.2', 'cis-ig2-4.3', 'cis-ig2-4.4', 'cis-ig2-4.5', 'cis-ig2-4.6', 'cis-ig2-4.7', 'cis-ig2-4.8', 'cis-ig2-4.9', 'cis-ig2-4.10', 'cis-ig2-4.11',
      'cis-ig2-5.1', 'cis-ig2-5.2', 'cis-ig2-5.3', 'cis-ig2-5.4', 'cis-ig2-5.5', 'cis-ig2-5.6',
      'cis-ig2-6.1', 'cis-ig2-6.2', 'cis-ig2-6.3', 'cis-ig2-6.4', 'cis-ig2-6.5', 'cis-ig2-6.6', 'cis-ig2-6.7',
      'cis-ig2-7.1', 'cis-ig2-7.2', 'cis-ig2-7.3', 'cis-ig2-7.4', 'cis-ig2-7.5', 'cis-ig2-7.6', 'cis-ig2-7.7',
      'cis-ig2-8.1', 'cis-ig2-8.2', 'cis-ig2-8.3', 'cis-ig2-8.4', 'cis-ig2-8.5', 'cis-ig2-8.6', 'cis-ig2-8.7', 'cis-ig2-8.8', 'cis-ig2-8.9', 'cis-ig2-8.10', 'cis-ig2-8.11',
      'cis-ig2-9.1', 'cis-ig2-9.2', 'cis-ig2-9.3', 'cis-ig2-9.4', 'cis-ig2-9.5', 'cis-ig2-9.6',
      'cis-ig2-10.1', 'cis-ig2-10.2', 'cis-ig2-10.3', 'cis-ig2-10.4', 'cis-ig2-10.5', 'cis-ig2-10.6', 'cis-ig2-10.7',
      'cis-ig2-11.1', 'cis-ig2-11.2', 'cis-ig2-11.3', 'cis-ig2-11.4', 'cis-ig2-11.5',
      'cis-ig2-12.1', 'cis-ig2-12.2', 'cis-ig2-12.3', 'cis-ig2-12.4', 'cis-ig2-12.5', 'cis-ig2-12.6', 'cis-ig2-12.7',
      'cis-ig2-13.1', 'cis-ig2-13.2', 'cis-ig2-13.3', 'cis-ig2-13.4', 'cis-ig2-13.5', 'cis-ig2-13.6',
      'cis-ig2-14.1', 'cis-ig2-14.2', 'cis-ig2-14.3', 'cis-ig2-14.4', 'cis-ig2-14.5', 'cis-ig2-14.6', 'cis-ig2-14.7', 'cis-ig2-14.8', 'cis-ig2-14.9',
      'cis-ig2-15.1', 'cis-ig2-15.2', 'cis-ig2-15.3', 'cis-ig2-15.4',
      'cis-ig2-16.1', 'cis-ig2-16.2', 'cis-ig2-16.3', 'cis-ig2-16.4', 'cis-ig2-16.5', 'cis-ig2-16.6', 'cis-ig2-16.7', 'cis-ig2-16.8', 'cis-ig2-16.9', 'cis-ig2-16.10', 'cis-ig2-16.11',
      'cis-ig2-17.1', 'cis-ig2-17.2', 'cis-ig2-17.3', 'cis-ig2-17.4', 'cis-ig2-17.5', 'cis-ig2-17.6', 'cis-ig2-17.7',
      'cis-ig2-18.1', 'cis-ig2-18.2', 'cis-ig2-18.3',
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock Requirements
export const requirements: Requirement[] = [
  {
    id: 'iso-27001-4.1',
    standardId: 'iso-27001',
    section: '4',
    code: '4.1',
    name: 'Understanding the organization and its context',
    description: 'The organization shall determine external and internal issues that are relevant to its purpose and that affect its ability to achieve the intended outcome(s) of its information security management system.',
    guidance: 'Identify and document all relevant internal and external factors that impact information security.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'Determining these issues refers to establishing the external and internal context of the organization considered in Clause 5.4.1 of ISO 31000:2018.',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    tags: ['tag-governance', 'tag-risk'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-4.2',
    standardId: 'iso-27001',
    section: '4',
    code: '4.2',
    name: 'Understanding the needs and expectations of interested parties',
    description: 'The organization shall determine: a) interested parties that are relevant to the information security management system; b) the relevant requirements of these interested parties; c) which of these requirements will be addressed through the information security management system.',
    guidance: 'Identify all stakeholders and their security requirements and expectations.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'The requirements of interested parties can include legal and regulatory requirements and contractual obligations.',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    tags: ['tag-governance', 'tag-compliance'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-4.3',
    standardId: 'iso-27001',
    section: '4',
    code: '4.3',
    name: 'Determining the scope of the information security management system',
    description: 'The organization shall determine the boundaries and applicability of the information security management system to establish its scope. When determining this scope, the organization shall consider: a) the external and internal issues referred to in 4.1; b) the requirements referred to in 4.2; c) interfaces and dependencies between activities performed by the organization, and those that are performed by other organizations.',
    guidance: 'Define which parts of the organization are covered by the ISMS.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'The scope shall be available as documented information.',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    tags: ['tag-documentation', 'tag-governance'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-4.4',
    standardId: 'iso-27001',
    section: '4',
    code: '4.4',
    name: 'Information security management system',
    description: 'The organization shall establish, implement, maintain and continually improve an information security management system, including the processes needed and their interactions, in accordance with the requirements of this document.',
    guidance: 'Develop and maintain a comprehensive ISMS framework.',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    tags: ['tag-governance', 'tag-high-priority'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.1',
    standardId: 'iso-27001',
    section: '5',
    code: '5.1',
    name: 'Leadership and commitment',
    description: 'Top management shall demonstrate leadership and commitment with respect to the information security management system by: a) ensuring that the information security policy and the information security objectives are established and are compatible with the strategic direction of the organization; b) ensuring the integration of the information security management system requirements into the organization\'s processes; c) ensuring that the resources needed for the information security management system are available; d) communicating the importance of effective information security management and of conforming to the information security management system requirements; e) ensuring that the information security management system achieves its intended outcome(s); f) directing and supporting persons to contribute to the effectiveness of the information security management system; g) promoting continual improvement; h) supporting other relevant management roles to demonstrate their leadership as it applies to their areas of responsibility.',
    guidance: 'Ensure top management actively supports and leads the ISMS.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Executive Management',
    lastAssessmentDate: null,
    tags: ['tag-governance', 'tag-high-priority'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.2',
    standardId: 'iso-27001',
    section: '5',
    code: '5.2',
    name: 'Policy',
    description: 'Top management shall establish an information security policy that: a) is appropriate to the purpose of the organization; b) includes information security objectives or provides the framework for setting information security objectives; c) includes a commitment to satisfy applicable requirements related to information security; d) includes a commitment to continual improvement of the information security management system. The information security policy shall: e) be available as documented information; f) be communicated within the organization; g) be available to interested parties, as appropriate.',
    guidance: 'Establish and maintain a comprehensive information security policy.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Executive Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.3',
    standardId: 'iso-27001',
    section: '5',
    code: '5.3',
    name: 'Roles, responsibilities and authorities',
    description: 'Top management shall ensure that the responsibilities and authorities for roles relevant to information security are assigned and communicated within the organization. Top management shall assign the responsibility and authority for: a) ensuring that the information security management system conforms to the requirements of this document; b) reporting on the performance of the information security management system to top management.',
    guidance: 'Define and communicate security roles and responsibilities.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Executive Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.4',
    standardId: 'iso-27001',
    section: '5',
    code: '5.4',
    name: 'Management responsibilities',
    description: 'Management shall require all personnel to apply information security in accordance with the established information security policy, topic-specific policies and procedures of the organization.',
    guidance: 'Ensure management enforces security policies.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'NOTE: This is not an actual ISO 27001:2022 requirement. These are controls from ISO 27002 incorrectly assigned to ISO 27001.',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.5',
    standardId: 'iso-27001',
    section: '5',
    code: '5.5',
    name: 'Contact with authorities',
    description: 'The organization shall establish and maintain contact with relevant authorities.',
    guidance: 'Maintain relationships with regulatory and law enforcement agencies.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'NOTE: This is not an actual ISO 27001:2022 requirement. These are controls from ISO 27002 incorrectly assigned to ISO 27001.',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.6',
    standardId: 'iso-27001',
    section: '5',
    code: '5.6',
    name: 'Contact with special interest groups',
    description: 'The organization shall establish and maintain contact with special interest groups or other specialist security forums and professional associations.',
    guidance: 'Participate in security communities and forums.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.7',
    standardId: 'iso-27001',
    section: '5',
    code: '5.7',
    name: 'Threat intelligence',
    description: 'Information relating to information security threats shall be collected and analysed to produce threat intelligence.',
    guidance: 'Implement threat intelligence gathering and analysis processes.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.8',
    standardId: 'iso-27001',
    section: '5',
    code: '5.8',
    name: 'Information security in project management',
    description: 'Information security shall be integrated into project management.',
    guidance: 'Include security requirements in project planning and execution.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.9',
    standardId: 'iso-27001',
    section: '5',
    code: '5.9',
    name: 'Inventory of information and other associated assets',
    description: 'An inventory of information and other associated assets, including owners, shall be developed and maintained.',
    guidance: 'Maintain an up-to-date asset inventory.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.10',
    standardId: 'iso-27001',
    section: '5',
    code: '5.10',
    name: 'Acceptable use of information and other associated assets',
    description: 'Rules for the acceptable use and procedures for handling information and other associated assets shall be identified, documented and implemented.',
    guidance: 'Define and enforce acceptable use policies.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.11',
    standardId: 'iso-27001',
    section: '5',
    code: '5.11',
    name: 'Return of assets',
    description: "Personnel and other interested parties as appropriate shall return all the organization's assets in their possession upon change or termination of their employment, contract or agreement.",
    guidance: 'Implement asset return procedures.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'HR',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.12',
    standardId: 'iso-27001',
    section: '5',
    code: '5.12',
    name: 'Classification of information',
    description: 'Information shall be classified according to the information security needs of the organization based on confidentiality, integrity, availability and relevant interested party requirements.',
    guidance: 'Implement information classification scheme.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.13',
    standardId: 'iso-27001',
    section: '5',
    code: '5.13',
    name: 'Labelling of information',
    description: 'An appropriate set of procedures for information labelling shall be developed and implemented in accordance with the information classification scheme adopted by the organization.',
    guidance: 'Develop and implement information labeling procedures.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.14',
    standardId: 'iso-27001',
    section: '5',
    code: '5.14',
    name: 'Information transfer',
    description: 'Information transfer rules, procedures, or agreements shall be in place for all types of transfer facilities within the organization and between the organization and other parties.',
    guidance: 'Establish secure information transfer procedures.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.15',
    standardId: 'iso-27001',
    section: '5',
    code: '5.15',
    name: 'Access control',
    description: 'Rules to control physical and logical access to information and other associated assets shall be established and implemented based on business and information security requirements.',
    guidance: 'Implement comprehensive access control measures.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Security Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.16',
    standardId: 'iso-27001',
    section: '5',
    code: '5.16',
    name: 'Identity management',
    description: 'The full life cycle of identities shall be managed.',
    guidance: 'Implement identity lifecycle management.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Identity Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.17',
    standardId: 'iso-27001',
    section: '5',
    code: '5.17',
    name: 'Authentication information',
    description: 'Allocation and management of authentication information shall be controlled by a management process, including advising personnel on appropriate handling of authentication information.',
    guidance: 'Implement secure authentication management.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Identity Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.18',
    standardId: 'iso-27001',
    section: '5',
    code: '5.18',
    name: 'Access rights',
    description: "Access rights to information and other associated assets shall be provisioned, reviewed, modified and removed in accordance with the organization's topic-specific policy on and rules for access control.",
    guidance: 'Implement access rights management process.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Identity Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.19',
    standardId: 'iso-27001',
    section: '5',
    code: '5.19',
    name: 'Information security in supplier relationships',
    description: "Processes and procedures shall be defined and implemented to manage the information security risks associated with the use of supplier's products or services.",
    guidance: 'Implement supplier security management.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Procurement',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.20',
    standardId: 'iso-27001',
    section: '5',
    code: '5.20',
    name: 'Addressing information security within supplier agreements',
    description: 'Relevant information security requirements shall be established and agreed with each supplier based on the type of supplier relationship.',
    guidance: 'Include security requirements in supplier contracts.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Procurement',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.21',
    standardId: 'iso-27001',
    section: '5',
    code: '5.21',
    name: 'Managing information security in the ICT supply chain',
    description: 'Processes and procedures shall be defined and implemented to manage the information security risks associated with the ICT products and services supply chain.',
    guidance: 'Implement ICT supply chain security management.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Procurement',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.22',
    standardId: 'iso-27001',
    section: '5',
    code: '5.22',
    name: 'Monitoring, review and change management of supplier services',
    description: 'The organization shall regularly monitor, review, evaluate and manage change in supplier information security practices and service delivery.',
    guidance: 'Implement supplier security monitoring and review.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Procurement',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.23',
    standardId: 'iso-27001',
    section: '5',
    code: '5.23',
    name: 'Information security for use of cloud services',
    description: "Processes for acquisition, use, management and exit from cloud services shall be established in accordance with the organization's information security requirements.",
    guidance: 'Implement cloud security management.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Cloud Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.24',
    standardId: 'iso-27001',
    section: '5',
    code: '5.24',
    name: 'Information security incident management planning and preparation',
    description: 'The organization shall plan and prepare for managing information security incidents by defining, establishing and communicating information security incident management processes, roles and responsibilities.',
    guidance: 'Develop incident management plan.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Security Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.25',
    standardId: 'iso-27001',
    section: '5',
    code: '5.25',
    name: 'Assessment and decision on information security events',
    description: 'The organization shall assess information security events and decide if they are to be categorized as information security incidents.',
    guidance: 'Implement security event assessment process.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Security Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.26',
    standardId: 'iso-27001',
    section: '5',
    code: '5.26',
    name: 'Response to information security incidents',
    description: 'Information security incidents shall be responded to in accordance with the documented procedures.',
    guidance: 'Implement incident response procedures.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Security Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.27',
    standardId: 'iso-27001',
    section: '5',
    code: '5.27',
    name: 'Learning from information security incidents',
    description: 'Knowledge gained from information security incidents shall be used to strengthen and improve the information security controls.',
    guidance: 'Implement incident learning process.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Security Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.28',
    standardId: 'iso-27001',
    section: '5',
    code: '5.28',
    name: 'Collection of evidence',
    description: 'The organization shall establish and implement procedures for the identification, collection, acquisition and preservation of evidence related to information security events.',
    guidance: 'Implement evidence collection procedures.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Security Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.29',
    standardId: 'iso-27001',
    section: '5',
    code: '5.29',
    name: 'Information security during disruption',
    description: 'The organization shall plan how to maintain information security at an appropriate level during disruption.',
    guidance: 'Develop business continuity security plans.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Business Continuity',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.30',
    standardId: 'iso-27001',
    section: '5',
    code: '5.30',
    name: 'ICT readiness for business continuity',
    description: 'ICT readiness shall be planned, implemented, maintained and tested based on business continuity objectives and ICT continuity requirements.',
    guidance: 'Implement ICT continuity planning.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'IT Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.31',
    standardId: 'iso-27001',
    section: '5',
    code: '5.31',
    name: 'Legal, statutory, regulatory and contractual requirements',
    description: "Legal, statutory, regulatory and contractual requirements relevant to information security and the organization's approach to meet these requirements shall be identified, documented and kept up to date.",
    guidance: 'Maintain compliance requirements register.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Legal',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.32',
    standardId: 'iso-27001',
    section: '5',
    code: '5.32',
    name: 'Intellectual property rights',
    description: 'The organization shall implement appropriate procedures to protect intellectual property rights.',
    guidance: 'Implement IP protection procedures.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Legal',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.33',
    standardId: 'iso-27001',
    section: '5',
    code: '5.33',
    name: 'Protection of records',
    description: 'Records shall be protected from loss, destruction, falsification, unauthorized access and unauthorized release.',
    guidance: 'Implement records protection procedures.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Records Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.34',
    standardId: 'iso-27001',
    section: '5',
    code: '5.34',
    name: 'Privacy and protection of personal identifiable information (PII)',
    description: 'The organization shall identify and meet the requirements regarding the preservation of privacy and protection of PII according to applicable laws and regulations and contractual requirements.',
    guidance: 'Implement PII protection measures.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Privacy',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.35',
    standardId: 'iso-27001',
    section: '5',
    code: '5.35',
    name: 'Independent review of information security',
    description: "The organization's approach to managing information security and its implementation including people, processes and technologies shall be reviewed independently at planned intervals, or when significant changes occur.",
    guidance: 'Implement independent security reviews.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Internal Audit',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.36',
    standardId: 'iso-27001',
    section: '5',
    code: '5.36',
    name: 'Compliance with policies, rules and standards for information security',
    description: "Compliance with the organization's information security policy, topic-specific policies, rules and standards shall be regularly reviewed.",
    guidance: 'Implement compliance review process.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Compliance',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-5.37',
    standardId: 'iso-27001',
    section: '5',
    code: '5.37',
    name: 'Documented operating procedures',
    description: 'Operating procedures for information processing facilities shall be documented and made available to personnel who need them.',
    guidance: 'Document and maintain operating procedures.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'IT Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  // ISO 27002:2022 Control Requirements (A5 - Organizational Controls)
  {
    id: 'iso-27001-A5.1',
    standardId: 'iso-27002-2022',
    section: 'A5',
    code: 'A5.1',
    name: 'Information security policies',
    description: 'A set of policies for information security should be defined, approved by management, published and communicated to employees and relevant external parties.',
    guidance: 'Develop and maintain comprehensive information security policies.',
    auditReadyGuidance: `**Purpose**

A set of policies for information security should be defined, approved by management, published and communicated to employees and relevant external parties.

**Implementation**

* Define and document comprehensive information security policies approved by management

* Ensure policies are communicated to all employees and relevant external parties

* Review policies regularly and update when significant changes occur

* Consider the four domains: Organizational, People, Physical, and Technological controls`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Organizational Control',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A5.2',
    standardId: 'iso-27002-2022',
    section: 'A5',
    code: 'A5.2',
    name: 'Information security roles and responsibilities',
    description: 'Information security roles and responsibilities should be defined and allocated according to the organization\'s needs.',
    guidance: 'Define clear security roles and responsibilities throughout the organization.',
    auditReadyGuidance: `**Purpose**

Information security roles and responsibilities should be defined and allocated according to the organization\

**Implementation**

* Clearly define and document information security roles and responsibilities

* Ensure roles are aligned with organizational needs and structure

* Communicate responsibilities to all relevant personnel

* Include responsibilities for managing risks and ensuring compliance`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Organizational Control',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A5.3',
    standardId: 'iso-27002-2022',
    section: 'A5',
    code: 'A5.3',
    name: 'Segregation of duties',
    description: 'Conflicting duties and areas of responsibility should be segregated to reduce opportunities for unauthorized or unintentional modification or misuse of the organization\'s assets.',
    guidance: 'Implement separation of duties to prevent conflicts of interest.',
    auditReadyGuidance: `**Purpose**

Conflicting duties and areas of responsibility should be segregated to reduce opportunities for unauthorized or unintentional modification or misuse of the organization\

**Implementation**

* Identify and document conflicting duties and areas of responsibility

* Implement separation of duties to prevent conflicts of interest

* Ensure no single person can access, modify, or use assets without authorization

* Consider technical and procedural controls where segregation is difficult`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Organizational Control',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A5.4',
    standardId: 'iso-27002-2022',
    section: 'A5',
    code: 'A5.4',
    name: 'Management responsibilities',
    description: 'Management should require all employees and contractors to apply information security in accordance with the established policies and procedures of the organization.',
    guidance: 'Ensure management enforces security policies and procedures.',
    auditReadyGuidance: `**Purpose**

Management should require all employees and contractors to apply information security in accordance with the established policies and procedures of the organization.

**Implementation**

* Establish management oversight of information security policy

* Require management to enforce compliance with policies and procedures

* Ensure management leads by example in security practices

* Implement regular reporting on security compliance to management`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Organizational Control',
    responsibleParty: 'Executive Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A5.5',
    standardId: 'iso-27002-2022',
    section: 'A5',
    code: 'A5.5',
    name: 'Contact with authorities',
    description: 'Appropriate contacts with relevant authorities should be maintained.',
    guidance: 'Establish and maintain relationships with regulatory and law enforcement agencies.',
    auditReadyGuidance: `**Purpose**

Appropriate contacts with relevant authorities should be maintained.

**Implementation**

* Identify and document relevant authorities (e.g., law enforcement, regulatory bodies)

* Establish formal procedures for contacting authorities during incidents

* Maintain up-to-date contact information for authorities

* Conduct periodic reviews of authority relationships and procedures`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Organizational Control',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A5.6',
    standardId: 'iso-27002-2022',
    section: 'A5',
    code: 'A5.6',
    name: 'Contact with special interest groups',
    description: 'Appropriate contacts with special interest groups or other specialist security forums and professional associations should be maintained.',
    guidance: 'Participate in security communities and professional forums.',
    auditReadyGuidance: `**Purpose**

Appropriate contacts with special interest groups or other specialist security forums and professional associations should be maintained.

**Implementation**

* Identify relevant security forums and professional associations

* Establish formal memberships or relationships with these groups

* Implement procedures for sharing and receiving security information

* Regularly review the value and relevance of these relationships`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Organizational Control',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A5.7',
    standardId: 'iso-27002-2022',
    section: 'A5',
    code: 'A5.7',
    name: 'Threat intelligence',
    description: 'Information relating to information security threats should be collected and analyzed to produce threat intelligence.',
    guidance: 'Implement threat intelligence gathering and analysis processes.',
    auditReadyGuidance: `**Purpose**

Information relating to information security threats should be collected and analyzed to produce threat intelligence.

**Implementation**

* Establish formal processes for collecting threat intelligence information

* Implement tools and procedures for analyzing threat data

* Create mechanisms to distribute relevant threat intelligence internally

* Regularly review and update threat intelligence sources and processes`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Organizational Control',
    responsibleParty: 'Security Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A5.8',
    standardId: 'iso-27002-2022',
    section: 'A5',
    code: 'A5.8',
    name: 'Information security in project management',
    description: 'Information security should be integrated into project management, regardless of the type of the project.',
    guidance: 'Include security in all aspects of project management.',
    auditReadyGuidance: `**Purpose**

Information security should be integrated into project management, regardless of the type of the project.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Organizational Control',
    responsibleParty: 'Project Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A5.9',
    standardId: 'iso-27002-2022',
    section: 'A5',
    code: 'A5.9',
    name: 'Inventory of information and other associated assets',
    description: 'Assets associated with information and information processing facilities should be identified and an inventory of these assets should be drawn up and maintained.',
    guidance: 'Maintain a comprehensive asset inventory.',
    auditReadyGuidance: `**Purpose**

Assets associated with information and information processing facilities should be identified and an inventory of these assets should be drawn up and maintained.

**Implementation**

* Develop and maintain a comprehensive asset inventory system

* Include all information assets, hardware, software, and supporting services

* Assign ownership and classification to each asset

* Regularly update and validate the inventory`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Organizational Control',
    responsibleParty: 'IT Asset Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A5.10',
    standardId: 'iso-27002-2022',
    section: 'A5',
    code: 'A5.10',
    name: 'Acceptable use of information and other associated assets',
    description: 'Rules for the acceptable use of information and of assets associated with information and information processing facilities should be identified, documented and implemented.',
    guidance: 'Document and enforce acceptable use policies.',
    auditReadyGuidance: `**Purpose**

Rules for the acceptable use of information and of assets associated with information and information processing facilities should be identified, documented and implemented.

**Implementation**

* Define and document comprehensive information security policies approved by management

* Ensure policies are communicated to all employees and relevant external parties

* Review policies regularly and update when significant changes occur

* Consider the four domains: Organizational, People, Physical, and Technological controls`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Organizational Control',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A5.11',
    standardId: 'iso-27002-2022',
    section: 'A5',
    code: 'A5.11',
    name: 'Return of assets',
    description: 'All employees and external party users should return all organizational assets in their possession upon termination of their employment, contract or agreement.',
    guidance: 'Implement and enforce asset return procedures.',
    auditReadyGuidance: `**Purpose**

All employees and external party users should return all organizational assets in their possession upon termination of their employment, contract or agreement.

**Implementation**

* Define and document comprehensive information security policies approved by management

* Ensure policies are communicated to all employees and relevant external parties

* Review policies regularly and update when significant changes occur

* Consider the four domains: Organizational, People, Physical, and Technological controls`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Organizational Control',
    responsibleParty: 'HR',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A5.12',
    standardId: 'iso-27002-2022',
    section: 'A5',
    code: 'A5.12',
    name: 'Classification of information',
    description: 'Information should be classified in terms of legal requirements, value, criticality and sensitivity to unauthorized disclosure or modification.',
    guidance: 'Implement information classification scheme.',
    auditReadyGuidance: `**Purpose**

Information should be classified in terms of legal requirements, value, criticality and sensitivity to unauthorized disclosure or modification.

**Implementation**

* Define and document comprehensive information security policies approved by management

* Ensure policies are communicated to all employees and relevant external parties

* Review policies regularly and update when significant changes occur

* Consider the four domains: Organizational, People, Physical, and Technological controls`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Organizational Control',
    responsibleParty: 'Information Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A5.13',
    standardId: 'iso-27002-2022',
    section: 'A5',
    code: 'A5.13',
    name: 'Labelling of information',
    description: 'An appropriate set of procedures for information labelling should be developed and implemented in accordance with the information classification scheme adopted by the organization.',
    guidance: 'Develop and implement information labeling procedures.',
    auditReadyGuidance: `**Purpose**

An appropriate set of procedures for information labelling should be developed and implemented in accordance with the information classification scheme adopted by the organization.

**Implementation**

* Define and document comprehensive information security policies approved by management

* Ensure policies are communicated to all employees and relevant external parties

* Review policies regularly and update when significant changes occur

* Consider the four domains: Organizational, People, Physical, and Technological controls`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Organizational Control',
    responsibleParty: 'Information Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A5.14',
    standardId: 'iso-27002-2022',
    section: 'A5',
    code: 'A5.14',
    name: 'Information transfer',
    description: 'Formal transfer policies, procedures and controls should be in place to protect the transfer of information through the use of all types of communication facilities.',
    guidance: 'Establish secure information transfer procedures.',
    auditReadyGuidance: `**Purpose**

Formal transfer policies, procedures and controls should be in place to protect the transfer of information through the use of all types of communication facilities.

**Implementation**

* Define and document comprehensive information security policies approved by management

* Ensure policies are communicated to all employees and relevant external parties

* Review policies regularly and update when significant changes occur

* Consider the four domains: Organizational, People, Physical, and Technological controls`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Organizational Control',
    responsibleParty: 'Information Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A5.15',
    standardId: 'iso-27002-2022',
    section: 'A5',
    code: 'A5.15',
    name: 'Access control',
    description: 'Rules for controlling physical and logical access to information and information processing facilities should be established and implemented.',
    guidance: 'Implement comprehensive access control measures.',
    auditReadyGuidance: `**Purpose**

Rules for controlling physical and logical access to information and information processing facilities should be established and implemented.

**Implementation**

* Define and document comprehensive information security policies approved by management

* Ensure policies are communicated to all employees and relevant external parties

* Review policies regularly and update when significant changes occur

* Consider the four domains: Organizational, People, Physical, and Technological controls`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Organizational Control',
    responsibleParty: 'Access Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A5.16',
    standardId: 'iso-27002-2022',
    section: 'A5',
    code: 'A5.16',
    name: 'Identity management',
    description: 'The complete lifecycle of identities should be managed, from initial registration through to final deprovisioning.',
    guidance: 'Implement comprehensive identity lifecycle management.',
    auditReadyGuidance: `**Purpose**

The complete lifecycle of identities should be managed, from initial registration through to final deprovisioning.

**Implementation**

* Define and document comprehensive information security policies approved by management

* Ensure policies are communicated to all employees and relevant external parties

* Review policies regularly and update when significant changes occur

* Consider the four domains: Organizational, People, Physical, and Technological controls`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Organizational Control',
    responsibleParty: 'Identity Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  // Continue with more A5.x controls and then A6, A7, A8 sections
  
  // Adding just a few more as examples - in a real implementation, all controls would be added
  
  // A6 - People Controls (examples)
  {
    id: 'iso-27001-A6.1',
    standardId: 'iso-27002-2022',
    section: 'A6',
    code: 'A6.1',
    name: 'Screening',
    description: 'Background verification checks on all candidates for employment should be carried out in accordance with relevant laws, regulations and ethics and should be proportional to the business requirements, the classification of the information to be accessed and the perceived risks.',
    guidance: 'Implement personnel screening procedures.',
    auditReadyGuidance: `**Purpose**

Background verification checks on all candidates for employment should be carried out in accordance with relevant laws, regulations and ethics and should be proportional to the business requirements, the classification of the information to be accessed and the perceived risks.

**Implementation**

* Implement background verification checks in accordance with laws and regulations

* Scale verification depth based on role sensitivity and information access

* Document screening procedures and requirements

* Review and update screening processes regularly`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 People Control',
    responsibleParty: 'HR',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A6.2',
    standardId: 'iso-27002-2022',
    section: 'A6',
    code: 'A6.2',
    name: 'Terms and conditions of employment',
    description: 'The contractual agreements with employees and contractors should state their and the organization\'s responsibilities for information security.',
    guidance: 'Include security responsibilities in employment contracts.',
    auditReadyGuidance: `**Purpose**

The contractual agreements with employees and contractors should state their and the organization\

**Implementation**

* Include information security responsibilities in employment contracts

* Ensure terms apply before granting access to sensitive information

* Clearly define consequences of non-compliance

* Update terms when roles or responsibilities change`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 People Control',
    responsibleParty: 'HR',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  
  // A7 - Physical Controls (examples)
  {
    id: 'iso-27001-A7.1',
    standardId: 'iso-27002-2022',
    section: 'A7',
    code: 'A7.1',
    name: 'Physical security perimeters',
    description: 'Security perimeters should be defined and used to protect areas that contain either sensitive or critical information or information processing facilities.',
    guidance: 'Establish physical security boundaries.',
    auditReadyGuidance: `**Purpose**

Security perimeters should be defined and used to protect areas that contain either sensitive or critical information or information processing facilities.

**Implementation**

* Define clear security perimeters for areas with sensitive information

* Implement appropriate physical barriers and entry controls

* Document perimeter security requirements

* Regularly review and test perimeter security effectiveness`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Physical Control',
    responsibleParty: 'Physical Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A7.2',
    standardId: 'iso-27002-2022',
    section: 'A7',
    code: 'A7.2',
    name: 'Physical entry',
    description: 'Secure areas should be protected by appropriate entry controls to ensure that only authorized personnel are allowed access.',
    guidance: 'Implement physical access controls.',
    auditReadyGuidance: `**Purpose**

Secure areas should be protected by appropriate entry controls to ensure that only authorized personnel are allowed access.

**Implementation**

* Implement appropriate entry controls based on area sensitivity

* Use multi-factor authentication for highly sensitive areas

* Maintain logs of all access to secure areas

* Regularly review and audit access records`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Physical Control',
    responsibleParty: 'Physical Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  
  // A8 - Technological Controls (examples)
  {
    id: 'iso-27001-A8.1',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.1',
    name: 'User endpoint devices',
    description: 'A policy should be established and appropriate security measures implemented for the protection of information accessed, processed or stored at user endpoint devices.',
    guidance: 'Implement endpoint security controls.',
    auditReadyGuidance: `**Purpose**

A policy should be established and appropriate security measures implemented for the protection of information accessed, processed or stored at user endpoint devices.

**Implementation**

* Develop and implement endpoint security policies and procedures

* Include requirements for encryption, authentication, and access controls

* Implement technical controls through MDM or other management tools

* Regularly audit compliance with endpoint policies`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Endpoint Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.2',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.2',
    name: 'Privileged access rights',
    description: 'The allocation and use of privileged access rights should be restricted and controlled.',
    guidance: 'Implement privileged access management.',
    auditReadyGuidance: `**Purpose**

The allocation and use of privileged access rights should be restricted and controlled.

**Implementation**

* Implement strict controls for privileged account management

* Restrict and monitor privileged access allocation

* Use just-in-time access where possible

* Review privileged access rights regularly`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Access Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  
  {
    id: 'iso-27001-A8.3',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.3',
    name: 'Information access restriction',
    description: 'Access to information and application functions should be restricted in accordance with the access control policy.',
    guidance: 'Implement application-level access controls.',
    auditReadyGuidance: `**Purpose**

Access to information and application functions should be restricted in accordance with the access control policy.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Application Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.4',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.4',
    name: 'Access to source code',
    description: 'Access to source code should be restricted.',
    guidance: 'Implement source code access controls and secure repositories.',
    auditReadyGuidance: `**Purpose**

Access to source code should be restricted.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Development Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.5',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.5',
    name: 'Secure authentication',
    description: 'Authentication information should be protected by techniques appropriate to the level of risk.',
    guidance: 'Implement secure authentication mechanisms.',
    auditReadyGuidance: `**Purpose**

Authentication information should be protected by techniques appropriate to the level of risk.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Identity Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.6',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.6',
    name: 'Capacity management',
    description: 'The use of resources should be monitored and adjusted in line with current and expected capacity requirements.',
    guidance: 'Implement capacity management processes and monitoring.',
    auditReadyGuidance: `**Purpose**

The use of resources should be monitored and adjusted in line with current and expected capacity requirements.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'IT Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.7',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.7',
    name: 'Protection against malware',
    description: 'Protection against malware should be implemented and supported by appropriate user awareness.',
    guidance: 'Implement anti-malware solutions and user awareness training.',
    auditReadyGuidance: `**Purpose**

Protection against malware should be implemented and supported by appropriate user awareness.

**Implementation**

* Implement multi-layered anti-malware protection

* Include technical controls and user awareness

* Keep protection mechanisms updated

* Regularly test effectiveness against current threats`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Security Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.8',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.8',
    name: 'Management of technical vulnerabilities',
    description: 'Information about technical vulnerabilities of information systems in use should be obtained, the organization\'s exposure to such vulnerabilities should be evaluated and appropriate measures should be taken.',
    guidance: 'Implement vulnerability management processes.',
    auditReadyGuidance: `**Purpose**

Information about technical vulnerabilities of information systems in use should be obtained, the organization\

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Security Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.9',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.9',
    name: 'Configuration management',
    description: 'Configurations, including security configurations, of hardware, software, services and networks should be established, documented, implemented, monitored and reviewed.',
    guidance: 'Implement configuration management processes.',
    auditReadyGuidance: `**Purpose**

Configurations, including security configurations, of hardware, software, services and networks should be established, documented, implemented, monitored and reviewed.

**Implementation**

* Establish baseline configurations for all systems and networks

* Document, implement, and monitor configuration standards

* Use automation for configuration compliance checking

* Regularly review and update baseline configurations`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'IT Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.10',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.10',
    name: 'Information deletion',
    description: 'Information, software and systems should be disposed of or deleted in a way that protects the information from unauthorized disclosure.',
    guidance: 'Implement secure data deletion procedures.',
    auditReadyGuidance: `**Purpose**

Information, software and systems should be disposed of or deleted in a way that protects the information from unauthorized disclosure.

**Implementation**

* Develop and implement endpoint security policies and procedures

* Include requirements for encryption, authentication, and access controls

* Implement technical controls through MDM or other management tools

* Regularly audit compliance with endpoint policies`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Information Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.11',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.11',
    name: 'Data masking',
    description: 'Data masking should be applied in accordance with the organization\'s policy on access control, legal, statutory, regulatory and contractual requirements.',
    guidance: 'Implement data masking techniques for sensitive information.',
    auditReadyGuidance: `**Purpose**

Data masking should be applied in accordance with the organization\

**Implementation**

* Develop and implement endpoint security policies and procedures

* Include requirements for encryption, authentication, and access controls

* Implement technical controls through MDM or other management tools

* Regularly audit compliance with endpoint policies`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Data Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.12',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.12',
    name: 'Data leakage prevention',
    description: 'Data leakage prevention should be applied to systems, networks and endpoint devices that process, store or transmit sensitive information.',
    guidance: 'Implement data loss prevention (DLP) solutions.',
    auditReadyGuidance: `**Purpose**

Data leakage prevention should be applied to systems, networks and endpoint devices that process, store or transmit sensitive information.

**Implementation**

* Develop and implement endpoint security policies and procedures

* Include requirements for encryption, authentication, and access controls

* Implement technical controls through MDM or other management tools

* Regularly audit compliance with endpoint policies`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Data Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.13',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.13',
    name: 'Information backup',
    description: 'Backup copies of information, software and systems should be taken and regularly tested in accordance with the organization\'s policy.',
    guidance: 'Implement comprehensive backup solutions with regular testing.',
    auditReadyGuidance: `**Purpose**

Backup copies of information, software and systems should be taken and regularly tested in accordance with the organization\

**Implementation**

* Develop and implement endpoint security policies and procedures

* Include requirements for encryption, authentication, and access controls

* Implement technical controls through MDM or other management tools

* Regularly audit compliance with endpoint policies`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'IT Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.14',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.14',
    name: 'Redundancy of information processing facilities',
    description: 'Information processing facilities should be implemented with redundancy sufficient to meet availability requirements.',
    guidance: 'Implement redundant systems for critical services.',
    auditReadyGuidance: `**Purpose**

Information processing facilities should be implemented with redundancy sufficient to meet availability requirements.

**Implementation**

* Develop and implement endpoint security policies and procedures

* Include requirements for encryption, authentication, and access controls

* Implement technical controls through MDM or other management tools

* Regularly audit compliance with endpoint policies`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'IT Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.15',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.15',
    name: 'Logging',
    description: 'Logs that record user activities, exceptions, faults and information security events should be produced, stored, protected and analyzed.',
    guidance: 'Implement comprehensive logging across systems and networks.',
    auditReadyGuidance: `**Purpose**

Logs that record user activities, exceptions, faults and information security events should be produced, stored, protected and analyzed.

**Implementation**

* Develop and implement endpoint security policies and procedures

* Include requirements for encryption, authentication, and access controls

* Implement technical controls through MDM or other management tools

* Regularly audit compliance with endpoint policies`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Security Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.16',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.16',
    name: 'Monitoring activities',
    description: 'Networks, systems and applications should be monitored for anomalous behavior and appropriate actions taken to evaluate potential information security incidents.',
    guidance: 'Implement security monitoring and anomaly detection.',
    auditReadyGuidance: `**Purpose**

Networks, systems and applications should be monitored for anomalous behavior and appropriate actions taken to evaluate potential information security incidents.

**Implementation**

* Develop and implement endpoint security policies and procedures

* Include requirements for encryption, authentication, and access controls

* Implement technical controls through MDM or other management tools

* Regularly audit compliance with endpoint policies`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Security Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.17',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.17',
    name: 'Clock synchronization',
    description: 'The clocks of all relevant information processing systems within an organization or security domain should be synchronized to a single reference time source.',
    guidance: 'Implement time synchronization across all systems.',
    auditReadyGuidance: `**Purpose**

The clocks of all relevant information processing systems within an organization or security domain should be synchronized to a single reference time source.

**Implementation**

* Develop and implement endpoint security policies and procedures

* Include requirements for encryption, authentication, and access controls

* Implement technical controls through MDM or other management tools

* Regularly audit compliance with endpoint policies`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'IT Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.18',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.18',
    name: 'Use of privileged utility programs',
    description: 'The use of utility programs that might be capable of overriding system and application controls should be restricted and controlled.',
    guidance: 'Control access to and usage of privileged utility programs.',
    auditReadyGuidance: `**Purpose**

The use of utility programs that might be capable of overriding system and application controls should be restricted and controlled.

**Implementation**

* Develop and implement endpoint security policies and procedures

* Include requirements for encryption, authentication, and access controls

* Implement technical controls through MDM or other management tools

* Regularly audit compliance with endpoint policies`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Security Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.19',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.19',
    name: 'Installation of software on operational systems',
    description: 'Procedures should be implemented to control the installation of software on operational systems.',
    guidance: 'Implement software installation controls.',
    auditReadyGuidance: `**Purpose**

Procedures should be implemented to control the installation of software on operational systems.

**Implementation**

* Develop and implement endpoint security policies and procedures

* Include requirements for encryption, authentication, and access controls

* Implement technical controls through MDM or other management tools

* Regularly audit compliance with endpoint policies`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'IT Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.20',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.20',
    name: 'Networks security',
    description: 'Networks and network devices should be secured, managed and controlled to protect information in systems and applications.',
    guidance: 'Implement comprehensive network security controls.',
    auditReadyGuidance: `**Purpose**

Networks and network devices should be secured, managed and controlled to protect information in systems and applications.

**Implementation**

* Implement strict controls for privileged account management

* Restrict and monitor privileged access allocation

* Use just-in-time access where possible

* Review privileged access rights regularly`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Network Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.21',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.21',
    name: 'Security of network services',
    description: 'Security mechanisms, service levels and management requirements of all network services should be identified, implemented and monitored.',
    guidance: 'Define and enforce security requirements for network services.',
    auditReadyGuidance: `**Purpose**

Security mechanisms, service levels and management requirements of all network services should be identified, implemented and monitored.

**Implementation**

* Implement strict controls for privileged account management

* Restrict and monitor privileged access allocation

* Use just-in-time access where possible

* Review privileged access rights regularly`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Network Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.22',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.22',
    name: 'Segregation of networks',
    description: 'Groups of information services, users and information systems should be segregated on networks.',
    guidance: 'Implement network segmentation.',
    auditReadyGuidance: `**Purpose**

Groups of information services, users and information systems should be segregated on networks.

**Implementation**

* Implement strict controls for privileged account management

* Restrict and monitor privileged access allocation

* Use just-in-time access where possible

* Review privileged access rights regularly`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Network Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.23',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.23',
    name: 'Web filtering',
    description: 'Access to external websites should be managed to reduce exposure to malicious content.',
    guidance: 'Implement web filtering and content control.',
    auditReadyGuidance: `**Purpose**

Access to external websites should be managed to reduce exposure to malicious content.

**Implementation**

* Implement strict controls for privileged account management

* Restrict and monitor privileged access allocation

* Use just-in-time access where possible

* Review privileged access rights regularly`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Network Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.24',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.24',
    name: 'Use of cryptography',
    description: 'Rules for the effective use of cryptography should be developed and implemented to protect the confidentiality, authenticity and/or integrity of information.',
    guidance: 'Implement cryptographic controls and policies.',
    auditReadyGuidance: `**Purpose**

Rules for the effective use of cryptography should be developed and implemented to protect the confidentiality, authenticity and/or integrity of information.

**Implementation**

* Implement strict controls for privileged account management

* Restrict and monitor privileged access allocation

* Use just-in-time access where possible

* Review privileged access rights regularly`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Cryptography Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.25',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.25',
    name: 'Secure development lifecycle',
    description: 'Rules for the development of software and systems should be established and applied to developments within the organization.',
    guidance: 'Implement secure development lifecycle practices.',
    auditReadyGuidance: `**Purpose**

Rules for the development of software and systems should be established and applied to developments within the organization.

**Implementation**

* Implement strict controls for privileged account management

* Restrict and monitor privileged access allocation

* Use just-in-time access where possible

* Review privileged access rights regularly`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Development Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.26',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.26',
    name: 'Application security requirements',
    description: 'Security requirements should be identified, specified and approved when developing or acquiring applications.',
    guidance: 'Define security requirements for applications.',
    auditReadyGuidance: `**Purpose**

Security requirements should be identified, specified and approved when developing or acquiring applications.

**Implementation**

* Implement strict controls for privileged account management

* Restrict and monitor privileged access allocation

* Use just-in-time access where possible

* Review privileged access rights regularly`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Application Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.27',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.27',
    name: 'Secure system architecture and engineering principles',
    description: 'Principles for engineering secure systems should be established, documented, maintained and applied to any information system development.',
    guidance: 'Implement secure-by-design principles.',
    auditReadyGuidance: `**Purpose**

Principles for engineering secure systems should be established, documented, maintained and applied to any information system development.

**Implementation**

* Implement strict controls for privileged account management

* Restrict and monitor privileged access allocation

* Use just-in-time access where possible

* Review privileged access rights regularly`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Development Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.28',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.28',
    name: 'Secure coding',
    description: 'Secure coding principles should be applied to software development.',
    guidance: 'Implement secure coding practices and standards.',
    auditReadyGuidance: `**Purpose**

Secure coding principles should be applied to software development.

**Implementation**

* Implement strict controls for privileged account management

* Restrict and monitor privileged access allocation

* Use just-in-time access where possible

* Review privileged access rights regularly`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Development Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.29',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.29',
    name: 'Security testing in development and acceptance',
    description: 'Security testing processes should be defined and implemented in the development lifecycle.',
    guidance: 'Implement security testing as part of the development process.',
    auditReadyGuidance: `**Purpose**

Security testing processes should be defined and implemented in the development lifecycle.

**Implementation**

* Implement strict controls for privileged account management

* Restrict and monitor privileged access allocation

* Use just-in-time access where possible

* Review privileged access rights regularly`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Application Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.30',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.30',
    name: 'Outsourced development',
    description: 'The organization should supervise and monitor the activity of outsourced system development.',
    guidance: 'Establish security requirements for outsourced development.',
    auditReadyGuidance: `**Purpose**

The organization should supervise and monitor the activity of outsourced system development.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Development Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.31',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.31',
    name: 'Separation of development, test and production environments',
    description: 'Development, test and production environments should be separated and secured.',
    guidance: 'Implement environment separation.',
    auditReadyGuidance: `**Purpose**

Development, test and production environments should be separated and secured.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'IT Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.32',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.32',
    name: 'Change management',
    description: 'Changes to the organization, business processes, information processing facilities and systems that affect information security should be controlled.',
    guidance: 'Implement security change management processes.',
    auditReadyGuidance: `**Purpose**

Changes to the organization, business processes, information processing facilities and systems that affect information security should be controlled.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Change Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.33',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.33',
    name: 'Test information',
    description: 'Test information should be carefully selected, protected and controlled.',
    guidance: 'Implement controls for test data.',
    auditReadyGuidance: `**Purpose**

Test information should be carefully selected, protected and controlled.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Development Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.34',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.34',
    name: 'Protection of information systems during audit testing',
    description: 'Audit requirements involving verification of operational systems should be carefully planned and agreed to minimize disruptions.',
    guidance: 'Plan and manage security testing and audits.',
    auditReadyGuidance: `**Purpose**

Audit requirements involving verification of operational systems should be carefully planned and agreed to minimize disruptions.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Security Testing',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  
  // Note: In a real implementation, all controls from A5.1 to A8.34 would be added
  // For brevity, we've only included some examples from each section
  
  // ... existing requirements ...
  {
    id: 'iso-27001-6.2',
    standardId: 'iso-27001',
    section: '6',
    code: '6.2',
    name: 'Information security objectives and planning to achieve them',
    description: 'The organization shall establish information security objectives at relevant functions and levels. The information security objectives shall: a) be consistent with the information security policy; b) be measurable (if practicable); c) take into account applicable information security requirements, and results from risk assessment and risk treatment; d) be communicated; and e) be updated as appropriate. The organization shall retain documented information on the information security objectives. When planning how to achieve its information security objectives, the organization shall determine: f) what will be done; g) what resources will be required; h) who will be responsible; i) when it will be completed; j) how the results will be evaluated.',
    guidance: 'Set measurable security objectives and plan how to achieve them.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-6.3',
    standardId: 'iso-27001',
    section: '6',
    code: '6.3',
    name: 'Planning of changes',
    description: 'When the organization determines the need for changes to the information security management system, the changes shall be carried out in a planned manner.',
    guidance: 'Plan and manage changes to the ISMS in a controlled manner.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-7.1',
    standardId: 'iso-27001',
    section: '7',
    code: '7.1',
    name: 'Resources',
    description: 'The organization shall determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the information security management system.',
    guidance: 'Allocate sufficient resources to support the ISMS.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-7.2',
    standardId: 'iso-27001',
    section: '7',
    code: '7.2',
    name: 'Competence',
    description: 'The organization shall: a) determine the necessary competence of person(s) doing work under its control that affects its information security performance; b) ensure that these persons are competent on the basis of appropriate education, training, or experience; c) where applicable, take actions to acquire the necessary competence, and evaluate the effectiveness of the actions taken; d) retain appropriate documented information as evidence of competence.',
    guidance: 'Ensure personnel have appropriate security skills and training.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-7.3',
    standardId: 'iso-27001',
    section: '7',
    code: '7.3',
    name: 'Awareness',
    description: 'Persons doing work under the organization\'s control shall be aware of: a) the information security policy; b) their contribution to the effectiveness of the information security management system, including the benefits of improved information security performance; c) the implications of not conforming with the information security management system requirements.',
    guidance: 'Ensure all personnel are aware of security policies and their role.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-7.4',
    standardId: 'iso-27001',
    section: '7',
    code: '7.4',
    name: 'Communication',
    description: 'The organization shall determine the need for internal and external communications relevant to the information security management system including: a) on what to communicate; b) when to communicate; c) with whom to communicate; d) who shall communicate; e) the processes by which communication shall be effected.',
    guidance: 'Establish internal and external security communication processes.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-7.5.1',
    standardId: 'iso-27001',
    section: '7',
    code: '7.5.1',
    name: 'General',
    description: 'The organization\'s information security management system shall include: a) documented information required by this document; b) documented information determined by the organization as being necessary for the effectiveness of the information security management system.',
    guidance: 'Maintain required documentation for the ISMS.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-7.5.2',
    standardId: 'iso-27001',
    section: '7',
    code: '7.5.2',
    name: 'Creating and updating',
    description: 'When creating and updating documented information the organization shall ensure appropriate: a) identification and description (e.g. a title, date, author, or reference number); b) format (e.g. language, software version, graphics) and media (e.g. paper, electronic); c) review and approval for suitability and adequacy.',
    guidance: 'Establish processes for creating and updating ISMS documentation.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-7.5.3',
    standardId: 'iso-27001',
    section: '7',
    code: '7.5.3',
    name: 'Control of documented information',
    description: 'Documented information required by the information security management system and by this document shall be controlled to ensure: a) it is available and suitable for use, where and when it is needed; b) it is adequately protected (e.g. from loss of confidentiality, improper use, or loss of integrity). For the control of documented information, the organization shall address the following activities, as applicable: c) distribution, access, retrieval and use; d) storage and preservation, including the preservation of legibility; e) control of changes (e.g. version control); f) retention and disposition. Documented information of external origin, determined by the organization to be necessary for the planning and operation of the information security management system, shall be identified as appropriate, and controlled.',
    guidance: 'Implement controls for ISMS documentation.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-8.1',
    standardId: 'iso-27001',
    section: '8',
    code: '8.1',
    name: 'Operational planning and control',
    description: 'The organization shall plan, implement and control the processes needed to meet information security requirements, and to implement the actions determined in 6.1. The organization shall also implement plans to achieve information security objectives determined in 6.2. The organization shall keep documented information to the extent necessary to have confidence that the processes have been carried out as planned. The organization shall control planned changes and review the consequences of unintended changes, taking action to mitigate any adverse effects, as necessary. The organization shall ensure that outsourced processes are determined and controlled.',
    guidance: 'Plan and control security operations, including outsourced processes.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-8.2',
    standardId: 'iso-27001',
    section: '8',
    code: '8.2',
    name: 'Information security risk assessment',
    description: 'The organization shall perform information security risk assessments at planned intervals or when significant changes are proposed or occur, taking account of the criteria established in 6.1.2 a). The organization shall retain documented information of the results of the information security risk assessments.',
    guidance: 'Conduct regular information security risk assessments.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-8.3',
    standardId: 'iso-27001',
    section: '8',
    code: '8.3',
    name: 'Information security risk treatment',
    description: 'The organization shall implement the information security risk treatment plan. The organization shall retain documented information of the results of the information security risk treatment.',
    guidance: 'Implement and monitor risk treatment plans.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-9.1',
    standardId: 'iso-27001',
    section: '9',
    code: '9.1',
    name: 'Monitoring, measurement, analysis and evaluation',
    description: 'The organization shall evaluate the information security performance and the effectiveness of the information security management system. The organization shall determine: a) what needs to be monitored and measured, including information security processes and controls; b) the methods for monitoring, measurement, analysis and evaluation, as applicable, to ensure valid results; c) when the monitoring and measuring shall be performed; d) who shall monitor and measure; e) when the results from monitoring and measurement shall be analysed and evaluated; f) who shall analyse and evaluate these results. The organization shall retain appropriate documented information as evidence of the monitoring and measurement results.',
    guidance: 'Establish processes to monitor and evaluate security performance.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-9.2.1',
    standardId: 'iso-27001',
    section: '9',
    code: '9.2.1',
    name: 'Internal audit - General',
    description: 'The organization shall conduct internal audits at planned intervals to provide information on whether the information security management system: a) conforms to: 1) the organization\'s own requirements for its information security management system; 2) the requirements of this document; b) is effectively implemented and maintained.',
    guidance: 'Conduct regular internal audits of the ISMS.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Internal Audit',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-9.2.2',
    standardId: 'iso-27001',
    section: '9',
    code: '9.2.2',
    name: 'Internal audit programme',
    description: 'The organization shall: a) plan, establish, implement and maintain an audit programme(s) including the frequency, methods, responsibilities, planning requirements and reporting, which shall take into consideration the importance of the processes concerned and the results of previous audits; b) define the audit criteria and scope for each audit; c) select auditors and conduct audits to ensure objectivity and the impartiality of the audit process; d) ensure that the results of the audits are reported to relevant management; e) retain documented information as evidence of the implementation of the audit programme and the audit results.',
    guidance: 'Create and maintain an ISMS audit program.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Internal Audit',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-9.3.1',
    standardId: 'iso-27001',
    section: '9',
    code: '9.3.1',
    name: 'Management review - General',
    description: 'Top management shall review the organization\'s information security management system at planned intervals to ensure its continuing suitability, adequacy and effectiveness.',
    guidance: 'Ensure regular management reviews of the ISMS.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Executive Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-9.3.2',
    standardId: 'iso-27001',
    section: '9',
    code: '9.3.2',
    name: 'Management review inputs',
    description: 'The management review shall include consideration of: a) the status of actions from previous management reviews; b) changes in external and internal issues that are relevant to the information security management system; c) feedback on the information security performance, including trends in: 1) nonconformities and corrective actions; 2) monitoring and measurement results; 3) audit results; 4) fulfilment of information security objectives; d) feedback from interested parties; e) results of risk assessment and status of risk treatment plan; f) opportunities for continual improvement.',
    guidance: 'Include all required inputs in management reviews.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Executive Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-9.3.3',
    standardId: 'iso-27001',
    section: '9',
    code: '9.3.3',
    name: 'Management review results',
    description: 'The results of the management review shall include decisions related to continual improvement opportunities and any needs for changes to the information security management system. The organization shall retain documented information as evidence of the results of management reviews.',
    guidance: 'Document and act on management review decisions.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'Executive Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-10.1',
    standardId: 'iso-27001',
    section: '10',
    code: '10.1',
    name: 'Continual improvement',
    description: 'The organization shall continually improve the suitability, adequacy and effectiveness of the information security management system.',
    guidance: 'Continuously improve the ISMS.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-10.2',
    standardId: 'iso-27001',
    section: '10',
    code: '10.2',
    name: 'Nonconformity and corrective action',
    description: 'When a nonconformity occurs, the organization shall: a) react to the nonconformity, and as applicable: 1) take action to control and correct it; 2) deal with the consequences; b) evaluate the need for action to eliminate the causes of nonconformity, in order that it does not recur or occur elsewhere, by: 1) reviewing the nonconformity; 2) determining the causes of the nonconformity; 3) determining if similar nonconformities exist, or could potentially occur; c) implement any action needed; d) review the effectiveness of any corrective action taken; e) make changes to the information security management system, if necessary. Corrective actions shall be appropriate to the effects of the nonconformities encountered. The organization shall retain documented information as evidence of: f) the nature of the nonconformities and any subsequent actions taken; g) the results of any corrective action.',
    guidance: 'Address nonconformities with appropriate corrective actions.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-6.1.1',
    standardId: 'iso-27001',
    section: '6',
    code: '6.1.1',
    name: 'General',
    description: 'When planning for the information security management system, the organization shall consider the issues referred to in 4.1 and the requirements referred to in 4.2 and determine the risks and opportunities that need to be addressed to: a) ensure the information security management system can achieve its intended outcome(s); b) prevent, or reduce, undesired effects; c) achieve continual improvement. The organization shall plan: d) actions to address these risks and opportunities; e) how to integrate and implement the actions into its information security management system processes; f) how to evaluate the effectiveness of these actions.',
    guidance: 'Consider organizational context when planning the ISMS and address risks and opportunities.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-6.1.2',
    standardId: 'iso-27001',
    section: '6',
    code: '6.1.2',
    name: 'Information security risk assessment',
    description: 'The organization shall define and apply an information security risk assessment process that: a) establishes and maintains information security risk criteria that include: 1) the risk acceptance criteria; 2) criteria for performing information security risk assessments; b) ensures that repeated information security risk assessments produce consistent, valid and comparable results; c) identifies the information security risks: 1) applies the information security risk assessment process to identify risks associated with the loss of confidentiality, integrity and availability for information within the scope of the information security management system; 2) identifies the risk owners; d) analyses the information security risks: 1) assesses the potential consequences that would result if the risks identified in 6.1.2 c) 1) were to materialize; 2) assesses the realistic likelihood of the occurrence of the risks identified in 6.1.2 c) 1); 3) determines the levels of risk; e) evaluates the information security risks: 1) compares the results of risk analysis with the risk criteria established in 6.1.2 a); 2) prioritizes the analysed risks for risk treatment. The organization shall retain documented information about the information security risk assessment process.',
    guidance: 'Implement a formal process for assessing information security risks.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-6.1.3',
    standardId: 'iso-27001',
    section: '6',
    code: '6.1.3',
    name: 'Information security risk treatment',
    description: 'The organization shall define and apply an information security risk treatment process to: a) select appropriate information security risk treatment options, taking account of the risk assessment results; b) determine all controls that are necessary to implement the information security risk treatment option(s) chosen; c) compare the controls determined in 6.1.3 b) above with those in Annex A and verify that no necessary controls have been omitted; d) produce a Statement of Applicability that contains the necessary controls (see 6.1.3 b) and c)) and justification for inclusions, whether they are implemented or not, and the justification for exclusions of controls from Annex A; e) formulate an information security risk treatment plan; and f) obtain risk owners\' approval of the information security risk treatment plan and acceptance of the residual information security risks. The organization shall retain documented information about the information security risk treatment process.',
    guidance: 'Develop and implement a risk treatment process to address identified risks.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27001:2022 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A6.3',
    standardId: 'iso-27002-2022',
    section: 'A6',
    code: 'A6.3',
    name: 'Information security awareness, education and training',
    description: 'All employees and relevant interested parties should receive appropriate information security awareness, education and training and regular updates in organizational policies and procedures.',
    guidance: 'Implement security awareness and training programs.',
    auditReadyGuidance: `**Purpose**

All employees and relevant interested parties should receive appropriate information security awareness, education and training and regular updates in organizational policies and procedures.

**Implementation**

* Develop a comprehensive security awareness program

* Include regular training, updates, and awareness communications

* Tailor training to specific roles and responsibilities

* Measure effectiveness through testing and practical assessments`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 People Control',
    responsibleParty: 'Security Awareness',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A6.4',
    standardId: 'iso-27002-2022',
    section: 'A6',
    code: 'A6.4',
    name: 'Disciplinary process',
    description: 'A disciplinary process should be established to address violations of information security policy or rules.',
    guidance: 'Define and enforce consequences for security violations.',
    auditReadyGuidance: `**Purpose**

A disciplinary process should be established to address violations of information security policy or rules.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 People Control',
    responsibleParty: 'HR',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A6.5',
    standardId: 'iso-27002-2022',
    section: 'A6',
    code: 'A6.5',
    name: 'Responsibilities after termination or change of employment',
    description: 'Information security responsibilities and duties that remain valid after termination or change of employment should be defined, enforced and communicated to the employee or contractor.',
    guidance: 'Define and enforce post-employment security responsibilities.',
    auditReadyGuidance: `**Purpose**

Information security responsibilities and duties that remain valid after termination or change of employment should be defined, enforced and communicated to the employee or contractor.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 People Control',
    responsibleParty: 'HR',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A6.6',
    standardId: 'iso-27002-2022',
    section: 'A6',
    code: 'A6.6',
    name: 'Confidentiality or non-disclosure agreements',
    description: 'Confidentiality or non-disclosure agreements reflecting the organization\'s needs for the protection of information should be identified, documented, regularly reviewed and signed by employees and external parties.',
    guidance: 'Implement appropriate confidentiality agreements.',
    auditReadyGuidance: `**Purpose**

Confidentiality or non-disclosure agreements reflecting the organization\

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 People Control',
    responsibleParty: 'Legal',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A6.7',
    standardId: 'iso-27002-2022',
    section: 'A6',
    code: 'A6.7',
    name: 'Remote working',
    description: 'Security measures should be implemented to protect information accessed, processed or stored at remote working locations.',
    guidance: 'Implement remote work security controls.',
    auditReadyGuidance: `**Purpose**

Security measures should be implemented to protect information accessed, processed or stored at remote working locations.

**Implementation**

* Establish formal policies and procedures for secure remote working

* Address physical, environmental, and communication security requirements

* Implement technical controls for remote access and data protection

* Regularly review and update remote working arrangements`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 People Control',
    responsibleParty: 'Security Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A6.8',
    standardId: 'iso-27002-2022',
    section: 'A6',
    code: 'A6.8',
    name: 'Information security event reporting',
    description: 'The organization should provide mechanisms for reporting information security events and weaknesses.',
    guidance: 'Implement security incident reporting processes.',
    auditReadyGuidance: `**Purpose**

The organization should provide mechanisms for reporting information security events and weaknesses.

**Implementation**

* Establish formal procedures for reporting security events and weaknesses

* Implement multiple reporting channels for different types of incidents

* Ensure all personnel understand reporting responsibilities

* Regularly test reporting mechanisms and response procedures`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 People Control',
    responsibleParty: 'Security Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  
  // A7 - Physical Controls (examples)
  {
    id: 'iso-27001-A7.1',
    standardId: 'iso-27002-2022',
    section: 'A7',
    code: 'A7.1',
    name: 'Physical security perimeters',
    description: 'Security perimeters should be defined and used to protect areas that contain either sensitive or critical information or information processing facilities.',
    guidance: 'Establish physical security boundaries.',
    auditReadyGuidance: `**Purpose**

Security perimeters should be defined and used to protect areas that contain either sensitive or critical information or information processing facilities.

**Implementation**

* Define clear security perimeters for areas with sensitive information

* Implement appropriate physical barriers and entry controls

* Document perimeter security requirements

* Regularly review and test perimeter security effectiveness`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Physical Control',
    responsibleParty: 'Physical Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A7.2',
    standardId: 'iso-27002-2022',
    section: 'A7',
    code: 'A7.2',
    name: 'Physical entry',
    description: 'Secure areas should be protected by appropriate entry controls to ensure that only authorized personnel are allowed access.',
    guidance: 'Implement physical access controls.',
    auditReadyGuidance: `**Purpose**

Secure areas should be protected by appropriate entry controls to ensure that only authorized personnel are allowed access.

**Implementation**

* Implement appropriate entry controls based on area sensitivity

* Use multi-factor authentication for highly sensitive areas

* Maintain logs of all access to secure areas

* Regularly review and audit access records`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Physical Control',
    responsibleParty: 'Physical Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  
  {
    id: 'iso-27001-A7.3',
    standardId: 'iso-27002-2022',
    section: 'A7',
    code: 'A7.3',
    name: 'Securing offices, rooms and facilities',
    description: 'Physical security for offices, rooms and facilities should be designed and implemented.',
    guidance: 'Implement physical security measures for working spaces.',
    auditReadyGuidance: `**Purpose**

Physical security for offices, rooms and facilities should be designed and implemented.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Physical Control',
    responsibleParty: 'Physical Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A7.4',
    standardId: 'iso-27002-2022',
    section: 'A7',
    code: 'A7.4',
    name: 'Physical security monitoring',
    description: 'Premises should be continuously monitored for unauthorized physical access.',
    guidance: 'Implement physical security monitoring systems.',
    auditReadyGuidance: `**Purpose**

Premises should be continuously monitored for unauthorized physical access.

**Implementation**

* Implement comprehensive monitoring of physical access points

* Use appropriate technologies (CCTV, intrusion detection, etc.)

* Establish procedures for monitoring, logging, and responding to events

* Regularly review monitoring effectiveness and coverage`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Physical Control',
    responsibleParty: 'Physical Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A7.5',
    standardId: 'iso-27002-2022',
    section: 'A7',
    code: 'A7.5',
    name: 'Protecting against physical and environmental threats',
    description: 'Protection against physical and environmental threats such as natural disasters, malicious attack or accidents should be designed and implemented.',
    guidance: 'Implement environmental protection controls.',
    auditReadyGuidance: `**Purpose**

Protection against physical and environmental threats such as natural disasters, malicious attack or accidents should be designed and implemented.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Physical Control',
    responsibleParty: 'Facilities Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A7.6',
    standardId: 'iso-27002-2022',
    section: 'A7',
    code: 'A7.6',
    name: 'Working in secure areas',
    description: 'Procedures for working in secure areas should be designed and implemented.',
    guidance: 'Define procedures for working in secure areas.',
    auditReadyGuidance: `**Purpose**

Procedures for working in secure areas should be designed and implemented.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Physical Control',
    responsibleParty: 'Physical Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A7.7',
    standardId: 'iso-27002-2022',
    section: 'A7',
    code: 'A7.7',
    name: 'Clear desk and clear screen',
    description: 'Rules for maintaining a clear desk for papers and removable storage media and a clear screen for information processing facilities should be established and appropriate for the classification and risks.',
    guidance: 'Implement clear desk and clear screen policies.',
    auditReadyGuidance: `**Purpose**

Rules for maintaining a clear desk for papers and removable storage media and a clear screen for information processing facilities should be established and appropriate for the classification and risks.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Physical Control',
    responsibleParty: 'Security Awareness',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A7.8',
    standardId: 'iso-27002-2022',
    section: 'A7',
    code: 'A7.8',
    name: 'Equipment siting and protection',
    description: 'Equipment should be sited and protected to reduce the risks from environmental threats and hazards, and opportunities for unauthorized access.',
    guidance: 'Implement equipment placement and protection measures.',
    auditReadyGuidance: `**Purpose**

Equipment should be sited and protected to reduce the risks from environmental threats and hazards, and opportunities for unauthorized access.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Physical Control',
    responsibleParty: 'IT Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A7.9',
    standardId: 'iso-27002-2022',
    section: 'A7',
    code: 'A7.9',
    name: 'Security of assets off-premises',
    description: 'Off-site assets should be protected taking into account the different risks of working outside the organization\'s premises.',
    guidance: 'Implement controls for assets used outside the organization.',
    auditReadyGuidance: `**Purpose**

Off-site assets should be protected taking into account the different risks of working outside the organization\

**Implementation**

* Establish formal clear desk and clear screen policies

* Include requirements for handling sensitive information when unattended

* Implement technical controls to enforce screen locking

* Conduct regular compliance checks`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Physical Control',
    responsibleParty: 'Asset Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A7.10',
    standardId: 'iso-27002-2022',
    section: 'A7',
    code: 'A7.10',
    name: 'Storage media',
    description: 'Storage media containing information should be protected against unauthorized access, misuse or corruption during transportation.',
    guidance: 'Secure storage media throughout its lifecycle.',
    auditReadyGuidance: `**Purpose**

Storage media containing information should be protected against unauthorized access, misuse or corruption during transportation.

**Implementation**

* Define clear security perimeters for areas with sensitive information

* Implement appropriate physical barriers and entry controls

* Document perimeter security requirements

* Regularly review and test perimeter security effectiveness`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Physical Control',
    responsibleParty: 'Data Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A7.11',
    standardId: 'iso-27002-2022',
    section: 'A7',
    code: 'A7.11',
    name: 'Supporting utilities',
    description: 'Equipment should be protected from power failures and other disruptions caused by failures in supporting utilities.',
    guidance: 'Implement protection for supporting utilities.',
    auditReadyGuidance: `**Purpose**

Equipment should be protected from power failures and other disruptions caused by failures in supporting utilities.

**Implementation**

* Define clear security perimeters for areas with sensitive information

* Implement appropriate physical barriers and entry controls

* Document perimeter security requirements

* Regularly review and test perimeter security effectiveness`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Physical Control',
    responsibleParty: 'Facilities Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A7.12',
    standardId: 'iso-27002-2022',
    section: 'A7',
    code: 'A7.12',
    name: 'Cabling security',
    description: 'Power and telecommunications cabling carrying data or supporting information services should be protected from interception, interference or damage.',
    guidance: 'Implement cabling security measures.',
    auditReadyGuidance: `**Purpose**

Power and telecommunications cabling carrying data or supporting information services should be protected from interception, interference or damage.

**Implementation**

* Define clear security perimeters for areas with sensitive information

* Implement appropriate physical barriers and entry controls

* Document perimeter security requirements

* Regularly review and test perimeter security effectiveness`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Physical Control',
    responsibleParty: 'Facilities Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A7.13',
    standardId: 'iso-27002-2022',
    section: 'A7',
    code: 'A7.13',
    name: 'Equipment maintenance',
    description: 'Equipment should be correctly maintained to ensure its continued availability and integrity.',
    guidance: 'Implement equipment maintenance procedures.',
    auditReadyGuidance: `**Purpose**

Equipment should be correctly maintained to ensure its continued availability and integrity.

**Implementation**

* Define clear security perimeters for areas with sensitive information

* Implement appropriate physical barriers and entry controls

* Document perimeter security requirements

* Regularly review and test perimeter security effectiveness`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Physical Control',
    responsibleParty: 'IT Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A7.14',
    standardId: 'iso-27002-2022',
    section: 'A7',
    code: 'A7.14',
    name: 'Secure disposal or re-use of equipment',
    description: 'All items of equipment containing storage media should be verified to ensure that any sensitive data and licensed software has been removed or securely overwritten prior to disposal or re-use.',
    guidance: 'Implement secure equipment disposal procedures.',
    auditReadyGuidance: `**Purpose**

All items of equipment containing storage media should be verified to ensure that any sensitive data and licensed software has been removed or securely overwritten prior to disposal or re-use.

**Implementation**

* Define clear security perimeters for areas with sensitive information

* Implement appropriate physical barriers and entry controls

* Document perimeter security requirements

* Regularly review and test perimeter security effectiveness`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Physical Control',
    responsibleParty: 'IT Asset Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  
  // A8 - Technological Controls (examples)
  {
    id: 'iso-27001-A8.1',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.1',
    name: 'User endpoint devices',
    description: 'A policy should be established and appropriate security measures implemented for the protection of information accessed, processed or stored at user endpoint devices.',
    guidance: 'Implement endpoint security controls.',
    auditReadyGuidance: `**Purpose**

A policy should be established and appropriate security measures implemented for the protection of information accessed, processed or stored at user endpoint devices.

**Implementation**

* Develop and implement endpoint security policies and procedures

* Include requirements for encryption, authentication, and access controls

* Implement technical controls through MDM or other management tools

* Regularly audit compliance with endpoint policies`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Endpoint Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.2',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.2',
    name: 'Privileged access rights',
    description: 'The allocation and use of privileged access rights should be restricted and controlled.',
    guidance: 'Implement privileged access management.',
    auditReadyGuidance: `**Purpose**

The allocation and use of privileged access rights should be restricted and controlled.

**Implementation**

* Implement strict controls for privileged account management

* Restrict and monitor privileged access allocation

* Use just-in-time access where possible

* Review privileged access rights regularly`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Access Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  
  {
    id: 'iso-27001-A8.3',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.3',
    name: 'Information access restriction',
    description: 'Access to information and application functions should be restricted in accordance with the access control policy.',
    guidance: 'Implement application-level access controls.',
    auditReadyGuidance: `**Purpose**

Access to information and application functions should be restricted in accordance with the access control policy.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Application Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.4',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.4',
    name: 'Access to source code',
    description: 'Access to source code should be restricted.',
    guidance: 'Implement source code access controls and secure repositories.',
    auditReadyGuidance: `**Purpose**

Access to source code should be restricted.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Development Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.5',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.5',
    name: 'Secure authentication',
    description: 'Authentication information should be protected by techniques appropriate to the level of risk.',
    guidance: 'Implement secure authentication mechanisms.',
    auditReadyGuidance: `**Purpose**

Authentication information should be protected by techniques appropriate to the level of risk.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Identity Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.6',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.6',
    name: 'Capacity management',
    description: 'The use of resources should be monitored and adjusted in line with current and expected capacity requirements.',
    guidance: 'Implement capacity management processes and monitoring.',
    auditReadyGuidance: `**Purpose**

The use of resources should be monitored and adjusted in line with current and expected capacity requirements.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'IT Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.7',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.7',
    name: 'Protection against malware',
    description: 'Protection against malware should be implemented and supported by appropriate user awareness.',
    guidance: 'Implement anti-malware solutions and user awareness training.',
    auditReadyGuidance: `**Purpose**

Protection against malware should be implemented and supported by appropriate user awareness.

**Implementation**

* Implement multi-layered anti-malware protection

* Include technical controls and user awareness

* Keep protection mechanisms updated

* Regularly test effectiveness against current threats`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Security Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.8',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.8',
    name: 'Management of technical vulnerabilities',
    description: 'Information about technical vulnerabilities of information systems in use should be obtained, the organization\'s exposure to such vulnerabilities should be evaluated and appropriate measures should be taken.',
    guidance: 'Implement vulnerability management processes.',
    auditReadyGuidance: `**Purpose**

Information about technical vulnerabilities of information systems in use should be obtained, the organization\

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Security Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.9',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.9',
    name: 'Configuration management',
    description: 'Configurations, including security configurations, of hardware, software, services and networks should be established, documented, implemented, monitored and reviewed.',
    guidance: 'Implement configuration management processes.',
    auditReadyGuidance: `**Purpose**

Configurations, including security configurations, of hardware, software, services and networks should be established, documented, implemented, monitored and reviewed.

**Implementation**

* Establish baseline configurations for all systems and networks

* Document, implement, and monitor configuration standards

* Use automation for configuration compliance checking

* Regularly review and update baseline configurations`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'IT Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.10',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.10',
    name: 'Information deletion',
    description: 'Information, software and systems should be disposed of or deleted in a way that protects the information from unauthorized disclosure.',
    guidance: 'Implement secure data deletion procedures.',
    auditReadyGuidance: `**Purpose**

Information, software and systems should be disposed of or deleted in a way that protects the information from unauthorized disclosure.

**Implementation**

* Develop and implement endpoint security policies and procedures

* Include requirements for encryption, authentication, and access controls

* Implement technical controls through MDM or other management tools

* Regularly audit compliance with endpoint policies`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Information Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.11',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.11',
    name: 'Data masking',
    description: 'Data masking should be applied in accordance with the organization\'s policy on access control, legal, statutory, regulatory and contractual requirements.',
    guidance: 'Implement data masking techniques for sensitive information.',
    auditReadyGuidance: `**Purpose**

Data masking should be applied in accordance with the organization\

**Implementation**

* Develop and implement endpoint security policies and procedures

* Include requirements for encryption, authentication, and access controls

* Implement technical controls through MDM or other management tools

* Regularly audit compliance with endpoint policies`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Data Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.12',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.12',
    name: 'Data leakage prevention',
    description: 'Data leakage prevention should be applied to systems, networks and endpoint devices that process, store or transmit sensitive information.',
    guidance: 'Implement data loss prevention (DLP) solutions.',
    auditReadyGuidance: `**Purpose**

Data leakage prevention should be applied to systems, networks and endpoint devices that process, store or transmit sensitive information.

**Implementation**

* Develop and implement endpoint security policies and procedures

* Include requirements for encryption, authentication, and access controls

* Implement technical controls through MDM or other management tools

* Regularly audit compliance with endpoint policies`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Data Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.13',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.13',
    name: 'Information backup',
    description: 'Backup copies of information, software and systems should be taken and regularly tested in accordance with the organization\'s policy.',
    guidance: 'Implement comprehensive backup solutions with regular testing.',
    auditReadyGuidance: `**Purpose**

Backup copies of information, software and systems should be taken and regularly tested in accordance with the organization\

**Implementation**

* Develop and implement endpoint security policies and procedures

* Include requirements for encryption, authentication, and access controls

* Implement technical controls through MDM or other management tools

* Regularly audit compliance with endpoint policies`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'IT Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.14',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.14',
    name: 'Redundancy of information processing facilities',
    description: 'Information processing facilities should be implemented with redundancy sufficient to meet availability requirements.',
    guidance: 'Implement redundant systems for critical services.',
    auditReadyGuidance: `**Purpose**

Information processing facilities should be implemented with redundancy sufficient to meet availability requirements.

**Implementation**

* Develop and implement endpoint security policies and procedures

* Include requirements for encryption, authentication, and access controls

* Implement technical controls through MDM or other management tools

* Regularly audit compliance with endpoint policies`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'IT Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.15',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.15',
    name: 'Logging',
    description: 'Logs that record user activities, exceptions, faults and information security events should be produced, stored, protected and analyzed.',
    guidance: 'Implement comprehensive logging across systems and networks.',
    auditReadyGuidance: `**Purpose**

Logs that record user activities, exceptions, faults and information security events should be produced, stored, protected and analyzed.

**Implementation**

* Develop and implement endpoint security policies and procedures

* Include requirements for encryption, authentication, and access controls

* Implement technical controls through MDM or other management tools

* Regularly audit compliance with endpoint policies`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Security Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.16',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.16',
    name: 'Monitoring activities',
    description: 'Networks, systems and applications should be monitored for anomalous behavior and appropriate actions taken to evaluate potential information security incidents.',
    guidance: 'Implement security monitoring and anomaly detection.',
    auditReadyGuidance: `**Purpose**

Networks, systems and applications should be monitored for anomalous behavior and appropriate actions taken to evaluate potential information security incidents.

**Implementation**

* Develop and implement endpoint security policies and procedures

* Include requirements for encryption, authentication, and access controls

* Implement technical controls through MDM or other management tools

* Regularly audit compliance with endpoint policies`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Security Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.17',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.17',
    name: 'Clock synchronization',
    description: 'The clocks of all relevant information processing systems within an organization or security domain should be synchronized to a single reference time source.',
    guidance: 'Implement time synchronization across all systems.',
    auditReadyGuidance: `**Purpose**

The clocks of all relevant information processing systems within an organization or security domain should be synchronized to a single reference time source.

**Implementation**

* Develop and implement endpoint security policies and procedures

* Include requirements for encryption, authentication, and access controls

* Implement technical controls through MDM or other management tools

* Regularly audit compliance with endpoint policies`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'IT Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.18',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.18',
    name: 'Use of privileged utility programs',
    description: 'The use of utility programs that might be capable of overriding system and application controls should be restricted and controlled.',
    guidance: 'Control access to and usage of privileged utility programs.',
    auditReadyGuidance: `**Purpose**

The use of utility programs that might be capable of overriding system and application controls should be restricted and controlled.

**Implementation**

* Develop and implement endpoint security policies and procedures

* Include requirements for encryption, authentication, and access controls

* Implement technical controls through MDM or other management tools

* Regularly audit compliance with endpoint policies`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Security Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.19',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.19',
    name: 'Installation of software on operational systems',
    description: 'Procedures should be implemented to control the installation of software on operational systems.',
    guidance: 'Implement software installation controls.',
    auditReadyGuidance: `**Purpose**

Procedures should be implemented to control the installation of software on operational systems.

**Implementation**

* Develop and implement endpoint security policies and procedures

* Include requirements for encryption, authentication, and access controls

* Implement technical controls through MDM or other management tools

* Regularly audit compliance with endpoint policies`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'IT Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.20',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.20',
    name: 'Networks security',
    description: 'Networks and network devices should be secured, managed and controlled to protect information in systems and applications.',
    guidance: 'Implement comprehensive network security controls.',
    auditReadyGuidance: `**Purpose**

Networks and network devices should be secured, managed and controlled to protect information in systems and applications.

**Implementation**

* Implement strict controls for privileged account management

* Restrict and monitor privileged access allocation

* Use just-in-time access where possible

* Review privileged access rights regularly`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Network Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.21',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.21',
    name: 'Security of network services',
    description: 'Security mechanisms, service levels and management requirements of all network services should be identified, implemented and monitored.',
    guidance: 'Define and enforce security requirements for network services.',
    auditReadyGuidance: `**Purpose**

Security mechanisms, service levels and management requirements of all network services should be identified, implemented and monitored.

**Implementation**

* Implement strict controls for privileged account management

* Restrict and monitor privileged access allocation

* Use just-in-time access where possible

* Review privileged access rights regularly`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Network Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.22',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.22',
    name: 'Segregation of networks',
    description: 'Groups of information services, users and information systems should be segregated on networks.',
    guidance: 'Implement network segmentation.',
    auditReadyGuidance: `**Purpose**

Groups of information services, users and information systems should be segregated on networks.

**Implementation**

* Implement strict controls for privileged account management

* Restrict and monitor privileged access allocation

* Use just-in-time access where possible

* Review privileged access rights regularly`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Network Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.23',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.23',
    name: 'Web filtering',
    description: 'Access to external websites should be managed to reduce exposure to malicious content.',
    guidance: 'Implement web filtering and content control.',
    auditReadyGuidance: `**Purpose**

Access to external websites should be managed to reduce exposure to malicious content.

**Implementation**

* Implement strict controls for privileged account management

* Restrict and monitor privileged access allocation

* Use just-in-time access where possible

* Review privileged access rights regularly`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Network Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.24',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.24',
    name: 'Use of cryptography',
    description: 'Rules for the effective use of cryptography should be developed and implemented to protect the confidentiality, authenticity and/or integrity of information.',
    guidance: 'Implement cryptographic controls and policies.',
    auditReadyGuidance: `**Purpose**

Rules for the effective use of cryptography should be developed and implemented to protect the confidentiality, authenticity and/or integrity of information.

**Implementation**

* Implement strict controls for privileged account management

* Restrict and monitor privileged access allocation

* Use just-in-time access where possible

* Review privileged access rights regularly`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Cryptography Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.25',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.25',
    name: 'Secure development lifecycle',
    description: 'Rules for the development of software and systems should be established and applied to developments within the organization.',
    guidance: 'Implement secure development lifecycle practices.',
    auditReadyGuidance: `**Purpose**

Rules for the development of software and systems should be established and applied to developments within the organization.

**Implementation**

* Implement strict controls for privileged account management

* Restrict and monitor privileged access allocation

* Use just-in-time access where possible

* Review privileged access rights regularly`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Development Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.26',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.26',
    name: 'Application security requirements',
    description: 'Security requirements should be identified, specified and approved when developing or acquiring applications.',
    guidance: 'Define security requirements for applications.',
    auditReadyGuidance: `**Purpose**

Security requirements should be identified, specified and approved when developing or acquiring applications.

**Implementation**

* Implement strict controls for privileged account management

* Restrict and monitor privileged access allocation

* Use just-in-time access where possible

* Review privileged access rights regularly`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Application Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.27',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.27',
    name: 'Secure system architecture and engineering principles',
    description: 'Principles for engineering secure systems should be established, documented, maintained and applied to any information system development.',
    guidance: 'Implement secure-by-design principles.',
    auditReadyGuidance: `**Purpose**

Principles for engineering secure systems should be established, documented, maintained and applied to any information system development.

**Implementation**

* Implement strict controls for privileged account management

* Restrict and monitor privileged access allocation

* Use just-in-time access where possible

* Review privileged access rights regularly`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Development Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.28',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.28',
    name: 'Secure coding',
    description: 'Secure coding principles should be applied to software development.',
    guidance: 'Implement secure coding practices and standards.',
    auditReadyGuidance: `**Purpose**

Secure coding principles should be applied to software development.

**Implementation**

* Implement strict controls for privileged account management

* Restrict and monitor privileged access allocation

* Use just-in-time access where possible

* Review privileged access rights regularly`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Development Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.29',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.29',
    name: 'Security testing in development and acceptance',
    description: 'Security testing processes should be defined and implemented in the development lifecycle.',
    guidance: 'Implement security testing as part of the development process.',
    auditReadyGuidance: `**Purpose**

Security testing processes should be defined and implemented in the development lifecycle.

**Implementation**

* Implement strict controls for privileged account management

* Restrict and monitor privileged access allocation

* Use just-in-time access where possible

* Review privileged access rights regularly`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Application Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.30',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.30',
    name: 'Outsourced development',
    description: 'The organization should supervise and monitor the activity of outsourced system development.',
    guidance: 'Establish security requirements for outsourced development.',
    auditReadyGuidance: `**Purpose**

The organization should supervise and monitor the activity of outsourced system development.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Development Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.31',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.31',
    name: 'Separation of development, test and production environments',
    description: 'Development, test and production environments should be separated and secured.',
    guidance: 'Implement environment separation.',
    auditReadyGuidance: `**Purpose**

Development, test and production environments should be separated and secured.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'IT Operations',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.32',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.32',
    name: 'Change management',
    description: 'Changes to the organization, business processes, information processing facilities and systems that affect information security should be controlled.',
    guidance: 'Implement security change management processes.',
    auditReadyGuidance: `**Purpose**

Changes to the organization, business processes, information processing facilities and systems that affect information security should be controlled.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Change Management',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.33',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.33',
    name: 'Test information',
    description: 'Test information should be carefully selected, protected and controlled.',
    guidance: 'Implement controls for test data.',
    auditReadyGuidance: `**Purpose**

Test information should be carefully selected, protected and controlled.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Development Security',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'iso-27001-A8.34',
    standardId: 'iso-27002-2022',
    section: 'A8',
    code: 'A8.34',
    name: 'Protection of information systems during audit testing',
    description: 'Audit requirements involving verification of operational systems should be carefully planned and agreed to minimize disruptions.',
    guidance: 'Plan and manage security testing and audits.',
    auditReadyGuidance: `**Purpose**

Audit requirements involving verification of operational systems should be carefully planned and agreed to minimize disruptions.

**Implementation**

`,
    status: 'not-fulfilled',
    evidence: '',
    notes: 'ISO 27002:2022 Technological Control',
    responsibleParty: 'Security Testing',
    lastAssessmentDate: null,
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'gdpr-A1',
    standardId: 'gdpr',
    section: 'A',
    code: 'A1',
    name: 'Lawfulness, fairness and transparency',
    description: 'Personal data shall be processed lawfully, fairly and in a transparent manner in relation to the data subject.',
    guidance: 'Implement mechanisms to ensure processing is lawful, fair and transparent.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'GDPR Article 5(1)(a) requirement',
    responsibleParty: 'Data Protection Officer',
    lastAssessmentDate: null,
    tags: ['tag-data-protection', 'tag-compliance'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'gdpr-A2',
    standardId: 'gdpr',
    section: 'A',
    code: 'A2',
    name: 'Purpose limitation',
    description: 'Personal data shall be collected for specified, explicit and legitimate purposes and not further processed in a manner that is incompatible with those purposes.',
    guidance: 'Define and document purposes for data collection and ensure processing aligns with these purposes.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'GDPR Article 5(1)(b) requirement',
    responsibleParty: 'Data Protection Officer',
    lastAssessmentDate: null,
    tags: ['tag-data-protection', 'tag-compliance'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'gdpr-A3',
    standardId: 'gdpr',
    section: 'A',
    code: 'A3',
    name: 'Data minimization',
    description: 'Personal data shall be adequate, relevant and limited to what is necessary in relation to the purposes for which they are processed.',
    guidance: 'Implement data minimization practices and regular reviews of data collection.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'GDPR Article 5(1)(c) requirement',
    responsibleParty: 'Data Protection Officer',
    lastAssessmentDate: null,
    tags: ['tag-data-protection', 'tag-compliance'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'gdpr-A4',
    standardId: 'gdpr',
    section: 'A',
    code: 'A4',
    name: 'Accuracy',
    description: 'Personal data shall be accurate and, where necessary, kept up to date; every reasonable step must be taken to ensure that personal data that are inaccurate, having regard to the purposes for which they are processed, are erased or rectified without delay.',
    guidance: 'Implement mechanisms to ensure data accuracy and correction procedures.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'GDPR Article 5(1)(d) requirement',
    responsibleParty: 'Data Protection Officer',
    lastAssessmentDate: null,
    tags: ['tag-data-protection', 'tag-compliance'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'gdpr-A5',
    standardId: 'gdpr',
    section: 'A',
    code: 'A5',
    name: 'Storage limitation',
    description: 'Personal data shall be kept in a form which permits identification of data subjects for no longer than is necessary for the purposes for which the personal data are processed.',
    guidance: 'Implement data retention policies and procedures for regular review.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'GDPR Article 5(1)(e) requirement',
    responsibleParty: 'Data Protection Officer',
    lastAssessmentDate: null,
    tags: ['tag-data-protection', 'tag-compliance'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'gdpr-A6',
    standardId: 'gdpr',
    section: 'A',
    code: 'A6',
    name: 'Integrity and confidentiality',
    description: 'Personal data shall be processed in a manner that ensures appropriate security of the personal data, including protection against unauthorised or unlawful processing and against accidental loss, destruction or damage, using appropriate technical or organisational measures.',
    guidance: 'Implement security measures to protect data integrity and confidentiality.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'GDPR Article 5(1)(f) requirement',
    responsibleParty: 'Data Protection Officer',
    lastAssessmentDate: null,
    tags: ['tag-data-protection', 'tag-security', 'tag-compliance'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'gdpr-B1',
    standardId: 'gdpr',
    section: 'B',
    code: 'B1',
    name: 'Legal basis for processing',
    description: 'Processing of personal data is lawful only if and to the extent that at least one legal basis applies.',
    guidance: 'Identify and document the legal basis for all data processing activities.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'GDPR Article 6 requirement',
    responsibleParty: 'Data Protection Officer',
    lastAssessmentDate: null,
    tags: ['tag-data-protection', 'tag-compliance'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'gdpr-B2',
    standardId: 'gdpr',
    section: 'B',
    code: 'B2',
    name: 'Conditions for consent',
    description: 'Where processing is based on consent, the controller shall be able to demonstrate that the data subject has consented to processing of his or her personal data. Consent must be freely given, specific, informed and unambiguous.',
    guidance: 'Implement consent management systems and documentation.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'GDPR Article 7 requirement',
    responsibleParty: 'Data Protection Officer',
    lastAssessmentDate: null,
    tags: ['tag-data-protection', 'tag-compliance'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'gdpr-B3',
    standardId: 'gdpr',
    section: 'B',
    code: 'B3',
    name: 'Rights of the data subject',
    description: 'Organizations must implement mechanisms to support data subject rights including access, rectification, erasure, restriction of processing, data portability, and objection.',
    guidance: 'Develop processes to handle data subject requests within required timeframes.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'GDPR Articles 15-21 requirements',
    responsibleParty: 'Data Protection Officer',
    lastAssessmentDate: null,
    tags: ['tag-data-protection', 'tag-compliance'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'gdpr-B4',
    standardId: 'gdpr',
    section: 'B',
    code: 'B4',
    name: 'Data protection by design and by default',
    description: 'Implement appropriate technical and organizational measures designed to implement data-protection principles and integrate necessary safeguards into processing.',
    guidance: 'Integrate privacy considerations into all systems and processes from the design phase.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'GDPR Article 25 requirement',
    responsibleParty: 'Data Protection Officer',
    lastAssessmentDate: null,
    tags: ['tag-data-protection', 'tag-security', 'tag-compliance'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'gdpr-B5',
    standardId: 'gdpr',
    section: 'B',
    code: 'B5',
    name: 'Records of processing activities',
    description: 'Each controller and representative shall maintain a record of processing activities under its responsibility.',
    guidance: 'Create and maintain records of all data processing activities.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'GDPR Article 30 requirement',
    responsibleParty: 'Data Protection Officer',
    lastAssessmentDate: null,
    tags: ['tag-documentation', 'tag-compliance'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'gdpr-C1',
    standardId: 'gdpr',
    section: 'C',
    code: 'C1',
    name: 'Security of processing',
    description: 'Implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk.',
    guidance: 'Conduct risk assessments and implement appropriate security controls.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'GDPR Article 32 requirement',
    responsibleParty: 'CISO and Data Protection Officer',
    lastAssessmentDate: null,
    tags: ['tag-security', 'tag-data-protection'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'gdpr-C2',
    standardId: 'gdpr',
    section: 'C',
    code: 'C2',
    name: 'Data protection impact assessment',
    description: 'Where processing is likely to result in a high risk to the rights and freedoms of natural persons, the controller shall, prior to the processing, carry out an assessment of the impact of the envisaged processing operations on the protection of personal data.',
    guidance: 'Develop and implement DPIA procedures for high-risk processing activities.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'GDPR Article 35 requirement',
    responsibleParty: 'Data Protection Officer',
    lastAssessmentDate: null,
    tags: ['tag-risk', 'tag-data-protection'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'gdpr-C3',
    standardId: 'gdpr',
    section: 'C',
    code: 'C3',
    name: 'Data breach notification',
    description: 'In the case of a personal data breach, the controller shall without undue delay and, where feasible, not later than 72 hours after having become aware of it, notify the personal data breach to the supervisory authority.',
    guidance: 'Implement data breach detection, investigation and reporting procedures.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'GDPR Article 33 requirement',
    responsibleParty: 'CISO and Data Protection Officer',
    lastAssessmentDate: null,
    tags: ['tag-incident', 'tag-data-protection'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'gdpr-C4',
    standardId: 'gdpr',
    section: 'C',
    code: 'C4',
    name: 'Data Protection Officer',
    description: 'The controller and the processor shall designate a data protection officer in specific cases outlined in the regulation.',
    guidance: 'Appoint a qualified DPO if required and ensure they have appropriate resources.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'GDPR Articles 37-39 requirements',
    responsibleParty: 'Executive Management',
    lastAssessmentDate: null,
    tags: ['tag-governance', 'tag-data-protection'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },

  // Adding NIS2 requirements
  {
    id: 'nis2-A1',
    standardId: 'nis2',
    section: 'A',
    code: 'A1',
    name: 'Risk management measures',
    description: 'Implement appropriate and proportionate technical, operational and organizational measures to manage the risks posed to the security of network and information systems.',
    guidance: 'Develop and implement a risk management framework specific to network and information systems.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'NIS2 Directive Article 21 requirement',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    tags: ['tag-risk', 'tag-security'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'nis2-A2',
    standardId: 'nis2',
    section: 'A',
    code: 'A2',
    name: 'Incident handling',
    description: 'Implement measures to prevent and minimise the impact of incidents affecting the security of the network and information systems.',
    guidance: 'Develop incident response procedures specifically for network and information security incidents.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'NIS2 Directive Article 23 requirement',
    responsibleParty: 'Security Operations',
    lastAssessmentDate: null,
    tags: ['tag-incident', 'tag-security'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'nis2-A3',
    standardId: 'nis2',
    section: 'A',
    code: 'A3',
    name: 'Business continuity',
    description: 'Implement policies and procedures to ensure the continuity of critical services in case of incidents.',
    guidance: 'Develop business continuity plans specifically for network and information systems.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'NIS2 Directive requirement',
    responsibleParty: 'Business Continuity Manager',
    lastAssessmentDate: null,
    tags: ['tag-operational', 'tag-security'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'nis2-A4',
    standardId: 'nis2',
    section: 'A',
    code: 'A4',
    name: 'Supply chain security',
    description: 'Address security risks in the supply chain, including with regard to the security-related aspects of the relationships between each entity and its direct suppliers or service providers.',
    guidance: 'Implement security assessments for suppliers providing network and information systems components.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'NIS2 Directive Article 21 requirement',
    responsibleParty: 'Vendor Management',
    lastAssessmentDate: null,
    tags: ['tag-risk', 'tag-security'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'nis2-A5',
    standardId: 'nis2',
    section: 'A',
    code: 'A5',
    name: 'Security in network and information systems acquisition',
    description: 'Evaluate and take into account security risks associated with the acquisition, development and maintenance of network and information systems.',
    guidance: 'Implement security requirements in the procurement process for network and information systems.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'NIS2 Directive requirement',
    responsibleParty: 'IT Procurement',
    lastAssessmentDate: null,
    tags: ['tag-security', 'tag-technical'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'nis2-B1',
    standardId: 'nis2',
    section: 'B',
    code: 'B1',
    name: 'Incident notification',
    description: 'Notify the competent authority or the CSIRT of any incident having a significant impact on the provision of their services within 24 hours of becoming aware of the incident.',
    guidance: 'Implement procedures for timely notification of significant incidents to authorities.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'NIS2 Directive Article 23 requirement',
    responsibleParty: 'Security Operations',
    lastAssessmentDate: null,
    tags: ['tag-incident', 'tag-compliance'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'nis2-B2',
    standardId: 'nis2',
    section: 'B',
    code: 'B2',
    name: 'Vulnerability handling and disclosure',
    description: 'Implement policies and procedures regarding coordinated vulnerability disclosure for previously unknown vulnerabilities.',
    guidance: 'Develop vulnerability management processes including responsible disclosure procedures.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'NIS2 Directive Article 22 requirement',
    responsibleParty: 'Security Operations',
    lastAssessmentDate: null,
    tags: ['tag-security', 'tag-technical'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'nis2-B3',
    standardId: 'nis2',
    section: 'B',
    code: 'B3',
    name: 'Use of cryptography and encryption',
    description: 'Implement state-of-the-art cryptography and encryption where appropriate.',
    guidance: 'Develop cryptography policies and implement encryption for sensitive data and communications.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'NIS2 Directive requirement',
    responsibleParty: 'Security Architecture',
    lastAssessmentDate: null,
    tags: ['tag-technical', 'tag-security'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'nis2-B4',
    standardId: 'nis2',
    section: 'B',
    code: 'B4',
    name: 'Multi-factor authentication',
    description: 'Implement multi-factor authentication or continuous authentication solutions for systems processing sensitive data or providing critical functions.',
    guidance: 'Deploy MFA for all critical systems and administrative access.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'NIS2 Directive requirement',
    responsibleParty: 'Identity Management',
    lastAssessmentDate: null,
    tags: ['tag-access-control', 'tag-security'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'nis2-C1',
    standardId: 'nis2',
    section: 'C',
    code: 'C1',
    name: 'Basic cyber hygiene practices',
    description: 'Implement basic cyber hygiene practices and cybersecurity training for staff.',
    guidance: 'Develop and deliver regular security awareness training for all employees.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'NIS2 Directive requirement',
    responsibleParty: 'Security Training',
    lastAssessmentDate: null,
    tags: ['tag-security', 'tag-operational'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'nis2-C2',
    standardId: 'nis2',
    section: 'C',
    code: 'C2',
    name: 'Management accountability',
    description: 'Ensure appropriate management is in place to oversee the cybersecurity measures.',
    guidance: 'Define clear cybersecurity roles and responsibilities at management level.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'NIS2 Directive requirement',
    responsibleParty: 'Executive Management',
    lastAssessmentDate: null,
    tags: ['tag-governance', 'tag-security'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'nis2-C3',
    standardId: 'nis2',
    section: 'C',
    code: 'C3',
    name: 'Domain name registration data',
    description: 'Collect and maintain accurate and complete domain name registration data.',
    guidance: 'Implement processes to maintain accurate domain registration information.',
    status: 'not-fulfilled',
    evidence: '',
    notes: 'NIS2 Directive requirement for relevant entities',
    responsibleParty: 'IT Operations',
    lastAssessmentDate: null,
    tags: ['tag-operational', 'tag-compliance'],
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T10:00:00Z',
  },
  // NIST CSF 2.0 Requirements
  {
    id: 'nist-csf-GV.1',
    standardId: 'nist-csf-2.0',
    section: 'GV',
    code: 'GV.1',
    name: 'Organizational Context',
    description: 'The organization\'s mission, objectives, stakeholders, and activities are understood and prioritized.',
    guidance: 'Document the organization\'s mission, objectives, stakeholders, and activities as the foundation for cybersecurity risk management.',
    status: 'not-fulfilled',
    tags: ['governance', 'risk-management'],
    evidence: '',
    notes: '',
    responsibleParty: 'Executive Management',
    lastAssessmentDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'nist-csf-GV.2',
    standardId: 'nist-csf-2.0',
    section: 'GV',
    code: 'GV.2',
    name: 'Risk Management Strategy',
    description: 'The organization\'s priorities, constraints, risk tolerances, and assumptions are established and used to support operational risk decisions.',
    guidance: 'Develop a formal risk management strategy that defines risk tolerance levels and risk assessment methodologies.',
    status: 'not-fulfilled',
    tags: ['governance', 'risk-management'],
    evidence: '',
    notes: '',
    responsibleParty: 'Risk Management',
    lastAssessmentDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'nist-csf-GV.3',
    standardId: 'nist-csf-2.0',
    section: 'GV',
    code: 'GV.3',
    name: 'Roles, Responsibilities, and Authorities',
    description: 'Cybersecurity roles, responsibilities, and authorities to foster accountability, performance assessment, and continuous improvement.',
    guidance: 'Clearly define and document cybersecurity roles, responsibilities, and authorities across the organization.',
    status: 'not-fulfilled',
    tags: ['governance', 'roles'],
    evidence: '',
    notes: '',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'nist-csf-GV.4',
    standardId: 'nist-csf-2.0',
    section: 'GV',
    code: 'GV.4',
    name: 'Policies, Processes, and Procedures',
    description: 'Cybersecurity policies, processes, and procedures are established, communicated, and enforced.',
    guidance: 'Develop, implement, and maintain comprehensive cybersecurity policies, processes, and procedures.',
    status: 'not-fulfilled',
    tags: ['governance', 'policies'],
    evidence: '',
    notes: '',
    responsibleParty: 'CISO',
    lastAssessmentDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'nist-csf-GV.5',
    standardId: 'nist-csf-2.0',
    section: 'GV',
    code: 'GV.5',
    name: 'Oversight',
    description: 'Cybersecurity risk management strategy, policies, processes, and procedures are reviewed and updated by organizational leadership.',
    guidance: 'Implement a regular review cycle for all cybersecurity governance documents, with leadership approval required for changes.',
    status: 'not-fulfilled',
    tags: ['governance', 'risk-management'],
    evidence: '',
    notes: '',
    responsibleParty: 'Executive Management',
    lastAssessmentDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // ISO 27005:2022 Requirements
  {
    id: 'iso-27005-4.1',
    standardId: 'iso-27005-2022',
    section: '4',
    code: '4.1',
    name: 'General',
    description: 'Establish the context for risk management, including organizational context, risk management context, and risk criteria.',
    guidance: 'Document the internal and external context for information security risk management and establish risk criteria.',
    status: 'not-fulfilled',
    tags: ['risk-management', 'context'],
    evidence: '',
    notes: '',
    responsibleParty: 'Risk Management',
    lastAssessmentDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'iso-27005-4.2',
    standardId: 'iso-27005-2022',
    section: '4',
    code: '4.2',
    name: 'Risk Assessment',
    description: 'Identify, analyze, and evaluate information security risks.',
    guidance: 'Implement a structured risk assessment process including risk identification, analysis, and evaluation phases.',
    status: 'not-fulfilled',
    tags: ['risk-management', 'assessment'],
    evidence: '',
    notes: '',
    responsibleParty: 'Risk Management',
    lastAssessmentDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'iso-27005-4.3',
    standardId: 'iso-27005-2022',
    section: '4',
    code: '4.3',
    name: 'Risk Treatment',
    description: 'Select and implement appropriate risk treatment options.',
    guidance: 'Develop and implement risk treatment plans based on selected risk treatment options (mitigate, accept, avoid, transfer).',
    status: 'not-fulfilled',
    tags: ['risk-management', 'treatment'],
    evidence: '',
    notes: '',
    responsibleParty: 'Risk Management',
    lastAssessmentDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'iso-27005-4.4',
    standardId: 'iso-27005-2022',
    section: '4',
    code: '4.4',
    name: 'Risk Acceptance',
    description: 'Decide whether to accept the risk based on the risk acceptance criteria.',
    guidance: 'Implement a formal risk acceptance process with appropriate management sign-off.',
    status: 'not-fulfilled',
    tags: ['risk-management', 'acceptance'],
    evidence: '',
    notes: '',
    responsibleParty: 'Executive Management',
    lastAssessmentDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'iso-27005-4.5',
    standardId: 'iso-27005-2022',
    section: '4',
    code: '4.5',
    name: 'Risk Communication and Consultation',
    description: 'Communicate and consult with stakeholders throughout the risk management process.',
    guidance: 'Establish communication channels and regular consultation with stakeholders at all stages of risk management.',
    status: 'not-fulfilled',
    tags: ['risk-management', 'communication'],
    evidence: '',
    notes: '',
    responsibleParty: 'Risk Management',
    lastAssessmentDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'iso-27005-4.6',
    standardId: 'iso-27005-2022',
    section: '4',
    code: '4.6',
    name: 'Risk Monitoring and Review',
    description: 'Monitor and review the risk management process and its outcomes.',
    guidance: 'Implement ongoing monitoring and scheduled reviews of the risk management process and identified risks.',
    status: 'not-fulfilled',
    tags: ['risk-management', 'monitoring'],
    evidence: '',
    notes: '',
    responsibleParty: 'Risk Management',
    lastAssessmentDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cis-ig1-1.1',
    standardId: 'cis-ig1',
    section: '1',
    code: '1.1',
    name: 'Establish and Maintain Detailed Enterprise Asset Inventory',
    description: "Establish and maintain an accurate, detailed, and up-to-date inventory of all enterprise assets with the potential to store or process data, to include: end-user devices (including portable and mobile), network devices, non-computing/IoT devices, and servers. Ensure the inventory records the network address (if static), hardware address, machine name, enterprise asset owner, department for each asset, and whether the asset has been approved to connect to the network. For mobile end-user devices, MDM type tools can support this process, where appropriate. This inventory includes assets connected to the infrastructure physically, virtually, remotely, and those within cloud environments. Additionally, it includes assets that are regularly connected to the enterprise's network infrastructure, even if they are not under control of the enterprise. Review and update the inventory of all enterprise assets bi-annually, or more frequently.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    
    auditReadyGuidance: `**Purpose**

Establish and maintain an accurate, detailed, and up-to-date inventory of all enterprise assets with the potential to store or process data, to include: end-user devices (including portable and mobile), network devices, non-computing/IoT devices, and servers. Ensure the inventory records the network address (if static), hardware address, machine name, enterprise asset owner, department for each asset, and whether the asset has been approved to connect to the network. For mobile end-user devices, MDM type tools can support this process where appropriate. This inventory includes assets connected to the infrastructure physically, virtually, remotely, and those within cloud environments. Additionally, it includes assets that are regularly connected to the enterprise’s network infrastructure, even if they are not under control of the enterprise. Review and update the inventory of all enterprise assets bi-annually or more frequently.

**Implementation**

* Implement automated asset discovery tools to maintain an up-to-date inventory
* Include all enterprise assets: end-user devices, network devices, IoT devices, and servers
* Record key information for each asset: network address, hardware address, machine name, owner, department
* Ensure both on-premises and cloud-based assets are included in the inventory
* Review and update the inventory at least bi-annually
* For unauthorized assets, establish a formal process for detection and remediation
`,
    tags: ['tag-device'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-1.2',
    standardId: 'cis-ig1',
    section: '1',
    code: '1.2',
    name: 'Address Unauthorized Assets',
    description: 'Ensure that a process exists to address unauthorized assets on a weekly basis. The enterprise may choose to remove the asset from the network, deny the asset from connecting remotely to the network, or quarantine the asset.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Ensure that a process exists to address unauthorized assets on a weekly basis. The enterprise may choose to remove the asset from the network, deny the asset from connecting remotely to the network, or quarantine the asset.\n\n \n- Implement automated asset discovery tools to maintain an up-to-date inventory\n- Include all enterprise assets: end-user devices, network devices, IoT devices, and servers\n- Record key information for each asset: network address, hardware address, machine name, owner, department\n- Ensure both on-premises and cloud-based assets are included in the inventory\n- Review and update the inventory at least bi-annually\n- For unauthorized assets, establish a formal process for detection and remediation

**Implementation**

* \n- Implement automated asset discovery tools to maintain an up-to-date inventory\n- Include all enterprise assets: end-user devices, network devices, IoT devices, and servers\n- Record key information for each asset: network address, hardware address, machine name, owner, department\n- Ensure both on-premises and cloud-based assets are included in the inventory\n- Review and update the inventory at least bi-annually\n- For unauthorized assets, establish a formal process for detection and remediation`,

    tags: ['tag-device'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-2.1',
    standardId: 'cis-ig1',
    section: '2',
    code: '2.1',
    name: 'Establish and Maintain a Software Inventory',
    description: 'Establish and maintain a detailed inventory of all licensed software installed on enterprise assets. The software inventory must document the title, publisher, initial install/use date, and business purpose for each entry; where appropriate, include the Uniform Resource Locator (URL), app store(s), version(s), deployment mechanism, decommission date, and number of licenses. Review and update the software inventory bi-annually, or more frequently.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a detailed inventory of all licensed software installed on enterprise assets. The software inventory must document the title, publisher, initial install/use date, and business  for each entry; where appropriate, include the Uniform Resource Locator (URL), app store(s), version(s), deployment mechanism, decommission date, and number of licenses. Review and update the software inventory bi-annually, or more frequently.\n\n \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor

**Implementation**

* \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor`,

    tags: ['tag-application'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-2.2',
    standardId: 'cis-ig1',
    section: '2',
    code: '2.2',
    name: 'Ensure Authorized Software is Currently Supported',
    description: 'Ensure that only currently supported software is designated as authorized in the software inventory for enterprise assets. If software is unsupported, yet necessary for the fulfillment of the enterprise’s mission, document an exception detailing mitigating controls and residual risk acceptance. For any unsupported software without an exception documentation, designate as unauthorized. Review the software list to verify software support at least monthly, or more frequently.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Ensure that only currently supported software is designated as authorized in the software inventory for enterprise assets. If software is unsupported, yet necessary for the fulfillment of the enterprise’s mission, document an exception detailing mitigating controls and residual risk acceptance. For any unsupported software without an exception documentation, designate as unauthorized. Review the software list to verify software support at least monthly, or more frequently.\n\n \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor

**Implementation**

* \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor`,

    tags: ['tag-application'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-2.3',
    standardId: 'cis-ig1',
    section: '2',
    code: '2.3',
    name: 'Address Unauthorized Software',
    description: 'Ensure that unauthorized software is either removed from use on enterprise assets or receives a documented exception. Review monthly, or more frequently.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Ensure that unauthorized software is either removed from use on enterprise assets or receives a documented exception. Review monthly, or more frequently.\n\n \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor

**Implementation**

* \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor`,

    tags: ['tag-application'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-3.1',
    standardId: 'cis-ig1',
    section: '3',
    code: '3.1',
    name: 'Establish and Maintain a Data Management Process',
    description: 'Establish and maintain a documented data management process. In the process, address data sensitivity, data owner, handling of data, data retention limits, and disposal requirements, based on sensitivity and retention standards for the enterprise. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a documented data management process. In the process, address data sensitivity, data owner, handling of data, data retention limits, and disposal requirements, based on sensitivity and retention standards for the enterprise. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,

    tags: ['tag-data-protection'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-3.2',
    standardId: 'cis-ig1',
    section: '3',
    code: '3.2',
    name: 'Establish and Maintain a Data Inventory',
    description: 'Establish and maintain a data inventory based on the enterprise’s data management process. Inventory sensitive data, at a minimum. Review and update inventory annually, at a minimum, with a priority on sensitive data.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a data inventory based on the enterprise’s data management process. Inventory sensitive data, at a minimum. Review and update inventory annually, at a minimum, with a priority on sensitive data.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,

    tags: ['tag-data-protection'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-3.3',
    standardId: 'cis-ig1',
    section: '3',
    code: '3.3',
    name: 'Configure Data Access Control Lists',
    description: 'Configure data access control lists based on a user’s need to know. Apply data access control lists, also known as access permissions, to local and remote file systems, databases, and applications.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Configure data access control lists based on a user’s need to know. Apply data access control lists, also known as access permissions, to local and remote file systems, databases, and applications.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,

    tags: ['tag-data-protection'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-3.4',
    standardId: 'cis-ig1',
    section: '3',
    code: '3.4',
    name: 'Enforce Data Retention',
    description: 'Retain data according to the enterprise’s documented data management process. Data retention must include both minimum and maximum timelines.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Retain data according to the enterprise’s documented data management process. Data retention must include both minimum and maximum timelines.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,

    tags: ['tag-data-protection'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-3.5',
    standardId: 'cis-ig1',
    section: '3',
    code: '3.5',
    name: 'Securely Dispose of Data',
    description: 'Securely dispose of data as outlined in the enterprise’s documented data management process. Ensure the disposal process and method are commensurate with the data sensitivity.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Securely dispose of data as outlined in the enterprise’s documented data management process. Ensure the disposal process and method are commensurate with the data sensitivity.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,

    tags: ['tag-data-protection'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-3.6',
    standardId: 'cis-ig1',
    section: '3',
    code: '3.6',
    name: 'Encrypt Data on End-User Devices',
    description: 'Encrypt data on end-user devices containing sensitive data. Example implementations can include: Windows BitLocker®, Apple FileVault®, Linux® dm-crypt.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Encrypt data on end-user devices containing sensitive data. Example s can include: Windows BitLocker®, Apple FileVault®, Linux® dm-crypt.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* s can include: Windows BitLocker®, Apple FileVault®, Linux® dm-crypt.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,

    tags: ['tag-data-protection'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-4.1',
    standardId: 'cis-ig1',
    section: '4',
    code: '4.1',
    name: 'Establish and Maintain a Secure Configuration Process',
    description: 'Establish and maintain a documented secure configuration process for enterprise assets (end-user devices, including portable and mobile, non-computing/IoT devices, and servers) and software (operating systems and applications). Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a documented secure configuration process for enterprise assets (end-user devices, including portable and mobile, non-computing/IoT devices, and servers) and software (operating systems and applications). Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-4.2',
    standardId: 'cis-ig1',
    section: '4',
    code: '4.2',
    name: 'Establish and Maintain a Secure Configuration Process for Network Infrastructure',
    description: 'Establish and maintain a documented secure configuration process for network devices. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a documented secure configuration process for network devices. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-4.3',
    standardId: 'cis-ig1',
    section: '4',
    code: '4.3',
    name: 'Configure Automatic Session Locking on Enterprise Assets',
    description: 'Configure automatic session locking on enterprise assets after a defined period of inactivity. For general purpose operating systems, the period must not exceed 15 minutes. For mobile end-user devices, the period must not exceed 2 minutes.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Configure automatic session locking on enterprise assets after a defined period of inactivity. For general  operating systems, the period must not exceed 15 minutes. For mobile end-user devices, the period must not exceed 2 minutes.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-4.4',
    standardId: 'cis-ig1',
    section: '4',
    code: '4.4',
    name: 'Implement and Manage a Firewall on Servers',
    description: 'Implement and manage a firewall on servers, where supported. Example implementations include a virtual firewall, operating system firewall, or a third-party firewall agent.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Implement and manage a firewall on servers, where supported. Example s include a virtual firewall, operating system firewall, or a third-party firewall agent.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* s include a virtual firewall, operating system firewall, or a third-party firewall agent.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-4.5',
    standardId: 'cis-ig1',
    section: '4',
    code: '4.5',
    name: 'Implement and Manage a Firewall on End-User Devices',
    description: 'Implement and manage a host-based firewall or port-filtering tool on end-user devices, with a default-deny rule that drops all traffic except those services and ports that are explicitly allowed.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Implement and manage a host-based firewall or port-filtering tool on end-user devices, with a default-deny rule that drops all traffic except those services and ports that are explicitly allowed.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-4.6',
    standardId: 'cis-ig1',
    section: '4',
    code: '4.6',
    name: 'Securely Manage Enterprise Assets and Software',
    description: 'Securely manage enterprise assets and software. Example implementations include managing configuration through version-controlled Infrastructure-as-Code (IaC) and accessing administrative interfaces over secure network protocols, such as Secure Shell (SSH) and Hypertext Transfer Protocol Secure (HTTPS). Do not use insecure management protocols, such as Telnet (Teletype Network) and HTTP, unless operationally essential.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Securely manage enterprise assets and software. Example s include managing configuration through version-controlled Infrastructure-as-Code (IaC) and accessing administrative interfaces over secure network protocols, such as Secure Shell (SSH) and Hypertext Transfer Protocol Secure (HTTPS). Do not use insecure management protocols, such as Telnet (Teletype Network) and HTTP, unless operationally essential.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* s include managing configuration through version-controlled Infrastructure-as-Code (IaC) and accessing administrative interfaces over secure network protocols, such as Secure Shell (SSH) and Hypertext Transfer Protocol Secure (HTTPS). Do not use insecure management protocols, such as Telnet (Teletype Network) and HTTP, unless operationally essential.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-4.7',
    standardId: 'cis-ig1',
    section: '4',
    code: '4.7',
    name: 'Manage Default Accounts on Enterprise Assets and Software',
    description: 'Manage default accounts on enterprise assets and software, such as root, administrator, and other pre-configured vendor accounts. Example implementations can include: disabling default accounts or making them unusable.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Manage default accounts on enterprise assets and software, such as root, administrator, and other pre-configured vendor accounts. Example s can include: disabling default accounts or making them unusable.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* s can include: disabling default accounts or making them unusable.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-5.1',
    standardId: 'cis-ig1',
    section: '5',
    code: '5.1',
    name: 'Establish and Maintain an Inventory of Accounts',
    description: 'Establish and maintain an inventory of all accounts managed in the enterprise. The inventory must at a minimum include user, administrator, and service accounts. The inventory, at a minimum, should contain the person’s name, username, start/stop dates, and department. Validate that all active accounts are authorized, on a recurring schedule at a minimum quarterly, or more frequently.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain an inventory of all accounts managed in the enterprise. The inventory must at a minimum include user, administrator, and service accounts. The inventory, at a minimum, should contain the person’s name, username, start/stop dates, and department. Validate that all active accounts are authorized, on a recurring schedule at a minimum quarterly, or more frequently.\n\n \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts

**Implementation**

* \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts`,

    tags: ['tag-identity'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-5.2',
    standardId: 'cis-ig1',
    section: '5',
    code: '5.2',
    name: 'Use Unique Passwords',
    description: 'Use unique passwords for all enterprise assets. Best practice implementation includes, at a minimum, an 8-character password for accounts using Multi-Factor Authentication (MFA) and a 14-character password for accounts not using MFA.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Use unique passwords for all enterprise assets. Best practice  includes, at a minimum, an 8-character password for accounts using Multi-Factor Authentication (MFA) and a 14-character password for accounts not using MFA.\n\n \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts

**Implementation**

* includes, at a minimum, an 8-character password for accounts using Multi-Factor Authentication (MFA) and a 14-character password for accounts not using MFA.\n\n \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts`,

    tags: ['tag-identity'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-5.3',
    standardId: 'cis-ig1',
    section: '5',
    code: '5.3',
    name: 'Disable Dormant Accounts',
    description: 'Delete or disable any dormant accounts after a period of 45 days of inactivity, where supported.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Delete or disable any dormant accounts after a period of 45 days of inactivity, where supported.\n\n \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts

**Implementation**

* \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts`,

    tags: ['tag-identity'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-5.4',
    standardId: 'cis-ig1',
    section: '5',
    code: '5.4',
    name: 'Restrict Administrator Privileges to Dedicated Administrator Accounts',
    description: 'Restrict administrator privileges to dedicated administrator accounts on enterprise assets. Conduct general computing activities, such as internet browsing, email, and productivity suite use, from the user’s primary, non-privileged account.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Restrict administrator privileges to dedicated administrator accounts on enterprise assets. Conduct general computing activities, such as internet browsing, email, and productivity suite use, from the user’s primary, non-privileged account.\n\n \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts

**Implementation**

* \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts`,

    tags: ['tag-identity'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-6.1',
    standardId: 'cis-ig1',
    section: '6',
    code: '6.1',
    name: 'Establish an Access Granting Process',
    description: 'Establish and follow a documented process, preferably automated, for granting access to enterprise assets upon new hire or role change of a user.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and follow a documented process, preferably automated, for granting access to enterprise assets upon new hire or role change of a user.\n\n \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need

**Implementation**

* \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need`,

    tags: ['tag-identity'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-6.2',
    standardId: 'cis-ig1',
    section: '6',
    code: '6.2',
    name: 'Establish an Access Revoking Process',
    description: 'Establish and follow a process, preferably automated, for revoking access to enterprise assets, through disabling accounts immediately upon termination, rights revocation, or role change of a user. Disabling accounts, instead of deleting accounts, may be necessary to preserve audit trails.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and follow a process, preferably automated, for revoking access to enterprise assets, through disabling accounts immediately upon termination, rights revocation, or role change of a user. Disabling accounts, instead of deleting accounts, may be necessary to preserve audit trails.\n\n \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need

**Implementation**

* \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need`,

    tags: ['tag-identity'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-6.3',
    standardId: 'cis-ig1',
    section: '6',
    code: '6.3',
    name: 'Require MFA for Externally-Exposed Applications',
    description: 'Require all externally-exposed enterprise or third-party applications to enforce MFA, where supported. Enforcing MFA through a directory service or SSO provider is a satisfactory implementation of this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Require all externally-exposed enterprise or third-party applications to enforce MFA, where supported. Enforcing MFA through a directory service or SSO provider is a satisfactory  of this Safeguard.\n\n \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need

**Implementation**

* of this Safeguard.\n\n \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need`,

    tags: ['tag-identity'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-6.4',
    standardId: 'cis-ig1',
    section: '6',
    code: '6.4',
    name: 'Require MFA for Remote Network Access',
    description: 'Require MFA for remote network access.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Require MFA for remote network access.\n\n \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need

**Implementation**

* \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need`,

    tags: ['tag-identity'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-6.5',
    standardId: 'cis-ig1',
    section: '6',
    code: '6.5',
    name: 'Require MFA for Administrative Access',
    description: 'Require MFA for all administrative access accounts, where supported, on all enterprise assets, whether managed on-site or through a service provider.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Require MFA for all administrative access accounts, where supported, on all enterprise assets, whether managed on-site or through a service provider.\n\n \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need

**Implementation**

* \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need`,

    tags: ['tag-identity'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-7.1',
    standardId: 'cis-ig1',
    section: '7',
    code: '7.1',
    name: 'Establish and Maintain a Vulnerability Management Process',
    description: 'Establish and maintain a documented vulnerability management process for enterprise assets. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a documented vulnerability management process for enterprise assets. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls

**Implementation**

* \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-7.2',
    standardId: 'cis-ig1',
    section: '7',
    code: '7.2',
    name: 'Establish and Maintain a Remediation Process',
    description: 'Establish and maintain a risk-based remediation strategy documented in a remediation process, with monthly, or more frequent, reviews.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a risk-based remediation strategy documented in a remediation process, with monthly, or more frequent, reviews.\n\n \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls

**Implementation**

* \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-7.3',
    standardId: 'cis-ig1',
    section: '7',
    code: '7.3',
    name: 'Perform Automated Operating System Patch Management',
    description: 'Perform operating system updates on enterprise assets through automated patch management on a monthly, or more frequent, basis.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Perform operating system updates on enterprise assets through automated patch management on a monthly, or more frequent, basis.\n\n \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls

**Implementation**

* \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-7.4',
    standardId: 'cis-ig1',
    section: '7',
    code: '7.4',
    name: 'Perform Automated Application Patch Management',
    description: 'Perform application updates on enterprise assets through automated patch management on a monthly, or more frequent, basis.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Perform application updates on enterprise assets through automated patch management on a monthly, or more frequent, basis.\n\n \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls

**Implementation**

* \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-8.1',
    standardId: 'cis-ig1',
    section: '8',
    code: '8.1',
    name: 'Establish and Maintain an Audit Log Management Process',
    description: 'Establish and maintain a documented audit log management process that defines the enterprise’s logging requirements. At a minimum, address the collection, review, and retention of audit logs for enterprise assets. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a documented audit log management process that defines the enterprise’s logging requirements. At a minimum, address the collection, review, and retention of audit logs for enterprise assets. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-8.2',
    standardId: 'cis-ig1',
    section: '8',
    code: '8.2',
    name: 'Collect Audit Logs',
    description: 'Collect audit logs. Ensure that logging, per the enterprise’s audit log management process, has been enabled across enterprise assets.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Collect audit logs. Ensure that logging, per the enterprise’s audit log management process, has been enabled across enterprise assets.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-8.3',
    standardId: 'cis-ig1',
    section: '8',
    code: '8.3',
    name: 'Ensure Adequate Audit Log Storage',
    description: 'Ensure that logging destinations maintain adequate storage to comply with the enterprise’s audit log management process.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Ensure that logging destinations maintain adequate storage to comply with the enterprise’s audit log management process.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-9.1',
    standardId: 'cis-ig1',
    section: '9',
    code: '9.1',
    name: 'Ensure Use of Only Fully Supported Browsers and Email Clients',
    description: 'Ensure only fully supported browsers and email clients are allowed to execute in the enterprise, only using the latest version of browsers and email clients provided through the vendor.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Ensure only fully supported browsers and email clients are allowed to execute in the enterprise, only using the latest version of browsers and email clients provided through the vendor.\n\n \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients

**Implementation**

* \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-9.2',
    standardId: 'cis-ig1',
    section: '9',
    code: '9.2',
    name: 'Use DNS Filtering Services',
    description: 'Use DNS filtering services on all end-user devices, including remote and on-premises assets, to block access to known malicious domains.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Use DNS filtering services on all end-user devices, including remote and on-premises assets, to block access to known malicious domains.\n\n \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients

**Implementation**

* \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-10.1',
    standardId: 'cis-ig1',
    section: '10',
    code: '10.1',
    name: 'Deploy and Maintain Anti-Malware Software',
    description: 'Deploy and maintain anti-malware software on all enterprise assets.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Deploy and maintain anti-malware software on all enterprise assets.\n\n \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution

**Implementation**

* \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-10.2',
    standardId: 'cis-ig1',
    section: '10',
    code: '10.2',
    name: 'Configure Automatic Anti-Malware Signature Updates',
    description: 'Configure automatic updates for anti-malware signature files on all enterprise assets.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Configure automatic updates for anti-malware signature files on all enterprise assets.\n\n \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution

**Implementation**

* \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-10.3',
    standardId: 'cis-ig1',
    section: '10',
    code: '10.3',
    name: 'Disable Autorun and Autoplay for Removable Media',
    description: 'Disable autorun and autoplay auto-execute functionality for removable media.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Disable autorun and autoplay auto-execute functionality for removable media.\n\n \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution

**Implementation**

* \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-11.1',
    standardId: 'cis-ig1',
    section: '11',
    code: '11.1',
    name: 'Establish and Maintain a Data Recovery Process',
    description: 'Establish and maintain a documented data recovery process that includes detailed backup procedures. In the process, address the scope of data recovery activities, recovery prioritization, and the security of backup data. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a documented data recovery process that includes detailed backup procedures. In the process, address the scope of data recovery activities, recovery prioritization, and the security of backup data. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-11.2',
    standardId: 'cis-ig1',
    section: '11',
    code: '11.2',
    name: 'Perform Automated Backups',
    description: 'Perform automated backups of in-scope enterprise assets. Run backups weekly, or more frequently, based on the sensitivity of the data.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Perform automated backups of in-scope enterprise assets. Run backups weekly, or more frequently, based on the sensitivity of the data.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-11.3',
    standardId: 'cis-ig1',
    section: '11',
    code: '11.3',
    name: 'Protect Recovery Data',
    description: 'Protect recovery data with equivalent controls to the original data. Reference encryption or data separation, based on requirements.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Protect recovery data with equivalent controls to the original data. Reference encryption or data separation, based on requirements.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-11.4',
    standardId: 'cis-ig1',
    section: '11',
    code: '11.4',
    name: 'Establish and Maintain an Isolated Instance of Recovery Data',
    description: 'Establish and maintain an isolated instance of recovery data. Example implementations include, version controlling backup destinations through offline, cloud, or off-site systems or services.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain an isolated instance of recovery data. Example s include, version controlling backup destinations through offline, cloud, or off-site systems or services.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* s include, version controlling backup destinations through offline, cloud, or off-site systems or services.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-12.1',
    standardId: 'cis-ig1',
    section: '12',
    code: '12.1',
    name: 'Ensure Network Infrastructure is Up-to-Date',
    description: 'Ensure network infrastructure is kept up-to-date. Example implementations include running the latest stable release of software and/or using currently supported network as a service (NaaS) offerings. Review software versions monthly, or more frequently, to verify software support.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Ensure network infrastructure is kept up-to-date. Example s include running the latest stable release of software and/or using currently supported network as a service (NaaS) offerings. Review software versions monthly, or more frequently, to verify software support.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* s include running the latest stable release of software and/or using currently supported network as a service (NaaS) offerings. Review software versions monthly, or more frequently, to verify software support.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-13.1',
    standardId: 'cis-ig1',
    section: '13',
    code: '13.1',
    name: 'Centralize Security Event Alerting',
    description: 'Centralize security event alerting across enterprise assets for log correlation and analysis. Best practice implementation requires the use of a SIEM, which includes vendor-defined event correlation alerts. A log analytics platform configured with security-relevant correlation alerts also satisfies this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Centralize security event alerting across enterprise assets for log correlation and analysis. Best practice  requires the use of a SIEM, which includes vendor-defined event correlation alerts. A log analytics platform configured with security-relevant correlation alerts also satisfies this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* requires the use of a SIEM, which includes vendor-defined event correlation alerts. A log analytics platform configured with security-relevant correlation alerts also satisfies this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-14.1',
    standardId: 'cis-ig1',
    section: '14',
    code: '14.1',
    name: 'Establish and Maintain a Security Awareness Program',
    description: 'Establish and maintain a security awareness program. The purpose of a security awareness program is to educate the enterprise’s workforce on how to interact with enterprise assets and data in a secure manner. Conduct training at hire and, at a minimum, annually. Review and update content annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a security awareness program. The  of a security awareness program is to educate the enterprise’s workforce on how to interact with enterprise assets and data in a secure manner. Conduct training at hire and, at a minimum, annually. Review and update content annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-14.2',
    standardId: 'cis-ig1',
    section: '14',
    code: '14.2',
    name: 'Train Workforce Members to Recognize Social Engineering Attacks',
    description: 'Train workforce members to recognize social engineering attacks, such as phishing, business email compromise (BEC), pretexting, and tailgating.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Train workforce members to recognize social engineering attacks, such as phishing, business email compromise (BEC), pretexting, and tailgating.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-14.3',
    standardId: 'cis-ig1',
    section: '14',
    code: '14.3',
    name: 'Train Workforce Members on Authentication Best Practices',
    description: 'Train workforce members on authentication best practices. Example topics include MFA, password composition, and credential management.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Train workforce members on authentication best practices. Example topics include MFA, password composition, and credential management.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-14.4',
    standardId: 'cis-ig1',
    section: '14',
    code: '14.4',
    name: 'Train Workforce on Data Handling Best Practices',
    description: 'Train workforce members on how to identify and properly store, transfer, archive, and destroy sensitive data. This also includes training workforce members on clear screen and desk best practices, such as locking their screen when they step away from their enterprise asset, erasing physical and virtual whiteboards at the end of meetings, and storing data and assets securely.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Train workforce members on how to identify and properly store, transfer, archive, and destroy sensitive data. This also includes training workforce members on clear screen and desk best practices, such as locking their screen when they step away from their enterprise asset, erasing physical and virtual whiteboards at the end of meetings, and storing data and assets securely.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-14.5',
    standardId: 'cis-ig1',
    section: '14',
    code: '14.5',
    name: 'Train Workforce Members on Causes of Unintentional Data Exposure',
    description: 'Train workforce members to be aware of causes for unintentional data exposure. Example topics include mis-delivery of sensitive data, losing a portable end-user device, or publishing data to unintended audiences.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Train workforce members to be aware of causes for unintentional data exposure. Example topics include mis-delivery of sensitive data, losing a portable end-user device, or publishing data to unintended audiences.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-14.6',
    standardId: 'cis-ig1',
    section: '14',
    code: '14.6',
    name: 'Train Workforce Members on Recognizing and Reporting Security Incidents',
    description: 'Train workforce members to be able to recognize a potential incident and be able to report such an incident.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Train workforce members to be able to recognize a potential incident and be able to report such an incident.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-14.7',
    standardId: 'cis-ig1',
    section: '14',
    code: '14.7',
    name: 'Train Workforce on How to Identify and Report if Their Enterprise Assets are Missing Security Updates',
    description: 'Train workforce to understand how to verify and report out-of-date software patches or any failures in automated processes and tools. Part of this training should include notifying IT personnel of any failures in automated processes and tools.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Train workforce to understand how to verify and report out-of-date software patches or any failures in automated processes and tools. Part of this training should include notifying IT personnel of any failures in automated processes and tools.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-14.8',
    standardId: 'cis-ig1',
    section: '14',
    code: '14.8',
    name: 'Train Workforce on the Dangers of Connecting to and Transmitting Enterprise Data Over Insecure Networks',
    description: 'Train workforce members on the dangers of connecting to, and transmitting data over, insecure networks for enterprise activities. If the enterprise has remote workers, training must include guidance to ensure that all users securely configure their home network infrastructure.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Train workforce members on the dangers of connecting to, and transmitting data over, insecure networks for enterprise activities. If the enterprise has remote workers, training must include guidance to ensure that all users securely configure their home network infrastructure.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-15.1',
    standardId: 'cis-ig1',
    section: '15',
    code: '15.1',
    name: 'Establish and Maintain an Inventory of Service Providers',
    description: 'Establish and maintain an inventory of service providers. The inventory is to list all known service providers, include classification(s), and designate an enterprise contact for each service provider. Review and update the inventory annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain an inventory of service providers. The inventory is to list all known service providers, include classification(s), and designate an enterprise contact for each service provider. Review and update the inventory annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-16.1',
    standardId: 'cis-ig1',
    section: '16',
    code: '16.1',
    name: 'Establish and Maintain a Secure Application Development Process',
    description: 'Establish and maintain a secure application development process. In the process, address such items as: secure application design standards, secure coding practices, developer training, vulnerability management, security of third-party code, and application security testing procedures. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a secure application development process. In the process, address such items as: secure application design standards, secure coding practices, developer training, vulnerability management, security of third-party code, and application security testing procedures. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-17.1',
    standardId: 'cis-ig1',
    section: '17',
    code: '17.1',
    name: 'Designate Personnel to Manage Incident Handling',
    description: 'Designate one key person, and at least one backup, who will manage the enterprise’s incident handling process. Management personnel are responsible for the coordination and documentation of incident response and recovery efforts and can consist of employees internal to the enterprise, service providers, or a hybrid approach. If using a service provider, designate at least one person internal to the enterprise to oversee any third-party work. Review annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Designate one key person, and at least one backup, who will manage the enterprise’s incident handling process. Management personnel are responsible for the coordination and documentation of incident response and recovery efforts and can consist of employees internal to the enterprise, service providers, or a hybrid approach. If using a service provider, designate at least one person internal to the enterprise to oversee any third-party work. Review annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-17.2',
    standardId: 'cis-ig1',
    section: '17',
    code: '17.2',
    name: 'Establish and Maintain Contact Information for Reporting Security Incidents',
    description: 'Establish and maintain contact information for parties that need to be informed of security incidents. Contacts may include internal staff, service providers, law enforcement, cyber insurance providers, relevant government agencies, Information Sharing and Analysis Center (ISAC) partners, or other stakeholders. Verify contacts annually to ensure that information is up-to-date.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain contact information for parties that need to be informed of security incidents. Contacts may include internal staff, service providers, law enforcement, cyber insurance providers, relevant government agencies, Information Sharing and Analysis Center (ISAC) partners, or other stakeholders. Verify contacts annually to ensure that information is up-to-date.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig1-17.3',
    standardId: 'cis-ig1',
    section: '17',
    code: '17.3',
    name: 'Establish and Maintain an Enterprise Process for Reporting Incidents',
    description: 'Establish and maintain a documented enterprise process for the workforce to report security incidents. The process includes reporting timeframe, personnel to report to, mechanism for reporting, and the minimum information to be reported. Ensure the process is publicly available to all of the workforce. Review annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a documented enterprise process for the workforce to report security incidents. The process includes reporting timeframe, personnel to report to, mechanism for reporting, and the minimum information to be reported. Ensure the process is publicly available to all of the workforce. Review annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-1.1',
    standardId: 'cis-ig2',
    section: '1',
    code: '1.1',
    name: 'Establish and Maintain Detailed Enterprise Asset Inventory',
    description: "Establish and maintain an accurate, detailed, and up-to-date inventory of all enterprise assets with the potential to store or process data, to include: end-user devices (including portable and mobile), network devices, non-computing/IoT devices, and servers. Ensure the inventory records the network address (if static), hardware address, machine name, enterprise asset owner, department for each asset, and whether the asset has been approved to connect to the network. For mobile end-user devices, MDM type tools can support this process, where appropriate. This inventory includes assets connected to the infrastructure physically, virtually, remotely, and those within cloud environments. Additionally, it includes assets that are regularly connected to the enterprise's network infrastructure, even if they are not under control of the enterprise. Review and update the inventory of all enterprise assets bi-annually, or more frequently.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    tags: ['tag-device'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-1.2',
    standardId: 'cis-ig2',
    section: '1',
    code: '1.2',
    name: 'Address Unauthorized Assets',
    description: 'Ensure that a process exists to address unauthorized assets on a weekly basis. The enterprise may choose to remove the asset from the network, deny the asset from connecting remotely to the network, or quarantine the asset.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Ensure that a process exists to address unauthorized assets on a weekly basis. The enterprise may choose to remove the asset from the network, deny the asset from connecting remotely to the network, or quarantine the asset.\n\n \n- Implement automated asset discovery tools to maintain an up-to-date inventory\n- Include all enterprise assets: end-user devices, network devices, IoT devices, and servers\n- Record key information for each asset: network address, hardware address, machine name, owner, department\n- Ensure both on-premises and cloud-based assets are included in the inventory\n- Review and update the inventory at least bi-annually\n- For unauthorized assets, establish a formal process for detection and remediation

**Implementation**

* \n- Implement automated asset discovery tools to maintain an up-to-date inventory\n- Include all enterprise assets: end-user devices, network devices, IoT devices, and servers\n- Record key information for each asset: network address, hardware address, machine name, owner, department\n- Ensure both on-premises and cloud-based assets are included in the inventory\n- Review and update the inventory at least bi-annually\n- For unauthorized assets, establish a formal process for detection and remediation`,

    tags: ['tag-device'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // ... (fortsätt på samma sätt för resterande IG2 requirements enligt tabellen)
  {
    id: 'cis-ig2-1.3',
    standardId: 'cis-ig2',
    section: '1',
    code: '1.3',
    name: 'Utilize an Active Discovery Tool',
    description: "Utilize an active discovery tool to identify assets connected to the enterprise's network. Configure the active discovery tool to execute daily, or more frequently.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    tags: ['tag-device'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-1.4',
    standardId: 'cis-ig2',
    section: '1',
    code: '1.4',
    name: 'Use Dynamic Host Configuration Protocol (DHCP) Logging to Update Enterprise Asset Inventory',
    description: "Use DHCP logging on all DHCP servers or Internet Protocol (IP) address management tools to update the enterprise's asset inventory. Review and use logs to update the enterprise's asset inventory weekly, or more frequently.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    tags: ['tag-device'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-2.1',
    standardId: 'cis-ig2',
    section: '2',
    code: '2.1',
    name: 'Establish and Maintain a Software Inventory',
    description: 'Establish and maintain a detailed inventory of all licensed software installed on enterprise assets. The software inventory must document the title, publisher, initial install/use date, and business purpose for each entry; where appropriate, include the Uniform Resource Locator (URL), app store(s), version(s), deployment mechanism, decommission date, and number of licenses. Review and update the software inventory bi-annually, or more frequently.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a detailed inventory of all licensed software installed on enterprise assets. The software inventory must document the title, publisher, initial install/use date, and business  for each entry; where appropriate, include the Uniform Resource Locator (URL), app store(s), version(s), deployment mechanism, decommission date, and number of licenses. Review and update the software inventory bi-annually, or more frequently.\n\n \n- Implement automated asset discovery tools to maintain an up-to-date inventory\n- Include all enterprise assets: end-user devices, network devices, IoT devices, and servers\n- Record key information for each asset: network address, hardware address, machine name, owner, department\n- Ensure both on-premises and cloud-based assets are included in the inventory\n- Review and update the inventory at least bi-annually\n- For unauthorized assets, establish a formal process for detection and remediation

**Implementation**

* \n- Implement automated asset discovery tools to maintain an up-to-date inventory\n- Include all enterprise assets: end-user devices, network devices, IoT devices, and servers\n- Record key information for each asset: network address, hardware address, machine name, owner, department\n- Ensure both on-premises and cloud-based assets are included in the inventory\n- Review and update the inventory at least bi-annually\n- For unauthorized assets, establish a formal process for detection and remediation`,

    tags: ['tag-application'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-2.2',
    standardId: 'cis-ig2',
    section: '2',
    code: '2.2',
    name: 'Ensure Authorized Software is Currently Supported',
    description: "Ensure that only currently supported software is designated as authorized in the software inventory for enterprise assets. If software is unsupported, yet necessary for the fulfillment of the enterprise's mission, document an exception detailing mitigating controls and residual risk acceptance. For any unsupported software without an exception documentation, designate as unauthorized. Review the software list to verify software support at least monthly, or more frequently.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    tags: ['tag-application'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-2.3',
    standardId: 'cis-ig2',
    section: '2',
    code: '2.3',
    name: 'Address Unauthorized Software',
    description: 'Ensure that unauthorized software is either removed from use on enterprise assets or receives a documented exception. Review monthly, or more frequently.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Ensure that unauthorized software is either removed from use on enterprise assets or receives a documented exception. Review monthly, or more frequently.\n\n \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor

**Implementation**

* \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor`,

    tags: ['tag-application'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-2.4',
    standardId: 'cis-ig2',
    section: '2',
    code: '2.4',
    name: 'Utilize Automated Software Inventory Tools',
    description: 'Utilize software inventory tools, when possible, throughout the enterprise to automate the discovery and documentation of installed software.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Utilize software inventory tools, when possible, throughout the enterprise to automate the discovery and documentation of installed software.\n\n \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor

**Implementation**

* \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor`,

    tags: ['tag-application'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-2.5',
    standardId: 'cis-ig2',
    section: '2',
    code: '2.5',
    name: 'Allowlist Authorized Software',
    description: "Use technical controls, such as application allowlisting, to ensure that only authorized software can execute or be accessed. Reassess bi-annually, or more frequently.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    tags: ['tag-application'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-2.6',
    standardId: 'cis-ig2',
    section: '2',
    code: '2.6',
    name: 'Allowlist Authorized Libraries',
    description: "Use technical controls to ensure that only authorized software libraries, such as specific .dll, .ocx, and .so files, are allowed to load into a system process. Block unauthorized libraries from loading into a system process. Reassess bi-annually, or more frequently.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    tags: ['tag-application'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-3.1',
    standardId: 'cis-ig2',
    section: '3',
    code: '3.1',
    name: 'Establish and Maintain a Data Management Process',
    description: "Establish and maintain a documented data management process. In the process, address data sensitivity, data owner, handling of data, data retention limits, and disposal requirements, based on sensitivity and retention standards for the enterprise. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    tags: ['tag-data-protection'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-3.2',
    standardId: 'cis-ig2',
    section: '3',
    code: '3.2',
    name: 'Establish and Maintain a Data Inventory',
    description: "Establish and maintain a data inventory based on the enterprise's data management process. Inventory sensitive data, at a minimum. Review and update inventory annually, at a minimum, with a priority on sensitive data.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    tags: ['tag-data-protection'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-3.3',
    standardId: 'cis-ig2',
    section: '3',
    code: '3.3',
    name: 'Configure Data Access Control Lists',
    description: "Configure data access control lists based on a user's need to know. Apply data access control lists, also known as access permissions, to local and remote file systems, databases, and applications.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    tags: ['tag-data-protection'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-3.4',
    standardId: 'cis-ig2',
    section: '3',
    code: '3.4',
    name: 'Enforce Data Retention',
    description: "Retain data according to the enterprise's documented data management process. Data retention must include both minimum and maximum timelines.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    tags: ['tag-data-protection'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-3.5',
    standardId: 'cis-ig2',
    section: '3',
    code: '3.5',
    name: 'Securely Dispose of Data',
    description: "Securely dispose of data as outlined in the enterprise's documented data management process. Ensure the disposal process and method are commensurate with the data sensitivity.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    tags: ['tag-data-protection'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-3.6',
    standardId: 'cis-ig2',
    section: '3',
    code: '3.6',
    name: 'Encrypt Data on End-User Devices',
    description: "Encrypt data on end-user devices containing sensitive data. Example implementations can include: Windows BitLocker®, Apple FileVault®, Linux® dm-crypt.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    tags: ['tag-data-protection'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-3.7',
    standardId: 'cis-ig2',
    section: '3',
    code: '3.7',
    name: 'Establish and Maintain a Data Classification Scheme',
    description: "Establish and maintain an overall data classification scheme for the enterprise. Enterprises may use labels, such as 'Sensitive,' 'Confidential,' and 'Public,' and classify their data according to those labels. Review and update the classification scheme annually, or when significant enterprise changes occur that could impact this Safeguard.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    tags: ['tag-data-protection'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-3.8',
    standardId: 'cis-ig2',
    section: '3',
    code: '3.8',
    name: 'Document Data Flows',
    description: "Document data flows. Data flow documentation includes service provider data flows and should be based on the enterprise's data management process. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    tags: ['tag-data-protection'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-3.9',
    standardId: 'cis-ig2',
    section: '3',
    code: '3.9',
    name: 'Encrypt Data on Removable Media',
    description: "Encrypt data on removable media.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Encrypt data on removable media.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,
    tags: ['tag-data-protection'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-3.10',
    standardId: 'cis-ig2',
    section: '3',
    code: '3.10',
    name: 'Encrypt Sensitive Data in Transit',
    description: "Encrypt sensitive data in transit. Example implementations can include: Transport Layer Security (TLS) and Open Secure Shell (OpenSSH).",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Encrypt sensitive data in transit. Example implementations can include Transport Layer Security (TLS) and Open Secure Shell (OpenSSH).\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,
    tags: ['tag-data-protection'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-3.11',
    standardId: 'cis-ig2',
    section: '3',
    code: '3.11',
    name: 'Encrypt Sensitive Data at Rest',
    description: "Encrypt sensitive data at rest on servers, applications, and databases. Storage-layer encryption, also known as server-side encryption, meets the minimum requirement of this Safeguard. Additional encryption methods may include application-layer encryption, also known as client-side encryption, where access to the data storage device(s) does not permit access to the plain-text data.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Encrypt sensitive data at rest on servers, applications, and databases. Storage-layer encryption, also known as server-side encryption, meets the minimum requirement of this safeguard. Additional encryption methods may include application-layer encryption, also known as client-side encryption, where access to the data storage device(s) does not permit access to the plain-text data.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,
    tags: ['tag-data-protection'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-3.12',
    standardId: 'cis-ig2',
    section: '3',
    code: '3.12',
    name: 'Segment Data Processing and Storage Based on Sensitivity',
    description: "Segment data processing and storage based on the sensitivity of the data. Do not process sensitive data on enterprise assets intended for lower sensitivity data.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Segment data processing and storage based on the sensitivity of the data. Do not process sensitive data on enterprise assets intended for lower sensitivity data.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,
    tags: ['tag-data-protection'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-4.1',
    standardId: 'cis-ig2',
    section: '4',
    code: '4.1',
    name: 'Establish and Maintain a Secure Configuration Process',
    description: "Establish and maintain a documented secure configuration process for enterprise assets (end-user devices, including portable and mobile, non-computing/IoT devices, and servers) and software (operating systems and applications). Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Establish and maintain a documented secure configuration process for enterprise assets (end-user devices, including portable and mobile, non-computing/IoT devices, and servers) and software (operating systems and applications). Review and update documentation annually or when significant enterprise changes occur that could impact this safeguard.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,
    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-4.2',
    standardId: 'cis-ig2',
    section: '4',
    code: '4.2',
    name: 'Establish and Maintain a Secure Configuration Process for Network Infrastructure',
    description: "Establish and maintain a documented secure configuration process for network devices. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Establish and maintain a documented secure configuration process for network devices. Review and update documentation annually or when significant enterprise changes occur that could impact this safeguard.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,
    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-4.3',
    standardId: 'cis-ig2',
    section: '4',
    code: '4.3',
    name: 'Configure Automatic Session Locking on Enterprise Assets',
    description: "Configure automatic session locking on enterprise assets after a defined period of inactivity. For general purpose operating systems, the period must not exceed 15 minutes. For mobile end-user devices, the period must not exceed 2 minutes.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Configure automatic session locking on enterprise assets after a defined period of inactivity. For general operating systems, the period must not exceed 15 minutes. For mobile end-user devices, the period must not exceed 2 minutes.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,
    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-4.4',
    standardId: 'cis-ig2',
    section: '4',
    code: '4.4',
    name: 'Implement and Manage a Firewall on Servers',
    description: "Implement and manage a firewall on servers, where supported. Example implementations include a virtual firewall, operating system firewall, or a third-party firewall agent.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Implement and manage a firewall on servers, where supported. Example implementations include a virtual firewall, operating system firewall, or a third-party firewall agent.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,
    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-4.5',
    standardId: 'cis-ig2',
    section: '4',
    code: '4.5',
    name: 'Implement and Manage a Firewall on End-User Devices',
    description: "Implement and manage a host-based firewall or port-filtering tool on end-user devices, with a default-deny rule that drops all traffic except those services and ports that are explicitly allowed.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Implement and manage a host-based firewall or port-filtering tool on end-user devices, with a default-deny rule that drops all traffic except those services and ports that are explicitly allowed.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,
    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-4.6',
    standardId: 'cis-ig2',
    section: '4',
    code: '4.6',
    name: 'Securely Manage Enterprise Assets and Software Configurations',
    description: "Establish, implement, and actively manage (track, report on, correct) the security configuration of enterprise assets and software. Review and update configurations at least annually, or more frequently.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Securely manage enterprise assets and software. Example implementations include managing configuration through version-controlled Infrastructure-as-Code (IaC) and accessing administrative interfaces over secure network protocols, such as Secure Shell (SSH) and Hypertext Transfer Protocol Secure (HTTPS). Do not use insecure management protocols, such as Telnet and HTTP, unless operationally essential.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,
    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-4.7',
    standardId: 'cis-ig2',
    section: '4',
    code: '4.7',
    name: 'Implement Automated Configuration Management Tools',
    description: "Utilize automated tools to maintain and verify security configurations of enterprise assets and software. Review tool effectiveness at least annually, or more frequently.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Manage default accounts on enterprise assets and software, such as root, administrator, and other pre-configured vendor accounts. Example implementations can include disabling default accounts or making them unusable.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,
    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-4.8',
    standardId: 'cis-ig2',
    section: '4',
    code: '4.8',
    name: 'Document and Review Configuration Changes',
    description: "Document all configuration changes to enterprise assets and software. Review and approve changes prior to implementation. Review change documentation at least quarterly, or more frequently.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Uninstall or disable unnecessary services on enterprise assets and software, such as an unused file sharing service, web application module, or service function.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,
    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-4.9',
    standardId: 'cis-ig2',
    section: '4',
    code: '4.9',
    name: 'Enforce Secure Configurations on Network Infrastructure',
    description: "Enforce secure configurations on all network infrastructure devices. Review and update configurations at least annually, or more frequently.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Configure trusted DNS servers on network infrastructure. Example implementations include configuring network devices to use enterprise-controlled DNS servers and/or reputable externally accessible DNS servers.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,
    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-4.10',
    standardId: 'cis-ig2',
    section: '4',
    code: '4.10',
    name: 'Implement Configuration Change Control',
    description: "Implement a configuration change control process for enterprise assets and software. Review and update the process at least annually, or more frequently.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-4.11',
    standardId: 'cis-ig2',
    section: '4',
    code: '4.11',
    name: 'Monitor and Alert on Configuration Changes',
    description: "Monitor and alert on unauthorized configuration changes to enterprise assets and software. Investigate and remediate unauthorized changes promptly.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-5.1',
    standardId: 'cis-ig2',
    section: '5',
    code: '5.1',
    name: 'Establish and Maintain an Account Inventory',
    description: "Establish and maintain an inventory of all accounts managed in the enterprise, including user, administrator, and service accounts. Review and update the inventory at least quarterly, or more frequently.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Establish and maintain an inventory of all accounts managed in the enterprise. The inventory must at a minimum include user, administrator, and service accounts. The inventory, at a minimum, should contain the person's name, username, start/stop dates, and department. Validate that all active accounts are authorized, on a recurring schedule at a minimum quarterly or more frequently.\n\n \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts

**Implementation**

* \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts`,
    tags: ['tag-identity'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-5.2',
    standardId: 'cis-ig2',
    section: '5',
    code: '5.2',
    name: 'Use Unique Accounts',
    description: "Ensure that all accounts are uniquely assigned to an individual or process. Shared accounts must be explicitly authorized and managed. Review at least quarterly, or more frequently.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Use unique passwords for all enterprise assets. Best practice implementation includes, at a minimum, an 8-character password for accounts using Multi-Factor Authentication (MFA) and a 14-character password for accounts not using MFA.\n\n \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts

**Implementation**

* \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts`,
    tags: ['tag-identity'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-5.3',
    standardId: 'cis-ig2',
    section: '5',
    code: '5.3',
    name: 'Disable Dormant Accounts',
    description: "Disable dormant accounts after a defined period of inactivity. Review and update the period at least annually, or more frequently.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Delete or disable any dormant accounts after a period of 45 days of inactivity, where supported.\n\n \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts

**Implementation**

* \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts`,
    tags: ['tag-identity'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-5.4',
    standardId: 'cis-ig2',
    section: '5',
    code: '5.4',
    name: 'Establish and Maintain an Account Management Process',
    description: "Establish and maintain an account management process that includes requesting, approving, creating, modifying, disabling, and deleting accounts. Review and update the process at least annually, or more frequently.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Restrict administrator privileges to dedicated administrator accounts on enterprise assets. Conduct general computing activities, such as internet browsing, email, and productivity suite use, from the user's primary, non-privileged account.\n\n \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts

**Implementation**

* \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts`,
    tags: ['tag-identity'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-5.5',
    standardId: 'cis-ig2',
    section: '5',
    code: '5.5',
    name: 'Review Accounts',
    description: "Review all accounts at least quarterly, or more frequently, to ensure that only authorized accounts exist. Remove or disable unauthorized accounts immediately.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Establish and maintain an inventory of service accounts. The inventory, at a minimum, must contain department owner, review date, and purpose. Perform service account reviews to validate that all active accounts are authorized, on a recurring schedule at a minimum quarterly or more frequently.\n\n \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts

**Implementation**

* \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts`,
    tags: ['tag-identity'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-5.6',
    standardId: 'cis-ig2',
    section: '5',
    code: '5.6',
    name: 'Establish and Maintain an Account Authentication Process',
    description: "Establish and maintain an account authentication process that includes strong authentication methods, such as multi-factor authentication (MFA), for all accounts. Review and update the process at least annually, or more frequently.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Centralize account management through a directory or identity service.\n\n \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts

**Implementation**

* \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts`,
    tags: ['tag-identity'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-6.1',
    standardId: 'cis-ig2',
    section: '6',
    code: '6.1',
    name: 'Establish an Access Granting Process',
    description: "Establish and follow a documented process, preferably automated, for granting access to enterprise assets upon new hire or role change of a user.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Establish and follow a documented process, preferably automated, for granting access to enterprise assets upon new hire or role change of a user.\n\n \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need

**Implementation**

* \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need`,
    tags: ['tag-access-control'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-6.2',
    standardId: 'cis-ig2',
    section: '6',
    code: '6.2',
    name: 'Establish an Access Revoking Process',
    description: "Establish and follow a process, preferably automated, for revoking access to enterprise assets, through disabling accounts immediately upon termination, rights revocation, or role change of a user. Disabling accounts, instead of deleting accounts, may be necessary to preserve audit trails.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Establish and follow a process, preferably automated, for revoking access to enterprise assets, through disabling accounts immediately upon termination, rights revocation, or role change of a user. Disabling accounts, instead of deleting accounts, may be necessary to preserve audit trails.\n\n \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need

**Implementation**

* \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need`,
    tags: ['tag-access-control'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-6.3',
    standardId: 'cis-ig2',
    section: '6',
    code: '6.3',
    name: 'Require MFA for Externally-Exposed Applications',
    description: "Require all externally-exposed enterprise or third-party applications to enforce MFA, where supported. Enforcing MFA through a directory service or SSO provider is a satisfactory implementation of this Safeguard.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Require all externally-exposed enterprise or third-party applications to enforce MFA, where supported. Enforcing MFA through a directory service or SSO provider is a satisfactory implementation of this safeguard.\n\n \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need

**Implementation**

* \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need`,
    tags: ['tag-access-control'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-6.4',
    standardId: 'cis-ig2',
    section: '6',
    code: '6.4',
    name: 'Require MFA for Remote Network Access',
    description: "Require MFA for remote network access.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Require MFA for remote network access.\n\n \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need

**Implementation**

* \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need`,
    tags: ['tag-access-control'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-6.5',
    standardId: 'cis-ig2',
    section: '6',
    code: '6.5',
    name: 'Require MFA for Administrative Access',
    description: "Require MFA for all administrative access accounts, where supported, on all enterprise assets, whether managed on-site or through a service provider.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Require MFA for all administrative access accounts, where supported, on all enterprise assets, whether managed on-site or through a service provider.\n\n \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need

**Implementation**

* \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need`,
    tags: ['tag-access-control'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-6.6',
    standardId: 'cis-ig2',
    section: '6',
    code: '6.6',
    name: 'Establish and Maintain an Inventory of Authentication and Authorization Systems',
    description: "Establish and maintain an inventory of the enterprise's authentication and authorization systems, including those hosted on-site or at a remote service provider. Review and update the inventory, at a minimum, annually, or more frequently.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Establish and maintain an inventory of the enterprise's authentication and authorization systems, including those hosted on-site or at a remote service provider. Review and update the inventory, at a minimum, annually or more frequently.\n\n \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need

**Implementation**

* \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need`,
    tags: ['tag-access-control'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-6.7',
    standardId: 'cis-ig2',
    section: '6',
    code: '6.7',
    name: 'Centralize Access Control',
    description: "Centralize access control for all enterprise assets through a directory service or SSO provider, where supported.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Centralize access control for all enterprise assets through a directory service or SSO provider, where supported.\n\n \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need

**Implementation**

* \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need`,
    tags: ['tag-access-control'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-7.1',
    standardId: 'cis-ig2',
    section: '7',
    code: '7.1',
    name: 'Establish and Maintain a Vulnerability Management Process',
    description: "Establish and maintain a documented vulnerability management process for enterprise assets. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Establish and maintain a documented vulnerability management process for enterprise assets. Review and update documentation annually or when significant enterprise changes occur that could impact this safeguard.\n\n \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls

**Implementation**

* \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls`,
    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-7.2',
    standardId: 'cis-ig2',
    section: '7',
    code: '7.2',
    name: 'Establish and Maintain a Remediation Process',
    description: "Establish and maintain a risk-based remediation strategy documented in a remediation process, with monthly, or more frequent, reviews.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Establish and maintain a risk-based remediation strategy documented in a remediation process, with monthly or more frequent reviews.\n\n \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls

**Implementation**

* \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls`,
    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-7.3',
    standardId: 'cis-ig2',
    section: '7',
    code: '7.3',
    name: 'Perform Automated Operating System Patch Management',
    description: "Perform operating system updates on enterprise assets through automated patch management on a monthly, or more frequent, basis.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Perform operating system updates on enterprise assets through automated patch management on a monthly or more frequent basis.\n\n \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls

**Implementation**

* \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls`,
    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-7.4',
    standardId: 'cis-ig2',
    section: '7',
    code: '7.4',
    name: 'Perform Automated Application Patch Management',
    description: "Perform application updates on enterprise assets through automated patch management on a monthly, or more frequent, basis.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Perform application updates on enterprise assets through automated patch management on a monthly or more frequent basis.\n\n \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls

**Implementation**

* \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls`,
    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-7.5',
    standardId: 'cis-ig2',
    section: '7',
    code: '7.5',
    name: 'Perform Automated Vulnerability Scans of Internal Enterprise Assets',
    description: "Perform automated vulnerability scans of internal enterprise assets on a quarterly, or more frequent, basis. Conduct both authenticated and unauthenticated scans.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Perform automated vulnerability scans of internal enterprise assets on a quarterly or more frequent basis. Conduct both authenticated and unauthenticated scans.\n\n \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls

**Implementation**

* \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls`,
    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-7.6',
    standardId: 'cis-ig2',
    section: '7',
    code: '7.6',
    name: 'Perform Automated Vulnerability Scans of Externally-Exposed Enterprise Assets',
    description: "Perform automated vulnerability scans of externally-exposed enterprise assets. Perform scans on a monthly, or more frequent, basis.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Perform automated vulnerability scans of externally-exposed enterprise assets. Perform scans on a monthly or more frequent basis.\n\n \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls

**Implementation**

* \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls`,
    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-7.7',
    standardId: 'cis-ig2',
    section: '7',
    code: '7.7',
    name: 'Remediate Detected Vulnerabilities',
    description: "Remediate detected vulnerabilities in software through processes and tooling on a monthly, or more frequent, basis, based on the remediation process.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Remediate detected vulnerabilities in software through processes and tooling on a monthly or more frequent basis, based on the remediation process.\n\n \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls

**Implementation**

* \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls`,
    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-8.1',
    standardId: 'cis-ig2',
    section: '8',
    code: '8.1',
    name: 'Establish and Maintain an Audit Log Management Process',
    description: "Establish and maintain a documented audit log management process that defines the enterprise's logging requirements. At a minimum, address the collection, review, and retention of audit logs for enterprise assets. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Establish and maintain a documented audit log management process that defines the enterprise's logging requirements. At a minimum, address the collection, review, and retention of audit logs for enterprise assets. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,
    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-8.2',
    standardId: 'cis-ig2',
    section: '8',
    code: '8.2',
    name: 'Collect Audit Logs',
    description: "Collect audit logs for enterprise assets that store or process sensitive data, as well as for all network traffic that traverses a network boundary. Ensure that the logs are reviewed and retained in accordance with the enterprise's audit log management process.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Collect audit logs. Ensure that logging, per the enterprise's audit log management process, has been enabled across enterprise assets.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,
    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-8.3',
    standardId: 'cis-ig2',
    section: '8',
    code: '8.3',
    name: 'Ensure Adequate Audit Log Storage',
    description: "Ensure that logging destinations maintain adequate storage to comply with the enterprise's audit log management process.",
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,
    auditReadyGuidance: `**Purpose**

Ensure that logging destinations maintain adequate storage to comply with the enterprise's audit log management process.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,
    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-8.4',
    standardId: 'cis-ig2',
    section: '8',
    code: '8.4',
    name: 'Standardize Time Synchronization',
    description: 'Standardize time synchronization. Configure at least two synchronized time sources across enterprise assets, where supported.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Standardize time synchronization. Configure at least two synchronized time sources across enterprise assets, where supported.\n\n \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor

**Implementation**

* \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-8.5',
    standardId: 'cis-ig2',
    section: '8',
    code: '8.5',
    name: 'Collect Detailed Audit Logs',
    description: 'Configure detailed audit logging for enterprise assets containing sensitive data. Include event source, date, username, timestamp, source addresses, destination addresses, and other useful elements that could assist in a forensic investigation.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Configure detailed audit logging for enterprise assets containing sensitive data. Include event source, date, username, timestamp, source addresses, destination addresses, and other useful elements that could assist in a forensic investigation.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-8.6',
    standardId: 'cis-ig2',
    section: '8',
    code: '8.6',
    name: 'Collect DNS Query Audit Logs',
    description: 'Collect DNS query audit logs on enterprise assets, where appropriate and supported.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Collect DNS query audit logs on enterprise assets, where appropriate and supported.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-8.7',
    standardId: 'cis-ig2',
    section: '8',
    code: '8.7',
    name: 'Collect URL Request Audit Logs',
    description: 'Collect URL request audit logs on enterprise assets, where appropriate and supported.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Collect URL request audit logs on enterprise assets, where appropriate and supported.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-8.8',
    standardId: 'cis-ig2',
    section: '8',
    code: '8.8',
    name: 'Collect Command-Line Audit Logs',
    description: 'Collect command-line audit logs. Example implementations include collecting audit logs from PowerShell®, BASH™, and remote administrative terminals.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Collect command-line audit logs. Example s include collecting audit logs from PowerShell®, BASH™, and remote administrative terminals.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* s include collecting audit logs from PowerShell®, BASH™, and remote administrative terminals.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-8.9',
    standardId: 'cis-ig2',
    section: '8',
    code: '8.9',
    name: 'Centralize Audit Logs',
    description: 'Centralize, to the extent possible, audit log collection and retention across enterprise assets in accordance with the documented audit log management process. Example implementations primarily include leveraging a SIEM tool to centralize multiple log sources.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Centralize, to the extent possible, audit log collection and retention across enterprise assets in accordance with the documented audit log management process. Example s primarily include leveraging a SIEM tool to centralize multiple log sources.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* s primarily include leveraging a SIEM tool to centralize multiple log sources.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-8.10',
    standardId: 'cis-ig2',
    section: '8',
    code: '8.10',
    name: 'Retain Audit Logs',
    description: 'Retain audit logs across enterprise assets for a minimum of 90 days.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Retain audit logs across enterprise assets for a minimum of 90 days.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-8.11',
    standardId: 'cis-ig2',
    section: '8',
    code: '8.11',
    name: 'Conduct Audit Log Reviews',
    description: 'Conduct reviews of audit logs to detect anomalies or abnormal events that could indicate a potential threat. Conduct reviews on a weekly, or more frequent, basis.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Conduct reviews of audit logs to detect anomalies or abnormal events that could indicate a potential threat. Conduct reviews on a weekly, or more frequent, basis.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
    {
    id: 'cis-ig2-9.1',
    standardId: 'cis-ig2',
    section: '9',
    code: '9.1',
    name: 'Ensure Use of Only Fully Supported Browsers and Email Clients',
    description: 'Ensure only fully supported browsers and email clients are allowed to execute in the enterprise, only using the latest version of browsers and email clients provided through the vendor.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Ensure only fully supported browsers and email clients are allowed to execute in the enterprise, only using the latest version of browsers and email clients provided through the vendor.\n\n \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients

**Implementation**

* \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-9.2',
    standardId: 'cis-ig2',
    section: '9',
    code: '9.2',
    name: 'Use DNS Filtering Services',
    description: 'Use DNS filtering services on all end-user devices, including remote and on-premises assets, to block access to known malicious domains.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Use DNS filtering services on all end-user devices, including remote and on-premises assets, to block access to known malicious domains.\n\n \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients

**Implementation**

* \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-9.3',
    standardId: 'cis-ig2',
    section: '9',
    code: '9.3',
    name: 'Maintain and Enforce Network-Based URL Filters',
    description: 'Enforce and update network-based URL filters to limit an enterprise asset from connecting to potentially malicious or unapproved websites. Example implementations include category-based filtering, reputation-based filtering, or through the use of block lists. Enforce filters for all enterprise assets.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Enforce and update network-based URL filters to limit an enterprise asset from connecting to potentially malicious or unapproved websites. Example s include category-based filtering, reputation-based filtering, or through the use of block lists. Enforce filters for all enterprise assets.\n\n \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients

**Implementation**

* s include category-based filtering, reputation-based filtering, or through the use of block lists. Enforce filters for all enterprise assets.\n\n \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-9.4',
    standardId: 'cis-ig2',
    section: '9',
    code: '9.4',
    name: 'Restrict Unnecessary or Unauthorized Browser and Email Client Extensions',
    description: 'Restrict, either through uninstalling or disabling, any unauthorized or unnecessary browser or email client plugins, extensions, and add-on applications.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Restrict, either through uninstalling or disabling, any unauthorized or unnecessary browser or email client plugins, extensions, and add-on applications.\n\n \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients

**Implementation**

* \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-9.5',
    standardId: 'cis-ig2',
    section: '9',
    code: '9.5',
    name: 'Implement DMARC',
    description: 'To lower the chance of spoofed or modified emails from valid domains, implement DMARC policy and verification, starting with implementing the Sender Policy Framework (SPF) and the DomainKeys Identified Mail (DKIM) standards.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

To lower the chance of spoofed or modified emails from valid domains, implement DMARC policy and verification, starting with implementing the Sender Policy Framework (SPF) and the DomainKeys Identified Mail (DKIM) standards.\n\n \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients

**Implementation**

* \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-9.6',
    standardId: 'cis-ig2',
    section: '9',
    code: '9.6',
    name: 'Block Unnecessary File Types',
    description: 'Block unnecessary file types attempting to enter the enterprise’s email gateway.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Block unnecessary file types attempting to enter the enterprise’s email gateway.\n\n \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients

**Implementation**

* \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
    {
    id: 'cis-ig2-10.1',
    standardId: 'cis-ig2',
    section: '10',
    code: '10.1',
    name: 'Deploy and Maintain Anti-Malware Software',
    description: 'Deploy and maintain anti-malware software on all enterprise assets.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Deploy and maintain anti-malware software on all enterprise assets.\n\n \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution

**Implementation**

* \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-10.2',
    standardId: 'cis-ig2',
    section: '10',
    code: '10.2',
    name: 'Configure Automatic Anti-Malware Signature Updates',
    description: 'Configure automatic updates for anti-malware signature files on all enterprise assets.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Configure automatic updates for anti-malware signature files on all enterprise assets.\n\n \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution

**Implementation**

* \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-10.3',
    standardId: 'cis-ig2',
    section: '10',
    code: '10.3',
    name: 'Disable Autorun and Autoplay for Removable Media',
    description: 'Disable autorun and autoplay auto-execute functionality for removable media.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Disable autorun and autoplay auto-execute functionality for removable media.\n\n \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution

**Implementation**

* \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-10.4',
    standardId: 'cis-ig2',
    section: '10',
    code: '10.4',
    name: 'Configure Automatic Anti-Malware Scanning of Removable Media',
    description: 'Configure anti-malware software to automatically scan removable media.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Configure anti-malware software to automatically scan removable media.\n\n \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution

**Implementation**

* \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-10.5',
    standardId: 'cis-ig2',
    section: '10',
    code: '10.5',
    name: 'Enable Anti-Exploitation Features',
    description: 'Enable anti-exploitation features on enterprise assets and software, where possible, such as Microsoft® Data Execution Prevention (DEP), Windows® Defender Exploit Guard (WDEG), or Apple® System Integrity Protection (SIP) and Gatekeeper™.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Enable anti-exploitation features on enterprise assets and software, where possible, such as Microsoft® Data Execution Prevention (DEP), Windows® Defender Exploit Guard (WDEG), or Apple® System Integrity Protection (SIP) and Gatekeeper™.\n\n \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution

**Implementation**

* \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-10.6',
    standardId: 'cis-ig2',
    section: '10',
    code: '10.6',
    name: 'Centrally Manage Anti-Malware Software',
    description: 'Centrally manage anti-malware software.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Centrally manage anti-malware software.\n\n \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution

**Implementation**

* \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-10.7',
    standardId: 'cis-ig2',
    section: '10',
    code: '10.7',
    name: 'Use Behavior-Based Anti-Malware Software',
    description: 'Use behavior-based anti-malware software.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Use behavior-based anti-malware software.\n\n \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution

**Implementation**

* \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-11.1',
    standardId: 'cis-ig2',
    section: '11',
    code: '11.1',
    name: 'Establish and Maintain a Data Recovery Process',
    description: 'Establish and maintain a documented data recovery process that includes detailed backup procedures. In the process, address the scope of data recovery activities, recovery prioritization, and the security of backup data. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a documented data recovery process that includes detailed backup procedures. In the process, address the scope of data recovery activities, recovery prioritization, and the security of backup data. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-11.2',
    standardId: 'cis-ig2',
    section: '11',
    code: '11.2',
    name: 'Perform Automated Backups',
    description: 'Perform automated backups of in-scope enterprise assets. Run backups weekly, or more frequently, based on the sensitivity of the data.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Perform automated backups of in-scope enterprise assets. Run backups weekly, or more frequently, based on the sensitivity of the data.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-11.3',
    standardId: 'cis-ig2',
    section: '11',
    code: '11.3',
    name: 'Protect Recovery Data',
    description: 'Protect recovery data with equivalent controls to the original data. Reference encryption or data separation, based on requirements.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Protect recovery data with equivalent controls to the original data. Reference encryption or data separation, based on requirements.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-11.4',
    standardId: 'cis-ig2',
    section: '11',
    code: '11.4',
    name: 'Establish and Maintain an Isolated Instance of Recovery Data',
    description: 'Establish and maintain an isolated instance of recovery data. Example implementations include, version controlling backup destinations through offline, cloud, or off-site systems or services.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain an isolated instance of recovery data. Example s include, version controlling backup destinations through offline, cloud, or off-site systems or services.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* s include, version controlling backup destinations through offline, cloud, or off-site systems or services.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-11.5',
    standardId: 'cis-ig2',
    section: '11',
    code: '11.5',
    name: 'Test Data Recovery',
    description: 'Test backup recovery quarterly, or more frequently, for a sampling of in-scope enterprise assets.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Test backup recovery quarterly, or more frequently, for a sampling of in-scope enterprise assets.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-12.1',
    standardId: 'cis-ig2',
    section: '12',
    code: '12.1',
    name: 'Ensure Network Infrastructure is Up-to-Date',
    description: 'Ensure network infrastructure is kept up-to-date. Example implementations include running the latest stable release of software and/or using currently supported network as a service (NaaS) offerings. Review software versions monthly, or more frequently, to verify software support.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Ensure network infrastructure is kept up-to-date. Example s include running the latest stable release of software and/or using currently supported network as a service (NaaS) offerings. Review software versions monthly, or more frequently, to verify software support.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* s include running the latest stable release of software and/or using currently supported network as a service (NaaS) offerings. Review software versions monthly, or more frequently, to verify software support.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-12.2',
    standardId: 'cis-ig2',
    section: '12',
    code: '12.2',
    name: 'Establish and Maintain a Secure Network Architecture',
    description: 'Design and maintain a secure network architecture. A secure network architecture must address segmentation, least privilege, and availability, at a minimum. Example implementations may include documentation, policy, and design components.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Design and maintain a secure network architecture. A secure network architecture must address segmentation, least privilege, and availability, at a minimum. Example s may include documentation, policy, and design components.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* s may include documentation, policy, and design components.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-12.3',
    standardId: 'cis-ig2',
    section: '12',
    code: '12.3',
    name: 'Securely Manage Network Infrastructure',
    description: 'Securely manage network infrastructure. Example implementations include version-controlled Infrastructure-as-Code (IaC), and the use of secure network protocols, such as SSH and HTTPS.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Securely manage network infrastructure. Example s include version-controlled Infrastructure-as-Code (IaC), and the use of secure network protocols, such as SSH and HTTPS.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* s include version-controlled Infrastructure-as-Code (IaC), and the use of secure network protocols, such as SSH and HTTPS.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-12.4',
    standardId: 'cis-ig2',
    section: '12',
    code: '12.4',
    name: 'Establish and Maintain Architecture Diagram(s)',
    description: 'Establish and maintain architecture diagram(s) and/or other network system documentation. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain architecture diagram(s) and/or other network system documentation. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-12.5',
    standardId: 'cis-ig2',
    section: '12',
    code: '12.5',
    name: 'Centralize Network Authentication, Authorization, and Auditing (AAA)',
    description: 'Centralize network AAA.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Centralize network AAA.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-12.6',
    standardId: 'cis-ig2',
    section: '12',
    code: '12.6',
    name: 'Use of Secure Network Management and Communication Protocols',
    description: 'Adopt secure network management protocols (e.g., 802.1X) and secure communication protocols (e.g., Wi-Fi Protected Access 2 (WPA2) Enterprise or more secure alternatives).',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Adopt secure network management protocols (e.g., 802.1X) and secure communication protocols (e.g., Wi-Fi Protected Access 2 (WPA2) Enterprise or more secure alternatives).\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-12.7',
    standardId: 'cis-ig2',
    section: '12',
    code: '12.7',
    name: 'Ensure Remote Devices Utilize a VPN and are Connecting to an Enterprise’s AAA Infrastructure',
    description: 'Require users to authenticate to enterprise-managed VPN and authentication services prior to accessing enterprise resources on end-user devices.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Require users to authenticate to enterprise-managed VPN and authentication services prior to accessing enterprise resources on end-user devices.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-13.1',
    standardId: 'cis-ig2',
    section: '13',
    code: '13.1',
    name: 'Centralize Security Event Alerting',
    description: 'Centralize security event alerting across enterprise assets for log correlation and analysis. Best practice implementation requires the use of a SIEM, which includes vendor-defined event correlation alerts. A log analytics platform configured with security-relevant correlation alerts also satisfies this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Centralize security event alerting across enterprise assets for log correlation and analysis. Best practice  requires the use of a SIEM, which includes vendor-defined event correlation alerts. A log analytics platform configured with security-relevant correlation alerts also satisfies this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* requires the use of a SIEM, which includes vendor-defined event correlation alerts. A log analytics platform configured with security-relevant correlation alerts also satisfies this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-13.2',
    standardId: 'cis-ig2',
    section: '13',
    code: '13.2',
    name: 'Deploy a Host-Based Intrusion Detection Solution',
    description: 'Deploy a host-based intrusion detection solution on enterprise assets, where appropriate and/or supported.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Deploy a host-based intrusion detection solution on enterprise assets, where appropriate and/or supported.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-13.3',
    standardId: 'cis-ig2',
    section: '13',
    code: '13.3',
    name: 'Deploy a Network Intrusion Detection Solution',
    description: 'Deploy a network intrusion detection solution on enterprise assets, where appropriate. Example implementations include the use of a Network Intrusion Detection System (NIDS) or equivalent cloud service provider (CSP) service.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Deploy a network intrusion detection solution on enterprise assets, where appropriate. Example s include the use of a Network Intrusion Detection System (NIDS) or equivalent cloud service provider (CSP) service.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* s include the use of a Network Intrusion Detection System (NIDS) or equivalent cloud service provider (CSP) service.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-13.4',
    standardId: 'cis-ig2',
    section: '13',
    code: '13.4',
    name: 'Perform Traffic Filtering Between Network Segments',
    description: 'Perform traffic filtering between network segments, where appropriate.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Perform traffic filtering between network segments, where appropriate.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-13.5',
    standardId: 'cis-ig2',
    section: '13',
    code: '13.5',
    name: 'Manage Access Control for Remote Assets',
    description: 'Manage access control for assets remotely connecting to enterprise resources. Determine amount of access to enterprise resources based on: up-to-date anti-malware software installed, configuration compliance with the enterprise’s secure configuration process, and ensuring the operating system and applications are up-to-date.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Manage access control for assets remotely connecting to enterprise resources. Determine amount of access to enterprise resources based on: up-to-date anti-malware software installed, configuration compliance with the enterprise’s secure configuration process, and ensuring the operating system and applications are up-to-date.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-13.6',
    standardId: 'cis-ig2',
    section: '13',
    code: '13.6',
    name: 'Collect Network Traffic Flow Logs',
    description: 'Collect network traffic flow logs and/or network traffic to review and alert upon from network devices.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Collect network traffic flow logs and/or network traffic to review and alert upon from network devices.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-14.1',
    standardId: 'cis-ig2',
    section: '14',
    code: '14.1',
    name: 'Establish and Maintain a Security Awareness Program',
    description: 'Establish and maintain a security awareness program. The purpose of a security awareness program is to educate the enterprise’s workforce on how to interact with enterprise assets and data in a secure manner. Conduct training at hire and, at a minimum, annually. Review and update content annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a security awareness program. The  of a security awareness program is to educate the enterprise’s workforce on how to interact with enterprise assets and data in a secure manner. Conduct training at hire and, at a minimum, annually. Review and update content annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-14.2',
    standardId: 'cis-ig2',
    section: '14',
    code: '14.2',
    name: 'Train Workforce Members to Recognize Social Engineering Attacks',
    description: 'Train workforce members to recognize social engineering attacks, such as phishing, business email compromise (BEC), pretexting, and tailgating.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Train workforce members to recognize social engineering attacks, such as phishing, business email compromise (BEC), pretexting, and tailgating.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-14.3',
    standardId: 'cis-ig2',
    section: '14',
    code: '14.3',
    name: 'Train Workforce Members on Authentication Best Practices',
    description: 'Train workforce members on authentication best practices. Example topics include MFA, password composition, and credential management.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Train workforce members on authentication best practices. Example topics include MFA, password composition, and credential management.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-14.4',
    standardId: 'cis-ig2',
    section: '14',
    code: '14.4',
    name: 'Train Workforce on Data Handling Best Practices',
    description: 'Train workforce members on how to identify and properly store, transfer, archive, and destroy sensitive data. This also includes training workforce members on clear screen and desk best practices, such as locking their screen when they step away from their enterprise asset, erasing physical and virtual whiteboards at the end of meetings, and storing data and assets securely.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Train workforce members on how to identify and properly store, transfer, archive, and destroy sensitive data. This also includes training workforce members on clear screen and desk best practices, such as locking their screen when they step away from their enterprise asset, erasing physical and virtual whiteboards at the end of meetings, and storing data and assets securely.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-14.5',
    standardId: 'cis-ig2',
    section: '14',
    code: '14.5',
    name: 'Train Workforce Members on Causes of Unintentional Data Exposure',
    description: 'Train workforce members to be aware of causes for unintentional data exposure. Example topics include mis-delivery of sensitive data, losing a portable end-user device, or publishing data to unintended audiences.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Train workforce members to be aware of causes for unintentional data exposure. Example topics include mis-delivery of sensitive data, losing a portable end-user device, or publishing data to unintended audiences.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-14.6',
    standardId: 'cis-ig2',
    section: '14',
    code: '14.6',
    name: 'Train Workforce Members on Recognizing and Reporting Security Incidents',
    description: 'Train workforce members to be able to recognize a potential incident and be able to report such an incident.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Train workforce members to be able to recognize a potential incident and be able to report such an incident.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-14.7',
    standardId: 'cis-ig2',
    section: '14',
    code: '14.7',
    name: 'Train Workforce on How to Identify and Report if Their Enterprise Assets are Missing Security Updates',
    description: 'Train workforce to understand how to verify and report out-of-date software patches or any failures in automated processes and tools. Part of this training should include notifying IT personnel of any failures in automated processes and tools.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Train workforce to understand how to verify and report out-of-date software patches or any failures in automated processes and tools. Part of this training should include notifying IT personnel of any failures in automated processes and tools.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-14.8',
    standardId: 'cis-ig2',
    section: '14',
    code: '14.8',
    name: 'Train Workforce on the Dangers of Connecting to and Transmitting Enterprise Data Over Insecure Networks',
    description: 'Train workforce members on the dangers of connecting to, and transmitting data over, insecure networks for enterprise activities. If the enterprise has remote workers, training must include guidance to ensure that all users securely configure their home network infrastructure.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Train workforce members on the dangers of connecting to, and transmitting data over, insecure networks for enterprise activities. If the enterprise has remote workers, training must include guidance to ensure that all users securely configure their home network infrastructure.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-15.1',
    standardId: 'cis-ig2',
    section: '15',
    code: '15.1',
    name: 'Establish and Maintain an Inventory of Service Providers',
    description: 'Establish and maintain an inventory of service providers. The inventory is to list all known service providers, include classification(s), and designate an enterprise contact for each service provider. Review and update the inventory annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain an inventory of service providers. The inventory is to list all known service providers, include classification(s), and designate an enterprise contact for each service provider. Review and update the inventory annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-15.2',
    standardId: 'cis-ig2',
    section: '15',
    code: '15.2',
    name: 'Establish and Maintain a Service Provider Management Policy',
    description: 'Establish and maintain a service provider management policy. Ensure the policy addresses the classification, inventory, assessment, monitoring, and decommissioning of service providers. Review and update the policy annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a service provider management policy. Ensure the policy addresses the classification, inventory, assessment, monitoring, and decommissioning of service providers. Review and update the policy annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-15.3',
    standardId: 'cis-ig2',
    section: '15',
    code: '15.3',
    name: 'Classify Service Providers',
    description: 'Classify service providers. Classification consideration may include one or more characteristics, such as data sensitivity, data volume, availability requirements, applicable regulations, inherent risk, and mitigated risk. Update and review classifications annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Classify service providers. Classification consideration may include one or more characteristics, such as data sensitivity, data volume, availability requirements, applicable regulations, inherent risk, and mitigated risk. Update and review classifications annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-15.4',
    standardId: 'cis-ig2',
    section: '15',
    code: '15.4',
    name: 'Ensure Service Provider Contracts Include Security Requirements',
    description: 'Ensure service provider contracts include security requirements. Example requirements may include minimum security program requirements, security incident and/or data breach notification and response, data encryption requirements, and data disposal commitments. These security requirements must be consistent with the enterprise’s service provider management policy. Review service provider contracts annually to ensure contracts are not missing security requirements.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Ensure service provider contracts include security requirements. Example requirements may include minimum security program requirements, security incident and/or data breach notification and response, data encryption requirements, and data disposal commitments. These security requirements must be consistent with the enterprise’s service provider management policy. Review service provider contracts annually to ensure contracts are not missing security requirements.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
    {
    id: 'cis-ig2-16.1',
    standardId: 'cis-ig2',
    section: '16',
    code: '16.1',
    name: 'Establish and Maintain a Secure Application Development Process',
    description: 'Establish and maintain a secure application development process. In the process, address such items as: secure application design standards, secure coding practices, developer training, vulnerability management, security of third-party code, and application security testing procedures. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a secure application development process. In the process, address such items as: secure application design standards, secure coding practices, developer training, vulnerability management, security of third-party code, and application security testing procedures. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-16.2',
    standardId: 'cis-ig2',
    section: '16',
    code: '16.2',
    name: 'Establish and Maintain a Process to Accept and Address Software Vulnerabilities',
    description: 'Establish and maintain a process to accept and address reports of software vulnerabilities, including providing a means for external entities to report. The process is to include such items as: a vulnerability handling policy that identifies reporting process, responsible party for handling vulnerability reports, and a process for intake, assignment, remediation, and remediation testing. As part of the process, use a vulnerability tracking system that includes severity ratings and metrics for measuring timing for identification, analysis, and remediation of vulnerabilities. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a process to accept and address reports of software vulnerabilities, including providing a means for external entities to report. The process is to include such items as: a vulnerability handling policy that identifies reporting process, responsible party for handling vulnerability reports, and a process for intake, assignment, remediation, and remediation testing. As part of the process, use a vulnerability tracking system that includes severity ratings and metrics for measuring timing for identification, analysis, and remediation of vulnerabilities. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-16.3',
    standardId: 'cis-ig2',
    section: '16',
    code: '16.3',
    name: 'Perform Root Cause Analysis on Security Vulnerabilities',
    description: 'Perform root cause analysis on security vulnerabilities. When reviewing vulnerabilities, root cause analysis is the task of evaluating underlying issues that create vulnerabilities in code, and allows development teams to move beyond just fixing individual vulnerabilities as they arise.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Perform root cause analysis on security vulnerabilities. When reviewing vulnerabilities, root cause analysis is the task of evaluating underlying issues that create vulnerabilities in code, and allows development teams to move beyond just fixing individual vulnerabilities as they arise.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-16.4',
    standardId: 'cis-ig2',
    section: '16',
    code: '16.4',
    name: 'Establish and Manage an Inventory of Third-Party Software Components',
    description: 'Establish and manage an updated inventory of third-party components used in development, often referred to as a “bill of materials,” as well as components slated for future use. This inventory is to include any risks that each third-party component could pose. Evaluate the list at least monthly to identify any changes or updates to these components, and validate that the component is still supported.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and manage an updated inventory of third-party components used in development, often referred to as a “bill of materials,” as well as components slated for future use. This inventory is to include any risks that each third-party component could pose. Evaluate the list at least monthly to identify any changes or updates to these components, and validate that the component is still supported.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-16.5',
    standardId: 'cis-ig2',
    section: '16',
    code: '16.5',
    name: 'Use Up-to-Date and Trusted Third-Party Software Components',
    description: 'Use up-to-date and trusted third-party software components. When possible, choose established and proven frameworks and libraries that provide adequate security. Acquire these components from trusted sources or evaluate the software for vulnerabilities before use.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Use up-to-date and trusted third-party software components. When possible, choose established and proven frameworks and libraries that provide adequate security. Acquire these components from trusted sources or evaluate the software for vulnerabilities before use.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-16.6',
    standardId: 'cis-ig2',
    section: '16',
    code: '16.6',
    name: 'Establish and Maintain a Severity Rating System and Process for Application Vulnerabilities',
    description: 'Establish and maintain a severity rating system and process for application vulnerabilities that facilitates prioritizing the order in which discovered vulnerabilities are fixed. This process includes setting a minimum level of security acceptability for releasing code or applications. Severity ratings bring a systematic way of triaging vulnerabilities that improves risk management and helps ensure the most severe bugs are fixed first. Review and update the system and process annually.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a severity rating system and process for application vulnerabilities that facilitates prioritizing the order in which discovered vulnerabilities are fixed. This process includes setting a minimum level of security acceptability for releasing code or applications. Severity ratings bring a systematic way of triaging vulnerabilities that improves risk management and helps ensure the most severe bugs are fixed first. Review and update the system and process annually.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-16.7',
    standardId: 'cis-ig2',
    section: '16',
    code: '16.7',
    name: 'Use Standard Hardening Configuration Templates for Application Infrastructure',
    description: 'Use standard, industry-recommended hardening configuration templates for application infrastructure components. This includes underlying servers, databases, and web servers, and applies to cloud containers, Platform as a Service (PaaS) components, and SaaS components. Do not allow in-house developed software to weaken configuration hardening.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Use standard, industry-recommended hardening configuration templates for application infrastructure components. This includes underlying servers, databases, and web servers, and applies to cloud containers, Platform as a Service (PaaS) components, and SaaS components. Do not allow in-house developed software to weaken configuration hardening.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-16.8',
    standardId: 'cis-ig2',
    section: '16',
    code: '16.8',
    name: 'Separate Production and Non-Production Systems',
    description: 'Maintain separate environments for production and non-production systems.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Maintain separate environments for production and non-production systems.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-16.9',
    standardId: 'cis-ig2',
    section: '16',
    code: '16.9',
    name: 'Train Developers in Application Security Concepts and Secure Coding',
    description: 'Ensure that all software development personnel receive training in writing secure code for their specific development environment and responsibilities. Training can include general security principles and application security standard practices. Conduct training at least annually and design in a way to promote security within the development team, and build a culture of security among the developers.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Ensure that all software development personnel receive training in writing secure code for their specific development environment and responsibilities. Training can include general security principles and application security standard practices. Conduct training at least annually and design in a way to promote security within the development team, and build a culture of security among the developers.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-16.10',
    standardId: 'cis-ig2',
    section: '16',
    code: '16.10',
    name: 'Apply Secure Design Principles in Application Architectures',
    description: 'Apply secure design principles in application architectures. Secure design principles include the concept of least privilege and enforcing mediation to validate every operation that the user makes, promoting the concept of \"never trust user input.\" Examples include ensuring that explicit error checking is performed and documented for all input, including for size, data type, and acceptable ranges or formats. Secure design also means minimizing the application infrastructure attack surface, such as turning off unprotected ports and services, removing unnecessary programs and files, and renaming or removing default accounts.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Apply secure design principles in application architectures. Secure design principles include the concept of least privilege and enforcing mediation to validate every operation that the user makes, promoting the concept of \"never trust user input.\" Examples include ensuring that explicit error checking is performed and documented for all input, including for size, data type, and acceptable ranges or formats. Secure design also means minimizing the application infrastructure attack surface, such as turning off unprotected ports and services, removing unnecessary programs and files, and renaming or removing default accounts.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-16.11',
    standardId: 'cis-ig2',
    section: '16',
    code: '16.11',
    name: 'Leverage Vetted Modules or Services for Application Security Components',
    description: 'Leverage vetted modules or services for application security components, such as identity management, encryption, auditing, and logging. Using platform features in critical security functions will reduce developers’ workload and minimize the likelihood of design or implementation errors. Modern operating systems provide effective mechanisms for identification, authentication, and authorization and make those mechanisms available to applications. Use only standardized, currently accepted, and extensively reviewed encryption algorithms. Operating systems also provide mechanisms to create and maintain secure audit logs.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Leverage vetted modules or services for application security components, such as identity management, encryption, auditing, and logging. Using platform features in critical security functions will reduce developers’ workload and minimize the likelihood of design or  errors. Modern operating systems provide effective mechanisms for identification, authentication, and authorization and make those mechanisms available to applications. Use only standardized, currently accepted, and extensively reviewed encryption algorithms. Operating systems also provide mechanisms to create and maintain secure audit logs.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* errors. Modern operating systems provide effective mechanisms for identification, authentication, and authorization and make those mechanisms available to applications. Use only standardized, currently accepted, and extensively reviewed encryption algorithms. Operating systems also provide mechanisms to create and maintain secure audit logs.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-17.1',
    standardId: 'cis-ig2',
    section: '17',
    code: '17.1',
    name: 'Designate Personnel to Manage Incident Handling',
    description: 'Designate one key person, and at least one backup, who will manage the enterprise’s incident handling process. Management personnel are responsible for the coordination and documentation of incident response and recovery efforts and can consist of employees internal to the enterprise, service providers, or a hybrid approach. If using a service provider, designate at least one person internal to the enterprise to oversee any third-party work. Review annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Designate one key person, and at least one backup, who will manage the enterprise’s incident handling process. Management personnel are responsible for the coordination and documentation of incident response and recovery efforts and can consist of employees internal to the enterprise, service providers, or a hybrid approach. If using a service provider, designate at least one person internal to the enterprise to oversee any third-party work. Review annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-17.2',
    standardId: 'cis-ig2',
    section: '17',
    code: '17.2',
    name: 'Establish and Maintain Contact Information for Reporting Security Incidents',
    description: 'Establish and maintain contact information for parties that need to be informed of security incidents. Contacts may include internal staff, service providers, law enforcement, cyber insurance providers, relevant government agencies, Information Sharing and Analysis Center (ISAC) partners, or other stakeholders. Verify contacts annually to ensure that information is up-to-date.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain contact information for parties that need to be informed of security incidents. Contacts may include internal staff, service providers, law enforcement, cyber insurance providers, relevant government agencies, Information Sharing and Analysis Center (ISAC) partners, or other stakeholders. Verify contacts annually to ensure that information is up-to-date.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-17.3',
    standardId: 'cis-ig2',
    section: '17',
    code: '17.3',
    name: 'Establish and Maintain an Enterprise Process for Reporting Incidents',
    description: 'Establish and maintain a documented enterprise process for the workforce to report security incidents. The process includes reporting timeframe, personnel to report to, mechanism for reporting, and the minimum information to be reported. Ensure the process is publicly available to all of the workforce. Review annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a documented enterprise process for the workforce to report security incidents. The process includes reporting timeframe, personnel to report to, mechanism for reporting, and the minimum information to be reported. Ensure the process is publicly available to all of the workforce. Review annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-17.4',
    standardId: 'cis-ig2',
    section: '17',
    code: '17.4',
    name: 'Establish and Maintain an Incident Response Process',
    description: 'Establish and maintain a documented incident response process that addresses roles and responsibilities, compliance requirements, and a communication plan. Review annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a documented incident response process that addresses roles and responsibilities, compliance requirements, and a communication plan. Review annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-17.5',
    standardId: 'cis-ig2',
    section: '17',
    code: '17.5',
    name: 'Assign Key Roles and Responsibilities',
    description: 'Assign key roles and responsibilities for incident response, including staff from legal, IT, information security, facilities, public relations, human resources, incident responders, analysts, and relevant third parties. Review annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Assign key roles and responsibilities for incident response, including staff from legal, IT, information security, facilities, public relations, human resources, incident responders, analysts, and relevant third parties. Review annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-17.6',
    standardId: 'cis-ig2',
    section: '17',
    code: '17.6',
    name: 'Define Mechanisms for Communicating During Incident Response',
    description: 'Determine which primary and secondary mechanisms will be used to communicate and report during a security incident. Mechanisms can include phone calls, emails, secure chat, or notification letters. Keep in mind that certain mechanisms, such as emails, can be affected during a security incident. Review annually, or when significant enterprise changes occur that could impact this Safeguard.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Determine which primary and secondary mechanisms will be used to communicate and report during a security incident. Mechanisms can include phone calls, emails, secure chat, or notification letters. Keep in mind that certain mechanisms, such as emails, can be affected during a security incident. Review annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-17.7',
    standardId: 'cis-ig2',
    section: '17',
    code: '17.7',
    name: 'Conduct Routine Incident Response Exercises',
    description: 'Plan and conduct routine incident response exercises and scenarios for key personnel involved in the incident response process to prepare for responding to real-world incidents. Exercises need to test communication channels, decision making, and workflows. Conduct testing on an annual basis, at a minimum.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Plan and conduct routine incident response exercises and scenarios for key personnel involved in the incident response process to prepare for responding to real-world incidents. Exercises need to test communication channels, decision making, and workflows. Conduct testing on an annual basis, at a minimum.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-18.1',
    standardId: 'cis-ig2',
    section: '18',
    code: '18.1',
    name: 'Establish and Maintain a Penetration Testing Program',
    description: 'Establish and maintain a penetration testing program appropriate to the size, complexity, industry, and maturity of the enterprise. Penetration testing program characteristics include scope, such as network, web application, Application Programming Interface (API), hosted services, and physical premise controls; frequency; limitations, such as acceptable hours, and excluded attack types; point of contact information; remediation, such as how findings will be routed internally; and retrospective requirements.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a penetration testing program appropriate to the size, complexity, industry, and maturity of the enterprise. Penetration testing program characteristics include scope, such as network, web application, Application Programming Interface (API), hosted services, and physical premise controls; frequency; limitations, such as acceptable hours, and excluded attack types; point of contact information; remediation, such as how findings will be routed internally; and retrospective requirements.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-18.2',
    standardId: 'cis-ig2',
    section: '18',
    code: '18.2',
    name: 'Perform Periodic External Penetration Tests',
    description: 'Perform periodic external penetration tests based on program requirements, no less than annually. External penetration testing must include enterprise and environmental reconnaissance to detect exploitable information. Penetration testing requires specialized skills and experience and must be conducted through a qualified party. The testing may be clear box or opaque box.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Perform periodic external penetration tests based on program requirements, no less than annually. External penetration testing must include enterprise and environmental reconnaissance to detect exploitable information. Penetration testing requires specialized skills and experience and must be conducted through a qualified party. The testing may be clear box or opaque box.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig2-18.3',
    standardId: 'cis-ig2',
    section: '18',
    code: '18.3',
    name: 'Remediate Penetration Test Findings',
    description: 'Remediate penetration test findings based on the enterprise’s documented vulnerability remediation process. This should include determining a timeline and level of effort based on the impact and prioritization of each identified finding.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Remediate penetration test findings based on the enterprise’s documented vulnerability remediation process. This should include determining a timeline and level of effort based on the impact and prioritization of each identified finding.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // ... existing code ...
  {
    id: 'cis-ig2-18.3',
    standardId: 'cis-ig2',
    section: '18',
    code: '18.3',
    name: 'Remediate Penetration Test Findings',
    description: 'Remediate penetration test findings based on the enterprise’s documented vulnerability remediation process. This should include determining a timeline and level of effort based on the impact and prioritization of each identified finding.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Remediate penetration test findings based on the enterprise’s documented vulnerability remediation process. This should include determining a timeline and level of effort based on the impact and prioritization of each identified finding.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

    tags: ['tag-technical'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // IG3 chapter 1 requirements
  {
    id: 'cis-ig3-1.1',
    standardId: 'cis-ig3',
    section: '1',
    code: '1.1',
    name: 'Establish and Maintain Detailed Enterprise Asset Inventory',
    description: 'Establish and maintain an accurate, detailed, and up-to-date inventory of all enterprise assets with the potential to store or process data, to include end-user devices (including portable and mobile), network devices, non-computing/IoT devices, and servers. Ensure the inventory records the network address (if static), hardware address, machine name, enterprise asset owner, department for each asset, and whether the asset has been approved to connect to the network. For mobile end-user devices, MDM type tools can support this process where appropriate. This inventory includes assets connected to the infrastructure physically, virtually, remotely, and those within cloud environments. Additionally, it includes assets that are regularly connected to the enterprise’s network infrastructure, even if they are not under control of the enterprise. Review and update the inventory of all enterprise assets bi-annually or more frequently.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain an accurate, detailed, and up-to-date inventory of all enterprise assets with the potential to store or process data, to include end-user devices (including portable and mobile), network devices, non-computing/IoT devices, and servers. Ensure the inventory records the network address (if static), hardware address, machine name, enterprise asset owner, department for each asset, and whether the asset has been approved to connect to the network. For mobile end-user devices, MDM type tools can support this process where appropriate. This inventory includes assets connected to the infrastructure physically, virtually, remotely, and those within cloud environments. Additionally, it includes assets that are regularly connected to the enterprise’s network infrastructure, even if they are not under control of the enterprise. Review and update the inventory of all enterprise assets bi-annually or more frequently.\n\n \n- Implement automated asset discovery tools to maintain an up-to-date inventory\n- Include all enterprise assets: end-user devices, network devices, IoT devices, and servers\n- Record key information for each asset: network address, hardware address, machine name, owner, department\n- Ensure both on-premises and cloud-based assets are included in the inventory\n- Review and update the inventory at least bi-annually\n- For unauthorized assets, establish a formal process for detection and remediation

**Implementation**

* \n- Implement automated asset discovery tools to maintain an up-to-date inventory\n- Include all enterprise assets: end-user devices, network devices, IoT devices, and servers\n- Record key information for each asset: network address, hardware address, machine name, owner, department\n- Ensure both on-premises and cloud-based assets are included in the inventory\n- Review and update the inventory at least bi-annually\n- For unauthorized assets, establish a formal process for detection and remediation`,

    tags: ['tag-device'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig3-1.2',
    standardId: 'cis-ig3',
    section: '1',
    code: '1.2',
    name: 'Address Unauthorized Assets',
    description: 'Ensure that a process exists to address unauthorized assets on a weekly basis. The enterprise may choose to remove the asset from the network, deny the asset from connecting remotely to the network, or quarantine the asset.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Ensure that a process exists to address unauthorized assets on a weekly basis. The enterprise may choose to remove the asset from the network, deny the asset from connecting remotely to the network, or quarantine the asset.\n\n \n- Implement automated asset discovery tools to maintain an up-to-date inventory\n- Include all enterprise assets: end-user devices, network devices, IoT devices, and servers\n- Record key information for each asset: network address, hardware address, machine name, owner, department\n- Ensure both on-premises and cloud-based assets are included in the inventory\n- Review and update the inventory at least bi-annually\n- For unauthorized assets, establish a formal process for detection and remediation

**Implementation**

* \n- Implement automated asset discovery tools to maintain an up-to-date inventory\n- Include all enterprise assets: end-user devices, network devices, IoT devices, and servers\n- Record key information for each asset: network address, hardware address, machine name, owner, department\n- Ensure both on-premises and cloud-based assets are included in the inventory\n- Review and update the inventory at least bi-annually\n- For unauthorized assets, establish a formal process for detection and remediation`,

    tags: ['tag-device'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig3-1.3',
    standardId: 'cis-ig3',
    section: '1',
    code: '1.3',
    name: 'Utilize an Active Discovery Tool',
    description: 'Utilize an active discovery tool to identify assets connected to the enterprise’s network. Configure the active discovery tool to execute daily or more frequently.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Utilize an active discovery tool to identify assets connected to the enterprise’s network. Configure the active discovery tool to execute daily or more frequently.\n\n \n- Implement automated asset discovery tools to maintain an up-to-date inventory\n- Include all enterprise assets: end-user devices, network devices, IoT devices, and servers\n- Record key information for each asset: network address, hardware address, machine name, owner, department\n- Ensure both on-premises and cloud-based assets are included in the inventory\n- Review and update the inventory at least bi-annually\n- For unauthorized assets, establish a formal process for detection and remediation

**Implementation**

* \n- Implement automated asset discovery tools to maintain an up-to-date inventory\n- Include all enterprise assets: end-user devices, network devices, IoT devices, and servers\n- Record key information for each asset: network address, hardware address, machine name, owner, department\n- Ensure both on-premises and cloud-based assets are included in the inventory\n- Review and update the inventory at least bi-annually\n- For unauthorized assets, establish a formal process for detection and remediation`,

    tags: ['tag-device'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig3-1.4',
    standardId: 'cis-ig3',
    section: '1',
    code: '1.4',
    name: 'Use Dynamic Host Configuration Protocol (DHCP) Logging to Update Enterprise Asset Inventory',
    description: 'Use DHCP logging on all DHCP servers or Internet Protocol (IP) address management tools to update the enterprise’s asset inventory. Review and use logs to update the enterprise’s asset inventory weekly or more frequently.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Use DHCP logging on all DHCP servers or Internet Protocol (IP) address management tools to update the enterprise’s asset inventory. Review and use logs to update the enterprise’s asset inventory weekly or more frequently.\n\n \n- Implement automated asset discovery tools to maintain an up-to-date inventory\n- Include all enterprise assets: end-user devices, network devices, IoT devices, and servers\n- Record key information for each asset: network address, hardware address, machine name, owner, department\n- Ensure both on-premises and cloud-based assets are included in the inventory\n- Review and update the inventory at least bi-annually\n- For unauthorized assets, establish a formal process for detection and remediation

**Implementation**

* \n- Implement automated asset discovery tools to maintain an up-to-date inventory\n- Include all enterprise assets: end-user devices, network devices, IoT devices, and servers\n- Record key information for each asset: network address, hardware address, machine name, owner, department\n- Ensure both on-premises and cloud-based assets are included in the inventory\n- Review and update the inventory at least bi-annually\n- For unauthorized assets, establish a formal process for detection and remediation`,

    tags: ['tag-device'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cis-ig3-1.5',
    standardId: 'cis-ig3',
    section: '1',
    code: '1.5',
    name: 'Use a Passive Asset Discovery Tool',
    description: 'Use a passive discovery tool to identify assets connected to the enterprise’s network. Review and use scans to update the enterprise’s asset inventory at least weekly or more frequently.',
    guidance: '',
    status: 'not-fulfilled',
    evidence: '',
    notes: '',
    responsibleParty: '',
    lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Use a passive discovery tool to identify assets connected to the enterprise’s network. Review and use scans to update the enterprise’s asset inventory at least weekly or more frequently.\n\n \n- Implement automated asset discovery tools to maintain an up-to-date inventory\n- Include all enterprise assets: end-user devices, network devices, IoT devices, and servers\n- Record key information for each asset: network address, hardware address, machine name, owner, department\n- Ensure both on-premises and cloud-based assets are included in the inventory\n- Review and update the inventory at least bi-annually\n- For unauthorized assets, establish a formal process for detection and remediation

**Implementation**

* \n- Implement automated asset discovery tools to maintain an up-to-date inventory\n- Include all enterprise assets: end-user devices, network devices, IoT devices, and servers\n- Record key information for each asset: network address, hardware address, machine name, owner, department\n- Ensure both on-premises and cloud-based assets are included in the inventory\n- Review and update the inventory at least bi-annually\n- For unauthorized assets, establish a formal process for detection and remediation`,

    tags: ['tag-device'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
  id: 'cis-ig3-2.1',
  standardId: 'cis-ig3',
  section: '2',
  code: '2.1',
  name: 'Establish and Maintain a Software Inventory',
  description: 'Establish and maintain a detailed inventory of all licensed software installed on enterprise assets. The software inventory must document the title, publisher, initial install/use date, and business purpose for each entry; where appropriate, include the Uniform Resource Locator (URL), app store(s), version(s), deployment mechanism, decommission date, and number of licenses. Review and update the software inventory bi-annually or more frequently.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a detailed inventory of all licensed software installed on enterprise assets. The software inventory must document the title, publisher, initial install/use date, and business  for each entry; where appropriate, include the Uniform Resource Locator (URL), app store(s), version(s), deployment mechanism, decommission date, and number of licenses. Review and update the software inventory bi-annually or more frequently.\n\n \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor

**Implementation**

* \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor`,

  tags: ['tag-application'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-2.2',
  standardId: 'cis-ig3',
  section: '2',
  code: '2.2',
  name: 'Ensure Authorized Software is Currently Supported',
  description: 'Ensure that only currently supported software is designated as authorized in the software inventory for enterprise assets. If software is unsupported, yet necessary for the fulfillment of the enterprise’s mission, document an exception detailing mitigating controls and residual risk acceptance. For any unsupported software without an exception documentation, designate as unauthorized. Review the software list to verify software support at least monthly or more frequently.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Ensure that only currently supported software is designated as authorized in the software inventory for enterprise assets. If software is unsupported, yet necessary for the fulfillment of the enterprise’s mission, document an exception detailing mitigating controls and residual risk acceptance. For any unsupported software without an exception documentation, designate as unauthorized. Review the software list to verify software support at least monthly or more frequently.\n\n \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor

**Implementation**

* \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor`,

  tags: ['tag-application'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-2.3',
  standardId: 'cis-ig3',
  section: '2',
  code: '2.3',
  name: 'Address Unauthorized Software',
  description: 'Ensure that unauthorized software is either removed from use on enterprise assets or receives a documented exception. Review monthly or more frequently.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Ensure that unauthorized software is either removed from use on enterprise assets or receives a documented exception. Review monthly or more frequently.\n\n \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor

**Implementation**

* \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor`,

  tags: ['tag-application'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-2.4',
  standardId: 'cis-ig3',
  section: '2',
  code: '2.4',
  name: 'Utilize Automated Software Inventory Tools',
  description: 'Utilize software inventory tools, when possible, throughout the enterprise to automate the discovery and documentation of installed software.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Utilize software inventory tools, when possible, throughout the enterprise to automate the discovery and documentation of installed software.\n\n \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor

**Implementation**

* \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor`,

  tags: ['tag-application'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-2.5',
  standardId: 'cis-ig3',
  section: '2',
  code: '2.5',
  name: 'Allowlist Authorized Software',
  description: 'Use technical controls, such as application allowlisting, to ensure that only authorized software can execute or be accessed. Reassess bi-annually or more frequently.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Use technical controls, such as application allowlisting, to ensure that only authorized software can execute or be accessed. Reassess bi-annually or more frequently.\n\n \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor

**Implementation**

* \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor`,

  tags: ['tag-application'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-2.6',
  standardId: 'cis-ig3',
  section: '2',
  code: '2.6',
  name: 'Allowlist Authorized Libraries',
  description: 'Use technical controls to ensure that only authorized software libraries, such as specific .dll, .ocx, and .so files, are allowed to load into a system process. Block unauthorized libraries from loading into a system process. Reassess bi-annually or more frequently.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Use technical controls to ensure that only authorized software libraries, such as specific .dll, .ocx, and .so files, are allowed to load into a system process. Block unauthorized libraries from loading into a system process. Reassess bi-annually or more frequently.\n\n \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor

**Implementation**

* \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor`,

  tags: ['tag-application'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-2.7',
  standardId: 'cis-ig3',
  section: '2',
  code: '2.7',
  name: 'Allowlist Authorized Scripts',
  description: 'Use technical controls, such as digital signatures and version control, to ensure that only authorized scripts, such as specific .ps1 and .py files, are allowed to execute. Block unauthorized scripts from executing. Reassess bi-annually or more frequently.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Use technical controls, such as digital signatures and version control, to ensure that only authorized scripts, such as specific .ps1 and .py files, are allowed to execute. Block unauthorized scripts from executing. Reassess bi-annually or more frequently.\n\n \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor

**Implementation**

* \n- Create and maintain a comprehensive inventory of all authorized software\n- Document title, publisher, installation date, business , and license information\n- Use automated software inventory tools where possible\n- Include mobile applications, cloud-based software, and development tools\n- Review and update the inventory bi-annually\n- Verify that all authorized software is currently supported by the vendor`,

  tags: ['tag-application'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-3.1',
  standardId: 'cis-ig3',
  section: '3',
  code: '3.1',
  name: 'Establish and Maintain a Data Management Process',
  description: 'Establish and maintain a documented data management process. In the process, address data sensitivity, data owner, handling of data, data retention limits, and disposal requirements, based on sensitivity and retention standards for the enterprise. Review and update documentation annually or when significant enterprise changes occur that could impact this safeguard.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a documented data management process. In the process, address data sensitivity, data owner, handling of data, data retention limits, and disposal requirements, based on sensitivity and retention standards for the enterprise. Review and update documentation annually or when significant enterprise changes occur that could impact this safeguard.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,

  tags: ['tag-data-protection'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-3.2',
  standardId: 'cis-ig3',
  section: '3',
  code: '3.2',
  name: 'Establish and Maintain a Data Inventory',
  description: 'Establish and maintain a data inventory based on the enterprise’s data management process. Inventory sensitive data, at a minimum. Review and update inventory annually, at a minimum, with a priority on sensitive data.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a data inventory based on the enterprise’s data management process. Inventory sensitive data, at a minimum. Review and update inventory annually, at a minimum, with a priority on sensitive data.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,

  tags: ['tag-data-protection'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-3.3',
  standardId: 'cis-ig3',
  section: '3',
  code: '3.3',
  name: 'Configure Data Access Control Lists',
  description: 'Configure data access control lists based on a user’s need to know. Apply data access control lists, also known as access permissions, to local and remote file systems, databases, and applications.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Configure data access control lists based on a user’s need to know. Apply data access control lists, also known as access permissions, to local and remote file systems, databases, and applications.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,

  tags: ['tag-data-protection'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-3.4',
  standardId: 'cis-ig3',
  section: '3',
  code: '3.4',
  name: 'Enforce Data Retention',
  description: 'Retain data according to the enterprise’s documented data management process. Data retention must include both minimum and maximum timelines.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Retain data according to the enterprise’s documented data management process. Data retention must include both minimum and maximum timelines.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,

  tags: ['tag-data-protection'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-3.5',
  standardId: 'cis-ig3',
  section: '3',
  code: '3.5',
  name: 'Securely Dispose of Data',
  description: 'Securely dispose of data as outlined in the enterprise’s documented data management process. Ensure the disposal process and method are commensurate with the data sensitivity.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Securely dispose of data as outlined in the enterprise’s documented data management process. Ensure the disposal process and method are commensurate with the data sensitivity.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,

  tags: ['tag-data-protection'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-3.6',
  standardId: 'cis-ig3',
  section: '3',
  code: '3.6',
  name: 'Encrypt Data on End-User Devices',
  description: 'Encrypt data on end-user devices containing sensitive data. Example implementations can include Windows BitLocker, Apple FileVault, Linux dm-crypt.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Encrypt data on end-user devices containing sensitive data. Example s can include Windows BitLocker, Apple FileVault, Linux dm-crypt.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* s can include Windows BitLocker, Apple FileVault, Linux dm-crypt.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,

  tags: ['tag-data-protection'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-3.7',
  standardId: 'cis-ig3',
  section: '3',
  code: '3.7',
  name: 'Establish and Maintain a Data Classification Scheme',
  description: 'Establish and maintain an overall data classification scheme for the enterprise. Enterprises may use labels, such as Sensitive, Confidential, and Public, and classify their data according to those labels. Review and update the classification scheme annually or when significant enterprise changes occur that could impact this safeguard.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain an overall data classification scheme for the enterprise. Enterprises may use labels, such as Sensitive, Confidential, and Public, and classify their data according to those labels. Review and update the classification scheme annually or when significant enterprise changes occur that could impact this safeguard.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,

  tags: ['tag-data-protection'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-3.8',
  standardId: 'cis-ig3',
  section: '3',
  code: '3.8',
  name: 'Document Data Flows',
  description: 'Document data flows. Data flow documentation includes service provider data flows and should be based on the enterprise’s data management process. Review and update documentation annually or when significant enterprise changes occur that could impact this safeguard.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Document data flows. Data flow documentation includes service provider data flows and should be based on the enterprise’s data management process. Review and update documentation annually or when significant enterprise changes occur that could impact this safeguard.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,

  tags: ['tag-data-protection'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-3.9',
  standardId: 'cis-ig3',
  section: '3',
  code: '3.9',
  name: 'Encrypt Data on Removable Media',
  description: 'Encrypt data on removable media.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Encrypt data on removable media.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,

  tags: ['tag-data-protection'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-3.10',
  standardId: 'cis-ig3',
  section: '3',
  code: '3.10',
  name: 'Encrypt Sensitive Data in Transit',
  description: 'Encrypt sensitive data in transit. Example implementations can include Transport Layer Security (TLS) and Open Secure Shell (OpenSSH).',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Encrypt sensitive data in transit. Example s can include Transport Layer Security (TLS) and Open Secure Shell (OpenSSH).\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* s can include Transport Layer Security (TLS) and Open Secure Shell (OpenSSH).\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,

  tags: ['tag-data-protection'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-3.11',
  standardId: 'cis-ig3',
  section: '3',
  code: '3.11',
  name: 'Encrypt Sensitive Data at Rest',
  description: 'Encrypt sensitive data at rest on servers, applications, and databases. Storage-layer encryption, also known as server-side encryption, meets the minimum requirement of this safeguard. Additional encryption methods may include application-layer encryption, also known as client-side encryption, where access to the data storage device(s) does not permit access to the plain-text data.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Encrypt sensitive data at rest on servers, applications, and databases. Storage-layer encryption, also known as server-side encryption, meets the minimum requirement of this safeguard. Additional encryption methods may include application-layer encryption, also known as client-side encryption, where access to the data storage device(s) does not permit access to the plain-text data.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,

  tags: ['tag-data-protection'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-3.12',
  standardId: 'cis-ig3',
  section: '3',
  code: '3.12',
  name: 'Segment Data Processing and Storage Based on Sensitivity',
  description: 'Segment data processing and storage based on the sensitivity of the data. Do not process sensitive data on enterprise assets intended for lower sensitivity data.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Segment data processing and storage based on the sensitivity of the data. Do not process sensitive data on enterprise assets intended for lower sensitivity data.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,

  tags: ['tag-data-protection'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-3.13',
  standardId: 'cis-ig3',
  section: '3',
  code: '3.13',
  name: 'Deploy a Data Loss Prevention Solution',
  description: 'Implement an automated tool, such as a host-based Data Loss Prevention (DLP) tool to identify all sensitive data stored, processed, or transmitted through enterprise assets, including those located onsite or at a remote service provider, and update the enterprise’s data inventory.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Implement an automated tool, such as a host-based Data Loss Prevention (DLP) tool to identify all sensitive data stored, processed, or transmitted through enterprise assets, including those located onsite or at a remote service provider, and update the enterprise’s data inventory.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,

  tags: ['tag-data-protection'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-3.14',
  standardId: 'cis-ig3',
  section: '3',
  code: '3.14',
  name: 'Log Sensitive Data Access',
  description: 'Log sensitive data access, including modification and disposal.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Log sensitive data access, including modification and disposal.\n\n \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data

**Implementation**

* \n- Document a formal data management process covering the entire data lifecycle\n- Define data sensitivity levels and corresponding handling requirements\n- Create and maintain an inventory of all sensitive data\n- Configure data access control lists based on the principle of least privilege\n- Implement data retention policies with minimum and maximum timelines\n- Deploy full-disk encryption on all devices storing sensitive data`,

  tags: ['tag-data-protection'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-4.1',
  standardId: 'cis-ig3',
  section: '4',
  code: '4.1',
  name: 'Establish and Maintain a Secure Configuration Process',
  description: 'Establish and maintain a documented secure configuration process for enterprise assets (end-user devices, including portable and mobile, non-computing/IoT devices, and servers) and software (operating systems and applications). Review and update documentation annually or when significant enterprise changes occur that could impact this safeguard.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a documented secure configuration process for enterprise assets (end-user devices, including portable and mobile, non-computing/IoT devices, and servers) and software (operating systems and applications). Review and update documentation annually or when significant enterprise changes occur that could impact this safeguard.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-4.2',
  standardId: 'cis-ig3',
  section: '4',
  code: '4.2',
  name: 'Establish and Maintain a Secure Configuration Process for Network Infrastructure',
  description: 'Establish and maintain a documented secure configuration process for network devices. Review and update documentation annually or when significant enterprise changes occur that could impact this safeguard.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a documented secure configuration process for network devices. Review and update documentation annually or when significant enterprise changes occur that could impact this safeguard.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-4.3',
  standardId: 'cis-ig3',
  section: '4',
  code: '4.3',
  name: 'Configure Automatic Session Locking on Enterprise Assets',
  description: 'Configure automatic session locking on enterprise assets after a defined period of inactivity. For general purpose operating systems, the period must not exceed 15 minutes. For mobile end-user devices, the period must not exceed 2 minutes.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Configure automatic session locking on enterprise assets after a defined period of inactivity. For general  operating systems, the period must not exceed 15 minutes. For mobile end-user devices, the period must not exceed 2 minutes.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-4.4',
  standardId: 'cis-ig3',
  section: '4',
  code: '4.4',
  name: 'Implement and Manage a Firewall on Servers',
  description: 'Implement and manage a firewall on servers, where supported. Example implementations include a virtual firewall, operating system firewall, or a third-party firewall agent.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Implement and manage a firewall on servers, where supported. Example s include a virtual firewall, operating system firewall, or a third-party firewall agent.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* s include a virtual firewall, operating system firewall, or a third-party firewall agent.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-4.5',
  standardId: 'cis-ig3',
  section: '4',
  code: '4.5',
  name: 'Implement and Manage a Firewall on End-User Devices',
  description: 'Implement and manage a host-based firewall or port-filtering tool on end-user devices, with a default-deny rule that drops all traffic except those services and ports that are explicitly allowed.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Implement and manage a host-based firewall or port-filtering tool on end-user devices, with a default-deny rule that drops all traffic except those services and ports that are explicitly allowed.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-4.6',
  standardId: 'cis-ig3',
  section: '4',
  code: '4.6',
  name: 'Securely Manage Enterprise Assets and Software',
  description: 'Securely manage enterprise assets and software. Example implementations include managing configuration through version-controlled Infrastructure-as-Code (IaC) and accessing administrative interfaces over secure network protocols, such as Secure Shell (SSH) and Hypertext Transfer Protocol Secure (HTTPS). Do not use insecure management protocols, such as Telnet and HTTP, unless operationally essential.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Securely manage enterprise assets and software. Example s include managing configuration through version-controlled Infrastructure-as-Code (IaC) and accessing administrative interfaces over secure network protocols, such as Secure Shell (SSH) and Hypertext Transfer Protocol Secure (HTTPS). Do not use insecure management protocols, such as Telnet and HTTP, unless operationally essential.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* s include managing configuration through version-controlled Infrastructure-as-Code (IaC) and accessing administrative interfaces over secure network protocols, such as Secure Shell (SSH) and Hypertext Transfer Protocol Secure (HTTPS). Do not use insecure management protocols, such as Telnet and HTTP, unless operationally essential.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-4.7',
  standardId: 'cis-ig3',
  section: '4',
  code: '4.7',
  name: 'Manage Default Accounts on Enterprise Assets and Software',
  description: 'Manage default accounts on enterprise assets and software, such as root, administrator, and other pre-configured vendor accounts. Example implementations can include disabling default accounts or making them unusable.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Manage default accounts on enterprise assets and software, such as root, administrator, and other pre-configured vendor accounts. Example s can include disabling default accounts or making them unusable.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* s can include disabling default accounts or making them unusable.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-4.8',
  standardId: 'cis-ig3',
  section: '4',
  code: '4.8',
  name: 'Uninstall or Disable Unnecessary Services on Enterprise Assets and Software',
  description: 'Uninstall or disable unnecessary services on enterprise assets and software, such as an unused file sharing service, web application module, or service function.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Uninstall or disable unnecessary services on enterprise assets and software, such as an unused file sharing service, web application module, or service function.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-4.9',
  standardId: 'cis-ig3',
  section: '4',
  code: '4.9',
  name: 'Configure Trusted DNS Servers on Enterprise Assets',
  description: 'Configure trusted DNS servers on network infrastructure. Example implementations include configuring network devices to use enterprise-controlled DNS servers and/or reputable externally accessible DNS servers.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Configure trusted DNS servers on network infrastructure. Example s include configuring network devices to use enterprise-controlled DNS servers and/or reputable externally accessible DNS servers.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* s include configuring network devices to use enterprise-controlled DNS servers and/or reputable externally accessible DNS servers.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-4.10',
  standardId: 'cis-ig3',
  section: '4',
  code: '4.10',
  name: 'Enforce Automatic Device Lockout on Portable End-User Devices',
  description: 'Enforce automatic device lockout following a predetermined threshold of local failed authentication attempts on portable end-user devices, where supported. For laptops, do not allow more than 20 failed authentication attempts; for tablets and smartphones, no more than 10 failed authentication attempts. Example implementations include Microsoft InTune Device Lock and Apple Configuration Profile maxFailedAttempts.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Enforce automatic device lockout following a predetermined threshold of local failed authentication attempts on portable end-user devices, where supported. For laptops, do not allow more than 20 failed authentication attempts; for tablets and smartphones, no more than 10 failed authentication attempts. Example s include Microsoft InTune Device Lock and Apple Configuration Profile maxFailedAttempts.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* s include Microsoft InTune Device Lock and Apple Configuration Profile maxFailedAttempts.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-4.11',
  standardId: 'cis-ig3',
  section: '4',
  code: '4.11',
  name: 'Enforce Remote Wipe Capability on Portable End-User Devices',
  description: 'Remotely wipe enterprise data from enterprise-owned portable end-user devices when deemed appropriate such as lost or stolen devices, or when an individual no longer supports the enterprise.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Remotely wipe enterprise data from enterprise-owned portable end-user devices when deemed appropriate such as lost or stolen devices, or when an individual no longer supports the enterprise.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-4.12',
  standardId: 'cis-ig3',
  section: '4',
  code: '4.12',
  name: 'Separate Enterprise Workspaces on Mobile End-User Devices',
  description: 'Ensure separate enterprise workspaces are used on mobile end-user devices, where supported. Example implementations include using an Apple Configuration Profile or Android Work Profile to separate enterprise applications and data from personal applications and data.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Ensure separate enterprise workspaces are used on mobile end-user devices, where supported. Example s include using an Apple Configuration Profile or Android Work Profile to separate enterprise applications and data from personal applications and data.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them

**Implementation**

* s include using an Apple Configuration Profile or Android Work Profile to separate enterprise applications and data from personal applications and data.\n\n \n- Establish documented secure configuration standards for all asset types\n- Base configurations on industry-recognized standards (CIS Benchmarks, DISA STIGs)\n- Configure automatic session locking on all enterprise assets\n- Implement host-based firewalls on servers and end-user devices\n- Use secure protocols for management access (SSH, HTTPS)\n- Manage default accounts by disabling or reconfiguring them`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-5.1',
  standardId: 'cis-ig3',
  section: '5',
  code: '5.1',
  name: 'Establish and Maintain an Inventory of Accounts',
  description: 'Establish and maintain an inventory of all accounts managed in the enterprise. The inventory must at a minimum include user, administrator, and service accounts. The inventory, at a minimum, should contain the person’s name, username, start/stop dates, and department. Validate that all active accounts are authorized, on a recurring schedule at a minimum quarterly or more frequently.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain an inventory of all accounts managed in the enterprise. The inventory must at a minimum include user, administrator, and service accounts. The inventory, at a minimum, should contain the person’s name, username, start/stop dates, and department. Validate that all active accounts are authorized, on a recurring schedule at a minimum quarterly or more frequently.\n\n \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts

**Implementation**

* \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts`,

  tags: ['tag-identity'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-5.2',
  standardId: 'cis-ig3',
  section: '5',
  code: '5.2',
  name: 'Use Unique Passwords',
  description: 'Use unique passwords for all enterprise assets. Best practice implementation includes, at a minimum, an 8-character password for accounts using Multi-Factor Authentication (MFA) and a 14-character password for accounts not using MFA.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Use unique passwords for all enterprise assets. Best practice  includes, at a minimum, an 8-character password for accounts using Multi-Factor Authentication (MFA) and a 14-character password for accounts not using MFA.\n\n \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts

**Implementation**

* includes, at a minimum, an 8-character password for accounts using Multi-Factor Authentication (MFA) and a 14-character password for accounts not using MFA.\n\n \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts`,

  tags: ['tag-identity'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-5.3',
  standardId: 'cis-ig3',
  section: '5',
  code: '5.3',
  name: 'Disable Dormant Accounts',
  description: 'Delete or disable any dormant accounts after a period of 45 days of inactivity, where supported.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Delete or disable any dormant accounts after a period of 45 days of inactivity, where supported.\n\n \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts

**Implementation**

* \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts`,

  tags: ['tag-identity'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-5.4',
  standardId: 'cis-ig3',
  section: '5',
  code: '5.4',
  name: 'Restrict Administrator Privileges to Dedicated Administrator Accounts',
  description: 'Restrict administrator privileges to dedicated administrator accounts on enterprise assets. Conduct general computing activities, such as internet browsing, email, and productivity suite use, from the user’s primary, non-privileged account.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Restrict administrator privileges to dedicated administrator accounts on enterprise assets. Conduct general computing activities, such as internet browsing, email, and productivity suite use, from the user’s primary, non-privileged account.\n\n \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts

**Implementation**

* \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts`,

  tags: ['tag-identity'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-5.5',
  standardId: 'cis-ig3',
  section: '5',
  code: '5.5',
  name: 'Establish and Maintain an Inventory of Service Accounts',
  description: 'Establish and maintain an inventory of service accounts. The inventory, at a minimum, must contain department owner, review date, and purpose. Perform service account reviews to validate that all active accounts are authorized, on a recurring schedule at a minimum quarterly or more frequently.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain an inventory of service accounts. The inventory, at a minimum, must contain department owner, review date, and . Perform service account reviews to validate that all active accounts are authorized, on a recurring schedule at a minimum quarterly or more frequently.\n\n \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts

**Implementation**

* \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts`,

  tags: ['tag-identity'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-5.6',
  standardId: 'cis-ig3',
  section: '5',
  code: '5.6',
  name: 'Centralize Account Management',
  description: 'Centralize account management through a directory or identity service.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Centralize account management through a directory or identity service.\n\n \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts

**Implementation**

* \n- Create and maintain a comprehensive inventory of all accounts\n- Implement strong password policies (minimum 14 characters for non-MFA accounts)\n- Disable accounts after 45 days of inactivity\n- Separate administrative and regular user accounts\n- Review and audit account access quarterly\n- Implement account lockout after failed authentication attempts`,

  tags: ['tag-identity'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-6.1',
  standardId: 'cis-ig3',
  section: '6',
  code: '6.1',
  name: 'Establish an Access Granting Process',
  description: 'Establish and follow a documented process, preferably automated, for granting access to enterprise assets upon new hire or role change of a user.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and follow a documented process, preferably automated, for granting access to enterprise assets upon new hire or role change of a user.\n\n \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need

**Implementation**

* \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need`,

  tags: ['tag-access-control'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-6.2',
  standardId: 'cis-ig3',
  section: '6',
  code: '6.2',
  name: 'Establish an Access Revoking Process',
  description: 'Establish and follow a process, preferably automated, for revoking access to enterprise assets, through disabling accounts immediately upon termination, rights revocation, or role change of a user. Disabling accounts, instead of deleting accounts, may be necessary to preserve audit trails.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and follow a process, preferably automated, for revoking access to enterprise assets, through disabling accounts immediately upon termination, rights revocation, or role change of a user. Disabling accounts, instead of deleting accounts, may be necessary to preserve audit trails.\n\n \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need

**Implementation**

* \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need`,

  tags: ['tag-access-control'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-6.3',
  standardId: 'cis-ig3',
  section: '6',
  code: '6.3',
  name: 'Require MFA for Externally-Exposed Applications',
  description: 'Require all externally-exposed enterprise or third-party applications to enforce MFA, where supported. Enforcing MFA through a directory service or SSO provider is a satisfactory implementation of this safeguard.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Require all externally-exposed enterprise or third-party applications to enforce MFA, where supported. Enforcing MFA through a directory service or SSO provider is a satisfactory  of this safeguard.\n\n \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need

**Implementation**

* of this safeguard.\n\n \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need`,

  tags: ['tag-access-control'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-6.4',
  standardId: 'cis-ig3',
  section: '6',
  code: '6.4',
  name: 'Require MFA for Remote Network Access',
  description: 'Require MFA for remote network access.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Require MFA for remote network access.\n\n \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need

**Implementation**

* \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need`,

  tags: ['tag-access-control'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-6.5',
  standardId: 'cis-ig3',
  section: '6',
  code: '6.5',
  name: 'Require MFA for Administrative Access',
  description: 'Require MFA for all administrative access accounts, where supported, on all enterprise assets, whether managed on-site or through a service provider.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Require MFA for all administrative access accounts, where supported, on all enterprise assets, whether managed on-site or through a service provider.\n\n \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need

**Implementation**

* \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need`,

  tags: ['tag-access-control'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-6.6',
  standardId: 'cis-ig3',
  section: '6',
  code: '6.6',
  name: 'Establish and Maintain an Inventory of Authentication and Authorization Systems',
  description: 'Establish and maintain an inventory of the enterprise’s authentication and authorization systems, including those hosted on-site or at a remote service provider. Review and update the inventory, at a minimum, annually or more frequently.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain an inventory of the enterprise’s authentication and authorization systems, including those hosted on-site or at a remote service provider. Review and update the inventory, at a minimum, annually or more frequently.\n\n \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need

**Implementation**

* \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need`,

  tags: ['tag-access-control'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-6.7',
  standardId: 'cis-ig3',
  section: '6',
  code: '6.7',
  name: 'Centralize Access Control',
  description: 'Centralize access control for all enterprise assets through a directory service or SSO provider, where supported.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Centralize access control for all enterprise assets through a directory service or SSO provider, where supported.\n\n \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need

**Implementation**

* \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need`,

  tags: ['tag-access-control'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-6.8',
  standardId: 'cis-ig3',
  section: '6',
  code: '6.8',
  name: 'Define and Maintain Role-Based Access Control',
  description: 'Define and maintain role-based access control, through determining and documenting the access rights necessary for each role within the enterprise to successfully carry out its assigned duties. Perform access control reviews of enterprise assets to validate that all privileges are authorized, on a recurring schedule at a minimum annually or more frequently.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Define and maintain role-based access control, through determining and documenting the access rights necessary for each role within the enterprise to successfully carry out its assigned duties. Perform access control reviews of enterprise assets to validate that all privileges are authorized, on a recurring schedule at a minimum annually or more frequently.\n\n \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need

**Implementation**

* \n- Document formal processes for granting and revoking access\n- Implement the principle of least privilege for access rights\n- Deploy multi-factor authentication for externally-exposed applications\n- Require MFA for remote network access and administrative accounts\n- Implement automated provisioning and deprovisioning\n- Conduct regular access reviews to validate continued business need`,

  tags: ['tag-access-control'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-7.1',
  standardId: 'cis-ig3',
  section: '7',
  code: '7.1',
  name: 'Establish and Maintain a Vulnerability Management Process',
  description: 'Establish and maintain a documented vulnerability management process for enterprise assets. Review and update documentation annually or when significant enterprise changes occur that could impact this safeguard.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a documented vulnerability management process for enterprise assets. Review and update documentation annually or when significant enterprise changes occur that could impact this safeguard.\n\n \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls

**Implementation**

* \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-7.2',
  standardId: 'cis-ig3',
  section: '7',
  code: '7.2',
  name: 'Establish and Maintain a Remediation Process',
  description: 'Establish and maintain a risk-based remediation strategy documented in a remediation process, with monthly or more frequent reviews.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a risk-based remediation strategy documented in a remediation process, with monthly or more frequent reviews.\n\n \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls

**Implementation**

* \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-7.3',
  standardId: 'cis-ig3',
  section: '7',
  code: '7.3',
  name: 'Perform Automated Operating System Patch Management',
  description: 'Perform operating system updates on enterprise assets through automated patch management on a monthly or more frequent basis.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Perform operating system updates on enterprise assets through automated patch management on a monthly or more frequent basis.\n\n \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls

**Implementation**

* \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-7.4',
  standardId: 'cis-ig3',
  section: '7',
  code: '7.4',
  name: 'Perform Automated Application Patch Management',
  description: 'Perform application updates on enterprise assets through automated patch management on a monthly or more frequent basis.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Perform application updates on enterprise assets through automated patch management on a monthly or more frequent basis.\n\n \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls

**Implementation**

* \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-7.5',
  standardId: 'cis-ig3',
  section: '7',
  code: '7.5',
  name: 'Perform Automated Vulnerability Scans of Internal Enterprise Assets',
  description: 'Perform automated vulnerability scans of internal enterprise assets on a quarterly or more frequent basis. Conduct both authenticated and unauthenticated scans.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Perform automated vulnerability scans of internal enterprise assets on a quarterly or more frequent basis. Conduct both authenticated and unauthenticated scans.\n\n \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls

**Implementation**

* \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-7.6',
  standardId: 'cis-ig3',
  section: '7',
  code: '7.6',
  name: 'Perform Automated Vulnerability Scans of Externally-Exposed Enterprise Assets',
  description: 'Perform automated vulnerability scans of externally-exposed enterprise assets. Perform scans on a monthly or more frequent basis.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Perform automated vulnerability scans of externally-exposed enterprise assets. Perform scans on a monthly or more frequent basis.\n\n \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls

**Implementation**

* \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-7.7',
  standardId: 'cis-ig3',
  section: '7',
  code: '7.7',
  name: 'Remediate Detected Vulnerabilities',
  description: 'Remediate detected vulnerabilities in software through processes and tooling on a monthly or more frequent basis, based on the remediation process.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Remediate detected vulnerabilities in software through processes and tooling on a monthly or more frequent basis, based on the remediation process.\n\n \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls

**Implementation**

* \n- Establish a documented vulnerability management process\n- Implement automated vulnerability scanning tools\n- Define risk-based remediation timelines based on severity\n- Deploy automated patch management for operating systems and applications\n- Verify remediation effectiveness after implementing fixes\n- Conduct regular penetration testing to validate security controls`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
// IG3 kapitel 8
{
  id: 'cis-ig3-8.1',
  standardId: 'cis-ig3',
  section: '8',
  code: '8.1',
  name: 'Establish and Maintain an Audit Log Management Process',
  description: 'Establish and maintain a documented audit log management process that defines the enterprise’s logging requirements. At a minimum, address the collection, review, and retention of audit logs for enterprise assets. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a documented audit log management process that defines the enterprise’s logging requirements. At a minimum, address the collection, review, and retention of audit logs for enterprise assets. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,

  tags: ['tag-logging'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-8.2',
  standardId: 'cis-ig3',
  section: '8',
  code: '8.2',
  name: 'Collect Audit Logs',
  description: 'Collect audit logs. Ensure that logging, per the enterprise’s audit log management process, has been enabled across enterprise assets.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Collect audit logs. Ensure that logging, per the enterprise’s audit log management process, has been enabled across enterprise assets.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,

  tags: ['tag-logging'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-8.3',
  standardId: 'cis-ig3',
  section: '8',
  code: '8.3',
  name: 'Ensure Adequate Audit Log Storage',
  description: 'Ensure that logging destinations maintain adequate storage to comply with the enterprise’s audit log management process.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Ensure that logging destinations maintain adequate storage to comply with the enterprise’s audit log management process.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,

  tags: ['tag-logging'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-8.4',
  standardId: 'cis-ig3',
  section: '8',
  code: '8.4',
  name: 'Standardize Time Synchronization',
  description: 'Standardize time synchronization. Configure at least two synchronized time sources across enterprise assets, where supported.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Standardize time synchronization. Configure at least two synchronized time sources across enterprise assets, where supported.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,

  tags: ['tag-logging'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-8.5',
  standardId: 'cis-ig3',
  section: '8',
  code: '8.5',
  name: 'Collect Detailed Audit Logs',
  description: 'Configure detailed audit logging for enterprise assets containing sensitive data. Include event source, date, username, timestamp, source addresses, destination addresses, and other useful elements that could assist in a forensic investigation.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Configure detailed audit logging for enterprise assets containing sensitive data. Include event source, date, username, timestamp, source addresses, destination addresses, and other useful elements that could assist in a forensic investigation.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,

  tags: ['tag-logging'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-8.6',
  standardId: 'cis-ig3',
  section: '8',
  code: '8.6',
  name: 'Collect DNS Query Audit Logs',
  description: 'Collect DNS query audit logs on enterprise assets, where appropriate and supported.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Collect DNS query audit logs on enterprise assets, where appropriate and supported.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,

  tags: ['tag-logging'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-8.7',
  standardId: 'cis-ig3',
  section: '8',
  code: '8.7',
  name: 'Collect URL Request Audit Logs',
  description: 'Collect URL request audit logs on enterprise assets, where appropriate and supported.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Collect URL request audit logs on enterprise assets, where appropriate and supported.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,

  tags: ['tag-logging'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-8.8',
  standardId: 'cis-ig3',
  section: '8',
  code: '8.8',
  name: 'Collect Command-Line Audit Logs',
  description: 'Collect command-line audit logs. Example implementations include collecting audit logs from PowerShell®, BASH™, and remote administrative terminals.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Collect command-line audit logs. Example s include collecting audit logs from PowerShell®, BASH™, and remote administrative terminals.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* s include collecting audit logs from PowerShell®, BASH™, and remote administrative terminals.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,

  tags: ['tag-logging'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-8.9',
  standardId: 'cis-ig3',
  section: '8',
  code: '8.9',
  name: 'Centralize Audit Logs',
  description: 'Centralize, to the extent possible, audit log collection and retention across enterprise assets in accordance with the documented audit log management process. Example implementations primarily include leveraging a SIEM tool to centralize multiple log sources.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Centralize, to the extent possible, audit log collection and retention across enterprise assets in accordance with the documented audit log management process. Example s primarily include leveraging a SIEM tool to centralize multiple log sources.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* s primarily include leveraging a SIEM tool to centralize multiple log sources.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,

  tags: ['tag-logging'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-8.10',
  standardId: 'cis-ig3',
  section: '8',
  code: '8.10',
  name: 'Retain Audit Logs',
  description: 'Retain audit logs across enterprise assets for a minimum of 90 days.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Retain audit logs across enterprise assets for a minimum of 90 days.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,

  tags: ['tag-logging'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-8.11',
  standardId: 'cis-ig3',
  section: '8',
  code: '8.11',
  name: 'Conduct Audit Log Reviews',
  description: 'Conduct reviews of audit logs to detect anomalies or abnormal events that could indicate a potential threat. Conduct reviews on a weekly, or more frequent, basis.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Conduct reviews of audit logs to detect anomalies or abnormal events that could indicate a potential threat. Conduct reviews on a weekly, or more frequent, basis.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,

  tags: ['tag-logging'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-8.12',
  standardId: 'cis-ig3',
  section: '8',
  code: '8.12',
  name: 'Collect Service Provider Logs',
  description: 'Collect service provider logs, where supported. Example implementations include collecting authentication and authorization events, data creation and disposal events, and user management events.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Collect service provider logs, where supported. Example s include collecting authentication and authorization events, data creation and disposal events, and user management events.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity

**Implementation**

* s include collecting authentication and authorization events, data creation and disposal events, and user management events.\n\n \n- Configure comprehensive logging across all enterprise assets\n- Include authentication, authorization, and system configuration changes in logs\n- Implement secure centralized log collection\n- Protect log data from unauthorized access and modification\n- Establish log retention policies aligned with organizational requirements\n- Review logs regularly for suspicious activity`,

  tags: ['tag-logging'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},

// IG3 kapitel 9
{
  id: 'cis-ig3-9.1',
  standardId: 'cis-ig3',
  section: '9',
  code: '9.1',
  name: 'Ensure Use of Only Fully Supported Browsers and Email Clients',
  description: 'Ensure only fully supported browsers and email clients are allowed to execute in the enterprise, only using the latest version of browsers and email clients provided through the vendor.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Ensure only fully supported browsers and email clients are allowed to execute in the enterprise, only using the latest version of browsers and email clients provided through the vendor.\n\n \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients

**Implementation**

* \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients`,

  tags: ['tag-endpoint'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-9.2',
  standardId: 'cis-ig3',
  section: '9',
  code: '9.2',
  name: 'Use DNS Filtering Services',
  description: 'Use DNS filtering services on all end-user devices, including remote and on-premises assets, to block access to known malicious domains.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Use DNS filtering services on all end-user devices, including remote and on-premises assets, to block access to known malicious domains.\n\n \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients

**Implementation**

* \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients`,

  tags: ['tag-endpoint'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-9.3',
  standardId: 'cis-ig3',
  section: '9',
  code: '9.3',
  name: 'Maintain and Enforce Network-Based URL Filters',
  description: 'Enforce and update network-based URL filters to limit an enterprise asset from connecting to potentially malicious or unapproved websites. Example implementations include category-based filtering, reputation-based filtering, or through the use of block lists. Enforce filters for all enterprise assets.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Enforce and update network-based URL filters to limit an enterprise asset from connecting to potentially malicious or unapproved websites. Example s include category-based filtering, reputation-based filtering, or through the use of block lists. Enforce filters for all enterprise assets.\n\n \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients

**Implementation**

* s include category-based filtering, reputation-based filtering, or through the use of block lists. Enforce filters for all enterprise assets.\n\n \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients`,

  tags: ['tag-endpoint'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-9.4',
  standardId: 'cis-ig3',
  section: '9',
  code: '9.4',
  name: 'Restrict Unnecessary or Unauthorized Browser and Email Client Extensions',
  description: 'Restrict, either through uninstalling or disabling, any unauthorized or unnecessary browser or email client plugins, extensions, and add-on applications.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Restrict, either through uninstalling or disabling, any unauthorized or unnecessary browser or email client plugins, extensions, and add-on applications.\n\n \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients

**Implementation**

* \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients`,

  tags: ['tag-endpoint'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-9.5',
  standardId: 'cis-ig3',
  section: '9',
  code: '9.5',
  name: 'Implement DMARC',
  description: 'To lower the chance of spoofed or modified emails from valid domains, implement DMARC policy and verification, starting with implementing the Sender Policy Framework (SPF) and the DomainKeys Identified Mail (DKIM) standards.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

To lower the chance of spoofed or modified emails from valid domains, implement DMARC policy and verification, starting with implementing the Sender Policy Framework (SPF) and the DomainKeys Identified Mail (DKIM) standards.\n\n \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients

**Implementation**

* \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients`,

  tags: ['tag-endpoint'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-9.6',
  standardId: 'cis-ig3',
  section: '9',
  code: '9.6',
  name: 'Block Unnecessary File Types',
  description: 'Block unnecessary file types attempting to enter the enterprise’s email gateway.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Block unnecessary file types attempting to enter the enterprise’s email gateway.\n\n \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients

**Implementation**

* \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients`,

  tags: ['tag-endpoint'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-9.7',
  standardId: 'cis-ig3',
  section: '9',
  code: '9.7',
  name: 'Deploy and Maintain Email Server Anti-Malware Protections',
  description: 'Deploy and maintain email server anti-malware protections, such as attachment scanning and/or sandboxing.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Deploy and maintain email server anti-malware protections, such as attachment scanning and/or sandboxing.\n\n \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients

**Implementation**

* \n- Deploy DNS filtering services to block access to known malicious domains\n- Implement email security controls (SPF, DKIM, DMARC)\n- Configure web content filtering to prevent access to malicious websites\n- Use only fully supported web browsers with security extensions\n- Disable unnecessary browser plugins and features\n- Implement automated updates for browsers and email clients`,

  tags: ['tag-endpoint'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
// IG3 kapitel 10
{
  id: 'cis-ig3-10.1',
  standardId: 'cis-ig3',
  section: '10',
  code: '10.1',
  name: 'Deploy and Maintain Anti-Malware Software',
  description: 'Deploy and maintain anti-malware software on all enterprise assets, and ensure it is updated regularly to detect and respond to known threats.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Deploy and maintain anti-malware software on all enterprise assets, and ensure it is updated regularly to detect and respond to known threats.\n\n \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution

**Implementation**

* \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution`,

  tags: ['tag-endpoint'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-10.2',
  standardId: 'cis-ig3',
  section: '10',
  code: '10.2',
  name: 'Configure Automatic Anti-Malware Signature Updates',
  description: 'Configure automatic updates for anti-malware signature files on all enterprise assets.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Configure automatic updates for anti-malware signature files on all enterprise assets.\n\n \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution

**Implementation**

* \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution`,

  tags: ['tag-endpoint'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-10.3',
  standardId: 'cis-ig3',
  section: '10',
  code: '10.3',
  name: 'Disable Autorun and Autoplay for Removable Media',
  description: 'Disable autorun and autoplay auto-execute functionality for removable media.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Disable autorun and autoplay auto-execute functionality for removable media.\n\n \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution

**Implementation**

* \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution`,

  tags: ['tag-endpoint'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-10.4',
  standardId: 'cis-ig3',
  section: '10',
  code: '10.4',
  name: 'Configure Automatic Anti-Malware Scanning of Removable Media',
  description: 'Configure anti-malware software to automatically scan removable media.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Configure anti-malware software to automatically scan removable media.\n\n \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution

**Implementation**

* \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution`,

  tags: ['tag-endpoint'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-10.5',
  standardId: 'cis-ig3',
  section: '10',
  code: '10.5',
  name: 'Enable Anti-Exploitation Features',
  description: 'Enable anti-exploitation features on enterprise assets and software, where possible, such as Microsoft® Data Execution Prevention (DEP), Windows® Defender Exploit Guard (WDEG), or Apple® System Integrity Protection (SIP) and Gatekeeper™.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Enable anti-exploitation features on enterprise assets and software, where possible, such as Microsoft® Data Execution Prevention (DEP), Windows® Defender Exploit Guard (WDEG), or Apple® System Integrity Protection (SIP) and Gatekeeper™.\n\n \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution

**Implementation**

* \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution`,

  tags: ['tag-endpoint'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-10.6',
  standardId: 'cis-ig3',
  section: '10',
  code: '10.6',
  name: 'Centrally Manage Anti-Malware Software',
  description: 'Centrally manage anti-malware software.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Centrally manage anti-malware software.\n\n \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution

**Implementation**

* \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution`,

  tags: ['tag-endpoint'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-10.7',
  standardId: 'cis-ig3',
  section: '10',
  code: '10.7',
  name: 'Use Behavior-Based Anti-Malware Software',
  description: 'Use behavior-based anti-malware software.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Use behavior-based anti-malware software.\n\n \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution

**Implementation**

* \n- Deploy anti-malware software on all enterprise assets\n- Configure real-time scanning for files and applications\n- Implement centralized management of malware defenses\n- Regularly update malware definitions and engines\n- Scan removable media automatically\n- Implement application allowlisting to prevent unauthorized code execution`,

  tags: ['tag-endpoint'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
// IG3 kapitel 11
{
  id: 'cis-ig3-11.1',
  standardId: 'cis-ig3',
  section: '11',
  code: '11.1',
  name: 'Establish and Maintain a Data Recovery Process',
  description: 'Establish and maintain a documented data recovery process that includes detailed backup procedures. In the process, address the scope of data recovery activities, recovery prioritization, and the security of backup data. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a documented data recovery process that includes detailed backup procedures. In the process, address the scope of data recovery activities, recovery prioritization, and the security of backup data. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-backup'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-11.2',
  standardId: 'cis-ig3',
  section: '11',
  code: '11.2',
  name: 'Perform Automated Backups',
  description: 'Perform automated backups of in-scope enterprise assets. Run backups weekly, or more frequently, based on the sensitivity of the data.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Perform automated backups of in-scope enterprise assets. Run backups weekly, or more frequently, based on the sensitivity of the data.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-backup'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-11.3',
  standardId: 'cis-ig3',
  section: '11',
  code: '11.3',
  name: 'Protect Recovery Data',
  description: 'Protect recovery data with equivalent controls to the original data. Reference encryption or data separation, based on requirements.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Protect recovery data with equivalent controls to the original data. Reference encryption or data separation, based on requirements.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-backup'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-11.4',
  standardId: 'cis-ig3',
  section: '11',
  code: '11.4',
  name: 'Establish and Maintain an Isolated Instance of Recovery Data',
  description: 'Establish and maintain an isolated instance of recovery data. Example implementations include, version controlling backup destinations through offline, cloud, or off-site systems or services.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain an isolated instance of recovery data. Example s include, version controlling backup destinations through offline, cloud, or off-site systems or services.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* s include, version controlling backup destinations through offline, cloud, or off-site systems or services.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-backup'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-11.5',
  standardId: 'cis-ig3',
  section: '11',
  code: '11.5',
  name: 'Test Data Recovery',
  description: 'Test backup recovery quarterly, or more frequently, for a sampling of in-scope enterprise assets.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Test backup recovery quarterly, or more frequently, for a sampling of in-scope enterprise assets.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-backup'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-12.1',
  standardId: 'cis-ig3',
  section: '12',
  code: '12.1',
  name: 'Ensure Network Infrastructure is Up-to-Date',
  description: 'Ensure network infrastructure is kept up-to-date. Example implementations include running the latest stable release of software and/or using currently supported network as a service (NaaS) offerings. Review software versions monthly, or more frequently, to verify software support.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Ensure network infrastructure is kept up-to-date. Example s include running the latest stable release of software and/or using currently supported network as a service (NaaS) offerings. Review software versions monthly, or more frequently, to verify software support.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* s include running the latest stable release of software and/or using currently supported network as a service (NaaS) offerings. Review software versions monthly, or more frequently, to verify software support.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-network'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-12.2',
  standardId: 'cis-ig3',
  section: '12',
  code: '12.2',
  name: 'Establish and Maintain a Secure Network Architecture',
  description: 'Design and maintain a secure network architecture. A secure network architecture must address segmentation, least privilege, and availability, at a minimum. Example implementations may include documentation, policy, and design components.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Design and maintain a secure network architecture. A secure network architecture must address segmentation, least privilege, and availability, at a minimum. Example s may include documentation, policy, and design components.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* s may include documentation, policy, and design components.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-network'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-12.3',
  standardId: 'cis-ig3',
  section: '12',
  code: '12.3',
  name: 'Securely Manage Network Infrastructure',
  description: 'Securely manage network infrastructure. Example implementations include version-controlled Infrastructure-as-Code (IaC), and the use of secure network protocols, such as SSH and HTTPS.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Securely manage network infrastructure. Example s include version-controlled Infrastructure-as-Code (IaC), and the use of secure network protocols, such as SSH and HTTPS.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* s include version-controlled Infrastructure-as-Code (IaC), and the use of secure network protocols, such as SSH and HTTPS.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-network'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-12.4',
  standardId: 'cis-ig3',
  section: '12',
  code: '12.4',
  name: 'Establish and Maintain Architecture Diagram(s)',
  description: 'Establish and maintain architecture diagram(s) and/or other network system documentation. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain architecture diagram(s) and/or other network system documentation. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-network'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-12.5',
  standardId: 'cis-ig3',
  section: '12',
  code: '12.5',
  name: 'Centralize Network Authentication, Authorization, and Auditing (AAA)',
  description: 'Centralize network AAA.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Centralize network AAA.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-network'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-12.6',
  standardId: 'cis-ig3',
  section: '12',
  code: '12.6',
  name: 'Use of Secure Network Management and Communication Protocols',
  description: 'Adopt secure network management protocols (e.g., 802.1X) and secure communication protocols (e.g., Wi-Fi Protected Access 2 (WPA2) Enterprise or more secure alternatives).',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Adopt secure network management protocols (e.g., 802.1X) and secure communication protocols (e.g., Wi-Fi Protected Access 2 (WPA2) Enterprise or more secure alternatives).\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-network'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-12.7',
  standardId: 'cis-ig3',
  section: '12',
  code: '12.7',
  name: 'Ensure Remote Devices Utilize a VPN and are Connecting to an Enterprise’s AAA Infrastructure',
  description: 'Require users to authenticate to enterprise-managed VPN and authentication services prior to accessing enterprise resources on end-user devices.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Require users to authenticate to enterprise-managed VPN and authentication services prior to accessing enterprise resources on end-user devices.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-network'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-12.8',
  standardId: 'cis-ig3',
  section: '12',
  code: '12.8',
  name: 'Establish and Maintain Dedicated Computing Resources for All Administrative Work',
  description: 'Establish and maintain dedicated computing resources, either physically or logically separated, for all administrative tasks or tasks requiring administrative access. The computing resources should be segmented from the enterprise\'s primary network and not be allowed internet access.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,
  tags: ['tag-network'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-13.1',
  standardId: 'cis-ig3',
  section: '13',
  code: '13.1',
  name: 'Centralize Security Event Alerting',
  description: 'Centralize security event alerting across enterprise assets for log correlation and analysis. Best practice implementation requires the use of a SIEM, which includes vendor-defined event correlation alerts. A log analytics platform configured with security-relevant correlation alerts also satisfies this Safeguard.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Centralize security event alerting across enterprise assets for log correlation and analysis. Best practice  requires the use of a SIEM, which includes vendor-defined event correlation alerts. A log analytics platform configured with security-relevant correlation alerts also satisfies this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* requires the use of a SIEM, which includes vendor-defined event correlation alerts. A log analytics platform configured with security-relevant correlation alerts also satisfies this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-network'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-13.2',
  standardId: 'cis-ig3',
  section: '13',
  code: '13.2',
  name: 'Deploy a Host-Based Intrusion Detection Solution',
  description: 'Deploy a host-based intrusion detection solution on enterprise assets, where appropriate and/or supported.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Deploy a host-based intrusion detection solution on enterprise assets, where appropriate and/or supported.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-network'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-13.3',
  standardId: 'cis-ig3',
  section: '13',
  code: '13.3',
  name: 'Deploy a Network Intrusion Detection Solution',
  description: 'Deploy a network intrusion detection solution on enterprise assets, where appropriate. Example implementations include the use of a Network Intrusion Detection System (NIDS) or equivalent cloud service provider (CSP) service.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Deploy a network intrusion detection solution on enterprise assets, where appropriate. Example s include the use of a Network Intrusion Detection System (NIDS) or equivalent cloud service provider (CSP) service.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* s include the use of a Network Intrusion Detection System (NIDS) or equivalent cloud service provider (CSP) service.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-network'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-13.4',
  standardId: 'cis-ig3',
  section: '13',
  code: '13.4',
  name: 'Perform Traffic Filtering Between Network Segments',
  description: 'Perform traffic filtering between network segments, where appropriate.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Perform traffic filtering between network segments, where appropriate.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-network'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-13.5',
  standardId: 'cis-ig3',
  section: '13',
  code: '13.5',
  name: 'Manage Access Control for Remote Assets',
  description: 'Manage access control for assets remotely connecting to enterprise resources. Determine amount of access to enterprise resources based on: up-to-date anti-malware software installed, configuration compliance with the enterprise’s secure configuration process, and ensuring the operating system and applications are up-to-date.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Manage access control for assets remotely connecting to enterprise resources. Determine amount of access to enterprise resources based on: up-to-date anti-malware software installed, configuration compliance with the enterprise’s secure configuration process, and ensuring the operating system and applications are up-to-date.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-network'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-13.6',
  standardId: 'cis-ig3',
  section: '13',
  code: '13.6',
  name: 'Collect Network Traffic Flow Logs',
  description: 'Collect network traffic flow logs and/or network traffic to review and alert upon from network devices.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Collect network traffic flow logs and/or network traffic to review and alert upon from network devices.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-network'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
// IG3-only krav nedan:
{
  id: 'cis-ig3-13.7',
  standardId: 'cis-ig3',
  section: '13',
  code: '13.7',
  name: 'Deploy a Host-Based Intrusion Prevention Solution',
  description: 'Deploy a host-based intrusion prevention solution on enterprise assets, where appropriate and/or supported. Example implementations include use of an Endpoint Detection and Response (EDR) client or host-based IPS agent.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Deploy a host-based intrusion prevention solution on enterprise assets, where appropriate and/or supported. Example s include use of an Endpoint Detection and Response (EDR) client or host-based IPS agent.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* s include use of an Endpoint Detection and Response (EDR) client or host-based IPS agent.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-network'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-13.8',
  standardId: 'cis-ig3',
  section: '13',
  code: '13.8',
  name: 'Deploy a Network Intrusion Prevention Solution',
  description: 'Deploy a network intrusion prevention solution, where appropriate. Example implementations include the use of a Network Intrusion Prevention System (NIPS) or equivalent CSP service.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Deploy a network intrusion prevention solution, where appropriate. Example s include the use of a Network Intrusion Prevention System (NIPS) or equivalent CSP service.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* s include the use of a Network Intrusion Prevention System (NIPS) or equivalent CSP service.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-network'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-13.9',
  standardId: 'cis-ig3',
  section: '13',
  code: '13.9',
  name: 'Deploy Port-Level Access Control',
  description: 'Deploy port-level access control. Port-level access control utilizes 802.1x, or similar network access control protocols, such as certificates, and may incorporate user and/or device authentication.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Deploy port-level access control. Port-level access control utilizes 802.1x, or similar network access control protocols, such as certificates, and may incorporate user and/or device authentication.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-network'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-13.10',
  standardId: 'cis-ig3',
  section: '13',
  code: '13.10',
  name: 'Perform Application Layer Filtering',
  description: 'Perform application layer filtering. Example implementations include a filtering proxy, application layer firewall, or gateway.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Perform application layer filtering. Example s include a filtering proxy, application layer firewall, or gateway.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* s include a filtering proxy, application layer firewall, or gateway.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-network'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-13.11',
  standardId: 'cis-ig3',
  section: '13',
  code: '13.11',
  name: 'Tune Security Event Alerting Thresholds',
  description: 'Tune security event alerting thresholds monthly, or more frequently.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Tune security event alerting thresholds monthly, or more frequently.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-network'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-14.1',
  standardId: 'cis-ig3',
  section: '14',
  code: '14.1',
  name: 'Establish and Maintain a Security Awareness Program',
  description: 'Establish and maintain a security awareness program. The purpose of a security awareness program is to educate the enterprise’s workforce on how to interact with enterprise assets and data in a secure manner. Conduct training at hire and, at a minimum, annually. Review and update content annually, or when significant enterprise changes occur that could impact this Safeguard.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a security awareness program. The  of a security awareness program is to educate the enterprise’s workforce on how to interact with enterprise assets and data in a secure manner. Conduct training at hire and, at a minimum, annually. Review and update content annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-people'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-14.2',
  standardId: 'cis-ig3',
  section: '14',
  code: '14.2',
  name: 'Train Workforce Members to Recognize Social Engineering Attacks',
  description: 'Train workforce members to recognize social engineering attacks, such as phishing, business email compromise (BEC), pretexting, and tailgating.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Train workforce members to recognize social engineering attacks, such as phishing, business email compromise (BEC), pretexting, and tailgating.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-people'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-14.3',
  standardId: 'cis-ig3',
  section: '14',
  code: '14.3',
  name: 'Train Workforce Members on Authentication Best Practices',
  description: 'Train workforce members on authentication best practices. Example topics include MFA, password composition, and credential management.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Train workforce members on authentication best practices. Example topics include MFA, password composition, and credential management.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-people'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-14.4',
  standardId: 'cis-ig3',
  section: '14',
  code: '14.4',
  name: 'Train Workforce on Data Handling Best Practices',
  description: 'Train workforce members on how to identify and properly store, transfer, archive, and destroy sensitive data. This also includes training workforce members on clear screen and desk best practices, such as locking their screen when they step away from their enterprise asset, erasing physical and virtual whiteboards at the end of meetings, and storing data and assets securely.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Train workforce members on how to identify and properly store, transfer, archive, and destroy sensitive data. This also includes training workforce members on clear screen and desk best practices, such as locking their screen when they step away from their enterprise asset, erasing physical and virtual whiteboards at the end of meetings, and storing data and assets securely.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-people'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-14.5',
  standardId: 'cis-ig3',
  section: '14',
  code: '14.5',
  name: 'Train Workforce Members on Causes of Unintentional Data Exposure',
  description: 'Train workforce members to be aware of causes for unintentional data exposure. Example topics include mis-delivery of sensitive data, losing a portable end-user device, or publishing data to unintended audiences.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Train workforce members to be aware of causes for unintentional data exposure. Example topics include mis-delivery of sensitive data, losing a portable end-user device, or publishing data to unintended audiences.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-people'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-14.6',
  standardId: 'cis-ig3',
  section: '14',
  code: '14.6',
  name: 'Train Workforce Members on Recognizing and Reporting Security Incidents',
  description: 'Train workforce members to be able to recognize a potential incident and be able to report such an incident.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Train workforce members to be able to recognize a potential incident and be able to report such an incident.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-people'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-14.7',
  standardId: 'cis-ig3',
  section: '14',
  code: '14.7',
  name: 'Train Workforce on How to Identify and Report if Their Enterprise Assets are Missing Security Updates',
  description: 'Train workforce to understand how to verify and report out-of-date software patches or any failures in automated processes and tools. Part of this training should include notifying IT personnel of any failures in automated processes and tools.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Train workforce to understand how to verify and report out-of-date software patches or any failures in automated processes and tools. Part of this training should include notifying IT personnel of any failures in automated processes and tools.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-people'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-14.8',
  standardId: 'cis-ig3',
  section: '14',
  code: '14.8',
  name: 'Train Workforce on the Dangers of Connecting to and Transmitting Enterprise Data Over Insecure Networks',
  description: 'Train workforce members on the dangers of connecting to, and transmitting data over, insecure networks for enterprise activities. If the enterprise has remote workers, training must include guidance to ensure that all users securely configure their home network infrastructure.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Train workforce members on the dangers of connecting to, and transmitting data over, insecure networks for enterprise activities. If the enterprise has remote workers, training must include guidance to ensure that all users securely configure their home network infrastructure.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-people'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-14.9',
  standardId: 'cis-ig3',
  section: '14',
  code: '14.9',
  name: 'Conduct Role-Specific Security Awareness and Skills Training',
  description: 'Conduct role-specific security awareness and skills training. Example implementations include secure system administration courses for IT professionals, OWASP® Top 10 vulnerability awareness and prevention training for web application developers, and advanced social engineering awareness training for high-profile roles.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Conduct role-specific security awareness and skills training. Example s include secure system administration courses for IT professionals, OWASP® Top 10 vulnerability awareness and prevention training for web application developers, and advanced social engineering awareness training for high-profile roles.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* s include secure system administration courses for IT professionals, OWASP® Top 10 vulnerability awareness and prevention training for web application developers, and advanced social engineering awareness training for high-profile roles.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-people'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-15.1',
  standardId: 'cis-ig3',
  section: '15',
  code: '15.1',
  name: 'Establish and Maintain an Inventory of Service Providers',
  description: 'Establish and maintain an inventory of service providers. The inventory is to list all known service providers, include classification(s), and designate an enterprise contact for each service provider. Review and update the inventory annually, or when significant enterprise changes occur that could impact this Safeguard.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain an inventory of service providers. The inventory is to list all known service providers, include classification(s), and designate an enterprise contact for each service provider. Review and update the inventory annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-supplier'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-15.2',
  standardId: 'cis-ig3',
  section: '15',
  code: '15.2',
  name: 'Establish and Maintain a Service Provider Management Policy',
  description: 'Establish and maintain a service provider management policy. Ensure the policy addresses the classification, inventory, assessment, monitoring, and decommissioning of service providers. Review and update the policy annually, or when significant enterprise changes occur that could impact this Safeguard.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a service provider management policy. Ensure the policy addresses the classification, inventory, assessment, monitoring, and decommissioning of service providers. Review and update the policy annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-supplier'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-15.3',
  standardId: 'cis-ig3',
  section: '15',
  code: '15.3',
  name: 'Classify Service Providers',
  description: 'Classify service providers. Classification consideration may include one or more characteristics, such as data sensitivity, data volume, availability requirements, applicable regulations, inherent risk, and mitigated risk. Update and review classifications annually, or when significant enterprise changes occur that could impact this Safeguard.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Classify service providers. Classification consideration may include one or more characteristics, such as data sensitivity, data volume, availability requirements, applicable regulations, inherent risk, and mitigated risk. Update and review classifications annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-supplier'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-15.4',
  standardId: 'cis-ig3',
  section: '15',
  code: '15.4',
  name: 'Ensure Service Provider Contracts Include Security Requirements',
  description: 'Ensure service provider contracts include security requirements. Example requirements may include minimum security program requirements, security incident and/or data breach notification and response, data encryption requirements, and data disposal commitments. These security requirements must be consistent with the enterprise’s service provider management policy. Review service provider contracts annually to ensure contracts are not missing security requirements.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Ensure service provider contracts include security requirements. Example requirements may include minimum security program requirements, security incident and/or data breach notification and response, data encryption requirements, and data disposal commitments. These security requirements must be consistent with the enterprise’s service provider management policy. Review service provider contracts annually to ensure contracts are not missing security requirements.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-supplier'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-15.5',
  standardId: 'cis-ig3',
  section: '15',
  code: '15.5',
  name: 'Assess Service Providers',
  description: 'Assess service providers consistent with the enterprise’s service provider management policy. Assessment scope may vary based on classification(s), and may include review of standardized assessment reports, such as Service Organization Control 2 (SOC 2) and Payment Card Industry (PCI) Attestation of Compliance (AoC), customized questionnaires, or other appropriately rigorous processes. Reassess service providers annually, at a minimum, or with new and renewed contracts.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Assess service providers consistent with the enterprise’s service provider management policy. Assessment scope may vary based on classification(s), and may include review of standardized assessment reports, such as Service Organization Control 2 (SOC 2) and Payment Card Industry (PCI) Attestation of Compliance (AoC), customized questionnaires, or other appropriately rigorous processes. Reassess service providers annually, at a minimum, or with new and renewed contracts.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-supplier'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-15.6',
  standardId: 'cis-ig3',
  section: '15',
  code: '15.6',
  name: 'Monitor Service Providers',
  description: 'Monitor service providers consistent with the enterprise’s service provider management policy. Monitoring may include periodic reassessment of service provider compliance, monitoring service provider release notes, and dark web monitoring.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Monitor service providers consistent with the enterprise’s service provider management policy. Monitoring may include periodic reassessment of service provider compliance, monitoring service provider release notes, and dark web monitoring.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-supplier'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-15.7',
  standardId: 'cis-ig3',
  section: '15',
  code: '15.7',
  name: 'Securely Decommission Service Providers',
  description: 'Securely decommission service providers. Example considerations include user and service account deactivation, termination of data flows, and secure disposal of enterprise data within service provider systems.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Securely decommission service providers. Example considerations include user and service account deactivation, termination of data flows, and secure disposal of enterprise data within service provider systems.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-supplier'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-16.1',
  standardId: 'cis-ig3',
  section: '16',
  code: '16.1',
  name: 'Establish and Maintain a Secure Application Development Process',
  description: 'Establish and maintain a secure application development process. In the process, address such items as: secure application design standards, secure coding practices, developer training, vulnerability management, security of third-party code, and application security testing procedures. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a secure application development process. In the process, address such items as: secure application design standards, secure coding practices, developer training, vulnerability management, security of third-party code, and application security testing procedures. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-application'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-16.2',
  standardId: 'cis-ig3',
  section: '16',
  code: '16.2',
  name: 'Establish and Maintain a Process to Accept and Address Software Vulnerabilities',
  description: 'Establish and maintain a process to accept and address reports of software vulnerabilities, including providing a means for external entities to report. The process is to include such items as: a vulnerability handling policy that identifies reporting process, responsible party for handling vulnerability reports, and a process for intake, assignment, remediation, and remediation testing. As part of the process, use a vulnerability tracking system that includes severity ratings and metrics for measuring timing for identification, analysis, and remediation of vulnerabilities. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a process to accept and address reports of software vulnerabilities, including providing a means for external entities to report. The process is to include such items as: a vulnerability handling policy that identifies reporting process, responsible party for handling vulnerability reports, and a process for intake, assignment, remediation, and remediation testing. As part of the process, use a vulnerability tracking system that includes severity ratings and metrics for measuring timing for identification, analysis, and remediation of vulnerabilities. Review and update documentation annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-application'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-16.3',
  standardId: 'cis-ig3',
  section: '16',
  code: '16.3',
  name: 'Perform Root Cause Analysis on Security Vulnerabilities',
  description: 'Perform root cause analysis on security vulnerabilities. When reviewing vulnerabilities, root cause analysis is the task of evaluating underlying issues that create vulnerabilities in code, and allows development teams to move beyond just fixing individual vulnerabilities as they arise.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Perform root cause analysis on security vulnerabilities. When reviewing vulnerabilities, root cause analysis is the task of evaluating underlying issues that create vulnerabilities in code, and allows development teams to move beyond just fixing individual vulnerabilities as they arise.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-application'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-16.4',
  standardId: 'cis-ig3',
  section: '16',
  code: '16.4',
  name: 'Establish and Manage an Inventory of Third-Party Software Components',
  description: 'Establish and manage an updated inventory of third-party components used in development, often referred to as a “bill of materials,” as well as components slated for future use. This inventory is to include any risks that each third-party component could pose. Evaluate the list at least monthly to identify any changes or updates to these components, and validate that the component is still supported.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and manage an updated inventory of third-party components used in development, often referred to as a “bill of materials,” as well as components slated for future use. This inventory is to include any risks that each third-party component could pose. Evaluate the list at least monthly to identify any changes or updates to these components, and validate that the component is still supported.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-application'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-16.5',
  standardId: 'cis-ig3',
  section: '16',
  code: '16.5',
  name: 'Use Up-to-Date and Trusted Third-Party Software Components',
  description: 'Use up-to-date and trusted third-party software components. When possible, choose established and proven frameworks and libraries that provide adequate security. Acquire these components from trusted sources or evaluate the software for vulnerabilities before use.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Use up-to-date and trusted third-party software components. When possible, choose established and proven frameworks and libraries that provide adequate security. Acquire these components from trusted sources or evaluate the software for vulnerabilities before use.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-application'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-16.6',
  standardId: 'cis-ig3',
  section: '16',
  code: '16.6',
  name: 'Establish and Maintain a Severity Rating System and Process for Application Vulnerabilities',
  description: 'Establish and maintain a severity rating system and process for application vulnerabilities that facilitates prioritizing the order in which discovered vulnerabilities are fixed. This process includes setting a minimum level of security acceptability for releasing code or applications. Severity ratings bring a systematic way of triaging vulnerabilities that improves risk management and helps ensure the most severe bugs are fixed first. Review and update the system and process annually.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a severity rating system and process for application vulnerabilities that facilitates prioritizing the order in which discovered vulnerabilities are fixed. This process includes setting a minimum level of security acceptability for releasing code or applications. Severity ratings bring a systematic way of triaging vulnerabilities that improves risk management and helps ensure the most severe bugs are fixed first. Review and update the system and process annually.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-application'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-16.7',
  standardId: 'cis-ig3',
  section: '16',
  code: '16.7',
  name: 'Use Standard Hardening Configuration Templates for Application Infrastructure',
  description: 'Use standard, industry-recommended hardening configuration templates for application infrastructure components. This includes underlying servers, databases, and web servers, and applies to cloud containers, Platform as a Service (PaaS) components, and SaaS components. Do not allow in-house developed software to weaken configuration hardening.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Use standard, industry-recommended hardening configuration templates for application infrastructure components. This includes underlying servers, databases, and web servers, and applies to cloud containers, Platform as a Service (PaaS) components, and SaaS components. Do not allow in-house developed software to weaken configuration hardening.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-application'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-16.8',
  standardId: 'cis-ig3',
  section: '16',
  code: '16.8',
  name: 'Separate Production and Non-Production Systems',
  description: 'Maintain separate environments for production and non-production systems.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Maintain separate environments for production and non-production systems.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-application'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-16.9',
  standardId: 'cis-ig3',
  section: '16',
  code: '16.9',
  name: 'Train Developers in Application Security Concepts and Secure Coding',
  description: 'Ensure that all software development personnel receive training in writing secure code for their specific development environment and responsibilities. Training can include general security principles and application security standard practices. Conduct training at least annually and design in a way to promote security within the development team, and build a culture of security among the developers.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Ensure that all software development personnel receive training in writing secure code for their specific development environment and responsibilities. Training can include general security principles and application security standard practices. Conduct training at least annually and design in a way to promote security within the development team, and build a culture of security among the developers.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-application'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-16.10',
  standardId: 'cis-ig3',
  section: '16',
  code: '16.10',
  name: 'Apply Secure Design Principles in Application Architectures',
  description: 'Apply secure design principles in application architectures. Secure design principles include the concept of least privilege and enforcing mediation to validate every operation that the user makes, promoting the concept of "never trust user input." Examples include ensuring that explicit error checking is performed and documented for all input, including for size, data type, and acceptable ranges or formats. Secure design also means minimizing the application infrastructure attack surface, such as turning off unprotected ports and services, removing unnecessary programs and files, and renaming or removing default accounts.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Apply secure design principles in application architectures. Secure design principles include the concept of least privilege and enforcing mediation to validate every operation that the user makes, promoting the concept of "never trust user input." Examples include ensuring that explicit error checking is performed and documented for all input, including for size, data type, and acceptable ranges or formats. Secure design also means minimizing the application infrastructure attack surface, such as turning off unprotected ports and services, removing unnecessary programs and files, and renaming or removing default accounts.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-application'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-16.11',
  standardId: 'cis-ig3',
  section: '16',
  code: '16.11',
  name: 'Leverage Vetted Modules or Services for Application Security Components',
  description: 'Leverage vetted modules or services for application security components, such as identity management, encryption, auditing, and logging. Using platform features in critical security functions will reduce developers’ workload and minimize the likelihood of design or implementation errors. Modern operating systems provide effective mechanisms for identification, authentication, and authorization and make those mechanisms available to applications. Use only standardized, currently accepted, and extensively reviewed encryption algorithms. Operating systems also provide mechanisms to create and maintain secure audit logs.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Leverage vetted modules or services for application security components, such as identity management, encryption, auditing, and logging. Using platform features in critical security functions will reduce developers’ workload and minimize the likelihood of design or  errors. Modern operating systems provide effective mechanisms for identification, authentication, and authorization and make those mechanisms available to applications. Use only standardized, currently accepted, and extensively reviewed encryption algorithms. Operating systems also provide mechanisms to create and maintain secure audit logs.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* errors. Modern operating systems provide effective mechanisms for identification, authentication, and authorization and make those mechanisms available to applications. Use only standardized, currently accepted, and extensively reviewed encryption algorithms. Operating systems also provide mechanisms to create and maintain secure audit logs.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-application'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
// IG3-only krav nedan:
{
  id: 'cis-ig3-16.12',
  standardId: 'cis-ig3',
  section: '16',
  code: '16.12',
  name: 'Implement Code-Level Security Checks',
  description: 'Apply static and dynamic analysis tools within the application life cycle to verify that secure coding practices are being followed.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Apply static and dynamic analysis tools within the application life cycle to verify that secure coding practices are being followed.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-application'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-16.13',
  standardId: 'cis-ig3',
  section: '16',
  code: '16.13',
  name: 'Conduct Application Penetration Testing',
  description: 'Conduct application penetration testing. For critical applications, authenticated penetration testing is better suited to finding business logic vulnerabilities than code scanning and automated security testing. Penetration testing relies on the skill of the tester to manually manipulate an application as an authenticated and unauthenticated user.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Conduct application penetration testing. For critical applications, authenticated penetration testing is better suited to finding business logic vulnerabilities than code scanning and automated security testing. Penetration testing relies on the skill of the tester to manually manipulate an application as an authenticated and unauthenticated user.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-application'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-16.14',
  standardId: 'cis-ig3',
  section: '16',
  code: '16.14',
  name: 'Conduct Threat Modeling',
  description: 'Conduct threat modeling. Threat modeling is the process of identifying and addressing application security design flaws within a design, before code is created. It is conducted through specially trained individuals who evaluate the application design and gauge security risks for each entry point and access level. The goal is to map out the application, architecture, and infrastructure in a structured way to understand its weaknesses.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Conduct threat modeling. Threat modeling is the process of identifying and addressing application security design flaws within a design, before code is created. It is conducted through specially trained individuals who evaluate the application design and gauge security risks for each entry point and access level. The goal is to map out the application, architecture, and infrastructure in a structured way to understand its weaknesses.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-application'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-17.1',
  standardId: 'cis-ig3',
  section: '17',
  code: '17.1',
  name: 'Designate Personnel to Manage Incident Handling',
  description: 'Designate one key person, and at least one backup, who will manage the enterprise’s incident handling process. Management personnel are responsible for the coordination and documentation of incident response and recovery efforts and can consist of employees internal to the enterprise, service providers, or a hybrid approach. If using a service provider, designate at least one person internal to the enterprise to oversee any third-party work. Review annually, or when significant enterprise changes occur that could impact this Safeguard.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Designate one key person, and at least one backup, who will manage the enterprise’s incident handling process. Management personnel are responsible for the coordination and documentation of incident response and recovery efforts and can consist of employees internal to the enterprise, service providers, or a hybrid approach. If using a service provider, designate at least one person internal to the enterprise to oversee any third-party work. Review annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-incident'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-17.2',
  standardId: 'cis-ig3',
  section: '17',
  code: '17.2',
  name: 'Establish and Maintain Contact Information for Reporting Security Incidents',
  description: 'Establish and maintain contact information for parties that need to be informed of security incidents. Contacts may include internal staff, service providers, law enforcement, cyber insurance providers, relevant government agencies, Information Sharing and Analysis Center (ISAC) partners, or other stakeholders. Verify contacts annually to ensure that information is up-to-date.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain contact information for parties that need to be informed of security incidents. Contacts may include internal staff, service providers, law enforcement, cyber insurance providers, relevant government agencies, Information Sharing and Analysis Center (ISAC) partners, or other stakeholders. Verify contacts annually to ensure that information is up-to-date.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-incident'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-17.3',
  standardId: 'cis-ig3',
  section: '17',
  code: '17.3',
  name: 'Establish and Maintain an Enterprise Process for Reporting Incidents',
  description: 'Establish and maintain a documented enterprise process for the workforce to report security incidents. The process includes reporting timeframe, personnel to report to, mechanism for reporting, and the minimum information to be reported. Ensure the process is publicly available to all of the workforce. Review annually, or when significant enterprise changes occur that could impact this Safeguard.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a documented enterprise process for the workforce to report security incidents. The process includes reporting timeframe, personnel to report to, mechanism for reporting, and the minimum information to be reported. Ensure the process is publicly available to all of the workforce. Review annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-incident'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-17.4',
  standardId: 'cis-ig3',
  section: '17',
  code: '17.4',
  name: 'Establish and Maintain an Incident Response Process',
  description: 'Establish and maintain a documented incident response process that addresses roles and responsibilities, compliance requirements, and a communication plan. Review annually, or when significant enterprise changes occur that could impact this Safeguard.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a documented incident response process that addresses roles and responsibilities, compliance requirements, and a communication plan. Review annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-incident'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-17.5',
  standardId: 'cis-ig3',
  section: '17',
  code: '17.5',
  name: 'Assign Key Roles and Responsibilities',
  description: 'Assign key roles and responsibilities for incident response, including staff from legal, IT, information security, facilities, public relations, human resources, incident responders, analysts, and relevant third parties. Review annually, or when significant enterprise changes occur that could impact this Safeguard.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Assign key roles and responsibilities for incident response, including staff from legal, IT, information security, facilities, public relations, human resources, incident responders, analysts, and relevant third parties. Review annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-incident'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-17.6',
  standardId: 'cis-ig3',
  section: '17',
  code: '17.6',
  name: 'Define Mechanisms for Communicating During Incident Response',
  description: 'Determine which primary and secondary mechanisms will be used to communicate and report during a security incident. Mechanisms can include phone calls, emails, secure chat, or notification letters. Keep in mind that certain mechanisms, such as emails, can be affected during a security incident. Review annually, or when significant enterprise changes occur that could impact this Safeguard.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Determine which primary and secondary mechanisms will be used to communicate and report during a security incident. Mechanisms can include phone calls, emails, secure chat, or notification letters. Keep in mind that certain mechanisms, such as emails, can be affected during a security incident. Review annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-incident'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-17.7',
  standardId: 'cis-ig3',
  section: '17',
  code: '17.7',
  name: 'Conduct Routine Incident Response Exercises',
  description: 'Plan and conduct routine incident response exercises and scenarios for key personnel involved in the incident response process to prepare for responding to real-world incidents. Exercises need to test communication channels, decision making, and workflows. Conduct testing on an annual basis, at a minimum.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Plan and conduct routine incident response exercises and scenarios for key personnel involved in the incident response process to prepare for responding to real-world incidents. Exercises need to test communication channels, decision making, and workflows. Conduct testing on an annual basis, at a minimum.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-incident'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-17.8',
  standardId: 'cis-ig3',
  section: '17',
  code: '17.8',
  name: 'Conduct Post-Incident Reviews',
  description: 'Conduct post-incident reviews. Post-incident reviews help prevent incident recurrence through identifying lessons learned and follow-up action.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Conduct post-incident reviews. Post-incident reviews help prevent incident recurrence through identifying lessons learned and follow-up action.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-incident'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-17.9',
  standardId: 'cis-ig3',
  section: '17',
  code: '17.9',
  name: 'Establish and Maintain Security Incident Thresholds',
  description: 'Establish and maintain security incident thresholds, including, at a minimum, differentiating between an incident and an event. Examples can include: abnormal activity, security vulnerability, security weakness, data breach, privacy incident, etc. Review annually, or when significant enterprise changes occur that could impact this Safeguard.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain security incident thresholds, including, at a minimum, differentiating between an incident and an event. Examples can include: abnormal activity, security vulnerability, security weakness, data breach, privacy incident, etc. Review annually, or when significant enterprise changes occur that could impact this Safeguard.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-incident'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-18.1',
  standardId: 'cis-ig3',
  section: '18',
  code: '18.1',
  name: 'Establish and Maintain a Penetration Testing Program',
  description: 'Establish and maintain a penetration testing program appropriate to the size, complexity, industry, and maturity of the enterprise. Penetration testing program characteristics include scope, such as network, web application, Application Programming Interface (API), hosted services, and physical premise controls; frequency; limitations, such as acceptable hours, and excluded attack types; point of contact information; remediation, such as how findings will be routed internally; and retrospective requirements.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Establish and maintain a penetration testing program appropriate to the size, complexity, industry, and maturity of the enterprise. Penetration testing program characteristics include scope, such as network, web application, Application Programming Interface (API), hosted services, and physical premise controls; frequency; limitations, such as acceptable hours, and excluded attack types; point of contact information; remediation, such as how findings will be routed internally; and retrospective requirements.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-18.2',
  standardId: 'cis-ig3',
  section: '18',
  code: '18.2',
  name: 'Perform Periodic External Penetration Tests',
  description: 'Perform periodic external penetration tests based on program requirements, no less than annually. External penetration testing must include enterprise and environmental reconnaissance to detect exploitable information. Penetration testing requires specialized skills and experience and must be conducted through a qualified party. The testing may be clear box or opaque box.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Perform periodic external penetration tests based on program requirements, no less than annually. External penetration testing must include enterprise and environmental reconnaissance to detect exploitable information. Penetration testing requires specialized skills and experience and must be conducted through a qualified party. The testing may be clear box or opaque box.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-18.3',
  standardId: 'cis-ig3',
  section: '18',
  code: '18.3',
  name: 'Remediate Penetration Test Findings',
  description: 'Remediate penetration test findings based on the enterprise’s documented vulnerability remediation process. This should include determining a timeline and level of effort based on the impact and prioritization of each identified finding.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Remediate penetration test findings based on the enterprise’s documented vulnerability remediation process. This should include determining a timeline and level of effort based on the impact and prioritization of each identified finding.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-18.4',
  standardId: 'cis-ig3',
  section: '18',
  code: '18.4',
  name: 'Validate Security Measures',
  description: 'Validate security measures after each penetration test. If deemed necessary, modify rulesets and capabilities to detect the techniques used during testing.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Validate security measures after each penetration test. If deemed necessary, modify rulesets and capabilities to detect the techniques used during testing.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
{
  id: 'cis-ig3-18.5',
  standardId: 'cis-ig3',
  section: '18',
  code: '18.5',
  name: 'Perform Periodic Internal Penetration Tests',
  description: 'Perform periodic internal penetration tests based on program requirements, no less than annually. The testing may be clear box or opaque box.',
  guidance: '',
  status: 'not-fulfilled',
  evidence: '',
  notes: '',
  responsibleParty: '',
  lastAssessmentDate: null,    auditReadyGuidance: `**Purpose**

Perform periodic internal penetration tests based on program requirements, no less than annually. The testing may be clear box or opaque box.\n\n \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence

**Implementation**

* \n- Document formal policies and procedures related to this control\n- Implement appropriate technical controls\n- Train personnel on related security practices\n- Monitor and audit compliance with this control\n- Regularly review and update  as needed\n- Maintain documentation of compliance evidence`,

  tags: ['tag-technical'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
},
];

// Mock Assessments
export const assessments: Assessment[] = [
  {
    id: 'assessment-1',
    name: 'ISO 27001 Annual Assessment',
    standardIds: ['iso-27001'],
    description: 'Annual comprehensive review of ISO 27001 ISMS implementation and effectiveness.',
    status: 'in-progress',
    progress: 68,
    startDate: '2024-02-15T09:00:00Z',
    endDate: null,
    assessorName: 'Michael Thompson',
    assessorId: 'user-1',
    updatedAt: '2024-03-28T14:30:00Z',
    createdAt: '2024-02-15T09:00:00Z',
  },
  {
    id: 'assessment-2',
    name: 'ISO 27001 Q4 2023 Assessment',
    standardIds: ['iso-27001'],
    description: 'Quarterly assessment of ISO 27001 controls and implementation progress.',
    status: 'completed',
    progress: 100,
    startDate: '2023-10-01T09:00:00Z',
    endDate: '2023-10-15T16:45:00Z',
    assessorName: 'Michael Thompson',
    assessorId: 'user-1',
    updatedAt: '2023-10-15T16:45:00Z',
    createdAt: '2023-10-01T09:00:00Z',
  },
  {
    id: 'assessment-3',
    name: 'NIS2 Gap Analysis',
    standardIds: ['nis2'],
    description: 'Initial assessment of compliance with NIS2 directive requirements.',
    status: 'in-progress',
    progress: 35,
    startDate: '2024-02-10T11:00:00Z',
    endDate: null,
    assessorName: 'Emily Johnson',
    assessorId: 'user-2',
    updatedAt: '2024-03-25T09:30:00Z',
    createdAt: '2024-02-10T11:00:00Z',
  },
  {
    id: 'assessment-4',
    name: 'GDPR Annual Review',
    standardIds: ['gdpr'],
    description: 'Annual assessment of GDPR compliance focusing on data handling processes.',
    status: 'completed',
    progress: 100,
    startDate: '2023-11-05T13:00:00Z',
    endDate: '2024-01-20T15:45:00Z',
    assessorName: 'Emily Johnson',
    assessorId: 'user-2',
    updatedAt: '2024-01-20T15:45:00Z',
    createdAt: '2023-11-05T13:00:00Z',
  },
  {
    id: 'assessment-5',
    name: 'ISO 27001 Cloud Security',
    standardIds: ['iso-27001'],
    description: 'Focused assessment on cloud environment controls from ISO 27001.',
    status: 'draft',
    progress: 10,
    startDate: '2024-03-20T10:00:00Z',
    endDate: null,
    assessorName: 'Robert Chen',
    assessorId: 'user-3',
    updatedAt: '2024-03-20T10:00:00Z',
    createdAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'assessment-6',
    name: 'ISO 27002 Implementation Review',
    standardIds: ['iso-27002-2022'],
    description: 'Review of ISO 27002 controls implementation across the organization.',
    status: 'in-progress',
    progress: 45,
    startDate: '2024-03-25T09:00:00Z',
    endDate: null,
    assessorName: 'Robert Chen',
    assessorId: 'user-3',
    updatedAt: '2024-03-25T09:00:00Z',
    createdAt: '2024-03-25T09:00:00Z',
  },
  {
    id: 'assessment-7',
    name: 'NIS2 Technical Controls Assessment',
    standardIds: ['nis2'],
    description: 'In-depth review of technical security measures required by NIS2.',
    status: 'in-progress',
    progress: 52,
    startDate: '2024-03-10T08:30:00Z',
    endDate: null,
    assessorName: 'Sarah Martinez',
    assessorId: 'user-4',
    updatedAt: '2024-03-29T11:15:00Z',
    createdAt: '2024-03-10T08:30:00Z',
  },
  {
    id: 'assessment-8',
    name: 'GDPR Data Processing Impact Assessment',
    standardIds: ['gdpr'],
    description: 'DPIA for new customer relationship management system implementation.',
    status: 'completed',
    progress: 100,
    startDate: '2024-01-15T10:00:00Z',
    endDate: '2024-02-05T14:30:00Z',
    assessorName: 'Emily Johnson',
    assessorId: 'user-2',
    updatedAt: '2024-02-05T14:30:00Z',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'assessment-9',
    name: 'ISO 27001 Remote Work Security',
    standardIds: ['iso-27001'],
    description: 'Assessment of security controls for remote work environment.',
    status: 'draft',
    progress: 15,
    startDate: '2024-03-30T09:00:00Z',
    endDate: null,
    assessorName: 'Michael Thompson',
    assessorId: 'user-1',
    updatedAt: '2024-03-30T09:00:00Z',
    createdAt: '2024-03-30T09:00:00Z',
  },
  {
    id: 'assessment-10',
    name: 'Third-Party Vendor Security Assessment',
    standardIds: ['iso-27001'],
    description: 'Assessment of key third-party vendors against ISO 27001 requirements.',
    status: 'in-progress',
    progress: 75,
    startDate: '2024-02-20T13:15:00Z',
    endDate: null,
    assessorName: 'Robert Chen',
    assessorId: 'user-3',
    updatedAt: '2024-03-27T16:45:00Z',
    createdAt: '2024-02-20T13:15:00Z',
  },
  {
    id: 'assessment-11',
    name: 'NIS2 Incident Response Readiness',
    standardIds: ['nis2'],
    description: 'Assessment of incident detection, response and reporting capabilities.',
    status: 'in-progress',
    progress: 60,
    startDate: '2024-03-05T11:00:00Z',
    endDate: null,
    assessorName: 'Sarah Martinez',
    assessorId: 'user-4',
    updatedAt: '2024-03-28T09:30:00Z',
    createdAt: '2024-03-05T11:00:00Z',
  },
  {
    id: 'assessment-12',
    name: 'GDPR Processor Agreements Review',
    standardIds: ['gdpr'],
    description: 'Assessment of data processor agreements for GDPR compliance.',
    status: 'completed',
    progress: 100,
    startDate: '2023-12-10T10:00:00Z',
    endDate: '2024-01-05T16:00:00Z',
    assessorName: 'Emily Johnson',
    assessorId: 'user-2',
    updatedAt: '2024-01-05T16:00:00Z',
    createdAt: '2023-12-10T10:00:00Z',
  }
];

// Dashboard Stats
export const dashboardStats: ComplianceStats = {
  totalStandards: standards.length,
  totalRequirements: requirements.length,
  totalAssessments: assessments.length,
  complianceScore: 78,
  requirementStatusCounts: {
    fulfilled: 42,
    partiallyFulfilled: 35,
    notFulfilled: 12,
    notApplicable: 5
  }
};

// Mock Internal Users (representing Active Directory users)
export const internalUsers: InternalUser[] = [
  {
    id: 'user-1',
    name: 'Michael Thompson',
    email: 'michael.thompson@company.com',
    department: 'Security',
    title: 'Chief Information Security Officer'
  },
  {
    id: 'user-2',
    name: 'Emily Johnson',
    email: 'emily.johnson@company.com',
    department: 'Legal & Compliance',
    title: 'Data Protection Officer'
  },
  {
    id: 'user-3',
    name: 'Robert Chen',
    email: 'robert.chen@company.com',
    department: 'IT',
    title: 'Security Architect'
  },
  {
    id: 'user-4',
    name: 'Sarah Martinez',
    email: 'sarah.martinez@company.com',
    department: 'Operations',
    title: 'Risk Manager'
  },
  {
    id: 'user-5',
    name: 'David Williams',
    email: 'david.williams@company.com',
    department: 'Procurement',
    title: 'Vendor Management Lead'
  },
  {
    id: 'user-6',
    name: 'Jennifer Lee',
    email: 'jennifer.lee@company.com',
    department: 'IT',
    title: 'IT Director'
  }
];

// Mock Suppliers
export const suppliers: Supplier[] = [
  {
    id: 'supplier-1',
    name: 'CloudSecure Solutions',
    organizationNumber: 'ORG-12345678',
    address: '123 Tech Plaza, San Francisco, CA 94105',
    website: 'https://cloudsecuresolutions.example.com',
    category: 'Cloud Services',
    status: 'active',
    contact: {
      name: 'Alex Morgan',
      email: 'alex.morgan@cloudsecuresolutions.example.com',
      phone: '+1 (415) 555-1234',
      title: 'Account Manager'
    },
    internalResponsible: {
      id: 'user-3',
      name: 'Robert Chen',
      email: 'robert.chen@company.com',
      department: 'IT'
    },
    associatedStandards: [
      {
    standardId: 'iso-27001',
        requirementIds: ['iso-27001-6.1.1', 'iso-27001-6.1.2', 'iso-27001-8.1'],
        sentDate: '2024-02-15T09:00:00Z',
        status: 'in-progress'
      }
    ],
    createdAt: '2023-12-01T10:00:00Z',
    updatedAt: '2024-03-15T14:30:00Z'
  },
  {
    id: 'supplier-2',
    name: 'DataVault Storage',
    organizationNumber: 'ORG-87654321',
    address: '456 Data Drive, Boston, MA 02110',
    website: 'https://datavaultstorage.example.com',
    category: 'Data Storage',
    status: 'active',
    contact: {
      name: 'Samantha Wright',
      email: 'samantha.wright@datavaultstorage.example.com',
      phone: '+1 (617) 555-6789',
      title: 'Sales Director'
    },
    internalResponsible: {
      id: 'user-5',
      name: 'David Williams',
      email: 'david.williams@company.com',
      department: 'Procurement'
    },
    associatedStandards: [
      {
    standardId: 'gdpr',
        requirementIds: ['gdpr-A1', 'gdpr-A2', 'gdpr-A6', 'gdpr-B1'],
        sentDate: '2024-01-20T11:30:00Z',
        status: 'completed'
      }
    ],
    createdAt: '2023-11-15T09:45:00Z',
    updatedAt: '2024-02-20T16:15:00Z'
  },
  {
    id: 'supplier-3',
    name: 'NetworkDefend Technologies',
    organizationNumber: 'ORG-56781234',
    address: '789 Security Road, Austin, TX 78701',
    website: 'https://networkdefend.example.com',
    category: 'Network Security',
    status: 'active',
    contact: {
      name: 'James Rodriguez',
      email: 'james.rodriguez@networkdefend.example.com',
      phone: '+1 (512) 555-4321',
      title: 'Technical Account Manager'
    },
    internalResponsible: {
      id: 'user-1',
      name: 'Michael Thompson',
      email: 'michael.thompson@company.com',
      department: 'Security'
    },
    associatedStandards: [
      {
        standardId: 'nis2',
        requirementIds: ['nis2-A1', 'nis2-A2', 'nis2-B3', 'nis2-C1'],
        sentDate: '2024-03-05T13:45:00Z',
        status: 'in-progress'
      }
    ],
    createdAt: '2023-10-05T14:20:00Z',
    updatedAt: '2024-03-10T09:30:00Z'
  },
  {
    id: 'supplier-4',
    name: 'ComplianceTrack Software',
    organizationNumber: 'ORG-98765432',
    address: '321 Regulation Avenue, Chicago, IL 60603',
    website: 'https://compliancetrack.example.com',
    category: 'Compliance Software',
    status: 'pending-review',
    contact: {
      name: 'Lisa Chen',
      email: 'lisa.chen@compliancetrack.example.com',
      phone: '+1 (312) 555-8765',
      title: 'Partnership Manager'
    },
    internalResponsible: {
      id: 'user-2',
      name: 'Emily Johnson',
      email: 'emily.johnson@company.com',
      department: 'Legal & Compliance'
    },
    associatedStandards: [],
    createdAt: '2024-03-01T11:00:00Z',
    updatedAt: '2024-03-01T11:00:00Z'
  },
  {
    id: 'supplier-5',
    name: 'SecureHost Facilities',
    organizationNumber: 'ORG-43215678',
    address: '567 Data Center Blvd, Phoenix, AZ 85004',
    website: 'https://securehost.example.com',
    category: 'Physical Hosting',
    status: 'inactive',
    contact: {
      name: 'Mark Johnson',
      email: 'mark.johnson@securehost.example.com',
      phone: '+1 (602) 555-3456',
      title: 'Operations Director'
    },
    internalResponsible: {
      id: 'user-6',
      name: 'Jennifer Lee',
      email: 'jennifer.lee@company.com',
      department: 'IT'
    },
    associatedStandards: [
      {
        standardId: 'iso-27001',
        requirementIds: ['iso-27001-4.1', 'iso-27001-4.2', 'iso-27001-7.1'],
        sentDate: '2023-09-10T10:15:00Z',
        status: 'completed'
      }
    ],
    createdAt: '2023-08-20T13:45:00Z',
    updatedAt: '2023-12-15T16:30:00Z'
  }
];

// Mock Applications data
export const applications: Application[] = [
  {
    id: 'app-1',
    name: 'Enterprise Resource Planning (ERP)',
    description: 'Core business management system handling finance, HR, and supply chain operations',
    organizationNumber: 'ORG12345',
    type: 'Internal',
    category: 'Business Critical',
    status: 'active',
    criticality: 'critical',
    contact: {
      name: 'Michael Johnson',
      email: 'michael.johnson@company.com',
      phone: '+1 (555) 123-4567',
      title: 'Application Manager'
    },
    internalResponsible: {
      id: 'user-1',
      name: 'John Smith',
      email: 'john.smith@company.com',
      department: 'IT'
    },
    associatedRequirements: [
      'iso-27001-A8.1', 'iso-27001-A8.2', 'iso-27001-A8.3', 
      'iso-27001-A8.9', 'iso-27001-A8.10', 'iso-27001-A8.11'
    ],
    lastReviewDate: '2023-11-15T10:00:00Z',
    nextReviewDate: '2024-11-15T10:00:00Z',
    createdAt: '2021-06-10T08:30:00Z',
    updatedAt: '2023-11-15T10:00:00Z'
  },
  {
    id: 'app-2',
    name: 'Customer Relationship Management (CRM)',
    description: 'System for managing customer interactions, sales pipeline, and support tickets',
    organizationNumber: 'ORG12345',
    type: 'SaaS',
    category: 'Business Operations',
    status: 'active',
    criticality: 'high',
    contact: {
      name: 'Sarah Williams',
      email: 'sarah.williams@company.com',
      phone: '+1 (555) 234-5678',
      title: 'CRM Administrator'
    },
    internalResponsible: {
      id: 'user-2',
      name: 'Emily Johnson',
      email: 'emily.johnson@company.com',
      department: 'Sales'
    },
    associatedRequirements: [
      'iso-27001-A8.1', 'iso-27001-A8.2', 'iso-27001-A6.3', 
      'iso-27001-A5.14', 'iso-27001-A5.15'
    ],
    lastReviewDate: '2024-01-20T14:15:00Z',
    nextReviewDate: '2025-01-20T14:15:00Z',
    createdAt: '2022-03-15T11:45:00Z',
    updatedAt: '2024-01-20T14:15:00Z'
  },
  {
    id: 'app-3',
    name: 'Human Resources Information System (HRIS)',
    description: 'Employee management platform for HR processes and personnel data',
    organizationNumber: 'ORG12345',
    type: 'Hybrid',
    category: 'Internal Operations',
    status: 'active',
    criticality: 'high',
    contact: {
      name: 'David Clark',
      email: 'david.clark@company.com',
      phone: '+1 (555) 345-6789',
      title: 'HR Systems Manager'
    },
    internalResponsible: {
      id: 'user-3',
      name: 'Robert Chen',
      email: 'robert.chen@company.com',
      department: 'HR'
    },
    associatedRequirements: [
      'iso-27001-A8.1', 'iso-27001-A8.3', 'iso-27001-A5.14', 
      'iso-27001-A5.33', 'iso-27001-A5.34'
    ],
    lastReviewDate: '2023-09-05T09:30:00Z',
    nextReviewDate: '2024-09-05T09:30:00Z',
    createdAt: '2022-02-10T10:15:00Z',
    updatedAt: '2023-09-05T09:30:00Z'
  },
  {
    id: 'app-4',
    name: 'Document Management System',
    description: 'Central repository for company documents with version control and access management',
    organizationNumber: 'ORG12345',
    type: 'Internal',
    category: 'Information Management',
    status: 'active',
    criticality: 'medium',
    contact: {
      name: 'Lisa Martinez',
      email: 'lisa.martinez@company.com',
      phone: '+1 (555) 456-7890',
      title: 'Information Manager'
    },
    internalResponsible: {
      id: 'user-4',
      name: 'Amanda Wilson',
      email: 'amanda.wilson@company.com',
      department: 'Operations'
    },
    associatedRequirements: [
      'iso-27001-A5.10', 'iso-27001-A5.12', 'iso-27001-A8.3', 
      'iso-27001-A8.4'
    ],
    lastReviewDate: '2023-12-10T13:45:00Z',
    nextReviewDate: '2024-12-10T13:45:00Z',
    createdAt: '2022-05-20T14:30:00Z',
    updatedAt: '2023-12-10T13:45:00Z'
  },
  {
    id: 'app-5',
    name: 'Financial Management System',
    description: 'Application for managing accounting, budgeting, and financial reporting',
    organizationNumber: 'ORG12345',
    type: 'Internal',
    category: 'Business Critical',
    status: 'under-review',
    criticality: 'critical',
    contact: {
      name: 'Thomas Anderson',
      email: 'thomas.anderson@company.com',
      phone: '+1 (555) 567-8901',
      title: 'Financial Systems Lead'
    },
    internalResponsible: {
      id: 'user-5',
      name: 'Daniel Brown',
      email: 'daniel.brown@company.com',
      department: 'Finance'
    },
    associatedRequirements: [
      'iso-27001-A8.1', 'iso-27001-A8.2', 'iso-27001-A8.3', 
      'iso-27001-A8.10', 'iso-27001-A8.11', 'iso-27001-A5.14'
    ],
    lastReviewDate: '2023-08-15T11:20:00Z',
    nextReviewDate: '2024-08-15T11:20:00Z',
    createdAt: '2021-09-05T09:15:00Z',
    updatedAt: '2023-08-15T11:20:00Z'
  }
];

// Mock notifications
export const notifications = [
  {
    id: 'notif-1',
    title: 'Assessment due',
    description: 'Annual ISO 27001 Assessment needs to be completed',
    type: 'assessment',
    status: 'unread',
    priority: 'high',
    entityId: 'assessment-1',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), // 5 days from now
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString() // 2 days ago
  },
  {
    id: 'notif-2',
    title: 'Requirement needs review',
    description: 'Physical security controls for Server Room need review',
    type: 'requirement',
    status: 'unread',
    priority: 'medium',
    entityId: 'iso-27002-8.3',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), // 7 days from now
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString() // 1 day ago
  },
  {
    id: 'notif-3',
    title: 'Application security update',
    description: 'CRM application requires security review after latest update',
    type: 'application',
    status: 'unread',
    priority: 'medium',
    entityId: 'app-1',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(), // 10 days from now
    createdAt: new Date(new Date().setHours(new Date().getHours() - 12)).toISOString() // 12 hours ago
  },
  {
    id: 'notif-4',
    title: 'Device compliance check',
    description: 'Corporate laptops need encryption verification',
    type: 'device',
    status: 'read',
    priority: 'low',
    entityId: 'device-group-1',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(), // 14 days from now
    createdAt: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString() // 3 days ago
  },
  {
    id: 'notif-5',
    title: 'Organization policy update',
    description: 'Review updated information security policy',
    type: 'organization',
    status: 'read',
    priority: 'low',
    entityId: 'policy-1',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 21)).toISOString(), // 21 days from now
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString() // 5 days ago
  }
];

// Calculate the number of requirements for each status
const totalRequirements = requirements.length;
const fulfilledCount = Math.floor(totalRequirements * 0.45);
const partiallyFulfilledCount = Math.floor(totalRequirements * 0.37);
const notFulfilledCount = Math.floor(totalRequirements * 0.13);

// Update the statuses
requirements.forEach((requirement, index) => {
  if (index < fulfilledCount) {
    requirement.status = 'fulfilled';
  } else if (index < fulfilledCount + partiallyFulfilledCount) {
    requirement.status = 'partially-fulfilled';
  } else if (index < fulfilledCount + partiallyFulfilledCount + notFulfilledCount) {
    requirement.status = 'not-fulfilled';
  }
});
