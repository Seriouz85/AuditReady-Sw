/**
 * TypeScript type definitions for Microsoft Entra ID integration
 */

export interface EntraIdConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authority?: string;
  domainHint?: string;
  autoProvision?: boolean;
  defaultRole?: 'admin' | 'manager' | 'auditor' | 'viewer';
}

export interface EntraIdUser {
  id: string;
  userPrincipalName: string;
  displayName: string;
  givenName: string;
  surname: string;
  mail: string;
  jobTitle?: string;
  department?: string;
  groups?: string[];
  roles?: string[];
  isGuest: boolean;
  accountEnabled: boolean;
  lastSignInDateTime?: string;
  createdDateTime?: string;
}

export interface EntraIdGroup {
  id: string;
  displayName: string;
  description?: string;
  mail?: string;
  members?: string[];
  groupTypes: string[];
  securityEnabled: boolean;
}

export interface GroupMapping {
  id: string;
  groupId: string;
  groupName: string;
  auditReadyRole: 'admin' | 'manager' | 'auditor' | 'viewer';
  permissions: string[];
  organizationId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProvisioningRule {
  id: string;
  name: string;
  description: string;
  conditions: {
    department?: string[];
    jobTitle?: string[];
    groups?: string[];
    userType?: 'Member' | 'Guest';
  };
  actions: {
    provisionUser: boolean;
    defaultRole: 'admin' | 'manager' | 'auditor' | 'viewer';
    assignToOrganization?: string;
    sendWelcomeEmail: boolean;
  };
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProvisioningResult {
  success: boolean;
  userId?: string;
  error?: string;
  action: 'created' | 'updated' | 'skipped' | 'disabled';
  warnings?: string[];
}

export interface SyncReport {
  id: string;
  startedAt: string;
  completedAt?: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  totalUsers: number;
  usersCreated: number;
  usersUpdated: number;
  usersDisabled: number;
  errors: number;
  errorDetails?: {
    userId: string;
    error: string;
  }[];
  organizationId: string;
  triggeredBy: string;
}

export interface EntraIdConnection {
  id: string;
  name: string;
  tenantId: string;
  clientId: string;
  clientSecret?: string; // Optional for security - not always exposed
  redirectUri?: string; // Optional redirect URI
  scopes?: string[]; // Optional scopes configuration
  status: 'active' | 'inactive' | 'error';
  lastSyncAt?: string;
  lastSyncStatus?: 'success' | 'failed';
  lastTestAt?: string; // For connection testing
  autoSync: boolean;
  syncInterval: number; // minutes
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SAMLConfig {
  entityId: string;
  assertionConsumerServiceURL: string;
  singleLogoutServiceURL: string;
  nameIdFormat: string;
  signRequests: boolean;
  signAssertions: boolean;
  encryptAssertions: boolean;
  certificate?: string;
  privateKey?: string;
}

export interface OIDCConfig {
  issuer: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  jwksUri: string;
  endSessionEndpoint?: string;
  scopesSupported: string[];
  responseTypesSupported: string[];
  grantTypesSupported: string[];
  tokenEndpointAuthMethods: string[];
}

export interface ConditionalAccessPolicy {
  id: string;
  displayName: string;
  description?: string;
  state: 'enabled' | 'disabled' | 'enabledForReportingButNotEnforced';
  conditions: {
    users?: {
      includeUsers?: string[];
      excludeUsers?: string[];
      includeGroups?: string[];
      excludeGroups?: string[];
    };
    applications?: {
      includeApplications?: string[];
      excludeApplications?: string[];
    };
    locations?: {
      includeLocations?: string[];
      excludeLocations?: string[];
    };
    riskLevels?: string[];
    platforms?: string[];
  };
  grantControls?: {
    operator: 'AND' | 'OR';
    builtInControls: string[];
    customAuthenticationFactors?: string[];
    termsOfUse?: string[];
  };
  sessionControls?: {
    applicationEnforcedRestrictions?: boolean;
    cloudAppSecurity?: string;
    signInFrequency?: {
      value: number;
      type: 'days' | 'hours';
    };
  };
}

export interface EntraIdEvent {
  id: string;
  eventType: 'user_created' | 'user_updated' | 'user_disabled' | 'user_deleted' | 'group_membership_changed' | 'sync_completed' | 'sync_failed';
  timestamp: string;
  userId?: string;
  groupId?: string;
  details: Record<string, any>;
  organizationId: string;
}

export interface MFAMethod {
  id: string;
  methodType: 'microsoftAuthenticator' | 'phoneNumber' | 'email' | 'fido2' | 'windowsHelloForBusiness';
  displayName: string;
  isDefault: boolean;
  phoneNumber?: string;
  email?: string;
}

export interface UserSignInActivity {
  lastSignInDateTime?: string;
  lastSignInRequestId?: string;
  lastNonInteractiveSignInDateTime?: string;
  lastNonInteractiveSignInRequestId?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'hidden' | 'none' | 'unknownFutureValue';
  riskState?: 'none' | 'confirmedSafe' | 'remediated' | 'dismissed' | 'atRisk' | 'confirmedCompromised' | 'unknownFutureValue';
}

export interface DirectorySyncConfig {
  enabled: boolean;
  syncInterval: number; // in minutes
  lastSyncAt?: string;
  nextSyncAt?: string;
  syncScope: {
    includeUsers: boolean;
    includeGroups: boolean;
    includeContacts: boolean;
    userFilter?: string;
    groupFilter?: string;
  };
  conflictResolution: {
    preferEntraId: boolean;
    updateLocalUsers: boolean;
    disableRemovedUsers: boolean;
  };
  notifications: {
    emailOnSuccess: boolean;
    emailOnFailure: boolean;
    webhookUrl?: string;
  };
}

export interface EntraIdError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
}

// Utility types
export type EntraIdUserStatus = 'active' | 'inactive' | 'blocked' | 'pending';
export type SyncStatus = 'idle' | 'running' | 'completed' | 'failed' | 'cancelled';
export type AuthenticationMethod = 'password' | 'mfa' | 'sso' | 'certificate';
export type UserType = 'Member' | 'Guest';
export type RiskLevel = 'low' | 'medium' | 'high' | 'none' | 'unknown';

// API Response types
export interface GraphApiResponse<T> {
  '@odata.context': string;
  '@odata.nextLink'?: string;
  value: T[];
}

export interface GraphApiError {
  error: {
    code: string;
    message: string;
    innerError?: {
      'request-id': string;
      date: string;
    };
  };
}