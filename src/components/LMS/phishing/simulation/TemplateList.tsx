import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search,
  Plus,
  Edit,
  Copy,
  Trash2,
  FileCheck,
  Clock
} from 'lucide-react';
import { PhishingTemplate } from '../types';

interface TemplateListProps {
  templates: PhishingTemplate[];
  searchQuery: string;
  categoryFilter: string;
  uniqueCategories: string[];
  onSearchChange: (query: string) => void;
  onCategoryFilterChange: (category: string) => void;
  onCreateNew: () => void;
  onEdit: (template: PhishingTemplate) => void;
  onDuplicate: (template: PhishingTemplate) => void;
  onDelete: (templateId: string) => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  searchQuery,
  categoryFilter,
  uniqueCategories,
  onSearchChange,
  onCategoryFilterChange,
  onCreateNew,
  onEdit,
  onDuplicate,
  onDelete
}) => {
  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="relative w-64 mr-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search templates" 
              className="pl-10 rounded-xl"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Select 
            value={categoryFilter}
            onValueChange={onCategoryFilterChange}
          >
            <SelectTrigger className="w-[180px] rounded-xl">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories
                .filter(category => category !== 'all')
                .map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={onCreateNew}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="overflow-hidden rounded-xl border-0 shadow-lg hover:shadow-xl transition-all">
            <div className="p-6 border-b relative">
              <div className="flex justify-between items-start">
                <div>
                  <Badge 
                    className={`mb-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      template.difficultyLevel === 'Easy' ? 'bg-green-100 text-green-800' :
                      template.difficultyLevel === 'Medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {template.difficultyLevel}
                  </Badge>
                  <h2 className="text-lg font-semibold">{template.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {template.subject}
                  </p>
                </div>
                <Badge variant="outline" className="ml-2">{template.category}</Badge>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-gray-50 to-white">
              <div className="flex items-center justify-between text-sm mb-4">
                <div className="flex items-center">
                  <FileCheck className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>Success Rate: {template.successRate || 0}%</span>
                </div>
                {template.lastUsed && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>Last Used: {template.lastUsed}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onEdit(template)}
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onDuplicate(template)}
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Duplicate
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(template.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {searchQuery || categoryFilter !== 'all' ? 
              'No templates match your search criteria.' : 
              'No templates available.'
            }
          </div>
          {(!searchQuery && categoryFilter === 'all') && (
            <Button onClick={onCreateNew} className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Template
            </Button>
          )}
        </div>
      )}
    </div>
  );
};