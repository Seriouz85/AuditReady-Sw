import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SafeHTML } from '@/lib/security/htmlSanitizer';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  FileText, 
  Settings, 
  Users, 
  Clock, 
  Layers,
  Share2,
  Download,
  Upload,
  Bookmark,
  ChevronRight,
  List,
  Link2,
  Palette,
  Globe,
  Lock
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { EnhancedRichTextEditor } from '@/components/LMS/EnhancedRichTextEditor';
import { toast } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';

interface PageData {
  id?: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  isPrivate: boolean;
  allowComments: boolean;
  estimatedReadTime: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
  tableOfContents?: boolean;
  enableSearch?: boolean;
  templateId?: string;
}

const PageEditor: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pageId } = useParams<{ pageId?: string }>();
  const { setTheme } = useTheme();
  const { user } = useAuth();
  const { organization } = useOrganization();
  
  const [activeTab, setActiveTab] = useState('content');
  const [isSaving, setSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [pageData, setPageData] = useState<PageData>({
    title: '',
    content: '',
    category: 'Documentation',
    tags: [],
    isPublished: false,
    isPrivate: false,
    allowComments: true,
    estimatedReadTime: '5 min',
    tableOfContents: true,
    enableSearch: true
  });
  
  const [newTag, setNewTag] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const categories = [
    'Documentation',
    'Tutorial',
    'Policy',
    'Procedure',
    'Training Material',
    'Reference',
    'FAQ',
    'Announcement'
  ];

  const templateOptions = [
    { id: 'blank', name: 'Blank Page' },
    { id: 'documentation', name: 'Documentation Template' },
    { id: 'tutorial', name: 'Tutorial Template' },
    { id: 'policy', name: 'Policy Template' },
    { id: 'procedure', name: 'Procedure Template' },
    { id: 'faq', name: 'FAQ Template' }
  ];

  useEffect(() => {
    setTheme('light');
    
    // Load page data if editing existing page
    if (pageId) {
      loadPageData();
    } else if (location.state?.pageData) {
      setPageData(location.state.pageData);
    }
  }, [pageId, location.state, setTheme]);

  const loadPageData = async () => {
    // In a real app, this would load from your backend
    // For now, use demo data
    const demoData: PageData = {
      id: pageId,
      title: 'Data Privacy Policy',
      content: `<h1>Data Privacy Policy</h1>
        <p>This policy outlines how we collect, use, and protect your personal information.</p>
        
        <h2>Information We Collect</h2>
        <p>We collect information that you provide directly to us, such as when you:</p>
        <ul>
          <li>Create an account</li>
          <li>Make a purchase</li>
          <li>Contact us for support</li>
        </ul>
        
        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ol>
          <li>Provide and improve our services</li>
          <li>Communicate with you</li>
          <li>Ensure security and prevent fraud</li>
        </ol>`,
      category: 'Policy',
      tags: ['privacy', 'data', 'policy', 'compliance'],
      isPublished: false,
      isPrivate: true,
      allowComments: false,
      estimatedReadTime: '8 min',
      author: user?.email || 'demo@company.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      tableOfContents: true,
      enableSearch: true
    };
    
    setPageData(demoData);
  };

  const handleSave = async () => {
    if (!pageData.title.trim()) {
      toast.error('Page title is required');
      return;
    }

    setSaving(true);
    
    try {
      // In a real app, this would save to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      const updatedData = {
        ...pageData,
        updatedAt: new Date().toISOString(),
        version: (pageData.version || 0) + 1
      };
      
      setPageData(updatedData);
      setUnsavedChanges(false);
      toast.success('Page saved successfully');
      
      // Navigate to page view or back to library
      if (!pageId) {
        navigate(`/lms/page/${updatedData.id || 'demo'}`);
      }
    } catch (error) {
      toast.error('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    const updatedData = { ...pageData, isPublished: !pageData.isPublished };
    setPageData(updatedData);
    setUnsavedChanges(true);
    
    toast.success(updatedData.isPublished ? 'Page published' : 'Page unpublished');
  };

  const addTag = () => {
    if (newTag.trim() && !pageData.tags.includes(newTag.trim())) {
      setPageData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
      setUnsavedChanges(true);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPageData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
    setUnsavedChanges(true);
  };

  const updateContent = (content: string) => {
    setPageData(prev => ({ ...prev, content }));
    setUnsavedChanges(true);
  };

  const generateTableOfContents = () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(pageData.content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    return Array.from(headings).map((heading, index) => ({
      id: `heading-${index}`,
      text: heading.textContent || '',
      level: parseInt(heading.tagName.charAt(1)),
      element: heading.tagName.toLowerCase()
    }));
  };

  const toc = generateTableOfContents();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/lms/library')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Library
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div>
                  <Input
                    value={pageData.title}
                    onChange={(e) => {
                      setPageData(prev => ({ ...prev, title: e.target.value }));
                      setUnsavedChanges(true);
                    }}
                    placeholder="Page title"
                    className="text-lg font-semibold border-none focus:ring-0 p-0 h-auto"
                  />
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Badge variant={pageData.isPublished ? "default" : "secondary"}>
                      {pageData.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                    <span>•</span>
                    <span>Version {pageData.version || 1}</span>
                    {pageData.author && (
                      <>
                        <span>•</span>
                        <span>by {pageData.author}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreview(!isPreview)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                {isPreview ? 'Edit' : 'Preview'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePublish}
                className="gap-2"
              >
                {pageData.isPublished ? (
                  <>
                    <Lock className="h-4 w-4" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" />
                    Publish
                  </>
                )}
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                {isPreview ? (
                  <Card className="p-0 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b">
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {pageData.title || 'Untitled Page'}
                      </h1>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {pageData.estimatedReadTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {pageData.isPrivate ? 'Private' : 'Public'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Layers className="h-4 w-4" />
                          {pageData.category}
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <SafeHTML
                        content={pageData.content}
                        type="rich"
                        className="prose prose-lg max-w-none"
                      />
                    </div>
                  </Card>
                ) : (
                  <Card className="p-0">
                    <EnhancedRichTextEditor
                      initialContent={pageData.content}
                      onSave={updateContent}
                      onCancel={() => {}}
                      placeholder="Start writing your page content..."
                      height="600px"
                      autoSave={true}
                      showWordCount={true}
                    />
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="settings">
                <Card className="p-6">
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={pageData.category} 
                        onValueChange={(value) => {
                          setPageData(prev => ({ ...prev, category: value }));
                          setUnsavedChanges(true);
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="readTime">Estimated Read Time</Label>
                      <Input
                        id="readTime"
                        value={pageData.estimatedReadTime}
                        onChange={(e) => {
                          setPageData(prev => ({ ...prev, estimatedReadTime: e.target.value }));
                          setUnsavedChanges(true);
                        }}
                        placeholder="e.g., 5 min"
                        className="mt-1"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Private Page</Label>
                          <p className="text-sm text-gray-500">Only visible to selected users</p>
                        </div>
                        <Switch
                          checked={pageData.isPrivate}
                          onCheckedChange={(checked) => {
                            setPageData(prev => ({ ...prev, isPrivate: checked }));
                            setUnsavedChanges(true);
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Allow Comments</Label>
                          <p className="text-sm text-gray-500">Let users comment on this page</p>
                        </div>
                        <Switch
                          checked={pageData.allowComments}
                          onCheckedChange={(checked) => {
                            setPageData(prev => ({ ...prev, allowComments: checked }));
                            setUnsavedChanges(true);
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Table of Contents</Label>
                          <p className="text-sm text-gray-500">Auto-generate from headings</p>
                        </div>
                        <Switch
                          checked={pageData.tableOfContents}
                          onCheckedChange={(checked) => {
                            setPageData(prev => ({ ...prev, tableOfContents: checked }));
                            setUnsavedChanges(true);
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable Search</Label>
                          <p className="text-sm text-gray-500">Include in search results</p>
                        </div>
                        <Switch
                          checked={pageData.enableSearch}
                          onCheckedChange={(checked) => {
                            setPageData(prev => ({ ...prev, enableSearch: checked }));
                            setUnsavedChanges(true);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="metadata">
                <Card className="p-6">
                  <div className="space-y-6">
                    <div>
                      <Label>Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {pageData.tags.map(tag => (
                          <Badge 
                            key={tag} 
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeTag(tag)}
                          >
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add a tag"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                        />
                        <Button onClick={addTag} size="sm">
                          Add
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Template</Label>
                      <Select 
                        value={pageData.templateId || 'blank'}
                        onValueChange={(value) => {
                          setPageData(prev => ({ ...prev, templateId: value }));
                          setUnsavedChanges(true);
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templateOptions.map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {pageData.createdAt && (
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>Created: {new Date(pageData.createdAt).toLocaleDateString()}</p>
                        {pageData.updatedAt && (
                          <p>Updated: {new Date(pageData.updatedAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="w-80 space-y-4">
            {/* Table of Contents */}
            {pageData.tableOfContents && toc.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Table of Contents
                </h3>
                <div className="space-y-1">
                  {toc.map((item, index) => (
                    <a
                      key={index}
                      href={`#${item.id}`}
                      className={`block text-sm hover:text-blue-600 transition-colors ${
                        item.level === 1 ? 'font-medium' : 
                        item.level === 2 ? 'ml-3' : 
                        item.level === 3 ? 'ml-6' : 'ml-9'
                      }`}
                    >
                      {item.text}
                    </a>
                  ))}
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Page
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Download className="h-4 w-4" />
                  Export as PDF
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Bookmark className="h-4 w-4" />
                  Save Template
                </Button>
              </div>
            </Card>

            {/* Page Stats */}
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Page Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status</span>
                  <Badge variant={pageData.isPublished ? "default" : "secondary"}>
                    {pageData.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Visibility</span>
                  <span>{pageData.isPrivate ? 'Private' : 'Public'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comments</span>
                  <span>{pageData.allowComments ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Read Time</span>
                  <span>{pageData.estimatedReadTime}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageEditor;