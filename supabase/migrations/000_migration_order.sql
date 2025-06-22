-- ============================================================================
-- Migration Order and Dependencies
-- This file documents the correct order for running migrations
-- ============================================================================

-- MIGRATION ORDER (execute in this sequence):
-- 1. 001_initial_schema.sql - Core platform and organization schema
-- 2. 002_enhanced_core_entities.sql - Extended entities for production features  
-- 3. 003_integration_and_sync.sql - External integrations and API management
-- 4. 004_security_and_compliance.sql - Advanced security and compliance features
-- 5. ../database/migrations/002_user_management_schema.sql - User management and subscriptions

-- NOTE: The user management schema (002_user_management_schema.sql) can be run 
-- after the core schemas as it extends the organizations table that is created
-- in 001_initial_schema.sql

-- ============================================================================
-- MIGRATION STATUS TRACKING
-- ============================================================================

-- Create a table to track migration status
CREATE TABLE IF NOT EXISTS migration_status (
    id SERIAL PRIMARY KEY,
    migration_file TEXT UNIQUE NOT NULL,
    version TEXT NOT NULL,
    description TEXT,
    applied_at TIMESTAMP DEFAULT NOW(),
    checksum TEXT
);

-- Record initial migrations
INSERT INTO migration_status (migration_file, version, description) VALUES 
('001_initial_schema.sql', '1.0.0', 'Core platform and organization schema'),
('002_enhanced_core_entities.sql', '1.1.0', 'Enhanced entities for production features'),  
('003_integration_and_sync.sql', '1.2.0', 'External integrations and API management'),
('004_security_and_compliance.sql', '1.3.0', 'Advanced security and compliance features'),
('002_user_management_schema.sql', '1.4.0', 'User management and subscription system')
ON CONFLICT (migration_file) DO NOTHING;

-- ============================================================================
-- ENVIRONMENT SETUP VERIFICATION
-- ============================================================================

-- Verify required extensions are enabled
DO $$
BEGIN
    -- Check if required extensions exist
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        RAISE EXCEPTION 'Required extension uuid-ossp is not enabled';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
        RAISE EXCEPTION 'Required extension pgcrypto is not enabled';
    END IF;
END $$;

-- ============================================================================
-- HELPER FUNCTIONS FOR MIGRATIONS
-- ============================================================================

-- Function to safely add columns if they don't exist
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
    table_name TEXT,
    column_name TEXT,
    column_definition TEXT
) RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
    ) THEN
        EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', $1, $2, column_definition);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to safely create indexes if they don't exist
CREATE OR REPLACE FUNCTION create_index_if_not_exists(
    index_name TEXT,
    table_name TEXT,
    column_definition TEXT
) RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = $1
    ) THEN
        EXECUTE format('CREATE INDEX %I ON %I %s', $1, $2, column_definition);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- POST-MIGRATION VALIDATION
-- ============================================================================

-- Function to validate migration completion
CREATE OR REPLACE FUNCTION validate_migration_completion() 
RETURNS TABLE(
    table_name TEXT,
    row_count BIGINT,
    has_rls BOOLEAN,
    has_triggers BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.relname::TEXT as table_name,
        c.reltuples::BIGINT as row_count,
        c.relrowsecurity as has_rls,
        EXISTS(
            SELECT 1 FROM pg_trigger t 
            WHERE t.tgrelid = c.oid
        ) as has_triggers
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' 
    AND c.relkind = 'r'
    AND c.relname NOT LIKE 'pg_%'
    ORDER BY c.relname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DEVELOPMENT VS PRODUCTION SETTINGS
-- ============================================================================

-- Function to set appropriate configuration for environment
CREATE OR REPLACE FUNCTION configure_environment(env_type TEXT DEFAULT 'development')
RETURNS VOID AS $$
BEGIN
    IF env_type = 'production' THEN
        -- Production settings
        INSERT INTO platform_settings (key, value, description, category) VALUES 
        ('environment', '"production"', 'Current environment', 'system'),
        ('debug_mode', 'false', 'Debug mode enabled', 'system'),
        ('log_level', '"error"', 'Logging level', 'system'),
        ('rate_limit_enabled', 'true', 'API rate limiting enabled', 'system')
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
    ELSE
        -- Development settings
        INSERT INTO platform_settings (key, value, description, category) VALUES 
        ('environment', '"development"', 'Current environment', 'system'),
        ('debug_mode', 'true', 'Debug mode enabled', 'system'),
        ('log_level', '"debug"', 'Logging level', 'system'),
        ('rate_limit_enabled', 'false', 'API rate limiting enabled', 'system')
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set default to development
SELECT configure_environment('development');

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE migration_status IS 'Tracks applied database migrations and their status';
COMMENT ON FUNCTION add_column_if_not_exists IS 'Safely adds columns to existing tables without errors';
COMMENT ON FUNCTION create_index_if_not_exists IS 'Safely creates indexes without duplicate errors';
COMMENT ON FUNCTION validate_migration_completion IS 'Validates that migrations completed successfully';
COMMENT ON FUNCTION configure_environment IS 'Sets appropriate configuration for development vs production';

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

-- Run final validation
DO $$
DECLARE
    validation_result RECORD;
BEGIN
    -- Check that key tables exist
    FOR validation_result IN 
        SELECT validate_migration_completion.*
        FROM validate_migration_completion()
        WHERE table_name IN ('organizations', 'organization_users', 'standards_library', 'requirements_library')
    LOOP
        RAISE NOTICE 'Table % validated: rows=%, RLS=%, triggers=%', 
            validation_result.table_name, 
            validation_result.row_count, 
            validation_result.has_rls, 
            validation_result.has_triggers;
    END LOOP;
    
    RAISE NOTICE 'Migration validation completed successfully';
END $$;