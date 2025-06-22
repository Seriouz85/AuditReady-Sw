-- Migration: Enhanced Assessment Management System
-- This migration adds comprehensive assessment features for production-ready SaaS

-- Assessment Templates Table
CREATE TABLE IF NOT EXISTS assessment_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  standard_ids UUID[] NOT NULL,
  methodology VARCHAR(100) DEFAULT 'standard', -- standard, risk-based, maturity-model
  risk_scoring_enabled BOOLEAN DEFAULT FALSE,
  sections JSONB DEFAULT '[]', -- Customizable sections
  default_workflow_id UUID,
  created_by UUID NOT NULL REFERENCES organization_users(id),
  is_public BOOLEAN DEFAULT FALSE, -- Can be shared across organizations
  tags VARCHAR(50)[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Assessment Workflow Table
CREATE TABLE IF NOT EXISTS assessment_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  stages JSONB NOT NULL, -- Array of workflow stages with approvers
  current_stage INTEGER DEFAULT 0,
  auto_advance BOOLEAN DEFAULT FALSE,
  notification_settings JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES organization_users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced Assessments Table (Add missing columns)
ALTER TABLE assessments 
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES assessment_templates(id),
ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES assessment_workflows(id),
ADD COLUMN IF NOT EXISTS current_workflow_stage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS workflow_status VARCHAR(50) DEFAULT 'not_started', -- not_started, pending_approval, approved, rejected
ADD COLUMN IF NOT EXISTS assigned_team_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS reviewer_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS risk_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS maturity_level INTEGER CHECK (maturity_level >= 1 AND maturity_level <= 5),
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurrence_pattern JSONB, -- {frequency: 'monthly', day: 1, etc.}
ADD COLUMN IF NOT EXISTS parent_assessment_id UUID REFERENCES assessments(id),
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS locked_by UUID REFERENCES organization_users(id),
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS compliance_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS findings_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS critical_findings_count INTEGER DEFAULT 0;

-- Assessment Schedule Table
CREATE TABLE IF NOT EXISTS assessment_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES assessment_templates(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(50) NOT NULL, -- daily, weekly, monthly, quarterly, annually
  start_date DATE NOT NULL,
  end_date DATE,
  next_run_date DATE NOT NULL,
  time_of_day TIME DEFAULT '09:00:00',
  timezone VARCHAR(50) DEFAULT 'UTC',
  assigned_team_ids UUID[] DEFAULT '{}',
  auto_start BOOLEAN DEFAULT FALSE,
  notification_settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES organization_users(id),
  last_run_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Assessment Evidence Table (Enhanced)
CREATE TABLE IF NOT EXISTS assessment_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES requirements_library(id),
  evidence_type VARCHAR(50) NOT NULL, -- document, screenshot, log, system-scan, interview
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT,
  file_size BIGINT,
  file_type VARCHAR(100),
  collected_by UUID NOT NULL REFERENCES organization_users(id),
  collected_at TIMESTAMP DEFAULT NOW(),
  verified_by UUID REFERENCES organization_users(id),
  verified_at TIMESTAMP,
  verification_status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected
  verification_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Assessment Findings Table
CREATE TABLE IF NOT EXISTS assessment_findings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES requirements_library(id),
  finding_type VARCHAR(50) NOT NULL, -- gap, risk, non-conformity, observation
  severity VARCHAR(20) NOT NULL, -- critical, high, medium, low
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  impact TEXT,
  likelihood VARCHAR(20), -- high, medium, low
  risk_rating VARCHAR(20), -- critical, high, medium, low
  remediation_plan TEXT,
  responsible_party UUID REFERENCES organization_users(id),
  due_date DATE,
  status VARCHAR(50) DEFAULT 'open', -- open, in-progress, closed, accepted
  evidence_ids UUID[] DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES organization_users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Assessment Comments (Enhanced for threading)
CREATE TABLE IF NOT EXISTS assessment_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  requirement_id UUID REFERENCES requirements_library(id), -- Optional, for requirement-specific comments
  parent_comment_id UUID REFERENCES assessment_comments(id), -- For threaded discussions
  user_id UUID NOT NULL REFERENCES organization_users(id),
  comment TEXT NOT NULL,
  mentions UUID[] DEFAULT '{}', -- User IDs mentioned in comment
  attachments JSONB DEFAULT '[]',
  is_internal BOOLEAN DEFAULT FALSE, -- Internal notes vs client-visible
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP -- Soft delete
);

-- Assessment Workflow History
CREATE TABLE IF NOT EXISTS assessment_workflow_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES assessment_workflows(id),
  stage INTEGER NOT NULL,
  action VARCHAR(50) NOT NULL, -- submitted, approved, rejected, returned
  actor_id UUID NOT NULL REFERENCES organization_users(id),
  comments TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assessment Analytics Table
CREATE TABLE IF NOT EXISTS assessment_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  metric_type VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,2),
  metric_data JSONB DEFAULT '{}',
  calculated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assessment_templates_org ON assessment_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_assessment_templates_standards ON assessment_templates USING GIN(standard_ids);
CREATE INDEX IF NOT EXISTS idx_assessment_schedules_next_run ON assessment_schedules(next_run_date) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_assessment_evidence_assessment ON assessment_evidence(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_findings_assessment ON assessment_findings(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_findings_status ON assessment_findings(status) WHERE status != 'closed';
CREATE INDEX IF NOT EXISTS idx_assessment_comments_assessment ON assessment_comments(assessment_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_assessment_workflow_history_assessment ON assessment_workflow_history(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessments_workflow ON assessments(workflow_id, current_workflow_stage) WHERE workflow_id IS NOT NULL;

-- Add RLS policies
ALTER TABLE assessment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_workflow_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assessment_templates
CREATE POLICY "Users can view templates in their organization or public templates"
ON assessment_templates FOR SELECT
USING (
  is_public = TRUE OR
  organization_id IN (
    SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create templates in their organization"
ON assessment_templates FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_users 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'manager', 'analyst')
  )
);

-- Function to calculate assessment completion
CREATE OR REPLACE FUNCTION calculate_assessment_completion(assessment_id UUID)
RETURNS TABLE (
  total_requirements INTEGER,
  completed_requirements INTEGER,
  completion_percentage DECIMAL(5,2),
  compliance_score DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_requirements,
    COUNT(CASE WHEN ar.status IN ('fulfilled', 'not-applicable') THEN 1 END)::INTEGER as completed_requirements,
    ROUND(
      COUNT(CASE WHEN ar.status IN ('fulfilled', 'not-applicable') THEN 1 END)::DECIMAL / 
      NULLIF(COUNT(*), 0) * 100, 2
    ) as completion_percentage,
    ROUND(
      COUNT(CASE WHEN ar.status = 'fulfilled' THEN 1 END)::DECIMAL / 
      NULLIF(COUNT(CASE WHEN ar.status != 'not-applicable' THEN 1 END), 0) * 100, 2
    ) as compliance_score
  FROM assessment_requirements ar
  WHERE ar.assessment_id = calculate_assessment_completion.assessment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create recurring assessments
CREATE OR REPLACE FUNCTION create_recurring_assessment()
RETURNS TRIGGER AS $$
DECLARE
  next_date DATE;
BEGIN
  IF NEW.is_recurring AND NEW.recurrence_pattern IS NOT NULL THEN
    -- Calculate next date based on frequency
    CASE (NEW.recurrence_pattern->>'frequency')
      WHEN 'daily' THEN
        next_date := CURRENT_DATE + INTERVAL '1 day';
      WHEN 'weekly' THEN
        next_date := CURRENT_DATE + INTERVAL '1 week';
      WHEN 'monthly' THEN
        next_date := CURRENT_DATE + INTERVAL '1 month';
      WHEN 'quarterly' THEN
        next_date := CURRENT_DATE + INTERVAL '3 months';
      WHEN 'annually' THEN
        next_date := CURRENT_DATE + INTERVAL '1 year';
    END CASE;
    
    -- Create schedule entry
    INSERT INTO assessment_schedules (
      organization_id,
      template_id,
      name,
      frequency,
      start_date,
      next_run_date,
      assigned_team_ids,
      created_by
    ) VALUES (
      NEW.organization_id,
      NEW.template_id,
      NEW.name || ' (Recurring)',
      NEW.recurrence_pattern->>'frequency',
      CURRENT_DATE,
      next_date,
      NEW.assigned_team_ids,
      NEW.created_by
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for recurring assessments
CREATE TRIGGER assessment_recurrence_trigger
AFTER INSERT ON assessments
FOR EACH ROW
EXECUTE FUNCTION create_recurring_assessment();