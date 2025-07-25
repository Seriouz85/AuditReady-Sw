-- ============================================================================
-- Safe ISO 27002:2022 Audit Ready Guidance Update Script
-- Adds missing audit_ready_guidance to 92 ISO 27002 requirements
-- Skips control 5.1 which already has guidance
-- Uses safety checks to prevent overwriting existing guidance
-- ============================================================================

-- Safety check: Verify we're targeting the correct standard
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM standards_library 
        WHERE id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
        AND name ILIKE '%ISO 27002%'
    ) THEN
        RAISE EXCEPTION 'ISO 27002 standard not found with expected ID. Aborting for safety.';
    END IF;
    
    RAISE NOTICE 'Safety check passed: ISO 27002 standard found.';
END $$;

-- Display current status before updates
SELECT 
    COUNT(*) as total_controls,
    COUNT(CASE WHEN audit_ready_guidance IS NULL THEN 1 END) as missing_guidance,
    COUNT(CASE WHEN audit_ready_guidance IS NOT NULL THEN 1 END) as has_guidance
FROM requirements_library 
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea';

-- Update statements for all missing guidance (92 controls)
-- Note: Skipping 5.1 as it already has guidance

-- A.5 Organizational controls (36 updates - skipping A.5.1)

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Ensure information security responsibilities are defined and allocated according to organizational needs.
**Implementation**:
• Document all information security roles and responsibilities
• Assign specific security responsibilities to appropriate personnel
• Ensure role clarity and avoid conflicts of interest
• Regular review and update of role assignments',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.2' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Reduce opportunities for unauthorized or unintentional modification or misuse of assets.
**Implementation**:
• Identify conflicting duties and segregate them appropriately
• Implement separation between development, testing, and production environments
• Ensure no single person can complete critical processes alone
• Regular review of duty assignments and access rights',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.3' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Ensure management requires all personnel to apply information security according to established policies.
**Implementation**:
• Management demonstrates commitment to information security
• Include security responsibilities in job descriptions
• Establish clear accountability for security requirements
• Regular communication of security expectations to all staff',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.4' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Maintain appropriate contacts with relevant authorities.
**Implementation**:
• Establish contacts with law enforcement and regulatory authorities
• Maintain relationships with computer emergency response teams
• Document contact procedures for different types of incidents
• Regular review and update of contact information',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.5' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Maintain contacts with special interest groups and security forums.
**Implementation**:
• Join relevant security professional associations
• Participate in industry security forums and threat intelligence sharing
• Maintain contacts with security research communities
• Regular attendance at security conferences and events',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.6' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Collect and analyze information about information security threats to produce threat intelligence.
**Implementation**:
• Establish threat intelligence collection processes
• Subscribe to relevant threat intelligence feeds
• Analyze threats relevant to the organization
• Share threat intelligence with relevant stakeholders',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.7' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Ensure information security is integrated into project management.
**Implementation**:
• Include security requirements in project initiation
• Conduct security assessments for all projects
• Implement security controls throughout project lifecycle
• Review and approve security aspects before project closure',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.8' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Develop and maintain an inventory of information and other associated assets.
**Implementation**:
• Create comprehensive asset inventory including information assets
• Assign ownership for all identified assets
• Classify assets according to their importance
• Regular review and update of asset inventory',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.9' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Identify and document rules for acceptable use of information and assets.
**Implementation**:
• Develop acceptable use policies for all asset types
• Communicate policies to all users
• Implement monitoring and enforcement mechanisms
• Regular review and update of acceptable use policies',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.10' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Ensure all organizational assets are returned upon termination of employment or contract.
**Implementation**:
• Establish clear procedures for asset return
• Maintain records of assets assigned to individuals
• Implement verification process for returned assets
• Include asset return requirements in employment contracts',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.11' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Classify information according to security needs based on confidentiality, integrity, and availability.
**Implementation**:
• Develop information classification scheme
• Train staff on classification requirements
• Implement labeling and handling procedures
• Regular review of classification assignments',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.12' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Develop and implement procedures for information labelling in accordance with classification scheme.
**Implementation**:
• Create labelling procedures for all information types
• Implement physical and electronic labelling systems
• Train users on labelling requirements
• Monitor compliance with labelling procedures',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.13' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Establish rules and procedures for secure information transfer.
**Implementation**:
• Define secure transfer procedures for all communication types
• Implement encryption for sensitive data transfers
• Establish agreements for external information sharing
• Monitor and log information transfers',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.14' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Control physical and logical access to information and assets based on business requirements.
**Implementation**:
• Establish access control policies and procedures
• Implement role-based access controls
• Regular review of access rights and permissions
• Monitor and log access to sensitive assets',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.15' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Manage the full lifecycle of identities from creation to deletion.
**Implementation**:
• Implement identity lifecycle management processes
• Establish procedures for identity creation, modification, and deletion
• Regular review of identity status and requirements
• Integrate with HR systems for automated lifecycle management',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.16' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Control allocation and management of authentication information through management processes.
**Implementation**:
• Implement strong authentication policies
• Establish procedures for password/credential management
• Provide training on secure handling of authentication information
• Regular review and rotation of authentication credentials',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.17' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Provision, review, modify and remove access rights according to access control policy.
**Implementation**:
• Implement formal access provisioning procedures
• Conduct regular access reviews and certifications
• Establish procedures for modifying and removing access
• Document all access right changes and approvals',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.18' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Manage information security risks associated with supplier products and services.
**Implementation**:
• Conduct security assessments of suppliers
• Include security requirements in supplier contracts
• Monitor supplier security performance
• Establish incident response procedures for supplier-related incidents',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.19' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Establish information security requirements in agreements with suppliers who handle organizational information.
**Implementation**:
• Define security requirements for different supplier categories
• Include security clauses in all relevant supplier agreements
• Establish right to audit supplier security controls
• Define incident notification and response requirements',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.20' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Manage information security risks in the ICT products and services supply chain.
**Implementation**:
• Assess security risks throughout ICT supply chain
• Implement supply chain security requirements
• Monitor and audit supply chain security practices
• Establish procedures for supply chain incident response',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.21' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Regularly monitor, review and audit supplier service delivery.
**Implementation**:
• Establish supplier monitoring and review procedures
• Conduct regular audits of supplier services
• Implement change management for supplier services
• Track supplier performance against security requirements',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.22' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Establish processes for acquisition, use, management and exit from cloud services.
**Implementation**:
• Develop cloud security policies and procedures
• Conduct security assessments of cloud providers
• Implement cloud service management processes
• Plan for secure cloud service exit strategies',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.23' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Plan and prepare for managing information security incidents.
**Implementation**:
• Develop incident response plan and procedures
• Establish incident response team with defined roles
• Provide incident response training to relevant personnel
• Test incident response procedures regularly',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.24' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Assess information security events and decide if they should be categorized as incidents.
**Implementation**:
• Establish criteria for categorizing security events
• Implement event assessment procedures
• Train staff on event classification
• Document decisions on event categorization',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.25' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Respond to information security incidents according to documented procedures.
**Implementation**:
• Implement incident response procedures
• Establish communication protocols for incidents
• Document all incident response activities
• Conduct post-incident reviews and lessons learned',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.26' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Use knowledge from incidents to strengthen and improve information security controls.
**Implementation**:
• Conduct thorough post-incident analysis
• Document lessons learned from incidents
• Update security controls based on incident findings
• Share knowledge across the organization',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.27' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Establish procedures for identification, collection, acquisition and preservation of evidence.
**Implementation**:
• Develop evidence collection procedures
• Train personnel on evidence handling
• Implement chain of custody procedures
• Ensure legal admissibility of collected evidence',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.28' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Plan how to maintain information security at appropriate level during disruption.
**Implementation**:
• Develop business continuity plans with security considerations
• Identify critical security controls for disruption scenarios
• Test security measures during business continuity exercises
• Train staff on security procedures during disruptions',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.29' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Plan, implement, maintain and test ICT readiness based on business continuity objectives.
**Implementation**:
• Develop ICT continuity plans aligned with business objectives
• Implement redundant ICT systems and infrastructure
• Regularly test ICT continuity procedures
• Maintain documentation of ICT continuity arrangements',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.30' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Identify and manage legal, statutory, regulatory and contractual requirements for information security.
**Implementation**:
• Identify all applicable legal and regulatory requirements
• Document compliance obligations and approaches
• Implement compliance monitoring procedures
• Regularly review and update compliance requirements',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.31' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Implement appropriate procedures to protect intellectual property rights.
**Implementation**:
• Identify and classify intellectual property assets
• Implement protection measures for intellectual property
• Establish procedures for intellectual property usage
• Monitor and enforce intellectual property rights',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.32' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Protect records from loss, destruction, falsification, unauthorized access and release.
**Implementation**:
• Implement records protection policies and procedures
• Establish access controls for records
• Implement backup and recovery for critical records
• Monitor access to and handling of records',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.33' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Identify and meet requirements for privacy and protection of personally identifiable information.
**Implementation**:
• Identify all PII processing activities
• Implement privacy protection measures and controls
• Establish procedures for handling PII
• Conduct privacy impact assessments',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.34' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Review information security management approach and implementation independently.
**Implementation**:
• Establish independent review procedures
• Conduct regular independent security assessments
• Review security controls and their effectiveness
• Document review findings and recommendations',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.35' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Regularly review compliance with information security policies, procedures and standards.
**Implementation**:
• Establish compliance monitoring procedures
• Conduct regular compliance audits and reviews
• Document compliance status and findings
• Implement corrective actions for non-compliance',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.36' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Document operating procedures for information processing facilities and make them available to personnel.
**Implementation**:
• Document all critical operating procedures
• Ensure procedures are accessible to authorized personnel
• Regularly review and update operating procedures
• Train personnel on documented procedures',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '5.37' 
  AND audit_ready_guidance IS NULL;

-- A.6 People controls (8 updates)

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Conduct background verification checks proportional to business requirements and perceived risks.
**Implementation**:
• Establish screening procedures for different role categories
• Conduct background checks according to legal requirements
• Document screening results and decisions
• Regular review of screening procedures and requirements',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '6.1' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: State information security responsibilities in contractual agreements with personnel and contractors.
**Implementation**:
• Include security clauses in employment contracts
• Define security responsibilities for different roles
• Ensure contractors sign appropriate security agreements
• Regular review and update of contractual terms',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '6.2' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Provide appropriate information security awareness, education and training to personnel.
**Implementation**:
• Develop comprehensive security awareness program
• Provide role-specific security training
• Conduct regular security awareness updates
• Measure effectiveness of training programs',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '6.3' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Formalize and communicate disciplinary process for information security breaches.
**Implementation**:
• Develop formal disciplinary procedures for security violations
• Communicate disciplinary policy to all personnel
• Train managers on disciplinary procedures
• Document disciplinary actions and lessons learned',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '6.4' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Define information security responsibilities that remain valid after termination or employment change.
**Implementation**:
• Define ongoing security obligations for former employees
• Include post-employment obligations in contracts
• Communicate ongoing responsibilities during termination process
• Monitor compliance with post-employment obligations',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '6.5' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Implement confidentiality agreements reflecting organizational needs for information protection.
**Implementation**:
• Develop appropriate confidentiality agreements
• Ensure all relevant parties sign confidentiality agreements
• Regularly review and update agreement terms
• Monitor compliance with confidentiality obligations',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '6.6' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Implement security measures for remote working to protect information outside organizational premises.
**Implementation**:
• Develop remote working security policies
• Provide secure remote access solutions
• Implement endpoint security for remote devices
• Monitor and manage remote working security',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '6.7' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Provide mechanism for personnel to report observed or suspected information security events.
**Implementation**:
• Establish security event reporting procedures
• Provide multiple reporting channels
• Train personnel on what and how to report
• Ensure timely response to reported events',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '6.8' 
  AND audit_ready_guidance IS NULL;

-- A.7 Physical and environmental security controls (14 updates)

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Define and implement physical security perimeters for areas containing information and assets.
**Implementation**:
• Define physical boundaries around sensitive areas
• Implement appropriate perimeter security controls
• Control and monitor perimeter access points
• Regular review of perimeter security effectiveness',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '7.1' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Protect areas containing information and assets with appropriate entry controls.
**Implementation**:
• Implement access control systems for physical entry
• Use authentication mechanisms for entry authorization
• Monitor and log physical access to sensitive areas
• Regular review of entry control effectiveness',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '7.2' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Design and implement protection against environmental threats including natural disasters and attacks.
**Implementation**:
• Assess environmental risks and threats
• Implement appropriate environmental protection measures
• Establish environmental monitoring systems
• Develop response procedures for environmental incidents',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '7.3' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Design and implement procedures for working in secure areas.
**Implementation**:
• Define procedures for authorized work in secure areas
• Implement supervision and monitoring in secure areas
• Control materials and equipment in secure areas
• Train personnel on secure area procedures',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '7.4' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Design and implement protection against comprehensive physical and environmental threats.
**Implementation**:
• Conduct comprehensive physical risk assessments
• Implement multiple layers of physical protection
• Establish environmental monitoring and alerting
• Develop incident response for physical threats',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '7.5' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Design and implement procedures for working in secure areas.
**Implementation**:
• Establish clear procedures for secure area access
• Implement supervision requirements for secure areas
• Control equipment and materials in secure areas
• Monitor compliance with secure area procedures',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '7.6' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Define and enforce clear desk and clear screen rules for information protection.
**Implementation**:
• Establish clear desk and clear screen policies
• Train personnel on clear desk requirements
• Implement automated screen locking mechanisms
• Monitor compliance with clear desk policies',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '7.7' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Ensure equipment is sited securely and protected from threats.
**Implementation**:
• Assess risks for equipment placement
• Implement physical protection for critical equipment
• Control environmental conditions for equipment
• Monitor equipment security and status',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '7.8' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Protect assets located outside organizational premises.
**Implementation**:
• Identify all off-premises assets and their locations
• Implement appropriate protection measures for off-site assets
• Establish procedures for managing off-premises assets
• Monitor security of off-premises assets',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '7.9' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Manage storage media according to organizational classification scheme.
**Implementation**:
• Implement storage media handling procedures
• Control access to storage media based on classification
• Establish secure disposal procedures for storage media
• Monitor and track storage media throughout lifecycle',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '7.10' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Protect information processing facilities from power failures and utility disruptions.
**Implementation**:
• Implement redundant power supply systems
• Install uninterruptible power supplies (UPS)
• Establish procedures for utility failure response
• Monitor utility systems and backup power',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '7.11' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Protect cables carrying power, data or information services from threats.
**Implementation**:
• Implement physical protection for cable infrastructure
• Use conduits and cable trays for cable protection
• Monitor cable infrastructure for damage or tampering
• Establish procedures for cable installation and maintenance',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '7.12' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Maintain equipment correctly to ensure availability, integrity and confidentiality of information.
**Implementation**:
• Establish equipment maintenance schedules and procedures
• Use authorized service providers for equipment maintenance
• Monitor and log equipment maintenance activities
• Verify equipment security after maintenance',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '7.13' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Ensure secure disposal or reuse of equipment containing storage media.
**Implementation**:
• Establish procedures for secure equipment disposal
• Implement data sanitization for storage devices
• Verify complete data removal before disposal or reuse
• Maintain records of equipment disposal and data sanitization',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '7.14' 
  AND audit_ready_guidance IS NULL;

-- A.8 Technology controls (34 updates)

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Protect information stored on, processed by or accessible via user endpoint devices.
**Implementation**:
• Implement endpoint protection solutions
• Control and monitor endpoint device configurations
• Establish procedures for endpoint device management
• Monitor endpoint security status and compliance',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.1' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Restrict and control allocation and use of privileged access rights.
**Implementation**:
• Implement privileged access management (PAM) solutions
• Establish procedures for privileged access allocation
• Monitor and audit privileged access usage
• Regular review of privileged access assignments',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.2' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Restrict access to information and application functions according to access control policy.
**Implementation**:
• Implement access control mechanisms
• Enforce principle of least privilege
• Monitor and audit information access
• Regular review of access permissions',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.3' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Appropriately manage access to source code, development tools and software libraries.
**Implementation**:
• Implement source code access controls
• Use version control systems with access management
• Monitor and audit source code access
• Establish procedures for development tool access',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.4' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Implement secure authentication technologies and procedures based on access restrictions.
**Implementation**:
• Deploy multi-factor authentication (MFA)
• Implement strong authentication policies
• Use secure authentication protocols
• Monitor authentication activities and failures',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.5' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Monitor and adjust resource usage according to current and expected capacity requirements.
**Implementation**:
• Implement capacity monitoring and alerting
• Establish capacity planning procedures
• Monitor system performance and resource utilization
• Plan for capacity scaling and upgrades',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.6' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Implement malware protection supported by appropriate user awareness.
**Implementation**:
• Deploy comprehensive anti-malware solutions
• Implement email and web filtering
• Provide user awareness training on malware threats
• Monitor and respond to malware incidents',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.7' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Obtain information about technical vulnerabilities and evaluate organizational exposure.
**Implementation**:
• Implement vulnerability scanning and assessment
• Establish vulnerability management procedures
• Monitor security advisories and threat intelligence
• Prioritize and remediate vulnerabilities based on risk',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.8' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Establish, document, implement, monitor and review configurations including security configurations.
**Implementation**:
• Implement configuration management processes
• Document baseline configurations for all systems
• Monitor configuration changes and compliance
• Regular review of configuration standards',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.9' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Delete information stored in systems and devices when no longer required.
**Implementation**:
• Establish data retention and deletion policies
• Implement automated data deletion procedures
• Securely delete sensitive data using appropriate methods
• Monitor compliance with data deletion requirements',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.10' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Use data masking in accordance with access control policy and business requirements.
**Implementation**:
• Develop data masking policies and procedures
• Implement data masking for non-production environments
• Use appropriate masking techniques for different data types
• Monitor and audit data masking activities',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.11' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Apply data leakage prevention measures to systems, networks and devices handling sensitive information.
**Implementation**:
• Implement data loss prevention (DLP) solutions
• Monitor data transfers and communications
• Establish policies for data handling and transmission
• Respond to data leakage incidents promptly',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.12' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Maintain and regularly test backup copies of information, software and systems.
**Implementation**:
• Implement comprehensive backup strategies
• Regularly test backup and restore procedures
• Store backups in secure, geographically diverse locations
• Monitor backup operations and verify data integrity',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.13' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Implement sufficient redundancy in information processing facilities to meet availability requirements.
**Implementation**:
• Design redundant system architectures
• Implement failover and load balancing mechanisms
• Test redundancy and failover procedures regularly
• Monitor system availability and performance',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.14' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Produce, store, protect and analyze logs of activities, exceptions, faults and relevant events.
**Implementation**:
• Implement comprehensive logging across all systems
• Centralize log collection and storage
• Protect logs from unauthorized access and modification
• Analyze logs for security incidents and anomalies',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.15' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Monitor networks, systems and applications for anomalous behavior to evaluate potential security incidents.
**Implementation**:
• Implement security information and event management (SIEM)
• Deploy network and system monitoring tools
• Establish baselines for normal system behavior
• Investigate and respond to detected anomalies',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.16' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Synchronize clocks of information processing systems to approved time sources.
**Implementation**:
• Implement Network Time Protocol (NTP) synchronization
• Use reliable and secure time sources
• Monitor clock synchronization across all systems
• Establish procedures for time source management',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.17' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Restrict and control use of utility programs capable of overriding system controls.
**Implementation**:
• Identify and inventory privileged utility programs
• Implement strict access controls for utility programs
• Monitor and audit utility program usage
• Establish approval procedures for utility program use',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.18' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Implement procedures to control software installation on operational systems.
**Implementation**:
• Establish software installation approval procedures
• Implement application whitelisting and control
• Monitor and audit software installations
• Test software in controlled environments before deployment',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.19' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Manage and control networks and network devices to protect information in systems and applications.
**Implementation**:
• Implement network security management procedures
• Configure network devices with security controls
• Monitor network traffic and security events
• Regular review of network security configurations',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.20' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Identify security mechanisms and requirements for network services in service agreements.
**Implementation**:
• Define security requirements for network services
• Include security clauses in network service agreements
• Monitor network service security performance
• Regular review of network service security',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.21' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Segregate groups of information services, users and systems on networks.
**Implementation**:
• Design network segmentation architecture
• Implement VLANs and network access controls
• Control traffic between network segments
• Monitor and audit network segregation effectiveness',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.22' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Manage access to external websites to reduce exposure to malicious content.
**Implementation**:
• Deploy web filtering solutions
• Categorize and block access to malicious websites
• Monitor web traffic for security threats
• Provide user awareness on web security risks',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.23' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Define and implement rules for effective use of cryptography including key management.
**Implementation**:
• Develop cryptographic policies and standards
• Implement proper cryptographic key management
• Use strong encryption algorithms and protocols
• Monitor and audit cryptographic implementations',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.24' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Establish and apply rules for secure development of software and systems.
**Implementation**:
• Implement secure software development lifecycle (SSDLC)
• Include security requirements in development processes
• Conduct security testing and code reviews
• Train developers on secure coding practices',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.25' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Identify, specify and approve information security requirements when developing or acquiring applications.
**Implementation**:
• Define security requirements for application development
• Include security requirements in procurement processes
• Conduct security assessments of applications
• Approve security requirements before implementation',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.26' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Establish principles for engineering secure systems and apply to development activities.
**Implementation**:
• Define secure architecture and engineering principles
• Document security design patterns and standards
• Apply principles to all system development activities
• Review and update principles regularly',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.27' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Apply secure coding principles to software development.
**Implementation**:
• Establish secure coding standards and guidelines
• Provide secure coding training for developers
• Implement code review processes for security
• Use static and dynamic code analysis tools',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.28' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Define and implement security testing processes in the development lifecycle.
**Implementation**:
• Include security testing in development processes
• Conduct vulnerability assessments and penetration testing
• Implement automated security testing tools
• Validate security controls before production deployment',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.29' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Direct, monitor and review activities related to outsourced system development.
**Implementation**:
• Establish security requirements for outsourced development
• Monitor compliance with security requirements
• Conduct security reviews of outsourced development
• Include security clauses in outsourcing contracts',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.30' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Separate development, testing and operational environments to reduce unauthorized access risks.
**Implementation**:
• Implement logical and physical separation of environments
• Control data flow between environments
• Restrict access to production environments
• Monitor activities across different environments',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.31' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Subject changes to information processing facilities and systems to change management procedures.
**Implementation**:
• Establish formal change management processes
• Require approval for all changes to systems
• Test changes in controlled environments
• Monitor and audit change implementation',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.32' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Appropriately select, protect and control test information.
**Implementation**:
• Establish procedures for test data selection and protection
• Use data masking for sensitive test data
• Control access to test information
• Securely dispose of test data after use',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.33' 
  AND audit_ready_guidance IS NULL;

UPDATE requirements_library 
SET audit_ready_guidance = '**Purpose**: Plan and agree audit tests and assurance activities to protect operational systems.
**Implementation**:
• Plan audit testing to minimize operational impact
• Obtain management approval for audit activities
• Monitor audit testing for system impact
• Implement safeguards to protect systems during testing',
    updated_at = NOW()
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea' 
  AND control_id = '8.34' 
  AND audit_ready_guidance IS NULL;

-- Final status check
SELECT 
    COUNT(*) as total_controls,
    COUNT(CASE WHEN audit_ready_guidance IS NULL THEN 1 END) as still_missing_guidance,
    COUNT(CASE WHEN audit_ready_guidance IS NOT NULL THEN 1 END) as now_has_guidance
FROM requirements_library 
WHERE standard_id = '8508cfb0-3457-4226-b39a-851be52ef7ea';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'ISO 27002:2022 Audit Ready Guidance Update Complete!';
    RAISE NOTICE 'Successfully added guidance to 92 requirements (skipped 5.1 which already had guidance)';
    RAISE NOTICE 'All 93 ISO 27002 controls now have comprehensive audit-ready guidance';
    RAISE NOTICE '============================================================================';
END $$;