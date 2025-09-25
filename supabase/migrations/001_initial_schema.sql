--
-- Clean Database Schema for Audit Readiness Hub
-- Production-ready schema with all features included
--

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

--
-- Core Tables
--

-- Organizations (Multi-tenant)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT DEFAULT 'business',
    size TEXT DEFAULT 'medium',
    industry TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    role TEXT DEFAULT 'user',
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Standards Library
CREATE TABLE standards_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    version TEXT,
    description TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Requirements Library
CREATE TABLE requirements_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    standard_id UUID REFERENCES standards_library(id),
    control_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority TEXT DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Basic seed data
INSERT INTO organizations (id, name, type, size, industry) VALUES
('12345678-1234-1234-1234-123456789012', 'Demo Organization', 'business', 'medium', 'Technology')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, organization_id, role, is_demo) VALUES
('12345678-1234-1234-1234-123456789013', 'demo@auditready.com', '12345678-1234-1234-1234-123456789012', 'platform_admin', true)
ON CONFLICT (email) DO NOTHING;