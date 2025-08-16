-- Remove legacy unified_guidance_templates table since we now generate guidance dynamically
-- This migration removes the old hardcoded unified guidance system

-- Drop the table and all related indexes
DROP TABLE IF EXISTS unified_guidance_templates CASCADE;

-- Note: This is safe because:
-- 1. We now generate all unified guidance dynamically from requirements
-- 2. No user data is stored in this table - it was only for templates
-- 3. The new system is more scalable and always synchronized with requirements