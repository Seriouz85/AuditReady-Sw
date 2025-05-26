import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Save,
  FolderOpen,
  Plus,
  Search,
  Clock,
  Download,
  Upload,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { useFabricCanvasStore } from '../core/FabricCanvasStore';
import { getCloudStorageManager, CloudDocument, SyncStatus } from '../core/CloudStorageManager';
import { AUDIT_COLORS } from '../core/fabric-utils';

interface CloudStoragePanelProps {
  visible: boolean;
  onClose: () => void;
}

const CloudStoragePanel: React.FC<CloudStoragePanelProps> = ({ visible, onClose }) => {
  const { canvas } = useFabricCanvasStore();
  const [documents, setDocuments] = useState<CloudDocument[]>([]);
  const [currentDocument, setCurrentDocument] = useState<CloudDocument | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: 'synced', lastSync: new Date(), pendingChanges: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newDocumentName, setNewDocumentName] = useState('');
  const [newDocumentDescription, setNewDocumentDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const cloudStorageManager = getCloudStorageManager(canvas);

  // Sample data for demonstration
  const sampleDocuments: CloudDocument[] = [
    {
      id: 'doc1',
      name: 'Audit Report 2024',
      description: 'Annual audit report with findings and recommendations',
      content: '{"version":"1.0","objects":[]}',
      lastModified: new Date('2024-01-15'),
      size: 2048576,
      tags: ['audit', 'report', '2024'],
      isShared: true,
      collaborators: ['john.doe@company.com', 'jane.smith@company.com']
    },
    {
      id: 'doc2',
      name: 'Risk Assessment Template',
      description: 'Standard template for risk assessments',
      content: '{"version":"1.0","objects":[]}',
      lastModified: new Date('2024-01-10'),
      size: 512000,
      tags: ['template', 'risk'],
      isShared: false,
      collaborators: []
    },
    {
      id: 'doc3',
      name: 'Compliance Checklist',
      description: 'ISO 27001 compliance verification checklist',
      content: '{"version":"1.0","objects":[]}',
      lastModified: new Date('2024-01-08'),
      size: 256000,
      tags: ['compliance', 'ISO27001'],
      isShared: true,
      collaborators: ['compliance@company.com']
    }
  ];

  useEffect(() => {
    if (!visible || !cloudStorageManager) return;

    // Load sample data if no real data exists
    if (documents.length === 0) {
      setDocuments(sampleDocuments);
    }

    loadDocuments();
    loadCurrentDocument();
    loadSyncStatus();

    // Set up event listeners
    const handleDocumentSaved = (doc: CloudDocument) => {
      setCurrentDocument(doc);
      loadDocuments();
    };

    const handleSyncStatusChanged = (status: SyncStatus) => {
      setSyncStatus(status);
    };

    cloudStorageManager.on('document:saved', handleDocumentSaved);
    cloudStorageManager.on('document:loaded', handleDocumentSaved);
    cloudStorageManager.on('sync:status-changed', handleSyncStatusChanged);

    return () => {
      cloudStorageManager.off('document:saved', handleDocumentSaved);
      cloudStorageManager.off('document:loaded', handleDocumentSaved);
      cloudStorageManager.off('sync:status-changed', handleSyncStatusChanged);
    };
  }, [visible, cloudStorageManager]);

  const loadDocuments = async () => {
    if (!cloudStorageManager) return;
    try {
      const docs = await cloudStorageManager.listDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const loadCurrentDocument = () => {
    if (!cloudStorageManager) return;
    const current = cloudStorageManager.getCurrentDocument();
    setCurrentDocument(current);
  };

  const loadSyncStatus = () => {
    if (!cloudStorageManager) return;
    const status = cloudStorageManager.getSyncStatus();
    setSyncStatus(status);
  };

  const handleCreateDocument = async () => {
    if (!cloudStorageManager || !newDocumentName.trim()) return;

    setIsLoading(true);
    try {
      await cloudStorageManager.createDocument(newDocumentName, newDocumentDescription);
      setNewDocumentName('');
      setNewDocumentDescription('');
      setShowCreateDialog(false);
      loadDocuments();
    } catch (error) {
      console.error('Failed to create document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDocument = async () => {
    if (!cloudStorageManager) return;

    setIsLoading(true);
    try {
      await cloudStorageManager.saveDocument();
      loadDocuments();
    } catch (error) {
      console.error('Failed to save document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadDocument = async (documentId: string) => {
    if (!cloudStorageManager) return;

    setIsLoading(true);
    try {
      await cloudStorageManager.loadDocument(documentId);
      loadDocuments();
    } catch (error) {
      console.error('Failed to load document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!cloudStorageManager) return;
    if (!confirm('Are you sure you want to delete this document?')) return;

    setIsLoading(true);
    try {
      await cloudStorageManager.deleteDocument(documentId);
      loadDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSyncStatusIcon = () => {
    switch (syncStatus.status) {
      case 'synced':
        return <CheckCircle size={16} color="#10b981" />;
      case 'syncing':
        return <Loader size={16} color="#3b82f6" className="animate-spin" />;
      case 'error':
        return <AlertCircle size={16} color="#ef4444" />;
      default:
        return <Clock size={16} color="#6b7280" />;
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!visible) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const panelStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '600px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  };

  const headerStyle: React.CSSProperties = {
    padding: '24px',
    borderBottom: `1px solid ${AUDIT_COLORS.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const contentStyle: React.CSSProperties = {
    padding: '24px',
    overflowY: 'auto',
    flex: 1
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: AUDIT_COLORS.primary,
    color: 'white'
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0'
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Cloud size={24} color={AUDIT_COLORS.primary} />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#111827' }}>
              Cloud Storage
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Sync Status */}
          <div style={{
            padding: '12px',
            backgroundColor: syncStatus.status === 'synced' ? '#ecfdf5' : syncStatus.status === 'error' ? '#fef2f2' : '#eff6ff',
            border: `1px solid ${syncStatus.status === 'synced' ? '#d1fae5' : syncStatus.status === 'error' ? '#fecaca' : '#dbeafe'}`,
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {getSyncStatusIcon()}
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              {syncStatus.status === 'synced' && 'All changes saved'}
              {syncStatus.status === 'syncing' && 'Syncing changes...'}
              {syncStatus.status === 'error' && `Sync error: ${syncStatus.error}`}
            </span>
            {syncStatus.pendingChanges > 0 && (
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                ({syncStatus.pendingChanges} pending)
              </span>
            )}
          </div>

          {/* Current Document */}
          {currentDocument && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Current Document
              </h4>
              <div style={{
                padding: '16px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: '500', color: '#111827' }}>{currentDocument.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Last saved: {formatDate(currentDocument.updatedAt)} • v{currentDocument.version}
                  </div>
                </div>
                <button onClick={handleSaveDocument} style={primaryButtonStyle} disabled={isLoading}>
                  <Save size={14} />
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button onClick={() => setShowCreateDialog(true)} style={primaryButtonStyle}>
              <Plus size={14} />
              New Document
            </button>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280'
              }} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Documents List */}
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
              Documents ({filteredDocuments.length})
            </h4>

            {filteredDocuments.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                {searchQuery ? 'No documents match your search' : 'No documents yet. Create your first document!'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredDocuments.map(doc => (
                  <div key={doc.id} style={{
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: doc.id === currentDocument?.id ? '#eff6ff' : 'white'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', color: '#111827', marginBottom: '4px' }}>
                        {doc.name}
                      </div>
                      {doc.description && (
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                          {doc.description}
                        </div>
                      )}
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {formatDate(doc.updatedAt)} • {formatFileSize(doc.size)} • v{doc.version}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleLoadDocument(doc.id)}
                        style={secondaryButtonStyle}
                        disabled={isLoading || doc.id === currentDocument?.id}
                      >
                        <FolderOpen size={14} />
                        Open
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        style={{
                          ...secondaryButtonStyle,
                          color: '#ef4444',
                          borderColor: '#fecaca'
                        }}
                        disabled={isLoading}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Document Dialog */}
          {showCreateDialog && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 10001,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                width: '400px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
                  Create New Document
                </h3>
                <input
                  type="text"
                  placeholder="Document name"
                  value={newDocumentName}
                  onChange={(e) => setNewDocumentName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginBottom: '12px',
                    boxSizing: 'border-box'
                  }}
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newDocumentDescription}
                  onChange={(e) => setNewDocumentDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginBottom: '16px',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setShowCreateDialog(false)}
                    style={secondaryButtonStyle}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateDocument}
                    style={primaryButtonStyle}
                    disabled={!newDocumentName.trim() || isLoading}
                  >
                    {isLoading ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />}
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CloudStoragePanel;
