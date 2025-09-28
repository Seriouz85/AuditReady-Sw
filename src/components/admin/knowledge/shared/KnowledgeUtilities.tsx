/**
 * Shared Utilities for Knowledge Management Components
 */

import { Badge } from '@/components/ui/badge';
import { EnhancedKnowledgeSource, GuidancePreview } from './KnowledgeTypes';

// Status badge helper
export const getStatusBadge = (status: string, type: 'source' | 'guidance' = 'source') => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    active: 'default',
    approved: 'default',
    published: 'default',
    pending: 'secondary',
    draft: 'secondary',
    reviewing: 'secondary',
    in_review: 'secondary',
    error: 'destructive',
    rejected: 'destructive',
    inactive: 'outline',
    archived: 'outline'
  };

  return (
    <Badge variant={variants[status] || 'outline'} className="capitalize">
      {status.replace('_', ' ')}
    </Badge>
  );
};

// Filter functions
export const filterSources = (
  sources: EnhancedKnowledgeSource[],
  searchQuery: string,
  selectedCategory: string,
  selectedStatus: string
) => {
  return sources.filter(source => {
    const matchesSearch = searchQuery === '' ||
      source.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.url.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' ||
      source.focusAreas?.includes(selectedCategory);
    
    const matchesStatus = selectedStatus === 'all' || source.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
};

export const filterGuidance = (
  guidancePreviews: GuidancePreview[],
  searchQuery: string,
  selectedCategory: string,
  selectedStatus: string
) => {
  return guidancePreviews.filter(guidance => {
    const matchesSearch = searchQuery === '' ||
      guidance.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guidance.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || guidance.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || guidance.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
};

// Validation helpers
export const validateSourceForm = (source: Partial<any>) => {
  const errors: string[] = [];
  
  if (!source.url) errors.push('URL is required');
  if (!source.domain) errors.push('Domain is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Mock data generators
export const generateMockGuidance = (categories: string[], frameworks: string[]) => {
  return categories.map((category, index) => ({
    category,
    content: `Comprehensive ${category.toLowerCase()} guidance with implementation steps, best practices, and compliance requirements...`,
    quality: 0.85 + (Math.random() * 0.15),
    sources: ['nist.gov', 'iso27001security.com', 'cisecurity.org'].slice(0, Math.floor(Math.random() * 3) + 1),
    frameworks: frameworks.slice(0, Math.floor(Math.random() * 4) + 2),
    lastGenerated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: ['draft', 'approved', 'published'][Math.floor(Math.random() * 3)] as any,
    version: `1.${Math.floor(Math.random() * 5) + 1}.0`,
    approvalWorkflow: {
      submittedAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
      comments: ['Comprehensive content', 'Good framework coverage', 'Needs minor updates']
    }
  }));
};

export const generateMockCategoryStats = (categories: string[]) => {
  return categories.map(category => ({
    category,
    totalGuidance: Math.floor(Math.random() * 10) + 5,
    approvedGuidance: Math.floor(Math.random() * 8) + 3,
    avgQuality: 0.8 + (Math.random() * 0.2),
    lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    sourcesUsed: Math.floor(Math.random() * 5) + 2,
    userSatisfaction: 0.75 + (Math.random() * 0.25)
  }));
};

export const generateMockApprovalQueue = () => {
  return [
    {
      id: '1',
      type: 'source' as const,
      title: 'NIST Cybersecurity Guidelines',
      category: 'Risk Management & Assessment',
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      submittedBy: 'admin@company.com',
      status: 'pending' as const,
      priority: 'high' as const,
      content: 'New NIST cybersecurity guidelines source for risk management',
      metadata: { url: 'https://nist.gov/cybersecurity' }
    },
    {
      id: '2',
      type: 'guidance' as const,
      title: 'Enhanced Access Control Implementation',
      category: 'Access Control & Identity Management',
      submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      submittedBy: 'content.ai@system.com',
      status: 'in_review' as const,
      priority: 'medium' as const,
      content: 'AI-generated comprehensive access control guidance with new implementation strategies',
      metadata: { version: '2.1.0', frameworks: ['iso27001', 'nist'] }
    }
  ];
};