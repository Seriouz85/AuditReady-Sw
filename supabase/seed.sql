--
-- Essential Seed Data for Audit Readiness Hub
-- Contains all unified categories, standards, and demo data
--

-- Insert Unified Compliance Categories (22 categories)
INSERT INTO unified_compliance_categories (id, name, description, icon, color, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Asset Management', 'Hardware and software asset inventory and management', 'Package', '#3B82F6', 1),
('550e8400-e29b-41d4-a716-446655440002', 'Access Control & Identity Management', 'User access controls and identity management systems', 'Key', '#EF4444', 2),
('550e8400-e29b-41d4-a716-446655440003', 'Network Security & Defense', 'Network security controls and defensive measures', 'Shield', '#10B981', 3),
('550e8400-e29b-41d4-a716-446655440004', 'Data Protection & Privacy', 'Data protection, encryption, and privacy controls', 'Lock', '#F59E0B', 4),
('550e8400-e29b-41d4-a716-446655440005', 'Vulnerability Management', 'Vulnerability assessment and patch management', 'AlertTriangle', '#8B5CF6', 5),
('550e8400-e29b-41d4-a716-446655440006', 'Incident Response & Recovery', 'Incident handling and disaster recovery procedures', 'Zap', '#EC4899', 6),
('550e8400-e29b-41d4-a716-446655440007', 'Governance & Leadership', 'Information security governance and management', 'Crown', '#6366F1', 7),
('550e8400-e29b-41d4-a716-446655440008', 'Risk Management', 'Risk assessment and management processes', 'Target', '#DC2626', 8),
('550e8400-e29b-41d4-a716-446655440009', 'Training & Awareness', 'Security awareness and training programs', 'BookOpen', '#059669', 9),
('550e8400-e29b-41d4-a716-446655440010', 'Physical Security', 'Physical and environmental security controls', 'Building', '#7C3AED', 10),
('550e8400-e29b-41d4-a716-446655440011', 'Supplier & Third Party Management', 'Third-party and supplier security management', 'Users', '#0891B2', 11),
('550e8400-e29b-41d4-a716-446655440012', 'Business Continuity & Resilience', 'Business continuity and operational resilience', 'RefreshCw', '#DC2626', 12),
('550e8400-e29b-41d4-a716-446655440013', 'Compliance & Legal', 'Legal compliance and regulatory requirements', 'Scale', '#7C2D12', 13),
('550e8400-e29b-41d4-a716-446655440014', 'Audit Log Management', 'Logging, monitoring, and audit trail management', 'FileText', '#365314', 14),
('550e8400-e29b-41d4-a716-446655440015', 'Communication Security', 'Secure communications and network protocols', 'MessageSquare', '#1E40AF', 15),
('550e8400-e29b-41d4-a716-446655440016', 'System Development & Maintenance', 'Secure system development lifecycle', 'Code', '#BE185D', 16),
('550e8400-e29b-41d4-a716-446655440017', 'Operational Security', 'Day-to-day operational security procedures', 'Settings', '#9333EA', 17),
('550e8400-e29b-41d4-a716-446655440018', 'Cloud Security', 'Cloud service security and management', 'Cloud', '#0284C7', 18),
('550e8400-e29b-41d4-a716-446655440019', 'Mobile & Remote Access', 'Mobile device and remote access security', 'Smartphone', '#059669', 19),
('550e8400-e29b-41d4-a716-446655440020', 'Cryptography & Encryption', 'Cryptographic controls and key management', 'Key', '#7C2D12', 20),
('550e8400-e29b-41d4-a716-446655440021', 'Malware Protection', 'Anti-malware and endpoint protection', 'Shield', '#DC2626', 21),
('550e8400-e29b-41d4-a716-446655440022', 'Configuration Management', 'System and security configuration management', 'Cog', '#4338CA', 22);

-- Insert Standards Library
INSERT INTO standards_library (id, name, version, description, category) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'ISO/IEC 27001', '2022', 'Information Security Management Systems', 'security'),
('650e8400-e29b-41d4-a716-446655440002', 'ISO/IEC 27002', '2022', 'Code of Practice for Information Security Controls', 'security'),
('650e8400-e29b-41d4-a716-446655440003', 'CIS Controls', 'v8', 'Center for Internet Security Critical Security Controls', 'security'),
('650e8400-e29b-41d4-a716-446655440004', 'NIS2 Directive', '2022', 'Network and Information Security Directive', 'compliance'),
('650e8400-e29b-41d4-a716-446655440005', 'NIST Cybersecurity Framework', 'v1.1', 'Framework for Improving Critical Infrastructure Cybersecurity', 'framework');

-- Insert Demo Organization
INSERT INTO organizations (id, name, type, size, industry) VALUES
('34adc4bb-d1e7-43bd-8249-89c76520533d', 'Demo Organization', 'business', 'large', 'Technology');

-- Insert Demo User
INSERT INTO users (id, email, organization_id, role, is_demo) VALUES
('44adc4bb-d1e7-43bd-8249-89c76520533d', 'demo@auditready.com', '34adc4bb-d1e7-43bd-8249-89c76520533d', 'admin', true);

-- Insert sample requirements for ISO 27001 (for demo purposes)
INSERT INTO requirements_library (id, standard_id, control_id, title, description, category, priority, order_index, is_active, audit_ready_guidance) VALUES
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'A.5.1', 'Information security policies', 'Information security policy and topic-specific policies shall be defined, approved by management, published, communicated to and acknowledged by relevant personnel and relevant interested parties, and reviewed at planned intervals and if significant changes occur.', 'Governance & Leadership', 'high', 1, true, 'Establish and maintain comprehensive information security policies that align with business objectives and regulatory requirements.'),
('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'A.5.2', 'Information security roles and responsibilities', 'Information security roles and responsibilities shall be defined and allocated according to the organization needs.', 'Governance & Leadership', 'high', 2, true, 'Define clear roles and responsibilities for information security throughout the organization.'),
('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 'A.5.3', 'Segregation of duties', 'Conflicting duties and conflicting areas of responsibility shall be segregated.', 'Governance & Leadership', 'medium', 3, true, 'Implement proper segregation of duties to reduce the risk of accidental or deliberate misuse of information and systems.'),
('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', 'A.8.1', 'User access management', 'A user access management process shall be implemented to assign or revoke access rights for all user types to all systems and services.', 'Access Control & Identity Management', 'high', 4, true, 'Establish comprehensive user access management processes covering the full lifecycle of user access.'),
('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440001', 'A.8.2', 'Privileged access rights', 'The allocation and use of privileged access rights shall be restricted and managed.', 'Access Control & Identity Management', 'high', 5, true, 'Implement strict controls over privileged access rights including regular review and monitoring.');

-- Insert sample unified requirement mappings
INSERT INTO unified_requirement_mappings (id, requirement_id, unified_requirement_id) VALUES
('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440007'),
('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440007'),
('850e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440007'),
('850e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002'),
('850e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002');

-- Create unified requirements table if missing and insert data
INSERT INTO unified_requirements (id, unified_category_id, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', 'Governance & Leadership', 'Information security governance and management controls'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Access Control & Identity Management', 'User access controls and identity management systems');

-- Note: This represents a subset of requirements for demo purposes
-- In production, all 123+ requirements would be properly mapped to unified categories

SELECT 'Seed data installation complete - ' || COUNT(*) || ' unified categories created' as result
FROM unified_compliance_categories;
