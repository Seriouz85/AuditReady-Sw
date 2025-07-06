import { LearningPath, UserLearningProgress } from '@/types/lms';

// Demo instructor data
export const demoInstructors = {
  'demo-user': {
    name: 'Dr. Sarah Chen',
    avatar: 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=sarah'
  },
  'instructor-1': {
    name: 'Michael Rodriguez',
    avatar: 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=michael'
  },
  'instructor-2': {
    name: 'Dr. Emily Johnson',
    avatar: 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=emily'
  },
  'instructor-3': {
    name: 'Alex Thompson',
    avatar: 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=alex'
  },
  'instructor-4': {
    name: 'Jessica Wilson',
    avatar: 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=jessica'
  },
  'instructor-5': {
    name: 'David Kumar',
    avatar: 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=david'
  }
};

// Demo courses data for LMS system
export const demoCoursesData: LearningPath[] = [
  {
    id: 'demo-1',
    organization_id: 'demo-org',
    title: 'Introduction to Cybersecurity Compliance',
    description: 'Learn the fundamentals of cybersecurity compliance frameworks including GDPR, ISO 27001, and industry best practices',
    category: 'compliance',
    difficulty_level: 'beginner',
    estimated_duration: 150,
    total_modules: 5,
    is_published: true,
    is_mandatory: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    tags: ['compliance', 'security', 'fundamentals', 'GDPR'],
    created_by: 'demo-user',
    updated_by: 'demo-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-2',
    organization_id: 'demo-org',
    title: 'Advanced Phishing Detection & Response',
    description: 'Master advanced techniques for identifying, reporting, and responding to sophisticated phishing attacks',
    category: 'security-awareness',
    difficulty_level: 'intermediate',
    estimated_duration: 180,
    total_modules: 7,
    is_published: true,
    is_mandatory: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    tags: ['phishing', 'security', 'awareness', 'incident-response'],
    created_by: 'instructor-1',
    updated_by: 'instructor-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-3',
    organization_id: 'demo-org',
    title: 'ISO 27001 Implementation Guide',
    description: 'Complete step-by-step guide to implementing ISO 27001 information security management systems',
    category: 'compliance',
    difficulty_level: 'advanced',
    estimated_duration: 300,
    total_modules: 12,
    is_published: true,
    is_mandatory: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    tags: ['ISO27001', 'security', 'implementation', 'ISMS'],
    created_by: 'instructor-2',
    updated_by: 'instructor-2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-4',
    organization_id: 'demo-org',
    title: 'Data Privacy & GDPR Essentials',
    description: 'Essential training on data protection, privacy rights, and GDPR compliance for all employees',
    category: 'data-protection',
    difficulty_level: 'beginner',
    estimated_duration: 120,
    total_modules: 6,
    is_published: true,
    is_mandatory: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    tags: ['GDPR', 'privacy', 'data-protection', 'compliance'],
    created_by: 'instructor-3',
    updated_by: 'instructor-3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-5',
    organization_id: 'demo-org',
    title: 'Secure Remote Work Practices',
    description: 'Learn essential security practices for remote work including VPN usage, device security, and secure communications',
    category: 'security-awareness',
    difficulty_level: 'beginner',
    estimated_duration: 90,
    total_modules: 4,
    is_published: true,
    is_mandatory: true,
    thumbnail_url: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    tags: ['remote-work', 'VPN', 'device-security', 'communications'],
    created_by: 'instructor-4',
    updated_by: 'instructor-4',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-6',
    organization_id: 'demo-org',
    title: 'Incident Response & Crisis Management',
    description: 'Comprehensive training on cybersecurity incident response procedures and crisis management protocols',
    category: 'risk',
    difficulty_level: 'intermediate',
    estimated_duration: 240,
    total_modules: 10,
    is_published: true,
    is_mandatory: false,
    thumbnail_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    tags: ['incident-response', 'crisis-management', 'security', 'procedures'],
    created_by: 'instructor-5',
    updated_by: 'instructor-5',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Demo progress data
export const demoProgressData: UserLearningProgress[] = [
  {
    id: 'prog-1',
    user_id: 'demo-user',
    learning_path_id: 'demo-1',
    progress_percentage: 75,
    time_spent_minutes: 120,
    last_accessed_at: new Date().toISOString(),
    completed_at: null,
    certificate_issued: false
  },
  {
    id: 'prog-2',
    user_id: 'demo-user',
    learning_path_id: 'demo-2',
    progress_percentage: 45,
    time_spent_minutes: 85,
    last_accessed_at: new Date(Date.now() - 86400000).toISOString(),
    completed_at: null,
    certificate_issued: false
  },
  {
    id: 'prog-3',
    user_id: 'demo-user',
    learning_path_id: 'demo-3',
    progress_percentage: 15,
    time_spent_minutes: 45,
    last_accessed_at: new Date(Date.now() - 172800000).toISOString(),
    completed_at: null,
    certificate_issued: false
  },
  {
    id: 'prog-4',
    user_id: 'demo-user',
    learning_path_id: 'demo-4',
    progress_percentage: 100,
    time_spent_minutes: 120,
    last_accessed_at: new Date(Date.now() - 259200000).toISOString(),
    completed_at: new Date(Date.now() - 259200000).toISOString(),
    certificate_issued: true
  },
  {
    id: 'prog-5',
    user_id: 'demo-user',
    learning_path_id: 'demo-5',
    progress_percentage: 100,
    time_spent_minutes: 90,
    last_accessed_at: new Date(Date.now() - 345600000).toISOString(),
    completed_at: new Date(Date.now() - 345600000).toISOString(),
    certificate_issued: true
  },
  {
    id: 'prog-6',
    user_id: 'demo-user',
    learning_path_id: 'demo-6',
    progress_percentage: 0,
    time_spent_minutes: 0,
    last_accessed_at: null,
    completed_at: null,
    certificate_issued: false
  }
];