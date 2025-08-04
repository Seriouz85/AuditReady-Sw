-- Enable RLS on tables with existing policies but RLS disabled
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issued_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_tenant_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Enable RLS on backup tables (or consider moving to private schema)
ALTER TABLE public.requirements_library_guidance_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_guidance_backup ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policies for backup tables (admin only access)
CREATE POLICY "Admin only access" ON public.requirements_library_guidance_backup
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admin only access" ON public.emergency_guidance_backup
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add RLS policies for data classification tables
-- organization_data_classification_labels
CREATE POLICY "Users can view their organization's data classification labels" ON public.organization_data_classification_labels
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage their organization's data classification labels" ON public.organization_data_classification_labels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.organization_id = organization_data_classification_labels.organization_id
      AND users.role = 'admin'
    )
  );

-- organization_data_policies
CREATE POLICY "Users can view their organization's data policies" ON public.organization_data_policies
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage their organization's data policies" ON public.organization_data_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.organization_id = organization_data_policies.organization_id
      AND users.role = 'admin'
    )
  );

-- organization_retention_policies
CREATE POLICY "Users can view their organization's retention policies" ON public.organization_retention_policies
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage their organization's retention policies" ON public.organization_retention_policies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.organization_id = organization_retention_policies.organization_id
      AND users.role = 'admin'
    )
  );

-- organization_sensitive_data_detections
CREATE POLICY "Users can view their organization's sensitive data detections" ON public.organization_sensitive_data_detections
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage their organization's sensitive data detections" ON public.organization_sensitive_data_detections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.organization_id = organization_sensitive_data_detections.organization_id
      AND users.role = 'admin'
    )
  );

-- Fix function search paths for security
ALTER FUNCTION public.increment_content_version() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_forum_stats() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_topic_stats() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;