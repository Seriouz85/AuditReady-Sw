-- Rename Network Defense to Compliance & Audit
UPDATE unified_compliance_categories
SET name = 'Compliance & Audit',
    description = 'Compliance management, monitoring operations, and audit processes'
WHERE name = 'Network Defense';

-- Update the keyword mapping in ComplianceUnificationService
-- Note: This will be replaced by intelligent mapping soon