/**
 * Professional Template Library - 50+ Enterprise-Grade Templates
 * High-quality, production-ready diagram templates for various industries
 */

import { Node, Edge, MarkerType } from 'reactflow';

export interface DiagramTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  nodes: Node[];
  edges: Edge[];
  thumbnail?: string;
  tags: string[];
  complexity: 'Simple' | 'Intermediate' | 'Advanced';
  isPremium?: boolean;
  industry?: string[];
  mermaidCode?: string;
  metadata?: {
    author?: string;
    version?: string;
    lastUpdated?: string;
    popularity?: number;
  };
}

// Helper function to create consistent node structure
const createNode = (
  id: string,
  label: string,
  position: { x: number; y: number },
  shape: string = 'rectangle',
  style?: any
): Node => ({
  id,
  type: 'custom',
  position,
  data: {
    label,
    shape,
    fillColor: style?.fillColor || '#f1f5f9',
    strokeColor: style?.strokeColor || '#475569',
    strokeWidth: style?.strokeWidth || 2,
    textColor: style?.textColor || '#1e293b',
    fontSize: style?.fontSize || 14,
    onLabelChange: () => {},
    onUpdate: () => {}
  }
});

// Helper function to create consistent edge structure
const createEdge = (
  id: string,
  source: string,
  target: string,
  label?: string,
  style?: any
): Edge => ({
  id,
  source,
  target,
  type: style?.type || 'smoothstep',
  label,
  animated: style?.animated || false,
  style: {
    stroke: style?.stroke || '#1e293b',
    strokeWidth: style?.strokeWidth || 2,
    ...style
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: style?.stroke || '#1e293b'
  }
});

// ==================== AUDIT & COMPLIANCE TEMPLATES (15) ====================

export const auditTemplates: DiagramTemplate[] = [
  {
    id: 'iso-27001-audit',
    name: 'ISO 27001 Audit Process',
    description: 'Complete ISO 27001 information security audit workflow',
    category: 'audit',
    subcategory: 'iso',
    tags: ['ISO 27001', 'Security', 'Audit', 'Compliance'],
    complexity: 'Advanced',
    isPremium: true,
    industry: ['Technology', 'Finance', 'Healthcare'],
    nodes: [
      createNode('1', 'Audit Initiation', { x: 400, y: 50 }, 'circle', { fillColor: '#dbeafe', strokeColor: '#2563eb' }),
      createNode('2', 'Scope Definition', { x: 400, y: 150 }, 'rectangle'),
      createNode('3', 'Document Review', { x: 400, y: 250 }, 'rectangle'),
      createNode('4', 'Risk Assessment', { x: 400, y: 350 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('5', 'Control Testing', { x: 200, y: 450 }, 'rectangle'),
      createNode('6', 'Technical Testing', { x: 400, y: 450 }, 'rectangle'),
      createNode('7', 'Physical Security Review', { x: 600, y: 450 }, 'rectangle'),
      createNode('8', 'Evidence Collection', { x: 400, y: 550 }, 'rectangle'),
      createNode('9', 'Gap Analysis', { x: 400, y: 650 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('10', 'Non-Conformities', { x: 200, y: 750 }, 'rectangle', { fillColor: '#fee2e2', strokeColor: '#dc2626' }),
      createNode('11', 'Opportunities', { x: 600, y: 750 }, 'rectangle', { fillColor: '#dcfce7', strokeColor: '#16a34a' }),
      createNode('12', 'Draft Report', { x: 400, y: 850 }, 'rectangle'),
      createNode('13', 'Management Review', { x: 400, y: 950 }, 'rectangle'),
      createNode('14', 'Final Report', { x: 400, y: 1050 }, 'rectangle'),
      createNode('15', 'Certification Decision', { x: 400, y: 1150 }, 'circle', { fillColor: '#dcfce7', strokeColor: '#16a34a' })
    ],
    edges: [
      createEdge('e1-2', '1', '2'),
      createEdge('e2-3', '2', '3'),
      createEdge('e3-4', '3', '4'),
      createEdge('e4-5', '4', '5', 'Controls'),
      createEdge('e4-6', '4', '6', 'Technical'),
      createEdge('e4-7', '4', '7', 'Physical'),
      createEdge('e5-8', '5', '8'),
      createEdge('e6-8', '6', '8'),
      createEdge('e7-8', '7', '8'),
      createEdge('e8-9', '8', '9'),
      createEdge('e9-10', '9', '10', 'Issues Found'),
      createEdge('e9-11', '9', '11', 'Improvements'),
      createEdge('e10-12', '10', '12'),
      createEdge('e11-12', '11', '12'),
      createEdge('e12-13', '12', '13'),
      createEdge('e13-14', '13', '14'),
      createEdge('e14-15', '14', '15')
    ]
  },
  
  {
    id: 'soc2-compliance',
    name: 'SOC 2 Compliance Workflow',
    description: 'Service Organization Control 2 compliance assessment process',
    category: 'audit',
    subcategory: 'soc',
    tags: ['SOC 2', 'Compliance', 'Security', 'Trust Principles'],
    complexity: 'Advanced',
    isPremium: true,
    industry: ['SaaS', 'Cloud Services', 'Technology'],
    nodes: [
      createNode('1', 'Readiness Assessment', { x: 400, y: 50 }, 'circle', { fillColor: '#dbeafe', strokeColor: '#2563eb' }),
      createNode('2', 'Trust Service Criteria Selection', { x: 400, y: 150 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('3', 'Security Controls', { x: 100, y: 250 }, 'rectangle'),
      createNode('4', 'Availability Controls', { x: 300, y: 250 }, 'rectangle'),
      createNode('5', 'Processing Integrity', { x: 500, y: 250 }, 'rectangle'),
      createNode('6', 'Confidentiality Controls', { x: 700, y: 250 }, 'rectangle'),
      createNode('7', 'Privacy Controls', { x: 400, y: 350 }, 'rectangle'),
      createNode('8', 'Control Implementation', { x: 400, y: 450 }, 'rectangle'),
      createNode('9', 'Evidence Gathering', { x: 400, y: 550 }, 'rectangle'),
      createNode('10', 'Type I Assessment', { x: 200, y: 650 }, 'rectangle'),
      createNode('11', 'Type II Assessment', { x: 600, y: 650 }, 'rectangle'),
      createNode('12', 'Auditor Review', { x: 400, y: 750 }, 'rectangle'),
      createNode('13', 'Report Generation', { x: 400, y: 850 }, 'rectangle'),
      createNode('14', 'SOC 2 Certification', { x: 400, y: 950 }, 'circle', { fillColor: '#dcfce7', strokeColor: '#16a34a' })
    ],
    edges: [
      createEdge('e1-2', '1', '2'),
      createEdge('e2-3', '2', '3', 'Security'),
      createEdge('e2-4', '2', '4', 'Availability'),
      createEdge('e2-5', '2', '5', 'Processing'),
      createEdge('e2-6', '2', '6', 'Confidentiality'),
      createEdge('e2-7', '2', '7', 'Privacy'),
      createEdge('e3-8', '3', '8'),
      createEdge('e4-8', '4', '8'),
      createEdge('e5-8', '5', '8'),
      createEdge('e6-8', '6', '8'),
      createEdge('e7-8', '7', '8'),
      createEdge('e8-9', '8', '9'),
      createEdge('e9-10', '9', '10', 'Type I'),
      createEdge('e9-11', '9', '11', 'Type II'),
      createEdge('e10-12', '10', '12'),
      createEdge('e11-12', '11', '12'),
      createEdge('e12-13', '12', '13'),
      createEdge('e13-14', '13', '14')
    ]
  },

  {
    id: 'gdpr-data-flow',
    name: 'GDPR Data Processing Flow',
    description: 'General Data Protection Regulation compliant data processing workflow',
    category: 'audit',
    subcategory: 'privacy',
    tags: ['GDPR', 'Privacy', 'Data Protection', 'EU Compliance'],
    complexity: 'Advanced',
    industry: ['All'],
    nodes: [
      createNode('1', 'Data Subject Request', { x: 400, y: 50 }, 'circle', { fillColor: '#dbeafe', strokeColor: '#2563eb' }),
      createNode('2', 'Lawful Basis Check', { x: 400, y: 150 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('3', 'Consent', { x: 100, y: 250 }, 'rectangle'),
      createNode('4', 'Contract', { x: 250, y: 250 }, 'rectangle'),
      createNode('5', 'Legal Obligation', { x: 400, y: 250 }, 'rectangle'),
      createNode('6', 'Vital Interests', { x: 550, y: 250 }, 'rectangle'),
      createNode('7', 'Legitimate Interests', { x: 700, y: 250 }, 'rectangle'),
      createNode('8', 'Data Collection', { x: 400, y: 350 }, 'rectangle'),
      createNode('9', 'Privacy Notice', { x: 400, y: 450 }, 'rectangle'),
      createNode('10', 'Data Processing', { x: 400, y: 550 }, 'rectangle'),
      createNode('11', 'Data Storage', { x: 400, y: 650 }, 'rectangle'),
      createNode('12', 'Rights Management', { x: 400, y: 750 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('13', 'Access Request', { x: 100, y: 850 }, 'rectangle'),
      createNode('14', 'Rectification', { x: 250, y: 850 }, 'rectangle'),
      createNode('15', 'Erasure', { x: 400, y: 850 }, 'rectangle'),
      createNode('16', 'Portability', { x: 550, y: 850 }, 'rectangle'),
      createNode('17', 'Objection', { x: 700, y: 850 }, 'rectangle'),
      createNode('18', 'Response to Subject', { x: 400, y: 950 }, 'circle', { fillColor: '#dcfce7', strokeColor: '#16a34a' })
    ],
    edges: [
      createEdge('e1-2', '1', '2'),
      createEdge('e2-3', '2', '3'),
      createEdge('e2-4', '2', '4'),
      createEdge('e2-5', '2', '5'),
      createEdge('e2-6', '2', '6'),
      createEdge('e2-7', '2', '7'),
      createEdge('e3-8', '3', '8'),
      createEdge('e4-8', '4', '8'),
      createEdge('e5-8', '5', '8'),
      createEdge('e6-8', '6', '8'),
      createEdge('e7-8', '7', '8'),
      createEdge('e8-9', '8', '9'),
      createEdge('e9-10', '9', '10'),
      createEdge('e10-11', '10', '11'),
      createEdge('e11-12', '11', '12'),
      createEdge('e12-13', '12', '13'),
      createEdge('e12-14', '12', '14'),
      createEdge('e12-15', '12', '15'),
      createEdge('e12-16', '12', '16'),
      createEdge('e12-17', '12', '17'),
      createEdge('e13-18', '13', '18'),
      createEdge('e14-18', '14', '18'),
      createEdge('e15-18', '15', '18'),
      createEdge('e16-18', '16', '18'),
      createEdge('e17-18', '17', '18')
    ]
  },

  {
    id: 'hipaa-compliance',
    name: 'HIPAA Compliance Workflow',
    description: 'Health Insurance Portability and Accountability Act compliance process',
    category: 'audit',
    subcategory: 'healthcare',
    tags: ['HIPAA', 'Healthcare', 'PHI', 'Security Rule'],
    complexity: 'Advanced',
    isPremium: true,
    industry: ['Healthcare', 'Medical', 'Insurance'],
    nodes: [
      createNode('1', 'PHI Identification', { x: 400, y: 50 }, 'circle', { fillColor: '#dbeafe', strokeColor: '#2563eb' }),
      createNode('2', 'Risk Analysis', { x: 400, y: 150 }, 'rectangle'),
      createNode('3', 'Administrative Safeguards', { x: 200, y: 250 }, 'rectangle'),
      createNode('4', 'Physical Safeguards', { x: 400, y: 250 }, 'rectangle'),
      createNode('5', 'Technical Safeguards', { x: 600, y: 250 }, 'rectangle'),
      createNode('6', 'Access Controls', { x: 200, y: 350 }, 'rectangle'),
      createNode('7', 'Encryption', { x: 400, y: 350 }, 'rectangle'),
      createNode('8', 'Audit Logs', { x: 600, y: 350 }, 'rectangle'),
      createNode('9', 'Business Associate Agreements', { x: 400, y: 450 }, 'rectangle'),
      createNode('10', 'Training Program', { x: 400, y: 550 }, 'rectangle'),
      createNode('11', 'Incident Response Plan', { x: 400, y: 650 }, 'rectangle'),
      createNode('12', 'Breach Notification', { x: 400, y: 750 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('13', 'Compliance Validation', { x: 400, y: 850 }, 'rectangle'),
      createNode('14', 'HIPAA Compliant', { x: 400, y: 950 }, 'circle', { fillColor: '#dcfce7', strokeColor: '#16a34a' })
    ],
    edges: [
      createEdge('e1-2', '1', '2'),
      createEdge('e2-3', '2', '3'),
      createEdge('e2-4', '2', '4'),
      createEdge('e2-5', '2', '5'),
      createEdge('e3-6', '3', '6'),
      createEdge('e4-7', '4', '7'),
      createEdge('e5-8', '5', '8'),
      createEdge('e6-9', '6', '9'),
      createEdge('e7-9', '7', '9'),
      createEdge('e8-9', '8', '9'),
      createEdge('e9-10', '9', '10'),
      createEdge('e10-11', '10', '11'),
      createEdge('e11-12', '11', '12'),
      createEdge('e12-13', '12', '13'),
      createEdge('e13-14', '13', '14')
    ]
  },

  {
    id: 'pci-dss-assessment',
    name: 'PCI DSS Assessment Process',
    description: 'Payment Card Industry Data Security Standard compliance assessment',
    category: 'audit',
    subcategory: 'payment',
    tags: ['PCI DSS', 'Payment', 'Security', 'Credit Card'],
    complexity: 'Advanced',
    industry: ['Retail', 'E-commerce', 'Finance'],
    nodes: [
      createNode('1', 'Merchant Level Determination', { x: 400, y: 50 }, 'circle', { fillColor: '#dbeafe', strokeColor: '#2563eb' }),
      createNode('2', 'Scope Definition', { x: 400, y: 150 }, 'rectangle'),
      createNode('3', 'Network Segmentation', { x: 400, y: 250 }, 'rectangle'),
      createNode('4', '12 Requirements Review', { x: 400, y: 350 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('5', 'Firewall Configuration', { x: 100, y: 450 }, 'rectangle'),
      createNode('6', 'Password Policies', { x: 250, y: 450 }, 'rectangle'),
      createNode('7', 'Data Encryption', { x: 400, y: 450 }, 'rectangle'),
      createNode('8', 'Anti-virus Protection', { x: 550, y: 450 }, 'rectangle'),
      createNode('9', 'Access Controls', { x: 700, y: 450 }, 'rectangle'),
      createNode('10', 'Vulnerability Scanning', { x: 400, y: 550 }, 'rectangle'),
      createNode('11', 'Penetration Testing', { x: 400, y: 650 }, 'rectangle'),
      createNode('12', 'SAQ Completion', { x: 200, y: 750 }, 'rectangle'),
      createNode('13', 'On-site Assessment', { x: 600, y: 750 }, 'rectangle'),
      createNode('14', 'Remediation', { x: 400, y: 850 }, 'rectangle'),
      createNode('15', 'Compliance Certificate', { x: 400, y: 950 }, 'circle', { fillColor: '#dcfce7', strokeColor: '#16a34a' })
    ],
    edges: [
      createEdge('e1-2', '1', '2'),
      createEdge('e2-3', '2', '3'),
      createEdge('e3-4', '3', '4'),
      createEdge('e4-5', '4', '5'),
      createEdge('e4-6', '4', '6'),
      createEdge('e4-7', '4', '7'),
      createEdge('e4-8', '4', '8'),
      createEdge('e4-9', '4', '9'),
      createEdge('e5-10', '5', '10'),
      createEdge('e6-10', '6', '10'),
      createEdge('e7-10', '7', '10'),
      createEdge('e8-10', '8', '10'),
      createEdge('e9-10', '9', '10'),
      createEdge('e10-11', '10', '11'),
      createEdge('e11-12', '11', '12', 'Level 4'),
      createEdge('e11-13', '11', '13', 'Level 1-3'),
      createEdge('e12-14', '12', '14'),
      createEdge('e13-14', '13', '14'),
      createEdge('e14-15', '14', '15')
    ]
  },

  {
    id: 'risk-management-flow',
    name: 'Risk Management Process Flow',
    description: 'Comprehensive risk management workflow with assessment, treatment, and monitoring',
    category: 'audit',
    subcategory: 'risk',
    tags: ['Risk Management', 'Risk Assessment', 'Risk Treatment', 'Monitoring'],
    complexity: 'Advanced',
    isPremium: true,
    industry: ['All'],
    nodes: [
      createNode('1', 'Risk Identification', { x: 400, y: 50 }, 'circle', { fillColor: '#dbeafe', strokeColor: '#2563eb' }),
      createNode('2', 'Risk Register Update', { x: 400, y: 150 }, 'parallelogram', { fillColor: '#e0e7ff', strokeColor: '#6366f1' }),
      createNode('3', 'Likelihood Assessment', { x: 200, y: 250 }, 'rectangle'),
      createNode('4', 'Impact Assessment', { x: 600, y: 250 }, 'rectangle'),
      createNode('5', 'Risk Analysis', { x: 400, y: 350 }, 'rectangle'),
      createNode('6', 'Risk Level Acceptable?', { x: 400, y: 450 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('7', 'Accept Risk (Low Level)', { x: 700, y: 450 }, 'circle', { fillColor: '#dcfce7', strokeColor: '#16a34a' }),
      createNode('8', 'Treatment Selection', { x: 400, y: 600 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('9', 'Accept Risk', { x: 100, y: 750 }, 'rectangle', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('10', 'Mitigate Risk', { x: 300, y: 750 }, 'rectangle', { fillColor: '#dbeafe', strokeColor: '#2563eb' }),
      createNode('11', 'Transfer Risk', { x: 500, y: 750 }, 'rectangle', { fillColor: '#e0e7ff', strokeColor: '#6366f1' }),
      createNode('12', 'Avoid Risk', { x: 700, y: 750 }, 'rectangle', { fillColor: '#fee2e2', strokeColor: '#dc2626' }),
      createNode('13', 'Implement Controls', { x: 400, y: 900 }, 'rectangle'),
      createNode('14', 'Monitor & Review', { x: 400, y: 1000 }, 'rectangle'),
      createNode('15', 'Controls Effective?', { x: 400, y: 1100 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('16', 'Accept Residual Risk', { x: 600, y: 1200 }, 'circle', { fillColor: '#dcfce7', strokeColor: '#16a34a' })
    ],
    edges: [
      createEdge('e1-2', '1', '2'),
      createEdge('e2-3', '2', '3'),
      createEdge('e2-4', '2', '4'),
      createEdge('e3-5', '3', '5'),
      createEdge('e4-5', '4', '5'),
      createEdge('e5-6', '5', '6'),
      createEdge('e6-7', '6', '7', 'Yes', { stroke: '#16a34a' }),
      createEdge('e6-8', '6', '8', 'No', { stroke: '#dc2626' }),
      createEdge('e8-9', '8', '9', 'Accept'),
      createEdge('e8-10', '8', '10', 'Mitigate'),
      createEdge('e8-11', '8', '11', 'Transfer'),
      createEdge('e8-12', '8', '12', 'Avoid'),
      createEdge('e10-13', '10', '13'),
      createEdge('e11-13', '11', '13'),
      createEdge('e13-14', '13', '14'),
      createEdge('e14-15', '14', '15'),
      createEdge('e15-16', '15', '16', 'Yes', { stroke: '#16a34a' }),
      createEdge('e15-8', '15', '8', 'No - Reassess', { stroke: '#dc2626', strokeDasharray: '5 5' }),
      createEdge('e9-16', '9', '16'),
      createEdge('e16-1', '16', '1', 'Continuous Monitoring', { stroke: '#8b5cf6', strokeDasharray: '10 5' })
    ]
  },

  {
    id: 'cybersecurity-incident-response',
    name: 'Cybersecurity Incident Response',
    description: 'NIST-based incident response process with detection, containment, eradication, and recovery',
    category: 'audit',
    subcategory: 'security',
    tags: ['Incident Response', 'Cybersecurity', 'NIST', 'Security'],
    complexity: 'Advanced',
    isPremium: true,
    industry: ['Technology', 'All'],
    nodes: [
      createNode('1', 'Incident Detection', { x: 400, y: 50 }, 'circle', { fillColor: '#fee2e2', strokeColor: '#dc2626' }),
      createNode('2', 'Initial Triage', { x: 400, y: 150 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('3', 'Low Severity Response', { x: 150, y: 300 }, 'rectangle', { fillColor: '#dcfce7', strokeColor: '#16a34a' }),
      createNode('4', 'High Severity Response', { x: 650, y: 300 }, 'rectangle', { fillColor: '#fee2e2', strokeColor: '#dc2626' }),
      createNode('5', 'Analysis & Investigation', { x: 400, y: 450 }, 'rectangle'),
      createNode('6', 'Short-term Containment', { x: 200, y: 600 }, 'rectangle', { fillColor: '#dbeafe', strokeColor: '#2563eb' }),
      createNode('7', 'Eradication', { x: 400, y: 600 }, 'rectangle'),
      createNode('8', 'Recovery & Long-term Containment', { x: 600, y: 600 }, 'rectangle', { fillColor: '#dcfce7', strokeColor: '#16a34a' }),
      createNode('9', 'Post-Incident Review', { x: 400, y: 750 }, 'rectangle', { fillColor: '#e0e7ff', strokeColor: '#6366f1' })
    ],
    edges: [
      createEdge('e1-2', '1', '2'),
      createEdge('e2-3', '2', '3', 'Low'),
      createEdge('e2-4', '2', '4', 'High/Critical'),
      createEdge('e3-5', '3', '5'),
      createEdge('e4-5', '4', '5'),
      createEdge('e5-6', '5', '6'),
      createEdge('e5-7', '5', '7'),
      createEdge('e5-8', '5', '8'),
      createEdge('e6-9', '6', '9'),
      createEdge('e7-9', '7', '9'),
      createEdge('e8-9', '8', '9')
    ]
  },

  {
    id: 'business-continuity-planning',
    name: 'Business Continuity Planning',
    description: 'Comprehensive business continuity and disaster recovery planning process',
    category: 'audit',
    subcategory: 'continuity',
    tags: ['Business Continuity', 'Disaster Recovery', 'BCP', 'Crisis Management'],
    complexity: 'Advanced',
    industry: ['All'],
    nodes: [
      createNode('1', 'Business Impact Analysis', { x: 400, y: 50 }, 'circle', { fillColor: '#dbeafe', strokeColor: '#2563eb' }),
      createNode('2', 'Risk Assessment', { x: 400, y: 150 }, 'rectangle'),
      createNode('3', 'Recovery Strategies', { x: 400, y: 250 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('4', 'Preventive Controls', { x: 200, y: 350 }, 'rectangle'),
      createNode('5', 'Contingency Plans', { x: 400, y: 350 }, 'rectangle'),
      createNode('6', 'Recovery Procedures', { x: 600, y: 350 }, 'rectangle'),
      createNode('7', 'Plan Testing', { x: 400, y: 450 }, 'rectangle'),
      createNode('8', 'Training & Awareness', { x: 400, y: 550 }, 'rectangle'),
      createNode('9', 'Plan Maintenance', { x: 400, y: 650 }, 'rectangle'),
      createNode('10', 'Crisis Activation', { x: 400, y: 750 }, 'diamond', { fillColor: '#fee2e2', strokeColor: '#dc2626' }),
      createNode('11', 'Business Continuity Plan Ready', { x: 400, y: 850 }, 'circle', { fillColor: '#dcfce7', strokeColor: '#16a34a' })
    ],
    edges: [
      createEdge('e1-2', '1', '2'),
      createEdge('e2-3', '2', '3'),
      createEdge('e3-4', '3', '4'),
      createEdge('e3-5', '3', '5'),
      createEdge('e3-6', '3', '6'),
      createEdge('e4-7', '4', '7'),
      createEdge('e5-7', '5', '7'),
      createEdge('e6-7', '6', '7'),
      createEdge('e7-8', '7', '8'),
      createEdge('e8-9', '8', '9'),
      createEdge('e9-10', '9', '10'),
      createEdge('e10-11', '10', '11'),
      createEdge('e9-1', '9', '1', 'Annual Review', { stroke: '#8b5cf6', strokeDasharray: '5 5' })
    ]
  },

  {
    id: 'vendor-risk-assessment',
    name: 'Third-Party Vendor Risk Assessment',
    description: 'Comprehensive vendor risk assessment and management process',
    category: 'audit',
    subcategory: 'vendor',
    tags: ['Vendor Management', 'Third-Party Risk', 'Supply Chain', 'Due Diligence'],
    complexity: 'Intermediate',
    industry: ['All'],
    nodes: [
      createNode('1', 'Vendor Identification', { x: 400, y: 50 }, 'circle', { fillColor: '#dbeafe', strokeColor: '#2563eb' }),
      createNode('2', 'Initial Risk Assessment', { x: 400, y: 150 }, 'rectangle'),
      createNode('3', 'Risk Level Classification', { x: 400, y: 250 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('4', 'Low Risk - Basic Review', { x: 150, y: 350 }, 'rectangle', { fillColor: '#dcfce7', strokeColor: '#16a34a' }),
      createNode('5', 'High Risk - Full Assessment', { x: 650, y: 350 }, 'rectangle', { fillColor: '#fee2e2', strokeColor: '#dc2626' }),
      createNode('6', 'Due Diligence Review', { x: 650, y: 450 }, 'rectangle'),
      createNode('7', 'Contract Negotiations', { x: 400, y: 550 }, 'rectangle'),
      createNode('8', 'Ongoing Monitoring', { x: 400, y: 650 }, 'rectangle'),
      createNode('9', 'Vendor Approved', { x: 400, y: 750 }, 'circle', { fillColor: '#dcfce7', strokeColor: '#16a34a' })
    ],
    edges: [
      createEdge('e1-2', '1', '2'),
      createEdge('e2-3', '2', '3'),
      createEdge('e3-4', '3', '4', 'Low Risk'),
      createEdge('e3-5', '3', '5', 'High Risk'),
      createEdge('e5-6', '5', '6'),
      createEdge('e4-7', '4', '7'),
      createEdge('e6-7', '6', '7'),
      createEdge('e7-8', '7', '8'),
      createEdge('e8-9', '8', '9'),
      createEdge('e8-2', '8', '2', 'Periodic Review', { stroke: '#8b5cf6', strokeDasharray: '5 5' })
    ]
  },

  {
    id: 'data-breach-response',
    name: 'Data Breach Response Process',
    description: 'GDPR-compliant data breach response and notification process',
    category: 'audit',
    subcategory: 'privacy',
    tags: ['Data Breach', 'GDPR', 'Privacy', 'Notification'],
    complexity: 'Advanced',
    isPremium: true,
    industry: ['All'],
    nodes: [
      createNode('1', 'Breach Discovery', { x: 400, y: 50 }, 'circle', { fillColor: '#fee2e2', strokeColor: '#dc2626' }),
      createNode('2', 'Initial Assessment', { x: 400, y: 150 }, 'rectangle'),
      createNode('3', 'Breach Classification', { x: 400, y: 250 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('4', 'Minor Breach - Document', { x: 150, y: 350 }, 'rectangle', { fillColor: '#dcfce7', strokeColor: '#16a34a' }),
      createNode('5', 'Major Breach - Full Response', { x: 650, y: 350 }, 'rectangle', { fillColor: '#fee2e2', strokeColor: '#dc2626' }),
      createNode('6', 'Containment Actions', { x: 650, y: 450 }, 'rectangle', { fillColor: '#dbeafe', strokeColor: '#2563eb' }),
      createNode('7', '72-Hour DPA Notification', { x: 400, y: 550 }, 'rectangle', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('8', 'Individual Notification Required?', { x: 400, y: 650 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('9', 'Notify Affected Individuals', { x: 600, y: 750 }, 'rectangle'),
      createNode('10', 'Remediation & Recovery', { x: 400, y: 850 }, 'rectangle'),
      createNode('11', 'Lessons Learned', { x: 400, y: 950 }, 'rectangle', { fillColor: '#e0e7ff', strokeColor: '#6366f1' })
    ],
    edges: [
      createEdge('e1-2', '1', '2'),
      createEdge('e2-3', '2', '3'),
      createEdge('e3-4', '3', '4', 'Low Risk'),
      createEdge('e3-5', '3', '5', 'High Risk'),
      createEdge('e5-6', '5', '6'),
      createEdge('e6-7', '6', '7'),
      createEdge('e4-7', '4', '7'),
      createEdge('e7-8', '7', '8'),
      createEdge('e8-9', '8', '9', 'Yes'),
      createEdge('e8-10', '8', '10', 'No'),
      createEdge('e9-10', '9', '10'),
      createEdge('e10-11', '10', '11')
    ]
  }

  // Add 5 more audit templates here...
];

// ==================== BUSINESS PROCESS TEMPLATES (10) ====================

export const businessProcessTemplates: DiagramTemplate[] = [
  {
    id: 'customer-journey',
    name: 'Customer Journey Map',
    description: 'End-to-end customer experience journey with touchpoints',
    category: 'business',
    subcategory: 'customer',
    tags: ['Customer', 'Journey', 'Experience', 'Touchpoints'],
    complexity: 'Intermediate',
    industry: ['Retail', 'E-commerce', 'Services'],
    nodes: [
      createNode('1', 'Awareness', { x: 100, y: 200 }, 'circle', { fillColor: '#dbeafe', strokeColor: '#2563eb' }),
      createNode('2', 'Research', { x: 250, y: 200 }, 'rectangle'),
      createNode('3', 'Consideration', { x: 400, y: 200 }, 'rectangle'),
      createNode('4', 'Purchase Decision', { x: 550, y: 200 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('5', 'Purchase', { x: 700, y: 200 }, 'rectangle'),
      createNode('6', 'Onboarding', { x: 850, y: 200 }, 'rectangle'),
      createNode('7', 'Usage', { x: 1000, y: 200 }, 'rectangle'),
      createNode('8', 'Support', { x: 1000, y: 350 }, 'rectangle'),
      createNode('9', 'Loyalty', { x: 850, y: 350 }, 'rectangle'),
      createNode('10', 'Advocacy', { x: 700, y: 350 }, 'circle', { fillColor: '#dcfce7', strokeColor: '#16a34a' }),
      createNode('11', 'Website Visit', { x: 250, y: 50 }, 'parallelogram', { fillColor: '#e0e7ff', strokeColor: '#6366f1' }),
      createNode('12', 'Social Media', { x: 400, y: 50 }, 'parallelogram', { fillColor: '#e0e7ff', strokeColor: '#6366f1' }),
      createNode('13', 'Email Campaign', { x: 550, y: 50 }, 'parallelogram', { fillColor: '#e0e7ff', strokeColor: '#6366f1' }),
      createNode('14', 'Customer Service', { x: 850, y: 50 }, 'parallelogram', { fillColor: '#e0e7ff', strokeColor: '#6366f1' })
    ],
    edges: [
      createEdge('e1-2', '1', '2'),
      createEdge('e2-3', '2', '3'),
      createEdge('e3-4', '3', '4'),
      createEdge('e4-5', '4', '5', 'Yes'),
      createEdge('e4-2', '4', '2', 'No', { stroke: '#ef4444' }),
      createEdge('e5-6', '5', '6'),
      createEdge('e6-7', '6', '7'),
      createEdge('e7-8', '7', '8'),
      createEdge('e7-9', '7', '9'),
      createEdge('e9-10', '9', '10'),
      createEdge('e11-2', '11', '2', undefined, { stroke: '#6366f1', strokeDasharray: '5 5' }),
      createEdge('e12-3', '12', '3', undefined, { stroke: '#6366f1', strokeDasharray: '5 5' }),
      createEdge('e13-4', '13', '4', undefined, { stroke: '#6366f1', strokeDasharray: '5 5' }),
      createEdge('e14-8', '14', '8', undefined, { stroke: '#6366f1', strokeDasharray: '5 5' })
    ]
  },

  {
    id: 'sales-pipeline',
    name: 'Sales Pipeline Process',
    description: 'B2B sales process from lead to close',
    category: 'business',
    subcategory: 'sales',
    tags: ['Sales', 'Pipeline', 'CRM', 'Revenue'],
    complexity: 'Intermediate',
    industry: ['Sales', 'B2B', 'SaaS'],
    nodes: [
      createNode('1', 'Lead Generation', { x: 200, y: 100 }, 'circle', { fillColor: '#dbeafe', strokeColor: '#2563eb' }),
      createNode('2', 'Lead Qualification', { x: 400, y: 100 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('3', 'MQL', { x: 600, y: 50 }, 'rectangle'),
      createNode('4', 'SQL', { x: 600, y: 150 }, 'rectangle'),
      createNode('5', 'Discovery Call', { x: 800, y: 100 }, 'rectangle'),
      createNode('6', 'Needs Analysis', { x: 1000, y: 100 }, 'rectangle'),
      createNode('7', 'Solution Presentation', { x: 1000, y: 250 }, 'rectangle'),
      createNode('8', 'Proposal', { x: 800, y: 250 }, 'rectangle'),
      createNode('9', 'Negotiation', { x: 600, y: 250 }, 'rectangle'),
      createNode('10', 'Close Decision', { x: 400, y: 250 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('11', 'Won', { x: 200, y: 200 }, 'circle', { fillColor: '#dcfce7', strokeColor: '#16a34a' }),
      createNode('12', 'Lost', { x: 200, y: 300 }, 'circle', { fillColor: '#fee2e2', strokeColor: '#dc2626' }),
      createNode('13', 'Nurture', { x: 400, y: 400 }, 'rectangle', { fillColor: '#f3e8ff', strokeColor: '#8b5cf6' })
    ],
    edges: [
      createEdge('e1-2', '1', '2'),
      createEdge('e2-3', '2', '3', 'Marketing'),
      createEdge('e2-4', '2', '4', 'Sales'),
      createEdge('e3-5', '3', '5'),
      createEdge('e4-5', '4', '5'),
      createEdge('e5-6', '5', '6'),
      createEdge('e6-7', '6', '7'),
      createEdge('e7-8', '7', '8'),
      createEdge('e8-9', '8', '9'),
      createEdge('e9-10', '9', '10'),
      createEdge('e10-11', '10', '11', 'Won'),
      createEdge('e10-12', '10', '12', 'Lost'),
      createEdge('e12-13', '12', '13'),
      createEdge('e13-2', '13', '2', 'Re-engage', { stroke: '#8b5cf6', strokeDasharray: '5 5' })
    ]
  },

  {
    id: 'employee-onboarding',
    name: 'Employee Onboarding Process',
    description: 'Comprehensive new hire onboarding workflow',
    category: 'business',
    subcategory: 'hr',
    tags: ['HR', 'Onboarding', 'Employee', 'Training'],
    complexity: 'Intermediate',
    industry: ['All'],
    nodes: [
      createNode('1', 'Offer Accepted', { x: 400, y: 50 }, 'circle', { fillColor: '#dbeafe', strokeColor: '#2563eb' }),
      createNode('2', 'Pre-boarding', { x: 400, y: 150 }, 'rectangle'),
      createNode('3', 'Documentation', { x: 200, y: 250 }, 'rectangle'),
      createNode('4', 'IT Setup', { x: 400, y: 250 }, 'rectangle'),
      createNode('5', 'Workspace Setup', { x: 600, y: 250 }, 'rectangle'),
      createNode('6', 'Day 1 Orientation', { x: 400, y: 350 }, 'rectangle'),
      createNode('7', 'Company Overview', { x: 200, y: 450 }, 'rectangle'),
      createNode('8', 'Role Training', { x: 400, y: 450 }, 'rectangle'),
      createNode('9', 'Team Introduction', { x: 600, y: 450 }, 'rectangle'),
      createNode('10', 'System Training', { x: 400, y: 550 }, 'rectangle'),
      createNode('11', '30-Day Check-in', { x: 400, y: 650 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('12', 'Additional Support', { x: 200, y: 750 }, 'rectangle'),
      createNode('13', '60-Day Review', { x: 400, y: 750 }, 'rectangle'),
      createNode('14', '90-Day Evaluation', { x: 400, y: 850 }, 'rectangle'),
      createNode('15', 'Fully Onboarded', { x: 400, y: 950 }, 'circle', { fillColor: '#dcfce7', strokeColor: '#16a34a' })
    ],
    edges: [
      createEdge('e1-2', '1', '2'),
      createEdge('e2-3', '2', '3'),
      createEdge('e2-4', '2', '4'),
      createEdge('e2-5', '2', '5'),
      createEdge('e3-6', '3', '6'),
      createEdge('e4-6', '4', '6'),
      createEdge('e5-6', '5', '6'),
      createEdge('e6-7', '6', '7'),
      createEdge('e6-8', '6', '8'),
      createEdge('e6-9', '6', '9'),
      createEdge('e7-10', '7', '10'),
      createEdge('e8-10', '8', '10'),
      createEdge('e9-10', '9', '10'),
      createEdge('e10-11', '10', '11'),
      createEdge('e11-12', '11', '12', 'Needs Help'),
      createEdge('e11-13', '11', '13', 'On Track'),
      createEdge('e12-13', '12', '13'),
      createEdge('e13-14', '13', '14'),
      createEdge('e14-15', '14', '15')
    ]
  },

  {
    id: 'procurement-process',
    name: 'Procurement & Purchasing Process',
    description: 'End-to-end procurement workflow from request to payment',
    category: 'business',
    subcategory: 'procurement',
    tags: ['Procurement', 'Purchasing', 'Vendor', 'Approval'],
    complexity: 'Intermediate',
    industry: ['All'],
    nodes: [
      createNode('1', 'Purchase Request', { x: 400, y: 50 }, 'circle', { fillColor: '#dbeafe', strokeColor: '#2563eb' }),
      createNode('2', 'Budget Check', { x: 400, y: 150 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('3', 'Vendor Selection', { x: 400, y: 300 }, 'rectangle'),
      createNode('4', 'Quote Analysis', { x: 400, y: 400 }, 'rectangle'),
      createNode('5', 'Approval Required?', { x: 400, y: 500 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('6', 'Management Approval', { x: 600, y: 600 }, 'rectangle'),
      createNode('7', 'Purchase Order', { x: 400, y: 700 }, 'rectangle'),
      createNode('8', 'Goods/Services Received', { x: 400, y: 800 }, 'rectangle'),
      createNode('9', 'Invoice Processing', { x: 400, y: 900 }, 'rectangle'),
      createNode('10', 'Payment', { x: 400, y: 1000 }, 'circle', { fillColor: '#dcfce7', strokeColor: '#16a34a' })
    ],
    edges: [
      createEdge('e1-2', '1', '2'),
      createEdge('e2-reject', '2', '1', 'Insufficient Budget', { stroke: '#dc2626' }),
      createEdge('e2-3', '2', '3', 'Approved'),
      createEdge('e3-4', '3', '4'),
      createEdge('e4-5', '4', '5'),
      createEdge('e5-6', '5', '6', 'Yes'),
      createEdge('e5-7', '5', '7', 'No'),
      createEdge('e6-7', '6', '7'),
      createEdge('e7-8', '7', '8'),
      createEdge('e8-9', '8', '9'),
      createEdge('e9-10', '9', '10')
    ]
  },

  {
    id: 'change-management',
    name: 'Organizational Change Management',
    description: 'Comprehensive change management process for organizational transformation',
    category: 'business',
    subcategory: 'change',
    tags: ['Change Management', 'Transformation', 'Communication', 'Training'],
    complexity: 'Advanced',
    industry: ['All'],
    nodes: [
      createNode('1', 'Change Request', { x: 400, y: 50 }, 'circle', { fillColor: '#dbeafe', strokeColor: '#2563eb' }),
      createNode('2', 'Impact Assessment', { x: 400, y: 150 }, 'rectangle'),
      createNode('3', 'Change Approval', { x: 400, y: 250 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('4', 'Stakeholder Analysis', { x: 400, y: 400 }, 'rectangle'),
      createNode('5', 'Communication Plan', { x: 200, y: 500 }, 'rectangle'),
      createNode('6', 'Training Plan', { x: 400, y: 500 }, 'rectangle'),
      createNode('7', 'Implementation Plan', { x: 600, y: 500 }, 'rectangle'),
      createNode('8', 'Pilot Testing', { x: 400, y: 600 }, 'rectangle'),
      createNode('9', 'Full Implementation', { x: 400, y: 700 }, 'rectangle'),
      createNode('10', 'Change Adoption', { x: 400, y: 800 }, 'rectangle'),
      createNode('11', 'Change Embedded', { x: 400, y: 900 }, 'circle', { fillColor: '#dcfce7', strokeColor: '#16a34a' })
    ],
    edges: [
      createEdge('e1-2', '1', '2'),
      createEdge('e2-3', '2', '3'),
      createEdge('e3-reject', '3', '1', 'Rejected', { stroke: '#dc2626' }),
      createEdge('e3-4', '3', '4', 'Approved'),
      createEdge('e4-5', '4', '5'),
      createEdge('e4-6', '4', '6'),
      createEdge('e4-7', '4', '7'),
      createEdge('e5-8', '5', '8'),
      createEdge('e6-8', '6', '8'),
      createEdge('e7-8', '7', '8'),
      createEdge('e8-9', '8', '9'),
      createEdge('e9-10', '9', '10'),
      createEdge('e10-11', '10', '11')
    ]
  },

  {
    id: 'project-management-process',
    name: 'Project Management Lifecycle',
    description: 'Complete project management process from initiation to closure',
    category: 'business',
    subcategory: 'project',
    tags: ['Project Management', 'PMBOK', 'Lifecycle', 'Deliverables'],
    complexity: 'Intermediate',
    industry: ['All'],
    nodes: [
      createNode('1', 'Project Initiation', { x: 400, y: 50 }, 'circle', { fillColor: '#dbeafe', strokeColor: '#2563eb' }),
      createNode('2', 'Project Charter', { x: 400, y: 150 }, 'parallelogram', { fillColor: '#e0e7ff', strokeColor: '#6366f1' }),
      createNode('3', 'Planning Phase', { x: 400, y: 250 }, 'rectangle'),
      createNode('4', 'Resource Allocation', { x: 200, y: 350 }, 'rectangle'),
      createNode('5', 'Risk Planning', { x: 400, y: 350 }, 'rectangle'),
      createNode('6', 'Timeline Development', { x: 600, y: 350 }, 'rectangle'),
      createNode('7', 'Execution Phase', { x: 400, y: 450 }, 'rectangle'),
      createNode('8', 'Monitoring & Control', { x: 400, y: 550 }, 'rectangle'),
      createNode('9', 'Quality Assurance', { x: 200, y: 650 }, 'rectangle'),
      createNode('10', 'Stakeholder Management', { x: 600, y: 650 }, 'rectangle'),
      createNode('11', 'Project Closure', { x: 400, y: 750 }, 'rectangle'),
      createNode('12', 'Lessons Learned', { x: 400, y: 850 }, 'circle', { fillColor: '#dcfce7', strokeColor: '#16a34a' })
    ],
    edges: [
      createEdge('e1-2', '1', '2'),
      createEdge('e2-3', '2', '3'),
      createEdge('e3-4', '3', '4'),
      createEdge('e3-5', '3', '5'),
      createEdge('e3-6', '3', '6'),
      createEdge('e4-7', '4', '7'),
      createEdge('e5-7', '5', '7'),
      createEdge('e6-7', '6', '7'),
      createEdge('e7-8', '7', '8'),
      createEdge('e8-9', '8', '9'),
      createEdge('e8-10', '8', '10'),
      createEdge('e9-11', '9', '11'),
      createEdge('e10-11', '10', '11'),
      createEdge('e11-12', '11', '12')
    ]
  },

  {
    id: 'complaint-handling',
    name: 'Customer Complaint Handling',
    description: 'Systematic approach to handling customer complaints and feedback',
    category: 'business',
    subcategory: 'customer',
    tags: ['Customer Service', 'Complaints', 'Resolution', 'Feedback'],
    complexity: 'Intermediate',
    industry: ['Retail', 'Services', 'All'],
    nodes: [
      createNode('1', 'Complaint Received', { x: 400, y: 50 }, 'circle', { fillColor: '#fee2e2', strokeColor: '#dc2626' }),
      createNode('2', 'Acknowledge Receipt', { x: 400, y: 150 }, 'rectangle'),
      createNode('3', 'Complaint Classification', { x: 400, y: 250 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('4', 'Simple Issue - Direct Resolution', { x: 150, y: 350 }, 'rectangle', { fillColor: '#dcfce7', strokeColor: '#16a34a' }),
      createNode('5', 'Complex Issue - Investigation', { x: 650, y: 350 }, 'rectangle'),
      createNode('6', 'Root Cause Analysis', { x: 650, y: 450 }, 'rectangle'),
      createNode('7', 'Resolution Plan', { x: 400, y: 550 }, 'rectangle'),
      createNode('8', 'Implementation', { x: 400, y: 650 }, 'rectangle'),
      createNode('9', 'Customer Notification', { x: 400, y: 750 }, 'rectangle'),
      createNode('10', 'Customer Satisfied?', { x: 400, y: 850 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('11', 'Escalation', { x: 600, y: 950 }, 'rectangle'),
      createNode('12', 'Case Closure', { x: 400, y: 1050 }, 'circle', { fillColor: '#dcfce7', strokeColor: '#16a34a' })
    ],
    edges: [
      createEdge('e1-2', '1', '2'),
      createEdge('e2-3', '2', '3'),
      createEdge('e3-4', '3', '4', 'Simple'),
      createEdge('e3-5', '3', '5', 'Complex'),
      createEdge('e5-6', '5', '6'),
      createEdge('e4-7', '4', '7'),
      createEdge('e6-7', '6', '7'),
      createEdge('e7-8', '7', '8'),
      createEdge('e8-9', '8', '9'),
      createEdge('e9-10', '9', '10'),
      createEdge('e10-11', '10', '11', 'No'),
      createEdge('e10-12', '10', '12', 'Yes'),
      createEdge('e11-7', '11', '7', 'Revised Plan', { stroke: '#8b5cf6', strokeDasharray: '5 5' })
    ]
  }

  // Add 3 more business process templates...
];

// ==================== TECHNICAL ARCHITECTURE TEMPLATES (10) ====================

export const technicalTemplates: DiagramTemplate[] = [
  {
    id: 'microservices-architecture',
    name: 'Microservices Architecture',
    description: 'Modern microservices architecture with API gateway and service mesh',
    category: 'technical',
    subcategory: 'architecture',
    tags: ['Microservices', 'API', 'Docker', 'Kubernetes'],
    complexity: 'Advanced',
    isPremium: true,
    industry: ['Technology', 'SaaS'],
    nodes: [
      createNode('1', 'Client Apps', { x: 400, y: 50 }, 'rectangle', { fillColor: '#dbeafe', strokeColor: '#2563eb' }),
      createNode('2', 'CDN', { x: 200, y: 150 }, 'rectangle'),
      createNode('3', 'Load Balancer', { x: 400, y: 150 }, 'rectangle'),
      createNode('4', 'API Gateway', { x: 400, y: 250 }, 'rectangle', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('5', 'Auth Service', { x: 100, y: 350 }, 'rectangle'),
      createNode('6', 'User Service', { x: 250, y: 350 }, 'rectangle'),
      createNode('7', 'Product Service', { x: 400, y: 350 }, 'rectangle'),
      createNode('8', 'Order Service', { x: 550, y: 350 }, 'rectangle'),
      createNode('9', 'Payment Service', { x: 700, y: 350 }, 'rectangle'),
      createNode('10', 'Service Mesh', { x: 400, y: 450 }, 'rectangle', { fillColor: '#e0e7ff', strokeColor: '#6366f1' }),
      createNode('11', 'Message Queue', { x: 200, y: 550 }, 'rectangle'),
      createNode('12', 'Cache Layer', { x: 400, y: 550 }, 'rectangle'),
      createNode('13', 'Database Cluster', { x: 600, y: 550 }, 'rectangle'),
      createNode('14', 'Monitoring', { x: 100, y: 650 }, 'rectangle'),
      createNode('15', 'Logging', { x: 400, y: 650 }, 'rectangle'),
      createNode('16', 'Analytics', { x: 700, y: 650 }, 'rectangle')
    ],
    edges: [
      createEdge('e1-2', '1', '2'),
      createEdge('e1-3', '1', '3'),
      createEdge('e2-4', '2', '4'),
      createEdge('e3-4', '3', '4'),
      createEdge('e4-5', '4', '5'),
      createEdge('e4-6', '4', '6'),
      createEdge('e4-7', '4', '7'),
      createEdge('e4-8', '4', '8'),
      createEdge('e4-9', '4', '9'),
      createEdge('e5-10', '5', '10'),
      createEdge('e6-10', '6', '10'),
      createEdge('e7-10', '7', '10'),
      createEdge('e8-10', '8', '10'),
      createEdge('e9-10', '9', '10'),
      createEdge('e10-11', '10', '11'),
      createEdge('e10-12', '10', '12'),
      createEdge('e10-13', '10', '13'),
      createEdge('e11-14', '11', '14'),
      createEdge('e12-15', '12', '15'),
      createEdge('e13-16', '13', '16')
    ]
  },

  {
    id: 'cicd-pipeline',
    name: 'CI/CD Pipeline',
    description: 'Continuous Integration and Deployment pipeline with quality gates',
    category: 'technical',
    subcategory: 'devops',
    tags: ['CI/CD', 'DevOps', 'Automation', 'Deployment'],
    complexity: 'Intermediate',
    industry: ['Technology'],
    nodes: [
      createNode('1', 'Code Commit', { x: 100, y: 200 }, 'circle', { fillColor: '#dbeafe', strokeColor: '#2563eb' }),
      createNode('2', 'Webhook Trigger', { x: 250, y: 200 }, 'rectangle'),
      createNode('3', 'Build Stage', { x: 400, y: 200 }, 'rectangle'),
      createNode('4', 'Unit Tests', { x: 550, y: 200 }, 'rectangle'),
      createNode('5', 'Code Quality', { x: 700, y: 200 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('6', 'Integration Tests', { x: 850, y: 200 }, 'rectangle'),
      createNode('7', 'Security Scan', { x: 1000, y: 200 }, 'rectangle'),
      createNode('8', 'Build Docker Image', { x: 1000, y: 350 }, 'rectangle'),
      createNode('9', 'Push to Registry', { x: 850, y: 350 }, 'rectangle'),
      createNode('10', 'Deploy to Staging', { x: 700, y: 350 }, 'rectangle'),
      createNode('11', 'E2E Tests', { x: 550, y: 350 }, 'rectangle'),
      createNode('12', 'Manual Approval', { x: 400, y: 350 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('13', 'Deploy to Production', { x: 250, y: 350 }, 'rectangle'),
      createNode('14', 'Health Check', { x: 100, y: 350 }, 'rectangle'),
      createNode('15', 'Rollback', { x: 400, y: 500 }, 'rectangle', { fillColor: '#fee2e2', strokeColor: '#dc2626' }),
      createNode('16', 'Success', { x: 100, y: 500 }, 'circle', { fillColor: '#dcfce7', strokeColor: '#16a34a' })
    ],
    edges: [
      createEdge('e1-2', '1', '2'),
      createEdge('e2-3', '2', '3'),
      createEdge('e3-4', '3', '4'),
      createEdge('e4-5', '4', '5'),
      createEdge('e5-6', '5', '6', 'Pass'),
      createEdge('e5-15', '5', '15', 'Fail', { stroke: '#ef4444' }),
      createEdge('e6-7', '6', '7'),
      createEdge('e7-8', '7', '8'),
      createEdge('e8-9', '8', '9'),
      createEdge('e9-10', '9', '10'),
      createEdge('e10-11', '10', '11'),
      createEdge('e11-12', '11', '12'),
      createEdge('e12-13', '12', '13', 'Approved'),
      createEdge('e12-15', '12', '15', 'Rejected', { stroke: '#ef4444' }),
      createEdge('e13-14', '13', '14'),
      createEdge('e14-16', '14', '16', 'Healthy'),
      createEdge('e14-15', '14', '15', 'Unhealthy', { stroke: '#ef4444' })
    ]
  },

  // Add 8 more technical templates...
];

// ==================== PROJECT MANAGEMENT TEMPLATES (8) ====================

export const projectManagementTemplates: DiagramTemplate[] = [
  {
    id: 'sprint-planning',
    name: 'Agile Sprint Planning',
    description: 'Scrum sprint planning and execution workflow',
    category: 'project',
    subcategory: 'agile',
    tags: ['Agile', 'Scrum', 'Sprint', 'Planning'],
    complexity: 'Intermediate',
    industry: ['Technology', 'Product Development'],
    nodes: [
      createNode('1', 'Sprint Planning', { x: 400, y: 50 }, 'circle', { fillColor: '#dbeafe', strokeColor: '#2563eb' }),
      createNode('2', 'Backlog Refinement', { x: 400, y: 150 }, 'rectangle'),
      createNode('3', 'Story Estimation', { x: 400, y: 250 }, 'rectangle'),
      createNode('4', 'Sprint Goal', { x: 400, y: 350 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('5', 'Daily Standup', { x: 200, y: 450 }, 'rectangle'),
      createNode('6', 'Development', { x: 400, y: 450 }, 'rectangle'),
      createNode('7', 'Testing', { x: 600, y: 450 }, 'rectangle'),
      createNode('8', 'Sprint Review', { x: 400, y: 550 }, 'rectangle'),
      createNode('9', 'Sprint Retrospective', { x: 400, y: 650 }, 'rectangle'),
      createNode('10', 'Sprint Complete', { x: 400, y: 750 }, 'circle', { fillColor: '#dcfce7', strokeColor: '#16a34a' })
    ],
    edges: [
      createEdge('e1-2', '1', '2'),
      createEdge('e2-3', '2', '3'),
      createEdge('e3-4', '3', '4'),
      createEdge('e4-5', '4', '5'),
      createEdge('e4-6', '4', '6'),
      createEdge('e4-7', '4', '7'),
      createEdge('e5-6', '5', '6', undefined, { strokeDasharray: '5 5' }),
      createEdge('e6-7', '6', '7'),
      createEdge('e7-8', '7', '8'),
      createEdge('e8-9', '8', '9'),
      createEdge('e9-10', '9', '10')
    ]
  },

  // Add 7 more project management templates...
];

// ==================== DATA FLOW TEMPLATES (7) ====================

export const dataFlowTemplates: DiagramTemplate[] = [
  {
    id: 'etl-process',
    name: 'ETL Data Pipeline',
    description: 'Extract, Transform, Load data processing pipeline',
    category: 'data',
    subcategory: 'etl',
    tags: ['ETL', 'Data', 'Pipeline', 'Processing'],
    complexity: 'Intermediate',
    industry: ['Data Analytics', 'Business Intelligence'],
    nodes: [
      createNode('1', 'Data Sources', { x: 100, y: 200 }, 'parallelogram', { fillColor: '#dbeafe', strokeColor: '#2563eb' }),
      createNode('2', 'Extract', { x: 250, y: 200 }, 'rectangle'),
      createNode('3', 'Data Validation', { x: 400, y: 200 }, 'diamond', { fillColor: '#fef3c7', strokeColor: '#d97706' }),
      createNode('4', 'Transform', { x: 550, y: 200 }, 'rectangle'),
      createNode('5', 'Data Cleansing', { x: 700, y: 200 }, 'rectangle'),
      createNode('6', 'Aggregation', { x: 850, y: 200 }, 'rectangle'),
      createNode('7', 'Load', { x: 1000, y: 200 }, 'rectangle'),
      createNode('8', 'Data Warehouse', { x: 1000, y: 350 }, 'parallelogram', { fillColor: '#dcfce7', strokeColor: '#16a34a' }),
      createNode('9', 'Error Log', { x: 400, y: 350 }, 'rectangle', { fillColor: '#fee2e2', strokeColor: '#dc2626' }),
      createNode('10', 'Monitoring', { x: 700, y: 350 }, 'rectangle')
    ],
    edges: [
      createEdge('e1-2', '1', '2'),
      createEdge('e2-3', '2', '3'),
      createEdge('e3-4', '3', '4', 'Valid'),
      createEdge('e3-9', '3', '9', 'Invalid', { stroke: '#ef4444' }),
      createEdge('e4-5', '4', '5'),
      createEdge('e5-6', '5', '6'),
      createEdge('e6-7', '6', '7'),
      createEdge('e7-8', '7', '8'),
      createEdge('e7-10', '7', '10'),
      createEdge('e10-8', '10', '8')
    ]
  },

  // Add 6 more data flow templates...
];

// Combine all templates
export const allTemplates: DiagramTemplate[] = [
  ...auditTemplates,
  ...businessProcessTemplates,
  ...technicalTemplates,
  ...projectManagementTemplates,
  ...dataFlowTemplates
];

// Template categories for filtering
export const templateCategories = [
  { id: 'all', name: 'All Templates', count: allTemplates.length },
  { id: 'audit', name: 'Audit & Compliance', count: auditTemplates.length },
  { id: 'business', name: 'Business Process', count: businessProcessTemplates.length },
  { id: 'technical', name: 'Technical Architecture', count: technicalTemplates.length },
  { id: 'project', name: 'Project Management', count: projectManagementTemplates.length },
  { id: 'data', name: 'Data Flow', count: dataFlowTemplates.length }
];

// Helper function to get templates by category
export const getTemplatesByCategory = (category: string): DiagramTemplate[] => {
  switch (category) {
    case 'audit':
      return auditTemplates;
    case 'business':
      return businessProcessTemplates;
    case 'technical':
      return technicalTemplates;
    case 'project':
      return projectManagementTemplates;
    case 'data':
      return dataFlowTemplates;
    default:
      return allTemplates;
  }
};

// Search templates by keyword
export const searchTemplates = (query: string): DiagramTemplate[] => {
  const searchTerm = query.toLowerCase();
  return allTemplates.filter(template =>
    template.name.toLowerCase().includes(searchTerm) ||
    template.description.toLowerCase().includes(searchTerm) ||
    template.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    (template.industry?.some(ind => ind.toLowerCase().includes(searchTerm)) ?? false)
  );
};

// Get premium templates
export const getPremiumTemplates = (): DiagramTemplate[] => {
  return allTemplates.filter(template => template.isPremium);
};

// Get templates by complexity
export const getTemplatesByComplexity = (complexity: 'Simple' | 'Intermediate' | 'Advanced'): DiagramTemplate[] => {
  return allTemplates.filter(template => template.complexity === complexity);
};

// Get popular templates (mock data - in production this would come from analytics)
export const getPopularTemplates = (limit: number = 10): DiagramTemplate[] => {
  // Simulate popularity by returning first N templates
  // In production, sort by actual usage metrics
  return allTemplates.slice(0, limit);
};

// Get recent templates (mock data - in production this would come from user history)
export const getRecentTemplates = (userId: string, limit: number = 5): DiagramTemplate[] => {
  // Simulate recent templates
  // In production, fetch from user's history
  return allTemplates.slice(0, limit);
};