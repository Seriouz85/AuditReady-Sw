// Azure-synced Application UI Components
export { 
  ConfidenceLevelIndicator, 
  CompactConfidenceIndicator 
} from './ConfidenceLevelIndicator';

export { 
  SyncStatusIndicator, 
  CompactSyncIndicator 
} from './SyncStatusIndicator';

export { RequirementAnsweringInterface } from './RequirementAnsweringInterface';

export { AzureApplicationDetailView } from './AzureApplicationDetailView';

export { 
  AzureApplicationDemo,
  CustomerDataPlatformDemo,
  EnterpriseAPIGatewayDemo,
  FinancialDataLakeDemo,
  CustomerMobileAppDemo,
  IoTPlatformDemo,
  DocumentManagementDemo
} from './DemoIntegration';

// Type re-exports for convenience
export type { 
  EnhancedApplication, 
  RequirementFulfillment, 
  AzureSyncMetadata,
  SyncStatus,
  ConfidenceLevel,
  RequirementStatus
} from '@/types/applications';