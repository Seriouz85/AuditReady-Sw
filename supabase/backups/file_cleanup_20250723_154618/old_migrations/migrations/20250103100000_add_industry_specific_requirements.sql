-- ============================================================================
-- Add Industry-Specific Requirements System
-- Comprehensive industry sectors with tailored NIS2 and general requirements
-- ============================================================================

-- First, create industry sectors table if it doesn't exist
CREATE TABLE IF NOT EXISTS industry_sectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  nis2_essential BOOLEAN DEFAULT FALSE,
  nis2_important BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert comprehensive industry sectors
INSERT INTO industry_sectors (name, description, nis2_essential, nis2_important, sort_order) VALUES
('Energy', 'Power generation, transmission, distribution, and renewable energy systems', true, true, 1),
('Healthcare', 'Hospitals, medical facilities, pharmaceuticals, and healthcare technology', true, true, 2),
('Water & Wastewater', 'Water treatment, distribution, and wastewater management systems', true, true, 3),
('Transportation', 'Railways, aviation, maritime, road transport, and logistics', true, true, 4),
('Banking & Finance', 'Banks, payment systems, insurance, and financial services', true, true, 5),
('Digital Infrastructure', 'Data centers, cloud services, telecommunications, and internet services', true, true, 6),
('Manufacturing', 'Industrial production, automotive, chemicals, and supply chain', false, true, 7),
('Food & Agriculture', 'Food production, processing, distribution, and agricultural systems', false, true, 8),
('Government & Public', 'Public administration, defense, emergency services, and civic infrastructure', true, false, 9),
('Education', 'Schools, universities, research institutions, and educational technology', false, true, 10),
('Technology & Software', 'Software development, IT services, cybersecurity, and tech platforms', false, true, 11),
('Retail & E-commerce', 'Retail chains, e-commerce platforms, and consumer services', false, true, 12),
('General Business', 'Professional services, consulting, and other business sectors', false, false, 13)
ON CONFLICT (name) DO NOTHING;

-- Add industry-specific requirements for each sector
INSERT INTO requirements_library (id, standard_id, requirement_code, section, title, official_description, implementation_guidance, audit_ready_guidance, priority, tags, sort_order, created_at, updated_at) VALUES

-- Energy Sector Requirements
(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Energy.1', 'Energy', 'Power Grid & Generation Security', 'Implement comprehensive cybersecurity measures for power generation, transmission, and distribution systems to prevent service disruption.', 'Focus on SCADA systems, smart grid technology, and operational technology protection.', '• **Grid Protection**: Secure power generation controls and transmission systems
• **SCADA Security**: Implement IT/OT network segmentation and monitoring
• **Smart Grid**: Protect smart meters and distribution automation systems
• **Renewable Integration**: Secure solar, wind, and battery storage systems
• **Emergency Response**: Maintain backup systems and incident response capabilities', 'high', ARRAY['nis2', 'energy', 'critical-infrastructure', 'ot'], 1, NOW(), NOW()),

-- Healthcare Sector Requirements  
(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Healthcare.1', 'Healthcare', 'Medical Device & Patient Safety', 'Secure medical devices, patient monitoring systems, and healthcare IT infrastructure while maintaining patient care continuity.', 'Protect patient data and ensure medical equipment reliability and safety.', '• **Medical Device Security**: Secure connected medical devices and IoT systems
• **Patient Data Protection**: Implement strong access controls and encryption
• **EHR Security**: Protect electronic health records and healthcare databases
• **Telemedicine**: Secure remote patient monitoring and virtual care systems
• **Emergency Operations**: Maintain healthcare services during cyber incidents', 'high', ARRAY['nis2', 'healthcare', 'medical-devices', 'patient-safety'], 2, NOW(), NOW()),

-- Water & Wastewater Requirements
(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Water.1', 'Water', 'Water Treatment & Distribution Security', 'Protect water treatment plants, distribution systems, and quality monitoring to ensure safe drinking water supply.', 'Secure industrial control systems managing water treatment and distribution.', '• **Treatment Plant Security**: Protect water treatment and purification systems
• **Distribution Network**: Secure water distribution and pressure monitoring
• **Quality Control**: Protect water quality monitoring and testing systems
• **SCADA Systems**: Secure supervisory control and data acquisition systems
• **Environmental Monitoring**: Protect watershed and source water monitoring', 'high', ARRAY['nis2', 'water', 'critical-infrastructure', 'environmental'], 3, NOW(), NOW()),

-- Transportation Requirements
(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Transport.1', 'Transportation', 'Transportation System Security', 'Secure transportation infrastructure including traffic management, logistics, and passenger systems.', 'Protect transportation control systems and passenger safety systems.', '• **Traffic Management**: Secure traffic control and signaling systems
• **Railway Security**: Protect rail signaling and train control systems
• **Aviation Systems**: Secure air traffic control and airport operations
• **Maritime Security**: Protect port operations and vessel tracking systems
• **Logistics Networks**: Secure supply chain and freight management systems', 'high', ARRAY['nis2', 'transportation', 'traffic-control', 'logistics'], 4, NOW(), NOW()),

-- Banking & Finance Requirements
(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Finance.1', 'Banking', 'Financial Services Security', 'Implement robust cybersecurity for banking systems, payment processing, and financial data protection.', 'Protect financial transactions and customer data with high security standards.', '• **Payment Systems**: Secure payment processing and transaction systems
• **Core Banking**: Protect banking core systems and customer databases
• **ATM & Branch Security**: Secure ATM networks and branch operations
• **Trading Systems**: Protect financial trading and market data systems
• **Regulatory Compliance**: Meet PCI DSS, PSD2, and other financial regulations', 'high', ARRAY['nis2', 'finance', 'banking', 'payment-systems'], 5, NOW(), NOW()),

-- Digital Infrastructure Requirements
(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Digital.1', 'Digital', 'Data Center & Cloud Security', 'Secure data centers, cloud infrastructure, and telecommunications systems that support digital services.', 'Protect the backbone infrastructure that enables digital services and communications.', '• **Data Center Security**: Secure server infrastructure and colocation facilities
• **Cloud Security**: Implement cloud-specific security controls and monitoring
• **Network Infrastructure**: Protect telecommunications and internet backbone
• **Edge Computing**: Secure distributed computing and edge services
• **Service Availability**: Ensure high availability and disaster recovery', 'high', ARRAY['nis2', 'digital-infrastructure', 'cloud', 'telecommunications'], 6, NOW(), NOW()),

-- Manufacturing Requirements
(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Manufacturing.1', 'Manufacturing', 'Industrial Production Security', 'Secure manufacturing systems, production lines, and supply chain operations.', 'Protect industrial automation and production systems from cyber threats.', '• **Production Systems**: Secure manufacturing execution and control systems
• **Industrial IoT**: Protect connected sensors and automation devices
• **Supply Chain**: Secure supplier networks and logistics systems
• **Quality Control**: Protect quality assurance and testing systems
• **Plant Operations**: Secure facility management and safety systems', 'medium', ARRAY['nis2', 'manufacturing', 'industrial-iot', 'supply-chain'], 7, NOW(), NOW()),

-- Food & Agriculture Requirements
(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Food.1', 'Food', 'Food Safety & Agricultural Security', 'Protect food production, processing, and distribution systems to ensure food safety and supply chain integrity.', 'Secure agricultural systems and food processing infrastructure.', '• **Food Processing**: Secure food manufacturing and processing systems
• **Agricultural Systems**: Protect farming automation and monitoring systems
• **Cold Chain**: Secure temperature-controlled storage and transport
• **Traceability**: Implement food traceability and quality monitoring
• **Supply Chain**: Protect food distribution and retail systems', 'medium', ARRAY['nis2', 'food', 'agriculture', 'supply-chain'], 8, NOW(), NOW()),

-- Government & Public Requirements
(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Government.1', 'Government', 'Public Service Security', 'Secure government systems, public services, and citizen data protection.', 'Protect public infrastructure and government operations.', '• **Citizen Services**: Secure public-facing government services and portals
• **Administrative Systems**: Protect government databases and operations
• **Emergency Services**: Secure police, fire, and emergency response systems
• **Public Infrastructure**: Protect public facilities and utilities management
• **Data Protection**: Secure citizen data and government records', 'high', ARRAY['nis2', 'government', 'public-services', 'citizen-data'], 9, NOW(), NOW()),

-- Education Requirements
(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Education.1', 'Education', 'Educational Institution Security', 'Secure educational systems, student data, and academic infrastructure.', 'Protect student information and educational technology systems.', '• **Student Data**: Secure student information systems and records
• **Learning Management**: Protect online learning platforms and systems
• **Research Systems**: Secure research data and academic networks
• **Campus Infrastructure**: Protect campus IT and facility systems
• **Remote Learning**: Secure distance education and virtual classrooms', 'medium', ARRAY['nis2', 'education', 'student-data', 'learning-systems'], 10, NOW(), NOW()),

-- Technology & Software Requirements
(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Technology.1', 'Technology', 'Software Development Security', 'Implement secure software development practices and protect technology platforms.', 'Secure software development lifecycle and technology services.', '• **Secure Development**: Implement secure coding practices and testing
• **Platform Security**: Protect SaaS platforms and technology services
• **API Security**: Secure application programming interfaces and integrations
• **DevOps Security**: Implement DevSecOps practices and automation
• **Intellectual Property**: Protect source code and proprietary technology', 'medium', ARRAY['nis2', 'technology', 'software-development', 'devops'], 11, NOW(), NOW()),

-- Retail & E-commerce Requirements
(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Retail.1', 'Retail', 'Retail & E-commerce Security', 'Secure retail operations, e-commerce platforms, and customer transaction systems.', 'Protect customer data and retail operations from cyber threats.', '• **E-commerce Security**: Secure online stores and payment processing
• **Customer Data**: Protect customer information and purchase history
• **POS Systems**: Secure point-of-sale and retail transaction systems
• **Inventory Management**: Protect supply chain and inventory systems
• **Omnichannel**: Secure integrated retail experiences across channels', 'medium', ARRAY['nis2', 'retail', 'e-commerce', 'customer-data'], 12, NOW(), NOW()),

-- General Business Requirements
(uuid_generate_v4(), 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'General.1', 'General', 'Business Operations Security', 'Implement fundamental cybersecurity practices for general business operations.', 'Basic security requirements applicable to all business types.', '• **Business Systems**: Secure core business applications and data
• **Employee Security**: Implement user access controls and training
• **Communication**: Secure email and business communication systems
• **Data Protection**: Protect business data and intellectual property
• **Third-Party Risk**: Manage vendor and supplier security risks', 'medium', ARRAY['nis2', 'general-business', 'basic-security'], 13, NOW(), NOW());

-- Create industry-specific requirement mappings table
CREATE TABLE IF NOT EXISTS industry_requirement_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  industry_sector_id UUID NOT NULL REFERENCES industry_sectors(id),
  requirement_id UUID NOT NULL REFERENCES requirements_library(id),
  relevance_level VARCHAR(20) DEFAULT 'standard', -- 'critical', 'high', 'standard', 'optional'
  sector_specific BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(industry_sector_id, requirement_id)
);

-- Map industry-specific requirements to sectors
DO $$
DECLARE
    sector_id UUID;
    req_id UUID;
BEGIN
    -- Energy sector mappings
    SELECT id INTO sector_id FROM industry_sectors WHERE name = 'Energy';
    SELECT id INTO req_id FROM requirements_library WHERE requirement_code = 'Energy.1';
    IF sector_id IS NOT NULL AND req_id IS NOT NULL THEN
        INSERT INTO industry_requirement_mappings (industry_sector_id, requirement_id, relevance_level, sector_specific)
        VALUES (sector_id, req_id, 'critical', true)
        ON CONFLICT (industry_sector_id, requirement_id) DO NOTHING;
    END IF;
    
    -- Healthcare sector mappings
    SELECT id INTO sector_id FROM industry_sectors WHERE name = 'Healthcare';
    SELECT id INTO req_id FROM requirements_library WHERE requirement_code = 'Healthcare.1';
    IF sector_id IS NOT NULL AND req_id IS NOT NULL THEN
        INSERT INTO industry_requirement_mappings (industry_sector_id, requirement_id, relevance_level, sector_specific)
        VALUES (sector_id, req_id, 'critical', true)
        ON CONFLICT (industry_sector_id, requirement_id) DO NOTHING;
    END IF;
    
    -- Water sector mappings  
    SELECT id INTO sector_id FROM industry_sectors WHERE name = 'Water & Wastewater';
    SELECT id INTO req_id FROM requirements_library WHERE requirement_code = 'Water.1';
    IF sector_id IS NOT NULL AND req_id IS NOT NULL THEN
        INSERT INTO industry_requirement_mappings (industry_sector_id, requirement_id, relevance_level, sector_specific)
        VALUES (sector_id, req_id, 'critical', true)
        ON CONFLICT (industry_sector_id, requirement_id) DO NOTHING;
    END IF;
    
    -- Transportation sector mappings
    SELECT id INTO sector_id FROM industry_sectors WHERE name = 'Transportation';
    SELECT id INTO req_id FROM requirements_library WHERE requirement_code = 'Transport.1';
    IF sector_id IS NOT NULL AND req_id IS NOT NULL THEN
        INSERT INTO industry_requirement_mappings (industry_sector_id, requirement_id, relevance_level, sector_specific)
        VALUES (sector_id, req_id, 'critical', true)
        ON CONFLICT (industry_sector_id, requirement_id) DO NOTHING;
    END IF;
    
    -- Banking & Finance sector mappings
    SELECT id INTO sector_id FROM industry_sectors WHERE name = 'Banking & Finance';
    SELECT id INTO req_id FROM requirements_library WHERE requirement_code = 'Finance.1';
    IF sector_id IS NOT NULL AND req_id IS NOT NULL THEN
        INSERT INTO industry_requirement_mappings (industry_sector_id, requirement_id, relevance_level, sector_specific)
        VALUES (sector_id, req_id, 'critical', true)
        ON CONFLICT (industry_sector_id, requirement_id) DO NOTHING;
    END IF;
    
    -- Digital Infrastructure sector mappings
    SELECT id INTO sector_id FROM industry_sectors WHERE name = 'Digital Infrastructure';
    SELECT id INTO req_id FROM requirements_library WHERE requirement_code = 'Digital.1';
    IF sector_id IS NOT NULL AND req_id IS NOT NULL THEN
        INSERT INTO industry_requirement_mappings (industry_sector_id, requirement_id, relevance_level, sector_specific)
        VALUES (sector_id, req_id, 'critical', true)
        ON CONFLICT (industry_sector_id, requirement_id) DO NOTHING;
    END IF;
    
    -- Manufacturing sector mappings
    SELECT id INTO sector_id FROM industry_sectors WHERE name = 'Manufacturing';
    SELECT id INTO req_id FROM requirements_library WHERE requirement_code = 'Manufacturing.1';
    IF sector_id IS NOT NULL AND req_id IS NOT NULL THEN
        INSERT INTO industry_requirement_mappings (industry_sector_id, requirement_id, relevance_level, sector_specific)
        VALUES (sector_id, req_id, 'high', true)
        ON CONFLICT (industry_sector_id, requirement_id) DO NOTHING;
    END IF;
    
    -- Food & Agriculture sector mappings
    SELECT id INTO sector_id FROM industry_sectors WHERE name = 'Food & Agriculture';
    SELECT id INTO req_id FROM requirements_library WHERE requirement_code = 'Food.1';
    IF sector_id IS NOT NULL AND req_id IS NOT NULL THEN
        INSERT INTO industry_requirement_mappings (industry_sector_id, requirement_id, relevance_level, sector_specific)
        VALUES (sector_id, req_id, 'high', true)
        ON CONFLICT (industry_sector_id, requirement_id) DO NOTHING;
    END IF;
    
    -- Government & Public sector mappings
    SELECT id INTO sector_id FROM industry_sectors WHERE name = 'Government & Public';
    SELECT id INTO req_id FROM requirements_library WHERE requirement_code = 'Government.1';
    IF sector_id IS NOT NULL AND req_id IS NOT NULL THEN
        INSERT INTO industry_requirement_mappings (industry_sector_id, requirement_id, relevance_level, sector_specific)
        VALUES (sector_id, req_id, 'critical', true)
        ON CONFLICT (industry_sector_id, requirement_id) DO NOTHING;
    END IF;
    
    -- Education sector mappings
    SELECT id INTO sector_id FROM industry_sectors WHERE name = 'Education';
    SELECT id INTO req_id FROM requirements_library WHERE requirement_code = 'Education.1';
    IF sector_id IS NOT NULL AND req_id IS NOT NULL THEN
        INSERT INTO industry_requirement_mappings (industry_sector_id, requirement_id, relevance_level, sector_specific)
        VALUES (sector_id, req_id, 'high', true)
        ON CONFLICT (industry_sector_id, requirement_id) DO NOTHING;
    END IF;
    
    -- Technology & Software sector mappings
    SELECT id INTO sector_id FROM industry_sectors WHERE name = 'Technology & Software';
    SELECT id INTO req_id FROM requirements_library WHERE requirement_code = 'Technology.1';
    IF sector_id IS NOT NULL AND req_id IS NOT NULL THEN
        INSERT INTO industry_requirement_mappings (industry_sector_id, requirement_id, relevance_level, sector_specific)
        VALUES (sector_id, req_id, 'high', true)
        ON CONFLICT (industry_sector_id, requirement_id) DO NOTHING;
    END IF;
    
    -- Retail & E-commerce sector mappings
    SELECT id INTO sector_id FROM industry_sectors WHERE name = 'Retail & E-commerce';
    SELECT id INTO req_id FROM requirements_library WHERE requirement_code = 'Retail.1';
    IF sector_id IS NOT NULL AND req_id IS NOT NULL THEN
        INSERT INTO industry_requirement_mappings (industry_sector_id, requirement_id, relevance_level, sector_specific)
        VALUES (sector_id, req_id, 'high', true)
        ON CONFLICT (industry_sector_id, requirement_id) DO NOTHING;
    END IF;
    
    -- General Business sector mappings
    SELECT id INTO sector_id FROM industry_sectors WHERE name = 'General Business';
    SELECT id INTO req_id FROM requirements_library WHERE requirement_code = 'General.1';
    IF sector_id IS NOT NULL AND req_id IS NOT NULL THEN
        INSERT INTO industry_requirement_mappings (industry_sector_id, requirement_id, relevance_level, sector_specific)
        VALUES (sector_id, req_id, 'standard', true)
        ON CONFLICT (industry_sector_id, requirement_id) DO NOTHING;
    END IF;
    
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_industry_requirement_mappings_sector ON industry_requirement_mappings(industry_sector_id);
CREATE INDEX IF NOT EXISTS idx_industry_requirement_mappings_requirement ON industry_requirement_mappings(requirement_id);
CREATE INDEX IF NOT EXISTS idx_industry_sectors_name ON industry_sectors(name);

-- Add comments for documentation
COMMENT ON TABLE industry_sectors IS 'Industry sectors for sector-specific compliance requirements';
COMMENT ON TABLE industry_requirement_mappings IS 'Maps requirements to industry sectors with relevance levels';
COMMENT ON COLUMN industry_requirement_mappings.relevance_level IS 'Importance level: critical, high, standard, optional';
COMMENT ON COLUMN industry_requirement_mappings.sector_specific IS 'Whether requirement is specific to this sector';