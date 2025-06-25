import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  Shield, 
  Zap, 
  Target,
  CheckCircle,
  ArrowRight,
  FileSpreadsheet,
  Lightbulb,
  Users,
  BookOpen,
  Lock,
  Settings,
  Eye,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Removed xlsx import - will use CSV export instead for better compatibility

// Comprehensive unified requirements data based on full framework analysis
const complianceMapping = [
  {
    id: 'governance-leadership',
    category: '01. Governance & Leadership',
    auditReadyUnified: {
      title: 'Information Security Governance & Leadership',
      description: 'Comprehensive governance framework with leadership commitment and organizational structure',
      subRequirements: [
        'a) Establish top management leadership and commitment to information security',
        'b) Define and communicate information security policies and objectives',
        'c) Assign and communicate security roles, responsibilities, and authorities',
        'd) Determine organizational context and interested party requirements',
        'e) Define and maintain ISMS scope and boundaries',
        'f) Establish governance committees and oversight mechanisms',
        'g) Define information security metrics and reporting procedures',
        'h) Implement continual improvement processes',
        'i) Establish contacts with relevant authorities and special interest groups',
        'j) Include information security in project management activities',
        'k) Conduct internal information security audits at planned intervals',
        'l) Ensure compliance with information security policies and procedures',
        'm) Monitor and measure information security performance',
        'n) Establish and maintain audit trails and logging requirements',
        'o) Conduct management reviews of the ISMS at planned intervals',
        'p) Implement corrective and preventive actions for non-conformities',
        'q) Maintain compliance with legal and regulatory requirements',
        'r) Document and communicate audit findings and recommendations',
        's) Document all information security policies, procedures, and standards',
        't) Maintain accurate and up-to-date security documentation',
        'u) Control access to security documentation and records',
        'v) Establish document version control and approval processes',
        'w) Protect security documentation from unauthorized modification',
        'x) Implement secure storage and backup of critical documents',
        'y) Define retention periods for security records and documentation',
        'z) Establish procedures for secure disposal of sensitive documents'
      ]
    },
    frameworks: {
      iso27001: [
        { code: '4.1', title: 'Understanding the organization and its context', description: 'Determine external and internal issues relevant to ISMS' },
        { code: '4.2', title: 'Understanding interested parties', description: 'Determine relevant interested parties and their requirements' },
        { code: '4.3', title: 'Determining ISMS scope', description: 'Determine boundaries and applicability of ISMS' },
        { code: '4.4', title: 'Information security management system', description: 'Establish, implement, maintain and improve ISMS' },
        { code: '5.1', title: 'Leadership and commitment', description: 'Top management demonstrates leadership in ISMS' },
        { code: '5.2', title: 'Policy', description: 'Establish information security policy' },
        { code: '5.3', title: 'Roles, responsibilities and authorities', description: 'Assign and communicate security roles' },
        { code: '9.1', title: 'Monitoring, measurement, analysis and evaluation', description: 'Determine what needs to be monitored and measured' },
        { code: '9.2', title: 'Internal audit', description: 'Conduct internal audits at planned intervals' },
        { code: '9.3', title: 'Management review', description: 'Top management shall review the ISMS at planned intervals' },
        { code: '10.1', title: 'Nonconformity and corrective action', description: 'When nonconformity occurs, take corrective action' },
        { code: '10.2', title: 'Continual improvement', description: 'Continually improve the ISMS' },
        { code: '7.5', title: 'Documented information', description: 'Create and update documented information required by ISMS' }
      ],
      iso27002: [
        { code: 'A.5.1', title: 'Information security policies', description: 'Management direction and support for information security' },
        { code: 'A.5.3', title: 'Contact with authorities', description: 'Maintain appropriate contacts with relevant authorities' },
        { code: 'A.5.4', title: 'Contact with special interest groups', description: 'Maintain contacts with special interest groups' },
        { code: 'A.5.5', title: 'Information security in project management', description: 'Include information security in project management' },
        { code: 'A.5.2', title: 'Information security roles and responsibilities', description: 'Information security roles and responsibilities should be defined and allocated' },
        { code: 'A.5.31', title: 'Legal, statutory, regulatory and contractual requirements', description: 'Identify and comply with legal requirements' },
        { code: 'A.5.32', title: 'Intellectual property rights', description: 'Protect intellectual property rights' },
        { code: 'A.5.33', title: 'Protection of records', description: 'Protect records from loss, destruction, and falsification' },
        { code: 'A.5.34', title: 'Privacy and protection of personally identifiable information', description: 'Ensure privacy and protection of PII' },
        { code: 'A.5.35', title: 'Independent review of information security', description: 'Conduct independent reviews of information security' },
        { code: 'A.5.36', title: 'Compliance with policies, procedures and standards', description: 'Ensure compliance with security policies and procedures' },
        { code: 'A.5.37', title: 'Documented operating procedures', description: 'Document and maintain operating procedures' },
        { code: 'A.5.10', title: 'Acceptable use of information and other associated assets', description: 'Rules for acceptable use should be identified and implemented' },
        { code: 'A.5.11', title: 'Return of assets', description: 'All organizational assets should be returned upon employment termination' },
        { code: 'A.6.1', title: 'Screening', description: 'Background verification checks should be carried out on candidates for employment' },
        { code: 'A.6.2', title: 'Terms and conditions of employment', description: 'Terms and conditions of employment should state responsibilities for information security' },
        { code: 'A.6.4', title: 'Disciplinary process', description: 'Disciplinary process should be established for violations of information security' },
        { code: 'A.6.5', title: 'Responsibilities after termination', description: 'Information security responsibilities that remain valid after termination should be defined' },
        { code: 'A.6.6', title: 'Confidentiality or non-disclosure agreements', description: 'Confidentiality or non-disclosure agreements should be identified and regularly reviewed' },
        { code: 'A.8.1', title: 'Operational procedures and responsibilities', description: 'Operating procedures should be documented and maintained' },
        { code: 'A.8.6', title: 'Capacity management', description: 'The use of resources should be monitored and tuned' },
        { code: 'A.8.14', title: 'Change management procedures', description: 'Changes should be controlled by formal change management procedures' },
        { code: 'A.7.7', title: 'Clear desk and clear screen', description: 'Rules for maintaining clear desk and clear screen should be established' }
      ],
      cisControls: [
        // CIS controls are primarily technical - governance is mainly ISO focus
      ],
      gdpr: [
        { code: 'Art. 5', title: 'Principles relating to processing of personal data', description: 'Lawfulness, fairness, transparency, purpose limitation, data minimisation' },
        { code: 'Art. 24', title: 'Responsibility of the controller', description: 'Controller shall implement appropriate technical and organisational measures' },
        { code: 'Art. 25', title: 'Data protection by design and by default', description: 'Implement data protection principles at design time' },
        { code: 'Art. 30', title: 'Records of processing activities', description: 'Maintain records of all processing activities' },
        { code: 'Art. 35', title: 'Data protection impact assessment', description: 'Carry out impact assessment for high-risk processing' },
        { code: 'Art. 37', title: 'Designation of the data protection officer', description: 'Designate DPO where required' },
        { code: 'Art. 39', title: 'Tasks of the data protection officer', description: 'DPO tasks include monitoring compliance and training' }
      ]
    }
  },
  {
    id: 'risk-management',
    category: '02. Risk Management',
    auditReadyUnified: {
      title: 'Information Security Risk Management',
      description: 'Comprehensive risk assessment, treatment, and monitoring framework',
      subRequirements: [
        'a) Plan and conduct information security risk assessments',
        'b) Identify, analyze, and evaluate information security risks',
        'c) Develop and implement risk treatment plans',
        'd) Monitor and review risk management processes',
        'e) Retain documented information on risk management activities',
        'f) Establish risk acceptance criteria and risk appetite',
        'g) Implement controls based on risk assessment outcomes'
      ]
    },
    frameworks: {
      iso27001: [
        { code: '6.1.1', title: 'General (Risk management)', description: 'Plan actions to address risks and opportunities' },
        { code: '6.1.2', title: 'Information security risk assessment', description: 'Establish and apply risk assessment process' },
        { code: '6.1.3', title: 'Information security risk treatment', description: 'Establish and apply risk treatment process' },
        { code: '6.2', title: 'Information security objectives', description: 'Establish information security objectives' },
        { code: '6.3', title: 'Planning of changes', description: 'Plan changes to ISMS' },
        { code: '8.2', title: 'Information security risk assessment', description: 'Information security risk assessments shall be performed at planned intervals' },
        { code: '8.3', title: 'Information security risk treatment', description: 'Information security risk treatment process shall be implemented' }
      ],
      iso27002: [
        // Risk management is primarily ISO 27001 focus
      ],
      cisControls: [
        // Risk management is primarily an ISO focus - CIS is more control-focused
      ],
      gdpr: [
        { code: 'Art. 35', title: 'Data protection impact assessment', description: 'Carry out impact assessment for high-risk processing' },
        { code: 'Art. 36', title: 'Prior consultation', description: 'Consult supervisory authority where DPIA indicates high risk' }
      ]
    }
  },
  {
    id: 'software-assets',
    category: '03. Inventory and Control of Software Assets',
    auditReadyUnified: {
      title: 'Software Asset Inventory and Control',
      description: 'Comprehensive software asset management including inventory, licensing, and allowlisting',
      subRequirements: [
        'a) Maintain accurate and detailed inventory of all software assets',
        'b) Address unauthorized software within defined timeframes',
        'c) Utilize automated software inventory tools and processes',
        'd) Use technical controls to enforce software allowlisting',
        'e) Allowlist authorized software libraries and dependencies',
        'f) Allowlist authorized scripts and executables',
        'g) Control installation of software on operational systems',
        'h) Manage software licensing and compliance'
      ]
    },
    frameworks: {
      iso27001: [],
      iso27002: [
        { code: 'A.8.19', title: 'Installation of software on operational systems', description: 'Procedures should be implemented for controlling software installation' },
        { code: 'A.8.13', title: 'Operating system software', description: 'Use of operating system software should be managed' }
      ],
      cisControls: [
        { code: '2.1', title: 'Establish Software Inventory', description: 'Maintain accurate software inventory' },
        { code: '2.2', title: 'Address Unauthorized Software', description: 'Remove or quarantine unauthorized software' },
        { code: '2.3', title: 'Utilize Software Inventory Tools', description: 'Utilize automated software inventory tools' },
        { code: '2.4', title: 'Utilize Automated Software Inventory Tools', description: 'Utilize automated software inventory tools' },
        { code: '2.5', title: 'Allowlist Authorized Software', description: 'Use technical controls to enforce allowlisting' },
        { code: '2.6', title: 'Allowlist Authorized Libraries', description: 'Allowlist authorized software libraries' },
        { code: '2.7', title: 'Allowlist Authorized Scripts', description: 'Allowlist authorized scripts' }
      ],
      gdpr: [
        { code: 'Art. 32', title: 'Security of processing', description: 'Implement appropriate technical measures including software security controls' },
        { code: 'Art. 25', title: 'Data protection by design and by default', description: 'Implement data protection principles in software management' }
      ]
    }
  },
  {
    id: 'hardware-assets',
    category: '04. Inventory and Control of Hardware Assets',
    auditReadyUnified: {
      title: 'Comprehensive Asset Management',
      description: 'Unified approach to managing all enterprise assets including hardware, software, and data',
      subRequirements: [
        'a) Maintain accurate and up-to-date asset inventories',
        'b) Classify assets based on criticality and sensitivity',
        'c) Assign ownership and responsibility for all assets',
        'd) Implement secure configuration management',
        'e) Track asset lifecycle from acquisition to disposal',
        'f) Monitor unauthorized assets and software',
        'g) Establish data retention and disposal procedures',
        'h) Implement asset return procedures for personnel changes'
      ]
    },
    frameworks: {
      iso27001: [
        // Asset management is primarily covered by ISO 27002 controls
      ],
      iso27002: [
        { code: 'A.5.9', title: 'Inventory of information and other associated assets', description: 'Assets should be identified and inventory maintained' }
      ],
      cisControls: [
        { code: '1.1', title: 'Establish Asset Inventory', description: 'Maintain accurate, detailed enterprise asset inventory' },
        { code: '1.2', title: 'Address Unauthorized Assets', description: 'Address unauthorized assets within 48 hours' },
        { code: '1.3', title: 'Utilize Asset Discovery Tools', description: 'Use automated tools for asset discovery' },
        { code: '1.4', title: 'Use Dynamic Host Configuration Protocol Logging', description: 'Use DHCP logging for asset tracking' },
        { code: '1.5', title: 'Use Asset Management System', description: 'Use dedicated asset management system' },
        { code: '2.1', title: 'Establish Software Inventory', description: 'Maintain accurate software inventory' },
        { code: '2.2', title: 'Address Unauthorized Software', description: 'Remove or quarantine unauthorized software' },
        { code: '2.3', title: 'Utilize Software Inventory Tools', description: 'Utilize automated software inventory tools' },
        { code: '2.4', title: 'Utilize Automated Software Inventory Tools', description: 'Utilize automated software inventory tools' },
        { code: '2.5', title: 'Allowlist Authorized Software', description: 'Use technical controls to enforce allowlisting' },
        { code: '2.6', title: 'Allowlist Authorized Libraries', description: 'Allowlist authorized software libraries' },
        { code: '2.7', title: 'Allowlist Authorized Scripts', description: 'Allowlist authorized scripts' }
      ]
    }
  },
  {
    id: 'access-control',
    category: '05. Identity & Access Management',
    auditReadyUnified: {
      title: 'Identity & Access Management',
      description: 'Unified access control framework covering identity lifecycle, authentication, and authorization',
      subRequirements: [
        'a) Implement comprehensive identity lifecycle management',
        'b) Establish role-based access control (RBAC) policies',
        'c) Enforce multi-factor authentication for privileged accounts',
        'd) Conduct regular access reviews and certification',
        'e) Implement privileged access management (PAM) solutions',
        'f) Monitor and log all access control activities',
        'g) Establish emergency access procedures',
        'h) Control physical and logical access to information assets'
      ]
    },
    frameworks: {
      iso27001: [
        { code: 'A.5.15', title: 'Access control', description: 'Control physical and logical access to information and assets' },
        { code: 'A.5.16', title: 'Identity management', description: 'Manage the full life cycle of identities' },
        { code: 'A.5.17', title: 'Authentication information', description: 'Control allocation and management of authentication information' },
        { code: 'A.5.18', title: 'Access rights', description: 'Provision, review, modify and remove access rights' }
      ],
      iso27002: [
        { code: 'A.8.1', title: 'User access management', description: 'Ensure authorized user access and prevent unauthorized access' },
        { code: 'A.8.2', title: 'Privileged access rights', description: 'Restrict and control privileged access rights' },
        { code: 'A.8.3', title: 'Information access restriction', description: 'Restrict access to information and application functions' },
        { code: 'A.8.4', title: 'Access to source code', description: 'Access to source code should be restricted' },
        { code: 'A.8.5', title: 'Secure authentication', description: 'Implement secure authentication procedures' },
        { code: 'A.6.7', title: 'Remote working', description: 'Security measures should be implemented for remote working' }
      ],
      cisControls: [
        { code: '5.1', title: 'Establish Account Inventory', description: 'Maintain inventory of all enterprise accounts' },
        { code: '5.2', title: 'Use Unique Passwords', description: 'Use unique passwords for all enterprise assets' },
        { code: '5.3', title: 'Disable Dormant Accounts', description: 'Delete or disable dormant accounts after 45 days' },
        { code: '5.4', title: 'Restrict Administrator Privileges', description: 'Restrict administrator privileges to dedicated accounts' },
        { code: '5.5', title: 'Establish Account Lifecycle Processes', description: 'Establish and follow account management processes' },
        { code: '5.6', title: 'Centralize Account Management', description: 'Centralize account management through directory services' },
        { code: '6.1', title: 'Establish Access Granting Process', description: 'Establish process for granting access to assets' },
        { code: '6.2', title: 'Establish Access Revoking Process', description: 'Establish process for revoking access to assets' },
        { code: '6.3', title: 'Require MFA', description: 'Require multi-factor authentication for externally-exposed applications' },
        { code: '6.4', title: 'Require MFA for Remote Network Access', description: 'Require MFA for remote network access' },
        { code: '6.5', title: 'Require MFA for Administrative Access', description: 'Require MFA for administrative access' },
        { code: '3.3', title: 'Configure Data Access Control Lists', description: 'Configure data access control lists on local and remote filesystems' }
      ],
      gdpr: [
        { code: 'Art. 32', title: 'Security of processing', description: 'Implement appropriate technical and organisational measures to ensure security' },
        { code: 'Art. 25', title: 'Data protection by design and by default', description: 'Implement data protection principles including access controls' },
        { code: 'Art. 15', title: 'Right of access by the data subject', description: 'Data subjects have right to access their personal data' },
        { code: 'Art. 16', title: 'Right to rectification', description: 'Data subjects have right to obtain rectification of inaccurate personal data' },
        { code: 'Art. 17', title: 'Right to erasure (right to be forgotten)', description: 'Data subjects have right to obtain erasure of personal data' }
      ]
    }
  },
  {
    id: 'data-protection',
    category: '06. Data Protection',
    auditReadyUnified: {
      title: 'Data Protection & Cryptographic Controls',
      description: 'Comprehensive data protection including classification, handling, encryption, and privacy',
      subRequirements: [
        'a) Classify information according to business and security requirements',
        'b) Implement appropriate information labeling procedures',
        'c) Establish secure information transfer rules and procedures',
        'd) Implement cryptographic controls for data protection',
        'e) Manage cryptographic keys throughout their lifecycle',
        'f) Establish data retention and secure disposal procedures',
        'g) Protect against data leakage and unauthorized disclosure',
        'h) Implement data loss prevention (DLP) controls',
        'i) Deploy data loss prevention solution on enterprise assets',
        'j) Configure data loss prevention to alert on data exfiltration',
        'k) Configure data loss prevention to block unauthorized data transfers',
        'l) Monitor and analyze data loss prevention alerts and events',
        'm) Test and validate data loss prevention effectiveness',
        'n) Ensure compliance with data protection regulations'
      ]
    },
    frameworks: {
      iso27001: [
        { code: 'A.5.12', title: 'Classification of information', description: 'Classify information according to security needs' },
        { code: 'A.5.13', title: 'Labelling of information', description: 'Develop and implement information labelling procedures' },
        { code: 'A.5.14', title: 'Information transfer', description: 'Establish information transfer rules and procedures' }
      ],
      iso27002: [
        { code: 'A.5.12', title: 'Classification of information', description: 'Information shall be classified according to information security needs' },
        { code: 'A.5.13', title: 'Labelling of information', description: 'An appropriate set of procedures for information labelling shall be developed' },
        { code: 'A.5.14', title: 'Information transfer', description: 'Information transfer rules and procedures shall be in place' },
        { code: 'A.8.24', title: 'Use of cryptography', description: 'Policy on the use of cryptographic controls' },
        { code: 'A.8.10', title: 'Information deletion', description: 'Information stored in information systems should be deleted' },
        { code: 'A.8.11', title: 'Data masking', description: 'Data masking should be used in accordance with policy' },
        { code: 'A.8.12', title: 'Data leakage prevention', description: 'Data leakage prevention measures should be applied' }
      ],
      cisControls: [
        { code: '3.1', title: 'Establish Data Management Process', description: 'Establish and maintain data management process' },
        { code: '3.2', title: 'Establish Data Inventory', description: 'Establish and maintain enterprise data inventory' },
        { code: '3.4', title: 'Enforce Data Retention', description: 'Enforce data retention requirements' },
        { code: '3.5', title: 'Securely Dispose of Data', description: 'Securely dispose of data as outlined in enterprise policy' },
        { code: '3.6', title: 'Encrypt Data on End-User Devices', description: 'Encrypt data on end-user devices' },
        { code: '3.7', title: 'Establish and Maintain Data Classification Scheme', description: 'Establish data classification scheme' },
        { code: '3.8', title: 'Document Data Flows', description: 'Document enterprise data flows' },
        { code: '3.9', title: 'Encrypt Data on Removable Media', description: 'Encrypt data on removable media' },
        { code: '3.10', title: 'Encrypt Sensitive Data in Transit', description: 'Encrypt sensitive data in transit' },
        { code: '3.11', title: 'Encrypt Sensitive Data at Rest', description: 'Encrypt sensitive data at rest' },
        { code: '3.13', title: 'Deploy a Data Loss Prevention Solution', description: 'Deploy data loss prevention solution' },
        { code: '3.14', title: 'Log Sensitive Data Access', description: 'Log sensitive data access including modification and disposal' }
      ],
      gdpr: [
        { code: 'Art. 5', title: 'Principles relating to processing of personal data', description: 'Data minimisation, purpose limitation, accuracy, storage limitation' },
        { code: 'Art. 6', title: 'Lawfulness of processing', description: 'Processing shall be lawful only if at least one legal basis applies' },
        { code: 'Art. 17', title: 'Right to erasure (right to be forgotten)', description: 'Data subjects have right to obtain erasure of personal data' },
        { code: 'Art. 18', title: 'Right to restriction of processing', description: 'Data subject has right to obtain restriction of processing' },
        { code: 'Art. 20', title: 'Right to data portability', description: 'Data subject has right to receive personal data in structured format' },
        { code: 'Art. 32', title: 'Security of processing', description: 'Implement appropriate technical measures including encryption' },
        { code: 'Art. 25', title: 'Data protection by design and by default', description: 'Implement data protection principles by design' }
      ]
    }
  },
  {
    id: 'secure-configuration',
    category: '07. Secure Configuration of Hardware and Software',
    auditReadyUnified: {
      title: 'Secure Configuration Management',
      description: 'Enterprise-wide secure configuration management for all assets and systems',
      subRequirements: [
        'a) Establish and maintain secure configurations for all enterprise assets',
        'b) Establish secure configurations for mobile devices and BYOD',
        'c) Configure automatic session locking on all enterprise assets',
        'd) Implement and manage firewalls on servers and workstations',
        'e) Maintain configuration baselines and monitor configuration drift',
        'f) Implement automated configuration management tools',
        'g) Document and approve all configuration changes',
        'h) Regularly audit and validate system configurations'
      ]
    },
    frameworks: {
      iso27001: [],
      iso27002: [
        { code: 'A.8.9', title: 'Configuration management', description: 'Configurations should be established and maintained' }
      ],
      cisControls: [
        { code: '4.1', title: 'Establish Secure Configurations', description: 'Establish and maintain secure configurations for enterprise assets' },
        { code: '4.2', title: 'Establish Secure Configurations for Mobile Devices', description: 'Establish secure configurations for mobile devices' },
        { code: '4.3', title: 'Configure Automatic Session Locking', description: 'Configure automatic session locking on enterprise assets' },
        { code: '4.4', title: 'Implement and Manage a Firewall', description: 'Implement and manage a firewall on servers' },
        { code: '4.5', title: 'Implement and Manage a Host-based Firewall', description: 'Implement and manage a host-based firewall' },
        { code: '4.6', title: 'Securely Manage Enterprise Assets and Software', description: 'Securely manage enterprise assets and software' },
        { code: '4.7', title: 'Manage Default Accounts on Enterprise Assets and Software', description: 'Manage default accounts on enterprise assets' },
        { code: '4.8', title: 'Uninstall or Disable Unnecessary Services', description: 'Uninstall or disable unnecessary services on enterprise assets' },
        { code: '4.9', title: 'Configure Trusted DNS Servers', description: 'Configure trusted DNS servers on enterprise assets' },
        { code: '4.10', title: 'Enforce Automatic Device Lock', description: 'Enforce automatic device lock on portable end-user devices' },
        { code: '4.11', title: 'Enforce Remote Wipe Capability', description: 'Enforce remote wipe capability on portable devices' },
        { code: '4.12', title: 'Separate Enterprise Workspaces', description: 'Separate enterprise workspaces on mobile devices' }
      ],
      gdpr: [
        { code: 'Art. 32', title: 'Security of processing', description: 'Implement appropriate technical and organisational measures to ensure security' },
        { code: 'Art. 25', title: 'Data protection by design and by default', description: 'Implement data protection principles including secure configurations' }
      ]
    }
  },
  {
    id: 'vulnerability-management',
    category: '08. Continuous Vulnerability Management',
    auditReadyUnified: {
      title: 'Continuous Vulnerability Management',
      description: 'Comprehensive vulnerability management including assessment, patching, and remediation',
      subRequirements: [
        'a) Establish and maintain vulnerability management processes',
        'b) Establish and maintain vulnerability scanning processes',
        'c) Perform automated vulnerability scans of enterprise assets',
        'd) Perform vulnerability scans on network infrastructure',
        'e) Perform automated operating system patch management',
        'f) Perform automated application patch management',
        'g) Remediate detected vulnerabilities in enterprise assets',
        'h) Information about technical vulnerabilities should be obtained'
      ]
    },
    frameworks: {
      iso27001: [],
      iso27002: [
        { code: 'A.5.7', title: 'Threat intelligence', description: 'Information to help identify, analyze, and understand threats should be collected and analyzed' },
        { code: 'A.8.8', title: 'Management of technical vulnerabilities', description: 'Information about technical vulnerabilities should be obtained' }
      ],
      cisControls: [
        { code: '7.1', title: 'Establish Asset Vulnerability Management', description: 'Establish and maintain vulnerability management process' },
        { code: '7.2', title: 'Establish Vulnerability Scanning', description: 'Establish and maintain vulnerability scanning process' },
        { code: '7.3', title: 'Perform Automated Vulnerability Scans', description: 'Perform automated vulnerability scans of enterprise assets' },
        { code: '7.4', title: 'Perform Vulnerability Scans on Network Infrastructure', description: 'Perform vulnerability scans on network infrastructure' },
        { code: '7.5', title: 'Perform Automated Operating System Patch Management', description: 'Perform automated operating system patch management' },
        { code: '7.6', title: 'Perform Automated Application Patch Management', description: 'Perform automated application patch management' },
        { code: '7.7', title: 'Remediate Detected Vulnerabilities', description: 'Remediate detected vulnerabilities in enterprise assets' }
      ],
      gdpr: [
        { code: 'Art. 32', title: 'Security of processing', description: 'Implement appropriate technical and organisational measures to ensure security' },
        { code: 'Art. 25', title: 'Data protection by design and by default', description: 'Implement data protection principles including vulnerability management' }
      ]
    }
  },
  {
    id: 'physical-environmental',
    category: '09. Physical & Environmental Security',
    auditReadyUnified: {
      title: 'Physical & Environmental Security Controls',
      description: 'Comprehensive physical security covering facilities, equipment, and environmental controls',
      subRequirements: [
        'a) Establish physical security perimeters around information processing facilities',
        'b) Control physical entry to secure areas and facilities',
        'c) Implement protection against environmental threats',
        'd) Secure equipment and protect against theft or damage',
        'e) Implement secure disposal or reuse of equipment',
        'f) Control unattended user equipment and secure work environments',
        'g) Establish equipment maintenance and support procedures',
        'h) Monitor and log physical access to secure areas'
      ]
    },
    frameworks: {
      iso27001: [],
      iso27002: [
        { code: 'A.7.1', title: 'Physical security perimeters', description: 'Physical security perimeters should be defined and used' },
        { code: 'A.7.2', title: 'Physical entry', description: 'Secure areas should be protected by appropriate entry controls' },
        { code: 'A.7.3', title: 'Securing offices, rooms and facilities', description: 'Physical security for offices, rooms and facilities should be designed and implemented' },
        { code: 'A.7.4', title: 'Physical security monitoring', description: 'Premises should be continuously monitored for unauthorized physical access' },
        { code: 'A.7.5', title: 'Protecting against physical and environmental threats', description: 'Protection against physical and environmental threats should be designed and implemented' },
        { code: 'A.7.6', title: 'Working in secure areas', description: 'Procedures for working in secure areas should be designed and implemented' },
        { code: 'A.7.8', title: 'Equipment siting and protection', description: 'Equipment should be sited and protected to reduce risks from environmental threats' },
        { code: 'A.7.9', title: 'Security of assets off-premises', description: 'Off-site assets should be protected taking into account different risks' },
        { code: 'A.7.10', title: 'Storage media', description: 'Storage media should be protected against unauthorized access during transportation' },
        { code: 'A.7.11', title: 'Supporting utilities', description: 'Equipment should be protected from power failures and utility disruptions' },
        { code: 'A.7.12', title: 'Cabling security', description: 'Power and telecommunications cabling should be protected from interference or damage' },
        { code: 'A.7.13', title: 'Equipment maintenance', description: 'Equipment should be correctly maintained to ensure continued availability' },
        { code: 'A.7.14', title: 'Secure disposal or re-use of equipment', description: 'Equipment should be verified to ensure sensitive data removal before disposal' }
      ],
      cisControls: [
        // Physical security related CIS controls moved to correct category - backup/recovery controls moved to business continuity
      ],
      gdpr: [
        { code: 'Art. 32', title: 'Security of processing', description: 'Technical measures including pseudonymisation and encryption of personal data' },
        { code: 'Art. 25', title: 'Data protection by design and by default', description: 'Implement appropriate safeguards including physical security' }
      ]
    }
  },
  {
    id: 'network-security',
    category: '10. Network Infrastructure Management',
    auditReadyUnified: {
      title: 'Network Infrastructure Management',
      description: 'Comprehensive network security including infrastructure protection, monitoring, and secure communications',
      subRequirements: [
        'a) Implement network security management and monitoring',
        'b) Establish network access controls and segmentation',
        'c) Deploy and configure firewalls and network security devices',
        'd) Monitor network traffic and detect anomalous activity',
        'e) Secure wireless network communications',
        'f) Protect against network-based attacks and intrusions',
        'g) Implement secure remote access capabilities',
        'h) Establish network change management procedures'
      ]
    },
    frameworks: {
      iso27001: [
        { code: 'A.5.23', title: 'Information security for use of cloud services', description: 'Establish processes for cloud service security' }
      ],
      iso27002: [
        { code: 'A.8.20', title: 'Networks security management', description: 'Networks should be managed and controlled' },
        { code: 'A.8.21', title: 'Security of network services', description: 'Security mechanisms and service levels should be identified' },
        { code: 'A.8.22', title: 'Segregation in networks', description: 'Groups of information services should be segregated' },
        { code: 'A.8.23', title: 'Web filtering', description: 'Access to external websites should be managed' }
      ],
      cisControls: [
        { code: '12.1', title: 'Ensure Network Infrastructure is Up-to-Date', description: 'Ensure network infrastructure is current and supported' },
        { code: '12.2', title: 'Establish and Maintain Secure Network Architecture', description: 'Establish and maintain secure network architecture' },
        { code: '12.3', title: 'Securely Manage Network Infrastructure', description: 'Securely manage network infrastructure' },
        { code: '12.4', title: 'Establish and Maintain Architecture Diagram', description: 'Establish and maintain architecture diagram' },
        { code: '12.5', title: 'Centralize Network Authentication', description: 'Centralize network authentication, authorization, and auditing' },
        { code: '12.6', title: 'Use Secure Network Management', description: 'Use secure network management and communication protocols' },
        { code: '12.7', title: 'Ensure Remote Devices Use VPN', description: 'Ensure remote devices utilize a VPN' },
        { code: '12.8', title: 'Establish and Maintain Network Boundary Protection', description: 'Establish and maintain network boundary protections' },
        { code: '13.1', title: 'Centralize Security Event Alerting', description: 'Centralize security event alerting across enterprise assets' },
        { code: '13.2', title: 'Deploy Network-Based IDS', description: 'Deploy network-based Intrusion Detection System' },
        { code: '13.3', title: 'Deploy Host-Based IDS', description: 'Deploy host-based Intrusion Detection System' }
      ]
    }
  },
  {
    id: 'secure-development',
    category: '11. Secure Software Development',
    auditReadyUnified: {
      title: 'Secure Software Development Lifecycle',
      description: 'Comprehensive secure development practices covering SDLC, testing, and deployment',
      subRequirements: [
        'a) Establish and maintain an application security program',
        'b) Implement secure coding standards and practices',
        'c) Establish application input and output validation requirements',
        'd) Perform application security testing throughout development',
        'e) Implement secure system architecture and engineering principles',
        'f) Separate development, testing, and operational environments',
        'g) Control access to program source code',
        'h) Train development personnel on secure coding practices',
        'i) Direct, monitor and review outsourced development activities',
        'j) Select test information carefully and protect test data'
      ]
    },
    frameworks: {
      iso27001: [],
      iso27002: [
        { code: 'A.8.25', title: 'Secure system engineering principles', description: 'Apply secure engineering principles' },
        { code: 'A.8.26', title: 'Application security requirements', description: 'Identify and specify security requirements' },
        { code: 'A.8.27', title: 'Secure system architecture and engineering principles', description: 'Apply secure architecture principles' },
        { code: 'A.8.28', title: 'Secure coding', description: 'Apply secure coding principles to software development' },
        { code: 'A.8.29', title: 'Secure development life cycle', description: 'Rules for secure development should be established' },
        { code: 'A.8.4', title: 'Access to source code', description: 'Control access to program source code' },
        { code: 'A.8.30', title: 'Outsourced development', description: 'Direct, monitor and review outsourced system development activities' },
        { code: 'A.8.31', title: 'Separation of development, testing and operational environments', description: 'Separate development, testing and operational environments' },
        { code: 'A.8.33', title: 'Test information', description: 'Select test information carefully, protect and control test information' },
        { code: 'A.8.15', title: 'Access control to program source code', description: 'Access to program source code should be controlled' }
      ],
      cisControls: [
        { code: '16.1', title: 'Establish Application Security Program', description: 'Establish and maintain application security program' },
        { code: '16.2', title: 'Establish Application Input Validation', description: 'Establish application input and output validation' },
        { code: '16.3', title: 'Perform Application Security Testing', description: 'Perform application security testing' },
        { code: '16.4', title: 'Establish Application Security Requirements', description: 'Establish application security requirements' },
        { code: '16.5', title: 'Use Up-to-Date and Trusted Third-Party Components', description: 'Use trusted third-party software components' },
        { code: '16.6', title: 'Establish Application Security Architecture', description: 'Establish application security architecture' },
        { code: '16.7', title: 'Use Automation to Deploy Software', description: 'Use automation to deploy and update software' },
        { code: '14.8', title: 'Train Workforce on Secure Development', description: 'Train development personnel on secure coding' }
      ]
    }
  },
  {
    id: 'incident-response',
    category: '12. Incident Response & Security Event Management',
    auditReadyUnified: {
      title: 'Incident Response & Security Event Management',
      description: 'Comprehensive incident response covering detection, analysis, containment, and recovery',
      subRequirements: [
        'a) Establish and maintain incident response planning and preparation',
        'b) Define incident response roles, responsibilities, and communication procedures',
        'c) Implement security event detection and monitoring capabilities',
        'd) Establish incident classification and escalation procedures',
        'e) Implement incident containment, eradication, and recovery processes',
        'f) Conduct post-incident analysis and lessons learned activities',
        'g) Coordinate with external parties as required during incidents',
        'h) Maintain incident response documentation and evidence'
      ]
    },
    frameworks: {
      iso27001: [
        { code: 'A.5.24', title: 'Information security incident management planning and preparation', description: 'Plan and prepare for incident management' },
        { code: 'A.5.25', title: 'Assessment and decision on information security events', description: 'Assess and decide on information security events' },
        { code: 'A.5.26', title: 'Response to information security incidents', description: 'Respond to information security incidents' },
        { code: 'A.5.27', title: 'Learning from information security incidents', description: 'Learn from information security incidents' }
      ],
      iso27002: [
        { code: 'A.5.24', title: 'Information security incident management planning and preparation', description: 'Plan and prepare for managing information security incidents' },
        { code: 'A.5.25', title: 'Assessment and decision on information security events', description: 'Information security events should be assessed' },
        { code: 'A.5.26', title: 'Response to information security incidents', description: 'Information security incidents should be responded to' },
        { code: 'A.5.27', title: 'Learning from information security incidents', description: 'Knowledge gained from incidents should be used' },
        { code: 'A.6.8', title: 'Information security event reporting', description: 'Information security events should be reported through appropriate management channels' }
      ],
      cisControls: [
        { code: '17.1', title: 'Designate Personnel to Manage Incident Handling', description: 'Designate personnel to manage incident response' },
        { code: '17.2', title: 'Establish Incident Response Procedures', description: 'Establish and maintain incident response procedures' },
        { code: '17.3', title: 'Establish Communication Procedures', description: 'Establish communication procedures for incidents' },
        { code: '17.4', title: 'Establish Criteria for Incident Escalation', description: 'Establish criteria for escalating incidents' },
        { code: '17.5', title: 'Define Acceptable Limits for IT Service Availability', description: 'Define acceptable limits for service availability' },
        { code: '17.6', title: 'Define Recovery Procedures', description: 'Define procedures for recovery from incidents' },
        { code: '17.7', title: 'Conduct Routine Incident Response Exercises', description: 'Conduct routine incident response exercises' },
        { code: '17.8', title: 'Conduct Post-Incident Reviews', description: 'Conduct post-incident reviews to improve processes' },
        { code: '17.9', title: 'Establish Role-Based Communication Plans', description: 'Establish role-based communication plans' }
      ],
      gdpr: [
        { code: 'Art. 33', title: 'Notification of a personal data breach to the supervisory authority', description: 'Controller shall notify supervisory authority within 72 hours of breach' },
        { code: 'Art. 34', title: 'Communication of a personal data breach to the data subject', description: 'Controller shall communicate breach to data subjects when high risk' },
        { code: 'Art. 32', title: 'Security of processing', description: 'Implement measures to restore availability and access to personal data in case of incident' }
      ]
    }
  },
  {
    id: 'network-monitoring',
    category: '13. Network Monitoring & Defense',
    auditReadyUnified: {
      title: 'Network Monitoring & Defense',
      description: 'Comprehensive network monitoring, intrusion detection, and network defense capabilities',
      subRequirements: [
        'a) Establish and maintain network monitoring capabilities',
        'b) Deploy network intrusion detection and prevention systems',
        'c) Monitor network traffic for malicious and unauthorized behavior',
        'd) Establish and maintain network boundary defense capabilities',
        'e) Deploy network-based security monitoring tools',
        'f) Configure network devices to log security events',
        'g) Establish network segmentation and access controls',
        'h) Implement network-based threat detection and response'
      ]
    },
    frameworks: {
      iso27001: [],
      iso27002: [
        { code: 'A.8.20', title: 'Networks security management', description: 'Networks should be controlled and protected' },
        { code: 'A.8.21', title: 'Security of network services', description: 'Security mechanisms should be agreed and defined' },
        { code: 'A.8.22', title: 'Segregation in networks', description: 'Groups of information services should be segregated' }
      ],
      cisControls: [
        { code: '12.1', title: 'Ensure Network Infrastructure is Up-to-Date', description: 'Ensure network infrastructure is current and supported' },
        { code: '12.2', title: 'Establish and Maintain Secure Network Architecture', description: 'Establish and maintain secure network architecture' },
        { code: '12.3', title: 'Securely Manage Network Infrastructure', description: 'Securely manage network infrastructure' },
        { code: '12.4', title: 'Establish and Maintain Architecture Diagram', description: 'Establish and maintain architecture diagram' },
        { code: '12.5', title: 'Centralize Network Authentication', description: 'Centralize network authentication, authorization, and auditing' },
        { code: '12.6', title: 'Use Secure Network Management', description: 'Use secure network management and communication protocols' },
        { code: '12.7', title: 'Ensure Remote Devices Use VPN', description: 'Ensure remote devices utilize a VPN' },
        { code: '12.8', title: 'Establish and Maintain Network Boundary Protection', description: 'Establish and maintain network boundary protections' },
        { code: '13.1', title: 'Centralize Security Event Alerting', description: 'Centralize security event alerting across enterprise assets' },
        { code: '13.2', title: 'Deploy a Host-Based Intrusion Detection Solution', description: 'Deploy host-based intrusion detection solution' },
        { code: '13.3', title: 'Deploy a Network Intrusion Detection Solution', description: 'Deploy network intrusion detection solution' },
        { code: '13.4', title: 'Perform Traffic Filtering Between Network Segments', description: 'Perform traffic filtering between network segments' },
        { code: '13.5', title: 'Manage Access Control for Remote Assets', description: 'Manage access control for assets remotely connecting' },
        { code: '13.6', title: 'Collect Network Traffic Flow Logs', description: 'Collect network traffic flow logs for enterprise assets' },
        { code: '13.7', title: 'Deploy a Network Intrusion Prevention Solution', description: 'Deploy network intrusion prevention solution' },
        { code: '13.8', title: 'Manage Network Infrastructure Through a Dedicated Network', description: 'Manage network infrastructure through dedicated network' },
        { code: '13.9', title: 'Deploy Port-Level Access Control', description: 'Deploy port-level access control for network infrastructure' },
        { code: '13.10', title: 'Perform Application Layer Filtering', description: 'Perform application layer filtering for network communications' },
        { code: '13.11', title: 'Tune Security Event Alerting Thresholds', description: 'Tune security event alerting thresholds monthly' }
      ],
      gdpr: [
        { code: 'Art. 32', title: 'Security of processing', description: 'Implement appropriate technical measures to ensure network security' },
        { code: 'Art. 25', title: 'Data protection by design and by default', description: 'Implement data protection principles in network design' }
      ]
    }
  },
  {
    id: 'supplier-management',
    category: '14. Supplier & Third-Party Risk Management',
    auditReadyUnified: {
      title: 'Supplier & Third-Party Risk Management',
      description: 'Comprehensive supplier and third-party risk management including vendor relationships and cloud services',
      subRequirements: [
        'a) Establish processes for managing information security risks with suppliers',
        'b) Include security requirements in supplier agreements and contracts',
        'c) Monitor and review supplier security practices and service delivery',
        'd) Manage information security in the ICT supply chain',
        'e) Establish security requirements for cloud service usage',
        'f) Implement due diligence processes for supplier selection',
        'g) Define security requirements for supplier access to information assets',
        'h) Establish procedures for supplier relationship termination'
      ]
    },
    frameworks: {
      iso27001: [
        { code: 'A.5.19', title: 'Information security in supplier relationships', description: 'Manage information security risks with suppliers' },
        { code: 'A.5.20', title: 'Addressing information security within supplier agreements', description: 'Establish security requirements in supplier agreements' },
        { code: 'A.5.21', title: 'Managing information security in the ICT supply chain', description: 'Manage security risks in ICT supply chain' },
        { code: 'A.5.22', title: 'Monitoring, review and change management of supplier services', description: 'Monitor and review supplier security practices' },
        { code: 'A.5.23', title: 'Information security for use of cloud services', description: 'Establish processes for cloud service security' }
      ],
      iso27002: [
        { code: 'A.5.19', title: 'Information security in supplier relationships', description: 'Processes should be defined for managing supplier relationships' },
        { code: 'A.5.20', title: 'Addressing information security within supplier agreements', description: 'Security requirements should be established in supplier agreements' },
        { code: 'A.5.21', title: 'Managing information security in the ICT supply chain', description: 'Processes should be defined for managing ICT supply chain risks' }
      ],
      cisControls: [
        { code: '15.1', title: 'Establish Service Provider Management Process', description: 'Establish and maintain service provider management process' },
        { code: '15.2', title: 'Establish Service Provider Inventory', description: 'Establish and maintain inventory of service providers' },
        { code: '15.3', title: 'Require Service Provider Security Assessments', description: 'Require and review security assessments for service providers' },
        { code: '15.4', title: 'Ensure Service Provider Contracts Include Security Requirements', description: 'Ensure contracts include security requirements' },
        { code: '15.5', title: 'Assess Service Provider Security Annually', description: 'Assess service provider security annually' },
        { code: '15.6', title: 'Monitor Service Provider Access', description: 'Monitor service provider access to enterprise assets' },
        { code: '15.7', title: 'Securely Decommission Service Providers', description: 'Securely decommission service provider access' }
      ],
      gdpr: [
        { code: 'Art. 28', title: 'Processor', description: 'Processing by a processor shall be governed by a contract or other legal act' },
        { code: 'Art. 44', title: 'General principle for transfers', description: 'Any transfer of personal data to third countries requires adequate protection' },
        { code: 'Art. 46', title: 'Transfers subject to appropriate safeguards', description: 'Transfers to third countries with appropriate safeguards' },
        { code: 'Art. 32', title: 'Security of processing', description: 'Controller and processor shall implement appropriate security measures' }
      ]
    }
  },
  {
    id: 'security-awareness',
    category: '15. Security Awareness & Skills Training',
    auditReadyUnified: {
      title: 'Security Awareness & Skills Training Program',
      description: 'Comprehensive security awareness and training program covering all aspects of cybersecurity education',
      subRequirements: [
        'a) Establish and maintain a formal security awareness program',
        'b) Conduct training at hire and annually for all personnel', 
        'c) Provide role-specific security training based on job responsibilities',
        'd) Train workforce on data handling, classification, and transfer procedures',
        'e) Educate employees on malware protection and safe computing practices',
        'f) Conduct secure coding training for development personnel',
        'g) Provide network security awareness for remote workers',
        'h) Train staff on patch management and software update procedures',
        'i) Implement advanced social engineering awareness for high-profile roles'
      ]
    },
    frameworks: {
      iso27001: [],
      iso27002: [
        { code: 'A.6.3', title: 'Information security awareness, education and training', description: 'All personnel should receive appropriate information security awareness training' }
      ],
      cisControls: [
        { code: '14.1', title: 'Establish Security Awareness Program', description: 'Educate workforce on secure interaction with enterprise assets' },
        { code: '14.2', title: 'Train Workforce on Data Handling', description: 'Train on data storage, transfer, archiving, and destruction' },
        { code: '14.3', title: 'Train Workforce on Software Updates', description: 'Train on verifying and reporting software patches' },
        { code: '14.4', title: 'Train Workforce on Network Security', description: 'Train on secure network usage and home network configuration' },
        { code: '14.5', title: 'Train Workforce on Authentication', description: 'Train on proper handling of authentication credentials' },
        { code: '14.6', title: 'Train Workforce on Mobile Device Security', description: 'Train on secure mobile device usage' },
        { code: '14.7', title: 'Train Workforce on Social Engineering', description: 'Train on social engineering attack identification' },
        { code: '14.8', title: 'Train Workforce on Secure Development', description: 'Train development personnel on secure coding' },
        { code: '14.9', title: 'Conduct Role-Specific Security Training', description: 'Provide specialized training based on job roles' }
      ],
      gdpr: [
        { code: 'Art. 39', title: 'Tasks of the data protection officer', description: 'DPO tasks include monitoring compliance and training staff' },
        { code: 'Art. 32', title: 'Security of processing', description: 'Controller shall ensure staff are trained on data protection measures' }
      ]
    }
  },
  // New comprehensive categories to capture all missing requirements
  {
    id: 'business-continuity',
    category: '16. Business Continuity & Disaster Recovery Management',
    auditReadyUnified: {
      title: 'Business Continuity & Disaster Recovery Management',
      description: 'Comprehensive business continuity planning covering disruption management and recovery capabilities',
      subRequirements: [
        'a) Plan for maintaining information security during disruption events',
        'b) Establish and maintain business continuity plans and procedures',
        'c) Implement ICT readiness for business continuity scenarios',
        'd) Test business continuity and disaster recovery procedures regularly',
        'e) Establish recovery time and point objectives for critical systems',
        'f) Maintain offsite backup and recovery capabilities',
        'g) Coordinate business continuity with suppliers and third parties',
        'h) Document and communicate business continuity roles and responsibilities'
      ]
    },
    frameworks: {
      iso27001: [
        { code: '8.1', title: 'Operational planning and control', description: 'Plan, implement and control processes for meeting information security requirements' }
      ],
      iso27002: [
        { code: 'A.5.29', title: 'Information security during disruption', description: 'Plan for maintaining information security during disruption' },
        { code: 'A.5.30', title: 'ICT readiness for business continuity', description: 'Prepare ICT for business continuity' }
      ],
      cisControls: [
        { code: '11.1', title: 'Establish Data Recovery Process', description: 'Establish and maintain data recovery practices' },
        { code: '11.2', title: 'Perform Automated Backups', description: 'Perform automated backups of important data' },
        { code: '11.3', title: 'Protect Recovery Data', description: 'Protect recovery data with equivalent controls to original data' },
        { code: '11.4', title: 'Establish Recovery Time and Point Objectives', description: 'Establish recovery time and point objectives' },
        { code: '11.5', title: 'Test Data Recovery', description: 'Test data recovery to verify backup integrity' }
      ]
    }
  },
  {
    id: 'compliance-audit',
    category: '17. Incident Response Management',
    auditReadyUnified: {
      title: 'Incident Response Management Framework',
      description: 'Comprehensive incident response and management covering detection, response, and recovery',
      subRequirements: [
        'a) Designate personnel to manage incident handling with backup coverage',
        'b) Establish and maintain contact information for reporting incidents',
        'c) Establish enterprise process for workforce to report security incidents',
        'd) Establish and maintain incident response process and procedures',
        'e) Assign key roles and responsibilities for incident response team',
        'f) Define mechanisms for communicating during incident response',
        'g) Conduct routine incident response exercises and training',
        'h) Conduct post-incident reviews to improve response processes'
      ]
    },
    frameworks: {
      iso27001: [],
      iso27002: [
        { code: 'A.5.25', title: 'Assessment and decision on information security events', description: 'Assess and decide on classification of information security events' },
        { code: 'A.5.26', title: 'Response to information security incidents', description: 'Respond to information security incidents according to documented procedures' },
        { code: 'A.5.27', title: 'Learning from information security incidents', description: 'Knowledge gained from information security incidents shall be used' }
      ],
      cisControls: [
        { code: '17.1', title: 'Designate Personnel to Manage Incident Handling', description: 'Designate one key person and at least one backup to manage incident handling' },
        { code: '17.2', title: 'Establish and Maintain Contact Information', description: 'Establish and maintain contact information for reporting incidents' },
        { code: '17.3', title: 'Establish and Maintain Enterprise Process for Reporting Incidents', description: 'Establish process for workforce to report security incidents' },
        { code: '17.4', title: 'Establish and Maintain an Incident Response Process', description: 'Establish and maintain incident response process and procedures' },
        { code: '17.5', title: 'Assign Key Roles and Responsibilities', description: 'Assign key roles and responsibilities for incident response' },
        { code: '17.6', title: 'Define Mechanisms for Communicating During Incident Response', description: 'Define mechanisms for communicating during incident response' },
        { code: '17.7', title: 'Conduct Routine Incident Response Exercises', description: 'Plan and conduct routine incident response exercises' },
        { code: '17.8', title: 'Conduct Post-Incident Reviews', description: 'Conduct post-incident reviews to improve processes' },
        { code: '17.9', title: 'Establish Role-Based Communication Plans', description: 'Establish role-based communication plans' }
      ],
      gdpr: [
        { code: 'Art. 30', title: 'Records of processing activities', description: 'Maintain records of all processing activities' },
        { code: 'Art. 5', title: 'Principles relating to processing of personal data', description: 'Accountability - demonstrate compliance with processing principles' }
      ]
    }
  },
  {
    id: 'malware-protection',
    category: '18. Malware Defenses',
    auditReadyUnified: {
      title: 'Malware Protection & Anti-Virus Controls',
      description: 'Comprehensive malware protection covering detection, prevention, and response',
      subRequirements: [
        'a) Deploy and maintain anti-malware software on all enterprise assets',
        'b) Configure anti-malware software to automatically update signatures',
        'c) Enable real-time scanning and monitoring capabilities',
        'd) Establish procedures for handling malware incidents',
        'e) Implement email and web-based malware filtering',
        'f) Conduct regular malware scans of systems and storage media',
        'g) Train users on malware identification and reporting',
        'h) Maintain centralized management of anti-malware solutions'
      ]
    },
    frameworks: {
      iso27001: [],
      iso27002: [
        { code: 'A.8.7', title: 'Protection against malware', description: 'Detection, prevention and recovery controls should be implemented' }
      ],
      cisControls: [
        { code: '10.1', title: 'Deploy Anti-Malware Software', description: 'Deploy anti-malware software on enterprise assets' },
        { code: '10.2', title: 'Configure Automatic Anti-Malware Signature Updates', description: 'Configure automatic signature updates for anti-malware' },
        { code: '10.3', title: 'Disable Autorun and Autoplay', description: 'Disable autorun and autoplay features on enterprise assets' },
        { code: '10.4', title: 'Configure Anti-Malware to Automatically Update', description: 'Configure anti-malware solutions to automatically update' },
        { code: '10.5', title: 'Enable Anti-Exploitation Features', description: 'Enable anti-exploitation features in anti-malware software' },
        { code: '10.6', title: 'Centrally Manage Anti-Malware Software', description: 'Centrally manage anti-malware software' },
        { code: '10.7', title: 'Use Behavior-Based Anti-Malware Software', description: 'Use behavior-based anti-malware software' }
      ]
    }
  },
  {
    id: 'web-email-security',
    category: '19. Email & Web Browser Protections',
    auditReadyUnified: {
      title: 'Web & Email Security Controls',
      description: 'Comprehensive security for web browsing, email communications, and web-based applications',
      subRequirements: [
        'a) Use only fully supported and updated web browsers and email clients',
        'b) Implement DNS filtering services for all enterprise assets',
        'c) Maintain and enforce network-based URL filtering policies',
        'd) Deploy email security gateways with anti-spam and anti-malware',
        'e) Implement web application firewalls for web-based applications',
        'f) Configure secure email encryption and digital signatures',
        'g) Train users on safe web browsing and email handling practices',
        'h) Monitor web and email traffic for security threats'
      ]
    },
    frameworks: {
      iso27001: [],
      iso27002: [
        { code: 'A.8.23', title: 'Web filtering', description: 'Access to external websites should be managed' }
      ],
      cisControls: [
        { code: '9.1', title: 'Ensure Use of Only Fully Supported Browsers and Email Clients', description: 'Use only fully supported browsers and email clients' },
        { code: '9.2', title: 'Use DNS Filtering Services', description: 'Use DNS filtering services for all enterprise assets' },
        { code: '9.3', title: 'Maintain and Enforce Network-Based URL Filters', description: 'Maintain and enforce network-based URL filters' },
        { code: '9.4', title: 'Restrict Unnecessary or Unauthorized Browser and Email Client Extensions', description: 'Restrict browser and email client extensions' },
        { code: '9.5', title: 'Implement DMARC', description: 'Implement Domain-based Message Authentication, Reporting & Conformance' },
        { code: '9.6', title: 'Block Unnecessary File Types in Email', description: 'Block unnecessary file types in email attachments' },
        { code: '9.7', title: 'Deploy and Maintain Email Server Anti-Malware', description: 'Deploy email server anti-malware protections' }
      ]
    }
  },
  {
    id: 'penetration-testing',
    category: '20. Penetration Testing',
    auditReadyUnified: {
      title: 'Penetration Testing & Security Validation',
      description: 'Comprehensive security testing including penetration tests and red team exercises',
      subRequirements: [
        'a) Conduct regular penetration testing by qualified personnel',
        'b) Perform red team exercises to test detection and response capabilities',
        'c) Test security controls through authorized simulated attacks',
        'd) Validate security architecture through adversarial testing',
        'e) Document and remediate findings from security testing',
        'f) Coordinate testing activities with operational teams',
        'g) Use testing results to improve security posture',
        'h) Maintain testing schedules based on risk assessment'
      ]
    },
    frameworks: {
      iso27001: [],
      iso27002: [],
      cisControls: [
        { code: '18.1', title: 'Establish Penetration Testing Program', description: 'Establish and maintain penetration testing program' },
        { code: '18.2', title: 'Perform Periodic External Penetration Tests', description: 'Perform external penetration tests based on program requirements' },
        { code: '18.3', title: 'Remediate Penetration Test Findings', description: 'Remediate penetration test findings based on program requirements' },
        { code: '18.4', title: 'Validate Security Measures', description: 'Validate security measures through red team exercises' },
        { code: '18.5', title: 'Perform Periodic Internal Penetration Tests', description: 'Perform internal penetration tests based on program requirements' }
      ]
    }
  },
  {
    id: 'audit-log-management',
    category: '21. Audit Log Management',
    auditReadyUnified: {
      title: 'Audit Log Management',
      description: 'Comprehensive audit log collection, storage, and monitoring for security and compliance',
      subRequirements: [
        'a) Establish and maintain audit log management processes',
        'b) Collect audit logs from all enterprise assets',
        'c) Ensure adequate storage capacity for audit logs',
        'd) Standardize time synchronization across enterprise assets',
        'e) Collect detailed audit logs for sensitive activities',
        'f) Collect DNS query audit logs for security monitoring',
        'g) Collect URL request audit logs for web activity monitoring',
        'h) Collect command-line audit logs for privileged activities'
      ]
    },
    frameworks: {
      iso27001: [],
      iso27002: [
        { code: 'A.8.16', title: 'Monitoring activities', description: 'Networks, systems and applications should be monitored' }
      ],
      cisControls: [
        { code: '8.1', title: 'Establish Audit Log Management Process', description: 'Establish and maintain audit log management process' },
        { code: '8.2', title: 'Collect Audit Logs', description: 'Collect audit logs from enterprise assets' },
        { code: '8.3', title: 'Ensure Adequate Audit Log Storage', description: 'Ensure adequate storage for audit logs' },
        { code: '8.4', title: 'Standardize Time Synchronization', description: 'Standardize time synchronization across enterprise assets' },
        { code: '8.5', title: 'Collect Detailed Audit Logs', description: 'Collect detailed audit logs for sensitive activities' },
        { code: '8.6', title: 'Collect DNS Query Audit Logs', description: 'Collect DNS query audit logs' },
        { code: '8.7', title: 'Collect URL Request Audit Logs', description: 'Collect URL request audit logs' },
        { code: '8.8', title: 'Collect Command-Line Audit Logs', description: 'Collect command-line audit logs' }
      ]
    }
  },
  
  // Single comprehensive GDPR compliance group (only shown when GDPR is selected)
  {
    id: 'gdpr-unified',
    category: 'GDPR Unified Compliance',
    auditReadyUnified: {
      title: 'Comprehensive GDPR Data Protection Implementation',
      description: 'Complete GDPR compliance framework covering all essential privacy and data protection requirements',
      subRequirements: [
        'a) Establish lawful basis for all personal data processing activities and maintain processing records',
        'b) Implement consent mechanisms that are freely given, specific, informed and unambiguous',
        'c) Design and implement data protection by design and by default in all systems',
        'd) Establish comprehensive data subject rights fulfillment processes (access, rectification, erasure, portability)',
        'e) Conduct Data Protection Impact Assessments (DPIA) for high-risk processing activities',
        'f) Implement personal data breach detection, notification and response procedures',
        'g) Establish data retention, deletion and cross-border transfer compliance procedures',
        'h) Designate Data Protection Officer (DPO) where required and define responsibilities',
        'i) Implement privacy-enhancing technologies and data minimization principles',
        'j) Establish processor agreements and third-party data protection compliance',
        'k) Implement age verification and parental consent mechanisms for children',
        'l) Design transparent privacy notices and cookie consent management',
        'm) Establish automated decision-making and profiling disclosure procedures',
        'n) Implement data portability and interoperability mechanisms',
        'o) Establish supervisory authority liaison and regulatory compliance monitoring'
      ]
    },
    frameworks: {
      iso27001: [],
      iso27002: [
        { code: 'A.5.34', title: 'Privacy and protection of personally identifiable information', description: 'Ensure privacy and protection of PII' },
        { code: 'A.5.12', title: 'Classification of information', description: 'Information shall be classified according to information security needs' },
        { code: 'A.5.13', title: 'Labelling of information', description: 'An appropriate set of procedures for information labelling shall be developed' },
        { code: 'A.5.14', title: 'Information transfer', description: 'Information transfer rules and procedures shall be in place' },
        { code: 'A.8.10', title: 'Information deletion', description: 'Information stored in information systems should be deleted' },
        { code: 'A.8.11', title: 'Data masking', description: 'Data masking should be used in accordance with policy' },
        { code: 'A.8.12', title: 'Data leakage prevention', description: 'Data leakage prevention measures should be applied' }
      ],
      cisControls: [],
      gdpr: [
        { code: 'Art. 1', title: 'Subject matter and objectives', description: 'Establish framework for protection of natural persons regarding personal data processing' },
        { code: 'Art. 2', title: 'Material scope', description: 'Determine whether processing of personal data falls within scope of GDPR' },
        { code: 'Art. 3', title: 'Territorial scope', description: 'Determine territorial applicability of GDPR to processing activities' },
        { code: 'Art. 5', title: 'Principles relating to processing of personal data', description: 'Personal data shall be processed lawfully, fairly, transparently with purpose limitation and data minimisation' },
        { code: 'Art. 6', title: 'Lawfulness of processing', description: 'Processing shall be lawful only if and to the extent that at least one condition applies' },
        { code: 'Art. 7', title: 'Conditions for consent', description: 'Where processing is based on consent, the controller shall be able to demonstrate consent' },
        { code: 'Art. 8', title: 'Conditions applicable to child\'s consent', description: 'Where child is below age of 16 years, processing shall be lawful only if consent is given by holder of parental responsibility' },
        { code: 'Art. 12', title: 'Transparent information, communication and modalities', description: 'Controller shall provide transparent information about processing to data subjects' },
        { code: 'Art. 13', title: 'Information to be provided where personal data are collected', description: 'Where personal data are collected, controller shall provide specific information to data subject' },
        { code: 'Art. 14', title: 'Information to be provided where personal data have not been obtained', description: 'Where personal data have not been obtained from data subject, controller shall provide information' },
        { code: 'Art. 15', title: 'Right of access by the data subject', description: 'Data subject shall have right to obtain confirmation as to whether personal data are being processed' },
        { code: 'Art. 16', title: 'Right to rectification', description: 'Data subject shall have right to obtain without undue delay rectification of inaccurate personal data' },
        { code: 'Art. 17', title: 'Right to erasure (right to be forgotten)', description: 'Data subject shall have right to obtain erasure of personal data concerning him or her without undue delay' },
        { code: 'Art. 18', title: 'Right to restriction of processing', description: 'Data subject shall have right to obtain restriction of processing where certain conditions apply' },
        { code: 'Art. 20', title: 'Right to data portability', description: 'Data subject shall have right to receive personal data in structured, commonly used format' },
        { code: 'Art. 21', title: 'Right to object', description: 'Data subject shall have right to object to processing of personal data concerning him or her' },
        { code: 'Art. 22', title: 'Automated individual decision-making, including profiling', description: 'Data subject shall have right not to be subject to automated decision-making' },
        { code: 'Art. 24', title: 'Responsibility of the controller', description: 'Controller shall implement appropriate technical and organisational measures to ensure compliance' },
        { code: 'Art. 25', title: 'Data protection by design and by default', description: 'Controller shall implement appropriate technical and organisational measures to ensure processing complies with regulation' },
        { code: 'Art. 28', title: 'Processor', description: 'Where processing is carried out on behalf of controller, controller shall use only processors providing sufficient guarantees' },
        { code: 'Art. 30', title: 'Records of processing activities', description: 'Each controller shall maintain record of processing activities under its responsibility' },
        { code: 'Art. 32', title: 'Security of processing', description: 'Controller and processor shall implement appropriate technical and organisational measures to ensure security' },
        { code: 'Art. 33', title: 'Notification of a personal data breach to the supervisory authority', description: 'Controller shall notify supervisory authority without undue delay and where feasible not later than 72 hours' },
        { code: 'Art. 34', title: 'Communication of a personal data breach to the data subject', description: 'When breach is likely to result in high risk, controller shall communicate breach to data subject without undue delay' },
        { code: 'Art. 35', title: 'Data protection impact assessment', description: 'Where type of processing is likely to result in high risk, controller shall carry out impact assessment' },
        { code: 'Art. 36', title: 'Prior consultation', description: 'Controller shall consult supervisory authority prior to processing where DPIA indicates high risk' },
        { code: 'Art. 37', title: 'Designation of the data protection officer', description: 'Controller and processor shall designate data protection officer in certain cases' },
        { code: 'Art. 44', title: 'General principle for transfers', description: 'Any transfer of personal data to third country shall take place only if conditions are met' },
        { code: 'Art. 46', title: 'Transfers subject to appropriate safeguards', description: 'In absence of adequacy decision, controller may transfer personal data with appropriate safeguards' },
        { code: 'Art. 47', title: 'Binding corporate rules', description: 'Implement binding corporate rules for transfers within multinational corporate groups' },
        { code: 'Art. 48', title: 'Transfers not authorized by Union law', description: 'Prohibition on transfers based on third country judgments or administrative decisions unless authorized' },
        { code: 'Art. 49', title: 'Derogations for specific situations', description: 'Apply specific derogations only where no adequacy decision or appropriate safeguards exist' }
      ]
    }
  }
];

export default function ComplianceSimplification() {
  const navigate = useNavigate();
  const [selectedMapping, setSelectedMapping] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterFramework, setFilterFramework] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Framework selection state
  const [selectedFrameworks, setSelectedFrameworks] = useState({
    iso27001: true,
    iso27002: true,
    cisControls: 'ig3', // 'ig1', 'ig2', 'ig3', or null
    gdpr: false
  });
  
  // AI generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGeneration, setShowGeneration] = useState(false);
  
  // Handle framework selection with AI generation animation
  const handleFrameworkChange = (newFrameworks: typeof selectedFrameworks) => {
    setIsGenerating(true);
    setShowGeneration(true);
    
    // Simulate AI processing time
    setTimeout(() => {
      setSelectedFrameworks(newFrameworks);
      setIsGenerating(false);
      
      // Hide generation animation after showing results
      setTimeout(() => {
        setShowGeneration(false);
      }, 2000);
    }, 2500);
  };

  const exportToCSV = () => {
    // Create CSV data
    const headers = [
      'AuditReady Category',
      'AuditReady Requirement', 
      'Sub-requirement',
      'ISO 27001 Controls',
      'ISO 27002 Controls',
      'CIS Controls',
      'Unified Description'
    ];

    const rows = complianceMapping.flatMap(mapping => 
      mapping.auditReadyUnified.subRequirements.map((subReq) => [
        mapping.category,
        mapping.auditReadyUnified.title,
        subReq,
        mapping.frameworks.iso27001.map(r => `${r.code}: ${r.title}`).join('; '),
        mapping.frameworks.iso27002.map(r => `${r.code}: ${r.title}`).join('; '),
        mapping.frameworks.cisControls.map(r => `${r.code}: ${r.title}`).join('; '),
        mapping.auditReadyUnified.description
      ])
    );

    // Convert to CSV format
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'AuditReady_Compliance_Simplification.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create numbered category options for the filter dropdown
  const categoryOptions = useMemo(() => {
    // Apply same dynamic numbering logic as filteredMappings
    const nonGdprGroups = complianceMapping.filter(mapping => mapping.id !== 'gdpr-unified');
    const gdprGroups = complianceMapping.filter(mapping => mapping.id === 'gdpr-unified');
    
    // Number non-GDPR groups sequentially
    const numberedNonGdpr = nonGdprGroups.map((mapping, index) => {
      const number = String(index + 1).padStart(2, '0');
      return {
        ...mapping,
        category: mapping.category.startsWith(number + '.') ? mapping.category : `${number}. ${mapping.category.replace(/^\d+\.\s*/, '')}`
      };
    });
    
    // Number GDPR groups to come after non-GDPR groups
    const numberedGdpr = gdprGroups.map((mapping) => {
      const number = String(nonGdprGroups.length + 1).padStart(2, '0');
      return {
        ...mapping,
        category: `${number}. ${mapping.category.replace(/^\d+\.\s*/, '')}`
      };
    });
    
    return [...numberedNonGdpr, ...numberedGdpr];
  }, []);

  // Calculate dynamic statistics
  const overviewStats = useMemo(() => {
    // Calculate total maximum requirements across all frameworks (with safe fallbacks)
    const maxRequirements = complianceMapping.reduce((total, mapping) => {
      const iso27001Count = mapping.frameworks?.iso27001?.length || 0;
      const iso27002Count = mapping.frameworks?.iso27002?.length || 0;
      const cisControlsCount = mapping.frameworks?.cisControls?.length || 0;
      const gdprCount = mapping.frameworks?.gdpr?.length || 0;
      
      return total + iso27001Count + iso27002Count + cisControlsCount + gdprCount;
    }, 0);
    
    // Number of unified groups
    const unifiedGroups = complianceMapping.length;
    
    // Calculate reduction metrics with safe fallbacks
    const reduction = maxRequirements - unifiedGroups;
    const reductionPercentage = maxRequirements > 0 ? ((reduction / maxRequirements) * 100).toFixed(1) : '0.0';
    const efficiencyRatio = unifiedGroups > 0 ? Math.round(maxRequirements / unifiedGroups) : 0;
    
    return {
      maxRequirements,
      unifiedGroups,
      reduction,
      reductionPercentage,
      efficiencyRatio
    };
  }, []);

  const filteredMappings = useMemo(() => {
    let filtered = complianceMapping;
    
    // First, filter to show only GDPR group when GDPR is selected, or non-GDPR groups when other frameworks are selected
    if (selectedFrameworks.gdpr && !selectedFrameworks.iso27001 && !selectedFrameworks.iso27002 && !selectedFrameworks.cisControls) {
      // GDPR only - show only the unified GDPR group
      filtered = filtered.filter(mapping => mapping.id === 'gdpr-unified');
    } else if (!selectedFrameworks.gdpr && (selectedFrameworks.iso27001 || selectedFrameworks.iso27002 || selectedFrameworks.cisControls)) {
      // Other frameworks without GDPR - show only non-GDPR groups
      filtered = filtered.filter(mapping => mapping.id !== 'gdpr-unified');
    } else if (selectedFrameworks.gdpr && (selectedFrameworks.iso27001 || selectedFrameworks.iso27002 || selectedFrameworks.cisControls)) {
      // Mixed selection - show all relevant groups
      filtered = complianceMapping;
    } else {
      // Nothing selected - show non-GDPR groups by default
      filtered = filtered.filter(mapping => mapping.id !== 'gdpr-unified');
    }
    
    // Filter by framework selection
    filtered = filtered.map(mapping => {
      // For GDPR group, only show GDPR frameworks
      if (mapping.id === 'gdpr-unified') {
        return selectedFrameworks.gdpr ? mapping : null;
      }
      
      // For non-GDPR groups, filter based on selected frameworks
      const newMapping = {
        ...mapping,
        frameworks: {
          iso27001: selectedFrameworks.iso27001 ? mapping.frameworks.iso27001 : [],
          iso27002: selectedFrameworks.iso27002 ? mapping.frameworks.iso27002 : [],
          gdpr: [], // Never show GDPR in non-GDPR groups
          cisControls: selectedFrameworks.cisControls ? 
            mapping.frameworks.cisControls.filter(control => {
              // Filter CIS controls based on IG level
              const ig3OnlyControls = [
                '1.5', '2.7', '3.13', '3.14', '4.12', '6.8', '8.12', '9.7', 
                '12.8', '13.1', '13.7', '13.8', '13.9', '13.11', 
                '15.5', '15.6', '15.7', '16.12', '16.13', '16.14', 
                '17.9', '18.4', '18.5'
              ];
              
              if (selectedFrameworks.cisControls === 'ig1') {
                // IG1: Exclude IG3-only controls and assume most advanced controls are IG2+
                return !ig3OnlyControls.includes(control.code) && 
                       !control.code.startsWith('13.') && 
                       !control.code.startsWith('16.') && 
                       !control.code.startsWith('17.') && 
                       !control.code.startsWith('18.');
              } else if (selectedFrameworks.cisControls === 'ig2') {
                // IG2: Include IG1 + some advanced controls but exclude IG3-only
                return !ig3OnlyControls.includes(control.code);
              } else if (selectedFrameworks.cisControls === 'ig3') {
                // IG3: Include all controls
                return true;
              }
              return false;
            }) : []
        }
      };
      
      // Only include the mapping if it has at least one framework with controls
      const hasControls = newMapping.frameworks.iso27001.length > 0 || 
                         newMapping.frameworks.iso27002.length > 0 || 
                         newMapping.frameworks.cisControls.length > 0 ||
                         newMapping.frameworks.gdpr.length > 0;
      
      return hasControls ? newMapping : null;
    }).filter(mapping => mapping !== null);
    
    // Filter by traditional framework filter (for backwards compatibility)
    if (filterFramework !== 'all') {
      filtered = filtered.filter(mapping => {
        switch (filterFramework) {
          case 'iso27001':
            return mapping.frameworks.iso27001.length > 0;
          case 'iso27002':
            return mapping.frameworks.iso27002.length > 0;
          case 'cis':
            return mapping.frameworks.cisControls.length > 0;
          case 'gdpr':
            return mapping.frameworks.gdpr.length > 0;
          default:
            return true;
        }
      });
    }
    
    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(mapping => mapping.id === filterCategory);
    }
    
    // Apply dynamic numbering: GDPR always comes last
    const nonGdprGroups = filtered.filter(mapping => mapping.id !== 'gdpr-unified');
    const gdprGroups = filtered.filter(mapping => mapping.id === 'gdpr-unified');
    
    // Number non-GDPR groups sequentially
    const numberedNonGdpr = nonGdprGroups.map((mapping, index) => {
      const number = String(index + 1).padStart(2, '0');
      return {
        ...mapping,
        category: mapping.category.startsWith(number + '.') ? mapping.category : `${number}. ${mapping.category.replace(/^\d+\.\s*/, '')}`
      };
    });
    
    // Number GDPR groups to come after non-GDPR groups
    const numberedGdpr = gdprGroups.map((mapping) => {
      const number = String(nonGdprGroups.length + 1).padStart(2, '0');
      return {
        ...mapping,
        category: `${number}. ${mapping.category.replace(/^\d+\.\s*/, '')}`
      };
    });
    
    return [...numberedNonGdpr, ...numberedGdpr];
  }, [selectedFrameworks, filterFramework, filterCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold">Compliance Simplification</h1>
                  <p className="text-xs sm:text-sm text-white/80 hidden sm:block">How AuditReady AI unifies overlapping compliance requirements</p>
                </div>
              </div>
            </div>
            <Button
              onClick={exportToCSV}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full self-start lg:self-auto"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Export to </span>CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 rounded-2xl">
            <TabsTrigger value="overview" className="flex items-center space-x-1 sm:space-x-2 rounded-xl text-xs sm:text-sm">
              <Eye className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="mapping" className="flex items-center space-x-1 sm:space-x-2 rounded-xl text-xs sm:text-sm">
              <Target className="w-4 h-4" />
              <span>Framework Mapping</span>
            </TabsTrigger>
            <TabsTrigger value="unified" className="flex items-center space-x-1 sm:space-x-2 rounded-xl text-xs sm:text-sm">
              <Zap className="w-4 h-4" />
              <span>Unified Requirements</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Problem Statement */}
            <Card className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-2xl">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">The Compliance Complexity Problem</h2>
                    <p className="text-sm text-white/80 font-normal">Why traditional compliance is overwhelming</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="text-center flex flex-col min-h-[200px]">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl mb-4">
                      <BookOpen className="w-12 h-12 text-red-600 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 h-14 flex items-center justify-center">Overlapping Requirements</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex-1 flex items-center justify-center px-2">
                      Multiple frameworks often have similar requirements with different wording, creating confusion and redundancy.
                    </p>
                  </div>
                  <div className="text-center flex flex-col min-h-[200px]">
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl mb-4">
                      <Users className="w-12 h-12 text-orange-600 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 h-14 flex items-center justify-center">Implementation Confusion</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex-1 flex items-center justify-center px-2">
                      Teams struggle to understand which requirements apply and how to avoid duplicate work across frameworks.
                    </p>
                  </div>
                  <div className="text-center flex flex-col min-h-[200px]">
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl mb-4">
                      <Settings className="w-12 h-12 text-yellow-600 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 h-14 flex items-center justify-center">Resource Inefficiency</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex-1 flex items-center justify-center px-2">
                      Organizations waste time and resources implementing the same control multiple times for different frameworks.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Solution Statement */}
            <Card className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-2xl">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">The AuditReady Solution</h2>
                    <p className="text-sm text-white/80 font-normal">AI-powered compliance unification</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="text-center flex flex-col min-h-[200px]">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl mb-4">
                      <Shield className="w-12 h-12 text-green-600 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 h-14 flex items-center justify-center">Intelligent Unification</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex-1 flex items-center justify-center px-2">
                      Our AI transforms {overviewStats.maxRequirements} scattered requirements from multiple frameworks into just {overviewStats.unifiedGroups} comprehensive requirement groups, reducing complexity by {overviewStats.reductionPercentage}%.
                    </p>
                  </div>
                  <div className="text-center flex flex-col min-h-[200px]">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-4">
                      <CheckCircle className="w-12 h-12 text-blue-600 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 h-14 flex items-center justify-center">Complete Coverage</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex-1 flex items-center justify-center px-2">
                      Every detail from source frameworks is preserved in our unified requirements, ensuring nothing is lost.
                    </p>
                  </div>
                  <div className="text-center flex flex-col min-h-[200px]">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl mb-4">
                      <Target className="w-12 h-12 text-purple-600 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 h-14 flex items-center justify-center">Clear Implementation</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex-1 flex items-center justify-center px-2">
                      Plain language descriptions with actionable sub-requirements make implementation straightforward and effective.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { 
                  value: `${overviewStats.maxRequirements}→${overviewStats.unifiedGroups}`, 
                  label: "Requirements Simplified", 
                  desc: `From ${overviewStats.maxRequirements} scattered requirements to ${overviewStats.unifiedGroups} unified groups`, 
                  color: "blue" 
                },
                { 
                  value: `${overviewStats.reductionPercentage}%`, 
                  label: "Complexity Reduction", 
                  desc: `${overviewStats.reduction} fewer requirements to manage`, 
                  color: "green" 
                },
                { 
                  value: `${overviewStats.efficiencyRatio}:1`, 
                  label: "Efficiency Ratio", 
                  desc: `${overviewStats.efficiencyRatio} traditional requirements per 1 unified group`, 
                  color: "purple" 
                },
                { 
                  value: "100%", 
                  label: "Coverage Maintained", 
                  desc: "All original requirements preserved", 
                  color: "orange" 
                }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex"
                >
                  <Card className="text-center border-2 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow rounded-2xl flex-1">
                    <CardContent className="p-6 flex flex-col min-h-[160px] h-[160px]">
                      <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent h-12 flex items-center justify-center">
                        {stat.value}
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white h-6 flex items-center justify-center mt-2">
                        {stat.label}
                      </div>
                      <div className="flex-1 flex items-start justify-center pt-3">
                        <div className="text-xs text-gray-600 dark:text-gray-400 leading-tight text-center px-1">
                          {stat.desc}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Framework Mapping Tab */}
          <TabsContent value="mapping" className="space-y-6">
            {/* Framework Selection Interface - Enhanced */}
            <div className="relative">
              {/* AI Generation Overlay */}
              <AnimatePresence>
                {showGeneration && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl border-2 border-blue-200 dark:border-blue-800 flex flex-col items-center justify-center"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 180, 360] 
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: isGenerating ? Infinity : 0 
                      }}
                      className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4"
                    >
                      <Zap className="w-8 h-8 text-white" />
                    </motion.div>
                    <motion.h3
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-xl font-semibold text-gray-900 dark:text-white mb-2"
                    >
                      {isGenerating ? 'AI Analyzing Frameworks...' : 'Unified Requirements Generated!'}
                    </motion.h3>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md"
                    >
                      {isGenerating 
                        ? 'Our AI is processing your selected frameworks and creating optimized unified requirements...'
                        : 'Your customized compliance roadmap is ready! Scroll down to see the unified requirements.'
                      }
                    </motion.p>
                    {!isGenerating && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="mt-4 flex items-center space-x-2 text-green-600"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Generation Complete</span>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center space-x-3 text-xl">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Settings className="w-6 h-6 text-blue-600" />
                    </motion.div>
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      AI-Powered Framework Unification
                    </span>
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Select your compliance frameworks and watch our AI instantly generate unified, simplified requirements tailored to your organization
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-8">
                  {/* Framework Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
                    
                    {/* ISO 27001 Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[160px] flex flex-col ${
                        selectedFrameworks.iso27001
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-blue-300'
                      }`}
                      onClick={() => handleFrameworkChange({ ...selectedFrameworks, iso27001: !selectedFrameworks.iso27001 })}
                    >
                      {/* Selected Badge at Top */}
                      {selectedFrameworks.iso27001 && (
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-blue-500 text-white px-2 py-1 text-xs">
                            Selected
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-6">
                        <div className={`p-2 rounded-full ${selectedFrameworks.iso27001 ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <Shield className={`w-5 h-5 ${selectedFrameworks.iso27001 ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <h3 className="font-semibold text-base h-6 flex items-center justify-center">ISO 27001</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-2">Information Security Management System</p>
                        </div>
                      </div>
                      {selectedFrameworks.iso27001 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.div>

                    {/* ISO 27002 Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[160px] flex flex-col ${
                        selectedFrameworks.iso27002
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg shadow-green-500/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-green-300'
                      }`}
                      onClick={() => handleFrameworkChange({ ...selectedFrameworks, iso27002: !selectedFrameworks.iso27002 })}
                    >
                      {/* Selected Badge at Top */}
                      {selectedFrameworks.iso27002 && (
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-green-500 text-white px-2 py-1 text-xs">
                            Selected
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-6">
                        <div className={`p-2 rounded-full ${selectedFrameworks.iso27002 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <Lock className={`w-5 h-5 ${selectedFrameworks.iso27002 ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <h3 className="font-semibold text-base h-6 flex items-center justify-center">ISO 27002</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-2">Information Security Controls</p>
                        </div>
                      </div>
                      {selectedFrameworks.iso27002 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.div>

                    {/* CIS Controls Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-300 min-h-[160px] flex flex-col ${
                        selectedFrameworks.cisControls
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-500/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {/* Selected Badge at Top */}
                      {selectedFrameworks.cisControls && (
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-purple-500 text-white px-2 py-1 text-xs">
                            Selected
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-6">
                        <div className={`p-2 rounded-full ${selectedFrameworks.cisControls ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <Settings className={`w-5 h-5 ${selectedFrameworks.cisControls ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <h3 className="font-semibold text-base h-6 flex items-center justify-center">CIS Controls</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-2">Cybersecurity Best Practices</p>
                        </div>
                        
                        {/* IG Level Selection */}
                        <div className="space-y-1 w-full">
                          {['ig1', 'ig2', 'ig3'].map((level) => (
                            <motion.button
                              key={level}
                              whileTap={{ scale: 0.95 }}
                              className={`w-full p-1.5 rounded-lg text-xs font-medium transition-all ${
                                selectedFrameworks.cisControls === level
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-purple-100 dark:hover:bg-purple-900/50'
                              }`}
                              onClick={() => handleFrameworkChange({ 
                                ...selectedFrameworks, 
                                cisControls: selectedFrameworks.cisControls === level ? null : level 
                              })}
                            >
                              {level.toUpperCase()} - {level === 'ig1' ? 'Basic' : level === 'ig2' ? 'Foundational' : 'Organizational'}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      {selectedFrameworks.cisControls && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.div>

                    {/* GDPR Card */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 min-h-[160px] flex flex-col ${
                        selectedFrameworks.gdpr
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg shadow-orange-500/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-orange-300'
                      }`}
                      onClick={() => handleFrameworkChange({ ...selectedFrameworks, gdpr: !selectedFrameworks.gdpr })}
                    >
                      {/* Selected Badge at Top */}
                      {selectedFrameworks.gdpr && (
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-orange-500 text-white px-2 py-1 text-xs">
                            Selected
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center text-center space-y-3 flex-1 pt-6">
                        <div className={`p-2 rounded-full ${selectedFrameworks.gdpr ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <BookOpen className={`w-5 h-5 ${selectedFrameworks.gdpr ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <h3 className="font-semibold text-base h-6 flex items-center justify-center">GDPR</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight h-8 flex items-center justify-center px-2">EU Data Protection Regulation</p>
                        </div>
                      </div>
                      {selectedFrameworks.gdpr && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  </div>

                  {/* Quick Selection Presets */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold mb-4 text-center">Quick Presets</h4>
                    <div className="flex flex-wrap justify-center gap-3">
                      {[
                        { name: 'Comprehensive Security', frameworks: { iso27001: true, iso27002: true, cisControls: 'ig3', gdpr: false } },
                        { name: 'Privacy Focused', frameworks: { iso27001: false, iso27002: false, cisControls: null, gdpr: true } },
                        { name: 'EU Compliance', frameworks: { iso27001: true, iso27002: true, cisControls: 'ig2', gdpr: true } },
                        { name: 'Basic Security', frameworks: { iso27001: true, iso27002: false, cisControls: 'ig1', gdpr: false } }
                      ].map((preset) => (
                        <Button
                          key={preset.name}
                          variant="outline"
                          size="sm"
                          onClick={() => handleFrameworkChange(preset.frameworks)}
                          className="hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20"
                        >
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              {/* Framework Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">Filter by Framework:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'All Frameworks', icon: <Target className="w-4 h-4" /> },
                    { id: 'iso27001', label: 'ISO 27001', icon: <Shield className="w-4 h-4" /> },
                    { id: 'iso27002', label: 'ISO 27002', icon: <Lock className="w-4 h-4" /> },
                    { id: 'cis', label: 'CIS Controls', icon: <Settings className="w-4 h-4" /> },
                    { id: 'gdpr', label: 'GDPR', icon: <BookOpen className="w-4 h-4" /> }
                  ].map((filter) => (
                    <Button
                      key={filter.id}
                      variant={filterFramework === filter.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterFramework(filter.id)}
                      className="flex items-center space-x-1 rounded-full"
                    >
                      {filter.icon}
                      <span>{filter.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category Filters */}
              <div className="flex flex-col space-y-2 sm:flex-row sm:flex-wrap sm:gap-4 sm:items-center sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">Filter by Category:</span>
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-[400px] max-w-lg">
                    <SelectValue placeholder="Select a category to filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categoryOptions.map((mapping) => (
                      <SelectItem key={mapping.id} value={mapping.id}>
                        {mapping.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Visual Framework Connections */}
            <div className="space-y-8">
              <AnimatePresence>
                {filteredMappings.map((mapping, index) => (
                  <motion.div
                    key={mapping.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <Card className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                        <CardTitle className="flex items-center space-x-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Target className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold">{mapping.category}</h3>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        {/* Framework Grid - Different layout for GDPR vs other frameworks */}
                        {mapping.id === 'gdpr-unified' ? (
                          /* GDPR-only layout */
                          <div className="border-b border-slate-200 dark:border-slate-700">
                            <div className="p-4 sm:p-6 bg-orange-50 dark:bg-orange-900/10">
                              <div className="flex items-center space-x-2 mb-4">
                                <BookOpen className="w-5 h-5 text-orange-600" />
                                <h4 className="font-semibold text-orange-900 dark:text-orange-100">GDPR Articles</h4>
                              </div>
                              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-100 dark:scrollbar-thumb-orange-600 dark:scrollbar-track-orange-900">
                                {mapping.frameworks.gdpr.map((req, i) => (
                                  <div key={i} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-orange-200 dark:border-orange-700">
                                    <div className="font-medium text-sm text-orange-900 dark:text-orange-100">{req.code}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{req.title}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{req.description}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Regular 3-column layout for ISO/CIS frameworks */
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border-b border-slate-200 dark:border-slate-700">
                          {/* ISO 27001 Column */}
                          <div className="p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-900/10">
                            <div className="flex items-center space-x-2 mb-4">
                              <Shield className="w-5 h-5 text-blue-600" />
                              <h4 className="font-semibold text-blue-900 dark:text-blue-100">ISO 27001</h4>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100 dark:scrollbar-thumb-blue-600 dark:scrollbar-track-blue-900">
                              {mapping.frameworks.iso27001.map((req, i) => (
                                <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700">
                                  <div className="font-medium text-sm text-blue-900 dark:text-blue-100">{req.code}</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">{req.title}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* ISO 27002 Column */}
                          <div className="p-4 sm:p-6 border-b sm:border-b-0 lg:border-r border-slate-200 dark:border-slate-700 bg-green-50 dark:bg-green-900/10">
                            <div className="flex items-center space-x-2 mb-4">
                              <Lock className="w-5 h-5 text-green-600" />
                              <h4 className="font-semibold text-green-900 dark:text-green-100">ISO 27002</h4>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-green-100 dark:scrollbar-thumb-green-600 dark:scrollbar-track-green-900">
                              {mapping.frameworks.iso27002.map((req, i) => (
                                <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-700">
                                  <div className="font-medium text-sm text-green-900 dark:text-green-100">{req.code}</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">{req.title}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* CIS Controls Column */}
                          <div className="p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700 bg-purple-50 dark:bg-purple-900/10">
                            <div className="flex items-center space-x-2 mb-4">
                              <Settings className="w-5 h-5 text-purple-600" />
                              <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                                CIS Controls {selectedFrameworks.cisControls ? selectedFrameworks.cisControls.toUpperCase() : 'IG3'}
                              </h4>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100 dark:scrollbar-thumb-purple-600 dark:scrollbar-track-purple-900">
                              {mapping.frameworks.cisControls.map((req, i) => (
                                <div key={i} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-purple-200 dark:border-purple-700">
                                  <div className="font-medium text-sm text-purple-900 dark:text-purple-100">{req.code}</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">{req.title}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                        )}

                        {/* AuditReady Unified Row */}
                        <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-b border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-1.5 bg-white/20 rounded-lg">
                                <Zap className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-base">AuditReady Unified</h4>
                                <p className="text-xs text-white/90">{mapping.auditReadyUnified.title}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-center bg-white/20 rounded-lg px-3 py-1">
                                <span className="text-xs font-medium block">
                                  {(() => {
                                    if (mapping.id === 'gdpr-unified') {
                                      // For GDPR groups, show GDPR articles count
                                      const totalGdprReqs = mapping.frameworks.gdpr.length;
                                      const unifiedReqs = mapping.auditReadyUnified.subRequirements.length;
                                      const reductionPercent = totalGdprReqs > 1 ? Math.round((1 - unifiedReqs / totalGdprReqs) * 100) : 0;
                                      return `Unifies ${totalGdprReqs} GDPR articles - ${reductionPercent}% simpler`;
                                    } else {
                                      // For regular groups, show framework requirements
                                      const totalFrameworkReqs = 
                                        mapping.frameworks.iso27001.length + 
                                        mapping.frameworks.iso27002.length + 
                                        mapping.frameworks.cisControls.length;
                                      const reductionPercent = totalFrameworkReqs > 1 ? Math.round((1 - 1 / totalFrameworkReqs) * 100) : 0;
                                      return `Replaces ${totalFrameworkReqs} requirements - ${reductionPercent}% reduction`;
                                    }
                                  })()}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedMapping(selectedMapping === mapping.id ? null : mapping.id)}
                                className="text-white hover:bg-white/20 whitespace-nowrap text-xs px-2 py-1 h-auto"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                <span>{selectedMapping === mapping.id ? 'Hide' : 'Show'} Sub-Requirements</span>
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Detailed View */}
                        <AnimatePresence>
                          {selectedMapping === mapping.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="bg-gray-50 dark:bg-gray-800/50"
                            >
                              <div className="p-4 sm:p-6">
                                <h5 className="font-semibold mb-4 text-gray-900 dark:text-white">Unified Sub-Requirements</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mapping.auditReadyUnified.subRequirements.map((subReq, i) => (
                                  <div key={i} className="flex items-start space-x-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{subReq}</span>
                                  </div>
                                ))}
                              </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* Unified Requirements Tab */}
          <TabsContent value="unified" className="space-y-6">
            <Card className="border-2 border-slate-200 dark:border-slate-700 rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-t-2xl">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">AuditReady Unified Requirements</h2>
                    <p className="text-sm text-white/80 font-normal">Simplified, comprehensive compliance requirements</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {/* Framework Unification Introduction */}
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Filter className="w-5 h-5 mr-2 text-blue-600" />
                      Framework Integration Overview
                    </h3>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Generated Requirements</div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {filteredMappings.length}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">unified groups</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    The following unified requirements have been generated by consolidating controls from your selected compliance frameworks:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFrameworks.iso27001 && (
                      <Badge className="bg-blue-500 text-white px-3 py-1">
                        <Shield className="w-3 h-3 mr-1" />
                        ISO 27001
                      </Badge>
                    )}
                    {selectedFrameworks.iso27002 && (
                      <Badge className="bg-green-500 text-white px-3 py-1">
                        <Lock className="w-3 h-3 mr-1" />
                        ISO 27002
                      </Badge>
                    )}
                    {selectedFrameworks.cisControls && (
                      <Badge className="bg-purple-500 text-white px-3 py-1">
                        <Settings className="w-3 h-3 mr-1" />
                        CIS Controls {selectedFrameworks.cisControls.toUpperCase()}
                      </Badge>
                    )}
                    {selectedFrameworks.gdpr && (
                      <Badge className="bg-orange-500 text-white px-3 py-1">
                        <BookOpen className="w-3 h-3 mr-1" />
                        GDPR
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                    Each unified requirement below eliminates duplicate controls and combines overlapping requirements into streamlined, actionable guidelines.
                  </p>
                </div>
                
                <div className="space-y-6">
                  {complianceMapping.map((mapping, index) => (
                    <motion.div
                      key={mapping.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {mapping.auditReadyUnified.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {mapping.auditReadyUnified.description}
                          </p>
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            {mapping.category}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Replaces</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {mapping.frameworks.iso27001.length + mapping.frameworks.iso27002.length + mapping.frameworks.cisControls.length}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">requirements</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">Implementation Guidelines:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {mapping.auditReadyUnified.subRequirements.map((subReq, i) => (
                            <div key={i} className="flex items-start space-x-2 text-sm">
                              <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">{subReq}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}