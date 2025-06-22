import { supabase } from '@/lib/supabase';

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  file_url: string;
  file_size: number;
  file_type: string;
  checksum: string;
  created_by: string;
  created_at: string;
  change_notes?: string;
  is_current: boolean;
}

export interface DocumentMetadata {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  file_type: string;
  current_version: number;
  total_versions: number;
  file_size: number;
  created_by: string;
  modified_by: string;
  created_at: string;
  updated_at: string;
  
  // Version control
  is_locked: boolean;
  locked_by?: string;
  locked_at?: string;
  
  // Access control
  access_level: 'public' | 'internal' | 'confidential' | 'restricted';
  allowed_users: string[];
  allowed_roles: string[];
  
  // Workflow
  status: 'draft' | 'under_review' | 'approved' | 'published' | 'archived';
  review_status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  reviewer_id?: string;
  review_notes?: string;
  
  // Compliance
  compliance_tags: string[];
  retention_period?: number; // in days
  disposal_date?: string;
  
  // Relationships
  parent_document_id?: string;
  related_assessment_ids: string[];
  related_requirement_ids: string[];
}

export interface DocumentActivity {
  id: string;
  document_id: string;
  user_id: string;
  action: 'created' | 'uploaded' | 'downloaded' | 'viewed' | 'edited' | 'approved' | 'rejected' | 'locked' | 'unlocked' | 'deleted';
  details?: string;
  version_number?: number;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface DocumentShare {
  id: string;
  document_id: string;
  shared_by: string;
  shared_with?: string; // User ID
  shared_with_email?: string; // External email
  access_type: 'view' | 'download' | 'edit';
  expires_at?: string;
  password_protected: boolean;
  download_count: number;
  max_downloads?: number;
  created_at: string;
}

export interface DocumentSearchResult {
  document: DocumentMetadata;
  matchType: 'title' | 'content' | 'tags' | 'metadata';
  score: number;
  highlights: string[];
}

export class EnhancedDocumentService {
  private static instance: EnhancedDocumentService;

  static getInstance(): EnhancedDocumentService {
    if (!EnhancedDocumentService.instance) {
      EnhancedDocumentService.instance = new EnhancedDocumentService();
    }
    return EnhancedDocumentService.instance;
  }

  // Document Management
  async uploadDocument(
    file: File,
    metadata: Partial<DocumentMetadata>,
    organizationId: string,
    changeNotes?: string
  ): Promise<DocumentMetadata> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    try {
      // Upload file to Supabase Storage
      const fileName = `${organizationId}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Calculate file checksum
      const checksum = await this.calculateChecksum(file);

      // Create document metadata
      const documentData: Partial<DocumentMetadata> = {
        organization_id: organizationId,
        name: metadata.name || file.name,
        description: metadata.description,
        category: metadata.category || 'general',
        tags: metadata.tags || [],
        file_type: file.type,
        current_version: 1,
        total_versions: 1,
        file_size: file.size,
        created_by: userId,
        modified_by: userId,
        access_level: metadata.access_level || 'internal',
        allowed_users: metadata.allowed_users || [],
        allowed_roles: metadata.allowed_roles || [],
        status: metadata.status || 'draft',
        review_status: 'pending',
        compliance_tags: metadata.compliance_tags || [],
        related_assessment_ids: metadata.related_assessment_ids || [],
        related_requirement_ids: metadata.related_requirement_ids || []
      };

      const { data: docData, error: docError } = await supabase
        .from('document_metadata')
        .insert(documentData)
        .select()
        .single();

      if (docError) throw docError;

      // Create initial version record
      const versionData: Partial<DocumentVersion> = {
        document_id: docData.id,
        version_number: 1,
        file_url: uploadData.path,
        file_size: file.size,
        file_type: file.type,
        checksum,
        created_by: userId,
        change_notes: changeNotes || 'Initial upload',
        is_current: true
      };

      await supabase
        .from('document_versions')
        .insert(versionData);

      // Log activity
      await this.logActivity(docData.id, userId, 'created', 'Document created');

      return docData as DocumentMetadata;

    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  async uploadNewVersion(
    documentId: string,
    file: File,
    changeNotes: string
  ): Promise<DocumentVersion> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    try {
      // Get current document
      const { data: document } = await supabase
        .from('document_metadata')
        .select('*')
        .eq('id', documentId)
        .single();

      if (!document) throw new Error('Document not found');

      // Check if document is locked
      if (document.is_locked && document.locked_by !== userId) {
        throw new Error('Document is locked by another user');
      }

      // Upload new file version
      const fileName = `${document.organization_id}/${Date.now()}-v${document.current_version + 1}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const checksum = await this.calculateChecksum(file);
      const newVersionNumber = document.current_version + 1;

      // Mark previous version as not current
      await supabase
        .from('document_versions')
        .update({ is_current: false })
        .eq('document_id', documentId)
        .eq('is_current', true);

      // Create new version record
      const versionData: Partial<DocumentVersion> = {
        document_id: documentId,
        version_number: newVersionNumber,
        file_url: uploadData.path,
        file_size: file.size,
        file_type: file.type,
        checksum,
        created_by: userId,
        change_notes: changeNotes,
        is_current: true
      };

      const { data: newVersion, error: versionError } = await supabase
        .from('document_versions')
        .insert(versionData)
        .select()
        .single();

      if (versionError) throw versionError;

      // Update document metadata
      await supabase
        .from('document_metadata')
        .update({
          current_version: newVersionNumber,
          total_versions: document.total_versions + 1,
          file_size: file.size,
          file_type: file.type,
          modified_by: userId,
          updated_at: new Date().toISOString(),
          status: 'draft', // Reset to draft for new version
          review_status: 'pending'
        })
        .eq('id', documentId);

      // Log activity
      await this.logActivity(documentId, userId, 'uploaded', `New version uploaded: v${newVersionNumber}`);

      return newVersion as DocumentVersion;

    } catch (error) {
      console.error('Error uploading new version:', error);
      throw error;
    }
  }

  async getDocuments(
    organizationId: string,
    filters?: {
      category?: string;
      status?: string;
      access_level?: string;
      tags?: string[];
      search?: string;
    }
  ): Promise<DocumentMetadata[]> {
    let query = supabase
      .from('document_metadata')
      .select(`
        *,
        created_by_user:organization_users!created_by(
          user:users(first_name, last_name, email)
        ),
        modified_by_user:organization_users!modified_by(
          user:users(first_name, last_name, email)
        )
      `)
      .eq('organization_id', organizationId);

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.access_level) {
      query = query.eq('access_level', filters.access_level);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    const { data, error } = await supabase
      .from('document_versions')
      .select(`
        *,
        created_by_user:organization_users!created_by(
          user:users(first_name, last_name, email)
        )
      `)
      .eq('document_id', documentId)
      .order('version_number', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async downloadDocument(documentId: string, versionNumber?: number): Promise<string> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    try {
      // Get version info
      let query = supabase
        .from('document_versions')
        .select('file_url')
        .eq('document_id', documentId);

      if (versionNumber) {
        query = query.eq('version_number', versionNumber);
      } else {
        query = query.eq('is_current', true);
      }

      const { data: version } = await query.single();
      if (!version) throw new Error('Document version not found');

      // Create signed URL for download
      const { data: signedUrl, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(version.file_url, 3600); // 1 hour expiry

      if (error) throw error;

      // Log activity
      await this.logActivity(
        documentId, 
        userId, 
        'downloaded', 
        `Downloaded version ${versionNumber || 'current'}`
      );

      return signedUrl.signedUrl;

    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }

  // Version Control
  async lockDocument(documentId: string): Promise<boolean> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('document_metadata')
      .update({
        is_locked: true,
        locked_by: userId,
        locked_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .eq('is_locked', false); // Only lock if not already locked

    if (error) throw error;

    await this.logActivity(documentId, userId, 'locked', 'Document locked for editing');
    return true;
  }

  async unlockDocument(documentId: string): Promise<boolean> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('document_metadata')
      .update({
        is_locked: false,
        locked_by: null,
        locked_at: null
      })
      .eq('id', documentId)
      .eq('locked_by', userId); // Only unlock if locked by current user

    if (error) throw error;

    await this.logActivity(documentId, userId, 'unlocked', 'Document unlocked');
    return true;
  }

  async revertToVersion(documentId: string, versionNumber: number): Promise<boolean> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    try {
      // Get the target version
      const { data: targetVersion } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .eq('version_number', versionNumber)
        .single();

      if (!targetVersion) throw new Error('Version not found');

      // Mark current version as not current
      await supabase
        .from('document_versions')
        .update({ is_current: false })
        .eq('document_id', documentId)
        .eq('is_current', true);

      // Mark target version as current
      await supabase
        .from('document_versions')
        .update({ is_current: true })
        .eq('id', targetVersion.id);

      // Update document metadata
      await supabase
        .from('document_metadata')
        .update({
          current_version: versionNumber,
          file_size: targetVersion.file_size,
          file_type: targetVersion.file_type,
          modified_by: userId,
          updated_at: new Date().toISOString(),
          status: 'draft',
          review_status: 'pending'
        })
        .eq('id', documentId);

      await this.logActivity(
        documentId, 
        userId, 
        'edited', 
        `Reverted to version ${versionNumber}`
      );

      return true;

    } catch (error) {
      console.error('Error reverting document:', error);
      throw error;
    }
  }

  // Workflow and Approval
  async submitForReview(documentId: string, reviewerId: string): Promise<boolean> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('document_metadata')
      .update({
        status: 'under_review',
        review_status: 'pending',
        reviewer_id: reviewerId,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (error) throw error;

    await this.logActivity(documentId, userId, 'edited', 'Submitted for review');
    return true;
  }

  async reviewDocument(
    documentId: string,
    decision: 'approved' | 'rejected' | 'changes_requested',
    notes?: string
  ): Promise<boolean> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const status = decision === 'approved' ? 'approved' : 'draft';

    const { error } = await supabase
      .from('document_metadata')
      .update({
        status,
        review_status: decision,
        review_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .eq('reviewer_id', userId);

    if (error) throw error;

    await this.logActivity(documentId, userId, decision, notes || `Document ${decision}`);
    return true;
  }

  // Search and Discovery
  async searchDocuments(
    organizationId: string,
    query: string,
    filters?: {
      category?: string[];
      tags?: string[];
      dateRange?: { start: string; end: string };
      fileTypes?: string[];
    }
  ): Promise<DocumentSearchResult[]> {
    // Basic search implementation
    // In production, this would use full-text search or Elasticsearch
    
    let dbQuery = supabase
      .from('document_metadata')
      .select('*')
      .eq('organization_id', organizationId);

    // Text search
    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`);
    }

    // Apply filters
    if (filters?.category && filters.category.length > 0) {
      dbQuery = dbQuery.in('category', filters.category);
    }

    if (filters?.tags && filters.tags.length > 0) {
      dbQuery = dbQuery.overlaps('tags', filters.tags);
    }

    if (filters?.fileTypes && filters.fileTypes.length > 0) {
      dbQuery = dbQuery.in('file_type', filters.fileTypes);
    }

    if (filters?.dateRange) {
      dbQuery = dbQuery
        .gte('created_at', filters.dateRange.start)
        .lte('created_at', filters.dateRange.end);
    }

    const { data, error } = await dbQuery.order('updated_at', { ascending: false });

    if (error) throw error;

    // Convert to search results with basic scoring
    return (data || []).map(doc => ({
      document: doc as DocumentMetadata,
      matchType: this.getMatchType(doc, query),
      score: this.calculateScore(doc, query),
      highlights: this.getHighlights(doc, query)
    }));
  }

  // Activity Logging
  private async logActivity(
    documentId: string,
    userId: string,
    action: DocumentActivity['action'],
    details?: string
  ): Promise<void> {
    try {
      await supabase
        .from('document_activities')
        .insert({
          document_id: documentId,
          user_id: userId,
          action,
          details,
          ip_address: await this.getClientIP(),
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw as this is just logging
    }
  }

  async getDocumentActivity(documentId: string): Promise<DocumentActivity[]> {
    const { data, error } = await supabase
      .from('document_activities')
      .select(`
        *,
        user:organization_users!user_id(
          user:users(first_name, last_name, email)
        )
      `)
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Utility Methods
  private async calculateChecksum(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private getMatchType(doc: DocumentMetadata, query: string): DocumentSearchResult['matchType'] {
    if (doc.name.toLowerCase().includes(query.toLowerCase())) return 'title';
    if (doc.description?.toLowerCase().includes(query.toLowerCase())) return 'content';
    if (doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))) return 'tags';
    return 'metadata';
  }

  private calculateScore(doc: DocumentMetadata, query: string): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    
    // Title match gets highest score
    if (doc.name.toLowerCase().includes(lowerQuery)) score += 10;
    
    // Description match
    if (doc.description?.toLowerCase().includes(lowerQuery)) score += 5;
    
    // Tag match
    if (doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) score += 3;
    
    // Recency bonus
    const daysSinceUpdate = (Date.now() - new Date(doc.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 30) score += 2;
    
    return score;
  }

  private getHighlights(doc: DocumentMetadata, query: string): string[] {
    const highlights: string[] = [];
    const lowerQuery = query.toLowerCase();
    
    if (doc.name.toLowerCase().includes(lowerQuery)) {
      highlights.push(doc.name);
    }
    
    if (doc.description?.toLowerCase().includes(lowerQuery)) {
      // Get a snippet around the match
      const index = doc.description.toLowerCase().indexOf(lowerQuery);
      const start = Math.max(0, index - 50);
      const end = Math.min(doc.description.length, index + query.length + 50);
      highlights.push('...' + doc.description.substring(start, end) + '...');
    }
    
    return highlights;
  }

  private async getClientIP(): Promise<string> {
    try {
      // In production, you'd get this from request headers
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  // Sharing and Collaboration
  async shareDocument(
    documentId: string,
    shareWith: string,
    accessType: DocumentShare['access_type'],
    expiresAt?: string,
    password?: string
  ): Promise<DocumentShare> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const shareData: Partial<DocumentShare> = {
      document_id: documentId,
      shared_by: userId,
      shared_with_email: shareWith,
      access_type: accessType,
      expires_at: expiresAt,
      password_protected: !!password,
      download_count: 0
    };

    const { data, error } = await supabase
      .from('document_shares')
      .insert(shareData)
      .select()
      .single();

    if (error) throw error;

    await this.logActivity(documentId, userId, 'edited', `Document shared with ${shareWith}`);
    return data as DocumentShare;
  }

  async getDocumentShares(documentId: string): Promise<DocumentShare[]> {
    const { data, error } = await supabase
      .from('document_shares')
      .select(`
        *,
        shared_by_user:organization_users!shared_by(
          user:users(first_name, last_name, email)
        )
      `)
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}