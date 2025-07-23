import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Eye, Lock, Unlock, Upload, History, 
  Share2, Search, Filter, MoreVertical, Calendar, User,
  AlertCircle, CheckCircle, Clock, XCircle, Shield, 
  AlertTriangle, Scan, Tag, Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DocumentMetadata, EnhancedDocumentService } from '@/services/documents/EnhancedDocumentService';
import { documentUploadService, UploadedDocument } from '@/services/documents/DocumentUploadService';
import { DocumentUploader } from './DocumentUploader';
import { DocumentVersionViewer } from './DocumentVersionViewer';
import { DocumentWorkflowPanel } from './DocumentWorkflowPanel';
import { useToast } from '@/hooks/use-toast';
import { getAccessLevelLabels, getAccessLevelColor } from '@/utils/accessLevels';
import { useAuth } from '@/contexts/AuthContext';
import { azurePurviewService, ClassificationLabel, SensitiveDataDetection } from '@/services/classification/AzurePurviewService';

interface DocumentLibraryProps {
  organizationId: string;
}

export function DocumentLibrary({ organizationId }: DocumentLibraryProps) {
  const { toast } = useToast();
  const { isDemo } = useAuth();
  const documentService = EnhancedDocumentService.getInstance();
  
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [legacyDocuments, setLegacyDocuments] = useState<UploadedDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentMetadata[]>([]);
  const [filteredLegacyDocuments, setFilteredLegacyDocuments] = useState<UploadedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [showVersionViewer, setShowVersionViewer] = useState(false);
  const [showWorkflowPanel, setShowWorkflowPanel] = useState(false);
  
  // Classification-related state
  const [classificationLabels, setClassificationLabels] = useState<ClassificationLabel[]>([]);
  const [sensitiveDetections, setSensitiveDetections] = useState<Record<string, SensitiveDataDetection>>({});
  const [classificationLoading, setClassificationLoading] = useState(false);

  useEffect(() => {
    loadDocuments();
    loadClassificationData();
  }, [organizationId]);

  useEffect(() => {
    filterDocuments();
  }, [documents, legacyDocuments, searchQuery, selectedCategory, selectedStatus, selectedClassification]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      
      if (isDemo) {
        // For demo mode, load legacy documents from localStorage
        const legacyDocs = documentUploadService.getDemoDocuments();
        setLegacyDocuments(legacyDocs);
        setDocuments([]); // No enhanced documents in demo mode yet
      } else {
        // For production mode, load enhanced documents
        const docs = await documentService.getDocuments(organizationId);
        setDocuments(docs);
        setLegacyDocuments([]); // No legacy documents in production
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClassificationData = async () => {
    try {
      setClassificationLoading(true);
      
      // Load classification labels
      const labels = await azurePurviewService.syncClassificationLabels(organizationId);
      setClassificationLabels(labels);
      
    } catch (error) {
      console.error('Error loading classification data:', error);
      // Don't show toast for classification errors in demo mode
      if (!isDemo) {
        toast({
          title: 'Warning',
          description: 'Failed to load data classification labels',
          variant: 'destructive'
        });
      }
    } finally {
      setClassificationLoading(false);
    }
  };

  const filterDocuments = () => {
    // Filter enhanced documents
    let filtered = documents;

    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doc as any).classification_label?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(doc => doc.status === selectedStatus);
    }

    if (selectedClassification !== 'all') {
      if (selectedClassification === 'unclassified') {
        filtered = filtered.filter(doc => !(doc as any).classification_label);
      } else {
        filtered = filtered.filter(doc => (doc as any).classification_label === selectedClassification);
      }
    }

    setFilteredDocuments(filtered);

    // Filter legacy documents
    let filteredLegacy = legacyDocuments;

    if (searchQuery) {
      filteredLegacy = filteredLegacy.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLegacyDocuments(filteredLegacy);
  };

  const handleDownload = async (document: DocumentMetadata) => {
    try {
      const downloadUrl = await documentService.downloadDocument(document.id);
      window.open(downloadUrl, '_blank');
      toast({
        title: 'Success',
        description: 'Document download started'
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to download document',
        variant: 'destructive'
      });
    }
  };

  const handleLegacyDownload = (doc: UploadedDocument) => {
    if (doc.url.startsWith('data:')) {
      // Handle base64 download
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = doc.name;
      link.click();
    } else {
      // Open URL in new tab
      window.open(doc.url, '_blank');
    }
  };

  const handleDeleteLegacyDocument = async (documentId: string) => {
    try {
      const demoDocuments = documentUploadService.getDemoDocuments();
      const filtered = demoDocuments.filter(doc => doc.id !== documentId);
      localStorage.setItem('demoDocuments', JSON.stringify(filtered));
      setLegacyDocuments(filtered);
      toast({
        title: 'Success',
        description: 'Document deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive'
      });
    }
  };

  const handleLockToggle = async (document: DocumentMetadata) => {
    try {
      if (document.is_locked) {
        await documentService.unlockDocument(document.id);
        toast({
          title: 'Success',
          description: 'Document unlocked'
        });
      } else {
        await documentService.lockDocument(document.id);
        toast({
          title: 'Success',
          description: 'Document locked for editing'
        });
      }
      loadDocuments();
    } catch (error) {
      console.error('Error toggling lock:', error);
      toast({
        title: 'Error',
        description: 'Failed to toggle document lock',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'under_review': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'published': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'archived': return <XCircle className="h-4 w-4 text-gray-400" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const accessLevelLabels = getAccessLevelLabels();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'PDF';
      case 'doc': case 'docx': return 'Word';
      case 'xls': case 'xlsx': return 'Excel';
      case 'ppt': case 'pptx': return 'PowerPoint';
      case 'txt': return 'Text';
      case 'png': case 'jpg': case 'jpeg': return 'Image';
      default: return 'File';
    }
  };

  // Classification helper functions
  const getClassificationLabel = (labelId: string): ClassificationLabel | undefined => {
    return classificationLabels.find(label => label.id === labelId);
  };

  const getClassificationBadge = (labelId: string | undefined) => {
    if (!labelId) {
      return (
        <Badge variant="outline" className="text-xs">
          <AlertTriangle className="h-3 w-3 mr-1 text-orange-500" />
          Unclassified
        </Badge>
      );
    }

    const label = getClassificationLabel(labelId);
    if (!label) {
      return (
        <Badge variant="outline" className="text-xs">
          {labelId}
        </Badge>
      );
    }

    const confidentialityColors = {
      'public': 'bg-green-100 text-green-800 border-green-200',
      'internal': 'bg-blue-100 text-blue-800 border-blue-200',
      'confidential': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'restricted': 'bg-red-100 text-red-800 border-red-200',
      'top_secret': 'bg-purple-100 text-purple-800 border-purple-200'
    };

    return (
      <Badge 
        className={`text-xs ${confidentialityColors[label.confidentialityLevel] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
        style={{ borderColor: label.color }}
      >
        <Shield className="h-3 w-3 mr-1" />
        {label.displayName}
      </Badge>
    );
  };

  const getSensitivityIndicator = (sensitivityScore: number | undefined) => {
    if (!sensitivityScore) {
      return null;
    }

    if (sensitivityScore >= 0.8) {
      return (
        <div className="flex items-center space-x-1 text-xs text-red-600">
          <AlertTriangle className="h-3 w-3" />
          <span>High Sensitivity</span>
        </div>
      );
    } else if (sensitivityScore >= 0.5) {
      return (
        <div className="flex items-center space-x-1 text-xs text-orange-600">
          <AlertCircle className="h-3 w-3" />
          <span>Medium Sensitivity</span>
        </div>
      );
    } else if (sensitivityScore > 0) {
      return (
        <div className="flex items-center space-x-1 text-xs text-yellow-600">
          <Clock className="h-3 w-3" />
          <span>Low Sensitivity</span>
        </div>
      );
    }

    return null;
  };

  const getRetentionInfo = (retentionDate: string | undefined) => {
    if (!retentionDate) return null;

    const retention = new Date(retentionDate);
    const now = new Date();
    const isOverdue = retention < now;
    const daysUntilRetention = Math.ceil((retention.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (isOverdue) {
      return (
        <div className="flex items-center space-x-1 text-xs text-red-600">
          <Timer className="h-3 w-3" />
          <span>Retention Overdue</span>
        </div>
      );
    } else if (daysUntilRetention <= 30) {
      return (
        <div className="flex items-center space-x-1 text-xs text-orange-600">
          <Timer className="h-3 w-3" />
          <span>{daysUntilRetention} days to retention</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-1 text-xs text-gray-500">
        <Timer className="h-3 w-3" />
        <span>Retain until {retention.toLocaleDateString()}</span>
      </div>
    );
  };

  const handleClassifyDocument = async (document: DocumentMetadata) => {
    try {
      setClassificationLoading(true);
      
      // For demo purposes, simulate automatic classification
      // In production, this would scan the actual document content
      const mockContent = `Document: ${document.name}\nDescription: ${document.description || ''}\nTags: ${document.tags.join(', ')}`;
      
      const suggestedLabels = await azurePurviewService.applyAutomaticClassification(
        organizationId,
        document.name,
        mockContent
      );

      if (suggestedLabels.length > 0) {
        toast({
          title: 'Classification Suggestion',
          description: `Suggested classifications: ${suggestedLabels.join(', ')}`,
        });
      }
    } catch (error) {
      console.error('Error classifying document:', error);
      toast({
        title: 'Error',
        description: 'Failed to classify document',
        variant: 'destructive'
      });
    } finally {
      setClassificationLoading(false);
    }
  };

  const totalDocuments = documents.length + legacyDocuments.length;
  const totalSize = documents.reduce((sum, doc) => sum + doc.file_size, 0) + 
                   legacyDocuments.reduce((sum, doc) => sum + doc.size, 0);
  const combinedFilteredDocuments = [...filteredDocuments, ...filteredLegacyDocuments];

  const categories = Array.from(new Set(documents.map(doc => doc.category)));
  const statuses = ['draft', 'under_review', 'approved', 'published', 'archived'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Document Library</h2>
          <p className="text-gray-600">
            {isDemo 
              ? 'Browse demo compliance documents and upload new ones'
              : 'Manage your compliance documents with version control'
            }
          </p>
          {totalDocuments > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {totalDocuments} document{totalDocuments !== 1 ? 's' : ''} • {formatFileSize(totalSize)} total
            </p>
          )}
        </div>
        <Button onClick={() => setShowUploader(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedClassification} onValueChange={setSelectedClassification}>
              <SelectTrigger>
                <SelectValue placeholder="Classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classifications</SelectItem>
                <SelectItem value="unclassified">Unclassified</SelectItem>
                {classificationLabels.map(label => (
                  <SelectItem key={label.id} value={label.id}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: label.color }}
                      />
                      <span>{label.displayName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Document Content */}
      {isDemo ? (
        /* Demo Mode: Table format like original LinkedDocuments */
        <Card>
          <CardHeader>
            <CardTitle>Linked Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLegacyDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span>{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getFileType(doc.name)}</Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.size)}</TableCell>
                    <TableCell>{new Date(doc.uploadedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleLegacyDownload(doc)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteLegacyDocument(doc.id)}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        /* Production Mode: Grid format for enhanced documents */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate" title={document.name}>
                        {document.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        v{document.current_version} • {formatFileSize(document.file_size)}
                      </p>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload(document)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedDocument(document);
                        setShowVersionViewer(true);
                      }}>
                        <History className="h-4 w-4 mr-2" />
                        Version History
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleLockToggle(document)}>
                        {document.is_locked ? (
                          <>
                            <Unlock className="h-4 w-4 mr-2" />
                            Unlock
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Lock
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleClassifyDocument(document)}>
                        <Scan className="h-4 w-4 mr-2" />
                        Auto-Classify
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedDocument(document);
                        setShowWorkflowPanel(true);
                      }}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Manage Workflow
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {document.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {document.description}
                  </p>
                )}
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(document.status)}
                  <span className="text-sm capitalize">
                    {document.status.replace('_', ' ')}
                  </span>
                </div>
                
                {/* Classification Information */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    {getClassificationBadge((document as any).classification_label)}
                    
                    {document.is_locked && (
                      <div className="flex items-center space-x-1 text-sm text-amber-600">
                        <Lock className="h-3 w-3" />
                        <span>Locked</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={getAccessLevelColor(document.access_level as any)}>
                      {accessLevelLabels[document.access_level as keyof typeof accessLevelLabels] || document.access_level}
                    </Badge>
                    
                    {getSensitivityIndicator((document as any).sensitivity_score)}
                  </div>
                  
                  {getRetentionInfo((document as any).retention_date) && (
                    <div className="pt-1 border-t border-gray-100">
                      {getRetentionInfo((document as any).retention_date)}
                    </div>
                  )}
                </div>
                
                {document.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {document.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {document.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{document.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>Modified by you</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(document.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {combinedFilteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'Try adjusting your search criteria'
              : isDemo 
                ? 'Demo documents should load automatically' 
                : 'Upload your first document to get started'
            }
          </p>
          {!searchQuery && selectedCategory === 'all' && selectedStatus === 'all' && !isDemo && (
            <Button onClick={() => setShowUploader(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      {showUploader && (
        <DocumentUploader
          organizationId={organizationId}
          onClose={() => setShowUploader(false)}
          onSuccess={() => {
            loadDocuments();
            setShowUploader(false);
          }}
        />
      )}

      {showVersionViewer && selectedDocument && (
        <DocumentVersionViewer
          document={selectedDocument}
          onClose={() => {
            setShowVersionViewer(false);
            setSelectedDocument(null);
          }}
          onVersionChange={loadDocuments}
        />
      )}

      {showWorkflowPanel && selectedDocument && (
        <DocumentWorkflowPanel
          document={selectedDocument}
          onClose={() => {
            setShowWorkflowPanel(false);
            setSelectedDocument(null);
          }}
          onUpdate={loadDocuments}
        />
      )}
    </div>
  );
}