import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  RefreshCw,
  Search,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/utils/toast';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

interface CategoriesManagementProps {
  loading: boolean;
}

export const CategoriesManagement: React.FC<CategoriesManagementProps> = ({
  loading: parentLoading
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Shield'
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading categories from unified_compliance_categories...');
      const { data, error } = await supabase
        .from('unified_compliance_categories')
        .select('*')
        .order('sort_order');

      if (error) {
        console.error('❌ Error loading categories:', error);
        toast.error('Failed to load categories');
        return;
      }

      console.log('✅ Loaded categories:', data?.length || 0);

      // Check for gaps in sort_order and fix if needed
      if (data && data.length > 0) {
        const sortOrders = data.map(c => c.sort_order).sort((a, b) => a - b);
        let hasGaps = false;
        for (let i = 0; i < sortOrders.length; i++) {
          if (sortOrders[i] !== i + 1) {
            hasGaps = true;
            break;
          }
        }

        if (hasGaps) {
          console.log('⚠️ Found gaps in sort_order, fixing...');
          await fixSortOrderGaps(data);
          return; // Reload after fixing
        }
      }

      setCategories(data || []);
    } catch (error) {
      console.error('❌ Exception loading categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fixSortOrderGaps = async (categories: Category[]) => {
    try {
      // Renumber all categories to have consecutive sort_order
      const updates = categories.map((cat, index) =>
        supabase
          .from('unified_compliance_categories')
          .update({ sort_order: index + 1 })
          .eq('id', cat.id)
      );

      await Promise.all(updates);
      console.log('✅ Fixed sort_order gaps');
      toast.success('Category numbering fixed');

      // Reload categories
      loadCategories();
    } catch (error) {
      console.error('❌ Error fixing sort_order gaps:', error);
      toast.error('Failed to fix category numbering');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', icon: 'Shield' });
    setIsDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        // Update existing
        const { error } = await supabase
          .from('unified_compliance_categories')
          .update({
            name: formData.name,
            description: formData.description,
            icon: formData.icon,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
        toast.success('Category updated successfully');
      } else {
        // Create new
        const maxOrder = Math.max(...categories.map(c => c.sort_order), 0);
        const { error } = await supabase
          .from('unified_compliance_categories')
          .insert({
            name: formData.name,
            description: formData.description,
            icon: formData.icon,
            sort_order: maxOrder + 1
          });

        if (error) throw error;
        toast.success('Category created successfully');
      }

      setIsDialogOpen(false);
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('unified_compliance_categories')
        .delete()
        .eq('id', category.id);

      if (error) throw error;
      toast.success('Category deleted successfully');
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleMoveUp = async (category: Category, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const index = categories.findIndex(c => c.id === category.id);
    if (index <= 0) return;

    const prevCategory = categories[index - 1];

    try {
      await Promise.all([
        supabase
          .from('unified_compliance_categories')
          .update({ sort_order: prevCategory.sort_order })
          .eq('id', category.id),
        supabase
          .from('unified_compliance_categories')
          .update({ sort_order: category.sort_order })
          .eq('id', prevCategory.id)
      ]);

      loadCategories();
    } catch (error) {
      console.error('Error moving category:', error);
      toast.error('Failed to reorder category');
    }
  };

  const handleMoveDown = async (category: Category, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const index = categories.findIndex(c => c.id === category.id);
    if (index >= categories.length - 1) return;

    const nextCategory = categories[index + 1];

    try {
      await Promise.all([
        supabase
          .from('unified_compliance_categories')
          .update({ sort_order: nextCategory.sort_order })
          .eq('id', category.id),
        supabase
          .from('unified_compliance_categories')
          .update({ sort_order: category.sort_order })
          .eq('id', nextCategory.id)
      ]);

      loadCategories();
    } catch (error) {
      console.error('Error moving category:', error);
      toast.error('Failed to reorder category');
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || parentLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Categories Management
            </h2>
            <p className="text-muted-foreground mt-2">Manage compliance categories and their organization</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Categories Management
          </h2>
          <p className="text-muted-foreground mt-2">Manage compliance categories and their organization</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCategories}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fixSortOrderGaps(categories)}
            disabled={loading || categories.length === 0}
            title="Fix any gaps in category numbering"
          >
            Fix Numbering
          </Button>
          <Button onClick={handleCreate} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredCategories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">Categories synchronized</div>
          </CardContent>
        </Card>
      </div>

      {/* Categories List */}
      <div className="space-y-2">
        {filteredCategories.map((category, index) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex flex-col space-y-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleMoveUp(category, e)}
                      disabled={index === 0}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleMoveDown(category, e)}
                      disabled={index === filteredCategories.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    #{category.sort_order}
                  </Badge>
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(category)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update category details' : 'Add a new compliance category'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Risk Management"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this category..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="icon">Icon Name</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="e.g., Shield, Lock, Target"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
