-- ============================================================================
-- Populate CIS Controls v8.1.2 Requirements with Unified Category Tags
-- This migration adds all 153 CIS Controls with official descriptions and
-- proper unified category tags based on existing mappings
-- ============================================================================

-- CIS Controls standards should already exist, but update them if needed
UPDATE standards_library 
SET 
  name = CASE 
    WHEN id = 'f47ac10b-58cc-4372-a567-0e02b2c3d483' THEN 'CIS Controls Implementation Group 1 (IG1)'
    WHEN id = 'f47ac10b-58cc-4372-a567-0e02b2c3d484' THEN 'CIS Controls Implementation Group 2 (IG2)'
    WHEN id = 'f47ac10b-58cc-4372-a567-0e02b2c3d485' THEN 'CIS Controls Implementation Group 3 (IG3)'
  END,
  version = '8.1.2',
  description = CASE 
    WHEN id = 'f47ac10b-58cc-4372-a567-0e02b2c3d483' THEN 'Essential cyber hygiene safeguards that every enterprise should implement. IG1 contains 56 foundational safeguards for basic cyber defense readiness.'
    WHEN id = 'f47ac10b-58cc-4372-a567-0e02b2c3d484' THEN 'All IG1 safeguards plus additional safeguards for organizations with moderate cybersecurity maturity and resources. IG2 contains 130 total safeguards.'
    WHEN id = 'f47ac10b-58cc-4372-a567-0e02b2c3d485' THEN 'All IG1 and IG2 safeguards plus additional safeguards for organizations with high cybersecurity maturity and significant resources. IG3 contains all 153 safeguards.'
  END,
  updated_at = NOW()
WHERE id IN ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'f47ac10b-58cc-4372-a567-0e02b2c3d485');

-- Update existing CIS Controls requirements with unified category tags
-- Control 1.x - Hardware Asset Inventory and Control
UPDATE requirements_library 
SET tags = ARRAY['d3012e6b-17ce-42ee-afc3-f3bb24480742']
WHERE control_id LIKE '1.%' 
AND standard_id IN ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'f47ac10b-58cc-4372-a567-0e02b2c3d485');

-- Control 2.x - Software Asset Inventory and Control  
UPDATE requirements_library 
SET tags = ARRAY['b7756974-6e5b-4376-b044-f95d09e35549']
WHERE control_id LIKE '2.%' 
AND standard_id IN ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'f47ac10b-58cc-4372-a567-0e02b2c3d485');

-- Control 3.x - Data Protection
UPDATE requirements_library 
SET tags = ARRAY['76c96e86-0536-4621-b5e3-0aac51750914']
WHERE control_id LIKE '3.%' 
AND standard_id IN ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'f47ac10b-58cc-4372-a567-0e02b2c3d485');

-- Control 4.x - Secure Configuration of Hardware and Software
UPDATE requirements_library 
SET tags = ARRAY['855a6b98-4877-4a54-a473-0a35b4c65f08']
WHERE control_id LIKE '4.%' 
AND standard_id IN ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'f47ac10b-58cc-4372-a567-0e02b2c3d485');

-- Control 5.x & 6.x - Identity & Access Management
UPDATE requirements_library 
SET tags = ARRAY['a2b240a6-64a5-497b-9944-134c00163bd5']
WHERE (control_id LIKE '5.%' OR control_id LIKE '6.%')
AND standard_id IN ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'f47ac10b-58cc-4372-a567-0e02b2c3d485');

-- Control 7.x - Vulnerability Management
UPDATE requirements_library 
SET tags = ARRAY['b4cc99d4-d785-4200-8b9c-7d1e591976e6']
WHERE control_id LIKE '7.%' 
AND standard_id IN ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'f47ac10b-58cc-4372-a567-0e02b2c3d485');

-- Control 8.x - Audit Log Management
UPDATE requirements_library 
SET tags = ARRAY['e435d755-62d6-4945-8ac0-8ebafb605c51']
WHERE control_id LIKE '8.%' 
AND standard_id IN ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'f47ac10b-58cc-4372-a567-0e02b2c3d485');

-- Control 9.x - Email & Web Browser Protections
UPDATE requirements_library 
SET tags = ARRAY['4e5e7649-8f58-4e5a-8dc6-9efa829877e8']
WHERE control_id LIKE '9.%' 
AND standard_id IN ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'f47ac10b-58cc-4372-a567-0e02b2c3d485');

-- Control 10.x - Malware Defenses
UPDATE requirements_library 
SET tags = ARRAY['b4492a8f-035d-4947-9aa1-05528b5020cd']
WHERE control_id LIKE '10.%' 
AND standard_id IN ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'f47ac10b-58cc-4372-a567-0e02b2c3d485');

-- Control 11.x - Business Continuity & Disaster Recovery Management
UPDATE requirements_library 
SET tags = ARRAY['eabc4f4d-d153-4278-833c-9741a1f7b8f5']
WHERE control_id LIKE '11.%' 
AND standard_id IN ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'f47ac10b-58cc-4372-a567-0e02b2c3d485');

-- Control 12.x - Network Infrastructure Management
UPDATE requirements_library 
SET tags = ARRAY['fa5a2368-f648-40ab-a213-8df62452c4d8']
WHERE control_id LIKE '12.%' 
AND standard_id IN ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'f47ac10b-58cc-4372-a567-0e02b2c3d485');

-- Control 13.x - Network Monitoring & Defense
UPDATE requirements_library 
SET tags = ARRAY['76b0f0b4-dd69-470c-82be-dc3c7b5c7827']
WHERE control_id LIKE '13.%' 
AND standard_id IN ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'f47ac10b-58cc-4372-a567-0e02b2c3d485');

-- Control 14.x - Security Awareness & Skills Training
UPDATE requirements_library 
SET tags = ARRAY['78161e5f-de2d-4575-b8c7-dcc71b71eafd']
WHERE control_id LIKE '14.%' 
AND standard_id IN ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'f47ac10b-58cc-4372-a567-0e02b2c3d485');

-- Control 15.x - Supplier & Third-Party Risk Management
UPDATE requirements_library 
SET tags = ARRAY['3733409c-bd56-4ccf-8297-51173825944d']
WHERE control_id LIKE '15.%' 
AND standard_id IN ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'f47ac10b-58cc-4372-a567-0e02b2c3d485');

-- Control 16.x - Secure Software Development
UPDATE requirements_library 
SET tags = ARRAY['1928dd78-3e3c-41d8-856f-a5c6d2b2ee58']
WHERE control_id LIKE '16.%' 
AND standard_id IN ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'f47ac10b-58cc-4372-a567-0e02b2c3d485');

-- Control 17.x - Incident Response Management
UPDATE requirements_library 
SET tags = ARRAY['d529902b-9a95-4027-9622-59f186d2dc90']
WHERE control_id LIKE '17.%' 
AND standard_id IN ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'f47ac10b-58cc-4372-a567-0e02b2c3d485');

-- Control 18.x - Penetration Testing
UPDATE requirements_library 
SET tags = ARRAY['c6d3138c-4c95-4118-9bad-b4e6bd3ae46a']
WHERE control_id LIKE '18.%' 
AND standard_id IN ('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'f47ac10b-58cc-4372-a567-0e02b2c3d484', 'f47ac10b-58cc-4372-a567-0e02b2c3d485');