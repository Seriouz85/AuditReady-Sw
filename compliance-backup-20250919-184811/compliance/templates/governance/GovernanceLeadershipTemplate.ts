/**
 * Governance & Leadership Template
 * Professional unified requirements template for governance and leadership controls
 */

import { UnifiedRequirementTemplate } from '../UnifiedRequirementsTemplateManager';

export const GovernanceLeadershipTemplate: UnifiedRequirementTemplate = {
  category: 'Governance & Leadership',
  title: 'Information Security Governance & Leadership Framework',
  description: 'Comprehensive governance structure ensuring leadership commitment, organizational accountability, and strategic security management aligned with business objectives.',
  
  subRequirements: [
    // LEADERSHIP SECTION (a-g)
    {
      letter: 'a',
      title: 'Leadership Commitment and Accountability',
      description: 'Establish executive leadership commitment to information security with documented accountability, regular management reviews, and personal responsibility for security outcomes.',
      injectionPoints: ['leadership', 'commitment', 'accountability', 'management', 'executive', 'responsibility'],
      requirements: [],
      references: []
    },
    {
      letter: 'b', 
      title: 'Scope and Boundaries Definition',
      description: 'Clearly define and document the scope of information security management including physical locations, logical boundaries, included/excluded systems, and business processes.',
      injectionPoints: ['scope', 'boundaries', 'coverage', 'perimeter', 'definition', 'limits'],
      requirements: [],
      references: []
    },
    {
      letter: 'c',
      title: 'Organizational Structure and Roles',
      description: 'Define comprehensive security organizational structure with clear roles, responsibilities, authorities, and reporting lines for all security-related positions.',
      injectionPoints: ['roles', 'responsibilities', 'structure', 'organization', 'authority', 'reporting'],
      requirements: [],
      references: []
    },
    {
      letter: 'd',
      title: 'Policy Framework with Deadlines',
      description: 'Establish comprehensive security policy framework with specific timelines for compliance, including incident response deadlines, account management timelines, and vulnerability remediation schedules.',
      injectionPoints: ['policy', 'policies', 'framework', 'deadlines', 'timelines', 'compliance'],
      requirements: [],
      references: []
    },
    {
      letter: 'e',
      title: 'Project Management and Security Integration',
      description: 'Integrate information security considerations into all project management processes from planning through deployment, ensuring security requirements are embedded throughout the project lifecycle.',
      injectionPoints: ['project', 'integration', 'development', 'planning', 'deployment', 'lifecycle'],
      requirements: [],
      references: []
    },
    {
      letter: 'f',
      title: 'Asset Use and Disposal Policies',
      description: 'Define acceptable use policies for information assets and establish secure disposal procedures ensuring proper data destruction and asset lifecycle management.',
      injectionPoints: ['asset', 'disposal', 'acceptable use', 'destruction', 'lifecycle', 'handling'],
      requirements: [],
      references: []
    },
    {
      letter: 'g',
      title: 'Documented Procedures and Evidence',
      description: 'Maintain comprehensive documented procedures for all security processes with version control, evidence retention, and audit trail requirements.',
      injectionPoints: ['documentation', 'procedures', 'evidence', 'records', 'version control', 'audit trail'],
      requirements: [],
      references: []
    },
    
    // HR SECTION (h-i)
    {
      letter: 'h',
      title: 'Personnel Security Framework',
      description: 'Implement comprehensive personnel security including employment terms, security screening, confidentiality agreements, and termination procedures.',
      injectionPoints: ['personnel', 'employment', 'screening', 'confidentiality', 'human resources', 'staff'],
      requirements: [],
      references: []
    },
    {
      letter: 'i',
      title: 'Competence Management',
      description: 'Establish competence requirements for security roles, provide appropriate training and development, evaluate effectiveness, and maintain documented evidence of competence.',
      injectionPoints: ['competence', 'training', 'skills', 'development', 'education', 'qualification'],
      requirements: [],
      references: []
    },
    
    // MONITORING & COMPLIANCE SECTION (j-p)
    {
      letter: 'j',
      title: 'Monitoring and Reporting',
      description: 'Conduct regular internal audits, management reviews, and continuous monitoring with documented findings, corrective actions, and management reporting.',
      injectionPoints: ['monitoring', 'reporting', 'audit', 'review', 'oversight', 'measurement'],
      requirements: [],
      references: []
    },
    {
      letter: 'k',
      title: 'Change Management and Control',
      description: 'Establish formal change management processes for system modifications with security impact assessments, testing, approval workflows, and detailed change logs.',
      injectionPoints: ['change management', 'control', 'modification', 'approval', 'testing', 'impact assessment'],
      requirements: [],
      references: []
    },
    {
      letter: 'l',
      title: 'Regulatory and Authority Relationships',
      description: 'Establish documented procedures for regulatory compliance, authority cooperation, breach notifications, and industry information sharing with current contact information.',
      injectionPoints: ['regulatory', 'authority', 'compliance', 'notification', 'cooperation', 'relationship'],
      requirements: [],
      references: []
    },
    {
      letter: 'm',
      title: 'Incident Response Governance',
      description: 'Designate incident response leadership with 24/7 availability, establish incident classification criteria, and define clear escalation procedures for significant incidents.',
      injectionPoints: ['incident', 'response', 'classification', 'escalation', 'emergency', 'breach'],
      requirements: [],
      references: []
    },
    {
      letter: 'n',
      title: 'Third Party Governance',
      description: 'Establish comprehensive third-party risk management including contractual security requirements, incident notification procedures, audit rights, and performance monitoring.',
      injectionPoints: ['third party', 'supplier', 'vendor', 'contract', 'outsourcing', 'service provider'],
      requirements: [],
      references: []
    },
    {
      letter: 'o',
      title: 'Continuous Improvement',
      description: 'Implement formal continuous improvement processes including lessons learned, policy updates, threat intelligence integration, and measurable security enhancement.',
      injectionPoints: ['improvement', 'enhancement', 'maturity', 'optimization', 'evolution', 'progression'],
      requirements: [],
      references: []
    },
    {
      letter: 'p',
      title: 'Security Awareness Governance',
      description: 'Establish governance oversight for security awareness programs including strategy definition, resource allocation, effectiveness measurement, and management commitment.',
      injectionPoints: ['awareness', 'training', 'education', 'culture', 'communication', 'engagement'],
      requirements: [],
      references: []
    }
  ]
};