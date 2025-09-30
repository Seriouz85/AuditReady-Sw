-- CATEGORY CLEANUP MAPPING
-- Map duplicate categories (22-36) to correct categories (1-21)

-- CORRECT CATEGORIES (1-21):
-- 1  = Governance & Leadership (a595ff1d-161c-4af6-8d7e-f9d47feeb525)
-- 2  = Risk Management (57423730-d6e4-425d-aab1-e02d4babcea0)
-- 3  = Inventory and Control of Software Assets (b7756974-6e5b-4376-b044-f95d09e35549)
-- 4  = Inventory and Control of Hardware Assets (d3012e6b-17ce-42ee-afc3-f3bb24480742)
-- 5  = Identity & Access Management (a2b240a6-64a5-497b-9944-134c00163bd5)
-- 6  = Data Protection (76c96e86-0536-4621-b5e3-0aac51750914)
-- 7  = Secure Configuration of Hardware and Software (855a6b98-4877-4a54-a473-0a35b4c65f08)
-- 8  = Vulnerability Management (b4cc99d4-d785-4200-8b9c-7d1e591976e6)
-- 9  = Physical & Environmental Security Controls (60766790-ea76-4a98-923f-c1a1af5374aa)
-- 10 = Network Infrastructure Management (fa5a2368-f648-40ab-a213-8df62452c4d8)
-- 11 = Secure Software Development (1928dd78-3e3c-41d8-856f-a5c6d2b2ee58)
-- 12 = Network Monitoring & Defense (76b0f0b4-dd69-470c-82be-dc3c7b5c7827)
-- 13 = Supplier & Third-Party Risk Management (3733409c-bd56-4ccf-8297-51173825944d)
-- 14 = Security Awareness & Skills Training (78161e5f-de2d-4575-b8c7-dcc71b71eafd)
-- 15 = Business Continuity & Disaster Recovery Management (eabc4f4d-d153-4278-833c-9741a1f7b8f5)
-- 16 = Incident Response Management (d529902b-9a95-4027-9622-59f186d2dc90)
-- 17 = Malware Defenses (b4492a8f-035d-4947-9aa1-05528b5020cd)
-- 18 = Email & Web Browser Protections (4e5e7649-8f58-4e5a-8dc6-9efa829877e8)
-- 19 = Penetration Testing (c6d3138c-4c95-4118-9bad-b4e6bd3ae46a)
-- 20 = Audit Log Management (e435d755-62d6-4945-8ac0-8ebafb605c51)
-- 21 = GDPR Unified Compliance (397d97f9-2452-4eb0-b367-024152a5d948)

-- DUPLICATE/WRONG CATEGORIES TO REMAP:

BEGIN;

-- 23: "Asset Management" (18 reqs) → #3/#4 (split between software and hardware)
-- For now map to #3 Inventory and Control of Software Assets
UPDATE requirements_library
SET category_id = 'b7756974-6e5b-4376-b044-f95d09e35549'
WHERE category_id = 'd089b159-240d-493a-95cb-94ad34ab0951';

-- 24: "Business Continuity" (7 reqs) → #15 Business Continuity & Disaster Recovery Management
UPDATE requirements_library
SET category_id = 'eabc4f4d-d153-4278-833c-9741a1f7b8f5'
WHERE category_id = '147aed36-cd88-457a-b6d6-742709c3955b';

-- 25: "Configuration Management" (14 reqs) → #7 Secure Configuration of Hardware and Software
UPDATE requirements_library
SET category_id = '855a6b98-4877-4a54-a473-0a35b4c65f08'
WHERE category_id = '2bf9d5ee-6f92-47e0-b1a3-f3cb9af6f379';

-- 26: "Incident Response" (4 reqs) → #16 Incident Response Management
UPDATE requirements_library
SET category_id = 'd529902b-9a95-4027-9622-59f186d2dc90'
WHERE category_id = 'bb5a0b3c-7a21-4fc4-9d78-03f944625170';

-- 27: "Logging & Monitoring" (18 reqs) → #20 Audit Log Management
UPDATE requirements_library
SET category_id = 'e435d755-62d6-4945-8ac0-8ebafb605c51'
WHERE category_id = 'bca3bef2-6201-4457-aa25-a69f4f8d14a9';

-- 28: "Malware Defense" (7 reqs) → #17 Malware Defenses
UPDATE requirements_library
SET category_id = 'b4492a8f-035d-4947-9aa1-05528b5020cd'
WHERE category_id = 'db8b701e-e923-4d4f-9df3-15f0d3acf72f';

-- 29: "Network Security" (22 reqs) → #12 Network Monitoring & Defense
UPDATE requirements_library
SET category_id = '76b0f0b4-dd69-470c-82be-dc3c7b5c7827'
WHERE category_id = '9269da9b-4e6d-4803-8745-51dd88e5bdd1';

-- 30: "Organizational controls" (36 reqs) → #1 Governance & Leadership
UPDATE requirements_library
SET category_id = 'a595ff1d-161c-4af6-8d7e-f9d47feeb525'
WHERE category_id = '836496c7-0dcc-437c-903c-ea42ec156bce';

-- 31: "People controls" (4 reqs) → #14 Security Awareness & Skills Training
UPDATE requirements_library
SET category_id = '78161e5f-de2d-4575-b8c7-dcc71b71eafd'
WHERE category_id = 'dda99117-4e47-4733-848f-224bf3a6066a';

-- 32: "Physical controls" (14 reqs) → #9 Physical & Environmental Security Controls
UPDATE requirements_library
SET category_id = '60766790-ea76-4a98-923f-c1a1af5374aa'
WHERE category_id = 'a5125ba1-bc8c-4e4a-acd5-c5e4f678bdf8';

-- 33: "Secure Development" (3 reqs) → #11 Secure Software Development
UPDATE requirements_library
SET category_id = '1928dd78-3e3c-41d8-856f-a5c6d2b2ee58'
WHERE category_id = '84ab7718-ee51-4a06-8c1f-ee1ac7ff03e2';

-- 34: "Security Awareness" (6 reqs) → #14 Security Awareness & Skills Training
UPDATE requirements_library
SET category_id = '78161e5f-de2d-4575-b8c7-dcc71b71eafd'
WHERE category_id = '931167df-04bb-4b94-a54d-f707bb3974ab';

-- 35: "Supplier Risk" (4 reqs) → #13 Supplier & Third-Party Risk Management
UPDATE requirements_library
SET category_id = '3733409c-bd56-4ccf-8297-51173825944d'
WHERE category_id = '77cb5914-22c5-47b5-a6e2-95a8fba103ce';

-- 36: "Technological controls" (31 reqs) → #7 Secure Configuration of Hardware and Software
UPDATE requirements_library
SET category_id = '855a6b98-4877-4a54-a473-0a35b4c65f08'
WHERE category_id = '775a2d0f-f136-47f0-b4a0-1d86d9fe8b10';

-- Now delete the duplicate categories (22-36)
DELETE FROM unified_compliance_categories WHERE sort_order > 21;

-- Fix sort order for #21 GDPR from 22 back to 21
UPDATE unified_compliance_categories
SET sort_order = 21
WHERE id = '397d97f9-2452-4eb0-b367-024152a5d948';

COMMIT;

-- Verify cleanup
SELECT 'Categories after cleanup:' as status;
SELECT id, name, sort_order FROM unified_compliance_categories ORDER BY sort_order;

SELECT 'Requirements per category:' as status;
SELECT
  c.sort_order,
  c.name,
  COUNT(r.id) as requirement_count
FROM unified_compliance_categories c
LEFT JOIN requirements_library r ON r.category_id = c.id
GROUP BY c.id, c.sort_order, c.name
ORDER BY c.sort_order;
