-- Create unified_requirements table for AI mapping dashboard
CREATE TABLE IF NOT EXISTS unified_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    frameworks TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
    guidance TEXT,
    confidence_score DECIMAL(3,2),
    sources_used TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    compliance_frameworks JSONB DEFAULT '{}',
    implementation_notes TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_unified_requirements_org_id ON unified_requirements(organization_id);
CREATE INDEX IF NOT EXISTS idx_unified_requirements_category ON unified_requirements(category);
CREATE INDEX IF NOT EXISTS idx_unified_requirements_status ON unified_requirements(status);
CREATE INDEX IF NOT EXISTS idx_unified_requirements_frameworks ON unified_requirements USING gin(frameworks);

-- Enable RLS
ALTER TABLE unified_requirements ENABLE ROW LEVEL SECURITY;

-- RLS Policy for organization access
CREATE POLICY unified_requirements_org_policy ON unified_requirements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organization_users ou 
            WHERE ou.organization_id = unified_requirements.organization_id 
            AND ou.user_id = auth.uid()
        )
    );

-- Platform admin access
CREATE POLICY unified_requirements_platform_admin_policy ON unified_requirements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM platform_administrators pa 
            WHERE pa.email = (SELECT email FROM auth.users WHERE id = auth.uid())
            AND pa.is_active = true
        )
    );

-- Insert sample unified requirements for demo
INSERT INTO unified_requirements (
    organization_id, 
    category, 
    title, 
    description, 
    frameworks,
    status
) VALUES 
(
    '34adc4bb-d1e7-43bd-8249-89c76520533d', -- Demo org ID
    'Access Control & Identity Management',
    'Multi-Factor Authentication Implementation',
    'Implement multi-factor authentication for all administrative accounts and privileged users to enhance security and prevent unauthorized access.',
    ARRAY['ISO 27001', 'NIST CSF', 'CIS Controls'],
    'active'
),
(
    '34adc4bb-d1e7-43bd-8249-89c76520533d',
    'Data Protection & Encryption',
    'Data Encryption at Rest and in Transit',
    'Ensure all sensitive data is encrypted using industry-standard encryption algorithms both when stored and during transmission.',
    ARRAY['ISO 27001', 'GDPR', 'SOC 2'],
    'active'
),
(
    '34adc4bb-d1e7-43bd-8249-89c76520533d',
    'Network Security Controls',
    'Network Segmentation and Firewalling',
    'Implement network segmentation and properly configured firewalls to control and monitor network traffic between different zones.',
    ARRAY['NIST CSF', 'CIS Controls', 'ISO 27001'],
    'active'
),
(
    '34adc4bb-d1e7-43bd-8249-89c76520533d',
    'Incident Response & Recovery',
    'Incident Response Plan and Testing',
    'Develop, maintain, and regularly test an incident response plan to ensure effective handling of security incidents.',
    ARRAY['ISO 27001', 'NIST CSF', 'SOC 2'],
    'active'
),
(
    '34adc4bb-d1e7-43bd-8249-89c76520533d',
    'Risk Management & Assessment',
    'Regular Risk Assessments',
    'Conduct regular risk assessments to identify, analyze, and evaluate security risks to organizational assets.',
    ARRAY['ISO 27001', 'NIST CSF', 'CIS Controls'],
    'active'
),
(
    '34adc4bb-d1e7-43bd-8249-89c76520533d',
    'Security Monitoring & Logging',
    'Continuous Security Monitoring',
    'Implement continuous security monitoring and logging systems to detect and respond to security events in real-time.',
    ARRAY['NIST CSF', 'CIS Controls', 'SOC 2'],
    'active'
),
(
    '34adc4bb-d1e7-43bd-8249-89c76520533d',
    'Compliance & Governance',
    'Compliance Framework Management',
    'Establish and maintain compliance with relevant regulatory frameworks and industry standards.',
    ARRAY['ISO 27001', 'GDPR', 'SOC 2'],
    'active'
),
(
    '34adc4bb-d1e7-43bd-8249-89c76520533d',
    'Business Continuity Planning',
    'Business Continuity and Disaster Recovery',
    'Develop and maintain business continuity and disaster recovery plans to ensure operational resilience.',
    ARRAY['ISO 27001', 'NIST CSF', 'SOC 2'],
    'active'
),
(
    '34adc4bb-d1e7-43bd-8249-89c76520533d',
    'Physical & Environmental Security',
    'Physical Access Controls',
    'Implement physical security controls to protect facilities, equipment, and information from unauthorized physical access.',
    ARRAY['ISO 27001', 'CIS Controls'],
    'active'
),
(
    '34adc4bb-d1e7-43bd-8249-89c76520533d',
    'Supplier & Third-Party Management',
    'Third-Party Risk Management',
    'Assess and manage security risks associated with third-party suppliers and service providers.',
    ARRAY['ISO 27001', 'SOC 2', 'NIST CSF'],
    'active'
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_unified_requirements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER unified_requirements_updated_at_trigger
    BEFORE UPDATE ON unified_requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_unified_requirements_updated_at();