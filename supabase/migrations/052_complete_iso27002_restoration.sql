-- ============================================================================
-- Complete ISO 27002:2022 Controls Restoration
-- Restore all 93 ISO 27002 controls with correct A.x.x format and short audit guidance
-- ============================================================================

-- First, clean up any existing ISO 27002 entries to start fresh
DELETE FROM requirements_library 
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea';

-- Insert complete ISO 27002:2022 control set (all 93 controls)
INSERT INTO requirements_library (id, standard_id, requirement_code, section, title, official_description, implementation_guidance, audit_ready_guidance, priority, tags, sort_order, created_at, updated_at) VALUES

-- A.5 Organizational controls (37 controls)
(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.1', 'A5', 'Policies for information security', 'Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties, and reviewed at planned intervals and if significant changes occur.', 'Develop and maintain comprehensive information security policies.', '**Purpose**: Provide management direction and support for information security in accordance with business requirements and relevant laws and regulations.
**Implementation**:
• Define comprehensive information security policy approved by management
• Communicate policies to all employees and relevant external parties
• Implement policy acknowledgment process for all personnel
• Review policies regularly and update when significant changes occur', 'high', ARRAY['governance', 'policy', 'management'], 1, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.2', 'A5', 'Information security roles and responsibilities', 'Information security roles and responsibilities shall be defined and allocated according to the organization needs.', 'Define clear information security roles and responsibilities.', '**Purpose**: Ensure information security responsibilities are defined and allocated according to organizational needs.
**Implementation**:
• Document all information security roles and responsibilities
• Assign specific security responsibilities to appropriate personnel
• Ensure role clarity and avoid conflicts of interest
• Regular review and update of role assignments', 'high', ARRAY['governance', 'roles', 'responsibility'], 2, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.3', 'A5', 'Segregation of duties', 'Conflicting duties and areas of responsibility shall be segregated to reduce opportunities for unauthorized or unintentional modification or misuse of the organization''s assets.', 'Implement segregation of duties to prevent conflicts of interest.', '**Purpose**: Reduce opportunities for unauthorized or unintentional modification or misuse of assets.
**Implementation**:
• Identify conflicting duties and segregate them appropriately
• Implement separation between development, testing, and production environments
• Ensure no single person can complete critical processes alone
• Regular review of duty assignments and access rights', 'medium', ARRAY['governance', 'access-control', 'separation'], 3, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.4', 'A5', 'Management responsibilities', 'Management shall require all personnel to apply information security in accordance with the established policies and procedures of the organization.', 'Ensure management commitment to information security requirements.', '**Purpose**: Ensure management requires all personnel to apply information security according to established policies.
**Implementation**:
• Management demonstrates commitment to information security
• Include security responsibilities in job descriptions
• Establish clear accountability for security requirements
• Regular communication of security expectations to all staff', 'high', ARRAY['governance', 'management', 'accountability'], 4, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.5', 'A5', 'Contact with authorities', 'Appropriate contacts with relevant authorities shall be maintained.', 'Maintain contacts with relevant authorities and special interest groups.', '**Purpose**: Maintain appropriate contacts with relevant authorities.
**Implementation**:
• Establish contacts with law enforcement and regulatory authorities
• Maintain relationships with computer emergency response teams
• Document contact procedures for different types of incidents
• Regular review and update of contact information', 'medium', ARRAY['governance', 'contacts', 'authorities'], 5, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.6', 'A5', 'Contact with special interest groups', 'Appropriate contacts with special interest groups or other specialist security forums and professional associations shall be maintained.', 'Maintain contacts with security forums and professional associations.', '**Purpose**: Maintain contacts with special interest groups and security forums.
**Implementation**:
• Join relevant security professional associations
• Participate in industry security forums and threat intelligence sharing
• Maintain contacts with security research communities
• Regular attendance at security conferences and events', 'low', ARRAY['governance', 'networking', 'intelligence'], 6, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.7', 'A5', 'Threat intelligence', 'Information relating to information security threats shall be collected and analyzed to produce threat intelligence.', 'Collect and analyze threat intelligence information.', '**Purpose**: Collect and analyze information about information security threats to produce threat intelligence.
**Implementation**:
• Establish threat intelligence collection processes
• Subscribe to relevant threat intelligence feeds
• Analyze threats relevant to the organization
• Share threat intelligence with relevant stakeholders', 'medium', ARRAY['governance', 'threat-intelligence', 'analysis'], 7, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.8', 'A5', 'Information security in project management', 'Information security shall be integrated into project management.', 'Integrate information security into project management practices.', '**Purpose**: Ensure information security is integrated into project management.
**Implementation**:
• Include security requirements in project initiation
• Conduct security assessments for all projects
• Implement security controls throughout project lifecycle
• Review and approve security aspects before project closure', 'medium', ARRAY['governance', 'project-management', 'integration'], 8, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.9', 'A5', 'Inventory of information and other associated assets', 'An inventory of information and other associated assets, including owners, shall be developed and maintained.', 'Maintain inventory of information and associated assets.', '**Purpose**: Develop and maintain an inventory of information and other associated assets.
**Implementation**:
• Create comprehensive asset inventory including information assets
• Assign ownership for all identified assets
• Classify assets according to their importance
• Regular review and update of asset inventory', 'high', ARRAY['asset-management', 'inventory', 'ownership'], 9, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.10', 'A5', 'Acceptable use of information and other associated assets', 'Rules for the acceptable use of information and other associated assets shall be identified, documented and implemented.', 'Define acceptable use policies for information and assets.', '**Purpose**: Identify and document rules for acceptable use of information and assets.
**Implementation**:
• Develop acceptable use policies for all asset types
• Communicate policies to all users
• Implement monitoring and enforcement mechanisms
• Regular review and update of acceptable use policies', 'medium', ARRAY['governance', 'acceptable-use', 'policies'], 10, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.11', 'A5', 'Return of assets', 'Personnel and other parties shall return all organizational assets in their possession upon termination of their employment, contract or agreement.', 'Ensure return of assets upon termination.', '**Purpose**: Ensure all organizational assets are returned upon termination of employment or contract.
**Implementation**:
• Establish clear procedures for asset return
• Maintain records of assets assigned to individuals
• Implement verification process for returned assets
• Include asset return requirements in employment contracts', 'medium', ARRAY['asset-management', 'termination', 'return'], 11, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.12', 'A5', 'Classification of information', 'Information shall be classified according to the information security needs of the organization based on confidentiality, integrity, availability and relevant interested party requirements.', 'Implement information classification scheme.', '**Purpose**: Classify information according to security needs based on confidentiality, integrity, and availability.
**Implementation**:
• Develop information classification scheme
• Train staff on classification requirements
• Implement labeling and handling procedures
• Regular review of classification assignments', 'high', ARRAY['data-management', 'classification', 'labeling'], 12, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.13', 'A5', 'Labelling of information', 'An appropriate set of procedures for information labelling shall be developed and implemented in accordance with the information classification scheme adopted by the organization.', 'Implement information labelling procedures.', '**Purpose**: Develop and implement procedures for information labelling in accordance with classification scheme.
**Implementation**:
• Create labelling procedures for all information types
• Implement physical and electronic labelling systems
• Train users on labelling requirements
• Monitor compliance with labelling procedures', 'medium', ARRAY['data-management', 'labeling', 'procedures'], 13, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.14', 'A5', 'Information transfer', 'Information transfer rules, procedures or agreements shall be in place for all types of transfer facilities within the organization and between the organization and other parties.', 'Establish secure information transfer procedures.', '**Purpose**: Establish rules and procedures for secure information transfer.
**Implementation**:
• Define secure transfer procedures for all communication types
• Implement encryption for sensitive data transfers
• Establish agreements for external information sharing
• Monitor and log information transfers', 'high', ARRAY['data-management', 'transfer', 'encryption'], 14, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.15', 'A5', 'Access control', 'Rules to control physical and logical access to information and other associated assets shall be established and implemented based on business and information security requirements.', 'Implement access control rules and procedures.', '**Purpose**: Control physical and logical access to information and assets based on business requirements.
**Implementation**:
• Establish access control policies and procedures
• Implement role-based access controls
• Regular review of access rights and permissions
• Monitor and log access to sensitive assets', 'high', ARRAY['access-control', 'authorization', 'monitoring'], 15, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.16', 'A5', 'Identity management', 'The full life cycle of identities shall be managed.', 'Manage complete lifecycle of user identities.', '**Purpose**: Manage the full lifecycle of identities from creation to deletion.
**Implementation**:
• Implement identity lifecycle management processes
• Establish procedures for identity creation, modification, and deletion
• Regular review of identity status and requirements
• Integrate with HR systems for automated lifecycle management', 'high', ARRAY['identity', 'lifecycle', 'management'], 16, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.17', 'A5', 'Authentication information', 'Allocation and management of authentication information shall be controlled by a management process, including advising personnel on appropriate handling of authentication information.', 'Control allocation and management of authentication information.', '**Purpose**: Control allocation and management of authentication information through management processes.
**Implementation**:
• Implement strong authentication policies
• Establish procedures for password/credential management
• Provide training on secure handling of authentication information
• Regular review and rotation of authentication credentials', 'high', ARRAY['identity', 'authentication', 'credentials'], 17, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.18', 'A5', 'Access rights', 'Access rights to information and other associated assets shall be provisioned, reviewed, modified and removed in accordance with the organization''s topic-specific policy on access control.', 'Manage access rights according to access control policy.', '**Purpose**: Provision, review, modify and remove access rights according to access control policy.
**Implementation**:
• Implement formal access provisioning procedures
• Conduct regular access reviews and certifications
• Establish procedures for modifying and removing access
• Document all access right changes and approvals', 'high', ARRAY['access-control', 'provisioning', 'review'], 18, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.19', 'A5', 'Information security in supplier relationships', 'Processes and procedures shall be defined and implemented to manage the information security risks associated with the use of supplier''s products or services.', 'Manage information security risks in supplier relationships.', '**Purpose**: Manage information security risks associated with supplier products and services.
**Implementation**:
• Conduct security assessments of suppliers
• Include security requirements in supplier contracts
• Monitor supplier security performance
• Establish incident response procedures for supplier-related incidents', 'medium', ARRAY['governance', 'suppliers', 'risk-management'], 19, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.20', 'A5', 'Addressing information security within supplier agreements', 'Relevant information security requirements shall be established and agreed with each supplier that can access, process, store, communicate, or provide IT infrastructure components for, the organization''s information.', 'Include security requirements in supplier agreements.', '**Purpose**: Establish information security requirements in agreements with suppliers who handle organizational information.
**Implementation**:
• Define security requirements for different supplier categories
• Include security clauses in all relevant supplier agreements
• Establish right to audit supplier security controls
• Define incident notification and response requirements', 'medium', ARRAY['governance', 'suppliers', 'agreements'], 20, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.21', 'A5', 'Managing information security in the ICT supply chain', 'Processes and procedures shall be defined and implemented to manage the information security risks associated with the ICT products and services supply chain.', 'Manage security risks in ICT supply chain.', '**Purpose**: Manage information security risks in the ICT products and services supply chain.
**Implementation**:
• Assess security risks throughout ICT supply chain
• Implement supply chain security requirements
• Monitor and audit supply chain security practices
• Establish procedures for supply chain incident response', 'medium', ARRAY['governance', 'supply-chain', 'ict'], 21, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.22', 'A5', 'Monitoring, review and change management of supplier services', 'The organization shall regularly monitor, review and audit supplier service delivery.', 'Monitor and review supplier service delivery.', '**Purpose**: Regularly monitor, review and audit supplier service delivery.
**Implementation**:
• Establish supplier monitoring and review procedures
• Conduct regular audits of supplier services
• Implement change management for supplier services
• Track supplier performance against security requirements', 'medium', ARRAY['governance', 'suppliers', 'monitoring'], 22, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.23', 'A5', 'Information security for use of cloud services', 'Processes for the acquisition, use, management and exit from cloud services shall be established in accordance with the organization''s information security requirements.', 'Establish processes for secure cloud service usage.', '**Purpose**: Establish processes for acquisition, use, management and exit from cloud services.
**Implementation**:
• Develop cloud security policies and procedures
• Conduct security assessments of cloud providers
• Implement cloud service management processes
• Plan for secure cloud service exit strategies', 'high', ARRAY['governance', 'cloud', 'services'], 23, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.24', 'A5', 'Information security incident management planning and preparation', 'The organization shall plan and prepare for managing information security incidents by defining, establishing and communicating information security incident management processes, roles and responsibilities.', 'Plan and prepare for incident management.', '**Purpose**: Plan and prepare for managing information security incidents.
**Implementation**:
• Develop incident response plan and procedures
• Establish incident response team with defined roles
• Provide incident response training to relevant personnel
• Test incident response procedures regularly', 'high', ARRAY['incident-response', 'planning', 'preparation'], 24, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.25', 'A5', 'Assessment and decision on information security events', 'The organization shall assess information security events and decide if they are to be categorized as information security incidents.', 'Assess and categorize security events and incidents.', '**Purpose**: Assess information security events and decide if they should be categorized as incidents.
**Implementation**:
• Establish criteria for categorizing security events
• Implement event assessment procedures
• Train staff on event classification
• Document decisions on event categorization', 'medium', ARRAY['incident-response', 'assessment', 'categorization'], 25, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.26', 'A5', 'Response to information security incidents', 'Information security incidents shall be responded to in accordance with the documented procedures.', 'Respond to security incidents according to procedures.', '**Purpose**: Respond to information security incidents according to documented procedures.
**Implementation**:
• Implement incident response procedures
• Establish communication protocols for incidents
• Document all incident response activities
• Conduct post-incident reviews and lessons learned', 'high', ARRAY['incident-response', 'response', 'procedures'], 26, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.27', 'A5', 'Learning from information security incidents', 'Knowledge gained from analyzing and resolving information security incidents shall be used to strengthen and improve the information security controls.', 'Learn from incidents to improve security controls.', '**Purpose**: Use knowledge from incidents to strengthen and improve information security controls.
**Implementation**:
• Conduct thorough post-incident analysis
• Document lessons learned from incidents
• Update security controls based on incident findings
• Share knowledge across the organization', 'medium', ARRAY['incident-response', 'learning', 'improvement'], 27, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.28', 'A5', 'Collection of evidence', 'The organization shall establish and implement procedures for the identification, collection, acquisition and preservation of information that can serve as evidence.', 'Establish procedures for evidence collection.', '**Purpose**: Establish procedures for identification, collection, acquisition and preservation of evidence.
**Implementation**:
• Develop evidence collection procedures
• Train personnel on evidence handling
• Implement chain of custody procedures
• Ensure legal admissibility of collected evidence', 'medium', ARRAY['incident-response', 'evidence', 'forensics'], 28, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.29', 'A5', 'Information security during disruption', 'The organization shall plan how to maintain information security at an appropriate level during disruption.', 'Maintain security during business disruption.', '**Purpose**: Plan how to maintain information security at appropriate level during disruption.
**Implementation**:
• Develop business continuity plans with security considerations
• Identify critical security controls for disruption scenarios
• Test security measures during business continuity exercises
• Train staff on security procedures during disruptions', 'medium', ARRAY['business-continuity', 'disruption', 'security'], 29, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.30', 'A5', 'ICT readiness for business continuity', 'ICT readiness shall be planned, implemented, maintained and tested based on business continuity objectives and ICT continuity requirements.', 'Ensure ICT readiness for business continuity.', '**Purpose**: Plan, implement, maintain and test ICT readiness based on business continuity objectives.
**Implementation**:
• Develop ICT continuity plans aligned with business objectives
• Implement redundant ICT systems and infrastructure
• Regularly test ICT continuity procedures
• Maintain documentation of ICT continuity arrangements', 'high', ARRAY['business-continuity', 'ict', 'readiness'], 30, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.31', 'A5', 'Legal, statutory, regulatory and contractual requirements', 'Legal, statutory, regulatory and contractual requirements relevant to information security and the organization''s approach to meet these requirements shall be identified, documented and kept up to date.', 'Identify and manage legal and regulatory requirements.', '**Purpose**: Identify and manage legal, statutory, regulatory and contractual requirements for information security.
**Implementation**:
• Identify all applicable legal and regulatory requirements
• Document compliance obligations and approaches
• Implement compliance monitoring procedures
• Regularly review and update compliance requirements', 'high', ARRAY['governance', 'compliance', 'legal'], 31, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.32', 'A5', 'Intellectual property rights', 'The organization shall implement appropriate procedures to protect intellectual property rights.', 'Protect intellectual property rights.', '**Purpose**: Implement appropriate procedures to protect intellectual property rights.
**Implementation**:
• Identify and classify intellectual property assets
• Implement protection measures for intellectual property
• Establish procedures for intellectual property usage
• Monitor and enforce intellectual property rights', 'medium', ARRAY['governance', 'intellectual-property', 'protection'], 32, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.33', 'A5', 'Protection of records', 'Records shall be protected from loss, destruction, falsification, unauthorized access and unauthorized release.', 'Protect records from unauthorized access and loss.', '**Purpose**: Protect records from loss, destruction, falsification, unauthorized access and release.
**Implementation**:
• Implement records protection policies and procedures
• Establish access controls for records
• Implement backup and recovery for critical records
• Monitor access to and handling of records', 'medium', ARRAY['data-management', 'records', 'protection'], 33, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.34', 'A5', 'Privacy and protection of PII', 'The organization shall identify and meet requirements regarding the preservation of privacy and protection of PII according to applicable laws and regulations and contractual requirements.', 'Protect privacy and personally identifiable information.', '**Purpose**: Identify and meet requirements for privacy and protection of personally identifiable information.
**Implementation**:
• Identify all PII processing activities
• Implement privacy protection measures and controls
• Establish procedures for handling PII
• Conduct privacy impact assessments', 'high', ARRAY['data-management', 'privacy', 'pii'], 34, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.35', 'A5', 'Independent review of information security', 'The organization''s approach to managing information security and its implementation shall be reviewed independently at planned intervals or when significant changes occur.', 'Conduct independent reviews of information security.', '**Purpose**: Review information security management approach and implementation independently.
**Implementation**:
• Establish independent review procedures
• Conduct regular independent security assessments
• Review security controls and their effectiveness
• Document review findings and recommendations', 'medium', ARRAY['governance', 'review', 'independent'], 35, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.36', 'A5', 'Compliance with policies, procedures and standards for information security', 'Compliance with the organization''s information security policy, topic-specific policies, procedures and standards shall be regularly reviewed.', 'Review compliance with security policies and procedures.', '**Purpose**: Regularly review compliance with information security policies, procedures and standards.
**Implementation**:
• Establish compliance monitoring procedures
• Conduct regular compliance audits and reviews
• Document compliance status and findings
• Implement corrective actions for non-compliance', 'medium', ARRAY['governance', 'compliance', 'monitoring'], 36, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.5.37', 'A5', 'Documented operating procedures', 'Operating procedures for information processing facilities shall be documented and made available to personnel who need them.', 'Document and maintain operating procedures.', '**Purpose**: Document operating procedures for information processing facilities and make them available to personnel.
**Implementation**:
• Document all critical operating procedures
• Ensure procedures are accessible to authorized personnel
• Regularly review and update operating procedures
• Train personnel on documented procedures', 'medium', ARRAY['governance', 'procedures', 'documentation'], 37, NOW(), NOW()),

-- A.6 People controls (8 controls)
(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.6.1', 'A6', 'Screening', 'Background verification checks on all candidates for employment shall be carried out in accordance with relevant laws, regulations and ethics and shall be proportional to the business requirements, the classification of the information to be accessed and the perceived risks.', 'Conduct background screening for employment candidates.', '**Purpose**: Conduct background verification checks proportional to business requirements and perceived risks.
**Implementation**:
• Establish screening procedures for different role categories
• Conduct background checks according to legal requirements
• Document screening results and decisions
• Regular review of screening procedures and requirements', 'medium', ARRAY['human-resources', 'screening', 'verification'], 38, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.6.2', 'A6', 'Terms and conditions of employment', 'The contractual agreements with personnel and contractors shall state their and the organization''s responsibilities for information security.', 'Include security responsibilities in employment terms.', '**Purpose**: State information security responsibilities in contractual agreements with personnel and contractors.
**Implementation**:
• Include security clauses in employment contracts
• Define security responsibilities for different roles
• Ensure contractors sign appropriate security agreements
• Regular review and update of contractual terms', 'medium', ARRAY['human-resources', 'contracts', 'responsibilities'], 39, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.6.3', 'A6', 'Information security awareness, education and training', 'Personnel of the organization and relevant interested parties shall receive appropriate information security awareness, education and training and regular updates in organizational policies and procedures, as relevant for their job function.', 'Provide security awareness, education and training.', '**Purpose**: Provide appropriate information security awareness, education and training to personnel.
**Implementation**:
• Develop comprehensive security awareness program
• Provide role-specific security training
• Conduct regular security awareness updates
• Measure effectiveness of training programs', 'high', ARRAY['awareness', 'training', 'education'], 40, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.6.4', 'A6', 'Disciplinary process', 'A disciplinary process shall be formalized and communicated to take actions against personnel who have committed an information security breach.', 'Establish disciplinary process for security breaches.', '**Purpose**: Formalize and communicate disciplinary process for information security breaches.
**Implementation**:
• Develop formal disciplinary procedures for security violations
• Communicate disciplinary policy to all personnel
• Train managers on disciplinary procedures
• Document disciplinary actions and lessons learned', 'medium', ARRAY['human-resources', 'discipline', 'breach'], 41, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.6.5', 'A6', 'Information security responsibilities after termination or change of employment', 'Information security responsibilities and duties that remain valid after termination or change of employment shall be defined, enforced and communicated to relevant personnel and other interested parties.', 'Define post-employment security responsibilities.', '**Purpose**: Define information security responsibilities that remain valid after termination or employment change.
**Implementation**:
• Define ongoing security obligations for former employees
• Include post-employment obligations in contracts
• Communicate ongoing responsibilities during termination process
• Monitor compliance with post-employment obligations', 'medium', ARRAY['human-resources', 'termination', 'obligations'], 42, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.6.6', 'A6', 'Confidentiality or non-disclosure agreements', 'Confidentiality or non-disclosure agreements reflecting the organization''s needs for the protection of information shall be identified, documented, regularly reviewed and signed by personnel and other relevant interested parties.', 'Implement confidentiality and non-disclosure agreements.', '**Purpose**: Implement confidentiality agreements reflecting organizational needs for information protection.
**Implementation**:
• Develop appropriate confidentiality agreements
• Ensure all relevant parties sign confidentiality agreements
• Regularly review and update agreement terms
• Monitor compliance with confidentiality obligations', 'medium', ARRAY['governance', 'confidentiality', 'agreements'], 43, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.6.7', 'A6', 'Remote working', 'Security measures shall be implemented when personnel are working remotely to protect information accessed, processed or stored outside the organization''s premises.', 'Implement security measures for remote working.', '**Purpose**: Implement security measures for remote working to protect information outside organizational premises.
**Implementation**:
• Develop remote working security policies
• Provide secure remote access solutions
• Implement endpoint security for remote devices
• Monitor and manage remote working security', 'high', ARRAY['remote-work', 'security', 'access'], 44, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.6.8', 'A6', 'Information security event reporting', 'The organization shall provide a mechanism for personnel to report observed or suspected information security events through appropriate channels in a timely manner.', 'Provide mechanism for reporting security events.', '**Purpose**: Provide mechanism for personnel to report observed or suspected information security events.
**Implementation**:
• Establish security event reporting procedures
• Provide multiple reporting channels
• Train personnel on what and how to report
• Ensure timely response to reported events', 'high', ARRAY['incident-response', 'reporting', 'communication'], 45, NOW(), NOW()),

-- A.7 Physical and environmental security controls (14 controls)
(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.7.1', 'A7', 'Physical security perimeters', 'Physical security perimeters for areas containing information and other associated assets shall be defined and implemented.', 'Define and implement physical security perimeters.', '**Purpose**: Define and implement physical security perimeters for areas containing information and assets.
**Implementation**:
• Define physical boundaries around sensitive areas
• Implement appropriate perimeter security controls
• Control and monitor perimeter access points
• Regular review of perimeter security effectiveness', 'medium', ARRAY['physical', 'perimeter', 'access'], 46, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.7.2', 'A7', 'Physical entry', 'Areas containing information and other associated assets shall be protected by appropriate entry controls.', 'Implement physical entry controls.', '**Purpose**: Protect areas containing information and assets with appropriate entry controls.
**Implementation**:
• Implement access control systems for physical entry
• Use authentication mechanisms for entry authorization
• Monitor and log physical access to sensitive areas
• Regular review of entry control effectiveness', 'medium', ARRAY['physical', 'access-control', 'entry'], 47, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.7.3', 'A7', 'Protection against environmental threats', 'Protection against environmental threats, such as natural disasters, malicious attack or accidents shall be designed and implemented.', 'Protect against environmental threats.', '**Purpose**: Design and implement protection against environmental threats including natural disasters and attacks.
**Implementation**:
• Assess environmental risks and threats
• Implement appropriate environmental protection measures
• Establish environmental monitoring systems
• Develop response procedures for environmental incidents', 'medium', ARRAY['physical', 'environmental', 'protection'], 48, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.7.4', 'A7', 'Working in secure areas', 'Procedures for working in secure areas shall be designed and implemented.', 'Establish procedures for working in secure areas.', '**Purpose**: Design and implement procedures for working in secure areas.
**Implementation**:
• Define procedures for authorized work in secure areas
• Implement supervision and monitoring in secure areas
• Control materials and equipment in secure areas
• Train personnel on secure area procedures', 'medium', ARRAY['physical', 'procedures', 'secure-areas'], 49, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.7.5', 'A7', 'Protection against physical and environmental threats', 'Protection against physical and environmental threats, such as natural disasters, malicious attack, fire, flood, theft, dust, vibration, chemical effects, electrical supply interference, communications interference, electromagnetic radiation and vandalism, shall be designed and implemented.', 'Protect against physical and environmental threats.', '**Purpose**: Design and implement protection against comprehensive physical and environmental threats.
**Implementation**:
• Conduct comprehensive physical risk assessments
• Implement multiple layers of physical protection
• Establish environmental monitoring and alerting
• Develop incident response for physical threats', 'high', ARRAY['physical', 'environmental', 'threats'], 50, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.7.6', 'A7', 'Working in secure areas', 'Procedures for working in secure areas shall be designed and implemented.', 'Design procedures for secure area operations.', '**Purpose**: Design and implement procedures for working in secure areas.
**Implementation**:
• Establish clear procedures for secure area access
• Implement supervision requirements for secure areas
• Control equipment and materials in secure areas
• Monitor compliance with secure area procedures', 'medium', ARRAY['physical', 'secure-areas', 'procedures'], 51, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.7.7', 'A7', 'Clear desk and clear screen', 'Clear desk rules for papers and removable storage media and clear screen rules for information processing facilities shall be defined and appropriately enforced.', 'Implement clear desk and clear screen policies.', '**Purpose**: Define and enforce clear desk and clear screen rules for information protection.
**Implementation**:
• Establish clear desk and clear screen policies
• Train personnel on clear desk requirements
• Implement automated screen locking mechanisms
• Monitor compliance with clear desk policies', 'medium', ARRAY['physical', 'desk-security', 'screen-protection'], 52, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.7.8', 'A7', 'Equipment siting and protection', 'Equipment shall be sited securely and protected.', 'Secure siting and protection of equipment.', '**Purpose**: Ensure equipment is sited securely and protected from threats.
**Implementation**:
• Assess risks for equipment placement
• Implement physical protection for critical equipment
• Control environmental conditions for equipment
• Monitor equipment security and status', 'medium', ARRAY['physical', 'equipment', 'protection'], 53, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.7.9', 'A7', 'Security of assets off-premises', 'Assets located off-premises shall be protected.', 'Protect assets located off-premises.', '**Purpose**: Protect assets located outside organizational premises.
**Implementation**:
• Identify all off-premises assets and their locations
• Implement appropriate protection measures for off-site assets
• Establish procedures for managing off-premises assets
• Monitor security of off-premises assets', 'medium', ARRAY['physical', 'off-premises', 'assets'], 54, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.7.10', 'A7', 'Storage media', 'Storage media shall be managed in accordance with the classification scheme adopted by the organization.', 'Manage storage media according to classification.', '**Purpose**: Manage storage media according to organizational classification scheme.
**Implementation**:
• Implement storage media handling procedures
• Control access to storage media based on classification
• Establish secure disposal procedures for storage media
• Monitor and track storage media throughout lifecycle', 'medium', ARRAY['physical', 'storage', 'media'], 55, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.7.11', 'A7', 'Supporting utilities', 'Information processing facilities shall be protected from power failures and other disruptions caused by failures in supporting utilities.', 'Protect facilities from utility failures.', '**Purpose**: Protect information processing facilities from power failures and utility disruptions.
**Implementation**:
• Implement redundant power supply systems
• Install uninterruptible power supplies (UPS)
• Establish procedures for utility failure response
• Monitor utility systems and backup power', 'medium', ARRAY['physical', 'utilities', 'power'], 56, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.7.12', 'A7', 'Cabling security', 'Cables carrying power, data or supporting information services shall be protected from interception, interference or damage.', 'Protect cables from interception and damage.', '**Purpose**: Protect cables carrying power, data or information services from threats.
**Implementation**:
• Implement physical protection for cable infrastructure
• Use conduits and cable trays for cable protection
• Monitor cable infrastructure for damage or tampering
• Establish procedures for cable installation and maintenance', 'medium', ARRAY['physical', 'cabling', 'infrastructure'], 57, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.7.13', 'A7', 'Equipment maintenance', 'Equipment shall be maintained correctly to ensure availability, integrity and confidentiality of information.', 'Maintain equipment correctly to ensure security.', '**Purpose**: Maintain equipment correctly to ensure availability, integrity and confidentiality of information.
**Implementation**:
• Establish equipment maintenance schedules and procedures
• Use authorized service providers for equipment maintenance
• Monitor and log equipment maintenance activities
• Verify equipment security after maintenance', 'medium', ARRAY['physical', 'maintenance', 'equipment'], 58, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.7.14', 'A7', 'Secure disposal or reuse of equipment', 'Items of equipment containing storage media shall be verified to ensure that any sensitive data and licensed software has been removed or securely overwritten prior to disposal or reuse.', 'Securely dispose or reuse equipment.', '**Purpose**: Ensure secure disposal or reuse of equipment containing storage media.
**Implementation**:
• Establish procedures for secure equipment disposal
• Implement data sanitization for storage devices
• Verify complete data removal before disposal or reuse
• Maintain records of equipment disposal and data sanitization', 'high', ARRAY['physical', 'disposal', 'data-sanitization'], 59, NOW(), NOW()),

-- A.8 Technology controls (34 controls)
(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.1', 'A8', 'User endpoint devices', 'Information stored on, processed by or accessible via user endpoint devices shall be protected.', 'Protect user endpoint devices and information.', '**Purpose**: Protect information stored on, processed by or accessible via user endpoint devices.
**Implementation**:
• Implement endpoint protection solutions
• Control and monitor endpoint device configurations
• Establish procedures for endpoint device management
• Monitor endpoint security status and compliance', 'high', ARRAY['endpoint', 'protection', 'devices'], 60, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.2', 'A8', 'Privileged access rights', 'The allocation and use of privileged access rights shall be restricted and controlled.', 'Control privileged access rights.', '**Purpose**: Restrict and control allocation and use of privileged access rights.
**Implementation**:
• Implement privileged access management (PAM) solutions
• Establish procedures for privileged access allocation
• Monitor and audit privileged access usage
• Regular review of privileged access assignments', 'high', ARRAY['access-control', 'privileged', 'management'], 61, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.3', 'A8', 'Information access restriction', 'Access to information and application system functions shall be restricted in accordance with the access control policy.', 'Restrict information access according to policy.', '**Purpose**: Restrict access to information and application functions according to access control policy.
**Implementation**:
• Implement access control mechanisms
• Enforce principle of least privilege
• Monitor and audit information access
• Regular review of access permissions', 'high', ARRAY['access-control', 'restriction', 'policy'], 62, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.4', 'A8', 'Access to source code', 'Read and write access to source code, development tools and software libraries shall be appropriately managed.', 'Manage access to source code and development tools.', '**Purpose**: Appropriately manage access to source code, development tools and software libraries.
**Implementation**:
• Implement source code access controls
• Use version control systems with access management
• Monitor and audit source code access
• Establish procedures for development tool access', 'medium', ARRAY['development', 'source-code', 'access'], 63, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.5', 'A8', 'Secure authentication', 'Secure authentication technologies and procedures shall be implemented based on information access restrictions and the topic-specific policy on access control.', 'Implement secure authentication technologies.', '**Purpose**: Implement secure authentication technologies and procedures based on access restrictions.
**Implementation**:
• Deploy multi-factor authentication (MFA)
• Implement strong authentication policies
• Use secure authentication protocols
• Monitor authentication activities and failures', 'high', ARRAY['authentication', 'security', 'mfa'], 64, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.6', 'A8', 'Capacity management', 'The use of resources shall be monitored and adjusted in line with current and expected capacity requirements.', 'Monitor and manage system capacity.', '**Purpose**: Monitor and adjust resource usage according to current and expected capacity requirements.
**Implementation**:
• Implement capacity monitoring and alerting
• Establish capacity planning procedures
• Monitor system performance and resource utilization
• Plan for capacity scaling and upgrades', 'medium', ARRAY['capacity', 'monitoring', 'performance'], 65, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.7', 'A8', 'Protection against malware', 'Protection against malware shall be implemented and supported by appropriate user awareness.', 'Implement protection against malware.', '**Purpose**: Implement malware protection supported by appropriate user awareness.
**Implementation**:
• Deploy comprehensive anti-malware solutions
• Implement email and web filtering
• Provide user awareness training on malware threats
• Monitor and respond to malware incidents', 'high', ARRAY['malware', 'protection', 'awareness'], 66, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.8', 'A8', 'Management of technical vulnerabilities', 'Information about technical vulnerabilities of information systems in use shall be obtained, the organization''s exposure to such vulnerabilities evaluated and appropriate measures taken.', 'Manage technical vulnerabilities.', '**Purpose**: Obtain information about technical vulnerabilities and evaluate organizational exposure.
**Implementation**:
• Implement vulnerability scanning and assessment
• Establish vulnerability management procedures
• Monitor security advisories and threat intelligence
• Prioritize and remediate vulnerabilities based on risk', 'high', ARRAY['vulnerability', 'management', 'assessment'], 67, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.9', 'A8', 'Configuration management', 'Configurations, including security configurations, of hardware, software, services and networks shall be established, documented, implemented, monitored and reviewed.', 'Implement configuration management.', '**Purpose**: Establish, document, implement, monitor and review configurations including security configurations.
**Implementation**:
• Implement configuration management processes
• Document baseline configurations for all systems
• Monitor configuration changes and compliance
• Regular review of configuration standards', 'medium', ARRAY['configuration', 'management', 'baseline'], 68, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.10', 'A8', 'Information deletion', 'Information stored in information systems, devices or in any other storage media shall be deleted when no longer required.', 'Delete information when no longer required.', '**Purpose**: Delete information stored in systems and devices when no longer required.
**Implementation**:
• Establish data retention and deletion policies
• Implement automated data deletion procedures
• Securely delete sensitive data using appropriate methods
• Monitor compliance with data deletion requirements', 'medium', ARRAY['data-management', 'deletion', 'retention'], 69, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.11', 'A8', 'Data masking', 'Data masking shall be used in accordance with the organization''s topic-specific policy on access control and other related topic-specific policies, and business requirements, taking applicable legislation into consideration.', 'Implement data masking according to policy.', '**Purpose**: Use data masking in accordance with access control policy and business requirements.
**Implementation**:
• Develop data masking policies and procedures
• Implement data masking for non-production environments
• Use appropriate masking techniques for different data types
• Monitor and audit data masking activities', 'medium', ARRAY['data-management', 'masking', 'privacy'], 70, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.12', 'A8', 'Data leakage prevention', 'Data leakage prevention measures shall be applied to systems, networks and any other devices that process, store or transmit sensitive information.', 'Implement data leakage prevention measures.', '**Purpose**: Apply data leakage prevention measures to systems, networks and devices handling sensitive information.
**Implementation**:
• Implement data loss prevention (DLP) solutions
• Monitor data transfers and communications
• Establish policies for data handling and transmission
• Respond to data leakage incidents promptly', 'high', ARRAY['data-management', 'dlp', 'prevention'], 71, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.13', 'A8', 'Information backup', 'Backup copies of information, software and systems shall be maintained and regularly tested in accordance with the agreed topic-specific policy on backup.', 'Maintain and test information backups.', '**Purpose**: Maintain and regularly test backup copies of information, software and systems.
**Implementation**:
• Implement comprehensive backup strategies
• Regularly test backup and restore procedures
• Store backups in secure, geographically diverse locations
• Monitor backup operations and verify data integrity', 'high', ARRAY['backup', 'recovery', 'testing'], 72, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.14', 'A8', 'Redundancy of information processing facilities', 'Information processing facilities shall be implemented with sufficient redundancy to meet availability requirements.', 'Implement redundancy for processing facilities.', '**Purpose**: Implement sufficient redundancy in information processing facilities to meet availability requirements.
**Implementation**:
• Design redundant system architectures
• Implement failover and load balancing mechanisms
• Test redundancy and failover procedures regularly
• Monitor system availability and performance', 'medium', ARRAY['redundancy', 'availability', 'failover'], 73, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.15', 'A8', 'Logging', 'Logs that record activities, exceptions, faults and other relevant events shall be produced, stored, protected and analyzed.', 'Implement comprehensive logging and analysis.', '**Purpose**: Produce, store, protect and analyze logs of activities, exceptions, faults and relevant events.
**Implementation**:
• Implement comprehensive logging across all systems
• Centralize log collection and storage
• Protect logs from unauthorized access and modification
• Analyze logs for security incidents and anomalies', 'high', ARRAY['logging', 'monitoring', 'analysis'], 74, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.16', 'A8', 'Monitoring activities', 'Networks, systems and applications shall be monitored for anomalous behaviour and appropriate actions taken to evaluate potential information security incidents.', 'Monitor systems for anomalous behavior.', '**Purpose**: Monitor networks, systems and applications for anomalous behavior to evaluate potential security incidents.
**Implementation**:
• Implement security information and event management (SIEM)
• Deploy network and system monitoring tools
• Establish baselines for normal system behavior
• Investigate and respond to detected anomalies', 'high', ARRAY['monitoring', 'siem', 'anomaly-detection'], 75, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.17', 'A8', 'Clock synchronisation', 'The clocks of information processing systems used by the organization shall be synchronised to approved time sources.', 'Synchronize system clocks to approved sources.', '**Purpose**: Synchronize clocks of information processing systems to approved time sources.
**Implementation**:
• Implement Network Time Protocol (NTP) synchronization
• Use reliable and secure time sources
• Monitor clock synchronization across all systems
• Establish procedures for time source management', 'low', ARRAY['time', 'synchronization', 'ntp'], 76, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.18', 'A8', 'Use of privileged utility programs', 'The use of utility programs that might be capable of overriding system and application controls shall be restricted and tightly controlled.', 'Control use of privileged utility programs.', '**Purpose**: Restrict and control use of utility programs capable of overriding system controls.
**Implementation**:
• Identify and inventory privileged utility programs
• Implement strict access controls for utility programs
• Monitor and audit utility program usage
• Establish approval procedures for utility program use', 'medium', ARRAY['utilities', 'privileged', 'control'], 77, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.19', 'A8', 'Installation of software on operational systems', 'Procedures shall be implemented to control the installation of software on operational systems.', 'Control software installation on operational systems.', '**Purpose**: Implement procedures to control software installation on operational systems.
**Implementation**:
• Establish software installation approval procedures
• Implement application whitelisting and control
• Monitor and audit software installations
• Test software in controlled environments before deployment', 'medium', ARRAY['software', 'installation', 'control'], 78, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.20', 'A8', 'Networks security management', 'Networks and network devices shall be managed and controlled to protect information in systems and applications.', 'Manage and control network security.', '**Purpose**: Manage and control networks and network devices to protect information in systems and applications.
**Implementation**:
• Implement network security management procedures
• Configure network devices with security controls
• Monitor network traffic and security events
• Regular review of network security configurations', 'high', ARRAY['network', 'management', 'security'], 79, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.21', 'A8', 'Security of network services', 'Security mechanisms, service levels and management requirements of network services shall be identified and included in network services agreements, whether these services are provided in-house or outsourced.', 'Secure network services and agreements.', '**Purpose**: Identify security mechanisms and requirements for network services in service agreements.
**Implementation**:
• Define security requirements for network services
• Include security clauses in network service agreements
• Monitor network service security performance
• Regular review of network service security', 'medium', ARRAY['network', 'services', 'agreements'], 80, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.22', 'A8', 'Segregation of networks', 'Groups of information services, users and information systems shall be segregated on networks.', 'Implement network segregation.', '**Purpose**: Segregate groups of information services, users and systems on networks.
**Implementation**:
• Design network segmentation architecture
• Implement VLANs and network access controls
• Control traffic between network segments
• Monitor and audit network segregation effectiveness', 'high', ARRAY['network', 'segregation', 'segmentation'], 81, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.23', 'A8', 'Web filtering', 'Access to external websites shall be managed to reduce exposure to malicious content.', 'Implement web filtering to reduce malicious exposure.', '**Purpose**: Manage access to external websites to reduce exposure to malicious content.
**Implementation**:
• Deploy web filtering solutions
• Categorize and block access to malicious websites
• Monitor web traffic for security threats
• Provide user awareness on web security risks', 'medium', ARRAY['Email & Web Browser Protections', 'filtering', 'malicious-content'], 82, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.24', 'A8', 'Use of cryptography', 'Rules for the effective use of cryptography, including cryptographic key management, shall be defined and implemented.', 'Define rules for effective use of cryptography.', '**Purpose**: Define and implement rules for effective use of cryptography including key management.
**Implementation**:
• Develop cryptographic policies and standards
• Implement proper cryptographic key management
• Use strong encryption algorithms and protocols
• Monitor and audit cryptographic implementations', 'high', ARRAY['cryptography', 'encryption', 'key-management'], 83, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.25', 'A8', 'Secure system development life cycle', 'Rules for the secure development of software and systems shall be established and applied.', 'Establish secure system development lifecycle.', '**Purpose**: Establish and apply rules for secure development of software and systems.
**Implementation**:
• Implement secure software development lifecycle (SSDLC)
• Include security requirements in development processes
• Conduct security testing and code reviews
• Train developers on secure coding practices', 'high', ARRAY['development', 'sdlc', 'security'], 84, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.26', 'A8', 'Application security requirements', 'Information security requirements shall be identified, specified and approved when developing or acquiring applications.', 'Identify security requirements for applications.', '**Purpose**: Identify, specify and approve information security requirements when developing or acquiring applications.
**Implementation**:
• Define security requirements for application development
• Include security requirements in procurement processes
• Conduct security assessments of applications
• Approve security requirements before implementation', 'high', ARRAY['application', 'requirements', 'security'], 85, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.27', 'A8', 'Secure system architecture and engineering principles', 'Principles for engineering secure systems shall be established, documented, maintained and applied to any information system development activities.', 'Establish secure system architecture principles.', '**Purpose**: Establish principles for engineering secure systems and apply to development activities.
**Implementation**:
• Define secure architecture and engineering principles
• Document security design patterns and standards
• Apply principles to all system development activities
• Review and update principles regularly', 'medium', ARRAY['architecture', 'engineering', 'principles'], 86, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.28', 'A8', 'Secure coding', 'Secure coding principles shall be applied to software development.', 'Apply secure coding principles to development.', '**Purpose**: Apply secure coding principles to software development.
**Implementation**:
• Establish secure coding standards and guidelines
• Provide secure coding training for developers
• Implement code review processes for security
• Use static and dynamic code analysis tools', 'high', ARRAY['development', 'coding', 'security'], 87, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.29', 'A8', 'Security testing in development and acceptance', 'Security testing processes shall be defined and implemented in the development life cycle.', 'Implement security testing in development lifecycle.', '**Purpose**: Define and implement security testing processes in the development lifecycle.
**Implementation**:
• Include security testing in development processes
• Conduct vulnerability assessments and penetration testing
• Implement automated security testing tools
• Validate security controls before production deployment', 'high', ARRAY['development', 'testing', 'security'], 88, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.30', 'A8', 'Outsourced development', 'The organization shall direct, monitor and review the activities related to outsourced system development.', 'Direct and monitor outsourced development activities.', '**Purpose**: Direct, monitor and review activities related to outsourced system development.
**Implementation**:
• Establish security requirements for outsourced development
• Monitor compliance with security requirements
• Conduct security reviews of outsourced development
• Include security clauses in outsourcing contracts', 'medium', ARRAY['development', 'outsourcing', 'monitoring'], 89, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.31', 'A8', 'Separation of development, testing and operational environments', 'Development, testing and operational environments shall be separated to reduce the risks of unauthorized access or changes to the operational environment.', 'Separate development, testing and operational environments.', '**Purpose**: Separate development, testing and operational environments to reduce unauthorized access risks.
**Implementation**:
• Implement logical and physical separation of environments
• Control data flow between environments
• Restrict access to production environments
• Monitor activities across different environments', 'high', ARRAY['development', 'environment', 'separation'], 90, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.32', 'A8', 'Change management', 'Changes to information processing facilities and information systems shall be subject to change management procedures.', 'Implement change management procedures.', '**Purpose**: Subject changes to information processing facilities and systems to change management procedures.
**Implementation**:
• Establish formal change management processes
• Require approval for all changes to systems
• Test changes in controlled environments
• Monitor and audit change implementation', 'medium', ARRAY['change-management', 'procedures', 'control'], 91, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.33', 'A8', 'Test information', 'Test information shall be appropriately selected, protected and controlled.', 'Select, protect and control test information.', '**Purpose**: Appropriately select, protect and control test information.
**Implementation**:
• Establish procedures for test data selection and protection
• Use data masking for sensitive test data
• Control access to test information
• Securely dispose of test data after use', 'medium', ARRAY['testing', 'data', 'protection'], 92, NOW(), NOW()),

(gen_random_uuid(), '8508cfb0-3457-4226-b39a-851be52ef7ea', 'A.8.34', 'A8', 'Protection of information systems during audit testing', 'Audit tests and other assurance activities involving assessment of operational systems shall be planned and agreed between the tester and appropriate management.', 'Protect systems during audit testing.', '**Purpose**: Plan and agree audit tests and assurance activities to protect operational systems.
**Implementation**:
• Plan audit testing to minimize operational impact
• Obtain management approval for audit activities
• Monitor audit testing for system impact
• Implement safeguards to protect systems during testing', 'medium', ARRAY['audit', 'testing', 'protection'], 93, NOW(), NOW());

-- Update the standard to indicate completion
UPDATE standards_library 
SET description = 'Code of practice for information security controls that provides guidance on implementing information security controls. Complete with all 93 controls restored.'
WHERE id = '8508cfb0-3457-4226-b39a-851be52ef7ea';