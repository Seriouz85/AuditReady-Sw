import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '@/services/admin/AdminService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Edit, 
  Plus, 
  Trash2, 
  Save, 
  X,
  FileText,
  Shield,
  Settings,
  BarChart3
} from 'lucide-react';

interface Standard {
  id: string;
  name: string;
  version: string;
  type: string;
  description: string;
  official_url?: string;
  publication_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  requirementCount?: number;
}

interface Requirement {
  id: string;
  standard_id: string;
  control_id: string;
  title: string;
  description: string;
  category?: string;
  priority: string;
  parent_requirement_id?: string;
  order_index: number;
  is_active: boolean;
}

export const StandardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [standard, setStandard] = useState<Standard | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Editing states
  const [isEditingStandard, setIsEditingStandard] = useState(false);
  const [isCreatingRequirement, setIsCreatingRequirement] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<Requirement | null>(null);
  
  // Form states
  const [standardForm, setStandardForm] = useState({
    name: '',
    version: '',
    type: 'framework',
    description: '',
    official_url: '',
    publication_date: ''
  });
  
  const [requirementForm, setRequirementForm] = useState({
    control_id: '',
    title: '',
    description: '',
    category: '',
    priority: 'medium'
  });

  useEffect(() => {
    if (id) {
      loadStandardData();
    }
  }, [id]);

  const loadStandardData = async () => {
    try {
      setLoading(true);
      
      // Load standard details
      const standards = await adminService.getStandards();
      const currentStandard = standards.find(s => s.id === id);
      
      if (!currentStandard) {
        setError('Standard not found');
        return;
      }
      
      setStandard(currentStandard);
      setStandardForm({
        name: currentStandard.name,
        version: currentStandard.version,
        type: currentStandard.type,
        description: currentStandard.description || '',
        official_url: currentStandard.official_url || '',
        publication_date: currentStandard.publication_date || ''
      });
      
      // Load requirements
      console.log('Loading requirements for standard:', id);
      const reqs = await adminService.getRequirements(id);
      console.log('Requirements loaded:', reqs);
      setRequirements(reqs || []);
      
    } catch (err) {
      console.error('Error loading standard:', err);
      setError('Failed to load standard details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStandard = async () => {
    if (!id) return;
    
    try {
      const updatedStandard = await adminService.updateStandard(id, standardForm);
      setStandard(prev => prev ? { ...prev, ...updatedStandard } : null);
      setIsEditingStandard(false);
    } catch (err) {
      console.error('Error updating standard:', err);
      setError('Failed to update standard');
    }
  };

  const handleCreateRequirement = async () => {
    if (!id) return;
    
    try {
      const newRequirement = await adminService.createRequirement({
        standard_id: id,
        ...requirementForm,
        order_index: requirements.length
      });
      
      setRequirements(prev => [...prev, newRequirement]);
      setRequirementForm({
        control_id: '',
        title: '',
        description: '',
        category: '',
        priority: 'medium'
      });
      setIsCreatingRequirement(false);
    } catch (err) {
      console.error('Error creating requirement:', err);
      setError('Failed to create requirement');
    }
  };

  const handleUpdateRequirement = async () => {
    if (!editingRequirement) return;
    
    try {
      const updatedRequirement = await adminService.updateRequirement(
        editingRequirement.id,
        requirementForm
      );
      
      setRequirements(prev => 
        prev.map(req => req.id === editingRequirement.id ? updatedRequirement : req)
      );
      setEditingRequirement(null);
      setRequirementForm({
        control_id: '',
        title: '',
        description: '',
        category: '',
        priority: 'medium'
      });
    } catch (err) {
      console.error('Error updating requirement:', err);
      setError('Failed to update requirement');
    }
  };

  const handleDeleteRequirement = async (requirementId: string) => {
    if (!confirm('Are you sure you want to delete this requirement?')) return;
    
    try {
      await adminService.deleteRequirement(requirementId);
      setRequirements(prev => prev.filter(req => req.id !== requirementId));
    } catch (err) {
      console.error('Error deleting requirement:', err);
      setError('Failed to delete requirement');
    }
  };

  const startEditingRequirement = (requirement: Requirement) => {
    setEditingRequirement(requirement);
    setRequirementForm({
      control_id: requirement.control_id,
      title: requirement.title,
      description: requirement.description,
      category: requirement.category || '',
      priority: requirement.priority
    });
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !standard) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Standard not found'}</p>
          <Button onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-600/90"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
          
          {/* Content */}
          <div className="relative flex items-center justify-between text-white">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Button variant="secondary" onClick={() => navigate('/admin')} className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Button>
                <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">{standard.name}</h1>
                  <p className="text-blue-100 text-lg">
                    Version {standard.version} • {standard.type} • {requirements.length} requirements
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status Indicator */}
              <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-sm text-blue-100">Standard Active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-sm text-blue-100">Requirements Loaded</span>
                  </div>
                </div>
              </div>
              
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
                <FileText className="w-4 h-4 mr-2" />
                {standard.type.toUpperCase()}
              </Badge>
              
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                Active Standard
              </Badge>
            </div>
          </div>
        </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requirements">Requirements ({requirements.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Standard Information</CardTitle>
                  <CardDescription>Basic details about this compliance standard</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditingStandard(!isEditingStandard)}
                >
                  {isEditingStandard ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                  {isEditingStandard ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingStandard ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={standardForm.name}
                      onChange={(e) => setStandardForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={standardForm.version}
                      onChange={(e) => setStandardForm(prev => ({ ...prev, version: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={standardForm.type} onValueChange={(value) => setStandardForm(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="framework">Framework</SelectItem>
                        <SelectItem value="regulation">Regulation</SelectItem>
                        <SelectItem value="policy">Policy</SelectItem>
                        <SelectItem value="guideline">Guideline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="publication_date">Publication Date</Label>
                    <Input
                      id="publication_date"
                      type="date"
                      value={standardForm.publication_date}
                      onChange={(e) => setStandardForm(prev => ({ ...prev, publication_date: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={standardForm.description}
                      onChange={(e) => setStandardForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="official_url">Official URL</Label>
                    <Input
                      id="official_url"
                      type="url"
                      value={standardForm.official_url}
                      onChange={(e) => setStandardForm(prev => ({ ...prev, official_url: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2 flex space-x-2">
                    <Button onClick={handleSaveStandard}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditingStandard(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                    <p className="text-sm">{standard.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Version</Label>
                    <p className="text-sm">{standard.version}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                    <p className="text-sm capitalize">{standard.type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Publication Date</Label>
                    <p className="text-sm">{standard.publication_date || 'Not specified'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <p className="text-sm">{standard.description || 'No description available'}</p>
                  </div>
                  {standard.official_url && (
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-muted-foreground">Official URL</Label>
                      <p className="text-sm">
                        <a href={standard.official_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {standard.official_url}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Requirements</h2>
              <p className="text-muted-foreground">Manage compliance requirements for this standard</p>
            </div>
            <Dialog open={isCreatingRequirement} onOpenChange={setIsCreatingRequirement}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Requirement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Requirement</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="control_id">Control ID</Label>
                    <Input
                      id="control_id"
                      placeholder="e.g., 1.1, A.5.1.1"
                      value={requirementForm.control_id}
                      onChange={(e) => setRequirementForm(prev => ({ ...prev, control_id: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Requirement title"
                      value={requirementForm.title}
                      onChange={(e) => setRequirementForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Detailed requirement description"
                      value={requirementForm.description}
                      onChange={(e) => setRequirementForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        placeholder="e.g., Access Control"
                        value={requirementForm.category}
                        onChange={(e) => setRequirementForm(prev => ({ ...prev, category: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={requirementForm.priority} onValueChange={(value) => setRequirementForm(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleCreateRequirement}>
                      Create Requirement
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreatingRequirement(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {requirements.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Requirements</h3>
                <p className="text-muted-foreground mb-4">
                  This standard doesn't have any requirements yet.
                </p>
                <Button onClick={() => setIsCreatingRequirement(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Requirement
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {requirements.map((requirement) => (
                <Card key={requirement.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {requirement.control_id} - {requirement.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          {requirement.category && (
                            <Badge variant="outline">{requirement.category}</Badge>
                          )}
                          <Badge variant={getPriorityBadgeVariant(requirement.priority)}>
                            {requirement.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => startEditingRequirement(requirement)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteRequirement(requirement.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {requirement.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Edit Requirement Dialog */}
          <Dialog open={!!editingRequirement} onOpenChange={() => setEditingRequirement(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Requirement</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit_control_id">Control ID</Label>
                  <Input
                    id="edit_control_id"
                    value={requirementForm.control_id}
                    onChange={(e) => setRequirementForm(prev => ({ ...prev, control_id: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit_title">Title</Label>
                  <Input
                    id="edit_title"
                    value={requirementForm.title}
                    onChange={(e) => setRequirementForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit_description">Description</Label>
                  <Textarea
                    id="edit_description"
                    value={requirementForm.description}
                    onChange={(e) => setRequirementForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="edit_category">Category</Label>
                    <Input
                      id="edit_category"
                      value={requirementForm.category}
                      onChange={(e) => setRequirementForm(prev => ({ ...prev, category: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_priority">Priority</Label>
                    <Select value={requirementForm.priority} onValueChange={(value) => setRequirementForm(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleUpdateRequirement}>
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditingRequirement(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Standard Analytics
              </CardTitle>
              <CardDescription>Usage and compliance metrics for this standard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">{requirements.length}</div>
                  <div className="text-sm text-muted-foreground">Total Requirements</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Organizations Using</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">0%</div>
                  <div className="text-sm text-muted-foreground">Avg Compliance</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Standard Settings
              </CardTitle>
              <CardDescription>Advanced configuration for this standard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Active Status</h4>
                    <p className="text-sm text-muted-foreground">Whether this standard is available for use</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Auto-assign to new organizations</h4>
                    <p className="text-sm text-muted-foreground">Automatically include this standard for new customers</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Export Standard</h4>
                    <p className="text-sm text-muted-foreground">Download this standard and its requirements</p>
                  </div>
                  <Button variant="outline" size="sm">Export</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};