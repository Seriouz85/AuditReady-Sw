import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { documentUploadService, UploadedDocument } from "@/services/documents/DocumentUploadService";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Download, Trash2, ExternalLink } from 'lucide-react';
import { toast } from "@/utils/toast";

const LinkedDocuments = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [documents, setDocuments] = React.useState<UploadedDocument[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { organization, isDemo } = useAuth();

  // Load documents on component mount
  React.useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      let docs: UploadedDocument[];
      
      if (isDemo) {
        docs = documentUploadService.getDemoDocuments();
      } else if (organization) {
        docs = await documentUploadService.getDocuments(organization.id);
      } else {
        docs = [];
      }
      
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (newDocument: UploadedDocument) => {
    setDocuments(prev => [newDocument, ...prev]);
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!organization && !isDemo) return;
    
    try {
      let result;
      if (isDemo) {
        // Remove from localStorage
        const demoDocuments = documentUploadService.getDemoDocuments();
        const filtered = demoDocuments.filter(doc => doc.id !== documentId);
        localStorage.setItem('demoDocuments', JSON.stringify(filtered));
        result = { success: true };
      } else {
        result = await documentUploadService.deleteDocument(documentId, organization!.id);
      }
      
      if (result.success) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        toast.success('Document deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleDownload = (doc: UploadedDocument) => {
    if (isDemo && doc.url.startsWith('data:')) {
      // Handle base64 download in demo mode
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = doc.name;
      link.click();
    } else {
      // Open URL in new tab
      window.open(doc.url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Document Library</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(documents.reduce((sum, doc) => sum + doc.size, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter(doc => {
                const uploadDate = new Date(doc.uploadedAt);
                const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return uploadDate > dayAgo;
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <DocumentUpload onUploadComplete={handleUploadComplete} />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {documents.length === 0 ? 'No documents uploaded yet.' : 'No documents match your search.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getFileType(doc.name)}</Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.size)}</TableCell>
                    <TableCell>{new Date(doc.uploadedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(doc)}
                        >
                          {isDemo ? <Download className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LinkedDocuments;