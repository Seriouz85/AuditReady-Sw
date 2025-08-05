import { Application } from './index';

export type SyncMode = 'manual' | 'azure';
export type ApplicationSyncMode = SyncMode;
export type SyncStatus = 'synced' | 'pending' | 'error' | 'not_synced' | 'syncing';
export type AzureSyncStatus = SyncStatus;
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type RequirementStatus = 'fulfilled' | 'partially_fulfilled' | 'not_fulfilled' | 'not_applicable';

export interface AzureSyncMetadata {
  lastSyncDate: string;
  syncVersion: string;
  azureResourceId: string;
  azureSubscriptionId: string;
  azureResourceGroup: string;
  syncStatus: SyncStatus;
  syncErrors?: string[] | SyncError[];
  dataSource: string;
  lastSuccessfulSync: string;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  autoAnsweredRequirements: number;
  manualOverrides: number;
}

export interface SyncError {
  id: string;
  message: string;
  code: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

export interface RequirementFulfillment {
  id: string;
  requirementId: string;
  applicationId: string;
  status: RequirementStatus;
  isAutoAnswered: boolean;
  confidenceLevel?: ConfidenceLevel;
  autoAnswerSource?: string;
  evidence: string;
  justification: string;
  responsibleParty: string;
  lastAssessmentDate: string;
  lastModifiedBy: string;
  lastModifiedAt: string;
  isManualOverride: boolean;
  originalAutoAnswer?: RequirementStatus;
  overrideReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnhancedApplication extends Application {
  syncMode: SyncMode;
  azureSyncMetadata?: AzureSyncMetadata;
  requirementFulfillments?: RequirementFulfillment[];
  complianceScore?: number;
}

export interface ApplicationFilter {
  syncMode?: SyncMode;
  status?: Application['status'] | 'all';
  criticality?: Application['criticality'] | 'all';
  complianceScoreRange?: [number, number];
  hasErrors?: boolean;
}

export interface ApplicationStats {
  total: number;
  manual: number;
  azureSynced: number;
  active: number;
  underReview: number;
  critical: number;
  highRisk: number;
  reviewDue: number;
  averageComplianceScore: number;
  autoAnsweredRequirements: number;
  manualOverrides: number;
  syncErrors: number;
  syncedSuccessfully: number;
  pendingSync: number;
  totalRequirements: number;
  autoAnswered: number;
  manuallyAnswered: number;
  avgComplianceScore: number;
}

export interface ApplicationFilters {
  searchQuery: string;
  syncMode: SyncMode | 'all';
  status: Application['status'] | 'all';
  criticality: Application['criticality'] | 'all';
  syncStatus: SyncStatus | 'all';
  complianceScore: { min: number; max: number };
}

export interface AzureSyncConfiguration {
  enabled: boolean;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  autoApproveHighConfidence: boolean;
  confidenceThreshold: ConfidenceLevel;
  notifyOnChanges: boolean;
  notificationRecipients: string[];
  excludedRequirements: string[];
  customMappings: Record<string, string>;
}

export interface AzureResource {
  resourceId: string;
  subscriptionId: string;
  resourceGroup: string;
  resourceType: string;
  name: string;
  location: string;
  properties: Record<string, any>;
  tags: Record<string, string>;
  securityRecommendations: SecurityRecommendation[];
  complianceState: Record<string, ComplianceState>;
  vulnerabilities: Vulnerability[];
  healthStatus: 'healthy' | 'warning' | 'critical' | 'unknown';
  availability?: number;
  lastBackup?: string;
  discoveredAt: string;
  lastUpdated: string;
}

export interface SecurityRecommendation {
  id: string;
  title: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Active' | 'Dismissed' | 'Resolved';
  description: string;
}

export interface ComplianceState {
  overallCompliance: number;
  controlsAssessed: number;
  controlsPassed: number;
  controlsFailed: number;
}

export interface Vulnerability {
  id: string;
  title: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Active' | 'Resolved' | 'Mitigated';
  cve?: string | null;
}

export interface RequirementSuggestion {
  requirementId: string;
  suggestedStatus: RequirementStatus;
  confidenceLevel: ConfidenceLevel;
  reasoning: string;
  evidenceSource: string;
  azureData: Record<string, any>;
  suggestedAt: string;
}