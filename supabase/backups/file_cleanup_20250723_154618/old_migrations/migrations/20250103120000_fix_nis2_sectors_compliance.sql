-- Fix NIS2 sectors to match official directive (Annex I & II)
-- Remove non-official sectors and add missing official ones

-- First, backup existing data by creating a temporary table
CREATE TABLE IF NOT EXISTS industry_sectors_backup AS 
SELECT * FROM industry_sectors;

-- Remove non-official NIS2 sectors
DELETE FROM industry_sectors 
WHERE name IN (
    'Education',
    'Technology & Software', 
    'Retail & E-commerce',
    'General Business'
);

-- Update existing sector names to match official NIS2 terminology
UPDATE industry_sectors SET name = 'Health' WHERE name = 'Healthcare';
UPDATE industry_sectors SET name = 'Transport' WHERE name = 'Transportation';

-- Fix Banking & Finance entry (keep as is since it covers both Banking and Financial Market Infrastructures)
-- Update description to reflect this
UPDATE industry_sectors 
SET description = 'Banking institutions and financial market infrastructures including payment systems, trading venues, and central counterparties'
WHERE name = 'Banking & Finance';

-- Fix Essential/Important classifications to match official NIS2 directive

-- Manufacturing should only be Important (Annex II), not Essential
UPDATE industry_sectors 
SET nis2_essential = false, nis2_important = true 
WHERE name = 'Manufacturing';

-- Food & Agriculture should only be Important (Annex II), not Essential  
UPDATE industry_sectors 
SET nis2_essential = false, nis2_important = true 
WHERE name = 'Food & Agriculture';

-- Government & Public (Public Administration) should be Essential (Annex I), not Important
UPDATE industry_sectors 
SET nis2_essential = true, nis2_important = false 
WHERE name = 'Government & Public';

-- Add missing official NIS2 sectors

-- ICT Service Management (Annex I - Essential)
INSERT INTO industry_sectors (name, description, nis2_essential, nis2_important, sort_order)
VALUES (
    'ICT Service Management',
    'Providers of ICT services including managed security services, cloud computing services, and data center services',
    true,
    false,
    120
) ON CONFLICT (name) DO NOTHING;

-- Space (Annex I - Essential)  
INSERT INTO industry_sectors (name, description, nis2_essential, nis2_important, sort_order)
VALUES (
    'Space',
    'Space infrastructure operators including satellite operators and ground segment operators',
    true,
    false,
    130
) ON CONFLICT (name) DO NOTHING;

-- Postal and Courier Services (Annex II - Important)
INSERT INTO industry_sectors (name, description, nis2_essential, nis2_important, sort_order)
VALUES (
    'Postal and Courier Services',
    'Postal services and courier services providers for parcels and mail delivery',
    false,
    true,
    140
) ON CONFLICT (name) DO NOTHING;

-- Waste Management (Annex II - Important)
INSERT INTO industry_sectors (name, description, nis2_essential, nis2_important, sort_order)
VALUES (
    'Waste Management',
    'Waste management services including collection, transport, recovery and disposal of waste',
    false,
    true,
    150
) ON CONFLICT (name) DO NOTHING;

-- Digital Providers (Annex II - Important)
INSERT INTO industry_sectors (name, description, nis2_essential, nis2_important, sort_order)
VALUES (
    'Digital Providers',
    'Digital service providers including online marketplaces, search engines, social networks, and cloud computing platforms',
    false,
    true,
    160
) ON CONFLICT (name) DO NOTHING;

-- Research (Annex II - Important)
INSERT INTO industry_sectors (name, description, nis2_essential, nis2_important, sort_order)
VALUES (
    'Research',
    'Research organizations performing research and development activities including public and private research institutions',
    false,
    true,
    170
) ON CONFLICT (name) DO NOTHING;

-- Update descriptions for better clarity and NIS2 compliance

UPDATE industry_sectors 
SET description = 'Energy sector including electricity, oil, gas, hydrogen, and district heating/cooling operators'
WHERE name = 'Energy';

UPDATE industry_sectors 
SET description = 'Transport infrastructure including air, rail, water and road transport, as well as traffic management systems'
WHERE name = 'Transport';

UPDATE industry_sectors 
SET description = 'Health sector including healthcare providers, laboratories, and pharmaceutical manufacturers'
WHERE name = 'Health';

UPDATE industry_sectors 
SET description = 'Water supply and wastewater treatment facilities and distribution systems'
WHERE name = 'Water & Wastewater';

UPDATE industry_sectors 
SET description = 'Digital infrastructure including internet exchange points, DNS service providers, TLD name registries, and cloud computing providers'
WHERE name = 'Digital Infrastructure';

UPDATE industry_sectors 
SET description = 'Public administration entities at central and regional level providing public services'
WHERE name = 'Government & Public';

UPDATE industry_sectors 
SET description = 'Manufacturing of products including automotive, machinery, electronics, textiles, and other industrial goods'
WHERE name = 'Manufacturing';

UPDATE industry_sectors 
SET description = 'Food production, processing, and distribution including agriculture, food manufacturing, and retail food chains'
WHERE name = 'Food & Agriculture';

-- Add comment explaining the changes
COMMENT ON TABLE industry_sectors IS 'Industry sectors aligned with NIS2 Directive Annex I (Essential entities) and Annex II (Important entities). Updated to match official EU classifications.';

-- Log the changes
DO $$
BEGIN
    RAISE NOTICE 'NIS2 sectors updated to match official directive';
    RAISE NOTICE 'Removed non-official sectors: Education, Technology & Software, Retail & E-commerce, General Business';
    RAISE NOTICE 'Added missing official sectors: ICT Service Management, Space, Postal and Courier Services, Waste Management, Digital Providers, Research';
    RAISE NOTICE 'Fixed Essential/Important classifications to match Annex I and II';
END $$;