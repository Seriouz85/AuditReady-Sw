/**
 * Shared Types for Knowledge Management Components
 */

import { KnowledgeSource } from '@/services/rag/KnowledgeIngestionService';

export interface EnhancedKnowledgeSource extends Omit<KnowledgeSource, 'id' | 'status'> {
  id: string; // Required id, not optional
  status: 'active' | 'inactive' | 'pending' | 'error' | 'archived' | 'reviewing' | 'approved' | 'rejected';
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'needs_review';
  lastScraped?: string;
  errorCount: number;
  lastError?: string;
  successRate: number;
  contentChunks: number;
  qualityScore: number;
  reviewNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  metadata: {
    scrapingConfig?: any;
    processingRules?: any;
    validationResults?: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GuidancePreview {
  category: string;
  content: string;
  quality: number;
  sources: string[];
  frameworks: string[];
  lastGenerated: string;
  status: 'draft' | 'approved' | 'published' | 'archived';
  version: string;
  approvalWorkflow: {
    submittedAt?: string;
    reviewedAt?: string;
    approvedAt?: string;
    reviewedBy?: string;
    approvedBy?: string;
    comments?: string[];
  };
}

export interface CategoryStats {
  category: string;
  totalGuidance: number;
  approvedGuidance: number;
  avgQuality: number;
  lastUpdated: string;
  sourcesUsed: number;
  userSatisfaction: number;
}

export interface ApprovalWorkflowItem {
  id: string;
  type: 'source' | 'guidance' | 'content';
  title: string;
  category: string;
  submittedAt: string;
  submittedBy: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  content: string;
  metadata: any;
}

export interface ValidationResult {
  score: number;
  checks: {
    name: string;
    passed: boolean;
    score: number;
    details: string;
  }[];
  recommendations: string[];
  confidence: number;
  isValid: boolean;
  metadata: any;
}

// Compliance categories
export const COMPLIANCE_CATEGORIES = [
  'Access Control & Identity Management',
  'Asset Management & Configuration',
  'Data Protection & Encryption',
  'Network Security Controls',
  'Incident Response & Recovery',
  'Risk Management & Assessment',
  'Security Monitoring & Logging',
  'Compliance & Governance',
  'Business Continuity Planning',
  'Physical & Environmental Security',
  'Supplier & Third-Party Management',
  'Security Training & Awareness',
  'Vulnerability Management',
  'Change Management & Controls',
  'Authentication & Authorization',
  'Backup & Recovery Systems',
  'Security Architecture',
  'Mobile Device Management',
  'Cloud Security Controls',
  'Application Security',
  'Cryptographic Controls'
];

export const CONTENT_TYPES = [
  'guidance',
  'standards',
  'bestpractice',
  'implementation',
  'regulatory'
];

export const FRAMEWORKS = [
  'iso27001',
  'iso27002',
  'nist',
  'cis',
  'gdpr',
  'nis2',
  'sox',
  'pci-dss',
  'hipaa'
];