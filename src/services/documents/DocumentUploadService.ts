import { supabase } from '@/lib/supabase';

export interface UploadedDocument {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy?: string;
}

export class DocumentUploadService {
  private bucketName = 'documents';

  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(
    file: File, 
    organizationId: string, 
    folder?: string
  ): Promise<{ success: boolean; data?: UploadedDocument; error?: string }> {
    try {
      // Validate file
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        return { success: false, error: 'File size must be less than 10MB' };
      }

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = folder 
        ? `${organizationId}/${folder}/${timestamp}_${sanitizedName}`
        : `${organizationId}/${timestamp}_${sanitizedName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      // Save document metadata to database
      const documentData = {
        id: crypto.randomUUID(),
        organization_id: organizationId,
        name: file.name,
        file_path: filePath,
        url: publicUrlData.publicUrl,
        size: file.size,
        type: file.type,
        folder: folder || 'general',
        uploaded_at: new Date().toISOString()
      };

      const { data: dbData, error: dbError } = await supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single();

      if (dbError) throw dbError;

      return {
        success: true,
        data: {
          id: documentData.id,
          name: file.name,
          url: publicUrlData.publicUrl,
          size: file.size,
          type: file.type,
          uploadedAt: documentData.uploaded_at
        }
      };

    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Get documents for an organization
   */
  async getDocuments(organizationId: string, folder?: string): Promise<UploadedDocument[]> {
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .eq('organization_id', organizationId);

      if (folder) {
        query = query.eq('folder', folder);
      }

      const { data, error } = await query.order('uploaded_at', { ascending: false });

      if (error) throw error;

      return data?.map(doc => ({
        id: doc.id,
        name: doc.name,
        url: doc.url,
        size: doc.size,
        type: doc.type,
        uploadedAt: doc.uploaded_at,
        uploadedBy: doc.uploaded_by
      })) || [];

    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string, organizationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get document info
      const { data: doc, error: fetchError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .eq('organization_id', organizationId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(this.bucketName)
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('organization_id', organizationId);

      if (dbError) throw dbError;

      return { success: true };

    } catch (error) {
      console.error('Error deleting document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  }

  /**
   * Demo mode: Store files in localStorage as base64
   */
  async uploadFileDemo(file: File, folder?: string): Promise<{ success: boolean; data?: UploadedDocument; error?: string }> {
    try {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit for demo
        return { success: false, error: 'File size must be less than 5MB in demo mode' };
      }

      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const document: UploadedDocument = {
            id: crypto.randomUUID(),
            name: file.name,
            url: reader.result as string, // base64 data URL
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString()
          };

          // Store in localStorage
          const demoDocuments = JSON.parse(localStorage.getItem('demoDocuments') || '[]');
          demoDocuments.push(document);
          localStorage.setItem('demoDocuments', JSON.stringify(demoDocuments));

          resolve({ success: true, data: document });
        };
        reader.onerror = () => {
          resolve({ success: false, error: 'Failed to read file' });
        };
        reader.readAsDataURL(file);
      });

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Get demo documents from localStorage
   */
  getDemoDocuments(): UploadedDocument[] {
    try {
      return JSON.parse(localStorage.getItem('demoDocuments') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Initialize demo documents with sample data
   */
  initializeDemoDocuments(): void {
    const existingDocs = this.getDemoDocuments();
    
    // Only initialize if no documents exist
    if (existingDocs.length === 0) {
      const mockDocuments: UploadedDocument[] = [
        {
          id: 'demo-doc-1',
          name: 'ISO27001_CompliancePolicy_2024.pdf',
          url: 'data:application/pdf;base64,demo-content-1',
          size: 1250000,
          type: 'application/pdf',
          uploadedAt: '2024-01-15T10:30:00Z',
          uploadedBy: 'demo@auditready.com'
        },
        {
          id: 'demo-doc-2', 
          name: 'SecurityAwarenessTraining_v2.1.pdf',
          url: 'data:application/pdf;base64,demo-content-2',
          size: 980000,
          type: 'application/pdf',
          uploadedAt: '2024-01-10T14:20:00Z',
          uploadedBy: 'demo@auditready.com'
        },
        {
          id: 'demo-doc-3',
          name: 'RiskAssessment_Q4_2024.xlsx',
          url: 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,demo-content-3',
          size: 750000,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          uploadedAt: '2024-01-08T09:15:00Z',
          uploadedBy: 'demo@auditready.com'
        },
        {
          id: 'demo-doc-4',
          name: 'IncidentResponsePlan.docx',
          url: 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,demo-content-4',
          size: 1100000,
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
          uploadedAt: '2024-01-05T16:45:00Z',
          uploadedBy: 'demo@auditready.com'
        },
        {
          id: 'demo-doc-5',
          name: 'BusinessContinuityPlan_2024.pdf',
          url: 'data:application/pdf;base64,demo-content-5',
          size: 2100000,
          type: 'application/pdf',
          uploadedAt: '2024-01-03T11:30:00Z',
          uploadedBy: 'demo@auditready.com'
        },
        {
          id: 'demo-doc-6',
          name: 'EmployeeHandbook_SecuritySection.pdf',
          url: 'data:application/pdf;base64,demo-content-6',
          size: 850000,
          type: 'application/pdf',
          uploadedAt: '2024-01-01T08:00:00Z',
          uploadedBy: 'demo@auditready.com'
        },
        {
          id: 'demo-doc-7',
          name: 'NetworkArchitecture_TechnicalSpecs.pdf',
          url: 'data:application/pdf;base64,demo-content-7',
          size: 1750000,
          type: 'application/pdf',
          uploadedAt: '2023-12-28T13:20:00Z',
          uploadedBy: 'demo@auditready.com'
        },
        {
          id: 'demo-doc-8',
          name: 'VulnerabilityAssessment_Report.pdf',
          url: 'data:application/pdf;base64,demo-content-8',
          size: 1450000,
          type: 'application/pdf', 
          uploadedAt: '2023-12-25T10:10:00Z',
          uploadedBy: 'demo@auditready.com'
        }
      ];

      localStorage.setItem('demoDocuments', JSON.stringify(mockDocuments));
    }
  }
}

export const documentUploadService = new DocumentUploadService();