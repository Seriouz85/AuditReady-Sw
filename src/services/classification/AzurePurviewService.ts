import { supabase } from '@/lib/supabase';

export interface ClassificationLabel {
  id: string;
  name: string;
  displayName: string;
  description: string;
  color: string;
  parentId?: string;
  confidentialityLevel: 'public' | 'internal' | 'confidential' | 'restricted' | 'top_secret';
  retentionPeriod?: number; // days
  isBuiltIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DataPolicy {
  id: string;
  name: string;
  description: string;
  type: 'retention' | 'dlp' | 'access' | 'encryption';
  rules: PolicyRule[];
  isActive: boolean;
  appliesTo: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyRule {
  id: string;
  condition: string;
  action: string;
  parameters: Record<string, any>;
}

export interface SensitiveDataDetection {
  id: string;
  fileName: string;
  filePath: string;
  detectedTypes: string[];
  confidence: number;
  locations: DataLocation[];
  scannedAt: string;
  organizationId: string;
}

export interface DataLocation {
  line?: number;
  column?: number;
  length?: number;
  snippet: string;
  type: string;
}

export interface RetentionPolicy {
  id: string;
  name: string;
  description: string;
  retentionPeriod: number; // days
  action: 'delete' | 'archive' | 'notify';
  appliesTo: ClassificationLabel[];
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceReport {
  organizationId: string;
  totalDocuments: number;
  classifiedDocuments: number;
  unclassifiedDocuments: number;
  gdprCompliantDocuments: number;
  ccpaCompliantDocuments: number;
  retentionViolations: number;
  sensitiveDataExposure: {
    high: number;
    medium: number;
    low: number;
  };
  generatedAt: string;
}

class AzurePurviewService {
  private readonly apiEndpoint: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly tenantId: string;

  constructor() {
    this.apiEndpoint = import.meta.env.VITE_AZURE_PURVIEW_ENDPOINT || '';
    this.clientId = import.meta.env.VITE_AZURE_CLIENT_ID || '';
    this.clientSecret = import.meta.env.VITE_AZURE_CLIENT_SECRET || '';
    this.tenantId = import.meta.env.VITE_AZURE_TENANT_ID || '';
  }

  /**
   * Check if Azure Purview integration is configured
   */
  isConfigured(): boolean {
    return !!(this.apiEndpoint && this.clientId && this.tenantId);
  }

  /**
   * Get authentication token for Azure Purview API
   */
  private async getAccessToken(): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Azure Purview integration not configured');
    }

    try {
      const response = await fetch(`https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: 'https://purview.azure.net/.default',
          grant_type: 'client_credentials',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.status}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error getting Azure access token:', error);
      throw error;
    }
  }

  /**
   * Sync classification labels from Azure Purview/Microsoft Information Protection
   */
  async syncClassificationLabels(organizationId: string): Promise<ClassificationLabel[]> {
    try {
      if (!this.isConfigured()) {
        // Return demo/default labels for development
        return this.getDefaultClassificationLabels();
      }

      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.apiEndpoint}/catalog/api/atlas/v2/glossary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch classification labels: ${response.status}`);
      }

      const data = await response.json();
      const labels = this.transformAzureLabels(data);

      // Store labels in database
      await this.storeClassificationLabels(organizationId, labels);

      return labels;
    } catch (error) {
      console.error('Error syncing classification labels:', error);
      // Fallback to default labels
      return this.getDefaultClassificationLabels();
    }
  }

  /**
   * Get default classification labels for demo/development
   */
  private getDefaultClassificationLabels(): ClassificationLabel[] {
    return [
      {
        id: 'public',
        name: 'Public',
        displayName: 'Public',
        description: 'Information that can be shared publicly',
        color: '#22c55e',
        confidentialityLevel: 'public',
        retentionPeriod: 365,
        isBuiltIn: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'internal',
        name: 'Internal',
        displayName: 'Internal Use Only',
        description: 'Information for internal use within the organization',
        color: '#3b82f6',
        confidentialityLevel: 'internal',
        retentionPeriod: 2555, // 7 years
        isBuiltIn: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'confidential',
        name: 'Confidential',
        displayName: 'Confidential',
        description: 'Sensitive information requiring protection',
        color: '#f59e0b',
        confidentialityLevel: 'confidential',
        retentionPeriod: 1825, // 5 years
        isBuiltIn: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'restricted',
        name: 'Restricted',
        displayName: 'Restricted',
        description: 'Highly sensitive information with strict access controls',
        color: '#ef4444',
        confidentialityLevel: 'restricted',
        retentionPeriod: 3650, // 10 years
        isBuiltIn: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'pii',
        name: 'Personal Information',
        displayName: 'Personal Information (PII)',
        description: 'Personally identifiable information subject to GDPR/CCPA',
        color: '#8b5cf6',
        confidentialityLevel: 'restricted',
        retentionPeriod: 1095, // 3 years (GDPR default)
        isBuiltIn: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'financial',
        name: 'Financial Data',
        displayName: 'Financial Information',
        description: 'Financial records and sensitive financial information',
        color: '#dc2626',
        confidentialityLevel: 'restricted',
        retentionPeriod: 2555, // 7 years (financial compliance)
        isBuiltIn: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  /**
   * Transform Azure Purview labels to our format
   */
  private transformAzureLabels(data: any): ClassificationLabel[] {
    // Transform Azure Purview response to our ClassificationLabel format
    // This would parse the actual Azure response structure
    return [];
  }

  /**
   * Store classification labels in database
   */
  private async storeClassificationLabels(organizationId: string, labels: ClassificationLabel[]): Promise<void> {
    try {
      // Store in organization_data_classification_labels table
      const { error } = await supabase
        .from('organization_data_classification_labels')
        .upsert(
          labels.map(label => ({
            organization_id: organizationId,
            label_id: label.id,
            name: label.name,
            display_name: label.displayName,
            description: label.description,
            color: label.color,
            parent_id: label.parentId,
            confidentiality_level: label.confidentialityLevel,
            retention_period: label.retentionPeriod,
            is_built_in: label.isBuiltIn,
            updated_at: new Date().toISOString(),
          }))
        );

      if (error) {
        console.error('Error storing classification labels:', error);
      }
    } catch (error) {
      console.error('Error storing classification labels:', error);
    }
  }

  /**
   * Scan document for sensitive data (PII detection)
   */
  async scanDocumentForSensitiveData(
    organizationId: string,
    fileName: string,
    content: string
  ): Promise<SensitiveDataDetection> {
    try {
      const detectedTypes: string[] = [];
      const locations: DataLocation[] = [];

      // PII Detection Patterns
      const patterns = {
        'SSN': /\b\d{3}-\d{2}-\d{4}\b/g,
        'Credit Card': /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
        'Email': /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        'Phone': /\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
        'IP Address': /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
        'IBAN': /\b[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}\b/g,
        'Passport': /\b[A-Z]{1,2}\d{6,9}\b/g,
        'Driver License': /\b[A-Z]\d{7,8}\b/g,
      };

      const lines = content.split('\n');
      
      for (const [type, pattern] of Object.entries(patterns)) {
        lines.forEach((line, lineIndex) => {
          let match;
          while ((match = pattern.exec(line)) !== null) {
            if (!detectedTypes.includes(type)) {
              detectedTypes.push(type);
            }
            
            locations.push({
              line: lineIndex + 1,
              column: match.index + 1,
              length: match[0].length,
              snippet: line.substring(Math.max(0, match.index - 20), match.index + match[0].length + 20),
              type,
            });
          }
        });
      }

      // Calculate confidence based on number of patterns found
      const confidence = Math.min(detectedTypes.length * 0.2, 1.0);

      const detection: SensitiveDataDetection = {
        id: crypto.randomUUID(),
        fileName,
        filePath: fileName,
        detectedTypes,
        confidence,
        locations,
        scannedAt: new Date().toISOString(),
        organizationId,
      };

      // Store detection results
      await this.storeSensitiveDataDetection(detection);

      return detection;
    } catch (error) {
      console.error('Error scanning document for sensitive data:', error);
      throw error;
    }
  }

  /**
   * Store sensitive data detection results
   */
  private async storeSensitiveDataDetection(detection: SensitiveDataDetection): Promise<void> {
    try {
      const { error } = await supabase
        .from('organization_sensitive_data_detections')
        .insert({
          organization_id: detection.organizationId,
          file_name: detection.fileName,
          file_path: detection.filePath,
          detected_types: detection.detectedTypes,
          confidence: detection.confidence,
          locations: detection.locations,
          scanned_at: detection.scannedAt,
        });

      if (error) {
        console.error('Error storing sensitive data detection:', error);
      }
    } catch (error) {
      console.error('Error storing sensitive data detection:', error);
    }
  }

  /**
   * Get retention policies for organization
   */
  async getRetentionPolicies(organizationId: string): Promise<RetentionPolicy[]> {
    try {
      const { data, error } = await supabase
        .from('organization_retention_policies')
        .select(`
          id,
          name,
          description,
          retention_period,
          action,
          applies_to,
          is_active,
          organization_id,
          created_at,
          updated_at
        `)
        .eq('organization_id', organizationId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching retention policies:', error);
        return [];
      }

      return data?.map(policy => ({
        id: policy.id,
        name: policy.name,
        description: policy.description,
        retentionPeriod: policy.retention_period,
        action: policy.action,
        appliesTo: policy.applies_to || [],
        isActive: policy.is_active,
        organizationId: policy.organization_id,
        createdAt: policy.created_at,
        updatedAt: policy.updated_at,
      })) || [];
    } catch (error) {
      console.error('Error getting retention policies:', error);
      return [];
    }
  }

  /**
   * Create retention policy
   */
  async createRetentionPolicy(policy: Omit<RetentionPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('organization_retention_policies')
        .insert({
          name: policy.name,
          description: policy.description,
          retention_period: policy.retentionPeriod,
          action: policy.action,
          applies_to: policy.appliesTo,
          is_active: policy.isActive,
          organization_id: policy.organizationId,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating retention policy:', error);
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error creating retention policy:', error);
      throw error;
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(organizationId: string): Promise<ComplianceReport> {
    try {
      // Get document classification stats
      const { data: documents, error: docsError } = await supabase
        .from('documents')
        .select('id, classification_label')
        .eq('organization_id', organizationId);

      if (docsError) {
        console.error('Error fetching documents for compliance report:', docsError);
      }

      const totalDocuments = documents?.length || 0;
      const classifiedDocuments = documents?.filter(doc => doc.classification_label).length || 0;
      const unclassifiedDocuments = totalDocuments - classifiedDocuments;

      // Get sensitive data detections
      const { data: detections, error: detectionsError } = await supabase
        .from('organization_sensitive_data_detections')
        .select('confidence')
        .eq('organization_id', organizationId);

      if (detectionsError) {
        console.error('Error fetching detections for compliance report:', detectionsError);
      }

      const sensitiveDataExposure = {
        high: detections?.filter(d => d.confidence >= 0.8).length || 0,
        medium: detections?.filter(d => d.confidence >= 0.5 && d.confidence < 0.8).length || 0,
        low: detections?.filter(d => d.confidence < 0.5).length || 0,
      };

      // GDPR/CCPA compliance estimation (based on PII detection and classification)
      const piiDocs = documents?.filter(doc => 
        doc.classification_label === 'pii' || 
        doc.classification_label === 'personal_information'
      ).length || 0;

      return {
        organizationId,
        totalDocuments,
        classifiedDocuments,
        unclassifiedDocuments,
        gdprCompliantDocuments: piiDocs, // Simplified - would need more complex logic
        ccpaCompliantDocuments: piiDocs, // Simplified - would need more complex logic
        retentionViolations: 0, // Would calculate based on retention policies
        sensitiveDataExposure,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }

  /**
   * Apply automatic classification based on content analysis
   */
  async applyAutomaticClassification(
    organizationId: string,
    fileName: string,
    content: string
  ): Promise<string[]> {
    try {
      // Scan for sensitive data first
      const detection = await this.scanDocumentForSensitiveData(organizationId, fileName, content);
      
      const suggestedLabels: string[] = [];

      // Classification logic based on detected sensitive data
      if (detection.detectedTypes.includes('SSN') || 
          detection.detectedTypes.includes('Credit Card') ||
          detection.detectedTypes.includes('Passport')) {
        suggestedLabels.push('restricted');
      }

      if (detection.detectedTypes.includes('Email') || 
          detection.detectedTypes.includes('Phone')) {
        suggestedLabels.push('pii');
      }

      if (detection.detectedTypes.includes('IBAN') || 
          fileName.toLowerCase().includes('financial') ||
          content.toLowerCase().includes('salary') ||
          content.toLowerCase().includes('invoice')) {
        suggestedLabels.push('financial');
      }

      // Content-based classification
      const contentLower = content.toLowerCase();
      
      if (contentLower.includes('confidential') || 
          contentLower.includes('proprietary') ||
          contentLower.includes('trade secret')) {
        suggestedLabels.push('confidential');
      }

      if (contentLower.includes('internal use only') ||
          contentLower.includes('internal')) {
        suggestedLabels.push('internal');
      }

      // Default to public if no sensitive patterns found
      if (suggestedLabels.length === 0 && detection.detectedTypes.length === 0) {
        suggestedLabels.push('public');
      }

      return [...new Set(suggestedLabels)]; // Remove duplicates
    } catch (error) {
      console.error('Error applying automatic classification:', error);
      return ['internal']; // Safe default
    }
  }
}

export const azurePurviewService = new AzurePurviewService();