-- ============================================================================
-- Add Missing NIS2 SCADA/OT Requirements for Critical Infrastructure
-- Addresses industrial control systems, operational technology, and sector-specific requirements
-- ============================================================================

-- Insert NIS2-specific requirements that were missing
INSERT INTO requirements_library (id, standard_id, requirement_code, section, title, official_description, implementation_guidance, audit_ready_guidance, priority, tags, sort_order, created_at, updated_at) VALUES

-- NIS2 Article 21 - Cybersecurity Risk Management (OT/SCADA specific)
(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Art.21.2.h', '21', 'Industrial Control Systems Security', 'Essential entities shall implement appropriate cybersecurity measures for industrial control systems, SCADA systems, and operational technology environments to ensure continuity of critical services.', 'Implement specific security measures for OT/SCADA environments including network segmentation, access controls, and monitoring.', '**Implementation for Critical Infrastructure**

• **Network Segmentation**: Establish clear separation between IT and OT networks using firewalls, DMZs, and secure gateways
• **Industrial Protocol Security**: Secure industrial protocols (Modbus, DNP3, IEC 61850) with authentication and encryption where possible
• **SCADA System Hardening**: Remove unnecessary services, apply security patches, and configure secure communications
• **Remote Access Controls**: Implement strict controls for remote access to industrial systems including VPN, MFA, and session monitoring
• **Safety System Integration**: Ensure cybersecurity measures do not compromise safety instrumented systems (SIS)
• **Operational Continuity**: Design security controls that maintain operational availability and real-time performance requirements', 'high', ARRAY['nis2', 'ot', 'scada', 'industrial'], 1, NOW(), NOW()),

(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Art.21.2.i', '21', 'Critical Infrastructure Asset Protection', 'Essential entities in critical sectors (energy, transport, water, health) shall implement sector-specific cybersecurity measures appropriate to their infrastructure criticality.', 'Apply sector-specific security controls based on infrastructure type and criticality level.', '**Sector-Specific Implementation**

• **Energy Sector**: Protect power generation, transmission, and distribution systems; implement NERC CIP compliance where applicable
• **Water/Wastewater**: Secure water treatment and distribution control systems; protect against contamination and service disruption
• **Transportation**: Protect traffic management, railway signaling, and port operations systems
• **Healthcare**: Secure medical devices, patient monitoring systems, and critical life support equipment
• **Manufacturing**: Protect production lines, quality control systems, and supply chain automation
• **Digital Infrastructure**: Secure data centers, cloud services, and telecommunications infrastructure', 'high', ARRAY['nis2', 'critical-infrastructure', 'sector-specific'], 2, NOW(), NOW()),

(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Art.23.1', '23', 'Incident Reporting for Critical Infrastructure', 'Essential and important entities shall notify the responsible CSIRT or competent authority of any significant cybersecurity incident affecting critical services or essential functions.', 'Establish sector-specific incident reporting procedures with appropriate authorities.', '**Critical Infrastructure Incident Reporting**

• **Authority Identification**: Identify your sector''s competent authority or CSIRT (varies by EU member state and sector)
• **Incident Classification**: Understand what constitutes "significant" incidents for your sector (service disruption, safety impact, cross-border effects)
• **Reporting Timeline**: 24-hour early warning, 72-hour detailed report, 1-month final report with lessons learned
• **Special Considerations**: For incidents affecting safety systems, public health, or multiple jurisdictions, immediate notification may be required
• **Coordination**: Understand relationships between sector authorities, national CSIRTs, and EU-level coordination
• **Business Impact Assessment**: Document how incidents affect essential services and critical functions', 'high', ARRAY['nis2', 'incident-reporting', 'critical-infrastructure'], 3, NOW(), NOW()),

(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Art.21.2.j', '21', 'Supply Chain and Third-Party OT Security', 'Essential entities shall manage cybersecurity risks in their supply chain, particularly for industrial control systems, operational technology, and critical service providers.', 'Implement supply chain risk management for OT/SCADA vendors and critical service providers.', '**OT Supply Chain Security**

• **Vendor Risk Assessment**: Evaluate cybersecurity practices of OT vendors, system integrators, and maintenance providers
• **Secure Development Requirements**: Require secure coding practices and security testing for custom industrial applications
• **Third-Party Access Controls**: Implement strict controls for vendor remote access to industrial systems
• **Update and Patch Management**: Establish coordinated vulnerability management with OT vendors
• **Legacy System Protection**: Implement compensating controls for legacy industrial systems that cannot be easily updated
• **Service Provider Oversight**: Monitor and audit critical service providers'' cybersecurity practices', 'high', ARRAY['nis2', 'supply-chain', 'third-party', 'ot'], 4, NOW(), NOW());

-- Update unified requirements to include SCADA/OT content
-- Update Network Security to include OT-specific requirements
UPDATE unified_requirements 
SET sub_requirements = sub_requirements || ARRAY[
    'i) INDUSTRIAL NETWORK SECURITY (NIS2): Implement specialized network security for operational technology (OT) and SCADA systems, including IT/OT network segmentation, industrial protocol security (Modbus, DNP3, IEC 61850), secure remote access for maintenance, and network monitoring that maintains real-time operational requirements while detecting cyber threats to critical infrastructure'
]
WHERE title = 'Network Infrastructure Security & Defense' 
AND EXISTS (SELECT 1 FROM unified_compliance_categories ucc WHERE ucc.id = category_id AND ucc.name = 'Network Security');

-- Update Physical Security to include critical infrastructure protection
UPDATE unified_requirements 
SET sub_requirements = sub_requirements || ARRAY[
    'i) CRITICAL INFRASTRUCTURE PROTECTION (NIS2): Implement sector-specific physical security measures for critical infrastructure assets including power systems, water treatment facilities, transportation networks, and healthcare systems. Protect against both physical and cyber-physical attacks that could disrupt essential services or public safety'
]
WHERE title = 'Physical & Environmental Security' 
AND EXISTS (SELECT 1 FROM unified_compliance_categories ucc WHERE ucc.id = category_id AND ucc.name = 'Physical Security');

-- Update Incident Management to include critical infrastructure incident procedures
UPDATE unified_requirements 
SET sub_requirements = sub_requirements || ARRAY[
    'k) CRITICAL INFRASTRUCTURE INCIDENT REPORTING (NIS2): Establish sector-specific incident response procedures for critical infrastructure including immediate assessment of safety impacts, coordination with sector authorities and national CSIRTs, and specialized incident handling for industrial control systems and SCADA environments that maintains operational safety while enabling forensic analysis'
]
WHERE title = 'Incident Response & Management' 
AND EXISTS (SELECT 1 FROM unified_compliance_categories ucc WHERE ucc.id = category_id AND ucc.name = 'Incident Management');

-- Update Supplier Risk to include OT vendor management
UPDATE unified_requirements 
SET sub_requirements = sub_requirements || ARRAY[
    'j) OPERATIONAL TECHNOLOGY VENDOR RISK (NIS2): Implement specialized risk management for OT vendors, system integrators, and industrial maintenance providers including security requirements for remote access to industrial systems, coordinated vulnerability management for legacy OT assets, and oversight of third-party access to critical infrastructure control systems'
]
WHERE title = 'Third-Party Risk Management' 
AND EXISTS (SELECT 1 FROM unified_compliance_categories ucc WHERE ucc.id = category_id AND ucc.name = 'Supplier Risk');

-- Create new Industrial Control Systems category for specialized OT requirements
INSERT INTO unified_compliance_categories (name, description, sort_order, icon) VALUES
('Industrial Control Systems', 'Specialized security requirements for SCADA, OT, and critical infrastructure systems', 23, 'Zap');

-- Add comprehensive ICS/SCADA unified requirement
DO $$
DECLARE
    cat_id UUID;
BEGIN
    SELECT id INTO cat_id FROM unified_compliance_categories WHERE name = 'Industrial Control Systems';
    
    INSERT INTO unified_requirements (category_id, title, description, sub_requirements, sort_order)
    VALUES (
        cat_id,
        'Industrial Control Systems & SCADA Security',
        'Comprehensive security framework for operational technology, SCADA systems, and critical infrastructure protection',
        ARRAY[
            'a) NETWORK ARCHITECTURE: Establish secure network architecture for industrial systems including IT/OT network segmentation, secure gateways, firewalls configured for industrial protocols, and demilitarized zones (DMZ) for safe IT-OT communication while maintaining real-time operational requirements',
            'b) INDUSTRIAL PROTOCOL SECURITY: Secure industrial communication protocols (Modbus, DNP3, IEC 61850, OPC-UA) through authentication, encryption where feasible, protocol filtering, and network monitoring designed for industrial environments without disrupting operational timing requirements',
            'c) SCADA SYSTEM HARDENING: Implement comprehensive SCADA system security including removal of unnecessary services, application of security patches during scheduled maintenance windows, secure configuration of HMI systems, and implementation of role-based access controls for operators and engineers',
            'd) REMOTE ACCESS CONTROLS: Establish strict security controls for remote access to industrial systems including VPN with multi-factor authentication, session monitoring and recording, time-limited access permissions, and secure protocols for vendor maintenance activities',
            'e) LEGACY SYSTEM PROTECTION: Implement compensating security controls for legacy industrial systems that cannot be easily updated including network-based protection, monitoring and alerting, secure configuration management, and air-gapping of critical safety systems where appropriate',
            'f) SAFETY SYSTEM INTEGRATION: Ensure cybersecurity measures do not compromise safety instrumented systems (SIS) and emergency shutdown systems through careful design, testing, and implementation of security controls that maintain functional safety requirements',
            'g) INCIDENT RESPONSE FOR OT: Develop specialized incident response procedures for industrial environments including coordination with operations teams, safety assessment protocols, forensic analysis methods suitable for OT environments, and communication procedures with sector-specific authorities',
            'h) OPERATIONAL CONTINUITY: Design and implement security measures that maintain operational availability, real-time performance requirements, and service continuity while providing adequate protection against cyber threats to critical infrastructure and essential services'
        ],
        1
    );
END $$;

-- Add mappings for the new NIS2 requirements to existing unified categories
DO $$
DECLARE
    unified_req_id UUID;
    nis2_req_id UUID;
BEGIN
    -- Map Industrial Control Systems Security to Network Security category
    SELECT id INTO unified_req_id FROM unified_requirements ur
    JOIN unified_compliance_categories ucc ON ur.category_id = ucc.id
    WHERE ur.title = 'Network Infrastructure Security & Defense' AND ucc.name = 'Network Security';
    
    SELECT id INTO nis2_req_id FROM requirements_library 
    WHERE requirement_code = 'Art.21.2.h' AND title = 'Industrial Control Systems Security';
    
    IF unified_req_id IS NOT NULL AND nis2_req_id IS NOT NULL THEN
        INSERT INTO unified_requirement_mappings (unified_requirement_id, requirement_id, mapping_strength, notes)
        VALUES (unified_req_id, nis2_req_id, 'strong', 'OT/SCADA network security requirement')
        ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
    END IF;
    
    -- Map Critical Infrastructure Asset Protection to Physical Security category
    SELECT id INTO unified_req_id FROM unified_requirements ur
    JOIN unified_compliance_categories ucc ON ur.category_id = ucc.id
    WHERE ur.title = 'Physical & Environmental Security' AND ucc.name = 'Physical Security';
    
    SELECT id INTO nis2_req_id FROM requirements_library 
    WHERE requirement_code = 'Art.21.2.i' AND title = 'Critical Infrastructure Asset Protection';
    
    IF unified_req_id IS NOT NULL AND nis2_req_id IS NOT NULL THEN
        INSERT INTO unified_requirement_mappings (unified_requirement_id, requirement_id, mapping_strength, notes)
        VALUES (unified_req_id, nis2_req_id, 'strong', 'Critical infrastructure protection requirement')
        ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
    END IF;
    
    -- Map Incident Reporting to Incident Management category
    SELECT id INTO unified_req_id FROM unified_requirements ur
    JOIN unified_compliance_categories ucc ON ur.category_id = ucc.id
    WHERE ur.title = 'Incident Response & Management' AND ucc.name = 'Incident Management';
    
    SELECT id INTO nis2_req_id FROM requirements_library 
    WHERE requirement_code = 'Art.23.1' AND title = 'Incident Reporting for Critical Infrastructure';
    
    IF unified_req_id IS NOT NULL AND nis2_req_id IS NOT NULL THEN
        INSERT INTO unified_requirement_mappings (unified_requirement_id, requirement_id, mapping_strength, notes)
        VALUES (unified_req_id, nis2_req_id, 'exact', 'Critical infrastructure incident reporting requirement')
        ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
    END IF;
    
    -- Map Supply Chain OT Security to Supplier Risk category
    SELECT id INTO unified_req_id FROM unified_requirements ur
    JOIN unified_compliance_categories ucc ON ur.category_id = ucc.id
    WHERE ur.title = 'Third-Party Risk Management' AND ucc.name = 'Supplier Risk';
    
    SELECT id INTO nis2_req_id FROM requirements_library 
    WHERE requirement_code = 'Art.21.2.j' AND title = 'Supply Chain and Third-Party OT Security';
    
    IF unified_req_id IS NOT NULL AND nis2_req_id IS NOT NULL THEN
        INSERT INTO unified_requirement_mappings (unified_requirement_id, requirement_id, mapping_strength, notes)
        VALUES (unified_req_id, nis2_req_id, 'strong', 'OT supply chain risk management requirement')
        ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
    END IF;
    
    -- Map all new NIS2 requirements to the new Industrial Control Systems category
    SELECT id INTO unified_req_id FROM unified_requirements ur
    JOIN unified_compliance_categories ucc ON ur.category_id = ucc.id
    WHERE ur.title = 'Industrial Control Systems & SCADA Security' AND ucc.name = 'Industrial Control Systems';
    
    FOR nis2_req_id IN 
        SELECT id FROM requirements_library 
        WHERE requirement_code IN ('Art.21.2.h', 'Art.21.2.i', 'Art.23.1', 'Art.21.2.j')
        AND standard_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d481'
    LOOP
        IF unified_req_id IS NOT NULL AND nis2_req_id IS NOT NULL THEN
            INSERT INTO unified_requirement_mappings (unified_requirement_id, requirement_id, mapping_strength, notes)
            VALUES (unified_req_id, nis2_req_id, 'exact', 'Industrial control systems requirement')
            ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
        END IF;
    END LOOP;
    
END $$;

-- Add performance indexes for the new requirements
CREATE INDEX IF NOT EXISTS idx_requirements_library_nis2_ot ON requirements_library(standard_id, requirement_code) 
WHERE standard_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d481';

-- Add documentation comments
COMMENT ON TABLE unified_compliance_categories IS 'Updated to include Industrial Control Systems category for SCADA/OT requirements';
COMMENT ON COLUMN requirements_library.tags IS 'Updated to include ot, scada, industrial, and critical-infrastructure tags';