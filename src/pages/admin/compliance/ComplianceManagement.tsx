import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, ChevronDown, ChevronRight, RefreshCw, Database, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ConfirmDialog, useConfirmDialog } from '@/components/ui/confirm-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { complianceUnificationService } from '@/services/compliance/ComplianceUnificationService';

interface UnifiedCategory {
  id: string;
  name: string;
  description: string;
  sort_order: number;
  icon?: string;
  is_active: boolean;
  requirements?: UnifiedRequirement[];
}

interface UnifiedRequirement {
  id: string;
  category_id: string;
  title: string;
  description: string;
  sub_requirements: string[];
  sort_order: number;
  is_active: boolean;
}

interface RequirementMapping {
  id: string;
  unified_requirement_id: string;
  requirement_id: string;
  mapping_strength: 'exact' | 'strong' | 'partial' | 'related';
  notes?: string;
}

export default function ComplianceManagement() {
  const navigate = useNavigate();
  const { confirm, dialogProps } = useConfirmDialog();
  const [categories, setCategories] = useState<UnifiedCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<UnifiedCategory | null>(null);
  const [editingRequirement, setEditingRequirement] = useState<UnifiedRequirement | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showRequirementDialog, setShowRequirementDialog] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Form states for category
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '',
    sort_order: 0
  });

  // Form states for requirement
  const [requirementForm, setRequirementForm] = useState({
    title: '',
    description: '',
    sub_requirements: [''],
    sort_order: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('unified_compliance_categories')
        .select(`
          *,
          requirements:unified_requirements(*)
        `)
        .order('sort_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load compliance categories',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('unified_compliance_categories')
          .update({
            name: categoryForm.name,
            description: categoryForm.description,
            icon: categoryForm.icon,
            sort_order: categoryForm.sort_order,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Category updated successfully'
        });
      } else {
        // Create new category
        const { error } = await supabase
          .from('unified_compliance_categories')
          .insert({
            name: categoryForm.name,
            description: categoryForm.description,
            icon: categoryForm.icon,
            sort_order: categoryForm.sort_order,
            is_active: true
          });

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Category created successfully'
        });
      }

      setShowCategoryDialog(false);
      fetchCategories();
      resetCategoryForm();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: 'Error',
        description: 'Failed to save category',
        variant: 'destructive'
      });
    }
  };

  const handleSaveRequirement = async () => {
    try {
      if (editingRequirement) {
        // Update existing requirement
        const { error } = await supabase
          .from('unified_requirements')
          .update({
            title: requirementForm.title,
            description: requirementForm.description,
            sub_requirements: requirementForm.sub_requirements.filter(r => r.trim() !== ''),
            sort_order: requirementForm.sort_order,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingRequirement.id);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Requirement updated successfully'
        });
      } else {
        // Create new requirement
        const { error } = await supabase
          .from('unified_requirements')
          .insert({
            category_id: selectedCategoryId,
            title: requirementForm.title,
            description: requirementForm.description,
            sub_requirements: requirementForm.sub_requirements.filter(r => r.trim() !== ''),
            sort_order: requirementForm.sort_order,
            is_active: true
          });

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Requirement created successfully'
        });
      }

      setShowRequirementDialog(false);
      fetchCategories();
      resetRequirementForm();
    } catch (error) {
      console.error('Error saving requirement:', error);
      toast({
        title: 'Error',
        description: 'Failed to save requirement',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    confirm({
      title: 'Delete Category?',
      description: 'Are you sure you want to delete this category? This will also delete all its requirements.',
      variant: 'destructive',
      confirmText: 'Delete Category',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('unified_compliance_categories')
            .delete()
            .eq('id', categoryId);

          if (error) throw error;
          toast({
            title: 'Success',
            description: 'Category deleted successfully'
          });
          fetchCategories();
        } catch (error) {
          console.error('Error deleting category:', error);
          toast({
            title: 'Error',
            description: 'Failed to delete category',
            variant: 'destructive'
          });
        }
      }
    });
  };

  const handleDeleteRequirement = async (requirementId: string) => {
    confirm({
      title: 'Delete Requirement?',
      description: 'Are you sure you want to delete this requirement? This action cannot be undone.',
      variant: 'destructive',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('unified_requirements')
            .delete()
            .eq('id', requirementId);

          if (error) throw error;
          toast({
            title: 'Success',
            description: 'Requirement deleted successfully'
          });
          fetchCategories();
        } catch (error) {
          console.error('Error deleting requirement:', error);
          toast({
            title: 'Error',
            description: 'Failed to delete requirement',
            variant: 'destructive'
          });
        }
      }
    });
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      icon: '',
      sort_order: 0
    });
    setEditingCategory(null);
  };

  const resetRequirementForm = () => {
    setRequirementForm({
      title: '',
      description: '',
      sub_requirements: [''],
      sort_order: 0
    });
    setEditingRequirement(null);
    setSelectedCategoryId(null);
  };

  const editCategory = (category: UnifiedCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      sort_order: category.sort_order
    });
    setShowCategoryDialog(true);
  };

  const editRequirement = (requirement: UnifiedRequirement) => {
    setEditingRequirement(requirement);
    setRequirementForm({
      title: requirement.title,
      description: requirement.description,
      sub_requirements: requirement.sub_requirements.length > 0 ? requirement.sub_requirements : [''],
      sort_order: requirement.sort_order
    });
    setShowRequirementDialog(true);
  };

  const addSubRequirement = () => {
    setRequirementForm(prev => ({
      ...prev,
      sub_requirements: [...prev.sub_requirements, '']
    }));
  };

  const removeSubRequirement = (index: number) => {
    setRequirementForm(prev => ({
      ...prev,
      sub_requirements: prev.sub_requirements.filter((_, i) => i !== index)
    }));
  };

  const updateSubRequirement = (index: number, value: string) => {
    setRequirementForm(prev => ({
      ...prev,
      sub_requirements: prev.sub_requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const refreshCache = async () => {
    try {
      // Clear the cache by calling the service method which will trigger a fresh fetch
      await complianceUnificationService.getUnifiedCategories();
      toast({
        title: 'Success',
        description: 'Cache refreshed successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh cache',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Compliance Management</h1>
            <p className="text-sm text-gray-500">Manage unified compliance categories and requirements</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshCache}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Cache
          </Button>
          <Button
            onClick={() => {
              resetCategoryForm();
              setShowCategoryDialog(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Categories Count */}
      <div className="mb-4">
        <Badge variant="secondary" className="text-sm">
          Showing {categories.length} of 22 categories
        </Badge>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {categories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <CardHeader className="cursor-pointer" onClick={() => toggleCategory(category.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span>{category.sort_order}. {category.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {category.requirements?.length || 0} requirements
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editCategory(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {expandedCategories.has(category.id) && (
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-end mb-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCategoryId(category.id);
                          resetRequirementForm();
                          setShowRequirementDialog(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Requirement
                      </Button>
                    </div>
                    
                    {category.requirements?.map((requirement) => (
                      <div key={requirement.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{requirement.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {requirement.description}
                            </p>
                            {requirement.sub_requirements.length > 0 && (
                              <div className="mt-3 space-y-1">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Sub-requirements:
                                </p>
                                <ul className="list-disc list-inside space-y-1">
                                  {requirement.sub_requirements.map((subReq, index) => (
                                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                                      {subReq}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => editRequirement(requirement)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRequirement(requirement.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="e.g., Governance & Leadership"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Brief description of the category"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Icon (optional)</label>
              <Input
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                placeholder="e.g., Shield"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Sort Order</label>
              <Input
                type="number"
                value={categoryForm.sort_order}
                onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory}>
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Requirement Dialog */}
      <Dialog open={showRequirementDialog} onOpenChange={setShowRequirementDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRequirement ? 'Edit Requirement' : 'Add Requirement'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={requirementForm.title}
                onChange={(e) => setRequirementForm({ ...requirementForm, title: e.target.value })}
                placeholder="e.g., Information Security Governance"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={requirementForm.description}
                onChange={(e) => setRequirementForm({ ...requirementForm, description: e.target.value })}
                placeholder="Detailed description of the requirement"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Sub-requirements</label>
              <div className="space-y-2">
                {requirementForm.sub_requirements.map((subReq, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Textarea
                      value={subReq}
                      onChange={(e) => updateSubRequirement(index, e.target.value)}
                      placeholder={`Sub-requirement ${index + 1}`}
                      rows={2}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubRequirement(index)}
                      disabled={requirementForm.sub_requirements.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSubRequirement}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Sub-requirement
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Sort Order</label>
              <Input
                type="number"
                value={requirementForm.sort_order}
                onChange={(e) => setRequirementForm({ ...requirementForm, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequirementDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRequirement}>
              {editingRequirement ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}