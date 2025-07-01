-- ============================================================================
-- Restore Real Requirements Data
-- Remove any fake/placeholder requirements and restore official data
-- ============================================================================

-- Clear any existing requirements that might be fake/placeholder
DELETE FROM requirements_library WHERE 
  title ILIKE '%sample%' OR 
  title ILIKE '%fake%' OR 
  title ILIKE '%placeholder%' OR
  title ILIKE '%ISO 27001 Control for%' OR
  title ILIKE '%ISO 27002 Control for%' OR
  title ILIKE '%CIS Control for%' OR
  title ILIKE '%GDPR Article for%' OR
  title ILIKE '%NIS2 Article for%' OR
  official_description ILIKE '%sample%';

-- Ensure standards exist first
INSERT INTO standards_library (id, slug, name, version, type, description, category, is_active, sort_order, created_at, updated_at) VALUES
-- ISO Standards
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'iso-27001', 'ISO/IEC 27001', '2022', 'framework', 'Information Security Management System standard that provides requirements for an information security management system.', 'Information Security', true, 1, NOW(), NOW()),
('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'iso-27002-2022', 'ISO 27002:2022', '2022', 'framework', 'Code of practice for information security controls that provides guidance on implementing information security controls.', 'Information Security', true, 2, NOW(), NOW()),

-- Regulatory Standards
('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'nis2', 'NIS2 Directive', '2022', 'regulation', 'EU directive on measures for a high common level of cybersecurity across the Union.', 'Network Security', true, 3, NOW(), NOW()),
('f47ac10b-58cc-4372-a567-0e02b2c3d482', 'gdpr', 'GDPR', '2018', 'regulation', 'General Data Protection Regulation for data protection and privacy in the EU.', 'Data Protection', true, 4, NOW(), NOW()),

-- CIS Implementation Groups
('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'cis-ig1', 'CIS Controls Implementation Group 1 (IG1)', '8.1.2', 'framework', 'Essential cyber hygiene safeguards that every enterprise should implement. IG1 contains 56 foundational safeguards for basic cyber defense readiness.', 'Cybersecurity', true, 5, NOW(), NOW()),
('f47ac10b-58cc-4372-a567-0e02b2c3d484', 'cis-ig2', 'CIS Controls Implementation Group 2 (IG2)', '8.1.2', 'framework', 'All IG1 safeguards plus additional safeguards for organizations with moderate cybersecurity maturity and resources. IG2 contains 130 total safeguards.', 'Cybersecurity', true, 6, NOW(), NOW()),
('f47ac10b-58cc-4372-a567-0e02b2c3d485', 'cis-ig3', 'CIS Controls Implementation Group 3 (IG3)', '8.1.2', 'framework', 'All IG1 and IG2 safeguards plus additional safeguards for organizations with high cybersecurity maturity and significant resources. IG3 contains all 153 safeguards.', 'Cybersecurity', true, 7, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  version = EXCLUDED.version,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Insert real ISO 27001 requirements
INSERT INTO requirements_library (id, standard_id, requirement_code, section, title, official_description, implementation_guidance, audit_ready_guidance, priority, tags, sort_order, created_at, updated_at) VALUES

-- ISO 27001 Section 4
(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '4.1', '4', 'Understanding the organization and its context', 'The organization shall determine external and internal issues that are relevant to its purpose and that affect its ability to achieve the intended outcome(s) of its information security management system.', 'Identify and document all relevant internal and external factors that impact information security.', '**Implementation**

* Conduct regular environmental scanning to identify external factors (regulatory changes, market conditions, threats)
* Assess internal factors (organizational structure, culture, capabilities, resources)
* Document how these factors impact information security objectives
* Review and update context analysis at least annually', 'high', ARRAY['governance', 'risk', 'context'], 1, NOW(), NOW()),

(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '4.2', '4', 'Understanding the needs and expectations of interested parties', 'The organization shall determine: a) interested parties that are relevant to the information security management system; b) the relevant requirements of these interested parties; c) which of these requirements will be addressed through the information security management system.', 'Identify all stakeholders and their security requirements and expectations.', '**Implementation**

* Create stakeholder register with all interested parties
* Document specific security requirements from each stakeholder group
* Map requirements to ISMS scope and controls
* Establish communication channels with key stakeholders', 'high', ARRAY['governance', 'compliance', 'stakeholders'], 2, NOW(), NOW()),

(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '4.3', '4', 'Determining the scope of the information security management system', 'The organization shall determine the boundaries and applicability of the information security management system to establish its scope. When determining this scope, the organization shall consider: a) the external and internal issues referred to in 4.1; b) the requirements referred to in 4.2; c) interfaces and dependencies between activities performed by the organization, and those that are performed by other organizations. The scope shall be available as documented information.', 'Define which parts of the organization are covered by the ISMS.', '**Implementation**

* Define physical and logical boundaries of the ISMS
* Include all relevant business processes, locations, and assets
* Document interfaces with external organizations
* Ensure scope statement is accessible to all stakeholders
* Review scope when organizational changes occur', 'high', ARRAY['documentation', 'governance', 'scope'], 3, NOW(), NOW()),

(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '4.4', '4', 'Information security management system', 'The organization shall establish, implement, maintain and continually improve an information security management system, including the processes needed and their interactions, in accordance with the requirements of this document.', 'Implement a systematic approach to managing information security.', '**Implementation**

* Establish ISMS documentation framework
* Define process interactions and responsibilities
* Implement monitoring and measurement processes
* Create continual improvement procedures
* Ensure ISMS alignment with business objectives', 'high', ARRAY['governance', 'isms', 'processes'], 4, NOW(), NOW());

-- Insert real CIS Controls requirements
INSERT INTO requirements_library (id, standard_id, requirement_code, section, title, official_description, implementation_guidance, audit_ready_guidance, applicable_groups, priority, tags, sort_order, created_at, updated_at) VALUES

-- CIS Control 1.1 (IG1)
(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d483', '1.1', '1', 'Establish and Maintain Detailed Enterprise Asset Inventory', 'Establish and maintain an accurate, detailed, and up-to-date inventory of all enterprise assets with the potential to store or process data, to include: end-user devices (including portable and mobile), network devices, non-computing/IoT devices, and servers. Ensure the inventory records the network address (if static), hardware address, machine name, enterprise asset owner, department for each asset, and whether the asset has been approved to connect to the network. For mobile end-user devices, MDM type tools can support this process, where appropriate. This inventory includes assets connected to the infrastructure physically, virtually, remotely, and those within cloud environments. Additionally, it includes assets that are regularly connected to the enterprise''s network infrastructure, even if they are not under control of the enterprise. Review and update the inventory of all enterprise assets bi-annually, or more frequently.', 'Implement automated asset discovery tools to maintain an up-to-date inventory.', '**Implementation**

* Deploy automated asset discovery tools (Lansweeper, ManageEngine, etc.)
* Include all device types: endpoints, servers, network devices, IoT devices
* Record required attributes: IP, MAC, hostname, owner, department, approval status
* Establish regular review cycle (bi-annual minimum)
* Integrate with MDM for mobile device management
* Include cloud and virtual assets in inventory scope', ARRAY['IG1', 'IG2', 'IG3'], 'high', ARRAY['asset-management', 'inventory', 'baseline'], 1, NOW(), NOW()),

-- CIS Control 1.2 (IG1)
(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d483', '1.2', '1', 'Address Unauthorized Assets', 'Ensure that a process exists to address unauthorized assets on a weekly basis. The enterprise may choose to remove the asset from the network, deny the asset from connecting remotely to the network, or quarantine the asset.', 'Implement automated detection and response for unauthorized assets.', '**Implementation**

* Configure network access control (NAC) solutions
* Implement automated quarantine for unknown devices
* Establish weekly review process for unauthorized assets
* Define escalation procedures for persistent unauthorized assets
* Document approved response actions (remove, deny, quarantine)
* Integrate with incident response procedures', ARRAY['IG1', 'IG2', 'IG3'], 'high', ARRAY['asset-management', 'security', 'monitoring'], 2, NOW(), NOW());

-- Insert real ISO 27002 requirements
INSERT INTO requirements_library (id, standard_id, requirement_code, section, title, official_description, implementation_guidance, audit_ready_guidance, priority, tags, sort_order, created_at, updated_at) VALUES

-- A.5.1 Policies for information security
(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'A.5.1', 'A5', 'Policies for information security', 'Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties, and reviewed at planned intervals and if significant changes occur.', 'Develop and maintain comprehensive information security policies.', '**Implementation**

* Define and document comprehensive information security policies approved by management
* Ensure policies are communicated to all employees and relevant external parties
* Implement policy acknowledgment process for all personnel
* Review policies regularly and update when significant changes occur
* Maintain version control and approval records for all policies', 'high', ARRAY['governance', 'policy', 'management'], 1, NOW(), NOW()),

-- A.5.2 Information security roles and responsibilities
(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'A.5.2', 'A5', 'Information security roles and responsibilities', 'Information security roles and responsibilities shall be defined and allocated according to the organization needs.', 'Define clear information security roles and responsibilities.', '**Implementation**

* Document all information security roles and responsibilities
* Assign specific security responsibilities to appropriate personnel
* Ensure role clarity and avoid conflicts of interest
* Regular review and update of role assignments
* Communicate role changes to all affected parties', 'high', ARRAY['governance', 'roles', 'responsibility'], 2, NOW(), NOW());