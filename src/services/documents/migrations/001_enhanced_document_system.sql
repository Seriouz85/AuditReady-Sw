-- Enhanced Document Management System with Version Control
-- Migration: 001_enhanced_document_system.sql

-- Document metadata table
CREATE TABLE IF NOT EXISTS document_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  file_type TEXT NOT NULL,
  current_version INTEGER DEFAULT 1,
  total_versions INTEGER DEFAULT 1,
  file_size BIGINT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  modified_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Version control
  is_locked BOOLEAN DEFAULT FALSE,
  locked_by UUID REFERENCES users(id),
  locked_at TIMESTAMP WITH TIME ZONE,
  
  -- Access control
  access_level TEXT CHECK (access_level IN ('public', 'internal', 'confidential', 'restricted')) DEFAULT 'internal',
  allowed_users UUID[] DEFAULT '{}',
  allowed_roles TEXT[] DEFAULT '{}',
  
  -- Workflow
  status TEXT CHECK (status IN ('draft', 'under_review', 'approved', 'published', 'archived')) DEFAULT 'draft',
  review_status TEXT CHECK (review_status IN ('pending', 'approved', 'rejected', 'changes_requested')) DEFAULT 'pending',
  reviewer_id UUID REFERENCES users(id),
  review_notes TEXT,
  
  -- Compliance
  compliance_tags TEXT[] DEFAULT '{}',
  retention_period INTEGER, -- in days
  disposal_date TIMESTAMP WITH TIME ZONE,
  
  -- Relationships
  parent_document_id UUID REFERENCES document_metadata(id),
  related_assessment_ids UUID[] DEFAULT '{}',
  related_requirement_ids UUID[] DEFAULT '{}'
);

-- Document versions table
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES document_metadata(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  checksum TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  change_notes TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  
  UNIQUE(document_id, version_number)
);

-- Document activities table for audit logging
CREATE TABLE IF NOT EXISTS document_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES document_metadata(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL CHECK (action IN ('created', 'uploaded', 'downloaded', 'viewed', 'edited', 'approved', 'rejected', 'locked', 'unlocked', 'deleted')),
  details TEXT,
  version_number INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document shares table for sharing functionality
CREATE TABLE IF NOT EXISTS document_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES document_metadata(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES users(id),
  shared_with UUID REFERENCES users(id), -- Internal user
  shared_with_email TEXT, -- External email
  access_type TEXT CHECK (access_type IN ('view', 'download', 'edit')) DEFAULT 'view',
  expires_at TIMESTAMP WITH TIME ZONE,
  password_protected BOOLEAN DEFAULT FALSE,
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CHECK (
    (shared_with IS NOT NULL AND shared_with_email IS NULL) OR 
    (shared_with IS NULL AND shared_with_email IS NOT NULL)
  )
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_document_metadata_organization_id ON document_metadata(organization_id);
CREATE INDEX IF NOT EXISTS idx_document_metadata_created_by ON document_metadata(created_by);
CREATE INDEX IF NOT EXISTS idx_document_metadata_status ON document_metadata(status);
CREATE INDEX IF NOT EXISTS idx_document_metadata_category ON document_metadata(category);
CREATE INDEX IF NOT EXISTS idx_document_metadata_updated_at ON document_metadata(updated_at);
CREATE INDEX IF NOT EXISTS idx_document_metadata_tags ON document_metadata USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_document_metadata_compliance_tags ON document_metadata USING GIN(compliance_tags);

CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_is_current ON document_versions(document_id, is_current) WHERE is_current = TRUE;
CREATE INDEX IF NOT EXISTS idx_document_versions_version_number ON document_versions(document_id, version_number);

CREATE INDEX IF NOT EXISTS idx_document_activities_document_id ON document_activities(document_id);
CREATE INDEX IF NOT EXISTS idx_document_activities_user_id ON document_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_document_activities_action ON document_activities(action);
CREATE INDEX IF NOT EXISTS idx_document_activities_created_at ON document_activities(created_at);

CREATE INDEX IF NOT EXISTS idx_document_shares_document_id ON document_shares(document_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_shared_by ON document_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_document_shares_shared_with ON document_shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_document_shares_expires_at ON document_shares(expires_at);

-- RLS (Row Level Security) policies
ALTER TABLE document_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;

-- Document metadata policies
CREATE POLICY "Users can view documents in their organization" ON document_metadata
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create documents in their organization" ON document_metadata
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update documents they created or have permissions" ON document_metadata
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM organization_users 
      WHERE user_id = auth.uid()
    )
    AND (
      created_by = auth.uid() OR
      modified_by = auth.uid() OR
      auth.uid() = ANY(allowed_users) OR
      EXISTS (
        SELECT 1 FROM organization_users ou
        WHERE ou.user_id = auth.uid() 
        AND ou.organization_id = document_metadata.organization_id
        AND ou.role = ANY(allowed_roles)
      )
    )
  );

-- Document versions policies
CREATE POLICY "Users can view versions of accessible documents" ON document_versions
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM document_metadata
      WHERE organization_id IN (
        SELECT organization_id FROM organization_users 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create versions for accessible documents" ON document_versions
  FOR INSERT WITH CHECK (
    document_id IN (
      SELECT id FROM document_metadata
      WHERE organization_id IN (
        SELECT organization_id FROM organization_users 
        WHERE user_id = auth.uid()
      )
    )
    AND created_by = auth.uid()
  );

-- Document activities policies
CREATE POLICY "Users can view activities for accessible documents" ON document_activities
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM document_metadata
      WHERE organization_id IN (
        SELECT organization_id FROM organization_users 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create activity logs" ON document_activities
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND document_id IN (
      SELECT id FROM document_metadata
      WHERE organization_id IN (
        SELECT organization_id FROM organization_users 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Document shares policies
CREATE POLICY "Users can view shares for accessible documents" ON document_shares
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM document_metadata
      WHERE organization_id IN (
        SELECT organization_id FROM organization_users 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create shares for accessible documents" ON document_shares
  FOR INSERT WITH CHECK (
    shared_by = auth.uid()
    AND document_id IN (
      SELECT id FROM document_metadata
      WHERE organization_id IN (
        SELECT organization_id FROM organization_users 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Functions for maintaining data integrity

-- Function to update document metadata when new version is added
CREATE OR REPLACE FUNCTION update_document_on_version_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the document metadata with new version info
  UPDATE document_metadata 
  SET 
    current_version = CASE WHEN NEW.is_current THEN NEW.version_number ELSE current_version END,
    total_versions = (
      SELECT COUNT(*) FROM document_versions 
      WHERE document_id = NEW.document_id
    ),
    file_size = CASE WHEN NEW.is_current THEN NEW.file_size ELSE file_size END,
    file_type = CASE WHEN NEW.is_current THEN NEW.file_type ELSE file_type END,
    updated_at = NOW()
  WHERE id = NEW.document_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update document metadata
DROP TRIGGER IF EXISTS trigger_update_document_on_version_insert ON document_versions;
CREATE TRIGGER trigger_update_document_on_version_insert
  AFTER INSERT ON document_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_document_on_version_insert();

-- Function to ensure only one current version per document
CREATE OR REPLACE FUNCTION ensure_single_current_version()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_current THEN
    -- Mark all other versions as not current
    UPDATE document_versions 
    SET is_current = FALSE 
    WHERE document_id = NEW.document_id 
    AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure single current version
DROP TRIGGER IF EXISTS trigger_ensure_single_current_version ON document_versions;
CREATE TRIGGER trigger_ensure_single_current_version
  BEFORE INSERT OR UPDATE ON document_versions
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_current_version();

-- Function to automatically unlock documents when user is deleted
CREATE OR REPLACE FUNCTION unlock_documents_on_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE document_metadata 
  SET 
    is_locked = FALSE,
    locked_by = NULL,
    locked_at = NULL
  WHERE locked_by = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to unlock documents when user is deleted
DROP TRIGGER IF EXISTS trigger_unlock_documents_on_user_delete ON users;
CREATE TRIGGER trigger_unlock_documents_on_user_delete
  BEFORE DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION unlock_documents_on_user_delete();