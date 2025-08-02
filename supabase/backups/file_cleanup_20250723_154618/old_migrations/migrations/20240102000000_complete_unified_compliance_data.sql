-- ============================================================================
-- Complete Unified Compliance Data Migration
-- Populates all 22 compliance categories with their requirements
-- ============================================================================

-- First, clear existing data to ensure clean state
DELETE FROM unified_requirement_mappings;
DELETE FROM unified_requirements;
DELETE FROM unified_compliance_categories;

-- Insert all 22 unified categories
INSERT INTO unified_compliance_categories (name, description, sort_order, icon) VALUES
('Governance & Leadership', 'Comprehensive governance framework with leadership commitment and organizational structure', 1, 'Shield'),
('Risk Management', 'Comprehensive risk assessment, treatment, and monitoring framework', 2, 'Target'),
('Inventory and Control of Software Assets', 'Comprehensive software asset management including inventory, licensing, and allowlisting', 3, 'FileSpreadsheet'),
('Inventory and Control of Hardware Assets', 'Comprehensive hardware asset management including inventory, tracking, and lifecycle management', 4, 'Settings'),
('Access Control', 'Unified access control framework covering identity lifecycle, authentication, and authorization', 5, 'Lock'),
('Data Protection', 'Comprehensive data protection including classification, handling, encryption, and privacy', 6, 'Shield'),
('Secure Configuration', 'Enterprise-wide secure configuration management for all assets and systems', 7, 'Settings'),
('Vulnerability Management', 'Comprehensive vulnerability management including assessment, patching, and remediation', 8, 'Eye'),
('Physical Security', 'Comprehensive physical security covering facilities, equipment, and environmental controls', 9, 'Building'),
('Network Security', 'Comprehensive network security including infrastructure protection, monitoring, and secure communications', 10, 'Network'),
('Secure Development', 'Comprehensive secure development practices covering SDLC, testing, and deployment', 11, 'Code'),
('Incident Response', 'Comprehensive incident response covering detection, analysis, containment, and recovery', 12, 'AlertTriangle'),
('Network Defense', 'Comprehensive network monitoring, intrusion detection, and network defense capabilities', 13, 'Shield'),
('Supplier Risk', 'Comprehensive supplier and third-party risk management including vendor relationships and cloud services', 14, 'Users'),
('Security Awareness', 'Comprehensive security awareness and training program covering all aspects of cybersecurity education', 15, 'BookOpen'),
('Business Continuity', 'Comprehensive business continuity planning covering disruption management and recovery capabilities', 16, 'RefreshCw'),
('Incident Management', 'Comprehensive incident response and management covering detection, response, and recovery', 17, 'AlertCircle'),
('Malware Defense', 'Comprehensive malware protection covering detection, prevention, and response', 18, 'Bug'),
('Email & Web Security', 'Comprehensive security for web browsing, email communications, and web-based applications', 19, 'Globe'),
('Penetration Testing', 'Comprehensive security testing including penetration tests and red team exercises', 20, 'Target'),
('Audit Logging', 'Comprehensive audit log collection, storage, and monitoring for security and compliance', 21, 'FileText'),
('GDPR Unified Compliance', 'Complete GDPR compliance framework covering all essential privacy and data protection requirements', 22, 'Lock');

-- Now insert unified requirements for each category
-- This is done using a PL/pgSQL block to handle the relationships properly

DO $$
DECLARE
    cat_id UUID;
    req_id UUID;
BEGIN
    -- 1. Governance & Leadership
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Governance & Leadership';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Information Security Governance & Leadership',
        'Comprehensive governance framework with leadership commitment and organizational structure',
        ARRAY[
            'a) UNIFIED POLICY FRAMEWORK: Establish comprehensive information security policy that satisfies ISO 27001 leadership requirements, ISO 27002 policy controls, GDPR data protection principles, and NIS2 governance measures - ensuring top management commitment and regulatory compliance across all frameworks',
            'b) UNIFIED GOVERNANCE STRUCTURE: Define integrated governance with clear roles, responsibilities, and authorities that address ISO 27001 ISMS scope, ISO 27002 organizational controls, GDPR controller/processor responsibilities, and NIS2 cybersecurity governance requirements including management approval of cybersecurity risk policies (Art. 21(2)(a)), management responsibilities for implementation (Art. 21(2)(f)), and board oversight of cybersecurity strategy',
            'c) UNIFIED RISK MANAGEMENT: Implement consolidated risk assessment and treatment processes that satisfy ISO 27001 risk management (clauses 6.1.2, 6.1.3, 8.2, 8.3), ISO 27002 threat intelligence collection (A.5.7), GDPR data protection impact assessments (Art. 35, 36), and NIS2 cybersecurity risk management measures including risk analysis policies (Art. 21(2)(a)) and effectiveness assessment procedures (Art. 21(2)(g))',
            'd) UNIFIED COMPLIANCE MONITORING: Establish integrated audit, monitoring, and review processes that meet ISO 27001 internal audit requirements, ISO 27002 independent reviews, GDPR compliance monitoring, and NIS2 effectiveness assessment obligations',
            'e) UNIFIED DOCUMENTATION SYSTEM: Maintain comprehensive documentation framework that satisfies ISO 27001 documented information requirements, ISO 27002 operating procedures, GDPR records of processing, and NIS2 policy documentation mandates',
            'f) UNIFIED STAKEHOLDER ENGAGEMENT: Establish consolidated communication with authorities, special interest groups, and relevant parties as required by ISO 27002 contacts, GDPR supervisory authority relations, and NIS2 incident reporting obligations',
            'g) UNIFIED CONTINUOUS IMPROVEMENT: Implement integrated improvement processes that address ISO 27001 continual improvement, ISO 27002 learning from incidents, GDPR regular review requirements, and NIS2 effectiveness evaluation measures',
            'h) SCREENING: Conduct background verification checks on candidates for employment, contractors, and third-party users in accordance with applicable laws, regulations, and ethical considerations, proportional to business requirements, data classification, and perceived risks'
        ],
        1
    );

    -- 2. Risk Management
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Risk Management';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Information Security Risk Management',
        'Comprehensive risk assessment, treatment, and monitoring framework',
        ARRAY[
            'a) UNIFIED RISK IDENTIFICATION: Establish comprehensive risk assessment process that integrates GDPR data processing risk identification and NIS2 cybersecurity threat analysis into one systematic approach',
            'b) UNIFIED RISK EVALUATION: Implement consolidated risk analysis methodology that addresses both quantitative and qualitative assessment criteria, satisfying GDPR data protection impact assessment requirements and NIS2 cybersecurity risk evaluation measures',
            'c) UNIFIED RISK TREATMENT: Develop integrated risk treatment strategy that implements appropriate technical and organizational measures satisfying ISO 27002 controls, GDPR Article 32 security requirements, and NIS2 cybersecurity risk management measures',
            'd) UNIFIED RISK MONITORING: Establish continuous risk monitoring and effectiveness assessment process that meets NIS2 Article 21(2)(g) effectiveness evaluation requirements and GDPR regular review obligations'
        ],
        1
    );

    -- 3. Inventory and Control of Software Assets
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Inventory and Control of Software Assets';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Software Asset Inventory and Control',
        'Comprehensive software asset management including inventory, licensing, and allowlisting',
        ARRAY[
            'a) Maintain accurate and detailed inventory of all software assets',
            'b) Address unauthorized software within defined timeframes',
            'c) Utilize automated software inventory tools and processes',
            'd) Use technical controls to enforce software allowlisting',
            'e) Allowlist authorized software libraries and dependencies',
            'f) Allowlist authorized scripts and executables',
            'g) Control installation of software on operational systems',
            'h) Manage software licensing and compliance'
        ],
        1
    );

    -- 4. Inventory and Control of Hardware Assets
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Inventory and Control of Hardware Assets';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Inventory and Control of Hardware Assets',
        'Comprehensive hardware asset management including inventory, tracking, and lifecycle management',
        ARRAY[
            'a) Maintain accurate and up-to-date hardware asset inventories',
            'b) Classify hardware assets based on criticality and sensitivity',
            'c) Assign ownership and responsibility for all hardware assets',
            'd) Implement secure hardware configuration management',
            'e) Track hardware asset lifecycle from acquisition to disposal',
            'f) Monitor and address unauthorized hardware assets',
            'g) Establish hardware asset maintenance and support procedures',
            'h) Implement hardware asset return procedures for personnel changes'
        ],
        1
    );

    -- 5. Access Control
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Access Control';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Identity & Access Management',
        'Unified access control framework covering identity lifecycle, authentication, and authorization',
        ARRAY[
            'a) Implement comprehensive identity lifecycle management',
            'b) Establish role-based access control (RBAC) policies',
            'c) Enforce multi-factor authentication for privileged accounts',
            'd) Conduct regular access reviews and certification',
            'e) Implement privileged access management (PAM) solutions',
            'f) Monitor and log all access control activities',
            'g) Establish emergency access procedures',
            'h) Control physical and logical access to information assets'
        ],
        1
    );

    -- 6. Data Protection
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Data Protection';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Data Protection & Cryptographic Controls',
        'Comprehensive data protection including classification, handling, encryption, and privacy',
        ARRAY[
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
        ],
        1
    );

    -- 7. Secure Configuration
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Secure Configuration';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Secure Configuration Management',
        'Enterprise-wide secure configuration management for all assets and systems',
        ARRAY[
            'a) Establish and maintain secure configurations for all enterprise assets',
            'b) Establish secure configurations for mobile devices and BYOD',
            'c) Configure automatic session locking on all enterprise assets',
            'd) Implement and manage firewalls on servers and workstations',
            'e) Maintain configuration baselines and monitor configuration drift',
            'f) Implement automated configuration management tools',
            'g) Document and approve all configuration changes',
            'h) Regularly audit and validate system configurations'
        ],
        1
    );

    -- 8. Vulnerability Management
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Vulnerability Management';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Continuous Vulnerability Management',
        'Comprehensive vulnerability management including assessment, patching, and remediation',
        ARRAY[
            'a) Establish and maintain comprehensive vulnerability management processes and procedures',
            'b) Perform automated vulnerability scans of all enterprise assets and network infrastructure',
            'c) Perform automated operating system patch management across all systems',
            'd) Perform automated application patch management for all software',
            'e) Remediate detected vulnerabilities in enterprise assets based on risk priority',
            'f) UNIFIED THREAT INTELLIGENCE: Obtain, analyze, and operationalize threat intelligence to inform vulnerability prioritization, satisfying ISO 27002 threat intelligence collection (A.5.8) requirements and supporting proactive vulnerability management based on current threat landscapes'
        ],
        1
    );

    -- 9. Physical Security
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Physical Security';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Physical & Environmental Security Controls',
        'Comprehensive physical security covering facilities, equipment, and environmental controls',
        ARRAY[
            'a) Establish physical security perimeters around information processing facilities',
            'b) Control physical entry to secure areas and facilities',
            'c) Implement protection against environmental threats',
            'd) Secure equipment and protect against theft or damage',
            'e) Implement secure disposal or reuse of equipment',
            'f) Control unattended user equipment and secure work environments',
            'g) Establish equipment maintenance and support procedures',
            'h) Monitor and log physical access to secure areas'
        ],
        1
    );

    -- 10. Network Security
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Network Security';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Network Infrastructure Management',
        'Comprehensive network security including infrastructure protection, monitoring, and secure communications',
        ARRAY[
            'a) Implement network security management and monitoring',
            'b) Establish network access controls and segmentation',
            'c) Deploy and configure firewalls and network security devices',
            'd) Monitor network traffic and detect anomalous activity',
            'e) Secure wireless network communications',
            'f) Protect against network-based attacks and intrusions',
            'g) Implement secure remote access capabilities',
            'h) Establish network change management procedures'
        ],
        1
    );

    -- 11. Secure Development
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Secure Development';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Secure Software Development Lifecycle',
        'Comprehensive secure development practices covering SDLC, testing, and deployment',
        ARRAY[
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
        ],
        1
    );

    -- 12. Incident Response
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Incident Response';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Incident Response & Security Event Management',
        'Comprehensive incident response covering detection, analysis, containment, and recovery',
        ARRAY[
            'a) Establish and maintain incident response planning and preparation',
            'b) Define incident response roles, responsibilities, and communication procedures',
            'c) Implement security event detection and monitoring capabilities',
            'd) Establish incident classification and escalation procedures',
            'e) Implement incident containment, eradication, and recovery processes',
            'f) Conduct post-incident analysis and lessons learned activities',
            'g) Coordinate with external parties as required during incidents',
            'h) Maintain incident response documentation and evidence'
        ],
        1
    );

    -- 13. Network Defense
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Network Defense';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Network Monitoring & Defense',
        'Comprehensive network monitoring, intrusion detection, and network defense capabilities',
        ARRAY[
            'a) Establish and maintain network monitoring capabilities',
            'b) Deploy network intrusion detection and prevention systems',
            'c) Monitor network traffic for malicious and unauthorized behavior',
            'd) Establish and maintain network boundary defense capabilities',
            'e) Deploy network-based security monitoring tools',
            'f) Configure network devices to log security events',
            'g) Establish network segmentation and access controls',
            'h) Implement network-based threat detection and response'
        ],
        1
    );

    -- 14. Supplier Risk
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Supplier Risk';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Supplier & Third-Party Risk Management',
        'Comprehensive supplier and third-party risk management including vendor relationships and cloud services',
        ARRAY[
            'a) Establish processes for managing information security risks with suppliers',
            'b) Include security requirements in supplier agreements and contracts',
            'c) Monitor and review supplier security practices and service delivery',
            'd) Manage information security in the ICT supply chain',
            'e) Establish security requirements for cloud service usage',
            'f) Implement due diligence processes for supplier selection',
            'g) Define security requirements for supplier access to information assets',
            'h) Establish procedures for supplier relationship termination'
        ],
        1
    );

    -- 15. Security Awareness (including Screening as organizational requirement)
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Security Awareness';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Security Awareness & Skills Training Program',
        'Comprehensive security awareness and training program covering all aspects of cybersecurity education',
        ARRAY[
            'a) Establish and maintain a formal security awareness program',
            'b) Conduct training at hire and annually for all personnel',
            'c) Provide role-specific security training based on job responsibilities',
            'd) Train workforce on data handling, classification, and transfer procedures',
            'e) Educate employees on malware protection and safe computing practices',
            'f) Conduct secure coding training for development personnel',
            'g) Provide network security awareness for remote workers',
            'h) Train staff on patch management and software update procedures',
            'i) Implement advanced social engineering awareness for high-profile roles'
        ],
        1
    );

    -- 16. Business Continuity
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Business Continuity';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Business Continuity & Disaster Recovery Management',
        'Comprehensive business continuity planning covering disruption management and recovery capabilities',
        ARRAY[
            'a) Plan for maintaining information security during disruption events',
            'b) Establish and maintain business continuity plans and procedures',
            'c) Implement ICT readiness for business continuity scenarios',
            'd) Test business continuity and disaster recovery procedures regularly',
            'e) Establish recovery time and point objectives for critical systems',
            'f) Maintain offsite backup and recovery capabilities',
            'g) Coordinate business continuity with suppliers and third parties',
            'h) Document and communicate business continuity roles and responsibilities'
        ],
        1
    );

    -- 17. Incident Management
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Incident Management';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Incident Response Management Framework',
        'Comprehensive incident response and management covering detection, response, and recovery',
        ARRAY[
            'a) Designate personnel to manage incident handling with backup coverage',
            'b) Establish and maintain contact information for reporting incidents',
            'c) Establish enterprise process for workforce to report security incidents',
            'd) Establish and maintain incident response process and procedures',
            'e) Assign key roles and responsibilities for incident response team',
            'f) Define mechanisms for communicating during incident response',
            'g) Conduct routine incident response exercises and training',
            'h) Conduct post-incident reviews to improve response processes'
        ],
        1
    );

    -- 18. Malware Defense
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Malware Defense';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Malware Protection & Anti-Virus Controls',
        'Comprehensive malware protection covering detection, prevention, and response',
        ARRAY[
            'a) Deploy and maintain anti-malware software on all enterprise assets',
            'b) Configure anti-malware software to automatically update signatures',
            'c) Enable real-time scanning and monitoring capabilities',
            'd) Establish procedures for handling malware incidents',
            'e) Implement email and web-based malware filtering',
            'f) Conduct regular malware scans of systems and storage media',
            'g) Train users on malware identification and reporting',
            'h) Maintain centralized management of anti-malware solutions'
        ],
        1
    );

    -- 19. Email & Web Security
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Email & Web Security';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Web & Email Security Controls',
        'Comprehensive security for web browsing, email communications, and web-based applications',
        ARRAY[
            'a) Use only fully supported and updated web browsers and email clients',
            'b) Implement DNS filtering services for all enterprise assets',
            'c) Maintain and enforce network-based URL filtering policies',
            'd) Deploy email security gateways with anti-spam and anti-malware',
            'e) Implement web application firewalls for web-based applications',
            'f) Configure secure email encryption and digital signatures',
            'g) Train users on safe web browsing and email handling practices',
            'h) Monitor web and email traffic for security threats'
        ],
        1
    );

    -- 20. Penetration Testing
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Penetration Testing';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Penetration Testing & Security Validation',
        'Comprehensive security testing including penetration tests and red team exercises',
        ARRAY[
            'a) Conduct regular penetration testing by qualified personnel',
            'b) Perform red team exercises to test detection and response capabilities',
            'c) Test security controls through authorized simulated attacks',
            'd) Validate security architecture through adversarial testing',
            'e) Document and remediate findings from security testing',
            'f) Coordinate testing activities with operational teams',
            'g) Use testing results to improve security posture',
            'h) Maintain testing schedules based on risk assessment'
        ],
        1
    );

    -- 21. Audit Logging
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Audit Logging';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Audit Log Management',
        'Comprehensive audit log collection, storage, and monitoring for security and compliance',
        ARRAY[
            'a) Establish and maintain audit log management processes',
            'b) Collect audit logs from all enterprise assets',
            'c) Ensure adequate storage capacity for audit logs',
            'd) Standardize time synchronization across enterprise assets',
            'e) Collect detailed audit logs for sensitive activities',
            'f) Collect DNS query audit logs for security monitoring',
            'g) Collect URL request audit logs for web activity monitoring',
            'h) Collect command-line audit logs for privileged activities'
        ],
        1
    );

    -- 22. GDPR Unified Compliance
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'GDPR Unified Compliance';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Comprehensive GDPR Data Protection Implementation',
        'Complete GDPR compliance framework covering all essential privacy and data protection requirements',
        ARRAY[
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
        ],
        1
    );

END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_unified_requirements_title ON unified_requirements(title);
CREATE INDEX IF NOT EXISTS idx_unified_compliance_categories_name ON unified_compliance_categories(name);

-- Add comments for documentation
COMMENT ON COLUMN unified_compliance_categories.icon IS 'Icon name from Lucide React icon library';
COMMENT ON COLUMN unified_requirements.sub_requirements IS 'Array of detailed sub-requirements that make up this unified requirement';