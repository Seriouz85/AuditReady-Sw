-- ============================================================================
-- Enhanced Unified Requirements with Sector-Specific Guidance and Standards Integration
-- Addresses all gaps: IEC 62443, project vs change management, CIS IG guidance, NIS2 sectors
-- ============================================================================

-- First apply the pending ICS/SCADA requirements
\i /Users/payam/audit-readiness-hub/supabase/migrations/20250103000000_add_nis2_scada_ot_requirements.sql

-- Add IEC 62443 as a recognized standard
INSERT INTO standards_library (id, name, code, description, version, official_url, sort_order) VALUES
('iec62443-std-2025', 'IEC 62443 Industrial Automation and Control Systems Security', 'IEC62443', 'International standard for industrial automation and control systems (IACS) security', '2018', 'https://www.iec.ch/standards-development/horizontal-standards/industrial-cyber-security', 15)
ON CONFLICT (code) DO NOTHING;

-- Separate Project Management and Change Management into distinct sub-requirements
UPDATE unified_requirements 
SET sub_requirements = array_replace(
    sub_requirements,
    'd) Implement security in project management and change management',
    'd) PROJECT MANAGEMENT SECURITY: Integrate security requirements into project management processes including security requirements gathering, risk assessment during project planning, security architecture review, secure development lifecycle integration, and security testing before deployment'
)
WHERE title = 'Information Security Governance';

-- Add dedicated Change Management sub-requirement
UPDATE unified_requirements 
SET sub_requirements = sub_requirements || ARRAY[
    'k) CHANGE MANAGEMENT: Establish formal change management procedures including security impact assessment for all changes, approval workflows for security-relevant modifications, documentation of security configurations, rollback procedures for failed changes, and ongoing monitoring of changes for security implications'
]
WHERE title = 'Information Security Governance';

-- Enhance Network Infrastructure with IEC 62443 guidance for industrial sectors
UPDATE unified_requirements 
SET sub_requirements = array_replace(
    sub_requirements,
    'i) INDUSTRIAL NETWORK SECURITY (NIS2): Implement specialized network security for operational technology (OT) and SCADA systems, including IT/OT network segmentation, industrial protocol security (Modbus, DNP3, IEC 61850), secure remote access for maintenance, and network monitoring that maintains real-time operational requirements while detecting cyber threats to critical infrastructure',
    'i) INDUSTRIAL NETWORK SECURITY (NIS2 + IEC 62443): Implement IEC 62443-3-3 network security zones and conduits for OT environments, including Level 0-4 network architecture (field devices, control, supervisory, enterprise), secure IT/OT gateways, industrial protocol security (Modbus, DNP3, IEC 61850, OPC-UA), and real-time monitoring designed for industrial networks without affecting operational timing requirements'
)
WHERE title = 'Network Infrastructure Security & Defense';

-- Add sector-specific sub-requirements for Water & Wastewater when NIS2 selected
UPDATE unified_requirements 
SET sub_requirements = sub_requirements || ARRAY[
    'j) WATER/WASTEWATER SECTOR GUIDANCE (NIS2): For water treatment facilities, implement IEC 62443 industrial security zones, protect SCADA systems controlling treatment processes, secure industrial protocols used in water quality monitoring (pH, chlorine, turbidity sensors), establish backup manual controls for critical processes, and implement cybersecurity measures that maintain public health and safety while protecting against contamination or service disruption'
]
WHERE title = 'Network Infrastructure Security & Defense';

-- Add Energy sector specific guidance
UPDATE unified_requirements 
SET sub_requirements = sub_requirements || ARRAY[
    'k) ENERGY SECTOR GUIDANCE (NIS2): For power generation and distribution, implement IEC 62443 security levels appropriate for generation control systems, transmission SCADA, and smart grid infrastructure, protect against cyber-physical attacks on power systems, comply with regional standards (NERC CIP in applicable regions), and maintain operational continuity during security incidents'
]
WHERE title = 'Network Infrastructure Security & Defense';

-- Enhance Risk Management with CIS IG-specific guidance
UPDATE unified_requirements 
SET sub_requirements = sub_requirements || ARRAY[
    'l) CIS IMPLEMENTATION GROUP GUIDANCE: For CIS IG1 (basic cyber hygiene), focus on asset inventory, software management, and secure configurations. For CIS IG2 (foundational security), add vulnerability management, audit logging, and incident response. For CIS IG3 (organizational security), implement advanced threat protection, security awareness programs, and continuous monitoring. Choose IG level based on organization size, risk tolerance, and security maturity'
]
WHERE title = 'Risk Assessment & Management';

-- Enhanced Asset Management with detailed CIS guidance
UPDATE unified_requirements 
SET sub_requirements = array_replace(
    sub_requirements,
    'a) Maintain comprehensive asset inventory including hardware, software, and data assets',
    'a) COMPREHENSIVE ASSET INVENTORY (CIS Controls 1&2): Implement automated asset discovery for all network-connected devices (CIS IG1 minimum), maintain real-time software inventory with unauthorized software detection (CIS IG2), and establish configuration management database (CMDB) with detailed asset relationships and dependencies (CIS IG3). For industrial environments, include OT assets, HMI systems, and industrial protocols in inventory'
)
WHERE title = 'Asset & Configuration Management';

-- Enhanced Identity Management with sector considerations
UPDATE unified_requirements 
SET sub_requirements = sub_requirements || ARRAY[
    'k) SECTOR-SPECIFIC IDENTITY REQUIREMENTS: For healthcare, implement HIPAA-compliant access controls for medical devices and patient data systems. For financial services, apply PCI DSS requirements for payment processing access. For industrial sectors, implement IEC 62443 role-based access (operator, engineer, maintenance, administrator) with appropriate authentication levels for safety-critical systems'
]
WHERE title = 'Identity & Access Management';

-- Dramatically improve Incident Response with specific guidance and remove excessive text
UPDATE unified_requirements 
SET sub_requirements = ARRAY[
    'a) INCIDENT RESPONSE PROCEDURES: Establish clear incident detection, analysis, containment, and recovery procedures with defined roles and responsibilities',
    'b) INCIDENT CLASSIFICATION: Define incident severity levels and response procedures for each level, including criteria for escalation to management',
    'c) COMMUNICATION PROTOCOLS: Establish internal and external communication procedures including customer notification and regulatory reporting requirements',
    'd) FORENSIC CAPABILITIES: Maintain digital forensic capabilities for incident analysis while preserving evidence integrity',
    'e) BUSINESS CONTINUITY: Ensure incident response procedures support business continuity and minimize operational impact',
    'f) TRAINING & EXERCISES: Conduct regular incident response training and tabletop exercises to maintain response readiness',
    'g) POST-INCIDENT REVIEW: Perform lessons learned analysis after significant incidents to improve response procedures',
    'h) REGULATORY REPORTING TIMELINE (NIS2/GDPR): Report cybersecurity incidents within regulatory timeframes - 24 hours initial notification (NIS2), 72 hours detailed report (NIS2 + GDPR for personal data breaches), and 1 month final analysis (NIS2)',
    'i) CRITICAL INFRASTRUCTURE RESPONSE: For essential services, coordinate with sector authorities (CSIRT), assess safety impacts, and maintain operational safety during incident response',
    'j) INDUSTRIAL SYSTEMS RESPONSE (IEC 62443): For OT/SCADA incidents, follow IEC 62443-2-3 incident response procedures, maintain safety system integrity, coordinate with operations teams, and use specialized tools designed for industrial environments'
]
WHERE title = 'Incident Response & Management';

-- Add sector-specific categories with appropriate guidance
INSERT INTO unified_compliance_categories (name, description, sort_order, icon) VALUES
('Manufacturing Security', 'Security requirements specific to manufacturing and production environments', 24, 'Settings'),
('Healthcare Systems Security', 'Security controls for healthcare infrastructure and medical devices', 25, 'Shield'),
('Energy & Utilities Security', 'Security frameworks for power generation, transmission, and utility services', 26, 'Zap')
ON CONFLICT (name) DO NOTHING;

-- Add Manufacturing-specific unified requirement
DO $$
DECLARE
    cat_id UUID;
BEGIN
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Manufacturing Security';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Manufacturing & Production Security',
        'Security framework for manufacturing operations, production lines, and industrial automation systems',
        ARRAY[
            'a) PRODUCTION LINE SECURITY: Protect manufacturing execution systems (MES), quality control systems, and production automation with appropriate IEC 62443 security levels',
            'b) SUPPLY CHAIN INTEGRATION: Secure integration with supplier systems, logistics networks, and customer delivery systems while maintaining operational efficiency',
            'c) QUALITY SYSTEM PROTECTION: Implement security controls for quality management systems, testing equipment, and compliance documentation systems',
            'd) INTELLECTUAL PROPERTY PROTECTION: Protect manufacturing processes, product designs, and proprietary production methods from industrial espionage',
            'e) OPERATIONAL CONTINUITY: Ensure cybersecurity measures maintain production schedules, just-in-time delivery, and manufacturing efficiency requirements'
        ],
        1
    ) ON CONFLICT DO NOTHING;
END $$;

-- Add Healthcare-specific unified requirement  
DO $$
DECLARE
    cat_id UUID;
BEGIN
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Healthcare Systems Security';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Healthcare Infrastructure Security',
        'Security framework for healthcare systems, medical devices, and patient care infrastructure',
        ARRAY[
            'a) MEDICAL DEVICE SECURITY: Implement security controls for connected medical devices, patient monitoring systems, and diagnostic equipment following FDA cybersecurity guidance',
            'b) PATIENT DATA PROTECTION: Ensure HIPAA compliance for electronic health records (EHR), patient monitoring data, and healthcare communication systems',
            'c) CLINICAL SYSTEM AVAILABILITY: Maintain high availability for critical care systems, emergency response systems, and life support equipment',
            'd) TELEMEDICINE SECURITY: Secure remote patient monitoring, telehealth platforms, and mobile health applications with appropriate encryption and access controls',
            'e) REGULATORY COMPLIANCE: Meet healthcare-specific regulations including HIPAA, FDA cybersecurity requirements, and medical device safety standards'
        ],
        1
    ) ON CONFLICT DO NOTHING;
END $$;

-- Add Energy & Utilities specific unified requirement
DO $$
DECLARE
    cat_id UUID;
BEGIN
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Energy & Utilities Security';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Energy Infrastructure Security',
        'Security framework for power generation, transmission, distribution, and utility operations',
        ARRAY[
            'a) GENERATION SYSTEM SECURITY: Protect power generation control systems, turbine controls, and generation monitoring systems with IEC 62443 security zones',
            'b) TRANSMISSION PROTECTION: Secure high-voltage transmission SCADA systems, substation automation, and grid management systems',
            'c) SMART GRID SECURITY: Implement security for advanced metering infrastructure (AMI), demand response systems, and distributed energy resources',
            'd) REGIONAL COMPLIANCE: Meet applicable regional standards such as NERC CIP (North America) or equivalent grid security requirements',
            'e) OPERATIONAL TECHNOLOGY RESILIENCE: Maintain grid stability and power system reliability during cybersecurity incidents and recovery operations'
        ],
        1
    ) ON CONFLICT DO NOTHING;
END $$;

-- Update existing requirements to reference appropriate standards
UPDATE unified_requirements 
SET description = description || ' Integrates guidance from ISO 27001/27002, CIS Controls, GDPR, NIS2, and sector-specific standards including IEC 62443 for industrial environments.'
WHERE title IN (
    'Network Infrastructure Security & Defense',
    'Asset & Configuration Management', 
    'Identity & Access Management',
    'Incident Response & Management',
    'Industrial Control Systems & SCADA Security'
);

-- Add sector-specific requirement mappings for IEC 62443
-- This creates mappings between our unified requirements and IEC 62443 requirements
INSERT INTO unified_requirement_mappings (unified_requirement_id, requirement_id, mapping_strength, notes)
SELECT 
    ur.id as unified_requirement_id,
    rl.id as requirement_id,
    'strong' as mapping_strength,
    'IEC 62443 industrial automation security requirement' as notes
FROM unified_requirements ur
CROSS JOIN requirements_library rl
JOIN standards_library sl ON rl.standard_id = sl.id
WHERE ur.title IN ('Industrial Control Systems & SCADA Security', 'Manufacturing & Production Security', 'Energy Infrastructure Security')
AND sl.code = 'IEC62443'
ON CONFLICT DO NOTHING;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Enhanced unified requirements with:';
    RAISE NOTICE '- Separated project management and change management';
    RAISE NOTICE '- Added IEC 62443 integration for industrial sectors';
    RAISE NOTICE '- Enhanced CIS IG-specific guidance (IG1, IG2, IG3)';
    RAISE NOTICE '- Added water/wastewater, energy, manufacturing, healthcare sector guidance';
    RAISE NOTICE '- Improved incident response with concise, actionable requirements';
    RAISE NOTICE '- Added sector-specific categories for targeted guidance';
END $$;